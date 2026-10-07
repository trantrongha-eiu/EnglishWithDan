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
  // DOL also accepts "character"/"ambitions" — neither word is in the recording (Cambridge key: personality, aspirations)
  '60655f748a6f32694457259c': { keys: { 32: 'personality', 35: 'aspirations' }, fn: d => { d.title = 'Self-Regulatory Focus Theory and Leadership'; }, text: [['a person’ focus', 'a person’s focus']] },
  // ── Cambridge 11 ──
  // Hiring A Public Room: "£" after the blank and the "(" before Q3 lost; transcript typos
  '6066a3888a6f3269445725ad': {
    text: [
      ['evening: __Q2__ £ + £250 deposit __Q3__ payment', 'evening: £ __Q2__ + £250 deposit (__Q3__ payment'],
      ['paid in cash , we', 'paid in cash, we'], ['isn’t includes is', 'isn’t included is'],
      ['at the back of the room\n', 'at the back of the room.\n'],
    ],
  },
  // University Orientation Program: DOL's instruction for the diagram is a leftover from another type
  '6059bd18511ef10dfd387cf5': {
    fn: d => {
      groupOf(d, 21).instruction = 'Complete the timetable below.\nChoose FOUR answers from the box.';
      groupOf(d, 25).instruction = 'Label the diagram below.\nWrite ONE WORD AND/OR A NUMBER for each answer.';
    },
  },
};
