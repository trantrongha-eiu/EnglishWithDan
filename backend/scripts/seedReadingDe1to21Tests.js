// Reading de 1-21, Tests 1-12 + 18 — merged from 13 separate one-off
// seedReadingDe1to21TestN.js scripts (each already run against the live DB;
// this file exists so re-running it, or reading it for reference, doesn't
// require hunting through 13 near-identical files). Each test keeps its own
// TARGET(S)_TN data and runSeedTN() exactly as originally written — only
// the shared requires/dotenv/connect-disconnect boilerplate and the final
// runner were consolidated. Run: node backend/scripts/seedReadingDe1to21Tests.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

// Reading de 1-21, Test 1.
// Passage 1 ("The development of the silk industry") and Passage 2 ("The
// discovery of a baby mammoth") were already entered by hand in the admin UI
// (content + questions + explanations all present) — this script only adds
// the missing Passage 3.
//
// content is intentionally left as a placeholder and isActive:false — the
// actual passage text must be pasted in via the admin UI (Passage source is
// a compiled practice-test PDF, not something to bulk-copy into the repo).
// Question groups / correct answers / explanations are derived directly
// from the question pages of that PDF (factual test structure + answer
// key), not from passage prose.

const PLACEHOLDER_CONTENT_T1 = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 1, Reading Passage 3: "What makes a musical expert?"]';

const TARGET_T1 = {
  title: 'What makes a musical expert?',
  category: 'passage3',
  content: PLACEHOLDER_CONTENT_T1,
  questionRange: { start: 27, end: 40 },
  isActualTest: true,
  isActive: false,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Choose the correct letter, A, B, C or D.',
      questions: [
        {
          questionNumber: 27,
          type: 'multiple-choice',
          questionText: "In the first paragraph, the writer suggests that a musician who is 'talented' is someone",
          options: [
            'A   who is aware of being set apart from other people.',
            'B   whose brain structure is unlike that of other people.',
            'C   who can perform extremely well in early childhood.',
            'D   whose essential skills are more varied than those of ordinary people.',
          ],
          correctAnswer: 'B',
          explanation: "The passage defines talent as \"something that originates in genetic structures\" and identifiable before exceptional performance — i.e. an innate difference in brain structure, not early performance (C) or broader skills (D).",
        },
        {
          questionNumber: 28,
          type: 'multiple-choice',
          questionText: 'According to the writer, what is unclear about the findings of Gottfried Schlaug?',
          options: [
            'A   Which part of the brain is linked to a particular musical skill.',
            'B   Which type of musical skill leads to the greatest change in the brain.',
            'C   Whether a feature of the brain is a cause or an effect of a musical skill.',
            'D   Whether the acquisition of a musical skill is easier for some people than others.',
          ],
          correctAnswer: 'C',
          explanation: "The writer says it's \"not clear if it [the planum temporale] starts out larger in people who eventually acquire AP, or if the acquisition of AP makes the planum increase in size\" — i.e. cause vs. effect is unresolved.",
        },
        {
          questionNumber: 29,
          type: 'multiple-choice',
          questionText: 'According to the writer, what has been established by studies of violin players?',
          options: [
            'A   Changes may occur in the brain following violin practice.',
            "B   Left-handed violinists have a different brain structure from other people.",
            "C   A violinist's hand size is not due to practice but to genetic factors.",
            'D   Violinists are born with brains that have a particular structure.',
          ],
          correctAnswer: 'A',
          explanation: 'The passage states the brain region controlling the left hand "increases in size as a result of practice" — a change caused by practice, not something present from birth.',
        },
        {
          questionNumber: 30,
          type: 'multiple-choice',
          questionText: 'According to the writer, findings on the amount of practice done by expert musicians suggest that',
          options: [
            'A   talent may have little to do with expertise.',
            'B   practice may actually prevent the development of talent.',
            'C   talent may not be recognised by teachers.',
            'D   expertise may be related to quality of instruction.',
          ],
          correctAnswer: 'A',
          explanation: 'The best students practiced most "irrespective of which \'talent\' group they had been assigned to, suggesting that practice does not merely correlate with achievement, but causes it" — pointing away from talent as the deciding factor.',
        },
      ],
    },
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
      questions: [
        {
          questionNumber: 31,
          type: 'yes-no-ng',
          questionText: "Anders Ericsson's work with cognitive psychology has influenced other researchers.",
          correctAnswer: 'NOT GIVEN',
          explanation: 'The passage describes how Ericsson approaches musical expertise via cognitive psychology, but never states that his work influenced other researchers.',
        },
        {
          questionNumber: 32,
          type: 'yes-no-ng',
          questionText: 'Different areas of expertise seem to have one specific thing in common.',
          correctAnswer: 'YES',
          explanation: 'The ten-thousand-hour figure "comes up again and again" across composers, ice skaters, chess players, etc. — a shared requirement across different fields.',
        },
        {
          questionNumber: 33,
          type: 'yes-no-ng',
          questionText: 'In order to be useful, practice must be carried out regularly every day.',
          correctAnswer: 'NOT GIVEN',
          explanation: 'The passage gives 20 hours/week as one possible example but never claims practice must happen daily to be effective.',
        },
        {
          questionNumber: 34,
          type: 'yes-no-ng',
          questionText: 'Anyone who practices for long enough can reach the level of a world-class expert.',
          correctAnswer: 'NO',
          explanation: 'The writer notes this "doesn\'t address why some people don\'t seem to get anywhere when they practice, and why some people get more out of their practice sessions than others" — contradicting the idea that practice alone guarantees expertise.',
        },
        {
          questionNumber: 35,
          type: 'yes-no-ng',
          questionText: "Occasionally, someone can become an expert at global level with fewer than 10,000 hours' practice.",
          correctAnswer: 'NO',
          explanation: 'The passage states "no-one has yet found a case in which true world-class expertise was accomplished in less time."',
        },
        {
          questionNumber: 36,
          type: 'yes-no-ng',
          questionText: 'Existing knowledge of learning and cognitive skills supports the importance of practice.',
          correctAnswer: 'YES',
          explanation: 'The writer states the ten-thousand-hour theory "is consistent with what we know about how the brain learns," since more practice creates stronger neural/memory traces.',
        },
      ],
    },
    {
      groupType: 'summary-completion',
      instruction: 'Complete the summary using the list of words, A-J, below.',
      groupTitle: 'Mozart',
      summaryConfig: {
        text: 'The case of Mozart could be quoted as evidence against the 10,000-hour-practice theory. However, the writer points out that the young Mozart received a lot of __Q37__ from his father, and that the symphony he wrote at the age of __Q38__ was not __Q39__ and may be of only academic interest. The case therefore supports the view that expertise is not solely the result of __Q40__ characteristics.',
        wordBank: [
          { letter: 'A', word: 'popular' },
          { letter: 'B', word: 'artistic' },
          { letter: 'C', word: 'completed' },
          { letter: 'D', word: 'eight' },
          { letter: 'E', word: 'tuition' },
          { letter: 'F', word: 'encouragement' },
          { letter: 'G', word: 'inherited' },
          { letter: 'H', word: 'four' },
          { letter: 'I', word: 'practice' },
          { letter: 'J', word: 'two' },
        ],
      },
      questions: [
        {
          questionNumber: 37,
          type: 'sentence-completion',
          questionText: 'Question 37',
          correctAnswer: 'E',
          explanation: "Mozart's father was \"an expert teacher... renowned as a teacher of musicians all over Europe\" — i.e. tuition.",
        },
        {
          questionNumber: 38,
          type: 'sentence-completion',
          questionText: 'Question 38',
          correctAnswer: 'D',
          explanation: '"Mozart didn\'t write it until he was eight," correcting the popular claim that he was four.',
        },
        {
          questionNumber: 39,
          type: 'sentence-completion',
          questionText: 'Question 39',
          correctAnswer: 'A',
          explanation: 'The passage says the early symphony "received little acclaim and was not performed very often" — i.e. not popular.',
        },
        {
          questionNumber: 40,
          type: 'sentence-completion',
          questionText: 'Question 40',
          correctAnswer: 'G',
          explanation: 'The writer concludes "inborn traits may not be the only cause" of Mozart\'s greatness — i.e. not solely inherited characteristics.',
        },
      ],
    },
  ],
};

async function runSeedT1() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET_T1.title });
  if (!existing) {
    await Passage.create(TARGET_T1);
    created++;
    console.log(`[SeedReadingDe1to21Test1] Created "${TARGET_T1.title}" (content is a placeholder — paste real text via admin UI, then set isActive:true).`);
  } else {
    existing.questionGroups = TARGET_T1.questionGroups;
    existing.questionRange = TARGET_T1.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test1] Updated question groups for existing "${TARGET_T1.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test1] Done. created=${created} updated=${updated}.`);
}


// Reading de 1-21, Test 2.
// Passage 1 ("The Clipper Races...") and Passage 2 ("Orientation of birds")
// already exist in the DB (content + questions). This script only adds the
// missing Passage 3.
//
// content is a placeholder with isActive:false — paste the real passage
// text via the admin UI, then flip isActive to true. Question groups /
// answers / explanations are derived from the question pages (factual test
// structure + answer key), not from passage prose.

const PLACEHOLDER_CONTENT_T2 = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 2, Reading Passage 3: "The role of accidents in business"]';

const TARGET_T2 = {
  title: 'The role of accidents in business',
  category: 'passage3',
  content: PLACEHOLDER_CONTENT_T2,
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

async function runSeedT2() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET_T2.title });
  if (!existing) {
    await Passage.create(TARGET_T2);
    created++;
    console.log(`[SeedReadingDe1to21Test2] Created "${TARGET_T2.title}" (content is a placeholder — paste real text via admin UI, then set isActive:true).`);
  } else {
    existing.questionGroups = TARGET_T2.questionGroups;
    existing.questionRange = TARGET_T2.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test2] Updated question groups for existing "${TARGET_T2.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test2] Done. created=${created} updated=${updated}.`);
}


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
// content is a placeholder_T3 with isActive:false — paste the real passage
// text via the admin UI, then flip isActive to true.

function placeholder_T3(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T3 = [
  {
    title: 'An important language development',
    category: 'passage1',
    content: placeholder_T3('Test 3', 'Reading Passage 1', 'An important language development'),
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
    content: placeholder_T3('Test 3', 'Reading Passage 2', "Children's comprehension of television advertising"),
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
    content: placeholder_T3('Test 3', 'Reading Passage 3', 'A New Voyage Round the World'),
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

async function runSeedT3() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T3) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test3] Created "${target.title}" (placeholder_T3 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test3] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test3] Done. created=${created} updated=${updated} (out of ${TARGETS_T3.length} targets).`);
}


// Reading de 1-21, Test 4. None of this test's 3 passages existed in the DB.
// Same caveat as Test 3: no answer key exists in the source PDF, so
// correctAnswer/explanation values were derived by reading the passage
// text directly — treat as a draft pending review, not verified ground
// truth. content is a placeholder_T4 with isActive:false — paste the real
// passage text via the admin UI, then flip isActive to true.

function placeholder_T4(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T4 = [
  {
    title: 'Why good ideas fail',
    category: 'passage1',
    content: placeholder_T4('Test 4', 'Reading Passage 1', 'Why good ideas fail'),
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
    content: placeholder_T4('Test 4', 'Reading Passage 2', 'Keeping the water away'),
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
    content: placeholder_T4('Test 4', 'Reading Passage 3', "Australia's Megafauna Controversy"),
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

async function runSeedT4() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T4) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test4] Created "${target.title}" (placeholder_T4 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test4] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test4] Done. created=${created} updated=${updated} (out of ${TARGETS_T4.length} targets).`);
}


// Reading de 1-21, Test 5. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-4: no answer key exists in the source PDF, so
// correctAnswer/explanation values were derived by reading the passage
// text directly — treat as a draft pending review. content is a
// placeholder_T5 with isActive:false — paste the real passage text via the
// admin UI, then flip isActive to true.

