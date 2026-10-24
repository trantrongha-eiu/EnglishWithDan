// Vol 4 - reading/test 8/test 8.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. Text = PDF (typed, clean
// OCR). Typos fixed: "revies", "rly", "explore or inner psyche" → our, "it really exist", "changing al", "the boo is",
// "optical illusions that illustrated" → illustrate, "for use in lecturers" → lectures, "our unique place history" → place in
// history. The PDF numbers the multiple-choice questions 33, 34, 34, 35, 36 → 33–37 (the explain file numbers them that way).
// Key = explain key/test 8- up.pdf (scan). Fixed: Q37 Vol B → A (= izone.edu.vn / ece.edu.vn / ieltscity.vn; ieltsit.com copies B) — the explain file's own quote ("shows us where we are by giving
// us a snapshot of how we work") is option A; nothing says readers get lost in other textbooks.
const { ynng, mc, endings } = require('../../vr_build');
module.exports = {
  vol: 4, test: 8, part: 3, title: 'Mapping the Mind', text: 't8p3.txt', lettered: false,
  groups: [
    ynng(27, [
      'Our sense of what is real is independent of what we can see.',
      'The ego must exist because its reaction can be felt.',
      'The illustrations in Mapping the Mind are in vibrant colours.',
      'People prefer to learn facts that are presented visually.',
      'Mapping the Mind is primarily a decorative book.',
      'Mapping the Mind leaves the readers to interpret the facts it presents.',
    ]),
    mc(33, [
      ['According to the writer, Carter\'s background in journalism means that', [
        'she has easy access to relevant sources.', 'she cannot explain complex medical ideas.',
        'her writing style maintains the reader\'s interest.', 'her presentation of information is more suited to newspapers.']],
      ['When discussing how the brain works in controlling anger, Carter', [
        'gives guidance to parents of young children.', 'uses examples readers can relate to.',
        'admires the control shown by adults.', 'criticizes the behaviour of children.']],
      ['The writer feels that the way neuroscience is presented in Mapping the Mind', [
        'will not give readers any new information.', 'could make readers doubt scientific claims.',
        'will encourage more people to study neuroscience.', 'will appeal to readers with no knowledge of the topic.']],
      ['The writer especially likes the optical illusions in Mapping the Mind because they', [
        'help people relate to the topic.', 'are a long-standing scientific mystery.',
        'can teach us about the function of the eye.', 'have never appeared in books about the brain before.']],
      ['The writer says that Mapping the Mind operates as a \'kiosk map\' because', [
        'it reveals our current position in terms of our knowledge of the brain.', 'the reader can become lost in other textbooks about the brain.',
        'it describes specific areas of the brain such as the neo-cortex.', 'its illustrations are particularly clear and accurate.']],
    ]),
    endings(38, [
      'makes a background in science essential for comprehension.',
      'adds academic integrity to a popular approach.',
      'is not helpful for checking particular data about the brain.',
      'bores and confuses people.',
      'generates more interest in the field of study and promotes research.',
      'solves the difficulty of people\'s negative reactions to technical language.',
      'has no clear purpose.',
    ], [
      'A book that uses terms such as \'anterior cingulate cortex\'',
      'The use of three-dimensional illustrations in the book',
      'The inclusion of essays by research scientists in Mapping the Mind',
    ]),
  ],
  key: { 27: 'NO', 28: 'YES', 29: 'NOT GIVEN', 30: 'YES', 31: 'NO', 32: 'YES', 33: 'C', 34: 'B', 35: 'D', 36: 'A', 37: 'A',
    38: 'D', 39: 'F', 40: 'B' },
  expl: {
    27: ['Cảm nhận của ta về điều gì là thật không phụ thuộc vào những gì ta nhìn thấy.', 'Đoạn 1',
      '“We are visual creatures and we rely on sight to serve as a judge of what is real and what is not.”',
      'Ta dựa vào thị giác để phán xét thật/giả → phụ thuộc vào cái nhìn thấy → NO'],
    28: ['Cái tôi (ego) hẳn phải tồn tại vì phản ứng của nó có thể cảm nhận được.', 'Đoạn 1',
      '“I have no idea what my ego looks like. I must have one because it can be hurt or appeased by how others treat me.”',
      '“must have one because it can be hurt or appeased” = tồn tại vì cảm nhận được phản ứng của nó → YES'],
    29: ['Hình minh hoạ trong Mapping the Mind có màu sắc rực rỡ.', 'Đoạn 2–3',
      '“Mapping the Mind uses beautifully rendered three-dimensional computer images of the brain”',
      'Bài khen hình 3D đẹp nhưng không nói gì về màu sắc → NOT GIVEN'],
    30: ['Người ta thích học những dữ kiện được trình bày bằng hình ảnh.', 'Đoạn 2',
      '“The presentation style acknowledges our natural bias towards perceiving and learning information visually.”',
      '“natural bias towards … learning information visually” = thiên hướng thích học qua hình ảnh → YES'],
    31: ['Mapping the Mind chủ yếu là một cuốn sách trang trí.', 'Đoạn 3',
      '“walks a pleasing line between college textbook and coffee table art book, describing the subtle nuances of vision, language, thought, and feeling with science and art.”',
      'Sách cân bằng giữa giáo trình và sách nghệ thuật, kết hợp khoa học với nghệ thuật → không phải chủ yếu để trang trí → NO'],
    32: ['Mapping the Mind để người đọc tự diễn giải các dữ kiện.', 'Đoạn 4',
      '“Carter presents the science in an engaging yet factual manner, allowing people to draw their own conclusions”',
      '“allowing people to draw their own conclusions” = để người đọc tự rút ra kết luận → YES'],
    33: ['Theo tác giả, xuất thân nhà báo của Carter có nghĩa là…', 'Đoạn 4',
      '“Carter uses her background as a journalist to keep the reader engaged in the science.”',
      '“keep the reader engaged” = giữ được sự hứng thú của người đọc → C'],
    34: ['Khi bàn về cách não kiểm soát cơn giận, Carter…', 'Đoạn 4',
      '“Carter uses familiar situations, like suppressing anger when we feel we have been insulted, to illustrate the neuroscience involved.”',
      '“familiar situations” = ví dụ mà người đọc thấy gần gũi → B'],
    35: ['Tác giả cảm thấy cách trình bày khoa học thần kinh trong sách sẽ…', 'Đoạn 5',
      '“Mapping the Mind seems to aim itself at an audience that is often forgotten: the general reader who wants to know more about a specific area of scientific study.”',
      '“the general reader” = người không có kiến thức chuyên môn → D'],
    36: ['Tác giả đặc biệt thích các ảo ảnh thị giác trong sách vì chúng…', 'Đoạn 6',
      '“As a teacher, I am always searching for ways to make information relevant to the reader. Mapping the Mind does this by peppering appropriate chapters with optical illusions”',
      '“make information relevant to the reader” = giúp người đọc thấy chủ đề gần gũi → A'],
    37: ['Tác giả nói Mapping the Mind giống một “tấm bản đồ ở ki-ốt” vì…', 'Đoạn cuối',
      '“Mapping the Mind serves as a sort of kiosk map saying \'you are here\' with a big red dot. Mapping the Mind shows us where we are by giving us a snapshot of how we work.”',
      '“you are here” = cho thấy ta đang ở đâu trong hiểu biết về bộ não. (B: bài không nói người đọc bị lạc trong sách khác; key Vol ghi B — sai.) → A'],
    38: ['Một cuốn sách dùng thuật ngữ như “anterior cingulate cortex”…', 'Đoạn 2',
      '“Presenting the concept of a brain area devoted to maintaining attention by calling it the \'anterior cingulate cortex\' would probably put most readers to sleep while their brains struggled to use that area to focus on what the name meant.”',
      '“put most readers to sleep” + “struggled … what the name meant” = gây chán và khó hiểu → D'],
    39: ['Việc dùng hình minh hoạ ba chiều trong sách…', 'Đoạn 2',
      '“Showing the reader a three-dimensionally-oriented area that easily translates to a place we can point to on our skulls grounds the anatomical vocabulary in something we can all understand – our own heads.”',
      'Hình 3D gắn thuật ngữ giải phẫu khó với thứ ai cũng hiểu → giải quyết việc người đọc ngại thuật ngữ chuyên môn → F'],
    40: ['Việc đưa vào các bài viết của nhà nghiên cứu trong sách…', 'Đoạn 5',
      '“scientific credibility can be sacrificed in order to keep readers engaged. Carter circumvents this problem by including the participation of research scientists in the writing.”',
      'Bài của chuyên gia giữ được độ tin cậy khoa học cho một cuốn sách đại chúng → B'],
  },
};
