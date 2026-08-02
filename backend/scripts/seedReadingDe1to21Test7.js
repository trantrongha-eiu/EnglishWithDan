// Reading de 1-21, Test 7. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-6: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review (Q26 in particular is a lower-confidence call — flagged
// below). content is a placeholder with isActive:false — paste real
// passage text via admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Answers Underground',
    category: 'passage1',
    content: placeholder('Test 7', 'Reading Passage 1', 'Answers Underground'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Look at the following issues (Questions 1-6) and the list of people and organisations below. Match each issue with the correct person or organization, A-F. NB You may use any letter more than once.',
        matchingReuseAllowed: true,
        matchingOptions: ['Scott Klara', 'Intergovernmental Panel on Climate Change', 'International Energy Agency', 'Klaus Lackner', 'David Hawkins', 'World Wide Fund for Nature Australia'],
        questions: [
          { questionNumber: 1, type: 'matching-info', questionText: 'The cost implications of fitting plants with the necessary equipment.', correctAnswer: 'D', explanation: 'Lackner "argues that it is too expensive to adapt existing plants to capture carbon dioxide."' },
          { questionNumber: 2, type: 'matching-info', questionText: 'The effects sequestration could have on sea creatures.', correctAnswer: 'E', explanation: 'Hawkins "warns that the carbon dioxide could radically alter the chemical balance in the ocean, with potentially harmful consequences for marine life."' },
          { questionNumber: 3, type: 'matching-info', questionText: 'The reasons why products such as oil and gas continue to be popular energy sources.', correctAnswer: 'D', explanation: 'Lackner points out "around 85% of the world\'s energy is derived from fossil fuels, the cheapest and most plentiful."' },
          { questionNumber: 4, type: 'matching-info', questionText: 'The need for industrialised countries to give aid to less wealthy countries.', correctAnswer: 'E', explanation: 'Hawkins argues "developed nations will have to provide assistance" to encourage developing nations to use sequestration.' },
          { questionNumber: 5, type: 'matching-info', questionText: 'The significant increase in carbon dioxide concentrations in the air over the last 100 years.', correctAnswer: 'A', explanation: '"Airborne carbon dioxide concentrations have risen by nearly a third, according to Scott Klara."' },
          { questionNumber: 6, type: 'matching-info', questionText: 'The potential for sequestration to harm human life.', correctAnswer: 'F', explanation: 'The World Wide Fund for Nature Australia warns "large volumes of carbon dioxide might escape and people become asphyxiated."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 1 has ten paragraphs, A-J. Which paragraph contains the following information? Write the correct letter, A-J.',
        questions: [
          { questionNumber: 7, type: 'matching-info', questionText: 'Examples of sequestration already in use in several parts of the world', correctAnswer: 'H', explanation: 'Paragraph H describes live projects "in western Canada" and "in the North Sea."' },
          { questionNumber: 8, type: 'matching-info', questionText: 'An example of putting carbon dioxide emissions to use in the food and beverage industry', correctAnswer: 'F', explanation: 'Paragraph F: captured emissions get sold "for various uses, including carbonating soft drinks."' },
          { questionNumber: 9, type: 'matching-info', questionText: 'Current examples of the environmental harm attributed to carbon dioxide in the air', correctAnswer: 'C', explanation: 'Paragraph C: rising CO2 levels are "believed to be the cause of rising temperatures and sea levels."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 10, type: 'true-false-ng', questionText: 'Both developing and developed nations have decided to investigate carbon dioxide sequestration.', correctAnswer: 'TRUE', explanation: '"Delegates from fourteen industrialised and developing countries agreed to engage in cooperative research."' },
          { questionNumber: 11, type: 'true-false-ng', questionText: 'A growing economy will use more power.', correctAnswer: 'TRUE', explanation: '"Increased energy consumption is a key to economic growth."' },
          { questionNumber: 12, type: 'true-false-ng', questionText: 'Capturing carbon dioxide has become financially attractive.', correctAnswer: 'FALSE', explanation: 'It "raises the cost of producing electricity by 30-80%" — the opposite of financially attractive.' },
          { questionNumber: 13, type: 'true-false-ng', questionText: 'More forests need to be planted to improve the atmosphere.', correctAnswer: 'NOT GIVEN', explanation: 'Forests are mentioned as existing natural carbon sinks, but planting more is never proposed.' },
        ],
      },
    ],
  },
  {
    title: 'Science and the Stradivarius',
    category: 'passage2',
    content: placeholder('Test 7', 'Reading Passage 2', 'Science and the Stradivarius'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-headings',
        instruction: 'Reading Passage 2 has nine paragraphs, A-I. Choose the correct heading for paragraphs A and C-I from the list of headings below. (Paragraph B has been done for you as an example: xii.)',
        headingsConfig: {
          headings: [
            { numeral: 'i', text: 'An analysis of protective coatings' },
            { numeral: 'ii', text: 'Applying technology to violin production' },
            { numeral: 'iii', text: 'Location – a key factor' },
            { numeral: 'iv', text: 'A controversial range of prices' },
            { numeral: 'v', text: 'Techniques of mass production' },
            { numeral: 'vi', text: 'The advantages of older wood' },
            { numeral: 'vii', text: 'A re-evaluation of documentary evidence' },
            { numeral: 'viii', text: 'The mathematical basis of earlier design' },
            { numeral: 'ix', text: 'Manual woodworking techniques' },
            { numeral: 'x', text: 'Preferences of top musicians' },
            { numeral: 'xi', text: 'The use of saturated wood' },
            { numeral: 'xii', text: 'The challenge for scientists' },
          ],
        },
        questions: [
          { questionNumber: 14, type: 'matching-headings', questionText: 'Paragraph A', correctAnswer: 'iv', explanation: 'Paragraph A contrasts million-pound Stradivari with sub-£100 modern violins, questioning whether that price gap is justified.' },
          { questionNumber: 15, type: 'matching-headings', questionText: 'Paragraph C', correctAnswer: 'ix', explanation: 'Paragraph C describes traditional makers testing wood and plates by hand — tapping, flexing, carving.' },
          { questionNumber: 16, type: 'matching-headings', questionText: 'Paragraph D', correctAnswer: 'ii', explanation: 'Paragraph D describes makers replacing manual testing with "controlled measurements" using glitter and loudspeakers.' },
          { questionNumber: 17, type: 'matching-headings', questionText: 'Paragraph E', correctAnswer: 'vii', explanation: 'Paragraph E notes there is "no historical data to support" the tuned-resonance theory — reassessing documentary evidence.' },
          { questionNumber: 18, type: 'matching-headings', questionText: 'Paragraph F', correctAnswer: 'vi', explanation: 'Paragraph F argues aged wood\'s lower internal damping "may...contribute to the improved quality of older instruments."' },
          { questionNumber: 19, type: 'matching-headings', questionText: 'Paragraph G', correctAnswer: 'i', explanation: 'Paragraph G examines the varnish (a protective coating) theory and finds "no convincing evidence" of a secret formula.' },
          { questionNumber: 20, type: 'matching-headings', questionText: 'Paragraph H', correctAnswer: 'xi', explanation: 'Paragraph H covers the theory that timber was soaked in water before seasoning.' },
          { questionNumber: 21, type: 'matching-headings', questionText: 'Paragraph I', correctAnswer: 'x', explanation: 'Paragraph I notes that "the foremost soloists...remain utterly unconvinced" by modern instruments.' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 22, type: 'true-false-ng', questionText: 'The quality of any particular note played on the same violin varies.', correctAnswer: 'TRUE', explanation: '"Individual notes on a single instrument sound different each time they are played."' },
          { questionNumber: 23, type: 'true-false-ng', questionText: 'Scientific instruments analyse complex sound more accurately than humans.', correctAnswer: 'FALSE', explanation: '"The ear is a supreme detection device, and a system has yet to be developed which can match the brain\'s...ability."' },
          { questionNumber: 24, type: 'true-false-ng', questionText: "The quality of handmade violins varies according to the musical ability of the craftsman.", correctAnswer: 'NOT GIVEN', explanation: "The passage discusses makers' wood-selection and carving skill, never their personal musical/playing ability." },
          { questionNumber: 25, type: 'true-false-ng', questionText: 'Modern violins seem to improve in their early years.', correctAnswer: 'TRUE', explanation: '"The quality of a modern instrument appears to improve in its first few years."' },
          { questionNumber: 26, type: 'true-false-ng', questionText: 'Modern violins are gaining in popularity amongst the top violinists.', correctAnswer: 'FALSE', explanation: '(Lower-confidence call — flag for review.) "The foremost soloists...remain utterly unconvinced," which argues against a growing-popularity trend.' },
        ],
      },
    ],
  },
  {
    title: 'Business Innovation',
    category: 'passage3',
    content: placeholder('Test 7', 'Reading Passage 3', 'Business Innovation'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 27, type: 'yes-no-ng', questionText: 'In order to stay in the market, companies today need to concentrate their efforts on finding genuinely original products.', correctAnswer: 'NO', explanation: 'Slywotsky says "big companies would do well to focus instead on making lots of small things better," not chasing rare breakthroughs.' },
          { questionNumber: 28, type: 'yes-no-ng', questionText: 'Disruptive innovations often pose serious threats to even successful, well-established companies.', correctAnswer: 'YES', explanation: 'Disruptive innovations "often herald the rapid downfall of thriving, long-standing businesses."' },
          { questionNumber: 29, type: 'yes-no-ng', questionText: "A key stage in the development of sustaining innovations involves research into the strengths and weaknesses of competitors' products.", correctAnswer: 'NOT GIVEN', explanation: 'Sustaining innovations are defined as improving "existing products for existing markets" — competitor research is never mentioned.' },
          { questionNumber: 30, type: 'yes-no-ng', questionText: 'Manufacturers today are able to compete with innovations over shorter time periods than in the past.', correctAnswer: 'YES', explanation: 'Rival products "can be rushed onto the market at speeds which would have been unimaginable" in Kodak\'s era.' },
          { questionNumber: 31, type: 'yes-no-ng', questionText: 'It is hard to tell what the long-term result of any innovation might be.', correctAnswer: 'YES', explanation: '"The ultimate outcome of any one innovation may still be unpredictable."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following points mentioned in the passage (Questions 32-35) and the list of people below. Match each point with the correct person, A-E.',
        matchingOptions: ['Bhaskar Chakravorti', 'Michael Hammer', 'William Baumol', 'Vijay Vishwanath', 'Erik Brynjolfsson'],
        questions: [
          { questionNumber: 32, type: 'matching-info', questionText: 'The need for companies to cater for ever more specialised sets of customers', correctAnswer: 'D', explanation: 'Vishwanath discusses "the ongoing fragmentation of markets" into "niches."' },
          { questionNumber: 33, type: 'matching-info', questionText: "An explanation for the recent upward trend in the US economy.", correctAnswer: 'E', explanation: "Brynjolfsson attributes \"the USA's productivity surge\" to a revolution in using information technology." },
          { questionNumber: 34, type: 'matching-info', questionText: 'An example of company personnel who resisted innovation', correctAnswer: 'B', explanation: 'Hammer describes a PC-maker whose manufacturing and marketing heads blocked a Dell-style system.' },
          { questionNumber: 35, type: 'matching-info', questionText: "A shift in the way many companies are organising their budgets", correctAnswer: 'C', explanation: 'Baumol notes companies "have both cut back and redirected their Research and Development spending."' },
        ],
      },
      {
        groupType: 'table',
        instruction: 'Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        tableConfig: {
          headers: ['Type of innovation', 'Definition', 'Example'],
          rows: [
            ['Operational innovations', 'Being innovative in the way existing business __Q36__ are carried out', 'Moving goods by system known as __Q37__ (Wal-Mart)'],
            ['__Q38__ innovations', 'Developing new approaches to meeting needs of existing markets', 'Giving customers means to manufacture products themselves (Tetra Pak)'],
            ['__Q39__ innovations', 'Identifying and meeting new types of customer needs', 'Offering customers __Q40__ to go with the main products (Air Liquide)'],
          ],
        },
        questions: [
          { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'processes', explanation: 'Operational innovations are described as "creativity in their business processes."' },
          { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'cross-docking', explanation: "Wal-Mart's \"pioneering idea of 'cross-docking'\" — shifting goods truck-to-truck." },
          { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'Strategic', explanation: 'Strategic innovations meet "existing demand in a new way" — e.g. Southwest Airlines, Tetra Pak.' },
          { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'Demand', explanation: 'Demand innovations work "by discovering new forms of demand," as Air Liquide did.' },
          { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'management services', explanation: 'Air Liquide became "a supplier not only of gas, but also of the management services to accompany it."' },
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
      console.log(`[SeedReadingDe1to21Test7] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test7] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test7] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test7] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
