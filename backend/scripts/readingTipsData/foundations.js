'use strict';
const { overview, list, table, steps, callout, example, summary, lesson } = require('./builder');

// A new, foundational category shown BEFORE "Chiến thuật theo dạng bài" —
// skimming/scanning aren't a question type, they're the reading technique
// every other strategy in this section assumes the student already has.
// orderIndex is negative (existing categories use 1-8 and 11-13, a single
// global sort — see readingTipService.listLessons) so this group always
// sorts first regardless of what other categories are added later.
const CATEGORY = 'Kỹ thuật đọc nền tảng';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'skimming', title: 'Skimming – Đọc lấy ý chính', icon: '🏃', orderIndex: -4,
    summaryText: 'Đọc nhanh Title + câu đầu mỗi đoạn + từ khóa lặp lại để nắm ý chính, không đọc từng từ.',
    blocks: [
      callout('📌 Trước khi học kỹ năng', 'Vốn từ vựng chính là chìa khóa để nâng band trước khi học bất kỳ kỹ năng nào — hãy dành 20–30 phút mỗi ngày để học từ trong sổ từ vựng (Vocab) của bạn.'),
      overview('Skimming = đọc nhanh để hiểu nội dung chính của bài, không đọc từng từ.\nMục tiêu: biết bài nói về chủ đề gì, xác định ý chính của từng đoạn, hiểu cấu trúc và hướng phát triển của bài, và tìm được đoạn có khả năng chứa câu trả lời.\nSkimming ≠ đọc nhanh từng câu. Skimming = đọc có chọn lọc.'),
      list('Chỉ cần tập trung vào 4 thứ (không cần đọc toàn bài)', [
        'Title — tiêu đề, giúp đoán ngay chủ đề. VD: "The Rise of Electric Vehicles" → bài chắc chắn nói về electric vehicles, development, advantages/disadvantages, environmental impact, future.',
        'Câu đầu mỗi đoạn — thường giới thiệu main idea của cả đoạn.',
        'Keywords nổi bật — tên riêng, địa điểm, năm, số liệu, từ viết hoa, từ được lặp lại, thuật ngữ quan trọng.',
        'Linking words — "biển báo giao thông" của bài đọc, báo trước hướng ý sắp tới.',
      ]),
      table('Linking words thường gặp', ['Signal', 'Chức năng'], [
        ['however', 'contrast'],
        ['therefore', 'result'],
        ['because', 'reason'],
        ['for example', 'example'],
        ['in addition', 'additional idea'],
        ['as a result', 'consequence'],
        ['in contrast', 'opposite idea'],
        ['although', 'contrast'],
        ['firstly / secondly', 'sequence'],
      ]),
      steps([
        { title: 'Bước 1 (~5–10 giây)', description: 'Đọc title. Tự hỏi: "What is this text probably about?"' },
        { title: 'Bước 2 (~10–20 giây)', description: 'Đọc câu đầu mỗi đoạn — không cố dịch, chỉ hỏi "What is this paragraph mainly about?"' },
        { title: 'Bước 3', description: 'Nhìn các từ/ý lặp lại nhiều lần để tìm topic trung tâm. VD: plastic → plastic waste → plastic bottles → plastic pollution ⇒ topic là "plastic pollution".' },
      ]),
      callout('Ví dụ skim số liệu', '"In 2010, only 2% of new cars sold in Norway were electric. By 2020, this figure had risen to 54%." — Skimming không cần nhớ từng con số, chỉ cần nắm ý: 2010 → 2% → 2020 → 54% → tăng mạnh.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'scanning', title: 'Scanning – Tìm thông tin cụ thể', icon: '🔍', orderIndex: -3,
    summaryText: 'Quét bài để tìm đúng số liệu/tên riêng/mốc thời gian mà câu hỏi cần — không phải đọc hiểu toàn bài.',
    blocks: [
      overview('Scanning = đọc nhanh để tìm MỘT thông tin cụ thể, không cần hiểu toàn bài.\nVD: câu hỏi "When was the first electric car developed?" → không cần hiểu cả bài, chỉ cần mắt quét nhanh tìm một năm (a year).'),
      list('Scanning cần tìm gì', [
        'Numbers — 1990, 25%, 3 million, $500',
        'Names — Michael Jackson, Tesla, Harvard University',
        'Places — Vietnam, London, the United States',
        'Specific keywords — solar energy, public transport, smartphones',
      ]),
      callout('⚠️ Lỗi rất phổ biến ở học sinh B1+', 'Scanning ≠ tìm đúng từ y chang. Câu hỏi trong IELTS hầu như luôn paraphrase lại từ ngữ của bài đọc.'),
      example([
        {
          label: 'Ví dụ paraphrase khi scan',
          passage: 'Passage: "Teenagers are increasingly choosing to purchase products on the Internet because it is convenient and saves time."',
          statement: 'Question: "Why do young people prefer online shopping?"',
          note: '→ "prefer online shopping" trong câu hỏi chính là "choosing to purchase products on the Internet" trong bài — một cặp paraphrase, không phải từ giống hệt.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'keyword-to-paraphrase', title: 'Bảng từ khóa → Paraphrase', icon: '🔁', orderIndex: -2,
    summaryText: 'Câu hỏi hiếm khi lặp lại đúng từ trong bài — học thuộc các cặp paraphrase quen thuộc để scan nhanh hơn.',
    blocks: [
      overview('Đây là kỹ năng cực kỳ quan trọng trong IELTS Reading: từ khóa trong câu hỏi thường KHÔNG xuất hiện y hệt trong bài, mà được diễn đạt lại (paraphrase).'),
      table('Từ trong câu hỏi → thường gặp trong bài là', ['Question', 'Passage'], [
        ['buy', 'purchase'],
        ['young people', 'teenagers'],
        ['children', 'youngsters'],
        ['important', 'significant'],
        ['difficult', 'challenging'],
        ['cheap', 'inexpensive'],
        ['expensive', 'costly'],
        ['increase', 'rise'],
        ['decrease', 'decline'],
        ['cause', 'lead to'],
        ['because', 'due to'],
        ['help', 'assist'],
        ['use', 'utilize'],
        ['job', 'employment'],
        ['problem', 'issue'],
        ['improve', 'enhance'],
        ['reduce', 'decrease'],
        ['old people', 'elderly people'],
      ]),
      example([
        {
          label: 'Ví dụ áp dụng',
          statement: 'Question: "What caused the increase in traffic?"',
          passage: 'Scan trong bài các cách diễn đạt của "increase in traffic": "rise in traffic", "growing traffic", "increased congestion", "traffic has grown"...',
          note: '→ Phải quét theo Ý NGHĨA của "increase in traffic", không chỉ quét đúng 3 chữ đó.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'skim-scan-workflow', title: 'Quy trình làm bài & Skimming vs Scanning', icon: '🧭', orderIndex: -1,
    summaryText: 'So sánh 2 kỹ thuật + quy trình 6 bước: đọc câu hỏi trước, không đọc bài từ đầu tới cuối.',
    blocks: [
      table('Skimming vs Scanning', ['', 'Skimming', 'Scanning'], [
        ['Mục tiêu', 'Tìm main idea', 'Tìm specific information'],
        ['Cách đọc', 'Đọc nhanh toàn bài', 'Quét bài để tìm vị trí'],
        ['Tập trung vào', 'Title, câu đầu đoạn, ý lặp lại', 'Numbers, names, dates, keywords'],
        ['Câu hỏi tự đặt ra', '"What is this about?"', '"Where is this information?"'],
      ]),
      callout('Công thức nhớ', '🧠 SKIM = BIG PICTURE  ·  🔎 SCAN = SPECIFIC INFORMATION'),
      overview('Thay vì đọc bài từ đầu → dịch → đọc câu hỏi → quay lại bài (rất tốn thời gian), hãy làm theo quy trình ngược lại:'),
      steps([
        { title: 'Bước 1', description: 'Đọc câu hỏi trước.' },
        { title: 'Bước 2', description: 'Gạch chân keyword trong câu hỏi.' },
        { title: 'Bước 3', description: 'Dự đoán loại thông tin cần tìm. VD: "The first smartphone was developed in ___" → cần YEAR/DATE.' },
        { title: 'Bước 4', description: 'Scan để tìm keyword hoặc paraphrase của nó trong bài.' },
        { title: 'Bước 5', description: 'Đọc kỹ 1–3 câu xung quanh vị trí vừa tìm được.' },
        { title: 'Bước 6', description: 'Đối chiếu lại với câu hỏi trước khi chọn đáp án — không chọn chỉ vì thấy keyword giống nhau.' },
      ]),
      list('3 lỗi cần tránh', [
        'Đọc từng từ, dịch toàn bài — IELTS Reading không yêu cầu hiểu 100% văn bản.',
        'Tìm đúng từ y chang trong câu hỏi — IELTS rất thích dùng paraphrase.',
        'Thấy keyword là chọn đáp án ngay — keyword chỉ giúp định vị thông tin, phải đọc kỹ câu chứa nó để kiểm tra ý nghĩa rồi mới chọn.',
      ]),
      summary('Skim for the idea. Scan for the answer. Keywords help you locate the answer; meaning helps you choose the answer.'),
    ],
  }),
];
