// Reading de 1-21, Test 6. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-5: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. content is a placeholder with isActive:false — paste
// real passage text via admin UI, then flip isActive to true.
//
// Note: Passage 2's source text has no printed title (Q26 asks the reader
// to pick the best title from 4 options), so a neutral working title was
// chosen for the DB record that doesn't give away the Q26 answer.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Developmental Tasks of Normal Adolescence',
    category: 'passage1',
    content: placeholder('Test 6', 'Reading Passage 1', 'Developmental Tasks of Normal Adolescence'),
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
    content: placeholder('Test 6', 'Reading Passage 2', 'The relationship between bees and flowering plants'),
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
    content: placeholder('Test 6', 'Reading Passage 3', 'A new stage in the study and teaching of history'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test6] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test6] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test6] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test6] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
