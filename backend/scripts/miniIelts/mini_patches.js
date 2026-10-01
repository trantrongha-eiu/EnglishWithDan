// Hand review of the 10 pilot drafts (keys checked against each passage; ECE answer keys where available).
// Each entry: text: [[from, to]] replacements applied to content AND all question/instruction/note strings,
// keys: {q: answer}, notes: {q: fullLine}, q: {q: questionText}, fn: (doc) => {}
const TFNG = n => `Do the following statements agree with the information given in Reading Passage ${n}? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.`;
const P = d => ({ passage1: 1, passage2: 2, passage3: 3 })[d.category];
const YNNG = n => `Do the following statements agree with the views of the writer in Reading Passage ${n}? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.`;
// renumber a group's questions from `start` (and the __Qn__ placeholders in its notes/table) — for groups rebuilt by hand
const renum = (g, start) => {
  const map = {}; g.questions.forEach((q, i) => { map[q.questionNumber] = start + i; q.questionNumber = start + i; if (/^Question \d+$/.test(q.questionText)) q.questionText = `Question ${start + i}`; });
  const fix = s => s.replace(/__Q(\d+)__/g, (m, n) => map[n] ? `__Q${map[n]}__` : m);
  if (g.noteConfig) g.noteConfig.lines = g.noteConfig.lines.map(fix);
  if (g.tableConfig) g.tableConfig.rows = g.tableConfig.rows.map(r => r.map(fix));
  const end = start + g.questions.length - 1; g.groupTitle = start === end ? `Question ${start}` : `Questions ${start}–${end}`;
};
const setQ = (d, stems) =>d.questionGroups.flatMap(g => g.questions).forEach(q => { if (stems[q.questionNumber]) q.questionText = stems[q.questionNumber]; });

