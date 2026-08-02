// Reading de 1-21, Test 9. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-8: no answer key in the source PDF; correctAnswer/
// explanation values derived directly from passage text — treat as draft
// pending review. Q10 in Passage 1 is a lower-confidence guess because the
// source note's structure was corrupted by the PDF text extraction — flag
// it for extra scrutiny. content is a placeholder with isActive:false —
// paste real passage text via admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Ahead of its time',
    category: 'passage1',
    content: placeholder('Test 9', 'Reading Passage 1', 'Ahead of its time'),
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
    content: placeholder('Test 9', 'Reading Passage 2', 'The Tasmanian Tiger'),
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
    content: placeholder('Test 9', 'Reading Passage 3', 'Yawning'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test9] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test9] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test9] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test9] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
