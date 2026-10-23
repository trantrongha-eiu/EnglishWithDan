// Vol 2 - "Test 3.pdf" - Reading Passage 3 (PDF p11–15). Not in the bank (mini-ielts 1463 = same text, but its Q10–14 mix in
// two items from "Revolutions in Mapping" — the Vol PDF has the right five). Text = PDF (typed, clean OCR), fixes:
// "draughtsman ship" → draughtsmanship; "1 50 meters", "1 823" → 150, 1823; closing bracket after "(The one in use was a
// semaphore system."; "this work-Charles" → dash; paragraph "l." → I; "knighted by Queen Elizabeth l" → Queen Victoria (Ronalds
// was knighted in 1870; Elizabeth I reigned 1558–1603 — a source error, no question depends on it). The garbled Brooke sentence in
// H is left as printed. Question wording kept as printed (non-native but clear), "Matching the each" → Match each.
// Key (= Vol key page): Q32 "letters and numbers / alphabet and numbers" are not verbatim (passage: "letters of the alphabet
// and numbers", 6 words > FOUR) → kept as `free`. Q39 "drawback": D "The only defect…" is the key; C also says "The system was
// slow" → C accepted too.
const { matching, short } = require('../../vr_build');
module.exports = {
  vol: 2, test: 3, part: 3, title: 'Sir Francis Ronalds and Telegraph', text: 't3p3.txt',
  free: ['letters and numbers', 'alphabet and numbers', '800 km'],
  groups: [
    matching(27, ['1753', '1806', '1816', '1823', '1825', '1837', '1843'], [
      'When did Francis Ronalds achieve a satisfactory result in the electricity experiment conducted for the first time?',
      'When was the first proposal of an electric telegraph based on static electricity?',
      'When did Ronalds first get a patent for one of his inventions?',
      'When did Ronalds first make his telegraph known and reveal its practical significance to the public?',
      'When did Ronalds\'s invention begin contributing to meteorological data?',
    ], { title: 'Years',
      instruction: 'Match each correct year, A–G, to the historical event in the passage. Write the correct letter, A–G, in boxes 27–31 on your answer sheet.' }),
    short(32, [
      'What were engraved on the experimental dials when Ronalds did his experiment in the garden?',
      'What were the buried telegraph wires enclosed in when Ronalds did the improved experiment?',
      'What is the greatest distance Ronalds believed his telegraph could send messages?',
      'What kind of device kept the wire charged continuously?',
    ], { instruction: 'Answer the questions below. Choose NO MORE THAN FOUR WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 32–35 on your answer sheet.' }),
    matching(36, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], [
      'There is a commercial use of the telegraph.',
      'There is a contributory influence on Ronalds from a fellow he got to know.',
      'Ronalds\'s proposal was rejected because another system was already in use.',
      'There existed a drawback of Ronalds\'s telegraph.',
      'Ronalds\'s contribution in telegraphic investigations was recognized by authority.',
    ], { instruction: 'The passage has nine paragraphs, A–I. Which paragraph contains the following information? Write the correct letter, A–I, in boxes 36–40 on your answer sheet.' }),
  ],
  key: { 27: 'C', 28: 'A', 29: 'E', 30: 'D', 31: 'G', 32: 'letters and numbers / alphabet and numbers', 33: 'glass tubes',
    34: '800km / 800 km', 35: 'frictional-electricity machine / a frictional-electricity machine', 36: 'G', 37: 'A', 38: 'E', 39: 'D / C', 40: 'I' },
  expl: {
    27: ['Francis Ronalds đạt kết quả khả quan trong thí nghiệm điện lần đầu tiên vào năm nào?', 'Đoạn C',
      '“In 1816 Francis Ronalds, then living at Upper Mall, Hammersmith, built in his back garden two frames” … “Ronalds successfully transmitted and received letters over 150 meters of wire”',
      'Năm 1816 ông dựng hệ thống trong vườn và truyền/nhận thành công các chữ cái qua 150 m dây → C'],
    28: ['Đề xuất đầu tiên về điện báo dùng tĩnh điện được đưa ra năm nào?', 'Đoạn B',
      '“Since 1753, when the first proposal for an electric telegraph worked by statical electricity was made by a writer signing \'C. M.\'”',
      '“statical electricity” = tĩnh điện; đề xuất đầu tiên năm 1753 → A'],
    29: ['Ronalds lần đầu được cấp bằng sáng chế cho một phát minh của mình vào năm nào?', 'Đoạn F',
      '“In 1825 he invented and patented a perspective tracing instrument” … “These instruments seem to be the only ones for which he took out patents.”',
      'Bằng sáng chế duy nhất (và đầu tiên) là dụng cụ vẽ phối cảnh năm 1825; đoạn G nói ông không bao giờ đăng ký sáng chế điện báo. F 1837 là năm Wheatstone và Cooke đăng ký → E'],
    30: ['Ronalds lần đầu công bố điện báo của mình và cho công chúng thấy ý nghĩa thực tiễn của nó vào năm nào?', 'Đoạn F',
      '“In a small pamphlet published in 1823, Ronalds described his invention and listed some of its possible uses”',
      'Cuốn sách nhỏ xuất bản (= công bố rộng rãi) năm 1823 mô tả phát minh và liệt kê các ứng dụng. Năm 1816 ông chỉ gửi riêng cho Bộ Hải quân → D'],
    31: ['Phát minh của Ronalds bắt đầu đóng góp cho dữ liệu khí tượng vào năm nào?', 'Đoạn H',
      '“Early in 1843 Ronalds was made honorary director and superintendent of the Meteorological Observatory” … “He began work on a system for registering meteorological data using photography”',
      'Từ năm 1843 ông phụ trách đài khí tượng Kew và làm hệ thống ghi dữ liệu khí tượng → G'],
    32: ['Trên các mặt số trong thí nghiệm ở vườn có khắc gì?', 'Đoạn C',
      '“It used clockwork-driven rotating dials, engraved with letters of the alphabet and numbers”',
      'Mặt số khắc chữ cái và chữ số; nguyên cụm “letters of the alphabet and numbers” dài 6 từ, vượt giới hạn 4 từ nên đáp án rút gọn → letters and numbers'],
    33: ['Khi làm thí nghiệm cải tiến, dây điện báo chôn dưới đất được bọc trong gì?', 'Đoạn D',
      '“he developed another version in which the wires were enclosed in glass tubes buried in the ground.”',
      '“enclosed in” = được bọc trong → glass tubes'],
    34: ['Ronalds tin điện báo của ông truyền được xa nhất bao nhiêu?', 'Đoạn E',
      '“With communications between London and Portsmouth in mind, he believed his telegraph would work over distances of 800km.”',
      'Khoảng cách ông tin là truyền được → 800km'],
    35: ['Thiết bị nào giữ cho dây luôn được tích điện?', 'Đoạn D',
      '“A frictional-electricity machine kept the wire continuously charged”',
      '“kept the wire continuously charged” khớp câu hỏi → frictional-electricity machine'],
    36: ['Có một ứng dụng thương mại của điện báo.', 'Đoạn G',
      '“these two men together devised and patented in 1837 the first electric telegraph used publicly and commercially in England.”',
      '“used publicly and commercially” = ứng dụng thương mại → G'],
    37: ['Có ảnh hưởng đóng góp lên Ronalds từ một người ông quen biết.', 'Đoạn A',
      '“Under the influence of Jean Andre de Luc (1727–1817), whose acquaintance he made in 1814, he began to devote himself to practical electricity.”',
      '“whose acquaintance he made” = người ông quen biết; “Under the influence of” = ảnh hưởng → A'],
    38: ['Đề xuất của Ronalds bị từ chối vì đã có một hệ thống khác đang được dùng.', 'Đoạn E',
      '“Telegraphs of any kind are now wholly unnecessary; and no other than the one now in use will be adopted.” … “The one in use was a semaphore system.”',
      'Bộ Hải quân từ chối vì đã dùng hệ thống semaphore → E'],
    39: ['Điện báo của Ronalds có một nhược điểm.', 'Đoạn D (cả đoạn C)',
      '“The only defect in his invention was the comparative slowness with which a succession of symbols could be transmitted.”',
      '“The only defect” = nhược điểm. Đoạn C cũng có “The system was slow” nên C cũng được chấp nhận → D'],
    40: ['Đóng góp của Ronalds trong nghiên cứu điện báo được nhà chức trách công nhận.', 'Đoạn I',
      '“to receive belated official recognition: in 1870, three years before he died, he was knighted” … “for his \"early and remarkable labors in telegraphic investigations.\"”',
      '“official recognition” + được phong tước vì “telegraphic investigations” → I'],
  },
};
