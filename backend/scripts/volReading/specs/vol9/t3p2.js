// Vol 9 - READING/TEST 3-R.docx - Passage 2 (typed docx). Not in the bank / mini-ielts. Key = KEY TEST 3-R.docx.
// The docx prints a "14___" box above each of the six unlettered paragraphs ("has seven paragraphs" is a slip) → A–F.
// Headings list typos: "well – designed" → well-designed, "feeback" → feedback.
// Summary: the docx puts the Q25 gap after "as they" and leaves "without much    ." empty; key 25 = supervision
// ("under minimal supervision") → gap moved to "without much __Q25__".
// Key fixes: Q16 ii ("attract the best staff" – nothing in paragraph C) → vi (24 office workers came to the lab = assessed
// outside their usual workplaces); no online key found. Q23 key A (Allen's study) — the sentence "indoor air quality can
// significantly lower cognitive performance" is Zimring's comment on it → accept "A / B".
const { headings, matching, notes } = require('../../vr_build');
module.exports = {
  vol: 9, test: 3, part: 2, title: 'Healthy buildings, productive people', text: 't3p2.txt',
  groups: [
    headings(14, [
      'The effects of a new environmentally friendly building on the people who work there',
      'The ability of well-designed workplaces to attract the best staff',
      'The assessment of workplaces in several locations',
      'The low priority given to making buildings healthy for users',
      'Achieving design efficiency by involving a range of specialists',
      'Workers were assessed outside of their usual workplaces',
      'Workplace changes based on worker feedback',
      'The financial benefits of efficient workplaces',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'],
    { instruction: 'Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 14–19 on your answer sheet.' }),
    matching(20, ['Joseph Allen', 'Craig Zimring', 'Piers MacNaughton', 'Amy Eyler'], [
      'Further investigations will result in improved wellbeing and efficiency.',
      'A person\'s opinion of their workspace may influence how well they perform at work.',
      'The design of a workplace can have an impact on how much staff work with their colleagues.',
      'A worker\'s mental capacity may be considerably reduced due to their working environment.',
    ], { title: 'List of Researchers', reuse: true,
      instruction: 'Look at the following statements (Questions 20–23) and the list of researchers below. Match each statement with the correct researcher, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 20–23 on your answer sheet. NB You may use any letter more than once.' }),
    notes(24, 26, [
      'Allen\'s first study was done at the Syracuse Center, which focuses on researching __Q24__. In this study, a complex ventilation system was used to control the airflow in the simulated workplace. All staff carried out normal duties during the day without much __Q25__. Later in the day participants were assessed as they performed tasks which required them to play a role, for example acting as __Q26__ while dealing with practical problems.',
    ], { title: 'Harvard study published in Environmental Health Perspectives',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'iv', 15: 'viii', 16: 'vi', 17: 'iii', 18: 'i', 19: 'v', 20: 'B', 21: 'C', 22: 'D', 23: 'A / B',
    24: 'sustainability', 25: 'supervision', 26: 'mayor' },
  expl: {
    14: ['Đoạn A', 'Đoạn A',
      '“builders in general have paid little attention to the health aspects of indoor spaces, instead focusing on superficial design features and on meeting minimum environmental standards to keep costs down.”',
      'Các nhà xây dựng ít quan tâm đến sức khỏe người dùng tòa nhà → iv The low priority given to making buildings healthy for users'],
    15: ['Đoạn B', 'Đoạn B',
      '“the cost of making alterations that could boost cognitive performance significantly was minuscule compared with the related increase in productivity – about $40 per person, per year, compared with a $6,500 increase in employee productivity.”',
      'Chi phí cải tạo rất nhỏ so với năng suất tăng thêm → lợi ích tài chính → viii The financial benefits of efficient workplaces'],
    16: ['Đoạn C', 'Đoạn C',
      '“For six days over two weeks, 24 office workers with administrative, technical, professional or managerial jobs came to the lab and performed their regular work”',
      'Nhân viên đến phòng thí nghiệm để làm việc và làm bài kiểm tra nhận thức = được đánh giá bên ngoài nơi làm việc thường ngày. (Key đề in ii “thu hút nhân viên giỏi nhất” – đoạn C không nhắc) → vi Workers were assessed outside of their usual workplaces'],
    17: ['Đoạn D', 'Đoạn D',
      '“they compared test scores of 109 people working in 10 buildings – about 12 people per site – in two buildings in each of five cities.”',
      'So sánh nơi làm việc ở 10 tòa nhà thuộc 5 thành phố → iii The assessment of workplaces in several locations'],
    18: ['Đoạn E', 'Đoạn E',
      '“Hillman Hall was designed with the highest environmental and energy standards available” … “Results showed that people were more likely to take part in spontaneous collaborations in the new space than in the older ones, and to be physically active.”',
      'Tòa nhà xanh mới và tác động của nó lên người làm việc trong đó → i The effects of a new environmentally friendly building on the people who work there'],
    19: ['Đoạn F', 'Đoạn F',
      '“Eyler sees multidisciplinary collaboration as the key to success.” … “Complex projects like this one need teams of people with varied backgrounds and expertise in order to solve them,”',
      'Thành công nhờ hợp tác của nhiều chuyên gia khác nhau (quản lý, y tế công cộng, kiến trúc sư) → v Achieving design efficiency by involving a range of specialists'],
    20: ['Các nghiên cứu tiếp theo sẽ giúp cải thiện sức khỏe và hiệu suất.', 'Đoạn C',
      '“If these findings are replicated in other labs and in real-world work environments,” … “they could lead to designs that provide much more outside air through mechanical ventilation or operable windows, for example” – in turn, promoting better health and performance.',
      'Zimring: nếu kết quả được lặp lại ở các nghiên cứu khác thì sẽ dẫn đến thiết kế giúp sức khỏe và hiệu suất tốt hơn → B'],
    21: ['Ý kiến của một người về nơi làm việc có thể ảnh hưởng đến hiệu quả công việc của họ.', 'Đoạn D',
      '“other factors, such as how someone feels about their working environment, may also play a part, notes Harvard research fellow Piers MacNaughton”',
      '“how someone feels about their working environment” = opinion of their workspace → C'],
    22: ['Thiết kế nơi làm việc có thể ảnh hưởng đến mức độ nhân viên làm việc cùng đồng nghiệp.', 'Đoạn E',
      '“Results showed that people were more likely to take part in spontaneous collaborations in the new space than in the older ones”',
      'Nghiên cứu của Amy Eyler: trong tòa nhà mới, người ta hợp tác tự phát nhiều hơn → D'],
    23: ['Năng lực trí óc của người lao động có thể bị giảm đáng kể do môi trường làm việc.', 'Đoạn B–C',
      '“Researchers at Harvard University in the US looked at the effects of indoor air quality on workers\' cognitive performance” … “indoor air quality can significantly lower cognitive performance in buildings that would otherwise meet current building standards, notes environmental psychologist Craig Zimring”',
      'Joseph Allen là người chủ trì nghiên cứu về ảnh hưởng của chất lượng không khí lên năng lực nhận thức (key đề); câu “significantly lower cognitive performance” là nhận xét của Zimring về kết quả đó nên B cũng được chấp nhận → A'],
    24: ['Nghiên cứu đầu tiên của Allen thực hiện tại Trung tâm Syracuse, nơi chuyên nghiên cứu về ______.', 'Đoạn C',
      '“the Syracuse Center of Excellence, a US research organization devoted to studying and developing sustainability.”',
      '“devoted to studying … sustainability” → sustainability'],
    25: ['Nhân viên làm công việc bình thường trong ngày mà không có nhiều ______.', 'Đoạn C',
      '“came to the lab and performed their regular work under minimal supervision”',
      '“under minimal supervision” = without much supervision → supervision'],
    26: ['… đóng vai, ví dụ làm ______ trong khi giải quyết các vấn đề thực tế.', 'Đoạn C',
      '“The cognitive tasks used in the study had participants respond to online scenarios that mimic real-life situations, such as running a city as a mayor.”',
      '“running a city as a mayor” → mayor'],
  },
};
