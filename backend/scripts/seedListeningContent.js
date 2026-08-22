// Listening content seed — merged from 6 separate one-off scripts (each
// already run against the live DB). Order matters: seedTest creates the
// ListeningTest + its standalone ListeningSection copies, seedSections
// backfills standalone ListeningSection copies for 24 pre-existing
// ListeningTest docs that never got them, and the 4 transcript scripts then
// attach transcripts to standalone sections by matching sectionTitle().
// Each keeps its own data array and its own seed function exactly as
// originally written — only the shared requires/dotenv/connect-disconnect
// boilerplate, the duplicated sectionTitle()/fmt() helpers, and the final
// runner were consolidated. Run: node backend/scripts/seedListeningContent.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');

// Section titles were mostly left as the generic "Part N" placeholder when
// the source text had no distinct topic name — give those a unique,
// searchable title in the standalone-section library instead of many rows
// all literally called "Part 1".
function sectionTitle(testName, sec) {
  const t = (sec.title || '').trim();
  return /^Part \d$/.test(t) ? `${testName} – Part ${sec.partNumber}` : t;
}

function fmt(title, turns) {
  const body = turns.map(([speaker, text]) => speaker ? `${speaker}:\n${text}` : text).join('\n');
  return `❓ Transcript\n${title}\n${body}`;
}

// Generic one-off content seed — inserts the TEST_MAIN doc below as a normal
// ListeningTest so it shows up in admin's Đề Listening list exactly like
// every other hand-entered test (Cam 20, Actual Tests, ...): editable name,
// editable questions, and ready for the admin to attach the full-test audio
// and any map images via the existing admin UI (the schema only supports
// one audio file per test, not per-part — same as all existing tests, so
// audio is left blank here for admin to upload).
//
// IMPORTANT — always seeds BOTH the bundled test AND the 4 standalone
// sections, do not remove the section-seeding half below. The admin's real
// workflow is: (1) enter each Part as its own ListeningSection with its own
// audio under "Bài lẻ Listening", (2) use "Tạo Full Test" to copy 4 chosen
// sections into one ListeningTest, (3) upload one more combined audio to
// that ListeningTest. AssembleModal (admin-src/src/pages/ListeningSections.jsx)
// confirms the two collections are independent copies with NO reference
// back from ListeningTest to the sections it came from. An earlier version
// of this script only inserted the ListeningTest, silently skipping step
// (1) — the admin had no way to upload per-part audio because the sections
// never existed as their own documents (see git history: fix commit
// "backfill standalone ListeningSection docs for seeded tests" had to
// retroactively create 92 of these). Keep both halves seeding together so
// that mistake can't happen again.
//
// Reused per test: edit TEST_MAIN below to the next test's content, then run
// `node scripts/seedListeningTest.js` from backend/. Safe to re-run — skips
// whichever half (test / each section) already exists by name. Each past
// run's content is preserved in git history (see log for prior seeds under
// this filename).


// Section titles are often left as the generic "Part N" placeholder when the
// source text has no distinct topic name — give those a unique, searchable
// title in the standalone-section library instead of many rows all
// literally called "Part 1". Keep in sync with
// scripts/seedListeningSectionsFromTests.js's identical helper.

