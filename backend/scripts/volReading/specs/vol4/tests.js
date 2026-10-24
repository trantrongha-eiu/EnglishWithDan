// Vol 4 full Reading tests: test number (= reading/test N/) → its 3 passages, as a draft name (new passage, see
// ../../web/vol4/imported.json) or a bank passage _id (reused as-is). Reuse checked 2026-10-24 (dedupe2.js / dedupe_mini.js
// 6-gram, qcheck.js per item, explain keys + page images): same text, same questions.
// T7 = exactly Vol 3 - Test 9 (food desert / dingo debate / Pacific navigation; PDF p4 holds the P3 Q27–31 page in place of
// P1's, P1 Q6 printed "supermarket ___" as in Vol 3; Vol key Q25 "rabbit numbers" → bank now accepts it, bank_fixes.js).
// T8 P1 = "Traditional Maori medicines" (Actual Mocktest 65), keys match. T10 = exactly Vol 3 - Test 10 (keys match).
// T9 has 37 questions: the PDF has no Questions 27–29 (P3 starts at 30).
module.exports = {
  1: ['t1p1', 't1p2', 't1p3'],                                                               // When Maps were Made for the Public / Preserving Antarctic History / Flower Power
  2: ['t2p1', 't2p2', 't2p3'],                                                               // The last man who knew everything / The fashion industry / prehistoric predator
  3: ['t3p1', 't3p2', 't3p3'],                                                               // Advertising needs attention / Growing more for less / fluoridation controversy
  4: ['t4p1', 't4p2', 't4p3'],                                                               // Multiple intelligences / A unique golden textile / The power of persuasion
  5: ['t5p1', 't5p2', 't5p3'],                                                               // Classifying societies / Corporate Social Responsibility / Amateur Naturalists
  6: ['t6p1', 't6p2', 't6p3'],                                                               // Building a castle / western celebrity / headphones
  // 7: = Vol 3 - Test 9 ['6abcc04bdb792dd76cd763e2', '6abcc048db792dd76cd763c1', '6abcc047db792dd76cd763a9'] — not created (thầy 2026-10-24)
  8: ['6abcc04ddb792dd76cd76414', 't8p2', 't8p3'],                                           // Traditional Maori medicines / Classical music / Mapping the Mind
  9: ['t9p1', 't9p2', 't9p3'],                                                               // Pepper / The horseshoe crab / Temperament
  // 10: = Vol 3 - Test 10 ['6adb792bc1591fd3f6d8c34b', '6adb792bc1591fd3f6d8c35b', '6adb792bc1591fd3f6d8c36d'] — not created (thầy 2026-10-24)
};
