// Vol 10 – Test 7 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 7 Listening": question paper PDF on a public Google
// Drive link + key + transcript). The test = "IELTS Recent Actual Tests 1 – Listening Test 5" (DOL AT1_L5; also
// ieltspracticeonline "Practice Test 25"). Audio + speaker-labelled transcript from the cached DOL sections
// (web/vol10/dolprep.js). P1: the bank's "Apartment Rental In Calgary’s Market" (DOL AT1_L5_S1) is the same recording but
// another question set (Q1 living room / Q5 a study / Q8 different settings, TWO words) → the Vol paper is its own section.
// P3 Q25–30: Vol prints a gap table (DOL: multiple choice). Key = izone, checked against the transcript.
// DOL cue text cut mid-sentence twice (P1 "kitchen and living room are…", P3 "get you an…") — kept with "…".
const fs = require('fs'), path = require('path');
const { note, table, mc } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');
const B = '__Q';

module.exports = {
  vol: 10, test: 7,
  sections: [
    {
      part: 1, title: 'Apartments near the Campus', audio: 'LISTENING/test 7/part 1.mp3', clip: [0, 452],
      cover: 'apartment living room | student apartment', transcript: TX('t7p1'),
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
          ['Address', 'Rooms', 'Facilities', 'Providing', 'Price', 'Problem'], [
            ['Beatle Road', '3 bedrooms, a bathroom, and a living room', 'Example: restaurant', 'Internet & utilities', `$ ${B}1__`, 'Garden: too big to clean up'],
            ['Oakington Avenue (on-campus)', `3 bedrooms, a ${B}2__, and a living room`, `Shared living room, bathroom, kitchen, and ${B}3__`, 'Living room furniture', '$400/$340', `Due to some shared facilities, it seems ${B}4__`],
            ['Mead Street', '2 bedrooms, a living room, and a study', `${B}5__`, `${B}6__`, '$600', `Sometimes a little bit ${B}7__`],
            ['Devon Close (on-campus)', 'a bedroom, a living room, a study, and a dining hall', `${B}8__`, `${B}9__`, '$500', `Without ${B}10__`],
          ], { 1: '435', 2: 'kitchen', 3: 'washing machine', 4: 'inconvenient', 5: 'TV and VCR / a TV and VCR', 6: 'washbasin / a washbasin', 7: 'noisy', 8: 'lamp / a lamp', 9: 'evening meals / free evening meals', 10: 'bathroom / a bathroom' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi người môi giới nói giá căn hộ ở Beatle Road.', t: 'Well, it’s $435 a month, including Internet and utilities.', p: 'Căn Beatle Road giá 435 đô mỗi tháng, đã gồm Internet và tiện ích → 435' },
        2: { v: 'Khi giới thiệu căn hộ ở Oakington Avenue.', t: 'It is right near the building where you have classes, and the kitchen and living room are…', p: 'Căn 3 phòng ngủ ở Oakington Avenue có bếp và phòng khách → kitchen' },
        3: { v: 'Khi nói những thứ dùng chung trong ký túc xá.', t: 'but since it’s a dormitory, the living room, bathroom, kitchen, and washing machine are all shared.', p: 'Phòng khách, phòng tắm, bếp và máy giặt đều dùng chung → washing machine' },
        4: { v: 'Khi người thuê nhận xét về việc dùng chung.', t: 'Yikes, even with the air conditioner, it sounds really inconvenient to have to share facilities.', p: 'Dùng chung tiện nghi nghe rất bất tiện → inconvenient' },
        5: { v: 'Khi nói tiện nghi ở căn Mead Street.', t: 'Well, this place has a great TV and VCR, but no DVD player.', p: 'Người thuê muốn TV và đầu DVD nhưng căn này chỉ có TV và đầu VCR (không có DVD – bẫy) → TV and VCR' },
        6: { v: 'Khi hỏi thêm tiện nghi được cung cấp.', t: 'As you said, weird enough, it also comes with a washbasin.', p: 'Căn hộ có bồn rửa mặt; không có máy giặt (bẫy) → washbasin' },
        7: { v: 'Khi nói vị trí căn Mead Street.', t: 'It would be affordable, but it would get pretty noisy.', p: 'Ở số 2500 Mead Street nhiều quán bar nên khá ồn → noisy' },
        8: { v: 'Khi giới thiệu căn ở Devon Close.', t: 'It comes with a living room and a study, and includes a really nice lamp in the study that has a bunch of different settings.', p: 'Phòng làm việc có một chiếc đèn rất đẹp với nhiều chế độ → lamp' },
        9: { v: 'Ngay sau đó, khi nói về nhà ăn.', t: 'There’s a dining hall downstairs so all evening meals are free.', p: 'Có nhà ăn ở tầng dưới, mọi bữa tối đều miễn phí; bữa sáng, trưa phải trả tiền (bẫy) → evening meals' },
        10: { v: 'Khi nói giá và nhược điểm căn Devon Close.', t: 'It’s alright - $500 per month, but there’s no bathroom.', p: 'Giá 500 đô nhưng không có phòng tắm trong căn hộ → bathroom' },
      },
    },
    {
      part: 2, title: 'Waste Sorting, Collection and Disposal', audio: 'LISTENING/test 7/part 2.mp3', clip: [0, 328],
      cover: 'recycling bins street | garbage truck', transcript: TX('t7p2'),
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Waste sorting, collection, and disposal', [
          'Necessary characteristics of dustbins: Solid and __Q11__',
          '<strong>Waste sorting</strong>',
          'Three kinds: Recyclable garbage (blue or green bin); Unrecyclable garbage (yellow bin); Toxic waste (red bin)',
          '<strong>Waste collection</strong>',
          'Commercial waste collection: It mainly refers to __Q12__ waste.',
          'Warning signs state not to __Q13__ blue/green bins.',
          'Those __Q14__ metals will cause environmental pollution.',
          'Household waste collection: All kitchen garbage should be put into a __Q15__ bag.',
          '<strong>Waste disposal</strong>',
          'The garbage disposal plant is situated in an __Q16__ space or field.',
          'The waste is disposed of at least once every __Q17__.',
          'The dustbin should be cleared at night because of __Q18__.',
          'The waste is mainly produced by __Q19__, industry, retail, and offices.',
          'Please do not dispose of __Q20__ in any of the bins.',
        ], { 11: 'waterproof', 12: 'building', 13: 'overfill', 14: 'heavy', 15: 'plastic', 16: 'open', 17: 'four weeks / 4 weeks', 18: 'traffic', 19: 'businesses', 20: 'stones' }, 'Questions 11-20'),
      ],
      expl: {
        11: { v: 'Khi nói về thùng rác.', t: 'Also, since these things sit out on the curb overnight rain or shine, they have to be waterproof.', p: 'Thùng làm bằng vật liệu chắc chắn và phải chống nước → waterproof' },
        12: { v: 'Khi nói về dịch vụ thứ nhất.', t: 'The first is commercial waste collection, or trash collection from buildings.', p: 'Thu gom rác thương mại = rác từ các tòa nhà → building' },
        13: { v: 'Khi nói về biển cảnh báo.', t: 'You’ll notice in your office buildings there are signs that warn you not to overfill these bins.', p: 'Biển cảnh báo không được để thùng xanh quá đầy → overfill' },
        14: { v: 'Khi nói về kim loại.', t: 'These heavy metals are harmful to the environment and exacerbate our city’s existing pollution problem.', p: 'Chì, đồng là kim loại nặng, gây ô nhiễm → heavy' },
        15: { v: 'Khi nói về rác sinh hoạt.', t: 'Please remember to keep garbage like kitchen waste in a plastic bag.', p: 'Rác nhà bếp phải cho vào túi nhựa → plastic' },
        16: { v: 'Khi nói nơi xử lý rác.', t: 'We take all the garbage to one of a number of garbage disposal plants, each of which is located in the middle of an open space of some sort.', p: 'Nhà máy xử lý rác nằm giữa một khoảng đất trống → open' },
        17: { v: 'Ngay sau đó.', t: 'Waste is collected and then disposed of once every four weeks.', p: 'Rác được xử lý bốn tuần một lần; “weekly/biweekly” chỉ là kế hoạch (bẫy) → four weeks' },
        18: { v: 'Khi nói về giờ thu gom.', t: 'The garbage trucks make their rounds to clear the bins at night in order to avoid traffic.', p: 'Xe rác đi vào ban đêm để tránh kẹt xe → traffic' },
        19: { v: 'Khi nói nguồn rác chính.', t: 'Yep, the main waste producers are actually businesses, industrial facilities, retail, and offices.', p: 'Nguồn thải rác chính là các doanh nghiệp, cơ sở công nghiệp, bán lẻ và văn phòng; rác hộ gia đình chỉ là phần nhỏ (bẫy) → businesses' },
        20: { v: 'Khi nói về phân loại sau khi thu gom.', t: 'Items such as stones, which should not be disposed of in our bins, are separated out and discarded.', p: 'Đá không được bỏ vào thùng rác → stones' },
      },
    },
    {
      part: 3, title: 'A New Essay in Psychology', audio: 'LISTENING/test 7/part 3.mp3', clip: [0, 314],
      cover: 'student writing essay | psychology textbook', transcript: TX('t7p3'),
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS for each answer.', '', [
          'The research topic should come from one of the headings in the __Q21__.',
          'At least one reference needs to be from __Q22__.',
          'The data Julie found on past experiments is in __Q23__.',
          'Ricky has pointed out that aside from journals, he can also use __Q24__ about scientific experiments.',
        ], { 21: 'note system / the note system', 22: 'scientific research', 23: 'scientific journals', 24: 'the internet / internet / information from internet / the information from internet' }, 'Questions 21-24'),
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', ['The format of papers', ''], [
          ['The paper should be written in:', `${B}25__`],
          ['The title should be in:', `${B}26__`],
          ['The report has to be:', `${B}27__`],
          ['Number the page on the:', `${B}28__ corner`],
          ['The margin should be:', `${B}29__ pixels wide`],
          ['Students should write down their:', `${B}30__`],
        ], { 25: 'double-spaced / double spaced', 26: 'italics', 27: 'typed', 28: 'top right', 29: '3.25', 30: 'ID number' }, 'Questions 25-30'),
      ],
      expl: {
        21: { v: 'Khi Julie kể về bài luận mới.', t: 'You need to choose one of the bold headings from the note system and research it.', p: 'Chọn một trong các tiêu đề in đậm trong hệ thống ghi chú → note system' },
        22: { v: 'Khi Ricky hỏi yêu cầu của bài.', t: 'You need to find scientific research that supports your claim as one of your references.', p: 'Một trong các tài liệu tham khảo phải là nghiên cứu khoa học → scientific research' },
        23: { v: 'Khi Julie nói về đề tài của mình.', t: 'I’ve already found a few experiments in scientific journals.', p: 'Julie tìm được vài thí nghiệm trong các tạp chí khoa học → scientific journals' },
        24: { v: 'Khi Ricky nói về nguồn tài liệu.', t: 'I’m sure there is lots of stuff about it on the Internet. Are we allowed to use information from the Internet?', p: 'Ngoài tạp chí, Ricky có thể dùng thông tin trên Internet (nhưng không làm nguồn chính) → the internet' },
        25: { v: 'Khi Ricky hỏi cách trình bày.', t: 'Yeah, Professor Johnson wants it double-spaced.', p: 'Bài phải giãn dòng đôi → double-spaced' },
        26: { v: 'Khi nói về tiêu đề.', t: 'Anyway, you also need to put the title in italics, and...', p: 'Tiêu đề chính in nghiêng; tiêu đề mục có thể in đậm (bẫy) → italics' },
        27: { v: 'Khi Ricky hỏi bài có phải đánh máy không.', t: 'Yep, it’s got to be typed.', p: 'Bài phải đánh máy → typed' },
        28: { v: 'Khi nói về đánh số trang.', t: 'Make sure it goes up in the top right corner.', p: 'Số trang đặt ở góc trên bên phải → top right' },
        29: { v: 'Khi nói về lề.', t: 'Also, make sure the margins are 3.25 pixels wide.', p: 'Lề rộng 3.25 pixel → 3.25' },
        30: { v: 'Cuối đoạn hội thoại.', t: 'Oh, I almost forgot - remember to put down your ID number on your report.', p: 'Phải ghi mã số sinh viên lên bài; ngày tháng chỉ ghi ở trang bìa (bẫy) → ID number' },
      },
    },
    {
      part: 4, title: 'Water Supply in Australia', audio: 'LISTENING/test 7/part 4.mp3', clip: [0, 423],
      cover: 'dry Australian landscape | water dam reservoir', transcript: TX('t7p4'),
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS for each answer.', '', [
          'This paper pertains to one major concern about water for people everywhere – that is a __Q31__ source of water.',
          'Australia is a dry continent and thus water is very __Q32__.',
          'We utilise the most water for __Q33__.',
          'We discover the purest water in rivers, creeks, __Q34__.',
          'Rainfall is a useful source of water unless there is significant __Q35__.',
          'People in the West wish the water to be __Q36__.',
          'Water is highly prone to __Q37__.',
          'In the home, one of the most important uses of water is for __Q38__.',
        ], { 31: 'safe and reliable', 32: 'scarce', 33: 'washing', 34: 'lakes and dams', 35: 'air pollution', 36: 'pure and safe', 37: 'contamination', 38: 'drinking' }, 'Questions 31-38'),
        mc('Choose the correct letter, A, B or C.', [
          [39, 'The mechanisms for water management are', ['inadequate.', 'nearly adequate.', 'admirable.'], 'A'],
          [40, 'The government’s 1989 White Paper', ['caused a concern.', 'is unreliable.', 'is inconclusive.'], 'B'],
        ], 'Questions 39-40'),
      ],
      expl: {
        31: { v: 'Đầu bài giảng.', t: 'Seriously, though, a safe and reliable source of water is one of the great concerns of people everywhere.', p: 'Nguồn nước an toàn và đáng tin cậy là mối lo của mọi người → safe and reliable' },
        32: { v: 'Khi nói về nước ở Úc.', t: 'As noted already, here down under, the water supply is extremely scarce.', p: 'Nguồn nước ở Úc cực kỳ khan hiếm → scarce' },
        33: { v: 'Khi nói về mục đích dùng nước.', t: 'Most water is actually used for washing.', p: 'Uống nước không phải mục đích chính (bẫy); phần lớn nước dùng để tắm giặt → washing' },
        34: { v: 'Khi nói nguồn nước tinh khiết nhất.', t: 'The purest water is found in rivers, creeks, lakes, and dams.', p: 'Nước tinh khiết nhất có ở sông, suối, hồ và đập → lakes and dams' },
        35: { v: 'Khi quay lại vấn đề nước mưa.', t: 'a further problem is that rain is a useful source of water only if air pollution is fairly mild.', p: 'Nước mưa chỉ hữu ích nếu ô nhiễm không khí nhẹ, tức là không dùng được khi ô nhiễm không khí nặng → air pollution' },
        36: { v: 'Khi nói về người phương Tây.', t: 'This is becoming a huge concern for people in the West, who want their water to be pure and safe.', p: 'Người phương Tây muốn nước tinh khiết và an toàn → pure and safe' },
        37: { v: 'Khi nói về mọi nguồn nước.', t: 'Now, whatever the source of water, we can never afford to forget that all water is highly vulnerable to contamination.', p: '“highly vulnerable to” = highly prone to; dễ bị nhiễm bẩn → contamination' },
        38: { v: 'Khi nói về nước trong gia đình.', t: 'it\'s no surprise to us that one of the most important domestic uses of water is for drinking.', p: '“domestic uses” = in the home; một trong những mục đích quan trọng nhất là để uống → drinking' },
        39: { v: 'Khi nói về giải pháp quản lý nước.', t: 'So the mechanisms for water management are, in a word, insufficient.', p: '“insufficient” = inadequate; các sáng kiến được khen là nỗ lực đáng ngưỡng mộ (bẫy C) nhưng giải pháp “not nearly adequate” (bẫy B) → A' },
        40: { v: 'Cuối bài, khi nói về Sách trắng 1989.', t: 'If you compare the numbers offered in the paper with those in the text, you’ll find that the report is rather untrustworthy.', p: '“untrustworthy” = unreliable; “inconclusive”, “caused quite a concern” nói về dữ liệu trước đó (bẫy A, C) → B' },
      },
    },
  ],
};
