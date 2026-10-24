// Vol 6 - Read/R-TEST 2.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. Text = Full Reading.docx, checked
// against the PDF. Key = Read/expl 1-4.pdf: Q38–40 letters D, C, B do not fit the endings (the PDF list order is the same
// as here) and do not match the Vol's own explanations ("must assess the reliability", "requires further study") → set by the
// passage: Q38 F (validity of comments), Q39 B (presence = sense of belonging, not interaction), Q40 C (needs further study).
const { mc, ynng, endings } = require('../../vr_build');
module.exports = {
  vol: 6, test: 2, part: 3, title: 'The effectiveness of an online course', text: 't2p3.txt',
  groups: [
    mc(27, [
      ['Which of the following is mentioned in the article in relation to classroom-based learning?', [
        'the development of academic skills', 'the documenting of information', 'the completion of assignments',
        'the exchange of ideas']],
      ['Ruberg, Taylor and Moore point out that web-based learning requires learners to', [
        'think sequentially.', 'research different points of view.', 'limit their responses to other students.',
        'follow more than one discussion at a time.']],
      ['What problem did Sproull and Kiesler identify with online discussions?', [
        'Online discussions demand less attention than face-to-face ones.', 'Teachers have difficulty monitoring the length of comments.',
        'Face-to-face interactions between students are lost.', 'There is a delay in giving feedback to students.']],
      ['The writer refers to the concept of online presence as', [
        'listening to a discussion.', 'a feeling of being part of a group.', 'posting ideas on an electronic bulletin board.',
        'having a good relationship with other students.']],
      ['What was a focus of Anthony Picciano\'s study?', [
        'to examine the relationship between presence and course outcomes', 'to analyse the differences between online and class-based courses',
        'to examine the importance of being present in a classroom', 'to demonstrate that online courses are not generally effective']],
    ]),
    ynng(32, [
      'The ability of online courses to meet an individual participant\'s needs is unclear.',
      'Researchers caution against building strong online relationships.',
      'Common assumptions about the benefits of face-to-face courses have proved to be correct.',
      'The meaning of presence is still being clarified.',
      'Research on the impacts of interaction on learning outcomes has produced consistent results.',
    ]),
    endings(37, [
      'is dependent on adapting to unfamiliar interaction formats.',
      'is key in determining whether a student has a sense of belonging in a course.',
      'is a subject that the writer believes will require more study.',
      'is essential to excel in study and scholarship.',
      'is key in determining whether a student feels they have learned something from a course.',
      'is important for determining their validity.',
    ], [
      'The ability to succeed in an online course',
      'The need to be mindful of the source of comments in an online discussion',
      'In online courses, it is presence, rather than interaction, that',
      'The relationship between interaction and learning achievement',
    ]),
  ],
  key: { 27: 'D', 28: 'D', 29: 'D', 30: 'B', 31: 'A', 32: 'YES', 33: 'NOT GIVEN', 34: 'NO', 35: 'YES', 36: 'NO',
    37: 'A', 38: 'F', 39: 'B', 40: 'C' },
  expl: {
    27: ['Điều nào được nhắc đến liên quan tới việc học trên lớp?', 'Đoạn 2',
      '“Common elements for learning in a typical classroom environment are the social and communicative interactions between student and teacher, and student and student. The ability to ask a question, to share an opinion with a fellow student, or to disagree with the point of view in a reading assignment are all fundamental learning activities.”',
      'Hỏi, chia sẻ ý kiến, phản bác quan điểm = trao đổi ý tưởng (the exchange of ideas) → D'],
    28: ['Ruberg, Taylor và Moore chỉ ra rằng học qua web đòi hỏi người học phải …', 'Đoạn 3',
      '“students must adjust to the nonlinear nature of web-based learning. Typical face-to-face situations tend to be linear, focusing on a single discussion thread. Web-based learning sessions on an electronic bulletin board can have multiple threads with several discussions and interactions progressing simultaneously.”',
      'Nhiều luồng thảo luận diễn ra cùng lúc = follow more than one discussion at a time (A “think sequentially” là kiểu tuyến tính của lớp học trực tiếp) → D'],
    29: ['Sproull và Kiesler nêu ra vấn đề gì của thảo luận trực tuyến?', 'Đoạn 4',
      '“Sproull and Kiesler caution about discussions based on misinformation, that continue because online an instructor cannot necessarily immediately correct or clarify a comment.”',
      'Giáo viên không thể sửa hay làm rõ ngay lập tức = a delay in giving feedback → D'],
    30: ['Tác giả nói đến khái niệm “presence” trực tuyến là …', 'Đoạn 5–6',
      '“the concept of \'presence\', or a sense of being in a place and belonging to a group” … “The simplest definition of presence for an online course refers to a student\'s sense of being registered and belonging in a course”',
      '“sense of … belonging to a group / in a course” = a feeling of being part of a group → B'],
    31: ['Trọng tâm nghiên cứu của Anthony Picciano là gì?', 'Đoạn 8',
      '“An attempt was made to go beyond student perceptions of interaction and performance and to include perceptions of social presence, as well as actual participation in class activities. In addition, data was collected on performance measures that related specifically to course objectives.”',
      'Nghiên cứu xét cảm nhận về “social presence” và kết quả học tập theo mục tiêu khóa học = relationship between presence and course outcomes → A'],
    32: ['Khả năng của khóa học trực tuyến trong việc đáp ứng nhu cầu từng người học là chưa rõ.', 'Đoạn 1',
      '“the effectiveness of online courses, particularly in relation to individual student needs, perceptions, and student outcomes, is sometimes questioned.”',
      '“is sometimes questioned” (đôi khi bị nghi ngờ) = unclear → YES'],
    33: ['Các nhà nghiên cứu khuyên không nên xây dựng các mối quan hệ trực tuyến bền chặt.', 'Đoạn 3–4',
      '“some observers have cautioned that this is not always the case.” … “Sproull and Kiesler caution about discussions based on misinformation”',
      'Các nhà nghiên cứu chỉ cảnh báo về thông tin sai và quá tải thông tin, không nói gì về việc xây dựng quan hệ trực tuyến → NOT GIVEN'],
    34: ['Những giả định phổ biến về lợi ích của khóa học trực tiếp đã được chứng minh là đúng.', 'Đoạn 5',
      '“However, this is an assumption and not always true. For a variety of reasons, some students can also feel alienated in a face-to-face class and not feel part of a group.”',
      'Tác giả nói đó chỉ là giả định và “not always true” → NO'],
    35: ['Ý nghĩa của “presence” vẫn đang được làm rõ.', 'Đoạn 6',
      '“However, as this concept is studied, the definition is expanding and being refined to include telepresence, cognitive presence, social presence, teaching presence, and other forms of presence.”',
      '“the definition is expanding and being refined” = still being clarified → YES'],
    36: ['Nghiên cứu về tác động của tương tác lên kết quả học tập cho kết quả nhất quán.', 'Đoạn 8',
      '“the results of the study indicated that the relationship of actual measures of interaction and performance is mixed.”',
      '“mixed” (lẫn lộn) trái với “consistent” → NO'],
    37: ['Khả năng thành công trong một khóa học trực tuyến …', 'Đoạn 2–3',
      '“effective web-based learning requires adjustments on the part of students and teachers for successful interactions to occur” … “in order to interact successfully, students must adjust to the nonlinear nature of web-based learning.”',
      'Muốn thành công phải thích nghi với kiểu tương tác phi tuyến (mới lạ) = is dependent on adapting to unfamiliar interaction formats → A'],
    38: ['Sự cần thiết phải chú ý đến nguồn của các bình luận trong thảo luận trực tuyến …', 'Đoạn 4',
      '“students need to have the experience and knowledge base to sift through the discussion for misinformation.” … “students need to be more attentive to both the who and what of a comment.”',
      'Chú ý “who” (ai nói) để lọc ra thông tin sai = để xác định bình luận có đáng tin hay không → is important for determining their validity (file key của Vol ghi D nhưng giải thích “assess the reliability” = F) → F'],
    39: ['Trong khóa học trực tuyến, chính “presence” chứ không phải sự tương tác …', 'Đoạn 7',
      '“a distinction has been made between interaction and presence, emphasizing that they are not the same. Interaction may indicate presence but it is also possible for a student to interact by posting a message on an electronic bulletin board, while not necessarily feeling that he or she is part of a group or a class.”',
      'Có tương tác vẫn có thể không thấy mình thuộc về nhóm → presence mới quyết định cảm giác gắn bó = is key in determining whether a student has a sense of belonging in a course → B'],
    40: ['Mối quan hệ giữa tương tác và thành tích học tập …', 'Đoạn 8',
      '“However, how interaction affects learning outcomes and what the relationships between the two are, is in need of further study.”',
      '“is in need of further study” = is a subject that the writer believes will require more study (giải thích của Vol cũng là “requires further study”) → C'],
  },
};
