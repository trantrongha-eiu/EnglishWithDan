// Reading de 1-21, Test 4. None of this test's 3 passages existed in the DB.
// Same caveat as Test 3: no answer key exists in the source PDF, so
// correctAnswer/explanation values were derived by reading the passage
// text directly — treat as a draft pending review, not verified ground
// truth. content is a placeholder with isActive:false — paste the real
// passage text via the admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Why good ideas fail',
    category: 'passage1',
    content: placeholder('Test 4', 'Reading Passage 1', 'Why good ideas fail'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'The TF NextStage stores planned to sell products to make life easier for older people.', correctAnswer: 'TRUE', explanation: 'TF targeted "consumers aged 60+ with devices and gadgets specifically designed to assist them with the problems associated with ageing."' },
          { questionNumber: 2, type: 'true-false-ng', questionText: "TF's market research indicated that people liked the products.", correctAnswer: 'TRUE', explanation: "TF's market research \"proved to be very positive, showing strong consumer support for the products.\"" },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'It cost more than expected to remodel the TF stores.', correctAnswer: 'NOT GIVEN', explanation: 'The $40 million remodel cost is stated but never compared to an original budget or expectation.' },
          { questionNumber: 4, type: 'true-false-ng', questionText: 'The TF NextStage coffee shops sold their own brand of food and drink.', correctAnswer: 'NOT GIVEN', explanation: 'The passage only says stores "featured a coffee shop to help increase traffic" — no detail on branding.' },
          { questionNumber: 5, type: 'true-false-ng', questionText: 'TF NextStage customers liked the atmosphere in the new stores.', correctAnswer: 'FALSE', explanation: 'Customers "complained that the new stores felt like a senior center and reminded them that they were growing old."' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        noteConfig: {
          title: 'Feedback from experts',
          lines: [
            'Donna Sturgess',
            'Problems with customer research:',
            "●   TF team limited their research to attitudes that occur at a __Q6__ level in customers' minds",
            "●   TF didn't consider customers' emotions",
            'How my company dealt with a similar problem: Product: Alli',
            '●   Use: help people achieve __Q7__',
            'Marketing aim: help customers see the product in a positive way by:',
            '-   giving the product a __Q8__ that seems helpful and supportive',
            '-   giving the product a reusable __Q9__',
            'Market research:',
            '●   does not need to be complex',
            '●   good information can come from interviews or studying the __Q10__ of consumers in the home',
            'Alex Lee',
            'Problem: customers are attracted to the ideal not the reality, e.g. ads for surf gear',
            'How my company dealt with a similar problem:',
            '●   we organized __Q11__ to find out what images customers associate with our products',
            '●   we do not call our products "helping tools" in our marketing campaigns',
            'Market research:',
            '●   can be basic, e.g. by doing __Q12__',
            '●   company executives should follow their __Q13__',
          ],
        },
        questions: [
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'surface', explanation: 'Sturgess says the TF team\'s executives "looked only at surface attitudes."' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'weight loss', explanation: 'Alli is "a drug to aid weight loss."' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'name', explanation: 'They "came up with a name that sounds like a helpful partner."' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'container', explanation: 'They aimed for "the container" to be reusable — "later be used to store diet guides and recipes."' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'behavior', explanation: '"ethnographical observation that involves going into people\'s houses to examine their behavior."' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'focus groups', explanation: 'Lee\'s company "conducted what are known as focus groups."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'surveys', explanation: 'They "conducted simple surveys in the lobby of our building offering free products."' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'instincts', explanation: '"the most important signals come from an executive\'s own instincts."' },
        ],
      },
    ],
  },
  {
    title: 'Keeping the water away',
    category: 'passage2',
    content: placeholder('Test 4', 'Reading Passage 2', 'Keeping the water away'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G.',
        questions: [
          { questionNumber: 14, type: 'matching-info', questionText: 'how legislation has forced building designers to improve water use', correctAnswer: 'F', explanation: 'Paragraph F: "Tough new rules for new developments mean that drains will be prevented from becoming overloaded."' },
          { questionNumber: 15, type: 'matching-info', questionText: 'two reasons why one river was isolated from its flood plain', correctAnswer: 'C', explanation: 'On the Rhine, "the aim was partly to improve navigation, and partly to speed floodwaters out of the Alps."' },
          { questionNumber: 16, type: 'matching-info', questionText: 'how natural water courses in the past assisted flood control', correctAnswer: 'B', explanation: 'Paragraph B: rivers that "took a winding path to the sea" once let "floodwaters lost force and volume while meandering."' },
          { questionNumber: 17, type: 'matching-info', questionText: 'an example of flood control on one river, affecting three countries', correctAnswer: 'D', explanation: "The restored Drava River protects towns \"in Austria, but as far downstream as Slovenia and Croatia.\"" },
          { questionNumber: 18, type: 'matching-info', questionText: 'a country which has partly destroyed one of its most typical features in order to control water', correctAnswer: 'E', explanation: 'The Dutch broke "one of their most enduring national stereotypes by allowing engineers to punch holes in dykes."' },
          { questionNumber: 19, type: 'matching-info', questionText: "the writer's comment on the comparative cost effectiveness of traditional flood control and newer methods", correctAnswer: 'G', explanation: 'On the LA scheme: "It may sound expensive, until we realise how much is spent trying to drain cities...and how little this method achieves."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose TWO letters, A-E. According to the article, which TWO of these statements are true of the new approach to flood control?',
        interchangeableAnswers: true,
        questions: [
          {
            questionNumber: 20, type: 'multi-answer-group', questionText: 'Which TWO of these statements are true of the new approach to flood control?',
            options: ['A   It aims to slow the movement of water to the sea.', 'B   It aims to channel water more directly into rivers.', 'C   It will cost more than twice as much as former measures.', 'D   It will involve the loss of some areas of land.', 'E   It has been tested only in The Netherlands.'],
            correctAnswer: 'A',
            explanation: 'The new approach aims "to sap the water\'s destructive strength" and, on the Drava, "slow down storm surges...by more than an hour."',
          },
          {
            questionNumber: 21, type: 'multi-answer-group', questionText: 'Question 21',
            options: ['A   It aims to slow the movement of water to the sea.', 'B   It aims to channel water more directly into rivers.', 'C   It will cost more than twice as much as former measures.', 'D   It will involve the loss of some areas of land.', 'E   It has been tested only in The Netherlands.'],
            correctAnswer: 'D',
            explanation: 'The Dutch plan to "return up to a sixth of the country to its former waterlogged state" — a loss of usable land.',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        questions: [
          { questionNumber: 22, type: 'sentence-completion', questionText: 'Some of the most severe floods for many centuries have recently occurred in parts of ____.', correctAnswer: 'central Europe', explanation: '"winter floods on the rivers of central Europe have been among the worst for 600 to 700 years."' },
          { questionNumber: 23, type: 'sentence-completion', questionText: 'The Rhine and the ____ rivers have experienced similar problems with water control.', correctAnswer: 'Mississippi', explanation: '"The same thing has happened in the US on the Mississippi river."' },
          { questionNumber: 24, type: 'sentence-completion', questionText: 'An area near Oxford will be flooded to protect the city of ____.', correctAnswer: 'London', explanation: '"To help keep London\'s feet dry, the UK Environment Agency is reflooding...the ancient flood plain of the River Thames outside Oxford."' },
          { questionNumber: 25, type: 'sentence-completion', questionText: 'Planners who wish to allow water to pass more freely through city surfaces are called ____.', correctAnswer: 'soft engineers', explanation: '"A new breed of \'soft engineers\' wants cities to become porous."' },
          { questionNumber: 26, type: 'sentence-completion', questionText: 'A proposal for part of the city of ____ could show how small-scale water projects could apply on a large scale.', correctAnswer: 'Los Angeles', explanation: 'The Sun Valley scheme in Los Angeles is described as the potential model for "a whole city."' },
        ],
      },
    ],
  },
  {
    title: "Australia's Megafauna Controversy",
    category: 'passage3',
    content: placeholder('Test 4', 'Reading Passage 3', "Australia's Megafauna Controversy"),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 27, type: 'yes-no-ng', questionText: 'Field and Wroe argue that findings at the Cuddie Springs site show that people lived in this area at the same time as megafauna.', correctAnswer: 'YES', explanation: 'Field and Wroe "claim that it provides unequivocal evidence of a long overlap of humans and megafauna."' },
          { questionNumber: 28, type: 'yes-no-ng', questionText: 'Field and Wroe believe it is likely that smaller megafauna species survived the last Ice Age.', correctAnswer: 'NOT GIVEN', explanation: 'The passage never discusses size-based survival differences among megafauna species.' },
          { questionNumber: 29, type: 'yes-no-ng', questionText: 'The writers believe that the dating of earth up to 1.7m below the present surface at Cuddie Springs is unreliable.', correctAnswer: 'YES', explanation: '(Lower-confidence call — flag for review.) The writers say "our analysis revealed a number of inconsistencies" in the age sequence of the sediment layers at that depth.' },
          { questionNumber: 30, type: 'yes-no-ng', questionText: 'Some artefacts found at Cuddie Springs were preserved well enough to reveal their function.', correctAnswer: 'YES', explanation: 'Some tools "show surface features indicating their use for processing plants" and others "have well-preserved blood and hair residues suggesting they were used in butchering animals."' },
        ],
      },
      {
        groupType: 'summary-completion',
        instruction: 'Complete the summary below using the list of words, A-I, below.',
        groupTitle: "The writers' arguments against Field and Wroe's analysis of the scientific data from Cuddie Springs",
        summaryConfig: {
          text: 'One objection to Field and Wroe\'s interpretation is the large quantity of charcoal, __Q31__ and artefacts found at Cuddie Springs. Such large numbers of artefacts would be impossible if the area had been covered with __Q32__ for a period. There is also a complete lack of man-made structures, for instance those used for __Q33__. Other evidence that casts doubt on Field and Wroe\'s claim is the fact that while some material in the highest levels of sediment is 36,000 years old, the __Q34__ in the same levels is much more recent. The tools used to process plants and animals may also be newer than Field and Wroe believe. Further evidence against human occupation of the area is the absence of tools and __Q35__ just a short distance away.',
          wordBank: [
            { letter: 'A', word: 'seeds' },
            { letter: 'B', word: 'stone' },
            { letter: 'C', word: 'sand' },
            { letter: 'D', word: 'cooking' },
            { letter: 'E', word: 'deep drill core' },
            { letter: 'F', word: 'water' },
            { letter: 'G', word: 'fossil bones' },
            { letter: 'H', word: 'sediment' },
            { letter: 'I', word: 'storage' },
          ],
        },
        questions: [
          { questionNumber: 31, type: 'sentence-completion', questionText: 'Question 31', correctAnswer: 'B', explanation: 'The site holds "more than 3 tonnes of charcoal and more than 300 tonnes of stone."' },
          { questionNumber: 32, type: 'sentence-completion', questionText: 'Question 32', correctAnswer: 'F', explanation: 'The artefact volume is "hard to reconcile with a site that was only available for occupation when the lake was dry" — i.e. covered with water otherwise.' },
          { questionNumber: 33, type: 'sentence-completion', questionText: 'Question 33', correctAnswer: 'D', explanation: '"no cultural features such as oven pits have been discovered."' },
          { questionNumber: 34, type: 'sentence-completion', questionText: 'Question 34', correctAnswer: 'C', explanation: '"sand in the two upper levels is considerably younger than charcoal from the same levels."' },
          { questionNumber: 35, type: 'sentence-completion', questionText: 'Question 35', correctAnswer: 'G', explanation: 'A nearby "deep drill core...recovered no stone artefacts or fossil bones whatsoever."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 36, type: 'multiple-choice',
            questionText: 'What conclusions did the writers reach about the inconsistencies in the data from Cuddie Springs?',
            options: ['A   The different layers of sediment have been mixed over time.', 'B   The sand evidence is unhelpful and should be disregarded.', 'C   The area needs to be re-examined when technology improves.', 'D   The charcoal found in the area cannot be dated.'],
            correctAnswer: 'A',
            explanation: '"These points suggest strongly that the sediments have been moved about and some of the old charcoal has been re-deposited in younger layers."',
          },
          {
            questionNumber: 37, type: 'multiple-choice',
            questionText: 'According to the writers, what impact could a natural phenomenon have had on this site?',
            options: ['A   Floods could have caused the death of the megafauna.', 'B   Floods could have disturbed the archaeological evidence.', 'C   Bushfires could have prevented humans from settling in the area for any length of time.', 'D   Bushfires could have destroyed much of the evidence left by megafauna and humans.'],
            correctAnswer: 'B',
            explanation: '"Flood events more likely explain the accumulation of megafauna remains, and could have mixed old bones with fresh deposits."',
          },
          {
            questionNumber: 38, type: 'multiple-choice',
            questionText: 'What did the writers speculate about the people who lived at this site in 1876?',
            options: ['A   They bred cattle whose bones could have been confused with megafauna.', 'B   They found that the soil was too waterlogged for farming.', 'C   They allowed cattle to move around freely at the site.', 'D   They brought stones there from another area.'],
            correctAnswer: 'D',
            explanation: 'The graziers likely lined the well "with small stones collected from further afield, including prehistoric quarries."',
          },
          {
            questionNumber: 39, type: 'multiple-choice',
            questionText: "In the final paragraph, what suggestion do the writers make about Australia's megafauna?",
            options: ['A   A rapid change in climate may have been responsible for the extinction of the megafauna.', 'B   Megafauna could have died out as a result of small numbers being killed year after year.', 'C   The population of humans at that time was probably insufficient to cause the extinction of the megafauna.', 'D   The extinction of ancient animals should not be compared to that of modern-day species.'],
            correctAnswer: 'B',
            explanation: 'A group of "10 people killing only one juvenile Diprotodon each year would be sufficient to bring about the extinction of that species within 1,000 years."',
          },
          {
            questionNumber: 40, type: 'multiple-choice',
            questionText: "Which of the following best represents the writer's criticism of Field and Wroe?",
            options: ['A   Their methods were not well thought out.', 'B   Their excavations did not go deep enough.', 'C   Their technology failed to obtain precise data.', 'D   Their conclusions were based on inconsistent data.'],
            correctAnswer: 'D',
            explanation: "The whole critique centers on internal inconsistencies in Field and Wroe's dated sediment sequence undermining their conclusions.",
          },
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
      console.log(`[SeedReadingDe1to21Test4] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test4] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test4] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test4] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
