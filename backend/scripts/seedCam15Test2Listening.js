// One-off content seed — inserts "Cam 15 - Test 2" as a normal ListeningTest
// document so it shows up in admin's Đề Listening list exactly like every
// other hand-entered test (Cam 20, Actual Tests, ...): editable name,
// editable questions, and ready for the admin to attach the full-test audio
// and the Part 2 map image via the existing admin UI (the schema only
// supports one audio file per test, not per-part — same as all existing
// tests, so audio is left blank here for admin to upload).
//
// Run once: `node scripts/seedCam15Test2Listening.js` from backend/.
// Safe to re-run — skips if a test with this name already exists.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');

const TEST = {
  name: 'Cam 15 - Test 2',
  testNumber: 2,
  seriesName: 'Cam 15',
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
          groupTitle: '',
          instruction: 'Questions 1–4  Complete the table below.  Write ONE WORD ONLY for each answer.',
          tableConfig: {
            headers: ['Date', 'Type of event', 'Details'],
            rows: [
              ['17th', 'a concert', 'performers from Canada'],
              ['18th', 'a ballet', 'company called __Q1__'],
              ['19th–20th (afternoon)', 'a play', 'type of play: a comedy called Jemima has had a good __Q2__'],
              ['20th (evening)', 'a __Q3__ show', 'show is called __Q4__'],
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Eustatis' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'review' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'dance' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'Chat' },
          ],
        },
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 5–10  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: '',
            lines: [
              'Workshops',
              '●   Making __Q5__ food',
              '●   (children only) Making __Q6__',
              '●   (adults only) Making toys from __Q7__ using various tools',
              'Outdoor activities',
              '●   Swimming in the __Q8__',
              '●   Walking in the woods, led by an expert on __Q9__',
              "See the festival organiser's __Q10__ for more information",
            ],
          },
          questions: [
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'healthy' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'posters' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'wood' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'lake' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'insects' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'blog' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Minster Park',
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
              questionText: '11   The park was originally established',
              options: [
                'A   as an amenity provided by the city council.',
                'B   as land belonging to a private house.',
                'C   as a shared area set up by the local community.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   Why is there a statue of Diane Gosforth in the park?',
              options: [
                'A   She was a resident who helped to lead a campaign.',
                'B   She was a council member responsible for giving the public access.',
                'C   She was a senior worker at the park for many years.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   During the First World War, the park was mainly used for',
              options: [
                'A   exercises by troops.',
                'B   growing vegetables.',
                'C   public meetings.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   When did the physical transformation of the park begin?',
              options: [
                'A   2013',
                'B   2015',
                'C   2016',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 15–20  Label the map below.  Write the correct letter, A-I, next to Questions 15–20.',
          imageUrl: '', // admin: upload the Minster Park map/plan image here
          questions: [
            { questionNumber: 15, type: 'map-labelling', questionText: 'statue of Diane Gosforth', correctAnswer: 'E' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'wooden sculptures', correctAnswer: 'C' },
            { questionNumber: 17, type: 'map-labelling', questionText: 'playground', correctAnswer: 'B' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'maze', correctAnswer: 'A' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'tennis courts', correctAnswer: 'G' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'fitness area', correctAnswer: 'D' },
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
              questionText: 'Which TWO groups of people is the display primarily intended for?',
              options: [
                'A   student from the English department',
                'B   residents of the local area',
                "C   the university's teaching staff",
                'D   potential new students',
                'E   students from other departments',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   student from the English department',
                'B   residents of the local area',
                "C   the university's teaching staff",
                'D   potential new students',
                'E   students from other departments',
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
              questionText: "What are Cathy and Graham's TWO reasons for choosing the novelist Charles Dickens?",
              options: [
                'A   His speeches inspired others to try to improve society.',
                'B   He used his publications to draw attention to social problems.',
                'C   His novels are well-known now.',
                'D   He was consulted on a number of social issues.',
                'E   His reputation has changed in recent times.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   His speeches inspired others to try to improve society.',
                'B   He used his publications to draw attention to social problems.',
                'C   His novels are well-known now.',
                'D   He was consulted on a number of social issues.',
                'E   His reputation has changed in recent times.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  What topic do Cathy and Graham choose to illustrate with each novel? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.',
          matchingOptionsTitle: 'Topics',
          matchingOptions: [
            'poverty',
            'education',
            "Dickens's travels",
            'entertainment',
            'crime and the law',
            'wealth',
            'medicine',
            "a woman's life",
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'The Pickwick Papers', correctAnswer: 'G' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Oliver Twist', correctAnswer: 'B' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Nicholas Nickleby', correctAnswer: 'D' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Martin Chuzzlewit', correctAnswer: 'C' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Bleak House', correctAnswer: 'H' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Little Dorrit', correctAnswer: 'F' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Agricultural programme in Mozambique',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Agricultural programme in Mozambique',
            lines: [
              'How the programme was organised',
              '●   It focused on a dry and arid region in Chicualacuala district, near the Limpopo River.',
              '●   People depended on the forest to provide charcoal as a source of income.',
              '●   __Q31__ was seen as the main priority to ensure the supply of water.',
              "●   Most of the work organised by farmers' associations was done by __Q32__.",
              '●   Fenced areas created to keep animals away from crops.',
              '●   The programme provided',
              '○   __Q33__ for the fences',
              '○   __Q34__ for suitable crops',
              '○   water pumps.',
              '●   The farmers provided',
              '○   labour',
              '○   __Q35__ for the fences on their land.',
              'Further developments',
              '●   The marketing of produce was sometimes difficult due to lack of __Q36__.',
              '●   Training was therefore provided in methods of food __Q37__.',
              '●   Farmers made special places where __Q38__ could be kept.',
              '●   Local people later suggested keeping __Q39__.',
              'Evaluation and lessons learned',
              '●   Agricultural production increased, improving incomes and food security.',
              '●   Enough time must be allowed, particularly for the __Q40__ phase of the programme.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'Irrigation' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'women' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'wire/wires' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'seed/seeds' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'posts' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'transport' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'preservation' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'fish/fishes' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'bees' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'design' },
          ],
        },
      ],
    },
  ],
};

async function runSeed() {
  const existing = await ListeningTest.findOne({ name: TEST.name }).lean();
  if (existing) {
    console.log(`[SeedCam15Test2] "${TEST.name}" already exists (_id=${existing._id}) – skip`);
    return existing;
  }
  const doc = await ListeningTest.create(TEST);
  console.log(`[SeedCam15Test2] Inserted "${TEST.name}" (_id=${doc._id}, ${doc.totalQuestions} questions)`);
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
  })().catch(e => { console.error('[SeedCam15Test2] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TEST };
