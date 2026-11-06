'use strict';

// The "how to do it" text of the Tips practices — the "Trước khi làm" box,
// the step names of the worked example ("I do") and of the hints ("We do"),
// the checklists. One copy, used by:
//   - the practice payload (readingTipPracticeService / listeningTipPracticeService
//     attach `practice.guide`), which the web page renders, and
//   - the printable handout (tipLecturePackService),
// so what a class gets on paper is word for word what students see online.

// ── Reading ─────────────────────────────────────────────────────────────

const READING_TYPES = {
  tfng: {
    name: 'True / False / Not Given',
    defs: [
      ['TRUE', 'Statement có cùng ý nghĩa với thông tin trong bài.'],
      ['FALSE', 'Bài đọc nói NGƯỢC lại statement (mâu thuẫn).'],
      ['NOT GIVEN', 'Bài đọc không cung cấp đủ thông tin để xác nhận hay bác bỏ statement.'],
    ],
    steps: [
      'Xác định keyword trong statement (tên riêng, số liệu, từ khó thay thế).',
      'Tìm phần liên quan trong bài bằng keyword hoặc cách diễn đạt tương đương.',
      'Đọc kỹ câu chứa thông tin và 1–2 câu xung quanh.',
      'So sánh Ý NGHĨA, không so từng chữ — chú ý từ hạn định: all / some, always / usually, only.',
      'Kết luận: cùng nghĩa → TRUE · ngược nghĩa → FALSE · bài không nói tới → NOT GIVEN.',
    ],
    warning: 'NOT GIVEN không có nghĩa là “không tìm thấy keyword”. Keyword có thể có trong bài, nhưng bài không nói gì về đúng điều statement khẳng định. VD: bài viết “The museum attracted 2 million visitors in 2010.”, statement “The museum was the most popular attraction in 2010.” → NOT GIVEN: bài có số khách nhưng không so sánh với điểm tham quan nào khác.',
  },
  ynng: {
    name: 'Yes / No / Not Given',
    defs: [
      ['YES', 'Statement khớp với quan điểm / nhận định của tác giả.'],
      ['NO', 'Statement trái với quan điểm của tác giả.'],
      ['NOT GIVEN', 'Không thể biết tác giả nghĩ gì về điều này.'],
    ],
    steps: [
      'Xác định ý kiến / nhận định (claim) trong statement — thường có tính từ đánh giá, so sánh, “should”.',
      'Tìm đoạn liên quan trong bài.',
      'Đọc kỹ câu thể hiện QUAN ĐIỂM của tác giả (tín hiệu: I believe, arguably, clearly, unfortunately, it is likely…).',
      'So sánh quan điểm tác giả với statement — ý kiến của người khác được trích dẫn chưa chắc là quan điểm tác giả.',
      'Phân biệt NO (tác giả nói ngược lại) với NOT GIVEN (tác giả không bày tỏ quan điểm về điểm đó).',
    ],
    warning: 'YES / NO / NOT GIVEN hỏi về QUAN ĐIỂM của tác giả; TRUE / FALSE / NOT GIVEN hỏi về THÔNG TIN trong bài.',
  },
  headings: {
    name: 'Matching Headings',
    steps: [
      'Đọc lướt đoạn cần tìm heading (có viền đỏ): câu đầu, câu cuối và câu sau từ đổi ý (However, But…) thường chứa ý chính.',
      'Tự tóm tắt ý chính của đoạn bằng một câu ngắn.',
      'Bỏ qua chi tiết hỗ trợ: ví dụ, số liệu, tên riêng.',
      'So nghĩa từng heading với ý chính — heading đúng thường là cách diễn đạt khác của ý chính.',
      'Loại heading gây nhiễu: chỉ khớp một chi tiết hoặc chỉ lặp lại một từ có trong đoạn.',
    ],
    warning: 'Heading phải bao quát CẢ đoạn. Heading chỉ đúng với một câu trong đoạn thường là bẫy.',
  },
  matching_info: {
    name: 'Matching Information',
    steps: [
      'Xác định loại thông tin cần tìm (a reference to / an example of / a description of / a comparison…) và keyword đặc trưng.',
      'Dự đoán cách bài có thể diễn đạt lại keyword.',
      'Scan từng đoạn tìm đúng chi tiết đó — đây là CHI TIẾT, không phải ý chính của đoạn.',
      'Đọc kỹ câu tìm được để chắc đúng loại thông tin (ví dụ ≠ lý do ≠ so sánh).',
      'Chọn chữ cái của đoạn chứa thông tin — một đoạn có thể được dùng nhiều lần.',
    ],
    warning: 'Thứ tự câu hỏi KHÔNG theo thứ tự đoạn văn — làm trước những câu có keyword dễ tìm (tên riêng, số liệu).',
  },
  matching_features: {
    name: 'Matching Features',
    steps: [
      'Đọc danh sách lựa chọn (người / nơi / nhóm / đặc điểm).',
      'Scan tìm từng tên trong bài và để ý mọi lần tên đó xuất hiện.',
      'Đọc ý kiến hoặc đặc điểm gắn với tên đó (kể cả he / she / they ngay sau).',
      'So sánh với câu cần ghép — thường là cách diễn đạt khác.',
      'Kiểm tra thông tin khớp đúng người / nhóm, tránh nhầm với người được nhắc ngay gần đó.',
    ],
    warning: 'Câu hỏi không theo thứ tự bài đọc, và một lựa chọn có thể được dùng nhiều lần.',
  },
  completion: {
    name: 'Sentence / Summary / Note Completion',
    steps: [
      'Đọc câu có chỗ trống, xác định yêu cầu ngữ pháp (sau a / the → danh từ; sau very → tính từ…).',
      'Dự đoán loại từ cần điền: danh từ, số, tính từ, động từ.',
      'Scan keyword trong câu để tìm vị trí evidence — câu hỏi thường theo thứ tự bài.',
      'Chép CHÍNH XÁC từ trong bài: không đổi dạng từ, không tự dùng từ đồng nghĩa.',
      'Kiểm tra giới hạn số từ và câu sau khi điền có đúng ngữ pháp không.',
    ],
    warning: 'Viết quá giới hạn từ (VD: 3 từ khi đề yêu cầu NO MORE THAN TWO WORDS) là sai, dù nội dung đúng.',
  },
  mcq: {
    name: 'Multiple Choice',
    steps: [
      'Đọc câu hỏi (chưa vội đọc đáp án) và xác định keyword.',
      'Tìm đoạn chứa evidence — câu hỏi thường theo thứ tự bài.',
      'Đọc kỹ evidence rồi mới đối chiếu từng đáp án.',
      'Loại đáp án sai: không có trong bài, sai chi tiết, hoặc đúng nhưng không trả lời câu hỏi.',
      'Chọn đáp án dựa trên evidence, không dựa vào hiểu biết chung.',
    ],
    warning: 'Đáp án lặp lại nhiều từ y hệt bài đọc thường là bẫy — đáp án đúng hay được diễn đạt khác.',
  },
  short_answer: {
    name: 'Short Answer Questions',
    steps: [
      'Xác định keyword của câu hỏi.',
      'Dự đoán loại đáp án từ từ để hỏi: Who → người, When → thời gian, Where → nơi chốn, How many / much → số.',
      'Scan tìm keyword hoặc cách diễn đạt tương đương — câu hỏi thường theo thứ tự bài.',
      'Chép chính xác từ trong bài.',
      'Kiểm tra giới hạn số từ.',
    ],
    warning: 'Không cần viết câu hoàn chỉnh — chỉ viết từ / cụm từ trả lời câu hỏi, đúng giới hạn từ.',
  },
};

