// Reading de 1-21, Test 5. None of this test's 3 passages existed in the DB.
// Same caveat as Tests 3-4: no answer key exists in the source PDF, so
// correctAnswer/explanation values were derived by reading the passage
// text directly — treat as a draft pending review. content is a
// placeholder with isActive:false — paste the real passage text via the
// admin UI, then flip isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

function placeholder(testLabel, passageLabel, title) {
  return `[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, ${testLabel}, ${passageLabel}: "${title}"]`;
}

const TARGETS = [
  {
    title: 'Caral: an ancient South American city',
    category: 'passage1',
    content: placeholder('Test 5', 'Reading Passage 1', 'Caral: an ancient South American city'),
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
    content: placeholder('Test 5', 'Reading Passage 2', 'Should space be explored by robots or by humans?'),
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
    content: placeholder('Test 5', 'Reading Passage 3', 'The dark side of the technological boom'),
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

async function runSeed() {
  let created = 0, updated = 0;
  for (const target of TARGETS) {
    const existing = await Passage.findOne({ title: target.title });
    if (!existing) {
      await Passage.create(target);
      created++;
      console.log(`[SeedReadingDe1to21Test5] Created "${target.title}" (placeholder content, isActive:false).`);
    } else {
      existing.questionGroups = target.questionGroups;
      existing.questionRange = target.questionRange;
      await existing.save();
      updated++;
      console.log(`[SeedReadingDe1to21Test5] Updated question groups for existing "${target.title}" (content left untouched).`);
    }
  }
  console.log(`\n[SeedReadingDe1to21Test5] Done. created=${created} updated=${updated} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test5] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
