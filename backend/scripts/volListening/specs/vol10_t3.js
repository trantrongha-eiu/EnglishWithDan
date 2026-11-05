// Vol 10 – Test 3 (source: izone.edu.vn "Giải chi tiết VOL 10 Test 3 Listening": question paper PDF on a public Google Drive link
// + key; transcript = the article's ([m:ss] stamps, no speakers)). Audio: terratern.com "IELTS Listening Practice Test 80" = the
// same test, one mp3 per section (LISTENING/test 3/part N.mp3) incl. narration → clip from "Section N" to ~2 s after "check
// your answers". Transcript per part = specs/vol10_tx/t3pN.txt (izone text, narration removed, speakers by content, checked
// word by word against Whisper; P2 opening "Welcome to Coffee Incorporated," restored from the audio).
// Key = izone, checked against the transcript: all correct.
const fs = require('fs'), path = require('path');
const { note, mc, multi, matching, short } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');

module.exports = {
  vol: 10, test: 3,
  sections: [
    {
      part: 1, title: 'Silverton Hall Event Booking', audio: 'LISTENING/test 3/part 1.mp3', clip: [23.6, 423.5],
      cover: 'concert hall stage | village hall interior', transcript: TX('t3p1'),
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'SILVERTON HALL – Event booking form', [
          'Date of event: 15th January',
          'Day of week: __Q1__',
          'Room needed for: 7.30 pm until __Q2__',
          '<strong>Event details</strong>',
          'Type of event: __Q3__',
          'Number of guests: 60 including some __Q4__ guests',
          'Catering requirements: __Q5__ and drinks',
          'Equipment required: __Q6__',
          'Transport arrangements: travel by __Q7__',
          'Total cost: £ __Q8__',
          '<strong>Contact details</strong>',
          'Name: Rob __Q9__',
          'Phone: __Q10__',
        ], {
          1: 'Saturday', 2: '11.30 / 11.30 pm / 11:30 / 11:30 pm / half past eleven', 3: 'concert / music concert', 4: 'disabled',
          5: 'sandwiches', 6: 'piano / a piano', 7: 'coach', 8: '225', 9: 'Jezowski', 10: '07232855496',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Rob nói ngày muốn tổ chức.', t: ['That’s a Friday, isn’t it?', 'No, it’s a Saturday.', 'Yes, you’re right.'], p: 'Jenny tưởng là thứ Sáu (bẫy) vì nhìn nhầm lịch năm ngoái; Rob sửa là thứ Bảy và Jenny xác nhận → Saturday' },
        2: { v: 'Khi hai bên chốt giờ thuê phòng.', t: ['Well, the event is from 8pm until 11pm.', 'So, shall we say 7.30 to 11.30?', 'Yes, that’ll be fine.'], p: 'Sự kiện 8–11 giờ tối nhưng cần thêm giờ chuẩn bị và dọn dẹp, nên thuê từ 7.30 đến 11.30 → 11.30' },
        3: { v: 'Khi Jenny hỏi loại sự kiện.', t: ['So, what kind of event is it?', 'Well, I’m organizing a concert.'], p: 'Rob và bạn bè chơi nhạc cụ, tổ chức một buổi hòa nhạc → concert' },
        4: { v: 'Khi Rob nói về khách mời.', t: 'Can I just mention that some of them are disabled?', p: 'Khoảng 60 khách, trong đó có một số người khuyết tật, Rob hỏi về lối đi → disabled' },
        5: { v: 'Khi Jenny hỏi về đồ ăn.', t: 'I don’t want anything complicated like a buffet or a three course meal, so just sandwiches really, and also something to drink, if that’s okay.', p: 'Không muốn tiệc buffet hay ba món (bẫy), chỉ bánh mì kẹp và đồ uống → sandwiches' },
        6: { v: 'Khi Jenny hỏi về thiết bị.', t: ['We have everything except for a piano, which would be very useful.', 'Would it be possible for you to provide one?'], p: 'Nhóm đã có nhạc cụ, micro, loa; chỉ cần hội trường cung cấp đàn piano → piano' },
        7: { v: 'Khi Jenny nói về chuyện đậu xe.', t: ['We do have a coach that will pick everyone up and take them home at the end of the evening.', 'Hmm, yes please.'], p: 'Định lái xe đến (bẫy) nhưng bãi đậu khó khăn; Rob đồng ý dùng xe khách đưa đón → coach' },
        8: { v: 'Khi Jenny cộng chi phí.', t: 'That comes to £250, but I’ll reduce it to £225 as we have a 10% discount from now until March.', p: 'Tổng 250 bảng nhưng được giảm 10% còn 225 bảng → 225' },
        9: { v: 'Khi Rob đánh vần họ.', t: ['It’s Jezowski.', 'It’s J-E-Z-O-W-S-K-I.'], p: 'Rob đánh vần J-E-Z-O-W-S-K-I → Jezowski' },
        10: { v: 'Khi Jenny hỏi số liên lạc.', t: 'It’s 07232855496.', p: 'Rob đọc số điện thoại sau khi tìm lại → 07232855496' },
      },
    },
    {
      part: 2, title: 'Coffee Processing Factory Orientation', audio: 'LISTENING/test 3/part 2.mp3', clip: [0, 368],
      cover: 'coffee beans roasting | coffee beans drying', transcript: TX('t3p2'),
      groups: [
        matching('What comment does the manager make about each of the following steps in coffee processing?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 11-16.', [
          'needs additional staff', 'separates beans for different purposes', 'is an unnecessary step', 'is more expensive',
          'increases flavour', 'is less polluting', 'uses less space', 'requires special skills',
        ], [
          [11, 'wet processing by machine', 'F'], [12, 'machine drying', 'G'], [13, 'natural drying', 'A'],
          [14, 'polishing', 'C'], [15, 'sorting by size', 'B'], [16, 'sorting by colour', 'H'],
        ], { title: 'Description', groupTitle: 'Questions 11-16' }),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO areas of the building are not part of the tour?',
          ['the tasting room', 'the shop', 'the staff canteen', 'the visitor centre', 'the reception area'], ['C', 'D'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO things will each member of staff be provided with?',
          ['protective shoes', 'a name badge', 'a cap', 'gloves', 'pen and notebook'], ['B', 'C'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Khi quản lý nói về chế biến ướt.', t: 'This reduces levels of pollution from dirty waste that some other methods produce, though admittedly some people do say the wet process reduces flavor too.', p: 'Chế biến ướt giảm ô nhiễm từ chất thải bẩn; “reduces flavor” là ý trái ngược với E (bẫy) → F' },
        12: { v: 'Khi nói về sấy bằng máy.', t: ['We do this by machine.', 'This is the way it’s done where there are limits in terms of workspace, as is the case here.'], p: 'Sấy bằng máy được dùng khi không gian làm việc hạn chế = tốn ít chỗ → G' },
        13: { v: 'Khi nói về phơi tự nhiên.', t: 'The air is better able to circulate around the beans in the natural method of drying, but it does increase the number of workers required.', p: 'Phơi tự nhiên cần nhiều công nhân hơn = needs additional staff → A' },
        14: { v: 'Khi nói về đánh bóng hạt.', t: 'And while polishing isn’t actually required, we do it here to avoid the possibility of any remaining skin causing problems during roasting.', p: '“isn’t actually required” = không thật sự cần thiết; việc làm hỏng vị chỉ là ý kiến của một số chuyên gia → C' },
        15: { v: 'Khi nói về phân loại theo kích thước.', t: 'The beans are blown through the air and the ones that land in bins near the air source are the heaviest and best and will be made into the top quality brands, whereas the ones that fall further away are likely to produce a poorer flavor, though they will still be used for blending and making instant coffee and so on.', p: 'Hạt nặng dùng cho thương hiệu cao cấp, hạt nhẹ dùng để pha trộn, cà phê hòa tan = tách hạt cho các mục đích khác nhau → B' },
        16: { v: 'Khi nói về phân loại theo màu.', t: 'This is the most difficult and time-consuming task as it’s done by hand and needs workers with expertise and experience.', p: 'Làm bằng tay, cần công nhân có chuyên môn và kinh nghiệm = requires special skills → H' },
        17: { v: 'Khi quản lý giới thiệu lộ trình tham quan.', t: ['It’s being repainted at the moment, so we’ll have some sandwiches here in the training room instead.', 'Do pop in one afternoon when it’s open.'], p: 'Căng tin nhân viên đang sơn lại nên không ghé; trung tâm khách tham quan thì nhân viên tự ghé vào một buổi chiều khác. Phòng thử, cửa hàng, quầy lễ tân đều có trong buổi tham quan → C' },
        18: { v: 'Khi quản lý giới thiệu lộ trình tham quan.', t: ['That’s located next to the visitor center where we hold tours for the public.', 'Do pop in one afternoon when it’s open.'], p: 'Trung tâm khách tham quan chỉ được giới thiệu để nhân viên tự ghé sau, không thuộc buổi tham quan hôm nay (cùng căng tin nhân viên) → D' },
        19: { v: 'Khi quản lý nói về đồ được phát.', t: 'In a moment, I’m going to hand you out a badge with your name on.', p: 'Mỗi người được phát một thẻ tên; giày bảo hộ là đồ nhân viên tự mang theo yêu cầu, găng tay hôm nay không dùng, bút giấy tự mang → B' },
        20: { v: 'Khi quản lý nói về mũ.', t: ['There are some caps in the basket near the door over there.', 'Please collect one, even if you have very short hair.'], p: 'Mỗi người lấy một chiếc mũ ở giỏ gần cửa (cùng thẻ tên) → C' },
      },
    },
    {
      part: 3, title: 'Tim’s Dissertation on Dying Languages', audio: 'LISTENING/test 3/part 3.mp3', clip: [0, 486.5],
      cover: 'elderly woman storytelling | audio recorder interview', transcript: TX('t3p3'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What gives Tim the idea for his dissertation proposal?', ['his grandmother asked him to record her language', 'he heard about a linguistic project he wanted to join', 'he learned about conserving languages on his course'], 'C'],
          [22, 'When talking about the impact of technology, Tim', ['points out a problem caused by its spread', 'explains how it can be used to conserve language', 'emphasises its importance for communication'], 'A'],
          [23, 'Tim and his tutor decide that in the introduction to his dissertation he should discuss', ['the impact of media on language', 'how globalisation has helped remote communities', 'the reasons why he talks to his grandmother in English'], 'A'],
          [24, 'What does Tim say about documenting dying languages?', ['He believes writing a language down stops it from falling out of use.', 'He sees little point in trying to revive languages that are already dead.', 'He is unconvinced that his grandmother’s language can be saved.'], 'C'],
          [25, 'Tim’s tutor explains to him that recording minority languages is', ['something that schoolchildren can be involved in', 'a way to allow future generations to experience them', 'a useful tool for training language teachers'], 'B'],
          [26, 'When talking about language and culture, Tim', ['highlights why family traditions are important to him', 'describes how the two subjects are linked together', 'expresses a desire to learn about his family’s customs'], 'A'],
        ], 'Questions 21-26'),
        multi('Choose TWO letters, A-E.', 27, 'Which TWO areas of language does the tutor recommend Tim to focus on?',
          ['written language', 'context of speech', 'translations of written samples', 'vocabulary items', 'grammar points'], ['B', 'D'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO approaches to recording do Tim and his tutor decide he should take?',
          ['covering as much as possible', 'doing several recording sessions', 'keeping a record of times and places', 'writing things down immediately', 'waiting a few days before listening back to it'], ['B', 'C'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi Tim giải thích ý tưởng.', t: 'I know there are linguists already working on recording dying languages, and when we focused on that in class, I realised I wanted to do something for my grandmother’s heritage.', p: 'Ý tưởng đến khi học về chủ đề này trên lớp; bà chỉ “keen” khi Tim hỏi (bẫy A), không có dự án nào Tim muốn tham gia → C' },
        22: { v: 'Khi nói về tác động của công nghệ.', t: ['You mean the fact that technology allows people to communicate at the click of a mouse across the world, so it contributes to languages becoming endangered?', 'I know this has resulted in lots of languages disappearing'], p: 'Tim chỉ ra công nghệ lan rộng khiến nhiều ngôn ngữ biến mất = vấn đề do sự lan rộng của nó → A' },
        23: { v: 'Khi bàn phần mở đầu.', t: ['And the media’s had an enormous impact.', 'I’ll definitely put that in.'], p: 'Tutor nêu tác động lớn của truyền thông, Tim chốt sẽ đưa vào; toàn cầu hóa được nói là tác động tiêu cực (không phải “helped”), chuyện nói tiếng Anh với bà chỉ là ví dụ → A' },
        24: { v: 'Khi Tim nói về việc ghi lại ngôn ngữ.', t: ['Though, I doubt whether it’s possible to save my grandmother’s language.', 'I don’t think it’s going to become anyone’s first language again.'], p: 'Tim nghi ngờ có thể cứu ngôn ngữ của bà = unconvinced … can be saved → C' },
        25: { v: 'Khi tutor giải thích tác dụng của việc ghi âm.', t: ['It can be used to develop teaching materials within communities, so local children have learning tools they’ve never had access to before.', 'You know, they can listen to and see these languages written down.'], p: 'Dữ liệu dùng làm tài liệu dạy cho trẻ em trong cộng đồng, để thế hệ sau được nghe và thấy ngôn ngữ = future generations experience them; trẻ em không tham gia ghi âm (A) → B' },
        26: { v: 'Khi nói về ngôn ngữ và văn hóa.', t: ['It’s like some of the traditions in my family that have come from my grandmother’s community.', 'It’s important to me to keep those alive too.'], p: 'Tim nói vì sao truyền thống gia đình quan trọng với mình (muốn truyền lại cho cháu); mối liên hệ ngôn ngữ – văn hóa là tutor xác nhận → A' },
        27: { v: 'Khi tutor gợi ý nên tập trung vào gì.', t: ['But if I ask her to talk about her life, it might come up naturally in context.', 'Exactly.'], p: 'Tutor đồng ý: để từ ngữ xuất hiện tự nhiên trong ngữ cảnh lời nói = context of speech → B' },
        28: { v: 'Khi tutor gợi ý nên tập trung vào gì.', t: ['Well, not necessarily.', 'A better approach would be to focus on certain words, especially those for things which people don’t use anymore, like in the home or on a farm.'], p: 'Không cần ngữ pháp (E), không cần bản dịch (C); tập trung vào một số từ = vocabulary items → D' },
        29: { v: 'Khi bàn chuyện ghi âm.', t: ['I thought I’d do a few shorter meetings rather than one long one.', 'Good, yes.'], p: 'Vài buổi ngắn thay vì một buổi dài, tutor đồng ý = several recording sessions → B' },
        30: { v: 'Khi bàn chuyện ghi âm.', t: ['Do you think it might help to say when and where we did the interviews?', 'Without doubt.'], p: 'Ghi lại thời gian và địa điểm phỏng vấn → C. Không cần ghi chép ngay (D), nghe lại trong ngày (không phải chờ vài ngày – E), làm quy mô nhỏ (không phải A)' },
      },
    },
    {
      part: 4, title: 'The History of Time Measurement', audio: 'LISTENING/test 3/part 4.mp3',
      cover: 'sundial | Stonehenge sunrise', transcript: TX('t3p4'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [31, 'Humans first started tracking time', ['30,000 years ago', '25,000 years ago', '5,000 years ago'], 'C'],
          [32, 'Horizon tracking involved recording', ['where the sun rose and set', 'the times of sunrise and sunset', 'the length of the shortest day'], 'A'],
          [33, 'Time measurement improved when', ['trees were planted on hill tops', 'special constructions were erected', 'people began living in larger groups'], 'B'],
        ], 'Questions 31-33'),
        note('Complete the sentences below.\nWrite ONE WORD ONLY for each answer.', '', [
          'The first clocks worked by making a small hole in a __Q34__ and allowing water to drip out.',
          'Sundials measured time by noting where the sun’s shadow fell on the __Q35__ marked on the dial.',
          'Workers in China and Japan changed activities when the __Q36__ of the incense changed.',
        ], { 34: 'bucket', 35: 'lines', 36: 'smell' }, 'Questions 34-36'),
        short('Answer the questions below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', [
          [37, 'What object made the wheels of a mechanical clock go round?', 'weight / a weight'],
          [38, 'What invention created a problem with communities having different times?', 'railways / the railways'],
          [39, 'In which year was a time system for England nationally agreed?', '1847'],
          [40, 'Which building in Greenwich was chosen as the point from which to measure time?', 'observatory / the observatory'],
        ], 'Questions 37-40'),
      ],
      expl: {
        31: { v: 'Đầu bài giảng.', t: ['But 25,000 years passed before humans began to actually track time.', 'There is credible evidence for this from around 5,000 years ago.'], p: '30.000 năm trước con người chỉ nhận ra mặt trăng thay đổi; 25.000 năm sau (tức khoảng 5.000 năm trước) mới thật sự theo dõi thời gian → C' },
        32: { v: 'Khi giải thích horizon tracking.', t: 'For example, they noted the position on the horizon of the sun at sunrise and sunset, and how these positions changed throughout the year.', p: 'Ghi lại vị trí mặt trời mọc và lặn trên đường chân trời = where the sun rose and set (không phải thời điểm – B) → A' },
        33: { v: 'Khi nói đo thời gian chính xác hơn.', t: 'But measurement became more accurate and detailed when certain communities built markers specifically to view how the positions of the sun and moon related to them.', p: 'Các cộng đồng xây mốc riêng (như Stonehenge) = special constructions were erected; đồi, cây chỉ là mốc tự nhiên lúc đầu → B' },
        34: { v: 'Khi nói về đồng hồ nước.', t: 'These were water clocks and time was measured by filling a bucket with water which had a small hole in the bottom of it.', p: 'Đổ nước vào một cái xô có lỗ nhỏ ở đáy → bucket' },
        35: { v: 'Khi nói về đồng hồ mặt trời.', t: 'Sundials were used to cast a shadow from the sun onto a horizontal surface marked with lines indicating the hours of the day.', p: 'Bóng mặt trời đổ lên bề mặt có kẻ các vạch chỉ giờ → lines' },
        36: { v: 'Khi nói về nhang ở Trung Quốc, Nhật Bản.', t: 'Sometimes, a stick with a different smell was burnt at a certain point in the day, and workers would know when to move on to the next task because of the change in incense.', p: 'Đốt một nén nhang có mùi khác để công nhân biết chuyển việc → smell' },
        37: { v: 'Khi nói về đồng hồ cơ.', t: 'They were made of iron, rather large and heavy, and the wheels of the clock were driven by a weight which slowly descended.', p: 'Bánh xe đồng hồ được kéo bởi một quả nặng hạ dần xuống → weight' },
        38: { v: 'Khi nói về giờ khác nhau giữa các nơi.', t: 'This first became a real problem with the introduction of the railways in the 1840s.', p: 'Giờ mỗi nơi khác nhau thành vấn đề thật sự khi có đường sắt (cần lập lịch tàu) → railways' },
        39: { v: 'Khi nói về giờ quốc gia.', t: 'This meant that there was a need for a nationally agreed time system, and in 1847, the time at Greenwich in London was taken to be the point on which the national time was based.', p: 'Năm 1847 giờ Greenwich được lấy làm giờ chuẩn quốc gia → 1847' },
        40: { v: 'Cuối bài giảng.', t: 'So then it made sense to use Greenwich to also measure time for the whole world, starting at the observatory at midnight.', p: 'Giờ thế giới tính từ đài thiên văn Greenwich lúc nửa đêm → observatory' },
      },
    },
  ],
};
