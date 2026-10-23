// Vol 9 – Test 8 (same layout as vol9_t1.js; map = the image embedded in the question docx, redrawn without the watermark
// → img/t8/map_redraw.png). P3 = bank "Stone Point: a New Zealand Historical Site" (Vol 6 - Test 2 P3): same questions,
// key 10/10 (the bank key is the one corrected by the recording in Vol 6), transcript 6-gram 61 % → reused.
// Audio starts mid-way through the Part 1 instructions; P1 plays the example first → cut. The docx replay drops the adviser's
// opening ("Hello, this is Medical Help Direct. How can I help you? Oh, hello.") → fix restores it from the example.
// Source key error fixed by the recording: Q16 C → B ("Payment to the centre is made by school, not by parents… Otherwise, please
// leave payment in an envelope in the box at the school office").
// Part 2 → 3 has no answer-check pause (cut after "end of part two.", 701.9 s). docx "Forts Road" → Forest Road (map).
const { note, mc, map } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 8.mp4';

module.exports = {
  vol: 9, test: 8, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 8-L.docx',
  rawRe: [...RE, ['Forts Road', 'Forest Road']],
  sections: [
    {
      part: 1, title: 'Medical Help Direct – Call Record Card', audio: A, clip: [0, 368], cover: 'man back pain | telephone helpline nurse headset',
      cut: [['On this occasion only', 'Listen carefully, and answer questions one by one.']],
      fix: [["Hello, I've got a problem with my back, and with it being the middle of the night, I can't go to the doctor, and I wonder if you can give me some advice.",
        "Hello, this is Medical Help Direct. How can I help you? Oh, hello. I've got a problem with my back, and with it being the middle of the night, I can't go to the doctor, and I wonder if you could give me some advice."]],
      turns: [
        ['Adviser', 'Hello, this is Medical'], ['Robert', 'Oh, hello.'], ['Adviser', 'Certainly.'], ['Robert', "It's 03786"], ['Adviser', 'OK.'], ['Robert', 'Robert.'],
        ['Adviser', 'And your surname?'], ['Robert', 'Ridyard.'], ['Adviser', 'And now your address'], ['Robert', "It's 27 Station Road."], ['Adviser', 'OK.'],
        ['Robert', 'Moortown.'], ['Adviser', 'Yes, please.'], ['Robert', 'D-P-17'], ['Adviser', 'And your date of birth?'], ['Robert', 'The 25th'], ['Adviser', 'Fine.'],
        ['Robert', "She's called Dr Craven."], ['Adviser', 'And the surgery?'], ['Robert', "It's Moortown Health"], ['Adviser', 'Thanks.'], ['Robert', 'Well, like I said'],
        ['Adviser', 'OK.'], ['Robert', 'Lower.'], ['Adviser', 'And have you had any'], ['Robert', 'Yes.'], ['Adviser', 'And when did it start'], ['Robert', "No, I've had it"],
        ['Adviser', 'And do you have any pain'], ['Robert', 'No.'], ['Adviser', 'OK.'], ['Robert', 'Well, I was tidying'], ['Adviser', "Yes, it's easily done"],
        ['Robert', 'Yes.'], ['Adviser', 'Have you tried'], ['Robert', "Yes, I've got a hot"], ['Adviser', 'And have you taken'], ['Robert', 'Yes.'],
        ['Adviser', 'And other than that'], ['Robert', 'I do, yes.'], ['Adviser', 'Right.'], ['Robert', 'Oh, right.'], ['Adviser', 'It can be useful'],
        ['Robert', 'No, I just thought'], ['Adviser', 'I think you should go'], ['Robert', "OK, I'll do that."], ['Adviser', 'Good.'], ['Robert', "OK, I'll ask her."],
        ['Adviser', 'Right.'], ['Robert', 'Thanks very much.'],
      ],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Call Record Card', [
          "<em>Example</em> Caller's phone number: 03786 439251",
          "Caller's name: Robert __Q1__",
          'Address: 27 __Q2__, Moortown',
          'Postcode: DP17 5HJ',
          'Date of birth: __Q3__, 1975',
          "Doctor's name: Dr Craven",
          "Doctor's address: Moortown Health Centre",
          'Reason for call: Pain in his __Q4__ back',
          'Previous history: Similar back problem in June last year',
          'Details of present problem: Started __Q5__ ago',
          'Got worse this __Q6__',
          'No abdominal pain',
          'Possible cause: Lifting up a heavy __Q7__',
          'Treatment already applied: Has applied heat',
          'Has taken __Q8__',
          'Advice given: Try using __Q9__',
          'Go to doctor tomorrow',
          'Ask for information about __Q10__',
        ], {
          1: 'Ridyard', 2: 'Station Road', 3: '25th February/25 February/February 25th/February 25/25th of February/the 25th of February', 4: 'lower',
          5: 'three days/3 days', 6: 'afternoon', 7: 'box', 8: 'painkillers/pain killers', 9: 'ice', 10: 'exercise/exercises',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi tư vấn viên hỏi họ.', t: ['And your surname?', 'Ridyard.', "That's R-I-D-Y-A-R-D."], p: 'Robert đánh vần họ → Ridyard' },
        2: { v: 'Khi tư vấn viên hỏi địa chỉ.', t: "It's 27 Station Road.", p: 'Số 27 đường Station Road → Station Road' },
        3: { v: 'Khi tư vấn viên hỏi ngày sinh.', t: 'The 25th of February, 1975.', p: 'Ngày 25 tháng 2 năm 1975 → 25th February' },
        4: { v: 'Khi hỏi đau phần nào của lưng.', t: ['Can you tell me which part of the back?', 'Lower.'], p: 'Đau phần lưng dưới → lower' },
        5: { v: 'Khi hỏi cơn đau bắt đầu khi nào.', t: "No, I've had it, let's see, since Monday, so that's three days now.", p: 'Đau từ thứ Hai, đến nay đã ba ngày → three days' },
        6: { v: 'Khi Robert kể cơn đau nặng lên.', t: 'Then this afternoon, the pain suddenly got so bad that I went to bed.', p: 'Chiều nay cơn đau đột ngột nặng hơn → afternoon' },
        7: { v: 'Khi hỏi nguyên nhân.', t: 'Well, I was tidying up my office, and I lifted a box up from the floor that was heavier than I thought', p: 'Nhấc một cái hộp nặng hơn dự tính → box' },
        8: { v: 'Khi hỏi đã dùng cách gì.', t: ['And have you taken any painkillers?', 'Yes.'], p: 'Robert đã uống thuốc giảm đau; chườm nóng là việc đã làm trước đó → painkillers' },
        9: { v: 'Khi tư vấn viên đưa lời khuyên.', t: 'One thing you could do now is to see if ice makes any difference.', p: 'Thử chườm đá → ice' },
        10: { v: 'Khi khuyên Robert đi khám.', t: ['And you might get some advice from her about exercise.', "That's often the best way of dealing with this sort of problem."], p: 'Hỏi bác sĩ lời khuyên về việc tập luyện → exercise' },
      },
    },
    {
      part: 2, title: 'Preparing for a Trip to an Outdoor Education Centre', audio: A, clip: [368, 701.9], cover: 'children camping tents outdoor | kayaks river outdoor centre',
      fix: [['06:32', '']],
      turns: [],
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nPreparing for a trip to an outdoor education centre', [
          [11, 'A trip to the outdoor education centre will help the children', ['create good relationships.', 'manage without adult supervision.', 'react positively to new challenges.'], 'C'],
          [12, 'To prepare their children for the trip, parents should', ['let them try sleeping in a tent at home.', 'make sure they get enough sleep before they leave.', 'tell them that they will be in a tent with their friends.'], 'B'],
          [13, "What do parents need to put in their children's backpack?", ['plastic bags', 'snacks and biscuits', 'a small amount of money'], 'A'],
          [14, 'What are children allowed to bring on the trip?', ['electronic games', 'cell phones', 'penknives'], 'B'],
          [15, 'How are parents selected to attend the trip?', ['The first ten parents to sign up will be able to go.', "Parents' names will be chosen from a box.", 'Preference will be given to parents with camping skills.'], 'A'],
          [16, 'Payment for the trip', ["must be handed to the child's teacher.", 'can be left at the school office.', 'should be made directly to the outdoor education centre.'], 'B'],
        ], 'Questions 11-16'),
        map('Label the map below.\nChoose the correct letter, A-G, next to Questions 17-20.', [
          [17, 'Woodcarving studio', 'E'], [18, 'Emergency meeting point', 'A'], [19, 'Conservation centre', 'F'], [20, 'Arts and crafts room', 'B'],
        ], { img: 'img/t8/map_redraw.png' }, 'Questions 17-20'),
      ],
      expl: {
        11: { v: 'Khi hiệu trưởng giải thích mục đích chuyến đi.', t: ['At the school, we strongly believe children should be encouraged to try different things and not give up when it gets difficult.', "And that's what the centre is all about, having a go."], p: 'Trẻ vẫn có người lớn quen thuộc hướng dẫn (loại B); khuyến khích thử điều mới, không bỏ cuộc = phản ứng tích cực với thử thách mới → C' },
        12: { v: 'Khi nói về chỗ ngủ.', t: ['You can do this just by making sure they have some early nights before we go.', "Another thing, there's space for three children per tent so we can't guarantee your child will be in with their best friends."], p: 'Chuẩn bị bằng cách cho trẻ đi ngủ sớm vài hôm trước chuyến đi; không chắc ở chung lều với bạn thân (loại C) → B' },
        13: { v: 'Khi nói về đồ trong ba lô.', t: ['But these need to go in the box in the school hall, not with the children.', 'Actually, what we do need in the backpacks are bags for cleaning up and for wet clothing, so plastic ones please.', "but don't worry about putting money in because there's nothing to buy."], p: 'Bánh quy để trong hộp ở hội trường (loại B), không cần tiền (loại C); cần túi nhựa trong ba lô → A' },
        14: { v: 'Khi nói về những thứ được mang theo.', t: ['Cell phones are permitted, but they must be switched off at night and also off during the teaching sessions.', 'Electronic games are banned'], p: 'Dao do trung tâm cung cấp, trò chơi điện tử bị cấm; điện thoại được phép mang → B' },
        15: { v: 'Khi nói về phụ huynh tham gia.', t: ['in the past we\'ve had too many volunteers so we have written names on bits of paper and pulled them out of the box.', "So, if you're absolutely sure you can come, put your name down on the sign-up form and the first ten will be asked to come.", "Experience isn't required"], p: 'Bốc thăm là cách cũ (bẫy B), không cần kinh nghiệm (loại C); mười người đăng ký đầu tiên được đi → A' },
        16: { v: 'Khi nói về khoản phí.', t: ['Payment to the centre is made by school, not by parents.', 'Otherwise, please leave payment in an envelope in the box at the school office.'], p: 'Phụ huynh không trả thẳng cho trung tâm (loại C); giáo viên chỉ đưa thông tin tài khoản (loại A); có thể để tiền ở văn phòng trường → B' },
        17: { v: 'Khi chỉ vị trí xưởng khắc gỗ.', t: "Well, to the right of the hall and opposite the kitchen is the new barbecue area and it's right next to that overlooking Forest Road.", p: 'Khu nướng BBQ ở bên phải hội trường, đối diện bếp; xưởng ở ngay cạnh, nhìn ra Forest Road → E' },
        18: { v: 'Khi chỉ điểm tập trung khẩn cấp.', t: ['If you look to the top of the map and to north of Forest Road, that\'s the location.', 'It is on the same side of river as the tents.'], p: 'Phía trên bản đồ, phía bắc Forest Road, cùng bờ sông với khu lều → A' },
        19: { v: 'Khi chỉ vị trí trung tâm bảo tồn.', t: ['See the building marked Kayaks on right side riverbank?', 'Well, the Conservation Centre is between the two bridges just below it.'], p: 'Ngay dưới toà Kayaks, giữa hai cây cầu → F' },
        20: { v: 'Khi chỉ vị trí phòng thủ công mỹ thuật.', t: 'the Arts and Crafts room is to the right of the river, a little further up from the kayaks.', p: 'Bên phải sông, cao hơn khu kayak một chút → B' },
      },
    },
    { part: 3, title: 'Stone Point: a New Zealand Historical Site', reuse: '6ad0ef9be2298bbacd84862a' },
    {
      part: 4, title: 'Rural Development: The Berbers and the Tuaregs', audio: A, clip: [1086.6, 1501.7], cover: 'sahara desert camel caravan | tuareg nomads desert',
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Rural Development', [
          '<strong>The Berbers</strong>',
          '• lived in various countries in North Africa',
          '• were driven from their homes during the 12th century',
          '• began to lead a nomadic life, moving across __Q31__ and mountains',
          '<strong>Different Berber Lifestyles</strong>',
          '• some Berbers, known as __Q32__ nomads, moved twice a year',
          '• some Berbers were completely nomadic',
          '• some Berbers settled by oases, producing fruit, vegetables, and __Q33__ to cook with',
          '• people and belongings were carried by __Q34__',
          '• settled Berbers lived in houses',
          '• nomadic Berbers used tents',
          '• settled communities organised themselves by holding regular meetings in the __Q35__ of the village',
          '<strong>The Tuaregs</strong>',
          '• if goatskins were unavailable, tents were made from __Q36__ or palm-leaf mats',
          '• Tuareg labourers were the descendants of __Q37__',
          '• adult men always wore a __Q38__ veil',
          '• some Tuaregs moved to Burkina Faso with their __Q39__',
          '<strong>Tuaregs and Timbuktu</strong>',
          '• Timbuktu was settled by Tuaregs around 1000 years ago',
          '• the city built wealth on the salt and gold trades',
          '• some Tuaregs now work as __Q40__ for the Malian Department of Tourism',
        ], { 31: 'deserts/the deserts', 32: 'seasonal', 33: 'olive oil', 34: 'camels/camel', 35: 'square', 36: 'grass', 37: 'slaves', 38: 'dark blue', 39: 'herds/animals', 40: 'guides' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói người Berber chuyển sang du mục.', t: 'many Berbers left their settlements to lead a nomadic life by wandering with their animals through the deserts and across the different mountains.', p: 'Lang thang cùng đàn gia súc qua các sa mạc và núi → deserts' },
        32: { v: 'Khi nói về nhóm Berber thứ nhất.', t: ['Some became farmers cultivating the lowlands in the winter and grazing their flocks of animals in the mountains during the summer.', 'They are called seasonal nomads.'], p: 'Mùa đông ở vùng thấp, mùa hè lên núi: dân du mục theo mùa → seasonal' },
        33: { v: 'Khi nói về nhóm định cư ở ốc đảo.', t: 'A third group settled by the oases and grew fruit and vegetables like dates and eggplants as well as making olive oil which they used for cooking.', p: 'Làm dầu ô liu để nấu ăn → olive oil' },
        34: { v: 'Khi nói về phương tiện vận chuyển.', t: 'So the Berbers relied more and more on camels for transporting their families and their goods.', p: 'Dùng lạc đà chở gia đình và hàng hoá → camels' },
        35: { v: 'Khi nói về cách tổ chức cộng đồng định cư.', t: 'the life of a settled community was governed by the men who met regularly in the village square to discuss affairs and make decisions.', p: 'Đàn ông họp thường xuyên ở quảng trường làng → square' },
        36: { v: 'Khi nói về lều của người Tuareg.', t: "If the skins weren't available, they wove mats made of grass or palm leaves and hung them over a frame", p: 'Không có da dê thì đan chiếu bằng cỏ hoặc lá cọ → grass' },
        37: { v: 'Khi nói về xã hội Tuareg.', t: 'ranging from nobles or aristocrats downwards to labourers whose ancestors had once been slaves.', p: 'Người lao động có tổ tiên từng là nô lệ → slaves' },
        38: { v: 'Khi nói về đàn ông Tuareg.', t: 'Tuareg men were sometimes called blue men as all adult males wore a dark blue veil in the presence of women, strangers and in-laws.', p: 'Đàn ông trưởng thành đeo mạng che màu xanh đậm → dark blue' },
        39: { v: 'Khi nói về hạn hán ở vùng Sahel.', t: 'Those whose animals were fortunate enough to survive have moved away from the southern Sahara into Burkina Faso in order to find new grazing lands for their herds.', p: 'Chuyển đến Burkina Faso tìm đồng cỏ mới cho đàn gia súc → herds' },
        40: { v: 'Khi nói về Timbuktu ngày nay.', t: 'The tourism department of the Mali government employs some Tuaregs who act as guides.', p: 'Sở du lịch Mali thuê người Tuareg làm hướng dẫn viên → guides' },
      },
    },
  ],
};
