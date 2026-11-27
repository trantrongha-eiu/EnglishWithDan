// Cambridge IELTS 13 - Test 2 - Passage 2. Source: ieltsworldly.com, checked against the book key.
// Text fixes: "In a groundbreaking experiments" → experiment; doubled "at the".
const { matching, notes } = require('../../vr_build');
const SIX = ['A', 'B', 'C', 'D', 'E', 'F'];
module.exports = {
  vol: 'cam13', book: 13, test: 2, part: 2, title: 'Oxytocin', text: 't2p2.txt',
  groups: [
    matching(14, SIX, [
      'reference to research showing the beneficial effects of oxytocin on people',
      'reasons why the effects of oxytocin are complex',
      'mention of a period in which oxytocin attracted little scientific attention',
      'reference to people ignoring certain aspects of their research data',
    ], { reuse: true, instruction: 'Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, in boxes 14–17 on your answer sheet. NB You may use any letter more than once.' }),
    matching(18, ['Markus Heinrichs', 'Simone Shamay-Tsoory', 'Jennifer Bartz', 'Carolyn DeClerck', 'Carsten De Dreu', 'Sue Carter'], [
      'People are more trusting when affected by oxytocin.',
      'Oxytocin increases people’s feelings of jealousy.',
      'The effect of oxytocin varies from one type of person to another.',
    ], { title: 'List of Researchers', instruction: 'Look at the following research findings (Questions 18–20) and the list of researchers below. Match each research finding with the correct researcher, A–F. Write the correct letter, A–F, in boxes 18–20 on your answer sheet.' }),
    notes(21, 26, [
      'The earliest findings about oxytocin and bonding came from research involving __Q21__. It was also discovered that humans produce oxytocin during __Q22__. An experiment in 2005, in which participants were given either oxytocin or a __Q23__, reinforced the belief that the hormone had a positive effect.',
      'However, later research suggests that this is not always the case. A study at the University of Haifa where participants took part in a __Q24__ revealed the negative emotions which oxytocin can trigger. A study at the University of Antwerp showed people’s lack of willingness to help __Q25__ while under the influence of oxytocin. Meanwhile, research at the University of Amsterdam revealed that people who have been given oxytocin consider __Q26__ that are familiar to them in their own country to have more positive associations than those from other cultures.',
    ], { title: 'Oxytocin research', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 21–26 on your answer sheet.' }),
  ],
  key: { 14: 'B', 15: 'F', 16: 'B', 17: 'E', 18: 'A', 19: 'B', 20: 'C', 21: 'animals', 22: 'childbirth', 23: 'placebo', 24: 'game', 25: 'strangers', 26: 'names' },
  expl: {
    14: ['Đoạn nhắc tới nghiên cứu cho thấy tác dụng có lợi của oxytocin đối với con người.', 'Đoạn B',
      '“people become more charitable, better at reading emotions on others’ faces and at communicating constructively in arguments.”',
      'Các nghiên cứu tiếp theo cho thấy oxytocin khiến người ta hào phóng, đọc cảm xúc giỏi hơn = tác dụng có lợi → B'],
    15: ['Lý do vì sao tác động của oxytocin phức tạp.', 'Đoạn F', '“It’s a very simple and ancient molecule that has been co-opted for many different functions,”',
      'Phân tử cổ xưa được dùng cho nhiều chức năng, tác động lên vùng não nguyên thủy, rồi bị tư duy và hoàn cảnh xã hội chi phối → giải thích sự phức tạp → F'],
    16: ['Nhắc tới giai đoạn oxytocin ít được giới khoa học chú ý.', 'Đoạn B', '“‘For eight years, it was quite a lonesome field,’ Heinrichs recalls.”',
      '“a lonesome field” = lĩnh vực vắng vẻ, ít người nghiên cứu suốt 8 năm → B'],
    17: ['Nhắc tới việc người ta bỏ qua một số khía cạnh trong dữ liệu nghiên cứu.', 'Đoạn E', '“Where once researchers took no notice of such findings”',
      '“took no notice of” = ignored; trước đây các nhà nghiên cứu phớt lờ những kết quả này → E'],
    18: ['Con người tin tưởng người khác hơn khi chịu tác động của oxytocin.', 'Đoạn B',
      '“The team found the participants who had sniffed oxytocin via a nasal spray beforehand invested more money than those who received a placebo instead.”',
      'Người hít oxytocin đầu tư nhiều tiền hơn cho người lạ không chắc trung thực = tin tưởng hơn (nhóm Markus Heinrichs) → A'],
    19: ['Oxytocin làm tăng cảm giác ghen tị.', 'Đoạn C', '“and felt more envy when others won.”', '“envy” = jealousy; nghiên cứu của Simone Shamay-Tsoory → B'],
    20: ['Tác động của oxytocin khác nhau tùy kiểu người.', 'Đoạn C', '“it improves people’s ability to read emotions, but only if they are not very socially adept to begin with.”',
      'Jennifer Bartz: chỉ có tác dụng với người kém giao tiếp, lại giảm hợp tác ở người hay lo âu = khác nhau theo tính cách → C'],
    21: ['Những phát hiện đầu tiên về oxytocin và sự gắn kết đến từ nghiên cứu trên ___.', 'Đoạn A',
      '“It was through various studies focusing on animals that scientists first became aware of the influence of oxytocin.”', 'Nghiên cứu trên động vật (chuột đồng, cừu) → animals'],
    22: ['Con người tiết oxytocin trong lúc ___.', 'Đoạn A', '“It is also released by women in childbirth”', '“released” = produce; khi sinh con → childbirth'],
    23: ['Thí nghiệm năm 2005 cho người tham gia dùng oxytocin hoặc ___.', 'Đoạn B', '“than those who received a placebo instead.”', 'Nhóm đối chứng nhận giả dược → placebo'],
    24: ['Nghiên cứu ở ĐH Haifa, người tham gia chơi một ___.', 'Đoạn C', '“when volunteers played a competitive game”', 'Tham gia một trò chơi đối kháng → game'],
    25: ['Nghiên cứu ở ĐH Antwerp: không sẵn lòng giúp ___.', 'Đoạn D', '“became less cooperative when dealing with complete strangers.”', '“less cooperative” = lack of willingness to help; với người lạ → strangers'],
    26: ['ĐH Amsterdam: người dùng oxytocin thấy ___ quen thuộc ở nước mình tích cực hơn.', 'Đoạn D', '“Dutch men became quicker to associate positive words with Dutch names than with foreign ones”',
      'Liên tưởng từ tích cực với tên Hà Lan hơn tên nước ngoài → names'],
  },
};
