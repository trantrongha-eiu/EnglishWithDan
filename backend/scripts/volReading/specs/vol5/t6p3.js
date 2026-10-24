// Vol 5 - Reading/Test 6/Test 6- up.pdf - Reading Passage 3 (PDF p10–13). Not in the bank / mini-ielts; no online copy found.
// Text = PDF (typed scan). PDF pastes stray lines into two sentences: "fulfilled some domestic often keep offcuts from their
// purpose" → domestic purpose; "a wish for ideals and imaginations, although both something better" → a wish for something
// better (both fragments are copies of nearby lines). Typos fixed: "in a item when" → time, "identify the marker" → maker,
// "the 1930-1950" → the 1930s to 1950s, "I parallel" → In parallel, "nostalgiacan", "keep offcuts their dressmaking" → from
// their. Word bank: the 7th item is "G detailed" (printed on a broken line). Key = Test 6/explanation- 6.pdf. KEY FIX: Q31 Vol
// A → B — paragraph 4 ends "we seem to have agreed they cannot be art. Why not?": the writer questions the arts/crafts divide,
// she does not suggest needlework is not art. Rest correct.
const { mc, summary, ynng } = require('../../vr_build');
module.exports = {
  vol: 5, test: 6, part: 3, title: 'New Zealand home textile crafts of the 1930s to 1950s', text: 't6p3.txt',
  groups: [
    mc(27, [
      ['What does the writer say about domestic crafts in the first paragraph?', [
        'They can be sold for high prices today.', 'They were used to tell stories in the past.',
        'They are sources of information about society.', 'They have been well documented by historians.']],
      ['What is the writer\'s main point in the second paragraph?', [
        'Women sewed to make money.', 'Women used to have larger families.', 'Sewing was enjoyed as a social activity.',
        'Sewing could be a means of self-expression.']],
      ['According to the writer, domestic crafts are not frequently collected because', [
        'they are difficult to see.', 'they are easily damaged.', 'they provide little enjoyment.',
        'they have no practical use today.']],
      ['What point does the writer make about signatures on textiles?', [
        'Many women at that time could not sign their names.', 'The signatures have faded over time and cannot be seen.',
        'The style of stitching served as an alternative to a signature.', 'They were unnecessary since everyone would know the maker.']],
      ['What is the writer doing in the fourth paragraph?', [
        'suggesting that needlework is not a true art form', 'challenging the usual distinction between \'arts\' and crafts',
        'arguing that functional objects were seldom made in the home', 'criticising the attitude of women today towards domestic crafts']],
      ['Why does the writer compare textile collecting to archaeology?', [
        'They both require hard work.', 'They involve similar processes.', 'They can both be done on a low budget.',
        'They are both undervalued in society today.']],
    ]),
    summary(33, 36, 'Women\'s magazines in this period mainly influenced the domestic crafts because of their aspirational character as they focused on the __Q33__ element of society. At the same time, more __Q34__ assistance came in the form of printed patterns. The resulting aprons, and so on, can be contrasted with work that demonstrates the __Q35__ side of the maker. Of the two traditions, work that is less structured in nature is of greater interest to collectors. Most interestingly, the writer points out that many appreciate work that is __Q36__ and it is this characteristic that is believed to distinguish needlework from other arts.',
      ['skilful', 'creative', 'wealthy', 'practical', 'imperfect', 'industrious', 'detailed'],
      { title: 'Needlework in the first half of the twentieth century' }),
    ynng(37, [
      'Nostalgia can promote an unreliable image of the past.',
      'In the 1950s, women chose fabric according to its durability.',
      'Patchwork quilts are only of interest to the makers\' family.',
      'Needlework was a way for women to escape the reality of their lives.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 37–40 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
  ],
  key: { 27: 'C', 28: 'D', 29: 'B', 30: 'D', 31: 'B', 32: 'B', 33: 'wealthy', 34: 'practical', 35: 'creative', 36: 'imperfect',
    37: 'YES', 38: 'NOT GIVEN', 39: 'NO', 40: 'YES' },
  expl: {
    27: ['Tác giả nói gì về đồ thủ công gia đình ở đoạn 1?', 'Đoạn 1',
      '“But needlework should be preserved, for it helps to convey a sense of people\'s identity and past beliefs in these remote islands in the Pacific Ocean.”',
      'Đồ may vá giúp hiểu bản sắc, niềm tin của người xưa = nguồn thông tin về xã hội → C'],
    28: ['Ý chính của đoạn 2 là gì?', 'Đoạn 2',
      '“for others it was an opportunity to explore their identities, beliefs and dreams with the only means readily at hand – a needle, some thread, and a piece of fabric.”',
      'May vá là cách thể hiện bản sắc, ước mơ = phương tiện tự thể hiện → D'],
    29: ['Đồ thủ công gia đình ít được sưu tầm vì', 'Đoạn 3',
      '“Textiles are frustrating to collect. They are fragile; they stain; they develop rust marks; they fray and rot.”',
      '“fragile … fray and rot” = dễ hư hỏng → B'],
    30: ['Tác giả nói gì về chữ ký trên đồ dệt?', 'Đoạn 3',
      '“They were not expecting it to be seen outside their homes, where the creator\'s identity was never in doubt.”',
      'Trong nhà ai cũng biết người làm → không cần ký tên → D'],
    31: ['Tác giả đang làm gì ở đoạn 4?', 'Đoạn 4',
      '“If things are made to be useful, especially only within the home and by ordinary housewives, we seem to have agreed they cannot be art. Why not?”',
      '“Why not?” — tác giả chất vấn quan niệm coi thủ công thấp hơn nghệ thuật. (Key Vol ghi A — ngược với ý tác giả.) → B'],
    32: ['Vì sao tác giả so sánh sưu tầm đồ dệt với khảo cổ?', 'Đoạn 5',
      '“Likewise, digging for the past is what textile collectors do in junk shops, and the objects they find are a way of understanding the past through physical evidence.”',
      'Cả hai đều “đào bới” quá khứ, hiểu quá khứ qua hiện vật = quy trình giống nhau → B'],
    33: ['Tạp chí phụ nữ tập trung vào tầng lớp ______ của xã hội.', 'Đoạn 6',
      '“The primary purpose of these publications was to allow women to glimpse how more prosperous people lived”',
      '“more prosperous people” = tầng lớp giàu có → wealthy'],
    34: ['Đồng thời, sự hỗ trợ ______ hơn đến từ các mẫu cắt in sẵn.', 'Đoạn 6',
      '“women were provided with much more down-to-earth and useful means of improving their homes in the form of printed patterns”',
      '“down-to-earth and useful” = practical → practical'],
    35: ['Đối lập với tác phẩm thể hiện mặt ______ của người làm.', 'Đoạn 6',
      '“the more individual work that women dreamed up themselves and whose form and execution were reflections of their own ideals and imagination.”',
      '“dreamed up themselves … imagination” = mặt sáng tạo → creative'],
    36: ['Nhiều người trân trọng tác phẩm ______, và chính đặc điểm này phân biệt may vá với các nghệ thuật khác.', 'Đoạn 6',
      '“When it comes to needlework, flaws can be enjoyable, even failure may bring pleasure, and in this respect needlework can be contrasted with other art forms, where successful completion is paramount.”',
      '“flaws can be enjoyable” = imperfect → imperfect'],
    37: ['Hoài niệm có thể tạo ra hình ảnh không đáng tin về quá khứ.', 'Đoạn 7',
      '“But nostalgia should not always be trusted as it can be a sanitised form of history that blots out harsh reality.”',
      '“should not always be trusted … sanitised form of history” = unreliable image → YES'],
    38: ['Thập niên 1950, phụ nữ chọn vải theo độ bền.', 'Đoạn 7',
      '“The texture of certain abstract patterned fabrics from the 1950s has the power to transport us all back to the dress and fabric shops of that time where women agonised over which choices to make”',
      'Phụ nữ đắn đo khi chọn vải, nhưng bài không nói họ chọn theo tiêu chí độ bền → NOT GIVEN'],
    39: ['Chăn chắp vá chỉ được gia đình người làm quan tâm.', 'Đoạn 7',
      '“Old patchwork quilts in particular are evocative, because they represent an unknown family\'s compressed history” … “as a means of recording their family\'s story for others to appreciate.”',
      'Chăn gợi cảm xúc cả với người ngoài (“unknown family”, “for others to appreciate”) → NO'],
    40: ['May vá là cách để phụ nữ thoát khỏi thực tại cuộc sống.', 'Đoạn 8',
      '“we should also remember how hard women\'s lives were” … “Such fabrics, then, should be seen as a wish for something better, a way of daydreaming about a life that would turn out well in the end.”',
      '“a way of daydreaming” giữa cuộc sống vất vả = thoát khỏi thực tại → YES'],
  },
};
