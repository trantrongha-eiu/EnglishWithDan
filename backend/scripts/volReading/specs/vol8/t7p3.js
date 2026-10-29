// Vol 8 - READING/Test 7.pdf - Reading Passage 3 (PDF p7–10, text layer). Not in the bank / mini-ielts.
// Key = READING/Key.pdf (Test 7). The key gives Q27–30 as NOT GIVEN / NO / NOT GIVEN / YES but the PDF asks TRUE / FALSE /
// NOT GIVEN → 27 NOT GIVEN, 28 FALSE, 29 NOT GIVEN, 30 TRUE. Endings A–F of Q36–40 are an image (typed). Text fixes: "memory
// loss cognitive decline" → "memory loss, cognitive decline", "Not only that you" → "Not only that, you", "musical training of
// the brain itself" → "on the brain itself", "can potentially create to a downward spiral" → "create a downward spiral";
// Q35 "Leaming" → Learning.
const { tfng, mc, endings } = require('../../vr_build');
module.exports = {
  vol: 8, test: 7, part: 3, title: 'The benefits of learning an instrument', text: 't7p3.txt',
  groups: [
    tfng(27, [
      'Many parents indicate that their children struggle to learn a musical instrument.',
      'The findings of the recent research into pre-school children\'s IQs are unreliable.',
      'The main reasons people take up an instrument are that they enjoy playing music and being creative.',
      'Evidence about the long-term advantages of learning an instrument is increasing.',
    ]),
    mc(31, [
      ['The studies mentioned in the first paragraph', [
        'confirm a link between musical training and intelligence.', 'present misleading information about the value of learning an instrument.',
        'suggest that there are undiscovered benefits to studying music.', 'cast doubt on a belief about the effects of taking music lessons.']],
      ['According to the second paragraph, there may be many benefits to studying music,', [
        'even for those who begin learning in adulthood.', 'providing the person learns the correct techniques.',
        'especially if the person practises on a regular basis.', 'particularly if the person plays a range of different instruments.']],
      ['The phrase \'this might well be the case\' in the fourth paragraph suggests that', [
        'music lessons and long-term physical well-being may be connected.', 'the ability to learn music may depend on neurological features.',
        'learning an instrument may have a lasting impact on brain function.', 'older people\'s brains may be better suited to studying music than those of children.']],
      ['Which aspect of playing an instrument was included in Hanna-Pladdy\'s follow-up study but not in her first study?', [
        'the number of years that the person had played', 'at which age the person began having lessons',
        'the length of time since the person last played', 'how the person had practised as a child']],
      ['What do Hanna-Pladdy\'s studies suggest about people\'s general education?', [
        'Studying music compensates for an otherwise limited level of education.', 'Learning to play an instrument improves educational performance.',
        'Highly educated people are more likely to benefit from music training.', 'Level of education makes no difference to a person\'s musical ability.']],
    ]),
    endings(36, [
      'comparing the brains of people who had never played an instrument with those who played for a living.',
      'activating many different parts of the brain at the same time.',
      'teaching a group of older people to play an instrument.',
      'acquiring the particular set of physical skills needed to play an instrument.',
      'discovering which group of people become the best musicians.',
      'having played an instrument for a considerable length of time.',
    ], [
      'Brenda Hanna-Pladdy believes the cognitive benefits of music lessons are a result of',
      'The research undertaken by Gottfried Schlaug focused on',
      'According to Alison Balbag, playing an instrument is a unique experience because it involves',
      'Nina Kraus believes there is a link between better hearing in later life and the experience of',
      'Jennifer Bugos\'s study involved',
    ]),
  ],
  key: { 27: 'NOT GIVEN', 28: 'FALSE', 29: 'NOT GIVEN', 30: 'TRUE', 31: 'D', 32: 'A', 33: 'C', 34: 'B', 35: 'A', 36: 'D',
    37: 'A', 38: 'B', 39: 'F', 40: 'C' },
  expl: {
    27: ['Nhiều phụ huynh cho biết con họ gặp khó khăn khi học nhạc cụ.', 'Đoạn A',
      '“That’s what a lot of parents and experts believe: studying an instrument gives children an advantage in the development of their intellectual, perceptual, and cognitive skills.”',
      'Bài chỉ nói phụ huynh tin học nhạc cụ có lợi; không nói con họ học khó khăn → NOT GIVEN'],
    28: ['Kết quả nghiên cứu gần đây về IQ của trẻ mẫu giáo không đáng tin cậy.', 'Đoạn A',
      '“Two highly convincing trials carried out recently have found no evidence to support this idea.”',
      '“highly convincing trials” = nghiên cứu rất thuyết phục, trái với “unreliable” → FALSE'],
    29: ['Lý do chính người ta học nhạc cụ là thích chơi nhạc và sáng tạo.', 'Đoạn B',
      '“But that does not mean that the advantages of learning to play music are limited to expressing yourself, impressing friends, or just having fun.”',
      'Bài nhắc tới lợi ích (thể hiện bản thân, vui), không nói đâu là lý do CHÍNH khiến người ta học nhạc cụ → NOT GIVEN'],
    30: ['Bằng chứng về lợi ích lâu dài của việc học nhạc cụ ngày càng nhiều.', 'Đoạn B',
      '“A growing number of studies show that learning an instrument in childhood can … provide benefits as we age”',
      '“A growing number of studies” = bằng chứng tăng lên; “benefits as we age” = lợi ích lâu dài → TRUE'],
    31: ['Các nghiên cứu ở đoạn đầu', 'Đoạn A',
      '“This may, however, turn out to be wishful thinking. Two highly convincing trials carried out recently have found no evidence to support this idea.”',
      'Các nghiên cứu không tìm thấy bằng chứng cho niềm tin “học nhạc giúp thông minh hơn” = làm dấy lên nghi ngờ về niềm tin đó → D'],
    32: ['Theo đoạn hai, học nhạc có thể có nhiều lợi ích,', 'Đoạn B',
      '“you may well get those benefits even if you haven’t picked up your instrument in years, or decide to take up music for the first time in mid-life or beyond.”',
      '“take up music for the first time in mid-life or beyond” = ngay cả với người bắt đầu học khi đã trưởng thành → A'],
    33: ['Cụm “this might well be the case” ở đoạn bốn gợi ý rằng', 'Đoạn C–D',
      '“Playing music may be an efficient way to stimulate the brain,’ she says, ‘… with ripple effects through the decades.’ … More research is showing this might well be the case.”',
      '“this” chỉ ý chơi nhạc kích thích não với tác động kéo dài hàng thập kỷ = học nhạc cụ có thể ảnh hưởng lâu dài tới chức năng não → C'],
    34: ['Khía cạnh nào có trong nghiên cứu tiếp theo của Hanna-Pladdy mà không có trong nghiên cứu đầu?', 'Đoạn D',
      '“Her follow-up study a year later confirmed those findings and further suggested that starting musical training before the age of nine and keeping at it for ten years or more may yield the greatest benefits.”',
      'Nghiên cứu đầu chia theo số năm chơi (A đã có); nghiên cứu sau thêm yếu tố “starting … before the age of nine” = tuổi bắt đầu học → B'],
    35: ['Nghiên cứu của Hanna-Pladdy gợi ý gì về trình độ học vấn chung?', 'Đoạn D',
      '“it was the group who had the lowest level of general education which showed the greatest gap in scores … Hanna-Pladdy suspects that musical training could have made up for the lack of cognitive stimulation these people had academically.”',
      '“made up for the lack of cognitive stimulation … academically” = học nhạc bù đắp cho trình độ học vấn hạn chế → A'],
    36: ['Brenda Hanna-Pladdy tin rằng lợi ích nhận thức của việc học nhạc là kết quả của', 'Đoạn B',
      '“the time spent learning and practicing specific types of motor control and coordination – each finger on each hand doing something different … – contributes to the brain boost that shows up later in life.”',
      '“motor control and coordination” = bộ kỹ năng thể chất đặc thù để chơi nhạc cụ → D'],
    37: ['Nghiên cứu của Gottfried Schlaug tập trung vào', 'Đoạn C',
      '“Gottfried Schlaug found that the brains of adult professional musicians had a larger volume of grey matter than the brains of non-musicians had.”',
      'So sánh não nhạc công chuyên nghiệp (played for a living) với người không chơi nhạc → A'],
    38: ['Theo Alison Balbag, chơi nhạc cụ là trải nghiệm độc đáo vì nó đòi hỏi', 'Đoạn C',
      '“What’s unique about playing an instrument is that it requires a wide array of brain regions and cognitive functions to work together simultaneously”',
      '“a wide array of brain regions … work together simultaneously” = kích hoạt nhiều vùng não cùng lúc → B'],
    39: ['Nina Kraus tin có mối liên hệ giữa thính giác tốt hơn khi về già và trải nghiệm', 'Đoạn E',
      '“Although none of the subjects had played a musical instrument in 40 years, those who had trained the longest – between four and fourteen years – responded the fastest.”',
      '“trained the longest” = đã chơi nhạc cụ trong thời gian dài → F'],
    40: ['Nghiên cứu của Jennifer Bugos bao gồm', 'Đoạn F',
      '“Jennifer Bugos studied the impact of elementary piano instruction on adults between the ages of 60 and 85.”',
      'Dạy piano cơ bản cho người 60–85 tuổi = dạy một nhóm người lớn tuổi chơi nhạc cụ → C'],
  },
};
