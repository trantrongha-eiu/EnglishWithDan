'use strict';
const { overview, list, callout, example, lesson } = require('./builder');

const CATEGORY = 'Part 3 – Discussion';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'golden-rule-6-types', title: 'Quy tắc vàng & 6 dạng câu hỏi thường gặp', icon: '💬', orderIndex: 31,
    summaryText: 'Không bao giờ dừng ở "Yes/No" — luôn Position → Why → Development → Example/Result.',
    blocks: [
      overview('Part 3 kéo dài khoảng 4–5 phút. Câu hỏi thường trừu tượng hơn, liên quan đến xã hội, yêu cầu giải thích, so sánh, hỏi nguyên nhân, hỏi tương lai, hỏi vai trò chính phủ, hỏi sự thay đổi giữa các thế hệ. Part 1 hỏi về YOU; Part 3 hỏi về PEOPLE / SOCIETY / GOVERNMENT / FUTURE.'),
      callout('Quy tắc vàng', 'Không trả lời "Yes." / "No." / "I think so." rồi dừng. Hãy trả lời: POSITION → WHY → DEVELOPMENT → EXAMPLE / RESULT.'),
      example([
        {
          label: 'TYPE 1 — WHY / REASON',
          lines: [
            { tag: 'Công thức', text: 'CAUSE → EXPLANATION → EXAMPLE → RESULT' },
            { tag: 'Q', text: 'Why do people like travelling?' },
            { tag: 'A', text: 'I think there are several reasons. First of all, travelling allows people to escape from their daily routines and reduce stress. It also gives them an opportunity to experience different cultures. As a result, people often return home feeling more relaxed and having a broader perspective.' },
          ],
          note: 'Band 8: có thể phát triển theo psychological → practical → social.',
        },
        {
          label: 'TYPE 2 — OPINION',
          lines: [
            { tag: 'Công thức', text: 'POSITION → ARGUMENT → LIMITATION → CONCLUSION' },
            { tag: 'Q', text: 'Do you think technology has improved people\'s lives?' },
            { tag: 'Cụm hữu ích', text: 'To some extent, yes. / Generally speaking... / That said,... / Having said that,... / It depends largely on... / On balance,...' },
          ],
          note: 'Band 8: không cần "Yes + 3 reasons" — hãy có nuance.',
        },
        {
          label: 'TYPE 3 — COMPARE / CONTRAST',
          lines: [
            { tag: 'Công thức', text: 'A → B → DIFFERENCE → SIMILARITY → OVERALL' },
            { tag: 'Q', text: 'How is shopping different now compared with the past?' },
            { tag: 'Từ khóa', text: 'whereas / while / unlike / in contrast / compared with / similarly' },
            { tag: '❌ Tách rời', text: 'Online shopping is convenient. Physical shopping is slower.' },
            { tag: '✅ Combine (Band 7+)', text: 'While online shopping is considerably more convenient, physical stores still offer a more tangible experience.' },
          ],
        },
        {
          label: 'TYPE 4 — GOVERNMENT / POLICY',
          lines: [
            { tag: 'Công thức', text: 'RESPONSIBILITY → WHY → LIMIT → SOLUTION' },
            { tag: 'Q', text: 'Should governments do more to protect the environment?' },
            { tag: 'Vocabulary', text: 'regulate / enforce regulations / provide funding / subsidise / incentivise / impose restrictions / raise public awareness' },
            { tag: '❌ Tránh', text: 'The government should do everything.' },
            { tag: '✅ Band 7–8', text: "Governments have an important role to play, but they shouldn't be the only actors responsible." },
          ],
        },
        {
          label: 'TYPE 5 — YOUNG VS OLD / GENERATIONS',
          lines: [
            { tag: '❌ Tránh generalise', text: 'Young people are lazy. / Old people don\'t understand technology.' },
            { tag: '✅ Nên dùng', text: 'tend to / are more likely to / generally / in many cases / to some extent / this isn\'t true of everyone' },
            { tag: 'Framework', text: 'YOUNG → WHY → OLD → WHY → QUALIFICATION' },
          ],
        },
        {
          label: 'TYPE 6 — FUTURE / PREDICTION',
          lines: [
            { tag: 'Công thức', text: 'CURRENT TREND → PREDICTION → REASON → CAVEAT' },
            { tag: 'Sample', text: 'Looking at current trends, I think remote working is likely to become even more common. This is partly because digital technology has made collaboration much easier. That said, I don\'t think traditional offices will disappear completely, since some types of work still require face-to-face interaction.' },
          ],
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'idea-generator-part3-by-band', title: 'Idea Generator & Part 3 theo Band 6 → 7 → 8', icon: '🧠', orderIndex: 32,
    summaryText: 'Bí ý tưởng? Tự hỏi People/Money/Technology/Government/Education/Society/Environment/Future.',
    blocks: [
      list('"Idea Generator" — khi bí ý tưởng, hãy tự hỏi', [
        'PEOPLE — What do people want?',
        'MONEY — Is there an economic reason?',
        'TECHNOLOGY — Has technology changed this?',
        'GOVERNMENT — What can governments do?',
        'EDUCATION — Can schools influence this?',
        'SOCIETY — How does it affect communities?',
        'ENVIRONMENT — What is the environmental impact?',
        'FUTURE — What might happen next?',
      ]),
      callout('', 'Đây là idea generator, không phải template để học thuộc.'),
      example([
        {
          label: 'BAND 6 — Answer + Why',
          lines: [{ tag: 'A', text: "I think people use social media because it's convenient. They can communicate with friends easily." }],
        },
        {
          label: 'BAND 7 — Answer + Explain + Example',
          lines: [{ tag: 'A', text: 'I think convenience is probably the main reason. Social media allows people to maintain relationships without having to meet face to face. For example, people who move abroad can still communicate with their family every day.' }],
        },
        {
          label: 'BAND 8 — Position + Development + Qualification + Implication',
          lines: [{ tag: 'A', text: "Convenience is certainly one of the main factors, although I think the social dimension is equally important. Social media has made it possible to maintain relationships across geographical boundaries with almost no effort. However, this convenience can also encourage more superficial forms of communication, particularly when people rely heavily on messaging rather than face-to-face interaction. So, in my view, technology hasn't simply changed how frequently we communicate; it has changed the nature of communication itself." }],
        },
      ]),
    ],
  }),
];
