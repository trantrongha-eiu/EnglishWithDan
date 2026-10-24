// Vol 4 - reading/test 9/test 9.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. Text = PDF (typed, clean
// OCR). Questions 27–29 are missing from the PDF (the question pages start at "Questions 30-34") and the explain file leaves
// rows 27–29 empty; no other copy found online → the passage has 11 questions, 30–40 (Vol 4 - Test 9 = 37 questions, like the
// 39-question Vol 1 tests). Typos fixed: "it as not been", "Such in dependence", "attention spam", "iff infancy", "Ip 1968",
// "reached, its height", "couW", "Just three", "motional behaviour", "reactionsfto", "al rnative", "of new baby", "older
// childs", "in particular setting". Key = explain key/test 9-up.pdf (scan). Fixed: Q33 Vol C ("a laboratory setting") → D —
// the emotional reactions were assessed by heart rate, its variability and pupil dilation = certain physical functions.
const { endings, ynng, mc } = require('../../vr_build');
module.exports = {
  vol: 4, test: 9, part: 3, title: 'Temperament', text: 't9p3.txt', lettered: false, start: 30, allowCount: [11],
  notes: ['Questions 27–29 are missing from the source PDF (and its key) – this passage starts at Question 30.'],
  groups: [
    endings(30, [
      'parental response to children.',
      'particular neurological locations.',
      'a laboratory setting.',
      'certain physical functions.',
      'unpleasant experiences.',
      'communication problems.',
      'inherited aspects of temperament.',
    ], [
      'Buss and Plomin tried to find evidence for',
      'Kagan rejected the idea that certain traits were mainly a result of',
      'Kagan suggested that the root of behavioural traits lay in',
      'Kagan measured children\'s emotional reactions by assessing',
      'Dunn and Kendrick reported an effect on temperament of',
    ]),
    ynng(35, [
      'Some of Thomas and Chess\'s temperamental dimensions overlap with each other.',
      'The concept of the \'difficult\' temperament has been accepted without question.',
      'Vaughan found that mothers\' assessments of their children\'s temperaments were predictable.',
      'Buss and Plomin relied on data which had been collected at different periods.',
      'Kagan\'s studies showed that the majority of children reacted confidently to new people.',
    ]),
    mc(40, [
      ['What is the best title for Reading Passage 3?', [
        'The role of temperament in behavioural problems', 'The effect of temperament on family relationships',
        'A comparison of different theories of temperament', 'A new development in the study of temperament']],
    ]),
  ],
  key: { 30: 'G', 31: 'E', 32: 'B', 33: 'D', 34: 'A', 35: 'YES', 36: 'NO', 37: 'YES', 38: 'NOT GIVEN', 39: 'NO', 40: 'C' },
  expl: {
    30: ['Buss và Plomin cố tìm bằng chứng cho…', 'Đoạn 8',
      '“In developing their system, Buss and Plomin sought to identify traits that showed early emergence and strong genetic influence”',
      '“strong genetic influence” = các khía cạnh di truyền của tính khí → G'],
    31: ['Kagan bác bỏ ý cho rằng một số đặc điểm chủ yếu là kết quả của…', 'Đoạn 9',
      '“for the substantial majority of children who show extreme shyness in middle childhood, this is not simply a consequence of recent stresses and upsets, but rather a reflection of enduring qualities of their behaviour.”',
      '“not simply a consequence of recent stresses and upsets” = không phải do những trải nghiệm khó chịu → E'],
    32: ['Kagan cho rằng gốc rễ của các đặc điểm hành vi nằm ở…', 'Đoạn 10',
      '“Kagan proposes that very specific sites in the brain, which regulate emotional behaviour and long-term memory, are responsible for differences in behavioural style.”',
      '“very specific sites in the brain” = những vị trí thần kinh cụ thể → B'],
    33: ['Kagan đo phản ứng cảm xúc của trẻ bằng cách đánh giá…', 'Đoạn 10',
      '“He has shown some physiological differences between these groups of children on measures such as heart rate, heart rate variability and pupil dilation. These are all features which indicate the degree of the child\'s emotional reactions to experiences.”',
      'Nhịp tim, độ biến thiên nhịp tim, độ giãn đồng tử = các chức năng thể chất. (C “a laboratory setting” là nơi quan sát hành vi, không phải thứ được đánh giá; key Vol ghi C — sai.) → D'],
    34: ['Dunn và Kendrick ghi nhận tác động lên tính khí của…', 'Đoạn 11',
      '“They also found that temperamental differences were related to differences in the quality of the interaction between the mother and the older child.”',
      'Chất lượng tương tác giữa mẹ và con = cách cha mẹ đáp lại con → A'],
    35: ['Một số chiều tính khí của Thomas và Chess trùng lặp nhau.', 'Đoạn 3',
      '“it is likely that there are fewer than nine independent influences on children\'s behaviour. For example, a child who is very distractible is also likely to have a short attention span.”',
      'Dễ xao nhãng và khả năng chú ý ngắn đi liền nhau → các chiều chồng lấn → YES'],
    36: ['Khái niệm tính khí “khó” được chấp nhận không chút nghi ngờ.', 'Đoạn 5',
      '“However, the concept of the difficult temperament type has been the subject of much controversy.”',
      '“much controversy” = gây nhiều tranh cãi → NO'],
    37: ['Vaughan phát hiện đánh giá của các bà mẹ về tính khí con có thể dự đoán được.', 'Đoạn 5',
      '“Vaughan found that mothers\' future ratings of temperament could be reliably identified before the child was born.”',
      '“reliably identified before the child was born” = dự đoán được → YES'],
    38: ['Buss và Plomin dựa vào dữ liệu thu thập ở các thời kỳ khác nhau.', 'Đoạn 7',
      '“Buss and Plomin suggested that both experimental laboratory studies and analyses of questionnaire data indicated that there were just three independent temperament dimensions”',
      'Bài nói dữ liệu từ phòng thí nghiệm và bảng hỏi; không nói thu thập vào các thời kỳ khác nhau → NOT GIVEN'],
    39: ['Nghiên cứu của Kagan cho thấy phần lớn trẻ phản ứng tự tin với người lạ.', 'Đoạn 9',
      '“15 per cent or so of children aged 2–3 years are very shy and timid when faced with the unfamiliar. A roughly equal percentage are uninhibited and socially responsive when confronting unfamiliar people.”',
      'Chỉ khoảng 15% trẻ dạn dĩ với người lạ — không phải đa số → NO'],
    40: ['Tiêu đề phù hợp nhất cho bài đọc là gì?', 'Cả bài',
      '“developmental psychologists have not found a single agreed framework to define and measure this human trait.”',
      'Bài lần lượt trình bày và so sánh lý thuyết của Thomas & Chess, Buss & Plomin, Kagan, Dunn & Kendrick → C'],
  },
};
