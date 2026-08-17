'use strict';
const { overview, list, table, callout, example, summary, lesson } = require('../readingTipsData/builder');

const CATEGORY = 'Chiến thuật theo band điểm';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'band-6', title: 'Band 6.0', icon: '6️⃣', orderIndex: 11,
    summaryText: 'Tập trung vào accuracy — ăn chắc Part 1-2, bỏ ngay câu lỡ nghe thay vì cố nhớ lại.',
    blocks: [
      overview('Band 6 nên tập trung vào accuracy.'),
      callout('Ưu tiên', 'Part 1 + Part 2 = phải ăn điểm cao. Nếu Part 1–2 mất quá nhiều câu → rất khó kéo overall Listening lên 7+.'),
      list('Mục tiêu', ['spelling', 'numbers', 'names', 'dates', 'singular/plural', 'word limit']),
      callout('Chiến thuật phòng thi', 'Nếu bỏ lỡ một câu: Bỏ ngay và theo câu tiếp theo. Không cố nhớ lại. Vì một câu sai có thể kéo theo 2–3 câu tiếp theo.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-7', title: 'Band 7.0', icon: '7️⃣', orderIndex: 12,
    summaryText: 'Xử lý distractor, nhận diện paraphrase, và nghe được các tín hiệu chuyển ý (signposting).',
    blocks: [
      overview('Band 7 cần xử lý tốt:'),
      example([
        {
          label: '1. Distractors',
          passage: 'We originally planned to meet on Friday, but due to the weather, Saturday would be better.',
          note: '→ Saturday.',
        },
      ]),
      example([
        {
          label: '2. Paraphrase',
          statement: 'Question: Why did the company change its policy?',
          passage: 'Audio: "The company decided to introduce a new policy because..."',
          note: 'Không nhất thiết nghe được đúng từ "change".',
        },
      ]),
      list('3. Signposting — cần nghe được', [
        'however', 'actually', 'but', 'instead', 'in contrast',
        'the main reason is...', 'what I mean is...', 'let me correct that...',
      ]),
      callout('', 'Đây thường là nơi đáp án xuất hiện hoặc được sửa.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-8', title: 'Band 8.0', icon: '8️⃣', orderIndex: 13,
    summaryText: 'Chuyển từ "nghe keyword" sang theo dõi logic, thái độ và cấu trúc lập luận của speaker.',
    blocks: [
      overview('Band 8 cần chuyển từ "nghe keyword" sang "theo dõi logic của speaker."'),
      list('1. Predict meaning', ['Không chỉ dự đoán grammar.', 'Phải dự đoán: speaker có khả năng nói gì tiếp theo?']),
      list('2. Track attitude (đặc biệt Part 3–4)', ['agreement', 'disagreement', 'uncertainty', 'criticism', 'recommendation']),
      list('3. Recognize discourse structure', [
        'Initially...', 'However...', 'The more important issue is...', 'What we eventually discovered was...',
      ]),
      callout('', 'Đáp án thường nằm ở logic chuyển ý.'),
      callout("4. Don't panic over unknown words", 'Band 8 không cần hiểu 100%. Nếu gặp một từ không biết: giữ flow → tiếp tục nghe.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'exam-strategy-summary', title: 'Tổng hợp chiến thuật thi (Reading & Listening)', icon: '🧭', orderIndex: 14,
    summaryText: 'Bảng tổng hợp quy trình làm bài theo band cho cả hai kỹ năng — Band 6 tìm đáp án, Band 7 hiểu vì sao, Band 8 hiểu cách đề giấu đáp án.',
    blocks: [
      overview('Chiến thuật phòng thi tổng hợp theo từng band, áp dụng cho cả Reading và Listening.'),
      table('READING', ['Band', 'Quy trình', 'Tập trung'], [
        ['6.0', 'Keyword → Scan → Locate → Answer', 'accuracy + time control'],
        ['7.0', 'Keyword → Paraphrase → Locate → Compare → Eliminate', 'inference control + distractors + paraphrase'],
        ['8.0', 'Meaning → Structure → Logic → Evidence', "nuance + scope + writer's intention + speed"],
      ]),
      table('LISTENING', ['Band', 'Quy trình', 'Tập trung'], [
        ['6.0', 'Predict → Listen → Write → Check', 'spelling + numbers + grammar + word limit'],
        ['7.0', 'Predict → Listen for paraphrase → Track distractors → Confirm', 'distractors + correction + paraphrase'],
        ['8.0', 'Predict → Follow argument → Interpret meaning → Confirm', "speaker's logic + attitude + discourse markers + inference"],
      ]),
      table('Nguyên tắc theo band', ['Band', 'Reading', 'Listening'], [
        ['6.0', 'Tìm đúng location + không suy diễn', 'Nghe đúng thông tin + spelling'],
        ['7.0', 'Nhận diện paraphrase + loại distractor', 'Nhận diện paraphrase + distractor'],
        ['8.0', 'Hiểu logic + nuance + scope', 'Theo dõi argument + attitude + implication'],
      ]),
      summary('Band 6 = Find the answer.\nBand 7 = Understand why this is the answer.\nBand 8 = Understand how the test hides the answer.'),
    ],
  }),
];
