// Bank passages corrected while checking Vol 2 Reading against its PDFs (2026-10-23). Applied with `node bank_fix.js 2 --apply`.
const q = (d, n) => d.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === n);
module.exports = [
  { id: '6a5522af7451993d82bd046e', why: 'Whale Culture: Q29 text was a copy of Q27 (key YES + explanation already belong to the real Q29); option F typo',
    fix: d => {
      q(d, 29).questionText = 'There is a vocabulary of sounds which is common to all transient killer whales.';
      for (const n of [35, 36, 37]) q(d, n).options = q(d, n).options.map(o => o === 'adaptibility to variety of food' ? 'adaptability to a variety of foods' : o);
    } },
  { id: '6a553b6e7451993d82bd2881', why: 'Jewels from the Sea (Mocktest 33): Q5 key TRUE contradicts the passage and its own explanation ("would not have risked getting snagged by long necklaces") → FALSE, as the Mocktest 29 copy',
    fix: d => { q(d, 5).correctAnswer = 'FALSE'; } },
  { id: '6a55cfe9d2439c8edfc656b9', why: 'A closer examination…: trailing space in title; Q38 option typos',
    fix: d => {
      d.title = d.title.trim();
      q(d, 38).options = q(d, 38).options.map(o => o.replace('effciently', 'efficiently').replace('commucation', 'communication'));
    } },
  { id: '6a55c892d2439c8edfc649bb', why: 'Bondi: trailing space in title', fix: d => { d.title = d.title.trim(); } },
  { id: '6a550c3e7451993d82bcd14b', why: "Nature's Useful Designs: title OCR'd as \"Nature's use Full designs\"", fix: d => { d.title = "Nature's Useful Designs"; } },
];
