// Vol 2 – Test 2 (PDF "listening/test 2/Test 2.pdf" p1–7, key p8; audio test 2/part 1–4.mp3)
// Transcripts: Whisper + Otter merge (P3 written out: Otter's speaker turns unusable). P4 is a non-native reading
// with slips; only words that change the meaning were corrected (names: Jeanette Wyneken / Gerald Kooyman, real
// leatherback researchers; "airless seals" → elephant seals, "small lance" → small lungs, as heard).
// Source errors fixed: key Q9–10 "C, D" — the recording says Top Cover agrees a value for the car (A) and the
// woman picks it because she needs storm damage cover (D); a stand-down period (C) is what she wants to avoid.
// Key Q20 "F" — Youth Health links Eyesaver with young children (B); staff training is said of Eye for the Future.
const { note, mc, multi, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 2,
  sections: [
    {
      part: 1, title: 'Travel Insurance', audio: 'listening/test 2/part 1.mp3', cover: 'travel insurance | suitcase airport',
      speakers: { 1: 'Agent', 2: 'Agent', 3: 'Customer' },
      fix: [
        ['Wise decision.\nBy the way,\nCustomer:\nCan a camera', 'Wise decision.\nCustomer:\nBy the way, can a camera'],
        ['electronic equipment.\nAgent:', 'electronic equipment?\nAgent:'],
        ["That's what\nCustomer:\nHappened with", "Customer:\nThat's what happened with"],
        ["for your car?\nTop cover.\nAre you sure?\nIt is pricey.\nCustomer:\nI know.", "for your car?\nCustomer:\nTop cover.\nAgent:\nAre you sure?\nIt is pricey.\nCustomer:\nI know."],
        ['hailstorm.\nUh-huh.\nCustomer:\nSo, I need', 'hailstorm.\nCustomer:\nUh-huh.\nSo, I need'],
        ["taken out the policy.\nOh dear.\nThen I spent", "taken out the policy.\nAgent:\nOh dear.\nCustomer:\nThen I spent"],
        ['relatively new.\nIf you\nAgent:\nChoose Top Cover', 'relatively new.\nAgent:\nIf you choose Top Cover'],
        ['in the long run.\nThank you.\nThank you.', 'in the long run.'],
        ['Multisaver', 'Multi-saver'], ['multi-saver policy', 'Multi-saver policy'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Travel Insurance', [
          'Type: __Q1__ Comprehensive',
          '<strong>Section 1 – Baggage and Personal Effects</strong>',
          '• single __Q2__ : $1,500',
          '• cameras and portable electronic __Q3__ : $2,500',
          '• money: $ __Q4__',
          '• disrupted travel: reasonable __Q5__',
          '(missed connections or early return, as verified by the __Q6__ )',
        ], { 1: 'individual', 2: 'item', 3: 'equipment', 4: '700', 5: 'costs', 6: 'airline' }, 'Questions 1-6'),
        mc('Choose the correct letter, A, B or C.', [
          [7, 'The woman will buy', ['a new motorbike.', 'an old car.', 'a new car.'], 'B'],
          [8, 'The woman does not want to insure her vehicle with a Multi-saver policy', ['because it has too many conditions.', 'because it is rather expensive.', 'because it benefits homeowners.'], 'C'],
        ], 'Questions 7-8'),
        multi('Choose TWO letters, A-E.', 9, 'Which TWO of the following relate to the Top Cover policy?', ["it includes an agreement on the value of a holder's vehicle", 'it covers vehicles of any age', 'there is a stand-down period before it takes effect', 'it covers storm damage', 'it is cheaper than many other policies'], ['A', 'D'], 'Questions 9-10'),
      ],
      expl: {
        1: { v: 'Đầu bài, khi hỏi bảo hiểm cho ai.', t: ['Would the travel insurance be for you or for your family as well?', 'Just for me.', 'So, individual.'], p: 'Chỉ mua cho một mình khách → individual' },
        2: { v: 'Khi khách hỏi máy ảnh có tính là một món riêng không.', t: ['If you have an expensive camera, you can nominate it as a single item.', 'Our maximum payout is $1,500.'], p: 'Mức chi trả tối đa $1,500 dành cho một món đồ riêng lẻ (single item) → item' },
        3: { v: 'Cùng đoạn, về nhóm máy ảnh và thiết bị điện tử.', t: 'Can a camera be counted as a single item, or must it be included in cameras and portable electronic equipment?', p: 'Tên mục bảo hiểm là “cameras and portable electronic equipment” → equipment' },
        4: { v: 'Khi nói về tiền mặt bị mất.', t: ['However, in that one, there was a higher limit for lost or stolen money.', 'Yours is only $700.'], p: 'Hạn mức tiền mặt của công ty này chỉ $700 → 700' },
        5: { v: 'Phần Disrupted Travel.', t: 'In the Disrupted Travel section, Reasonable Costs is written for a missed connection or an early return instead of an amount of money.', p: 'Mục lỡ chuyến ghi “Reasonable Costs” thay cho số tiền → costs' },
        6: { v: 'Khi nhân viên giải thích cách xác minh.', t: 'We rely on information from the airline to determine this.', p: '“Rely on information from” = verified by; thông tin do hãng hàng không cung cấp → airline' },
        7: { v: 'Phần bảo hiểm xe.', t: "I'm about to buy a nice old car, a vintage Jaguar XJ6.", p: 'Xe máy cũ là sở thích của nhân viên (bẫy A); khách sắp mua một chiếc xe hơi cũ → B' },
        8: { v: 'Khi nói về gói Multi-saver.', t: "I'm buying an expensive car, but I rent my house, so I'm not ready for Multi-saver.", p: 'Multi-saver gộp nhà và đồ đạc – có lợi cho người có nhà; khách đi thuê nhà nên chưa cần → C' },
        9: { v: 'Cuối bài, khi nhân viên giải thích gói Top Cover.', t: 'If you choose Top Cover, we agree on a value for your car and renegotiate each year to avoid disputes.', p: 'Top Cover thoả thuận trước giá trị xe → A (key gốc ghi C là sai: thời gian chờ là điều khách muốn tránh)' },
        10: { v: 'Như câu 9 (chọn 2 đáp án).', t: ['But last time I had insurance, I wasn\'t covered for storm damage.', 'So, I need storm damage insurance.'], p: 'Khách chọn Top Cover vì cần bảo hiểm thiệt hại do bão; gói này không rẻ (“not as cheap as some”) nên loại E → D' },
      },
    },
    {
      part: 2, title: 'Eyesaver Charity', audio: 'listening/test 2/part 2.mp3', cover: 'donated eyeglasses | eye charity glasses',
      fix: [
        ['To 16.\n', ''], ['Now listen,\nAnd answer questions 17 to 20.\nFinally,\nI would like', 'Finally, I would like'],
        ['iSaver iSaver was', 'Eyesaver.\nEyesaver was'], ['iSaver', 'Eyesaver'], ['EyeSaver', 'Eyesaver'], ['ice saver', 'Eyesaver'],
        ['National Vision Fund Finding group', 'National Vision Funding Group'], ['SAM eye care institution', "Sam's Eyecare Institution"],
        ['So Many people around', 'So many people around'], ['brighter and more beautiful...', 'brighter and more beautiful place.'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'When was Eyesaver founded?', ['15 years ago', '30 years ago', '60 years ago'], 'B'],
          [12, 'What was the original aim of the program?', ['to offer common equipment', 'to offer medication to children with eye diseases', 'to offer operational help to people who had eye problems'], 'A'],
          [13, 'The main funding comes from', ['monthly donation.', 'donation from rich people.', 'money collected on the street.'], 'C'],
          [14, 'What does the speaker expect listeners to provide?', ['glasses for the patients', 'money donation', 'voluntary work'], 'A'],
          [15, 'What is the main purpose of this program?', ['to show people their donation can make a difference', 'to show people how easily eye problems can be cured', 'to educate people about common eye diseases'], 'A'],
          [16, 'Eyesaver advertises for the program through', ['computers.', 'recordings.', 'training.'], 'B'],
        ], 'Questions 11-16'),
        matching('What role does each of the following organisations play for the development of Eyesaver?\nWrite the correct letter, A-F, next to Questions 17-20.',
          ['gain more donation', 'involve more children in need', 'earn support from colleges', 'help look for equipment manufacturers', 'take the reputation to a higher level', 'recruit and support staff'], [
            [17, 'National Vision Funding Group', 'E'],
            [18, 'Eye for the Future', 'D'],
            [19, "Sam's Eyecare Institution", 'C'],
            [20, 'Youth Health', 'B'],
          ], { groupTitle: 'Questions 17-20' }),
      ],
      expl: {
        11: { v: 'Đầu bài, lịch sử tổ chức.', t: ['I am 60 years old now and I started working for this organisation 15 years ago', 'Now our charity has been helping people for three decades.'], p: '60 là tuổi người nói, 15 năm là thời gian anh làm ở đây (bẫy); tổ chức đã hoạt động ba thập kỷ → B' },
        12: { v: 'Khi nói về mục tiêu ban đầu của nhà sáng lập.', t: 'But when Mr. Gaines just founded Eyesaver he wanted the programme to be able to offer common eye equipment to those who needed it.', p: 'Thuốc cho trẻ em và hỗ trợ phẫu thuật là việc làm hiện nay (bẫy); ban đầu là cung cấp thiết bị mắt thông dụng → A' },
        13: { v: 'Khi nói về nguồn tài chính.', t: ['Now we have over 1,500 volunteers who work on the streets with the little red donation boxes, which many of you are familiar with.', 'And this is the main source of funding for us.'], p: 'Quyên góp từ người giàu chỉ là dự định (bẫy B); nguồn chính là tiền tình nguyện viên quyên trên đường phố → C' },
        14: { v: 'Khi người nói kêu gọi người nghe.', t: 'But our main need is to collect glasses for our patients.', p: 'Nhiều người muốn góp tiền nhưng nhu cầu chính là kính cũ cho bệnh nhân → A' },
        15: { v: 'Khi nói về mục tiêu của chương trình.', t: "Our goal is to make people aware that even the smallest of donations can help change a person's life.", p: 'Mục tiêu là cho mọi người thấy khoản góp nhỏ nhất cũng thay đổi cuộc đời người khác; giáo dục về bệnh mắt là chương trình tiếp theo (bẫy C) → A' },
        16: { v: 'Khi nói về cách quảng bá.', t: 'But in recent years, the main means of advertising our programme is through audio recordings.', p: 'Máy tính là cách dùng lúc đầu (bẫy A); hiện nay quảng bá chủ yếu bằng bản ghi âm → B' },
        17: { v: 'Phần các tổ chức hợp tác, tổ chức đầu tiên.', t: 'Our affiliation with the National Vision Funding Group has allowed us to gain fame and to become even more significant.', p: '“Gain fame, become more significant” = nâng danh tiếng lên tầm cao hơn → E' },
        18: { v: 'Tổ chức thứ hai.', t: 'Our association with the Eye for the Future organisation has allowed us to run cooperative ads, by which we seek producers of equipment to work with us.', p: '“Seek producers of equipment” = tìm nhà sản xuất thiết bị → D' },
        19: { v: 'Tổ chức thứ ba.', t: 'Our relationship with it has given us the opportunity to link with many different academic institutions, including colleges and universities with good reputation.', p: 'Sam\'s Eyecare giúp kết nối với các trường cao đẳng, đại học → C' },
        20: { v: 'Tổ chức cuối cùng.', t: ['And we have a similar friendship with a group called Youth Health.', 'Our connection with that group allows us to link directly with young kids since this is a crucial stage in their growth.'], p: 'Youth Health giúp tiếp cận trực tiếp trẻ nhỏ → B (key gốc ghi F: việc đào tạo nhân viên được nói về Eye for the Future, không phải Youth Health)' },
      },
    },
    {
      part: 3, title: 'Study Options', audio: 'listening/test 2/part 3.mp3', cover: 'physics professor student office | university physics lab',
      transcript: `
Professor Anderson:
Come in, Rangi.
Rangi:
Thank you, Professor Anderson.
Professor Anderson:
I've been meaning to contact you, but I just got back last night.
Rangi:
Where have you been?
Professor Anderson:
Conferences in Massachusetts and New York.
Rangi:
For physics?
Professor Anderson:
Yes.
Rangi:
Great.
I'm looking forward to attending conferences one day.
Professor Anderson:
I imagine that won't be so far away.
I was extremely impressed with your classical mechanics exam.
In fact, you were one of only two students out of 180 to get an A-plus.
Rangi:
Wow.
I really did enjoy the course.
Professor Anderson:
So how can I help you?
Rangi:
I'm sorry to say it's a bit of a long story.
You see, I've had to rethink my studies completely and I wonder if I'm making the right decision.
Professor Anderson:
You're doing two degrees, aren't you?
Science and Arts.
Rangi:
I was doing two.
I've decided to focus on science.
Professor Anderson:
Oh?
Rangi:
It all came about because I wanted to study abroad for a year.
I was thinking about Edinburgh.
Firstly, I sought approval from the maths and physics departments.
I wanted to take quantum mechanics and computer simulations at Edinburgh.
Professor Anderson:
Those are third-year courses, right?
Rangi:
Yeah.
So I received approval from maths and physics.
The stumbling block was the higher authority, the science faculty.
When I submitted my application, it was rejected.
Professor Anderson:
What?
Rangi:
It turns out that students who study abroad for a year can only do first or second year courses or third year courses in a subject that's not their major.
Professor Anderson:
I've never heard that before.
Rangi:
Needless to say, the lecturers who approved my transfer hadn't either, and nor does the regulation appear on the Science Faculty website.
Professor Anderson:
That'd be right.
This faculty is disorganised.
Rangi:
So, then I thought I'd take arts courses at Edinburgh and leave the third year maths until I came back.
I quickly got approval for second year history and philosophy from the arts faculty.
Professor Anderson:
When are you heading off?
Rangi:
That's just it.
During this process, I began to think carefully about my studies.
To be honest, the arts courses I've done were less challenging than the science ones so I've decided to drop arts.
Professor Anderson:
Where do I figure in all this?
Rangi:
The first week after I'd made my decision, I felt fine.
Without doing the arts courses, I could finish my science degree earlier.
But this week, I've had some doubts.
When I started the two degrees, lecturers in the science faculty assured me that these days scientists need a rounded education, which they get if they take some arts courses.
I was even told I'd learn to write and think better if I did philosophy.
Professor Anderson:
I do think the claims made by some lecturers are dubious.
Rangi:
Then there's the fact that now I'm going to be stuck here next year.
I was so excited about going to Europe.
Professor Anderson:
It is disappointing to give that up.
Still, the reason I wanted to contact you, Rangi, is that I'm looking for students to work six hours a week in my lab.
It's paid work, not highly paid, but probably better than working in a bar.
Also, we've just bought a new laser, which you'd learn to use.
Rangi:
That sounds excellent.
As to going abroad…
Professor Anderson:
Why not do your postgraduate studies in the US?
There's some amazing physics being done in Massachusetts.
If you like, I can send you the papers from the conference.
Rangi:
Thanks.
Professor Anderson:
Of course, I'd be sad to lose you if you did go abroad, but an A-plus student like you has a very good chance of winning a major scholarship.
Rangi:
Goodness, I've never even considered that.
Professor Anderson:
Personally, I think committing yourself to science is the way to go.
Rangi:
Thanks, Professor Anderson.
You've taken a load off my mind.
Now I don't have to deal with Hegel or Leibniz.
I've plenty of time to read those conference papers.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What was the Professor attending in Massachusetts and New York?', ['Physics Conferences', 'Physics Class', 'Mechanics Conferences'], 'A'],
          [22, 'What mark did Rangi receive for Classical Mechanics?', ['C plus', 'A plus', 'B plus'], 'B'],
          [23, 'Which degree has Rangi decided to abandon?', ['Math and Physics', 'Science', 'Arts'], 'C'],
          [24, 'What did the Professor think about the Science Faculty?', ["quick response to students' queries", 'has an unclear timetable for students', 'has a comprehensive website'], 'B'],
          [25, "A benefit of Rangi's decision is that he will", ['finish his degree earlier.', 'receive higher marks.', 'improve his writing style.'], 'A'],
          [26, 'The Professor thinks the claims of some lecturers are', ['critical.', 'doubtful.', 'boastful.'], 'B'],
          [27, 'Rangi is disappointed because he', ['will have to work in a bar again.', 'cannot afford to study abroad.', 'will not be going to Europe.'], 'C'],
          [28, 'The Professor offers Rangi', ['a part-time job in his lab.', "supervision of his master's degree.", 'help with his laser experiments.'], 'A'],
          [29, "In the Professor's opinion, Rangi is", ['quite likely to win a scholarship.', 'not so likely to win a scholarship.', 'highly likely to win a scholarship.'], 'C'],
          [30, 'What did Rangi feel by the end of the conversation?', ['thrilled but nervous', 'relieved and grateful', 'a little apprehensive'], 'B'],
        ], 'Questions 21-30'),
      ],
      expl: {
        21: { v: 'Đầu bài, khi Rangi hỏi giáo sư đi đâu về.', t: ['Conferences in Massachusetts and New York.', 'For physics?', 'Yes.'], p: 'Giáo sư dự các hội thảo vật lý → A' },
        22: { v: 'Khi giáo sư khen bài thi cơ học cổ điển.', t: 'In fact, you were one of only two students out of 180 to get an A-plus.', p: 'Rangi là một trong hai sinh viên đạt A+ → B' },
        23: { v: 'Khi Rangi kể đã bỏ một bằng.', t: ['I was doing two.', "I've decided to focus on science."], p: 'Rangi học song song Khoa học và Nghệ thuật, nay tập trung vào Khoa học, tức là bỏ Nghệ thuật → C' },
        24: { v: 'Khi Rangi kể khoa Khoa học từ chối hồ sơ.', t: ['Needless to say, the lecturers who approved my transfer hadn\'t either, and nor does the regulation appear on the Science Faculty website.', 'This faculty is disorganised.'], p: 'Quy định không có trên website (loại C); giáo sư nhận xét khoa làm việc thiếu tổ chức – gần nhất với “lịch/quy định không rõ ràng cho sinh viên” → B' },
        25: { v: 'Khi Rangi nói về quyết định bỏ ngành Nghệ thuật.', t: 'Without doing the arts courses, I could finish my science degree earlier.', p: 'Không học thêm các môn nghệ thuật thì Rangi tốt nghiệp sớm hơn; viết tốt hơn là lợi ích của việc học triết (bẫy C) → A' },
        26: { v: 'Khi giáo sư nhận xét lời hứa của một số giảng viên.', t: 'I do think the claims made by some lecturers are dubious.', p: '“Dubious” = doubtful (đáng ngờ) → B' },
        27: { v: 'Khi Rangi nói về việc phải ở lại.', t: ["Then there's the fact that now I'm going to be stuck here next year.", 'I was so excited about going to Europe.'], p: 'Rangi buồn vì không được đi châu Âu nữa (không phải vì tiền) → C' },
        28: { v: 'Khi giáo sư nói lý do muốn gặp Rangi.', t: "Still, the reason I wanted to contact you, Rangi, is that I'm looking for students to work six hours a week in my lab.", p: 'Công việc có lương, 6 giờ/tuần trong phòng thí nghiệm = việc bán thời gian; máy laser chỉ là thứ Rangi sẽ được học dùng → A' },
        29: { v: 'Khi giáo sư nói về học bổng.', t: 'Of course, I\'d be sad to lose you if you did go abroad, but an A-plus student like you has a very good chance of winning a major scholarship.', p: '“A very good chance” = highly likely → C' },
        30: { v: 'Cuối bài, cảm xúc của Rangi.', t: ['Thanks, Professor Anderson.', "You've taken a load off my mind."], p: '“Taken a load off my mind” = nhẹ nhõm, kèm lời cảm ơn → B' },
      },
    },
    {
      part: 4, title: 'Leatherback Turtles', audio: 'listening/test 2/Part 4.mp3', cover: 'leatherback turtle | sea turtle ocean',
      fix: [
        ['Sea creature called leatherback turtle.\n', ''], ["Janet O'Vanakin", 'Jeanette Wyneken'],
        ['the great whales and the airless seals', 'the great whales and the elephant seals'],
        ['a 650 pounds of female that sank to more than 3 feet', 'a 650-pound female that sank to more than 3,330 feet'],
        ['hot-shelled', 'hard-shelled'], ['tissue damage Unlike', 'tissue damage.\nUnlike'], ['leatherbacks has soft a softer shell made up from widely separated the ribs', 'leatherbacks have a softer shell made up from widely separated ribs'],
        ['avoid a decompression, sickness and other hazards while they dive to the great depths?\nEven sleep for a long period of time.', 'avoid decompression sickness and other hazards while they dive to the great depths and even sleep for a long period of time?'],
        ['have a small lance and falsely exhale', 'have small lungs and partially exhale'], ['nested in Surimi', 'nested in Suriname'],
        ['methods of studying them at.', 'methods of studying them at sea.'], ['Gerald Kuhlman of the Psychological', 'Gerald Kooyman of the Physiological'],
        ['While they keep diving, scientists as soon realized', 'Why they keep diving?\nScientists soon realized'],
        ['a layer of sublanguinary hubris below', 'a layer of zooplankton below'], ['the time of the day, Night dives', 'the time of the day.\nNight dives'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Leatherback Turtles', [
          '<strong>Background:</strong>',
          '• The advantageous __Q31__ of leatherback turtles makes them swim more efficiently than others.',
          '• It is one of the deepest __Q32__ reptiles.',
          '• Shell is __Q33__, not bony, to avoid damage from high pressure.',
          '• Leatherbacks can __Q34__ in the water for several hours due to the size of their lungs.',
          '• Main food is jellyfish, which contains a high proportion of __Q35__ and minerals.',
          '<strong>Research methods:</strong>',
          '• Scientists can learn their __Q36__ pattern in the Atlantic Ocean.',
          '• Scientists can start tracking when the turtle reaches the __Q37__',
          '• Huge front flippers can produce __Q38__ from strong muscles.',
          '• A new recorder can monitor not only their location but also the __Q39__ in the sea.',
          '• Leatherback turtles are found using more __Q40__ to search for food.',
        ], { 31: 'shape', 32: 'diving/dive/dives', 33: 'soft/softer', 34: 'sleep', 35: 'protein', 36: 'migration', 37: 'surface', 38: 'power', 39: 'depth/depths', 40: 'energy' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài, nghiên cứu của Jeanette Wyneken.', t: "Jeanette Wyneken of Florida Atlantic University has shown that there are advantages of the leatherback's streamlined shape.", p: '“Advantages of the streamlined shape” = hình dáng có lợi giúp bơi hiệu quả → shape' },
        32: { v: 'Khi so sánh với các loài lặn sâu khác.', t: "Our recent investigations, however, suggest that leather-backed sea turtles may also be ranked among the ocean's greatest air-breathing dive reptiles.", p: 'Rùa da được xếp vào nhóm bò sát lặn sâu nhất đại dương (key gốc: dives) → diving' },
        33: { v: 'Khi nói về áp suất cao khi lặn sâu.', t: 'Unlike its hard-shelled relatives, leatherbacks have a softer shell made up from widely separated ribs', p: 'Mai mềm (không cứng như họ hàng) giúp chịu áp suất → soft' },
        34: { v: 'Khi đặt câu hỏi làm sao các loài lặn sâu tránh nguy hiểm.', t: ['avoid decompression sickness and other hazards while they dive to the great depths and even sleep for a long period of time?', 'Many of the deepest diving marine mammals have small lungs and partially exhale before diving.'], p: 'Chúng có thể ngủ dưới nước thời gian dài nhờ cấu tạo phổi → sleep' },
        35: { v: 'Phần chế độ ăn.', t: 'This giant of the sea feeds mainly on jellyfish, full of a high protein, and the other useful minerals that they require during the day.', p: 'Sứa giàu protein và khoáng chất → protein' },
        36: { v: 'Phần phương pháp nghiên cứu: gắn máy ghi.', t: 'As a result, we were able to monitor the pattern of migration in Atlantic Ocean when they returned to the sea.', p: 'Máy ghi giúp theo dõi mô hình di cư ở Đại Tây Dương → migration' },
        37: { v: 'Khi nói về việc theo dõi rùa.', t: 'We then began to track and tag the turtles when they swim back to the surface.', p: 'Bắt đầu theo dõi khi rùa bơi trở lại mặt nước → surface' },
        38: { v: 'Khi mô tả chân chèo trước.', t: "The front flippers are more than half the length of the turtle's body and generate power from huge muscles", p: '“Generate” = produce; chân chèo tạo ra sức mạnh từ cơ bắp lớn → power' },
        39: { v: 'Khi nói về thiết bị ghi mới.', t: 'They use the recorder, an instrument capable of recording location and depths in sea.', p: 'Máy ghi được cả vị trí và độ sâu → depth' },
        40: { v: 'Cuối bài, lý do rùa lặn liên tục.', t: 'Scientists soon realized that the turtles were probably costing much of their energy to follow their food source.', p: 'Rùa tiêu tốn nhiều năng lượng để đuổi theo nguồn thức ăn → energy' },
      },
    },
  ],
};
