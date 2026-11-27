// Cambridge IELTS 18 - Test 3 - Passage 3. Source: ieltsworldly.com. Key checked against the passage: the page's key swaps Q34/Q35
// (B/E) — for the brightest pupils there is "small benefit" (34 = E brightest pupils), teachers' estimates are limited (35 = B lower expectations).
const { mc, summary, ynng } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 3, part: 3, title: 'The case for mixed-ability classes', text: 't3p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['The writer describes the Romeo and Juliet lesson in order to demonstrate', ['how few students are interested in literature.', 'how a teacher handles a range of learning needs.', 'how unsuitable Shakespeare is for most teenagers.', 'how weaker students can disrupt their classmates’ learning.']],
      ['What does the writer say about streaming in the third paragraph?', ['It has a very broad appeal.', 'It favours cleverer students.', 'It is relatively simple to implement.', 'It works better in some schools than others.']],
      ['What idea is suggested by the reference to Mount Qomolangma in the fifth paragraph?', ['students following unsuitable paths', 'students attempting interesting tasks', 'students not achieving their full potential', 'students not being aware of their limitations']],
      ['What does the word ‘scaffolding’ in the sixth paragraph refer to?', ['the factors which prevent a student from learning effectively', 'the environment where most of a student’s learning takes place', 'the assistance given to a student in their initial stages of learning', 'the setting of appropriate learning targets for a student’s aptitude']],
    ]),
    summary(31, 35, 'According to Professor John Hattie of the Melbourne Education Research Institute there is very little indication that streaming leads to __Q31__. He points out that, in schools which use streaming, the most significant impact is on those students placed in the __Q32__, especially where a large proportion of them have __Q33__. Meanwhile, for the __Q34__, there appears to be only minimal advantage. A further issue is that teachers tend to have __Q35__ of students in streamed groups.',
      ['wrong classes', 'lower expectations', 'average learners', 'bottom sets', 'brightest pupils', 'disadvantaged backgrounds', 'weaker students', 'higher achievements', 'positive impressions'], { title: 'Is streaming effective?' }),
    ynng(36, [
      'The Vygotsky model of education supports the concept of a mixed-ability class.',
      'Some teachers are uncertain about allowing students to take on MKO roles in the classroom.',
      'It can be rewarding to teach knowledge which you have only recently acquired.',
      'The priority should be to ensure that the highest-achieving students attain their goals.',
      'Taking part in collaborative outdoor activities with teachers and classmates can improve student outcomes in the classroom.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 36–40 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
  ],
  key: { 27: 'B', 28: 'A', 29: 'C', 30: 'C', 31: 'higher achievements', 32: 'bottom sets', 33: 'disadvantaged backgrounds', 34: 'brightest pupils', 35: 'lower expectations',
    36: 'NO', 37: 'NOT GIVEN', 38: 'YES', 39: 'NO', 40: 'NOT GIVEN' },
  expl: {
    27: ['Tác giả mô tả tiết học Romeo và Juliet để minh họa…', 'Đoạn 1', '“He’s given some of the students copies of No Fear Shakespeare, a kid-friendly translation of the original.”', 'Giáo viên đáp ứng nhiều trình độ khác nhau trong cùng lớp → B'],
    28: ['Tác giả nói gì về phân luồng ở đoạn 3?', 'Đoạn 3', '“The practice is intuitively appealing to almost every stakeholder.”', 'Hấp dẫn gần như mọi bên liên quan = được ưa chuộng rộng rãi → A'],
    29: ['Hình ảnh đỉnh Qomolangma gợi ý điều gì?', 'Đoạn 5', '“The brightest ones will never summit Mount Qomolangma”', 'Học sinh giỏi không bao giờ “lên đỉnh” = không phát huy hết tiềm năng → C'],
    30: ['Từ “scaffolding” ở đoạn 6 chỉ điều gì?', 'Đoạn 6', '“what they can achieve only with support – teachers, textbooks, work examples, parents and so on”', 'Sự hỗ trợ ban đầu, rồi dần rút đi đến khi tự chủ → C'],
    31: ['Hattie: rất ít dấu hiệu phân luồng dẫn tới ___.', 'Đoạn 7', '“tracking has minimal effects on learning outcomes”', 'Phân luồng gần như không cải thiện kết quả = không dẫn tới thành tích cao hơn → higher achievements'],
    32: ['Tác động lớn nhất là lên học sinh xếp vào ___.', 'Đoạn 7', '“streaming appears to significantly – and negatively – affect those students assigned to the lowest sets.”', '“lowest sets” = nhóm thấp nhất → bottom sets'],
    33: ['…nhất là khi phần lớn các em có ___.', 'Đoạn 7', '“These students tend to have much higher representation of low socioeconomic class.”', 'Tầng lớp kinh tế – xã hội thấp = hoàn cảnh khó khăn → disadvantaged backgrounds'],
    34: ['Trong khi với ___, lợi ích dường như rất nhỏ.', 'Đoạn 7', '“Less significant is the small benefit for those lucky clever students in the higher sets.”', 'Học sinh giỏi ở nhóm cao chỉ được lợi ít → brightest pupils'],
    35: ['Giáo viên thường có ___ với học sinh ở các nhóm phân luồng.', 'Đoạn 8', '“Streaming students by diagnosed achievement automatically limits what the teacher feels the student is capable of.”', 'Hạn chế điều giáo viên nghĩ học sinh làm được = kỳ vọng thấp hơn → lower expectations'],
    36: ['Mô hình của Vygotsky ủng hộ lớp học nhiều trình độ.', 'Đoạn 6', '“If we accept this model, it follows that streaming students with similar ZPDs would be an efficient and effective solution.”', 'Mô hình ZPD dẫn tới việc phân luồng, không phải lớp trộn → NO'],
    37: ['Một số giáo viên không chắc có nên để học sinh làm MKO.', 'Đoạn 9', '“the value of knowledgeable student peers must not go unrecognized either.”', 'Không nói thái độ của giáo viên khác → NOT GIVEN'],
    38: ['Dạy kiến thức mình vừa học được có thể rất bổ ích.', 'Đoạn 10', '“There is also something exciting about passing on skills and knowledge that you yourself have just mastered”', 'Có niềm vui, niềm tự hào khi truyền lại thứ mình vừa thành thạo → YES'],
    39: ['Ưu tiên phải là giúp học sinh giỏi nhất đạt mục tiêu.', 'Đoạn 11', '“we need the many to flourish – not suffer at the expense of a few bright stars.”', 'Số đông phải được phát triển, không hy sinh vì vài “ngôi sao” → NO'],
    40: ['Tham gia hoạt động ngoài trời cùng nhau có thể cải thiện kết quả học trên lớp.', 'Đoạn 11', '“Once a year, I go on a hike with my class, a mixed bunch of students.”', 'Chỉ kể chuyện đi bộ đường dài; không nói nó cải thiện kết quả học → NOT GIVEN'],
  },
};
