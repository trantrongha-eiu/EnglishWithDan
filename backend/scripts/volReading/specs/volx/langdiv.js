// Extra (not a Vol test): "Language diversity" (New Scientist article on Evans & Levinson vs universal grammar) — the passage
// students report as "Linguistic diversity" (Q4/2026, noted as "VOL 9" but not in our Vol 9/10 sources). Text, questions and
// key from ieltspracticeonline.com "IELTS Reading Practice 95: Language diversity"; key matches ieltsmaterial.com (Q1–14 there =
// Q27–40 here). Not in the bank (no passage mentions Levinson / Arrernte / Straits Salish). Seeded 2026-11-25 as Passage 3.
// Text: footnote marker "[1]" after "syllables" → footnote kept as a last line; "universals. you get" → comma; "There- are" fixed.
// Q40 key = D (izone/ieltsmaterial print it; the source page left it blank): recursion = “the most essential characteristic”.
const { ynng, mc, endings } = require('../../vr_build');
module.exports = {
  vol: 'x', test: 2, part: 3, title: 'Language diversity', text: 'langdiv.txt', lettered: false,
  groups: [
    ynng(27, [
      'In the final decades of the twentieth century, a single theory of language learning was dominant.',
      'The majority of UG rules proposed by linguists do apply to all human languages.',
      'There is disagreement amongst linguists about an aspect of Straits Salish grammar.',
      'The search for new universal language rules has largely ended.',
      'If Evans and Levinson are right, people develop in the same way no matter what language they speak.',
      'The loss of any single language might have implications for the human race.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 27–32 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
    mc(33, [
      ['Which of the following views about language are held by Evans and Levinson?', [
        'Each of the world’s languages develops independently.', 'The differences between languages outweigh the similarities.',
        'Only a few language features are universal.', 'Each language is influenced by the characteristics of other languages.']],
      ['According to Evans and Levinson, apparent similarities between languages could be due to', [
        'close social contact.', 'faulty analysis.', 'shared modes of perception.', 'narrow descriptive systems.']],
      ['In the eighth paragraph, what does the reference to a middle-ear infection serve as?', [
        'A justification for something.', 'A contrast with something.', 'The possible cause of something.', 'The likely result of something.']],
      ['What does the writer suggest about Evans’ and Levinson’s theory of language development?', [
        'It had not been previously considered.', 'It is presented in a convincing way.', 'It has been largely rejected by other linguists.',
        'It is not supported by the evidence.']],
      ['Which of the following best describes the writer’s purpose?', [
        'To describe progress in the field of cognitive science.', 'To defend a long-held view of language learning.',
        'To identify the similarities between particular languages.', 'To outline opposing views concerning the nature of language.']],
    ]),
    endings(38, [
      'words of a certain grammatical type.',
      'a sequence of sounds predicted by UG.',
      'words which can have more than one meaning.',
      'the language feature regarded as the most basic.',
      'sentences beyond a specified length.',
    ], [
      'The Arrernte language breaks a ‘rule’ concerning',
      'The Lao language has been identified as lacking',
      'It has now been suggested that Amazonian Piraha does not have',
    ]),
  ],
  key: { 27: 'YES', 28: 'NO', 29: 'YES', 30: 'NOT GIVEN', 31: 'NO', 32: 'YES', 33: 'A', 34: 'C', 35: 'C', 36: 'B', 37: 'D',
    38: 'B', 39: 'A', 40: 'D' },
  expl: {
    27: ['Trong những thập kỷ cuối thế kỷ 20, một lý thuyết duy nhất về việc học ngôn ngữ chiếm ưu thế.', 'Đoạn 1',
      '“Put forward by Noam Chomsky in the 1960s” … “For five decades this idea prevailed, and influenced work in linguistics, psychology and cognitive science.”',
      'Thuyết UG ra đời thập niên 1960 và “prevailed” (thống trị) suốt 5 thập kỷ → bao trùm các thập kỷ cuối thế kỷ 20 → YES'],
    28: ['Phần lớn các quy tắc UG do các nhà ngôn ngữ học đề xuất đúng với mọi ngôn ngữ của loài người.', 'Đoạn 2',
      '“Since the theory of UG was proposed, linguists have identified many universal language rules. However, there are almost always exceptions.”',
      'Hầu như luôn có ngoại lệ → các quy tắc này không áp dụng cho mọi ngôn ngữ → NO'],
    29: ['Các nhà ngôn ngữ học bất đồng về một khía cạnh ngữ pháp của tiếng Straits Salish.', 'Đoạn 3',
      '“More controversially, some linguists argue that a few languages, such as Straits Salish” … “do not even have distinct nouns or verbs”',
      '“More controversially, some linguists argue” = gây tranh cãi, chỉ một số nhà ngôn ngữ học cho rằng → có bất đồng → YES'],
    30: ['Việc tìm kiếm các quy tắc ngôn ngữ phổ quát mới về cơ bản đã kết thúc.', 'Cả bài',
      '“Since the theory of UG was proposed, linguists have identified many universal language rules.”',
      'Bài nói các quy tắc phổ quát đã tìm được đều có ngoại lệ, nhưng không nói việc tìm kiếm quy tắc mới đã dừng hay chưa → NOT GIVEN'],
    31: ['Nếu Evans và Levinson đúng, con người phát triển giống nhau bất kể nói ngôn ngữ nào.', 'Đoạn 5',
      '“if Evans and Levinson are correct, language, in turn, shapes our brains. This suggests that humans are more diverse than we thought, with our brains having differences depending on the language environment in which we grew up.”',
      'Não bộ khác nhau tùy môi trường ngôn ngữ, ngược với “develop in the same way” → NO'],
    32: ['Việc mất đi bất kỳ ngôn ngữ nào cũng có thể ảnh hưởng đến loài người.', 'Đoạn 5',
      '“every time a language becomes extinct, humanity loses an important piece of diversity”',
      '“every time a language becomes extinct” = the loss of any single language; “humanity loses” = implications for the human race → YES'],
    33: ['Evans và Levinson có quan điểm nào về ngôn ngữ?', 'Đoạn 6',
      '“He and Levinson argue that this is because any given language is a complex system shaped by many factors, including culture, genetics and history.”',
      'Mỗi ngôn ngữ được định hình bởi văn hóa, di truyền, lịch sử riêng, không theo một bộ quy tắc chung = mỗi ngôn ngữ phát triển độc lập. C sai: họ nói “no absolutely universal traits”, không có đặc điểm phổ quát nào → A'],
    34: ['Theo Evans và Levinson, những điểm giống nhau giữa các ngôn ngữ có thể là do', 'Đoạn 7',
      '“For example, the fact that before we learn to speak we perceive the world as a place full of things causing actions (agents) and things having actions done to them (patients) explains why most languages deploy these grammatical categories.”',
      'Con người cùng cảm nhận thế giới theo một cách (perceive) nên nhiều ngôn ngữ có chung phạm trù ngữ pháp = shared modes of perception → C'],
    35: ['Ở đoạn thứ tám, việc nhắc đến bệnh viêm tai giữa đóng vai trò gì?', 'Đoạn 8',
      '“most indigenous Australian languages lack many sounds that are common in other languages, but which are hard to hear with a middle-ear infection. Whether this condition has shaped the sound systems of these languages is unknown”',
      'Viêm tai giữa được nêu như một nguyên nhân có thể (chưa chắc chắn: “is unknown”, “important to consider the idea”) khiến các ngôn ngữ này thiếu một số âm → C'],
    36: ['Tác giả gợi ý gì về lý thuyết phát triển ngôn ngữ của Evans và Levinson?', 'Đoạn 9',
      '“Levinson and Evans are not the first to question the theory of universal grammar, but no one has summarised these ideas quite as persuasively”',
      '“persuasively” = in a convincing way. A sai: họ “not the first”; C sai: lý thuyết gây “widespread enthusiasm” → B'],
    37: ['Câu nào mô tả đúng nhất mục đích của tác giả?', 'Cả bài',
      '“One of the most influential ideas in the study of languages is that of universal grammar (UG).” … “But what if the very diversity of languages is the key to understanding human communication?”',
      'Bài trình bày thuyết UG của Chomsky rồi quan điểm đối lập của Evans và Levinson = outline opposing views concerning the nature of language → D'],
    38: ['Tiếng Arrernte phá vỡ một “quy tắc” liên quan đến', 'Đoạn 2',
      '“It was once believed, for example, that if a language had syllables that begin with a vowel and end with a consonant (VC), it would also have syllables that begin with a consonant and end with a vowel (CV).” … “Arrernte” … “has VC syllables but no CV syllables”',
      'Quy tắc về cấu trúc âm tiết (chuỗi âm nguyên âm, phụ âm) mà UG dự đoán = a sequence of sounds predicted by UG → B'],
    39: ['Tiếng Lào được xác định là thiếu', 'Đoạn 3',
      '“Take the rule that every language contains four basic word classes: nouns, verbs, adjectives and adverbs.” … “Others, such as Lao, spoken in Laos, have no adjectives at all.”',
      'Không có tính từ = thiếu một loại từ (word class) nhất định → A'],
    40: ['Gần đây có ý kiến cho rằng tiếng Piraha ở Amazon không có', 'Đoạn 4',
      '“This includes recursion” … “It is widely considered to be the most essential characteristic of human language” … “Amazonian Piraha does not have this quality”',
      'Tính đệ quy (recursion) được coi là đặc điểm thiết yếu nhất = the language feature regarded as the most basic → D'],
  },
};
