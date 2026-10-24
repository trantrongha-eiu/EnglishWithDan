// Vol 5 - Reading/Test 8/TEST 8-up.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. Text = PDF (typed scan;
// the watermark garbles the OCR — read against the page images; Ned H. Kalin, Scientific American). Typos fixed: "terror of
// strange" → strangers, "to emit harsh" → a harsh. Key = Test 8/explanation - 8.pdf (typed), checked against the passage: all
// correct.
const { mc, matching, notes } = require('../../vr_build');
module.exports = {
  vol: 5, test: 8, part: 3, title: 'The Analysis of Fear', text: 't8p3.txt',
  groups: [
    mc(27, [
      ['In the first paragraph, the writer points out that', [
        'fear and stress are different feelings.', 'most humans develop strategies for dealing with fear.',
        'business situations cause more fear than others.', 'some people never experience fear.']],
      ['When discussing the use of rhesus monkeys as experimental subjects, the writer notes that', [
        'they react more quickly to fear than humans.', 'they are more influenced by fear than humans.',
        'their mental growth resembles that of humans.', 'their brains work more slowly than those of humans.']],
      ['Which of the following did Kalin and Shelton outline as the second stage in their research project?', [
        'the identification of expressions of anxiety in monkeys', 'the identification of situations that arouse stress in monkeys',
        'an analysis of brain development in monkeys', 'the study of reactions to fear in monkeys of different ages']],
      ['In the fourth paragraph, the writer notes that the three related situations', [
        'reflect common experiences for infant humans and monkeys.', 'highlight the similarities between monkey and human infant care.',
        'were predicted to cause monkeys more distress than human infants.', 'were graded in terms of their potential effect on young monkeys.']],
    ]),
    matching(31, ['the alone condition', 'the no-eye-contact condition', 'the stare condition'], [
      'aggressive facial expression',
      'prolonged stillness',
      'a combination of contradictory signals',
      'appeals for maternal protection',
      'the production of soft sounds',
    ], { title: 'List of Conditions', reuse: true,
      instruction: 'Look at the following responses of monkeys (Questions 31–35) and the list of conditions below. Match each response with the correct condition, A, B or C. Write the correct letter, A, B or C, in boxes 31–35 on your answer sheet. NB You may use any letter more than once.' }),
    notes(36, 40, [
      'Once they had identified three types of defensive behaviour, Kalin and Shelton grouped the monkeys according to their __Q36__, in order to discover precisely when they were able to respond appropriately to different fear-related cues. They videotaped their results and found that monkeys as young as __Q37__ reacted to the cues but in a haphazard fashion. The researchers noted that they seemed to be unaware of the __Q38__ who were around them. Despite demonstrating __Q39__, the monkeys in the middle groups failed to react in ways corresponding to the experimental situation. The oldest group, however, reacted in the same way as __Q40__ and the researchers concluded that monkeys are capable of selective responding between nine and 12 weeks old.',
    ], { instruction: 'Complete the summary below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 36–40 on your answer sheet.' }),
  ],
  key: { 27: 'B', 28: 'C', 29: 'D', 30: 'A', 31: 'C', 32: 'B', 33: 'C', 34: 'A', 35: 'A', 36: 'age',
    37: 'two weeks old / 2 weeks old / two weeks', 38: 'human beings', 39: 'good motor control', 40: 'mature monkeys' },
  free: ['2 weeks old'],
  expl: {
    27: ['Ở đoạn 1, tác giả chỉ ra rằng', 'Đoạn 1',
      '“Over the years, the majority of people acquire a range of skills for coping with frightening situations.”',
      '“the majority of people acquire a range of skills for coping” = most humans develop strategies → B'],
    28: ['Khi bàn về việc dùng khỉ rhesus làm đối tượng thí nghiệm, tác giả lưu ý rằng', 'Đoạn 2',
      '“These animals undergo many of the same physiological and psychological developmental stages that humans do, but in a more compressed time span.”',
      'Trải qua các giai đoạn phát triển tâm lý giống người = mental growth resembles that of humans → C'],
    29: ['Bước thứ hai trong kế hoạch nghiên cứu của Kalin và Shelton là', 'Đoạn 3',
      '“they would first have to find cues that elicit fear and identify behaviors that reflect different types of anxiety. With such information in hand, they could then proceed to determine the age at which monkeys begin to match defensive behaviors selectively to specific cues.”',
      'Bước 1: tìm tác nhân và hành vi; bước 2 (“then”): xác định ở tuổi nào khỉ phản ứng đúng = nghiên cứu phản ứng ở khỉ các độ tuổi → D'],
    30: ['Ở đoạn 4, tác giả lưu ý rằng ba tình huống liên quan', 'Đoạn 4',
      '“These positions are no more frightening than those that primates encounter frequently in the wild, or those that human infants encounter every time they are left at a day-care center.”',
      'Khỉ gặp thường xuyên ngoài tự nhiên, trẻ em gặp khi gửi nhà trẻ = trải nghiệm phổ biến của cả hai → A'],
    31: ['Nét mặt hung hăng', 'Đoạn 5',
      '“So the stare condition evoked a third set of responses. The monkeys made several hostile gestures: barking … and staring back.”',
      '“hostile gestures … staring back” = aggressive facial expression → the stare condition → C'],
    32: ['Bất động kéo dài', 'Đoạn 5',
      '“in the more frightening no-eye-contact situation, the monkeys reduced their activity greatly and sometimes froze for extended periods of time.”',
      '“froze for extended periods” = prolonged stillness → the no-eye-contact condition → B'],
    33: ['Kết hợp các tín hiệu trái ngược nhau', 'Đoạn 5',
      '“Sometimes the animals mixed the threatening displays with submissive ones, such as fear grimaces”',
      'Đe doạ + phục tùng = contradictory signals (ở tình huống bị nhìn chằm chằm) → C'],
    34: ['Kêu gọi sự che chở của mẹ', 'Đoạn 5',
      '“when an infant monkey is separated from its mother, it yearns to regain the closeness and security provided by nearness to the parent. These responses help to draw the mother\'s attention.”',
      'Khi bị để một mình, khỉ con kêu để thu hút sự chú ý của mẹ → the alone condition → A'],
    35: ['Phát ra âm thanh nhẹ', 'Đoạn 5',
      '“In the alone condition, most monkeys became very active and emitted frequent gentle \'coo\' calls made with pursed lips.”',
      '“gentle coo calls” = soft sounds → the alone condition → A'],
    36: ['Kalin và Shelton chia khỉ thành nhóm theo ______.', 'Đoạn 6',
      '“they examined four groups of infant monkeys ranging in age up to 12 weeks old.”',
      'Bốn nhóm theo độ tuổi → age'],
    37: ['Khỉ nhỏ chỉ ______ đã phản ứng với tác nhân nhưng một cách lộn xộn.', 'Đoạn 6',
      '“the infants in the youngest group (no more than two weeks old) engaged in defensive behaviors. But they lacked some motor control and seemed to act randomly”',
      '“act randomly” = haphazard → two weeks old'],
    38: ['Chúng dường như không nhận ra ______ ở xung quanh.', 'Đoạn 6',
      '“as if they had not noticed the human beings that were present.”',
      '“had not noticed” = unaware of → human beings'],
    39: ['Dù thể hiện ______, khỉ ở các nhóm giữa không phản ứng phù hợp với tình huống.', 'Đoạn 6',
      '“Babies in the two intermediate-age groups had good motor control, but their actions seemed unrelated to the test condition.”',
      '“intermediate-age groups” = middle groups → good motor control'],
    40: ['Nhóm lớn nhất phản ứng giống như ______.', 'Đoạn 6',
      '“their reactions were both appropriate and identical to those of mature monkeys.”',
      '“identical to” = the same way as → mature monkeys'],
  },
};
