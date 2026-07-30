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
    title: 'The Davies Sisters',
    category: 'passage1',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 1'],
    questionRange: { start: 1, end: 13 },
    content: `<p><strong>The Davies Sisters</strong></p>
<p><em>Between 1908 and 1924, Gwendoline and Margaret Davies amassed one of the largest collections of late-nineteenth and early-twentieth-century French paintings in Britain</em></p>
<p>Gwendoline (1882-1951) and Margaret (1884-1963) Davies were the granddaughters of David Davies, a Welshman who amassed a fortune in the shipping and mining industries. In 1907, when Gwendoline came into her inheritance (Margaret would follow in 1909), the sisters were said to be the wealthiest unmarried women in Britain. Their religious upbringing in rural Wales gave them a deep sense of social responsibility and they chose to use their inheritance for cultural and philanthropic* purposes.</p>
<p>While there was no real family history of art collecting, the sisters' education was rigorously geared toward such pursuits. Their London school focused on cultural rather than academic study, and they travelled extensively with their governess, Jane Blaker, visiting art galleries and making extensive notes on the collections there.</p>
<p>The sisters began to make regular art purchases from 1908, which roughly coincided with the dates of their inheritance. They took advice from various people, including the art dealer Hugh Blaker (the brother of Jane Blaker) and David Croal Thompson, who was also an art dealer. While it was long assumed that these men were largely responsible for the nature of the sisters' collection, it has recently been accepted that Gwendoline and Margaret retained a far more active role in the process.</p>
<p>The sisters' journals reveal their preference for Old Master** paintings. Yet they initially made very few attempts to secure any such works. While the sisters were wealthy in relative terms, their income was nothing compared to the fortunes of American art collectors of this period, such as J. Pierpont Morgan. Quite simply, high quality Old Master works were, if not beyond their means, then beyond what they were willing to pay for them. Instead, their early purchases were of the fashionable, safe variety, and included, for example, paintings by the French artist Jean-Baptiste-Camille Corot.</p>
<p>However, it was only a few years before their collecting took a new direction and they turned to the work of the French Impressionists***. We know that Hugh Blaker, as a champion of contemporary French art had a hand in the decision, and we know also that they would have seen examples on their various trips to Paris. Whatever the precise reason for this change, their first purchases of Impressionist art, made in October 1912, were scenes of Venice by the French artist Claude Monet. Over the next 12 years, the sisters amassed the bulk of their Impressionist collection, including six further works by Monet, two more by Manet, and three by Renoir, including his well-known painting La Parisienne.</p>
<p>The First World War (1914-1918) played a part in the development of the sisters' collection. Their initial response to the war effort was to finance the safe passage of artists from occupied Belgium to Wales, as a humanitarian act, but also with the hope of establishing a vibrant artists' community in the area. Later in the conflict, both sisters decided to volunteer at a canteen for troops at Troyes, in northern France; Gwendoline in 1916, followed by Margaret in 1917.</p>
<p>It was tedious and distressing work, which would have a permanent effect on Gwendoline's health. Yet on one of numerous trips to nearby Paris, she visited the Bernheim-Jeune Gallery. Here she acquired two works by Cézanne – Provençal Landscape and The François Zola Dam. The paintings were shipped directly to Bath, England, where they became the first works by Cézanne to go on display in a public gallery in Britain.</p>
<p>Commentators have often described the sisters as unlikely pioneer collectors. Much is made of their isolation in rural Wales and the fact that they didn't make friends with artists or gallery owners. Yet they didn't feel obliged to follow fashionable tastes and were free to pursue their own preferences. Although they relied on a trusted circle of advisers, they made frequent trips to London and Paris, and also regularly had paintings sent to their home for consideration.</p>
<p>By the early 1920s, Gwendoline felt increasingly uncomfortable buying art works when faced with the poverty and social upheaval created by the First World War. Her philanthropic pursuits then became focused almost exclusively on social causes and the development of the sisters' home at Gregynog Hall into a conference center and venue for the Gregynog Festival of Music and Poetry. Gwendoline made her final art purchase in March 1926. Margaret also stopped collecting around this time, but started again in the 1930s acquiring, on a relatively small scale, work by contemporary British artists.</p>
<p>The sisters collected French Impressionist paintings at a time when such art was routinely ignored by individuals and institutions alike. The Gwendoline and Margaret Davies collection, donated in 1951 and 1963 respectively to the National Museum Wales, contains major examples of work by leading French Impressionists. In collecting paintings that they loved, the sisters created a lasting and meaningful cultural legacy for the people of Wales and beyond.</p>
<p style="font-size:.9em">
<em>* philanthropic: seeking to promote the welfare of others, often by charitable funding</em><br>
<em>** Old Master: a highly respected artist of great skill who worked in Europe before about 1800</em><br>
<em>*** Impressionist: an artist with a style of painting that developed in France in the late 1800s by Renoir, including his well-known painting La Parisienne</em>
</p>`,
    questionGroups: [
      {
        groupType: 'note-form',
        groupTitle: 'Questions 1–7',
        instruction: 'Complete the notes below.  Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Gwendoline and Margaret Davies',
          lines: [
            'Family and early life',
            "●   their grandfather's wealth came from __Q1__ and transportation businesses",
            '●   their upbringing gave them a sense of social responsibility',
            '●   their __Q2__ was designed to give them an interest in activities such as collecting art',
            '●   their governess took them on trips to art galleries',
            '●   they took lengthy __Q3__ about the things they saw in art galleries',
            'The sisters as art collectors',
            '●   their __Q4__ showed they liked Old Master paintings, but they were expensive to buy',
            '●   their early purchases were safe, popular paintings',
            '●   the first Impressionist paintings they bought showed places in __Q5__.',
            'Impact of First World War',
            '●   they helped bring artists from Belgium to Wales',
            '●   they worked in a __Q6__ for soldiers in France',
            'Opinions about the sisters as art collectors',
            '●   were not considered typical collectors - they lived in isolation in the countryside and did not have any __Q7__ who were artists',
          ],
        },
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'mining' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'education' },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'notes' },
          { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'journals' },
          { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'Venice' },
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'canteen' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'friends' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 8–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 8, type: 'true-false-ng', questionText: "8   The Davies sisters' childhood influenced the way they decided to use their wealth.", correctAnswer: 'TRUE' },
          { questionNumber: 9, type: 'true-false-ng', questionText: "9   The Jean-Baptiste-Camille Corot paintings in the Davies sisters' collection were purchased from a gallery in France.", correctAnswer: 'NOT GIVEN' },
          { questionNumber: 10, type: 'true-false-ng', questionText: "10   Hugh Blaker opposed the Davies sisters' decision to buy art by French Impressionists.", correctAnswer: 'FALSE' },
          { questionNumber: 11, type: 'true-false-ng', questionText: '11   The exhibition of Cezanne paintings at the Bath gallery was very popular with the public.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 12, type: 'true-false-ng', questionText: '12   The impact of the First World War encouraged Gwendoline to reconsider her interest in collecting art.', correctAnswer: 'TRUE' },
          { questionNumber: 13, type: 'true-false-ng', questionText: '13   The Davies sisters bought French Impressionist art during a period when very few people were doing so.', correctAnswer: 'TRUE' },
        ],
      },
    ],
  },

  // ── PASSAGE 2 (Q14–26) ──────────────────────────────────────────
  {
    title: 'Why we need silence',
    category: 'passage2',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 1'],
    questionRange: { start: 14, end: 26 },
    content: `<p><strong>Why we need silence</strong></p>
<p><strong>A</strong><br>
Humans are finely attuned to noise, and for good reason. From an evolutionary perspective, sounds give us vital information, helping us navigate the world and avoid danger. To help ensure loud or unexpected noises get the attention they deserve, our internal chemistry alters in response to them. Our blood pressure goes up, muscles tense and glands release hormones that prepare us for fight or flight. In the short term, this is a good thing. When we are exposed to too much noise over the long term, however, those responses can lead to a multitude of health issues, from sleep disturbance to even cardiovascular disease.</p>
<p><strong>B</strong><br>
The World Health Organization has recently designated excessive noise as an 'underestimated threat' to public health, and has said that people living in cities such as Mumbai, Tokyo and Buenos Aires are being exposed to far more than the recommended 40 decibels of noise at night. A report from the European Environment Agency concluded that noise was an ongoing and widespread issue in Europe, with at least 1 in 5 people consistently exposed to levels considered harmful to health. 'There are no "earlids" that can protect your brain from noise,' says Nick Antonio, an acoustic consultant who has contributed to the British and international standards for noise.</p>
<p><strong>C</strong><br>
The good news is that several cities have been working to turn the volume down. One of the first to do so was London. 'By providing recommendations for quieter buses, reducing noise from roads and also controlling noise from aircraft, they were able to make the city quieter,' says Antonio. Other cities have introduced noise-reducing road coatings, for instance, alongside greenery that muffles sound. Some solutions are more specific: Washington DC's ban on petrol-powered leaf blowers came into effect recently, while in New York City, legislation has been approved to fine people who modify their vehicles to make them noisier. 'People are seeing the benefits of these more quiet environments in their cities,' Antonio says. 'I expect we will see much more of this in the future.'</p>
<p><strong>D</strong><br>
Researchers are also seeking to understand what aspects of silent experiences are most beneficial to our health. One of the best-researched is the flotation tank: a lightproof, soundproof tank of salt water in which a person floats as a form of deep relaxation. While some people experience altered perception in the tanks, involving subtle humming sounds and visual effects, these effects are benign and do not detract from the benefits of the experience, says Justin Feinstein, a clinical neuropsychologist. 'When you don't have external sensory stimuli coming in, the brain tries to fill the void to make sense of this dark and silent world,' he explains. 'In these tanks, some people can even hear the sound of their eyes blinking,' says Feinstein. 'But it is the ability to focus on the breath that helps people reach a relaxed or meditative state.'</p>
<p><strong>E</strong><br>
To further explore flotation tanks as a therapeutic tool, Feinstein and his colleagues recruited 50 people with a variety of conditions related to stress and had them answer a questionnaire prior to and following a flotation session. Participants reported decreases in muscle tension, pain and symptoms of their conditions after a single, 1-hour float, alongside an increase in feelings of relaxation and overall wellbeing.</p>
<p>Less is known about what effects sensory deprivation can have on the brain. To investigate, Feinstein's team had 48 people participate in either three 90-minute float sessions or three 90-minute periods of relaxing on a chair which reclined. Participants had their brains scanned using functional magnetic resonance imaging at the beginning and end of the trial. Float sessions uniquely decreased activity in the default mode network (DMN), a collection of brain regions commonly linked with depression. Feinstein says it is an exciting finding, because flotation tanks seem to offer a way of 'resetting' our nervous system to prevent it from getting out of balance.</p>
<p><strong>F</strong><br>
Neurobiologist Tai Dotan Ben-Soussan is also an advocate of silence as a therapy. 'When we find ways to be quiet, we are not only quiet in our environment, but quiet in our inner selves,' she explains. 'This allows us to be more aware of what is happening around us and what the situation may require from us so we can provide [a more] adequate response.'</p>
<p>Not everyone will benefit from silence to the same extent, but Ben-Soussan says one characteristic is key: the person must need to want to engage in the experience. 'We see from animal models and human studies that volition and intentionality is important,' she says. 'When people do not want silence, it can be very distressing.'</p>
<p><strong>G</strong><br>
Eric Pfeifer, a psychotherapy researcher, also concedes that some people may not benefit from silence, particularly those who are in a heightened state of stress. 'People in these states may not be able to relax or calm down in a silent condition,' he says. Professional guidance can be useful, he adds, allowing people to approach silence slowly so that they can gradually enjoy the benefits. And Pfeifer is convinced that silence is more attainable in everyday life than people think. First, complete silence isn't necessary. In a recent study, he found that participants reported more relaxation and less boredom when they sat quietly in an outdoor garden compared with a completely silent room. Second, Pfeifer believes we don't need a lot of silence to gain benefits. 'You don't need to spend hours in silence,' he says. 'It is likely better to have more frequency of silence for a few minutes at a time than a longer period of silence only once a week. Just finding those places in your daily life where you can find some silence ... can make a big difference.'</p>`,
    questionGroups: [
      {
        groupType: 'plain',
        groupTitle: 'Questions 14–17',
        instruction: 'Reading Passage 2 has seven sections, A-G. Which section contains the following information? Write the correct letter, A-G.',
        questions: [
          { questionNumber: 14, type: 'matching-info', questionText: '14   examples of strategies to decrease the noise that the public are exposed to', correctAnswer: 'C' },
          { questionNumber: 15, type: 'matching-info', questionText: '15   data indicating the extent of the problem of excessive noise', correctAnswer: 'B' },
          { questionNumber: 16, type: 'matching-info', questionText: '16   a description of physiological changes in our bodies when we hear sudden noises', correctAnswer: 'A' },
          { questionNumber: 17, type: 'matching-info', questionText: '17   evidence that a relatively quiet environment can be more beneficial than a totally silent one', correctAnswer: 'G' },
        ],
      },
      {
        groupType: 'note-form',
        groupTitle: 'Questions 18–21',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'Flotation Tanks',
          lines: [
            'According to Justin Feinstein, flotation tanks allow people to concentrate on their own __Q18__, which helps them relax and enables them to meditate.',
            'Feinstein and his colleagues conducted an experiment in which 50 people, who were all suffering from stress and related issues, were given a __Q19__ to complete before and after using a flotation tank. Participants reported a reduction in their symptoms after an hour in the tank, together with signs of relaxation and improved general __Q20__.',
            'In another experiment, the researchers had 48 people spend periods of 90 minutes either lying back in a chair or floating in a tank. Brain scans then revealed that those people who had been in a tank had decreased activity in parts of the brain associated with __Q21__.',
          ],
        },
        questions: [
          { questionNumber: 18, type: 'fill-blank', questionText: 'Question 18', correctAnswer: 'breath' },
          { questionNumber: 19, type: 'fill-blank', questionText: 'Question 19', correctAnswer: 'questionnaire' },
          { questionNumber: 20, type: 'fill-blank', questionText: 'Question 20', correctAnswer: 'wellbeing' },
          { questionNumber: 21, type: 'fill-blank', questionText: 'Question 21', correctAnswer: 'depression' },
        ],
      },
      {
        groupType: 'matching-options',
        groupTitle: 'Questions 22–26',
        instruction: 'Look at the following statements (Questions 22-26) and the list of people below. Match each statement with the correct person, A, B, C or D. NB You may use any letter more than once.',
        matchingOptionsTitle: 'List of People',
        matchingOptions: [
          'Nick Antonio',
          'Justin Feinstein',
          'Tai Dotan Ben-Soussan',
          'Eric Pfeifer',
        ],
        matchingReuseAllowed: true,
        questions: [
          { questionNumber: 22, type: 'matching-info', questionText: '22   It is unpleasant and upsetting for people to be placed in a silent environment against their will.', correctAnswer: 'C' },
          { questionNumber: 23, type: 'matching-info', questionText: '23   The trend towards creating quieter urban locations is likely to increase in the coming years.', correctAnswer: 'A' },
          { questionNumber: 24, type: 'matching-info', questionText: '24   When our body\'s senses are completely deprived of input, our minds compensate for this by creating the illusion of images and sounds.', correctAnswer: 'B' },
          { questionNumber: 25, type: 'matching-info', questionText: '25   Even a short amount of silent time can have a positive impact.', correctAnswer: 'D' },
          { questionNumber: 26, type: 'matching-info', questionText: '26   External and internal quietness makes us more conscious of events occurring in our surroundings and helps us react appropriately to these events.', correctAnswer: 'C' },
        ],
      },
    ],
  },

  // ── PASSAGE 3 (Q27–40) ──────────────────────────────────────────
  {
    title: 'Book review: The World of Sugar by Ulbe Bosma',
    category: 'passage3',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 1'],
    questionRange: { start: 27, end: 40 },
    content: `<p><strong>Book review: The World of Sugar by Ulbe Bosma</strong></p>
<p>Ulbe Bosma's The World of Sugar is a genuinely global history. Bosma discusses all the sugar-growing places of the world, beginning with Cuba and Java, the largest exporters of the early 20th century. But this is a history not just of cane sugar but also of beet sugar, an equally important form of traded sugar over the last hundred years. Beet sugar is grown mainly in Europe and the United States. It has also been massively subsidised and sold at artificially low prices on world markets, threatening the livelihood of producers of cane sugar.</p>
<p>Bosma's discussion of the sugar market in Britain gives a sense of the book's range. The sweet-toothed British first bought cane sugar from their own slavery-dependent colonial plantations. Following the abolition of slavery in the British Empire, cane sugar was imported to Britain from places which retained the practice, such as Cuba and Brazil. Towards the end of the 19th century, the British started to import beet sugar from continental Europe. Only in the 20th century was there a move to develop a national beet sugar industry.</p>
<p>The book provides a global labour history, investigating the wide range of labour regimes associated with growing sugar. Contrary to popular belief, cane sugar production was never just restricted to large, dedicated plantations owned by rich men. For example, in Java, a huge exporter of sugar in the early 20th century, sugar cane was grown together with rice in an extraordinarily labour-intensive way by small farmers.</p>
<p>The World of Sugar is also a story of similarity and continuity in sugar cultivation. For example, imported labour has been used for much large-scale production. German beet fields employed Polish workers; Mexicans and many others, including Sicilians, were vital to US sugar production. Cane cutting, Bosma shows, remains a poorly paid and brutal business to this day in many places in the world. But as well as this, the book is about the continuity of the use of traditional methods on small farms. In the mid 20th-century, this type of sugar production dominated in South Asia and Latin America.</p>
<p>This is also a history of capitalists and sugar dynasties, as well as corporations that in some cases have remained influential over very long periods. Great firms and great interests have had profound influence on the policies of states. In many places – not just the British Caribbean but Cuba and the Philippines too – a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies. In the battle for control of the industry, it was inevitably the poor countries which came off worse. All this is explored by Bosma with wonderful subtlety and control.</p>
<p>But sugar production was never just a matter of agriculture. It also involved the extraction, close to the place of harvest, of sucrose from the sugar plant, a process which required machinery powered by humans, animals, wind or steam. Further processes involved boiling (from the 19th century, this often involved vacuum systems) and the separation of sugar from other materials in a process known as refinement. From very early on, sugar production was an energy-intensive industrial process, mostly taking place in the countryside and in refineries in centres of consumption, both small and large. The growth of the industry entailed a very rapid diffusion of ideas and techniques from one country to another. Cuba, for example, developed an extraordinarily dense system of railways to transport workers and cane, as well as steam-powered sugar factories. Particular varieties of cane sugar and beet sugar spread very rapidly across the world, in accordance with local needs and demands.</p>
<p>Where once only tiny quantities of sugar could be produced, now new techniques, varieties, fertilisers, irrigation systems and much more have turned gleaming white sugar into a ubiquitous chemical. Over the same time, there has been a massive increase in consumption. Once regarded as a luxury, sugar came to be promoted as a valuable source of energy. But as the consumption of sugar has increased, so has the harm it does, whether to people's teeth or weight. In the face of appalling obstruction from the sugar industry to attempts to reduce consumption, some countries have been forced to tax sugar in order to bring that about. The sugar industry has a history of attacking its critics and, when it comes to obesity, of trying to blame fats, and lack of exercise and self-control. And the recent past has seen worrying new developments in mass sweetening. High-fructose corn syrup made from maize using an enzymatic process invented in Japan in the 1960s has a similar number of calories to table sugar but is far cheaper to produce. It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity.</p>
<p>This is a wonderfully rich book, a model of global history, the history of production and the history of capitalism. Bosma avoids outbursts of emotion, celebratory or critical, even if they might have made his analysis of the multiple tragedies involving sugar all the more powerful. He shows that we could always have done without sugar and that today we have many alternative sources of sweetness. Yet many of the poorest people in the world still depend on it to make a living.</p>`,
    questionGroups: [
      {
        groupType: 'plain',
        groupTitle: 'Questions 27–30',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice',
            questionText: '27   What does the reviewer suggest about the cultivation and trading of sugar in the first paragraph?',
            options: [
              'A   Sugar has played a major role in international relations.',
              'B   Beet sugar has been made more internationally competitive.',
              'C   Cane sugar is thought to be of superior quality to beet sugar.',
              'D   New locations for cultivating sugar have increased production.',
            ],
            correctAnswer: 'B',
          },
          {
            questionNumber: 28, type: 'multiple-choice',
            questionText: '28   In the second paragraph, when discussing the sugar market in Britain, the reviewer stresses',
            options: [
              'A   how the sources used changed over time.',
              'B   how developments in agriculture affected trade.',
              'C   the increased demand for sugar over the years.',
              'D   the growing support for ethical methods of cultivation.',
            ],
            correctAnswer: 'A',
          },
          {
            questionNumber: 29, type: 'multiple-choice',
            questionText: '29   What is the reviewer doing in the third paragraph?',
            options: [
              'A   describing an efficient approach to sugar cultivation',
              'B   explaining why the use of sugar plantations declined',
              'C   addressing a misconception about the growing of sugar cane',
              'D   evaluating different approaches to the cultivation of sugar cane',
            ],
            correctAnswer: 'C',
          },
          {
            questionNumber: 30, type: 'multiple-choice',
            questionText: "30   In the final paragraph, what does the reviewer suggest is the overall message of Bosma's book?",
            options: [
              'A   Sugar is a harmful and unnecessary product.',
              'B   Economic pressure is needed to control sugar production.',
              'C   Conditions for workers in sugar production should be improved.',
              'D   Intensive marketing of sugar has had disastrous consequences.',
            ],
            correctAnswer: 'A',
          },
        ],
      },
      {
        groupType: 'summary-completion',
        groupTitle: 'Questions 31–36',
        instruction: 'Complete the summary using the list of words, A-I, below.',
        summaryConfig: {
          text: 'Sugar cultivation and production<br><br>The book The World of Sugar points out the similarities in the way that sugar was cultivated around the world. In the big industries in both Germany and the US, sugar farming depended on __Q31__. However, in other parts of the world such as South Asia and Latin America, __Q32__ continued.<br><br>Sugar production has also involved __Q33__ who were eager to protect their markets. In countries such as Cuba the sugar industry therefore had a major influence on __Q34__.<br><br>To support the interests of sugar producers, __Q35__ were established. As a result of this, __Q36__ were penalised.',
          wordBank: [
            { letter: 'A', word: 'national governments' },
            { letter: 'B', word: 'agricultural developments' },
            { letter: 'C', word: 'less wealthy nations' },
            { letter: 'D', word: 'untrained workers' },
            { letter: 'E', word: 'small-scale cultivation' },
            { letter: 'F', word: 'outdated methods' },
            { letter: 'G', word: 'financial controls' },
            { letter: 'H', word: 'migrant workers' },
            { letter: 'I', word: 'powerful individuals and businesses' },
          ],
        },
        questions: [
          { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'migrant workers' },
          { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'small-scale cultivation' },
          { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'powerful individuals and businesses' },
          { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'national governments' },
          { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'financial controls' },
          { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'less wealthy nations' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 37–40',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 37, type: 'yes-no-ng', questionText: '37   Sugar has now become available in large quantities due to a range of agricultural developments.', correctAnswer: 'YES' },
          { questionNumber: 38, type: 'yes-no-ng', questionText: '38   Advertisers initially marketed sugar as a luxury product.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 39, type: 'yes-no-ng', questionText: '39   The invention of high-fructose corn syrup was a positive development.', correctAnswer: 'NO' },
          { questionNumber: 40, type: 'yes-no-ng', questionText: '40   High-fructose corn syrup is an ingredient in many processed foods.', correctAnswer: 'YES' },
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
