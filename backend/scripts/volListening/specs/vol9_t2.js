// Vol 9 – Test 2 (same layout as vol9_t1.js). P4 = bank "Health on the Night Shift" (Actual Test 5 / Vol 2 - Test 7 P4):
// key 8/10 + same notes (Vol 9 key "the number of" / "mental abilities" ≈ bank "a huge increase" / "mental ability"),
// transcript 6-gram 72 % → reused.
// docx splits Part 2/3 one sentence off: P2's last sentence ("Whereas today we use plaster…") sits under "Section 3" and P3's
// last lines ("Sounds like a plan. OK, and we...") under "Section 2" → rawFix moves both back (order checked by Whisper).
// P3 turns by content + per-word pitch: Nick suggests photos, Emma objects ("Hang on. There's no point…", female voice), Nick
// agrees and goes on to the interview.
// docx "Gerry Kaplan" → Jerry (question paper).
const { note, table, mc, matching } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 2.mp4';
const WHEREAS = 'Whereas today we use plaster and paint or wallpaper, the Iron Age people had a mixture of clay, cow dung and straw, which they daubed all over the inside and outside to give the house a smooth finish.';

module.exports = {
  vol: 9, test: 2, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 2-L.docx',
  rawFix: [
    ['modern day plastering.\nSounds like a plan. OK, and we... That is the end of Part 2.', `modern day plastering. ${WHEREAS} That is the end of Part 2.`],
    [`(14:41 - 15:47)${WHEREAS} You will hear two business students called Emma and Nick preparing for their presentation on the topic of how jobs might change in the future. `, '(14:41 - 15:47)'],
    ["Yes, that's a good idea. Go ahead.\nSection 4", "Yes, that's a good idea. Go ahead. Sounds like a plan. OK, and we...\nSection 4"],
  ],
  rawRe: [...RE, ['Gerry Kaplan', 'Jerry Kaplan']],
  sections: [
    {
      part: 1, title: 'Almond Valley Poppy Reserve', audio: A, clip: [37.8, 429.8], cover: 'california poppy field hills | orange poppies wildflowers',
      turns: [
        ['Ranger', 'Almond Valley Poppy Reserve'], ['Woman', 'Is the Nature Reserve open now?'], ['Ranger', 'Yes, we are actually open'], ['Woman', 'Are the poppies blooming yet?'],
        ['Ranger', 'Absolutely.'], ['Woman', 'Oh, I was planning'], ['Ranger', 'No, not at all.'], ['Woman', 'I thought poppies were red.'], ['Ranger', 'Not in California.'],
        ['Woman', 'The poppy reserve is in Ocean County'], ['Ranger', 'Right.'], ['Woman', 'What time does the reserve open?'], ['Ranger', 'The reserve is open from sunrise'],
        ['Woman', 'I heard that there are a lot of rattlesnakes'], ['Ranger', 'Most wildlife is quite safe.'], ['Woman', 'All right.'], ['Ranger', "It's $5."],
        ['Woman', 'Can I use my National Park Pass'], ['Ranger', 'Unfortunately not'], ['Woman', 'All right.'], ['Ranger', 'Certainly, but can you excuse'], ['Woman', 'Okay.'],
        ['Ranger', 'Hello?'], ['Woman', "Yes, I'm still here."], ['Ranger', 'Now, you are interested'], ['Woman', "Oh, there's more than one?"], ['Ranger', 'Yes.'],
        ['Woman', 'Is that the tour that takes you'], ['Ranger', 'Yes, that is one of the highlights'], ['Woman', 'Well, if I come all that way'], ['Ranger', 'Then you are in luck'],
        ['Woman', 'Besides the poppies'], ['Ranger', 'Yes, and you will see lots of sage'], ['Woman', 'You mentioned another tour.'], ['Ranger', 'Yes, the last one'],
        ['Woman', 'Is that because most'], ['Ranger', 'Yes, so we offer'], ['Woman', 'Wow, that early?'], ['Ranger', 'Right.'], ['Woman', 'Well, that makes sense.'],
        ['Ranger', 'More like a lot of standing'], ['Woman', 'Well, thank you very much.'], ['Ranger', "You're welcome."], ['Woman', 'Goodbye.'], ['Ranger', 'Goodbye.'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Poppy Reserve', [
          'Almond Valley Poppy Reserve is a nature reserve',
          '• The poppies will be at their best at the end of the __Q1__.',
          '• The poppies on the hills are __Q2__ in colour.',
          '• The reserve is located to the __Q3__ of Lakeside.',
          '• The best time for photography is mid-afternoon.',
          '• Wear __Q4__ because of rattlesnakes.',
          '• The reserve is a __Q5__ park.',
        ], { 1: 'month', 2: 'orange', 3: 'east', 4: 'trousers', 5: 'state' }, 'Questions 1-5'),
        table('Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', ['Tour', 'Start time', 'Duration', 'Highlights', 'Photography'], [
          ['The __Q6__ tour', 'Every hour from 7:30 a.m.', '30 minutes', 'Viewpoints, film and the __Q7__', 'Panoramic pictures'],
          ['The wildflower tour', 'Every two hours from 8:00 a.m.', '__Q8__', 'Poppy, cream cup, and sage', 'Close-up tips'],
          ['The wildlife tour', '__Q9__ a.m. or 7:00 p.m.', '1.5 hours', 'Coyote, quail, roadrunners', 'Bring tripod and a __Q10__ lens'],
        ], { 6: 'general', 7: 'museum', 8: 'one hour/1 hour/an hour', 9: '5.30/5:30', 10: 'zoom' }, 'Questions 6-10'),
      ],
      expl: {
        1: { v: 'Khi người gọi hỏi hoa anh túc đã nở chưa.', t: 'They started to bloom last week and are already beautiful, but they should peak and be in full bloom at the end of the month.', p: 'Hoa nở từ tuần trước (bẫy week) nhưng đẹp nhất vào cuối tháng → month' },
        2: { v: 'Khi kiểm lâm nói về màu hoa trên đồi.', t: ['The hills are already covered with orange poppies.', 'I thought poppies were red.', 'Not in California.'], p: 'Người gọi tưởng hoa màu đỏ (bẫy red); ở California hoa màu cam → orange' },
        3: { v: 'Khi người gọi hỏi vị trí khu bảo tồn.', t: "From Lakeside, you'll need to drive about an hour east.", p: 'Từ Lakeside lái xe khoảng một giờ về phía đông → east' },
        4: { v: 'Khi người gọi hỏi về rắn đuôi chuông.', t: 'There are very few people bitten by rattlesnakes, so we do recommend wearing trousers just to be on the safe side.', p: 'Khuyên mặc quần dài cho an toàn → trousers' },
        5: { v: 'Khi người gọi hỏi dùng thẻ công viên quốc gia.', t: 'Unfortunately not, since it is a state park, not a national park.', p: 'Đây là công viên cấp bang, không phải quốc gia (bẫy national) → state' },
        6: { v: 'Khi kiểm lâm giới thiệu các tour.', t: ['We have the general tour, which is the one your friend may have taken', 'Starting at 7.30 a.m. is our general tour.'], p: 'Tour bắt đầu 7.30 sáng, mỗi giờ một chuyến là tour chung → general' },
        7: { v: 'Khi người gọi hỏi tour có đến các điểm ngắm cảnh không.', t: 'Yes, that is one of the highlights, along with a film introducing the park and the museum.', p: 'Điểm nổi bật: điểm ngắm cảnh, phim giới thiệu và bảo tàng → museum' },
        8: { v: 'Khi kiểm lâm nói về tour hoa dại.', t: ['we have a wonderful wildflower tour every two hours from 8 a.m.', 'It lasts one hour'], p: 'Tour hoa dại kéo dài một giờ → one hour' },
        9: { v: 'Khi nói về tour động vật hoang dã.', t: 'Yes, so we offer this tour only two times, 5.30 a.m. or 7 p.m.', p: 'Chỉ có hai giờ: 5.30 sáng hoặc 7 giờ tối → 5.30' },
        10: { v: 'Khi người gọi hỏi tour có phải đi bộ nhiều không.', t: 'so we recommend bringing a tripod and zoom lens if you want to take pictures.', p: 'Nên mang chân máy và ống kính zoom → zoom' },
      },
    },
    {
      part: 2, title: 'Re-creating Life in an Iron Age Village', audio: A, clip: [429.8, 927.9], cover: 'iron age roundhouse thatched | reconstructed celtic roundhouse',
      turns: [
        ['Presenter', 'Jim Stevens has been'], ['Jim', 'A typical day'], ['Presenter', 'And I understand that you even'], ['Jim', "It's a bit like putting up"],
        ['Presenter', 'It must have been quite hard work.'], ['Jim', 'Next, you have to start'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'Jim says that in the Iron Age village', ['he is sometimes cold at night.', 'he always gets up early.', 'he has time to himself.'], 'B'],
          [12, 'What does Jim say about the food they eat in the village?', ['It takes time to prepare.', 'It is difficult to get used to.', 'It has to be eaten quickly.'], 'A'],
          [13, 'Jim says that at the evening meal', ['they are sometimes too tired to eat.', 'they mainly have fruit and berries.', "they talk about what they've done."], 'C'],
          [14, 'The most important job for the blacksmiths is', ['to mend broken tools and implements.', 'to maintain a good source of heat.', 'to collect sufficient firewood.'], 'B'],
          [15, 'Jim likes the fact that in the village, people', ['do varied activities.', 'share their knowledge.', 'get a lot of exercise.'], 'A'],
        ], 'Questions 11-15'),
        matching('Complete the flow-chart below.\nChoose FIVE answers from the box and write the correct letter, A-I, next to Questions 16-20.\n\nMaking an Iron Age Roundhouse',
          ['bone', 'different', 'equal', 'elm', 'hazel', 'iron', 'peg', 'roof', 'scaffold'], [
            [16, 'Mark centre of planned house with a ______ ↓ Mark out circle for outer boundary', 'G'],
            [17, 'Dig ground using tools made from ______ ↓ Insert wall posts (Iron Age builders preferred wood from oak trees) ↓ Slot more stakes into upright posts', 'A'],
            [18, 'Insert centre post and build a wooden ______ around it ↓ Add main supporting beams and ring beams', 'I'],
            [19, 'Complete roof framework using ______ wood rods', 'E'],
            [20, 'Cover roof with reed bundles of ______ lengths ↓ Daub with mixture of clay, dung and straw', 'C'],
          ], { groupTitle: 'Questions 16-20' }),
      ],
      expl: {
        11: { v: 'Khi Jim kể một ngày điển hình.', t: ['A typical day in the Iron Age village begins with rising at first light.', 'I occasionally did that when I was at home', "But here I do it every day because it's so light.", 'Others also get up early because they find the straw beds rather cold.'], p: 'Ở nhà chỉ thỉnh thoảng dậy sớm để có thời gian riêng (bẫy C); ở làng ngày nào anh cũng dậy lúc tảng sáng; người khác mới thấy lạnh (bẫy A) → B' },
        12: { v: 'Khi Jim nói về bữa ăn.', t: 'As it takes such a long time to cook anything, we end up eating only twice a day.', p: 'Nấu gì cũng mất rất lâu = mất thời gian chuẩn bị; món cháo "nghe ghê nhưng không tệ" (bẫy B) → A' },
        13: { v: 'Khi Jim nói về bữa tối.', t: 'Although the evening meal provides a chance for us to chat about the day', p: 'Bữa tối là dịp trò chuyện về những gì đã làm trong ngày → C' },
        14: { v: 'Khi nói về thợ rèn.', t: 'The biggest priority for the blacksmiths working the forge is to tend the fire and to get it nice and hot so they can carry out their tasks.', p: 'Ưu tiên lớn nhất là giữ lửa lò rèn thật nóng = duy trì nguồn nhiệt; làm dụng cụ chỉ là việc phụ (bẫy A) → B' },
        15: { v: 'Khi Jim nói điều anh thích ở làng.', t: "Here you're finding out how to do different things every day, which keeps you on your toes and keeps you interested.", p: 'Mỗi ngày học làm những việc khác nhau khiến anh hứng thú = hoạt động đa dạng → A' },
        16: { v: 'Khi bắt đầu dựng nhà tròn.', t: 'You mark the centre of your house with a wooden peg.', p: 'Đánh dấu tâm nhà bằng một cái cọc gỗ → G (peg)' },
        17: { v: 'Khi nói về việc đào đất.', t: "people didn't have shovels or diggers like we do today, but used tools which they fashioned from animal bone.", p: 'Dụng cụ đào làm từ xương động vật → A (bone)' },
        18: { v: 'Khi nói về cột giữa nhà.', t: 'so the next thing you have to do is build around the post a timber scaffold tower', p: 'Dựng giàn giáo gỗ quanh cột giữa → I (scaffold)' },
        19: { v: 'Khi hoàn thiện khung mái.', t: 'Rather like weaving a basket using rods from the willow tree, hazel wood rods are linked to the beams in parallel hoops.', p: 'So sánh với đan giỏ bằng cành liễu; khung mái dùng que gỗ phỉ → E (hazel)' },
        20: { v: 'Khi nói về lợp mái.', t: 'First you take reed bundles and cut them so that each is of equal length.', p: 'Cắt các bó sậy dài bằng nhau → C (equal)' },
      },
    },
    {
      part: 3, title: 'Presentation on How Jobs Might Change in the Future', audio: A, clip: [927.9, 1329.5], cover: 'call centre headsets office | robot arm office automation',
      turns: [
        ['Emma', 'OK Nick'], ['Nick', 'I was just watching'], ['Emma', 'Go on.'], ['Nick', 'He talked about'], ['Emma', "That's not a common approach"],
        ['Nick', 'But apparently it worked.'], ['Emma', 'Really?'], ['Nick', 'Maybe.'], ['Emma', 'What about Jerry Kaplan'], ['Nick', 'Right.'],
        ['Emma', "Now, there's that article"], ['Nick', 'It describes the growing'], ['Emma', 'Well, that could be good'], ['Nick', 'They can choose'],
        ['Emma', "It's certainly controversial."], ['Nick', 'Another article'], ['Emma', 'So awful.'], ['Nick', 'When we talk about this'],
        ['Emma', 'Did you read how'], ['Nick', "Surely workers won't"], ['Emma', "Yes, I'd be very surprised"], ['Nick', 'OK.'],
        ['Emma', 'Yes, there are a few issues.'], ['Nick', 'Your editing has helped.'], ['Emma', "OK, so let's do it"], ['Nick', 'Good.'],
        ['Emma', 'What about the researcher profiles?'], ['Nick', 'Kathy Bryson'], ['Emma', 'So, cut it?'], ['Nick', "Let's rehearse"],
        ['Emma', "Aren't you happy with it?"], ['Nick', "I'm thinking I haven't"], ['Emma', "Well, let's have a bit more"], ['Nick', "We're only using"],
        ['Emma', 'So perhaps we could both'], ['Nick', 'And choose the most'], ['Emma', 'And the section on tracking'], ['Nick', 'It would definitely'],
        ['Emma', 'Hang on.'], ['Nick', 'Fair enough.'], ['Emma', 'Yes, we were lucky'], ['Nick', 'But I just want to be sure'],
        ['Emma', "Yes, that's a good idea."], ['Nick', 'Sounds like a plan.'], ['Emma', 'OK, and we...'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What do the students find surprising about the way that complaints were dealt with at the call centre?', ['the way that customers responded to it', "the employees' lack of enthusiasm for it", 'the kind of questions employees were obliged to ask'], 'A'],
          [22, 'What does Emma say about the report by Jerry Kaplan?', ['It shows how machines will respond to human needs.', 'It emphasises the variety of roles that machines will have.', 'It explains the limitations of machines.'], 'C'],
          [23, "What is Nick's reaction to the article The Human Cloud?", ['He agrees that companies should focus on making savings.', 'He supports the concept of greater flexibility for employees.', 'He approves of businesses spending more on recruiting experts.'], 'B'],
          [24, 'What do the students agree about the use of technology to collect information about employees?', ['Cameras are an effective means of maintaining security.', 'Sometimes productivity is more important than individual privacy.', 'Employees may object to certain types of monitoring.'], 'C'],
        ], 'Questions 21-24'),
        matching('What issue do Emma and Nick discuss for each aspect of the presentation?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.',
          ['at which point of the presentation it should come', 'whether it should be removed completely', 'whether it is clear enough', 'if it needs to be completely re-written', 'if visuals will help or not', 'if the information needs to be checked', 'which further examples should be included', 'which of them will present it'], [
            [25, 'Introduction', 'H'], [26, 'Researcher profiles', 'B'], [27, 'Section on automation', 'D'], [28, 'Section on workplace structure', 'G'],
            [29, 'Section on tracking technology', 'E'], [30, 'Interview with company manager', 'F'],
          ], { title: 'Issues', groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Nick kể về trung tâm chăm sóc khách hàng.', t: ['Customers were happier with the new methods.', 'Really?', "That's certainly not the result you'd expect."], p: 'Điều bất ngờ là khách hàng hài lòng hơn với cách làm mới; nhân viên thì thích (loại B) → A' },
        22: { v: 'Khi Emma nói về báo cáo của Jerry Kaplan.', t: ["He argues there'll be plenty of jobs not suitable for machines.", 'Like, a machine might be able to diagnose your disease, but patients will always want to talk face to face with their doctor.'], p: 'Có nhiều việc máy móc không làm được (máy không thể đồng cảm) = giới hạn của máy → C' },
        23: { v: 'Khi bàn về bài báo The Human Cloud.', t: ['But for the workers, it may mean less money.', 'On the other hand, I love the idea of working from home in a time that suits.'], p: 'Nick thích ý tưởng làm việc ở nhà vào giờ phù hợp = linh hoạt cho người lao động → B' },
        24: { v: 'Khi bàn về việc theo dõi nhân viên.', t: ['Did you read how some companies are tracking the health of their employees?', "Surely workers won't accept that.", "Yes, I'd be very surprised if this became common.", 'Too many employees would refuse.'], p: 'Cả hai đồng ý nhân viên sẽ không chấp nhận/từ chối việc bị theo dõi sức khoẻ → C' },
        25: { v: 'Khi bàn về phần mở đầu.', t: ["But don't you think you ought to deliver it rather than me?", "It's mainly your work.", "OK, so let's do it that way then."], p: 'Nội dung đã xong; bàn xem ai sẽ trình bày phần này → H' },
        26: { v: 'Khi bàn về hồ sơ các nhà nghiên cứu.', t: ["I reckon we should just attach that bit to the written report we've given to the tutor.", 'So, cut it?', "Let's rehearse the whole presentation and see if it's necessary."], p: 'Cân nhắc có nên bỏ hẳn phần này khỏi bài thuyết trình hay không → B' },
        27: { v: 'Khi bàn về phần tự động hoá.', t: ["I'm thinking I haven't really given equal attention to the pros and cons.", 'I should start again.'], p: 'Nick muốn viết lại từ đầu phần này → D' },
        28: { v: 'Khi bàn về phần cơ cấu nơi làm việc.', t: ["We're only using one particular company as a case study.", 'We need to source some other situations as supporting material.', 'And choose the most interesting cases.'], p: 'Chỉ có một công ty làm ví dụ; cần tìm thêm và chọn ví dụ hay nhất → G' },
        29: { v: 'Khi bàn về phần công nghệ theo dõi.', t: ['It would definitely benefit from some photos.', "There's no point using images just for decoration.", "We need to think about whether they'd serve any real purpose."], p: 'Bàn xem hình ảnh có thực sự giúp ích hay không → E' },
        30: { v: 'Khi bàn về bài phỏng vấn quản lý công ty.', t: ['But I just want to be sure we wrote everything down accurately.', 'Maybe I should type up that section and send it to her.', "So she can confirm whether or not it's correct."], p: 'Gửi cho bà quản lý xác nhận thông tin có chính xác không = cần kiểm tra lại → F' },
      },
    },
    { part: 4, title: 'Health on the Night Shift', reuse: '6a53db265c459ab074cec6cb' },
  ],
};
