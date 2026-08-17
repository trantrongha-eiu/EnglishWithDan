'use strict';
const { overview, steps, list, callout, example, lesson } = require('./builder');

const CATEGORY = 'Part 1 – Interview';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'ore-formula-length', title: 'Công thức O.R.E. & độ dài câu trả lời', icon: '🗣️', orderIndex: 11,
    summaryText: 'Opinion → Reason → Example — nhưng đừng biến thành công thức học thuộc cho mọi câu.',
    blocks: [
      overview('Part 1 kéo dài khoảng 4–5 phút. Giám khảo hỏi những chủ đề quen thuộc như: Work/Study, Hometown, Home, Family, Friends, Food, Hobbies, Sports, Music, Reading, Transport, Technology, Daily routines, Weather, Shopping, Holidays... Đây là phần kiểm tra khả năng giao tiếp tự nhiên về những vấn đề quen thuộc.'),
      callout('Độ dài câu trả lời', 'Không có quy định "mỗi câu phải đúng 3–5 câu". Câu hỏi đơn giản: 2–3 câu có thể đủ. Câu hỏi cần phát triển: 3–4 câu. Mục tiêu: không quá ngắn → không biến thành Part 2.'),
      steps([
        { title: 'O — Opinion / Answer', description: 'Trả lời trực tiếp: "Yes, definitely." / "Not really." / "Personally, I prefer..." / "I\'d say..."' },
        { title: 'R — Reason', description: 'Giải thích: "Mainly because..." / "The main reason is that..." / "That\'s because..."' },
        { title: 'E — Example / Detail', description: 'Thêm ví dụ hoặc chi tiết: "For example,..." / "For instance,..." / "Especially when..." / "I remember once..."' },
      ]),
      example([
        {
          label: 'Ví dụ áp dụng O.R.E.',
          lines: [
            { tag: 'Q', text: 'Do you enjoy cooking?' },
            { tag: 'A', text: 'Yes, definitely. I find cooking quite relaxing because it allows me to switch off after a busy day. For example, I often cook dinner at the weekend when I have more free time.' },
          ],
        },
      ]),
      callout('⚠️ Đừng biến O.R.E. thành "công thức học thuộc"', 'Nếu câu hỏi đơn giản như "Do you like coffee?", không cần đủ Opinion + Reason + Example + Conclusion. Chỉ cần: "Yes, quite a lot. I usually have a cup in the morning because it helps me wake up." Band cao = biết phát triển vừa đủ.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'part1-by-band', title: 'Part 1 theo Band 6 → 7 → 8', icon: '📊', orderIndex: 12,
    summaryText: 'Band 6: Answer + Why. Band 7: thêm specific detail. Band 8: natural + nuanced + spontaneous.',
    blocks: [
      example([
        {
          label: 'BAND 6 — Answer + Why',
          lines: [
            { tag: 'Q', text: 'Do you like reading?' },
            { tag: 'A', text: 'Yes, I do. I like reading because it\'s relaxing and I can learn new things.' },
          ],
          note: 'Không nên chỉ trả lời: "Yes." / "No." / "Sometimes."',
        },
        {
          label: 'BAND 7 — Answer + Explanation + Detail',
          lines: [
            { tag: 'A', text: 'Yes, quite a lot. I find reading particularly relaxing after a long day, especially when I want to take a break from my phone. These days, I mostly read books about psychology.' },
          ],
          note: '→ Có specific detail.',
        },
        {
          label: 'BAND 8 — Natural + nuanced + spontaneous',
          lines: [
            { tag: 'A', text: 'Absolutely, although I\'m quite selective about what I read. I used to read fiction almost exclusively, but these days I\'ve become much more interested in psychology and non-fiction because I enjoy understanding why people behave the way they do.' },
          ],
          note: 'Không cần vocabulary quá "academic".',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'difficult-questions-fillers', title: 'Xử lý câu hỏi khó, Fillers & tránh học thuộc', icon: '🧩', orderIndex: 13,
    summaryText: 'Không có ý tưởng? 5 cách xử lý. Cần câu giờ? Dùng filler tự nhiên, đừng lạm dụng um/you know.',
    blocks: [
      list('Nếu không có ý tưởng — 5 cách xử lý', [
        'Cách 1 — Thành thật: "Not really, to be honest."',
        'Cách 2 — Qualification: "It depends, really."',
        'Cách 3 — So sánh quá khứ: "I didn\'t use to, but these days..."',
        'Cách 4 — Thay đổi theo hoàn cảnh: "It depends on how much free time I have."',
        'Cách 5 — Cho ví dụ gần nhất: "For example, last weekend..."',
      ]),
      list('Fillers — câu giờ tự nhiên (khi cần 1–2 giây suy nghĩ)', [
        'Well,...', 'Let me think...', "That's an interesting question.", 'I suppose...', "I'd say...", 'Actually,...', 'To be honest,...',
      ]),
      callout('Không nên lạm dụng', '"Umm... umm... umm..." hoặc "You know... you know... you know..." — mục tiêu là natural hesitation, không phải nhét filler vào mọi câu.'),
      callout('❌ Không học thuộc câu trả lời', 'Học "My hometown is a beautiful and peaceful place located in..." — nếu giám khảo hỏi khác một chút → dễ bị "vỡ bài".'),
      list('✅ Học idea bank thay vì học thuộc câu', ['hometown → peaceful → food → friendly people → childhood memories', 'Sau đó ghép linh hoạt theo câu hỏi thực tế.']),
    ],
  }),
];