// Step names of the worked example (question 1) and of the hints
// (question 2) of a question-type practice.
const READING_EXAMPLE_STEPS = ['Tìm keyword', 'Scan bài đọc', 'Đọc câu chứa evidence', 'So sánh & kết luận'];
const READING_EXAMPLE_STEPS_HEADINGS = ['Tìm câu then chốt của đoạn', 'Tóm tắt ý chính', 'So với danh sách heading', 'Kết luận'];
const READING_HINTS = ['keyword', 'vị trí', 'câu evidence'];
const READING_HINTS_HEADINGS = ['câu then chốt', 'cách chọn'];

const READING_SCAN = {
  title: '5 bước Scanning',
  steps: [
    'Xác định keyword trong câu hỏi — ưu tiên tên riêng, số, năm, thuật ngữ (đã tô sẵn).',
    'Dự đoán cách bài đọc có thể diễn đạt lại (paraphrase) nếu keyword là từ thường.',
    'Scan bài đọc tìm keyword — lướt mắt, KHÔNG đọc từng câu.',
    'Đọc kỹ 1–2 câu quanh vị trí vừa tìm thấy.',
    'Chép đáp án đúng chính tả, đúng giới hạn số từ.',
  ],
};

const READING_WORKFLOW = {
  title: 'Quy trình 7 bước',
  steps: ['Đọc tiêu đề', 'Skim các đoạn', 'Ý chính', 'Đọc câu hỏi', 'Tìm keyword', 'Scan bài', 'Kiểm tra evidence'],
};

