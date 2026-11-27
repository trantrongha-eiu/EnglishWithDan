// Cambridge IELTS 18 - Test 4 - Passage 3. Source: ieltsworldly.com, checked against the book key.
const { ynng, summary, mc } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 4, part: 3, title: 'Alfred Wegener: science, exploration and the theory of continental drift', text: 't4p3.txt', lettered: false,
  groups: [
    ynng(27, [
      'Wegener’s ideas about continental drift were widely disputed while he was alive.',
      'The idea that the continents remained fixed in place was defended in a number of respected scientific publications.',
      'Wegener relied on a limited range of scientific fields to support his theory of continental drift.',
      'The similarities between Wegener’s theory of continental drift and modern-day plate tectonics are enormous.',
    ]),
    summary(31, 36, 'One of the remarkable things about Wegener from a __Q31__ is that although he proposed a theory of continental drift, he was not a geologist. His __Q32__ were limited to atmospheric physics. However, at the time he proposed his theory of continental drift in 1912, he was already a person of __Q33__. Six years previously, there had been his __Q34__ of 52 hours in a hot-air balloon, followed by his well-publicised but __Q35__ of Greenland’s coast. With the publication of his textbook on thermodynamics, he had also come to the attention of a __Q36__ of German scientists.',
      ['modest fame', 'vast range', 'record-breaking achievement', 'research methods', 'select group', 'professional interests', 'scientific debate', 'hazardous exploration', 'biographer’s perspective', 'narrow investigation'], { title: 'Wegener’s life and work' }),
    mc(37, [
      ['What is Mott T Greene doing in the fifth paragraph?', ['describing what motivated him to write the book', 'explaining why it is desirable to read the whole book', 'suggesting why Wegener pursued so many different careers', 'indicating what aspects of Wegener’s life interested him most']],
      ['What is said about Wegener in the sixth paragraph?', ['He was not a particularly ambitious person.', 'He kept a record of all his scientific observations.', 'He did not adopt many of the scientific practices of the time.', 'He enjoyed discussing new discoveries with other scientists.']],
      ['What does Greene say about some other famous scientists?', ['Their published works had a greater impact than Wegener’s did.', 'They had fewer doubts about their scientific ideas than Wegener did.', 'Their scientific ideas were more controversial than Wegener’s.', 'They are easier subjects to write about than Wegener.']],
      ['What is Greene’s main point in the final paragraph?', ['It is not enough in life to have good intentions.', 'People need to plan carefully if they want to succeed.', 'People have little control over many aspects of their lives.', 'It is important that people ensure they have the freedom to act.']],
    ]),
  ],
  key: { 27: 'YES', 28: 'NOT GIVEN', 29: 'NO', 30: 'NO', 31: 'biographer’s perspective', 32: 'professional interests', 33: 'modest fame', 34: 'record-breaking achievement', 35: 'hazardous exploration', 36: 'select group',
    37: 'B', 38: 'A', 39: 'D', 40: 'C' },
  expl: {
    27: ['Ý tưởng trôi dạt lục địa của Wegener bị tranh cãi rộng rãi khi ông còn sống.', 'Đoạn 1', '“was the focus of an international controversy in his lifetime”', 'Tranh cãi quốc tế khi ông còn sống → YES'],
    28: ['Ý tưởng lục địa cố định được bảo vệ trong nhiều ấn phẩm khoa học uy tín.', 'Đoạn 2', '“rather than supposing that they remained fixed in place.”', 'Không nhắc tới ấn phẩm nào bảo vệ ý tưởng này → NOT GIVEN'],
    29: ['Wegener chỉ dựa vào một số ít lĩnh vực khoa học.', 'Đoạn 2', '“using evidence from a large number of sciences including geology, geophysics, paleontology, and climatology.”', 'Dùng bằng chứng từ rất nhiều ngành → NO'],
    30: ['Điểm giống giữa thuyết trôi dạt lục địa và kiến tạo mảng hiện đại là rất lớn.', 'Đoạn 2', '“Plate tectonics is in many respects quite different from Wegener’s proposal”', 'Khác nhau ở nhiều mặt → NO'],
    31: ['Điều đáng chú ý về Wegener từ ___.', 'Đoạn 3', '“When I started writing about Wegener’s life and work, one of the most intriguing things about him for me was that”', 'Góc nhìn của người viết tiểu sử → biographer’s perspective'],
    32: ['___ của ông chỉ giới hạn trong vật lý khí quyển.', 'Đoạn 3', '“He trained as an astronomer and pursued a career in atmospheric physics.”', 'Mối quan tâm nghề nghiệp → professional interests'],
    33: ['Năm 1912 ông đã là người có ___.', 'Đoạn 3–4', '“However, he was not an ‘unknown’.”', 'Không vô danh nhưng chỉ nổi tiếng trong phạm vi nhỏ → modest fame'],
    34: ['Sáu năm trước đó là ___ 52 giờ trên khinh khí cầu.', 'Đoạn 4', '“In 1906 he had set a world record (with his brother Kurt) for time aloft in a hot-air balloon: 52 hours.”', 'Kỷ lục thế giới → record-breaking achievement'],
    35: ['…rồi đến ___ bờ biển Greenland được báo chí đưa tin.', 'Đoạn 4', '“a highly publicized and extremely dangerous expedition to the coast of northeast Greenland.”', '“extremely dangerous expedition” → hazardous exploration'],
    36: ['Ông được một ___ nhà khoa học Đức chú ý.', 'Đoạn 4', '“He had also made a name for himself amongst a small circle of meteorologists and atmospheric physicists in Germany”', '“a small circle” = nhóm chọn lọc → select group'],
    37: ['Greene làm gì ở đoạn thứ năm?', 'Đoạn 6', '“My own feeling, however, is that the parts do not make as much sense on their own as do all of his activities taken together.”', 'Khuyên đọc cả cuốn sách để hiểu trọn đời ông → B'],
    38: ['Điều gì được nói về Wegener ở đoạn thứ sáu?', 'Đoạn 7', '“did not seek to find influence or advance his ideas through professional contacts and politics”', 'Không tìm cách gây ảnh hưởng, chủ yếu ở nhà đọc, viết = không mấy tham vọng → A'],
    39: ['Greene nói gì về một số nhà khoa học nổi tiếng khác?', 'Đoạn 8', '“The more such material a scientist leaves behind, the better chance a biographer has of forming an accurate picture”', 'Họ để lại nhiều tư liệu nên dễ viết tiểu sử hơn → D'],
    40: ['Ý chính của Greene ở đoạn cuối?', 'Đoạn 9', '“most of the time our lives ‘happen to us’”', 'Phần lớn cuộc đời “xảy đến với ta” = ít kiểm soát → C'],
  },
};
