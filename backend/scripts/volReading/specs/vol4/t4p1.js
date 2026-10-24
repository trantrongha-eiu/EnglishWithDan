// Vol 4 - reading/test 4/test 4.pdf - Reading Passage 1 (PDF p1–4). Not in the bank / mini-ielts. Text = PDF (typed, read
// from the page images). The PDF lost three parts of the list of intelligences: the Bodily-kinesthetic description (the
// Interpersonal text is printed under the "Bodily-kinesthetic" label), the "Interpersonal intelligence:" label and the whole
// Naturalist entry — so Q8 ("Working with ___ / Playing sports", Bodily-kinesthetic) and Q10 ("Organizing ___ of items",
// Naturalist) had nothing to point at. Restored from the passage's source, M. A. Christison's list of the eight intelligences
// (English Teaching Forum, 1998; same "Involves … It may be exercised through …" wording as the printed entries):
// Bodily-kinesthetic "playing with blocks and other construction materials, dancing, playing various sports and games…",
// Naturalist "exploring nature, making collections of objects…". Not verified word for word online: the 1998 Forum page is
// only on the Wayback Machine (blocked, HTTP 429); the copies on ieltsreading.info / elsaspeak / langmaster rebuild these
// entries from the question table ("organizing collections of items", "tasks requiring imagination" under Bodily-kinesthetic)
// and key Q8 "other people" — not used. Key = explain key/test 4- up.pdf (scan); Q8 Vol "other people" (read off the mislabelled paragraph) →
// construction materials. Typos fixed: "20century", "1930", "intelligence are", "Applyig", "to talk this into account" → take,
// "constructed as evidence" → construed, "learner who thinks" → a learner. Q5 key "discussions" (passage: "discussion").
const { tfng, table, notes } = require('../../vr_build');
module.exports = {
  vol: 4, test: 4, part: 1, title: 'Multiple intelligences', text: 't4p1.txt', lettered: false, free: ['discussions'],
  groups: [
    tfng(1, [
      'Intelligence tests became popular worldwide in the early 20th century.',
      'Traditional intelligence tests focused on assessing language and mathematical ability.',
      'New types of intelligence tests have now been developed to assess the potential of schoolchildren.',
      'Research has shown that the majority of students benefit when information is taught in a sequential manner.',
    ]),
    table(5, 10, ['Intelligence type', 'Characteristics', 'Examples of ways to develop the intelligence'], [
      ['Linguistic', 'Language ability', '• Taking part in __Q5__<br>• Reading'],
      ['Logical-mathematical', 'Numeracy / logic skills', '• Number games<br>• Solving puzzles'],
      ['Musical', 'Expression through music and dance', '• Playing musical instruments<br>• Performing<br>• Listening to different __Q6__'],
      ['Spatial', 'Manipulation of mental images of objects in space', '• Tasks requiring imagination<br>• Improving __Q7__'],
      ['Bodily-kinesthetic', 'Physical skills', '• Working with __Q8__<br>• Playing sports'],
      ['Interpersonal', 'Communication skills', '• Group work<br>• Drama'],
      ['Intrapersonal', 'Understanding and controlling __Q9__', '• Working alone<br>• Reflection'],
      ['Naturalist', 'Understanding nature', '• Exploration of nature<br>• Organizing __Q10__ of items'],
    ], { instruction: 'Complete the table below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 5–10 on your answer sheet.' }),
    notes(11, 13, [
      'In the experience of teachers and parents, when __Q11__ in one intelligence is improved, other areas may also develop.',
      'If a learner feels their level of intelligence is fixed, they may not cope with __Q12__ as well as a learner who believes intelligence is flexible.',
      'Gardner believes that in the future educational programmes need to cater for the __Q13__ between students.',
    ], { instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 11–13 on your answer sheet.' }),
  ],
  key: { 1: 'TRUE', 2: 'TRUE', 3: 'NOT GIVEN', 4: 'FALSE', 5: 'discussion / discussions', 6: 'recordings', 7: 'observation skills',
    8: 'construction materials / materials', 9: 'our emotions / emotions', 10: 'collections', 11: 'proficiency', 12: 'failure',
    13: 'individual differences / differences' },
  expl: {
    1: ['Các bài kiểm tra trí thông minh trở nên phổ biến khắp thế giới vào đầu thế kỷ 20.', 'Đoạn 1',
      '“By the 1920s and 1930s, intelligence tests and their product, an individual\'s IQ (Intelligence Quotient), had become widely used in many societies around the world.”',
      '“widely used in many societies around the world” = popular worldwide; 1920s–1930s = đầu thế kỷ 20 → TRUE'],
    2: ['Các bài kiểm tra truyền thống tập trung đánh giá khả năng ngôn ngữ và toán học.', 'Đoạn 1',
      '“All they test is linguistic and logical-mathematical intelligence”',
      '“linguistic and logical-mathematical” = ngôn ngữ và toán – logic → TRUE'],
    3: ['Các loại bài kiểm tra mới đã được phát triển để đánh giá tiềm năng của học sinh.', 'Đoạn 1',
      '“Tests of this type, however, have now fallen into disrepute.”',
      'Bài chỉ nói bài kiểm tra IQ mất uy tín; không nhắc đến bài kiểm tra kiểu mới nào → NOT GIVEN'],
    4: ['Nghiên cứu cho thấy phần lớn học sinh học tốt hơn khi kiến thức được dạy theo trình tự.', 'Đoạn 1',
      '“We now know that 75% of teachers are sequential, analytical presenters but 70% of students do not actually learn this way.”',
      '70% học sinh KHÔNG học theo cách tuần tự → phần lớn không được lợi → FALSE'],
    5: ['Trí thông minh ngôn ngữ: tham gia ______.', 'Mục Linguistic intelligence',
      '“It may be exercised through reading interesting books, listening to recordings, using various kinds of computer technology, and actively participating in discussion.”',
      '“actively participating in” = taking part in; “Reading” đã có ở dòng dưới → discussion'],
    6: ['Trí thông minh âm nhạc: nghe nhiều ______ khác nhau.', 'Mục Musical intelligence',
      '“It may be exercised through exposure to a variety of recordings”',
      '“exposure to a variety of” = listening to different → recordings'],
    7: ['Trí thông minh không gian: cải thiện ______.', 'Mục Spatial intelligence',
      '“It may be developed through sharpening observation skills, solving mazes and other spatial tasks, and using imagery and active imagination.”',
      '“sharpening” = improving; “active imagination” đã ứng với dòng “Tasks requiring imagination” → observation skills'],
    8: ['Trí thông minh vận động: làm việc với ______; chơi thể thao.', 'Mục Bodily-kinesthetic intelligence',
      '“It may be exercised through playing with blocks and other construction materials, dancing, playing various sports and games”',
      '“playing with … construction materials” = working with; “playing various sports” = dòng “Playing sports”. (Bản PDF Vol in nhầm đoạn Interpersonal dưới nhãn này nên key Vol ghi “other people” — “other people” thuộc trí thông minh giao tiếp, ứng với “Group work”.) → construction materials'],
    9: ['Trí thông minh nội tâm: hiểu và kiểm soát ______.', 'Mục Intrapersonal intelligence',
      '“Involves comprehending our emotions, and growing in the ability to control and work with them consciously.”',
      '“comprehending” = understanding; “control … them” = controlling → our emotions'],
    10: ['Trí thông minh tự nhiên: sắp xếp ______ đồ vật.', 'Mục Naturalist intelligence',
      '“It may be exercised through exploring nature, making collections of objects, studying them, and grouping them.”',
      '“exploring nature” = Exploration of nature; “making collections of objects … grouping them” = organizing collections of items → collections'],
    11: ['Theo kinh nghiệm của giáo viên và phụ huynh, khi ______ ở một loại trí thông minh được nâng lên, các mặt khác cũng có thể phát triển.', 'Đoạn “Applying …” 1',
      '“many teachers and parents are finding that when an individual develops proficiency in one area, the whole constellation of intelligences may be enhanced.”',
      '“develops proficiency in one area” = proficiency in one intelligence is improved; “the whole constellation … enhanced” = other areas develop → proficiency'],
    12: ['Người học nghĩ trí thông minh của mình cố định có thể không đối phó tốt với ______.', 'Đoạn “Applying …” 2',
      '“a learner who thinks they have no control over their ability level is more likely to get upset when faced with failure”',
      '“no control over their ability level” = trí thông minh cố định; “get upset when faced with” = not cope with → failure'],
    13: ['Gardner cho rằng chương trình giáo dục tương lai cần đáp ứng ______ giữa các học sinh.', 'Đoạn cuối',
      '“He proposes individually configured education – an education that takes individual differences seriously”',
      '“takes … seriously” = cater for → individual differences'],
  },
};
