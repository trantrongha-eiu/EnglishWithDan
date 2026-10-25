// Vol 7 full Reading tests: test number (= Reading/Test 1-10/Test N.pdf, Reading/Test 11-16/Test N.pdf) → its 3 passages,
// as a draft name (new passage, see ../../web/vol7/imported.json) or a bank passage _id (reused as-is). Reuse checked
// 2026-10-25 (dedupe2.js / dedupe_mini.js 6-gram on the PDF text layer, then showbank.js per item): same text, same questions.
// T8 P3 = "The fluoridation controversy" (Vol 4 - Test 3; the PDF's sentence ending B is garbled, the bank's is right; keys match).
// T16 P2 = "Bird Migration" (Actual Mocktest 56; Vol key Q19 iii, bank i "The best moment to migrate" — paragraph F is about
// setting off at the right time → bank kept).
module.exports = {
  1: ['t1p1', 't1p2', 't1p3'],                         // Carnivorous Plants / Drawing Lessons from History / Neanderthal Technology
  2: ['t2p1', 't2p2', 't2p3'],                         // The early history of olive oil / Playing with science / Does Class Size Matter?
  3: ['t3p1', 't3p2', 't3p3'],                         // The development of plastics / Lean Production / How Does Watching Sport Influence the Brain?
  4: ['t4p1', 't4p2', 't4p3'],                         // Rubber / The Myth of the Eight-hour Sleep / Living dunes
  5: ['t5p1', 't5p2', 't5p3'],                         // Reef fish study / Will Eating Less Make You Live Longer? / Saving the Skink
  6: ['t6p1', 't6p2', 't6p3'],                         // Deep sea discovery / Jellyfish – The Dominant Species / The Pirahã people of Brazil
  7: ['t7p1', 't7p2', 't7p3'],                         // The history of the guitar (Vol 7) / Playing soccer / The History of Chocolate
  8: ['t8p1', 't8p2', '6adc40e45cf66bdff87cfb41'],     // Dust and the American West / Urban Regeneration / The fluoridation controversy
  9: ['t9p1', 't9p2', 't9p3'],                         // Dolls through the ages / Biophilic Design / Biology of Bitterness
  10: ['t10p1', 't10p2', 't10p3'],                     // Wood: … New Zealand's economy / Intelligent behaviour in birds / Jean Piaget
  11: ['t11p1', 't11p2', 't11p3'],                     // Chilli Peppers / Stress Less / Robert Louis Stevenson
  12: ['t12p1', 't12p2', 't12p3'],                     // Tulip Mania / Roller coaster / Tasmania's Museum of Old and New Art
  13: ['t13p1', 't13p2', 't13p3'],                     // The history of the bar code / Goya's portraits / Memory Champions
  14: ['t14p1', 't14p2', 't14p3'],                     // The Oldest Leather Shoe / Pantomime / The tuatara – past and future
  15: ['t15p1', 't15p2', 't15p3'],                     // Katsushika Hokusai / Should we stop eating meat? / Travelling Plants
  16: ['t16p1', '6abdee1854216aa2da157a5b', 't16p3'],  // Charles Heaphy … New Zealand / Bird Migration / Look – who was talking
};