const TEST_MAIN = {
  name: 'Cam 21 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 21',
  audioUrl: '',
  audioFileName: '',
  audioDuration: 0,
  isActive: true,
  sections: [
    // ── PART 1 (Q1–10) ──────────────────────────────────────────────
    {
      partNumber: 1,
      title: 'Part 1',
      description: '',
      transcript: '',
      questionRange: { start: 1, end: 10 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 1–10  Complete the form below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Survey about shopping in Broadbeach',
            lines: [
              'Name: Martyn __Q1__.',
              'Today\'s journey to Broadbeach town centre: used his __Q2__.',
              'Purpose of today\'s trip:',
              '○   has visited the __Q3__.',
              '○   looking for a new __Q4__.',
              '○   collecting __Q5__ (after repair)',
              'Preferred day for shopping: __Q6__.',
              'Opinions about shopping in the town centre',
              'Finds the service in shops is excellent',
              'Thinks there are too many places selling __Q7__.',
              'Would like more places to buy __Q8__.',
              'Opinions about new out-of-town Shopping Centre',
              'Likes the __Q9__ best',
              'Believes the __Q10__ is unnecessary',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Leigh' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'motorbike' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'hairdresser' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'suit' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'laptop' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'Monday' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'coffee' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'books' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'plants' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'cinema' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Part 2',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11 and 12  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 11, type: 'multi-answer-group',
              questionText: 'In which TWO areas of the business exhibition did James Craig promote his company last year?',
              options: [
                'A   the Digital Marketing Centre',
                'B   the TalkCon Zone',
                'C   the Breakout area',
                'D   the Business Village',
                'E   the Business Connections Zone',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   the Digital Marketing Centre',
                'B   the TalkCon Zone',
                'C   the Breakout area',
                'D   the Business Village',
                'E   the Business Connections Zone',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 13 and 14  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 13, type: 'multi-answer-group',
              questionText: 'Which TWO facts are given about discounts on popular brands available to exhibitors?',
              options: [
                'A   They are available to all members of exhibiting companies.',
                'B   They can be used for both food and clothing.',
                'C   They only apply if people spend at least £400.',
                'D   They can be used by family members.',
                'E   The percentage saved is always the same.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   They are available to all members of exhibiting companies.',
                'B   They can be used for both food and clothing.',
                'C   They only apply if people spend at least £400.',
                'D   They can be used by family members.',
                'E   The percentage saved is always the same.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  Which topic will each of the following speakers focus on? Choose SIX answers from the box and write the correct letter, A-G, next to Questions 15–20.',
          matchingOptionsTitle: 'Topics',
          matchingOptions: [
            'Supporting job seekers',
            'Dealing with personal problems',
            'Effects of an unexpectedly rapid expansion',
            'A global range of business experiences',
            'Coping with financial set-backs',
            'Developing a company in response to changing markets',
            'Combining business success with contributions to charities',
          ],
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'Jim Clowrie', correctAnswer: 'C' },
            { questionNumber: 16, type: 'matching-info', questionText: 'David France', correctAnswer: 'G' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Oliver Stanton', correctAnswer: 'D' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Francesca Heptonstall', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Salman Khan', correctAnswer: 'F' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Annie Craven', correctAnswer: 'B' },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Presentation on houses of the future',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21–23  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   Which aspect of their presentation are Mia and Leo both concerned about?',
              options: [
                'A   meeting the deadline',
                'B   finding suitable examples',
                'C   including original ideas',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   The students decide to focus their assignment on housing for',
              options: [
                'A   family groups.',
                'B   old people.',
                'C   single people.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   The students agree that demand for accommodation in urban areas should be met by',
              options: [
                'A   repurposing offices and factories.',
                'B   constructing tall buildings.',
                'C   developing creative ideas for smaller homes.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 24–30  What opinion is given about each of the following developments? Choose SEVEN answers from the box and write the correct letter, A-I, next to Questions 24–30.',
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'This could cause unnecessary anxiety.',
            'This would be especially beneficial for city residents.',
            'This would be challenging for young people.',
            'This would have environmental benefits.',
            'This could encourage creativity.',
            'This could lead to social problems.',
            'This could enable retired people to share a project.',
            'This would help some people but cause problems for others.',
            'This would suit both existing and new members of a household.',
          ],
          questions: [
            { questionNumber: 24, type: 'matching-info', questionText: 'use of roof space for gardens', correctAnswer: 'B' },
            { questionNumber: 25, type: 'matching-info', questionText: 'shared working spaces', correctAnswer: 'E' },
            { questionNumber: 26, type: 'matching-info', questionText: 'moveable internal walls', correctAnswer: 'I' },
            { questionNumber: 27, type: 'matching-info', questionText: 'smart mirrors in bathrooms', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'bike sheds with charging points', correctAnswer: 'D' },
            { questionNumber: 29, type: 'matching-info', questionText: 'restriction of cars to certain areas', correctAnswer: 'H' },
            { questionNumber: 30, type: 'matching-info', questionText: 'communal vegetable plots', correctAnswer: 'G' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Music therapy for surgical patients',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Music therapy for surgical patients',
            lines: [
              'Background',
              '●   Surgery impacts patients because they may experience discomfort or unwelcome changes to their __Q31__.',
              '●   Current post-surgical strategies focus mainly on pain relief.',
              'Recent research',
              '●   A study reviewed data from about 100 __Q32__ and found that listening to music',
              "○   improved hospital patients' sense of wellbeing.",
              '○   reduced the length of their stay.',
              '●   The patients in the study all listened to music with a __Q33__ effect.',
              '●   The music was mostly played through music __Q34__.',
              '●   Patients reported an absence or low levels of __Q35__.',
              "●   Medical records confirmed that patients who were played music in hospital needed less __Q36__ than those who weren't played music.",
              '●   The best results were achieved when patients were played music while they were __Q37__.',
              '●   The study concluded that playing music was effective because it served as a __Q38__.',
              '●   The researchers recommend playing either music or sounds from __Q39__ to all surgical patients.',
              '●   A future study will investigate the best __Q40__ for the music.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'routine' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'trials' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'calming' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'pillows' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'anxiety' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'medication' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'awake' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'distraction' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'nature' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'volume' },
          ],
        },
      ],
    },
  ],
};

async function runSeedTest() {
  const existing = await ListeningTest.findOne({ name: TEST_MAIN.name }).lean();
  let doc;
  if (existing) {
    console.log(`[SeedListeningTest] "${TEST_MAIN.name}" already exists (_id=${existing._id}) – skip`);
    doc = existing;
  } else {
    doc = await ListeningTest.create(TEST_MAIN);
    console.log(`[SeedListeningTest] Inserted "${TEST_MAIN.name}" (_id=${doc._id}, ${doc.totalQuestions} questions)`);
  }

  // Always also ensure the 4 standalone ListeningSection docs exist — see
  // the IMPORTANT note at the top of this file for why.
  let sectionsInserted = 0, sectionsSkipped = 0;
  for (const sec of TEST_MAIN.sections) {
    const title = sectionTitle(TEST_MAIN.name, sec);
    const existingSection = await ListeningSection.findOne({ title, partNumber: sec.partNumber }).lean();
    if (existingSection) {
      console.log(`[SeedListeningTest] Section "${title}" (Part ${sec.partNumber}) already exists (_id=${existingSection._id}) – skip`);
      sectionsSkipped++;
      continue;
    }
    const sectionDoc = await ListeningSection.create({
      partNumber: sec.partNumber,
      title,
      description: sec.description || '',
      audioUrl: '',
      audioFileName: '',
      audioDuration: 0,
      transcript: sec.transcript || '',
      questionRange: sec.questionRange,
      questionGroups: sec.questionGroups,
      isActive: true,
      isActualTest: true,
    });
    console.log(`[SeedListeningTest] Inserted section "${title}" (Part ${sec.partNumber}, _id=${sectionDoc._id})`);
    sectionsInserted++;
  }
  console.log(`[SeedListeningTest] Sections: inserted=${sectionsInserted} skipped=${sectionsSkipped}`);

  return doc;
}


// One-off fix — creates the standalone ListeningSection documents that were
// missing for the 24 ListeningTest docs seeded via seedListeningTest.js
// (Cam 15–19 and Cam 21, Tests 1–4).
//
// Why this was needed: the admin's normal workflow is (1) enter each Part
// as its own ListeningSection with its own audio under "Bài lẻ Listening",
// then (2) use "Tạo Full Test" to copy 4 chosen sections into one
// ListeningTest, then (3) upload one more combined audio to that
// ListeningTest. AssembleModal (admin-src/src/pages/ListeningSections.jsx)
// confirms the two collections are independent copies, not references —
// there is no link from a ListeningTest back to the sections it came from.
// seedListeningTest.js wrote directly into ListeningTest.sections[], so
// step (1) never happened for these 24 tests: they were invisible on the
// "Bài lẻ Listening" page and had no way to get per-part audio uploaded.
//
// This script copies each ListeningTest.sections[i] into a new standalone
// ListeningSection, leaving audioUrl blank for the admin to upload via the
// normal "Bài lẻ Listening" flow. It does not touch the existing
// ListeningTest documents.


const TEST_NAMES = [
  'Cam 15 - Test 1', 'Cam 15 - Test 2', 'Cam 15 - Test 3', 'Cam 15 - Test 4',
  'Cam 16 - Test 1', 'Cam 16 - Test 2', 'Cam 16 - Test 3', 'Cam 16 - Test 4',
  'Cam 17 - Test 1', 'Cam 17 - Test 2', 'Cam 17 - Test 3', 'Cam 17 - Test 4',
  'Cam 18 - Test 1', 'Cam 18 - Test 2', 'Cam 18 - Test 3', 'Cam 18 - Test 4',
  'Cam 19 - Test 1', 'Cam 19 - Test 2', 'Cam 19 - Test 3', 'Cam 19 - Test 4',
  'Cam 21 - Test 1', 'Cam 21 - Test 2', 'Cam 21 - Test 3', 'Cam 21 - Test 4',
];

// Section titles were mostly left as the generic "Part N" placeholder when
// the source text had no distinct topic name — give those a unique,
// searchable title in the standalone-section library instead of 24 rows
// all literally called "Part 1".

async function runSeedSections() {
  let inserted = 0, skipped = 0, missingTests = 0;
  for (const name of TEST_NAMES) {
    const test = await ListeningTest.findOne({ name }).lean();
    if (!test) { console.log(`[SeedListeningSections] ListeningTest not found: "${name}" – skip`); missingTests++; continue; }

    for (const sec of test.sections) {
      const title = sectionTitle(name, sec);
      const existing = await ListeningSection.findOne({ title, partNumber: sec.partNumber }).lean();
      if (existing) {
        console.log(`[SeedListeningSections] "${title}" (Part ${sec.partNumber}) already exists (_id=${existing._id}) – skip`);
        skipped++;
        continue;
      }
      const doc = await ListeningSection.create({
        partNumber: sec.partNumber,
        title,
        description: sec.description || '',
        audioUrl: '',
        audioFileName: '',
        audioDuration: 0,
        transcript: sec.transcript || '',
        questionRange: sec.questionRange,
        questionGroups: sec.questionGroups,
        isActive: true,
        isActualTest: true,
      });
      console.log(`[SeedListeningSections] Inserted "${title}" (Part ${sec.partNumber}, _id=${doc._id})`);
      inserted++;
    }
  }
  console.log(`\n[SeedListeningSections] Done. inserted=${inserted} skipped=${skipped} missingTests=${missingTests}`);
}


// Seeds the `transcript` field for Listening sections that don't have one
// yet. Sourced from published Cambridge IELTS 21 audioscripts (Tests 1-4,
// all 4 parts each — ieltstrainingonline.com), cross-checked sentence by
// sentence against every question's `correctAnswer` already stored in the
// DB (all 160 questions matched) before being written here.
//
// Each ListeningTest document owns its own embedded copy of every section
// (ListeningTest.sections[]), and there is also an independent standalone
// ListeningSection document per Part (the "Bài lẻ Listening" library) — the
// two collections are NOT linked by reference (see the header comment in
// seedListeningSectionsFromTests.js), so both must be updated to keep them
// in sync. Reuses that script's `sectionTitle()` helper to compute the
// standalone doc's title the same way it was originally created.
//
// Re-run safe: only saves a document if its transcript actually changed.

// Builds the "❓ Transcript\n<title>\nSpeaker:\n<line>\n..." format already
// used by existing transcripts in the DB (confirmed by inspecting a
// populated ListeningSection before writing this).

const TARGETS_Transcripts = [
  // ══════════════════════════ Cam 21 - Test 1 ══════════════════════════
  {
    testName: 'Cam 21 - Test 1', partNumber: 1,
    transcript: fmt('Oyster Bay Sailing Club', [
      ['Woman', 'Hello, Oyster Bay Sailing Club. How can I help you?'],
      ['Man', "Oh hi. I'd like to find out about sailing courses for beginners."],
      ['Woman', 'No problem. Is it for yourself?'],
      ['Man', "Yes. I had a look online but I'm not sure which course would be best."],
      ['Woman', 'OK. Well you might be interested in our Taster Days?'],
      ['Man', 'Possibly.'],
      ['Woman', "So these are for people who've never sailed before – it's basically an introduction to sailing to find out whether you enjoy it and want to carry on with it."],
      ['Man', 'And how much is that?'],
      ['Woman', "It's £120 for the day, but it's reduced to £110 each if there are two of you."],
      ['Man', 'No, it would just be me.'],
      ['Woman', "Oh that's fine. You'd be in a small group, usually about eight people but no more than ten – and everyone's always very friendly."],
      ['Man', 'Uh huh. And are there any other suitable courses?'],
      ['Woman', 'The other option is the Level 1 course. These are two-day weekend courses and we run those all year round.'],
      ['Man', 'OK. And what do you learn on that course?'],
      ['Woman', 'This is a mix of theory and practical skills. So you learn about things like the weather, which is obviously really important, and also the tides, as well as learning basic sailing skills. You go out into the harbour in special training dinghies for beginners, two people in each dinghy and an instructor. He or she will make sure you understand everything you need to know about safety.'],
      ['Man', 'It sounds like hard work!'],
      ['Woman', "Yes, but you'll have a lot of fun too."],
      ['Man', 'And the cost of that one is...?'],
      ['Woman', "£200. But it's a bit cheaper if you decide to join the club. There's a discount for members."],
      ['Man', "Well, I'm not sure about that yet."],
      ['Woman', "You've got plenty of time to decide."],
      ['Man', 'And does the cost include everything?'],
      ['Woman', "Yes, everything's included and you also get a really good dictionary explaining all the sailing terminology. A lot of people struggle with this at first. It's got lots of pictures, so I'm sure you'd find it really helpful. And on completion of the course you get a certificate. Then you're ready to move on to the Level 2 course."],
      ['Man', 'Sounds good.'],
      ['Woman', "I think that's all the info you need for now. Just a couple of general things. For example, it's really important that you know how to swim."],
      ['Man', "Yes, I'm pretty confident in the water."],
      ['Woman', "Great. The other thing I should tell you is that we provide wetsuits and life jackets but you need to bring swimming trunks and some old trainers."],
      ['Man', 'And a towel?'],
      ['Woman', 'Yes definitely. And you might want to bring your own toiletries, things like shampoo.'],
      ['Man', 'OK. What about food and drink? Do I need to bring that or is there a café at the club?'],
      ['Woman', "Yes, you can get sandwiches, cakes and snacks there. The food's pretty reasonable."],
      ['Man', "OK good. Well I think I'm interested in the Level 1 course. But I know absolutely nothing about sailing so is there anything I can do to prepare myself a bit?"],
      ['Woman', "I recommend you watch some videos we use for training. They're available online. I can send you the link. They'll give you an idea of what to expect."],
      ['Man', "Perfect, thanks. That would be very helpful. Oh and just one other thing - I'll be cycling to the club and will need somewhere to put valuables. I'm just wondering if there are lockers for people to use?"],
      ['Woman', 'Yes, there are plenty in the changing rooms.'],
      ['Man', 'Great. OK well could you book me onto...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 2,
    transcript: fmt('Working as a makeup trainee', [
      [null, "Hello and welcome to the film making podcast. In this week's episode, Claire Lemarre talks to us about how to become a makeup artist. Claire's been working as a makeup artist in the film industry for over 20 years and has lots of useful advice about how to get started."],
      [null, "Thanks Ian. Well, before you can become a makeup artist on films you have to spend about 2 years working as a makeup trainee."],
      [null, "A good place to get your first job would be on a low budget short film. Of course, this means that you'll be working for free. But it's often worth it for the experience. Make sure your transport costs are covered — and remember, there's very unlikely to be any catering provided, so bring plenty of food."],
      [null, "If you're lucky, you might start out on a big budget film where you'll get the most useful experience. On productions like this, makeup and hair styling are separate departments – so you won't need to bring your curling tongs! But you're likely to get the opportunity to work with a range of age groups, as well as different ethnicities. Doing makeup for special effects is highly specialised, so don't expect to be offered any practical experience in that."],
      [null, "One problem with working in the makeup department is that it's a high-pressure environment. There are very few times when you'll be bored or have nothing to do. It can be stressful but you'll see that the top makeup artists are very professional – even when they're having to work with directors who are impatient, or unhappy with the makeup artist's work. Follow your supervisor's lead and try to remain calm at all times."],
      [null, "I've worked with many very famous actors over the years. At first, I found it overwhelming and could hardly speak, I was so in awe. That's preferable, by the way, to becoming too excited and asking for selfies. Now meeting the talent is just a normal part of the job and to be honest most actors don't look that special without all the makeup!"],
      [null, "Every makeup trainee will need a makeup kit, which they'll be expected to have with them at all times. Just the essentials will do for the kinds of tasks you'll be given – it won't be anything complicated. It's worth looking at what the other makeup artists have in their kits – but whatever you do, don't borrow anything without asking first."],
      [null, "It's very important to build your portfolio. You should take photos of all the work you do and ideally show the different stages of makeup application if you can. But remember you'll need to get approval from the makeup designer in charge of the department. As you'll be sending your portfolio digitally, you won't need to get photos printed."],
      [null, "So what does a makeup trainee actually do? You need to think about whether you're the right kind of person to do the job and whether you'd enjoy it. So, to give you some idea, here are some of the things you might be required to do."],
      [null, "You may be asked to help prep an actor ready for makeup. Some actors will arrive having already cleansed and moisturized their skin. But sometimes you'll need to step in and get this done without wasting any time, otherwise the makeup artist will get behind schedule."],
      [null, "Trainees play a useful role in continuity. It will be your responsibility to take photos, log them digitally and print out a hard copy to put in each actor's file. This information needs to be kept in good order as a reshoot can mean replicating makeup months later."],
      [null, "General duties mean doing anything from getting the teas and coffees to putting on a wash. Having a positive attitude and being willing to do whatever is asked of you will help you get your next film job."],
      [null, "You won't be asked to apply makeup to any of the principal cast, only the extras. If there are dozens of extras involved you'll need to keep up a swift pace and not spend too long on each person. It takes quite a lot of confidence to be able to do this well."],
      [null, 'OK now about terms and conditions...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 3,
    transcript: fmt('Ocean biodiversity discussion', [
      ['Phil', "That lecture from the visiting speaker yesterday was good, wasn't it?"],
      ['Lucy', "Yeah. I learned a lot from her about ocean biodiversity. I've already done some reading on it, and I did an assignment on some of the problems associated with it last year, but I especially liked the way her lecture focused on more long-term issues."],
      ['Phil', "Yes, things that aren't currently receiving widespread attention but are likely to be important in the future. That impressed me too. It wasn't exactly a feel-good conclusion because it's hard to see any real solution for a lot of the problems."],
      ['Lucy', 'No, though she did point to where policy changes could be made to protect our marine and coastal environments.'],
      ['Phil', "Mm. But that's just at a national level. The examples she gave were at a more global level, and they really made it clear to me just how wide-ranging the threats to ocean biodiversity are."],
      ['Lucy', 'Yes, me too.'],
      ['Phil', "The research project she described was impressive, wasn't it? I'd have thought it was quite unusual to have so many experts working together."],
      ['Lucy', "Yeah, and from such different backgrounds. Must have been a really exciting team to work with. I'd heard of a couple of them before – they were involved in research way back in 2009 warning about the dangers of ocean pollution."],
      ['Phil', "But now people are much more aware of that, aren't they?"],
      ['Lucy', 'I suppose so.'],
      ['Phil', "Another thing about the research is that the team members came from all round the world. Though I suppose that's not unusual nowadays, now everyone can work remotely."],
      ['Lucy', "Right. I liked the way she didn't bombard us with figures – I mean, they were available, but she focused more on the general points they indicated."],
      ['Phil', 'Mm. And the description of improvements in systems used for tracking marine animals and things like robots were really interesting.'],
      ['Lucy', 'Yes, and her description of how robotics can be used to investigate threats to biodiversity.'],
      ['Phil', 'Absolutely.'],
      ['Phil', "While you're here, can we talk about the list of resources we have to evaluate for the seminar tomorrow. I've had a look at them all, but it's been a bit of a rush."],
      ['Lucy', 'Yeah. What did you think of that article on invasive lionfish? The one claiming they were expanding their habitat throughout the Mediterranean Sea.'],
      ['Phil', "Well, the writer went on about how dangerous they were in environmental terms, which is probably true, but he didn't really provide much information to explain why."],
      ['Lucy', 'I know what you mean.'],
      ['Phil', 'I watched the documentary on microplastics, at least I started to, but then I found it was made ten years ago so I gave up.'],
      ['Lucy', "I watched to the end but you're right, it was showing its age. People had hardly heard of microplastics then, whereas now everyone knows about them and how dangerous they are."],
      ['Phil', 'Yeah. Did you listen to the podcast on ocean pollution?'],
      ['Lucy', "Mm. I didn't get anything out of it though. Most of it was stating the obvious."],
      ['Phil', 'Yes, it mentioned pesticides and plastic and things, and it clearly made the point that they were a bad thing, but everybody knows that anyway. Did you read that book on coastal ecosystems?'],
      ['Lucy', "The one by John Harper? Yes, I found it hard going at first, it went into a lot of detail about things like the effects of offshore windfarms and fish farms, but actually I ended up with a much better understanding of the issues."],
      ['Phil', 'Yes, I agree and I thought it was a well-written summary of those. And the diagrams helped a lot too.'],
      ['Lucy', "The article on metal toxicity was way above my head, I didn't know anything about how metals from industrial emissions react in the ocean... and I still don't understand it."],
      ['Phil', "I gave up reading after the first chapter – I just couldn't follow it."],
      ['Lucy', 'That podcast on floating marine cities was interesting, though it presented a rather one-sided picture, I thought.'],
      ['Phil', 'Yes, it focused on how this would benefit people and ignored the effects on the environment.'],
      ['Lucy', 'But anyway, shall we...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 4,
    transcript: fmt('Sources of rubber', [
      [null, "Much of the world now lives in an industrial civilisation. But this has only become possible because we have the necessary natural resources. There are three types of natural resource without which industry could not exist. One of these is metal – without that we'd have no machines and no transportation. Another is fossil fuels, which we need to power those machines. But there's a third resource that's essential to connect the different parts of a machine together with belts and pipes and shock absorbers, and that is rubber. It's now used in over 40,000 products, from waterproof footwear to surgical gloves."],
      [null, "At present, we have two types of rubber in common use. One is natural rubber, which nearly all comes from the Pará rubber tree. This was originally native to Brazil, but is now cultivated on plantations in South-East Asia. Recently, however, concern's been growing that supplies may soon be insufficient for the world's needs. So what exactly is limiting the supply of natural rubber?"],
      [null, "Well, for one thing, rubber trees don't just spring up overnight. It can take eight to ten years for a tree to start producing rubber, so cultivating them's a slow process. And this leads to another problem. With most crops, farmers don't have to think very far ahead, so they can easily change what crop they produce, or how much of a crop they produce, if they find the demand for that crop is rising or falling. But if you have to plant eight or ten years ahead, that's much harder. And also the rubber tree's very choosy about where it grows. It needs the right temperature, the right amount of rainfall, and the right altitude – not too high and not too low. The result is that it can't be grown in the northern or southern parts of the globe, only around the equator. Another problem is that the rubber is basically extracted in the same way as it's been done for hundreds of years, and that's by hand, by making small cuts in the trunk of the tree, and putting a little cup there to catch the latex, as the rubber is called. It's very labour-intensive. And it's not just the initial production that's limiting supplies. With other resources such as water and glass, when we've finished using them we can recycle them, but although this is also possible with rubber, it's very difficult, so that also reduces the amount we have available."],
      [null, "And in the last few years, there have been new threats to the supply of natural rubber. One problem is linked to the fact that nearly all the rubber trees in South-East Asia are descended from just a small number of seeds brought from Brazil in the nineteenth century. This means that there's very little genetic diversity among the trees, which in turn makes them very vulnerable to disease. The most dangerous threat is a fungus, which destroyed large numbers of rubber trees in Brazil, and which could cause devastation to plantations worldwide. Another problem is that farmers in South-East Asia are increasingly turning to the cultivation of palm oil, which is easier and more profitable for them. And finally, in recent years South-East Asia, like other parts of the world, has been repeatedly hit by extreme types of weather, and this looks likely to continue in the future."],
      [null, "However, as well as using natural rubber, it's also possible to make rubber synthetically. This works very well for some purposes, for example, making engine parts, or silicone pots and pans used for cooking. But compared with natural rubber, it's not anything like as strong, and this means it can't replace natural rubber in other products. For example, while a mixture of natural rubber and synthetic rubber works well in car tyres, only natural rubber can stand up to the extreme speeds of aircraft tyres during take-off and landing."],
      [null, "So for some time, scientists have been looking for alternative sources of natural rubber. One that's been known about for some time seems initially to be a rather unlikely source. It's a wild plant with yellow flowers that we normally regard as a weed when we see it in our gardens. But when it's pulled up and its roots cut open, they're found to contain rubber."],
      [null, "Now, compared to the rubber tree, dandelions produce relatively small amounts of rubber, but unlike rubber trees, they're very adaptable. They'll grow in all sorts of places, and they don't need rich soil. So at present there are several projects underway investigating the possibility of using dandelions as a source of rubber."],
      [null, 'Another possibility is a desert shrub grown in Mexico and Texas...'],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 2 ══════════════════════════
  {
    testName: 'Cam 21 - Test 2', partNumber: 1,
    transcript: fmt('One-day classes at Steynford College', [
      ['Man', 'Hello, Steynford College external course registration, can I help you?'],
      ['Woman', "Yeah, I'm ringing to find out about one-day classes next year. I got a leaflet about them in the post but I lost it, and I understand some of the classes are filling up fast, so I might need to book quite soon if I want to go ahead."],
      ['Man', 'Sure. Can you remember which one you were considering?'],
      ['Woman', 'There were a few actually. I remember there was one on how to make Vietnamese food that sounded good. I think that was on the 13th of January. It cost about 60 pounds.'],
      ['Man', "Yes, you're right about the date, but it's 59 pounds actually. It's a very popular class, and among other things the teacher explains how Vietnamese food includes lots of different herbs. I'm afraid that all the places are taken at present, but I can put you on the waiting list if you want?"],
      ['Woman', "No, that's OK. I'm quite interested in the bread making class. That's in March sometime, isn't it?"],
      ['Man', 'Yeah, the 20th of March. Would you like to register for that?'],
      ['Woman', "I'm not sure. How much is it?"],
      ['Man', "The actual cost is £48 but then there's an extra charge as well as that for the ingredients – I'm not sure how much that is, no more than twenty pounds I think."],
      ['Woman', 'So what sorts of things do they make in the class?'],
      ['Man', "Oh, various types of bread; I think they make white bread and then they make sourdough, that seems to be very fashionable at present, and they learn how to make pizza, which is apparently really good."],
      ['Woman', "Well I'd definitely be interested in that, but there were also a few other classes that sounded interesting. I think there was one on face massage? I'd love to learn how to do that."],
      ['Man', "Yeah, that's on the 23rd of February and it costs just £35 for the day. The teacher's great, the type of massage done is a traditional technique used in India and she actually did her training there. The massage is meant to relax you and get rid of lines and wrinkles. You practise it on yourself so you have to take a mirror to the class, so you can see what you're doing."],
      ['Woman', 'OK.'],
      ['Woman', 'And I think there was a class in candle making?'],
      ['Man', "Yes that's sometime in April, I think. Let me check... yes, it's on the 6th. It was on the 23rd of January but they had to change the date. It's just £52. That's a popular course too. I think one reason why people like it is because the candles are all made out of natural products. It's filling up fast but there's still a few places left."],
      ['Woman', 'Yes one of my friends did that class. She said the candles make really good presents. In fact she gave me one.'],
      ['Man', "By the way, have you heard about the class on silk painting? That's being held on the 18th of May. You learn how to create designs on silk fabric and colour them using special dyes. Apparently people can produce beautiful artworks that way, either to put on the wall as a picture or to use for something like a scarf. It's £67.50, which is really good value I think – there's a similar class I've seen that was £110."],
      ['Woman', 'That sounds interesting. Would I need to bring the silk?'],
      ['Man', "No, the only thing is everyone has to bring something to protect their clothing, like an apron if you've got one, or a shirt that you don't use any more, because the dye can really stain your clothes."],
      ['Woman', "Right. Then the last class I was considering was a bit different, that was on DIY for beginners. I'd like to learn how to do household repairs. Are there any places left on that?"],
      ['Man', "That's on the 24th of February – yes, there are a few places. It's a bit more expensive – it's £125 – but it's a very popular class. You learn how to use an electric drill and a saw."],
      ['Woman', "Yeah, that would be really useful, and I even need to learn how to use a hammer because I always end up hitting my fingers."],
      ['Man', "Yes, you'll do that too. And when you've learned how to use the basic tools, you do a practical job which is fixing a shelf to a wall."],
      ['Woman', "Great. Just what I need to know. Right, well I'd like to enrol for that and also for..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 2,
    transcript: fmt('Coastal walks and Melby Coal Mine', [
      [null, 'Here is some information about history and nature walks in the region. They can be completed in less than a day and also be combined with a visit to Melby, a former coal mine now open to the public.'],
      [null, "The Marsden Coastal Walk is suitable for all the family as there are no strenuous climbs. The route begins at Marsden harbour, where there are hourly ferries to and from the beautiful Hooker Island, a great place for fishing. The walk covers part of the coastal path trail. As there are clear signposts all along the way, you don't even need to take a map. At one point, the route goes inland slightly and passes a castle built in the 1400s near to a now-vanished market town. The castle's now just a pile of stones but it's a great place to take photos, and fascinating information boards show what it once looked like. If you set off early, you can be back in time for midday."],
      [null, "The Melby Heritage Walk is a great place to take photos, especially of the night sky. At certain times of the year, people come here from far and wide. They climb to the top of the valley and take pictures of the stars. In the daytime, it's completely different. As you hike through the dense woods in the valley bottom, the only things you'll hear are the sound of your own footsteps. At the highest point, you can stop to take in the views, and those with lots of energy can climb the tower that's situated where there was once a seventeenth century hunting lodge. The route continues along the tops of the hills and brings you back down to the starting point – the car park at Melby Coal Mine."],
      [null, 'Melby Coal Mine has been open to the public for twenty years and has won awards for its visitor experience. Many of the buildings around the mine are still standing and have been converted into display areas.'],
      [null, "Firstly, there's an exhibition showing the history of the mine, with many original black and white photos. To see that, you go from the car park, via a covered walkway to the Main Visitor Centre. Go through the ticket office to an area where there are lockers to leave heavy bags in, and where you can borrow raincoats. Beyond that room is the exhibition."],
      [null, "There's a small bathhouse where miners used to wash after their shift underground. You can see that in the building directly to the north of the engine house. The boiler has gone from there now, but there are lines of tin baths on the stone floor."],
      [null, "There's a display of early mining tools from the days before mechanisation. You can find that in a small L-shaped building in the middle of the northern boundary of the site. It's incredible to think how miners were able to use hand implements to cut through rock."],
      [null, 'The vehicle shed, where you can find wagons of different sizes, along with some of the hi-tech cutting machines that were in use until the mine closed, is in the southwest corner of the site, and can be accessed via a covered walkway.'],
      [null, 'There is a field with ponies, which are always popular with children, on the north-eastern boundary of the site, not approached via a covered walkway.'],
      [null, 'The other building to mention is the education centre. This is where school groups go when they visit the mine, but it\'s also accessible to the public as it contains a library and small gift shop. The centre is connected to the ticket office via a short section of covered walkway.'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 3,
    transcript: fmt('Food safety and food fraud discussion', [
      ['Tutor', "Thanks for coming along, Nadia and Fergus. So this is a chance for you to give us some feedback about different aspects of your course. What would you like to begin with?"],
      ['Nadia', "I've enjoyed the sessions on food safety. There was some information there that I found really surprising, although some was stuff I knew already, like the rise in rates of obesity."],
      ['Fergus', "Yeah, that's been in the news a lot. But I hadn't realised that unsafe food causes more than 200 different diseases."],
      ['Nadia', "No, I'd no idea it was that many. And speaking of diseases, I knew resistance to antibiotics is on the increase, but I didn't know why..."],
      ['Fergus', '...that it\'s partly because when animals are treated with antibiotics then consumed by humans, the antibiotics get into the food chain. I had no idea about that either.'],
      ['Nadia', "Then the sessions provided a lot of information about plastic pollution from food packaging in the ocean, but I think that most of us were already aware of that."],
      ['Fergus', "Yeah. But I thought we could have done more on how much food is thrown away unnecessarily through fear of it being out of date, that was only mentioned in passing."],
      ['Tutor', 'OK, I\'ll bear that in mind. What did you think about the sessions from visiting lecturers, Fergus?'],
      ['Fergus', 'For me the most interesting one was about that project to prevent companies giving incorrect information to consumers about food.'],
      ['Tutor', 'Ah, food fraud, yes.'],
      ['Fergus', 'I thought it was really good to address a problem that\'s faced by so many different groups – people with special religious rules, as well as vegetarians and vegans.'],
      ['Nadia', 'And those with allergies.'],
      ['Fergus', 'Yeah. And another thing, we\'ve had effective ways of analysing DNA for some time now and these can easily be applied to analysing food. But what the researchers succeeded in doing was to ensure that these tests were carried out at different stages in the food\'s journey from the producer to the consumer.'],
      ['Nadia', 'So they knew that the food actually came from the place it was supposed to, and had the ingredients it was meant to.'],
      ['Fergus', 'Exactly. So customers can be confident about what they buy.'],
      ['Nadia', 'And the researchers had a good system for publicising their findings too.'],
      ['Fergus', 'Well, I thought there were some problems with that, actually.'],
      ['Tutor', 'OK. And do you have any recommendations for new topics that we could include in the course?'],
      ['Nadia', "Well, I'm interested in how crop yields can be increased without damaging the environment."],
      ['Fergus', "But we've already done quite a bit on that – but not so much on the seafood industry, where stocks are in danger of being overexploited as a food source unless we can find ways of keeping stocks up."],
      ['Nadia', "Yes, that'd be a good topic. And I'm interested in the idea of a personalised approach to diet, now we have the technology to analyse exactly what individuals need."],
      ['Fergus', 'That sounds more like a medical topic than food science.'],
      ['Nadia', 'OK. What about sessions on the variety of food and eating habits around the world? That\'s very relevant nowadays.'],
      ['Fergus', 'Yes, I think the whole class would be interested in that.'],
      ['Nadia', 'Then there\'s technological stuff, things like 3D printing of food and smart packaging.'],
      ['Fergus', 'Mmm – maybe too specialist.'],
      ['Tutor', "Now, I'm particularly interested in your project – the one where you developed a new food product. So talk me through the stages... first you had to decide on your initial aim."],
      ['Fergus', "We decided we wanted to create something people could eat on the go rather than in a restaurant."],
      ['Nadia', "Yeah so we chose falafel, which was originally a Middle Eastern snack."],
      ['Fergus', "We made up our minds about that pretty quickly. I know some students found it a lot harder to choose, and wasted a lot of time."],
      ['Nadia', "Then we had to do the literature review. We hadn't done one of these before so the handout with advice for the project was very useful here."],
      ['Fergus', "Yes, especially the advice on how to present the information. Then product development, actually deciding what we'd use to make the falafel, and for me the interesting thing about that was that we wanted it to be something a bit different from an ordinary falafel."],
      ['Nadia', "We really made the right choice when we finally decided to use jackfruit, even though it wasn't something that either of us had ever tasted before."],
      ['Fergus', "Yeah, like the name tells you, it's a fruit but actually it's really good in savoury dishes. The product production, working out how to make the falafel, was harder than I expected because I'd never made them before."],
      ['Nadia', "It was mostly trial and error. We started off with the basic recipe and then experimented and when it went wrong..."],
      ['Fergus', '...which it did a lot of the time...'],
      ['Nadia', '...we just moved on and kept adapting it and in the end it turned out fine and we had a lot of fun.'],
      ['Fergus', 'We did!'],
      ['Tutor', 'Thank you. Well, your project was a very good...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 4,
    transcript: fmt('Challenges facing the cruise ship industry', [
      [null, "For my presentation today I'm going to talk about some of the issues facing the cruise ship industry and then some ways these can be addressed. The cruise ship industry has partly been responsible for the effects of overtourism in recent decades. Overtourism occurs in places where excessive numbers of tourists cause significant problems. Pollution, for example, is among the greatest threats to many popular tourist destinations."],
      [null, "Of course, for many places it's a difficult balance to achieve. They want to promote their city or island as a desirable tourist destination, but at the same time, are unable to cope with thousands of cruise ship passengers on a daily basis. The trouble is, excessive tourism is destroying the beauty spots and places of interest that people come to visit. Several cities, such as Barcelona, have responded by imposing a tax which all visitors to the city from cruise ships have to pay. But as it's only a couple of euros, many green campaigners think it won't deter enough people to make any difference."],
      [null, "Bruges is another city which became impossible to navigate at times because of the huge numbers of cruise passengers arriving on day trips from the port of Zeebrugge. The city was becoming like a 'theme park', with shops only catering for tourists, selling chocolate, which Belgium is famous for, and other souvenirs. The local council took action to limit cruise passengers to a more manageable level."],
      [null, 'Dubrovnik had to limit the numbers of cruise ships after it became extremely popular as a cruise ship destination when it featured in a hugely successful TV series. What it does now is control the timing of all cruise ship entries to the city\'s port. However, many people feel this measure does not go far enough.'],
      [null, "Cruise ships may be unpopular in some of their destinations but they also have an image problem. They've always been perceived as a safe holiday for the elderly, with not much on offer for families or young couples. A recent survey showed that cost is also a major factor in putting younger groups off going on a cruise. But what they don't realise is that compared to other types of package holidays, cruises can actually be good value, as all activities and drinks are often included. And another perception is that cruises have lots of rules about what to wear and how to behave. But these days, most cruises are no longer very formal and behind the times."],
      [null, 'So what solutions are there for cruise lines to overcome some of these problems? How can they appeal to younger customers? Well one selling point is that cruise ships are becoming more sustainable. New ships are built with hybrid engines with large batteries which means ships do not have to keep their engines running while docked.'],
      [null, "Cruise lines are also designing ships specially for those in the age range of 21 to 45. The décor in these feels contemporary and there are a range of activities on board that you wouldn't find on a more traditional cruise. There's even a boxing ring on one ship, and most offer diving expeditions. But there's also a huge focus on well-being with a variety of sessions of different kinds."],
      [null, 'Food is always a very important part of any cruise and cruise ships have had to radically update their menus to suit the tastes of their younger customers. Vegan dishes are standard, for example. The restaurants on board have also gone paperless with menus available on screen.'],
      [null, 'Unlike older generations who went on cruises largely to get away from everything, younger people expect to be able to keep in touch with friends and family. Many people going on longer cruises also spend time working, so companies have to guarantee wifi that can be relied upon at all times.'],
      [null, 'My grandparents used to love looking through cruise brochures, even when they weren\'t planning on going on a cruise. Until very recently TV ads for cruises always felt dated and aimed at retirees. Cruise lines have been slow to adopt the power of social media but that\'s all changing. Leading cruise lines now employ top agencies to produce first rate videos for social media channels.'],
      [null, 'It will be interesting to see whether...'],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 3 ══════════════════════════
  {
    testName: 'Cam 21 - Test 3', partNumber: 1,
    transcript: fmt('Ferry to Shetland Islands', [
      ['Tammy', 'You know when you went to the Shetland Islands last year, Paul? Did you go by ferry or did you fly?'],
      ['Paul', 'We went by ferry, Tammy. I prefer driving to flying – the journey feels like part of the holiday.'],
      ['Tammy', 'Mmm. Which ferry company did you use?'],
      ['Paul', "There's only one – it's called Northern Ferries. The ferries all leave from Aberdeen."],
      ['Tammy', 'How frequent are they?'],
      ['Paul', "The service is pretty limited – there's only one ferry leaving every evening in summer anyway, seven days a week – I'm not sure about the winter months. They may only run on four or five days then."],
      ['Tammy', 'OK. So it\'s an overnight trip. I quite like that idea. Leaving at night and waking up as you arrive on the island. Can you remember how much you paid for your tickets?'],
      ['Paul', 'They were really cheap and four people and a car worked out at just under £250.'],
      ['Tammy', 'Really? I was expecting it to be more like £400 during the peak season.'],
      ['Paul', "So was I. It's great value. It's a good idea to book in advance because I think they get booked up quite quickly – especially during the school holidays."],
      ['Tammy', "Yes, I suppose so. I'm just not 100% sure of our plans yet. What if I had to cancel?"],
      ['Paul', "That could be a problem. I don't think it's their policy to give refunds – just a voucher – which you can use at a later date. But you have to cancel a month in advance to get that."],
      ['Tammy', 'Right. Well we need to make up our minds quickly then.'],
      ['Paul', "You'd want to book a cabin too. We booked too late to get a cabin with a window. They're more expensive but much nicer than the inner cabins. You don't have to book a cabin at all but I think it's worth paying for. They also have luxury cabins, which are only for two people and have a TV – but I wouldn't bother with those."],
      ['Tammy', 'No, I agree.'],
      ['Paul', 'The only other thing I can think of is to make sure you bring snacks for the kids. The selection on board is quite limited and not that healthy either.'],
      ['Tammy', 'Mmm. What about wifi on board? Is that any good?'],
      ['Paul', "Not really. So it's best to bring some books for them."],
      ['Tammy', "OK. We may need to bring the dog if I can't get anyone to look after him."],
      ['Paul', "We brought ours and it was fine. The kennels on board are OK – they're quite big – you just need to provide a blanket."],
      ['Tammy', 'Uhuh. Sounds good.'],
      ['Paul', 'It was all very easy really – and it was quite an adventure for the kids. They loved being on the sea at night and in the morning keeping a lookout for dolphins – we saw loads.'],
      ['Tammy', 'Oh, the kids would love that!'],
      ['Paul', 'One other thing. We arrived in Aberdeen hours before the ferry was due to leave so we decided to go somewhere else rather than hang around at the port for so long.'],
      ['Tammy', 'Where did you go?'],
      ['Paul', 'Drum Castle.'],
      ['Tammy', "I've never heard of it. Is that spelt like the instrument?"],
      ['Paul', "Yeah. It's really worth visiting. It's got an impressive tower and beautiful gardens and ancient woodland."],
      ['Tammy', 'Sounds lovely. Does it have a restaurant?'],
      ['Paul', "It's only got a coffee shop – no restaurant. We looked up restaurants in the area and found an Italian one in a village nearby. I can check the name of it for you if you're interested."],
      ['Tammy', 'Oh thanks Paul that would be...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 2,
    transcript: fmt('Advice for street food businesses', [
      [null, "Good evening everyone. My name's Jon and I run Veg Out, a street food business selling vegan food. Since 2012 I've been travelling all around the country cooking vegan food in my converted van and selling it at all kinds of outdoor events. I'm here to give you some advice based on my experience."],
      [null, "The good news is that there's never been a better time to start your own street food business. Street food continues to grow in popularity. I think there are a couple of reasons for this. The first is that street food is a reaction against fast food. Street food ranges from high quality burgers to vegan curries and everything in between. But while fast food is cheap and easy to find, it's not particularly good for you. It's also the same everywhere. What you get with street food on the other hand is something different. People like the idea of trying something they can't get anywhere else. They also like seeing food prepared and which hasn't come straight out of a freezer."],
      [null, "You need to think about the best place to sell your street food. People always think music festivals are an obvious place to start but the cost of renting a space can be huge. And there's always a lot of competition. Food markets, on the other hand, are great because customers are always really interested in food and give great feedback. And if you can get a spot in your local park – fantastic. Usually very relaxed but with lots of customers passing by. Once you get established you'll start getting asked to do parties – which can be really challenging but lots of fun. Having street food at weddings has become quite fashionable too – but you need to really know what you're doing as everything needs to be perfect."],
      [null, "Setting up a street food business costs a lot less than opening a restaurant or café but you'll have to buy some basic equipment. I'd try to get things like hobs and fridges second hand if you can. You can replace them with better quality stuff if your business takes off. Renting is another option but you'll end up spending more money rather than saving it."],
      [null, "You've probably got a good idea about the food you're planning to sell. I expect you've done some research to find out if anyone else is selling a similar product. And you'll have thought about any possible allergies to nuts or eggs etc. But there's one thing people don't always think about and that's how you're going to serve it. On a plate? In a bag? Will you provide a fork? Will it all be easily recyclable or reusable? It's got to be easy to eat and look attractive or customers won't come back."],
      [null, 'Once you get started, you should be prepared for things to go wrong. Every business faces problems and here are a few examples from street food businesses that I know.'],
      [null, 'My friends who run Thai Basil started by juggling their street food business with their day jobs in a restaurant. Their work-life balance was non-existent as they were working til midnight in the restaurant all week and then took their food truck to markets on their days off.'],
      [null, 'The owners of Basque found it was hard to make a profit because the price of fish – essential for some of their dishes – was so high. And it was hard to charge customers a lot more for those dishes. So they had to stop focussing on fish dishes and include more vegetarian food.'],
      [null, "The owners of Lou's kitchen were making salads to order from their van and some of their dishes were quite complicated. At one of their first events they ended up with people standing in a long queue for more than 15 minutes – and many of them lost patience. So make sure whatever you offer can be served quickly and efficiently."],
      [null, "The owners of Chip Chop had found a perfect venue near a beach where there weren't any other street food trucks. But what they hadn't realised was that they'd need a special licence – which individual businesses don't need at markets or festivals. It was a complicated process and in the end they gave up."],
      [null, "So I hope that's given you a flavour of..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 3,
    transcript: fmt('Ethical and sustainable fashion discussion', [
      ['Maddy', 'Shall we go through our research for our sustainable fashion project?'],
      ['Ryan', "Good idea. I think I've done enough reading now."],
      ['Maddy', "Me too. I've learnt such a lot about what sustainability actually means."],
      ['Ryan', "Mmm, same for me with ethical fashion. I didn't really appreciate the difference between that and sustainable fashion before doing this research."],
      ['Maddy', "I know – most people use these terms interchangeably – but in fact the difference is quite distinct. Sustainable relates to the environment and ethical relates more to the way workers or animals are treated."],
      ['Ryan', "I totally understand why people get confused, though. There are so many other terms used – like 'eco-friendly', which is actually quite meaningless."],
      ['Maddy', "And the way companies use these terms when describing their products doesn't help. They're often deliberately vague, and don't provide enough information about how their products are made."],
      ['Ryan', 'Yes.'],
      ['Maddy', "It was interesting to read about the debates surrounding wool production and how ethical and sustainable that is. It's generally considered to be sustainable because it's a natural product."],
      ['Ryan', "And it also lasts a long time and can be recycled. All very positive. But I wasn't convinced by the argument that wool production is sustainable because it doesn't use many chemicals – what about all the fungicides and insecticides used in sheep farming?"],
      ['Maddy', "Good point. And I couldn't find any evidence for the claim about sheep farming being better for the environment than cattle farming."],
      ['Ryan', "No – they're both really bad. I read different reports about how unethical it is to even shear sheep. Some people say it's cruel but as long as the sheep are kept in good condition I can't see anything wrong with it."],
      ['Maddy', 'Me neither.'],
      ['Ryan', 'Shall we talk about some of the semi-synthetic new fabrics now?'],
      ['Maddy', "OK, let's do that."],
      ['Ryan', "Let's start with Lyocell, I've been reading about that."],
      ['Maddy', "Yeah, that's the one produced from the pulp of eucalyptus trees, isn't it?"],
      ['Ryan', "Yes, and what happens with that is really impressive. Over 99% of dissolving agents used in the manufacturing process are used again."],
      ['Maddy', "Yeah. Now, there are a few semi-synthetic fabrics that I'd never heard of. Like Cupro, for example."],
      ['Ryan', "Made from byproducts of the cotton industry to create a kind of vegan silk. But I'm not sure how sustainable this really is as there are so many reports of pollution caused by the manufacturing process."],
      ['Maddy', "Mmm. It doesn't compare favourably with all the other sustainable fabrics we've looked at, no."],
      ['Ryan', "Bamboo is one fabric we're all familiar with. But I didn't know that it was only organic bamboo that's truly sustainable."],
      ['Maddy', "Me neither. Apparently, the manufacturing process for a significant proportion of bamboo is chemically quite intensive – which obviously can be quite damaging."],
      ['Ryan', 'EcoVero is an example of a semi-synthetic fabric which is becoming really popular.'],
      ['Maddy', "Probably because manufacturing causes 50 percent fewer emissions and takes up half as much energy as conventional fabrics. That saves production costs as well as being better for the environment."],
      ['Ryan', "That's true. I think demand for cork will continue to grow. It works really well in vegan shoes and bags."],
      ['Maddy', "Mmm and it's the only fabric that's fundamentally sustainable – the cork trees it comes from are renewable and the product itself is both recyclable and biodegradable – which is unique."],
      ['Ryan', 'And the harvesting process is actually good for the trees. There are no downsides to using this source at all.'],
      ['Maddy', 'Hemp is another really good sustainable fabric from a natural source.'],
      ['Ryan', "Yes. Did you know that clothes made from hemp protect the wearer from the sun and it's also antibacterial?"],
      ['Maddy', "No, I didn't. But I did read that it's quite hard to grow, so perhaps that's why it's not as common as you'd think."],
      ['Ryan', "I'm sure that'll change."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 4,
    transcript: fmt('Invasive species', [
      [null, "Today I'm going to talk about invasive species. Let me start by saying what an invasive species is and what it's not. Invasive species are any animal or plant that is introduced into an environment by humans, and which is then harmful to that environment. It's important to be clear that not all introduced species are invasive. Many introduced – or non-native – species thrive in new areas without posing any threat."],
      [null, "In some cases, invasive species have changed the natural world beyond recognition, so let's look at the different ways they can be problematic. First of all, invasive species may eat native species, or sometimes they may bring a disease with them, which native species have never faced before and therefore have no defences against. Often the invasive species breed very quickly – which further adds to the problem of native species losing their sources of food. Species invasions are one of the biggest causes of damage in an ecosystem, actually putting its survival at risk."],
      [null, "So, how do invasive species spread? Without a doubt, the biggest cause is human activity. This could be intentional, or it could be accidental, such as when people who've been on holiday in another country come back with, say, the seeds of plants on their clothes or shoes. Plants and animals, especially insects, arrive in or on the cargo of ships, and then escape into their new 'home'. But sometimes humans deliberately move animals and plants around the world, for example to use them to control pests on farms, or to be pets. This can go very wrong if those animals and plants move into wild settings and start breeding or begin growing in ways that weren't predicted."],
      [null, "Let's now look at an example of an invasive species here in Australia: Rhinella marina is a species of toad that was deliberately introduced from Hawaii in 1935 as a form of biological control. It was hoped that the toads would eat the grey-backed beetles responsible for destroying crops of sugar on many of the plantations. At first, just a handful of toads were released by scientists into Queensland, but this number soon grew as other states followed suit. Within two years, 62,000 young toads had been released into the wild. The toads did nothing to protect the plantations, but they did reproduce rapidly and could soon be found all over the northern half of the country. The toads are poisonous at every stage of their life cycle, and anything that eats them will die."],
      [null, "My second example regarding invasive species is the United Kingdom. Actually, there are more than three-thousand invasive species there, including some that are extremely common. Some invasive plants, such as Japanese knotweed, have had a devastating impact on parts of the UK. Gardeners in the nineteenth century considered it a beautiful ornamental plant – which it is, when it's kept under control – but it soon spread into the countryside and remains a problem even to this day as it's so hard to eradicate. Another invasive plant is rhododendrons, which can be found in UK parks and woodlands. Their introduction dates back to 1763, but they're now seen as harmful because they block out so much light that native wild flowers can't grow beneath them."],
      [null, "And then there are grey squirrels, which are one invasive species almost everyone in the UK will have come across. They were brought to the UK from North America and introduced to private estates around the 1870s but are now found everywhere, from forests to city squares. Grey squirrels have outcompeted the smaller, native red squirrels. They both eat the same food, and the grey squirrels carry a type of virus that is deadly to the red squirrels. Red squirrel populations have collapsed, and there are only a handful of sites left in the UK where they're found."],
      [null, "An important question for ecologists worldwide is, what can we do to tackle the problem of invasive species? The first step in controlling invasive species is learning about the behaviour of new species coming into the country. Monitoring is an important part of this, so that we can know if the new species begins to have a negative impact in its new environment. One effective way to keep track of invasive species is to create a database for the whole country. That way, all relevant authorities and agencies can share important information and take whatever action's needed. But the public also have a vital role to play in this process. They should be encouraged to photograph harmful species – because this helps with identification – and then to report when and where these were observed. But it's important to tell people not to destroy or even touch what they've found."],
      [null, "Now, I'm going to move on to..."],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 4 ══════════════════════════
  {
    testName: 'Cam 21 - Test 4', partNumber: 1,
    transcript: fmt('Survey about shopping in Broadbeach', [
      ['Woman', "Good morning. I'm doing a survey of shoppers in Broadbeach. Would you have a few minutes to spare to answer some questions?"],
      ['Man', 'Oh...erm...yes, I guess that would be ok.'],
      ['Woman', "Thank you very much. Everybody seems so busy today."],
      ['Man', "Well actually I don't have loads of time, so..."],
      ['Woman', "Oh yes, of course. It really won't take long. Could I start by taking your name please?"],
      ['Man', "Martyn Leigh. Martyn's with a Y."],
      ['Woman', 'And is your family name spelt L-double-E?'],
      ['Man', "It's L-E-I-G-H."],
      ['Woman', "Thank you. We don't actually publish your name or details. It just makes it easier for me to identify people when I look at all the results at the end."],
      ['Man', 'I see.'],
      ['Woman', 'And can I ask, how did you get into town today?'],
      ['Man', "Well, normally I catch the bus, but I'm on my motorbike today because I'm going to work later."],
      ['Woman', "And could you tell me what you're doing this morning, I mean, the reason for your trip into town?"],
      ['Man', "I've just been to the hairdresser. You see, I have a job interview at the council in a few days."],
      ['Woman', 'Oh really! Well, good luck with that.'],
      ['Man', "Thanks a lot. And now I'm on my way to buy a suit that I can wear to the interview. I don't actually own one at the moment!"],
      ['Woman', "OK. Is that everything you're planning to do in town?"],
      ['Man', "Yeah. Well, I've got to go and pick up my laptop. It broke a couple of days ago so I took it to the shop to get it fixed. They had to order a spare part, but apparently it's ready for collection now. I can't wait to get it back."],
      ['Woman', "I'm sure. I hate it when my technology breaks down. ...One more thing, it's Saturday today – is that when you like to do your shopping?"],
      ['Man', "Well it's more a question of when I'm free. If I'm free on a Monday, that's when I choose to come into town. The shops are less busy then, which I always prefer."],
      ['Woman', "So, I'd like to ask you a few more questions to get your views about shopping in Broadbeach, if that's ok."],
      ['Man', 'Sure. What would you like to know specifically?'],
      ['Woman', 'What would you say you like best about the shops here?'],
      ['Man', "I'd probably say it's the service you get wherever you go."],
      ['Woman', 'OK. And what do you think about the range of shops in Broadbeach?'],
      ['Man', 'Oh you can get almost anything you want here.'],
      ['Woman', "And what about recent changes? What do you like and dislike about them? For example, there are a lot of new coffee shops now, are you enjoying them?"],
      ['Man', "No, there are too many of them. It's a shame as those places could be occupied by other kinds of shops."],
      ['Woman', 'What would you like to see instead?'],
      ['Man', "Well, I think we have enough clothing shops. But there's only one place that sells books at the moment. It'd be nice to have a choice, you know."],
      ['Woman', 'Right. And have you been to the new shopping centre outside Broadbeach yet, Martyn?'],
      ['Man', "Yes, once or twice. It's not that far from where I live."],
      ['Woman', "It's a very modern-looking building, isn't it?"],
      ['Man', "Yes, and it's lovely. The glass roof is certainly impressive. But my favourite thing is the plants they've put around the building. They're amazing, and so big already."],
      ['Woman', 'And what about the entertainment facilities? Have you used any of them yet? Like the new cinema?'],
      ['Man', "Nah, not yet. I can't see any advantage in having it there because the one in town is actually bigger."],
      ['Woman', 'OK, well thank you so much for...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 2,
    transcript: fmt('Business exhibition podcast', [
      [null, "Hello and welcome to this podcast telling you about our annual business exhibition. This year, as always, it will be full of the very best speakers, features and innovations."],
      [null, "Let me start by reading some feedback from James Craig, who's exhibited with us for the past two years. James says, 'I'm director of a company called TalkCon, which is an office phone system. The first year we exhibited, we had a stand in the Business Village, where we made a lot of useful contacts. We also used the Breakout area where people could sit down and relax, and try out our products, and due to popular request we used that again last year. Last year we also sponsored the innovative Business Connections Zone where people could leave their contact details on a board to contact other companies, and that also effectively raised our corporate profile. We're hoping that in the coming exhibition we'll also have a presence in the Digital Marketing centre, which is clearly a key area for our company. And also maybe have our own Talkcon Zone, at some stage.'"],
      [null, "The exhibition's open from 8am to 11pm and there's a range of special events for you to enjoy in the evening."],
      [null, "As well as a unique chance to publicise your company, businesses who exhibit with us can claim discounts on a number of popular brands, including major high street fashion and jewellery outlets, as well as grocery chains. Discounts available range from 3.5% up to an amazing 15%, so you can save a lot of money. In fact, the average saving made by each exhibitor came to over £400! The scheme is available to every member of your organisation so this is a benefit that really does have something for you all."],
      [null, "Now let me tell you about some of our keynote speakers for this year's exhibition."],
      [null, "Jim Clowrie started off selling vegetables from a small plot, then opened a small café. Rather to his surprise this became a bit of a sensation, and in a remarkably short time he had opened an amazing 76 restaurants worldwide. He'll be telling you how it all happened, and how it changed his life."],
      [null, "David France will be giving an inspirational talk about how as a business-minded teenager he managed to set up his own company, and even to be the first person under 18 to get a business bank account. David's company has gone from strength to strength but he isn't just interested in making money – he also makes regular donations to organisations helping those in need both in the UK and elsewhere in the world."],
      [null, "Oliver Stanton was born and educated in the UK, and then went to Malaysia where he set up a rubber-wood furniture business. He then built log houses in the mountains in Japan before moving to Hong Kong to set up a digital marketing business. After that he moved back to the UK with his wife Saiphin, and together they opened a Thai café. He'll be telling you about what he discovered during his travels around the world about business practices in different cultures."],
      [null, "Francesca Heptonstall is a broadcaster and businesswoman who's known for her down-to-earth attitude. After winning a top job in a TV contest, she launched a number of online deal sites. Her main business interest is in technology, but she's also passionate about helping people gain employment and organises an annual jobs fair, so she'll be concentrating on this in her talk."],
      [null, "Salman Khan is the Chief Executive of QBF Enterprises, and has turned around this business from a major publishing business to one of the UK's largest digital marketing service providers. He'll be talking about the need for flexibility to cope with new directions in today's business world."],
      [null, "Finally, Annie Craven is a consultant and coach who works with people to create lasting changes in their business and life. Her session will offer an interactive look at different obstacles in people's own lives, not just in business. She also looks at how you can overcome them, whether you're starting out in business or at the top of your game."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 3,
    transcript: fmt('Presentation on houses of the future', [
      ['Mia', "You know that joint presentation we've got to do this semester, Leo?"],
      ['Leo', 'On houses of the future?'],
      ['Mia', "That's right. I'm a bit concerned – are we meant to come up with creative new suggestions for these houses?"],
      ['Leo', "I don't think so. It's more a matter of reporting and evaluating possible developments. But we mustn't be too general, we've got to support our points by referring to specific cases. So that'll need a lot of work."],
      ['Mia', "I'm afraid so. When's it got to be done by?"],
      ['Leo', "In about 6 weeks, so that's not too much of a rush."],
      ['Mia', "Good. We'd better decide now what type of housing we're going to focus on."],
      ['Leo', 'How about housing for different generations living together?'],
      ['Mia', 'We could do. Or accommodation for one person?'],
      ['Leo', "I think someone else is doing that. I was wondering about housing for the elderly? That's likely to become more important."],
      ['Mia', "Yeah that's true. But I think your suggestion about intergenerational living might be more interesting – let's go with that."],
      ['Leo', "OK. Now I think the future demand is mainly going to be for accommodation in urban areas. So one way of meeting that demand might be to use existing commercial buildings and adapt them to form accommodation..."],
      ['Mia', "...or come up with original ways of organising space so that people can live in smaller homes. But I think the solution is to design multi-storey apartment blocks."],
      ['Leo', 'Building up rather than out, yes.'],
      ['Mia', 'Let\'s think of some specific developments for houses of the future.'],
      ['Leo', 'OK. How about increased use of roof space on high-rise buildings for gardens.'],
      ['Mia', "Yes. In fact it doesn't have to be high-rise, you can do it on a one-storey building in a suburb, but it would greatly improve how you feel if you live in an urban high-rise."],
      ['Leo', "Especially if you don't have a balcony."],
      ['Mia', "Yes. I think homes of the future will all need access to a shared working space, somewhere in the same building or group of houses, where people can go and work instead of just having a laptop on the kitchen table."],
      ['Leo', "Yes, so they aren't having to travel to an office but can still interact with others. That's often how new ideas get generated – by chatting to someone from a different profession."],
      ['Mia', "Yeah. I read about a type of design where the internal walls of an apartment are moveable, so the space can be adapted over time as people's needs change."],
      ['Leo', "Like when children leave school and start working but still continue to live with their parents for many years? Or when an elderly relative moves in with the family... it would mean they could still have their own space, specially designed for their needs."],
      ['Mia', "Yes. Have you heard about those smart bathroom mirrors which can monitor people's health? They recognise signs of illness and contact a doctor automatically?"],
      ['Leo', "Hmm, not so sure they're a good idea."],
      ['Mia', "Nor am I. People might worry about conditions which aren't serious at all."],
      ['Leo', "What about transport? Wouldn't it be good if there were bike sheds with charging points, so people could store their electric bikes securely and charge them up at the same time."],
      ['Mia', 'Yes. That would encourage more people to cycle, instead of using their car. Much better for the planet.'],
      ['Leo', 'I read about one housing development where cars had to be left just outside it, so the centre was all a pedestrianised area. Great for families with children.'],
      ['Mia', "Maybe. But what if you're disabled or elderly, and can't walk far? It wouldn't be so good for people like that."],
      ['Leo', 'No.'],
      ['Mia', "I saw a scheme for communal vegetable plots, where neighbours could decide what to grow together. That'd be a great way for older people to get to know one another, especially if they're no longer going out to work."],
      ['Leo', "Yes, doing something together's always more enjoyable, isn't it? Do you think..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 4,
    transcript: fmt('Music therapy for surgical patients', [
      [null, "Today's lecture is about studies that look at how music therapy can be used to help patients who undergo surgery. Now, most people undergo a surgical procedure at some point in their lives. And more than fifty-one million operations are performed annually in the USA. But there's no escaping the fact that most patients feel uncomfortable following surgery. They may have difficulty mobilising, and even sitting up in bed can feel too much. They may also be negatively affected by having their routine disturbed, you know, like if they can't do the things they normally do, or have to devote a lot of time to appointments such as physiotherapy, to aid their recovery."],
      [null, "Currently, the main strategy for improving recovery is medication to control pain, and this can be administered to patients in the short, medium or longer term, depending on the extent of their surgery. But music is still not an everyday part of the post-surgical phase, despite a wealth of relevant studies supporting its potential in recovery."],
      [null, "Earlier this year, a research team set out to assess all the available evidence so that they could highlight the potential for music in surgical recovery. They identified nearly a hundred trials involving a total of seven thousand patients who were played recorded music as part of their post-operative care. The researchers then looked at what impact the music had on the patients. They discovered that patients who had been played music reported feeling happier and more satisfied in the post-operative phase, and the length of their stay was shorter than for patients who had not listened to any music."],
      [null, "The researchers also explored the patients' choice of music, and their findings showed that a wide variety of music styles was evident. However, a common factor was that the chosen music had a calming quality. Some of the patients listened to music with headphones, but it was quiet enough not to prevent them from being able to communicate with nurses and other staff. More often though, the mode of delivery was by what are known as music pillows. These broadcast sound that is only audible to the person lying on them. The research involved testing music before, during or after operations or a combination. Some patients listened to the music just once a day, while others had several episodes a day."],
      [null, "When asked to report their experience of listening to music, surgical patients said that either they had no feelings of anxiety at any point, or those feelings were only slight. Patients who hadn't listened to music, on the other hand, reported higher levels of dissatisfaction. This feedback from all of the patients was then cross-checked against their medical notes. And in every case, those who were given music to listen to didn't need as much medication to ease their pain as those patients who weren't played music. The type of music, patient choice and timing, before, during or after the surgery didn't make much difference. And it even worked when patients were played music under general anaesthetic, although the positive effects were greater when patients were awake."],
      [null, "All the evidence suggests that music has a positive effect on post-operative patients, but it's not entirely clear how or why this is the case. A lot of people listen to music in daily life as a way to relax and forget their problems, but the researchers came to the conclusion that it worked on patients by distraction. I suppose it was something familiar and gave them something they could control."],
      [null, "The researchers say there is now sufficient research to demonstrate that music should be available to all patients undergoing operations. They say patients should be able to choose what they'd like to listen to, and if they prefer, recordings taken from nature can be just as good as music. Surgical teams may prefer patients to listen to music before the procedure or as soon as they arrive back onto the ward. Clearly, there's more to learn about this area, and the team now plan to focus their next research on the most appropriate volume to play the music at. And I look forward to reading the results of their study."],
    ]),
  },
];

async function runSeedTranscripts() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS_Transcripts) {
    const { testName, partNumber, transcript } = target;

    // 1) Embedded copy on ListeningTest.sections[]
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    // 2) Standalone ListeningSection ("Bài lẻ Listening" library) — same
    // title-resolution logic used when these docs were first created.
    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscripts] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped, only the ListeningTest copy was updated.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscripts] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS_Transcripts.length} targets).`);
}


// Same approach/format as seedListeningTranscripts.js (Cam 21) — sourced
// from published Cambridge IELTS 15 audioscripts (ieltstrainingonline.com),
// verified sentence by sentence against every question's correctAnswer
// already in the DB before being written here. Covers Cam 15 Tests 2-4
// (Test 1 already had transcripts).


const TARGETS_Cam15 = [
  // ══════════════════════════ Cam 15 - Test 2 ══════════════════════════
  {
    testName: 'Cam 15 - Test 2', partNumber: 1,
    transcript: fmt('Town festival information', [
      ['Tim', "Good morning. You're through to the tourist information office, Tim speaking. How can I help you?"],
      ['Jean', "Oh hello. Could you give me some information about next month's festival, please? My family and I will be staying in the town that week."],
      ['Tim', 'Of course. Well it starts with a concert on the afternoon of the 17th.'],
      ['Jean', "Oh I heard about that. The orchestra and singers come from the USA, don't they?"],
      ['Tim', "They're from Canada. They're very popular over there. They're going to perform a number of well-known pieces that will appeal to children as well as adults."],
      ['Jean', 'That sounds good. My whole family are interested in music.'],
      ['Tim', "The next day, the 18th, there's a performance by a ballet company called Eustatis."],
      ['Jean', 'Sorry?'],
      ['Tim', "The name is spelt E-U-S-T-A-T-I-S. They appeared in last year's festival, and went down very well. Again, their programme is designed for all ages."],
      ['Jean', "Good. I expect we'll go to that. I hope there's going to be a play during the festival, a comedy, ideally."],
      ['Tim', "You're in luck! On the 19th and 20th a local amateur group are performing one written by a member of group. It's called Jemima. That'll be on in the town hall. They've already performed it two or three times. I haven't seen it myself, but the review in the local paper was very good."],
      ['Jean', 'And is it suitable for children?'],
      ['Tim', "Yes, in fact it's aimed more at children than at adults, so both performances are in the afternoon."],
      ['Jean', 'And what about dance? Will there by any performances?'],
      ['Tim', 'Yes, also on the 20th, but in the evening. A professional company is putting on a show of modern pieces, with electronic music by young composers.'],
      ['Jean', 'Uh-huh.'],
      ['Tim', "The show is about how people communicate, or fail to communicate, with each other, so it's got the rather strange name, Chat."],
      ['Jean', "I suppose that's because that's something we do both face to face and online."],
      ['Tim', "That's right."],
      ['Tim', "Now there are also some workshops and other activities. They'll all take place at least once every day, so everyone who wants to take part will have a chance."],
      ['Jean', "Good. We're particularly interested in cookery – you don't happen to have a cookery workshop, do you?"],
      ['Tim', "We certainly do. It's going to focus on how to make food part of a healthy lifestyle, and it'll show that even sweet things like cakes can contain much less sugar than they usually do."],
      ['Jean', "That might be worth going to. We're trying to encourage our children to cook."],
      ['Tim', "Another workshop is just for children, and that's on creating posters to reflect the history of the town. The aim is to make children aware of how both the town and people's lives have changed over the centuries. The results will be exhibited in the community centre. Then the other workshop is in toy-making, and that's for adults only."],
      ['Jean', "Oh, why's that?"],
      ['Tim', "Because it involves carpentry – participants will be making toys out of wood, so there'll be a lot of sharp chisels and other tools around."],
      ['Jean', 'It makes sense to keep children away from it.'],
      ['Tim', 'Exactly. Now let me tell you about some of the outdoor activities. There\'ll be supervised wild swimming …'],
      ['Jean', "Wild swimming? What's that?"],
      ['Tim', 'It just means swimming in natural waters, rather than a swimming pool.'],
      ['Jean', 'Oh OK. In a lake, for instance.'],
      ['Tim', "Yes, there's a beautiful one just outside the town, and that'll be the venue for the swimming. There'll be lifeguards on duty, so it's suitable for all ages. And finally, there'll be a walk in some nearby woods every day. The leader is an expert on insects. He'll show some that live in the woods, and how important they are for the environment. So there are going to be all sorts of different things to do during the festival."],
      ['Jean', 'There certainly are.'],
      ['Tim', "If you'd like to read about how the preparations for the festival are going, the festival organizer is keeping a blog. Just search online for the festival website, and you'll find it."],
      ['Jean', 'Well, thank you very much for all the information.'],
      ['Tim', "You're welcome. Goodbye."],
      ['Jean', 'Goodbye.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 2,
    transcript: fmt('Minster Park', [
      ['Woman', "I'm very pleased to welcome this evening's guest speaker, Mark Logan, who's going to tell us about the recent transformation of Minster Park. Over to you, Mark."],
      ['Mark', "Thank you. I'm sure you're all familiar with Minster Park. It's been a feature of the city for well over a century, and has been the responsibility of the city council for most of that time. What perhaps isn't so well known is the origin of the park: unlike many public parks that started in private ownership, as the garden of a large house, for instance, Minster was some waste land, which people living nearby started planting with flowers in 1892. It was unclear who actually owned the land, and this wasn't settled until 20 years later, when the council took possession of it."],
      ['Mark', "You may have noticed the statue near one of the entrances. It's of Diane Gosforth, who played a key role in the history of the park. Once the council had become the legal owner, it planned to sell the land for housing. Many local people wanted it to remain a place that everyone could go to, to enjoy the fresh air and natural environment – remember the park is in a densely populated residential area. Diane Gosforth was one of those people, and she organised petitions and demonstrations, which eventually made the council change its mind about the future of the land."],
      ['Mark', 'Soon after this the First World War broke out, in 1914, and most of the park was dug up and planted with vegetables, which were sold locally. At one stage the army considered taking in over for troop exercises and got as far as contacting the city council, then decided the park was too small to be of use. There were occasional public meetings during the war, in an area that had been retained as grass.'],
      ['Mark', "After the war, the park was turned back more or less to how it had been before 1914, and continued almost unchanged until recently. Plans for transforming it were drawn up at various times, most recently in 2013, though they were revised in 2015, before any work had started. The changes finally got going in 2016, and were finished on schedule last year."],
      ['Mark', "OK, let me tell you about some of the changes that have been made – and some things that have been retained. If you look at this map, you'll see the familiar outline of the park, with the river forming the northern boundary, and a gate in each of the other three walls. The statue of Diane Gosforth has been moved: it used to be close to the south gate, but it's now immediately to the north of the lily pond, almost in the centre of the park, which makes it much more visible."],
      ['Mark', "There's a new area of wooden sculptures, which are on the river bank, where the path from the east gate makes a sharp bend."],
      ['Mark', "There are two areas that are particularly intended for children. The playground has been enlarged and improved, and that's between the river and the path that leads from the pond to the river."],
      ['Mark', "Then there's a new maze, a circular series of paths, separated by low hedges. That's near the west gate – you go north from there towards the river and then turn left to reach it."],
      ['Mark', "There have been tennis courts in the park for many years, and they've been doubled, from four to eight. They're still in the south-west corner of the park, where there's a right-angle bend in the path."],
      ['Mark', "Something else I'd like to mention is the new fitness area. This is right next to the lily pond on the same side as the west gate."],
      ['Mark', "Now, as you're all gardeners, I'm sure you'll like to hear about the plants that have been chosen for the park."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 3,
    transcript: fmt('Display on Charles Dickens', [
      ['Cathy', "OK, Graham, so let's check we both know what we're supposed to be doing."],
      ['Graham', 'OK.'],
      ['Cathy', "So, for the university's open day, we have to plan a display on British life and literature in the mid-19th century."],
      ['Graham', "That's right. But we'll have some people to help us find the materials and set it up, remember – for the moment, we just need to plan it."],
      ['Cathy', "Good. So have you gathered who's expected to come and see the display? Is it for the people studying English, or students from other departments? I'm not clear about it."],
      ['Graham', "Nor me. That was how it used to be, but it didn't attract many people, so this year it's going to be part of an open day, to raise the university's profile. It'll be publicised in the city, to encourage people to come and find out something of what does on here, and it's included in the information that's sent to people who are considering applying to study here next year."],
      ['Cathy', 'Presumably some current students and lecturers will come?'],
      ['Graham', "I would imagine so, but we've been told to concentrate on the other categories of people."],
      ['Cathy', "Right. We don't have to cover the whole range of 19th-century literature, do we?"],
      ['Graham', "No, it's entirely up to us. I suggest just using Charles Dickens."],
      ['Cathy', "That's a good idea. Most people have heard of him, and have probably read some of his novels, or seen films based on them, so that's a good lead-in to life in his time."],
      ['Graham', "Exactly. And his novels show the awful conditions that most people had to live in, don't they: he wanted to shock people into doing something about it."],
      ['Cathy', 'Did he do any campaigning, other than writing?'],
      ['Graham', "Yes, he campaigned for education and other social reforms, and gave talks, but I'm inclined to ignore that and focus on the novels."],
      ['Cathy', 'Yes, I agree.'],
      ['Cathy', 'OK, so now shall we think about a topic linked to each novel?'],
      ['Graham', "Yes. I've printed out a list of Dicken's novels in the order they were published, in the hope you'd agree to focus on him!"],
      ['Cathy', "You're lucky I did agree! Let's have a look. OK, the first was The Pickwick Papers, published in 1836. It was very successful when it came out, wasn't it, and was adapted for the theatre straight away."],
      ['Graham', "There's an interesting point, though, that there's a character who keeps falling asleep, and that medical condition was named after the book – Pickwickian Syndrome."],
      ['Cathy', 'Oh, so why don\'t we use that as the topic, and include some quotations from the novel?'],
      ['Graham', "Right, Next is Oliver Twist. There's a lot in the novel about poverty. But maybe something less obvious …"],
      ['Cathy', "Well Oliver is taught how to steal, isn't he? We could use that to illustrate the fact that very few children went to school, particularly not poor children, so they learnt in other ways."],
      ['Graham', "Good idea. What's next?"],
      ['Cathy', "Maybe Nicholas Nickleby. Actually he taught in a really cruel school, didn't he?"],
      ['Graham', "That's right. But there's also the company of touring actors that Nicholas joins. We could do something on theatres and other amusements of the time. We don't want only the bad things, do we?"],
      ['Cathy', 'OK.'],
      ['Graham', "What about Martin Chuzzlewit? He goes to the USA, doesn't he?"],
      ['Cathy', 'Yes, and Dickens himself had been there a year before, and drew on his experience there in the novel.'],
      ['Graham', 'I wonder, though … The main theme is selfishness, so we could do something on social justice? No, too general, let\'s keep to your idea – I think it would work well.'],
      ['Cathy', "He wrote Bleak House next – that's my favourite of his novels."],
      ['Graham', 'Yes, mine too. His satire of the legal system is pretty powerful.'],
      ['Cathy', "That's true, but think about Esther, the heroine. As a child she lives with someone she doesn't know is her aunt, who treats her very badly. Then she's very happy living with her guardian, and he puts her in charge of the household. And at the end she gets married and her guardian gives her and her husband a house, where of course they're very happy."],
      ['Graham', 'Yes, I like that.'],
      ['Cathy', "What shall we take next? Little Dorrit? Old Mr Dorrit has been in a debtors' prison for years …"],
      ['Graham', "So was Dicken's father, wasn't he?"],
      ['Cathy', "That's right."],
      ['Graham', 'What about focusing on the part when Mr Dorrit inherits a fortune, and he starts pretending he\'s always been rich?'],
      ['Cathy', 'Good idea.'],
      ['Graham', "OK, so next we need to think about what materials we want to illustrate each issue. That's going to be quite hard."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 4,
    transcript: fmt('Agricultural programme in Mozambique', [
      [null, 'I\'m going to report on a case study of a programme which has been set up to help rural populations in Mozambique, a largely agricultural country in South-East Africa.'],
      [null, 'The programme worked with three communities in Chicualacuala district, near the Limpopo River. This is a dry and arid region, with unpredictable rainfall. Because of this, people in the area were unable to support themselves through agriculture and instead they used the forest as a means of providing themselves with an income, mainly by selling charcoal. However, this was not a sustainable way of living in the long term, as they were rapidly using up this resource.'],
      [null, 'To support agriculture in this dry region, the programme focused primarily on making use of existing water resources from the Limpopo River by setting up systems of irrigation, which would provide a dependable water supply for crops and animals. The programme worked closely with the district government in order to find the best way of implementing this. The region already had one farmers\' association, and it was decided to set up two more of these. These associations planned and carried out activities including water management, livestock breeding and agriculture, and it was notable that in general, women formed the majority of the workforce.'],
      [null, 'It was decided that in order to keep the crops safe from animals, both wild and domestic, special areas should be fenced off where the crops could be grown. The community was responsible for creating these fences, but the programme provided the necessary wire for making them.'],
      [null, 'Once the area had been fenced off, it could be cultivated. The land was dug, so that vegetables and cereals appropriate to the climate could be grown, and the programme provided the necessary seeds for this. The programme also provided pumps so that water could be brought from the river in pipes to the fields. However, the labour was all provided by local people, and they also provided and put up the posts that supported the fences around the fields.'],
      [null, 'Once the programme had been set up, its development was monitored carefully. The farmers were able to grow enough produce not just for their own needs, but also to sell. However, getting the produce to places where it could be marketed was sometimes a problem, as the farmers did not have access to transport, and this resulted in large amounts of produce, especially vegetables, being spoiled. This problem was discussed with the farmers\' associations and it was decided that in order to prevent food from being spoiled, the farmers needed to learn techniques for its preservation.'],
      [null, 'There was also an additional initiative that had not been originally planned, but which became a central feature of the programme. This was when farmers started to dig holes for tanks in the fenced-off areas and to fill these with water and use them for breeding fish – an important source of protein. After a time, another suggestion was made by local people which hadn\'t been part of the programme\'s original proposal, but which was also adopted later on. They decided to try setting up colonies of bees, which would provide honey both for their own consumption and to sell.'],
      [null, 'So what lessons can be learned from this programme? First of all, it tells us that in dry, arid regions, if there is access to a reliable source of water, there is great potential for the development of agriculture. In Chicualacuala, there was a marked improvement in agricultural production, which improved food security and benefited local people by providing them with both food and income. However, it\'s important to set realistic timelines for each phase of the programme, especially for its design, as mistakes made at this stage may be hard to correct later on.'],
      [null, 'The programme demonstrates that sustainable development is possible in areas where…'],
    ]),
  },

  // ══════════════════════════ Cam 15 - Test 3 ══════════════════════════
  {
    testName: 'Cam 15 - Test 3', partNumber: 1,
    transcript: fmt('Employment agency job discussion', [
      ['Sally', "Good morning. Thanks for coming in to see us here at the agency, Joe. I'm one of the agency representatives, and my name's Sally Baker."],
      ['Joe', "Hi Sally. I think we spoke on the phone, didn't we?"],
      ['Sally', "That's right, we did. So thank you for sending in your CV. We've had quite a careful look at it and I think we have two jobs that might be suitable for you."],
      ['Joe', 'OK.'],
      ['Sally', 'The first one is in a company based in North London. They\'re looking for an administrative assistant.'],
      ['Joe', 'OK. What sort of company is it?'],
      ['Sally', "They're called Home Solutions and they design and make furniture."],
      ['Joe', "Oh, I don't know much about that, but it sounds interesting."],
      ['Sally', "Yes, well as I said, they want someone in their office, and looking at your past experience it does look as if you fit quite a few of the requirements. So on your CV it appears you've done some data entry?"],
      ['Joe', 'Yes.'],
      ['Sally', "So that's one skill they want. Then they expect the person they appoint to attend meetings and take notes there …"],
      ['Joe', "OK. I've done that before, yes."],
      ['Sally', "And you'd need to be able to cope with general admin."],
      ['Joe', "Filling, and keeping records and so on? That should be OK. And in my last job I also had to manage the diary."],
      ['Sally', "Excellent. That's something they want here too. I'd suggest you add it to your CV – I don't think you mentioned that, did you?"],
      ['Joe', 'No.'],
      ['Sally', "So as far as the requirements go, they want good computer skills, of course, and they particularly mention spreadsheets."],
      ['Joe', 'That should be fine.'],
      ['Sally', "And interpersonal skills – which would be something they'd check with your references."],
      ['Joe', 'I think that should be OK, yes.'],
      ['Sally', "Then they mention that they want someone who is careful and takes care with details – just looking at your CV, I'd say you're probably alright there."],
      ['Joe', 'I think so, yes. Do they want any special experience?'],
      ['Sally', 'I think they wanted some experience of teleconferencing.'],
      ['Joe', "I've got three years' experience of that."],
      ['Sally', "let's see, yes, good. In fact they're only asking for at least one year, so that's great. So is that something that might interest you?"],
      ['Joe', "It is, yes. The only thing is, you said they were in North London so it would be quite a long commute for me."],
      ['Sally', 'OK.'],
      ['Sally', 'So the second position might suit you better as far as the location goes; that\'s for a warehouse assistant and that\'s in South London.'],
      ['Joe', 'Yes, that would be a lot closer.'],
      ['Sally', "And you've worked in a warehouse before, haven't you?"],
      ['Joe', 'Yes.'],
      ['Sally', "So as far as the responsibilities for this position go, they want someone who can manage the stock, obviously, and also deliveries."],
      ['Joe', "That should be OK. You've got to keep track of stuff, but I've always been quite good with numbers."],
      ['Sally', "Good, that's their first requirement. And they want someone who's computer literate, which we know you are."],
      ['Joe', 'Sure.'],
      ['Sally', "Then they mention organisational skills. They want someone who's well organised."],
      ['Joe', 'Yes, I think I am.'],
      ['Sally', 'And tidy?'],
      ['Joe', "Yes, they go together really, don't they?"],
      ['Sally', "Sure. Then the usual stuff; they want someone who can communicate well both orally and in writing."],
      ['Joe', "OK. And for the last warehouse job I had, one of the things I enjoyed most was being part of a team. I found that was really essential for the job."],
      ['Sally', "Excellent. Yes, they do mention that they want someone who's used to that, yes. Now when you were working in a warehouse last time, what sorts of items were you dealing with?"],
      ['Joe', 'It was mostly bathroom and kitchen equipment, sinks and stoves and fridges.'],
      ['Sally', "So you're OK moving heavy things?"],
      ['Joe', "Sure. I'm quite strong, and I've had the training."],
      ['Sally', "Good. Now as far as experience goes, they mention they want someone with a licence, and that you have experience of driving in London – so you can cope with the traffic and so on."],
      ['Joe', 'Yes, no problem.'],
      ['Sally', "And you've got experience of warehouse work … and the final thing they mention is customer service. I think looking at your CV you've OK there."],
      ['Joe', 'Right. So what about pay? Can you tell me a bit more about that, please …'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 2,
    transcript: fmt('Street Play Scheme', [
      ['Presenter', "My guest on the show today is Alice Riches who started the Street Play Scheme where she lives in Beechwood Road. For those of you that don't already know – Street Play involves local residents closing off their street for a few hours so that children have a chance to play in the street safely. She started it in her own street, Beechwood Road, and the idea caught on, and there are now Street Play Schemes all over the city. So when did you actually start the scheme, Alice?"],
      ['Alice', "Well, I first had the idea when my oldest child was still a toddler, so that's about six years ago now – but it took at least two years of campaigning before we were actually able to make it happen. So the scheme's been up and running for three years now. We'd love to be able to close our road for longer – for the whole weekend, from Saturday morning until Sunday evening, for example. At the moment it's just once a week. But when we started it was only once a month. But we're working on it."],
      ['Presenter', 'So what actually happens when Beechwood Road is closed?'],
      ['Alice', "We have volunteer wardens, mostly parents but some elderly residents too, who block off our road at either end. The council have provided special signs but there's always a volunteer there to explain what's happening to any motorists. Generally, they're fine about it – we've only had to get the police involved once or twice."],
      ['Alice', "Now I should explain that the road isn't completely closed to cars. But only residents' cars are allowed. If people really need to get in or out of Beechwood Road, it's not a problem – as long as they drive at under 20 kilometres per hour. But most people just decide not to use their cars during this time, or they park in another street. The wardens are only there to stop through traffic."],
      ['Presenter', 'So can anyone apply to get involved in Street Play?'],
      ['Alice', "Absolutely – we want to include all kids in the city – especially those who live on busy roads. It's here that demand is greatest. Obviously, there isn't such demand in wealthier areas where the children have access to parks or large gardens – or in the suburbs where there are usually more places for children to play outside."],
      ['Alice', "I'd recommend that anyone listening who likes the idea should just give it a go. We've been surprised by the positive reaction of residents all over the city. And that's not just parents. There are always a few who complain but they're a tiny minority. On the whole everyone is very supportive and say they're very happy to see children out on the street – even if it does get quite noisy."],
      ['Alice', "There have been so many benefits of Street Play for the kids. Parents really like the fact that the kids are getting fresh air instead of sitting staring at a computer screen, even if they're not doing anything particularly energetic. And of course it's great that kids can play with their friends outside without being supervised by their parents – but for me the biggest advantage is that kids develop confidence in themselves to be outside without their parents. The other really fantastic thing is that children get to know the adults in the street – it's like having a big extended family."],
      ['Presenter', 'It certainly does have a lot of benefits. I want to move on now and ask you about a related project in King Street.'],
      ['Alice', "Right. Well this was an experiment I was involved in where local residents decided to try and reduce the traffic along King Street, which is the busiest main road in our area, by persuading people not to use their cars for one day. We thought about making people pay more for parking – but we decided that would be really unpopular – so instead we just stopped people from parking on King Street but left the other car parks open."],
      ['Alice', "It was surprising how much of a difference all this made. As we'd predicted, air quality was significantly better but what I hadn't expected was how much quieter it would be – even with the buses still running. Of course everyone said they felt safer but we were actually amazed that sales in the shops went up considerably that day – we thought there'd be fewer people out shopping – not more."],
      ['Presenter', "That's really interesting so the fact that …"],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 3,
    transcript: fmt('Analysing newspaper items', [
      ['Hazel', 'Tom, could I ask you for some advice, please?'],
      ['Tom', 'Yes of course, if you think I can help. What\'s it about?'],
      ['Hazel', "It's my first media studies assignment, and I'm not sure how to go about it. You must have done it last year."],
      ['Tom', 'Is that the one comparing the coverage of a particular story in a range of newspapers?'],
      ['Hazel', "That's right."],
      ['Tom', 'Oh yes, I really enjoyed writing it.'],
      ['Hazel', 'So what sort of things do I need to compare?'],
      ['Tom', "Well, there are several things. For example, there's the question of which page of the newspaper the item appears on."],
      ['Hazel', "You mean, because there's a big difference between having it on the front page and the bottom of page ten, for instance?"],
      ['Tom', "Exactly. And that shows how important the editor thinks the story is. Then there's the size – how many column inches the story is given, how many columns it spreads over."],
      ['Hazel', 'And I suppose that includes the headline.'],
      ['Tom', "It certainly does. It's all part of attracting the reader's attention."],
      ['Hazel', "What about graphics – whether there's anything visual in addition to the text?"],
      ['Tom', "Yes, you need to consider those, too, because they can have a big effect on the reader's understanding of the story – sometimes a bigger effect than the text itself. Then you'll need to look at how the item is put together: what structure is it given? Bear in mind that not many people read beyond the first paragraph, so what has the journalist put at the beginning? And if, say, there are conflicting opinions about something, does one appear near the end, where people probably won't read it?"],
      ['Hazel', "And newspapers sometimes give wrong or misleading information, don't they? Either deliberately or by accident. Should I be looking at that, too?"],
      ['Tom', "Yes, if you can. Compare what's in different versions, and as far as possible, try and work out what's true and what isn't. And that relates to a very important point: what's the writer's purpose, or at least the most important one, if they have several. It may seem to be to inform the public, but often it's that they want to create fear, or controversy, or to make somebody look ridiculous."],
      ['Hazel', 'Gosh, I see what you mean. And I suppose the writer may make assumptions about the reader.'],
      ['Tom', "That's right – about their knowledge of the subject, their attitudes, and their level of education, which means writing so that the readers understand without feeling patronised. All of that will make a difference to how story is presented."],
      ['Hazel', 'Does it matter what type of story I write about?'],
      ['Tom', "No – national or international politics, the arts … Anything, as long as it's covered in two or three newspaper. Though of course it'll be easier and more fun if it's something you're interested in and know something about."],
      ['Hazel', "And on that basis a national news item would be worth analysing – I'm quite keen on politics, so I'll try and find a suitable topic. What did you choose for your analysis, Tom?"],
      ['Tom', "I was interested in how newspapers express their opinions explicitly, so I wanted to compare editorials in different papers, but when I started looking, I couldn't find two on the same topic that I felt like analysing."],
      ['Hazel', "In that case, I won't even bother to look."],
      ['Tom', "So in the end I chose a human interest story – a terribly emotional story about a young girl who was very ill, and lots of other people – mostly strangers – raised money so she could go abroad for treatment. Actually, I was surprised – some papers just wrote about how wonderful everyone was, but others considered the broader picture, like why treatment wasn't available here."],
      ['Hazel', "Hmm, I usually find stories like that raise quite strong feelings in me! I'll avoid that. Perhaps I'll choose an arts topic, like different reviews of a film, or something about funding for the arts – I'll think about that."],
      ['Tom', 'Yes, that might be interesting.'],
      ['Hazel', "OK, well thanks a lot for your help, Tom. It's been really useful."],
      ['Tom', 'You\'re welcome. Good luck with the assignment, Hazel.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 4,
    transcript: fmt('Early history of keeping clean', [
      [null, 'Nowadays, we use different products for personal cleanliness, laundry, dishwashing and household cleaning, but this is very much a 20th-century development.'],
      [null, 'The origins of cleanliness date back to prehistoric times. Since water is essential for life, the earliest people lived near water and knew something about its cleansing properties – at least that it rinsed mud off their hands.'],
      [null, "During the excavation of ancient Babylon, evidence was found that soapmaking was known as early as 2800 BC. Archaeologists discovered cylinders made of clay, with inscriptions on them saying that fats were boiled with askes. This is a method of making soap, though there's no reference to the purpose of this material."],
      [null, "The early Greeks bathed for aesthetic reasons and apparently didn't use soap. Instead, they cleaned their bodies with blocks of sand, pumice and ashes, then anointed themselves with oil, and scraped off the oil and dirt with a metal instrument known as a strigil. They also used oil mixed with ashes. Clothes were washed without soap in streams."],
      [null, "The ancient Germans and Gauls are also credited with discovering how to make a substance called 'soap', made of melted animal fat and ashes. They used this mixture to tint their hair red."],
      [null, 'Soap got its name, according to an ancient Roman legend, from Mount Sapo, where animals were sacrificed, leaving deposits of animal fat. Rain washed these deposits, along with wood ashes, down into the clay soil along the River Tiber. Women found that this mixture greatly reduced the effort required to wash their clothes.'],
      [null, 'As Roman civilisation advance, so did bathing. The first of the famous Roman baths, supplied with water from their aqueducts, was built around 312 BC. The baths were luxurious, and bathing became very popular. And by the second century AD, the Greek physician Galen recommended soap for both medicinal and cleaning purposes.'],
      [null, 'After the fall of Rome in 467 AD and the resulting decline in bathing habits, much of Europe felt the impact of filth on public health. This lack of personal cleanliness and related unsanitary living conditions were major factors in the outbreaks of disease in the Middle Ages, and especially the Black Death of the 14th century.'],
      [null, 'Nevertheless, soapmaking became an established craft in Europe, and associations of soapmakers guarded their trade secrets closely. Vegetable and animal oils were used with ashes of plants, along with perfume, apparently for the first time. Gradually more varieties of soap became available for shaving and shampooing, as well as bathing and laundering.'],
      [null, 'A major step toward large-scale commercial soapmaking occurred in 1791, when a French chemist, Nicholas Leblanc, patented a process for turning salt into soda ash, or sodium carbonate. Soda ash is the alkali obtained from ashes that combines with fat to form soap. The Leblanc process yielded quantities of good-quality, inexpensive soda ash.'],
      [null, 'Modern soapmaking was born some 20 years later, in the early 19th century, with the discovery by Michel Eugène Chevreul, another French chemist, of the chemical nature and relationship of fats, glycerine and fatty acids. His studies established the basis for both fat and soap chemistry, and soapmaking became a science. Further developments during the 19th century made it easier and cheaper to manufacture soap.'],
      [null, 'Until the 19th century, soap was regarded as a luxury item, and was heavily taxed in several countries. As it became more readily available, it became an everyday necessity, a development that was reinforced when the high tax was removed. Soap was then something ordinary people could afford, and cleanliness standards improved.'],
      [null, 'With this widespread use came the development of milder soaps for bathing and soaps for use in the washing machines that were available to consumers by the turn of the 20th century.'],
    ]),
  },

  // ══════════════════════════ Cam 15 - Test 4 ══════════════════════════
  {
    testName: 'Cam 15 - Test 4', partNumber: 1,
    transcript: fmt('Customer satisfaction survey', [
      ['Man', "Hello. Do you mind if I ask you some questions about your journey today? We're doing a customer satisfaction survey."],
      ['Sophie', "Yes. OK. I've got about ten minutes before my train home leaves. I'm on a day trip."],
      ['Man', 'Great. Thank you. So first of all, could you tell me your name?'],
      ['Sophie', "It's Sophie Bird."],
      ['Man', 'Thank you. And would you mind telling me what you do?'],
      ['Sophie', "I'm a journalist."],
      ['Man', 'Oh really? That must be interesting.'],
      ['Sophie', 'Yes. It is.'],
      ['Man', 'So was the reason for your visit here today work?'],
      ['Sophie', 'Actually, it\'s my day off. I came here to do some shopping.'],
      ['Man', 'On right.'],
      ['Sophie', 'But I do sometimes come here for work.'],
      ['Man', "OK. Now I'd like to ask some questions about your journey today, if that's OK."],
      ['Sophie', 'Yes. No problem.'],
      ['Man', "Right, so can you tell me which station you're travelling back to?"],
      ['Sophie', 'Staunfirth, where I live.'],
      ['Man', 'Can I just check the spelling? S-T-A-U-N-F-I-R-T-H?'],
      ['Sophie', "That's right."],
      ['Man', 'And you travelled from there this morning?'],
      ['Sophie', 'Yes.'],
      ['Man', "OK, good. Next, can I ask what kind of ticket you bought? I assume it wasn't a season ticket, as you don't travel every day."],
      ['Sophie', "That's right. No, I just got a normal return ticket. I don't have a rail card so I didn't get any discount. I keep meaning to get one because it's a lot cheaper."],
      ['Man', "Yes – you'd have saved 20% on your ticket today. So you paid the full price for your ticket?"],
      ['Sophie', 'I paid £23.70.'],
      ['Man', 'OK. Do you think that\'s good value for money?'],
      ['Sophie', "Not really. I think it's too much for a journey that only takes 45 minutes."],
      ['Man', "Yes, that's one of the main complaints we get. So, you didn't buy your ticket in advance?"],
      ['Sophie', "No. I know it's cheaper if you buy a week in advance but I didn't know I was coming then."],
      ['Man', "I know. You can't always plan ahead. So, did you buy it this morning?"],
      ['Sophie', 'No, it was yesterday.'],
      ['Man', 'Right. And do you usually buy your tickets at the station?'],
      ['Sophie', "Well, I do usually but the ticket office closes early and I hate using ticket machines. I think ticket offices should be open for longer hours. There's always a queue for the machines and they're often out of order."],
      ['Man', 'A lot of customers are saying the same thing.'],
      ['Sophie', 'So to answer your question … I got an e-ticket online.'],
      ['Man', "OK. Thank you. Now I'd like to ask you about your satisfaction with your journey. So what would you say you were most satisfied with today?"],
      ['Sophie', "Well, I like the wifi on the train. It's improved a lot. It makes it easier for me to work if I want to."],
      ['Man', "That's the first time today anyone's mentioned that. It's good to get some positive feedback on that."],
      ['Sophie', 'Mmm.'],
      ['Man', 'And, is there anything you weren\'t satisfied with?'],
      ['Sophie', 'Well, normally, the trains run on time and are pretty reliable but today there was a delay; the train was about 15 minutes behind schedule.'],
      ['Man', "OK. I'll put that down. Now I'd also like to ask about the facilities at this station. You've probably noticed that the whole station's been upgraded. What are you most satisfied with?"],
      ['Sophie', "I think the best thing is that they've improved the amount of information about train times etc. that's given to passengers – it's much clearer – before there was only one board and I couldn't always see it properly – which was frustrating."],
      ['Man', "That's good. And is there anything you're not satisfied with?"],
      ['Sophie', "Let's see … I think things have generally improved a lot. The trains are much more modern and I like the new café. But one thing is that there aren't enough places to sit down, especially on the platforms."],
      ['Man', "OK – so I'll put 'seating' down, shall I, as the thing you're least satisfied with?"],
      ['Sophie', 'Yes, OK.'],
      ['Man', "Can I ask your opinion about some of the other facilities? We'd like feedback on whether people are satisfied, dissatisfied or neither satisfied nor dissatisfied."],
      ['Sophie', 'OK.'],
      ['Man', 'What about the parking at the station?'],
      ['Sophie', "Well to be honest, I don't really have an opinion as I never use it."],
      ['Man', 'So, neither satisfied nor dissatisfied for that then.'],
      ['Sophie', 'Yes, I suppose so …'],
      ['Man', 'OK, and what about …?'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 2,
    transcript: fmt('Croft Valley Park', [
      [null, "As chair of the town council subcommittee on park facilities, I'd like to bring you up to date on some of the changes that have been made recently to the Croft Valley Park. So if you could just take a look at the map I handed out, let's begin with a general overview. So the basic arrangement of the park hasn't changed – it still has two gates, north and south, and a lake in the middle."],
      [null, 'The café continues to serve an assortment of drinks and snacks and is still in the same place, looking out over the lake and next to the old museum.'],
      [null, "We're hoping to change the location of the toilets, and bring them nearer to the centre of the park as they're a bit out of the way at present, near the adventure playground, in the corner of your map."],
      [null, "The formal gardens have been replanted and should be at their best in a month or two. They used to be behind the old museum, but we're now used the space near the south gate – between the park boundary and the path that goes past the lake towards the old museum."],
      [null, "We have a new outdoor gym for adults and children, which is already proving very popular. It's by the glass houses, just to the right of the path from the south gate. You have to look for it as it's a bit hidden in the trees."],
      [null, "One very successful introduction has been our skateboard ramp. It's in constant use during the evenings and holidays. It's near the old museum, at the end of a little path that leads off from the main path between the lake and the museum."],
      [null, "We've also introduced a new area for wild flowers, to attract bees and butterflies. It's on a bend in the path that goes round the east side of the lake, just south of the adventure playground."],
      [null, 'Now let me tell you a bit more about some of the changes to Croft Valley Park.'],
      [null, "One of our most exciting developments has been the adventure playground. We were aware that we had nowhere for children to let off steam, and decided to use our available funds to set up a completely new facility in a large space to the north of the park. It's open year-round, though it close early in the winter months, and entrance is completely free. Children can choose whatever activities they want to do, irrespective of their age, but we do ask adults not to leave them on their own there. There are plenty of seats where parents can relax and keep an eye on their children at the same time."],
      [null, 'Lastly, the glass houses. A huge amount of work has been done on them to repair the damage following the disastrous fire that recently destroyed their western side. Over £80,000 was spent on replacing the glass walls and the metal supports, as well as the plants that had been destroyed, although unfortunately the collection of tropical palm trees has proved too expensive to replace up to now. At present the glass houses are open from 10am to 3pm Mondays to Thursdays, and it\'s hoped to extend this to the weekend soon. We\'re grateful to all those who helped us by contributing their time and money to this achievement.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 3,
    transcript: fmt('Presentation about refrigeration', [
      ['Annie', "OK, Jack. Before we plan our presentation about refrigeration, let's discuss what we've discovered so far."],
      ['Jack', "Fine, Annie. Though I have to admit I haven't done much research yet."],
      ['Annie', "Nor me. But I found an interesting article about icehouses. I'd been some 18th- and 19th-century ones here in the UK, so I knew they were often built in a shady area or underground, close to lakes that might freeze in the winter. Then blocks of ice could be cut and stored in the icehouse. But I didn't realise that insulating the blocks with straw or sawdust meant they didn't melt for months. The ancient Romans had refrigeration, too."],
      ['Jack', "I didn't know that."],
      ['Annie', "Yes, pits were dug in the ground, and snow was imported from the mountains – even though they were at quite a distance. The snow was stored in the pits. Ice formed at the bottom of it. Both the ice and the snow were then sold. The ice cost more than the snow and my guess is that only the wealthy members of society could afford it."],
      ['Jack', "I wouldn't be surprised. I also came across an article about modern domestic fridges. Several different technologies are used, but they were too complex for me to understand."],
      ['Annie', 'You have to wonder what happens when people get rid of old ones.'],
      ['Jack', 'You mean because the gases in them are harmful for the environment?'],
      ['Annie', "Exactly. At least these are now plenty of organisations that will recycle most of the components safety, but of course some people just dump old fridges in the countryside."],
      ['Jack', "It's hard to see how they can be stopped unfortunately. In the UK we get rid of three million a year altogether!"],
      ['Annie', 'That sounds a lot, especially because fridges hardly ever break down.'],
      ['Jack', "That's right. In this country we keep domestic fridges for 11 years on average, and a lot last for 20 or more. So if you divide the cost by the number of years you can use a fridge, they're not expensive, compared with some household appliances."],
      ['Annie', "True. I suppose manufactures encourage people to spend more by making them different colours and designs. I'm sure when my parents bought their first fridge they had hardly any choice!"],
      ['Jack', "Yes, there's been quite a change."],
      ['Jack', "Right, let's make a list of topics to cover in our presentation, and decide who's going to do more research on them. Then later, we can get together and plan the next step."],
      ['Annie', "OK. How about starting with how useful refrigeration is, and the range of goods that are refrigerated nowadays? Because of course it's not just food and drinks."],
      ['Jack', 'No, I suppose flowers and medicines are refrigerated, too.'],
      ['Annie', 'And computers. I could do that, unless you particularly want to.'],
      ['Jack', "No, that's fine by me. What about the effects of refrigeration on people's health? After all, some of the chemicals used in the 19th century were pretty harmful, but there have been lots of benefits too, like always have access to fresh food. Do you fancy dealing with that?"],
      ['Annie', "I'm no terribly keen, to be honest."],
      ['Jack', 'Nor me. My mind just goes blank when I read anything about chemicals.'],
      ['Annie', 'Oh, all right then, I\'ll do you a favour. But you own me, Jack.'],
      ['Jack', 'What about the effects on food producers, like farmers in poorer countries being able to export their produce to developed countries? Something for you, maybe?'],
      ['Jack', "I don't mind. It should be quite interesting."],
      ['Annie', "I think we should also look at how refrigeration has helped whole cities – like Las Vegas, which couldn't exist without refrigeration because it's in the middle of a desert."],
      ['Jack', "Right. I had a quick look at an economics book in the library that's got a chapter about this sort of thing. I could give you the title, if you want to do this section."],
      ['Annie', 'Not particularly, to be honest. I find economics books pretty heavy going, as a rule.'],
      ['Jack', 'OK, leave it to me, then.'],
      ['Annie', 'Thanks. Then there\'s transport, and the difference that refrigerated trucks have made. I wouldn\'t mind having a go at that.'],
      ['Jack', 'Don\'t forget trains, too. I read something about milk and butter being transported in refrigerated railroad cars in the USA, right back in the 1840s.'],
      ['Annie', "I hadn't thought of trains. Thanks."],
      ['Jack', "Shall we have a separate section on domestic fridges? After all, they're something everyone's familiar with."],
      ['Annie', "What about splitting it into two? You could investigate 19th- and 20th-century fridges, and I'll concentrate on what's available these days, and how manufacturers differentiate their products from those of their competitors."],
      ['Jack', "OK, that'd suit me."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 4,
    transcript: fmt('How the Industrial Revolution affected life in Britain', [
      [null, "Hi everyone, in this session I'll be presenting my research about the social history of Britain during the Industrial Revolution. I particularly looked at how ordinary lives were affected by changes that happened at that time. This was a time that saw the beginning of a new phenomenon; consumerism – where buying and selling goods became a major part of ordinary people's lives."],
      [null, "In fact, it was in the 19th century that the quantity and quality of people's possessions was used as an indication of the wealth of the country. Before this, the vast majority of people had very few possessions, but all that was changed by the Industrial Revolution. This was the era from the mid-18th to the late 19th century, when improvements in how goods were made as well as in technology triggered massive social changes that transformed life for just about everybody in several key areas."],
      [null, "First let's look at manufacturing. When it comes to manufacturing, we tend to think of the Industrial Revolution in images of steam engines and coal. And it's true that the Industrial Revolution couldn't have taken place at all if it weren't for these new sources of power. They marked an important shift away from the traditional watermills and windmills that had dominated before this. The most advanced industry for much of the 19th century was textiles. This meant that fashionable fabrics, and lace and ribbons were made available to everyone."],
      [null, 'Before the Industrial Revolution, most people made goods to sell in small workshops, often in their own homes. But enormous new machines were now being created that could produce the goods faster and on a larger scale, and these required a lot more space. So large factories were built, replacing the workshops, and forcing workers to travel to work. In fact, large numbers of people migrated from villages into towns as a result.'],
      [null, "As well as manufacturing, there were new technologies in transport, contributing to the growth of consumerism. The horse-drawn stagecoaches and carts of the 18th century, which carried very few people and good, and travelled slowly along poorly surfaced roads, were gradually replaced by the numerous canals that were constructed. These were particularly important for the transportation of goods. The canals gradually fell out of use, though, as railways were developed, becoming the main way of moving goods and people from one end of the country to the other. And the goods they moved weren't just coal, iron, clothes, and so on – significantly, they included newspapers, which meant that thousands of people were not only more knowledgeable about what was going on in the country, but could also read about what was available in the shops. And that encouraged them to buy more. so faster forms of transport resulted in distribution becoming far more efficient – goods could now be sold all over the country, instead of just in the local market."],
      [null, "The third main area that saw changes that contributed to consumerism was retailing. The number and quality of shops grew rapidly, and in particular, small shops suffered as customers flocked to the growing number of department stores – a form of retailing that was new in the 19th century. The entrepreneurs who opened these found new ways to stock them with goods, and to attract customers: for instance, improved lighting inside greatly increased the visibility of the goods for sale. Another development that made goods more visible from outside resulted from the use of plate glass, which made it possible for windows to be much larger than previously. New ways of promoting goods were introduced, too. Previously, the focus had been on informing potential customers about the availability of goods; now there was an explosion in advertising trying to persuade people to go shopping."],
      [null, "Flanders claims that one of the great effects of the Industrial Revolution was that it created choice. All sorts of things that had previously been luxuries – from sugar to cutlery – became conveniences, and before long they'd turned into necessities: life without sugar or cutlery was unimaginable. Rather like mobile phones these days!"],
    ]),
  },
];

async function runSeedCam15() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS_Cam15) {
    const { testName, partNumber, transcript } = target;
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscriptsCam15] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscriptsCam15] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS_Cam15.length} targets).`);
}


// Same approach/format as seedListeningTranscripts.js (Cam 21) — sourced
// from published Cambridge IELTS 16 audioscripts (ieltstrainingonline.com),
// verified sentence by sentence against every question's correctAnswer
// already in the DB before being written here.
//
// NOTE — pre-existing DB data bug found (not fixed here, out of scope for
// a transcript-only pass; flagged to the user separately): Cam 16 - Test 2
// Part 2, questions 12 and 13 have their correctAnswer values swapped.
// Q12 ("What is planned with regard to the lower school?") is stored as A
// but independently verified (transcript + external answer key) to be B.
// Q13 ("The catering has been changed because of") is stored as B but
// verified to be A. Every other question in this file was confirmed
// correct against the transcript.


const TARGETS_Cam16 = [
  // ══════════════════════════ Cam 16 - Test 1 ══════════════════════════
  {
    testName: 'Cam 16 - Test 1', partNumber: 1,
    transcript: fmt("Children's Engineering Workshops", [
      ['Sarah', "Hello. Children's Engineering Workshops."],
      ['Father', 'Oh hello. I wanted some information about the workshops in the school holidays.'],
      ['Sarah', 'Sure.'],
      ['Father', "I have two daughters who are interested. The younger one's Lydia, she's four - do you take children as young as that?"],
      ['Sarah', 'Yes, our Tiny Engineers workshop is for four to five-year-olds.'],
      ['Father', 'What sorts of activities do they do?'],
      ['Sarah', "All sorts. For example, they work together to design a special cover that goes round an egg, so that when it's inside they can drop it from a height and it doesn't break. Well, sometimes it does break but that's part of the fun!"],
      ['Father', 'Right. And Lydia loves building things. Is there any opportunity for her to do that?'],
      ['Sarah', "Well, they have a competition to see who can make the highest tower. You'd be amazed how high they can go."],
      ['Father', 'Right.'],
      ['Sarah', "But they're learning all the time as well as having fun. For example, one thing they do is to design and build a car that's attached to a balloon, and the force of the air in that actually powers the car and makes it move along. They go really fast too."],
      ['Father', 'OK, well, all this sounds perfect.'],
      ['Father', "Now Carly, that's my older daughter, has just had her seventh birthday, so presumably she'd be in a different group?"],
      ['Sarah', "Yes, she'd be in the Junior Engineers. That's for children from six to eight."],
      ['Father', 'And do they do the same sorts of activities?'],
      ['Sarah', "Some are the same, but a bit more advanced. So they work out how to build model vehicles, things like cars and trucks, but also how to construct animals using the same sorts of material and technique, and then they learn how they can program them and make them move."],
      ['Father', 'So they learn a bit of coding?'],
      ['Sarah', "They do. They pick it up really quickly. We're there to help if they need it, but they learn from one another too."],
      ['Father', 'Right. And do they have competition too?'],
      ['Sarah', "Yes, with the Junior Engineers, it's to use recycled materials like card and wood to build a bridge, and the longest one gets a prize."],
      ['Father', "That sounds fun. I wouldn't mind doing that myself!"],
      ['Sarah', "Then they have something a bit different, which is to think up an idea for a five-minute movie and then film it, using special animation software. You'd be amazed what they come up with."],
      ['Father', "And of course, that's something they can put on their phone and take home to show all their friends."],
      ['Sarah', 'Exactly. And then they also build a robot in the shape of a human, and they decorate it and program it so that it can move its arms and legs.'],
      ['Father', 'Perfect. So, is it the same price as the Tiny Engineers?'],
      ['Sarah', "It's just a bit more: £50 for the five weeks."],
      ['Father', 'And are the classes on a Monday, too?'],
      ['Sarah', "They used to be, but we found it didn't give our staff enough time to clear up after the first workshop, so we moved them to Wednesdays. The classes are held in the morning from ten to eleven."],
      ['Father', 'OK. That\'s better for me actually. And what about the location? Where exactly are the workshops held?'],
      ['Sarah', "They're in building 10A - there's a big sign on the door, you can't miss it, and that's in Fradstone Industrial Estate."],
      ['Father', 'Sorry?'],
      ['Sarah', 'Fradstone - that\'s F-R-A-D-S-T-O-N-E.'],
      ['Father', "And that's in Grasford, isn't it?"],
      ['Sarah', 'Yes, up past the station.'],
      ['Father', 'And will I have any parking problems there?'],
      ['Sarah', "No, there's always plenty available. So would you like to enrol Lydia and Carly now?"],
      ['Father', 'OK.'],
      ['Sarah', 'So can I have your full name …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 2,
    transcript: fmt("Stevenson's work experience induction", [
      [null, "Good morning, everyone, and welcome to Stevenson's, one of the country's major manufacturers of metal goods. Thank you for choosing us for your two weeks of work experience. My name is Julia Simmons, and since the beginning of this year I've been the managing director."],
      [null, "Stevenson's is quite an old company. Like me, the founder, Ronald Stevenson, went into the steel industry when he left school - that was in 1923. He set up this company when he finished his apprenticeship, in 1926, although he actually started making plans two years earlier, in 1924. He was a very determined young man!"],
      [null, "Stevenson's long-term plan was to manufacture components for the machine tools industry - although in fact that never came about - and for the automotive industry, that is, cars and lorries. However, there was a delay of five years before that happened, because shortly before the company went into production, Stevenson was given the opportunity to make goods for hospitals and other players in the healthcare industry, so that's what we did for the first five years."],
      [null, "Over the years, we've expanded the premises considerably - we were lucky that the site is big enough, so moving to a new location has never been necessary. However, the layout is far from ideal for modern machinery and production methods, so we intend to carry out major refurbishment of this site over the next five years."],
      [null, "I'd better give you some idea of what you'll be doing during your two weeks with us, so you know what to expect. Most mornings you'll have a presentation from one of the managers, to learn about their department, starting this morning with research and development. And you'll all spend some time in each department, observing what's going on and talking to people - as long as you don't stop them from doing their work altogether! In the past, a teacher from your school has come in at the end of each week to find out how the group were getting on, but your school isn't able to arrange that this year."],
      [null, "OK, now I'll briefly help you to orientate yourselves around the site. As you can see, we're in the reception area, which we try to make attractive and welcoming to visitors. There's a corridor running left from here, and if you go along that, the door facing you at the end is the entrance to the coffee room. This looks out onto the main road on one side, and some trees on the other, and that'll be where you meet each morning."],
      [null, "The factory is the very big room on the far side of the site. Next to it is the warehouse, which can be accessed by lorries going up the road to the turning area at the end. You can get to the warehouse by crossing to the far side of the courtyard, and then the door is on your right."],
      [null, "Somewhere you'll be keen to find is the staff canteen. This is right next to reception. I can confidently say that the food's very good, but the view isn't. The windows on one side look onto a corridor and courtyard, which aren't very attractive at all, and on the other onto the access road, which isn't much better."],
      [null, "You'll be using the meeting room quite often, and you'll find it by walking along the corridor to the left of the courtyard, and continuing along it to the end. The meeting room is the last one on the right, and I'm afraid there's no natural daylight in the room."],
      [null, "Then you'll need to know where some of the offices are. The human resources department is all the front of this building, so you head to the left along the corridor from reception, and it's the second room you come to. It looks out onto the main road."],
      [null, "And finally, the boardroom, where you'll be meeting sometimes. That has quite a pleasant view, as it looks out on to the trees. Go along the corridor past the courtyard, right to the end. The boardroom is on the left, next to the factory."],
      [null, 'OK, now are there any questions before we …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 3,
    transcript: fmt('Art project on birds in painting', [
      ['Jess', 'How are you getting on with your art project, Tom?'],
      ['Tom', "OK. Like, they gave us the theme of birds to base our project on, and I'm not really all that interested in wildlife. But I'm starting to get into it. I've pretty well finished the introductory stage."],
      ['Jess', "So have I. When they gave us all those handouts with details of books and websites to look at, I was really put off, but the more I read, the more interested I got."],
      ['Tom', 'Me too. I found I could research so many different aspects of birds in art - colour, movement, texture. So I was looking forward to the Bird Park visit.'],
      ['Jess', 'What a letdown! It poured with rain and we hardly saw a single bird. Much less use than the trip to the Natural History Museum.'],
      ['Tom', 'Yeah, I liked all the stuff about evolution there. The workshop sessions with Dr Fletcher were good too, especially the brainstorming sessions.'],
      ['Jess', "I missed those because I was ill. I wish we could've seen the projects last year's students did."],
      ['Tom', "Mm. I suppose they want us to do our own thing, not copy."],
      ['Jess', 'Have you drafted your proposal yet?'],
      ['Tom', "Yes, but I haven't handed it in. I need to amend some parts. I've realised the notes from my research are almost all just descriptions, I haven't actually evaluated anything. So I'll have to fix that."],
      ['Jess', 'Oh, I didn\'t know we had to do that. I\'ll have to look at that too. Did you do a timeline for the project?'],
      ['Tom', 'Yes, and a mind map.'],
      ['Jess', 'Yeah, so did I. I quite enjoyed that. But it was hard having to explain the basis for my decisions in my action plan.'],
      ['Tom', 'What?'],
      ['Jess', 'You know, give a rationale.'],
      ['Tom', "I didn't realise we had to do that. OK, I can add it now. And I've done the video diary presentation, and worked out what I want my outcome to be in the project."],
      ['Jess', "Someone told me it's best not to be too precise about your actual outcome at this stage, so you have more scope to explore your ideas later on. So I'm going to do back to my proposal to make it a bit more vague."],
      ['Tom', "Really? OK, I'll change that too then."],
      ['Tom', "One part of the project, I'm unsure about is where we choose some paintings of birds and say what they mean to us. Like, I chose a painting of a falcon by Landseer. I like it because the bird's standing there with his head turned to one side, but he seems to be staring straight at you. But I can't just say it's a bit scary, can I?"],
      ['Jess', "You could talk about the possible danger suggested by the bird's look."],
      ['Tom', 'Oh, OK.'],
      ['Jess', "There's a picture of a fish hawk by Audubon I like. It's swooping over the water with a fish in its talons, and with great black wings which take up most of the picture."],
      ['Tom', 'So you could discuss it in relation to predators and food chains?'],
      ['Jess', 'Well actually I think I\'ll concentrate on the impression of rapid motion it gives.'],
      ['Tom', 'Right.'],
      ['Jess', "Do you know that picture of a kingfisher by van Gosh - it's perching on a reed growing near a stream."],
      ['Tom', "Yes, it's got these beautiful blue and red and black shades."],
      ['Jess', "Mm hm. I've actually chosen it because I saw a real kingfisher once when I was litter, I was out walking with my grandfather, and I've never forgotten it."],
      ['Tom', 'So we can use a personal link?'],
      ['Jess', 'Sure.'],
      ['Tom', "OK. There's a portrait called William Wells. I can't remember the artist but it's a middle-aged man who's just shot a bird. And his expression, and the way he's holding the bird in his hand suggests he's not sure about what he's done. To me it's about how ambiguous people are in the way they exploit the natural world."],
      ['Jess', "Interesting. There's Gauguin's picture Vairumati. He did it in Tahiti. It's a woman with a white bird behind her that is eating a lizard, and what I'm interested in is what idea this bird refers to. Apparently, it's a reference to the never-ending cycle of existence."],
      ['Tom', "Wow. I chose a portrait of a little boy, Giovanni de Medici. He's holding a tiny bird in one fist. I like the way he's holding it carefully so he doesn't hurt it."],
      ['Jess', 'Ah right.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 4,
    transcript: fmt('Stoicism', [
      [null, 'Ancient philosophy is not just about talking or lecturing, or even reading long, dense books. In fact, it is something people have used throughout history - to solve their problems and to achieve their greatest triumphs.'],
      [null, "Specifically, I am referring to Stoicism, which, in my opinion, is the most practical of all philosophies and therefore the most appealing. Stoicism was founded in Ancient Greece by Zeno of Citium in the early 3rd century BC, but was practised by the likes of Epictetus, Cato, Seneca and Marcus Aurelius. Amazingly, we still have access to these ideas, despite the fact that the most famous Stoics never wrote anything down for publication. Cato definitely didn't. Marcus Aurelius never intended his Meditations to be anything but personal. Seneca's letters were, well, letters and Epictetus' thoughts come to us by way of a note-taking student."],
      [null, 'Stoic principles were based on the idea that its followers could have an unshakable happiness in this life and the key to achieving this was virtue. The road to virtue, in turn, lay in understanding that destructive emotions, like anger and jealousy, are under our conscious control - they don\'t have to control us, because we can learn to control them. In the words of Epictetus: "external events I cannot control, but the choices I make with regard to them, I do control".'],
      [null, 'The modern day philosopher and writer Nassim Nicholas Taleb defines a Stoic as someone who has a different perspective on experience which most of us would see as wholly negative; a Stoic "transforms fear into caution, pain into transformation, mistakes into initiation and desire into undertaking". Using this definition as a model, we can see that throughout the centuries Stoicism has been practised in more recent history by kings, presidents, artists, writers and entrepreneurs.'],
      [null, 'The founding fathers of the United States were inspired by the philosophy. George Washington was introduced to Stoicism by his neighbours at age seventeen, and later, put on a play based on the life of Cato to inspire his men. Thomas Jefferson kept a copy of Seneca beside his bed.'],
      [null, 'Writers and artists have also been inspired by the stoics. Eugène Delacroix, the renowned French Romantic artist (known best for his painting Liberty Leading the People) was an ardent Stoic, referring to it as his "consoling religion".'],
      [null, "The economist Adam Smith's theories on capitalism were significantly influenced by the Stoicism that he studied as a schoolboy, under a teacher who had translated Marcus Aurelius' works."],
      [null, "Today's political leaders are no different, with many finding their inspiration from the ancient texts. Former US president Bill Clinton rereads Marcus Aurelius every single year, and many have compared former President Obama's calm leadership style to that of Cato. Wen Jiabao, the former prime minister of China, claims that Meditations is one of two books he travels with and that he has read it more than one hundred times over the course of his life."],
      [null, "Stoicism had a profound influence on Albert Ellis, who invented Cognitive Behaviour Therapy, which is used to help people manage their problems by changing the way that they think and behave. It's most commonly used to treat depression. The idea is that we can take control of our lives by challenging the irrational belief that create our faulty thinking, symptoms and behaviours by using logic instead."],
      [null, 'Stoicism has also become popular in the world of business. Stoic principles can build the resilience and state of mind required to overcome setbacks because Stoics teach turning obstacles into opportunity. A lesson every business entrepreneur needs to learn.'],
      [null, "I would argue that study Stoicism is as relevant today as it was 2,000 years ago, thanks to its brilliant insights into how to lead a good life. At the very root of the thinking, there is a very simple way of living - control what you can and accept what you can't. This is not as easy as it sounds and will require considerable practice - it can take a lifetime to master. The Stoics also believed the most important foundation for a good and happy life is not money, fame, power or pleasure, but having a disciplined and principled character - something which seems to resonate with many people today."],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 2 ══════════════════════════
  {
    testName: 'Cam 16 - Test 2', partNumber: 1,
    transcript: fmt('Picturerep photo digitising service', [
      ['Employee', 'Hello, Picturerep. Can I help you?'],
      ['Woman', "Oh, hi. I saw your advertisement about copying pictures to disk and I'd like a bit more information about what you do."],
      ['Employee', 'Sure. What would you like to know?'],
      ['Woman', "Well, I've got a box full of old family photos that's been up in the attic for years, some of them must be 50 or 60 years old, and I'd like to get them converted to digital format."],
      ['Employee', 'Sure, we can do that for you.'],
      ['Woman', 'Right. And what about size? The photos are all sorts of sizes - are there any restrictions?'],
      ['Employee', 'Well the maximum size of photo we can do with our normal services is 30 centimetres. And each picture must be a least 4 centimetres, that\'s the minimum we can cope with.'],
      ['Woman', 'That should be fine. And some of them are in a frame - should I take them out before I send them?'],
      ['Employee', "Yes please, we can't copy them otherwise. And also the photos must all be separate, they mustn't be stuck into an album."],
      ['Woman', "OK, that's not a problem. So can you give me an idea of how much this will cost? I've got about 360 photos I think."],
      ['Employee', 'We charge £195 for 300 to 400 photos for the basic service.'],
      ['Woman', 'OK. And does that include the disk?'],
      ['Employee', 'Yes, one disk - but you can get extra ones for £5 each.'],
      ['Woman', "That's good. So do I need to pay when I send you the photos?"],
      ['Employee', "No, we won't need anything until we've actually copied the pictures. Then we'll let you know how much it is, and once we've received the payment, we'll send the parcel off to you."],
      ['Woman', 'Right.'],
      ['Employee', "Is there anything else you'd like to ask about our services?"],
      ['Woman', "Yes. I've roughly sorted out the photos into groups, according to what they're about - so can you keep them in those groups when you copy them?"],
      ['Employee', "Sure. We'll save each group in a different folder on the disk and if you like, you can suggest a name for each folder."],
      ['Woman', "So I could have one called 'Grandparents' for instance?"],
      ['Employee', 'Exactly.'],
      ['Woman', 'And do you do anything besides scan the photos? Like, can you make any improvements?'],
      ['Employee', 'Yes, in the standard service each photo is checked, and we can sometimes touch up the colour a bit, or improve the contrast - that can make a big difference.'],
      ['Woman', "OK. And some of the photos are actually quite fragile - they won't get damaged in the process, will they?"],
      ['Employee', "No, if any look particularly fragile, we'd do them by hand. We do realise how precious these old photos can be."],
      ['Woman', 'Sure.'],
      ['Employee', "And another thing is we can make changes to a photo if you want - so if you want to remove an object from a photo, or maybe alter the background, we can do that."],
      ['Woman', "Really? I might be interested in that. I'll have a look through the photos and see. Oh, and talking of fixing photos - I've got a few that aren't properly in focus. Can you do anything to make that better?"],
      ['Employee', "No, I'm afraid that's one thing we can't do."],
      ['Woman', 'OK.'],
      ['Employee', 'Any other information I can give you?'],
      ['Woman', 'Er … oh, how long will it all take?'],
      ['Employee', 'We aim to get the copying done in ten days.'],
      ['Woman', "Fine. Right, well I'll get the photos packed up in a box and post them off to you."],
      ['Employee', "Right. If you've got a strong cardboard box, that's best. We've found that plastic ones sometimes break in the post."],
      ['Woman', 'OK. Right, thanks for your help. Bye.'],
      ['Employee', 'Bye.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 2,
    transcript: fmt('Dartfield House school changes', [
      [null, "Good morning and thank you for coming here today. I'd like to bring you up to date with changes in the school that will affect your children."],
      [null, 'As you know, the school buildings date from various times: some from the 1970s, some from the last five years, and of course Dartfield House is over a century old. It was commissioned by a businessman. Neville Richards, and intended as his family home, but he died before it was completed. His heir chose to sell it to the local council, who turned it into offices. A later plan to convert it into a tourist information centre didn\'t come about, through lack of money, and instead it formed the nucleus of this school when it opened 40 years ago.'],
      [null, "The school has grown as the local population has increased, and I can now give you some news about the lower school site, which is separated from the main site by a road. Planning permission has been granted for development of both sites. The lower school will move to new buildings that will be constructed on the main site. Developers will construct houses on the existing lower school site. Work on the new school buildings should start within the next few months."],
      [null, "A more imminent change concerns the catering facilities and the canteen. The canteen is always very busy throughout the lunch period - in fact it's often full to capacity, because a lot of our pupils like the food that's on offer there. But there's only one serving point, so most pupils have to wait a considerable time to be served. This is obviously unsatisfactory, as they may have hardly finished their lunch before afternoon lessons start."],
      [null, "So we've had a new Food Hall built, and this will come into use next week. It'll have several serving areas, and I'll give you more details about those in a minute, but one thing we ask you to do, to help in the smooth running of the Food Hall, is to discuss with your children each morning which type of food they want to eat that day, so they can go straight to the relevant serving point. There won't be any junk food - everything on offer will be healthy - and there's no change to the current system of paying for lunches by topping up your child's electronic payment card online."],
      [null, "You may be wondering what will happen to the old canteen. We'll still have tables and chairs in there, and pupils can eat food from the Food Hall or lunch they've brought from home. Eventually we may use part of the canteen for storage, but first we'll see how many pupils go in there at lunchtime."],
      [null, 'OK, back to the serving points in the Food Hall, which will all have side dishes, desserts and drinks on sale, as well as main courses.'],
      [null, "One serving point we call World Adventures. This will serve a different country's cuisine each day, maybe Chinese one day and Lebanese the next. The menus will be planned for a week at a time, so pupils will know what's going to be available the whole of the week."],
      [null, "Street Life is also international, with food from three particular cultures. We'll ask pupils to make suggestions, so perhaps sometimes there'll be food from Thailand, Ethiopia and Mexico, and then one of them will be replaced by Jamaican food for a week or two."],
      [null, "The Speedy Italian serving point will cater particularly for the many pupils who don't eat meat or fish: they can be sure that all the food served there is suitable for them. There'll be plenty of variety, so they shouldn't get bored with the food."],
      [null, "OK, that's all on the new Food Hall. Now after-school lessons. There are very popular with pupils, particularly swimming - in fact there's a waiting list for lessons. Cycling is another favourite, and I'm delighted that dozens of pupils make use of the chance to learn to ride in off-road conditions. It means that more and more cycle to and from school every day. As you know, we have a well-equipped performance centre, and we're going to start drama classes in there, too. Pupils will be able to join in just for fun or work up to taking part in a play - we hope to put on at least one a year. We already teach a number of pupils to use the sound and lighting systems in the centre. And a former pupil has given a magnificent grand piano to the school, so a few pupils will be able to learn at the school instead of going to the local college, as many of them do at the moment."],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 3,
    transcript: fmt('Assignment on sleep and dreams', [
      ['Susie', 'So Luke, for our next psychology assignment we have to do something on sleep and dreams.'],
      ['Luke', "Right. I've just read an article suggesting why we tend to forget most of our dreams soon after we wake up. I mean, most of my dreams aren't that interesting anyway, but what it said was that if we remembered everything, we might get mixed up about what actually happened and what we dreamed. So it's a sort of protection. I hadn't heard that idea before. I'd always assumed that it was just that we didn't have room in our memories for all that stuff."],
      ['Susie', 'Me too. What do you think about the idea that our dreams may predict the future?'],
      ['Luke', "It's a belief that you get all over the world."],
      ['Susie', "Yeah, lots of people have a story of it happening to them, but the explanation I've read is that for each dream that comes true, we have thousands that don't, but we don't notice those, we don't even remember them. We just remember the ones where something in the real world, like a view or an action, happens to trigger a dream memory."],
      ['Luke', "Right. So it's just a coincidence really. Something else I read about is what they call segmented sleeping. That's a theory that hundreds of years ago, people used to get up in the middle of the night and have a chat or something to eat, then go back to bed. So I tried it myself."],
      ['Susie', 'Why?'],
      ['Luke', "Well it's meant to make you more creative. I don't know why. But I gave it up after a week. It just didn't fit in with my lifestyle."],
      ['Susie', "But most pre-school children have a short sleep in the day don't they? There was an experiment some students did here last term to see at what age kids should stop having naps. But they didn't really find an answer. They spent a lot of time working out the most appropriate methodology, but the results didn't seem to show any obvious patterns."],
      ['Luke', "Right. Anyway, let's think about our assignment. Last time I had problems with the final stage, where we had to describe and justify how successful we thought we'd been. I struggled a bit with the action plan too."],
      ['Susie', 'I was OK with the planning, but I got marked down for the self-assessment as well. And I had big problems with the statistical stuff, that\'s where I really lost marks.'],
      ['Luke', 'Right.'],
      ['Susie', 'So shall we plan what we have to do for this assignment?'],
      ['Luke', 'OK.'],
      ['Susie', "First, we have to decide on our research question. So how about 'Is there a relationship between hours of sleep and number of dreams?'"],
      ['Luke', 'OK. Then we need to think about who we\'ll do they study on. About 12 people?'],
      ['Susie', 'Right. And shall we use other psychology students?'],
      ['Luke', 'Let\'s use people from a different department. What about history?'],
      ['Susie', 'Yes, they might have interesting dreams! Or literature students?'],
      ['Luke', "I don't really know any."],
      ['Susie', 'OK, forget that idea. Then we have to think about our methodology. So we could use observation, but that doesn\'t seem appropriate.'],
      ['Luke', 'No. it needs to be self-reporting I think. And we could ask them to answer questions online.'],
      ['Susie', "But in this case, paper might be better as they'll be doing it straight after they wake up … in fact while they're still half-asleep."],
      ['Luke', "Right. And we'll have to check the ethical guidelines for this sort of research."],
      ['Susie', 'Mm, because our experiment involves humans, so there are special regulations.'],
      ['Luke', "Yes, I had a look at those for another assignment I did. There's a whole section on risk assessment, and another section on making sure they aren't put under any unnecessary stress."],
      ['Susie', "Let's hope they don't have any bad dreams!"],
      ['Luke', 'Yeah.'],
      ['Susie', "Then when we've collected all our data we have to analyse it and calculate the correlation between our two variables, that's time sleeping and number of dreams and then present our results visually in a graph."],
      ['Luke', "Right. And the final thing is to think about our research and evaluate it. So that seems quite straightforward."],
      ['Susie', 'Yeah. So now let\'s …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 4,
    transcript: fmt('Health benefits of dance', [
      [null, "Dancing is something that humans do when they want to have a good time. It's a universal response to music, found in all cultures. But what's only been discovered recently is that dancing not only makes us feel good, it's also extremely good for our health."],
      [null, 'Dancing, like other forms of exercise, releases hormones, such as dopamine, which make us feel relaxed and happy. And it also reduces feelings of stress or anxiety.'],
      [null, 'Dancing is also a sociable activity, which is another reason it makes us feel good.'],
      [null, "One study compared people's enjoyment of dancing at home in front of a video with dancing in a group in a studio."],
      [null, 'The people dancing in a group reported feeling happier, whereas those dancing alone did not.'],
      [null, 'In another experiment, university researchers at York and Sheffield took a group of students and sent each of them into a lab where music was played for five minutes. Each had to choose from three options: to sit and listen quietly to the music, to cycle on an exercise bike while they listened, or to get up and dance. All were given cognitive tasks to perform before and after. The result showed that those who chose to dance showed much more creativity when doing problem-solving tasks.'],
      [null, 'Doctor Lovatt at the University of Hertfordshire believes dance could be a very useful way to help people suffering from mental health problems. He thinks dance should be prescribed as therapy to help people overcome issues such as depression.'],
      [null, "It's well established that dance is a good way of encouraging adolescent girls to take exercise but what about older people? Studies have shown that there are enormous benefits for people in their sixties and beyond. One of the great things about dance is that there are no barriers to participation. Anyone can have a go, even those whose standard of fitness is quite low."],
      [null, "Dance can be especially beneficial for older adults who can't run or do more intense workouts, or for those who don't want to. One 2015 study found that even a gently dance workout helps to promote a healthy heart. And there's plenty of evidence which suggests that dancing lowers the risk of falls, which could result in a broken hip, for example, by helping people to improve their balance."],
      [null, "There are some less obvious benefits of dance for older people too. One thing I hadn't realised before researching this topic was that dance isn't just a physical challenge. It also requires a lot of concentration because you need to remember different steps and routines. For older people, this kind of activity is especially important because it forces their brain to process things more quickly and to retain more information."],
      [null, 'Current research also shows that dance promotes a general sense of well-being in older participants, which can last up to a week after a class. Participants report feeling less tired and having greater motivation to be more active and do daily activities such as gardening or walking to the shops or a park.'],
      [null, 'Ballroom or country dancing, both popular with older people, have to be done in groups. They require collaboration and often involve touching a dance partner, all of which encourages interaction on the dance floor. This helps to develop new relationships and can reduce older people\'s sense of isolation, which is a huge problem in many countries.'],
      [null, "I also looked at the benefits of Zumba. Fifteen million people in 180 countries now regularly take a Zumba class, an aerobic workout based on Latin American dance moves. John Porcari, a professor of exercise and sport science at the University of Wisconsin, analysed a group of women who were Zumba regulars and found that a class lasting 40 minutes burns about 370 calories. This is similar to moderately intense exercises like step aerobics or kickboxing."],
      [null, 'A study in the American Journal of Health Behavior showed that when women with obesity did Zumba three times a week for 16 weeks, they lost an average of 1.2 kilos and lowered their percentage of body fat by 1%. More importantly, the women enjoyed the class so much that they made it a habit and continued to attend classes at least once a week - very unusual for an aerobic exercise programme.'],
      [null, "Dance is never going to compete with high-intensity workouts when it comes to physical fitness gains, but its popularity is likely to keep on rising because it's such a fun way to keep fit."],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 3 ══════════════════════════
  {
    testName: 'Cam 16 - Test 3', partNumber: 1,
    transcript: fmt('Junior Cycle Camp enquiry', [
      ['Jake', 'Hello, Junior Cycle camp, Jake speaking.'],
      ['Woman', "Hi. I'm calling for some information about the cycle camp - I'm thinking of sending my son."],
      ['Jake', "Great. Well, it's held every weekday morning over the summer vacation and we focus on basic cycling skills and safety. We have eight levels for children from three years upwards. How old's your son?"],
      ['Woman', "Charlie? He's seven. He can ride a bike, but he needs a little more training before he's safe to go on the road."],
      ['Jake', "He'd probably be best in Level 5. They start off practising on the site here, and we aim to get them riding on the road, but first they're taken to ride in the park, away from the traffic."],
      ['Woman', 'Right. And can you tell me a bit about the instructors?'],
      ['Jake', "Well, all our staff wear different coloured shirts. So, we have three supervisors, and they have red shirts. They support the instructors, and they also stand in for me if I'm not around. Then the instructors themselves are in blue shirts, and one of these is responsible for each class."],
      ['Woman', 'OK.'],
      ['Jake', "In order to be accepted, all our instructors have to submit a reference from someone who's seen them work with children - like if they've worked as a babysitter, for example. Then they have to complete our training course, including how to do lesson plans, and generally care for the well-being of the kids in their class. They do a great job, I have to say."],
      ['Woman', "Right. And tell me a bit about the classes. What size will Charlie's class be?"],
      ['Jake', "We have a limit of eight children in each class, so their instructor really gets to know them well. They're out riding most of the time but they have quiet times too, where their instructor might tell them a story that's got something to do with cycling, or get them to play a game together. It's a lot of fun."],
      ['Woman', "It must be. Now, what happens if there's rain? Do the classes still run?"],
      ['Jake', "Oh yes. We don't let that put us off - we just put on our waterproofs and keep cycling."],
      ['Woman', 'And is there anything special Charlie should bring along with him?'],
      ['Jake', "Well, maybe some spare clothes, especially if the weather's not so good. And a snack for break time."],
      ['Woman', 'How about a drink?'],
      ['Jake', 'No, we\'ll provide that. And make sure he has shoes, not sandals.'],
      ['Woman', 'Sure. And just at present Charlie has to take medication every few hours, so I\'ll make sure he has that.'],
      ['Jake', "Absolutely. Just give us details of when he has to take it and we'll make sure he does."],
      ['Woman', 'Thanks.'],
      ['Jake', "Now, there are a few things you should know about Day 1 of the camp. The classes normally start at 9.30 every morning, but on Day 1 you should aim to get Charlie here by 9.20. The finishing time will be 12.30 as usual. We need the additional time because there are a few extra things to do. The most important is that we have a very careful check to make sure that every child's helmet fits properly. If it doesn't fit, we'll try to adjust it, or we'll find him another one - but he must wear it all the time he's on the bike."],
      ['Woman', 'Of course.'],
      ['Jake', "Then after that, all the instructors will be waiting to meet their classes, and they'll meet up in the tent - you can't miss it. And each instructor will take their class away and get started."],
      ['Woman', 'OK. Well that all sounds good. Now can you tell me how much the camp costs a week?'],
      ['Jake', "One hundred ninety-nine dollars. We've managed to keep the price more or less the same as last year - it was one hundred ninety then. But the places are filling up quite quickly."],
      ['Woman', 'Right. OK, well I\'d like to book for …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 2,
    transcript: fmt('Careers in agriculture and horticulture', [
      [null, "Hello everyone. My name's Megan Baker and I'm a recruitment consultant at AVT Recruitment specialists."],
      [null, "Now, our company specialises in positions that involve working in the agriculture and horticulture sectors, so that's fresh food production, garden and park maintenance and so on. And these sectors do provide some very special career opportunities. For a start, they often offer opportunities for those who don't want to be stuck with a 40-hour week, but need to juggle work with other responsibilities such as child care - and this is very important for many of our recruits. Some people like working in a rural setting, surrounded by plants and trees instead of buildings, although we can't guarantee that. But there are certainly health benefits, especially in jobs where you're not sitting all day looking at a screen - a big plus for many people. Salaries can sometimes be good too, although there's a lot of variety here. And you may have the opportunity in some types of jobs for travel overseas, although that obviously depends on the job, and not everyone is keen to do it."],
      [null, "Of course, working outdoors does have its challenges. It's fine in summer, but can be extremely unpleasant when it's cold and windy. You may need to be pretty fit for some jobs, though with modern technology that's not as important as it once was. And standards of health and safety are much higher now than they used to be, so there are fewer work-related accidents. But if you like a lively city environment surrounded by lots of people, these jobs are probably not for you - they're often in pretty remote areas. And some people worry about finding a suitable place to live, but in our experience, this usually turns out fine."],
      [null, 'Now let me tell you about some of the exciting jobs that we have on our books right now.'],
      [null, "One is for a fresh food commercial manager. Our client here is a very large fresh food producer supplying a range of top supermarkets. They operate in a very fast-paced environment with low profit margins - the staff there work hard, but they play hard as well, so if you've a sociable personality this may be for you."],
      [null, 'We have an exciting post as an agronomist advising farmers on issues such as crop nutrition, protection against pests, and the latest legislation on farming and agricultural practices. There are good opportunities for the right person to quickly make their way up the career ladder, but a deep knowledge of the agricultural sector is expected of applicants.'],
      [null, 'A leading supermarket is looking for a fresh produce buyer who is available for a 12-month maternity cover contract. You need to have experience in administration, planning and buying in the fresh produce industry, and in return will receive a very competitive salary.'],
      [null, 'We have also received a request for a sales manager for a chain of garden centres. You will be visiting centres in the region to ensure their high levels of customer service are maintained. This post is only suitable for someone who is prepared to live in the region.'],
      [null, "There is also a vacancy for a tree technician to carry out tree cutting, forestry and conservation work. Candidates must have a clean driving licence and have training in safety procedures. A year's experience would be preferred but the company might be prepared to consider someone who has just completed an appropriate training course."],
      [null, 'Finally, we have a position for a farm worker. This will involve a wide range of farm duties including crop sowing and harvesting, machine maintenance and animal care. Perks of the job include the possibility of renting a small cottage on the estate, and the chance to earn a competitive salary. A driving licence and tractor driving experience are essential.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 3,
    transcript: fmt('Presentation on diet and obesity', [
      ['Adam', 'OK Rosie, shall we try to get some ideas together for our presentation on diet and obesity?'],
      ['Rosie', 'Sure.'],
      ['Adam', 'I can talk about the experiment I did to see if people can tell the difference between real sugar and artificial sweeteners.'],
      ['Rosie', 'Where you have people drinks with either sugar or artificial sweeteners and they had to say which they thought it was?'],
      ['Adam', "Yeah. It took me ages to decide exactly how I'd organise it, especially how I could make sure that people didn't know which drink I was giving them. It was hard to keep track of it all, especially as I had so many people doing it - I had to make sure I kept a proper record of what each person had had."],
      ['Rosie', 'So could most people tell the difference?'],
      ['Adam', "Yeah - I hadn't thought they would be able to, but most people could."],
      ['Rosie', "Then there's that experiment I did measuring the fat content of nuts, to see if the nutritional information given on the packet was accurate."],
      ['Adam', 'The one where you ground up the nuts and mixed them with a chemical to absorb the fat?'],
      ['Rosie', "Yes. My results were a bit problematic - the fat content for that type of nut seemed much lower than it said on the package. But I reckon the package information was right. I think I should probably have ground up the nuts more than I did. It's possible that the scales for weighing the fat weren't accurate enough, too. I'd really like to try the experiment again some time."],
      ['Adam', 'So what can we say about helping people to lose weight? There\'s a lot we could say about what restaurants could do to reduce obesity. I read that the items at the start of a menu and the items at the end of a menu are much more likely to be chosen than the items in the middle. So, if you put the low-calorie items at the beginning and end of the menu, people will probably go for the food with fewer calories, without even realising what they\'re doing.'],
      ['Rosie', 'I think food manufacturers could do more to encourage healthy eating.'],
      ['Adam', 'How?'],
      ['Rosie', "Well, when manufacturers put calorie counts of a food on the label, they're sometimes really confusing and I suspect they do it on purpose. Because food that's high in calories tastes better, and so they'll sell more."],
      ['Adam', "Yeah, so if you look at the amount of calories in a pizza, they'll give you the calories per quarter pizza and you think, oh that's not too bad. But who's going to eat a quarter pizza?"],
      ['Rosie', 'Exactly.'],
      ['Adam', 'I suppose another approach to this problem is to get people to exercise more.'],
      ['Rosie', 'Right. In England, the current guidelines are for at least 30 minutes of brisk walking, five days a week. Now when you ask them, about 40% of men and 30% of women say they do this, but when you objectively measure the amount of walking they do with motion sensors, you find that only 6% of men and 4% of women do the recommended amount of exercise.'],
      ['Adam', 'Mm, so you can see why obesity is growing.'],
      ['Rosie', 'So how can people be encouraged to take more exercise?'],
      ['Adam', "Well, for example, think of the location of stairs station. If people reach the stairs before they reach the escalator when they're leaving the station, they're more likely to take the stairs. And if you increase the width of the stairs, you'll get more people using them at the same time. It's an unconscious process and influenced by minor modifications in their environment."],
      ['Rosie', "Right. And it might not be a big change, but if it happens every day, it all adds up."],
      ['Adam', "Yes. But actually, I'm not sure if we should be talking about exercise in our presentation."],
      ['Rosie', "Well, we've done quite a bit of reading about it."],
      ['Adam', "I know, but it's going to mean we have a very wide focus, and our tutor did say that we need to focus on causes and solutions in terms of nutrition."],
      ['Rosie', "I suppose so. And we've got plenty of information about that. OK, well that will be simpler."],
      ['Adam', "So what shall we do now? We've still got half an hour before our next lecture."],
      ['Rosie', "Let's think about what we're going to include and what will go where. Then we can decide what slides we need."],
      ['Adam', 'OK, fine.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 4,
    transcript: fmt('Hand knitting', [
      [null, "Good morning everyone. So today we're going to look at an important creative activity and that's hand knitting. Ancient knitted garments have been found in many different countries, showing that knitting is a global activity with a long history."],
      [null, "When someone says the word 'knitting' we might well picture an elderly person - a grandmother perhaps - sitting by the fire knitting garments for themselves or other members of the family. It's a homely image, but one that may lead you to feel that knitting is an activity of the past - and, indeed, during the previous decade, it was one of the skills that was predicted to vanish from everyday life. For although humans have sewn and knitted their own clothing for a very long time, many of these craft-based skills went into decline when industrial machines took over - mainly because they were no longer passed down from one generation to another. However, that's all changing and interest in knitting classes in many countries is actually rising, as more and more people are seeking formal instruction in the skill. With that trend, we're also seeing an increase in the sales figures for knitting equipment."],
      [null, "So why do people want to be taught to knit at a time when a machine can readily do the job for them? The answer is that knitting, as a handicraft, has numerous benefits for those doing it. Let's consider what some of these might be. While many people knitted garments in the past because they couldn't afford to buy clothes, it's still true today that knitting can be helpful if you're experiencing economic hardship. If you have several children who all need warm winter clothes, knitting may save you a lot of money. And the results of knitting your own clothes can be very rewarding, even though the skills you need to get going are really quite basic and the financial outlay is minimal."],
      [null, "But the more significant benefits in today's world are to do with well-being. In a world where it's estimated that we spend up to nine hours a day online, doing something with our hands that is craft-based makes us feel good. It releases us from the stress of a technological, fast-paced life."],
      [null, "Now, let's look back a bit to early knitting activities. In fact, no one really knows when knitting first began, but archaeological remains have disclosed plenty of information for us to think about."],
      [null, "One of the interesting things about knitting is that the earliest pieces of clothing that have been found suggest that most of the items produced were round rather than flat. Discoveries from the 3rd and 4th centuries in Egypt show that things like socks and gloves, that were needed to keep hands and feet warm, were knitted in one piece using four or five needles. That's very different from most knitting patterns today, which only require two. What's more, the very first needles people used were hand carved out of wood and other natural materials, like bone, whereas today's needles are largely made of steel or plastic and make that characteristic clicking sound when someone's using them. Ancient people knitted using yarns made from linen, hemp, cotton and wool, and these were often very rough on the skin. The spinning wheel, which allowed people to make finer yarns and produce much greater quantities of them, led to the dominance of wool in the knitting industry - often favoured for its warmth."],
      [null, "Another interesting fact about knitting is that because it was practised in so many parts of the world for so many purposes, regional differences in style developed. This visual identity has allowed researchers to match bits of knitted clothing that have been unearthed over time to the region from which the wearer came or the job that he or she did."],
      [null, "As I've mentioned, knitting offered people from poor communities a way of making extra money while doing other tasks. For many centuries, it seems, men, women and children took every opportunity to knit, for example, while watching over sheep, walking to market or riding in boats. So, let's move on to take a …"],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 4 ══════════════════════════
  {
    testName: 'Cam 16 - Test 4', partNumber: 1,
    transcript: fmt('Holiday cottage rental', [
      ['Shirley', 'Hello?'],
      ['Tom', 'Oh hello. I was hoping to speak to Jack Fitzgerald about renting a cottage.'],
      ['Shirley', "I'm his wife, Shirley, and we own the cottages together, so I'm sure I can help you."],
      ['Tom', "Great. My name's Tom. Some friends of ours rented Granary Cottage from you last year, and they thought it was great. So my wife and I are hoping to come in May for a week."],
      ['Shirley', 'What date did you have in mind?'],
      ['Tom', 'The week beginning the 14th, if possible.'],
      ['Shirley', "I'll just check … I'm sorry, Tom, it's already booked that week. It's free the week beginning the 28th, though, for seven nights. In fact, that's the only time you could have it in May."],
      ['Tom', 'Oh. Well, we could manage that, I think. We\'d just need to change a couple of things. How much would it cost?'],
      ['Shirley', "That's the beginning of high season, so it'd be £550 for the week."],
      ['Tom', "Ah. That's a bit more than we wanted to pay, I'm afraid. We've budgeted up to £500 for accommodation."],
      ['Shirley', "Well, we've just finished converting another building into a cottage, which we're calling Chervil Cottage."],
      ['Tom', 'Sorry? What was that again?'],
      ['Shirley', 'Chervil. C-H-E-R-V for Victor I-L.'],
      ['Tom', "Oh, that's a herb, isn't it?"],
      ['Shirley', "That's right. It grows fairly wild around here. You could have that for the week you want for £480."],
      ['Tom', 'OK. So could you tell me something about it, please?'],
      ['Shirley', "Of course. The building was built as a garage. It's a little smaller than Granary Cottage."],
      ['Tom', 'So that must sleep two people, as well?'],
      ['Shirley', "That's right. There's a double bedroom."],
      ['Tom', 'Does it have a garden?'],
      ['Shirley', "Yes, you get to it from the living room through French doors, and we provide two deckchairs. We hope to build a patio in the near future, but I wouldn't like to guarantee it'll be finished by May."],
      ['Tom', 'OK.'],
      ['Shirley', "The front door opens onto the old farmyard, and parking isn't a problem - there's plenty of room at the front for that. There are some trees and potted plants there."],
      ['Tom', "What about facilities in the cottage? It has standard things like a cooker and fridge, I presume."],
      ['Shirley', "In the kitchen area there's a fridge-freezer and we've just put in an electric cooker."],
      ['Tom', 'Is there a washing machine?'],
      ['Shirley', "Yes. There's also a TV in the living room, which plays DVDs too. The bathroom is too small for a bath, so there's a shower instead. I think a lot of people prefer that nowadays, anyway."],
      ['Tom', "It's more environmentally friendly, isn't it? Unless you spend half the day in it!"],
      ['Shirley', 'Exactly.'],
      ['Tom', "What about heating? It sometimes gets quite cool at that time of year."],
      ['Shirley', "There's central heating, and if you want to light a fire, there's a stove. We can provide all the wood you need for it. It smells so much nicer than coal, and it makes the room very cosy - we've got one in our own house."],
      ['Tom', 'That sounds very pleasant. Perhaps we should come in the winter, to make the most of it!'],
      ['Shirley', "Yes, we find we don't want to go out when we've got the fire burning. There are some attractive views from the cottage, which I haven't mentioned. There's a famous stone bridge - it's one of the oldest in the region, and you can see it from the living room. It isn't far away. The bedroom window looks in the opposite direction, and has a lovely view of the hills and the monument at the top."],
      ['Tom', "Well, that all sounds perfect. I'd like to book it, please. Would you want a deposit?"],
      ['Shirley', "Yes, we ask for thirty percent to secure your booking, so that'll be, um, £144."],
      ['Tom', 'And when would you like the rest of the money?'],
      ['Shirley', "You're coming in May, so the last day of March, please."],
      ['Tom', 'Fine.'],
      ['Shirley', 'Excellent. Could I just take your details …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 2,
    transcript: fmt('Local council report on traffic and highways', [
      ['Chairperson', 'Right. Next on the agenda we have traffic and highways. Councillor Thornton.'],
      ['Councillor Thornton', "Thank you. Well, we now have the results of the survey carried out last month about traffic and road transport in the town. People were generally satisfied with the state of the roads. There were one or two complaints about potholes which will be addressed, but a significant number of people complained about the increasing number of heavy vehicles using our local roads to avoid traffic elsewhere. We'd expected more complaints by commuters about the reduction in the train service, but it doesn't seem to have affected people too much. The cycle path that runs alongside the river is very well used by both cyclists and pedestrians since the surface was improved last year, but overtaking can be a problem so we're going to add a bit on the side to make it wider. At some stage, we'd like to extend the path so that it goes all the way through the town, but that won't be happening in the immediate future."],
      ['Councillor Thornton', "The plans to have a pedestrian crossing next to the Post Office have unfortunately had to be put on hold for the time being. We'd budgeted for this to be done this financial year, but then there were rumours that the Post Office was going to move, which would have meant there wasn't really a need for a crossing. Now they've confirmed that they're staying where they are, but the Highways Department have told us that it would be dangerous to have a pedestrian crossing where we'd originally planned it as there's a bend in the road there. So that'll need some more thought."],
      ['Councillor Thornton', "On Station Road near the station and level crossing, drivers can face quite long waits if the level crossing's closed, and we've now got signs up requesting them not to leave their engines running at that time. This means pedestrians waiting on the pavement to cross the railway line don't have to breathe in car fumes. We've had some problems with cyclists leaving their bikes chained to the railings outside the ticket office, but the station has agreed to provide bike racks there."],
      ['Chairperson', "So next on the agenda is 'Proposals for improvements to the recreation ground'. Councillor Thornton again."],
      ['Councillor Thornton', "Well, since we managed to extend the recreation ground, we've spent some time talking to local people about how it could be made a more attractive and useful space. If you have a look at the map up on the screen, you can see the river up in the north, and the Community Hall near the entrance from the road. At present, cars can park between the Community Hall and that line of trees to the east, but this is quite dangerous for pedestrians so we're suggesting a new car park on the opposite side of the Community Hall, right next to it. We also have a new location for the cricket pitch. As we've now purchased additional space to the east of the recreation ground, beyond the trees, we plan to move it away from its current location, which is rather near the road, into this new area beyond the line of trees. This means there's less danger of stray balls hitting cars or pedestrians."],
      ['Councillor Thornton', "We've got plans for a children's playground which will be accessible by a footpath from the Community Hall and will be alongside the river. We'd originally thought of having it close to the road, but we think this will be a more attractive location."],
      ['Councillor Thornton', "The skateboard ramp is very popular with both younger and older children - we had considered moving this up towards the river, but in the end we decided to have it in the southeast corner near the road. The pavilion is very well used at present by both football players and cricketers. It will stay where it is now - to the left of the line of trees and near to the river - handy for both the football and cricket pitches. And finally, we'll be getting a new notice board for local information, and that will be directly on people's right as they go from the road into the recreation ground."],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 3,
    transcript: fmt('City bike-sharing schemes', [
      ['Jake', "Now that we've done all the research into bike-sharing schemes in cities around the world, we need to think about how we're going to organise our report."],
      ['Amy', "Right. I think we should start by talking about the benefits. I mean it's great that so many cities have introduced these schemes where anyone can pick up a bike from dozens of different locations and hire it for a few hours. It makes riding a bike very convenient for people."],
      ['Jake', 'Yes, but the costs can add up and that puts people on low incomes off in some places.'],
      ['Amy', "I suppose so, but if it means more people in general are cycling rather than driving, then because they're increasing the amount of physical activity they do, it's good for their health"],
      ['Jake', "OK. But isn't that of less importance? I mean, doesn't the impact of reduced emissions on air pollution have a more significant effect on people's health?"],
      ['Amy', 'Certainly, in some cities bike-sharing had made a big contribution to that. And also helped to cut the number of cars on the road significantly.'],
      ['Jake', 'Which is the main point.'],
      ['Amy', "Exactly. But I'd say it's had less of an impact on noise pollution because there are still loads of buses and lorries around."],
      ['Jake', 'Right.'],
      ['Amy', 'Shall we quickly discuss the recommendations we\'re going to make?'],
      ['Jake', 'In order to ensure bike-sharing schemes are successful?'],
      ['Amy', 'Yes.'],
      ['Jake', "OK. Well, while I think it's nice to have really state-of-the art bikes with things like GPS, I wouldn't say they're absolutely necessary."],
      ['Amy', "But some technical things are really important - like a fully functional app - so people can make payments and book bikes easily. Places which haven't invested in that have really struggled."],
      ['Jake', "Good point … Some people say there shouldn't be competing companies offering separate bike-sharing schemes, but in some really big cities, competition's beneficial and anyway one company might not be able to manage the whole thing."],
      ['Amy', "Right. Deciding how much to invest is a big question. Cities which have opened loads of new bike lanes at the same time as introducing bike-sharing schemes have generally been more successful - but there are examples of successful schemes where this hasn't happened … What does matter though - is having a big publicity campaign."],
      ['Jake', "Definitely. If people don't know how to use the scheme or don't understand its benefits, they won't use it. People need a lot of persuasion to stop using their cars."],
      ['Amy', 'Shall we look at some examples now? And say what we think is good or bad about them.'],
      ['Jake', 'I suppose we should start with Amsterdam as this was one of the first cities to have a bike-sharing scheme.'],
      ['Amy', "Yes. There was already a strong culture of cycling here. In a way it's strange that there was such a demand for bike-sharing because you'd have thought most people would have used their own bikes."],
      ['Jake', "And yet it's one of the best-used schemes … Dublin's an interesting example of a success story."],
      ['Amy', "It must be because the public transport system's quite limited."],
      ['Jake', "Not really - there's no underground, but there are trams and a good bus network. I'd say price has a lot to do with it. It's one of the cheapest schemes in Europe to join."],
      ['Amy', "But the buses are really slow - anyway the weather certainly can't be a factor!"],
      ['Jake', "No - definitely not. The London scheme's been quite successful"],
      ['Amy', "Yes - it's been a really good thing for the city. The bikes are popular and the whole system is well maintained but it isn't expanding quickly enough."],
      ['Jake', "Basically, not enough's been spent on increasing the number of cycle lanes. Hopefully that'll change."],
      ['Amy', 'Yes. Now what about outside Europe?'],
      ['Jake', 'Well bike-sharing schemes have taken off in places like Buenos Aires.'],
      ['Amy', "Mmm. They built a huge network of cycle lanes to support the introduction of the scheme there, didn't they? It attracted huge numbers of cyclists where previously there were hardly any."],
      ['Jake', 'An example of good planning.'],
      ['Amy', 'Absolutely. New York is a good example of how not to introduce a scheme. When they launched it, it was more than ten times the price of most other schemes.'],
      ['Jake', 'More than it costs to take a taxi, Crazy. I think the organisers lacked vision and ambition there.'],
      ['Amy', "I think so too. Sydney would be a good example to use. I would have expected it to have grown pretty quickly here."],
      ['Jake', "Yes. I can't quite work out why it hasn't been an instant success like some of the others. It's a shame really."],
      ['Amy', 'I know. OK so now we\'ve thought about …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 4,
    transcript: fmt('The extinction of the dodo bird', [
      [null, "One of the most famous cases of extinction is that of a bird known as the dodo. In fact there's even a saying in English, 'as dead as the dodo', used to refer to something which no longer exists. But for many centuries the dodo was alive and well, although it could only be found in one place, the island of Mauritius in the Indian Ocean. It was a very large bird, about one metre tall, and over the centuries it had lost the ability to fly, but it survived happily under the trees that covered the island."],
      [null, "Then in the year 1507 the first Portuguese ships stopped at the island. The sailors were carrying spices back to Europe, and found the island a convenient stopping place where they could stock up with food and water for the rest of the voyage, but they didn't settle on Mauritius. However, in 1638 the Dutch arrived and set up a colony there. These first human inhabitants of the island found the dodo birds a convenient source of meat, although not everyone liked the taste."],
      [null, "It's hard to get an accurate description of what the dodo actually looked like. We do have some written records from sailors, and a few pictures, but we don't know how reliable these are. The best-known picture is a Dutch painting in which the bird appears to be extremely fat, but this may not be accurate - an Indian painting done at the same time shows a much thinner bird."],
      [null, "Although attempts were made to preserve the bodies of some of the birds, no complete specimen survives. In the early 17th century four dried parts of a bird were known to exist - of these, three have disappeared, so only one example of soft tissue from the dodo survives, a dodo head. Bones have also found, but there's only one complete skeleton in existence."],
      [null, "This single dodo skeleton has recently been the subject of scientific research which suggests that many of the earlier beliefs about dodos may have been incorrect. For example, early accounts of the birds mention how slow and clumsy it was, but scientists now believe the bird's strong knee joints would have made it capable of movement which was not slow, but actually quite fast. In fact, one 17th century sailor wrote that he found the birds hard to catch. It's true that the dodo's small wings wouldn't have allowed it to leave the ground, but the scientists suggest that these were probably employed for balance while going over uneven ground. Another group of scientists carried out analysis of the dodo's skull. They found that the reports of the lack of intelligence of the dodo were not borne out by their research, which suggested the bird's brain was not small, but average in size. In fact, in relation to its body size, it was similar to that of the pigeon, which is known to be a highly intelligent bird. The researchers also found that the structure of the bird's skull suggested that one sense which was particularly well-developed was that of smell. So the dodo may also have been particularly good at locating ripe fruit and other food in the island's thick vegetation."],
      [null, "So it looks as if the dodo was better able to survive and defend itself than was originally believed. Yet less than 200 years after Europeans first arrived on the island, they had become extinct. So what was the reason for this? For a long time, it was believed that the dodos were hunted to extinction, but scientists now believe the situation was more complicated than this. Another factor may have been the new species brought to the island by the sailors. These included dogs, which would have been a threat to the dodos, and also monkeys, which ate the fruit that was the main part of the dodos' diet. These were brought to the island deliberately, but the ships also brought another type of creature - rats, which came to land from the ships and rapidly overran the island. These upset the ecology of the island, not just the dodos but other species too. However, they were a particular danger to the dodos because they consumed their eggs, and since each dodo only laid one at a time, this probably had a devastating effect on populations."],
      [null, "However, we now think that probably the main cause of the birds' extinction was not the introduction of non-native species, but the introduction of agriculture. This meant that the forest that has once covered all the island, and that had provided a perfect home for the dodo, was cut down so that crops such as sugar could be grown. So although the dodo had survived for thousands of years, suddenly it was gone."],
    ]),
  },
];

async function runSeedCam16() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS_Cam16) {
    const { testName, partNumber, transcript } = target;
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscriptsCam16] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscriptsCam16] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS_Cam16.length} targets).`);
}


// Same approach/format as seedListeningTranscripts.js (Cam 21) — sourced
// from published Cambridge IELTS 17 audioscripts (ieltstrainingonline.com),
// verified sentence by sentence against every question's correctAnswer
// already in the DB before being written here.


const TARGETS_Cam17 = [
  // ══════════════════════════ Cam 17 - Test 1 ══════════════════════════
  {
    testName: 'Cam 17 - Test 1', partNumber: 1,
    transcript: fmt('Buckworth Conservation Group', [
      ['Peter', 'Hello?'],
      ['Jan', "Oh hello. My name's Jan. Are you the right person to talk to about the Buckworth Conservation Group?"],
      ['Peter', "Yes, I'm Peter. I'm the secretary."],
      ['Jan', "Good. I've just moved to this area, and I'm interested in getting involved. I was in a similar group where I used to live. Could you tell me something about your activities, please?"],
      ['Peter', "Of course. Well, we have a mixture of regular activities and special events. One of the regular ones is trying to keep the beach free of litter. A few of us spend a couple of hours a month on it, and it's awful how much there is so clear. I wish people would be more responsible and take it home with them."],
      ['Jan', "I totally agree. I'd be happy to help with that. Is it OK to take dogs?"],
      ['Peter', "I'm afraid not, as they're banned from the beach itself. You can take them along the cliffs, though. And children are welcome."],
      ['Jan', 'Right.'],
      ['Peter', "We also manage a nature reserve, and there's a lot to do there all year round. For example, because it's a popular place to visit, we spend a lot of time looking after the paths and making sure they're in good condition for walking."],
      ['Jan', 'I could certainly help with that.'],
      ['Peter', "Good. And we have a programme of creating new habitats there. We're just finished making and installing nesting boxes for birds to use, and next we're going to work on encouraging insects – they're important for the biodiversity of the reserve."],
      ['Jan', 'They certainly are.'],
      ['Peter', "Oh, and we're also running a project to identify the different species of butterflies that visit the reserve. You might be interested in taking part in that."],
      ['Jan', "Sure. I was involved in something similar where I used to live, counting all the species of months. I'd enjoy that."],
      ['Peter', "Another job we're doing at the reserve is replacing the wall on the southern side, between the parking area and our woodshed. It was badly damaged in a storm last month."],
      ['Jan', 'OK.'],
      ['Peter', 'Then as I said, we have a programme of events as well, both at the weekend, and during the week.'],
      ['Jan', "Right. I presume you have guided walks? I'd like to get to know the local countryside, as I'm new to the area."],
      ['Peter', "Yes, we do. The next walk is to Ruston Island, a week on Saturday. We'll be meeting in the car park at Dunsmore Beach at low tide – that's when the sands are dry enough for us to walk to the island without getting wet."],
      ['Jan', 'Sounds good.'],
      ['Peter', "The island's a great place to explore. It's quite small, and it's got a range of habitats. It's also an ideal location for seeing seals just off the coast, or even on the beach."],
      ['Jan', 'OK. And is there anything we should bring, like a picnic, for instance?'],
      ['Peter', "Yes, do bring one, as it's a full-day walk. And of course it'll be wet walking across and back, so make sure your boots are waterproof."],
      ['Jan', "I must buy a new pair – there's a hole in one of my current ones! Well, I'd definitely like to come on the walk."],
      ['Peter', 'Great. Then later this month we\'re having a one-day woodwork session in Hopton Wood.'],
      ['Jan', "I've never tried that before. Is it OK for beginners to take part?"],
      ['Peter', "Definitely. There'll be a couple of experts leading the session, and we keep the number of participants down, so you'll get as much help as you need."],
      ['Jan', "Excellent! I'd love to be able to make chairs."],
      ['Peter', "That's probably too ambitious for one day! You'll be starting with wooden spoons, and of course learning how to use the tools. And anything you make is yours to take home with you."],
      ['Jan', 'That sounds like fun. When is it?'],
      ['Peter', "It's on the 17th, from 10 a.m. until 3. There's a charge of £35, including lunch, or £40 if you want to camp in the wood."],
      ['Jan', "I should think I'll come home the same day. Well, I'd certainly like to join the group."],
    ]),
  },
  {
    testName: 'Cam 17 - Test 1', partNumber: 2,
    transcript: fmt('Boat trip round Tasmania', [
      [null, "So, hello everyone. My name's Lou Miller and I'm going to be your tour guide today as we take this fantastic boat trip around the Tasmanian coast. Before we set off, I just want to tell you a few things about our journey."],
      [null, "Our boats aren't huge as you can see. We already have three staff members on board and on top of that, we can transport a further fifteen people – that's you – around the coastline. But please note if there are more than nine people on either side of the boat, we'll move some of you over, otherwise all eighteen of us will end up in the sea!"],
      [null, "We've recently upgraded all our boats. They used to be jet black, but our new ones now have these comfortable dark red seats and a light-green exterior in order to stand out from others and help promote our company. This gives our boats a rather unique appearance, don't you think?"],
      [null, "We offer you a free lunchbox during the trip and we have three types. Lunchbox 1 contains ham and tomato sandwiches. Lunchbox 2 contains a cheddar cheese roll and Lunchbox 3 is salad-based and also contains eggs and tuna. All three lunchboxes also have a packet of crisps and chocolate bar inside. Please let staff know which lunchbox you prefer."],
      [null, "I'm sure I don't have to ask you not to throw anything into the sea. We don't have any bins to put litter in, but Jess, myself or Ray, our other guide, will collect it from you after lunch and put it all in a large plastic sack."],
      [null, "The engine on the boat makes quite a lot of noise so before we head off, let me tell you a few things about what you're going to see."],
      [null, "This area is famous for its ancient lighthouse, which you'll see from the boat as we turn past the first little island. It was built in 1838 to protect sailors as a number of shipwrecks had led to significant loss of life. The construction itself was complicated as some of the original drawings kept by the local council show. It sits right on top of the cliffs in a very isolated spot. In the nineteenth century there were many jobs there, such as polishing the brass lamps, chopping firewood and cleaning windows, that kept lighthouse keepers busy. These workers were mainly prison convicts until the middle of that century when ordinary families willing to live in such circumstances took over."],
      [null, "Some of you have asked me what creatures we can expect to see. I know everyone loves the penguins, but they're very shy and, unfortunately, tend to hide from passing boats, but you might see birds in the distance, such as sea eagles, flying around the cliff edges where they nest. When we get to the rocky area inhabited by fur seals, we'll stop and watch them swimming around the coast. They're inquisitive creatures so don't be surprised if one pops up right in front of you. Their predators, orca whales, hunt along the coastline too, but spotting one of these is rare. Dolphins, on the other hand, can sometimes approach on their own or in groups as they ride the waves beside us."],
      [null, "Lastly, I want to mention the caves. Tasmania is famous for its caves and the ones we'll pass by are so amazing that people are lost for words when they see them. They can only be approached by sea, but if you feel that you want to see more than we're able to show you, then you can take a kayak into the area on another day and one of our staff will give you more information on that. What we'll do is to go through a narrow channel, past some incredible rock formations and from there we'll be able to see the openings to the caves, and at that point we'll talk to you about what lies beyond."],
    ]),
  },
  {
    testName: 'Cam 17 - Test 1', partNumber: 3,
    transcript: fmt('Work experience for veterinary science students', [
      ['Diana', 'So, Tim, we have to do a short summary of our work experience on a farm.'],
      ['Tim', "Right. My farm was great, but arranging the work experience was hard. One problem was it was miles away and I don't drive. And also, I'd really wanted a placement for a month, but I could only get one for two weeks."],
      ['Diana', "I was lucky, the farmer let me stay on the farm so I didn't have to travel. But finding the right sort of farm to apply to wasn't easy."],
      ['Tim', "No, they don't seem to have websites, do they. I found mine through a friend of my mother's, but it wasn't easy."],
      ['Diana', 'No.'],
      ['Tim', "My farm was mostly livestock, especially sheep. I really enjoyed helping out with them. I was up most of one night helping a sheep deliver a lamb …"],
      ['Diana', 'On your own?'],
      ['Tim', "No, the farmer was there, and he told me what to do. It wasn't a straightforward birth, but I managed. It was a great feeling to see the lamb stagger to its feet and start feeding almost straightaway, and to know that it was OK."],
      ['Diana', 'Mm.'],
      ['Tim', 'Then another time a lamb had broken its leg, and they got the vet in to set it, and he talked me through what he was doing. That was really useful.'],
      ['Diana', "Yes, my farm had sheep too. The farm was in a valley and they had a lowland breed called Suffolks, although the farmer said they'd had other breeds in the past."],
      ['Tim', 'So were they bred for their meat?'],
      ['Diana', "Mostly, yes. They're quite big and solid."],
      ['Tim', 'My farm was up in the hills and they had a different breed of sheep, they were Cheviots.'],
      ['Diana', "Oh, I heard their wool's really sought after."],
      ['Tim', "Yes. It's very hardwearing and they use it for carpets."],
      ['Diana', 'Right.'],
      ['Tim', "I was interested in the amount of supplements they add to animals' feed nowadays. Like, even the chickens got extra vitamins and electrolytes in their feed."],
      ['Diana', "Yes, I found that too. And they're not cheap. But my farmer said some are overpriced for what they are. And he didn't give them as a matter of routine, just at times when the chickens seemed to particularly require them."],
      ['Tim', "Yes, mine said the same. He said certain breeds of chickens might need more supplements than the others, but the cheap and expensive ones are all basically the same."],
      ['Diana', 'Mm.'],
      ['Tim', 'So did your farm have any other livestock, Diana?'],
      ['Diana', "Yes, dairy cows. I made a really embarrassing mistake when I was working in the milk shed. Some cows had been treated with antibiotics, so their milk wasn't suitable for human consumption, and it had to be put in a separate container. But I got mixed up, and I poured some milk from the wrong cow in with the milk for humans, so the whole lot had to be thrown away. The farmer wasn't too happy with me."],
      ['Tim', "I asked my farmer how much he depended on the vet to deal with health problems. I'd read reports that the livestock's health is being affected as farmers are under pressure to increase production. Well, he didn't agree with that, but he said that actually some of the stuff the vets do, like minor operations, he'd be quite capable of doing himself."],
      ['Diana', "Yeah. My farmer said the same. But he reckons vets' skills are still needed."],
      ['Diana', "Now we've got to give a bit of feedback about last term's modules – just short comments, apparently. Shall we do that now?"],
      ['Tim', 'OK. So medical terminology.'],
      ['Diana', 'Well, my heart sank when I saw that, especially right at the beginning of the course. And I did struggle with it.'],
      ['Tim', "I'd thought it'd be hard, but actually I found it all quite straightforward. What did you think about diet and nutrition?"],
      ['Diana', 'OK, I suppose.'],
      ['Tim', "Do you remember what they told us about pet food and the fact that there's such limited checking into whether or not it's contaminated? I mean in comparison with the checks on food for humans – I thought that was terrible."],
      ['Diana', "Mm. I think the module that really impressed me was the animal disease one, when we looked at domesticated animals in different parts of the world, like camels and water buffalo and alpaca. The economies of so many countries depend on these, but scientists don't know much about the diseases that affect them."],
      ['Tim', "Yes, I thought they'd know a lot about ways of controlling and eradicating those diseases, but that's not the case at all. I loved the wildlife medication unit. Things like helping birds that have been caught in oil spills. That's something I hadn't thought about before."],
      ['Diana', 'Yeah, I thought I might write my dissertation on something connected with that.'],
      ['Tim', 'Right. So …'],
    ]),
  },
  {
    testName: 'Cam 17 - Test 1', partNumber: 4,
    transcript: fmt('Labyrinths', [
      [null, "Labyrinths have existed for well over 4,000 years. Labyrinths and labyrinthine symbols have been found in regions as diverse as modern-day Turkey, Ireland, Greece, and India. There are various designs of labyrinth but what they all have in common is a winding spiral path which leads to a central area. There is one starting point at the entrance and the goal is to reach the central area. Finding your way through a labyrinth involves many twists and turns, but it's not possible to get lost as there is only one single path."],
      [null, "In modern times, the word labyrinth has taken on a different meaning and is often used as a synonym for a maze. A maze is quite different as it is a kind of puzzle with an intricate network of paths. Mazes became fashionable in the 15th and 16th centuries in Europe, and can still be found in the gardens of great houses and palaces. The paths are usually surrounded by thick, high hedges so that it's not possible to see over them. Entering a maze usually involves getting lost a few times before using logic to work out the pattern and find your way to the centre and then out again. There are lots of dead ends and paths which lead you back to where you started. The word 'maze' is believed to come from a Scandinavian word for a state of confusion. This is where the word 'amazing' comes from."],
      [null, "Labyrinths, on the other hand, have a very different function. Although people now often refer to things they find complicated as labyrinths, this is not how they were seen in the past. the winding spiral of the labyrinth has been used for centuries as a metaphor for life's journey. It served as a spiritual reminder that there is purpose and meaning to our lives and helped to give people a sense of direction. Labyrinths are thought to encourage a feeling of calm and have been used as a meditation and prayer tool in many cultures over many centuries."],
      [null, "The earliest examples of the labyrinth spiral pattern have been found carved into stone, from Sardinia to Scandinavia, from Arizona to India to Africa. In Europe, these spiral carvings date from the late Bronze Age. The Native American Pima tribe wove baskets with a circular labyrinth design that depicted their own cosmology. In Ancient Greece, the labyrinth spiral was used on coins around four thousand years ago. Labyrinths made of mosaics were commonly found in bathhouses, villas and tombs throughout the Roman Empire."],
      [null, "In Northern Europe, there were actual physical labyrinths designed for walking on. These were cut into the turf or grass, usually in a circular pattern. The origin of these walking labyrinths remains unclear, but they were probably used for fertility rites which may date back thousands of years. Eleven examples of turf labyrinths survive today, including the largest one at Saffron Walden, England, which used to have a large tree in the middle of it."],
      [null, "More recently labyrinths have experienced something of a revival. Some believe that walking a labyrinth promotes healing and mindfulness, and there are those who believe in its emotional and physical benefits, which include slower breathing and a restored sense of balance and perspective. This idea has become so popular that labyrinths have been laid into the floors of spas, wellness centres and even prisons in recent years."],
      [null, "A pamphlet at Colorado Children's Hospital informs patients that 'walking a labyrinth can often calm people in the midst of a crisis'. And apparently, it's not only patients who benefit. Many visitors find walking a labyrinth less stressful than sitting in a corridor or waiting room. Some doctors even walk the labyrinth during their breaks. In some hospitals, patients who can't walk can have a paper 'finger labyrinth' brought to their bed. The science behind the theory is a little sketchy, but there are dozens of small-scale studies which support claims about the benefits of labyrinths. For example, one study found that walking a labyrinth provided 'short-term calming, relaxation, and relief from anxiety' for Alzheimer's patients."],
    ]),
  },

  // ══════════════════════════ Cam 17 - Test 2 ══════════════════════════
  {
    testName: 'Cam 17 - Test 2', partNumber: 1,
    transcript: fmt('Voluntary work in Southoe village', [
      ['Jane', 'Hello, Jane Fairbanks speaking.'],
      ['Frank', "Oh, good morning. My name's Frank Pritchard. I've just retired and moved to Southoe. I'd like to become a volunteer, and I gather you co-ordinate voluntary work in the village."],
      ['Jane', "That's right."],
      ['Frank', 'What sort of thing could I do?'],
      ['Jane', "Well, we need help with the village library. We borrow books from the town library, and individuals also donate them. So, one thing you could do is get involved in collecting them – if you've got a car, that is."],
      ['Frank', "Yes, that's no problem."],
      ['Jane', "The times are pretty flexible so we can arrange it to suit you. Another thing is the records that we keep of the books we're given, and those we borrow and need to return to the town library. It would be very useful to have another person to help keep them up to date."],
      ['Frank', "Right. I'm used to working on a computer – I presume they're computerised?"],
      ['Jane', 'Oh yes.'],
      ['Frank', "Is the library purpose-built? I haven't noticed it when I've walked round the village."],
      ['Jane', "No, we simply have the use of a room in the village hall, the West Room. It's on the left as you go in."],
      ['Frank', 'I must go and have a look inside the hall.'],
      ['Jane', "Yes, it's a nice building."],
      ['Frank', 'Do you run a lunch club in the village for elderly people? I know a lot of places do.'],
      ['Jane', 'Yes, we have a very successful club.'],
      ['Frank', "I could help with transport, if that's of any use."],
      ['Jane', "Ooo definitely. People come to the club from neighbouring villages, and we're always in need of more drivers."],
      ['Frank', 'And does the club have groups that focus on a particular hobby, too? I could get involved in one or two, particularly if there are any art groups.'],
      ['Jane', "Excellent. I'll find out where we need help and get back to you."],
      ['Frank', 'Fine. What about help for individual residents. Do you arrange that at all?'],
      ['Jane', "Yes, we do it as a one-off. In fact, there's Mrs Carroll. She needs a lift to the hospital next week, and we're struggling to find someone."],
      ['Frank', "When's her appointment?"],
      ['Jane', 'On Tuesday. It would take the whole morning.'],
      ['Frank', 'I could do that.'],
      ['Jane', "Oh, that would be great. Thank you. And also, next week, we're arranging to have some work done to Mr Selsbury's house before he moves, as he isn't healthy enough to do it himself. We're got some people to decorate his kitchen, but if you could do some weeding in his garden, that would be wonderful."],
      ['Frank', "OK. I'd enjoy that. And presumably the day and time are flexible."],
      ['Jane', "Oh yes. Just say when would suit you best, and we'll let Mr Selsbury know."],
      ['Frank', 'Good.'],
      ['Jane', 'The volunteers group also organises monthly social events, which is a great way to meet other people, of course.'],
      ['Frank', 'Uhuh.'],
      ['Jane', "So next month, on the 19th of October, we're holding a quiz – a couple of residents are great at planning unusual ones, and we always fill the village hall."],
      ['Frank', 'That sounds like fun. Can I do anything to help?'],
      ['Jane', "Well, because of the summer of people, we need plenty of refreshments for halfway through. So, if you could provide any, we'd be grateful."],
      ['Frank', "I'm sure I could. I'll think about what to make, and let you know."],
      ['Jane', "Thank you. Then on November the 18th, we're holding a dance, also in the village hall. We've booked a band that specialises in music of the 1930s – they've been before, and we've had a lot of requests to bring them back."],
      ['Frank', "I'm not really a dancer, but I'd like to do something to help."],
      ['Jane', "Well, we sell tickets in advance, and having an extra person to check them at the door, as people arrive, would be good – it can be quite a bottleneck if everyone arrives at once!"],
      ['Frank', "OK, I'm happy with that."],
      ['Jane', "We're also arranging a New Year's Eve party. We're expecting that to be a really big event, so instead of the village hall, it'll be held in the Mountfort Hotel."],
      ['Frank', 'The …?'],
      ['Jane', "Mountfort. M-O-U-N-T-F-O-R-T Hotel. It isn't in Southoe itself, but it's only a couple of miles away. The hotel will be providing dinner and we've booked a band. The one thing we haven't got yet is a poster. That isn't something you could do, by any chance, is it?"],
      ['Frank', "Well actually, yes. Before I retired I was a graphic designer, so that's right up my street."],
      ['Jane', "Oh perfect! I'll give you the details, and then perhaps you could send me a draft …"],
      ['Frank', 'Of course.'],
    ]),
  },
  {
    testName: 'Cam 17 - Test 2', partNumber: 2,
    transcript: fmt('Oniton Hall', [
      [null, "Good morning, and welcome to Oniton Hall, one of the largest estates in the area. My name's Nick, and I'm one of the guides. I'll give you a brief introduction to the estate while you're sitting down, and then we'll walk round."],
      [null, "The estate consists of the house, gardens, parkland and farm, and it dates back to the fourteenth century. The original house was replaced in the late seventeenth century, and of course it has had a large number of owners. Almost all of them have left their mark, generally by adding new rooms, like the ballroom and conservatory, or by demolishing others. The farm looks much as it's always done, although the current owner has done a great deal of work to the flower beds."],
      [null, "In the seventeenth century, the estate was owned by a very wealthy man called Sir Edward Downes. His intention was to escape from the world of politics, after years as an active politician, and to build a new house worthy of his big collection of books, paintings and sculptures. He broke off contact with his former political allies, and hosted meeting of creative and literary people, like painters and poets. Unusually for his time, he didn't care whether his guests were rich or poor, as long as they had talent."],
      [null, "Big houses like Oniton had dozens of servants until the 1920s or 30s, and we've tried to show what their working lives were like. Photographs of course don't give much of an idea, so instead, as you go round the house, you'll see volunteers dressed up as nineteenth-century servants, going about their work. They'll explain what they're doing, and tell you their recipes, or what tools they're using. We've just introduced this feature to replace the audio guide we used to have available."],
      [null, "I see there are a number of children here with you today. Well, we have several activities specially for children, like dressing up in the sorts of clothes that children wore in the past, and as it's a fine day, some of you will probably want to play in the adventure playground. Our latest addition is child-sized tractors, that you can drive around the grounds."],
      [null, "We'll also be going into the farm that's part of the estate, where there's plenty to do. Most of the buildings date from the eighteenth century, so you can really step back into an agricultural past."],
      [null, "Until recently, the dairy was where milk from the cows was turned into cheese. It's now the place to go for lunch, or afternoon tea, or just a cup of coffee and a slice of homemade cake."],
      [null, "The big stone building that dominates the farm is the large barn, and in here is our collection of agricultural tools. These were used in the past to plough the earth, sow seeds, make gates, and much more."],
      [null, "There's a small barn, also made of stone, where you can groom the donkeys and horses, to keep their coats clean. They really seem to enjoy having it done, and children love grooming them."],
      [null, "The horses no longer live in the stables, which instead is the place to go to buy gifts, books, our own jams and pickles, and clothes and blankets made of wool from our sheep."],
      [null, "Outside the shed, which is the only brick building, you can climb into a horse-drawn carriage for a lovely, relaxing tour of the park and farm. The carriages are well over a hundred years old."],
      [null, "And finally, the parkland, which was laid out in the eighteenth century, with a lake and trees that are now well established. You'll see types of cattle and sheep that are hardly ever found on farms these days. We're helping to preserve them, to stop their numbers falling further."],
      [null, "OK, well if you'd like to come with me …"],
    ]),
  },
  {
    testName: 'Cam 17 - Test 2', partNumber: 3,
    transcript: fmt('Review of Romeo and Juliet', [
      ['Ed', "Did you make notes while you were watching the performances of Romeo and Juliet, Gemma?"],
      ['Gemma', 'Yes, I did. I found it quite hard though. I kept getting too involved in the play.'],
      ['Ed', "Me too. I ended up not taking notes. I wrote down my impressions when I got home. Do you mind if I check a few things with you? In case I've missed anything. And I've also got some questions about our assignment."],
      ['Gemma', "No, it's good to talk things through. I may have missed things too."],
      ['Ed', "OK great. So first of all, I'm not sure how much information we should include in our reviews."],
      ['Gemma', "Right. Well, I don't think we need to describe what happens. Especially as Romeo and Juliet is one of Shakespeare's most well-known plays."],
      ['Ed', "Yeah, everyone knows the story. In an essay we'd focus on the poetry and Shakespeare's use of imagery etc., but that isn't really relevant in a review. We're supposed to focus on how effective this particular production is."],
      ['Gemma', 'Mmm. We should say what made it a success or a failure.'],
      ['Ed', "And part of that means talking about the emotional impact the performance had on us. I think that's important."],
      ['Gemma', "Yes. And we should definitely mention how well the director handled important bits of the play – like when Romeo climbs onto Juliet's balcony."],
      ['Ed', 'And the fight between Mercutio and Tybalt.'],
      ['Gemma', "Yes. It would also be interesting to mention the theatre space and how the director used it but I don't think we'll have space in 800 words."],
      ['Ed', 'No. OK. That all sounds quite straightforward.'],
      ['Ed', "So what about The Emporium Theatre's production of the play?"],
      ['Gemma', 'I thought some things worked really well but there were some problems too.'],
      ['Ed', 'Yeah. What about the set, for example?'],
      ['Gemma', "I think it was visually really stunning. I'd say that was probably the most memorable thing about this production."],
      ['Ed', "You're right. The set design was really amazing, but actually I have seen similar ideas used in other productions."],
      ['Gemma', 'What about the lighting? Some of the scenes were so dimly lit it was quite hard to see.'],
      ['Ed', "I didn't dislike it. It helped to change the mood of the quieter scenes."],
      ['Gemma', "That's a good point."],
      ['Ed', 'What did you think of the costumes?'],
      ['Gemma', 'I was a bit surprised by the contemporary dress, I must say.'],
      ['Ed', "Yeah – I think it worked well, but I had assumed it would be more conventional."],
      ['Gemma', "Me too. I liked the music at the beginning and I thought the musicians were brilliant, but I thought they were wasted because the music didn't have much impact in Acts 2 and 3."],
      ['Ed', "Yes – that was a shame."],
      ['Gemma', "One problem with this production was that the actors didn't deliver the lines that well. They were speaking too fast."],
      ['Ed', "It was a problem I agree, but I thought it was because they weren't speaking loudly enough – especially at key points in the play."],
      ['Gemma', "I actually didn't have a problem with that."],
      ['Ed', "It's been an interesting experience watching different versions of Romeo and Juliet, hasn't it?"],
      ['Gemma', "Definitely. It's made me realise how relevant the play still is."],
      ['Ed', "Right. I mean a lot's changed since Shakespeare's time, but in many ways nothing's changed. There are always disagreements and tension between teenagers and their parents."],
      ['Gemma', "Yes, that's something all young people can relate to – more than the violence and the extreme emotions in the play."],
      ['Ed', 'How did you find watching it in translation?'],
      ['Gemma', "Really interesting. I expected to find it more challenging, but I could follow the story pretty well."],
      ['Ed', "I stopped worrying about not being able to understand all the words and focused on the actors' expressions. The ending was pretty powerful."],
      ['Gemma', 'Yes. That somehow intensified the emotion for me.'],
      ['Ed', "Did you know Shakespeare's been translated into more languages than any other writer?"],
      ['Gemma', "What's the reason for his international appeal, do you think?"],
      ['Ed', "I was reading that it's because his plays are about basic themes that people everywhere are familiar with."],
      ['Gemma', 'Yeah, and they can also be understood on different levels. The characters have such depth.'],
      ['Ed', 'Right – which allows directors to experiment and find new angles.'],
      ['Gemma', "That's really important because …"],
    ]),
  },
  {
    testName: 'Cam 17 - Test 2', partNumber: 4,
    transcript: fmt('The impact of digital technology on the Icelandic language', [
      [null, "Right, everyone, let's make a start. Over the past few sessions, we've been considering the reasons why some world languages are in decline, and today I'm going to introduce another factor that affects languages, and the speakers of those languages, and that's technology and, in particular, digital technology. In order to illustrate its effect, I'm going to focus on the Icelandic language, which is spoken by around 321,000 people, most of whom live in Iceland – an island in the North Atlantic Ocean."],
      [null, "The problem for this language is not the number of speakers – even though this number is small. Nor is it about losing words to other languages, such as English. In fact, the vocabulary of Icelandic is continually increasing because when speakers need a new word for something, they tend to create one, rather than borrowing from another language. All this makes Icelandic quite a special language – it's changed very little in the past millennium, yet it can handle twenty-first-century concepts related to the use of computers and digital technology. Take, for example, the word for web browser … this is vafri in Icelandic, which comes from the verb 'to wander'. I can't think of a more appropriate term because that's exactly what you do mentally when you browse the internet. Then there's an Icelandic word for podcast – which is too hard to pronounce! And so on."],
      [null, "Icelandic, then, is alive and growing, but – and it's a big but – young Icelanders spend a great deal of time in the digital world and this world is predominantly English. Think about smartphones. They didn't even exist until comparatively recently, but today young people use them all the time to read books, watch TV or films, play games, listen to music, and so on. Obviously, this is a good thing in many respects because it promotes their bilingual skills, but the extent of the influence of English in the virtual world is staggering and it's all happening really fast."],
      [null, "For their parents and grandparents, the change is less concerning because they already have their native-speaker skills in Icelandic. But for young speakers – well, the outcome is a little troubling. For example, teachers have found that playground conversations in Icelandic secondary schools can be conducted entirely in English, while teachers of much younger children have reported situations where their classes find it easier to say what is in a picture using English, rather than Icelandic. The very real and worrying consequence of all this is that the young generation in Iceland is at risk of losing its mother tongue."],
      [null, "Of course, this is happening to other European languages too, but while internet companies might be willing to offer, say, French options in their systems, it's much harder for them to justify the expense of doing the same for a language that has a population the size of a French town, such as Nice. The other drawback of Icelandic is the grammar, which is significantly more complex than in most languages. At the moment, the tech giants are simply not interested in tackling this."],
      [null, "So, what is the Icelandic government doing about this? Well, large sums of money are being allocated to a language technology fund that it is hoped will lead to the development of Icelandic sourced apps and other social media and digital systems, but clearly this is going to be an uphill struggle."],
      [null, "On the positive side, they know that Icelandic is still the official language of education and government. It has survived for well over a thousand years and the experts predict that its future in this nation state is sound and will continue to be so. However, there's no doubt that it's becoming an inevitable second choice in young people's lives."],
      [null, "This raises important questions. When you consider how much of the past is tied up in a language, will young Icelanders lose their sense of their own identity? Another issue that concerns the government of Iceland is this. If children are learning two languages through different routes, neither of which they are fully fluent in, will they be able to express themselves properly?"],
    ]),
  },

  // ══════════════════════════ Cam 17 - Test 3 ══════════════════════════
  {
    testName: 'Cam 17 - Test 3', partNumber: 1,
    transcript: fmt('Advice on surfing holidays', [
      ['Woman', "Jack, I'm thinking of taking the kids to the seaside on a surfing holiday this summer and I wanted to ask your advice – as I know you're such an expert."],
      ['Jack', "Well, I don't know about that, but yes, I've done a bit of surfing over the years. I'd thoroughly recommend it. I think it's the kind of holiday all the family can enjoy together. The thing about surfing is that it's great for all ages and all abilities. My youngest started when he was only three!"],
      ['Woman', "Wow! But it's quite physically demanding, isn't it? I've heard you need to be pretty fit."],
      ['Jack', "Yes. You'll certainly learn more quickly and won't tire as easily."],
      ['Woman', "Well – that should be OK for us. You've been surfing a few times in Ireland, haven't you?"],
      ['Jack', "Yes. There's some great surfing there, which people don't always realise."],
      ['Woman', "And which locations would you recommend? – there seem to be quite a few."],
      ['Jack', 'Yes, there are loads. Last year we went to County Donegal. There are several great places to surf there.'],
      ['Woman', "What about in County Clare? I read that's also really good for surfing."],
      ['Jack', "Yes, it is. I've been there a few times. Most people go to Lahinch. My kids love it there. The waves aren't too challenging and the town is very lively."],
      ['Woman', 'Are there good hotels there?'],
      ['Jack', "Yes – some very nice ones and there are also a few basic hostels and campsites. It's great if you need lessons as the surf schools are excellent."],
      ['Woman', 'Sounds good.'],
      ['Jack', "Yes and there's lots to see in the area – like those well-known cliffs – … I've forgotten the name of them …"],
      ['Woman', 'Oh don\'t worry – I can look them up.'],
      ['Jack', "I've also been surfing in County Mayo, which is less well-known for surfing, but we had a really good time. That was a few years ago when the kids were younger. There's a good surf school at Carrowniskey beach."],
      ['Woman', 'How do you spell that?'],
      ['Jack', 'C-A-double R-O-W-N-I-S-K-E-Y'],
      ['Woman', 'OK.'],
      ['Jack', 'I put the kids into the surf camp they run during the summer for 10-16 year olds.'],
      ['Woman', 'Oh right. How long was that for?'],
      ['Jack', "Three hours every day for a week. It was perfect – they were so tired out after that."],
      ['Woman', 'I can imagine.'],
      ['Jack', "One thing we did while the kids were surfing was to rent some kayaks to have a look around the bay which is nearby. It's really beautiful."],
      ['Woman', "Oh, I'd love to do that."],
      ['Woman', 'Now the only time I went to Ireland it rained practically every day.'],
      ['Jack', "Mmm yes – that can be a problem – but you can surf in the rain, you know."],
      ['Woman', "It doesn't have the same appeal, somehow."],
      ['Jack', "Well, the weather's been fine the last couple of years when I've been there, but actually, it tends to rain more in August than in the spring or autumn. September's my favourite month because the water is warmer then."],
      ['Woman', 'The only problem is that the kids are back to school then.'],
      ['Jack', "I know. But one good thing about Irish summers is that it doesn't get too hot. The average temperature is about 19 degrees and it usually doesn't go above 25 degrees."],
      ['Woman', 'That sounds alright. Now what about costs?'],
      ['Jack', "Surfing is a pretty cheap holiday really – the only cost is the hire of equipment. You can expect to pay a daily rate of about 30 euros for the hire of a wetsuit and board – but you can save about 40 euros if you hire by the week."],
      ['Woman', "That's not too bad."],
      ['Jack', "No. It's important to make sure you get good quality wetsuits – you'll all get too cold if you don't. And make sure you also get boots. They keep your feet warm and it's easier to surf with them on too."],
      ['Woman', 'OK. Well, thanks very much …'],
    ]),
  },
  {
    testName: 'Cam 17 - Test 3', partNumber: 2,
    transcript: fmt("School's extended hours childcare service", [
      [null, "Good afternoon. My name's Mrs Carter and I run the before and after school extended hours childcare service. I hope you've had a chance to have a good look around the school and talk to staff and pupils. I know that many of you are interested in using our childcare service when your child joins the school, and perhaps you already know something about it, but for those that don't, I'll go through the main details now."],
      [null, "We offer childcare for children from the ages of four to eleven both before and after school. I know that many parents who work find this service invaluable. You can leave your child with us safe in the knowledge that they will be extremely well cared for."],
      [null, "We are insured to provide care for up to 70 children, although we rarely have this many attending at any one session. I think we generally expect around 50-60 children for the afternoon sessions and about half that number for the breakfast sessions. Although we currently do have 70 children registered with us, not all of these attend every day. It's ten years since we began offering an extended hours service and we've come a long way during that time. When we first opened, we only had about 20 children attending regularly."],
      [null, "We try to keep our costs as low as we can and we think we provide very good value for money. For the afternoon sessions, which run from 3.30 until 6 p.m., it's £7.20. But if you prefer, you can pay for one hour only, which costs £3.50, or two hours which costs £5.70."],
      [null, "The cost of the childcare includes food and snacks. They'll be given breakfast in the morning and in the afternoon, a healthy snack as soon as they finish school. At 5 p.m. children are given something more substantial, such as pasta or a casserole. Please inform us of any allergies that your child might have and we'll make sure they're offered a suitable alternative."],
      [null, "As you may know, the childcare service runs through the school holidays from 8 a.m. to 6 p.m. We offer a really varied and exciting programme to keep the children entertained – we don't want them to feel as if they are still at school! It will also feel different because they'll get the chance to make new friends with children from other schools – spaces are available for them because a lot of our term-time children don't always attend during the holiday. In the past, parents have asked if children over the age of 11 are allowed to come with their younger brothers and sisters – but I'm afraid we're unable to do this because of the type of insurance we have."],
      [null, "So now let me tell you about some of the activities that your child can do during the after-school sessions. As well as being able to use the playground equipment, computers and the library, there is usually at least one 'special' activity that children can do each day. For example, Spanish. We have a specialist teacher coming in every Thursday to give a basic introduction to the language through games and songs. She does two sessions: one for the over 8s and one for the younger children. This is the only activity which we have to make an extra charge for – but it's well worth it."],
      [null, "Once a week the children have the opportunity to do some music. We're very lucky that one of our staff is a member of a folk band. On Mondays, she teaches singing and percussion to groups of children. We do rely on parental support for this, so if any of you sing or play an instrument and would be prepared to help out at these sessions, we'd be delighted."],
      [null, "Painting continues to be one of the most popular activities. To begin with we weren't keen on offering this because of the extra mess involved, but children kept asking if they could do some art and so we finally gave in. Art is great for helping the children to relax after working hard at school all day."],
      [null, "Yoga is something that we've been meaning to introduce for some time but haven't been able to find anyone available to teach it – until now that is. So we'll see how this goes. Hopefully, children will benefit in all sorts of ways from this."],
      [null, "Cooking is another popular activity. They make a different sort of cake, or pizza or bread each week. Although the younger children love doing it, we found that the mess was just too much, so we've decided to restrict this to the over 8s, as they are better able to clean up after themselves."],
    ]),
  },
  {
    testName: 'Cam 17 - Test 3', partNumber: 3,
    transcript: fmt("Holly's Work Placement Tutorial", [
      ['Holly', "Hello Dr Green – I'm here to talk to you about my work placement."],
      ['Tutor', "Oh yes, it's Holly, isn't it?"],
      ['Holly', 'Yes.'],
      ['Tutor', 'So, which work placement have you chosen?'],
      ['Holly', "I decided to go for the Orion Stadium placement. The event I'll be managing is one where I'm helping to set up a sports competition for primary school children."],
      ['Tutor', "Yup. That's always a popular placement – even though it can be tougher than you think working with children."],
      ['Holly', "I know, but it's the fresh air that attracts me – organising something indoors doesn't have the same appeal, even though it might be fun."],
      ['Tutor', "OK, so obviously safety's going to be one of your key concerns for this event."],
      ['Holly', "Yes, I've already thought about that. I'll need to make sure none of the equipment's damaged."],
      ['Tutor', "Ah well, you'll be working with schools, so the equipment will be their responsibility. However, the grounds and what goes on there will be yours."],
      ['Holly', "Oh I see – that'll include keeping everyone within the boundary once they're in their kit and on the field?"],
      ['Tutor', "Exactly – you'll need to inspect areas like changing rooms as well for anything someone can trip over, but your main priority will be not to lose anyone!"],
      ['Holly', "Right. I'll need staff to help with that."],
      ['Tutor', "And don't forget about the spectators."],
      ['Holly', "Mmm. I was thinking that many of them will be parents, who could help run the event."],
      ['Tutor', "I wouldn't rely on that. They'll be more interested in filming their children than volunteering."],
      ['Holly', "I'll need to make sure they don't interfere with events doing that!"],
      ['Tutor', "And that's not always easy, especially when a proud parent's trying to get a snap of their child and you want them to move elsewhere."],
      ['Holly', "OK. What about the scheduling?"],
      ['Tutor', "With sporting events there are all sorts of things that can alter the timetable – like rain, for instance – though so far, we've always been lucky with that."],
      ['Holly', "Yeah, and I was thinking about what to do if someone got hurt as well. I know that last year that caused a terrible delay."],
      ['Tutor', 'You have to be prepared for such things.'],
      ['Holly', "Oh. What if a match ends in a draw – do you let the teams keep going until someone wins?"],
      ['Tutor', "That'll be up to you – and again, you need to plan for it."],
      ['Holly', 'Right.'],
      ['Tutor', "Now, the aim of your work placement is to give you the opportunity to develop the skills that an events manager needs. So, let's talk about those a bit."],
      ['Holly', "Well, I think my communication skills are pretty good. I can talk on the phone to people and book venues and that kind of thing."],
      ['Tutor', "Good – just remember it isn't only about what you say. If you meet someone face-to-face and want to persuade them to be a sponsor, for example …"],
      ['Holly', "Oh, I'll dress up for that! Sure."],
      ['Tutor', "Good. Let's go on to think about your organisational skills. You're working in a very people-based industry and that means things won't always go to plan."],
      ['Holly', "I guess it's being prepared to make changes that matters."],
      ['Tutor', "That's right. You may have to make an on-the-spot change to a timetable because of a problem you hadn't anticipated …"],
      ['Holly', '… just do it! OK'],
      ['Tutor', "How's your time management these days?"],
      ['Holly', "I'm working on it – I'm certainly better when I have a deadline, which is why this work suits me."],
      ['Tutor', "Yes, but it's how you respond as that deadline approaches!"],
      ['Holly', "I know I've got to look calm even if I'm in a panic."],
      ['Tutor', "Just think to yourself – no one must know I'm under pressure."],
      ['Holly', "Yeah – even though I'm multi-tasking like crazy!"],
      ['Tutor', "Another skill that events managers need is creativity. Often your client has what we call the 'big picture' idea, but it's up to the events manager to think of all the fine points that go to making it work."],
      ['Holly', "Right, so I need to listen carefully to that idea and then fill in all the gaps."],
      ['Tutor', "That's right. And you'll have a team working under you, so another key skill is leadership. Your team may have lots of ideas too, but you've got to make the ultimate choices. Do we have refreshments inside or out, for example?"],
      ['Holly', "Isn't it better to be democratic?"],
      ['Tutor', "It's a nice idea, but you have the ultimate responsibility. So, believe in what you think best. Be prepared to say 'yes', that's a good idea but it won't work here."],
      ['Holly', "I see what you mean. What about the networking side of things? I know it's an area that a lot of students worry about because we don't have much experience to offer others."],
      ['Tutor', "But even without it – you can still be an interesting person with useful ideas. And the more people you impress, the better."],
      ['Holly', "I guess that will help me when I apply for a real job."],
      ['Tutor', "Exactly – think ahead – remember what your ambitions are and keep them in mind."],
      ['Holly', 'Definitely.'],
    ]),
  },
  {
    testName: 'Cam 17 - Test 3', partNumber: 4,
    transcript: fmt('Bird Migration Theory', [
      [null, "Scientists believe that a majority of the earth's bird population migrate in some fashion or other. Some travel seasonally for relatively short distances, such as birds that move from their winter habitats in lowlands to mountain tops for the summers. Others, like the Arctic Tern, travel more than 25,000 miles seasonally between the northern and southern poles. Bird migration has been studied over many centuries through a variety of observations."],
      [null, "But until relatively recently, where birds went to in the winter was considered something of a mystery. The lack of modern science and technology led to many theories that we now recognize as error-filled and even somewhat amusing. Take hibernation theory for example – two thousand years ago, it was commonly believed that when birds left an area, they went underwater to hibernate in the seas and oceans. Another theory for the regular appearance and disappearance of birds was that they spend winter hidden in mud till the weather changed and food became abundant again. The theory that some birds hibernate persisted until experiments were done on caged birds in the 1940s which demonstrated that birds have no hibernation instinct."],
      [null, "One of the earliest naturalists and philosophers from ancient Greece was Aristotle who was the first writer to discuss the disappearance and reappearance of some bird species at certain times of year. He developed the theory of transmutation, the seasonal change of one species into another, by observing redstarts and robins. He observed that in the autumn, small birds called 'redstarts' began to lose their feathers, which convinced Aristotle that they changed into robins for the winter, and back into redstarts in the summer. These assumptions are understandable given that this pair of species are similar in shape, but are a classic example of an incorrect interpretation based on correct observations."],
      [null, "The most bizarre theory was put forward by an English amateur scientist, Charles Morton, in the seventeenth century. He wrote a surprisingly well-regarded paper claiming that birds migrate to the moon and back every year. He came to this conclusion as the only logical explanation for the total disappearance of some species."],
      [null, "One of the key moments in the development of migration theory came in 1822 when a white stork was shot in Germany. This particular stork made history because of the long spear in its neck which incredibly had not killed it – everyone immediately realised this spear was definitely not European. It turned out to be a spear from a tribe in Central Africa. This was a truly defining moment in the history of ornithology because it was the first evidence that storks spend their winters in sub-Saharan Africa. You can still see the 'arrow stork' in the Zoological Collection of the University of Rostock in Germany."],
      [null, "People gradually became aware that European birds moved south in autumn and north in summer but didn't know much about it until the practice of catching birds and putting rings on their legs became established. Before this, very little information was available about the actual destinations of particular species and how they travelled there. People speculated that larger birds provided a kind of taxi service for smaller birds by carrying them on their backs. This idea came about because it seemed impossible that small birds weighing only a few grams could fly over vast oceans. This idea was supported by observations of bird behaviour such as the harassment of larger birds by smaller birds."],
      [null, "The development of bird ringing, by a Danish schoolteacher, Hans Christian Cornelius Mortensen, made many discoveries possible. This is still common practice today and relies upon what is known as 'recovery' – this is when ringed birds are found dead in the place they have migrated to, and identified. Huge amounts of data were gathered in the early part of the twentieth century and for the first time in history people understood where birds actually went to in winter. In 1931, an atlas was published showing where the most common species of European birds migrated to. More recent theories about bird migration …"],
    ]),
  },

  // ══════════════════════════ Cam 17 - Test 4 ══════════════════════════
  {
    testName: 'Cam 17 - Test 4', partNumber: 1,
    transcript: fmt('Easy Life Cleaning Services', [
      ['Jacinta', 'Hello, Easy Life Cleaning Services, Jacinta speaking.'],
      ['Client', "Oh hello. I'm looking for a cleaning service for my apartment – do you do domestic cleaning?"],
      ['Jacinta', 'Sure.'],
      ['Client', "Well, it's just a one-bedroom flat. Do you have a basic cleaning package?"],
      ['Jacinta', "Yes. For a one-bedroom flat we're probably looking at about two hours for a clean. So we'd do a thorough clean of all surfaces in each room, and polish them where necessary. Does your apartment have carpets?"],
      ['Client', "No, I don't have any, but the floor would need cleaning."],
      ['Jacinta', "Of course – we'd do that in every room. And we'd do a thorough clean of the kitchen and bathroom."],
      ['Client', 'OK.'],
      ['Jacinta', 'Then we have some additional services which you can request if you want – so for example, we can clean your oven for you every week.'],
      ['Client', "Actually, I hardly ever use that, but can you do the fridge?"],
      ['Jacinta', 'Sure. Would you like that done every week?'],
      ['Client', 'Yes, definitely. And would ironing clothes be an additional service you can do?'],
      ['Jacinta', 'Yes, of course.'],
      ['Client', "It wouldn't be much, just my shirts for work that week."],
      ['Jacinta', "That's fine. And we could also clean your microwave if you want."],
      ['Client', "No, I wipe that out pretty regularly so there's no need for that."],
      ['Jacinta', "We also offer additional services that you might want a bit less often, say every month. So for example, if the inside of your windows need cleaning, we could do that."],
      ['Client', "Yes, that'd be good. I'm on the fifteenth floor, so the outside gets done regularly by specialists, but the inside does get a bit grubby."],
      ['Jacinta', 'And we could arrange for your curtains to get cleaned if necessary.'],
      ['Client', "No, they're OK. But would you be able to do something about the balcony? It's quite small and I don't use it much, but it could do with a wash every month or so."],
      ['Jacinta', 'Yes, we can get the pressure washer onto that.'],
      ['Jacinta', "Now if you're interested, we do offer some other possibilities to do with general maintenance. For example, if you have a problem with water and you need a plumber in a hurry, we can put you in touch with a reliable one who can come out straightaway. And the same thing if you need an electrician."],
      ['Client', "Right. That's good to know. I've only just moved here so I don't have any of those sorts of contacts."],
      ['Jacinta', "And I don't know if this is of interest to you, but we also offer a special vacuum cleaning system which can improve the indoor air quality of your home by capturing up to 99% of all the dust in the air. So if you're troubled by allergies, this can make a big difference."],
      ['Client', "Right. In fact, I don't have that sort of problem, but I'll bear it in mind. Now can you tell me a bit about your cleaning staff?"],
      ['Jacinta', "Of course. So all our cleaners are very carefully selected. When they apply to us, they have to undergo a security check with the police to make sure they don't have any sort of criminal background, and, of course, they have to provide references as well. Then if we think they might be suitable for the job, we give them training for it. That lasts for two weeks so it's very thorough, and at the end of it, they have a test. If they pass that, we take them on, but we monitor them very carefully – we ask all our clients to complete a review of their performance after every visit and to email it to us. So we can pick up any problems straightaway and deal with them."],
      ['Client', 'OK, well that all sounds good. And will I always have the same cleaner?'],
      ['Jacinta', "Yes, we do our best to organise it that way, and we usually manage it."],
      ['Client', "Good. That's fine. Right, so I'd like to go ahead and …"],
    ]),
  },
  {
    testName: 'Cam 17 - Test 4', partNumber: 2,
    transcript: fmt('Reducing hotel staff turnover', [
      [null, "As many of you here today have worked in the hotel industry for some time, I'm sure you have experienced the problem of high staff turnover in your hotels. Every hotel relies on having loyal and experienced members of staff who make sure that everything runs smoothly. If staff are constantly changing, it can make life difficult for everyone. But why do staff leave frequently in many hotels? Of course, many hotel jobs, such as cleaning, are low-skilled and are not well-paid. A lot of managers think it's this and the long hours that are the main causes of high staff turnover – but what they don't realise is that it's the lack of training in many hotel jobs which is a huge factor."],
      [null, "So, what kind of problems does a high turnover of staff cause? Well, having to recruit new staff all the time can be very time-consuming, and managers may have to cover some duties while waiting for new staff to arrive. This means they don't have time to think about less immediate problems such as how to improve their service. When staff leave, it can also severely affect the colleagues they leave behind. It has a negative effect on remaining staff, who may start to feel that they too should be thinking about leaving."],
      [null, "So, what can be done to change this situation? Firstly, managers should stop making basic errors which leave their staff feeling upset and resentful. When organising shifts, for example, make sure you never give certain staff preferential treatment. All staff should be given some choice about when they work, and everyone should have to work some evening and weekend shifts. If you treat staff fairly, they'll be more likely to step in and help when extra staff are needed."],
      [null, "Keeping staff happy has other tangible benefits for the business. Take the Dunwich Hotel as an example. It had been experiencing a problem with staff complaints and in order to deal with this, invested in staff training and improved staff conditions. Not only did the level of complaints fall, but they also noticed a significant increase in the amount each customer spent during their stay. They have now introduced a customer loyalty scheme which is going really well."],
      [null, "Now I'd like to look at some ways you can reduce staff turnover in your hotels, and I'll do this by giving some examples of hotels where I've done some training recently."],
      [null, "The Sun Club received feedback which showed that staff thought managers didn't value their opinions. They weren't made to feel they were partners who were contributing to the success of the business as a whole. This situation has changed. Junior staff at all levels are regularly invited to meetings where their ideas are welcomed."],
      [null, "A year ago, The Portland recognised the need to invest in staff retention. Their first step was to introduce a scheme for recognising talent amongst their employees. The hope is that organising training for individuals with management potential will encourage them to stay with the business."],
      [null, "At Bluewater, managers decided to recognise 50 high achievers from across the company's huge hotel chain. As a reward, they're sent on an all-expenses-paid trip abroad every year. Fun is an important element in the trips, but there's also the opportunity to learn something useful. This year's trip included a visit to a brewery, where staff learned about the new beer that would be served in the hotel."],
      [null, "Pentlow Hotels identified that retention of junior reception staff was an issue. In order to encourage them to see that working in a hotel could be worthwhile and rewarding, with good prospects, they introduced a management programme. These staff were given additional responsibilities and the chance to work in various roles in the hotel."],
      [null, "Green Planet wanted to be seen as a caring employer. To make life easier for staff, many of whom had childcare responsibilities, the hotel began issuing vouchers to help cover the cost of childcare."],
      [null, "Louise Marsh at The Amesbury has one of the best staff retention rates in the business. Since she joined the company, she has made a huge effort to achieve this by creating a co-operative and supportive environment. For her, the staff are part of a large family where everyone is valued."],
      [null, 'Ok, now I\'d like to …'],
    ]),
  },
  {
    testName: 'Cam 17 - Test 4', partNumber: 3,
    transcript: fmt('Development of sporting equipment', [
      ['Jeanne', 'Hi Thomas, how are you enjoying the course so far?'],
      ['Thomas', 'Yeah, I think it\'s good.'],
      ['Jeanne', "Remind me – why did you decide to study sports science? Didn't you want to be a professional athlete when you were at school?"],
      ['Thomas', "Yeah – that was my goal, and all my classmates assumed I would achieve it; they thought I was brilliant."],
      ['Jeanne', 'That must have been a nice feeling.'],
      ['Thomas', 'Mm, I thought I could win anything. There was no one who could run faster than me.'],
      ['Jeanne', "Exactly – so what happened? Did your mum and dad want you to be more 'academic'?"],
      ['Thomas', 'Not at all. Perhaps they should have pushed me harder, though.'],
      ['Jeanne', 'What do you mean?'],
      ['Thomas', 'I think I should have practised more.'],
      ['Jeanne', 'What makes you say that?'],
      ['Thomas', 'Well, I went out to Kenya for a couple of weeks to train …'],
      ['Jeanne', "Really! I didn't know that."],
      ['Thomas', "I was chosen to go there out of loads of kids and run with some of the top teenage athletes in the world. And … I was so calm about it. I just kept thinking how fortunate I was. What a great chance this was! Everyone back home was so proud of me. But once we started competing, I very quickly realised I wasn't good enough."],
      ['Jeanne', 'That must have been a huge shock.'],
      ['Thomas', "I thought 'this can't be happening'! I was used to winning."],
      ['Jeanne', "I'm sorry to hear that."],
      ['Thomas', "It's OK. I'm over it now and I think it's much better to do a university course and this one has such a variety of sports-related areas. It's going to be good."],
      ['Jeanne', 'Oh, I agree – I chose it because of that.'],
      ['Thomas', "So Jeanne – have you thought of any ideas for the discussion session next week on technology and sport?"],
      ['Jeanne', "We have to cover more than one sport, don't we?"],
      ['Thomas', 'Yeah.'],
      ['Jeanne', "You know – we always think technology is about the future, but we could gather some ideas about past developments in sport."],
      ['Thomas', "Look at early types of equipment perhaps? Uh, I remember reading something about table tennis bats once – how they ended up being covered with pimpled rubber."],
      ['Jeanne', "Cos they were just wooden at first, I'd imagine."],
      ['Thomas', "Yeah. In about the 1920s, a factory was making rolls of the rubber in bulk for something like horse harnesses."],
      ['Jeanne', 'Really!'],
      ['Thomas', "Yeah – and someone realised that it'd make a perfect covering for the wooden bats."],
      ['Jeanne', "So what about cricket – that's had a few innovative changes. Maybe the pads they were on their legs?"],
      ['Thomas', "I don't think they've changed much but, I'm just looking on the internet … and it says that when the first cricket helmet came in, in 1978, the Australian batsman who first wore it was booed and jeered by people watching because it was so ugly!"],
      ['Jeanne', 'Wow, players have to protect themselves from getting hurt! I mean everyone wears one now.'],
      ['Thomas', 'Mm, unlike the cycle helmet.'],
      ['Jeanne', "Well, unless you're a professional, but you're right, many ordinary bikers don't wear a helmet."],
      ['Thomas', "Hey, look at these pictures of original helmet designs. This one looks like an upside-down bowl!"],
      ['Jeanne', "Yet, the woman's laughing – she's so proud to be wearing it!"],
      ['Thomas', "It says serious cyclists ended up with wet hair from all the hard exercise."],
      ['Jeanne', "I guess that's why they have large air vents in them now so that the skin can breathe more easily."],
      ['Thomas', "OK, so we've done helmets. What about golf balls or better still golf clubs – they've changed a lot."],
      ['Jeanne', "Yeah – I remember my great grandfather telling me that because a club was made entirely of wood, it would easily break and players had to get another."],
      ['Thomas', "There's no wood at all in them now, is there?"],
      ['Jeanne', "No – they're much more powerful."],
      ['Thomas', 'The same must be true of hockey sticks.'],
      ['Jeanne', "I don't think so because players still use wooden sticks today. What it does say here, though, is that when the game started you had to produce a stick yourself."],
      ['Thomas', "I guess they just weren't being manufactured. So, one more perhaps. What about football?"],
      ['Jeanne', 'Well, I know the first balls were made of animal skin.'],
      ['Thomas', "Yeah, they covered them with pieces of leather that were stitched together, but … the balls let in water when it rained."],
      ['Jeanne', 'Oh, that would have made them much heavier.'],
      ['Thomas', "That's right. You can imagine the damage to player's necks when the ball was headed."],
      ['Jeanne', 'How painful that must have been!'],
      ['Thomas', "Yeah, well, I think we can put together some useful ideas …"],
    ]),
  },
  {
    testName: 'Cam 17 - Test 4', partNumber: 4,
    transcript: fmt('Maple syrup', [
      [null, "Hello everyone. Today we're going to look at another natural food product and that's maple syrup. What is this exactly? Well, maple syrup looks rather like clear honey, but it's not made by bees; it's produced from the plant fluid – or sap – inside the maple tree and that makes maple syrup a very natural product. Maple syrup is a thick, golden, sweet-tasting liquid that can be bought in bottles or jars and poured onto food such as waffles and ice cream or used in the baking of cakes and pastries. It contains no preservatives or added ingredients, and it provides a healthy alternative to refined sugar."],
      [null, "Let's just talk a bit about the maple tree itself, which is where maple syrup comes from. So, there are many species of maple tree, and they'll grow without fertilizer in areas where there's plenty of moisture in the soil. However, they'll only do this if another important criterion is fulfilled, which is that they must have full or partial sun exposure during the day and very cool nights – and I'll talk more about that in a minute. There are only certain parts of the world that provide all these conditions: one is Canada, and by that, I mean all parts of Canada, and the other is the north-eastern states of North America. In these areas, the climate suits the trees perfectly. In fact, Canada produces over two-thirds of the world's maple syrup, which is why the five-pointed maple leaf is a Canadian symbol and has features on the flag since 1964."],
      [null, "So how did maple syrup production begin? Well, long before Europeans settled in these parts of the world, the indigenous communities had started producing maple sugar. They bored holes in the trunks of maple trees and used containers made of tree bark to collect the liquid sap as it poured out. As they were unable to keep the liquid for any length of time – they didn't have storage facilities in those days – they boiled the liquid by placing pieces of rock that had become scorching hot from the sun into the sap. They did this until it turned into sugar, and they were then able to use this to sweeten their food and drinks. Since that time, improvements have been made to the process, but it has changed very little overall."],
      [null, "So let's look at the production of maple syrup today. Clearly, the maple forests are a valuable resource in many Canadian and North American communities. The trees have to be well looked after and they cannot be used to make syrup until the trunks reach a diameter of around 25 centimetres. This can take anything up to 40 years. As I've already mentioned, maple trees need the right conditions to grow and also to produce sap. Why is this? Well, what happens is that during a cold night, the tree absorbs water from the soil, and that rises through the tree's vascular system. But then in the warmer daytime, the change in temperature causes the water to be pushed back down to the bottom of the tree. This continual movement – up and down – leads to the formation of the sap needed for maple syrup production."],
      [null, "When the tree is ready, it can be tapped and this involves drilling a small hole into the trunk and inserting a tube into it that ends in a bucket. The trees can often take several taps, though the workers take care not to cause any damage to the healthy growth of the tree itself. The sap that comes out of the trees consists of 98 percent water and 2 percent sugar and other nutrients. It has to be boiled so that much of that water evaporates, and this process has to take place immediately, using what are called evaporators. These are basically extremely large pans – the sap is poured into these, a fire is built and the pans are then heated until the sap boils. As it does this, the water evaporates, and the syrup begins to form. The evaporation process creates large quantities of steam, and the sap becomes thicker and denser, and, at just the right moment, when the sap is thick enough to be called maple syrup, the worker removes it from the heat. After this process, something called 'sugar sand' has to be filtered out as this builds up during the boiling and gives the syrup a cloudy appearance and a slightly gritty taste. Once this has been done, the syrup is ready to be packaged so that it can be used for a whole variety of products. It takes 40 litres of sap to produce one litre of maple syrup so you can get an idea of how much is needed!"],
      [null, "So that's the basic process. In places like Quebec where …"],
    ]),
  },
];

async function runSeedCam17() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS_Cam17) {
    const { testName, partNumber, transcript } = target;
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscriptsCam17] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscriptsCam17] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS_Cam17.length} targets).`);
}


async function runSeed() {
  await runSeedTest();
  await runSeedSections();
  await runSeedTranscripts();
  await runSeedCam15();
  await runSeedCam16();
  await runSeedCam17();
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningContent] FAILED', e); process.exit(1); });
}

module.exports = {
  runSeed,
  runSeedTest, runSeedSections, runSeedTranscripts, runSeedCam15, runSeedCam16, runSeedCam17,
  sectionTitle, fmt,
  TEST_MAIN, TEST_NAMES, TARGETS_Transcripts, TARGETS_Cam15, TARGETS_Cam16, TARGETS_Cam17,
};
