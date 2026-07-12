// Extracted from QuestionGroupBuilder.jsx — the static config data (which
// group types exist, which question types each allows, display labels)
// and the two pure functions derived from it. No React dependency, no
// component state — safe to import from anywhere that needs to know the
// shape of a question group without pulling in the whole builder UI.

export const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii'];

export const GROUP_TYPES_READING = [
  {
    value: 'plain', icon: '💬', label: 'Câu hỏi thường',
    desc: 'Câu hỏi riêng lẻ — không cần bảng, sơ đồ hay cấu trúc đặc biệt',
    supports: ['True / False / Not Given', 'Yes / No / Not Given', 'Multiple Choice (1 đáp án A–D)', 'Short Answer / Fill-blank', 'Sentence Completion (Word Bank)', 'Choose TWO / THREE Letters A–G'],
  },
  {
    value: 'table', icon: '📋', label: 'Bảng (Table / Note)',
    desc: 'Bảng ô trống cần điền — dùng __Q1__ để đánh dấu ô trống trong bảng',
    supports: ['Table Completion', 'Note Completion (dạng bảng)'],
  },
  {
    value: 'note-form', icon: '📝', label: 'Note / Bullet Completion',
    desc: 'Khung ghi chú / danh sách dòng có chỗ trống — dùng __Q6__',
    supports: ['Note Completion', 'Bullet List Completion', 'Flow-chart Completion (dạng dòng)'],
  },
  {
    value: 'matching-options', icon: '🔗', label: 'Matching / Sentence Endings',
    desc: 'Kéo chữ cái A–H vào câu hoặc ô trống để ghép / nối',
    supports: ['Matching Features (người / sự kiện)', 'Matching Information (đoạn văn A–H)', 'Sentence Endings (nối câu)', 'Choose from List (chọn từ danh sách A–G)'],
  },
  {
    value: 'matching-headings', icon: '📌', label: 'Matching Headings',
    desc: 'Ghép tiêu đề i, ii, iii… vào đoạn văn A, B, C…',
    supports: ['Matching Headings (6–10 tiêu đề cho 5–8 đoạn văn)'],
  },
  {
    value: 'summary-completion', icon: '🧩', label: 'Summary Completion',
    desc: 'Đoạn tóm tắt + Word Bank A–J — học sinh kéo từ vào chỗ trống',
    supports: ['Summary Completion (Word Bank A–J)', 'Drag & Drop từ danh sách từ gợi ý'],
  },
  {
    value: 'map', icon: '🗺️', label: 'Map / Diagram',
    desc: 'Upload hình sơ đồ + điền nhãn — điền chữ tự do hoặc kéo-thả từ Option Bank',
    supports: ['Map Labelling', 'Diagram Labelling', 'Diagram / Plan Completion'],
  },
];

export const GROUP_TYPES_LISTENING = [
  {
    value: 'plain', icon: '💬', label: 'Câu hỏi thường',
    desc: 'Câu hỏi riêng lẻ — không cần bảng hay sơ đồ',
    supports: ['Multiple Choice (1 đáp án A–D)', 'Short Answer / Fill-blank', 'Sentence Completion (Word Bank)', 'Choose TWO / THREE Letters A–G'],
  },
  {
    value: 'table', icon: '📋', label: 'Table Completion',
    desc: 'Bảng ô trống cần điền — dùng __Q1__ để đánh dấu ô trống',
    supports: ['Table Completion', 'Note Completion (dạng bảng)'],
  },
  {
    value: 'note-form', icon: '📝', label: 'Form / Note / Flow-chart',
    desc: 'Điền vào biểu mẫu, ghi chú, lưu đồ — dùng __Q6__ cho chỗ trống',
    supports: ['Form Completion', 'Note Completion', 'Flow-chart Completion', 'Sentence Completion (dạng dòng)'],
  },
  {
    value: 'drag-drop', icon: '🎯', label: 'Kéo-thả (Drag & Drop)',
    desc: 'Học sinh kéo từ / cụm từ từ Option Bank vào chỗ trống trong lưu đồ / diagram',
    supports: ['Flow-chart Completion (kéo-thả)', 'Diagram / Plan Completion (kéo-thả)', 'Summary Completion (kéo-thả từ gợi ý)'],
  },
  {
    value: 'summary-completion', icon: '🧩', label: 'Summary Completion',
    desc: 'Đoạn tóm tắt + Word Bank A–J — kéo từ vào chỗ trống',
    supports: ['Summary Completion (Word Bank A–J)', 'Drag & Drop từ danh sách từ gợi ý'],
  },
  {
    value: 'matching-options', icon: '🔗', label: 'Matching',
    desc: 'Kéo chữ cái A–H vào câu để ghép thông tin',
    supports: ['Matching (Part 2 – người / địa điểm)', 'Matching (Part 3 – câu hỏi / ý kiến)', 'Choose from List A–G'],
  },
  {
    value: 'map', icon: '🗺️', label: 'Map / Plan / Diagram',
    desc: 'Upload hình bản đồ / sơ đồ + điền nhãn vào vị trí trên sơ đồ',
    supports: ['Map Labelling', 'Plan / Layout Labelling', 'Diagram Completion'],
  },
];

