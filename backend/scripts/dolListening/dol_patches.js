// Hand fixes per DOL section id, applied by dol_convert.js after conversion.
//   keys: { <questionNumber>: '<answer/variant>' }   (question numbers as imported)
//   fn(draft, warns): any other edit to the draft
const groupOf = (d, n) => d.questionGroups.find(g => g.questions.some(q => q.questionNumber === n));

module.exports = {
  // Apartment Rental In Calgary’s Market
  '6058097b511ef10dfd387c9c': { keys: { 5: 'a study/study' } },
  // "A Geography Trip" on DOL, but the recording is about a TV-news work placement; OCR typo in option F
  '605c59678a6f3269445724d1': {
    fn: d => {
      d.title = 'Work Placement at a TV News Centre';
      const g = groupOf(d, 21);
      g.matchingOptions = g.matchingOptions.map(o => o === 'retaxed' ? 'relaxed' : o);
    },
  },
  // The Story Of John Manjiro: "six" alone does not fit "He spent ___ on a deserted island"
  '606c0ffedb66f95dd0c50f7a': { keys: { 12: 'six months/6 months' } },
  // Megequip Customer Detail: the example row was stored as the table header; typo "Terracce"
  '605c4ff38a6f3269445724cd': {
    fn: d => {
      const t = groupOf(d, 1).tableConfig;
      t.rows[0] = ['<em>Example:</em> Order from', '<u>winter</u> catalogue'];
      t.rows = t.rows.map(r => r.map(c => c.replace('Terracce', 'Terrace')));
    },
  },
  // Advice On Writing A Dissertation: generic speaker labels → the characters' names
  '6061b9f78a6f326944572543': {
    fn: d => { d.transcript = d.transcript.replace(/^Man:$/gm, 'Howard:').replace(/^Woman:$/gm, 'Joanne:'); },
  },
  // ── Cambridge 9 ──
  // Job Inquiry: "Pay: __Q4__ £ an hour"
  '606593948a6f3269445725a0': { text: [['</strong> __Q4__ £ an hour', '</strong> £ __Q4__ an hour'], ['offering£4.45', 'offering £4.45']] },
  // The Underground House
  '605c23468a6f3269445724b3': { keys: { 40: '15 years/fifteen years' } },
  // Health Centres
  '605c2fdd8a6f3269445724b6': { text: [['what it says bout the', 'what it says about the'], ['vaccinated before and trips abroad', 'vaccinated before any trips abroad']] },
  // Kira - The Exchange Student: accept the natural variants of the short answers
  '605c41d68a6f3269445724bd': { keys: { 26: 'in small groups/small groups/in groups/groups', 27: 'every second day/every 2 days/every two days', 28: '2 weeks/two weeks', 29: 'more confident/much more confident/confident' } },
  // Water Heater
  '605c39d98a6f3269445724ba': { text: [["They's both good", "They're both good"]] },
  // Sports World: DOL's transcript drops the sentence with the Q12 answer (heard with Whisper, 1:16–1:26)
  '6065a5b08a6f3269445725a1': {
    text: [['decided to open another branch in the area.', 'decided to open another branch in the area. It\'s going to be in the shopping centre to the west of Bradcaster, so that will be good news for all of you who found the original shop in the north of the town hard to get to.']],
  },
  // Parks & Open Spaces
  '605bf3988a6f3269445724a2': { text: [['start with a four of our herb garden', 'start with a tour of our herb garden'], ['their about their use', 'their use']] },
  // Business Culture
  '605c07408a6f3269445724aa': { text: [['teams refer this type', 'teams prefer this type'], ["breaking the rules'.", "'breaking the rules'."]] },
  // Greek Island Holiday
  '605c0ebb8a6f3269445724ae': { text: [['Blue Bay Departments', 'Blue Bay Apartments'], ['just dow the road', 'just down the road']] },
  // Winridge Forest Railway Park: 1:59 is still Simon speaking, not the interviewer
  '605c13f68a6f3269445724af': {
    keys: { 20: '5-12/5 to 12/5–12' },
    fn: d => { d.transcript = d.transcript.replace('\nWoman:\nIt soon became clear', '\nIt soon became clear').replace('wildlife, and by making cuttings through the rock.\nMan:\n', 'wildlife, and by making cuttings through the rock.\n'); },
  },
  // Study Skills Tutorial
  '605c17788a6f3269445724b1': { text: [['your turorials', 'your tutorials']] },
  // ── Cambridge 10 ──
  '606443218a6f326944572589': { keys: { 7: '2020/2,020' } },   // Self-Drive Tour
  // Global Design Competition: "Well, I'm sure a lot of positive things…" is the professor's line
  '606451758a6f32694457258d': {
    fn: d => { d.transcript = d.transcript.replace('Probably not, but that’s OK.\nWell, I’m sure', 'Probably not, but that’s OK.\nProfessor:\nWell, I’m sure').replace('come out of your design.\nProfessor:\nNow', 'come out of your design.\nNow'); },
  },
  '606463bc8a6f326944572591': { text: [['Lusia', 'Luisa']] },   // Transport Survey
  '606469fb8a6f326944572592': { text: [['divided into sex areas', 'divided into six areas'], ['fits is so well', 'fits in so well']] },   // New City Development
  '60653bb18a6f326944572594': { text: [['cut of by the sea', 'cut off by the sea'], ['his own the little museum', 'his own little museum']] },   // Thor Heyerdahl
  '6065433f8a6f326944572596': { text: [['being about to choose', 'being able to choose']] },   // The Future Of Management
  '60654c898a6f326944572597': { keys: { 1: '4/four' } },   // Early Learning Childcare: "I'll put four down"
  '606552698a6f326944572599': { fn: d => { d.title = 'Dolphin Conservation Trust'; } },
  '60655c6a8a6f32694457259b': { text: [['what’s where the doctor’s', 'that’s where the doctor’s']] },   // Theatre Studies Course
  // DOL's "character"/"ambitions" are not in the recording but ARE the book's alternatives (ieltstrainingonline key 2026-11-27:
  // "personality / character", "aspirations / ambitions") — kept, like the other official variants
  '60655f748a6f32694457259c': { keys: { 32: 'personality/character', 35: 'aspirations/ambitions' }, fn: d => { d.title = 'Self-Regulatory Focus Theory and Leadership'; }, text: [['a person’ focus', 'a person’s focus']] },
  // ── Cambridge 11 ──
  // Hiring A Public Room: "£" after the blank and the "(" before Q3 lost; transcript typos
  '6066a3888a6f3269445725ad': {
    text: [
      ['evening: __Q2__ £ + £250 deposit __Q3__ payment', 'evening: £ __Q2__ + £250 deposit (__Q3__ payment'],
      ['paid in cash , we', 'paid in cash, we'], ['isn’t includes is', 'isn’t included is'],
      ['at the back of the room\n', 'at the back of the room.\n'],
    ],
  },
  // ── Cambridge 11 (batch_cam11, 2026-11-26) ──
  '6066cf768a6f3269445725b0': { text: [['did the students to the writing', 'did the students do the writing'], ['And these was another article', 'And there was another article']] },   // Study On Gender In Physics
  // Ocean Biodiversity
  '6066dcf18a6f3269445725b1': { text: [['the remaining hotspots was', 'the remaining hotspot was'], ['This prefers to the catching', 'This refers to the catching']] },
  // Joining Youth Council: "Postal address: __Q2__ 17, Street" (number in the wrong place); spaced variants of postcode/phone
  '6066e6398a6f3269445725b3': {
    keys: { 3: 'PE9 7QT/PE97QT', 10: '07788 136711/07788136711' },
    text: [['Postal address: __Q2__ 17, Street', 'Postal address: 17, __Q2__ Street'], ['to my parent’s address', 'to my parents’ address']],
  },
  '6066f6758a6f3269445725b4': { text: [['I’ll be look after both', 'I’ll be looking after both']] },   // New Staff At Theatre
  '6066fd9a8a6f3269445725b5': { text: [['I had to do in while the tide', 'I had to do it while the tide'], ['at least I’d go the squared paper', 'at least I’d got the squared paper'], ['since they’ve exposed', 'since they’re exposed']] },   // Rocky Bay Field Trip
  '606702c48a6f3269445725b7': { text: [['site of a discussed', 'site of a disused'], ['The side itself was bordered', 'The site itself was bordered'], ['hony-coloured', 'honey-coloured']] },   // The Taylor Concert Hall
  // Free Activities: option "Oxford Marina" (recording + book: Offord), question typos
  '60670c258a6f3269445725b9': {
    text: [['Oxford Marina', 'Offord Marina'], ['event is the art gallery begins', 'event at the art gallery begins'], ['Paxton is a good for seeing', 'Paxton is a good place for seeing'],
      ['all year around', 'all year round'], ['This is Burnham tourist, Martin', 'Burnham Tourist Office, Martin']],
  },
  '606a8b00db66f95dd0c50f66': { text: [['Turning how to medical', 'Turning now to medical'], ['car parks. some people', 'car parks. Some people'], ['continue be the case', 'continue to be the case'], ['safer to pedestrians', 'safer for pedestrians']] },   // Changes In Barford
  // Ethnography In Business
  '606a9befdb66f95dd0c50f69': { text: [['The participants must fee __Q38__', 'The participants must feel __Q38__'], ['their own home of workplace', 'their own home or workplace']] },
  // Festival Activities: empty first table column dropped; "Ticket available for £15" is the printed example
  '606ace6cdb66f95dd0c50f6c': {
    fn: d => {
      const t = groupOf(d, 1).tableConfig;
      if (t.headers[0] === '' && t.rows.every(r => r[0] === '')) { t.headers.shift(); t.rows.forEach(r => r.shift()); }
      t.rows = t.rows.map(r => r.map(c => c.replace('__Q4__ Held at', '__Q4__ held at')));
    },
    text: [['but only £15. The £12 seats', 'but only at £15. The £12 seats'], ['on holiday on the area', 'on holiday in the area']],
  },
  '606ad85cdb66f95dd0c50f6e': { text: [['the door on the restaurant facing you', 'the door of the restaurant facing you'], ['you and your body will find', 'you and your baby will find'], ['porcelain and glass we left', 'porcelain and glass was left']] },   // Newly Reopened Museum
  '606ae2eadb66f95dd0c50f70': { text: [['wasn’t specifically look for', 'wasn’t specifically looking for'], ['it’s only be possible', 'it’d only be possible'], ['those expectation of one another', 'those expectations of one another']] },   // Research On Female Musical Performers
  // Soil & CO2 (DOL key variants = the book's official alternatives, keep them)
  '606aea5ddb66f95dd0c50f73': {
    text: [['Ohio Stage University', 'Ohio State University'], ['carbon based substance such as', 'carbon-based substances such as'], ['other carbon-based substance.', 'other carbon-based substances.']],
  },
  // ── Cambridge 12 (batch_cam12) ──
  '606d7229db66f95dd0c50f85': { text: [['about Hele Tungate', 'about Helen Tungate'], ['which is in Part Street', 'which is in Park Street']] },   // Events During Kenton Festival
  '606d7465db66f95dd0c50f86': { text: [['performed inside historic building', 'performed inside a historic building']] },   // Theatre Trip To Munich
  // Scandinavian Studies: from "So then should I work out an outline?" the speaker labels are swapped
  '606d7990db66f95dd0c50f87': {
    text: [['an in depth analysis of a single write', 'an in-depth analysis of a single writer']],
    fn: d => {
      const a = 'Beth:\nSo then should I work out an outline?', i = d.transcript.indexOf(a);
      if (i >= 0) d.transcript = d.transcript.slice(0, i) + d.transcript.slice(i).replace(/^(James|Beth):$/gm, m => m === 'James:' ? 'Beth:' : 'James:');
    },
  },
  '606d7a7fdb66f95dd0c50f88': { text: [['when uncertainly about who', 'when uncertainty about who']] },   // Conflict At Work
  // Public Libraries: the book also accepts "travelling"
  '606d7effdb66f95dd0c50f89': { keys: { 1: 'travel/travelling/traveling' }, text: [['but I’ll took out for the book', 'but I’ll look out for the book']] },
  '606d83aedb66f95dd0c50f8b': { text: [['look at home of the more specialised', 'look at some of the more specialised'], ['Personal designed programme', 'Personally designed programme']] },   // BC Travel Agency
  // Tourism Case Study: flow-chart lines run together; transcript typos
  '606d8545db66f95dd0c50f8c': {
    text: [['and also __Q21__ identify a problem or need <br>', 'and also __Q21__ <br>- Identify a problem or need <br>'], ['carry out interview. If possible collect', 'carry out interviews. If possible, collect'],
      ['- Give some background writing the main sections.', '- Give some background before writing the main sections.'], ['opportunities for skilled worker', 'opportunities for skilled workers'],
      ['And presumable some of', 'And presumably some of'], ['rather can concentrating', 'rather than concentrating'], ['It’s be good to know', 'It’d be good to know']],
  },
  // Environmental change & birds
  '606d8787db66f95dd0c50f8d': { text: [['other important implication for humans', 'other important implications for humans']] },
  '606afbcadb66f95dd0c50f74': { text: [['It’s just be the cruise ship terminal', 'It’s just by the cruise ship terminal'], ['so that’s $214 dollars altogether', 'so that’s $214 altogether']] },   // Family Excursions
  '606b0129db66f95dd0c50f76': { text: [['or there could be problems late.', 'or there could be problems later.']] },   // Talk To New Kitchen Assistants
  '606d6f03db66f95dd0c50f83': { text: [['in the context refers to', 'in this context refers to']] },   // Four Business Values
  '606d9047db66f95dd0c50f8f': { text: [['in the sheepmarket area', 'in the Sheepmarket area'], ['side streets in the sheepmarket', 'side streets in the Sheepmarket'], ['The Thumb’s is just what', 'The Thumb is just what']] },   // Visiting Sheepmarket Area
  '606da1e9db66f95dd0c50f92': {},   // Noise In Cities
  // ── Cambridge 13 (batch_cam13) ──
  '606e8687db66f95dd0c50f9a': { text: [['speed about __Q4__ kilometres.', 'speed about __Q4__ kilometres per hour'], ['You shouldn’t use if while you’re cycling, buy have it', 'You shouldn’t use it while you’re cycling, but have it']] },   // South City Cycling Club
  '606eae00db66f95dd0c50f9d': {   // Company Volunteering Project
    text: [['Where will the Digital inclusion Day', 'Where will the Digital Inclusion Day'], ['Up until now, we’re mainly focused', 'Up until now, we’ve mainly focused'], ['continue without reading projects', 'continue with our reading projects'],
      ['But we’re also agreed', 'But we’ve also agreed'], ['though some where younger', 'though some were younger'], ['tended to be outdated model', 'tended to be outdated models.']],
  },
  '606eb805db66f95dd0c50f9f': { text: [['eyes contact', 'eye contact'], ['good to includes slides', 'good to include slides'], ['due to give it in next week', 'due to give it next week']] },   // Planning a presentation on nanotechnology
  '606eb8dadb66f95dd0c50fa0': { text: [['remember where you at, who', 'remember where you ate, who'], ['examples of sematic memory', 'examples of semantic memory'], ['computer- assisted', 'computer-assisted']] },   // Episodic Memory
  '606ec5bcdb66f95dd0c50fa2': {   // Moving To Banford City
    keys: { 10: 'cafe/café' },
    text: [['Average rent: __Q1__ £ a month', 'Average rent: £ __Q1__ a month'], ['No. That sound alright.', 'No. That sounds alright.'], ['which train your catching', 'which train you’re catching']],
  },
  '606ed3dbdb66f95dd0c50fa3': {   // Physical Activities
    text: [['that anyone can run even if you could only run a few meters', 'that anyone can do, even if you can only run a few metres'], ['don’t join a gym and you’re sure', 'don’t join a gym unless you’re sure'], ['advise writing goes down', 'advise writing goals down']],
  },
  '606ee3e7db66f95dd0c50fa5': {   // Natural Dyes: item "Lowood" = logwood
    text: [['works well for dying cotton', 'works well for dyeing cotton']],
    fn: d => { d.questionGroups.forEach(g => g.questions.forEach(q => { if (q.questionText === 'Lowood') q.questionText = 'Logwood'; })); },
  },
  '606da9b8db66f95dd0c50f94': {   // Cookery Class: empty first table column
    fn: d => { const t = groupOf(d, 1).tableConfig; if (t.headers[0] === '' && t.rows.every(r => r[0] === '')) { t.headers.shift(); t.rows.forEach(r => r.shift()); } },
  },
  '606e7ebfdb66f95dd0c50f97': {   // Seed Germination
    text: [['that Grave’s book on seed germination', 'that Graves’s book on seed germination']],
    fn: d => { groupOf(d, 26).instruction = 'Complete the flow-chart below.\nChoose FIVE answers from the box and drag them into gaps 26–30.'; },
  },
  // Alex's Training
  '606fea48a8558941e71e4f0c': { text: [['younger than me, how was 17', 'younger than me, who was 17'], ['Buy you get the same number', 'But you get the same number']] },
  '60700ac2a8558941e71e4f0e': { text: [['Alice says that before doing this project.', 'Alice says that before doing this project,'], ['used by food manufactures was', 'used by food manufacturers was']] },   // Nutritional Information On Food Packaging
  '60700befa8558941e71e4f0f': { text: [['independence from Britain in 1766', 'independence from Britain in 1776']] },   // The History Of Coffee
  // ── Cambridge 14 (batch_cam14) ──
  // Total Health Clinic: from "Now Julie, let's look…" the speaker labels are swapped; spaced phone variant
  '6074e88fa8558941e71e4f1f': {
    keys: { 1: '219 442 9785/2194429785', 6: '3 weeks/three weeks' },
    text: [['goes __Q8__ Regularly', 'goes __Q8__ regularly'], ['treated it in anyway?', 'treated it in any way?']],
    fn: d => {
      const a = 'Julie:\nNow Julie, let’s look', i = d.transcript.indexOf(a);
      if (i >= 0) d.transcript = d.transcript.slice(0, i) + d.transcript.slice(i).replace(/^(Julie|Carl):$/gm, m => m === 'Julie:' ? 'Carl:' : 'Julie:');
    },
  },
  '6074f17ba8558941e71e4f20': { text: [['repairs were carried out to the quest rooms', 'repairs were carried out to the guest rooms']] },   // Visit To Branley Castle
  // Woolly Mammoths: "The discovery of the mammoth tooth…" is Rosie's line (Martin answers "Great idea")
  '6075030da8558941e71e4f21': { text: [['in their natural habit', 'in their natural habitat'], ['You’re right.\nThe discovery of the mammoth tooth', 'You’re right.\nRosie:\nThe discovery of the mammoth tooth']] },
  '60764e18c4117c2f97a49d1d': { keys: { 4: 'wifi/wi-fi' }, text: [['So what do you change for a room?', 'So what do you charge for a room?'], ['T-E-S-L-A. it holds', 'T-E-S-L-A. It holds']] },   // Flanders Conference Hotel
  '60e2834dfbd81c3fcad12f2b': { text: [['He’d be much better of playing', 'He’d be much better off playing']] },   // Background on school marching band
  '60702f1ca8558941e71e4f14': {   // Crime Report Form
    keys: { 10: '87954 82361/8795482361' },
    text: [['asking us that time it was', 'asking us what time it was'], ['Fifteen.\nRight.\nOfficer:\nNow,', 'Fifteen.\nOfficer:\nRight.\nNow,'], ['Complete the form below..', 'Complete the form below.']],
  },
  '60703b3da8558941e71e4f19': { text: [['There were not enough for them.', 'There were not enough of them.'], ['in the 1950s they build channels', 'in the 1950s they built channels'], ['Yes, We could use that', 'Yes, we could use that']] },   // Cities Built By The Sea
  '60703c7ea8558941e71e4f1a': { text: [['may ham fish and birds', 'may harm fish and birds'], ['would create than 2,000 jobs', 'would create more than 2,000 jobs']] },   // Marine Renewable Energy
  '60e29220fbd81c3fcad12f32': {   // Trevor and Stephanie
    text: [['popularity reflects good qualify', 'popularity reflects good quality'], ['I know can’t compete', 'I know I can’t compete'], ['I just think its sad', 'I just think it’s sad'],
      ['written before, there were the first', 'written before, they were the first'], ['– there long books', '– they’re long books'], ['the First Word War', 'the First World War']],
  },
  '60e2948cfbd81c3fcad12f33': { text: [['AUVs can share date using light', 'AUVs can share data using light']] },   // Sunken settlements & shipwrecks
  // University Orientation Program: DOL's instruction for the diagram is a leftover from another type
  '6059bd18511ef10dfd387cf5': {
    fn: d => {
      groupOf(d, 21).instruction = 'Complete the timetable below.\nChoose FOUR answers from the box.';
      groupOf(d, 25).instruction = 'Label the diagram below.\nWrite ONE WORD AND/OR A NUMBER for each answer.';
    },
  },
};
