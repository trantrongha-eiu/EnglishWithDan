# Database

MongoDB Atlas, one database, 39 Mongoose models (`backend/models/*.js`) — close enough to the "~37" figure in [`docs/ARCHITECTURE.md` § Database architecture](ARCHITECTURE.md#database-architecture) that it isn't worth reconciling further; count them yourself with `ls backend/models | wc -l` if it matters for what you're doing. This doc is the per-collection companion to that section: read ARCHITECTURE.md first for the high-level shape, deployment, and the "no transactions anywhere" fact (referenced below, not re-derived).

Every model in this doc was read from source in full, and every "Common queries" block is copied from (or trivially adapted from) a real call site in `backend/services/*.js` or `backend/routes/**/*.js`, not invented. Relationships list both what a model references (`ref:` in its own schema) and what references it (found by grepping every other model for `ref: 'ThisModel'`).

Grouping matches ARCHITECTURE.md's Database architecture section exactly: **Identity → Content → Attempts → Vocabulary → Operations**.

## Patterns across the schema

- **`userId`/`studentId` naming is inconsistent, on purpose or not.** Most models that belong to a student use `userId` (`VocabBook`, `TestAttempt`, `DifficultWord`, `TuitionFee` uses `studentId`, `WritingPracticeAttempt` uses `studentId`, `Task2Draft` uses `userId`). There's no single convention — if you're writing a query or an aggregation that joins across attempt types, double-check the field name per model rather than assuming `userId` everywhere.
- **TTL auto-expiry is used for exactly two kinds of collection**: high-volume practice-drill attempts that don't need to be retained forever (`Task1Attempt` 30d, `Task2Attempt` 60d, `Task2TemplateAttempt` 30d, `WritingPracticeAttempt` 30d), and autosave drafts that are meaningless once stale (`WritingDraft` 30d from last save, `Task2Draft` 7d from last save). Notably, the higher-stakes attempt types — `TestAttempt` (reading), `ListeningAttempt`, `WritingAttempt`, `SpeakingAttempt`, `ReadingPracticeAttempt`, `ListeningPracticeAttempt` — have **no** TTL and are retained indefinitely (subject to manual admin deletion via `routes/admin/attempts.js`). That split looks deliberate: the ones without TTL are the ones shown back to the student as history/feedback and reviewed by teachers (writing/speaking grading in particular depends on them persisting), while the TTL'd ones are disposable drill exhaust.
- **Deleting a `User` doesn't cascade.** `DELETE /api/admin/users/:id` (`backend/routes/admin/users.js`) is a plain `User.findByIdAndDelete` — no corresponding cleanup of that user's `TestAttempt`/`WritingAttempt`/`VocabBook`/`TuitionFee`/`Message`/etc. documents. Consistent with ARCHITECTURE.md's "no transactions anywhere" — there's no multi-collection cleanup step at all, transactional or otherwise. In practice this means a deleted user leaves orphaned child documents with a `userId` that no longer resolves; nothing in the codebase queries for or reports on this, so it's silent.
- **`AccessKey` is genuinely orphaned** — confirmed here, not just asserted. `routes/admin/accessKeys.js` generates keys and lets teachers/admins list/deactivate/delete them, and the schema tracks `currentUses`/`maxUses`/`isValid`, but a full grep of `backend/` for `AccessKey` turns up only that one route file and the model itself — **no route anywhere validates a student-submitted key or increments `currentUses`**. The feature was built (generation + management UI) but redemption was never wired up. See `docs/MAINTENANCE.md` for the tracked-debt framing ARCHITECTURE.md points to.
- **`WPLesson` is effectively write-only.** `WPExercise.lessonId` refs it, and `services/writingPracticeService.js` and `scripts/seedWritingPractice.js` both create/upsert `WPLesson` docs as a side effect of importing exercises (dedup key: `topicKey`+`level`) — but a repo-wide grep for `lessonId` turns up only the write sites; nothing ever `.populate('lessonId')`s or otherwise reads a `WPLesson`'s own fields (`titleVi`, `lessonType`, `grammarFocus`, `difficulty`) back out. The collection accumulates real documents, they're just never read. Less clear-cut than `AccessKey` (there's no unused *feature* here, just unused *fields*), but worth knowing before assuming lesson metadata is used anywhere in what students see.
- **Content models are almost entirely unindexed beyond `{isActive}`-shaped compound indexes** (or nothing at all — see `WritingExam`, `WritingTask1`, `WritingTask2`, `SpeakingQuestion`, `SpeakingMaterial`, `WritingSample`, `WPLesson`, `Course`). This tracks with them being low-cardinality, admin-curated collections (dozens to low hundreds of documents) rather than something a missing index would meaningfully slow down — different from the attempt/user collections, where every index earns its keep against real per-request query volume (see the indexing pass called out in README's history, phase 3).
- **Soft-delete (`isActive: false`) and hard-delete (`findByIdAndDelete`) coexist per-model, not per-collection-type.** `Passage`/`ReadingTest` support both (deactivate via `isActive`, or a real admin hard-delete). Attempts are hard-deleted only. There's no single rule; check the specific route before assuming which one a "delete" button actually does.
- **`_id`-only singleton pattern**: `TuitionSettings` is the one model in the schema designed to have exactly one document (`_singleton: 'main'`, enforced via a unique index + a `getSingleton()` static that creates-if-missing). Nothing else in the schema follows this pattern.

---

## Identity

### User

**Purpose:** One document per person who can log into the platform — students, teachers, and admins share this single collection, distinguished by `role`.

**Key fields:**
- `username`, `email` — both `unique: true`, both required
- `password` — `select: false` at the schema level (defense-in-depth so an unguarded query can't leak the bcrypt hash even without a manual `.select('-password')`); empty string for social-only accounts
- `role` — enum `student`/`teacher`/`admin`, default `student`
- `plan`/`planExpiresAt`/`planStartedAt` — subscription state; `plan` is independent of `role` (see ARCHITECTURE.md's Authorization flow)
- `isBanned`/`banReason` — enforced at auth-middleware time even against a valid, unexpired JWT
- `authProvider`/`googleId`/`facebookId` — social login linkage (Facebook fields exist in the schema but Facebook OAuth isn't wired up in `config/passport.js` as of this phase — only Google is)
- `learningStreak`/`lastActivityDate`/`totalStudyMinutes` — gamification stats, updated by the `updateStreak()`/`resetIfStale()` schema methods (Vietnam-timezone-aware day boundaries)
- `resetOTP`/`resetOTPExpires`/`resetOTPAttempts` — password-reset OTP state, see ARCHITECTURE.md's Authentication flow
- `savedVocab` — embedded array (legacy path predating `VocabBook`; still present but the primary vocab feature is the separate `VocabBook`/`VocabUnit` models below)

**Relationships:** References nothing itself. Referenced by nearly every other model in the schema via `userId`/`studentId`/`fromId`/`toId`/`createdBy`/`reviewedBy` — it's the one collection everything else ultimately points back to.

**Indexes:**
- `{ role: 1, createdAt: -1 }` — admin "new this week"/role-filtered user list
- `{ lastSeen: 1 }` — online-users queries
- Implicit unique indexes on `username` and `email` from the schema-level `unique: true`

**Lifecycle:** Created by `authService.registerUser()`/`findOrCreateGoogleUser()` on signup/first OAuth login. Updated continuously — profile edits, plan changes on upgrade approval, ban/unban, streak/study-minute increments on activity, `lastSeen` on requests. Deleted via `DELETE /api/admin/users/:id` (admin-only, hard delete, **no cascade** — see "Patterns across the schema" above). No TTL.

**Common queries:**
```js
User.findOne({ email }).select('+password')                 // login
User.findByIdAndUpdate(userId, update, { new: true })
  .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts')
User.find({ role: { $in: ['student', 'teacher'] } }, 'username email firstName lastName')
  .sort('username').lean()                                   // tuition billing recipient list
```

---

## Content

Admin/teacher-authored, read by students. As a group these are the least-indexed collections in the schema (see "Patterns" above) — that's a size/access-pattern observation, not a gap that needs fixing.

### Passage

**Purpose:** One IELTS Reading passage (Passage 1/2/3), with its full text and question set. Three passages are randomly assembled into a `ReadingTest` session at attempt-start time.

**Key fields:** `category` (enum `passage1`/`passage2`/`passage3`), `content` (full passage text), `questionGroups` (nested question-group schema — table/note-form/matching-headings/summary-completion/etc., each holding its own `questions[]`), legacy flat `questions[]` kept for backward compatibility, `questionRange`, `difficulty`, `isActive`, `isActualTest` (flags a passage as a real past exam vs. practice-bank content).

**Relationships:** References nothing. Referenced by `TestAttempt.passagesUsed[]` and `ReadingPracticeAttempt.passageId`.

**Indexes:** `{ category: 1, isActive: 1 }`, `{ isActualTest: 1, isActive: 1 }`.

**Lifecycle:** Created/edited/soft-deactivated (`isActive`) or hard-deleted via `routes/admin/passages.js`. Read (never written) by `services/readingService.js` for both exam mode and standalone practice mode. No TTL.

**Common queries:**
```js
Passage.aggregate([{ $match: { category: 'passage1', isActive: true } }, { $sample: { size: 1 } }, safeProject])
Passage.find({ _id: { $in: attempt.passagesUsed } }).lean()
Passage.findOne({ _id: id, isActive: true }).lean()          // standalone practice
```

### ReadingTest

**Purpose:** Metadata shell for a full 3-passage Reading mock exam ("Orange Test 20" etc.) — it does not embed the passages themselves; they're chosen at random from `Passage` when a student starts the test.

**Key fields:** `name`, `seriesName`, `testNumber`, `isActive`.

**Relationships:** References nothing. Referenced by `TestAttempt.testId` and by `AccessKey.testId` (dynamically, via `refPath`, when `testType: 'reading'`).

**Indexes:** `{ isActive: 1, testNumber: -1 }`.

**Lifecycle:** CRUD via `routes/admin/passages.js` (shares the file with `Passage`); hard-deletable. No TTL.

**Common queries:**
```js
ReadingTest.find({ isActive: true }).sort({ testNumber: -1 }).lean()
ReadingTest.findById(testId)
```

### ListeningTest

**Purpose:** A full 4-part Listening mock exam, audio + all sections + questions embedded in one document (unlike Reading, where passages are separate).

**Key fields:** `name`, `testNumber`, `audioUrl`/`audioFileName`/`audioDuration` (Cloudinary-hosted audio), `sections[]` (embedded `ListeningSectionSchema` — one per Part 1–4, each with its own `questionGroups[]`), `isActive`. Virtual `totalQuestions` flattens the nested groups to a count.

**Relationships:** References nothing. Referenced by `ListeningAttempt.testId` and by `AccessKey.testId` (via `refPath`, `testType: 'listening'`).

**Indexes:** `{ isActive: 1, testNumber: -1 }`.

**Lifecycle:** CRUD via `routes/admin/passages.js` and `services/listeningService.js` (admin functions live in the service, not a separate admin route file, for this model). Supports both soft-deactivate (`isActive: false`) and hard delete (`findByIdAndDelete`). No TTL.

**Common queries:**
```js
ListeningTest.find().sort(...)                                // admin list
ListeningTest.findOne({ _id: id, isActive: true })             // student start-test
ListeningTest.aggregate([...])                                 // stats/leaderboard-shaped queries
```

### ListeningSection

**Purpose:** A standalone, single-Part Listening practice drill — its own document with its own audio, independent of any full `ListeningTest`. This is what powers "practice one section" mode as opposed to a full mock exam.

**Key fields:** `partNumber` (enum 1–4), `audioUrl`/`audioFileName`/`audioDuration`, `transcript`, `questionGroups[]` (same shape as `ListeningTest`'s embedded groups), `isActive`, `isActualTest`.

**Relationships:** References nothing. Referenced by `ListeningPracticeAttempt.sectionId`.

**Indexes:** `{ partNumber: 1, isActive: 1 }`, `{ isActualTest: 1, isActive: 1 }`.

**Lifecycle:** CRUD through `services/listeningService.js` (called from `routes/listening.js`/admin equivalents). Soft-deactivate and hard-delete both used. No TTL.

**Common queries:**
```js
ListeningSection.find(filter).sort(...)                        // browse by part
ListeningSection.findOne({ _id: id, isActive: true }).lean()   // practice start
ListeningSection.find({ _id: { $in: requestedIds } }).lean()
```

### WritingExam

**Purpose:** A full Writing mock exam shell — bundles a Task 1 prompt+image and a Task 2 prompt into one timed exam session definition.

**Key fields:** `task1.imageUrl`/`task1.prompt`/`task1.instructions`, `task2.prompt`/`task2.instructions`, `duration` (minutes), `isActive`.

**Relationships:** References nothing. Referenced by `WritingAttempt.examId` and `AccessKey.testId` (via `refPath`, `testType: 'writing'`).

**Indexes:** None beyond the default `_id` index.

**Lifecycle:** CRUD via `routes/admin/writingContent.js`. Notably `services/writingService.js` will auto-create a default `WritingExam` (`name: 'Writing Practice'`) if none exists — the only content model in the schema with this "create on demand if missing" fallback. No TTL.

**Common queries:**
```js
WritingExam.findOne({ isActive: true }).sort({ createdAt: -1 }).lean()
WritingExam.findById(examId).select('name')
```

### WritingTask1 / WritingTask2

**Purpose:** Standalone Task 1 (chart/graph description) and Task 2 (essay) prompts, used outside the full `WritingExam` flow for single-task practice — each with optional worked `sampleSections[]` (a titled sample-answer breakdown, e.g. "Introduction"/"Overview"/"Body 1").

**Key fields:** `prompt` (required), `instructions` (defaulted to the standard IELTS timing/word-count boilerplate), `sampleSections: [{title, content}]`, `isActive`. `WritingTask1` additionally has `imageUrl` for the chart/graph image.

**Relationships:** Reference nothing. Referenced by `WritingAttempt.task1Id`/`task2Id` respectively.

**Indexes:** None beyond `_id`.

**Lifecycle:** CRUD via `routes/admin/writingContent.js`, hard-deletable. Read by `services/writingService.js` for single-task practice mode. No TTL.

**Common queries:**
```js
WritingTask1.findById(task1Id).lean()
WritingTask2.findById(task2Id).lean()
```

### Task1Exercise

**Purpose:** One micro-drill question for the Writing Task 1 skill-building curriculum (e.g. "describe this trend," "paraphrase this data point") — the granular practice items behind Task 1's structured lesson path, distinct from the free-form `WritingTask1` prompts above.

**Key fields:** `skillType` (enum: `noun_phrase`/`data_description`/`comparison`/`paraphrase`/`trend_language`/`overview`), `module` (1–4), `level` (`beginner`/`elementary`/`intermediate`), `type` (question format: `fill_blank`/`translation`/`rearrange`/`multiple_choice`/`error_correction`/`paraphrase_choose`/`data_transform`), `dataContext` (structured chart/table data the question is built around), `primaryAnswer`/`sampleAnswers[]`, `xpReward`, `orderIndex`, `isActive`.

**Relationships:** References nothing. Referenced by `Task1Attempt.exerciseId`.

**Indexes:** `{ isActive: 1, orderIndex: 1 }` — matches the hot-path filter+sort shape used by the exercise listing endpoints.

**Lifecycle:** Seeded in bulk via `scripts/seedTask1Exercises.js`, editable via `routes/admin/task1Exercises.js`, hard-deletable. Read-heavy from `services/task1PracticeService.js`. No TTL.

**Common queries:**
```js
Task1Exercise.find(query).sort(...)                            // filtered by level/skillType/module
Task1Exercise.aggregate([...])                                 // grouped counts for progress UI
Task1Exercise.find({ _id: { $in: ids } }).lean()                // batch-fetch for a session
```

### Task2Topic

**Purpose:** A weekly Task 2 essay-writing curriculum unit — one topic (e.g. "Technology," week 3) bundling an essay prompt, advantages/disadvantages hints, a vocabulary list, and an embedded set of graded sub-questions covering multiple question types.

**Key fields:** `week` (1–12), `essayType` (enum: `advantages_disadvantages`/`cause_effect`/`cause_solution`/`effect_solution`/`agree_disagree`/`discuss_both_views`), `questions[]` (embedded — each has its own `type` enum covering `translation`/`error_correction`/`short_writing`/`paraphrase`/etc.; per ARCHITECTURE.md's AI grading workflow, only those four question types go through Gemini, the rest are graded deterministically by keyword/answer-key match), `vocabularyList[]`, `orderIndex`, `isActive`.

**Relationships:** References nothing. Referenced by `Task2Attempt.topicId`.

**Indexes:** `{ isActive: 1, week: 1, orderIndex: 1 }`.

**Lifecycle:** Seeded via `scripts/seedTask2Exercises.js`, CRUD via `routes/admin/task2Topics.js`, hard-deletable. No TTL.

**Common queries:**
```js
Task2Topic.find({ week, isActive: true }).sort(...)
Task2Topic.findById(topicId).select('vocabularyList topicName').lean()
Task2Topic.find({ _id: { $in: topicIds } }).lean()
```

### Task2Template

**Purpose:** A reference "sentence template" card for a specific Task 2 essay-structure type (e.g. an opinion-essay opening template) — static study material, not a graded exercise. `typeId` ties it to whichever essay type/skill it's a template for.

**Key fields:** `typeId` (required, unique), `label`, `sub`, `name`, `sections[]` (each with `title` + `items[]`, where each item is `{en, answer/answers, vi}` — the fill-in-the-template content), `orderIndex`, `isActive`.

**Relationships:** References nothing. Referenced by `Task2TemplateAttempt` only loosely — that model stores `templateType`/`templateName` as plain strings/snapshots, not an ObjectId ref (see below).

**Indexes:** None beyond the implicit unique index on `typeId`.

**Lifecycle:** CRUD (including a bulk `deleteMany({})` reset path gated by a `force` flag) via `routes/admin/task2Templates.js`. No TTL.

**Common queries:**
```js
Task2Template.find({ isActive: true }).sort({ orderIndex: 1 }).lean()
```

### SpeakingQuestion

**Purpose:** A single IELTS Speaking practice question/cue card, tagged by Part (1/2/3) and topic.

**Key fields:** `topic`, `part` (enum 1/2/3), `question`, `cueCard` (Part 2 bullet-point prompt), `isActive`.

**Relationships:** References nothing. Referenced by `SpeakingAttempt.questionId`.

**Indexes:** None beyond `_id`.

**Lifecycle:** CRUD via `routes/admin/speaking.js`, hard-deletable. No TTL.

**Common queries:**
```js
SpeakingQuestion.findOne(filter).skip(skip).lean()              // random-ish question pick
SpeakingQuestion.find(filter).sort({ part: 1, topic: 1 }).lean()
```

### SpeakingMaterial

**Purpose:** A downloadable PDF study resource for Speaking (topic vocabulary sheets, sample answers), organized by quarter/topic — content, not a gradable exercise.

**Key fields:** `title`, `quarter` (e.g. `'Q1 2025'`), `topic`, `pdfUrl` (Cloudinary), `isActive`.

**Relationships:** References nothing; nothing references it.

**Indexes:** None beyond `_id`.

**Lifecycle:** CRUD via `routes/admin/speaking.js` (shares the file with `SpeakingQuestion`), hard-deletable. No TTL.

**Common queries:**
```js
SpeakingMaterial.find(filter).sort({ createdAt: -1 }).lean()
```

### WritingSample

**Purpose:** Same idea as `SpeakingMaterial` but for Writing — downloadable PDF sample essays, organized by quarter/topic/task type.

**Key fields:** `title`, `quarter`, `topic`, `taskType` (enum `task1`/`task2`/`both`), `pdfUrl`, `isActive`.

**Relationships:** References nothing; nothing references it.

**Indexes:** None beyond `_id`.

**Lifecycle:** CRUD via `routes/admin/writingSamples.js`, hard-deletable. No TTL.

**Common queries:**
```js
WritingSample.find(filter).sort({ createdAt: -1 }).lean()
```

### WPTopic

**Purpose:** A "Writing Practice" (the beginner-focused sentence/paragraph-building track, distinct from Task 1/Task 2) topic category — e.g. "Family," "Travel" — the top level of that track's content hierarchy (Topic → Lesson → Exercise).

**Key fields:** `key` (required, unique — used as the join key elsewhere instead of an ObjectId, see `WPLesson`/`WPExercise` below), `title`/`titleVi`, `levels[]` (enum `beginner`/`elementary`/`intermediate`/`advanced`), `orderIndex`, `isActive`.

**Relationships:** References nothing. Nothing references it by ObjectId — `WPLesson.topicKey` and `WPExercise.topicKey` join to it by the plain-string `key` field instead of `ref`, which is why grepping for `ref: 'WPTopic'` finds nothing even though it's clearly the parent of the other two.

**Indexes:** None beyond the implicit unique index on `key`.

**Lifecycle:** Seeded via `scripts/seedWritingPractice.js`, CRUD via `routes/admin/writingPracticeWP.js`. No TTL.

**Common queries:**
```js
WPTopic.find({ isActive: true }).sort({ orderIndex: 1 }).lean()
```

### WPLesson

**Purpose:** A grammar-focused lesson grouping within a `WPTopic` (by `topicKey`+`level`) — nominally the mid-tier of the Writing Practice content hierarchy. See "Patterns across the schema" above: this model is written to but its own fields are never read back anywhere in the app.

**Key fields:** `topicKey` (joins to `WPTopic.key`, not an ObjectId ref), `lessonType` (enum `sentence`/`paragraph`/`essay`), `grammarFocus`, `level`, `difficulty`, `orderIndex`, `isActive`.

**Relationships:** References nothing. Referenced by `WPExercise.lessonId` — but see the write-only note above; nothing populates that ref.

**Indexes:** None beyond `_id`.

**Lifecycle:** Created via `findOneAndUpdate`-style upsert (dedup key `topicKey`+`level`) as a side effect of `services/writingPracticeService.js`'s bulk exercise-import path and `scripts/seedWritingPractice.js`. Never explicitly updated or deleted afterward. No TTL.

**Common queries:**
```js
WPLesson.findOne({ topicKey: ex.topicKey, level: ex.level })   // dedup check during import
```

### WPExercise

**Purpose:** A single Writing Practice drill item (translation/rearrange/fill-blank/expand/combine) within a lesson — the actual gradable unit of this track.

**Key fields:** `lessonId` (ref `WPLesson`, write-only per above), `topicKey`, `level`, `type` (enum `translation`/`rearrange`/`fill_blank`/`expand`/`combine`), `sampleAnswer` (required), `alternativeAnswers[]`, type-specific fields (`baseWords`, `options`, `blankAnswer`, `sentences`, `connector`, `baseText`), `difficulty`, `orderIndex`, `isActive`.

**Relationships:** References `WPLesson` via `lessonId`. Referenced by nothing directly — `WritingPracticeAttempt.exerciseId` stores the ID as a plain `String`, not an ObjectId ref (worth knowing if you ever try to `.populate()` it — you can't; you have to `findById` manually).

**Indexes:** `{ topicKey: 1, level: 1, type: 1 }`.

**Lifecycle:** Bulk-created via `services/writingPracticeService.js` import / `scripts/seedWritingPractice.js`, individually editable/deactivatable via `routes/admin/writingPracticeWP.js`. No TTL.

**Common queries:**
```js
WPExercise.find(query).sort({ orderIndex: 1, createdAt: 1 }).skip(...).limit(...).lean()
WPExercise.find({ _id: { $in: ids } }).lean()                   // batch-fetch a session's exercises
WPExercise.aggregate([...])                                      // topic-level progress counts
```

### Course

**Purpose:** A marketing/catalog entry for a course offered by the business (ieltsthayha.com) — displayed on the public course listing page. Not tied to any actual enrollment or progress tracking; it's presentational content.

**Key fields:** `title`, `subtitle`, `description`, `price` (free-text string, e.g. `'Liên hệ tư vấn'` — not a number), `category` (enum `ielts`/`speaking`/`comm`/`speaking ielts`), `levelColor` (enum `red`/`blue`/`green`/`purple` — a UI badge color), `isActive`, `order` (manual display ordering).

**Relationships:** References nothing; nothing references it.

**Indexes:** None beyond `_id`.

**Lifecycle:** CRUD via `routes/admin/courses.js`, hard-deletable. No TTL.

**Common queries:**
```js
Course.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
```

---

## Attempts

Student-generated, one document per exam/practice session. As a group these carry the schema's real query load and are indexed accordingly (contrast with Content above). See "Patterns across the schema" for which of these have TTL auto-expiry and which don't.

### TestAttempt

**Purpose:** One Reading mock-exam attempt (the full 3-passage `ReadingTest` flow, as opposed to single-passage practice — see `ReadingPracticeAttempt`).

**Key fields:** `testId` (ref `ReadingTest`), `passagesUsed[]` (ref `Passage` — the 3 randomly-chosen passages for this specific attempt, snapshotted as IDs so the attempt stays reproducible even if the passage pool changes later), `answers[]` (per-question `{questionNumber, userAnswer, correctAnswer, isCorrect}`), `correctCount`/`wrongCount`/`skippedCount`/`bandScore`, `status` (enum `in-progress`/`completed`/`timeout`). `calculateBandScore()` schema method maps `correctCount` through the official IELTS Reading band table (`utils/bandScore.js`).

**Relationships:** References `User` (`userId`), `ReadingTest` (`testId`), `Passage` (`passagesUsed[]`). Referenced by nothing.

**Indexes:** `{ status: 1, endTime: -1 }`, `{ userId: 1, status: 1 }`, `{ testId: 1, status: 1 }`.

**Lifecycle:** Created as `status: 'in-progress'` when a student starts a test (`services/readingService.js`), updated to `completed`/`timeout` on submit with final scoring filled in. Hard-deletable by admin (`routes/admin/attempts.js`). No TTL — retained indefinitely as the student's exam history.

**Common queries:**
```js
TestAttempt.findOne({ _id: attemptId, userId: user._id, status: 'in-progress' })   // resume in-progress
TestAttempt.findOne({ _id: attemptId, userId, status: 'completed' }).populate('testId', 'name testNumber')
TestAttempt.find({ userId, status: 'completed' }).sort(...)                        // history list
```

### ListeningAttempt

**Purpose:** One completed Listening mock-exam attempt against a full `ListeningTest`.

**Key fields:** `testId` (ref `ListeningTest`), `testName` (denormalized snapshot — avoids a populate on every history-list read), `answers[]`, `correctCount`/`bandScore`, `timeTaken`, `status` (enum `completed`/`timeout` — no `in-progress` state here, unlike `TestAttempt`).

**Relationships:** References `User`, `ListeningTest`. Referenced by nothing.

**Indexes:** `{ userId: 1, submittedAt: -1 }`, `{ userId: 1, status: 1 }`, `{ testId: 1, submittedAt: -1 }` (plus a redundant field-level `index: true` on `userId`).

**Lifecycle:** Created on submit (not on start — no in-progress row) by `services/listeningService.js`. Hard-deletable by admin. No TTL.

**Common queries:**
```js
ListeningAttempt.find({ userId, status: 'completed' }).sort(...)
ListeningAttempt.findOne({ _id: attemptId, userId })
ListeningAttempt.aggregate([...])                              // admin stats/leaderboards
```

### WritingAttempt

**Purpose:** One Writing submission — either a full exam (`submissionType: 'exam'`, tied to a `WritingExam`) or standalone Task 1/Task 2 practice (`submissionType: 'practice'`). Carries both AI-generated grading and a teacher's confirmed/overridden grading side by side.

**Key fields:** `submissionType` (enum `exam`/`practice`), `examId`/`task1Id`/`task2Id` (whichever applies), `task1Snapshot`/`task2Snapshot` (prompt/instructions frozen at submission time — same reproducibility pattern as `TestAttempt.passagesUsed`), `task1Answer`/`task2Answer` text, `gradingStatus` (enum `pending`/`ai_done`/`confirmed` — the state machine for the grading workflow), `aiGrading` (Gemini output: per-criterion band+comment, `sentenceFeedback`), `grading` (the teacher-confirmed version — `adminNote`, `confirmedAt`, `confirmedBy`), `feedbackRead` (has the student seen their grade yet).

**Relationships:** References `User`, `WritingExam` (`examId`), `WritingTask1` (`task1Id`), `WritingTask2` (`task2Id`). Referenced by nothing.

**Indexes:** `{ userId: 1, submittedAt: -1 }`, `{ examId: 1, submittedAt: -1 }` (plus field-level `index: true` on `userId`, `submissionType`, `feedbackRead`).

**Lifecycle:** Created on submit with `gradingStatus: 'pending'`. Updated to `ai_done` once Gemini grades it (`services/geminiService.js` via `writingService.js`), then to `confirmed` when a teacher reviews/overrides via `routes/admin/writingGrading.js`. `feedbackRead` flips to `true` the first time the student views a confirmed grade. Hard-deletable by admin. No TTL — this is graded work product, retained.

**Common queries:**
```js
WritingAttempt.countDocuments({ userId, gradingStatus: 'confirmed', feedbackRead: { $ne: true } })  // unread-feedback badge
WritingAttempt.updateOne({ _id: attempt._id }, { $set: { feedbackRead: true } })
WritingAttempt.find({ userId }).sort({ submittedAt: -1 }).limit(50).select('-task1Answer -task2Answer').lean()
```

### SpeakingAttempt

**Purpose:** One Speaking practice attempt — a transcript (client-side speech-to-text output; there's no server-side audio upload/transcribe step, per ARCHITECTURE.md's AI grading workflow) plus AI feedback.

**Key fields:** `questionId` (ref `SpeakingQuestion`), `topic`/`part`/`question` (denormalized snapshot, so history displays without a populate even if the question is later edited/deleted), `transcript`, `aiFeedback` (`overallBand`, per-criterion scores, `correctedVersion`, `strengths[]`, `corrections[]`), `status` (enum `pending`/`analyzed`/`error`).

**Relationships:** References `User`, `SpeakingQuestion`. Referenced by nothing.

**Indexes:** `{ userId: 1, createdAt: -1 }`.

**Lifecycle:** Created with `status: 'pending'` when a student submits a transcript, updated to `analyzed` (with `aiFeedback` populated) or `error` after the Gemini call in `services/speakingService.js`. Hard-deletable by admin. No TTL.

**Common queries:**
```js
SpeakingAttempt.find({ userId }).sort({ createdAt: -1 }).limit(30).lean()
```

### Task1Attempt

**Purpose:** One answer to a single `Task1Exercise` drill question.

**Key fields:** `exerciseId` (ref `Task1Exercise`), `userAnswer`, `isCorrect`, `score` (0–100), `xpEarned`, `skillType`/`module` (denormalized from the exercise, for fast progress aggregation without a join), `sessionId` (groups attempts submitted together in one practice session).

**Relationships:** References `User`, `Task1Exercise`. Referenced by nothing.

**Indexes:** TTL — `{ createdAt: 1 }` with `expireAfterSeconds: 30 days`. Plus `{ userId: 1, createdAt: -1 }`.

**Lifecycle:** Bulk-inserted (`insertMany`) at the end of a practice session by `services/task1PracticeService.js`. Never updated afterward. Hard-deletable by admin before its natural expiry. **Auto-deleted by MongoDB's TTL monitor 30 days after `createdAt`.**

**Common queries:**
```js
Task1Attempt.insertMany(docs)
Task1Attempt.aggregate([...])                                  // per-skillType progress
Task1Attempt.find({ userId })                                  // history
```

### Task2Attempt

**Purpose:** One practice or exam session against a `Task2Topic` — records every sub-question attempted within that session, not just one question.

**Key fields:** `sessionType` (enum `practice`/`exam`), `topicId` (ref `Task2Topic`), `topicName`/`level` (denormalized), `questionsAttempted[]` (embedded per-question results: `questionId`, `userAnswer`, `isCorrect`, `score`, `timeSpentSeconds`), `scorePercentage`, `completedAt`.

**Relationships:** References `User`, `Task2Topic`. Referenced by nothing.

**Indexes:** TTL — `{ createdAt: 1 }` with `expireAfterSeconds: 60 days` (the longest retention window of the TTL'd attempt models). Plus `{ userId: 1, topicId: 1 }` and `{ userId: 1, completedAt: -1 }`.

**Lifecycle:** Created on session completion by `services/task2PracticeService.js`. Never updated afterward. **Auto-deleted 60 days after `createdAt`.**

**Common queries:**
```js
Task2Attempt.find({ userId, topicId }).sort({ createdAt: 1 }).lean()   // wrong-questions review for one topic
Task2Attempt.aggregate([...])                                          // progress dashboard
Task2Attempt.find({ userId })                                          // history
```

### Task2TemplateAttempt

**Purpose:** A lightweight completion record for a `Task2Template` study/quiz session — just a score, not per-item detail (contrast with `Task2Attempt`'s embedded `questionsAttempted[]`).

**Key fields:** `templateType`/`templateName` (plain strings, not an ObjectId ref to `Task2Template` — see that model's Relationships note), `totalItems`/`correctItems`.

**Relationships:** References `User` only. Referenced by nothing. Does **not** formally reference `Task2Template` despite the name — it's a denormalized snapshot pair (`templateType`/`templateName`) instead of `templateId`.

**Indexes:** TTL — `{ createdAt: 1 }` with `expireAfterSeconds: 30 days`. Plus `{ userId: 1, createdAt: -1 }`.

**Lifecycle:** Created by `services/task2TemplateService.js` on quiz completion. Never updated. **Auto-deleted 30 days after `createdAt`.**

**Common queries:**
```js
Task2TemplateAttempt.create({ userId, templateType, templateName, totalItems, correctItems })
Task2TemplateAttempt.find({ userId })
```

### ReadingPracticeAttempt

**Purpose:** One attempt at a single standalone `Passage` in practice mode — distinct from `TestAttempt`, which is the full 3-passage mock-exam flow.

**Key fields:** `passageId` (ref `Passage`), `passageTitle`/`category` (denormalized), `answers[]`, `correctCount`/`wrongCount`/`skippedCount`, `timeTaken`.

**Relationships:** References `User`, `Passage`. Referenced by nothing.

**Indexes:** `{ userId: 1, submittedAt: -1 }` (plus field-level `index: true` on `userId`).

**Lifecycle:** Created on submit by `services/readingService.js`. Never updated afterward. Hard-deletable by admin. No TTL — unlike the Task1/Task2 drill attempts, single-passage Reading practice history is retained indefinitely (see "Patterns across the schema").

**Common queries:**
```js
ReadingPracticeAttempt.aggregate([...])                         // per-category stats
ReadingPracticeAttempt.find({ userId }).select('-answers').sort({ submittedAt: -1 }).limit(50).lean()
ReadingPracticeAttempt.findOne({ _id: attemptId, userId }).lean()
```

### ListeningPracticeAttempt

**Purpose:** One attempt at a single standalone `ListeningSection` (one Part), the Listening equivalent of `ReadingPracticeAttempt`.

**Key fields:** `sectionId` (ref `ListeningSection`), `sectionTitle`/`partNumber` (denormalized), `answers[]`, `correctCount`/`wrongCount`/`skippedCount`, `timeTaken`.

**Relationships:** References `User`, `ListeningSection`. Referenced by nothing.

**Indexes:** `{ userId: 1, submittedAt: -1 }` (plus field-level `index: true` on `userId`).

**Lifecycle:** Created on submit by `services/listeningService.js`. Never updated. Hard-deletable by admin. No TTL.

**Common queries:**
```js
ListeningPracticeAttempt.aggregate([...])                       // per-part stats
ListeningPracticeAttempt.find({ userId }).select('-answers').sort({ submittedAt: -1 }).limit(50).lean()
```

### WritingPracticeAttempt

**Purpose:** One completed drill in the beginner-focused Writing Practice track (`WPExercise`).

**Key fields:** `studentId` (note the field name — the one attempt model that says `studentId` instead of `userId`), `exerciseId` (plain `String`, not an ObjectId ref — see `WPExercise`'s note on why it can't be populated), `level`/`type` (enum, mirroring `WPExercise.type`), `topic`, `userAnswer`, `xpEarned`.

**Relationships:** References `User` (`studentId`). Referenced by nothing.

**Indexes:** TTL — `{ createdAt: 1 }` with `expireAfterSeconds: 30 days`. Plus `{ studentId: 1, createdAt: -1 }`.

**Lifecycle:** Bulk-inserted (`insertMany`) at session end by `services/writingPracticeService.js`. Also individually hard-deletable by admin (`routes/admin/writingPracticeWP.js`) before its natural expiry. **Auto-deleted 30 days after `createdAt`.**

**Common queries:**
```js
WritingPracticeAttempt.insertMany(docs)
WritingPracticeAttempt.find({ studentId }).sort(...)
WritingPracticeAttempt.aggregate([...])                         // getMyStats()
```

---

## Vocabulary

### VocabBook

**Purpose:** A student's personal vocabulary notebook — students can have multiple books (topic-organized), each holding an embedded list of saved words with per-word learning status.

**Key fields:** `name`, `color`/`emoji` (UI customization), `words[]` (embedded `SavedWordSchema`: `word`, `meaning`, `example`, `phonetic`, `partOfSpeech`, `status` (enum `chua-thuoc`/`nho-so-so`/`da-thuoc` — Vietnamese for "don't know yet"/"kind of remember"/"know it," IELTS-app-specific spaced-repetition-style tiers), `source` (`'reading'` or `'unit-5'`-style tag for where the word came from), `wrongCount`), `isDefault` (5 books are seeded as defaults per new setup), `sortOrder`.

**Relationships:** References `User`. Referenced by nothing.

**Indexes:** `{ userId: 1 }` — every book/word CRUD op in `services/vocabBookService.js` filters by `userId`.

**Lifecycle:** Default books `insertMany`'d for a user; students create/rename/reorder/merge/delete additional books and add/edit/remove words within them via `services/vocabBookService.js`. No TTL.

**Common queries:**
```js
VocabBook.find({ userId: user._id }).sort(...)
VocabBook.findOne({ _id: id, userId })
VocabBook.findOneAndUpdate({ _id: id, userId }, update, { new: true })
```

### VocabUnit

**Purpose:** An admin-curated vocabulary lesson unit (e.g. "Unit 5: Environment") — structured, numbered course content, distinct from a student's own `VocabBook`. Also doubles as the home for "paraphrase" drill pairs (`type: 'paraphrase'` entries within the same embedded `words[]` array).

**Key fields:** `unitNumber` (required, unique — also the manual ordering/identity key, reassigned via bulk `updateMany` reorder operations), `level` (free-text, e.g. `'B1'`), `words[]` (embedded, `type` enum `vocab`/`paraphrase` — a discriminator-by-field-presence pattern rather than separate schemas), `isActive`.

**Relationships:** References nothing; nothing references it.

**Indexes:** None beyond the implicit unique index on `unitNumber`.

**Lifecycle:** CRUD via `services/vocabService.js` (admin-facing). Reordering is notable: it goes through a two-phase `updateMany` (bump everything to `10000+i` first, then to the final `i+1`) specifically to dodge the unique-`unitNumber` constraint colliding with itself mid-reorder. No TTL.

**Common queries:**
```js
VocabUnit.find({ isActive: true }).sort(...)                    // student-facing list
VocabUnit.findOne({ unitNumber: number, isActive: true })
VocabUnit.findOne().sort({ unitNumber: -1 }).select('unitNumber').lean()   // next-available-number check
```

### VocabActivity

**Purpose:** A daily activity counter per student — one document per `(userId, date)` pair, incremented as the student interacts with the vocab feature. Powers admin analytics (engagement over time), not shown to the student directly.

**Key fields:** `date` (truncated to UTC midnight — the grouping key), `viewCount` (vocab page opens), `wordsAdded`, `wordsStudied` (status-update actions).

**Relationships:** References `User`. Referenced by nothing.

**Indexes:** `{ userId: 1, date: 1 }`, `unique: true` — both the query-support index and the correctness mechanism (guarantees the upsert-via-`$inc` pattern below can't create duplicate per-day rows).

**Lifecycle:** Upserted via `findOneAndUpdate` with `$inc` on every relevant vocab action (`services/vocabBookService.js`) — never a plain `create`/`update`, always the atomic increment-or-create. Never deleted. No TTL — this is analytics history, kept indefinitely.

**Common queries:**
```js
VocabActivity.findOneAndUpdate(
  { userId, date: todayUTCMidnight },
  { $inc: { viewCount: 1 } },
  { upsert: true }
)
```

### DifficultWord

**Purpose:** Auto-tracked "words this student keeps getting wrong" — populated from repeated wrong answers elsewhere in the app (vocab drills), not something the student adds directly.

**Key fields:** `word`, `wrongCount` (starts at 1, incremented on each repeat miss), `source`, `lastWrongAt`. Notably `{ timestamps: false }` — no `createdAt`/`updatedAt`, it tracks its own `addedAt`/`lastWrongAt` manually instead.

**Relationships:** References `User`. Referenced by nothing.

**Indexes:** `{ userId: 1, word: 1 }`, `unique: true` — one row per student per word; repeat misses increment the existing row rather than creating duplicates.

**Lifecycle:** Upserted via `findOneAndUpdate` (increment `wrongCount`, bump `lastWrongAt`) from `services/difficultWordsService.js` whenever a student misses a word. Deletable by the student (removing a word from their "difficult" list once mastered). No TTL.

**Common queries:**
```js
DifficultWord.find({ userId, wrongCount: { $gte: 3 } }).sort(...)   // "words you keep missing" list
DifficultWord.findOneAndUpdate({ userId, word }, { $inc: { wrongCount: 1 }, lastWrongAt: new Date() }, { upsert: true })
```

---

## Operations

The business-operations side of the schema — tuition billing, upgrade requests, access keys, in-app messaging, and autosave drafts. Mixed bag deliberately grouped together in ARCHITECTURE.md rather than split further.

### TuitionFee

**Purpose:** One billing line for a student — either a recurring monthly tuition charge or a one-off course fee — for the real-world English-teaching business this platform supports.

**Key fields:** `feeType` (enum `monthly`/`course`), `month`/`year` (monthly only), `courseName` (course only), `amount` (VND, integer), `isPaid`/`paidDate` (admin marks paid), `studentNotified`/`studentNotifiedAt` (student self-reports "I've transferred the money," a distinct signal from admin confirmation), `createdBy` (ref `User`, the admin who created the fee).

**Relationships:** References `User` twice — `studentId` (who owes) and `createdBy` (which admin created it). Referenced by nothing.

**Indexes:**
- `{ studentId: 1, feeType: 1, month: 1, year: 1 }`, `unique: true`, `partialFilterExpression: { feeType: 'monthly' }` — prevents duplicate monthly fees per student per month/year; scoped to `monthly` only via partial filter (the schema comment explains why `sparse` wouldn't work here: `studentId`/`feeType` are never missing, so a plain sparse index wouldn't exclude course-type fees from the uniqueness check the way the partial filter does).
- `{ month: 1, year: 1, isPaid: 1 }` — serves the cron reminder job's `find({month, year, isPaid: false})`, which doesn't lead with `studentId` so it can't use the index above.

**Lifecycle:** Created by an admin (`services/tuitionService.js`, called from billing routes) per student per month, or per course enrollment. Updated when marked paid, or when the student self-reports a transfer. The cron job `cron/tuitionReminder.js` reads (never writes) this collection to decide who to email/message. Hard-deletable by admin. No TTL.

**Common queries:**
```js
TuitionFee.find({ studentId, isPaid: false }).lean()
TuitionFee.find({ month: Number(month), year: Number(year), isPaid: false })   // cron reminder target list
TuitionFee.aggregate([...])                                     // revenue/collection-rate reporting
```

### TuitionSettings

**Purpose:** The one singleton document holding business-wide tuition configuration — bank transfer details, default fee amount, and auto-reminder scheduling. See "Patterns across the schema" — this is the only model in the schema built as a true singleton.

**Key fields:** `_singleton: 'main'` (unique, the enforcement mechanism), `bankName`/`bankAccount`/`accountName`/`qrImageUrl` (payment instructions shown to students), `defaultMonthlyFee`, `autoRemindEnabled`/`autoRemindDay`/`autoRemindEndMonth`/`autoRemindEndYear` (cron job configuration).

**Relationships:** References nothing; nothing references it.

**Indexes:** Implicit unique index on `_singleton` (the singleton-enforcement mechanism).

**Lifecycle:** Never explicitly created by a route — `getSingleton()` (a schema static) creates the one row on first access if it doesn't exist yet, and every read/write in `services/tuitionService.js` and `cron/tuitionReminder.js` goes through that static rather than a raw query. Effectively update-only after the first call. No TTL, no delete path.

**Common queries:**
```js
TuitionSettings.getSingleton()   // the only way this model is ever queried
```

### UpgradeRequest

**Purpose:** A student's request to upgrade from `free` to `premium` for a chosen duration — reviewed and approved/rejected by an admin, who then updates the `User.plan` fields directly (that plan mutation lives in `services/upgradeService.js`, not on this model).

**Key fields:** `months` (enum `1`/`3`/`6`/`12`/`36`), `amount` (VND), `status` (enum `pending`/`approved`/`rejected`), `reviewedBy` (ref `User`, the admin), `reviewedAt`.

**Relationships:** References `User` twice — `userId` (requester) and `reviewedBy` (admin who decided). Referenced by nothing.

**Indexes:**
- `{ userId: 1, status: 1 }`, `unique: true`, `partialFilterExpression: { status: 'pending' }` — the actual atomic guard against duplicate pending requests (the schema comment is explicit that the route's own find-then-save check is only a friendly-error-message convenience, not the real safety mechanism — two near-simultaneous submits are what this index prevents, consistent with ARCHITECTURE.md's "no transactions, atomic updates instead" pattern).
- `{ status: 1, createdAt: -1 }` — admin queue view.

**Lifecycle:** Created by a student (blocked if they already have a pending request, per the unique partial index). Updated once by an admin (`status` → `approved`/`rejected`, `reviewedBy`/`reviewedAt` set) — approval also triggers a `User.plan` update elsewhere. Not deleted, not TTL'd — kept as an audit trail.

**Common queries:**
```js
UpgradeRequest.findOne({ userId, status: 'pending' })            // duplicate-request guard (convenience check)
UpgradeRequest.findOne({ userId }).sort({ createdAt: -1 })        // student's latest request status
```

### AccessKey

**Purpose:** Designed as a redeemable one-time/limited-use code granting access to a specific test (or any test of a type, or anything at all) without a premium plan. **Confirmed orphaned** — see "Patterns across the schema" above for the grep evidence. Document it as it exists in the schema, but be aware the redemption half of the feature was never built.

**Key fields:** `key` (unique, uppercase), `testType` (enum `reading`/`listening`/`writing`/`speaking`/`null`), `testId` (dynamic `refPath: 'testRefModel'` — resolves to `ReadingTest`/`ListeningTest`/`WritingExam` depending on `testType`; the virtual `testRefModel` getter deliberately falls back to `'ReadingTest'` for `speaking`/`null` cases since there's no dedicated ref target and `testId` is always `null` there in practice — see the schema's own comment on why that's currently harmless), `createdBy` (ref `User`), `expiresAt`, `maxUses`/`currentUses` (tracked in the schema but `currentUses` is never incremented by any code path), virtual `isValid` (computed from `isActive`+`currentUses`/`maxUses`+`expiresAt`, but never consulted since nothing redeems a key).

**Relationships:** References `User` (`createdBy`) and, dynamically, `ReadingTest`/`ListeningTest`/`WritingExam` (`testId` via `refPath`). Referenced by nothing.

**Indexes:** `{ createdBy: 1, createdAt: -1 }` (plus the implicit unique index on `key`).

**Lifecycle:** Created (generated, up to 100 at a time) and deactivated/hard-deleted by teachers/admins via `routes/admin/accessKeys.js`. No student-facing create/read/update path exists at all. No TTL.

**Common queries:**
```js
AccessKey.find(filter).populate('createdBy', 'username').sort({ createdAt: -1 })   // admin key list
AccessKey.findByIdAndUpdate(req.params.id, { isActive: false })                     // deactivate
```

### Message

**Purpose:** In-app inbox — either a direct message from admin/teacher to a specific student (`toId` set) or a broadcast to everyone (`isBroadcast: true`, `toId: null`). Used for tuition reminders (via `cron/tuitionReminder.js`) as well as manual admin messaging.

**Key fields:** `fromId`/`fromName` (denormalized sender name, avoids a populate on every inbox render), `toId` (`null` for broadcasts), `isBroadcast`, `isRead` (personal messages only), `readBy[]`/`deletedBy[]` (broadcasts need per-user read/delete tracking since there's one document shared by every recipient, unlike personal messages which have their own `isRead`).

**Relationships:** References `User` twice — `fromId`, `toId`. Referenced by nothing.

**Indexes:**
- `{ toId: 1, isBroadcast: 1, isRead: 1 }` — serves the unread-count badge, described in the schema comment as polled on effectively every page load.
- `{ isBroadcast: 1, createdAt: -1 }` — broadcast feed.
- `{ fromId: 1, createdAt: -1 }` — admin "sent messages" view.

**Lifecycle:** Created by admins (manual) or by the cron job (automated tuition reminders, `Message.insertMany` for bulk fan-out). Updated when marked read (`isRead` for personal, `readBy` push for broadcast) or soft-deleted (`deletedBy` push — messages are never hard-deleted from a recipient's perspective, only from the sender's own "sent" view via `findOneAndDelete({_id, fromId: req.user._id})`). No TTL.

**Common queries:**
```js
Message.countDocuments({ toId: uid, isBroadcast: false, isRead: false, deletedBy: { $ne: uid } })
Message.countDocuments({ isBroadcast: true, readBy: { $ne: uid }, deletedBy: { $ne: uid } })
Message.insertMany(msgs)                                        // cron bulk reminder fan-out
```

### WritingDraft

**Purpose:** Autosave for an in-progress Writing submission (exam or practice) — one draft per student, overwritten on every autosave tick, so the student doesn't lose work on a page refresh/crash mid-essay.

**Key fields:** `userId` (`unique: true` — enforces exactly one draft per student, autosave overwrites in place rather than accumulating), `taskType`, `task` (`Mixed` — a snapshot of whatever task content was being written), `answer`, `wordCount`, `seconds` (elapsed timer state).

**Relationships:** References `User` (uniquely). Referenced by nothing.

**Indexes:** TTL — `{ savedAt: 1 }` with `expireAfterSeconds: 30 days` (from last save, not from creation — `savedAt` is bumped on every autosave). Plus the implicit unique index on `userId`.

**Lifecycle:** Upserted via `findOneAndUpdate` on every autosave tick from the Writing exam UI, deleted outright (`deleteOne`) once the student actually submits (no point keeping a draft of something now finalized as a `WritingAttempt`). **Auto-deleted 30 days after the last autosave** if the student never submits or comes back.

**Common queries:**
```js
WritingDraft.findOne({ userId }).lean()                          // resume-draft check on page load
WritingDraft.findOneAndUpdate({ userId }, update, { upsert: true, new: true })
WritingDraft.deleteOne({ userId })                                // on submit
```

### Task2Draft

**Purpose:** Autosave for an in-progress Task 2 practice/exam session — richer than `WritingDraft` since Task 2 sessions have multiple sub-questions in flight (`sessionAttempts[]`, `questionStatus[]`, current position), not just one text answer.

**Key fields:** `topicId` (plain `String`, matching `Task2Topic`'s pattern elsewhere of being joined by string ID rather than ObjectId ref in some places — though note `Task2Attempt.topicId` *is* a proper ObjectId ref, so this is inconsistent even within the same feature), `mode` (enum `practice`/`exam`/`vocab`/`retry`), `questionIds[]`, `currentIdx`, `sessionAttempts[]` (embedded per-question in-progress state, including AI feedback already received: `modelAnswer`, `feedbackVi`), `sessionDone`/`sessionCorrect` (running tallies).

**Relationships:** References `User`. Referenced by nothing.

**Indexes:**
- `{ userId: 1, topicId: 1 }`, `unique: true` — one draft per student per topic (upsert target).
- TTL — `{ savedAt: 1 }` with `expireAfterSeconds: 7 days` — notably the shortest retention window in the schema, versus `WritingDraft`'s 30 days.

**Lifecycle:** Upserted per `(userId, topicId)` as the student progresses through a session (`services/task2PracticeService.js`), with a companion `deleteMany({userId, topicId: {$ne: topicId}})` that cleans up any *other* stale in-progress topic drafts for the same student whenever they start a new one (so a student only ever has one live draft at a time despite the schema technically allowing one per topic). Deleted outright on session completion. **Auto-deleted 7 days after the last save** otherwise.

**Common queries:**
```js
Task2Draft.findOneAndUpdate({ userId, topicId }, update, { upsert: true, new: true })
Task2Draft.deleteMany({ userId, topicId: { $ne: topicId } })     // clear other in-progress topics
Task2Draft.findOne({ userId, topicId }).lean()                    // resume check
```
