// Cambridge IELTS 12 - Test 1 - Section 3 (not on DOL). Source: ieltstrainingonline.com practice-cam-12-listening-test-01 + audio-script page.
// Source typos fixed: "try relate", Q23 "Stewart expect".
const { mc, note } = require('../../volListening/vol_build');
module.exports = {
  book: 12, test: 1, part: 3, title: 'Paper on Public Libraries',
  fix: [['and try relate the changes', 'and try to relate the changes']],
  groups: [
    mc('Choose the correct letter, A, B or C.', [
      [21, 'What will be the main topic of Trudie and Stewart’s paper?', ['how public library services are organised in different countries', 'how changes in society are reflected in public libraries', 'how the funding of public libraries has changed'], 'B'],
      [22, 'They agree that one disadvantage of free digitalised books is that', ['they may take a long time to read.', 'they can be difficult to read.', 'they are generally old.'], 'C'],
      [23, 'Stewart expects that in the future libraries will', ['maintain their traditional function.', 'become centres for local communities.', 'no longer contain any books.'], 'C'],
    ], 'Questions 21–23'),
    note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Study of local library: possible questions', [
      '• whether it has a __Q24__ of its own',
      '• its policy regarding noise of various kinds',
      '• how it’s affected by laws regarding all aspects of __Q25__',
      '• how the design needs to take the __Q26__ of customers into account',
      '• what __Q27__ is required in case of accidents',
      '• why a famous person’s __Q28__ is located in the library',
      '• whether it has a __Q29__ of local organisations',
      '• how it’s different from a library in a __Q30__',
    ], { 24: 'budget', 25: 'employment', 26: 'safety', 27: 'insurance', 28: 'diary', 29: 'database', 30: 'museum' }, 'Questions 24–30'),
  ],
  expl: {
    21: { v: 'Đầu bài, khi hai bạn chọn hướng cho bài viết.', t: 'try to relate the changes in libraries to external developments, like the fact that far more people can read than a century ago',
      p: 'Trudie muốn liên hệ thay đổi của thư viện với những thay đổi bên ngoài (nhiều người biết đọc hơn, dân cư nói nhiều ngôn ngữ) = thay đổi xã hội phản ánh vào thư viện. A (các nước) bị bỏ vì “concentrate on this country”; C (kinh phí) bị bỏ vì “don’t go into funding in any detail” → B' },
    22: { v: 'Khi nói về sách số hoá miễn phí trên mạng.', t: 'the digitalised books that are available online for free are mostly out of copyright, aren’t they?',
      p: 'Sách miễn phí hầu hết đã hết bản quyền (70 năm sau khi tác giả mất) nên không có sách mới — Trudie đồng ý “That’s an important point” = sách thường đã cũ. Ý “khó đọc, lâu đọc” chỉ là ý riêng của Trudie, Stewart không đồng ý → C' },
    23: { v: 'Khi bàn về tương lai của thư viện.', t: 'What I’m afraid will happen is that books and magazines will all disappear, and there’ll just be rows and rows of computers',
      p: 'Stewart lo sách báo sẽ biến mất hết, chỉ còn máy tính = không còn sách. Trung tâm cộng đồng (B) là ý của Trudie; chức năng truyền thống (A) Stewart “not so sure” → C' },
    24: { v: 'Khi lên danh sách câu hỏi phỏng vấn nhân viên thư viện.', t: 'find out whether the library has its own budget, or if that’s controlled by the local council',
      p: '“has its own budget” = has a budget of its own → budget' },
    25: { v: 'Ngay sau ý về chính sách tiếng ồn.', t: 'how the library is affected by employment laws',
      p: 'Luật lao động (giờ làm, tiện nghi cho nhân viên) ảnh hưởng đến thư viện → employment' },
    26: { v: 'Khi nói về thiết kế toà nhà và cách khách sử dụng.', t: 'what measures does the library take to ensure their safety?',
      p: 'Thiết kế phải tính đến an toàn của khách (sàn không trơn, lối thoát hiểm) → safety' },
    27: { v: 'Ngay sau ý về an toàn.', t: 'the kind of insurance the library needs to have, in case anyone gets injured',
      p: '“in case anyone gets injured” = in case of accidents → insurance' },
    28: { v: 'Khi Stewart nhắc đến kho lưu trữ báo địa phương.', t: 'next to it they’ve got the diary of a well-known politician from the late 19th century',
      p: '“a well-known politician” = a famous person; Stewart thắc mắc vì sao cuốn nhật ký ở đó → diary' },
    29: { v: 'Khi Trudie nhắc đến các tổ chức địa phương như câu lạc bộ thể thao.', t: 'I wonder if they keep a database, or whether they just look online',
      p: '“keep a database” of local organisations → database' },
    30: { v: 'Câu cuối của Stewart.', t: 'what the differences are between a library that’s open to the public and one that’s part of a museum',
      p: 'So sánh thư viện công cộng với thư viện thuộc một bảo tàng → museum' },
  },
};
