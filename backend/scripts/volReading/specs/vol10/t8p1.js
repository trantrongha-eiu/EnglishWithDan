// Vol 10 - Test 8 - Passage 1. Source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 8 Reading" (PDF đề trên Google Drive công
// khai + bảng đáp án). Not in the bank (dedupe10b.js 2026-11-25).
// Key: izone Q6 "A (18th century)" — but its own quote is “technological advances of the mid-1800s, coupled with the rise of the
// middle class” (paragraph C: “during the 1800s”) → 19th century = B.
// Text: "in a verity of forms" → variety; "five- year" → five-year.
const { headings, matching } = require('../../vr_build');
const CENT = ['the 18th century (1700–1799)', 'the 19th century (1800–1899)', 'the 20th century (1900–1999)'];
const PEOPLE = ['Jean Jacques Rousseau', 'Johan Heinrich Pestalozzi', 'Jean Marc Gaspard Itard', 'Friedrich Froebel'];
module.exports = {
  vol: 10, test: 8, part: 1, title: 'Education Philosophy', text: 't8p1.txt',
  groups: [
    headings(1, [
      'The inheritance and development of educational concepts of different thinkers',
      'Why children had to work to alleviate the burden on family',
      'Why children are not highly valued',
      'The explanation for children dying in hospital at their early age',
      'The first appearance of modern educational philosophy',
      'The application of a creative learning method on a wild kid',
      'The emergence and spread of the notion of kindergarten',
    ], ['Paragraph A', 'Paragraph C', 'Paragraph D', 'Paragraph E'],
    { instruction: 'Reading Passage 1 has six paragraphs, A–F. Choose the correct heading for paragraphs A and C–E from the list of headings below. Write the correct number, i–vii, in boxes 1–4 on your answer sheet.' }),
    matching(5, CENT, [
      'the need for children to work',
      'the rise of the middle class',
      'the emergence of a kindergarten',
      'the spread of kindergartens around the U.S.',
    ], { title: 'List of Dates', reuse: true, instruction: 'Look at the following events (Questions 5–8) and the list of dates below. Match each event with the correct date, A, B or C. Write the correct letter, A, B or C, in boxes 5–8 on your answer sheet. NB You may use any letter more than once.' }),
    matching(9, PEOPLE, [
      'was not successful to prove the theory',
      'observed a child’s record',
      'requested a study setting with emotional comfort firstly',
      'proposed that corruption was not a characteristic in people’s nature',
      'was responsible for an increase in the number of a type of school',
    ], { title: 'List of People', reuse: true, instruction: 'Look at the following opinions or deeds (Questions 9–13) and the list of people below. Match each opinion or deed with the correct person, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 9–13 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 1: 'iii', 2: 'v', 3: 'i', 4: 'vi', 5: 'A', 6: 'B', 7: 'B', 8: 'C', 9: 'C', 10: 'A', 11: 'B', 12: 'A', 13: 'D' },
  expl: {
    1: ['Đoạn A', 'Đoạn A',
      '“Since all parents expected to bury some of their children, they found it difficult to invest in their newborn children.” … “parents avoided making any emotional commitment to an infant”',
      'Tỷ lệ tử vong trẻ sơ sinh cao nên cha mẹ ngại đầu tư, tránh gắn bó tình cảm với con = trẻ em không được coi trọng. iv sai: bài không nói trẻ chết trong bệnh viện → iii'],
    2: ['Đoạn C', 'Đoạn C',
      '“John Locke, one of the most influential writers of his period, created the first clear and comprehensive statement of the ‘environmental position’” … “he became the father of modern learning theory”',
      '“the first clear and comprehensive statement” + “father of modern learning theory” = sự xuất hiện đầu tiên của triết lý giáo dục hiện đại → v'],
    3: ['Đoạn D', 'Đoạn D',
      '“He agreed with Rousseau that humans are naturally good but were spoiled by a corrupt society.”',
      'Đoạn D trình bày quan điểm của Rousseau rồi Pestalozzi tiếp nhận (“agreed with Rousseau”) và phát triển thành phương pháp dạy học riêng = sự kế thừa và phát triển quan niệm giáo dục của các nhà tư tưởng → i'],
    4: ['Đoạn E', 'Đoạn E',
      '“One of the best-documented cases of Pestalozzi’s theory concerned a so-called feral child named Victor”',
      'Áp dụng lý thuyết của Pestalozzi vào cậu bé hoang dã (feral child = wild kid) Victor → vi'],
    5: ['Nhu cầu trẻ em phải đi làm', 'Đoạn B',
      '“The 18th century witnessed the transformation from an agrarian economy to an industrial one” … “young children from the poorest families were forced into early employment”',
      'Trong bối cảnh chuyển đổi kinh tế của thế kỷ 18, trẻ em nhà nghèo bị buộc đi làm sớm để thêm thu nhập → A'],
    6: ['Sự gia tăng của tầng lớp trung lưu', 'Đoạn C',
      '“The lives of children underwent a drastic change during the 1800s in the United States.” … “thanks to the technological advances of the mid-1800s, coupled with the rise of the middle class”',
      '“the mid-1800s”, “during the 1800s” = thế kỷ 19 (1800–1899) → B'],
    7: ['Sự ra đời của trường mẫu giáo', 'Đoạn F',
      '“One of the early examples was the invention of kindergarten, which was a word and a movement created by a German-born educator, Friedrich Froebel in 1840.”',
      'Mẫu giáo được Froebel tạo ra năm 1840 = thế kỷ 19 → B'],
    8: ['Sự lan rộng của trường mẫu giáo khắp nước Mỹ', 'Đoạn F',
      '“the movement eventually reached and flourished in the United States in the 20th century”',
      '“reached and flourished in the United States” = spread around the U.S., “in the 20th century” → C'],
    9: ['Không thành công trong việc chứng minh lý thuyết', 'Đoạn E',
      '“Itard’s goal to teach Victor the basics of speech could never be fully achieved, but Victor had learnt some elementary forms of communication.”',
      'Itard áp dụng lý thuyết của Pestalozzi nhưng mục tiêu dạy Victor nói “could never be fully achieved” = not successful → C'],
    10: ['Đã quan sát hồ sơ, ghi chép về trẻ em', 'Đoạn D',
      '“This work was based on his extensive observation of children and adolescents, their individuality, his developmental theory and on the memories of his own childhood.”',
      'Tác phẩm Emile của Rousseau dựa trên quan sát sâu rộng về trẻ em và ký ức tuổi thơ của chính ông → A'],
    11: ['Yêu cầu trước hết phải có một môi trường học tập thoải mái về mặt cảm xúc', 'Đoạn D',
      '“his theory was based upon establishing an emotionally healthy homelike learning environment, which had to be in place before more specific instructions occurred”',
      'Pestalozzi: môi trường học “emotionally healthy homelike” phải có “before” (= firstly) các chỉ dẫn cụ thể → B'],
    12: ['Đề xuất rằng sự tha hóa không phải là bản chất của con người', 'Đoạn D',
      '“According to Jean Jacques Rousseau” … “people were ‘noble savages’ in the original state of nature, meaning they are innocent, free and uncorrupted”',
      'Rousseau đưa ra quan niệm con người ở trạng thái tự nhiên “uncorrupted” (Pestalozzi chỉ đồng ý với ông) → A'],
    13: ['Chịu trách nhiệm cho sự gia tăng số lượng của một loại trường học', 'Đoạn F',
      '“When Froebel died in 1852, dozens of kindergartens had been created in Germany. Kindergartens began to increase in Europe”',
      'Froebel sáng tạo ra mẫu giáo; khi ông mất đã có hàng chục trường và tiếp tục tăng = an increase in the number of a type of school → D'],
  },
};
