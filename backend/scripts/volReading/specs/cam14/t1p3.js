// Cambridge IELTS 14 - Test 1 - Passage 3. Source: ieltsworldly.com, checked against the book key.
// Text fix: "while simultaneously high levels" → "while simultaneously maintaining high levels".
const { matching, ynng, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 1, part: 3, title: 'Motivational factors and the hospitality industry', text: 't1p3.txt', lettered: false,
  groups: [
    matching(27, ['Pfeffer', 'Lucas', 'Maroudas et al.', 'Ng and Sorensen', 'Enz and Siguaw', 'Deery'], [
      'Hotel managers need to know what would encourage good staff to remain.',
      'The actions of managers may make staff feel they shouldn’t move to a different employer.',
      'Little is done in the hospitality industry to help workers improve their skills.',
      'Staff are less likely to change jobs if cooperation is encouraged.',
      'Dissatisfaction with pay is not the only reason why hospitality workers change jobs.',
    ], { reuse: true, title: 'List of Researchers', instruction: 'Look at the following statements (Questions 27–31) and the list of researchers below. Match each statement with the correct researcher, A–F. Write the correct letter, A–F, in boxes 27–31 on your answer sheet. NB You may use any letter more than once.' }),
    ynng(32, [
      'One reason for high staff turnover in the hospitality industry is poor morale.',
      'Research has shown that staff have a tendency to dislike their workplace.',
      'An improvement in working conditions and job security makes staff satisfied with their jobs.',
      'Staff should be allowed to choose when they take breaks during the working day.',
    ]),
    notes(36, 40, [
      'Tews, Michel and Stafford carried out research on staff in an American chain of __Q36__. They discovered that activities designed for staff to have fun improved their __Q37__, and that management involvement led to lower staff __Q38__. They also found that the activities needed to fit with both the company’s __Q39__ and the __Q40__ of the staff. A balance was required between a degree of freedom and maintaining work standards.',
    ], { title: 'Fun at work', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 36–40 on your answer sheet.' }),
  ],
  key: { 27: 'E', 28: 'D', 29: 'B', 30: 'D', 31: 'C', 32: 'YES', 33: 'NO', 34: 'NO', 35: 'NOT GIVEN', 36: 'restaurants', 37: 'performance', 38: 'turnover', 39: 'goals', 40: 'characteristics' },
  expl: {
    27: ['Quản lý khách sạn cần biết điều gì khuyến khích nhân viên giỏi ở lại.', 'Đoạn 8', '“This requires an understanding of what motivates employees at different levels of management and different stages of their careers (Enz and Siguaw, 2000).”',
      'Cần hiểu điều gì tạo động lực để giữ chân nhân viên giỏi → Enz and Siguaw → E'],
    28: ['Hành động của quản lý có thể khiến nhân viên thấy không nên chuyển sang chủ khác.', 'Đoạn 5', '“employees feel more obligated to stay with the company.”',
      'Ng and Sorensen: khi quản lý ghi nhận, động viên, gỡ trở ngại thì nhân viên thấy có nghĩa vụ ở lại → D'],
    29: ['Ngành khách sạn ít làm gì để giúp nhân viên nâng cao kỹ năng.', 'Đoạn 3', '“the hospitality industry has historically been dominated by underdeveloped HR practices (Lucas, 2002).”',
      'Thực tiễn nhân sự kém phát triển dù đào tạo nhân viên quan trọng → Lucas → B'],
    30: ['Nhân viên ít đổi việc hơn nếu sự hợp tác được khuyến khích.', 'Đoạn 5', '“motivate employees to work together”', '“work together” = cooperation; nghiên cứu của Ng and Sorensen → D'],
    31: ['Không hài lòng về lương không phải lý do duy nhất khiến nhân viên ngành khách sạn đổi việc.', 'Đoạn 4',
      '“Among the many cited reasons are low compensation, inadequate benefits, poor working conditions and compromised employee morale and attitudes (Maroudas et al., 2008).”',
      'Ngoài lương thấp còn nhiều lý do khác → Maroudas et al. → C'],
    32: ['Một lý do khiến nhân viên ngành khách sạn nghỉ việc nhiều là tinh thần kém.', 'Đoạn 4', '“compromised employee morale and attitudes”', 'Tinh thần bị ảnh hưởng là một trong các lý do được nêu → YES'],
    33: ['Nghiên cứu cho thấy nhân viên có xu hướng không thích nơi làm việc.', 'Đoạn 6',
      '“could be affected by a predisposition to view their work environment negatively, no evidence exists to support this hypothesis”', 'Không có bằng chứng ủng hộ giả thuyết này → NO'],
    34: ['Cải thiện điều kiện làm việc và sự ổn định công việc khiến nhân viên hài lòng.', 'Đoạn 9', '“just fulfilling these needs does not result in satisfaction, but only in the reduction of dissatisfaction”',
      'Đáp ứng các yếu tố này chỉ giảm sự bất mãn, không tạo ra sự hài lòng → NO'],
    35: ['Nhân viên nên được tự chọn khi nào nghỉ giải lao trong ngày.', 'Đoạn 12', '“allowing adequate breaks during the working day”', 'Chỉ nói nên cho nghỉ giải lao đầy đủ; không nói nhân viên có được tự chọn thời điểm → NOT GIVEN'],
    36: ['Nghiên cứu nhân viên của một chuỗi ___ ở Mỹ.', 'Đoạn 11', '“focusing on staff from a chain of themed restaurants in the United States.”', 'Chuỗi nhà hàng theo chủ đề → restaurants'],
    37: ['Hoạt động vui chơi cải thiện ___ của nhân viên.', 'Đoạn 11', '“fun activities had a favorable impact on performance”', 'Tác động tốt lên hiệu suất làm việc → performance'],
    38: ['Sự ủng hộ của quản lý giúp giảm ___ nhân viên.', 'Đoạn 11', '“manager support for fun had a favorable impact in reducing turnover.”', 'Giảm tỷ lệ nghỉ việc → turnover'],
    39: ['Hoạt động cần phù hợp với ___ của công ty…', 'Đoạn 11', '“must be carefully aligned with both organizational goals and employee characteristics.”', '“organizational goals” = mục tiêu của công ty → goals'],
    40: ['…và ___ của nhân viên.', 'Đoạn 11', '“must be carefully aligned with both organizational goals and employee characteristics.”', '“employee characteristics” = đặc điểm của nhân viên → characteristics'],
  },
};
