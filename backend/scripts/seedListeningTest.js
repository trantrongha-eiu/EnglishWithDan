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
  name: 'Cam 16 - Test 1',
  testNumber: 1,
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
            title: "Children's Engineering Workshops",
            lines: [
              'Tiny Engineers (ages 4-5)',
              'Activities',
              '●   Create a cover for an __Q1__ so they can drop it from a height without breaking it.',
              '●   Take part in a competition to build the tallest __Q2__.',
              '●   Make a __Q3__ powered by a balloon.',
              'Junior Engineers (ages 6-8)',
              'Activities:',
              '●   Build model cars, trucks and __Q4__ and learn how to program them so they can move.',
              '●   Take part in a competition to build the longest __Q5__ using card and wood.',
              '●   Create a short __Q6__ with special software.',
              '●   Build, __Q7__ and program a humanoid robot.',
              'Cost for a five-week block: £50',
              'Held on __Q8__ from 10 am to 11 am',
              'Location',
              'Building 10A, __Q9__ Industrial Estate, Grasford',
              'Plenty of __Q10__ is available.',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'egg' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'tower' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'car' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'animals' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'bridge' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'movie/film' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'decorate' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'Wednesdays' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'Fradstone' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'parking' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: "Stevenson's",
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
              questionText: "11   Stevenson's was founded in",
              options: [
                'A   1923.',
                'B   1924.',
                'C   1926.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: "12   Originally, Stevenson's manufactured goods for",
              options: [
                'A   the healthcare industry.',
                'B   the automotive industry.',
                'C   the machine tools industry.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   What does the speaker say about the company premises?',
              options: [
                'A   The company has recently moved.',
                'B   The company has no plans to move.',
                'C   The company is going to move shortly.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   The programme for the work experience group includes',
              options: [
                'A   time to do research.',
                'B   meetings with a teacher.',
                'C   talks by staff.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: "Questions 15–20  Label the map below.  Write the correct letter, A-J, next to Questions 15–20.",
          imageUrl: '', // admin: upload the "Plan of Stevenson's site" map/plan image here
          questions: [
            { questionNumber: 15, type: 'map-labelling', questionText: 'coffee room', correctAnswer: 'H' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'warehouse', correctAnswer: 'C' },
            { questionNumber: 17, type: 'map-labelling', questionText: 'staff canteen', correctAnswer: 'G' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'meeting room', correctAnswer: 'B' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'human resources', correctAnswer: 'I' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'boardroom', correctAnswer: 'A' },
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
              questionText: 'Which TWO parts of the introductory stage to their art projects do Jess and Tom agree were useful?',
              options: [
                'A   the Bird Park visit',
                'B   the workshop sessions',
                'C   the Natural History Museum visit',
                'D   the projects done in previous years',
                'E   the handouts with research sources',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   the Bird Park visit',
                'B   the workshop sessions',
                'C   the Natural History Museum visit',
                'D   the projects done in previous years',
                'E   the handouts with research sources',
              ],
              correctAnswer: 'E',
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
              questionText: 'In which TWO ways do both Jess and Tom decide to change their proposals?',
              options: [
                'A   by giving a rationale for their action plans',
                'B   by being less specific about the outcome',
                'C   by adding a video diary presentation',
                'D   by providing a timeline and a mind map',
                'E   by making their notes more evaluative',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   by giving a rationale for their action plans',
                'B   by being less specific about the outcome',
                'C   by adding a video diary presentation',
                'D   by providing a timeline and a mind map',
                'E   by making their notes more evaluative',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  Which personal meaning do the students decide to give to each of the following pictures? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.',
          matchingOptionsTitle: 'Personal meanings',
          matchingOptions: [
            'a childhood memory',
            'hope for the future',
            'fast movement',
            'a potential threat',
            'the power of colour',
            'the continuity of life',
            'protection of nature',
            'a confused attitude to nature',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Falcon (Landseer)', correctAnswer: 'D' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Fish hawk (Audubon)', correctAnswer: 'C' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Kingfisher (van Gogh)', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Portrait of William Wells', correctAnswer: 'H' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Vairumati (Gauguin)', correctAnswer: 'F' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Portrait of Giovanni de Medici', correctAnswer: 'G' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Stoicism',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Stoicism',
            lines: [
              'Stoicism is still relevant today because of its __Q31__ appeal.',
              'Ancient Stoics',
              '●   Stoicism was founded over 2,000 years ago in Greece.',
              "●   The Stoics' ideas are surprisingly well known, despite not being intended for __Q32__",
              'Stoic principles',
              '●   Happiness could be achieved by leading a virtuous life.',
              '●   Controlling emotions was essential.',
              '●   Epictetus said that external events cannot be controlled but the __Q33__ people make in response can be controlled.',
              '●   A Stoic is someone who has a different view on experiences which others would consider as __Q34__.',
              'The influence of Stoicism',
              '●   George Washington organised a __Q35__ about Cato to motivate his men.',
              '●   The French artist Delacroix was a Stoic.',
              "●   Adam Smith's ideas on __Q36__ were influenced by Stoicism.",
              "●   Some of today's political leaders are inspired by the Stoics.",
              '●   Cognitive Behaviour Therapy (CBT)',
              '○   the treatment for __Q37__ is based on ideas from Stoicism',
              '○   people learn to base their thinking on __Q38__.',
              '●   In business, people benefit from Stoicism by identifying obstacles as __Q39__.',
              'Relevance of Stoicism',
              '●   It requires a lot of __Q40__ but Stoicism can help people to lead a good life.',
              '●   It teaches people that having a strong character is more important than anything else.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'practical' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'publication' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'choices' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'negative' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'play' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'capitalism' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'depression' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'logic' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'opportunity' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'practice/practise' },
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
