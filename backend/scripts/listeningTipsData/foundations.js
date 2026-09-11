'use strict';
const { overview, list, table, steps, callout, example, summary, lesson } = require('../readingTipsData/builder');

// A new, foundational category shown BEFORE "Chiến thuật theo dạng bài" —
// same idea as readingTipsData/foundations.js: keyword-highlighting + the
// 30-second preview window is the base skill every question-type strategy
// in this section assumes the student already has. orderIndex is negative
// (existing categories use 1-6 and 11-14, a single global sort — see
// listeningTipService.listLessons) so this group always sorts first.
const CATEGORY = 'Kỹ thuật nghe nền tảng';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'keyword-highlighting', title: 'Highlight keyword đúng cách', icon: '🖊️', orderIndex: -4,
    summaryText: 'Chỉ đánh dấu từ giúp biết cần nghe gì, paraphrase nào có thể xuất hiện, và đáp án thuộc loại thông tin nào.',
    blocks: [
      callout('📌 Trước khi học kỹ năng', 'Vốn từ vựng chính là chìa khóa để nâng band trước khi học bất kỳ kỹ năng nào — hãy dành 20–30 phút mỗi ngày để học từ trong sổ từ vựng (Vocab) của bạn.'),
      overview('Khi đọc câu hỏi, KHÔNG highlight cả câu. Chỉ đánh dấu những từ giúp mình: biết đang cần nghe thông tin gì, biết từ nào có thể xuất hiện dưới dạng paraphrase, và biết câu trả lời thuộc loại thông tin nào.\nVD: "The museum will be closed on _____." → chỉ highlight museum – closed – day/date; không cần "The / will be / on".'),
      list('3 loại keyword', [
        '🔴 Anchor keywords (từ neo) — giúp định vị thông tin trong audio, thường là tên riêng, rất dễ nghe. VD: "The meeting will take place at the Central Library." → Central Library.',
        '🔵 Content keywords (từ mang nội dung) — mang ý chính của câu. VD: "Students can borrow laptops from the library." → students – borrow – laptops.',
        '🟢 Answer-type keywords — dự đoán LOẠI đáp án cần nghe, đây là phần quan trọng nhất.',
      ]),
      table('Dấu hiệu trong câu hỏi → loại đáp án', ['Dấu hiệu', 'Dự đoán'], [
        ['at ______ (nơi chốn)', 'place / location'],
        ['on ______', 'day / date'],
        ['at ______ (thời gian)', 'time'],
        ['£ ______', 'price'],
        ['______ people', 'number'],
        ['Mr/Ms ______', 'name'],
        ['because ______', 'reason'],
        ['______ and ______', '2 pieces of information'],
        ['adjective + ______', 'thường cần noun'],
        ['verb + ______', 'thường cần noun'],
      ]),
      callout('Ví dụ', '"The course starts at ______." → dự đoán TIME. Học sinh cần chuẩn bị sẵn trong đầu vài khả năng: 8:00? 8:30? 9:15?'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: '30-second-strategy', title: 'Chiến thuật 30 giây', icon: '⏱️', orderIndex: -3,
    summaryText: 'Read → Highlight → Predict → Move on. 30 giây là để chuẩn bị, không phải để dịch nghĩa.',
    blocks: [
      overview('Nguyên tắc vàng: 30 seconds is NOT reading time. It is preparation time.\nHọc sinh không cần hiểu 100% câu hỏi. Mục tiêu là: READ → HIGHLIGHT → PREDICT → MOVE ON.'),
      steps([
        { title: 'Bước 1 – Read', description: 'Đọc nhanh hết các câu trong section (VD Section 1 có 5 câu → đọc câu 1 tới 5).' },
        { title: 'Bước 2 – Highlight', description: 'Gạch chân keyword quan trọng ở mỗi câu.' },
        { title: 'Bước 3 – Predict', description: 'Dự đoán loại đáp án. VD: "The woman\'s surname is ______." → NAME · "She lives on ______ Road." → PLACE/STREET NAME · "Her telephone number is ______." → NUMBER.' },
      ]),
      callout('Đọc xong sớm → nhảy sang câu tiếp theo', 'Nếu đọc xong Q1–5 trong khoảng 20 giây: KHÔNG ngồi chờ audio. Lập tức chuyển sang Q6–10, tiếp tục highlight → predict → move forward. Còn thời gian thì preview tiếp Q11–15.'),
      callout('Preview ahead – listen back', '👀 Mắt đi trước (đọc/preview trước nhiều câu) — 👂 tai theo sau (nghe đúng theo tiến độ audio). Audio nhắc tới Q1 → quay lại nghe Q1; sang Q2 → theo Q2; hết Q1–5 → chuyển tiếp Q6–10.'),
      callout('⚠️ Không được "đuổi audio"', 'Lỗi rất phổ biến: bỏ lỡ Q5 rồi cố quay lại tìm → lỡ luôn Q6, rồi Q7... mất cả section. Quy tắc bắt buộc: MISS ONE → MOVE ON — đừng cố đuổi theo câu đã lỡ, chuyển ngay sang câu tiếp theo.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'symbols-and-paraphrase', title: 'Ký hiệu nhanh & dự đoán paraphrase', icon: '🔤', orderIndex: -2,
    summaryText: 'Ghi chú bằng ký hiệu thay vì viết chữ; chuẩn bị sẵn các cách audio có thể paraphrase từ khóa trong câu hỏi.',
    blocks: [
      overview('Highlight "từ để nghe", không phải "từ để đọc" — chỉ cần gạch đúng từ khóa cốt lõi, không cần cả cụm dài.'),
      example([
        {
          label: 'Ví dụ',
          passage: '"The woman decided to travel to Australia because she wanted to improve her English."',
          statement: 'Chỉ cần highlight: Australia – why – improve English',
          note: 'Khi nghe, tập trung vào Australia và lý do (why) — không cần theo dõi từng chữ của cả câu dài.',
        },
      ]),
      table('Ký hiệu ghi chú nhanh', ['Ký hiệu', 'Ý nghĩa'], [
        ['$', 'price'],
        ['#', 'number'],
        ['→', 'change / result'],
        ['+', 'advantage / positive'],
        ['–', 'disadvantage / negative'],
        ['?', 'chưa chắc'],
        ['✓', 'đã xác nhận'],
        ['!', 'important'],
        ['≠', 'contrast'],
      ]),
      callout('Ví dụ ký hiệu', '"The original price was $80, but students now pay $50." → ghi nhanh: $80 → $50'),
      list('Dự đoán paraphrase TRƯỚC khi nghe (nâng B1+ lên B2)', [
        '"The hotel is cheap." → có thể nghe: inexpensive / affordable / low-cost',
        '"The area is quiet." → có thể nghe: peaceful / calm / not noisy',
        '"The woman changed her booking." → có thể nghe: modified her reservation / changed the date / made a different booking',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'full-workflow-practice', title: 'Quy trình hoàn chỉnh & luyện tập', icon: '🧭', orderIndex: -1,
    summaryText: 'Toàn bộ quy trình từ trước audio tới lúc bỏ lỡ một câu, cộng một bài luyện highlight & predict 30 giây.',
    blocks: [
      callout('3 giây trước audio', 'Ngay trước khi audio tới câu tiếp theo, tự hỏi: "What am I listening for?" VD: "The class starts at ______." → não phải chuyển ngay sang 👂 TIME, không phải cố nghe từng từ.'),
      steps([
        { title: 'Trước audio', description: 'Read → Highlight → Predict' },
        { title: 'Audio bắt đầu', description: 'Listen → Locate → Answer' },
        { title: 'Không nghe được', description: 'Skip → Move on' },
        { title: 'Có thời gian trống', description: 'Preview next questions' },
      ]),
      table('Mini practice — 30 giây highlight & predict', ['Câu hỏi', 'Keyword', 'Dự đoán'], [
        ['The tour begins at ______ a.m.', 'tour – begins – a.m.', 'TIME'],
        ['Visitors should bring a ______.', 'visitors – bring', 'NOUN / OBJECT'],
        ['The cost of the tour is £______ per person.', 'cost – £', 'PRICE'],
        ['The group will meet outside the ______.', 'meet – outside', 'PLACE'],
        ['The tour was originally planned for ______.', 'originally – planned', 'DATE / DAY'],
      ]),
      callout('🎧 The 30-Second Rule', '① Read the questions ② Highlight 2–4 keywords ③ Predict the answer type ④ Finish early? Jump ahead. ⑤ Audio reaches the question? Listen back. ⑥ Miss an answer? Move on.\n👀 Eyes go ahead. 👂 Ears follow the audio.'),
      list('5 điều cần nhớ', [
        'Đừng dịch từng câu hỏi.',
        'Chỉ highlight keyword, không cả câu.',
        'Dự đoán loại đáp án cần nghe.',
        'Đọc xong sớm? Preview câu tiếp theo.',
        'Bỏ lỡ 1 câu? MOVE ON ngay.',
      ]),
      summary('QUESTION → KEYWORD → ANSWER TYPE → PARAPHRASE → LISTEN — thay vì QUESTION → dịch tiếng Việt → cố nghe từ y chang → hoảng → mất cả đoạn.'),
    ],
  }),
];
