// Vol 7 - Test 4.pdf - Reading Passage 2 (PDF p4–7, text layer). Not in the bank / mini-ielts.
// The PDF numbers the five sections 14–18 in the text → lettered A–E; the italic line "We often worry…" = standfirst.
// Text fixes: "or 14 hours" → for, "court recorders" → records, "lying in bad" → bed, "considerately" → considerably,
// "London didn't light its streets until 1584" → 1684 (it follows Paris 1667 and Amsterdam 1669 in the same list; the
// original BBC article by Stephanie Hegarty, "The myth of the eight-hour sleep", has 1684), "could be changing. If it makes
// people … anxious" → "could be damaging if it makes …" (sentence left without a main clause; Q23 = "psychologically
// harmful"). Summary Q26 "feared 26 … on large unit city" → "in the city streets".
// Key = Key Read VOL 7 (T1-T10).pdf, checked against the passage.
const { headings, matching, notes } = require('../../vr_build');
module.exports = {
  vol: 7, test: 4, part: 2, title: 'The Myth of the Eight-hour Sleep', text: 't4p2.txt',
  groups: [
    headings(14, [
      'Historical reasons why interrupted sleep became uncommon',
      'Brain structures involved in sleep patterns',
      'Potential health issues related to sleep',
      'Famous cases in literature of sleep',
      'An analysis of old documents to discover deep patterns',
      'Biological and environmental factors preventing people from falling asleep again',
      'Scientific evidence that divided sleep is a natural phenomenon',
    ], ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'],
    { instruction: 'Reading Passage 2 has five sections, A–E. Choose the correct heading for each section from the list of headings below. Write the correct number, i–vii, in boxes 14–18 on your answer sheet.' }),
    matching(19, ['Thomas Wehr', 'Roger Ekirch', 'Craig Koslofsky', 'Gregg Jacobs', 'Russell Foster'], [
      'In certain historical periods, the threat of criminal danger led to segmented sleep.',
      'Physicians should learn more about treating people with sleeping difficulties.',
      'Historically, when people experienced interrupted sleep, they used the waking period at night for different activities.',
      'Technological changes in Europe made people more likely to sleep throughout the night.',
      'The belief that humans should have a long continuous sleep can be psychologically harmful.',
    ], { title: 'List of Researchers', reuse: true,
      instruction: 'Look at the following statements (Questions 19–23) and the list of researchers below. Match each statement with the correct researcher, A–E. Write the correct letter, A–E, in boxes 19–23 on your answer sheet. NB You may use any letter more than once.' }),
    notes(24, 26, [
      'Historical evidence seems to show that humans had common sleep patterns which were quite unlike today\'s eight hours of unbroken sleep each night. People habitually went to bed early, soon after __Q24__, slept for a while, then woke up for a few hours of activity or perhaps to consider, for example, the meaning of __Q25__. There was little else to do at home in the dark, since what little means of lighting they had, such as using candles, was costly. In 16th-century Europe, people tended to stay at home at night because they feared __Q26__ in the city streets. Once urban street lighting improved, night life in cities became popular, and recreational spots, like coffee houses, came to be considered fashionable. Consequently, sleeping patterns also began to change.',
    ], { title: 'Historical patterns of interrupted sleep',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'vii', 15: 'v', 16: 'i', 17: 'vi', 18: 'iii', 19: 'C', 20: 'E', 21: 'B', 22: 'B', 23: 'D', 24: 'sunset',
    25: 'dreams', 26: 'thieves' },
  expl: {
    14: ['Chọn tiêu đề cho Section A.', 'Section A',
      '“Indications from both science and history suggest that the eight-hour sleep may not be a natural or inborn pattern for humans.” … “by the fourth week the subjects had settled into a very distinct sleeping pattern.”',
      'Thí nghiệm của Wehr cho thấy người ta tự nhiên ngủ thành hai giấc = bằng chứng khoa học → vii Scientific evidence that divided sleep is a natural phenomenon'],
    15: ['Chọn tiêu đề cho Section B.', 'Section B',
      '“Ekirch\'s research found more than 500 references to a segmented sleeping pattern – in diaries, court records, medical books and literature”',
      'Nghiên cứu nhật ký, hồ sơ tòa án, sách y học… = phân tích tài liệu cũ để tìm ra khuôn mẫu ngủ → v An analysis of old documents to discover deep patterns'],
    16: ['Chọn tiêu đề cho Section C.', 'Section C',
      '“Ekirch attributes the initial shift to improvements in street and home lighting.”',
      'Section C giải thích vì sao kiểu ngủ hai giấc biến mất (đèn đường, quán cà phê, Cách mạng Công nghiệp) → i Historical reasons why interrupted sleep became uncommon'],
    17: ['Chọn tiêu đề cho Section D.', 'Section D',
      '“many sleeping problems may have roots in the human body\'s natural preference for divided sleep, as well as in difficulties caused by extended exposure to artificial light” … “where people wake during the night and have trouble getting back to sleep.”',
      'Thiên hướng tự nhiên của cơ thể (biological) + ánh sáng nhân tạo (environmental) gây khó ngủ lại → vi Biological and environmental factors preventing people from falling asleep again'],
    18: ['Chọn tiêu đề cho Section E.', 'Section E',
      '“Over 30% of the medical problems that doctors are faced with stem directly or indirectly from sleep.”',
      'Section E nói lo âu vì thức giấc, khả năng điều hòa căng thẳng và các bệnh liên quan giấc ngủ → iii Potential health issues related to sleep'],
    19: ['Trong một số thời kỳ lịch sử, mối đe dọa tội phạm dẫn đến kiểu ngủ chia đoạn.', 'Section B',
      '“In his book, Evening\'s Empire, historian Craig Koslofsky suggested an explanation for this divided sleep pattern in Europe.” … “the streets of cities and towns at night were often populated by thieves or worse.”',
      'Koslofsky giải thích kiểu ngủ hai giấc bằng việc đường phố ban đêm đầy trộm cướp → C'],
    20: ['Bác sĩ nên học thêm về cách điều trị người bị rối loạn giấc ngủ.', 'Section E',
      '“But sleep has been ignored in medical training, and there are very few countries where sleep is studied,\' Foster says. He feels this needs to change.”',
      'Foster cho rằng đào tạo y khoa bỏ qua giấc ngủ và điều đó cần thay đổi → E'],
    21: ['Trong lịch sử, khi ngủ ngắt quãng, người ta dùng khoảng thức đêm cho nhiều hoạt động khác nhau.', 'Section B',
      '“During the waking period, people could be quite active. They sometimes got up and moved around the house, although most people stayed in bed, and perhaps read or wrote”',
      'Ekirch ghi nhận người ta đi lại, đọc, viết, nghĩ về giấc mơ trong lúc thức → B'],
    22: ['Những thay đổi công nghệ ở châu Âu khiến người ta dễ ngủ liền một mạch hơn.', 'Section C',
      '“Ekirch attributes the initial shift to improvements in street and home lighting.”',
      'Cải tiến chiếu sáng (công nghệ) là nguyên nhân Ekirch đưa ra cho việc chuyển sang ngủ một giấc → B'],
    23: ['Niềm tin rằng con người phải ngủ một giấc dài liên tục có thể gây hại về tâm lý.', 'Section E',
      '“Sleep psychologist, Gregg Jacobs, says that the idea that we must sleep for an extended period of time could be damaging if it makes people who wake up in the night anxious”',
      'Jacobs: ý nghĩ phải ngủ liền mạch có thể gây hại vì khiến người thức giấc lo âu → D'],
    24: ['Người ta thường đi ngủ sớm, ngay sau ______.', 'Section B',
      '“these references describe a first sleep which began not long following sunset.”',
      '“not long following sunset” = soon after sunset → sunset'],
    25: ['… hoặc để suy ngẫm, ví dụ, về ý nghĩa của ______.', 'Section B',
      '“people used the time that they were awake between periods of sleep to think about and attempt to analyse their dreams.”',
      '“think about and attempt to analyse their dreams” = consider the meaning of dreams → dreams'],
    26: ['Ở châu Âu thế kỷ 16, người ta thường ở nhà ban đêm vì sợ ______ trên đường phố.', 'Section B',
      '“the streets of cities and towns at night were often populated by thieves or worse. The streets at night consequently scared many people.”',
      'Đường phố ban đêm đầy kẻ trộm nên người ta sợ → thieves'],
  },
};
