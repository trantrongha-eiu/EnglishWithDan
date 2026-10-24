// Vol 6 - Read/R-TEST 3.pdf - Reading Passage 2 (PDF p5–9). Not in the bank / mini-ielts; no online copy found. Text =
// Full Reading.docx, checked against the PDF. Two gaps in the printed text filled minimally: E "And perhaps some it was the
// shape" → "some realised it was"; F "the key forces involved in flight, lift, drag and thrust" (then "these four forces") →
// "involved in flight - weight, lift, drag and thrust". Key = Read/expl 1-4.pdf, checked against the passage:
// Q25–26 Vol B, E → C, E: B ("understood how to design aeroplane engines 50 years before the Wrights") is not stated — the
// half-century wait was because "you need both power and control"; C is stated ("analyses of what shapes and angles
// produced the greatest lift").
const { headings, notes, multi } = require('../../vr_build');
module.exports = {
  vol: 6, test: 3, part: 2, title: 'The aerofoil', text: 't3p2.txt',
  groups: [
    headings(14, [
      'The earliest attempts to achieve human flight',
      'Public reaction to the pioneers of flight',
      'A practical demonstration of an aeronautical principle',
      'The importance of angles in achieving lift',
      'A misunderstanding about the nature of air',
      'The discovery of several key factors affecting wing design',
      'Additional wing features that help control flight',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'], {
      instruction: 'Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–vii, in boxes 14–19 on your answer sheet.' }),
    notes(20, 24, [
      'Hang-gliders, microlights, small planes and birds share the same wing shape - a curve which provides the maximum amount of __Q20__. But while these wings can support an individual person, they cannot support the weight of a huge aircraft. In fact, the enormous wings of a modern plane look like a thin __Q21__ when viewed from the side. Space is not wasted because the __Q22__ needed to power a flight is kept inside each wing. The pilot can adjust the __Q23__ which are located at the __Q24__ of the wings. This changes the aerofoil\'s curvature as well as the angle of attack and causes the plane to rise or descend.',
    ], { title: 'Designing aeroplane wings',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 20–24 on your answer sheet.' }),
    multi(25, 2, 'Which TWO things does the writer state about George Cayley?', [
      'He made a lot of money from his inventions.',
      'He understood how to design aeroplane engines 50 years before Orville and Wilbur Wright.',
      'His studies included how to achieve the maximum lift.',
      'He worked closely with other scientists.',
      'He reached his conclusions by conducting a series of tests.',
    ]),
  ],
  key: { 14: 'v', 15: 'iii', 16: 'iv', 17: 'vii', 18: 'i', 19: 'vi', 20: 'lift', 21: 'teardrop', 22: 'fuel', 23: 'flaps',
    24: 'rear', 25: 'C', 26: 'E' },
  expl: {
    14: ['Paragraph A — chọn tiêu đề.', 'Đoạn A',
      '“It seems like magic because our all-too-literal brains tell us that because air is invisible it must be insubstantial too. But air is not nothing; air is a substance completely comprised of gases.”',
      'Bộ não hiểu sai rằng không khí vô hình thì không có thực chất = a misunderstanding about the nature of air → v'],
    15: ['Paragraph B — chọn tiêu đề.', 'Đoạn B',
      '“To really see why, it is worth carrying out an experiment with knives and spoons under a running tap.”',
      'Thí nghiệm với dao, thìa dưới vòi nước minh họa nguyên lý luồng khí quanh cánh = a practical demonstration of an aeronautical principle → iii'],
    16: ['Paragraph C — chọn tiêu đề.', 'Đoạn C',
      '“This depends on the angle that the aerofoil moves through the air - its angle of attack; the steeper the angle, the greater the lift.”',
      'Đoạn C giải thích lực nâng phụ thuộc góc tấn (angle of attack) = the importance of angles in achieving lift → iv'],
    17: ['Paragraph D — chọn tiêu đề.', 'Đoạn D',
      '“There are also flaps on the rear of the wings that can be swung up or down to alter the aerofoil curvature and its effective angle of attack and so allow the pilot to climb or descend.”',
      '“also flaps” = additional wing features; “allow the pilot to climb or descend” = help control flight → vii'],
    18: ['Paragraph E — chọn tiêu đề.', 'Đoạn E',
      '“Countless thinkers in the distant past must have marvelled at birds gliding through the sky” … “Brave pioneers like the 9th-century Cordoban inventor, Abbas Ibn-Firnas, were even bold enough to strap artificial wings to their arms and leap from high places.”',
      'Archytas (thế kỷ 5), Ibn-Firnas (thế kỷ 9) = những nỗ lực bay sớm nhất của con người → i'],
    19: ['Paragraph F — chọn tiêu đề.', 'Đoạn F',
      '“He carried out analyses of what shapes and angles produced the greatest lift. In his analyses, he developed the names of the key forces involved in flight”',
      'Cayley tìm ra hình dạng, góc cánh và các lực chính = the discovery of several key factors affecting wing design → vi'],
    20: ['Cánh có cùng một hình dạng – đường cong cho ra lượng ______ tối đa.', 'Đoạn D',
      '“A gentle, thin, curve provides the best lift, and this is the shape of the wings of birds as well as the shape that the flexible wings of hang-gliders and microlights bend into.”',
      '“provides the best lift” = provides the maximum amount of lift → lift'],
    21: ['Đôi cánh khổng lồ của máy bay hiện đại nhìn từ bên cạnh giống một ______ mỏng.', 'Đoạn D',
      '“So, the wings of most large aircraft are, in profile, the shape of a narrow teardrop.”',
      '“in profile” = when viewed from the side; “narrow teardrop” = thin teardrop → teardrop'],
    22: ['Không gian không bị lãng phí vì ______ cần cho chuyến bay được chứa trong cánh.', 'Đoạn D',
      '“They are hollow inside, which provides room for fuel storage.”',
      'Cánh rỗng bên trong để chứa nhiên liệu → fuel'],
    23: ['Phi công có thể điều chỉnh các ______ …', 'Đoạn D',
      '“There are also flaps on the rear of the wings that can be swung up or down to alter the aerofoil curvature”',
      '“flaps … can be swung up or down” = the pilot can adjust the flaps → flaps'],
    24: ['… nằm ở ______ của cánh.', 'Đoạn D',
      '“There are also flaps on the rear of the wings”',
      '“on the rear of the wings” = located at the rear → rear'],
    25: ['Tác giả nói hai điều gì về George Cayley? (đáp án 1)', 'Đoạn F',
      '“He carried out analyses of what shapes and angles produced the greatest lift.”',
      'B sai: bài nói phải nửa thế kỷ sau anh em Wright mới bay được vì cần “both power and control”, không nói Cayley biết thiết kế động cơ máy bay (file key của Vol ghi B, E). “produced the greatest lift” = how to achieve the maximum lift → C'],
    26: ['Tác giả nói hai điều gì về George Cayley? (đáp án 2)', 'Đoạn F',
      '“Yet the first person who really began to explore the shape of wings methodically was the British engineer Sir George Cayley” … “He carried out analyses of what shapes and angles produced the greatest lift.”',
      'A, D không được nhắc đến. “explore … methodically”, “carried out analyses” = reached his conclusions by conducting a series of tests → E'],
  },
};
