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
  name: 'Cam 18 - Test 3',
  testNumber: 3,
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
          instruction: 'Questions 1–4  Complete the form below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Wayside Camera Club membership form',
            lines: [
              'Name: Dan Green',
              'Email address: dan1068@market.com',
              'Home address: 52 __Q1__ Street, Peacetown',
              'Heard about us: from a __Q2__',
              'Reasons for joining: to enter competitions to __Q3__',
              'Type of membership: __Q4__ membership (£30)',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Marrowfield' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'relative' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'socialise/socialize' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'full' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 5–10  Complete the table below.  Write NO MORE THAN TWO WORDS for each answer.',
          tableConfig: {
            headers: ['Title of competition', 'Instructions', 'Feedback to Dan'],
            rows: [
              ["'__Q5__'", 'A scene in the home', "The picture's composition was not good."],
              ["'Beautiful Sunsets'", 'Scene must show some __Q6__', 'The __Q7__ was wrong.'],
              ["'__Q8__'", 'Scene must show __Q9__', 'The photograph was too __Q10__.'],
            ],
          },
          questions: [
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'Domestic Life' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'clouds' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'timing' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'Animal Magic' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'movement/animal movement' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'dark' },
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
              questionText: 'Which TWO warnings does Dan give about picking mushrooms?',
              options: [
                'A   Don\'t pick more than one variety of mushroom at a time.',
                "B   Don't pick mushrooms near busy roads.",
                "C   Don't eat mushrooms given to you.",
                "D   Don't eat mushrooms while picking them.",
                "E   Don't pick old mushrooms.",
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                "A   Don't pick more than one variety of mushroom at a time.",
                "B   Don't pick mushrooms near busy roads.",
                "C   Don't eat mushrooms given to you.",
                "D   Don't eat mushrooms while picking them.",
                "E   Don't pick old mushrooms.",
              ],
              correctAnswer: 'C',
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
              questionText: 'Which TWO ideas about wild mushrooms does Dan say are correct?',
              options: [
                'A   Mushrooms should always be peeled before eating.',
                'B   Mushrooms eaten by animals may be unsafe.',
                'C   Cooking destroys toxins in mushrooms.',
                'D   Brightly coloured mushrooms can be edible.',
                'E   All poisonous mushrooms have a bad smell.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   Mushrooms should always be peeled before eating.',
                'B   Mushrooms eaten by animals may be unsafe.',
                'C   Cooking destroys toxins in mushrooms.',
                'D   Brightly coloured mushrooms can be edible.',
                'E   All poisonous mushrooms have a bad smell.',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 15–20  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   What advice does Dan give about picking mushrooms in parks?',
              options: [
                'A   Choose wooded areas.',
                "B   Don't disturb wildlife.",
                'C   Get there early.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 16, type: 'multiple-choice',
              questionText: '16   Dan says it is a good idea for beginners to',
              options: [
                'A   use a mushroom app.',
                'B   join a group.',
                'C   take a reference book.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 17, type: 'multiple-choice',
              questionText: '17   What does Dan say is important for conservation?',
              options: [
                'A   selecting only fully grown mushrooms',
                'B   picking a limited amount of mushrooms',
                'C   avoiding areas where rare mushroom species grow',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 18, type: 'multiple-choice',
              questionText: '18   According to Dan, some varieties of wild mushrooms are in decline because there is',
              options: [
                'A   a huge demand for them from restaurants.',
                'B   a lack of rain in this part of the country.',
                'C   a rise in building developments locally.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 19, type: 'multiple-choice',
              questionText: '19   Dan says that when storing mushrooms, people should',
              options: [
                'A   keep them in the fridge for no more than two days.',
                'B   keep them in a brown bag in a dark room.',
                'C   leave them for a period after washing them.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 20, type: 'multiple-choice',
              questionText: '20   What does Dan say about trying new varieties of mushrooms?',
              options: [
                'A   Experiment with different recipes.',
                'B   Expect some to have a strong taste.',
                'C   Cook them for a long time.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    // Note: the source text repeated the header "Questions 21 and 22" for
    // both choose-two groups. Resolved against the unambiguous answer key
    // ("21&22" then "23&24") — the second group is really Questions 23-24.
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
              questionText: 'Which TWO opinions about the Luddites do the students express?',
              options: [
                'A   Their actions were ineffective.',
                'B   They are still influential today.',
                'C   They have received unfair criticism.',
                'D   They were proved right.',
                'E   Their attitude is understandable.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   Their actions were ineffective.',
                'B   They are still influential today.',
                'C   They have received unfair criticism.',
                'D   They were proved right.',
                'E   Their attitude is understandable.',
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
              questionText: 'Which TWO predictions about the future of work are the students doubtful about?',
              options: [
                'A   Work will be more rewarding.',
                'B   Unemployment will fall.',
                'C   People will want to delay retiring.',
                'D   Working hours will be shorter.',
                'E   People will change jobs more frequently.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   Work will be more rewarding.',
                'B   Unemployment will fall.',
                'C   People will want to delay retiring.',
                'D   Working hours will be shorter.',
                'E   People will change jobs more frequently.',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  What comment do the students make about each of the following jobs? Choose SIX answers from the box and write the correct letter, A-G, next to Questions 25–30.',
          matchingOptionsTitle: 'Comments',
          matchingOptions: [
            'These jobs are likely to be at risk.',
            'Their role has become more interesting in recent years.',
            'The number of people working in this sector has fallen dramatically.',
            'This job will require more qualifications.',
            'Higher disposable income has led to a huge increase in jobs.',
            'There is likely to be a significant rise in demand for this service.',
            'Both employment and productivity have risen.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Accountants', correctAnswer: 'G' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Hairdressers', correctAnswer: 'E' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Administrative staff', correctAnswer: 'B' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Agricultural workers', correctAnswer: 'C' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Care workers', correctAnswer: 'F' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Bank clerks', correctAnswer: 'A' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Space Traffic Management',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Space Traffic Management',
            lines: [
              'A Space Traffic Management system',
              '●   is a concept similar to Air Traffic Control, but for satellites rather than planes.',
              '●   would aim to set up legal and __Q31__ ways of improving safety.',
              '●   does not actually exist at present.',
              'Problems in developing effective Space Traffic Management',
              '●   Satellites are now quite __Q32__ and therefore more widespread (e.g. there are constellations made up of __Q33__ of satellites).',
              '●   At present, satellites are not required to transmit information to help with their __Q34__.',
              '●   There are few systems for __Q35__ satellites.',
              '●   Small pieces of debris may be difficult to identify.',
              '●   Operators may be unwilling to share details of satellites used for __Q36__ or commercial reasons.',
              "●   It may be hard to collect details of the object's __Q37__ at a given time.",
              '●   Scientists can only make a __Q38__ about where the satellite will go.',
              'Solutions',
              '●   Common standards should be agreed on for the presentation of information.',
              '●   The information should be combined in one __Q39__.',
              '●   A coordinated system must be designed to create __Q40__ in its users.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'technical' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'cheap' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'thousands' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'identification' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'tracking' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'military' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'location' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'prediction' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'database' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'trust' },
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