function placeholder_T5(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T5 = [
  {
    title: 'Caral: an ancient South American city',
    category: 'passage1',
    content: placeholder_T5('Test 5', 'Reading Passage 1', 'Caral: an ancient South American city'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'Caral was built at the same time as the construction of the Egyptian pyramids.', correctAnswer: 'TRUE', explanation: 'Caral "was a thriving metropolis when Egypt\'s great pyramids were still being built."' },
          { questionNumber: 2, type: 'true-false-ng', questionText: "The absence of pottery at the archaeological dig gave Shady a significant clue to the age of the site.", correctAnswer: 'TRUE', explanation: 'Not finding pottery remains "meant Caral could be what archaeologists term pre-ceramic" — a clue to its age.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'The stones used to build Piramide Mayor came from a location far away.', correctAnswer: 'FALSE', explanation: 'Workers "filled these bags with stones from a nearby quarry."' },
          { questionNumber: 4, type: 'true-false-ng', questionText: 'The huge and complicated structures of Piramide Mayor suggest that its construction required an organised team of builders.', correctAnswer: 'TRUE', explanation: '"Thousands of manual laborers would have been needed...not counting the many architects, craftsmen, and managers."' },
          { questionNumber: 5, type: 'true-false-ng', questionText: 'Archaeological evidence shows that the residents of Caral were highly skilled musicians.', correctAnswer: 'NOT GIVEN', explanation: 'Nearly 70 musical instruments were found and "music played an important role," but skill level is never assessed.' },
          { questionNumber: 6, type: 'true-false-ng', questionText: 'The remains of housing areas at Caral suggest that there were no class distinctions in residential areas.', correctAnswer: 'FALSE', explanation: 'The remains "indicate a hierarchy of living arrangements: large, well-kept rooms...for the elite...shabbier outlying dwellings for workers."' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Caral as a trading centre',
          lines: [
            'Items discovered at Caral but not naturally occurring in the area',
            '●   the __Q7__ of a certain plant',
            '●   __Q8__ used to make jewellery',
            '●   the remains of certain food such as __Q9__',
            'Clues to farming around Caral',
            '●   __Q10__ still in existence today indicate water diverted from rivers',
            '●   no evidence that __Q11__ was grown',
            'Evidence of relationship with fishing communities',
            '●   the excavation findings and fishing nets found on the coast suggest Caral farmers traded __Q12__',
            '●   dried squash may have been used to aid __Q13__ of fishing nets',
          ],
        },
        questions: [
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'seeds', explanation: 'Traders found "seeds of the cocoa bush," not native to the immediate area.' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'shells', explanation: '"necklaces of shells" were found, also not native to the area.' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'fish', explanation: '"bones of small edible fish, which must have come from the Pacific coast."' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'canals', explanation: 'Farmers "diverted the area\'s rivers into canals, which still cross the Supe Valley today."' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'maize', explanation: 'Shady "found no traces of maize."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'cotton', explanation: '"The farmers of Caral grew the cotton that the fishermen needed to make their nets."' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'flotation', explanation: 'Fishermen "probably used dried squash grown by the Caral people as flotation devices for their nets."' },
        ],
      },
    ],
  },
  {
    title: 'Should space be explored by robots or by humans?',
    category: 'passage2',
    content: placeholder_T5('Test 5', 'Reading Passage 2', 'Should space be explored by robots or by humans?'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-headings',
        instruction: 'Reading Passage 2 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below.',
        headingsConfig: {
          headings: [
            { numeral: 'i', text: 'Robots on Earth – a re-evaluation' },
            { numeral: 'ii', text: 'The barriers to cooperation in space exploration' },
            { numeral: 'iii', text: 'Some limitations of robots in space' },
            { numeral: 'iv', text: 'Reduced expectations for space exploration' },
            { numeral: 'v', text: 'A general reconsideration of human/robot responsibilities in space' },
            { numeral: 'vi', text: 'Problems in using humans for space exploration' },
            { numeral: 'vii', text: 'The danger to humans of intelligent machines' },
            { numeral: 'viii', text: 'Space settlement and the development of greater self-awareness' },
            { numeral: 'ix', text: 'Possible examples of cooperation in space' },
          ],
        },
        questions: [
          { questionNumber: 14, type: 'matching-headings', questionText: 'Paragraph A', correctAnswer: 'vi', explanation: 'Paragraph A lists the cost/complexity/safety downsides of putting humans in space — problems with using humans.' },
          { questionNumber: 15, type: 'matching-headings', questionText: 'Paragraph B', correctAnswer: 'iii', explanation: "Paragraph B covers what robots can't do well: react to unprepared situations, handle Mars's communication delay." },
          { questionNumber: 16, type: 'matching-headings', questionText: 'Paragraph C', correctAnswer: 'i', explanation: 'Paragraph C discusses revised, more modest expectations for AI/robots replacing human workers on Earth.' },
          { questionNumber: 17, type: 'matching-headings', questionText: 'Paragraph D', correctAnswer: 'v', explanation: 'Paragraph D: "the human-machine relationship must evolve towards a closer collaboration" in space.' },
          { questionNumber: 18, type: 'matching-headings', questionText: 'Paragraph E', correctAnswer: 'ix', explanation: 'Paragraph E gives concrete examples: the Mars Outposts approach, and humans in orbit controlling surface robots.' },
          { questionNumber: 19, type: 'matching-headings', questionText: 'Paragraph F', correctAnswer: 'viii', explanation: 'Paragraph F ties space colonisation to "a deep change in the views which humankind has of itself."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose TWO letters, A-E. According to the writer, which TWO predictions about artificial intelligence have not yet been fulfilled?',
        interchangeableAnswers: true,
        questions: [
          {
            questionNumber: 20, type: 'multi-answer-group', questionText: 'Which TWO predictions about artificial intelligence have not yet been fulfilled?',
            options: ['A   Robots will work independently of humans.', 'B   Robots will be used to help humans perform tasks more efficiently.', 'C   Robots will begin to oppose human interests.', 'D   Robots will think in the same way as humans.', 'E   Robots will become too costly to use on space missions.'],
            correctAnswer: 'A',
            explanation: 'Predictions of full automation/replacement are "being revised" — machines "cooperate with humans" rather than working independently.',
          },
          {
            questionNumber: 21, type: 'multi-answer-group', questionText: 'Question 21',
            options: ['A   Robots will work independently of humans.', 'B   Robots will be used to help humans perform tasks more efficiently.', 'C   Robots will begin to oppose human interests.', 'D   Robots will think in the same way as humans.', 'E   Robots will become too costly to use on space missions.'],
            correctAnswer: 'D',
            explanation: '"The construction of machines simulating human logical reasoning moves towards ever more distant dates."',
          },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Humans in space - the Mars Outposts approach and its implications',
          lines: [
            'One way of exploring space would be through collaboration between humans and robots. For example, when exploring the planet Mars, robots could be used to set up __Q22__ and do initial research before humans arrive.',
            'In other cases, humans could stay in orbiting __Q23__ and give orders to robots working on the surface of the planet. This would increase the speed of __Q24__ with the robots.',
            'In such ways, robots might be used to work in space in commercial enterprises or __Q25__. However, the final aim of humankind may be the __Q26__ of space and this could in turn change people\'s attitudes towards Earth.',
          ],
        },
        questions: [
          { questionNumber: 22, type: 'fill-blank', questionText: 'Question 22', correctAnswer: 'outposts', explanation: 'The "Mars Outposts approach" sends "robotic research stations to Mars" to prepare landing sites.' },
          { questionNumber: 23, type: 'fill-blank', questionText: 'Question 23', correctAnswer: 'spaceships', explanation: 'Robots "could be controlled by human beings located in spaceships which remain in orbit."' },
          { questionNumber: 24, type: 'fill-blank', questionText: 'Question 24', correctAnswer: 'communication', explanation: 'From orbit, "the link time for communication between humans and robots would be far less."' },
          { questionNumber: 25, type: 'fill-blank', questionText: 'Question 25', correctAnswer: 'laboratories', explanation: 'Paragraph F: space as "a place to build automatic laboratories or set up industrial enterprises."' },
          { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'colonisation', explanation: 'The aim "will be not just the exploration of space, but its colonisation."' },
        ],
      },
    ],
  },
  {
    title: 'The dark side of the technological boom',
    category: 'passage3',
    content: placeholder_T5('Test 5', 'Reading Passage 3', 'The dark side of the technological boom'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'sentence-endings',
        instruction: 'Complete each sentence with the correct ending, A-E, below.',
        endingsConfig: {
          endings: [
            { letter: 'A', text: 'requires more detailed study by psychologists.' },
            { letter: 'B', text: 'means people have no time to challenge the significance of the new technology.' },
            { letter: 'C', text: 'may reduce inventiveness and innovation.' },
            { letter: 'D', text: 'suggests computers will take over the workplace.' },
            { letter: 'E', text: 'results from increased electronic supervision.' },
          ],
        },
        questions: [
          { questionNumber: 27, type: 'sentence-completion', questionText: 'The speed of technological changes', correctAnswer: 'B', explanation: 'People are "too busy struggling to keep pace with ongoing innovations to question the implications."' },
          { questionNumber: 28, type: 'sentence-completion', questionText: 'A dependency on technology and computers', correctAnswer: 'C', explanation: "Brod warns over-reliance \"could also have serious repercussions on our ability to think creatively and develop new ideas.\"" },
          { questionNumber: 29, type: 'sentence-completion', questionText: 'A deterioration in personal service', correctAnswer: 'E', explanation: 'Service workers "curtly terminate attempts at idle conversation because their performance is being electronically monitored."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following statements (Questions 30-35) and the list of people below. Match each statement with the correct person or people, A, B, C or D. NB You may use any letter more than once.',
        matchingReuseAllowed: true,
        matchingOptions: ['Craig Brod', 'Daniel Dennett', 'Joseph Boyett and Henry Conn', 'Philip Nicholson'],
        questions: [
          { questionNumber: 30, type: 'matching-info', questionText: 'Technology has placed greater expectations on workers not to make mistakes.', correctAnswer: 'B', explanation: 'Dennett: the "obligation to make accurate predictions — the \'right\' decisions — becomes more onerous."' },
          { questionNumber: 31, type: 'matching-info', questionText: 'People will need time away from technology to reduce the frustrations caused by it.', correctAnswer: 'A', explanation: 'Brod: people "need complete isolation to recover from the effects of the technology."' },
          { questionNumber: 32, type: 'matching-info', questionText: 'Interacting with others at work contributes to creative thinking.', correctAnswer: 'A', explanation: "Brod warns against replacing \"informal gatherings for bouncing ideas off colleagues with electronic networking.\"" },
          { questionNumber: 33, type: 'matching-info', questionText: 'The psychological effect of working with technology is similar to the anxiety felt after surviving a major ordeal.', correctAnswer: 'D', explanation: 'Nicholson likens it "to symptoms of post-traumatic stress syndrome."' },
          { questionNumber: 34, type: 'matching-info', questionText: 'Technology will ultimately increase unemployment for more highly qualified personnel.', correctAnswer: 'C', explanation: 'Boyett and Conn predict skilled analysts "will be replaced by less skilled workers using \'intelligent\' software."' },
          { questionNumber: 35, type: 'matching-info', questionText: 'More counselling is required to help people cope with the demands of the modern workplace.', correctAnswer: 'D', explanation: 'Nicholson says "we need to provide psychological support systems" and founded a network on the topic.' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 3? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 36, type: 'true-false-ng', questionText: 'Our knowledge of the effects of technology on workers is still limited.', correctAnswer: 'TRUE', explanation: 'Exposure "has come too recently for psychologists to reach a consensus on its societal implications."' },
          { questionNumber: 37, type: 'true-false-ng', questionText: 'An early indicator of technological anxiety is a tendency to adopt machine-like thinking.', correctAnswer: 'TRUE', explanation: '"One of the first signs" is technostress, where people "internalize" machine "patterns" like "yes/no logic."' },
          { questionNumber: 38, type: 'true-false-ng', questionText: 'We have now started to doubt our ability to perform well at work.', correctAnswer: 'TRUE', explanation: 'Instead of feeling reassured, "we are tormented by the knowledge that the world of information is limitless."' },
          { questionNumber: 39, type: 'true-false-ng', questionText: 'Top level managers may be more negatively affected by changes created by the electronic workplace than junior workers.', correctAnswer: 'FALSE', explanation: 'For executives, "benefits...may outweigh the disadvantages," while lower-level workers face the harsher "isolated no-man\'s land" — the opposite of the statement.' },
          { questionNumber: 40, type: 'true-false-ng', questionText: 'Employees who learn to use new technology quickly will get promoted.', correctAnswer: 'NOT GIVEN', explanation: 'The passage never discusses promotion in connection with how fast someone adapts to new technology.' },
        ],
      },
    ],
  },
];

async function runSeedT5() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T5) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test5] Created "${target.title}" (placeholder_T5 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test5] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test5] Done. created=${created} updated=${updated} (out of ${TARGETS_T5.length} targets).`);
}


// Reading de 1-21, Test 6. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-5: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder_T6 with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.
//
// Note: Passage 2's source text has no printed title (Q26 asks the reader
// to pick the best title from 4 options), so a neutral working title was
// chosen for the DB record that doesn't give away the Q26 answer.

function placeholder_T6(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T6 = [
  {
    title: 'Developmental Tasks of Normal Adolescence',
    category: 'passage1',
    content: placeholder_T6('Test 6', 'Reading Passage 1', 'Developmental Tasks of Normal Adolescence'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Classify the following developments as characterising A early adolescence, B middle adolescence, or C late adolescence. Write the correct letter, A, B or C.',
        questions: [
          { questionNumber: 1, type: 'matching-info', questionText: 'becoming interested in people of the other gender', correctAnswer: 'B', explanation: '"mid-adolescents are body-conscious, and their concerns are directed towards their opposite-sexed peers."' },
          { questionNumber: 2, type: 'matching-info', questionText: 'beginning to choose a future career', correctAnswer: 'B', explanation: '"Mid-adolescents must identify, at least at a preliminary level, what their adult vocational goals are."' },
          { questionNumber: 3, type: 'matching-info', questionText: "needing to feel the same as one's friends", correctAnswer: 'A', explanation: '"Early adolescence is also a period of intense conformity to peers. \'Fitting in\'...seem somehow pressing to this age group."' },
          { questionNumber: 4, type: 'matching-info', questionText: 'beginning to form a self-image separate from the family context', correctAnswer: 'A', explanation: '"During the early adolescent years a young person begins to recognise their uniqueness and to establish themselves as separate individuals."' },
          { questionNumber: 5, type: 'matching-info', questionText: 'having less need for the good opinion of friends', correctAnswer: 'C', explanation: '"By late adolescence or early adulthood the need for peer approval has diminished."' },
          { questionNumber: 6, type: 'matching-info', questionText: 'exposing oneself to dangers', correctAnswer: 'B', explanation: '"Risk-taking may be a normal developmental process of middle adolescence."' },
        ],
      },
      {
        groupType: 'sentence-endings',
        instruction: 'Complete each sentence with the correct ending, A-E, below.',
        endingsConfig: {
          endings: [
            { letter: 'A', text: "reflects an adolescent's emerging self-perception." },
            { letter: 'B', text: 'cannot solve a problem without an example.' },
            { letter: 'C', text: 'is designed to become more challenging.' },
            { letter: 'D', text: 'formulates a personal set of moral beliefs and values.' },
            { letter: 'E', text: 'varies according to the individual.' },
          ],
        },
        questions: [
          { questionNumber: 7, type: 'sentence-completion', questionText: 'Havighurst proposed a set of tasks which', correctAnswer: 'A', explanation: 'The tasks "can also be seen as elements of the overall sense of self that adolescents carry with them."' },
          { questionNumber: 8, type: 'sentence-completion', questionText: 'A course of study at high school', correctAnswer: 'C', explanation: '"School curricula are frequently dominated by the inclusion of more abstract, demanding material."' },
          { questionNumber: 9, type: 'sentence-completion', questionText: 'The speed of development of thinking ability during adolescence', correctAnswer: 'E', explanation: '"Not all adolescents make the intellectual transition at the same rate."' },
          { questionNumber: 10, type: 'sentence-completion', questionText: 'Adolescence is a time when the young person', correctAnswer: 'D', explanation: 'The adolescent "restructures those beliefs into a personal ideology."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 11, type: 'true-false-ng', questionText: 'Most pre-adolescent children are capable of abstract thought.', correctAnswer: 'FALSE', explanation: '"Before adolescence, children\'s thinking is dominated by a concrete example...constrained to what is real and physical."' },
          { questionNumber: 12, type: 'true-false-ng', questionText: "Adolescents' limited skills with words may give a false impression of their ability.", correctAnswer: 'TRUE', explanation: '"As their conceptual development may outstrip their verbal development, adolescents may appear less competent than they really are."' },
          { questionNumber: 13, type: 'true-false-ng', questionText: 'Whether or not an adolescent is accepted by their age-group is an important clue to other aspects of their social adjustment.', correctAnswer: 'TRUE', explanation: 'Peer acceptance "is a major indicator of how well the adolescent will adjust in other areas of social and psychological development."' },
        ],
      },
    ],
  },
  {
    title: 'The relationship between bees and flowering plants',
    category: 'passage2',
    content: placeholder_T6('Test 6', 'Reading Passage 2', 'The relationship between bees and flowering plants'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-headings',
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs A, B, D, E and F from the list of headings below. (Paragraph C has been done for you as an example: vii.)',
        headingsConfig: {
          headings: [
            { numeral: 'i', text: 'Parallels between bee and human activities' },
            { numeral: 'ii', text: 'An evolutionary turning point' },
            { numeral: 'iii', text: 'A lack of total co-operation' },
            { numeral: 'iv', text: 'The preservation of individual plant species' },
            { numeral: 'v', text: 'The commercial value of bees' },
            { numeral: 'vi', text: 'The structure of flowering plants' },
            { numeral: 'vii', text: 'The pursuit of self-interest' },
            { numeral: 'viii', text: 'The need for further research' },
          ],
        },
        questions: [
          { questionNumber: 14, type: 'matching-headings', questionText: 'Paragraph A', correctAnswer: 'ii', explanation: 'Paragraph A describes hunting wasps evolving into bees — the origin point of the bee/flower relationship.' },
          { questionNumber: 15, type: 'matching-headings', questionText: 'Paragraph B', correctAnswer: 'v', explanation: 'Paragraph B gives the monetary value of bee-pollinated crops and honey.' },
          { questionNumber: 16, type: 'matching-headings', questionText: 'Paragraph D', correctAnswer: 'i', explanation: "Paragraph D compares bee/flower competition to Adam Smith's economic theory of human society." },
          { questionNumber: 17, type: 'matching-headings', questionText: 'Paragraph E', correctAnswer: 'iv', explanation: 'Paragraph E discusses bees pollinating scattered, individual rainforest tree species via "traplining."' },
          { questionNumber: 18, type: 'matching-headings', questionText: 'Paragraph F', correctAnswer: 'viii', explanation: 'Paragraph F ends: "We need to know much more about bees...before this question can be answered."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        questions: [
          { questionNumber: 19, type: 'sentence-completion', questionText: 'Hunting wasps used to feed on other ____, rather than on vegetation.', correctAnswer: 'insects', explanation: 'Wasps relied on pollen "as an alternative to insects" — their earlier food source.' },
          { questionNumber: 20, type: 'sentence-completion', questionText: 'Flowering plants started to reward bees with rich pollen and an additional food in the form of ____.', correctAnswer: 'nectar', explanation: 'Flowers provided "another source of nutrition, nectar."' },
          { questionNumber: 21, type: 'sentence-completion', questionText: 'Approximately ____ of human food production relies on the activity of bees.', correctAnswer: 'one third', explanation: '"around one third of our food is directly or indirectly dependent on the pollinating services of bees."' },
          { questionNumber: 22, type: 'sentence-completion', questionText: 'If the process of ____ is to take place effectively, bees need to travel from one flower to another before going back to the nest.', correctAnswer: 'cross-pollination', explanation: '"a species which depends on cross-pollination is on a knife-edge" — a satiated bee returns to the nest instead of visiting another flower.' },
          { questionNumber: 23, type: 'sentence-completion', questionText: 'Bees need to balance the ____ of each trip against the calorific rewards they obtain.', correctAnswer: 'energy costs', explanation: 'The bee must "juggle its energy costs so that it makes a calorific profit on each foraging trip."' },
          { questionNumber: 24, type: 'sentence-completion', questionText: 'There can be over 120 different ____ in an acre of rainforest.', correctAnswer: 'tree species', explanation: '"There may be more than 120 [tree species] per acre."' },
          { questionNumber: 25, type: 'sentence-completion', questionText: 'The bees that pollinate large forests regularly practise an activity known as ____.', correctAnswer: 'traplining', explanation: 'Bees that forage "along the same routes" practice what "is called \'traplining\'."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D. Which is the best title for Reading Passage 2?',
        questions: [
          {
            questionNumber: 26, type: 'multiple-choice', questionText: 'Which is the best title for Reading Passage 2?',
            options: ['A   The Ecological Importance of Bees', 'B   The Evolutionary History of Bees', 'C   The Social Behaviour of Bees', 'D   The Geographical Distribution of Bees'],
            correctAnswer: 'A',
            explanation: 'The passage covers pollination economics, plant/species conservation, and forest ecosystems — broader ecological importance, not just evolution, social behaviour, or geography.',
          },
        ],
      },
    ],
  },
  {
    title: 'A new stage in the study and teaching of history',
    category: 'passage3',
    content: placeholder_T6('Test 6', 'Reading Passage 3', 'A new stage in the study and teaching of history'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 3 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G. NB You may use any letter more than once.',
        matchingReuseAllowed: true,
        questions: [
          { questionNumber: 27, type: 'matching-info', questionText: 'an overview of the range of methods that have been used over time to document history', correctAnswer: 'C', explanation: 'Paragraph C traces oral culture → written records → printing → "audiotape" and "videodiscs."' },
          { questionNumber: 28, type: 'matching-info', questionText: 'the main reason why many historians are unwilling to use films in their work', correctAnswer: 'E', explanation: '"The profession is structured around the medium of the written word, and is somewhat insulated in its academic setting."' },
          { questionNumber: 29, type: 'matching-info', questionText: 'a reference to some differences between oral and written communication', correctAnswer: 'F', explanation: '"Oral communication is not limited to words: it also includes body language, expression and tone...Little of this is evident in a written transcript."' },
          { questionNumber: 30, type: 'matching-info', questionText: 'how most citizens today gain an understanding of history', correctAnswer: 'A', explanation: '"Film and video, especially as broadcast on television, are probably the major influence on the public\'s consciousness of history."' },
          { questionNumber: 31, type: 'matching-info', questionText: 'how current student events are sometimes captured for future audiences', correctAnswer: 'B', explanation: '"Many schools...produce video yearbooks."' },
          { questionNumber: 32, type: 'matching-info', questionText: 'mention of the fact that the advantages of film are greater than the disadvantages', correctAnswer: 'G', explanation: '"The many benefits of using moving images as historical evidence easily outweigh worries about cost, technical skills."' },
          { questionNumber: 33, type: 'matching-info', questionText: 'the claim that there is no official title for film-based historical work', correctAnswer: 'C', explanation: '"The use of moving images to record current events...does not even have a commonly agreed name."' },
          { questionNumber: 34, type: 'matching-info', questionText: 'reference to the active role the audience plays when watching films', correctAnswer: 'F', explanation: '"The viewer becomes involved in the process of interpreting and understanding history."' },
          { questionNumber: 35, type: 'matching-info', questionText: 'a list of requirements that historians see as obstacles to their use of film to record history', correctAnswer: 'E', explanation: 'Historians "rejected the training, the institutions, the motivations and the professional structures that would be needed."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 36, type: 'yes-no-ng', questionText: 'The needs of students in school have led to improvements in the teaching of history.', correctAnswer: 'NOT GIVEN', explanation: 'The passage never links student needs to improvements in history teaching methods.' },
          { questionNumber: 37, type: 'yes-no-ng', questionText: 'Academic and popular historians have different attitudes towards the value of innovations in communication.', correctAnswer: 'YES', explanation: 'There is "a growing gap between the practice of professional historians...and the practice of those aiming to popularise" history.' },
          { questionNumber: 38, type: 'yes-no-ng', questionText: 'It is common for historians to play a major role in creating historical documentaries for television.', correctAnswer: 'NO', explanation: '"Professional historians have tended to avoid involvement in television programmes about history."' },
          { questionNumber: 39, type: 'yes-no-ng', questionText: 'Articles in American History Review have explored aspects of modern history through popular films.', correctAnswer: 'YES', explanation: '"Journals such as American History Review have played a significant role" in research using broadly-circulated films as historical sources.' },
          { questionNumber: 40, type: 'yes-no-ng', questionText: 'Developments in technology are influencing a range of academic subjects.', correctAnswer: 'NOT GIVEN', explanation: 'The passage discusses only the discipline of history, never other academic subjects.' },
        ],
      },
    ],
  },
];

async function runSeedT6() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T6) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test6] Created "${target.title}" (placeholder_T6 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test6] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test6] Done. created=${created} updated=${updated} (out of ${TARGETS_T6.length} targets).`);
}


