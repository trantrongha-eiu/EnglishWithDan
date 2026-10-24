// Vol 4 - reading/test 5/test 5.pdf - Reading Passage 2 (PDF p4–9). Not in the bank / mini-ielts. Text = PDF (photo, clean
// OCR); the first paragraph is an unlettered introduction, A–G as printed. The PDF lost words in paragraph A
// ("…stakeholders to justify CSR initiatives to improve a company's image") — the explain file's copy still ends "…stakeholders
// to do business." → restored "to do business. Reputation is used by many companies to justify CSR initiatives on the grounds
// that they will improve…" (the source, Porter & Kramer, "Strategy and Society", HBR 2006 — wording confirmed by quotations online; the
// tuhoc.dolenglish.vn copy has the same gap as the PDF). "General Electronics" → General
// Electric (passage + option A; the text calls it GE). Typos fixed: "'70 the right thing'", "Brundt- land", "conseqyences",
// "hay become", "oihevorganization", "yesearch", "Ifft t?", "veluable", "often schools" → of ten schools, "I I .6",
// "outdatedSand", "zt6", "ü-ucked". Q21–22 summary printed with broken English ("Corporations workers' productivity generally
// needs … and given ___") → lightly corrected. Key = explain key/test 5- up.pdf (scan), checked against the passage: all correct.
const { headings, notes, matching } = require('../../vr_build');
module.exports = {
  vol: 4, test: 5, part: 2, title: 'Corporate Social Responsibility', text: 't5p2.txt',
  groups: [
    headings(14, [
      'How CSR may help one business to expand',
      'CSR in many aspects of a company\'s business',
      'A CSR initiative without a financial gain',
      'Lack of action by the state on social issues',
      'Drives or pressures motivate companies to address CSR',
      'The past illustrates businesses are responsible for future outcomes',
      'Companies applying CSR should be selective',
      'Reasons that business and society benefit each other',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G']),
    notes(21, 22, [
      'Promotion of CSR requires an understanding of the interdependence between business and society. A productive workforce generally needs health care, education, and __Q21__. Restrictions imposed by government protect both consumers and companies from being treated unfairly. Improving safety standards can reduce the __Q22__ of accidents in the workplace. Similarly, society becomes a pool of more human needs and aspirations.',
    ], { title: 'The implementation of CSR – how?',
      instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 21–22 on your answer sheet.' }),
    matching(23, ['General Electric', 'Microsoft', 'Whole Foods Market'], [
      'The disposal of waste',
      'The way the company purchases its goods',
      'Helping the undeveloped',
      'Ensuring the people have the latest information',
    ], { reuse: true, title: 'List of Companies',
      instruction: 'Look at the following deeds (Questions 23–26) and the list of companies below. Match each deed with the correct company, A, B or C. Write the correct letter, A, B or C, in boxes 23–26 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 14: 'v', 15: 'viii', 16: 'vi', 17: 'vii', 18: 'iii', 19: 'i', 20: 'ii', 21: 'equal opportunity', 22: 'internal costs',
    23: 'C', 24: 'C', 25: 'A', 26: 'B' },
  expl: {
    14: ['Chọn tiêu đề cho đoạn A.', 'Đoạn A',
      '“Nowadays, governments and companies need to account for the social consequences of their actions. As a result, corporate social responsibility (CSR) has become a priority for business leaders around the world.” … “every company needs tacit or explicit permission from governments, communities, and numerous other stakeholders to do business.”',
      'Áp lực phải giải trình hậu quả xã hội, cần “giấy phép hoạt động” từ các bên, động cơ uy tín = các động lực/áp lực khiến doanh nghiệp làm CSR → v Drives or pressures motivate companies to address CSR'],
    15: ['Chọn tiêu đề cho đoạn B.', 'Đoạn B',
      '“Successful corporations need a healthy society.” … “At the same time, a healthy society needs successful companies.”',
      'Doanh nghiệp cần xã hội khoẻ mạnh và xã hội cần doanh nghiệp thành công = hai bên cùng có lợi → viii Reasons that business and society benefit each other'],
    16: ['Chọn tiêu đề cho đoạn C.', 'Đoạn C',
      '“Asbestos, now understood as a serious health risk, was thought to be safe in the early 1900s” … “Many firms that failed to anticipate the consequences of this evolving body of research have been bankrupted by the results.”',
      'Ví dụ lịch sử về amiăng cho thấy doanh nghiệp phải chịu trách nhiệm về hậu quả sau này → vi The past illustrates businesses are responsible for future outcomes'],
    17: ['Chọn tiêu đề cho đoạn D.', 'Đoạn D',
      '“No business can solve all of society\'s problems or bear the cost of doing so. Instead, each company must select issues that intersect with its particular business.”',
      '“must select issues” = phải chọn lọc vấn đề → vii Companies applying CSR should be selective'],
    18: ['Chọn tiêu đề cho đoạn E.', 'Đoạn E',
      '“No matter how beneficial the program is, it remains incidental to the company\'s business, and the direct effect on GE\'s recruiting and retention is modest.”',
      'Chương trình của GE có ích cho trường học nhưng gần như không mang lại lợi ích kinh doanh trực tiếp → iii A CSR initiative without a financial gain'],
    19: ['Chọn tiêu đề cho đoạn F.', 'Đoạn F',
      '“The shortage of information technology workers is a significant constraint on Microsoft\'s growth” … “having a direct – and potentially significant – impact on the company.”',
      'Đào tạo nhân lực IT giúp gỡ nút thắt tăng trưởng của Microsoft = CSR giúp một doanh nghiệp mở rộng → i How CSR may help one business to expand'],
    20: ['Chọn tiêu đề cho đoạn G.', 'Đoạn G',
      '“In short, nearly every aspect of the company\'s value chain reinforces the social dimensions of its value proposition”',
      'Nguồn hàng, cửa hàng, năng lượng, rác thải, xe chở, chất tẩy rửa… = CSR trong mọi khía cạnh kinh doanh của Whole Foods → ii CSR in many aspects of a company\'s business'],
    21: ['Một lực lượng lao động năng suất cần y tế, giáo dục và ______.', 'Đoạn B',
      '“Education, health care, and equal opportunity are essential to a productive workforce.”',
      'Vế thứ ba trong bộ ba “education, health care, and …” → equal opportunity'],
    22: ['Cải thiện tiêu chuẩn an toàn có thể giảm ______ của tai nạn lao động.', 'Đoạn B',
      '“Safe products and working conditions not only attract customers but lower the internal costs of accidents.”',
      '“lower” = reduce → internal costs'],
    23: ['Việc xử lý rác thải.', 'Đoạn G',
      '“Spoiled produce and biodegradable waste are trucked to regional centers for composting.”',
      'Rác hữu cơ được chở đi ủ phân — Whole Foods Market → C'],
    24: ['Cách công ty mua hàng hoá.', 'Đoạn G',
      '“The company\'s sourcing emphasises purchases from local farmers through each store\'s procurement process.”',
      '“sourcing … purchases from local farmers” = cách mua hàng — Whole Foods Market → C'],
    25: ['Giúp đỡ những nơi yếu kém.', 'Đoạn E',
      '“A good example is General Electric\'s program to adopt underperforming public high schools near several of its major U.S. facilities.”',
      '“adopt underperforming public high schools” = giúp các trường yếu kém — General Electric → A'],
    26: ['Bảo đảm mọi người có thông tin mới nhất.', 'Đoạn F',
      '“there are no systematic professional development programs to keep faculty up to date. Microsoft\'s $50 million five-year initiative was aimed at all three problems.”',
      '“keep faculty up to date” = giúp giảng viên cập nhật kiến thức mới — Microsoft → B'],
  },
};
