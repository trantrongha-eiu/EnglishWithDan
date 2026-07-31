// Generic one-off content seed — inserts the TEST doc below as a normal
// ListeningTest so it shows up in admin's Đề Listening list exactly like
// every other hand-entered test (Cam 20, Actual Tests, ...): editable name,
// editable questions, and ready for the admin to attach the full-test audio
// and any map images via the existing admin UI (the schema only supports
// one audio file per test, not per-part — same as all existing tests, so
// audio is left blank here for admin to upload).
//
// IMPORTANT — always seeds BOTH the bundled test AND the 4 standalone
// sections, do not remove the section-seeding half below. The admin's real
// workflow is: (1) enter each Part as its own ListeningSection with its own
// audio under "Bài lẻ Listening", (2) use "Tạo Full Test" to copy 4 chosen
// sections into one ListeningTest, (3) upload one more combined audio to
// that ListeningTest. AssembleModal (admin-src/src/pages/ListeningSections.jsx)
// confirms the two collections are independent copies with NO reference
// back from ListeningTest to the sections it came from. An earlier version
// of this script only inserted the ListeningTest, silently skipping step
// (1) — the admin had no way to upload per-part audio because the sections
// never existed as their own documents (see git history: fix commit
// "backfill standalone ListeningSection docs for seeded tests" had to
// retroactively create 92 of these). Keep both halves seeding together so
// that mistake can't happen again.
//
// Reused per test: edit TEST below to the next test's content, then run
// `node scripts/seedListeningTest.js` from backend/. Safe to re-run — skips
// whichever half (test / each section) already exists by name. Each past
// run's content is preserved in git history (see log for prior seeds under
// this filename).

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');

// Section titles are often left as the generic "Part N" placeholder when the
// source text has no distinct topic name — give those a unique, searchable
// title in the standalone-section library instead of many rows all
// literally called "Part 1". Keep in sync with
// scripts/seedListeningSectionsFromTests.js's identical helper.
function sectionTitle(testName, sec) {
  const t = (sec.title || '').trim();
  return /^Part \d$/.test(t) ? `${testName} – Part ${sec.partNumber}` : t;
}