// Reading de 1-21, Test 7. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-6: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review (Q26 in particular is a lower-confidence call — flagged
// below). content is a placeholder_T7 with isActive:false — paste real
// passage text via admin UI, then flip isActive to true.

function placeholder_T7(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T7 = [
  {
    title: 'Answers Underground',
    category: 'passage1',
    content: placeholder_T7('Test 7', 'Reading Passage 1', 'Answers Underground'),
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
    content: placeholder_T7('Test 7', 'Reading Passage 2', 'Science and the Stradivarius'),
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
    content: placeholder_T7('Test 7', 'Reading Passage 3', 'Business Innovation'),
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

async function runSeedT7() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T7) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test7] Created "${target.title}" (placeholder_T7 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test7] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test7] Done. created=${created} updated=${updated} (out of ${TARGETS_T7.length} targets).`);
}


// Reading de 1-21, Test 8. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-7: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder_T8 with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.

function placeholder_T8(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T8 = [
  {
    title: 'Katherine Mansfield',
    category: 'passage1',
    content: placeholder_T8('Test 8', 'Reading Passage 1', 'Katherine Mansfield'),
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
    content: placeholder_T8('Test 8', 'Reading Passage 2', 'Australian parrots and their adaptation to habitat change'),
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
    content: placeholder_T8('Test 8', 'Reading Passage 3', "When people are 'tone deaf' to music"),
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

async function runSeedT8() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T8) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test8] Created "${target.title}" (placeholder_T8 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test8] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test8] Done. created=${created} updated=${updated} (out of ${TARGETS_T8.length} targets).`);
}


