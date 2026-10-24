// Vol 5 - Reading/Test 7/Test 7- up.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. The PDF prints NO TITLE
// (the key file: "No title — Charles Darwin") → titled "Managing the Human Animal" after Nicholson's book in the passage (does
// not give away Q31). Text = PDF (typed scan). PDF loses words in paragraph 5: "Older and wiser executives points out that they
// still tend to cling to the idea of a magic formula" → ADDED "are more open to it, but Nicholson" (as the summary for Q37–38
// says: "some executives are more open to what evolutionary psychology says. However, these executives still believe …").
// Q33 is cut off in the PDF ("… through the generations has prepared.") → completed "has prepared our brains well for
// post-industrial life" (the Vol key NO fits: "there have not been enough generations for a brain that is well adapted to our
// post-industrial life to evolve"). Typos fixed: "these ideas have given the title" → have been given, "Stonc Age", "make sense
// other", "business word", Q27 "Charkes Darwin". Key = Test 7/Explanation- 7.pdf, checked against the passage: all correct.
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 5, test: 7, part: 3, title: 'Managing the Human Animal', text: 't7p3.txt',
  groups: [
    mc(27, [
      ['The writer\'s purpose in the first paragraph is to', [
        'oppose the views of Charles Darwin.', 'compare experts\' opinions of Darwin\'s theory.',
        'explain the theory of evolutionary psychology.', 'name experts in the field of evolutionary psychology.']],
      ['In the third paragraph, which view about evolutionary psychology matches Nicholson\'s opinion?', [
        'Our characters determine our career choices.', 'We begin life without any preconceived notions.',
        'Our interests and skills depend on our environment.', 'We inherit ideas and characteristics from our ancestors.']],
      ['The writer discusses the key element of emotion in order to', [
        'criticise primitive survival strategies.', 'explain attitudes and actions at work.',
        'demonstrate the slowness of evolution.', 'suggest companies today are poorly structured.']],
      ['Which of the following does Nicholson predict will happen in the business world?', [
        'Companies will remain in city centres.', 'Promotion will no longer motivate people.',
        'Employees will be less independent than now.', 'Social interaction will remain important to workers.']],
      ['Which of the following is the most suitable title for Reading Passage 3?', [
        'How successful companies manage change', 'Understanding the origins of workplace behaviour',
        'Darwin\'s theories rejected by modern management', 'Why post-industrial organisations need to evolve more quickly']],
    ]),
    ynng(32, [
      'Nicholson makes a persuasive argument in his book.',
      'Tooby and Cosmides believe natural selection through the generations has prepared our brains well for post-industrial life.',
      'Our reliance on technology causes emotional problems in the workplace.',
      'People today are more trusting than they used to be.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 32–35 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
    summary(36, 40, 'Nicholson believes that if we know why people act the way they do, we can change __Q36__ so employees will work more efficiently. Nicholson\'s ideas are unwelcome to __Q37__ but some executives are more open to what evolutionary psychology says. However, these executives still believe that there is a __Q38__ that will make employees act according to the company\'s practices. According to Nicholson, these senior executives are engaging in __Q39__ and we should not try to change __Q40__ but instead we should change our business structures.',
      ['business leaders', 'MBA graduates', 'promotion structures', 'reward strategy', 'magic formula', 'strategic planning',
        'back-to-front thinking', 'business environments', 'human nature'], { title: 'Nicholson\'s advice to the corporate world' }),
  ],
  key: { 27: 'C', 28: 'D', 29: 'B', 30: 'D', 31: 'B', 32: 'YES', 33: 'NO', 34: 'NOT GIVEN', 35: 'NO',
    36: 'business environments', 37: 'MBA graduates', 38: 'magic formula', 39: 'back-to-front thinking', 40: 'human nature' },
  expl: {
    27: ['Mục đích của tác giả ở đoạn 1 là', 'Đoạn 1',
      '“Evolutionary psychology revolves around the notion that our brains, like our bodies, have an inherited evolutionary design that has scarcely changed for 10,000 years.”',
      'Đoạn 1 giới thiệu và giải thích tâm lý học tiến hoá (các chuyên gia chỉ được dẫn để minh hoạ) → C'],
    28: ['Ở đoạn 3, quan điểm nào khớp với ý kiến của Nicholson?', 'Đoạn 3',
      '“sophisticated research shows the brain actually houses a store of knowledge when we are born, and now genetic research is establishing there are certain genes that account for abilities, tastes and tendencies.”',
      'Bộ não có sẵn tri thức từ khi sinh ra, gen quy định năng lực, sở thích = thừa hưởng từ tổ tiên (B sai: ông bác bỏ ý “blank pages”) → D'],
    29: ['Tác giả bàn về yếu tố cảm xúc nhằm', 'Đoạn 4',
      '“We still use the emotional part of our minds to make sense of other people\'s behaviour and to create an impression” … “not in much larger environments filled with people we barely know (the modern workplace).”',
      'Cảm xúc giải thích cách con người cư xử, đánh giá nhau ở nơi làm việc → B'],
    30: ['Nicholson dự đoán điều gì sẽ xảy ra trong giới kinh doanh?', 'Đoạn 6',
      '“He doubts that the high-tech ideas of virtual companies will ever be very successful because people will still want to meet each other face-to-face.”',
      'Người ta vẫn muốn gặp mặt trực tiếp = giao tiếp xã hội vẫn quan trọng (B sai: vẫn nhắm “lifelong status advancement”; C sai: “high degree of self-determination”) → D'],
    31: ['Tiêu đề phù hợp nhất cho bài đọc là', 'Toàn bài',
      '“It is an effective approach explaining why people behave as they do, particularly at work.”',
      'Cả bài giải thích hành vi nơi công sở bắt nguồn từ bộ não thời đồ đá → B'],
    32: ['Nicholson đưa ra lập luận thuyết phục trong cuốn sách.', 'Đoạn 2',
      '“It is an effective approach explaining why people behave as they do, particularly at work.”',
      'Tác giả đánh giá cách tiếp cận của sách là “effective” → YES'],
    33: ['Tooby và Cosmides tin rằng chọn lọc tự nhiên qua các thế hệ đã chuẩn bị tốt bộ não cho cuộc sống hậu công nghiệp.', 'Đoạn 3',
      '“As Tooby and Cosmides stress, there have not been enough generations for a brain that is well adapted to our post-industrial life to evolve through natural selection.”',
      'Chưa đủ thế hệ để tiến hoá ra bộ não thích nghi với đời sống hậu công nghiệp → NO'],
    34: ['Việc phụ thuộc vào công nghệ gây ra vấn đề cảm xúc nơi làm việc.', 'Đoạn 4',
      '“Emotion was, and continues to be our radar, guiding us throughout today\'s techno-defined business world.”',
      'Bài chỉ nói cảm xúc vẫn dẫn dắt ta trong thế giới công nghệ; không nói công nghệ gây vấn đề cảm xúc → NOT GIVEN'],
    35: ['Con người ngày nay dễ tin người hơn trước.', 'Đoạn 4',
      '“As a consequence, it takes very little to trigger people\'s innate distrust of others because our safety in antiquity depended on supporting our near family and friends”',
      'Sự nghi ngờ người khác là bẩm sinh, vẫn dễ bị kích hoạt; bộ não không đổi từ thời đồ đá → không tin người hơn → NO'],
    36: ['Biết vì sao con người hành xử như vậy, ta có thể thay đổi ______ để nhân viên làm việc hiệu quả hơn.', 'Đoạn 5',
      '“by knowing the reasons for people\'s behaviour it is possible to mould corporate environments into places that have more chance of working efficiently”',
      '“mould corporate environments” = change business environments → business environments'],
    37: ['Ý tưởng của Nicholson không được ______ đón nhận.', 'Đoạn 5',
      '“One group that resists the theory of evolutionary psychology is young MBA graduates”',
      '“resists” = unwelcome to → MBA graduates'],
    38: ['Những giám đốc này vẫn tin có một ______ khiến nhân viên làm theo chiến lược công ty.', 'Đoạn 5',
      '“they still tend to cling to the idea of a magic formula to bring people into line with corporate strategy.”',
      '“bring people into line with corporate strategy” = make employees act according to the company\'s practices → magic formula'],
    39: ['Theo Nicholson, các giám đốc này đang ______.', 'Đoạn 5',
      '“But that is back-to-front thinking according to Nicholson”',
      '→ back-to-front thinking'],
    40: ['Ta không nên cố thay đổi ______ mà nên thay đổi cấu trúc doanh nghiệp.', 'Đoạn 5',
      '“we should be reinventing our business structures, not our fundamental human nature.”',
      '“not our fundamental human nature” → human nature'],
  },
};
