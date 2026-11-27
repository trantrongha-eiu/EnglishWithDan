// Cambridge IELTS 12 - Test 2 (book Test 6) - Passage 2. Source: ieltsworldly.com, checked against the book key. Q26 typo "a ___ it the Urubamba valley" → in.
const { headings, tfng, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam12', book: 12, test: 2, part: 2, title: 'The Lost City', text: 't2p2.txt',
  groups: [
    headings(14, [
      'Different accounts of the same journey', 'Bingham gains support', 'A common belief', 'The aim of the trip',
      'A dramatic description', 'A new route', 'Bingham publishes his theory', 'Bingham’s lack of enthusiasm',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 14–20 on your answer sheet.' }),
    tfng(21, [
      'Bingham went to South America in search of an Inca city.',
      'Bingham chose a particular route down the Urubamba valley because it was the route that most travellers used.',
      'Bingham understood the significance of Machu Picchu as soon as he saw it.',
      'Bingham returned to Machu Picchu in order to find evidence to support his theory.',
    ]),
    notes(25, 26, [
      'The track that took Bingham down the Urubamba valley had been created for the transportation of __Q25__.',
      'Bingham found out about the ruins of Machu Picchu from a __Q26__ in the Urubamba valley.',
    ], { instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 25–26 on your answer sheet.' }),
  ],
  key: { 14: 'iv', 15: 'vi', 16: 'viii', 17: 'v', 18: 'i', 19: 'vii', 20: 'iii', 21: 'TRUE', 22: 'FALSE', 23: 'FALSE', 24: 'NOT GIVEN', 25: 'rubber', 26: 'farmer' },
  expl: {
    14: ['Đoạn A – chọn tiêu đề.', 'Đoạn A', '“His goal was to locate the remains of a city called Vitcos”', 'Mục tiêu chuyến đi: tìm thành phố Vitcos → iv'],
    15: ['Đoạn B – chọn tiêu đề.', 'Đoạn B', '“a track had recently been blasted down the valley canyon”', 'Con đường mới mở dọc hẻm núi, khác lối người trước đi → vi'],
    16: ['Đoạn C – chọn tiêu đề.', 'Đoạn C', '“Bingham also seems to have been less than keen on the prospect of climbing the hill.”', 'Bingham không mấy hào hứng → viii'],
    17: ['Đoạn D – chọn tiêu đề.', 'Đoạn D', '“Bingham writes about the approach in vivid style in his book.”', 'Mô tả sống động, kịch tính → v'],
    18: ['Đoạn E – chọn tiêu đề.', 'Đoạn E', '“His journal entries of the time reveal a much more gradual appreciation of his achievement.”', 'Sách viết sau và nhật ký thời đó kể khác nhau về cùng chuyến đi → i'],
    19: ['Đoạn F – chọn tiêu đề.', 'Đoạn F', '“When he came to write the National Geographic magazine article that broke the story to the world in April 1913”', 'Công bố giả thuyết của mình trên tạp chí → vii'],
    20: ['Đoạn G – chọn tiêu đề.', 'Đoạn G', '“An idea which has gained wide acceptance over the past few years is that Machu Picchu was a moya”', '“gained wide acceptance” = quan niệm phổ biến → iii'],
    21: ['Bingham đến Nam Mỹ để tìm một thành phố Inca.', 'Đoạn A', '“His goal was to locate the remains of a city called Vitcos, the last capital of the Inca civilisation.”', 'Tìm Vitcos – thủ đô cuối cùng của Inca → TRUE'],
    22: ['Bingham chọn tuyến đường đó vì đó là tuyến hầu hết du khách dùng.', 'Đoạn B', '“Almost all previous travelers had left the river at Ollantaytambo and taken a high pass across the mountains”', 'Du khách trước đi đường khác; ông đi con đường mới mở → FALSE'],
    23: ['Bingham hiểu ngay tầm quan trọng của Machu Picchu khi vừa thấy.', 'Đoạn E', '“At this stage, Bingham didn’t realise the extent or the importance of the site”', 'Lúc đó ông chưa nhận ra tầm quan trọng → FALSE'],
    24: ['Bingham quay lại Machu Picchu để tìm bằng chứng cho giả thuyết.', 'Đoạn F', '“Bingham made desperate attempts to prove this belief for nearly 40 years.”', 'Không nói ông quay lại Machu Picchu → NOT GIVEN'],
    25: ['Con đường được làm để vận chuyển ___.', 'Đoạn B', '“to enable rubber to be brought up by mules from the jungle.”', 'Chở cao su từ rừng lên → rubber'],
    26: ['Bingham biết về tàn tích từ một ___ ở thung lũng.', 'Đoạn C', '“some ruins that a local farmer, Melchor Arteaga, had told them about the night before.”', 'Một nông dân địa phương → farmer'],
  },
};
