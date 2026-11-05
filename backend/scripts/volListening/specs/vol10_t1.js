// Vol 10 – Test 1 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 1 Listening": paper + transcript PDF + key).
// Only Part 2 has audio online: terratern.com "IELTS Listening Practice Test 43" Section 2 = "The Dinosaur Museum" (same questions)
// → seeded as a single section. P1 Barrington Historical Buildings Tours / P3 Lesson plans (Andrew & Molly) / P4 Maori Middens:
// no audio found (2026-11-05) → not seeded; no full test "Vol 10 - Test 1" until they are.
// Transcript = specs/vol10_tx/t1p2.txt (izone PDF, checked against Whisper; "There are also a few things…" restored).
// Key = izone, checked against the transcript.
const fs = require('fs'), path = require('path');
const { note, multi } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');

module.exports = {
  vol: 10, test: 1,
  sections: [
    {
      part: 2, title: 'The Dinosaur Museum', audio: 'LISTENING/test 1/part 2.mp3', clip: [0, 335],
      cover: 'dinosaur skeleton museum | dinosaur fossil exhibit', transcript: TX('t1p2'),
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'The Dinosaur Museum', [
          'The museum closes at __Q11__ p.m. on Mondays.',
          'The museum is not open on __Q12__.',
          'School groups are met by tour guides in the __Q13__.',
          'The whole visit takes 90 minutes, including __Q14__ minutes for the guided tour.',
          'There are __Q15__ behind the museum where students can have lunch.',
        ], { 11: '1.30 / 1:30', 12: '25 December / 25th December / December 25 / December 25th / Christmas Day', 13: 'car park', 14: '45', 15: 'tables' }, 'Questions 11-15'),
        multi('Choose THREE letters, A-G.', 16, 'Which THREE things can students have with them in the museum?',
          ['food', 'water', 'cameras', 'books', 'bags', 'pens', 'worksheets'], ['C', 'F', 'G'], 'Questions 16-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO activities can students do after the tour at present?',
          ['build model dinosaurs', 'watch films', 'draw dinosaurs', 'find dinosaur eggs', 'play computer games'], ['B', 'E'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Khi nói giờ mở cửa.', t: 'In regard to opening hours, we\'re open every day of the week from 9 a.m. to 8 p.m., except on Mondays, when we close at 1:30 p.m.', p: 'Bình thường đóng lúc 8 giờ tối (bẫy), riêng thứ Hai đóng lúc 1:30 chiều → 1.30' },
        12: { v: 'Khi nói ngày nghỉ.', t: 'And in fact, the only day in the year when we\'re closed is on 25 December.', p: 'Ngày duy nhất trong năm bảo tàng đóng cửa là 25/12 → 25 December' },
        13: { v: 'Khi nói nơi đón đoàn.', t: ['If you bring a school group to the museum, when you arrive we ask you to remain with your group in the car park.', 'One or more of the tour guides will welcome you there and brief you about what the tour will be about.'], p: 'Hướng dẫn viên đón và giới thiệu ở bãi đậu xe vì lối vào quá nhỏ → car park' },
        14: { v: 'Khi nói thời gian tham quan.', t: 'This allows 15 minutes to get on and off the coach, 45 minutes for the guided tour and 30 minutes for after-tour activities.', p: '90 phút gồm 15 phút lên xuống xe, 45 phút tham quan có hướng dẫn, 30 phút hoạt động → 45' },
        15: { v: 'Khi nói chỗ ăn trưa.', t: 'Then outside the museum at the back there are tables, and students can bring their own lunch and eat it there in the open air.', p: 'Phía sau bảo tàng có bàn để học sinh ăn trưa mang theo; hai quán cà phê phải đặt chỗ (bẫy) → tables' },
        16: { v: 'Khi nói những thứ được mang vào.', t: 'We do allow students to take photographs.', p: 'Học sinh được chụp ảnh → được mang máy ảnh; ba lô, sách, hộp cơm phải gửi ở phòng giữ đồ, đồ ăn và nước uống không được mang vào → C' },
        17: { v: 'Khi nói những thứ được mang vào.', t: 'Of course, they\'ll need to bring something to write with for these.', p: 'Cần mang thứ gì để viết khi làm phiếu câu hỏi = bút → F' },
        18: { v: 'Khi nói những thứ được mang vào.', t: 'But we do provide school students with handouts with questions and quizzes on them.', p: 'Bảo tàng phát phiếu có câu hỏi, câu đố = worksheets → G' },
        19: { v: 'Khi nói hoạt động sau tham quan.', t: 'In the theatrette on the ground floor there are continuous screenings of short documentaries about dinosaurs, which they can see at any time.', p: 'Phòng chiếu nhỏ ở tầng trệt chiếu phim tài liệu liên tục = watch films; làm mô hình, vẽ, tìm trứng thuộc phòng hoạt động đang đóng (bẫy A, C, D) → B' },
        20: { v: 'Khi nói hoạt động sau tham quan.', t: 'But we do have an IT centre where students have access to CD-ROMs with a range of dinosaur games.', p: 'Trung tâm IT có đĩa CD-ROM trò chơi về khủng long = play computer games → E' },
      },
    },
  ],
};
