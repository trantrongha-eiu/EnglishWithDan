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
  name: 'Cam 18 - Test 2',
  testNumber: 2,
  seriesName: 'Cam 18',
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
          instruction: 'Questions 1–5  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: "Working at Milo's Restaurants",
            lines: [
              'Benefits',
              '●   __Q1__ provided for all staff',
              "●   __Q2__ during weekdays at all Milo's Restaurants",
              '●   __Q3__ provided after midnight',
              'Person specification',
              '●   must be prepared to work well in a team',
              '●   must care about maintaining a high standard of __Q4__',
              '●   must have a qualification in __Q5__',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'training' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'discount' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'taxi' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'service' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'English' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 6–10  Complete the table below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          tableConfig: {
            headers: ['Location', 'Job title', 'Responsibilities include', 'Pay and conditions'],
            rows: [
              [
                '__Q6__ Street',
                'Breakfast supervisor',
                'Checking portions, etc. are correct<br>Making sure __Q7__ is clean',
                'Starting salary £__Q8__ per hour<br>Start work at 5.30 a.m.',
              ],
              [
                'City Road',
                'Junior chef',
                'Supporting senior chefs<br>Maintaining stock and organising __Q9__',
                'Annual salary £23,000<br>No work on a __Q10__ once a month',
              ],
            ],
          },
          questions: [
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'Wivenhoe' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'equipment' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: '9.75' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'deliveries' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'Sunday' },
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
              questionText: 'What are the TWO main reasons why this site has been chosen for the housing development?',
              options: [
                'A   It has suitable geographical features.',
                'B   There is easy access to local facilities.',
                'C   It has good connections with the airport.',
                'D   The land is of little agricultural value.',
                'E   It will be convenient for workers.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   It has suitable geographical features.',
                'B   There is easy access to local facilities.',
                'C   It has good connections with the airport.',
                'D   The land is of little agricultural value.',
                'E   It will be convenient for workers.',
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
              questionText: 'Which TWO aspects of the planned housing development have people given positive feedback about?',
              options: [
                'A   the facilities for cyclists',
                'B   the impact on the environment',
                'C   the encouragement of good relations between residents',
                'D   the low cost of all the accommodation',
                'E   the rural location',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   the facilities for cyclists',
                'B   the impact on the environment',
                'C   the encouragement of good relations between residents',
                'D   the low cost of all the accommodation',
                'E   the rural location',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 15–20  Label the map below.  Write the correct letter, A-I, next to Questions 15–20.',
          imageUrl: '', // admin: upload the housing development site map/plan image here
          questions: [
            { questionNumber: 15, type: 'map-labelling', questionText: 'School', correctAnswer: 'G' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'Sports centre', correctAnswer: 'C' },
            { questionNumber: 17, type: 'map-labelling', questionText: 'Clinic', correctAnswer: 'D' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'Community centre', correctAnswer: 'B' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'Supermarket', correctAnswer: 'H' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'Playground', correctAnswer: 'A' },
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
          instruction: 'Questions 21–24  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   Why do the students think the Laki eruption of 1783 is so important?',
              options: [
                'A   It was the most severe eruption in modern times.',
                'B   It led to the formal study of volcanoes.',
                'C   It had a profound effect on society.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   What surprised Adam about observations made at the time?',
              options: [
                'A   the number of places producing them',
                'B   the contradictions in them',
                'C   the lack of scientific data to support them',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   According to Michelle, what did the contemporary sources say about the Laki haze?',
              options: [
                'A   People thought it was similar to ordinary fog.',
                'B   It was associated with health issues.',
                'C   It completely blocked out the sun for weeks.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   Adam corrects Michelle when she claims that Benjamin Franklin',
              options: [
                'A   came to the wrong conclusion about the cause of the haze.',
                'B   was the first to identify the reason for the haze.',
                'C   supported the opinions of other observers about the haze.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 25 and 26  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 25, type: 'multi-answer-group',
              questionText: 'Which TWO issues following the Laki eruption surprised the students?',
              options: [
                'A   how widespread the effects were',
                'B   how long-lasting the effects were',
                'C   the number of deaths it caused',
                'D   the speed at which the volcanic ash cloud spread',
                'E   how people ignored the warning signs',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 26, type: 'multi-answer-group',
              questionText: 'Question 26',
              options: [
                'A   how widespread the effects were',
                'B   how long-lasting the effects were',
                'C   the number of deaths it caused',
                'D   the speed at which the volcanic ash cloud spread',
                'E   how people ignored the warning signs',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 27–30  What comment do the students make about the impact of the Laki eruption on the following countries? Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 27–30.',
          matchingOptionsTitle: 'Comments',
          matchingOptions: [
            'This country suffered the most severe loss of life.',
            'The impact on agriculture was predictable.',
            'There was a significant increase in deaths of young people.',
            'Animals suffered from a sickness.',
            'This country saw the highest rise in food prices in the world.',
            'It caused a particularly harsh winter.',
          ],
          questions: [
            { questionNumber: 27, type: 'matching-info', questionText: 'Iceland', correctAnswer: 'D' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Egypt', correctAnswer: 'A' },
            { questionNumber: 29, type: 'matching-info', questionText: 'UK', correctAnswer: 'C' },
            { questionNumber: 30, type: 'matching-info', questionText: 'USA', correctAnswer: 'F' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Pockets',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Pockets',
            lines: [
              'Reason for choice of subject',
              '●   They are __Q31__ but can be overlooked by consumers and designers.',
              "Pockets in men's clothes",
              '●   Men started to wear __Q32__ in the 18th century.',
              '●   A __Q33__ sewed pockets into the lining of the garments.',
              '●   The wearer could use the pockets for small items.',
              '●   Bigger pockets might be made for men who belonged to a certain type of __Q34__',
              "Pockets in women's clothes",
              "●   Women's pockets were less __Q35__ than men's.",
              '●   Women were very concerned about pickpockets.',
              '●   Pockets were produced in pairs using __Q36__ to link them together.',
              "●   Pockets hung from the women's __Q37__ under skirts and petticoats.",
              '●   Items such as __Q38__ could be reached through a gap in the material.',
              '●   Pockets, of various sizes, stayed inside clothing for many decades.',
              '●   When dresses changed shape, hidden pockets had a negative effect on the __Q39__ of women.',
              "●   Bags called 'pouches' became popular, before women carried a __Q40__",
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'convenient' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'suits' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'tailor' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'profession' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'visible' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'string/strings' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'waist/waists' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'perfume' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'image' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'handbag' },
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
