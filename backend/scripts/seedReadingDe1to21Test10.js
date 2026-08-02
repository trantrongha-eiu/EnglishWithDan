// Reading de 1-21, Test 10. Passage 2 ("The return of monkey life") already
// existed in the DB with content + questions — this script only adds the
// missing Passage 1 ("Koalas") and Passage 3 ("Personality and appearance").
// Same caveat as Tests 3-9: no answer key in the source PDF; correctAnswer/
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
    title: 'Koalas',
    category: 'passage1',
    content: placeholder('Test 10', 'Reading Passage 1', 'Koalas'),
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
    content: placeholder('Test 10', 'Reading Passage 3', 'Personality and appearance'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test10] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test10] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test10] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test10] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
