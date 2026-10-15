// Vol 7 – Test 5 (PDF "Listening/Test 1-10/Test 5.pdf", text layer; key p2 of "Key Lis VOL 7 (T1-T10).pdf"; audio = whole test
// "VOL 7 TEST 5.mp4" — no half-minute check pauses between parts). P3 = bank "Music Students' Attitudes to Performing" (Vol 4 -
// Test 5 P3: same recording, transcript 6-gram 0.71, key 10/10) → reused.
// Transcript: the vol's .docx checked against Whisper turbo; P1 plays the example first, then the whole conversation → cut.
// docx "Skellen Street" → Skellarn (spelt out S-K-E-L-L-A-R-N). The audio ends P4 with "half a minute to check" (the docx says
// "10 minutes to transfer").
const { note, map, multi } = require('../vol_build');
const A = 'Listening/Test 1-10/VOL 7 Audio (T1-T10)/VOL 7 TEST 5.mp4';

module.exports = {
  vol: 7, test: 5, docx: 'Listening/Test 1-10/Transcript VOL 7 (T1-T10)/transcript vol 7 test 5.docx',
  sections: [
    {
      part: 1, title: 'Joining Minack Library', audio: A, clip: [36.5, 387.5], cover: 'public library bookshelves reading room | local library interior',
      cut: [['On this occasion only', 'answer questions 1 to 5.']],
      fix: [['Yes, in Skellen Street.', 'Yes, in Skellarn Street.']],
      turns: [
        ['Librarian', 'Good morning, library services.'], ['Woman', 'Oh, good morning.'], ['Librarian', 'Right, so whereabouts'], ['Woman', 'In Perton'],
        ['Librarian', "Fine, so I'll just"], ['Woman', 'Minack?'], ['Librarian', 'Yes, in Skellarn'], ['Woman', 'Can you spell that?'],
        ['Librarian', "It's S-K-E"], ['Woman', 'Got that.'], ['Librarian', "It's very easy to find"], ['Woman', 'Oh, I think I know'],
        ['Librarian', "I don't know of one."], ['Woman', "Oh, I'm probably mistaken."], ['Librarian', "Yes, it's well-served"], ['Woman', 'Oh, right.'],
        ['Librarian', "I'm afraid it's not open"], ['Woman', 'Saturday?'], ['Librarian', "Opens at 9 o'clock"], ['Woman', "That's fine."],
        ['Librarian', 'Well, the library does run'], ['Woman', "A pity it's not"], ['Librarian', "Well, there's no reading club"], ['Woman', 'Excellent.'],
        ['Librarian', 'Well, Minack does'], ['Woman', "That's good."], ['Librarian', 'And I know that about once'], ['Woman', 'How interesting.'],
        ['Librarian', "Not CDs, I'm afraid"], ['Woman', 'Right.'], ['Librarian', 'Anything else'], ['Woman', 'Same as my last place.'],
        ['Librarian', 'And there is a new drop-off'], ['Woman', 'That sounds good.'], ['Librarian', 'And we do have a small shop'], ['Woman', "Oh, that's a good idea."],
        ['Librarian', "They're very popular."], ['Woman', "Well, it sounds like you've got"],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Library services', [
          'Example: Area of living: in the west of Perton',
          '<strong>Best option – Minack Library</strong>',
          'Located in __Q1__ Street, next to the __Q2__',
          'Saturdays: open until __Q3__ p.m.',
          '<strong>Children’s activities</strong>',
          '• a __Q4__ club (5–13 year olds)',
          '• a __Q5__ club (every other Saturday)',
          '<strong>Adult activities</strong>',
          '• Book of the Month club',
          '• can meet local __Q6__ (about once a year)',
          '<strong>Services</strong>',
          '• can borrow __Q7__',
          '• computers are available (can be booked)',
          '• various __Q8__ are available',
          '• can drop off books, etc. via the letter box (must give card __Q9__)',
          '<strong>Library shop sells</strong>',
          '• postcards (small selection)',
          '• __Q10__ (wide range)',
        ], { 1: 'Skellarn', 2: 'park', 3: '4.30/4:30', 4: 'drama', 5: 'singing', 6: 'artists', 7: 'films', 8: 'magazines', 9: 'number', 10: 'maps' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi thủ thư cho biết địa chỉ thư viện.', t: ['Yes, in Skellarn Street.', "It's S-K-E-L-L-A-R-N Street."], p: 'Tên phố được đánh vần S-K-E-L-L-A-R-N → Skellarn' },
        2: { v: 'Ngay sau đó.', t: ["It's very easy to find because it's beside a park.", "There's a sports centre near there, isn't there?", "I don't know of one."], p: 'Trung tâm thể thao là người phụ nữ nhớ nhầm (bẫy); thư viện ở cạnh công viên → park' },
        3: { v: 'Khi hỏi giờ mở cửa cuối tuần.', t: ["Opens at 9 o'clock, closes at 4.30.", 'We shut at 5 on weekdays.'], p: '5 giờ là ngày thường (bẫy); thứ Bảy đóng cửa lúc 4.30 → 4.30' },
        4: { v: 'Khi hỏi hoạt động cho trẻ em.', t: ['Well, the library does run a drama club, but that would only be suitable for your younger child.', "It's open for 5 to 13-year-olds."], p: 'Câu lạc bộ mỹ thuật là ở nơi cũ (bẫy); câu lạc bộ kịch cho trẻ 5–13 tuổi → drama' },
        5: { v: 'Khi hỏi hoạt động cho cả hai con.', t: "Oh, but there's a singing club that's held every second Saturday afternoon for children of all ages up to 16.", p: 'Không có câu lạc bộ đọc sách (bẫy); câu lạc bộ hát vào thứ Bảy cách tuần ("every second Saturday") → singing' },
        6: { v: 'Khi nói hoạt động cho người lớn.', t: 'And I know that about once every 12 months, they have a session where you can meet artists, you know, from the local area.', p: 'Mỗi năm một lần được gặp các nghệ sĩ địa phương → artists' },
        7: { v: 'Khi hỏi có cho mượn đĩa CD không.', t: ['Can you take out CDs?', "Not CDs, I'm afraid, but films, yes."], p: 'Không cho mượn CD (bẫy) nhưng cho mượn phim → films' },
        8: { v: 'Khi nói các dịch vụ khác.', t: 'We have 10 computers and we also stock several magazines, including business, healthcare and hobbies.', p: 'Có nhiều loại tạp chí (kinh doanh, sức khoẻ, sở thích) → magazines' },
        9: { v: 'Khi nói cách trả sách ngoài giờ.', t: 'All you have to do is attach a note to it with the number on your card clearly written.', p: 'Phải ghi rõ số thẻ thư viện → number' },
        10: { v: 'Khi nói về cửa hàng của thư viện.', t: ["We don't have many, but it's a popular service.", 'We also have an impressive range of maps of the surrounding area for sale.'], p: 'Bưu thiếp chỉ có ít (đã cho sẵn); bản đồ khu vực xung quanh có rất nhiều loại → maps' },
      },
    },
    {
      part: 2, title: 'Forest Lake Family Camp', audio: A, clip: [387.5, 715.3], cover: 'lake campsite cabins forest | family camping tents lake',
      groups: [
        map('Label the map below.\nChoose the correct letter, A-H, next to Questions 11-16.', [
          [11, 'Toilet block', 'A'],
          [12, 'Shower block', 'C'],
          [13, 'Tent site', 'G'],
          [14, 'Cabins', 'D'],
          [15, 'Barbecue area', 'F'],
          [16, 'Bike trail', 'H'],
        ], { pdf: 'Listening/Test 1-10/Test 5.pdf', page: 2, box: [88, 187, 324, 405] }, 'Questions 11-16 – Forest Lake Campsite'),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO items is it recommended that campers bring?', ['earplugs', 'sunscreen', 'swimming togs', 'torch', 'boots'], ['A', 'E'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO are the most popular concert items, according to the organiser?', ['acting', 'dancing', 'poetry recital', 'singing', 'storytelling'], ['B', 'D'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Khi đi từ bãi đỗ xe.', t: "Now, if you cross the road from the car park, the first building you'll come to is the toilet block.", p: 'Bãi đỗ xe ở góc trên bên trái; băng qua đường, toà nhà đầu tiên → A' },
        12: { v: 'Ngay sau nhà vệ sinh.', t: 'And built onto that, so this is across the road from the community hall, is the new shower block.', p: 'Nối liền với nhà vệ sinh (A), đối diện hội trường qua đường → C' },
        13: { v: 'Khi nói khu cắm lều.', t: 'If you now move to the bottom left of your map, among the pine trees, there is a special flat site set up for pitching tents', p: 'Góc dưới bên trái, giữa rặng thông → G' },
        14: { v: 'Khi đi dọc phía trên bản đồ.', t: "There's another area of pine forest, and then over on the far right-hand side, there's a block of small cabins.", p: 'Tận cùng bên phải ở phía trên → D' },
        15: { v: 'Khi đi xuống phía dưới, qua đường.', t: 'In this next block, beside the flower beds, we have a lovely place for barbecues, where you can cook in the open air.', p: 'Đi theo chiều kim đồng hồ, khu kế tiếp cạnh bồn hoa → F' },
        16: { v: 'Khi nói đường đua xe đạp.', t: "Below the flower bed and across Lakeside Drive, you'll see a trail for mountain biking", p: 'Dưới bồn hoa, bên kia đường Lakeside Drive → H' },
        17: { v: 'Khi nói nên mang theo gì.', t: "So I'd say that a pair of earplugs are more useful, as in my experience, a lot of talking goes on after light's out.", p: 'Đồ bơi và kem chống nắng có thể để ở nhà, đèn pin không cần (bẫy B, C, D); nút bịt tai hữu ích vì mọi người nói chuyện sau giờ tắt đèn → A' },
        18: { v: 'Ngay sau đó.', t: "But in April, if it's wet, it can get muddy around the campsite, so to bring boots isn't a bad idea.", p: 'Trời ướt thì lầy lội, nên mang ủng → E' },
        19: { v: 'Cuối phần nói về buổi biểu diễn đêm cuối.', t: 'But actually, people much prefer to see some good dancing.', p: 'Đọc thơ, diễn kịch, kể chuyện chỉ là gợi ý (bẫy A, C, E); mọi người thích xem nhảy hơn → B' },
        20: { v: 'Khi nói về buổi biểu diễn đêm cuối.', t: ["You can't have a camp without a good sing-along.", "That's our favourite activity."], p: 'Hát chung là hoạt động được yêu thích nhất → D' },
      },
    },
    { part: 3, reuse: '6ac731311f45cf3630a45ca4', title: "Music Students' Attitudes to Performing" },
    {
      part: 4, title: 'Ethics in Engineering', audio: A, clip: [1098, 1506], cover: 'collapsed bridge engineering disaster | steel bridge construction',
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Ethics in Engineering', [
          'Ethics – principles relating to right and wrong conduct',
          '• at first, engineers saw ethics as a __Q31__ issue',
          '• attitudes changed because of three disasters involving the collapse of __Q32__',
          '   – 1876 – USA (metal fatigue)',
          '   – 1879 – Scotland (the impact of __Q33__ on the structure was miscalculated)',
          '   – 1907 – Canada (the structure could not support its own __Q34__)',
          '<strong>Boston Molasses Disaster</strong>',
          '• At the time, molasses was the main __Q35__ used in the USA',
          '• Boston company: collapse of a __Q36__ released 8 million litres of molasses',
          '• the wave of molasses destroyed buildings and the railway',
          '• local residents insisted on a __Q37__ of the molasses company',
          '<strong>Causes of the accident</strong>',
          '• insufficient __Q38__ checks',
          '• the fermentation caused the rising of __Q39__',
          'Now, every engineer has to have a __Q40__',
        ], { 31: 'personal', 32: 'bridges', 33: 'wind', 34: 'weight', 35: 'sweetener', 36: 'tank', 37: 'trial', 38: 'safety', 39: 'pressure', 40: 'license/licence' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về thời kỳ đầu của ngành kỹ thuật.', t: "Initially, ethical issues were considered to be a personal matter, something to be decided in accordance with one's own principles and values.", p: 'Ban đầu đạo đức bị xem là chuyện cá nhân → personal' },
        32: { v: 'Khi nói về ba thảm hoạ.', t: 'All three of these involved the collapse of bridges.', p: 'Cả ba vụ đều là sập cầu → bridges' },
        33: { v: 'Khi nói vụ năm 1879 ở Scotland.', t: 'This occurred because engineers had failed to correctly calculate the effects that wind would have on the structure.', p: 'Tính sai tác động của gió lên công trình → wind' },
        34: { v: 'Khi nói vụ năm 1907 ở Canada.', t: 'The weight of the structure was so great that it could not support itself, and it collapsed.', p: 'Công trình quá nặng, không đỡ nổi trọng lượng của chính nó → weight' },
        35: { v: 'Khi giới thiệu thảm hoạ mật mía Boston.', t: 'At the time, molasses was used rather than sugar as the principal sweetener in the USA.', p: 'Mật mía là chất tạo ngọt chính, thay cho đường → sweetener' },
        36: { v: 'Khi nói mật mía được chứa ở đâu.', t: ['The molasses, more than eight million liters of thick, sticky liquid, was stored in a tank.', 'Suddenly this collapsed'], p: 'Bồn chứa bị sập làm tràn 8 triệu lít mật mía → tank' },
        37: { v: 'Khi nói phản ứng của cư dân.', t: 'They banded together and succeeded in bringing about a trial, charging the company with negligence.', p: 'Cư dân đưa công ty ra xét xử → trial' },
        38: { v: 'Khi nói nguyên nhân tai nạn.', t: 'However, it is certainly clear that not enough safety tests were carried out.', p: 'Không kiểm tra an toàn đủ → safety' },
        39: { v: 'Ngay sau đó.', t: 'It seems that the collapse was probably brought about by fermentation of the molasses, which led to an increase in pressure.', p: 'Lên men làm tăng áp suất → pressure' },
        40: { v: 'Khi nói quy định ngày nay.', t: 'It is the reason why we can now only operate if we have gained a license.', p: 'Kỹ sư chỉ được hành nghề khi có giấy phép → license' },
      },
    },
  ],
};
