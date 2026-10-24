// Vol 4 - reading/test 4/test 4.pdf - Reading Passage 3 (PDF p9–12). Not in the bank: "The Secrets of Persuasion" there is the
// newspaper article this IELTS text was adapted from (12% 6-gram overlap, other questions) → new passage. Text = PDF (typed,
// clean OCR). The PDF lost the beginning of paragraph 3 (blank line, then "experiments on the psychology of persuasion were
// telling only a part of the story") → restored from the full text on ieltsit.com / tuhoc.dolenglish.vn ("The Power of
// Persuasion"): "When he realised that traditional experiments …" (same keys there; their Q29 options are in another order).
// Typos fixed:
// "donducting", "leavea", "reduceoollution", "tha", "neighhours", "Afurther", "Searcity", "professional don't", "bastful",
// "undertaking we have already made", "indentified", "United Stateds", "where as"; Q36 "move surveys" → more, Q40 "Oder …
// consisitency" → Older … consistency. Key = explain key/test 4- up.pdf (scan), checked against the passage: all correct.
const { mc, summary, ynng } = require('../../vr_build');
module.exports = {
  vol: 4, test: 4, part: 3, title: 'The power of persuasion', text: 't4p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['What point is the writer making about Robert Cialdini in the first paragraph?', [
        'He wants to change the way society operates.', 'He uses a wide variety of research techniques.',
        'He has an unconventional approach to his work.', 'He refuses to make use of animals in his experiments.']],
      ['What is the writer doing in the second paragraph?', [
        'identifying a motivation for the research', 'assessing one aspect of Cialdini\'s character',
        'questioning Cialdini\'s scientific research techniques', 'applauding researchers who examine their own experience']],
      ['What are we told about Cialdini\'s research methodology?', [
        'It was conducted in a laboratory.', 'It involved him taking courses of study.',
        'It was focused on one particular product.', 'It was based on interviews with salespeople.']],
      ['What was Cialdini\'s research question for the towel experiment?', [
        'Is it more effective not to use a card?', 'Does the message make any difference?',
        'Why is the threat of pollution so persuasive?', 'Can hotels be persuaded to provide more towels?']],
      ['The results of the towel experiment suggest that guests', [
        'were disinclined to tell the truth about towel use.', 'preferred not to receive a message with their towels.',
        'were more receptive to messages about other guests.', 'responded more positively to an environmental message.']],
    ]),
    summary(32, 36,
      'Cialdini\'s towel experiment demonstrated the principle he named \'social proof\', which can result in competitive materialism. His research using chocolates suggests that people don\'t always assess the __Q32__ of a transaction. A further principle recommends that advertisers and parents should claim that something is a __Q33__ in order to be more persuasive. The authority principle is often ignored when some professionals are concerned their actions might be considered __Q34__. He similarly suggests that people will give more to charity if they can be reminded of __Q35__. Lastly, even something like a __Q36__ has been shown to result in more surveys being completed.',
      ['rare opportunity', 'previous commitments', 'generous response', 'true qualification', 'similar name', 'ruthless exploitation',
        'social obligation', 'relative value', 'bad behaviour', 'small favour'],
      { title: 'The six principles of persuasion',
        instruction: 'Complete the summary using the list of phrases, A–J, below. Write the correct letter, A–J, in boxes 32–36 on your answer sheet.' }),
    ynng(37, [
      'The writer sees evidence of the reciprocity principle in his own family.',
      'Persuasion may operate in different ways in different countries.',
      'New Zealand diners are likely to leave tips if they are given chocolate.',
      'Older New Zealanders would be more attracted to consistency.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
  ],
  key: { 27: 'C', 28: 'A', 29: 'B', 30: 'B', 31: 'C', 32: 'relative value', 33: 'rare opportunity', 34: 'bad behaviour',
    35: 'previous commitments', 36: 'similar name', 37: 'NOT GIVEN', 38: 'YES', 39: 'NO', 40: 'NO' },
  expl: {
    27: ['Ở đoạn 1, tác giả muốn nói gì về Robert Cialdini?', 'Đoạn 1',
      '“Then there is Robert Cialdini, whose unorthodox research involves such mundane items as towels and chocolates.”',
      '“unorthodox” = khác thường, không theo lối mòn = unconventional approach (đối lập với kính thiên văn, chuột, ống nghiệm) → C'],
    28: ['Ở đoạn 2, tác giả đang làm gì?', 'Đoạn 2',
      '“This is in part a personal quest with its origins in his own experience: Cialdini claims that for his whole life he has been easy prey for salespeople and fundraisers”',
      'Đoạn giải thích vì sao Cialdini nghiên cứu (ông hay bị người bán hàng thuyết phục) = nêu động lực nghiên cứu → A'],
    29: ['Ta biết gì về phương pháp nghiên cứu của Cialdini?', 'Đoạn 3',
      '“Cialdini began to probe influence in the real world, enrolling in sales-training programmes.”',
      '“enrolling in sales-training programmes” = theo học các khoá đào tạo bán hàng = taking courses of study. (A sai: ông chuyển ra “the real world”.) → B'],
    30: ['Câu hỏi nghiên cứu của thí nghiệm khăn tắm là gì?', 'Đoạn 3',
      '“Cialdini and his colleagues wanted to test the relative effectiveness of different text on those cards.”',
      'Kiểm tra hiệu quả của các nội dung khác nhau trên tấm thẻ = thông điệp có tạo khác biệt không → B'],
    31: ['Kết quả thí nghiệm khăn tắm cho thấy khách…', 'Đoạn 4',
      '“replacing the environmental message with the simple (and truthful) statement that the majority of guests at the hotel had reused their towel at least once. Those guests who received this message were found to be 26% more likely to reuse their towel”',
      'Thông điệp về việc các khách khác đã dùng lại khăn hiệu quả hơn thông điệp môi trường → C'],
    32: ['Thí nghiệm sô-cô-la cho thấy người ta không phải lúc nào cũng đánh giá ______ của một giao dịch.', 'Đoạn 5',
      '“we want to return favours done to us, often without bothering to accurately calculate whether what we are giving is proportionate to what we have received.”',
      '“accurately calculate whether … proportionate” = đánh giá giá trị tương đối (chữ H) → relative value'],
    33: ['Một nguyên tắc khuyên nhà quảng cáo và cha mẹ nói rằng điều gì đó là một ______.', 'Đoạn 6',
      '“Parents can also make use of scarcity by telling their little ones that this is a very unusual chance so they should seize it immediately.”',
      '“a very unusual chance” = cơ hội hiếm có (chữ A) → rare opportunity'],
    34: ['Nguyên tắc uy tín hay bị bỏ qua khi một số chuyên gia lo hành động của họ bị coi là ______.', 'Đoạn 6',
      '“many professionals don\'t display their credentials, fearing it is boastful or arrogant to publicise their expertise.”',
      '“boastful or arrogant” = khoe khoang, kiêu ngạo = cư xử không hay (chữ I) → bad behaviour'],
    35: ['Người ta sẽ quyên góp nhiều hơn nếu được nhắc về ______.', 'Đoạn 6',
      '“Later, return with a sponsorship form to those who said yes and remind them of their earlier undertaking.”',
      '“earlier undertaking” = cam kết trước đó (chữ B) → previous commitments'],
    36: ['Ngay cả thứ như một ______ cũng khiến nhiều phiếu khảo sát được hoàn thành hơn.', 'Đoạn 6',
      '“When the researcher falsely identified herself (e.g. Cynthia Johnson is sent a survey by \'Cindy Johansen\'), surveys were twice as likely to be completed.”',
      'Cynthia Johnson – Cindy Johansen: tên gần giống nhau (chữ E) → similar name'],
    37: ['Tác giả thấy nguyên tắc có qua có lại trong chính gia đình mình.', 'Đoạn cuối',
      '“I can readily see evidence for some of them in my own workplace.”',
      'Tác giả nói thấy bằng chứng ở nơi làm việc (nhà hàng), không nhắc đến gia đình → NOT GIVEN'],
    38: ['Sự thuyết phục có thể vận hành khác nhau ở các nước khác nhau.', 'Đoạn cuối',
      '“I wonder how well all of his findings can be applied here in New Zealand or elsewhere around the world.” … “cannot imagine New Zealand waiting staff using his cynical chocolate trick in their restaurants because the culture of tipping in this country is so different.”',
      'Văn hoá tiền boa ở New Zealand khác Mỹ → nguyên tắc có qua có lại thể hiện khác → YES'],
    39: ['Thực khách New Zealand có khả năng để lại tiền boa nếu được tặng sô-cô-la.', 'Đoạn cuối',
      '“in this country reciprocation would more likely take the form of a return visit to the restaurant and not a tip.”',
      '“not a tip” = không phải tiền boa mà là quay lại ăn → NO'],
    40: ['Người New Zealand lớn tuổi sẽ bị thu hút bởi nguyên tắc nhất quán hơn.', 'Đoạn cuối',
      '“I suspect that younger people in this country would respond quite positively to this sort of approach, whereas their parents might be put off by any hint of a hard sell.”',
      'Người trẻ đón nhận, còn thế hệ cha mẹ (lớn tuổi) có thể bị “put off” = phản cảm → NO'],
  },
};
