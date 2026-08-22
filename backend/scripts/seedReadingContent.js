// Reading content seed — merged from 6 separate one-off scripts (each
// already run against the live DB): standalone passages, question-group
// explanations for existing passages, the Bondi passage, two passes that
// assemble "Actual Mocktest N" ReadingTest docs from tagged/untagged
// passage triplets, and Cambridge series/test tagging for passages that
// were missing it. Each keeps its own data and its own seed function
// exactly as originally written — only the shared requires/dotenv/
// connect-disconnect boilerplate and the final runner were consolidated.
// Run: node backend/scripts/seedReadingContent.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

// Generic one-off content seed for Reading — inserts the PASSAGES_MAIN array below
// as normal, independent Passage documents (one per category: passage1/2/3),
// exactly matching how admin's "Passages" page manages content. Unlike
// Listening, a ReadingTest document does NOT reference specific passages —
// the exam engine randomly pools 3 active passages per category at attempt
// time (see backend/models/ReadingTest.js comment) — so there is nothing to
// "bundle" here; each Passage is fully self-contained and independently
// editable in admin (title, content, question groups, difficulty, tags...).
//
// Reused per reading test: edit PASSAGES_MAIN below to the next set of 3
// passages, then run `node scripts/seedReadingPassages.js` from backend/.
// Safe to re-run — skips any passage whose exact title already exists.
// Each past run's content is preserved in git history under this filename.


