// Vol 8 - READING/Test 1.pdf - Reading Passage 2 (PDF p4–7, text layer). Not in the bank / mini-ielts.
// Key = READING/Key.pdf (Test 1). The PDF is a re-typed copy with OCR errors baked in, fixed: subtitle "…what the changes"
// → "…what the changes mean", "1Q" → IQ, "visuo-10 tests set ou spatial" → visuo-spatial, "a closer look ace. Whe at" →
// "a closer look at", "belleves" → believes, "familles" → families, "and also that. In societies … focus on excessively
// abstract" → "and also that, in societies … focus on, abstract", stray capitals (Intelligence, Improvement, Illustration).
// Paragraph B and E are one paragraph each (the PDF has a blank line inside them).
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 8, test: 1, part: 2, title: 'IQ Scores', text: 't1p2.txt',
  groups: [
    matching(14, ['James Flynn', 'John Rust', 'Robert Howard', 'Thomas Teasdale'], [
      'Modern technology has influenced some aspects of human intelligence.',
      'IQ scores may not have attained their natural limit.',
      'Improved diet has a positive effect on mental powers.',
      'Exceptional individuals can have an impact on collective intelligence.',
      'As societies become more sophisticated the need for problem-solving skills increases.',
    ], { title: 'List of People', reuse: true,
      instruction: 'Look at the following statements (Questions 14–18) and the list of people below. Match each statement with the correct person, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 14–18 on your answer sheet. NB You may use any letter more than once.' }),
    matching(19, ['A', 'B', 'C', 'D', 'E', 'F'], [
      'an account of a selection procedure involving a particular group of people',
      'a description of one component of a visuo-spatial test',
      'an overview of the different interpretations of IQ score trends',
      'an example of the negative effect affluence may have on IQ trends',
    ], { instruction: 'Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, in boxes 19–22 on your answer sheet.' }),
    notes(23, 26, [
      'During the __Q23__, James Flynn conducted research showing that IQ scores were increasing. Flynn then analysed specific kinds of reasoning ability separately. He found that tests called __Q24__, which measured visuo-spatial skills, accounted for the biggest score increases, whereas scores in numerical and __Q25__ components rose less steeply. Results from research in other __Q26__, which Flynn has examined more recently, are consistent with his earlier findings.',
    ], { title: 'James Flynn',
      instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'A', 15: 'D', 16: 'C', 17: 'B', 18: 'B', 19: 'E', 20: 'B', 21: 'A', 22: 'F', 23: 'mid-1980s',
    24: "Raven's matrices", 25: 'verbal', 26: 'countries' },
  expl: {
    14: ['Công nghệ hiện đại đã ảnh hưởng tới một số khía cạnh trí thông minh của con người.', 'Đoạn C',
      '“Flynn believes that demands for visuo-spatial abilities have grown because of TV, computers and cars”',
      'TV, máy tính, ô tô = modern technology; nhu cầu về khả năng thị giác–không gian tăng = ảnh hưởng tới một khía cạnh trí thông minh; người nói là Flynn → A'],
    15: ['Điểm IQ có thể chưa chạm tới giới hạn tự nhiên của nó.', 'Đoạn E',
      '“However, as Teasdale points out, if such a ceiling had been reached, the test results should show scores pushing against it rather than actually falling.”',
      'Teasdale lập luận: nếu đã chạm “trần” (ceiling = natural limit) thì điểm phải dồn sát trần chứ không giảm → có thể chưa chạm giới hạn → D'],
    16: ['Chế độ ăn tốt hơn có tác động tích cực lên năng lực trí tuệ.', 'Đoạn D',
      '“Others, such as experimental psychologist Robert Howard, argue that overall intelligence really has risen, helped by better nutrition”',
      '“better nutrition” = improved diet; trí thông minh tăng nhờ dinh dưỡng tốt hơn — ý kiến của Robert Howard → C'],
    17: ['Những cá nhân xuất chúng có thể tác động tới trí tuệ của cả cộng đồng.', 'Đoạn D',
      '“He also points out that if just one mind grasps a new concept, such as Einstein and the theory of relativity, it may then be easier for society in general to think in a more complex way.”',
      '“just one mind … such as Einstein” = exceptional individuals; “society in general” = collective; “He” = John Rust → B'],
    18: ['Khi xã hội trở nên phức tạp hơn, nhu cầu về kỹ năng giải quyết vấn đề tăng lên.', 'Đoạn D',
      '“He believes that there are several factors, including the fact that, in more complex societies, people have to think harder to find solutions to problems they face.”',
      '“more complex societies” = more sophisticated; “think harder to find solutions to problems” = cần kỹ năng giải quyết vấn đề nhiều hơn; “He” = John Rust → B'],
    19: ['Một tường thuật về quy trình tuyển chọn liên quan tới một nhóm người cụ thể.', 'Đoạn E',
      '“The Danish military still summons virtually all young men before a draft board to identify who is suitable to do military service.”',
      'Quân đội Đan Mạch gọi gần như mọi thanh niên ra hội đồng tuyển quân để chọn người đủ điều kiện = selection procedure với nhóm “young men” → E'],
    20: ['Mô tả một thành phần của bài kiểm tra thị giác–không gian.', 'Đoạn B',
      '“This last test category usually includes ‘Raven’s matrices’ - sequential patterns with one piece missing. The candidate has to choose, from a set of alternatives, which shape to put in the empty space.”',
      'Raven’s matrices là một phần của nhóm bài visuo-spatial, được mô tả cụ thể (chuỗi hình thiếu một mảnh, chọn hình điền vào) → B'],
    21: ['Tổng quan về những cách diễn giải khác nhau đối với xu hướng điểm IQ.', 'Đoạn A',
      '“However, psychologists disagree about what the upward trend in scores really means. Some researchers argue that … Others say …”',
      'Đoạn A nêu các nhà tâm lý bất đồng về ý nghĩa xu hướng tăng điểm, liệt kê nhiều quan điểm (some… others…) → A'],
    22: ['Một ví dụ về tác động tiêu cực mà sự giàu có có thể gây ra cho xu hướng IQ.', 'Đoạn F',
      '“he does wonder whether the conditions leading to dramatic improvements in mental ability disappear as societies become more prosperous. He points out that in human history, prosperity often led to decadence, and argues that the case of ancient Rome can be viewed as an illustration of this.”',
      '“prosperous / prosperity” = affluence; “decadence” = tác động tiêu cực; ví dụ là La Mã cổ đại → F'],
    23: ['Trong ______, James Flynn thực hiện nghiên cứu cho thấy điểm IQ đang tăng.', 'Đoạn B',
      '“James Flynn, a professor of political science, first showed that IQ scores were rising in the mid-1980s”',
      '“first showed that IQ scores were rising in the mid-1980s” → mid-1980s'],
    24: ['Ông thấy các bài kiểm tra gọi là ______, đo kỹ năng thị giác–không gian, chiếm phần tăng điểm lớn nhất.', 'Đoạn B',
      '“This last test category usually includes ‘Raven’s matrices’ … The strongest gains in almost every case were on Raven’s matrices and similar tests”',
      '“The strongest gains” = biggest score increases; bài visuo-spatial tên là Raven’s matrices → Raven’s matrices'],
    25: ['… trong khi điểm ở phần số học và ______ tăng chậm hơn.', 'Đoạn B',
      '“while verbal and arithmetical scores showed more modest rises.”',
      '“arithmetical” = numerical; “more modest rises” = rose less steeply; từ còn lại là verbal → verbal'],
    26: ['Kết quả nghiên cứu ở các ______ khác mà Flynn xem xét gần đây phù hợp với phát hiện trước của ông.', 'Đoạn B',
      '“Since presenting his original paper, Flynn has looked at data from further countries and found the same upward trend”',
      '“further countries” = other countries; “found the same upward trend” = consistent with his earlier findings → countries'],
  },
};
