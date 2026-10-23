// Vol 9 – Test 7 (same layout as vol9_t1.js; plan = the image embedded in the question docx, redrawn without the watermark
// → img/t7/map_redraw.png). P3 = bank "The artist Samuel Prout" (Actual Test 5 / Vol 2 - Test 8 P3): same questions, key
// 10/10, transcript 6-gram 53 % → reused.
// Audio starts mid-sentence in the Part 1 introduction ("...between an assistant at a car service station and a customer");
// P1 plays the example first → cut. No "end of section 1/2" lines; Part 2 ends at "end of part two." (759.3 s).
// Source key error fixed by the recording: Q15 A → C (the council "have authorised the spending" on the lighting; the extra member
// of staff is only applied for, "this decision will be made in the next few weeks").
// Question paper wording tidied (Q11 "Why David Laws leading…", Q13-15 broken English) without changing the options' meaning.
const { note, mc, map } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 7.mp4';

module.exports = {
  vol: 9, test: 7, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 7-L.docx',
  rawRe: RE,
  sections: [
    {
      part: 1, title: 'Car Servicing', audio: A, clip: [0, 381.7], cover: 'car service garage mechanic | car workshop lift',
      cut: [['On this occasion only', 'Listen carefully and answer questions one and two.']],
      fix: [['06:14', '']],
      turns: [
        ['Assistant', 'Good morning servicing'], ['Ian', "Good morning, I'd like"], ['Assistant', 'Certainly sir.'], ['Ian', 'Ian Croft.'], ['Assistant', 'Right, and have you'],
        ['Ian', "No, I've only"], ['Assistant', "Right, so I'll need"], ['Ian', 'BD51STR.'], ['Assistant', 'Is that B for Bravo'], ['Ian', "Yes, that's right."],
        ['Assistant', 'And the make'], ['Ian', "It's a Vida."], ['Assistant', 'Right, and is that the estate?'], ['Ian', 'No, the four-door'],
        ['Assistant', 'Good, and do you know'], ['Ian', 'Mmm, about'], ['Assistant', 'Right, and can you tell me'], ['Ian', "It's done a lot."],
        ['Assistant', 'Right, well now'], ['Ian', 'Yes, a few.'], ['Assistant', 'OK, we do automatically'], ['Ian', "Then, it's not a big"],
        ['Assistant', "Right, we'll have a look"], ['Ian', 'Oh yes, on one of the passenger'], ['Assistant', "Yes, that's quite important"], ['Ian', 'Er, there was something.'],
        ['Assistant', 'Would you like us'], ['Ian', 'Yes, please.'], ['Assistant', 'Certainly.'], ['Ian', 'OK.'], ['Assistant', "Yes, we'll have to order"],
        ['Ian', 'Great.'], ['Assistant', 'So, when would you like'], ['Ian', 'Well, do you have'], ['Assistant', 'No, the 5th.'], ['Ian', "Yes, that's fine."],
        ['Assistant', 'And the service will take'], ['Ian', 'Yes, that would be good'], ['Assistant', "We'll see what we can do."], ['Ian', "It's 361 College Road"],
        ['Assistant', 'Yes, please.'], ['Ian', 'Right, 07847'], ['Assistant', 'Lovely.'],
      ],
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Car Servicing', [
          '<em>Example</em> Customer name: Ian Croft',
          '<strong>Car details</strong>',
          'Registration number: __Q1__',
          'Make and model: Vida (4-door saloon)',
          'Date of manufacture: 2001',
          'Number of miles: __Q2__',
          '<strong>Problems</strong>',
          '• needs two new __Q3__',
          '• the inside __Q4__ needs fixing',
          '• one passenger seat __Q5__ is stuck',
          '• the __Q6__ needs replacing',
          '• the __Q7__ brakes of the car need attention',
          '• needs a spare __Q8__',
          '<strong>Service arrangements</strong>',
          'Date/Time: Tuesday 5 October 8.00 a.m.',
          'Courtesy car? Yes, preferably __Q9__',
          '<strong>Customer details</strong>',
          'Address: 361 College Road, Norwich',
          'Phone: __Q10__',
        ], { 1: 'BD51STR/BD51 STR', 2: '180,000/180000', 3: 'tyres/tires', 4: 'light', 5: 'belt', 6: 'radio', 7: 'front', 8: 'key', 9: 'automatic', 10: '07847 355780/07847355780' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi biển số xe.', t: ['So could I have a registration number please?', 'BD51STR.', 'Is that B for Bravo at the beginning?', "Yes, that's right."], p: 'Biển số xe, chữ đầu là B → BD51STR' },
        2: { v: 'Khi nhân viên hỏi số dặm đã chạy.', t: "Yes, it's 180,000 miles.", p: 'Xe đã chạy 180.000 dặm → 180,000' },
        3: { v: 'Khi Ian nêu các vấn đề của xe.', t: ['I think a couple of the tyres probably need replacing.', "They're getting a bit worn."], p: 'Hai chiếc lốp cần thay → tyres' },
        4: { v: 'Khi Ian nói về cửa xe.', t: 'When you open the car door, the light ought to come on inside automatically, but it seems to have stopped working.', p: 'Đèn bên trong xe không sáng khi mở cửa → light' },
        5: { v: 'Khi Ian nói về ghế sau.', t: ["Oh yes, on one of the passenger seats at the back, you can't fasten the belt.", 'It seems to have stuck.'], p: 'Dây an toàn ở một ghế sau bị kẹt → belt' },
        6: { v: 'Khi Ian nói thứ cần thay.', t: "Well, one thing that's actually going to need replacing, I think, is the radio.", p: 'Radio cần thay mới → radio' },
        7: { v: 'Khi Ian nói về phanh.', t: "I know you'll check the brakes in a service, but can you have a particular look at the front ones?", p: 'Nhờ kiểm tra kỹ phanh trước → front' },
        8: { v: 'Khi Ian nói về chìa khoá.', t: 'And the other thing is, I only have one key for the car and I really need a spare.', p: 'Chỉ có một chìa nên cần chìa dự phòng → key' },
        9: { v: 'Khi nhân viên hỏi về xe thay thế.', t: 'Yes, that would be good, but can I have an automatic if possible, please?', p: 'Ian muốn xe số tự động → automatic' },
        10: { v: 'Khi nhân viên xin số điện thoại.', t: ['A daytime number would be best, if possible.', 'Right, 07847 355780.'], p: 'Số điện thoại ban ngày → 07847 355780' },
      },
    },
    {
      part: 2, title: 'Rosedale Library', audio: A, clip: [381.7, 759.3], cover: 'public library interior reading room | library building seaside',
      turns: [],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'Why is David Laws leading the meeting instead of Penny Williams today?', ['Penny Williams is not well.', 'David Laws is the director now.', 'The meeting has been postponed.'], 'A'],
          [12, 'What does David say has been a problem with guest speaker talks?', ['expensive tickets', 'lack of publicity', 'inconvenient time'], 'B'],
          [13, 'What does David say about the break-in at the library?', ['The building suffered some damage.', 'Some valuable items were stolen.', 'The thieves had prepared well.'], 'A'],
          [14, 'Why do they want to extend the library?', ['It has not been renovated since it was founded.', 'It needs to double the number of computers.', 'The number of visitors has increased.'], 'C'],
          [15, 'The investment from the city council will be used to', ['recruit extra staff.', 'buy more computers.', 'improve the lighting.'], 'C'],
        ], 'Questions 11-15'),
        map('Label the plan below.\nChoose the correct letter, A-H, next to Questions 16-20.\n\nRosedale Library', [
          [16, "Children's room", 'C'], [17, 'Community room', 'A'], [18, 'Café', 'B'], [19, 'Academic study room', 'H'], [20, 'Multimedia room', 'G'],
        ], { img: 'img/t7/map_redraw.png' }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi David giới thiệu bản thân.', t: ["I'm the new personal assistant to Penny Williams, the library director.", 'Penny was supposed to be leading this meeting, but due to unexpected illness, I will be taking her place this morning.', 'We felt that this would be better than postponing the meeting to a later date.'], p: 'David là trợ lý (không phải giám đốc), buổi họp không hoãn; Penny bị ốm đột xuất → A' },
        12: { v: 'Khi nói về các buổi nói chuyện của diễn giả.', t: ["The guest speaker talks this year have been incredibly popular, and the slight rise in ticket price has not put anyone off.", "It has, however, come to our attention that some people have missed events because they didn't know they were on."], p: 'Giá vé tăng không ảnh hưởng (bẫy A); vấn đề là nhiều người không biết có sự kiện = thiếu quảng bá → B' },
        13: { v: 'Khi nói về vụ đột nhập.', t: ['while the thief or thieves actually left empty-handed, they did smash a number of windows and kick down a door trying to get in.', 'Police believe the offenders were just taking a chance'], p: 'Không mất gì (loại B), kẻ trộm chỉ "thử vận may" (loại C); chúng đập vỡ cửa sổ, đạp đổ cửa = toà nhà bị hư hại → A' },
        14: { v: 'Khi nói lý do cần mở rộng thư viện.', t: ['Since opening, the number of books on our shelves and other items has more than doubled, and visitor numbers have increased 20% in the last 10 years.', 'There is, therefore, a clear need for an extension.'], p: 'Đã sửa năm 1969 (loại A); sách tăng gấp đôi (bẫy B) và lượng khách tăng 20% → C' },
        15: { v: 'Khi nói về khoản hỗ trợ của hội đồng thành phố.', t: ["We're also aware that the lighting is quite poor, but you'll shortly see a big difference because the City Council continued to support us and have authorised the spending in this area."], p: 'Máy tính đã lắp từ tháng 6 (loại B), thêm nhân viên còn chờ duyệt (loại A); hội đồng duyệt chi cho hệ thống chiếu sáng → C' },
        16: { v: 'Khi nói về phòng mới sau lối dốc.', t: ['Behind it, the plan is for an access ramp inside the existing building', "This new room is designed to be light and airy, and could be the ideal location for a new children's room looking out onto the park."], p: 'Phòng mới phía sau lối dốc, nhìn ra công viên → C' },
        17: { v: 'Khi nói về phòng cộng đồng.', t: ['At the bottom of these, on the left, would be the adult fiction section, so no change there.', 'But behind this is proposed to construct a new community room for public lectures, special events and so forth.'], p: 'Phía sau khu tiểu thuyết người lớn là phòng cộng đồng → A' },
        18: { v: 'Khi nói về quán cà phê.', t: 'To the right of the adult fiction room, with magnificent views of the sea, a cafe could provide visitors with light refreshments', p: 'Bên phải khu tiểu thuyết người lớn, nhìn ra biển → B' },
        19: { v: 'Khi nói về phòng học thuật.', t: "The room looking out onto both Queen's Parade and Roberts Avenue would be the academic study room", p: 'Phòng nhìn ra cả Queen\'s Parade và Roberts Avenue (góc dưới bên phải) → H' },
        20: { v: 'Khi nói về phòng đa phương tiện.', t: "Also facing Roberts Avenue but not Queen's Parade would be the multimedia room with our extensive audio collection right behind it.", p: 'Nhìn ra Roberts Avenue nhưng không ra Queen\'s Parade, ngay trước khu Audio Collection → G' },
      },
    },
    { part: 3, title: 'The artist Samuel Prout', reuse: '6a53d9035c459ab074cec0ca' },
    {
      part: 4, title: "Case Study: Chocozine's Difficult Decision", audio: A, clip: [1183.9, 1511.3], cover: 'chocolate bars factory | chocolate bar toppings',
      fix: [['The professor is discussing a case study of a company in North America called Chocozine. ', '']],
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', "Case Study: Chocozine's difficult decision", [
          '<strong>Background</strong>',
          '• Smith and his colleagues noticed the spread of mass-customisation in many US __Q31__',
          '• They decided to apply the idea to chocolate, and allow clients to decide which ingredients they wanted.',
          "• They called their company 'Chocozine'.",
          '<strong>The email order</strong>',
          '• A European retailer wanted 15,000 chocolate bars to use as a __Q32__ for customers.',
          '• The deal could improve their sales and provide __Q33__.',
          '<strong>But there were risks:</strong>',
          '• They might not have sufficient time for the job.',
          '• If they failed, it could affect their finances and their __Q34__',
          '• They only had three __Q35__, which was not enough.',
          '<strong>They attempt to subcontract</strong>',
          '• At first they couldn\'t find a subcontractor with the right __Q36__',
          '• A Harvard professor invited Smith to speak to students.',
          '• Many students said it would be a __Q37__ to do the deal.',
          '• One student had a __Q38__ in the chocolate industry.',
          '• But this subcontractor had trouble with the unusual __Q39__ of the chocolate bar.',
          '• Chocozine finally declined the order, but their sales improved anyway.',
          '<strong>Comment</strong>',
          '• Accepting __Q40__ orders has created severe problems for many new businesses.',
        ], { 31: 'industries', 32: 'gift', 33: 'publicity', 34: 'reputation', 35: 'machines', 36: 'toppings', 37: 'mistake', 38: 'contact', 39: 'shape', 40: 'big' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi giới thiệu ý tưởng của Eric Smith.', t: 'A man called Eric Smith and two of his colleagues were struck by the mass customisation movement that was spreading through a large number of industries in the US.', p: 'Xu hướng cá nhân hoá hàng loạt lan rộng trong nhiều ngành công nghiệp ở Mỹ → industries' },
        32: { v: 'Khi nói về đơn hàng qua email.', t: 'They wanted to give these as a gift in their high-end stores in New York City, Miami and Los Angeles during the holiday shopping season.', p: 'Nhà bán lẻ muốn dùng sô-cô-la làm quà tặng khách → gift' },
        33: { v: 'Khi nói về lợi ích của đơn hàng.', t: 'Smith and his co-founders knew it could also be very good publicity', p: 'Đơn hàng cũng là cơ hội quảng bá rất tốt → publicity' },
        34: { v: 'Khi nói về rủi ro.', t: "what about the financial fallout as well as the possible damage to the company's reputation?", p: 'Thất bại có thể ảnh hưởng tài chính và danh tiếng công ty → reputation' },
        35: { v: 'Khi nói về năng lực sản xuất.', t: ['as the number of machines they had was limited.', "They only had three of them, and that clearly wasn't going to be enough."], p: 'Chỉ có ba cái máy, không đủ → machines' },
        36: { v: 'Khi Smith tìm nhà thầu phụ.', t: "but he couldn't find anyone who had experience of making bars with the type of melted toppings that Chocozine used.", p: 'Không tìm được ai có kinh nghiệm làm lớp phủ tan chảy kiểu Chocozine → toppings' },
        37: { v: 'Khi Smith hỏi ý kiến sinh viên MBA.', t: 'Many of the students thought that doing the deal with a luxury retailer would be a mistake.', p: 'Nhiều sinh viên cho rằng nhận đơn này là sai lầm → mistake' },
        38: { v: 'Khi nói về một sinh viên sau buổi học.', t: 'he said he had a contact in the business who might be interested in doing the job.', p: 'Sinh viên có một người quen trong ngành → contact' },
        39: { v: 'Khi nói về khó khăn của nhà thầu phụ mới.', t: 'including how to faithfully reproduce the distinctive shape of the Chocozine bars.', p: 'Khó tái tạo hình dạng đặc biệt của thanh sô-cô-la → shape' },
        40: { v: 'Khi rút ra bài học.', t: 'And taking on too big an order has destroyed many a small business.', p: 'Nhận đơn quá lớn đã làm sụp đổ nhiều doanh nghiệp nhỏ → big' },
      },
    },
  ],
};
