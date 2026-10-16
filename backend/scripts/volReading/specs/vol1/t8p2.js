// Vol 1 - Test 8 - Reading Passage 2 (PDF p10–15). Same text as the bank's "Water Filter" (mini-ielts, Passage 1, Q1–13) but a
// different question set (flow-chart with 6 blanks in another layout, TFNG in another order, other MC) → seeded as its own
// Passage 2 with the Vol title; text taken from the bank copy (already cleaned; OCR of the PDF agrees except typos).
// Key fixes: the printed TFNG key 20–23 "F T NG NG" is the bank question order's key (half-hour/clay/coffee/E-coli) left
// unchanged after Vol 1 reordered the statements → by the passage: 20 TRUE (clay "too fine"), 21 NOT GIVEN, 22 FALSE
// (700° in half an hour), 23 NOT GIVEN. Q25 printed D ("100 per cent clay" — the filters need organic material) → B
// (walls as thick as an adult's index finger).
const { notes, tfng, mc } = require('../../vr_build');
module.exports = {
  vol: 1, test: 8, part: 2, title: 'New filter promises clean water for millions', text: 't8p2.txt',
  groups: [
    notes(14, 19, [
      'Making the mixture for the filter from organic material (e.g. tea, coffee, rice), __Q14__ and __Q15__',
      '↓',
      'Shape into pots and place them in a fire made from __Q16__ and __Q17__',
      '↓',
      'Fuel the fire to reach a maximum heat of __Q18__',
      '↓',
      'Remove the filters from the fire',
      '↓',
      'Bake the filters in the fire for a maximum period of __Q19__',
    ], { title: 'Step-by-step guide to making Flynn’s water filters', instruction: 'Complete the flow-chart below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 14–19 on your answer sheet.' }),
    tfng(20, [
      'The clay in the Manatuto project was initially unsuitable for the project’s purpose.',
      'Coffee grounds produce filters that are twice as efficient as those using other organic materials.',
      'It takes half an hour for a cow-manure fire to reach 950 degrees.',
      'E-coli is the most difficult bacterium to remove from water by filtration.',
    ]),
    mc(24, [
      ['The Manatuto project aimed to set up a', ['charitable trust.', 'filtration experiment.', 'water filter factory.', 'community kiln.']],
      ['To be effective, the Flynn filters must', ['remove all dangerous pathogens.', 'be a particular thickness.', 'filter water as quickly as possible.', 'be made from 100 per cent clay.']],
      ['Flynn does not intend to patent his filter because he', ['wants it to be freely available.', 'has produced a very simple design.', 'cannot make a profit in poor countries.', 'has already given the idea to a charity.']],
    ]),
  ],
  free: ['950'],
  key: { 14: 'clay', 15: 'water', 16: 'straw', 17: 'cow manure / manure', 18: '950 degrees / 950', 19: '60 minutes',
    20: 'TRUE', 21: 'NOT GIVEN', 22: 'FALSE', 23: 'NOT GIVEN', 24: 'C', 25: 'B', 26: 'A' },
  expl: {
    14: ['Trộn hỗn hợp làm lõi lọc từ chất hữu cơ (bã trà, bã cà phê, vỏ trấu), ______ và ______', 'Đoạn C',
      '“Take a handful of dry, crushed clay, mix it with a handful of organic material, such as used tea leaves, coffee grounds or rice hulls, add enough water to make a stiff biscuit-like mixture”',
      'Hỗn hợp gồm đất sét + chất hữu cơ + nước. Chỗ trống 14 → clay'],
    15: ['(tiếp câu 14) … và ______', 'Đoạn C',
      '“add enough water to make a stiff biscuit-like mixture”',
      'Thành phần còn lại của hỗn hợp là nước → water'],
    16: ['Nặn thành bình rồi đặt vào đống lửa làm từ ______ và ______', 'Đoạn C',
      '“Next, surround the pots with straw; put them in a mound of cow manure, light the straw and then top up the burning manure as required.”',
      'Lửa được đốt từ rơm bao quanh bình → straw'],
    17: ['(tiếp câu 16) … và ______', 'Đoạn C',
      '“put them in a mound of cow manure, light the straw and then top up the burning manure as required.”',
      'Nhiên liệu chính là phân bò → cow manure'],
    18: ['Tiếp nhiên liệu để lửa đạt nhiệt độ tối đa ______', 'Đoạn C',
      '“the fuel can reach a temperature of 700 degrees in half an hour and will be up to 950 degrees after another 20 to 30 minutes.”',
      '“up to 950 degrees” = nhiệt độ tối đa → 950 degrees'],
    19: ['Nung lõi lọc trong lửa tối đa ______', 'Đoạn C',
      '“In less than 60 minutes the filters are finished.”',
      '“less than 60 minutes” = tối đa 60 phút → 60 minutes'],
    20: ['Đất sét ở dự án Manatuto ban đầu không phù hợp với mục đích của dự án.', 'Đoạn G',
      '“initial research found the local clay to be too fine — a problem solved by the addition of organic material.”',
      'Nghiên cứu ban đầu thấy đất sét địa phương quá mịn, phải thêm chất hữu cơ mới dùng được = ban đầu không phù hợp. (Key in của đề ghi FALSE — đó là key của thứ tự câu cũ.) → TRUE'],
    21: ['Bã cà phê cho ra lõi lọc hiệu quả gấp đôi so với các chất hữu cơ khác.', 'Đoạn C',
      '“According to Mr. Flynn, used coffee grounds have given the best results to date.”',
      'Bài chỉ nói bã cà phê cho kết quả tốt nhất, không so sánh “gấp đôi”. (Key in ghi TRUE.) → NOT GIVEN'],
    22: ['Lửa đốt bằng phân bò mất nửa giờ để đạt 950 độ.', 'Đoạn C',
      '“the fuel can reach a temperature of 700 degrees in half an hour and will be up to 950 degrees after another 20 to 30 minutes.”',
      'Nửa giờ mới đạt 700 độ; phải thêm 20–30 phút nữa mới lên 950 độ. (Key in ghi NOT GIVEN.) → FALSE'],
    23: ['E-coli là vi khuẩn khó lọc khỏi nước nhất.', 'Đoạn F',
      '“Tests with the deadly E-coli bacterium have seen the filters remove 96.4 to 99.8 per cent of the pathogen”',
      'Bài chỉ nói lõi lọc loại được 96,4–99,8% E-coli, không so sánh độ khó với vi khuẩn khác → NOT GIVEN'],
    24: ['Dự án Manatuto nhằm thành lập một …', 'Đoạn G',
      '“The charity wanted to help set up a small industry manufacturing water filters”',
      '“a small industry manufacturing water filters” = xưởng sản xuất lõi lọc nước → C'],
    25: ['Để có hiệu quả, lõi lọc của Flynn phải …', 'Đoạn C + F',
      '“The walls of the finished pot should be about as thick as an adult’s index finger.”',
      'Thành bình phải dày khoảng bằng ngón trỏ người lớn = có độ dày nhất định. A sai (lọc 96,4–99,8%, không phải tất cả), C sai (lọc 1 lít mất 2 giờ), D sai (phải trộn chất hữu cơ). (Key in ghi D.) → B'],
    26: ['Flynn không định đăng ký bằng sáng chế vì ông …', 'Đoạn G',
      '“with no plans to patent his idea, there will be no legal obstacles to it being adopted in any community that needs it. “Everyone has a right to clean water”',
      'Ông muốn mọi cộng đồng đều có thể dùng mà không vướng rào cản pháp lý = muốn nó được dùng tự do → A'],
  },
};
