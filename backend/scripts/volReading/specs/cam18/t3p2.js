// Cambridge IELTS 18 - Test 3 - Passage 2. Source: ieltsworldly.com, checked against the book key. Summary typo "raised it’s" → its.
const { headings, mc, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 3, part: 2, title: 'The steam car', text: 't3p2.txt',
  groups: [
    headings(14, [
      'A period in cold conditions before the technology is assessed',
      'Marketing issues lead to failure',
      'Good and bad aspects of steam technology are passed on',
      'A possible solution to the issues of today',
      'Further improvements lead to commercial orders',
      'Positive publicity at last for this quiet, clean, fast vehicle',
      'A disappointing outcome for customers',
      'A better option than the steam car arises',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 14–20 on your answer sheet.' }),
    mc(21, [
      ['What point does the writer make about the steam car in Paragraph B?', ['Its success was short-lived.', 'Not enough cars were made.', 'Car companies found them hard to sell.', 'People found them hard to drive.']],
      ['When building their first steam car, the Doble brothers', ['constructed all the parts themselves.', 'made written notes at each stage of the construction.', 'needed several attempts to achieve a competitive model.', 'sought the advice of experienced people in the car industry.']],
      ['In order to produce the Model C, the Doble brothers', ['moved production to a different city.', 'raised financial capital.', 'employed an additional worker.', 'abandoned their earlier designs.']],
    ]),
    notes(24, 26, [
      'The Model E was road-tested in 1924 by the Automobile Club of America. They found it easy to drive, despite its weight, and it impressed the spectators. A later version of the Model E raised its __Q24__ while keeping its emissions extremely low.',
      'The steam car was too expensive for many people and its design was constantly being altered. Under __Q25__ cars were produced before the company went out of business. However, even today, there are Model Es on the road in the US. They are straightforward to maintain, and they satisfy California’s __Q26__ emissions laws. Perhaps today’s technology and materials would help us revive the steam car.',
    ], { title: 'The Model E', instruction: 'Complete the summary below. Choose ONE WORD OR A NUMBER from the passage for each answer. Write your answers in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'iii', 15: 'viii', 16: 'vi', 17: 'v', 18: 'vii', 19: 'i', 20: 'iv', 21: 'A', 22: 'C', 23: 'B', 24: 'speed', 25: 'fifty/50', 26: 'strict' },
  free: ['50'],
  expl: {
    14: ['Đoạn A – chọn tiêu đề.', 'Đoạn A', '“But these early cars inherited steam’s weaknesses along with its strengths.”', 'Xe hơi nước thừa hưởng cả điểm mạnh và yếu của công nghệ hơi nước → iii'],
    15: ['Đoạn B – chọn tiêu đề.', 'Đoạn B', '“But in 1912 General Motors introduced the electric starter, and over the following few years, steam power was gradually phased out.”', 'Động cơ đốt trong trở thành lựa chọn tốt hơn → viii'],
    16: ['Đoạn C – chọn tiêu đề.', 'Đoạn C', '“a feat described as ‘remarkable acceleration’ by Automobile magazine in 1914.”', 'Model B êm, sạch, nhanh, được tạp chí khen = truyền thông tích cực → vi'],
    17: ['Đoạn D – chọn tiêu đề.', 'Đoạn D', '“By the following April, the General Engineering Company had received 5,390 deposits for Doble Detroits”', 'Model C cải tiến thêm và nhận 5.390 đơn đặt cọc → v'],
    18: ['Đoạn E – chọn tiêu đề.', 'Đoạn E', '“Those buyers who received the handful of completed cars complained that the vehicles were sluggish and erratic”', 'Khách hàng thất vọng → vii'],
    19: ['Đoạn F – chọn tiêu đề.', 'Đoạn F', '“After sitting overnight in freezing temperatures, the car was pushed out into the road and left to sit for over an hour in the frosty morning air.”', 'Để xe qua đêm trong giá lạnh trước khi chạy thử → i'],
    20: ['Đoạn G – chọn tiêu đề.', 'Đoạn G', '“it is not unthinkable that the steam car may rise again.”', 'Xe hơi nước có thể là lời giải cho áp lực giảm khí thải hiện nay → iv'],
    21: ['Tác giả nêu điểm gì về xe hơi nước ở đoạn B?', 'Đoạn B', '“But the glory days of steam cars were few.”', 'Thời hoàng kim ngắn ngủi → A'],
    22: ['Khi chế tạo chiếc xe đầu tiên, anh em Doble…', 'Đoạn C', '“Though it did not run well, the Doble brothers went on to build a second and third prototype in the following years.”', 'Phải thử nhiều lần mới có mẫu cạnh tranh (Model B gây chú ý). Họ dùng phụ tùng xe cũ (A sai) → C'],
    23: ['Để sản xuất Model C, anh em Doble…', 'Đoạn D', '“Abner Doble drove the Model B from Massachusetts to Detroit in order to seek investment in his automobile design”', 'Tìm vốn đầu tư để mở công ty → B'],
    24: ['Phiên bản sau của Model E tăng ___ mà vẫn giữ khí thải rất thấp.', 'Đoạn F', '“its maximum speed was pushed to over a hundred miles per hour”', 'Tốc độ tối đa vượt 100 dặm/giờ → speed'],
    25: ['Chưa tới ___ chiếc được sản xuất trước khi công ty đóng cửa.', 'Đoạn G', '“By the time the company folded in 1931, fewer than fifty of the amazing Model E steam cars had been produced.”', '“fewer than” = under; 50 chiếc → fifty'],
    26: ['…đáp ứng luật khí thải ___ của California.', 'Đoạn G', '“runs clean enough to pass the emissions laws in California today, and they are pretty strict.”', 'Luật khí thải khắt khe → strict'],
  },
};
