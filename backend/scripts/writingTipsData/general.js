'use strict';
const { overview, steps, list, example, callout, table, summary, lesson } = require('./builder');

const CATEGORY = 'Chiến lược tổng quan';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'time-allocation', title: 'Phân bổ thời gian 40 phút', icon: '⏱️', orderIndex: 1,
    summaryText: '5 phút PLAN – 30 phút WRITE – 5 phút CHECK. 3 phút planning có thể cứu cả bài.',
    blocks: [
      overview('Công thức an toàn nhất:\n5 phút → PLAN\n30 phút → WRITE\n5 phút → CHECK'),
      table('Phân bổ thời gian cụ thể', ['Thời gian', 'Việc cần làm'], [
        ['0–2 phút', 'Đọc đề + xác định dạng'],
        ['2–5 phút', 'Brainstorm + chọn idea + lập outline'],
        ['5–15 phút', 'Introduction + Body 1'],
        ['15–25 phút', 'Body 2'],
        ['25–35 phút', 'Conclusion + hoàn thiện'],
        ['35–40 phút', 'Check grammar, vocabulary, spelling'],
      ]),
      callout('Quy tắc cực quan trọng', 'Đừng viết ngay khi vừa đọc đề. 3 phút planning có thể cứu cả bài.'),
      list('Nếu không plan, học sinh rất dễ', [
        'Lạc đề', 'Thiếu idea', 'Body 1 dài, Body 2 ngắn', 'Conclusion sơ sài', 'Hết giờ không kịp sửa lỗi.',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'idea-development-and-mistakes', title: 'Công thức phát triển Idea & Lỗi cần tránh', icon: '💡', orderIndex: 2,
    summaryText: 'IDEA → WHY → HOW/EXAMPLE → RESULT — công thức áp dụng cho mọi dạng bài Task 2.',
    blocks: [
      overview('Công thức chung để phát triển mọi idea, áp dụng cho mọi dạng bài Task 2.'),
      steps([
        { title: 'IDEA', description: 'Public transport should be improved.' },
        { title: 'WHY?', description: 'It can encourage people to stop using private vehicles.' },
        { title: 'HOW / EXAMPLE', description: 'More frequent and reliable buses would make public transport more convenient.' },
        { title: 'RESULT', description: 'This could reduce traffic congestion and air pollution.' },
      ]),
      example([
        {
          label: 'So sánh: idea nông vs idea được phát triển',
          lines: [
            { tag: 'Idea nông (1 câu)', text: '"Public transport is important because it reduces traffic."' },
            {
              tag: 'Idea được phát triển (Band 7+)',
              text: '"Improving public transport can reduce people\'s dependence on private vehicles. If buses and trains are more frequent, reliable and affordable, commuters are more likely to use them instead of driving. As a result, the number of cars on the road could fall, helping to reduce congestion and air pollution."',
            },
          ],
        },
      ]),
      list('🚨 5 lỗi phòng thi cần cấm học sinh', [
        'Viết ngay, không plan → dễ lạc hướng.',
        'Cố nhét vocabulary khó (mitigate, exacerbate, ubiquitous, detrimental...) nhưng dùng sai → accuracy quan trọng hơn fancy vocabulary.',
        'Một paragraph có 3–4 ideas → không idea nào được phát triển.',
        'Example quá dài — example chỉ để support idea, không phải kể chuyện.',
        'Conclusion đưa idea mới — conclusion chỉ summarise + reinforce position, không mở argument mới.',
      ]),
      summary('5 phút nghĩ – 30 phút viết – 5 phút sửa.\nMỗi Body = 1–2 ideas lớn.\nMỗi idea = Explain → Example/Result.'),
    ],
  }),
];
