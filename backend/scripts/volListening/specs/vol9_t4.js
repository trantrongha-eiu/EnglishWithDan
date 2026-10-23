// Vol 9 – Test 4 (same layout as vol9_t1.js; the key here is a bare list of 40 answers). P4 = bank "The Impact of
// Technology on Young People" (Vol 3 - Test 3 P4): same questions, key 10/10 → reused (transcript 6-gram only 12 %, the
// bank copy has its own transcript of the same lecture).
// docx "Hawthorne" → Hawthorn (form). P3 opens with the student knocking: docx "Dr. Williams." → "Dr Williams?".
const { note, table, mc, matching } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 4.mp4';

module.exports = {
  vol: 9, test: 4, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 4-L.docx',
  rawRe: [...RE, ['Hawthorne', 'Hawthorn']],
  sections: [
    {
      part: 1, title: 'Weekend Course Booking', audio: A, clip: [43.9, 455.9], cover: 'acoustic guitar workshop | guitar lesson hands',
      fix: [['Listen carefully and answer questions one to six. ', '']],
      turns: [
        ['Receptionist', 'Hello, Stanley House'], ['Nick', 'Oh, hello.'], ['Receptionist', 'Very good.'], ['Nick', 'Well, a guitar one.'],
        ['Receptionist', "That's right."], ['Nick', 'Well, I was thinking'], ['Receptionist', 'Let me just check.'], ['Nick', 'Oh, sorry.'],
        ['Receptionist', 'No problem.'], ['Nick', 'OK.'], ['Receptionist', "That's just for our reference."], ['Nick', 'Yes, in fact, I have.'],
        ['Receptionist', "Yes, that's always"], ['Nick', "It's Nick Poskitt."], ['Receptionist', "Oh, that's an unusual name"], ['Nick', "Oh, it's Hawthorn Way"],
        ['Receptionist', "OK, I'll correct that"], ['Nick', "That's right."], ['Receptionist', 'Lovely.'], ['Nick', "OK, that's 07707"],
        ['Receptionist', 'Thanks.'], ['Nick', "Sure, I'm 26."], ['Receptionist', 'And can I ask your occupation?'], ['Nick', 'Engineer.'],
        ['Receptionist', "Let's hope so."], ['Nick', "Well, I don't like"], ['Receptionist', "That's fine."], ['Nick', 'Sure.'],
        ['Receptionist', 'On the Saturday afternoon'], ['Nick', 'Hmm, probably not.'], ['Receptionist', "Or there's blues?"], ['Nick', 'Yes, maybe.'],
        ['Receptionist', 'Or rock?'], ['Nick', 'That sounds good'], ['Receptionist', 'OK, fine.'], ['Nick', "I didn't know"],
        ['Receptionist', 'Where did you actually'], ['Nick', 'Well, this time'], ['Receptionist', "Right, yes, we'll have to"], ['Nick', "So it's still"],
        ['Receptionist', "That's right."], ['Nick', 'Well, last time I came'], ['Receptionist', "I'll see what I can do."], ['Nick', 'Great.'],
        ['Receptionist', "Right, so if there's nothing"], ['Nick', "OK, it's 78956."],
      ],
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Weekend Course Booking', [
          'Booking for: a guitar workshop',
          'Start date: __Q1__',
          'Course code: __Q2__',
          'Previous course attended: Editing __Q3__',
          'Name: Nick __Q4__',
          'Address: 27 Hawthorn __Q5__, Bristol, BS4 2QG',
          'Contact number: 07707 438 297',
          'Age: 26',
          'Occupation: __Q6__',
          'Dietary requests: no __Q7__',
          'One-to-one lesson selected: __Q8__ guitar',
          'First heard about us from: a __Q9__',
          'Additional request: would like __Q10__ if possible',
        ], {
          1: '18th July/18 July/July 18th/July 18/18th of July/the 18th of July', 2: 'Q1632', 3: 'photographs/photos', 4: 'Poskitt', 5: 'Way',
          6: 'engineer', 7: 'fish', 8: 'blues', 9: 'magazine', 10: 'parking',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi lễ tân hỏi Nick muốn đến khi nào.', t: ["Well, I was thinking of the weekend of July the 16th, if there's room then.", 'Oh, the 16th is a Wednesday.', 'Did you mean the 18th?', 'Oh, sorry.', 'Yes, I was looking at the wrong month.'], p: 'Nick nói nhầm ngày 16 (bẫy) vì xem nhầm tháng; khoá học bắt đầu ngày 18 tháng 7 → 18th July' },
        2: { v: 'Khi lễ tân giữ chỗ cho Nick.', t: 'So the code for that is Q1632.', p: 'Mã khoá học là Q1632 → Q1632' },
        3: { v: 'Khi hỏi Nick đã học khoá nào trước đây.', t: ['I did one last September.', 'It was on photographs.', 'We learnt about editing them.'], p: 'Khoá trước học chỉnh sửa ảnh → photographs' },
        4: { v: 'Khi lễ tân hỏi tên.', t: ["It's Nick Poskitt.", "That's P-O-S-K-I-T-T."], p: 'Nick đánh vần họ của mình → Poskitt' },
        5: { v: 'Khi lễ tân xác nhận địa chỉ.', t: ['So is your address still 27 Hawthorn Road?', "Oh, it's Hawthorn Way, actually."], p: 'Lễ tân đọc Road (bẫy), Nick sửa lại là Way → Way' },
        6: { v: 'Khi lễ tân hỏi nghề nghiệp.', t: ['Engineer.', 'I wish I could say musician, but maybe one day.'], p: 'Nick là kỹ sư; nhạc sĩ chỉ là mong ước (bẫy musician) → engineer' },
        7: { v: 'Khi hỏi về yêu cầu ăn uống.', t: ["Well, I don't like any sort of fish.", "I'm fine with everything else."], p: 'Nick không ăn bất kỳ loại cá nào → fish' },
        8: { v: 'Khi chọn buổi học riêng một kèm một.', t: ['So you can choose jazz guitar?', 'Hmm, probably not.', "Or there's blues?", 'Yes, maybe.', 'Or rock?', "That sounds good, but no, I think I'll go for the second one."], p: 'Lần lượt jazz, blues, rock; Nick chọn cái thứ hai = blues → blues' },
        9: { v: 'Khi lễ tân hỏi Nick biết đến trung tâm từ đâu.', t: 'Well, this time I just looked on your website, but I originally found out about you from a magazine.', p: 'Lần này xem website (bẫy) nhưng lúc đầu biết đến qua một tạp chí → magazine' },
        10: { v: 'Khi Nick có yêu cầu thêm.', t: ["Well, last time I came I travelled by train and someone met me at the station, but this time I'll be driving.", 'So will there be parking available?'], p: 'Lần này Nick lái xe nên muốn có chỗ đậu xe → parking' },
      },
    },
    {
      part: 2, title: 'Denford Festival', audio: A, clip: [455.9, 869.3], cover: 'town festival street crowd | festival bunting street',
      turns: [['Presenter', "I'd like to welcome"], ['Sam', 'Well, as usual'], ['Presenter', 'Thank you, Sam.'], ['Sam', "Yes, this year's festival"]],
      groups: [
        matching('What is the main attraction in each of the following areas of the festival?\nChoose FIVE answers from the box and write the correct letter, A-G, next to Questions 11-15.',
          ['talks about gardening', 'live music', 'an art exhibition', "a children's playground", 'evening entertainment', 'a competition for adults', 'vegetable market'], [
            [11, 'Bridge Street', 'C'], [12, "King's Park", 'D'], [13, 'Oakvale School', 'F'], [14, 'Green Road', 'B'], [15, 'Sun Lane', 'A'],
          ], { title: 'Attractions', groupTitle: 'Questions 11-15' }),
        mc('Choose the correct letter, A, B or C.\n\nDenford Festival', [
          [16, 'What does Sam say about the festival tickets?', ['They allow you to get into all the festival events.', 'They are more expensive to buy on the day.', 'They have nearly all been sold.'], 'B'],
          [17, 'On the last night of the festival, visitors will be able to', ['take part in a dance.', 'go to a theatre performance.', 'watch some fireworks.'], 'A'],
          [18, 'What will be provided for international visitors?', ['discounts on accommodation.', 'tours of the local area.', 'a guide written in different languages.'], 'B'],
          [19, 'What information is given about car park A?', ['It is bigger than car park B.', 'It is closer to town than car park B.', 'It will close earlier than car park B.'], 'A'],
          [20, 'What change have the organisers made to the programme this year?', ['replacing the programme with an app', 'reducing the number of programmes printed', 'introducing a charge for the programmes'], 'B'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi Sam nói về phố Bridge Street.', t: 'Local schoolchildren took part in a competition to paint pictures of the local landscape, and you\'ll be able to see all their work displayed here.', p: 'Cuộc thi vẽ của học sinh đã xong (bẫy F); ở đây trưng bày tranh = triển lãm nghệ thuật → C' },
        12: { v: "Khi Sam nói về King's Park.", t: "At Kings Park, we've built a climbing wall, and there'll also be an inflatable bouncy castle for kids to burn off excess energy.", p: 'Tường leo núi và lâu đài hơi cho trẻ em = sân chơi trẻ em → D' },
        13: { v: 'Khi Sam nói về trường Oakvale.', t: ["If you're over 18, there's an exciting contest to take part in here.", "You'll have an hour to prepare your favourite food or dish"], p: 'Cuộc thi nấu ăn cho người trên 18 tuổi = cuộc thi cho người lớn; ca sĩ chỉ trao giải (bẫy B) → F' },
        14: { v: 'Khi Sam nói về đường Green Road.', t: "On Green Road, we'll have some top local groups performing and singing throughout the day until 5", p: 'Các nhóm nhạc biểu diễn suốt ngày đến 5 giờ (không phải buổi tối, bẫy E) = nhạc sống → B' },
        15: { v: 'Khi Sam nói về Sun Lane.', t: "we'd encourage everyone to go to Sun Lane, where we'll have a number of experts giving tips and advice on how to successfully grow your own fruit and vegetables.", p: 'Chuyên gia hướng dẫn tự trồng rau quả = nói chuyện về làm vườn, không phải chợ rau (bẫy G) → A' },
        16: { v: 'Khi Sam nói về vé.', t: ['Tickets can be purchased from our website or at the festival on the day, although those will cost a bit more.', 'The tickets give you free entry to most areas, although you do need to pay extra to get into some of the special events.'], p: 'Vé chỉ vào được hầu hết khu vực (loại A); mua tại chỗ trong ngày sẽ đắt hơn → B' },
        17: { v: 'Khi nói về đêm cuối lễ hội.', t: ["We usually have a big firework display, but it's proven too expensive this year.", "So instead, we're holding a dance for everyone who wants to come."], p: 'Không bắn pháo hoa (bẫy C); tổ chức khiêu vũ trong nhà hát (bẫy B) → A' },
        18: { v: 'Khi nói về khách quốc tế.', t: ["And we've organised a help desk to advise people on finding accommodation if they need it.", "We'll also be offering day trips to points of interest in the region at very reasonable prices."], p: 'Chỉ tư vấn chỗ ở chứ không giảm giá (bẫy A); có các chuyến tham quan trong vùng → B' },
        19: { v: 'Khi nói về bãi đỗ xe.', t: ["From Car Park A, there is a 15-minute walk along the river to the town centre.", "It takes a little longer to get to the festival, but it's twice the size of B"], p: 'Bãi B ở trung tâm (loại B); bãi A rộng gấp đôi bãi B → A' },
        20: { v: 'Khi nói về chương trình lễ hội.', t: ['We looked into having an app instead, but that was too expensive.', 'So, in the end, we decided to put the programme on our website and save that way.', "You'll still be able to pick up a hard copy at the festival if you want."], p: 'Ứng dụng quá đắt (loại A); đưa lên website, vẫn có bản in tại lễ hội = in ít đi → B' },
      },
    },
    {
      part: 3, title: 'Action Research Course for Practising Teachers', audio: A, clip: [869.3, 1178.8], cover: 'teacher observing classroom notes | teachers meeting training',
      fix: [['Dr. Williams. Come in.', 'Dr Williams? Come in.']],
      turns: [
        ['Student', 'Dr Williams?'], ['Dr Williams', 'Come in.'], ['Student', 'Thanks.'], ['Dr Williams', 'How can I help you?'], ['Student', "Well, I'm interested"],
        ['Dr Williams', 'Sure.'], ['Student', 'Well, first of all'], ['Dr Williams', "That's right, and I'm afraid"], ['Student', "Well, I've been one"],
        ['Dr Williams', "That's plenty"], ['Student', 'And can I ask'], ['Dr Williams', "Yes, I've done so"], ['Student', 'Oh.'], ['Dr Williams', "He's just written"],
        ['Student', 'Right.'], ['Dr Williams', 'Well, the obvious aim'], ['Student', 'Yes, of course.'], ['Dr Williams', 'And then there\'s something'],
        ['Student', 'Yes.'], ['Dr Williams', 'Well, the last major objective'], ['Student', 'Great.'], ['Dr Williams', 'Well, the course is organised'],
        ['Student', 'Oh, yes.'], ['Dr Williams', 'And we ask you to try some out'], ['Student', 'Right.'], ['Dr Williams', "Yes, that's right."],
        ['Student', "And what's the point"], ['Dr Williams', 'Well, it really enhances'], ['Student', 'Oh, that sounds interesting.'], ['Dr Williams', "And then we've just added"],
        ['Student', 'I have tried that'], ['Dr Williams', "Yes, that's been our experience"], ['Student', 'That has fewer problems'], ['Dr Williams', 'And then we have sessions'],
        ['Student', 'Oh, right.'], ['Dr Williams', 'Yes, but we think'], ['Student', 'Oh, that should be easy.'], ['Dr Williams', 'Yes.'], ['Student', 'Oh, yes.'],
        ['Dr Williams', 'Well, that is a common comment'], ['Student', 'Great.'], ['Dr Williams', "That's really the last"], ['Student', 'Great.'],
      ],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Action Research Course for Practising Teachers', [
          "Course leader: Alan Cumner (get his recent book called '__Q21__')",
          'Course objectives: to develop skills in:',
          '• using different research techniques',
          '• researching as part of a __Q22__',
          '• __Q23__ (in a collaborative culture)',
        ], { 21: 'Professional Learning', 22: 'team', 23: 'presenting results' }, 'Questions 21-23'),
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS for each answer.', ['Course Components', 'Additional information'], [
          ['<strong>Observational techniques</strong>', ''],
          ['Using observation checklists', 'To record aspects of lesson, e.g. __Q24__ of pupils'],
          ['Writing a __Q25__', 'Used to improve skill of reflection'],
          ['__Q26__', 'Try out on fellow students (in classroom __Q27__)'],
          ['<strong>Non-observational techniques</strong>', ''],
          ['Analysing __Q28__', 'Use statistics based on own students'],
          ['Using questionnaires', 'Use the __Q29__ to find respondents'],
          ['Using __Q30__', 'Own choice of respondents'],
        ], { 24: 'behaviour/behavior', 25: 'diary', 26: 'video recording/video recordings', 27: 'simulation', 28: 'test results', 29: 'internet', 30: 'interviews' }, 'Questions 24-30'),
      ],
      expl: {
        21: { v: 'Khi Dr Williams giới thiệu người phụ trách khoá học.', t: ["He's just written a very interesting book on action research, which you should get hold of.", 'The title is Professional Learning.'], p: 'Tên cuốn sách mới của Alan Cumner → Professional Learning' },
        22: { v: 'Khi nói về mục tiêu khoá học.', t: "And then there's something that's crucial to action research, and that's the skill of researching in a team.", p: 'Kỹ năng nghiên cứu theo nhóm → team' },
        23: { v: 'Khi sinh viên hỏi về việc phổ biến kết quả.', t: ['Well, the last major objective is similar to that, but not quite the same.', "It's on presenting results as part of the wider collaborative culture."], p: 'Không hẳn là phổ biến kết quả (bẫy dissemination); mục tiêu là trình bày kết quả → presenting results' },
        24: { v: 'Khi nói về bảng kiểm quan sát.', t: 'so you can look at an element of a lesson, such as pupil behaviour', p: 'Quan sát một yếu tố của tiết học như hành vi học sinh → behaviour' },
        25: { v: 'Khi sinh viên hỏi về việc viết nhật ký.', t: ['Somebody told me we have to keep a diary.', "Yes, that's right.", 'Well, it really enhances your capacity for reflection.'], p: 'Viết nhật ký giúp tăng khả năng suy ngẫm → diary' },
        26: { v: 'Khi nói về kỹ thuật quan sát mới.', t: "And then we've just added another observational technique to the course, which is video recording.", p: 'Kỹ thuật mới là quay video → video recording' },
        27: { v: 'Khi nói nơi thử kỹ thuật quay video.', t: 'So we decided to get you to try this technique out with your fellow students in classroom simulation', p: 'Thử với các bạn học trong lớp học mô phỏng → simulation' },
        28: { v: 'Khi nói về kỹ thuật không quan sát.', t: ['And rather controversially, we start with ways of scrutinising test results.', 'We ask you to bring along statistics relating to your own students for this.'], p: 'Phân tích kỹ kết quả kiểm tra, dùng số liệu của học sinh mình → test results' },
        29: { v: 'Khi nói về bảng câu hỏi.', t: "and use the Internet in order to identify respondents.", p: 'Dùng Internet để tìm người trả lời → internet' },
        30: { v: 'Khi sinh viên hỏi về phỏng vấn.', t: ['And will there be anything on interviews?', "That's really the last major section, and we ask you to choose your own respondents for that as part of a final project."], p: 'Phần phỏng vấn: tự chọn người trả lời → interviews' },
      },
    },
    { part: 4, title: 'The Impact of Technology on Young People', reuse: '6a53b2975c459ab074ce48ae' },
  ],
};
