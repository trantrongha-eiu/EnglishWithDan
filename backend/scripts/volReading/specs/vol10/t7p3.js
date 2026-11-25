// Vol 10 - Test 7 - Passage 3 (Q28–40: Passage 2 runs to Q27 in this test). Source: izone.edu.vn "Giải chi tiết đề VOL 10 –
// Test 7 Reading" (PDF đề trên Google Drive công khai + bảng đáp án). Not in the bank (dedupe10b.js 2026-11-25) — this is the
// passage students report as "The secret sound of elephants".
// Q28–31 = "Label the diagram" (a drawing of an elephant with four labels) → typed here as the four label lines.
// Q40: izone key C (the unfamiliar Kenyan call made the herd bunch up but "they didn't always flee" → not fully decisive).
// Text: "first- ever" → first-ever; "O' Connell" → O'Connell. Q29 key "body" = singular of “massive bodies” (label "an extremely large ___").
const { notes, mc } = require('../../vr_build');
module.exports = {
  free: ['body'], vol: 10, test: 7, part: 3, start: 28, allowCount: [13], title: 'Elephant Communication', text: 't7p3.txt',
  groups: [
    notes(28, 31, [
      'Inner ear: __Q28__ bones in inner ear',
      'Whole animal: an extremely large __Q29__',
      'Feet: toe and fatty __Q30__',
      'Head: big sized brain skull with many __Q31__',
    ], { title: 'Parts of an elephant that help it sense seismic signals', instruction: 'Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 28–31 on your answer sheet.' }),
    notes(32, 38, [
      'How the elephants sense these sound vibrations is still unknown, but O’Connell-Rodwell, a postdoctoral researcher at Stanford University, proposes that elephants are ‘listening’ with their __Q32__ by two kinds of nerve endings that respond to vibrations with both __Q33__ frequency and slightly higher frequencies. O’Connell-Rodwell’s work is at the combination of geophysics, neurophysiology and __Q34__. It was known that seismic communication existed extensively within small animals, but O’Connell-Rodwell was the first person to indicate that a large land animal would send and receive __Q35__ too. Also, he noticed the freezing behaviour by putting a male planthopper on a stem and play back a female call, which might prove the existence of other communicative approaches besides __Q36__.',
      'Scientists have determined that an elephant’s ability to communicate over long distances is essential, especially, when elephant herds are finding a __Q37__, or are warning of predators. Finally, the results of our 2002 study showed us that elephants could detect warning calls through the __Q38__.',
    ], { instruction: 'Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 32–38 on your answer sheet.' }),
    mc(39, [
      ['According to the passage, it is determined that an elephant needs to communicate over long distances for its survival', [
        'when a threatening predator appears.',
        'when young elephants meet humans.',
        'when older members of the herd want to flee from the group.',
        'when a male elephant is in estrus.']],
      ['What is the author’s attitude toward the experiment by using three different recordings in the last paragraph?', [
        'The outcome is definitely out of the original expectation.',
        'The data cannot be very clearly obtained.',
        'The result can be somewhat undecided or inaccurate.',
        'The result can be unfamiliar to the public.']],
    ]),
  ],
  key: { 28: 'hammer', 29: 'body', 30: 'pad', 31: 'sinus cavities', 32: 'trunks and feet', 33: 'infrasonic', 34: 'ecology',
    35: 'seismic signals', 36: 'auditory communication', 37: 'mate', 38: 'ground', 39: 'A', 40: 'C' },
  expl: {
    28: ['Xương ______ trong tai trong.', 'Đoạn 3',
      '“The hammer bone in an elephant’s inner ear is proportionally huge for a mammal”',
      '“hammer bone in an elephant’s inner ear” khớp nhãn “bones in inner ear” → hammer'],
    29: ['Một ______ cực kỳ lớn.', 'Đoạn 4',
      '“First, their massive bodies, which enable them to give out low-frequency sounds” … “serve as ideal frames for receiving ground vibrations”',
      '“massive” = extremely large; thân hình to lớn giúp nhận rung động từ mặt đất → body'],
    30: ['Ngón chân và ______ mỡ.', 'Đoạn 4',
      '“Second, the elephant’s toe bones are set on a fatty pad, which might be of help when focusing vibrations from the ground into the bone.”',
      'Xương ngón chân đặt trên một “fatty pad” (đệm mỡ) → pad'],
    31: ['Hộp sọ chứa bộ não lớn với nhiều ______.', 'Đoạn 4',
      '“Finally, the elephant has an enormous brain” … “The front of the skull is riddled with sinus cavities, which might function as resonating chambers for ground vibrations.”',
      '“riddled with” (đầy những) = many; phía trước hộp sọ có nhiều xoang → sinus cavities'],
    32: ['O’Connell-Rodwell cho rằng voi “nghe” bằng ______ của chúng.', 'Đoạn 5',
      '“O’Connell-Rodwell raises a point that the pachyderms are ‘listening’ with their trunks and feet instead of their ears”',
      'Voi “nghe” bằng vòi và chân thay vì tai → trunks and feet'],
    33: ['Hai loại đầu dây thần kinh phản ứng với rung động có tần số ______ và tần số cao hơn một chút.', 'Đoạn 5',
      '“Both trunk and feet contain two types of nerve endings that are sensitive to pressure—one detects infrasonic vibration, and another responds to vibrations higher in frequencies.”',
      'Một loại nhận rung động hạ âm (infrasonic), loại kia nhận tần số cao hơn → infrasonic'],
    34: ['Công trình của O’Connell-Rodwell là sự kết hợp của địa vật lý, sinh lý học thần kinh và ______.', 'Đoạn 5',
      '“Our work is really interfaced of geophysics, neurophysiology and ecology,”',
      '“interfaced of” = at the combination of → ecology'],
    35: ['O’Connell-Rodwell là người đầu tiên chỉ ra rằng một loài động vật lớn trên cạn cũng gửi và nhận ______.', 'Đoạn 6',
      '“O’Connell-Rodwell first argued that a giant land animal is also sending and receiving seismic signals”',
      '“first argued” = the first person to indicate; “giant land animal” = large land animal → seismic signals'],
    36: ['… có thể chứng minh tồn tại những cách giao tiếp khác ngoài ______.', 'Đoạn 6',
      '“it got me thinking that perhaps auditory communication is not the only thing that is going on”',
      '“not the only thing” = other communicative approaches besides … → auditory communication'],
    37: ['Khả năng giao tiếp đường dài của voi rất quan trọng, đặc biệt khi đàn voi đang tìm ______ hoặc cảnh báo kẻ săn mồi.', 'Đoạn 7',
      '“It is already difficult for an elephant to find a mate in such a vast wild land”',
      'Tìm bạn tình trên vùng hoang dã rộng lớn là việc khó → cần giao tiếp đường dài → mate'],
    38: ['Kết quả nghiên cứu năm 2002 cho thấy voi có thể phát hiện tiếng cảnh báo qua ______.', 'Đoạn 8',
      '“The outcomes of our 2002 study revealed that elephants could indeed sense warning signals through the ground,”',
      '“sense warning signals through the ground” = detect warning calls through the … → ground'],
    39: ['Theo bài, voi cần giao tiếp đường dài để sinh tồn', 'Đoạn 7',
      '“Breeding herds also adopt low-frequency sounds to send alerts regarding predators.” … “At the sight of a predator, older ones in the herd will clump together to form protection before running away.”',
      'Đàn voi dùng âm tần số thấp để cảnh báo khi kẻ săn mồi xuất hiện. B sai: con người là kẻ thù của voi trưởng thành, không nói về voi con gặp người; C sai: voi lớn tụ lại bảo vệ đàn rồi mới chạy, không tách khỏi đàn; D không được nhắc → A'],
    40: ['Thái độ của tác giả đối với thí nghiệm dùng ba đoạn ghi âm khác nhau ở đoạn cuối là gì?', 'Đoạn 9',
      '“The data I’ve observed to this point implies that the elephants were responding the way I always expected.” … “caused them to gather around, tense up and rumble aggressively as well—but they didn’t always flee”',
      'Dữ liệu “to this point” (đến lúc này) mới chỉ cho thấy xu hướng; với tiếng gọi lạ từ Kenya, voi tụ lại, căng thẳng nhưng “didn’t always flee” → kết quả chưa hoàn toàn dứt khoát. A sai: phần lớn phản ứng đúng như dự đoán; B sai: dữ liệu vẫn thu được; D sai: tiếng gọi lạ với đàn voi chứ không phải với công chúng → C'],
  },
};
