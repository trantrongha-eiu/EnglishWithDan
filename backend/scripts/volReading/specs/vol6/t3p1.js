// Vol 6 - Read/R-TEST 3.pdf - Reading Passage 1 (PDF p1–4). Not in the bank / mini-ielts. Text = Full Reading.docx, checked
// against the PDF. The scan itself is garbled in three places (lines of other paragraphs pasted in): "spent most of their
// lives animals" → "lives hunting animals" (docx; = key Q1); "worked together to build themselves and worked together to
// build then" → "to build these systems" (docx); "observed in Africa be left unplanted, or fallow. This system preserved
// nutrients in the soil. So, and Asia, and Europe. By 2,000 years ago much of the them to land in Earth's population" →
// "observed in Africa, Asia, and Europe. By 2,000 years ago much of the Earth's population" (= key Q7). Notes Q2–3 print
// "people started to domesticate various types of animals" twice → the Q3 line reads "creation of a ___ – led to the
// exchange of goods…". Key = Read/expl 1-4.pdf, checked against the passage: all correct (the key calls the passage
// "Farming in the ancient world" = the notes title).
const { tfng, notes } = require('../../vr_build');
module.exports = {
  vol: 6, test: 3, part: 1, title: 'The growth of agriculture', text: 't3p1.txt',
  free: ['civilizations', '2000'],
  groups: [
    notes(1, 7, [
      '• prehistoric times – people collected wild plants, and __Q1__ to get meat',
      '• 11,500 years ago – people began growing crops, probably __Q2__, e.g. rice or corn – people started to domesticate various types of animals',
      '• creation of a __Q3__ – led to the exchange of goods and the beginnings of trade, which resulted in the emergence of cities and the growth of __Q4__',
      '• farmers gradually began using better __Q5__ made from different materials',
      '• systems of providing fields with a supply of __Q6__ were invented in Mesopotamia',
      '• __Q7__ years ago, a large proportion of people worldwide had become dependent on farming',
    ], { title: 'Farming in the ancient world',
      instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 1–7 on your answer sheet.' }),
    tfng(8, [
      'The Romans adapted their own farming methods for use in Africa and Asia.',
      'The medieval open-field system increased food production by allowing European farmers to have crops growing continuously in all their fields.',
      'European eating habits changed as a result of international exploration in the 15th and 16th centuries.',
      'During the 18th century many European countries created their own versions of the seed drill.',
      'Selective breeding methods helped European farmers to produce more animals.',
      'Many farmers continued to use natural methods of fertilising their land, even after the development of chemical fertilisers.',
    ]),
  ],
  key: { 1: 'hunting', 2: 'cereals', 3: 'surplus', 4: 'civilisations / civilizations', 5: 'tools', 6: 'water', 7: '2,000 / 2000',
    8: 'FALSE', 9: 'FALSE', 10: 'TRUE', 11: 'NOT GIVEN', 12: 'TRUE', 13: 'NOT GIVEN' },
  expl: {
    1: ['Thời tiền sử – con người hái lượm cây dại và ______ để có thịt.', 'Đoạn 2',
      '“prehistoric people spent most of their lives hunting animals and gathered wild plants.”',
      'Săn bắt động vật (hunting animals) là cách có thịt → hunting'],
    2: ['11.500 năm trước – con người bắt đầu trồng trọt, có lẽ là ______, ví dụ lúa gạo hoặc ngô.', 'Đoạn 2',
      '“The earliest crop was most likely to have been rice, corn, or similar types of cereals.”',
      '“most likely” = probably; lúa gạo, ngô là các loại ngũ cốc → cereals'],
    3: ['Việc tạo ra ______ – dẫn tới trao đổi hàng hóa và sự khởi đầu của thương mại.', 'Đoạn 3',
      '“Agriculture enabled people to produce a surplus of food which could be eaten when crops failed or swapped for other goods. This exchange of goods was how trade began”',
      'Lương thực dư thừa được đem đổi lấy hàng khác → thương mại ra đời → surplus'],
    4: ['… dẫn đến sự xuất hiện của các thành phố và sự phát triển của ______.', 'Đoạn 3',
      '“This development was so successful in some areas that cities emerged, and eventually entire civilisations arose.”',
      '“cities emerged” = the emergence of cities; “entire civilisations arose” = the growth of civilisations → civilisations'],
    5: ['Nông dân dần dần dùng ______ tốt hơn làm từ nhiều vật liệu khác nhau.', 'Đoạn 3',
      '“However, over time, improved farming tools of bone, stone, bronze, and iron were developed.”',
      '“improved farming tools of bone, stone, bronze, and iron” = better tools made from different materials → tools'],
    6: ['Hệ thống cung cấp ______ cho đồng ruộng được phát minh ở Lưỡng Hà.', 'Đoạn 3',
      '“Around 7,500 years ago, farmers in Mesopotamia developed simple irrigation systems. By channeling water from streams onto their fields”',
      'Hệ thống thủy lợi dẫn nước từ suối vào ruộng = providing fields with a supply of water → water'],
    7: ['______ năm trước, phần lớn dân số thế giới đã phụ thuộc vào nông nghiệp.', 'Đoạn 3',
      '“By 2,000 years ago much of the Earth\'s population was reliant on agriculture.”',
      '“much of the Earth\'s population was reliant on agriculture” = a large proportion of people worldwide had become dependent on farming → 2,000'],
    8: ['Người La Mã điều chỉnh phương pháp canh tác của chính họ để dùng ở châu Phi và châu Á.', 'Đoạn 3',
      '“As the Roman empire expanded, the Romans adapted the best agricultural methods of the people they conquered. They even wrote manuals about the farming techniques they observed in Africa, Asia, and Europe.”',
      'Người La Mã tiếp thu phương pháp của các dân tộc bị chinh phục (ở châu Phi, châu Á…), không phải đem phương pháp của mình áp dụng ở đó → FALSE'],
    9: ['Hệ thống ruộng mở thời trung cổ tăng sản lượng nhờ cho phép nông dân trồng liên tục trên tất cả các ruộng.', 'Đoạn 4',
      '“one field would be planted in spring, another in autumn, and one would be left unplanted, or fallow. This system preserved nutrients in the soil, so increasing crop production.”',
      'Luôn có một ruộng bỏ hoang (fallow) → không phải tất cả ruộng đều có cây trồng liên tục → FALSE'],
    10: ['Thói quen ăn uống của người châu Âu thay đổi nhờ các chuyến thám hiểm quốc tế thế kỷ 15–16.', 'Đoạn 4',
      '“Later in the 15th and 16th centuries, explorers travelling to Africa, Asia and the Americas began to introduce new varieties of plants into Europe.” … “which eventually became staple crops and an integral part of the European diet.”',
      'Khoai tây, cà chua, ngô, đậu do các nhà thám hiểm mang về thành một phần không thể thiếu của bữa ăn châu Âu → TRUE'],
    11: ['Trong thế kỷ 18 nhiều nước châu Âu tự tạo ra phiên bản máy gieo hạt của riêng mình.', 'Đoạn 5',
      '“By the end of the 18th century, seed drilling was widely practiced in many countries across Europe.”',
      'Bài chỉ nói việc gieo bằng máy phổ biến ở nhiều nước, không nói các nước có tự chế phiên bản riêng hay không → NOT GIVEN'],
    12: ['Phương pháp lai tạo chọn lọc giúp nông dân châu Âu có thêm nhiều gia súc.', 'Đoạn 6',
      '“By selectively breeding their livestock … farmers increased both the size of their herds and the productivity of their livestock.”',
      '“increased … the size of their herds” = produce more animals → TRUE'],
    13: ['Nhiều nông dân vẫn tiếp tục bón phân tự nhiên ngay cả sau khi phân hóa học ra đời.', 'Đoạn 7',
      '“For thousands of years, farmers had relied on natural fertiliser” … “This led to the manufacture of chemical fertilisers based on nitrates and phosphates, which greatly increased crop yields.”',
      'Bài không nói sau khi có phân hóa học nông dân có còn dùng phân tự nhiên hay không → NOT GIVEN'],
  },
};
