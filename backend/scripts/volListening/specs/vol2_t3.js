// Vol 2 – Test 3 (PDF "listening/test 3/Test 3.pdf" p1–6, key p7 — this PDF has a text layer; audio test 3/…)
// Transcripts: Whisper + Otter merge (P3 written out: Otter's speaker turns unusable; Jenny = woman, Tim = man,
// as the questions name them).
// Source errors fixed: Q8–10 options were broken across lines in the PDF ("B Fil / C Saturday / D excursion") —
// rebuilt as A Lecture, B Film, C Saturday excursion, D Tennis events (the event the caller asks about and the club
// does not have), E Culture evening, F Night tour, G Yoga classes; key letters A, C, E unchanged. Map instruction
// said "Questions 15-20" (→ 11-15). Q16–20 key was written as option text → letters.
const { note, table, mc, multi, map, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 3,
  sections: [
    {
      part: 1, title: 'South City International Club', audio: 'listening/test 3/part 1.mp3', cover: 'ice skating rink | international club members',
      speakers: { 1: 'Mary', 2: 'Mary', 3: 'Jim' },
      fix: [
        ["my name's Mary.\nHi,\nJim:\nMary.\nMy name's", "my name's Mary.\nJim:\nHi, Mary.\nMy name's"],
        ['from 11am to 6pm.\nThank you.\nJust to note', 'from 11am to 6pm.\nJust to note'],
        ["as long as there's no damage,\nJim:\nThat sounds fine.\nWhat else do you have?\nWell,\nMary:\nWe also", "as long as there's no damage.\nJim:\nThat sounds fine.\nWhat else do you have?\nMary:\nWell, we also"],
        ['Do you have tennis events?\nI could join?', 'Do you have tennis events I could join?'],
        ['That sounds\nJim:\nGood.', 'Jim:\nThat sounds good.'],
        ['no tennis at your club.\nHmm.\nMary:\nI will pass', 'no tennis at your club.\nMary:\nHmm.\nI will pass'],
        ['\nNow turn to the right.', ''],
      ],
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', ['Event/Venue', 'Time/Dates', 'Fees', 'Notes'], [
          ['Library', 'Example: From 11:00 am to 6 pm', 'Deposit: $ __Q1__', 'Return the deposit if there is no damage'],
          ['__Q2__ centre', 'Open on __Q3__', '$3', 'Bring one guest for free'],
          ['Swimming', 'Starts on __Q4__', '$ __Q5__', 'Bring your own swimming suit'],
          ['Dance class', 'Open all day', '$5 ( __Q6__ included)', 'Bring enough water and food'],
          ['__Q7__', 'Open between 10:30 am and 3:30 pm (weekdays)', '$3', 'Replacement for the visit to Grand Hotel'],
        ], { 1: '15/fifteen', 2: 'ice skating/ice-skating', 3: 'Sunday/Sundays', 4: '16th October/16 October/October 16/October 16th/the 16th of October/16th of October', 5: '3/three', 6: 'free drinks/drinks', 7: 'museum/local museum/the local museum' }, 'Questions 1-7'),
        multi('Choose THREE letters, A-G.', 8, 'Which THREE events are held every month by the club?', ['Lecture', 'Film', 'Saturday excursion', 'Tennis events', 'Culture evening', 'Night tour', 'Yoga classes'], ['A', 'C', 'E'], 'Questions 8-10'),
      ],
      expl: {
        1: { v: 'Khi Mary nói về thư viện.', t: "Just to note, there's a deposit of $15 for using the library, which is returnable.", p: 'Tiền đặt cọc dùng thư viện là $15, được hoàn lại nếu không hư hại → 15' },
        2: { v: 'Khi Mary nói về hoạt động thứ hai.', t: 'We also have an ice skating centre, which is next to a telephone booth.', p: 'Trung tâm trượt băng, phí vào cửa $3 → ice skating' },
        3: { v: 'Ngay sau đó, ngày mở cửa.', t: "It's only open on Sundays.", p: 'Trung tâm trượt băng chỉ mở vào Chủ nhật → Sunday' },
        4: { v: 'Khi Jim hỏi về lớp bơi.', t: 'It starts on the 16th of October.', p: 'Lớp bơi mới bắt đầu ngày 16/10 → 16th October' },
        5: { v: 'Khi Jim hỏi lớp bơi có đắt không.', t: ["Well, the joining fee is only $1.", "Oh, no, I'm sorry, it's recently gone up by $2.", "So it's now $3 for each person."], p: '$1 là giá cũ, $2 là mức tăng (bẫy); phí hiện tại là $3 → 3' },
        6: { v: 'Khi nói về lớp nhảy.', t: 'The joining fee is $5, but that includes free drinks.', p: 'Phí $5 đã bao gồm đồ uống miễn phí → free drinks' },
        7: { v: 'Khi Mary giới thiệu chuyến tham quan thay thế.', t: ['We usually visit the Grand Hotel, a historical site.', 'But this time, we are going to the local museum.'], p: 'Thường đi khách sạn Grand (bẫy), lần này đi bảo tàng địa phương – khớp “replacement for the visit to Grand Hotel” → museum' },
        8: { v: 'Khi Jim hỏi các sự kiện khác của câu lạc bộ.', t: 'But we organise events such as movie watching, as long as there are over 30 viewers, and we have a lecture every four weeks.', p: 'Xem phim chỉ tổ chức khi đủ 30 người (không định kỳ); bài giảng có mỗi bốn tuần = hằng tháng → A' },
        9: { v: 'Như câu 8 (chọn 3 đáp án).', t: ['Yes, we do have some yoga lessons but the timetable is still in discussion.', 'However, we arrange a Saturday excursion every month.'], p: 'Lịch yoga chưa chốt (bẫy G); chuyến đi thứ Bảy được tổ chức mỗi tháng → C' },
        10: { v: 'Như câu 8 (chọn 3 đáp án).', t: ['We will offer a night city tour if you are interested.', "And as well as that, there's a cultural evening event once a month."], p: 'Tour đêm chỉ là “sẽ tổ chức” (bẫy F), tennis không có; buổi tối văn hoá diễn ra mỗi tháng một lần → E' },
      },
    },
    {
      part: 2, title: 'Fitchton Railway Station', audio: 'listening/test 3/Part 2-railway-station.mp3', cover: 'railway station platform | train station waiting',
      fix: [['Fichton', 'Fitchton'], ['Fitchden', 'Fitchton']],
      groups: [
        map('Label the map below.\nWrite the correct letter, A-I, next to Questions 11-15.', [[11, 'bike racks', 'G'], [12, 'luggage lockers', 'B'], [13, "chemist's", 'C'], [14, 'toilet', 'F'], [15, 'news agency', 'D']], { page: 2, box: [70, 206, 530, 546] }, 'Questions 11-15'),
        mc('Choose the correct letter, A, B or C.', [
          [16, 'Where could the passengers see the exhibition?', ['in the town library', 'in Fitchton College', 'in the station'], 'A'],
          [17, 'What is the best gift for passengers to buy and bring home?', ['local food', 'clothing', 'jewellery'], 'A'],
          [18, 'Where can passengers buy souvenir postcards?', ['in the museum', 'in the shop', 'in the college'], 'C'],
          [19, 'What will the old cinema be converted to?', ['a housing area', 'a new theatre', 'a shop'], 'A'],
          [20, 'Who is the statue in the train station modelled after?', ['a poet', 'an engineer', 'a politician'], 'C'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Phần sơ đồ, giá để xe đạp.', t: ['If you want to take a bike ride around here, walk down Fitchton Road and pass the taxi stop.', 'You can find a bike rack on the right.'], p: 'Ra đường Fitchton, đi qua điểm đón taxi, giá để xe ở bên phải → G' },
        12: { v: 'Tủ gửi hành lý.', t: ['You can find a luggage locker when you enter the station.', "It's on the left."], p: 'Vừa vào ga, phía bên trái lối vào → B' },
        13: { v: 'Hiệu thuốc.', t: "If you don't feel very well or you need to buy some medicine, there's a chemist's in the farthest corner of the station, opposite to the café.", p: 'Góc xa nhất của nhà ga, đối diện quán cà phê → C' },
        14: { v: 'Nhà vệ sinh.', t: ['If you want to use the toilet, make a left when you enter the station, then turn right.', 'Go straight until you walk past Platform 2.', "It's right there at the end."], p: 'Rẽ trái, rẽ phải, đi thẳng qua sân ga 2, ở cuối đường → F' },
        15: { v: 'Quầy báo.', t: 'The news agency is in the southeast corner of the station.', p: 'Góc đông nam nhà ga → D' },
        16: { v: 'Khi gợi ý tham quan quanh ga.', t: ['The town library is also just down the road if you want to read.', "Oh, there's also an art exhibition at the moment."], p: 'Triển lãm nghệ thuật được nhắc ngay khi nói về thư viện thị trấn; trường Fitchton chỉ có “view” đẹp → A' },
        17: { v: 'Khi nói về quà mang về.', t: ['You don\'t want to buy any gifts for your friends there, though.', 'But our local food is something I recommend.'], p: 'Không nên mua quà ở cửa hàng đối diện; người nói khuyên mua đặc sản địa phương; quần áo thì không đủ thời gian (bẫy B) → A' },
        18: { v: 'Khi nói về bưu thiếp.', t: 'You can buy them in the community college which is near the museum.', p: 'Bảo tàng chỉ là điểm mốc (bẫy A); bưu thiếp bán ở trường cao đẳng cộng đồng → C' },
        19: { v: 'Khi nói về rạp chiếu phim cũ.', t: 'The old cinema behind the museum cannot compete against the new theatre in the shopping centre so the current owner plans to make it an accommodation block instead.', p: '“Accommodation block” = khu nhà ở; nhà hát mới là đối thủ (bẫy B) → A' },
        20: { v: 'Khi nói về bức tượng.', t: 'In the back of the train station you can see a statue of Richard Travolt, a local government minister who is famous for completing a lot of construction projects in our city.', p: '“Local government minister” = chính trị gia; các công trình xây dựng chỉ là thành tích (bẫy B) → C' },
      },
    },
    {
      part: 3, title: 'Volcano Revision Presentation', audio: 'listening/test 3/part-3.mp3', cover: 'erupting volcano | students revising together',
      transcript: `
Tim:
Hi, Jenny.
Jenny:
Hi, Tim, how are you doing?
Tim:
I'm okay.
But I'm really stressed out about our geography assessment next week.
Have you done any work on it yet?
Jenny:
I've looked at it a little bit, but it would be helpful to discuss it with someone else.
Do you want to chat about it with me?
Tim:
That would be great.
Do you know what the rules are for the test?
Jenny:
For our assessment last term, we were all required to collect raw data in order to achieve a pass.
However, this term, the tutor has said that it won't be necessary for us to do this.
Tim:
I read through the notes and they said that we are all going to be given a set of instructions that we can choose to follow if we wish, but it's not mandatory, and we can complete the exam as we wish.
Jenny:
I don't think that the rules will be too strict.
As long as we don't copy the answers from anyone else's exam paper, I think we'll be sure to pass.
Tim:
Yes, I agree.
Shall we put together a slideshow presentation with information on all of the volcanoes?
I think it will really help us to revise the facts.
Jenny:
OK, great.
Let's start with Pompeii.
It's the most well-known of all the volcanoes, so it should be easy to find lots of information about it online.
Tim:
I'll avoid including some of the images in the presentation, as many people were killed.
And some of them can be quite disturbing.
We're lucky to have a double free period today, so we will have plenty of time to revise this together.
Jenny:
OK, next up is Mount Fago.
This is an ancient mythical volcano, the location of which is unclear.
There are mountainous regions in both Mexico and the USA, both of which are rumoured to be the site of this volcano.
Tim:
It's not very scientific to list two separate locations for one volcano, but since no one has been able to prove which is the correct one, we're left with no choice.
It's interesting that there is no other example of a volcano in existence today that is surrounded by so much mystery.
Jenny:
Absolutely.
I think we should include some information about Mount Etna in Sicily, which is famous for the stunning panoramas that one can appreciate from its peak.
According to Google, it's a relatively new volcano compared to others in the surrounding region, which may be why it has very few of the features found in older volcanoes.
Tim:
Oh, how interesting!
Shall we include information on Mount Hurton?
I don't think that any of the other students have carried out much research into it even though it has a lot of unique features.
Jenny:
I think we should leave it out, since it's a man-made volcano.
It's not that relevant to our syllabus, and probably won't be included in any of the exam questions.
Tim:
Have you gotten feedback from your tutor on your presentation last week?
Jenny:
Yes, I have, but I don't think he was very impressed.
He was satisfied by the amount of research that I had prepared before I started, but he criticised the fact that I was mostly summarising the facts instead of giving my own opinion.
Tim:
Oh, that's a shame.
Jenny:
It was frustrating that he criticised my work, but in the end, I learnt a lot from my tutor's feedback.
He advised me that next time, I should present my work as a short documentary film, which he thinks will help me to strengthen my arguments.
What topic was your presentation based on?
Tim:
I chose to write about the lack of knowledge that most people have about volcanoes and the fact that they see them in such a negative way.
During documentaries and lectures, the scientific experts often neglect to mention the many positive features that volcanoes possess.
Jenny:
That sounds really interesting.
Well done.
Tim:
I think everyone enjoyed watching, but I was really nervous about talking in front of an audience.
I also felt very underprepared, since I didn't finish writing the presentation until the night before, and therefore had no time to rehearse it.
Jenny:
I'm sure it was great.
Is there any other information that you think we should include in our slideshow for revision?
Tim:
Yes, I think it's important that we list all of the differences between active and extinct volcanoes, as there will definitely be a question on this topic.
There are no documentaries on the subject, but there's a very informative website that discusses the geological structure of each volcano type.
Jenny:
OK.
Well, I'll continue collecting images, and you can carry on with the online research.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Students may fail the exams if they', ['do not collect primary statistics', "copy other people's work", 'do not follow the instructions'], 'B'],
          [22, 'Why does the man think they should avoid including the pictures of the first volcano in the presentation?', ['they are not attractive', 'the time is limited', 'people have never heard of it'], 'A'],
          [23, 'About Mount Fago, a volcano in Mexico or the USA, the man thinks', ['they should not use inaccurate information in the presentation', 'they should use another example', 'it does not matter where the volcano is'], 'A'],
          [24, 'The woman thinks they should mention Mount Etna since', ['it covers most of the important points', 'it was formed a long time ago', 'it has stunning views'], 'C'],
          [25, 'They agree to leave out Mount Hurton as', ['other students have used it before', 'it is irrelevant to their topic', 'there is nothing special about this volcano'], 'B'],
        ], 'Questions 21-25'),
        matching('Which statement applies to each of the following situations?\nChoose FIVE answers from the box and write the correct letter, A-F, next to Questions 26-30.',
          ['make a short film', 'lacked his/her own points', 'neglect the positive aspect', 'watch some documentaries', 'did not prepare beforehand', 'identify the differences between them'], [
            [26, "The woman's last presentation was criticised because it", 'B'],
            [27, 'The tutor suggests for the next presentation the woman should', 'A'],
            [28, 'People do not know enough about volcanoes and so they', 'C'],
            [29, 'The reason why the man felt very nervous is that he', 'E'],
            [30, 'They are researching active and extinct volcanoes to', 'F'],
          ], { groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Khi bàn về quy định của bài thi.', t: ["As long as we don't copy the answers from anyone else's exam paper, I think we'll be sure to pass."], p: 'Thu thập dữ liệu thô không còn bắt buộc, làm theo hướng dẫn là tuỳ chọn; chỉ cần không chép bài người khác là đậu → B' },
        22: { v: 'Khi nói về núi lửa Pompeii.', t: ["I'll avoid including some of the images in the presentation, as many people were killed.", 'And some of them can be quite disturbing.'], p: 'Hình ảnh gây khó chịu (disturbing) = không dễ nhìn; thời gian thì còn nhiều (loại B) → A' },
        23: { v: 'Khi nói về núi Fago.', t: "It's not very scientific to list two separate locations for one volcano, but since no one has been able to prove which is the correct one, we're left with no choice.", p: 'Tim cho rằng nêu hai địa điểm là thiếu khoa học (thông tin không chính xác) → A' },
        24: { v: 'Khi Jenny đề xuất núi Etna.', t: 'I think we should include some information about Mount Etna in Sicily, which is famous for the stunning panoramas that one can appreciate from its peak.', p: '“Stunning panoramas” = cảnh đẹp ngoạn mục; Etna là núi lửa mới và có ít đặc điểm (loại A, B) → C' },
        25: { v: 'Khi bàn về núi Hurton.', t: "It's not that relevant to our syllabus, and probably won't be included in any of the exam questions.", p: 'Núi lửa nhân tạo, không liên quan chương trình học; chưa ai nghiên cứu và có nhiều đặc điểm riêng (loại A, C) → B' },
        26: { v: 'Khi Jenny kể nhận xét của gia sư.', t: 'He was satisfied by the amount of research that I had prepared before I started, but he criticised the fact that I was mostly summarising the facts instead of giving my own opinion.', p: 'Bị chê vì chỉ tóm tắt sự kiện, thiếu quan điểm riêng → B' },
        27: { v: 'Ngay sau đó, lời khuyên của gia sư.', t: 'He advised me that next time, I should present my work as a short documentary film', p: 'Lần sau trình bày dưới dạng phim tài liệu ngắn → A' },
        28: { v: 'Khi Tim kể chủ đề bài thuyết trình.', t: 'During documentaries and lectures, the scientific experts often neglect to mention the many positive features that volcanoes possess.', p: 'Người ta thiếu hiểu biết nên bỏ qua mặt tích cực của núi lửa → C' },
        29: { v: 'Khi Tim nói vì sao lo lắng.', t: "I also felt very underprepared, since I didn't finish writing the presentation until the night before, and therefore had no time to rehearse it.", p: 'Viết xong đêm trước, không kịp tập dượt = không chuẩn bị trước → E' },
        30: { v: 'Cuối bài, khi bàn thêm nội dung ôn tập.', t: "Yes, I think it's important that we list all of the differences between active and extinct volcanoes, as there will definitely be a question on this topic.", p: 'Liệt kê các điểm khác nhau giữa núi lửa đang hoạt động và đã tắt; không có phim tài liệu về chủ đề này (loại D) → F' },
      },
    },
    {
      part: 4, title: 'Tracking Crocodiles in Queensland', audio: 'listening/test 3/part 4.mp3', cover: 'saltwater crocodile | crocodile river australia',
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Crocodile Research', [
          '<strong>Research methods:</strong>',
          '• This research is world-leading because __Q31__ is used in the study.',
          '• In previous studies, the tests were done with __Q32__',
          '• Problem of the old device: always losing __Q33__',
          '• The crocodiles are not easily captured, as they are cautious and try to avoid being followed by __Q34__',
          '• A tracking device is attached to the __Q35__ of the crocodile.',
          '<strong>Relocation of crocodiles:</strong>',
          '• Scientists relocate the crocodiles by using a __Q36__',
          '• Relocated crocodiles follow the most __Q37__ route home.',
          '• Crocodiles can find their way because they have the ability to __Q38__',
          '<strong>Conclusions:</strong>',
          '• The crocodiles find their direction by using their senses to the __Q39__',
          '• Crocodiles have the same migration system as __Q40__',
        ], { 31: 'satellite/a satellite', 32: 'radio', 33: 'signals/signal', 34: 'humans/human/human beings', 35: 'head', 36: 'helicopter', 37: 'direct', 38: 'navigate', 39: 'sun/the sun', 40: 'birds' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài, lý do dự án dẫn đầu thế giới.', t: 'This project can lead the world in crocodile management because of the use of satellite', p: 'Dự án dẫn đầu nhờ dùng vệ tinh → satellite' },
        32: { v: 'Khi nói về các nghiên cứu trước.', t: 'Crocodile studies have been previously conducted by radio.', p: 'Trước đây nghiên cứu cá sấu bằng sóng radio → radio' },
        33: { v: 'Khi nói về khó khăn của thiết bị cũ.', t: 'However, some devices are too old that they always lose signals due to a variety of reasons.', p: 'Thiết bị cũ hay mất tín hiệu → signals' },
        34: { v: 'Khi nói về việc bắt cá sấu.', t: 'But this is a very difficult task, because they are alert and afraid of being followed by humans.', p: 'Cá sấu cảnh giác, sợ bị con người theo dõi → humans' },
        35: { v: 'Khi nói về vị trí gắn thiết bị.', t: 'It is attached to the head of the crocodile, so the crocodile cannot remove the device with its feet or tail.', p: 'Gắn lên đầu để cá sấu không gỡ được bằng chân hay đuôi → head' },
        36: { v: 'Phần di dời cá sấu.', t: 'So scientists at the park have to use a helicopter to relocate the crocodiles in order to control their population in the area.', p: 'Dùng trực thăng để di dời → helicopter' },
        37: { v: 'Khi nói kết quả việc di dời.', t: 'However, scientists found that the relocation methods were ineffective because the relocated crocodiles will return to their original location, following the most direct route within one week.', p: 'Cá sấu quay về theo con đường trực tiếp nhất → direct' },
        38: { v: 'Khi nói vì sao cá sấu không lạc đường.', t: 'Scientists realised the crocodiles are able to navigate.', p: 'Cá sấu có khả năng định hướng → navigate' },
        39: { v: 'Phần kết luận.', t: "However, through lots of research and experiments, scientists conclude that crocodiles can tell directions by using their senses to the sun, so that they know where they're going.", p: 'Cá sấu xác định phương hướng nhờ cảm nhận mặt trời → sun' },
        40: { v: 'Kết luận cuối.', t: 'Another finding is that, like the migration of birds who can travel thousands and thousands of kilometres, crocodiles have the same system to help them travel.', p: 'Hệ thống di cư giống loài chim → birds' },
      },
    },
  ],
};