export const Q_TYPES = {
  reading: [
    { value: 'true-false-ng',       label: 'True / False / Not Given' },
    { value: 'yes-no-ng',           label: 'Yes / No / Not Given' },
    { value: 'multiple-choice',     label: 'Multiple Choice (1 đáp án)' },
    { value: 'multi-answer-group',  label: 'Choose TWO/THREE Letters A-G ✦' },
    { value: 'fill-blank',          label: 'Fill in the blank' },
    { value: 'sentence-completion', label: 'Sentence Completion (kéo-thả)' },
    { value: 'matching-headings',   label: 'Matching Headings' },
    { value: 'matching-info',       label: 'Matching Information' },
    { value: 'map-labelling',       label: 'Map Labelling' },
  ],
  listening: [
    { value: 'fill-blank',          label: 'Fill in the blank' },
    { value: 'sentence-completion', label: 'Sentence Completion (kéo-thả từ Word Bank)' },
    { value: 'multiple-choice',     label: 'Multiple Choice (1 đáp án)' },
    { value: 'multi-answer-group',  label: 'Choose TWO/THREE Letters A-G ✦' },
    { value: 'matching-info',       label: 'Matching – gõ chữ cái A/B/C vào ô' },
    { value: 'map-labelling',       label: 'Map Labelling' },
  ],
};

export const ALLOWED = {
  plain:               null,
  table:               ['fill-blank', 'sentence-completion'],
  'note-form':         ['fill-blank', 'sentence-completion'],
  'drag-drop':         ['fill-blank'],
  'matching-options':  ['matching-info'],
  'sentence-endings':  ['matching-info'],
  'matching-headings': ['matching-headings'],
  'summary-completion':['fill-blank'],
  map:                 ['map-labelling', 'fill-blank'],
};

export const GROUP_LABEL = {
  plain:               '💬 Câu hỏi thường',
  table:               '📋 Bảng (Table)',
  'note-form':         '📝 Note Completion',
  'drag-drop':         '🎯 Kéo-thả (Drag & Drop)',
  'matching-options':  '🔗 Matching Features',
  'sentence-endings':  '🔚 Sentence Endings',
  'matching-headings': '📌 Matching Headings',
  'summary-completion':'🧩 Summary Completion',
  map:                 '🗺️ Map/Diagram',
};

export const TYPE_LABEL = {
  'true-false-ng':     'True/False/NG',
  'yes-no-ng':         'Yes/No/NG',
  'multiple-choice':   'Multiple Choice',
  'multi-answer-group':'Choose Letters ✦',
  'checkbox':          'MC nhiều đáp án',
  'fill-blank':        'Fill-blank',
  'sentence-completion':'Sentence Completion',
  'matching-headings': 'Matching Headings',
  'matching-info':     'Matching Info',
  'map-labelling':     'Map Labelling',
};

export const ANS_HINT = {
  'true-false-ng':     'TRUE / FALSE / NOT GIVEN',
  'yes-no-ng':         'YES / NO / NOT GIVEN',
  'multiple-choice':   'Chữ cái: A, B, C hoặc D',
  'multi-answer-group':'Chữ cái: A, B, C… (1 đáp án/câu — tạo nhiều câu cùng options)',
  'checkbox':          '["A","C"] — mảng JSON đáp án đúng',
  'fill-blank':        'Từ/cụm từ cần điền. Nhiều đáp án: word1 / word2',
  'sentence-completion':'Từ trong Word Bank',
  'matching-headings': 'Số La Mã: i, ii, iii…',
  'matching-info':     'Chữ cái: A, B, C…',
  'map-labelling':     'Nhãn điền vào sơ đồ',
};

export function defaultGroup(type) {
  const base = { groupType: type, groupTitle: '', instruction: '', questions: [] };
  switch (type) {
    case 'table':             return { ...base, tableConfig: { headers: ['', '', ''], rows: [['', '', '']] } };
    case 'note-form':         return { ...base, noteConfig: { title: '', lines: [''] } };
    case 'matching-options':  return { ...base, matchingOptions: ['', '', '', '', '', ''], matchingOptionsTitle: '', matchingReuseAllowed: false, interchangeableAnswers: false };
    case 'matching-headings': return { ...base, headingsConfig: { headings: ROMAN.slice(0, 7).map(r => ({ numeral: r, text: '' })) } };
    case 'drag-drop':          return { ...base, dragDropConfig: { text: '', words: [] } };
    case 'summary-completion':return { ...base, summaryConfig: { text: '', wordBank: 'ABCDEFGH'.split('').map(l => ({ letter: l, word: '' })) } };
    case 'map':               return { ...base, imageUrl: '', dragDropConfig: { text: '', words: [] } };
    default:                  return base;
  }
}

export function autoQType(groupType, ctx) {
  if (['table', 'note-form', 'summary-completion', 'drag-drop'].includes(groupType)) return 'fill-blank';
  if (groupType === 'map') return 'map-labelling';
  if (['matching-options', 'sentence-endings'].includes(groupType)) return 'matching-info';
  if (groupType === 'matching-headings') return 'matching-headings';
  return ctx === 'reading' ? 'true-false-ng' : 'fill-blank';
}