const PASSAGES_MAIN = [
  // ── PASSAGE 1 (Q1–13) ───────────────────────────────────────────
  {
    title: 'The problems and benefits created by the spread of the water hyacinth in Kenya',
    category: 'passage1',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 4'],
    questionRange: { start: 1, end: 13 },
    content: `<p><strong>The problems and benefits created by the spread of the water hyacinth in Kenya</strong></p>
<p>Water hyacinth (Eichhornia crassipes), an aquatic plant native to South America, first appeared in countries in Africa in the early 1900s. Scientists there called it the 'world's worst aquatic weed', after it spread from the southernmost tip of Africa in the early 1900s and started obstructing major dams and rivers.</p>
<p>In east Africa the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds. But by the 1980s, it had 'escaped' out of the country via the Kagera river and made its way downstream to Lake Victoria. There, with no natural predators and perfect temperature conditions, the plant began spreading in the open water, blocking fishing routes and providing a new habitat for disease-carrying mosquitoes.</p>
<p>For the women who smoke fish from the lake to sell it has meant declining income, as the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants. But water hyacinth isn't their only headache. In order to smoke the fish that they buy, they must gather huge quantities of firewood, sometimes walking as far as 10km each way to collect enough to complete their work. And each day as they cook, they breathe in the thick, grey smoke. About three out of four families in Kenya depend on wood or charcoal to cook their daily meals, and the rate is even higher in rural areas, Kenya's latest demographic and health survey shows. Using solid fuels like these for cooking increases indoor pollution. The World Health Organization estimates that about 14,300 Kenyans die annually as a result of indoor air pollution – most of which is caused by cooking and heating sources.</p>
<p>Some years ago, on the shores of Lake Victoria, huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight. But buried in those decaying waxy leaves was a renewable energy gold mine. It turns out the floating plant isn't just good at spreading – its foliage also contains a high ratio of carbon to nitrogen. It's a magic combination that has captivated researchers' imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel. Just about 4kg of the dried plant would be enough to cater for a large family's daily energy needs, early research predicted.</p>
<p>In 2014, Nigerian academics announced they had got better yields of biofuel gas when they mixed the plant with chicken manure. A few years later, Kenyan scientists confirmed what their Nigerian peers and others had already found: manure worked to improve the process of converting the weed into gas.</p>
<p>In 2018, the technology came to a village on the shore of Lake Victoria, called Dunga. The project promised a two-for-one solution to the dual menaces of the water hyacinth and dependence on firewood. The community received a pair of donated biogas digesters – machines that would transform a mix of water hyacinth and cow dung into biogas for cooking.</p>
<p>The digesters work a bit like a stomach. The mixture goes in one end – think of it as a mouth – and over the next 20 to 30 days, it goes through a fermentation process and breaks down, giving off gas that comes out the other end. From there, the clean-burning gas is passed through pipes to the point of use, just like traditional domestic gas. In Dunga, the machines produce enough gas to serve about 60% of the village's population. It is used in domestic stoves and for other household tasks such as purifying water and incubating chicks.</p>
<p>The project is testing whether biogas can provide an effective alternative to firewood and charcoal in rural Kenyan communities. Results indicate that the programme seems to be working. The women who smoke the lake fish are already getting sick less often. Besides, they don't have to devote a lot of time every day to gathering firewood, which is a great relief. As a result, they're able to make more money for their families from other enterprises.</p>
<p>Kanyiva Muindi is an epidemiologist and air pollution research fellow at the African Population and Health Research Centre in Nairobi. She says families who switch to the smokeless cooking method could expect fewer respiratory diseases. Women, young girls and children are particularly vulnerable because they are the ones who cook in the kitchen or outside over fires.</p>
<p>How much better the biogas stoves will be for the community's health still needs more research, says Dominic Kahumbu Wanjihia, Biogas International's chief executive. But unless the price of the machines drops, it's pretty clear that most communities will never be able to afford any, since they sell for about $750.</p>
<p>Kanyiva says affordability is a challenge worth addressing, given the huge health and environmental dangers posed by 'dirty' fuels such as wood, charcoal and kerosene. If biogas could become affordable on a large scale, she says it 'would be life-changing for millions on the African continent and beyond'.</p>`,
    questionGroups: [
      {
        groupType: 'plain',
        groupTitle: 'Questions 1–7',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: '1   Water hyacinth was introduced as a decorative plant in east Africa.', correctAnswer: 'TRUE' },
          { questionNumber: 2, type: 'true-false-ng', questionText: '2   Fishermen took some water hyacinth plants to Lake Victoria.', correctAnswer: 'FALSE' },
          { questionNumber: 3, type: 'true-false-ng', questionText: '3   It is now difficult to force boats through the thick water hyacinth on Lake Victoria.', correctAnswer: 'TRUE' },
          { questionNumber: 4, type: 'true-false-ng', questionText: '4   Chemicals produced by the water hyacinth plants are affecting the numbers of fish in Lake Victoria.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 5, type: 'true-false-ng', questionText: "5   Cooking with charcoal has been proved to be even worse for people's health than cooking with wood.", correctAnswer: 'NOT GIVEN' },
          { questionNumber: 6, type: 'true-false-ng', questionText: '6   People found it impossible to remove much water hyacinth from Lake Victoria.', correctAnswer: 'FALSE' },
          { questionNumber: 7, type: 'true-false-ng', questionText: '7   Scientists started investigating the possibility of using water hyacinth to generate biogas in the last century.', correctAnswer: 'TRUE' },
        ],
      },
      {
        groupType: 'note-form',
        groupTitle: 'Questions 8–10',
        instruction: 'Complete the flow-chart below.  Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        noteConfig: {
          title: 'Generating biogas for domestic use in Dunga',
          lines: [
            'First, place water hyacinth together with some __Q8__ into a digester',
            '↓',
            'Leave the mixture until the __Q9__ is completed',
            '↓',
            'Capture the gas emitted by the digester and use __Q10__ to transport it to individual homes',
            '↓',
            'Then use the gas for cooking as well as making water fit for human consumption',
          ],
        },
        questions: [
          { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'cow dung' },
          { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'fermentation/fermentation process' },
          { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'pipes' },
        ],
      },
      {
        groupType: 'note-form',
        groupTitle: 'Questions 11–13',
        instruction: 'Complete the notes below.  Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Cooking with biogas in Dunga',
          lines: [
            'Benefits for the women in the village of cooking with biogas',
            '●   no need for them to spend so much __Q11__ collecting fuel',
            '●   they can focus on different tasks that bring in __Q12__.',
            '●   they are less likely to experience certain diseases connected to burning wood',
            'Drawbacks of changing to biogas',
            '●   the __Q13__ of the digesters is beyond the reach of most villages',
          ],
        },
        questions: [
          { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'time' },
          { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'money' },
          { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'price' },
        ],
      },
    ],
  },

  // ── PASSAGE 2 (Q14–26) ──────────────────────────────────────────
  {
    title: "How could multilingualism benefit India's poorest schoolchildren?",
    category: 'passage2',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 4'],
    questionRange: { start: 14, end: 26 },
    content: `<p><strong>How could multilingualism benefit India's poorest schoolchildren?</strong></p>
<p>The crowded and bustling streets of Delhi teem with life. Stop to listen and, above the din of rickshaws and buses, you'll hear a multitude of languages, as more than 20 million people go about their daily lives. Many were born and raised here, and many millions more have recently made India's capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life. Some arrive speaking fluent Hindi, the dominant language in Delhi (and the official language of government), but many arrive speaking any number of India's 22 officially recognised languages, let alone the hundreds of regional languages in a country of more than 1.3 billion people.</p>
<p>A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is currently working on a project collecting data on 1,000 primary-age children in Delhi and the cities of Hyderabad and Bihar. The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why in a country where multilingualism is so common (more than 255 million people in India speak at least two languages, and nearly 90 million speak three or more languages), the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren.</p>
<p>'Each year across India, 600,000 children are tested, and year after year over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task,' says Tsimpli. She explains that low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students.</p>
<p>Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home. The research project, which focuses on 8 to 11-year-old schoolchildren in rural and urban areas, collects data on whether the schoolchildren live in slum* or non-slum areas. Many of the children have moved from remote, rural areas to urban areas. They are so poor they have to live in slums and, as a result of migration, they may speak languages that are different from the regional language.</p>
<p>Having already tested 1,000 children, the researchers will now embark on retesting them. They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves. It's possible that one of the causes of low performance is the lack of pupil-centred teaching methods; in many Indian primary schools the teacher dominates and there is little room for independent learning.</p>
<p>Although the findings are at a preliminary stage, Tsimpli and her team have found that the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school and outside of school life. According to Tsimpli, most of the evidence from this and other projects shows that English instruction for children from low socio-economic areas might not be the best way for them to learn, at least in the first three years of primary education.</p>
<p>'What we would recommend for everyone, not just low socio-economic status children, would be to start learning in the language they feel comfortable learning in ... English can still be used, but perhaps not as the medium of instruction in primary schools. It could, for example, be one of the subjects that are being taught alongside other subjects. We are not suggesting that English be withdrawn – that ship has sailed – but we perhaps have to think more about learner needs. There is perhaps too much uniformity in teaching and less tailoring to the children's language abilities and needs,' says Tsimpli.</p>
<p>While the preliminary results show there is no difference in general intelligence among boys and girls from slum areas versus those from urban poor backgrounds, an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks). According to the researchers, this unexpected finding may be down to the life experiences of children growing up in slums. They are likely to mature faster and come into closer contact with the numeracy skills essential for day-to-day survival.</p>
<p>The project has already caught the attention of government ministers, who are keen to use the findings of the study to inform and adjust school policy in Delhi and the wider state. 'They are as keen as us to understand how the challenging context of deprivation can be attenuated when focusing on the languages children learn and use while at school. Our findings don't mean you're doomed if you're poor. It may be that these low learning outcomes are because of the way education is provided in India, with a huge focus on Hindi and English as the mediums of instruction, to the potential detriment of children unfamiliar with those languages,' explains Tsimpli.</p>
<p>'Language is central to the way knowledge is transferred – so the medium of instruction is obviously hugely influential. We hope to ... show that problem solving, numeracy and literacy can and do improve in children who are educated in a language of instruction they know. The trick may be to bridge school skills with life skills and make use of the richness of a child's life experience to help them learn in the most effective ways possible,' says Tsimpli.</p>
<p style="font-size:.9em">
<em>* slum: a very densely populated area in which the infrastructure is incomplete and services inadequate or non-existent</em>
</p>`,
    questionGroups: [
      {
        groupType: 'summary-completion',
        groupTitle: 'Questions 14–19',
        instruction: 'Complete the summary using the list of words, A-J, below.',
        summaryConfig: {
          text: 'Multilingualism in Delhi<br><br>The city of Delhi has a __Q14__ and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are __Q15__. Whether they have come from a __Q16__ or have travelled from the other side of India, they have all come in search of things such as improved __Q17__.<br><br>A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is collecting data on primary-age schoolchildren in Delhi and other Indian cities. The __Q18__ of the research is to discover why multilingual Indian schoolchildren do not experience __Q19__ to those that multilingual schoolchildren in Europe experience.',
          wordBank: [
            { letter: 'A', word: 'basic outlook' },
            { letter: 'B', word: 'employment opportunities' },
            { letter: 'C', word: 'wealthy visitors' },
            { letter: 'D', word: 'distant country' },
            { letter: 'E', word: 'primary objective' },
            { letter: 'F', word: 'similar advantages' },
            { letter: 'G', word: 'thriving economy' },
            { letter: 'H', word: 'nearby district' },
            { letter: 'I', word: 'dense population' },
            { letter: 'J', word: 'new immigrants' },
          ],
        },
        questions: [
          { questionNumber: 14, type: 'fill-blank', questionText: 'Question 14', correctAnswer: 'dense population' },
          { questionNumber: 15, type: 'fill-blank', questionText: 'Question 15', correctAnswer: 'new immigrants' },
          { questionNumber: 16, type: 'fill-blank', questionText: 'Question 16', correctAnswer: 'nearby district' },
          { questionNumber: 17, type: 'fill-blank', questionText: 'Question 17', correctAnswer: 'employment opportunities' },
          { questionNumber: 18, type: 'fill-blank', questionText: 'Question 18', correctAnswer: 'primary objective' },
          { questionNumber: 19, type: 'fill-blank', questionText: 'Question 19', correctAnswer: 'similar advantages' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 20–23',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 2? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 20, type: 'yes-no-ng', questionText: '20   Ten-year-old Indian schoolchildren tend to perform better in literacy tests than in numeracy tests.', correctAnswer: 'NO' },
          { questionNumber: 21, type: 'yes-no-ng', questionText: '21   Tsimpli had problems convincing some female students to take part in the study.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 22, type: 'yes-no-ng', questionText: '22   Tsimpli and her team wanted to know if there is a connection between poor academic performance and being taught in an unfamiliar language.', correctAnswer: 'YES' },
          { questionNumber: 23, type: 'yes-no-ng', questionText: '23   The researchers have decided against investigating the impact teaching methodology may have on learning outcomes.', correctAnswer: 'NO' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 24–26',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 24, type: 'multiple-choice',
            questionText: '24   What point does the writer make about primary schools in India in the sixth paragraph?',
            options: [
              'A   Exposure to English outside of school is of limited benefit.',
              'B   Children learn English more easily when they are well motivated.',
              'C   Poor children may be disadvantaged further by being instructed in English.',
              'D   There is little consistency across schools with regard to instruction in English.',
            ],
            correctAnswer: 'C',
          },
          {
            questionNumber: 25, type: 'multiple-choice',
            questionText: "25   What is Tsimpli suggesting when she uses the phrase 'that ship has sailed'?",
            options: [
              'A   The findings of the report may be of little help to some Indian schoolchildren.',
              'B   Instruction in English could be better adapted to the needs of schoolchildren.',
              'C   Schools have had limited success in teaching English as a separate subject.',
              'D   It is too late to remove English completely as a language of instruction in schools.',
            ],
            correctAnswer: 'D',
          },
          {
            questionNumber: 26, type: 'multiple-choice',
            questionText: '26   In the eighth paragraph, what do we learn has surprised researchers?',
            options: [
              'A   Boys and girls from low socio-economic groups have similar general intelligence levels.',
              'B   The age at which children move into a slum does not affect their academic performance.',
              'C   Slum children and children from other urban poor backgrounds have similar life experiences.',
              'D   The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds.',
            ],
            correctAnswer: 'D',
          },
        ],
      },
    ],
  },

  // ── PASSAGE 3 (Q27–40) ──────────────────────────────────────────
  {
    title: 'The Globemakers: The Curious Story of an Ancient Craft',
    category: 'passage3',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 4'],
    questionRange: { start: 27, end: 40 },
    content: `<p><strong>The Globemakers: The Curious Story of an Ancient Craft</strong></p>
<p><em>A review of Peter Bellerby's book The Globemakers</em></p>
<p>In 2008, Peter Bellerby, who lived in London, wanted to give his father a model globe for his eightieth birthday. What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined. It ended with his establishing the world's only bespoke globemaking company.</p>
<p>The first surprise in The Globemakers, Bellerby's account of this impulsive enterprise, is that obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs. After all, contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE. The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball, while the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE. Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find.</p>
<p>Nearly two millennia later, however, it seemed that the art of globemaking had been largely forgotten. Bellerby came across shoddy commercial versions designed for school classrooms and genuine antiques in auction houses that would have bust his budget. Even his trips to Morocco and India, where surely the knowledge of artisan cartographers* had been preserved, drew a blank.</p>
<p>Not one to be easily thwarted, Bellerby decided to make his own good-quality globe. In the process, almost everything that could possibly go wrong did so. Even the shape of the Earth posed a problem, as it is not quite a perfect sphere, but oblate (slightly flattened at the poles). Having decided to compromise and opt for two half-spherical pieces that could be fitted together, he was unable to discover anyone capable of casting moulds with sufficient accuracy to ensure that he would not be left with two half-spheres that were not quite the same circumference. Even after he eventually resolved this issue, extracting these from the moulds resulted in piles of cracked plaster of Paris** and clouds of choking dust in the workshop he had set up at the rear of his house.</p>
<p>This series of abortive experiments taught Bellerby a lot about the challenges of making globes, which he communicates here to the reader. Finding just the right way to prise the globes from the mould – a high-end air compressor finally did the trick – and locating the right paper and inks with which to make the gores (the sections of flat sheet mapping that are pasted onto the spherical globe) without the ink seeping out to create a mushy, unreadable mess took months and an alarming chunk out of his bank balance. Bellerby's frustration at the painstaking process of attaching the gores to the globe surface – after having found a glue with precisely the right adhesive qualities – is palpable. Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre (which may not seem a great deal, but when that represents 2 per cent of the Earth's diameter, it's equivalent to obliterating the Himalayas or wiping out Chile).</p>
<p>Bellerby's account of the technical challenges of globe production is interspersed with a series of interludes on great globemakers of the past and cartographic history in general. Purists might wish for more map-making details, but Bellerby clearly found a kindred spirit in Martin Behaim. He was the Nuremberg entrepreneur who in 1492 created the Erdapfel, the world's oldest surviving globe, beautifully finished by a workshop of painters and other craftsmen, only to find that the explorer Christopher Columbus had stumbled upon the Americas the very same year, rendering his masterpiece instantly out of date. Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli, who, in the seventeenth century, created two globes for Louis XIV of France. It took him twenty years to complete the monstrous pair, whose vast bulk – each with a diameter of around four metres – can still be admired in the National Library of France in Paris.</p>
<p>Although a celebration of the revival of an ancient craft, Bellerby's book is also a lament for the fading away of centuries-old traditions. When he embarked on his globemaking odyssey, he struggled to find artisans with the skills to make the right moulds for the globes or foundries that could shape the meridians (the metal frames which girdle globes) in just the right way. Although he finally located the right craftsmen, some simply dropping in, serendipitously, to his workshop (by now in more suitable premises than his back room), many of these have now retired or passed away. Bellerby's father finally did receive his eightieth birthday present, albeit two years late.</p>
<p>Bellerby went on to found a company which now turns out over six hundred globes a year for customers who can have their own tiny village marked or more unusual requests fulfilled. His book, beautifully illustrated with photographs of the various stages of his venture and a few illustrations of historic globes and maps, is hardly a blueprint for commercial success. But it is more than enough to stir up admiration for the craftsmanship of the great mapmakers of the past and the obsessive determination of a modern successor who revived their almost moribund art.</p>
<p style="font-size:.9em">
<em>* cartographer: someone involved in the science or practice of drawing maps</em><br>
<em>** plaster of Paris: a quick-setting plaster consisting of a fine white powder that hardens when moistened and allowed to dry</em>
</p>`,
    questionGroups: [
      {
        groupType: 'summary-completion',
        groupTitle: 'Questions 27–32',
        instruction: 'Complete the summary using the list of words, A-J, below.',
        summaryConfig: {
          text: "A birthday gift<br><br>Peter Bellerby's plan to give his father a globe for his birthday was an unexpectedly __Q27__ for which he had to overcome __Q28__.<br><br>He soon learnt that a straightforward __Q29__ would not be possible. Some __Q30__ that had been intended for __Q31__ were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the __Q32__, but Bellerby could not find what he wanted.",
          wordBank: [
            { letter: 'A', word: 'educational use' },
            { letter: 'B', word: 'rare materials' },
            { letter: 'C', word: 'inferior makes' },
            { letter: 'D', word: 'product exchange markets' },
            { letter: 'E', word: 'necessary skills' },
            { letter: 'F', word: 'international' },
            { letter: 'G', word: 'challenging task' },
            { letter: 'H', word: 'memorable object' },
            { letter: 'I', word: 'internet purchase' },
            { letter: 'J', word: 'numerous problems' },
          ],
        },
        questions: [
          { questionNumber: 27, type: 'fill-blank', questionText: 'Question 27', correctAnswer: 'challenging task' },
          { questionNumber: 28, type: 'fill-blank', questionText: 'Question 28', correctAnswer: 'numerous problems' },
          { questionNumber: 29, type: 'fill-blank', questionText: 'Question 29', correctAnswer: 'internet purchase' },
          { questionNumber: 30, type: 'fill-blank', questionText: 'Question 30', correctAnswer: 'inferior makes' },
          { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'educational use' },
          { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'necessary skills' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 33–36',
        instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 33, type: 'yes-no-ng', questionText: '33   The assumption today that people in the past knew very little about geography is correct.', correctAnswer: 'NO' },
          { questionNumber: 34, type: 'yes-no-ng', questionText: '34   Plato was criticised for saying the world was shaped like a leather ball.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 35, type: 'yes-no-ng', questionText: '35   The globe made by Crates of Mallus was an accurate representation of the known world.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 36, type: 'yes-no-ng', questionText: '36   Bellerby assumed he would have few problems locating a well-made globe.', correctAnswer: 'YES' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 37–40',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 37, type: 'multiple-choice',
            questionText: '37   When Bellerby had to attach the gores to the globe surface,',
            options: [
              'A   he decided it was best to work quickly.',
              'B   he became aware of an unexpected issue.',
              'C   he was worried about the quality of his materials.',
              'D   he nearly gave up the whole project.',
            ],
            correctAnswer: 'B',
          },
          {
            questionNumber: 38, type: 'multiple-choice',
            questionText: '38   The reviewer mentions other globe makers of the past because',
            options: [
              'A   Bellerby was particularly inspired by them.',
              'B   their achievements are not widely known.',
              'C   Bellerby had something in common with each of them.',
              'D   their difficulties could have been avoided.',
            ],
            correctAnswer: 'C',
          },
          {
            questionNumber: 39, type: 'multiple-choice',
            questionText: '39   What point is made about Bellerby in the seventh paragraph?',
            options: [
              'A   He had long working relationships with numerous craftsmen.',
              'B   He understands the lack of interest in traditional crafts.',
              'C   He appreciates the importance of careful planning.',
              'D   He regrets the loss of many globe-making skills.',
            ],
            correctAnswer: 'D',
          },
          {
            questionNumber: 40, type: 'multiple-choice',
            questionText: "40   What does the reviewer say about Bellerby's book in the final paragraph?",
            options: [
              'A   It does not tell you how to create a profitable business.',
              'B   It overlooks some important mapmakers.',
              'C   It fails to discuss the future of globe-making.',
              'D   It does not give enough details about individual customers.',
            ],
            correctAnswer: 'A',
          },
        ],
      },
    ],
  },
];

async function runSeedPassages() {
  const results = [];
  for (const p of PASSAGES_MAIN) {
    const existing = await Passage.findOne({ title: p.title, category: p.category }).lean();
    if (existing) {
      console.log(`[SeedReadingPassages] "${p.title}" (${p.category}) already exists (_id=${existing._id}) – skip`);
      results.push(existing);
      continue;
    }
    const doc = await Passage.create(p);
    console.log(`[SeedReadingPassages] Inserted "${p.title}" (${p.category}, _id=${doc._id}, ${doc.questions.length + doc.questionGroups.reduce((s, g) => s + g.questions.length, 0)} questions)`);
    results.push(doc);
  }
  return results;
}


// Generic one-off content seed — fills in the `explanation` field for
// questions on ALREADY-SEEDED Passage documents (each found by title +
// category), matching the existing "Vị trí / Trích dẫn / Phân tích"
// convention already used elsewhere in the live DB (confirmed by reading a
// real passage's TFNG questions before writing this). This does not create
// new Passage documents — it updates ones that seedReadingPassages.js (or
// admin) already created.
//
// Reused per passage (or batch of passages): edit TARGETS_EXPL below, then run
// `node scripts/seedReadingExplanations.js` from backend/. Safe to re-run —
// always overwrites with the current EXPLANATIONS content (idempotent), and
// errors out (no partial write on that target) if any question number
// doesn't exist on it, so a typo can't silently no-op.


const TARGETS_EXPL = [
  {
    title: 'Why we need silence',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn C.

Trích dẫn: "By providing recommendations for quieter buses, reducing noise from roads and also controlling noise from aircraft..." / "Other cities have introduced noise-reducing road coatings... alongside greenery that muffles sound."

Phân tích: Đoạn C liệt kê hàng loạt biện pháp giảm tiếng ồn cho công chúng: xe buýt êm hơn, giảm tiếng ồn đường bộ/máy bay, mặt đường giảm âm, tăng cây xanh hấp thụ âm thanh.`,

      15: `Vị trí: Đoạn B.

Trích dẫn: "...people living in cities such as Mumbai, Tokyo and Buenos Aires are being exposed to far more than the recommended 40 decibels of noise at night." / "...at least 1 in 5 people consistently exposed to levels considered harmful to health."

Phân tích: Đoạn B đưa ra số liệu cụ thể (mức khuyến nghị 40 decibel, tỉ lệ 1/5 dân số) cho thấy quy mô nghiêm trọng của vấn đề ô nhiễm tiếng ồn.`,

      16: `Vị trí: Đoạn A.

Trích dẫn: "Our blood pressure goes up, muscles tense and glands release hormones that prepare us for fight or flight."

Phân tích: Đoạn A mô tả các thay đổi sinh lý của cơ thể (huyết áp tăng, cơ căng, hormone tiết ra) khi nghe âm thanh đột ngột.`,

      17: `Vị trí: Đoạn G.

Trích dẫn: "Participants reported more relaxation and less boredom when they sat quietly in an outdoor garden compared with a completely silent room."

Phân tích: Đoạn G so sánh trực tiếp và cho thấy môi trường tương đối yên tĩnh (khu vườn ngoài trời) mang lại lợi ích hơn phòng hoàn toàn im lặng.`,

      18: `Vị trí: Đoạn D.

Trích dẫn: "But it is the ability to focus on the breath that helps people reach a relaxed or meditative state."

Phân tích: Sau "their own" cần một danh từ; Feinstein cho rằng khả năng tập trung vào hơi thở (breath) chính là yếu tố giúp con người thư giãn và đạt trạng thái thiền định.`,

      19: `Vị trí: Đoạn E.

Trích dẫn: "Feinstein and his colleagues recruited 50 people with a variety of conditions related to stress and had them answer a questionnaire prior to and following a flotation session."

Phân tích: Sau mạo từ "a" cần một danh từ số ít; người tham gia phải trả lời một bảng câu hỏi (questionnaire) trước và sau khi trải nghiệm bể nổi.`,

      20: `Vị trí: Đoạn E.

Trích dẫn: "Participants reported decreases in muscle tension, pain and symptoms of their conditions after a single, 1-hour float, alongside an increase in feelings of relaxation and overall wellbeing."

Phân tích: "improved general wellbeing" trong câu hỏi paraphrase từ "an increase in ... overall wellbeing" trong bài (signs of relaxation → feelings of relaxation; improved → an increase in; general → overall).`,

      21: `Vị trí: Đoạn E.

Trích dẫn: "Float sessions uniquely decreased activity in the default mode network (DMN), a collection of brain regions commonly linked with depression."

Phân tích: Sau cụm "associated with" cần một danh từ; vùng não DMN giảm hoạt động, đây là nhóm vùng não thường liên quan đến chứng trầm cảm (depression).`,

      22: `Vị trí: Đoạn F.

Trích dẫn: "When people do not want silence, it can be very distressing."

Phân tích: Ben-Soussan nhấn mạnh sự tự nguyện (volition) là yếu tố quan trọng; nếu một người bị đặt vào môi trường yên tĩnh trái ý muốn, trải nghiệm đó sẽ gây khó chịu và căng thẳng. → C. Tal Dotan Ben-Soussan`,

      23: `Vị trí: Đoạn C.

Trích dẫn: "'People are seeing the benefits of these more quiet environments in their cities,' Antonio says. 'I expect we will see much more of this in the future.'"

Phân tích: Sau khi nêu các ví dụ về thành phố áp dụng biện pháp giảm ồn, Nick Antonio dự đoán xu hướng xây dựng đô thị yên tĩnh sẽ tiếp tục phát triển. → A. Nick Antonio`,

      24: `Vị trí: Đoạn D.

Trích dẫn: "When you don't have external sensory stimuli coming in, the brain tries to fill the void to make sense of this dark and silent world."

Phân tích: Feinstein giải thích rằng khi thiếu kích thích giác quan từ bên ngoài, não bộ sẽ tự tạo ra cảm nhận (âm thanh, hình ảnh) để lấp đầy khoảng trống cảm giác. → B. Justin Feinstein`,

      25: `Vị trí: Đoạn G.

Trích dẫn: "It is likely better to have more frequency of silence for a few minutes at a time than a longer period of silence only once a week."

Phân tích: Pfeifer cho rằng không cần dành hàng giờ trong im lặng — chỉ vài phút yên tĩnh mỗi lần, lặp lại thường xuyên cũng đã mang lại lợi ích. → D. Eric Pfeifer`,

      26: `Vị trí: Đoạn F.

Trích dẫn: "This allows us to be more aware of what is happening around us and what the situation may require from us so we can provide [a more] adequate response."

Phân tích: Ben-Soussan cho rằng sự yên tĩnh cả bên ngoài lẫn nội tâm giúp con người nhận thức rõ hơn về hoàn cảnh xung quanh và phản ứng phù hợp hơn. → C. Tal Dotan Ben-Soussan`,
    },
  },
  {
    title: 'Book review: The World of Sugar by Ulbe Bosma',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "Beet sugar is grown mainly in Europe and the United States. It has also been massively subsidised and sold at artificially low prices on world markets, threatening the livelihood of producers of cane sugar."

Phân tích: Đường củ cải được trợ cấp lớn và bán với giá thấp một cách giả tạo trên thị trường quốc tế, giúp nó có lợi thế cạnh tranh hơn so với đường mía. → B. Beet sugar has been made more internationally competitive.`,

      28: `Vị trí: Đoạn 2.

Trích dẫn: "The sweet-toothed British first bought cane sugar..." / "Following the abolition of slavery..." / "Towards the end of the 19th century..." / "Only in the 20th century..."

Phân tích: Đoạn văn mô tả quá trình thay đổi nguồn cung đường của Anh qua từng thời kỳ (thuộc địa → Cuba/Brazil → châu Âu → phát triển ngành trong nước). → A. how the sources used changed over time.`,

      29: `Vị trí: Đoạn 3.

Trích dẫn: "Contrary to popular belief, cane sugar production was never just restricted to large, dedicated plantations owned by rich men."

Phân tích: Tác giả bác bỏ quan niệm sai lầm phổ biến rằng đường mía chỉ được sản xuất tại các đồn điền lớn của người giàu; ví dụ ở Java cho thấy nông hộ nhỏ cũng tham gia sản xuất. → C. addressing a misconception about the growing of sugar cane.`,

      30: `Vị trí: Đoạn cuối.

Trích dẫn: "He shows that we could always have done without sugar and that today we have many alternative sources of sweetness."

Phân tích: Bosma kết luận rằng con người hoàn toàn có thể sống mà không cần đường, đúc kết từ những tác động tiêu cực của ngành đường xuyên suốt cuốn sách. → A. Sugar is a harmful and unnecessary product.`,

      31: `Vị trí: Đoạn 4.

Trích dẫn: "German beet fields employed Polish workers; Mexicans and many others, including Sicilians, were vital to US sugar production."

Phân tích: Cả Đức và Mỹ đều dựa vào lao động nhập cư (migrant workers) để duy trì sản xuất đường quy mô lớn.`,

      32: `Vị trí: Đoạn 4.

Trích dẫn: "...the book is about the continuity of the use of traditional methods on small farms. In the mid 20th-century, this type of sugar production dominated in South Asia and Latin America."

Phân tích: Tại Nam Á và Mỹ Latinh, mô hình canh tác quy mô nhỏ (small-scale cultivation) vẫn tiếp tục chiếm ưu thế.`,

      33: `Vị trí: Đoạn 5.

Trích dẫn: "This is also a history of capitalists and sugar dynasties, as well as corporations that in some cases have remained influential over very long periods. Great firms and great interests have had profound influence on the policies of states."

Phân tích: Các nhà tư bản, gia tộc kinh doanh đường và tập đoàn lớn (powerful individuals and businesses) có ảnh hưởng mạnh và luôn muốn bảo vệ thị trường/lợi ích của mình.`,

      34: `Vị trí: Đoạn 5.

Trích dẫn: "...a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies."

Phân tích: "politics" trong bài tương ứng với "national governments" trong tóm tắt — tầng lớp tư sản ngành đường có vai trò lớn trong chính trị, tức là có ảnh hưởng đến chính phủ quốc gia.`,

      35: `Vị trí: Đoạn 5.

Trích dẫn: "...their interests were consequently protected by trade barriers and subsidies."

Phân tích: "trade barriers and subsidies" là các biện pháp kiểm soát tài chính/thương mại (financial controls) được thiết lập để bảo vệ lợi ích của nhà sản xuất đường.`,

      36: `Vị trí: Đoạn 5.

Trích dẫn: "...it was inevitably the poor countries which came off worse."

Phân tích: "poor countries" tương ứng với "less wealthy nations" — các quốc gia nghèo hơn luôn là bên chịu thiệt trong cuộc cạnh tranh của ngành đường.`,

      37: `Vị trí: Đoạn 6.

Trích dẫn: "The growth of the industry entailed a very rapid diffusion of ideas and techniques from one country to another. Cuba, for example, developed an extraordinarily dense system of railways to transport workers and cane, as well as steam-powered sugar factories."

Phân tích: Bài nhấn mạnh vai trò của công nghệ, máy móc, đường sắt, nhà máy hơi nước và các giống mía/củ cải mới giúp sản lượng đường tăng vọt → ủng hộ nhận định đường trở nên dồi dào nhờ hàng loạt tiến bộ nông nghiệp/công nghệ. → YES`,

      38: `Vị trí: Đoạn 7.

Trích dẫn: "Once regarded as a luxury, sugar came to be promoted as a valuable source of energy."

Phân tích: Bài chỉ nói đường TỪNG ĐƯỢC XEM LÀ hàng xa xỉ, không nói rõ các nhà quảng cáo ban đầu có chủ động tiếp thị nó như vậy hay không → không đủ căn cứ. → NOT GIVEN`,

      39: `Vị trí: Đoạn 7.

Trích dẫn: "High-fructose corn syrup made from maize using an enzymatic process invented in Japan in the 1960s... is regarded as a leading cause of obesity."

Phân tích: Tác giả gọi đây là "worrying new development" và cho biết HFCS bị xem là nguyên nhân hàng đầu gây béo phì → không phải một phát triển tích cực. → NO`,

      40: `Vị trí: Đoạn 7.

Trích dẫn: "It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity."

Phân tích: Bài khẳng định HFCS được sử dụng rộng rãi trong nước giải khát và nhiều loại thực phẩm chế biến sẵn. → YES`,
    },
  },
  // ── Cam 21 - Test 2 ──────────────────────────────────────────────────
  {
    title: 'Do animals dream?',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "researchers compared the brain patterns of rats running through a maze when awake with their brain patterns during REM sleep. They found the patterns were very similar and concluded that the sleeping rats were dreaming about going through the maze."

Phân tích: Đoạn 2 nói về loài chuột (rats) — bằng chứng "brain patterns giống nhau khi thức và khi ngủ" khớp đúng với dòng "similar brain patterns were observed when active and sleeping" trong bảng.`,

      2: `Vị trí: Đoạn 3.

Trích dẫn: "the recordings revealed both REM and non-REM sleep... REM sleep activity was high in brain regions involved in processing visual information, especially images related to physical activities such as flying"

Phân tích: Vùng não hoạt động mạnh khi chim bồ câu ngủ REM là vùng xử lý thông tin thị giác → "visual".`,

      3: `Vị trí: Đoạn 4.

Trích dẫn: "whales and dolphins, which do not shut down their entire brain when they sleep, but only half of it, keeping the rest awake."

Phân tích: Cá voi và cá heo chỉ để một nửa (half) bộ não nghỉ khi ngủ, nửa còn lại vẫn thức.`,

      4: `Vị trí: Đoạn 4.

Trích dẫn: "It's thought that they don't experience REM sleep because during REM sleep animals are more vulnerable to extremes of temperature."

Phân tích: Trong giấc ngủ REM, động vật dễ bị ảnh hưởng bởi nhiệt độ (temperature) khắc nghiệt hơn, nên cá voi/cá heo được cho là tránh giai đoạn này.`,

      5: `Vị trí: Đoạn 4.

Trích dẫn: "They also show no sign of REM sleep, suggesting that they may only experience non-REM dreams, which are less vivid."

Phân tích: Giấc mơ non-REM của cá voi/cá heo được mô tả là "less vivid" (kém sống động) — khớp với "not very vivid" trong bảng.`,

      6: `Vị trí: Đoạn 5.

Trích dẫn: "It is believed that when events are replayed in dreams, this helps to integrate memories into longer-term storage."

Phân tích: Đúng như câu hỏi paraphrase — việc "phát lại" sự kiện trong giấc mơ giúp hình thành trí nhớ dài hạn. → TRUE`,

      7: `Vị trí: Đoạn 6.

Trích dẫn: "We are quick to interpret the twitching limbs and quiet barks of sleeping dogs, but the truth is that we don't know if there is an internal experience of chasing rabbits that comes along with that."

Phân tích: Bài khẳng định con người KHÔNG THỂ biết chắc trải nghiệm/nội dung giấc mơ của chó, trái ngược với ý "có thể biết được loại giấc mơ" trong câu hỏi. → FALSE`,

      8: `Vị trí: Đoạn 7 (và toàn bài không có đoạn nào khác nhắc lại).

Trích dẫn: "In 2019, while making a documentary, David Scheel of Alaska Pacific University in the USA housed an octopus named Heidi in a tank in his living room."

Phân tích: Bài chỉ kể lại việc Scheel làm phim tài liệu và quan sát Heidi, không hề đề cập việc bộ phim này có ảnh hưởng đến các nghiên cứu khác về giấc ngủ của bạch tuộc hay không. → NOT GIVEN`,

      9: `Vị trí: Đoạn 8.

Trích dẫn: "Costello, as the octopus was called, thrashed around, extended his mantle as if trying to make himself look bigger, and squirted ink as though he were being attacked by a predator."

Phân tích: Hành vi của Costello cho thấy nó phản ứng NHƯ ĐANG BỊ TẤN CÔNG (phòng thủ trước kẻ săn mồi), chứ không phải như đang đi săn mồi. → FALSE`,

      10: `Vị trí: Đoạn 8.

Trích dẫn: "The nightmare study is intriguing, says Scheel, but is only based on one animal. He argues that as well as outward behaviour, brain imaging is needed to show that the octopuses are replaying sequences of activities from their waking lives in dreams."

Phân tích: Scheel cho rằng nghiên cứu hiện tại mới chỉ dựa trên một cá thể và cần thêm bằng chứng (chụp ảnh não) — thể hiện quan điểm cần nghiên cứu sâu hơn. → TRUE`,

      11: `Vị trí: Đoạn 9.

Trích dẫn: "The trouble is that we will never be able to experience any animal's dreams. That goes for other humans' dreams too."

Phân tích: Bài khẳng định con người "sẽ không bao giờ" trải nghiệm được giấc mơ của người khác, trái ngược hoàn toàn với ý "sắp có thể chia sẻ giấc mơ" trong câu hỏi. → FALSE`,

      12: `Vị trí: Đoạn 9.

Trích dẫn: "vision is the dominant sense for many humans, and so our dreams are heavily visual too. Dogs primarily navigate the world using smell while spiders rely much more on vibrations."

Phân tích: Đoạn 9 chỉ nhắc đến thị giác (người), khứu giác (chó) và rung động (nhện) là giác quan chủ đạo, hoàn toàn không đề cập đến thính giác (hearing) ở bất kỳ loài nào. → NOT GIVEN`,

      13: `Vị trí: Toàn bài không đề cập.

Phân tích: Bài không có bất kỳ thông tin nào về việc mối quan tâm/nghiên cứu lý do con người mơ đã tăng lên trong thời gian gần đây. → NOT GIVEN`,
    },
  },
  {
    title: 'Mapungubwe',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn E.

Trích dẫn: "The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known."

Phân tích: Cụm "but their precise function is not known" thể hiện rõ sự KHÔNG CHẮC CHẮN về mục đích sử dụng thật sự của các đồ vật (figures) này. → E`,

      15: `Vị trí: Đoạn G.

Trích dẫn: "The kingdom of Mapungubwe was already in decline by the late 13th century, probably because overpopulation placed too much stress on local resources, a situation that may have been brought to a crisis point by a series of droughts."

Phân tích: Hạn hán (droughts) — một yếu tố khí hậu — được cho là đã làm trầm trọng thêm các vấn đề mà Mapungubwe gặp phải. → G`,

      16: `Vị trí: Đoạn C.

Trích dẫn: "There were some grander residences dotted around the outskirts of Babandyanalo, and these probably belonged to male relatives of the king."

Phân tích: Đoạn C nêu rõ nơi ở (những dinh thự lớn hơn ở ngoại vi Babandyanalo) được cho là của các thành viên nam trong hoàng tộc. → C`,

      17: `Vị trí: Đoạn D.

Trích dẫn: "The presence of glass beads, almost certainly from India, indicate there was trade of some sort with other states on the coast who, in turn, traded with merchants travelling from India by sea."

Phân tích: "merchants travelling... by sea" chính là những thương nhân mang hàng hoá đến bằng đường biển. → D`,

      18: `Vị trí: Đoạn B.

Trích dẫn: "The total population of Mapungubwe at its peak in the mid-13th century was around 5,000 people."

Phân tích: Đây là con số ước tính cụ thể (khoảng 5.000 người) về quy mô mà cộng đồng Mapungubwe đã phát triển tới. → B`,

      19: `Vị trí: Đoạn A.

Trích dẫn: "cattle herding and other types of farming brought plenty of food and a surplus that could be traded for needed goods."

Phân tích: Sản phẩm nông nghiệp dư thừa (surplus từ chăn nuôi/trồng trọt) được đem trao đổi lấy hàng hoá khác. → A`,

      20: `Vị trí: Đoạn F.

Trích dẫn: "These objects were all found at the royal burial site and date to c. 1150."

Phân tích: Các đồ vật bằng vàng được tìm thấy ngay tại khu lăng mộ hoàng gia (royal burial site) → khớp phương án B "Items of gold were placed close to where Mapungubwe kings were buried."`,

      21: `Vị trí: Đoạn F.

Trích dẫn: "A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it."

Phân tích: Kiểu trang trí vàng này của Mapungubwe chỉ xuất hiện thêm ở một vương quốc khác là Great Zimbabwe → khớp phương án D "The way gold was decorated in Mapungubwe was also practised in another kingdom." (A sai vì đoạn F nói vàng chưa từng được dùng như tiền tệ; C, E không được đề cập.)`,

      22: `Vị trí: Đoạn E.

Trích dẫn: "Archaeological discoveries reveal that pottery was produced on a scale large enough to suggest the presence of professional potters, and is another indicator of the prosperity of Mapungubwe society."

Phân tích: Đây chính là từ mô tả điều mà số lượng gốm sứ được sản xuất chuyên nghiệp thể hiện. → "prosperity"`,

      23: `Vị trí: Đoạn E.

Trích dẫn: "There are also ceramic discs, and whistles."

Phân tích: Sau "ceramic discs" (đĩa gốm tròn), vật được liệt kê tiếp theo là "whistles" (còi) — đúng thứ tự trong bài.`,

      24: `Vị trí: Đoạn E.

Trích dẫn: "small figures of highly stylised humans with elongated bodies and short limbs have been found."

Phân tích: "elongated" (kéo dài) trong bài được paraphrase thành "stretched" trong tóm tắt, cùng bổ nghĩa cho "bodies".`,

      25: `Vị trí: Đoạn E.

Trích dẫn: "The figures may have been used in ceremonies as offerings to ancestors"

Phân tích: Các nghi lễ được cho là để dâng lễ vật tôn vinh tổ tiên (ancestors).`,

      26: `Vị trí: Đoạn E.

Trích dẫn: "Other discoveries include small jewellery items made from locally sourced copper."

Phân tích: Đồ trang sức (jewellery) được làm từ đồng — kim loại khai thác tại địa phương.`,
    },
  },
  {
    title: 'Artificial Intelligence',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "hysteria about the future of artificial intelligence (AI) is everywhere... Just looking at the media headlines, you might think that we are already living in a future where AI has infiltrated every aspect of society."

Phân tích: Đoạn 1 mô tả cách công chúng/truyền thông nhìn nhận AI (sự cuồng nhiệt, tin tức giật gân), chứ không phải dự đoán riêng của tác giả. → B "describing a public perception of AI"`,

      28: `Vị trí: Đoạn 2.

Trích dẫn: "this mindset actually jeopardises the value of machine intelligence by disregarding important AI safety principles and setting unrealistic expectations about what AI can really do for humanity."

Phân tích: Tác giả chỉ ra một rủi ro cụ thể của tư duy "AI solutionism". → A "points out a risk involved."`,

      29: `Vị trí: Đoạn 4.

Trích dẫn: "While many politicians proclaim the transformative effects of the coming 'AI revolution', they fail to realise the complexity around deploying advanced machine learning systems in the real world."

Phân tích: Các chính trị gia không nhận thức được sự phức tạp khi triển khai AI trong thực tế. → C "be unaware of the challenges of implementing national AI initiatives."`,

      30: `Vị trí: Đoạn 5.

Trích dẫn: "adding a neural network to a system of government does not mean it will be instantaneously more inclusive or fair."

Phân tích: Bài phủ định niềm tin sai lầm rằng chỉ cần thêm neural network là hệ thống sẽ công bằng/bình đẳng hơn ("fair"/"inclusive") → từ cần điền là "equality".`,

      31: `Vị trí: Đoạn 6.

Trích dẫn: "the public sector typically does not have the appropriate data infrastructure to support advanced machine learning."

Phân tích: "data infrastructure" trong bài được paraphrase thành "framework" trong bài tóm tắt.`,

      32: `Vị trí: Đoạn 6.

Trích dẫn: "data is spread across different government departments that each require special permissions to be accessed."

Phân tích: "special permissions" (sự cho phép đặc biệt) được paraphrase thành "approval".`,

      33: `Vị trí: Đoạn 6.

Trích dẫn: "the public sector typically lacks the human talent with the right technological capabilities to fully reap the benefits of machine intelligence."

Phân tích: "technological capabilities" trong bài được paraphrase thành "skills" trong bài tóm tắt.`,

      34: `Vị trí: Đoạn 11.

Trích dẫn: "Even though it was developed to deliver the best recommendations, human experts found it hard to trust the machine."

Phân tích: Việc chuyên gia khó "trust" (tin tưởng) chương trình AI liên quan trực tiếp đến "reliability" (độ tin cậy) của nó.`,

      35: `Vị trí: Đoạn 12.

Trích dẫn: "The system was found to amplify structural racial discrimination and was later abandoned."

Phân tích: "racial discrimination" (sự phân biệt chủng tộc) trong bài được paraphrase thành "prejudices" (định kiến) trong bài tóm tắt.`,

      36: `Vị trí: Đoạn 7.

Trích dẫn: "Stuart Russell, a professor of computer science at the University of California, Berkeley, has long advocated a more sensible and realistic approach that focuses on simple everyday applications of AI instead of the hypothetical takeover by super-intelligent robots."

Phân tích: Đề xuất của Russell được mô tả là "sensible and realistic" (hợp lý, thực tế) — trái ngược với "impractical" (không thực tế) trong câu hỏi. → NO`,

      37: `Vị trí: Đoạn 7.

Trích dẫn: "Similarly, Rodney Brooks, professor of robotics at Massachusetts Institute of Technology, writes that 'almost all innovations in robotics and AI take far, far, longer to be really widely deployed than people in the field and outside the field imagine'."

Phân tích: Bài chỉ trích dẫn quan điểm của Brooks, không hề đề cập việc quan điểm này có bị ai chỉ trích hay không. → NOT GIVEN`,

      38: `Vị trí: Đoạn 8.

Trích dẫn: "Many researchers have warned against the rolling out of AI without appropriate security standards and defence mechanisms. Still, AI security remains an often overlooked topic when machine learning systems are installed."

Phân tích: Bài nói an ninh AI THƯỜNG BỊ BỎ QUA (often overlooked), trái ngược hoàn toàn với ý "luôn được tính đến" (always taken into account) trong câu hỏi. → NO`,

      39: `Vị trí: Đoạn 9.

Trích dẫn: "If we are to reap the benefits and minimise the potential harms of AI, we must start thinking about how machine learning can be meaningfully applied... This means we need to have a discussion about AI ethics and the distrust that many people have towards machine learning."

Phân tích: Đúng như câu hỏi paraphrase — để hưởng lợi và giảm thiểu tác hại của AI, cần thảo luận/khám phá mối lo ngại (distrust) của công chúng. → YES`,

      40: `Vị trí: Toàn bài, đặc biệt đoạn cuối.

Trích dẫn: "These examples demonstrate that there is no AI solution for everything. Using AI simply for the sake of AI may not always be productive or useful, and not every issue is best addressed by applying machine intelligence to it. All solutions come with a cost and not everything that can be automated should be."

Phân tích: Chủ đề xuyên suốt bài là cảnh báo về giới hạn và rủi ro của AI, chứ không phải AI là giải pháp cho mọi vấn đề. → B "Why AI may not be the answer to our problems"`,
    },
  },
  // ── Cam 21 - Test 3 ──────────────────────────────────────────────────
  {
    title: 'Saving the saiga',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga's lungs in winter."

Phân tích: Lỗ mũi sưng phồng có chức năng lọc bụi (filter out dust) ra khỏi không khí hít vào.`,

      2: `Vị trí: Đoạn 2.

Trích dẫn: "...they filter out dust and cool the blood during hot, dry summers..."

Phân tích: Vào mùa hè, mũi giúp làm mát máu (blood) của saiga.`,

      3: `Vị trí: Đoạn 2.

Trích dẫn: "Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up."

Phân tích: Saiga mọc một lớp lông dày (coat) vào mùa đông và rụng đi khi thời tiết ấm lên.`,

      4: `Vị trí: Đoạn 4.

Trích dẫn: "Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners."

Phân tích: Saiga đực bị săn bắt chủ yếu vì sừng (horns) của chúng được giới y học cổ truyền ưa chuộng.`,

      5: `Vị trí: Đoạn 5.

Trích dẫn: "Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement."

Phân tích: Việc mở rộng nông nghiệp và khu dân cư làm thu hẹp môi trường sống (habitat) của saiga.`,

      6: `Vị trí: Đoạn 5.

Trích dẫn: "Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species."

Phân tích: Các rào chắn vật lý (đường sắt, ống dẫn, hàng rào) chặn các tuyến đường di cư (routes) theo mùa của saiga.`,

      7: `Vị trí: Đoạn 7.

Trích dẫn: "The steppe region has also become increasingly arid in recent years, and many of the smaller streams that the species normally depended on have dried up and vanished."

Phân tích: Biến đổi khí hậu khiến các dòng suối nhỏ (streams) mà saiga phụ thuộc bị khô cạn và biến mất.`,

      8: `Vị trí: Đoạn 1.

Trích dẫn: "Today, the saiga is largely confined to a single country: Kazakhstan. This country is estimated to be home to well over 90% of the global saiga population, with Russia, Mongolia and Uzbekistan accounting for the rest."

Phân tích: Hơn 90% quần thể saiga toàn cầu tập trung ở Kazakhstan, hoàn toàn không phân bố đều (evenly) giữa 4 quốc gia như câu hỏi nêu. → FALSE`,

      9: `Vị trí: Đoạn 3.

Trích dẫn: "Legal protection ensured its survival for a while, and numbers steadily recovered throughout most of the 20th century."

Phân tích: Số lượng saiga PHỤC HỒI (recovered) trong phần lớn thế kỷ 20, trái ngược với "falling" (suy giảm) trong câu hỏi. → FALSE`,

      10: `Vị trí: Đoạn 4.

Trích dẫn: "Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns in traditional medicine as an alternative to those of rhinos. Male saiga were almost wiped out, leading to a population crash..."

Phân tích: Nỗ lực bảo vệ tê giác châu Phi (khuyến khích dùng sừng saiga thay thế) đã gây ra hệ quả nghiêm trọng, khiến saiga đực gần như bị xoá sổ → có tác động đáng kể (dù là tiêu cực) đến quần thể saiga. → TRUE`,

      11: `Vị trí: Đoạn 7 (và toàn bài).

Trích dẫn: "Climate change poses a further threat. Although well adapted to cold winters and hot summers, saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate."

Phân tích: Bài chỉ nói về tác động của biến đổi khí hậu đến RIÊNG loài saiga, không hề so sánh mức độ đe doạ này với các khu vực khác trên thế giới. → NOT GIVEN`,

      12: `Vị trí: Đoạn 8.

Trích dẫn: "Its purpose is to protect and restore Kazakhstan's steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga."

Phân tích: Sáng kiến Altyn Dala được lập ra để bảo vệ nhiều loài (many species) trong hệ sinh thái, không chỉ riêng saiga. → TRUE`,

      13: `Vị trí: Đoạn 8.

Trích dẫn: "In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large-scale ecosystem restoration around the globe."

Phân tích: Bài chỉ nói về việc dự án được LHQ công nhận là "World Restoration Flagship", không hề đề cập việc danh hiệu này có mang lại thêm nguồn tài trợ quốc tế hay không. → NOT GIVEN`,
    },
  },
  {
    title: 'The problems of getting around the city of Dar es Salaam',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn 1.

Trích dẫn: "United Nations projections anticipate it will become a megacity within seven years as its population passes 10 million, reaching 13.4 million by 2035."

Phân tích: Bài chỉ đưa ra các dự báo dân số hiện tại, không hề so sánh với các dự báo TRƯỚC ĐÂY để kết luận tốc độ tăng có nhanh hơn dự đoán cũ hay không. → NOT GIVEN`,

      15: `Vị trí: Đoạn 2.

Trích dẫn: "Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city..."

Phân tích: Đa số cư dân sống trong các khu định cư MỘT TẦNG (single-storey), trái ngược với "high-rise blocks" (nhà cao tầng) trong câu hỏi. → FALSE`,

      16: `Vị trí: Đoạn 3.

Trích dẫn: "A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city."

Phân tích: Bài chỉ mô tả quy mô nhỏ bé của tuyến đường sắt ngoại ô, không hề đề cập việc cư dân có được tham vấn ý kiến về tuyến đường này hay không. → NOT GIVEN`,

      17: `Vị trí: Đoạn 4.

Trích dẫn: "Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy."

Phân tích: Hầu hết sự phát triển hiện tại diễn ra một cách tự phát (informally), không theo quy hoạch (unplanned). → TRUE`,

      18: `Vị trí: Đoạn 5.

Trích dẫn: "Unlike many cities on the continent, Dar es Salaam isn't trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus."

Phân tích: Dar es Salaam chọn hướng đi KHÁC với nhiều thành phố châu Phi khác (không xây tàu điện ngầm mà chọn xe buýt), trái ngược với ý "làm theo kế hoạch mà nhiều thành phố châu Phi đã áp dụng". → FALSE`,

      19: `Vị trí: Đoạn 6.

Trích dẫn: "The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages."

Phân tích: Xe buýt chạy trên các làn đường riêng (lanes) để giảm tình trạng dừng/chậm trễ.`,

      20: `Vị trí: Đoạn 6.

Trích dẫn: "Ticket purchase and control takes place at stations prior to boarding..."

Phân tích: Hành khách mua và kiểm soát vé TRƯỚC KHI lên xe (boarding).`,

      21: `Vị trí: Đoạn 6.

Trích dẫn: "...the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies."

Phân tích: Thiết kế không bậc thềm giúp người dùng xe lăn (wheelchairs) tiếp cận toàn bộ tuyến đường.`,

      22: `Vị trí: Đoạn 7.

Trích dẫn: "...complaining that drivers often refuse to turn on the air conditioning to save fuel."

Phân tích: Tài xế thường không bật điều hoà để tiết kiệm nhiên liệu (fuel).`,

      23: `Vị trí: Đoạn 8.

Trích dẫn: "A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day – half the expected capacity."

Phân tích: Trận lũ lụt (flood) nghiêm trọng tại kho xe chính đã gây ra tình trạng thiếu xe buýt.`,

      24: `Vị trí: Đoạn 8.

Trích dẫn: "Smartcards can't be used as the mechanical readers aren't working either, forcing passengers to buy individual paper tickets for every journey."

Phân tích: Do đầu đọc thẻ hỏng, hành khách không thể sử dụng thẻ thông minh (smartcards).`,

      25: `Vị trí: Đoạn 8.

Trích dẫn: "Staff stand by the gates and tear tickets as people enter."

Phân tích: Nhân viên đứng tại các cổng soát vé (gates) và xé vé thủ công thay vì dùng máy quét.`,

      26: `Vị trí: Đoạn 8.

Trích dẫn: "As a result, queues are considerable at peak times."

Phân tích: Hàng dài (queues) hình thành đáng kể vào giờ cao điểm do phải xếp hàng xé vé thủ công.`,
    },
  },
  {
    title: 'Rethinking the Past',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 2.

Trích dẫn: "One is the growing evidence that many supposedly 'advanced' behaviours... can be traced much further back in time than we thought... And the other is that we have badly misunderstood gender roles in prehistoric societies..."

Phân tích: Tác giả nêu rõ hai thay đổi/phát hiện quan trọng trong hiểu biết về thời tiền sử (hành vi "tiên tiến" xuất hiện sớm hơn; vai trò giới bị hiểu sai). → A "pinpointing some key changes in our understanding of prehistory"`,

      28: `Vị trí: Đoạn 6.

Trích dẫn: "Evolution usually works by incremental steps and so does technology. The first birds weren't great at flying, and the first mobile phones weren't great at, well, anything really."

Phân tích: Ví dụ về điện thoại di động đời đầu minh hoạ cho luận điểm rằng sự phát triển thường diễn ra dần dần, từng bước nhỏ. → A "most developments happen in a gradual way."`,

      29: `Vị trí: Đoạn 7.

Trích dẫn: "Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today's researchers are trying to unpick this stuff..."

Phân tích: "this stuff" chỉ những nghiên cứu trước đây bị ảnh hưởng bởi quan điểm gia trưởng lỗi thời — "unpick" nghĩa là các nhà nghiên cứu ngày nay đang xem xét/đánh giá lại chúng. → D "reevaluating research influenced by outdated beliefs about society."`,

      30: `Vị trí: Đoạn cuối.

Trích dẫn: "Inequality, authoritarianism and patriarchy aren't inevitable. They're choices, and prehistory shows us that we can choose differently."

Phân tích: Tác giả ngụ ý rằng việc nghiên cứu quá khứ cho thấy bất bình đẳng không phải điều tất yếu — con người ngày nay có thể lựa chọn khác đi, tức là hướng tới một xã hội công bằng hơn. → A "Studying past societies could help us create a fairer society today."`,

      31: `Vị trí: Đoạn 3.

Trích dẫn: "researchers found buried logs that had been shaped with stone tools so that they interlocked... This would be unsurprising if they weren't 476,000 years old. That's almost 200,000 years before our species, Homo sapiens, evolved."

Phân tích: Cấu trúc gỗ được chế tác tinh xảo có niên đại còn trước cả khi loài người hiện đại xuất hiện, cho thấy Homo sapiens không phải loài duy nhất có khả năng chế tác phức tạp. → E "Homo sapiens was probably not the only species capable of sophisticated workmanship."`,

      32: `Vị trí: Đoạn 3.

Trích dẫn: "we now know that extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago – upending the old notion that such environments were only settled by modern humans around 3,600 years ago."

Phân tích: Người Denisovan (loài đã tuyệt chủng) từng sinh sống ở vùng núi cao khắc nghiệt rất lâu trước khi loài người hiện đại xuất hiện ở đó. → F "other species managed to survive in harsh environments before the arrival of Homo sapiens."`,

      33: `Vị trí: Đoạn 8.

Trích dẫn: "a meta-analysis published in June 2023 compiled data on several dozen foraging societies and found women hunted in 80 per cent of them."

Phân tích: Nghiên cứu tháng 6/2023 cho thấy phụ nữ cũng tham gia săn bắt ở phần lớn xã hội hái lượm — trái với giả định trước đây rằng việc kiếm ăn/săn bắt chỉ do nam giới đảm nhiệm. → D "experts may have been mistaken about who looked for food in early human communities."`,

      34: `Vị trí: Đoạn 8.

Trích dẫn: "an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed, when proteins in her teeth were analysed."

Phân tích: Vị thủ lĩnh này thực chất là nữ chứ không phải nam như nhiều người từng cho là — cho thấy các giả định trước đây về việc ai nắm quyền lực trong xã hội tiền sử là không chính xác. → B "previous assumptions about who had power in the prehistoric world were inaccurate."`,

      35: `Vị trí: Đoạn 4.

Trích dẫn: "We have had evidence for a long time now that Neanderthals painted on cave walls. Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells."

Phân tích: Bài cho biết có thể có loài khác (Homo erectus) làm nghệ thuật còn SỚM HƠN cả Neanderthal, nên tranh vẽ trong hang của Neanderthal khó có thể là tác phẩm nghệ thuật đầu tiên. → NO`,

      36: `Vị trí: Đoạn 4.

Trích dẫn: "Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells."

Phân tích: Bài chỉ đề cập khả năng khắc hoa văn lên vỏ sò, hoàn toàn không nói về mức độ phổ biến hay hiếm gặp của loại hiện vật này. → NOT GIVEN`,

      37: `Vị trí: Đoạn 4–5.

Trích dẫn: "researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated." / "The dispute has only been heightened by the way the results were released, in a non-traditional journal..."

Phân tích: Bài chỉ nói cách CÔNG BỐ kết quả (qua một tạp chí phi truyền thống) là khác thường, chứ không đề cập PHƯƠNG PHÁP nghiên cứu/khảo sát tại hang Rising Star có gì bất thường hay không. → NOT GIVEN`,

      38: `Vị trí: Đoạn 4.

Trích dẫn: "researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated."

Phân tích: Cụm "have yet to be firmly dated" (chưa được xác định niên đại chắc chắn) cho thấy tuổi của các hình khắc này vẫn chưa rõ ràng. → YES`,

      39: `Vị trí: Đoạn 5.

Trích dẫn: "The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper."

Phân tích: Cách công bố kết quả (qua tạp chí phi truyền thống) đã làm tranh cãi xung quanh phát hiện này thêm gay gắt (heightened). → YES`,

      40: `Vị trí: Đoạn 5.

Trích dẫn: "At the same time, I think the species' small brains are a distraction... other properties, such as the brain's internal wiring, are surely equally important and may explain how a species like H. naledi might have been capable of complex behaviours, despite their small brains."

Phân tích: Tác giả cho rằng kích thước não chỉ là yếu tố GÂY XAO LÃNG (distraction) khỏi vấn đề thật sự, không phải yếu tố then chốt để xác định khả năng làm nghệ thuật — trái với ý câu hỏi. → NO`,
    },
  },
  // ── Cam 21 - Test 4 ──────────────────────────────────────────────────
  {
    title: 'The problems and benefits created by the spread of the water hyacinth in Kenya',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds."

Phân tích: Người Bỉ mang cây này đến vì thích vẻ đẹp của nó (glossy leaves, purple flowers) để trang trí trong ao — đúng là mục đích trang trí (decorative). → TRUE`,

      2: `Vị trí: Đoạn 2.

Trích dẫn: "it had 'escaped' out of the country via the Kagera river and made its way downstream to Lake Victoria."

Phân tích: Cây tự "trốn thoát" theo dòng sông Kagera đến hồ Victoria, không phải do ngư dân mang tới. → FALSE`,

      3: `Vị trí: Đoạn 3.

Trích dẫn: "the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants."

Phân tích: Thuyền bè gặp khó khăn (struggle) khi len lỏi qua đám thực vật dày đặc. → TRUE`,

      4: `Vị trí: Toàn bài không đề cập.

Phân tích: Bài chỉ nói bèo lục bình cản trở tuyến đường đánh cá và tạo nơi trú ẩn cho muỗi truyền bệnh, không hề đề cập việc các hoá chất do cây tiết ra ảnh hưởng đến số lượng cá. → NOT GIVEN`,

      5: `Vị trí: Đoạn 3.

Trích dẫn: "About three out of four families in Kenya depend on wood or charcoal to cook their daily meals... Using solid fuels like these for cooking increases indoor pollution."

Phân tích: Bài chỉ nói chung về tác hại của nhiên liệu rắn (gỗ và than củi), không so sánh cụ thể mức độ độc hại giữa than củi và gỗ. → NOT GIVEN`,

      6: `Vị trí: Đoạn 4.

Trích dẫn: "on the shores of Lake Victoria, huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight."

Phân tích: Người dân vẫn vớt được những đống bèo khổng lồ (huge piles) ra khỏi hồ, tức là hoàn toàn không phải "không thể" loại bỏ. → FALSE`,

      7: `Vị trí: Đoạn 4.

Trích dẫn: "It's a magic combination that has captivated researchers' imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel."

Phân tích: Các nhà khoa học bắt đầu nghiên cứu tiềm năng biogas của bèo lục bình từ những năm 1980 — tức là thế kỷ trước (thế kỷ 20). → TRUE`,

      8: `Vị trí: Đoạn 6.

Trích dẫn: "The community received a pair of donated biogas digesters – machines that would transform a mix of water hyacinth and cow dung into biogas for cooking."

Phân tích: Hỗn hợp đưa vào máy phân huỷ gồm bèo lục bình và phân bò (cow dung).`,

      9: `Vị trí: Đoạn 7.

Trích dẫn: "The mixture goes in one end... and over the next 20 to 30 days, it goes through a fermentation process and breaks down, giving off gas that comes out the other end."

Phân tích: Hỗn hợp trải qua quá trình lên men (fermentation process) trong 20-30 ngày.`,

      10: `Vị trí: Đoạn 7.

Trích dẫn: "From there, the clean-burning gas is passed through pipes to the point of use, just like traditional domestic gas."

Phân tích: Khí gas được dẫn tới nơi sử dụng qua hệ thống ống (pipes).`,

      11: `Vị trí: Đoạn 8.

Trích dẫn: "they don't have to devote a lot of time every day to gathering firewood, which is a great relief."

Phân tích: Phụ nữ không còn phải tốn nhiều thời gian (time) mỗi ngày để đi lấy củi.`,

      12: `Vị trí: Đoạn 8.

Trích dẫn: "As a result, they're able to make more money for their families from other enterprises."

Phân tích: Nhờ tiết kiệm thời gian, họ có thể kiếm thêm tiền (money) từ các công việc khác.`,

      13: `Vị trí: Đoạn 10.

Trích dẫn: "unless the price of the machines drops, it's pretty clear that most communities will never be able to afford any, since they sell for about $750."

Phân tích: Giá thành (price) của máy phân huỷ biogas là rào cản khiến hầu hết các cộng đồng không đủ khả năng mua.`,
    },
  },
  {
    title: "How could multilingualism benefit India's poorest schoolchildren?",
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn 1.

Trích dẫn: "The crowded and bustling streets of Delhi teem with life... as more than 20 million people go about their daily lives."

Phân tích: Delhi có mật độ dân số dày đặc (dense population) với hơn 20 triệu người sinh sống.`,

      15: `Vị trí: Đoạn 1.

Trích dẫn: "many millions more have recently made India's capital their home, having moved from surrounding neighbourhoods, cities and states or across the country..."

Phân tích: Những người mới chuyển đến sinh sống ở Delhi chính là những người nhập cư mới (new immigrants).`,

      16: `Vị trí: Đoạn 1.

Trích dẫn: "having moved from surrounding neighbourhoods, cities and states or across the country..."

Phân tích: "surrounding neighbourhoods" (khu vực lân cận) được diễn đạt lại thành "nearby district".`,

      17: `Vị trí: Đoạn 1.

Trích dẫn: "...often in the hope of gaining better jobs and a better life."

Phân tích: Họ đến Delhi với hy vọng có được cơ hội việc làm (employment opportunities) tốt hơn.`,

      18: `Vị trí: Đoạn 2.

Trích dẫn: "The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why..."

Phân tích: "overriding aim" (mục tiêu bao trùm) được diễn đạt lại thành "primary objective" (mục tiêu chính).`,

      19: `Vị trí: Đoạn 2.

Trích dẫn: "...the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren."

Phân tích: Học sinh Ấn Độ không có được những lợi ích tương tự (similar advantages) mà học sinh đa ngôn ngữ ở châu Âu có được.`,

      20: `Vị trí: Đoạn 3.

Trích dẫn: "over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task."

Phân tích: Tỉ lệ trẻ 10 tuổi KHÔNG đọc trôi chảy (hơn 50%) còn CAO HƠN tỉ lệ không giải được bài toán trừ (dưới 50%) — nghĩa là các em làm bài đọc kém hơn (không phải tốt hơn) so với bài toán. → NO`,

      21: `Vị trí: Đoạn 3.

Trích dẫn: "low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students."

Phân tích: Bài chỉ nói học sinh nữ bị ảnh hưởng nhiều hơn bởi tình trạng bỏ học, không hề đề cập việc Tsimpli gặp khó khăn thuyết phục các em nữ THAM GIA nghiên cứu. → NOT GIVEN`,

      22: `Vị trí: Đoạn 4.

Trích dẫn: "Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home."

Phân tích: Đúng như câu hỏi paraphrase — nhóm nghiên cứu muốn tìm hiểu mối liên hệ giữa kết quả học tập kém và việc học bằng ngôn ngữ không quen thuộc. → YES`,

      23: `Vị trí: Đoạn 5.

Trích dẫn: "They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves."

Phân tích: Nhóm nghiên cứu CÓ dự định xem xét cả phương pháp giảng dạy (teaching practices), trái ngược với ý "quyết định không nghiên cứu" trong câu hỏi. → NO`,

      24: `Vị trí: Đoạn 6.

Trích dẫn: "the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school... English instruction for children from low socio-economic areas might not be the best way for them to learn."

Phân tích: Việc dạy bằng tiếng Anh có thể gây bất lợi thêm cho trẻ em nghèo, những em vốn đã ít tiếp xúc với ngôn ngữ này. → C "Poor children may be disadvantaged further by being instructed in English."`,

      25: `Vị trí: Đoạn 7.

Trích dẫn: "We are not suggesting that English be withdrawn – that ship has sailed – but we perhaps have to think more about learner needs."

Phân tích: "that ship has sailed" (con tàu đã rời bến) là thành ngữ chỉ việc gì đó đã quá muộn để thay đổi — ở đây nghĩa là quá muộn để loại bỏ hoàn toàn tiếng Anh khỏi việc giảng dạy. → D "It is too late to remove English completely as a language of instruction in schools."`,

      26: `Vị trí: Đoạn 8.

Trích dẫn: "an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks)."

Phân tích: Phát hiện bất ngờ là khả năng đọc viết/tính toán của trẻ em khu ổ chuột không hề thấp hơn (thậm chí có thể vượt trội) so với trẻ em nghèo đô thị khác. → D "The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds."`,
    },
  },
  {
    title: 'The Globemakers: The Curious Story of an Ancient Craft',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined."

Phân tích: Việc tưởng chừng đơn giản hoá ra lại là một nhiệm vụ đầy thách thức (challenging task), kéo dài cả thập kỷ.`,

      28: `Vị trí: Đoạn 1.

Trích dẫn: "...marked by a series of obstacles that would have deterred anyone less determined."

Phân tích: "a series of obstacles" (hàng loạt trở ngại) được diễn đạt lại thành "numerous problems".`,

      29: `Vị trí: Đoạn 2.

Trích dẫn: "obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs."

Phân tích: Việc mua một quả địa cầu không đơn giản như một lần đặt hàng qua mạng (internet purchase).`,

      30: `Vị trí: Đoạn 3.

Trích dẫn: "Bellerby came across shoddy commercial versions designed for school classrooms and genuine antiques in auction houses that would have bust his budget."

Phân tích: "shoddy commercial versions" (những phiên bản thương mại kém chất lượng) được diễn đạt lại thành "inferior makes".`,

      31: `Vị trí: Đoạn 3.

Trích dẫn: "...shoddy commercial versions designed for school classrooms..."

Phân tích: Những phiên bản kém chất lượng này được thiết kế cho mục đích giáo dục (educational use) — dùng trong lớp học.`,

      32: `Vị trí: Đoạn 3.

Trích dẫn: "Even his trips to Morocco and India, where surely the knowledge of artisan cartographers had been preserved, drew a blank."

Phân tích: Ông hy vọng tìm được nơi còn lưu giữ kỹ năng cần thiết (necessary skills) làm địa cầu thủ công, nhưng không thành công.`,

      33: `Vị trí: Đoạn 2.

Trích dẫn: "contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE."

Phân tích: Bài khẳng định quan niệm phổ biến rằng tổ tiên chúng ta thiếu hiểu biết về địa lý là SAI (contrary to) — con người đã biết trái đất hình cầu từ rất sớm. → NO`,

      34: `Vị trí: Đoạn 2.

Trích dẫn: "The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball..."

Phân tích: Bài chỉ nêu việc Plato so sánh trái đất với quả bóng da, không hề đề cập việc ông có bị chỉ trích vì điều này hay không. → NOT GIVEN`,

      35: `Vị trí: Đoạn 2.

Trích dẫn: "the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE."

Phân tích: Bài chỉ nói Crates of Mallus là người đầu tiên làm ra quả địa cầu được ghi nhận, không đề cập đến độ chính xác của nó. → NOT GIVEN`,

      36: `Vị trí: Đoạn 2.

Trích dẫn: "Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find."

Phân tích: Bellerby ban đầu tin rằng việc tìm một quả địa cầu chất lượng tốt sẽ không khó khăn gì. → YES`,

      37: `Vị trí: Đoạn 5.

Trích dẫn: "Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre..."

Phân tích: Ông phát hiện ra một vấn đề bất ngờ (unexpected issue) — giấy bị giãn ra khiến các mảnh bản đồ không khớp hoàn toàn. → B "he became aware of an unexpected issue."`,

      38: `Vị trí: Đoạn 6.

Trích dẫn: "Bellerby clearly found a kindred spirit in Martin Behaim..." / "Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli..."

Phân tích: Người viết nhắc đến các nhà làm địa cầu xưa vì Bellerby có những điểm chung với từng người trong số họ (kindred spirit, tham vọng tương đồng). → C "Bellerby had something in common with each of them."`,

      39: `Vị trí: Đoạn 7.

Trích dẫn: "Bellerby's book is also a lament for the fading away of centuries-old traditions... many of these have now retired or passed away."

Phân tích: Cuốn sách của Bellerby còn là một lời than tiếc (lament) cho sự mai một của các kỹ năng làm địa cầu truyền thống. → D "He regrets the loss of many globe-making skills."`,

      40: `Vị trí: Đoạn cuối.

Trích dẫn: "His book... is hardly a blueprint for commercial success."

Phân tích: Người viết nhận xét cuốn sách không phải là một "bản thiết kế" hướng dẫn cách kinh doanh thành công. → A "It does not tell you how to create a profitable business."`,
    },
  },
];

async function runSeedExplanations() {
  const results = [];
  for (const target of TARGETS_EXPL) {
    const doc = await Passage.findOne({ title: target.title, category: target.category });
    if (!doc) {
      throw new Error(`Passage not found: "${target.title}" (${target.category}) — seed the passage itself first.`);
    }

    const allQuestions = [
      ...doc.questions,
      ...doc.questionGroups.flatMap(g => g.questions),
    ];
    const byNumber = new Map(allQuestions.map(q => [q.questionNumber, q]));

    const missing = Object.keys(target.explanations).map(Number).filter(n => !byNumber.has(n));
    if (missing.length) {
      throw new Error(`Question number(s) not found on "${target.title}": ${missing.join(', ')}`);
    }

    let updated = 0;
    for (const [numStr, text] of Object.entries(target.explanations)) {
      const q = byNumber.get(Number(numStr));
      if (q.explanation !== text) { q.explanation = text; updated++; }
    }

    if (updated === 0) {
      console.log(`[SeedReadingExplanations] "${target.title}" (${target.category}) — explanations already up to date, nothing to save.`);
    } else {
      await doc.save();
      console.log(`[SeedReadingExplanations] "${target.title}" (${target.category}, _id=${doc._id}) — updated ${updated}/${Object.keys(target.explanations).length} explanations.`);
    }
    results.push(doc);
  }
  return results;
}


// Reading de 1-21: adds the missing "Bondi" passage (Passage 1). Its two
// sibling passages from the same source test — "The economic effect of
// climate" (passage2) and "A closer examination of a study on verbal and
// non-verbal messages" (passage3) — already existed in the DB as standalone
// practice passages (isActualTest:false), but Passage 1 was never created,
// so it never appeared as a "Reading lẻ" option. Content transcribed from
// reading material/Reading de 1-21_resized.pdf (cleaned of the PDF's
// font-cmap corruption — see reading material/clean_extract.py) and cross-
// checked directly against the source passage; no separate answer key exists
// in the PDF, so correctAnswer/explanation values were derived by reading
// the passage.

const CONTENT = `<h2>Bondi</h2>
<p><em>Bondi is Australia's most famous beach, but how did this come about?</em></p>

<p>Australians have not always valued Sydney's Bondi Beach. Beaches attracted little attention in the first century of British colonial settlement, when it was the country's desert interior that stirred the settlers' imagination. The visual image of Australia was based on stories of explorers searching in the dry red centre for an inland sea, of men driving cattle vast distances, or shearing sheep in hot dusty sheds. It was a cultural landscape developed in hardship and tragedy.</p>

<p>Before the British settlement, there had been a strong traditional connection to the coast among Aboriginal people, the indigenous inhabitants of Australia, and evidence of this connection can still be seen. In 1788 Governor Phillip, who established the first British settlement on the eastern coast of Australia, estimated that there were approximately 1500 Aboriginal people living within a 10-mile radius of Sydney Harbour. But by the 1820s the local Aboriginal population had largely disappeared as a result of contact with the diseases brought by the settlers. In the minds of the new settlers, Aboriginal culture would come to be predominantly associated with the inland desert. The cultural associations that formed around Australia's beach landscape would, in turn, be almost entirely European in nature. Compared with the 'ancient' and bicultural mythology of Australia's interior, its beach culture would be depicted as being wholly modern and Western.</p>

<p>At the end of the 19th century, the beach emerged in art and literature as an alternative cultural landscape to the mythology of the interior. The two settings were similar in that they shared an idea of purity because of their association with nature, but otherwise they represented vastly different qualities. The interior of the country represented hard work and suffering, while the coast evoked images of health, leisure and egalitarianism.</p>

<p>In Britain, the association of beaches with health received royal blessing in 1783 when a prominent member of the royal family attended the health spas at Brighton Beach on the English coast, and built a pavilion there. With its entertainment, hotels and weekend villas, Brighton became the model for beaches throughout Britain's colonies. Reflecting the English resort's influence, seven Sydney beach suburbs still have a Brighton Street. Sydney's beach suburbs, rising to prominence in the late 19th century, shared Brighton's association with health. The perception of the city's beaches as places of purity and well-being was strengthened by contrast with the increasingly polluted city centre.</p>

<p>By the end of the 19th century, Sydney's beaches had begun to differ in their socio-economic characteristics. The beach in the suburb of Coogee was the first ocean beach to become accessible by tram from the city. Promoted as a garden suburb, Coogee became a recreational meeting place for the city's middle class. The suburb of Manly, with its beach and esplanade, copied the British resort model, and attracted the city's wealthy class living in the northern suburbs as well as holiday-makers from farms in the countryside.</p>

<p>The suburb of Bondi was developed after Coogee and Manly and took on a character distinct from the city's other beach suburbs. With the extension of the tramline to Bondi in the 1890s, a number of substantial properties were built there. Property developers, expecting continued middle-class development, subdivided the area into house-sized plots. However, a sudden demand for housing in the first decade of the 20th century saw the plans for houses put aside, and investors built blocks of flats instead. A treeless plain of red-roofed apartments began to spread its way across Bondi. Built with cheap local bricks, the size and quality of the apartments were generally more modest than those in neighbouring suburbs, and quickly attracted a population of rent-paying, working-class tenants.</p>

<p>With tram access extended all the way to the beach, Bondi also became the most accessible ocean beach to people living in the inner city, who were mostly working class. The pleasures of the sun, sea and surf were not only for the wealthy, but free to all. The Australian notion of beaches as places of social equality became established, and Bondi exemplified this precisely.</p>

<p>Bondi's identity as a largely working-class suburb began to change in the 1950s. The suburb and its beach first came to international attention in 1954 when Queen Elizabeth of England and her husband Prince Philip attended a surf carnival there. Since then, Bondi has become one of Sydney's most used sites for large-scale public events. The film industry quickly built on the fame that Bondi beach acquired as a result of the surf carnival, and since then it has been the location of many Australian films. With the expanding use of Bondi as a media setting, the suburb became home to a community of artists as well as film and television workers. Since the 1970s Bondi has become the almost inevitable backdrop for any artistic or commercial project in Sydney that requires a beach setting. Bondi is now famous simply for being famous.</p>

<p>In the preparations for the 2000 Olympic Games, Bondi was nominated to host the 10,000-seat beach volleyball stadium. Some people in the Bondi community did not support the proposal because of concerns for the environment, but the opposition was dismissed by the Olympics Organising Committee. There were good practical reasons for the Committee to support Bondi's hosting of the event, but the main reason the Committee insisted the stadium be built there was the international expectation that Bondi, as Australia's best known beach, would be the stadium's scenic backdrop.</p>`;

const TARGET_BONDI = {
  title: 'Bondi',
  category: 'passage1',
  content: CONTENT,
  questionRange: { start: 1, end: 13 },
  isActualTest: false,
  isActive: true,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
      questions: [
        { questionNumber: 1, type: 'true-false-ng', questionText: 'Bondi beach has been popular since the arrival of the first British settlers in Australia.', correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 1. Trích dẫn: "Beaches attracted little attention in the first century of British colonial settlement." Phân tích: bãi biển hầu như không được chú ý trong thế kỷ đầu tiên sau khi người Anh định cư, trái với ý "phổ biến ngay từ đầu".' },
        { questionNumber: 2, type: 'true-false-ng', questionText: 'Aborigines in the centre of Australia had a different culture from those on the coast.', correctAnswer: 'NOT GIVEN', explanation: 'Vị trí: đoạn 2. Phân tích: bài chỉ nói văn hoá thổ dân sau này được người định cư gắn với sa mạc nội địa trong nhận thức của họ, chứ không hề so sánh hay khẳng định có hai nền văn hoá thổ dân khác nhau giữa vùng nội địa và vùng biển.' },
        { questionNumber: 3, type: 'true-false-ng', questionText: 'Contemporary Australian beach culture reflects Aboriginal traditions.', correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 2. Trích dẫn: "The cultural associations that formed around Australia\'s beach landscape would...be almost entirely European in nature." Phân tích: văn hoá bãi biển mang tính châu Âu, không phản ánh truyền thống thổ dân.' },
        { questionNumber: 4, type: 'true-false-ng', questionText: 'At the end of the 19th century, some parts of Australia were associated with a difficult life.', correctAnswer: 'TRUE', explanation: 'Vị trí: đoạn 3. Trích dẫn: "The interior of the country represented hard work and suffering." Phân tích: vùng nội địa gắn với lao động vất vả và khổ đau — đúng là "cuộc sống khó khăn".' },
        { questionNumber: 5, type: 'true-false-ng', questionText: "Sydney's beach suburbs were influenced by a seaside town in England.", correctAnswer: 'TRUE', explanation: 'Vị trí: đoạn 4. Trích dẫn: "Brighton became the model for beaches throughout Britain\'s colonies...seven Sydney beach suburbs still have a Brighton Street." Phân tích: các khu bãi biển Sydney chịu ảnh hưởng trực tiếp từ thị trấn biển Brighton của Anh.' },
        { questionNumber: 6, type: 'true-false-ng', questionText: "At the end of the 19th century, Sydney's beaches were regarded as unhealthy places to be.", correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 4. Trích dẫn: "Sydney\'s beach suburbs...shared Brighton\'s association with health. The perception of the city\'s beaches as places of purity and well-being was strengthened..." Phân tích: ngược lại, bãi biển được xem là nơi lành mạnh, tốt cho sức khoẻ.' },
      ],
    },
    {
      groupType: 'plain',
      instruction: 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.',
      questions: [
        { questionNumber: 7, type: 'fill-blank', questionText: 'What form of public transport could people use to get to the beach at the end of the 19th century?', correctAnswer: 'tram', explanation: 'Vị trí: đoạn 5. Trích dẫn: "The beach in the suburb of Coogee was the first ocean beach to become accessible by tram from the city." Phân tích: phương tiện công cộng được nhắc đến là "tram" (xe điện).' },
        { questionNumber: 8, type: 'fill-blank', questionText: 'Which beachside suburb was popular with people from rural areas?', correctAnswer: 'Manly', explanation: 'Vị trí: đoạn 5. Trích dẫn: "The suburb of Manly...attracted...holiday-makers from farms in the countryside." Phân tích: Manly thu hút cả người đi nghỉ từ các nông trại ở nông thôn.' },
        { questionNumber: 9, type: 'fill-blank', questionText: "Which suburb helped to meet the needs of Sydney's accommodation shortage?", correctAnswer: 'Bondi', explanation: 'Vị trí: đoạn 6. Trích dẫn: "a sudden demand for housing in the first decade of the 20th century saw the plans for houses put aside, and investors built blocks of flats instead" (nói về Bondi). Phân tích: Bondi được xây thành các khối căn hộ để đáp ứng nhu cầu nhà ở tăng đột biến.' },
        { questionNumber: 10, type: 'fill-blank', questionText: 'When did British royalty visit Bondi?', correctAnswer: '1954', explanation: 'Vị trí: đoạn 8. Trích dẫn: "in 1954 when Queen Elizabeth of England and her husband Prince Philip attended a surf carnival there." Phân tích: Nữ hoàng Anh và Hoàng thân Philip đến Bondi năm 1954.' },
        { questionNumber: 11, type: 'fill-blank', questionText: 'Which industry is Bondi now associated with?', correctAnswer: 'the film industry', explanation: 'Vị trí: đoạn 8. Trích dẫn: "The film industry quickly built on the fame that Bondi beach acquired...it has been the location of many Australian films." Phân tích: Bondi hiện gắn liền với ngành công nghiệp điện ảnh.' },
        { questionNumber: 12, type: 'fill-blank', questionText: 'What sporting event at the 2000 Olympic Games was held at Bondi?', correctAnswer: 'beach volleyball', explanation: 'Vị trí: đoạn 9. Trích dẫn: "Bondi was nominated to host the 10,000-seat beach volleyball stadium." Phân tích: môn thể thao được tổ chức tại Bondi là bóng chuyền bãi biển.' },
        { questionNumber: 13, type: 'fill-blank', questionText: 'What did people think could be damaged by building a stadium on Bondi Beach?', correctAnswer: 'the environment', explanation: 'Vị trí: đoạn 9. Trích dẫn: "Some people in the Bondi community did not support the proposal because of concerns for the environment." Phân tích: người dân lo ngại việc xây sân vận động sẽ ảnh hưởng đến môi trường.' },
      ],
    },
  ],
};

async function runSeedBondi() {
  const existing = await Passage.findOne({ title: TARGET_BONDI.title, category: TARGET_BONDI.category });
  if (existing) {
    console.log(`[SeedReadingBondi] "${TARGET_BONDI.title}" already exists — no changes made.`);
    return;
  }
  await Passage.create(TARGET_BONDI);
  console.log(`[SeedReadingBondi] Created "${TARGET_BONDI.title}" with real content, isActive:true.`);
}


// Creates 20 fixed Reading ReadingTest docs ("Actual Mocktest 1".."Actual
// Mocktest 20"), each pinned to a specific passage1+passage2+passage3
// triplet via the new ReadingTest.passageIds field (see readingService.js
// startTest()) — as opposed to the existing "MockTest Đề Random" test,
// which keeps randomly sampling 3 passages every attempt.
//
// The 20 triplets come from Passage.tags — passages tagged with a
// "<Series> - Test N" pattern (e.g. "Cam 20 - Test 3") are already grouped
// by which original Cambridge test they came from. Verified live: exactly
// 20 complete (passage1+2+3 all present) tagged triplets exist across
// Cam 15/16/17/20/21, Test 1-4 each. Ordered by series then test number so
// "Actual Mocktest 1" == Cam 15 Test 1, ... "Actual Mocktest 20" == Cam 21
// Test 4 — an arbitrary but stable, reproducible numbering.
//
// Run: node scripts/seedActualReadingMocktests.js

const SERIES = ['Cam 15', 'Cam 16', 'Cam 17', 'Cam 20', 'Cam 21'];
const TEST_NUMBERS = [1, 2, 3, 4];

async function runSeedMocktests() {
  const Passage = require('../models/Passage');
  const ReadingTest = require('../models/ReadingTest');

  const passages = await Passage.find(
    { isActualTest: true, isActive: true, tags: { $exists: true, $ne: [] } },
    'title category tags'
  ).lean();

  const groups = {};
  passages.forEach(p => {
    const testTag = (p.tags || []).find(t => /Test \d+$/.test(t));
    if (!testTag) return;
    if (!groups[testTag]) groups[testTag] = {};
    groups[testTag][p.category] = p;
  });

  let mocktestNumber = 0;
  let created = 0, skipped = 0;

  for (const series of SERIES) {
    for (const n of TEST_NUMBERS) {
      const tag = `${series} - Test ${n}`;
      const g = groups[tag];
      mocktestNumber++;
      const name = `Actual Mocktest ${mocktestNumber}`;

      if (!g || !g.passage1 || !g.passage2 || !g.passage3) {
        console.warn(`[SeedActualReadingMocktests] SKIP "${name}" — incomplete triplet for tag "${tag}"`);
        skipped++;
        continue;
      }

      const existing = await ReadingTest.findOne({ name });
      if (existing) {
        console.log(`[SeedActualReadingMocktests] "${name}" already exists (_id=${existing._id}) – skip`);
        continue;
      }

      const doc = await ReadingTest.create({
        name,
        seriesName: 'Actual Mocktest',
        testNumber: mocktestNumber,
        isActive: true,
        passageIds: [g.passage1._id, g.passage2._id, g.passage3._id],
      });
      console.log(`[SeedActualReadingMocktests] Created "${name}" (_id=${doc._id}) <- ${tag}: "${g.passage1.title}" / "${g.passage2.title}" / "${g.passage3.title}"`);
      created++;
    }
  }

  console.log(`\n[SeedActualReadingMocktests] Done. created=${created} skipped=${skipped} (out of ${mocktestNumber} targets).`);
}


// Continues the numbering from seedActualReadingMocktests.js (which used
// the 20 tagged "<Series> - Test N" triplets to create "Actual Mocktest
// 1".."Actual Mocktest 20"). This script covers the remaining isActualTest
// passages that have NO tag grouping them to a specific original test —
// per the user's explicit instruction, these are combined arbitrarily:
// shuffle each category pool, then pair one passage1 + one passage2 + one
// passage3 (in list order after shuffling) per new test. There is no
// content relationship between the 3 passages in each of these tests
// beyond "assembled to fill out a full-length mock" — unlike Mocktest
// 1-20, which are genuine original-test triplets.
//
// Counts are uneven (verified live: 20 passage1 / 17 passage2 / 18
// passage3), so the number of triplets is capped by the smallest pool
// (17) — leftover passages that can't complete a triplet are reported and
// left untouched (still usable individually via "Reading lẻ").
//
// Run: node scripts/seedActualReadingMocktestsUntagged.js

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function runSeedMocktestsUntagged() {
  const Passage = require('../models/Passage');
  const ReadingTest = require('../models/ReadingTest');

  const untagged = await Passage.find(
    { isActualTest: true, isActive: true, $or: [{ tags: { $exists: false } }, { tags: [] }] },
    'title category'
  ).lean();

  const byCategory = { passage1: [], passage2: [], passage3: [] };
  untagged.forEach(p => byCategory[p.category]?.push(p));

  const p1 = shuffle(byCategory.passage1);
  const p2 = shuffle(byCategory.passage2);
  const p3 = shuffle(byCategory.passage3);
  const tripletCount = Math.min(p1.length, p2.length, p3.length);

  const existingMax = (await ReadingTest.find({ seriesName: 'Actual Mocktest' }, 'testNumber').lean())
    .reduce((max, t) => Math.max(max, t.testNumber || 0), 0);

  let created = 0;
  for (let i = 0; i < tripletCount; i++) {
    const mocktestNumber = existingMax + i + 1;
    const name = `Actual Mocktest ${mocktestNumber}`;

    const existing = await ReadingTest.findOne({ name });
    if (existing) {
      console.log(`[SeedActualReadingMocktestsUntagged] "${name}" already exists (_id=${existing._id}) – skip`);
      continue;
    }

    const doc = await ReadingTest.create({
      name,
      seriesName: 'Actual Mocktest',
      testNumber: mocktestNumber,
      isActive: true,
      passageIds: [p1[i]._id, p2[i]._id, p3[i]._id],
    });
    console.log(`[SeedActualReadingMocktestsUntagged] Created "${name}" (_id=${doc._id}) <- "${p1[i].title}" / "${p2[i].title}" / "${p3[i].title}"`);
    created++;
  }

  const leftover = [
    ...p1.slice(tripletCount).map(p => p.title + ' (passage1)'),
    ...p2.slice(tripletCount).map(p => p.title + ' (passage2)'),
    ...p3.slice(tripletCount).map(p => p.title + ' (passage3)'),
  ];
  console.log(`\n[SeedActualReadingMocktestsUntagged] Done. created=${created} (pools: p1=${p1.length} p2=${p2.length} p3=${p3.length}).`);
  if (leftover.length) {
    console.log(`[SeedActualReadingMocktestsUntagged] Left unpaired (still usable individually via Reading lẻ): ${leftover.join(', ')}`);
  }
}


// Adds ["Cam XX", "Cam XX - Test Y"] tags (matching the existing Cam21
// convention) to untagged Passage docs identified — via web search against
// public IELTS-prep answer-key sites — as belonging to Cambridge IELTS 15,
// 16, 17 and 20. Metadata-only change: titles/book/test attribution, no
// passage content is touched.

const MAP_TAG = [
  // Cam 20
  ['The kākāpō', 20, 1], ['To Britain', 20, 1], ['How stress affects our judgement', 20, 1],
  ['Manatees(kon bòa bỉn á)', 20, 2], ['Procrastination', 20, 2], ['Invasion of the Robot Umpires', 20, 2],
  ['Frozen Food', 20, 3], ["Can the planet’s coral reefs be saved?", 20, 3], ['Robots and us', 20, 3],
  ['Georgia O’Keeffe', 20, 4], ['Adapting to the effects of climate change', 20, 4], ['A new role for livestock guard dogs', 20, 4],
  // Cam 15
  ['Nutmeg – a valuable spice', 15, 1], ['Driverless cars', 15, 1], ['What is exploration?', 15, 1],
  ['Could urban engineers learn from dance ?', 15, 2], ['Should we try to bring extinct species back to life?', 15, 2], ['Having a laugh', 15, 2],
  ['Henry Moore (1898-1986)', 15, 3], ['The Desolenator: producing clean water', 15, 3], ['Why fairy tales are really scary tales', 15, 3],
  ['The return of the huarango', 15, 4], ['Silbo Gomero – the whistle ‘language’ of the Canary Islands', 15, 4], ['Environmental practices of big businesses', 15, 4],
  // Cam 16
  ['Why we need to protect polar bears', 16, 1], ['The Step Pyramid of Djoser', 16, 1], ['The future of work', 16, 1],
  ['The White Horse of Uffington', 16, 2], ['I contain multitudes', 16, 2], ['How to make wise decisions', 16, 2],
  ['Roman shipbuilding and navigation', 16, 3], ['Climate change reveals ancient artefacts in Norway’s glaciers', 16, 3], ["Plant ‘thermometer’ triggers springtime growth by measuring night-time heat", 16, 3],
  ['Roman tunnels', 16, 4], ['Changes in reading habits', 16, 4], ['Attitudes towards Artificial Intelligence', 16, 4],
  // Cam 17
  ['The development of the London underground railway', 17, 1], ['Stadiums: past, present and future', 17, 1], ['To catch a king', 17, 1],
  ['The Dead Sea Scrolls', 17, 2], ['A second attempt at domesticating the tomato', 17, 2], ['Insight or evolution?', 17, 2],
  ['The thylacine', 17, 3], ['Palm oil', 17, 3], ["Building the Skyline: The Birth and Growth of Manhattan's Skyscrapers", 17, 3],
  ['Bats to the rescue', 17, 4], ['Does education fuel economic growth?', 17, 4], ['Timur Gareyev – blindfold chess champion', 17, 4],
];

async function runTagCambridge() {
  let tagged = 0, notFound = 0, alreadyTagged = 0;
  for (const [title, book, testNum] of MAP_TAG) {
    const p = await Passage.findOne({ title });
    if (!p) {
      console.log(`NOT FOUND: "${title}"`);
      notFound++;
      continue;
    }
    if (p.tags && p.tags.some(t => t.startsWith('Cam'))) {
      alreadyTagged++;
      continue;
    }
    p.tags = [`Cam ${book}`, `Cam ${book} - Test ${testNum}`];
    await p.save();
    tagged++;
  }
  console.log(`\n[TagCambridgeReadingPassages] Done. tagged=${tagged} notFound=${notFound} alreadyTagged=${alreadyTagged} (out of ${MAP_TAG.length} targets).`);
}


async function runSeed() {
  await runSeedPassages();
  await runSeedExplanations();
  await runSeedBondi();
  await runSeedMocktests();
  await runSeedMocktestsUntagged();
  await runTagCambridge();
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingContent] FAILED', e); process.exit(1); });
}

module.exports = {
  runSeed,
  runSeedPassages, runSeedExplanations, runSeedBondi,
  runSeedMocktests, runSeedMocktestsUntagged, runTagCambridge,
  PASSAGES_MAIN, TARGETS_EXPL, TARGET_BONDI, SERIES, TEST_NUMBERS, MAP_TAG,
};
