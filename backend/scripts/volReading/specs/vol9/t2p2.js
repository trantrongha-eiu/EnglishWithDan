// Vol 9 - READING/TEST 2-R.docx - Passage 2 (typed docx). Not in the bank ("Consecutive and Simultaneous Translation" is a
// different text) / mini-ielts. Key = KEY TEST 2-R.docx.
// Text fixes: "more complex than translation a claim" → "translation – a claim"; "rough and-ready" → rough-and-ready;
// "precise writing" → précis writing. Instructions: docx "Reading Passage 3 has eight paragraphs" → 2; "(Questions 21-24)" → 20–23.
// Q18 "does not need to consider its ___ aspects": Vol key "stylistic features", original key "stylistic" → accept both.
// Q24–26: the docx drops option F of the original (talk915.com, IELTS 25 Oct 2025: options A–F, key B, D, F; the original also has
// a Q29 "a list of the areas of knowledge…" that Vol dropped to make 13 questions). Vol key "A, B, D" is wrong (A contradicts
// "certain tasks blur this distinction") → option F restored, key B, D, F.
const { matching, notes, multi } = require('../../vr_build');
module.exports = {
  vol: 9, test: 2, part: 2, title: 'Translating: a key to international understanding?', text: 't2p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [
      'the effect that a client\'s requirements have on the nature of a translation',
      'contrasting attitudes towards translators',
    ], { instruction: 'Reading Passage 2 has eight paragraphs, A–H. Which paragraph contains the following information? Write the correct letter, A–H, in boxes 14–15 on your answer sheet.' }),
    notes(16, 19, [
      'Translation is an attempt to create a text in the target language which displays __Q16__ with a source text. It is inevitable that not all information can be conveyed, however, so translations are best judged according to their __Q17__; for example, the translator of a business letter or scientific text does not need to consider its __Q18__ aspects while someone dubbing a film may give a relatively low value to __Q19__.',
    ], { title: 'The goal of translation',
      instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from paragraphs C, D and E for each answer. Write your answers in boxes 16–19 on your answer sheet.' }),
    matching(20, ['aesthetic', 'ethnographic', 'free', 'literal', 'pragmatic', 'word-for-word'], [
      'focuses on reproducing the content accurately',
      'looks at important cultural aspects of language use',
      'follows the original grammatical structures as required by the target language',
      'focuses on meaning without necessarily using the original grammatical structures',
    ], { title: 'Types of Translation',
      instruction: 'Look at the following features of translating (Questions 20–23) and the types of translation below. Match each feature with the correct type of translation, A–F. Write the correct letter, A–F, in boxes 20–23 on your answer sheet.' }),
    multi(24, 3, 'Which THREE of the following points are mentioned by the writer of the passage?', [
      'The objectives of translating are always clearly different from those of interpreting.',
      'A translator may need to consider the culture of the target language.',
      'Translation is an activity which requires professional training.',
      'It is difficult to specify what constitutes a very good translation.',
      'The skill required for translation is increasingly gaining recognition.',
      'A translation should give the impression of being an original work.',
    ]),
  ],
  key: { 14: 'E', 15: 'H', 16: 'semantic equivalence', 17: 'purpose', 18: 'stylistic / stylistic features', 19: 'content',
    20: 'E', 21: 'B', 22: 'D', 23: 'C', 24: 'B', 25: 'D', 26: 'F' },
  expl: {
    14: ['ảnh hưởng của yêu cầu từ khách hàng đến bản chất của một bản dịch', 'Đoạn E',
      '“The success of translation depends on the purpose for which it was made, which in turn reflects the needs of the people for whom it was made.”',
      'Bản dịch tùy mục đích, mà mục đích phản ánh nhu cầu người đặt dịch (thư, bài khoa học, phim lồng tiếng, văn học) → E'],
    15: ['những thái độ trái ngược đối với người dịch', 'Đoạn H',
      '“Some countries view translation as a menial, clerical task, and pay their translators accordingly, while others regard it as a major intellectual discipline in its own right.”',
      'Có nước coi dịch thuật là việc vặt, có nước coi là ngành trí tuệ lớn → thái độ trái ngược → H'],
    16: ['Dịch thuật là nỗ lực tạo ra văn bản ở ngôn ngữ đích thể hiện ______ với văn bản nguồn.', 'Đoạn C',
      '“The aim of translation is to provide semantic equivalence between source and target language.”',
      '“aim of translation” = goal; “provide semantic equivalence” → semantic equivalence'],
    17: ['… nên bản dịch tốt nhất được đánh giá theo ______ của nó.', 'Đoạn E',
      '“The success of translation depends on the purpose for which it was made”',
      'Thành công của bản dịch phụ thuộc vào mục đích của nó → purpose'],
    18: ['người dịch thư thương mại hay văn bản khoa học không cần quan tâm đến khía cạnh ______', 'Đoạn E',
      '“A translation of a scientific article requires careful attention to meaning but little attention to stylistic features.”',
      'Bản dịch khoa học chỉ cần ít chú ý đến đặc điểm văn phong (stylistic features) → “its stylistic aspects” → stylistic'],
    19: ['người lồng tiếng phim có thể coi nhẹ ______', 'Đoạn E',
      '“The provision of a dubbed film script will warrant scrupulous care over the synchronisation of lip movements, often at the expense of content.”',
      '“at the expense of content” = nội dung bị hy sinh, coi nhẹ → content'],
    20: ['tập trung tái hiện nội dung một cách chính xác', 'Đoạn F',
      '“A pragmatic translation emphasises accuracy and knowledge of the subject”',
      'Dịch thực dụng (pragmatic) chú trọng sự chính xác → E'],
    21: ['xem xét các khía cạnh văn hóa quan trọng của việc dùng ngôn ngữ', 'Đoạn F',
      '“Ethnographic or sociolinguistic translations aim to pay full attention to the cultural backgrounds of the authors and the recipients”',
      'Dịch dân tộc học (ethnographic) chú ý đầy đủ đến nền văn hóa → B'],
    22: ['theo cấu trúc ngữ pháp gốc ở mức ngôn ngữ đích cho phép', 'Đoạn G',
      '“In a literal translation the linguistic structure of the source text is followed, but is normalised according to the rules of the target language.”',
      'Dịch sát (literal) giữ cấu trúc gốc nhưng chuẩn hóa theo quy tắc ngôn ngữ đích → D'],
    23: ['tập trung vào ý nghĩa, không nhất thiết dùng cấu trúc ngữ pháp gốc', 'Đoạn G',
      '“In a free translation the linguistic structure of the source language is ignored, and an equivalent is found based on the meaning it conveys.”',
      'Dịch tự do (free) bỏ qua cấu trúc gốc, tìm tương đương theo nghĩa → C'],
    24: ['Ba ý nào được tác giả đề cập? (đáp án thứ nhất)', 'Đoạn B',
      '“The same special awareness needs to be present for the target language, so that points of special phrasing, contemporary fashions in expression, local expectations, and so on, can all be taken into account.”',
      'Người dịch cần hiểu văn hóa, cách diễn đạt và kỳ vọng địa phương của ngôn ngữ đích → B'],
    25: ['Ba ý nào được tác giả đề cập? (đáp án thứ hai)', 'Đoạn E',
      '“It therefore follows that there is no such thing as a best translation.”',
      '“no such thing as a best translation” = khó xác định thế nào là một bản dịch rất tốt → D'],
    26: ['Ba ý nào được tác giả đề cập? (đáp án thứ ba)', 'Đoạn H',
      '“Translators aim to produce a text that is as faithful to the original as circumstances require or permit, and yet that reads as if it were written originally in the target language.”',
      'Bản dịch phải đọc như thể được viết ra từ đầu bằng ngôn ngữ đích = tạo cảm giác là một tác phẩm gốc. Các ý sai: A trái với “certain tasks blur this distinction”; C không được nhắc; E trái với “its practitioners’ social status and legal rights undervalued” → F'],
  },
};
