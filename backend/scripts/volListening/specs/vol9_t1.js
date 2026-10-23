// Vol 9 – Test 1 (questions "LISTENING/TEST 1-L.docx", typed; plan = the image embedded in it, redrawn without the
// publisher watermark → img/t1/map_redraw.png; key + transcript "LISTENING/KEY - TRANSCRIPT/KEY TEST 1-L.docx" = key lines
// "Câu số N:" then a TurboScribe transcript (headings "Section N", inline "(m:ss - m:ss)" timestamps, no speakers);
// audio = the whole test in one file "LISTENING/AUDIO/TEST 1.mp4" → clip per part (web/vol9/clips.js + sil.js).
// Turns by content + voice pitch (speaker_pitch.js). P1 plays the example first, then the whole conversation → cut.
// T1 P3: "My problem is creating things to worry about…" is Rob's voice (per-word pitch ~110-160 Hz like his lines before it;
// Jen 165-290 Hz) — kept as recorded although it reads like Jen's reply.
// Q18-20: the plan has numbered rooms and a word box (paper lists A-E, G, H — no F) → map with a word bank, keys = words.
const { note, mc, multi, map } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 1.mp4';

module.exports = {
  vol: 9, test: 1, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 1-L.docx',
  rawRe: [...RE, ['Springdown', 'Spring Down']],
  sections: [
    {
      part: 1, title: 'Sharing a House', audio: A, clip: [44.2, 370.4], cover: 'shared house bedroom student | house keys door rental',
      cut: [['On this occasion only', 'Listen carefully and answer questions one to five.']],
      turns: [
        ['Jim', "Hi, I'm Jim."], ['Peter', "Hi, I'm Peter."], ['Jim', 'Great.'], ['Peter', 'Okay.'], ['Jim', 'Well, first of all'],
        ['Peter', 'It depends on the room'], ['Jim', "That's not too bad."], ['Peter', 'Yeah, and the shops'], ['Jim', "That's not a problem."],
        ['Peter', "Well, you're lucky"], ['Jim', 'Fine.'], ['Peter', "Yeah, it's in the kitchen."], ['Jim', "That's fair enough."],
        ['Peter', "Yes, we'll go up"], ['Jim', 'No problem.'], ['Peter', "Well, we've just got"], ['Jim', "I'll have a look"],
        ['Peter', 'One thing.'], ['Jim', 'Me too'], ['Peter', 'Great.'], ['Jim', 'In the afternoons.'], ['Peter', 'Mine are in the afternoons'],
        ['Jim', 'Good idea.'], ['Peter', "Well, if you're interested"], ['Jim', 'Yes, that should be fine.'], ['Peter', 'Yeah, that sounds fine.'],
      ],
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Sharing a House', [
          "Jim's weekly rent will be $ __Q1__",
          'Jim can park his car in the __Q2__',
          'The telephone is in the __Q3__',
          'Jim will bring a __Q4__ for his bedroom.',
          'Peter would like Jim to bring a __Q5__',
          'Peter and Jim will probably watch TV on __Q6__',
          'Jim works in a __Q7__ twice a week.',
          'Peter will share the cost of __Q8__ with Jim.',
          'Peter wants Jim to move in by __Q9__',
          'Jim agrees to move in after his __Q10__',
        ], {
          1: '80/$80/eighty', 2: 'garage', 3: 'kitchen', 4: 'heater', 5: 'toaster', 6: 'Friday evening/Friday evenings/Friday', 7: 'supermarket',
          8: 'petrol', 9: '1st of June/1st June/1 June/June 1st/June 1/the 1st of June', 10: 'exam',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Jim hỏi về tiền thuê.', t: ['I have the large bedroom, so I pay $110 a week.', "Yours is $80 because it's a bit smaller."], p: 'Peter trả 110 đô vì phòng lớn (bẫy 110); phòng của Jim nhỏ hơn nên 80 đô → 80' },
        2: { v: 'Khi Jim hỏi chỗ đậu xe.', t: "Well, you're lucky because this house has a garage.", p: 'Không đậu được ngoài đường hay ở hẻm sau; nhà có ga-ra → garage' },
        3: { v: 'Khi Jim hỏi về điện thoại.', t: ["Yeah, it's in the kitchen.", 'It was in the living room, but it was hard to hear over the television.'], p: 'Trước để ở phòng khách (bẫy living room); giờ ở trong bếp → kitchen' },
        4: { v: 'Khi Peter nói phòng của Jim ban đêm khá lạnh.', t: ["But it does get quite cold at night in that room and it doesn't have a heater.", "My friend has just given me one, so I'll bring that."], p: 'Phòng không có máy sưởi; Jim sẽ mang máy sưởi bạn vừa cho → heater' },
        5: { v: 'Khi Jim hỏi có cần mang gì nữa không.', t: "Well, we've just got a microwave and my mother bought me a rice cooker, but it would be great if you had a toaster.", p: 'Đã có lò vi sóng và nồi cơm (bẫy); Peter muốn Jim mang máy nướng bánh mì → toaster' },
        6: { v: 'Khi Peter nói mình là fan thể thao.', t: ["I'm a keen sports fan and I usually watch the game on TV on Friday evening.", "Me too, so that's good."], p: 'Peter thường xem thể thao tối thứ Sáu, Jim cũng vậy → Friday evening' },
        7: { v: 'Khi Jim nói về việc làm thêm.', t: 'And I work at the supermarket on Tuesday and Thursday nights.', p: 'Jim làm ở siêu thị tối thứ Ba và thứ Năm (hai lần một tuần) → supermarket' },
        8: { v: 'Khi Peter muốn đi nhờ xe Jim.', t: ['You could give me a lift.', 'We can share the petrol.'], p: 'Peter đi nhờ xe và sẽ chia tiền xăng → petrol' },
        9: { v: 'Khi Jim hỏi khi nào có thể dọn đến.', t: 'I need someone by the 1st of June when the new rent period starts.', p: 'Peter cần người ở trước ngày 1 tháng 6 → 1st of June' },
        10: { v: 'Khi Jim đồng ý dọn đến.', t: "I've got an exam next week, so I'll move in after that if that's OK.", p: 'Jim có bài thi tuần sau, thi xong sẽ dọn đến → exam' },
      },
    },
    {
      part: 2, title: 'Spring Down Junior School', audio: A, clip: [370.4, 775.3], cover: 'primary school classroom children | school hallway lockers',
      turns: [],
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Spring Down Junior School', [
          'The school day starts at __Q11__ with registration, and finishes at 4 p.m.',
          'The school canteen offers a __Q12__ for lunch.',
          'The morning and afternoon breaks each last for __Q13__.',
          'On Thursday afternoons all children must take part in __Q14__.',
          'Every term the children do a special __Q15__.',
          'The children are given tests each __Q16__.',
          'The children can go to __Q17__ after school to learn new skills such as music.',
        ], { 11: '8.55/8:55/8.55 a.m./8:55 a.m./8.55am/8:55am', 12: 'hot meal', 13: '15 minutes/fifteen minutes', 14: 'sports/sport', 15: 'poster', 16: 'month', 17: 'clubs' }, 'Questions 11-17'),
        {
          ...map('Label the plan below.\nChoose THREE answers from the box and write them next to Questions 18-20.', [
            [18, 'Question 18', "Head's office"], [19, 'Question 19', 'music room'], [20, 'Question 20', 'gym'],
          ], { img: 'img/t1/map_redraw.png' }, 'Questions 18-20'),
          dragDropConfig: { text: '', words: ['music room', 'assembly hall', 'computer room', 'cloakroom', "Head's office", 'gym', 'reception'] },
        },
      ],
      expl: {
        11: { v: 'Khi nói về giờ bắt đầu ngày học.', t: 'Children are expected to arrive at school between 8.45 and 8.50 and the bell is rung for everybody to go to their classrooms at 8.55 so that we can take the register.', p: 'Đến trường 8.45–8.50 (bẫy); chuông vào lớp điểm danh lúc 8.55 → 8.55' },
        12: { v: 'Khi nói về bữa trưa ở căng-tin.', t: 'Lunch is served in the canteen and children can bring their own packed lunch or a hot meal is available.', p: 'Trẻ có thể mang cơm hộp, còn căng-tin có bữa ăn nóng → hot meal' },
        13: { v: 'Khi nói về giờ giải lao.', t: 'In the middle of the morning and the middle of the afternoon, there are two breaks of 15 minutes', p: 'Hai giờ giải lao sáng và chiều, mỗi lần 15 phút → 15 minutes' },
        14: { v: 'Khi nói về chiều thứ Năm.', t: 'For example, on Thursday afternoons, rather than continuing with lessons, we expect the whole school to do sports.', p: 'Chiều thứ Năm cả trường chơi thể thao thay vì học → sports' },
        15: { v: 'Khi nói về hoạt động nghệ thuật dài hạn.', t: 'So, for each of the three terms, they are expected to produce a poster.', p: 'Mỗi học kỳ trẻ làm một tấm áp phích → poster' },
        16: { v: 'Khi nói về việc theo dõi việc học.', t: 'every month, rather than the teacher giving the children a report, as I know some schools do, they have to do tests', p: 'Không phát báo cáo (bẫy report); mỗi tháng làm bài kiểm tra → month' },
        17: { v: 'Khi nói về hoạt động sau giờ học.', t: 'many of them have set up clubs that the children go to for an extra hour to learn a new skill, such as music.', p: 'Giáo viên lập các câu lạc bộ sau giờ học để học kỹ năng mới như âm nhạc → clubs' },
        18: { v: 'Khi bắt đầu đi xem trường từ cửa chính.', t: "We're here at the main entrance and on the right, where you would normally expect to find reception, you'll see the Head's office.", p: 'Bên phải cửa chính, chỗ thường là quầy lễ tân (bẫy reception), là phòng hiệu trưởng → Head\'s office' },
        19: { v: 'Khi nói về phòng bên trái các lớp học.', t: 'On the left of the classrooms, we have converted one of the old cloakrooms to create a music room', p: 'Phòng bên trái dãy lớp là phòng gửi đồ cũ (bẫy cloakroom) nay thành phòng nhạc → music room' },
        20: { v: 'Khi nói về phòng cạnh hội trường chính.', t: "We used to be squashed into the old assembly hall next door, which, as you can see, has now been turned into a gym for the children", p: 'Hội trường cũ bên cạnh (bẫy assembly hall) nay thành phòng thể dục → gym' },
      },
    },
    {
      part: 3, title: 'Forensic Linguistics', audio: A, clip: [775.3, 1168.7], cover: 'audio waveform voice recording | microphone recording studio',
      fix: [['07:56', '']],
      turns: [
        ['Rob', 'Hi Jen.'], ['Jen', 'Hi Rob.'], ['Rob', 'Sure.'], ['Jen', 'Sounds OK.'], ['Rob', 'Then we can add'], ['Jen', 'Good point.'],
        ['Rob', 'Yeah.'], ['Jen', "Well, I've already listened"], ['Rob', "Well, they weren't going"], ['Jen', "It'll be fine."], ['Rob', 'I guess so.'],
        ['Jen', 'Yes.'], ['Rob', "Oh, and don't start"], ['Jen', "We'll have to do some background"], ['Rob', 'OK.'], ['Jen', 'Research methods'],
        ['Rob', 'OK.'], ['Jen', 'Me neither.'], ['Rob', "I'm sure they won't"], ['Jen', 'I know.'], ['Rob', 'OK.'], ['Jen', 'Maybe we should split'],
        ['Rob', 'OK.'], ['Jen', 'Great.'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What do the students agree about defining forensic linguistics?', ['The dictionary definition was not very useful.', 'They could provide an example of the kind of work involved.', 'They should read about the subject to see how it is described.'], 'B'],
          [22, 'Jen thinks it will be difficult to analyse the voice recording because', ['it is not of good quality.', 'the accent is difficult to understand.', "she doesn't know if the speaker is male or female."], 'A'],
          [23, "Why does Jen think that the 'suspect' might vary their voice patterns?", ["because they're being recorded.", "because they've been told to.", 'because they feel uncomfortable about their accent.'], 'B'],
          [24, "What does Rob think about Jen's approach to study?", ['She worries too much about her ability.', 'She often ignores the most important issues.', 'She has trouble getting started.'], 'A'],
        ], 'Questions 21-24'),
        multi('Choose TWO letters, A-E.', 25, 'Which TWO books do Jen and Rob decide to get from the library?', ['Voice Identification', 'Modern Forensic Techniques', 'Language and Crime', 'Forensics Today', 'Research Methods in Forensic Linguistics'], ['B', 'E'], 'Questions 25-26'),
        multi('Choose TWO letters, A-E.', 27, 'Which TWO practical considerations are both Jen and Rob concerned about?', ['how much time they have for writing up the project', 'being able to do enough research', "only speaking to the 'suspect' once", 'using recording equipment', "how easy it will be to contact the 'suspect'"], ['A', 'D'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO sections of the project will Rob write alone?', ['Methodology', 'Literature review', 'Introduction', 'Analysis', 'Discussion and conclusions'], ['C', 'E'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi hai bạn bàn cách định nghĩa môn học.', t: ['I looked it up in my dictionary and I got something similar.', 'Then we can add something about what Forensic Linguists actually do to back it up.', 'You know, like analysing documents to find out who wrote them.', 'Good point.'], p: 'Định nghĩa từ điển cũng tương tự (không phải vô ích, loại A); cả hai đồng ý thêm ví dụ về công việc như phân tích tài liệu → B' },
        22: { v: 'Khi Jen nói về đoạn ghi âm.', t: ["I can't even tell if it's a man or a woman.", "But I guess that doesn't matter.", "Where we're really going to get in trouble is that the recording is very unclear."], p: 'Không biết nam hay nữ thì không sao (bẫy C), giọng địa phương cũng không chắc ảnh hưởng (bẫy B); khó là vì bản ghi rất không rõ → A' },
        23: { v: 'Khi Jen nói về việc "nghi phạm" đổi giọng.', t: 'but they might do something like speaking with another accent because the tutor suggests they do that just to test us.', p: 'Họ có thể nói giọng khác vì giảng viên bảo làm thế để thử thách = được yêu cầu → B' },
        24: { v: 'Khi Rob nhắc Jen trước khi bắt tay vào làm.', t: ["Oh, and don't start your usual self-doubt about whether you can do the work or not.", 'We usually do OK in the end.'], p: 'Rob bảo Jen đừng lại nghi ngờ bản thân có làm được không = lo lắng quá nhiều về năng lực → A' },
        25: { v: 'Khi chọn sách mượn thư viện.', t: ['Research methods in forensic linguistics.', 'I guess we ought to borrow that.', 'But we should get out modern forensic techniques.'], p: 'Forensics Today không có gì về nhận dạng giọng (loại D), Language and Crime đã mượn rồi (loại C), Voice Identification mượn của bạn George (loại A); mượn Research Methods và Modern Forensic Techniques → B' },
        26: { v: 'Khi chọn sách mượn thư viện.', t: ['Research methods in forensic linguistics.', 'I guess we ought to borrow that.', 'But we should get out modern forensic techniques.'], p: 'Hai cuốn sẽ mượn ở thư viện là Modern Forensic Techniques và Research Methods in Forensic Linguistics → E' },
        27: { v: 'Khi bàn về phần thực hành.', t: ["I'm not sure about how we're going to record the voices.", "I'm not too good on the technical side of things.", 'Me neither.', "I'm more worried about fitting in the writing up.", 'I know.'], p: 'Cả hai đều lo việc thu âm (thiết bị) và lo không đủ thời gian viết báo cáo; được gặp "nghi phạm" nhiều lần và nghiên cứu thì không đáng lo → A' },
        28: { v: 'Khi bàn về phần thực hành.', t: ["I'm not sure about how we're going to record the voices.", "I'm not too good on the technical side of things.", 'Me neither.'], p: 'Cả hai đều không giỏi kỹ thuật, lo về việc dùng thiết bị ghi âm → D' },
        29: { v: 'Khi chia phần viết.', t: ['Are you any good at introductions?', 'They always seem to let me down.', 'OK.', 'Leave that to me.'], p: 'Jen viết phần mở đầu không tốt; Rob nhận viết phần Introduction → C' },
        30: { v: 'Khi chia phần viết.', t: ['Maybe we should split that part.', "I don't mind writing the methodology section if you feel comfortable doing the discussion and conclusions.", 'And we can do the analysis between us as well.'], p: 'Literature review và Analysis làm chung, Methodology do Jen viết; Rob viết Discussion and conclusions → E' },
      },
    },
    {
      part: 4, title: 'Dormancy', audio: A, clip: [1168.7, 1609.6], cover: 'arctic ground squirrel | snail shell dormant',
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Dormancy', [
          'Organisms enter a state of dormancy, or inactivity, to:',
          '• save available __Q31__',
          '• reduce demands on their environment',
          '<strong>Value of dormancy</strong>',
          'Organisms which become dormant:',
          '• can live in conditions which are environmentally __Q32__',
          '• can live in a wider range of places',
          '• have less __Q33__ from other animals',
          '<strong>Causes of dormancy</strong>',
          '• changes in temperature and __Q34__',
          '• availability of food, water, oxygen',
          '<strong>Dormancy in insects</strong>',
          '• There may be a __Q35__ in their metabolism (diapause)',
          '• Diapause occurs during extreme conditions, or as part of the life cycle',
          '<strong>The African lungfish</strong>',
          '• It buries itself in the __Q36__ and creates a slimy cocoon',
          '• Two dangers: __Q37__ and desiccation',
          '<strong>Snails</strong>',
          '• Some close their shells with a membrane during dormancy',
          '• Light-coloured shells reflect sunlight and limit __Q38__',
          '<strong>Hibernation</strong>',
          '• Only warm-blooded animals hibernate',
          '<strong>The Arctic ground squirrel</strong>',
          '• It hibernates in an insulated, underground __Q39__',
          '• It loses 40% of its weight during hibernation',
          '• When it wakes up, the first part of the body to heat up is the __Q40__',
        ], { 31: 'resources', 32: 'stressful', 33: 'competition', 34: 'light', 35: 'reduction', 36: 'mud', 37: 'starvation', 38: 'evaporation', 39: 'nest', 40: 'heart' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi định nghĩa trạng thái ngủ lịm.', t: 'Dormancy is a state of inactivity that organisms or living things enter when they need to conserve the resources available to them and reduce their demands on their environment.', p: 'Sinh vật ngủ lịm để tiết kiệm nguồn lực sẵn có (conserve = save) → resources' },
        32: { v: 'Khi nói về lợi ích của ngủ lịm.', t: 'animals that have the ability to become dormant can survive conditions which are stressful in environmental terms.', p: 'Sống được trong điều kiện khắc nghiệt về mặt môi trường → stressful' },
        33: { v: 'Khi nói về việc sống được ở nơi loài khác không sống nổi.', t: 'the amount of competition they have to deal with from other creatures is greatly reduced.', p: 'Sự cạnh tranh với sinh vật khác giảm mạnh → competition' },
        34: { v: 'Khi nói về nguyên nhân gây ngủ lịm.', t: 'the ones that are the most significant are changes in temperature and the amount of light organisms get.', p: 'Quan trọng nhất là thay đổi nhiệt độ và lượng ánh sáng → light' },
        35: { v: 'Khi nói về côn trùng.', t: 'Insects can experience a reduction in their metabolism, which is a form of dormancy called diapause.', p: 'Côn trùng giảm trao đổi chất, gọi là diapause → reduction' },
        36: { v: 'Khi nói về cá phổi châu Phi.', t: 'When the water supply is low, the African lungfish burrows deep into the mud.', p: 'Cá phổi vùi mình sâu xuống bùn → mud' },
        37: { v: 'Khi nói về hai mối nguy khi cá ngủ lịm.', t: ['While dormant, it faces two dangers.', 'One is the possibility of starvation'], p: 'Hai mối nguy là chết đói và mất nước → starvation' },
        38: { v: 'Khi nói về vỏ ốc sáng màu.', t: 'Snails that remain outside during their dormancy can usually be recognised by a rather brightly coloured shell reflecting the sunlight and so minimising evaporation.', p: 'Vỏ sáng màu phản chiếu ánh nắng nên giảm bốc hơi nước → evaporation' },
        39: { v: 'Khi nói về sóc đất Bắc Cực.', t: 'This squirrel digs underground and builds a nest that is insulated.', p: 'Sóc đào dưới đất và làm tổ cách nhiệt → nest' },
        40: { v: 'Khi nói về lúc sóc thức dậy.', t: 'The area around the heart warms more quickly than the rest of the animal.', p: 'Vùng quanh tim ấm lên nhanh nhất → heart' },
      },
    },
  ],
};