const TEST = {
  name: 'Cam 21 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 21',
  audioUrl: '',
  audioFileName: '',
  audioDuration: 0,
  isActive: true,
  sections: [
    // ── PART 1 (Q1–10) ──────────────────────────────────────────────
    {
      partNumber: 1,
      title: 'Part 1',
      description: '',
      transcript: '',
      questionRange: { start: 1, end: 10 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 1–10  Complete the form below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Survey about shopping in Broadbeach',
            lines: [
              'Name: Martyn __Q1__.',
              'Today\'s journey to Broadbeach town centre: used his __Q2__.',
              'Purpose of today\'s trip:',
              '○   has visited the __Q3__.',
              '○   looking for a new __Q4__.',
              '○   collecting __Q5__ (after repair)',
              'Preferred day for shopping: __Q6__.',
              'Opinions about shopping in the town centre',
              'Finds the service in shops is excellent',
              'Thinks there are too many places selling __Q7__.',
              'Would like more places to buy __Q8__.',
              'Opinions about new out-of-town Shopping Centre',
              'Likes the __Q9__ best',
              'Believes the __Q10__ is unnecessary',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Leigh' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'motorbike' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'hairdresser' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'suit' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'laptop' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'Monday' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'coffee' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'books' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'plants' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'cinema' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Part 2',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11 and 12  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 11, type: 'multi-answer-group',
              questionText: 'In which TWO areas of the business exhibition did James Craig promote his company last year?',
              options: [
                'A   the Digital Marketing Centre',
                'B   the TalkCon Zone',
                'C   the Breakout area',
                'D   the Business Village',
                'E   the Business Connections Zone',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   the Digital Marketing Centre',
                'B   the TalkCon Zone',
                'C   the Breakout area',
                'D   the Business Village',
                'E   the Business Connections Zone',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 13 and 14  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 13, type: 'multi-answer-group',
              questionText: 'Which TWO facts are given about discounts on popular brands available to exhibitors?',
              options: [
                'A   They are available to all members of exhibiting companies.',
                'B   They can be used for both food and clothing.',
                'C   They only apply if people spend at least £400.',
                'D   They can be used by family members.',
                'E   The percentage saved is always the same.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   They are available to all members of exhibiting companies.',
                'B   They can be used for both food and clothing.',
                'C   They only apply if people spend at least £400.',
                'D   They can be used by family members.',
                'E   The percentage saved is always the same.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  Which topic will each of the following speakers focus on? Choose SIX answers from the box and write the correct letter, A-G, next to Questions 15–20.',
          matchingOptionsTitle: 'Topics',
          matchingOptions: [
            'Supporting job seekers',
            'Dealing with personal problems',
            'Effects of an unexpectedly rapid expansion',
            'A global range of business experiences',
            'Coping with financial set-backs',
            'Developing a company in response to changing markets',
            'Combining business success with contributions to charities',
          ],
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'Jim Clowrie', correctAnswer: 'C' },
            { questionNumber: 16, type: 'matching-info', questionText: 'David France', correctAnswer: 'G' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Oliver Stanton', correctAnswer: 'D' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Francesca Heptonstall', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Salman Khan', correctAnswer: 'F' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Annie Craven', correctAnswer: 'B' },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Presentation on houses of the future',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21–23  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   Which aspect of their presentation are Mia and Leo both concerned about?',
              options: [
                'A   meeting the deadline',
                'B   finding suitable examples',
                'C   including original ideas',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   The students decide to focus their assignment on housing for',
              options: [
                'A   family groups.',
                'B   old people.',
                'C   single people.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   The students agree that demand for accommodation in urban areas should be met by',
              options: [
                'A   repurposing offices and factories.',
                'B   constructing tall buildings.',
                'C   developing creative ideas for smaller homes.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 24–30  What opinion is given about each of the following developments? Choose SEVEN answers from the box and write the correct letter, A-I, next to Questions 24–30.',
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'This could cause unnecessary anxiety.',
            'This would be especially beneficial for city residents.',
            'This would be challenging for young people.',
            'This would have environmental benefits.',
            'This could encourage creativity.',
            'This could lead to social problems.',
            'This could enable retired people to share a project.',
            'This would help some people but cause problems for others.',
            'This would suit both existing and new members of a household.',
          ],
          questions: [
            { questionNumber: 24, type: 'matching-info', questionText: 'use of roof space for gardens', correctAnswer: 'B' },
            { questionNumber: 25, type: 'matching-info', questionText: 'shared working spaces', correctAnswer: 'E' },
            { questionNumber: 26, type: 'matching-info', questionText: 'moveable internal walls', correctAnswer: 'I' },
            { questionNumber: 27, type: 'matching-info', questionText: 'smart mirrors in bathrooms', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'bike sheds with charging points', correctAnswer: 'D' },
            { questionNumber: 29, type: 'matching-info', questionText: 'restriction of cars to certain areas', correctAnswer: 'H' },
            { questionNumber: 30, type: 'matching-info', questionText: 'communal vegetable plots', correctAnswer: 'G' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Music therapy for surgical patients',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Music therapy for surgical patients',
            lines: [
              'Background',
              '●   Surgery impacts patients because they may experience discomfort or unwelcome changes to their __Q31__.',
              '●   Current post-surgical strategies focus mainly on pain relief.',
              'Recent research',
              '●   A study reviewed data from about 100 __Q32__ and found that listening to music',
              "○   improved hospital patients' sense of wellbeing.",
              '○   reduced the length of their stay.',
              '●   The patients in the study all listened to music with a __Q33__ effect.',
              '●   The music was mostly played through music __Q34__.',
              '●   Patients reported an absence or low levels of __Q35__.',
              "●   Medical records confirmed that patients who were played music in hospital needed less __Q36__ than those who weren't played music.",
              '●   The best results were achieved when patients were played music while they were __Q37__.',
              '●   The study concluded that playing music was effective because it served as a __Q38__.',
              '●   The researchers recommend playing either music or sounds from __Q39__ to all surgical patients.',
              '●   A future study will investigate the best __Q40__ for the music.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'routine' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'trials' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'calming' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'pillows' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'anxiety' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'medication' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'awake' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'distraction' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'nature' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'volume' },
          ],
        },
      ],
    },
  ],
};

async function runSeed() {
  const existing = await ListeningTest.findOne({ name: TEST.name }).lean();
  let doc;
  if (existing) {
    console.log(`[SeedListeningTest] "${TEST.name}" already exists (_id=${existing._id}) – skip`);
    doc = existing;
  } else {
    doc = await ListeningTest.create(TEST);
    console.log(`[SeedListeningTest] Inserted "${TEST.name}" (_id=${doc._id}, ${doc.totalQuestions} questions)`);
  }

  // Always also ensure the 4 standalone ListeningSection docs exist — see
  // the IMPORTANT note at the top of this file for why.
  let sectionsInserted = 0, sectionsSkipped = 0;
  for (const sec of TEST.sections) {
    const title = sectionTitle(TEST.name, sec);
    const existingSection = await ListeningSection.findOne({ title, partNumber: sec.partNumber }).lean();
    if (existingSection) {
      console.log(`[SeedListeningTest] Section "${title}" (Part ${sec.partNumber}) already exists (_id=${existingSection._id}) – skip`);
      sectionsSkipped++;
      continue;
    }
    const sectionDoc = await ListeningSection.create({
      partNumber: sec.partNumber,
      title,
      description: sec.description || '',
      audioUrl: '',
      audioFileName: '',
      audioDuration: 0,
      transcript: sec.transcript || '',
      questionRange: sec.questionRange,
      questionGroups: sec.questionGroups,
      isActive: true,
      isActualTest: true,
    });
    console.log(`[SeedListeningTest] Inserted section "${title}" (Part ${sec.partNumber}, _id=${sectionDoc._id})`);
    sectionsInserted++;
  }
  console.log(`[SeedListeningTest] Sections: inserted=${sectionsInserted} skipped=${sectionsSkipped}`);

  return doc;
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningTest] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TEST, sectionTitle };
