// Vol 4 - reading/test 9/test 9.pdf - Reading Passage 2 (PDF p5–8). Not in the bank / mini-ielts. Text = PDF (typed, clean
// OCR; sections A–F as printed, B/D/E each span two paragraphs). The PDF (and the explain file) lost words in section C:
// "…transported inside red blood | bacteria and fungi. In fact, there enzymes are used by astronauts…" → restored from the
// full text on ieltsit.com ("The Horseshoe Crab Reading Answers"): "red blood cells. This makes horseshoe crab blood valuable to
// scientists. Horseshoe crab blood contains enzymes that are extremely sensitive to toxic bacteria and fungi. In fact, these
// enzymes…" (same keys 14–18 there). Typos fixed: "Shell", "point spines",
// "siwpairs", "carb", "mules far movement and Is for breathing" → muscles for movement and gills for breathing, "crate nests",
// "males,groyt", "200ears" → 20 years, "Florida, While". Q22 option E "carries oxygen [on] its surface". Key = explain key/test
// 9-up.pdf (scan), checked against the passage: all correct.
const { matching, multi, notes } = require('../../vr_build');
module.exports = {
  vol: 4, test: 9, part: 2, title: 'The horseshoe crab', text: 't9p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F'], [
      'a mention of the horseshoe crab\'s potential value in medical science',
      'an explanation of the function of the horseshoe crab\'s tail',
      'a reference to the horseshoe crab\'s feeding habits',
      'a description of horseshoe crab reproduction',
      'an account of the horseshoe crab\'s development to adulthood',
    ], { reuse: true, instruction: 'Reading Passage 2 has six sections, A–F. Which section contains the following information? Write the correct letter, A–F, in boxes 14–18 on your answer sheet. NB You may use any letter more than once.' }),
    multi(19, 2, 'According to the writer, which TWO of the following are true about the characteristics of horseshoe crabs?', [
      'They bury themselves upside down.',
      'They must continue moving while eating.',
      'They most commonly move by swimming.',
      'They are able to replace their missing legs.',
      'They breathe through their mouths while on land.',
    ]),
    multi(21, 2, 'According to the writer, in which TWO ways is horseshoe crab blood different from that of most other animals?', [
      'It has a different mineral composition.',
      'It lacks a bacteria-fighting protein.',
      'Harmless fungi regularly grow in the blood.',
      'Its colour changes from blue to red as it circulates.',
      'The blood cell carries oxygen on its surface.',
    ]),
    notes(23, 26, [
      'A study of the Indian River Lagoon system in Florida has shown a __Q23__ in the horseshoe crab\'s population. This means that animals that eat both horseshoe crabs and their __Q24__ could also be impacted. The result would affect the Indian River Lagoon system\'s __Q25__. Local fishermen taking horseshoe crabs for __Q26__ could be one cause of the reduction in numbers.',
    ], { title: 'The horseshoe crab in Florida',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 23–26 on your answer sheet.' }),
  ],
  key: { 14: 'C', 15: 'B', 16: 'B', 17: 'D', 18: 'E', 19: 'B', 20: 'D', 21: 'A', 22: 'E', 23: 'decline', 24: 'eggs',
    25: 'biodiversity', 26: 'bait' },
  expl: {
    14: ['Nhắc đến giá trị tiềm năng của sam trong y học.', 'Section C',
      '“This makes horseshoe crab blood valuable to scientists.” … “Another application is a protein from horseshoe crab blood that is under investigation as an antibiotic.”',
      'Máu sam có giá trị với giới khoa học; protein trong máu sam đang được nghiên cứu làm kháng sinh = giá trị y học tiềm năng → C'],
    15: ['Giải thích chức năng cái đuôi của sam.', 'Section B',
      '“A long spine forming a tail, called a telson” … “Horseshoe crabs use it to flip over if they happen to be pushed on their backs”',
      'Đuôi (telson) dùng để lật người lại → B'],
    16: ['Chi tiết về thói quen ăn uống của sam.', 'Section B',
      '“They can only eat when crawling, as the motion allows them to open and close their mouths. Their diet consists mainly of worms and clams.”',
      'Cách ăn (chỉ ăn khi bò) và thức ăn (giun, nghêu) → B'],
    17: ['Mô tả quá trình sinh sản của sam.', 'Section D',
      '“The males arrive first and await the females for breeding.” … “laying between 60,000 and 120,000 eggs at a time”',
      'Giao phối, làm tổ, đẻ trứng → D'],
    18: ['Kể về quá trình sam phát triển đến trưởng thành.', 'Section E',
      '“After the larval stage, horseshoe crabs move into the juvenile period. The juvenile horseshoe crabs will slowly grow over a period of about ten years.”',
      'Từ ấu trùng → con non → trưởng thành (lột 17 lần vỏ) → E'],
    19: ['Hai đặc điểm đúng của sam (đáp án 1).', 'Section B',
      '“They can only eat when crawling, as the motion allows them to open and close their mouths.”',
      '“can only eat when crawling” = phải vừa di chuyển vừa ăn → B'],
    20: ['Hai đặc điểm đúng của sam (đáp án 2).', 'Section B',
      '“What is significant is that horseshoe crabs possess the rare ability to regrow lost limbs.”',
      '“regrow lost limbs” = mọc lại chân bị mất. (A sai: chúng vùi mình dưới cát, chỉ bơi ngửa trong nước; C sai: “crawling as their primary means of movement”.) → D'],
    21: ['Hai điểm máu sam khác máu đa số loài khác (đáp án 1).', 'Section C',
      '“they do not have hemoglobin (a protein that contains the mineral iron)” … “Rather, the blood of horseshoe crabs has a copper-containing protein called hemocyanin.”',
      'Máu sam dùng đồng thay cho sắt = thành phần khoáng chất khác → A'],
    22: ['Hai điểm máu sam khác máu đa số loài khác (đáp án 2).', 'Section C',
      '“The oxygen is also transported in a fluid on the exterior of the cell, in contrast to most animals, where oxygen molecules are transported inside red blood cells.”',
      '“on the exterior of the cell” = oxy được vận chuyển bên ngoài tế bào. (D sai: máu chuyển từ xanh sang không màu, không phải đỏ.) → E'],
    23: ['Nghiên cứu ở Indian River Lagoon cho thấy quần thể sam ______.', 'Section F',
      '“A widespread decline in their abundance in the last 20 years may be especially severe in the Indian River Lagoon system in Florida.”',
      '“decline in their abundance” = giảm số lượng → decline'],
    24: ['Các loài ăn cả sam lẫn ______ của chúng cũng có thể bị ảnh hưởng.', 'Section F',
      '“Loss of the horseshoe crab would negatively impact species that feed on the animal and its eggs”',
      '“feed on the animal and its eggs” → eggs'],
    25: ['Hậu quả sẽ ảnh hưởng đến ______ của hệ đầm phá Indian River.', 'Section F',
      '“and would decrease the biodiversity of the lagoon.”',
      '“decrease the biodiversity of the lagoon” → biodiversity'],
    26: ['Ngư dân bắt sam làm ______ có thể là một nguyên nhân khiến số lượng giảm.', 'Section F',
      '“the use of horseshoe crabs as bait to catch fish over the past ten years is, in part, responsible for a rapidly declining population of this unique species, and it is suspected that this is also a problem in Florida.”',
      'Dùng sam làm mồi câu cá → bait'],
  },
};
