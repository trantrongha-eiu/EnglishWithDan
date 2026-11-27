// Cambridge IELTS 13 - Test 3 - Passage 2. Source: ieltsworldly.com (paragraph F garbled there — Patricia Kuhl's quote restored from
// babarenglish.com's citation of the book), checked against the book key. Summary typos "When they studies … the found" fixed.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam13', book: 13, test: 3, part: 2, title: 'How baby talk gives infant brains a boost', text: 't3p2.txt',
  groups: [
    matching(14, ['Mark VanDam', 'Nairán Ramirez-Esparza', 'Patricia Kuhl'], [
      'the importance of adults giving babies individual attention when talking to them',
      'the connection between what babies hear and their own efforts to create speech',
      'the advantage for the baby of having two parents each speaking in a different way',
      'the connection between the amount of baby talk babies hear and how much vocalising they do themselves',
    ], { reuse: true, title: 'List of Researchers', instruction: 'Look at the following ideas (Questions 14–17) and the list of researchers below. Match each idea with the correct researcher, A, B or C. Write the correct letter, A, B or C, in boxes 14–17 on your answer sheet. NB You may use any letter more than once.' }),
    notes(18, 23, [
      'Researchers at Washington State University used __Q18__, together with specialised computer programs, to analyse how parents interacted with their babies during a normal day. The study revealed that __Q19__ tended not to modify their ordinary speech patterns when interacting with their babies. According to an idea known as the __Q20__, they may use a more adult type of speech to prepare infants for the language they will hear outside the family home. According to the researchers, hearing baby talk from one parent and ‘normal’ language from the other expands the baby’s __Q21__ of types of speech which they can practise.',
      'Meanwhile, another study carried out by scientists from the University of Washington and the University of Connecticut recorded speech and sound using special __Q22__ that the babies were equipped with. When they studied the babies again at age two, they found that those who had heard a lot of baby talk in infancy had a much larger __Q23__ than those who had not.',
    ], { title: 'Research into how parents talk to babies', instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 18–23 on your answer sheet.' }),
    matching(24, ['A', 'B', 'C', 'D', 'E', 'F'], [
      'a reference to a change which occurs in babies’ brain activity before the end of their first year',
      'an example of what some parents do for their baby’s benefit before birth',
      'a mention of babies’ preference for the sounds that other babies make',
    ], { reuse: true, instruction: 'Reading Passage 2 has six paragraphs, A–F. Which paragraph contains the following information? Write the correct letter, A–F, in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'B', 15: 'C', 16: 'A', 17: 'B', 18: 'recording devices', 19: 'fathers/dads', 20: 'bridge hypothesis', 21: 'repertoire',
    22: 'vests/audio-recording vests', 23: 'vocabulary', 24: 'F', 25: 'A', 26: 'E' },
  expl: {
    14: ['Tầm quan trọng của việc người lớn dành sự chú ý riêng cho bé khi nói chuyện.', 'Đoạn D', '“We also found that it really matters whether you use baby talk in a one-on-one context,”',
      '“one-on-one” = individual attention; ý của Nairán Ramirez-Esparza → B'],
    15: ['Mối liên hệ giữa những gì bé nghe và nỗ lực tự tạo ra lời nói.', 'Đoạn F', '“it means the baby brain is engaged in trying to talk back right from the start”',
      'Patricia Kuhl: khi bé chỉ nghe, vùng não vận động đã hoạt động như cố “nói lại” → C'],
    16: ['Lợi ích khi bố và mẹ mỗi người nói một kiểu khác nhau.', 'Đoạn C', '“so the kid then has a wider repertoire of kinds of speech to practice,’ says VanDam.”',
      'Mẹ nói kiểu baby talk, bố nói kiểu khác → bé có nhiều kiểu lời nói để luyện (Mark VanDam) → A'],
    17: ['Mối liên hệ giữa lượng baby talk bé nghe và mức độ bé tự phát âm.', 'Đoạn D', '“The more parents use baby talk one-on-one, the more babies babble, and the more they babble, the more words they produce later in life.”',
      '“babble” = vocalising; cha mẹ càng nói kiểu baby talk bé càng bập bẹ nhiều (Ramirez-Esparza) → B'],
    18: ['Nhà nghiên cứu ĐH Washington State dùng ___ cùng phần mềm chuyên dụng.', 'Đoạn C', '“equipped parents with recording devices and speech-recognition software”',
      '“speech-recognition software” = specialised computer programs; cùng với thiết bị ghi âm → recording devices'],
    19: ['Nghiên cứu cho thấy ___ thường không đổi cách nói khi nói với con.', 'Đoạn C', '“Dads didn’t raise their pitch or fundamental frequency when they talked to kids.”', 'Các ông bố (dads) không đổi cao độ giọng → fathers'],
    20: ['Theo một ý tưởng tên là ___, họ dùng lời nói kiểu người lớn để chuẩn bị cho bé.', 'Đoạn C', '“Their role may be rooted in what is called the bridge hypothesis”', 'Giả thuyết “cây cầu” → bridge hypothesis'],
    21: ['…mở rộng ___ các kiểu lời nói mà bé có thể luyện.', 'Đoạn C', '“so the kid then has a wider repertoire of kinds of speech to practice”', '“wider repertoire” = expands the repertoire → repertoire'],
    22: ['Ghi âm bằng ___ đặc biệt gắn trên người bé.', 'Đoạn D', '“fitting 26 children with audio-recording vests that captured language and sound”', 'Áo gi-lê ghi âm mặc cho trẻ → vests'],
    23: ['Lúc 2 tuổi, bé nghe nhiều baby talk có ___ lớn hơn nhiều.', 'Đoạn D', '“they found that frequent baby talk had dramatically boosted vocabulary”', '“dramatically boosted” = much larger; vốn từ vựng → vocabulary'],
    24: ['Thay đổi trong hoạt động não của bé trước khi tròn 1 tuổi.', 'Đoạn F',
      '“while the seven-month-olds responded to all speech sounds regardless of language, the brains of the older infants worked harder at the motor activations of non-native sounds”',
      'Bé 7 tháng phản ứng với mọi âm, bé 11,5 tháng thì khác = thay đổi trước khi hết năm đầu → F'],
    25: ['Ví dụ việc cha mẹ làm vì lợi ích của bé trước khi sinh.', 'Đoạn A', '“prompting some hopeful parents to play classical music to their pregnant bellies.”', 'Cho thai nhi nghe nhạc cổ điển → A'],
    26: ['Nhắc tới việc bé thích âm thanh do em bé khác tạo ra.', 'Đoạn E', '“babies seem to like listening to each other rather than to adults”', 'Bé thích nghe tiếng em bé khác hơn người lớn → E'],
  },
};
