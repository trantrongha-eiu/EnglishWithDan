// Vol 9 – Test 3 (same layout as vol9_t1.js; the key here is a bare list of 40 answers, not "Câu số N:").
// P1 = bank "Windshem Farm Center", P2 = bank "Student Vacation Jobs" (both Vol 2 - Test 7 / Vol 7 - Test 8): key 10/10,
// transcript 6-gram 47 % / 68 %, same questions → reused. P3 + P4 new.
// Recording: P3 stops mid-sentence after "OK, I'll make a note of that, thanks. So the others..." (no "end of section 3" line;
// docx drops "So the others...") → fix adds it. Key Q39 "nutritions" → nutrition (typo).
const { note, mc, matching } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 3.mp4';

module.exports = {
  vol: 9, test: 3, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 3-L.docx',
  rawRe: RE,
  sections: [
    { part: 1, title: 'Windshem Farm Center', reuse: '6a53e0a25c459ab074ced7f5' },
    { part: 2, title: 'Student Vacation Jobs', reuse: '6a53e3ae5c459ab074cede2e' },
    {
      part: 3, title: 'Voice Training for Drama Students', audio: A, clip: [915.8, 1353.1], cover: 'theatre stage actors rehearsal | drama class students stage',
      fix: [["Right! Ed, well, I'm delighted", "Right, Ed, well, I'm delighted"], ["OK, I'll make a note of that, thanks.", "OK, I'll make a note of that, thanks. So the others..."]],
      turns: [
        ['Fiona', 'Right, Ed'], ['Ed', 'OK.'], ['Fiona', "I'll be observing"], ['Ed', "That'd be great"], ['Fiona', 'Good.'], ['Ed', 'Oh, OK.'],
        ['Fiona', "It's whatever you feel"], ['Ed', 'Fine.'], ['Fiona', 'OK.'], ['Ed', 'Yes.'], ['Fiona', 'Absolutely.'], ['Ed', 'Right.'],
        ['Fiona', 'OK.'], ['Ed', 'Does it have to be'], ['Fiona', 'Ideally, an enclosed space.'], ['Ed', 'Right.'], ['Fiona', 'Now, your next activity'],
        ['Ed', 'I understand.'], ['Fiona', 'Now, out of the 20 books'], ['Ed', 'Yeah, agreed.'], ['Fiona', "Well, I'm not sure"], ['Ed', 'Oh, right.'],
        ['Fiona', "There's one more"], ['Ed', "OK, I'll make a note"],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nVoice training for drama students', [
          [21, 'Ed is giving the voice coaching workshop in order to get', ['a new job.', 'a qualification.', 'a promotion.'], 'B'],
          [22, 'According to Fiona, the seating pattern that Ed chooses', ['should be illustrated visually.', 'has to be explained in detail.', 'is not particularly important.'], 'C'],
          [23, 'Fiona and Ed agree that in the first activity, the students', ['may feel uncomfortable.', 'like to make group contact.', 'must focus on themselves.'], 'C'],
          [24, 'Fiona and Ed agree that in the second activity, Ed should', ['insist which students work together.', 'tell students to prepare a speech.', 'include a focus on breath control.'], 'C'],
          [25, 'What does Fiona suggest about working in a big space?', ['It could be outside or inside.', 'It is best to go to somewhere like a park.', 'It is useful for getting actors to shout.'], 'A'],
          [26, "What does Fiona think of Ed's selection of texts?", ['It should include more classical texts.', 'It needs to focus on a single emotion.', 'It has to cover a wider range.'], 'C'],
        ], 'Questions 21-26'),
        matching('What disadvantage do the speakers identify for each of the following textbooks?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 27-30.',
          ['too expensive', 'too limited', 'prejudiced', 'unrealistic', 'out of date', 'too detailed', 'unavailable'], [
            [27, 'Vocal Instruction', 'E'], [28, 'Improve Your Accent', 'B'], [29, "Actors' Handbook", 'G'], [30, 'Confident Voice Delivery', 'D'],
          ], { title: 'Disadvantages', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi Fiona nói mục đích của buổi workshop.', t: "And if all goes well, you'll then have finished the final stage of your voice coach diploma.", p: 'Nếu buổi dạy tốt, Ed hoàn thành giai đoạn cuối của bằng huấn luyện giọng = lấy bằng cấp → B' },
        22: { v: 'Khi bàn về cách xếp chỗ ngồi.', t: ["But it doesn't matter which one I use at the beginning of a workshop.", "It's whatever you feel comfortable with."], p: 'Vẽ sơ đồ chỉ là cách trình bày kế hoạch (bẫy A); dùng kiểu xếp nào cũng được = không quan trọng → C' },
        23: { v: 'Khi bàn về hoạt động đầu tiên.', t: ['aware of other people but primarily concentrating on their own thoughts.', 'Absolutely.'], p: 'Học viên chủ yếu tập trung vào suy nghĩ của chính mình, Fiona đồng ý → C' },
        24: { v: 'Khi Fiona góp ý hoạt động thứ hai.', t: 'And at the same time, get them to think about their posture because that governs their lung capacity and, most crucially, their breathing.', p: 'Nội dung nói không quan trọng (bẫy B); cần thêm phần tư thế và quan trọng nhất là hơi thở → C' },
        25: { v: 'Khi bàn về không gian lớn.', t: ['Ideally, an enclosed space.', "But there's no reason why you couldn't go somewhere outdoors.", "Although, I'd avoid a very public space like a park."], p: 'Tốt nhất là trong nhà nhưng ra ngoài trời cũng được; tránh công viên (bẫy B); phóng giọng không phải hét (bẫy C) → A' },
        26: { v: 'Khi Fiona nhận xét các đoạn trích Ed chọn.', t: ['You need to consider the different kind of emotion that each extract should present, from sorrow through to ecstasy.', 'Classical stuff is all well and good, but include many more contemporary sources.'], p: 'Cần nhiều loại cảm xúc và thêm nhiều nguồn đương đại (không phải cổ điển, bẫy A) = phạm vi rộng hơn → C' },
        27: { v: 'Khi nói về cuốn Vocal Instruction.', t: 'but bear in mind it was written 30 years ago and it shows.', p: 'Viết cách đây 30 năm và lộ rõ sự cũ kỹ → E (out of date)' },
        28: { v: 'Khi nói về cuốn Improve Your Accent.', t: "I thought Improve Your Accent was interesting, but it's very narrow in its outlook, don't you think?", p: 'Cách nhìn rất hẹp → B (too limited)' },
        29: { v: "Khi nói về cuốn Actors' Handbook.", t: ["It's an expensive book, very useful, but according to the publishers they're going to reissue it with new colour photos and at the moment it's out of print.", "There aren't any second-hand copies out there"], p: 'Sách đắt (bẫy A) nhưng vấn đề là đang hết hàng, không có cả sách cũ → G (unavailable)' },
        30: { v: 'Khi nói về cuốn Confident Voice Delivery.', t: ['It exaggerates its claims on how to be successful to such an extent that I think it is positively misleading.', "But maybe I'm biassed."], p: 'Phóng đại cách thành công đến mức gây hiểu lầm = phi thực tế; "biased" là nói về chính Fiona (bẫy C) → D (unrealistic)' },
      },
    },
    {
      part: 4, title: 'Food Safety Standards', audio: A, clip: [1353.1, 1696.8], cover: 'supermarket frozen food aisle | food safety laboratory',
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Food Safety Standards', [
          '<strong>Risk assessment</strong>',
          'Scientists have to consider potential problems with:',
          "• the product's __Q31__ (could they attract harmful bacteria?)",
          '• method of preparation (will it eliminate harmful micro-organisms?)',
          '• how products are __Q32__ and distributed',
          '• supermarkets (e.g. changes in __Q33__ affecting the condition of frozen food)',
          '• end-users (how is food usually handled in the home?)',
          '<strong>Factors affecting food consumption</strong>',
          'Legislation',
          'Consumer attitudes',
          '• e.g. dislike of additives → growth of the __Q34__ food market in Australia',
          'The food industry',
          '• supermarkets may use price or __Q35__ as their selling strategy (but the main concern is profitability)',
          'The mass media',
          '• now the main source of __Q36__ for many',
          '• negative effect because not objective:',
          '– concern for __Q37__',
          '– news is now a form of __Q38__ which can mislead the public',
          '• few programmes deal with food safety or __Q39__',
          '<strong>Personal opinion</strong>',
          'Importance of education: as with benefits of exercise, many children can influence their __Q40__',
        ], { 31: 'ingredients', 32: 'stored', 33: 'temperature', 34: 'organic', 35: 'image', 36: 'information', 37: 'sales', 38: 'entertainment', 39: 'nutrition', 40: 'parents' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về đánh giá rủi ro.', t: ['Firstly, they have to consider the ingredients of the product.', 'They have to decide whether any of these might make the finished product more susceptible to harmful bacteria.'], p: 'Đầu tiên xét thành phần của sản phẩm có dễ nhiễm vi khuẩn không → ingredients' },
        32: { v: 'Khi nói về khâu bảo quản và phân phối.', t: "After that, they've got to consider the way products are stored, for instance, in warehouses or cold stores and distributed to retailers.", p: 'Xét cách sản phẩm được bảo quản và phân phối → stored' },
        33: { v: 'Khi nói về vấn đề ở siêu thị.', t: 'Things like frozen foods being defrosted and then refrozen because the temperature fluctuated', p: 'Đồ đông lạnh rã đông rồi đông lại vì nhiệt độ dao động → temperature' },
        34: { v: 'Khi nói về thái độ người tiêu dùng.', t: 'This has led to the phenomenal expansion of the market for organic food in Australia.', p: 'Không thích chất phụ gia dẫn đến thị trường thực phẩm hữu cơ bùng nổ → organic' },
        35: { v: 'Khi nói về ngành thực phẩm.', t: 'In some large supermarkets, low prices are the main strategy for attracting customers, while for more upscale marketers, image is more important.', p: 'Siêu thị lớn dùng giá rẻ, nơi cao cấp coi trọng hình ảnh → image' },
        36: { v: 'Khi nói về truyền thông đại chúng.', t: 'Finally, there is the influence of the mass media, which is the most important source of information for most people.', p: 'Truyền thông là nguồn thông tin quan trọng nhất → information' },
        37: { v: 'Khi nói vì sao truyền thông không khách quan.', t: 'For one thing, the prime motivation of the media, as with the food industry, is sales', p: 'Động lực chính của truyền thông là doanh số → sales' },
        38: { v: 'Khi nói về tin tức.', t: 'A further problem is that news is regarded as a type of entertainment.', p: 'Tin tức bị xem là một dạng giải trí → entertainment' },
        39: { v: 'Khi nói về các chương trình TV, radio.', t: ['On top of that, up till now, food safety and nutrition have never been considered a really interesting topic for the public.', 'Very few TV or radio shows address the issues'], p: 'An toàn thực phẩm và dinh dưỡng ít được chương trình nào đề cập → nutrition' },
        40: { v: 'Khi nêu ý kiến cá nhân.', t: 'We know that many children who have been taught about the benefits of exercise come home and lecture their parents about it.', p: 'Trẻ học về lợi ích của tập thể dục về nhà "giảng" lại cho bố mẹ → parents' },
      },
    },
  ],
};
