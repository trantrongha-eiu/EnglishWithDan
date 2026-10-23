// Vol 2 full Reading tests: test number → its 3 passages, as a draft name (new passage, see ../../web/vol2/imported.json)
// or a bank passage _id (reused as-is). Vol 2 Reading is not split by test folders: reading/*.pdf = 9 three-passage files
// + 2 single passages (book review = P1, whale culture = P3; no P2 → no full test, both already in the bank).
// Numbering: the number in the file name where there is one (Test 1, AC2, Test 3, AR4, AC5, AC6, AC7); "AC3" (clashes with
// "Test 3") → 8, "AC_" → 9. Reuse checked 2026-10-23 (dedupe2.js 6-gram + qcheck.js per item + page images): same text, same
// questions (Vol prints YES/NO for "Footprints" Q1–6 where the bank has TRUE/FALSE — same statements and answers).
module.exports = {
  1: ['t1p1', '6abdb3e33da7a4e8d035c6cd', 't1p3'],                                             // Iceman (Vol 2) / Twin Study / origin of ancient writing
  2: ['6a55c892d2439c8edfc649bb', '6a55cdcfd2439c8edfc64fb2', '6a55cfe9d2439c8edfc656b9'],     // AC2: Bondi / economic effect of climate / verbal and non-verbal
  3: ['6abdad023bcd15105e99fc00', '6abdacfa3bcd15105e99fb71', 't3p3'],                         // Becoming an Expert / Revolutions in Mapping / Ronalds
  4: ['6a5528ea7451993d82bd0e91', '6a55314a7451993d82bd17f5', '6a5535717451993d82bd21c8'],     // AR4: study history / Violins / companies survive
  5: ['6a6f4fa183f0561ecc0d95ed', '6a6f4fa183f0561ecc0d95fd', '6a6f4fa183f0561ecc0d960e'],     // AC5: Footprints / Tomato / Crossing the Threshold
  6: ['6a6f50cf839b40f4e501ec3f', '6a553ece7451993d82bd2d0f', '6a5541f57451993d82bd3312'],     // AC6: Jewels (Mocktest 29) / monkey life / Innovation
  7: ['6a6f4f104b80c822c59a645e', '6a6f4f104b80c822c59a646e', '6a6f4f104b80c822c59a647f'],     // AC7: Lucy / gender gap NZ / strange world of sight
  8: ['6a5509187451993d82bcc7cc', '6a550c3e7451993d82bcd14b', '6a5510407451993d82bcdb0d'],     // AC3: Gold Nuggets / Nature's Useful Designs / art of deception
  9: ['6a54d90a7451993d82bc7544', '6a54e0977451993d82bc7ce9', '6a54e9de7451993d82bc8d16'],     // AC_: Sweet Trouble / 2003 Heatwave / Patient Safety
};
