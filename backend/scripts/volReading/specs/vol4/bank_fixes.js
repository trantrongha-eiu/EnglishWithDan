// Bank passages corrected while checking Vol 4 Reading against its PDFs and explain files (2026-10-24).
// Applied with `node bank_fix.js 4 --apply`.
const q = (d, n) => d.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === n);
module.exports = [
  { id: '6abcc048db792dd76cd763c1', why: 'The dingo debate: Q25 ("…when there are fewer ___", TWO WORDS) also accepts "rabbit numbers" — the Vol 4 explain key\'s answer, the exact words of the passage ("rabbit numbers are significantly reduced")',
    fix: d => {
      const x = q(d, 25);
      x.correctAnswer = 'rabbits / rabbit numbers';
      x.explanation = x.explanation.replace(/→ rabbits$/, '(Viết “rabbit numbers” – đúng cụm trong bài – cũng được chấm đúng.) → rabbits');
    } },
];