module.exports = {
  // ───── batch 2 ─────
  1514: {
    text: [['kept in its walk-in coolers, freezers, and root cellars the seeds of many thousands of heirloom varieties and, as you walk around', 'kept in its walk-in coolers, freezers, and root cellars. As you walk around'],
      ['non government-owned', 'non-government-owned'], ['may be problem ahead', 'may be problems ahead'], ['the past-but', 'the past – but'], ['apples, pears, and plums-each', 'apples, pears, and plums – each']],
    keys: { 13: 'population' },
    fn: d => { d.questionGroups[0].instruction = TFNG(1); const g = d.questionGroups[1]; g.noteConfig.title = g.noteConfig.lines.shift(); ['Supermarkets', 'Public awareness', 'Extinction of food varieties', 'Current problems in food production', 'Food production in the future'].forEach(h => { const i = g.noteConfig.lines.indexOf(h); if (i >= 0) g.noteConfig.lines[i] = `<strong>${h}</strong>`; }); },
  },
  1498: {
    text: [['correct person, A–D .', 'correct person, A–E.'], ['correct person, A–D', 'correct person, A–E'], ['letter, A–D', 'letter, A–E']],
    fn: d => { d.questionGroups = d.questionGroups.filter(g => g.questions.length); d.questionGroups[0].instruction = TFNG(2); },
  },
  1447: {
    text: [['report on reliance on the Indian village', 'report on the Indian village'], ['something mixing', 'sometimes mixing'], ['The farmers depend on', 'The farmers depended on'], ['Punukala', 'Punukula'],
      ['and they began to use it on other crops as well. The was using it. The status and economic opportunities of women improved - neem change gathered momentum as NPM became even more effective once everyone became a source of income for some of them,',
        'and they began to use it on other crops as well. The change gathered momentum as NPM became even more effective once everyone was using it. The status and economic opportunities of women improved – neem became a source of income for some of them,'],
      ['The improve situation', 'The improved situation'], ["These'middlemen'", "These 'middlemen'"], ['more money than other crop.', 'more money than other crops.']],
    keys: { 7: 'powder / a powder', 12: 'neem seeds / seeds', 5: 'evergreen tree', 6: 'natural pesticides', 9: 'cake', 10: 'nitrogen', 8: 'overnight', 13: 'water purification' },
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      const g2 = d.questionGroups[1]; g2.noteConfig.title = g2.noteConfig.lines.shift();
      ['Neem'].forEach(h => { const i = g2.noteConfig.lines.indexOf(h); if (i >= 0) g2.noteConfig.lines[i] = `<strong>${h}</strong>`; });
      const g = d.questionGroups[2];
      const stems = { 11: 'In which year did farmers finally stop using chemicals on cotton crops in Punukula?', 12: 'What did the women of Punukula collect to make money?', 13: 'What project do the authorities in Punukula hope to set up in the future?' };
      g.groupType = 'plain'; delete g.noteConfig;
      g.instruction = 'Answer the questions below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.';
      g.questions.forEach(q => { q.questionText = stems[q.questionNumber]; });
    },
  },
  1511: {
    text: [['Karl Bfenz', 'Karl Benz'], ['modem', 'modern'], ['gaso-line-powered', 'gasoline-powered'], ['who were Working', 'who were working'], ['market for the wealth', 'market for the wealthy'],
      ['were invented as carriers for human transport In 1806', 'were invented as carriers for human transport. In 1806'], ['emission control regulations*', 'emission control regulations'], ['with the. help', 'with the help'],
      ['boxes 20-26', 'boxes 33-39'], ['in box 27 on', 'in box 40 on']],
    keys: { 37: 'gas-guzzler / a gas-guzzler', 33: 'petrol-fueled internal combustion / internal combustion', 34: 'identity and status', 35: '15 minutes', 36: '1973 oil crisis / oil crisis', 38: 'fuel power', 39: 'toxic gas' },
  },
  1485: {
    text: [['Lewlngton', 'Lewington'], ['Lasrogfossum', 'Lasioglossum'], ['the mate dies', 'the male dies'], ['for each other little grubs to feed on', 'for each of the little grubs to feed on'],
      ['About the same size as a with', 'About the same size as a honeybee, with'], ['thought to feed on y on ivy', 'thought to feed only on ivy'], ['tiny grubs With', 'tiny grubs. With'],
      ['use mud leafcutter bees use sections of leaf The female', 'use mud, leafcutter bees use sections of leaf. The female'], ['to feed on When the female', 'to feed on. When the female'], ['she dies The emerging', 'she dies. The emerging'],
      ['Or are very local', 'or are very local'], ['In 2013. Ian', 'In 2013, Ian'], ['make its nest Females', 'make its nest. Females'], ['University of Sussex in England. Beth', 'University of Sussex in England, Beth'], ['She explains.', 'She explains,'], ['Solitarybees', 'Solitary bees'], ['Richard Lewington. best', 'Richard Lewington, best'], ['so little recognised, Solitary', 'so little recognised. Solitary']],
  },
  1481: {
    text: [['has seven paragraphs A-F', 'has six paragraphs, A-F'], ['Afrbome', 'Airborne'], [/g\/1\b/g, 'g/l'], ['helping then restoration', 'helping their restoration'], ['Over millennium', 'Over millennia']],
    keys: { 23: 'freshwater and sediment / freshwater and enriched sediment', 26: 'spawning and feeding / spawning and feeding grounds' },
  },
  1484: {
    text: [[/C02/g, 'CO2'], [/S02/g, 'SO2'], ['Daniel p. Schrag', 'Daniel P. Schrag'], ["In Easting's", "In Kasting's"], ['Pennsylvania state University', 'Pennsylvania State University'], ['stifling this', 'Stifling this'], ['in the afr', 'in the air'], ['the good production rocky layer', 'the production of thick layers'], ['" with SO2, it only takes a little.', 'With SO2, it only takes a little.']],
    keys: { 24: 'airborne water droplets', 25: 'limestone and carbonate / limestone / carbonate rocks' },
  },
  1464: {
    text: [['inside on of the', 'inside one of the'], ['broken- down', 'broken-down'], ['dust- covered', 'dust-covered'], ['furniture an old muffin pan', 'furniture, an old muffin pan'], ['with tin cans Situated', 'with tin cans. Situated'], ['sagebrush- covered', 'sagebrush-covered'], ['mountain range the old', 'mountain range, the old'],
      ['gold­mining', 'gold-mining'], ['once busy with life began', 'once busy with life, began'], ['the golds was gone', 'the gold was gone'], ['in the 1870a', 'in the 1870s'], ['8.000', '8,000'], ['The standard Company', 'The Standard Company'], ['in American to', 'in America to'],
      ['gold- grabbing', 'gold-grabbing'], ['heated in to release', 'heated it to release'], ['golf bars', 'gold bars'], ['the one, now the consistency of sand', 'the ore, now the consistency of sand,'], ['watered- down', 'watered-down'], ['pieces of zine', 'pieces of zinc'],
      ['“arrested decay,’', '‘arrested decay’,'], ['run- down', 'run-down'], ['which average 13 feet', 'which averages 13 feet'], ['sits and.... Into the floors', 'sits and soaks into the floors'], ['six months of each year.</p>\n\n<p>Strengthening', 'six months of each year strengthening'],
      ['originally used without constant attention', 'originally used. Without constant attention'], ['shrub- covered', 'shrub-covered'], ['Coyotes- and', 'Coyotes – and'], ['or bear- amble', 'or bear – amble'], ['homes in Bodies', 'homes in Bodie'], ['by- products', 'by-products'],
      ['that left Bodies', 'that left Bodie'], ['who visit.’ Ghost towns like Bodie, 1 cultural geographer Dydia DeLyser explains, 1 are', "who visit. 'Ghost towns like Bodie,' cultural geographer Dydia DeLyser explains, 'are"], ['authentic- actual', 'authentic – actual'], ['once were Delyser says', "once were.' DeLyser says"],
      ["asking questions like’ was all this", "asking questions like 'Was all this"], ['“was it all set up to make it look like a ghost town?', "'Was it all set up to make it look like a ghost town?'"], ['If would be a mistake, Delyser', 'It would be a mistake, DeLyser'],
      ['Mentals were', 'Metals were'], ['Large- scale', 'Large-scale'], ['mercury- covered', 'mercury-covered'], ['Of the original', 'of the original'],
      ['the Jeffrey pine the settlers', 'the Jeffrey pine the settlers used.'], ['contain move microbes than the soil found in places like.', 'contain more microbes than the soil found in places like Bodie.'], ['Bodie preservationists', 'Bodie’s preservationists']],
    keys: { 3: '20 percent / 20% / twenty percent' },
    fn: d => { const g = d.questionGroups[1]; g.instruction = TFNG(1); const n = d.questionGroups[0]; n.noteConfig.title = n.noteConfig.lines.shift(); ['About Bodie', 'Gold mining and milling'].forEach(h => { const i = n.noteConfig.lines.indexOf(h); if (i >= 0) n.noteConfig.lines[i] = `<strong>${h}</strong>`; }); },
  },
  1487: {
    text: [['expfres', 'expires'], ['envfronment', 'environment'], ['thefr co-pay', 'their co-pay'], ['Michael Chemew', 'Michael Chernew'], ['Nicolas J Gross', 'Nicholas J. Gross'], ['strike s the poor', 'strikes the poor'], ['as a matter of fact, the emitted', 'As a matter of fact, the emitted'], ['three times as expensive,', 'three times as expensive.']],
    keys: { 36: 'a federal ban / federal ban', 37: 'generic inhaled albuterol / inhaled albuterol', 38: 'CFCs / chlorofluorocarbons', 39: 'reformulated brand-name alternatives / brand-name alternatives', 40: 'uninsured' },
  },
  1475: {
    keys: { 16: 'A', 17: 'C', 24: 'plastic tubes / filter-fabric straws', 25: 'selective membrane / the selective membrane', 26: 'extract' }, // Huber contributed techniques to Virent; Tobey: efficient mass transfer "is not easy"
    text: [['Reading Passage 1?', 'Reading Passage 2?'], ['Assists to develop certain skills.', 'Helped another company to develop certain techniques.']],
  },

  // ───── pilot ─────
  1518: {
    keys: { 5: 'FALSE', 12: 'travel' }, // "compact and busy" ≠ simpler; "her love of painting, printmaking and travel"
    text: [['busy. using', 'busy, using'], ['surrounded bush', 'surrounded by bush'], ["Aboriginal' rock", 'Aboriginal rock'], ['to he a lifelong', 'to be a lifelong'], ["Dreamtime' creation", "'Dreamtime' creation"]],
    fn: d => {
      const g = d.questionGroups[1];
      g.noteConfig.title = "Margaret Preston's later life";
      g.noteConfig.lines = [
        '<strong>Aboriginal influence</strong>',
        '• interest in Aboriginal art was inspired by seeing rock engravings close to her Berowra home',
        '• incorporated __Q8__ and colours from Aboriginal art in her own work',
        '• often referred to Aboriginal sources in the __Q9__ she gave her artworks',
        '<strong>1953 exhibition</strong>',
        '• very old method of __Q10__ was used for some prints',
        '• was inspired by __Q11__ about Chinese art that she had started collecting in 1915',
        '• combination of Chinese and Aboriginal elements',
        '<strong>Old age</strong>',
        '• still interested in __Q12__ and art',
        '• worked for nearly six decades making more than __Q13__ artworks',
        "• dedicated to Australian art and the originality of her work is seen in Preston's long career",
      ];
    },
  },
  1541: {
    text: [['p Wall Garrard', 'Wall Garrard'], ['based on more on luck', 'based more on luck'], ['write about the migrants to islanders', 'write about the migrations to the islands'], ['mid­ocean', 'mid-ocean']],
  },
  1540: {
    keys: { 14: 'E' }, // the fence (E) "separates the main types of livestock" — two non-native animals
    text: [
      ['and adaption to prevent overpopulation', 'an adaptation to prevent overpopulation'],
      ['have only one fertile, which', 'have only one fertile female, which'],
      ['dingoes have been Australia', 'dingoes have been in Australia'], ['Johnsons says', 'Johnson says'],
      ['keep dingoes out of southeast, the fence separates', 'keep dingoes out of the southeast. The fence also separates'],
      ['to the southwest, sheep', 'to the southeast, sheep'], ['Lee Alien', 'Lee Allen'], ['by baiting m the area', 'by baiting, the area'],
      ['Westers Australia', 'Western Australia'], ['there are no fixes', 'there are no foxes'], ['just on prescription', 'just one prescription'],
      ['Which sections contains', 'Which section contains'], ['provide huge prey base', 'provide a huge prey base'], ['The Interaction', 'The interaction'],
    ],
  },
  1527: {
    text: [
      [/(\d) (st|nd|rd|th)\b/g, '$1$2'], ['270AD,after', '270 AD, after'], ['(150m)square', '(150 m) square'],
      ['the palaces itself', 'the palace itself'], ['too great repair', 'too great to repair'],
      ['and the redating by Miles Russell of the palace was designed for Lucullus', 'and if the redating by Miles Russell is correct and the palace was designed for Lucullus'],
      ['Tiberius</p>\n\n<p>Claudius', 'Tiberius Claudius'], ['had been built by the Sussex', 'has been built by the Sussex'],
      ['clos to', 'close to'], ['Researches agree', 'Researchers agree'], ['Costruction', 'Construction'], ['to the found', 'to be found'],
      ['Congidubnus -he', 'Cogidubnus – he'], ['Sallustius Lucullu-he', 'Sallustius Lucullus – he'], ['Verica -a', 'Verica – a'], ['Catuarus-his', 'Catuarus – his'],
      ['• A __Q13__', 'A __Q13__'],
    ],
    fn: d => { const g = d.questionGroups[1]; g.noteConfig.title = g.noteConfig.lines.shift(); ['Construction', 'Discovery', 'Possible inhabitants', 'Present Day'].forEach(h => { const i = g.noteConfig.lines.indexOf(h); if (i >= 0) g.noteConfig.lines[i] = `<strong>${h}</strong>`; }); },
  },
  1539: {
    keys: { 8: 'FALSE' }, // "once the storekeeper's permission has been obtained"
    notes: { 6: 'Small grocery stores in cities often cannot cope with competition from __Q6__ supermarkets' },
    text: [['products for sole', 'products for sale'], ['D.c.', 'D.C.'], ['OpenStreeMap', 'OpenStreetMap'], ['hasn’t caught them much', 'hasn’t attracted much']],
    fn: d => { const g = d.questionGroups[0]; g.noteConfig.title = g.noteConfig.lines.shift(); ['The Brooklyn Food Association', 'Reasons for the development of food deserts'].forEach(h => { const i = g.noteConfig.lines.indexOf(h); if (i >= 0) g.noteConfig.lines[i] = `<strong>${h}</strong>`; }); },
  },
  1526: {
    keys: { 13: 'worms' },
    text: [['are set swell', 'are set to swell'], ['with hide regard', 'with little regard'], ['In the MC,', 'In the UK,'], ['Jessica Even', 'Jessica Evert'],
      ['non­identical', 'non-identical'], [/<p>Note:<\/p>\s*<p>1 \.’’Centenarian”: someone who is 100 years or older\.<\/p>/, '<p><em>Centenarian: someone who is 100 years or older.</em></p>']],
  },
  1517: {
    text: [['on the toots', 'on the mats'], ['footstimulating', 'foot-stimulating'], ['modem environments', 'modern environments'], ['cobblestones*', 'cobblestones'],
      ['cobblestone mats"?', 'cobblestone mats?'], ["'paths of the senses -", "'paths of the senses' –"], ['hypertension of older adults,', "hypertension in older adults',"]],
  },
  1522: {
    notes: { 13: 'Many patients appreciate the fact that the Maori __Q13__ is used by healers' },
    text: [['before European arrived', 'before Europeans arrived'], ['disharmony with natures', 'disharmony with nature'], ['for Maori, Places', 'for Maori, places'],
      ['stick form a tree', 'stick from a tree'], ['making them SICK', 'making them sick'], ['by European in the 1800s', 'by Europeans in the 1800s'],
      ['which ahd trained', 'which had trained'], ['still a today', 'still is today'], ['Maori today largely accepted', 'Maori today largely accept'],
      ['Western medicine-statistics', 'Western medicine – statistics']],
    fn: d => { const g = d.questionGroups[1]; g.noteConfig.title = g.noteConfig.lines.shift(); ['Pre-European arrival', 'After European arrival', '1800s', '1970s', '2000s'].forEach(h => { const i = g.noteConfig.lines.indexOf(h); if (i >= 0) g.noteConfig.lines[i] = `<strong>${h}</strong>`; }); },
  },
  1519: {
    keys: { 14: 'G', 15: 'A', 16: 'F', 22: 'D' }, // checked vs passage + ECE key (G A F H / D A B C B)
    text: [['justitication', 'justification'], ['occur indifferent age', 'occur in different age'], ['Andrea Haiper', 'Andrea Halpern'], ['Drs Stewart and Halper', 'Drs Stewart and Halpern'],
      ["or 'earworms, and", "or 'earworms', and"], ['The idea that we have full control', "'The idea that we have full control"], ['the music m their heads', 'the music in their heads'],
      ['Zeigarik effect', 'Zeigarnik effect'], ['aural "hooks\'', "aural 'hooks'"], ['list of researcher below', 'list of researchers below'],
      ['how __Q21__ the task was Interestingly', 'how __Q21__ the task was. Interestingly'], ['from other people, Dr Stewart', 'from other people. Dr Stewart'],
      [/Scientists call them<\/p>\s*<p>'involuntary/, "Scientists call them 'involuntary"]],
    fn: d => { const g = d.questionGroups[1]; g.noteConfig.title = g.noteConfig.lines.shift(); },
  },
  1512: {
    keys: { 17: 'semantic / episodic', 18: 'episodic / semantic' }, // the two memory types can go in either gap
    text: [
      ['Since blood flow reflects neural activity. Rapoport could compare which networks of neurons were the same, the neural networks they used were significantly different. The older subjects used different internal strategies to accomplish comparable results at the same time,\'Rapoport says.',
        "Since blood flow reflects neural activity, Rapoport could compare which networks of neurons were being used by different subjects. 'Even when the reaction times of older and younger subjects were the same, the neural networks they used were significantly different. The older subjects used different internal strategies to accomplish comparable results at the same time,' Rapoport says."],
      ['mental activity maks neurons', 'mental activity makes neurons'], ['dendrites*', 'dendrites'], ['other 50 years earlier', 'others 50 years earlier'],
      ['lived longer then they were', 'lived longer when they were'], ["rats'brains", "rats' brains"], ['three factors-mental', 'three factors – mental'],
      ['Choose the correct letter A, B, C or D .', 'Choose the correct letter, A, B, C or D.']],
    fn: d => { const g = d.questionGroups[1]; g.noteConfig.title = g.noteConfig.lines.shift(); },
  },

  // ───── batch 3 (list pages 9–16) ─────
  1423: {
    text: [['May 20I0', 'May 2010'], ['By 2014, fur reports', 'By 2014, four reports'], ['GUiNZ ae descriptive', 'GUiNZ are descriptive'], ['was fur months', 'was four months'], ['( GUiNZ )', '(GUiNZ)']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(2);
      d.questionGroups[1].instruction = 'Which report does each of the following statements relate to? Write the correct letter, A, B, C or D, in boxes 20-26 on your answer sheet. NB You may use any letter more than once.';
    },
  },
  1420: {
    keys: { 25: 'FALSE' }, // mini says TRUE; text: processing only "sometimes"/"often" adds flavour — independent key (gradding.com) = FALSE
    text: [['new dilemma The beef', 'new dilemma. The beef'], ['China and India Processed', 'China and India. Processed'], ['dubbed “flavourists” who create', 'dubbed “flavourists” – who create'],
      ['plants of the New Jersey Turnpike', 'plants off the New Jersey Turnpike'], ['not as had as', 'not as bad as'], ['Write the correct letter. A-G,', 'Write the correct letter, A-G,']],
    fn: d => {
      d.questionGroups[1].instruction = TFNG(2);
      d.questionGroups[2].instruction = 'Choose the correct letter, A, B, C or D.';
      setQ(d, { 26: 'The writer of Reading Passage 2 concludes that natural flavours' });
    },
  },
  1418: {
    keys: { 14: 'Trade Not Aid', 15: 'coffee', 16: 'a tiny number / tiny number', 17: 'positively', 18: 'higher prices' },
    text: [['the most recognisable, fund on', 'the most recognisable, found on'], ['of the extra 18% is charged', 'of the extra 18% it charged'], ['colossal marketing scam- and', 'colossal marketing scam – and'],
      ['labelled as fair-trade is in fact not', 'labelled as fair-trade are in fact not']],
    fn: d => {
      const g = d.questionGroups[0]; g.noteConfig.lines.splice(0, 2, g.noteConfig.lines[0] + ' ' + g.noteConfig.lines[1]);
      g.instruction = 'Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 14-18 on your answer sheet.';
      d.questionGroups[2].instruction = YNNG(2);
    },
  },
  1417: {
    keys: { 24: 'natural language / their natural language' },
    text: [['accustomed to-a person', 'accustomed to – a person'], ['acquisition of speech-treated', 'acquisition of speech – treated'], ['invited-but not obligated-to', 'invited – but not obligated – to'],
      ['society-such as cochlear implants or genetic engineering-mean', 'society – such as cochlear implants or genetic engineering – mean'], ['decolonising SLPs-by', 'decolonising SLPs – by'],
      ['together-hearing and Deaf alike-strive', 'together – hearing and Deaf alike – strive'], ['In Search of Deafhood ‘,', 'In Search of Deafhood’,'], ['the Deaf Way’ or doing', 'the Deaf Way’ of doing'],
      ['the word ‘dear', 'the word ‘deaf’']],
    fn: d => { d.questionGroups[2].instruction = 'Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet.'; },
  },
  1408: {
    text: [['developed by die late eighteenth', 'developed by the late eighteenth'], ['Worse for die drinkers', 'Worse for the drinkers'], ['than it was words', 'than it was worth']],
    fn: d => {
      const g = d.questionGroups[0];
      g.instruction = 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 1-7 on your answer sheet.';
      g.noteConfig.lines = g.noteConfig.lines.filter(l => !/^Use ONE WORD/.test(l)).map(l => l.replace(/^\d+ /, '').replace(/(__Q\d+__)$/, '$1.'));
      d.questionGroups[1].instruction = TFNG(1);
    },
  },
  1401: {
    text: [['in die Grimm’s’ collection', 'in the Grimms’ collection'], ['An innkeeper daughter', 'An innkeeper’s daughter'], ['Among her treasure was “Aschenputtel” -Cinderella.', 'Among her treasures was “Aschenputtel” – Cinderella.'],
      ['was not the Grimm’s fantasy”, Rolleke points out” It reflected the law-and-order system of the old times”.', 'was not the Grimms’ fantasy,” Rolleke points out. “It reflected the law-and-order system of the old times.”'],
      ['of the writing, you have no concrete', 'of the writing: “You have no concrete'], ['timeless and placeless,” The tales', 'timeless and placeless.” “The tales'],
      ['original text. They show a striving', 'original text. “They show a striving'], ['promoted the therapeutic of', 'promoted the therapeutic value of'], ['the “great comforters. By', 'the “great comforters”. By']],
    // all 14 keys match an independent key (leapscholar.com)
    fn: d => {
      d.questionGroups[0].instruction = YNNG(3);
      d.questionGroups[2].instruction = 'Complete each sentence with the correct ending, A-H, below. Write the correct letter, A-H, in boxes 36-40 on your answer sheet.';
    },
  },
  1400: {
    // paragraph F is garbled in every online copy; minimal repair without adding facts
    text: [['the urgent need to get fuel-cell vehicles will be available in most showrooms.', 'the need to get fuel-cell vehicles into most showrooms is urgent.'],
      ['One of the first prototype fuel-cell-powered vehicles have been built', 'One of the first prototype fuel-cell-powered vehicles has been built'], ['fuel-ceils', 'fuel-cells'], ['The United Nation’s Climate', 'The United Nations’ Climate']],
    // all 14 keys match an independent key (ieltsvisa.com)
    fn: d => { d.questionGroups[2].instruction = TFNG(3); },
  },
  1398: {
    text: [['invented the epic here,', 'invented the epic hero,'], ['Through the ancient sprint remains', 'Though the ancient sprint remains'], ['Leonardo Forgassi', 'Leonardo Fogassi'], ['The discovered that', 'They discovered that'],
      ['motor actions’. Just as there are grammars of movement. These networks', 'motor actions’. Just as there are grammars of movement, these networks'], ['a lop-side metal stick', 'a lopsided metal stick'],
      ['They note, The main', 'They note: ‘The main'], ['phenomenon of neural mirror was', 'phenomenon of neural mirroring was'], ['Gastaut and Berf', 'Gastaut and Bert'], ['active when your bodies are still', 'active when our bodies are still'],
      ['as on TV, these results', 'as on TV. These results'], ['the amygdale', 'the amygdala'], ['comes in watching, when we gather', 'comes in watching. When we gather']],
    fn: d => { d.questionGroups[2].instruction = YNNG(3); },
  },
  1397: {
    keys: { 40: 'wrong punch lines / the wrong punch lines / wrong punchlines' },
    text: [['an outstretched aim', 'an outstretched arm'], ['yon arc tickled', 'you are tickled'], ['a boost to dying immune system', 'a boost to the immune system'], ['photograph die brain activity', 'photograph the brain activity'],
      ['important for cognitive processing the supplementary', 'important for cognitive processing; the supplementary'],
      [/Within ‘The Mystery of Ticklish Laughter and “Can a Machine Tickle\S* they explained/, 'In ‘The Mystery of Ticklish Laughter’ and ‘Can a Machine Tickle?’ they explained'],
      ['were not aware that who or what', 'were not aware of who or what'], ['brain’s ‘Tunny bone”', 'brain’s ‘funny bone’'], ['humor and laughter Results', 'humor and laughter. Results'],
      ['frontal lobes damages', 'frontal lobe damage'], ['combined with the anticipation of pleasure, cause laughter', 'combined with the anticipation of pleasure, causes laughter']],
    fn: d => { d.questionGroups[1].instruction = 'Look at the following researchers (Questions 34-37) and the list of findings below. Match each researcher with the correct finding, A-F. Write the correct letter, A-F, in boxes 34-37 on your answer sheet. NB There are more findings than researchers.'; },
  },
  1386: {
    text: [['possible knocked out', 'possibly knocked out'], ['Mungo Man was attributed within 1999', 'Mungo Man was attributed in 1999'], ['1.5 million years ago.) if Mungo', '1.5 million years ago.) If Mungo'],
      ['Pddbo', 'Pääbo'], ['Feldholer', 'Feldhofer'], ['remain Australian’s oldest', 'remain Australia’s oldest'], ['Recent fossils find show', 'Recent fossil finds show'],
      ['Because Thorne is the country’s', 'Thorne is the country’s'], ['because of the Australian research, Professor Chris Stringer', 'because of the Australian research. Professor Chris Stringer']],
    fn: d => {
      d.questionGroups[0].instruction = 'Look at the following statements (Questions 27-34) and the list of people below. Match each statement with the correct person, A-F. Write the correct letter, A-F, in boxes 27-34 on your answer sheet. NB You may use any letter more than once.';
      d.questionGroups[1].instruction = TFNG(3);
      setQ(d, {
        27: 'Found the cremated remains of Mungo Lady while searching for ancient lakes.',
        28: 'Was sceptical about how reliable the DNA analysis of some fossils was.',
        29: 'Dated Mungo Man as much younger than the earlier estimate of 62,000 years.',
        30: 'Said that the age of Mungo Man has little to do with the debate about the origins of modern humans.',
        31: 'Led the research group that recovered DNA evidence from the first Neanderthal remains ever found.',
        32: 'Supports the idea that Australia’s megafauna were wiped out by the hunting of the first humans to arrive.',
        33: 'Supports the multi-regional explanation rather than a single place of origin for modern humans.',
        34: 'Believes that climate change, rather than human activity, may have played a role in the megafauna’s extinction.',
        35: 'The Lake Mungo remains give archaeologists a picture of how people lived around the lake.',
        36: 'Weapons used by Mungo Man were found among the Lake Mungo remains.',
        37: 'Mungo Man is one of the oldest known examples in the world of cultural sophistication such as a burial ritual.',
        38: 'The skeletons of Mungo Man and Mungo Lady were uncovered in the same year.',
      });
    },
  },

  // ───── batch 4 (list pages 17–29) ─────
  1323: {
    text: [['• the extent and nature of food promotion to children', '• the extent and nature of food promotion to children;'], [/<p>the effect, if any,/, '<p>• the effect, if any,'],
      ['advertising for fast food, outlets', 'advertising for fast food outlets'], ['(eg. Obesity or cholesterol levels)', '(e.g. obesity or cholesterol levels)'], ['the direct effects of individual children', 'the direct effects on individual children'],
      ['diet prompted in food advertisements', 'diet promoted in food advertisements'], ['tend to be partial and incomplete', 'tends to be partial and incomplete.']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x, in boxes 14-20 on your answer sheet.';
      d.questionGroups[1].instruction = YNNG(2);
    },
  },
  1314: {
    keys: { 26: 'flaw / weakness' },
    text: [['most likely-relating', 'most likely – relating'], ['verbatim-word for word', 'verbatim – word for word'], ['would seem-so we assume to have given way', 'would seem – so we assume – to have given way'],
      ['essential modem phenomenon', 'essential modern phenomenon'], ['no further for essential advice then the', 'no further for essential advice than the'], ['‘the suspension of disbelief.', '‘the suspension of disbelief’.'], ['literary landmarks-stories by which', 'literary landmarks – stories by which'], ['a human side-some flaw or weakness to which mortals are prone-is', 'a human side – some flaw or weakness to which mortals are prone – is'],
      ['is intrinsically dramatic.d by logging.', 'is intrinsically dramatic.'], ['Aristotle viewed Homers works', 'Aristotle viewed Homer’s works']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 14-18 on your answer sheet.';
      d.questionGroups[1].instruction = 'Classify the following as referring to A, B or C below. Write the correct letter, A, B or C, in boxes 19-22 on your answer sheet. NB You may use any letter more than once.';
      const n = d.questionGroups[2]; n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/^\d+ /, '').replace(/(__Q\d+__)$/, '$1.'));
    },
  },
  1310: {
    text: [['as eastern agricultural landfilled to capacity', 'as eastern agricultural land filled to capacity'], ['the federal government’s solution in 1881 of Winnipeg', 'the federal government’s selection in 1881 of Winnipeg'],
      ['the secondary goal for joining British Columbia', 'the secondary goal of joining British Columbia'], ['Eastern Canadians and British immigrant offered', 'Eastern Canadians and British immigrants offered'],
      ['would supply __Q21__. for the descendants', 'would supply __Q21__ for the descendants'], ['Politicians also declared that Western is got potential to increase __Q22__ of Canada according to __Q23__ crop that consumed in the East.', 'Politicians also declared that the West had the potential to increase the __Q22__ of Canada, especially the __Q23__ crop consumed in the East.']],
    fn: d => { d.questionGroups[0].instruction = 'Reading Passage 2 has eight paragraphs, A-H. Choose the correct heading for paragraphs B-H from the list of headings below. Write the correct number, i-xii, in boxes 14-20 on your answer sheet.'; },
  },
  1320: {
    text: [['Part, “Haunted by Music,”', 'Part I, “Haunted by Music,”'], ['but Cicoria, has declined', 'but Cicoria has declined'], ['the blind often has better hearing', 'the blind often have better hearing'],
      ['Scientists cannot yet explain how music achieves this effect', 'Scientists cannot yet explain how music achieves this effect.'], ['He nearly died because of the lightening.', 'He nearly died because of the lightning.']],
    fn: d => {
      const g = d.questionGroups[1]; g.instruction = YNNG(3); g.questions.forEach(q => { q.type = 'yes-no-ng'; });
      d.questionGroups[0].instruction = 'Choose the correct letter.';
      const q29 = d.questionGroups[0].questions.find(q => q.questionNumber === 29); q29.options = q29.options.slice(0, 3); // D duplicated C in every copy
    },
  },
  1298: {
    keys: { 5: '950 degrees / 950', 6: '60 minutes / 60 mins' },
    text: [['A handful of clay yesterday’s coffee grounds', 'A handful of clay, yesterday’s coffee grounds'], ['as thick as an adult’s index.', 'as thick as an adult’s index finger.'], ['organic material that bums readily', 'organic material that burns readily'],
      ['“A potter’s din is an expensive item and can could take up to four or five hours to get upto 800 degrees.', '“A potter’s kiln is an expensive item and could take up to four or five hours to get up to 800 degrees.'],
      ['community in East Timor The charity', 'community in East Timor. The charity'], ['While the AF problems of producing', 'While the problems of producing'],
      ['to create a thick mixture sun dried.', 'to create a thick mixture, then sun-dried.'], ['around the cylinders place them in __Q4__ which is as burning fuel for firing (maximum temperature: __Q5__ ) filter being baked in under __Q6__', 'around the cylinders; place them in __Q4__, which is used as the burning fuel for firing (maximum temperature: __Q5__); the filter is baked in under __Q6__.']],
    fn: d => {
      const g = d.questionGroups[0]; g.noteConfig.title = g.noteConfig.lines.shift();
      d.questionGroups[1].instruction = TFNG(1);
    },
  },
  1293: {
    text: [['how to get from B to c, too', 'how to get from B to C, too'], ['logical thinking. Grand Central, Please Imagine that', 'logical thinking. Imagine that'], ['Head for that “the station is right below it.”', 'Head for that – the station is right below it.”'],
      ['retrace then steps', 'retrace their steps'], ['street comer', 'street corner'], ['directions-straight, turn, go through', 'directions – straight, turn, go through'],
      ['G . Road Map or Metaphor? On your next visit', 'G . On your next visit'], ['the large scale-that is', 'the large scale – that is'], ['Path integration,', 'Path integration']],
    fn: d => {
      d.questionGroups[0].instruction = 'Classify the following statements as referring to A, B or C below. Write the correct letter, A, B or C, in boxes 14-18 on your answer sheet. NB You may use any letter more than once.';
      d.questionGroups[2].instruction = TFNG(2);
      const g0 = d.questionGroups[0]; if (g0.matchingOptions) g0.matchingOptions = g0.matchingOptions.map(o => o.replace(/^\.\s*/, '').replace(/,$/, ''));
    },
  },
  1267: {
    keys: { 14: 'navigation and communications / navigation and communication' },
    text: [['the court decided that hems putting the flight at risk', 'the court decided that he was putting the flight at risk'], ['Herndon, Virginia, Not do they affect other critical systems, she says The only impact', 'Herndon, Virginia. Nor do they affect other critical systems, she says. The only impact'],
      ['the pilot hears a wry slight beep', 'the pilot hears a very slight beep'], ['the CAA’s Safely Regulation Croup', 'the CAA’s Safety Regulation Group'], ['he says Another study', 'he says. Another study'],
      ['is much more worrying, lie says', 'is much more worrying, he says'], ['especially if a mouse is attached {the wire operates as an antenna or if', 'especially if a mouse is attached (the wire operates as an antenna) or if'],
      ['intentional emission,” lie says', 'intentional emission,” he says'], ['with the same signal This effect', 'with the same signal. This effect'], ['chances of a Plane Crash', 'chances of a plane crash'],
      ['recommended their wholesale ban on flights, But if', 'recommended their wholesale ban on flights. But if'], ['deal with __Q14__ Those devices', 'deal with __Q14__. Those devices'],
      ['Mobile usages should be forbidden in specific fame.', 'Mobile phone use should be forbidden during specific phases of a flight.'], ['FAA initialed open debate', 'The FAA initiated an open debate'], ['Organization (listed A-E )', 'organisations and people (listed A-E)']],
    fn: d => { d.questionGroups[2].instruction = TFNG(2); },
  },
  1265: {
    text: [['the centers of the trade-in aromatic resins', 'the centers of the trade in aromatic resins'], ['The trade-in spices and perfumes', 'The trade in spices and perfumes'], ['(Job 42:14)</p>', '(Job 42:14).</p>']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 14-20 on your answer sheet.';
      d.questionGroups[1].instruction = TFNG(2);
    },
  },
  1262: {
    text: [['It was a phenomenal finding’, she says.', '‘It was a phenomenal finding,’ she says.'], ['If you building a friendship', 'If you build a friendship'], ['doesn’t work that way, I think that they give', 'doesn’t work that way. I think that they give']],
    // the source mis-split the Q14–17 statements; in the original order they match the keys C A D C exactly
    fn: d => (d.title = 'Undoing Our Emotions', d.content = d.content.replace('<h2>UNDOING OUR EMOTIONS</h2>', '<h2>Undoing Our Emotions</h2>'), setQ(d, {
      14: 'a conclusion that it is possible to train people to deal with anxiety',
      15: 'conclusive evidence that lifespan can be influenced by emotions',
      16: 'an explanation of the way negative emotions affect what people concentrate on',
      17: 'an experiment that showed how a positive outlook can help people adjust to a stressful situation faster than others',
    })),
  },
  1253: {
    text: [['used fMRls on six synaesthetes', 'used fMRIs on six synaesthetes'], ['witness a film character gets shot', 'witness a film character get shot'], ['Dr Witthof and Dr Winawer', 'Dr Witthoft and Dr Winawer'], ['Fischer-Price magnets', 'Fisher-Price magnets'],
      ['its own personality-the letter A', 'its own personality – the letter A'], ['dull or hideous colour for you-or vice versa', 'dull or hideous colour for you – or vice versa'], ['older people-using synaesthesia', 'older people – using synaesthesia'], ['graphemes and colours-pairings', 'graphemes and colours – pairings']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 3 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 27-33 on your answer sheet.';
      d.questionGroups[1].instruction = TFNG(3);
      const n = d.questionGroups[2]; n.noteConfig.lines = [n.noteConfig.lines.join(' ').replace(/\s+/g, ' ')];
    },
  },

  // ───── batch 5 ─────
  1255: {
    keys: { 10: 'tiers' }, // mini says BOXES; the diagram labels the cake layers — independent key (gradding.com) = tiers
    text: [['since antiquity. Weddings customarily', 'since antiquity, weddings customarily'], ['as n symbol of good fortune', 'as a symbol of good fortune'], ['oysters, pine nuts lamb and spices', 'oysters, pine nuts, lamb and spices'],
      ['a small piece of the pier not to do so', 'a small piece of the pie; not to do so'], [/(\d+) th century/g, '$1th century'], ['because they were a bit put on top of each other', 'because they were not put on top of each other'],
      ['higher cakes sinking into tower cakes', 'higher cakes sinking into lower cakes']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      d.questionGroups[1].noteConfig = { title: 'Wedding cakes', lines: ['<strong>17th century – Britain: Bride Cake</strong>', '– expensive ingredients were a sign of wealth', '– less expensive round cakes were made of __Q7__ with currants in between and sugar on top', '– they were baked on a hearth stone because not all homes had __Q8__', '<strong>Now – United States: groom’s cake</strong>', '– guests receive pieces of the groom’s cake', '– cakes may represent the __Q9__ of the groom'] };
    },
  },
  1142: {
    text: [['(i., the word', '(i.e. the word']],
    fn: d => {
      const g = d.questionGroups[0]; g.groupType = 'table'; delete g.noteConfig;
      g.tableConfig = { headers: ['Test', 'Findings'], rows: [
        ['Observing the __Q27__ of Russian-English bilingual people when asked to select certain objects', 'Bilingual people engage both languages simultaneously: a mechanism known as __Q28__'],
        ['A test called the __Q29__, focusing on naming colours', 'Bilingual people are more able to handle tasks involving a skill called __Q30__'],
        ['A test involving switching between tasks', 'When changing strategies, bilingual people have superior __Q31__']] };
      d.questionGroups[1].instruction = YNNG(3);
      d.questionGroups[2].instruction = 'Reading Passage 3 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 37-40 on your answer sheet.';
    },
  },
  950: {
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-viii, in boxes 14-19 on your answer sheet.';
      d.questionGroups[1].instruction = 'Look at the following statements (Questions 20-23) and the list of experiments below. Match each statement with the correct experiment, A, B or C. Write the correct letter, A, B or C, in boxes 20-23 on your answer sheet. NB You may use any letter more than once.';
      const n = d.questionGroups[2]; n.instruction = 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet.';
      n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/^\d+ /, '').replace(/(__Q\d+__)$/, '$1.'));
    },
  },
  1144: {
    keys: { 22: 'mosquitos / mosquitoes' },
    text: [['the mosquitos that can give people this disease can grew', 'the mosquitos that can give people this disease can grow'], ['(of lack thereof)', '(or lack thereof)']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 14-19 on your answer sheet. NB You may use any letter more than once.';
      const n = d.questionGroups[1]; n.instruction = 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 20-26 on your answer sheet.';
      n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/^\d+ /, '').replace(/(__Q\d+__)$/, '$1.'));
    },
  },
  1096: {
    keys: { 39: 'missionaries and traders / the missionaries and the traders' },
    text: [['played a major role in world p', 'played a major role in world population growth.']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 3 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 27-34 on your answer sheet.';
      d.questionGroups[1].instruction = TFNG(3);
      d.questionGroups[2].instruction = 'Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 39-40 on your answer sheet.';
      setQ(d, { 31: 'An overall description of the species lacking in the Old World and the New World', 34: 'An account of European animals taking root in the New World' });
    },
  },
  1402: {
    keys: { 19: 'mail-order company', 20: 'chain store / chain', 22: 'celebration / sale' },
    text: [['History of Fanner trading company', 'History of Farmers Trading Company'], ['a Fanners store', 'a Farmers store'], ['established die century-old business', 'established the century-old business'], ['an account with die company', 'an account with the company'],
      ['the language of the catalogues hasn’t Robert Laidlaw', 'the language of the catalogues hasn’t. Robert Laidlaw'], ['aims were simple to build', 'aims were simple: to build'], ['I decided that upon the lookout tower', 'I decided that up on the lookout tower'],
      ['So I went up to the boy said,’ Son, have you got your penny? ‘He handed it to me. It was hot he’d had it', 'So I went up to the boy and said, ‘Son, have you got your penny?’ He handed it to me. It was hot – he’d had it'],
      ['in the 1970s his stuffed remains', 'in the 1970s; his stuffed remains'], ['We were first price point focused, we weren’t fashion focused. “Remove', 'We were first price point focused, we weren’t fashion focused.” Remove'],
      ['World War n,', 'World War II,'], ['Robert Laidlaw a committed Christian who came to his faith at a 1902 evangelistic service in Dunedin concluded', 'Robert Laidlaw – a committed Christian who came to his faith at a 1902 evangelistic service in Dunedin – concluded'],
      ['David and Anne Norman the latter being', 'David and Anne Norman, the latter being'], ['in their centenary celebration everything from', 'in their centenary celebration – everything from'],
      ['Generosity offered in an occasion.', 'An act of generosity on one occasion.'], ['Innovation of offer made by the head of company.', 'An innovative offer made by the head of the company.'], ['A romantic event on the roof of farmers.', 'A romantic event on the roof of a Farmers building.'],
      ['Farmers were sold to a private owned company.', 'Farmers was sold to a privately owned company.'], ['Product became worse as wrong aspect focused.', 'The business suffered because it focused on the wrong things.'], ['Character of the company was changed.', 'The character of the company changed.']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 14-18 on your answer sheet.';
      d.questionGroups[2].instruction = 'Look at the following statements (Questions 24-26) and the list of people below. Match each statement with the correct person, A, B or C. Write the correct letter, A, B or C, in boxes 24-26 on your answer sheet.';
    },
  },
  1381: {
    text: [['as these rots, nutrients', 'as these rot, nutrients'], ['grown on the750,000 acres', 'grown on the 750,000 acres'], ['could mate matters much worse', 'could make matters much worse'], ['Man-made wetlands, at present, being built', 'Man-made wetlands, at present being built']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has ten paragraphs, A-J. Which paragraph contains the following information? Write the correct letter, A-J, in boxes 14-17 on your answer sheet.';
      d.questionGroups[1].instruction = 'Look at the following statements (Questions 18-21) and the list of people below. Match each statement with the correct person, A, B or C. Write the correct letter, A, B or C, in boxes 18-21 on your answer sheet. NB You may use any letter more than once.';
      d.questionGroups[2].instruction = TFNG(2);
      setQ(d, {
        14: 'the view that seagrasses can tolerate more salinity than is found in the bay',
        15: 'why finding the cause of the ecological change matters',
        16: 'expensive proposals to solve the nitrogen problem',
        17: 'figures showing the loss of coral cover and coral species',
        18: 'Drainage in the Everglades has made the water in the bay saltier.',
        19: 'Restoring freshwater rich in nitrogen will cause more ecological damage.',
        20: 'High nitrogen levels may be caused by the nearby farmland.',
        21: 'Sewage discharges, rather than nutrients from farmland, are the main cause of the problem.',
        22: 'Everyone agrees that pouring fresh water into Florida Bay is harmless.',
        23: 'Different types of crops release different amounts of nitrogen into the water.',
        24: 'The Everglades restoration project will be effective whatever the cause of the pollution.',
        25: 'Nobody knows what Florida Bay was like before the 1950s.',
        26: 'Tourism is fundamental to the economy of the Florida Keys.',
      });
    },
  },
  1372: {
    keys: { 29: 'families and friends / friends and family / family and friends', 30: 'practitioner', 31: 'diagnosis' },
    text: [['You know have proof that you are ill', 'You now have proof that you are ill'], ['as well as the subjective experiences are mediated', 'as well as the subjective experiences. These are mediated']],
    fn: d => {
      const g = d.questionGroups[0]; g.groupType = 'table'; delete g.noteConfig;
      g.instruction = 'Complete the table below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 27-32 on your answer sheet.';
      g.tableConfig = { headers: ['Source of knowledge', 'Examples'], rows: [
        ['Personal experience', 'Symptoms of a __Q27__ and tiredness'],
        ['', 'The doctor’s measurements, e.g. taking your __Q28__ and temperature'],
        ['', 'Common judgements from __Q29__ around you'],
        ['Scientific evidence', 'Medical knowledge from the general __Q30__, e.g. the doctor’s medical __Q31__'],
        ['', 'Testing a medical hypothesis in the light of previous training and __Q32__']] };
      d.questionGroups[1].instruction = 'Reading Passage 3 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 33-40 on your answer sheet. NB You may use any letter more than once.';
    },
  },
  1370: {
    keys: { 33: 'consumer’s right / consumer\'s right / consumers right', 35: 'skiing' },
    text: [['the many pestilences that result from were threatened to kill', 'the many pestilences that result from war threatened to kill'], ['blood transfusions. CAT scans', 'blood transfusions, CAT scans'],
      ['people should also the consideration of the __Q33__', 'people should also take into consideration the __Q33__'], ['experts believe that future population desperately needs __Q36__ in spite of their undefined risks. However, the researchers conducted so far', 'promoters believe that the future population desperately needs __Q36__ in spite of their undefined risks. However, the research conducted so far']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(3);
      d.questionGroups[1].instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 33-39 on your answer sheet.';
      d.questionGroups[2].instruction = 'Choose the correct letter, A, B, C or D. Write your answer in box 40 on your answer sheet.';
    },
  },
  1360: {
    text: [['in modem-day Norway', 'in modern-day Norway'], ['with modem-day Istanbul', 'with modern-day Istanbul'], ['colonists to modem-day Canada', 'colonists to modern-day Canada'], ['some Danish historians cal1 these', 'some Danish historians call these'],
      ['Views of Vikings change according to not only to forces', 'Views of Vikings change according not only to forces']],
    fn: d => {
      d.questionGroups = d.questionGroups.filter(g => g.questions.length); // the source's final MC question is missing
      const n = d.questionGroups[0]; n.instruction = 'Complete the notes below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 14-18 on your answer sheet.';
      n.noteConfig.lines = ['<strong>Origins</strong>', '• The word ‘Viking’ is __Q14__', '• Vikings came from Scandinavia.', '<strong>Dates of the Viking Age</strong>', '• In Britain: AD __Q15__ – 1066', '• Length varies elsewhere', '<strong>Territorial extent</strong>', '• In doubt – but most of Europe', '• Possibly raided as far away as __Q16__', '<strong>End of the Viking Age</strong>', '• Vikings had assimilated into __Q17__, and adopted a new __Q18__ system.'];
      d.questionGroups[1].instruction = 'Look at the following statements (Questions 19-26) and the list of times and places below. Match each statement with the correct place or time, A-H. Write the correct letter, A-H, in boxes 19-26 on your answer sheet.';
    },
  },

  // ───── batch 6 ─────
  1358: {
    // paragraph E repeated most of F word for word; all 14 keys match an independent key (engnovate.com)
    text: [['sadness pumps the tear glands. But exactly how placebos work their medical magic is still largely unknown. Most of the scant research done so far has focused on the control of pain because it’s one of the commonest complaints and lends itself to experimental study. Here, attention has turned to the endorphins, morphine-like neurochemicals known to help control pain.', 'sadness pumps the tear glands.'],
      ['have no direct effect on the body, yet still, work because', 'have no direct effect on the body, yet still work because'], ['integrated into conventional medicines', 'integrated into conventional medicine']],
    fn: d => {
      d.questionGroups[0].instruction = 'Complete each sentence with the correct ending, A-H, below. Write the correct letter, A-H, in boxes 27-32 on your answer sheet.';
      d.questionGroups[2].instruction = TFNG(3);
      setQ(d, { 29: 'An alternative practitioner who has faith in what he does', 30: 'The illnesses of patients who are convinced by alternative practice', 32: 'Conventional medical doctors, who are aware of the placebo effect,' });
    },
  },
  1354: {
    text: [['with Sigmund Feud, who theorized', 'with Sigmund Freud, who theorized'], ['That old them that a lot more', 'That told them that a lot more'], ['“activation-synthesis hypothesis’”', '“activation-synthesis hypothesis”'],
      ['they’re certainly not – talking about it', 'they’re certainly not talking about it'], ['dreams are a ‘backdoor’, into', 'dreams are a ‘backdoor’ into'], ['“If you’re going to understand human behavior,” says Rosalind Cartwright, a chairman', '“If you’re going to understand human behavior,” says Rosalind Cartwright, chairman'],
      ['Reference of an artist’s dreams who has versatile talents', 'a reference to a man with many talents who has no dreams'], ['The dream actually happens to many animals', 'the kind of sleep associated with dreaming is found in many animals'],
      ['Dreams are related to benefit and happiness', 'the benefits of dreams for mental health'], ['advanced scientific technology applied in the investigation of the REM stage.', 'advanced technology used to study the brain during REM sleep'],
      ['questioning concern raised about the usefulness of investigation on dreams', 'doubts about whether studying dreams is worthwhile'], ['medical relief for children with an ill desire', 'medical relief for sick people'], ['Dreams seem to be as randomly occurring and have limited research significance.', 'Dreams occur randomly and are of limited value for research.'],
      ['Decoding dreams would provide a reminder to human desire in the early days', 'Analysing dreams can reveal unconscious desires from childhood'], ['Dreams sometimes come along with REM as no more than a trivial attachment', 'Dreams may be no more than a by-product of REM sleep']],
    fn: d => {
      d.title = 'What Are Dreams?'; d.content = d.content.replace('<h2>What Are Dreams ?</h2>', '<h2>What Are Dreams?</h2>');
      d.questionGroups[0].instruction = 'Reading Passage 3 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 27-31 on your answer sheet.';
      d.questionGroups[2].instruction = 'Look at the following statements (Questions 35-40) and the list of people below. Match each statement with the correct person, A-G. Write the correct letter, A-G, in boxes 35-40 on your answer sheet.';
    },
  },
  1353: {
    keys: { 6: 'colonies / societies', 1: 'Persian wars / the Persian wars' }, // independent key (thesol.edu.vn) = colonies
    fn: d => {
      const g = d.questionGroups[0]; g.groupType = 'table'; delete g.noteConfig;
      g.instruction = 'Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 1-8 on your answer sheet.';
      g.tableConfig = { headers: ['Time', 'Destination', 'Traveller', 'Purpose'], rows: [
        ['Classical era', 'Egypt and Anatolia', 'Herodotus', 'To obtain information on __Q1__'],
        ['1st century BC', 'Central Asia', 'Zhang Qian', 'To seek __Q2__'],
        ['Roman Empire', 'Mediterranean', 'Ptolemy, Strabo, Pliny the Elder', 'To gather __Q3__'],
        ['Post-classical era', 'Eastern Hemisphere', 'Muslims', 'For business and __Q4__'],
        ['5th to 9th centuries CE', 'India', 'Asian Buddhists', 'To study with __Q5__ and for spiritual enlightenment'],
        ['Early modern era', 'Distant places of the globe', 'Europeans', 'To meet the public’s expectations about the outside world'],
        ['19th century', 'Asia, Africa', 'Colonial administrators', 'To provide information on the __Q6__ they conquered'],
        ['Mid-19th century', 'Europe and the United States', 'Sun Yat-sen, Fukuzawa Yukichi', 'To learn __Q7__ for the reorganisation of their societies'],
        ['20th century', 'Mass tourism', 'People from __Q8__ countries', 'For entertainment']] };
    },
  },
  1347: {
    keys: { 39: 'river / Severn River / Severn', 40: 'Coalbrookdale museum / the Coalbrookdale museum' },
    text: [['This is how Michael Rooker was Iron Bridge in his 1792 painting.', 'This is how Michael Rooker saw Iron Bridge in his 1792 painting.'], ['‘The Wonder of Work”', '“The Wonder of Work”'],
      ['Art connected with architecture for the first time.', 'an early example of artists seeing beauty in a work of engineering'], ['small artistic object and constructions built are put together', 'man-made structures appearing in paintings alongside natural scenes'],
      ['the working condition were recorded by the artist as an exciting subject.', 'an artist who found a factory the most exciting subject he had ever worked on'], ['mention of one engineers’ artistic work on an unfinished engineering project', 'mention of an artist’s pictures of unfinished engineering projects'],
      ['Two examples of famous bridges which became the iconic symbols of those cities', 'two famous bridges that have become symbols of their cities'],
      ['who made a comment that concrete constructions have a beauty just as artistic processes created by engineers the architects', 'claimed that great engineering is great art'], ['who made a romantic depiction of an old bridge in one painting', 'painted a peaceful country scene centred on a bridge'],
      ['who produced art pieces demonstrating the courage of workers in the site', 'produced pictures showing the courage of construction workers'], ['who produced portraits involving subjects in engineers and inventions and historical human heroes.', 'painted engineers and inventors as well as the American founding fathers'],
      ['who produced a painting of factories and named them ambitiously', 'painted a factory and gave the paintings grand titles']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 3 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 27-31 on your answer sheet.';
      d.questionGroups[1].instruction = 'Look at the following statements (Questions 32-36) and the list of people below. Match each statement with the correct person, A-F. Write the correct letter, A-F, in boxes 32-36 on your answer sheet.';
      const n = d.questionGroups[2]; n.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 37-40 on your answer sheet.';
      n.noteConfig = { title: 'Iron Bridge, Coalbrookdale, England', lines: ['In the late eighteenth century, __Q37__ built the world’s first iron bridge, a dramatic departure from earlier bridges in the countryside, which were made of __Q38__ and timber. The bridge, which still spans the __Q39__, was important in the period of the industrial revolution. Many paintings of Iron Bridge are kept locally in the __Q40__, showing the iron structure at the centre of the landscape.'] };
    },
  },
  1334: {
    text: [['if you don’t expect the first event, you have no trouble to respond', 'if you don’t expect the first event, you have no trouble responding'], ['he thinks it used discretion', 'he thinks it uses discretion'],
      [' Perhaps we will in future, though. We might yet look back one day on people like Debbie and Alun as ancestors of a new breed of true multitaskers.', ' Perhaps we will in future, though.'],
      ['they did a better fob on Mixed image', 'they did a better job on mixed image'], ['Incapable of human memory cause people to sometimes miss the differences when presented two similar images.', 'Limits on short-term memory can make people miss the differences between two similar images.']],
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 2 has ten paragraphs, A-J. Which paragraph contains the following information? Write the correct letter, A-J, in boxes 14-18 on your answer sheet.';
      d.questionGroups[2].instruction = YNNG(2);
    },
  },
  1332: {
    keys: { 7: 'FALSE', 8: 'keystone species / keystone', 9: 'fig family / fig trees', 13: 'public education' }, // Q7: text says sustainable farming "avoid[s] monoculture" — ECE key = FALSE (mini: NG)
    text: [['the ecosystems of which they are apart', 'the ecosystems of which they are a part'], ['only 4 per cent of known plants has been assessed', 'only 4 per cent of known plants have been assessed'], ['There are known as keystone species', 'These are known as keystone species'],
      ['their numbers are relatively small to disease or human hunters can wipe them out', 'their numbers are relatively small, so disease or human hunters can wipe them out'],
      ['In the same way, sustainable farming techniques that minimise environmental damage and avoid monoculture.', 'In the same way, sustainable farming techniques are being developed that minimise environmental damage and avoid monoculture.'],
      ['Because of the ignorance brought by media, people tend to neglect significant creatures called __Q8__.', 'Because of the media’s focus on large animals, people tend to neglect important creatures called __Q8__.'],
      ['However, the operation is needed for the government to increase its financial support in __Q13__.', 'At a national level, governments need to invest in __Q13__.']],
    fn: d => { d.questionGroups[0].instruction = TFNG(1); d.questionGroups[1].instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 8-13 on your answer sheet.'; },
  },
  1330: {
    // the radon sentence is broken in every online copy; minimal repair
    text: [['note that the steam will bring with it radon gas, along through a heat exchanger and then sent back underground for another cycle.', 'notes that the steam will bring with it radon gas, so the steam will be passed through a heat exchanger and then sent back underground for another cycle.'],
      ['without have to make the same mistakes', 'without having to make the same mistakes'], ['this makes it difficult for renewable to compete', 'this makes it difficult for renewables to compete'], ['temperatures in some location to 250°', 'temperatures in some locations to 250°'],
      ['drive a turbine* to produce', 'drive a turbine to produce'], ['spokesperson kay Firth', 'spokesperson Kay Firth'], ['to state: There is no doubt', 'to state: ‘There is no doubt'], ['should be below 4 cents per kilowatt-hour.', 'should be below 4 cents per kilowatt-hour.’']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(2);
      d.questionGroups[1].instruction = 'Look at the following statements (Questions 21-26) and the list of companies below. Match each statement with the correct company, A-D. Write the correct letter, A-D, in boxes 21-26 on your answer sheet. NB You may use any letter more than once.';
    },
  },
  1050: {
    keys: { 37: 'piquia / piquia trees', 40: 'NTFPs / non-timber forest products' },
    fn: d => {
      d.questionGroups[0].instruction = 'Reading Passage 3 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 27-32 on your answer sheet.';
      const n = d.questionGroups[1];
      n.noteConfig = { title: '', lines: ['After the forest fire, local villagers consumed less:', '• __Q33__', '• __Q34__', '• game', 'The least game was caught under __Q35__ trees, whose fruit yield is also __Q36__. Thus, it is more reasonable to keep __Q37__.', 'The trees are also important for __Q38__, not just for selling to loggers. But this is often ignored, because most research focuses on the __Q39__ of the trees.', '<strong>The purpose of the book:</strong> to give information about __Q40__'] };
    },
  },
  1146: {
    text: [[/modem/g, 'modern'], ['2,500 bottles per hour Other developments', '2,500 bottles per hour. Other developments'], ['but it | was not until', 'but it was not until'], ['factory- owner', 'factory-owner'], ['Owens- Illinois', 'Owens-Illinois']],
    fn: d => {
      d.questionGroups[1].instruction = TFNG(1);
      const n = d.questionGroups[0]; n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/(__Q\d+__)$/, '$1.'));
    },
  },
  1140: {
    text: [['sealed then sarcophagi', 'sealed their sarcophagi'], ['putting down deep root in search', 'putting down deep roots in search'], ['used in the construction trade, Corkboard', 'used in the construction trade. Corkboard']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      const n = d.questionGroups[1]; ['Advantages of aluminium screw caps', 'Advantages of cork bottle stoppers'].forEach(h => { const i = n.noteConfig.lines.indexOf(h); if (i >= 0) n.noteConfig.lines[i] = `<strong>${h}</strong>`; });
    },
  },
  // ───── batch 7 ─────
  1102: {
    text: [['a substance called Chuchu could be stored', 'a substance called chuchu. Chuchu could be stored'], ['Facult de Paris', 'Faculté de Paris'], ['well suited to the Irish the soil and climate', 'well suited to the Irish soil and climate'],
      ['relates the story of history the most important vegetable', 'relates the history of the most important vegetable'], ['，', ', '], ['；', '; ']],
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      d.questionGroups[1].noteConfig = { title: '', lines: [
        'In France, people started to overcome their disgust at potatoes because the King put a potato __Q6__ in his buttonhole.',
        'Frederick realised the potential of the potato but he had to deal with the __Q7__ against potatoes among ordinary people.',
        'The King of Prussia used some __Q8__ psychology to make people accept potatoes.',
        'Before 1800, the English people preferred eating __Q9__ with bread, butter and cheese.',
        'The obvious way to deal with England’s food problems was high-yielding potato __Q10__.',
        'The Irish __Q11__ and climate suited potatoes well.',
        'Between 1780 and 1841, based on the __Q12__ of the potato, the Irish population doubled to eight million.',
        'The potato’s high yields helped the poorest farmers to produce more healthy food almost without __Q13__.'] };
    },
  },
  1213: {
    text: [['climactic trends', 'climatic trends'], ['research data we have compiled.</p>', 'research data we have compiled.’</p>'], ['side-effects of our own activity</p>', 'side-effects of our own activity.’</p>']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has five paragraphs, A-E. Which paragraph contains the following information? Write the correct letter, A-E, in boxes 14-18 on your answer sheet.';
      g0.matchingOptions = g0.matchingOptions.map(o => o.trim());
      g1.instruction = 'Look at the following people (Questions 19-22) and the list of statements below. Match each person with the correct statement, A-F. Write the correct letter, A-F, in boxes 19-22 on your answer sheet.';
      g1.matchingOptions = g1.matchingOptions.map(o => o.replace(/^\.\s*/, '').trim());
      g2.instruction = TFNG(2);
    },
  },
  1056: {
    text: [['Oeco-phylla', 'Oecophylla'], ['until 1 the early', 'until the early'], ['with the i ants inside', 'with the ants inside'], ['attached k the bladders', 'attached the bladders'], ['made any in- T roads', 'made any inroads'], ['Where X mealy', 'Where mealy'], ['guickly', 'quickly']],
    fn: d => {
      d.questionGroups[0].instruction = 'Look at the following events (Questions 14-18) and the list of dates below. Match each event with the correct date, A-G. Write the correct letter, A-G, in boxes 14-18 on your answer sheet.';
      d.questionGroups[1].instruction = TFNG(2);
      setQ(d, { 14: 'The first description of citrus ants being traded in the marketplace', 16: 'The first recorded use of one insect to tackle other insects in the Western world', 18: 'Some Chinese farmers returned to the traditional biological method.' });
    },
  },
  1137: {
    text: [['thereare', 'there are'], ['that could surely to much more productive use', 'that could surely be put to much more productive use'], ['an archtophilist collects', 'an arctophile collects'],
      ['If you think about collecting postage stamps another potential reason for it - Or, perhaps, a result of collecting is its educational value.', 'If you think about collecting postage stamps, another potential reason for it – or, perhaps, a result of collecting – is its educational value.']],
    keys: { 5: 'hunt', 6: 'aimless' }, // mini also accepted desire/empty — neither fits the sentence
    fn: d => {
      const n = d.questionGroups[0]; n.noteConfig.lines = n.noteConfig.lines.map(l => l.replace(/^\d+\s+/, '').replace(/(__Q\d+__)$/, '$1.'));
      d.questionGroups[1].instruction = TFNG(1);
    },
  },
  1445: {
    // paragraph 6 and the end of paragraph 8 were interleaved column-wise; every fragment is present, only the order is restored
    text: [['ancient life forms Tuatara', 'ancient life forms. Tuatara'], ['1.200 grams', '1,200 grams'], ['Legal protection, was granted', 'Legal protection was granted'], ['50- 100 tuatara', '50–100 tuatara'], ['predator- free islands', 'predator-free islands'],
      ['A few, such as the Poor Knights common tuatara lives on islands off the north-eastern coast of New Zealand, and on some islands in Cook Strait. The Brothers Island tuatara survived only on the of the Brothers Island tuatara have been created on Titi Island',
        'A few, such as the Poor Knights islands off the Northland coast, or Stephens Island in Cook Strait, were never invaded by rats, and had few of the other mammals that threaten native animals. The common tuatara lives on islands off the north-eastern coast of New Zealand, and on some islands in Cook Strait. The Brothers Island tuatara survived only on the tiny, 4 hectare North Brother Island, in Cook Strait. However, two new populations of the Brothers Island tuatara have been created on Titi Island'],
      [/moving tuatara to rat.?islands off the Northland coast[\s\S]*?two new populations free islands, have increased/, 'moving tuatara to rat-free islands, have increased']],
    keys: { 8: 'teeth', 9: 'seabirds', 11: 'mainland', 13: '2,500 / 2500' },
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      const g = d.questionGroups[1];
      g.instruction = 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 7-13 on your answer sheet.';
      g.noteConfig = { title: 'The tuatara', lines: ['<strong>Lifespan</strong>', 'maximum lifespan unknown', 'many live to at least __Q7__ years old',
        '<strong>Behaviour</strong>', 'attack other creatures with their __Q8__', 'eat young __Q9__ that live in the same burrows, invertebrates and reptiles',
        '<strong>Population</strong>', 'abundant until rats were introduced by __Q10__ people', 'by the 1840s, hardly any tuatara found on the __Q11__',
        'islands off the north-eastern coast and in Cook Strait now home to the __Q12__ tuatara', 'Brothers Island tuatara found on North Brother Island',
        'density of tuatara on Stephens Island is up to __Q13__ tuatara for every hectare',
        '<strong>Protection of the species</strong>', 'tuatara population dropped until rats eradicated from islands', 'eggs were gathered by conservationists'] };
    },
  },
  1389: {
    text: [['Pclouze', 'Pelouze'], ['death in 18%', 'death in 1896'], ['a young engineer __Q8__ and his invention', 'a young chemist, __Q8__, and his invention'],
      ['trained in __Q7__ during Nobel’s study in Paris', 'trained in __Q7__. During his stay in Paris'], ['__Q11__. while in the meantime', '__Q11__, while in the meantime']],
    keys: { 9: 'gunpowder', 11: 'detonator / a detonator / blasting cap' },
    fn: d => {
      d.questionGroups[0].instruction = TFNG(1);
      const n = d.questionGroups[1]; ['Education:', 'Benefits in construction works:'].forEach(h => { const i = n.noteConfig.lines.indexOf(h); if (i >= 0) n.noteConfig.lines[i] = `<strong>${h.replace(':', '')}</strong>`; });
    },
  },
  1380: {
    text: [['<p>When German director', '<p><strong>A</strong> When German director'], ['slave-live extensions', 'slave-like extensions'],
      ['presents the movie in an __Q34__ term', 'presents the movie in __Q34__ terms'], ['multinational corporations concern more about the growing __Q36__ and money', 'multinational corporations care more about increasing __Q36__ and profits']],
    keys: { 33: 'John Fredersen / Fredersen' },
    fn: d => { d.questionGroups[0].instruction = YNNG(3); },
  },
  1373: {
    text: [['this months’ Harvard', 'this month’s Harvard'], ['the cliche that', 'the cliché that']],
    keys: { 22: 'analysts / star-stock analysts', 23: 'star performer' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 14-17 on your answer sheet.';
      g1.instruction = YNNG(2);
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 22-26 on your answer sheet.';
      g2.noteConfig = { title: '', lines: ['A study of the careers of 1,000 __Q22__, reported in the Harvard Business Review, found that hiring a __Q23__ has negative effects. Firstly, stars often perform considerably worse in a new firm than in the __Q24__ they used to work in, and they soon move on and increase their __Q25__. Secondly, group performance suffers because of tensions and resentment from __Q26__ within the team. Lastly, investors punish the company that hired the star by selling its stock.'] };
      setQ(d, { 14: 'an example from outside business showing that a better system beats bigger stars', 15: 'a company that failed because it believed in stars rather than systems',
        16: 'the writer’s suggestion for how companies can obtain talented employees', 17: 'a medical metaphor that illustrates the problems of hiring stars',
        21: 'Football clubs that focus on developing stars within a settled system do better than those that simply collect stars.' });
    },
  },
  1348: {
    text: [['in which they were easy, captured, killed, and eaten by humans', 'in which they were easily captured, killed, and eaten by humans'], ['<h2>Blue-footed Boobies 2</h2>', '<h2>Blue-footed Boobies</h2>'],
      ['the male will spread his wings and stamp his feet on the ground with his bills __Q23__', 'the male raises his bright blue feet and his wings, and points his bill towards the sky – a display known as __Q23__']],
    keys: { 19: 'vii', 23: 'sky pointing / skypointing / sky-pointing' }, // mini: G = vi (already A's heading)
    fn: d => {
      d.title = 'Blue-footed Boobies';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs A, B and D-G from the list of headings below. Write the correct number, i-ix, in boxes 14-19 on your answer sheet.';
      g1.instruction = TFNG(2);
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 23-26 on your answer sheet.';
    },
  },
  1244: {
    text: [['Shelley was bom', 'Shelley was born'], ['with the establishment In 1818', 'with the establishment. In 1818']],
    keys: { 33: 'the Mediterranean / Mediterranean', 35: 'his colourful lifestyle / colourful lifestyle / his lifestyle / lifestyle / his colorful lifestyle' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = TFNG(3);
      g1.groupType = 'table'; delete g1.noteConfig;
      g1.instruction = 'Complete the table below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 33-39 on your answer sheet.';
      g1.tableConfig = { headers: ['Poet', 'Date of birth', 'Education', 'Other information'], rows: [
        ['Byron', '1788', 'Cambridge University', 'went on a journey around __Q33__; came to love __Q34__'],
        ['Shelley', '1792', 'Eton and Oxford University', 'some people disapproved of __Q35__ and the beliefs he held'],
        ['Wordsworth', '1770', '–', 'became more accepted when he changed his __Q36__'],
        ['Coleridge', '1772', 'bright scholar', 'his __Q37__ was smaller than the other Romantic poets’; left the Wordsworths due to __Q38__'],
        ['Keats', '1795', 'qualified as a surgeon', 'left England for a change of __Q39__']] };
      g2.instruction = 'Complete the sentence below. Choose NO MORE THAN THREE WORDS from the passage for the answer. Write your answer in box 40 on your answer sheet.';
      g2.noteConfig.lines = ['According to the writer, the Romantic poets left us with the ideas of __Q40__.'];
    },
  },
  // ───── batch 8 ─────
  1204: {
    text: [['<h2>EFFORT AND SCIENCE TO WIN</h2>', '<h2>Effort and Science to Win</h2>'], ['and .Applied Sciences', 'and Applied Sciences'], ['to die power of the mind', 'to the power of the mind'], ['countries in die world', 'countries in the world'],
      ['help US arrive', 'help us arrive'], ['daffy', 'daily'], ['The CCG has had', 'The EEG has had'], ['odontology 1 .', 'odontology.'], ['ergonomic 1 construction', 'ergonomic* construction'],
      ['<p>1 objects designed to be better adapted to the shape of the human body', '<p><small>* ergonomic: designed to be better adapted to the shape of the human body</small>'], ['(EEC)', '(EEG)']],
    keys: { 21: 'FALSE' }, // mini: "FLASE"
    fn: d => {
      d.title = 'Effort and Science to Win';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information? Write the correct letter, A-F, in boxes 14-17 on your answer sheet.';
      g0.matchingOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 18-20 on your answer sheet.';
      g1.questions.forEach(q => { q.options = q.options.map(o => o.replace(/^\.\s*/, '')); });
      g2.instruction = TFNG(2);
    },
  },
  1210: {
    text: [['com petition', 'competition'], [/(\d+) th century/g, '$1th century']],
    keys: { 4: 'meet the demand / meet demand', 6: 'steam engines / steam' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the notes below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 1-6 on your answer sheet.';
      ['Early history', 'Ways found to deal with situation', 'Early technology'].forEach(h => { const i = g0.noteConfig.lines.indexOf(h); if (i >= 0) g0.noteConfig.lines[i] = `<strong>${h}</strong>`; });
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 7-9 on your answer sheet.';
      g1.questions.forEach(q => { q.options = q.options.map(o => o.replace(/\s*\d+##qa$/, '')); });
      g2.instruction = TFNG(1);
    },
  },
  1338: {
    text: [['<h2>Human remain in Green Sahara</h2>', '<h2>Human Remains in the Green Sahara</h2>'], [/<p>\{([A-J])\} /g, '<p><strong>$1</strong> '], ['October 13,2,000', 'October 13, 2000'], ['I found some bones:’ ', 'I found some bones,” '],
      ['Nigeria’s army', 'Niger’s army'], ['cemetery, M Garcea', 'cemetery,” Garcea'], ['animal bone Apparently', 'animal bone. Apparently'], ['Tenere ,', 'Tenere,'], ['The Tuareg ,', 'The Tuareg,']],
    keys: { 30: 'a detailed map / a map / detailed map / map', 31: 'radiocarbon dating', 32: '9,000 years / 9000 years / 9,000 years old', 33: 'teeth / the teeth',
      34: 'peaceful', 35: 'injuries', 36: 'protein', 37: 'strenuous', 38: 'hunting', 39: 'cow species', 40: 'transitional' },
    fn: d => {
      d.title = 'Human Remains in the Green Sahara';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = TFNG(3);
      g1.noteConfig.lines = ['What did Sereno and Garcea make of the whole site during their first three weeks at Gobero? __Q30__',
        'For what purpose did Sereno send one tooth from each of four skulls to a laboratory? __Q31__',
        'Roughly how old were the tightly bundled burials found to be? __Q32__',
        'From which part of the skeletons are scientists trying to obtain DNA to discover the genetic origins of the Kiffian and Tenerian? __Q33__'];
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 34-40 on your answer sheet.';
      g2.noteConfig.lines = ['Judging by the bones, the Kiffian appear to have been __Q34__, hard-working people, since there is a lack of head and forearm __Q35__. Their huge leg muscles suggest that they ate a lot of __Q36__ and had a __Q37__ lifestyle – both consistent with a fishing way of life. The Tenerian are thought to have been herders, because drier conditions 6,000 years ago favoured herding over __Q38__. However, among the animal bones found at the site, only three came from a __Q39__, so Sereno suggested that the Tenerian at Gobero were a __Q40__ group that still relied heavily on hunting and fishing.'];
    },
  },
  1324: {
    text: [['<h2>Numeracy: can animals tell numbers? (Can animals count?)</h2>', '<h2>Numeracy: Can Animals Tell Numbers?</h2>']],
    keys: { 3: 'calculate', 4: 'fruit flies' }, // mini: "calculate eggs" / "fruits flies" — neither is in the passage
    fn: d => {
      d.title = 'Numeracy: Can Animals Tell Numbers?';
      const [g0, g1] = d.questionGroups;
      g0.groupType = 'table'; delete g0.noteConfig;
      g0.instruction = 'Complete the table below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 1-7 on your answer sheet.';
      g0.tableConfig = { headers: ['Group', 'Subjects', 'Experiments', 'Results'], rows: [
        ['Mammals and birds', 'rhesus monkeys and humans', 'looked at two sets of geometrical objects on a computer screen', 'performance of the two groups is almost __Q1__'],
        ['', 'chicks', 'chose between two sets of __Q2__ which are altered', 'chicks can do calculations in order to choose a larger group'],
        ['', 'coots', 'behaviour of female birds was observed', 'a bird seems to have the ability to __Q3__'],
        ['Amphibians, fish and insects', 'salamanders', 'offered clear tubes containing different quantities of __Q4__', 'salamanders distinguish between numbers over four if the bigger number is at least two times larger'],
        ['', '__Q5__', 'shown real shoals and later artificial ones of geometrical shapes; these are used to check the influence of total __Q6__ and brightness', 'subjects know the difference between two and three and possibly three and four, but not between four and five'],
        ['', 'bees', 'had to learn where __Q7__ was stored', 'could soon choose the correct place']] };
      g1.instruction = TFNG(1); // keys are TRUE/FALSE although mini's instruction said YES/NO
      g1.questions.forEach(q => { q.type = 'true-false-ng'; });
    },
  },
  // ───── batch 9 (last minor + …) ─────
  1270: {
    text: [[/<p>([A-F]) \. /g, '<p><strong>$1</strong> '], ['ensuring it preservation', 'ensuring its preservation'],
      // every copy online has the same dropped words here; restored minimally so the sentence parses
      ['two of Wisconsin’s most industries — are teaming up in southwestern Wisconsin has found', 'two of Wisconsin’s most important industries — are teaming up in southwestern Wisconsin. A study there has found'],
      ['orlandmarks', 'or landmarks'], ['Grant county community', 'Grant County community'], ['Green county Tourism', 'Green County Tourism'],
      ['and enviroment', 'and environment'], ['and bring other participants', 'and brought other participants']],
    keys: { 38: 'picnic / picnic lunch', 39: 'Dominican Sisters / the Dominican Sisters', 40: 'income / incomes' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has six paragraphs, A-F. Which paragraph contains the following information? Write the correct letter, A-F, in boxes 27-30 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 31-35) and the list of visitors below. Match each statement with the correct group of visitors, A, B or C. Write the correct letter, A, B or C, in boxes 31-35 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingOptions = ['Cheese Festival visitors', 'Picnic visitors', 'Both of them'];
      setQ(d, { 31: 'have a focused destination', 32: 'the majority prepare well beforehand', 33: 'are comparatively less keen on a picnic meal',
        34: 'show interest in activities such as factory tours and fruit farms', 35: 'are willing to accept a variety of tour recommendations' });
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 36-40 on your answer sheet.';
      g2.noteConfig.title = g2.noteConfig.lines.shift();
    },
  },
  1138: {
    text: [['any subject\' That was the founders motto', 'any subject.’ That was the founder’s motto'], ['a course called Arson for Profit’?', 'a course called ‘Arson for Profit’?'],
      ['program in \'fire science’', 'program in ‘fire science’'], ['the course: \'Principles of Marketing’', 'the course: ‘Principles of Marketing’'],
      ['the students, \'Is marketing principled?’', 'the students, ‘Is marketing principled?’'], ['the terms \'means\' and ‘end\' to marketing', 'the terms ‘means’ and ‘end’ to marketing'],
      ['the end;hence', 'the end; hence']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has six sections, A-F. Choose the correct heading for each section from the list of headings below. Write the correct number, i-viii, in boxes 27-32 on your answer sheet.';
      g0.headingsConfig.headings = ['Courses that require a high level of commitment', 'A course title with two meanings', 'The equal importance of two key issues',
        'Applying a theory in an unexpected context', 'The financial benefits of studying', 'A surprising course title', 'Different names for different outcomes',
        'The possibility of attracting the wrong kind of student'].map((text, i) => ({ numeral: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'][i], text }));
      g1.noteConfig.title = 'The ‘Arson for Profit’ course';
      g2.instruction = YNNG(3);
    },
  },
  1388: {
    text: [['in and off itself', 'in and of itself'], ['an animal which adapts adapted so efficiently', 'an animal which is adapted so efficiently'],
      ['is threatened-by a predator, for instance-because', 'is threatened – by a predator, for instance – because'],
      ['leaving the sum of the two forward forces</p>', 'leaving the sum of the two forward forces.</p>'],
      ['control the pitch of the ash', 'control the pitch of the fish'], ['sending the ash up or down', 'sending the fish up or down'], ['The paired ins are', 'The paired fins are']],
    // mini: Q22 "Pectoral and pelvic" (blank is "…… fins", pointer is on the pectoral fin), Q25 "fats" (passage: "fat and glycogen"),
    // Q23 "slows and stops" — passage says "slows down and stops" (4 words) → diagram limit raised to four words
    keys: { 22: 'pectoral / pectoral and pelvic', 23: 'slows down and stops / slows and stops / slowing down and stopping', 25: 'fat and glycogen', 26: 'predator / a predator / danger' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 14-19 on your answer sheet.';
      g1.instruction = 'Label the diagram below. Choose NO MORE THAN FOUR WORDS from the passage for each answer. Write your answers in boxes 20-23 on your answer sheet. (Trên hình, ô 7–10 tương ứng với câu 20–23.)';
      g1.noteConfig.title = 'Fish fins and their purposes';
      g1.noteConfig.lines = ['Tail fin: providing part of __Q20__', 'Dorsal fin: __Q21__ movements', '__Q22__ fins combined with paired fins: pushing up and down', 'Paired fins: for __Q23__ movements additionally'];
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet.';
    },
  },
  1285: {
    text: [[/<p>([A-E]) \. /g, '<p><strong>$1</strong> '], ['“palette7', '“palette”'], ['within easy reach- Others', 'within easy reach. Others'],
      ['much more interesting, says Clery', 'much more interesting,” says Clery'], ['different from the mainland, “Apart', 'different from the mainland. “Apart'],
      ['the rest of the Island Is impenetrable, except by hacking through the bush, says Clery', 'the rest of the island is impenetrable, except by hacking through the bush,” says Clery'],
      ['the parched Interior', 'the parched interior'], ['flask Ỉ S fitted', 'flask is fitted'], ['If it Is Impossible', 'If it is impossible'], ['they can.be injected', 'they can be injected'],
      ['given, off by resins', 'given off by resins'], ['But It also smelt of something the fragrance industry has learnt to live without castoreum a substance', 'But it also smelt of something the fragrance industry has learnt to live without: castoreum, a substance'],
      ['but Ã was wonderful', 'but it was wonderful'], ['sun kissed', 'sun-kissed'], ['“aquaspace” apparatus a set', '“aquaspace” apparatus – a set'], ['the best of then captured', 'the best of the captured'],
      ['out of their ; ingenuity', 'out of their ingenuity'], ['the musk I glands', 'the musk glands'], ['their “hotel”—a wooden hut lit by kerosene lamps, and trailed', 'their “hotel” – a wooden hut lit by kerosene lamps – and trailed']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has five paragraphs, A-E. Which paragraph contains the following information? Write the correct letter, A-E, in boxes 14-18 on your answer sheet. NB You may use any letter more than once.';
      g0.matchingReuseAllowed = true;
      g1.instruction = TFNG(2);
      g2.instruction = 'Label the diagram below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet. (Trên hình, ô 11–13 tương ứng với câu 24–26.)';
      g2.noteConfig.title = 'A simple device used to trap molecules';
      g2.noteConfig.lines = ['“__Q24__” of the flask or a glass jar', 'Pumping out air through __Q25__ collecting fragrance', 'Probe (syringe): __Q26__ made of silicone rubber'];
    },
  },
  1049: {
    text: [[/­/g, ''], ['are like rivers; says the report', 'are like rivers, says the report'], ['Indeed it is, says Joyce. ‘ In his', 'Indeed it is, says Joyce. In his']],
    keys: { 25: 'Great Ocean Conveyor / the Great Ocean Conveyor', 26: 'fresh water / freshwater' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 14-17 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 18-22) and the list of people below. Match each statement with the correct person, A-D. Write the correct letter, A-D, in boxes 18-22 on your answer sheet. NB You may use any letter more than once.';
      g2.noteConfig.lines = ['Tropical warm water ← less __Q23__', '↓', 'Water becomes __Q24__ and sinks ← thermohaline circulation', '↓',
        'Deep ocean current called __Q25__ ← increase in __Q26__', '↓', 'Less dense, hard to sink ← stays on top', '↓', 'Gulf Stream slows or shuts down'];
    },
  },
  1095: {
    text: [[/­/g, ''], ['which might ft not even have begun', 'which might not even have begun'], ['was gaining ground, g but', 'was gaining ground, but'],
      ['although he conceded “brandy M in considerable', 'although he conceded “brandy in considerable'], ['eat well avoiding', 'eat well, avoid'], ['Oh 13 November 1892', 'On 13 November 1892'],
      ['wriggled out of if if it', 'wriggled out of it if it']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      // converter merged the four TFNG statements into one question and dropped the final MC question → rebuilt from the mini page
      g0.instruction = TFNG(2);
      g0.questions = ['Cities rather than rural areas were badly affected by the pandemic flu.',
        'At the time of the flu pandemic, people didn’t know the link between micro-organisms and illnesses.',
        'People used to believe flu was caused by miasmas.', 'Flu prescriptions often contained harmful ingredients.']
        .map((questionText, i) => ({ questionNumber: 14 + i, type: 'true-false-ng', questionText, correctAnswer: ['NOT GIVEN', 'FALSE', 'TRUE', 'NOT GIVEN'][i] }));
      g0.groupTitle = 'Questions 14–17';
      g1.instruction = 'Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 18-21 on your answer sheet. (Trên hình, ô 5–8 tương ứng với câu 18–21.)';
      g1.noteConfig.title = 'The carbolic smoke ball';
      g1.noteConfig.lines = ['Covered with __Q18__', 'Metal __Q19__', 'Content: __Q20__', '__Q21__ (the body of the device)'];
      g1.questions.forEach((q, i) => { q.questionNumber = 18 + i; q.questionText = `Question ${18 + i}`; });
      g1.questions[2].correctAnswer = 'powder';
      g1.groupTitle = 'Questions 18–21';
      g2.instruction = 'Look at the following people (Questions 22-25) and the list of statements below. Match each person with the correct statement, A-F. Write the correct letter, A-F, in boxes 22-25 on your answer sheet.';
      g2.questions.forEach((q, i) => { q.questionNumber = 22 + i; });
      g2.groupTitle = 'Questions 22–25';
      d.questionGroups = [g0, g1, g2, { groupTitle: 'Question 26', instruction: 'Choose the correct letter, A, B, C or D. Write the correct letter in box 26 on your answer sheet.', groupType: 'plain',
        questions: [{ questionNumber: 26, type: 'multiple-choice', questionText: 'Why is Mrs. Carlill’s case often cited in present-day court trials?',
          options: ['It proved the untrustworthiness of advertisements.', 'It established the validity of one-sided contract.', 'It explained the nature of contract.', 'It defended the rights of consumers.'], correctAnswer: 'B' }] }];
      d.questionRange = { start: 14, end: 26 };
    },
  },
  1251: {
    text: [['his friends near by', 'his friends nearby'], ['a couple years earlier', 'a couple of years earlier']],
    keys: { 21: 'small pinholes / pinholes', 22: 'selenium cell / a selenium cell', 23: 'neon lamp / a neon lamp' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      // converter left the person/role table as one text block → rebuilt; Q26 statement was dropped (taken from the mini solution page)
      g0.instruction = 'Look at the following people (Questions 14-20) who were significant in the invention of the television and the list of roles below. Match each person with the correct role, A-G. Write the correct letter, A-G, in boxes 14-20 on your answer sheet.';
      g0.matchingOptions = ['His work was adopted by the BBC for their broadcasting business.', 'His work was used to help fight crime.', 'He was the first person to move on television.',
        'He used second-hand parts in his invention.', 'His business was destroyed by a financial crisis.', 'He invented the image dissector.', 'His work was initially of no interest to anyone.'];
      ['John Logie Baird', 'William Taynton', 'Philo Farnsworth', 'Vladimir Zworykin', 'Paul Nipkow', 'Arthur Korn', 'Charles Francis Jenkins'].forEach((t, i) => { g0.questions[i].questionText = t; });
      g1.instruction = 'Label the diagram below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 21-23 on your answer sheet. (Trên hình, ô 8–10 tương ứng với câu 21–23.)';
      g1.noteConfig.title = 'The Nipkow disk system';
      g1.noteConfig.lines = ['(8) A spinning disk with __Q21__ in a spiral', '(9) __Q22__', '(10) __Q23__'];
      g2.instruction = TFNG(2);
      g2.questions.push({ questionNumber: 26, type: 'true-false-ng', questionText: 'Charles Francis Jenkins was already famous when he experimented with television.', correctAnswer: 'TRUE' });
      g2.groupTitle = 'Questions 24–26';
      d.questionRange = { start: 14, end: 26 };
    },
  },
  1520: {
    text: [['<h2>THE STORY OF COFFEE</h2>', '<h2>The Story of Coffee</h2>'], ['this energy laden fruit', 'this energy-laden fruit'], ['coffee producing countries', 'coffee-producing countries'],
      ['the plantation one reaches', 'the plantation ones reach'], ['15 to 25 Degrees C', '15 to 25 degrees C']],
    keys: { 26: 'customers’ specifications / customers\' specifications / customer specifications' },
    fn: d => {
      d.title = 'The Story of Coffee';
      const [g0, g1, g2] = d.questionGroups;
      // headings list was mis-parsed (6 of 11, numerals shifted) and the six paragraphs merged into one question → rebuilt
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs B-G from the list of headings below. Write the correct number, i-xi, in boxes 14-19 on your answer sheet. NB There are more headings than paragraphs, so you will not use them all. Example: Paragraph A – iv';
      const N = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi'];
      g0.headingsConfig = { headings: ['Growing Coffee', 'Problems with Manufacture', 'Processing the Bean', 'First Contact', 'Arabian Coffee', 'Coffee Varieties', 'Modern Coffee',
        'The Spread of Coffee', 'Consuming Coffee', 'Climates for Coffee', 'The Coffee Plant'].map((text, i) => ({ numeral: N[i], text })) };
      g0.questions = ['B', 'C', 'D', 'E', 'F', 'G'].map((L, i) => ({ questionNumber: 14 + i, type: 'matching-headings', questionText: `Paragraph ${L}`, correctAnswer: ['viii', 'ix', 'vi', 'xi', 'i', 'iii'][i] }));
      g0.groupTitle = 'Questions 14–19';
      g1.instruction = 'Label the diagram of a coffee bean below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 20-22 on your answer sheet. (Trên hình, ô 7–9 tương ứng với câu 20–22.)';
      g1.noteConfig.lines = ['(7) __Q20__', '(8) __Q21__', '(9) __Q22__'];
      g2.instruction = 'Complete the flow-chart below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 23-26 on your answer sheet.';
      delete g2.imageUrl; // the flow-chart is reproduced in full as text below
      g2.noteConfig.title = g2.noteConfig.lines.shift();
      g2.noteConfig.lines = ['The coffee cherry is picked by hand and delivered to mills.', '↓', 'The coffee cherry is pulped or __Q23__.', '↓', 'The pulped beans are left __Q24__ to ferment in pure water.', '↓',
        'The wet beans are sun dried for one or two weeks to make parchment – they are __Q25__ often to ensure an even drying procedure.', '↓',
        'The parchment is then bagged and taken to be milled to make the green beans.', '↓', 'The green beans are then roasted to __Q26__.', '↓', 'The roasted beans are cooled.', '↓',
        'The finished product is packaged and mailed to the customer.'];
      d.questionRange = { start: 14, end: 26 };
    },
  },
  1419: {
    text: [['coal-fired power plants fed voracious appetites', 'coal-fired power plants feed voracious appetites'], ['oxygen, coal, and water ae burnt', 'oxygen, coal, and water are burnt'],
      ['as the cooling Syngas travel through water', 'as the cooling Syngas travels through water']],
    keys: { 36: 'powerful lobbies / powerful lobby groups', 37: 'solar / solar power', 40: '$0.0686/kWh / $0.0686 / 0.0686/kWh / $0.0686 per kWh' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27-28 on your answer sheet.';
      // two diagrams (already numbered 29–34 in the figures) → one group per figure, same A–H list
      const opts = ['CO2', 'Coal', 'Natural gas', 'Oil', 'Saline aquifer', 'Steam-driven turbines', 'Syngas', 'Syngas-driven turbines'];
      const qs = g1.questions; qs.forEach((q, i) => { q.questionText = `Question ${29 + i}`; });
      const ins = n => `Label the diagram below. Choose the correct letter, A-H, from the list below. Write the correct letter in boxes ${n} on your answer sheet. NB You may use any letter more than once.`;
      const ga = { ...g1, groupTitle: 'Questions 29–31', instruction: ins('29-31'), matchingOptions: opts, matchingReuseAllowed: true, questions: qs.slice(0, 3),
        imageUrl: 'https://ieltstrainingonline.com/wp-content/uploads/2019/10/06-IELTS-Reading-q27-40-1.jpg' };
      const gb = { ...g1, groupTitle: 'Questions 32–34', instruction: ins('32-34').replace('Label the diagram below', 'Label the diagram of an IGCC system below'), matchingOptions: opts, matchingReuseAllowed: true, questions: qs.slice(3),
        imageUrl: 'https://ieltstrainingonline.com/wp-content/uploads/2019/10/06-IELTS-Reading-q27-40-2.jpg' };
      g2.noteConfig = { title: '', lines: ['<strong>Advantages of CCS</strong>', 'Sequestration is already used in the oil and gas sector.', 'CCS may cut __Q35__ in a short time.',
        '__Q36__ in labour, industry, and states already support CCS.', 'Alternatives, like __Q37__ energy, take up vast amounts of space.', '<strong>Disadvantages of CCS</strong>',
        'The construction of new and the conversion of existing power plants and the liquefaction and transport of CO2 are very costly.', 'While sequestration is possible, the scale would be enormous.',
        'Therefore, CCS would need __Q38__.', 'Some CCS technology is __Q39__. Gas-driven turbines for IGCC have not been used on an industrial scale.',
        'Shallow underground storage may be limited; deep ocean storage is currently impossible.', 'Geologists fear leaks in quake-prone regions.',
        'Natural gas and solar PVs are cheaper. LCOE estimates for CCS = $0.09-0.15/kWh; for natural gas = __Q40__; and, for solar PV = $0.0849/kWh.'] };
      g2.instruction = 'Complete the notes below, taken from a table. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 35-40 on your answer sheet.';
      d.questionGroups = [g0, ga, gb, g2];
    },
  },
  1377: {
    text: [['<h2>Spider silk 2</h2>', '<h2>Spider Silk</h2>']],
    // mini Q22 "chemical" — the passage says "dissolved the protein in chemical solvents"
    keys: { 19: 'yeast / bacteria', 20: 'bacteria / yeast', 22: 'chemical solvents / chemical solvent', 23: 'small holes / holes' },
    fn: d => {
      d.title = 'Spider Silk';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 14-18 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.map(l => l.replace('globules of __Q21__.', 'globules of __Q21__'));
      g1.instruction = 'Complete the flow-chart below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 19-23 on your answer sheet. (Q19 and Q20 can be in either order.)';
      g2.instruction = TFNG(2);
    },
  },
  1192: {
    text: [['The subject is this study included', 'The subjects in this study included'], ['how the system were installed', 'how the systems were installed'], ['the most favorite games play by family members', 'the favorite games played by family members'],
      ['trailed be twelve children', 'trialled by twelve children']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 1-5 on your answer sheet.';
      g0.noteConfig.title = 'Nintendo’s preschool research';
      g0.noteConfig.lines = ['<strong>Goals</strong>', ...g0.noteConfig.lines.slice(0, 3), '<strong>Participants</strong>', ...g0.noteConfig.lines.slice(3)];
      g1.instruction = TFNG(1);
      g2.noteConfig.lines = g2.noteConfig.lines[0].split(/\s*↓\s*/).flatMap((l, i) => i ? ['↓', l] : [l]);
    },
  },
  // ───── batch 10 (retried "broken" pages — passage in <li>/<div>, fixed in mini_extract.py) ─────
  1459: {
    text: [['<h2>The iceman</h2>', '<h2>The Iceman</h2>'], ['inside his body-a microscopic', 'inside his body – a microscopic'], ['stalk of yew-an unfinished', 'stalk of yew – an unfinished'],
      ['lower Vai Senales-especially', 'lower Val Senales – especially'], [/Vai (Senales|Venosta)/g, 'Val $1'], ['flint- tipped', 'flint-tipped'], ['modern- day', 'modern-day']],
    keys: { 23: 'refrigerated high-tech / refrigerated, high-tech / refrigerated' },
    fn: d => {
      d.title = 'The Iceman';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 14-18 on your answer sheet.';
      g1.instruction = TFNG(2);
      g2.instruction = 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 23-26 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace(/__Q(25|26)__$/, '__Q$1__.'));
    },
  },
  1462: {
    text: [[/<p>([A-I]) /g, '<p><strong>$1</strong> '], ['to \'new orbital heights', 'to new orbital heights'], ['different world for US,’', 'different world for us,’'], ['Washington, D.c.', 'Washington, D.C.'], ['up to 4,6 million', 'up to 4.6 million'],
      ['elaborate maps- the pride', 'elaborate maps – the pride'], ['the latest maps, with their prodigious', 'the latest maps. With their prodigious'], ['at the dick of a button', 'at the click of a button'],
      [/(\d+) (th|st) century/g, '$1$2 century'], ['the foremost shipmaker', 'the foremost mapmaker'], ['the Cassini family- father', 'the Cassini family – father'], ['the Italian - born founder', 'the Italian-born founder'],
      ['countryside arid his', 'countryside and his'], ['A, B, c or D', 'A, B, C or D'], ['our modem time zones', 'our modern time zones'], ['allow US to see', 'allow us to see']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 14-18 on your answer sheet.';
      g1.instruction = 'Look at the following list of achievements (Questions 19-21) and the list of mapmakers below. Match each achievement with the correct mapmaker, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 19-21 on your answer sheet.';
      // the "rather than" landed in the wrong sentence on the mini page
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace('the responsibility of __Q23__ scientists.', 'the responsibility of __Q23__ rather than scientists.')
        .replace('the writings of __Q24__ rather than had been kept', 'the writings of __Q24__ had been kept'));
    },
  },
  1425: {
    text: [[/­/g, ''], ['media hype cud how', 'media hype and how'], ['as so often is the ease', 'as so often is the case'], ['Yes, It is true', 'Yes, it is true'], ['is getting wanner', 'is getting warmer'],
      ['have frown an increase', 'have shown an increase'], ['downward swing flint has', 'downward swing that has'], ['over the lust hundred', 'over the last hundred'],
      // "19BH" — Hansen's famous "cause and effect" testimony to the US Senate was in 1988
      ['Dr. James Hansen, in 19BH,', 'Dr. James Hansen, in 1988,'], ['cause arid effect', 'cause and effect'], ['vegetation In areas', 'vegetation in areas'], ['rises In temperature', 'rises in temperature'],
      ['if we Look at', 'if we look at'], ['industrial processes anti the', 'industrial processes and the'], ['only two percent come From', 'only two percent come from'], ['as for as I am concerned', 'as far as I am concerned'],
      ['the fact depend', 'the facts depend'], ['not the result oil natural', 'not the result of natural'], ['will be deviating', 'will be devastating'], ['Is variable', 'is variable'],
      ['It is nearly Impossible', 'It is nearly impossible'], ['disastrous for in mankind', 'disastrous for mankind'], ['there Is a significant link between the climate now, mid man’s', 'there is a significant link between the climate now and man’s'],
      ['increase In global', 'increase in global'], ['are of the opinion that.. .', 'are of the opinion that …']],
    fn: d => {
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27-31 on your answer sheet.';
      g1.instruction = YNNG(3);
      g2.instruction = 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 38-39 on your answer sheet.';
      g2.noteConfig.lines = [g2.noteConfig.lines[0] + ' ' + g2.noteConfig.lines[1], g2.noteConfig.lines[2] + '.'];
      g3.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 40 on your answer sheet.';
    },
  },
  1378: {
    text: [['<h2>The history of the guitar</h2>', '<h2>The History of the Guitar</h2>'], ['NO MOR E THAN T WO WORDS', 'NO MORE THAN TWO WORDS'], ['six -string', 'six-string']],
    // keys must be written the way the passage writes them ("about 500 years ago", "more than 5,000 years")
    keys: { 2: '500 years / five hundred years', 7: 'fans / guitar fans', 8: '5,000 / 5000 / five thousand', 10: 'the lute / lute' },
    fn: d => {
      d.title = 'The History of the Guitar';
      const [g0, g1] = d.questionGroups;
      g0.instruction = 'Complete the sentences below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 1-7 on your answer sheet.';
      // Q1 is cut off on the mini page itself ("‘guit-‘ and ‘") → completed from the passage sentence it paraphrases
      g0.noteConfig.lines = g0.noteConfig.lines.map(l => l.replace(/^\d+\s+/, ''));
      g0.noteConfig.lines[0] = 'Despite differences in __Q1__, ‘guit-’ and ‘-tar’ have been present in most words for ‘guitar’ throughout history.';
      g0.noteConfig.lines[1] += '.';
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 8-13 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.map(l => l.replace('__Q12__ )', '__Q12__)'));
    },
  },
  1366: {
    text: [['Yet watching AIMIO perform', 'Yet watching ASIMO perform'], ['can __Q22__. Humans.', 'can __Q22__ humans.'], ['its __Q26__ ##a.', 'its __Q26__.']],
    keys: { 24: 'Cog / Cognition' },
    fn: d => {
      const [g0, g1] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information? Write the correct letter, A-F, in boxes 14-19 on your answer sheet. NB You may use any letter more than once.';
      g0.matchingReuseAllowed = true;
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 20-26 on your answer sheet.';
    },
  },
  131: {
    fn: d => {
      const [g0, g1] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraphs concentrate on the following information? Write the correct letter, A-H, in boxes 14-19 on your answer sheet.';
      g1.instruction = YNNG(2);
    },
  },
  1525: {
    text: [['﻿', ''], [/Havard(['’])s Center/, 'Harvard$1s Center']],
    keys: { 17: 'vii' }, // mini: "viii" — the list only goes to vii; vietop key: D = vii
    fn: d => {
      d.title = d.title.replace('﻿', '');
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-vii, in boxes 14-19 on your answer sheet.';
      g1.instruction = TFNG(2);
      g2.instruction = 'Look at the following people (Questions 23-26) and the list of statements below. Match each person with the correct statement, A-E. Write the correct letter, A-E, in boxes 23-26 on your answer sheet.';
    },
  },
  1524: {
    text: [[/<p>([A-F]) /g, '<p><strong>$1</strong> '], ['the Lore Valley', 'the Loire Valley'], ['Christian used cheek kisses', 'Christians used cheek kisses'], ['In the Middle Age,', 'In the Middle Ages,']],
    keys: { 37: '400 years / four hundred years', 39: 'social contacts / la bise / the bise / cheek kisses', 40: 'germs / bacteria' },
    fn: d => {
      d.title = 'Why Do We Touch Strangers So Much? A History of the Handshake Offers Clues';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = TFNG(3);
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 34-38 on your answer sheet.';
      g1.noteConfig.title = g1.noteConfig.lines.shift();
      g2.instruction = 'Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 39-40 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace(/^\d+\s+/, '').replace('What did French', 'What did the French'));
    },
  },
  1523: {
    text: [[/<p>([A-H]) /g, '<p><strong>$1</strong> '], ['Just the days after temperatures hit', 'Just days after temperatures hit']],
    fn: d => {
      d.title = 'Chinstrap Penguin Population in the Last 50 Years';
      const [g1, g2] = d.questionGroups;
      // the paragraph-matching group (options ": A", "B"…) was dropped by the converter → rebuilt from the mini page
      const g0 = { groupTitle: '', instruction: 'Reading Passage 1 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 1-7 on your answer sheet. NB You may use any letter more than once.',
        groupType: 'matching-options', matchingOptions: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], matchingReuseAllowed: true,
        questions: ['the highest temperatures ever', 'the difference between current and past records on penguin population', 'places where people cannot go to', 'places where chinstrap penguins live',
          'measures to protect ocean species', 'factors contributing to the decline in the amount of food available', 'description of a specific species']
          .map((questionText, i) => ({ questionNumber: i + 1, type: 'matching-info', questionText, correctAnswer: 'DCGAHEA'[i] })) };
      renum(g0, 1); renum(g1, 8); renum(g2, 11);
      g1.instruction = TFNG(1);
      g2.instruction = 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 11-13 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace('Build __Q13__', 'build __Q13__'));
      d.questionGroups = [g0, g1, g2];
      d.questionRange = { start: 1, end: 13 };
    },
  },
  1461: {
    text: [[/<p>([A-K]) /g, '<p><strong>$1</strong> '], ['a mentor to tech her', 'a mentor to teach her'], ['game - playing', 'game-playing'], ['once a journey man begins', 'once a journeyman begins'],
      [/ (The (Power|Paradox) of Expertise)<\/p>/g, '</p>\n\n<p><strong>$1</strong></p>'], ['higher -order', 'higher-order'], ['better then novices.Experts recognized', 'better than novices. Experts recognize'],
      ['domain -specific short -term and long -term', 'domain-specific short-term and long-term'], ['Better at self-monitoring then novices', 'Better at self-monitoring than novices'],
      ['manifestations of human bias</p>', 'manifestations of human bias.</p>'], ['Expert tend to review', 'Experts tend to review'],
      ['However attempting endevour of finding answers did not yet produce __Q13__', 'However, attempts to find answers have not yet produced __Q13__.']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the flow-chart below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 1-5 on your answer sheet.';
      // the flow-chart's three boxes were flattened into two lines on the mini page
      g0.noteConfig.lines = ['Novice: needs to study __Q1__ under the guidance of a __Q2__', '↓', '__Q3__: starts to identify __Q4__ for cases within or between cases; studies more __Q5__ ways of doing things', '↓ creates new knowledge', 'Expert: performs tasks independently'];
      g1.instruction = TFNG(1);
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 11-13 on your answer sheet.';
    },
  },
  1422: {
    text: [['<h2>Warning: Mondays are bad for your heart</h2>\n\n<p>Warning: Mondays are bad for your heart</p>', '<h2>Warning: Mondays Are Bad for Your Heart</h2>'], ['smoking and cholesterol，', 'smoking and cholesterol,'],
      ['the Luigi Saddo Hospital', 'the Luigi Sacco Hospital']],
    fn: d => {
      d.title = 'Warning: Mondays Are Bad for Your Heart';
      const [g0, g1] = d.questionGroups;
      // TFNG statements and the nine heading questions were each merged into one question on the mini page → rebuilt
      g0.instruction = 'Do the following statements agree with the information given in Reading Passage 2? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this. Example: It was once believed that there was an equal chance of suffering a heart attack on any day of the week. – Answer: TRUE';
      g0.questions = ['Unemployed Germans have a higher risk of heart attack than employed Germans.', 'Unemployed Italians have a lower risk of heart attack than unemployed Germans.',
        'Germans risk heart attack because of their high consumption of fatty food.', 'Cholesterol and smoking cause heart attacks.']
        // Q17: mini says FALSE (they are only long-term risk factors, the trigger is unknown); NOT GIVEN is just as defensible → both accepted
        .map((questionText, i) => ({ questionNumber: 14 + i, type: 'true-false-ng', questionText, correctAnswer: ['FALSE', 'NOT GIVEN', 'NOT GIVEN', 'FALSE / NOT GIVEN'][i] }));
      renum(g0, 14);
      const N = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'];
      g1.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-ix, in boxes 18-26 on your answer sheet. Use each heading ONCE only.';
      g1.headingsConfig = { headings: ['Exact cause of heart attacks', 'The safest day', 'Breathless, sweaty and crushed', 'Reducing heart attack hazard', 'High-risk Monday',
        'Mondays: riskier than food and way of life', 'Jobless but safer', 'Elderly also at risk', 'Bodily adaptations'].map((text, i) => ({ numeral: N[i], text })) };
      g1.questions = 'ABCDEFGHI'.split('').map((L, i) => ({ questionNumber: 18 + i, type: 'matching-headings', questionText: `Paragraph ${L}`, correctAnswer: ['iii', 'v', 'vii', 'ii', 'i', 'ix', 'viii', 'vi', 'iv'][i] }));
      renum(g1, 18);
      d.questionRange = { start: 14, end: 26 };
    },
  },
  1359: {
    text: [['<p>New transport mode PRT RUF</p>\n\n', ''], ['since the days of Gottlieb Daimler</p>', 'since the days of Gottlieb Daimler.</p>'],
      // the "So politicians…" sentences were spliced into the Anderson paragraph; they continue the car paragraph before it
      [' So politicians should be trying to lure people out of their cars, not forcing them out. There’s certainly no shortage of alternatives. Perhaps the most attractive is the concept known as personal rapid transit(PRT), independently invented in the US and Europe in the 1950s.</p>', '</p>'],
      ['as anyone with small children or heavy shopping knows.</p>', 'as anyone with small children or heavy shopping knows. So politicians should be trying to lure people out of their cars, not forcing them out. There’s certainly no shortage of alternatives. Perhaps the most attractive is the concept known as personal rapid transit (PRT), independently invented in the US and Europe in the 1950s.</p>'],
      ['computer game PacMan.White dots', 'computer game PacMan. White dots'], ['not a video game.J.Edward Anderson', 'not a video game. J. Edward Anderson'], ['personal rapid transit(PRT)', 'personal rapid transit (PRT)'],
      ['in the 1970s, From Europe, Japan, and elsewhere in the Us,', 'in the 1970s, from Europe, Japan, and elsewhere in the US,'], ['to ‘commercialize the initiative', 'to commercialize the initiative'],
      ['With PRT, the fracture would have to come first-and that', 'With PRT, the infrastructure would have to come first – and that'], ['became popular-and after governments started earning revenue from them- that', 'became popular – and after governments started earning revenue from them – that'],
      ['windows versus Apple Mac', 'Windows versus Apple Mac'], ['the Ruf vehicle-the term comes from a Danish saying meaning to “go fast”-would', 'the Ruf vehicle – the term comes from a Danish saying meaning to “go fast” – would'],
      ['per Ruf can is reduced', 'per Ruf car is reduced'], ['Of Course,', 'Of course,'], ['in a RUF system rides” very safely', 'in a RUF system “ride” very safely'],
      ['in the past century-three times', 'in the past century – three times'], ['is rising. and what’s more', 'is rising. And what’s more']],
    fn: d => {
      d.title = 'Going Nowhere Fast';
      const [g0, g1] = d.questionGroups;
      d.category = 'passage3'; renum(g0, 27); renum(g1, 31);
      g0.instruction = TFNG(3);
      g1.instruction = 'Look at the following descriptions (Questions 31-37) and the list of transport systems below. Match each description with the correct system, A, B or C. Write the correct letter, A, B or C, in boxes 31-37 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingOptions = ['only PRT', 'only RUF', 'both of them']; g1.matchingReuseAllowed = true;
      setQ(d, { 31: 'totally relies on a computer system', 32: 'opposition to the system from companies', 33: 'reaches the destination fast', 34: 'no need to share space with the public',
        35: 'works on the existing roads', 36: 'individuals can buy their own vehicles', 37: 'controlled both by computer and manually' });
      // "Choose THREE letters" group was not parsed by the converter → rebuilt
      const opts = ['Stimulating economy', 'Successful application in Europe', 'Safety consideration', 'Less pollution to the environment', 'Economical budget', 'Public popularity', 'Fast speed'];
      const stem = 'Which THREE of the following are advantages of developing a new transport system?';
      const g2 = { groupTitle: 'Questions 38–40', instruction: 'Choose THREE letters, A-G. Write the correct letters in boxes 38-40 on your answer sheet.', groupType: 'plain', interchangeableAnswers: true,
        questions: ['C', 'D', 'G'].map((correctAnswer, i) => ({ questionNumber: 38 + i, type: 'multi-answer-group', questionText: stem, options: opts, correctAnswer })) };
      d.questionGroups = [g0, g1, g2];
      d.questionRange = { start: 27, end: 40 };
    },
  },
  1305: {
    text: [['The villagers of muthukandiya', 'The villagers of Muthukandiya'], ['The Muthkandiya initiative', 'The Muthukandiya initiative'], ['especially it’s financial and organizational', 'especially its financial and organizational']],
    fn: d => {
      const [g0, g1] = d.questionGroups;
      // each group's questions were merged into one text block on the mini page → rebuilt (stems lightly de-garbled)
      g0.groupType = 'note-form';
      g0.instruction = 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 1-6 on your answer sheet.';
      g0.noteConfig = { title: '', lines: ['What is the main way for local people in Muthukandiya village to make a living, although it barely supports them? __Q1__',
        'Where can adults make extra money as day-labourers? __Q2__', 'What has been dug to supply water for daily household use? __Q3__',
        'In which year did the planning of a new project to lessen the effect of drought begin? __Q4__', 'Where do the gutters and pipes collect rainwater from? __Q5__',
        'What helps families obtain more water for domestic needs than those relying only on wells and ponds? __Q6__'] };
      g0.questions = ['crop production', 'sugar-cane plantations / sugarcane plantations', 'three wells / wells', '1998', 'roofs of houses / the roofs of houses / roofs', 'rainwater storage tanks / storage tanks']
        .map((correctAnswer, i) => ({ questionNumber: 1 + i, type: 'fill-blank', questionText: `Question ${1 + i}`, correctAnswer }));
      g1.instruction = 'Do the following statements agree with the information given in Reading Passage 1? Write YES if the statement agrees with the information, NO if the statement contradicts the information, NOT GIVEN if there is no information on this.';
      g1.questions = ['Most of the government’s actions and other programmes have somewhat failed.', 'Masons were trained to construct parts of the rainwater harvesting system.',
        'The cost of the rainwater harvesting systems was shared by local villagers and the local government.', 'Tanks increase both the amount and quality of the water for domestic use.',
        'To send her daughter to school, a widow had to take a job in a rainwater harvesting scheme.', 'Households that benefited began to pay part of the maintenance or repairs.',
        'Training two masons at the same time is much more preferable to training a single one.']
        // Q12: sources disagree (ieltsmaterial YES — they agreed to contribute; others NO — "it has proved difficult to get households to contribute") → both accepted
        .map((questionText, i) => ({ questionNumber: 7 + i, type: 'yes-no-ng', questionText, correctAnswer: ['NOT GIVEN', 'YES', 'NO', 'YES', 'NO', 'YES', 'NOT GIVEN'][i] }));
      renum(g0, 1); renum(g1, 7);
      d.questionRange = { start: 1, end: 13 };
    },
  },
  1139: {
    text: [['Farmers everywhere face major risks; including', 'Farmers everywhere face major risks, including'], ['community- based', 'community-based'], ['copipunity-supported agriculture', 'community-supported agriculture']],
    fn: d => {
      d.title = 'The Risks Agriculture Faces in Developing Countries';
      const [g0, g1] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 14-16 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 17-22) and the list of people below. Match each statement with the correct person, A-G. Write the correct letter, A-G, in boxes 17-22 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingReuseAllowed = true;
      // "from them" of Q20 had slipped to the end of Q22 on the mini page
      setQ(d, { 20: 'Farmers may be helped if there is financial input by the same individuals who buy from them.', 21: 'Governments can help to reduce variation in prices.',
        22: 'Improvements to infrastructure can have a major impact on risk for farmers.' });
      // the two "Choose TWO letters" groups were not parsed → rebuilt
      const two = (n, stem, opts, keys) => ({ groupTitle: '', instruction: `Choose TWO letters, A-E. Write the correct letters in boxes ${n}-${n + 1} on your answer sheet.`, groupType: 'plain', interchangeableAnswers: true,
        questions: keys.map((correctAnswer, i) => ({ questionNumber: n + i, type: 'multi-answer-group', questionText: stem, options: opts, correctAnswer })) });
      const g2 = two(23, 'Which TWO problems are mentioned which affect farmers with small farms in developing countries?', ['lack of demand for locally produced food', 'lack of irrigation programmes',
        'being unable to get insurance', 'the effects of changing weather patterns', 'having to sell their goods to intermediary buyers'], ['D', 'E']);
      const g3 = two(25, 'Which TWO actions are recommended for improving conditions for farmers?', ['reducing the size of food stocks', 'attempting to ensure that prices rise at certain times of the year',
        'organising co-operation between a wide range of interested parties', 'encouraging consumers to take a financial stake in farming', 'making customers aware of the reasons for changing food prices'], ['C', 'D']);
      renum(g2, 23); renum(g3, 25);
      d.questionGroups = [g0, g1, g2, g3];
      d.questionRange = { start: 14, end: 26 };
    },
  },
  // ───── batch 11 (phase C: "heavy" pages, converter upgraded — seqOptions, split flattened question lists, newer checkbox markup) ─────
  1428: {
    text: [['quite exceptional music ability', 'quite exceptional musical ability'], ['Serious observation began 1774.', 'Serious observation began in 1774.'], ['not prepared to jump any conclusions', 'not prepared to jump to any conclusions'],
      ['the occultation 1 of a star', 'the occultation¹ of a star'], ['flight of Voyager 2 2 , In addition', 'flight of Voyager 2². In addition'], ['‘O ccultation ‘ :', '¹ ‘Occultation’:'], ['‘ Voyager 2 ‘ :', '² ‘Voyager 2’:'],
      ['or planet .', 'or planet.'], ['scientists on earth .', 'scientists on Earth.']],
    keys: { 37: 'Georgium Sidus / Star of George', 39: 'James L. Elliot / Elliot' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      // the table was flattened into one line on the mini page → rebuilt
      g0.groupType = 'table'; delete g0.noteConfig;
      g0.instruction = 'Complete the table below. Write a date for each answer. Write your answers in boxes 27-31 on your answer sheet.';
      g0.tableConfig = { headers: ['Event', 'Date'], rows: [['William Herschel was born (example)', '1738'], ['Herschel began investigating astronomy', '__Q27__'], ['Discovery of the planet Uranus', '__Q28__'],
        ['Discovery of the moons Titania and Oberon', '__Q29__'], ['First discovery of Uranus’ rings', '__Q30__'], ['Discovery of the last 10 moons of Uranus', '__Q31__']] };
      g1.instruction = YNNG(3);
      g2.instruction = 'Complete the summary below with names from Reading Passage 3. Write your answers in boxes 37-40 on your answer sheet.';
    },
  },
  1368: {
    text: [['<p>K</p>\n\n<p>The busiest part', '<p><strong>K</strong> The busiest part'], ['THE scientific study of twins', 'The scientific study of twins'],
      ['can be used, within ethical, for medical experiments', 'can be used, within ethical limits, for medical experiments'], ['have turned genes for abstract concepts to real pieces of DNA', 'have turned genes from abstract concepts into real pieces of DNA'],
      ['The ideological pendulum has swung back; however, as', 'The ideological pendulum has swung back, however, as'], ['Twinburgh', 'Twinsburg'], ['Boldness of men', 'Baldness of men'], ['Marin Country Sheriff', 'Marin County Sheriff']],
    keys: { 19: 'Francis Galton / Galton' },
    fn: d => {
      d.title = 'Twin Study: Two of a Kind';
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has eleven paragraphs, A-K. Which paragraph contains the following information? Write the correct letter, A-K, in boxes 14-18 on your answer sheet. NB You may use any letter more than once.';
      g0.matchingReuseAllowed = true;
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 19-20 on your answer sheet.';
      g2.instruction = 'Choose THREE letters, A-F. Write the correct letters in boxes 21-23 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which THREE research fields were being studied by researchers from Ohio, Maryland and at Twinsburg?'; });
      g3.instruction = 'Choose THREE letters, A-F. Write the correct letters in boxes 24-26 on your answer sheet.';
      g3.questions.forEach(q => { q.questionText = 'Which THREE findings are confirmed in the passage?'; });
    },
  },
  1365: {
    text: [[' Magnet therapy is gaining popularity; however, scientific evidence to support the success of this therapy is lacking. More scientifically sound studies are needed in order to fully understand the effects that magnets can have on the body and the possible benefits or dangers that could result from their use.</p>\n\n<p><strong>F</strong>', '</p>\n\n<p><strong>F</strong>'],
      ['There was so further evidence to support.', 'There was no further evidence to support it.'], ['to prevent from aging', 'to prevent ageing'], ['For those who practice magnetic therapy, strongly believe', 'Those who practise magnetic therapy strongly believe']],
    fn: d => {
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for paragraphs A-F from the list of headings below. Write the correct number, i-ix, in boxes 14-19 on your answer sheet.';
      g1.questions.forEach(q => { q.questionText = 'Which TWO benefits of lodestone in ancient times are mentioned by the writer?'; });
      g2.questions.forEach(q => { q.questionText = 'Which TWO weaknesses of the Baylor research does the writer present?'; });
      g3.instruction = 'Complete each sentence with the correct ending, A-F, below. Write the correct letter, A-F, in boxes 24-26 on your answer sheet.';
    },
  },
  1352: {
    text: [['switch jobs so frequently that offer the worst returns', 'switch jobs so frequently that they offer the worst returns'], ['workers on piece-fates often earn', 'workers on piece-rates often earn'],
      ['Faced with the need to cut staff costs, and have decided', 'Faced with the need to cut staff costs, and having decided'], ['bridge jog-holders', 'bridge job-holders'],
      ['their products are more superior to the young.', 'their output is superior to that of the young.'], ['run fast when there is a meeting', 'run meetings quickly'], ['have a better inter-person relationship', 'are better at handling people'],
      ['identify problems in an advanced time', 'identify problems in advance'], ['their academic criteria is someway behind elders', 'their education standards are lower than those of older workers'],
      ['young people often earn less for their piece-rates salary.', 'young people often earn less on piece-rates.']],
    fn: d => {
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = TFNG(1);
      g1.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 5-6 on your answer sheet.';
      g1.questions.forEach(q => { q.questionText = 'Which TWO advantages of employing older people are mentioned in the passage?'; });
      g2.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 7-8 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which TWO weaknesses of young employees compared with older ones are mentioned in the passage?'; });
      g3.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 9-13 on your answer sheet.';
      setQ(d, { 9: 'According to paragraph F, firms and workers still hold the opinion that', 10: 'SkillTeam, which was set up by IBM,', 11: 'Which of the following is correct according to the research of Mr Quinn?',
        12: 'Which of the following is correct according to David Storey?' });
    },
  },
  1350: {
    text: [['Dough Alexander reports', 'Doug Alexander reports'], ['working against the clock the preserve', 'working against the clock to preserve'], ['Some seek seeds for profit-hunters in the employ', 'Some seek seeds for profit – hunters in the employ'],
      ['plants are a source of many machines', 'plants are a source of many medicines'], ['The world Conservation Union has listed 5,714 threatened species is sure to be much higher.', 'The World Conservation Union has listed 5,714 threatened species, and the real number is sure to be much higher.'],
      ['Stored seeds can be used the help restore damaged or destroyed the environment', 'Stored seeds can be used to help restore damaged or destroyed environments'], ['for society- in medicine, agriculture or local industry- that', 'for society – in medicine, agriculture or local industry – that'],
      ['“Storage is the basis what we do', '“Storage is the basis of what we do'], ['Overseen by the Royal botanic gardens', 'Overseen by the Royal Botanic Gardens'], ['200-hectare Estate', '200-hectare estate'],
      ['only 15 per cent of all banked plants is wild', 'only 15 per cent of all banked plants are wild'], ['millennium seed bank', 'Millennium Seed Bank'], ['into wildness', 'into wilderness']],
    keys: { 8: 'drugs / drugs or crops / crops', 10: 'Sir Joseph Banks / Joseph Banks' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = TFNG(1);
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 7-11 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.slice(1).map(l => l.replace('The __Q9__. Of them', 'The __Q9__ of them'));
      g2.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 12-13 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which TWO of the following are provided by plants to humans?'; });
    },
  },
  1349: {
    text: [['presided obviously over the disappearance', 'presided obliviously over the disappearance'], ['So far about 5 teams have completed', 'So far about 75 teams have completed'], // SciAm original: "about 75 teams"
      ['transmitting a least some', 'transmitting at least some'], ['How dis husbands', 'How did husbands'], ['three of four distinct languages', 'three or four distinct languages'],
      ['This is how Cornish and some dialects of Scottish Gaelic is still only rarely used', 'This is how Cornish and some dialects of Scottish Gaelic died out. Irish is still only rarely used'],
      ['in the US., Krauss told', 'in the US, Krauss told'], ['which language can be saved', 'which languages can be saved'], ['Keneth L. Hale', 'Kenneth L. Hale'],
      ['A period when there was absent of real effort made.', 'A period when there was no real effort made'], ['They should now their loyalty', 'They should show their loyalty'], [/minority language speaker$/, 'minority language speakers']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has eight paragraphs, A-H. Choose the correct heading for paragraphs A, B and D-H from the list of headings below. Write the correct number, i-xi, in boxes 27-33 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 34-38) and the list of people below. Match each statement with the correct person, A-F. Write the correct letter, A-F, in boxes 34-38 on your answer sheet.';
      g2.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 39-40 on your answer sheet.';
      setQ(d, { 36: 'Personally witnessed the process of languages dying out', 38: 'Said there had been little organised effort until recently' });
    },
  },
  1318: {
    text: [['<h2>Facial Expression 1</h2>', '<h2>Facial Expression</h2>'], ['conveying social information among aliens', 'conveying social information among humans'], ['can also work in the order direction', 'can also work in the other direction'], ['reveal much about hos they are feeling', 'reveal much about how they are feeling'],
      ['how nervous or at ease a person maybe', 'how nervous or at ease a person may be'], ['(not that none of these emotions', '(note that none of these emotions'], ['can not be covered', 'cannot be covered'],
      ['Which is impossible covered, despite of __Q16__', 'which cannot be covered, regardless of __Q16__'], ['and made a conclusion that', 'and it concluded that']],
    fn: d => {
      d.title = 'Facial Expression';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 14-18 on your answer sheet.';
      g0.noteConfig.lines = g0.noteConfig.lines.slice(1).map(l => l.replace('__Q15__. which', '__Q15__, which'));
      g1.instruction = 'Reading Passage 2 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 19-24 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingReuseAllowed = true;
      g2.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 25-26 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which TWO of the following statements are true according to Ekman’s theory?'; });
    },
  },
  1308: {
    text: [['that passes in the While Mountains', 'that passes in the White Mountains'], ['certainly is no the only reason', 'certainly is not the only reason'], ['Bristlecone pines restricted to numerous', 'Bristlecone pines are restricted to numerous'],
      ['in California’s the White Mountains', 'in California’s White Mountains'], ['ferocious wind and mal-nutritious rocky.', 'ferocious wind and nutrient-poor rocky soil.'], ['shown that in fact such, environmental limitations', 'shown that, in fact, such environmental limitations'],
      ['Since, the rings of wood', 'Since the rings of wood'], ['higher altitudes of California’s the White Mountains', 'higher altitudes of California’s White Mountains'],
      ['reserving the __Q21__ of leave replacement', 'saving the __Q21__ of needle replacement'], ['Germination rate is high', 'the germination rate is high'], ['The summits of Owens Valley is higher than they emerge', 'The peaks south of the Owens Valley are higher than they appear']],
    // mini Q24 "air" — the passage: "Combined with the dry, windy, and often freezing mountain air, slow growth guarantees … tight, fibrous rings"
    keys: { 23: 'bands of bark / bark', 24: 'slow growth', 25: 'ground cover / ground cover vegetation' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 14-17 on your answer sheet.';
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 18-20 on your answer sheet.';
      setQ(d, { 18: 'According to paragraph A, what aspect of bristlecone pines attracts the author’s attention?', 19: 'Why are bristlecone pines in the higher altitudes of California’s White Mountains investigated?',
        20: 'Why is the same sequence of wide and narrow rings never repeated?' });
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 21-26 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace(/from a __Q26__$/, 'from a __Q26__.'));
    },
  },
  1304: {
    text: [[/<p>([A-G]) ?\. /g, '<p><strong>$1</strong> '], ['driven laterally at different frequencies (n and amplitudes', 'driven laterally at different frequencies and amplitudes'], ['the limitations of these tests was clear', 'the limitations of these tests were clear'],
      ['Pedesfrians', 'Pedestrians'], [/^H It was raining/, 'It was raining'], ['sideway movement', 'sideways movement'], ['the reason of the bridge’s wobbling', 'the reason for the bridge’s wobbling'], ['resulted from human activities', 'resulting from human activities']],
    // mini Q7 "forces" — the passage: "Human activities … could cause horizontal force which in turn could cause excessive dynamic vibration"
    keys: { 7: 'horizontal force / horizontal forces / force / forces', 8: 'vibration / dynamic vibration / excessive dynamic vibration' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose FOUR letters, A-H. Write the correct letters in boxes 1-4 on your answer sheet.';
      g0.questions.forEach(q => { q.questionText = 'Which FOUR of the following situations were witnessed on the opening day of the bridge?'; });
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 5-9 on your answer sheet.';
      // the table was flattened into one line on the mini page → rebuilt
      g2.groupType = 'table'; delete g2.noteConfig;
      g2.instruction = 'Complete the table below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 10-13 on your answer sheet.';
      g2.tableConfig = { headers: ['Universities / People', 'Activity'], rows: [['Test at __Q10__', 'Limited ability to capture only 7-8 footsteps'],
        ['‘Walking on the spot’ at Southampton', 'Not enough data on __Q11__'], ['Crowd test conducted by __Q12__', 'Aim to verify __Q13__']] };
    },
  },
  1297: {
    text: [[/ \d##qi/g, ''], ['made him 10 or II years old', 'made him 10 or 11 years old'], ['age.TheTurkana boy’s', 'age. The Turkana boy’s'], ['The Turkana kid still has a rounded skull', '‘The Turkana kid still has a rounded skull'],
      ['Neanderthals had much fester tooth growth', 'Neanderthals had much faster tooth growth'], ['adolescent growth spurt So it still', 'adolescent growth spurt. So it still'], ['modem adolescence', 'modern adolescence'],
      ['Is confined to times', 'is confined to times'], ['in human fossil.', 'in human fossils.'], [/^poor diet will cause/, 'Poor diet will cause']],
    fn: d => {
      d.title = 'Have Teenagers Always Existed?';
      d.questionGroups[2].instruction = 'Complete each sentence with the correct ending, A-G, below. Write the correct letter, A-G, in boxes 37-40 on your answer sheet.';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27-30 on your answer sheet.';
      g1.instruction = YNNG(3);
    },
  },
  1294: {
    text: [['a solarium, the Latin origin', 'a salarium, the Latin origin'], ['In 1 785, the Earl', 'In 1785, the Earl'], ['throw it over your- shoulder', 'throw it over your shoulder'], [/^H Slaves used/, 'Slaves used'],
      ['Salt is such a __Q30__.that', 'Salt is such an __Q30__ that'], ['business __Q31__.ranging', 'business __Q31__, ranging']],
    keys: { 30: 'essential element', 31: 'applications', 32: 'portable commodity', 33: 'taxes / tax revenues', 34: 'spirits' },
    fn: d => {
      d.title = 'The History of Salt';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose THREE letters, A-H. Write the correct letters in boxes 27-29 on your answer sheet.';
      g0.questions.forEach(q => { q.questionText = 'Which THREE statements are true of salt?'; });
      g2.instruction = TFNG(3);
    },
  },
  1288: {
    text: [['Branches are stacke by the women', 'Branches are stacked by the women'], ['remunerative activity in Luapula that crop husbandry', 'remunerative activity in Luapula than crop husbandry'], ['production offood', 'production of food'],
      ['Reading Passage!.', 'Reading Passage 2.'], ['eat goats on a regular time', 'eat goats on a regular basis'], ['When it is a busy time, children usually took part', 'At busy times, children usually take part']],
    keys: { 24: 'FALSE' }, // mini: TRUE — the passage: "These animals are not a regular part of most peoples’ diet."
    fn: d => {
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 14-17 on your answer sheet.';
      g0.noteConfig.lines = g0.noteConfig.lines.map(l => /__Q1[46]__$/.test(l) ? l + '.' : l);
      g1.instruction = 'Classify the following statements as referring to A fish, B oxen or C goats. Write the correct letter, A, B or C, in boxes 18-21 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingOptions = ['fish', 'oxen', 'goats']; g1.matchingReuseAllowed = true;
      g2.instruction = TFNG(2);
      g3.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 26 on your answer sheet.';
      g3.groupTitle = 'Question 26';
      g3.questions[0].questionText = 'What is the writer’s opinion about the traditional practices?';
    },
  },
  1263: {
    text: [['unlike literature for adults. Children’s literature', 'unlike literature for adults, children’s literature'], ['the kinds of lessons it can teach- either', 'the kinds of lessons it can teach – either'],
      ['Does the term literature’ exclusively', 'Does the term ‘literature’ exclusively'], ['children’s literature of often located', 'children’s literature is often located'], ['to precess a game', 'to process a game'],
      ['a particular set of skills is absent Non-players', 'a particular set of skills is absent. Non-players'], ['have from different origins', 'have different origins'], ['computerized forms of me children’s', 'computerized forms of media in children’s'],
      ['the attention of the child reader, and create definitional issues', 'the attention of the child reader and create definitional issues']],
    // Q30: mini says NOT GIVEN, but the writer says children "perceive their print literature as part of a broader continuum" (→ NO); no independent key → both accepted
    keys: { 30: 'NO / NOT GIVEN' },
    fn: d => {
      d.title = 'Children’s Literature Studies Today';
      const [g0, g1, g2, g3] = d.questionGroups;
      [g0, g1, g2, g3].forEach(g => { g.groupTitle = g.groupTitle.replace(/^QUESTIONS?/, m => m === 'QUESTIONS' ? 'Questions' : 'Question'); });
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27-29 on your answer sheet.';
      g1.instruction = YNNG(3);
      g2.instruction = 'Complete each sentence with the correct ending, A-H, below. Write the correct letter, A-H, in boxes 35-39 on your answer sheet.';
      g3.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 40 on your answer sheet.';
      g3.groupTitle = 'Question 40';
    },
  },
  1225: {
    text: [['so-called ‘meta materia Is’ exotic materials', 'so-called ‘metamaterials’ – exotic materials'], ['They can transform space, tricking', '‘They can transform space, tricking'],
      ['harness a repulsive Casimir effect Their calculations', 'harness a repulsive Casimir effect. Their calculations'], ['This is a very exciting experimental result', '‘This is a very exciting experimental result'],
      ['at St Andrew’s University', 'at St Andrews University'], ['physicists who believe the same exotic materials', 'physicists, who believe the same exotic materials']],
    fn: d => {
      d.title = 'Three Ways to Levitate a Magic Carpet';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = YNNG(2);
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 19-23 on your answer sheet.';
      g2.instruction = 'Complete each sentence with the correct ending, A-F, below. Write the correct letter, A-F, in boxes 24-26 on your answer sheet.';
    },
  },
  1027: {
    text: [['There arc two charges', 'There are two charges'], ['Garlic can remove magnetism,', 'Garlic can remove magnetism.'], ['It is a French guy named du Fay', 'It was a Frenchman named du Fay'],
      ['after the great minds of the ancient, particularly', 'after studying the great minds of the ancient world, particularly']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x, in boxes 14-20 on your answer sheet.';
      g1.instruction = TFNG(2);
      g2.instruction = 'Choose THREE letters, A-F. Write the correct letters in boxes 24-26 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which THREE of the following are parts of Gilbert’s discovery?'; });
    },
  },
  1229: {
    text: [['folloivmg', 'following'], ['what the focus of the study should he', 'what the focus of the study should be'], ['the population ot the area', 'the population of the area'], ['Tire conclusions drawn', 'The conclusions drawn'],
      ['through reading Bataiile. Bataille', 'through reading Bataille. Bataille'], ['The Literature that seemed', 'The literature that seemed'], ['initial anaLysis', 'initial analysis'], ['the colLoquial sense', 'the colloquial sense'],
      ['this Literature on ancient sacrifice', 'this literature on ancient sacrifice']],
    keys: { 40: 'colloquial / metaphorical' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.questions.forEach(q => { q.questionText = 'Which THREE of the following are problems the writer encountered when conducting his study?'; });
      g0.instruction = 'Choose THREE letters, A-F. Write the correct letters in boxes 27-29 on your answer sheet.';
      g1.instruction = YNNG(3);
      g2.instruction = 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 38-40 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.filter(l => !/^Use NO MORE/.test(l)).map(l => l.replace(/^\d+\s+/, '').replace(/__Q(\d+)__$/, '__Q$1__.'));
    },
  },
  1181: {
    text: [['similar to working through a science problem Like students', 'similar to working through a science problem. Like students'], ['Pajamas Sam', 'Pajama Sam'], ['addicting kid’s activities', 'addictive children’s activities'],
      ['Even there is a certain proportion of violence in most video games;', 'Even though there is a certain proportion of violence in most video games,'], ['Video games improves the brain ability', 'Video games improve the brain’s abilities'],
      ['with future intensions', 'with future intentions'], ['Those People who are addicted', 'Those people who are addicted']],
    // Q21: the passage only says gaming brings "rewarding surges of neurotransmitters like dopamine" — nothing about addicts → NOT GIVEN accepted too
    keys: { 21: 'TRUE / NOT GIVEN' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 14-17 on your answer sheet.';
      setQ(d, { 14: 'What is the main purpose of the first paragraph?', 15: 'What does the writer want to express in the second paragraph?', 16: 'What is correctly stated in the fourth paragraph?',
        17: 'What was the result of the experiment carried out by the three researchers?' });
      g1.instruction = TFNG(2);
      g2.instruction = 'Look at the following statements (Questions 22-26) and the list of people below. Match each statement with the correct person, A-F. Write the correct letter, A-F, in boxes 22-26 on your answer sheet.';
    },
  },
  1483: {
    text: [['just as Humans naturally deduce', 'just as humans naturally deduce'], ['spelt out the reasons why most notably', 'spelt out the reasons why, most notably,'], ['certainly written correspondence', 'certain written correspondence']],
    keys: { 9: 'complexity theory / complexity', 10: 'evolution and economics', 11: 'complex adaptive systems', 12: 'random genetic mutations', 13: 'permutations / numerous permutations' },
    fn: d => {
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = TFNG(1);
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 6 on your answer sheet.'; g1.groupTitle = 'Question 6';
      setQ(d, { 6: 'According to the passage, what do people believe should play a vital role in every area of the economy?' });
      g2.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 7-8 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which TWO of the following are used, according to one economic explanation, to disguise a request for an alliance?'; });
      g3.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 9-13 on your answer sheet.';
    },
  },
  // ───── batch 12 (phase C, pages flagged only by mini_check false positives) ─────
  1492: {
    text: [[/<p>\{([A-H])\} /g, '<p><strong>$1</strong> '], ['19th and 20thcenturies', '19th and 20th centuries'], ['the name Goodyear , it was Charles Goodyear', 'the name Goodyear; it was Charles Goodyear'],
      ['metals and plastics.Parkes is credited', 'metals and plastics. Parkes is credited'], ['in its original formulation, it was too flammable, it laid', 'in its original formulation – it was too flammable – it laid'],
      ['and another English inventor, Frederick Scott Archer, discovery of liquid nitrocellulose. Hyatt combined two', 'and another English inventor Frederick Scott Archer’s discovery, liquid nitrocellulose. Hyatt combined the two'],
      ['rather than his former employer .', 'rather than his former employer.'], ['what the chemists are trying on', 'what the chemists are working on'], ['has completely faded out of in commercial use', 'has completely faded out of commercial use']],
    // mini Q38 "his invention spirit" — the passage: "It was there Parkes developed his inventive spirit."
    keys: { 36: 'metal fabrication', 37: 'brass foundry', 38: 'inventive spirit / his inventive spirit', 39: 'metals and plastics', 40: 'nitrocellulose and solvents' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Look at the following statements (Questions 27-31) and the list of people below. Match each statement with the correct person, A-F. Write the correct letter, A-F, in boxes 27-31 on your answer sheet.';
      g1.instruction = TFNG(3);
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 36-40 on your answer sheet.';
    },
  },
  1474: {
    text: [[/<p>\{([A-I])\} /g, '<p><strong>$1</strong> '], ['<h2>Tool for ancient writing</h2>', '<h2>Tools for Ancient Writing</h2>'], ['to placemarks upon', 'to place marks upon'],
      ['originated in Greece .', 'originated in Greece.'], ['iron salts , nutgalls', 'iron salts, nutgalls'], ['squeezing the reed forced fluid to the nib</p>', 'squeezing the reed forced fluid to the nib.</p>'],
      ['until paper mills were built in the late 14th century</p>', 'until paper mills were built in the late 14th century.</p>'], ['leading to the development of the modern fountain pens</p>', 'leading to the development of the modern fountain pens.</p>'],
      ['What hurts the technique of producing wooden paper from popularity for a long time?', 'What kept the technique of producing wood-fibre paper from becoming popular for a long time?'],
      ['What two features do record retention possess in nature?', 'Which TWO features are naturally part of record keeping?']],
    keys: { 24: 'lengthy preparation time / a lengthy preparation time', 25: '1436 / in 1436', 26: 'modern fountain pens / fountain pens' },
    fn: d => {
      d.title = 'Tools for Ancient Writing';
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 14-15 on your answer sheet.';
      g1.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 16 on your answer sheet.'; g1.groupTitle = 'Question 16';
      g2.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 17-23 on your answer sheet. NB You may use any letter more than once.';
      g2.matchingReuseAllowed = true;
      g3.instruction = 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet.';
      g3.noteConfig.lines = g3.noteConfig.lines.map(l => l.replace(/^\d+\s+/, ''));
    },
  },
  1439: {
    text: [['<p>B the world has been changed', '<p><strong>B</strong> The world has been changed'], ['Multitasks are able to complete', 'Multitaskers are able to complete'], ['Reading thewords', 'Reading the words'],
      ['phenomenon “email voice"</p>', 'phenomenon “email voice”.</p>'], ['a smart-phoneor a laptop', 'a smart-phone or a laptop'], ['Nowwhen you work', 'Now when you work'], ['with more people than ever, liven inventions', 'with more people than ever. Even inventions'],
      ['the housewife will sit down with her legs up. and chat', 'the housewife would sit down with her legs up and chat'], ['varies between species, He found', 'varies between species. He found'], ['multitasking.. However', 'multitasking. However'],
      ['whether the cortexwas truly', 'whether the cortex was truly'], ['to his subjects in a wax that mimics', 'to his subjects in a way that mimics'], ['attached sensors tothe patients " heads', 'attached sensors to the patients’ heads'],
      ['This sensor would show if" the brain particles', 'This sensor would show if the brain particles'], ['Davis Meyer, a professor', 'David Meyer, a professor'], ['For this experiment. Meyer found', 'For this experiment, Meyer found'],
      ['you are actuallyswitching', 'you are actually switching'], ['at the sametime', 'at the same time'], ['the task look more time', 'the task took more time'], ['with no reason at all,cheek a website', 'with no reason at all, check a website'],
      ['He suggestedthat', 'He suggested that'], ['for a very short time</p>', 'for a very short time.</p>'], ['efficient way for our brainsto work', 'efficient way for our brains to work'], ['with a varietyof tasks, Edward Hallowell', 'with a variety of tasks. Edward Hallowell'],
      ['As it matter of fact', 'As a matter of fact'], ['A person can alsoapply', 'A person can also apply'], ['cannot focuson your surroundings', 'cannot focus on your surroundings'], ['When faced multiple visual stimulants', 'When faced with multiple visual stimulants'],
      ['efficiency when multitasking, Gloria Mark set', 'efficiency when multitasking. Gloria Mark set'], ['multitask together', 'multitask']],
    keys: { 25: 'prefrontal cortex / prefrontal' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information? Write the correct letter, A-F, in boxes 14-18 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 19-23) and the list of scientists below. Match each statement with the correct scientist, A-E. Write the correct letter, A-E, in boxes 19-23 on your answer sheet. NB You may use any letter more than once.';
      g1.matchingReuseAllowed = true;
    },
  },
  1421: {
    text: [['The last time, he went to the printers and stopped the presses, the article', 'The last time, he went to the printers and stopped the presses; the article'],
      ['Write the correct letter in boxe 14 on your answer sheet.', 'Write the correct letter in box 40 on your answer sheet.'], ['to develop a source of electronic power, farming and sail.', 'to develop a source of electric power, farming and navigation.']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the summary using the list of words and phrases, A-L, below. Write the correct letter, A-L, in boxes 27-34 on your answer sheet.';
      g1.instruction = TFNG(3);
      g2.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 40 on your answer sheet.'; g2.groupTitle = 'Question 40';
    },
  },
  1415: {
    text: [[/<p>([A-G])\. /g, '<p><strong>$1</strong> '], ['<h2>How to handle the Sun</h2>', '<h2>How to Handle the Sun</h2>'], ['Other pans of the human body', 'Other parts of the human body'],
      ['the year-round outdoor workers – 90% of which occurs', 'the year-round outdoor workers – 90% of the damage occurs'],
      // "an __Q37__" pointed at 'arrangement'; the key (fat + sweat "combine") is 'blend' → article must be "a"
      ['the body has a defense: an __Q37__', 'the body has a defense: a __Q37__']],
    fn: d => {
      d.title = 'How to Handle the Sun';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Look at the following people (Questions 27-30) and the list of statements below. Match each person with the correct statement, A-H. Write the correct letter, A-H, in boxes 27-30 on your answer sheet.';
      g1.instruction = TFNG(3);
      // a summary with a box of words — the converter left it as free-typing notes → summary with a word bank (answers are the words)
      const box = 'overcome maintaining located mixed quickly extended prolonged blend arrangement succeed combined surprisingly slowly triumph affected caring minding'.split(' ');
      const L = g2.noteConfig.lines.filter(l => /__Q\d+__/.test(l));
      g2.groupType = 'summary-completion'; delete g2.noteConfig;
      g2.instruction = 'Complete the summary using the list of words below. Write the correct answer in boxes 36-40 on your answer sheet.';
      g2.summaryConfig = { text: '<strong>Handling the Sun</strong><br>' + L.join('<br><br>').replace('quite __Q39__ On the other hand', 'quite __Q39__. On the other hand'),
        wordBank: box.map((word, i) => ({ letter: String.fromCharCode(65 + i), word })) };
      g2.questions.forEach(q => { q.correctAnswer = q.correctAnswer.toLowerCase(); });
    },
  },
  1399: {
    // no original found online for the garbled sentences → minimal repairs only, none of them carries an answer
    text: [['When peace with the French broke out. he turned his attention to, and in particular to solve the conundrum', 'When peace with the French broke out, he turned his attention to exploration, and in particular to solving the conundrum'],
      ['Between 1819 and 1822. Franklin', 'Between 1819 and 1822, Franklin'], ['salon-goer {‘the man who ate his boots’ was Franklin’s tag-line)', 'salon-goer (‘the man who ate his boots’ was Franklin’s tag-line)'],
      ['in his published memoirs. Franklin comes across', 'in his published memoirs, Franklin comes across'], ['as a young boy. playing catch', 'as a young boy, playing catch'], ['For Nadolny. Franklin’s', 'For Nadolny, Franklin’s'],
      ['doing things his way. and gradually', 'doing things his way, and gradually'], ['‘When I tell something, sir. I use', '‘When I tell something, sir, I use'], ['in Germany in 1983. The Discovery of Slowness', 'in Germany in 1983, The Discovery of Slowness'],
      ['and it has been as a manual and by European pressure groups', 'and it has been taken up as a manual by European pressure groups'], ['A centre scheme (a ‘march of slowness’', 'There is even a centre scheme (a ‘march of slowness’'],
      ['the right one. the lost one', 'the right one, the lost one'], ['described The Discovery of Slowness is a ‘major event', 'described The Discovery of Slowness as a ‘major event'],
      ['In his personal correspondence to and in his published memoirs by Sten Nadolny,', 'In Sten Nadolny’s novel,'], ['his languish attitude', 'his languid attitude'], ['in marine time life', 'in his life at sea'], ['speed limits German', 'speed limits in Germany'], ['symposia German churches', 'symposia in German churches']],
    fn: d => {
      d.title = 'John Franklin: The Discovery of Slowness';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 27-32 on your answer sheet. NB You may use any letter more than once.';
      g0.matchingOptions = 'ABCDEFGHI'.split(''); // mini listed only A-H, but the passage has paragraphs A-I
      g0.matchingReuseAllowed = true;
      g1.instruction = 'Complete the summary using the list of words, A-K, below. Write the correct word in boxes 33-36 on your answer sheet.';
      g2.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 37-40 on your answer sheet.';
    },
  },
  1391: {
    text: [['working remotely from an office- is said', 'working remotely from an office – is said'], ['home-bases workers', 'home-based workers'], ['will be reduced, as well the building and repair of highways', 'will be reduced. As well, the building and repair of highways'],
      ['transportation of the required materials An increase', 'transportation of the required materials. An increase'], ['As one survey respondent noted. “Although', 'As one survey respondent noted, “Although'],
      ['is all up to you when you work from home, you’ll surely', 'is all up to you when you work from home. You’ll surely'], ['could send documents __Q17__ Apart from that', 'could send documents __Q17__. Apart from that'],
      ['consumed in all __Q21__', 'consumed in all __Q21__.'], ['When you work at office equipments such as', 'When you work at an office, equipment such as'], ['worried in the economical problems arise', 'worried about the economic problems that arise']],
    keys: { 19: 'equipment' }, // word bank K/L were merged into "equipment L company" on the mini page
    fn: d => {
      d.title = 'Teleworking';
      const [g0, g1, g2] = d.questionGroups;
      const wb = g0.summaryConfig.wordBank; const k = wb.findIndex(w => w.word === 'equipment L company');
      wb.splice(k, 1, { letter: 'K', word: 'equipment' }, { letter: 'L', word: 'company' });
      g0.instruction = 'Complete the summary using the list of words, A-N, below. Write the correct answer in boxes 14-21 on your answer sheet.';
      g1.instruction = 'Complete each sentence with the correct ending, A-F, below. Write the correct letter, A-F, in boxes 22-25 on your answer sheet.';
      g2.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in box 26 on your answer sheet.'; g2.groupTitle = 'Question 26';
      g2.questions[0].questionText = 'What is the writer’s overall attitude towards teleworking?';
    },
  },
  1384: {
    text: [['indicate their presence of iron compounds', 'indicate the presence of iron compounds'], ['between 1954 and 1959 the China’s Ningxia Province', 'between 1954 and 1959 in China’s Ningxia Province'],
      ['with slipfaces on there or more arms', 'with slipfaces on three or more arms'], ['Many forms in bidirectional wind regimes.', 'Many form in bidirectional wind regimes.'], ['Sand Mountain n Nevada', 'Sand Mountain in Nevada'],
      ['Potential threat to buildings and crops despite of benefit.', 'Potential threat to buildings and crops despite benefits'], ['Answer the questions 35-36 and choose correct letter A , B , C or D .', 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 35-36 on your answer sheet.'],
      ['Which one is not mentioned as a sand type in this passage?', 'Which one is not mentioned as a type of sand dune in this passage?']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has eight paragraphs, A-H. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x, in boxes 27-34 on your answer sheet.';
      g2.instruction = 'Complete the summary using the list of words, A-J, below. Write the correct answer in boxes 37-40 on your answer sheet.';
    },
  },
  1351: {
    text: [[/<p>([A-J])\. /g, '<p><strong>$1</strong> '], ['“sustainable designers’.', '“sustainable designers”.'], ['with consumer durables is colossal</p>', 'with consumer durables is colossal.</p>'],
      ['and this protects it from obsolescence Stahel says', 'and this protects it from obsolescence. Stahel says'], ['consumerist culture instead of idolizes novelty', 'consumerist culture instead idolizes novelty'], ['glossy , box-fresh', 'glossy, box-fresh'],
      ['“changing the engine of an aircraft in mid-flight’ Even so', '“changing the engine of an aircraft in mid-flight”. Even so'], ['EZIO MANZINI, Professor', 'Ezio Manzini, Professor'], ['hardly use， especially', 'hardly use, especially'],
      ['who they are and to show what group of people they feel they belong to’ Chapman says', 'who they are and to show what group of people they feel they belong to,’ Chapman says'],
      ['sustainable design proceeds __Q6__ the coming problems', 'sustainable design proceeds __Q6__, the coming problems'], ['Company will spend less on repairs', 'Companies will spend less on repairs'], ['make us to keep the objects', 'make us keep the objects']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 1-5 on your answer sheet.';
      g1.instruction = 'Complete the summary using the list of words, A-H, below. Write the correct answer in boxes 6-9 on your answer sheet.';
      g2.instruction = YNNG(1);
    },
  },
  1346: {
    text: [['That piece of “ Junk”', 'That piece of “junk”'], ['Frangois Charette', 'François Charette'], ['“ In this case, we have', '“In this case, we have'], ['three- dimensional-imaging', 'three-dimensional imaging'],
      ['between lunar months __ the time it takes', 'between lunar months – the time it takes'], [/full moon -­?and calendar years/, 'full moon – and calendar years'], ['the mechanism would directly help，,”', 'the mechanism would directly help,”'],
      ['written in our time ~ and an aircraft engine', 'written in our time – and an aircraft engine'], ['built for a planetarium today __ something', 'built for a planetarium today – something'], ['to have been the one ever made', 'to have been the only one ever made'],
      ['An ancient huge sunk __Q19__ was found accidentally by sponges searcher.', 'An ancient huge sunken __Q19__ was found accidentally by sponge divers.'], ['such as bronze and sculptures', 'such as bronze and marble statues'],
      ['Ancient astronomers and craftsman might involve', 'Ancient astronomers and craftspeople might have been involved'], ['Anticipate to find more', 'Expects to find more']],
    // Q17 "details of how it was found": A (divers found the wreck) and B (an archaeologist found the gearwheel in the "junk") both fit → both accepted
    keys: { 17: 'A / B', 22: 'analogue computer / analog computer' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has ten paragraphs, A-J. Which paragraph contains the following information? Write the correct letter, A-J, in boxes 14-18 on your answer sheet.';
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 19-22 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.map(l => l.replace(/__Q22__$/, '__Q22__.'));
      g2.instruction = 'Look at the following statements (Questions 23-26) and the list of people below. Match each statement with the correct person, A, B or C. Write the correct letter, A, B or C, in boxes 23-26 on your answer sheet. NB You may use any letter more than once.';
      g2.matchingReuseAllowed = true;
    },
  },
  1345: {
    text: [['Many species, for example, consume dirt a behaviour', 'Many species, for example, consume dirt – a behaviour'], ['use of mechanical scours to get rid of gut parasites, in 1972', 'use of mechanical scours to get rid of gut parasites. In 1972'],
      ['in plants increases-and so does', 'in plants increases – and so does'], ['found across animals species', 'found across animal species'], ['a kind of medication to their illnesses', 'a kind of medication for their illnesses']],
    // Q4: painkillers are never mentioned — Engel's interest is livestock health → NOT GIVEN accepted alongside mini's FALSE
    keys: { 4: 'FALSE / NOT GIVEN' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = TFNG(1);
      // the table was flattened into one line → rebuilt
      g1.groupType = 'table'; delete g1.noteConfig;
      g1.instruction = 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 5-9 on your answer sheet.';
      g1.tableConfig = { headers: ['Date', 'Name', 'Animal', 'Food', 'Mechanism'], rows: [
        ['1987', 'Michael Huffman and Mohamedi Seifu', 'Chimpanzee', '__Q5__ of Veronia', 'Contained chemicals named __Q6__ which can kill parasites'],
        ['1999', 'James Gilardi and his colleagues', 'Macaw', 'Seeds (contain __Q7__) and clay', 'Clay can __Q8__ the poisonous contents in food'],
        ['1972', 'Richard Wrangham', 'Chimpanzee', 'Leaves with tiny __Q9__ on surface', 'Such leaves can catch and expel worms from intestines']] };
      g2.instruction = 'Complete the summary using the list of words, A-H, below. Write the correct answer in boxes 10-13 on your answer sheet.';
    },
  },
  1339: {
    text: [[/<p>([BDG]) \. /g, '<p><strong>$1</strong> '], ['three significant fiends which stand', 'three significant trends which stand'], ['All of these fiends are producing', 'All of these trends are producing'], ['the uprecedented population growth throughout the world a net increase of 1,400,000 people per week and all of', 'the unprecedented population growth throughout the world – a net increase of 1,400,000 people per week – and all of'],
      ['a look at ramped living conditions', 'a look at cramped living conditions'], ['crowding makes US feel', 'crowding makes us feel'], ['related to stimulus overload there are', 'related to stimulus overload – there are'], ['In male prison, inmate; living', 'In male prisons, inmates living'],
      ['the lack of __Q21__ 9 Inmates', 'the lack of __Q21__. 9 Inmates']],
    keys: { 21: 'privacy', 22: 'male prison / male prisons / a male prison', 23: 'personal space', 24: 'attraction / physical attraction', 25: 'help', 26: 'control' },
    fn: d => {
      const [g0, g1] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x, in boxes 14-20 on your answer sheet.';
      const N = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
      g0.headingsConfig = { headings: ['Other experiments following Calhoun’s experiment offering a clearer indication', 'The effects of crowding on people in the social scope', 'Psychological reaction to crowding',
        'Problems that result in crowding', 'Responsibility does not work', 'What causes the upset feeling of crowding', 'Definitions of crowding and density', 'Advice for crowded work environments',
        'Difference between male and females’ attractiveness in a crowd', 'Nature and results of Calhoun’s experiment'].map((text, i) => ({ numeral: N[i], text })) };
      g0.questions.forEach(q => { q.questionText = q.questionText.replace('Paragraph c', 'Paragraph C'); });
      g1.instruction = 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 21-26 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines[0].replace(/\s*##a/, '.').split(/\s*\b(?:8|9|10|11|12|13)\s+(?=[A-Z])/).filter(Boolean).map(l => l.trim().replace(/__Q(\d+)__$/, '__Q$1__.').replace('a person’s reluctant to', 'a person’s reluctance to'));
    },
  },
  1336: {
    text: [['<h2>Is Graffiti Art or Crime</h2>', '<h2>Is Graffiti Art or Crime?</h2>'], ['can also lead to move serious forms of vandalism', 'can also lead to more serious forms of vandalism'], ['can be helpful in cleaning operatives', 'can be helpful to cleaning operatives'],
      ['A physical barriers such as a wall', 'Physical barriers such as a wall'], ['risks for both Chemical and medication method', 'risks for both chemical and mechanical methods'], ['cocktail removal can be safer than water treatment', 'chemical ‘cocktail’ removal can be safer than water treatment'],
      ['small patch trial before applying large scale of removing', 'small trial areas before large-scale removal'], ['are mentioned effectively in the passage', 'are mentioned as effective in the passage'], ['records the __Q37__ of details life for that period', 'records the __Q37__ of life at that time'],
      ['which is called __Q38__ that they are familiar with', 'which is called __Q38__, that they are familiar with.'], ['put on the suitable __Q39__', 'put on the suitable __Q39__.'], ['can be much convenient of using __Q40__.', 'can be much more convenient using __Q40__.']],
    keys: { 38: 'tags / tag', 40: 'water / low-pressure water' },
    fn: d => {
      d.title = 'Is Graffiti Art or Crime?';
      const [g0, g1, g2, g3] = d.questionGroups;
      g0.instruction = 'Reading Passage 3 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 27-32 on your answer sheet. NB You may use any letter more than once.';
      g0.matchingReuseAllowed = true;
      g1.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 33-34 on your answer sheet.';
      g1.questions.forEach(q => { q.questionText = 'Which TWO statements are true concerning the removal of graffiti?'; });
      g2.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 35-36 on your answer sheet.';
      g3.instruction = 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 37-40 on your answer sheet.';
    },
  },
  1335: {
    text: [[/<p>Section ([A-E]) ([^<]+?):?<\/p>/g, '<p><strong>Section $1 – $2</strong></p>'], ['<h2>A decibel Hell (The Effects of Living in a Noisy World)</h2>', '<h2>A Decibel Hell: The Effects of Living in a Noisy World</h2>'],
      ['clicking on the ears', 'clicking in the ears'], ['Third National Health and Nutrition, Examination Survey', 'Third National Health and Nutrition Examination Survey'], ['on the noise issue that the United States has', 'on the noise issue than the United States has'],
      ['the unease of __Q17__ ##a in healthy people', 'the unease of the __Q17__ in healthy people'], ['the average of __Q14__ referring to', 'the average of __Q14__, according to'], ['can cause damage __Q15__ on certain senior age.', 'can cause __Q15__ damage by a certain age.'],
      ['The board of schools built close to the tracks are convinced to', 'The board of a school built close to the tracks was persuaded to'], ['moved the classrooms away', 'move the classrooms away'], ['regulated the track usage', 'regulate the track usage'],
      ['utilised a special material into classroom', 'use a special material in classroom'], ['organised a team for a follow-up study', 'organise a team for a follow-up study'], ['What is the best title in paragraph 1?', 'What is the best title for the whole passage?']],
    keys: { 14: '85 dBA / 85 decibels', 15: 'hearing', 16: 'high-frequency / high frequency', 17: 'stomach', 18: 'noise maps / noise map' },
    fn: d => {
      d.title = 'A Decibel Hell: The Effects of Living in a Noisy World';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 14-18 on your answer sheet.';
      g1.instruction = 'Look at the following statements (Questions 19-23) and the list of researchers and organisations below. Match each statement with the correct one, A-E. Write the correct letter, A-E, in boxes 19-23 on your answer sheet.';
      g1.matchingOptions = g1.matchingOptions.map(o => o.replace(/,\s*$/, ''));
      g2.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 24-26 on your answer sheet.';
    },
  },
  1306: {
    text: [['<h2>Food for thought 2</h2>', '<h2>Food for Thought</h2>'], ['nor is the land unusually crowed or infertile', 'nor is the land unusually crowded or infertile'], ['seemed unattractive when setting against', 'seemed unattractive when set against'], ['feeding children at schools work so well', 'feeding children at schools works so well'],
      ['Surprising academics outcome', 'Surprising academic outcome'], ['The pass rate as Msekeni', 'The pass rate at Msekeni'], ['Malawi has trouble to feed its large population.', 'Malawi has trouble feeding its large population.'], ['No new staffs were recruited', 'No new staff were recruited']],
    fn: d => {
      d.title = 'Food for Thought';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-xi, in boxes 14-20 on your answer sheet.';
      // the eleven headings were parsed as one → split on the roman numerals
      const one = 'i ' + g0.headingsConfig.headings[0].text;
      g0.headingsConfig.headings = one.split(/\s+(?=(?:ii|iii|iv|v|vi|vii|viii|ix|x|xi)\s+[A-Z])/).map(s => { const m = s.match(/^([ivx]+)\s+(.+)$/); return { numeral: m[1], text: m[2].trim() }; });
      g1.instruction = 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 21-24 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.map(l => l.replace(/^\d+\s+/, ''));
      g2.instruction = 'Choose TWO letters, A-F. Write the correct letters in boxes 25-26 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which TWO of the following statements are true?'; });
    },
  },
  1301: {
    text: [['THE FACT THAT there was once', 'The fact that there was once'], ['Why do some species die and some life?', 'Why do some species die and some live?'], ['the swiftest or the most cunning from famine', 'the swiftest or the most cunning; from famine'],
      ['in Java, Bronco and the Philipiones', 'in Java, Borneo and the Philippines'], ['collectors-which is how he made a living', 'collectors – which is how he made a living'], ['particular island-Celebes', 'particular island – Celebes'],
      ['200MYA East and West Celebes', '200 million years ago, East and West Celebes'], ['IN HIS ORIGIN OF CONTINENTS AND OCEANS,', 'In his Origin of Continents and Oceans,'],
      ['conceived the same very ingenious theory,”</p>', 'conceived the same very ingenious theory.”</p>'], ['“ __Q25__ ” and “ __Q26__ ”', '“__Q25__” and “__Q26__”.']],
    // mini Q26 "vicarisanism" — the passage spells it "vicarianism"
    keys: { 22: 'migrated', 23: 'withering skin', 24: 'tectonic plates / plates', 26: 'vicarianism' },
    fn: d => {
      d.title = 'Origin of Species and Continent Formation';
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Look at the following statements (Questions 14-18) and the list of people below. Match each statement with the correct person or people, A-E. Write the correct letter, A-E, in boxes 14-18 on your answer sheet.';
      g1.instruction = 'Reading Passage 2 has nine paragraphs, A-I. Which paragraph contains the following information? Write the correct letter, A-I, in boxes 19-21 on your answer sheet.';
      g2.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 22-26 on your answer sheet.';
    },
  },
  1290: {
    text: [['Our mother may have told you', 'Your mother may have told you'], ['where his is plugging his latest book', 'where he is plugging his latest book'], ['ridiculously small favour from their food server', 'a ridiculously small favour from their food server'],
      ['explain the reason way researcher', 'explain the reason why researchers'], ['help people to sale products', 'help people to sell products'], ['he interviewed and contract with many salespeople', 'he interviewed and had contact with many salespeople'],
      ['he made lot phone calls', 'he made a lot of phone calls'], ['Elder generation of New Zealand', 'The older generation in New Zealand']],
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 14-17 on your answer sheet.';
      setQ(d, { 14: 'The main purpose of Cialdini’s research and writing is to', 15: 'Which statement is CORRECT about Cialdini’s research methods?', 17: 'Which of the following is CORRECT according to the restaurant chocolate experiment in the passage?' });
      g1.instruction = TFNG(2);
      g1.questions.forEach(q => { q.correctAnswer = ({ YES: 'TRUE', NO: 'FALSE' })[q.correctAnswer] || q.correctAnswer; });
      g2.instruction = 'Look at the following descriptions (Questions 22-26) and the list of principles below. Match each description with the correct principle, A-E. Write the correct letter, A-E, in boxes 22-26 on your answer sheet.';
      g2.matchingOptions = ['Scarcity', 'Authority', 'Commitment/consistency', 'Linking', 'Social proof'];
      setQ(d, { 23: 'Parents tell their children what other children are doing.', 24: 'Advertisers ruthlessly exploit limited opportunities.', 25: 'Use a name resembling the subject’s own in a survey.', 26: 'Ask colleagues whether they will offer a helping hand.' });
    },
  },
  1289: {
    text: [[/<p>\{([A-G])\} /g, '<p><strong>$1</strong> '], ['as when source speeches turned into target writing', 'as when source speeches are turned into target writing'], ['consecutive and simultaneous In consecutive translation', 'consecutive and simultaneous. In consecutive translation'],
      ['cannot easily be reconciled ( with your translation', 'cannot easily be reconciled with your translation'], ['Great nimbleness is called for</p>', 'Great nimbleness is called for.</p>'], ['to a great extent on the length', 'to a great extent, on the length'],
      ['which depends on the sophistication of paper', 'which depends on the complexity of the text'], ['When experts took close research on affecting elements', 'When experts researched the factors involved'], ['speaking speed is somehow among __Q8__ w.p.m.', 'speaking speed is between __Q8__ w.p.m.'],
      ['about __Q9__ W.p.m.', 'about __Q9__ w.p.m.'], ['noisy of background', 'background noise'], ['culture of different backgrounds', 'different cultural backgrounds'], ['different meaning in various profession', 'different meanings in various professions']],
    keys: { 6: '2 or 3 seconds / 2-3 seconds / 2 to 3 seconds', 7: '10 seconds', 8: '100 and 120 / 100 to 120 / 100-120', 9: '200' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 1-5 on your answer sheet.';
      setQ(d, { 1: 'How does the writer describe translation at the beginning of the passage?', 2: 'The use of headphones at a UN conference tells us that', 5: 'In consecutive translation, if the section is longer than expected, what would an interpreter most probably do?' });
      g1.instruction = 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 6-9 on your answer sheet.';
      g1.noteConfig.lines = g1.noteConfig.lines.filter(l => l !== 'Summary');
      g2.instruction = 'Choose FOUR letters, A-G. Write the correct letters in boxes 10-13 on your answer sheet.';
      g2.questions.forEach(q => { q.questionText = 'Which FOUR of the following are factors that affect interpreting?'; });
    },
  },
  1260: {
    text: [['instead of fly several thousands of miles', 'instead fly several thousands of miles'], ['Birds travelling in family groups are safe.', 'Birds travelling in family groups are safer.']],
    keys: { 23: 'parental guidance', 24: 'compass', 25: 'predators / daytime predators', 26: 'visible' },
    fn: d => {
      const [g0, g1, g2] = d.questionGroups;
      g0.instruction = 'Reading Passage 2 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x, in boxes 14-20 on your answer sheet.';
      const N = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
      g0.headingsConfig = { headings: ['The best moment to migrate', 'The unexplained rejection of closer feeding grounds', 'The influence of weather on the migration route', 'Physical characteristics that allow birds to migrate',
        'The main reason why birds migrate', 'The best wintering grounds for birds', 'Research findings on how birds migrate', 'Successful migration despite the trouble of wind',
        'The contrast between long-distance migration and short-distance migration', 'Mysterious migration despite lack of teaching'].map((text, i) => ({ numeral: N[i], text })) };
      g1.instruction = 'Choose TWO letters, A-E. Write the correct letters in boxes 21-22 on your answer sheet.';
      g1.questions.forEach(q => { q.questionText = 'Which TWO of the following statements are true of bird migration?'; });
      // "parental guidance" is two words — the mini instruction said ONE WORD
      g2.instruction = 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 23-26 on your answer sheet.';
      g2.noteConfig.lines = g2.noteConfig.lines.map(l => l.replace(/__Q(\d+)__$/, '__Q$1__.'));
    },
  },
};
