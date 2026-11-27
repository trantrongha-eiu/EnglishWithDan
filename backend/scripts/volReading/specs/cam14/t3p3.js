// Cambridge IELTS 14 - Test 3 - Passage 3. Source: ieltsworldly.com, checked against the book key.
// Text fixes: "Miler & Almon" → Miller; "Hirsch-Pasek" → Hirsh-Pasek (list printed "Girsch-Pasek").
const { matching, ynng, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam14', book: 14, test: 3, part: 3, title: 'The power of play', text: 't3p3.txt', lettered: false,
  groups: [
    matching(27, ['Elkind', 'Miller & Almon', 'Rubin et al.', 'Stuart Brown', 'Pellegrini', 'Joan Goodman', 'Hirsh-Pasek et al.'], [
      'Play can be divided into a number of separate categories.',
      'Adults’ intended goals affect how they play with children.',
      'Combining work with play may be the best way for children to learn.',
      'Certain elements of play are more significant than others.',
      'Activities can be classified on a scale of playfulness.',
    ], { title: 'List of Researchers', instruction: 'Look at the following statements (Questions 27–31) and the list of researchers below. Match each statement with the correct researcher, A–G. Write the correct letter, A–G, in boxes 27–31 on your answer sheet.' }),
    ynng(32, [
      'Children need toys in order to play.',
      'It is a mistake to treat play and learning as separate types of activity.',
      'Play helps children to develop their artistic talents.',
      'Researchers have agreed on a definition of play.',
      'Work and play differ in terms of whether or not they have a target.',
    ]),
    notes(37, 40, [
      'In the simplest form of guided play, an adult contributes to the environment in which the child is playing. Alternatively, an adult can play with a child and develop the play, for instance by __Q37__ the child to investigate different aspects of their game. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child’s __Q38__ to play.',
      'Play without the intervention of adults gives children real __Q39__; with adults, play can be __Q40__ at particular goals. However, all forms of play should be an opportunity for children to have fun.',
    ], { title: 'Guided play', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 37–40 on your answer sheet.' }),
  ],
  key: { 27: 'B', 28: 'G', 29: 'F', 30: 'E', 31: 'C', 32: 'NO', 33: 'YES', 34: 'NOT GIVEN', 35: 'NO', 36: 'YES', 37: 'encouraging', 38: 'desire', 39: 'autonomy', 40: 'targeted' },
  expl: {
    27: ['Việc chơi có thể chia thành nhiều loại riêng biệt.', 'Đoạn 4', '“discrete descriptions of various types of play such as physical, construction, language, or symbolic play (Miller & Almon 2009)”', 'Miller & Almon mô tả các loại chơi riêng biệt → B'],
    28: ['Mục tiêu của người lớn ảnh hưởng cách họ chơi với trẻ.', 'Đoạn 9', '“The adult’s role in play varies as a function of their educational goals and the child’s developmental level (Hirsh-Pasek et al. 2009).”', 'Vai trò người lớn thay đổi theo mục tiêu giáo dục → G'],
    29: ['Kết hợp làm việc và chơi có thể là cách học tốt nhất.', 'Đoạn 8', '“hybrid forms of work and play are not a detriment to learning; rather, they can provide optimal contexts for learning.”', 'Joan Goodman: hình thức lai là bối cảnh học tối ưu → F'],
    30: ['Một số yếu tố của việc chơi quan trọng hơn các yếu tố khác.', 'Đoạn 7', '“process orientation and a lack of obvious functional purpose may be the most important aspects of play (e.g. Pellegrini 2009).”', 'Pellegrini: hai khía cạnh quan trọng nhất → E'],
    31: ['Các hoạt động có thể được xếp trên thang mức độ vui chơi.', 'Đoạn 5', '“Often, play is defined along a continuum as more or less playful using the following set of behavioral and dispositional criteria (e.g. Rubin et al. 1983).”', '“continuum” = thang đo; Rubin et al. → C'],
    32: ['Trẻ cần đồ chơi mới chơi được.', 'Đoạn 1', '“children will do so in any circumstances, for instance when they have no real toys”', 'Trẻ vẫn chơi khi không có đồ chơi → NO'],
    33: ['Coi chơi và học là hai loại hoạt động tách biệt là sai lầm.', 'Đoạn 2', '“Our society has created a false dichotomy between play and learning.”', '“false dichotomy” = sự phân chia sai lầm → YES'],
    34: ['Việc chơi giúp trẻ phát triển tài năng nghệ thuật.', 'Đoạn 3', '“build a repertoire of creative problem-solving skills, and so much more.”', 'Có nói kỹ năng giải quyết vấn đề sáng tạo, không nói về tài năng nghệ thuật → NOT GIVEN'],
    35: ['Các nhà nghiên cứu đã thống nhất định nghĩa về việc chơi.', 'Đoạn 4', '“Full consensus on a formal definition of play continues to elude the researchers and theorists who study it.”', 'Vẫn chưa có sự đồng thuận → NO'],
    36: ['Làm việc và chơi khác nhau ở chỗ có mục tiêu hay không.', 'Đoạn 8', '“Unlike play, work is typically not viewed as enjoyable and it is extrinsically motivated (i.e. it is goal oriented).”', 'Làm việc hướng tới mục tiêu, chơi thì không → YES'],
    37: ['Người lớn có thể phát triển trò chơi, ví dụ bằng cách ___ trẻ khám phá các khía cạnh khác.', 'Đoạn 10', '“or encouraging further exploration or new facets to the child’s activity.”', 'Khuyến khích trẻ khám phá thêm → encouraging'],
    38: ['…nhưng vẫn phải dựa trên ___ muốn chơi của trẻ.', 'Đoạn 10', '“Play should stem from the child’s own desire.”', '“stem from” = based on; mong muốn của trẻ → desire'],
    39: ['Chơi không có người lớn can thiệp cho trẻ sự ___ thực sự.', 'Đoạn 11', '“Intrinsically motivated free play provides the child with true autonomy”', '“true autonomy” = sự tự chủ thực sự → autonomy'],
    40: ['…có người lớn, việc chơi có thể ___ vào mục tiêu cụ thể.', 'Đoạn 11', '“guided play is an avenue through which parents and educators can provide more targeted learning experiences.”', 'Trải nghiệm học tập có định hướng mục tiêu → targeted'],
  },
};
