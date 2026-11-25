// Extra (not a Vol test): "Science and Filmmaking" — reported by students (Q4/2026, "3 lần"); also printed as "Volume 2 - Test 2 -
// Passage 3" of a 2026 forecast book and in 2026 recall lists. Text + questions from englishups.com "Reading IELTS Passage 3: Science
// and Filmmaking" (same text in github.com/wongjiawei18/ielts-reading P3/Science and Filmmaking.html, which carries the key).
// Key checked against the text. Q38: the source key is E (astrophysics), but the gap "principles of ___, which had previously been
// applied in other scientific research" fits the passage's “the mathematics for the model goes back many decades to the time when
// it was used in astrophysics” at least as well → both accepted. Not in the bank. Seeded 2026-11-25 as Passage 3.
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 'x', test: 4, part: 3, title: 'Science and Filmmaking', text: 'filmmaking.txt', lettered: false,
  groups: [
    mc(27, [
      ['What is the writer’s main point in the first paragraph?', [
        'Computer scientists are rarely represented at the Oscars.', 'Film-industry awards hold little interest for computer scientists.',
        'The USA rewards film actors more than computer scientists.', 'Computer scientists are becoming a vital part of the film industry.']],
      ['When describing the way computer-generated imagery changes actors’ appearance, what does the writer suggest?', [
        'CGI looks best from a distance.', 'CGI interferes with actors’ facial expressions.', 'Audiences expect too much of CGI.',
        'The scientists had hoped for more convincing results.']],
      ['What does the writer suggest about the scientists’ attitude to their work in the fourth paragraph?', [
        'They were motivated to get as near to reality as possible.', 'They were interested in gaining recognition for their work.',
        'They thought it could have medical applications.', 'They hoped to receive further funding for their research.']],
      ['What are we told about computerized tomography?', [
        'It has only recently been used by doctors.', 'It is similar to X-rays in the way it works.',
        'Filmmakers have used it for many years for special lighting effects.', 'It can be administered using traditional radiography machines.']],
      ['Which of these advantages does the writer attribute to the current use of computerized tomography?', [
        'It is most effective when used to create images of skin.', 'It can make a few people seem like a crowd.',
        'It allows clothes designers to create new designs.', 'It is practical because of the time it takes.']],
      ['The writer mentions Kavita Bala in order to', [
        'comment on the success of CGI in commercial contexts.', 'highlight the link between CGI and photography.',
        'show that Marschner’s team are uncertain about the future of CGI.', 'demonstrate a use for CGI outside the film industry.']],
    ], { instruction: 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27–32 on your answer sheet.' }),
    ynng(33, [
      'It used to be unusual for university researchers to receive a cinematography award.',
      'CGI is popular among ageing actors.',
      'The scientists’ success in generating images of complete CGI garments has won them many awards.',
      'It will be a long time before computerized tomographic imaging of fabric is used by filmmakers.',
    ]),
    summary(37, 40, 'For many years, CGI characters did not appear entirely lifelike as their skin appeared plastic. Marschner and his colleagues were the first to apply an understanding of how __Q37__ interacts with human skin. Their CGI model is based on a novel application of principles of __Q38__, which had previously been applied in other scientific research. The importance of CGI to the film industry has led to the __Q39__ of Marschner’s model by special-effects studios. Marschner’s model has led to the __Q40__ of cinematography.',
      ['light', 'transparency', 'age', 'use', 'astrophysics', 'mathematics', 'improvement', 'colour', 'translucency'],
      { title: 'The work of Marschner and his colleagues' }),
  ],
  key: { 27: 'D', 28: 'A', 29: 'A', 30: 'B', 31: 'B', 32: 'D', 33: 'YES', 34: 'NOT GIVEN', 35: 'NO', 36: 'NO',
    37: 'light', 38: 'astrophysics / mathematics', 39: 'use', 40: 'improvement' },
  expl: {
    27: ['Ý chính của tác giả ở đoạn đầu là gì?', 'Đoạn 1',
      '“They were part of a growing cohort of computer scientists that has become fundamental to moviemaking.”',
      '“growing cohort … fundamental to moviemaking” = các nhà khoa học máy tính đang trở thành phần thiết yếu của ngành điện ảnh → D'],
    28: ['Khi mô tả cách CGI thay đổi ngoại hình diễn viên, tác giả gợi ý điều gì?', 'Đoạn 2',
      '“At least, it is possible if the altered actors are not filmed too closely.” … “the effect is less convincing when seen close up”',
      'CGI chỉ thuyết phục khi không quay quá gần = trông đẹp nhất từ xa → A'],
    29: ['Tác giả gợi ý gì về thái độ của các nhà khoa học với công việc ở đoạn bốn?', 'Đoạn 4',
      '“However, despite their award, the scientists, with admirable tenacity, continued their search for perfection, as they still did not feel that they had yet satisfactorily recreated the subtle ways light is reflected.”',
      'Dù đã đoạt giải vẫn kiên trì tìm sự hoàn hảo = muốn gần với thực tế nhất có thể; giải thưởng đã có rồi (B sai) → A'],
    30: ['Ta được biết gì về chụp cắt lớp vi tính?', 'Đoạn 4',
      '“Like classical radiology, it uses X-rays, but because the image is constructed inside a computer”',
      'Giống X-quang cổ điển, nó dùng tia X = similar to X-rays in the way it works → B'],
    31: ['Tác giả cho rằng việc dùng chụp cắt lớp hiện nay có ưu điểm nào?', 'Đoạn 5',
      '“These same pieces of fabric, through the use of CGI, can then be patched together to form an entire garment inside a computer, in the same way that a small group of actors can be made to look like hundreds of people gathered together.”',
      'Phép so sánh: vài mẩu vải ghép thành cả bộ quần áo giống như vài diễn viên được biến thành đám đông. A sai: chưa dùng được cho da; C, D không được nêu → B'],
    32: ['Tác giả nhắc đến Kavita Bala để', 'Đoạn 7',
      '“In the meantime, according to Marschner’s colleague Kavita Bala, the technology might have an application in online retailing.”',
      'Bán lẻ trực tuyến là ứng dụng ngoài ngành điện ảnh; mới chỉ “might have” nên chưa nói về thành công (A sai) → D'],
    33: ['Trước đây, việc các nhà nghiên cứu đại học nhận giải thưởng điện ảnh là điều bất thường.', 'Đoạn 1',
      '“In 2004 a notable event took place: the academic world met the cinematographic world when researchers from Stanford University in the USA were awarded an Oscar.”',
      '“a notable event” = sự kiện đáng chú ý → trước đó hiếm khi giới học thuật nhận giải Oscar → YES'],
    34: ['CGI được các diễn viên lớn tuổi ưa chuộng.', 'Đoạn 2',
      '“Films have shown that it is possible to use CGI to make actors look younger, older, weaker or stronger than they actually are”',
      'Chỉ nói CGI có thể làm diễn viên trông trẻ hơn, già hơn; không nói diễn viên lớn tuổi có thích dùng không → NOT GIVEN'],
    35: ['Thành công trong việc tạo hình toàn bộ trang phục bằng CGI đã mang lại cho các nhà khoa học nhiều giải thưởng.', 'Đoạn 3, 5',
      '“Marschner and his colleagues received the Oscar for their work in successfully producing a CGI model that simulates translucency”',
      'Giải Oscar là cho mô hình độ trong mờ của da, không phải cho trang phục; với vải họ mới chỉ “had some success” → NO'],
    36: ['Còn lâu nữa các nhà làm phim mới dùng được hình ảnh chụp cắt lớp của vải.', 'Đoạn 6',
      '“although it may take some years to be able to use computerized tomographic imaging of skin, for the moment the movement of a virtual cloak or the lifting of a computerized hat should look far more realistic”',
      'Phải nhiều năm nữa mới dùng được với da; còn vải thì ngay bây giờ đã giúp áo choàng, mũ trông thật hơn → NO'],
    37: ['Họ là những người đầu tiên áp dụng hiểu biết về cách ______ tương tác với da người.', 'Đoạn 3',
      '“a CGI model that simulates translucency; this is when light penetrates skin and then scatters below the skin’s surface before re-emerging”',
      'Ánh sáng xuyên vào da, tán xạ bên dưới rồi thoát ra = cách ánh sáng tương tác với da → light'],
    38: ['Mô hình dựa trên một cách áp dụng mới các nguyên lý của ______, vốn đã được dùng trong nghiên cứu khoa học khác.', 'Đoạn 3',
      '“the mathematics for the model goes back many decades to the time when it was used in astrophysics”',
      'Nền tảng toán học của mô hình đã có từ nhiều thập kỷ trước, khi được dùng trong vật lý thiên văn (đáp án gốc: astrophysics; “mathematics” cũng khớp câu nên được chấp nhận) → astrophysics'],
    39: ['Tầm quan trọng của CGI với ngành điện ảnh đã dẫn đến việc các xưởng kỹ xảo ______ mô hình của Marschner.', 'Đoạn 3',
      '“within two years of their original research paper, all the major special-effects studios had incorporated it into their digital rendering systems”',
      '“incorporated it into their … systems” = đưa vào sử dụng → use'],
    40: ['Mô hình của Marschner đã dẫn đến sự ______ của điện ảnh.', 'Đoạn 3, 6',
      '“The scientists’ new model of CGI was so important in bringing digital characters to life” … “Cinematography will benefit from this”',
      'Mô hình giúp nhân vật kỹ thuật số sống động hơn, điện ảnh được hưởng lợi = sự cải thiện → improvement'],
  },
};
