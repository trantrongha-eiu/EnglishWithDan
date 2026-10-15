// Vol 7 – Test 8 (PDF "Listening/Test 1-10/Test 8.pdf", text layer; key p3 of "Key Lis VOL 7 (T1-T10).pdf"; audio = whole test
// "VOL 7 TEST 8.mp4"). P1–P3 = "Vol 2 - Test 7" P1–P3 (same recordings, 6-gram 0.56/0.80/0.51, keys 10/10; Vol 7's key Q13
// "wearing formal" = the bank's "wearing formal clothes") → reused. P4 "The African clawed frog" is new.
// Transcript: the vol's .docx checked against Whisper turbo (no slips that matter).
const { note } = require('../vol_build');
const A = 'Listening/Test 1-10/VOL 7 Audio (T1-T10)/VOL 7 TEST 8.mp4';

module.exports = {
  vol: 7, test: 8, docx: 'Listening/Test 1-10/Transcript VOL 7 (T1-T10)/transcript vol 7 test 8.docx',
  sections: [
    { part: 1, reuse: '6a53e0a25c459ab074ced7f5', title: 'Windshem Farm Center' },
    { part: 2, reuse: '6a53e3ae5c459ab074cede2e', title: 'Student Vacation Jobs' },
    { part: 3, reuse: '6a53e8405c459ab074cee599', title: 'Study Syndicate for Geology Exam' },
    {
      part: 4, title: 'The African Clawed Frog', audio: A, clip: [1267.4, 1708.8], cover: 'african clawed frog xenopus | frog in aquarium water',
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'The African clawed frog (Xenopus laevis)', [
          '<strong>Description</strong>',
          '• Skin is __Q31__ and can vary in colour',
          '• Skin is coated with a slippery film for __Q32__',
          '• Males are __Q33__ the size of females',
          '<strong>Habitats</strong>',
          '• Native to Africa',
          '• Live in fresh water – prefer water that is __Q34__',
          '• Can survive high levels of __Q35__ in water',
          '• Cannot survive if there is any metal in water',
          '• In drought conditions, may live in __Q36__ for up to a year',
          '<strong>Diet</strong>',
          '• Eat living or dead water creatures',
          '• Find food using their sense of __Q37__, their fingers, and their lateral lines',
          '• Take food into their mouths using front legs and a __Q38__ system',
          '<strong>Other information</strong>',
          '• Now popular as a pet in the US',
          '• In some US states they are identified as a __Q39__',
          '• Used in laboratories for developmental research',
          '• Mucus from the skin has __Q40__ properties',
        ], { 31: 'smooth', 32: 'protection', 33: 'half', 34: 'still', 35: 'salt', 36: 'mud', 37: 'smell', 38: 'pump', 39: 'pest', 40: 'antibiotic' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi mô tả da của loài ếch.', t: ['Like most other frogs, the African Clawed Frogs have a smooth skin.', 'This is one way you can distinguish them from toads, whose skin is rough.'], p: 'Da cóc mới sần sùi (bẫy rough); da ếch trơn nhẵn → smooth' },
        32: { v: 'Khi nói lớp nhầy trên da.', t: ["It's covered with a layer of mucus.", 'This makes it hard for other creatures to pick them up, and so it provides protection against predators.'], p: 'Lớp nhầy giúp bảo vệ khỏi kẻ săn mồi → protection' },
        33: { v: 'Khi nói kích thước ếch đực và cái.', t: 'A large-sized female may be 8 inches long, while the males are about half that size.', p: 'Con đực chỉ bằng khoảng một nửa con cái → half' },
        34: { v: 'Khi nói môi trường sống.', t: ["They make their houses in fresh water, but they're rarely found in running streams.", 'They like still water.'], p: 'Ít khi ở suối chảy; thích nước tĩnh → still' },
        35: { v: 'Khi nói những điều kiện chúng chịu được.', t: 'They don\'t need to be in water where there are plants growing, and they can live in water that has quite a lot of salt in it.', p: 'Sống được ở nước có khá nhiều muối → salt' },
        36: { v: 'Khi nói về hạn hán.', t: 'But in unfavorable conditions, such as drought, they can burrow into the mud and survive there for up to a year until conditions improve.', p: 'Đào hang xuống bùn, sống được đến một năm → mud' },
        37: { v: 'Khi nói cách tìm thức ăn.', t: ["they can't locate their food using their sense of sight.", 'Instead, they use smell and also the sensitive fingers on their front legs.'], p: 'Không dùng thị giác (bẫy sight) mà dùng khứu giác → smell' },
        38: { v: 'Khi nói cách đưa thức ăn vào miệng.', t: 'They use their front legs to get the food into their mouths, together with a type of pump arrangement that sucks the food into the mouth and down into their stomach.', p: 'Chân trước cùng một cơ chế bơm hút thức ăn → pump' },
        39: { v: 'Khi nói tình hình ở Mỹ.', t: ['they have escaped from captivity and are reproducing in the wild and threatening native species there.', "So, they've been classified as a pest in these areas."], p: 'Ở một số bang, chúng bị xếp vào loài gây hại → pest' },
        40: { v: 'Khi nói công dụng của lớp nhầy.', t: 'But also, the slippery mucus that covers their skin acts as an antibiotic, killing parasites and bacteria.', p: 'Chất nhầy có tác dụng như kháng sinh, diệt ký sinh trùng và vi khuẩn → antibiotic' },
      },
    },
  ],
};
