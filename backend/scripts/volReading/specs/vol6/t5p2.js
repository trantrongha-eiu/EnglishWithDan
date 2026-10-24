// Vol 6 - Read/R-TEST 5.pdf - Reading Passage 2 (PDF p5–8). Not in the bank / mini-ielts. Source article: "Bedtime Stories",
// National Wildlife (NWF) 2007 — used to fix the printed text: "10 to seconds" → 10 to 20 seconds, "tried muscles" → tired,
// "12- or 14 hours lives" → 14-hour, "animas" → animals, "killers whale" → killer whale; paragraph G printed Bingman's
// sentence + "Saper, however, disagree." twice → once ("disagrees"). Text otherwise = Full Reading.docx, checked against the
// PDF. **Q24–26 are missing from the test PDF** (it stops after Q23); the key file Read/expl 5-6.pdf prints them ("Reading
// Passage 2 has 7 paragraphs, A–G. Which paragraph contains…") → added from there. Key = expl 5-6.pdf, checked against the
// passage: Q20 left blank in the key → laboratory rats (paragraph C); Q24 "potential use of chemicals to reduce sleep
// periods" Vol E (E only describes the brain's own chemical signals) → G ("develop techniques or drugs that could recreate a
// similar brain pattern in humans"). Researchers list typed "Jerome Siege", "Clifford Sa" in the docx → full names.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 6, test: 5, part: 2, title: 'Sleep – who needs it?', text: 't5p2.txt',
  groups: [
    matching(14, ['Jerome Siegel', 'Clifford Saper', 'Verner Bingman'], [
      'the physiological mechanism which controls the body\'s sleep patterns',
      'an observation that some creatures may have no need for sleep',
      'data indicating the dangers of extended periods of sleeplessness',
      'an animal behaviour which could serve as a basis for modifying human sleep patterns',
    ], { title: 'List of Researchers', reuse: true,
      instruction: 'Look at the following findings (Questions 14–17) and the list of researchers below. Match each finding with the correct researcher, A, B or C. Write the correct letter, A, B or C, in boxes 14–17 on your answer sheet. NB You may use any letter more than once.' }),
    notes(18, 23, [
      '18. Movement and wakefulness in young orcas assist them in maintaining __Q18__.',
      '19. New orca mothers need to be awake in order to protect their young from __Q19__.',
      '20. Sleep deprivation experiments on __Q20__ have shown that animals die without adequate sleep.',
      '21. Scientists have not yet worked out why almost all animals sleep with __Q21__.',
      '22. For humans, sleep is vital for the efficient functioning of the __Q22__.',
      '23. During periods of __Q23__ Swainson\'s thrushes experience severe sleep deprivation.',
    ], { instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 18–23 on your answer sheet.' }),
    matching(24, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
      'mention of the potential use of chemicals to reduce sleep periods',
      'reference to a lack of expert consensus regarding the behaviour of certain types of animal',
      'an example of an animal which continues to function normally during its sleep periods',
    ], { instruction: 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G, in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'B', 15: 'A', 16: 'B', 17: 'C', 18: 'body temperature', 19: 'sharks', 20: 'laboratory rats / rats',
    21: 'closed eyes', 22: 'brain', 23: 'migration', 24: 'G', 25: 'B', 26: 'D' },
  expl: {
    14: ['Cơ chế sinh lý điều khiển nhịp ngủ của cơ thể.', 'Đoạn E',
      '“Neuroscientist Clifford Saper of the Harvard Medical School has located a small area at the base of the brain called the ventrolateral preoptic nucleus that sends chemical signals to other parts of the brain during sleep to slow those brain parts down and determines the best sleep budget for the animal.”',
      'Một vùng nhỏ ở đáy não (physiological mechanism) quyết định “the best sleep budget” = controls sleep patterns → B'],
    15: ['Nhận xét rằng một số sinh vật có thể không cần ngủ.', 'Đoạn B',
      '“All mammals and birds appear to need sleep, but scientists are unsure if reptiles and fish do. \'When you come downstairs at three in the morning, the goldfish isn\'t lying on the bottom of the bowl, it\'s swimming around,\' Siegel says.”',
      'Siegel quan sát cá vàng vẫn bơi lúc 3 giờ sáng → có thể cá không cần ngủ → A'],
    16: ['Dữ liệu cho thấy sự nguy hiểm của việc thức trong thời gian dài.', 'Đoạn G',
      '“The effect of 20 hours of wakefulness on driving is the equivalent of two shots of whiskey,\' he warns. \'Sleep deprivation is unfortunately a major cause of death in the US in young adults”',
      '20 giờ thức = extended periods of sleeplessness; tỉ lệ tai nạn, tử vong = dangers; người nói là Saper → B'],
    17: ['Một hành vi của động vật có thể làm cơ sở để thay đổi nhịp ngủ của con người.', 'Đoạn F',
      '“studies of species exhibiting \'natural models of sleep deprivation,\' as psychologist Verner Bingman … calls them, may allow researchers to provide us with new methods for adapting to limited sleep without losing effectiveness.”',
      '“natural models of sleep deprivation” = animal behaviour; “new methods for adapting to limited sleep” = modifying human sleep patterns → C'],
    18: ['Việc vận động và thức của cá voi sát thủ con giúp chúng duy trì ______.', 'Đoạn A',
      '“The young orcas\' movement and wakefulness help them keep their body temperature constant”',
      '“keep their body temperature constant” = maintaining body temperature → body temperature'],
    19: ['Cá voi mẹ mới sinh phải thức để bảo vệ con khỏi ______.', 'Đoạn A',
      '“Meanwhile the mothers of newborn orcas must constantly look out for sharks”',
      '“constantly look out for sharks” = cảnh giác với cá mập → sharks'],
    20: ['Các thí nghiệm tước giấc ngủ trên ______ cho thấy động vật chết nếu không ngủ đủ.', 'Đoạn C',
      '“experiments have shown that sleep deprivation can cause death more quickly than food deprivation. Two weeks without sleep can kill laboratory rats.”',
      'Hai tuần không ngủ có thể làm chết chuột thí nghiệm (file key của Vol bỏ trống câu này) → laboratory rats'],
    21: ['Các nhà khoa học chưa tìm ra vì sao hầu hết động vật đều ngủ với ______.', 'Đoạn D',
      '“However, for unknown reasons, closed eyes seem to be a virtually universal prerequisite for sleep.”',
      '“for unknown reasons” = have not yet worked out why; “virtually universal” = almost all animals → closed eyes'],
    22: ['Với con người, giấc ngủ thiết yếu cho hoạt động hiệu quả của ______.', 'Đoạn E',
      '“sleep is no more effective than a comparable period of wakeful resting - except for one critical organ, the brain. The human brain apparently cannot do without sleep.”',
      '“cannot do without sleep” = sleep is vital → brain'],
    23: ['Trong những đợt ______, chim hoét Swainson bị thiếu ngủ trầm trọng.', 'Đoạn F',
      '“the migratory birds Swainson\'s thrushes, which for migration purposes, go from a normal night\'s sleep of 10 to 12 hours down to about 2.5 hours so they can fly at night.”',
      'Khi di cư, giấc ngủ giảm từ 10–12 giờ xuống khoảng 2,5 giờ → migration'],
    24: ['Nhắc đến khả năng dùng hóa chất để rút ngắn thời gian ngủ.', 'Đoạn G',
      '“Says Bingman, \'The trick would be to develop techniques or drugs that could recreate a similar brain pattern in humans.\'”',
      'Phát triển thuốc (drugs = chemicals) tạo ra kiểu ngủ chập chờn như chim hoét ở người để ngủ ít đi = potential use of chemicals to reduce sleep. Đoạn E (file key của Vol ghi E) chỉ nói về tín hiệu hóa học tự nhiên của não, không phải việc “sử dụng” hóa chất → G'],
    25: ['Nhắc đến việc các chuyên gia không nhất trí về hành vi của một số loài động vật.', 'Đoạn B',
      '“scientists are unsure if reptiles and fish do.” … “But other scientists believe fish do enter a restful dormant state that is at least similar to sleep.”',
      'Siegel cho rằng cá không ngủ, nhà khoa học khác lại cho rằng có = lack of expert consensus → B'],
    26: ['Ví dụ về một loài vẫn hoạt động bình thường trong lúc ngủ.', 'Đoạn D',
      '“In dolphins, half the brain may rest while the other half stays vigilantly awake, and the animal carries on everyday activities.”',
      '“carries on everyday activities” = continues to function normally → D'],
  },
};
