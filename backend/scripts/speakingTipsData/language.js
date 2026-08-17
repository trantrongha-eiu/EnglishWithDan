'use strict';
const { list, callout, example, lesson } = require('./builder');

const CATEGORY = 'Ngôn ngữ theo Band';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'discourse-markers', title: 'Discourse Markers – dùng sao cho tự nhiên', icon: '🔗', orderIndex: 41,
    summaryText: 'Speaking cần nghe giống nói, không giống essay — đừng nhồi discourse markers vào mỗi câu.',
    blocks: [
      list('Mở đầu ý kiến', ['I think...', "I'd say...", 'In my view...', 'Personally,...', 'Generally speaking,...']),
      list('Thêm ý', ['Also,...', "What's more,...", 'On top of that,...']),
      list('Giải thích', ['Mainly because...', 'This is largely because...', 'One reason is that...']),
      list('Ví dụ', ['For example,...', 'For instance,...', 'A good example would be...']),
      list('Đối lập', ['However,...', 'That said,...', 'Having said that,...', 'On the other hand,...']),
      list('Qualification', ['To some extent,...', 'In many cases,...', 'It depends on...', 'Not necessarily.']),
      list('Kết luận', ['So, overall,...', 'On balance,...', 'All things considered,...']),
      callout('⚠️ Không cần nhồi discourse markers', 'Band 8 không phải là "Firstly... Moreover... Furthermore... Nevertheless... Consequently..." trong mỗi câu trả lời. Speaking cần nghe giống nói, không giống essay.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'vocabulary-by-band', title: 'Vocabulary theo Band', icon: '📚', orderIndex: 42,
    summaryText: 'Band 6: từ phổ biến + collocation đúng. Band 7: paraphrasing. Band 8: precision hơn là từ khó.',
    blocks: [
      list('BAND 6 — Tập trung: common vocabulary + correct collocations', [
        'save time', 'reduce stress', 'spend time with family', 'keep in touch', 'get a good job',
      ]),
      list('BAND 7 — Tập trung: collocations + paraphrasing + topic vocabulary', [
        'maintain close relationships', 'achieve a better work-life balance', 'have access to education',
        'raise public awareness', 'adapt to technological changes',
      ]),
      example([
        {
          label: 'BAND 8 — Precision + flexibility + natural idiomatic language',
          lines: [
            { tag: 'Thay vì', text: 'Technology is good.' },
            { tag: '→', text: 'Technology has made everyday life considerably more convenient.' },
            { tag: 'Thay vì', text: 'It has many bad effects.' },
            { tag: '→', text: 'It can have unintended consequences.' },
          ],
        },
      ]),
      callout('⚠️ Nhưng', 'Không cố nhét từ khó nếu không chắc. Precise > complicated.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'grammar-by-band', title: 'Grammar theo Band', icon: '✍️', orderIndex: 43,
    summaryText: 'Band 8 không phải "càng phức tạp càng tốt" — mà là range + control, chỉ dùng khi tự nhiên.',
    blocks: [
      list('Band 6 — phải chắc', [
        'present simple', 'past simple', 'future', 'comparatives', 'because / although', 'basic relative clauses',
      ]),
      list('Band 7 — thêm', [
        'conditionals', 'relative clauses', 'concessive clauses', 'participle clauses', 'complex noun phrases',
      ]),
      example([{ label: 'Ví dụ Band 7', lines: [{ tag: 'Sample', text: 'Although technology has made communication easier, it has also created new problems.' }] }]),
      callout('Band 8', 'Mục tiêu không phải "càng phức tạp càng tốt". Mà là Range + control.'),
      example([{ label: 'Ví dụ Band 8', lines: [{ tag: 'Sample', text: 'Had people not adopted smartphones so rapidly, the way we communicate today might have been very different.' }], note: 'Nhưng chỉ dùng nếu tự nhiên và kiểm soát được.' }]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'pronunciation-by-band', title: 'Pronunciation theo Band', icon: '🔊', orderIndex: 44,
    summaryText: 'IELTS không yêu cầu accent Anh/Mỹ — Intelligibility > accent.',
    blocks: [
      callout('BAND 6', 'Ưu tiên: CLEAR. Người nghe phải hiểu.'),
      list('BAND 7 — Tập', ['word stress', 'sentence stress', 'linking', 'intonation']),
      example([{ label: 'Ví dụ nhấn trọng âm câu', lines: [{ tag: 'Sample', text: 'I REALLY enjoyed it because it was SO relaxing.' }] }]),
      list('BAND 8 — Tập', ['rhythm', 'chunking', 'connected speech', 'natural intonation', 'emphasis']),
      callout('Không cần cố "fake accent"', 'IELTS không yêu cầu bạn nói giọng Anh hay Mỹ. Intelligibility > accent.'),
    ],
  }),
];
