// Generic one-off content seed — inserts the TEST doc below as a normal
// ListeningTest so it shows up in admin's Đề Listening list exactly like
// every other hand-entered test (Cam 20, Actual Tests, ...): editable name,
// editable questions, and ready for the admin to attach the full-test audio
// and any map images via the existing admin UI (the schema only supports
// one audio file per test, not per-part — same as all existing tests, so
// audio is left blank here for admin to upload).
//
// Reused per test: edit TEST below to the next test's content, then run
// `node scripts/seedListeningTest.js` from backend/. Safe to re-run — skips
// if a test with this exact name already exists. Each past run's content is
// preserved in git history (see log for prior seeds under this filename).

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');

const TEST = {
  name: 'Cam 17 - Test 2',
  testNumber: 2,
  seriesName: 'Cam 17',
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
          instruction: 'Questions 1–7  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Opportunities for voluntary work in Southoe village',
            lines: [
              'Library',
              '●   Help with __Q1__ books (times to be arranged)',
              '●   Help needed to keep __Q2__ of books up to date',
              '●   Library is in the __Q3__ Room in the village hall',
              'Lunch club',
              '●   Help by providing __Q4__',
              '●   Help with hobbies such as __Q5__',
              'Help for individuals needed next week',
              '●   Taking Mrs Carroll to __Q6__',
              "●   Work in the __Q7__ at Mr Selsbury's house",
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'collecting' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'records' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'West' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'transport' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'art' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'hospital' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'garden' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 8–10  Complete the table below.  Write ONE WORD ONLY for each answer.',
          tableConfig: {
            headers: ['Date', 'Event', 'Location', 'Help needed'],
            rows: [
              ['19 Oct', '__Q8__', 'Village hall', 'providing refreshments'],
              ['18 Nov', 'dance', 'Village hall', 'checking __Q9__'],
              ['31 Dec', "New Year's Eve party", 'Mountfort Hotel', 'designing the __Q10__'],
            ],
          },
          questions: [
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'quiz' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'tickets' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'poster' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Oniton Hall',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–14  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   Many past owners made changes to',
              options: [
                'A   the gardens.',
                'B   the house.',
                'C   the farm.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   Sir Edward Downes built Oniton Hall because he wanted',
              options: [
                'A   a place for discussing politics.',
                'B   a place to display his wealth.',
                'C   a place for artists and writers.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   Visitors can learn about the work of servants in the past from',
              options: [
                'A   audio guides.',
                'B   photographs.',
                'C   people in costume.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   What is new for children at Onion Hall?',
              options: [
                'A   clothes for dressing up',
                'B   mini tractors',
                'C   the adventure playground',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  Which activity is offered at each of the following locations on the farm? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15–20.',
          matchingOptionsTitle: 'Activities',
          matchingOptions: [
            'shopping',
            'watching cows being milked',
            'seeing old farming equipment',
            'eating and drinking',
            'starting a trip',
            'seeing rare breeds of animals',
            'helping to look after animals',
            'using farming tools',
          ],
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'dairy', correctAnswer: 'D' },
            { questionNumber: 16, type: 'matching-info', questionText: 'large barn', correctAnswer: 'C' },
            { questionNumber: 17, type: 'matching-info', questionText: 'small barn', correctAnswer: 'G' },
            { questionNumber: 18, type: 'matching-info', questionText: 'stables', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: 'shed', correctAnswer: 'E' },
            { questionNumber: 20, type: 'matching-info', questionText: 'parkland', correctAnswer: 'F' },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Part 3',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21 and 22  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 21, type: 'multi-answer-group',
              questionText: 'Which TWO things do the students agree they need to include in their review of Romeo and Juliet?',
              options: [
                'A   analysis of the text',
                'B   a summary of the plot',
                'C   a description of the theatre',
                'D   a personal reaction',
                'E   a reference to particular scenes',
              ],
              correctAnswer: 'D',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   analysis of the text',
                'B   a summary of the plot',
                'C   a description of the theatre',
                'D   a personal reaction',
                'E   a reference to particular scenes',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: "Questions 23–27  Which opinion do the speakers give about each of the following aspects of The Emporium's production of Romeo and Juliet? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23–27.",
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'They both expected this to be more traditional.',
            'They both thought this was original.',
            'They agree this created the right atmosphere.',
            'They agree this was a major strength.',
            'They were both disappointed by this.',
            'They disagree about why this was an issue.',
            'They disagree about how this could be improved.',
          ],
          questions: [
            { questionNumber: 23, type: 'matching-info', questionText: 'the set', correctAnswer: 'D' },
            { questionNumber: 24, type: 'matching-info', questionText: 'the lighting', correctAnswer: 'C' },
            { questionNumber: 25, type: 'matching-info', questionText: 'the costume design', correctAnswer: 'A' },
            { questionNumber: 26, type: 'matching-info', questionText: 'the music', correctAnswer: 'E' },
            { questionNumber: 27, type: 'matching-info', questionText: "the actors' delivery", correctAnswer: 'F' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 28–30  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 28, type: 'multiple-choice',
              questionText: '28   The students think the story of Romeo and Juliet is still relevant for young people today because',
              options: [
                'A   it illustrates how easily conflict can start.',
                'B   it deals with problems that families experience.',
                'C   it teaches them about relationships.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 29, type: 'multiple-choice',
              questionText: '29   The students found watching Romeo and Juliet in another language',
              options: [
                'A   frustrating.',
                'B   demanding.',
                'C   moving.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 30, type: 'multiple-choice',
              questionText: "30   Why do the students think Shakespeare's plays have such international appeal?",
              options: [
                'A   The stories are exciting.',
                'B   There are recognisable characters.',
                'C   They can be interpreted in many ways.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'The impact of digital technology on the Icelandic language',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'The impact of digital technology on the Icelandic language',
            lines: [
              'The Icelandic language',
              '●   has approximately __Q31__ speakers',
              '●   has a __Q32__ that is still growing',
              '●   has not changed a lot over the last thousand years',
              '●   has its own words for computer-based concepts, such as web browser and __Q33__',
              'Young speakers',
              '●   are big users of digital technology, such as __Q34__',
              '●   are becoming __Q35__ very quickly',
              '●   are having discussions using only English while they are in the __Q36__ at school',
              '●   are better able to identify the content of a __Q37__ in English than Icelandic',
              'Technology and internet companies',
              '●   write very little in Icelandic because of the small number of speakers and because of how complicated its __Q38__ is',
              'The Icelandic government',
              '●   has set up a fund to support the production of more digital content in the language',
              '●   believes that Icelandic has a secure future',
              '●   is worried that young Icelanders may lose their __Q39__ as Icelanders',
              '●   is worried about the consequences of children not being __Q40__ in either Icelandic or English',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: '321,000' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'vocabulary' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'podcast' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'smartphones' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'bilingual' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'playground' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'picture' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'grammar' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'identity' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'fluent' },
          ],
        },
      ],
    },
  ],
};

async function runSeed() {
  const existing = await ListeningTest.findOne({ name: TEST.name }).lean();
  if (existing) {
    console.log(`[SeedListeningTest] "${TEST.name}" already exists (_id=${existing._id}) – skip`);
    return existing;
  }
  const doc = await ListeningTest.create(TEST);
  console.log(`[SeedListeningTest] Inserted "${TEST.name}" (_id=${doc._id}, ${doc.totalQuestions} questions)`);
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

module.exports = { runSeed, TEST };