// guide for a Reading practice (null when there's nothing to show —
// skimming / paraphrase give their one-line tips inside the question).
function readingGuide(kind, questionType) {
  if (kind === 'questions') {
    const t = READING_TYPES[questionType];
    if (!t) return null;
    const headings = questionType === 'headings';
    return {
      title: `Cách làm dạng ${t.name}`,
      defs: t.defs || null,
      steps: t.steps,
      warning: t.warning || '',
      example: headings ? READING_EXAMPLE_STEPS_HEADINGS : READING_EXAMPLE_STEPS,
      hints: headings ? READING_HINTS_HEADINGS : READING_HINTS,
    };
  }
  if (kind === 'scanning') return { ...READING_SCAN };
  if (kind === 'workflow') return { ...READING_WORKFLOW };
  return null;
}

// ── Listening ───────────────────────────────────────────────────────────

const LISTENING_TYPES = {
  form: {
    name: 'Form / Note / Table',
    steps: ['Đọc câu hỏi và nhãn của ô trống (Name, Date, Cost…).', 'Dự đoán loại đáp án: số? tên? ngày? danh từ?',
      'Gạch chân keyword.', 'Nghe keyword hoặc cách nói khác (paraphrase).', 'Chép đúng từ nghe được.',
      'Kiểm tra: chính tả · số ít / số nhiều · giới hạn từ.'],
    warning: 'Golden rule: đáp án có thể bị sửa lại ngay sau đó — “The course starts on Monday… actually, it’s been moved to Tuesday” → Tuesday. Nghe hết câu rồi mới chốt.',
  },
  mcq: {
    name: 'Multiple Choice',
    steps: ['Đọc câu hỏi (chưa vội đọc kỹ các option).', 'Xác định câu hỏi đang hỏi gì.', 'Gạch chân điểm KHÁC nhau giữa A / B / C.',
      'Dự đoán nếu có thể.', 'Nghe theo ý nghĩa, không chờ đúng từng chữ.', 'Loại các option gây nhiễu.', 'Chọn theo đúng điều audio nói.'],
    warning: 'Đừng chọn chỉ vì audio có đúng từ giống option. Bẫy: “At first I thought it was too expensive, but actually the main problem was…”.',
  },
  matching: {
    name: 'Matching',
    steps: ['Đọc danh sách lựa chọn (A, B, C…).', 'Xác định điểm khác nhau giữa các lựa chọn.', 'Gạch chân tên người / mục cần ghép.',
      'Dự đoán mối liên hệ có thể có.', 'Nghe theo từng người / mục.', 'Ghép theo ý nghĩa, không theo từ giống nhau.'],
    warning: 'Một lựa chọn có thể được nhắc tới chỉ để bị loại bỏ.',
  },
  map: {
    name: 'Map / Plan / Diagram',
    steps: ['Nhìn bản đồ / sơ đồ trước.', 'Tìm điểm bắt đầu (entrance, you are here…).', 'Xác định các mốc (landmarks).',
      'Nắm phương hướng: north, left / right, above / below.',
      'Nghe: next to · opposite · behind · on the left · at the end of · across from · between.', 'Đi theo đúng lộ trình người nói mô tả.'],
    warning: 'Sai lầm hay gặp: chỉ nghe keyword mà không theo chỉ dẫn phương hướng.',
  },
  sentence: {
    name: 'Sentence Completion',
    steps: ['Đọc cả câu.', 'Dự đoán ngữ pháp của từ cần điền.', 'Dự đoán loại đáp án.', 'Gạch chân keyword.', 'Nghe.',
      'Kiểm tra câu sau khi điền có đúng ngữ pháp.', 'Kiểm tra giới hạn từ.'],
    warning: 'Listening đòi hỏi đúng chính tả (accommodation), số ít / số nhiều (student ≠ students) và số liệu chính xác (15 ≠ 50).',
  },
  multi: {
    name: 'Multiple Answers',
    steps: ['Đọc TOÀN BỘ các option.', 'Gạch chân điểm khác nhau.', 'Xác định cần tìm mấy ý (TWO / THREE) và về điều gì.',
      'Nghe: một option có thể được nhắc tới rồi bị bác bỏ.', 'Chọn đủ số chữ cái đề yêu cầu.'],
    warning: 'Không chọn ngay option đầu tiên nghe thấy.',
  },
};

