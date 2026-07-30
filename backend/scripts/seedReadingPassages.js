// Generic one-off content seed for Reading — inserts the PASSAGES array below
// as normal, independent Passage documents (one per category: passage1/2/3),
// exactly matching how admin's "Passages" page manages content. Unlike
// Listening, a ReadingTest document does NOT reference specific passages —
// the exam engine randomly pools 3 active passages per category at attempt
// time (see backend/models/ReadingTest.js comment) — so there is nothing to
// "bundle" here; each Passage is fully self-contained and independently
// editable in admin (title, content, question groups, difficulty, tags...).
//
// Reused per reading test: edit PASSAGES below to the next set of 3
// passages, then run `node scripts/seedReadingPassages.js` from backend/.
// Safe to re-run — skips any passage whose exact title already exists.
// Each past run's content is preserved in git history under this filename.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const PASSAGES = [
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

async function runSeed() {
  const results = [];
  for (const p of PASSAGES) {
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

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingPassages] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, PASSAGES };
