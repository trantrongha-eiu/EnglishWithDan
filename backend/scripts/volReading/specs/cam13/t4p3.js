// Cambridge IELTS 13 - Test 4 - Passage 3. Source: ieltsworldly.com, checked against the book key.
// Text fixes: "Rightly, Davies his story" → "Davies begins his story"; "inner of pleasure" → "inner states of pleasure".
// Summary fixes: "In the 1970s" → 1790s (as in the passage); "at al times" → all.
const { mc, summary, ynng } = require('../../vr_build');
module.exports = {
  vol: 'cam13', book: 13, test: 4, part: 3, title: 'Book Review: The Happiness Industry', text: 't4p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['What is the reviewer’s attitude to advocates of positive psychology?', ['They are wrong to reject the ideas of Bentham.', 'They are over-influenced by their study of Bentham’s theories.', 'They have a fresh new approach to ideas on human happiness.', 'They are ignorant about the ideas they should be considering.']],
      ['The reviewer refers to the Greek philosopher Aristotle in order to suggest that happiness', ['may not be just pleasure and the absence of pain.', 'should not be the main goal of humans.', 'is not something that should be fought for.', 'is not just an abstract concept.']],
      ['According to Davies, Bentham’s suggestion for linking the price of goods to happiness was significant because', ['it was the first successful way of assessing happiness.', 'it established a connection between work and psychology.', 'it was the first successful example of psychological research.', 'it involved consideration of the rights of consumers.']],
    ]),
    summary(30, 34, 'Jeremy Bentham was active in other areas besides philosophy. In the 1790s he suggested a type of technology to improve __Q30__ for different Government departments. He developed a new way of printing banknotes to increase __Q31__ and also designed a method for the __Q32__ of food. He also drew up plans for a prison which allowed the __Q33__ of prisoners at all times, and believed the same design could be used for other institutions as well. When researching happiness, he investigated possibilities for its __Q34__, and suggested some methods of doing this.',
      ['measurement', 'security', 'implementation', 'profits', 'observation', 'communication', 'preservation'], { title: 'Jeremy Bentham' }),
    ynng(35, [
      'One strength of The Happiness Industry is its discussion of the relationship between psychology and economics.',
      'It is more difficult to measure some emotions than others.',
      'Watson’s ideas on behaviourism were supported by research on humans he carried out before 1915.',
      'Watson’s ideas have been most influential on governments outside America.',
      'The need for happiness is linked to industrialisation.',
      'A main aim of government should be to increase the happiness of the population.',
    ]),
  ],
  key: { 27: 'D', 28: 'A', 29: 'B', 30: 'communication', 31: 'security', 32: 'preservation', 33: 'observation', 34: 'measurement',
    35: 'YES', 36: 'NOT GIVEN', 37: 'NO', 38: 'NOT GIVEN', 39: 'YES', 40: 'NO' },
  expl: {
    27: ['Thái độ của người viết bài điểm sách đối với những người ủng hộ tâm lý học tích cực?', 'Đoạn 2–3',
      '“Those who think in this way are oblivious to the vast philosophical literature in which the meaning and value of happiness have been explored and questioned”',
      '“oblivious to” = không hề biết; người viết còn gọi họ “illiterate in the history of ideas” = thiếu hiểu biết về những tư tưởng lẽ ra phải xem xét → D'],
    28: ['Người viết nhắc tới Aristotle để gợi ý rằng hạnh phúc…', 'Đoạn 3', '“The Greek philosopher Aristotle may have identified happiness with self-realisation in the 4th century BC”',
      'Với Bentham hạnh phúc chỉ là niềm vui và không đau đớn; nhắc Aristotle (hạnh phúc = tự hoàn thiện) để cho thấy hạnh phúc có thể không chỉ là vậy → A'],
    29: ['Theo Davies, đề xuất của Bentham gắn giá hàng hóa với hạnh phúc quan trọng vì…', 'Đoạn 7',
      '“Bentham ‘set the stage for the entangling of psychological research and capitalism that would shape the business practices of the twentieth century’.”',
      'Gắn nghiên cứu tâm lý với chủ nghĩa tư bản/hoạt động kinh doanh = mối liên hệ giữa công việc và tâm lý → B'],
    30: ['Những năm 1790, ông đề xuất công nghệ cải thiện ___ giữa các bộ của chính phủ.', 'Đoạn 4',
      '“he wrote to the Home Office suggesting that the departments of government be linked together through a set of ‘conversation tubes’”', 'Ống truyền tiếng nói nối các bộ = cải thiện liên lạc → communication'],
    31: ['Cách in tiền giấy mới để tăng ___.', 'Đoạn 4', '“a design for a printing device that could produce unforgeable banknotes.”', '“unforgeable” = không làm giả được = tăng an ninh → security'],
    32: ['…và phương pháp ___ thực phẩm.', 'Đoạn 5', '“He drew up plans for a ‘frigidarium’ to keep provisions such as meat, fish, fruit and vegetables fresh.”', '“keep … fresh” = bảo quản → preservation'],
    33: ['Nhà tù cho phép ___ tù nhân mọi lúc.', 'Đoạn 5', '“while being visible at all times to the guards”', 'Lúc nào cũng bị lính canh nhìn thấy = quan sát → observation'],
    34: ['Khi nghiên cứu hạnh phúc, ông tìm cách ___ nó.', 'Đoạn 6', '“If happiness is to be regarded as a science, it has to be measured, and Bentham suggested two ways in which this might be done.”', 'Đề xuất hai cách đo lường hạnh phúc → measurement'],
    35: ['Một điểm mạnh của cuốn sách là bàn về quan hệ giữa tâm lý học và kinh tế.', 'Đoạn 8',
      '“We learn much that is interesting about how economic problems are being redefined and treated as psychological maladies.”', 'Người viết khen phần này “interesting” → YES'],
    36: ['Một số cảm xúc khó đo lường hơn những cảm xúc khác.', 'Đoạn 6–8', '“Viewing happiness as a complex of pleasurable sensations, he suggested that it might be quantified by measuring the human pulse rate.”',
      'Bài nói về các cách đo hạnh phúc nhưng không so sánh mức độ khó đo giữa các cảm xúc → NOT GIVEN'],
    37: ['Ý tưởng hành vi học của Watson được hỗ trợ bởi nghiên cứu trên người ông làm trước 1915.', 'Đoạn 9',
      '“he ‘had never even studied a single human being’: his research had been confined to experiments on white rats.”', 'Ông chưa từng nghiên cứu một con người nào, chỉ thí nghiệm trên chuột → NO'],
    38: ['Ý tưởng của Watson ảnh hưởng nhiều nhất tới chính phủ ngoài nước Mỹ.', 'Đoạn 9',
      '“Yet Watson’s reductive model is now widely applied, with ‘behaviour change’ becoming the goal of governments”', 'Chỉ nêu ví dụ nước Anh; không so sánh mức ảnh hưởng trong và ngoài nước Mỹ → NOT GIVEN'],
    39: ['Nhu cầu hạnh phúc gắn với công nghiệp hóa.', 'Đoạn 10', '“Modern industrial societies appear to need the possibility of ever-increasing happiness to motivate them in their labours.”', 'Xã hội công nghiệp cần hạnh phúc ngày càng tăng làm động lực → YES'],
    40: ['Mục tiêu chính của chính phủ là tăng hạnh phúc cho dân chúng.', 'Đoạn 10', '“the idea that governments should be responsible for promoting happiness is always a threat to human freedom.”', 'Người viết coi ý tưởng này là mối đe dọa tự do → NO'],
  },
};
