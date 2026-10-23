// Vol 3 full Reading tests: test number (= "TEST N.pdf" / "test N - full.pdf") → its 3 passages, as a draft name (new passage,
// see ../../web/vol3/imported.json) or a bank passage _id (reused as-is). Reuse checked 2026-10-23 (dedupe2.js 6-gram, qcheck.js
// per item, keycmp3.js against the explain files + page images): same text, same questions. Differences kept from the bank:
// T5 P2 Q20–21 options B/C printed in the other order (answers A + D either way); T9 P1 Q6 printed "cannot cope with supermarket
// ___" (key competition) where the bank has "competition from ___ supermarkets" (key suburban). Vol keys that contradict the
// passage (bank kept): T4 P2 Q20, T5 P1 Q1 (bank TRUE), T5 P3 Q39, T8 P2 Q20, T9 P1 Q13, T9 P3 Q35. Bank key fixed from the Vol:
// T7 P2 Q17 (viii). explain/test 8.pdf explains the T7 passage 3 ("tone deaf") instead of "Yawning" → bank key used.
module.exports = {
  1: ['6abcc04adb792dd76cd763d2', 't1p2', 't1p3'],                                           // Fishbourne Roman Palace / Insect decision-making / Fear of the Unknown
  2: ['t2p1', 't2p2', 't2p3'],                                                               // Bovids / Photovoltaics on the rooftop / How should reading be taught?
  3: ['6abcc4439bd9acaeb9541f59', '6ad252dbf0a50d6ef8e338c7', '6abcd3994bdca60c3b137d1c'],   // pesticide-free village / New filter (Vol 1) / hydrogen cars
  4: ['t4p1', '6abd01af1b50c9b87212e591', '6abcd3994bdca60c3b137d37'],                       // The Wonder Plant / Renewable Energy / mind of a fan
  5: ['6a6f23c9d5e1b371f4752b21', '6a6f23c9d5e1b371f4752b31', '6a6f23c9d5e1b371f4752b4b'],   // Caral / space robots or humans / dark side of the technological boom
  6: ['6a6f2467d8db9307733d8b68', '6a6f2468d8db9307733d8b7e', '6a6f2468d8db9307733d8b97'],   // Adolescence / bees and flowering plants / study and teaching of history
  7: ['6a6f251b2166582ee11dfc70', '6a6f251c2166582ee11dfc81', '6a6f4c8db5dfd424fb88d8fc'],   // Answers Underground / Stradivarius / tone deaf
  8: ['6a6f4c8db5dfd424fb88d8db', '6a6f4c8db5dfd424fb88d8eb', '6a6f4d6c9767a2b2f3332bff'],   // Katherine Mansfield / Australian parrots / Yawning
  9: ['6abcc04bdb792dd76cd763e2', '6abcc048db792dd76cd763c1', '6abcc047db792dd76cd763a9'],   // food desert / dingo debate / Pacific navigation
  10: ['t10p1', 't10p2', 't10p3'],                                                           // Humans and Food / need the arts / mother tongue
};
