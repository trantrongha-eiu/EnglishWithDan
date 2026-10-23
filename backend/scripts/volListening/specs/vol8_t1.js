// Vol 8 – Test 1 (questions "LISTENING/VOL 8 TEST 1 LIS.docx", typed; map = the image embedded in it; key + transcript
// "LISTENING/TRANSCRIPT-KEY/TRANSCRIPT-KEY VOL 8 TEST 1 LIS.docx" = key lines "Câu số N:" then a TurboScribe-style transcript
// (headings "Section N", no speakers); audio = the whole test in one file "LISTENING/AUDIO/TEST 1 VOL 8.mp4" → clip per part
// (web/vol8/clips.js: silencedetect + Whisper turbo word times). Turns by content + voice pitch (speaker_pitch.js).
// Source errors fixed by the recording: key Q1 "13 March 1998" → 31 March (1988) — both Whisper models hear "March the 30th.
// Oh, I'm the 31st. 1988." (she corrects herself; the year is 1988); docx "March the 13th" → 30th.
const { note, mc, map, matching } = require('../vol_build');
const A = 'LISTENING/AUDIO/TEST 1 VOL 8.mp4';

module.exports = {
  vol: 8, test: 1, docx: 'LISTENING/TRANSCRIPT-KEY/TRANSCRIPT-KEY VOL 8 TEST 1 LIS.docx',
  rawRe: [['^[\\s\\S]*?\\n(?=Section 1\\n)', '']],
  sections: [
    {
      part: 1, title: 'International Student Travel Agency', audio: A, clip: [44.9, 416.3], cover: 'travel agency student backpacker | train station europe backpacker',
      fix: [["March the 13th. Oh, I'm the 31st!", "March the 30th. Oh, I'm the 31st."]],
      turns: [
        ['Agent', 'Hello, how can I help you?'], ['Sarah', "I'm taking a year off"], ['Agent', "That's right, we can help"], ['Sarah', 'Great.'],
        ['Agent', 'OK, your full name?'], ['Sarah', 'Sarah Brown.'], ['Agent', 'Date of birth?'], ['Sarah', 'March the 30th.'],
        ['Agent', 'And your address?'], ['Sarah', '21 Waverley Road'], ['Agent', 'And a contact telephone number'], ['Sarah', 'I can give you my mobile'],
        ['Agent', 'Fine.'], ['Sarah', "Well, I'd like to go to Northern"], ['Agent', 'Have you been there before?'], ['Sarah', 'No, I know Southern'],
        ['Agent', 'Now, just as important'], ['Sarah', 'Well, I thought about hotel'], ['Agent', 'That sort of work'], ['Sarah', 'Such as?'],
        ['Agent', 'Well, lots of students'], ['Sarah', 'Sounds good.'], ['Agent', "Yes, I'll give you a booklet"], ['Sarah', "I won't mind that."],
        ['Agent', "And you're going to be travelling alone?"], ['Sarah', 'Yes.'], ['Agent', 'Well, before I make'], ['Sarah', 'What does it cover?'],
        ['Agent', 'Any valuable items'], ['Sarah', "Right, I'll do that."], ['Agent', 'Not a good idea'], ['Sarah', 'Oh, OK.'], ['Agent', "Right, so I've entered"],
      ],
      groups: [
        note('Complete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'International Student Travel Agency – Enquiry Form', [
          'Name: Sarah Brown',
          'Date of birth: __Q1__',
          'Address: 21 Waverley Road, Radstone, RD4 6WV',
          'Contact tel. no.: __Q2__',
          '<strong>Notes</strong>',
          '• wants to travel in __Q3__ Europe',
          '• hopes to travel by __Q4__',
          '• interested in working in a __Q5__',
          '• recommended to consider an alternative, e.g. __Q6__ work',
          '• advised to buy a European __Q7__ for travelling',
          '• given a __Q8__ with accommodation details',
          '• agreed to take out __Q9__ from the Agency',
          '• told to use an __Q10__ for contacting people',
        ], {
          1: '31 March/31st March/March 31/March 31st/31 March 1988/31st March 1988/March 31 1988/March 31st 1988/31st of March/31/03/1988',
          2: '0903775115/0903 775 115', 3: 'northern', 4: 'train', 5: 'hotel', 6: 'farm', 7: 'pass', 8: 'booklet', 9: 'insurance', 10: 'internet cafe/internet café',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi ngày sinh.', t: ['Date of birth?', "March the 30th. Oh, I'm the 31st.", '1988.'], p: 'Sarah nói ngày 30 rồi sửa lại ngay là ngày 31 (bẫy 30), năm 1988 → 31 March' },
        2: { v: 'Khi nhân viên xin số điện thoại liên lạc.', t: ['I can give you my mobile number.', '0903 775 115.'], p: 'Sarah đọc số di động → 0903775115' },
        3: { v: 'Khi nhân viên hỏi Sarah định đi đâu.', t: ["Well, I'd like to go to Northern Europe.", 'No, I know Southern Europe quite well'], p: 'Sarah đã biết Nam Âu (bẫy southern); cô muốn đi Bắc Âu → northern' },
        4: { v: 'Khi Sarah nói về phương tiện đi lại.', t: ['We always went by plane, but now I can choose.', "I'd like to go by train so I can stop off whenever I want."], p: 'Trước đây đi máy bay cùng gia đình (bẫy plane); lần này muốn đi tàu → train' },
        5: { v: 'Khi nhân viên hỏi Sarah muốn làm công việc gì.', t: 'Well, I thought about hotel work because then I might get accommodation with the job', p: 'Sarah nghĩ đến việc làm ở khách sạn vì có thể được ở luôn → hotel' },
        6: { v: 'Khi nhân viên gợi ý một lựa chọn khác.', t: ['Perhaps you should consider an alternative just in case.', 'Such as?', 'Well, lots of students like to work on a farm'], p: 'Việc khách sạn cạnh tranh nên nhân viên gợi ý làm ở trang trại → farm' },
        7: { v: 'Khi nói về vé tàu.', t: 'Buying single tickets would be expensive so the best option would be to have a European pass', p: 'Mua vé lẻ đắt (bẫy tickets); nên mua thẻ European pass đi tàu không giới hạn → pass' },
        8: { v: 'Khi Sarah hỏi thông tin về nhà nghỉ thanh niên.', t: ['Do you have any information about youth hostels which I could use to plan my route?', "Yes, I'll give you a booklet now."], p: 'Nhân viên đưa cho cô một cuốn sách nhỏ có thông tin chỗ ở → booklet' },
        9: { v: 'Khi nhân viên nói điều cần làm trước khi sắp xếp chuyến đi.', t: ['you need to have insurance for your entire trip.', 'We can arrange that for you if you like.', "Right, I'll do that."], p: 'Sarah đồng ý mua bảo hiểm qua công ty → insurance' },
        10: { v: 'Khi Sarah định mang theo laptop.', t: ['Not a good idea to lug your computer around with you.', "It's much more sensible to rely on an internet cafe."], p: 'Không nên mang laptop (bẫy laptop/computer); nên dùng quán internet để liên lạc → internet cafe' },
      },
    },
    {
      part: 2, title: 'Bibliostack Bookshop', audio: A, clip: [416.3, 771.5], cover: 'bookshop interior reading | library bookshelves interior',
      turns: [],
      groups: [
        map('Label the map below.\nChoose the correct letter, A-H, next to Questions 11-15.', [
          [11, 'seating area', 'C'], [12, 'cushions', 'F'], [13, 'computer bench', 'D'], [14, 'café bar', 'A'], [15, 'newspapers', 'H'],
        ], { img: 'img/t1/map_redraw.png' }, 'Questions 11-15'),
        mc('Choose the correct letter, A, B or C.', [
          [16, 'The bookshop aims to', ['sell as many books as possible.', 'create an energetic environment.', 'attract people to remain in the shop.'], 'C'],
          [17, "Children's books are located on the", ['ground floor.', 'highest level.', 'middle floors.'], 'B'],
          [18, 'To allow parents to relax, the shop provides', ['floor staff trained to take care of children.', 'a free nursery.', 'professional child care.'], 'C'],
          [19, 'Regular book readings are held in order to', ['sell more books.', 'bring authors together.', 'make money by charging for entry.'], 'A'],
          [20, 'At the poetry workshop, participants', ['were encouraged to have their work published.', 'learned how to become professional poets.', 'read their poems in public.'], 'C'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi quản lý giới thiệu khu trung tâm tầng trệt.', t: 'Right in the centre of this floor, but behind the bookshelf so you can\'t see it very well from here, is our main seating area', p: 'Khu ghế ngồi ở chính giữa tầng, phía sau kệ sách (nhìn từ cửa vào) → C' },
        12: { v: 'Khi quản lý chỉ sang bên trái.', t: 'And if you look to your immediate left, past the first double row of shelves, you\'ll see piles of coloured cushions in front of the window there.', p: 'Bên trái, qua hai dãy kệ đầu tiên, trước cửa sổ là chồng gối → F' },
        13: { v: 'Khi quản lý chỉ sang bên phải.', t: "On your right, between the two larger bookshelves, you'll see the computer bench", p: 'Bên phải, giữa hai kệ sách lớn là bàn máy tính → D' },
        14: { v: 'Khi quản lý nói về cuối phòng.', t: 'at the far end, just in front of the lift, you\'ll see that we provide a small cafe bar here too.', p: 'Ở cuối phòng, ngay trước thang máy là quầy cà phê → A' },
        15: { v: 'Khi quản lý nói về chỗ để báo.', t: ["And just to your right, there's a door to the cloakroom", "Then after that, there's a stand where we keep a selection of local and national newspapers."], p: 'Ngay bên phải là cửa phòng gửi áo khoác, tiếp sau đó là kệ báo → H' },
        16: { v: 'Khi quản lý nói về mục đích của cửa hàng.', t: 'but our purpose is to draw people in, to provide the kind of environment which makes them want to stay and read.', p: 'Không quan trọng bán được nhiều (bẫy A); mục đích là khiến khách muốn ở lại đọc → C' },
        17: { v: 'Khi nói về khu sách thiếu nhi.', t: 'We debated about locating children\'s books on the ground floor, or halfway up the building, like the third or fourth floor, but in the end, we decided to put them on the very top level', p: 'Tầng trệt và tầng giữa chỉ là phương án đã cân nhắc; cuối cùng đặt ở tầng trên cùng → B' },
        18: { v: 'Khi nói về khu trông trẻ dưới tầng hầm.', t: ['But they do have to pay for this service', 'we decided to employ qualified nursery staff for parents\' complete peace of mind.'], p: 'Phải trả tiền (không miễn phí) và không dùng nhân viên cửa hàng; thuê người trông trẻ chuyên nghiệp → C' },
        19: { v: 'Khi nói về buổi đọc sách của tác giả.', t: ["We don't make a charge for people to attend, but we obviously hope that some of them will want to purchase the book after listening to part of it being read aloud."], p: 'Không thu phí tham dự (bẫy C); mong khách nghe xong sẽ mua sách → A' },
        20: { v: 'Khi nói về buổi workshop thơ.', t: ["One of the country's best-known poets ran the workshop, and the participants read their poems aloud to him.", "It's extremely difficult to earn your living as a professional poet"], p: 'Người tham gia đọc to bài thơ của mình; không nói về xuất bản, và làm nhà thơ chuyên nghiệp rất khó (bẫy B) → C' },
      },
    },
    {
      part: 3, title: 'The Just-in-Time Supply System (JIT)', audio: A, clip: [771.5, 1180.3], cover: 'car factory assembly line | warehouse inventory shelves',
      turns: [
        ['Tutor', 'Thanks, Ron, for coming'], ['Ron', 'Sounds good.'], ['Tutor', 'Now, the topic was'], ['Ron', 'Yes, but actually one thing'],
        ['Tutor', 'Yes, that would have been'], ['Ron', "Yes, you're right."], ['Tutor', 'Now, you talked a bit'], ['Ron', 'Well, I tried an internet'],
        ['Tutor', 'Yes, well, there is a US'], ['Ron', 'Great.'], ['Tutor', "And while you're at it"], ['Ron', 'That would be interesting.'],
        ['Tutor', 'Now, unless you have'], ['Ron', 'Fine.'], ['Tutor', 'Yes, you were.'], ['Ron', 'And what about my transitions'],
        ['Tutor', "Well, you didn't link"], ['Ron', "Okay, I'll try"], ['Tutor', 'Now, your PowerPoint'], ['Ron', "You're right."],
        ['Tutor', 'Good point.'], ['Ron', 'I never seem to do that.'], ['Tutor', "And lastly, I'll just mention"], ['Ron', 'I know, even though'],
        ['Tutor', 'Well, despite all this'], ['Ron', 'Well, thanks for your help.'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Ron suggests that in his presentation he should have', ['given credit to the originators of the JIT idea.', 'discussed why the Japanese adopted the JIT idea.', 'explained how supermarkets used the JIT idea.'], 'A'],
          [22, 'The tutor says that in his presentation Ron omitted', ['a description of classic business theory.', 'an introductory definition of JIT.', 'a statement of the aims of JIT.'], 'B'],
          [23, 'Ron says that he found his information on standardising parts from', ['a website.', 'journal articles.', 'a textbook.'], 'C'],
          [24, 'The tutor suggests that in the service sector, JIT is', ['difficult to apply because of the absence of countable things.', 'regarded by most members of staff as unfashionable.', 'unlikely to be accepted by important clients.'], 'A'],
        ], 'Questions 21-24'),
        matching("What criticism is made of each of the following technical aspects of Ron's presentation?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.",
          ['too informal', 'too irregular', 'too predictable', 'too sudden', 'too technical', 'too unenthusiastic', 'too loosely related', 'too vague'], [
            [25, 'speed of delivery', 'B'], [26, 'purpose', 'H'], [27, 'transitions', 'D'], [28, 'visuals', 'G'], [29, 'vocabulary', 'E'], [30, 'body language', 'F'],
          ], { title: 'Criticisms', groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Ron tự nhận điều lẽ ra nên nói rõ hơn.', t: ['one thing I should have made clearer and talked about was the fact that the Americans actually pioneered the idea of just-in-time', 'Henry Ford and his cars'], p: 'Ron lẽ ra nên nói rằng người Mỹ (Henry Ford) mới là người khởi xướng ý tưởng JIT = ghi nhận người khởi xướng → A' },
        22: { v: 'Khi tutor nói điều Ron bỏ sót.', t: ['I would suggest that you should have stopped and clearly defined just-in-time for your seminar colleagues.', 'But you never told us that JIT simply means waiting until the last moment to order new supplies'], p: 'Ron có nói mục đích và lý thuyết kinh doanh cổ điển (bẫy A, C) nhưng không định nghĩa JIT → B' },
        23: { v: 'Khi tutor hỏi Ron lấy dữ liệu ở đâu.', t: ['it was too technical for me.', 'So, in the end, I got my data from a textbook called Learning from Toyota.'], p: 'Website quá chuyên môn, bài báo không hữu ích (bẫy A, B); cuối cùng lấy từ sách giáo khoa → C' },
        24: { v: 'Khi tutor nói về ngành dịch vụ.', t: ["where customers are paying for something that they can't actually see or count.", "it hasn't proved so successful in the service sector as it has with the manufacturing of goods that can be quantified."], p: 'Dịch vụ không có thứ đếm được nên JIT khó áp dụng; JIT vẫn đang thịnh hành (bẫy B) → A' },
        25: { v: 'Khi Ron nói về tốc độ trình bày.', t: "Actually, I wasn't happy with my delivery. I sometimes seemed to talk fast and sometimes slow.", p: 'Lúc nhanh lúc chậm = không đều → B (too irregular)' },
        26: { v: 'Khi tutor nhận xét mục đích bài thuyết trình.', t: ["your purpose wasn't very specific.", 'Make it clear and concise and not so general.'], p: 'Mục đích không cụ thể, quá chung chung → H (too vague)' },
        27: { v: 'Khi Ron hỏi về phần chuyển ý.', t: ['You went too quickly from one to the next.', 'It was all just too abrupt.'], p: 'Chuyển phần quá nhanh, quá đột ngột → D (too sudden)' },
        28: { v: 'Khi tutor nhận xét hình ảnh PowerPoint.', t: "nice as they were as pictures, they didn't have much to do with what you were talking about", p: 'Hình đẹp nhưng ít liên quan đến nội dung → G (too loosely related)' },
        29: { v: 'Khi Ron nói về từ vựng.', t: ["they just didn't understand some of the vocabulary I was using.", 'So, you need to simplify and try to put things in everyday English.'], p: 'Khán giả là người ngoài ngành, không hiểu từ chuyên môn; cần đơn giản hoá → E (too technical)' },
        30: { v: 'Khi tutor nhận xét ngôn ngữ cơ thể.', t: ["You didn't use gestures and you just stood straight without any animation.", "It didn't make you seem very interested in the subject."], p: 'Đứng im, không cử chỉ, trông không hứng thú với chủ đề → F (too unenthusiastic)' },
      },
    },
    {
      part: 4, title: 'Dyscalculia', audio: A, clip: [1180.3, 1441.9], cover: 'child learning mathematics counting | abacus counting child',
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Dyscalculia', [
          '• Most schools use the __Q31__ method of teaching mathematics',
          '• Children have difficulty learning the concept of __Q32__ and sequence',
          '• In class, they are taught with everyday practical problems, e.g. dealing with __Q33__',
          '• Children with this mathematics disorder should practise more calculations to develop more __Q34__',
          '• Solution: teachers encourage them to solve problems by making __Q35__',
          '• Exercises, e.g. breathing, relaxation and __Q36__',
          '• Researchers would like to find a __Q37__ with language learning difficulties',
          '• Children are likely to have some problems with __Q38__',
          '• With this approach, children may no longer need __Q39__ training',
          '• The disorder affects not only children but also their families and __Q40__',
        ], { 31: 'traditional', 32: 'time', 33: 'money', 34: 'confidence', 35: 'guesses', 36: 'walking', 37: 'link', 38: 'concentration', 39: 'additional', 40: 'teachers' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về cách dạy toán hiện nay.', t: 'Currently, most schools use the traditional method of teaching mathematics', p: 'Hầu hết trường dùng phương pháp truyền thống → traditional' },
        32: { v: 'Khi nói về khái niệm trẻ khó nắm bắt.', t: 'especially when it comes to understanding the concept of time and sequence.', p: 'Trẻ khó hiểu khái niệm thời gian và trình tự → time' },
        33: { v: 'Khi nói về ví dụ thực tế trong lớp.', t: 'They engage the students in activities that involve dealing with money', p: 'Hoạt động liên quan đến xử lý tiền bạc → money' },
        34: { v: 'Khi nói về việc luyện tính toán nhiều hơn.', t: 'To boost their confidence, children with mathematics disorders are encouraged to practise more calculations and problem-solving.', p: 'Luyện tính nhiều hơn để tăng sự tự tin → confidence' },
        35: { v: 'Khi nói về chiến lược giải bài.', t: 'Teachers also implement strategies that encourage children to make educated guesses when they encounter mathematical problems.', p: 'Giáo viên khuyến khích trẻ phỏng đoán có cơ sở → guesses' },
        36: { v: 'Khi liệt kê các bài tập.', t: 'they incorporate various exercises, such as breathing techniques, relaxation exercises, and even walking breaks', p: 'Thở, thư giãn và cả nghỉ giải lao đi bộ → walking' },
        37: { v: 'Khi nói về mối quan tâm của các nhà nghiên cứu.', t: 'Researchers in this field are particularly interested in finding a potential link between Dyscalculia and language learning difficulties.', p: 'Tìm mối liên hệ giữa chứng khó học toán và khó khăn học ngôn ngữ → link' },
        38: { v: 'Khi nói về vấn đề trẻ thường gặp.', t: 'Children with Dyscalculia often struggle with concentration and maintaining focus.', p: 'Trẻ thường khó tập trung → concentration' },
        39: { v: 'Khi nói về kết quả của cách tiếp cận này.', t: 'children may no longer require additional treatment or training specifically focused on their mathematics disorder.', p: 'Trẻ có thể không cần điều trị hay luyện tập bổ sung nữa → additional' },
        40: { v: 'Khi nói về những người bị ảnh hưởng.', t: "It's important to note that Dyscalculia affects not only the children, but also their families and teachers.", p: 'Ảnh hưởng không chỉ trẻ mà cả gia đình và giáo viên → teachers' },
      },
    },
  ],
};
