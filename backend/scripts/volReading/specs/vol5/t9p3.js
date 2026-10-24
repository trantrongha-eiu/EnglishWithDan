// Vol 5 - Reading/Test 9/Test 9- up.pdf - Reading Passage 3 (PDF p9–12). Not in the bank: "The Power of Nothing" (Mocktest 66)
// is the same article in a longer version with a different question set (58% shared). Text = PDF (typed scan). PDF slips fixed:
// "Benedetti induced pain in pressure cuff on the forearm" → induced pain in human volunteers by inflating a blood-pressure cuff
// (as in the original; koolearn / the bank), "believe in you therapy. Many illness", "tea o used", "lend itself", "moblishing",
// "categorized his colleague", "friendly and I reassuring", quote marks.
// Q34 MISSING from the PDF (Questions 32–34 print only 32 and 33), but the key file has "34 C". RESTORED from the original set
// (m.koolearn.com/ielts/20240725/864264.html, ielts.xdf.cn): "Fabrizio Benedetti's research on endorphins indicates that …",
// answer C "They can be neutralized by introducing naloxone." — matches the Vol key and the passage. Key = Test 9/Explanation-
// 9.pdf, checked against the passage: all correct.
const { endings, mc, ynng } = require('../../vr_build');
module.exports = {
  vol: 5, test: 9, part: 3, title: 'The Placebo Effect', text: 't9p3.txt',
  groups: [
    endings(27, [
      'should be easy to understand.',
      'can improve without treatment.',
      'can cost the patient less.',
      'ought to last a minimum length of time.',
      'can require a range of different products.',
      'can be described as serious.',
      'should give it greater recognition.',
      'should be able to get a high income.',
    ], [
      'An appointment with an alternative practitioner',
      'An alternative practitioner\'s explanation of their treatment',
      'If alternative practitioners have faith in their treatment, they',
      'Quite often, a patient\'s illness',
      'Conventional doctors are aware of the placebo effect and they',
    ]),
    mc(32, [
      ['In the third paragraph, the writer says that the placebo effect', [
        'works best in tablet form.', 'is a new type of medical treatment.', 'is trusted more by some patients than others.',
        'has a significant role in both alternative and conventional medicine.']],
      ['A reference is made to anger and sadness in order to show that', [
        'personal feelings can alter our physical condition.', 'some human behaviour has no clear explanation.',
        'placebos, like emotions, are experienced by everyone.', 'people find some physical reactions hard to control.']],
      ['Fabrizio Benedetti\'s research on endorphins indicates that', [
        'they are widely used to regulate pain.', 'they can be produced by willful thoughts.',
        'they can be neutralized by introducing naloxone.', 'their pain-relieving effects do not last long enough.']],
    ]),
    ynng(35, [
      'Scientists now have enough information to understand how the placebo effect becomes active in people.',
      'As a result of experiments, some painkillers have been taken off the market.',
      'Individual preference can have an impact on the effectiveness of different brands of headache tablet.',
      'Doctors expressed a range of views on the drug chlorpromazine when it was first introduced.',
      'Ernst\'s study had a big influence on doctors\' behaviour with patients.',
      'Alternative practitioners work in a way that is likely to trigger the placebo effect.',
    ]),
  ],
  key: { 27: 'D', 28: 'A', 29: 'H', 30: 'B', 31: 'G', 32: 'D', 33: 'A', 34: 'C', 35: 'NO', 36: 'NOT GIVEN', 37: 'YES',
    38: 'YES', 39: 'NOT GIVEN', 40: 'YES' },
  expl: {
    27: ['Một buổi hẹn với người chữa bệnh theo phương pháp thay thế', 'Đoạn 1',
      '“each session with your patients should take at least half an hour.”',
      '“at least half an hour” = ought to last a minimum length of time → D'],
    28: ['Lời giải thích của người chữa bệnh thay thế về cách chữa của họ', 'Đoạn 1',
      '“Describe your treatment in familiar words, but embroidered with a hint of mysticism”',
      '“familiar words” = dễ hiểu → A'],
    29: ['Nếu người chữa bệnh thay thế tin vào cách chữa của mình, họ', 'Đoạn 2',
      '“And a very good living if you are sufficiently convincing or, better still, really believe in your therapy.”',
      '“a very good living” = high income → H'],
    30: ['Khá thường xuyên, bệnh của người bệnh', 'Đoạn 2',
      '“Many illnesses get better on their own”',
      '“get better on their own” = improve without treatment → B'],
    31: ['Bác sĩ chính thống biết về hiệu ứng giả dược và họ', 'Đoạn 2 & 3',
      '“the placebo effect” that “conventional medicine recognizes but remains oddly ambivalent about” … “its role is often neglected and misunderstood.”',
      'Y học chính thống biết nhưng còn lưỡng lự, xem nhẹ → nên công nhận nó nhiều hơn → G'],
    32: ['Ở đoạn 3, tác giả nói hiệu ứng giả dược', 'Đoạn 3',
      '“In fact, the placebo is a powerful part of all medical care, orthodox or otherwise”',
      '“all medical care, orthodox or otherwise” = cả y học chính thống lẫn thay thế → D'],
    33: ['Tác giả nhắc đến giận dữ và buồn bã để cho thấy', 'Đoạn 4',
      '“it should come as no surprise that our state of mind can influence our physiology: anger opens the superficial blood vessels of the face; sadness pumps the tear glands.”',
      '“state of mind can influence our physiology” = feelings can alter physical condition → A'],
    34: ['Nghiên cứu của Benedetti về endorphin cho thấy', 'Đoạn 5',
      '“the placebo effect can be abolished by a drug, naloxone, which blocks the effects of endorphins.” … “when he added naloxone to the saline, and blocked the endorphins, the pain relief disappeared.”',
      'Naloxone chặn tác dụng của endorphin = neutralized by introducing naloxone → C'],
    35: ['Các nhà khoa học nay đã đủ thông tin để hiểu hiệu ứng giả dược hoạt động thế nào.', 'Đoạn 4 & 6',
      '“But exactly how placebos work their medical magic is still largely unknown.” … “Though scientists don\'t know exactly how placebos work”',
      'Vẫn “largely unknown” → NO'],
    36: ['Do kết quả thí nghiệm, một số thuốc giảm đau bị rút khỏi thị trường.', 'Đoạn 6',
      '“A London rheumatologist found, for example, that red dummy capsules made more effective painkillers than blue, green or yellow ones.”',
      'Chỉ nói về màu viên giả dược; không nói thuốc nào bị thu hồi → NOT GIVEN'],
    37: ['Sở thích cá nhân có thể ảnh hưởng đến hiệu quả của các nhãn thuốc đau đầu khác nhau.', 'Đoạn 6',
      '“if Aspro or Tylenol are what you like to take for a headache, their chemically identical generic equivalents may be less effective.”',
      '“what you like to take” = individual preference; thuốc gốc tương đương kém hiệu quả hơn → YES'],
    38: ['Các bác sĩ có nhiều ý kiến khác nhau về thuốc chlorpromazine khi mới ra đời.', 'Đoạn 7',
      '“a doctor in Kansas categorised his colleagues according to whether they were keen on it, openly skeptical of its benefits, or took a \'let\'s try and see\' attitude.”',
      'Hào hứng, hoài nghi, chờ xem = a range of views → YES'],
    39: ['Nghiên cứu của Ernst có ảnh hưởng lớn đến cách bác sĩ đối xử với bệnh nhân.', 'Đoạn 7',
      '“A recent survey by Ernst on doctors\' bedside manners turned up one consistent finding: Physicians who adopt a warm, friendly, reassuring manner are more effective”',
      'Chỉ nêu kết quả khảo sát; không nói nó làm bác sĩ thay đổi cách cư xử → NOT GIVEN'],
    40: ['Người chữa bệnh thay thế làm việc theo cách dễ kích hoạt hiệu ứng giả dược.', 'Đoạn 8',
      '“It\'s hardly surprising then, that complementary practitioners are generally best at mobilising the placebo effect,\' says Arthur Kleinman”',
      '“best at mobilising the placebo effect” → YES'],
  },
};
