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
  name: 'Cam 21 - Test 1',
  testNumber: 1,
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
          groupType: 'table',
          groupTitle: 'Oyster Bay Sailing Club Courses',
          instruction: 'Questions 1–6  Complete the table below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          tableConfig: {
            headers: ['Name of course', 'What you learn', 'Cost', 'Other information'],
            rows: [
              ['Taster day', 'introduction to sailing', '£120 if booking one place', 'small groups (max __Q1__ people)'],
              [
                'Level 1',
                'basic theory e.g. understanding the __Q2__ and tides<br>basic sailing skills including __Q3__ information',
                '£200<br>__Q4__ available for club members<br>all inclusive (plus a useful __Q5__)',
                'a __Q6__ at the end of the course for all participants',
              ],
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: '10/ten' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'weather' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'safety' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'discount' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'dictionary' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'certificate' },
          ],
        },
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 7–10  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'General information',
            lines: [
              '●   Participants must be able to swim.',
              '●   Bring suitable clothing, a __Q7__ and toiletries (e.g. shampoo).',
              '●   There is a __Q8__ at the club.',
              '●   Online training __Q9__ are recommended.',
              '●   __Q10__ are available for course participants.',
            ],
          },
          questions: [
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'towel' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'cafe/café' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'videos' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'Lockers' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Working as a makeup trainee',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–16  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   What should trainees always expect to get when working on low budget short films?',
              options: [
                'A   travel expenses',
                'B   a minimum wage',
                'C   meals',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   According to the speaker, on big budget films trainees may get experience of',
              options: [
                'A   makeup for special effects.',
                'B   working with different ethnicities.',
                'C   creating a variety of hair styles.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   The speaker says a problem for makeup artists is',
              options: [
                'A   dealing with difficult directors.',
                'B   being shouted at by their supervisor.',
                'C   waiting around for hours doing nothing.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   How did the speaker feel when she met famous actors for the first time?',
              options: [
                'A   very shy',
                'B   very proud',
                'C   very disappointed',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   What advice does the speaker give about makeup kits?',
              options: [
                'A   Always carry a basic kit with you.',
                'B   Only buy the best products for a makeup kit.',
                'C   Ask other makeup artists to check your kit.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 16, type: 'multiple-choice',
              questionText: '16   What advice does the speaker give about creating a portfolio?',
              options: [
                'A   Keep print and digital photos.',
                'B   Only include a small selection of photos.',
                'C   Get permission to use photos.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 17–20  What ability is required for each of the following duties? Write the correct letter, A, B, or C, next to Questions 17–20.',
          matchingOptionsTitle: 'Abilities',
          matchingOptions: [
            'being well-organised',
            'being flexible',
            'working quickly',
          ],
          matchingReuseAllowed: true,
          questions: [
            { questionNumber: 17, type: 'matching-info', questionText: 'Prepping an actor', correctAnswer: 'C' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Continuity', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: 'General', correctAnswer: 'B' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Applying makeup', correctAnswer: 'C' },
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
              questionText: 'Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?',
              options: [
                'A   the references to local problems',
                'B   the broad focus of the examples',
                'C   the practical suggestions for solutions',
                'D   the type of issues discussed',
                'E   the implications for government policy',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   the references to local problems',
                'B   the broad focus of the examples',
                'C   the practical suggestions for solutions',
                'D   the type of issues discussed',
                'E   the implications for government policy',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 23 and 24  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 23, type: 'multi-answer-group',
              questionText: 'Which TWO details about the research project particularly impressed the students?',
              options: [
                "A   the team's previous successes",
                'B   its wide geographical scale',
                'C   the use of new technology',
                'D   the extensive statistical evidence',
                'E   the large range of specialists involved',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                "A   the team's previous successes",
                'B   its wide geographical scale',
                'C   the use of new technology',
                'D   the extensive statistical evidence',
                'E   the large range of specialists involved',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: "Questions 25–30  What is the students' opinion of each of the following resources related to ocean biodiversity? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.",
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'This is aimed at a very specialist audience.',
            'This is now rather outdated.',
            'This was an effective description of a new danger.',
            'This suggests possible ways to improve the situation.',
            'This does not give a balanced account.',
            'This is too predictable to be useful.',
            'This gives insufficient evidence for its claims.',
            'This gives a clear explanation of the problems.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Article on invasive lionfish', correctAnswer: 'G' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Documentary on microplastics', correctAnswer: 'B' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Podcast on ocean pollution', correctAnswer: 'F' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Book on coastal ecosystems', correctAnswer: 'H' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Article on metal toxicity', correctAnswer: 'A' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Podcast on floating marine cities', correctAnswer: 'E' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Sources of rubber',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Sources of rubber',
            lines: [
              'Three resources which are essential for industrial civilisation',
              '●   __Q31__',
              '●   fossil fuels',
              '●   rubber',
              'Natural rubber',
              'This mainly comes from the Para rubber tree, now cultivated in South-East Asia.',
              'The supply is limited because',
              '●   the growth of the tree is __Q32__.',
              '●   production cannot easily be adjusted because of increasing or decreasing __Q33__.',
              '●   the tree only grows near the __Q34__.',
              '●   extracting the latex (rubber) is labour-intensive',
              '●   it is very difficult to __Q35__ rubber after production.',
              'New threats include',
              '●   lack of genetic diversity, leading to danger of disease caused by a __Q36__.',
              '●   a shift to the cultivation of palm oil',
              '●   extreme __Q37__ events.',
              'Synthetic rubber',
              '●   may be used for engine parts and cooking utensils',
              '●   is less __Q38__ than natural rubber',
              '●   is unsuitable for many purposes e.g. the tyres of aircraft.',
              'An alternative source of natural rubber',
              '●   A wild flower (a type of dandelion) has rubber in its __Q39__.',
              '●   It can be grown in many locations and does not require good __Q40__.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'metal/metals' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'slow' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'demand' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'equator' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'recycle' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'fungus' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'weather' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'strong' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'roots' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'soil' },
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
