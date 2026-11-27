// Cambridge IELTS 14 - Test 2 - Passage 2. Source: ieltsworldly.com, checked against the book key. Summary typo "suffering form" → from.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 2, part: 2, title: 'Back to the future of skyscraper design', text: 't2p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], [
      'why some people avoided hospitals in the 19th century',
      'a suggestion that the popularity of tall buildings is linked to prestige',
      'a comparison between the circulation of air in a 19th-century building and modern standards',
      'how Short tested the circulation of air in a 19th-century building',
      'an implication that advertising led to the large increase in the use of air conditioning',
    ], { instruction: 'Reading Passage 2 has nine sections, A–I. Which section contains the following information? Write the correct letter, A–I, in boxes 14–18 on your answer sheet.' }),
    notes(19, 26, [
      'Professor Alan Short examined the work of John Shaw Billings, who influenced the architectural __Q19__ of hospitals to ensure they had good ventilation. He calculated that __Q20__ in the air coming from patients suffering from __Q21__ would not have harmed other patients. He also found that the air in __Q22__ in hospitals could change as often as in a modern operating theatre. He suggests that energy use could be reduced by locating more patients in __Q23__ areas.',
      'A major reason for improving ventilation in 19th-century hospitals was the demand from the __Q24__ for protection against bad air, known as __Q25__. These were blamed for the spread of disease for hundreds of years, including epidemics of __Q26__ in London and Paris in the middle of the 19th century.',
    ], { title: 'Ventilation in 19th-century hospital wards', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 19–26 on your answer sheet.' }),
  ],
  key: { 14: 'F', 15: 'C', 16: 'E', 17: 'D', 18: 'B', 19: 'design/designs', 20: 'pathogens', 21: 'tuberculosis', 22: 'wards', 23: 'communal', 24: 'public', 25: 'miasmas', 26: 'cholera' },
  expl: {
    14: ['Vì sao một số người tránh bệnh viện vào thế kỷ 19.', 'Đoạn F', '“Foul air, rather than germs, was believed to be the main driver of ‘hospital fever’, leading to disease and frequent death. The prosperous steered clear of hospitals.”',
      'Người giàu tránh bệnh viện vì sợ “không khí độc” gây bệnh và tử vong → F'],
    15: ['Gợi ý rằng sự ưa chuộng nhà cao tầng gắn với uy tín, địa vị.', 'Đoạn C', '“Short regards glass, steel and air-conditioned skyscrapers as symbols of status”', '“symbols of status” = prestige → C'],
    16: ['So sánh sự lưu thông không khí ở tòa nhà thế kỷ 19 với tiêu chuẩn hiện đại.', 'Đoạn E', '“that’s similar to the performance of a modern-day, computer-controlled operating theatre.”', 'Phòng bệnh thế kỷ 19 thay khí 24 lần/giờ, tương đương phòng mổ hiện đại → E'],
    17: ['Cách Short kiểm tra sự lưu thông không khí ở một tòa nhà thế kỷ 19.', 'Đoạn D', '“We spent three years digitally modelling Billings’ final designs,”', 'Mô phỏng số các thiết kế của Billings, thả mầm bệnh vào luồng khí → D'],
    18: ['Ngụ ý quảng cáo dẫn đến việc dùng điều hòa tăng mạnh.', 'Đoạn B', '“which were ‘relentlessly and aggressively marketed’ by their inventors.”', 'Điều hòa được tiếp thị ráo riết = quảng cáo khiến nó phổ biến → B'],
    19: ['Billings ảnh hưởng tới ___ kiến trúc của bệnh viện.', 'Đoạn D', '“including the design of ingeniously ventilated hospitals.”', 'Thiết kế bệnh viện thông gió → design'],
    20: ['Ông tính rằng ___ trong không khí từ bệnh nhân sẽ không hại người khác.', 'Đoạn D', '“We put pathogens in the airstreams”', 'Thả mầm bệnh vào luồng khí để mô phỏng → pathogens'],
    21: ['…bệnh nhân mắc ___.', 'Đoạn D', '“modelled for someone with tuberculosis (TB) coughing in the wards”', 'Bệnh nhân lao (TB) ho trong phòng bệnh → tuberculosis'],
    22: ['Không khí trong ___ bệnh viện có thể thay đổi thường xuyên như phòng mổ hiện đại.', 'Đoạn E', '“We discovered that 19th-century hospital wards could generate up to 24 air changes an hour”', 'Các phòng bệnh (wards) thay khí 24 lần/giờ → wards'],
    23: ['Có thể giảm năng lượng bằng cách xếp nhiều bệnh nhân hơn vào khu ___.', 'Đoạn E', '“Communal wards appropriate for certain patients … would work just as well in today’s hospitals, at a fraction of the energy cost.”', 'Phòng bệnh chung tốn ít năng lượng → communal'],
    24: ['Lý do chính là đòi hỏi từ ___ muốn được bảo vệ khỏi không khí xấu.', 'Đoạn F', '“was driven by a panicked public clamouring for buildings that could protect against”', '“clamouring for” = demand; công chúng hoảng sợ → public'],
    25: ['…không khí xấu, được gọi là ___.', 'Đoạn F', '“the lethal threat of miasmas – toxic air that spread disease.”', '“toxic air” = bad air; miasmas → miasmas'],
    26: ['…bao gồm các dịch ___ ở London và Paris giữa thế kỷ 19.', 'Đoạn F', '“right through to the cholera outbreaks in London and Paris during the 1850s.”', '“outbreaks” = epidemics; dịch tả những năm 1850 → cholera'],
  },
};
