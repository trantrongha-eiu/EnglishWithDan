// Vol 1 – Test 10 (PDF p1–6, key p22; audio test 10/Part 1–4.mp3; transcript Tapescript Test 10.docx)
// Source errors fixed: title "SUVs (sort Unitily Vehicles)" (→ Sports Utility Vehicles); box/heading typos.
// Parts 1, 3 and 4 are already in the bank (re-recorded wording, same questions/key) → reused, not seeded.
// Part 4 = bank "Research into Learner Persistence" (Actual Test 13 P4): same lecture content, same questions and
// key (re-recorded wording) → reused, not seeded.
const { note, table, mc, multi, map, matching, short } = require('../vol_build');

module.exports = {
  vol: 1, test: 10,
  rawFix: [
    ['look at questions. 1 to 5. Now listen carefully and answer questions. One, two, five.', 'look at questions 1 to 5. Now listen carefully and answer questions 1 to 5.'],
    ["Good morning. Ken's appliance. Can I help. \n\nSpeaker 1 [00:01:31] You? Yes.", "Good morning. Ken's Appliances. Can I help you? \n\nSpeaker 1 [00:01:31] Yes."],
  ],
  sections: [
    {
      part: 1, reuse: '6a4b5bcd5934e78bb4ff7a63', // = bank "Superior Home Appliances – Customer Complaint Form" (Actual Test 8 P1): same key 9/10
      title: 'Damaged Fridge Report', audio: 'test 10/Part 1.mp3', cover: 'refrigerator kitchen | fridge appliance',
      speakers: { 1: 'Customer', 2: 'Assistant' },
      fix: [['But rest assured, Madam will fix it all.', "But rest assured, madam, we'll fix it all."], ["Ken's appliance is located on Elm Street.", "Ken's Appliances is located on Elm Street."], ['Luckily, no one eat the food', 'Luckily, no one ate the food'], ["For your case will assume it's the door", "In your case, we'll assume it's the door"]],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Damaged Fridge Report', [
          '• Warranty: 3 years',
          '• Model: __Q1__ Mount',
          '• Colour: __Q2__',
          '• Date of purchase: __Q3__',
          '• Problems: the non-stop __Q4__',
          '&nbsp;&nbsp;&nbsp;&nbsp;__Q5__ degrees',
          '• The repair shop: Ken’s Appliances (near to the __Q6__)',
          '• The customer needs to store food for her __Q7__ shop.',
          '• Total value of loss: $ __Q8__',
          '<strong>Things to do:</strong>',
          '• Ask the __Q9__ to call back',
          '• Replace the damaged __Q10__',
        ], { 1: 'Top', 2: 'silver', 3: '12th January/12 January/January 12th/January 12/12th of January', 4: 'alarm', 5: '10/ten', 6: 'station', 7: 'sandwich', 8: '180', 9: 'manager', 10: 'door' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Đầu bài, khi hỏi mẫu tủ lạnh.', t: "It's a top mount.", p: 'Mẫu ghi trên thẻ bảo hành là Top Mount → Top' },
        2: { v: 'Khi hỏi màu tủ.', t: "It's a silver one.", p: 'Tủ màu bạc → silver' },
        3: { v: 'Khi hỏi ngày mua.', t: ['I remember it was delivered on January the 15th.', 'It was on the 12th.'], p: 'Ngày 15/1 là ngày giao hàng (bẫy); ngày mua là 12/1 → 12th January' },
        4: { v: 'Khi mô tả sự cố.', t: "I mean, it's beeping continuously, even when the door is shut.", p: 'Chuông báo kêu liên tục kể cả khi đóng cửa → alarm' },
        5: { v: 'Ngay sau đó, về nhiệt độ.', t: "It's now ten degrees, but I set it to be minus eight.", p: 'Âm 8 độ là mức cài đặt (bẫy); tủ đang ở 10 độ → 10' },
        6: { v: 'Khi hỏi trung tâm bảo trì ở đâu.', t: 'Just a few steps up from the station.', p: 'Cửa hàng ở phố Elm, cách nhà ga vài bước → station' },
        7: { v: 'Khi hỏi tủ hỏng có gây thiệt hại không.', t: 'Yes, actually, it was used to store food for my sandwich shop.', p: 'Tủ dùng để trữ thực phẩm cho tiệm bánh sandwich → sandwich' },
        8: { v: 'Khi ước tính tổng thiệt hại.', t: 'So the overall loss is about $180.', p: 'Rau $50 và thịt hơn $100 (bẫy); tổng thiệt hại khoảng $180 → 180' },
        9: { v: 'Khi khách muốn được cập nhật thông tin.', t: "I'll have the manager ring you later.", p: 'Nhân viên sẽ nhờ quản lý gọi lại → manager' },
        10: { v: 'Cuối phần 1.', t: "I've just noticed that the door is dented.", p: 'Cửa tủ bị móp, có thể phải thay → door' },
      },
    },
    {
      part: 2, title: 'A Trip to Southern Scotland', audio: 'test 10/Part 2.mp3', cover: 'Scottish Borders landscape | Scotland countryside hills',
      fix: [['I\'m Sally. Tour guide from Travel Light Travel Agency.', "I'm Sally, tour guide from Travel Light Travel Agency."], ['along side the mountain road', 'alongside the mountain road'],
        ['Brown There used to be famous for its farm', 'Brown Mare used to be famous for its farm'], ['From there, we will go on to Brown Manor.', 'From there, we will go on to Brown Mare.'],
        ['I think you will be struck by the beautiful roses and Mother Nature in Doris. There were several old barns', 'I think you will be struck by the beautiful roses and Mother Nature. In Doris, there were several old barns'],
        ['Our next stop is Jordan.', 'Our next stop is Aurden.'], ['To begin with we will go to Shapefile,', 'To begin with, we will go to Sheepfold,'], ['in East Lake,', 'in Eastlake,'],
        ['also called A, B and B,', 'also called a B&B,'], ['But some people think they have never had such an experience before that they want to have a try.', 'But some people have never had such an experience before, so they want to have a try.'],
        ['If you have any more questions about the trip, please call me at.', 'If you have any more questions about the trip, please call me.']],
      groups: [
        matching('What tourist attraction does each of the following locations have?\nChoose SIX answers from the box and write the correct letter, A-I, next to Questions 11-16.',
          ['farming life in the past', 'nature reserve', 'canoes', 'old ruins', 'newly born deer', 'birds', 'waterfalls', 'wild flowers', 'hills'],
          [[11, 'Sheepfold', 'I'], [12, 'Brown Mare', 'H'], [13, 'Doris', 'B'], [14, 'Lodge Estate', 'E'], [15, 'Aurden', 'D'], [16, 'Eastlake', 'F']], { title: 'Tourist Attractions', groupTitle: 'Questions 11-16' }),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO types of accommodation are available on a weekly basis?', ['lighthouse', 'hostel', 'castle', 'cottages', 'bed and breakfast'], ['B', 'D'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO benefits can all the members get?', ['free entry to some castles', 'subscription to Scottish magazines', 'discount on apartment rent', 'free visitor guide', 'free parking'], ['B', 'D'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Đầu bài, điểm đến đầu tiên.', t: "One thing that's definitely worth doing is climbing to the top of the mountain.", p: 'Ở Sheepfold nên leo lên đỉnh núi ngắm toàn cảnh bờ biển → đồi núi → I' },
        12: { v: 'Điểm tiếp theo, Brown Mare.', t: 'I think you will be struck by the beautiful roses and Mother Nature.', p: 'Nông trại đang sửa chữa, chưa mở lại (bẫy A); nơi đây gây ấn tượng với những bông hồng và thiên nhiên → hoa dại → H' },
        13: { v: 'Doris.', t: 'In Doris, there were several old barns, but they have been converted into a special section where animals and plants are protected.', p: 'Các kho thóc cũ được chuyển thành khu bảo vệ động thực vật → khu bảo tồn thiên nhiên → B' },
        14: { v: 'Lodge Estate.', t: 'Then we will go to Lodge Estate, which is the most favorite location for children as they can watch the baby deer.', p: '“Baby deer” = hươu con mới sinh → E' },
        15: { v: 'Aurden.', t: 'I strongly recommend that you visit the ancient town, which was constructed nearly 1000 years ago.', p: 'Thị trấn cổ gần 1000 năm, không còn nhiều công trình nguyên vẹn và đang được khai quật → tàn tích → D' },
        16: { v: 'Eastlake.', t: 'it will be the most spectacular month with the arrival of Canada geese.', p: 'Lúc đoàn tới là mùa ngỗng Canada bay về → chim → F' },
        17: { v: 'Phần chỗ ở.', t: "More importantly, they don't have to change accommodation for a whole week.", p: 'B&B chỉ tính theo ngày (loại E); ở hostel không phải đổi chỗ cả tuần → B' },
        18: { v: 'Như câu 17 (chọn 2 đáp án).', t: 'The owner promises that the rent can be paid every seven days', p: 'Nhà tranh gần lâu đài trả tiền thuê 7 ngày một lần = theo tuần → D' },
        19: { v: 'Phần quyền lợi hội viên.', t: 'You can also receive regular copies of magazines about the native food and attractions in Scotland.', p: 'Giảm giá và đỗ xe miễn phí chỉ cho hội viên premium (loại C, E); tạp chí được tặng cho tất cả → B' },
        20: { v: 'Như câu 19 (chọn 2 đáp án).', t: 'The good news is all of you can enjoy our guide service without any charge', p: 'Mọi người được hướng dẫn viên miễn phí; vé vào lâu đài phải tự trả (loại A) → D' },
      },
    },
    {
      part: 3, reuse: '6a50a408c7a497a299b35b95', // = bank "Marketing Students Discussion on SUVs" (Actual Test 10 P3): same key 10/10
      title: 'Research on SUVs', audio: 'test 10/Part 3.mp3', cover: 'SUV car | four wheel drive vehicle',
      speakers: { 1: 'Student A', 3: 'Student B' },
      fix: [['We\'re actually first designed for off road use', 'were actually first designed for off-road use'], ['you see, we have to do a presentation in next week\'s', 'you see, we have to do a presentation in next week\'s'], ['we can see how they make use of them differently than in the second part. Let\'s talk', 'we can see how they make use of them differently. Then in the second part, let\'s talk'], ['while in an ordinary car. There are only five seats.', 'while in an ordinary car, there are only five seats.'], ['drivers tend to buy SUVs with higher speeds', 'drivers tend to buy SUVs with higher seats'], ['it\'s more likely for them to rollover than ordinary cars', 'it\'s more likely for them to roll over than ordinary cars']],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'SUVs (Sports Utility Vehicles)', [
          '<strong>Purposes</strong>',
          '• Initially made for off-road driving in remote areas',
          '• Now often found in __Q21__',
          '<strong>Advantages</strong>',
          '• Available for __Q22__ purposes',
          '• Larger __Q23__ capacity',
          '• Can haul heavy cargo',
          '<strong>Reasons for popularity</strong>',
          '• Due to their image',
          '• Seen as __Q24__ by mothers',
          '• Greater seating capacity',
          '• Drivers like their __Q25__',
          '<strong>Disadvantages</strong>',
          '• SUVs can be __Q26__ in urban centres because of their __Q27__',
          '• The bodywork won’t deform in a collision to absorb impact energy',
          '• They are liable to __Q28__',
          '<strong>How to limit the use of SUVs</strong>',
          '• Limit use to those people who need them (e.g. __Q29__)',
          '• Raise cost of __Q30__ for drivers',
        ], { 21: 'cities/the cities', 22: 'commercial', 23: 'engine', 24: 'safe', 25: 'higher seats', 26: 'harmful', 27: 'weight', 28: 'roll over/rollover', 29: 'farmers', 30: 'insurance' }, 'Questions 21-30'),
      ],
      expl: {
        21: { v: 'Đầu phần 3, mục đích sử dụng SUV.', t: 'But the interesting thing is that at present, they are also frequently used by people who live in cities.', p: 'Ban đầu để đi đường địa hình xa xôi, nay được người ở thành phố dùng nhiều → cities' },
        22: { v: 'Phần ưu điểm.', t: "First, they're generally used for commercial reasons, right?", p: 'SUV thường được dùng cho mục đích thương mại → commercial' },
        23: { v: 'Ưu điểm thứ hai.', t: 'Well, another advantage from my notes is that the power of the engine is increased.', p: 'Động cơ mạnh hơn → dung tích động cơ lớn hơn → engine' },
        24: { v: 'Phần lý do được ưa chuộng.', t: "many moms like to drive their kids to school in SUVs because they think that they're safe.", p: 'Các bà mẹ cho rằng SUV an toàn → safe' },
        25: { v: 'Ngay sau đó.', t: 'drivers tend to buy SUVs with higher seats, which means they can get a better view of the traffic ahead.', p: 'Ghế cao giúp nhìn rõ đường phía trước → higher seats' },
        26: { v: 'Phần nhược điểm.', t: 'we can see that SUVs are harmful in central areas', p: 'SUV gây hại ở khu trung tâm → harmful' },
        27: { v: 'Ngay sau đó.', t: 'the damage they cause is highly related to their weight.', p: 'Thiệt hại chúng gây ra liên quan đến trọng lượng → weight' },
        28: { v: 'Nhược điểm tiếp theo.', t: "it's more likely for them to roll over than ordinary cars.", p: 'Trọng tâm cao nên dễ bị lật hơn xe thường → roll over' },
        29: { v: 'Phần hạn chế việc dùng SUV.', t: 'For one thing, I think we should restrict them to people like farmers', p: 'Chỉ cho những người thực sự cần như nông dân dùng → farmers' },
        30: { v: 'Ngay sau đó.', t: 'And I think companies could also increase the insurance paid by SUV drivers', p: 'Tăng phí bảo hiểm với người lái SUV → insurance' },
      },
    },
    {
      part: 4, reuse: '6a53c99e5c459ab074ce99ff', title: 'Research into Learner Persistence', audio: 'test 10/Part 4.mp3', groups: [], expl: {},
    },
  ],
};
