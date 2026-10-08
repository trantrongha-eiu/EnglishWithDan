// Vol 2 – Test 6 (PDF "listening/test 6/Test 6.pdf" p1–7, key p8; audio test 6/part 1–4.mp3)
// Transcripts: Whisper + Otter merge; P1 written out from Whisper + wb.js (the folder's "p1.pdf" is Test 1's Part 1).
// P4 is a non-native reading with many slips ("Tsutsi", "Suez Sea", "Susi" …): the island's name is written
// Surtsey throughout and only garbled phrases that hide the meaning were straightened.
// Source notes: map instruction said "A-G, next to Question 1-15" (map has A–H → "A-H, Questions 11-15");
// Q16–20 instruction "ONO MORE"; Q27–30 said "Choose FIVE" for four questions; Q37 note "where obtained".
const { note, short, mc, map, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 6,
  sections: [
    {
      part: 1, title: 'Headache Consultation', audio: 'listening/test 6/part 1.mp3', cover: 'doctor patient consultation | eye test optician',
      transcript: `
Doctor:
Good morning, Dr. Smith speaking.
How can I help you?
Woman:
Well, I've been getting headaches frequently, so I'd like to get some advice.
Doctor:
OK.
Firstly, how did you hear about us?
Woman:
My friend Mrs. Harris told me that you did some good work for her a couple of years ago.
Do you remember?
Doctor:
Oh, yes, I remember Mrs. Harris.
I appreciate her compliment.
So, tell me about your headaches.
Woman:
The headaches usually last about a week.
Sometimes it is so severe that I can't continue my work.
Could you tell me what is going wrong?
Doctor:
Sorry to hear that.
We will have to look further into this.
I want to know, did you have headaches before?
Woman:
No, I didn't suffer headaches previously.
I've just been having them recently.
Perhaps for three months or so.
Doctor:
I see.
Well, I suggest that you should have an optic examination first.
Do you know where the local optic examination centre is?
Woman:
No, I haven't been there before.
Would you please tell me how to get there?
Doctor:
Of course.
From here, you go along Shore Lane.
You will see some crossroads, but remember to take a turn on the third one.
Then go straight down Bridge Street.
Keep going and then turn left at the first traffic light.
It is right there.
Woman:
Got it.
Doctor:
Now, what I'll do is fill in a form with you to find out a little bit more about your medical history and so forth.
Woman:
Okay, thank you.
Doctor:
So, first of all, can I take your name?
Woman:
It's Anu Bhatt.
Doctor:
Could you spell it, please?
Woman:
Yes.
A-N-U B-H-A-T-T.
Doctor:
And where do you live?
Woman:
Oh, I live in my parents' house on 21 Eagle Road.
That's E-A-G-L-E Road, London.
Doctor:
Oh, I often go to London on weekends too.
It's a lovely city.
And what's the postcode there?
Woman:
A-L-2-1-D-Y.
Doctor:
Now, I need to know your family medical history.
Have either of your parents had any medical problems?
Woman:
Yes.
My mother has shellfish allergies, while my dad doesn't.
Doctor:
Oh, right.
Woman:
Both of my parents have had toothache for most of their lives.
Doctor:
Okay, thanks.
There is one more thing I need to take care of.
Have you had an allergic reaction to any medicines before?
Woman:
No, that hasn't happened before.
Doctor:
OK, I'll make a note of that.
I'll write none here.
I think we are finished here for now.
Woman:
Thank you.
See you later.
Doctor:
See you then.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [1, 'Why does she call this doctor?', ['He is popular among overseas students.', 'The advertisement says he is excellent.', 'She heard that he was a good doctor.'], 'C'],
          [2, 'How does the sickness affect the woman?', ['It interrupts work.', 'It keeps her awake at night.', 'It makes her feel anxious.'], 'A'],
          [3, 'What does the doctor want to know?', ['how long she has suffered from the problem', 'whether she has suffered headaches before', 'what caused the headache'], 'B'],
          [4, 'What does the doctor suggest doing first?', ['taking some medicine', 'having an optic examination', 'wearing glasses when using a computer'], 'B'],
        ], 'Questions 1-4'),
        short('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS for each answer.\nIn order to get to the optic examination centre, she should', [
          [5, 'take a turn at the ______ crossroad.', 'third/3rd'],
          [6, 'then turn left at the ______', 'first traffic light/1st traffic light/first traffic lights'],
        ], 'Questions 5-6'),
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Patient Form', [
          '<strong>Personal information</strong>',
          'Name: Anu Bhatt',
          'Address: __Q7__ Road',
          'Postcode: __Q8__',
          '<strong>Family medical history</strong>',
          'Both of her parents have __Q9__',
          '<strong>Other information</strong>',
          'Medicine allergy: __Q10__',
        ], { 7: '21 Eagle', 8: 'AL2 1DY/AL21DY', 9: 'toothache', 10: 'none' }, 'Questions 7-10'),
      ],
      expl: {
        1: { v: 'Khi bác sĩ hỏi vì sao biết đến phòng khám.', t: 'My friend Mrs. Harris told me that you did some good work for her a couple of years ago.', p: 'Người bạn kể bác sĩ đã chữa tốt cho bà ấy = nghe nói ông là bác sĩ giỏi → C' },
        2: { v: 'Khi người phụ nữ tả cơn đau đầu.', t: "Sometimes it is so severe that I can't continue my work.", p: 'Đau đến mức không làm việc tiếp được = ảnh hưởng công việc → A' },
        3: { v: 'Khi bác sĩ đặt câu hỏi.', t: 'I want to know, did you have headaches before?', p: 'Bác sĩ hỏi trước đây cô có bị đau đầu không; ba tháng là thông tin cô tự nói thêm → B' },
        4: { v: 'Lời khuyên đầu tiên.', t: 'Well, I suggest that you should have an optic examination first.', p: 'Bác sĩ đề nghị khám mắt trước → B' },
        5: { v: 'Khi bác sĩ chỉ đường tới trung tâm khám mắt.', t: 'You will see some crossroads, but remember to take a turn on the third one.', p: 'Rẽ ở ngã tư thứ ba → third' },
        6: { v: 'Ngay sau đó.', t: 'Keep going and then turn left at the first traffic light.', p: 'Rẽ trái ở cột đèn giao thông đầu tiên → first traffic light' },
        7: { v: 'Khi hỏi địa chỉ.', t: ["Oh, I live in my parents' house on 21 Eagle Road.", "That's E-A-G-L-E Road, London."], p: 'Số nhà 21, đường Eagle → 21 Eagle' },
        8: { v: 'Khi hỏi mã bưu điện.', t: 'A-L-2-1-D-Y.', p: 'Mã bưu điện được đánh vần → AL2 1DY' },
        9: { v: 'Phần tiền sử bệnh gia đình.', t: ['My mother has shellfish allergies, while my dad doesn\'t.', 'Both of my parents have had toothache for most of their lives.'], p: 'Dị ứng hải sản chỉ có ở mẹ (bẫy); cả bố và mẹ đều bị đau răng → toothache' },
        10: { v: 'Câu hỏi cuối về dị ứng thuốc.', t: ['No, that hasn\'t happened before.', "I'll write none here."], p: 'Chưa từng dị ứng thuốc, bác sĩ ghi “none” → none' },
      },
    },
    {
      part: 2, title: 'Campus Orientation', audio: 'listening/test 6/Part 2.mp3', cover: 'university campus garden | student dormitory room',
      fix: [
        ['over 5000 seats you can find', 'over 5000 seats.\nYou can find'], ['next to the caf is', 'next to the café is'],
        ['mix ups when distributing meals most', 'mix-ups when distributing meals, most'],
        ['find the button under the tab.\nOn Campus Dormitory.', 'find the button under the tab On Campus Dormitory.'],
      ],
      groups: [
        map('Label the map below.\nWrite the correct letter, A-H, next to Questions 11-15.', [[11, 'Student service office', 'F'], [12, 'Stadium', 'B'], [13, 'Health centre', 'E'], [14, 'International student office', 'A'], [15, 'Accommodation office', 'C']], { page: 3, box: [68, 189, 381, 393] }, 'Questions 11-15'),
        note('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'On-campus Accommodation', [
          'Each student has his or her own __Q16__',
          'Laundry facilities are situated in the __Q17__ of each dormitory.',
          'Most __Q18__ are named.',
          'An __Q19__ is needed to go into the dormitory.',
          'Electric appliances should be turned off after __Q20__',
        ], { 16: 'shower', 17: 'basement', 18: 'food containers', 19: 'access code', 20: '11.30 pm/11.30/11:30 pm/11:30/11.30pm' }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Phần sơ đồ, văn phòng dịch vụ sinh viên.', t: 'To the north-west of the garden, we have what we refer to as the Student Service Unit.', p: 'Phía tây bắc khu vườn → F' },
        12: { v: 'Sân vận động.', t: 'To the southeast of the garden near the south gate, we have quite a vibrant venue for both sports and concerts.', p: 'Đông nam khu vườn, gần cổng nam, nơi tổ chức thể thao và hoà nhạc → B' },
        13: { v: 'Trung tâm y tế.', t: ['Take the lane leading to the north-eastern corner of the campus and you will find a new building at the end.', "It's where trained staff are ready to cater to your health needs"], p: 'Cuối con đường dẫn về góc đông bắc → E' },
        14: { v: 'Văn phòng sinh viên quốc tế.', t: "If you're from abroad and need help, You'll need to go to the building directly adjacent to the campus garden.", p: 'Toà nhà ngay sát khu vườn → A' },
        15: { v: 'Văn phòng nhà ở.', t: ['Please note that we have closed the old office which is directly to the west of the campus garden as it is too small.', 'The larger building right next to the café is where the new one is located.'], p: 'Văn phòng cũ phía tây khu vườn (H) đã đóng (bẫy); văn phòng mới ở toà lớn cạnh quán cà phê → C' },
        16: { v: 'Phần ký túc xá.', t: 'The kitchen space is shared, but you do have a shower for yourselves.', p: 'Bếp dùng chung, phòng tắm vòi sen là riêng → shower' },
        17: { v: 'Khi nói về máy giặt.', t: 'After you move in, you will have to talk to the designated manager of your dormitory building before using any of the facilities in the basement, including washing machines and dryers.', p: 'Máy giặt, máy sấy ở tầng hầm → basement' },
        18: { v: 'Khi nói về chương trình bữa ăn.', t: "In order to prevent any mix-ups when distributing meals, most of our food containers will be marked with each student's name.", p: 'Hộp đựng thức ăn được ghi tên từng sinh viên → food containers' },
        19: { v: 'Khi nói về an ninh ký túc xá.', t: 'Every student will be provided with an access code, without which they cannot enter their rooms.', p: 'Cần mã truy cập để vào phòng → access code' },
        20: { v: 'Phần nội quy.', t: ['It is expected that all gadgets and appliances are switched off after the lights are out, which happens at 11.30pm.', "Most students' bedtime is around 11pm"], p: '11 giờ là giờ đi ngủ (bẫy); tắt thiết bị sau khi tắt đèn lúc 11.30 → 11.30 pm' },
      },
    },
    {
      part: 3, title: 'Field Trip Report', audio: 'listening/test 6/Part 3.mp3', cover: 'sand dunes field trip | soil testing kit',
      speakers: { 1: 'Mr White', 2: 'Natasha' },
      fix: [
        ['In White discussing with his student Natasha about a draft of a field trip.\n', ''], ['like these,\n', 'like these.\n'],
        ["The details you've included, are informative", "The details you've included are informative"],
        ['cause this?\n2\nNatasha:', 'cause this?\nNatasha:'],
        ["with other people's.\nYes,\nNatasha:\nI thought that would", "with other people's.\nNatasha:\nYes, I thought that would"],
        ['Junes Visitor Centre', 'Dunes Visitor Centre'], ['detailed enough.\nSo.\nMr White:\nWhat equipment', 'detailed enough.\nMr White:\nSo, what equipment'],
        ["some issues.\nI know,\nNatasha:\nIt's a bit", "some issues.\nNatasha:\nI know, it's a bit"],
        ['I thought my.\nThe literature review', 'I thought my literature review'],
        ['Oh, that would\nNatasha:\nBe very helpful.', 'Natasha:\nOh, that would be very helpful.'],
        ["similar soil types.\n1.\nMr White:\nIt's always a good idea to incorporate some real-world experiences in a report like yours.\nI wasn't sure whether it's redundant, but I learned a lot.\nIt's an established research method.\nNatasha:\nIt took", "similar soil types.\nMr White:\nIt's always a good idea to incorporate some real-world experiences in a report like yours.\nNatasha:\nI wasn't sure whether it's redundant, but I learned a lot.\nMr White:\nIt's an established research method.\nNatasha:\nIt took"],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Why did Natasha decide to write the report?', ['to get extra credits', 'to help her decide on a course', 'to practise report-writing'], 'B'],
          [22, 'How does Mr White advise Natasha to improve her report?', ['She should include some more details.', 'She should take advantage of report templates.', 'She should revise the introduction.'], 'B'],
          [23, 'How did Natasha choose the field trip site?', ['She chose a difficult place to get to.', 'She selected one that was recommended.', 'She chose one at random.'], 'C'],
          [24, "Natasha's main aim in going on the field trip was to", ['apply some of the techniques she learned in class.', 'measure the density of grasses in the area.', 'analyse the soil content of sand dunes.'], 'C'],
          [25, 'Why did Natasha include data from other students?', ['to make her result more reliable', 'to compare her data with other data', 'to make her report more complete'], 'A'],
          [26, 'How did Natasha produce such a detailed map?', ['She made careful observations.', 'She took some photographs first.', 'She copied relevant material.'], 'A'],
        ], 'Questions 21-26'),
        matching('What problem does each of the following parts of data collecting have?\nChoose FOUR answers from the box and write the correct letter, A-E, next to Questions 27-30.',
          ['inadequately developed', 'time-consuming', 'redundant', 'poorly organised', 'too complicated'], [
            [27, 'The test kit', 'E'], [28, 'Data collecting sheet', 'D'], [29, 'Literature review', 'A'], [30, 'Interviews', 'B'],
          ], { title: 'Data collection issues', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi Mr White hỏi động lực viết báo cáo.', t: ["I wasn't sure which aspect of science I wanted to study and thought this might help me focus.", "After this field trip, I've realised that geology is a field I would love to be involved in, and I've signed up for a course next term."], p: 'Không phải vì điểm cộng; báo cáo giúp cô chọn được ngành và đăng ký khoá học → B' },
        22: { v: 'Khi bàn cách sửa báo cáo.', t: ['The school website has many essay templates you can use, including the ones for a scientific report, which is what you need here.', "I'd like you to download one and revise accordingly."], p: 'Phần mở đầu “not bad”, thêm chi tiết “not necessary”; thầy bảo dùng mẫu báo cáo trên website → B' },
        23: { v: 'Khi hỏi vì sao chọn địa điểm.', t: 'I believe every place is geologically unique, so I closed my eyes and stabbed the map, then looked for the nearest open site.', p: 'Nhắm mắt chọn bừa trên bản đồ = chọn ngẫu nhiên; địa điểm dễ đến (loại A) → C' },
        24: { v: 'Khi hỏi mục tiêu chuyến đi.', t: "Not particularly, I'm very interested in the elements that make up different soil types and the dunes have always captured my interest because of the sand content.", p: 'Thử kỹ thuật kiểm tra đất chỉ là “added bonus” (bẫy A); mục tiêu chính là thành phần đất của cồn cát → C' },
        25: { v: 'Khi hỏi về dữ liệu của bạn cùng lớp.', t: 'Yes, in an effort to make my own findings more accurate.', p: 'Gộp dữ liệu để kết quả chính xác hơn = đáng tin hơn; so sánh phương pháp là ý của thầy (bẫy B) → A' },
        26: { v: 'Khi hỏi cách vẽ bản đồ chi tiết.', t: ['I took a satellite image with me to the viewing platform at the Dunes Visitor Centre.', 'Then I marked in the details I could see.'], p: 'Thầy đoán chụp ảnh (bẫy B), bạn khác sao chép (bẫy C); Natasha tự quan sát từ đài ngắm cảnh rồi đánh dấu → A' },
        27: { v: 'Phần vấn đề thu thập dữ liệu: bộ dụng cụ đo.', t: "I predominantly used the soil pH test kit you recommended, but it's quite technical, and I found it difficult to use.", p: 'Bộ đo pH quá kỹ thuật, nhiều nút khó dùng → E' },
        28: { v: 'Bảng thu thập dữ liệu.', t: ["Now, your data collection sheet has some issues.", "I know, it's a bit disorganised, isn't it?"], p: '“Disorganised” = sắp xếp kém → D' },
        29: { v: 'Phần tổng quan tài liệu.', t: 'It didn\'t really give a full picture, and you neglected some parts which are important.', p: 'Chưa đầy đủ, bỏ sót phần quan trọng = phát triển chưa đủ → A' },
        30: { v: 'Phần phỏng vấn người dân.', t: "It took a long time, though.", p: 'Natasha tưởng thừa (bẫy C) nhưng thầy khen; vấn đề là tốn nhiều thời gian → B' },
      },
    },
    {
      part: 4, title: 'The Island of Surtsey', audio: 'listening/test 6/Part 4.mp3', cover: 'surtsey island iceland | volcanic island sea',
      fix: [
        ['First, you will have some time to look at questions 31 to 40.\nThank you.\nThank you.\nThe process was formed from below', 'Surtsey Island is located off the southern coast of Iceland.\nThe island was formed from below'],
        ['The process was recorded in 1963 Fishing vessels crew aboard a trawler sailing.\nTheir island spotted', 'The process was recorded in 1963.\nThe crew aboard a fishing trawler sailing near the island spotted'],
        ["Tsutsi's", "Surtsey's"], ['Tsutsi', 'Surtsey'], ['The first a higher plant was discovered at', 'The first higher plant discovered at'],
        ['Fly arrived on the Suez Sea soon', 'Flies arrived on Surtsey soon'], ['covered by a wide ground grass', 'covered by widespread grass'],
        ['Sioux Sea', 'Surtsey'], ['a green vegetation called Matinsa from the thick carpet', 'a green vegetation called Marchantia forming a thick carpet'],
        ['fossil on Suisi an island', 'fossils on Surtsey, an island'], ['Susi', 'Surtsey'], ['by martime and administration', 'by the maritime administration'],
        ['near future investigation assuming', 'near future.\nAn investigation assuming'], ['for at least the many centuries', 'for at least many centuries'],
        ['by researchers.\nWow, staying on this island.', 'by researchers while staying on this island.'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'How Surtsey was formed', [
          'In 1963 the activity from an underwater __Q31__ started to form an island.',
          'Fishermen saw __Q32__ coming up out of the sea.',
          '<strong>What scientists found in the early days</strong>',
          '• The first plant life was a type of __Q33__',
          '• The first sign of life found by scientists was a fly.',
          '• Scientists were surprised by the widespread growth of __Q34__',
          '<strong>Later findings</strong>',
          '• In the 1960s, birds brought seeds to the island.',
          '• In the 1970s, __Q35__ were probably carried to the island.',
          '• The first green vegetation – marchantia – formed a thick __Q36__ on Surtsey.',
          '<strong>Contrast:</strong>',
          '• Surtsey is an island only 39 years old. The __Q37__ were obtained as early as 5 years after the eruption!',
          '• However, __Q38__ observations suggest that the volcano is very energetic.',
          '<strong>Climate and future:</strong>',
          '• The enormous waves of winter __Q39__',
          '• An assessment assuming that the island will survive for many __Q40__',
        ], { 31: 'volcano', 32: 'smoke', 33: 'flower', 34: 'grass', 35: 'bacteria', 36: 'carpet', 37: 'fossils', 38: 'radio', 39: 'storms/storm', 40: 'centuries/century' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài, quá trình hình thành đảo.', t: 'The island was formed from below the sea surface due to eruptions of a volcano.', p: 'Đảo hình thành từ núi lửa phun trào dưới mặt biển → volcano' },
        32: { v: 'Khi kể ngư dân phát hiện ra đảo.', t: 'The crew aboard a fishing trawler sailing near the island spotted a column of smoke rising from the sea surface.', p: 'Thuỷ thủ tàu cá thấy cột khói bốc lên từ mặt biển → smoke' },
        33: { v: 'Phần phát hiện ban đầu.', t: 'The first higher plant discovered at the shoreline is a flower called Sea Rocket.', p: 'Thực vật bậc cao đầu tiên là một loài hoa → flower' },
        34: { v: 'Ngay sau đó.', t: 'Scientists are also shocked that a large area was covered by widespread grass in 1974.', p: 'Bất ngờ vì cỏ phủ một diện tích lớn → grass' },
        35: { v: 'Phần những phát hiện sau này.', t: 'A year after the eruption started, the number of bacteria species increased rapidly to 35, onto about 1970s', p: 'Số loài vi khuẩn tăng nhanh đến khoảng thập niên 1970 → bacteria' },
        36: { v: 'Khi nói về thảm thực vật xanh đầu tiên.', t: 'For the first time, scientists have found a green vegetation called Marchantia forming a thick carpet in the westernmost of the largest crater.', p: 'Rêu Marchantia tạo thành một lớp thảm dày → carpet' },
        37: { v: 'Phần đối lập.', t: ['Like the findings of fossils on Surtsey, an island only 39 years old.', 'The fossils were obtained as early as five years after eruption.'], p: 'Hoá thạch được tìm thấy chỉ năm năm sau phun trào → fossils' },
        38: { v: 'Ngay sau đó.', t: 'Radio observations suggest that the very energetic particle produced by the violent eruption is still active.', p: 'Quan sát bằng sóng radio cho thấy núi lửa vẫn hoạt động mạnh → radio' },
        39: { v: 'Phần khí hậu.', t: 'The violent explosions caused by the meeting of lava and seawater meant that this island consisted of a loose pile of volcanic rock by storms during the winter.', p: 'Đảo chịu sóng lớn và bão vào mùa đông → storms' },
        40: { v: 'Cuối bài, dự đoán tương lai.', t: 'An investigation assuming that the rate of erosion will be slow suggests that this island will last for at least many centuries.', p: 'Đảo sẽ tồn tại ít nhất nhiều thế kỷ → centuries' },
      },
    },
  ],
};
