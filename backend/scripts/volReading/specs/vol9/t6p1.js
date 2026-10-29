// Vol 9 - READING/TEST 6-R.docx - Passage 1 (typed docx). Shares ~70% of its text with the bank's "Health in the Wild"
// (Actual Mocktest 47, mini 1345) but the question set is different → new passage "Health in the Wild (Vol 9)" (SAME_TEXT_OK).
// Key = KEY TEST 6-R.docx.
// Text fixes: "self-medicaction" / "self- medication" → self-medication; "photochemical research" → phytochemical; "root of
// problem" → "of the problem"; "he found" → He; a duplicated half-sentence ("The factor common to all 19 species of leaves were
// full of intestinal worms.") removed; spaced hyphens → dashes. Table "Micheal" → Michael.
// Q7 "Clay leads to reduction in level of ___ in blood": key poisons; the passage says "60% less alkaloid in their bloodstreams"
// → accept both.
const { tfng, table, notes } = require('../../vr_build');
module.exports = {
  vol: 9, test: 6, part: 1, title: 'Health in the Wild (Vol 9)', text: 't6p1.txt', lettered: false,
  groups: [
    tfng(1, [
      'Dr Engel has spent ten years gathering evidence for the notion that animals treat their own illnesses.',
      'Animal behaviourists have always believed that animals know how to heal themselves.',
      'Dr Karesh enlisted the help of a medical team during his research.',
      'Wild animals taken into captivity tend to experience a decline in health.',
    ]),
    table(5, 9, ['Researchers', 'Subjects', 'Self-treatment', 'Findings', 'Other observations'], [
      ['Michael Huffman & Mohamedi Seifu 1987', 'Chimps with worms', 'Eat __Q5__ of Veronia plant',
        'Plant contains toxins known as __Q6__ that kill parasites', 'Remedy also used by people'],
      ['James Gilardi 1999', 'Macaws that consume poison-bearing seeds', 'Eat clay', 'Clay leads to reduction in level of __Q7__ in blood', ''],
      ['Richard Wrangham', 'Chimps with gut parasites', 'Eat Aspilia leaves', 'Undigested leaves wrongly believed to contain a __Q8__',
        'Chimps indicate leaves have an __Q9__ taste'],
    ], { instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 5–9 on your answer sheet.' }),
    notes(10, 13, [
      'The consumption of soil for medicinal reasons is called __Q10__. Initially, people believed that animals ate dirt to get __Q11__ and other minerals. They then realised that the soil eaten in some areas did not contain a lot of minerals, and that in other areas plants were a better mineral source. Many people believe that the clay in soil can __Q12__ poisons. Indeed, clay-based __Q13__ are sold in African markets to treat a range of illnesses.',
    ], { title: 'Soil as medication',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 10–13 on your answer sheet.' }),
  ],
  key: { 1: 'TRUE', 2: 'FALSE', 3: 'NOT GIVEN', 4: 'TRUE', 5: 'pith', 6: 'terpenes', 7: 'alkaloid / poisons', 8: 'drug',
    9: 'unpleasant', 10: 'geophagy', 11: 'salt', 12: 'detoxify', 13: 'tablets' },
  expl: {
    1: ['Tiến sĩ Engel đã dành mười năm thu thập bằng chứng cho quan điểm rằng động vật tự chữa bệnh.', 'Đoạn 1',
      '“For the past decade, Dr Cindy Engel … has been collating examples of self-medicating behaviour in wild animals.”',
      '“For the past decade” = mười năm; “collating examples” = gathering evidence → TRUE'],
    2: ['Các nhà nghiên cứu hành vi động vật luôn tin rằng động vật biết cách tự chữa bệnh.', 'Đoạn 1',
      '“the idea that animals can treat themselves has been generally regarded with some skepticism by other animal behaviourists.”',
      'Ý tưởng này từng bị phần lớn hoài nghi, chỉ gần đây mới có nhiều người tin → không phải “always believed” → FALSE'],
    3: ['Tiến sĩ Karesh đã nhờ một đội y tế giúp đỡ trong quá trình nghiên cứu.', 'Đoạn 2',
      '“But blood tests showed that many had encountered unpleasant viral and bacterial diseases in the past”',
      'Bài nói có xét nghiệm máu, nhưng không nhắc Karesh có nhờ đội y tế nào → NOT GIVEN'],
    4: ['Động vật hoang dã bị nuôi nhốt có xu hướng sa sút sức khỏe.', 'Đoạn 2',
      '“if healthy wild animals are brought into captivity, their health often deteriorates unless great care is taken over their living conditions.”',
      '“health often deteriorates” = experience a decline in health → TRUE'],
    5: ['Ăn ______ của cây Veronia', 'Đoạn 3',
      '“noticed that local chimpanzees suffering from intestinal worms would dose themselves with the pith (the white substance between the skin and the flesh) of a plant called Veronia.”',
      'Tinh tinh bị giun ăn lõi (pith) của cây Veronia → pith'],
    6: ['Cây chứa chất độc gọi là ______ có thể diệt ký sinh trùng.', 'Đoạn 3',
      '“This plant produces poisonous chemicals called terpenes. Its pith contains a strong enough concentration to kill gut parasites”',
      '“poisonous chemicals called terpenes” = toxins known as terpenes → terpenes'],
    7: ['Đất sét làm giảm nồng độ ______ trong máu', 'Đoạn 5',
      '“Several hours later, the macaws that had eaten the clay had 60% less alkaloid in their bloodstreams than those that had not”',
      'Vẹt ăn đất sét có lượng alkaloid (chất độc) trong máu ít hơn 60%; key đề in “poisons” (alkaloid là chất độc trong hạt) cũng được chấp nhận → alkaloid'],
    8: ['Lá không tiêu hóa được bị lầm tưởng là chứa một loại ______', 'Đoạn 7',
      '“His (and everybody else’s) assumption was that Aspilia released a drug” … “The drug hypothesis was looking more and more dubious.”',
      'Mọi người lầm tưởng lá Aspilia tiết ra thuốc → drug'],
    9: ['Tinh tinh cho thấy lá có vị ______', 'Đoạn 6',
      '“Some of the chimps were noticed wrinkling their noses as they swallowed these leaves, suggesting the experience was unpleasant.”',
      'Nhăn mũi khi nuốt → trải nghiệm khó chịu → unpleasant'],
    10: ['Việc ăn đất vì mục đích chữa bệnh được gọi là ______.', 'Đoạn 4',
      '“Many species, for example, consume dirt – a behaviour known as geophagy.”',
      '“a behaviour known as geophagy” → geophagy'],
    11: ['Ban đầu, người ta tin rằng động vật ăn đất để lấy ______ và các khoáng chất khác.', 'Đoạn 4',
      '“Historically, the preferred explanation was that soil supplies minerals such as salt.”',
      '“minerals such as salt” → salt'],
    12: ['Nhiều người tin rằng đất sét trong đất có thể ______ chất độc.', 'Đoạn 5',
      '“The current belief is that soil – and particularly the clay in it – helps to detoxify the defensive poisons that some plants produce”',
      '“helps to detoxify the defensive poisons” → detoxify'],
    13: ['Thật vậy, ______ làm từ đất sét được bán ở các chợ châu Phi để chữa nhiều bệnh.', 'Đoạn 9',
      '“The medical stalls in African markets frequently sell tablets made of different sorts of clays, appropriate to different medical conditions.”',
      '“tablets made of different sorts of clays” = clay-based tablets → tablets'],
  },
};
