// Vol 10 - Test 1 - Passage 2. Source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 1 Reading" (PDF đề trên Google Drive công
// khai + bảng đáp án). Not in the bank (dedupe 2026-11-04).
// Key: izone's answer TABLE prints Q17–19 as A, B, H; its own explanations (and the passage) give B (1874), H (1991), A (1851).
// Text: "oddlooking" → odd-looking.
const { notes, matching } = require('../../vr_build');
const DATES = ['1851', '1874', '1967', '1974', '1979', '1981', '1985', '1991'];
const PARAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
module.exports = {
  vol: 10, test: 1, part: 2, title: 'The return of the black-footed ferret', text: 't1p2.txt',
  groups: [
    notes(14, 16, [
      'The black-footed ferret shares most characteristics with its relative, the __Q14__.',
      'North American ferrets are thought to have originally come from __Q15__.',
      'The __Q16__ is the black-footed ferret’s primary source of food throughout their time in North America.',
    ], { instruction: 'Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 14–16 on your answer sheet.' }),
    matching(17, DATES, [
      'An appeal for evidence of black-footed ferrets was published.',
      'A scheme for releasing captive-born black-footed ferrets into the wild was launched.',
      'The black-footed ferret first appeared in a scientific work.',
      'The discovery of a single black-footed ferret led to renewed hope for the species.',
      'North America’s last wild-born black-footed ferrets were taken into captivity.',
      'Efforts to save the black-footed ferret were officially announced as having failed.',
    ], { title: 'List of Dates', instruction: 'Look at the following events (Questions 17–22) and the list of dates below. Match each event with the correct date, A–H. Write the correct letter, A–H, in boxes 17–22 on your answer sheet.' }),
    matching(23, PARAS, [
      'reasons for the sharp decrease in black-footed ferret populations',
      'the procedure by which black-footed ferrets are taught to survive in the wild',
      'mention of doubts about whether there was such an animal as a black-footed ferret',
      'reference to a site which is ideal for the release of black-footed ferrets into the wild',
    ], { instruction: 'Reading Passage 2 has nine paragraphs, A–I. Which paragraph contains the following information? Write the correct letter, A–I, in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'Siberian polecat', 15: 'Europe', 16: 'prairie dog', 17: 'B', 18: 'H', 19: 'A', 20: 'F', 21: 'G', 22: 'E',
    23: 'E', 24: 'H', 25: 'D', 26: 'I' },
  expl: {
    14: ['Chồn chân đen có nhiều đặc điểm giống nhất với họ hàng của nó là ______.', 'Đoạn B',
      '“The Siberian polecat looks more similar to the black-footed ferret, and leads a similar life on open grasslands and semidesert regions”',
      'Chồn hôi Siberia vừa trông giống hơn vừa có lối sống tương tự (đồng cỏ, bán hoang mạc) = “shares most characteristics” → Siberian polecat'],
    15: ['Chồn ở Bắc Mỹ được cho là ban đầu đến từ ______.', 'Đoạn C',
      '“Ferrets probably evolved in Europe between three and four million years ago, and dispersed into North America across an ice-age land bridge”',
      '“probably evolved in Europe” rồi mới sang Bắc Mỹ qua cầu đất băng hà = originally come from → Europe'],
    16: ['______ là nguồn thức ăn chính của chồn chân đen trong suốt thời gian chúng sống ở Bắc Mỹ.', 'Đoạn C',
      '“The black-footed ferret’s history in North America is inextricably linked to the creature which became almost its sole prey — the prairie dog.”',
      '“almost its sole prey” (gần như con mồi duy nhất) = primary source of food → prairie dog'],
    17: ['Một lời kêu gọi cung cấp bằng chứng về chồn chân đen được đăng tải.', 'Đoạn D',
      '“Then, in 1874, a Dr Elliott Coues issued a request for specimens through the popular magazine The American Sportsman”',
      '“issued a request for specimens through the popular magazine” = an appeal for evidence was published, năm 1874 → B'],
    18: ['Một chương trình thả chồn sinh ra trong điều kiện nuôi nhốt về tự nhiên được khởi động.', 'Đoạn H',
      '“A reintroduction programme began in 1991.”',
      'Reintroduction programme (chương trình tái thả về tự nhiên) = scheme for releasing … into the wild, “began” = launched, năm 1991 → H'],
    19: ['Chồn chân đen lần đầu xuất hiện trong một công trình khoa học.', 'Đoạn D',
      '“Black-footed ferrets were not officially recognized by scientists until 1851, when a description and drawing of one featured in a book by the renowned naturalist John James Audubon”',
      'Năm 1851 lần đầu có mô tả và hình vẽ của loài này trong sách của nhà tự nhiên học Audubon = first appeared in a scientific work → A'],
    20: ['Việc phát hiện một cá thể chồn chân đen duy nhất đã khơi lại hy vọng cho loài này.', 'Đoạn G',
      '“In 1981, a farm dog called Shep carried an odd-looking creature to its owner’s ranch house” … “The dog had found a black-footed ferret — which led to efforts again being made to save the species.”',
      'Một con chó tìm thấy một con chồn chân đen năm 1981, dẫn tới các nỗ lực cứu loài được tiếp tục = renewed hope → F'],
    21: ['Những con chồn chân đen sinh ra trong tự nhiên cuối cùng ở Bắc Mỹ bị bắt về nuôi nhốt.', 'Đoạn G',
      '“In 1985, in a final bid to save the species, the remaining 18 individuals in the colony were trapped for a new captive-breeding programme.”',
      '18 cá thể còn lại của quần thể hoang dã bị bẫy để đưa vào chương trình nhân giống nuôi nhốt năm 1985 → G'],
    22: ['Các nỗ lực cứu chồn chân đen được chính thức tuyên bố là đã thất bại.', 'Đoạn F',
      '“Finally, in January 1979, the last ferret in a captive-breeding programme died — making the black-footed ferret the first mammal to be declared extinct in the Northern Hemisphere in the 20th century.”',
      'Năm 1979 con chồn cuối cùng của chương trình nhân giống chết, loài bị tuyên bố tuyệt chủng = efforts officially announced as having failed (năm 1967 chỉ là xếp vào loài nguy cấp) → E'],
    23: ['Những nguyên nhân khiến số lượng chồn chân đen giảm mạnh.', 'Đoạn E',
      '“As agriculture and ranching expanded, the black-footed ferret’s main prey, the prairie dog, became a target for extermination” … “The result was devastating for black-footed ferret populations throughout the continent.”',
      'Đoạn E giải thích nông nghiệp, chăn nuôi mở rộng khiến cầy thảo nguyên (con mồi chính) bị tiêu diệt, gây hậu quả tàn khốc cho quần thể chồn → E'],
    24: ['Quy trình dạy chồn chân đen cách sinh tồn trong tự nhiên.', 'Đoạn H',
      '“Before they can be reintroduced into their natural habitat, captive ferrets have to learn to hunt and escape from predators.”',
      'Đoạn H mô tả từng bước: nuôi trong chuồng trên thảo nguyên, cho ăn thịt cầy thảo nguyên, thả con mồi sống, dụ xuống hang = procedure … taught to survive → H'],
    25: ['Nhắc đến sự nghi ngờ liệu có thật sự tồn tại loài chồn chân đen hay không.', 'Đoạn D',
      '“For over two decades, no other specimens were seen, and scientists even began to question their existence.”',
      '“question their existence” = doubts about whether there was such an animal → D'],
    26: ['Nhắc đến một địa điểm lý tưởng để thả chồn chân đen về tự nhiên.', 'Đoạn I',
      '“The Janos area on the US-Mexico border is the obvious place to reactivate the continent’s wild black-footed ferret population”',
      'Vùng Janos là “the obvious place” để khôi phục quần thể chồn hoang dã = a site which is ideal for the release → I'],
  },
};
