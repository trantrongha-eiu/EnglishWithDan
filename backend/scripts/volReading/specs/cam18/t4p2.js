// Cambridge IELTS 18 - Test 4 - Passage 2. Source: ieltsworldly.com, checked against the book key.
const { mc, matching, ynng } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 4, part: 2, title: 'The growth mindset', text: 't4p2.txt', lettered: false,
  groups: [
    mc(14, [
      ['What can we learn from the first paragraph?', ['where the notion of innate intelligence first began', 'when ideas about the nature of intelligence began to shift', 'how scientists have responded to changing views of intelligence', 'why thinkers turned away from the idea of intelligence being fixed']],
      ['The second paragraph describes how schools encourage students to', ['identify their personal ambitions.', 'help each other to realise their goals.', 'have confidence in their potential to succeed.', 'concentrate on where their particular strengths lie.']],
      ['In the third paragraph, the writer suggests that students with a fixed mindset', ['tend to be less competitive.', 'generally have a low sense of self-esteem.', 'will only work hard if they are given constant encouragement.', 'are afraid to push themselves beyond what they see as their limitations.']],
    ]),
    matching(17, ['Alfred Binet', 'Carol Dweck', 'Andrew Gelman', 'Timothy Bates', 'David Yeager and Gregory Walton'], [
      'The methodology behind the growth mindset studies was not strict enough.',
      'The idea of the growth mindset has been incorrectly interpreted.',
      'Intellectual ability is an unchangeable feature of each individual.',
      'The growth mindset should be promoted without students being aware of it.',
      'The growth mindset is not simply about boosting students’ morale.',
      'Research shows that the growth mindset has no effect on academic achievement.',
    ], { reuse: true, title: 'List of People', instruction: 'Look at the following statements (Questions 17–22) and the list of people below. Match each statement with the correct person or people, A–E. Write the correct letter, A–E, in boxes 17–22 on your answer sheet. NB You may use any letter more than once.' }),
    ynng(23, [
      'Dweck has handled criticisms of her work in an admirable way.',
      'Students’ self-perception is a more effective driver of self-confidence than actual achievement is.',
      'Recent evidence about growth mindset interventions has attracted unfair coverage in the media.',
      'Deliberate attempts to encourage students to strive for high achievement may have a negative effect.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 2? In boxes 23–26 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
  ],
  key: { 14: 'B', 15: 'C', 16: 'D', 17: 'C', 18: 'B', 19: 'A', 20: 'E', 21: 'B', 22: 'D', 23: 'YES', 24: 'NO', 25: 'NOT GIVEN', 26: 'YES' },
  expl: {
    14: ['Ta biết được gì từ đoạn đầu?', 'Đoạn 1', '“Then, in the early 20th century, progressive thinkers revolted against the notion that inherent ability is destiny.”', 'Đầu thế kỷ 20 quan niệm về trí thông minh bắt đầu thay đổi = khi nào ý tưởng đổi chiều → B'],
    15: ['Đoạn 2 mô tả trường học khuyến khích học sinh…', 'Đoạn 2', '“coaxing students away from seeing failure as an indication of their ability, and towards seeing it as a chance to improve that ability.”', '“Smart is something that you can get” = tin vào khả năng thành công của mình → C'],
    16: ['Ở đoạn 3, học sinh có tư duy cố định…', 'Đoạn 4', '“Meanwhile, the former took on only those tasks that would not risk their sense of worth.”', 'Chỉ nhận việc không đe dọa giá trị bản thân, sợ thất bại = sợ vượt giới hạn của mình → D'],
    17: ['Phương pháp nghiên cứu về tư duy phát triển chưa đủ chặt chẽ.', 'Đoạn 6', '“their research designs have enough degrees of freedom that they could take their data to support just about any theory at all”', 'Andrew Gelman → C'],
    18: ['Ý tưởng tư duy phát triển bị hiểu sai.', 'Đoạn 7', '“she argues that her work has been misunderstood and misapplied in a range of ways.”', 'Carol Dweck → B'],
    19: ['Trí tuệ là đặc điểm không thể thay đổi của mỗi người.', 'Đoạn 1', '“Psychologist Alfred Binet … was one of many 19th-century scientists who held that earlier view”', 'Quan điểm cũ: trí thông minh bẩm sinh, cố định – Alfred Binet → A'],
    20: ['Tư duy phát triển nên được khuyến khích mà học sinh không nhận ra.', 'Đoạn 8', '“interventions should be delivered in a subtle way to maximise their effectiveness.”', 'Can thiệp một cách tinh tế – Yeager và Walton → E'],
    21: ['Tư duy phát triển không chỉ là nâng tinh thần học sinh.', 'Đoạn 7', '“It’s not just a vehicle for making children feel good.”', 'Carol Dweck → B'],
    22: ['Nghiên cứu cho thấy tư duy phát triển không ảnh hưởng thành tích học tập.', 'Đoạn 6', '“Kids with the growth mindset aren’t getting better grades, either before or after our intervention study.”', 'Timothy Bates → D'],
    23: ['Dweck xử lý các lời chỉ trích một cách đáng khâm phục.', 'Đoạn 7', '“she deserves great credit for responding to it and adapting her work accordingly.”', '“deserves great credit” = đáng khen → YES'],
    24: ['Cách học sinh tự nhìn nhận thúc đẩy sự tự tin hiệu quả hơn thành tích thực tế.', 'Đoạn 9', '“the actual effect of achievement on self-perception is stronger than the other way round.”', 'Thành tích ảnh hưởng mạnh hơn → NO'],
    25: ['Bằng chứng gần đây bị truyền thông đưa tin thiếu công bằng.', 'Đoạn 10', '“Recent evidence would suggest that growth mindset interventions are not the elixir of student learning that its proponents claim it to be.”', 'Không nhắc tới truyền thông → NOT GIVEN'],
    26: ['Cố tình khuyến khích học sinh phấn đấu có thể phản tác dụng.', 'Đoạn 10', '“Paradoxically, however, that aspiration is not well served by direct interventions that try to instil it.”', 'Can thiệp trực tiếp không giúp được, thậm chí phản tác dụng → YES'],
  },
};
