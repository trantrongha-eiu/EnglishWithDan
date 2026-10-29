// Vol 1 full Reading tests: test number → its 3 passages, as a draft name (new passage, see ../../web/vol1/imported.json)
// or a bank passage _id (reused as-is). Reuse checked 2026-10-16 (dedupe.js / compare.js / qcheck.js): same text, same
// questions; key differences of the Vol key pages were source errors (see README "Vol 1 — Reading").
module.exports = {
  1: ['69e86e2fd4a26e0e1ef3153f', '69e87393d4a26e0e1ef318bd', '6a6f1ab58da3b2196c8b6930'], // silk / baby mammoth / musical expert
  2: ['69fb5e378ad4568889c8a679', '6a200a404d6edb6db8df5590', '6a6f1b64c269fb5764511c9b'], // Clipper Races / Orientation of birds / accidents in business
  3: ['6a6f227aa6fc2d9546e6df05', '6a6f227ba6fc2d9546e6df15', '6a6f227ba6fc2d9546e6df26'], // language development / TV advertising / A New Voyage
  4: ['6a6f2325a37de57067377841', '6a6f2325a37de57067377851', '6a6f2325a37de57067377862'], // good ideas fail / water away / Megafauna
  5: ['t5p1', '6abdee0454216aa2da1578d1', '6abcd3994bdca60c3b137d0a'],                         // Blue line 2 / Multitasks / Grimm
  6: ['6abcd3974bdca60c3b137cfa', 't6p2', 't6p3'],                                             // history of tea / Biodiversity (Vol 1) / NatureWorks
  // T7 rebuilt 2026-10-29 from the updated PDF (Vol 7 folder 'các đề update web khác trên bản pdf') with vr_retest.js — was
  // turtles / Thoughtful Computing / Irish Elk (Q28–40, no Q27 anywhere). Pepper = bank (Vol 4 - Test 9 P1), P3 = specs/vol1u.
  7: ['6adc40e55cf66bdff87cfc55', 't7p2', '6ae3573aa25cc04eacf81f63'],                         // Pepper / Thoughtful Computing / Thinking Small
  8: ['t8p1', 't8p2', 't8p3'],                                                                 // Brief History of Tea / New filter / Linguistic Change
  9: ['6abd18a7766cfd5ee7885d0c', '6a6f4d6c9767a2b2f3332bee', 't9p3'],                         // Tuatara / Tasmanian Tiger / Cane Toad (Q28–40)
  10: ['6abcc4439bd9acaeb9541f59', '6a551a827451993d82bcf0f4', 't10p3'],                       // pesticide-free village / Skyscraper Farming / Marketing
};
