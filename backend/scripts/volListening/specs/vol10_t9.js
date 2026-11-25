// Vol 10 – Test 9 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 9 Listening": question paper PDF on a public Google
// Drive link + key + transcript). The test = "IELTS Recent Actual Tests 1 – Listening Test 6" (DOL AT1_L6; also
// ieltspracticeonline "Practice Test 26"). Audio + speaker-labelled transcript from the cached DOL sections
// (web/vol10/dolprep.js). DOL transcript P4 dropped a number: "go up to months with no water" → "up to eight months" (heard by
// Whisper, wb.js 10 9 4 295 314). Q21–26 map = the picture in the izone PDF (embedded image → web/vol10/img/t9p3_map.png),
// shown with the six place names as drag chips (Vol prints them as letters A–F).
// Key = izone, checked against the transcript; extra accepted variants: Q1 "Southwest" (“Kingston in Southwest London” — DOL's
// key), Q20 "2 to 10" (“between 2 and 10 days”, DOL's key; izone prints 10), Q38 "afraid of" (DOL).
const fs = require('fs'), path = require('path');
const { note, mc, map } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');
const PLACES = ['Video Resource Centre', 'Reading Room', 'Food Service Centre', 'Periodicals Section', 'Enquiry Desk', 'Satellite TV Station'];

