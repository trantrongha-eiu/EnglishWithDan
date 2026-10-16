// Vol 1 - Test 7 - Reading Passage 3 (PDF p14–19). Not in the bank (mini-ielts 1278 "Extinct: the Giant Deer", no answers
// there). Title from the PDF/key page ("Irish ELK"); the PDF's sub-heads "Extinct: the Giant Deer" dropped.
// Source flaws:
//  - Question 27 is missing from the PDF (instruction says 27–32, questions start at 28; mini-ielts also starts at 28) though
//    the key lists "27 D" → passage has 13 questions, Q28–40 (as printed).
//  - Vol 1 reordered the summary (Q28–32) and Q33–35 against mini-ielts/ieltsmaterial.com but kept their key order → key
//    re-aligned to the printed questions: Q28 10,500 years ago (printed 32), Q29 400,000 (28), Q30 8,000 (29),
//    Q31 7,000 (30), Q32 wooded interglacials (31); Q33 habitat destruction (35), Q34 antlers (33), Q35 minerals (34).
//  - Q36–39 (continents): every key (printed, ieltsmaterial.com) is B D A C, one letter each. Checked 2026-10-17: the passage
//    says "Africa escaped major faunal extinction as did tropical and sub-tropical Asia" (→ Q37 Africa or Asia) and that
//    Australia's megafauna died out with the climate change while co-existing with humans for 30,000 years (→ Q36 and Q39
//    both Australia). Keys: Q37 "D / C", Q39 "B / C" (C kept as accepted = the published key); letters may be reused.
const { notes, short, matching, mc } = require('../../vr_build');
module.exports = {
  vol: 1, test: 7, part: 3, title: 'Irish Elk', text: 't7p3.txt', start: 28, allowCount: [13],
  free: ['10500 years ago', '8000 years ago', '7000 years ago'],
  groups: [
    notes(28, 32, [
      'It is commonly believed that large woolly mammals became extinct about __Q28__ at the end of the last ice age. Having been preserved well in Europe and central Asia, the remains of the Irish elk show it initially appeared approximately __Q29__. Around __Q30__, they were driven to live on the plain after being restricted to the Ural Mountains. Hunting was considered one of the important factors in the Irish elk’s extinction. However, another major problem could be habitat destruction that happened due to the settlement of Neolithic people around __Q31__. Until then, the Irish elk was able to withstand climatic fluctuations. Some scientists think that the huge antlers may also have contributed to the Irish elk’s extinction, but this explanation is highly controversial as they lived perfectly well during the __Q32__.',
    ], { instruction: 'Complete the summary below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 28–32 on your answer sheet.' }),
    short(33, [
      'What man-made issue besides hunting suggests that the advent of humans resulted in the extinction of the Irish elk?',
      'What physical characteristic may have contributed to the extinction of the Irish elk?',
      'What kind of nutrient substance was needed to maintain the huge size of the Irish elk?',
    ], { instruction: 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 33–35 on your answer sheet.' }),
    matching(36, ['Eurasia', 'Australia', 'Asia', 'Africa'], [
      'the continent where humans had little impact on the extinction of large mammals',
      'the continent where the climatic change was mild and fauna remains',
      'the continent where both humans and climatic change are the causes',
      'the continent where climatic change alone caused a massive extinction',
    ], { reuse: true, instruction: 'Choose the correct letter, A–D, and write your answers in boxes 36–39 on your answer sheet. NB You may use any letter more than once.' }),
    mc(40, [['Which statement is true according to the Stuart team’s findings?', [
      'Neanderthals rather than modern humans caused the extinction in Europe.',
      'Paleolithic humans in Europe alone killed the big animals such as the giant deer.',
      'Climatic change was not solely responsible for the megafauna extinction in Europe.',
      'Moderate and staggered extinction was mainly the result of fundamental climatic change.']]]),
  ],
  key: { 28: '10,500 years ago / 10500 years ago', 29: '400,000 years ago', 30: '8,000 years ago / 8000 years ago', 31: '7,000 years ago / 7000 years ago',
    32: 'wooded interglacials', 33: 'habitat destruction', 34: 'male’s huge antlers / huge antlers / antlers / male\'s huge antlers', 35: 'minerals',
    36: 'B', 37: 'D / C', 38: 'A', 39: 'B / C', 40: 'C' },
  expl: {
    28: ['Người ta thường tin rằng các loài thú lớn nhiều lông tuyệt chủng khoảng ______ vào cuối kỷ băng hà cuối cùng.', 'Câu dẫn đầu bài',
      '“many other big, shaggy mammals are widely thought to have died out around the end of the last ice age, some 10,500 years ago.”',
      '“widely thought” = “commonly believed”; “died out” = “became extinct” → 10,500 years ago'],
    29: ['… xương cốt cho thấy nai sừng tấm Ireland xuất hiện lần đầu khoảng ______.', 'Đoạn B',
      '“first appeared about 400,000 years ago in Europe and central Asia.”',
      'Nai Ireland xuất hiện lần đầu khoảng 400.000 năm trước ở châu Âu và Trung Á → 400,000 years ago'],
    30: ['Khoảng ______, chúng bị đẩy xuống đồng bằng sau khi bị dồn về dãy Ural.', 'Đoạn B + C',
      '“The eastern foothills of the Urals became very densely forested about 8,000 years ago, which could have pushed them on to the plain,”',
      'Rừng rậm phủ chân núi Ural khoảng 8.000 năm trước đã đẩy chúng xuống đồng bằng → 8,000 years ago'],
    31: ['… nạn phá huỷ môi trường sống do người thời đồ đá mới đến định cư vào khoảng ______.', 'Đoạn D',
      '“We haven’t got just hunting 7,000 years ago — this was also about the time the first Neolithic people settled in the region.”',
      'Khoảng 7.000 năm trước là lúc những người đồ đá mới đầu tiên đến định cư và phát quang đất → 7,000 years ago'],
    32: ['… vì trước đó chúng vẫn sống tốt qua các ______.', 'Đoạn E',
      '“because the deer previously survived perfectly well through wooded interglacials”',
      'Lister phản bác giả thuyết “sừng quá lớn”: loài nai từng sống tốt qua các thời kỳ gian băng có rừng → wooded interglacials'],
    33: ['Ngoài săn bắn, vấn đề nào do con người gây ra cho thấy sự xuất hiện của con người dẫn đến tuyệt chủng?', 'Đoạn D',
      '“their new date for the Irish elk’s extinction hints at an additional human-made problem — habitat destruction.”',
      '“man-made issue besides hunting” = “an additional human-made problem” → habitat destruction'],
    34: ['Đặc điểm cơ thể nào có thể đã góp phần khiến nai Ireland tuyệt chủng?', 'Đoạn E',
      '“another possible explanation for the deer’s demise — the male’s huge antlers.”',
      'Một giả thuyết cho rằng bộ sừng khổng lồ của con đực góp phần dẫn đến tuyệt chủng → male’s huge antlers'],
    35: ['Cần chất dinh dưỡng gì để duy trì kích thước khổng lồ của nai Ireland?', 'Đoạn E',
      '“large quantities of these minerals are required for the massive structures of the Irish Elk.”',
      'Cấu trúc sừng đồ sộ cần lượng lớn khoáng chất (canxi, phốt phát) → minerals'],
    36: ['Châu lục nơi con người ít ảnh hưởng đến sự tuyệt chủng của thú lớn', 'Đoạn F',
      '“megafauna must have co-existed with humans for at least 30 000 years. Regularly hunted modern kangaroos survived not only 10 000 years of Aboriginal hunting”',
      'Ở Úc, thú lớn sống chung với con người ít nhất 30.000 năm; nguyên nhân chính là khí hậu khô nóng làm mất môi trường sống → con người ít tác động → B'],
    37: ['Châu lục nơi biến đổi khí hậu nhẹ và hệ động vật vẫn còn', 'Đoạn F',
      '“Tropical and subtropical areas have experienced less radical climatic change.” … “Significantly, Africa escaped major faunal extinction”',
      'Vùng nhiệt đới thay đổi khí hậu ít hơn; châu Phi thoát khỏi đợt tuyệt chủng lớn (vùng nhiệt đới châu Á cũng vậy nên C cũng được chấm đúng) → D'],
    38: ['Châu lục nơi cả con người và biến đổi khí hậu đều là nguyên nhân', 'Đoạn G',
      '“the combination of the climatic change and the presence of humans — of advanced Paleolithic humans — causes this wave of extinction.”',
      'Nhóm Stuart nghiên cứu bắc Á-Âu (Eurasia): khí hậu thay đổi cộng với sự có mặt của con người gây ra làn sóng tuyệt chủng → A'],
    39: ['Châu lục nơi chỉ riêng biến đổi khí hậu đã gây tuyệt chủng hàng loạt', 'Đoạn F',
      '“Australia’s climate changed from cold-dry to warm-dry. As a result, surface water became scarce.” … “megafauna must have co-existed with humans for at least 30 000 years.”',
      'Ở Úc, khí hậu khô nóng làm thú lớn mất môi trường sống và tuyệt chủng, trong khi chúng đã sống chung với con người hàng chục nghìn năm → chỉ riêng khí hậu là nguyên nhân. (Key in của đề và ieltsmaterial.com ghi C — Asia, do loại trừ; nhưng bài nói vùng nhiệt đới châu Á thoát tuyệt chủng. Vẫn chấm đúng cả C.) → B'],
    40: ['Theo phát hiện của nhóm Stuart, phát biểu nào đúng?', 'Đoạn G',
      '“There’s no obvious coincidence between the arrival of humans or climatic change alone and these extinctions.” … “the combination of the climatic change and the presence of humans … causes this wave of extinction.”',
      'Không phải chỉ khí hậu hay chỉ con người, mà sự kết hợp của cả hai gây tuyệt chủng ở châu Âu → khí hậu không phải nguyên nhân duy nhất → C'],
  },
};
