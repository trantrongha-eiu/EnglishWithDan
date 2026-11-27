// Cambridge IELTS 18 - Test 2 - Passage 3. Source: ieltsworldly.com, checked against the book key. Text fix: OCR "modem" → modern (4×).
const { tfng, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 2, part: 3, title: 'An ideal city', text: 't2p3.txt', lettered: false,
  groups: [
    tfng(27, [
      'People first referred to Leonardo da Vinci as a genius 500 years ago.',
      'The current climate crisis is predicted to cause more deaths than the plague.',
      'Some of the challenges we face today can be compared to those of earlier times.',
      'Leonardo da Vinci’s ‘ideal city’ was constructed in the 15th century.',
      'Poor town planning is a major contributor to climate change.',
      'In Renaissance times, local people fought against the changes to Pienza and Ferrara.',
      'Leonardo da Vinci kept a neat, organised record of his designs.',
    ]),
    notes(34, 40, [
      'A collection of Leonardo da Vinci’s paperwork reveals his design of a new city beside the Ticino River. This was to provide better __Q34__ for trade and a less polluted environment. Although Leonardo da Vinci’s city shared many of the ideals of his time, some of his innovations were considered unconventional in their design. They included features that can be seen in some tower blocks today, such as __Q35__ on the exterior of a building.',
      'Leonardo da Vinci wasn’t only an architect. His expertise in __Q36__ was evident in his plans for artificial canals within his ideal city. He also believed that the height of houses should relate to the width of streets in case earthquakes occurred. The design of many cities in Italy today follows this __Q37__.',
      'While some cities from __Q38__ times have aspects that can also be found in Leonardo’s designs, his ideas weren’t put into practice until long after his death. __Q39__ is one example of a city that was redesigned in the 19th century in the way that Leonardo had envisaged. His ideas are also relevant to today’s world, where building __Q40__ no longer seems to be the best approach.',
    ], { title: 'Leonardo da Vinci’s ideal city', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 34–40 on your answer sheet.' }),
  ],
  key: { 27: 'NOT GIVEN', 28: 'NOT GIVEN', 29: 'TRUE', 30: 'FALSE', 31: 'TRUE', 32: 'NOT GIVEN', 33: 'FALSE', 34: 'transport', 35: 'staircases', 36: 'engineering', 37: 'rule', 38: 'Roman', 39: 'Paris', 40: 'outwards' },
  expl: {
    27: ['Người ta gọi Leonardo da Vinci là thiên tài lần đầu cách đây 500 năm.', 'Đoạn 1', '“Five hundred years have passed since Leonardo died”', '500 năm là từ khi ông mất; không nói ông được gọi là thiên tài từ khi nào → NOT GIVEN'],
    28: ['Khủng hoảng khí hậu hiện nay được dự báo gây nhiều cái chết hơn dịch hạch.', 'Đoạn 2', '“which is predicted to cause widespread displacement, extinctions and death, if left unaddressed.”', 'Không so sánh số người chết với dịch hạch → NOT GIVEN'],
    29: ['Một số thách thức ngày nay có thể so với những thách thức thời trước.', 'Đoạn 2', '“Then, as now, radical solutions were called for to revolutionise the way people lived”', '“Then, as now” = khi đó cũng như bây giờ → TRUE'],
    30: ['“Thành phố lý tưởng” của Leonardo được xây vào thế kỷ 15.', 'Đoạn 3', '“which – due to its excessive costs – would remain unfulfilled.”', 'Dự án không bao giờ được thực hiện → FALSE'],
    31: ['Quy hoạch đô thị kém là nguyên nhân chính của biến đổi khí hậu.', 'Đoạn 3', '“unsustainable urban models are a key cause of global climate change today”', '“key cause” = major contributor → TRUE'],
    32: ['Thời Phục Hưng, người dân địa phương phản đối các thay đổi ở Pienza và Ferrara.', 'Đoạn 4', '“such as the reconfiguration of the town of Pienza and the expansion of the city of Ferrara.”', 'Không nói gì về phản ứng của người dân → NOT GIVEN'],
    33: ['Leonardo lưu giữ bản thiết kế gọn gàng, có tổ chức.', 'Đoạn 5', '“because of his disordered way of working with notes and sketches.”', 'Cách làm việc lộn xộn → FALSE'],
    34: ['Thành phố mới nhằm mang lại ___ tốt hơn cho thương mại.', 'Đoạn 5', '“He designed the city for the easy transport of goods and clean urban spaces”', 'Vận chuyển hàng hóa dễ dàng → transport'],
    35: ['…những đặc điểm thấy ở nhà cao tầng ngày nay, như ___ ở bên ngoài tòa nhà.', 'Đoạn 6', '“linked with vertical outdoor staircases. This design can be seen in some of today’s high-rise buildings”', 'Cầu thang ngoài trời → staircases'],
    36: ['Chuyên môn về ___ thể hiện qua kế hoạch kênh đào nhân tạo.', 'Đoạn 7', '“But the true originality of Leonardo’s vision was its fusion of architecture and engineering. Leonardo designed extensive hydraulic plants to create artificial canals”', 'Kỹ thuật (công trình thủy lực) → engineering'],
    37: ['Thiết kế nhiều thành phố Ý ngày nay vẫn theo ___ này.', 'Đoạn 7', '“a rule still followed in many contemporary cities across Italy”', 'Quy tắc chiều rộng phố = chiều cao nhà → rule'],
    38: ['Một số thành phố thời ___ có điểm giống thiết kế của Leonardo.', 'Đoạn 8', '“Although some of these features existed in Roman cities”', 'Các thành phố La Mã → Roman'],
    39: ['___ là ví dụ thành phố được thiết kế lại ở thế kỷ 19 đúng như Leonardo hình dung.', 'Đoạn 8', '“Georges-Eugene Haussmann’s renovation of Paris under Emperor Napoleon III between 1853 and 1870.”', 'Paris → Paris'],
    40: ['…ngày nay xây dựng ___ không còn là cách tốt nhất.', 'Đoạn 9', '“the compact city, built upwards instead of outwards”', 'Xây lên cao thay vì lan rộng ra → outwards'],
  },
};
