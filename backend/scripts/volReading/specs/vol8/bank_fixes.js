// Bank passages corrected while checking Vol 8 Reading against its PDFs and Key.pdf (2026-10-29).
// Applied with `node bank_fix.js 8 --apply`.
const q = (d, n) => d.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === n);
module.exports = [
  { id: '6a6f4d6c9767a2b2f3332bdd', why: 'Ahead of its time (Actual Mocktest 58 = Vol 8 Test 9 P1): the notes printed "Ruamahanga skull surprising because of its – Age – (10)___ – Gender" were merged into "Age - __Q10__" with key "296" (lower-confidence guess); the PDF and Vol 8 Key.pdf give three items and Q10 = race ("how a skull of this race, let alone this gender")',
    fix: d => {
      const g = d.questionGroups.find(x => x.noteConfig && x.questions.some(y => y.questionNumber === 10));
      g.noteConfig.lines = g.noteConfig.lines.flatMap(l => /Age - __Q10__/.test(l) ? [l.replace(' - __Q10__', ''), l.replace(/Age - /, '')] : [l]);
      const x = q(d, 10);
      x.correctAnswer = 'race';
      x.explanation = 'Dịch: Hộp sọ Ruamahanga gây bất ngờ vì: tuổi – ______ – giới tính\n\nVị trí: Đoạn 6\n\nTrích: “The fascinating question, however, was how a skull of this race, let alone this gender, had reached these remote islands in the South Pacific at such a time”\n\nPhân tích: Ba điều gây bất ngờ: tuổi (“at such a time” – khoảng 300 năm trước), chủng tộc (“this race” – người châu Âu) và giới tính (“this gender” – nữ). Ô trống nằm giữa Age và Gender → race';
    } },
  // William Gilbert and Magnetism — the "pick 1 of 3" explanation ended with text after "→ C" (vr_audit wants the answer last).
  // Fixed in the bank passage (Q24) and its Vol 8 renumbered copy (Q11).
  ...[['6abdb3f23da7a4e8d035c7e2', 24], ['6ae34c00dab7592186012903', 11]].map(([id, n]) => ({ id,
    why: `William Gilbert and Magnetism Q${n}: explanation rewritten so it ends "→ C" (was "→ C (Metals can be magnetised). B chỉ là mê tín…")`,
    fix: d => {
      const x = q(d, n);
      x.explanation = x.explanation.replace(/Phân tích: → C \(Metals can be magnetised\)\. B chỉ là mê tín thời đó; F là phát hiện của du Fay$/,
        'Phân tích: Gilbert phát hiện kim loại có thể bị từ hóa khi chà xát (B chỉ là mê tín thời đó; F là phát hiện của du Fay) → C');
    } })),
  // Western Immigration of Canada — stray closing quote after "…exceeded that of arrivals." (the quotation ends at "station”").
  ...['6abcde40ee81e7573b2fe8a2', '6ae34bfcdab759218601287c'].map(id => ({ id,
    why: 'Western Immigration of Canada: stray ” after "exceeded that of arrivals."',
    fix: d => { d.content = d.content.replace('exceeded that of arrivals.”', 'exceeded that of arrivals.'); } })),
];
