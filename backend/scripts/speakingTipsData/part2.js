'use strict';
const { overview, steps, list, callout, example, lesson } = require('./builder');

const CATEGORY = 'Part 2 – Long Turn';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'preparation-formulas', title: 'Chuẩn bị 1 phút & công thức nói', icon: '⏱️', orderIndex: 21,
    summaryText: 'Chỉ ghi keyword, không viết câu hoàn chỉnh — dùng 5W1H hoặc Story Framework.',
    blocks: [
      overview('Bạn nhận một cue card, có khoảng 1 phút chuẩn bị, sau đó nói tối đa 2 phút. Giám khảo có thể dừng bạn khi hết thời gian.'),
      callout('Mục tiêu quan trọng nhất', 'Không phải "nói thật hay". Mà trước tiên: nói liên tục và phát triển được nội dung trong khoảng 2 phút.'),
      callout('Chiến thuật 1 phút chuẩn bị', 'Đừng viết câu hoàn chỉnh như "I went to Da Nang with my family last summer because..." — quá chậm. Chỉ viết keyword: WHO → WHERE → WHEN → WHAT → FEELING → WHY.'),
      example([
        {
          label: 'Ví dụ ghi keyword',
          lines: [
            { tag: 'Cue card', text: 'Describe a memorable trip.' },
            { tag: 'Ghi chú', text: 'Da Nang / family / last summer / beach → seafood → hotel / rain / surprised / family time' },
          ],
          note: 'Chỉ cần vậy.',
        },
      ]),
      steps([
        { title: 'Cách 1 — 5W1H', description: 'WHO → WHEN → WHERE → WHAT → HOW → WHY' },
        { title: 'Cách 2 — STORY FRAMEWORK (phù hợp Band 6–7)', description: 'BACKGROUND (when/where/who?) → EVENT (what happened?) → DETAILS (what did you see/do?) → FEELING (how did you feel?) → REFLECTION (why was it memorable?)' },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'storytelling-rescue-unfamiliar-topic', title: 'Storytelling, cứu bài & xử lý khi bí chủ đề', icon: '📖', orderIndex: 22,
    summaryText: 'Biến bullet point thành câu chuyện; dùng idea extension khi hết ý; chọn câu chuyện gần nhất khi không biết chủ đề.',
    blocks: [
      callout('Đừng chỉ trả lời bullet point', 'Cue card "Describe a person who helped you" — không nên trả lời máy móc "His name is... He is... He helped me... I like him..." Hãy biến thành một câu chuyện: "I first met him when... At the time... What happened was... I remember that... Looking back,..."'),
      list('Storytelling tips — kéo dài bài nói tự nhiên', [
        'Mô tả: "It was a small..." / "What stood out was..."',
        'Kể diễn biến: "At first..." / "Then..." / "After that..." / "Eventually..."',
        'Cảm xúc: "I was genuinely surprised..." / "I felt quite relieved..." / "I was a little disappointed..."',
        'Reflection: "Looking back,..." / "Thinking about it now,..." / "What I learned from the experience was..."',
      ]),
      callout('Cứu bài khi hết ý (idea extension, không phải filler vô nghĩa)', '"Another thing worth mentioning is..." / "What I remember most clearly is..." / "Something else that stood out was..." / "Looking back, I realise that..." / "I suppose the main reason I remember it is..."'),
      callout('Nếu không biết chủ đề', 'Không được nói "I don\'t know." / "I\'ve never experienced this." / "I can\'t think of anything." Thay bằng: "I\'ve never really experienced this myself, but one situation that comes to mind is..." hoặc "It\'s not something I normally do, but if I had to choose, I\'d probably talk about..." Bạn được phép chọn một câu chuyện gần với cue card.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'part2-by-band', title: 'Part 2 theo Band 6 → 7 → 8', icon: '📊', orderIndex: 23,
    summaryText: 'Band 6: hoàn thành nhiệm vụ. Band 7: kể chuyện mạch lạc. Band 8: kiểm soát câu chuyện tự nhiên.',
    blocks: [
      steps([
        { title: 'BAND 6 — Complete the task + keep talking', description: 'Tập trung: 5W1H, past tense nếu kể chuyện, sequence words, không dừng quá lâu.\nFramework: WHO → WHEN → WHERE → WHAT → FEELING' },
        { title: 'BAND 7 — Tell a coherent story', description: 'Thêm: specific details, sensory description, feelings, reasons, consequences, reflection. Không chỉ "What happened?" mà còn "Why did it matter?"' },
        { title: 'BAND 8 — Control the narrative naturally', description: 'Có thể: chuyển thời gian, mô tả sắc thái, sử dụng storytelling language, đưa reflection, dùng complex sentences tự nhiên.' },
      ]),
      example([
        {
          label: 'Ví dụ Band 8',
          lines: [{ tag: 'Sample', text: "At the time, I didn't think much of it. It was only afterwards that I realised how significant that experience had actually been for me." }],
        },
      ]),
    ],
  }),
];
