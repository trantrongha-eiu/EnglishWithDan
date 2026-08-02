// Reading de 1-21, Test 3. NONE of this test's 3 passages existed in the DB
// (unlike Tests 1-2, where only Passage 3 was missing).
//
// IMPORTANT: unlike the Cambridge Listening/Reading seed scripts, this
// source PDF has no answer key anywhere in it. Every correctAnswer/
// explanation below was derived by reading the passage text directly and
// reasoning it out — there is no independent ground truth to check against.
// Treat this as a draft: spot-check before relying on it, especially the
// Passage 2 paragraph-matching questions (14-18), where the source PDF's
// two-column layout came through the text extractor interleaved/scrambled
// and had to be manually reconstructed.
//
// content is a placeholder with isActive:false — paste the real passage
// text via the admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'An important language development',
    category: 'passage1',
    content: placeholder('Test 3', 'Reading Passage 1', 'An important language development'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'Cuneiform tablets were produced in different shapes and sizes.', correctAnswer: 'TRUE', explanation: 'Tablets were "most often...palm-sized, rectangular" but "occasionally, larger tablets or cylinders were used" — different shapes and sizes.' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'When Sumerian writers marked on the clay tablets, the tablets were dry.', correctAnswer: 'FALSE', explanation: 'Writers "impress[ed] these lines into the wet clay" — the opposite of dry.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'Cuneiform was often difficult to read because of its size.', correctAnswer: 'TRUE', explanation: 'The signs "were often almost too small to see with the naked eye."' },
          { questionNumber: 4, type: 'true-false-ng', questionText: 'A number of languages adopted cuneiform.', correctAnswer: 'TRUE', explanation: 'Cuneiform "was used for the writing of at least a dozen languages."' },
          { questionNumber: 5, type: 'true-false-ng', questionText: 'Cuneiform signs can be found in some modern alphabets.', correctAnswer: 'NOT GIVEN', explanation: 'The passage only draws a comparison to how the Latin alphabet is used for multiple languages today — it never claims cuneiform signs appear within any modern alphabet.' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'The development and translation of cuneiform',
          lines: [
            'Before cuneiform',
            '●   tokens, for example __Q6__, were often used',
            '●   the first tokens were kept in containers made of __Q7__',
            '●   tokens were used as a __Q8__ for a transaction',
            'By 4th century BCE',
            '●   tokens were put in a container that looked like a clay __Q9__',
            'Complex, abstract symbols developed',
            '●   at first, signs looked like what they indicated, e.g. a __Q10__',
            '●   then signs became more abstract',
            '●   eventually, cuneiform signs shaped like __Q11__ were developed',
            '●   according to experts, cuneiform was mainly used for __Q12__',
            "19th-century translation of cuneiform inscriptions by Henry Rawlinson",
            '●   Rawlinson found cuneiform inscriptions in the Behistun mountains',
            '●   Rawlinson copied inscriptions onto __Q13__',
            '●   Rawlinson realised that each word of the inscriptions appeared in different languages',
            '●   when translated, Rawlinson found the writings were about a 5th-century BCE king',
          ],
        },
        questions: [
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'stones', explanation: 'Sumerians "might take small stones and use them as tokens."' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'cloth', explanation: 'Tokens "might then be placed in a cloth container."' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'receipt', explanation: 'The container was "provided to a buyer as a receipt for a transaction."' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'envelope', explanation: 'Tokens went into "a container resembling an envelope...now made of clay."' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'sheep', explanation: '"an image which resembled the drawing of a sheep meant just that."' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'triangles', explanation: 'The signs eventually "took the form of triangles, which became common cuneiform signs."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'accounting', explanation: '"most linguists and historians agree cuneiform developed primarily as a tool for accounting."' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'paper', explanation: 'Rawlinson "made impressions of the marks on large pieces of paper."' },
        ],
      },
    ],
  },
  {
    title: "Children's comprehension of television advertising",
    category: 'passage2',
    content: placeholder('Test 3', 'Reading Passage 2', "Children's comprehension of television advertising"),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H. NB You may use any letter more than once.',
        matchingReuseAllowed: true,
        questions: [
          { questionNumber: 14, type: 'matching-info', questionText: 'a description of recent innovations in TV broadcasting', correctAnswer: 'C', explanation: 'Paragraph C: channel numbers have "escalated with the diffusion of cable television and satellite technologies."' },
          { questionNumber: 15, type: 'matching-info', questionText: 'a mention of the main goods and services advertised to children', correctAnswer: 'D', explanation: 'Paragraph D: "80[%] of all advertising targeted at children falls within four product categories: toys, cereals, candies, and fast-food restaurants."' },
          { questionNumber: 16, type: 'matching-info', questionText: 'a reference to a current limitation on television advertising aimed at children', correctAnswer: 'G', explanation: 'Paragraph G: host-selling "is thus restricted in the US by the Federal Communications Commission during children\'s programs."' },
          { questionNumber: 17, type: 'matching-info', questionText: 'two techniques used to encourage children to watch TV commercials', correctAnswer: 'D', explanation: 'Paragraph D describes both "unique sound effects and rapidly moving images" and associating the product "with playfulness and happiness."' },
          { questionNumber: 18, type: 'matching-info', questionText: 'a type of advertisement that may make children believe the opposite of what is true', correctAnswer: 'E', explanation: 'Paragraph E: the "part of a balanced breakfast" disclaimer leaves children thinking "cereal alone is sufficient for a meal."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following statements (Questions 19-22) and the list of researchers below. Match each statement with the correct researcher(s), A-H.',
        matchingOptions: ['Kunkel', 'Kunkel et al', 'McNeal', 'Turow', 'Greer et al', 'Liebert et al', 'Palmer & McDowell', 'Geis'],
        questions: [
          { questionNumber: 19, type: 'matching-info', questionText: 'Ads often aim to teach children that a brand is fun rather than telling them about what is being sold.', correctAnswer: 'B', explanation: 'The playfulness/happiness strategy is cited to "(Kunkel et al, 1992)."' },
          { questionNumber: 20, type: 'matching-info', questionText: "Originally children's programmes were only broadcast when adults rarely watched TV.", correctAnswer: 'D', explanation: 'Children\'s programming was once limited to "Saturday mornings (Turow, 1981)."' },
          { questionNumber: 21, type: 'matching-info', questionText: 'Children have a significant impact on what adults buy.', correctAnswer: 'C', explanation: 'Children "influence $4190 billion in family purchases...(McNeal, 1998)."' },
          { questionNumber: 22, type: 'matching-info', questionText: 'Tests showed that children can follow information if simple words are used.', correctAnswer: 'F', explanation: 'Child-friendly language "more than doubled the proportion of children who understood the qualifying message (Liebert et al, 1977)."' },
        ],
      },
      {
        groupType: 'summary-completion',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        groupTitle: 'How very young children perceive commercials',
        summaryConfig: {
          text: 'Children below the age of 4 or 5 do not understand the difference between television programmes and commercials. In fact, these children often mistake an advertisement for a __Q23__ from the programme they are watching. This is despite the fact that children\'s TV programmes usually include announcements called __Q24__ to show that there is going to be a commercial break. The problem is made more difficult because of a technique called __Q25__ whereby a person or cartoon figure from the programme is used to sell a product during the commercial break. From the age of 4 or 5, children begin to realise that commercials are different from TV programmes: for example, they may recognise that advertisements are __Q26__ than actual TV programmes.',
        },
        questions: [
          { questionNumber: 23, type: 'fill-blank', questionText: 'Question 23', correctAnswer: 'scene', explanation: 'Young children explain commercials "as if they were a scene in the program itself."' },
          { questionNumber: 24, type: 'fill-blank', questionText: 'Question 24', correctAnswer: 'separators', explanation: 'The passage calls these announcements "separators."' },
          { questionNumber: 25, type: 'fill-blank', questionText: 'Question 25', correctAnswer: 'host-selling', explanation: 'Using a program character to sell a product "is known as host-selling."' },
          { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'shorter', explanation: 'Older children use the "perceptual" cue that "commercials are short and programs are long."' },
        ],
      },
    ],
  },
  {
    title: 'A New Voyage Round the World',
    category: 'passage3',
    content: placeholder('Test 3', 'Reading Passage 3', 'A New Voyage Round the World'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice',
            questionText: "Which of the following best summarizes the writer's point in the first paragraph?",
            options: ["A   Dampier's book does not fall into a single category.", 'B   Readers were not interested in books on the subject of travel.', "C   Today's readers do not appreciate the style of Dampier's writing.", 'D   Dampier sailed round the world more quickly than anyone before.'],
            correctAnswer: 'A',
            explanation: 'The book is described as "part travelogue, part historical record of the Caribbean pirates, part scientific treatise" — spanning multiple categories.',
          },
          {
            questionNumber: 28, type: 'multiple-choice',
            questionText: 'The writer refers to Swift and Defoe in order to',
            options: ["A   provide more information regarding Dampier's sources.", 'B   compare Dampier to two earlier writers.', "C   give an example of Dampier's influence.", "D   highlight two of Dampier's critics."],
            correctAnswer: 'C',
            explanation: "Dampier's account \"inspired [Swift and Defoe] to create two of the most famous books in the English language\" — evidence of his influence.",
          },
          {
            questionNumber: 29, type: 'multiple-choice',
            questionText: 'Dampier left the western coast of Australia because',
            options: ['A   he wanted to get to the north before Cook arrived.', 'B   he found the temperature there unpleasant.', 'C   he had problems with the crew.', 'D   he required medical attention.'],
            correctAnswer: 'B',
            explanation: 'He left "out of dislike for the cold of more southerly latitudes," described as "physical sensitivity."',
          },
          {
            questionNumber: 30, type: 'multiple-choice',
            questionText: 'What point does the writer make about Dampier in the second paragraph?',
            options: ['A   He could cope with physical hardship.', 'B   He was more adventurous explorer than Cook was.', 'C   He had a kinder personality than he is given credit for.', 'D   He was calm in a crisis.'],
            correctAnswer: 'A',
            explanation: 'He "endure[d] a never-ending plague of discomforts and ailments" and survived five weeks shipwrecked "without help."',
          },
          {
            questionNumber: 31, type: 'multiple-choice',
            questionText: "What information is given about Dampier's early life?",
            options: ['A   He had difficult relationship with the people looking after him.', 'B   He was different from other youths who went to sea.', 'C   He wanted to travel from a young age.', 'D   He came from a family of sailors.'],
            correctAnswer: 'C',
            explanation: "He showed \"very early inclinations to see the world\"; the passage explicitly says there was \"nothing...to set Dampier apart from the numerous other young boys\" sent to sea, ruling out B.",
          },
        ],
      },
      {
        groupType: 'summary-completion',
        instruction: 'Complete the summary below using the list of words, A-I, below.',
        groupTitle: 'The Text of A New Voyage Round the World',
        summaryConfig: {
          text: "The success of the book cannot solely be attributed to the originality of Dampier's __Q32__. Readers of the time were fascinated with his stories of the time he spent with outlaws and his colourful way of writing. It seems certain that Dampier worked on the book with a mystery __Q33__. Some aspects of A New Voyage Round the World are problematic: descriptions of __Q34__ were inserted into the account of Dampier's adventures in a way that distracted the reader. It seems that the responsibility for the final version of the book lies with the __Q35__.",
          wordBank: [
            { letter: 'A', word: 'detailed illustrations' },
            { letter: 'B', word: 'traveller' },
            { letter: 'C', word: 'nature' },
            { letter: 'D', word: 'editor' },
            { letter: 'E', word: 'writer' },
            { letter: 'F', word: 'scientific observations' },
            { letter: 'G', word: 'the crew' },
            { letter: 'H', word: 'artists' },
            { letter: 'I', word: 'plain language' },
          ],
        },
        questions: [
          { questionNumber: 32, type: 'sentence-completion', questionText: 'Question 32', correctAnswer: 'F', explanation: 'The book "would not have done so well purely on merits of Dampier\'s findings regarding meteorology and natural history" — his scientific observations.' },
          { questionNumber: 33, type: 'sentence-completion', questionText: 'Question 33', correctAnswer: 'E', explanation: 'Dampier "received help with the writing of the book" from "an unknown source."' },
          { questionNumber: 34, type: 'sentence-completion', questionText: 'Question 34', correctAnswer: 'C', explanation: 'His "observations about nature are sometimes roughly dropped into the narrative at very odd junctures."' },
          { questionNumber: 35, type: 'sentence-completion', questionText: 'Question 35', correctAnswer: 'D', explanation: 'James Knapton "was in charge of checking and revising Dampier\'s text" as editor.' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 36, type: 'yes-no-ng', questionText: 'Many people wrote biographies of Dampier as a result of personal contact with him.', correctAnswer: 'NO', explanation: 'One cited biographer, Anton Gill, wrote a "recent" portrait — centuries after Dampier\'s 1715 death, ruling out personal contact.' },
          { questionNumber: 37, type: 'yes-no-ng', questionText: 'Dampier was skilled at making money.', correctAnswer: 'NO', explanation: 'He "was not blessed in the art of wealth accumulation" and piracy "never netted him the treasure chest."' },
          { questionNumber: 38, type: 'yes-no-ng', questionText: "Dampier's patience was appreciated by his crew.", correctAnswer: 'NO', explanation: 'He is described as "hot-tempered and a weak leader of men" — not a patient figure admired by his crew.' },
          { questionNumber: 39, type: 'yes-no-ng', questionText: 'A New Voyage Round the World is longer than most modern books.', correctAnswer: 'NOT GIVEN', explanation: 'The passage never compares the book\'s length to modern books.' },
          { questionNumber: 40, type: 'yes-no-ng', questionText: "Dampier's accounts of bad weather are impressive.", correctAnswer: 'YES', explanation: 'The text has "some of the finest descriptions of storms in the English language."' },
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
      console.log(`[SeedReadingDe1to21Test3] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test3] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test3] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test3] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