// Reading de 1-21, Test 9. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-8: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. Q10 in Passage 1 is a lower-confidence guess because the
// source note's structure was corrupted by the PDF text extraction — flag
// it for extra scrutiny. content is a placeholder_T9 with isActive:false —
// paste real passage text via admin UI, then flip isActive to true.

function placeholder_T9(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T9 = [
  {
    title: 'Ahead of its time',
    category: 'passage1',
    content: placeholder_T9('Test 9', 'Reading Passage 1', 'Ahead of its time'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'The Ruamahanga River often floods.', correctAnswer: 'TRUE', explanation: 'A "four-metre-high flood bank testifies to its natural tendency to flood."' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'When Tobin first found the object in the river, he mistook it for something else.', correctAnswer: 'TRUE', explanation: 'He "initially took [it] to be a whitish rock," then realised it was a bone.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'Tobin could not decide what part of the body the bone came from.', correctAnswer: 'FALSE', explanation: 'He clearly identified it: "he saw it was a skull."' },
          { questionNumber: 4, type: 'true-false-ng', questionText: "Tobin's mother was surprised that the skull caused debate among specialists.", correctAnswer: 'NOT GIVEN', explanation: "The mother's reaction to the specialists' debate is never described." },
        ],
      },
      {
        groupType: 'bullet-list',
        instruction: 'Complete the flow-chart below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        bulletConfig: {
          items: [
            'Tobin found a human skull.',
            'The __Q5__ were initially involved in trying to explain the presence of the skull.',
            'Dr Ferris believed the skull belonged to a female.',
            'Dr Koelmeyer suggested it was a __Q6__ skull.',
            "Dr Watt recommended __Q7__ to establish the skull's age.",
            'A bone __Q8__ was sent to the GNS.',
            'The age of the skull was about __Q9__ years.',
          ],
        },
        questions: [
          { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'police', explanation: '"The police were immediately called."' },
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'European', explanation: 'Dr Koelmeyer believed "the skull appeared to be European in origin."' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'radiocarbon dating', explanation: 'Dr Watt "proposed the use of radiocarbon dating to make sure it wasn\'t a recent death."' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'sample', explanation: 'GNS "was...provided with a sample of bone."' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: '296', explanation: 'The lab result: "conventional radiocarbon age approximately 296 years."' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: "Problem of the skull's origins",
          lines: [
            'Old bones common in NZ - Maori living there for 800 years',
            '●   Ruamahanga skull surprising because of its:',
            '   -   Age - __Q10__',
            '   -   Gender',
            'Mendana expedition',
            '●   Possible source of skull, but probably did not visit NZ',
            '●   Evidence of this expedition found elsewhere by __Q11__',
            'New Zealand',
            '●   First European explorer arrived in 1642',
            '●   Hagerty and Edgar arrived in 1806 from __Q12__ where they had been imprisoned',
            'Possible solution',
            '●   Ruamahanga skull may have reached NZ in the 17th century after a __Q13__.',
          ],
        },
        questions: [
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: '296', explanation: '(Lower-confidence — the source note structure was corrupted by PDF extraction.) The skull\'s dated age, "approximately 296 years," was the surprising figure — about 200 years older than initially estimated.' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'archaeologists', explanation: '"A team of archaeologists working in the Solomon Islands in 1970 did discover the remains of European vessels."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'Australia', explanation: 'Hagerty and Edgar had "escaped from prison in Australia."' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'shipwreck', explanation: 'The likely explanation: "a Spanish or Portuguese trading-ship was washed onto these wild shores as a result of a shipwreck."' },
        ],
      },
    ],
  },
  {
    title: 'The Tasmanian Tiger',
    category: 'passage2',
    content: placeholder_T9('Test 9', 'Reading Passage 2', 'The Tasmanian Tiger'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        questions: [
          { questionNumber: 14, type: 'sentence-completion', questionText: 'The thylacine was a dog-like animal which had a ____ coat and was carnivorous.', correctAnswer: 'striped', explanation: 'It was named "tiger" because "it had striped fur."' },
          { questionNumber: 15, type: 'sentence-completion', questionText: 'It was originally spread widely throughout the mainland of ____.', correctAnswer: 'Australia', explanation: '"Many types of thylacine roamed across Australia."' },
          { questionNumber: 16, type: 'sentence-completion', questionText: 'It started to disappear from that area around ____ ago because of climate change.', correctAnswer: '12 million years', explanation: '"When a period of climate change cooled Australia about 12 million years ago, the numbers of these ancient thylacines began to decline."' },
          { questionNumber: 17, type: 'sentence-completion', questionText: 'In the end, thylacines were found only on the island of ____.', correctAnswer: 'Tasmania', explanation: '"Tasmania...was then the last remaining place where thylacines existed."' },
          { questionNumber: 18, type: 'sentence-completion', questionText: 'Until the arrival of ____ with their farming practices, which brought about a drastic reduction in thylacine numbers.', correctAnswer: 'Europeans', explanation: '"Europeans with sheep, dogs and a great indifference to native flora and fauna...brought about their extinction."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following statements (Questions 19-24) and the list of people below. Match each statement with the correct person, A, B, C or D. NB You may use any letter more than once.',
        matchingReuseAllowed: true,
        matchingOptions: ['Hans Naarding', 'Randolph Rose', 'David Pemberton', 'Nick Mooney'],
        questions: [
          { questionNumber: 19, type: 'matching-info', questionText: 'There is no longer any hope of finding a surviving Tasmanian tiger.', correctAnswer: 'B', explanation: 'Rose is "now convinced that his dream will go unfulfilled" and says "the tiger is gone."' },
          { questionNumber: 20, type: 'matching-info', questionText: 'It would be preferable not to disturb any surviving Tasmanian tigers.', correctAnswer: 'A', explanation: 'Naarding says surviving thylacines "are better off right here [where] they are," and finding them would be "rather pointless."' },
          { questionNumber: 21, type: 'matching-info', questionText: 'Many who claim to have seen Tasmanian tigers are not objective witnesses.', correctAnswer: 'D', explanation: 'Mooney notes "many sincere seekers are victims of obsession" and describes "blind optimism."' },
          { questionNumber: 22, type: 'matching-info', questionText: 'Expert estimates of numbers needed to ensure species survival may be inaccurate.', correctAnswer: 'C', explanation: 'Pemberton cites the Florida panther surviving on "a dozen or so animals," against the usual survival-threshold assumption.' },
          { questionNumber: 23, type: 'matching-info', questionText: 'There is a great deal of international interest in Tasmanian tiger stories.', correctAnswer: 'A', explanation: 'Naarding was "besieged by television crews" from Japan, the UK, Germany, New Zealand and South America.' },
          { questionNumber: 24, type: 'matching-info', questionText: 'Some fresh evidence provided by a visitor to Tasmania seems credible.', correctAnswer: 'D', explanation: "Mooney found a tourist's photos \"one of the most convincing cases for the species' survival that he has seen.\"" },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 25, type: 'multiple-choice', questionText: "Has Naarding's sighting of a Tasmanian tiger resulted in",
            options: ['A   the capture of the tiger.', 'B   an extensive follow-up.', 'C   many other sightings.', 'D   the death of the tiger.'],
            correctAnswer: 'B',
            explanation: '"Government and private search parties combed the region, but no further sightings were made."',
          },
          {
            questionNumber: 26, type: 'multiple-choice', questionText: 'The example of coelacanth is used to show that',
            options: ['A   new animal species are still evolving.', 'B   animals can possess surprising physical characteristics.', 'C   species of sea animals can be saved from extinction.', 'D   opinions regarding extinction of animal species can be mistaken.'],
            correctAnswer: 'D',
            explanation: 'The coelacanth was "thought to have died out" until a live specimen turned up decades later — an extinction call that was wrong.',
          },
        ],
      },
    ],
  },
  {
    title: 'Yawning',
    category: 'passage3',
    content: placeholder_T9('Test 9', 'Reading Passage 3', 'Yawning'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'summary-completion',
        instruction: "Complete the summary below using the list of words, A-K, below.",
        groupTitle: "Provine's early findings on yawns",
        summaryConfig: {
          text: 'Through his observation of yawns, Provine was able to confirm that __Q27__ do not exist. Just like a __Q28__, yawns cannot be interrupted after they have begun. This is because yawns occur as a __Q29__ rather than a stimulus response as was previously thought. In measuring the time taken to yawn, Provine found that a typical yawn lasts about __Q30__. He also found that it is common for people to yawn a number of times in quick succession with the yawns usually being around __Q31__ apart. When studying whether length and rate were connected, Provine concluded that people who yawn less do not necessarily produce __Q32__ to make up for this.',
          wordBank: [
            { letter: 'A', word: 'form and function' },
            { letter: 'B', word: 'long yawns' },
            { letter: 'C', word: '3 seconds' },
            { letter: 'D', word: 'fixed action pattern' },
            { letter: 'E', word: '68 seconds' },
            { letter: 'F', word: 'short yawns' },
            { letter: 'G', word: 'reflex' },
            { letter: 'H', word: 'sneeze' },
            { letter: 'I', word: 'short duration' },
            { letter: 'J', word: '6 seconds' },
            { letter: 'K', word: 'half-yawns' },
          ],
        },
        questions: [
          { questionNumber: 27, type: 'sentence-completion', questionText: 'Question 27', correctAnswer: 'K', explanation: '"There are no half-yawns."' },
          { questionNumber: 28, type: 'sentence-completion', questionText: 'Question 28', correctAnswer: 'H', explanation: 'A yawn "progresses with the inevitability of a sneeze."' },
          { questionNumber: 29, type: 'sentence-completion', questionText: 'Question 29', correctAnswer: 'D', explanation: 'A yawn is "not a reflex" but "an excellent example of the instinctive \'fixed action pattern.\'"' },
          { questionNumber: 30, type: 'sentence-completion', questionText: 'Question 30', correctAnswer: 'J', explanation: '"The standard yawn runs its course over about six seconds on average."' },
          { questionNumber: 31, type: 'sentence-completion', questionText: 'Question 31', correctAnswer: 'E', explanation: 'The "inter-yawn interval...is generally about 68 seconds."' },
          { questionNumber: 32, type: 'sentence-completion', questionText: 'Question 32', correctAnswer: 'B', explanation: '"Producers of short or long yawns do not compensate by yawning more or less often" — no frequency/duration trade-off.' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 33, type: 'multiple-choice', questionText: "What did Provine conclude from his 'closed nose yawn' experiment?",
            options: ['A   Ending a yawn requires use of the nostrils.', 'B   You can yawn without breathing through your nose.', 'C   Breathing through the nose produces a silent yawn.', 'D   The role of the nose in yawning needs further investigation.'],
            correctAnswer: 'B',
            explanation: 'Subjects could do "perfectly normal closed nose yawns" — "the mouth provides a sufficient airway."',
          },
          {
            questionNumber: 34, type: 'multiple-choice', questionText: "Provine's 'clenched teeth yawn' experiment shows that",
            options: ['A   yawning is unconnected with fatigue.', 'B   a yawn is the equivalent of a deep intake of breath.', 'C   you have to be able to open your mouth wide to yawn.', 'D   breathing with the teeth together is as efficient as through the nose.'],
            correctAnswer: 'C',
            explanation: '"Gaping of the jaws is an essential component" — without it, "the program...will not run to completion."',
          },
          {
            questionNumber: 35, type: 'multiple-choice', questionText: 'The nose yawn experiment was used to test whether yawning',
            options: ['A   can be stopped after it has started.', 'B   is the result of motor programming.', 'C   involves both inhalation and exhalation.', 'D   can be accomplished only through the nose.'],
            correctAnswer: 'C',
            explanation: 'It found "yawning is impossible via nasal inhalation alone," while "exhalation...can be accomplished equally well through nose or mouth" — testing both phases.',
          },
          {
            questionNumber: 36, type: 'multiple-choice', questionText: 'In people paralyzed on one side because of brain damage',
            options: ['A   yawning may involve only one side of the face.', 'B   the yawning response indicates that recovery is likely.', 'C   movement in the paralysed arm is stimulated by yawning.', 'D   yawning can be used as an example to prevent muscle wasting.'],
            correctAnswer: 'C',
            explanation: 'When they yawn, "their otherwise paralyzed arm rises and flexes automatically."',
          },
          {
            questionNumber: 37, type: 'multiple-choice', questionText: 'In the last paragraph, the writer concludes that',
            options: ['A   yawning is a sign of boredom.', 'B   we yawn in spite of the development of our species.', 'C   yawning is a more passive activity than we imagine.', 'D   we are stimulated to yawn when our brain activity is low.'],
            correctAnswer: 'B',
            explanation: 'Yawning is "ancient and unconscious behavior...beneath the veneer of culture, rationality and language."',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 38, type: 'yes-no-ng', questionText: "Research students were initially reluctant to appreciate the value of Provine's studies.", correctAnswer: 'YES', explanation: 'It "was difficult for him to convince research students of the merits of \'yawning science.\'"' },
          { questionNumber: 39, type: 'yes-no-ng', questionText: 'When foetuses yawn and stretch they are learning how to control movement.', correctAnswer: 'NOT GIVEN', explanation: 'A link between foetal yawning and stretching is observed, but no claim is made that this teaches movement control.' },
          { questionNumber: 40, type: 'yes-no-ng', questionText: 'According to Provine, referring to only one function is probably inadequate to explain why people yawn.', correctAnswer: 'YES', explanation: 'Provine speculated "selecting a single function from the available options may be an unrealistic goal."' },
        ],
      },
    ],
  },
];

