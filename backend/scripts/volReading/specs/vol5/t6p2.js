// Vol 5 - Reading/Test 6/Test 6- up.pdf - Reading Passage 2 (PDF p5–9). Not in the bank / mini-ielts. Text = PDF (typed scan;
// Kate Douglas, New Scientist). Typos fixed: subtitle "trappings of citation, they had a taste or material" → civilisation …
// taste for, "running tally their" → of their, "food and flavors" → favours, "Modern consumerism sway beyond" → goes way
// beyond, "paintings dearly" → paintings. Clearly, "preserver cure'-" → preserve – 'cure' –, "280, OOO", "E670,000" → £,
// heading vii "hanges" → Changes. The summary's word bank is printed with letters A, F, H, I, J (a cut-down list) → shown as
// A–E (key = the word). Key = Test 6/explanation- 6.pdf, checked against the passage: all correct.
const { headings, mc, summary } = require('../../vr_build');
module.exports = {
  vol: 5, test: 6, part: 2, title: 'Born to trade', text: 't6p2.txt',
  groups: [
    headings(14, [
      'The desire to make expensive jewellery',
      'The clues that indicate ancient items were decorative',
      'Querying the changes in the value of traded items',
      'A natural human talent',
      'How status can be gained from ownership of goods',
      'Recent finds alter theories about when consumerism started',
      'Changes in research methods',
    ], ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'],
    { instruction: 'Reading Passage 2 has five sections, A–E. Choose the correct heading for each section from the list of headings below. Write the correct number, i–vii, in boxes 14–18 on your answer sheet.' }),
    mc(19, [
      ['In section A, \'reciprocity\' refers to our ancestors\' ability to', [
        'keep written records of different goods traded.', 'monitor the balance between goods given and received.',
        'produce more materials for trading purposes.', 'make money from trading goods and services.']],
      ['What is said about the ochre found around Blombos?', [
        'It is of a type only found in this particular area.', 'It has all been dyed to give the same shade of red.',
        'It has been perfectly preserved despite its age.', 'It appears it was selected for its colour.']],
      ['What made the researchers realise the purpose of the beads found at the Blombos caves?', [
        'They are a great variety of shapes and sizes.', 'They were found in large numbers all grouped around each other.',
        'They have patterns in many different colours.', 'They have holes and markings suggesting they were joined together.']],
    ]),
    summary(22, 26, 'Some researchers argue that we may use ownership of desirable goods to demonstrate our strength and fitness as other __Q22__ use their attractive physical features. Showing off one\'s superiority is not a new phenomenon and even in ancient times successful people would have gained __Q23__ from this. A desire for status could have led to an increase in the worth of prestige goods and to __Q24__ among people wishing to achieve this status.<br><br>It is thought that our natural desire to trade provided a basis for organised farming and __Q25__ development and finally resulted in the complex societies which can be seen today. Whilst we do not value things such as beads nowadays, other items hold the same appeal for us and bring the same status as owning beads did for our __Q26__.',
      ['competitiveness', 'respect', 'ancestors', 'species', 'city'], { title: 'Why certain objects are valued' }),
  ],
  key: { 14: 'iv', 15: 'iii', 16: 'vi', 17: 'ii', 18: 'v', 19: 'B', 20: 'D', 21: 'D', 22: 'species', 23: 'respect',
    24: 'competitiveness', 25: 'city', 26: 'ancestors' },
  expl: {
    14: ['Chọn tiêu đề cho đoạn A.', 'Đoạn A',
      '“Humans are born to trade … the heart of commerce is an instinctive ability for what anthropologists call reciprocity.”',
      '“born to trade”, “instinctive ability” = tài năng bẩm sinh của con người → iv A natural human talent'],
    15: ['Chọn tiêu đề cho đoạn B.', 'Đoạn B',
      '“Clearly, the worth of such goods is not inherent but resides in certain intangible qualities that we invest in them. When did humans start holding these goods in such high esteem?”',
      'Đặt câu hỏi: giá trị hàng hoá chuyển từ thiết yếu sang xa xỉ từ khi nào → iii Querying the changes in the value of traded items'],
    16: ['Chọn tiêu đề cho đoạn C.', 'Đoạn C',
      '“All the archaeological evidence for the flowering of consumer culture has up to now pointed to a date of around 40,000 years ago.” … “However, discoveries in Africa are pushing the origins of consumerism much further back into human prehistory.”',
      'Phát hiện mới ở châu Phi đẩy lùi mốc khởi đầu của tiêu dùng → vi Recent finds alter theories about when consumerism started'],
    17: ['Chọn tiêu đề cho đoạn D.', 'Đoạn D',
      '“each cluster contains shells of a similar size and colour with consistently placed holes. What\'s more, all the beads display a pattern of wear suggesting friction from rubbing against thread”',
      'Kích cỡ, màu đồng đều, lỗ xỏ, vết mòn do dây = dấu hiệu cho thấy hạt dùng để trang trí → ii The clues that indicate ancient items were decorative'],
    18: ['Chọn tiêu đề cho đoạn E.', 'Đoạn E',
      '“superior skills … would have brought respect – in other words, prestige.” … “he\'s buying an exclusive status symbol.”',
      'Sở hữu đồ khó làm giả để khoe tài, có uy tín, địa vị → v How status can be gained from ownership of goods'],
    19: ['Ở đoạn A, “reciprocity” chỉ khả năng của tổ tiên chúng ta trong việc', 'Đoạn A',
      '“This is an ability to exchange goods of equal worth … allowing individuals to keep a running tally of their interactions with others.” … “the ability to keep track of the credits and debits that accrue as a result.”',
      'Ghi nhớ “credits and debits” = theo dõi cân bằng giữa cho và nhận (không phải ghi chép bằng văn bản) → B'],
    20: ['Điều gì được nói về đất son (ochre) tìm thấy ở Blombos?', 'Đoạn C',
      '“For a start, it is predominantly red – any of the other colours available would have done for curing”',
      'Màu nào cũng thuộc da được, nhưng phần lớn lại là màu đỏ → được chọn vì màu sắc (A sai: phải mang từ nơi khác đến) → D'],
    21: ['Điều gì khiến nhà nghiên cứu nhận ra công dụng của các hạt ở Blombos?', 'Đoạn D',
      '“each cluster contains shells of a similar size and colour with consistently placed holes. What\'s more, all the beads display a pattern of wear suggesting friction from rubbing against thread, clothes or other beads.”',
      'Có lỗ xỏ và vết mòn do cọ vào dây = được xâu lại với nhau → D'],
    22: ['Ta có thể dùng việc sở hữu đồ quý để thể hiện sức khoẻ, như các ______ khác dùng đặc điểm hình thể hấp dẫn.', 'Đoạn E',
      '“In many animal species, individuals signal their genetic fitness by showing off with attention-grabbing adornment.”',
      '“animal species” → species'],
    23: ['Ngay từ thời cổ, người thành đạt đã nhận được ______ từ điều này.', 'Đoạn E',
      '“superior skills in areas such as hunting, crafts … would have brought respect – in other words, prestige.”',
      '“would have brought respect” = would have gained respect → respect'],
    24: ['Mong muốn địa vị làm tăng giá trị đồ uy tín và dẫn đến ______ giữa những người muốn đạt địa vị đó.', 'Đoạn E',
      '“The benefits of prestige would also lead to competition to acquire it.”',
      '“competition to acquire it” → competitiveness'],
    25: ['Nhu cầu trao đổi tự nhiên là nền tảng cho nông nghiệp có tổ chức và sự phát triển ______.', 'Đoạn E',
      '“They are arguably the first step on the road to modern civilisation, paving the way for agriculture and urbanisation.”',
      '“urbanisation” = city development → city'],
    26: ['Các món đồ khác mang lại địa vị như việc sở hữu hạt cườm từng mang lại cho ______ của chúng ta.', 'Đoạn E',
      '“Among our ancestors, superior skills … would have brought respect” … “We may not be impressed by beads any more, but their modern equivalents have the same fascination.”',
      'Hạt cườm từng là biểu tượng địa vị của tổ tiên → ancestors'],
  },
};
