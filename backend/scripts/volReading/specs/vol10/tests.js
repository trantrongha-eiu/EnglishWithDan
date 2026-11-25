// Vol 10 full Reading tests (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test N Reading", Test 1–5 published by 2026-11-04;
// Test 6–8 not yet online). Dedupe 2026-11-04 (6-gram text + questions + keys vs the whole bank):
//  reused as they are: The history of glass (Mocktest 62), Save Endangered Language (Mocktest 38), The tuatara – past and future
//  (Vol 7 - Test 14; Vol 10 prints another word list for Q36–40, kept the bank's set as in Vol 1 "A New Voyage").
//  copies: t4p1 = renumbered "Origin of Species and Continent Formation" (bank P2), t2p2 = "Yawning" renumbered 14–26 minus the
//  question Vol 10 drops. All other passages are new.
module.exports = {
  1: ['6abd01b21b50c9b87212e5b2', 't1p2', '6abdb3eb3da7a4e8d035c723'], // The history of glass / black-footed ferret / Save Endangered Language
  2: ['t2p1', 't2p2', 't2p3'], // Sleep Study on Modern-Day Hunter-Gatherers / Yawning (Vol 10) / Rights for Apes
  3: ['t3p1', 't3p2', 't3p3'], // Tunnelling under the Thames / Solving the problem of waste disposal / The Antikythera Mechanism
  4: ['t4p1', 't4p2', 't4p3'], // Origin of Species and Continent Formation (Vol 10) / How do plants talk to each other? / Termite Mounds
  5: ['t5p1', 't5p2', '6add66536d9bcb8db19ee452'], // Australia's cane toad problem (Vol 10) / Learning from the Romans / The tuatara
  // Test 6–10 (izone published them by 2026-11-25; dedupe10b.js): reused as is = Introduction to a book about the assessment of
  // carbon footprints (Vol 8 - T12) and Practical Learning in the Classroom (Vol 8 - T1; izone Q30 D / Q33 F rejected, bank key
  // B / design kept); copies t6p1 Spider Silk (bank 14–26) and t7p2 The moto car (bank 27–40) renumbered.
  6: ['t6p1', '6ae34c06dab7592186012a49', 't6p3'], // Spider Silk (Vol 10) / carbon footprints / Risk Taking
  7: ['t7p1', 't7p2', 't7p3'], // The Pearl / The moto car (Vol 10) Q14–27 / Elephant Communication Q28–40
  8: ['t8p1', 't8p2', 't8p3'], // Education Philosophy / How deserts are formed / The Olympic Torch
  9: ['t9p1', 't9p2', '6ae34bfbdab75921860127b7'], // Songs of Stones / Internal Promotion or External Hiring / Practical Learning
  10: ['t10p1', 't10p2', 't10p3'], // History of Refrigeration Q1–14 / Ancient People in Sahara Q15–27 / Texting the Television
};
