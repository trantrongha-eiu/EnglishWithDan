'use strict';

// Regression coverage for a real student-reported bug: "Bài lẻ" (practice)
// Reading/Listening reviews have no content snapshot (unlike full-test
// TestAttempt/ListeningAttempt, which carry passagesSnapshot/sectionsSnapshot
// — see memory/reading_listening_review_snapshot.md). If an admin permanently
// deletes a passage/section AFTER a student practiced with it and got
// something wrong, the resulting mandatory AttemptReview can never be shown
// again — getPracticeHistoryDetail's live Passage/ListeningSection lookup
// comes back null, and the previous behavior (success:true, passage:null)
// left the student stuck: the pending-review popup/banner always points at
// the single oldest pending item, so "Tiếp tục Review" retried the exact
// same unloadable attempt forever (repeated "Không tải được bài" toasts,
// eventually hard-blocking new practice once MAX_PENDING_REVIEWS is hit).
//
// Fix: the history-detail endpoint now auto-resolves the orphaned pending
// review (status:'unavailable', excluded from getPendingReviews the same
// way 'bypassed'/'completed' are) and returns 410 CONTENT_REMOVED instead
// of a silent success:true/passage:null.
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage, createListeningSection, createReadingPracticeAttempt } = require('../factories/contentFactory');
const Passage = require('../../models/Passage');
const ListeningSection = require('../../models/ListeningSection');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const AttemptReview = require('../../models/AttemptReview');
const reviewService = require('../../services/reviewService');

const bearer = (u) => `Bearer ${signTokenFor(u)}`;

describe('Reading practice review — passage permanently deleted after the attempt', () => {
  async function seed(user) {
    const passage = await createPassage();
    const attempt = await createReadingPracticeAttempt({
      userId: user._id, passageId: passage._id,
      answers: [{ questionNumber: 1, userAnswer: 'x', correctAnswer: 'y', isCorrect: false }],
      totalQuestions: 1, correctCount: 0, wrongCount: 1,
    });
    await AttemptReview.create({
      userId: user._id, attemptType: 'reading-practice', attemptId: attempt._id, status: 'pending',
      mistakes: [{ questionNumber: 1, userAnswer: 'x', correctAnswer: 'y' }],
    });
    await Passage.findByIdAndDelete(passage._id);
    return { attempt };
  }

  test('HTTP: returns 410 CONTENT_REMOVED instead of a silent success:true/passage:null', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);

    const r = await request(app)
      .get(`/api/reading/practice/history/${attempt._id}`)
      .set('Authorization', bearer(user));

    expect(r.status).toBe(410);
    expect(r.body.success).toBe(false);
    expect(r.body.code).toBe('CONTENT_REMOVED');
  });

  test('the pending AttemptReview is auto-resolved and stops blocking the student', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);

    // Two more ordinary pending reviews so this student is at the
    // MAX_PENDING_REVIEWS=3 block threshold before touching the orphaned one.
    await AttemptReview.create({
      userId: user._id, attemptType: 'reading-practice', attemptId: new mongoose.Types.ObjectId(), status: 'pending',
      mistakes: [{ questionNumber: 1, userAnswer: 'a', correctAnswer: 'b' }],
    });
    await AttemptReview.create({
      userId: user._id, attemptType: 'reading-practice', attemptId: new mongoose.Types.ObjectId(), status: 'pending',
      mistakes: [{ questionNumber: 1, userAnswer: 'a', correctAnswer: 'b' }],
    });

    const before = await reviewService.getPendingReviews(user._id, 'reading');
    expect(before.count).toBe(3);

    await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));

    const review = await AttemptReview.findOne({ attemptType: 'reading-practice', attemptId: attempt._id }).lean();
    expect(review.status).toBe('unavailable');

    // Completing/clearing ONE of the two remaining real reviews should now
    // be enough to unblock — the orphaned one no longer silently occupies a
    // slot forever.
    const after = await reviewService.getPendingReviews(user._id, 'reading');
    expect(after.count).toBe(2);
  });

  test('re-fetching an already-resolved orphaned review is a harmless no-op (still 410)', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);
    await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));

    const r2 = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(r2.status).toBe(410);
    expect(r2.body.code).toBe('CONTENT_REMOVED');
  });
});

describe('Listening practice review — section permanently deleted after the attempt', () => {
  async function seed(user) {
    const section = await createListeningSection();
    const attempt = await ListeningPracticeAttempt.create({
      userId: user._id, sectionId: section._id, sectionTitle: 'S', partNumber: 1,
      answers: [{ questionNumber: 1, userAnswer: 'x', correctAnswer: 'y', isCorrect: false }],
      totalQuestions: 1, correctCount: 0, wrongCount: 1, submittedAt: new Date(),
    });
    await AttemptReview.create({
      userId: user._id, attemptType: 'listening-practice', attemptId: attempt._id, status: 'pending',
      mistakes: [{ questionNumber: 1, userAnswer: 'x', correctAnswer: 'y' }],
    });
    await ListeningSection.findByIdAndDelete(section._id);
    return { attempt };
  }

  test('HTTP: returns 410 CONTENT_REMOVED, and the pending review is auto-resolved', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);

    const r = await request(app)
      .get(`/api/listening/practice/history/${attempt._id}`)
      .set('Authorization', bearer(user));

    expect(r.status).toBe(410);
    expect(r.body.code).toBe('CONTENT_REMOVED');

    const review = await AttemptReview.findOne({ attemptType: 'listening-practice', attemptId: attempt._id }).lean();
    expect(review.status).toBe('unavailable');

    const pending = await reviewService.getPendingReviews(user._id, 'listening');
    expect(pending.count).toBe(0);
  });
});
