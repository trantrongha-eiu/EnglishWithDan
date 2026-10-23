// Vol 3 - Test 2 - Reading Passage 1 (PDF p2–5). Not in the bank (mini-ielts 1361 = same text and questions). Text = PDF
// (two-column, clean OCR), no paragraph letters (the questions use none). The Vol text says bovids are "well represented in
// most parts of Eurasia and Southeast Asian islands, but … most numerous and diverse in the latter" (the textbook original says
// Africa) — Q1 key D follows the printed text. Fixes: "Bovids are highly diverse group" → a highly; "bisons" → bison; "nilgae"
// → nilgai; dashes around the list of cattle ancestors; "at speed of" → speeds; Q3 option "Their horns are shot" → short;
// Q2 "wide open space" → spaces. Key (explain file = mini) checked against the passage: all correct.
const { mc, matching, short } = require('../../vr_build');
module.exports = {
  vol: 3, test: 2, part: 1, title: 'Bovids', text: 't2p1.txt', lettered: false,
  free: ['long splayed hooves'],
  groups: [
    mc(1, [
      ['In which region is the biggest range of bovids to be found?', ['Africa', 'Eurasia', 'North America', 'South-east Asia']],
      ['Most bovids have a preference for living in', ['isolation', 'small groups', 'tropical forest', 'wide open spaces']],
      ['Which of the following features do all bovids have in common?', [
        'Their horns are short.', 'They have upper incisors.', 'They store food in the body.', 'Their hooves are undivided.']],
    ]),
    matching(4, ['Antelope', 'Bovinae', 'Caprinae', 'Cephalophinae'], [
      'can endure very harsh environments',
      'includes the ox and the cow',
      'may supplement its diet with meat',
      'can usually move at speed',
      'does not defend a particular area of land',
    ], { title: 'List of Sub-families', reuse: true,
      instruction: 'Look at the following characteristics (Questions 4–8) and the list of sub-families below. Match each characteristic with the correct sub-family, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 4–8 on your answer sheet. NB You may use any letter more than once.' }),
    short(9, [
      'What is the smallest species of bovid called?',
      'Which species of Bovinae has now died out?',
      'What facilitates the movement of the sitatunga over wetland?',
      'What sort of terrain do Barbary sheep live in?',
      'What is the only living member of the Antilocapridae sub-family?',
    ], { instruction: 'Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer. Write your answers in boxes 9–13 on your answer sheet.' }),
  ],
  key: { 1: 'D', 2: 'D', 3: 'C', 4: 'C', 5: 'B', 6: 'D', 7: 'A', 8: 'B',
    9: 'royal antelope / the royal antelope', 10: 'auroch / the auroch', 11: 'long, splayed hooves / long splayed hooves / splayed hooves',
    12: 'arid deserts / arid desert / deserts', 13: 'pronghorn / the pronghorn' },
  expl: {
    1: ['Khu vực nào có nhiều loài bò họ (bovids) nhất?', 'Đoạn 2',
      '“Bovids are well represented in most parts of Eurasia and Southeast Asian islands, but they are by far the most numerous and diverse in the latter.”',
      '“the latter” = cái được nhắc sau cùng = các đảo Đông Nam Á; “most numerous and diverse” = đa dạng nhất → D'],
    2: ['Phần lớn bovids thích sống ở…', 'Đoạn 2',
      '“the majority of species favour open grassland, scrub or desert.”',
      'Đồng cỏ trống, cây bụi, sa mạc = không gian rộng mở. C sai: rừng nhiệt đới chỉ là một trong nhiều môi trường thích nghi → D'],
    3: ['Đặc điểm nào mọi bovids đều có?', 'Đoạn 3',
      '“All species are ruminants, which means that they retain undigested food in their stomachs, and regurgitate it as necessary.”',
      'Giữ thức ăn chưa tiêu hoá trong dạ dày = trữ thức ăn trong cơ thể. B sai: răng cửa trên thường không có; D sai: móng chẻ đôi (cloven) → C'],
    4: ['Có thể chịu được môi trường rất khắc nghiệt.', 'Đoạn 6',
      '“Tolerance of extreme conditions is most marked in this group: Barbary and bighorn sheep have adapted to arid deserts”',
      '“this group” = phân họ Caprinae; “tolerance of extreme conditions” = chịu môi trường khắc nghiệt → C'],
    5: ['Bao gồm bò đực và bò cái.', 'Đoạn 4',
      '“The sub-family Bovinae comprises most of the larger bovids, including the African bongo, and nilgai, eland, bison and cattle.”',
      '“cattle” = trâu bò (ox, cow) thuộc phân họ Bovinae → B'],
    6: ['Có thể ăn thêm thịt.', 'Đoạn 7',
      '“some duikers – unlike most other bovids – are believed to eat insects and feed on dead animal carcasses, and even to kill small animals.”',
      'Linh dương duiker (phân họ Cephalophinae) ăn xác động vật, thậm chí giết thú nhỏ → D'],
    7: ['Thường có thể di chuyển nhanh.', 'Đoạn 5',
      '“Antelopes are typically long-legged, fast-running species”',
      '“fast-running” = di chuyển nhanh; đó là linh dương (Antelope) → A'],
    8: ['Không bảo vệ một vùng đất riêng.', 'Đoạn 4',
      '“The sub-family Bovinae comprises most of the larger bovids” … “Unlike most other bovids they are all non-territorial.”',
      '“non-territorial” = không giữ lãnh thổ riêng → B'],
    9: ['Loài bovid nhỏ nhất tên là gì?', 'Đoạn 2',
      '“at one extreme is the royal antelope of West Africa, which stands a mere 25 cm at the shoulder”',
      'Chỉ cao 25 cm tính đến vai — cực nhỏ nhất → royal antelope'],
    10: ['Loài nào thuộc Bovinae nay đã tuyệt chủng?', 'Đoạn 4',
      '“while the auroch (the ancestor of the domestic cattle of Europe) is extinct.”',
      '“is extinct” = đã tuyệt chủng (died out) → auroch'],
    11: ['Điều gì giúp linh dương sitatunga di chuyển trên đất ngập nước?', 'Đoạn 5',
      '“the sitatunga has long, splayed hooves that enable it to walk freely on swampy ground.”',
      '“swampy ground” = đất ngập nước; “enable it to walk freely” = giúp di chuyển → long, splayed hooves'],
    12: ['Cừu Barbary sống ở loại địa hình nào?', 'Đoạn 6',
      '“Barbary and bighorn sheep have adapted to arid deserts”',
      'Thích nghi với sa mạc khô cằn → arid deserts'],
    13: ['Thành viên duy nhất còn sống của phân họ Antilocapridae là gì?', 'Đoạn 8',
      '“The pronghorn is the sole survivor of a New World sub-family of herbivorous ruminants, the Antilocapridae in North America.”',
      '“sole survivor” = thành viên duy nhất còn sống → pronghorn'],
  },
};
