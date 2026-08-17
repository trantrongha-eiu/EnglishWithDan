'use strict';
const { overview, steps, list, callout, example, lesson } = require('./builder');

const CATEGORY = 'Chiến lược & Xử lý tình huống phòng thi';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'prep-banks', title: 'Chuẩn bị trước khi thi (Person / Place / Experience Bank)', icon: '🗂️', orderIndex: 51,
    summaryText: 'Đừng học thuộc bài mẫu — chuẩn bị 10-15 câu chuyện tái sử dụng được cho nhiều đề khác nhau.',
    blocks: [
      callout('Đừng học thuộc bài mẫu vào ngày thi', 'Thay vì học 20 bài Part 2 hoàn chỉnh, hãy chuẩn bị 10–15 stories có thể tái sử dụng.'),
      example([
        {
          label: 'Ví dụ: một câu chuyện về một người bạn có thể dùng cho',
          lines: [
            { tag: '1', text: 'Describe a person you admire.' },
            { tag: '2', text: 'Describe someone who helped you.' },
            { tag: '3', text: 'Describe a person you enjoy spending time with.' },
            { tag: '4', text: 'Describe someone who influenced you.' },
          ],
        },
      ]),
      list('PERSON BANK — khoảng 5–6 người', ['family member', 'close friend', 'teacher', 'colleague', 'famous person', 'neighbour']),
      list('PLACE BANK — khoảng 5 địa điểm', ['hometown', 'favourite café', 'school', 'beach', 'tourist attraction']),
      list('EXPERIENCE BANK — khoảng 8–10 câu chuyện', [
        'memorable trip', 'difficult experience', 'achievement', 'mistake', 'surprise',
        'gift', 'important decision', 'helpful person', 'new activity', 'childhood memory',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'in-exam-flow', title: 'Chiến lược trong phòng thi (Part 1 → 2 → 3)', icon: '🚪', orderIndex: 52,
    summaryText: 'Part 1: trả lời ngay. Part 2: 3 giai đoạn 1 phút chuẩn bị. Part 3: chậm hơn 1-2 giây trước khi trả lời.',
    blocks: [
      steps([
        { title: '🟢 Bước 1 — Part 1', description: 'Nguyên tắc: Answer immediately. Đừng mất 5 giây suy nghĩ cho một câu hỏi đơn giản.\nFlow: Question → Answer → Reason/Detail → STOP. Nếu giám khảo chuyển câu hỏi: STOP, không cố nói tiếp.' },
        { title: '🔵 Bước 2 — Part 2', description: 'Khi nhận cue card — 0–10 giây: xác định chủ đề. 10–40 giây: chọn story. 40–60 giây: ghi keyword.\nKhi nói: Background → Story → Details → Feeling → Reflection. Nếu còn thời gian: add detail → consequence → reflection.' },
        { title: '🔴 Bước 3 — Part 3', description: 'Đây là lúc cần chậm hơn Part 1 một chút. Không trả lời ngay bằng câu đầu tiên xuất hiện trong đầu. Có thể dùng "Well, I\'d say..." hoặc "That\'s an interesting question. I think..." để có 1–2 giây chuẩn bị.\nSau đó: POSITION → REASON → DEVELOPMENT → EXAMPLE/RESULT.' },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'handling-mistakes-and-blanks', title: 'Xử lý tình huống: giám khảo không hiểu, nói sai, quên từ, bí ý (PEEL)', icon: '🆘', orderIndex: 53,
    summaryText: 'Sửa nhanh, tiếp tục nói, paraphrase khi quên từ, dùng PEEL khi bí ý Part 3.',
    blocks: [
      callout('Nếu giám khảo không hiểu bạn', 'Không hoảng. Có thể sửa: "Sorry, what I mean is..." / "Let me put that another way." / "What I\'m trying to say is..." Đây thực ra là một kỹ năng giao tiếp tốt.'),
      example([
        {
          label: 'Nếu bạn nói sai',
          lines: [
            { tag: 'Nguyên tắc', text: 'Không dừng lại quá lâu. Nếu lỗi nhỏ: tiếp tục. Nếu lỗi làm thay đổi nghĩa: sửa nhanh.' },
            { tag: 'Ví dụ', text: 'I went there last year—sorry, I mean two years ago.' },
          ],
          note: 'Sau đó tiếp tục. Không cần xin lỗi liên tục.',
        },
        {
          label: 'Nếu quên một từ — kỹ năng cực kỳ quan trọng',
          lines: [
            { tag: 'Công thức', text: 'CATEGORY + FUNCTION + DESCRIPTION' },
            { tag: 'Quên "microwave"', text: '→ "the machine you use to heat food quickly"' },
            { tag: 'Quên "subway"', text: '→ "an underground train system"' },
          ],
          note: 'Đừng im lặng — paraphrase.',
        },
      ]),
      steps([
        { title: 'Nếu bí ý tưởng Part 3 — dùng P-E-E-L', description: 'P — Point: "I think..." | E — Explain: "This is mainly because..." | E — Example: "For example,..." | L — Link: "So,..."' },
        { title: 'Nếu vẫn bí', description: 'Chuyển perspective: Individual → Family → Society → Government → Future.' },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: '10-common-mistakes', title: '10 lỗi phòng thi cần tránh', icon: '⛔', orderIndex: 54,
    summaryText: 'IELTS Speaking không yêu cầu perfect English — mục tiêu là effective communication.',
    blocks: [
      list('10 lỗi cần tránh', [
        '1. Trả lời quá ngắn — "Yes." / "No."',
        '2. Học thuộc bài mẫu — giám khảo có thể nhận ra language quá rehearsed.',
        '3. Cố dùng idioms — không cần "Every cloud has a silver lining..." trong mọi câu.',
        '4. Dùng từ khó sai nghĩa — ví dụ "pollution is very detrimental to my hometown" nếu không biết dùng "detrimental" đúng cách thì không có lợi.',
        '5. Nói quá nhanh — Nhanh ≠ fluent.',
        '6. Pause quá lâu — không tìm được từ → paraphrase.',
        '7. Lặp từ ("good... good... good...") — hãy học enjoyable, beneficial, convenient, effective, worthwhile — nhưng phải dùng đúng ngữ cảnh.',
        '8. Part 3 vẫn nói về bản thân ("My friend...", "I personally...") — có thể dùng ví dụ cá nhân nhưng nên chuyển sang people/young adults/families/society.',
        '9. Generalise cực đoan ("Everyone...", "Nobody...", "Young people always...") — nên dùng tend to / in many cases / a significant proportion of.',
        '10. Sợ sai — IELTS Speaking không yêu cầu perfect English. Mục tiêu là effective communication + range + accuracy + fluency.',
      ]),
    ],
  }),
];
