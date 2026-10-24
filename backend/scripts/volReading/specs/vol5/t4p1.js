// Vol 5 - Reading/Test 4/Test 4- up.pdf - Reading Passage 1 (PDF p1–3). Not in the bank / mini-ielts (the online "History of
// the Pencil" passages are a different text). Text = PDF (typed, clean OCR). PDF (and the key file) lose words in paragraph 1:
// "discovered large uprooted tree … an unknown black substance which we now easily, was slightly shiny" → ADDED "a" and "know as
// graphite. It crumbled" (no online copy of this version found; nothing tested there except Q1 "tree"). Typos fixed: "pencil
// start", "the Lake. District", "3, 500", "Pencil manufactures" → manufacturers, broken sentence stops. Key =
// Test 4/Explanation -4.pdf. KEY FIX: Q9 Vol NOT GIVEN → FALSE ("Adding more clay … harder, sharper, and more precise … More
// graphite helped make a pencil mark that was softer, thicker and darker" — darkness comes from graphite, not clay); the Vol key
// is still accepted. Rest correct.
const { notes, tfng } = require('../../vr_build');
module.exports = {
  vol: 5, test: 4, part: 1, title: 'The history of the Pencil', text: 't4p1.txt',
  groups: [
    notes(1, 6, [
      '• Graphite was first found below a __Q1__ blown down in a storm.',
      '• The first use of graphite was to make marks on __Q2__.',
      '• The characteristics of raw graphite:',
      '– dirty to use because it is so __Q3__',
      '– originally wrapped in __Q4__ or animal skin to make it useable as a pencil.',
      '• Graphite came to the notice of the government for military and commercial purposes.',
      '– The government completely took over the __Q5__ at Borrowdale.',
      '– They employed guards to protect the graphite on its journey south.',
      '• Local people began to __Q6__ graphite for the money involved.',
      '– The government passed a law to protect the graphite industry.',
    ], { title: 'The early history of graphite in Britain',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 1–6 on your answer sheet.' }),
    tfng(7, [
      'The Italians were the first to make pencils out of wood.',
      'The Germans used different types of wood to produce pencils.',
      'More clay in a pencil makes it write more darkly.',
      'After the HB code was introduced, it very quickly became used by all manufacturers.',
      'English pencil factories have now all closed down.',
      'American astronauts used pencils on their early journeys into space.',
      'The use of graphite pencils is unlikely to continue into the future.',
    ]),
  ],
  key: { 1: 'tree', 2: 'sheep', 3: 'soft', 4: 'rope', 5: 'mines', 6: 'steal', 7: 'TRUE', 8: 'NOT GIVEN', 9: 'FALSE / NOT GIVEN',
    10: 'NOT GIVEN', 11: 'FALSE', 12: 'TRUE', 13: 'FALSE' },
  expl: {
    1: ['Graphite lần đầu được tìm thấy bên dưới một ______ bị bão quật đổ.', 'Đoạn 1',
      '“locals in the village of Borrowdale discovered a large uprooted tree. Underneath the tree lay an unknown black substance”',
      '“uprooted tree” = bị bật gốc (blown down); “underneath” = below → tree'],
    2: ['Công dụng đầu tiên của graphite là đánh dấu lên ______.', 'Đoạn 2',
      '“Initially, the local farmers used the newly discovered material as a handy way to identify their sheep.”',
      '“Initially … identify their sheep” = first use … make marks on sheep → sheep'],
    3: ['Bẩn khi dùng vì nó quá ______.', 'Đoạn 2',
      '“When it was untreated the material was very soft, which meant that it was messy to handle.”',
      '“messy to handle” = dirty to use; nguyên nhân “very soft” → soft'],
    4: ['Ban đầu được bọc trong ______ hoặc da động vật để dùng làm bút chì.', 'Đoạn 2',
      '“people enclosed a thin core of the substance in stiff sheep hides or rope.”',
      '“sheep hides” = animal skin; vế còn lại → rope'],
    5: ['Chính phủ nắm toàn bộ ______ ở Borrowdale.', 'Đoạn 3',
      '“the government quickly realised the commercial potential of the graphite at Borrowdale, and assumed control of all the mines there”',
      '“assumed control of all the mines” = completely took over the mines → mines'],
    6: ['Người dân địa phương bắt đầu ______ graphite vì giá trị của nó.', 'Đoạn 3',
      '“The graphite was so valuable that the locals, who called it wadd, started to steal it. As a deterrent, an act of parliament in 1752 made this offence punishable by time in prison.”',
      '“so valuable” = for the money involved; “started to steal it” → steal'],
    7: ['Người Ý là những người đầu tiên làm bút chì bằng gỗ.', 'Đoạn 4',
      '“The Italians originally invented the wooden casing to hold a thin rod of plumbago firmly in place for ease of writing.”',
      '“originally invented the wooden casing” = first to make pencils out of wood → TRUE'],
    8: ['Người Đức dùng nhiều loại gỗ khác nhau để sản xuất bút chì.', 'Đoạn 4',
      '“The Germans took this technique and developed it further by applying mass-production techniques to pencils.”',
      'Người Đức chỉ áp dụng sản xuất hàng loạt; bài không nói về các loại gỗ họ dùng → NOT GIVEN'],
    9: ['Bút chì có nhiều đất sét hơn thì viết đậm hơn.', 'Đoạn 4',
      '“Adding more clay to the mixture helped make the pencil harder, sharper, and more precise in its mark. More graphite helped make a pencil mark that was softer, thicker and darker.”',
      'Thêm đất sét → cứng, nét sắc; thêm graphite mới → đậm hơn. Câu gán độ đậm cho đất sét là ngược với bài. (Key Vol ghi NOT GIVEN — vẫn được chấp nhận.) → FALSE'],
    10: ['Sau khi mã HB ra đời, nó nhanh chóng được mọi nhà sản xuất dùng.', 'Đoạn 5',
      '“Pencil manufacturers all over the world still use this so-called HB grading system today.”',
      'Bài chỉ nói ngày nay vẫn dùng khắp thế giới; không nói mức độ nhanh chóng khi mới ra đời → NOT GIVEN'],
    11: ['Các xưởng bút chì ở Anh nay đều đã đóng cửa.', 'Đoạn 6',
      '“England\'s pencil industry continues to thrive in the nearby town of Keswick.”',
      'Ngành bút chì Anh vẫn “thrive” (phát triển) ở Keswick → FALSE'],
    12: ['Phi hành gia Mỹ dùng bút chì trong những chuyến bay đầu tiên vào vũ trụ.', 'Đoạn 7',
      '“In actual fact, both American and Russian astronauts were equipped with pencils in their respective country\'s first space flights.”',
      '“equipped with pencils in … first space flights” → TRUE'],
    13: ['Việc dùng bút chì graphite khó có thể tiếp tục trong tương lai.', 'Đoạn 7',
      '“pencils remain in use in every classroom … And there is nothing to suggest that we are likely to invent anything better than graphite to use in our pencils.”',
      'Bút chì vẫn được dùng khắp nơi và khó có gì thay thế graphite → sẽ còn tiếp tục → FALSE'],
  },
};