async function runSeedT9() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T9) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test9] Created "${target.title}" (placeholder_T9 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test9] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test9] Done. created=${created} updated=${updated} (out of ${TARGETS_T9.length} targets).`);
}


// Reading de 1-21, Test 10. Passage 2 ("The return of monkey life") already
// existed in the DB with content + questions — this script only adds the
// missing Passage 1 ("Koalas") and Passage 3 ("Personality and appearance").
// Same caveat as Tests 3-9: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder_T10 with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.

function placeholder_T10(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T10 = [
  {
    title: 'Koalas',
    category: 'passage1',
    content: placeholder_T10('Test 10', 'Reading Passage 1', 'Koalas'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 1, type: 'multiple-choice', questionText: 'Every year the greatest number of koalas dies',
            options: ['A   in captivity.', 'B   in bush fires.', 'C   on the roads.', 'D   at the hands of poachers.'],
            correctAnswer: 'C',
            explanation: '"The number one killer is cars — ironically most of them in wildlife sanctuaries."',
          },
          {
            questionNumber: 2, type: 'multiple-choice', questionText: "Which of the following enables the koala to fully digest its food?",
            options: ['A   having special bacteria in its stomach', 'B   drinking large amounts of liquid', 'C   remaining inactive for long periods', 'D   eating special eucalyptus leaves'],
            correctAnswer: 'C',
            explanation: '"To digest their food completely, koalas must sit still for 21 hours every day."',
          },
          {
            questionNumber: 3, type: 'multiple-choice', questionText: 'How does the koala usually react to danger?',
            options: ['A   by showing few obvious signs of anxiety', 'B   by gripping tightly for security', 'C   by biting its holder', 'D   by pretending to be dead'],
            correctAnswer: 'A',
            explanation: '"If you upset a koala, it may blink or swallow, or hiccup. But it is unlikely to attack."',
          },
          {
            questionNumber: 4, type: 'multiple-choice', questionText: 'In what way do some Australian zoos exploit the koala?',
            options: ["A   by making it the 'animal ambassador' of Australia", "B   by tampering with its natural diet", "C   by encouraging visitors to handle it", "D   by increasing its breeding rate"],
            correctAnswer: 'C',
            explanation: 'Zoos "charge visitors to be photographed hugging the furry bundles."',
          },
          {
            questionNumber: 5, type: 'multiple-choice', questionText: 'According to the writer, measures taken by the Australian government have',
            options: ['A   led to clear national guidelines for zoos.', 'B   led to the closure of some zoos.', 'C   persuaded the public to boycott zoos.', 'D   persuaded some zoos to change their policy.'],
            correctAnswer: 'D',
            explanation: '"Following government intervention, a number of...wildlife parks have stopped turning their koalas into photo opportunities."',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write YES if the statement agrees with the information, NO if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 6, type: 'true-false-ng', questionText: 'New coming human settlers caused danger to koalas.', correctAnswer: 'YES', explanation: 'Their problem "has been man — more specifically, settlers and their descendants."' },
          { questionNumber: 7, type: 'true-false-ng', questionText: 'Koalas can still be seen in most of the places in Australia.', correctAnswer: 'NO', explanation: 'Koalas "are found only in scattered pockets of southeast Australia."' },
          { questionNumber: 8, type: 'true-false-ng', questionText: 'It takes decades for the eucalyptus trees to recover after the fire.', correctAnswer: 'NO', explanation: 'The eucalyptus "grows quickly and is already budding forth after the fires."' },
          { questionNumber: 9, type: 'true-false-ng', questionText: 'Koalas will fight each other when food becomes scarce.', correctAnswer: 'NOT GIVEN', explanation: 'Fighting over scarce food is never mentioned.' },
          { questionNumber: 10, type: 'true-false-ng', questionText: 'It is not easy to notice that koalas are ill.', correctAnswer: 'YES', explanation: 'Koalas "put on a brave face until they are very ill" — a sudden weight loss is "usually the only warning."' },
          { questionNumber: 11, type: 'true-false-ng', questionText: 'Koalas are easily infected with human contagious disease via cuddling.', correctAnswer: 'NOT GIVEN', explanation: 'Only koala-specific illnesses (chlamydia, retrovirus) and handling-stress are discussed, not catching diseases from humans.' },
          { questionNumber: 12, type: 'true-false-ng', questionText: 'Koalas like to hold a person\'s arm when they are embraced.', correctAnswer: 'YES', explanation: 'Koalas "like to cling onto their handler...and use his or her arm as a tree."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 13, type: 'multiple-choice', questionText: 'In your opinion, this article was written by',
            options: ['A   a journalist who writes for a magazine.', 'B   a zoo keeper in London Zoo.', 'C   a tourist who was travelling back from Australia.', 'D   a government official who studies koalas to establish a law.'],
            correctAnswer: 'A',
            explanation: 'The broad, general-audience coverage of population decline, zoo practices, and policy — without a first-person zookeeper or tourist account — reads as journalistic writing for a general publication.',
          },
        ],
      },
    ],
  },
  {
    title: 'Personality and appearance',
    category: 'passage3',
    content: placeholder_T10('Test 10', 'Reading Passage 3', 'Personality and appearance'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 27, type: 'yes-no-ng', questionText: "Robert Fitzroy's first impression of Darwin was accurate.", correctAnswer: 'NO', explanation: 'Fitzroy judged Darwin\'s nose meant he lacked energy — "this was hardly the case."' },
          { questionNumber: 28, type: 'yes-no-ng', questionText: 'The precise rules of "physiognomy" have remained unchanged since the 18th century.', correctAnswer: 'NOT GIVEN', explanation: 'The passage traces physiognomy\'s changing reputation, but never describes its specific "rules" or whether those stayed fixed.' },
          { questionNumber: 29, type: 'yes-no-ng', questionText: 'The first impression of a person can be modified later with little effort.', correctAnswer: 'NO', explanation: 'Once formed, a snap judgement "is surprisingly hard to budge."' },
          { questionNumber: 30, type: 'yes-no-ng', questionText: 'People who appear capable are more likely to be chosen to a position of power.', correctAnswer: 'YES', explanation: '"Politicians with competent-looking faces have a greater chance of being elected."' },
          { questionNumber: 31, type: 'yes-no-ng', questionText: 'It is unfair for good-looking people to be better treated in society.', correctAnswer: 'NOT GIVEN', explanation: 'The "attractiveness halo" is described factually — the writer never makes a fairness judgement about it.' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 32, type: 'multiple-choice', questionText: "What's true about Anthony Little and David Perrett's experiment?",
            options: ['A   It is based on the belief that none of the conclusions in the Michigan experiment is accurate.', 'B   It supports parts of the conclusions in the Michigan experiment.', 'C   It replicates the study conditions in the Michigan experiment.', 'D   It has a greater range of faces than in the Michigan experiment.'],
            correctAnswer: 'B',
            explanation: 'They found a link "for extroversion and conscientiousness" — two of the three traits the Michigan study also found significant.',
          },
          {
            questionNumber: 33, type: 'multiple-choice', questionText: "What can be concluded from Justin Carre and Cheryl McCormick's experiment?",
            options: ['A   A wide-faced man may be more aggressive.', 'B   Aggressive men have a wide range of facial features.', 'C   There is no relation between facial features and an aggressive character.', "D   It's necessary for people to be aggressive in competitive games."],
            correctAnswer: 'A',
            explanation: 'A wider face "was linked in a statistically significant way with the number of penalty minutes a player was given for violent acts."',
          },
          {
            questionNumber: 34, type: 'multiple-choice', questionText: "What's exemplified by referring to butterfly marks?",
            options: ['A   Threats to safety are easy to notice.', 'B   Instinct does not necessarily lead to accurate judgment.', 'C   People should learn to distinguish between accountable and unaccountable judgments.', 'D   Different species have various ways to notice danger.'],
            correctAnswer: 'B',
            explanation: 'Eye spots trigger a fear instinct by mimicking real eyes even though no real threat exists — an inaccurate, "overgeneralised" reaction.',
          },
          {
            questionNumber: 35, type: 'multiple-choice', questionText: "What is the aim of Alexander Todorov's study?",
            options: ['A   to determine the correlation between facial features and social development', 'B   to undermine the belief that appearance is important', "C   to learn the influence of facial features on judgments of a person's personality", "D   to study the role of judgments in a person's relationship"],
            correctAnswer: 'C',
            explanation: "Todorov's theory \"explains our snap judgements of faces\" via perceived trustworthiness and dominance.",
          },
          {
            questionNumber: 36, type: 'multiple-choice', questionText: "Which of the following is the conclusion of Alexander Todorov's study?",
            options: ['A   People should draw accurate judgments from overgeneralization.', "B   Using appearance to determine a person's character is undependable.", "C   Overgeneralization can be misleading as a way to determine a person's character.", "D   The judgment of a person's character based on appearance may be accurate."],
            correctAnswer: 'C',
            explanation: 'Todorov frames judgements as "overgeneralisation," while stressing this "does not rule out...a kernel of truth" — a qualified "can be misleading," not a blanket claim.',
          },
        ],
      },
      {
        groupType: 'sentence-endings',
        instruction: 'Complete each sentence with the correct ending, A-F, below.',
        endingsConfig: {
          endings: [
            { letter: 'A', text: 'judge other people by overgeneralization.' },
            { letter: 'B', text: 'may influence the behaviour of other people.' },
            { letter: 'C', text: 'tend to commit criminal acts.' },
            { letter: 'D', text: 'may be influenced by the low expectations of other people.' },
            { letter: 'E', text: 'may show the effect of long-term behaviours.' },
            { letter: 'F', text: 'may be trying to repel the expectations of other people.' },
          ],
        },
        questions: [
          { questionNumber: 37, type: 'sentence-completion', questionText: 'Perrett believed people behaving dishonestly', correctAnswer: 'D', explanation: 'Self-fulfilling prophecy: "consistently treat someone as untrustworthy and they end up behaving that way."' },
          { questionNumber: 38, type: 'sentence-completion', questionText: 'The writer supports the view that people with babyish features', correctAnswer: 'C', explanation: 'Baby-faced men "are also more likely to be criminals."' },
          { questionNumber: 39, type: 'sentence-completion', questionText: 'According to Zebrowitz, baby-faced people who behave dominantly', correctAnswer: 'F', explanation: 'The "self-defeating prophecy effect": a baby-faced man "strives to confound expectations and ends up overcompensating."' },
          { questionNumber: 40, type: 'sentence-completion', questionText: 'The writer believes facial features', correctAnswer: 'E', explanation: '"Angry old people tend to look cross even when asked to strike a neutral expression" — a lifetime of scowling "left its mark."' },
        ],
      },
    ],
  },
];

async function runSeedT10() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T10) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test10] Created "${target.title}" (placeholder_T10 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test10] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test10] Done. created=${created} updated=${updated} (out of ${TARGETS_T10.length} targets).`);
}


