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
    title: 'Saving the saiga',
    category: 'passage1',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 3'],
    questionRange: { start: 1, end: 13 },
    content: `<p><strong>Saving the saiga</strong></p>
<p>The saiga, a species of antelope native to Central Asia, once roamed the vast grasslands of this region in enormous herds, many millions strong. Regrettably, such spectacular sights are a thing of the past. Today, the saiga is largely confined to a single country: Kazakhstan. This country is estimated to be home to well over 90% of the global saiga population, with Russia, Mongolia and Uzbekistan accounting for the rest.</p>
<p>The saiga is perfectly adapted to the tough conditions of the remote wilderness of the steppes of Central Asia. One such adaptation is its bizarre bulbous nose, which enables the animal to survive the extreme seasonal temperature swings of the region. The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga's lungs in winter. Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up.</p>
<p>Despite these superb adaptations to harsh conditions, the saiga has no defence against the threats posed by humans. It was almost driven to extinction by hunters in the 19th century. Legal protection ensured its survival for a while, and numbers steadily recovered throughout most of the 20th century. But the respite was only temporary. In the ten years following the break-up of the former Soviet Union in 1991, over 95% of the global population was lost – one of the fastest examples of species loss ever recorded for a mammal.</p>
<p>The dramatic decline during this decade was due to illegal poaching on an industrial scale. Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners. Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns in traditional medicine as an alternative to those of rhinos. Male saiga were almost wiped out, leading to a population crash from which the species has been struggling to recover ever since.</p>
<p>Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement. Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species. In the worst cases, herds may starve to death after being trapped.</p>
<p>Then there is the risk of disease. In 2015, an outbreak of haemorrhagic septicaemia, caused by the normally harmless bacterium Pasteurella multocida, killed over 75% of the global adult saiga population in just three weeks. In 2017, 60% of the Mongolian saiga population – a subspecies found nowhere else in the world – was killed by a virus that spilled over from livestock. These so-called mass mortality events represent an unpredictable and serious threat to the species.</p>
<p>Climate change poses a further threat. Although well adapted to cold winters and hot summers, saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate. Experts believe that unusually warm weather may have triggered the 2015 mass mortality event. The steppe region has also become increasingly arid in recent years, and many of the smaller streams that the species normally depended on have dried up and vanished.</p>
<p>Recent efforts to save the saiga have been spearheaded by the Altyn Dala Conservation Initiative, a project led by the Association for the Conservation of Biodiversity of Kazakhstan, working in partnership with the Kazakh government's Committee for Forestry and Wildlife, Frankfurt Zoological Society and Fauna and Flora, an international conservation charity. Its purpose is to protect and restore Kazakhstan's steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga. In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large-scale ecosystem restoration around the globe.</p>
<p>So, how many saiga are there now? By 2000, the global saiga population had hit an all-time low of just 21,000 individuals. There was some recovery in the first decade of the new millennium but this was then crushed by devastating mass mortality events that saw the loss of hundreds of thousands of the species. But thanks to the intervention of the Altyn Dala Conservation Initiative, the most recent episodes in the ongoing story of the saiga have been relatively uplifting. Three years ago, the Ustyurt Plateau population in Kazakhstan experienced its largest mass birth of saiga calves in many years. An aerial census two years ago recorded an estimated 842,000 saiga across Kazakhstan as a whole, and according to an aerial survey earlier this year, the saiga population in Kazakhstan now exceeds 1.9 million. The world's strangest-looking antelope remains critically endangered, but the direction of travel is positive.</p>`,
    questionGroups: [
      {
        groupType: 'note-form',
        groupTitle: 'Questions 1–7',
        instruction: 'Complete the notes below.  Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: 'The saiga',
          lines: [
            'Adaptations',
            '●   has a large bulbous nose with swollen nostrils that',
            '○   keep __Q1__ out',
            '○   lower the temperature of its __Q2__ in summer',
            '○   warm the air entering its lungs in winter',
            '●   grows a thick __Q3__ in winter, which it loses in spring',
            'Reasons for population decline',
            '●   poaching, especially for the __Q4__ of male saiga',
            '●   expansion of farms and settlements, causing',
            "○   reduction in the size of the saiga's __Q5__.",
            '○   loss of access to the __Q6__ which they use for migration',
            '●   various forms of disease, leading to mass mortality events',
            '●   climate change, causing the disappearance of __Q7__ which the saiga relied on',
          ],
        },
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'dust' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'blood' },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'coat' },
          { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'horns' },
          { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'habitat' },
          { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'routes' },
          { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'streams' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 8–13',
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 8, type: 'true-false-ng', questionText: '8   Today, numbers of saiga are distributed evenly across four nations in Central Asia: Kazakhstan, Russia, Mongolia and Uzbekistan.', correctAnswer: 'FALSE' },
          { questionNumber: 9, type: 'true-false-ng', questionText: '9   For most of the 20th century, the population of saiga were falling.', correctAnswer: 'FALSE' },
          { questionNumber: 10, type: 'true-false-ng', questionText: '10   Efforts to protect rhinos in Africa had a significant effect on saiga populations.', correctAnswer: 'TRUE' },
          { questionNumber: 11, type: 'true-false-ng', questionText: '11   Unpredictable fluctuations in climate are threatening the wildlife of Central Asia more than in other parts of the world.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 12, type: 'true-false-ng', questionText: '12   The Altyn Dala Conservation Initiative was formed for the benefit of a number of different animals.', correctAnswer: 'TRUE' },
          { questionNumber: 13, type: 'true-false-ng', questionText: "13   The Altyn Dala Conservation Initiative's recognition as a World Restoration Flagship project attracted additional international funding for the scheme.", correctAnswer: 'NOT GIVEN' },
        ],
      },
    ],
  },

  // ── PASSAGE 2 (Q14–26) ──────────────────────────────────────────
  {
    title: 'The problems of getting around the city of Dar es Salaam',
    category: 'passage2',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 3'],
    questionRange: { start: 14, end: 26 },
    content: `<p><strong>The problems of getting around the city of Dar es Salaam</strong></p>
<p>Dar es Salaam in Tanzania is one of the fastest growing cities in Africa. Its population has increased eightfold since 1980 and swells by half a million people every year. United Nations projections anticipate it will become a megacity within seven years as its population passes 10 million, reaching 13.4 million by 2035. Daniel Hoornweg for the Global Cities Institute forecasts the city could be home to an incredible 73.7 million people by 2100.</p>
<p>Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city, where the journey to and from the centre regularly takes over two hours. It can be longer if rain turns the dirt roads to mud.</p>
<p>Even in the middle of the day, traffic frequently slows to a stop without warning. It is not unusual for cars and minibuses to queue for 20 minutes at a key intersection. A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city. Outside the centre many rely on boda boda (motorbike taxis) to navigate the narrow side streets and potholed mud roads that make up much of the metropolis. Their safety record is scandalous.</p>
<p>Dar es Salaam's reliance on four arterial roads into the city is a legacy of the colonial government that planned the city at the start of the 20th century to cater for a population of 35,000. Most of the current growth is made up of young people arriving from the countryside to find work, and as the population has exploded, Dar es Salaam has grown around those four highways. Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy.</p>
<p>But Dar es Salaam is pinning its hopes on a solution that could offer a different model for Africa's megacities, giving them an alternative to a future controlled by the private car. Unlike many cities on the continent, Dar es Salaam isn't trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus.</p>
<p>The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages. Ticket purchase and control takes place at stations prior to boarding and the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies.</p>
<p>'The new buses are much, much better,' says Paulas George, a young IT worker. He takes the bus every day and it has cut his journey time by two-thirds. He says it is not perfect, though, complaining that drivers often refuse to turn on the air conditioning to save fuel.</p>
<p>That is not the only problem. A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day – half the expected capacity. Smartcards can't be used as the mechanical readers aren't working either, forcing passengers to buy individual paper tickets for every journey. Each is printed with a scannable QR code, but there are no scanners. Staff stand by the gates and tear tickets as people enter. As a result, queues are considerable at peak times.</p>
<p>Morogoro Road to the north-west of the city was phase I of the BRT project. Phases II and III will install bus lanes along Nyerere Road to the south-west and Kilwa Road to the south. Construction on both routes is due to start imminently. Phase IV, towards Bagamoyo in the north, is in the preliminary design stage. 'Much of the city will have access to a world-class transport system within the space of a few years,' says Chris Kost, the Africa director of ITDP (the Institute for Transportation and Development Policy). All phases are being planned to high standards and, once complete, a third of city residents will be within a short walk of the BRT network.</p>
<p>The ITDP regrets Africa's obsession with metros. 'With a metro, an international firm will often just parachute in its own system,' says Kost. 'Bus rapid transit allows existing stakeholders to get involved. That's what we did in Dar es Salaam and what we're planning in Nairobi, where the bus bodies will be built in the city and local operators will look after tickets, fare collection and IT ...Bus rapid transit has been transformational for Dar es Salaam. For millions of people in African cities, this is their best hope of ever being connected.'</p>`,
    questionGroups: [
      {
        groupType: 'plain',
        groupTitle: 'Questions 14–18',
        instruction: 'Do the following statements agree with the information given in Reading Passage 2? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
        questions: [
          { questionNumber: 14, type: 'true-false-ng', questionText: '14   The population of Dar es Salaam is rising more rapidly than was previously predicted.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 15, type: 'true-false-ng', questionText: '15   Most of the residents of Dar es Salaam live in high-rise blocks on the edge of the city.', correctAnswer: 'FALSE' },
          { questionNumber: 16, type: 'true-false-ng', questionText: '16   Residents have been consulted about their views on the suburban rail line in Dar es Salaam.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 17, type: 'true-false-ng', questionText: '17   The majority of the present residential development in Dar es Salaam is unplanned.', correctAnswer: 'TRUE' },
          { questionNumber: 18, type: 'true-false-ng', questionText: "18   Dar es Salaam's authorities have decided to follow the public transport plan adopted by a large number of African cities.", correctAnswer: 'FALSE' },
        ],
      },
      {
        groupType: 'note-form',
        groupTitle: 'Questions 19–26',
        instruction: 'Complete the notes below.  Choose ONE WORD ONLY from the passage for each answer.',
        noteConfig: {
          title: "Dar es Salaam's DART Bus Rapid Transit system",
          lines: [
            'Features',
            '●   the buses use designated __Q19__ to cut down on delays',
            '●   passengers pay fares before __Q20__.',
            '●   passengers in __Q21__ can use every part of the system',
            'Problems',
            '●   the temperature control is sometimes not activated in order to reduce __Q22__ use',
            '●   insufficient number of vehicles are available due to the effects of a severe __Q23__.',
            '●   passengers are unable to use __Q24__ because some equipment is out of action',
            '●   tickets have to be checked manually at station __Q25__.',
            '●   __Q26__ frequently build up during rush hours',
          ],
        },
        questions: [
          { questionNumber: 19, type: 'fill-blank', questionText: 'Question 19', correctAnswer: 'lanes' },
          { questionNumber: 20, type: 'fill-blank', questionText: 'Question 20', correctAnswer: 'boarding' },
          { questionNumber: 21, type: 'fill-blank', questionText: 'Question 21', correctAnswer: 'wheelchairs' },
          { questionNumber: 22, type: 'fill-blank', questionText: 'Question 22', correctAnswer: 'fuel' },
          { questionNumber: 23, type: 'fill-blank', questionText: 'Question 23', correctAnswer: 'flood' },
          { questionNumber: 24, type: 'fill-blank', questionText: 'Question 24', correctAnswer: 'smartcards' },
          { questionNumber: 25, type: 'fill-blank', questionText: 'Question 25', correctAnswer: 'gates' },
          { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'queues' },
        ],
      },
    ],
  },

  // ── PASSAGE 3 (Q27–40) ──────────────────────────────────────────
  {
    title: 'Rethinking the Past',
    category: 'passage3',
    isActualTest: true,
    tags: ['Cam 21', 'Cam 21 - Test 3'],
    questionRange: { start: 27, end: 40 },
    content: `<p><strong>Rethinking the Past</strong></p>
<p>It is by now a truism that the story of human evolution is being rethought. Discoveries have come thick and fast over the last decade or so, and these have forced us to rethink many crucial points, such as how old our species is – about 300,000 years old as opposed to 200,000 – and what extinct hominins, such as our cousins the Neanderthals, were really like. But because there are so many species and eras involved, it's hard to discern the common threads linking them.</p>
<p>However, I do think it's possible to draw out some overall messages from the blizzard of archaeological finds in recent years. Two things stand out to me. One is the growing evidence that many supposedly 'advanced' behaviours, such as architecture and art, can be traced much further back in time than we thought, often to hominin species that existed before modern humans. And the other is that we have badly misunderstood gender roles in prehistoric societies, imposing patriarchal values onto cultures that had very different ideas about how women should behave.</p>
<p>Let's start with architecture. At Kalambo Falls in Zambia, researchers found buried logs that had been shaped with stone tools so that they interlocked. They seem to have once been part of a larger structure, perhaps a building. This would be unsurprising if they weren't 476,000 years old. That's almost 200,000 years before our species, Homo sapiens, evolved. Extinct hominins also managed to settle in extreme places. For instance, we now know that extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago – upending the old notion that such environments were only settled by modern humans around 3,600 years ago.</p>
<p>Art also seems to have been invented by older hominins. We have had evidence for a long time now that Neanderthals painted on cave walls. Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells. By far the most contentious claim in this area is that Homo naledi made art. H. naledi lived around 250,000 years ago, making it a contemporary of our species. However, it had quite a small brain, typical of older hominins – and was therefore, according to palaeoanthropological dogma, incapable of complex behaviours. Nevertheless, in the Rising Star cave system in South Africa where the H. naledi remains were found, researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated.</p>
<p>To say these claims about H. naledi are controversial is to understate the situation. Many experts say the evidence presented so far is completely inadequate to support them. The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper. My views on the H. naledi controversy are complicated. I do think more evidence is needed: in particular with regard to the dating of the etchings. At the same time, I think the species' small brains are a distraction. Palaeoanthropologists got fixated on brain size because it was what they could see: if what you have is skeletons, then all you know about brains are their shapes and sizes. But other properties, such as the brain's internal wiring, are surely equally important and may explain how a species like H. naledi might have been capable of complex behaviours, despite their small brains.</p>
<p>In a sense, we shouldn't be surprised that so many of these behaviours had their origins in older, extinct hominins. Evolution usually works by incremental steps and so does technology. The first birds weren't great at flying, and the first mobile phones weren't great at, well, anything really. The idea that there was a sudden explosion of intelligence and creativity at some point in our evolution isn't inherently ridiculous: sometimes a system hits a tipping point and undergoes runaway change. But there was never that much evidence that human evolution worked this way. Instead, it seems the Neanderthals and many others all walked so we could run.</p>
<p>One way or another, the H. naledi story is going to be an example of letting our preconceptions get in the way of the evidence. The same is true for our ideas about gender in prehistory. Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today's researchers are trying to unpick this stuff, and there have been some significant steps in recent years.</p>
<p>Perhaps the most dramatic was the demolition of 'Man the Hunter'. This was the idea, promoted for decades, that in most prehistoric societies the men went out to hunt and the women looked after the home. However, a meta-analysis published in June 2023 compiled data on several dozen foraging societies and found women hunted in 80 per cent of them. In line with this, it emerged that an ancient spear-throwing tool called an atlatl enables women to launch projectiles at the same speed as men. We have also seen growing evidence of women occupying positions of authority in ancient societies. The Viking queen Thyra may have helped unify Denmark in the 900s. Going further back, an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed, when proteins in her teeth were analysed.</p>
<p>It seems that the more we find out about past societies, the more our preconceptions about the ways society 'has to be' turn out to be wrong. Inequality, authoritarianism and patriarchy aren't inevitable. They're choices, and prehistory shows us that we can choose differently.</p>`,
    questionGroups: [
      {
        groupType: 'plain',
        groupTitle: 'Questions 27–30',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: [
          {
            questionNumber: 27, type: 'multiple-choice',
            questionText: '27   What is the writer doing in the second paragraph?',
            options: [
              'A   pinpointing some key changes in our understanding of prehistory',
              'B   outlining some aspects of prehistory which are still poorly understood',
              'C   summarising some attitudes towards recent archaeological revelations',
              'D   giving an overview of some current disagreements among archaeologists',
            ],
            correctAnswer: 'A',
          },
          {
            questionNumber: 28, type: 'multiple-choice',
            questionText: '28   In the sixth paragraph, the writer mentions mobile phones to make the point that',
            options: [
              'A   most developments happen in a gradual way.',
              'B   innovation can come from a variety of sources.',
              'C   not all technological advancements are positive.',
              'D   the path of evolution can often be unpredictable.',
            ],
            correctAnswer: 'A',
          },
          {
            questionNumber: 29, type: 'multiple-choice',
            questionText: "29   In the seventh paragraph, the phrase 'unpick this stuff' refers to the task of",
            options: [
              'A   assessing the impact of certain recent research findings.',
              'B   questioning the authenticity of evidence used in earlier research.',
              'C   conducting research into how prehistoric societies were organised.',
              'D   reevaluating research influenced by outdated beliefs about society.',
            ],
            correctAnswer: 'D',
          },
          {
            questionNumber: 30, type: 'multiple-choice',
            questionText: '30   What does the writer suggest in the final paragraph?',
            options: [
              'A   Studying past societies could help us create a fairer society today.',
              'B   We should not judge past societies by the standards of modern society.',
              'C   We still have much to learn about how societies have evolved over history.',
              'D   There is more than one way to interpret evidence about societies in prehistoric times.',
            ],
            correctAnswer: 'A',
          },
        ],
      },
      {
        groupType: 'matching-options',
        groupTitle: 'Questions 31–34',
        instruction: 'Complete each sentence with the correct ending, A-F, below.  Write the correct letter, A-F, in boxes 31-34 on your answer sheet.',
        matchingOptions: [
          'Homo sapiens emerged at an earlier point in time than experts previously believed.',
          'previous assumptions about who had power in the prehistoric world were inaccurate.',
          'gender roles in extinct hominin species were different from those in Homo sapiens societies.',
          'experts may have been mistaken about who looked for food in early human communities.',
          'Homo sapiens was probably not the only species capable of sophisticated workmanship.',
          'other species managed to survive in harsh environments before the arrival of Homo sapiens.',
        ],
        questions: [
          { questionNumber: 31, type: 'matching-info', questionText: '31   The findings at Kalambo Falls revealed that', correctAnswer: 'E' },
          { questionNumber: 32, type: 'matching-info', questionText: '32   Evidence from high-altitude regions suggests that', correctAnswer: 'F' },
          { questionNumber: 33, type: 'matching-info', questionText: '33   An academic publication from June 2023 shows that', correctAnswer: 'D' },
          { questionNumber: 34, type: 'matching-info', questionText: '34   Analysis of a 4000-year-old Iberian leader indicates that', correctAnswer: 'B' },
        ],
      },
      {
        groupType: 'plain',
        groupTitle: 'Questions 35–40',
        instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.',
        questions: [
          { questionNumber: 35, type: 'yes-no-ng', questionText: "35   It seems likely that the Neanderthals' cave paintings were the first examples of artwork ever created.", correctAnswer: 'NO' },
          { questionNumber: 36, type: 'yes-no-ng', questionText: '36   It is very rare to find prehistoric artwork carved onto shells.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 37, type: 'yes-no-ng', questionText: '37   The methods which the researchers used to examine the Rising Star cave system were rather unconventional.', correctAnswer: 'NOT GIVEN' },
          { questionNumber: 38, type: 'yes-no-ng', questionText: '38   It is unclear how old the etchings in the Rising Star cave system are.', correctAnswer: 'YES' },
          { questionNumber: 39, type: 'yes-no-ng', questionText: '39   The means used to publicise the findings from the Rising Star cave system added to the controversy that surrounds them.', correctAnswer: 'YES' },
          { questionNumber: 40, type: 'yes-no-ng', questionText: '40   The size of H. naledi brains is a key factor in the question of whether these hominins were able to produce art.', correctAnswer: 'NO' },
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
