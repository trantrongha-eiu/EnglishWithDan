// Vol 9 - READING/TEST 5-R.docx - Passage 2 (typed docx). Not in the bank / mini-ielts. Key = KEY TEST 5-R.docx.
// The docx prints a "14____" box above each of the seven unlettered paragraphs → A–G (the Ray quotation stays inside E).
// Headings: the docx list stops at viii but the key gives Q16 = ix; no online copy found → heading ix supplied for paragraph C
// ("How Ray became a botanist", from "He explains this conversion into a naturalist – in particular into a botanist").
// "A childhood interest in plant" → plants. Text: quotation "to what tribe and family similars or could be assigned" (garbled)
// → "similar plants could be assigned".
// Q21 "reflected the ___ that was taking place": key philosophy ("a new philosophy … that we now call science"); "revolution"
// ("a profound revolution in the way people interacted with nature") fits the sentence → accept both.
const { headings, notes, multi } = require('../../vr_build');
module.exports = {
  vol: 9, test: 5, part: 2, title: 'John Ray and the Study of Plants', text: 't5p2.txt',
  groups: [
    headings(14, [
      'Ray’s account of his working methods', 'The botanical expert who inspired Ray', 'A succession of academic achievements',
      'Ray’s informal tuition', 'Ray’s appreciation of his contemporary academic culture', 'A childhood interest in plants',
      'Plans for a bold new project', 'A description of the content of Ray’s first book', 'How Ray became a botanist',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–ix, in boxes 14–20 on your answer sheet.' }),
    notes(21, 24, [
      'John Ray was a scholar and self-taught botanist, whose work reflected the __Q21__ that was taking place during the 17th century in people’s way of thinking about the natural world. This new approach is the basis of the modern field of __Q22__. It represented a complete break from the ideas of Aristotle, which had dominated thinking up until that time.',
      'As Ray himself explained, his interest in plants was aroused after graduating, when he had to spend time outdoors after a period of __Q23__. He taught himself, in addition to many Cambridge __Q24__, and began compiling his catalogue of plants, which was published in 1660.',
    ], { title: 'A New Approach to Knowledge',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 21–24 on your answer sheet.' }),
    multi(25, 2, 'Which TWO of the following statements are true of Ray’s early life?', [
      'His teacher recommended that he should go to university.',
      'His school record was not exceptional in any way.',
      'He was helped by a former student of Cambridge University.',
      'His parents were both valued by the people in their local area.',
      'He originally planned to take up his father’s occupation.',
    ]),
  ],
  key: { 14: 'v', 15: 'iii', 16: 'ix', 17: 'iv', 18: 'i', 19: 'viii', 20: 'vii', 21: 'revolution / philosophy', 22: 'science',
    23: 'illness', 24: 'students', 25: 'C', 26: 'D' },
  expl: {
    14: ['Đoạn A', 'Đoạn A',
      '“he gave thanks that he had been born at a time when traditional dependence on the teaching of the Greek philosopher Aristotle (384–322 BCE) had given way to a new philosophy, based on experiment and observation of the real world”',
      'Ray biết ơn vì được sinh ra trong thời đại học thuật mới dựa trên thực nghiệm → v Ray’s appreciation of his contemporary academic culture'],
    15: ['Đoạn B', 'Đoạn B',
      '“Ray was admitted to Cambridge University in 1644” … “He was appointed Lecturer in Greek in 1651, Lecturer in Mathematics in 1653, and Lecturer in Humanities in 1655.”',
      'Vào Cambridge, tốt nghiệp, rồi liên tiếp được bổ nhiệm giảng viên → iii A succession of academic achievements'],
    16: ['Đoạn C', 'Đoạn C',
      '“He explains this conversion into a naturalist – in particular into a botanist” … “he became interested in the local flora, and finding nobody able to teach him, Ray investigated it for himself.”',
      'Đoạn C kể Ray trở thành nhà thực vật học ra sao (sau trận ốm, đi dạo và tự tìm hiểu cây cỏ). vi sai: hứng thú bắt đầu sau khi tốt nghiệp, không phải thời thơ ấu; ii sai: không ai dạy ông → ix How Ray became a botanist'],
    17: ['Đoạn D', 'Đoạn D',
      '“as they were being taught (unofficially – none of this was part of their formal education) by Ray.”',
      'Ray dạy sinh viên nhận biết cây cỏ một cách không chính thức → iv Ray’s informal tuition'],
    18: ['Đoạn E', 'Đoạn E',
      '“I had first to become familiar with the literature, to compare the plants that I found with the pictures, and when there seemed to be a resemblance, to go fully into any unknown descriptions.”',
      'Ray tự thuật cách ông làm việc: đọc tài liệu, so cây với tranh, tìm điểm giống nhau → i Ray’s account of his working methods'],
    19: ['Đoạn F', 'Đoạn F',
      '“It gave the names of plants found in the area around Cambridge and included information about where they grew and how common they were.”',
      'Mô tả nội dung cuốn Cambridge Catalogue (cuốn sách đầu tiên) → viii A description of the content of Ray’s first book'],
    20: ['Đoạn G', 'Đoạn G',
      '“he began to imagine a more comprehensive investigation of nature” … “This was an ambitious undertaking”',
      'Kế hoạch phân loại toàn bộ sinh vật, “ambitious undertaking” = dự án mới táo bạo → vii Plans for a bold new project'],
    21: ['… công trình của ông phản ánh cuộc ______ đang diễn ra vào thế kỷ 17 trong cách con người nghĩ về thế giới tự nhiên.', 'Đoạn A',
      '“John Ray was well aware that he lived through, and participated in, a profound revolution in the way people interacted with nature.” … “had given way to a new philosophy, based on experiment and observation of the real world”',
      'Ray sống giữa “a profound revolution” trong cách con người tiếp cận tự nhiên; key đề in “philosophy” (triết lý mới dựa trên thực nghiệm) cũng được chấp nhận → revolution'],
    22: ['Cách tiếp cận mới này là nền tảng của lĩnh vực ______ hiện đại.', 'Đoạn A',
      '“a new philosophy, based on experiment and observation of the real world, that we now call science.”',
      '“that we now call science” → science'],
    23: ['… khi ông phải ở ngoài trời sau một thời gian bị ______.', 'Đoạn C',
      '“Ray tells us that he suffered an illness in his early twenties, and was advised to take long walks and ride in the fresh air while recovering.”',
      'Ông được khuyên đi bộ, cưỡi ngựa ngoài trời khi hồi phục sau trận ốm → illness'],
    24: ['Ông tự học, đồng thời dạy cho nhiều ______ ở Cambridge', 'Đoạn D',
      '“By the mid-1650s, even the first-year students at Trinity College were able to identify the plants and flowers around Cambridge, as they were being taught … by Ray.”',
      'Ray dạy sinh viên Trinity College nhận biết cây → students'],
    25: ['Hai điều nào đúng về thời trẻ của Ray? (đáp án thứ nhất)', 'Đoạn B',
      '“his talents were recognised by a church official, Samuel Covell, who had graduated from Cambridge University in 1600” … “Through his influence, Ray was admitted to Cambridge University”',
      'Samuel Covell (cựu sinh viên Cambridge) giúp Ray vào đại học. A sai: đó là một quan chức nhà thờ, không phải thầy giáo → C'],
    26: ['Hai điều nào đúng về thời trẻ của Ray? (đáp án thứ hai)', 'Đoạn B',
      '“His father was a village blacksmith, and his mother was also a respected member of the community”',
      '“also a respected member of the community” = cả cha và mẹ đều được cộng đồng quý trọng. B sai (“unusually bright boy”), E không được nhắc → D'],
  },
};