// Reading de 1-21, Test 11. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-10: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder_T11 with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.

function placeholder_T11(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T11 = [
  {
    title: 'What Lucy Taught Us',
    category: 'passage1',
    content: placeholder_T11('Test 11', 'Reading Passage 1', 'What Lucy Taught Us'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'Donald Johanson was uncertain about the nature of the elbow bone he found in Afar.', correctAnswer: 'FALSE', explanation: '"Straight away, he recognized it as coming from the elbow of a human ancestor."' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'Several bones were found by Donald Johanson at the same site in Afar.', correctAnswer: 'TRUE', explanation: '"I saw bits of the skull, a chunk of jaw, a couple of vertebrae," says Johanson.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: 'The experts realized the importance of the discovery at Afar.', correctAnswer: 'TRUE', explanation: '"It was immediately obvious that the skeleton was a significant find."' },
          { questionNumber: 4, type: 'true-false-ng', questionText: 'It was the upper part of the skeleton that had suffered the least damage.', correctAnswer: 'NOT GIVEN', explanation: 'The passage says 40% was preserved but never specifies which part (upper/lower) was best preserved.' },
          { questionNumber: 5, type: 'true-false-ng', questionText: "The skeleton's measurements helped Johanson's team to decide if it was male or female.", correctAnswer: 'TRUE', explanation: '"The feeling was that the skeleton was female due to its size."' },
        ],
      },
      {
        groupType: 'note-form',
        instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Lucy',
          lines: [
            'Physical features',
            '●   jaws and skull like those of an ape',
            '●   braincase similar in size to that of a chimp',
            '●   long arms',
            'Movement',
            '●   the positioning and shape of her pelvis made it clear that she walked like a human',
            '●   upright movement possibly started among the __Q6__ of trees',
            '●   probably moved to the __Q7__ in search of food',
            'Diet and eating habits',
            '●   analysis of food in the __Q8__ of the skeletons of early humans shows changes in their diet',
            '●   it is likely that meat and grasses were substituted for __Q9__',
            '●   __Q10__ that were located close to Lucy suggest these were also part of her diet',
            '●   __Q11__ that were found had marks on them, possibly made by tools used for eating',
            'Comparisons with modern-day humans',
            '●   modern-day humans have a longer __Q12__ than Lucy did',
            "●   the __Q13__ of modern-day humans appear to develop later than Lucy's did",
          ],
        },
        questions: [
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'branches', explanation: 'Upright walking may have "evolved in the trees, as a way to walk along branches."' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'ground', explanation: '"Hunting for food may have been the real reason for heading to the ground."' },
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'teeth', explanation: '"Studies of remains of food trapped on preserved human teeth."' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'fruit', explanation: '"Instead of mostly eating fruit from trees, they began to include grasses and possibly meat."' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'eggs', explanation: '"Fossilised crocodile and turtle eggs were found near her skeleton."' },
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'bones', explanation: '"Archaeologists uncovered animal bones with scratches that seem to have been made by stone tools."' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'childhood', explanation: "\"Lucy's childhood was much briefer than ours.\"" },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'brains', explanation: 'A study "suggested that their brains matured much earlier than ours do."' },
        ],
      },
    ],
  },
  {
    title: "The gender gap in New Zealand's high school examination results",
    category: 'passage2',
    content: placeholder_T11('Test 11', 'Reading Passage 2', "The gender gap in New Zealand's high school examination results"),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        questions: [
          { questionNumber: 14, type: 'sentence-completion', questionText: 'New Zealand are worried at the outcomes of their high school assessment system, because the ____ of girls are higher than those of boys by 10%.', correctAnswer: 'pass rates', explanation: '"The difference in pass rates between the sexes...the difference is about 10 percentage points."' },
          { questionNumber: 15, type: 'sentence-completion', questionText: 'A gender gap has been apparent for over a ____.', correctAnswer: 'decade', explanation: 'Girls "have been outperforming boys academically for more than a decade."' },
          { questionNumber: 16, type: 'sentence-completion', questionText: 'This situation is not unique to New Zealand, and has been noticed in ____ also.', correctAnswer: 'Australia', explanation: '"It is an international phenomenon, and within Australia was the subject of much debate and controversy."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H.',
        questions: [
          { questionNumber: 17, type: 'matching-info', questionText: "an advantage of New Zealand's secondary school tests", correctAnswer: 'C', explanation: 'NCEA "is useful to employers and to universities because it provides a fine-grained picture of pupils\' performance."' },
          { questionNumber: 18, type: 'matching-info', questionText: 'a mention of current government initiatives to boost male achievement', correctAnswer: 'B', explanation: 'The Ministry "is working with a reference group on boys\' education" and "commissioned an Australia academic report."' },
          { questionNumber: 19, type: 'matching-info', questionText: 'when gender difference in literacy skills first becomes evident', correctAnswer: 'D', explanation: '"The discrepancy in reading and writing skills shows up as early as preschool."' },
          { questionNumber: 20, type: 'matching-info', questionText: 'findings that relate academic achievement to race', correctAnswer: 'E', explanation: '"New Zealand European girls most represented at the top and New Zealand Pacific Island boys at the bottom."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following people (Questions 21-26) and the list of statements below. Match each person with the correct statement, A-H.',
        matchingOptions: [
          "Boys gain lower marks on NCEA if they attend an all-boys' school.",
          'Boys are disadvantaged by girls tending to take over at school.',
          'Good teaching is more important than whether classrooms are single-sex or mixed.',
          'Mathematical skills were not so important in the past.',
          'The difference in achievement between school boys and girls is only evident in some subjects.',
          'Older boys are more motivated to study than younger boys.',
          'The NCEA exams have higher literacy standards than past exams did.',
          'The New Zealand government is reluctant to take action on behalf of boys.',
        ],
        questions: [
          { questionNumber: 21, type: 'matching-info', questionText: 'Celia Lashlie', correctAnswer: 'H', explanation: 'Lashlie believes "there is still resistance within the Education Ministry towards doing anything about the problem."' },
          { questionNumber: 22, type: 'matching-info', questionText: 'Steve Benson', correctAnswer: 'E', explanation: 'Benson: "In most parts of the curriculum...there isn\'t really a gender gap. But literacy is a different matter."' },
          { questionNumber: 23, type: 'matching-info', questionText: 'Roger Moses', correctAnswer: 'G', explanation: 'Moses says NCEA\'s "written content...is more demanding than the previous system...even in subjects such as statistics and accounting."' },
          { questionNumber: 24, type: 'matching-info', questionText: 'Rob Burroughs', correctAnswer: 'C', explanation: "After running then abandoning separate boys' classes, Burroughs found the real difference \"was, instead, to do with quality of instruction.\"" },
          { questionNumber: 25, type: 'matching-info', questionText: 'Stuart Martin', correctAnswer: 'F', explanation: "Martin says boys' \"competitive instinct tends to come out later in their schooling years.\"" },
          { questionNumber: 26, type: 'matching-info', questionText: 'Paul Baker', correctAnswer: 'B', explanation: "Baker says it's easier to boost boys' performance in a boys' school, where activities can't be \"captured by girls.\"" },
        ],
      },
    ],
  },
  {
    title: 'The strange world of sight',
    category: 'passage3',
    content: placeholder_T11('Test 11', 'Reading Passage 3', 'The strange world of sight'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice', questionText: 'Why does the writer refer to Locke and Newton in the first paragraph?',
            options: ['A   to indicate that his article will cover several scientific fields', 'B   to stress how much physics has changed in 400 years', 'C   to persuade the reader to take him seriously', 'D   to point out that his notions are not new'],
            correctAnswer: 'D',
            explanation: 'Their 17th-century insight "is still not generally recognised even now, 400 years later" — the idea long predates the writer.',
          },
          {
            questionNumber: 28, type: 'multiple-choice', questionText: "According to the writer, why was Freud's theory of the unconscious mocked?",
            options: ['A   It was too complex for his contemporaries to understand.', 'B   It involved criticism of the way people behaved in society.', 'C   People felt that it devalued the accepted concept of humanity.', 'D   People assumed that it was intended as a joke.'],
            correctAnswer: 'C',
            explanation: 'It "undermined the notion of humans as pre-eminently rational beings who could be held responsible for their actions."',
          },
          {
            questionNumber: 29, type: 'multiple-choice', questionText: 'The writer describes Mr S failing to get up in order to demonstrate',
            options: ["A   how realistic most people's memories are.", 'B   how hard it is to tell dreaming and waking apart.', 'C   how unusual it is to mistake a perception for memory.', 'D   how valuable knowledge of the past can be.'],
            correctAnswer: 'C',
            explanation: 'Mr S had "exceptionally vivid memories" — an unusual case, since normally "past and present are not normally confused."',
          },
          {
            questionNumber: 30, type: 'multiple-choice', questionText: 'What point is the writer making in the text as a whole?',
            options: ['A   Perception involves much more than the data collected by the eyes.', 'B   Learning to see as an adult can be a time-consuming process.', 'C   Science is failing to devote enough attention to sight.', 'D   Human perception is remarkably reliable.'],
            correctAnswer: 'A',
            explanation: 'The whole passage argues perception is built from memory, knowledge, and expectation, not just raw visual input.',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 31, type: 'yes-no-ng', questionText: 'Sydney Bradford relied on recollections of objects he had been told about to help him see after his operation.', correctAnswer: 'NO', explanation: '"It was his touch memories" — from direct tactile experience, not things he had been told about — "that enabled him" to make sense of what he saw.' },
          { questionNumber: 32, type: 'yes-no-ng', questionText: 'People who only start to see as adults can learn to see as other people do in time.', correctAnswer: 'YES', explanation: "Mike May's \"sight has gradually improved as he learns to see,\" e.g. interpreting shadows as depth." },
          { questionNumber: 33, type: 'yes-no-ng', questionText: 'People who have gained their sight as adults find certain activities harder to do than before.', correctAnswer: 'YES', explanation: 'A former champion blind skier, May now has to "shut his eyes while skiing" because sight makes it "a terrifying sight."' },
          { questionNumber: 34, type: 'yes-no-ng', questionText: 'It is evident now that sight involves the eyes and one particular area of the brain.', correctAnswer: 'NO', explanation: 'That was the old view; "now it seems that half the brain is occupied with seeing."' },
          { questionNumber: 35, type: 'yes-no-ng', questionText: 'The mask experiment is particularly useful in training people who are regaining their sight.', correctAnswer: 'NOT GIVEN', explanation: 'The mask experiment illustrates perception/expectation generally — it is never linked to training people regaining sight.' },
          { questionNumber: 36, type: 'yes-no-ng', questionText: 'People with perfect vision can fail to interpret objects correctly under certain circumstances.', correctAnswer: 'YES', explanation: '"Even people with no visual impairment see what, at some level, they expect to see, and often miss things as they really are."' },
        ],
      },
      {
        groupType: 'summary-completion',
        instruction: 'Complete the summary below using the list of words, A-J, below.',
        groupTitle: 'The mask experiment',
        summaryConfig: {
          text: 'In this experiment, having looked at the front of a simple face-mask, subjects look at the reverse. However, the subjects are convinced that they are still looking at a mask which is __Q37__ in shape. They believe that the __Q38__ is poking out in the normal manner because that is what they are used to seeing. Attempting to make a __Q39__ of the mask in this orientation leads to the same problem. The subjects fail to see a concave form because of the __Q40__ they have that features of a face stick out.',
          wordBank: [
            { letter: 'A', word: 'back' },
            { letter: 'B', word: 'brain' },
            { letter: 'C', word: 'view' },
            { letter: 'D', word: 'convex' },
            { letter: 'E', word: 'sight' },
            { letter: 'F', word: 'nose' },
            { letter: 'G', word: 'round' },
            { letter: 'H', word: 'hollow' },
            { letter: 'I', word: 'drawing' },
            { letter: 'J', word: 'preconception' },
          ],
        },
        questions: [
          { questionNumber: 37, type: 'sentence-completion', questionText: 'Question 37', correctAnswer: 'D', explanation: 'Subjects perceive the concave back "as convex, though we know that it must be concave."' },
          { questionNumber: 38, type: 'sentence-completion', questionText: 'Question 38', correctAnswer: 'F', explanation: 'From the front, "the nose sticking out" is the familiar convex feature subjects expect.' },
          { questionNumber: 39, type: 'sentence-completion', questionText: 'Question 39', correctAnswer: 'I', explanation: '"It is almost, if not quite, impossible to sketch the back of [a] hollow mask to look as it is."' },
          { questionNumber: 40, type: 'sentence-completion', questionText: 'Question 40', correctAnswer: 'J', explanation: 'People "expect to see" convex faces, a preconception that overrides the actual concave shape.' },
        ],
      },
    ],
  },
];

