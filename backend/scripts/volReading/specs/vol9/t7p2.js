// Vol 9 - READING/TEST 7-R.docx - Passage 2 (typed docx). Not in the bank / mini-ielts. Key = KEY TEST 7-R.docx.
// Text fixes: "Gaulish the mainland European version of the language separated" → commas; missing full stop end of C;
// "This writing would fit" → timing; "their method … was similar to historical linguists, many of whom restrict their research…"
// (no sense, and Q19 rests on the contrast) → "was superior to that of historical linguists" (own correction, no online copy).
// Title in capitals → title case. Instruction "boxes 14-19" → 14–18.
// Q25 "___ is known to have occurred among the various versions of the Gaelic language around 3200 BC": key "British" cannot
// fill this gap (it belongs to a differently worded sentence); the passage word is "divergence" → key divergence.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 9, test: 7, part: 2, title: 'The History of Celtic Language', text: 't7p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
      'a difference of opinion about where a group of languages originated',
      'a reference to a mythological figure',
      'an expression of one person\'s doubt about a particular method of analysing scientific data',
      'an explanation of how one particular Celtic language spread due to the movement of people',
      'the reason why some language experts distrust language trees',
    ], { instruction: 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G, in boxes 14–18 on your answer sheet.' }),
    matching(19, ['Dr Peter Forster & Dr Alfred Toth', 'Dr Merritt Ruhlen', 'Dr Colin Renfrew', 'Dr April McMahon'], [
      'An approach commonly used in language research has too narrow a focus.',
      'The number of people who use a language has an effect on the modifications the language undergoes.',
      'The Celtic language has been a distinct language for longer than experts previously thought.',
      'The use of one family of languages may have become more extensive due to farming practices.',
    ], { title: 'List of Researchers', reuse: true,
      instruction: 'Look at the following statements (Questions 19–22) and the list of researchers below. Match each statement with the correct researcher or researchers, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 19–22 on your answer sheet. NB You may use any letter more than once.' }),
    notes(23, 26, [
      'The script on the bronze tablet discovered in Coligny in France was written in a form of Celtic called __Q23__.',
      'After the success of the Roman Empire in conquering many parts of Europe, __Q24__ and its related languages became the predominant languages.',
      '__Q25__ is known to have occurred among the various versions of the Gaelic language around 3200 BC.',
      'For social reasons, developments in languages are __Q26__.',
    ], { instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'E', 15: 'A', 16: 'G', 17: 'B', 18: 'C', 19: 'A', 20: 'D', 21: 'A', 22: 'C', 23: 'Gaulish', 24: 'Latin',
    25: 'divergence', 26: 'irregular' },
  expl: {
    14: ['một sự bất đồng ý kiến về nơi một nhóm ngôn ngữ bắt nguồn', 'Đoạn E',
      '“Specialists have long debated which country was the homeland of the Indo-Europeans”',
      'Các chuyên gia tranh luận về quê hương của người Ấn-Âu → E'],
    15: ['nhắc đến một nhân vật thần thoại', 'Đoạn A',
      '“One was an imposing statue of Mars, the Roman god of war.”',
      'Mars – thần chiến tranh La Mã → A'],
    16: ['ý kiến nghi ngờ của một người về một phương pháp phân tích dữ liệu khoa học', 'Đoạn G',
      '“She had less confidence in the dating method, she said, because language changes in an irregular way”',
      'McMahon kém tin tưởng vào phương pháp xác định niên đại → G'],
    17: ['giải thích một ngôn ngữ Celt lan rộng nhờ sự di chuyển của con người', 'Đoạn B',
      '“Breton, a Celtic tongue carried to Brittany in France by emigrants from Cornwall.”',
      'Tiếng Breton được người di cư từ Cornwall mang sang Brittany → B'],
    18: ['lý do một số chuyên gia ngôn ngữ không tin vào cây ngôn ngữ', 'Đoạn C',
      '“Because languages change so fast, historical linguists have little faith in language trees that go back more than a few thousand years.”',
      'Ngôn ngữ thay đổi quá nhanh nên các nhà ngôn ngữ học lịch sử ít tin cây ngôn ngữ quá vài nghìn năm → C'],
    19: ['Một cách tiếp cận phổ biến trong nghiên cứu ngôn ngữ có phạm vi quá hẹp.', 'Đoạn F',
      '“Dr Forster and Dr Toth said their method of evaluating groups of languages against each other was superior to that of historical linguists, many of whom restrict their research to how words in only one single language have changed over time.”',
      'Forster và Toth cho rằng nhiều nhà ngôn ngữ học chỉ giới hạn nghiên cứu trong một ngôn ngữ duy nhất = phạm vi quá hẹp → A'],
    20: ['Số người dùng một ngôn ngữ ảnh hưởng đến những thay đổi mà ngôn ngữ đó trải qua.', 'Đoạn G',
      '“because language changes in an irregular way based on social factors like the size of the speaker\'s group and its degree of contact with others.”',
      'McMahon: ngôn ngữ thay đổi tùy quy mô nhóm người nói → D'],
    21: ['Tiếng Celt là một ngôn ngữ riêng biệt từ lâu hơn các chuyên gia từng nghĩ.', 'Đoạn B',
      '“They say that Celtic became a language in its own right and entered the British Isles much earlier than supposed.”',
      'Forster và Toth: tiếng Celt trở thành ngôn ngữ độc lập sớm hơn nhiều so với giả định → A'],
    22: ['Việc sử dụng một ngữ hệ có thể đã lan rộng hơn nhờ hoạt động nông nghiệp.', 'Đoạn E',
      '“The second theory, that it was spread by agriculture, has been advocated by archaeologist Dr Colin Renfrew.”',
      'Renfrew ủng hộ thuyết ngôn ngữ Ấn-Âu lan rộng nhờ nông nghiệp → C'],
    23: ['Chữ trên tấm đồng tìm thấy ở Coligny được viết bằng một dạng tiếng Celt gọi là ______.', 'Đoạn A',
      '“It bore numerals in Roman but the words were in Gaulish, a version of the Celtic language”',
      '“Gaulish, a version of the Celtic language” → Gaulish'],
    24: ['Sau khi La Mã chinh phục nhiều vùng châu Âu, ______ và các ngôn ngữ liên quan trở thành ngôn ngữ chủ đạo.', 'Đoạn B',
      '“their language, Latin, and its successor languages displaced Celtic over much of its former territory.”',
      'Tiếng Latin và các ngôn ngữ kế thừa thay thế tiếng Celt → Latin'],
    25: ['______ được biết là đã xảy ra giữa các phiên bản khác nhau của tiếng Gaelic vào khoảng năm 3200 TCN.', 'Đoạn D',
      '“the divergence between the mainland European and British versions of Gaelic took place in 3200 BC, plus or minus 1,500 years.”',
      '“took place” = occurred; điều xảy ra là sự phân tách (divergence) giữa bản lục địa và bản Anh (key đề in “British” – không điền được vào câu này) → divergence'],
    26: ['Vì lý do xã hội, sự phát triển của ngôn ngữ ______.', 'Đoạn G',
      '“because language changes in an irregular way based on social factors”',
      '“changes in an irregular way based on social factors” = developments are irregular → irregular'],
  },
};
