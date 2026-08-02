// Reading de 1-21, Test 12. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-11: no answer key in the source PDF; correctAnswer/
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
    title: 'Footprints in the muds of time',
    category: 'passage1',
    content: placeholder('Test 12', 'Reading Passage 1', 'Footprints in the muds of time'),
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
    content: placeholder('Test 12', 'Reading Passage 2', 'The Constant Evolution of the Humble Tomato'),
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
    content: placeholder('Test 12', 'Reading Passage 3', 'Crossing the Threshold'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test12] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test12] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test12] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test12] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
