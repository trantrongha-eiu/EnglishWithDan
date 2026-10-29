// Vol 9 - READING/TEST 4-R.docx - Passage 3 (typed docx). Not in the bank ("Looking at daily life in ancient Rome" is a different
// text) / mini-ielts. Key = KEY TEST 4-R.docx.
// Text fixes: missing opening quote before "How and why…"; spaced hyphens → dashes; "and reinterpretation is" → "reinterpretation, is".
// Key fixes (sentence endings): printed 37–40 "B C F D" — B (popular legends) is never said of the Latin language and F fits it
// ("seeking out clues in the Latin language … that might point back to features of earliest Rome"); the Fidenae building is
// "made of wood and rammed earth – a construction method still utilised up to the present day" = A → 37 F, 38 C, 39 A, 40 D.
// No online key found. Instruction typo "corect" → correct.
const { ynng, mc, endings } = require('../../vr_build');
module.exports = {
  vol: 9, test: 4, part: 3, title: 'Ancient Rome', text: 't4p3.txt', lettered: false,
  groups: [
    ynng(27, [
      'Historians have expressed little curiosity about the rise of the Roman Empire.',
      'Accounts from the first century BCE of Rome\'s origins may be less reliable than 21st-century accounts.',
      'Most Roman historians viewed their ancient capital in an unrealistically positive light.',
      'The accounts by early Roman historians about the founding of Rome provide a full description of life at that time.',
      'It is certain that the city of Rome was in existence long before 63 BCE.',
      'Some people oppose archaeological excavations in Rome because they can damage the ancient monuments.',
    ]),
    mc(33, [
      ['According to the writer, why were the archaeological remains found at Fidenae important?', [
        'They shed some light on the way of life of ancient Romans.',
        'They were the first evidence of an ancient Roman settlement in the area.',
        'They overturned common assumptions about the diet of ancient Romans.',
        'They showed how sophisticated domestic Roman architecture could be.']],
      ['What did Rome\'s marble temples and Renaissance houses have in common?', [
        'They were the most enduring buildings of their respective eras.',
        'They were evidence of Rome\'s enormous wealth.',
        'They were built on previously unoccupied sites.',
        'Their construction destroyed evidence of earlier buildings.']],
      ['What does the writer say in the fifth paragraph about the dating of excavated remains?', [
        'Only the age of a proportion of remains can be agreed upon.',
        'Only an approximate sequence of eras can be established.',
        'Serious attempts at dating began only a few decades ago.',
        'More thorough investigations will result in reliable dates.']],
      ['In the final paragraph, the writer makes the point that', [
        'traditional archaeological methods of dating have been discredited.',
        'many archaeologists are reluctant to abandon traditional methods of dating.',
        'radiocarbon dating is more accurate than archaeological methods.',
        'the findings of traditional archaeology and radiocarbon dating differ.']],
    ]),
    endings(37, [
      'composed of organic materials which are in use in the 21st century.',
      'referred to in popular legends about the origins of Rome.',
      'constructed on the site of an earlier burial ground.',
      'used to determine the relative dates of various Roman artefacts.',
      'chosen as the area for the greatest number of archaeological excavations.',
      'expected to shed some light on what Rome was originally like.',
    ], ['The Latin language can be', 'The Roman Forum was', 'The recently discovered building at Fidenae was',
      'Ancient Greek pottery is sometimes']),
  ],
  key: { 27: 'NO', 28: 'NOT GIVEN', 29: 'NOT GIVEN', 30: 'NO', 31: 'YES', 32: 'NOT GIVEN', 33: 'A', 34: 'D', 35: 'B', 36: 'D',
    37: 'F', 38: 'C', 39: 'A', 40: 'D' },
  expl: {
    27: ['Các sử gia ít tò mò về sự trỗi dậy của Đế chế La Mã.', 'Đoạn 1',
      '“From ancient times to the present, historians have asked the question”',
      'Từ xưa đến nay các sử gia luôn đặt câu hỏi vì sao Rome lớn mạnh như vậy → trái với “little curiosity” → NO'],
    28: ['Các ghi chép từ thế kỷ 1 TCN về nguồn gốc Rome có thể kém tin cậy hơn các ghi chép ở thế kỷ 21.', 'Đoạn 1',
      '“Yet these historians had little more direct evidence of the earliest phases of Rome\'s history than modern writers have, and in some ways perhaps not as much”',
      'Bài chỉ so sánh lượng bằng chứng trực tiếp mà hai nhóm có, không đánh giá ghi chép thời nào đáng tin hơn → NOT GIVEN'],
    29: ['Phần lớn sử gia La Mã nhìn kinh đô cổ của họ một cách tích cực thiếu thực tế.', 'Đoạn 1',
      '“Their \'histories\' about the foundation of ancient Rome tell us a good deal about how the Romans saw their city, their values, and their failings.”',
      'Bài nói các ghi chép cho thấy người La Mã nhìn thành phố, giá trị và cả khuyết điểm của mình ra sao; không nói họ tô hồng → NOT GIVEN'],
    30: ['Các ghi chép của sử gia La Mã đầu tiên về việc lập thành Rome mô tả đầy đủ cuộc sống thời đó.', 'Đoạn 1',
      '“However, they tell us very little indeed about what they claim to inform us about: that is, what earliest Rome was actually like.”',
      '“tell us very little” về Rome thuở đầu thực sự ra sao → trái với “full description” → NO'],
    31: ['Chắc chắn thành Rome đã tồn tại từ rất lâu trước năm 63 TCN.', 'Đoạn 1',
      '“One fact is obvious. Rome was already a very old city by 63 BCE”',
      '“obvious” = chắc chắn; “already a very old city by 63 BCE” = đã tồn tại từ lâu trước đó → YES'],
    32: ['Một số người phản đối khai quật khảo cổ ở Rome vì có thể làm hỏng di tích cổ.', 'Đoạn 4',
      '“The site of Rome has been so intensively built on for centuries that we find these traces of early occupation only in spots that happen not to have been disturbed.”',
      'Bài nói về khó khăn khi khai quật do thành phố bị xây chồng lên nhiều lớp, không nhắc ai phản đối khai quật → NOT GIVEN'],
    33: ['Theo tác giả, vì sao di tích tìm thấy ở Fidenae quan trọng?', 'Đoạn 2–3',
      '“But we can fill in some of the gaps if we look just outside Rome.” … “Inside was a central hearth, some large pottery storage jars, and traces of predictable foodstuffs and domestic animals.” … “There are vivid glimpses of human and other life here”',
      'Ngôi nhà ở Fidenae giúp lấp khoảng trống hiểu biết về lối sống (bếp, chum, thức ăn, vật nuôi). C sai: thức ăn là “predictable”, không lật đổ giả định nào → A'],
    34: ['Các đền đá cẩm thạch và nhà thời Phục hưng ở Rome có điểm gì chung?', 'Đoạn 4',
      '“The foundations dug in the first and second centuries CE for the vast marble temples of the forum obliterated much of what then lay beneath the surface; the cellars of grand Renaissance houses cut through even more ancient remains”',
      'Móng đền và hầm nhà đều phá hủy dấu vết công trình cũ bên dưới → D'],
    35: ['Ở đoạn 5, tác giả nói gì về việc xác định niên đại di vật?', 'Đoạn 5',
      '“to produce a rough chronological scheme covering the period from around 1000 to 600 BCE.”',
      'Sau nhiều thập kỷ chỉ lập được một khung niên đại sơ lược → chỉ xác lập được trình tự thời kỳ gần đúng. A sai: “arguments still rage about the age of almost every major find”; C sai: “decades of work over the past century” → B'],
    36: ['Ở đoạn cuối, tác giả nêu ý rằng', 'Đoạn 6',
      '“Recent scientific methods – including radiocarbon dating … – have suggested that they are all too \'young\', by as much as a hundred years.” … “If anything, Rome appears to be getting older.”',
      'Niên đại theo phương pháp khảo cổ truyền thống và theo carbon phóng xạ chênh nhau tới khoảng trăm năm; tác giả không nói phương pháp nào chính xác hơn hay bị bác bỏ → D'],
    37: ['Tiếng Latin có thể ______', 'Đoạn 2',
      '“One way of doing this is by turning away from the histories of Roman writers and seeking out clues in the Latin language, or in later Roman institutions that might point back to features of earliest Rome.”',
      'Tìm manh mối trong tiếng Latin có thể hé lộ đặc điểm Rome thuở ban đầu = được kỳ vọng làm sáng tỏ Rome nguyên thủy ra sao (key đề in B “truyền thuyết” – bài không nhắc) → F'],
    38: ['Quảng trường La Mã (Forum) ______', 'Đoạn 2',
      '“Beneath the Forum itself (an ancient marketplace at the centre of the city) lie the remains of an early cemetery”',
      'Bên dưới Forum là một nghĩa địa cổ → Forum được xây trên nơi chôn cất trước đó → C'],
    39: ['Công trình mới được phát hiện ở Fidenae ______', 'Đoạn 2',
      '“It is a rectangular building, some six by five metres, made of wood and rammed earth – a construction method still utilised up to the present day”',
      'Làm bằng gỗ và đất nện (vật liệu hữu cơ), cách xây vẫn được dùng đến ngày nay (key đề in F) → A'],
    40: ['Gốm Hy Lạp cổ đôi khi ______', 'Đoạn 5',
      '“using such diagnostics as the existence of wheel-made pottery (assumed to be later than handmade), the occasional presence on graves of Greek ceramics (whose dating is better, but still not perfectly understood) and careful comparison from site to site”',
      'Gốm Hy Lạp thỉnh thoảng có trên mộ, được dùng làm căn cứ để lập trình tự niên đại tương đối → D'],
  },
};
