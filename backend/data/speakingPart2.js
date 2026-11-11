'use strict';

// Content of "IELTS Speaking Part 2 — Master Story Framework" (English With
// Dan, 28-page PDF) — the 7 master stories behind speaking-part2.html.
// Served ONLY through GET /api/speaking-part2/content (login + Premium, see
// services/speakingPart2Service.js), never as a public static file.
//
// English text is copied from the PDF unchanged. The Vietnamese line of each
// sentence is the prompt of the "Dịch câu" drill. Shapes:
//   sentence  [en, vi]
//   vocab     [cat, term, meaningVi, example, answer]
//             cat: 'col' | 'idiom' | 'adj'; answer = the exact words of
//             `example` the student types (the cloze in the vocab drill).
// Progress keys (v<i>, f<sec>.<j>, w<k>.<j>, c<j>) are built from array
// positions — append new sentences/variants at the END to keep old progress.
//
// 7 khung nói: every story is spoken as 5 FIXED frames + WHY + Kết luận. A
// section with `join: '<frame title>'` is merged into the frame before it
// (the frame takes that title) — sections stay separate here so the
// f<sec>.<j> progress keys never move.

var HOW_TO = {
  goal: 'Không học thuộc một bài riêng cho từng topic. Học sinh chỉ cần thuộc khoảng 70% phần FIXED, sau đó thay 20–30 giây cuối theo cue card.',
  budget: [
    ['FIXED (giới thiệu → câu chuyện → quay lại cue card)', '≈ 1:30', '200–230 từ'],
    ['FLEXIBLE (phần WHY theo đề)', '≈ 0:20–0:25', '40–60 từ'],
    ['Kết luận', '≈ 0:10', '20–35 từ'],
    ['Tổng', '≤ 2:00', '≈ 270–300 từ']
  ],
  budgetNote: 'Giám khảo sẽ dừng thí sinh khi hết 2 phút. Nếu phần FIXED quá dài, phần WHY — phần trả lời trực tiếp cue card — sẽ bị cắt mất. Học sinh band 6.0–7.0 thường nói khoảng 120–140 từ/phút, vì vậy tất cả phần FIXED trong bản này đã được rút gọn về khoảng 200–230 từ.',
  rules: [
    ['Thiếu thời gian → cắt phần giữa, không cắt phần WHY.', 'Nếu nói chậm, bỏ bớt câu mô tả ở phần Ngoại hình / Mô tả, nhưng luôn giữ đoạn WHY vì đó là phần trả lời đúng đề.'],
    ['Cá nhân hoá chi tiết.', 'Đổi tên, địa điểm, con số thành chi tiết thật của chính mình. Câu chuyện thật nghe tự nhiên hơn, dễ trả lời câu hỏi Part 3 hơn, và tránh bị giám khảo nhận ra là bài học thuộc.'],
    ['Dùng bảng từ vựng có chọn lọc.', 'Mỗi bài nói chọn 3–4 collocations và tối đa 1–2 idioms — idiom dùng sai ngữ cảnh gây hại nhiều hơn là không dùng.']
  ]
};

var LOGIC = {
  intro: 'Mỗi nhóm chủ đề trong cue card IELTS Speaking Part 2 thực chất chỉ xoay quanh một câu hỏi gốc. Ghi nhớ bảng dưới đây để nhận diện nhanh nên dùng câu chuyện nào — và câu chuyện đó có thể "mượn" sang nhóm nào khác.',
  philosophy: [
    'Học sinh không học thuộc hàng chục bài mẫu khác nhau cho từng cue card.',
    'Mỗi nhóm chủ đề chỉ cần MỘT câu chuyện gốc (70% FIXED), sau đó thay đúng đoạn WHY ở cuối (khoảng 30% FLEXIBLE) để khớp với bất kỳ đề nào trong nhóm.',
    'Kết quả: 7 câu chuyện → xử lý phần lớn ngân hàng cue card Part 2.'
  ],
  limits: '7 câu chuyện gốc không phủ tốt các dạng đề sau: thể thao / hoạt động thể chất · toà nhà, công trình, căn phòng · món ăn · công nghệ (app, website, thiết bị) · phim điện ảnh / sách · luật lệ, quy định.',
  limitsTip: 'Gợi ý: bổ sung 2–3 câu chuyện phụ (ví dụ: Sport, Food, Technology) theo cùng cấu trúc FIXED + FLEXIBLE.'
};