// Worked example (question 1): six steps; "We do" (question 2): four.
const LISTENING_EXAMPLE_STEPS = ['Gạch chân keyword', 'Dự đoán loại đáp án', 'Nghe đoạn audio', 'Tìm đáp án trong transcript', 'Đáp án', 'Giải thích'];
const LISTENING_GUIDED_STEPS = ['Gạch chân keyword', 'Dự đoán loại đáp án', 'Nghe đoạn audio', 'Trả lời'];

// Why an answer type, in words a student can reuse (example, step 2).
const LISTENING_TYPE_WHY = {
  proper: 'Chỗ trống cần một tên riêng (người, địa điểm, tổ chức) → nghe kỹ phần đánh vần, viết hoa chữ cái đầu.',
  date: 'Chỗ trống cần ngày / thứ / tháng → để ý cách đọc “the fifth of June”, “Tuesday the 3rd”.',
  time: 'Chỗ trống cần giờ → để ý a.m. / p.m., “half past”, “quarter to”.',
  price: 'Chỗ trống cần giá tiền → để ý £ / $, “per week”, “each”, và số bị sửa lại.',
  number: 'Chỗ trống cần một con số → để ý số điện thoại, số phòng, số lượng; 15 ≠ 50.',
  word: 'Chỗ trống cần một từ vựng → nhìn từ đứng trước / sau để đoán danh từ, tính từ hay động từ.',
};
const LISTENING_TYPE_LABEL = {
  proper: 'Tên riêng', date: 'Ngày / thứ / tháng', time: 'Giờ', price: 'Giá tiền', number: 'Số / mã số', word: 'Từ vựng',
};

// Before listening, for the letter types (example step 2 / "We do" step 2).
function listeningBeforeText(qtype, q) {
  const choices = q.choices || [];
  const keys = choices.map(c => c.key);
  switch (qtype) {
    case 'mcq':
      return `Đọc ${choices.length} lựa chọn ${keys.join(' / ')} và để ý chúng khác nhau ở đâu. Audio thường nhắc tới cả những lựa chọn sai — chờ ý trả lời đúng câu hỏi.`;
    case 'multi':
      return `Cần chọn đúng ${q.pick} chữ cái trong ${choices.length} lựa chọn. Đọc hết các lựa chọn trước; nghe xem ý nào được xác nhận, ý nào chỉ được nhắc tới rồi bị bác bỏ.`;
    case 'matching':
      return `Đọc danh sách ${keys[0]}–${keys[keys.length - 1]} trước. Khi nghe tới “${q.text}”, chờ ý nghĩa khớp với một lựa chọn — không phải từ giống hệt.`;
    case 'map':
      return 'Nhìn bản đồ trước: tìm điểm bắt đầu và các mốc. Khi nghe, đi theo từ chỉ hướng (next to, opposite, on the left…) chứ không chỉ chờ tên địa điểm.';
    default:
      return 'Đọc cả câu: sau khi điền, câu phải đúng ngữ pháp và không vượt giới hạn từ.';
  }
}

const LISTENING_CHECKLIST = [
  ['grammar', 'Ngữ pháp: đáp án ghép vào câu có đúng không?'],
  ['spelling', 'Chính tả: đã viết đúng từng chữ cái?'],
  ['plural', 'Số ít / số nhiều: có cần -s không?'],
  ['limit', 'Giới hạn từ: không viết quá số từ đề cho'],
];

const LISTENING_WORKFLOW = {
  title: 'Quy trình 5 bước',
  steps: ['Highlight keyword', 'Dự đoán', 'Nghe', 'Trả lời & tự kiểm tra', 'Kiểm tra đáp án'],
  checklist: LISTENING_CHECKLIST,
};

function listeningGuide(kind, qtype) {
  if (kind === 'qtype') {
    const t = LISTENING_TYPES[qtype];
    if (!t) return null;
    return {
      title: `Cách làm dạng ${t.name}`,
      name: t.name,
      steps: t.steps,
      warning: t.warning || '',
      example: LISTENING_EXAMPLE_STEPS,
      guided: LISTENING_GUIDED_STEPS,
    };
  }
  if (kind === 'workflow') return { ...LISTENING_WORKFLOW };
  return null;
}

module.exports = {
  readingGuide,
  listeningGuide,
  listeningBeforeText,
  LISTENING_TYPE_WHY,
  LISTENING_TYPE_LABEL,
  LISTENING_CHECKLIST,
  READING_TYPES,
  LISTENING_TYPES,
};
