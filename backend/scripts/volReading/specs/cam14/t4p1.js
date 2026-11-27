// Cambridge IELTS 14 - Test 4 - Passage 1. Source: ieltsworldly.com, checked against the book key.
// Text fixes: "workers ants", "responded do light", "95-day-ole", "what was more, he old ants", "Proceeding of".
const { notes, tfng } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 4, part: 1, title: 'The secret of staying young', text: 't4p1.txt', lettered: false,
  groups: [
    notes(1, 8, [
      'Focused on a total of __Q1__ different age groups of ants, analysing',
      '<strong>Behaviour:</strong>',
      '• how well ants looked after their __Q2__',
      '• their ability to locate __Q3__ using a scent trail',
      '• the effect that __Q4__ had on them',
      '• how __Q5__ they attacked prey',
      '<strong>Brains:</strong>',
      '• comparison between age and the __Q6__ of dying cells in the brains of ants',
      '• condition of synaptic complexes (areas in which __Q7__ meet) in the brain’s ‘mushroom bodies’',
      '• level of two __Q8__ in the brain associated with ageing',
    ], { title: 'Pheidole dentata', instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 1–8 on your answer sheet.' }),
    tfng(9, [
      'Pheidole dentata ants are the only known animals which remain active for almost their whole lives.',
      'Ysabel Giraldo was the first person to study Pheidole dentata ants using precise data about the insects’ ages.',
      'The ants in Giraldo’s experiments behaved as she had predicted that they would.',
      'The recent studies of bees used different methods of measuring age-related decline.',
      'Pheidole dentata ants kept in laboratory conditions tend to live longer lives.',
    ]),
  ],
  key: { 1: 'four/4', 2: 'young', 3: 'food', 4: 'light', 5: 'aggressively', 6: 'location', 7: 'neurons', 8: 'chemicals', 9: 'FALSE', 10: 'TRUE', 11: 'FALSE', 12: 'NOT GIVEN', 13: 'TRUE' },
  expl: {
    1: ['Tập trung vào tổng cộng ___ nhóm tuổi kiến khác nhau.', 'Đoạn 3', '“Giraldo focused on ants at four age ranges”', 'Bốn khoảng tuổi (20–22, 45–47, 95–97, 120–122 ngày) → four'],
    2: ['Kiến chăm sóc ___ của chúng tốt thế nào.', 'Đoạn 4', '“Giraldo watched how well the ants took care of the young of the colony”', '“took care of” = looked after; kiến non của đàn → young'],
    3: ['Khả năng tìm ___ nhờ vệt mùi.', 'Đoạn 4', '“followed the telltale scent that the insects usually leave to mark a trail to food.”', 'Vệt mùi dẫn tới thức ăn → food'],
    4: ['Tác động của ___ lên chúng.', 'Đoạn 4', '“She tested how ants responded to light”', 'Phản ứng với ánh sáng → light'],
    5: ['Chúng tấn công con mồi ___ thế nào.', 'Đoạn 5', '“the older ants attacked the poor fruit fly just as aggressively as the young ones did”', 'Mức độ hung hăng khi tấn công → aggressively'],
    6: ['So sánh tuổi với ___ của tế bào sắp chết trong não.', 'Đoạn 6', '“nor was there any difference in the location of the dying cells”', 'Vị trí các tế bào sắp chết → location'],
    7: ['Phức hợp synap (nơi các ___ gặp nhau).', 'Đoạn 6', '“synaptic complexes within these structures – regions where neurons come together.”', '“come together” = meet; các nơ-ron → neurons'],
    8: ['Mức hai ___ trong não gắn với lão hóa.', 'Đoạn 6', '“serotonin or dopamine – brain chemicals whose decline often coincides with aging.”', 'Serotonin và dopamine là hóa chất não → chemicals'],
    9: ['Kiến Pheidole dentata là loài duy nhất được biết vẫn năng động gần như suốt đời.', 'Đoạn 2', '“Naked mole rats can live for almost 30 years and stay fit for nearly their entire lives.”',
      'Chuột chũi trụi lông cũng khỏe mạnh gần suốt đời → không phải duy nhất → FALSE'],
    10: ['Ysabel Giraldo là người đầu tiên nghiên cứu loài kiến này với dữ liệu tuổi chính xác.', 'Đoạn 3', '“Unlike all previous studies, which only estimated how old the ants were, her work tracked the ants from the time the pupae became adults, so she knew their exact ages.”',
      'Các nghiên cứu trước chỉ ước lượng tuổi; bà là người đầu tiên biết tuổi chính xác → TRUE'],
    11: ['Kiến trong thí nghiệm hành xử đúng như bà dự đoán.', 'Đoạn 5', '“Giraldo expected the older ants to perform poorly in all these tasks.”', 'Bà nghĩ kiến già sẽ kém nhưng chúng làm tốt → FALSE'],
    12: ['Các nghiên cứu gần đây về ong dùng phương pháp khác để đo sự suy giảm theo tuổi.', 'Đoạn 7', '“the results of recent bee studies were mixed”', 'Chỉ nói kết quả lẫn lộn; không nói về phương pháp đo → NOT GIVEN'],
    13: ['Kiến nuôi trong phòng thí nghiệm có xu hướng sống lâu hơn.', 'Đoạn 8', '“Out in the wild, the ants probably don’t live for a full 140 days thanks to predators, disease and just being in an environment that’s much harsher than the comforts of the lab.”',
      'Ngoài tự nhiên có lẽ không sống đủ 140 ngày như trong phòng thí nghiệm → TRUE'],
  },
};
