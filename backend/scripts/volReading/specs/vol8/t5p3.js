// Vol 8 - READING/Test 5.pdf - Reading Passage 3 (PDF p7–10, text layer). Not in the bank / mini-ielts.
// Key = READING/Key.pdf (Test 5; Q31 read from the screenshot — C). Endings A–F of Q33–35 are an image (typed here).
// Text fixes: "Little Snoopy*" (no footnote in the PDF) → Little Snoopy, misplaced quotes around 'Big Snoopy',
// "duality-stories" → "duality – stories", "18-to 30-month-old" / "six-and seven-year-olds" hyphens, "Into a room" → into.
// Q28 "two-and-a-half-and" → "two-and-a-half- and", Q32 "Deloache" → DeLoache, Q35 "designed to access" → assess.
const { mc, endings, ynng } = require('../../vr_build');
module.exports = {
  vol: 8, test: 5, part: 3, title: 'Understanding symbols', text: 't5p3.txt',
  groups: [
    mc(27, [
      ['In the first paragraph, what did the children in the experiment have to do?', [
        'spot the differences between a real room and a smaller version', 'make a copy of a life-sized room using small furniture',
        'hide a large toy in a tiny room', 'locate a toy in a life-sized room']],
      ['What was the result of the first experiment?', [
        'Both two-and-a-half- and three-year-olds completed the task successfully.', 'Three-year-olds could mentally relate the two rooms they had been shown.',
        'Two-and-a-half-year-olds could relate more closely to the toys as symbols.', 'Two-and-a-half-year-olds had poorer memory than three-year-olds.']],
      ['In the fourth paragraph, what does the writer say about children and pictures?', [
        'Infants are unable to understand that pictures serve a double purpose.', 'Young children may understand pictures more readily than adults.',
        'Infants can understand that a picture of food cannot be eaten.', 'Adults should encourage children to look at pictures from an early age.']],
      ['In the third experiment, what did the writer notice about the reactions of the toddlers?', [
        'They often behaved in an unpredictable way.', 'They were only comfortable performing very familiar tasks.',
        'They became frustrated when they could not achieve a task.', 'They behaved the same whether they were successful or not.']],
      ['What did the experiment involving a mathematical problem suggest about children\'s learning?', [
        'Children are able to understand complex concepts at an early age.', 'Children younger than seven cannot learn using pencil and paper alone.',
        'Using blocks can make it harder for children to learn new concepts.', 'Teachers should try using blocks to teach mathematics to lower level students.']],
      ['What does DeLoache conclude about the results of her and Chong\'s experiment?', [
        'Children\'s books should be more interactive.', '2-D books should contain realistic images.',
        'Simpler books may be better learning tools.', '3-D books help weaker students to progress.']],
    ]),
    endings(33, [
      'that a three-year-old may still expect an image to perform a real task.',
      'how quickly children can learn the alphabet.',
      'the best age for children to begin school.',
      'the effectiveness of symbolic objects as teaching tools.',
      'whether young children are puzzled by pictures.',
      'that young children expect tiny objects to function in the same way as life-sized ones.',
    ], [
      'The test involving 9-month-old babies attempted to find out',
      'The third experiment revealed',
      'The maths experiment was designed to assess',
    ]),
    ynng(36, [
      'The results of the first experiment revealed unexpected information.',
      'Infants react the same way to both drawings and photographs.',
      'Toddlers are used to failing in many of the tasks they try to perform.',
      'The confusion of symbols and real objects has little significance for educational practice.',
      'Children enjoy reading 3-D books more than 2-D books.',
    ]),
  ],
  key: { 27: 'D', 28: 'B', 29: 'A', 30: 'D', 31: 'C', 32: 'C', 33: 'E', 34: 'F', 35: 'D', 36: 'YES', 37: 'NO', 38: 'YES',
    39: 'NO', 40: 'NOT GIVEN' },
  expl: {
    27: ['Ở đoạn đầu, trẻ trong thí nghiệm phải làm gì?', 'Đoạn A',
      '“We then encouraged the child to find ‘Big Snoopy’, a large version of the toy, ‘hiding in the same place in his big room’.”',
      'Trẻ xem giấu con chó nhỏ trong mô hình, rồi phải tìm con chó lớn trong căn phòng thật = tìm đồ chơi trong phòng kích thước thật → D'],
    28: ['Kết quả của thí nghiệm đầu tiên là gì?', 'Đoạn B–C',
      '“The three-year-olds were very successful. After they observed the small toy being placed behind the miniature couch, they ran into the room and found the large toy behind the real couch.”',
      'Trẻ 3 tuổi liên hệ được mô hình với phòng thật; trẻ 2,5 tuổi thất bại dù vẫn nhớ chỗ giấu (nên D sai) → B'],
    29: ['Ở đoạn thứ tư, tác giả nói gì về trẻ em và tranh ảnh?', 'Đoạn D',
      '“The problem stems from the duality inherent in all symbolic objects: they are real in themselves and also representations of something else. A few years ago I became intrigued by anecdotes suggesting that infants do not appreciate this duality”',
      '“duality” = tính hai mặt (vừa là vật thật vừa đại diện cho vật khác) = double purpose; trẻ sơ sinh không hiểu điều này → A'],
    30: ['Ở thí nghiệm thứ ba, tác giả nhận thấy gì về phản ứng của trẻ?', 'Đoạn G',
      '“Interestingly, most of the children showed little or no reaction to their failed attempts.”',
      'Trẻ gần như không phản ứng khi thất bại = cư xử như nhau dù thành công hay không; không bực bội (C sai) → D'],
    31: ['Thí nghiệm bài toán gợi ý gì về việc học của trẻ?', 'Đoạn G–H',
      '“if young children do not understand the relation between an object and what it represents, this could be counterproductive.” … “Both groups learned to solve the problems equally well, but the group using blocks took three times as long to do so.”',
      'Nhóm dùng khối gỗ mất gấp ba thời gian = dùng khối gỗ làm việc học khái niệm mới khó hơn → C'],
    32: ['DeLoache kết luận gì về kết quả thí nghiệm của bà và Chong?', 'Đoạn J',
      '“Presumably, the children could concentrate more easily with the plain 2-D book … Less may be more when it comes to educational books for young children.”',
      '“Less may be more” = sách đơn giản hơn có thể là công cụ học tốt hơn → C'],
    33: ['Bài kiểm tra với trẻ 9 tháng tuổi nhằm tìm hiểu', 'Đoạn E',
      '“We began testing infants’ understanding of pictures by putting a book of highly realistic colour photographs of individual objects in front of nine-month-olds.”',
      'Kiểm tra trẻ 9 tháng hiểu tranh ảnh thế nào (trẻ sờ, cào tranh vì bối rối) = liệu trẻ có bối rối trước tranh ảnh → E'],
    34: ['Thí nghiệm thứ ba cho thấy', 'Đoạn G',
      '“Then we secretly replaced each object with an identical miniature version. Most children attempted to perform the same actions with the miniature items that they had with the larger ones.”',
      'Trẻ cố ngồi lên ghế tí hon, chui vào ô tô tí hon = mong đồ vật nhỏ hoạt động như đồ kích thước thật → F'],
    35: ['Thí nghiệm toán được thiết kế để đánh giá', 'Đoạn G',
      '“Teachers everywhere use blocks or other objects to represent numerical quantity. However, if young children do not understand the relation between an object and what it represents, this could be counterproductive. To demonstrate this, we taught six- and seven-year-olds a difficult subtraction problem using blocks.”',
      'Khối gỗ là vật biểu tượng dùng để dạy; thí nghiệm kiểm tra chúng có hiệu quả không → D'],
    36: ['Kết quả thí nghiệm đầu tiên tiết lộ thông tin bất ngờ.', 'Đoạn A, C',
      '“About 20 years ago I had one of those wonderful moments when research takes an unexpected but fruitful turn.”',
      'Nghiên cứu trí nhớ bất ngờ trở thành nghiên cứu về hiểu biểu tượng (“unexpected but fruitful turn”) → YES'],
    37: ['Trẻ sơ sinh phản ứng giống nhau với cả tranh vẽ và ảnh chụp.', 'Đoạn E',
      '“However, when depicted objects bear little resemblance to the real thing – as in a black and white drawing – infants rarely explore them.”',
      'Với ảnh màu thật, mọi trẻ đều sờ/cào; với tranh vẽ trắng đen, trẻ hiếm khi khám phá → phản ứng khác nhau → NO'],
    38: ['Trẻ mới biết đi đã quen với việc thất bại ở nhiều việc chúng cố làm.', 'Đoạn G',
      '“We think this probably reflects the fact that toddlers’ daily lives are full of unsuccessful attempts to do one thing or another.”',
      '“full of unsuccessful attempts” = quen với thất bại → YES'],
    39: ['Việc nhầm lẫn giữa biểu tượng và vật thật ít có ý nghĩa đối với thực tiễn giáo dục.', 'Đoạn G',
      '“This confusion has implications for educational practice.”',
      'Tác giả nói sự nhầm lẫn này có hệ quả đối với giáo dục → trái với “little significance” → NO'],
    40: ['Trẻ thích đọc sách 3-D hơn sách 2-D.', 'Đoạn I–J',
      '“The children using the traditional book subsequently recognised more letters than those using the 3-D book.”',
      'Bài chỉ so sánh kết quả học chữ, không nói trẻ thích loại sách nào hơn → NOT GIVEN'],
  },
};
