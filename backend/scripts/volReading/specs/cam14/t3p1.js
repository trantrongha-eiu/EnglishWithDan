// Cambridge IELTS 14 - Test 3 - Passage 1. Source: ieltsworldly.com, checked against the book key. Text fix: "four seasons" → reasons.
const { matching, ynng } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 3, part: 1, title: 'The concept of intelligence', text: 't3p1.txt',
  groups: [
    matching(1, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], [
      'information about how non-scientists’ assumptions about intelligence influence their behaviour towards others',
      'a reference to lack of clarity over the definition of intelligence',
      'the point that a researcher’s implicit and explicit theories may be very different',
    ], { instruction: 'Reading Passage 1 has ten sections, A–J. Which section contains the following information? Write the correct letter, A–J, in boxes 1–3 on your answer sheet.' }),
    ynng(4, [
      'Slow language development in children is likely to prove disappointing to their parents.',
      'People’s expectations of what children should gain from education are universal.',
      'Scholars may discuss theories without fully understanding each other.',
    ]),
    matching(7, ['Hamiltonian', 'Jeffersonian', 'Jacksonian'], [
      'It is desirable for the same possibilities to be open to everyone.',
      'No section of society should have preferential treatment at the expense of another.',
      'People should only gain benefits on the basis of what they actually achieve.',
      'Variation in intelligence begins at birth.',
      'The more intelligent people should be in positions of power.',
      'Everyone can develop the same abilities.',
      'People of low intelligence are likely to lead uncontrolled lives.',
    ], { reuse: true, title: 'List of Theories', instruction: 'Look at the following statements (Questions 7–13) and the list of theories below. Match each statement with the correct theory, A, B or C. Write the correct letter, A, B or C, in boxes 7–13 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 1: 'B', 2: 'A', 3: 'D', 4: 'NOT GIVEN', 5: 'NO', 6: 'YES', 7: 'B', 8: 'C', 9: 'B', 10: 'A', 11: 'A', 12: 'C', 13: 'A' },
  expl: {
    1: ['Thông tin về việc giả định của người không làm khoa học về trí thông minh ảnh hưởng cách họ cư xử với người khác.', 'Section B',
      '“Job interviewers will make hiring decisions on the basis of their implicit theories of intelligence.”', 'Cha mẹ, người phỏng vấn, chọn bạn bè… đều dựa vào lý thuyết ngầm → B'],
    2: ['Nhắc tới sự thiếu rõ ràng trong định nghĩa trí thông minh.', 'Section A', '“but no one knows for certain what it actually is.”', 'Không ai biết chắc trí thông minh thực sự là gì → A'],
    3: ['Ý rằng lý thuyết ngầm và lý thuyết tường minh của nhà nghiên cứu có thể rất khác nhau.', 'Section D', '“If an investigation of implicit theories reveals little correspondence between the extant implicit and explicit theories”',
      '“little correspondence” = rất khác nhau → D'],
    4: ['Trẻ chậm phát triển ngôn ngữ có thể khiến cha mẹ thất vọng.', 'Section B', '“parents’ implicit theories of their children’s language development will determine at what ages they will be willing to make various corrections”',
      'Chỉ nói về thời điểm cha mẹ sửa lời nói của con; không nhắc sự thất vọng → NOT GIVEN'],
    5: ['Kỳ vọng của mọi người về những gì trẻ nên nhận được từ giáo dục là giống nhau ở mọi nơi.', 'Section E', '“How these expectations differ is in part a function of culture.”', 'Kỳ vọng khác nhau tùy văn hóa → không phổ quát → NO'],
    6: ['Các học giả có thể bàn lý thuyết mà không hiểu hết nhau.', 'Section J', '“they are likely to miss the point of what others are saying when discussing their explicit theories and their data.”', '“miss the point” = không hiểu nhau → YES'],
    7: ['Mọi người nên có cùng cơ hội như nhau.', 'Section H', '“The Jeffersonian view is that people should have equal opportunities”', 'Quan điểm Jefferson → B'],
    8: ['Không nhóm nào được ưu tiên hơn nhóm khác.', 'Section I', '“we do not need or want any institutions that might lead to favoring one group over another.”', 'Quan điểm Jackson → C'],
    9: ['Con người chỉ được hưởng lợi dựa trên những gì họ thực sự đạt được.', 'Section H', '“People are rewarded for what they accomplish, if given equal opportunity.”', 'Quan điểm Jefferson → B'],
    10: ['Sự khác biệt về trí thông minh bắt đầu từ lúc sinh ra.', 'Section G', '“people are born with different levels of intelligence”', 'Quan điểm Hamilton → A'],
    11: ['Người thông minh hơn nên nắm quyền.', 'Section G', '“those who are less intelligent need the good offices of the more intelligent to keep them in line”', 'Người thông minh hơn (quan chức, vua triết gia) quản người kém hơn → A'],
    12: ['Ai cũng có thể phát triển các khả năng như nhau.', 'Section I', '“people are essentially intersubstitutable except for specialized skills, all of which can be learned.”', 'Mọi kỹ năng đều học được → C'],
    13: ['Người kém thông minh có khả năng sống hỗn loạn.', 'Section G', '“Left to themselves, the unintelligent would create, as they always have created, a kind of chaos.”', 'Tự sống thì người kém thông minh tạo ra hỗn loạn → A'],
  },
};
