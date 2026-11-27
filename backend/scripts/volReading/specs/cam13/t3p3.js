// Cambridge IELTS 13 - Test 3 - Passage 3. Source: ieltsworldly.com, checked against the book key.
const { matching, notes } = require('../../vr_build');
const R = ['Cameron Petrie', 'Ravindanath Singh', 'Yama Dixit', 'David Hodell'];
module.exports = {
  vol: 'cam13', book: 13, test: 3, part: 3, title: 'Whatever happened to the Harappan Civilisation?', text: 't3p3.txt',
  groups: [
    matching(27, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [
      'proposed explanations for the decline of the Harappan Civilisation',
      'reference to a present-day application of some archaeological research findings',
      'a difference between the Harappan Civilisation and another culture of the same period',
      'a description of some features of Harappan urban design',
      'reference to the discovery of errors made by previous archaeologists',
    ], { reuse: true, instruction: 'Reading Passage 3 has eight paragraphs, A–H. Which paragraph contains the following information? Write the correct letter, A–H, in boxes 27–31 on your answer sheet. NB You may use any letter more than once.' }),
    notes(32, 36, [
      'Yama Dixit and David Hodell have found the first definitive evidence of climate change affecting the plains of north-western India thousands of years ago. By collecting the __Q32__ of snails and analysing them, they discovered evidence of a change in water levels in a __Q33__ in the region. This occurred when there was less __Q34__ than evaporation, and suggests that there was an extended period of drought.',
      'Petrie and Singh’s team are using archaeological records to look at __Q35__ from five millennia ago, in order to know whether people had adapted their agricultural practices to changing climatic conditions. They are also examining objects including __Q36__, so as to find out about links between inhabitants of different parts of the region and whether these changed over time.',
    ], { title: 'Looking at evidence of climate change', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 32–36 on your answer sheet.' }),
    matching(37, R, [
      'Finding further information about changes to environmental conditions in the region is vital.',
      'Examining previous patterns of behaviour may have long-term benefits.',
      'Rough calculations indicate the approximate length of a period of water shortage.',
      'Information about the decline of the Harappan Civilisation has been lacking.',
    ], { reuse: true, title: 'List of Researchers', instruction: 'Look at the following statements (Questions 37–40) and the list of researchers below. Match each statement with the correct researcher, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 37–40 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 27: 'C', 28: 'H', 29: 'A', 30: 'B', 31: 'D', 32: 'shells', 33: 'lake', 34: 'rainfall', 35: 'grains', 36: 'pottery', 37: 'B', 38: 'A', 39: 'D', 40: 'A' },
  expl: {
    27: ['Các giải thích được đưa ra cho sự suy tàn của nền văn minh Harappa.', 'Đoạn C', '“Some have claimed that major glacier-fed rivers changed their course”',
      'Đoạn C liệt kê nhiều giả thuyết: sông đổi dòng, dân số tăng, kinh tế sụp đổ, xâm lược, biến đổi khí hậu → C'],
    28: ['Ứng dụng ngày nay của một số kết quả nghiên cứu khảo cổ.', 'Đoạn H', '“we can learn from the past to engage with the public, and the relevant governmental and administrative bodies”',
      'Bài học quá khứ giúp quản lý nguồn nước, phát triển đô thị – nông thôn hiện nay → H'],
    29: ['Một khác biệt giữa văn minh Harappa và một nền văn hóa cùng thời.', 'Đoạn A', '“at a time when the Egyptians were carving and painting representations of themselves all over their temples”',
      'Người Harappa hầu như không để lại hình ảnh về mình, trái với người Ai Cập cùng thời → A'],
    30: ['Mô tả một số đặc điểm quy hoạch đô thị Harappa.', 'Đoạn B', '“Houses were arranged in blocks, with wide main streets and narrow alleyways, and many had their own wells and drainage systems.”',
      'Nhà xếp theo khối, phố chính rộng, ngõ hẹp, giếng và cống thoát nước → B'],
    31: ['Nhắc tới việc phát hiện sai sót của các nhà khảo cổ trước đó.', 'Đoạn D', '“they found inaccuracies in the published geographic locations of ancient settlements”',
      'Vị trí địa lý đã công bố của các khu định cư bị sai → D'],
    32: ['Thu thập ___ của ốc để phân tích.', 'Đoạn E', '“The researchers gathered shells of Melanoides tuberculate snails”', '“gathered” = collecting; vỏ ốc → shells'],
    33: ['…bằng chứng thay đổi mực nước trong một ___ ở vùng này.', 'Đoạn E', '“from the sediments of an ancient lake”', 'Trầm tích của một hồ cổ → lake'],
    34: ['Xảy ra khi ___ ít hơn lượng bốc hơi.', 'Đoạn E', '“when the amount of evaporation from the lake exceeded the rainfall – indicative of a drought.”', 'Bốc hơi vượt lượng mưa = lượng mưa ít hơn bốc hơi → rainfall'],
    35: ['Nhóm của Petrie và Singh xem xét ___ từ 5.000 năm trước.', 'Đoạn G', '“They are analysing grains cultivated at the time”', 'Phân tích ngũ cốc được trồng thời đó → grains'],
    36: ['Họ cũng xem xét các đồ vật, gồm ___.', 'Đoạn G', '“They are also looking at whether the types of pottery used, and other aspects of their material culture”', 'Đồ gốm và văn hóa vật chất khác → pottery'],
    37: ['Tìm thêm thông tin về thay đổi môi trường trong vùng là rất cần thiết.', 'Đoạn F', '“it is essential that we obtain more climate data from areas close to the two great cities”',
      '“essential” = vital; ý của Ravindanath Singh → B'],
    38: ['Nghiên cứu các khuôn mẫu hành vi trước đây có thể mang lại lợi ích lâu dài.', 'Đoạn H', '“By investigating responses to environmental pressures and threats, we can learn from the past”',
      'Petrie: học từ quá khứ để chủ động hơn trong tương lai → A'],
    39: ['Tính toán sơ bộ cho thấy độ dài gần đúng của một thời kỳ thiếu nước.', 'Đoạn E', '“We estimate that the weakening of the Indian summer monsoon climate lasted about 200 years”',
      '“estimate” = rough calculations; khoảng 200 năm (David Hodell) → D'],
    40: ['Thông tin về sự suy tàn của văn minh Harappa còn thiếu.', 'Đoạn B', '“There is plenty of archaeological evidence to tell us about the rise of the Harappan Civilisation, but relatively little about its fall,”',
      'Nhiều bằng chứng về sự trỗi dậy, rất ít về sự sụp đổ (Cameron Petrie) → A'],
  },
};
