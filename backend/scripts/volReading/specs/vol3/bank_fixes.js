// Bank passages corrected while checking Vol 3 Reading against its PDFs and explain files (2026-10-23).
// Applied with `node bank_fix.js 3 --apply`.
const q = (d, n) => d.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === n);
module.exports = [
  { id: '6a6f251c2166582ee11dfc81', why: 'Science and the Stradivarius: Q17 (paragraph E) key vii → viii — E is about the first Italian makers tuning plates to exact musical intervals ("numbers and exact ratios"); "no historical data" is not a re-evaluation of documents. viii is otherwise unused (Vol 3 explain key = viii)',
    fix: d => {
      const x = q(d, 17);
      x.correctAnswer = 'viii';
      x.explanation = 'Paragraph E: the few tests suggest "the first Italian makers may have tuned the resonant modes of the individual plates … to exact musical intervals", consistent with the Renaissance view of perfection "measured in terms of numbers and exact ratios" — the mathematical basis of earlier design. (vii is wrong: the paragraph says there is no historical data, it does not re-evaluate documentary evidence.)';
    } },
];