module.exports = {
  vol: 10, test: 9,
  sections: [
    {
      part: 1, title: 'House Cleaning Service', audio: 'LISTENING/test 9/part 1.mp3', clip: [0, 400],
      cover: 'house cleaning | cleaning service', transcript: TX('t9p1'),
      groups: [
        note('Complete the form below.\nWrite ONE WORD ONLY for each answer.', 'House cleaning service – customer details', [
          'Location: __Q1__ London',
          'Rooms: two __Q2__ bedrooms',
          'The other room used as: an __Q3__',
          'Downstairs: kitchen-diner, conservatory and __Q4__',
        ], { 1: 'Kingston / Southwest', 2: 'double / doubles', 3: 'office', 4: 'lounge' }, 'Questions 1-4'),
        mc('Choose the correct letter, A, B or C.', [
          [5, 'Which extra service does the agent agree to do?', ['Change the bed linen', 'Do some gardening work', 'Clean the glass'], 'A'],
          [6, 'What does the customer want cleaned every three months?', ['Curtains', 'Carpets', 'Mats'], 'B'],
          [7, 'What does the customer want done with clothes?', ['Wash and iron', 'Iron only', 'Clean and dry'], 'B'],
        ], 'Questions 5-7'),
        note('Complete the sentences below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', '', [
          'The agent’s address is 12 __Q8__ Road.',
          'Her house will get cleaned next __Q9__.',
          'The maximum time of cleaning service is __Q10__.',
        ], { 8: 'Amyes', 9: 'Thursday', 10: '3 hours / three hours / 3' }, 'Questions 8-10'),
      ],
      expl: {
        1: { v: 'Khi được hỏi nhà có ở London không.', t: 'Yes, it’s in Kingston in Southwest London.', p: 'Nhà ở khu Kingston, Tây Nam London → Kingston' },
        2: { v: 'Khi hỏi số và loại phòng ngủ.', t: ['Are those single bedrooms or doubles?', 'Doubles.', 'Fine, two doubles...'], p: 'Trước có 3 phòng ngủ (bẫy), giờ còn 2 phòng ngủ đôi → double' },
        3: { v: 'Khi khách nói thêm một phòng cần dọn.', t: 'It was used as a bedroom before, and now we have converted it into an office.', p: 'Phòng ngủ cũ đã chuyển thành văn phòng → office' },
        4: { v: 'Khi khách kể các phòng ở tầng dưới.', t: 'Then, downstairs we have a kitchen-diner, conservatory, and lounge.', p: 'Tầng dưới có bếp kiêm phòng ăn, nhà kính và phòng khách → lounge' },
        5: { v: 'Khi nhân viên hỏi dịch vụ thêm.', t: 'Err... no... err....... actually, replacing the bed linen, yes that would be good', p: 'Nhân viên liệt kê thay ga giường, làm vườn, lau kính; khách chỉ chọn thay ga giường → A' },
        6: { v: 'Khi hỏi về rèm, thảm chùi chân và thảm trải sàn.', t: 'I think we should have the carpets cleaned really well every quarter.', p: '“every quarter” = mỗi ba tháng; rèm còn phải nghĩ (bẫy A), thảm chùi chân giặt cùng đồ (bẫy C) → B' },
        7: { v: 'Khi hỏi về quần áo.', t: 'Washing and ironing. No, just ironing.', p: 'Khách đổi ý từ giặt và là (bẫy A) sang chỉ là → B' },
        8: { v: 'Khi nhân viên nói địa chỉ công ty.', t: 'I should let you know that we locate on 12 Amyes Road, that’s A-M-Y-E-S.', p: 'Địa chỉ 12 đường Amyes, đánh vần A-M-Y-E-S → Amyes' },
        9: { v: 'Khi hẹn ngày dọn.', t: 'Perhaps next Thursday or next Saturday. Let me check, OK, next Thursday.', p: 'Thứ Sáu không được (bẫy), cân nhắc thứ Năm hoặc thứ Bảy, cuối cùng chọn thứ Năm → Thursday' },
        10: { v: 'Khi khách hỏi thời gian dọn.', t: 'We usually work 1-3 hours for house cleaning, and the work will take three hours at most.', p: '“at most” = tối đa ba giờ → 3 hours' },
      },
    },
    {
      part: 2, title: 'The Australian Quarantine Service', audio: 'LISTENING/test 9/part 2.mp3', clip: [0, 409],
      cover: 'airport security | sniffer dog airport', transcript: TX('t9p2'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'The main purpose of the service is to', ['educate people.', 'persuade people to fly.', 'provide people with comfort.'], 'A'],
          [12, 'The number of people working at Sydney Airport is', ['200.', '360.', '440.'], 'C'],
          [13, 'Dogs are chosen according to', ['their ability to stay calm.', 'their friendliness.', 'their skill at locating narcotics.'], 'A'],
          [14, 'The number of postal items processed last year amounted to', ['4,400.', '52,000.', '72,000.'], 'B'],
          [15, 'People carrying items that are not allowed', ['will get arrested.', 'will be refused on board.', 'will be given a warning.'], 'C'],
          [16, 'Which of the following is NOT allowed to be taken on the flight?', ['Carry-on items', 'Plant seeds', 'Parcels'], 'B'],
          [17, 'The proper security protocol for a pocket knife found in a carry-on suitcase is', ['It is returned to the passenger after examination.', 'It is thrown away in a safe receptacle.', 'It is passed on to higher-level authorities.'], 'B'],
        ], 'Questions 11-17'),
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', '', [
          'The acceptable material for packing goods is __Q18__.',
          'Belongings are most often refused due to problems with the __Q19__.',
          'The customs must be given notice of the goods from __Q20__ days before it arrives in Australia.',
        ], { 18: 'paper', 19: 'package labels / labels', 20: '2 to 10 / two to ten / 10 / ten' }, 'Questions 18-20'),
      ],
      expl: {
        11: { v: 'Đầu bài nói.', t: 'We hope to provide you with a better understanding of why such heavy security regulations are necessary by educating you on how we operate and why we do the things we do.', p: 'Mục đích là giúp mọi người hiểu bằng cách giáo dục (educating); không nhằm thuyết phục bay qua Sydney (bẫy B) → A' },
        12: { v: 'Khi hỏi số nhân viên.', t: 'Sydney Airport actually employs 440 people.', p: '200 chỉ ở Nhà ga 2, 360 là người nghe đoán (bẫy) → C' },
        13: { v: 'Khi giới thiệu chú chó Milton.', t: 'Notice that even though there are so many of us around him, Milton stays calm. This is the precise reason he was chosen for the job.', p: 'Chó được chọn vì giữ được bình tĩnh; thân thiện chỉ là đặc điểm, kỹ năng đánh hơi do được huấn luyện (bẫy B, C) → A' },
        14: { v: 'Khi nói về nhà ga hàng hóa.', t: 'In this airport alone, over 52,000 packages were shipped in and out over the past year.', p: 'Năm ngoái hơn 52.000 kiện; 4.400 là mỗi tháng, 72.000 là dự kiến năm nay (bẫy) → B' },
        15: { v: 'Khi nói về đồ cấm trong hành lý xách tay.', t: 'you are still allowed to board the plane, but you’ll be given a warning and your item will be confiscated.', p: 'Vẫn được lên máy bay, không bị bắt, chỉ bị cảnh cáo và tịch thu đồ → C' },
        16: { v: 'Khi nói về thực vật.', t: 'It is important to control the introduction of new plants into an ecosystem, so we must prohibit the transport of any fertile seeds.', p: 'Cấm mang hạt giống có khả năng nảy mầm → B' },
        17: { v: 'Khi nói xử lý đồ khả nghi.', t: 'If an illegal plant or simple sharp object like a pocket knife is found, it is simply disposed of in our biohazard waste containers', p: 'Dao bỏ túi bị vứt vào thùng chứa chất thải sinh học; chỉ vũ khí nguy hiểm mới báo cấp trên (bẫy C) → B' },
        18: { v: 'Khi nói về vật liệu đóng gói.', t: 'For shipped goods, the most common material used (and the most widely accepted) is paper.', p: 'Vật liệu được chấp nhận rộng rãi nhất là giấy → paper' },
        19: { v: 'Khi nói lỗi thường gặp.', t: 'A more common problem, though, is the package labels.', p: 'Lý do phổ biến nhất khiến hàng không đến đúng nơi là nhãn gói hàng → package labels' },
        20: { v: 'Cuối bài, khi nói về khai báo hải quan.', t: 'we ask that you notify customs between 2 and 10 days within the item’s scheduled arrival date.', p: 'Báo hải quan trong khoảng từ 2 đến 10 ngày trước khi hàng đến → 2 to 10' },
      },
    },
    {
      part: 3, title: 'How to Use the Library’s Facilities', audio: 'LISTENING/test 9/part 3.mp3', clip: [0, 422],
      cover: 'university library interior | library reading room', transcript: TX('t9p3'),
      groups: [
        { ...map('Label the map below.\nDrag the correct place to Questions 21-26 on the map.', [
          [21, 'Question 21', 'Reading Room'], [22, 'Question 22', 'Periodicals Section'], [23, 'Question 23', 'Food Service Centre'],
          [24, 'Question 24', 'Video Resource Centre'], [25, 'Question 25', 'Satellite TV Station'], [26, 'Question 26', 'Enquiry Desk'],
        ], { img: 'img/t9p3_map.png' }, 'Questions 21-26'), dragDropConfig: { text: '', words: PLACES } },
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS for each answer.', '', [
          'If you need to find information on a certain book, you can use __Q27__ check-out cards.',
          'If you want to find information in a specific field, use the __Q28__ guides.',
          'Computers in some __Q29__ cannot be linked to the network.',
          'You can find more information in a __Q30__ on my desk.',
        ], { 27: 'pink and yellow', 28: 'subject', 29: 'universities', 30: 'labelled blue folder / blue folder' }, 'Questions 27-30'),
      ],
      expl: {
        21: { v: 'Khi nói về khu trung tâm.', t: 'The Reading Room is a really large area in the centre of the library, just to the north of the Circulation Desk.', p: 'Khu lớn ở giữa thư viện, phía bắc quầy mượn trả = ô 21 → Reading Room' },
        22: { v: 'Khi nói về góc đông nam.', t: 'Moving on to the southeast corner, we have the Periodicals Section, just next to the study rooms.', p: 'Góc đông nam, cạnh phòng học nhóm = ô 22 → Periodicals Section' },
        23: { v: 'Khi học sinh hỏi chỗ ăn.', t: 'It’s on the northeast corner as you look at the map.', p: 'Trung tâm đồ ăn ở góc đông bắc, gần phòng học nhóm = ô 23 → Food Service Centre' },
        24: { v: 'Khi đi tiếp về phía tây.', t: 'Well, moving on along to the west, you will find the Video Resource Centre on your right hand.', p: 'Từ góc đông bắc đi về phía tây là trung tâm video = ô 24 → Video Resource Centre' },
        25: { v: 'Ngay sau đó.', t: 'To the west of the Video Resource Centre is our Satellite TV Station.', p: 'Phía tây trung tâm video, góc tây bắc = ô 25 → Satellite TV Station' },
        26: { v: 'Khi nói về quầy hỏi đáp.', t: 'It\'s just on the left-hand side when you walk into the library, so it’s impossible to miss it.', p: 'Bên trái khi bước vào thư viện, dọc tường phía tây = ô 26 → Enquiry Desk' },
        27: { v: 'Khi nói cách mượn sách.', t: 'If it’s a fiction or non-fiction book, look for the pink and yellow check-out card inside the back cover of the book.', p: 'Thẻ mượn màu hồng và vàng có thông tin về cuốn sách → pink and yellow' },
        28: { v: 'Khi nói tìm thông tin theo lĩnh vực.', t: 'You can find general information on a field of study by using one of our subject guides.', p: '“a field of study” = a specific field → subject' },
        29: { v: 'Khi nói về mạng liên thư viện.', t: 'However, there are universities which are not part of the network, so we do not share resources with them.', p: 'Một số trường đại học không thuộc mạng lưới → universities' },
        30: { v: 'Khi nói nơi có thêm thông tin.', t: 'you’ll find it in a labelled blue folder on my desk in the enquiry section.', p: 'Thông tin thêm nằm trong tập hồ sơ xanh có dán nhãn trên bàn → labelled blue folder' },
      },
    },
    {
      part: 4, title: 'The Nile Crocodile', audio: 'LISTENING/test 9/part 4.mp3', clip: [0, 437],
      cover: 'nile crocodile | crocodile river bank', transcript: TX('t9p4'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [31, 'Why did the student think there were no crocodiles in Northern Africa?', ['North Africa contains very little wildlife for the crocodile to prey on.', 'She found no mention in the literature of their existence there.', 'There is very little water in North Africa.'], 'B'],
          [32, 'Crocodiles live in groups of about', ['20.', '38.', '46.'], 'A'],
          [33, 'African crocodiles usually live in areas with', ['hot, dry climates.', 'hot, wet rainforests.', 'warm, wet climates.'], 'C'],
          [34, 'Crocodiles in dry areas live in caves located', ['underground.', 'in mountainsides.', 'underwater.'], 'A'],
          [35, 'What caused the change in crocodile populations in North Africa?', ['They were driven away by a fierce predator.', 'Crocodiles evolved from desert creatures to wetland creatures.', 'North Africa used to be wetland but slowly turned to desert over time.'], 'C'],
        ], 'Questions 31-35'),
        note('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', '', [
          'Desert crocodiles sometimes live through dry periods lasting up to __Q36__ months.',
          'A female’s egg-laying hole can have a __Q37__ of up to 60cm.',
          'Local people do not __Q38__ crocodiles.',
          'Crocodiles __Q39__ when humans populate their habitat.',
          'Researchers want to study more about population size, __Q40__, and relations to other populations of crocodiles.',
        ], { 36: '8 / eight', 37: 'depth', 38: 'fear / afraid of', 39: 'attack', 40: 'migration patterns' }, 'Questions 36-40'),
      ],
      expl: {
        31: { v: 'Khi nhắc câu hỏi của một sinh viên.', t: 'there were no crocodiles in the Northern Region, and found no mention in the literature of the existence of crocodiles in the North of Africa.', p: 'Sinh viên không thấy tài liệu nào nhắc cá sấu ở Bắc Phi → B' },
        32: { v: 'Khi nói về đàn cá sấu.', t: 'received reports of 46 crocodiles living in one group, or float as we say when referring to crocodiles, though the usual number is a little less than half of that.', p: '46 là trường hợp ghi nhận (bẫy C); số thường gặp ít hơn một nửa, khoảng 20 → A' },
        33: { v: 'Khi nói về môi trường sống.', t: 'In general, crocodiles are more highly concentrated in wet, subtropical environments near bodies of water and rich vegetation.', p: 'Vùng cận nhiệt đới ẩm = ấm và ẩm; không chịu được khí hậu khô (bẫy A), rừng mưa mát là của cá sấu Nam Mỹ (bẫy B) → C' },
        34: { v: 'Khi nói về cá sấu ở vùng khô.', t: 'To utilise every bit of rainfall, these desert crocodiles dig underground caves that collect runoff, thus staying cool and hydrated.', p: 'Cá sấu sa mạc đào hang dưới lòng đất → A' },
        35: { v: 'Khi trả lời câu hỏi đầu bài.', t: 'Over time, though, the area dried out and the wetland slowly turned to desert, leading the African crocodile to migrate south', p: 'Bắc Phi từng là đất ngập nước rồi dần thành sa mạc; tiến hóa và kẻ săn mồi chỉ là phỏng đoán của sinh viên (bẫy A, B) → C' },
        36: { v: 'Khi nói về cá sấu thích nghi với khô hạn.', t: 'some crocodiles have learned to survive in an area where they can go up to eight months with no water', p: 'Có thể sống đến tám tháng không có nước → 8' },
        37: { v: 'Khi nói về việc đẻ trứng.', t: 'Afterwards, the female digs a hole up to 60cm in depth to store the eggs for an 80-day incubation period.', p: 'Hố sâu đến 60cm → depth' },
        38: { v: 'Khi nói về cư dân địa phương.', t: 'Although these vicious creatures have attacked humans on a few occasions, the residents are not afraid of them.', p: '“not afraid of” = do not fear → fear' },
        39: { v: 'Khi nói khi nào cá sấu tấn công người.', t: 'They attack when humans populate the crocodiles\' habitat, instilling fear and uneasiness in the crocs.', p: 'Cá sấu tấn công khi con người đến sống trong môi trường của chúng → attack' },
        40: { v: 'Cuối bài giảng.', t: 'There is still also much to learn about migration patterns, and relations to other populations of crocodiles now found in other parts of the world.', p: 'Ngoài quy mô quần thể, cần nghiên cứu thêm về các mô hình di cư → migration patterns' },
      },
    },
  ],
};
