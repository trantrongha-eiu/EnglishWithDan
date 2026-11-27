// Cambridge IELTS 14 - Test 1 - Passage 2. Source: ieltsworldly.com, checked against the book key. Q16 typo "profit their work" → "profit from their work".
const { matching, multi, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 1, part: 2, title: 'The growth of bike-sharing schemes around the world', text: 't1p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
      'a description of how people misused a bike-sharing scheme',
      'an explanation of why a proposed bike-sharing scheme was turned down',
      'a reference to a person being unable to profit from their work',
      'an explanation of the potential savings a bike-sharing scheme would bring',
      'a reference to the problems a bike-sharing scheme was intended to solve',
    ], { reuse: true, instruction: 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G, in boxes 14–18 on your answer sheet. NB You may use any letter more than once.' }),
    multi(19, 2, 'Which TWO of the following statements are made in the text about the Amsterdam bike-sharing scheme of 1999?', [
      'It was initially opposed by a government department.',
      'It failed when a partner in the scheme withdrew support.',
      'It aimed to be more successful than the Copenhagen scheme.',
      'It was made possible by a change in people’s attitudes.',
      'It attracted interest from a range of bike designers.',
    ]),
    multi(21, 2, 'Which TWO of the following statements are made in the text about Amsterdam today?', [
      'The majority of residents would like to prevent all cars from entering the city.',
      'There is little likelihood of the city having another bike-sharing scheme.',
      'More trips in the city are made by bike than by any other form of transport.',
      'A bike-sharing scheme would benefit residents who use public transport.',
      'The city has a reputation as a place that welcomes cyclists.',
    ]),
    notes(23, 26, [
      'The first bike-sharing scheme was the idea of the Dutch group Provo. The people who belonged to this group were __Q23__. They were concerned about damage to the environment and about __Q24__, and believed that the bike-sharing scheme would draw attention to these issues. As well as painting some bikes white, they handed out __Q25__ that condemned the use of cars.',
      'However, the scheme was not a great success: almost as quickly as Provo left the bikes around the city, the __Q26__ took them away. According to Schimmelpennink, the scheme was intended to be symbolic. The idea was to get people thinking about the issues.',
    ], { title: 'The first urban bike-sharing scheme', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'E', 15: 'C', 16: 'F', 17: 'C', 18: 'A', 19: 'B', 20: 'D', 21: 'D', 22: 'E', 23: 'activists', 24: 'consumerism', 25: 'leaflets', 26: 'police' },
  expl: {
    14: ['Mô tả việc người ta lạm dụng một chương trình chia sẻ xe đạp.', 'Đoạn E', '“The system, however, was prone to vandalism and theft.”', 'Xe bị phá hoại và bị trộm sau mỗi cuối tuần → E'],
    15: ['Giải thích vì sao một đề xuất chia sẻ xe đạp bị bác bỏ.', 'Đoạn C', '“They said that the bicycle belongs to the past. They saw a glorious future for the car,”',
      'Hội đồng thành phố bác bỏ vì cho rằng xe đạp đã lỗi thời, tương lai thuộc về ô tô → C'],
    16: ['Nhắc tới một người không thu được lợi nhuận từ công sức của mình.', 'Đoạn F', '“But financially I didn’t really benefit from it, because I never filed for a patent.”', 'Schimmelpennink không đăng ký bằng sáng chế nên không có lợi về tài chính → F'],
    17: ['Giải thích khoản tiết kiệm tiềm năng mà chương trình mang lại.', 'Đoạn C', '“would cost the municipality only 10% of what it contributed to public transport per person per kilometer.”', 'Chi phí chỉ bằng 10% so với giao thông công cộng → C'],
    18: ['Nhắc tới những vấn đề mà chương trình chia sẻ xe đạp nhằm giải quyết.', 'Đoạn A', '“They believed the scheme, which was known as the Witte Fietsenplan, was an answer to the perceived threats of air pollution and consumerism.”',
      'Chương trình nhằm giải quyết ô nhiễm không khí và chủ nghĩa tiêu dùng → A'],
    19: ['Hai nhận định đúng về chương trình năm 1999 ở Amsterdam.', 'Đoạn D–E', '“People had become more environmentally conscious, and the Danish experiment had proved that bike-sharing was a real possibility.”',
      'Thực hiện được nhờ người dân có ý thức môi trường hơn (D); thất bại khi Postbank bỏ thẻ chip và đối tác hết quan tâm (B). Bộ Giao thông lại ủng hộ (A sai). Hai đáp án là B và D → B'],
    20: ['Hai nhận định đúng về chương trình năm 1999 ở Amsterdam.', 'Đoạn E', '“To continue the project we would have needed to set up another system, but the business partner had lost interest.”',
      'Đối tác rút lui làm chương trình thất bại (B) và thay đổi thái độ người dân giúp chương trình ra đời (D). Hai đáp án là B và D → D'],
    21: ['Hai nhận định đúng về Amsterdam ngày nay.', 'Đoạn G', '“People who travel on the underground don’t carry their bikes around. But often they need additional transport to reach their final destination.”',
      'Chương trình chia sẻ xe đạp sẽ giúp người đi tàu điện ngầm (D); thành phố nổi tiếng thân thiện với xe đạp (E). 38% chuyến đi bằng xe đạp không có nghĩa là nhiều nhất (C). Hai đáp án là D và E → D'],
    22: ['Hai nhận định đúng về Amsterdam ngày nay.', 'Đoạn G', '“it is regarded as one of the two most cycle-friendly capitals in the world”', 'Được coi là thủ đô thân thiện với xe đạp nhất (E), cùng với D. Hai đáp án là D và E → E'],
    23: ['Những người thuộc nhóm Provo là ___.', 'Đoạn A', '“was a group of Dutch activists who wanted to change society.”', 'Provo là nhóm các nhà hoạt động xã hội → activists'],
    24: ['Họ lo ngại về tổn hại môi trường và về ___.', 'Đoạn A', '“an answer to the perceived threats of air pollution and consumerism.”', 'Ô nhiễm không khí (môi trường) và chủ nghĩa tiêu dùng → consumerism'],
    25: ['Ngoài sơn trắng xe đạp, họ phát ___ lên án việc dùng ô tô.', 'Đoạn A', '“They also distributed leaflets describing the dangers of cars”', '“distributed” = handed out; tờ rơi → leaflets'],
    26: ['Gần như ngay khi Provo để xe quanh thành phố, ___ đã thu chúng đi.', 'Đoạn B', '“The police were opposed to Provo’s initiatives and almost as soon as the white bikes were distributed around the city, they removed them.”', '“removed” = took away; cảnh sát → police'],
  },
};
