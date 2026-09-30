// Hand review of the 10 pilot drafts (keys checked against each passage; ECE answer keys where available).
// Each entry: text: [[from, to]] replacements applied to content AND all question/instruction/note strings,
// keys: {q: answer}, notes: {q: fullLine}, q: {q: questionText}, fn: (doc) => {}
const TFNG = n => `Do the following statements agree with the information given in Reading Passage ${n}? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.`;
const P = d => ({ passage1: 1, passage2: 2, passage3: 3 })[d.category];
const YNNG = n => `Do the following statements agree with the views of the writer in Reading Passage ${n}? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.`;
const setQ = (d, stems) => d.questionGroups.flatMap(g => g.questions).forEach(q => { if (stems[q.questionNumber]) q.questionText = stems[q.questionNumber]; });

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
};
