// Vol 10 – Test 10 (source: izone.edu.vn "Giải chi tiết VOL 10 – Test 10 Listening": question paper PDF on a public Google Drive
// link + key + transcript). Recordings found only for P3 = IELTS Recent Actual Tests 3 – Listening Test 5 Section 3 "Business
// Assignment" (DOL AT3_L5_S3) and P4 = Recent Actual Tests 1 – Listening Test 3 Section 4 "Talking About The History Of Bikes"
// (DOL AT1_L3_S4) — audio + speaker-labelled transcript from the cached DOL sections (web/vol10/dolprep.js; ligatures fixed,
// "Mr thompson" → Dr Thompson as Alexandra calls him). P1 (Insurance Claim Phone Call) and P2 (Home Improvement Store Plan):
// no audio found (2026-11-25) → no full test yet. Key = izone, checked against the transcript; the Vol gaps 27/29/30/35 are
// DOL transcript P4 “travel with less walking, plus” → “with less effort than walking. Plus,” (Whisper, wb.js 10 10 4 96 112).
// shorter than DOL's ("motivation" vs "role of motivation" …) → both accepted.
const fs = require('fs'), path = require('path');
const { note, table, mc, multi } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');
const B = '__Q';

module.exports = {
  vol: 10, test: 10,
  sections: [
    {
      part: 3, title: 'Major Problems of Companies', audio: 'LISTENING/test 10/part 3.mp3', clip: [0, 376],
      cover: 'business office meeting | company founder', transcript: TX('t10p3'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What was the most difficult problem when the company was founded?', ['No clear objectives', 'No formal structures', 'No perfect premises'], 'B'],
          [22, 'What is the staff unsatisfied with?', ['The type of work', 'The work assignment', 'The feeling of appreciation'], 'B'],
          [23, 'What was the problem of the manager?', ['He had a lot of tasks to do.', 'He employed too many people and let them go then.', 'He always made decisions by himself.'], 'C'],
          [24, 'What does the staff think of the new manager of the company?', ['They are delighted to see that the meeting time is shorter.', 'They feel annoyed toward him.', 'They are amazed that he has done it well.'], 'C'],
          [25, 'What achievement has the organization made already?', ['Children were involved in painting the entrance area.', 'There was no particular achievement.', 'It built a local primary school.'], 'A'],
        ], 'Questions 21-25'),
        note('Complete the summary below.\nWrite NO MORE THAN THREE WORDS for each answer.', 'Major Problems of a Company', [
          'Since the company opened, there have been many problems with employment, but there is no __Q26__. He needs to find a venue for financial training. It is very hard to run an organization and the __Q27__ is of great importance to staying organized. To enhance the organization skills, there is a section on __Q28__ in the library where some valuable books can be found. In addition, the library contains some useful resources, such as a collection of documentaries on personal organization, the literature on __Q29__, and the articles on the __Q30__.',
        ], { 26: 'solution', 27: 'motivation / role of motivation', 28: 'culture', 29: 'change / management of change', 30: 'volunteering / nature of volunteering' }, 'Questions 26-30'),
      ],
      expl: {
        21: { v: 'Khi Alexandra hỏi khó khăn khi mới thành lập công ty.', t: 'The hardest part was structuring the business, as I had no formal template so I had to create it myself.', p: 'Mục tiêu đã rõ ràng (bẫy A), mặt bằng khó tìm nhưng đã tìm được (bẫy C); khó nhất là không có cấu trúc chính thức → B' },
        22: { v: 'Khi nói về nhân viên.', t: 'gave them the opportunity to share with me the issues they had with the allocation of the work.', p: '“allocation of the work” = việc phân công = work assignment; ông đã làm nhân viên thấy được trân trọng (bẫy C) → B' },
        23: { v: 'Khi nói về người quản lý đầu tiên.', t: 'he never consulted me before making decisions so I was forced to let him go and hire someone else.', p: 'Người quản lý tự quyết định mà không hỏi ý kiến → C' },
        24: { v: 'Khi nói về quản lý mới.', t: 'They were surprised that he has been so successful in his role at the company, despite the longer meeting hours.', p: '“surprised … so successful” = amazed that he has done it well; cuộc họp dài hơn chứ không ngắn hơn (bẫy A) → C' },
        25: { v: 'Khi hỏi thành tựu của công ty.', t: 'I wanted a mural painted to brighten up our entrance area, so I decided it would be a great idea to invite the local primary school to create one for us.', p: 'Mời học sinh tiểu học vẽ tranh tường ở khu lối vào; không phải xây trường (bẫy C) → A' },
        26: { v: 'Khi nói về vấn đề tuyển dụng.', t: 'but unfortunately there is no solution to this.', p: 'Khó tìm người đủ năng lực và không có giải pháp → solution' },
        27: { v: 'Khi nói về kỹ năng tổ chức.', t: 'Whilst I was learning how to stay organised, I realised that the role of motivation is essential.', p: '“essential” = of great importance; vai trò của động lực → motivation' },
        28: { v: 'Khi gợi ý đến thư viện.', t: 'as there is a section on culture that will have some very valuable material on how to develop your organisation skills.', p: 'Khu sách về văn hóa có tài liệu quý về kỹ năng tổ chức → culture' },
        29: { v: 'Khi nói về tài liệu trong thư viện.', t: 'and I suggest that you look up the literature on management of change.', p: 'Tài liệu về quản lý sự thay đổi → change' },
        30: { v: 'Khi nói về các bài báo.', t: 'I advise that you look at Section 2 where you will find articles on the nature of volunteering.', p: 'Bài báo về bản chất của hoạt động tình nguyện → volunteering' },
      },
    },
    {
      part: 4, title: 'History of Bicycles', audio: 'LISTENING/test 10/part 4.mp3', clip: [0, 411],
      cover: 'penny-farthing bicycle | vintage bicycle', transcript: TX('t10p4'),
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          ['Years/Time', 'Feature', 'Advantage', 'Disadvantage'], [
            ['1830s', 'wooden wheels covered with metal', `need ${B}31__ than walking`, `quite ${B}32__`],
            [`${B}33__`, `Chain and sprocket are ${B}34__`, `ride more easily and ${B}35__`, 'harder to balance'],
            ['1880s', `use ${B}36__`, 'more comfortable', 'The faster you go, the more you feel every bump.'],
            ['1890s', 'equal-sized wheels', `${B}37__`, 'dangerous before brakes appeared'],
          ], { 31: 'less effort', 32: 'uncomfortable', 33: '1860s / the 1860s', 34: 'connected', 35: 'smoothly / more smoothly', 36: 'rubber wheels', 37: 'safer' }, 'Questions 31-37'),
        multi('Choose THREE letters, A-F.', 38, 'The invention of different gears on a bicycle affected which THREE of the following?',
          ['Wheel size', 'Balance', 'Rate of speed', 'The back wheel', 'Safety', 'Downhill travel'], ['C', 'D', 'F'], 'Questions 38-40'),
      ],
      expl: {
        31: { v: 'Khi nói về xe đạp thập niên 1830.', t: 'The early bike let people travel with less effort than walking.', p: 'Xe đạp đầu tiên giúp đi lại tốn ít sức hơn đi bộ → less effort' },
        32: { v: 'Khi nói nhược điểm bánh gỗ bọc kim loại.', t: 'So the downside was that the ride was quite uncomfortable on most roads.', p: '“downside” = disadvantage; đi khá khó chịu → uncomfortable' },
        33: { v: 'Khi chuyển sang cải tiến tiếp theo.', t: 'By the 1860s, though, improvements were being made.', p: 'Hệ thống xích và đĩa xuất hiện vào thập niên 1860 → 1860s' },
        34: { v: 'Khi nói về xích và đĩa.', t: 'The biggest improvement however was the development of the chain and sprocket system. They are connected.', p: 'Xích và đĩa được nối với nhau → connected' },
        35: { v: 'Khi nói ưu điểm của bàn đạp.', t: 'As a result, the good thing was that you could ride a lot more smoothly and with very little effort.', p: 'Đi êm hơn nhiều và rất ít tốn sức; khó giữ thăng bằng là nhược điểm → smoothly' },
        36: { v: 'Khi nói về thập niên 1880.', t: 'By the 1880s, another big change was the use of rubber wheels.', p: 'Dùng bánh cao su, êm hơn hệ thống sắt và gỗ cũ → rubber wheels' },
        37: { v: 'Khi nói về phanh trên xe velocipede.', t: 'This meant that bikes became a great deal safer.', p: 'Xe hai bánh bằng nhau có phanh nên an toàn hơn nhiều → safer' },
        38: { v: 'Khi giải thích vì sao xe đạp ngày nay nhanh hơn.', t: 'Changing gears is what makes those fast speeds possible.', p: 'Chuyển số giúp đạt tốc độ cao → ảnh hưởng tốc độ → C' },
        39: { v: 'Khi chỉ vị trí bộ số.', t: 'You’ll notice this gear-shifting mechanism is attached at the back wheel', p: 'Cơ cấu chuyển số gắn ở bánh sau → D' },
        40: { v: 'Khi nói cách dùng số.', t: 'So you can put it on a higher gear for downhill, and a lower gear for uphill travel to make it easier to climb that slope.', p: 'Số cao khi xuống dốc, số thấp khi lên dốc → ảnh hưởng việc đi xuống dốc; an toàn nói chung không liên quan đến bộ số (bẫy E) → F' },
      },
    },
  ],
};
