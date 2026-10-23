// Vol 3 - Test 1 - Reading Passage 3 (PDF p9–12). Not in the bank (mini-ielts 1529 = same text and questions, numbered 1–14).
// Text = mini copy (the PDF page has a watermark over two lines), checked against the PDF OCR. The PDF prints no paragraph
// letters; the questions say eight paragraphs A–H → "Over the past 15 years…" + "According to the Pasadena-based…" = C (the
// key, e.g. Q29 = C for the money spent on protecting ideas, only works this way). Fixes: title "Unkonwn" → Unknown; "here work"
// → her work; "1n ten years" → In; "Peter Chemin" → Peter Chernin (the head of Fox; also in Q39); "had led to a craze" → has
// led; "talents staff" → talented; "firms such IBM" → such as IBM; "isn't so sure:' He also…" (stray quote) → "isn't so sure.
// He also…". Key (explain file = mini) checked against the passage: all correct.
const { matching, tfng, mc } = require('../../vr_build');
module.exports = {
  vol: 3, test: 1, part: 3, title: 'Fear of the Unknown', text: 't1p3.txt',
  groups: [
    matching(27, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [
      'the methods some companies use to try to keep their most creative employees',
      'a new way of getting help with your personal difficulties',
      'how much investment goes into safeguarding the ideas of individuals',
      'two examples of companies which have succeeded through being innovative',
      'how some innovators manage to avoid spending large sums of money on testing out their ideas',
      'a commonly held opinion about product designers that needs to be proved wrong',
      'the target of one large company that has changed its business focus',
    ], { reuse: true, instruction: 'Reading Passage 3 has eight paragraphs, A–H. Which paragraph contains the following information? Write the correct letter, A–H, in boxes 27–33 on your answer sheet. NB You may use any letter more than once.' }),
    tfng(34, [
      'Umagic Systems is an example of a new innovative company.',
      'Amazon and Wal-Mart have exchanged successful ideas on innovation.',
      'Using financial rewards to encourage innovation is an outdated practice.',
      'IBM failed to understand David Post\'s \'virtual experts\' idea.',
    ]),
    mc(38, [
      ['What point does the writer make about intellectual property?', [
        'It can be lost when firms merge.',
        'It tends to belong to companies rather than individuals.',
        'It is valued more than it used to be.',
        'It is not usually owned by small companies.']],
      ['Peter Chernin is an example of someone who has realised that', [
        'large companies are less innovative than small ones.',
        'other businesses are more innovative than the film business.',
        'his employees need more experience of innovation.',
        'he is the best person to encourage innovation.']],
      ['In conclusion, the writer suggests that', [
        'computer-based industries cannot be innovative.',
        'big firms are right to be cautious about innovation.',
        'small firms should not worry about early failure.',
        'innovation will always involve some uncertainty.']],
    ]),
  ],
  key: { 27: 'F', 28: 'A', 29: 'C', 30: 'B', 31: 'E', 32: 'G', 33: 'F', 34: 'TRUE', 35: 'NOT GIVEN', 36: 'FALSE', 37: 'TRUE',
    38: 'C', 39: 'A', 40: 'D' },
  expl: {
    27: ['Các biện pháp một số công ty dùng để cố giữ những nhân viên sáng tạo nhất.', 'Đoạn F',
      '“the search for innovation has led to a craze for \'intrapreneurship\' – giving more power to individuals in the company and setting up internal ideas-factories so that talented staff will not leave.”',
      'Trao thêm quyền và lập “xưởng ý tưởng” nội bộ để nhân viên giỏi không bỏ đi → F'],
    28: ['Một cách mới để được giúp đỡ với những khó khăn cá nhân.', 'Đoạn A',
      '“websites that will allow subscribers to feed in details about themselves and their problems and to receive advice from \'virtual\' versions of personalities regarded as experts”',
      'Website của Umagic cho người dùng nhận lời khuyên từ “chuyên gia ảo” về vấn đề của mình → A'],
    29: ['Bao nhiêu tiền được đầu tư để bảo vệ ý tưởng của các cá nhân.', 'Đoạn C',
      '“a fortune is spent nowadays on identifying and protecting intellectual property: other people\'s ideas.”',
      '“a fortune is spent” = khoản đầu tư rất lớn; “protecting … other people\'s ideas” = bảo vệ ý tưởng → C'],
    30: ['Hai ví dụ về công ty thành công nhờ đổi mới.', 'Đoạn B',
      '“innovators such as Amazon (the internet bookstore) and Wal-Mart (the supermarket chain) which have produced completely new ideas or products that have changed their industries.”',
      'Amazon và Wal-Mart là hai “ngôi sao” nhờ ý tưởng mới → B'],
    31: ['Cách một số nhà đổi mới tránh tốn nhiều tiền cho việc thử nghiệm ý tưởng.', 'Đoạn E',
      '“entrepreneurs can conduct profitable, early-stage research, selling out to the big firms when they reach expensive, risky clinical trials.”',
      'Họ bán lại cho công ty lớn trước giai đoạn thử nghiệm lâm sàng tốn kém → E'],
    32: ['Một quan niệm phổ biến về người làm sản phẩm mới cần được chứng minh là sai.', 'Đoạn G',
      '“Companies have to discredit the widespread view that jobs working on new products are for \'those who can\'t cope in the real business\'.”',
      '“discredit the widespread view” = bác bỏ quan niệm phổ biến → G'],
    33: ['Mục tiêu của một công ty lớn đã thay đổi trọng tâm kinh doanh.', 'Đoạn F',
      '“Procter & Gamble is now changing the entire direction of its business from global expansion to product development; one of its new aims is to get innovations accepted across the company.”',
      'P&G đổi hướng kinh doanh, và “one of its new aims” = mục tiêu → F'],
    34: ['Umagic Systems là ví dụ về một công ty mới, sáng tạo.', 'Đoạn A',
      '“Umagic Systems is a young firm” … “who see such half-crazy new and innovative ideas as a threat to their own future success.”',
      'Umagic là công ty trẻ với ý tưởng mới mẻ, sáng tạo → TRUE'],
    35: ['Amazon và Wal-Mart đã trao đổi với nhau các ý tưởng đổi mới thành công.', 'Đoạn B',
      '“The stars of American business tend today to be innovators such as Amazon (the internet bookstore) and Wal-Mart (the supermarket chain)”',
      'Bài chỉ lấy hai công ty làm ví dụ, không nói chúng trao đổi ý tưởng với nhau → NOT GIVEN'],
    36: ['Dùng phần thưởng tài chính để khuyến khích đổi mới là cách làm lỗi thời.', 'Đoạn G',
      '“They have to change the culture by introducing hard incentives, such as giving more generous bonuses to those who come up with successful new ideas”',
      'Tác giả khuyên các công ty NÊN thưởng hậu hơn — trái với “lỗi thời” → FALSE'],
    37: ['IBM đã không hiểu ý tưởng “chuyên gia ảo” của David Post.', 'Đoạn H',
      '“He also recalls with glee the looks of total incomprehension when he tried to sell his \'virtual experts\' idea three years ago to firms such as IBM”',
      '“looks of total incomprehension” = hoàn toàn không hiểu → TRUE'],
    38: ['Tác giả nói gì về sở hữu trí tuệ?', 'Đoạn C',
      '“trading in intangible assets such as intellectual property rose from $15 billion in 1990 to $100 billion in 1998”',
      'Giao dịch tăng từ 15 lên 100 tỷ đô → được định giá cao hơn trước. B, D sai: phần thưởng ngày càng về tay công ty nhỏ và cá nhân → C'],
    39: ['Peter Chernin là ví dụ về người đã nhận ra rằng…', 'Đoạn D',
      '“\'In the management of creativity, size is your enemy,\' argues Peter Chernin” … “He has thus tried to break down the studio into smaller units”',
      '“size is your enemy” = quy mô lớn cản trở sáng tạo → công ty lớn kém đổi mới hơn công ty nhỏ → A'],
    40: ['Kết luận, tác giả cho rằng…', 'Đoạn H',
      '“as he cheerfully adds, \'of course, they could have been right\'. Apparently, innovation – unlike diet, fitness and parenting – is one area where a computer cannot tell you what to do.”',
      'Không ai (kể cả máy tính) biết chắc ý tưởng nào sẽ thành công → đổi mới luôn có sự không chắc chắn → D'],
  },
};
