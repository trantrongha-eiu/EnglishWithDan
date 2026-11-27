// Cambridge IELTS 13 - Test 4 - Passage 2. Source: ieltsworldly.com (paragraph F letter was a stray heading), checked against the book key.
// Text fixes: "a solution to his problem" → this problem; "lad analyses" → lab analyses.
const { notes, endings, matching } = require('../../vr_build');
module.exports = {
  vol: 'cam13', book: 13, test: 4, part: 2, title: 'Saving the soil', text: 't4p2.txt',
  groups: [
    notes(14, 17, [
      'Healthy soil contains a large variety of bacteria and other microorganisms, as well as plant remains and __Q14__. It provides us with food and also with antibiotics, and its function in storing __Q15__ has a significant effect on the climate. In addition, it prevents damage to property and infrastructure because it holds __Q16__.',
      'If these microorganisms are lost, soil may lose its special properties. The main factor contributing to soil degradation is the __Q17__ carried out by humans.',
    ], { title: 'Why soil degradation could be a disaster for humans', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 14–17 on your answer sheet.' }),
    endings(18, [
      'may improve the number and quality of plants growing there.',
      'may contain data from up to nine countries.',
      'may not be put back into the soil.',
      'may help governments to be more aware of soil-related issues.',
      'may cause damage to different aspects of the environment.',
      'may be better for use at a global level.',
    ], [
      'Nutrients contained in the unused parts of harvested crops',
      'Synthetic fertilisers produced with the Haber-Bosch process',
      'Addition of a mixture developed by Pius Floris to the soil',
      'The idea of zero net soil degradation',
    ]),
    matching(22, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
      'a reference to one person’s motivation for a soil-improvement project',
      'an explanation of how soil stayed healthy before the development of farming',
      'examples of different ways of collecting information on soil degradation',
      'a suggestion for a way of keeping some types of soil safe in the near future',
      'a reason why it is difficult to provide an overview of soil degradation',
    ], { reuse: true, instruction: 'Reading Passage 2 has seven sections, A–G. Which section contains the following information? Write the correct letter, A–G, in boxes 22–26 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 14: 'minerals', 15: 'carbon', 16: 'water', 17: 'agriculture', 18: 'C', 19: 'E', 20: 'A', 21: 'D', 22: 'E', 23: 'C', 24: 'F', 25: 'G', 26: 'F' },
  expl: {
    14: ['Đất khỏe chứa nhiều vi khuẩn, vi sinh vật, xác thực vật và ___.', 'Đoạn B', '“living amid decomposing plants and various minerals.”', 'Vi sinh vật sống giữa xác thực vật phân hủy và các khoáng chất → minerals'],
    15: ['Chức năng lưu trữ ___ của đất ảnh hưởng lớn đến khí hậu.', 'Đoạn B', '“they lock in their carbon content, holding three times the amount of carbon as does the entire atmosphere.”', '“lock in … carbon” = lưu trữ carbon; chống biến đổi khí hậu → carbon'],
    16: ['Đất ngăn hư hại nhà cửa, hạ tầng vì nó giữ ___.', 'Đoạn B', '“Soils also store water, preventing flood damage”', '“store” = holds; đất trữ nước nên chống lũ → water'],
    17: ['Yếu tố chính gây suy thoái đất là ___ do con người thực hiện.', 'Đoạn C', '“Agriculture is by far the biggest problem.”', '“by far the biggest problem” = main factor; nông nghiệp → agriculture'],
    18: ['Dưỡng chất trong phần thừa của cây trồng đã thu hoạch…', 'Đoạn C', '“Humans tend not to return unused parts of harvested crops directly to the soil to enrich it”', 'Con người thường không trả phần thừa lại cho đất → có thể không được đưa trở lại đất → C'],
    19: ['Phân bón tổng hợp sản xuất bằng quy trình Haber-Bosch…', 'Đoạn D', '“Chemical fertilisers can release polluting nitrous oxide into the atmosphere and excess is often washed away with the rain, releasing nitrogen into rivers.”',
      'Gây ô nhiễm không khí, sông ngòi và làm hỏng chính đất = hại nhiều mặt của môi trường → E'],
    20: ['Bổ sung hỗn hợp do Pius Floris phát triển vào đất…', 'Đoạn E', '“a good crop of plants emerged that were not just healthy at the surface, but had roots strong enough to pierce dirt as hard as rock.”', 'Cây mọc nhiều và khỏe = cải thiện số lượng và chất lượng cây → A'],
    21: ['Ý tưởng “zero net land degradation”…', 'Đoạn G', '“it is an easily understood target that can help shape expectations and encourage action.”',
      'Mục tiêu dễ hiểu giúp truyền đạt vấn đề tới chính phủ và công chúng = giúp chính phủ quan tâm hơn → D'],
    22: ['Nhắc tới động lực của một người cho dự án cải thiện đất.', 'Đoạn E', '“He came to realise that the best way to ensure his trees flourished was to take care of the soil”', 'Pius Floris muốn cây của mình phát triển nên chăm sóc đất → E'],
    23: ['Giải thích đất giữ được màu mỡ thế nào trước khi có nông nghiệp.', 'Đoạn C', '“In the wild, when plants grow they remove nutrients from the soil, but then when the plants die and decay these nutrients are returned directly to the soil.”', 'Trong tự nhiên dưỡng chất được trả lại cho đất → C'],
    24: ['Ví dụ các cách thu thập thông tin về suy thoái đất.', 'Đoạn F', '“measurements from field surveys, drone surveys, satellite imagery, lab analyses and so on”', 'Khảo sát thực địa, drone, ảnh vệ tinh, phòng thí nghiệm → F'],
    25: ['Đề xuất giữ an toàn cho một số loại đất trong tương lai gần.', 'Đoạn G', '“Several researchers are agitating for the immediate creation of protected zones for endangered soils.”', 'Lập ngay các vùng bảo vệ đất đang bị đe dọa → G'],
    26: ['Lý do khó có cái nhìn tổng quan về suy thoái đất.', 'Đoạn F', '“For one thing, there is no agreed international system for classifying soil.”', 'Không có hệ thống phân loại đất thống nhất quốc tế → F'],
  },
};
