// Cambridge IELTS 12 - Test 3 (book Test 7) - Passage 3. Source: ieltsworldly.com (text, questions; paragraphs re-joined as in the book,
// duplicated tail removed); key from babarenglish.com, checked against the passage. Text fix: "One the one hand" → On.
const { notes, mc, endings } = require('../../vr_build');
module.exports = {
  vol: 'cam12', book: 12, test: 3, part: 3, title: 'Music and the emotions', text: 't3p3.txt', lettered: false,
  groups: [
    notes(27, 31, [
      'Participants, who were recruited for the study through advertisements, had their brain activity monitored while listening to their favourite music. It was noted that the music stimulated the brain’s neurons to release a substance called __Q27__ in two of the parts of the brain which are associated with feeling __Q28__.',
      'Researchers also observed that the neurons in the area of the brain called the __Q29__ were particularly active just before the participants’ favourite moments in the music – the period known as the __Q30__. Activity in this part of the brain is associated with the expectation of ‘reward’ stimuli such as __Q31__.',
    ], { title: 'The Montreal Study', instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 27–31 on your answer sheet.' }),
    mc(32, [
      ['What point does the writer emphasise in the first paragraph?', ['how dramatically our reactions to music can vary', 'how intense our physical responses to music can be', 'how little we know about the way that music affects us', 'how much music can tell us about how our brains operate']],
      ['What view of the Montreal study does the writer express in the second paragraph?', ['Its aims were innovative.', 'The approach was too simplistic.', 'It produced some remarkably precise data.', 'The technology used was unnecessarily complex.']],
      ['What does the writer find interesting about the results of the Montreal study?', ['the timing of participants’ neural responses to the music', 'the impact of the music on participants’ emotional state', 'the section of participants’ brains which was activated by the music', 'the type of music which had the strongest effect on participants’ brains']],
      ['Why does the writer refer to Meyer’s work on music and emotion?', ['to propose an original theory about the subject', 'to offer support for the findings of the Montreal study', 'to recommend the need for further research into the subject', 'to present a view which opposes that of the Montreal researchers']],
      ['According to Leonard Meyer, what causes the listener’s emotional response to music?', ['the way that the music evokes poignant memories in the listener', 'the association of certain musical chords with certain feelings', 'the listener’s sympathy with the composer’s intentions', 'the internal structure of the musical composition']],
    ]),
    endings(37, [
      'our response to music depends on our initial emotional state.',
      'neuron activity decreases if outcomes become predictable.',
      'emotive music can bring to mind actual pictures and events.',
      'experiences in our past can influence our emotional reaction to music.',
      'emotive music delays giving listeners what they expect to hear.',
      'neuron activity increases prior to key points in a musical piece.',
    ], [
      'The Montreal researchers discovered that',
      'Many studies have demonstrated that',
      'Meyer’s analysis of Beethoven’s music shows that',
      'Earlier theories of music suggested that',
    ]),
  ],
  key: { 27: 'dopamine', 28: 'pleasure', 29: 'caudate', 30: 'anticipatory phase', 31: 'food', 32: 'B', 33: 'C', 34: 'A', 35: 'B', 36: 'D', 37: 'F', 38: 'B', 39: 'E', 40: 'C' },
  expl: {
    27: ['Âm nhạc kích thích nơ-ron giải phóng chất ___.', 'Đoạn 2', '“music triggers the production of dopamine”', '“triggers the production” = stimulated … to release → dopamine'],
    28: ['…ở hai vùng não gắn với cảm giác ___.', 'Đoạn 2', '“As these two regions have long been linked with the experience of pleasure”', '“linked with” = associated with; khoái cảm → pleasure'],
    29: ['Nơ-ron ở vùng não gọi là ___ đặc biệt hoạt động.', 'Đoạn 3', '“the dopamine neurons in the caudate”', 'Vùng nhân đuôi → caudate'],
    30: ['…ngay trước khoảnh khắc yêu thích – giai đoạn gọi là ___.', 'Đoạn 3', '“The researchers call this the ‘anticipatory phase’”', 'Giai đoạn chờ đón → anticipatory phase'],
    31: ['Hoạt động vùng này gắn với việc chờ đợi “phần thưởng” như ___.', 'Đoạn 3', '“in anticipating food and other ‘reward’ stimuli”', 'Thức ăn → food'],
    32: ['Tác giả nhấn mạnh điều gì ở đoạn đầu?', 'Đoạn 1', '“In other words, sound stirs us at our biological roots.”', 'Đồng tử giãn, mạch nhanh, máu dồn về chân = phản ứng thể chất mạnh → B'],
    33: ['Tác giả nhìn nhận nghiên cứu Montreal thế nào ở đoạn 2?', 'Đoạn 2', '“they were able to obtain an impressively exact and detailed portrait of music in the brain.”', 'Dữ liệu chính xác đến ấn tượng → C'],
    34: ['Tác giả thấy điều gì thú vị trong kết quả nghiên cứu?', 'Đoạn 3', '“were at their most active around 15 seconds before the participants’ favourite moments in the music.”', 'Thời điểm nơ-ron phản ứng (15 giây trước) “rather more significant” → A'],
    35: ['Vì sao tác giả nhắc tới công trình của Meyer?', 'Đoạn 5', '“To demonstrate this psychological principle”', 'Phân tích của Meyer minh họa và ủng hộ phát hiện về giai đoạn chờ đón → B'],
    36: ['Theo Meyer, điều gì gây phản ứng cảm xúc khi nghe nhạc?', 'Đoạn 6', '“Meyer argued that the emotions we find in music come from the unfolding events of the music itself.”', 'Từ diễn biến của chính bản nhạc = cấu trúc nội tại → D'],
    37: ['Các nhà nghiên cứu Montreal phát hiện rằng…', 'Đoạn 3', '“were at their most active around 15 seconds before the participants’ favourite moments in the music.”', 'Nơ-ron hoạt động mạnh trước các điểm quan trọng → F'],
    38: ['Nhiều nghiên cứu đã chứng minh rằng…', 'Đoạn 4', '“Numerous studies, after all, have demonstrated that dopamine neurons quickly adapt to predictable rewards.”', 'Thích nghi với phần thưởng đoán trước được = hoạt động giảm → B'],
    39: ['Phân tích nhạc Beethoven của Meyer cho thấy…', 'Đoạn 5', '“Beethoven saves that chord for the end.”', 'Trì hoãn điều người nghe mong đợi → E'],
    40: ['Các lý thuyết âm nhạc trước đây cho rằng…', 'Đoạn 6', '“While earlier theories of music focused on the way a sound can refer to the real world of images and experiences”', 'Âm thanh gợi hình ảnh và trải nghiệm thật → C'],
  },
};
