'use strict';
const { overview, steps, list, example, callout, table, lesson } = require('./builder');

const CATEGORY = '7 dạng đề Task 2';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'advantages-disadvantages', title: 'Type 01 – Advantages & Disadvantages', icon: '⚖️', orderIndex: 11,
    summaryText: 'Không cần liệt kê nhiều advantages — phát triển sâu 1 idea mới lên Band 7+.',
    blocks: [
      overview('Dạng đề: "What are the advantages and disadvantages of...?" hoặc "Discuss the advantages and disadvantages of..."'),
      steps([{ title: 'Xác định dạng', description: 'Ngay khi đọc đề: Topic → Advantages → Disadvantages.' }]),
      list('Brainstorm nhanh — Advantages', ['economic', 'social', 'educational', 'environmental', 'personal']),
      list('Brainstorm nhanh — Disadvantages', ['cost', 'time', 'health', 'social problems', 'environmental impact']),
      steps([
        { title: 'Introduction', description: 'Paraphrase + overview: "This essay will examine both the advantages and disadvantages of..."' },
        { title: 'Body 1', description: 'Advantages' },
        { title: 'Body 2', description: 'Disadvantages' },
        { title: 'Conclusion', description: 'Cân bằng hai phía' },
      ]),
      callout('💡 Tip quan trọng', 'Không cần tìm 3–4 advantages. Tốt hơn: 1 idea → explain → example → result.'),
      example([
        {
          label: 'Ví dụ phát triển 1 idea',
          lines: [
            { tag: 'Idea', text: 'Online learning is flexible.' },
            { tag: 'Explain', text: 'Students can study at convenient times.' },
            { tag: 'Example', text: 'Working adults can attend evening classes.' },
            { tag: 'Result', text: 'Education becomes more accessible.' },
          ],
        },
        {
          label: '❌ Band 6 dễ mắc / ✅ Band 7+',
          lines: [
            { tag: '❌ Band 6', text: '"It is cheap, convenient and flexible. It also saves time."' },
            { tag: '✅ Band 7+', text: 'Phát triển một idea sâu hơn thay vì liệt kê nhiều idea nông.' },
          ],
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'discuss-both-views', title: 'Type 02 – Discuss Both Views', icon: '🔀', orderIndex: 12,
    summaryText: 'View A → View B → Your opinion — đừng bao giờ quên nêu rõ opinion của mình.',
    blocks: [
      overview('Dạng đề: "Discuss both views and give your own opinion." Rất dễ mất điểm nếu chỉ discuss hai phía nhưng quên opinion.'),
      callout('🎯 Công thức', 'View A → View B → Your opinion'),
      steps([
        { title: 'Introduction', description: 'Paraphrase, mention both views, clearly state your opinion.' },
        { title: 'Body 1', description: 'View A' },
        { title: 'Body 2', description: 'View B +/or your position' },
        { title: 'Conclusion', description: 'Restate opinion' },
      ]),
      callout('💡 Tip phòng thi', 'Khi brainstorm, lập ngay: Why do people believe A? Why do people believe B? Which side do I support? Why? Không cần opinion quá phức tạp.'),
      example([
        { label: 'Câu opinion an toàn', lines: [{ tag: 'Mẫu câu', text: '"I believe that although A has certain benefits, B is more beneficial because..."' }], note: '→ rất an toàn.' },
      ]),
      callout('⚠️ Bẫy', 'Học sinh viết "Some people believe A... Others believe B..." nhưng không bao giờ nói mình nghĩ gì → Task Response dễ bị ảnh hưởng.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'cause-solution', title: 'Type 03 – Cause & Solution', icon: '🔧', orderIndex: 13,
    summaryText: 'PROBLEM → WHY? → HOW TO FIX? — solution phải giải quyết đúng cause đã nêu.',
    blocks: [
      overview('Dạng đề: "What are the causes of this problem? What solutions can be taken?"'),
      callout('🎯 Công thức tư duy', 'PROBLEM → WHY? → HOW TO FIX?'),
      steps([{ title: 'Body 1 — Causes', description: 'Nên chọn 2 nguyên nhân chính. Mỗi nguyên nhân: Cause → Explanation → Example/Result.' }]),
      example([
        {
          label: 'Body 2 — Solutions phải giải quyết đúng Cause',
          lines: [
            { tag: 'Cause', text: 'People rely heavily on private cars.' },
            { tag: 'Solution', text: 'Improve public transport.' },
          ],
          note: 'Đây là quan hệ logic.',
        },
      ]),
      callout('💡 Tip cực quan trọng', 'Đừng viết solution kiểu quá chung như "The government should raise awareness." Hỏi tiếp: How? → through school campaigns, public advertising and community programmes.'),
      example([
        {
          label: 'Công thức Band 7',
          lines: [
            { tag: 'Cause A', text: '→ consequence → Solution A' },
            { tag: 'Cause B', text: '→ consequence → Solution B' },
          ],
          note: 'Hai bên liên kết với nhau sẽ rất dễ phát triển bài.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'effect-solution', title: 'Type 04 – Effect & Solution', icon: '💥', orderIndex: 14,
    summaryText: 'CAUSE ≠ EFFECT — đừng biến Body 1 thành "reasons why", hãy viết "consequences".',
    blocks: [
      overview('Dạng đề: "What are the effects of this trend? What solutions can be taken?" Khác Type 03 ở một điểm cực quan trọng: CAUSE ≠ EFFECT.'),
      example([
        {
          label: 'Phân biệt Cause vs Effect',
          lines: [
            { tag: 'Ví dụ', text: 'More people are working from home.' },
            { tag: 'Cause', text: 'technological development' },
            { tag: 'Effect', text: 'less commuting → reduced traffic congestion' },
          ],
        },
      ]),
      steps([
        { title: 'Body 1 — Effects', description: 'Effect 1 → explanation → example/result. Effect 2 → explanation → example/result.' },
        { title: 'Body 2 — Solutions', description: 'Solution 1 → how it works. Solution 2 → how it works.' },
      ]),
      callout('💡 Tip phòng thi', 'Nếu đề hỏi effects, tuyệt đối đừng biến Body 1 thành "There are several reasons why..." — hãy dùng: "This trend can have several consequences. One significant effect is... Another potential consequence is..."'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'cause-effect', title: 'Type 05 – Cause & Effect', icon: '🔗', orderIndex: 15,
    summaryText: 'WHY → WHAT HAPPENS — nối chuỗi Cause → Immediate Effect → Long-term Effect để kéo Band 6 lên 7.',
    blocks: [
      overview('Dạng đề: "What are the causes of this problem? What effects does it have?"'),
      callout('🎯 Công thức', 'WHY → WHAT HAPPENS'),
      steps([
        { title: 'Body 1', description: 'Cause 1 + Cause 2' },
        { title: 'Body 2', description: 'Effect 1 + Effect 2' },
      ]),
      callout('💡 Tip quan trọng nhất', 'Hai phần phải liên kết logic.'),
      example([
        {
          label: 'Chuỗi liên kết',
          lines: [
            { tag: 'Cause', text: 'People consume more fast food.' },
            { tag: 'Effect', text: 'This contributes to higher rates of obesity.' },
          ],
          note: 'Học sinh có thể tạo chuỗi: CAUSE → IMMEDIATE EFFECT → LONG-TERM EFFECT. Cách này đặc biệt tốt để kéo từ Band 6 lên Band 7.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'agree-disagree', title: 'Type 06 – Agree / Disagree', icon: '✅', orderIndex: 16,
    summaryText: 'Chọn lập trường ngay, không mất thời gian tìm "đáp án đúng" — IELTS chấm khả năng bảo vệ opinion.',
    blocks: [
      overview('Dạng đề: "To what extent do you agree or disagree?" hoặc "Do you agree or disagree?"'),
      callout('🎯 Chọn lập trường ngay', 'Ngay sau khi đọc đề: AGREE? DISAGREE? PARTLY AGREE? Không nên mất 10 phút suy nghĩ xem "cái nào mới thật sự đúng" — IELTS không chấm bạn theo việc opinion đó có giống examiner hay không, họ chấm bạn có bảo vệ được opinion không.'),
      list('Nếu AGREE', ['Body 1: Reason 1', 'Body 2: Reason 2']),
      list('Nếu DISAGREE', ['Body 1: Reason 1', 'Body 2: Reason 2']),
      list('Nếu PARTLY AGREE', ['Body 1: Side A', 'Body 2: Side B + why your position is stronger']),
      callout('💡 Tip Band 7+', 'Đừng chỉ viết "I agree because it is beneficial." Phải hỏi: Why? → How? → What is the result?'),
      example([
        {
          label: 'Idea development',
          lines: [
            { tag: 'Câu đơn giản', text: 'It is beneficial' },
            { tag: '→ vì sao', text: 'because it saves time' },
            { tag: '→ kết quả', text: 'therefore people can spend more time on productive activities.' },
          ],
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'positive-negative-development', title: 'Type 07 – Positive / Negative Development', icon: '⚡', orderIndex: 17,
    summaryText: 'Đưa ra judgement rõ ràng — và có thể sắp xếp Body theo trọng lượng lập luận.',
    blocks: [
      overview('Dạng đề: "Is this a positive or negative development?" hoặc "Do the advantages outweigh the disadvantages?"'),
      steps([{ title: 'Xác định position', description: 'Đầu tiên xác định: Positive or Negative? Sau đó chọn 2 lý do mạnh nhất để bảo vệ position.' }]),
      steps([
        { title: 'Introduction', description: 'Clearly state positive/negative' },
        { title: 'Body 1', description: 'Strongest reason' },
        { title: 'Body 2', description: 'Second reason' },
        { title: 'Conclusion', description: 'Reinforce judgement' },
      ]),
      callout('💡 Với "Do the advantages outweigh the disadvantages?"', 'Không chỉ viết "There are advantages and disadvantages." Phải đưa ra judgement: "Overall, I believe the advantages outweigh the disadvantages." hoặc ngược lại.'),
      callout('Advanced tip', 'Nếu advantages mạnh hơn: Body 1 = disadvantage, Body 2 = stronger advantages → tạo cảm giác lập luận có trọng lượng.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'quick-reference-table', title: '7 dạng – Cách nhớ siêu nhanh', icon: '🧠', orderIndex: 18,
    summaryText: 'Bảng tổng hợp câu hỏi chính và cấu trúc Body 1/Body 2 của cả 7 dạng.',
    blocks: [
      table('', ['Type', 'Câu hỏi chính', 'Body 1', 'Body 2'], [
        ['01 Adv/Disadv', 'Tốt & xấu gì?', 'Advantages', 'Disadvantages'],
        ['02 Both Views', 'A hay B?', 'View A', 'View B + Opinion'],
        ['03 Cause–Solution', 'Tại sao? Giải quyết thế nào?', 'Causes', 'Solutions'],
        ['04 Effect–Solution', 'Hậu quả? Giải quyết thế nào?', 'Effects', 'Solutions'],
        ['05 Cause–Effect', 'Tại sao? Hậu quả gì?', 'Causes', 'Effects'],
        ['06 Agree/Disagree', 'Bạn đồng ý không?', 'Reason 1', 'Reason 2'],
        ['07 Pos/Neg', 'Tốt hay xấu?', 'Reason 1', 'Reason 2'],
      ]),
    ],
  }),
];
