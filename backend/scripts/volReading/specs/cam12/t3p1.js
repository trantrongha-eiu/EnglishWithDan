// Cambridge IELTS 12 - Test 3 (book Test 7) - Passage 1. Source: ieltsworldly.com (text, questions); key from babarenglish.com, checked against the passage.
// Text fixes: "lave plains" → lava; "While Cloud" → White Cloud; "work out more ambitious" → "a more ambitious".
const { headings, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam12', book: 12, test: 3, part: 1, title: 'Flying tortoises', text: 't3p1.txt',
  groups: [
    headings(1, [
      'The importance of getting the timing right',
      'Young meets old',
      'Developments to the disadvantage of tortoise populations',
      'Planning a bigger idea',
      'Tortoises populate the islands',
      'Carrying out a carefully prepared operation',
      'Looking for a home for the islands’ tortoises',
      'The start of the conservation project',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 1 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 1–7 on your answer sheet.' }),
    notes(8, 13, [
      '• Originally from mainland South America',
      '• Numbers on Galápagos islands increased, due to lack of predators',
      '• 17th century: small numbers taken onto ships used by __Q8__',
      '• 1790s: very large numbers taken onto whaling ships, kept for __Q9__, and also used to produce __Q10__',
      '• Hunted by __Q11__ on the islands',
      '• Habitat destruction: for the establishment of agriculture and by various __Q12__ not native to the islands, which also fed on baby tortoises and tortoises’ __Q13__',
    ], { title: 'The decline of the Galápagos tortoise', instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 8–13 on your answer sheet.' }),
  ],
  key: { 1: 'v', 2: 'iii', 3: 'viii', 4: 'i', 5: 'iv', 6: 'vi', 7: 'ii', 8: 'pirates', 9: 'food', 10: 'oil', 11: 'settlers', 12: 'species', 13: 'eggs' },
  expl: {
    1: ['Đoạn A – chọn tiêu đề.', 'Đoạn A', '“the islands were colonised by one or more tortoises from mainland South America.”', '“colonised” = populate; rùa đến định cư trên các đảo → v'],
    2: ['Đoạn B – chọn tiêu đề.', 'Đoạn B', '“This historical exploitation was then exacerbated when settlers came to the islands.”', 'Cướp biển, tàu săn cá voi, người định cư làm số rùa giảm mạnh = diễn biến bất lợi → iii'],
    3: ['Đoạn C – chọn tiêu đề.', 'Đoạn C', '“In 1989, work began on a tortoise-breeding centre”', 'Khởi đầu dự án bảo tồn → viii'],
    4: ['Đoạn D – chọn tiêu đề.', 'Đoạn D', '“But if people wait too long after that point, the tortoises eventually become too large to transport.”', 'Phải thả đúng thời điểm: đủ 5 tuổi nhưng chưa quá to → i'],
    5: ['Đoạn E – chọn tiêu đề.', 'Đoạn E', '“to work out a more ambitious reintroduction.”', 'Lên kế hoạch lớn hơn: dùng trực thăng chuyển 300 con → iv'],
    6: ['Đoạn F – chọn tiêu đề.', 'Đoạn F', '“a group of volunteers from the breeding centre worked around the clock to prepare the young tortoises for transport.”', 'Chuẩn bị kỹ: thùng riêng, tình nguyện viên, dọn bãi đáp → vi'],
    7: ['Đoạn G – chọn tiêu đề.', 'Đoạn G', '“Eventually, one tiny tortoise came across a fully grown giant”', 'Rùa con gặp rùa trăm tuổi = trẻ gặp già → ii'],
    8: ['Thế kỷ 17: một số ít bị đưa lên tàu của ___.', 'Đoạn B', '“From the 17th century onwards, pirates took a few on board for food”', 'Cướp biển → pirates'],
    9: ['Những năm 1790: rất nhiều con bị đưa lên tàu săn cá voi, giữ làm ___.', 'Đoạn B', '“the tortoises were taken on board these ships to act as food supplies”', 'Làm nguồn thức ăn → food'],
    10: ['…và dùng để sản xuất ___.', 'Đoạn B', '“Sometimes, their bodies were processed into high-grade oil.”', 'Chế biến thành dầu → oil'],
    11: ['Bị ___ săn bắt trên đảo.', 'Đoạn B', '“when settlers came to the islands. They hunted the tortoises”', 'Người định cư → settlers'],
    12: ['Môi trường sống bị phá bởi nhiều ___ không phải bản địa.', 'Đoạn B', '“They also introduced alien species”', '“alien” = not native; các loài ngoại lai → species'],
    13: ['…loài ăn rùa con và ___ của rùa.', 'Đoạn B', '“that either prey on the eggs and young tortoises”', 'Ăn trứng rùa → eggs'],
  },
};
