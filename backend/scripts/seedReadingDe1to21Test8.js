// Reading de 1-21, Test 8. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-7: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Katherine Mansfield',
    category: 'passage1',
    content: placeholder('Test 8', 'Reading Passage 1', 'Katherine Mansfield'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: "The name Katherine Mansfield, that appears on the writer's books, was exactly the same as her original name.", correctAnswer: 'FALSE', explanation: 'Her birth name was "Katherine Mansfield Beauchamp Murry" — "Katherine Mansfield" was a pen name.' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'Mansfield won a prize for a story she wrote for the High School Reporter.', correctAnswer: 'NOT GIVEN', explanation: 'Her stories were published there, but no prize is mentioned.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'How Pearl Button Was Kidnapped portrayed Maori people in a favorable way.', correctAnswer: 'TRUE', explanation: 'Maori people "were often portrayed in a sympathetic light in her later stories, such as How Pearl Button Was Kidnapped."' },
          { questionNumber: 4, type: 'true-false-ng', questionText: "When Mansfield was at Queen's College, she planned to be a professional writer.", correctAnswer: 'FALSE', explanation: 'At that time she believed she "would take up [the cello] professionally" — not writing.' },
          { questionNumber: 5, type: 'true-false-ng', questionText: "Mansfield was unpopular with the other students at Queen's College.", correctAnswer: 'FALSE', explanation: 'She "was appreciated amongst fellow students at Queen\'s for her lively and charismatic approach."' },
          { questionNumber: 6, type: 'true-false-ng', questionText: 'In London, Mansfield showed little interest in politics.', correctAnswer: 'TRUE', explanation: 'She "did not actively support the suffragette movement in the UK."' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        noteConfig: {
          title: "Katherine Mansfield's adult years",
          lines: [
            '●   __Q7__ - moved from England back to New Zealand',
            '●   first paid writing work was in a publication based in __Q8__',
            '●   her __Q9__ and the New Zealand way of life made her feel dissatisfied',
            '●   1908 - returned to London',
            '●   1911-1919 - Met John Middleton Murry in 1911',
            '●   __Q10__ prevented Mansfield and Murry from staying together in Paris',
            '●   spent time with distinguished __Q11__',
            '●   from 1916, tuberculosis restricted the time she spent in London',
            '●   1920 - her __Q12__ was consolidated when Bliss and Other Stories was published',
            '●   wrote several stories at "Villa Isola Bella"',
            "●   1923-1924 - Mansfield's __Q13__ published more of her works after her death",
          ],
        },
        questions: [
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: '1906', explanation: '"After finishing her schooling in England, she returned to her New Zealand home in 1906."' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'Australia', explanation: 'Her first paid work appeared "in Australia in a magazine called Native Comparison."' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'family', explanation: 'She "grew discontented with the provincial New Zealand lifestyle, and with her family."' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'bankruptcy', explanation: '"Their attempt to set up as writers in Paris was cut short by Murry\'s bankruptcy."' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'writers', explanation: 'She had "close contact with other well-known writers of the time such as DH Lawrence, Bertrand Russell and Aldous Huxley."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'reputation', explanation: '"The publication of Bliss and Other Stories...was to solidify Mansfield\'s reputation as a writer."' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'husband', explanation: '"Her husband, Murry, took on the task of editing and publishing her works" after her death.' },
        ],
      },
    ],
  },
  {
    title: 'Australian parrots and their adaptation to habitat change',
    category: 'passage2',
    content: placeholder('Test 8', 'Reading Passage 2', 'Australian parrots and their adaptation to habitat change'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 2 has ten paragraphs, A-J. Which paragraph contains the following information? Write the correct letter, A-J.',
        questions: [
          { questionNumber: 14, type: 'matching-info', questionText: 'An example of how one parrot species may survive at the expense of another', correctAnswer: 'I', explanation: 'On Kangaroo Island, galahs took nesting holes from black cockatoos, contributing to a cockatoo population collapse.' },
          { questionNumber: 15, type: 'matching-info', questionText: 'A description of how plants may adapt to attract birds', correctAnswer: 'F', explanation: 'Bird-pollinated flowers "are more often red," since "red is the most attractive colour to birds."' },
          { questionNumber: 16, type: 'matching-info', questionText: 'Example of two parrot species which benefited from changes to the environment', correctAnswer: 'G', explanation: 'The galah and corella "expanded their ranges" as forest clearing created grasslands they thrive in.' },
          { questionNumber: 17, type: 'matching-info', questionText: 'How the varied Australian landscape resulted in a great variety of parrot species', correctAnswer: 'D', explanation: 'Parrots "spread from ancestral forests through eucalypt woodlands to colonies [in] the central deserts...they diversified into a wide range of species."' },
          { questionNumber: 18, type: 'matching-info', questionText: 'A reason why most parrot species are native to the southern hemisphere', correctAnswer: 'C', explanation: 'Parrots "originated...on the ancient southern continent of Gondwana, before it broke up into the separate southern hemisphere continents."' },
          { questionNumber: 19, type: 'matching-info', questionText: 'An example of a parrot species which did not survive changes to its habitat', correctAnswer: 'H', explanation: 'Rainforest clearing is "probably responsible for the disappearance of the double-eyed fig parrot."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 20, type: 'multiple-choice', questionText: 'The writer believes that most parrot species',
            options: ['A   Moved from Africa and South America to Australia', 'B   Had ancestors in either Africa, Australia or South America', 'C   Had ancestors in a continent which later split up', 'D   Came from a continent now covered by water'],
            correctAnswer: 'C',
            explanation: 'Parrots "originated...on the ancient southern continent of Gondwana, before it broke up into the separate southern hemisphere continents we know today."',
          },
          {
            questionNumber: 21, type: 'multiple-choice', questionText: "What does the writer say about parrots' beaks?",
            options: ['A   They are longer than those of other birds', 'B   They are made of a unique material', 'C   They are used more efficiently than those of other species', 'D   They are specially adapted to suit the diet'],
            correctAnswer: 'D',
            explanation: "Beak size and shape \"are related to the type of food each species eats\" — long beaks for fruit seeds, broad/strong beaks for hard seeds.",
          },
          {
            questionNumber: 22, type: 'multiple-choice', questionText: 'Which of the following is NOT mentioned by the writer as a disadvantage of nesting boxes?',
            options: ['A   They cost too much', 'B   They need to be maintained', 'C   They provide only shelter, not food', 'D   There are too few of them'],
            correctAnswer: 'B',
            explanation: 'The passage says boxes "are not enough," "are expensive," and provide no "nectar, pollen and seeds" — but never mentions maintenance.',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        questions: [
          { questionNumber: 23, type: 'sentence-completion', questionText: 'There are 345 varieties of parrot in existence and, of these, ____ live in Australia.', correctAnswer: 'one-sixth', explanation: '"One-sixth of the world\'s 345 parrot species are found there."' },
          { questionNumber: 24, type: 'sentence-completion', questionText: 'As early as the ____, the mapmaker recognized that parrots lived in that part of the world.', correctAnswer: '16th century', explanation: '"In the 16th century, the German cartographer Mercator made a world map" naming a Land of Parrots near Australia.' },
          { questionNumber: 25, type: 'sentence-completion', questionText: 'The mapmaker referred to above was ____.', correctAnswer: 'Mercator', explanation: 'The cartographer named is "Mercator."' },
          { questionNumber: 26, type: 'sentence-completion', questionText: '____, the famous painter of animals and birds, commented on the size and beauty of the Australian parrot family.', correctAnswer: 'John Gould', explanation: '"The celebrated British naturalist and wildlife artist John Gould said: \'No group of birds gives Australia so tropical...an air.\'"' },
        ],
      },
    ],
  },
  {
    title: "When people are 'tone deaf' to music",
    category: 'passage3',
    content: placeholder('Test 8', 'Reading Passage 3', "When people are 'tone deaf' to music"),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice', questionText: 'What does the writer tell us about people with tone deafness (amusia) in the first paragraph?',
            options: ['A   They usually have hearing problems', 'B   Some can play a musical instrument very well', 'C   Some may be able to sing well-known melodies', 'D   They have several inabilities in regard to music'],
            correctAnswer: 'D',
            explanation: 'They "are unable to sing in tune...unable to discriminate between tones or recognize familiar melodies" — multiple distinct inabilities.',
          },
          {
            questionNumber: 28, type: 'multiple-choice', questionText: 'What is the writer doing in the second paragraph?',
            options: ['A   outlining some of the factors that cause amusia', 'B   summarising some findings about people with amusia', 'C   suggesting that people with amusia are disadvantaged', 'D   comparing the singing ability of amusics with their sense [of rhythm]'],
            correctAnswer: 'B',
            explanation: "The paragraph reports Dr. Peretz's research findings on pitch discrimination and rhythm performance.",
          },
          {
            questionNumber: 29, type: 'multiple-choice', questionText: 'What does the writer say about the relationship between language ability and musical ability?',
            options: ['A   People who are unable to speak can sometimes sing', 'B   People with amusia usually have language problems too', 'C   Speakers of tonal languages like Chinese rarely have amusia', 'D   People with amusia have difficulty recognizing people by their voices'],
            correctAnswer: 'A',
            explanation: '"People with brain damage in areas critical to language are often still able to sing, despite being unable to communicate through speech."',
          },
          {
            questionNumber: 30, type: 'multiple-choice', questionText: 'In the third paragraph, the writer notes that most amusics are able to',
            options: ['A   learn how to sing in tune', 'B   identify a song by its tune', 'C   distinguish a sad tone from a happy tune', 'D   recognise when a singer is not singing in tune'],
            correctAnswer: 'C',
            explanation: '"Amusics are also successful most of the time at detecting the mood of a melody."',
          },
          {
            questionNumber: 31, type: 'multiple-choice', questionText: 'What is the writer doing in the fourth paragraph?',
            options: ['A   claiming that amusics have problems in the auditory cortex', 'B   outlining progress in understanding the brains of amusics', 'C   proving that amusia is located in the temporal lobes', 'D   explaining why studies of hearing are difficult'],
            correctAnswer: 'B',
            explanation: 'The paragraph traces the research trail from temporal lobes, to temporal neocortex, to newer findings placing deficits "outside the auditory cortex."',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 32, type: 'yes-no-ng', questionText: "Peretz's research suggesting that amusia is a disorder is convincing.", correctAnswer: 'NO', explanation: 'The writer calls the brain-difference data "legitimate" but is explicitly "skeptical" that this makes amusia a disorder.' },
          { questionNumber: 33, type: 'yes-no-ng', questionText: 'People with musical ability are happier than those without this ability.', correctAnswer: 'NOT GIVEN', explanation: 'Happiness is never discussed in the passage.' },
          { questionNumber: 34, type: 'yes-no-ng', questionText: 'It is inappropriate to consider amusia as a real disorder.', correctAnswer: 'YES', explanation: 'The writer argues amusia is just "one end of the continuum of innate musical ability," no more a disability than "poor fashion sense or bad handwriting."' },
          { questionNumber: 35, type: 'yes-no-ng', questionText: 'People with amusia often have bad handwriting.', correctAnswer: 'NOT GIVEN', explanation: '"Bad handwriting" is used only as an illustrative comparison, not a claim about amusics themselves.' },
        ],
      },
      {
        groupType: 'sentence-endings',
        instruction: 'Complete each sentence with the correct ending, A-H, below.',
        endingsConfig: {
          endings: [
            { letter: 'A', text: 'an inability to hear when spoken language rises and falls.' },
            { letter: 'B', text: 'considered to be desirable.' },
            { letter: 'C', text: 'an inability to follow the beat of music.' },
            { letter: 'D', text: 'not a problem.' },
            { letter: 'E', text: 'not yet well understood.' },
            { letter: 'F', text: 'a result of injury to the mother.' },
            { letter: 'G', text: 'more marked than with other people.' },
            { letter: 'H', text: 'associated with intelligence.' },
          ],
        },
        questions: [
          { questionNumber: 36, type: 'sentence-completion', questionText: 'The reason why some people are born with amusia is', correctAnswer: 'E', explanation: 'Congenital amusia has no known cause — it "is not associated with any brain damage, hearing problems, or lack of exposure to music."' },
          { questionNumber: 37, type: 'sentence-completion', questionText: 'One of the difficulties amusics experience is', correctAnswer: 'C', explanation: 'Amusics "perform significantly worse at singing and tapping a rhythm along with a melody."' },
          { questionNumber: 38, type: 'sentence-completion', questionText: 'For amusics, discrimination of meaning in speech is', correctAnswer: 'D', explanation: 'Tonal-language speakers with amusia report no difficulty with intonation-based word meaning — "linguistic cues...make discrimination of meaning much easier."' },
          { questionNumber: 39, type: 'sentence-completion', questionText: 'Certain reactions in the brain of an amusic are', correctAnswer: 'G', explanation: 'For large tone changes, amusic brains "overreact, showing twice as much activity" compared to normal brains.' },
          { questionNumber: 40, type: 'sentence-completion', questionText: 'In most cultures, musical ability is', correctAnswer: 'B', explanation: '"Musical ability is culturally valued."' },
        ],
      },
    ],
  },
];

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test8] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test8] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test8] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test8] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