async function runSeedT11() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T11) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test11] Created "${target.title}" (placeholder_T11 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test11] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test11] Done. created=${created} updated=${updated} (out of ${TARGETS_T11.length} targets).`);
}


// Reading de 1-21, Test 12. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-11: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder_T12 with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.

function placeholder_T12(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS_T12 = [
  {
    title: 'Footprints in the muds of time',
    category: 'passage1',
    content: placeholder_T12('Test 12', 'Reading Passage 1', 'Footprints in the muds of time'),
    questionRange: { start: 1, end: 13 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'There is still doubt about the theory that an asteroid strike killed the dinosaurs.', correctAnswer: 'FALSE', explanation: '"Everybody knows that the dinosaurs became extinct as a result of a large asteroid" — presented as settled fact.' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'Books and the cinema have exaggerated the size of dinosaurs.', correctAnswer: 'FALSE', explanation: 'Modern books and movies are said to depict them "realistically," not exaggerated.' },
          { questionNumber: 3, type: 'true-false-ng', questionText: "Other scientists have rejected Olsen's idea of a sudden dinosaur occupation of the Earth.", correctAnswer: 'NOT GIVEN', explanation: 'Others made the general asteroid-takeover suggestion before Olsen; no rejection of his specific "geological eye blink" finding is mentioned.' },
          { questionNumber: 4, type: 'true-false-ng', questionText: 'Dinosaur footprints are found more frequently than dinosaur skeletons.', correctAnswer: 'TRUE', explanation: '"Dinosaur skeletons are rare. Dinosaur footprints are, however, surprisingly abundant."' },
          { questionNumber: 5, type: 'true-false-ng', questionText: 'Ichnotaxa offer an exact identification of a dinosaur species.', correctAnswer: 'FALSE', explanation: 'Ichnotaxa "cannot be matched precisely within the species of animal that left them."' },
          { questionNumber: 6, type: 'true-false-ng', questionText: 'There is evidence that some groups of dinosaur survived from the Triassic period into the Jurassic period.', correctAnswer: 'TRUE', explanation: '"Four march confidently across the boundary into the Jurassic."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer.',
        questions: [
          { questionNumber: 7, type: 'sentence-completion', questionText: 'Dr Olsen\'s group believe that the sudden increase in the size of dinosaurs may have been due to something known as ____.', correctAnswer: 'ecological release', explanation: 'The explanation offered is "a phenomenon called ecological release."' },
          { questionNumber: 8, type: 'sentence-completion', questionText: 'A current example of this can be found on Komodo Island in Indonesia, where some of the lizards are commonly called ____ because of their size.', correctAnswer: 'dragons', explanation: 'Komodo\'s lizards "have grown so large that they are often referred to as dragons."' },
          { questionNumber: 9, type: 'sentence-completion', questionText: 'Apparently, they have grown this big because they do not have any ____.', correctAnswer: 'competitors', explanation: 'Ecological release occurs when reptiles "reach islands where they face no competitors."' },
          { questionNumber: 10, type: 'sentence-completion', questionText: 'First, it may have been ____ by scientists, because craters are easily covered up.', correctAnswer: 'overlooked', explanation: '"It may, of course, have been overlooked."' },
          { questionNumber: 11, type: 'sentence-completion', questionText: 'Or, it could have ____; for example, if the hole had been in the ocean.', correctAnswer: 'vanished', explanation: '"Alternatively, it may have vanished."' },
          { questionNumber: 12, type: 'sentence-completion', questionText: 'It would no longer exist because of the ____ that produce continental drift.', correctAnswer: 'tectonic processes', explanation: 'The ocean floor "is constantly recycled by the tectonic processes that bring about continental drift."' },
          { questionNumber: 13, type: 'sentence-completion', questionText: 'Thirdly, the hole could still exist but have been ____.', correctAnswer: 'misdated', explanation: '"It is possible...that Manicouagan has been misdated."' },
        ],
      },
    ],
  },
  {
    title: 'The Constant Evolution of the Humble Tomato',
    category: 'passage2',
    content: placeholder_T12('Test 12', 'Reading Passage 2', 'The Constant Evolution of the Humble Tomato'),
    questionRange: { start: 14, end: 26 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'matching-options',
        instruction: 'Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information? Write the correct letter, A-F.',
        questions: [
          { questionNumber: 14, type: 'matching-info', questionText: 'an explanation of research aimed at restoring the health of the heirloom tomato', correctAnswer: 'F', explanation: 'Doug Heath bred "a new multi-colored tomato less prone to cracking and also endowed with 12 disease-resistant genes."' },
          { questionNumber: 15, type: 'matching-info', questionText: 'a reference to a false belief about the heirloom tomato', correctAnswer: 'A', explanation: 'The assumption heirlooms "must have a more diverse and superior set of genes" is debunked: "their seeming diversity is only skin-deep."' },
          { questionNumber: 16, type: 'matching-info', questionText: 'a description of the flavour of the heirloom tomato', correctAnswer: 'E', explanation: 'Low-yield plants are "highly likely to produce juicier, sweeter and more flavorful fruit."' },
          { questionNumber: 17, type: 'matching-info', questionText: 'a reference to a single gene that significantly improves the cultivation of tomatoes', correctAnswer: 'D', explanation: 'A gene "increases fruit size by 50 percent. It was probably the most important event in domestication."' },
        ],
      },
      {
        groupType: 'matching-options',
        instruction: 'Look at the following statements (Questions 18-21) and the list of researchers below. Match each statement with the correct researcher, A, B, C or D.',
        matchingOptions: ['Steven Tanksley', 'Esther van der Knaap', 'Roger Chetelat', 'Doug Heath'],
        questions: [
          { questionNumber: 18, type: 'matching-info', questionText: 'The transplanting of certain genes into tomatoes can change their shape.', correctAnswer: 'B', explanation: 'Van der Knaap inserted a gene into a wild relative and "the tiny fruits became shaped like pears."' },
          { questionNumber: 19, type: 'matching-info', questionText: 'The flavour of the heirloom tomato is largely dependent on actual yield and cultivation.', correctAnswer: 'C', explanation: "Chetelat says taste \"may have less to do with...genes than with the productivity of the plant and the growing environment.\"" },
          { questionNumber: 20, type: 'matching-info', questionText: 'A new type of tomato can be produced that is stronger than the original heirloom tomato yet equally sweet and flavoursome.', correctAnswer: 'D', explanation: "Heath's variety is \"less prone to cracking\" while he \"maintain[s] a comparable flavor and sugar profile.\"" },
          { questionNumber: 21, type: 'matching-info', questionText: 'The wide variety of heirloom tomatoes is due to only a small number of genes.', correctAnswer: 'A', explanation: 'Tanksley: "no more than 10 mutant genes...create the diversity of heirlooms you see."' },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.',
        questions: [
          { questionNumber: 22, type: 'sentence-completion', questionText: 'There is little information on the origin of the tomato despite the existence of ____ data on the growing of other New World crops.', correctAnswer: 'archaeological', explanation: 'Scientists have "a wealth of archaeological evidence on early farming practices in the New World."' },
          { questionNumber: 23, type: 'sentence-completion', questionText: 'Although it is uncertain, the tomato is thought to have first grown in the ____.', correctAnswer: 'Andes', explanation: '"The modern tomato seems to have its origins in the Andes in South America."' },
          { questionNumber: 24, type: 'sentence-completion', questionText: 'In regard to genetic similarities, the ____ tomato is the nearest to the earliest type of tomato.', correctAnswer: 'currant', explanation: '"The closest relative is the currant tomato."' },
          { questionNumber: 25, type: 'sentence-completion', questionText: 'A genetic ____ which is evident in pomodoro produced larger tomatoes.', correctAnswer: 'mutation', explanation: 'The size-enlarging "mutation...existed back in the same yellow tomatoes that gave Italians the word pomodoro."' },
          { questionNumber: 26, type: 'sentence-completion', questionText: '____ are a problem for heirloom tomatoes because they frequently lead to damage and deterioration.', correctAnswer: 'Infections', explanation: 'Heirlooms "often suffer from infections that cause the fruit to crack, split and otherwise rot quickly."' },
        ],
      },
    ],
  },
  {
    title: 'Crossing the Threshold',
    category: 'passage3',
    content: placeholder_T12('Test 12', 'Reading Passage 3', 'Crossing the Threshold'),
    questionRange: { start: 27, end: 40 },
    isActualTest: true,
    isActive: false,
    questionGroups: [
      {
        groupType: 'plain',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice', questionText: "What is the writer's main point in the first paragraph?",
            options: ['A   Criticism of architects by different groups is unfair.', 'B   The architectural profession is generally well respected.', 'C   The most difficult projects for architects are public buildings.', 'D   Failure to deliver buildings is a result of poor communication.'],
            correctAnswer: 'C',
            explanation: '"The situation is much worse when architects work on municipal buildings," as with the Auckland Gallery.',
          },
          {
            questionNumber: 28, type: 'multiple-choice', questionText: 'The Auckland Gallery project was particularly difficult because',
            options: ['A   the existing building was old and parts of it had fallen down.', 'B   there was a high number of floors in the building.', 'C   it needed to satisfy the requirements of the existing patrons.', 'D   it involved renovating the existing building and adding a new one.'],
            correctAnswer: 'D',
            explanation: 'The project "involved two parts": restoring the heritage building and delivering "a new extension."',
          },
          {
            questionNumber: 29, type: 'multiple-choice', questionText: 'What disturbing information did the architects find out from the survey of young people?',
            options: ['A   They did not visit the gallery because of the way it made them feel.', 'B   They thought that the gallery buildings were not in use.', 'C   The gallery had the reputation of being dirty.', 'D   They did not like the entrance.'],
            correctAnswer: 'A',
            explanation: '"\'Threshold fear\'...was the institution\'s undoing" — visitors intimidated by the atmosphere before ever stepping in.',
          },
          {
            questionNumber: 30, type: 'multiple-choice', questionText: 'What point is the writer making when he says that 16% of the sample group did not know where the museum was?',
            options: ['A   Young people are not interested in galleries.', 'B   The gallery was not reaching out to involve young people.', 'C   The entrance to the gallery was not well signposted.', 'D   The location of the gallery was difficult to access.'],
            correctAnswer: 'B',
            explanation: 'They were interviewed "right outside it" yet still unaware — showing the gallery had failed to register with young people at all, not a signage/access issue.',
          },
          {
            questionNumber: 31, type: 'multiple-choice', questionText: 'Maori artists were used on this project to',
            options: ['A   satisfy the concerns of conservationists.', 'B   protect sacred materials in the Albert Park site.', 'C   make sure the gallery respects Maori culture.', 'D   ensure that certain sources of kauri were not used.'],
            correctAnswer: 'C',
            explanation: 'A consulting artist worked "ensuring the gallery emphasised Maori beliefs."',
          },
        ],
      },
      {
        groupType: 'plain',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 32, type: 'yes-no-ng', questionText: 'Before the renovation, the Auckland Art Gallery was regarded as an elitist institution.', correctAnswer: 'YES', explanation: 'It served "a limited range of patrons with highbrow interests" and was seen by young people as "undemocratic."' },
          { questionNumber: 33, type: 'yes-no-ng', questionText: "Stephen King's intervention in the project shows his understanding of the architects' use of kauri.", correctAnswer: 'NO', explanation: "The kauri actually came \"from the forest floor,\" and King's objection is explicitly called a \"misconception.\"" },
          { questionNumber: 34, type: 'yes-no-ng', questionText: 'The way the building interacts with its surroundings is a triumph.', correctAnswer: 'YES', explanation: 'The "relationship with parkland is one of the most successful outcomes."' },
          { questionNumber: 35, type: 'yes-no-ng', questionText: 'The glass screen along the east wall was one of the most costly items in the rebuild.', correctAnswer: 'NOT GIVEN', explanation: 'No cost figures are given for the glass wall specifically.' },
          { questionNumber: 36, type: 'yes-no-ng', questionText: "The design of the extension to the Auckland Art Gallery is similar to the design of 'white cube' galleries in other parts of the world.", correctAnswer: 'NO', explanation: 'The design is explicitly "a far cry from...\'white cube\' galleries worldwide."' },
        ],
      },
      {
        groupType: 'sentence-endings',
        instruction: 'Complete each sentence with the correct ending, A-F, below.',
        endingsConfig: {
          endings: [
            { letter: 'A', text: 'resulted in work being done in the opposite direction to that usually followed.' },
            { letter: 'B', text: 'is more than cosmetic and has improved the circulation.' },
            { letter: 'C', text: 'was the clue to rebuilding the Mackelvie Gallery successfully.' },
            { letter: 'D', text: 'has resulted in the building itself becoming a work of art.' },
            { letter: 'E', text: 'means that you should be able to tell whether you are in the old wing or the new one.' },
            { letter: 'F', text: 'was the result of earlier attempts to modernise the building.' },
          ],
        },
        questions: [
          { questionNumber: 37, type: 'sentence-completion', questionText: 'The destruction of Edwardian ornamentation', correctAnswer: 'F', explanation: 'The decoration "had been stripped out or walled away in previous renovations."' },
          { questionNumber: 38, type: 'sentence-completion', questionText: 'It is extraordinary that a limited number of photographs', correctAnswer: 'C', explanation: '"The Mackelvie space has been reconstructed from two old photos."' },
          { questionNumber: 39, type: 'sentence-completion', questionText: 'The problem of having so many floor levels to deal with', correctAnswer: 'A', explanation: 'Scaffolding was built "at the highest level, with work progressing downwards, the reverse of normal practice."' },
          { questionNumber: 40, type: 'sentence-completion', questionText: 'The glass flooring in the Mackelvie Gallery which reveals old features', correctAnswer: 'D', explanation: 'The retained detail leaves "the building itself as artwork."' },
        ],
      },
    ],
  },
];

async function runSeedT12() {
  let created = 0, updated = 0;
  for (const target of TARGETS_T12) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test12] Created "${target.title}" (placeholder_T12 content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test12] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test12] Done. created=${created} updated=${updated} (out of ${TARGETS_T12.length} targets).`);
}


