// Cambridge IELTS 14 - Test 4 - Passage 2. Source: ieltsworldly.com, checked against the book key.
// Text fix: "an animal of its breeding rate" → or. Question typo "may by healthier" → be.
const { matching, tfng, multi } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 4, part: 2, title: 'Why zoos are good', text: 't4p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F'], [
      'a reference to how quickly animal species can die out',
      'reasons why it is preferable to study animals in captivity rather than in the wild',
      'mention of two ways of learning about animals other than visiting them in zoos',
      'reasons why animals in zoos may be healthier than those in the wild',
    ], { instruction: 'Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, in boxes 14–17 on your answer sheet.' }),
    tfng(18, [
      'An animal is likely to live longer in a zoo than in the wild.',
      'There are some species in zoos which can no longer be found in the wild.',
      'Improvements in the quality of TV wildlife documentaries have resulted in increased numbers of zoo visitors.',
      'Zoos have always excelled at transmitting information about animals to the public.',
      'Studying animals in zoos is less stressful for the animals than studying them in the wild.',
    ]),
    multi(23, 2, 'Which TWO of the following are stated about zoo staff in the text?', [
      'Some take part in television documentaries about animals.',
      'Some travel to overseas locations to join teams in zoos.',
      'Some get experience with species in the wild before taking up zoo jobs.',
      'Some teach people who are involved with conservation projects.',
      'Some specialise in caring for species which are under threat.',
    ]),
    multi(25, 2, 'Which TWO of these beliefs about zoos does the writer mention in the text?', [
      'They can help children overcome their fears of wild animals.',
      'They can increase public awareness of environmental issues.',
      'They can provide employment for a range of professional people.',
      'They can generate income to support wildlife conservation projects.',
      'They can raise animals which can later be released into the wild.',
    ]),
  ],
  key: { 14: 'B', 15: 'E', 16: 'C', 17: 'A', 18: 'TRUE', 19: 'TRUE', 20: 'NOT GIVEN', 21: 'FALSE', 22: 'NOT GIVEN', 23: 'B', 24: 'D', 25: 'B', 26: 'E' },
  expl: {
    14: ['Nhắc tới việc các loài có thể tuyệt chủng nhanh thế nào.', 'Đoạn B', '“some of these collapses have been sudden, dramatic and unexpected”', 'Sự suy sụp đột ngột, bất ngờ = loài có thể biến mất rất nhanh → B'],
    15: ['Lý do nên nghiên cứu động vật nuôi nhốt hơn là ngoài tự nhiên.', 'Đoạn E', '“Being able to undertake research on animals in zoos where there is less risk and fewer variables”', 'Ít rủi ro, ít biến số → E'],
    16: ['Nhắc tới hai cách tìm hiểu động vật ngoài việc đến sở thú.', 'Đoạn C', '“television documentaries are becoming ever more detailed and impressive, and many natural history specimens are on display in museums”', 'Phim tài liệu truyền hình và mẫu vật ở bảo tàng → C'],
    17: ['Lý do động vật trong sở thú có thể khỏe hơn ngoài tự nhiên.', 'Đoạn A', '“Animals in good zoos get a varied and high-quality diet with all the supplements required, and any illnesses they might have will be treated.”', 'Ăn uống tốt, được chữa bệnh, không ký sinh trùng → A'],
    18: ['Động vật có khả năng sống lâu hơn trong sở thú.', 'Đoạn A', '“The average captive animal will have a greater life expectancy compared with its wild counterpart”', 'Tuổi thọ cao hơn → TRUE'],
    19: ['Có những loài trong sở thú không còn thấy ngoài tự nhiên.', 'Đoạn B', '“A good number of species only exist in captivity, with many of these living in zoos.”', 'Nhiều loài chỉ còn tồn tại trong điều kiện nuôi nhốt → TRUE'],
    20: ['Phim tài liệu hay hơn làm tăng số khách đến sở thú.', 'Đoạn C', '“While it is true that television documentaries are becoming ever more detailed and impressive”', 'Không nói gì về ảnh hưởng tới số khách → NOT GIVEN'],
    21: ['Sở thú luôn xuất sắc trong việc truyền tải thông tin về động vật.', 'Đoạn D', '“This was an area where zoos used to be lacking”', 'Trước đây sở thú còn yếu ở mảng này → FALSE'],
    22: ['Nghiên cứu động vật trong sở thú ít gây căng thẳng cho chúng hơn ngoài tự nhiên.', 'Đoạn E', '“where there is less risk and fewer variables”', 'Chỉ nói ít rủi ro và ít biến số cho nghiên cứu; không nói mức căng thẳng của con vật → NOT GIVEN'],
    23: ['Hai nhận định đúng về nhân viên sở thú.', 'Đoạn D', '“or send their animal keepers abroad to contribute their knowledge and skills to those working in zoos and reserves”',
      'Có người ra nước ngoài làm cùng các sở thú (B) và có người đào tạo người làm bảo tồn (D). Hai đáp án là B và D → B'],
    24: ['Hai nhận định đúng về nhân viên sở thú.', 'Đoạn D', '“Many zoos also work directly to educate conservation workers in other countries”', 'Đào tạo nhân viên bảo tồn (D), cùng với B. Hai đáp án là B và D → D'],
    25: ['Hai quan niệm về sở thú mà tác giả nhắc tới.', 'Đoạn F', '“so that they can assist or at least accept the need to be more environmentally conscious.”',
      'Nâng cao nhận thức môi trường (B) và nuôi thả lại động vật vào tự nhiên (E, đoạn B). Hai đáp án là B và E → B'],
    26: ['Hai quan niệm về sở thú mà tác giả nhắc tới.', 'Đoạn B', '“Still more only exist in the wild because they have been reintroduced from zoos”', 'Nuôi rồi thả lại vào tự nhiên (E), cùng với B. Hai đáp án là B và E → E'],
  },
};
