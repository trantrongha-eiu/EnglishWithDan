// Vol 8 full Reading tests: test number (= READING/Test N.pdf, "Tets 11.pdf" = Test 11) → its 3 passages, as a draft name
// (new passage, see ../../web/vol8/imported.json) or a bank passage _id (reused as-is). Reuse checked 2026-10-29
// (dedupe2.js / dedupe_mini.js 6-gram on the PDF text layer, then showbank.js per item).
// T5 P1 / T7 P1 = renumbered copies (t5p1 / t7p1) of the bank's Passage 2 "Western Immigration of Canada" and "William Gilbert
// and Magnetism" (same questions and keys). T9 P1 = "Ahead of its time" (Actual Mocktest 58; its Q10 key fixed 296 → race,
// specs/vol8/bank_fixes.js).
module.exports = {
  1: ['t1p1', 't1p2', 't1p3'],                         // Steam across the water / IQ Scores / Practical Learning in the Classroom
  2: ['t2p1', 't2p2', 't2p3'],                         // Australia's cane toad problem / Farmers / Life on Mars?
  3: ['t3p1', 't3p2', 't3p3'],                         // The History of the Chicken / introvert and extrovert / Seeing the colour of sounds
  4: ['t4p1', 't4p2', 't4p3'],                         // The Pixar Story / A mechanical friend for children / The peopling of Patagonia
  5: ['t5p1', 't5p2', 't5p3'],                         // Western Immigration of Canada (Vol 8) / Why don't we sleep? / Understanding symbols
  6: ['t6p1', 't6p2', 't6p3'],                         // Optimism and Health / New Technology in NZ's Health Service / Game theory
  7: ['t7p1', 't7p2', 't7p3'],                         // William Gilbert and Magnetism (Vol 8) / Multi-tasking and the brain / learning an instrument
  8: ['t8p1', 't8p2', 't8p3'],                         // Jethro Tull / The internal body clock / The origin of language
  9: ['6a6f4d6c9767a2b2f3332bdd', 't9p2', 't9p3'],     // Ahead of its time / Removing unwanted noise / An enterprise education programme in HK
  10: ['t10p1', 't10p2', 't10p3'],                     // The Whale Goes to Court / Herbal Medicine / Science in the kitchen
  11: ['t11p1', 't11p2', 't11p3'],                     // The Origins of Weather Forecasting / icebergs to ocean life / The Dunedin study
  12: ['t12p1', 't12p2', 't12p3'],                     // Candles / assessment of carbon footprints / The Science of Shopping
};