// Reading de 1-21, Test 18. Passages 2 ("The return of monkey life") and 3
// ("Innovation in Business") already existed in the DB with content and
// answers. This script only adds the missing Passage 1 ("Jewels from the
// sea"). Same caveat as other newly-added tests: no answer key in the
// source PDF; correctAnswer/explanation values derived directly from
// passage text — treat as draft pending review. content is a placeholder
// with isActive:false — paste real passage text via admin UI, then flip
// isActive to true.

const PLACEHOLDER_CONTENT_T18 = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 18, Reading Passage 1: "Jewels from the sea"]';

const TARGET_T18 = {
  title: 'Jewels from the sea',
  category: 'passage1',
  content: PLACEHOLDER_CONTENT_T18,
  questionRange: { start: 1, end: 13 },
  isActualTest: true,
  isActive: false,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
      questions: [
        { questionNumber: 1, type: 'true-false-ng', questionText: 'After European settlement, Tasmanian Aboriginals stopped making necklaces for a short time.', correctAnswer: 'FALSE', explanation: 'Necklace-making "continued without interruption since before the Europeans settled."' },
        { questionNumber: 2, type: 'true-false-ng', questionText: 'Aboriginal women on the Furneaux Islands made the most beautiful necklaces.', correctAnswer: 'NOT GIVEN', explanation: 'Furneaux Island women\'s tradition is described, but no comparison to other groups\' beauty is made.' },
        { questionNumber: 3, type: 'true-false-ng', questionText: 'An 1866 photograph of the leader Truganini shows her wearing a necklace she had made herself.', correctAnswer: 'NOT GIVEN', explanation: 'The photograph is mentioned, but the passage never says Truganini made the necklace herself.' },
        { questionNumber: 4, type: 'true-false-ng', questionText: 'Men assist in gathering shells growing on sea plants.', correctAnswer: 'TRUE', explanation: 'Men help collect maireener shells "found on kelp, a type of seaweed."' },
        { questionNumber: 5, type: 'true-false-ng', questionText: 'Tasmanian Aboriginal men wore long necklaces when hunting.', correctAnswer: 'FALSE', explanation: 'Hunters "would not have risked getting snagged by long necklaces" while tracking game.' },
        { questionNumber: 6, type: 'true-false-ng', questionText: 'Tasmanian Aboriginal necklaces are appreciated outside Australia.', correctAnswer: 'TRUE', explanation: 'They are included in "many national and international museum, gallery, and private collections."' },
      ],
    },
    {
      groupType: 'note-form',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
      noteConfig: {
        title: 'The process of shell-stringing',
        lines: [
          'Shell-stringers must have patience and an understanding of resources available near the sea.',
          'The traditional procedure',
          "●   Hole put in shell with an instrument made of animal's bone and __Q7__",
          '●   Shells strung on natural fibre and smoked',
          '●   Shells wiped with __Q8__ to achieve a pearly surface',
          '●   Animal __Q9__ applied',
          'Changes after the Europeans arrived',
          '●   Cleaning substances like __Q10__ were used',
          '●   More complex designs achieved using needles as a tool',
          'Furneaux Islands',
          '●   Shells need to be gathered in the right __Q11__',
          '●   Shell collectors walk along the beach then __Q12__ in order to pick up shells',
          '●   Shells from beach not suitable as do not keep __Q13__ and break easily',
        ],
      },
      questions: [
        { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'tooth', explanation: 'The piercing tool was "a jawbone and sharpened tooth of a kangaroo or wallaby."' },
        { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'grass', explanation: 'Shells were "rubbed in grass to remove their outer coating and reveal the pearly surface."' },
        { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'oil', explanation: 'Shells "were later treated with penguin or muttonbird oil."' },
        { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'vinegar', explanation: 'Colonisation introduced "acidic liquids such as vinegar to clean the shells."' },
        { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'season', explanation: '"Shell collection has its season."' },
        { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'crawl', explanation: '"We take our lunch and crawl along on our hands and knees to get the shells."' },
        { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'colour', explanation: 'Beach shells "are too brittle and they lose their colour."' },
      ],
    },
  ],
};

async function runSeedT18() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET_T18.title });
  if (!existing) {
    await Passage.create(TARGET_T18);
    created++;
    console.log(`[SeedReadingDe1to21Test18] Created "${TARGET_T18.title}" (placeholder content, isActive:false).`);
  } else {
    existing.questionGroups = TARGET_T18.questionGroups;
    existing.questionRange = TARGET_T18.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test18] Updated question groups for existing "${TARGET_T18.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test18] Done. created=${created} updated=${updated}.`);
}


async function runSeed() {
  await runSeedT1();
  await runSeedT2();
  await runSeedT3();
  await runSeedT4();
  await runSeedT5();
  await runSeedT6();
  await runSeedT7();
  await runSeedT8();
  await runSeedT9();
  await runSeedT10();
  await runSeedT11();
  await runSeedT12();
  await runSeedT18();
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Tests] FAILED', e); process.exit(1); });
}

module.exports = {
  runSeed,
  runSeedT1, runSeedT2, runSeedT3, runSeedT4, runSeedT5, runSeedT6,
  runSeedT7, runSeedT8, runSeedT9, runSeedT10, runSeedT11, runSeedT12, runSeedT18,
};
