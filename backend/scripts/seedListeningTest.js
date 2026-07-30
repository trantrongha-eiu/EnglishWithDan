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
  name: 'Cam 16 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 16',
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
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Holiday rental',
            lines: [
              "Owner's names: Jack Fitzgerald and Shirley Fitzgerald",
              'Granary Cottage',
              '●   available for week beginning __Q1__ May',
              '●   cost for the week: £__Q2__',
              '__Q3__ Cottage',
              '●   cost for the week: £480',
              '●   building was originally a __Q4__',
              '●   walk through doors from living room into a __Q5__',
              '●   several __Q6__ spaces at the front',
              '●   bathroom has a shower',
              '●   central heating and stove that burns __Q7__',
              '●   views of old __Q8__ from living room',
              '●   view of hilltop __Q9__ from the bedroom',
              'Payment',
              '●   deposit: £144',
              '●   deadline for final payment: end of __Q10__',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: '28th' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: '550' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'Chervil' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'garage' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'garden' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'parking' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'wood' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'bridge' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'monument' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'March' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Local council report on traffic and highways',
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
              questionText: "11   A survey found people's main concern about traffic in the area was",
              options: [
                'A   cuts to public transport.',
                'B   poor maintenance of roads.',
                'C   changes in the type of traffic.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   Which change will shortly be made to the cycle path next to the river?',
              options: [
                'A   It will be widened.',
                'B   It will be extended.',
                'C   It will be resurfaced.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   Plans for a pedestrian crossing have been postponed because',
              options: [
                'A   the Post Office has moved.',
                'B   the proposed location is unsafe.',
                'C   funding is not available at present.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   On Station Road, notices have been erected',
              options: [
                'A   telling cyclists not to leave their bikes outside the station ticket office.',
                'B   asking motorists to switch off engines when waiting at the level crossing.',
                'C   warning pedestrians to leave enough time when crossing the railway line.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 15–20  Label the map below.  Write the correct letter, A-I, next to Questions 15–20.',
          imageUrl: '', // admin: upload the "Recreation ground after proposed changes" map/plan image here
          questions: [
            { questionNumber: 15, type: 'map-labelling', questionText: 'New car park', correctAnswer: 'C' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'New cricket pitch', correctAnswer: 'F' },
            { questionNumber: 17, type: 'map-labelling', questionText: "Children's playground", correctAnswer: 'A' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'Skateboard ramp', correctAnswer: 'I' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'Pavilion', correctAnswer: 'E' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'Notice board', correctAnswer: 'H' },
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
              questionText: 'Which TWO benefits of city bike-sharing schemes do the students agree are the most important?',
              options: [
                'A   reducing noise pollution',
                'B   reducing traffic congestion',
                'C   improving air quality',
                'D   encouraging health and fitness',
                'E   making cycling affordable',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   reducing noise pollution',
                'B   reducing traffic congestion',
                'C   improving air quality',
                'D   encouraging health and fitness',
                'E   making cycling affordable',
              ],
              correctAnswer: 'C',
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
              questionText: 'Which TWO things do the students think are necessary for successful bike-sharing schemes?',
              options: [
                'A   Bikes should have a GPS system.',
                'B   The app should be easy to use.',
                'C   Public awareness should be raised.',
                'D   Only one scheme should be available.',
                'E   There should be a large network of cycle lanes.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   Bikes should have a GPS system.',
                'B   The app should be easy to use.',
                'C   Public awareness should be raised.',
                'D   Only one scheme should be available.',
                'E   There should be a large network of cycle lanes.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: "Questions 25–30  What is the speakers' opinion of the bike-sharing schemes in each of the following cities? Choose SIX answers from the box and write the correct letter, A-G, next to Questions 25–30.",
          matchingOptionsTitle: 'Opinion of bike-sharing scheme',
          matchingOptions: [
            'They agree it has been disappointing.',
            'They think it should be cheaper.',
            'They are surprised it has been so successful.',
            'They agree that more investment is required.',
            'They think the system has been well designed.',
            'They disagree about the reasons for its success.',
            'They think it has expanded too quickly.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Amsterdam', correctAnswer: 'C' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Dublin', correctAnswer: 'F' },
            { questionNumber: 27, type: 'matching-info', questionText: 'London', correctAnswer: 'D' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Buenos Aires', correctAnswer: 'E' },
            { questionNumber: 29, type: 'matching-info', questionText: 'New York', correctAnswer: 'B' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Sydney', correctAnswer: 'A' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'THE EXTINCTION OF THE DODO BIRD',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'THE EXTINCTION OF THE DODO BIRD',
            lines: [
              'The dodo was a large flightless bird which used to inhabit the island of Mauritius.',
              'History',
              '●   1507 - Portuguese ships transporting __Q31__ stopped at the island to collect food and water.',
              '●   1638 - The Dutch established a __Q32__ on the island.',
              '●   They killed the dodo birds for their meat.',
              '●   The last one was killed in 1681.',
              'Description',
              '●   The only record we have is written descriptions and pictures (possibly unreliable).',
              '●   A Dutch painting suggests the dodo was very __Q33__.',
              '●   The only remaining soft tissue is a dried __Q34__.',
              '●   Recent studies of a dodo skeleton suggest the birds were capable of rapid __Q35__.',
              "●   It's thought they were able to use their small wings to maintain __Q36__.",
              '●   Their __Q37__ was of average size.',
              '●   Their sense of __Q38__ enabled them to find food.',
              'Reasons for extinction',
              '●   Hunting was probably not the main cause.',
              '●   Sailors brought dogs and monkeys.',
              "●   __Q39__ also escaped onto the island and ate the birds' eggs.",
              '●   The arrival of farming meant the __Q40__ was destroyed.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'spice/spices' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'colony/settlement' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'fat' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'head' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'movement' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'balance/balancing' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'brain' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'smell' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'rats' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'forest' },
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
