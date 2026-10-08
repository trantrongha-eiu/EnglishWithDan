// Vol 2 – Test 5 (PDF "listening/test 5/Test 5.pdf" p1–7, key p8; audio test 5/part 1–4.mp3)
// Transcripts: Whisper + Otter merge (+ wb.js where both were unclear: "two parties", the tiki passage).
// Source notes: Q31 key "wealthy residents" breaks ONE WORD AND/OR A NUMBER → "wealthy" accepted too; Q26–30
// instruction said "next to Question 27-30" and Q16–20 "A-G" (kept, map has A–G). Q9 key "Cliffton" (as spelt in the
// recording; the spec spells it out).
const { note, mc, map, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 5,
  sections: [
    {
      part: 1, title: 'Hotel Renovation Project', audio: 'listening/test 5/part 1.mp3', cover: 'hotel renovation | hotel rooftop swimming pool',
      speakers: { 1: 'Decorator', 2: 'Decorator', 3: 'Caller' },
      fix: [
        ["Yes, it's Central Hotel?", "Yes, it's Central Hotel."],
        ['We can do that for you.\nWe have\nCaller:\nA big lounge', 'We can do that for you.\nCaller:\nWe have a big lounge'],
        ['The old one is too small.\n2.\n', 'The old one is too small.\n'],
        ['His name is Clifton Barron.', 'His name is Cliffton Barron.'], ['Si l IFFTON.', 'C-L-I-F-F-T-O-N.'],
        ["It's 093-03-6602.", "It's 093036602."],
      ],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Hotel Renovation', [
          'Name of the hotel: __Q1__ Hotel',
          '<strong>Major changes:</strong>',
          '• signboard: the __Q2__ needs to be bigger',
          '• swimming pool: to be relocated from the __Q3__ to the __Q4__',
          '• resting area: turn the __Q5__ room into reception',
          '<strong>Notice board</strong>',
          '• translation needed: __Q6__',
          '<strong>Price board</strong>',
          '• current colour: __Q7__',
          '• Construction: starts before __Q8__',
          "• Manager's name: __Q9__ Barron",
          '• Telephone number: __Q10__',
        ], { 1: 'Central', 2: 'address', 3: 'basement', 4: 'roof', 5: 'lounge', 6: 'Spanish', 7: 'red', 8: 'July', 9: 'Cliffton', 10: '093036602' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi tên khách sạn.', t: "Yes, it's Central Hotel.", p: 'Tên khách sạn là Central → Central' },
        2: { v: 'Thay đổi thứ nhất: biển hiệu.', t: ['First, the address on our signboard in the front of the hotel is not big enough.', 'We would like to have it enlarged.'], p: 'Địa chỉ trên biển hiệu chưa đủ to, cần phóng lớn → address' },
        3: { v: 'Thay đổi thứ hai: hồ bơi.', t: ["It's now in the basement.", "After talking to the designers, we've decided to move it to the roof of the hotel."], p: 'Hồ bơi hiện ở tầng hầm → basement' },
        4: { v: 'Như câu 3.', t: "After talking to the designers, we've decided to move it to the roof of the hotel.", p: 'Chuyển hồ bơi lên mái khách sạn → roof' },
        5: { v: 'Thay đổi thứ ba: khu nghỉ.', t: ['We have a big lounge on the ground floor where our guests can rest.', 'We don\'t think we are making the most of it, and my manager said we should use the room for reception.'], p: 'Biến phòng lounge thành quầy lễ tân → lounge' },
        6: { v: 'Phần bảng thông báo.', t: ["I think the words on the notice board should be translated, but I'll need to confirm with my supervisor if we need to translate into Chinese or not.", 'We have quite a lot of Chinese guests now, but Spanish translation is definitely needed.'], p: 'Tiếng Trung còn phải hỏi lại, tiếng Đức và Nhật không cần; chắc chắn cần dịch sang tiếng Tây Ban Nha → Spanish' },
        7: { v: 'Phần bảng giá.', t: ['What color is it?', "It's red.", 'I was wondering if white looks better.'], p: 'Trắng chỉ là màu đang cân nhắc (bẫy); màu hiện tại là đỏ → red' },
        8: { v: 'Khi hỏi thời gian thi công.', t: 'So we can come before July and it depends on how much time you have for the renovation project.', p: 'Tháng Sáu là lúc xong công trình khác (bẫy); đội thi công có thể đến trước tháng Bảy → July' },
        9: { v: 'Khi hỏi người liên hệ.', t: ['His name is Cliffton Barron.', 'C-L-I-F-F-T-O-N.'], p: 'Tên được đánh vần với hai chữ F → Cliffton' },
        10: { v: 'Cuối bài, số điện thoại.', t: "It's 093036602.", p: 'Số điện thoại của quản lý → 093036602' },
      },
    },
    {
      part: 2, title: 'Melbourne Zoo', audio: 'listening/test 5/Part 2.mp3', cover: 'koala tree | kangaroo zoo',
      fix: [
        ['By the way.\nWe have been planning to parties', 'By the way, we have been planning two parties'],
        ['reopen soon you\'ll be happy', 'reopen soon.\nYou\'ll be happy'], ['so you sure to see', "so you're sure to see"],
        ['We are at the entrance To get there', 'We are at the entrance.\nTo get there'], ['If.\nIf you\'re not up', "If you're not up"],
        ['\nYou now have 30 seconds to', ''],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'What is the new activity in the zoo in November?', ['evening tours', 'bonfire nights for adults', 'various parties'], 'A'],
          [12, 'What is the most popular species in the zoo?', ['kangaroo', 'koala', 'sheepdog'], 'B'],
          [13, 'What is the key to feeding kangaroos?', ['feeding more than one at a time', 'gently touching the baby kangaroos', 'standing up straight when feeding'], 'C'],
          [14, 'Why is the wild dog area closed?', ['The wild dogs are unwell.', 'The enclosure is under repair.', 'The dogs have not arrived.'], 'B'],
          [15, 'Where can visitors get discount tickets this year?', ['at the café', 'on the official website', 'at the gift shop'], 'A'],
        ], 'Questions 11-15'),
        map('Label the map below.\nWrite the correct letter, A-G, next to Questions 16-20.', [[16, 'Arena', 'C'], [17, 'Educational hall', 'E'], [18, 'Picnic spot', 'A'], [19, 'Photo printing shop', 'D'], [20, 'Gift shop', 'B']], { page: 3, box: [80, 323, 410, 547] }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Đầu bài, hoạt động mới tháng 11.', t: ['Anyone who hates getting up early in the morning can now enter the zoo after dinner.', 'Because of the time of year, we are offering a two-hour mini-tour after 7pm.'], p: 'Lửa trại bị cấm, tiệc là chuyện tháng sau (bẫy); hoạt động mới là tour buổi tối sau 7 giờ → A' },
        12: { v: 'Khi nói về con vật được yêu thích nhất.', t: ['Despite what was recently reported in the media the most popular animal around here is not the kangaroo or even the sheepdog.', 'No, our star animal here is without doubt the koala.'], p: 'Không phải chuột túi hay chó chăn cừu mà là gấu koala → B' },
        13: { v: 'Khi nói về cho chuột túi ăn.', t: "And while we have no problems with people feeding them, we always tell our guests that it's important to stand with an upright posture when giving them food.", p: '“Stand with an upright posture” = đứng thẳng khi cho ăn; không được chạm vào con non (loại B) → C' },
        14: { v: 'Khi nói về khu chó hoang.', t: ["You'll be happy to know that our dogs are all fine and in good health and I think they are quite excited about their new home.", 'Right now we are fixing the fences.'], p: 'Chó vẫn khoẻ (loại A); khu đóng cửa vì đang sửa hàng rào → B' },
        15: { v: 'Khi nói về vé giảm giá.', t: 'We used to sell them at the entrance of the zoo as well as on our website, but the website is currently under maintenance, so the coupons are available only at the cafe near the gift shop for this year.', p: 'Website đang bảo trì, cửa hàng quà chỉ là điểm mốc; năm nay chỉ bán ở quán cà phê → A' },
        16: { v: 'Phần sơ đồ, đấu trường.', t: 'To get there cross the bridge and go straight to the end of the path and you\'ll find it to your right.', p: 'Từ lối vào qua cầu, đi hết con đường, ở bên phải → C' },
        17: { v: 'Hội trường giáo dục.', t: ['in the north of the zoo, we have an educational hall ready for you.', "It's easy to find just to the west of the toilets."], p: 'Phía bắc, ngay bên trái (phía tây) nhà vệ sinh → E' },
        18: { v: 'Chỗ dã ngoại.', t: "It's the area surrounding the Botanic Garden, and it's also facing the river.", p: 'Khu bao quanh vườn thực vật, nhìn ra sông → A' },
        19: { v: 'Tiệm in ảnh.', t: ['Some of you may recall that our photo printing site was in the northeastern corner of the zoo.', 'It has now been moved to the building next to the bridge.'], p: 'Góc đông bắc (F) là chỗ cũ (bẫy); nay ở toà nhà cạnh cây cầu → D' },
        20: { v: 'Cửa hàng quà tặng.', t: ["Once you've got your bike, it's only a five-minute ride to the gift shop, and the exit is just beside it."], p: 'Đạp xe theo đường dành cho xe đạp tới cửa hàng quà, ngay cạnh lối ra → B' },
      },
    },
    {
      part: 3, title: 'Maori Carving', audio: 'listening/test 5/Part 3.mp3', cover: 'maori greenstone pendant | maori carving',
      speakers: { 1: 'Amy', 2: 'Amy', 3: 'Mike' },
      fix: [
        ["But the stories behind the tiki's", 'But the stories behind the tikis'],
        ['Or is it to do with size, or where they were made?\nActually,\nMike:\nIt is the ways', 'Or is it to do with size, or where they were made?\nMike:\nActually, it is the ways'],
        ['How nowadays they are produced by machine using lasers even so they have no blemishes in genuine carvings.\nThey aren\'t always perfect because the Mary used simple hand tools.\nFor example, the hole that the court is fed through', 'Nowadays they are produced by machine using lasers, so they have no blemishes.\nGenuine carvings aren\'t always perfect because the Maori used simple hand tools.\nFor example, the hole that the cord is fed through'],
        ['That makes sense.\nActually,\nIt\'s amazing', "That makes sense.\nIt's amazing"],
        ['a hard stone tool something rough to wear', 'a hard stone tool, something rough, to wear'], ['snap it in two I guess', 'snap it in two.\nI guess'],
        ['flat pieces for tikkis.', 'flat pieces for tikis.'], ['Then they started carving,\nMike:', 'Then they started carving?\nMike:'],
        ['rubbed the piece of Greenstone on.\nIt over and over', 'rubbed the piece of greenstone on it over and over'],
        ['They I used plants', 'They used plants'], ['They certainly\nMike:\nWere.', 'Mike:\nThey certainly were.'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Amy and Mike agree that the greenstone tikis', ['take great skill to produce.', 'are fascinating curved shapes.', 'have interesting stories behind them.'], 'A'],
          [22, 'According to Amy, why are so few genuine old tikis found on archaeological dig sites?', ['Not many people know about them.', 'They tend to be stolen by treasure hunters.', 'The majority become inherited items.'], 'C'],
          [23, 'The Maori people considered tikis to be', ['decorative items.', 'religious objects.', 'tribal symbols.'], 'B'],
          [24, 'Tikis are classified into one type or the other by', ['where they originated.', 'the materials used.', 'the position of the body.'], 'C'],
          [25, 'How can modern reproductions be easily distinguished from genuine Maori carvings?', ['The materials differ.', 'They are too regular in shape.', 'They are of different sizes.'], 'B'],
        ], 'Questions 21-25'),
        matching('What tool did the Maori use to carry out each of the following tasks?\nChoose FIVE answers from the box and write the correct letter, A-E, next to Questions 26-30.',
          ['Sandstone block', 'Plant glue', 'Stone scoring tool', 'Bone point', 'Stick drill'], [
            [26, 'creating a blank', 'C'], [27, 'smoothing the surface', 'A'], [28, 'carving details', 'D'], [29, 'making holes', 'E'], [30, 'fixing coloured decorations', 'B'],
          ], { title: 'Traditional Tools and Materials', groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, Amy và Mike nhận xét về tượng tiki.', t: ['I like modern stuff, geometric shapes, but I can see the skill involved in making them.', "It's extremely hard, and it requires expertise and time to shape."], p: 'Mike không thích đường cong (loại B), câu chuyện chỉ Amy thích (loại C); cả hai đồng ý cần nhiều kỹ năng → A' },
        22: { v: 'Khi bàn vì sao hiếm tiki cổ ở khu khảo cổ.', t: ["I believe it's because the owners valued them, and so preserved them.", 'Many of them would have been passed down through the generations and remain in the possession of the families today, like heirlooms.'], p: 'Mike đoán bị trộm (bẫy B); Amy cho rằng chúng được truyền lại qua các thế hệ như của gia truyền → C' },
        23: { v: 'Khi nói về công dụng của tiki.', t: ['I thought they were just an art form or a means of decoration.', 'But Professor Matiu says that the Maori believed tikis were sacred and could be used as a pathway to their ancestors.'], p: 'Trang trí là suy nghĩ ban đầu (bẫy A); người Maori coi tiki là vật linh thiêng → B' },
        24: { v: 'Khi hỏi tiki được chia thành mấy loại.', t: 'Actually, it is the ways that their feet, heads and hands are placed that make the major difference.', p: 'Chất liệu, kích thước, nơi làm đều bị gạt đi; khác biệt là cách đặt chân, đầu, tay = tư thế cơ thể → C' },
        25: { v: 'Khi phân biệt đồ cổ với bản sao hiện đại.', t: ['Nowadays they are produced by machine using lasers, so they have no blemishes.', "Genuine carvings aren't always perfect because the Maori used simple hand tools."], p: 'Đá khác và kích thước nhỏ hơn chỉ là “may” (bẫy A, C); bản sao làm bằng laser nên quá hoàn hảo, đều đặn → B' },
        26: { v: 'Phần quy trình, bước tạo phôi.', t: 'They used a hard stone tool, something rough, to wear a groove into a piece of greenstone.', p: 'Dùng dụng cụ đá cứng khía rãnh rồi bẻ đôi để có phôi → C' },
        27: { v: 'Bước làm phẳng bề mặt.', t: 'but they used a heavy block of sandstone and rubbed the piece of greenstone on it over and over to prepare it for carving.', p: 'Máy chà nhám là cách hiện nay (bẫy); người Maori chà trên khối đá sa thạch → A' },
        28: { v: 'Bước khắc chi tiết.', t: 'Then they also used a piece of sharpened bone made into a point.', p: 'Khắc chi tiết bằng mảnh xương mài nhọn → D' },
        29: { v: 'Bước khoan lỗ.', t: ['Actually, they had a special tool to make holes.', 'It was a stick tied between two heavy pebbles with a point at the end.'], p: 'Xương nhọn không dùng để khoan (bẫy); dụng cụ khoan là que gỗ buộc giữa hai viên sỏi → E' },
        30: { v: 'Bước gắn đồ trang trí màu.', t: 'They were fixed in place using terata gum, a sticky plant resin.', p: 'Gắn bằng nhựa cây dính = keo thực vật → B' },
      },
    },
    {
      part: 4, title: 'Life in the Suburbs', audio: 'listening/test 5/Part 4.mp3', cover: 'suburban houses | london suburb street',
      fix: [
        ['Because of the ever-increasing population.\nThank you can see', 'Because of the ever-increasing population, you can see'],
        ['nightmare.\nI like to know what you doing.\n', 'nightmare.\n'], ['Jack Simmons', 'Jack Simons'], ['Sara Godfrey', 'Sarah Godfrey'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Suburbs', [
          '<strong>People living in the suburbs:</strong>',
          'labour workers, __Q31__',
          '<strong>Advantages of living in the suburbs:</strong>',
          '• Tax and the prices of __Q32__ are low.',
          '• It is easy to start a __Q33__',
          '• Building __Q34__ housing areas to meet the demand of a growing population',
          '• People have more __Q35__ because of wider roads.',
          '<strong>Problem:</strong>',
          '• lack of space for __Q36__ in the suburbs',
        ], { 31: 'wealthy residents/wealthy', 32: 'food', 33: 'business', 34: 'large-scale/large scale', 35: 'mobility', 36: 'trade/trade activities' }, 'Questions 31-36'),
        matching('What does each of the interviewees think of life in the suburbs compared with that in the cities?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 37-40.',
          ['People there are friendlier', 'People there are healthier', 'It is less crowded', 'It is more convenient', 'People there are happier', 'There are some similarities'], [
            [37, 'Jack Simons', 'B'], [38, 'Ellen Simpson', 'C'], [39, 'Robert Gregory', 'F'], [40, 'Sarah Godfrey', 'E'],
          ], { title: 'Comments', groupTitle: 'Questions 37-40' }),
      ],
      expl: {
        31: { v: 'Phần những người sống ở ngoại ô.', t: 'Interestingly, you may also see wealthy residents, most of whom are highly paid engineers, lawyers and doctors, enjoy their life in the suburbs.', p: 'Ngoài công nhân lao động, còn có cư dân giàu có → wealthy residents' },
        32: { v: 'Phần lợi ích, thuế và giá cả.', t: ['For instance, people pay relatively low taxes than people in the city, so they can have a more disposable income.', 'And food is cheaper than those in the cities.'], p: 'Thuế thấp và thực phẩm rẻ hơn → food' },
        33: { v: 'Lợi ích tiếp theo.', t: "Because of lower taxes and other beneficial policies, it's much easier to start one's own business in the suburbs.", p: 'Dễ khởi nghiệp kinh doanh ở ngoại ô → business' },
        34: { v: 'Khi nói về dân số tăng.', t: 'Because of the ever-increasing population, you can see many large scale housing areas constructed in almost all city suburbs', p: 'Xây các khu nhà ở quy mô lớn → large-scale' },
        35: { v: 'Khi nói về đường sá.', t: ['So they are usually much wider than the roads downtown.', 'This will provide greater mobility for suburban residents.'], p: 'Đường rộng hơn giúp đi lại dễ dàng hơn → mobility' },
        36: { v: 'Phần vấn đề của ngoại ô.', t: 'As a result, there were not enough room for trade activities.', p: 'Thiếu chỗ cho hoạt động thương mại → trade' },
        37: { v: 'Phần phỏng vấn, Jack Simons.', t: 'So, he concluded that the suburban folks enjoy a much healthier lifestyle compared with their city counterparts.', p: 'Ít phòng gym (bẫy D) nhưng người ngoại ô vận động nhiều hơn, khoẻ hơn → B' },
        38: { v: 'Ellen Simpson.', t: 'She said the city center was always congested with both cars and people, and she could not stand it anymore.', p: 'Người thành phố vẫn thân thiện (loại A); trung tâm quá đông đúc nên ngoại ô ít đông hơn → C' },
        39: { v: 'Robert Gregory.', t: ['In his opinion, the architectural style in the suburbs is quite the same as that in the city nowadays.', 'Besides, people in the suburban area also pursue goals that are similar to the ones pursued by the people in the city.'], p: 'Kiến trúc và mục tiêu sống giống nhau; người ngoại ô không hài lòng hơn (loại E) → F' },
        40: { v: 'Sarah Godfrey.', t: ['According to her people in cities are not necessarily less friendly than their counterparts in the suburbs, but the latter always smile, they go to the parks and have gatherings more often.', 'These activities are important in improving life quality and the level of happiness.'], p: 'Không phải thân thiện hơn (loại A) mà hay cười, tụ tập nhiều hơn – hạnh phúc hơn → E' },
      },
    },
  ],
};
