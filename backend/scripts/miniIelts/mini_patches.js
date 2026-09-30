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
};
