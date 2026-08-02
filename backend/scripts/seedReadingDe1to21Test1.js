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
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const PLACEHOLDER_CONTENT = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 1, Reading Passage 3: "What makes a musical expert?"]';

const TARGET = {
  title: 'What makes a musical expert?',
  category: 'passage3',
  content: PLACEHOLDER_CONTENT,
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

async function runSeed() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET.title });
  if (!existing) {
    await Passage.create(TARGET);
    created++;
    console.log(`[SeedReadingDe1to21Test1] Created "${TARGET.title}" (content is a placeholder — paste real text via admin UI, then set isActive:true).`);
  } else {
    existing.questionGroups = TARGET.questionGroups;
    existing.questionRange = TARGET.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test1] Updated question groups for existing "${TARGET.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test1] Done. created=${created} updated=${updated}.`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test1] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGET };
