// Reading de 1-21, Test 11. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-10: no answer key in the source PDF; correctAnswer/
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
    title: 'What Lucy Taught Us',
    category: 'passage1',
    content: placeholder('Test 11', 'Reading Passage 1', 'What Lucy Taught Us'),
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
    content: placeholder('Test 11', 'Reading Passage 2', "The gender gap in New Zealand's high school examination results"),
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
    content: placeholder('Test 11', 'Reading Passage 3', 'The strange world of sight'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test11] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test11] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test11] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test11] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
