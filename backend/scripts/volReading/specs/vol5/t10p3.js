// Vol 5 - Reading/Test 10/Test 10-up.pdf - Reading Passage 3 (PDF p9–12; questions 27–32 printed before the passage). Not in
// the bank / mini-ielts; no online copy found. Text = PDF (scan, many typos; New Scientist). Typos fixed: "Walter Stengel" →
// Werner Stengel (the German coaster designer; not tested), "in the 1970" → 1970s, "at the limited of", "can rally take" →
// really, "after a few so the passengers" → after a few rides the passengers, "at a fate" → rate, "Stenge", "H a ride" → If a
// ride, "he ties to limit" → tries, "finging" → flinging, "more fun s", "Dutch military plot o" → pilots to, "small Positive a
// slight" → small positive g – a slight, quote marks. Example: paragraph A = vii (A difficult task) — shown in the instruction.
// Q33 is printed with TWO gaps under one number ("depend on both the ___ and ___ of their passengers"); the key file gives
// "Weight, position" → one box, both words required, either order (longOk). Key = Test 10/explanation- 10.pdf, checked against
// the passage: all correct.
const { headings, notes, ynng } = require('../../vr_build');
module.exports = {
  vol: 5, test: 10, part: 3, title: 'Keeping the fun in funfairs', text: 't10p3.txt', longOk: [33],
  free: ['weight, position', 'position, weight', 'position and weight'],
  groups: [
    headings(27, [
      'Less is more',
      'Research can\'t guarantee safety',
      'Unexplained symptoms',
      'Setting the limits of acceleration',
      'The irresistible appeal of speed',
      'Gentle surprises',
      'A difficult task',
      'A different ride every time',
    ], ['Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 3 has seven paragraphs, A–G. Choose the correct heading for paragraphs B–G from the list of headings below. Write the correct number, i–viii, in boxes 27–32 on your answer sheet. Example: Paragraph A — vii (A difficult task).' }),
    notes(33, 37, [
      'Some attractions, such as the new type of waltzers, depend on both the __Q33__ of their passengers in order to create a variety of ride experiences. (Write both words for Question 33.)',
      'Designers need to be aware that a "chaotic" ride could accelerate at a violent rate if it reaches its __Q34__.',
      'Research has shown that people will begin to feel ill if they are subjected to movement on all __Q35__ at the same time.',
      'Volunteers in Stengel\'s rotation tests suffered delayed reactions such as __Q36__.',
      'A phenomenon known as the __Q37__ produced a pleasurable sensation in test subjects.',
    ], { instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 33–37 on your answer sheet.' }),
    ynng(38, [
      'There is still a lot to be learnt about the rates of acceleration which people can withstand.',
      'Children enjoy funfairs more than adults.',
      'Current rides could probably be adapted to become more enjoyable.',
    ]),
  ],
  key: { 27: 'iv', 28: 'viii', 29: 'ii', 30: 'iii', 31: 'i', 32: 'vi',
    33: 'weight and position / weight, position / position and weight / position, weight', 34: 'resonance frequency',
    35: 'three axes', 36: 'headaches', 37: 'Coriolis Illusion', 38: 'NO', 39: 'NOT GIVEN', 40: 'YES' },
  expl: {
    27: ['Chọn tiêu đề cho đoạn B.', 'Đoạn B',
      '“NASA\'s research suggests that the maximum level we can endure is 9 g” … “So Stengel decided that the maximum vertical acceleration for the public should be 6 g” … “he put firm restrictions on the rate at which acceleration can increase”',
      'Stengel đặt giới hạn gia tốc cho người chơi → iv Setting the limits of acceleration'],
    28: ['Chọn tiêu đề cho đoạn C.', 'Đoạn C',
      '“the latest generation of waltzer cars spin freely, at a rate determined by the weight and position of the people in them. So you never have the same experience twice.”',
      '“never have the same experience twice” → viii A different ride every time'],
    29: ['Chọn tiêu đề cho đoạn D.', 'Đoạn D',
      '“Despite complex calculations, designers can never be completely sure that something odd won\'t happen” … “no one can guarantee that it will be able to cope.”',
      'Dù tính toán kỹ vẫn không thể đảm bảo an toàn → ii Research can\'t guarantee safety'],
    30: ['Chọn tiêu đề cho đoạn E.', 'Đoạn E',
      '“But what Stengel found particularly puzzling was that they also developed headaches and other problems about two days later. Since these effects aren\'t understood”',
      'Triệu chứng đau đầu xuất hiện sau hai ngày, chưa giải thích được → iii Unexplained symptoms'],
    31: ['Chọn tiêu đề cho đoạn F.', 'Đoạn F',
      '“He believes that the sequence of accelerations, not their size, is what counts and that the way to make rides more fun is to put people through a carefully designed succession of relatively small accelerations.”',
      'Gia tốc nhỏ mà sắp xếp hợp lý lại vui hơn → i Less is more'],
    32: ['Chọn tiêu đề cho đoạn G.', 'Đoạn G',
      '“The fun seems to come from the unforeseen, particularly when an effect called the Coriolis Illusion comes into play. This is an agreeable tumbling feeling”',
      'Bất ngờ nhẹ nhàng, dễ chịu → vi Gentle surprises'],
    33: ['Một số trò chơi như loại waltzer mới phụ thuộc vào cả ______ và ______ của người chơi để tạo trải nghiệm khác nhau.', 'Đoạn C',
      '“the latest generation of waltzer cars spin freely, at a rate determined by the weight and position of the people in them. So you never have the same experience twice.”',
      'Hai chỗ trống: trọng lượng và vị trí (ghi cả hai từ) → weight and position'],
    34: ['Trò chơi “hỗn loạn” có thể tăng tốc dữ dội nếu đạt tới ______ của nó.', 'Đoạn D',
      '“if you drive a revolving waltzer car at its resonance frequency it could speed up uncontrollably.”',
      '“speed up uncontrollably” = accelerate at a violent rate → resonance frequency'],
    35: ['Người ta bắt đầu thấy khó chịu nếu bị xoay theo cả ______ cùng lúc.', 'Đoạn E',
      '“It emerged that if the pilots were turned on all three axes simultaneously, they became so nauseous they almost blacked out”',
      '“simultaneously” = at the same time; “nauseous” = feel ill → three axes'],
    36: ['Tình nguyện viên trong thí nghiệm xoay của Stengel gặp phản ứng muộn như ______.', 'Đoạn E',
      '“they also developed headaches and other problems about two days later.”',
      '“about two days later” = delayed reactions → headaches'],
    37: ['Một hiện tượng gọi là ______ tạo cảm giác dễ chịu cho người thử nghiệm.', 'Đoạn G',
      '“an effect called the Coriolis Illusion comes into play. This is an agreeable tumbling feeling”',
      '“agreeable” = pleasurable → Coriolis Illusion'],
    38: ['Vẫn còn nhiều điều cần tìm hiểu về mức gia tốc con người chịu được.', 'Đoạn A & B',
      '“Experts realize we are now at the limit of how much acceleration a human body can take” … “NASA\'s research suggests that the maximum level we can endure is 9 g.”',
      'Giới hạn gia tốc đã được biết rõ (9 g); cái chưa biết là lực xoay (đoạn E), không phải gia tốc → NO'],
    39: ['Trẻ em thích hội chợ vui chơi hơn người lớn.', 'Toàn bài',
      '“what\'s going to keep dragging us back to amusement parks?”',
      'Bài không so sánh trẻ em với người lớn → NOT GIVEN'],
    40: ['Các trò chơi hiện có có thể được điều chỉnh để vui hơn.', 'Đoạn F',
      '“it seems likely that designers could formulate profiles even for existing attractions that would lead to higher amusement value.”',
      '“existing attractions” = current rides; “higher amusement value” = more enjoyable → YES'],
  },
};
