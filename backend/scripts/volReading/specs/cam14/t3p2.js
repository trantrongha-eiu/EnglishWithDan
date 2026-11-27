// Cambridge IELTS 14 - Test 3 - Passage 2. Source: ieltsworldly.com, checked against the book key. Text fix: "where the occupy" → they.
const { matching, multi, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 3, part: 2, title: 'Saving bugs to find new drugs', text: 't3p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], [
      'mention of factors driving a renewed interest in natural medicinal compounds',
      'how recent technological advances have made insect research easier',
      'examples of animals which use medicinal substances from nature',
      'reasons why it is challenging to use insects in drug research',
      'reference to how interest in drug research may benefit wildlife',
      'a reason why nature-based medicines fell out of favour for a period',
      'an example of an insect-derived medicine in use at the moment',
    ], { instruction: 'Reading Passage 2 has nine paragraphs, A–I. Which paragraph contains the following information? Write the correct letter, A–I, in boxes 14–20 on your answer sheet.' }),
    multi(21, 2, 'Which TWO of the following make insects interesting for drug research?', [
      'the huge number of individual insects in the world',
      'the variety of substances insects have developed to protect themselves',
      'the potential to extract and make use of insects’ genetic codes',
      'the similarities between different species of insect',
      'the manageable size of most insects',
    ]),
    notes(23, 26, [
      'Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in __Q23__ when undertaking bioprospecting with insects. They are especially interested in the compounds that insects produce to overpower and preserve their __Q24__. They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their __Q25__. Piper hopes that these substances will be useful in the development of drugs such as __Q26__.',
    ], { title: 'Research at Aberystwyth University', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'C', 15: 'H', 16: 'A', 17: 'F', 18: 'I', 19: 'B', 20: 'E', 21: 'B', 22: 'C', 23: 'ecology', 24: 'prey', 25: 'habitats', 26: 'antibiotics' },
  expl: {
    14: ['Nhắc tới các yếu tố thúc đẩy sự quan tâm trở lại với hợp chất tự nhiên.', 'Đoạn C', '“This realization, together with several looming health crises, such as antibiotic resistance, has put bioprospecting … firmly back on the map.”',
      'Khả năng khai thác hệ gen và khủng hoảng kháng kháng sinh khiến việc tìm hợp chất tự nhiên được quan tâm lại → C'],
    15: ['Tiến bộ công nghệ gần đây giúp nghiên cứu côn trùng dễ hơn.', 'Đoạn H', '“it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds and insert them into cell lines”',
      'Cắt đoạn DNA cho vào dòng tế bào để sản xuất nhiều hơn → H'],
    16: ['Ví dụ các loài động vật dùng chất làm thuốc từ thiên nhiên.', 'Đoạn A', '“such as the capuchin monkeys who rub themselves with toxin-oozing millipedes to deter mosquitoes”', 'Khỉ capuchin, tinh tinh tự chữa bằng thứ có trong tự nhiên → A'],
    17: ['Lý do khó dùng côn trùng trong nghiên cứu thuốc.', 'Đoạn F', '“insects are generally very small, and the glands inside them that secrete potentially useful compounds are smaller still.”', 'Quá nhiều loài, quá nhỏ, khó nuôi → F'],
    18: ['Nhắc tới việc quan tâm nghiên cứu thuốc có thể có lợi cho thế giới hoang dã.', 'Đoạn I', '“my main motivation for looking at insects in this way is conservation.”', 'Động lực chính là bảo tồn; giúp người ta thấy giá trị của thiên nhiên → I'],
    19: ['Lý do thuốc từ tự nhiên bị lãng quên một thời gian.', 'Đoạn B', '“The main cause of this shift is that although there are plenty of promising chemical compounds in nature, finding them is far from easy.”', 'Tìm hợp chất trong tự nhiên rất khó nên chuyển sang phòng thí nghiệm → B'],
    20: ['Ví dụ thuốc từ côn trùng đang được sử dụng.', 'Đoạn E', '“alloferon, an antimicrobial compound produced by blow fly larvae, is used as an antiviral and antitumor agent in South Korea and Russia.”', 'Alloferon từ ấu trùng ruồi đang được dùng → E'],
    21: ['Hai điều khiến côn trùng thú vị với nghiên cứu thuốc.', 'Đoạn D', '“something which has driven the evolution of an enormous range of very interesting compounds for defensive and offensive purposes.”',
      'Nhiều hợp chất để tự vệ (B) và khả năng tách mã gen để sản xuất (C, đoạn H). A sai: số lượng lớn chỉ là vài loài phổ biến; E sai: côn trùng quá nhỏ. Hai đáp án là B và C → B'],
    22: ['Hai điều khiến côn trùng thú vị với nghiên cứu thuốc.', 'Đoạn H', '“it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds”', 'Khai thác mã gen của côn trùng (C) cùng với B. Hai đáp án là B và C → C'],
    23: ['Nhóm ở ĐH Aberystwyth dùng chuyên môn về ___.', 'Đoạn G', '“we use our knowledge of ecology as a guide to target our efforts.”', 'Kiến thức sinh thái học → ecology'],
    24: ['Hợp chất côn trùng tiết ra để khuất phục và bảo quản ___.', 'Đoạn G', '“secrete powerful poison for subduing prey and keeping it fresh for future consumption.”', '“subduing” = overpower; “keeping it fresh” = preserve; con mồi → prey'],
    25: ['Hợp chất giúp chống vi khuẩn, nấm có trong ___ của chúng.', 'Đoạn G', '“masters of exploiting filthy habitats, such as faeces and carcasses”', 'Môi trường sống bẩn → habitats'],
    26: ['Piper hy vọng các chất này giúp phát triển thuốc như ___.', 'Đoạn G', '“can serve as or inspire new antibiotics.”', 'Thuốc kháng sinh mới → antibiotics'],
  },
};
