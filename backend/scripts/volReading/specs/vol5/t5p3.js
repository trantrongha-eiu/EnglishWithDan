// Vol 5 - Reading/Test 5/Test 5- up.pdf - Reading Passage 3 (PDF p9–12). Not in the bank; mini-ielts 1315 "Communication in
// Science" is the longer Lisa Randall original — a different text and question set. Text = PDF (typed, clean OCR). PDF slips
// fixed: a stray line "because no one yet knows the big" pasted into "A few … years ago" (removed — it belongs to the last
// paragraph), "opposing arguments. about gender-specific" → one sentence, "providing opposing or competitive on any
// controversial issue" → competitive views, "peoples lives", "and are the associated", "party realise" → partly, "ozone
// laver", "no one yet know". Key = Test 5/Explanation -5.pdf. KEY FIX: Q33 Vol NOT GIVEN → NO ("A better understanding by the
// general public of the mathematical significance of results would help to clarify many scientific discussions"; the third
// step asks scientists to discuss it more). Rest correct.
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 5, test: 5, part: 3, title: 'The communication of science', text: 't5p3.txt',
  groups: [
    mc(27, [
      ['Why does the writer say we particularly need to pay attention to the communication of science?', [
        'Scientific developments are affecting everyone more and more.',
        'There is too little discussion of scientific research nowadays.',
        'There are now so many scientific research projects.',
        'Scientists need wider public support.']],
      ['In the second paragraph, the writer says it may be difficult to choose the appropriate terminology to describe scientific developments because', [
        'research findings can be interpreted very differently.',
        'the nature of modern science is inherently complicated.',
        'scientists are the only people who can understand their research.',
        'the public is so critical of the findings of scientists.']],
      ['The writer refers to the term relativity as an example of', [
        'Einstein\'s deliberate deception of the public.',
        'a scientific word used to describe a physical phenomenon.',
        'the use of a generally used word to describe a scientific concept.',
        'the absolute nature of scientific theories.']],
      ['What example does the writer cite as a successful scientific explanation of a complicated issue?', [
        'the results of diet studies', 'the developments in cancer research', 'the explanation of the theory of relativity',
        'the destruction of the ozone layer']],
    ]),
    ynng(31, [
      'Reporting of different viewpoints on global warming tends to lead to a fuller appreciation of the issues.',
      'The media\'s attempt to present both sides of the global warming issue went on for too long.',
      'Explaining the mathematical significance of experimental results would confuse the public.',
      'In the Harvard debate, it would have been better to pay more attention to the discoveries made by male and female scientists.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 31–34 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
    summary(35, 40, 'Several possible changes could reduce __Q35__ in the reporting of science. The public needs to recognise that scientific evidence does not need to be __Q36__ by people to be valid. The way theoretical research is judged may be different from the way research with practical __Q37__ is. Scientists should be more __Q38__ about the mathematical significance of their findings and the public should learn to be more comfortable with numerical __Q39__. Most importantly, scientists, journalists and the public must accept that science and science reporting is necessarily __Q40__.',
      ['complicated', 'observable', 'data', 'proposals', 'immediate', 'misunderstandings', 'open', 'distorted', 'implications',
        'miscalculations']),
  ],
  key: { 27: 'A', 28: 'B', 29: 'C', 30: 'D', 31: 'NO', 32: 'YES', 33: 'NO', 34: 'NOT GIVEN', 35: 'misunderstandings',
    36: 'observable', 37: 'implications', 38: 'open', 39: 'data', 40: 'complicated' },
  expl: {
    27: ['Vì sao tác giả nói ta đặc biệt cần chú ý tới việc truyền tải khoa học?', 'Đoạn 1',
      '“Science plays an increasingly significant role in people\'s lives, making the communication by journalists in the popular media of scientific developments more important than ever.”',
      '“increasingly significant role in people\'s lives” = affecting everyone more and more → A'],
    28: ['Ở đoạn 2, khó chọn thuật ngữ phù hợp vì', 'Đoạn 2',
      '“Some problems stem from the esoteric nature of current research and the associated difficulty of coming up with sufficiently faithful terminology. Abstraction and complexity are not signs that a given scientific direction is wrong”',
      'Nghiên cứu hiện nay “esoteric”, trừu tượng, phức tạp → khó tìm thuật ngữ = bản chất phức tạp của khoa học hiện đại → B'],
    29: ['Tác giả nhắc đến thuật ngữ “relativity” như ví dụ về', 'Đoạn 4',
      '“Scientists often employ common terminology, to which they then assign a specific meaning that is impossible to fathom without a precise definition. Take Einstein\'s famous theory of relativity.”',
      'Một từ thông dụng (relative) được gán nghĩa khoa học riêng → C'],
    30: ['Ví dụ nào được nêu như một lời giải thích khoa học thành công cho vấn đề phức tạp?', 'Đoạn 5',
      '“remarkably, chemists were able to detail the precise chemical processes involved in the destruction of the ozone layer, making the evidence … successfully conveyed to the public.”',
      'Sự suy giảm tầng ozone được truyền tải thành công → D'],
    31: ['Đưa tin nhiều quan điểm khác nhau về nóng lên toàn cầu thường giúp hiểu vấn đề đầy đủ hơn.', 'Đoạn 6',
      '“However, a real problem in the global warming debate was that the story was reported in the press in a way that suggested some scientists believed it was a legitimate issue and some didn\'t, even long after the bulk of the scientific community had recognized the seriousness of the problem.”',
      'Cách đưa tin “hai phía” là “a real problem”, gây hiểu sai chứ không giúp hiểu đầy đủ → NO'],
    32: ['Việc báo chí trình bày cả hai phía của vấn đề nóng lên toàn cầu kéo dài quá lâu.', 'Đoạn 6',
      '“some scientists believed it was a legitimate issue and some didn\'t, even long after the bulk of the scientific community had recognized the seriousness of the problem.”',
      '“even long after” = vẫn đưa tin hai phía dù giới khoa học đã đồng thuận → quá lâu → YES'],
    33: ['Giải thích ý nghĩa toán học của kết quả thí nghiệm sẽ làm công chúng bối rối.', 'Đoạn 7 & 8',
      '“A better understanding by the general public of the mathematical significance of results would help to clarify many scientific discussions.” … “it would be better if scientists were more prepared to discuss the mathematical significance of their results”',
      'Tác giả cho rằng hiểu ý nghĩa toán học “would help to clarify” (làm sáng tỏ), ngược với “confuse”. (Key Vol ghi NOT GIVEN.) → NO'],
    34: ['Trong tranh luận ở Harvard, lẽ ra nên chú ý hơn đến các khám phá của nhà khoa học nam và nữ.', 'Đoạn 7',
      '“the Harvard University faculty was tortured by empty debates over the relative intrinsic differences in the scientific abilities of men and women.” … “but no statistically significant differences in inherent scientific ability based on gender.”',
      'Tác giả chỉ nói vấn đề là ý nghĩa thống kê của dữ liệu; không nhắc gì đến khám phá của các nhà khoa học → NOT GIVEN'],
    35: ['Một số thay đổi có thể giảm ______ trong việc đưa tin khoa học.', 'Đoạn 1, 4 & 8',
      '“Ambiguous word choices are the source of some misunderstandings.” … “There are steps we can take to improve public understanding of scientific developments.”',
      'Các bước cải thiện sự hiểu biết của công chúng = giảm hiểu lầm → misunderstandings'],
    36: ['Bằng chứng khoa học không cần được con người ______ mới có giá trị.', 'Đoạn 8',
      '“The first would be to inculcate greater understanding and acceptance of indirect scientific evidence not directly observable by human scientists.”',
      '“not directly observable by human scientists” → observable'],
    37: ['Cách đánh giá nghiên cứu lý thuyết có thể khác với nghiên cứu có ______ thực tiễn.', 'Đoạn 8',
      '“we might need different standards for evaluating science with urgent policy implications as opposed to research with a purely theoretical value.”',
      '“urgent policy implications” = practical implications → implications'],
    38: ['Các nhà khoa học nên ______ hơn về ý nghĩa toán học của phát hiện.', 'Đoạn 8',
      '“it would be better if scientists were more prepared to discuss the mathematical significance of their results”',
      '“more prepared to discuss” = more open about → open'],
    39: ['Công chúng nên quen hơn với ______ dạng số.', 'Đoạn 8',
      '“if the public didn\'t treat maths as quite so scary: statistics, which tell us the uncertainty in a measurement”',
      '“statistics” = numerical data → data'],
    40: ['Khoa học và việc đưa tin khoa học nhất thiết là ______.', 'Đoạn 9',
      '“But fourth, and most important, people have to recognise that science can be complex.”',
      '“most important … science can be complex” = necessarily complicated → complicated'],
  },
};