var STORIES = [
  // ── 01 · PEOPLE ──────────────────────────────────────────────────────
  {
    id: 'people', no: '01', group: 'PEOPLE', emoji: '👩‍🏫', color: '#4d63d8',
    title: 'Mrs Hoa — Người cô đáng nhớ',
    rootQ: 'WHO — ai?',
    borrow: 'a time someone helped you → kể dài câu chuyện lần đầu gặp',
    skeleton: 'Mrs Hoa → giáo viên tiếng Anh → ngoại hình → tính cách → quen 5 năm → câu chuyện lần đầu gặp',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The person I'd like to talk about is Mrs Hoa, who was my English teacher in high school.", 'Người mà tôi muốn kể là cô Hoa, cô giáo dạy tiếng Anh của tôi hồi cấp ba.'],
        ["She's a warm-hearted and down-to-earth person with a calm and approachable personality.", 'Cô là một người ấm áp, giản dị, với tính cách điềm đạm và dễ gần.']
      ] },
      { h: 'Ngoại hình', s: [
        ["In terms of appearance, she's of medium height, with shoulder-length black hair and a bright, infectious smile.", 'Về ngoại hình, cô có chiều cao trung bình, mái tóc đen dài ngang vai và nụ cười rạng rỡ, dễ lan toả.'],
        ['She always looks neat and well-presented, but what makes her memorable is the way she makes people feel comfortable around her.', 'Cô lúc nào trông cũng gọn gàng, chỉn chu, nhưng điều khiến cô đáng nhớ là cách cô làm mọi người thấy thoải mái khi ở bên cô.']
      ] },
      { h: 'Tính cách', join: 'Ngoại hình & tính cách', s: [
        ["Personality-wise, she's incredibly patient and genuinely caring.", 'Về tính cách, cô cực kỳ kiên nhẫn và thật lòng quan tâm đến người khác.'],
        ["She's also quite open-minded and encouraging, which is something I've always appreciated about her.", 'Cô cũng khá cởi mở và hay động viên, đó là điều tôi luôn trân trọng ở cô.']
      ] },
      { h: 'Đã quen bao lâu', s: [
        ["I've known Mrs Hoa for about five years — she taught me for three years in high school, and we've kept in touch ever since.", 'Tôi quen cô Hoa khoảng năm năm rồi — cô dạy tôi ba năm cấp ba, và từ đó đến nay chúng tôi vẫn giữ liên lạc.']
      ] },
      { h: 'Ấn tượng đầu tiên — câu chuyện ngắn', s: [
        ['I still remember the first time I met her.', 'Tôi vẫn nhớ lần đầu tiên gặp cô.'],
        ['I was sitting at the back of the classroom, struggling with an English exercise, when she walked over to my desk.', 'Lúc đó tôi đang ngồi cuối lớp, loay hoay với một bài tập tiếng Anh, thì cô bước đến bàn tôi.'],
        ["She was checking other students' work, but she noticed that I was struggling and stopped to help me.", 'Cô đang kiểm tra bài của các bạn khác, nhưng nhận ra tôi đang gặp khó nên dừng lại giúp tôi.'],
        ['It was only a small moment, but it immediately showed me that she genuinely cared about her students.', 'Đó chỉ là một khoảnh khắc nhỏ, nhưng nó cho tôi thấy ngay rằng cô thật lòng quan tâm đến học sinh của mình.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's one of the reasons why Mrs Hoa immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là một trong những lý do khiến tôi nghĩ ngay đến cô Hoa khi thấy đề bài này.']
      ] }
    ],
    why: [
      { q: 'WHY you admire / respect her', vi: 'Vì sao bạn ngưỡng mộ / tôn trọng cô', s: [
        ['There are two main reasons why I really admire her.', 'Có hai lý do chính khiến tôi thực sự ngưỡng mộ cô.'],
        ["First of all, she's incredibly patient — for example, she never makes students feel embarrassed about making mistakes.", 'Thứ nhất, cô cực kỳ kiên nhẫn — ví dụ, cô không bao giờ khiến học sinh thấy xấu hổ vì mắc lỗi.'],
        ["Another reason is that she's genuinely passionate about teaching.", 'Một lý do khác là cô thật sự đam mê nghề dạy học.'],
        ["I've actually seen this first-hand because she often spends extra time helping weaker students.", 'Tôi đã tận mắt chứng kiến điều này vì cô thường dành thêm thời gian giúp đỡ những bạn học yếu hơn.']
      ] },
      { q: 'WHY she is important to you', vi: 'Vì sao cô quan trọng với bạn', s: [
        ["There are two main reasons why she's so important to me.", 'Có hai lý do chính khiến cô quan trọng với tôi đến vậy.'],
        ['First of all, she gave me confidence when I was struggling with English — for example, she encouraged me to speak even when I was afraid of making mistakes.', 'Thứ nhất, cô đã cho tôi sự tự tin khi tôi đang vật lộn với tiếng Anh — ví dụ, cô khuyến khích tôi nói ngay cả khi tôi sợ mắc lỗi.'],
        ['Another reason is that she has influenced the way I approach learning.', 'Một lý do khác là cô đã ảnh hưởng đến cách tôi tiếp cận việc học.'],
        ["Because of her, I've become much more confident and independent.", 'Nhờ cô, tôi đã trở nên tự tin và tự lập hơn rất nhiều.']
      ] },
      { q: 'WHY she is creative', vi: 'Vì sao cô là người sáng tạo', s: [
        ["There are two main reasons why I'd describe her as a creative person.", 'Có hai lý do chính khiến tôi cho rằng cô là một người sáng tạo.'],
        ['First of all, she always comes up with unusual ways of explaining things — for example, she often turns difficult grammar points into simple real-life situations.', 'Thứ nhất, cô luôn nghĩ ra những cách giải thích khác lạ — ví dụ, cô thường biến những điểm ngữ pháp khó thành các tình huống đời thường đơn giản.'],
        ["Another reason is that she's not afraid to experiment with new ideas, which makes her lessons much more engaging.", 'Một lý do khác là cô không ngại thử nghiệm những ý tưởng mới, điều đó khiến các bài học của cô cuốn hút hơn nhiều.']
      ] },
      { q: 'WHY she helped you', vi: 'Vì sao cô là người đã giúp đỡ bạn', s: [
        ['There are two main reasons why I consider her someone who really helped me.', 'Có hai lý do chính khiến tôi xem cô là người thực sự đã giúp đỡ tôi.'],
        ['First of all, she gave me practical advice when I was struggling with English — for example, she showed me how to keep a vocabulary notebook, which I still use today.', 'Thứ nhất, cô cho tôi những lời khuyên thiết thực khi tôi gặp khó với tiếng Anh — ví dụ, cô chỉ tôi cách ghi sổ từ vựng, cách mà đến giờ tôi vẫn dùng.'],
        ['Another reason is that she always encouraged me instead of simply pointing out my mistakes.', 'Một lý do khác là cô luôn động viên tôi thay vì chỉ đơn thuần chỉ ra lỗi sai.'],
        ['That support made a huge difference to my confidence.', 'Sự ủng hộ đó đã tạo nên khác biệt rất lớn cho sự tự tin của tôi.']
      ] },
      { q: 'WHY she is successful', vi: 'Vì sao cô là người thành công', isNew: true, s: [
        ["There are two main reasons why I'd call her successful.", 'Có hai lý do chính khiến tôi gọi cô là người thành công.'],
        ["First of all, many of her former students have gone on to get high IELTS scores and study abroad — and for a teacher, that's real success.", 'Thứ nhất, nhiều học trò cũ của cô sau này đã đạt điểm IELTS cao và đi du học — và với một giáo viên, đó mới là thành công thực sự.'],
        ["Another reason is that she's highly respected by both colleagues and parents, even though she's never been interested in fame or money.", 'Một lý do khác là cô rất được đồng nghiệp lẫn phụ huynh kính trọng, dù cô chưa bao giờ màng đến danh tiếng hay tiền bạc.']
      ] }
    ],
    conclusion: [
      ['So overall, Mrs Hoa is someone I genuinely look up to, and I feel lucky to have met someone who has had such a positive influence on me.', 'Nói chung, cô Hoa là người tôi thật lòng kính trọng, và tôi thấy mình may mắn khi gặp được một người có ảnh hưởng tích cực đến tôi như vậy.']
    ],
    remember: {
      fixed: 'Mrs Hoa → English teacher → appearance → personality → 5 years → first-meeting story.',
      flexible: '"That\'s why she came to mind…" → WHY? → Reason 1 + Example → Reason 2 + Example.',
      topics: ['person you admire', 'person you look up to', 'important person', 'person who helped you', 'creative person', 'successful person', 'person who influenced you', 'person with a good personality', 'person you learned something from']
    },
    notes: [],
    vocab: [
      ['col', 'have a lasting influence on sb', 'có ảnh hưởng lâu dài đến ai', "She's had a lasting influence on the way I study.", 'had a lasting influence on'],
      ['col', "build sb's confidence", 'xây dựng sự tự tin cho ai', 'She really built my confidence in speaking.', 'built my confidence'],
      ['col', 'set a good example', 'làm gương tốt', 'She always set a good example by being well-prepared for every lesson.', 'set a good example'],
      ['col', "earn sb's respect", 'giành được sự tôn trọng', "She earned everyone's respect without ever raising her voice.", "earned everyone's respect"],
      ['col', 'keep in touch with sb', 'giữ liên lạc', "We've kept in touch since I finished high school.", 'kept in touch'],
      ['col', 'make a real difference to', 'tạo ra khác biệt thực sự', 'Her feedback made a real difference to my writing.', 'made a real difference to'],
      ['idiom', 'go the extra mile', 'nỗ lực hơn mức cần thiết', "She'd often go the extra mile for weaker students.", 'go the extra mile'],
      ['idiom', "take sb under one's wing", 'dìu dắt, che chở ai', 'She took me under her wing when I was falling behind.', 'took me under her wing'],
      ['idiom', 'bring out the best in sb', 'khơi dậy điều tốt nhất ở ai', 'She knows how to bring out the best in every student.', 'bring out the best in'],
      ['idiom', 'practise what you preach', 'nói đi đôi với làm', 'She practises what she preaches — she reads in English every day herself.', 'practises what she preaches'],
      ['adj', 'approachable', 'dễ gần', "She's so approachable that even shy students ask her questions.", 'approachable'],
      ['adj', 'dedicated', 'tận tâm', "She's one of the most dedicated teachers I've ever had.", 'dedicated'],
      ['adj', 'compassionate', 'giàu lòng trắc ẩn', "She's compassionate towards students going through a hard time.", 'compassionate'],
      ['adj', 'level-headed', 'điềm tĩnh, sáng suốt', 'She stays level-headed even when the class gets out of control.', 'level-headed'],
      ['adj', 'inspiring', 'truyền cảm hứng', 'Her lessons were genuinely inspiring.', 'inspiring'],
      ['adj', 'supportive', 'luôn ủng hộ, nâng đỡ', 'She was always supportive, even when I made silly mistakes.', 'supportive']
    ]
  },

  // ── 02 · PLACES ──────────────────────────────────────────────────────
  {
    id: 'places', no: '02', group: 'PLACES', emoji: '🏖️', color: '#2a9d8f',
    title: 'Đà Nẵng — Điểm đến trong tim',
    rootQ: 'WHERE — ở đâu?',
    borrow: 'a trip / holiday you enjoyed · a place near water',
    skeleton: 'Đà Nẵng → vị trí → lần đầu ghé thăm → câu chuyện làn gió biển → mô tả → gắn bó cá nhân',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The place I'd like to talk about is Da Nang, a coastal city in central Vietnam.", 'Nơi tôi muốn kể là Đà Nẵng, một thành phố biển ở miền Trung Việt Nam.'],
        ["It's a lively but laid-back city, best known for its stunning beaches and relaxed atmosphere.", 'Đó là một thành phố sôi động nhưng thư thái, nổi tiếng nhất với những bãi biển tuyệt đẹp và bầu không khí dễ chịu.']
      ] },
      { h: 'Ấn tượng đầu tiên', s: [
        ['I first visited Da Nang about three years ago, and I still remember how impressed I was when I arrived.', 'Lần đầu tôi đến Đà Nẵng là khoảng ba năm trước, và tôi vẫn nhớ mình đã ấn tượng thế nào khi vừa đặt chân đến.'],
        ['I was walking along My Khe Beach in the late afternoon when I felt the cool sea breeze and heard the waves crashing against the shore.', 'Tôi đang đi dạo dọc bãi biển Mỹ Khê vào chiều muộn thì cảm nhận được làn gió biển mát lạnh và nghe tiếng sóng vỗ vào bờ.'],
        ['It immediately felt refreshing and peaceful, especially after months of living in a big, noisy city.', 'Cảm giác ngay lập tức thật sảng khoái và bình yên, nhất là sau nhiều tháng sống ở một thành phố lớn, ồn ào.']
      ] },
      { h: 'Mô tả', s: [
        ['What really stands out about Da Nang is its perfect mix of nature and modern city life.', 'Điều thật sự nổi bật ở Đà Nẵng là sự kết hợp hoàn hảo giữa thiên nhiên và cuộc sống đô thị hiện đại.'],
        ['It has pristine beaches, impressive mountains and a lively city centre, all within a relatively short distance.', 'Ở đó có những bãi biển hoang sơ, những ngọn núi ấn tượng và một trung tâm thành phố nhộn nhịp, tất cả đều cách nhau không xa.'],
        ['I also love the fact that the city feels modern without being too overwhelming or fast-paced.', 'Tôi cũng thích việc thành phố mang cảm giác hiện đại mà không quá ngột ngạt hay hối hả.']
      ] },
      { h: 'Gắn bó cá nhân', s: [
        ["I've been back to Da Nang several times since that first trip, and I still find it incredibly relaxing.", 'Từ chuyến đi đầu tiên đó, tôi đã quay lại Đà Nẵng vài lần, và tôi vẫn thấy nơi đây cực kỳ thư giãn.'],
        ['Whenever I go there, I usually spend some time by the beach, try some local food and just slow down for a while.', 'Mỗi lần đến đó, tôi thường dành thời gian ở bãi biển, thử vài món ăn địa phương và chỉ đơn giản là sống chậm lại một chút.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why Da Nang immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do Đà Nẵng hiện lên ngay trong đầu tôi khi thấy đề bài này.']
      ] }
    ],
    why: [
      { q: 'A place you like', vi: 'Vì sao bạn thích địa điểm này', s: [
        ['There are two main reasons why I really like this place.', 'Có hai lý do chính khiến tôi thực sự thích nơi này.'],
        ["First of all, it's a great escape from fast-paced urban life — for example, I can spend an afternoon walking along the beach without worrying about traffic or work.", 'Thứ nhất, đó là nơi tuyệt vời để thoát khỏi nhịp sống đô thị hối hả — ví dụ, tôi có thể dành cả buổi chiều đi dạo dọc bãi biển mà không phải lo về kẹt xe hay công việc.'],
        ['Another reason is the atmosphere.', 'Một lý do khác là bầu không khí.'],
        ["It's lively enough to be interesting, but still relaxed enough for me to switch off and recharge.", 'Nó đủ sôi động để thú vị, nhưng vẫn đủ thư thái để tôi gác lại mọi thứ và nạp lại năng lượng.']
      ] },
      { q: 'A beautiful / natural place', vi: 'Một nơi đẹp / nơi thiên nhiên', s: [
        ["There are two main reasons why I'd describe it as a beautiful natural place.", 'Có hai lý do chính khiến tôi cho rằng đây là một nơi thiên nhiên tươi đẹp.'],
        ['First of all, the coastline has some breathtaking scenery, especially around sunset.', 'Thứ nhất, bờ biển ở đây có phong cảnh đẹp ngoạn mục, nhất là vào lúc hoàng hôn.'],
        ['Another reason is the variety of landscapes — you can enjoy pristine beaches, mountains and greenery without travelling very far.', 'Một lý do khác là sự đa dạng của cảnh quan — bạn có thể tận hưởng bãi biển hoang sơ, núi non và cây xanh mà không cần đi quá xa.']
      ] },
      { q: 'A crowded / busy place', vi: 'Một nơi đông đúc / nhộn nhịp', s: [
        ['Although it usually feels relaxed, it can get extremely crowded at certain times of the year.', 'Dù thường mang cảm giác thư thái, nơi này có thể trở nên cực kỳ đông đúc vào một số thời điểm trong năm.'],
        ["First of all, it's one of the most popular tourist destinations in the country, especially in the summer.", 'Thứ nhất, đây là một trong những điểm du lịch nổi tiếng nhất cả nước, đặc biệt là vào mùa hè.'],
        ['Another reason is that many restaurants, cafés and attractions are concentrated in the city centre — during public holidays, some streets can be absolutely packed.', 'Một lý do khác là nhiều nhà hàng, quán cà phê và điểm tham quan tập trung ở trung tâm thành phố — vào các dịp lễ, một số con phố có thể chật kín người.']
      ] },
      { q: 'An interesting place', vi: 'Một nơi thú vị', s: [
        ['There are two main reasons why I find this place particularly interesting.', 'Có hai lý do chính khiến tôi thấy nơi này đặc biệt thú vị.'],
        ['First of all, the contrast is amazing — you can go hiking on the Son Tra Peninsula in the morning and wander around a busy night market in the evening.', 'Thứ nhất, sự tương phản thật tuyệt vời — bạn có thể leo núi ở bán đảo Sơn Trà vào buổi sáng và dạo quanh một khu chợ đêm nhộn nhịp vào buổi tối.'],
        ["Another reason is that there's always something new to explore — I've discovered new cafés, food places and little local spots almost every time I've visited.", 'Một lý do khác là lúc nào cũng có điều mới để khám phá — gần như lần nào đến tôi cũng tìm ra những quán cà phê, quán ăn và các góc nhỏ địa phương mới.']
      ] },
      { q: 'A place you want to revisit', vi: 'Một nơi bạn muốn quay lại', s: [
        ["There are two main reasons why I'd love to go back.", 'Có hai lý do chính khiến tôi rất muốn quay lại.'],
        ["First of all, I never feel like I've completely explored the city.", 'Thứ nhất, tôi chưa bao giờ cảm thấy mình đã khám phá hết thành phố này.'],
        ['Another reason is that I associate the place with a really positive period in my life, so going back would feel both familiar and refreshing.', 'Một lý do khác là tôi gắn nơi này với một giai đoạn rất tích cực trong đời mình, nên quay lại vừa thấy thân quen vừa thấy mới mẻ.']
      ] },
      { q: 'A place near water (sea / river)', vi: 'Một nơi gần biển / sông', isNew: true, s: [
        ["It's a perfect example because water is really at the heart of the city.", 'Đây là một ví dụ hoàn hảo vì sông nước thực sự là trái tim của thành phố.'],
        ['First of all, My Khe Beach is just a few minutes from the centre, so you can go for a swim before breakfast.', 'Thứ nhất, bãi biển Mỹ Khê chỉ cách trung tâm vài phút, nên bạn có thể đi bơi trước bữa sáng.'],
        ['Another reason is the Han River — at night, the bridges are lit up, and walking along the riverside is one of my favourite things to do there.', 'Một lý do khác là sông Hàn — về đêm, những cây cầu được thắp sáng, và đi dạo dọc bờ sông là một trong những điều tôi thích làm nhất ở đó.']
      ] }
    ],
    conclusion: [
      ['So overall, Da Nang is much more than just a beautiful tourist destination to me.', 'Nói chung, với tôi Đà Nẵng không chỉ đơn thuần là một điểm du lịch đẹp.'],
      ["It's a place where I can slow down, recharge and enjoy a completely different pace of life.", 'Đó là nơi tôi có thể sống chậm lại, nạp lại năng lượng và tận hưởng một nhịp sống hoàn toàn khác.']
    ],
    remember: {
      fixed: 'Da Nang → location → first visit → sea-breeze story → description → personal connection.',
      flexible: 'Why does it fit this topic? → Reason 1 + example → Reason 2 + example.',
      map: 'beautiful place → scenery + landscape · crowded place → tourists + attractions · interesting place → contrast + variety · place you like → escape + atmosphere · place you want to revisit → unfinished exploration + personal memory · place near water → sea + river.',
      topics: ['beautiful place', 'natural place', 'crowded / busy place', 'interesting place', 'place you like', 'place you want to revisit', 'place near water', 'trip / holiday you enjoyed']
    },
    notes: [],
    vocab: [
      ['col', 'a tourist hotspot', 'điểm du lịch nổi tiếng', 'Da Nang has become a real tourist hotspot in recent years.', 'tourist hotspot'],
      ['col', 'soak up the atmosphere', 'tận hưởng bầu không khí', "I love sitting in a beach café, just soaking up the atmosphere.", 'soaking up the atmosphere'],
      ['col', 'take in the view', 'ngắm nhìn toàn cảnh', 'We drove up the mountain to take in the view over the bay.', 'take in the view'],
      ['col', 'a slower pace of life', 'nhịp sống chậm hơn', 'I really enjoy the slower pace of life there.', 'slower pace of life'],
      ['col', 'within walking distance of', 'cách … một quãng đi bộ', 'Most cafés are within walking distance of the beach.', 'within walking distance of'],
      ['col', 'escape the hustle and bustle', 'thoát khỏi sự ồn ào, tấp nập', "It's the perfect place to escape the hustle and bustle of the city.", 'escape the hustle and bustle'],
      ['idiom', 'off the beaten track', 'ít người biết, xa khu du lịch', 'I prefer little local spots that are off the beaten track.', 'off the beaten track'],
      ['idiom', "a stone's throw from", 'rất gần, chỉ cách một đoạn ngắn', "My hotel was just a stone's throw from the beach.", "a stone's throw from"],
      ['idiom', 'a home away from home', 'như ngôi nhà thứ hai', 'Da Nang has become a home away from home for me.', 'a home away from home'],
      ['idiom', 'recharge my batteries', 'nạp lại năng lượng', 'A weekend by the sea is the best way to recharge my batteries.', 'recharge my batteries'],
      ['adj', 'picturesque', 'đẹp như tranh', 'The coastline is incredibly picturesque at sunset.', 'picturesque'],
      ['adj', 'tranquil', 'yên bình, tĩnh lặng', 'Early in the morning, the beach is completely tranquil.', 'tranquil'],
      ['adj', 'bustling', 'nhộn nhịp, tấp nập', 'The night markets are always bustling with people.', 'bustling'],
      ['adj', 'unspoilt', 'còn hoang sơ, chưa bị tác động', 'Some parts of the peninsula are still unspoilt.', 'unspoilt'],
      ['adj', 'vibrant', 'sôi động, đầy sức sống', 'The city centre has a vibrant café culture.', 'vibrant'],
      ['adj', 'idyllic', 'lý tưởng, thơ mộng', "It's an idyllic place for a short break.", 'idyllic']
    ]
  },

  // ── 03 · OBJECTS ─────────────────────────────────────────────────────
  {
    id: 'objects', no: '03', group: 'OBJECTS', emoji: '📷', color: '#7d62c9',
    title: 'Chiếc máy ảnh film của cha',
    rootQ: 'WHAT — cái gì?',
    borrow: 'a gift · something that reminds you of someone',
    skeleton: 'old film camera → silver & black, compact, scratches → father bought it in the late 1980s → handed down to me → photography → family memories',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The object I'd like to talk about is an old film camera, which has been in my family for over thirty years.", 'Đồ vật tôi muốn kể là một chiếc máy ảnh film cũ, đã ở trong gia đình tôi hơn ba mươi năm.'],
        ["It's a silver-and-black Canon camera that originally belonged to my father, and it's still one of the most meaningful things I own.", 'Đó là một chiếc máy ảnh Canon màu bạc pha đen vốn là của bố tôi, và đến giờ nó vẫn là một trong những món đồ ý nghĩa nhất mà tôi có.']
      ] },
      { h: 'Ngoại hình', note: 'Lưu ý tốc độ: chỉ cần 2 câu ở phần Appearance. Đừng mô tả quá lâu — giới hạn khoảng 20 giây trong bài nói.', s: [
        ["In terms of appearance, it's quite compact, with a silver-and-black body that's a little worn with age.", 'Về hình dáng, nó khá nhỏ gọn, với thân máy màu bạc pha đen hơi sờn cũ theo năm tháng.'],
        ["It looks rather old-fashioned by today's standards, but the small scratches on the surface actually make it more interesting because they tell the story of all the places it's been.", 'Theo tiêu chuẩn ngày nay thì nó trông khá lỗi thời, nhưng những vết xước nhỏ trên bề mặt lại khiến nó thú vị hơn vì chúng kể lại câu chuyện về tất cả những nơi nó từng đi qua.']
      ] },
      { h: 'Nguồn gốc / lịch sử', s: [
        ['My father bought it in the late eighties, when he was in his twenties.', 'Bố tôi mua nó vào cuối những năm tám mươi, khi ông đang ở độ tuổi hai mươi.'],
        ['He used it to take photos on his travels, and when I was about ten, he eventually handed it down to me.', 'Ông dùng nó để chụp ảnh trong những chuyến đi, và khi tôi khoảng mười tuổi, cuối cùng ông đã truyền lại nó cho tôi.'],
        ['I still remember him saying, "Technology changes, but a good photograph lasts forever."', 'Tôi vẫn nhớ ông đã nói: “Công nghệ thì thay đổi, nhưng một bức ảnh đẹp thì còn mãi.”'],
        ['That was actually the moment I became interested in photography.', 'Đó thực ra là khoảnh khắc tôi bắt đầu yêu thích nhiếp ảnh.']
      ] },
      { h: 'Cách sử dụng', s: [
        ["I don't use it every day, but I still take it out on special occasions, such as family gatherings or trips.", 'Tôi không dùng nó hằng ngày, nhưng vẫn mang nó ra vào những dịp đặc biệt, như những buổi họp mặt gia đình hay những chuyến đi.'],
        ['I love using it because film photography makes me slow down and think carefully before taking a picture.', 'Tôi thích dùng nó vì chụp ảnh film khiến tôi chậm lại và suy nghĩ kỹ trước khi bấm máy.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why this particular object immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do chính món đồ này hiện lên ngay trong đầu tôi khi thấy đề bài.']
      ] }
    ],
    why: [
      { q: 'Describe an old object', vi: 'Một đồ vật cũ', s: [
        ['The main reason I chose it is simply its age.', 'Lý do chính tôi chọn nó đơn giản là vì tuổi đời của nó.'],
        ["It has been in my family for over thirty years, so it's almost like a piece of family history.", 'Nó đã ở trong gia đình tôi hơn ba mươi năm, nên gần như là một phần lịch sử của gia đình.'],
        ["Another reason is that it's still remarkably well-preserved despite being so old, which I find quite impressive.", 'Một lý do khác là dù đã rất cũ, nó vẫn được giữ gìn cực kỳ tốt, điều mà tôi thấy khá ấn tượng.']
      ] },
      { q: 'Describe a gift you received', vi: 'Một món quà bạn nhận được', s: [
        ["The main reason it's such a special gift is that it was given to me by my father, so it has great sentimental value.", 'Lý do chính khiến đây là món quà đặc biệt là vì bố đã tặng nó cho tôi, nên nó mang giá trị tinh thần rất lớn.'],
        ["More importantly, it wasn't just an ordinary gift — it introduced me to photography, which is something I've enjoyed ever since.", 'Quan trọng hơn, nó không chỉ là một món quà bình thường — nó đưa tôi đến với nhiếp ảnh, thứ mà tôi yêu thích từ đó đến nay.']
      ] },
      { q: 'Describe something important to you', vi: 'Một thứ quan trọng với bạn', s: [
        ["There are two main reasons why it's important to me.", 'Có hai lý do chính khiến nó quan trọng với tôi.'],
        ['First of all, it reminds me of my father and the time we spent together.', 'Thứ nhất, nó gợi tôi nhớ về bố và khoảng thời gian chúng tôi ở bên nhau.'],
        ["Another reason is that it represents my interest in photography, so in a way, it's connected to an important part of who I am.", 'Một lý do khác là nó tượng trưng cho niềm yêu thích nhiếp ảnh của tôi, nên theo một cách nào đó, nó gắn liền với một phần quan trọng con người tôi.']
      ] },
      { q: 'Something you own that you want to keep', vi: 'Một thứ bạn sở hữu và muốn giữ', s: [
        ["I'd definitely like to keep it because it's basically irreplaceable — I could buy a similar camera online, but I could never replace the memories attached to this particular one.", 'Tôi chắc chắn muốn giữ nó vì về cơ bản nó không thể thay thế — tôi có thể mua một chiếc máy tương tự trên mạng, nhưng không bao giờ thay thế được những kỷ niệm gắn với chính chiếc máy này.'],
        ["I'd actually like to pass it down to my children one day.", 'Thật ra tôi muốn một ngày nào đó truyền lại nó cho con mình.']
      ] },
      { q: 'Describe something old in your family', vi: 'Một món đồ cũ trong gia đình', s: [
        ['What makes it special is its history.', 'Điều làm nó đặc biệt là lịch sử của nó.'],
        ['It has been in my family for over thirty years, and my father used to take it with him whenever he travelled.', 'Nó đã ở trong gia đình tôi hơn ba mươi năm, và bố tôi từng mang nó theo mỗi khi đi xa.'],
        ["So, for me, it's not just an old object — it's a keepsake that connects different generations of my family.", 'Vì vậy, với tôi, nó không chỉ là một món đồ cũ — mà là một kỷ vật kết nối các thế hệ trong gia đình tôi.']
      ] }
    ],
    conclusion: [
      ["So overall, it's not just a camera — it's a piece of my family story.", 'Nói chung, nó không chỉ là một chiếc máy ảnh — mà là một phần câu chuyện của gia đình tôi.'],
      ["That's why, even though I have much more modern technology, I still want to keep it for as long as possible.", 'Đó là lý do vì sao, dù có những thiết bị hiện đại hơn nhiều, tôi vẫn muốn giữ nó càng lâu càng tốt.']
    ],
    remember: {
      fixed: 'film camera → appearance (2 câu) → father bought it (late 1980s) → handed down at 10 → photography → special occasions.',
      flexible: 'Why does it fit this topic? → lý do chính + chi tiết minh hoạ.',
      topics: ['old object', 'gift you received', 'something important to you', 'something you want to keep', 'something old in your family', 'something that reminds you of someone']
    },
    phrases: { title: '8 cụm nên học thuộc', items: [
      ['sentimental value', 'giá trị tinh thần'], ['pass down / hand down', 'truyền lại'], ['a keepsake', 'vật lưu niệm'], ['worn with age', 'cũ đi theo thời gian'],
      ['irreplaceable', 'không thể thay thế'], ['tell the story of…', 'kể lại câu chuyện về…'], ['remarkably well-preserved', 'được bảo quản rất tốt'], ['not just a/an… — it\'s…', 'không chỉ là… mà còn là…']
    ] },
    notes: [],
    vocab: [
      ['col', 'treasure sth', 'trân trọng, nâng niu', "It's something I'll always treasure.", 'treasure'],
      ['col', 'bring back memories of', 'gợi lại kỷ niệm về', 'Every time I hold it, it brings back memories of family trips.', 'brings back memories of'],
      ['col', 'a family heirloom', 'vật gia truyền', 'It has become a kind of family heirloom.', 'family heirloom'],
      ['col', 'in (perfect) working order', 'vẫn hoạt động tốt', "Surprisingly, it's still in perfect working order.", 'in perfect working order'],
      ['col', 'take good care of', 'giữ gìn cẩn thận', 'I take good care of it and keep it in a dry box.', 'take good care of'],
      ['col', 'a stark contrast to', 'sự tương phản rõ rệt với', "It's a stark contrast to the phone cameras we use today.", 'a stark contrast to'],
      ['idiom', 'stand the test of time', 'bền bỉ theo thời gian', 'It has really stood the test of time.', 'stood the test of time'],
      ['idiom', 'hold a special place in my heart', 'có vị trí đặc biệt trong lòng', 'This camera holds a special place in my heart.', 'holds a special place in my heart'],
      ['idiom', 'worth its weight in gold', 'vô cùng quý giá', "To me, it's worth its weight in gold.", 'worth its weight in gold'],
      ['idiom', 'a blast from the past', 'thứ gợi nhớ quá khứ', 'Using it feels like a blast from the past.', 'a blast from the past'],
      ['adj', 'vintage', 'cổ điển, đời cũ (có giá trị)', "It's a vintage Canon from the late eighties.", 'vintage'],
      ['adj', 'cherished', 'được yêu quý, trân trọng', "It's one of my most cherished possessions.", 'cherished'],
      ['adj', 'sturdy', 'chắc chắn, bền', "It's surprisingly sturdy for its age.", 'sturdy'],
      ['adj', 'timeless', 'không lỗi thời', 'The design is simple and timeless.', 'timeless'],
      ['adj', 'priceless', 'vô giá', 'Its sentimental value is priceless.', 'priceless'],
      ['adj', 'nostalgic', 'gợi hoài niệm', 'Looking at the old photos makes me feel nostalgic.', 'nostalgic']
    ]
  },

  // ── 04 · EVENTS ──────────────────────────────────────────────────────
  {
    id: 'events', no: '04', group: 'EVENTS', emoji: '🎤', color: '#cf5f57',
    title: 'Buổi thuyết trình ở đại học',
    rootQ: 'WHAT HAPPENED — chuyện gì đã xảy ra?',
    borrow: 'a time you were praised · a challenge you overcame',
    skeleton: 'university presentation → chưa từng nói trước đám đông → hồi hộp nhiều ngày → quên câu mở đầu → miệng khô / tay run → hít thở & nói lại → giáo viên khen → turning point',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["I'd like to tell you about a presentation I gave at university about two years ago.", 'Tôi muốn kể về một bài thuyết trình tôi đã làm ở trường đại học khoảng hai năm trước.'],
        ["It wasn't a huge event, but it was memorable because I'd never spoken in front of that many people before.", 'Đó không phải là một sự kiện lớn, nhưng nó đáng nhớ vì trước đó tôi chưa từng nói trước nhiều người như vậy.']
      ] },
      { h: 'Bối cảnh', s: [
        ['At the time, I was in my second year, working on a group project about social media.', 'Khi đó, tôi đang học năm hai và làm một dự án nhóm về mạng xã hội.'],
        ['It all started when our lecturer asked each group to give a ten-minute presentation to the whole class.', 'Mọi chuyện bắt đầu khi giảng viên yêu cầu mỗi nhóm thuyết trình mười phút trước cả lớp.'],
        ["To be honest, I wasn't a confident public speaker, so I was nervous for days beforehand.", 'Thành thật mà nói, tôi không phải người tự tin khi nói trước đám đông, nên tôi đã hồi hộp suốt mấy ngày trước đó.']
      ] },
      { h: 'Khoảnh khắc quan trọng nhất', s: [
        ['The most important moment was when I stood up and suddenly forgot my opening lines.', 'Khoảnh khắc quan trọng nhất là khi tôi đứng lên và đột nhiên quên mất câu mở đầu.'],
        ['I was completely caught off guard — my mouth went dry and my hands were shaking slightly.', 'Tôi hoàn toàn bị bất ngờ — miệng tôi khô khốc và tay hơi run.'],
        ['For a few seconds, I just stared at my notes.', 'Trong vài giây, tôi chỉ biết nhìn chằm chằm vào tờ ghi chú.'],
        ['Then I took a deep breath, started again, and surprisingly, everything became much easier.', 'Rồi tôi hít một hơi thật sâu, bắt đầu lại, và thật bất ngờ, mọi thứ trở nên dễ dàng hơn nhiều.'],
        ['By the end, I was actually enjoying it.', 'Đến cuối buổi, tôi thực sự còn thấy thích thú.']
      ] },
      { h: 'Kết quả', s: [
        ["In the end, it went much better than I'd expected.", 'Cuối cùng, mọi chuyện diễn ra tốt hơn nhiều so với tôi mong đợi.'],
        ['My lecturer said our ideas were clear and well-organised, and she specifically praised the way I explained the main points.', 'Giảng viên nói ý tưởng của nhóm rõ ràng và mạch lạc, và cô đặc biệt khen cách tôi giải thích các ý chính.']
      ] },
      { h: 'Suy ngẫm', join: 'Kết quả & suy ngẫm', s: [
        ['Looking back, it was a real turning point.', 'Nhìn lại, đó thực sự là một bước ngoặt.'],
        ["I came to realise that I wasn't bad at public speaking — I'd simply never had enough practice.", 'Tôi dần nhận ra rằng mình không hề kém trong việc nói trước đám đông — chỉ là tôi chưa bao giờ được luyện tập đủ.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why this particular experience immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do trải nghiệm này hiện lên ngay trong đầu tôi khi thấy đề bài.']
      ] }
    ],
    why: [
      { q: 'Describe an important event', vi: 'Một sự kiện quan trọng', s: [
        ['It was important mainly because it changed the way I saw myself.', 'Nó quan trọng chủ yếu vì nó đã thay đổi cách tôi nhìn nhận bản thân.'],
        ['Before that, I thought I was a terrible public speaker, but the experience showed me that I could actually do it if I prepared properly.', 'Trước đó, tôi nghĩ mình nói trước đám đông rất tệ, nhưng trải nghiệm này cho tôi thấy tôi thực sự làm được nếu chuẩn bị kỹ.']
      ] },
      { q: 'Describe a difficult experience', vi: 'Một trải nghiệm khó khăn', s: [
        ['It was difficult because I had to deal with my nerves while everyone was looking at me.', 'Nó khó khăn vì tôi phải đối phó với sự lo lắng trong khi mọi người đều đang nhìn mình.'],
        ['I was genuinely close to giving up for a few seconds, so getting through it felt like a small personal victory.', 'Trong vài giây, tôi thực sự suýt bỏ cuộc, nên vượt qua được nó giống như một chiến thắng nhỏ của bản thân.']
      ] },
      { q: 'Describe a successful experience', vi: 'Một trải nghiệm thành công', s: [
        ["I'd say it was successful because we got really positive feedback from our lecturer.", 'Tôi cho rằng nó thành công vì chúng tôi nhận được phản hồi rất tích cực từ giảng viên.'],
        ["More importantly, I managed to finish the presentation confidently even though I'd almost forgotten what to say at the beginning.", 'Quan trọng hơn, tôi đã hoàn thành bài thuyết trình một cách tự tin dù lúc đầu suýt quên mất phải nói gì.']
      ] },
      { q: 'Describe an embarrassing experience', vi: 'Một trải nghiệm xấu hổ', s: [
        ["The most embarrassing part was standing there in complete silence because I'd forgotten my opening lines.", 'Phần xấu hổ nhất là đứng đó trong im lặng hoàn toàn vì tôi đã quên câu mở đầu.'],
        ['I could feel my face going red, and I was convinced that everyone was staring at me.', 'Tôi cảm thấy mặt mình đỏ bừng, và tôi tin chắc rằng mọi người đang nhìn chằm chằm vào mình.'],
        ['Fortunately, I managed to recover quite quickly.', 'May mắn thay, tôi đã lấy lại bình tĩnh khá nhanh.']
      ] },
      { q: 'Describe a time when you were nervous', vi: 'Một lần bạn thấy hồi hộp', s: [
        ['What made me so nervous was the pressure.', 'Điều khiến tôi hồi hộp đến vậy là áp lực.'],
        ["The presentation counted for twenty percent of our final grade, and I was being assessed in front of all my classmates, so I felt like I couldn't afford to mess it up.", 'Bài thuyết trình chiếm hai mươi phần trăm điểm cuối kỳ, và tôi bị chấm điểm ngay trước mặt cả lớp, nên tôi cảm thấy mình không thể để hỏng được.']
      ] },
      { q: 'Describe a time when someone praised you', vi: 'Một lần bạn được khen', s: [
        ['What made the experience even more meaningful was the feedback from my lecturer afterwards.', 'Điều khiến trải nghiệm này càng ý nghĩa hơn là lời nhận xét của giảng viên sau đó.'],
        ['She specifically praised the clarity of my explanation, rather than just saying it was "good", and that really boosted my confidence.', 'Cô đặc biệt khen phần giải thích rõ ràng của tôi, chứ không chỉ nói chung chung là “tốt”, và điều đó thực sự giúp tôi tự tin hơn hẳn.']
      ] },
      { q: 'Describe something you learned from an experience', vi: 'Một điều bạn học được từ một trải nghiệm', s: [
        ["The biggest lesson was that confidence doesn't always come before you do something difficult.", 'Bài học lớn nhất là sự tự tin không phải lúc nào cũng đến trước khi bạn làm một việc khó.'],
        ['Sometimes you have to do it first, make a few mistakes, and then confidence comes afterwards.', 'Đôi khi bạn phải làm trước, mắc vài lỗi, rồi sự tự tin mới đến sau.']
      ] }
    ],
    conclusion: [
      ['So overall, it was a slightly stressful experience at the time, but it left a lasting impression on me.', 'Nói chung, lúc đó đây là một trải nghiệm hơi căng thẳng, nhưng nó đã để lại ấn tượng lâu dài trong tôi.'],
      ['In hindsight, I think it was one of those experiences that helped me become a more confident person.', 'Nhìn lại, tôi nghĩ đó là một trong những trải nghiệm đã giúp tôi trở thành người tự tin hơn.']
    ],
    remember: {
      fixed: 'presentation → context → forgot opening lines → deep breath → praised → turning point.',
      flexible: 'Chọn đúng một góc cảm xúc của đề (important / difficult / nervous / praised / lesson) và phát triển 2–3 câu.',
      topics: ['important event', 'difficult experience', 'successful experience', 'embarrassing moment', 'a time you were nervous', 'a time someone praised you', 'something you learned', 'a challenge you overcame', 'a time you did something for the first time']
    },
    phrases: { title: '5 cụm “xương sống”', items: [
      ['It all started when…', 'mọi chuyện bắt đầu khi…'], ['I was completely caught off guard.', 'tôi hoàn toàn bất ngờ / không kịp trở tay'],
      ['The most important moment was when…', 'khoảnh khắc quan trọng nhất là khi…'], ['In the end, …', 'cuối cùng thì…'], ['Looking back, …', 'nhìn lại thì…']
    ], more: 'Nâng cao (khi đã vững): it was a real turning point · it left a lasting impression on me · I came to realise… · in hindsight, … · it was well worth it' },
    notes: [
      { kind: 'tip', title: 'Emotional details nên giữ cố định', text: 'Thay vì: "I was very nervous." Dùng: "My mouth went completely dry." · "I remember my hands shaking slightly." · "I could feel my face going red." · "For a few seconds, I just stood there without saying anything."' },
      { kind: 'tip', title: 'Học sinh THPT', text: 'Đổi "university presentation" thành bài thuyết trình ở trường / câu lạc bộ tiếng Anh — giữ nguyên toàn bộ diễn biến.' }
    ],
    vocab: [
      ['col', 'step out of my comfort zone', 'bước ra khỏi vùng an toàn', 'It forced me to step out of my comfort zone.', 'step out of my comfort zone'],
      ['col', 'overcome my fear of', 'vượt qua nỗi sợ', 'It helped me overcome my fear of public speaking.', 'overcome my fear of'],
      ['col', 'receive positive feedback', 'nhận phản hồi tích cực', 'We received really positive feedback from our lecturer.', 'received really positive feedback'],
      ['col', 'make a good impression', 'gây ấn tượng tốt', 'I really wanted to make a good impression on my lecturer.', 'make a good impression'],
      ['col', 'gain valuable experience', 'tích luỹ kinh nghiệm quý giá', 'I gained valuable experience in speaking to a crowd.', 'gained valuable experience'],
      ['col', 'learn a valuable lesson', 'rút ra bài học quý', 'I learned a valuable lesson about preparation.', 'learned a valuable lesson'],
      ['idiom', 'have butterflies in my stomach', 'bồn chồn, hồi hộp', 'I had butterflies in my stomach the whole morning.', 'had butterflies in my stomach'],
      ['idiom', 'my mind went blank', 'đầu óc trống rỗng', 'As soon as I stood up, my mind went blank.', 'my mind went blank'],
      ['idiom', 'rise to the occasion', 'thể hiện tốt khi cần thiết', 'Somehow, I managed to rise to the occasion.', 'rise to the occasion'],
      ['idiom', 'a weight off my shoulders', 'trút được gánh nặng', 'When it was over, it felt like a weight off my shoulders.', 'a weight off my shoulders'],
      ['adj', 'nerve-racking', 'căng thẳng, hồi hộp', 'Waiting for my turn was absolutely nerve-racking.', 'nerve-racking'],
      ['adj', 'daunting', 'đáng sợ, gây nản', 'Speaking to forty people seemed really daunting.', 'daunting'],
      ['adj', 'rewarding', 'đáng giá, mang lại thành quả', 'In the end, it was a really rewarding experience.', 'rewarding'],
      ['adj', 'eye-opening', 'mở mang tầm mắt', 'It was an eye-opening experience for me.', 'eye-opening'],
      ['adj', 'memorable', 'đáng nhớ', "It's one of the most memorable days of my university life.", 'memorable'],
      ['adj', 'relieved', 'nhẹ nhõm', 'I felt incredibly relieved when it was over.', 'relieved']
    ]
  },

  // ── 05 · ACTIVITIES ──────────────────────────────────────────────────
  {
    id: 'activities', no: '05', group: 'ACTIVITIES', emoji: '🎸', color: '#e07a3a',
    title: 'Chơi guitar',
    rootQ: 'WHAT YOU DO / PROGRESS — bạn làm gì / tiến bộ ra sao?',
    borrow: "a way to relax · something you'd like to learn",
    skeleton: 'playing guitar → bắt đầu năm 15 tuổi → buổi tập 30 phút → quá trình tiến bộ → lý do yêu thích',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The activity I'd like to talk about is playing the guitar.", 'Hoạt động tôi muốn kể là chơi đàn guitar.'],
        ['I first picked it up when I was about fifteen, and since then, it has become one of my favourite ways to spend my free time.', 'Tôi bắt đầu tập chơi khi khoảng mười lăm tuổi, và từ đó, nó đã trở thành một trong những cách tôi thích nhất để dành thời gian rảnh.']
      ] },
      { h: 'Đó là gì', s: [
        ["I mainly play acoustic guitar, and you don't need much to get started — just a guitar, a few basic chords and plenty of patience.", 'Tôi chủ yếu chơi guitar thùng, và bạn không cần nhiều thứ để bắt đầu — chỉ cần một cây đàn, vài hợp âm cơ bản và thật nhiều kiên nhẫn.'],
        ['A typical practice session takes me about thirty minutes: some chord exercises first, then the last ten or fifteen minutes learning a song.', 'Một buổi tập thông thường của tôi mất khoảng ba mươi phút: tập hợp âm trước, rồi dành mười hay mười lăm phút cuối để học một bài hát.']
      ] },
      { h: 'Quá trình tiến bộ', s: [
        ['I still remember how hard it was at the beginning.', 'Tôi vẫn nhớ lúc mới bắt đầu khó khăn đến thế nào.'],
        ['I could barely switch between two chords, and my fingertips would hurt after just a few minutes.', 'Tôi gần như không chuyển nổi giữa hai hợp âm, và đầu ngón tay đau chỉ sau vài phút.'],
        ['Over time, I improved by practising every evening and breaking difficult songs into smaller sections.', 'Theo thời gian, tôi tiến bộ nhờ luyện tập mỗi tối và chia những bài khó thành từng đoạn nhỏ.'],
        ["Nowadays, basic chord changes have become second nature, and I've started pushing myself to play more complicated songs.", 'Bây giờ, việc chuyển các hợp âm cơ bản đã trở thành phản xạ tự nhiên, và tôi bắt đầu thử thách bản thân với những bài phức tạp hơn.']
      ] },
      { h: 'Vì sao thích', s: [
        ["What I love most is that it's incredibly stress-relieving — after a long day, I can just sit down, play a few songs and switch off.", 'Điều tôi thích nhất là nó giúp giải toả căng thẳng cực kỳ hiệu quả — sau một ngày dài, tôi chỉ cần ngồi xuống, chơi vài bài và gác lại mọi thứ.'],
        ['It also gives me a real sense of achievement, because I can actually see my progress.', 'Nó cũng mang lại cho tôi cảm giác thành tựu thực sự, vì tôi có thể thấy rõ sự tiến bộ của mình.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why playing the guitar immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do việc chơi guitar hiện lên ngay trong đầu tôi khi thấy đề bài.']
      ] }
    ],
    why: [
      { q: 'Skill you want to improve', vi: 'Kỹ năng bạn muốn cải thiện', s: [
        ["The main reason is that I'd love to become much more confident at playing and singing at the same time.", 'Lý do chính là tôi rất muốn tự tin hơn nhiều khi vừa đàn vừa hát.'],
        ["I've also been thinking about writing my own songs, so improving my guitar skills would give me more freedom to do that.", 'Tôi cũng đang nghĩ đến việc tự sáng tác, nên cải thiện kỹ năng guitar sẽ cho tôi nhiều tự do hơn để làm điều đó.']
      ] },
      { q: 'Activity you enjoy', vi: 'Hoạt động bạn yêu thích', s: [
        ["The main reason is that it's a great way to relax after a busy day.", 'Lý do chính là đây là cách tuyệt vời để thư giãn sau một ngày bận rộn.'],
        ['Another reason is that I can see myself improving over time, which keeps me motivated.', 'Một lý do khác là tôi thấy mình tiến bộ theo thời gian, điều đó giúp tôi luôn có động lực.']
      ] },
      { q: 'New skill you learned', vi: 'Kỹ năng mới bạn đã học', s: [
        ['I wanted to pick up a new skill rather than spend all my free time on social media.', 'Tôi muốn học một kỹ năng mới thay vì dành toàn bộ thời gian rảnh cho mạng xã hội.'],
        ["Looking back, I'm glad I did because it has become a genuinely useful and enjoyable part of my routine.", 'Nhìn lại, tôi mừng vì đã làm vậy, bởi nó đã trở thành một phần thật sự hữu ích và thú vị trong sinh hoạt hằng ngày của tôi.']
      ] },
      { q: 'Skill you want to learn', vi: 'Kỹ năng bạn muốn học', s: [
        ["The next thing I'd really like to learn is fingerstyle guitar, where you play the melody and the chords at the same time.", 'Điều tiếp theo tôi thực sự muốn học là guitar fingerstyle, kiểu chơi giai điệu và hợp âm cùng một lúc.'],
        ['At the moment, I mostly strum, so it would be a completely new challenge for me.', 'Hiện giờ tôi chủ yếu chỉ quạt đàn, nên đó sẽ là một thử thách hoàn toàn mới với tôi.']
      ] },
      { q: 'Activity that helps you relax', vi: 'Hoạt động giúp bạn thư giãn', s: [
        ['What makes it particularly useful is that it helps me switch off mentally.', 'Điều khiến nó đặc biệt hữu ích là nó giúp đầu óc tôi được nghỉ ngơi.'],
        ["Whenever I've had a stressful day, spending even thirty minutes on it makes me feel much calmer.", 'Mỗi khi trải qua một ngày căng thẳng, chỉ cần dành ba mươi phút chơi đàn cũng khiến tôi thấy bình tĩnh hơn nhiều.']
      ] },
      { q: "A hobby you'd recommend", vi: 'Sở thích bạn muốn giới thiệu', isNew: true, s: [
        ["I'd definitely recommend it because it's cheap to start and you can practise almost anywhere.", 'Tôi chắc chắn sẽ giới thiệu nó vì chi phí bắt đầu rẻ và bạn có thể luyện tập gần như ở bất cứ đâu.'],
        ["More importantly, it's a great way to take a break from screens and do something creative.", 'Quan trọng hơn, đó là cách tuyệt vời để tạm rời xa màn hình và làm điều gì đó sáng tạo.']
      ] }
    ],
    conclusion: [
      ['So overall, playing the guitar is much more than just a hobby for me.', 'Nói chung, với tôi chơi guitar không chỉ đơn thuần là một sở thích.'],
      ["It's a skill that I've gradually developed, and I think I'll keep working on it for many years to come.", 'Đó là một kỹ năng tôi đã dần dần phát triển, và tôi nghĩ mình sẽ tiếp tục rèn luyện nó trong nhiều năm tới.']
    ],
    remember: {
      fixed: 'guitar → started at 15 → 30-minute practice routine → progress story → why I love it.',
      flexible: 'Lý do theo đề (improve / enjoy / relax / new skill / recommend).',
      topics: ['skill you want to improve', 'activity you enjoy', 'new skill you learned', 'skill you want to learn', 'activity that helps you relax', "hobby you'd recommend", "something you're good at"]
    },
    notes: [
      { kind: 'warn', title: 'Không dùng cho', text: 'sport / physical activity / outdoor activity — guitar không phải hoạt động thể chất, giám khảo sẽ đánh giá lạc đề. Nhóm này cần một câu chuyện riêng.' }
    ],
    vocab: [
      ['col', 'take up a hobby', 'bắt đầu một sở thích', 'I took up the guitar when I was fifteen.', 'took up the guitar'],
      ['col', 'make steady progress', 'tiến bộ đều đặn', "I've made steady progress by practising every evening.", 'made steady progress'],
      ['col', 'practise on a regular basis', 'luyện tập thường xuyên', 'The key is to practise on a regular basis.', 'practise on a regular basis'],
      ['col', 'set myself a goal', 'tự đặt mục tiêu', 'I set myself a goal of learning one new song a month.', 'set myself a goal'],
      ['col', 'unwind after a long day', 'thư giãn sau một ngày dài', 'Playing a few songs helps me unwind after a long day.', 'unwind after a long day'],
      ['col', 'master a technique', 'thành thạo một kỹ thuật', 'It took me weeks to master that technique.', 'master that technique'],
      ['idiom', 'get the hang of sth', 'nắm được cách làm', 'It took me a while to get the hang of barre chords.', 'get the hang of'],
      ['idiom', 'learn the ropes', 'học những điều cơ bản', 'I watched online tutorials to learn the ropes.', 'learn the ropes'],
      ['idiom', 'be hooked on sth', 'mê, "nghiện" cái gì', 'After a few months, I was completely hooked on it.', 'hooked on'],
      ['idiom', 'practice makes perfect', 'có công mài sắt có ngày nên kim', "It's a true case of practice makes perfect.", 'practice makes perfect'],
      ['adj', 'therapeutic', 'có tác dụng chữa lành, thư giãn', 'Playing music is really therapeutic for me.', 'therapeutic'],
      ['adj', 'rewarding', 'đáng công sức', "It's frustrating at first, but incredibly rewarding.", 'rewarding'],
      ['adj', 'absorbing', 'cuốn hút, làm say mê', "It's so absorbing that I often lose track of time.", 'absorbing'],
      ['adj', 'challenging', 'đầy thử thách', 'Some songs are still quite challenging for me.', 'challenging'],
      ['adj', 'frustrating', 'gây nản, bực bội', 'The first few weeks were really frustrating.', 'frustrating'],
      ['adj', 'addictive', 'gây nghiện', 'Once you can play a few songs, it becomes quite addictive.', 'addictive']
    ]
  },

  // ── 06 · NATURE ──────────────────────────────────────────────────────
  {
    id: 'nature', no: '06', group: 'NATURE', emoji: '🐆', color: '#2f9e5b',
    title: 'Báo tuyết (Snow leopard)',
    rootQ: 'WHAT YOU KNOW + PERSONAL INTEREST — bạn biết gì + vì sao quan tâm?',
    borrow: 'a documentary you watched',
    skeleton: 'snow leopard → ngoại hình & tập tính → bắt đầu quan tâm từ phim tài liệu (12 tuổi) → hiểu biết hiện tại → tình trạng bảo tồn',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The animal I'd like to talk about is the snow leopard, a wild cat I've been fascinated by for years.", 'Loài vật tôi muốn kể là báo tuyết, một loài mèo hoang dã mà tôi đã say mê suốt nhiều năm.'],
        ["It's a solitary and elusive creature that lives in the high mountains of Central and South Asia.", 'Đó là một loài vật sống đơn độc và khó bắt gặp, sinh sống ở vùng núi cao Trung Á và Nam Á.']
      ] },
      { h: 'Đặc điểm', s: [
        ['It has thick, greyish fur with dark spots, which helps it blend perfectly into rocky, snowy surroundings.', 'Nó có bộ lông dày màu xám với những đốm sẫm, giúp nó hoà lẫn hoàn hảo vào môi trường đá và tuyết xung quanh.'],
        ["It's also extremely well adapted to high altitudes and usually lives alone rather than in groups.", 'Nó cũng thích nghi cực tốt với độ cao lớn và thường sống một mình thay vì theo bầy.'],
        ['What makes it so special, though, is how rarely people ever see one in the wild.', 'Tuy vậy, điều khiến nó đặc biệt đến thế là con người hiếm khi nhìn thấy nó ngoài tự nhiên.']
      ] },
      { h: 'Vì sao quan tâm', s: [
        ['My interest started when I was about twelve, when I watched a documentary about wildlife photographers who spent months in the mountains trying to film one.', 'Tôi bắt đầu quan tâm từ năm khoảng mười hai tuổi, khi xem một bộ phim tài liệu về các nhiếp ảnh gia động vật hoang dã đã dành nhiều tháng trên núi để cố quay được một con.'],
        ['They barely managed to get a few seconds of footage, and I found that incredibly intriguing.', 'Họ chỉ vừa đủ quay được vài giây phim, và tôi thấy điều đó cực kỳ hấp dẫn.'],
        ["Since then, I've watched quite a few documentaries and read articles about them.", 'Từ đó, tôi đã xem khá nhiều phim tài liệu và đọc các bài báo về chúng.']
      ] },
      { h: 'Những gì tôi biết', s: [
        ["From what I know, snow leopards are officially listed as vulnerable, and they're threatened by habitat loss, poaching and conflict with local herders.", 'Theo những gì tôi biết, báo tuyết chính thức được xếp vào nhóm sắp nguy cấp, và chúng đang bị đe doạ bởi mất môi trường sống, nạn săn trộm và xung đột với những người chăn thả địa phương.'],
        ['Conservation projects are running in several countries, but protecting such a remote habitat remains a major challenge.', 'Các dự án bảo tồn đang được triển khai ở một số quốc gia, nhưng bảo vệ một môi trường sống hẻo lánh như vậy vẫn là một thách thức lớn.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why the snow leopard immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do báo tuyết hiện lên ngay trong đầu tôi khi thấy đề bài.']
      ] }
    ],
    why: [
      { q: 'Wild animal you find interesting', vi: 'Loài động vật hoang dã bạn thấy thú vị', s: [
        ['What I find most fascinating is how well adapted it is to such a harsh environment.', 'Điều tôi thấy cuốn hút nhất là nó thích nghi tốt đến mức nào với một môi trường khắc nghiệt như vậy.'],
        ["It's also incredibly difficult to observe, which makes it even more mysterious to me.", 'Nó cũng cực kỳ khó quan sát, điều đó khiến nó càng bí ẩn hơn trong mắt tôi.']
      ] },
      { q: 'Wild animal you want to know more about', vi: 'Loài động vật bạn muốn tìm hiểu thêm', s: [
        ["I'd particularly like to learn more about its hunting behaviour and how it survives at such high altitudes.", 'Tôi đặc biệt muốn tìm hiểu thêm về tập tính săn mồi của nó và cách nó sống sót ở độ cao như vậy.'],
        ["There are still many things about these animals that scientists don't fully understand.", 'Vẫn còn nhiều điều về loài vật này mà các nhà khoa học chưa hiểu hết.']
      ] },
      { q: 'Endangered animal', vi: 'Loài động vật có nguy cơ tuyệt chủng', s: [
        ["Strictly speaking, it's classified as vulnerable rather than endangered, but it's still very much at risk.", 'Nói chính xác thì nó được xếp vào nhóm sắp nguy cấp chứ không phải nguy cấp, nhưng nó vẫn đang gặp nhiều rủi ro.'],
        ["The main reason I'm concerned is habitat loss — if their natural environment keeps shrinking, it could become much harder for the population to recover.", 'Lý do chính khiến tôi lo ngại là mất môi trường sống — nếu môi trường tự nhiên của chúng tiếp tục bị thu hẹp, quần thể của chúng có thể khó phục hồi hơn nhiều.']
      ] },
      { q: 'Animal you saw in a documentary', vi: 'Loài vật bạn xem trong phim tài liệu', s: [
        ['The documentary made a lasting impression on me because the filmmakers had to spend months waiting for just a few seconds of footage.', 'Bộ phim tài liệu đã để lại ấn tượng lâu dài trong tôi vì các nhà làm phim phải chờ đợi hàng tháng trời chỉ để có vài giây phim.'],
        ['It made me realise how rare and elusive these animals really are.', 'Nó khiến tôi nhận ra loài vật này thực sự hiếm và khó bắt gặp đến mức nào.']
      ] },
      { q: 'Animal you would like to see in the wild', vi: 'Loài vật bạn muốn thấy ngoài tự nhiên', s: [
        ["I'd love to see one in its natural habitat one day, although I realise that would be extremely difficult.", 'Tôi rất muốn một ngày nào đó được thấy một con trong môi trường sống tự nhiên, dù tôi biết điều đó cực kỳ khó.'],
        ["In a way, that's part of what makes the idea so exciting.", 'Theo một cách nào đó, chính điều đó làm ý tưởng này thêm phần thú vị.']
      ] },
      { q: 'An animal you want to protect', vi: 'Loài vật bạn muốn bảo vệ', s: [
        ['I think conservation efforts are essential because protecting one species also means protecting the ecosystem it depends on.', 'Tôi nghĩ các nỗ lực bảo tồn là thiết yếu vì bảo vệ một loài cũng đồng nghĩa với bảo vệ hệ sinh thái mà loài đó phụ thuộc vào.'],
        ["So, in my opinion, it's worth preserving their habitat before the situation becomes more serious.", 'Vì vậy, theo tôi, việc gìn giữ môi trường sống của chúng là đáng làm trước khi tình hình trở nên nghiêm trọng hơn.']
      ] }
    ],
    conclusion: [
      ['So overall, I think the snow leopard is much more than just a beautiful wild animal.', 'Nói chung, tôi nghĩ báo tuyết không chỉ đơn thuần là một loài động vật hoang dã đẹp.'],
      ["It's a reminder that there are still parts of the natural world that remain mysterious and worth protecting.", 'Nó nhắc nhở rằng vẫn còn những phần của thế giới tự nhiên còn bí ẩn và đáng được bảo vệ.']
    ],
    remember: {
      fixed: 'snow leopard → appearance & behaviour → documentary at 12 → what I know → conservation status.',
      flexible: 'Lý do theo đề (interesting / want to know more / endangered / documentary / see in the wild / protect).',
      topics: ['wild animal', 'animal you want to learn about', 'endangered animal', 'animal you saw in a documentary', "animal you'd like to see", 'animal you want to protect', 'a documentary you watched']
    },
    notes: [
      { kind: 'tip', title: 'Lưu ý chính xác', text: 'Báo tuyết được IUCN xếp hạng vulnerable (sắp nguy cấp), không phải endangered. Nói đúng điều này là điểm cộng về độ chính xác thông tin.' }
    ],
    vocab: [
      ['col', 'natural habitat', 'môi trường sống tự nhiên', 'Their natural habitat is shrinking every year.', 'natural habitat'],
      ['col', 'adapt to harsh conditions', 'thích nghi với điều kiện khắc nghiệt', "They've adapted to harsh conditions at high altitudes.", 'adapted to harsh conditions'],
      ['col', 'raise awareness of', 'nâng cao nhận thức về', 'Documentaries help raise awareness of wildlife protection.', 'raise awareness of'],
      ['col', 'protect biodiversity', 'bảo vệ đa dạng sinh học', 'Saving one species helps protect biodiversity.', 'protect biodiversity'],
      ['col', 'human–wildlife conflict', 'xung đột giữa con người và động vật', 'Human–wildlife conflict is a major threat to them.', 'Human–wildlife conflict'],
      ['col', 'face extinction', 'đối mặt nguy cơ tuyệt chủng', 'Without protection, many big cats could face extinction.', 'face extinction'],
      ['idiom', 'like looking for a needle in a haystack', 'như mò kim đáy bể', 'Finding one in the wild is like looking for a needle in a haystack.', 'like looking for a needle in a haystack'],
      ['idiom', 'the tip of the iceberg', 'chỉ là phần nổi của tảng băng', 'What we know about them is just the tip of the iceberg.', 'the tip of the iceberg'],
      ['idiom', 'once in a blue moon', 'rất hiếm khi', 'Even local herders only see one once in a blue moon.', 'once in a blue moon'],
      ['idiom', 'on the brink of extinction', 'bên bờ tuyệt chủng', 'We should act before they end up on the brink of extinction.', 'on the brink of extinction'],
      ['adj', 'elusive', 'khó tìm, khó nắm bắt', 'They\'re so elusive that they\'re called "ghosts of the mountains".', 'elusive'],
      ['adj', 'majestic', 'uy nghi, oai vệ', "It's one of the most majestic animals I've ever seen on screen.", 'majestic'],
      ['adj', 'solitary', 'sống đơn độc', 'Snow leopards are solitary animals.', 'solitary'],
      ['adj', 'well-camouflaged', 'ngụy trang tốt', 'Their fur keeps them well-camouflaged against the rocks.', 'well-camouflaged'],
      ['adj', 'vulnerable', 'dễ bị tổn thương; sắp nguy cấp', "They're currently listed as vulnerable.", 'vulnerable'],
      ['adj', 'awe-inspiring', 'khiến người ta kinh ngạc, thán phục', 'Watching one hunt was truly awe-inspiring.', 'awe-inspiring']
    ]
  },

  // ── 07 · MEDIA ───────────────────────────────────────────────────────
  {
    id: 'media', no: '07', group: 'CULTURE / MEDIA', emoji: '🎬', color: '#d4689a',
    title: 'Video ý nghĩa về một người tị nạn Việt Nam',
    rootQ: 'WHAT IT MEANS + PERSONAL REACTION — ý nghĩa + cảm nhận',
    borrow: 'a story that taught you a lesson · something you shared',
    skeleton: 'YouTube video → người đàn ông Việt-Mỹ lớn tuổi → hành trình gian khó → lòng biết ơn → một câu nói đáng nhớ → chia sẻ với bạn bè → thông điệp về cuộc sống bình thường',
    fixed: [
      { h: 'Giới thiệu', s: [
        ["The piece of media I'd like to talk about is a short interview video I came across on YouTube, from a channel that shares real-life stories of ordinary people — a bit like Humans of New York.", 'Nội dung tôi muốn kể là một video phỏng vấn ngắn tôi tình cờ xem được trên YouTube, từ một kênh chuyên chia sẻ những câu chuyện đời thực của người bình thường — hơi giống Humans of New York.'],
        ['I watched it about three months ago while casually browsing online, and it left a lasting impression on me.', 'Tôi xem nó khoảng ba tháng trước trong lúc lướt mạng, và nó đã để lại ấn tượng lâu dài trong tôi.']
      ] },
      { h: 'Nội dung', note: 'Dừng lại ở đây — không kể tiếp cốt truyện.', s: [
        ['Essentially, it features an elderly Vietnamese-American man who left Vietnam when he was young and later rebuilt his life in New York.', 'Về cơ bản, video kể về một cụ ông người Mỹ gốc Việt rời Việt Nam khi còn trẻ và sau đó gây dựng lại cuộc sống ở New York.'],
        ['He talks about his difficult journey, the uncertainty he faced and the kindness he received from strangers — all in a very simple, honest way.', 'Ông kể về hành trình gian khó, những bất trắc ông đã đối mặt và lòng tốt ông nhận được từ những người xa lạ — tất cả bằng một cách rất giản dị, chân thật.']
      ] },
      { h: 'Điều cuốn hút nhất', s: [
        ['What I found most captivating was the way he talked about gratitude.', 'Điều tôi thấy cuốn hút nhất là cách ông nói về lòng biết ơn.'],
        ['He said something along the lines of, "Every ordinary day feels like a gift because I remember when ordinary life was impossible."', 'Ông nói đại ý rằng: “Mỗi ngày bình thường đều như một món quà, vì tôi vẫn nhớ có thời cuộc sống bình thường là điều không thể.”'],
        ['That line genuinely stopped me in my tracks.', 'Câu nói đó thực sự khiến tôi phải khựng lại.']
      ] },
      { h: 'Tác động đến bản thân', s: [
        ['After watching it, I started thinking about how much I take for granted — a stable home, access to education and the freedom to plan my future.', 'Sau khi xem, tôi bắt đầu nghĩ về việc mình đã xem bao nhiêu thứ là hiển nhiên — một mái nhà ổn định, được đi học và tự do lên kế hoạch cho tương lai.'],
        ['I also shared it with a few friends, and it sparked a meaningful conversation about how lucky we are.', 'Tôi cũng chia sẻ nó với vài người bạn, và nó đã mở ra một cuộc trò chuyện ý nghĩa về việc chúng tôi may mắn đến thế nào.']
      ] },
      { h: 'Thông điệp', join: 'Tác động & thông điệp', s: [
        ["For me, the message is simple: ordinary life is incredibly valuable, especially at a time when social media makes us focus on what we don't have.", 'Với tôi, thông điệp rất đơn giản: cuộc sống bình thường vô cùng quý giá, nhất là trong thời đại mạng xã hội khiến chúng ta chỉ chăm chăm vào những gì mình không có.']
      ] },
      { h: 'Quay lại cue card', s: [
        ["And I suppose that's why this particular video immediately came to mind when I saw this topic.", 'Và tôi nghĩ đó là lý do video này hiện lên ngay trong đầu tôi khi thấy đề bài.']
      ] }
    ],
    why: [
      { q: 'Interesting thing you saw on social media', vi: 'Điều thú vị bạn thấy trên mạng xã hội', s: [
        ["What made it particularly interesting was that it wasn't trying to entertain people or go viral.", 'Điều khiến nó đặc biệt thú vị là nó không cố mua vui cho người xem hay cố để lan truyền rộng rãi.'],
        ['Instead, it told a very personal story, and I found that much more meaningful than most of the content I normally see online.', 'Thay vào đó, nó kể một câu chuyện rất riêng tư, và tôi thấy điều đó ý nghĩa hơn nhiều so với phần lớn nội dung tôi thường xem trên mạng.']
      ] },
      { q: 'TV programme / video you enjoyed', vi: 'Chương trình TV / video bạn thích', s: [
        ['What I enjoyed most was the emotional depth of the story.', 'Điều tôi thích nhất là chiều sâu cảm xúc của câu chuyện.'],
        ["It wasn't just entertaining; it gave me a different perspective on ordinary life and made me think about things I normally overlook.", 'Nó không chỉ mang tính giải trí; nó cho tôi một góc nhìn khác về cuộc sống thường ngày và khiến tôi suy nghĩ về những điều tôi hay bỏ qua.']
      ] },
      { q: 'Story that made you think', vi: 'Câu chuyện khiến bạn suy ngẫm', s: [
        ['The story really resonated with me because it reminded me not to take my current situation for granted.', 'Câu chuyện thực sự chạm đến tôi vì nó nhắc tôi đừng xem hoàn cảnh hiện tại của mình là điều hiển nhiên.'],
        ["I think that's why it stayed in my mind long after I finished watching it.", 'Tôi nghĩ đó là lý do nó còn đọng lại trong tâm trí tôi rất lâu sau khi xem xong.']
      ] },
      { q: 'Something meaningful you watched', vi: 'Một thứ ý nghĩa bạn đã xem', s: [
        ["I'd say it was meaningful because it changed the way I looked at some very ordinary things.", 'Tôi cho rằng nó ý nghĩa vì nó thay đổi cách tôi nhìn nhận một số điều rất bình thường.'],
        ['It also made me appreciate how much freedom and stability I have in my daily life.', 'Nó cũng khiến tôi trân trọng sự tự do và ổn định mà mình đang có trong cuộc sống hằng ngày.']
      ] },
      { q: 'Something you shared with others', vi: 'Một thứ bạn chia sẻ với người khác', s: [
        ['I shared it with a few close friends because I thought they would relate to the message.', 'Tôi đã chia sẻ nó với vài người bạn thân vì nghĩ họ sẽ đồng cảm với thông điệp.'],
        ['It actually sparked a meaningful conversation, which made the experience even more memorable.', 'Nó thực sự đã mở ra một cuộc trò chuyện ý nghĩa, khiến trải nghiệm này càng đáng nhớ hơn.']
      ] },
      { q: 'Something that taught you a lesson', vi: 'Một điều dạy bạn bài học', s: [
        ['The main lesson I took from it was that we often appreciate ordinary things only when we realise how easily they could be taken away.', 'Bài học chính tôi rút ra là chúng ta thường chỉ trân trọng những điều bình thường khi nhận ra chúng có thể bị lấy đi dễ dàng thế nào.'],
        ["That's something I've tried to keep in mind since then.", 'Đó là điều tôi luôn cố ghi nhớ kể từ đó.']
      ] },
      { q: 'A piece of media you would recommend', vi: 'Nội dung bạn muốn giới thiệu', s: [
        ["I'd definitely recommend it because it's short, easy to understand and genuinely thought-provoking.", 'Tôi chắc chắn sẽ giới thiệu nó vì nó ngắn, dễ hiểu và thực sự gợi nhiều suy ngẫm.'],
        ['More importantly, it gives you something to think about rather than simply entertaining you for a few minutes.', 'Quan trọng hơn, nó cho bạn điều gì đó để suy nghĩ thay vì chỉ giải trí cho bạn vài phút.']
      ] }
    ],
    conclusion: [
      ['So overall, it was only a short video, but it had a surprisingly strong impact on me.', 'Nói chung, đó chỉ là một video ngắn, nhưng nó có tác động mạnh mẽ đến bất ngờ đối với tôi.'],
      ["It's the kind of content that stays in your mind because it changes the way you look at ordinary life.", 'Đó là kiểu nội dung đọng lại trong tâm trí vì nó thay đổi cách bạn nhìn cuộc sống thường ngày.']
    ],
    remember: {
      fixed: 'YouTube video → elderly Vietnamese-American man → journey → gratitude quote → reflection → shared with friends → message.',
      flexible: 'Lý do theo đề (interesting / meaningful / shared / lesson / recommend).',
      topics: ['interesting thing on social media', 'story that made you think', 'something meaningful you watched', 'something you shared', 'something that taught you a lesson', "media you'd recommend", 'TV programme (khi đề chấp nhận video online)']
    },
    notes: [
      { kind: 'tip', title: 'Công thức cực ngắn', text: 'WHAT → SUMMARY → CAPTIVATING → REACTION → MESSAGE → WHY' },
      { kind: 'tip', title: 'Lưu ý khi mở rộng', text: 'Không nên nhồi narrative arc, cultural significance, oral tradition vào master story — chỉ hữu ích khi gặp đúng chủ đề story / culture / tradition. Ưu tiên cụm tái sử dụng rộng: thought-provoking · resonated with me · raise awareness · sparked a meaningful conversation · stopped me in my tracks · What I found most captivating was…' },
      { kind: 'warn', title: 'Không dùng cho', text: '"a film / movie you watched" hoặc "a book you read" — video YouTube không phải phim điện ảnh hay sách; cần câu chuyện riêng.' }
    ],
    vocab: [
      ['col', 'come across (a video)', 'tình cờ xem / bắt gặp', 'I came across it while scrolling through YouTube.', 'came across'],
      ['col', 'leave a deep impression on', 'để lại ấn tượng sâu sắc', 'His story left a deep impression on me.', 'left a deep impression on'],
      ['col', 'change my perspective on', 'thay đổi góc nhìn về', 'It changed my perspective on ordinary life.', 'changed my perspective on'],
      ['col', 'take sth for granted', 'xem là điều hiển nhiên', 'I used to take my stable life for granted.', 'take my stable life for granted'],
      ['col', 'a real-life story', 'câu chuyện đời thực', 'I prefer real-life stories to scripted shows.', 'real-life stories'],
      ['col', 'go viral', 'lan truyền rộng rãi', "It wasn't made to go viral — it was just honest.", 'go viral'],
      ['idiom', 'strike a chord with sb', 'chạm đến cảm xúc của ai', 'His words really struck a chord with me.', 'struck a chord with'],
      ['idiom', 'food for thought', 'điều đáng suy ngẫm', 'The video gave me a lot of food for thought.', 'food for thought'],
      ['idiom', 'put things into perspective', 'giúp nhìn nhận mọi thứ đúng mức', 'His story really put things into perspective for me.', 'put things into perspective'],
      ['idiom', 'count your blessings', 'biết trân trọng những gì mình có', 'It reminded me to count my blessings.', 'count my blessings'],
      ['adj', 'heartwarming', 'ấm lòng', 'The part about kind strangers was really heartwarming.', 'heartwarming'],
      ['adj', 'poignant', 'sâu lắng, gây xúc động', 'It was a short but poignant video.', 'poignant'],
      ['adj', 'compelling', 'cuốn hút, thuyết phục', 'His story was so compelling that I watched it twice.', 'compelling'],
      ['adj', 'uplifting', 'tích cực, nâng đỡ tinh thần', 'Despite the hardships, the message was uplifting.', 'uplifting'],
      ['adj', 'relatable', 'dễ đồng cảm', 'It felt surprisingly relatable for a young Vietnamese viewer.', 'relatable'],
      ['adj', 'sincere', 'chân thành', 'What I liked most was how sincere he sounded.', 'sincere']
    ]
  }
];

module.exports = { howTo: HOW_TO, logic: LOGIC, stories: STORIES };
