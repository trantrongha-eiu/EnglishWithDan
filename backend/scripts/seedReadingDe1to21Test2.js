// Reading de 1-21, Test 2.
// Passage 1 ("The Clipper Races...") and Passage 2 ("Orientation of birds")
// already exist in the DB (content + questions). This script only adds the
// missing Passage 3.
//
// content is a placeholder with isActive:false — paste the real passage
// text via the admin UI, then flip isActive to true. Question groups /
// answers / explanations are derived from the question pages (factual test
// structure + answer key), not from passage prose.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const PLACEHOLDER_CONTENT = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 2, Reading Passage 3: "The role of accidents in business"]';

const TARGET = {
  title: 'The role of accidents in business',
  category: 'passage3',
  content: PLACEHOLDER_CONTENT,
  questionRange: { start: 27, end: 40 },
  isActualTest: true,
  isActive: false,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
      questions: [
        {
          questionNumber: 27,
          type: 'yes-no-ng',
          questionText: 'The delay in the process used by the Kellogg brothers affected the final product.',
          correctAnswer: 'YES',
          explanation: 'Leaving the wheat untended for over 24 hours led directly to the rollers producing "flat flakes" instead of the usual long sheets.',
        },
        {
          questionNumber: 28,
          type: 'yes-no-ng',
          questionText: 'Sir Alan Hodgkin is an example of someone whose work proceeded in a logical and systematic way.',
          correctAnswer: 'NO',
          explanation: 'Hodgkin himself says his published papers convey "an impression of directedness and planning which does not at all coincide with the actual sequence of events" — i.e. the opposite of systematic.',
        },
        {
          questionNumber: 29,
          type: 'yes-no-ng',
          questionText: 'Daguerre is an exception to the general rule of innovation.',
          correctAnswer: 'NO',
          explanation: 'Daguerre is listed as one more instance of "the mistake that gave us cornflakes" repeating itself — an example of the rule, not an exception.',
        },
        {
          questionNumber: 30,
          type: 'yes-no-ng',
          questionText: 'The discovery of saccharin occurred by accident during drug research.',
          correctAnswer: 'YES',
          explanation: 'Saccharin was "the unintentional result of a medical scientist\'s work on a chemical treatment for gastric ulcers."',
        },
        {
          questionNumber: 31,
          type: 'yes-no-ng',
          questionText: "The company 3M should have supported Art Fry by funding his idea of Post-it Notes.",
          correctAnswer: 'NOT GIVEN',
          explanation: "The passage describes how Fry arrived at the idea but gives no indication of the writer's opinion on whether 3M should have funded it.",
        },
      ],
    },
    {
      groupType: 'sentence-endings',
      instruction: 'Complete each sentence with the correct ending, A-H, below.',
      endingsConfig: {
        endings: [
          { letter: 'A', text: 'can be found in unusual thoughts and chance events.' },
          { letter: 'B', text: 'can be taught in business schools.' },
          { letter: 'C', text: "has made a success from someone else's invention." },
          { letter: 'D', text: 'is designed to nurture differences.' },
          { letter: 'E', text: 'is unlikely to lead to creative innovation.' },
          { letter: 'F', text: 'says that all mistakes are the same.' },
          { letter: 'G', text: 'shows that businesses are good at either inventing or selling.' },
          { letter: 'H', text: 'suggests ways of increasing the number of mistakes.' },
        ],
      },
      questions: [
        {
          questionNumber: 32,
          type: 'sentence-completion',
          questionText: 'The usual business environment',
          correctAnswer: 'E',
          explanation: 'Big companies\' processes "eliminate random variation and mistakes"; accidents there "are called failures and are discouraged."',
        },
        {
          questionNumber: 33,
          type: 'sentence-completion',
          questionText: "Geroski and Markides's book",
          correctAnswer: 'G',
          explanation: 'Their research found companies skilled at innovation were usually not skilled at commercialisation, "and vice versa."',
        },
        {
          questionNumber: 34,
          type: 'sentence-completion',
          questionText: 'Microsoft is an example of a company which',
          correctAnswer: 'C',
          explanation: 'Consolidators "take clever ideas from other firms and turn them into mass-market items. Microsoft is a prime instance of this."',
        },
        {
          questionNumber: 35,
          type: 'sentence-completion',
          questionText: 'The origin of useful accidents',
          correctAnswer: 'A',
          explanation: 'Austin and Devin say accidents "come from unlikely mental associations such as memories and vague connections."',
        },
      ],
    },
    {
      groupType: 'plain',
      instruction: 'Choose the correct letter, A, B, C or D.',
      questions: [
        {
          questionNumber: 36,
          type: 'multiple-choice',
          questionText: "How do Austin and Devin advise companies to get out of the 'cone of expectation'?",
          options: [
            'A   by decreasing the number of company systems',
            'B   by forming teams of different types of people',
            'C   by hiring new and creative people',
            'D   by holding regular brainstorming meetings',
          ],
          correctAnswer: 'B',
          explanation: 'They advise "throwing together groups from diverse backgrounds, and combining ideas in unpredictable ways."',
        },
        {
          questionNumber: 37,
          type: 'multiple-choice',
          questionText: "In recommending 'counter-intuitive' thinking, what do Austin and Devin imply?",
          options: [
            'A   that failing at business is bad for staff morale',
            'B   that innovation cannot be planned for',
            'C   that most businesses should be devoted to avoiding mistakes',
            'D   that the cost of mistakes is an important consideration',
          ],
          correctAnswer: 'D',
          explanation: 'They note "the cost of accidents that do not prove valuable are often of concern to people in business" — explaining why the recommended thinking runs counter to normal practice.',
        },
        {
          questionNumber: 38,
          type: 'multiple-choice',
          questionText: 'The writer describes the Empire Lager disaster in order to show that',
          options: [
            'A   success can come out of a business failure.',
            'B   the majority of companies now value risk-taking.',
            'C   TV advertising works better on older people.',
            'D   young beer drinkers do not like a sweet taste.',
          ],
          correctAnswer: 'A',
          explanation: "Foster's used the Empire Lager failure to develop Pure Blonde, \"now ranked as Australia's fifth-largest beer brand.\"",
        },
        {
          questionNumber: 39,
          type: 'multiple-choice',
          questionText: 'Pure Blonde has been more successful than Empire Lager because',
          options: [
            'A   digital media other than TV were used.',
            'B   it was advertised under a different brand name.',
            'C   it was launched with very little advertising.',
            'D   the advertising budget was larger.',
          ],
          correctAnswer: 'C',
          explanation: 'Unlike Empire Lager, Pure Blonde had "almost no promotion" and sales came "more by word of mouth."',
        },
        {
          questionNumber: 40,
          type: 'multiple-choice',
          questionText: 'The writer concludes that creating a culture that learns from mistakes',
          options: [
            'A   brings short-term financial gains',
            'B   can be very difficult for some companies',
            'C   holds no risk for workers',
            'D   is a popular move with shareholders',
          ],
          correctAnswer: 'B',
          explanation: 'The writer says "this sort of transformation is never easy," and convincing staff and shareholders to tolerate failure "is a big thing to ask."',
        },
      ],
    },
  ],
};

async function runSeed() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET.title });
  if (!existing) {
    await Passage.create(TARGET);
    created++;
    console.log(`[SeedReadingDe1to21Test2] Created "${TARGET.title}" (content is a placeholder — paste real text via admin UI, then set isActive:true).`);
  } else {
    existing.questionGroups = TARGET.questionGroups;
    existing.questionRange = TARGET.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test2] Updated question groups for existing "${TARGET.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test2] Done. created=${created} updated=${updated}.`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test2] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGET };
