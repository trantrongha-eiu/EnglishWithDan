// Vol 7 - Test 11.pdf - Reading Passage 2 (PDF p5–9, text layer). Not in the bank; mini-ielts 1180 "Stress of Workplace"
// shares only 27% of the text (another version). Key = Key Test 11.pdf, checked against the passage; Q25 "a massage" also
// accepted without the article.
const { matching, mc, notes } = require('../../vr_build');
module.exports = {
  vol: 7, test: 11, part: 2, title: 'Stress Less', text: 't11p2.txt',
  groups: [
    matching(14, ['Neil Plumridge', 'Gal Zauberman and John Lynch', 'Jan Elsner', 'Tony LaMontagne'], [
      'High-level workers tend to react positively to stress.',
      'Stress levels are increased by trying to please customers.',
      'Support from other workers may relieve stress.',
      'Lack of independence at work is often responsible for stress.',
      'Workers commonly expect their workloads to lessen over time.',
    ], { title: 'List of People', reuse: true,
      instruction: 'Look at the following statements (Questions 14–18) and the list of people below. Match each statement with the correct person, A–D. Write the correct letter, A–D, in boxes 14–18 on your answer sheet. NB You may use any letter more than once.' }),
    mc(19, [
      ['Which of the following is NOT mentioned by Neil Plumridge as an indication that his workload is too heavy?', [
        'an inability to keep to his schedule', 'inattention to family celebrations', 'a lack of concentration on a task', 'a period of insufficient sleep']],
      ['Which method of lessening work stress is NOT suggested by Neil Plumridge?', [
        'rethinking ideas of what can be achieved', 'extending the deadline for completing the task', 'using more workers on a project', 'taking more time off for sport or other recreation']],
      ['According to Jan Elsner, meditation offers a method of', [
        'taking a worker\'s mind off his troubles.', 'changing physical response to stress.', 'resting more effectively.', 'encouraging executives to take breaks.']],
    ]),
    notes(22, 26, [
      'Statistics on workers\' compensation show that people take more time off work due to stress than for any other __Q22__ at work. On average, workers who take time off because of stress stay away for __Q23__. This absence comes at a high price – while the number of insurance claims due to stress amount to only __Q24__ of the total, they account for a much higher proportion of the cost of claims payments. Experts believe that seeking to relieve stress through physical therapies such as sport or __Q25__ may be less effective than simply reviewing your __Q26__.',
    ], { title: 'Stress: its effects and how to reduce it',
      instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 22–26 on your answer sheet.' }),
  ],
  key: { 14: 'C', 15: 'A', 16: 'A', 17: 'D', 18: 'B', 19: 'C', 20: 'D', 21: 'B', 22: 'injury', 23: '16.6 weeks', 24: '7%',
    25: 'a massage / massage', 26: 'workloads' },
  expl: {
    14: ['Người lao động cấp cao thường phản ứng tích cực với căng thẳng.', 'Đoạn G',
      '“Jan Elsner, a psychologist who specialises in executive coaching, says that doing well on a demanding workload is typical of senior executives.”',
      '“doing well on a demanding workload is typical of senior executives” = high-level workers react positively → C'],
    15: ['Mức căng thẳng tăng do cố làm hài lòng khách hàng.', 'Đoạn B',
      '“I\'ll promise a client that I\'ll do something tomorrow, and then I\'ll promise another client that I\'ll do the same thing, when I know it\'s not going to happen.”',
      'Plumridge tự gây căng thẳng vì hứa hẹn quá sức với khách hàng → A'],
    16: ['Sự hỗ trợ của đồng nghiệp có thể giảm căng thẳng.', 'Đoạn E',
      '“He also relies on the advice of colleagues, saying that his peers coach each other on business problems”',
      '“relies on the advice of colleagues” = support from other workers → A'],
    17: ['Thiếu tính tự chủ trong công việc thường là nguyên nhân gây căng thẳng.', 'Đoạn H',
      '“His recent research shows that the major predictor of stress is the level of job control a person has.”',
      'LaMontagne: mức kiểm soát công việc (autonomy) quyết định căng thẳng; việc khó + ít tự chủ là tệ nhất → D'],
    18: ['Người lao động thường kỳ vọng khối lượng công việc sẽ giảm theo thời gian.', 'Đoạn C',
      '“A study in the JOURNAL OF EXPERIMENTAL PSYCHOLOGY shows that people always believe that they will be less busy in the future.”',
      'Nghiên cứu của Zauberman và Lynch: người ta luôn nghĩ tương lai sẽ bớt bận → B'],
    19: ['Điều nào KHÔNG được Plumridge nêu như dấu hiệu quá tải?', 'Đoạn B',
      '“He knows he is doing too much when he gets less than six hours\' sleep for three consecutive nights, when he is constantly having to reschedule appointments, and when he misses a family birthday or anniversary.”',
      'Thiếu ngủ (D), dời lịch liên tục (A), lỡ sinh nhật gia đình (B) đều có; không nhắc mất tập trung → C'],
    20: ['Cách giảm căng thẳng nào KHÔNG được Plumridge gợi ý?', 'Đoạn E',
      '“Experts say the key to dealing with stress is not to focus on relief – a game of golf or a massage – but to reassess workloads. Neil Plumridge says he makes it a priority to work out what has to change: that might mean allocating extra staff to a job, allowing more time, or changing expectations.”',
      'Thêm nhân sự (C), thêm thời gian (B), thay đổi kỳ vọng (A) đều có; chơi golf/thư giãn bị xem là không phải chìa khóa → D'],
    21: ['Theo Jan Elsner, thiền là một cách để…', 'Đoạn G',
      '“She points to research showing that meditation can alter the biochemistry of the brain and the way that brains and bodies react to stress.”',
      '“alter … the way that brains and bodies react to stress” = changing physical response to stress → B'],
    22: ['Người ta nghỉ làm vì căng thẳng nhiều hơn bất kỳ ______ nào khác tại nơi làm việc.', 'Đoạn D',
      '“stress causes the most lost time of any workplace injury”',
      '“the most lost time of any workplace injury” → injury'],
    23: ['Trung bình, người nghỉ vì căng thẳng vắng mặt trong ______.', 'Đoạn D',
      '“employees suffering stress are absent from work for an average of 16.6 weeks.”',
      '“an average of 16.6 weeks” → 16.6 weeks'],
    24: ['Số yêu cầu bảo hiểm do căng thẳng chỉ chiếm ______ tổng số…', 'Đoạn D',
      '“claims for stress-related psychological injury accounted for 7% of insurance claims, but almost 27% of the amount paid out in claim payments.”',
      '7% số yêu cầu nhưng gần 27% tiền chi trả → 7%'],
    25: ['Giảm căng thẳng bằng liệu pháp thể chất như thể thao hoặc ______ có thể kém hiệu quả…', 'Đoạn E',
      '“the key to dealing with stress is not to focus on relief – a game of golf or a massage – but to reassess workloads.”',
      '“a game of golf” = sport; còn lại → a massage'],
    26: ['… hơn là đơn giản xem xét lại ______ của bạn.', 'Đoạn E',
      '“not to focus on relief – a game of golf or a massage – but to reassess workloads.”',
      '“reassess workloads” = reviewing your workloads → workloads'],
  },
};
