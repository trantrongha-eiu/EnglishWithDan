'use strict';

// Sentence-role specs for the 22 pre-existing "Bài mẫu từ Daniel" essays
// (written before the colour-coded highlights existed) that already follow
// the band 7+ shape — the 54 older ones were rewritten in
// task2DanielRewrites.js, which carries its own roles. Keyed by
// WritingTask2 _id → [introSpec, body1Spec, body2Spec, conclusionSpec].
//
// Spec tokens index sentences as split by splitSentences() in
// task2SampleHighlights.js; "S2-3" = a range.
//   Introduction:  H = hook (lead-in + paraphrase), P = thesis statement
//   Body:          T = topic sentence, I = idea 1, S = supporting 1,
//                  J = idea 2, U = supporting 2
//   Conclusion:    R = restatement, F = final statement
// Every sentence carries a role. Roles were assigned by reading each
// paragraph — bodies with a single developed point simply have no idea 2;
// a body's closing evaluation line counts as support for the idea before it.

module.exports = {
  '69ccec5d84749e2f69dfb2a4': ['H0-1 P2', 'T0 I1 S2-3 J4', 'T0 I1 S2-4', 'R0-1 F2'],
  '69ccec6b84749e2f69dfb2a9': ['H0-1 P2', 'T0 I1 S2-3 J4 U5', 'T0 I1 S2-4', 'R0-1 F2'],
  '69ccec7d84749e2f69dfb2ae': ['H0-1 P2', 'T0 I1 S2-3', 'T0 I1 S2', 'R0 F1'],
  '69ccec8684749e2f69dfb2b3': ['H0-1 P2', 'T0 I1 S2-3', 'T0 I1 J2 U3', 'R0 F1'],
  '69ccec9b84749e2f69dfb2b8': ['H0-1 P2', 'T0-1 I2 S3-4 J5', 'T0-1 I2 S3 J4 U5-6', 'R0-1 F2'],
  '69cceca384749e2f69dfb2bd': ['H0-1 P2', 'T0-1 I2 S3-4 J5', 'T0-1 I2 S3 J4 U5-6', 'R0-1 F2'],
  '69ccecb184749e2f69dfb2c2': ['H0-1 P2', 'T0 I1 S2-3', 'T0 I1 S2', 'R0 F1'],
  '69ccecd384749e2f69dfb2c7': ['H0-1 P2', 'T0 I1 S2-3', 'T0 I1 S2 J3', 'R0 F1'],
  '69ccecee84749e2f69dfb2ce': ['H0-1 P2', 'T0 I1 S2-3', 'T0 I1 S2', 'R0 F1'],
  '69cced3e84749e2f69dfb2dd': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '69cced5184749e2f69dfb2e2': ['H0-1 P2', 'T0-1 I2 S3-4 J5', 'T0-1 I2 S3 J4 U5-6', 'R0-1 F2'],
  '69e86945d4a26e0e1ef31203': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '69ead86e12d21842dfb92fc5': ['H0-1 P2', 'T0-1 I2 S3-4 J5', 'T0-1 I2 S3 J4 U5-6', 'R0-1 F2'],
  '69ead8d512d21842dfb93022': ['H0-1 P2', 'T0 I1 S2-3 J4 U5', 'T0 I1 S2-4', 'R0-1 F2'],
  '69fcb790e5b68c3982dd5184': ['H0-2 P3', 'T0 I1 S2-3 J4 U5-6', 'T0 I1 S2 J3 U4', 'R0 F1-2'],
  '6a0be7cc1d7ec40efce5ee00': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '6a3bc26d6e41a07162431dbc': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '6a3d1e42a64d86d76bf66400': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '6a3d1f11a64d86d76bf67104': ['H0-1 P2', 'T0 I1 J2-3 U4', 'T0 I1 J2-3 U4', 'R0-1 F2'],
  '6a4f974247b9bcf279c93af2': ['H0-1 P2', 'T0-1 I2 S3-5 J6 U7-8', 'T0 I1 S2-3 J4 U5-6', 'R0-1 F2'],
  '6a74098166bdb38d66a0c6c8': ['H0-1 P2', 'T0 I1 S2-4 J5 U6-7', 'T0 I1 S2-3 J4 U5-6', 'R0-1 F2'],
  '6a7409db66bdb38d66a0c6ef': ['H0-1 P2', 'T0 I1 J2-3 U4-5', 'T0 I1 J2-3 U4', 'R0-1'],
};
