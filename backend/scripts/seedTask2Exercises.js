/**
 * Seed script for Task2Topic collection
 * 38 active topics across 18 weeks (7 essay types x 2 weeks x 2 topics, + 4 review weeks).
 * Regenerated 2026-08-26 from the live DB after the week-restructure migration
 * (each topic now has its own theme, 20 vocab terms, 20 questions) — this array
 * is the reproducibility snapshot; the live DB is authoritative going forward.
 * Run: node backend/scripts/seedTask2Exercises.js
 */
const topics = [
  {
    "week": 1,
    "block": "advantages_disadvantages",
    "topicName": "Technology in Education",
    "topicEmoji": "🖥️",
    "essayType": "advantages_disadvantages",
    "prompt": "Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?",
    "hintAdvantages": [
      "flexible schedule",
      "cost-effective",
      "accessible from anywhere"
    ],
    "hintDisadvantages": [
      "lack of face-to-face interaction",
      "lower motivation",
      "technical difficulties"
    ],
    "orderIndex": 1,
    "vocabularyList": [
      {
        "term": "online learning",
        "definitionVi": "học trực tuyến",
        "example": "Online learning offers students the flexibility to study at their own pace."
      },
      {
        "term": "in-person classes",
        "definitionVi": "lớp học trực tiếp",
        "example": "Many students prefer in-person classes for direct interaction with teachers."
      },
      {
        "term": "virtual classroom",
        "definitionVi": "lớp học ảo",
        "example": "In a virtual classroom, teachers and students connect through online platforms."
      },
      {
        "term": "distance education",
        "definitionVi": "giáo dục từ xa",
        "example": "Distance education opens doors for those who cannot attend school in person."
      },
      {
        "term": "blended learning",
        "definitionVi": "học tập kết hợp",
        "example": "Blended learning combines online instruction with face-to-face teaching."
      },
      {
        "term": "digital literacy",
        "definitionVi": "hiểu biết về công nghệ số",
        "example": "Digital literacy is now an essential skill for modern students."
      },
      {
        "term": "technological advancement",
        "definitionVi": "sự phát triển công nghệ",
        "example": "Technological advancement has transformed the way we learn and communicate."
      },
      {
        "term": "flexible schedule",
        "definitionVi": "lịch học linh hoạt",
        "example": "A flexible schedule is one of the biggest advantages of online learning."
      },
      {
        "term": "self-discipline",
        "definitionVi": "tính kỷ luật tự giác",
        "example": "Online learning requires strong self-discipline to stay on track."
      },
      {
        "term": "time management skills",
        "definitionVi": "kỹ năng quản lý thời gian",
        "example": "Good time management skills are crucial for success in online courses."
      },
      {
        "term": "learning outcomes",
        "definitionVi": "kết quả học tập",
        "example": "Research shows that learning outcomes can be lower in online environments."
      },
      {
        "term": "access to education",
        "definitionVi": "tiếp cận giáo dục",
        "example": "The internet expands access to education for people in remote areas."
      },
      {
        "term": "interactive platform",
        "definitionVi": "nền tảng tương tác",
        "example": "Interactive platforms like Zoom make online lessons more engaging."
      },
      {
        "term": "video conferencing",
        "definitionVi": "hội nghị trực tuyến",
        "example": "Teachers use video conferencing to deliver lessons to students across the country."
      },
      {
        "term": "recorded lectures",
        "definitionVi": "bài giảng được ghi lại",
        "example": "Students can review recorded lectures at any time that suits them."
      },
      {
        "term": "internet connectivity",
        "definitionVi": "kết nối Internet",
        "example": "Poor internet connectivity remains a major barrier to online learning."
      },
      {
        "term": "lack of face-to-face interaction",
        "definitionVi": "thiếu tương tác trực tiếp",
        "example": "A lack of face-to-face interaction can reduce student motivation."
      },
      {
        "term": "communication barriers",
        "definitionVi": "rào cản giao tiếp",
        "example": "Some students experience communication barriers when learning through a screen."
      },
      {
        "term": "motivation level",
        "definitionVi": "mức độ động lực",
        "example": "Students' motivation levels often drop when studying alone at home."
      },
      {
        "term": "learning environment",
        "definitionVi": "môi trường học tập",
        "example": "A positive learning environment encourages students to participate actively."
      },
      {
        "term": "academic performance",
        "definitionVi": "kết quả học tập",
        "example": "Poor motivation can negatively affect a student's academic performance."
      },
      {
        "term": "personalized learning",
        "definitionVi": "học tập cá nhân hóa",
        "example": "Technology allows for personalized learning tailored to each student's needs."
      },
      {
        "term": "technological difficulties",
        "definitionVi": "sự cố kỹ thuật",
        "example": "Technological difficulties can disrupt online lessons unexpectedly."
      },
      {
        "term": "social isolation",
        "definitionVi": "sự cô lập xã hội",
        "example": "Prolonged online study can lead to social isolation among students."
      },
      {
        "term": "cost-effective",
        "definitionVi": "tiết kiệm chi phí",
        "example": "Online courses are generally more cost-effective than traditional classroom-based learning."
      },
      {
        "term": "educational equality",
        "definitionVi": "bình đẳng giáo dục",
        "example": "Online learning has the potential to promote educational equality."
      },
      {
        "term": "access to global resources",
        "definitionVi": "tiếp cận tài nguyên toàn cầu",
        "example": "Students can gain access to global resources through digital learning platforms."
      },
      {
        "term": "teacher-student interaction",
        "definitionVi": "tương tác thầy trò",
        "example": "Strong teacher-student interaction is key to effective learning."
      },
      {
        "term": "traditional classroom setting",
        "definitionVi": "môi trường lớp học truyền thống",
        "example": "Some educators argue that the traditional classroom setting cannot be fully replaced."
      },
      {
        "term": "attention span",
        "definitionVi": "khả năng tập trung",
        "example": "Frequent device use may shorten students' attention span over time."
      },
      {
        "term": "bridge the gap",
        "definitionVi": "thu hẹp khoảng cách",
        "example": "Online learning has helped bridge the gap between rural and urban students' access to quality education."
      },
      {
        "term": "keep pace with",
        "definitionVi": "theo kịp",
        "example": "Traditional classrooms often struggle to keep pace with rapid technological change."
      },
      {
        "term": "foster independence",
        "definitionVi": "nuôi dưỡng tính độc lập",
        "example": "Distance learning platforms foster independence in young learners."
      },
      {
        "term": "tailor lessons to",
        "definitionVi": "điều chỉnh bài học cho phù hợp với",
        "example": "Adaptive software can tailor lessons to each student's pace."
      },
      {
        "term": "widen access to",
        "definitionVi": "mở rộng khả năng tiếp cận",
        "example": "Online courses widen access to higher education for working adults."
      },
      {
        "term": "compromise the quality of",
        "definitionVi": "làm giảm chất lượng của",
        "example": "Excessive screen time may compromise the quality of face-to-face learning."
      },
      {
        "term": "undermine student engagement",
        "definitionVi": "làm suy giảm sự hứng thú của học sinh",
        "example": "A lack of interaction can undermine student engagement in virtual classrooms."
      },
      {
        "term": "strike a balance between",
        "definitionVi": "cân bằng giữa",
        "example": "Educators must strike a balance between online and in-person instruction."
      },
      {
        "term": "equip students with",
        "definitionVi": "trang bị cho học sinh",
        "example": "Digital platforms equip students with skills needed for the modern workplace."
      },
      {
        "term": "hinder academic progress",
        "definitionVi": "cản trở sự tiến bộ học tập",
        "example": "Poor internet connectivity can hinder academic progress in remote areas."
      }
    ],
    "questions": [
      {
        "questionId": "w1t1_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đọc đề bài sau và cho biết đây là dạng essay nào?\n\n\"Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?\"",
        "options": [
          "Agree or Disagree",
          "Advantages & Disadvantages",
          "Discuss Both Views",
          "Cause & Solution"
        ],
        "baseWords": [],
        "correctAnswer": "Advantages & Disadvantages",
        "explanationVi": "Keyword \"advantages and disadvantages\" trong câu hỏi xác định ngay đây là dạng Advantages & Disadvantages. Dạng này yêu cầu phân tích cả hai mặt tích cực và tiêu cực một cách cân bằng.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w1t1_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu để hoàn chỉnh câu mở bài:\n\n\"In recent _____, online learning has become an increasingly prominent feature of modern education.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "years",
        "explanationVi": "Công thức mở bài chuẩn: 'In recent years...' — luôn dùng 'years' (số nhiều). Đây là cách bắt đầu essay học thuật rất phổ biến.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w1t1_q03",
        "level": "beginner",
        "type": "topic_sentence",
        "questionText": "Chọn Thesis Statement phù hợp nhất cho bài essay dạng Advantages & Disadvantages về online learning:",
        "options": [
          "Online learning is better than in-person classes.",
          "This essay will examine both the advantages and disadvantages of online learning.",
          "I strongly agree that online learning should replace traditional schools.",
          "The government should invest more in online education."
        ],
        "baseWords": [],
        "correctAnswer": "This essay will examine both the advantages and disadvantages of online learning.",
        "explanationVi": "Thesis statement của Advantages & Disadvantages essay phải nêu rõ bài sẽ phân tích CẢ HAI mặt. Các lựa chọn khác thể hiện lập trường một chiều, không phù hợp với dạng bài này.",
        "fallbackKeywords": [],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w1t1_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"online learning\"):\n\n\"Nhiều trường đại học đã bắt đầu cung cấp khóa học trực tuyến để sinh viên có thể học ở bất cứ đâu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many universities have started offering online learning courses so that students can study anywhere.",
        "explanationVi": "Cấu trúc 'so that + mệnh đề mục đích' diễn tả kết quả mong muốn. 'have started + V-ing' dùng Present Perfect để nhấn mạnh sự thay đổi gần đây.",
        "modelAnswer": "Many universities have started offering online learning courses so that students can study anywhere.",
        "fallbackKeywords": [
          "universities",
          "online learning",
          "courses",
          "students",
          "anywhere"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w1t1_q05",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"flexible schedule\"):\n\n\"Học trực tuyến mang lại lịch học linh hoạt cho người đi làm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online learning provides a flexible schedule for working adults.",
        "explanationVi": "'Provide + N + for + N' là cấu trúc diễn tả lợi ích. 'Working adults' = những người vừa đi làm vừa học.",
        "modelAnswer": "Online learning provides a flexible schedule for working adults.",
        "fallbackKeywords": [
          "online learning",
          "flexible schedule",
          "working adults"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w1t1_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"lack of face-to-face interaction\"):\n\n\"Học online có thể dẫn đến thiếu sự tương tác trực tiếp giữa học sinh và giáo viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online learning can lead to a lack of face-to-face interaction between students and teachers.",
        "explanationVi": "'Lead to + N' = dẫn đến. 'A lack of + N' = sự thiếu hụt của. Đây là cách diễn đạt nhược điểm rất chuẩn trong IELTS.",
        "modelAnswer": "Online learning can lead to a lack of face-to-face interaction between students and teachers.",
        "fallbackKeywords": [
          "online learning",
          "face-to-face",
          "interaction",
          "students",
          "teachers"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w1t1_q07",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"learning outcomes\"):\n\n\"Một số nghiên cứu cho thấy kết quả học tập của học sinh học online thấp hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some studies suggest that the learning outcomes of online students tend to be lower.",
        "explanationVi": "'Learning outcomes' = kết quả học tập (danh từ ghép). 'Suggest that + clause' = cho thấy rằng (học thuật hơn 'show'). 'Tend to be' = có xu hướng — nhận định dè dặt, phù hợp văn phong học thuật.",
        "modelAnswer": "Some studies suggest that the learning outcomes of online students tend to be lower.",
        "fallbackKeywords": [
          "learning outcomes",
          "studies",
          "online students",
          "lower"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w1t1_q08",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[of online learning / significant / One / advantages / of / the / most / is / its flexibility]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the most significant advantages of online learning is its flexibility.",
        "explanationVi": "Cấu trúc 'One of the most + adj + N + of + N + is + N' dùng để nhấn mạnh một điểm nổi bật nhất. 'Significant' = đáng kể, quan trọng.",
        "modelAnswer": "One of the most significant advantages of online learning is its flexibility.",
        "fallbackKeywords": [
          "significant",
          "advantages",
          "online learning",
          "flexibility"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w1t1_q09",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi ngữ pháp. Hãy sửa lại:\n\n\"Although online learning has many advantages, but it also has some disadvantages.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although online learning has many advantages, it also has some disadvantages.",
        "explanationVi": "Lỗi: Không dùng 'Although' và 'but' cùng lúc trong một câu. Chọn một: 'Although..., [no but]' hoặc '..., but...' (xóa Although).",
        "modelAnswer": "Although online learning has many advantages, it also has some disadvantages.",
        "fallbackKeywords": [
          "although",
          "online learning",
          "advantages",
          "disadvantages"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w1t1_q10",
        "level": "elementary",
        "type": "topic_sentence",
        "questionText": "Chọn topic sentence tốt nhất cho đoạn văn về ƯU ĐIỂM của online learning:",
        "options": [
          "Online learning is very popular nowadays.",
          "One of the main advantages of online learning is its flexibility and convenience.",
          "Online learning has some disadvantages that cannot be ignored.",
          "Many students prefer studying in traditional classrooms."
        ],
        "baseWords": [],
        "correctAnswer": "One of the main advantages of online learning is its flexibility and convenience.",
        "explanationVi": "Topic sentence phải nêu rõ luận điểm chính của đoạn. 'One of the main advantages' giới thiệu trực tiếp nội dung sẽ phân tích. Các lựa chọn khác quá chung chung hoặc lạc đề.",
        "fallbackKeywords": [],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w1t1_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"access to education\"):\n\n\"Internet giúp mở rộng cơ hội tiếp cận giáo dục cho người dân ở vùng xa.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The Internet helps expand access to education for people in remote areas.",
        "explanationVi": "'Expand access to + N' = mở rộng khả năng tiếp cận. 'Remote areas' = vùng sâu vùng xa. Đây là lập luận ủng hộ online learning rất thuyết phục.",
        "modelAnswer": "The Internet helps expand access to education for people in remote areas.",
        "fallbackKeywords": [
          "internet",
          "access",
          "education",
          "remote areas"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w1t1_q12",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Paraphrase câu sau (Gợi ý: dùng 'educational institutions', 'digital instruction', 'substitute for'):\n\n\"Many schools now offer online learning as an alternative to in-person classes.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.",
        "explanationVi": "Paraphrase tốt thay 'schools' → 'educational institutions', 'offer' → 'providing', 'alternative' → 'substitute', 'in-person' → 'face-to-face'. Không được giữ nguyên quá nhiều từ gốc.",
        "modelAnswer": "Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.",
        "fallbackKeywords": [
          "educational institutions",
          "digital",
          "substitute",
          "traditional",
          "teaching"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w1t1_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"interactive platform\"):\n\n\"Các nền tảng tương tác như Zoom hay Google Meet giúp lớp học online hiệu quả hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Interactive platforms such as Zoom or Google Meet help make online classes more effective.",
        "explanationVi": "'Interactive platform' = nền tảng tương tác. 'Such as' = ví dụ như — liệt kê ví dụ cụ thể. 'Help + bare infinitive' = giúp làm gì (không dùng 'to' sau 'help').",
        "modelAnswer": "Interactive platforms such as Zoom or Google Meet help make online classes more effective.",
        "fallbackKeywords": [
          "interactive platform",
          "Zoom",
          "Google Meet",
          "online classes",
          "effective"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w1t1_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"in-person classes\"):\n\n\"Một số người cho rằng lớp học trực tiếp giúp học sinh tương tác hiệu quả hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that in-person classes help students interact more effectively.",
        "explanationVi": "'In-person classes' = lớp học trực tiếp (đối lập với online). 'Argue that' = cho rằng, lập luận rằng — dùng khi trình bày quan điểm học thuật.",
        "modelAnswer": "Some people argue that in-person classes help students interact more effectively.",
        "fallbackKeywords": [
          "in-person classes",
          "students",
          "interact",
          "effectively"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w1t1_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"virtual classroom\"):\n\n\"Trong lớp học ảo, giáo viên và học sinh giao tiếp thông qua các nền tảng trực tuyến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In a virtual classroom, teachers and students communicate through online platforms.",
        "explanationVi": "'Virtual classroom' = lớp học ảo. 'Communicate through' = giao tiếp thông qua — dùng 'through' thay cho 'via' trong văn phong học thuật.",
        "modelAnswer": "In a virtual classroom, teachers and students communicate through online platforms.",
        "fallbackKeywords": [
          "virtual classroom",
          "teachers",
          "students",
          "communicate",
          "online platforms"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w1t1_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"distance education\"):\n\n\"Giáo dục từ xa tạo cơ hội cho những người không thể đến trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Distance education creates opportunities for those who are unable to attend school in person.",
        "explanationVi": "'Distance education' = giáo dục từ xa. 'Those who are unable to' = những người không thể — 'unable to' mang sắc thái chính thức hơn 'cannot'.",
        "modelAnswer": "Distance education creates opportunities for those who are unable to attend school in person.",
        "fallbackKeywords": [
          "distance education",
          "opportunities",
          "unable to attend",
          "in person"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w1t1_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"blended learning\"):\n\n\"Học kết hợp giúp cân bằng giữa sự linh hoạt và tương tác trực tiếp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Blended learning helps strike a balance between flexibility and face-to-face interaction.",
        "explanationVi": "'Blended learning' = học kết hợp online và offline. 'Strike a balance between A and B' = cân bằng giữa hai yếu tố — collocation cố định quan trọng.",
        "modelAnswer": "Blended learning helps strike a balance between flexibility and face-to-face interaction.",
        "fallbackKeywords": [
          "blended learning",
          "balance",
          "flexibility",
          "face-to-face interaction"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w1t1_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital literacy\"):\n\n\"Sinh viên cần có khả năng sử dụng công nghệ số để học hiệu quả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students need digital literacy skills to learn effectively in the modern era.",
        "explanationVi": "'Digital literacy' = khả năng hiểu biết và sử dụng công nghệ số. 'In the modern era' = trong thời đại hiện đại — thêm vào cuối câu để nâng tính học thuật.",
        "modelAnswer": "Students need digital literacy skills to learn effectively in the modern era.",
        "fallbackKeywords": [
          "digital literacy",
          "students",
          "skills",
          "effectively"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w1t1_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technological advancement\"):\n\n\"Sự phát triển của công nghệ hiện đại đã thay đổi cách chúng ta học tập.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Technological advancement has transformed the way we learn.",
        "explanationVi": "'Technological advancement' = sự tiến bộ công nghệ (học thuật hơn 'development'). 'Transform' mạnh hơn 'change' — thể hiện sự thay đổi sâu sắc.",
        "modelAnswer": "Technological advancement has transformed the way we learn.",
        "fallbackKeywords": [
          "technological advancement",
          "transformed",
          "the way we learn"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w1t1_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"self-discipline\"):\n\n\"Học online yêu cầu người học có tính kỷ luật tự giác cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online learning requires learners to have a high level of self-discipline.",
        "explanationVi": "'Require + O + to V' = yêu cầu ai làm gì. 'A high level of self-discipline' = mức độ tự giác cao — 'level of + noun' là cấu trúc hay dùng trong IELTS.",
        "modelAnswer": "Online learning requires learners to have a high level of self-discipline.",
        "fallbackKeywords": [
          "self-discipline",
          "online learning",
          "requires",
          "high level"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w1t1_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"time management skills\"):\n\n\"Học sinh cần rèn luyện kỹ năng quản lý thời gian để theo kịp tiến độ học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students need to develop time management skills to keep up with their studies.",
        "explanationVi": "'Time management skills' = kỹ năng quản lý thời gian. 'Keep up with' = theo kịp — phrasal verb quan trọng trong văn phong học thuật.",
        "modelAnswer": "Students need to develop time management skills to keep up with their studies.",
        "fallbackKeywords": [
          "time management skills",
          "develop",
          "keep up",
          "studies"
        ],
        "orderIndex": 22,
        "isActive": true
      },
      {
        "questionId": "w1t1_q23",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"internet connectivity\"):\n\n\"Ở một số vùng nông thôn, kết nối Internet vẫn là một thách thức lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In some rural areas, internet connectivity remains a significant challenge.",
        "explanationVi": "'Internet connectivity' = khả năng kết nối Internet. 'Remains' thay cho 'is still' — lịch sự và học thuật hơn. 'Significant challenge' = thách thức đáng kể.",
        "modelAnswer": "In some rural areas, internet connectivity remains a significant challenge.",
        "fallbackKeywords": [
          "internet connectivity",
          "rural areas",
          "remains",
          "significant challenge"
        ],
        "orderIndex": 23,
        "isActive": true
      }
    ]
  },
  {
    "week": 1,
    "block": "advantages_disadvantages",
    "topicName": "Mobile Devices and Communication",
    "topicEmoji": "📱",
    "essayType": "advantages_disadvantages",
    "prompt": "The widespread use of smartphones and tablets has changed the way people communicate. Do the advantages of this development outweigh the disadvantages?",
    "hintAdvantages": [
      "instant communication",
      "supports remote work",
      "access to information"
    ],
    "hintDisadvantages": [
      "addiction",
      "reduced face-to-face interaction",
      "health issues"
    ],
    "orderIndex": 2,
    "vocabularyList": [
      {
        "term": "widespread use",
        "definitionVi": "sự sử dụng rộng rãi",
        "example": "The widespread use of smartphones has changed how people communicate daily."
      },
      {
        "term": "digital devices",
        "definitionVi": "thiết bị kỹ thuật số",
        "example": "Many people now rely heavily on digital devices for work and communication."
      },
      {
        "term": "mobile technology",
        "definitionVi": "công nghệ di động",
        "example": "Mobile technology has made communication faster and more accessible."
      },
      {
        "term": "instant communication",
        "definitionVi": "giao tiếp tức thì",
        "example": "Thanks to the internet, instant communication is possible across the globe."
      },
      {
        "term": "social networking sites",
        "definitionVi": "trang mạng xã hội",
        "example": "Social networking sites connect millions of people around the world every day."
      },
      {
        "term": "virtual interaction",
        "definitionVi": "tương tác ảo",
        "example": "Many young people prefer virtual interaction over meeting in real life."
      },
      {
        "term": "face-to-face communication",
        "definitionVi": "giao tiếp trực tiếp",
        "example": "Face-to-face communication remains important for building meaningful relationships."
      },
      {
        "term": "digital addiction",
        "definitionVi": "nghiện công nghệ số",
        "example": "Excessive smartphone use can lead to digital addiction among teenagers."
      },
      {
        "term": "screen time",
        "definitionVi": "thời gian sử dụng màn hình",
        "example": "High screen time is associated with reduced physical activity and poor sleep."
      },
      {
        "term": "attention span",
        "definitionVi": "khả năng tập trung",
        "example": "Frequent phone use may shorten a person's attention span significantly."
      },
      {
        "term": "online messaging platforms",
        "definitionVi": "nền tảng nhắn tin trực tuyến",
        "example": "Online messaging platforms allow people to stay in touch with just a few taps."
      },
      {
        "term": "digital communication",
        "definitionVi": "giao tiếp kỹ thuật số",
        "example": "Although digital communication is convenient, it can weaken personal relationships."
      },
      {
        "term": "interpersonal relationships",
        "definitionVi": "mối quan hệ giữa người với người",
        "example": "Overuse of smartphones can damage interpersonal relationships."
      },
      {
        "term": "emotional connection",
        "definitionVi": "kết nối cảm xúc",
        "example": "Communication through screens often lacks genuine emotional connection."
      },
      {
        "term": "social isolation",
        "definitionVi": "sự cô lập xã hội",
        "example": "Many people feel social isolation despite being constantly online."
      },
      {
        "term": "overdependence on technology",
        "definitionVi": "phụ thuộc quá mức vào công nghệ",
        "example": "Overdependence on technology can reduce people's ability to solve problems independently."
      },
      {
        "term": "technological advancement",
        "definitionVi": "sự tiến bộ công nghệ",
        "example": "Technological advancement has made it easier than ever to stay connected."
      },
      {
        "term": "convenience and efficiency",
        "definitionVi": "sự tiện lợi và hiệu quả",
        "example": "Smartphones bring convenience and efficiency to both work and study."
      },
      {
        "term": "real-time information",
        "definitionVi": "thông tin theo thời gian thực",
        "example": "Smartphones allow us to access real-time information within seconds."
      },
      {
        "term": "online privacy",
        "definitionVi": "quyền riêng tư trực tuyến",
        "example": "Sharing personal data online raises serious concerns about online privacy."
      },
      {
        "term": "cyberbullying",
        "definitionVi": "bắt nạt trực tuyến",
        "example": "Cyberbullying through messaging apps is a growing problem among young users."
      },
      {
        "term": "digital etiquette",
        "definitionVi": "phép lịch sự trên mạng",
        "example": "Practising good digital etiquette is important when communicating online."
      },
      {
        "term": "social interaction",
        "definitionVi": "tương tác xã hội",
        "example": "Smartphones can both enhance and hinder social interaction."
      },
      {
        "term": "communication barriers",
        "definitionVi": "rào cản giao tiếp",
        "example": "Despite technology, language and cultural differences still create communication barriers."
      },
      {
        "term": "loss of personal touch",
        "definitionVi": "mất đi sự kết nối cá nhân",
        "example": "Digital messaging often results in a loss of personal touch compared to face-to-face talk."
      },
      {
        "term": "multitasking",
        "definitionVi": "đa nhiệm",
        "example": "Mobile technology enables multitasking but can also reduce focus and productivity."
      },
      {
        "term": "digital literacy",
        "definitionVi": "hiểu biết về công nghệ số",
        "example": "Digital literacy is essential for navigating the online world safely."
      },
      {
        "term": "mental well-being",
        "definitionVi": "sức khỏe tâm thần",
        "example": "Excessive screen time can have a negative impact on mental well-being."
      },
      {
        "term": "technological dependency",
        "definitionVi": "sự phụ thuộc vào công nghệ",
        "example": "Technological dependency is growing as people rely on devices for even basic tasks."
      },
      {
        "term": "improve connectivity",
        "definitionVi": "cải thiện khả năng kết nối",
        "example": "Mobile technology has helped improve connectivity in even the most remote regions."
      },
      {
        "term": "revolutionise the way",
        "definitionVi": "cách mạng hóa cách thức",
        "example": "Smartphones have revolutionised the way people stay in touch with friends and family."
      },
      {
        "term": "come at the cost of",
        "definitionVi": "phải trả giá bằng",
        "example": "Constant connectivity often comes at the cost of genuine face-to-face interaction."
      },
      {
        "term": "erode traditional values",
        "definitionVi": "làm xói mòn các giá trị truyền thống",
        "example": "Some critics argue that mobile culture is eroding traditional family values."
      },
      {
        "term": "foster a sense of connection",
        "definitionVi": "nuôi dưỡng cảm giác kết nối",
        "example": "Video calls foster a sense of connection between family members living apart."
      },
      {
        "term": "breed dependency",
        "definitionVi": "gây ra sự lệ thuộc",
        "example": "Constant notifications can breed dependency on mobile devices."
      },
      {
        "term": "blur the line between",
        "definitionVi": "làm mờ ranh giới giữa",
        "example": "Smartphones blur the line between work time and personal time."
      },
      {
        "term": "facilitate instant communication",
        "definitionVi": "tạo điều kiện cho giao tiếp tức thời",
        "example": "Messaging apps facilitate instant communication across different time zones."
      },
      {
        "term": "take a toll on",
        "definitionVi": "gây tổn hại đến",
        "example": "Excessive screen time can take a toll on users' mental health."
      },
      {
        "term": "stay connected with",
        "definitionVi": "duy trì kết nối với",
        "example": "Mobile devices allow people to stay connected with loved ones abroad."
      },
      {
        "term": "cultivate healthy habits",
        "definitionVi": "xây dựng thói quen lành mạnh",
        "example": "Parents should help children cultivate healthy habits around device use."
      }
    ],
    "questions": [
      {
        "questionId": "w1t2_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đọc đề bài: \"Do the advantages of this development outweigh the disadvantages?\" — Đây là dạng essay nào và yêu cầu gì?",
        "options": [
          "Bạn chỉ nêu ưu điểm",
          "Bạn đưa ra ý kiến xem ưu điểm hay nhược điểm nhiều hơn",
          "Bạn thảo luận cả hai quan điểm của người khác",
          "Bạn nêu nguyên nhân và giải pháp"
        ],
        "baseWords": [],
        "correctAnswer": "Bạn đưa ra ý kiến xem ưu điểm hay nhược điểm nhiều hơn",
        "explanationVi": "Câu hỏi 'Do the advantages outweigh?' yêu cầu bạn so sánh hai mặt và đưa ra ý kiến rõ ràng về bên nào nổi trội hơn. Đây là biến thể của Advantages & Disadvantages essay có kèm lập trường cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w1t2_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"The _____ use of smartphones has transformed the way people communicate with each other.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "widespread",
        "explanationVi": "'Widespread' = phổ biến rộng rãi. Cụm 'the widespread use of + N' là collocation học thuật quan trọng trong IELTS. Lấy trực tiếp từ đề bài — hãy học thuộc.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w1t2_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"instant communication\"):\n\n\"Nhờ có Internet, con người có thể giao tiếp tức thời dù ở bất kỳ đâu trên thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Thanks to the Internet, people can communicate instantly no matter where they are in the world.",
        "explanationVi": "'Thanks to + N' = nhờ có. 'No matter where' = dù ở bất kỳ đâu. 'Instantly' = tức thì — adverb quan trọng để mô tả giao tiếp qua smartphone.",
        "modelAnswer": "Thanks to the Internet, people can communicate instantly no matter where they are in the world.",
        "fallbackKeywords": [
          "internet",
          "communicate",
          "instantly",
          "world"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w1t2_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital addiction\"):\n\n\"Việc sử dụng điện thoại quá mức có thể dẫn đến nghiện công nghệ số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excessive use of smartphones can lead to digital addiction.",
        "explanationVi": "'Excessive use of' = việc sử dụng quá mức. 'Lead to + N' = dẫn đến. 'Digital addiction' là thuật ngữ học thuật phù hợp hơn 'phone addiction'.",
        "modelAnswer": "Excessive use of smartphones can lead to digital addiction.",
        "fallbackKeywords": [
          "excessive",
          "smartphones",
          "digital addiction"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w1t2_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"screen time\"):\n\n\"Trẻ em ngày nay có thời gian sử dụng thiết bị cao hơn bao giờ hết.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Children today have higher screen time than ever before.",
        "explanationVi": "'Screen time' = thời gian sử dụng màn hình. 'Than ever before' = hơn bao giờ hết — cụm so sánh nhấn mạnh xu hướng leo thang theo thời gian.",
        "modelAnswer": "Children today have higher screen time than ever before.",
        "fallbackKeywords": [
          "screen time",
          "children",
          "higher",
          "than ever before"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w1t2_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital communication\"):\n\n\"Dù giao tiếp kỹ thuật số tiện lợi, nó có thể làm suy yếu mối quan hệ cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although digital communication is convenient, it can weaken personal relationships.",
        "explanationVi": "'Digital communication' = giao tiếp kỹ thuật số. 'Although + clause, clause' = dù / mặc dù — nối hai ý tương phản. 'Weaken + N' = làm suy yếu — động từ mạnh, học thuật.",
        "modelAnswer": "Although digital communication is convenient, it can weaken personal relationships.",
        "fallbackKeywords": [
          "digital communication",
          "convenient",
          "weaken",
          "personal relationships"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w1t2_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[smartphones / Whilst / have / many advantages, / they / also / have / serious drawbacks]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Whilst smartphones have many advantages, they also have serious drawbacks.",
        "explanationVi": "'Whilst' = trong khi (formal hơn 'while'). 'Drawbacks' = nhược điểm (academic hơn 'disadvantages'). Cấu trúc 'Whilst X, Y' dùng để thể hiện sự tương phản.",
        "modelAnswer": "Whilst smartphones have many advantages, they also have serious drawbacks.",
        "fallbackKeywords": [
          "smartphones",
          "advantages",
          "drawbacks"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w1t2_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi ngữ pháp. Hãy sửa lại:\n\n\"Mobile technology makes people to communicate faster than before.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mobile technology makes people communicate faster than before.",
        "explanationVi": "Lỗi: Sau 'make + object' dùng bare infinitive (động từ nguyên thể không 'to'). Cấu trúc: 'make + O + V (bare)'. Không dùng 'to' sau 'make' theo nghĩa causative.",
        "modelAnswer": "Mobile technology makes people communicate faster than before.",
        "fallbackKeywords": [
          "mobile technology",
          "communicate",
          "faster"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w1t2_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"overdependence on technology\"):\n\n\"Con người ngày càng phụ thuộc quá mức vào công nghệ trong cuộc sống hàng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "People are increasingly showing overdependence on technology in their daily lives.",
        "explanationVi": "'Overdependence on + N' = sự phụ thuộc quá mức vào. 'Increasingly' = ngày càng (adverb nhấn mạnh xu hướng). Dùng Present Continuous nhấn mạnh xu hướng đang diễn ra.",
        "modelAnswer": "People are increasingly showing overdependence on technology in their daily lives.",
        "fallbackKeywords": [
          "overdependence",
          "technology",
          "daily lives",
          "increasingly"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w1t2_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Paraphrase câu sau (Gợi ý: dùng 'proliferation', 'mobile devices', 'transformed'):\n\n\"The widespread use of smartphones and tablets has changed the way people communicate.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.",
        "explanationVi": "'Proliferation' = sự phổ biến rộng rãi (thay 'widespread use'). 'Fundamentally transformed' = thay đổi căn bản (mạnh hơn 'changed'). 'Communication patterns' = mẫu giao tiếp.",
        "modelAnswer": "The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.",
        "fallbackKeywords": [
          "proliferation",
          "mobile devices",
          "transformed",
          "communication",
          "patterns"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w1t2_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"widespread use\"):\n\n\"Việc sử dụng rộng rãi điện thoại thông minh đã thay đổi cách con người giao tiếp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The widespread use of smartphones has changed the way people communicate.",
        "explanationVi": "'The widespread use of + N' = việc sử dụng rộng rãi của. Đây là cụm danh từ học thuật thường gặp trong mở bài IELTS.",
        "modelAnswer": "The widespread use of smartphones has changed the way people communicate.",
        "fallbackKeywords": [
          "widespread use",
          "smartphones",
          "communicate",
          "the way"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w1t2_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital devices\"):\n\n\"Nhiều người dành quá nhiều thời gian cho thiết bị kỹ thuật số như điện thoại và máy tính bảng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people spend too much time on digital devices such as smartphones and tablets.",
        "explanationVi": "'Digital devices' = thiết bị kỹ thuật số. 'Spend time on + N' = dành thời gian cho cái gì. 'Such as' = ví dụ như — liệt kê ví dụ cụ thể.",
        "modelAnswer": "Many people spend too much time on digital devices such as smartphones and tablets.",
        "fallbackKeywords": [
          "digital devices",
          "smartphones",
          "tablets",
          "too much time"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w1t2_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mobile technology\"):\n\n\"Công nghệ di động đã giúp việc liên lạc trở nên nhanh chóng và thuận tiện hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mobile technology has made communication faster and more convenient.",
        "explanationVi": "'Make + O + adjective' = làm cho cái gì trở nên như thế nào. 'Faster and more convenient' = so sánh hơn kết hợp hai tính từ cùng lúc.",
        "modelAnswer": "Mobile technology has made communication faster and more convenient.",
        "fallbackKeywords": [
          "mobile technology",
          "communication",
          "faster",
          "convenient"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w1t2_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social networking sites\"):\n\n\"Các trang mạng xã hội như Facebook hay Instagram kết nối hàng triệu người mỗi ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social networking sites such as Facebook and Instagram connect millions of people every day.",
        "explanationVi": "'Social networking sites' = trang mạng xã hội. 'Millions of people' = hàng triệu người — không dùng 'millions people'. 'Every day' ở cuối câu.",
        "modelAnswer": "Social networking sites such as Facebook and Instagram connect millions of people every day.",
        "fallbackKeywords": [
          "social networking sites",
          "Facebook",
          "Instagram",
          "connect",
          "millions"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w1t2_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"virtual interaction\"):\n\n\"Nhiều người trẻ ngày nay thích tương tác ảo hơn là gặp gỡ ngoài đời thật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many young people today prefer virtual interaction to meeting in real life.",
        "explanationVi": "'Prefer A to B' = thích A hơn B — không dùng 'prefer A than B'. 'Meeting in real life' dùng gerund làm tân ngữ sau giới từ 'to'.",
        "modelAnswer": "Many young people today prefer virtual interaction to meeting in real life.",
        "fallbackKeywords": [
          "virtual interaction",
          "young people",
          "prefer",
          "real life"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w1t2_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"face-to-face communication\"):\n\n\"Tuy nhiên, giao tiếp trực tiếp vẫn quan trọng trong việc xây dựng mối quan hệ sâu sắc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, face-to-face communication remains important for building deeper relationships.",
        "explanationVi": "'Remains important' = vẫn còn quan trọng — 'remain' + adjective. 'For building' = mục đích, dùng gerund sau giới từ 'for'.",
        "modelAnswer": "However, face-to-face communication remains important for building deeper relationships.",
        "fallbackKeywords": [
          "face-to-face communication",
          "remains",
          "important",
          "relationships"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w1t2_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social isolation\"):\n\n\"Nhiều người cảm thấy cô lập xã hội dù thường xuyên online.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people feel social isolation despite being constantly online.",
        "explanationVi": "'Social isolation' = sự cô lập xã hội. 'Despite + V-ing' = mặc dù — nhấn mạnh sự tương phản. 'Constantly online' = thường xuyên trực tuyến.",
        "modelAnswer": "Many people feel social isolation despite being constantly online.",
        "fallbackKeywords": [
          "social isolation",
          "online",
          "constantly",
          "feel"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w1t2_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"attention span\"):\n\n\"Việc sử dụng điện thoại thường xuyên có thể làm giảm khả năng tập trung.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Frequent use of smartphones can reduce one's attention span.",
        "explanationVi": "'Attention span' = khoảng thời gian tập trung. \"One's\" = của ai đó (đại từ sở hữu trung lập). 'Frequent use of' = việc sử dụng thường xuyên.",
        "modelAnswer": "Frequent use of smartphones can reduce one's attention span.",
        "fallbackKeywords": [
          "attention span",
          "frequent use",
          "smartphones",
          "reduce"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w1t2_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technological advancement\"):\n\n\"Sự tiến bộ công nghệ giúp con người kết nối nhanh chóng hơn bao giờ hết.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Technological advancement has enabled people to connect with each other faster than ever before.",
        "explanationVi": "'Technological advancement' = sự tiến bộ công nghệ. 'Enable + O + to + V' = cho phép/giúp ai làm gì. 'Than ever before' = hơn bao giờ hết — nhấn mạnh sự phát triển vượt bậc.",
        "modelAnswer": "Technological advancement has enabled people to connect with each other faster than ever before.",
        "fallbackKeywords": [
          "technological advancement",
          "connect",
          "faster",
          "than ever before"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w1t2_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"emotional connection\"):\n\n\"Giao tiếp qua màn hình thường thiếu đi sự kết nối cảm xúc thật sự.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Communication through screens often lacks a genuine emotional connection.",
        "explanationVi": "'Lacks + N' = thiếu cái gì (động từ, không phải 'lack of'). 'Genuine' = thật sự, chân thật — từ học thuật thể hiện mức độ sâu sắc của kết nối.",
        "modelAnswer": "Communication through screens often lacks a genuine emotional connection.",
        "fallbackKeywords": [
          "emotional connection",
          "screens",
          "lacks",
          "genuine"
        ],
        "orderIndex": 21,
        "isActive": true
      }
    ]
  },
  {
    "week": 2,
    "block": "advantages_disadvantages",
    "topicName": "Influence of Social Media",
    "topicEmoji": "📲",
    "essayType": "advantages_disadvantages",
    "prompt": "Social media is now used all over the world to stay in touch with other people and to get news updates. Do the benefits of this trend outweigh the drawbacks?",
    "hintAdvantages": [
      "fast updates",
      "diverse sources",
      "interactive"
    ],
    "hintDisadvantages": [
      "fake news",
      "bias",
      "lack of verification"
    ],
    "orderIndex": 3,
    "vocabularyList": [
      {
        "term": "social media platforms",
        "definitionVi": "nền tảng mạng xã hội",
        "example": "Social media platforms have become the main source of news for many people."
      },
      {
        "term": "news consumption",
        "definitionVi": "việc tiếp nhận tin tức",
        "example": "News consumption through social media is becoming increasingly common."
      },
      {
        "term": "reliable sources",
        "definitionVi": "nguồn đáng tin cậy",
        "example": "Not all information online comes from reliable sources."
      },
      {
        "term": "misinformation",
        "definitionVi": "thông tin sai lệch",
        "example": "Misinformation spreads rapidly on social media and can be difficult to correct."
      },
      {
        "term": "fake news",
        "definitionVi": "tin giả",
        "example": "Fake news has become a serious problem in the age of social media."
      },
      {
        "term": "media literacy",
        "definitionVi": "hiểu biết về truyền thông",
        "example": "Media literacy helps people identify fake news and evaluate sources critically."
      },
      {
        "term": "online journalism",
        "definitionVi": "báo chí trực tuyến",
        "example": "Online journalism allows news to be updated and shared in real time."
      },
      {
        "term": "citizen journalism",
        "definitionVi": "báo chí công dân",
        "example": "Citizen journalism empowers ordinary people to report on events in their communities."
      },
      {
        "term": "viral content",
        "definitionVi": "nội dung lan truyền nhanh",
        "example": "Viral content can spread false information to millions within hours."
      },
      {
        "term": "user-generated content",
        "definitionVi": "nội dung do người dùng tạo ra",
        "example": "Most information on social media is user-generated content, which may lack accuracy."
      },
      {
        "term": "breaking news",
        "definitionVi": "tin tức nóng hổi",
        "example": "Many people now turn to social media for breaking news before checking official sources."
      },
      {
        "term": "information overload",
        "definitionVi": "quá tải thông tin",
        "example": "Information overload on social media can make it hard to distinguish fact from fiction."
      },
      {
        "term": "credibility of news",
        "definitionVi": "độ tin cậy của tin tức",
        "example": "The credibility of news from social media is often lower than that from established outlets."
      },
      {
        "term": "spread of rumors",
        "definitionVi": "sự lan truyền tin đồn",
        "example": "The spread of rumors on social media can cause unnecessary panic."
      },
      {
        "term": "fact-checking",
        "definitionVi": "kiểm chứng thông tin",
        "example": "Fact-checking is essential before sharing any post on social media."
      },
      {
        "term": "digital platforms",
        "definitionVi": "nền tảng kỹ thuật số",
        "example": "Digital platforms have changed the way we access and share information."
      },
      {
        "term": "algorithm-driven content",
        "definitionVi": "nội dung được thuật toán điều hướng",
        "example": "Algorithm-driven content limits users' exposure to diverse viewpoints."
      },
      {
        "term": "echo chamber effect",
        "definitionVi": "hiệu ứng buồng vọng",
        "example": "The echo chamber effect causes people to only encounter ideas similar to their own."
      },
      {
        "term": "biased reporting",
        "definitionVi": "đưa tin thiên vị",
        "example": "Biased reporting on social media can distort public understanding of important issues."
      },
      {
        "term": "traditional media outlets",
        "definitionVi": "hãng truyền thông truyền thống",
        "example": "Traditional media outlets are more likely to verify information before publishing."
      },
      {
        "term": "accessibility of information",
        "definitionVi": "khả năng tiếp cận thông tin",
        "example": "Social media has greatly improved the accessibility of information for the general public."
      },
      {
        "term": "manipulation of public opinion",
        "definitionVi": "thao túng dư luận",
        "example": "The manipulation of public opinion through fake news is a growing global concern."
      },
      {
        "term": "news credibility",
        "definitionVi": "độ tin cậy của tin tức",
        "example": "News credibility is a major issue in the era of social media and user-generated content."
      },
      {
        "term": "clickbait headlines",
        "definitionVi": "tiêu đề câu view",
        "example": "Clickbait headlines attract clicks but often mislead readers about the actual content."
      },
      {
        "term": "freedom of expression",
        "definitionVi": "tự do ngôn luận",
        "example": "Social media has expanded freedom of expression but also spread harmful content."
      },
      {
        "term": "online engagement",
        "definitionVi": "tương tác trực tuyến",
        "example": "High online engagement does not always mean that the information being shared is accurate."
      },
      {
        "term": "digital misinformation",
        "definitionVi": "thông tin sai lệch kỹ thuật số",
        "example": "Digital misinformation poses a serious threat to public health and social stability."
      },
      {
        "term": "social awareness",
        "definitionVi": "nhận thức xã hội",
        "example": "Social media can raise social awareness about important global issues."
      },
      {
        "term": "information accuracy",
        "definitionVi": "độ chính xác của thông tin",
        "example": "Information accuracy should always be verified before it is shared online."
      },
      {
        "term": "the democratization of information",
        "definitionVi": "dân chủ hóa thông tin",
        "example": "The democratization of information allows everyone to share their views, for better or worse."
      },
      {
        "term": "shape public opinion",
        "definitionVi": "định hình dư luận",
        "example": "Social media platforms increasingly shape public opinion on major issues."
      },
      {
        "term": "distort the truth",
        "definitionVi": "bóp méo sự thật",
        "example": "Sensational headlines can distort the truth to attract more clicks."
      },
      {
        "term": "amplify misinformation",
        "definitionVi": "khuếch đại thông tin sai lệch",
        "example": "Algorithms can amplify misinformation faster than fact-checkers can respond."
      },
      {
        "term": "hold sources accountable",
        "definitionVi": "buộc nguồn tin phải chịu trách nhiệm",
        "example": "Traditional journalism holds sources accountable through rigorous editorial standards."
      },
      {
        "term": "foster critical thinking",
        "definitionVi": "nuôi dưỡng tư duy phản biện",
        "example": "Media literacy programmes foster critical thinking about online content."
      },
      {
        "term": "fall prey to",
        "definitionVi": "trở thành nạn nhân của",
        "example": "Many users fall prey to sensationalised or misleading headlines."
      },
      {
        "term": "verify the accuracy of",
        "definitionVi": "kiểm chứng tính chính xác của",
        "example": "Readers should verify the accuracy of a story before sharing it."
      },
      {
        "term": "gain traction rapidly",
        "definitionVi": "nhanh chóng lan truyền, được chú ý",
        "example": "False stories can gain traction rapidly before being debunked."
      },
      {
        "term": "provide a platform for",
        "definitionVi": "cung cấp một nền tảng cho",
        "example": "Social media provides a platform for ordinary citizens to report breaking news."
      },
      {
        "term": "reinforce existing beliefs",
        "definitionVi": "củng cố những niềm tin sẵn có",
        "example": "Personalised algorithms tend to reinforce existing beliefs rather than challenge them."
      }
    ],
    "questions": [
      {
        "questionId": "w2t3_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Từ khóa nào trong đề bài xác định đây là dạng Advantages & Disadvantages?\n\n\"Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?\"",
        "options": [
          "social media platforms",
          "major source of news",
          "advantages and disadvantages",
          "relying on social media"
        ],
        "baseWords": [],
        "correctAnswer": "advantages and disadvantages",
        "explanationVi": "Keyword 'advantages and disadvantages' trực tiếp xác định dạng bài. Đây là dấu hiệu rõ ràng nhất — khi thấy cụm này, lập tức biết cần phân tích cả hai mặt cân bằng.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w2t3_q02",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"fake news\"):\n\n\"Nhiều người dễ bị lừa bởi tin giả đang lan truyền trên Internet.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people are easily deceived by fake news spreading on the Internet.",
        "explanationVi": "'Be deceived by' = bị lừa bởi (passive voice). 'Spreading on the Internet' là participle phrase mô tả fake news. Câu này thể hiện nhược điểm quan trọng của mạng xã hội.",
        "modelAnswer": "Many people are easily deceived by fake news spreading on the Internet.",
        "fallbackKeywords": [
          "fake news",
          "deceived",
          "internet",
          "spreading"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w2t3_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"breaking news\"):\n\n\"Nhiều người hiện nay thường đọc tin tức nóng trên Facebook hoặc Twitter thay vì xem TV.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people now read breaking news on Facebook or Twitter instead of watching TV.",
        "explanationVi": "'Breaking news' = tin tức nóng hổi. 'Instead of + V-ing' = thay vì làm gì. Đây là ưu điểm của mạng xã hội: cập nhật tin tức nhanh chóng.",
        "modelAnswer": "Many people now read breaking news on Facebook or Twitter instead of watching TV.",
        "fallbackKeywords": [
          "breaking news",
          "facebook",
          "twitter",
          "television"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w2t3_q04",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"fact-checking\"):\n\n\"Việc kiểm chứng thông tin là rất quan trọng trước khi chia sẻ bất kỳ bài đăng nào trên mạng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Fact-checking is very important before sharing any post online.",
        "explanationVi": "'Fact-checking' = kiểm chứng thông tin (danh động từ làm chủ ngữ). 'Before + V-ing' = trước khi làm gì. Đây là giải pháp cho vấn đề tin giả.",
        "modelAnswer": "Fact-checking is very important before sharing any post online.",
        "fallbackKeywords": [
          "fact-checking",
          "important",
          "sharing",
          "online"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w2t3_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"online journalism\"):\n\n\"Báo chí trực tuyến giúp tin tức được cập nhật nhanh chóng hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online journalism allows news to be updated more quickly.",
        "explanationVi": "'Online journalism' = báo chí trực tuyến. 'Allow + O + to + V' = cho phép / giúp. 'Be updated' = được cập nhật — passive infinitive nhấn mạnh tính kịp thời của tin tức.",
        "modelAnswer": "Online journalism allows news to be updated more quickly.",
        "fallbackKeywords": [
          "online journalism",
          "news",
          "updated",
          "quickly"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w2t3_q06",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Social media has become one of the most popular source of news today.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social media has become one of the most popular sources of news today.",
        "explanationVi": "Lỗi: Sau 'one of the most + adj' phải dùng danh từ số NHIỀU. 'Source' → 'sources'. Cấu trúc: 'one of the + superlative + plural noun'.",
        "modelAnswer": "Social media has become one of the most popular sources of news today.",
        "fallbackKeywords": [
          "social media",
          "popular",
          "sources",
          "news"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w2t3_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"manipulation of public opinion\"):\n\n\"Sự thao túng dư luận qua tin giả đang trở thành một vấn đề nghiêm trọng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The manipulation of public opinion through fake news is becoming a serious problem.",
        "explanationVi": "'The manipulation of + N' = sự thao túng của. Present Continuous 'is becoming' nhấn mạnh xu hướng đang gia tăng. 'Public opinion' = dư luận xã hội.",
        "modelAnswer": "The manipulation of public opinion through fake news is becoming a serious problem.",
        "fallbackKeywords": [
          "manipulation",
          "public opinion",
          "fake news",
          "serious"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w2t3_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"the democratization of information\"):\n\n\"Mạng xã hội góp phần vào dân chủ hóa thông tin, giúp mọi người dễ dàng chia sẻ quan điểm của mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social media contributes to the democratization of information, enabling everyone to share their views easily.",
        "explanationVi": "'Contribute to + N' = góp phần vào. 'The democratization of information' = dân chủ hóa thông tin. Participle phrase 'enabling...' bổ nghĩa thêm hệ quả tích cực.",
        "modelAnswer": "Social media contributes to the democratization of information, enabling everyone to share their views easily.",
        "fallbackKeywords": [
          "democratization",
          "information",
          "share",
          "views",
          "easily"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w2t3_q09",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Paraphrase câu sau (Gợi ý: dùng 'online networking sites', 'primary channel', 'current events'):\n\n\"Social media platforms have become a major source of news and information.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.",
        "explanationVi": "Thay 'social media platforms' → 'online networking sites', 'major source' → 'primary channel', 'news' → 'current events', 'information' → 'knowledge'. 'Have emerged as' = đã nổi lên thành.",
        "modelAnswer": "Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.",
        "fallbackKeywords": [
          "networking sites",
          "primary channel",
          "public",
          "current events",
          "knowledge"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w2t3_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social media platforms\"):\n\n\"Ngày nay, các nền tảng mạng xã hội đã trở thành nguồn tin tức chính của nhiều người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Nowadays, social media platforms have become the primary source of news for many people.",
        "explanationVi": "'Social media platforms' = nền tảng mạng xã hội. 'Have become' = Present Perfect nhấn mạnh sự thay đổi đến hiện tại. 'Primary source' = nguồn chính — formal hơn 'main source'.",
        "modelAnswer": "Nowadays, social media platforms have become the primary source of news for many people.",
        "fallbackKeywords": [
          "social media platforms",
          "primary source",
          "news",
          "many people"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w2t3_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"news consumption\"):\n\n\"Việc tiếp nhận tin tức qua mạng xã hội đang ngày càng phổ biến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "News consumption through social media is becoming increasingly common.",
        "explanationVi": "'News consumption' = việc tiêu thụ/đọc tin tức. 'Is becoming increasingly' = đang ngày càng trở nên (Present Continuous + adverb).",
        "modelAnswer": "News consumption through social media is becoming increasingly common.",
        "fallbackKeywords": [
          "news consumption",
          "social media",
          "increasingly common"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w2t3_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"reliable sources\"):\n\n\"Không phải tất cả thông tin trên mạng đều đến từ nguồn tin đáng tin cậy.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not all information online comes from reliable sources.",
        "explanationVi": "'Reliable sources' = nguồn đáng tin cậy. 'Not all + N + V' = không phải tất cả đều... — cấu trúc phủ định từng phần quan trọng trong IELTS.",
        "modelAnswer": "Not all information online comes from reliable sources.",
        "fallbackKeywords": [
          "reliable sources",
          "not all",
          "information online"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w2t3_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"misinformation\"):\n\n\"Một trong những vấn đề lớn nhất của mạng xã hội là sự lan truyền của thông tin sai lệch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the biggest problems with social media is the spread of misinformation.",
        "explanationVi": "'Misinformation' = thông tin sai lệch (không cố ý). 'One of the biggest problems with X' = một trong những vấn đề lớn nhất của X — cấu trúc diễn đạt nhược điểm.",
        "modelAnswer": "One of the biggest problems with social media is the spread of misinformation.",
        "fallbackKeywords": [
          "misinformation",
          "social media",
          "spread",
          "biggest problems"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w2t3_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"media literacy\"):\n\n\"Học sinh cần được dạy kỹ năng hiểu biết truyền thông để phân biệt tin thật và tin giả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students need to be taught media literacy skills to distinguish real news from fake news.",
        "explanationVi": "'Media literacy' = khả năng hiểu và đánh giá thông tin truyền thông. 'Need to be taught' = passive infinitive — nhấn mạnh hành động giảng dạy từ phía nhà trường.",
        "modelAnswer": "Students need to be taught media literacy skills to distinguish real news from fake news.",
        "fallbackKeywords": [
          "media literacy",
          "students",
          "distinguish",
          "fake news"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w2t3_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"citizen journalism\"):\n\n\"Nhiều người dân hiện nay tham gia vào báo chí công dân bằng cách đăng video hoặc bài viết về sự kiện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people now participate in citizen journalism by posting videos or articles about events.",
        "explanationVi": "'Citizen journalism' = báo chí công dân. 'By + V-ing' = bằng cách làm gì — cấu trúc diễn đạt phương tiện/phương cách.",
        "modelAnswer": "Many people now participate in citizen journalism by posting videos or articles about events.",
        "fallbackKeywords": [
          "citizen journalism",
          "participate",
          "posting",
          "videos",
          "articles"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w2t3_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"information overload\"):\n\n\"Người dùng có thể bị choáng ngợp vì quá tải thông tin trên mạng xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Users can be overwhelmed by information overload on social media.",
        "explanationVi": "'Information overload' = quá tải thông tin (compound noun). 'Be overwhelmed by' = bị choáng ngợp bởi — passive voice nhấn mạnh trạng thái bị động của người dùng.",
        "modelAnswer": "Users can be overwhelmed by information overload on social media.",
        "fallbackKeywords": [
          "information overload",
          "overwhelmed",
          "users",
          "social media"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w2t3_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"credibility of news\"):\n\n\"Độ tin cậy của các bài đăng thường thấp hơn độ tin cậy của tin tức từ các hãng truyền thông lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The credibility of social media posts is often lower than that of news from major media outlets.",
        "explanationVi": "'That of' thay thế cho danh từ đã đề cập trước đó (the credibility of). 'Media outlets' = hãng truyền thông — học thuật hơn 'media companies'.",
        "modelAnswer": "The credibility of social media posts is often lower than that of news from major media outlets.",
        "fallbackKeywords": [
          "credibility",
          "social media posts",
          "media outlets",
          "lower"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w2t3_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"algorithm-driven content\"):\n\n\"Các thuật toán điều hướng nội dung khiến người dùng chỉ thấy những gì họ muốn thấy.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.",
        "explanationVi": "'Algorithm-driven content' = nội dung được thuật toán điều hướng. Mệnh đề bổ nghĩa 'limiting their exposure...' = participle clause nêu hệ quả tiêu cực.",
        "modelAnswer": "Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.",
        "fallbackKeywords": [
          "algorithm-driven content",
          "users",
          "limiting",
          "diverse perspectives"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w2t3_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"echo chamber effect\"):\n\n\"Hiệu ứng buồng vọng có thể khiến người dùng chỉ nghe những ý kiến giống mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The echo chamber effect can cause users to only encounter opinions that mirror their own.",
        "explanationVi": "'Echo chamber effect' = hiệu ứng buồng vọng. 'Mirror their own' = phản chiếu quan điểm của họ — 'mirror' dùng làm động từ.",
        "modelAnswer": "The echo chamber effect can cause users to only encounter opinions that mirror their own.",
        "fallbackKeywords": [
          "echo chamber effect",
          "users",
          "opinions",
          "mirror"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 2,
    "block": "advantages_disadvantages",
    "topicName": "Wearable Health Technologies & AI Smart Devices",
    "topicEmoji": "⌚",
    "essayType": "advantages_disadvantages",
    "prompt": "Nowadays, an increasing number of people use smartwatches and health-tracking applications to monitor their daily physical condition. Do the advantages of this trend outweigh the disadvantages?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 28,
    "vocabularyList": [
      {
        "term": "wearable technology",
        "definitionVi": "công nghệ đeo được",
        "example": "Wearable technology allows users to track their health data throughout the day."
      },
      {
        "term": "health-tracking application",
        "definitionVi": "ứng dụng theo dõi sức khỏe",
        "example": "Health-tracking applications record steps, heart rate, and sleep patterns."
      },
      {
        "term": "physical condition",
        "definitionVi": "tình trạng thể chất",
        "example": "Smartwatches help users monitor their physical condition in real time."
      },
      {
        "term": "real-time data",
        "definitionVi": "dữ liệu theo thời gian thực",
        "example": "Real-time data allows users to react quickly to unusual health signals."
      },
      {
        "term": "heart rate monitor",
        "definitionVi": "máy đo nhịp tim",
        "example": "A heart rate monitor can alert users to irregular heartbeats."
      },
      {
        "term": "sedentary behaviour",
        "definitionVi": "lối sống ít vận động",
        "example": "Smartwatches can remind users to stand up and avoid sedentary behaviour."
      },
      {
        "term": "health awareness",
        "definitionVi": "nhận thức về sức khỏe",
        "example": "Wearable devices have raised health awareness among the general public."
      },
      {
        "term": "data privacy",
        "definitionVi": "quyền riêng tư dữ liệu",
        "example": "Storing personal health data on smartwatches raises data privacy concerns."
      },
      {
        "term": "overreliance on technology",
        "definitionVi": "sự phụ thuộc quá mức vào công nghệ",
        "example": "Overreliance on technology may cause users to ignore their own bodily signals."
      },
      {
        "term": "early diagnosis",
        "definitionVi": "chẩn đoán sớm",
        "example": "Wearable devices can support the early diagnosis of certain health conditions."
      },
      {
        "term": "inaccurate readings",
        "definitionVi": "kết quả đo không chính xác",
        "example": "Inaccurate readings from cheap devices could mislead users about their health."
      },
      {
        "term": "health anxiety",
        "definitionVi": "lo âu về sức khỏe",
        "example": "Constant health monitoring can trigger unnecessary health anxiety."
      },
      {
        "term": "sleep pattern",
        "definitionVi": "chu kỳ giấc ngủ",
        "example": "Tracking sleep patterns helps users identify poor sleeping habits."
      },
      {
        "term": "fitness goal",
        "definitionVi": "mục tiêu thể lực",
        "example": "Smartwatches motivate users to reach their daily fitness goals."
      },
      {
        "term": "battery dependency",
        "definitionVi": "sự phụ thuộc vào pin",
        "example": "Battery dependency means the device is useless once it runs out of charge."
      },
      {
        "term": "healthcare cost",
        "definitionVi": "chi phí chăm sóc sức khỏe",
        "example": "Early detection through wearables may help reduce long-term healthcare costs."
      },
      {
        "term": "personalised feedback",
        "definitionVi": "phản hồi cá nhân hóa",
        "example": "Health apps provide personalised feedback based on the user's daily activity."
      },
      {
        "term": "screen dependency",
        "definitionVi": "sự phụ thuộc vào màn hình",
        "example": "Constantly checking a smartwatch screen can increase screen dependency."
      },
      {
        "term": "chronic illness",
        "definitionVi": "bệnh mãn tính",
        "example": "Wearable devices can help patients manage chronic illnesses more effectively."
      },
      {
        "term": "digital health record",
        "definitionVi": "hồ sơ sức khỏe điện tử",
        "example": "Data from wearables can be stored as part of a digital health record."
      },
      {
        "term": "empower individuals to",
        "definitionVi": "trao quyền cho các cá nhân để",
        "example": "Wearable devices empower individuals to take control of their own health."
      },
      {
        "term": "raise red flags",
        "definitionVi": "đưa ra cảnh báo, dấu hiệu bất thường",
        "example": "Abnormal heart rate readings can raise red flags for underlying conditions."
      },
      {
        "term": "streamline the process of",
        "definitionVi": "đơn giản hóa quy trình",
        "example": "Health apps streamline the process of tracking daily physical activity."
      },
      {
        "term": "foster a culture of",
        "definitionVi": "xây dựng một văn hóa về",
        "example": "Fitness trackers foster a culture of proactive health management."
      },
      {
        "term": "come with certain risks",
        "definitionVi": "đi kèm với những rủi ro nhất định",
        "example": "Relying on wearable data comes with certain risks, such as inaccurate readings."
      },
      {
        "term": "generate false alarms",
        "definitionVi": "tạo ra những cảnh báo sai",
        "example": "Overly sensitive sensors can generate false alarms that cause unnecessary worry."
      },
      {
        "term": "safeguard personal information",
        "definitionVi": "bảo vệ thông tin cá nhân",
        "example": "Manufacturers must safeguard personal information collected by health apps."
      },
      {
        "term": "promote proactive healthcare",
        "definitionVi": "thúc đẩy chăm sóc sức khỏe chủ động",
        "example": "Continuous monitoring can promote proactive healthcare rather than reactive treatment."
      },
      {
        "term": "place excessive trust in",
        "definitionVi": "đặt quá nhiều niềm tin vào",
        "example": "Users should not place excessive trust in unverified health readings."
      },
      {
        "term": "integrate seamlessly into",
        "definitionVi": "tích hợp liền mạch vào",
        "example": "Modern wearables integrate seamlessly into users' daily routines."
      }
    ],
    "questions": [
      {
        "questionId": "w2wh_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Do the advantages of this trend outweigh the disadvantages?\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Advantages & Disadvantages",
          "Cause & Effect",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Advantages & Disadvantages",
        "explanationVi": "Cụm 'Do the advantages... outweigh the disadvantages?' là một biến thể của dạng Advantages & Disadvantages — vẫn cần phân tích cả hai mặt trước khi kết luận bên nào trội hơn.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w2wh_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Nowadays, an increasing number of people use smartwatches and health-tracking applications to _____ their daily physical condition.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "monitor",
        "explanationVi": "'Monitor + N' = theo dõi. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w2wh_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày càng nhiều người sử dụng đồng hồ thông minh để theo dõi tình trạng sức khỏe hằng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An increasing number of people use smartwatches to monitor their daily health condition.",
        "explanationVi": "'An increasing number of people' = ngày càng nhiều người — cấu trúc mở bài phổ biến. 'Monitor + N' = theo dõi.",
        "modelAnswer": "An increasing number of people use smartwatches to monitor their daily health condition.",
        "fallbackKeywords": [
          "increasing number",
          "smartwatches",
          "monitor"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w2wh_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi cho rằng lợi ích của xu hướng này vượt trội hơn hẳn so với những hạn chế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe the benefits of this trend clearly outweigh its drawbacks.",
        "explanationVi": "'Outweigh + N' = vượt trội hơn, lấn át. Đây là câu nêu quan điểm chuẩn cho dạng 'outweigh' essay.",
        "modelAnswer": "I believe the benefits of this trend clearly outweigh its drawbacks.",
        "fallbackKeywords": [
          "benefits",
          "outweigh",
          "drawbacks"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w2wh_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các ứng dụng theo dõi sức khỏe có thể giúp phát hiện sớm một số vấn đề y tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Health-tracking applications can help detect certain medical problems early.",
        "explanationVi": "'Health-tracking application' = ứng dụng theo dõi sức khỏe. 'Detect + N + early' = phát hiện sớm.",
        "modelAnswer": "Health-tracking applications can help detect certain medical problems early.",
        "fallbackKeywords": [
          "health-tracking applications",
          "detect",
          "early"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w2wh_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc lưu trữ dữ liệu sức khỏe cá nhân trên các thiết bị này làm dấy lên lo ngại về quyền riêng tư.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Storing personal health data on these devices raises concerns about privacy.",
        "explanationVi": "'Raise concerns about' = làm dấy lên lo ngại về. 'Personal health data' = dữ liệu sức khỏe cá nhân.",
        "modelAnswer": "Storing personal health data on these devices raises concerns about privacy.",
        "fallbackKeywords": [
          "personal health data",
          "raises concerns",
          "privacy"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w2wh_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[can / from cheap devices / mislead users / Inaccurate readings / about their health]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Inaccurate readings from cheap devices can mislead users about their health.",
        "explanationVi": "'Inaccurate readings' = kết quả đo không chính xác. 'Mislead + O + about + N' = khiến ai hiểu sai về điều gì.",
        "modelAnswer": "Inaccurate readings from cheap devices can mislead users about their health.",
        "fallbackKeywords": [
          "inaccurate readings",
          "mislead users"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w2wh_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Smartwatches can helps users stay motivated to reach their fitness goals.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Smartwatches can help users stay motivated to reach their fitness goals.",
        "explanationVi": "Lỗi: Sau modal verb 'can' KHÔNG chia động từ. Cấu trúc: 'can + bare infinitive' → 'help', không phải 'helps'.",
        "modelAnswer": "Smartwatches can help users stay motivated to reach their fitness goals.",
        "fallbackKeywords": [
          "smartwatches",
          "help users",
          "fitness goals"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w2wh_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sedentary behaviour\"):\n\n\"Đồng hồ thông minh có thể nhắc người dùng đứng dậy để tránh lối sống ít vận động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Smartwatches can remind users to stand up in order to avoid sedentary behaviour.",
        "explanationVi": "'Sedentary behaviour' = lối sống ít vận động. 'Remind + O + to V' = nhắc ai làm gì.",
        "modelAnswer": "Smartwatches can remind users to stand up in order to avoid sedentary behaviour.",
        "fallbackKeywords": [
          "sedentary behaviour",
          "remind users",
          "stand up"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w2wh_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"health awareness\"):\n\n\"Các thiết bị đeo thông minh đã góp phần nâng cao nhận thức về sức khỏe trong cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Wearable devices have helped raise health awareness among the public.",
        "explanationVi": "'Raise awareness' = nâng cao nhận thức. 'Health awareness' = nhận thức về sức khỏe.",
        "modelAnswer": "Wearable devices have helped raise health awareness among the public.",
        "fallbackKeywords": [
          "wearable devices",
          "health awareness",
          "public"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w2wh_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"overreliance on technology\"):\n\n\"Sự phụ thuộc quá mức vào công nghệ có thể khiến người dùng bỏ qua các tín hiệu tự nhiên của cơ thể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overreliance on technology may cause users to ignore their body's natural signals.",
        "explanationVi": "'Overreliance on + N' = sự phụ thuộc quá mức vào. 'Cause + O + to V' = khiến ai làm gì.",
        "modelAnswer": "Overreliance on technology may cause users to ignore their body's natural signals.",
        "fallbackKeywords": [
          "overreliance on technology",
          "ignore",
          "natural signals"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w2wh_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"health anxiety\"):\n\n\"Việc theo dõi sức khỏe liên tục đôi khi có thể gây ra sự lo âu không cần thiết về sức khỏe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Constant health monitoring can sometimes trigger unnecessary health anxiety.",
        "explanationVi": "'Trigger + N' = gây ra, kích hoạt. 'Health anxiety' = lo âu về sức khỏe.",
        "modelAnswer": "Constant health monitoring can sometimes trigger unnecessary health anxiety.",
        "fallbackKeywords": [
          "constant health monitoring",
          "health anxiety"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w2wh_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"early diagnosis\"):\n\n\"Các thiết bị đeo thông minh có thể hỗ trợ việc chẩn đoán sớm một số bệnh lý.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Wearable devices can support the early diagnosis of certain medical conditions.",
        "explanationVi": "'Support + N' = hỗ trợ. 'Early diagnosis' = chẩn đoán sớm.",
        "modelAnswer": "Wearable devices can support the early diagnosis of certain medical conditions.",
        "fallbackKeywords": [
          "wearable devices",
          "early diagnosis",
          "medical conditions"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w2wh_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"data privacy\"):\n\n\"Nhiều người vẫn lo ngại về quyền riêng tư dữ liệu khi sử dụng các ứng dụng sức khỏe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people are still concerned about data privacy when using health apps.",
        "explanationVi": "'Data privacy' = quyền riêng tư dữ liệu. 'Concerned about + N' = lo ngại về.",
        "modelAnswer": "Many people are still concerned about data privacy when using health apps.",
        "fallbackKeywords": [
          "data privacy",
          "concerned about",
          "health apps"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w2wh_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"healthcare cost\"):\n\n\"Việc phát hiện bệnh sớm nhờ thiết bị đeo có thể giúp giảm chi phí chăm sóc sức khỏe về lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Early detection through wearable devices can help reduce long-term healthcare costs.",
        "explanationVi": "'Healthcare cost' = chi phí chăm sóc sức khỏe. 'Long-term' = về lâu dài.",
        "modelAnswer": "Early detection through wearable devices can help reduce long-term healthcare costs.",
        "fallbackKeywords": [
          "early detection",
          "healthcare costs",
          "long-term"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w2wh_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"personalised feedback\"):\n\n\"Các ứng dụng sức khỏe cung cấp phản hồi cá nhân hóa dựa trên hoạt động hằng ngày của người dùng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Health apps provide personalised feedback based on the user's daily activity.",
        "explanationVi": "'Personalised feedback' = phản hồi cá nhân hóa. 'Based on + N' = dựa trên.",
        "modelAnswer": "Health apps provide personalised feedback based on the user's daily activity.",
        "fallbackKeywords": [
          "personalised feedback",
          "based on",
          "daily activity"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w2wh_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"screen dependency\"):\n\n\"Việc liên tục kiểm tra màn hình đồng hồ thông minh có thể làm tăng sự phụ thuộc vào màn hình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Constantly checking a smartwatch screen can increase screen dependency.",
        "explanationVi": "'Screen dependency' = sự phụ thuộc vào màn hình. 'Constantly + V-ing' = liên tục làm gì.",
        "modelAnswer": "Constantly checking a smartwatch screen can increase screen dependency.",
        "fallbackKeywords": [
          "constantly checking",
          "screen dependency"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w2wh_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"chronic illness\"):\n\n\"Các thiết bị đeo thông minh có thể giúp bệnh nhân mắc bệnh mãn tính quản lý tình trạng của họ hiệu quả hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Wearable devices can help patients with chronic illnesses manage their condition more effectively.",
        "explanationVi": "'Chronic illness' = bệnh mãn tính. 'Manage + N' = quản lý (tình trạng bệnh).",
        "modelAnswer": "Wearable devices can help patients with chronic illnesses manage their condition more effectively.",
        "fallbackKeywords": [
          "chronic illnesses",
          "manage",
          "more effectively"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w2wh_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"battery dependency\"):\n\n\"Sự phụ thuộc vào pin có nghĩa là thiết bị trở nên vô dụng ngay khi hết pin.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Battery dependency means the device becomes useless as soon as it runs out of charge.",
        "explanationVi": "'Battery dependency' = sự phụ thuộc vào pin. 'Run out of charge' = hết pin.",
        "modelAnswer": "Battery dependency means the device becomes useless as soon as it runs out of charge.",
        "fallbackKeywords": [
          "battery dependency",
          "useless",
          "runs out of charge"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w2wh_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital health record\"):\n\n\"Dữ liệu từ các thiết bị đeo có thể được lưu trữ như một phần của hồ sơ sức khỏe điện tử.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Data from wearable devices can be stored as part of a digital health record.",
        "explanationVi": "'Digital health record' = hồ sơ sức khỏe điện tử. 'As part of + N' = như một phần của.",
        "modelAnswer": "Data from wearable devices can be stored as part of a digital health record.",
        "fallbackKeywords": [
          "digital health record",
          "stored",
          "part of"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 3,
    "block": "cause_effect",
    "topicName": "High Rates of University Dropout",
    "topicEmoji": "🎓",
    "essayType": "cause_effect",
    "prompt": "In several countries, a growing number of university students leave higher education before completing their degree program. What are the main causes of this trend, and what effects does it have on society?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 29,
    "vocabularyList": [
      {
        "term": "degree program",
        "definitionVi": "chương trình học lấy bằng",
        "example": "Many students leave before completing their degree program."
      },
      {
        "term": "higher education",
        "definitionVi": "giáo dục đại học",
        "example": "Access to higher education has expanded significantly in recent decades."
      },
      {
        "term": "financial hardship",
        "definitionVi": "khó khăn tài chính",
        "example": "Financial hardship forces many students to abandon their studies."
      },
      {
        "term": "academic underperformance",
        "definitionVi": "kết quả học tập kém",
        "example": "Academic underperformance is one of the leading causes of dropout."
      },
      {
        "term": "lack of career guidance",
        "definitionVi": "thiếu định hướng nghề nghiệp",
        "example": "A lack of career guidance leaves students unsure about their chosen major."
      },
      {
        "term": "mismatched expectations",
        "definitionVi": "kỳ vọng không phù hợp",
        "example": "Mismatched expectations about university life often lead to disappointment."
      },
      {
        "term": "student debt",
        "definitionVi": "nợ sinh viên",
        "example": "Rising student debt discourages many young people from continuing their education."
      },
      {
        "term": "workforce shortage",
        "definitionVi": "thiếu hụt lực lượng lao động",
        "example": "High dropout rates can contribute to a long-term workforce shortage."
      },
      {
        "term": "reduced earning potential",
        "definitionVi": "khả năng thu nhập bị giảm sút",
        "example": "Dropping out often results in reduced earning potential over a lifetime."
      },
      {
        "term": "social mobility",
        "definitionVi": "sự dịch chuyển xã hội",
        "example": "A university degree is often seen as a pathway to social mobility."
      },
      {
        "term": "mental health struggles",
        "definitionVi": "khó khăn về sức khỏe tâm thần",
        "example": "Mental health struggles are a growing cause of university dropout."
      },
      {
        "term": "part-time employment",
        "definitionVi": "việc làm bán thời gian",
        "example": "Many students juggle part-time employment alongside their studies."
      },
      {
        "term": "academic support services",
        "definitionVi": "dịch vụ hỗ trợ học tập",
        "example": "Universities should expand academic support services for struggling students."
      },
      {
        "term": "tuition fees",
        "definitionVi": "học phí",
        "example": "Rising tuition fees are a major financial burden for many families."
      },
      {
        "term": "wasted potential",
        "definitionVi": "tiềm năng bị lãng phí",
        "example": "University dropout often represents wasted potential for both individuals and society."
      },
      {
        "term": "economic burden",
        "definitionVi": "gánh nặng kinh tế",
        "example": "Dropout can become an economic burden on families and the state."
      },
      {
        "term": "sense of belonging",
        "definitionVi": "cảm giác thuộc về",
        "example": "A lack of a sense of belonging on campus can lead students to leave early."
      },
      {
        "term": "flexible learning options",
        "definitionVi": "hình thức học linh hoạt",
        "example": "Flexible learning options could help at-risk students stay enrolled."
      },
      {
        "term": "graduation rate",
        "definitionVi": "tỷ lệ tốt nghiệp",
        "example": "Improving graduation rates remains a priority for many governments."
      },
      {
        "term": "long-term consequences",
        "definitionVi": "hậu quả lâu dài",
        "example": "University dropout can have long-term consequences for a person's career."
      },
      {
        "term": "fall behind academically",
        "definitionVi": "tụt lại phía sau về mặt học tập",
        "example": "Students who fall behind academically are more likely to drop out."
      },
      {
        "term": "shoulder the financial burden",
        "definitionVi": "gánh vác gánh nặng tài chính",
        "example": "Many families struggle to shoulder the financial burden of tuition fees."
      },
      {
        "term": "lose sight of their goals",
        "definitionVi": "mất phương hướng, quên đi mục tiêu",
        "example": "Without proper guidance, students can lose sight of their academic goals."
      },
      {
        "term": "provide a safety net for",
        "definitionVi": "cung cấp mạng lưới an toàn cho",
        "example": "Universities should provide a safety net for students facing financial hardship."
      },
      {
        "term": "take a heavy toll on",
        "definitionVi": "gây tổn hại nặng nề đến",
        "example": "Constant financial stress takes a heavy toll on students' mental health."
      },
      {
        "term": "jeopardise future prospects",
        "definitionVi": "đe dọa triển vọng tương lai",
        "example": "Dropping out can jeopardise a young person's future career prospects."
      },
      {
        "term": "invest in student retention",
        "definitionVi": "đầu tư vào việc giữ chân sinh viên",
        "example": "Universities are increasingly investing in student retention programmes."
      },
      {
        "term": "identify at-risk students",
        "definitionVi": "xác định những sinh viên có nguy cơ",
        "example": "Early-warning systems help universities identify at-risk students promptly."
      },
      {
        "term": "adapt to university life",
        "definitionVi": "thích nghi với cuộc sống đại học",
        "example": "Some freshmen find it difficult to adapt to university life."
      },
      {
        "term": "erode students' confidence",
        "definitionVi": "làm xói mòn sự tự tin của sinh viên",
        "example": "Repeated academic failure can erode students' confidence over time."
      }
    ],
    "questions": [
      {
        "questionId": "w3hd_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the main causes of this trend, and what effects does it have on society?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Solution",
          "Cause & Effect",
          "Effect & Solution",
          "Discuss Both Views"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Effect",
        "explanationVi": "Keyword 'causes' kết hợp với 'effects' (không phải 'solutions') xác định đây là dạng Cause & Effect.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w3hd_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"In several countries, a growing number of university students leave higher education before _____ their degree program.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "completing",
        "explanationVi": "'Before + V-ing' = trước khi làm gì. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w3hd_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày càng nhiều sinh viên rời trường đại học trước khi hoàn thành chương trình học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A growing number of students leave university before completing their degree program.",
        "explanationVi": "'A growing number of + N' = ngày càng nhiều. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "A growing number of students leave university before completing their degree program.",
        "fallbackKeywords": [
          "growing number",
          "leave university",
          "degree program"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w3hd_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Khó khăn về tài chính là một trong những nguyên nhân chính khiến sinh viên bỏ học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Financial hardship is one of the main causes of university dropout.",
        "explanationVi": "'Financial hardship' = khó khăn tài chính. 'One of the main causes of' = một trong những nguyên nhân chính của.",
        "modelAnswer": "Financial hardship is one of the main causes of university dropout.",
        "fallbackKeywords": [
          "financial hardship",
          "main causes",
          "dropout"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w3hd_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc bỏ học có thể dẫn đến thu nhập thấp hơn trong suốt cuộc đời một người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Dropping out can lead to lower earnings throughout a person's lifetime.",
        "explanationVi": "'Lead to + N' = dẫn đến. 'Throughout a person's lifetime' = trong suốt cuộc đời một người.",
        "modelAnswer": "Dropping out can lead to lower earnings throughout a person's lifetime.",
        "fallbackKeywords": [
          "dropping out",
          "lower earnings",
          "lifetime"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w3hd_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều sinh viên phải làm việc bán thời gian cùng lúc với việc học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many students juggle part-time employment alongside their studies.",
        "explanationVi": "'Juggle + N' = xoay xở, cân bằng nhiều việc cùng lúc. 'Alongside + N' = song song với.",
        "modelAnswer": "Many students juggle part-time employment alongside their studies.",
        "fallbackKeywords": [
          "part-time employment",
          "alongside",
          "studies"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w3hd_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[can / on / a country's / High dropout rates / workforce / have a negative impact]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High dropout rates can have a negative impact on a country's workforce.",
        "explanationVi": "'Have a negative impact on + N' = có tác động tiêu cực đến. 'Dropout rates' = tỷ lệ bỏ học.",
        "modelAnswer": "High dropout rates can have a negative impact on a country's workforce.",
        "fallbackKeywords": [
          "high dropout rates",
          "negative impact",
          "workforce"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w3hd_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Universities should to offer more academic support services for struggling students.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Universities should offer more academic support services for struggling students.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Universities should offer more academic support services for struggling students.",
        "fallbackKeywords": [
          "universities",
          "academic support services"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w3hd_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"academic underperformance\"):\n\n\"Kết quả học tập kém là một trong những nguyên nhân hàng đầu dẫn đến việc bỏ học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Academic underperformance is one of the leading causes of dropout.",
        "explanationVi": "'Academic underperformance' = kết quả học tập kém. 'One of the leading causes of' = một trong những nguyên nhân hàng đầu của.",
        "modelAnswer": "Academic underperformance is one of the leading causes of dropout.",
        "fallbackKeywords": [
          "academic underperformance",
          "leading causes",
          "dropout"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w3hd_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"lack of career guidance\"):\n\n\"Thiếu định hướng nghề nghiệp khiến nhiều sinh viên không chắc chắn về ngành học đã chọn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of career guidance leaves many students unsure about their chosen major.",
        "explanationVi": "'A lack of career guidance' = thiếu định hướng nghề nghiệp. 'Leave + O + adj' = khiến ai ở trạng thái nào đó.",
        "modelAnswer": "A lack of career guidance leaves many students unsure about their chosen major.",
        "fallbackKeywords": [
          "lack of career guidance",
          "unsure",
          "chosen major"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w3hd_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mismatched expectations\"):\n\n\"Những kỳ vọng không phù hợp về cuộc sống đại học thường dẫn đến sự thất vọng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mismatched expectations about university life often lead to disappointment.",
        "explanationVi": "'Mismatched expectations' = kỳ vọng không phù hợp. 'Lead to + N' = dẫn đến.",
        "modelAnswer": "Mismatched expectations about university life often lead to disappointment.",
        "fallbackKeywords": [
          "mismatched expectations",
          "university life",
          "disappointment"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w3hd_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"student debt\"):\n\n\"Nợ sinh viên ngày càng tăng khiến nhiều bạn trẻ e ngại việc tiếp tục học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rising student debt discourages many young people from continuing their education.",
        "explanationVi": "'Student debt' = nợ sinh viên. 'Discourage + O + from + V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "Rising student debt discourages many young people from continuing their education.",
        "fallbackKeywords": [
          "rising student debt",
          "discourages",
          "continuing"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w3hd_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"workforce shortage\"):\n\n\"Tỷ lệ bỏ học cao có thể góp phần gây ra tình trạng thiếu hụt lực lượng lao động lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High dropout rates can contribute to a long-term workforce shortage.",
        "explanationVi": "'Workforce shortage' = thiếu hụt lực lượng lao động. 'Contribute to + N' = góp phần gây ra.",
        "modelAnswer": "High dropout rates can contribute to a long-term workforce shortage.",
        "fallbackKeywords": [
          "high dropout rates",
          "workforce shortage",
          "long-term"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w3hd_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social mobility\"):\n\n\"Bằng đại học thường được coi là con đường dẫn đến sự dịch chuyển xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A university degree is often seen as a pathway to social mobility.",
        "explanationVi": "'Social mobility' = sự dịch chuyển xã hội (khả năng thay đổi tầng lớp kinh tế-xã hội). 'A pathway to + N' = con đường dẫn đến.",
        "modelAnswer": "A university degree is often seen as a pathway to social mobility.",
        "fallbackKeywords": [
          "university degree",
          "pathway",
          "social mobility"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w3hd_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental health struggles\"):\n\n\"Những khó khăn về sức khỏe tâm thần đang trở thành một nguyên nhân ngày càng phổ biến của việc bỏ học đại học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mental health struggles are becoming an increasingly common cause of university dropout.",
        "explanationVi": "'Mental health struggles' = khó khăn về sức khỏe tâm thần. 'An increasingly common cause of' = một nguyên nhân ngày càng phổ biến của.",
        "modelAnswer": "Mental health struggles are becoming an increasingly common cause of university dropout.",
        "fallbackKeywords": [
          "mental health struggles",
          "increasingly common",
          "dropout"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w3hd_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"wasted potential\"):\n\n\"Việc bỏ học đại học thường đại diện cho tiềm năng bị lãng phí đối với cả cá nhân và xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "University dropout often represents wasted potential for both individuals and society.",
        "explanationVi": "'Wasted potential' = tiềm năng bị lãng phí. 'Represent + N' = đại diện cho, thể hiện.",
        "modelAnswer": "University dropout often represents wasted potential for both individuals and society.",
        "fallbackKeywords": [
          "wasted potential",
          "individuals and society"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w3hd_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"economic burden\"):\n\n\"Việc bỏ học có thể trở thành gánh nặng kinh tế đối với cả gia đình và nhà nước.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Dropping out can become an economic burden on both families and the state.",
        "explanationVi": "'Economic burden' = gánh nặng kinh tế. 'Become a burden on + N' = trở thành gánh nặng đối với.",
        "modelAnswer": "Dropping out can become an economic burden on both families and the state.",
        "fallbackKeywords": [
          "economic burden",
          "families",
          "state"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w3hd_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sense of belonging\"):\n\n\"Thiếu cảm giác thuộc về trong khuôn viên trường có thể khiến sinh viên nghỉ học sớm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of a sense of belonging on campus can lead students to leave early.",
        "explanationVi": "'A sense of belonging' = cảm giác thuộc về. 'Lead + O + to V' = khiến ai làm gì.",
        "modelAnswer": "A lack of a sense of belonging on campus can lead students to leave early.",
        "fallbackKeywords": [
          "sense of belonging",
          "on campus",
          "leave early"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w3hd_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"flexible learning options\"):\n\n\"Các hình thức học linh hoạt hơn có thể giúp những sinh viên có nguy cơ bỏ học tiếp tục ở lại trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More flexible learning options could help at-risk students stay enrolled.",
        "explanationVi": "'Flexible learning options' = hình thức học linh hoạt. 'At-risk students' = sinh viên có nguy cơ (bỏ học).",
        "modelAnswer": "More flexible learning options could help at-risk students stay enrolled.",
        "fallbackKeywords": [
          "flexible learning options",
          "at-risk students",
          "stay enrolled"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w3hd_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"graduation rate\"):\n\n\"Cải thiện tỷ lệ tốt nghiệp vẫn là ưu tiên hàng đầu của nhiều chính phủ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improving graduation rates remains a top priority for many governments.",
        "explanationVi": "'Graduation rate' = tỷ lệ tốt nghiệp. 'Remain a top priority for' = vẫn là ưu tiên hàng đầu của.",
        "modelAnswer": "Improving graduation rates remains a top priority for many governments.",
        "fallbackKeywords": [
          "graduation rates",
          "top priority",
          "governments"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 3,
    "block": "cause_effect",
    "topicName": "Decline in STEM Course Enrolments",
    "topicEmoji": "🔬",
    "essayType": "cause_effect",
    "prompt": "In many countries, not enough students are choosing to study science subjects at university. What are the causes of this? What effects does it have on society?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 30,
    "vocabularyList": [
      {
        "term": "STEM subjects",
        "definitionVi": "các môn khoa học, công nghệ, kỹ thuật, toán học",
        "example": "Fewer young people today are choosing to study STEM subjects at university."
      },
      {
        "term": "course enrolment",
        "definitionVi": "số lượng đăng ký học",
        "example": "STEM course enrolments have declined steadily over the past decade."
      },
      {
        "term": "workforce development",
        "definitionVi": "phát triển lực lượng lao động",
        "example": "A shortage of STEM graduates can hinder future workforce development."
      },
      {
        "term": "perceived difficulty",
        "definitionVi": "mức độ khó được cảm nhận",
        "example": "The perceived difficulty of STEM subjects discourages many students."
      },
      {
        "term": "career prospects",
        "definitionVi": "triển vọng nghề nghiệp",
        "example": "Some students avoid STEM fields due to uncertain career prospects."
      },
      {
        "term": "role model",
        "definitionVi": "hình mẫu, tấm gương",
        "example": "A lack of visible role models in science can discourage young learners."
      },
      {
        "term": "skills gap",
        "definitionVi": "khoảng cách kỹ năng",
        "example": "Declining STEM enrolments contribute to a widening skills gap in the economy."
      },
      {
        "term": "innovation capacity",
        "definitionVi": "năng lực đổi mới sáng tạo",
        "example": "A shortage of engineers can weaken a country's innovation capacity."
      },
      {
        "term": "technological competitiveness",
        "definitionVi": "khả năng cạnh tranh về công nghệ",
        "example": "Countries with strong STEM education maintain greater technological competitiveness."
      },
      {
        "term": "underrepresentation",
        "definitionVi": "sự đại diện thiếu hụt",
        "example": "Underrepresentation of women in STEM remains a persistent issue."
      },
      {
        "term": "outdated teaching methods",
        "definitionVi": "phương pháp giảng dạy lạc hậu",
        "example": "Outdated teaching methods can make science classes unengaging for students."
      },
      {
        "term": "hands-on experience",
        "definitionVi": "kinh nghiệm thực hành",
        "example": "More hands-on experience in labs could make STEM subjects more appealing."
      },
      {
        "term": "economic productivity",
        "definitionVi": "năng suất kinh tế",
        "example": "A strong STEM workforce is closely linked to national economic productivity."
      },
      {
        "term": "labour market demand",
        "definitionVi": "nhu cầu thị trường lao động",
        "example": "Labour market demand for STEM graduates continues to rise every year."
      },
      {
        "term": "scholarship incentives",
        "definitionVi": "ưu đãi học bổng",
        "example": "Scholarship incentives could encourage more students to pursue STEM degrees."
      },
      {
        "term": "gender stereotypes",
        "definitionVi": "định kiến giới",
        "example": "Gender stereotypes still discourage some young women from studying engineering."
      },
      {
        "term": "research funding",
        "definitionVi": "kinh phí nghiên cứu",
        "example": "Increased research funding can make STEM careers more attractive."
      },
      {
        "term": "automation",
        "definitionVi": "tự động hóa",
        "example": "Automation is increasing demand for workers with strong technical skills."
      },
      {
        "term": "foreign talent recruitment",
        "definitionVi": "tuyển dụng nhân tài nước ngoài",
        "example": "Some countries rely on foreign talent recruitment to fill STEM shortages."
      },
      {
        "term": "curriculum reform",
        "definitionVi": "cải cách chương trình học",
        "example": "Curriculum reform could make science and maths more engaging at an early age."
      },
      {
        "term": "spark students' interest in",
        "definitionVi": "khơi dậy sự hứng thú của học sinh với",
        "example": "Hands-on experiments can spark students' interest in science subjects."
      },
      {
        "term": "fall short of demand",
        "definitionVi": "không đáp ứng đủ nhu cầu",
        "example": "The supply of STEM graduates often falls short of industry demand."
      },
      {
        "term": "cultivate a passion for",
        "definitionVi": "nuôi dưỡng niềm đam mê với",
        "example": "Inspiring teachers can cultivate a passion for mathematics from an early age."
      },
      {
        "term": "deter students from pursuing",
        "definitionVi": "khiến học sinh e ngại theo đuổi",
        "example": "A reputation for difficulty can deter students from pursuing engineering degrees."
      },
      {
        "term": "close the skills gap",
        "definitionVi": "thu hẹp khoảng cách kỹ năng",
        "example": "Vocational partnerships can help close the skills gap in the tech sector."
      },
      {
        "term": "drive innovation forward",
        "definitionVi": "thúc đẩy sự đổi mới tiến lên",
        "example": "A strong pipeline of engineers helps drive innovation forward."
      },
      {
        "term": "level the playing field",
        "definitionVi": "tạo sân chơi công bằng",
        "example": "Scholarships can help level the playing field for underrepresented groups in STEM."
      },
      {
        "term": "invest in future talent",
        "definitionVi": "đầu tư vào nhân tài tương lai",
        "example": "Governments must invest in future talent to remain globally competitive."
      },
      {
        "term": "lag behind other nations",
        "definitionVi": "tụt hậu so với các quốc gia khác",
        "example": "A country may lag behind other nations in technological development."
      },
      {
        "term": "break down stereotypes",
        "definitionVi": "phá bỏ những định kiến",
        "example": "Outreach programmes aim to break down stereotypes about who can succeed in STEM."
      }
    ],
    "questions": [
      {
        "questionId": "w3st_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the causes of this issue, and what effects does it have on future workforce development?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Solution",
          "Cause & Effect",
          "Effect & Solution",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Effect",
        "explanationVi": "Keyword 'causes' kết hợp với 'effects' (không phải 'solutions') xác định đây là dạng Cause & Effect.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w3st_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Fewer young people today are _____ to study STEM subjects at university.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "choosing",
        "explanationVi": "'Choose to + V' = lựa chọn làm gì. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w3st_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày càng ít học sinh trẻ lựa chọn theo học các môn khoa học, công nghệ, kỹ thuật và toán học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Fewer young students are choosing to study science, technology, engineering, and mathematics.",
        "explanationVi": "'Fewer + N' = ít hơn. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Fewer young students are choosing to study science, technology, engineering, and mathematics.",
        "fallbackKeywords": [
          "fewer young students",
          "STEM",
          "choosing to study"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w3st_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sự thiếu hụt sinh viên tốt nghiệp ngành STEM có thể cản trở sự phát triển lực lượng lao động trong tương lai.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A shortage of STEM graduates can hinder future workforce development.",
        "explanationVi": "'A shortage of + N' = sự thiếu hụt. 'Hinder + N' = cản trở. 'Workforce development' = phát triển lực lượng lao động.",
        "modelAnswer": "A shortage of STEM graduates can hinder future workforce development.",
        "fallbackKeywords": [
          "shortage of STEM graduates",
          "hinder",
          "workforce development"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w3st_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều học sinh cảm thấy các môn khoa học và toán học quá khó để theo đuổi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many students find science and maths too difficult to pursue.",
        "explanationVi": "'Find + N + adj' = cảm thấy cái gì như thế nào. 'Too + adj + to V' = quá... để làm gì.",
        "modelAnswer": "Many students find science and maths too difficult to pursue.",
        "fallbackKeywords": [
          "science and maths",
          "too difficult",
          "pursue"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w3st_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thiếu các hình mẫu trong lĩnh vực khoa học có thể khiến học sinh trẻ nản lòng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of role models in science can discourage young students.",
        "explanationVi": "'A lack of role models' = thiếu hình mẫu. 'Discourage + O' = khiến ai nản lòng.",
        "modelAnswer": "A lack of role models in science can discourage young students.",
        "fallbackKeywords": [
          "lack of role models",
          "discourage",
          "young students"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w3st_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[to a widening / Declining STEM enrolments / contribute / skills gap / in the economy]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Declining STEM enrolments contribute to a widening skills gap in the economy.",
        "explanationVi": "'Contribute to + N' = góp phần gây ra. 'A widening skills gap' = khoảng cách kỹ năng ngày càng lớn.",
        "modelAnswer": "Declining STEM enrolments contribute to a widening skills gap in the economy.",
        "fallbackKeywords": [
          "declining STEM enrolments",
          "skills gap"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w3st_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to offer scholarship incentives to attract more STEM students.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should offer scholarship incentives to attract more STEM students.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should offer scholarship incentives to attract more STEM students.",
        "fallbackKeywords": [
          "governments",
          "scholarship incentives"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w3st_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"perceived difficulty\"):\n\n\"Mức độ khó được cảm nhận của các môn STEM khiến nhiều học sinh nản lòng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The perceived difficulty of STEM subjects discourages many students.",
        "explanationVi": "'Perceived difficulty' = mức độ khó được cảm nhận (chưa chắc đã khó thật). 'Discourage + O' = khiến ai nản lòng.",
        "modelAnswer": "The perceived difficulty of STEM subjects discourages many students.",
        "fallbackKeywords": [
          "perceived difficulty",
          "STEM subjects",
          "discourages"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w3st_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career prospects\"):\n\n\"Một số học sinh tránh các ngành STEM vì triển vọng nghề nghiệp không chắc chắn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some students avoid STEM fields due to uncertain career prospects.",
        "explanationVi": "'Career prospects' = triển vọng nghề nghiệp. 'Due to + N' = do, bởi vì.",
        "modelAnswer": "Some students avoid STEM fields due to uncertain career prospects.",
        "fallbackKeywords": [
          "career prospects",
          "avoid",
          "uncertain"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w3st_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"innovation capacity\"):\n\n\"Sự thiếu hụt kỹ sư có thể làm suy yếu năng lực đổi mới sáng tạo của một quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A shortage of engineers can weaken a country's innovation capacity.",
        "explanationVi": "'Innovation capacity' = năng lực đổi mới sáng tạo. 'Weaken + N' = làm suy yếu.",
        "modelAnswer": "A shortage of engineers can weaken a country's innovation capacity.",
        "fallbackKeywords": [
          "shortage of engineers",
          "innovation capacity",
          "weaken"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w3st_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technological competitiveness\"):\n\n\"Các quốc gia có nền giáo dục STEM mạnh sẽ duy trì được khả năng cạnh tranh về công nghệ cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Countries with strong STEM education maintain greater technological competitiveness.",
        "explanationVi": "'Technological competitiveness' = khả năng cạnh tranh về công nghệ. 'Maintain + N' = duy trì.",
        "modelAnswer": "Countries with strong STEM education maintain greater technological competitiveness.",
        "fallbackKeywords": [
          "strong STEM education",
          "technological competitiveness"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w3st_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"underrepresentation\"):\n\n\"Sự đại diện thiếu hụt của phụ nữ trong ngành STEM vẫn là một vấn đề dai dẳng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The underrepresentation of women in STEM remains a persistent issue.",
        "explanationVi": "'Underrepresentation' = sự đại diện thiếu hụt. 'A persistent issue' = một vấn đề dai dẳng.",
        "modelAnswer": "The underrepresentation of women in STEM remains a persistent issue.",
        "fallbackKeywords": [
          "underrepresentation",
          "women in STEM",
          "persistent issue"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w3st_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"outdated teaching methods\"):\n\n\"Phương pháp giảng dạy lạc hậu có thể khiến các giờ học khoa học trở nên kém hấp dẫn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Outdated teaching methods can make science classes unengaging for students.",
        "explanationVi": "'Outdated teaching methods' = phương pháp giảng dạy lạc hậu. 'Make + N + adj' = làm cho cái gì trở nên như thế nào.",
        "modelAnswer": "Outdated teaching methods can make science classes unengaging for students.",
        "fallbackKeywords": [
          "outdated teaching methods",
          "science classes",
          "unengaging"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w3st_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"hands-on experience\"):\n\n\"Nhiều kinh nghiệm thực hành trong phòng thí nghiệm hơn có thể khiến các môn STEM trở nên hấp dẫn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More hands-on experience in labs could make STEM subjects more appealing.",
        "explanationVi": "'Hands-on experience' = kinh nghiệm thực hành. 'More appealing' = hấp dẫn hơn.",
        "modelAnswer": "More hands-on experience in labs could make STEM subjects more appealing.",
        "fallbackKeywords": [
          "hands-on experience",
          "labs",
          "more appealing"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w3st_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"economic productivity\"):\n\n\"Một lực lượng lao động STEM mạnh có liên hệ chặt chẽ với năng suất kinh tế quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A strong STEM workforce is closely linked to national economic productivity.",
        "explanationVi": "'Economic productivity' = năng suất kinh tế. 'Closely linked to + N' = có liên hệ chặt chẽ với.",
        "modelAnswer": "A strong STEM workforce is closely linked to national economic productivity.",
        "fallbackKeywords": [
          "STEM workforce",
          "economic productivity",
          "closely linked"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w3st_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"labour market demand\"):\n\n\"Nhu cầu thị trường lao động đối với sinh viên tốt nghiệp ngành STEM tiếp tục tăng lên mỗi năm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Labour market demand for STEM graduates continues to rise every year.",
        "explanationVi": "'Labour market demand' = nhu cầu thị trường lao động. 'Continue to rise' = tiếp tục tăng.",
        "modelAnswer": "Labour market demand for STEM graduates continues to rise every year.",
        "fallbackKeywords": [
          "labour market demand",
          "STEM graduates",
          "rise"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w3st_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"gender stereotypes\"):\n\n\"Định kiến giới vẫn khiến một số bạn nữ trẻ e ngại việc theo học ngành kỹ thuật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Gender stereotypes still discourage some young women from studying engineering.",
        "explanationVi": "'Gender stereotypes' = định kiến giới. 'Discourage + O + from + V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "Gender stereotypes still discourage some young women from studying engineering.",
        "fallbackKeywords": [
          "gender stereotypes",
          "discourage",
          "engineering"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w3st_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"research funding\"):\n\n\"Tăng kinh phí nghiên cứu có thể khiến sự nghiệp trong ngành STEM trở nên hấp dẫn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Increased research funding can make STEM careers more attractive.",
        "explanationVi": "'Research funding' = kinh phí nghiên cứu. 'Make + N + more attractive' = làm cho cái gì hấp dẫn hơn.",
        "modelAnswer": "Increased research funding can make STEM careers more attractive.",
        "fallbackKeywords": [
          "research funding",
          "STEM careers",
          "attractive"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w3st_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"curriculum reform\"):\n\n\"Cải cách chương trình học có thể khiến khoa học và toán học trở nên thú vị hơn ngay từ khi còn nhỏ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Curriculum reform could make science and maths more engaging at an early age.",
        "explanationVi": "'Curriculum reform' = cải cách chương trình học. 'At an early age' = ngay từ khi còn nhỏ.",
        "modelAnswer": "Curriculum reform could make science and maths more engaging at an early age.",
        "fallbackKeywords": [
          "curriculum reform",
          "science and maths",
          "early age"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 4,
    "block": "cause_effect",
    "topicName": "Online Learning and Student Motivation",
    "topicEmoji": "📚",
    "essayType": "cause_effect",
    "prompt": "Many students find it difficult to stay motivated when studying online. What are the causes of this problem, and what effects does it have on students?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 6,
    "vocabularyList": [
      {
        "term": "motivation",
        "definitionVi": "động lực",
        "example": "Lack of motivation is one of the biggest challenges in online learning."
      },
      {
        "term": "distraction",
        "definitionVi": "sự phân tâm",
        "example": "Social media is a major source of distraction for online students."
      },
      {
        "term": "procrastination",
        "definitionVi": "sự trì hoãn",
        "example": "Without deadlines, students tend to procrastinate."
      },
      {
        "term": "academic burnout",
        "definitionVi": "kiệt sức học tập",
        "example": "Students may suffer from academic burnout if they study too much without rest."
      },
      {
        "term": "peer interaction",
        "definitionVi": "sự tương tác với bạn bè cùng trang lứa",
        "example": "The lack of peer interaction makes online studying less engaging."
      },
      {
        "term": "digital fatigue",
        "definitionVi": "mệt mỏi vì màn hình số",
        "example": "Sitting in front of a screen for too long can lead to digital fatigue."
      },
      {
        "term": "structured learning environment",
        "definitionVi": "môi trường học tập có cấu trúc",
        "example": "A structured learning environment helps students stay on task."
      },
      {
        "term": "intrinsic motivation",
        "definitionVi": "động lực nội tại",
        "example": "Intrinsic motivation helps students maintain enthusiasm for learning."
      },
      {
        "term": "academic performance",
        "definitionVi": "kết quả học tập",
        "example": "Low motivation directly impacts academic performance."
      },
      {
        "term": "dropout rate",
        "definitionVi": "tỷ lệ bỏ học",
        "example": "Poor motivation contributes to higher dropout rates in online courses."
      },
      {
        "term": "self-regulation",
        "definitionVi": "khả năng tự điều tiết",
        "example": "Online learning demands strong self-regulation from students."
      },
      {
        "term": "isolation",
        "definitionVi": "sự cô lập",
        "example": "Social isolation is a common effect of prolonged online study."
      },
      {
        "term": "engagement",
        "definitionVi": "sự gắn kết, tham gia tích cực",
        "example": "Low engagement in online classes leads to poor learning outcomes."
      },
      {
        "term": "flexible learning",
        "definitionVi": "học tập linh hoạt",
        "example": "Flexible learning can also lead to a lack of routine."
      },
      {
        "term": "long-term",
        "definitionVi": "dài hạn",
        "example": "Intrinsic motivation sustains learning over the long term."
      },
      {
        "term": "peer-to-peer learning",
        "definitionVi": "học hỏi lẫn nhau",
        "example": "Peer-to-peer learning encourages students to share knowledge and solve problems together."
      },
      {
        "term": "instructor feedback",
        "definitionVi": "phản hồi từ giảng viên",
        "example": "Timely instructor feedback helps students identify and correct their mistakes."
      },
      {
        "term": "asynchronous learning",
        "definitionVi": "học không đồng bộ (theo giờ riêng)",
        "example": "Asynchronous learning allows students to study at any time without live sessions."
      },
      {
        "term": "digital resource",
        "definitionVi": "tài nguyên kỹ thuật số",
        "example": "Online courses provide a wide range of digital resources including videos and quizzes."
      },
      {
        "term": "learner autonomy",
        "definitionVi": "tính tự chủ của người học",
        "example": "Learner autonomy is crucial for success in self-paced online programmes."
      },
      {
        "term": "lose momentum",
        "definitionVi": "mất động lực, đà tiến",
        "example": "Students studying alone at home can quickly lose momentum."
      },
      {
        "term": "foster a sense of community",
        "definitionVi": "xây dựng cảm giác cộng đồng",
        "example": "Group projects help foster a sense of community among online learners."
      },
      {
        "term": "set realistic goals",
        "definitionVi": "đặt ra mục tiêu thực tế",
        "example": "Setting realistic goals can help students stay motivated during online courses."
      },
      {
        "term": "succumb to distractions",
        "definitionVi": "bị cuốn theo những sự phân tâm",
        "example": "Without supervision, students may easily succumb to distractions at home."
      },
      {
        "term": "sustain long-term engagement",
        "definitionVi": "duy trì sự gắn kết lâu dài",
        "example": "Interactive content helps sustain long-term engagement in virtual classrooms."
      },
      {
        "term": "provide timely feedback",
        "definitionVi": "cung cấp phản hồi kịp thời",
        "example": "Instructors should provide timely feedback to keep students motivated."
      },
      {
        "term": "instil a sense of discipline",
        "definitionVi": "hình thành tính kỷ luật",
        "example": "A structured schedule can instil a sense of discipline in online learners."
      },
      {
        "term": "combat feelings of isolation",
        "definitionVi": "chống lại cảm giác cô lập",
        "example": "Regular video check-ins can combat feelings of isolation among remote students."
      },
      {
        "term": "boost self-motivation",
        "definitionVi": "tăng cường động lực tự thân",
        "example": "Gamified learning platforms can boost self-motivation in students."
      },
      {
        "term": "fall into bad habits",
        "definitionVi": "rơi vào những thói quen xấu",
        "example": "Students learning from home may fall into bad habits like procrastination."
      }
    ],
    "questions": [
      {
        "questionId": "w3t4_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài hỏi: \"What are the causes of this problem, and what effects does it have?\" — Cấu trúc bài luận gồm mấy phần?",
        "options": [
          "1 phần (chỉ nguyên nhân)",
          "2 phần: một về nguyên nhân, một về hệ quả",
          "2 phần: quan điểm ủng hộ và phản đối",
          "3 phần: nguyên nhân, hệ quả, và giải pháp"
        ],
        "baseWords": [],
        "correctAnswer": "2 phần: một về nguyên nhân, một về hệ quả",
        "explanationVi": "Đề hỏi 'causes' AND 'effects' → bài cần 2 body paragraphs riêng biệt: BP1 về nguyên nhân, BP2 về hệ quả. Không có 'solutions' nên không cần phần giải pháp.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w3t4_q02",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Chọn từ đúng để hoàn chỉnh câu:\n\n\"There are several _____ why students lack motivation when studying online.\"",
        "options": [
          "effects",
          "solutions",
          "reasons",
          "advantages"
        ],
        "baseWords": [],
        "correctAnswer": "reasons",
        "explanationVi": "'Reasons why + clause' = lý do tại sao. Trong Cause & Effect essay, 'reasons' và 'causes' được dùng thay thế nhau. Tránh nhầm với 'effects' (hệ quả).",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w3t4_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ở nhà, có quá nhiều yếu tố gây xao nhãng khi học trực tuyến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "At home, there are too many distractions when studying online.",
        "explanationVi": "'Distraction' (danh từ đếm được) = yếu tố gây phân tâm. 'Too many + countable noun plural' = quá nhiều. Câu này nêu một nguyên nhân phổ biến trong bài Cause & Effect.",
        "modelAnswer": "At home, there are too many distractions when studying online.",
        "fallbackKeywords": [
          "home",
          "distractions",
          "studying online"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w3t4_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sự thiếu tương tác với bạn học khiến việc học trở nên kém hấp dẫn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The lack of peer interaction makes studying less engaging.",
        "explanationVi": "'The lack of + N' = sự thiếu hụt của. 'Make + O + adj' = khiến cho. 'Engaging' = hấp dẫn, thu hút. Cấu trúc này diễn đạt nguyên nhân rất gọn gàng.",
        "modelAnswer": "The lack of peer interaction makes studying less engaging.",
        "fallbackKeywords": [
          "peer interaction",
          "studying",
          "engaging"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w3t4_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Học sinh có thể bị kiệt sức học tập nếu học quá nhiều mà không nghỉ ngơi đầy đủ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students may suffer from academic burnout if they study too much without adequate rest.",
        "explanationVi": "'Suffer from + N' = chịu đựng, bị mắc phải. 'Academic burnout' = kiệt sức học tập. 'Adequate rest' = nghỉ ngơi đầy đủ (academic hơn 'enough rest').",
        "modelAnswer": "Students may suffer from academic burnout if they study too much without adequate rest.",
        "fallbackKeywords": [
          "academic burnout",
          "students",
          "study",
          "rest"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w3t4_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngồi trước màn hình quá lâu có thể dẫn đến tình trạng mệt mỏi kỹ thuật số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sitting in front of a screen for too long can lead to digital fatigue.",
        "explanationVi": "Gerund 'Sitting in front of a screen' làm chủ ngữ. 'For too long' = trong thời gian quá lâu. 'Digital fatigue' = mệt mỏi kỹ thuật số — hệ quả quan trọng của học online.",
        "modelAnswer": "Sitting in front of a screen for too long can lead to digital fatigue.",
        "fallbackKeywords": [
          "screen",
          "digital fatigue",
          "lead to"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w3t4_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các cụm từ sau thành câu hoàn chỉnh:\n[the lack of peer interaction, / As a result of / many students / feel isolated / and lose motivation]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "As a result of the lack of peer interaction, many students feel isolated and lose motivation.",
        "explanationVi": "'As a result of + N' = do kết quả của (nêu nguyên nhân). Dấu phẩy sau mệnh đề trạng ngữ đứng đầu câu là bắt buộc. 'Feel isolated' = cảm thấy bị cô lập.",
        "modelAnswer": "As a result of the lack of peer interaction, many students feel isolated and lose motivation.",
        "fallbackKeywords": [
          "peer interaction",
          "students",
          "isolated",
          "motivation"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w3t4_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"One of the main cause of low motivation is the absence of a structured learning environment.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the main causes of low motivation is the absence of a structured learning environment.",
        "explanationVi": "Lỗi: 'one of the + superlative + plural noun' → 'cause' phải là 'causes'. Quy tắc: sau 'one of the' luôn dùng danh từ số nhiều.",
        "modelAnswer": "One of the main causes of low motivation is the absence of a structured learning environment.",
        "fallbackKeywords": [
          "causes",
          "motivation",
          "structured",
          "learning environment"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w3t4_q09",
        "level": "elementary",
        "type": "topic_sentence",
        "questionText": "Chọn linking word phù hợp để điền vào chỗ trống:\n\n\"Students are easily distracted at home. _____, their academic performance tends to decline.\"",
        "options": [
          "However",
          "In contrast",
          "As a result",
          "On the other hand"
        ],
        "baseWords": [],
        "correctAnswer": "As a result",
        "explanationVi": "'As a result' = do đó, kết quả là — linking word chỉ hệ quả. Câu sau là HỆ QUẢ của câu trước (dễ bị phân tâm → kết quả học tập giảm). 'However' chỉ sự tương phản, không phù hợp ở đây.",
        "fallbackKeywords": [],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w3t4_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Động lực nội tại giúp sinh viên duy trì hứng thú học tập trong thời gian dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.",
        "explanationVi": "'Intrinsic motivation' = động lực nội tại (đến từ bên trong, không phải phần thưởng bên ngoài). 'Maintain enthusiasm for' = duy trì hứng thú với. 'Over the long term' = trong thời gian dài.",
        "modelAnswer": "Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.",
        "fallbackKeywords": [
          "intrinsic motivation",
          "students",
          "enthusiasm",
          "learning",
          "long term"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w3t4_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"self-discipline\"):\n\n\"Học trực tuyến đòi hỏi sinh viên phải có tính tự giác cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online learning demands that students possess a high level of self-discipline.",
        "explanationVi": "'Demands that + S + V' (bare infinitive) = đòi hỏi rằng — cấu trúc subjunctive mood trang trọng. 'Possess' = có, sở hữu — formal hơn 'have'.",
        "modelAnswer": "Online learning demands that students possess a high level of self-discipline.",
        "fallbackKeywords": [
          "self-discipline",
          "online learning",
          "demands",
          "high level"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w3t4_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"lack of motivation\"):\n\n\"Một trong những vấn đề lớn nhất là thiếu động lực học tập.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the biggest problems is a lack of motivation to study.",
        "explanationVi": "'A lack of + N' = sự thiếu hụt của (danh từ). 'Motivation to study' = động lực để học — 'to + V' là mệnh đề mục đích bổ nghĩa cho danh từ.",
        "modelAnswer": "One of the biggest problems is a lack of motivation to study.",
        "fallbackKeywords": [
          "lack of motivation",
          "biggest problems",
          "study"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w3t4_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"time management skills\"):\n\n\"Nhiều sinh viên gặp khó khăn trong việc quản lý thời gian hiệu quả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many students struggle with managing their time effectively, lacking adequate time management skills.",
        "explanationVi": "'Struggle with + V-ing' = gặp khó khăn trong việc. Mệnh đề bổ sung 'lacking adequate time management skills' = participle clause giải thích nguyên nhân.",
        "modelAnswer": "Many students struggle with managing their time effectively, lacking adequate time management skills.",
        "fallbackKeywords": [
          "time management skills",
          "students",
          "struggle",
          "effectively"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w3t4_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"distraction\"):\n\n\"Mạng xã hội và các ứng dụng giải trí tạo ra sự xao nhãng lớn, khiến sinh viên khó tập trung khi học trực tuyến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social media and entertainment apps create significant distractions, making it difficult for students to focus while studying online.",
        "explanationVi": "'Create significant distractions' = tạo ra sự xao nhãng lớn. 'Making it difficult for + O + to V' = cấu trúc hình thức — khiến ai khó làm gì.",
        "modelAnswer": "Social media and entertainment apps create significant distractions, making it difficult for students to focus while studying online.",
        "fallbackKeywords": [
          "social media",
          "distractions",
          "students",
          "focus",
          "studying online"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w3t4_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"procrastination\"):\n\n\"Sự trì hoãn là nguyên nhân phổ biến khiến sinh viên không hoàn thành bài tập đúng hạn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Procrastination is a common reason why students fail to complete assignments on time.",
        "explanationVi": "'Procrastination' = sự trì hoãn (noun). 'Fail to + V' = không làm được, không hoàn thành — mang sắc thái kết quả tiêu cực.",
        "modelAnswer": "Procrastination is a common reason why students fail to complete assignments on time.",
        "fallbackKeywords": [
          "procrastination",
          "students",
          "assignments",
          "on time"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w3t4_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"academic performance\"):\n\n\"Học sinh có xu hướng giảm kết quả học tập khi thiếu động lực.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students tend to experience a decline in academic performance when they lack motivation.",
        "explanationVi": "'Tend to + V' = có xu hướng làm gì. 'A decline in academic performance' = sự sụt giảm kết quả — dùng 'decline in + N' thay vì 'decrease of'.",
        "modelAnswer": "Students tend to experience a decline in academic performance when they lack motivation.",
        "fallbackKeywords": [
          "academic performance",
          "decline",
          "lack motivation",
          "tend to"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w3t4_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"intrinsic motivation\"):\n\n\"Thiếu động lực nội tại thường dẫn đến việc sinh viên trì hoãn và không hoàn thành bài tập đúng hạn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of intrinsic motivation often leads to students procrastinating and failing to complete assignments on time.",
        "explanationVi": "'A lack of intrinsic motivation' = thiếu động lực nội tại. 'Lead to + V-ing' = dẫn đến việc. 'Procrastinating' = trì hoãn. 'Fail to + V' = không hoàn thành được.",
        "modelAnswer": "A lack of intrinsic motivation often leads to students procrastinating and failing to complete assignments on time.",
        "fallbackKeywords": [
          "intrinsic motivation",
          "procrastinating",
          "assignments",
          "on time"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w3t4_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"extrinsic motivation\"):\n\n\"Một số sinh viên chỉ học để được điểm cao, đó là động lực bên ngoài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some students study only to achieve high grades, which is a form of extrinsic motivation.",
        "explanationVi": "'Extrinsic motivation' = động lực bên ngoài (điểm số, phần thưởng). 'A form of + N' = một dạng của — 'which is a form of' là mệnh đề quan hệ giải thích.",
        "modelAnswer": "Some students study only to achieve high grades, which is a form of extrinsic motivation.",
        "fallbackKeywords": [
          "extrinsic motivation",
          "high grades",
          "form of"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w3t4_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital fatigue\"):\n\n\"Mệt mỏi kỹ thuật số không chỉ ảnh hưởng đến mắt mà còn làm giảm khả năng tập trung và năng suất học tập.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Digital fatigue not only affects the eyes but also reduces concentration and academic productivity.",
        "explanationVi": "'Not only A but also B' = không chỉ A mà còn B — cấu trúc liệt kê hai hệ quả song song. 'Academic productivity' = năng suất học tập. 'Concentration' = khả năng tập trung.",
        "modelAnswer": "Digital fatigue not only affects the eyes but also reduces concentration and academic productivity.",
        "fallbackKeywords": [
          "digital fatigue",
          "affects",
          "concentration",
          "academic productivity"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w3t4_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental well-being\"):\n\n\"Áp lực học online trong thời gian dài ảnh hưởng đến sức khỏe tinh thần.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        "explanationVi": "'Mental well-being' = sức khỏe tinh thần (học thuật hơn 'mental health'). 'Sustained pressure' = áp lực kéo dài — 'sustained' = liên tục, không giảm.",
        "modelAnswer": "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        "fallbackKeywords": [
          "mental well-being",
          "online learning",
          "pressure",
          "affect"
        ],
        "orderIndex": 22,
        "isActive": true
      }
    ]
  },
  {
    "week": 4,
    "block": "cause_effect",
    "topicName": "Dropout Rates in Higher Education",
    "topicEmoji": "🎓",
    "essayType": "cause_effect",
    "prompt": "The number of students dropping out of university is increasing in many countries. What are the causes of this problem, and what effects does it have on individuals and society?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 7,
    "vocabularyList": [
      {
        "term": "dropout rate",
        "definitionVi": "tỷ lệ bỏ học",
        "example": "The dropout rate has increased significantly in the past decade."
      },
      {
        "term": "financial burden",
        "definitionVi": "gánh nặng tài chính",
        "example": "University fees are a heavy financial burden for many families."
      },
      {
        "term": "tuition fees",
        "definitionVi": "học phí",
        "example": "High tuition fees prevent many students from continuing their studies."
      },
      {
        "term": "unemployment",
        "definitionVi": "thất nghiệp",
        "example": "High dropout rates contribute to youth unemployment."
      },
      {
        "term": "social stability",
        "definitionVi": "sự ổn định xã hội",
        "example": "High dropout rates can undermine long-term social stability."
      },
      {
        "term": "career guidance",
        "definitionVi": "hướng nghiệp",
        "example": "Universities need to strengthen career guidance services."
      },
      {
        "term": "social resources",
        "definitionVi": "nguồn lực xã hội",
        "example": "High dropout rates represent a waste of social resources."
      },
      {
        "term": "mental health support",
        "definitionVi": "hỗ trợ sức khỏe tâm thần",
        "example": "Universities should provide better mental health support for struggling students."
      },
      {
        "term": "academic pressure",
        "definitionVi": "áp lực học tập",
        "example": "Academic pressure is a leading cause of university dropout."
      },
      {
        "term": "scholarship",
        "definitionVi": "học bổng",
        "example": "More scholarships could prevent financially disadvantaged students from dropping out."
      },
      {
        "term": "income inequality",
        "definitionVi": "bất bình đẳng thu nhập",
        "example": "Income inequality means poorer students are more likely to drop out."
      },
      {
        "term": "undermine",
        "definitionVi": "làm suy yếu, phá hoại",
        "example": "High dropout rates undermine investment in public education."
      },
      {
        "term": "higher education",
        "definitionVi": "giáo dục đại học",
        "example": "Access to quality higher education remains unequal in many countries."
      },
      {
        "term": "productivity",
        "definitionVi": "năng suất",
        "example": "Dropouts generally contribute less to national productivity."
      },
      {
        "term": "vocational training",
        "definitionVi": "đào tạo nghề",
        "example": "Vocational training provides an alternative pathway for students who leave university."
      },
      {
        "term": "student loan",
        "definitionVi": "vay vốn sinh viên",
        "example": "Many graduates struggle to repay their student loans for years after graduation."
      },
      {
        "term": "academic support",
        "definitionVi": "hỗ trợ học thuật",
        "example": "Universities should provide better academic support for at-risk students."
      },
      {
        "term": "graduate employability",
        "definitionVi": "khả năng tìm việc của sinh viên tốt nghiệp",
        "example": "Universities must improve graduate employability to justify rising tuition fees."
      },
      {
        "term": "peer support network",
        "definitionVi": "mạng lưới hỗ trợ bạn bè",
        "example": "A strong peer support network can prevent students from dropping out."
      },
      {
        "term": "retention rate",
        "definitionVi": "tỷ lệ duy trì sinh viên",
        "example": "Universities with strong support services have higher retention rates."
      },
      {
        "term": "place a strain on",
        "definitionVi": "gây áp lực lên, đặt gánh nặng lên",
        "example": "Rising tuition fees place a strain on many families' finances."
      },
      {
        "term": "widen the wealth gap",
        "definitionVi": "nới rộng khoảng cách giàu nghèo",
        "example": "Unequal access to education can widen the wealth gap in society."
      },
      {
        "term": "offer a lifeline to",
        "definitionVi": "mang lại cứu cánh cho",
        "example": "Scholarships can offer a lifeline to students from disadvantaged backgrounds."
      },
      {
        "term": "improve graduate outcomes",
        "definitionVi": "cải thiện kết quả đầu ra của sinh viên tốt nghiệp",
        "example": "Mentoring schemes have been shown to improve graduate outcomes."
      },
      {
        "term": "drain the economy",
        "definitionVi": "làm cạn kiệt nền kinh tế",
        "example": "A high dropout rate can drain the economy of skilled workers."
      },
      {
        "term": "provide a stepping stone to",
        "definitionVi": "tạo bàn đạp cho",
        "example": "Vocational training can provide a stepping stone to stable employment."
      },
      {
        "term": "exacerbate social inequality",
        "definitionVi": "làm trầm trọng thêm bất bình đẳng xã hội",
        "example": "Low graduation rates can exacerbate social inequality over generations."
      },
      {
        "term": "reap the benefits of",
        "definitionVi": "gặt hái được lợi ích từ",
        "example": "Countries that invest in education reap the benefits of a skilled workforce."
      },
      {
        "term": "channel resources into",
        "definitionVi": "dồn nguồn lực vào",
        "example": "Governments should channel resources into student support services."
      },
      {
        "term": "break the cycle of poverty",
        "definitionVi": "phá vỡ vòng luẩn quẩn của đói nghèo",
        "example": "A university degree can help individuals break the cycle of poverty."
      }
    ],
    "questions": [
      {
        "questionId": "w4t7_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the causes of this problem, and what effects does it have on individuals and society?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Solution",
          "Cause & Effect",
          "Effect & Solution",
          "Opinion Essay"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Effect",
        "explanationVi": "Từ khóa 'causes' và 'effects' cùng xuất hiện → dạng Cause & Effect. Bài cần BP1 phân tích nguyên nhân, BP2 phân tích hệ quả với cá nhân VÀ xã hội.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w4t7_q02",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một trong những nguyên nhân chính là gánh nặng tài chính của giáo dục đại học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the main causes is the financial burden of higher education.",
        "explanationVi": "'One of the main causes is + N' — cấu trúc nêu nguyên nhân chuẩn trong IELTS. 'Financial burden' = gánh nặng tài chính — collocation quan trọng.",
        "modelAnswer": "One of the main causes is the financial burden of higher education.",
        "fallbackKeywords": [
          "financial burden",
          "causes",
          "higher education"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w4t7_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Học phí cao ngăn cản nhiều sinh viên tiếp tục việc học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High tuition fees prevent many students from continuing their studies.",
        "explanationVi": "'Prevent + O + from + V-ing' = ngăn cản ai làm gì. 'Tuition fees' = học phí. Cấu trúc này rất phổ biến trong IELTS Writing khi nêu trở ngại.",
        "modelAnswer": "High tuition fees prevent many students from continuing their studies.",
        "fallbackKeywords": [
          "tuition fees",
          "students",
          "continuing",
          "studies"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w4t7_q04",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tỷ lệ bỏ học cao cũng đồng nghĩa với sự lãng phí đáng kể nguồn lực xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A high dropout rate also represents a significant waste of social resources.",
        "explanationVi": "'Represent + N' = đại diện cho, đồng nghĩa với. 'A significant waste of' = sự lãng phí đáng kể của. Đây là hệ quả ở cấp độ xã hội.",
        "modelAnswer": "A high dropout rate also represents a significant waste of social resources.",
        "fallbackKeywords": [
          "dropout rate",
          "waste",
          "social resources"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w4t7_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các trường đại học cần tăng cường dịch vụ hướng nghiệp cho sinh viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Universities need to strengthen career guidance for students.",
        "explanationVi": "'Strengthen + N' = tăng cường, củng cố. 'Career guidance' = hướng nghiệp — giải pháp phổ biến trong essay về dropout. Dùng 'need to + V' để đề xuất biện pháp cần thiết.",
        "modelAnswer": "Universities need to strengthen career guidance for students.",
        "fallbackKeywords": [
          "universities",
          "career guidance",
          "students"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w4t7_q06",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Dropping out of university can leads to unemployment and low income.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Dropping out of university can lead to unemployment and low income.",
        "explanationVi": "Lỗi: Sau modal verb 'can' phải dùng bare infinitive. 'leads' → 'lead' (bỏ -s). Quy tắc: 'can/could/will/would/should + V (nguyên thể không to)'.",
        "modelAnswer": "Dropping out of university can lead to unemployment and low income.",
        "fallbackKeywords": [
          "dropping out",
          "university",
          "unemployment",
          "income"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w4t7_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nếu không được giải quyết kịp thời, tỷ lệ bỏ học cao có thể làm suy yếu sự ổn định xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If not addressed promptly, high dropout rates could undermine social stability.",
        "explanationVi": "'If not addressed promptly' = nếu không được giải quyết kịp thời (passive conditional). 'Undermine' = làm suy yếu, phá hoại ngầm. 'Could' = khả năng trong tương lai.",
        "modelAnswer": "If not addressed promptly, high dropout rates could undermine social stability.",
        "fallbackKeywords": [
          "dropout rates",
          "social stability",
          "addressed",
          "undermine"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w4t7_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"drop out of university\"):\n\n\"Ngày càng có nhiều sinh viên bỏ học đại học ở nhiều quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An increasing number of students are choosing to drop out of university across many countries.",
        "explanationVi": "'An increasing number of + plural N' = ngày càng nhiều — trang trọng hơn 'more and more'. 'Across many countries' = ở nhiều quốc gia (across = khắp).",
        "modelAnswer": "An increasing number of students are choosing to drop out of university across many countries.",
        "fallbackKeywords": [
          "drop out of university",
          "increasing number",
          "countries"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w4t7_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"university dropout rate\"):\n\n\"Tỉ lệ bỏ học đại học đang tăng nhanh trong thập kỷ qua.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The university dropout rate has been rising rapidly over the past decade.",
        "explanationVi": "'Has been rising' = Present Perfect Continuous nhấn mạnh xu hướng liên tục. 'Over the past decade' = trong thập kỷ qua (decade = 10 năm).",
        "modelAnswer": "The university dropout rate has been rising rapidly over the past decade.",
        "fallbackKeywords": [
          "university dropout rate",
          "rising rapidly",
          "past decade"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w4t7_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"financial burden\"):\n\n\"Một trong những nguyên nhân chính là gánh nặng tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "One of the main causes is the financial burden.",
        "explanationVi": "'Financial burden' = gánh nặng tài chính — cụm danh từ học thuật chỉ áp lực tiền bạc. 'One of the main causes is + N' = một trong những nguyên nhân chính là.",
        "modelAnswer": "One of the main causes is the financial burden.",
        "fallbackKeywords": [
          "financial burden",
          "main causes"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w4t7_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"tuition fees\"):\n\n\"Học phí cao khiến nhiều sinh viên không thể tiếp tục học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High tuition fees prevent many students from continuing their education.",
        "explanationVi": "'Tuition fees' = học phí. 'Prevent + O + from + V-ing' = ngăn cản ai làm gì — cấu trúc IELTS Band 7+ quan trọng.",
        "modelAnswer": "High tuition fees prevent many students from continuing their education.",
        "fallbackKeywords": [
          "tuition fees",
          "high",
          "prevent",
          "continuing",
          "education"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w4t7_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"student loan debt\"):\n\n\"Nhiều sinh viên phải gánh nợ vay lớn sau khi tốt nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many students are burdened with significant student loan debt after graduating.",
        "explanationVi": "'Be burdened with' = bị gánh nặng bởi — passive idiom học thuật. 'After graduating' = rút gọn mệnh đề thời gian khi chủ ngữ giống nhau.",
        "modelAnswer": "Many students are burdened with significant student loan debt after graduating.",
        "fallbackKeywords": [
          "student loan debt",
          "burdened",
          "significant",
          "graduating"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w4t7_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"academic failure\"):\n\n\"Một số sinh viên bỏ học vì thất bại trong học tập.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some students drop out due to academic failure.",
        "explanationVi": "'Due to + N' = do, vì — giới từ nguyên nhân (academic hơn 'because of'). 'Academic failure' = thất bại trong học tập — cụm danh từ học thuật.",
        "modelAnswer": "Some students drop out due to academic failure.",
        "fallbackKeywords": [
          "academic failure",
          "drop out"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w4t7_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental health issues\"):\n\n\"Vấn đề sức khỏe tinh thần khiến sinh viên khó tiếp tục học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mental health issues make it difficult for students to continue their studies.",
        "explanationVi": "'Make it difficult for + O + to V' = khiến việc làm gì trở nên khó khăn — 'it' là dummy subject. Cấu trúc này phổ biến hơn 'make students difficult to'.",
        "modelAnswer": "Mental health issues make it difficult for students to continue their studies.",
        "fallbackKeywords": [
          "mental health issues",
          "students",
          "continue",
          "studies"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w4t7_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"low income\" + \"unemployment\"):\n\n\"Việc không có bằng đại học có thể dẫn đến thu nhập thấp và thất nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not having a university degree can lead to low income and unemployment.",
        "explanationVi": "'Not having + N' = gerund phủ định làm chủ ngữ. 'Lead to + N' = dẫn đến (hai kết quả song song: low income and unemployment).",
        "modelAnswer": "Not having a university degree can lead to low income and unemployment.",
        "fallbackKeywords": [
          "low income",
          "unemployment",
          "university degree",
          "lead to"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w4t7_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"academic counseling\"):\n\n\"Chính phủ nên cung cấp nhiều chương trình tư vấn học tập hơn cho sinh viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should provide more academic counseling programmes to support students.",
        "explanationVi": "'Academic counseling' = tư vấn học tập/hướng nghiệp. 'Should provide' = should + V (đề xuất giải pháp). 'Programmes' = spelling British English.",
        "modelAnswer": "The government should provide more academic counseling programmes to support students.",
        "fallbackKeywords": [
          "academic counseling",
          "government",
          "programmes",
          "support"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w4t7_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career guidance\"):\n\n\"Các trường đại học cần tăng cường hướng nghiệp cho sinh viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Universities need to strengthen career guidance services for their students.",
        "explanationVi": "'Career guidance' = hướng dẫn nghề nghiệp. 'Strengthen' = tăng cường, củng cố — học thuật hơn 'improve' hay 'increase'. 'Services' nhấn mạnh đây là dịch vụ thể chế.",
        "modelAnswer": "Universities need to strengthen career guidance services for their students.",
        "fallbackKeywords": [
          "career guidance",
          "universities",
          "strengthen",
          "students"
        ],
        "orderIndex": 18,
        "isActive": true
      }
    ]
  },
  {
    "week": 5,
    "block": "cause_solution",
    "topicName": "Rise in Modern Mental Stress & Anxiety",
    "topicEmoji": "🧠",
    "essayType": "cause_solution",
    "prompt": "Stress-related mental illnesses and anxiety disorders have become increasingly prevalent in modern society. What are the primary causes of this issue, and what solutions can be implemented to improve public mental well-being?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 31,
    "vocabularyList": [
      {
        "term": "anxiety disorder",
        "definitionVi": "rối loạn lo âu",
        "example": "Anxiety disorders have become increasingly prevalent in modern society."
      },
      {
        "term": "mental well-being",
        "definitionVi": "sức khỏe tinh thần",
        "example": "Governments should invest more in public mental well-being programmes."
      },
      {
        "term": "work-related stress",
        "definitionVi": "căng thẳng liên quan đến công việc",
        "example": "Work-related stress is one of the primary causes of modern anxiety."
      },
      {
        "term": "social isolation",
        "definitionVi": "sự cô lập xã hội",
        "example": "Social isolation can significantly worsen a person's mental health."
      },
      {
        "term": "information overload",
        "definitionVi": "quá tải thông tin",
        "example": "Constant information overload from the internet contributes to anxiety."
      },
      {
        "term": "counselling services",
        "definitionVi": "dịch vụ tư vấn tâm lý",
        "example": "Schools and workplaces should offer accessible counselling services."
      },
      {
        "term": "stigma",
        "definitionVi": "sự kỳ thị",
        "example": "Stigma around mental illness prevents many people from seeking help."
      },
      {
        "term": "coping mechanism",
        "definitionVi": "cơ chế đối phó",
        "example": "Learning healthy coping mechanisms can reduce the impact of stress."
      },
      {
        "term": "sleep deprivation",
        "definitionVi": "thiếu ngủ",
        "example": "Chronic sleep deprivation is closely linked to higher anxiety levels."
      },
      {
        "term": "financial pressure",
        "definitionVi": "áp lực tài chính",
        "example": "Financial pressure is a major source of stress for many adults."
      },
      {
        "term": "mindfulness practice",
        "definitionVi": "thực hành chánh niệm",
        "example": "Mindfulness practice has been shown to reduce symptoms of anxiety."
      },
      {
        "term": "workplace wellness programme",
        "definitionVi": "chương trình chăm sóc sức khỏe nơi làm việc",
        "example": "Workplace wellness programmes can help employees manage stress."
      },
      {
        "term": "social media pressure",
        "definitionVi": "áp lực từ mạng xã hội",
        "example": "Social media pressure to appear successful can trigger anxiety."
      },
      {
        "term": "early intervention",
        "definitionVi": "can thiệp sớm",
        "example": "Early intervention greatly improves outcomes for people with anxiety disorders."
      },
      {
        "term": "burnout",
        "definitionVi": "kiệt sức",
        "example": "Prolonged stress without rest can eventually lead to burnout."
      },
      {
        "term": "mental health awareness",
        "definitionVi": "nhận thức về sức khỏe tâm thần",
        "example": "Mental health awareness campaigns can encourage people to seek support."
      },
      {
        "term": "therapy access",
        "definitionVi": "khả năng tiếp cận trị liệu tâm lý",
        "example": "Improving therapy access is essential for tackling rising anxiety rates."
      },
      {
        "term": "life-work balance",
        "definitionVi": "cân bằng cuộc sống và công việc",
        "example": "A healthy life-work balance can reduce chronic stress levels."
      },
      {
        "term": "chronic stress",
        "definitionVi": "căng thẳng mãn tính",
        "example": "Chronic stress can have serious long-term effects on physical health."
      },
      {
        "term": "public health campaign",
        "definitionVi": "chiến dịch y tế công cộng",
        "example": "Public health campaigns can help reduce the stigma of mental illness."
      },
      {
        "term": "take a toll on mental health",
        "definitionVi": "gây tổn hại đến sức khỏe tinh thần",
        "example": "Constant pressure at work can take a toll on mental health."
      },
      {
        "term": "seek professional help",
        "definitionVi": "tìm kiếm sự giúp đỡ chuyên nghiệp",
        "example": "More young people are willing to seek professional help for anxiety."
      },
      {
        "term": "cope with pressure",
        "definitionVi": "đối phó với áp lực",
        "example": "Students need effective strategies to cope with academic pressure."
      },
      {
        "term": "spiral out of control",
        "definitionVi": "trở nên mất kiểm soát",
        "example": "Untreated anxiety can spiral out of control if left unaddressed."
      },
      {
        "term": "break the stigma around",
        "definitionVi": "phá bỏ sự kỳ thị xung quanh",
        "example": "Public campaigns aim to break the stigma around mental illness."
      },
      {
        "term": "provide a safe space for",
        "definitionVi": "tạo ra một không gian an toàn cho",
        "example": "Support groups provide a safe space for people to share their struggles."
      },
      {
        "term": "trigger anxiety symptoms",
        "definitionVi": "kích hoạt các triệu chứng lo âu",
        "example": "Social media use can trigger anxiety symptoms in vulnerable individuals."
      },
      {
        "term": "prioritise mental well-being",
        "definitionVi": "ưu tiên sức khỏe tinh thần",
        "example": "Companies should prioritise mental well-being alongside productivity."
      },
      {
        "term": "build resilience",
        "definitionVi": "xây dựng khả năng phục hồi tinh thần",
        "example": "Mindfulness practices can help individuals build resilience to stress."
      },
      {
        "term": "weigh heavily on someone",
        "definitionVi": "đè nặng lên tâm trí ai đó",
        "example": "Financial insecurity can weigh heavily on a person's mind."
      }
    ],
    "questions": [
      {
        "questionId": "w5ms_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the primary causes of this issue, and what solutions can be implemented to improve public mental well-being?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Solution",
        "explanationVi": "Keyword 'causes' kết hợp với 'what solutions can be implemented' xác định đây là dạng Cause & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w5ms_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Stress-related mental illnesses and anxiety disorders have become increasingly _____ in modern society.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "prevalent",
        "explanationVi": "'Prevalent' = phổ biến, thịnh hành. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w5ms_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các bệnh tâm lý liên quan đến căng thẳng ngày càng trở nên phổ biến trong xã hội hiện đại.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Stress-related mental illnesses have become increasingly prevalent in modern society.",
        "explanationVi": "'Increasingly + adj' = ngày càng. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Stress-related mental illnesses have become increasingly prevalent in modern society.",
        "fallbackKeywords": [
          "stress-related mental illnesses",
          "prevalent",
          "modern society"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w5ms_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Căng thẳng liên quan đến công việc là một trong những nguyên nhân chính của lo âu hiện đại.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Work-related stress is one of the primary causes of modern anxiety.",
        "explanationVi": "'Work-related stress' = căng thẳng liên quan đến công việc. 'One of the primary causes of' = một trong những nguyên nhân chính của.",
        "modelAnswer": "Work-related stress is one of the primary causes of modern anxiety.",
        "fallbackKeywords": [
          "work-related stress",
          "primary causes",
          "anxiety"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w5ms_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sự cô lập xã hội có thể làm sức khỏe tinh thần của một người trở nên tồi tệ hơn đáng kể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social isolation can significantly worsen a person's mental health.",
        "explanationVi": "'Social isolation' = sự cô lập xã hội. 'Significantly worsen' = làm tồi tệ hơn đáng kể.",
        "modelAnswer": "Social isolation can significantly worsen a person's mental health.",
        "fallbackKeywords": [
          "social isolation",
          "worsen",
          "mental health"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w5ms_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Trường học và nơi làm việc nên cung cấp các dịch vụ tư vấn tâm lý dễ tiếp cận.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Schools and workplaces should offer accessible counselling services.",
        "explanationVi": "'Counselling services' = dịch vụ tư vấn tâm lý. 'Accessible' = dễ tiếp cận.",
        "modelAnswer": "Schools and workplaces should offer accessible counselling services.",
        "fallbackKeywords": [
          "counselling services",
          "accessible",
          "schools and workplaces"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w5ms_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by promoting / workplace wellness programmes / reduce employee stress / Companies]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Companies could reduce employee stress by promoting workplace wellness programmes.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp và cách thực hiện. 'Workplace wellness programme' = chương trình chăm sóc sức khỏe nơi làm việc.",
        "modelAnswer": "Companies could reduce employee stress by promoting workplace wellness programmes.",
        "fallbackKeywords": [
          "companies",
          "reduce employee stress",
          "wellness programmes"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w5ms_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to invest more in mental health awareness campaigns.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should invest more in mental health awareness campaigns.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should invest more in mental health awareness campaigns.",
        "fallbackKeywords": [
          "governments",
          "mental health awareness"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w5ms_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"information overload\"):\n\n\"Tình trạng quá tải thông tin liên tục từ internet góp phần gây ra lo âu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Constant information overload from the internet contributes to anxiety.",
        "explanationVi": "'Information overload' = quá tải thông tin. 'Contribute to + N' = góp phần gây ra.",
        "modelAnswer": "Constant information overload from the internet contributes to anxiety.",
        "fallbackKeywords": [
          "information overload",
          "internet",
          "contributes to anxiety"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w5ms_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"stigma\"):\n\n\"Sự kỳ thị xung quanh bệnh tâm lý ngăn cản nhiều người tìm kiếm sự giúp đỡ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Stigma around mental illness prevents many people from seeking help.",
        "explanationVi": "'Stigma around + N' = sự kỳ thị xung quanh. 'Prevent + O + from + V-ing' = ngăn cản ai làm gì.",
        "modelAnswer": "Stigma around mental illness prevents many people from seeking help.",
        "fallbackKeywords": [
          "stigma",
          "mental illness",
          "seeking help"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w5ms_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"coping mechanism\"):\n\n\"Học cách sử dụng các cơ chế đối phó lành mạnh có thể giảm bớt tác động của căng thẳng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Learning healthy coping mechanisms can reduce the impact of stress.",
        "explanationVi": "'Coping mechanism' = cơ chế đối phó. 'Reduce the impact of + N' = giảm bớt tác động của.",
        "modelAnswer": "Learning healthy coping mechanisms can reduce the impact of stress.",
        "fallbackKeywords": [
          "coping mechanisms",
          "reduce",
          "impact of stress"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w5ms_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sleep deprivation\"):\n\n\"Tình trạng thiếu ngủ mãn tính có liên hệ chặt chẽ với mức độ lo âu cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Chronic sleep deprivation is closely linked to higher anxiety levels.",
        "explanationVi": "'Sleep deprivation' = thiếu ngủ. 'Closely linked to + N' = có liên hệ chặt chẽ với.",
        "modelAnswer": "Chronic sleep deprivation is closely linked to higher anxiety levels.",
        "fallbackKeywords": [
          "sleep deprivation",
          "closely linked",
          "anxiety levels"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w5ms_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"financial pressure\"):\n\n\"Áp lực tài chính là một nguồn căng thẳng lớn đối với nhiều người trưởng thành.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Financial pressure is a major source of stress for many adults.",
        "explanationVi": "'Financial pressure' = áp lực tài chính. 'A major source of stress' = một nguồn căng thẳng lớn.",
        "modelAnswer": "Financial pressure is a major source of stress for many adults.",
        "fallbackKeywords": [
          "financial pressure",
          "major source",
          "stress"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w5ms_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mindfulness practice\"):\n\n\"Thực hành chánh niệm đã được chứng minh giúp giảm các triệu chứng lo âu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mindfulness practice has been shown to reduce symptoms of anxiety.",
        "explanationVi": "'Mindfulness practice' = thực hành chánh niệm. 'Has been shown to + V' = đã được chứng minh là.",
        "modelAnswer": "Mindfulness practice has been shown to reduce symptoms of anxiety.",
        "fallbackKeywords": [
          "mindfulness practice",
          "reduce symptoms",
          "anxiety"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w5ms_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social media pressure\"):\n\n\"Áp lực từ mạng xã hội để trông có vẻ thành công có thể gây ra lo âu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social media pressure to appear successful can trigger anxiety.",
        "explanationVi": "'Social media pressure' = áp lực từ mạng xã hội. 'Trigger + N' = gây ra, kích hoạt.",
        "modelAnswer": "Social media pressure to appear successful can trigger anxiety.",
        "fallbackKeywords": [
          "social media pressure",
          "appear successful",
          "trigger anxiety"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w5ms_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"early intervention\"):\n\n\"Can thiệp sớm giúp cải thiện đáng kể kết quả điều trị cho người mắc rối loạn lo âu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Early intervention greatly improves outcomes for people with anxiety disorders.",
        "explanationVi": "'Early intervention' = can thiệp sớm. 'Improve outcomes for' = cải thiện kết quả cho.",
        "modelAnswer": "Early intervention greatly improves outcomes for people with anxiety disorders.",
        "fallbackKeywords": [
          "early intervention",
          "improves outcomes",
          "anxiety disorders"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w5ms_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"burnout\"):\n\n\"Căng thẳng kéo dài mà không được nghỉ ngơi cuối cùng có thể dẫn đến kiệt sức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Prolonged stress without rest can eventually lead to burnout.",
        "explanationVi": "'Burnout' = kiệt sức (do làm việc/căng thẳng kéo dài). 'Eventually lead to' = cuối cùng dẫn đến.",
        "modelAnswer": "Prolonged stress without rest can eventually lead to burnout.",
        "fallbackKeywords": [
          "prolonged stress",
          "eventually lead to",
          "burnout"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w5ms_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"therapy access\"):\n\n\"Cải thiện khả năng tiếp cận trị liệu tâm lý là điều thiết yếu để giải quyết tỷ lệ lo âu ngày càng tăng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improving therapy access is essential for tackling rising anxiety rates.",
        "explanationVi": "'Therapy access' = khả năng tiếp cận trị liệu tâm lý. 'Tackle + N' = giải quyết, đối phó với.",
        "modelAnswer": "Improving therapy access is essential for tackling rising anxiety rates.",
        "fallbackKeywords": [
          "therapy access",
          "essential",
          "rising anxiety rates"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w5ms_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"life-work balance\"):\n\n\"Cân bằng cuộc sống và công việc lành mạnh có thể làm giảm mức độ căng thẳng mãn tính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A healthy life-work balance can reduce chronic stress levels.",
        "explanationVi": "'Life-work balance' = cân bằng cuộc sống và công việc. 'Chronic stress levels' = mức độ căng thẳng mãn tính.",
        "modelAnswer": "A healthy life-work balance can reduce chronic stress levels.",
        "fallbackKeywords": [
          "life-work balance",
          "reduce",
          "chronic stress"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w5ms_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public health campaign\"):\n\n\"Các chiến dịch y tế công cộng có thể giúp giảm bớt sự kỳ thị đối với bệnh tâm lý.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Public health campaigns can help reduce the stigma of mental illness.",
        "explanationVi": "'Public health campaign' = chiến dịch y tế công cộng. 'Reduce the stigma of' = giảm bớt sự kỳ thị đối với.",
        "modelAnswer": "Public health campaigns can help reduce the stigma of mental illness.",
        "fallbackKeywords": [
          "public health campaigns",
          "reduce the stigma",
          "mental illness"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 5,
    "block": "cause_solution",
    "topicName": "Urban Sedentary Lifestyle",
    "topicEmoji": "🛋️",
    "essayType": "cause_solution",
    "prompt": "Many adults living in major cities struggle to get enough physical exercise in their daily routines. What causes this sedentary lifestyle, and what measures can be taken to encourage physical activity?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 32,
    "vocabularyList": [
      {
        "term": "sedentary lifestyle",
        "definitionVi": "lối sống ít vận động",
        "example": "Many adults in cities live a sedentary lifestyle due to desk-based jobs."
      },
      {
        "term": "physical activity",
        "definitionVi": "hoạt động thể chất",
        "example": "Regular physical activity is essential for maintaining good health."
      },
      {
        "term": "desk-based job",
        "definitionVi": "công việc văn phòng, ngồi bàn giấy",
        "example": "Desk-based jobs often leave little time for movement during the day."
      },
      {
        "term": "long commuting hours",
        "definitionVi": "thời gian di chuyển dài",
        "example": "Long commuting hours reduce the time people have for exercise."
      },
      {
        "term": "urban planning",
        "definitionVi": "quy hoạch đô thị",
        "example": "Poor urban planning can discourage walking and cycling."
      },
      {
        "term": "recreational facilities",
        "definitionVi": "cơ sở vật chất giải trí",
        "example": "A lack of recreational facilities makes it harder for residents to exercise."
      },
      {
        "term": "screen time",
        "definitionVi": "thời gian sử dụng màn hình",
        "example": "Excessive screen time is closely associated with a sedentary lifestyle."
      },
      {
        "term": "cardiovascular disease",
        "definitionVi": "bệnh tim mạch",
        "example": "A lack of exercise significantly increases the risk of cardiovascular disease."
      },
      {
        "term": "public green spaces",
        "definitionVi": "không gian xanh công cộng",
        "example": "Public green spaces encourage residents to engage in outdoor activities."
      },
      {
        "term": "workplace incentives",
        "definitionVi": "ưu đãi tại nơi làm việc",
        "example": "Workplace incentives could motivate employees to exercise more regularly."
      },
      {
        "term": "time constraints",
        "definitionVi": "hạn chế về thời gian",
        "example": "Time constraints prevent many busy professionals from exercising."
      },
      {
        "term": "obesity risk",
        "definitionVi": "nguy cơ béo phì",
        "example": "A sedentary lifestyle significantly raises obesity risk."
      },
      {
        "term": "muscle atrophy",
        "definitionVi": "teo cơ",
        "example": "Prolonged inactivity can eventually lead to muscle atrophy."
      },
      {
        "term": "community sports programme",
        "definitionVi": "chương trình thể thao cộng đồng",
        "example": "Community sports programmes can help residents build regular exercise habits."
      },
      {
        "term": "cycling infrastructure",
        "definitionVi": "cơ sở hạ tầng cho xe đạp",
        "example": "Better cycling infrastructure would make active commuting safer."
      },
      {
        "term": "gym membership",
        "definitionVi": "thẻ thành viên phòng gym",
        "example": "Affordable gym memberships could encourage more people to exercise."
      },
      {
        "term": "sitting-related health risks",
        "definitionVi": "rủi ro sức khỏe liên quan đến ngồi nhiều",
        "example": "Sitting-related health risks include back pain and poor circulation."
      },
      {
        "term": "active commuting",
        "definitionVi": "di chuyển chủ động (đi bộ, đạp xe)",
        "example": "Active commuting is an easy way to fit exercise into a busy schedule."
      },
      {
        "term": "wellness culture",
        "definitionVi": "văn hóa chăm sóc sức khỏe",
        "example": "Companies with a strong wellness culture tend to have healthier employees."
      },
      {
        "term": "public awareness campaign",
        "definitionVi": "chiến dịch nâng cao nhận thức cộng đồng",
        "example": "Public awareness campaigns can highlight the dangers of inactivity."
      },
      {
        "term": "lead a sedentary life",
        "definitionVi": "sống một cuộc sống ít vận động",
        "example": "Many office workers lead a sedentary life due to long desk hours."
      },
      {
        "term": "get into the habit of",
        "definitionVi": "hình thành thói quen",
        "example": "Urban residents should get into the habit of walking short distances."
      },
      {
        "term": "take up regular exercise",
        "definitionVi": "bắt đầu tập thể dục đều đặn",
        "example": "Health campaigns encourage citizens to take up regular exercise."
      },
      {
        "term": "pose a serious risk to",
        "definitionVi": "gây ra nguy cơ nghiêm trọng cho",
        "example": "Physical inactivity poses a serious risk to cardiovascular health."
      },
      {
        "term": "carve out time for",
        "definitionVi": "dành ra thời gian cho",
        "example": "Busy professionals often struggle to carve out time for exercise."
      },
      {
        "term": "reap the health benefits of",
        "definitionVi": "gặt hái lợi ích sức khỏe từ",
        "example": "Even short walks allow people to reap the health benefits of movement."
      },
      {
        "term": "make physical activity accessible",
        "definitionVi": "làm cho hoạt động thể chất trở nên dễ tiếp cận",
        "example": "Cities should make physical activity accessible through free public facilities."
      },
      {
        "term": "counteract the effects of",
        "definitionVi": "chống lại tác động của",
        "example": "Short daily walks can counteract the effects of sitting all day."
      },
      {
        "term": "integrate movement into",
        "definitionVi": "lồng ghép sự vận động vào",
        "example": "Urban planners should integrate movement into people's daily routines."
      },
      {
        "term": "fall into unhealthy patterns",
        "definitionVi": "rơi vào những mô hình sống không lành mạnh",
        "example": "It is easy to fall into unhealthy patterns when working from home."
      }
    ],
    "questions": [
      {
        "questionId": "w5us_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What causes this sedentary lifestyle, and what measures can be taken to encourage physical activity?\" — Đây là dạng essay nào?",
        "options": [
          "Effect & Solution",
          "Cause & Solution",
          "Cause & Effect",
          "Discuss Both Views"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Solution",
        "explanationVi": "Keyword 'causes' kết hợp với 'what measures can be taken' (giải pháp) xác định đây là dạng Cause & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w5us_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Many adults living in major cities _____ to get enough physical exercise in their daily routines.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "struggle",
        "explanationVi": "'Struggle to + V' = gặp khó khăn khi làm gì. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w5us_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều người trưởng thành sống ở thành phố lớn gặp khó khăn trong việc vận động đủ mỗi ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many adults living in big cities struggle to exercise enough every day.",
        "explanationVi": "'Struggle to + V' = gặp khó khăn khi làm gì. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Many adults living in big cities struggle to exercise enough every day.",
        "fallbackKeywords": [
          "adults",
          "big cities",
          "struggle to exercise"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w5us_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Công việc văn phòng thường không để lại nhiều thời gian cho việc vận động trong ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Desk-based jobs often leave little time for movement during the day.",
        "explanationVi": "'Desk-based job' = công việc văn phòng, ngồi bàn giấy. 'Leave little time for' = không để lại nhiều thời gian cho.",
        "modelAnswer": "Desk-based jobs often leave little time for movement during the day.",
        "fallbackKeywords": [
          "desk-based jobs",
          "little time",
          "movement"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w5us_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thời gian di chuyển dài làm giảm thời gian mọi người có thể dành cho việc tập thể dục.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Long commuting hours reduce the time people have for exercise.",
        "explanationVi": "'Long commuting hours' = thời gian di chuyển dài. 'Reduce the time... for' = làm giảm thời gian cho.",
        "modelAnswer": "Long commuting hours reduce the time people have for exercise.",
        "fallbackKeywords": [
          "long commuting hours",
          "reduce",
          "exercise"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w5us_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thiếu cơ sở vật chất giải trí khiến người dân khó tập thể dục hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of recreational facilities makes it harder for residents to exercise.",
        "explanationVi": "'Recreational facilities' = cơ sở vật chất giải trí. 'Make it harder for + O + to V' = khiến ai khó làm gì hơn.",
        "modelAnswer": "A lack of recreational facilities makes it harder for residents to exercise.",
        "fallbackKeywords": [
          "recreational facilities",
          "residents",
          "exercise"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w5us_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by building / more public green spaces / encourage outdoor activity / Cities]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cities could encourage outdoor activity by building more public green spaces.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Public green spaces' = không gian xanh công cộng.",
        "modelAnswer": "Cities could encourage outdoor activity by building more public green spaces.",
        "fallbackKeywords": [
          "cities",
          "encourage outdoor activity",
          "green spaces"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w5us_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Companies should to offer workplace incentives for regular exercise.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Companies should offer workplace incentives for regular exercise.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Companies should offer workplace incentives for regular exercise.",
        "fallbackKeywords": [
          "companies",
          "workplace incentives"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w5us_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban planning\"):\n\n\"Quy hoạch đô thị kém có thể khiến người dân e ngại việc đi bộ và đạp xe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Poor urban planning can discourage walking and cycling.",
        "explanationVi": "'Urban planning' = quy hoạch đô thị. 'Discourage + N/V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "Poor urban planning can discourage walking and cycling.",
        "fallbackKeywords": [
          "urban planning",
          "discourage",
          "walking and cycling"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w5us_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"screen time\"):\n\n\"Thời gian sử dụng màn hình quá nhiều có liên hệ chặt chẽ với lối sống ít vận động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excessive screen time is closely associated with a sedentary lifestyle.",
        "explanationVi": "'Screen time' = thời gian sử dụng màn hình. 'Closely associated with + N' = có liên hệ chặt chẽ với.",
        "modelAnswer": "Excessive screen time is closely associated with a sedentary lifestyle.",
        "fallbackKeywords": [
          "screen time",
          "closely associated",
          "sedentary lifestyle"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w5us_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cardiovascular disease\"):\n\n\"Thiếu vận động làm tăng đáng kể nguy cơ mắc bệnh tim mạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of exercise significantly increases the risk of cardiovascular disease.",
        "explanationVi": "'Cardiovascular disease' = bệnh tim mạch. 'Increase the risk of + N' = làm tăng nguy cơ mắc.",
        "modelAnswer": "A lack of exercise significantly increases the risk of cardiovascular disease.",
        "fallbackKeywords": [
          "lack of exercise",
          "cardiovascular disease",
          "risk"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w5us_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"time constraints\"):\n\n\"Hạn chế về thời gian ngăn cản nhiều người làm việc bận rộn tập thể dục.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Time constraints prevent many busy professionals from exercising.",
        "explanationVi": "'Time constraints' = hạn chế về thời gian. 'Prevent + O + from + V-ing' = ngăn cản ai làm gì.",
        "modelAnswer": "Time constraints prevent many busy professionals from exercising.",
        "fallbackKeywords": [
          "time constraints",
          "prevent",
          "busy professionals"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w5us_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"obesity risk\"):\n\n\"Lối sống ít vận động làm tăng đáng kể nguy cơ béo phì.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sedentary lifestyle significantly raises obesity risk.",
        "explanationVi": "'Obesity risk' = nguy cơ béo phì. 'Raise + N' = làm tăng.",
        "modelAnswer": "A sedentary lifestyle significantly raises obesity risk.",
        "fallbackKeywords": [
          "sedentary lifestyle",
          "obesity risk",
          "raises"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w5us_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"community sports programme\"):\n\n\"Các chương trình thể thao cộng đồng có thể giúp cư dân hình thành thói quen tập thể dục đều đặn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community sports programmes can help residents build regular exercise habits.",
        "explanationVi": "'Community sports programme' = chương trình thể thao cộng đồng. 'Build + N' = hình thành, xây dựng.",
        "modelAnswer": "Community sports programmes can help residents build regular exercise habits.",
        "fallbackKeywords": [
          "community sports programmes",
          "exercise habits",
          "residents"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w5us_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cycling infrastructure\"):\n\n\"Cơ sở hạ tầng cho xe đạp tốt hơn sẽ khiến việc di chuyển chủ động trở nên an toàn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Better cycling infrastructure would make active commuting safer.",
        "explanationVi": "'Cycling infrastructure' = cơ sở hạ tầng cho xe đạp. 'Active commuting' = di chuyển chủ động.",
        "modelAnswer": "Better cycling infrastructure would make active commuting safer.",
        "fallbackKeywords": [
          "cycling infrastructure",
          "active commuting",
          "safer"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w5us_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"gym membership\"):\n\n\"Thẻ thành viên phòng gym với giá cả phải chăng có thể khuyến khích nhiều người tập thể dục hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Affordable gym memberships could encourage more people to exercise.",
        "explanationVi": "'Gym membership' = thẻ thành viên phòng gym. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "Affordable gym memberships could encourage more people to exercise.",
        "fallbackKeywords": [
          "gym memberships",
          "affordable",
          "encourage"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w5us_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sitting-related health risks\"):\n\n\"Các rủi ro sức khỏe liên quan đến việc ngồi nhiều bao gồm đau lưng và tuần hoàn máu kém.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sitting-related health risks include back pain and poor circulation.",
        "explanationVi": "'Sitting-related health risks' = rủi ro sức khỏe liên quan đến ngồi nhiều. 'Poor circulation' = tuần hoàn máu kém.",
        "modelAnswer": "Sitting-related health risks include back pain and poor circulation.",
        "fallbackKeywords": [
          "sitting-related health risks",
          "back pain",
          "poor circulation"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w5us_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"muscle atrophy\"):\n\n\"Sự thiếu vận động kéo dài cuối cùng có thể dẫn đến teo cơ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Prolonged inactivity can eventually lead to muscle atrophy.",
        "explanationVi": "'Muscle atrophy' = teo cơ. 'Prolonged inactivity' = sự thiếu vận động kéo dài.",
        "modelAnswer": "Prolonged inactivity can eventually lead to muscle atrophy.",
        "fallbackKeywords": [
          "prolonged inactivity",
          "muscle atrophy",
          "eventually"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w5us_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"wellness culture\"):\n\n\"Các công ty có văn hóa chăm sóc sức khỏe mạnh mẽ thường có nhân viên khỏe mạnh hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Companies with a strong wellness culture tend to have healthier employees.",
        "explanationVi": "'Wellness culture' = văn hóa chăm sóc sức khỏe. 'Tend to + V' = có xu hướng.",
        "modelAnswer": "Companies with a strong wellness culture tend to have healthier employees.",
        "fallbackKeywords": [
          "wellness culture",
          "healthier employees"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w5us_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public awareness campaign\"):\n\n\"Các chiến dịch nâng cao nhận thức cộng đồng có thể làm nổi bật những nguy hiểm của sự ít vận động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Public awareness campaigns can highlight the dangers of inactivity.",
        "explanationVi": "'Public awareness campaign' = chiến dịch nâng cao nhận thức cộng đồng. 'Highlight + N' = làm nổi bật.",
        "modelAnswer": "Public awareness campaigns can highlight the dangers of inactivity.",
        "fallbackKeywords": [
          "public awareness campaigns",
          "highlight",
          "dangers of inactivity"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 6,
    "block": "cause_solution",
    "topicName": "Growing Rates of Childhood Obesity",
    "topicEmoji": "🍔",
    "essayType": "cause_solution",
    "prompt": "Childhood obesity rates have risen sharply in many parts of the world due to unhealthy eating habits and screen time. What are the underlying causes of this problem, and what steps should be taken to tackle it?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 33,
    "vocabularyList": [
      {
        "term": "childhood obesity",
        "definitionVi": "béo phì ở trẻ em",
        "example": "Childhood obesity rates have risen sharply in many parts of the world."
      },
      {
        "term": "unhealthy eating habits",
        "definitionVi": "thói quen ăn uống không lành mạnh",
        "example": "Unhealthy eating habits are a major contributor to childhood obesity."
      },
      {
        "term": "sugary drinks",
        "definitionVi": "đồ uống có đường",
        "example": "Regular consumption of sugary drinks adds excess calories to a child's diet."
      },
      {
        "term": "portion sizes",
        "definitionVi": "khẩu phần ăn",
        "example": "Oversized portion sizes encourage children to overeat."
      },
      {
        "term": "physical education",
        "definitionVi": "giáo dục thể chất",
        "example": "Cutting physical education classes reduces children's daily activity levels."
      },
      {
        "term": "nutritional education",
        "definitionVi": "giáo dục dinh dưỡng",
        "example": "Nutritional education can teach children to make healthier food choices."
      },
      {
        "term": "junk food advertising",
        "definitionVi": "quảng cáo đồ ăn vặt",
        "example": "Junk food advertising targeted at children encourages poor eating habits."
      },
      {
        "term": "parental influence",
        "definitionVi": "ảnh hưởng từ cha mẹ",
        "example": "Parental influence plays a major role in shaping a child's eating habits."
      },
      {
        "term": "sedentary entertainment",
        "definitionVi": "hình thức giải trí ít vận động",
        "example": "Sedentary entertainment such as video games reduces children's physical activity."
      },
      {
        "term": "long-term health risks",
        "definitionVi": "rủi ro sức khỏe lâu dài",
        "example": "Childhood obesity is linked to long-term health risks such as diabetes."
      },
      {
        "term": "school lunch programme",
        "definitionVi": "chương trình bữa trưa học đường",
        "example": "A healthier school lunch programme could reduce childhood obesity rates."
      },
      {
        "term": "sugar tax",
        "definitionVi": "thuế đường",
        "example": "Some countries have introduced a sugar tax to discourage sugary drink consumption."
      },
      {
        "term": "self-esteem issues",
        "definitionVi": "vấn đề về lòng tự trọng",
        "example": "Obesity in children can lead to self-esteem issues and social exclusion."
      },
      {
        "term": "food labelling",
        "definitionVi": "ghi nhãn thực phẩm",
        "example": "Clearer food labelling can help parents make informed dietary choices."
      },
      {
        "term": "diabetes risk",
        "definitionVi": "nguy cơ mắc tiểu đường",
        "example": "Excess weight in children raises their diabetes risk later in life."
      },
      {
        "term": "screen time limits",
        "definitionVi": "giới hạn thời gian sử dụng màn hình",
        "example": "Setting screen time limits could encourage children to be more active."
      },
      {
        "term": "community sports facilities",
        "definitionVi": "cơ sở thể thao cộng đồng",
        "example": "More community sports facilities would give children safe places to be active."
      },
      {
        "term": "healthy meal preparation",
        "definitionVi": "chuẩn bị bữa ăn lành mạnh",
        "example": "Teaching healthy meal preparation at school can improve children's diets."
      },
      {
        "term": "fast food accessibility",
        "definitionVi": "khả năng tiếp cận đồ ăn nhanh",
        "example": "High fast food accessibility near schools contributes to poor eating habits."
      },
      {
        "term": "public health initiative",
        "definitionVi": "sáng kiến y tế công cộng",
        "example": "A national public health initiative could help tackle childhood obesity."
      },
      {
        "term": "instil healthy eating habits",
        "definitionVi": "hình thành thói quen ăn uống lành mạnh",
        "example": "Parents play a key role in instilling healthy eating habits early on."
      },
      {
        "term": "tackle the root causes of",
        "definitionVi": "giải quyết tận gốc nguyên nhân của",
        "example": "Effective policies must tackle the root causes of childhood obesity."
      },
      {
        "term": "curb the consumption of",
        "definitionVi": "hạn chế việc tiêu thụ",
        "example": "Schools should curb the consumption of sugary snacks on campus."
      },
      {
        "term": "set a positive example",
        "definitionVi": "làm gương tích cực",
        "example": "Parents can set a positive example by eating balanced meals themselves."
      },
      {
        "term": "place children at risk of",
        "definitionVi": "đặt trẻ em vào nguy cơ mắc",
        "example": "Poor diets place children at risk of long-term health problems."
      },
      {
        "term": "encourage active play",
        "definitionVi": "khuyến khích vui chơi vận động",
        "example": "Communities should encourage active play instead of screen time."
      },
      {
        "term": "limit exposure to advertising",
        "definitionVi": "hạn chế tiếp xúc với quảng cáo",
        "example": "Regulations can limit children's exposure to junk food advertising."
      },
      {
        "term": "promote a balanced diet",
        "definitionVi": "thúc đẩy chế độ ăn cân bằng",
        "example": "Nutrition education helps promote a balanced diet among students."
      },
      {
        "term": "shape lifelong habits",
        "definitionVi": "định hình những thói quen suốt đời",
        "example": "Childhood experiences shape lifelong habits around food and exercise."
      },
      {
        "term": "combat rising obesity rates",
        "definitionVi": "chống lại tỷ lệ béo phì đang gia tăng",
        "example": "Governments are launching initiatives to combat rising obesity rates."
      }
    ],
    "questions": [
      {
        "questionId": "w6ob_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the underlying causes of this problem, and what steps should be taken to tackle it?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Solution",
        "explanationVi": "Keyword 'causes' kết hợp với 'what steps should be taken' (giải pháp) xác định đây là dạng Cause & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w6ob_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Childhood obesity rates have risen _____ in many parts of the world.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "sharply",
        "explanationVi": "'Rise sharply' = tăng mạnh. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w6ob_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tỷ lệ béo phì ở trẻ em đã tăng mạnh ở nhiều nơi trên thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Childhood obesity rates have risen sharply in many parts of the world.",
        "explanationVi": "'Rise sharply' = tăng mạnh. Câu lấy trực tiếp từ đề bài.",
        "modelAnswer": "Childhood obesity rates have risen sharply in many parts of the world.",
        "fallbackKeywords": [
          "childhood obesity rates",
          "risen sharply"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w6ob_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thói quen ăn uống không lành mạnh là một nguyên nhân chính gây ra béo phì ở trẻ em.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unhealthy eating habits are a major cause of childhood obesity.",
        "explanationVi": "'Unhealthy eating habits' = thói quen ăn uống không lành mạnh. 'A major cause of' = một nguyên nhân chính của.",
        "modelAnswer": "Unhealthy eating habits are a major cause of childhood obesity.",
        "fallbackKeywords": [
          "unhealthy eating habits",
          "major cause",
          "childhood obesity"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w6ob_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc cắt giảm các giờ học giáo dục thể chất làm giảm mức độ vận động hằng ngày của trẻ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cutting physical education classes reduces children's daily activity levels.",
        "explanationVi": "'Physical education' = giáo dục thể chất. 'Reduce + N' = làm giảm.",
        "modelAnswer": "Cutting physical education classes reduces children's daily activity levels.",
        "fallbackKeywords": [
          "physical education",
          "reduces",
          "activity levels"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w6ob_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Quảng cáo đồ ăn vặt nhắm đến trẻ em khuyến khích những thói quen ăn uống không tốt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Junk food advertising targeted at children encourages poor eating habits.",
        "explanationVi": "'Junk food advertising' = quảng cáo đồ ăn vặt. 'Targeted at + N' = nhắm đến.",
        "modelAnswer": "Junk food advertising targeted at children encourages poor eating habits.",
        "fallbackKeywords": [
          "junk food advertising",
          "children",
          "poor eating habits"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w6ob_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by improving / school lunch programmes / reduce childhood obesity / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could reduce childhood obesity by improving school lunch programmes.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'School lunch programme' = chương trình bữa trưa học đường.",
        "modelAnswer": "Governments could reduce childhood obesity by improving school lunch programmes.",
        "fallbackKeywords": [
          "governments",
          "reduce childhood obesity",
          "school lunch programmes"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w6ob_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Parents should to set screen time limits for their children.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Parents should set screen time limits for their children.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Parents should set screen time limits for their children.",
        "fallbackKeywords": [
          "parents",
          "screen time limits"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w6ob_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sugary drinks\"):\n\n\"Việc thường xuyên tiêu thụ đồ uống có đường bổ sung thêm lượng calo dư thừa vào chế độ ăn của trẻ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Regular consumption of sugary drinks adds excess calories to a child's diet.",
        "explanationVi": "'Sugary drinks' = đồ uống có đường. 'Add excess calories to' = bổ sung thêm calo dư thừa vào.",
        "modelAnswer": "Regular consumption of sugary drinks adds excess calories to a child's diet.",
        "fallbackKeywords": [
          "sugary drinks",
          "excess calories",
          "diet"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w6ob_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"portion sizes\"):\n\n\"Khẩu phần ăn quá lớn khuyến khích trẻ em ăn quá nhiều.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Oversized portion sizes encourage children to overeat.",
        "explanationVi": "'Portion sizes' = khẩu phần ăn. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "Oversized portion sizes encourage children to overeat.",
        "fallbackKeywords": [
          "portion sizes",
          "overeat"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w6ob_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"parental influence\"):\n\n\"Ảnh hưởng từ cha mẹ đóng vai trò quan trọng trong việc hình thành thói quen ăn uống của trẻ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Parental influence plays a major role in shaping a child's eating habits.",
        "explanationVi": "'Parental influence' = ảnh hưởng từ cha mẹ. 'Play a major role in' = đóng vai trò quan trọng trong.",
        "modelAnswer": "Parental influence plays a major role in shaping a child's eating habits.",
        "fallbackKeywords": [
          "parental influence",
          "major role",
          "eating habits"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w6ob_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sedentary entertainment\"):\n\n\"Các hình thức giải trí ít vận động như trò chơi điện tử làm giảm hoạt động thể chất của trẻ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sedentary entertainment such as video games reduces children's physical activity.",
        "explanationVi": "'Sedentary entertainment' = hình thức giải trí ít vận động. 'Reduce + N' = làm giảm.",
        "modelAnswer": "Sedentary entertainment such as video games reduces children's physical activity.",
        "fallbackKeywords": [
          "sedentary entertainment",
          "video games",
          "physical activity"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w6ob_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"long-term health risks\"):\n\n\"Béo phì ở trẻ em có liên hệ với các rủi ro sức khỏe lâu dài như bệnh tiểu đường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Childhood obesity is linked to long-term health risks such as diabetes.",
        "explanationVi": "'Long-term health risks' = rủi ro sức khỏe lâu dài. 'Be linked to + N' = có liên hệ với.",
        "modelAnswer": "Childhood obesity is linked to long-term health risks such as diabetes.",
        "fallbackKeywords": [
          "childhood obesity",
          "long-term health risks",
          "diabetes"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w6ob_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sugar tax\"):\n\n\"Một số quốc gia đã áp dụng thuế đường để hạn chế việc tiêu thụ đồ uống có đường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some countries have introduced a sugar tax to discourage sugary drink consumption.",
        "explanationVi": "'Sugar tax' = thuế đường. 'Discourage + N' = hạn chế, khiến người ta e ngại.",
        "modelAnswer": "Some countries have introduced a sugar tax to discourage sugary drink consumption.",
        "fallbackKeywords": [
          "sugar tax",
          "discourage",
          "sugary drink consumption"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w6ob_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"self-esteem issues\"):\n\n\"Béo phì ở trẻ em có thể dẫn đến các vấn đề về lòng tự trọng và sự cô lập trong xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Obesity in children can lead to self-esteem issues and social exclusion.",
        "explanationVi": "'Self-esteem issues' = vấn đề về lòng tự trọng. 'Social exclusion' = sự cô lập trong xã hội.",
        "modelAnswer": "Obesity in children can lead to self-esteem issues and social exclusion.",
        "fallbackKeywords": [
          "self-esteem issues",
          "social exclusion",
          "obesity"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w6ob_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food labelling\"):\n\n\"Việc ghi nhãn thực phẩm rõ ràng hơn có thể giúp phụ huynh đưa ra lựa chọn ăn uống sáng suốt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Clearer food labelling can help parents make informed dietary choices.",
        "explanationVi": "'Food labelling' = ghi nhãn thực phẩm. 'Informed dietary choices' = lựa chọn ăn uống sáng suốt.",
        "modelAnswer": "Clearer food labelling can help parents make informed dietary choices.",
        "fallbackKeywords": [
          "food labelling",
          "informed dietary choices",
          "parents"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w6ob_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"diabetes risk\"):\n\n\"Cân nặng dư thừa ở trẻ em làm tăng nguy cơ mắc tiểu đường sau này trong cuộc đời.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excess weight in children raises their diabetes risk later in life.",
        "explanationVi": "'Diabetes risk' = nguy cơ mắc tiểu đường. 'Raise + N' = làm tăng.",
        "modelAnswer": "Excess weight in children raises their diabetes risk later in life.",
        "fallbackKeywords": [
          "excess weight",
          "diabetes risk",
          "later in life"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w6ob_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"community sports facilities\"):\n\n\"Nhiều cơ sở thể thao cộng đồng hơn sẽ mang lại cho trẻ em những nơi an toàn để vận động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More community sports facilities would give children safe places to be active.",
        "explanationVi": "'Community sports facilities' = cơ sở thể thao cộng đồng. 'Safe places to be active' = nơi an toàn để vận động.",
        "modelAnswer": "More community sports facilities would give children safe places to be active.",
        "fallbackKeywords": [
          "community sports facilities",
          "safe places",
          "active"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w6ob_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"fast food accessibility\"):\n\n\"Khả năng tiếp cận đồ ăn nhanh cao gần các trường học góp phần vào thói quen ăn uống kém.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High fast food accessibility near schools contributes to poor eating habits.",
        "explanationVi": "'Fast food accessibility' = khả năng tiếp cận đồ ăn nhanh. 'Contribute to + N' = góp phần gây ra.",
        "modelAnswer": "High fast food accessibility near schools contributes to poor eating habits.",
        "fallbackKeywords": [
          "fast food accessibility",
          "near schools",
          "poor eating habits"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w6ob_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public health initiative\"):\n\n\"Một sáng kiến y tế công cộng cấp quốc gia có thể giúp giải quyết vấn đề béo phì ở trẻ em.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A national public health initiative could help tackle childhood obesity.",
        "explanationVi": "'Public health initiative' = sáng kiến y tế công cộng. 'Tackle + N' = giải quyết, đối phó với.",
        "modelAnswer": "A national public health initiative could help tackle childhood obesity.",
        "fallbackKeywords": [
          "public health initiative",
          "tackle",
          "childhood obesity"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 6,
    "block": "cause_solution",
    "topicName": "Overreliance on Fast Food & Processed Foods",
    "topicEmoji": "🍟",
    "essayType": "cause_solution",
    "prompt": "People nowadays consume far more processed and fast food than fresh, home-cooked meals. What are the main causes of this shift, and how can governments and communities address this health concern?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 34,
    "vocabularyList": [
      {
        "term": "processed food",
        "definitionVi": "thực phẩm chế biến sẵn",
        "example": "People today consume far more processed food than in the past."
      },
      {
        "term": "home-cooked meal",
        "definitionVi": "bữa ăn tự nấu tại nhà",
        "example": "Fewer people have time to prepare a home-cooked meal every day."
      },
      {
        "term": "fast-paced lifestyle",
        "definitionVi": "lối sống bận rộn, gấp gáp",
        "example": "A fast-paced lifestyle leaves little time for meal preparation."
      },
      {
        "term": "convenience",
        "definitionVi": "sự tiện lợi",
        "example": "Fast food is popular mainly because of its convenience."
      },
      {
        "term": "cooking skills",
        "definitionVi": "kỹ năng nấu ăn",
        "example": "A decline in cooking skills has made people more reliant on fast food."
      },
      {
        "term": "food marketing",
        "definitionVi": "tiếp thị thực phẩm",
        "example": "Aggressive food marketing encourages the consumption of fast food."
      },
      {
        "term": "nutrient deficiency",
        "definitionVi": "thiếu hụt dinh dưỡng",
        "example": "A diet high in processed food can lead to nutrient deficiency."
      },
      {
        "term": "preservatives",
        "definitionVi": "chất bảo quản",
        "example": "Processed foods often contain preservatives to extend their shelf life."
      },
      {
        "term": "affordability",
        "definitionVi": "khả năng chi trả",
        "example": "The affordability of fast food makes it attractive to low-income families."
      },
      {
        "term": "meal preparation time",
        "definitionVi": "thời gian chuẩn bị bữa ăn",
        "example": "Long working hours reduce meal preparation time for many families."
      },
      {
        "term": "food subsidy",
        "definitionVi": "trợ cấp thực phẩm",
        "example": "A food subsidy for fresh produce could encourage healthier eating."
      },
      {
        "term": "public cooking classes",
        "definitionVi": "lớp học nấu ăn cộng đồng",
        "example": "Public cooking classes could help people rebuild basic cooking skills."
      },
      {
        "term": "obesity epidemic",
        "definitionVi": "đại dịch béo phì",
        "example": "Overreliance on fast food has contributed to a global obesity epidemic."
      },
      {
        "term": "processed sugar content",
        "definitionVi": "hàm lượng đường tinh chế",
        "example": "High processed sugar content in fast food raises long-term health risks."
      },
      {
        "term": "food desert",
        "definitionVi": "vùng thiếu thực phẩm tươi",
        "example": "In some food deserts, fast food is the only affordable option nearby."
      },
      {
        "term": "nutritional labelling",
        "definitionVi": "ghi nhãn dinh dưỡng",
        "example": "Clearer nutritional labelling could help consumers make healthier choices."
      },
      {
        "term": "health-conscious consumers",
        "definitionVi": "người tiêu dùng có ý thức sức khỏe",
        "example": "Health-conscious consumers are increasingly demanding fresh, whole foods."
      },
      {
        "term": "food subsidies for fresh produce",
        "definitionVi": "trợ cấp cho nông sản tươi",
        "example": "Food subsidies for fresh produce would lower the cost of healthy eating."
      },
      {
        "term": "chronic disease",
        "definitionVi": "bệnh mãn tính",
        "example": "A diet high in fast food is linked to a higher risk of chronic disease."
      },
      {
        "term": "community-supported agriculture",
        "definitionVi": "nông nghiệp hỗ trợ bởi cộng đồng",
        "example": "Community-supported agriculture gives residents access to affordable fresh produce."
      },
      {
        "term": "opt for convenience over health",
        "definitionVi": "chọn sự tiện lợi thay vì sức khỏe",
        "example": "Busy families often opt for convenience over health when choosing meals."
      },
      {
        "term": "reverse an unhealthy trend",
        "definitionVi": "đảo ngược một xu hướng không lành mạnh",
        "example": "Public health campaigns aim to reverse this unhealthy dietary trend."
      },
      {
        "term": "make healthy food affordable",
        "definitionVi": "làm cho thực phẩm lành mạnh có giá phải chăng",
        "example": "Subsidies can make healthy food affordable for low-income families."
      },
      {
        "term": "compromise on nutrition",
        "definitionVi": "hy sinh yếu tố dinh dưỡng",
        "example": "People often compromise on nutrition when short on time."
      },
      {
        "term": "revive traditional cooking",
        "definitionVi": "khôi phục việc nấu ăn truyền thống",
        "example": "Cooking classes aim to revive traditional home cooking among young adults."
      },
      {
        "term": "flood the market with",
        "definitionVi": "tràn ngập thị trường bằng",
        "example": "Fast food chains have flooded the market with cheap, convenient options."
      },
      {
        "term": "shift consumer habits",
        "definitionVi": "làm thay đổi thói quen tiêu dùng",
        "example": "Public awareness campaigns can gradually shift consumer habits."
      },
      {
        "term": "erode dietary standards",
        "definitionVi": "làm xói mòn các tiêu chuẩn ăn uống",
        "example": "Modern lifestyles have gradually eroded traditional dietary standards."
      },
      {
        "term": "regulate food advertising",
        "definitionVi": "quản lý quảng cáo thực phẩm",
        "example": "Governments could regulate food advertising aimed at children."
      },
      {
        "term": "cultivate mindful eating habits",
        "definitionVi": "xây dựng thói quen ăn uống có ý thức",
        "example": "Nutrition education helps people cultivate mindful eating habits."
      }
    ],
    "questions": [
      {
        "questionId": "w6ff_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What are the main causes of this shift, and how can governments and communities address this health concern?\" — Đây là dạng essay nào?",
        "options": [
          "Effect & Solution",
          "Cause & Solution",
          "Cause & Effect",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Solution",
        "explanationVi": "Keyword 'causes' kết hợp với 'how can... address' (giải pháp) xác định đây là dạng Cause & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w6ff_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"People nowadays consume far more processed and fast food than fresh, _____-cooked meals.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "home",
        "explanationVi": "'Home-cooked meal' = bữa ăn tự nấu tại nhà. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w6ff_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày nay, mọi người tiêu thụ nhiều thực phẩm chế biến sẵn hơn hẳn so với bữa ăn tự nấu tại nhà.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "People today consume far more processed food than home-cooked meals.",
        "explanationVi": "'Far more + N + than' = nhiều hơn hẳn so với. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "People today consume far more processed food than home-cooked meals.",
        "fallbackKeywords": [
          "processed food",
          "home-cooked meals",
          "far more"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w6ff_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Đồ ăn nhanh phổ biến chủ yếu là vì sự tiện lợi của nó.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Fast food is popular mainly because of its convenience.",
        "explanationVi": "'Mainly because of + N' = chủ yếu là vì. 'Convenience' = sự tiện lợi.",
        "modelAnswer": "Fast food is popular mainly because of its convenience.",
        "fallbackKeywords": [
          "fast food",
          "popular",
          "convenience"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w6ff_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Lối sống bận rộn khiến mọi người có ít thời gian để chuẩn bị bữa ăn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A fast-paced lifestyle leaves people with little time to prepare meals.",
        "explanationVi": "'Fast-paced lifestyle' = lối sống bận rộn. 'Leave + O + with little time' = khiến ai có ít thời gian.",
        "modelAnswer": "A fast-paced lifestyle leaves people with little time to prepare meals.",
        "fallbackKeywords": [
          "fast-paced lifestyle",
          "little time",
          "prepare meals"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w6ff_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sự suy giảm kỹ năng nấu ăn khiến mọi người phụ thuộc nhiều hơn vào đồ ăn nhanh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A decline in cooking skills has made people more reliant on fast food.",
        "explanationVi": "'A decline in + N' = sự suy giảm. 'Make + O + reliant on + N' = khiến ai phụ thuộc vào.",
        "modelAnswer": "A decline in cooking skills has made people more reliant on fast food.",
        "fallbackKeywords": [
          "decline in cooking skills",
          "reliant on fast food"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w6ff_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by offering / public cooking classes / help people eat healthier / Communities]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Communities could help people eat healthier by offering public cooking classes.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Public cooking classes' = lớp học nấu ăn cộng đồng.",
        "modelAnswer": "Communities could help people eat healthier by offering public cooking classes.",
        "fallbackKeywords": [
          "communities",
          "eat healthier",
          "public cooking classes"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w6ff_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to provide subsidies for fresh produce.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should provide subsidies for fresh produce.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should provide subsidies for fresh produce.",
        "fallbackKeywords": [
          "governments",
          "subsidies",
          "fresh produce"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w6ff_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food marketing\"):\n\n\"Việc tiếp thị thực phẩm mạnh mẽ khuyến khích việc tiêu thụ đồ ăn nhanh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Aggressive food marketing encourages the consumption of fast food.",
        "explanationVi": "'Food marketing' = tiếp thị thực phẩm. 'Encourage the consumption of' = khuyến khích việc tiêu thụ.",
        "modelAnswer": "Aggressive food marketing encourages the consumption of fast food.",
        "fallbackKeywords": [
          "food marketing",
          "encourages",
          "consumption"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w6ff_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"nutrient deficiency\"):\n\n\"Một chế độ ăn nhiều thực phẩm chế biến sẵn có thể dẫn đến thiếu hụt dinh dưỡng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A diet high in processed food can lead to nutrient deficiency.",
        "explanationVi": "'Nutrient deficiency' = thiếu hụt dinh dưỡng. 'A diet high in + N' = một chế độ ăn nhiều.",
        "modelAnswer": "A diet high in processed food can lead to nutrient deficiency.",
        "fallbackKeywords": [
          "nutrient deficiency",
          "diet",
          "processed food"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w6ff_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"affordability\"):\n\n\"Khả năng chi trả thấp của đồ ăn nhanh khiến nó trở nên hấp dẫn với các gia đình thu nhập thấp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The affordability of fast food makes it attractive to low-income families.",
        "explanationVi": "'Affordability' = khả năng chi trả (giá rẻ). 'Make + N + attractive to' = làm cho cái gì hấp dẫn với.",
        "modelAnswer": "The affordability of fast food makes it attractive to low-income families.",
        "fallbackKeywords": [
          "affordability",
          "fast food",
          "low-income families"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w6ff_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"meal preparation time\"):\n\n\"Giờ làm việc kéo dài làm giảm thời gian chuẩn bị bữa ăn của nhiều gia đình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Long working hours reduce meal preparation time for many families.",
        "explanationVi": "'Meal preparation time' = thời gian chuẩn bị bữa ăn. 'Long working hours' = giờ làm việc kéo dài.",
        "modelAnswer": "Long working hours reduce meal preparation time for many families.",
        "fallbackKeywords": [
          "meal preparation time",
          "long working hours",
          "families"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w6ff_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food subsidy\"):\n\n\"Một khoản trợ cấp thực phẩm cho nông sản tươi có thể khuyến khích việc ăn uống lành mạnh hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A food subsidy for fresh produce could encourage healthier eating.",
        "explanationVi": "'Food subsidy' = trợ cấp thực phẩm. 'Encourage healthier eating' = khuyến khích ăn uống lành mạnh hơn.",
        "modelAnswer": "A food subsidy for fresh produce could encourage healthier eating.",
        "fallbackKeywords": [
          "food subsidy",
          "fresh produce",
          "healthier eating"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w6ff_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"obesity epidemic\"):\n\n\"Sự phụ thuộc quá mức vào đồ ăn nhanh đã góp phần vào đại dịch béo phì toàn cầu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overreliance on fast food has contributed to a global obesity epidemic.",
        "explanationVi": "'Obesity epidemic' = đại dịch béo phì. 'Contribute to + N' = góp phần gây ra.",
        "modelAnswer": "Overreliance on fast food has contributed to a global obesity epidemic.",
        "fallbackKeywords": [
          "overreliance on fast food",
          "obesity epidemic",
          "global"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w6ff_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"processed sugar content\"):\n\n\"Hàm lượng đường tinh chế cao trong đồ ăn nhanh làm tăng rủi ro sức khỏe lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High processed sugar content in fast food raises long-term health risks.",
        "explanationVi": "'Processed sugar content' = hàm lượng đường tinh chế. 'Raise + N' = làm tăng.",
        "modelAnswer": "High processed sugar content in fast food raises long-term health risks.",
        "fallbackKeywords": [
          "processed sugar content",
          "fast food",
          "long-term health risks"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w6ff_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food desert\"):\n\n\"Tại một số vùng thiếu thực phẩm tươi, đồ ăn nhanh là lựa chọn duy nhất trong khả năng chi trả gần đó.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In some food deserts, fast food is the only affordable option nearby.",
        "explanationVi": "'Food desert' = vùng thiếu tiếp cận thực phẩm tươi giá phải chăng. 'The only affordable option' = lựa chọn duy nhất trong khả năng chi trả.",
        "modelAnswer": "In some food deserts, fast food is the only affordable option nearby.",
        "fallbackKeywords": [
          "food desert",
          "fast food",
          "affordable option"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w6ff_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"nutritional labelling\"):\n\n\"Việc ghi nhãn dinh dưỡng rõ ràng hơn có thể giúp người tiêu dùng đưa ra lựa chọn lành mạnh hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Clearer nutritional labelling could help consumers make healthier choices.",
        "explanationVi": "'Nutritional labelling' = ghi nhãn dinh dưỡng. 'Make healthier choices' = đưa ra lựa chọn lành mạnh hơn.",
        "modelAnswer": "Clearer nutritional labelling could help consumers make healthier choices.",
        "fallbackKeywords": [
          "nutritional labelling",
          "consumers",
          "healthier choices"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w6ff_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"health-conscious consumers\"):\n\n\"Những người tiêu dùng có ý thức về sức khỏe ngày càng yêu cầu nhiều thực phẩm tươi và nguyên chất hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Health-conscious consumers are increasingly demanding fresh, whole foods.",
        "explanationVi": "'Health-conscious consumers' = người tiêu dùng có ý thức về sức khỏe. 'Increasingly demanding' = ngày càng yêu cầu.",
        "modelAnswer": "Health-conscious consumers are increasingly demanding fresh, whole foods.",
        "fallbackKeywords": [
          "health-conscious consumers",
          "fresh, whole foods"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w6ff_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"chronic disease\"):\n\n\"Một chế độ ăn nhiều đồ ăn nhanh có liên hệ với nguy cơ mắc bệnh mãn tính cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A diet high in fast food is linked to a higher risk of chronic disease.",
        "explanationVi": "'Chronic disease' = bệnh mãn tính. 'Be linked to a higher risk of' = có liên hệ với nguy cơ cao hơn.",
        "modelAnswer": "A diet high in fast food is linked to a higher risk of chronic disease.",
        "fallbackKeywords": [
          "chronic disease",
          "diet",
          "higher risk"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w6ff_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"community-supported agriculture\"):\n\n\"Nông nghiệp hỗ trợ bởi cộng đồng giúp cư dân tiếp cận nông sản tươi với giá cả phải chăng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community-supported agriculture gives residents access to affordable fresh produce.",
        "explanationVi": "'Community-supported agriculture' = nông nghiệp hỗ trợ bởi cộng đồng. 'Access to + N' = khả năng tiếp cận.",
        "modelAnswer": "Community-supported agriculture gives residents access to affordable fresh produce.",
        "fallbackKeywords": [
          "community-supported agriculture",
          "affordable fresh produce"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 7,
    "block": "effect_solution",
    "topicName": "Severe Traffic Congestion in Urban Areas",
    "topicEmoji": "🚦",
    "essayType": "effect_solution",
    "prompt": "Traffic congestion in major cities is worsening, leading to longer commuting times and increased pollution. What effects does this problem have on urban residents, and what solutions can governments adopt to relieve traffic pressure?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 35,
    "vocabularyList": [
      {
        "term": "traffic congestion",
        "definitionVi": "tắc nghẽn giao thông",
        "example": "Traffic congestion in major cities is worsening every year."
      },
      {
        "term": "commuting time",
        "definitionVi": "thời gian di chuyển đi làm",
        "example": "Longer commuting times leave people with less time for their families."
      },
      {
        "term": "air pollution",
        "definitionVi": "ô nhiễm không khí",
        "example": "Traffic congestion significantly contributes to air pollution in cities."
      },
      {
        "term": "public transit system",
        "definitionVi": "hệ thống giao thông công cộng",
        "example": "An efficient public transit system can help relieve traffic pressure."
      },
      {
        "term": "urban residents",
        "definitionVi": "cư dân đô thị",
        "example": "Traffic congestion has a direct impact on the daily lives of urban residents."
      },
      {
        "term": "congestion pricing",
        "definitionVi": "phí chống ùn tắc",
        "example": "Congestion pricing charges drivers for entering busy city centres."
      },
      {
        "term": "productivity loss",
        "definitionVi": "tổn thất năng suất",
        "example": "Hours spent in traffic each day result in significant productivity loss."
      },
      {
        "term": "road expansion",
        "definitionVi": "mở rộng đường sá",
        "example": "Road expansion alone rarely solves long-term congestion problems."
      },
      {
        "term": "carbon emissions",
        "definitionVi": "khí thải carbon",
        "example": "Reducing traffic congestion could lower a city's carbon emissions."
      },
      {
        "term": "stress levels",
        "definitionVi": "mức độ căng thẳng",
        "example": "Long, frustrating commutes can raise commuters' stress levels."
      },
      {
        "term": "smart traffic management",
        "definitionVi": "quản lý giao thông thông minh",
        "example": "Smart traffic management systems can adjust signals to reduce jams."
      },
      {
        "term": "carpooling",
        "definitionVi": "đi chung xe",
        "example": "Encouraging carpooling could reduce the number of vehicles on the road."
      },
      {
        "term": "public health impact",
        "definitionVi": "tác động đến sức khỏe cộng đồng",
        "example": "Vehicle emissions from congestion have a serious public health impact."
      },
      {
        "term": "urban sprawl",
        "definitionVi": "sự mở rộng đô thị thiếu kiểm soát",
        "example": "Urban sprawl forces more people to rely on cars for daily travel."
      },
      {
        "term": "peak-hour traffic",
        "definitionVi": "giao thông giờ cao điểm",
        "example": "Peak-hour traffic can double the average commuting time."
      },
      {
        "term": "fuel consumption",
        "definitionVi": "mức tiêu thụ nhiên liệu",
        "example": "Idling in traffic jams increases overall fuel consumption."
      },
      {
        "term": "public transport investment",
        "definitionVi": "đầu tư vào giao thông công cộng",
        "example": "Greater public transport investment could reduce car dependency."
      },
      {
        "term": "traffic accident rate",
        "definitionVi": "tỷ lệ tai nạn giao thông",
        "example": "Congested roads can raise the traffic accident rate in busy areas."
      },
      {
        "term": "quality of life",
        "definitionVi": "chất lượng cuộc sống",
        "example": "Severe congestion can lower the overall quality of life for city residents."
      },
      {
        "term": "vehicle emission standards",
        "definitionVi": "tiêu chuẩn khí thải phương tiện",
        "example": "Stricter vehicle emission standards could reduce pollution from traffic."
      },
      {
        "term": "grind to a halt",
        "definitionVi": "dừng hẳn lại, tắc nghẽn hoàn toàn",
        "example": "Rush-hour traffic often grinds to a halt in the city centre."
      },
      {
        "term": "ease traffic flow",
        "definitionVi": "giảm bớt ùn tắc, giúp giao thông thông suốt hơn",
        "example": "Smart traffic lights can help ease traffic flow during peak hours."
      },
      {
        "term": "take drastic measures",
        "definitionVi": "thực hiện các biện pháp quyết liệt",
        "example": "City authorities may need to take drastic measures to reduce congestion."
      },
      {
        "term": "clog city streets",
        "definitionVi": "làm tắc nghẽn đường phố thành phố",
        "example": "Private vehicles continue to clog city streets every morning."
      },
      {
        "term": "divert traffic away from",
        "definitionVi": "chuyển hướng giao thông ra khỏi",
        "example": "New ring roads can divert traffic away from congested city centres."
      },
      {
        "term": "wreak havoc on",
        "definitionVi": "gây ra sự hỗn loạn cho",
        "example": "Gridlock can wreak havoc on residents' daily schedules."
      },
      {
        "term": "incentivise public transport use",
        "definitionVi": "khuyến khích sử dụng phương tiện công cộng",
        "example": "Cheaper fares could incentivise public transport use over driving."
      },
      {
        "term": "impose restrictions on",
        "definitionVi": "áp đặt các hạn chế đối với",
        "example": "Some cities impose restrictions on private cars entering the centre."
      },
      {
        "term": "curb the growth of",
        "definitionVi": "kiềm chế sự gia tăng của",
        "example": "Congestion charges aim to curb the growth of car traffic downtown."
      },
      {
        "term": "alleviate urban gridlock",
        "definitionVi": "giảm bớt tình trạng tắc nghẽn đô thị",
        "example": "Expanding the metro system could help alleviate urban gridlock."
      }
    ],
    "questions": [
      {
        "questionId": "w7tc_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What effects does this problem have on urban residents, and what solutions can governments adopt to relieve traffic pressure?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Discuss Both Views"
        ],
        "baseWords": [],
        "correctAnswer": "Effect & Solution",
        "explanationVi": "Đề hỏi 'effects' (hệ quả) và 'what solutions' (giải pháp) — không hỏi 'causes'. Đây là dạng Effect & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w7tc_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Traffic congestion in major cities is _____, leading to longer commuting times and increased pollution.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "worsening",
        "explanationVi": "'Worsen' = trở nên tồi tệ hơn. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w7tc_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tắc nghẽn giao thông ở các thành phố lớn đang trở nên tồi tệ hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic congestion in major cities is getting worse.",
        "explanationVi": "'Get worse' = trở nên tồi tệ hơn. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Traffic congestion in major cities is getting worse.",
        "fallbackKeywords": [
          "traffic congestion",
          "major cities",
          "worse"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w7tc_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thời gian di chuyển đi làm dài hơn khiến mọi người có ít thời gian hơn cho gia đình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Longer commuting times leave people with less time for their families.",
        "explanationVi": "'Commuting time' = thời gian di chuyển đi làm. 'Leave + O + with less time for' = khiến ai có ít thời gian hơn cho.",
        "modelAnswer": "Longer commuting times leave people with less time for their families.",
        "fallbackKeywords": [
          "commuting times",
          "less time",
          "families"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w7tc_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tắc nghẽn giao thông góp phần đáng kể vào tình trạng ô nhiễm không khí ở thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic congestion significantly contributes to air pollution in cities.",
        "explanationVi": "'Contribute to + N' = góp phần vào. 'Significantly' = đáng kể.",
        "modelAnswer": "Traffic congestion significantly contributes to air pollution in cities.",
        "fallbackKeywords": [
          "traffic congestion",
          "air pollution",
          "significantly"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w7tc_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một hệ thống giao thông công cộng hiệu quả có thể giúp giảm áp lực giao thông.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An efficient public transit system can help relieve traffic pressure.",
        "explanationVi": "'Public transit system' = hệ thống giao thông công cộng. 'Relieve + N' = giảm bớt, làm dịu.",
        "modelAnswer": "An efficient public transit system can help relieve traffic pressure.",
        "fallbackKeywords": [
          "public transit system",
          "relieve",
          "traffic pressure"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w7tc_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by investing / smart traffic management systems / reduce congestion / Governments / in]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could reduce congestion by investing in smart traffic management systems.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Smart traffic management' = quản lý giao thông thông minh.",
        "modelAnswer": "Governments could reduce congestion by investing in smart traffic management systems.",
        "fallbackKeywords": [
          "governments",
          "reduce congestion",
          "smart traffic management"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w7tc_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Cities should to invest more in public transport.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cities should invest more in public transport.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Cities should invest more in public transport.",
        "fallbackKeywords": [
          "cities",
          "invest",
          "public transport"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w7tc_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"productivity loss\"):\n\n\"Số giờ dành cho việc kẹt xe mỗi ngày dẫn đến tổn thất năng suất đáng kể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Hours spent in traffic each day result in significant productivity loss.",
        "explanationVi": "'Productivity loss' = tổn thất năng suất. 'Result in + N' = dẫn đến.",
        "modelAnswer": "Hours spent in traffic each day result in significant productivity loss.",
        "fallbackKeywords": [
          "productivity loss",
          "hours spent in traffic"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w7tc_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"congestion pricing\"):\n\n\"Phí chống ùn tắc thu phí tài xế khi vào khu vực trung tâm thành phố đông đúc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Congestion pricing charges drivers for entering busy city centres.",
        "explanationVi": "'Congestion pricing' = phí chống ùn tắc. 'Charge + O + for + V-ing' = thu phí ai vì làm gì.",
        "modelAnswer": "Congestion pricing charges drivers for entering busy city centres.",
        "fallbackKeywords": [
          "congestion pricing",
          "charges drivers",
          "city centres"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w7tc_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"stress levels\"):\n\n\"Những chuyến đi làm dài và bực bội có thể làm tăng mức độ căng thẳng của người đi làm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Long, frustrating commutes can raise commuters' stress levels.",
        "explanationVi": "'Stress levels' = mức độ căng thẳng. 'Raise + N' = làm tăng.",
        "modelAnswer": "Long, frustrating commutes can raise commuters' stress levels.",
        "fallbackKeywords": [
          "stress levels",
          "frustrating commutes",
          "raise"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w7tc_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"carpooling\"):\n\n\"Khuyến khích việc đi chung xe có thể làm giảm số lượng phương tiện trên đường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Encouraging carpooling could reduce the number of vehicles on the road.",
        "explanationVi": "'Carpooling' = đi chung xe. 'The number of vehicles on the road' = số lượng phương tiện trên đường.",
        "modelAnswer": "Encouraging carpooling could reduce the number of vehicles on the road.",
        "fallbackKeywords": [
          "carpooling",
          "reduce",
          "vehicles on the road"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w7tc_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public health impact\"):\n\n\"Khí thải từ phương tiện do tắc nghẽn giao thông gây ra có tác động nghiêm trọng đến sức khỏe cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Vehicle emissions from congestion have a serious public health impact.",
        "explanationVi": "'Public health impact' = tác động đến sức khỏe cộng đồng. 'Vehicle emissions' = khí thải từ phương tiện.",
        "modelAnswer": "Vehicle emissions from congestion have a serious public health impact.",
        "fallbackKeywords": [
          "vehicle emissions",
          "public health impact",
          "serious"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w7tc_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban sprawl\"):\n\n\"Sự mở rộng đô thị thiếu kiểm soát buộc nhiều người phải phụ thuộc vào ô tô cho việc di chuyển hằng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Urban sprawl forces more people to rely on cars for daily travel.",
        "explanationVi": "'Urban sprawl' = sự mở rộng đô thị thiếu kiểm soát. 'Force + O + to V' = buộc ai làm gì.",
        "modelAnswer": "Urban sprawl forces more people to rely on cars for daily travel.",
        "fallbackKeywords": [
          "urban sprawl",
          "rely on cars",
          "daily travel"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w7tc_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"peak-hour traffic\"):\n\n\"Giao thông giờ cao điểm có thể khiến thời gian di chuyển trung bình tăng gấp đôi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Peak-hour traffic can double the average commuting time.",
        "explanationVi": "'Peak-hour traffic' = giao thông giờ cao điểm. 'Double + N' = làm tăng gấp đôi.",
        "modelAnswer": "Peak-hour traffic can double the average commuting time.",
        "fallbackKeywords": [
          "peak-hour traffic",
          "double",
          "commuting time"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w7tc_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"fuel consumption\"):\n\n\"Việc để xe chạy không tải khi kẹt xe làm tăng tổng mức tiêu thụ nhiên liệu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Idling in traffic jams increases overall fuel consumption.",
        "explanationVi": "'Fuel consumption' = mức tiêu thụ nhiên liệu. 'Idle' (v) = để xe chạy không tải.",
        "modelAnswer": "Idling in traffic jams increases overall fuel consumption.",
        "fallbackKeywords": [
          "idling",
          "traffic jams",
          "fuel consumption"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w7tc_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public transport investment\"):\n\n\"Đầu tư nhiều hơn vào giao thông công cộng có thể làm giảm sự phụ thuộc vào xe hơi cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Greater public transport investment could reduce car dependency.",
        "explanationVi": "'Public transport investment' = đầu tư vào giao thông công cộng. 'Car dependency' = sự phụ thuộc vào xe hơi.",
        "modelAnswer": "Greater public transport investment could reduce car dependency.",
        "fallbackKeywords": [
          "public transport investment",
          "car dependency"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w7tc_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"traffic accident rate\"):\n\n\"Những con đường đông đúc có thể làm tăng tỷ lệ tai nạn giao thông ở các khu vực nhộn nhịp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Congested roads can raise the traffic accident rate in busy areas.",
        "explanationVi": "'Traffic accident rate' = tỷ lệ tai nạn giao thông. 'Raise + N' = làm tăng.",
        "modelAnswer": "Congested roads can raise the traffic accident rate in busy areas.",
        "fallbackKeywords": [
          "traffic accident rate",
          "congested roads",
          "busy areas"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w7tc_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"quality of life\"):\n\n\"Tình trạng tắc nghẽn nghiêm trọng có thể làm giảm chất lượng cuộc sống nói chung của cư dân thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Severe congestion can lower the overall quality of life for city residents.",
        "explanationVi": "'Quality of life' = chất lượng cuộc sống. 'Lower + N' = làm giảm.",
        "modelAnswer": "Severe congestion can lower the overall quality of life for city residents.",
        "fallbackKeywords": [
          "severe congestion",
          "quality of life",
          "city residents"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w7tc_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"vehicle emission standards\"):\n\n\"Các tiêu chuẩn khí thải phương tiện nghiêm ngặt hơn có thể làm giảm ô nhiễm từ giao thông.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Stricter vehicle emission standards could reduce pollution from traffic.",
        "explanationVi": "'Vehicle emission standards' = tiêu chuẩn khí thải phương tiện. 'Reduce pollution from + N' = làm giảm ô nhiễm từ.",
        "modelAnswer": "Stricter vehicle emission standards could reduce pollution from traffic.",
        "fallbackKeywords": [
          "vehicle emission standards",
          "reduce pollution",
          "traffic"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 7,
    "block": "effect_solution",
    "topicName": "Overreliance on Private Motor Vehicles",
    "topicEmoji": "🚗",
    "essayType": "effect_solution",
    "prompt": "The majority of city commuters prefer using private cars and motorbikes over public transit. What effects does this trend have on the environment and society, and what measures can be taken to promote public transportation?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 36,
    "vocabularyList": [
      {
        "term": "private motor vehicle",
        "definitionVi": "phương tiện cơ giới cá nhân",
        "example": "The majority of city commuters prefer using private motor vehicles."
      },
      {
        "term": "public transit",
        "definitionVi": "giao thông công cộng",
        "example": "Many commuters avoid public transit due to overcrowding and delays."
      },
      {
        "term": "carbon footprint",
        "definitionVi": "dấu chân carbon",
        "example": "Overreliance on private cars significantly increases a city's carbon footprint."
      },
      {
        "term": "road infrastructure",
        "definitionVi": "cơ sở hạ tầng đường bộ",
        "example": "Heavy car use puts enormous strain on existing road infrastructure."
      },
      {
        "term": "parking shortage",
        "definitionVi": "tình trạng thiếu chỗ đỗ xe",
        "example": "Rising car ownership has led to a severe parking shortage in city centres."
      },
      {
        "term": "social inequality",
        "definitionVi": "bất bình đẳng xã hội",
        "example": "Reliance on private cars can worsen social inequality for those who cannot afford one."
      },
      {
        "term": "fare subsidies",
        "definitionVi": "trợ giá vé",
        "example": "Fare subsidies could make public transport more affordable and attractive."
      },
      {
        "term": "dedicated bus lanes",
        "definitionVi": "làn đường dành riêng cho xe buýt",
        "example": "Dedicated bus lanes can make public transport faster than driving."
      },
      {
        "term": "vehicle ownership",
        "definitionVi": "sở hữu phương tiện",
        "example": "Rising incomes have led to a sharp increase in vehicle ownership."
      },
      {
        "term": "greenhouse gas emissions",
        "definitionVi": "khí thải nhà kính",
        "example": "Cars are a major source of greenhouse gas emissions in cities."
      },
      {
        "term": "public transport reliability",
        "definitionVi": "độ tin cậy của giao thông công cộng",
        "example": "Improving public transport reliability would encourage more people to switch from cars."
      },
      {
        "term": "urban sprawl",
        "definitionVi": "sự mở rộng đô thị thiếu kiểm soát",
        "example": "Urban sprawl makes people more dependent on private vehicles."
      },
      {
        "term": "traffic-related pollution",
        "definitionVi": "ô nhiễm liên quan đến giao thông",
        "example": "Traffic-related pollution poses serious risks to respiratory health."
      },
      {
        "term": "commuter convenience",
        "definitionVi": "sự tiện lợi cho người đi làm",
        "example": "Many people choose cars for commuter convenience despite the cost."
      },
      {
        "term": "integrated transport network",
        "definitionVi": "mạng lưới giao thông tích hợp",
        "example": "An integrated transport network connects buses, trains, and cycling paths."
      },
      {
        "term": "fuel prices",
        "definitionVi": "giá nhiên liệu",
        "example": "Rising fuel prices have not significantly reduced car dependency."
      },
      {
        "term": "electric public transport",
        "definitionVi": "giao thông công cộng chạy điện",
        "example": "Investing in electric public transport could reduce urban emissions."
      },
      {
        "term": "car dependency",
        "definitionVi": "sự phụ thuộc vào xe hơi",
        "example": "Reducing car dependency requires both better transit and urban planning."
      },
      {
        "term": "noise pollution",
        "definitionVi": "ô nhiễm tiếng ồn",
        "example": "Heavy traffic contributes significantly to noise pollution in cities."
      },
      {
        "term": "modal shift",
        "definitionVi": "sự chuyển đổi phương thức di chuyển",
        "example": "Encouraging a modal shift from cars to public transport takes time and investment."
      },
      {
        "term": "wean people off",
        "definitionVi": "cai (thói quen) cho ai đó",
        "example": "Cities are trying to wean people off their reliance on private cars."
      },
      {
        "term": "make public transport appealing",
        "definitionVi": "làm cho giao thông công cộng trở nên hấp dẫn",
        "example": "Comfortable buses can make public transport appealing to commuters."
      },
      {
        "term": "shift travel behaviour",
        "definitionVi": "làm thay đổi hành vi di chuyển",
        "example": "Higher fuel prices alone rarely shift travel behaviour significantly."
      },
      {
        "term": "come with hidden costs",
        "definitionVi": "đi kèm với những chi phí ẩn",
        "example": "Car ownership comes with hidden costs such as parking and maintenance."
      },
      {
        "term": "prioritise sustainable transport",
        "definitionVi": "ưu tiên giao thông bền vững",
        "example": "Urban planners should prioritise sustainable transport over road expansion."
      },
      {
        "term": "phase out petrol vehicles",
        "definitionVi": "loại bỏ dần xe chạy xăng",
        "example": "Several countries plan to phase out petrol vehicles within decades."
      },
      {
        "term": "strain existing infrastructure",
        "definitionVi": "gây áp lực lên cơ sở hạ tầng hiện có",
        "example": "Rising car numbers continue to strain existing road infrastructure."
      },
      {
        "term": "offer viable alternatives to",
        "definitionVi": "cung cấp các lựa chọn thay thế khả thi cho",
        "example": "Cities must offer viable alternatives to private car ownership."
      },
      {
        "term": "discourage car dependency",
        "definitionVi": "hạn chế sự phụ thuộc vào xe hơi",
        "example": "High parking fees can discourage car dependency in city centres."
      },
      {
        "term": "reduce the environmental footprint of",
        "definitionVi": "giảm dấu chân môi trường của",
        "example": "Electric buses help reduce the environmental footprint of public transport."
      }
    ],
    "questions": [
      {
        "questionId": "w7pv_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What effects does this trend have on the environment and society, and what measures can be taken to promote public transportation?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Effect & Solution",
        "explanationVi": "Đề hỏi 'effects' (hệ quả) và 'what measures can be taken' (giải pháp) — không hỏi 'causes'. Đây là dạng Effect & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w7pv_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"The majority of city commuters prefer using private cars and motorbikes _____ public transit.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "over",
        "explanationVi": "'Prefer A over B' = thích A hơn B. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w7pv_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Phần lớn người đi làm ở thành phố thích sử dụng ô tô cá nhân hơn là giao thông công cộng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The majority of city commuters prefer private cars over public transit.",
        "explanationVi": "'The majority of + N' = phần lớn. 'Prefer A over B' = thích A hơn B.",
        "modelAnswer": "The majority of city commuters prefer private cars over public transit.",
        "fallbackKeywords": [
          "majority of commuters",
          "private cars",
          "public transit"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w7pv_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc phụ thuộc quá mức vào ô tô cá nhân làm tăng đáng kể dấu chân carbon của một thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overreliance on private cars significantly increases a city's carbon footprint.",
        "explanationVi": "'Overreliance on + N' = sự phụ thuộc quá mức vào. 'Carbon footprint' = dấu chân carbon.",
        "modelAnswer": "Overreliance on private cars significantly increases a city's carbon footprint.",
        "fallbackKeywords": [
          "overreliance on private cars",
          "carbon footprint"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w7pv_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều người đi làm tránh sử dụng giao thông công cộng vì tình trạng quá tải và chậm trễ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many commuters avoid public transit due to overcrowding and delays.",
        "explanationVi": "'Avoid + N' = tránh. 'Due to + N' = do, bởi vì.",
        "modelAnswer": "Many commuters avoid public transit due to overcrowding and delays.",
        "fallbackKeywords": [
          "commuters",
          "avoid public transit",
          "overcrowding"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w7pv_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc sử dụng ô tô nhiều đặt gánh nặng lớn lên cơ sở hạ tầng đường bộ hiện có.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Heavy car use puts enormous strain on existing road infrastructure.",
        "explanationVi": "'Put strain on + N' = đặt gánh nặng lên. 'Road infrastructure' = cơ sở hạ tầng đường bộ.",
        "modelAnswer": "Heavy car use puts enormous strain on existing road infrastructure.",
        "fallbackKeywords": [
          "heavy car use",
          "strain",
          "road infrastructure"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w7pv_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by offering / fare subsidies / encourage public transport use / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could encourage public transport use by offering fare subsidies.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Fare subsidies' = trợ giá vé.",
        "modelAnswer": "Governments could encourage public transport use by offering fare subsidies.",
        "fallbackKeywords": [
          "governments",
          "public transport use",
          "fare subsidies"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w7pv_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Cities should to build more dedicated bus lanes.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cities should build more dedicated bus lanes.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Cities should build more dedicated bus lanes.",
        "fallbackKeywords": [
          "cities",
          "dedicated bus lanes"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w7pv_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"parking shortage\"):\n\n\"Số lượng xe sở hữu tăng lên đã dẫn đến tình trạng thiếu chỗ đỗ xe nghiêm trọng ở trung tâm thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rising car ownership has led to a severe parking shortage in city centres.",
        "explanationVi": "'Parking shortage' = tình trạng thiếu chỗ đỗ xe. 'Lead to + N' = dẫn đến.",
        "modelAnswer": "Rising car ownership has led to a severe parking shortage in city centres.",
        "fallbackKeywords": [
          "car ownership",
          "parking shortage",
          "city centres"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w7pv_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social inequality\"):\n\n\"Sự phụ thuộc vào ô tô cá nhân có thể làm trầm trọng thêm tình trạng bất bình đẳng xã hội đối với những người không đủ khả năng mua xe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Reliance on private cars can worsen social inequality for those who cannot afford one.",
        "explanationVi": "'Social inequality' = bất bình đẳng xã hội. 'Worsen + N' = làm trầm trọng thêm.",
        "modelAnswer": "Reliance on private cars can worsen social inequality for those who cannot afford one.",
        "fallbackKeywords": [
          "reliance on private cars",
          "social inequality"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w7pv_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public transport reliability\"):\n\n\"Cải thiện độ tin cậy của giao thông công cộng sẽ khuyến khích nhiều người chuyển từ ô tô sang xe buýt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improving public transport reliability would encourage more people to switch from cars.",
        "explanationVi": "'Public transport reliability' = độ tin cậy của giao thông công cộng. 'Switch from A to B' = chuyển từ A sang B.",
        "modelAnswer": "Improving public transport reliability would encourage more people to switch from cars.",
        "fallbackKeywords": [
          "public transport reliability",
          "encourage",
          "switch from cars"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w7pv_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban sprawl\"):\n\n\"Sự mở rộng đô thị thiếu kiểm soát khiến mọi người phụ thuộc nhiều hơn vào phương tiện cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Urban sprawl makes people more dependent on private vehicles.",
        "explanationVi": "'Urban sprawl' = sự mở rộng đô thị thiếu kiểm soát. 'Make + O + dependent on' = khiến ai phụ thuộc vào.",
        "modelAnswer": "Urban sprawl makes people more dependent on private vehicles.",
        "fallbackKeywords": [
          "urban sprawl",
          "private vehicles",
          "dependent"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w7pv_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"traffic-related pollution\"):\n\n\"Ô nhiễm liên quan đến giao thông gây ra những rủi ro nghiêm trọng đối với sức khỏe hô hấp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic-related pollution poses serious risks to respiratory health.",
        "explanationVi": "'Traffic-related pollution' = ô nhiễm liên quan đến giao thông. 'Pose risks to + N' = gây ra rủi ro đối với.",
        "modelAnswer": "Traffic-related pollution poses serious risks to respiratory health.",
        "fallbackKeywords": [
          "traffic-related pollution",
          "respiratory health"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w7pv_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"integrated transport network\"):\n\n\"Một mạng lưới giao thông tích hợp kết nối xe buýt, tàu điện và đường dành cho xe đạp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An integrated transport network connects buses, trains, and cycling paths.",
        "explanationVi": "'Integrated transport network' = mạng lưới giao thông tích hợp. 'Connect + N' = kết nối.",
        "modelAnswer": "An integrated transport network connects buses, trains, and cycling paths.",
        "fallbackKeywords": [
          "integrated transport network",
          "connects",
          "cycling paths"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w7pv_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"fuel prices\"):\n\n\"Giá nhiên liệu tăng cao vẫn chưa làm giảm đáng kể sự phụ thuộc vào xe hơi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rising fuel prices have not significantly reduced car dependency.",
        "explanationVi": "'Fuel prices' = giá nhiên liệu. 'Car dependency' = sự phụ thuộc vào xe hơi.",
        "modelAnswer": "Rising fuel prices have not significantly reduced car dependency.",
        "fallbackKeywords": [
          "fuel prices",
          "car dependency",
          "reduced"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w7pv_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"electric public transport\"):\n\n\"Đầu tư vào giao thông công cộng chạy điện có thể làm giảm lượng khí thải ở đô thị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investing in electric public transport could reduce urban emissions.",
        "explanationVi": "'Electric public transport' = giao thông công cộng chạy điện. 'Urban emissions' = khí thải ở đô thị.",
        "modelAnswer": "Investing in electric public transport could reduce urban emissions.",
        "fallbackKeywords": [
          "electric public transport",
          "urban emissions"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w7pv_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"noise pollution\"):\n\n\"Giao thông đông đúc góp phần đáng kể vào tình trạng ô nhiễm tiếng ồn ở các thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Heavy traffic contributes significantly to noise pollution in cities.",
        "explanationVi": "'Noise pollution' = ô nhiễm tiếng ồn. 'Contribute significantly to' = góp phần đáng kể vào.",
        "modelAnswer": "Heavy traffic contributes significantly to noise pollution in cities.",
        "fallbackKeywords": [
          "heavy traffic",
          "noise pollution",
          "cities"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w7pv_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"modal shift\"):\n\n\"Khuyến khích sự chuyển đổi phương thức di chuyển từ ô tô sang giao thông công cộng cần thời gian và đầu tư.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Encouraging a modal shift from cars to public transport takes time and investment.",
        "explanationVi": "'Modal shift' = sự chuyển đổi phương thức di chuyển. 'Take time and investment' = cần thời gian và đầu tư.",
        "modelAnswer": "Encouraging a modal shift from cars to public transport takes time and investment.",
        "fallbackKeywords": [
          "modal shift",
          "cars to public transport",
          "time and investment"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w7pv_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"greenhouse gas emissions\"):\n\n\"Ô tô là một nguồn phát thải khí nhà kính lớn ở các thành phố.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cars are a major source of greenhouse gas emissions in cities.",
        "explanationVi": "'Greenhouse gas emissions' = khí thải nhà kính. 'A major source of + N' = một nguồn lớn của.",
        "modelAnswer": "Cars are a major source of greenhouse gas emissions in cities.",
        "fallbackKeywords": [
          "greenhouse gas emissions",
          "major source",
          "cities"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w7pv_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"commuter convenience\"):\n\n\"Nhiều người chọn ô tô vì sự tiện lợi cho việc đi làm mặc dù chi phí cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people choose cars for commuter convenience despite the high cost.",
        "explanationVi": "'Commuter convenience' = sự tiện lợi cho người đi làm. 'Despite + N' = mặc dù.",
        "modelAnswer": "Many people choose cars for commuter convenience despite the high cost.",
        "fallbackKeywords": [
          "commuter convenience",
          "despite the cost"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 8,
    "block": "effect_solution",
    "topicName": "Rising Freight Transport by Heavy Trucks",
    "topicEmoji": "🚛",
    "essayType": "effect_solution",
    "prompt": "A significant amount of freight is moved long distances by heavy trucks rather than by rail or water systems. What effects does this reliance on road transport cause, and what solutions can address these negative impacts?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 37,
    "vocabularyList": [
      {
        "term": "freight transport",
        "definitionVi": "vận tải hàng hóa",
        "example": "A significant amount of freight is moved long distances by heavy trucks."
      },
      {
        "term": "heavy truck",
        "definitionVi": "xe tải hạng nặng",
        "example": "Heavy trucks cause considerable wear on road surfaces."
      },
      {
        "term": "rail transport",
        "definitionVi": "vận tải đường sắt",
        "example": "Rail transport is generally more fuel-efficient than road freight."
      },
      {
        "term": "road wear",
        "definitionVi": "sự hao mòn mặt đường",
        "example": "Constant heavy truck traffic accelerates road wear significantly."
      },
      {
        "term": "logistics network",
        "definitionVi": "mạng lưới hậu cần",
        "example": "An efficient logistics network can reduce reliance on road freight."
      },
      {
        "term": "fuel efficiency",
        "definitionVi": "hiệu quả sử dụng nhiên liệu",
        "example": "Trains generally offer greater fuel efficiency than trucks for long distances."
      },
      {
        "term": "infrastructure damage",
        "definitionVi": "hư hại cơ sở hạ tầng",
        "example": "Overloaded trucks contribute directly to infrastructure damage."
      },
      {
        "term": "carbon emissions",
        "definitionVi": "khí thải carbon",
        "example": "Road freight produces significantly higher carbon emissions than rail."
      },
      {
        "term": "intermodal transport",
        "definitionVi": "vận tải đa phương thức",
        "example": "Intermodal transport combines trucks, trains, and ships for efficiency."
      },
      {
        "term": "supply chain",
        "definitionVi": "chuỗi cung ứng",
        "example": "Disruptions to road freight can affect an entire supply chain."
      },
      {
        "term": "waterway shipping",
        "definitionVi": "vận tải đường thủy",
        "example": "Waterway shipping remains an underused option for moving bulk goods."
      },
      {
        "term": "delivery delays",
        "definitionVi": "sự chậm trễ giao hàng",
        "example": "Traffic congestion often causes delivery delays for road freight."
      },
      {
        "term": "maintenance costs",
        "definitionVi": "chi phí bảo trì",
        "example": "Rising maintenance costs are a direct result of heavy road use."
      },
      {
        "term": "government investment",
        "definitionVi": "đầu tư của chính phủ",
        "example": "Government investment in rail freight could reduce road dependency."
      },
      {
        "term": "traffic bottlenecks",
        "definitionVi": "điểm nghẽn giao thông",
        "example": "Freight trucks often create traffic bottlenecks on major highways."
      },
      {
        "term": "greenhouse gas output",
        "definitionVi": "lượng khí nhà kính thải ra",
        "example": "Reducing road freight could significantly lower greenhouse gas output."
      },
      {
        "term": "cargo capacity",
        "definitionVi": "sức chứa hàng hóa",
        "example": "Trains generally offer far greater cargo capacity than trucks."
      },
      {
        "term": "national rail network",
        "definitionVi": "mạng lưới đường sắt quốc gia",
        "example": "Expanding the national rail network could relieve pressure on roads."
      },
      {
        "term": "transport subsidy",
        "definitionVi": "trợ cấp giao thông vận tải",
        "example": "A transport subsidy could make rail freight more competitive with trucking."
      },
      {
        "term": "cross-border trade",
        "definitionVi": "thương mại xuyên biên giới",
        "example": "Efficient freight systems are essential for smooth cross-border trade."
      },
      {
        "term": "shift freight onto rail",
        "definitionVi": "chuyển hàng hóa sang đường sắt",
        "example": "Policymakers are trying to shift freight onto rail to ease road congestion."
      },
      {
        "term": "place a heavy burden on",
        "definitionVi": "đặt gánh nặng lớn lên",
        "example": "Constant truck traffic places a heavy burden on ageing roads."
      },
      {
        "term": "modernise transport networks",
        "definitionVi": "hiện đại hóa mạng lưới giao thông",
        "example": "Investment is needed to modernise transport networks nationwide."
      },
      {
        "term": "streamline the supply chain",
        "definitionVi": "hợp lý hóa chuỗi cung ứng",
        "example": "Efficient logistics can streamline the supply chain and cut costs."
      },
      {
        "term": "diversify transport modes",
        "definitionVi": "đa dạng hóa các phương thức vận tải",
        "example": "Companies are encouraged to diversify transport modes beyond trucking."
      },
      {
        "term": "accelerate wear and tear",
        "definitionVi": "đẩy nhanh sự hao mòn",
        "example": "Heavy freight traffic accelerates wear and tear on highway surfaces."
      },
      {
        "term": "offset carbon emissions",
        "definitionVi": "bù đắp lượng khí thải carbon",
        "example": "Some logistics firms invest in projects to offset carbon emissions."
      },
      {
        "term": "expand rail capacity",
        "definitionVi": "mở rộng năng lực đường sắt",
        "example": "Expanding rail capacity could reduce reliance on heavy trucks."
      },
      {
        "term": "cut transport-related emissions",
        "definitionVi": "cắt giảm khí thải liên quan đến giao thông",
        "example": "Switching to rail freight can cut transport-related emissions substantially."
      },
      {
        "term": "bear the cost of",
        "definitionVi": "gánh chịu chi phí của",
        "example": "Taxpayers ultimately bear the cost of road damage caused by heavy trucks."
      }
    ],
    "questions": [
      {
        "questionId": "w8fr_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What effects does this reliance on road transport cause, and what solutions can address these negative impacts?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Discuss Both Views"
        ],
        "baseWords": [],
        "correctAnswer": "Effect & Solution",
        "explanationVi": "Đề hỏi 'effects' (hệ quả) và 'what solutions' (giải pháp) — không hỏi 'causes'. Đây là dạng Effect & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w8fr_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"A significant amount of freight is moved long distances by heavy trucks _____ than by rail or water systems.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "rather",
        "explanationVi": "'Rather than' = thay vì. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w8fr_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một lượng lớn hàng hóa được vận chuyển đường dài bằng xe tải hạng nặng thay vì đường sắt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A large amount of freight is transported long distances by heavy trucks instead of rail.",
        "explanationVi": "'A large amount of + N' = một lượng lớn. 'Instead of' = thay vì.",
        "modelAnswer": "A large amount of freight is transported long distances by heavy trucks instead of rail.",
        "fallbackKeywords": [
          "freight",
          "heavy trucks",
          "instead of rail"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w8fr_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Xe tải hạng nặng gây ra sự hao mòn đáng kể cho mặt đường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Heavy trucks cause considerable wear on road surfaces.",
        "explanationVi": "'Cause wear on + N' = gây ra sự hao mòn cho. 'Road surfaces' = mặt đường.",
        "modelAnswer": "Heavy trucks cause considerable wear on road surfaces.",
        "fallbackKeywords": [
          "heavy trucks",
          "road wear",
          "considerable"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w8fr_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Vận tải đường sắt nhìn chung tiết kiệm nhiên liệu hơn so với vận tải đường bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rail transport is generally more fuel-efficient than road transport.",
        "explanationVi": "'Rail transport' = vận tải đường sắt. 'Fuel-efficient' = tiết kiệm nhiên liệu.",
        "modelAnswer": "Rail transport is generally more fuel-efficient than road transport.",
        "fallbackKeywords": [
          "rail transport",
          "fuel-efficient",
          "road transport"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w8fr_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Xe tải chở quá tải góp phần trực tiếp vào việc hư hại cơ sở hạ tầng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overloaded trucks contribute directly to infrastructure damage.",
        "explanationVi": "'Infrastructure damage' = hư hại cơ sở hạ tầng. 'Contribute directly to' = góp phần trực tiếp vào.",
        "modelAnswer": "Overloaded trucks contribute directly to infrastructure damage.",
        "fallbackKeywords": [
          "overloaded trucks",
          "infrastructure damage"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w8fr_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by investing / in the national rail network / reduce road freight / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could reduce road freight by investing in the national rail network.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'National rail network' = mạng lưới đường sắt quốc gia.",
        "modelAnswer": "Governments could reduce road freight by investing in the national rail network.",
        "fallbackKeywords": [
          "governments",
          "road freight",
          "national rail network"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w8fr_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to invest more in intermodal transport systems.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should invest more in intermodal transport systems.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should invest more in intermodal transport systems.",
        "fallbackKeywords": [
          "governments",
          "intermodal transport"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w8fr_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"logistics network\"):\n\n\"Một mạng lưới hậu cần hiệu quả có thể làm giảm sự phụ thuộc vào vận tải đường bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An efficient logistics network can reduce reliance on road freight.",
        "explanationVi": "'Logistics network' = mạng lưới hậu cần. 'Reliance on + N' = sự phụ thuộc vào.",
        "modelAnswer": "An efficient logistics network can reduce reliance on road freight.",
        "fallbackKeywords": [
          "logistics network",
          "reduce reliance",
          "road freight"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w8fr_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"carbon emissions\"):\n\n\"Vận tải đường bộ tạo ra lượng khí thải carbon cao hơn đáng kể so với đường sắt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Road freight produces significantly higher carbon emissions than rail.",
        "explanationVi": "'Carbon emissions' = khí thải carbon. 'Significantly higher than' = cao hơn đáng kể so với.",
        "modelAnswer": "Road freight produces significantly higher carbon emissions than rail.",
        "fallbackKeywords": [
          "road freight",
          "carbon emissions",
          "rail"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w8fr_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"intermodal transport\"):\n\n\"Vận tải đa phương thức kết hợp xe tải, tàu hỏa và tàu thủy để đạt hiệu quả cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Intermodal transport combines trucks, trains, and ships for greater efficiency.",
        "explanationVi": "'Intermodal transport' = vận tải đa phương thức. 'Combine + N' = kết hợp.",
        "modelAnswer": "Intermodal transport combines trucks, trains, and ships for greater efficiency.",
        "fallbackKeywords": [
          "intermodal transport",
          "combines",
          "efficiency"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w8fr_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"supply chain\"):\n\n\"Sự gián đoạn trong vận tải đường bộ có thể ảnh hưởng đến toàn bộ chuỗi cung ứng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Disruptions to road freight can affect an entire supply chain.",
        "explanationVi": "'Supply chain' = chuỗi cung ứng. 'Disruptions to + N' = sự gián đoạn trong.",
        "modelAnswer": "Disruptions to road freight can affect an entire supply chain.",
        "fallbackKeywords": [
          "disruptions",
          "road freight",
          "supply chain"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w8fr_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"waterway shipping\"):\n\n\"Vận tải đường thủy vẫn là một lựa chọn chưa được sử dụng nhiều để vận chuyển hàng hóa số lượng lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Waterway shipping remains an underused option for moving bulk goods.",
        "explanationVi": "'Waterway shipping' = vận tải đường thủy. 'An underused option' = một lựa chọn chưa được sử dụng nhiều.",
        "modelAnswer": "Waterway shipping remains an underused option for moving bulk goods.",
        "fallbackKeywords": [
          "waterway shipping",
          "underused option",
          "bulk goods"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w8fr_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"delivery delays\"):\n\n\"Tình trạng tắc nghẽn giao thông thường gây ra sự chậm trễ giao hàng đối với vận tải đường bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic congestion often causes delivery delays for road freight.",
        "explanationVi": "'Delivery delays' = sự chậm trễ giao hàng. 'Cause + N' = gây ra.",
        "modelAnswer": "Traffic congestion often causes delivery delays for road freight.",
        "fallbackKeywords": [
          "traffic congestion",
          "delivery delays",
          "road freight"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w8fr_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"maintenance costs\"):\n\n\"Chi phí bảo trì tăng cao là hệ quả trực tiếp của việc sử dụng đường bộ quá mức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rising maintenance costs are a direct result of excessive road use.",
        "explanationVi": "'Maintenance costs' = chi phí bảo trì. 'A direct result of' = hệ quả trực tiếp của.",
        "modelAnswer": "Rising maintenance costs are a direct result of excessive road use.",
        "fallbackKeywords": [
          "maintenance costs",
          "direct result",
          "road use"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w8fr_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"traffic bottlenecks\"):\n\n\"Xe tải chở hàng thường tạo ra các điểm nghẽn giao thông trên những tuyến đường cao tốc lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Freight trucks often create traffic bottlenecks on major highways.",
        "explanationVi": "'Traffic bottlenecks' = điểm nghẽn giao thông. 'Create + N' = tạo ra.",
        "modelAnswer": "Freight trucks often create traffic bottlenecks on major highways.",
        "fallbackKeywords": [
          "freight trucks",
          "traffic bottlenecks",
          "major highways"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w8fr_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"greenhouse gas output\"):\n\n\"Giảm vận tải đường bộ có thể làm giảm đáng kể lượng khí nhà kính thải ra.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Reducing road freight could significantly lower greenhouse gas output.",
        "explanationVi": "'Greenhouse gas output' = lượng khí nhà kính thải ra. 'Significantly lower' = làm giảm đáng kể.",
        "modelAnswer": "Reducing road freight could significantly lower greenhouse gas output.",
        "fallbackKeywords": [
          "reducing road freight",
          "greenhouse gas output"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w8fr_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cargo capacity\"):\n\n\"Tàu hỏa nhìn chung có sức chứa hàng hóa lớn hơn nhiều so với xe tải.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Trains generally offer far greater cargo capacity than trucks.",
        "explanationVi": "'Cargo capacity' = sức chứa hàng hóa. 'Far greater than' = lớn hơn nhiều so với.",
        "modelAnswer": "Trains generally offer far greater cargo capacity than trucks.",
        "fallbackKeywords": [
          "cargo capacity",
          "trains",
          "trucks"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w8fr_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"transport subsidy\"):\n\n\"Một khoản trợ cấp giao thông vận tải có thể khiến vận tải đường sắt cạnh tranh hơn với vận tải đường bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A transport subsidy could make rail freight more competitive with trucking.",
        "explanationVi": "'Transport subsidy' = trợ cấp giao thông vận tải. 'More competitive with' = cạnh tranh hơn với.",
        "modelAnswer": "A transport subsidy could make rail freight more competitive with trucking.",
        "fallbackKeywords": [
          "transport subsidy",
          "rail freight",
          "competitive"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w8fr_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cross-border trade\"):\n\n\"Hệ thống vận tải hàng hóa hiệu quả là điều cần thiết cho thương mại xuyên biên giới thuận lợi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Efficient freight systems are essential for smooth cross-border trade.",
        "explanationVi": "'Cross-border trade' = thương mại xuyên biên giới. 'Essential for + N' = cần thiết cho.",
        "modelAnswer": "Efficient freight systems are essential for smooth cross-border trade.",
        "fallbackKeywords": [
          "freight systems",
          "cross-border trade",
          "essential"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 8,
    "block": "effect_solution",
    "topicName": "Decline in Walking and Cycling Habits",
    "topicEmoji": "🚶",
    "essayType": "effect_solution",
    "prompt": "In modern cities, fewer citizens choose to walk or cycle for daily short-distance journeys. What effects does this shift produce, and how can urban planners encourage non-motorized travel?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 38,
    "vocabularyList": [
      {
        "term": "non-motorized travel",
        "definitionVi": "phương thức di chuyển không dùng động cơ",
        "example": "Urban planners are looking for ways to encourage non-motorized travel."
      },
      {
        "term": "short-distance journey",
        "definitionVi": "chuyến đi quãng đường ngắn",
        "example": "Fewer citizens choose to walk for short-distance journeys nowadays."
      },
      {
        "term": "physical inactivity",
        "definitionVi": "sự thiếu vận động thể chất",
        "example": "The decline in walking has contributed to rising physical inactivity."
      },
      {
        "term": "pedestrian-friendly",
        "definitionVi": "thân thiện với người đi bộ",
        "example": "Pedestrian-friendly streets encourage more people to walk instead of drive."
      },
      {
        "term": "cycling lanes",
        "definitionVi": "làn đường dành cho xe đạp",
        "example": "Dedicated cycling lanes make cycling safer in busy cities."
      },
      {
        "term": "urban design",
        "definitionVi": "thiết kế đô thị",
        "example": "Poor urban design often discourages walking and cycling."
      },
      {
        "term": "obesity rate",
        "definitionVi": "tỷ lệ béo phì",
        "example": "A decline in walking habits has been linked to rising obesity rates."
      },
      {
        "term": "air quality",
        "definitionVi": "chất lượng không khí",
        "example": "More cycling and walking could significantly improve urban air quality."
      },
      {
        "term": "traffic safety concerns",
        "definitionVi": "lo ngại về an toàn giao thông",
        "example": "Traffic safety concerns discourage many parents from letting children walk to school."
      },
      {
        "term": "mixed-use development",
        "definitionVi": "phát triển đa chức năng",
        "example": "Mixed-use development places homes, shops, and offices within walking distance."
      },
      {
        "term": "car-centric infrastructure",
        "definitionVi": "cơ sở hạ tầng lấy ô tô làm trung tâm",
        "example": "Car-centric infrastructure has made walking and cycling less convenient."
      },
      {
        "term": "bike-sharing scheme",
        "definitionVi": "chương trình xe đạp chia sẻ",
        "example": "A bike-sharing scheme can make cycling more accessible in cities."
      },
      {
        "term": "sedentary habits",
        "definitionVi": "thói quen ít vận động",
        "example": "Modern transport options have encouraged increasingly sedentary habits."
      },
      {
        "term": "public awareness campaign",
        "definitionVi": "chiến dịch nâng cao nhận thức cộng đồng",
        "example": "A public awareness campaign could highlight the benefits of active travel."
      },
      {
        "term": "walking distance",
        "definitionVi": "khoảng cách có thể đi bộ",
        "example": "Urban planners should design neighbourhoods within walking distance of amenities."
      },
      {
        "term": "traffic calming measures",
        "definitionVi": "biện pháp làm dịu giao thông",
        "example": "Traffic calming measures such as speed bumps can make streets safer for pedestrians."
      },
      {
        "term": "commuting habits",
        "definitionVi": "thói quen di chuyển đi làm",
        "example": "Changing commuting habits requires both infrastructure and public education."
      },
      {
        "term": "carbon-free transport",
        "definitionVi": "phương tiện không phát thải carbon",
        "example": "Walking and cycling are examples of carbon-free transport."
      },
      {
        "term": "health benefits",
        "definitionVi": "lợi ích sức khỏe",
        "example": "Regular walking and cycling provide significant long-term health benefits."
      },
      {
        "term": "school travel plans",
        "definitionVi": "kế hoạch di chuyển đến trường học",
        "example": "School travel plans can encourage children to walk or cycle safely to school."
      },
      {
        "term": "reclaim public space",
        "definitionVi": "giành lại không gian công cộng",
        "example": "Car-free zones help cities reclaim public space for pedestrians."
      },
      {
        "term": "make streets safer for",
        "definitionVi": "làm cho đường phố an toàn hơn cho",
        "example": "Traffic calming measures make streets safer for cyclists and pedestrians."
      },
      {
        "term": "champion active travel",
        "definitionVi": "cổ vũ cho việc di chuyển chủ động",
        "example": "Several European cities actively champion active travel over driving."
      },
      {
        "term": "revitalise city centres",
        "definitionVi": "hồi sinh khu trung tâm thành phố",
        "example": "Pedestrian-friendly design can revitalise city centres and boost local businesses."
      },
      {
        "term": "instil a walking culture",
        "definitionVi": "hình thành văn hóa đi bộ",
        "example": "Urban design can instil a walking culture from a young age."
      },
      {
        "term": "remove barriers to",
        "definitionVi": "loại bỏ các rào cản đối với",
        "example": "Better infrastructure can remove barriers to cycling in busy cities."
      },
      {
        "term": "prioritise pedestrians over cars",
        "definitionVi": "ưu tiên người đi bộ hơn xe hơi",
        "example": "Some cities now prioritise pedestrians over cars in urban planning."
      },
      {
        "term": "cater to cyclists' needs",
        "definitionVi": "đáp ứng nhu cầu của người đi xe đạp",
        "example": "New road designs increasingly cater to cyclists' needs."
      },
      {
        "term": "improve air quality",
        "definitionVi": "cải thiện chất lượng không khí",
        "example": "Encouraging cycling can significantly improve air quality in cities."
      },
      {
        "term": "yield long-term health gains",
        "definitionVi": "mang lại lợi ích sức khỏe lâu dài",
        "example": "Regular walking can yield long-term health gains for city dwellers."
      }
    ],
    "questions": [
      {
        "questionId": "w8wc_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"What effects does this shift produce, and how can urban planners encourage non-motorized travel?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Cause & Solution",
          "Effect & Solution",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Effect & Solution",
        "explanationVi": "Đề hỏi 'effects' (hệ quả) và 'how can... encourage' (giải pháp) — không hỏi 'causes'. Đây là dạng Effect & Solution.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w8wc_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"In modern cities, fewer citizens choose to walk or cycle for daily short-distance _____.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "journeys",
        "explanationVi": "'Short-distance journey' = chuyến đi quãng đường ngắn. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w8wc_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ở các thành phố hiện đại, ngày càng ít người dân chọn đi bộ hoặc đạp xe cho những chuyến đi ngắn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In modern cities, fewer citizens choose to walk or cycle for short journeys.",
        "explanationVi": "'Fewer + N' = ít hơn. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "In modern cities, fewer citizens choose to walk or cycle for short journeys.",
        "fallbackKeywords": [
          "modern cities",
          "fewer citizens",
          "walk or cycle"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w8wc_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sự suy giảm thói quen đi bộ đã góp phần vào tình trạng thiếu vận động thể chất gia tăng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The decline in walking has contributed to rising physical inactivity.",
        "explanationVi": "'The decline in + N' = sự suy giảm của. 'Physical inactivity' = sự thiếu vận động thể chất.",
        "modelAnswer": "The decline in walking has contributed to rising physical inactivity.",
        "fallbackKeywords": [
          "decline in walking",
          "physical inactivity"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w8wc_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những con phố thân thiện với người đi bộ khuyến khích nhiều người đi bộ thay vì lái xe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Pedestrian-friendly streets encourage more people to walk instead of drive.",
        "explanationVi": "'Pedestrian-friendly' = thân thiện với người đi bộ. 'Instead of + V-ing' = thay vì làm gì.",
        "modelAnswer": "Pedestrian-friendly streets encourage more people to walk instead of drive.",
        "fallbackKeywords": [
          "pedestrian-friendly streets",
          "walk instead of drive"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w8wc_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Làn đường dành riêng cho xe đạp giúp việc đạp xe an toàn hơn ở các thành phố đông đúc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Dedicated cycling lanes make cycling safer in busy cities.",
        "explanationVi": "'Cycling lanes' = làn đường dành cho xe đạp. 'Make + N + adj' = làm cho cái gì trở nên như thế nào.",
        "modelAnswer": "Dedicated cycling lanes make cycling safer in busy cities.",
        "fallbackKeywords": [
          "cycling lanes",
          "safer",
          "busy cities"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w8wc_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by introducing / a bike-sharing scheme / encourage cycling / Cities]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Cities could encourage cycling by introducing a bike-sharing scheme.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Bike-sharing scheme' = chương trình xe đạp chia sẻ.",
        "modelAnswer": "Cities could encourage cycling by introducing a bike-sharing scheme.",
        "fallbackKeywords": [
          "cities",
          "encourage cycling",
          "bike-sharing scheme"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w8wc_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Urban planners should to build more pedestrian-friendly streets.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Urban planners should build more pedestrian-friendly streets.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Urban planners should build more pedestrian-friendly streets.",
        "fallbackKeywords": [
          "urban planners",
          "pedestrian-friendly streets"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w8wc_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban design\"):\n\n\"Thiết kế đô thị kém thường khiến người dân e ngại việc đi bộ và đạp xe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Poor urban design often discourages walking and cycling.",
        "explanationVi": "'Urban design' = thiết kế đô thị. 'Discourage + N/V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "Poor urban design often discourages walking and cycling.",
        "fallbackKeywords": [
          "urban design",
          "discourages",
          "walking and cycling"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w8wc_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"obesity rate\"):\n\n\"Sự suy giảm thói quen đi bộ có liên hệ với tỷ lệ béo phì ngày càng tăng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A decline in walking habits has been linked to rising obesity rates.",
        "explanationVi": "'Obesity rate' = tỷ lệ béo phì. 'Be linked to + N' = có liên hệ với.",
        "modelAnswer": "A decline in walking habits has been linked to rising obesity rates.",
        "fallbackKeywords": [
          "decline in walking habits",
          "obesity rates"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w8wc_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"air quality\"):\n\n\"Đi bộ và đạp xe nhiều hơn có thể cải thiện đáng kể chất lượng không khí đô thị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More cycling and walking could significantly improve urban air quality.",
        "explanationVi": "'Air quality' = chất lượng không khí. 'Significantly improve' = cải thiện đáng kể.",
        "modelAnswer": "More cycling and walking could significantly improve urban air quality.",
        "fallbackKeywords": [
          "cycling and walking",
          "air quality",
          "significantly improve"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w8wc_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"traffic safety concerns\"):\n\n\"Lo ngại về an toàn giao thông khiến nhiều phụ huynh không cho con đi bộ đến trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic safety concerns discourage many parents from letting children walk to school.",
        "explanationVi": "'Traffic safety concerns' = lo ngại về an toàn giao thông. 'Discourage + O + from + V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "Traffic safety concerns discourage many parents from letting children walk to school.",
        "fallbackKeywords": [
          "traffic safety concerns",
          "parents",
          "walk to school"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w8wc_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mixed-use development\"):\n\n\"Phát triển đa chức năng đặt nhà ở, cửa hàng và văn phòng trong khoảng cách có thể đi bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mixed-use development places homes, shops, and offices within walking distance.",
        "explanationVi": "'Mixed-use development' = phát triển đa chức năng. 'Within walking distance' = trong khoảng cách có thể đi bộ.",
        "modelAnswer": "Mixed-use development places homes, shops, and offices within walking distance.",
        "fallbackKeywords": [
          "mixed-use development",
          "walking distance"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w8wc_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"car-centric infrastructure\"):\n\n\"Cơ sở hạ tầng lấy ô tô làm trung tâm đã khiến việc đi bộ và đạp xe trở nên kém tiện lợi hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Car-centric infrastructure has made walking and cycling less convenient.",
        "explanationVi": "'Car-centric infrastructure' = cơ sở hạ tầng lấy ô tô làm trung tâm. 'Make + N + less convenient' = làm cho cái gì kém tiện lợi hơn.",
        "modelAnswer": "Car-centric infrastructure has made walking and cycling less convenient.",
        "fallbackKeywords": [
          "car-centric infrastructure",
          "less convenient"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w8wc_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sedentary habits\"):\n\n\"Các phương tiện giao thông hiện đại đã khuyến khích những thói quen ngày càng ít vận động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Modern transport options have encouraged increasingly sedentary habits.",
        "explanationVi": "'Sedentary habits' = thói quen ít vận động. 'Increasingly + adj' = ngày càng.",
        "modelAnswer": "Modern transport options have encouraged increasingly sedentary habits.",
        "fallbackKeywords": [
          "modern transport options",
          "sedentary habits"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w8wc_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"traffic calming measures\"):\n\n\"Các biện pháp làm dịu giao thông như gờ giảm tốc có thể khiến đường phố an toàn hơn cho người đi bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Traffic calming measures such as speed bumps can make streets safer for pedestrians.",
        "explanationVi": "'Traffic calming measures' = biện pháp làm dịu giao thông. 'Speed bumps' = gờ giảm tốc.",
        "modelAnswer": "Traffic calming measures such as speed bumps can make streets safer for pedestrians.",
        "fallbackKeywords": [
          "traffic calming measures",
          "speed bumps",
          "pedestrians"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w8wc_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"commuting habits\"):\n\n\"Thay đổi thói quen di chuyển đi làm đòi hỏi cả cơ sở hạ tầng lẫn giáo dục cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Changing commuting habits requires both infrastructure and public education.",
        "explanationVi": "'Commuting habits' = thói quen di chuyển đi làm. 'Require both A and B' = đòi hỏi cả A lẫn B.",
        "modelAnswer": "Changing commuting habits requires both infrastructure and public education.",
        "fallbackKeywords": [
          "commuting habits",
          "infrastructure",
          "public education"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w8wc_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"health benefits\"):\n\n\"Đi bộ và đạp xe thường xuyên mang lại những lợi ích sức khỏe lâu dài đáng kể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Regular walking and cycling provide significant long-term health benefits.",
        "explanationVi": "'Health benefits' = lợi ích sức khỏe. 'Provide + N' = mang lại.",
        "modelAnswer": "Regular walking and cycling provide significant long-term health benefits.",
        "fallbackKeywords": [
          "regular walking and cycling",
          "health benefits"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w8wc_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"school travel plans\"):\n\n\"Kế hoạch di chuyển đến trường học có thể khuyến khích trẻ em đi bộ hoặc đạp xe đến trường an toàn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "School travel plans can encourage children to walk or cycle to school safely.",
        "explanationVi": "'School travel plans' = kế hoạch di chuyển đến trường học. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "School travel plans can encourage children to walk or cycle to school safely.",
        "fallbackKeywords": [
          "school travel plans",
          "children",
          "walk or cycle"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w8wc_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"carbon-free transport\"):\n\n\"Đi bộ và đạp xe là những ví dụ về phương tiện di chuyển không phát thải carbon.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Walking and cycling are examples of carbon-free transport.",
        "explanationVi": "'Carbon-free transport' = phương tiện không phát thải carbon. 'Examples of + N' = ví dụ về.",
        "modelAnswer": "Walking and cycling are examples of carbon-free transport.",
        "fallbackKeywords": [
          "carbon-free transport",
          "walking and cycling"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 9,
    "block": "agree_disagree",
    "topicName": "Shorter Work Week",
    "topicEmoji": "💼",
    "essayType": "agree_disagree",
    "prompt": "The working week should be shorter and workers should have a longer weekend. Do you agree or disagree?",
    "hintAdvantages": [
      "reduces stress",
      "increases productivity",
      "better work-life balance"
    ],
    "hintDisadvantages": [
      "economic impact",
      "reduced income",
      "lower output"
    ],
    "orderIndex": 8,
    "vocabularyList": [
      {
        "term": "working week",
        "definitionVi": "tuần làm việc",
        "example": "Many argue that the standard five-day working week is no longer suitable for modern employees."
      },
      {
        "term": "shorter working hours",
        "definitionVi": "giờ làm việc ngắn hơn",
        "example": "Shorter working hours have been shown to improve both morale and efficiency."
      },
      {
        "term": "long weekend",
        "definitionVi": "kỳ nghỉ cuối tuần dài",
        "example": "A long weekend gives workers valuable time to rest and spend with family."
      },
      {
        "term": "work–life balance",
        "definitionVi": "cân bằng giữa công việc và cuộc sống",
        "example": "A shorter work week promotes a healthier work-life balance."
      },
      {
        "term": "productivity",
        "definitionVi": "năng suất làm việc",
        "example": "Studies show that well-rested workers have higher productivity."
      },
      {
        "term": "efficiency",
        "definitionVi": "hiệu quả công việc",
        "example": "Reducing working hours can improve overall efficiency in the workplace."
      },
      {
        "term": "job satisfaction",
        "definitionVi": "sự hài lòng trong công việc",
        "example": "Employees who enjoy a better work-life balance report higher job satisfaction."
      },
      {
        "term": "mental health",
        "definitionVi": "sức khỏe tinh thần",
        "example": "Overworking can have a serious negative impact on employees' mental health."
      },
      {
        "term": "burnout",
        "definitionVi": "kiệt sức",
        "example": "Overworking for an extended period can lead to burnout."
      },
      {
        "term": "stress level",
        "definitionVi": "mức độ căng thẳng",
        "example": "A shorter working week can significantly reduce employees' stress levels."
      },
      {
        "term": "flexible schedule",
        "definitionVi": "lịch làm việc linh hoạt",
        "example": "A flexible schedule helps employees manage their personal and professional lives more effectively."
      },
      {
        "term": "employee well-being",
        "definitionVi": "hạnh phúc và sức khỏe của nhân viên",
        "example": "More rest time significantly improves employee well-being."
      },
      {
        "term": "quality time",
        "definitionVi": "thời gian chất lượng",
        "example": "A longer weekend allows workers to spend quality time with their loved ones."
      },
      {
        "term": "leisure activities",
        "definitionVi": "hoạt động giải trí",
        "example": "Employees can use extra free time to engage in leisure activities such as sport or hobbies."
      },
      {
        "term": "family bonding",
        "definitionVi": "gắn kết gia đình",
        "example": "A shorter working week promotes family bonding by giving parents more time at home."
      },
      {
        "term": "overall happiness",
        "definitionVi": "hạnh phúc tổng thể",
        "example": "Work-life balance is a key factor in maintaining employees' overall happiness."
      },
      {
        "term": "economic growth",
        "definitionVi": "tăng trưởng kinh tế",
        "example": "Some argue a shorter working week may slow economic growth."
      },
      {
        "term": "company profit",
        "definitionVi": "lợi nhuận của công ty",
        "example": "Reduced working hours may affect company profit if output declines."
      },
      {
        "term": "reduced workload",
        "definitionVi": "khối lượng công việc giảm",
        "example": "A reduced workload helps employees focus better on priority tasks."
      },
      {
        "term": "motivation",
        "definitionVi": "động lực làm việc",
        "example": "Well-rested employees show higher levels of motivation and enthusiasm."
      },
      {
        "term": "working environment",
        "definitionVi": "môi trường làm việc",
        "example": "A positive working environment contributes significantly to employee satisfaction."
      },
      {
        "term": "absenteeism",
        "definitionVi": "tình trạng vắng mặt (ở nơi làm việc)",
        "example": "Shorter working hours have been linked to a reduction in absenteeism."
      },
      {
        "term": "turnover rate",
        "definitionVi": "tỉ lệ nghỉ việc",
        "example": "Reducing working hours may help lower the employee turnover rate."
      },
      {
        "term": "remote working",
        "definitionVi": "làm việc từ xa",
        "example": "Remote working combined with a shorter working week could become the norm for many industries."
      },
      {
        "term": "flexible working policy",
        "definitionVi": "chính sách làm việc linh hoạt",
        "example": "Companies should consider adopting a flexible working policy to attract and retain talent."
      },
      {
        "term": "labor productivity",
        "definitionVi": "năng suất lao động",
        "example": "Research suggests that reducing working hours can actually improve labor productivity."
      },
      {
        "term": "economic impact",
        "definitionVi": "tác động kinh tế",
        "example": "The economic impact of a four-day working week is still being widely debated."
      },
      {
        "term": "time management",
        "definitionVi": "quản lý thời gian",
        "example": "Good time management skills allow workers to be productive in fewer hours."
      },
      {
        "term": "employee performance",
        "definitionVi": "hiệu suất của nhân viên",
        "example": "Employees who have adequate rest time generally show better performance."
      },
      {
        "term": "personal development",
        "definitionVi": "phát triển bản thân",
        "example": "Having extra time off allows employees to invest in personal development."
      },
      {
        "term": "boost productivity levels",
        "definitionVi": "thúc đẩy mức năng suất",
        "example": "Some studies suggest a four-day week can boost productivity levels."
      },
      {
        "term": "reap the rewards of",
        "definitionVi": "gặt hái thành quả từ",
        "example": "Employees reap the rewards of a shorter week through better well-being."
      },
      {
        "term": "come at the expense of",
        "definitionVi": "phải trả giá bằng",
        "example": "Longer weekends should not come at the expense of business output."
      },
      {
        "term": "recharge one's batteries",
        "definitionVi": "nạp lại năng lượng",
        "example": "A longer weekend gives workers time to recharge their batteries."
      },
      {
        "term": "cut down on overtime",
        "definitionVi": "cắt giảm giờ làm thêm",
        "example": "A shorter working week could help cut down on excessive overtime."
      },
      {
        "term": "reshape working patterns",
        "definitionVi": "định hình lại mô hình làm việc",
        "example": "The pandemic has helped reshape working patterns across industries."
      },
      {
        "term": "safeguard employees' well-being",
        "definitionVi": "bảo vệ sức khỏe và hạnh phúc của nhân viên",
        "example": "Companies should safeguard employees' well-being alongside profit."
      },
      {
        "term": "maintain output levels",
        "definitionVi": "duy trì mức sản lượng",
        "example": "Trials have shown some firms can maintain output levels with fewer days."
      },
      {
        "term": "trial a new policy",
        "definitionVi": "thử nghiệm một chính sách mới",
        "example": "Several companies have trialled a new four-day-week policy successfully."
      },
      {
        "term": "erode work-life balance",
        "definitionVi": "làm xói mòn sự cân bằng công việc-cuộc sống",
        "example": "Long working hours can gradually erode work-life balance."
      }
    ],
    "questions": [
      {
        "questionId": "w5t8_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Để đạt Band 6.5+ trong bài Agree/Disagree, cấu trúc bài luận nào là phù hợp nhất?",
        "options": [
          "Viết 1 body đồng ý + 1 body không đồng ý (không rõ lập trường)",
          "Viết rõ lập trường (đồng ý hoặc không đồng ý), duy trì nhất quán suốt bài",
          "Không cần nêu ý kiến cá nhân trong Introduction",
          "Kết luận không cần nhắc lại lập trường"
        ],
        "baseWords": [],
        "correctAnswer": "Viết rõ lập trường (đồng ý hoặc không đồng ý), duy trì nhất quán suốt bài",
        "explanationVi": "Band 6.5+ yêu cầu lập trường rõ ràng và nhất quán từ đầu đến cuối. Nếu viết 1 body đồng ý + 1 body không đồng ý mà không có lập trường chủ đạo, bài sẽ bị đánh giá 'unclear position' → giảm điểm Task Response.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w5t8_q02",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Cân bằng giữa công việc và cuộc sống là yếu tố quan trọng để duy trì hạnh phúc tổng thể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Work-life balance is a crucial factor in maintaining overall happiness.",
        "explanationVi": "'A crucial factor in + V-ing' = yếu tố quan trọng trong việc. 'Maintaining overall happiness' = duy trì hạnh phúc tổng thể. 'Crucial' = quan trọng (mạnh hơn 'important').",
        "modelAnswer": "Work-life balance is a crucial factor in maintaining overall happiness.",
        "fallbackKeywords": [
          "work-life balance",
          "crucial",
          "happiness",
          "maintaining"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w5t8_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Làm việc quá sức trong thời gian dài có thể dẫn đến kiệt sức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overworking for an extended period can lead to burnout.",
        "explanationVi": "'Overworking' = làm việc quá sức (gerund làm chủ ngữ). 'For an extended period' = trong thời gian dài (formal hơn 'for a long time'). 'Burnout' = kiệt sức do công việc.",
        "modelAnswer": "Overworking for an extended period can lead to burnout.",
        "fallbackKeywords": [
          "overworking",
          "extended period",
          "burnout",
          "lead to"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w5t8_q04",
        "level": "beginner",
        "type": "topic_sentence",
        "questionText": "Chọn Thesis Statement tốt nhất cho bài essay ĐỒNG Ý với tuần làm việc ngắn hơn:",
        "options": [
          "I will discuss both the advantages and disadvantages of a shorter working week.",
          "I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.",
          "Some people agree while others disagree with this idea.",
          "A shorter working week is an interesting topic to discuss."
        ],
        "baseWords": [],
        "correctAnswer": "I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.",
        "explanationVi": "'I strongly agree that...' nêu lập trường rõ ràng. 'As this would...' giải thích lý do ngay trong thesis — đây là kỹ thuật nâng cao. Lựa chọn 1 là Advantages & Disadvantages, không phải Agree/Disagree.",
        "fallbackKeywords": [],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w5t8_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Khi được nghỉ ngơi nhiều hơn, sức khỏe và phúc lợi của nhân viên được cải thiện đáng kể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When given more rest time, employee well-being improves significantly.",
        "explanationVi": "'When given + N' = khi được cho/nhận (passive participle clause). 'Employee well-being' = sức khỏe và phúc lợi nhân viên. 'Improves significantly' = cải thiện đáng kể.",
        "modelAnswer": "When given more rest time, employee well-being improves significantly.",
        "fallbackKeywords": [
          "employee well-being",
          "rest",
          "improves",
          "significantly"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w5t8_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng tuần làm việc ngắn hơn có thể làm chậm tăng trưởng kinh tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that a shorter working week may slow down economic growth.",
        "explanationVi": "'Some people argue that...' = một số người cho rằng — cách trình bày quan điểm đối lập mà không mất lập trường cá nhân. 'Slow down' = làm chậm.",
        "modelAnswer": "Some people argue that a shorter working week may slow down economic growth.",
        "fallbackKeywords": [
          "shorter working week",
          "economic growth",
          "slow down",
          "argue"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w5t8_q07",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"I agree that working weeks should be shorter because workers need time to resting.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I agree that working weeks should be shorter because workers need time to rest.",
        "explanationVi": "Lỗi: Sau 'need + time + to' phải dùng bare infinitive. 'to resting' → 'to rest'. Cấu trúc: 'need time to + V (nguyên thể)'.",
        "modelAnswer": "I agree that working weeks should be shorter because workers need time to rest.",
        "fallbackKeywords": [
          "agree",
          "working weeks",
          "shorter",
          "workers",
          "rest"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w5t8_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nghiên cứu cho thấy việc giảm giờ làm thực ra có thể cải thiện năng suất lao động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Research suggests that reducing working hours can actually improve labor productivity.",
        "explanationVi": "'Research suggests that...' = nghiên cứu cho thấy — cách dẫn chứng học thuật không cần trích nguồn cụ thể. 'Actually' nhấn mạnh điều ngược trực giác. 'Labor productivity' = năng suất lao động.",
        "modelAnswer": "Research suggests that reducing working hours can actually improve labor productivity.",
        "fallbackKeywords": [
          "research",
          "working hours",
          "labor productivity",
          "improve"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w5t8_q09",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Paraphrase câu sau:\n\n\"The working week should be shorter and workers should have a longer weekend.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.",
        "explanationVi": "Thay 'workers' → 'employees', 'shorter' → 'reduction in', 'longer weekend' → 'extended periods of leisure and recovery'. 'Allowing for' = cho phép, tạo điều kiện cho.",
        "modelAnswer": "Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.",
        "fallbackKeywords": [
          "employees",
          "reduction",
          "leisure",
          "recovery",
          "extended"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w5t8_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"working week\"):\n\n\"Nhiều người tin rằng tuần làm việc nên ngắn hơn để có nhiều thời gian nghỉ ngơi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people believe that the working week should be shorter in order to allow more time for rest.",
        "explanationVi": "'In order to + V' = để (mục đích, trang trọng hơn 'to'). 'Allow + time for + N' = cho phép có thời gian cho — collocation học thuật.",
        "modelAnswer": "Many people believe that the working week should be shorter in order to allow more time for rest.",
        "fallbackKeywords": [
          "working week",
          "shorter",
          "rest",
          "allow"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w5t8_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"productivity\" + \"efficiency\"):\n\n\"Làm việc ít giờ hơn có thể giúp cải thiện năng suất và hiệu quả công việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working fewer hours can help improve both productivity and overall efficiency.",
        "explanationVi": "'Fewer hours' = ít giờ hơn (đếm được). 'Both A and B' = cả A lẫn B. 'Overall efficiency' = hiệu quả tổng thể — 'overall' nhấn mạnh phạm vi rộng.",
        "modelAnswer": "Working fewer hours can help improve both productivity and overall efficiency.",
        "fallbackKeywords": [
          "productivity",
          "efficiency",
          "fewer hours",
          "improve"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w5t8_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"work–life balance\"):\n\n\"Cân bằng giữa công việc và cuộc sống là yếu tố quan trọng để duy trì hạnh phúc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Work–life balance is a crucial factor in maintaining personal well-being and happiness.",
        "explanationVi": "'Crucial factor' = yếu tố then chốt (mạnh hơn 'important factor'). 'In maintaining' = trong việc duy trì — gerund sau giới từ.",
        "modelAnswer": "Work–life balance is a crucial factor in maintaining personal well-being and happiness.",
        "fallbackKeywords": [
          "work-life balance",
          "crucial",
          "well-being",
          "happiness"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w5t8_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"family bonding\"):\n\n\"Khi có nhiều thời gian rảnh, người lao động có thể dành thời gian cho gia đình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "With more free time, workers can dedicate time to family bonding.",
        "explanationVi": "'Family bonding' = gắn kết gia đình. 'Dedicate time to + N/V-ing' = dành thời gian cho — formal hơn 'spend time with'.",
        "modelAnswer": "With more free time, workers can dedicate time to family bonding.",
        "fallbackKeywords": [
          "family bonding",
          "free time",
          "workers",
          "dedicate"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w5t8_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"burnout\"):\n\n\"Việc làm việc quá nhiều giờ có thể gây ra căng thẳng và kiệt sức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working excessive hours can cause both stress and burnout.",
        "explanationVi": "'Burnout' = kiệt sức do làm việc quá độ. 'Excessive hours' = số giờ quá mức (excessive = formal hơn 'too many'). 'Both A and B' liệt kê hai kết quả.",
        "modelAnswer": "Working excessive hours can cause both stress and burnout.",
        "fallbackKeywords": [
          "burnout",
          "excessive hours",
          "stress",
          "cause"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w5t8_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"flexible schedule\"):\n\n\"Lịch làm việc linh hoạt giúp nhân viên kiểm soát tốt hơn thời gian của mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A flexible schedule gives employees greater control over their own time.",
        "explanationVi": "'Control over + N' = quyền kiểm soát đối với — 'over' là giới từ đi với 'control'. 'Greater control' = so sánh hơn của danh từ.",
        "modelAnswer": "A flexible schedule gives employees greater control over their own time.",
        "fallbackKeywords": [
          "flexible schedule",
          "employees",
          "control",
          "time"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w5t8_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"employee performance\"):\n\n\"Nhân viên có thời gian nghỉ ngơi hợp lý thường làm việc hiệu quả hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Employees who have adequate rest time generally show better employee performance.",
        "explanationVi": "'Adequate rest time' = thời gian nghỉ ngơi đầy đủ. 'Show better performance' = thể hiện/có hiệu suất tốt hơn — 'show' học thuật hơn 'have'.",
        "modelAnswer": "Employees who have adequate rest time generally show better employee performance.",
        "fallbackKeywords": [
          "employee performance",
          "rest time",
          "adequate",
          "better"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w5t8_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job satisfaction\" + \"working environment\"):\n\n\"Một môi trường làm việc tốt giúp tăng sự hài lòng trong công việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A positive working environment helps increase job satisfaction among employees.",
        "explanationVi": "'A positive working environment' = môi trường làm việc tích cực. 'Among employees' = trong số nhân viên — 'among' thay 'for' khi nói về nhóm người.",
        "modelAnswer": "A positive working environment helps increase job satisfaction among employees.",
        "fallbackKeywords": [
          "job satisfaction",
          "working environment",
          "positive",
          "increase"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w5t8_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"personal development\"):\n\n\"Việc có thêm thời gian nghỉ giúp họ phát triển kỹ năng cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Having extra time off allows employees to invest in personal development.",
        "explanationVi": "'Time off' = thời gian nghỉ (từ ghép). 'Allow + O + to V' = cho phép ai làm gì. 'Invest in personal development' = đầu tư vào phát triển cá nhân.",
        "modelAnswer": "Having extra time off allows employees to invest in personal development.",
        "fallbackKeywords": [
          "personal development",
          "extra time off",
          "invest",
          "allows"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w5t8_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"turnover rate\"):\n\n\"Giảm giờ làm việc có thể giúp giảm tỉ lệ nghỉ việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Reducing working hours may help lower the employee turnover rate.",
        "explanationVi": "'Turnover rate' = tỉ lệ nhân viên nghỉ việc và thay thế. 'May help lower' = có thể giúp giảm — 'may' nhẹ hơn 'can' (mức độ khả năng).",
        "modelAnswer": "Reducing working hours may help lower the employee turnover rate.",
        "fallbackKeywords": [
          "turnover rate",
          "reducing working hours",
          "lower"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 9,
    "block": "agree_disagree",
    "topicName": "Remote Work as the Future",
    "topicEmoji": "🧑‍💻",
    "essayType": "agree_disagree",
    "prompt": "Working from home will become the main way people work in the future. Do you agree or disagree?",
    "hintAdvantages": [
      "flexibility",
      "cost savings",
      "no commute"
    ],
    "hintDisadvantages": [
      "isolation",
      "difficulty monitoring",
      "blurred boundaries"
    ],
    "orderIndex": 9,
    "vocabularyList": [
      {
        "term": "remote work",
        "definitionVi": "làm việc từ xa",
        "example": "Remote work has become increasingly common since the pandemic."
      },
      {
        "term": "work-life balance",
        "definitionVi": "cân bằng giữa công việc và cuộc sống",
        "example": "Working from home can improve work-life balance by eliminating long commutes."
      },
      {
        "term": "telecommuting",
        "definitionVi": "làm việc qua mạng / làm việc từ xa",
        "example": "Telecommuting has grown rapidly due to advances in digital communication technology."
      },
      {
        "term": "productivity",
        "definitionVi": "năng suất làm việc",
        "example": "The impact of remote work on productivity varies by industry and role."
      },
      {
        "term": "flexibility",
        "definitionVi": "sự linh hoạt",
        "example": "Remote work offers greater flexibility in terms of working hours and location."
      },
      {
        "term": "digital communication tools",
        "definitionVi": "công cụ giao tiếp kỹ thuật số",
        "example": "Digital communication tools like Zoom and Slack are essential for remote teams."
      },
      {
        "term": "video conferencing",
        "definitionVi": "hội nghị trực tuyến",
        "example": "Video conferencing has replaced many in-person meetings during the remote work era."
      },
      {
        "term": "home office",
        "definitionVi": "văn phòng tại nhà",
        "example": "Setting up a dedicated home office helps employees maintain focus and professionalism."
      },
      {
        "term": "time management",
        "definitionVi": "quản lý thời gian",
        "example": "Effective time management is essential for staying productive when working from home."
      },
      {
        "term": "employee satisfaction",
        "definitionVi": "sự hài lòng của nhân viên",
        "example": "Flexible remote work arrangements have significantly increased employee satisfaction."
      },
      {
        "term": "isolation",
        "definitionVi": "sự cô lập",
        "example": "Prolonged remote work can lead to professional isolation and reduced team cohesion."
      },
      {
        "term": "collaboration",
        "definitionVi": "sự hợp tác",
        "example": "In-person collaboration is difficult to fully replicate in a remote setting."
      },
      {
        "term": "company culture",
        "definitionVi": "văn hóa doanh nghiệp",
        "example": "Working from home may negatively affect company culture and team cohesion."
      },
      {
        "term": "commuting time",
        "definitionVi": "thời gian di chuyển",
        "example": "Employees can save considerable commuting time by working from home."
      },
      {
        "term": "cost-effective",
        "definitionVi": "tiết kiệm chi phí",
        "example": "Remote work is cost-effective as it reduces expenses on office space and commuting."
      },
      {
        "term": "self-discipline",
        "definitionVi": "tính tự giác",
        "example": "Working from home requires a high level of self-discipline to maintain productivity."
      },
      {
        "term": "burnout",
        "definitionVi": "kiệt sức do công việc",
        "example": "Blurred work-life boundaries in remote work can contribute to burnout."
      },
      {
        "term": "mental health",
        "definitionVi": "sức khỏe tinh thần",
        "example": "Remote work can benefit mental health by reducing commute stress, but may increase isolation."
      },
      {
        "term": "communication barrier",
        "definitionVi": "rào cản giao tiếp",
        "example": "Lack of direct interaction can create a communication barrier in team collaboration."
      },
      {
        "term": "task efficiency",
        "definitionVi": "hiệu quả công việc",
        "example": "Remote workers often report higher task efficiency due to fewer office distractions."
      },
      {
        "term": "hybrid work model",
        "definitionVi": "mô hình làm việc kết hợp",
        "example": "Many companies have shifted to a hybrid work model combining home and office work."
      },
      {
        "term": "job performance",
        "definitionVi": "hiệu suất công việc",
        "example": "Managers find it harder to evaluate job performance in a remote setting."
      },
      {
        "term": "remote collaboration",
        "definitionVi": "hợp tác từ xa",
        "example": "Effective remote collaboration requires clear communication and the right digital tools."
      },
      {
        "term": "technological advancement",
        "definitionVi": "tiến bộ công nghệ",
        "example": "Technological advancement has made remote work more feasible and productive than ever."
      },
      {
        "term": "virtual meeting",
        "definitionVi": "cuộc họp trực tuyến",
        "example": "Virtual meetings help save time but sometimes lack the personal connection of in-person discussions."
      },
      {
        "term": "internet connectivity",
        "definitionVi": "kết nối internet",
        "example": "Poor internet connectivity can significantly disrupt remote work and online meetings."
      },
      {
        "term": "professional development",
        "definitionVi": "phát triển nghề nghiệp",
        "example": "Remote workers may miss out on informal learning and professional development opportunities."
      },
      {
        "term": "home distractions",
        "definitionVi": "sự xao nhãng tại nhà",
        "example": "Home distractions such as household chores or children can reduce focus during work hours."
      },
      {
        "term": "flexible schedule",
        "definitionVi": "lịch làm việc linh hoạt",
        "example": "Many employees prefer remote work because it allows for a more flexible schedule."
      },
      {
        "term": "long-term sustainability",
        "definitionVi": "tính bền vững lâu dài",
        "example": "Some argue that remote work as a dominant model lacks long-term sustainability for team culture."
      },
      {
        "term": "embrace remote working",
        "definitionVi": "chấp nhận, đón nhận làm việc từ xa",
        "example": "Many companies have embraced remote working since the pandemic."
      },
      {
        "term": "foster collaboration among",
        "definitionVi": "thúc đẩy sự hợp tác giữa",
        "example": "Video conferencing tools help foster collaboration among remote teams."
      },
      {
        "term": "blur the boundaries between",
        "definitionVi": "làm mờ ranh giới giữa",
        "example": "Working from home can blur the boundaries between work and personal life."
      },
      {
        "term": "cut commuting time",
        "definitionVi": "cắt giảm thời gian di chuyển",
        "example": "Remote work cuts commuting time and reduces daily stress."
      },
      {
        "term": "sustain team morale",
        "definitionVi": "duy trì tinh thần đội nhóm",
        "example": "Managers must find new ways to sustain team morale remotely."
      },
      {
        "term": "adapt to a hybrid model",
        "definitionVi": "thích nghi với mô hình kết hợp",
        "example": "Many organisations are adapting to a hybrid working model."
      },
      {
        "term": "widen the talent pool",
        "definitionVi": "mở rộng nguồn nhân lực",
        "example": "Remote work allows companies to widen the talent pool beyond one city."
      },
      {
        "term": "invest in digital infrastructure",
        "definitionVi": "đầu tư vào cơ sở hạ tầng kỹ thuật số",
        "example": "Firms must invest in digital infrastructure to support remote staff."
      },
      {
        "term": "undermine team cohesion",
        "definitionVi": "làm suy yếu sự gắn kết của đội nhóm",
        "example": "A lack of face-to-face contact can undermine team cohesion over time."
      },
      {
        "term": "strike the right balance",
        "definitionVi": "tìm ra sự cân bằng phù hợp",
        "example": "Companies need to strike the right balance between flexibility and structure."
      }
    ],
    "questions": [
      {
        "questionId": "w5t9_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Làm việc từ xa đã trở nên phổ biến hơn kể từ sau đại dịch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Remote work has become more prevalent since the pandemic.",
        "explanationVi": "'Prevalent' = phổ biến, lan rộng (academic hơn 'popular' hoặc 'common'). 'Since + N' dùng với Present Perfect để diễn đạt thay đổi từ một điểm trong quá khứ đến nay.",
        "modelAnswer": "Remote work has become more prevalent since the pandemic.",
        "fallbackKeywords": [
          "remote work",
          "prevalent",
          "pandemic"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w5t9_q02",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhân viên có thể tiết kiệm thời gian đi lại bằng cách làm việc tại nhà mỗi ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Employees can save commuting time by working from home every day.",
        "explanationVi": "'Save + N + by + V-ing' = tiết kiệm gì bằng cách làm gì. 'Commuting time' = thời gian đi lại (danh từ ghép). Đây là một lợi ích cụ thể của remote work.",
        "modelAnswer": "Employees can save commuting time by working from home every day.",
        "fallbackKeywords": [
          "employees",
          "commuting time",
          "working from home"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w5t9_q03",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều công ty đã chuyển sang mô hình làm việc kết hợp, kết hợp cả làm ở nhà và tại văn phòng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many companies have shifted to a hybrid work model combining home-based and office work.",
        "explanationVi": "'Shift to + N' = chuyển sang. 'Hybrid work model' = mô hình làm việc kết hợp. 'Combining...' là participle phrase bổ nghĩa. Present Perfect nhấn mạnh sự thay đổi đã xảy ra.",
        "modelAnswer": "Many companies have shifted to a hybrid work model combining home-based and office work.",
        "fallbackKeywords": [
          "hybrid work model",
          "companies",
          "home-based",
          "office"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w5t9_q04",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Làm việc tại nhà có thể ảnh hưởng tiêu cực đến văn hóa doanh nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working from home may have a negative impact on company culture.",
        "explanationVi": "'Have a negative impact on + N' = ảnh hưởng tiêu cực đến. 'Company culture' = văn hóa doanh nghiệp. Đây là một trong những nhược điểm chính của remote work.",
        "modelAnswer": "Working from home may have a negative impact on company culture.",
        "fallbackKeywords": [
          "company culture",
          "negative impact",
          "working from home"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w5t9_q05",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[remote work / I / will / believe / the dominant / become / working style of the future]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe remote work will become the dominant working style of the future.",
        "explanationVi": "Cấu trúc: 'I believe + (that) + S + will + V'. 'Dominant' = chiếm ưu thế. 'Working style of the future' = phong cách làm việc của tương lai.",
        "modelAnswer": "I believe remote work will become the dominant working style of the future.",
        "fallbackKeywords": [
          "remote work",
          "dominant",
          "working style",
          "future"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w5t9_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng làm việc từ xa thiếu tính bền vững lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that remote work lacks long-term sustainability.",
        "explanationVi": "'Lack + N' = thiếu, không có (verb, không cần 'lacks of'). 'Long-term sustainability' = tính bền vững lâu dài. 'Some people argue that' = cách trình bày quan điểm phản bác.",
        "modelAnswer": "Some people argue that remote work lacks long-term sustainability.",
        "fallbackKeywords": [
          "remote work",
          "long-term sustainability",
          "argue"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w5t9_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"remote work\"):\n\n\"Làm việc từ xa đã trở nên phổ biến hơn sau đại dịch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Remote work has become far more widespread since the pandemic.",
        "explanationVi": "'Far more widespread' = phổ biến hơn nhiều — 'far' tăng cường so sánh hơn. 'Since the pandemic' = kể từ đại dịch — Present Perfect đi với 'since'.",
        "modelAnswer": "Remote work has become far more widespread since the pandemic.",
        "fallbackKeywords": [
          "remote work",
          "widespread",
          "pandemic"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w5t9_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"work–life balance\"):\n\n\"Nhiều người thích làm việc tại nhà vì họ có thể cân bằng giữa công việc và cuộc sống tốt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people prefer working from home because it enables a better work–life balance.",
        "explanationVi": "'Prefer + V-ing' = thích làm gì hơn (khi không so sánh trực tiếp). 'Enable' = cho phép, tạo điều kiện cho — academic hơn 'allow' hay 'let'.",
        "modelAnswer": "Many people prefer working from home because it enables a better work–life balance.",
        "fallbackKeywords": [
          "work-life balance",
          "working from home",
          "better",
          "enables"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w5t9_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital communication tools\"):\n\n\"Các công cụ giao tiếp kỹ thuật số giúp kết nối nhân viên dù họ ở xa nhau.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Digital communication tools help connect employees regardless of their physical location.",
        "explanationVi": "'Regardless of' = bất kể, không phụ thuộc vào — formal phrase thay cho 'no matter'. 'Physical location' = vị trí địa lý thực tế.",
        "modelAnswer": "Digital communication tools help connect employees regardless of their physical location.",
        "fallbackKeywords": [
          "digital communication tools",
          "connect",
          "employees",
          "location"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w5t9_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social isolation\"):\n\n\"Một số người cảm thấy cô lập và ít tương tác xã hội khi làm việc ở nhà.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people feel a sense of social isolation and have fewer social interactions when working from home.",
        "explanationVi": "'A sense of social isolation' = cảm giác cô lập xã hội — 'a sense of' nhấn mạnh cảm nhận chủ quan. 'Fewer social interactions' = so sánh hơn với danh từ đếm được.",
        "modelAnswer": "Some people feel a sense of social isolation and have fewer social interactions when working from home.",
        "fallbackKeywords": [
          "social isolation",
          "working from home",
          "interactions",
          "fewer"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w5t9_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"hybrid model\"):\n\n\"Nhiều công ty chuyển sang mô hình làm việc kết hợp giữa ở nhà và tại văn phòng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many companies are shifting to a hybrid model that combines working from home and in the office.",
        "explanationVi": "'Shift to' = chuyển sang (phrasal verb học thuật). 'A hybrid model that combines A and B' = mô hình kết hợp — mệnh đề quan hệ bổ nghĩa.",
        "modelAnswer": "Many companies are shifting to a hybrid model that combines working from home and in the office.",
        "fallbackKeywords": [
          "hybrid model",
          "home",
          "office",
          "combining",
          "shifting"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w5t9_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technological advancement\"):\n\n\"Công nghệ hiện đại cho phép các nhóm làm việc hiệu quả dù ở xa nhau.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Modern technological advancement allows teams to work efficiently even at a distance.",
        "explanationVi": "'At a distance' = từ xa, ở khoảng cách xa. 'Even at a distance' = ngay cả khi ở xa — 'even' nhấn mạnh tính bất thường hoặc ngạc nhiên.",
        "modelAnswer": "Modern technological advancement allows teams to work efficiently even at a distance.",
        "fallbackKeywords": [
          "technological advancement",
          "teams",
          "efficiently",
          "distance"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w5t9_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"internet connectivity\"):\n\n\"Kết nối Internet yếu có thể ảnh hưởng đến hiệu suất làm việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Poor internet connectivity can negatively affect work performance and productivity.",
        "explanationVi": "'Poor internet connectivity' = kết nối internet kém. 'Negatively affect' = ảnh hưởng tiêu cực. 'Work performance and productivity' = hai danh từ bổ nghĩa lẫn nhau.",
        "modelAnswer": "Poor internet connectivity can negatively affect work performance and productivity.",
        "fallbackKeywords": [
          "internet connectivity",
          "poor",
          "work performance",
          "productivity"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w5t9_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"time management\"):\n\n\"Một số người gặp khó khăn trong việc quản lý thời gian khi làm việc tại nhà.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people struggle with time management when working from home.",
        "explanationVi": "'Struggle with + N/V-ing' = gặp khó khăn với. 'When working from home' = rút gọn từ 'when they are working from home'.",
        "modelAnswer": "Some people struggle with time management when working from home.",
        "fallbackKeywords": [
          "time management",
          "struggle",
          "working from home"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w5t9_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"communication barrier\"):\n\n\"Thiếu giao tiếp trực tiếp có thể gây ra rào cản trong hợp tác nhóm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A lack of direct interaction can create a communication barrier in team collaboration.",
        "explanationVi": "'Communication barrier' = rào cản giao tiếp. 'Create a barrier' = tạo ra rào cản — 'create' học thuật hơn 'cause'. 'Team collaboration' = hợp tác nhóm.",
        "modelAnswer": "A lack of direct interaction can create a communication barrier in team collaboration.",
        "fallbackKeywords": [
          "communication barrier",
          "direct interaction",
          "team collaboration"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w5t9_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"corporate culture\"):\n\n\"Làm việc tại nhà có thể ảnh hưởng đến văn hóa doanh nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working from home can have a significant impact on corporate culture.",
        "explanationVi": "'Corporate culture' = văn hóa doanh nghiệp/công ty. 'Have a significant impact on' = có tác động đáng kể lên — 'have an impact' là collocation cố định.",
        "modelAnswer": "Working from home can have a significant impact on corporate culture.",
        "fallbackKeywords": [
          "corporate culture",
          "working from home",
          "significant impact"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w5t9_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"flexibility\"):\n\n\"Làm việc từ xa mang lại sự linh hoạt về thời gian và địa điểm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Remote work offers greater flexibility in terms of time and location.",
        "explanationVi": "'Offer flexibility' = mang lại/cung cấp sự linh hoạt — 'offer' học thuật hơn 'give'. 'In terms of' = về mặt, xét về — cụm giới từ quan trọng.",
        "modelAnswer": "Remote work offers greater flexibility in terms of time and location.",
        "fallbackKeywords": [
          "flexibility",
          "remote work",
          "time",
          "location"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w5t9_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"self-discipline\"):\n\n\"Làm việc tại nhà đòi hỏi tính tự giác cao để duy trì năng suất.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working from home requires a high level of self-discipline to maintain productivity.",
        "explanationVi": "'Require a high level of + N' = đòi hỏi mức độ cao của — cấu trúc học thuật. 'Self-discipline' = tính tự giác. 'Maintain productivity' = duy trì năng suất.",
        "modelAnswer": "Working from home requires a high level of self-discipline to maintain productivity.",
        "fallbackKeywords": [
          "self-discipline",
          "working from home",
          "productivity",
          "maintain"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w5t9_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"burnout\"):\n\n\"Làm việc trực tuyến quá nhiều có thể dẫn đến kiệt sức và căng thẳng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excessive online work can lead to both burnout and stress.",
        "explanationVi": "'Excessive' = quá mức (formal hơn 'too much'). 'Lead to both A and B' = dẫn đến cả A lẫn B. 'Burnout' = kiệt sức do làm việc quá độ.",
        "modelAnswer": "Excessive online work can lead to both burnout and stress.",
        "fallbackKeywords": [
          "burnout",
          "excessive",
          "online work",
          "stress"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w5t9_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"virtual meeting\"):\n\n\"Các cuộc họp trực tuyến giúp tiết kiệm thời gian nhưng đôi khi thiếu sự kết nối thật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Virtual meetings help save time but sometimes lack the genuine connection of face-to-face interactions.",
        "explanationVi": "'Virtual meetings' = cuộc họp trực tuyến. 'Lack + N' = thiếu (verb, không cần 'lack of'). 'Genuine connection' = sự kết nối thật sự — 'genuine' mạnh hơn 'real'.",
        "modelAnswer": "Virtual meetings help save time but sometimes lack the genuine connection of face-to-face interactions.",
        "fallbackKeywords": [
          "virtual meetings",
          "save time",
          "genuine connection",
          "face-to-face"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w5t9_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cost-effective\"):\n\n\"Làm việc tại nhà giúp giảm chi phí đi lại và ăn uống hàng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working from home is cost-effective as it reduces daily commuting and food expenses.",
        "explanationVi": "'Cost-effective' = tiết kiệm chi phí, hiệu quả về chi phí. 'As' = vì, bởi vì (liên từ nguyên nhân). 'Commuting expenses' = chi phí đi lại.",
        "modelAnswer": "Working from home is cost-effective as it reduces daily commuting and food expenses.",
        "fallbackKeywords": [
          "cost-effective",
          "working from home",
          "commuting",
          "expenses"
        ],
        "orderIndex": 22,
        "isActive": true
      },
      {
        "questionId": "w5t9_q23",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"home distractions\"):\n\n\"Nhân viên có thể bị xao nhãng bởi việc nhà hoặc trẻ nhỏ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Employees may be distracted by household chores or young children — common home distractions.",
        "explanationVi": "'Be distracted by' = bị phân tâm bởi (passive). 'Home distractions' = các yếu tố gây xao nhãng tại nhà. 'Household chores' = việc nhà.",
        "modelAnswer": "Employees may be distracted by household chores or young children — common home distractions.",
        "fallbackKeywords": [
          "home distractions",
          "household chores",
          "children",
          "distracted"
        ],
        "orderIndex": 23,
        "isActive": true
      },
      {
        "questionId": "w5t9_q24",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"flexible schedule\"):\n\n\"Nhiều người cảm thấy hài lòng hơn khi có lịch làm việc linh hoạt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people feel more satisfied when they have a flexible schedule.",
        "explanationVi": "'Flexible schedule' = lịch làm việc linh hoạt. 'Feel more satisfied' = cảm thấy hài lòng hơn — so sánh hơn với tính từ nhiều âm tiết dùng 'more'.",
        "modelAnswer": "Many people feel more satisfied when they have a flexible schedule.",
        "fallbackKeywords": [
          "flexible schedule",
          "more satisfied",
          "people"
        ],
        "orderIndex": 24,
        "isActive": true
      },
      {
        "questionId": "w5t9_q25",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental health\"):\n\n\"Làm việc từ xa giúp nhiều người có sức khỏe tinh thần tốt hơn vì ít căng thẳng hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Remote work helps many people achieve better mental health by reducing daily stress.",
        "explanationVi": "'Mental health' = sức khỏe tinh thần. 'Help + O + V (bare infinitive)' = giúp ai làm gì. 'By reducing' = bằng cách giảm — 'by + V-ing' diễn đạt phương tiện.",
        "modelAnswer": "Remote work helps many people achieve better mental health by reducing daily stress.",
        "fallbackKeywords": [
          "mental health",
          "remote work",
          "stress",
          "reducing"
        ],
        "orderIndex": 25,
        "isActive": true
      }
    ]
  },
  {
    "week": 10,
    "block": "agree_disagree",
    "topicName": "Job Satisfaction vs. Salary",
    "topicEmoji": "📈",
    "essayType": "agree_disagree",
    "prompt": "Job satisfaction is more important than a high salary. Do you agree or disagree?",
    "hintAdvantages": [
      "long-term happiness",
      "reduces stress",
      "better performance"
    ],
    "hintDisadvantages": [
      "financial security needed",
      "salary covers basic needs"
    ],
    "orderIndex": 10,
    "vocabularyList": [
      {
        "term": "job satisfaction",
        "definitionVi": "sự hài lòng trong công việc",
        "example": "Job satisfaction leads to higher employee retention and performance."
      },
      {
        "term": "high salary",
        "definitionVi": "mức lương cao",
        "example": "Many workers prioritise a high salary over other aspects of employment."
      },
      {
        "term": "career advancement",
        "definitionVi": "thăng tiến trong sự nghiệp",
        "example": "Opportunities for career advancement are a key factor in job satisfaction."
      },
      {
        "term": "work environment",
        "definitionVi": "môi trường làm việc",
        "example": "A positive work environment boosts both productivity and job satisfaction."
      },
      {
        "term": "work-life balance",
        "definitionVi": "cân bằng giữa công việc và cuộc sống",
        "example": "Work-life balance is as important as salary for many modern employees."
      },
      {
        "term": "job stability",
        "definitionVi": "sự ổn định trong công việc",
        "example": "Job stability gives employees the confidence to plan for their future."
      },
      {
        "term": "financial security",
        "definitionVi": "sự an toàn tài chính",
        "example": "A good salary provides financial security for the entire family."
      },
      {
        "term": "passion for work",
        "definitionVi": "đam mê công việc",
        "example": "People who have a genuine passion for work tend to be more productive and creative."
      },
      {
        "term": "job motivation",
        "definitionVi": "động lực làm việc",
        "example": "A supportive manager can significantly boost employees' job motivation."
      },
      {
        "term": "stress level",
        "definitionVi": "mức độ căng thẳng",
        "example": "High-paying jobs often come with elevated stress levels and long working hours."
      },
      {
        "term": "employee benefits",
        "definitionVi": "phúc lợi cho nhân viên",
        "example": "Generous employee benefits such as health insurance can compensate for a lower salary."
      },
      {
        "term": "mental well-being",
        "definitionVi": "sức khỏe tinh thần",
        "example": "Working in a role you love significantly improves your mental well-being."
      },
      {
        "term": "sense of fulfillment",
        "definitionVi": "cảm giác mãn nguyện",
        "example": "A sense of fulfillment motivates people to perform at their best every day."
      },
      {
        "term": "working conditions",
        "definitionVi": "điều kiện làm việc",
        "example": "Good working conditions are essential for maintaining employee health and performance."
      },
      {
        "term": "career path",
        "definitionVi": "con đường sự nghiệp",
        "example": "Employees are more satisfied when they have a clear career path to follow."
      },
      {
        "term": "personal growth",
        "definitionVi": "phát triển cá nhân",
        "example": "Many workers value personal growth opportunities as much as financial compensation."
      },
      {
        "term": "professional development",
        "definitionVi": "phát triển nghề nghiệp",
        "example": "Professional development opportunities help employees feel valued and motivated."
      },
      {
        "term": "financial reward",
        "definitionVi": "phần thưởng tài chính",
        "example": "Some people are driven primarily by financial rewards such as bonuses and salary raises."
      },
      {
        "term": "job burnout",
        "definitionVi": "kiệt sức vì công việc",
        "example": "Employees who lack job satisfaction are more susceptible to job burnout."
      },
      {
        "term": "job security",
        "definitionVi": "sự đảm bảo công việc",
        "example": "Job security is a major concern for workers in industries affected by automation."
      },
      {
        "term": "workplace culture",
        "definitionVi": "văn hóa nơi làm việc",
        "example": "A positive workplace culture attracts talented employees and reduces turnover."
      },
      {
        "term": "intrinsic motivation",
        "definitionVi": "động lực nội tại",
        "example": "Intrinsic motivation drives employees to perform at their best without external rewards."
      },
      {
        "term": "extrinsic motivation",
        "definitionVi": "động lực bên ngoài",
        "example": "Bonuses and promotions are forms of extrinsic motivation that drive short-term performance."
      },
      {
        "term": "corporate environment",
        "definitionVi": "môi trường doanh nghiệp",
        "example": "A supportive corporate environment encourages innovation and employee loyalty."
      },
      {
        "term": "employee retention",
        "definitionVi": "giữ chân nhân viên",
        "example": "High job satisfaction significantly improves employee retention rates."
      },
      {
        "term": "sense of purpose",
        "definitionVi": "cảm giác có mục đích",
        "example": "Having a sense of purpose in one's work makes daily tasks feel more meaningful."
      },
      {
        "term": "recognition",
        "definitionVi": "sự công nhận",
        "example": "Regular recognition of employees' efforts boosts morale and loyalty."
      },
      {
        "term": "working hours",
        "definitionVi": "giờ làm việc",
        "example": "Long working hours can lead to burnout and a decline in job satisfaction."
      },
      {
        "term": "long-term happiness",
        "definitionVi": "hạnh phúc lâu dài",
        "example": "Research shows that job satisfaction is more strongly linked to long-term happiness than salary."
      },
      {
        "term": "materialistic values",
        "definitionVi": "giá trị vật chất",
        "example": "Pursuing materialistic values at the expense of personal fulfillment can lead to dissatisfaction."
      },
      {
        "term": "outweigh financial gain",
        "definitionVi": "vượt trội hơn lợi ích tài chính",
        "example": "For some, personal fulfilment outweighs financial gain in a career."
      },
      {
        "term": "climb the corporate ladder",
        "definitionVi": "thăng tiến trong sự nghiệp",
        "example": "Some employees sacrifice satisfaction to climb the corporate ladder."
      },
      {
        "term": "find meaning in one's work",
        "definitionVi": "tìm thấy ý nghĩa trong công việc",
        "example": "People who find meaning in their work tend to be more engaged."
      },
      {
        "term": "chase a higher salary",
        "definitionVi": "theo đuổi mức lương cao hơn",
        "example": "Some young professionals chase a higher salary at the cost of happiness."
      },
      {
        "term": "foster a positive work culture",
        "definitionVi": "xây dựng văn hóa làm việc tích cực",
        "example": "Employers should foster a positive work culture to retain staff."
      },
      {
        "term": "compensate for low pay",
        "definitionVi": "bù đắp cho mức lương thấp",
        "example": "A supportive workplace can partly compensate for relatively low pay."
      },
      {
        "term": "burn out quickly",
        "definitionVi": "nhanh chóng kiệt sức",
        "example": "Employees in unfulfilling but high-paying jobs can burn out quickly."
      },
      {
        "term": "value personal fulfilment over",
        "definitionVi": "coi trọng sự viên mãn cá nhân hơn",
        "example": "More workers now value personal fulfilment over a high salary."
      },
      {
        "term": "retain talented employees",
        "definitionVi": "giữ chân nhân viên tài năng",
        "example": "Meaningful work helps companies retain talented employees long-term."
      },
      {
        "term": "settle for a lower wage",
        "definitionVi": "chấp nhận mức lương thấp hơn",
        "example": "Some professionals settle for a lower wage in exchange for job satisfaction."
      }
    ],
    "questions": [
      {
        "questionId": "w6t10_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Mức lương cao giúp mang lại sự an toàn tài chính cho người lao động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A high salary helps provide financial security for workers.",
        "explanationVi": "'Help + V (bare)' = giúp làm gì. 'Provide financial security' = mang lại sự an toàn tài chính. Đây là lập luận phản đối (disagree) — lương cao đáp ứng nhu cầu cơ bản.",
        "modelAnswer": "A high salary helps provide financial security for workers.",
        "fallbackKeywords": [
          "high salary",
          "financial security",
          "workers"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w6t10_q02",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Cảm giác mãn nguyện trong công việc tạo động lực cho con người mỗi ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sense of fulfillment in work motivates people every single day.",
        "explanationVi": "'A sense of fulfillment' = cảm giác mãn nguyện (noun phrase). 'Every single day' = mỗi ngày (nhấn mạnh hơn 'every day'). Đây là lập luận ủng hộ job satisfaction.",
        "modelAnswer": "A sense of fulfillment in work motivates people every single day.",
        "fallbackKeywords": [
          "sense of fulfillment",
          "motivates",
          "people",
          "work"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w6t10_q03",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những người yêu thích công việc của mình thường đạt hiệu suất cao hơn nhờ động lực nội tại mạnh mẽ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "People who love their jobs often achieve higher performance due to strong intrinsic motivation.",
        "explanationVi": "'Due to + N' = do, vì (chỉ nguyên nhân — formal). 'Achieve higher performance' = đạt hiệu suất cao hơn. Relative clause 'who love their jobs' xác định nhóm người cụ thể.",
        "modelAnswer": "People who love their jobs often achieve higher performance due to strong intrinsic motivation.",
        "fallbackKeywords": [
          "intrinsic motivation",
          "performance",
          "love",
          "jobs"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w6t10_q04",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều người cảm thấy kiệt sức khi làm công việc họ không thích, dù lương có cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people experience job burnout when doing work they dislike, even if the salary is high.",
        "explanationVi": "'Experience job burnout' = trải qua kiệt sức vì công việc. 'Even if' = dù cho, ngay cả khi. 'Work they dislike' = relative clause không cần 'which/that' (object relative clause).",
        "modelAnswer": "Many people experience job burnout when doing work they dislike, even if the salary is high.",
        "fallbackKeywords": [
          "job burnout",
          "dislike",
          "salary",
          "high"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w6t10_q05",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"I disagree that job satisfaction is more important than salary, because without money, peoples cannot survive.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I disagree that job satisfaction is more important than salary, because without money, people cannot survive.",
        "explanationVi": "Lỗi: 'peoples' không tồn tại. 'People' đã là số nhiều (uncountable collective noun). Không thêm 's' vào 'people'.",
        "modelAnswer": "I disagree that job satisfaction is more important than salary, because without money, people cannot survive.",
        "fallbackKeywords": [
          "job satisfaction",
          "salary",
          "people",
          "survive"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w6t10_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Dù đồng ý hay không, việc theo đuổi sự hài lòng trong công việc cuối cùng dẫn đến hạnh phúc lâu dài hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Regardless of one's view, pursuing job satisfaction ultimately leads to greater long-term happiness.",
        "explanationVi": "'Regardless of one's view' = bất kể quan điểm của ai (formal phrase). 'Pursuing + N' (gerund làm chủ ngữ). 'Ultimately' = cuối cùng, rốt cuộc — adverb học thuật quan trọng.",
        "modelAnswer": "Regardless of one's view, pursuing job satisfaction ultimately leads to greater long-term happiness.",
        "fallbackKeywords": [
          "job satisfaction",
          "long-term happiness",
          "pursuing",
          "ultimately"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w6t10_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job satisfaction\"):\n\n\"Nhiều người tin rằng sự hài lòng trong công việc quan trọng hơn mức lương cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people believe that job satisfaction is more important than a high salary.",
        "explanationVi": "'Job satisfaction' = sự hài lòng trong công việc. So sánh hơn 'more important than' — không nhầm với 'more important as'. 'Believe that' = tin rằng (formal).",
        "modelAnswer": "Many people believe that job satisfaction is more important than a high salary.",
        "fallbackKeywords": [
          "job satisfaction",
          "important",
          "high salary"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w6t10_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"financial security\"):\n\n\"Mức lương cao giúp mang lại sự an toàn tài chính cho người lao động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A high salary helps provide financial security for workers.",
        "explanationVi": "'Financial security' = sự an toàn/bảo đảm tài chính. 'Provide + N + for + N' = cung cấp cái gì cho ai. 'Help + V (bare infinitive)' = giúp làm gì.",
        "modelAnswer": "A high salary helps provide financial security for workers.",
        "fallbackKeywords": [
          "financial security",
          "high salary",
          "workers",
          "provide"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w6t10_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"working environment\"):\n\n\"Một môi trường làm việc tích cực giúp nhân viên cảm thấy hạnh phúc hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A positive working environment makes employees feel happier and more motivated.",
        "explanationVi": "'Make + O + feel + adj' = khiến ai cảm thấy thế nào. 'Happier and more motivated' = hai so sánh hơn song song cho hai loại tính từ khác nhau.",
        "modelAnswer": "A positive working environment makes employees feel happier and more motivated.",
        "fallbackKeywords": [
          "working environment",
          "positive",
          "employees",
          "happier",
          "motivated"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w6t10_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"meaningful work\"):\n\n\"Nhiều người sẵn sàng nhận lương thấp hơn nếu họ yêu thích công việc của mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people are willing to accept a lower salary if they find their work meaningful.",
        "explanationVi": "'Be willing to + V' = sẵn sàng làm gì. 'Find + O + adj' = thấy cái gì như thế nào. 'Meaningful' = có ý nghĩa — 'find their work meaningful' tự nhiên hơn 'find their work is meaningful'.",
        "modelAnswer": "Many people are willing to accept a lower salary if they find their work meaningful.",
        "fallbackKeywords": [
          "meaningful work",
          "lower salary",
          "willing",
          "find"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w6t10_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"work fulfillment\"):\n\n\"Cảm giác mãn nguyện khi làm việc khiến con người có động lực hơn mỗi ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sense of work fulfillment motivates people to perform better every day.",
        "explanationVi": "'A sense of work fulfillment' = cảm giác mãn nguyện trong công việc. 'Motivate + O + to V' = thúc đẩy ai làm gì. 'Perform better' = làm việc tốt hơn.",
        "modelAnswer": "A sense of work fulfillment motivates people to perform better every day.",
        "fallbackKeywords": [
          "work fulfillment",
          "motivates",
          "perform better",
          "every day"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w6t10_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career development\"):\n\n\"Sự phát triển nghề nghiệp giúp nhân viên cảm thấy họ đang tiến bộ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Career development gives employees a sense that they are making progress.",
        "explanationVi": "'Career development' = sự phát triển nghề nghiệp. 'A sense that + clause' = cảm giác rằng. 'Make progress' = tiến bộ — 'make' là collocating verb cố định.",
        "modelAnswer": "Career development gives employees a sense that they are making progress.",
        "fallbackKeywords": [
          "career development",
          "employees",
          "progress",
          "sense"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w6t10_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental well-being\"):\n\n\"Làm việc quá nhiều giờ có thể ảnh hưởng tiêu cực đến sức khỏe tinh thần.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working excessively long hours can negatively affect one's mental well-being.",
        "explanationVi": "'Excessively long hours' = số giờ quá mức. \"One's mental well-being\" dùng đại từ sở hữu trung lập. 'Negatively affect' = ảnh hưởng tiêu cực.",
        "modelAnswer": "Working excessively long hours can negatively affect one's mental well-being.",
        "fallbackKeywords": [
          "mental well-being",
          "excessively",
          "negatively affect"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w6t10_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"employee retention\"):\n\n\"Nơi làm việc thân thiện giúp tăng khả năng giữ chân nhân viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A friendly workplace helps improve employee retention.",
        "explanationVi": "'Employee retention' = việc giữ chân nhân viên (không phải 'keeping employees'). 'A friendly workplace' = môi trường làm việc thân thiện. 'Helps improve' = giúp cải thiện.",
        "modelAnswer": "A friendly workplace helps improve employee retention.",
        "fallbackKeywords": [
          "employee retention",
          "friendly workplace",
          "improve"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w6t10_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"corporate culture\"):\n\n\"Văn hóa doanh nghiệp ảnh hưởng lớn đến mức độ hài lòng của nhân viên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Corporate culture has a significant impact on employee satisfaction levels.",
        "explanationVi": "'Have a significant impact on' = có tác động đáng kể lên — collocation cố định quan trọng. 'Satisfaction levels' = mức độ hài lòng.",
        "modelAnswer": "Corporate culture has a significant impact on employee satisfaction levels.",
        "fallbackKeywords": [
          "corporate culture",
          "employee satisfaction",
          "significant impact"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w6t10_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sense of purpose\"):\n\n\"Cảm giác có mục đích trong công việc khiến cuộc sống trở nên ý nghĩa hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Having a sense of purpose in one's work makes life feel more meaningful.",
        "explanationVi": "'A sense of purpose' = cảm giác có mục đích. 'Make + O + feel + adj' = khiến thứ gì đó cảm thấy như thế nào. 'More meaningful' = ý nghĩa hơn.",
        "modelAnswer": "Having a sense of purpose in one's work makes life feel more meaningful.",
        "fallbackKeywords": [
          "sense of purpose",
          "work",
          "meaningful",
          "makes life"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w6t10_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"stress level\"):\n\n\"Một số người chọn công việc có mức lương cao dù phải chịu nhiều căng thẳng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people choose high-paying jobs despite having to endure high stress levels.",
        "explanationVi": "'Despite + V-ing' = mặc dù (không dùng 'although' ở đây vì theo sau là cụm động từ). 'Endure' = chịu đựng (formal). 'High stress levels' = mức độ căng thẳng cao.",
        "modelAnswer": "Some people choose high-paying jobs despite having to endure high stress levels.",
        "fallbackKeywords": [
          "stress levels",
          "high-paying",
          "despite",
          "endure"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w6t10_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"extrinsic motivation\"):\n\n\"Một số người coi tiền là nguồn động lực bên ngoài chính trong công việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people regard money as their primary source of extrinsic motivation at work.",
        "explanationVi": "'Regard A as B' = coi A là B. 'Extrinsic motivation' = động lực bên ngoài (tiền, phần thưởng). 'Primary source of' = nguồn chính của.",
        "modelAnswer": "Some people regard money as their primary source of extrinsic motivation at work.",
        "fallbackKeywords": [
          "extrinsic motivation",
          "money",
          "primary",
          "work"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w6t10_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"work-life balance\"):\n\n\"Cân bằng giữa công việc và cuộc sống giúp nhân viên cảm thấy hạnh phúc hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Work-life balance helps employees feel happier and more fulfilled.",
        "explanationVi": "'Help + O + V' = giúp ai làm gì (bare infinitive sau 'help'). 'More fulfilled' = mãn nguyện hơn — 'fulfilled' là tính từ học thuật quan trọng.",
        "modelAnswer": "Work-life balance helps employees feel happier and more fulfilled.",
        "fallbackKeywords": [
          "work-life balance",
          "employees",
          "happier",
          "fulfilled"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w6t10_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"financial reward\"):\n\n\"Một số người đánh đổi niềm vui để đạt được thành công tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people sacrifice personal happiness in pursuit of financial rewards.",
        "explanationVi": "'Sacrifice A in pursuit of B' = đánh đổi A để theo đuổi B. 'In pursuit of' = trong sự theo đuổi — cụm giới từ học thuật. 'Financial rewards' = phần thưởng/thành công tài chính.",
        "modelAnswer": "Some people sacrifice personal happiness in pursuit of financial rewards.",
        "fallbackKeywords": [
          "financial reward",
          "sacrifice",
          "personal happiness",
          "pursuit"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w6t10_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"recognition\"):\n\n\"Khi nhân viên được công nhận, họ cảm thấy có động lực làm việc hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When employees receive recognition for their efforts, they feel more motivated to work.",
        "explanationVi": "'Receive recognition for + N' = được công nhận vì điều gì. 'Feel more motivated to V' = cảm thấy có động lực hơn để làm gì — so sánh hơn với 'more'.",
        "modelAnswer": "When employees receive recognition for their efforts, they feel more motivated to work.",
        "fallbackKeywords": [
          "recognition",
          "employees",
          "motivated",
          "efforts"
        ],
        "orderIndex": 22,
        "isActive": true
      },
      {
        "questionId": "w6t10_q23",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"working conditions\"):\n\n\"Làm việc trong điều kiện tốt giúp nâng cao hiệu suất công việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Working in good conditions helps enhance overall job performance.",
        "explanationVi": "'Working conditions' = điều kiện làm việc. 'Enhance' = nâng cao (formal hơn 'improve'). 'Job performance' = hiệu suất công việc.",
        "modelAnswer": "Working in good conditions helps enhance overall job performance.",
        "fallbackKeywords": [
          "working conditions",
          "enhance",
          "job performance"
        ],
        "orderIndex": 23,
        "isActive": true
      },
      {
        "questionId": "w6t10_q24",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job stability\"):\n\n\"Một công việc ổn định mang lại sự yên tâm lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Job stability provides employees with long-term peace of mind.",
        "explanationVi": "'Job stability' = sự ổn định trong công việc. 'Provide + O + with + N' = cung cấp/mang lại cho ai điều gì. 'Peace of mind' = sự yên tâm.",
        "modelAnswer": "Job stability provides employees with long-term peace of mind.",
        "fallbackKeywords": [
          "job stability",
          "long-term",
          "peace of mind"
        ],
        "orderIndex": 24,
        "isActive": true
      },
      {
        "questionId": "w6t10_q25",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"materialistic values\"):\n\n\"Việc theo đuổi giá trị vật chất quá mức có thể dẫn đến sự căng thẳng và không hài lòng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The excessive pursuit of materialistic values can lead to stress and dissatisfaction.",
        "explanationVi": "'The excessive pursuit of' = việc theo đuổi quá mức — danh từ hóa động từ. 'Materialistic values' = giá trị vật chất. 'Dissatisfaction' = sự không hài lòng (danh từ).",
        "modelAnswer": "The excessive pursuit of materialistic values can lead to stress and dissatisfaction.",
        "fallbackKeywords": [
          "materialistic values",
          "excessive",
          "dissatisfaction",
          "pursuit"
        ],
        "orderIndex": 25,
        "isActive": true
      }
    ]
  },
  {
    "week": 10,
    "block": "agree_disagree",
    "topicName": "Unenjoyable Employment vs. Unemployment",
    "topicEmoji": "😔",
    "essayType": "agree_disagree",
    "prompt": "Some people believe that it is better for an individual to be unemployed than to stay in a job that they do not enjoy. To what extent do you agree or disagree?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 39,
    "vocabularyList": [
      {
        "term": "unemployment",
        "definitionVi": "tình trạng thất nghiệp",
        "example": "Some people believe unemployment is better than staying in a job they dislike."
      },
      {
        "term": "job satisfaction",
        "definitionVi": "sự hài lòng trong công việc",
        "example": "Job satisfaction has a major influence on a person's overall well-being."
      },
      {
        "term": "financial security",
        "definitionVi": "sự an toàn tài chính",
        "example": "A steady income provides financial security even in an unenjoyable job."
      },
      {
        "term": "career fulfilment",
        "definitionVi": "sự viên mãn trong sự nghiệp",
        "example": "Many people prioritise career fulfilment over a high salary."
      },
      {
        "term": "mental exhaustion",
        "definitionVi": "sự kiệt sức về tinh thần",
        "example": "Staying in an unenjoyable job can lead to mental exhaustion."
      },
      {
        "term": "sense of purpose",
        "definitionVi": "cảm giác có mục đích",
        "example": "A fulfilling job gives people a strong sense of purpose."
      },
      {
        "term": "financial obligations",
        "definitionVi": "nghĩa vụ tài chính",
        "example": "Financial obligations often force people to remain in jobs they dislike."
      },
      {
        "term": "job market",
        "definitionVi": "thị trường việc làm",
        "example": "A competitive job market makes it risky to quit an unenjoyable job."
      },
      {
        "term": "self-worth",
        "definitionVi": "giá trị bản thân",
        "example": "Prolonged unemployment can negatively affect a person's self-worth."
      },
      {
        "term": "career transition",
        "definitionVi": "chuyển đổi sự nghiệp",
        "example": "A career transition allows a person to find more meaningful work."
      },
      {
        "term": "workplace burnout",
        "definitionVi": "kiệt sức tại nơi làm việc",
        "example": "Workplace burnout is common among employees who dislike their jobs."
      },
      {
        "term": "risk-taking",
        "definitionVi": "sự chấp nhận rủi ro",
        "example": "Leaving a stable job requires a certain amount of risk-taking."
      },
      {
        "term": "job security",
        "definitionVi": "sự đảm bảo về việc làm",
        "example": "Many workers value job security over personal happiness at work."
      },
      {
        "term": "quality of life",
        "definitionVi": "chất lượng cuộc sống",
        "example": "An unenjoyable job can seriously reduce a person's quality of life."
      },
      {
        "term": "professional growth",
        "definitionVi": "sự phát triển nghề nghiệp",
        "example": "Staying in the wrong job can limit a person's professional growth."
      },
      {
        "term": "income stability",
        "definitionVi": "sự ổn định thu nhập",
        "example": "Income stability is a major concern for people supporting a family."
      },
      {
        "term": "work-related stress",
        "definitionVi": "căng thẳng liên quan đến công việc",
        "example": "Work-related stress can affect both mental and physical health."
      },
      {
        "term": "passion-driven career",
        "definitionVi": "sự nghiệp theo đuổi đam mê",
        "example": "Some people believe a passion-driven career leads to greater long-term happiness."
      },
      {
        "term": "safety net",
        "definitionVi": "mạng lưới an sinh",
        "example": "Unemployment benefits act as a safety net for those between jobs."
      },
      {
        "term": "personal well-being",
        "definitionVi": "sức khỏe và hạnh phúc cá nhân",
        "example": "Personal well-being should be considered alongside financial factors."
      },
      {
        "term": "trade security for happiness",
        "definitionVi": "đánh đổi sự an toàn để lấy hạnh phúc",
        "example": "Some people trade job security for happiness by quitting an unfulfilling job."
      },
      {
        "term": "weigh the pros and cons",
        "definitionVi": "cân nhắc ưu và nhược điểm",
        "example": "Job seekers should weigh the pros and cons before resigning."
      },
      {
        "term": "make ends meet",
        "definitionVi": "xoay xở đủ sống",
        "example": "Without a job, many people struggle to make ends meet."
      },
      {
        "term": "hold out for a better opportunity",
        "definitionVi": "chờ đợi để có cơ hội tốt hơn",
        "example": "Some job seekers hold out for a better opportunity rather than settle."
      },
      {
        "term": "drain a person's motivation",
        "definitionVi": "làm cạn kiệt động lực của một người",
        "example": "A miserable job can gradually drain a person's motivation."
      },
      {
        "term": "provide financial stability",
        "definitionVi": "mang lại sự ổn định tài chính",
        "example": "Even an unenjoyable job can provide financial stability for a family."
      },
      {
        "term": "take a leap of faith",
        "definitionVi": "chấp nhận mạo hiểm, đánh cược",
        "example": "Quitting a stable job to pursue passion requires a leap of faith."
      },
      {
        "term": "leave a lasting impact on",
        "definitionVi": "để lại tác động lâu dài đến",
        "example": "Prolonged unemployment can leave a lasting impact on self-esteem."
      },
      {
        "term": "pursue a fulfilling career",
        "definitionVi": "theo đuổi một sự nghiệp viên mãn",
        "example": "Many people eventually choose to pursue a fulfilling career over pay."
      },
      {
        "term": "cushion the financial blow",
        "definitionVi": "giảm nhẹ cú sốc tài chính",
        "example": "Savings can help cushion the financial blow of unemployment."
      }
    ],
    "questions": [
      {
        "questionId": "w10ue_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"To what extent do you agree or disagree?\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Agree or Disagree",
          "Cause & Effect",
          "Effect & Solution"
        ],
        "baseWords": [],
        "correctAnswer": "Agree or Disagree",
        "explanationVi": "Cụm 'To what extent do you agree or disagree?' là dấu hiệu nhận biết trực tiếp của dạng Agree or Disagree — cần nêu rõ lập trường đồng ý hay không đồng ý xuyên suốt bài.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w10ue_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Some people believe that it is better for an individual to be unemployed than to stay in a job that they do not _____.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "enjoy",
        "explanationVi": "'Enjoy + N' = thích, tận hưởng. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w10ue_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người tin rằng thất nghiệp còn tốt hơn là ở lại một công việc mà họ không thích.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that unemployment is better than staying in a job they dislike.",
        "explanationVi": "'Better than' = tốt hơn. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Some people believe that unemployment is better than staying in a job they dislike.",
        "fallbackKeywords": [
          "unemployment",
          "better than",
          "dislike"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w10ue_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi hoàn toàn không đồng ý với quan điểm này vì lý do tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I completely disagree with this view for financial reasons.",
        "explanationVi": "'Completely disagree with' = hoàn toàn không đồng ý với. Đây là câu nêu quan điểm chuẩn cho dạng Agree/Disagree.",
        "modelAnswer": "I completely disagree with this view for financial reasons.",
        "fallbackKeywords": [
          "completely disagree",
          "financial reasons"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w10ue_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một mức lương ổn định mang lại sự an toàn tài chính ngay cả trong một công việc không thú vị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A steady income provides financial security even in an unenjoyable job.",
        "explanationVi": "'A steady income' = mức lương ổn định. 'Financial security' = sự an toàn tài chính.",
        "modelAnswer": "A steady income provides financial security even in an unenjoyable job.",
        "fallbackKeywords": [
          "steady income",
          "financial security",
          "unenjoyable job"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w10ue_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thất nghiệp kéo dài có thể ảnh hưởng tiêu cực đến giá trị bản thân của một người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Prolonged unemployment can negatively affect a person's self-worth.",
        "explanationVi": "'Self-worth' = giá trị bản thân. 'Negatively affect' = ảnh hưởng tiêu cực đến.",
        "modelAnswer": "Prolonged unemployment can negatively affect a person's self-worth.",
        "fallbackKeywords": [
          "prolonged unemployment",
          "self-worth",
          "negatively affect"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w10ue_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[often force / to remain / Financial obligations / people / in jobs they dislike]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Financial obligations often force people to remain in jobs they dislike.",
        "explanationVi": "'Force + O + to V' = buộc ai làm gì. 'Financial obligations' = nghĩa vụ tài chính.",
        "modelAnswer": "Financial obligations often force people to remain in jobs they dislike.",
        "fallbackKeywords": [
          "financial obligations",
          "force people",
          "remain"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w10ue_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Workers should to consider both job satisfaction and income stability.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Workers should consider both job satisfaction and income stability.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Workers should consider both job satisfaction and income stability.",
        "fallbackKeywords": [
          "workers",
          "job satisfaction",
          "income stability"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w10ue_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career fulfilment\"):\n\n\"Nhiều người coi trọng sự viên mãn trong sự nghiệp hơn là mức lương cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people prioritise career fulfilment over a high salary.",
        "explanationVi": "'Career fulfilment' = sự viên mãn trong sự nghiệp. 'Prioritise A over B' = coi trọng A hơn B.",
        "modelAnswer": "Many people prioritise career fulfilment over a high salary.",
        "fallbackKeywords": [
          "career fulfilment",
          "prioritise",
          "high salary"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w10ue_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental exhaustion\"):\n\n\"Việc ở lại một công việc không thú vị có thể dẫn đến sự kiệt sức về tinh thần.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Staying in an unenjoyable job can lead to mental exhaustion.",
        "explanationVi": "'Mental exhaustion' = sự kiệt sức về tinh thần. 'Lead to + N' = dẫn đến.",
        "modelAnswer": "Staying in an unenjoyable job can lead to mental exhaustion.",
        "fallbackKeywords": [
          "unenjoyable job",
          "mental exhaustion",
          "lead to"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w10ue_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sense of purpose\"):\n\n\"Một công việc viên mãn mang lại cho con người cảm giác có mục đích mạnh mẽ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A fulfilling job gives people a strong sense of purpose.",
        "explanationVi": "'Sense of purpose' = cảm giác có mục đích. 'A fulfilling job' = một công việc viên mãn.",
        "modelAnswer": "A fulfilling job gives people a strong sense of purpose.",
        "fallbackKeywords": [
          "fulfilling job",
          "sense of purpose"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w10ue_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job market\"):\n\n\"Một thị trường việc làm cạnh tranh khiến việc bỏ một công việc không thích trở nên rủi ro.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A competitive job market makes it risky to quit an unenjoyable job.",
        "explanationVi": "'Job market' = thị trường việc làm. 'Make it risky to V' = khiến việc làm gì trở nên rủi ro.",
        "modelAnswer": "A competitive job market makes it risky to quit an unenjoyable job.",
        "fallbackKeywords": [
          "job market",
          "risky",
          "quit"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w10ue_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career transition\"):\n\n\"Một sự chuyển đổi sự nghiệp cho phép một người tìm được công việc ý nghĩa hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A career transition allows a person to find more meaningful work.",
        "explanationVi": "'Career transition' = chuyển đổi sự nghiệp. 'Allow + O + to V' = cho phép ai làm gì.",
        "modelAnswer": "A career transition allows a person to find more meaningful work.",
        "fallbackKeywords": [
          "career transition",
          "meaningful work"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w10ue_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"workplace burnout\"):\n\n\"Kiệt sức tại nơi làm việc là điều phổ biến ở những nhân viên không thích công việc của họ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Workplace burnout is common among employees who dislike their jobs.",
        "explanationVi": "'Workplace burnout' = kiệt sức tại nơi làm việc. 'Common among + N' = phổ biến trong.",
        "modelAnswer": "Workplace burnout is common among employees who dislike their jobs.",
        "fallbackKeywords": [
          "workplace burnout",
          "common among",
          "dislike"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w10ue_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job security\"):\n\n\"Nhiều người lao động coi trọng sự đảm bảo về việc làm hơn là niềm hạnh phúc cá nhân trong công việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many workers value job security over personal happiness at work.",
        "explanationVi": "'Job security' = sự đảm bảo về việc làm. 'Value A over B' = coi trọng A hơn B.",
        "modelAnswer": "Many workers value job security over personal happiness at work.",
        "fallbackKeywords": [
          "job security",
          "value",
          "personal happiness"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w10ue_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"professional growth\"):\n\n\"Việc ở lại một công việc không phù hợp có thể hạn chế sự phát triển nghề nghiệp của một người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Staying in the wrong job can limit a person's professional growth.",
        "explanationVi": "'Professional growth' = sự phát triển nghề nghiệp. 'Limit + N' = hạn chế.",
        "modelAnswer": "Staying in the wrong job can limit a person's professional growth.",
        "fallbackKeywords": [
          "staying in the wrong job",
          "professional growth"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w10ue_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"income stability\"):\n\n\"Sự ổn định thu nhập là mối quan tâm lớn đối với những người đang nuôi gia đình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Income stability is a major concern for people supporting a family.",
        "explanationVi": "'Income stability' = sự ổn định thu nhập. 'A major concern for' = mối quan tâm lớn đối với.",
        "modelAnswer": "Income stability is a major concern for people supporting a family.",
        "fallbackKeywords": [
          "income stability",
          "major concern",
          "supporting a family"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w10ue_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"passion-driven career\"):\n\n\"Một số người tin rằng sự nghiệp theo đuổi đam mê mang lại hạnh phúc lâu dài hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe a passion-driven career leads to greater long-term happiness.",
        "explanationVi": "'Passion-driven career' = sự nghiệp theo đuổi đam mê. 'Lead to + N' = dẫn đến.",
        "modelAnswer": "Some people believe a passion-driven career leads to greater long-term happiness.",
        "fallbackKeywords": [
          "passion-driven career",
          "long-term happiness"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w10ue_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"safety net\"):\n\n\"Trợ cấp thất nghiệp đóng vai trò như một mạng lưới an sinh cho những người đang tìm việc mới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unemployment benefits act as a safety net for those between jobs.",
        "explanationVi": "'Safety net' = mạng lưới an sinh. 'Act as + N' = đóng vai trò như.",
        "modelAnswer": "Unemployment benefits act as a safety net for those between jobs.",
        "fallbackKeywords": [
          "unemployment benefits",
          "safety net",
          "between jobs"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w10ue_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"personal well-being\"):\n\n\"Sức khỏe và hạnh phúc cá nhân nên được xem xét cùng với các yếu tố tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Personal well-being should be considered alongside financial factors.",
        "explanationVi": "'Personal well-being' = sức khỏe và hạnh phúc cá nhân. 'Alongside + N' = cùng với.",
        "modelAnswer": "Personal well-being should be considered alongside financial factors.",
        "fallbackKeywords": [
          "personal well-being",
          "alongside",
          "financial factors"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 11,
    "block": "discuss_both_views",
    "topicName": "Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes",
    "topicEmoji": "🏛️",
    "essayType": "discuss_both_views",
    "prompt": "Some people argue that subsidising fruits and vegetables is a good way for governments to make healthy food cheaper, while others believe that taxing junk food would be a more effective approach. Discuss both views and give your own opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 40,
    "vocabularyList": [
      {
        "term": "food subsidy",
        "definitionVi": "trợ cấp thực phẩm",
        "example": "Governments could offer a food subsidy for fresh fruits and vegetables."
      },
      {
        "term": "sugar tax",
        "definitionVi": "thuế đường",
        "example": "A sugar tax discourages people from buying high-sugar products."
      },
      {
        "term": "public health promotion",
        "definitionVi": "thúc đẩy sức khỏe cộng đồng",
        "example": "Public health promotion campaigns aim to reduce diet-related illnesses."
      },
      {
        "term": "affordability of healthy food",
        "definitionVi": "khả năng chi trả cho thực phẩm lành mạnh",
        "example": "Subsidies can improve the affordability of healthy food for low-income families."
      },
      {
        "term": "unhealthy food consumption",
        "definitionVi": "việc tiêu thụ thực phẩm không lành mạnh",
        "example": "Taxes on sugary drinks aim to reduce unhealthy food consumption."
      },
      {
        "term": "government intervention",
        "definitionVi": "sự can thiệp của chính phủ",
        "example": "Some people argue government intervention is necessary to fight obesity."
      },
      {
        "term": "consumer choice",
        "definitionVi": "quyền lựa chọn của người tiêu dùng",
        "example": "Critics argue that food taxes limit consumer choice."
      },
      {
        "term": "public funds",
        "definitionVi": "ngân sách công",
        "example": "Subsidy programmes require significant public funds to operate."
      },
      {
        "term": "diet-related illness",
        "definitionVi": "bệnh liên quan đến chế độ ăn",
        "example": "Diet-related illnesses place a heavy burden on healthcare systems."
      },
      {
        "term": "behavioural change",
        "definitionVi": "sự thay đổi hành vi",
        "example": "Taxes can encourage behavioural change by making unhealthy food more expensive."
      },
      {
        "term": "low-income households",
        "definitionVi": "hộ gia đình thu nhập thấp",
        "example": "Food subsidies particularly benefit low-income households."
      },
      {
        "term": "price incentive",
        "definitionVi": "ưu đãi về giá",
        "example": "A price incentive can motivate people to choose healthier products."
      },
      {
        "term": "food industry lobbying",
        "definitionVi": "vận động hành lang của ngành thực phẩm",
        "example": "Food industry lobbying has slowed the introduction of sugar taxes in some countries."
      },
      {
        "term": "obesity prevention",
        "definitionVi": "phòng ngừa béo phì",
        "example": "Both subsidies and taxes are used as tools for obesity prevention."
      },
      {
        "term": "revenue generation",
        "definitionVi": "tạo nguồn thu",
        "example": "Sugar taxes also serve as a source of revenue generation for governments."
      },
      {
        "term": "nutritional value",
        "definitionVi": "giá trị dinh dưỡng",
        "example": "Subsidies encourage people to buy food with higher nutritional value."
      },
      {
        "term": "regressive tax",
        "definitionVi": "thuế lũy thoái",
        "example": "Critics argue that sugar taxes act as a regressive tax on the poor."
      },
      {
        "term": "healthcare costs",
        "definitionVi": "chi phí y tế",
        "example": "Reducing unhealthy eating could lower long-term healthcare costs."
      },
      {
        "term": "market distortion",
        "definitionVi": "sự bóp méo thị trường",
        "example": "Some economists warn that subsidies can cause market distortion."
      },
      {
        "term": "public awareness",
        "definitionVi": "nhận thức cộng đồng",
        "example": "Raising public awareness is essential alongside financial measures."
      },
      {
        "term": "make a compelling case for",
        "definitionVi": "đưa ra lập luận thuyết phục cho",
        "example": "Health experts make a compelling case for taxing sugary drinks."
      },
      {
        "term": "shift the burden onto",
        "definitionVi": "chuyển gánh nặng sang",
        "example": "A junk food tax shifts the financial burden onto unhealthy choices."
      },
      {
        "term": "curb unhealthy consumption",
        "definitionVi": "kiềm chế việc tiêu thụ không lành mạnh",
        "example": "Higher prices can curb unhealthy consumption over time."
      },
      {
        "term": "level the economic playing field",
        "definitionVi": "tạo sân chơi kinh tế công bằng",
        "example": "Subsidies help level the economic playing field for healthy food."
      },
      {
        "term": "disproportionately affect low-income families",
        "definitionVi": "ảnh hưởng không cân xứng đến các gia đình thu nhập thấp",
        "example": "Critics argue sugar taxes disproportionately affect low-income families."
      },
      {
        "term": "yield measurable results",
        "definitionVi": "mang lại kết quả có thể đo lường được",
        "example": "Sugar taxes in some countries have yielded measurable results."
      },
      {
        "term": "channel tax revenue into",
        "definitionVi": "dồn nguồn thu thuế vào",
        "example": "Governments can channel tax revenue into public health programmes."
      },
      {
        "term": "nudge consumers towards",
        "definitionVi": "thúc đẩy người tiêu dùng hướng tới",
        "example": "Price incentives can nudge consumers towards healthier choices."
      },
      {
        "term": "strike at the source of",
        "definitionVi": "đánh trực tiếp vào nguồn gốc của",
        "example": "Taxing sugar strikes at the source of rising obesity rates."
      },
      {
        "term": "complement other public health measures",
        "definitionVi": "bổ sung cho các biện pháp y tế công cộng khác",
        "example": "A sugar tax should complement other public health measures, not replace them."
      }
    ],
    "questions": [
      {
        "questionId": "w11ph_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Some people argue... Others believe... Discuss both views and give your opinion.\" — Đây là dạng essay nào?",
        "options": [
          "Agree or Disagree",
          "Discuss Both Views",
          "Cause & Solution",
          "Positive or Negative Development"
        ],
        "baseWords": [],
        "correctAnswer": "Discuss Both Views",
        "explanationVi": "Cụm 'Discuss both views and give your opinion' là dấu hiệu nhận biết trực tiếp — bài viết cần phân tích cả hai quan điểm trước khi nêu ý kiến cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w11ph_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Some people argue that governments should _____ fresh fruits and vegetables to make healthy food affordable.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "subsidize",
        "explanationVi": "'Subsidize + N' = trợ cấp cho. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w11ph_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng chính phủ nên trợ cấp cho rau quả tươi để thực phẩm lành mạnh có giá cả phải chăng hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that governments should subsidize fresh produce to make healthy food more affordable.",
        "explanationVi": "'Subsidize + N' = trợ cấp cho. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Some people believe that governments should subsidize fresh produce to make healthy food more affordable.",
        "fallbackKeywords": [
          "subsidize",
          "fresh produce",
          "affordable"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w11ph_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những người khác lại cho rằng đánh thuế thực phẩm không lành mạnh là một chiến lược tốt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Others believe that taxing unhealthy food is a better strategy.",
        "explanationVi": "'Tax + N' = đánh thuế. 'A better strategy' = một chiến lược tốt hơn.",
        "modelAnswer": "Others believe that taxing unhealthy food is a better strategy.",
        "fallbackKeywords": [
          "taxing unhealthy food",
          "better strategy"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w11ph_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Trợ cấp thực phẩm đặc biệt mang lại lợi ích cho các hộ gia đình thu nhập thấp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Food subsidies particularly benefit low-income households.",
        "explanationVi": "'Food subsidy' = trợ cấp thực phẩm. 'Low-income households' = hộ gia đình thu nhập thấp.",
        "modelAnswer": "Food subsidies particularly benefit low-income households.",
        "fallbackKeywords": [
          "food subsidies",
          "low-income households",
          "benefit"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w11ph_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thuế đường có thể khuyến khích mọi người lựa chọn sản phẩm lành mạnh hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sugar tax can encourage people to choose healthier products.",
        "explanationVi": "'Sugar tax' = thuế đường. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "A sugar tax can encourage people to choose healthier products.",
        "fallbackKeywords": [
          "sugar tax",
          "encourage",
          "healthier products"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w11ph_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by subsidizing / reduce obesity rates / fresh produce / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could reduce obesity rates by subsidizing fresh produce.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Subsidize fresh produce' = trợ cấp cho nông sản tươi.",
        "modelAnswer": "Governments could reduce obesity rates by subsidizing fresh produce.",
        "fallbackKeywords": [
          "governments",
          "reduce obesity rates",
          "subsidizing"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w11ph_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to introduce a tax on sugary drinks.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should introduce a tax on sugary drinks.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should introduce a tax on sugary drinks.",
        "fallbackKeywords": [
          "governments",
          "tax",
          "sugary drinks"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w11ph_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"consumer choice\"):\n\n\"Những người chỉ trích cho rằng thuế thực phẩm hạn chế quyền lựa chọn của người tiêu dùng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Critics argue that food taxes limit consumer choice.",
        "explanationVi": "'Consumer choice' = quyền lựa chọn của người tiêu dùng. 'Limit + N' = hạn chế.",
        "modelAnswer": "Critics argue that food taxes limit consumer choice.",
        "fallbackKeywords": [
          "food taxes",
          "consumer choice",
          "limit"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w11ph_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public funds\"):\n\n\"Các chương trình trợ cấp đòi hỏi một lượng ngân sách công đáng kể để vận hành.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Subsidy programmes require significant public funds to operate.",
        "explanationVi": "'Public funds' = ngân sách công. 'Require + N + to V' = đòi hỏi cái gì để làm gì.",
        "modelAnswer": "Subsidy programmes require significant public funds to operate.",
        "fallbackKeywords": [
          "subsidy programmes",
          "public funds",
          "operate"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w11ph_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"diet-related illness\"):\n\n\"Các bệnh liên quan đến chế độ ăn đặt gánh nặng lớn lên hệ thống y tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Diet-related illnesses place a heavy burden on healthcare systems.",
        "explanationVi": "'Diet-related illness' = bệnh liên quan đến chế độ ăn. 'Place a burden on + N' = đặt gánh nặng lên.",
        "modelAnswer": "Diet-related illnesses place a heavy burden on healthcare systems.",
        "fallbackKeywords": [
          "diet-related illnesses",
          "healthcare systems",
          "burden"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w11ph_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"behavioural change\"):\n\n\"Thuế có thể khuyến khích sự thay đổi hành vi bằng cách làm cho thực phẩm không lành mạnh đắt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Taxes can encourage behavioural change by making unhealthy food more expensive.",
        "explanationVi": "'Behavioural change' = sự thay đổi hành vi. 'Make + N + more expensive' = làm cho cái gì đắt hơn.",
        "modelAnswer": "Taxes can encourage behavioural change by making unhealthy food more expensive.",
        "fallbackKeywords": [
          "behavioural change",
          "taxes",
          "more expensive"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w11ph_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food industry lobbying\"):\n\n\"Sự vận động hành lang của ngành thực phẩm đã làm chậm việc áp dụng thuế đường ở một số quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Food industry lobbying has slowed the introduction of sugar taxes in some countries.",
        "explanationVi": "'Food industry lobbying' = vận động hành lang của ngành thực phẩm. 'Slow the introduction of' = làm chậm việc áp dụng.",
        "modelAnswer": "Food industry lobbying has slowed the introduction of sugar taxes in some countries.",
        "fallbackKeywords": [
          "food industry lobbying",
          "sugar taxes",
          "slowed"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w11ph_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"revenue generation\"):\n\n\"Thuế đường cũng đóng vai trò như một nguồn tạo thu nhập cho chính phủ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sugar taxes also serve as a source of revenue generation for governments.",
        "explanationVi": "'Revenue generation' = tạo nguồn thu. 'Serve as a source of' = đóng vai trò như một nguồn.",
        "modelAnswer": "Sugar taxes also serve as a source of revenue generation for governments.",
        "fallbackKeywords": [
          "sugar taxes",
          "revenue generation",
          "governments"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w11ph_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"regressive tax\"):\n\n\"Những người chỉ trích cho rằng thuế đường đóng vai trò như một loại thuế lũy thoái đối với người nghèo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Critics argue that sugar taxes act as a regressive tax on the poor.",
        "explanationVi": "'Regressive tax' = thuế lũy thoái (tỷ lệ ảnh hưởng đến người nghèo cao hơn người giàu). 'Act as + N' = đóng vai trò như.",
        "modelAnswer": "Critics argue that sugar taxes act as a regressive tax on the poor.",
        "fallbackKeywords": [
          "regressive tax",
          "sugar taxes",
          "the poor"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w11ph_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"healthcare costs\"):\n\n\"Giảm việc ăn uống không lành mạnh có thể làm giảm chi phí y tế về lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Reducing unhealthy eating could lower long-term healthcare costs.",
        "explanationVi": "'Healthcare costs' = chi phí y tế. 'Lower + N' = làm giảm.",
        "modelAnswer": "Reducing unhealthy eating could lower long-term healthcare costs.",
        "fallbackKeywords": [
          "reducing unhealthy eating",
          "healthcare costs"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w11ph_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"market distortion\"):\n\n\"Một số nhà kinh tế học cảnh báo rằng trợ cấp có thể gây ra sự bóp méo thị trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some economists warn that subsidies can cause market distortion.",
        "explanationVi": "'Market distortion' = sự bóp méo thị trường. 'Cause + N' = gây ra.",
        "modelAnswer": "Some economists warn that subsidies can cause market distortion.",
        "fallbackKeywords": [
          "economists",
          "subsidies",
          "market distortion"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w11ph_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"nutritional value\"):\n\n\"Trợ cấp khuyến khích mọi người mua thực phẩm có giá trị dinh dưỡng cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Subsidies encourage people to buy food with higher nutritional value.",
        "explanationVi": "'Nutritional value' = giá trị dinh dưỡng. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "Subsidies encourage people to buy food with higher nutritional value.",
        "fallbackKeywords": [
          "subsidies",
          "nutritional value",
          "encourage"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w11ph_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"obesity prevention\"):\n\n\"Cả trợ cấp và thuế đều được sử dụng như những công cụ phòng ngừa béo phì.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Both subsidies and taxes are used as tools for obesity prevention.",
        "explanationVi": "'Obesity prevention' = phòng ngừa béo phì. 'Both A and B are used as' = cả A và B đều được sử dụng như.",
        "modelAnswer": "Both subsidies and taxes are used as tools for obesity prevention.",
        "fallbackKeywords": [
          "subsidies and taxes",
          "obesity prevention",
          "tools"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w11ph_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public awareness\"):\n\n\"Nâng cao nhận thức cộng đồng là điều cần thiết bên cạnh các biện pháp tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Raising public awareness is essential alongside financial measures.",
        "explanationVi": "'Public awareness' = nhận thức cộng đồng. 'Alongside + N' = bên cạnh.",
        "modelAnswer": "Raising public awareness is essential alongside financial measures.",
        "fallbackKeywords": [
          "public awareness",
          "essential",
          "financial measures"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 11,
    "block": "discuss_both_views",
    "topicName": "Funding Priorities: Free Public Libraries vs. Internet Infrastructure",
    "topicEmoji": "📚",
    "essayType": "discuss_both_views",
    "prompt": "Some people think that the government should provide free public libraries in every town. Others think this is a waste of money because people can find all the information they need on the internet. Discuss both views and give your own opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 41,
    "vocabularyList": [
      {
        "term": "public library",
        "definitionVi": "thư viện công cộng",
        "example": "Some people think governments should fund free local public libraries."
      },
      {
        "term": "internet infrastructure",
        "definitionVi": "cơ sở hạ tầng internet",
        "example": "Investing in internet infrastructure allows more citizens to access information online."
      },
      {
        "term": "waste of public funds",
        "definitionVi": "lãng phí ngân sách công",
        "example": "Critics argue that funding libraries is a waste of public funds."
      },
      {
        "term": "digital access",
        "definitionVi": "khả năng truy cập kỹ thuật số",
        "example": "Not everyone has equal digital access to information online."
      },
      {
        "term": "community resource",
        "definitionVi": "nguồn lực cộng đồng",
        "example": "Libraries remain a valuable community resource beyond just books."
      },
      {
        "term": "digital divide",
        "definitionVi": "khoảng cách kỹ thuật số",
        "example": "The digital divide leaves some citizens without reliable internet access."
      },
      {
        "term": "lifelong learning",
        "definitionVi": "học tập suốt đời",
        "example": "Public libraries support lifelong learning for people of all ages."
      },
      {
        "term": "information literacy",
        "definitionVi": "hiểu biết về thông tin",
        "example": "Libraries help improve information literacy among the public."
      },
      {
        "term": "budget allocation",
        "definitionVi": "phân bổ ngân sách",
        "example": "Budget allocation decisions must balance libraries and digital services."
      },
      {
        "term": "public services",
        "definitionVi": "dịch vụ công cộng",
        "example": "Libraries are considered an essential public service in many communities."
      },
      {
        "term": "underprivileged communities",
        "definitionVi": "cộng đồng thiệt thòi",
        "example": "Libraries provide free resources for underprivileged communities without home internet."
      },
      {
        "term": "cost-effectiveness",
        "definitionVi": "hiệu quả về chi phí",
        "example": "Governments must consider the cost-effectiveness of each type of investment."
      },
      {
        "term": "broadband access",
        "definitionVi": "khả năng tiếp cận internet băng thông rộng",
        "example": "Expanding broadband access could reduce reliance on physical libraries."
      },
      {
        "term": "social hub",
        "definitionVi": "trung tâm sinh hoạt cộng đồng",
        "example": "Many libraries function as a social hub, not just a place to read books."
      },
      {
        "term": "digital literacy programme",
        "definitionVi": "chương trình phổ cập kỹ năng số",
        "example": "Libraries often run digital literacy programmes for older residents."
      },
      {
        "term": "information equality",
        "definitionVi": "sự bình đẳng trong tiếp cận thông tin",
        "example": "Free public libraries promote information equality for all citizens."
      },
      {
        "term": "e-book subscription",
        "definitionVi": "gói đăng ký sách điện tử",
        "example": "Some libraries now offer e-book subscriptions alongside physical books."
      },
      {
        "term": "technological obsolescence",
        "definitionVi": "sự lỗi thời về công nghệ",
        "example": "Critics claim libraries risk technological obsolescence in the digital age."
      },
      {
        "term": "public investment priorities",
        "definitionVi": "ưu tiên đầu tư công",
        "example": "Debates over public investment priorities often involve libraries versus technology."
      },
      {
        "term": "educational equity",
        "definitionVi": "sự công bằng trong giáo dục",
        "example": "Libraries help promote educational equity across different income groups."
      },
      {
        "term": "serve the wider community",
        "definitionVi": "phục vụ cộng đồng rộng lớn hơn",
        "example": "Public libraries serve the wider community beyond just book lending."
      },
      {
        "term": "render obsolete",
        "definitionVi": "khiến cho trở nên lỗi thời",
        "example": "Some argue that the internet has rendered libraries largely obsolete."
      },
      {
        "term": "close the digital divide",
        "definitionVi": "thu hẹp khoảng cách kỹ thuật số",
        "example": "Investment in broadband can help close the digital divide."
      },
      {
        "term": "allocate public funds wisely",
        "definitionVi": "phân bổ ngân sách công một cách khôn ngoan",
        "example": "Governments must allocate public funds wisely between competing priorities."
      },
      {
        "term": "reinvent themselves as",
        "definitionVi": "tự tái tạo bản thân thành",
        "example": "Many libraries have reinvented themselves as digital learning hubs."
      },
      {
        "term": "guarantee equal access to",
        "definitionVi": "đảm bảo khả năng tiếp cận bình đẳng đến",
        "example": "Public libraries help guarantee equal access to information for all."
      },
      {
        "term": "justify the expenditure on",
        "definitionVi": "biện minh cho khoản chi tiêu vào",
        "example": "It can be hard to justify the expenditure on physical libraries today."
      },
      {
        "term": "complement online resources",
        "definitionVi": "bổ sung cho các nguồn tài nguyên trực tuyến",
        "example": "Libraries can complement online resources rather than compete with them."
      },
      {
        "term": "leave no one behind",
        "definitionVi": "không để ai bị bỏ lại phía sau",
        "example": "Public services should leave no one behind in the digital age."
      },
      {
        "term": "represent good value for money",
        "definitionVi": "thể hiện giá trị xứng đáng với chi phí bỏ ra",
        "example": "Supporters argue that libraries represent good value for money."
      }
    ],
    "questions": [
      {
        "questionId": "w11fl_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Some people think... Others believe... Discuss both views and give your opinion.\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Agree or Disagree",
          "Cause & Effect",
          "Effect & Solution"
        ],
        "baseWords": [],
        "correctAnswer": "Discuss Both Views",
        "explanationVi": "Cụm 'Discuss both views and give your opinion' là dấu hiệu nhận biết trực tiếp — bài viết cần phân tích cả hai quan điểm trước khi nêu ý kiến cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w11fl_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Some people think that governments should _____ free local public libraries.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "fund",
        "explanationVi": "'Fund + N' = cấp kinh phí, tài trợ cho. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w11fl_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng chính phủ nên tài trợ cho các thư viện công cộng miễn phí ở địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that governments should fund free local public libraries.",
        "explanationVi": "'Fund + N' = tài trợ cho. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Some people believe that governments should fund free local public libraries.",
        "fallbackKeywords": [
          "fund",
          "free local public libraries"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w11fl_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những người khác tin rằng đây là sự lãng phí ngân sách công vì người dân có thể tiếp cận thông tin trực tuyến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Others believe this is a waste of public funds because citizens can access information online.",
        "explanationVi": "'A waste of public funds' = sự lãng phí ngân sách công. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Others believe this is a waste of public funds because citizens can access information online.",
        "fallbackKeywords": [
          "waste of public funds",
          "access information online"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w11fl_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thư viện vẫn là một nguồn lực cộng đồng có giá trị vượt ra ngoài việc chỉ đọc sách.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries remain a valuable community resource beyond just books.",
        "explanationVi": "'Community resource' = nguồn lực cộng đồng. 'Beyond just + N' = vượt ra ngoài chỉ có.",
        "modelAnswer": "Libraries remain a valuable community resource beyond just books.",
        "fallbackKeywords": [
          "libraries",
          "community resource",
          "beyond just books"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w11fl_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Không phải ai cũng có khả năng truy cập kỹ thuật số như nhau đối với thông tin trực tuyến.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not everyone has equal digital access to information online.",
        "explanationVi": "'Digital access' = khả năng truy cập kỹ thuật số. 'Not everyone has equal + N' = không phải ai cũng có... như nhau.",
        "modelAnswer": "Not everyone has equal digital access to information online.",
        "fallbackKeywords": [
          "digital access",
          "equal",
          "information online"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w11fl_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[without / provide free resources / home internet / for communities / Libraries]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries provide free resources for communities without home internet.",
        "explanationVi": "'Provide free resources for' = cung cấp nguồn lực miễn phí cho. 'Without home internet' = không có internet tại nhà.",
        "modelAnswer": "Libraries provide free resources for communities without home internet.",
        "fallbackKeywords": [
          "libraries",
          "free resources",
          "home internet"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w11fl_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to invest in both libraries and internet infrastructure.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should invest in both libraries and internet infrastructure.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should invest in both libraries and internet infrastructure.",
        "fallbackKeywords": [
          "governments",
          "libraries",
          "internet infrastructure"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w11fl_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital divide\"):\n\n\"Khoảng cách kỹ thuật số khiến một số công dân không có internet đáng tin cậy.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The digital divide leaves some citizens without reliable internet access.",
        "explanationVi": "'Digital divide' = khoảng cách kỹ thuật số. 'Leave + O + without + N' = khiến ai không có gì.",
        "modelAnswer": "The digital divide leaves some citizens without reliable internet access.",
        "fallbackKeywords": [
          "digital divide",
          "reliable internet access"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w11fl_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"lifelong learning\"):\n\n\"Thư viện công cộng hỗ trợ việc học tập suốt đời cho mọi lứa tuổi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Public libraries support lifelong learning for people of all ages.",
        "explanationVi": "'Lifelong learning' = học tập suốt đời. 'For people of all ages' = cho mọi lứa tuổi.",
        "modelAnswer": "Public libraries support lifelong learning for people of all ages.",
        "fallbackKeywords": [
          "lifelong learning",
          "all ages"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w11fl_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"information literacy\"):\n\n\"Thư viện giúp cải thiện hiểu biết về thông tin trong cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries help improve information literacy among the public.",
        "explanationVi": "'Information literacy' = hiểu biết về thông tin. 'Among the public' = trong cộng đồng.",
        "modelAnswer": "Libraries help improve information literacy among the public.",
        "fallbackKeywords": [
          "information literacy",
          "among the public"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w11fl_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"budget allocation\"):\n\n\"Các quyết định phân bổ ngân sách phải cân bằng giữa thư viện và dịch vụ kỹ thuật số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Budget allocation decisions must balance libraries and digital services.",
        "explanationVi": "'Budget allocation' = phân bổ ngân sách. 'Balance A and B' = cân bằng giữa A và B.",
        "modelAnswer": "Budget allocation decisions must balance libraries and digital services.",
        "fallbackKeywords": [
          "budget allocation",
          "balance",
          "digital services"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w11fl_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"underprivileged communities\"):\n\n\"Thư viện cung cấp nguồn tài nguyên miễn phí cho các cộng đồng thiệt thòi không có internet tại nhà.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries provide free resources for underprivileged communities without home internet.",
        "explanationVi": "'Underprivileged communities' = cộng đồng thiệt thòi. 'Free resources' = nguồn tài nguyên miễn phí.",
        "modelAnswer": "Libraries provide free resources for underprivileged communities without home internet.",
        "fallbackKeywords": [
          "underprivileged communities",
          "free resources"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w11fl_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cost-effectiveness\"):\n\n\"Chính phủ phải xem xét hiệu quả về chi phí của mỗi loại hình đầu tư.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments must consider the cost-effectiveness of each type of investment.",
        "explanationVi": "'Cost-effectiveness' = hiệu quả về chi phí. 'Consider + N' = xem xét.",
        "modelAnswer": "Governments must consider the cost-effectiveness of each type of investment.",
        "fallbackKeywords": [
          "cost-effectiveness",
          "type of investment"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w11fl_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"broadband access\"):\n\n\"Mở rộng khả năng tiếp cận internet băng thông rộng có thể làm giảm sự phụ thuộc vào thư viện vật lý.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Expanding broadband access could reduce reliance on physical libraries.",
        "explanationVi": "'Broadband access' = khả năng tiếp cận internet băng thông rộng. 'Reliance on + N' = sự phụ thuộc vào.",
        "modelAnswer": "Expanding broadband access could reduce reliance on physical libraries.",
        "fallbackKeywords": [
          "broadband access",
          "physical libraries",
          "reliance"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w11fl_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social hub\"):\n\n\"Nhiều thư viện hoạt động như một trung tâm sinh hoạt cộng đồng, chứ không chỉ là nơi đọc sách.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many libraries function as a social hub, not just a place to read books.",
        "explanationVi": "'Social hub' = trung tâm sinh hoạt cộng đồng. 'Function as + N' = hoạt động như.",
        "modelAnswer": "Many libraries function as a social hub, not just a place to read books.",
        "fallbackKeywords": [
          "social hub",
          "function as",
          "not just a place"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w11fl_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital literacy programme\"):\n\n\"Thư viện thường tổ chức các chương trình phổ cập kỹ năng số cho cư dân lớn tuổi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries often run digital literacy programmes for older residents.",
        "explanationVi": "'Digital literacy programme' = chương trình phổ cập kỹ năng số. 'Run + N' = tổ chức, vận hành.",
        "modelAnswer": "Libraries often run digital literacy programmes for older residents.",
        "fallbackKeywords": [
          "digital literacy programmes",
          "older residents"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w11fl_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"information equality\"):\n\n\"Thư viện công cộng miễn phí thúc đẩy sự bình đẳng trong tiếp cận thông tin cho mọi công dân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Free public libraries promote information equality for all citizens.",
        "explanationVi": "'Information equality' = sự bình đẳng trong tiếp cận thông tin. 'Promote + N' = thúc đẩy.",
        "modelAnswer": "Free public libraries promote information equality for all citizens.",
        "fallbackKeywords": [
          "information equality",
          "all citizens"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w11fl_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technological obsolescence\"):\n\n\"Những người chỉ trích cho rằng thư viện có nguy cơ trở nên lỗi thời về công nghệ trong thời đại số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Critics claim libraries risk technological obsolescence in the digital age.",
        "explanationVi": "'Technological obsolescence' = sự lỗi thời về công nghệ. 'In the digital age' = trong thời đại số.",
        "modelAnswer": "Critics claim libraries risk technological obsolescence in the digital age.",
        "fallbackKeywords": [
          "technological obsolescence",
          "digital age"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w11fl_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"educational equity\"):\n\n\"Thư viện giúp thúc đẩy sự công bằng trong giáo dục giữa các nhóm thu nhập khác nhau.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Libraries help promote educational equity across different income groups.",
        "explanationVi": "'Educational equity' = sự công bằng trong giáo dục. 'Across different income groups' = giữa các nhóm thu nhập khác nhau.",
        "modelAnswer": "Libraries help promote educational equity across different income groups.",
        "fallbackKeywords": [
          "educational equity",
          "income groups"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 12,
    "block": "discuss_both_views",
    "topicName": "National Fitness Funding: Elite Athletes vs. Grassroots Sports",
    "topicEmoji": "🏅",
    "essayType": "discuss_both_views",
    "prompt": "Some people believe that governments should build more sports facilities to train top athletes for international competitions such as the Olympic Games. Others think it is better to build sports facilities that ordinary people can use. Discuss both views and give your own opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 42,
    "vocabularyList": [
      {
        "term": "elite athlete",
        "definitionVi": "vận động viên đỉnh cao",
        "example": "Governments spend large sums preparing elite athletes for the Olympics."
      },
      {
        "term": "grassroots sports",
        "definitionVi": "thể thao phong trào, cơ sở",
        "example": "Others believe funding should go towards grassroots sports instead."
      },
      {
        "term": "national pride",
        "definitionVi": "niềm tự hào dân tộc",
        "example": "Olympic success can generate a strong sense of national pride."
      },
      {
        "term": "youth participation",
        "definitionVi": "sự tham gia của giới trẻ",
        "example": "Local sports programmes aim to increase youth participation in exercise."
      },
      {
        "term": "international competitions",
        "definitionVi": "các cuộc thi đấu quốc tế",
        "example": "Elite athletes represent their country in major international competitions."
      },
      {
        "term": "public health benefits",
        "definitionVi": "lợi ích sức khỏe cộng đồng",
        "example": "Grassroots sports funding delivers wider public health benefits."
      },
      {
        "term": "sporting infrastructure",
        "definitionVi": "cơ sở hạ tầng thể thao",
        "example": "Investment in sporting infrastructure benefits both elite and amateur athletes."
      },
      {
        "term": "role model effect",
        "definitionVi": "hiệu ứng tấm gương",
        "example": "Successful athletes can inspire children through the role model effect."
      },
      {
        "term": "community sports clubs",
        "definitionVi": "câu lạc bộ thể thao cộng đồng",
        "example": "Community sports clubs give children access to affordable coaching."
      },
      {
        "term": "talent development",
        "definitionVi": "phát triển tài năng",
        "example": "Talent development programmes identify promising young athletes early."
      },
      {
        "term": "sedentary childhood",
        "definitionVi": "tuổi thơ ít vận động",
        "example": "A sedentary childhood is linked to poor long-term health outcomes."
      },
      {
        "term": "government funding priorities",
        "definitionVi": "ưu tiên trong chi tiêu của chính phủ",
        "example": "Government funding priorities often spark debate between elite and grassroots sport."
      },
      {
        "term": "sporting achievement",
        "definitionVi": "thành tích thể thao",
        "example": "Sporting achievement at the Olympics can boost a nation's global image."
      },
      {
        "term": "accessible sports facilities",
        "definitionVi": "cơ sở thể thao dễ tiếp cận",
        "example": "Accessible sports facilities encourage more children to stay active."
      },
      {
        "term": "return on investment",
        "definitionVi": "lợi tức đầu tư",
        "example": "Critics question the return on investment of funding elite sport alone."
      },
      {
        "term": "physical fitness levels",
        "definitionVi": "mức độ thể lực",
        "example": "Grassroots programmes can improve physical fitness levels nationwide."
      },
      {
        "term": "sports scholarship",
        "definitionVi": "học bổng thể thao",
        "example": "Sports scholarships help talented young athletes pursue their training."
      },
      {
        "term": "national team performance",
        "definitionVi": "thành tích của đội tuyển quốc gia",
        "example": "Funding elite athletes is intended to improve national team performance."
      },
      {
        "term": "childhood obesity prevention",
        "definitionVi": "phòng ngừa béo phì ở trẻ em",
        "example": "Grassroots sports funding also supports childhood obesity prevention."
      },
      {
        "term": "balanced funding approach",
        "definitionVi": "cách tiếp cận tài trợ cân bằng",
        "example": "Many experts recommend a balanced funding approach for both goals."
      },
      {
        "term": "inspire the next generation",
        "definitionVi": "truyền cảm hứng cho thế hệ tiếp theo",
        "example": "Olympic champions can inspire the next generation to take up sport."
      },
      {
        "term": "reap long-term dividends",
        "definitionVi": "thu về lợi ích lâu dài",
        "example": "Investment in grassroots sport reaps long-term dividends for public health."
      },
      {
        "term": "put the nation on the map",
        "definitionVi": "đưa đất nước lên bản đồ (thế giới)",
        "example": "Elite sporting success can put a small nation on the map."
      },
      {
        "term": "cultivate sporting talent",
        "definitionVi": "nuôi dưỡng tài năng thể thao",
        "example": "Community clubs help cultivate sporting talent from a young age."
      },
      {
        "term": "come with a hefty price tag",
        "definitionVi": "đi kèm với một khoản chi phí lớn",
        "example": "Preparing elite athletes for the Olympics comes with a hefty price tag."
      },
      {
        "term": "broaden participation in sport",
        "definitionVi": "mở rộng sự tham gia vào thể thao",
        "example": "Grassroots funding aims to broaden participation in sport among children."
      },
      {
        "term": "justify public investment in",
        "definitionVi": "biện minh cho khoản đầu tư công vào",
        "example": "It can be difficult to justify public investment in elite sport alone."
      },
      {
        "term": "reduce healthcare spending",
        "definitionVi": "giảm chi tiêu cho y tế",
        "example": "A more active population could reduce long-term healthcare spending."
      },
      {
        "term": "boost national morale",
        "definitionVi": "nâng cao tinh thần quốc gia",
        "example": "International sporting success can boost national morale significantly."
      },
      {
        "term": "trickle down to grassroots level",
        "definitionVi": "lan tỏa xuống cấp cơ sở, quần chúng",
        "example": "Elite success is claimed to trickle down to grassroots level, though evidence is mixed."
      }
    ],
    "questions": [
      {
        "questionId": "w12nf_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Some people believe... Others argue... Discuss both views and give your opinion.\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Agree or Disagree",
          "Cause & Effect",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Discuss Both Views",
        "explanationVi": "Cụm 'Discuss both views and give your opinion' là dấu hiệu nhận biết trực tiếp — bài viết cần phân tích cả hai quan điểm trước khi nêu ý kiến cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12nf_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Some people believe that governments should spend money preparing elite athletes for major international _____ like the Olympic Games.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "competitions",
        "explanationVi": "'International competitions' = các cuộc thi đấu quốc tế. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12nf_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người tin rằng chính phủ nên chi tiền để chuẩn bị cho các vận động viên đỉnh cao thi đấu quốc tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that governments should spend money preparing elite athletes for international competitions.",
        "explanationVi": "'Elite athletes' = vận động viên đỉnh cao. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Some people believe that governments should spend money preparing elite athletes for international competitions.",
        "fallbackKeywords": [
          "spend money",
          "elite athletes",
          "international competitions"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12nf_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những người khác lại cho rằng số tiền đó nên được dùng để khuyến khích trẻ em tham gia thể thao địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Others argue that this money should be spent encouraging children to participate in local sports.",
        "explanationVi": "'Encourage + O + to V' = khuyến khích ai làm gì. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Others argue that this money should be spent encouraging children to participate in local sports.",
        "fallbackKeywords": [
          "encourage children",
          "local sports"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12nf_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Thành công tại Olympic có thể tạo ra một cảm giác tự hào dân tộc mạnh mẽ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Olympic success can generate a strong sense of national pride.",
        "explanationVi": "'National pride' = niềm tự hào dân tộc. 'Generate + N' = tạo ra.",
        "modelAnswer": "Olympic success can generate a strong sense of national pride.",
        "fallbackKeywords": [
          "olympic success",
          "national pride"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12nf_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các chương trình thể thao địa phương nhằm mục đích tăng cường sự tham gia của giới trẻ vào việc tập luyện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Local sports programmes aim to increase youth participation in exercise.",
        "explanationVi": "'Youth participation' = sự tham gia của giới trẻ. 'Aim to + V' = nhằm mục đích.",
        "modelAnswer": "Local sports programmes aim to increase youth participation in exercise.",
        "fallbackKeywords": [
          "local sports programmes",
          "youth participation"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12nf_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by building / more community sports clubs / increase youth participation / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could increase youth participation by building more community sports clubs.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Community sports clubs' = câu lạc bộ thể thao cộng đồng.",
        "modelAnswer": "Governments could increase youth participation by building more community sports clubs.",
        "fallbackKeywords": [
          "governments",
          "youth participation",
          "community sports clubs"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12nf_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to fund both elite athletes and grassroots sports.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should fund both elite athletes and grassroots sports.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should fund both elite athletes and grassroots sports.",
        "fallbackKeywords": [
          "governments",
          "elite athletes",
          "grassroots sports"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12nf_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public health benefits\"):\n\n\"Việc tài trợ cho thể thao phong trào mang lại những lợi ích sức khỏe cộng đồng rộng lớn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Grassroots sports funding delivers wider public health benefits.",
        "explanationVi": "'Public health benefits' = lợi ích sức khỏe cộng đồng. 'Deliver + N' = mang lại.",
        "modelAnswer": "Grassroots sports funding delivers wider public health benefits.",
        "fallbackKeywords": [
          "grassroots sports funding",
          "public health benefits"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12nf_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"role model effect\"):\n\n\"Các vận động viên thành công có thể truyền cảm hứng cho trẻ em thông qua hiệu ứng tấm gương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Successful athletes can inspire children through the role model effect.",
        "explanationVi": "'Role model effect' = hiệu ứng tấm gương. 'Inspire + O' = truyền cảm hứng cho.",
        "modelAnswer": "Successful athletes can inspire children through the role model effect.",
        "fallbackKeywords": [
          "successful athletes",
          "role model effect",
          "inspire"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12nf_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"talent development\"):\n\n\"Các chương trình phát triển tài năng giúp xác định sớm những vận động viên trẻ tiềm năng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Talent development programmes identify promising young athletes early.",
        "explanationVi": "'Talent development' = phát triển tài năng. 'Identify + N + early' = xác định sớm.",
        "modelAnswer": "Talent development programmes identify promising young athletes early.",
        "fallbackKeywords": [
          "talent development",
          "young athletes",
          "identify"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12nf_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sedentary childhood\"):\n\n\"Một tuổi thơ ít vận động có liên hệ với những hệ quả sức khỏe kém về lâu dài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sedentary childhood is linked to poor long-term health outcomes.",
        "explanationVi": "'Sedentary childhood' = tuổi thơ ít vận động. 'Be linked to + N' = có liên hệ với.",
        "modelAnswer": "A sedentary childhood is linked to poor long-term health outcomes.",
        "fallbackKeywords": [
          "sedentary childhood",
          "health outcomes"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12nf_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"government funding priorities\"):\n\n\"Ưu tiên trong chi tiêu của chính phủ thường gây ra tranh cãi giữa thể thao đỉnh cao và phong trào.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Government funding priorities often spark debate between elite and grassroots sport.",
        "explanationVi": "'Government funding priorities' = ưu tiên trong chi tiêu của chính phủ. 'Spark debate' = gây ra tranh cãi.",
        "modelAnswer": "Government funding priorities often spark debate between elite and grassroots sport.",
        "fallbackKeywords": [
          "government funding priorities",
          "debate"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12nf_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sporting achievement\"):\n\n\"Thành tích thể thao tại Olympic có thể nâng cao hình ảnh toàn cầu của một quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sporting achievement at the Olympics can boost a nation's global image.",
        "explanationVi": "'Sporting achievement' = thành tích thể thao. 'Boost a nation's global image' = nâng cao hình ảnh toàn cầu của một quốc gia.",
        "modelAnswer": "Sporting achievement at the Olympics can boost a nation's global image.",
        "fallbackKeywords": [
          "sporting achievement",
          "global image"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12nf_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"accessible sports facilities\"):\n\n\"Các cơ sở thể thao dễ tiếp cận khuyến khích nhiều trẻ em duy trì vận động hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Accessible sports facilities encourage more children to stay active.",
        "explanationVi": "'Accessible sports facilities' = cơ sở thể thao dễ tiếp cận. 'Stay active' = duy trì vận động.",
        "modelAnswer": "Accessible sports facilities encourage more children to stay active.",
        "fallbackKeywords": [
          "accessible sports facilities",
          "stay active"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12nf_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"return on investment\"):\n\n\"Những người chỉ trích đặt câu hỏi về lợi tức đầu tư của việc chỉ tài trợ cho thể thao đỉnh cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Critics question the return on investment of funding elite sport alone.",
        "explanationVi": "'Return on investment' = lợi tức đầu tư. 'Question + N' = đặt câu hỏi về, nghi ngờ.",
        "modelAnswer": "Critics question the return on investment of funding elite sport alone.",
        "fallbackKeywords": [
          "return on investment",
          "elite sport alone"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12nf_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"physical fitness levels\"):\n\n\"Các chương trình phong trào có thể cải thiện mức độ thể lực trên toàn quốc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Grassroots programmes can improve physical fitness levels nationwide.",
        "explanationVi": "'Physical fitness levels' = mức độ thể lực. 'Nationwide' = trên toàn quốc.",
        "modelAnswer": "Grassroots programmes can improve physical fitness levels nationwide.",
        "fallbackKeywords": [
          "grassroots programmes",
          "physical fitness levels",
          "nationwide"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12nf_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"national team performance\"):\n\n\"Việc tài trợ cho các vận động viên đỉnh cao nhằm mục đích cải thiện thành tích của đội tuyển quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Funding elite athletes is intended to improve national team performance.",
        "explanationVi": "'National team performance' = thành tích của đội tuyển quốc gia. 'Be intended to + V' = nhằm mục đích.",
        "modelAnswer": "Funding elite athletes is intended to improve national team performance.",
        "fallbackKeywords": [
          "funding elite athletes",
          "national team performance"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12nf_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"childhood obesity prevention\"):\n\n\"Việc tài trợ cho thể thao phong trào cũng hỗ trợ phòng ngừa béo phì ở trẻ em.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Grassroots sports funding also supports childhood obesity prevention.",
        "explanationVi": "'Childhood obesity prevention' = phòng ngừa béo phì ở trẻ em. 'Support + N' = hỗ trợ.",
        "modelAnswer": "Grassroots sports funding also supports childhood obesity prevention.",
        "fallbackKeywords": [
          "grassroots sports funding",
          "childhood obesity prevention"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12nf_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"balanced funding approach\"):\n\n\"Nhiều chuyên gia khuyến nghị một cách tiếp cận tài trợ cân bằng cho cả hai mục tiêu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many experts recommend a balanced funding approach for both goals.",
        "explanationVi": "'Balanced funding approach' = cách tiếp cận tài trợ cân bằng. 'Recommend + N' = khuyến nghị.",
        "modelAnswer": "Many experts recommend a balanced funding approach for both goals.",
        "fallbackKeywords": [
          "balanced funding approach",
          "both goals"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 12,
    "block": "discuss_both_views",
    "topicName": "Economic Support: Higher Education vs. Vocational Training",
    "topicEmoji": "🎓",
    "essayType": "discuss_both_views",
    "prompt": "Some people contend that governments should invest more money in practical vocational training and trade skills, while others claim funding should prioritize university education. Discuss both views and give your opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 43,
    "vocabularyList": [
      {
        "term": "vocational training",
        "definitionVi": "đào tạo nghề",
        "example": "Some people believe governments should invest more in vocational training."
      },
      {
        "term": "trade skills",
        "definitionVi": "kỹ năng nghề nghiệp cụ thể",
        "example": "Trade skills such as plumbing and electrical work remain in high demand."
      },
      {
        "term": "university education",
        "definitionVi": "giáo dục đại học",
        "example": "Others claim funding should prioritize university education instead."
      },
      {
        "term": "skills shortage",
        "definitionVi": "tình trạng thiếu hụt kỹ năng",
        "example": "A skills shortage in trades has affected many industries."
      },
      {
        "term": "academic route",
        "definitionVi": "con đường học thuật",
        "example": "Not every student is suited to the academic route."
      },
      {
        "term": "apprenticeship programme",
        "definitionVi": "chương trình học nghề",
        "example": "Apprenticeship programmes combine on-the-job training with classroom learning."
      },
      {
        "term": "labour market needs",
        "definitionVi": "nhu cầu của thị trường lao động",
        "example": "Vocational training is often better aligned with labour market needs."
      },
      {
        "term": "student debt",
        "definitionVi": "nợ sinh viên",
        "example": "University graduates often face significant student debt."
      },
      {
        "term": "practical experience",
        "definitionVi": "kinh nghiệm thực tế",
        "example": "Vocational training provides more practical experience than a traditional degree."
      },
      {
        "term": "research capacity",
        "definitionVi": "năng lực nghiên cứu",
        "example": "Universities play a key role in building a nation's research capacity."
      },
      {
        "term": "employment rate",
        "definitionVi": "tỷ lệ có việc làm",
        "example": "Vocational graduates sometimes have a higher employment rate than university graduates."
      },
      {
        "term": "critical thinking skills",
        "definitionVi": "kỹ năng tư duy phản biện",
        "example": "University education is often praised for developing critical thinking skills."
      },
      {
        "term": "economic productivity",
        "definitionVi": "năng suất kinh tế",
        "example": "A skilled trade workforce contributes directly to economic productivity."
      },
      {
        "term": "career pathway",
        "definitionVi": "con đường sự nghiệp",
        "example": "Vocational training offers a clear career pathway into a specific trade."
      },
      {
        "term": "innovation-driven economy",
        "definitionVi": "nền kinh tế dựa trên đổi mới sáng tạo",
        "example": "Higher education supports the development of an innovation-driven economy."
      },
      {
        "term": "manual labour shortage",
        "definitionVi": "tình trạng thiếu hụt lao động chân tay",
        "example": "Many countries are facing a manual labour shortage in construction."
      },
      {
        "term": "tuition costs",
        "definitionVi": "chi phí học phí",
        "example": "High tuition costs discourage some students from attending university."
      },
      {
        "term": "hands-on training",
        "definitionVi": "đào tạo thực hành trực tiếp",
        "example": "Hands-on training helps students master practical trade skills quickly."
      },
      {
        "term": "social status",
        "definitionVi": "địa vị xã hội",
        "example": "University degrees are often associated with higher social status."
      },
      {
        "term": "dual education system",
        "definitionVi": "hệ thống giáo dục song song",
        "example": "A dual education system combines academic study with vocational training."
      },
      {
        "term": "meet the demands of the labour market",
        "definitionVi": "đáp ứng nhu cầu của thị trường lao động",
        "example": "Vocational courses are designed to meet the demands of the labour market."
      },
      {
        "term": "confer prestige on",
        "definitionVi": "mang lại uy tín cho",
        "example": "A university degree still confers prestige on graduates in many societies."
      },
      {
        "term": "narrow the skills gap",
        "definitionVi": "thu hẹp khoảng cách kỹ năng",
        "example": "Apprenticeships can help narrow the skills gap in technical industries."
      },
      {
        "term": "open doors to employment",
        "definitionVi": "mở ra cánh cửa việc làm",
        "example": "Vocational qualifications can open doors to stable employment quickly."
      },
      {
        "term": "carry equal weight",
        "definitionVi": "có giá trị ngang bằng nhau",
        "example": "Vocational and academic qualifications should carry equal weight."
      },
      {
        "term": "diversify the economy",
        "definitionVi": "đa dạng hóa nền kinh tế",
        "example": "A skilled trade workforce helps diversify the economy."
      },
      {
        "term": "steer students towards",
        "definitionVi": "hướng học sinh tới",
        "example": "Schools should not steer all students towards university by default."
      },
      {
        "term": "yield a strong return on investment",
        "definitionVi": "mang lại lợi tức đầu tư cao",
        "example": "Vocational training can yield a strong return on investment for students."
      },
      {
        "term": "bridge theory and practice",
        "definitionVi": "kết nối lý thuyết và thực hành",
        "example": "Apprenticeships help bridge theory and practice for young workers."
      },
      {
        "term": "future-proof the workforce",
        "definitionVi": "giúp lực lượng lao động thích ứng với tương lai",
        "example": "Investing in both paths can help future-proof the national workforce."
      }
    ],
    "questions": [
      {
        "questionId": "w12es_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Some people contend... while others claim... Discuss both views and give your opinion.\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Agree or Disagree",
          "Cause & Solution",
          "Effect & Solution"
        ],
        "baseWords": [],
        "correctAnswer": "Discuss Both Views",
        "explanationVi": "Cụm 'Discuss both views and give your opinion' là dấu hiệu nhận biết trực tiếp — bài viết cần phân tích cả hai quan điểm trước khi nêu ý kiến cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12es_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Some people contend that governments should invest more money in practical vocational training and trade _____.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "skills",
        "explanationVi": "'Trade skills' = kỹ năng nghề nghiệp cụ thể. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12es_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng chính phủ nên đầu tư nhiều hơn vào đào tạo nghề thực tiễn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that governments should invest more in practical vocational training.",
        "explanationVi": "'Invest in + N' = đầu tư vào. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "Some people believe that governments should invest more in practical vocational training.",
        "fallbackKeywords": [
          "invest more",
          "vocational training"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12es_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Những người khác lại cho rằng ngân sách nên ưu tiên cho giáo dục đại học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Others claim that funding should prioritize university education.",
        "explanationVi": "'Prioritize + N' = ưu tiên cho. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Others claim that funding should prioritize university education.",
        "fallbackKeywords": [
          "funding",
          "prioritize",
          "university education"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12es_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Không phải học sinh nào cũng phù hợp với con đường học thuật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not every student is suited to the academic route.",
        "explanationVi": "'Academic route' = con đường học thuật. 'Be suited to + N' = phù hợp với.",
        "modelAnswer": "Not every student is suited to the academic route.",
        "fallbackKeywords": [
          "academic route",
          "suited to"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12es_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Sinh viên tốt nghiệp đại học thường phải đối mặt với khoản nợ sinh viên đáng kể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "University graduates often face significant student debt.",
        "explanationVi": "'Student debt' = nợ sinh viên. 'Face + N' = phải đối mặt với.",
        "modelAnswer": "University graduates often face significant student debt.",
        "fallbackKeywords": [
          "university graduates",
          "student debt"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12es_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / by expanding / apprenticeship programmes / address the skills shortage / Governments]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments could address the skills shortage by expanding apprenticeship programmes.",
        "explanationVi": "'Subject + could + V + by + V-ing' diễn đạt giải pháp. 'Apprenticeship programmes' = chương trình học nghề.",
        "modelAnswer": "Governments could address the skills shortage by expanding apprenticeship programmes.",
        "fallbackKeywords": [
          "governments",
          "skills shortage",
          "apprenticeship programmes"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12es_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to fund both universities and vocational schools.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should fund both universities and vocational schools.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should fund both universities and vocational schools.",
        "fallbackKeywords": [
          "governments",
          "universities",
          "vocational schools"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12es_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"skills shortage\"):\n\n\"Tình trạng thiếu hụt kỹ năng trong các ngành nghề thủ công đã ảnh hưởng đến nhiều lĩnh vực.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A skills shortage in trades has affected many industries.",
        "explanationVi": "'Skills shortage' = tình trạng thiếu hụt kỹ năng. 'Affect + N' = ảnh hưởng đến.",
        "modelAnswer": "A skills shortage in trades has affected many industries.",
        "fallbackKeywords": [
          "skills shortage",
          "trades",
          "industries"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12es_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"labour market needs\"):\n\n\"Đào tạo nghề thường phù hợp hơn với nhu cầu của thị trường lao động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Vocational training is often better aligned with labour market needs.",
        "explanationVi": "'Labour market needs' = nhu cầu của thị trường lao động. 'Be aligned with' = phù hợp với.",
        "modelAnswer": "Vocational training is often better aligned with labour market needs.",
        "fallbackKeywords": [
          "vocational training",
          "labour market needs"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12es_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"practical experience\"):\n\n\"Đào tạo nghề mang lại nhiều kinh nghiệm thực tế hơn so với một tấm bằng đại học truyền thống.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Vocational training provides more practical experience than a traditional degree.",
        "explanationVi": "'Practical experience' = kinh nghiệm thực tế. 'A traditional degree' = một tấm bằng truyền thống.",
        "modelAnswer": "Vocational training provides more practical experience than a traditional degree.",
        "fallbackKeywords": [
          "practical experience",
          "traditional degree"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12es_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"research capacity\"):\n\n\"Các trường đại học đóng vai trò then chốt trong việc xây dựng năng lực nghiên cứu của một quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Universities play a key role in building a nation's research capacity.",
        "explanationVi": "'Research capacity' = năng lực nghiên cứu. 'Play a key role in' = đóng vai trò then chốt trong.",
        "modelAnswer": "Universities play a key role in building a nation's research capacity.",
        "fallbackKeywords": [
          "universities",
          "research capacity"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12es_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"employment rate\"):\n\n\"Sinh viên tốt nghiệp trường nghề đôi khi có tỷ lệ có việc làm cao hơn sinh viên đại học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Vocational graduates sometimes have a higher employment rate than university graduates.",
        "explanationVi": "'Employment rate' = tỷ lệ có việc làm. 'Higher than' = cao hơn so với.",
        "modelAnswer": "Vocational graduates sometimes have a higher employment rate than university graduates.",
        "fallbackKeywords": [
          "vocational graduates",
          "employment rate"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12es_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"critical thinking skills\"):\n\n\"Giáo dục đại học thường được đánh giá cao vì phát triển kỹ năng tư duy phản biện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "University education is often praised for developing critical thinking skills.",
        "explanationVi": "'Critical thinking skills' = kỹ năng tư duy phản biện. 'Be praised for + V-ing' = được đánh giá cao vì.",
        "modelAnswer": "University education is often praised for developing critical thinking skills.",
        "fallbackKeywords": [
          "university education",
          "critical thinking skills"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12es_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"economic productivity\"):\n\n\"Một lực lượng lao động có tay nghề đóng góp trực tiếp vào năng suất kinh tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A skilled trade workforce contributes directly to economic productivity.",
        "explanationVi": "'Economic productivity' = năng suất kinh tế. 'Contribute directly to' = đóng góp trực tiếp vào.",
        "modelAnswer": "A skilled trade workforce contributes directly to economic productivity.",
        "fallbackKeywords": [
          "skilled trade workforce",
          "economic productivity"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12es_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"career pathway\"):\n\n\"Đào tạo nghề mang lại một con đường sự nghiệp rõ ràng vào một ngành nghề cụ thể.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Vocational training offers a clear career pathway into a specific trade.",
        "explanationVi": "'Career pathway' = con đường sự nghiệp. 'Into a specific trade' = vào một ngành nghề cụ thể.",
        "modelAnswer": "Vocational training offers a clear career pathway into a specific trade.",
        "fallbackKeywords": [
          "career pathway",
          "specific trade"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12es_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"innovation-driven economy\"):\n\n\"Giáo dục đại học hỗ trợ sự phát triển của một nền kinh tế dựa trên đổi mới sáng tạo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Higher education supports the development of an innovation-driven economy.",
        "explanationVi": "'Innovation-driven economy' = nền kinh tế dựa trên đổi mới sáng tạo. 'Support the development of' = hỗ trợ sự phát triển của.",
        "modelAnswer": "Higher education supports the development of an innovation-driven economy.",
        "fallbackKeywords": [
          "higher education",
          "innovation-driven economy"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12es_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"manual labour shortage\"):\n\n\"Nhiều quốc gia đang phải đối mặt với tình trạng thiếu hụt lao động chân tay trong ngành xây dựng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many countries are facing a manual labour shortage in construction.",
        "explanationVi": "'Manual labour shortage' = tình trạng thiếu hụt lao động chân tay. 'Face + N' = đối mặt với.",
        "modelAnswer": "Many countries are facing a manual labour shortage in construction.",
        "fallbackKeywords": [
          "manual labour shortage",
          "construction"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12es_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"tuition costs\"):\n\n\"Chi phí học phí cao khiến một số học sinh e ngại việc theo học đại học.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High tuition costs discourage some students from attending university.",
        "explanationVi": "'Tuition costs' = chi phí học phí. 'Discourage + O + from + V-ing' = khiến ai e ngại làm gì.",
        "modelAnswer": "High tuition costs discourage some students from attending university.",
        "fallbackKeywords": [
          "tuition costs",
          "discourage",
          "university"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12es_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"dual education system\"):\n\n\"Một hệ thống giáo dục song song kết hợp việc học thuật với đào tạo nghề.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A dual education system combines academic study with vocational training.",
        "explanationVi": "'Dual education system' = hệ thống giáo dục song song. 'Combine A with B' = kết hợp A với B.",
        "modelAnswer": "A dual education system combines academic study with vocational training.",
        "fallbackKeywords": [
          "dual education system",
          "academic study",
          "vocational training"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 13,
    "block": "positive_or_negative_development",
    "topicName": "Rise in Eco-Tourism",
    "topicEmoji": "🌿",
    "essayType": "positive_or_negative_development",
    "prompt": "In recent years, eco-tourism has become increasingly popular around the world. Is this a positive or negative development?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 13,
    "vocabularyList": [
      {
        "term": "eco-tourism",
        "definitionVi": "du lịch sinh thái",
        "example": "Eco-tourism allows visitors to explore nature while minimising environmental harm."
      },
      {
        "term": "sustainable travel",
        "definitionVi": "du lịch bền vững",
        "example": "Sustainable travel encourages tourists to minimise their impact on the environment."
      },
      {
        "term": "natural habitat",
        "definitionVi": "môi trường sống tự nhiên",
        "example": "Eco-tourism encourages tourists to respect wildlife and their natural habitats."
      },
      {
        "term": "conservation efforts",
        "definitionVi": "nỗ lực bảo tồn",
        "example": "Tourism revenue can be used to fund conservation efforts."
      },
      {
        "term": "carbon footprint",
        "definitionVi": "dấu chân carbon",
        "example": "Flying to remote destinations significantly increases the carbon footprint of a trip."
      },
      {
        "term": "local economy",
        "definitionVi": "nền kinh tế địa phương",
        "example": "Eco-tourism creates jobs and boosts the local economy."
      },
      {
        "term": "wildlife preservation",
        "definitionVi": "bảo tồn động vật hoang dã",
        "example": "Many national parks rely on tourism revenue to support wildlife preservation."
      },
      {
        "term": "overtourism",
        "definitionVi": "du lịch quá tải",
        "example": "Overtourism can place enormous pressure on protected areas."
      },
      {
        "term": "environmental awareness",
        "definitionVi": "nhận thức về môi trường",
        "example": "Eco-tourism helps raise environmental awareness among both local communities and visitors."
      },
      {
        "term": "biodiversity",
        "definitionVi": "đa dạng sinh học",
        "example": "Protecting biodiversity should be a top priority when developing new eco-tourism destinations."
      },
      {
        "term": "eco-friendly accommodation",
        "definitionVi": "chỗ ở thân thiện môi trường",
        "example": "An increasing number of hotels offer eco-friendly accommodation to attract conscious tourists."
      },
      {
        "term": "cultural preservation",
        "definitionVi": "bảo tồn văn hóa",
        "example": "Eco-tourism can also contribute to the cultural preservation of indigenous communities."
      },
      {
        "term": "protected areas",
        "definitionVi": "khu vực được bảo vệ",
        "example": "Overtourism can place enormous pressure on protected areas."
      },
      {
        "term": "tourism revenue",
        "definitionVi": "doanh thu du lịch",
        "example": "Tourism revenue can be used to fund conservation efforts."
      },
      {
        "term": "ecological damage",
        "definitionVi": "thiệt hại sinh thái",
        "example": "If not managed carefully, eco-tourism can still cause serious ecological damage."
      },
      {
        "term": "sustainable practices",
        "definitionVi": "thực hành bền vững",
        "example": "The government should encourage tourism businesses to adopt more sustainable practices."
      },
      {
        "term": "fragile ecosystems",
        "definitionVi": "hệ sinh thái mong manh",
        "example": "Overtourism can lead to serious damage to fragile ecosystems."
      },
      {
        "term": "responsible tourism",
        "definitionVi": "du lịch có trách nhiệm",
        "example": "Responsible tourism strikes a balance between economic benefits and environmental protection."
      },
      {
        "term": "natural resources",
        "definitionVi": "tài nguyên thiên nhiên",
        "example": "Eco-tourism should not come at the expense of natural resources."
      },
      {
        "term": "environmental degradation",
        "definitionVi": "suy thoái môi trường",
        "example": "Poorly managed tourism can accelerate environmental degradation."
      },
      {
        "term": "generate much-needed revenue",
        "definitionVi": "tạo ra nguồn thu rất cần thiết",
        "example": "Eco-tourism can generate much-needed revenue for local communities."
      },
      {
        "term": "leave a light footprint",
        "definitionVi": "để lại tác động nhẹ nhàng đến môi trường",
        "example": "Responsible travellers try to leave a light footprint on the places they visit."
      },
      {
        "term": "come under increasing pressure",
        "definitionVi": "chịu áp lực ngày càng tăng",
        "example": "Popular eco-tourism sites have come under increasing pressure from visitors."
      },
      {
        "term": "safeguard natural heritage",
        "definitionVi": "bảo vệ di sản thiên nhiên",
        "example": "Strict regulations help safeguard natural heritage for future generations."
      },
      {
        "term": "strike a delicate balance",
        "definitionVi": "duy trì một sự cân bằng tinh tế",
        "example": "Eco-tourism must strike a delicate balance between profit and preservation."
      },
      {
        "term": "empower local communities",
        "definitionVi": "trao quyền cho cộng đồng địa phương",
        "example": "Well-managed eco-tourism can empower local communities economically."
      },
      {
        "term": "cap visitor numbers",
        "definitionVi": "giới hạn số lượng du khách",
        "example": "Some national parks cap visitor numbers to protect fragile ecosystems."
      },
      {
        "term": "raise environmental consciousness",
        "definitionVi": "nâng cao ý thức về môi trường",
        "example": "Guided eco-tours help raise environmental consciousness among tourists."
      },
      {
        "term": "exploit natural attractions",
        "definitionVi": "khai thác các điểm hấp dẫn tự nhiên",
        "example": "Some operators exploit natural attractions purely for profit."
      },
      {
        "term": "champion sustainable development",
        "definitionVi": "đề cao phát triển bền vững",
        "example": "Governments increasingly champion sustainable development in tourism policy."
      }
    ],
    "questions": [
      {
        "questionId": "w8ec_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"In recent years, eco-tourism has become increasingly popular around the world. Is this a positive or negative development?\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Cause & Solution",
          "Positive or Negative Development",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Positive or Negative Development",
        "explanationVi": "Câu hỏi 'Is this a positive or negative development?' là dấu hiệu nhận biết trực tiếp của dạng Positive or Negative Development — cần nêu MỘT lập trường rõ ràng, khác với Discuss Both Views (phân tích cả hai phía trước khi kết luận).",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w8ec_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"In recent years, eco-tourism has become an increasingly _____ trend around the world.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "popular",
        "explanationVi": "Lấy trực tiếp từ đề bài. 'Increasingly + adj' = ngày càng — cấu trúc câu mở bài rất phổ biến trong IELTS.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w8ec_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Du lịch sinh thái đã trở nên ngày càng phổ biến trên khắp thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism has become increasingly popular around the world.",
        "explanationVi": "'Increasingly + adj' = ngày càng. Câu lấy gần như trực tiếp từ đề bài — cách paraphrase thesis đơn giản và an toàn.",
        "modelAnswer": "Eco-tourism has become increasingly popular around the world.",
        "fallbackKeywords": [
          "eco-tourism",
          "increasingly popular",
          "around the world"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w8ec_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi tin rằng đây là một sự phát triển tích cực vì nó mang lại lợi ích cho cả môi trường và nền kinh tế địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe this is a positive development because it benefits both the environment and the local economy.",
        "explanationVi": "'I believe this is a positive/negative development because...' là câu nêu quan điểm chuẩn cho dạng bài này. 'Benefit + N' = mang lại lợi ích cho.",
        "modelAnswer": "I believe this is a positive development because it benefits both the environment and the local economy.",
        "fallbackKeywords": [
          "positive development",
          "benefits",
          "local economy"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w8ec_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Du lịch sinh thái khuyến khích khách du lịch tôn trọng động vật hoang dã và môi trường sống tự nhiên của chúng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism encourages tourists to respect wildlife and their natural habitats.",
        "explanationVi": "'Encourage + O + to V' = khuyến khích ai làm gì. 'Natural habitat' = môi trường sống tự nhiên.",
        "modelAnswer": "Eco-tourism encourages tourists to respect wildlife and their natural habitats.",
        "fallbackKeywords": [
          "eco-tourism",
          "respect wildlife",
          "natural habitats"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w8ec_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Doanh thu từ du lịch có thể được sử dụng để tài trợ cho các nỗ lực bảo tồn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Tourism revenue can be used to fund conservation efforts.",
        "explanationVi": "'Tourism revenue' = doanh thu du lịch. 'Fund + N' = tài trợ cho. 'Conservation efforts' = nỗ lực bảo tồn.",
        "modelAnswer": "Tourism revenue can be used to fund conservation efforts.",
        "fallbackKeywords": [
          "tourism revenue",
          "fund",
          "conservation efforts"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w8ec_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[Overtourism / can / lead to / serious damage / to fragile ecosystems]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overtourism can lead to serious damage to fragile ecosystems.",
        "explanationVi": "'Lead to + N' = dẫn đến. 'Fragile ecosystems' = hệ sinh thái mong manh. 'Overtourism' = du lịch quá tải.",
        "modelAnswer": "Overtourism can lead to serious damage to fragile ecosystems.",
        "fallbackKeywords": [
          "overtourism",
          "lead to",
          "fragile ecosystems"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w8ec_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Eco-tourism can helps protect natural resources and support local communities.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism can help protect natural resources and support local communities.",
        "explanationVi": "Lỗi: Sau modal verb 'can' KHÔNG chia động từ. Cấu trúc: 'can + bare infinitive' → 'help', không phải 'helps'.",
        "modelAnswer": "Eco-tourism can help protect natural resources and support local communities.",
        "fallbackKeywords": [
          "eco-tourism",
          "protect",
          "natural resources"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w8ec_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sustainable travel\"):\n\n\"Du lịch bền vững khuyến khích khách du lịch giảm thiểu tác động của họ đến môi trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sustainable travel encourages tourists to minimise their impact on the environment.",
        "explanationVi": "'Sustainable travel' = du lịch bền vững. 'Minimise + N' = giảm thiểu. 'Impact on + N' = tác động đến.",
        "modelAnswer": "Sustainable travel encourages tourists to minimise their impact on the environment.",
        "fallbackKeywords": [
          "sustainable travel",
          "minimise",
          "impact"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w8ec_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"carbon footprint\"):\n\n\"Đi máy bay đến những điểm du lịch xa xôi làm tăng đáng kể dấu chân carbon của một chuyến đi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Flying to remote destinations significantly increases the carbon footprint of a trip.",
        "explanationVi": "'Carbon footprint' = dấu chân carbon, lượng khí thải carbon một hoạt động gây ra. 'Significantly increase' = làm tăng đáng kể.",
        "modelAnswer": "Flying to remote destinations significantly increases the carbon footprint of a trip.",
        "fallbackKeywords": [
          "carbon footprint",
          "remote destinations",
          "significantly increases"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w8ec_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"local economy\"):\n\n\"Du lịch sinh thái tạo ra việc làm và thúc đẩy nền kinh tế địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism creates jobs and boosts the local economy.",
        "explanationVi": "'Boost + N' = thúc đẩy — mạnh hơn 'help'. 'Local economy' = nền kinh tế địa phương.",
        "modelAnswer": "Eco-tourism creates jobs and boosts the local economy.",
        "fallbackKeywords": [
          "eco-tourism",
          "local economy",
          "boosts"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w8ec_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"overtourism\"):\n\n\"Du lịch quá tải có thể gây áp lực lớn lên các khu vực được bảo vệ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Overtourism can place enormous pressure on protected areas.",
        "explanationVi": "'Overtourism' = du lịch quá tải. 'Place pressure on' = gây áp lực lên. 'Protected areas' = khu vực được bảo vệ.",
        "modelAnswer": "Overtourism can place enormous pressure on protected areas.",
        "fallbackKeywords": [
          "overtourism",
          "enormous pressure",
          "protected areas"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w8ec_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"wildlife preservation\"):\n\n\"Nhiều công viên quốc gia dựa vào doanh thu du lịch để hỗ trợ công tác bảo tồn động vật hoang dã.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many national parks rely on tourism revenue to support wildlife preservation.",
        "explanationVi": "'Rely on + N' = dựa vào. 'Wildlife preservation' = bảo tồn động vật hoang dã.",
        "modelAnswer": "Many national parks rely on tourism revenue to support wildlife preservation.",
        "fallbackKeywords": [
          "national parks",
          "tourism revenue",
          "wildlife preservation"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w8ec_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"eco-friendly accommodation\"):\n\n\"Ngày càng nhiều khách sạn cung cấp chỗ ở thân thiện với môi trường để thu hút khách du lịch có ý thức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An increasing number of hotels offer eco-friendly accommodation to attract environmentally conscious tourists.",
        "explanationVi": "'Eco-friendly accommodation' = chỗ ở thân thiện môi trường. 'Environmentally conscious' = có ý thức về môi trường.",
        "modelAnswer": "An increasing number of hotels offer eco-friendly accommodation to attract environmentally conscious tourists.",
        "fallbackKeywords": [
          "eco-friendly accommodation",
          "attract",
          "environmentally conscious"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w8ec_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"environmental awareness\"):\n\n\"Du lịch sinh thái giúp nâng cao nhận thức về môi trường trong cộng đồng địa phương và du khách.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism helps raise environmental awareness among both local communities and visitors.",
        "explanationVi": "'Raise awareness' = nâng cao nhận thức. 'Among + N' = trong số/trong cộng đồng.",
        "modelAnswer": "Eco-tourism helps raise environmental awareness among both local communities and visitors.",
        "fallbackKeywords": [
          "environmental awareness",
          "local communities",
          "visitors"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w8ec_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cultural preservation\"):\n\n\"Du lịch sinh thái cũng có thể góp phần vào việc bảo tồn văn hóa của các cộng đồng bản địa.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Eco-tourism can also contribute to the cultural preservation of indigenous communities.",
        "explanationVi": "'Contribute to + N' = góp phần vào. 'Cultural preservation' = bảo tồn văn hóa. 'Indigenous communities' = cộng đồng bản địa.",
        "modelAnswer": "Eco-tourism can also contribute to the cultural preservation of indigenous communities.",
        "fallbackKeywords": [
          "cultural preservation",
          "indigenous communities",
          "contribute"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w8ec_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"biodiversity\"):\n\n\"Bảo vệ đa dạng sinh học nên là ưu tiên hàng đầu khi phát triển các điểm du lịch sinh thái mới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Protecting biodiversity should be a top priority when developing new eco-tourism destinations.",
        "explanationVi": "'Biodiversity' = đa dạng sinh học. 'A top priority' = ưu tiên hàng đầu.",
        "modelAnswer": "Protecting biodiversity should be a top priority when developing new eco-tourism destinations.",
        "fallbackKeywords": [
          "biodiversity",
          "top priority",
          "eco-tourism destinations"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w8ec_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sustainable practices\"):\n\n\"Chính phủ nên khuyến khích các doanh nghiệp du lịch áp dụng những thực hành bền vững hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should encourage tourism businesses to adopt more sustainable practices.",
        "explanationVi": "'Adopt practices' = áp dụng các thực hành/phương pháp. 'Sustainable practices' = thực hành bền vững.",
        "modelAnswer": "The government should encourage tourism businesses to adopt more sustainable practices.",
        "fallbackKeywords": [
          "sustainable practices",
          "encourage",
          "tourism businesses"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w8ec_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"ecological damage\"):\n\n\"Nếu không được quản lý cẩn thận, du lịch sinh thái vẫn có thể gây ra thiệt hại sinh thái nghiêm trọng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If not managed carefully, eco-tourism can still cause serious ecological damage.",
        "explanationVi": "'If not managed carefully' = nếu không được quản lý cẩn thận (mệnh đề điều kiện rút gọn). 'Ecological damage' = thiệt hại sinh thái.",
        "modelAnswer": "If not managed carefully, eco-tourism can still cause serious ecological damage.",
        "fallbackKeywords": [
          "not managed carefully",
          "ecological damage",
          "serious"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w8ec_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"responsible tourism\"):\n\n\"Du lịch có trách nhiệm cân bằng giữa lợi ích kinh tế với việc bảo vệ môi trường tự nhiên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Responsible tourism strikes a balance between economic benefits and the protection of the natural environment.",
        "explanationVi": "'Responsible tourism' = du lịch có trách nhiệm. 'Strike a balance between A and B' = cân bằng giữa A và B.",
        "modelAnswer": "Responsible tourism strikes a balance between economic benefits and the protection of the natural environment.",
        "fallbackKeywords": [
          "responsible tourism",
          "strikes a balance",
          "natural environment"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 13,
    "block": "positive_or_negative_development",
    "topicName": "Transition to Electric Vehicles",
    "topicEmoji": "🔋",
    "essayType": "positive_or_negative_development",
    "prompt": "Many governments are promoting the use of electric vehicles to combat air pollution and reduce carbon emissions. Is this a positive or negative development?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 26,
    "vocabularyList": [
      {
        "term": "electric vehicle",
        "definitionVi": "xe điện",
        "example": "Many governments are promoting the use of electric vehicles to combat air pollution."
      },
      {
        "term": "carbon emissions",
        "definitionVi": "khí thải carbon",
        "example": "Switching to electric vehicles can significantly reduce the amount of greenhouse gases produced by transportation."
      },
      {
        "term": "air pollution",
        "definitionVi": "ô nhiễm không khí",
        "example": "Many governments are promoting the use of electric vehicles to reduce air pollution."
      },
      {
        "term": "fossil fuels",
        "definitionVi": "nhiên liệu hóa thạch",
        "example": "Unlike combustion engines, electric vehicles do not burn fossil fuels."
      },
      {
        "term": "charging infrastructure",
        "definitionVi": "cơ sở hạ tầng sạc điện",
        "example": "The adoption of electric vehicles requires significant investment in charging infrastructure."
      },
      {
        "term": "battery technology",
        "definitionVi": "công nghệ pin",
        "example": "Advances in battery technology have enabled electric vehicles to travel longer distances."
      },
      {
        "term": "greenhouse gases",
        "definitionVi": "khí nhà kính",
        "example": "Switching to electric vehicles can significantly reduce the amount of greenhouse gases produced by transportation."
      },
      {
        "term": "government subsidies",
        "definitionVi": "trợ cấp của chính phủ",
        "example": "The government is offering subsidies to encourage people to buy electric vehicles."
      },
      {
        "term": "renewable electricity",
        "definitionVi": "điện năng tái tạo",
        "example": "The environmental benefits of electric vehicles depend on whether the electricity used comes from renewable sources."
      },
      {
        "term": "combustion engine",
        "definitionVi": "động cơ đốt trong",
        "example": "Unlike combustion engines, electric vehicles do not burn fossil fuels."
      },
      {
        "term": "air quality",
        "definitionVi": "chất lượng không khí",
        "example": "Using more electric vehicles could significantly improve air quality in major cities."
      },
      {
        "term": "battery disposal",
        "definitionVi": "việc xử lý pin thải",
        "example": "Improper battery disposal can create new environmental problems."
      },
      {
        "term": "rare earth minerals",
        "definitionVi": "khoáng sản đất hiếm",
        "example": "Manufacturing electric vehicle batteries requires mining rare earth minerals, which also harms the environment."
      },
      {
        "term": "mass adoption",
        "definitionVi": "sự áp dụng rộng rãi",
        "example": "The mass adoption of electric vehicles could significantly reduce a country's dependence on oil."
      },
      {
        "term": "energy consumption",
        "definitionVi": "mức tiêu thụ năng lượng",
        "example": "Governments need to monitor energy consumption as the number of electric vehicles increases."
      },
      {
        "term": "clean energy",
        "definitionVi": "năng lượng sạch",
        "example": "Electric vehicles are only truly clean when powered by clean energy sources."
      },
      {
        "term": "urban congestion",
        "definitionVi": "tắc nghẽn đô thị",
        "example": "Electric vehicles alone do not solve the problem of urban congestion."
      },
      {
        "term": "manufacturing costs",
        "definitionVi": "chi phí sản xuất",
        "example": "High manufacturing costs remain a major barrier to widespread electric vehicle adoption."
      },
      {
        "term": "long-term investment",
        "definitionVi": "đầu tư dài hạn",
        "example": "Many experts view electric vehicles as a wise long-term investment for both individuals and society."
      },
      {
        "term": "sustainable transportation",
        "definitionVi": "giao thông bền vững",
        "example": "Electric vehicles are a key part of the shift towards sustainable transportation."
      },
      {
        "term": "accelerate the shift towards",
        "definitionVi": "đẩy nhanh sự chuyển đổi hướng tới",
        "example": "Government incentives can accelerate the shift towards electric vehicles."
      },
      {
        "term": "wean the economy off",
        "definitionVi": "cai (sự phụ thuộc) của nền kinh tế khỏi",
        "example": "Countries are trying to wean the economy off fossil fuels."
      },
      {
        "term": "come with a hefty upfront cost",
        "definitionVi": "đi kèm với chi phí ban đầu lớn",
        "example": "Electric vehicles still come with a hefty upfront cost for many buyers."
      },
      {
        "term": "roll out charging infrastructure",
        "definitionVi": "triển khai cơ sở hạ tầng sạc điện",
        "example": "Governments must roll out charging infrastructure to support EV adoption."
      },
      {
        "term": "curb harmful emissions",
        "definitionVi": "kiềm chế khí thải độc hại",
        "example": "Electric vehicles help curb harmful emissions in city centres."
      },
      {
        "term": "phase out combustion engines",
        "definitionVi": "loại bỏ dần động cơ đốt trong",
        "example": "Several nations plan to phase out combustion engines by 2035."
      },
      {
        "term": "spark a green revolution",
        "definitionVi": "khơi mào một cuộc cách mạng xanh",
        "example": "The rise of EVs could spark a green revolution in transportation."
      },
      {
        "term": "raise questions about",
        "definitionVi": "đặt ra những câu hỏi về",
        "example": "Battery production raises questions about the true environmental cost of EVs."
      },
      {
        "term": "close the price gap between",
        "definitionVi": "thu hẹp khoảng cách giá giữa",
        "example": "Falling battery costs are closing the price gap between EVs and petrol cars."
      },
      {
        "term": "future-proof transportation systems",
        "definitionVi": "giúp hệ thống giao thông thích ứng với tương lai",
        "example": "Investing in EVs helps future-proof national transportation systems."
      }
    ],
    "questions": [
      {
        "questionId": "w8ev_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Many governments are promoting the use of electric vehicles to combat air pollution and reduce carbon emissions. Is this a positive or negative development?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Effect",
          "Advantages & Disadvantages",
          "Positive or Negative Development",
          "Discuss Both Views"
        ],
        "baseWords": [],
        "correctAnswer": "Positive or Negative Development",
        "explanationVi": "Câu hỏi 'Is this a positive or negative development?' xác định rõ đây là dạng Positive or Negative Development — cần chọn MỘT lập trường rõ ràng, không phân tích cả hai mặt như Discuss Both Views.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w8ev_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Many governments are promoting the use of electric vehicles to _____ air pollution and reduce carbon emissions.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "combat",
        "explanationVi": "'Combat + N' = chống lại, đối phó với. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w8ev_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều chính phủ đang khuyến khích sử dụng xe điện để giảm ô nhiễm không khí.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many governments are promoting the use of electric vehicles to reduce air pollution.",
        "explanationVi": "'Promote the use of + N' = khuyến khích sử dụng. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "Many governments are promoting the use of electric vehicles to reduce air pollution.",
        "fallbackKeywords": [
          "governments",
          "promoting",
          "electric vehicles",
          "air pollution"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w8ev_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi cho rằng đây là một sự phát triển tích cực vì nó giúp giảm khí thải carbon.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe this is a positive development because it helps reduce carbon emissions.",
        "explanationVi": "Câu nêu quan điểm chuẩn cho dạng Positive or Negative Development. 'Carbon emissions' = khí thải carbon.",
        "modelAnswer": "I believe this is a positive development because it helps reduce carbon emissions.",
        "fallbackKeywords": [
          "positive development",
          "reduce",
          "carbon emissions"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w8ev_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Xe điện không thải ra khí độc hại từ ống xả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Electric vehicles do not emit harmful exhaust fumes.",
        "explanationVi": "'Emit + N' = thải ra. 'Exhaust fumes' = khí thải từ ống xả xe.",
        "modelAnswer": "Electric vehicles do not emit harmful exhaust fumes.",
        "fallbackKeywords": [
          "electric vehicles",
          "emit",
          "exhaust fumes"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w8ev_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Chính phủ đang cung cấp trợ cấp để khuyến khích người dân mua xe điện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government is offering subsidies to encourage people to buy electric vehicles.",
        "explanationVi": "'Offer subsidies' = cung cấp trợ cấp. 'Encourage + O + to V' = khuyến khích ai làm gì.",
        "modelAnswer": "The government is offering subsidies to encourage people to buy electric vehicles.",
        "fallbackKeywords": [
          "government",
          "subsidies",
          "encourage"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w8ev_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[requires / of electric vehicles / significant investment / charging infrastructure / The adoption / in]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The adoption of electric vehicles requires significant investment in charging infrastructure.",
        "explanationVi": "'The adoption of + N' = việc áp dụng. 'Charging infrastructure' = cơ sở hạ tầng sạc điện.",
        "modelAnswer": "The adoption of electric vehicles requires significant investment in charging infrastructure.",
        "fallbackKeywords": [
          "adoption",
          "electric vehicles",
          "charging infrastructure"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w8ev_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Governments should to invest more in charging infrastructure.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should invest more in charging infrastructure.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Governments should invest more in charging infrastructure.",
        "fallbackKeywords": [
          "governments",
          "invest",
          "charging infrastructure"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w8ev_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"combustion engine\"):\n\n\"Không giống như động cơ đốt trong, xe điện không đốt nhiên liệu hóa thạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike combustion engines, electric vehicles do not burn fossil fuels.",
        "explanationVi": "'Unlike + N' = không giống như. 'Combustion engine' = động cơ đốt trong. 'Burn fossil fuels' = đốt nhiên liệu hóa thạch.",
        "modelAnswer": "Unlike combustion engines, electric vehicles do not burn fossil fuels.",
        "fallbackKeywords": [
          "combustion engines",
          "fossil fuels"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w8ev_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"battery technology\"):\n\n\"Những tiến bộ trong công nghệ pin đã giúp xe điện đi được quãng đường xa hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Advances in battery technology have enabled electric vehicles to travel longer distances.",
        "explanationVi": "'Advances in + N' = những tiến bộ trong. 'Enable + O + to V' = giúp/cho phép ai làm gì.",
        "modelAnswer": "Advances in battery technology have enabled electric vehicles to travel longer distances.",
        "fallbackKeywords": [
          "advances",
          "battery technology",
          "longer distances"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w8ev_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"greenhouse gases\"):\n\n\"Chuyển sang xe điện có thể làm giảm đáng kể lượng khí nhà kính thải ra từ giao thông.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Switching to electric vehicles can significantly reduce the amount of greenhouse gases produced by transportation.",
        "explanationVi": "'Switch to + N' = chuyển sang. 'Greenhouse gases' = khí nhà kính. 'Produced by + N' = được tạo ra bởi.",
        "modelAnswer": "Switching to electric vehicles can significantly reduce the amount of greenhouse gases produced by transportation.",
        "fallbackKeywords": [
          "switching",
          "greenhouse gases",
          "transportation"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w8ev_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"renewable electricity\"):\n\n\"Lợi ích môi trường của xe điện phụ thuộc vào việc điện năng sử dụng có đến từ nguồn tái tạo hay không.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The environmental benefits of electric vehicles depend on whether the electricity used comes from renewable sources.",
        "explanationVi": "'Depend on whether' = phụ thuộc vào việc liệu. 'Renewable electricity/sources' = điện năng/nguồn tái tạo.",
        "modelAnswer": "The environmental benefits of electric vehicles depend on whether the electricity used comes from renewable sources.",
        "fallbackKeywords": [
          "environmental benefits",
          "depend on",
          "renewable sources"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w8ev_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"rare earth minerals\"):\n\n\"Việc sản xuất pin xe điện đòi hỏi khai thác các khoáng sản đất hiếm, điều này cũng gây hại cho môi trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Manufacturing electric vehicle batteries requires mining rare earth minerals, which also harms the environment.",
        "explanationVi": "'Rare earth minerals' = khoáng sản đất hiếm. Mệnh đề quan hệ 'which also harms...' bổ nghĩa cho cả vế trước.",
        "modelAnswer": "Manufacturing electric vehicle batteries requires mining rare earth minerals, which also harms the environment.",
        "fallbackKeywords": [
          "manufacturing",
          "rare earth minerals",
          "harms the environment"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w8ev_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"battery disposal\"):\n\n\"Việc xử lý pin thải không đúng cách có thể tạo ra những vấn đề môi trường mới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improper battery disposal can create new environmental problems.",
        "explanationVi": "'Battery disposal' = việc xử lý pin thải. 'Improper + N' = không đúng cách.",
        "modelAnswer": "Improper battery disposal can create new environmental problems.",
        "fallbackKeywords": [
          "improper",
          "battery disposal",
          "environmental problems"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w8ev_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mass adoption\"):\n\n\"Việc áp dụng rộng rãi xe điện có thể làm giảm đáng kể sự phụ thuộc của một quốc gia vào dầu mỏ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The mass adoption of electric vehicles could significantly reduce a country's dependence on oil.",
        "explanationVi": "'Mass adoption' = sự áp dụng rộng rãi. 'Dependence on + N' = sự phụ thuộc vào.",
        "modelAnswer": "The mass adoption of electric vehicles could significantly reduce a country's dependence on oil.",
        "fallbackKeywords": [
          "mass adoption",
          "dependence on oil"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w8ev_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban congestion\"):\n\n\"Xe điện tự thân nó không giải quyết được vấn đề tắc nghẽn giao thông đô thị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Electric vehicles alone do not solve the problem of urban congestion.",
        "explanationVi": "'Alone' đặt sau danh từ nhấn mạnh 'chỉ riêng nó'. 'Urban congestion' = tắc nghẽn đô thị.",
        "modelAnswer": "Electric vehicles alone do not solve the problem of urban congestion.",
        "fallbackKeywords": [
          "electric vehicles",
          "urban congestion",
          "alone"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w8ev_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"manufacturing costs\"):\n\n\"Chi phí sản xuất cao vẫn là một rào cản lớn đối với việc áp dụng xe điện rộng rãi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High manufacturing costs remain a major barrier to widespread electric vehicle adoption.",
        "explanationVi": "'Manufacturing costs' = chi phí sản xuất. 'A barrier to + N' = rào cản đối với.",
        "modelAnswer": "High manufacturing costs remain a major barrier to widespread electric vehicle adoption.",
        "fallbackKeywords": [
          "manufacturing costs",
          "major barrier",
          "widespread adoption"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w8ev_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"long-term investment\"):\n\n\"Nhiều chuyên gia coi xe điện là một khoản đầu tư dài hạn khôn ngoan cho cả cá nhân và xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many experts view electric vehicles as a wise long-term investment for both individuals and society.",
        "explanationVi": "'View + O + as + N' = coi cái gì là gì. 'Long-term investment' = khoản đầu tư dài hạn.",
        "modelAnswer": "Many experts view electric vehicles as a wise long-term investment for both individuals and society.",
        "fallbackKeywords": [
          "experts",
          "long-term investment",
          "individuals and society"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w8ev_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"air quality\"):\n\n\"Sử dụng nhiều xe điện hơn có thể cải thiện đáng kể chất lượng không khí ở các thành phố lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Using more electric vehicles could significantly improve air quality in major cities.",
        "explanationVi": "'Air quality' = chất lượng không khí. 'Significantly improve' = cải thiện đáng kể.",
        "modelAnswer": "Using more electric vehicles could significantly improve air quality in major cities.",
        "fallbackKeywords": [
          "air quality",
          "major cities",
          "significantly improve"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w8ev_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"energy consumption\"):\n\n\"Chính phủ cần theo dõi mức tiêu thụ năng lượng khi số lượng xe điện tăng lên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments need to monitor energy consumption as the number of electric vehicles increases.",
        "explanationVi": "'Monitor + N' = theo dõi, giám sát. 'Energy consumption' = mức tiêu thụ năng lượng. 'As + Clause' = khi/trong khi.",
        "modelAnswer": "Governments need to monitor energy consumption as the number of electric vehicles increases.",
        "fallbackKeywords": [
          "monitor",
          "energy consumption",
          "electric vehicles increase"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 14,
    "block": "positive_or_negative_development",
    "topicName": "Growth of Renewable Energy Infrastructure",
    "topicEmoji": "☀️",
    "essayType": "positive_or_negative_development",
    "prompt": "Although fossil fuels are still the main source of energy in most countries, some have started to rely more on renewable sources such as wind and solar power. Is this a positive or negative development?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 27,
    "vocabularyList": [
      {
        "term": "renewable energy",
        "definitionVi": "năng lượng tái tạo",
        "example": "More countries are investing heavily in renewable energy sources rather than traditional fossil fuels."
      },
      {
        "term": "solar power",
        "definitionVi": "năng lượng mặt trời",
        "example": "Solar power and wind power do not produce greenhouse gas emissions."
      },
      {
        "term": "wind power",
        "definitionVi": "năng lượng gió",
        "example": "Solar power and wind power do not produce greenhouse gas emissions."
      },
      {
        "term": "fossil fuels",
        "definitionVi": "nhiên liệu hóa thạch",
        "example": "Unlike non-renewable resources, solar and wind energy will never run out, unlike fossil fuels."
      },
      {
        "term": "energy infrastructure",
        "definitionVi": "cơ sở hạ tầng năng lượng",
        "example": "Investing in renewable energy infrastructure can create thousands of new jobs."
      },
      {
        "term": "energy security",
        "definitionVi": "an ninh năng lượng",
        "example": "Developing domestic renewable energy can improve a country's energy security."
      },
      {
        "term": "grid stability",
        "definitionVi": "sự ổn định của lưới điện",
        "example": "The intermittent supply from wind and solar power can pose challenges for grid stability."
      },
      {
        "term": "initial investment costs",
        "definitionVi": "chi phí đầu tư ban đầu",
        "example": "Initial investment costs for renewable energy projects are often very high."
      },
      {
        "term": "non-renewable resources",
        "definitionVi": "tài nguyên không tái tạo",
        "example": "Unlike non-renewable resources, solar and wind energy will never run out."
      },
      {
        "term": "energy storage",
        "definitionVi": "lưu trữ năng lượng",
        "example": "Advanced energy storage technology can help solve the problem of unstable supply."
      },
      {
        "term": "climate change mitigation",
        "definitionVi": "giảm thiểu biến đổi khí hậu",
        "example": "Investing in renewable energy is a crucial step in climate change mitigation."
      },
      {
        "term": "job creation",
        "definitionVi": "tạo việc làm",
        "example": "The renewable energy industry has contributed significantly to job creation worldwide."
      },
      {
        "term": "energy efficiency",
        "definitionVi": "hiệu quả năng lượng",
        "example": "Improving energy efficiency is just as important as switching to renewable sources."
      },
      {
        "term": "clean energy transition",
        "definitionVi": "quá trình chuyển đổi sang năng lượng sạch",
        "example": "The clean energy transition requires close cooperation between governments and businesses."
      },
      {
        "term": "intermittent energy supply",
        "definitionVi": "nguồn cung năng lượng không liên tục",
        "example": "Intermittent energy supply remains one of the biggest challenges of renewable energy."
      },
      {
        "term": "sustainable power generation",
        "definitionVi": "sản xuất điện bền vững",
        "example": "Sustainable power generation will play a key role in the world's energy future."
      },
      {
        "term": "long-term sustainability",
        "definitionVi": "tính bền vững lâu dài",
        "example": "In terms of long-term sustainability, renewable energy clearly outperforms fossil fuels."
      },
      {
        "term": "greenhouse gas emissions",
        "definitionVi": "khí thải nhà kính",
        "example": "Solar power and wind power do not produce greenhouse gas emissions."
      },
      {
        "term": "energy independence",
        "definitionVi": "sự tự chủ về năng lượng",
        "example": "Renewable energy can help a country move towards energy independence."
      },
      {
        "term": "carbon footprint",
        "definitionVi": "dấu chân carbon",
        "example": "Renewable energy significantly reduces a country's overall carbon footprint."
      },
      {
        "term": "harness natural resources",
        "definitionVi": "khai thác nguồn tài nguyên tự nhiên",
        "example": "Wind farms harness natural resources to generate clean electricity."
      },
      {
        "term": "reduce dependence on fossil fuels",
        "definitionVi": "giảm sự phụ thuộc vào nhiên liệu hóa thạch",
        "example": "Solar power helps reduce dependence on fossil fuels significantly."
      },
      {
        "term": "drive down energy costs",
        "definitionVi": "kéo giảm chi phí năng lượng",
        "example": "Advances in technology continue to drive down renewable energy costs."
      },
      {
        "term": "secure energy independence",
        "definitionVi": "đảm bảo sự tự chủ về năng lượng",
        "example": "Investing in renewables can help a country secure energy independence."
      },
      {
        "term": "cushion against price shocks",
        "definitionVi": "giảm nhẹ tác động từ những cú sốc giá cả",
        "example": "Renewable energy can cushion economies against oil price shocks."
      },
      {
        "term": "scale up production",
        "definitionVi": "mở rộng quy mô sản xuất",
        "example": "Governments are helping firms scale up solar panel production."
      },
      {
        "term": "yield substantial environmental benefits",
        "definitionVi": "mang lại lợi ích môi trường đáng kể",
        "example": "Wind power yields substantial environmental benefits over coal."
      },
      {
        "term": "commit to net-zero targets",
        "definitionVi": "cam kết thực hiện mục tiêu phát thải ròng bằng 0",
        "example": "Many countries have committed to net-zero targets by mid-century."
      },
      {
        "term": "overhaul the energy grid",
        "definitionVi": "cải tổ toàn diện lưới điện",
        "example": "A shift to renewables requires countries to overhaul the energy grid."
      },
      {
        "term": "attract green investment",
        "definitionVi": "thu hút đầu tư xanh",
        "example": "Clear policies can attract green investment from international firms."
      }
    ],
    "questions": [
      {
        "questionId": "w8re_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"More countries are investing heavily in renewable energy sources, such as wind and solar power, rather than traditional fossil fuels. Is this a positive or negative development?\" — Đây là dạng essay nào?",
        "options": [
          "Cause & Solution",
          "Positive or Negative Development",
          "Effect & Solution",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Positive or Negative Development",
        "explanationVi": "Câu hỏi 'Is this a positive or negative development?' là dấu hiệu nhận biết trực tiếp — bài viết cần đưa ra MỘT lập trường rõ ràng xuyên suốt, không hỏi nguyên nhân ('causes') hay giải pháp ('solutions').",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w8re_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"More countries are investing _____ in renewable energy sources rather than traditional fossil fuels.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "heavily",
        "explanationVi": "'Invest heavily in' = đầu tư mạnh vào. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w8re_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày càng nhiều quốc gia đang đầu tư mạnh vào năng lượng tái tạo thay vì nhiên liệu hóa thạch truyền thống.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More and more countries are investing heavily in renewable energy instead of traditional fossil fuels.",
        "explanationVi": "'More and more + N' = ngày càng nhiều. 'Instead of' = thay vì. Câu paraphrase gần trực tiếp từ đề bài.",
        "modelAnswer": "More and more countries are investing heavily in renewable energy instead of traditional fossil fuels.",
        "fallbackKeywords": [
          "renewable energy",
          "invest heavily",
          "fossil fuels"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w8re_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi tin rằng đây là một sự phát triển tích cực vì nó giúp bảo vệ hành tinh khỏi biến đổi khí hậu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe this is a positive development because it helps protect the planet from climate change.",
        "explanationVi": "Câu nêu quan điểm chuẩn cho dạng Positive or Negative Development. 'Protect the planet from + N' = bảo vệ hành tinh khỏi.",
        "modelAnswer": "I believe this is a positive development because it helps protect the planet from climate change.",
        "fallbackKeywords": [
          "positive development",
          "protect the planet",
          "climate change"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w8re_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Năng lượng mặt trời và năng lượng gió không thải ra khí nhà kính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Solar power and wind power do not produce greenhouse gas emissions.",
        "explanationVi": "'Produce emissions' = thải ra khí thải. 'Greenhouse gas emissions' = khí thải nhà kính.",
        "modelAnswer": "Solar power and wind power do not produce greenhouse gas emissions.",
        "fallbackKeywords": [
          "solar power",
          "wind power",
          "greenhouse gas emissions"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w8re_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Đầu tư vào cơ sở hạ tầng năng lượng tái tạo có thể tạo ra hàng nghìn việc làm mới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investing in renewable energy infrastructure can create thousands of new jobs.",
        "explanationVi": "'Invest in + N' = đầu tư vào. 'Energy infrastructure' = cơ sở hạ tầng năng lượng.",
        "modelAnswer": "Investing in renewable energy infrastructure can create thousands of new jobs.",
        "fallbackKeywords": [
          "investing",
          "renewable energy infrastructure",
          "new jobs"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w8re_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / reduce / on imported oil / a country's dependence / Renewable energy / significantly]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Renewable energy could significantly reduce a country's dependence on imported oil.",
        "explanationVi": "'Significantly reduce' = giảm đáng kể. 'Dependence on + N' = sự phụ thuộc vào.",
        "modelAnswer": "Renewable energy could significantly reduce a country's dependence on imported oil.",
        "fallbackKeywords": [
          "renewable energy",
          "significantly reduce",
          "dependence"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w8re_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Countries should to invest more in wind and solar power.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Countries should invest more in wind and solar power.",
        "explanationVi": "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'.",
        "modelAnswer": "Countries should invest more in wind and solar power.",
        "fallbackKeywords": [
          "countries",
          "invest",
          "wind and solar power"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w8re_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"energy security\"):\n\n\"Phát triển năng lượng tái tạo trong nước có thể cải thiện an ninh năng lượng của một quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Developing domestic renewable energy can improve a country's energy security.",
        "explanationVi": "'Energy security' = an ninh năng lượng, khả năng đảm bảo nguồn cung năng lượng ổn định. 'Domestic + N' = trong nước.",
        "modelAnswer": "Developing domestic renewable energy can improve a country's energy security.",
        "fallbackKeywords": [
          "domestic renewable energy",
          "energy security"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w8re_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"grid stability\"):\n\n\"Nguồn cung năng lượng không liên tục từ gió và mặt trời có thể gây ra thách thức cho sự ổn định của lưới điện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The intermittent supply from wind and solar power can pose challenges for grid stability.",
        "explanationVi": "'Intermittent supply' = nguồn cung không liên tục. 'Pose challenges for' = gây ra thách thức cho. 'Grid stability' = sự ổn định lưới điện.",
        "modelAnswer": "The intermittent supply from wind and solar power can pose challenges for grid stability.",
        "fallbackKeywords": [
          "intermittent supply",
          "grid stability",
          "challenges"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w8re_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"initial investment costs\"):\n\n\"Chi phí đầu tư ban đầu cho các dự án năng lượng tái tạo thường rất cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Initial investment costs for renewable energy projects are often very high.",
        "explanationVi": "'Initial investment costs' = chi phí đầu tư ban đầu. Đây là điểm thường được nêu như một nhược điểm ngắn hạn.",
        "modelAnswer": "Initial investment costs for renewable energy projects are often very high.",
        "fallbackKeywords": [
          "initial investment costs",
          "renewable energy projects"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w8re_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"non-renewable resources\"):\n\n\"Không giống như tài nguyên không tái tạo, năng lượng mặt trời và gió sẽ không bao giờ cạn kiệt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike non-renewable resources, solar and wind energy will never run out.",
        "explanationVi": "'Non-renewable resources' = tài nguyên không tái tạo. 'Run out' = cạn kiệt (phrasal verb).",
        "modelAnswer": "Unlike non-renewable resources, solar and wind energy will never run out.",
        "fallbackKeywords": [
          "non-renewable resources",
          "never run out"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w8re_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"energy storage\"):\n\n\"Công nghệ lưu trữ năng lượng tiên tiến có thể giúp giải quyết vấn đề nguồn cung không ổn định.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Advanced energy storage technology can help solve the problem of unstable supply.",
        "explanationVi": "'Energy storage' = lưu trữ năng lượng (ví dụ pin quy mô lớn). 'Help solve the problem of' = giúp giải quyết vấn đề.",
        "modelAnswer": "Advanced energy storage technology can help solve the problem of unstable supply.",
        "fallbackKeywords": [
          "energy storage",
          "advanced technology",
          "unstable supply"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w8re_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"climate change mitigation\"):\n\n\"Đầu tư vào năng lượng tái tạo là một bước quan trọng trong việc giảm thiểu biến đổi khí hậu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investing in renewable energy is a crucial step in climate change mitigation.",
        "explanationVi": "'Climate change mitigation' = giảm thiểu biến đổi khí hậu — thuật ngữ học thuật quan trọng. 'A crucial step in' = một bước quan trọng trong.",
        "modelAnswer": "Investing in renewable energy is a crucial step in climate change mitigation.",
        "fallbackKeywords": [
          "investing",
          "crucial step",
          "climate change mitigation"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w8re_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"job creation\"):\n\n\"Ngành công nghiệp năng lượng tái tạo đã đóng góp đáng kể vào việc tạo việc làm trên toàn thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The renewable energy industry has contributed significantly to job creation worldwide.",
        "explanationVi": "'Contribute significantly to' = đóng góp đáng kể vào. 'Job creation' = tạo việc làm.",
        "modelAnswer": "The renewable energy industry has contributed significantly to job creation worldwide.",
        "fallbackKeywords": [
          "renewable energy industry",
          "job creation",
          "worldwide"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w8re_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"energy efficiency\"):\n\n\"Cải thiện hiệu quả năng lượng cũng quan trọng không kém việc chuyển sang các nguồn tái tạo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improving energy efficiency is just as important as switching to renewable sources.",
        "explanationVi": "'Energy efficiency' = hiệu quả năng lượng. 'Just as important as' = quan trọng không kém.",
        "modelAnswer": "Improving energy efficiency is just as important as switching to renewable sources.",
        "fallbackKeywords": [
          "energy efficiency",
          "just as important as"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w8re_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"clean energy transition\"):\n\n\"Quá trình chuyển đổi sang năng lượng sạch đòi hỏi sự hợp tác chặt chẽ giữa chính phủ và doanh nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The clean energy transition requires close cooperation between governments and businesses.",
        "explanationVi": "'Clean energy transition' = quá trình chuyển đổi sang năng lượng sạch. 'Close cooperation between' = sự hợp tác chặt chẽ giữa.",
        "modelAnswer": "The clean energy transition requires close cooperation between governments and businesses.",
        "fallbackKeywords": [
          "clean energy transition",
          "close cooperation"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w8re_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"intermittent energy supply\"):\n\n\"Nguồn cung năng lượng không liên tục vẫn là một trong những thách thức lớn nhất của năng lượng tái tạo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Intermittent energy supply remains one of the biggest challenges of renewable energy.",
        "explanationVi": "'Intermittent energy supply' = nguồn cung năng lượng không liên tục (do phụ thuộc thời tiết). 'One of the biggest challenges of' = một trong những thách thức lớn nhất của.",
        "modelAnswer": "Intermittent energy supply remains one of the biggest challenges of renewable energy.",
        "fallbackKeywords": [
          "intermittent energy supply",
          "biggest challenges"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w8re_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sustainable power generation\"):\n\n\"Sản xuất điện bền vững sẽ đóng vai trò then chốt trong tương lai năng lượng của thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sustainable power generation will play a key role in the world's energy future.",
        "explanationVi": "'Sustainable power generation' = sản xuất điện bền vững. 'Play a key role in' = đóng vai trò then chốt trong.",
        "modelAnswer": "Sustainable power generation will play a key role in the world's energy future.",
        "fallbackKeywords": [
          "sustainable power generation",
          "key role"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w8re_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"long-term sustainability\"):\n\n\"Xét về tính bền vững lâu dài, năng lượng tái tạo rõ ràng vượt trội hơn nhiên liệu hóa thạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In terms of long-term sustainability, renewable energy clearly outperforms fossil fuels.",
        "explanationVi": "'In terms of + N' = xét về. 'Outperform + N' = vượt trội hơn — động từ học thuật mạnh.",
        "modelAnswer": "In terms of long-term sustainability, renewable energy clearly outperforms fossil fuels.",
        "fallbackKeywords": [
          "long-term sustainability",
          "outperforms",
          "fossil fuels"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 14,
    "block": "positive_or_negative_development",
    "topicName": "Conversion of Urban Spaces to Local Community Gardens",
    "topicEmoji": "🌻",
    "essayType": "positive_or_negative_development",
    "prompt": "In some cities, public parks and open spaces are being turned into community gardens where local residents can grow their own fruit and vegetables. Is this a positive or negative development?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 44,
    "vocabularyList": [
      {
        "term": "community garden",
        "definitionVi": "vườn cộng đồng",
        "example": "Unused public spaces are being converted into community gardens."
      },
      {
        "term": "unused public space",
        "definitionVi": "không gian công cộng bỏ trống",
        "example": "Cities are finding creative ways to repurpose unused public space."
      },
      {
        "term": "urban agriculture",
        "definitionVi": "nông nghiệp đô thị",
        "example": "Urban agriculture allows city residents to grow their own food."
      },
      {
        "term": "food security",
        "definitionVi": "an ninh lương thực",
        "example": "Community gardens can improve food security for low-income families."
      },
      {
        "term": "social cohesion",
        "definitionVi": "sự gắn kết xã hội",
        "example": "Gardening projects can strengthen social cohesion among neighbours."
      },
      {
        "term": "local produce",
        "definitionVi": "nông sản địa phương",
        "example": "Community gardens give residents access to fresh local produce."
      },
      {
        "term": "green space",
        "definitionVi": "không gian xanh",
        "example": "Converting parking lots into green space improves the urban environment."
      },
      {
        "term": "soil contamination",
        "definitionVi": "ô nhiễm đất",
        "example": "Soil contamination in former industrial sites can pose a risk to gardeners."
      },
      {
        "term": "biodiversity",
        "definitionVi": "đa dạng sinh học",
        "example": "Community gardens can support local biodiversity by attracting pollinators."
      },
      {
        "term": "maintenance responsibility",
        "definitionVi": "trách nhiệm bảo trì",
        "example": "Maintenance responsibility for community gardens usually falls on volunteers."
      },
      {
        "term": "urban heat island effect",
        "definitionVi": "hiệu ứng đảo nhiệt đô thị",
        "example": "More green spaces can help reduce the urban heat island effect."
      },
      {
        "term": "self-sufficiency",
        "definitionVi": "khả năng tự túc",
        "example": "Growing vegetables at home promotes a sense of self-sufficiency."
      },
      {
        "term": "land-use policy",
        "definitionVi": "chính sách sử dụng đất",
        "example": "Land-use policy determines how unused urban spaces can be repurposed."
      },
      {
        "term": "neighbourhood revitalisation",
        "definitionVi": "sự hồi sinh khu dân cư",
        "example": "Community gardens often play a role in neighbourhood revitalisation."
      },
      {
        "term": "sense of ownership",
        "definitionVi": "cảm giác sở hữu, làm chủ",
        "example": "Gardening gives residents a stronger sense of ownership over public spaces."
      },
      {
        "term": "limited land availability",
        "definitionVi": "sự hạn chế về đất đai",
        "example": "Limited land availability makes it difficult to expand community gardens."
      },
      {
        "term": "environmental education",
        "definitionVi": "giáo dục môi trường",
        "example": "Community gardens provide environmental education opportunities for children."
      },
      {
        "term": "carbon footprint reduction",
        "definitionVi": "giảm dấu chân carbon",
        "example": "Growing food locally contributes to carbon footprint reduction."
      },
      {
        "term": "property value",
        "definitionVi": "giá trị bất động sản",
        "example": "Well-maintained community gardens can increase nearby property value."
      },
      {
        "term": "vacant lot",
        "definitionVi": "lô đất bỏ trống",
        "example": "Many cities have converted vacant lots into productive green spaces."
      },
      {
        "term": "breathe new life into",
        "definitionVi": "thổi luồng sinh khí mới vào",
        "example": "Community gardens breathe new life into neglected urban spaces."
      },
      {
        "term": "foster a sense of community",
        "definitionVi": "xây dựng cảm giác cộng đồng",
        "example": "Shared gardening projects foster a sense of community among neighbours."
      },
      {
        "term": "reclaim derelict land",
        "definitionVi": "cải tạo lại đất bỏ hoang",
        "example": "Cities are increasingly reclaiming derelict land for green use."
      },
      {
        "term": "cultivate a sense of pride",
        "definitionVi": "nuôi dưỡng niềm tự hào",
        "example": "Tending a community garden can cultivate a sense of pride among residents."
      },
      {
        "term": "promote self-sufficiency",
        "definitionVi": "thúc đẩy sự tự cung tự cấp",
        "example": "Urban gardens promote self-sufficiency by letting residents grow their own food."
      },
      {
        "term": "counteract urban decay",
        "definitionVi": "chống lại sự xuống cấp của đô thị",
        "example": "Green initiatives can counteract urban decay in run-down neighbourhoods."
      },
      {
        "term": "require ongoing upkeep",
        "definitionVi": "đòi hỏi sự bảo trì liên tục",
        "example": "Community gardens require ongoing upkeep from dedicated volunteers."
      },
      {
        "term": "enhance urban biodiversity",
        "definitionVi": "nâng cao đa dạng sinh học đô thị",
        "example": "Green spaces can enhance urban biodiversity by attracting wildlife."
      },
      {
        "term": "test soil for contamination",
        "definitionVi": "kiểm tra đất để phát hiện ô nhiễm",
        "example": "Authorities must test soil for contamination before opening a new garden."
      },
      {
        "term": "boost neighbourhood morale",
        "definitionVi": "nâng cao tinh thần khu dân cư",
        "example": "A thriving community garden can boost neighbourhood morale considerably."
      }
    ],
    "questions": [
      {
        "questionId": "w14cg_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"...unused public spaces and former parking lots are being converted into community gardens... Is this a positive or negative development?\" — Đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Cause & Effect",
          "Positive or Negative Development",
          "Advantages & Disadvantages"
        ],
        "baseWords": [],
        "correctAnswer": "Positive or Negative Development",
        "explanationVi": "Câu hỏi 'Is this a positive or negative development?' là dấu hiệu nhận biết trực tiếp của dạng Positive or Negative Development — cần nêu MỘT lập trường rõ ràng.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w14cg_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"In many cities, unused public spaces and former parking lots are being _____ into community gardens.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "converted",
        "explanationVi": "'Convert + N + into + N' = chuyển đổi cái gì thành cái gì. Lấy trực tiếp từ đề bài.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w14cg_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ở nhiều thành phố, những không gian công cộng bỏ trống đang được chuyển đổi thành vườn cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In many cities, unused public spaces are being converted into community gardens.",
        "explanationVi": "'Unused public space' = không gian công cộng bỏ trống. Câu lấy gần trực tiếp từ đề bài.",
        "modelAnswer": "In many cities, unused public spaces are being converted into community gardens.",
        "fallbackKeywords": [
          "unused public spaces",
          "community gardens"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w14cg_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tôi tin rằng đây là một sự phát triển tích cực vì nó mang lại nhiều lợi ích cho cộng đồng địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "I believe this is a positive development because it brings many benefits to the local community.",
        "explanationVi": "Câu nêu quan điểm chuẩn cho dạng Positive or Negative Development. 'Bring benefits to' = mang lại lợi ích cho.",
        "modelAnswer": "I believe this is a positive development because it brings many benefits to the local community.",
        "fallbackKeywords": [
          "positive development",
          "local community"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w14cg_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nông nghiệp đô thị cho phép cư dân thành phố tự trồng thực phẩm của riêng mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Urban agriculture allows city residents to grow their own food.",
        "explanationVi": "'Urban agriculture' = nông nghiệp đô thị. 'Allow + O + to V' = cho phép ai làm gì.",
        "modelAnswer": "Urban agriculture allows city residents to grow their own food.",
        "fallbackKeywords": [
          "urban agriculture",
          "city residents",
          "grow their own food"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w14cg_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các dự án làm vườn có thể tăng cường sự gắn kết xã hội giữa những người hàng xóm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Gardening projects can strengthen social cohesion among neighbours.",
        "explanationVi": "'Social cohesion' = sự gắn kết xã hội. 'Strengthen + N' = tăng cường.",
        "modelAnswer": "Gardening projects can strengthen social cohesion among neighbours.",
        "fallbackKeywords": [
          "gardening projects",
          "social cohesion",
          "neighbours"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w14cg_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[can / by attracting pollinators / support local biodiversity / Community gardens]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community gardens can support local biodiversity by attracting pollinators.",
        "explanationVi": "'Support + N' = hỗ trợ. 'By + V-ing' = bằng cách. 'Local biodiversity' = đa dạng sinh học địa phương.",
        "modelAnswer": "Community gardens can support local biodiversity by attracting pollinators.",
        "fallbackKeywords": [
          "community gardens",
          "local biodiversity",
          "pollinators"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w14cg_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi. Hãy sửa lại:\n\n\"Community gardens can helps reduce the urban heat island effect.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community gardens can help reduce the urban heat island effect.",
        "explanationVi": "Lỗi: Sau modal verb 'can' KHÔNG chia động từ. Cấu trúc: 'can + bare infinitive' → 'help', không phải 'helps'.",
        "modelAnswer": "Community gardens can help reduce the urban heat island effect.",
        "fallbackKeywords": [
          "community gardens",
          "urban heat island effect"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w14cg_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"food security\"):\n\n\"Vườn cộng đồng có thể cải thiện an ninh lương thực cho các gia đình thu nhập thấp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community gardens can improve food security for low-income families.",
        "explanationVi": "'Food security' = an ninh lương thực. 'Improve + N' = cải thiện.",
        "modelAnswer": "Community gardens can improve food security for low-income families.",
        "fallbackKeywords": [
          "community gardens",
          "food security",
          "low-income families"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w14cg_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"soil contamination\"):\n\n\"Ô nhiễm đất tại các khu công nghiệp cũ có thể gây rủi ro cho những người làm vườn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Soil contamination in former industrial sites can pose a risk to gardeners.",
        "explanationVi": "'Soil contamination' = ô nhiễm đất. 'Pose a risk to' = gây rủi ro cho.",
        "modelAnswer": "Soil contamination in former industrial sites can pose a risk to gardeners.",
        "fallbackKeywords": [
          "soil contamination",
          "industrial sites",
          "gardeners"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w14cg_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"maintenance responsibility\"):\n\n\"Trách nhiệm bảo trì vườn cộng đồng thường thuộc về những người tình nguyện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Maintenance responsibility for community gardens usually falls on volunteers.",
        "explanationVi": "'Maintenance responsibility' = trách nhiệm bảo trì. 'Fall on + N' = thuộc về, rơi vào trách nhiệm của.",
        "modelAnswer": "Maintenance responsibility for community gardens usually falls on volunteers.",
        "fallbackKeywords": [
          "maintenance responsibility",
          "volunteers"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w14cg_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban heat island effect\"):\n\n\"Nhiều không gian xanh hơn có thể giúp giảm hiệu ứng đảo nhiệt đô thị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "More green spaces can help reduce the urban heat island effect.",
        "explanationVi": "'Urban heat island effect' = hiệu ứng đảo nhiệt đô thị (nhiệt độ thành phố cao hơn vùng xung quanh). 'Help reduce + N' = giúp giảm.",
        "modelAnswer": "More green spaces can help reduce the urban heat island effect.",
        "fallbackKeywords": [
          "green spaces",
          "urban heat island effect"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w14cg_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"self-sufficiency\"):\n\n\"Việc tự trồng rau tại nhà thúc đẩy cảm giác tự túc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Growing vegetables at home promotes a sense of self-sufficiency.",
        "explanationVi": "'Self-sufficiency' = khả năng tự túc. 'Promote a sense of + N' = thúc đẩy cảm giác gì đó.",
        "modelAnswer": "Growing vegetables at home promotes a sense of self-sufficiency.",
        "fallbackKeywords": [
          "growing vegetables",
          "self-sufficiency"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w14cg_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"land-use policy\"):\n\n\"Chính sách sử dụng đất quyết định cách các không gian đô thị bỏ trống có thể được tái sử dụng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Land-use policy determines how unused urban spaces can be repurposed.",
        "explanationVi": "'Land-use policy' = chính sách sử dụng đất. 'Determine + Clause' = quyết định.",
        "modelAnswer": "Land-use policy determines how unused urban spaces can be repurposed.",
        "fallbackKeywords": [
          "land-use policy",
          "unused urban spaces",
          "repurposed"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w14cg_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"neighbourhood revitalisation\"):\n\n\"Vườn cộng đồng thường đóng vai trò trong việc hồi sinh khu dân cư.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community gardens often play a role in neighbourhood revitalisation.",
        "explanationVi": "'Neighbourhood revitalisation' = sự hồi sinh khu dân cư. 'Play a role in' = đóng vai trò trong.",
        "modelAnswer": "Community gardens often play a role in neighbourhood revitalisation.",
        "fallbackKeywords": [
          "community gardens",
          "neighbourhood revitalisation"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w14cg_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sense of ownership\"):\n\n\"Việc làm vườn mang lại cho cư dân một cảm giác làm chủ mạnh mẽ hơn đối với không gian công cộng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Gardening gives residents a stronger sense of ownership over public spaces.",
        "explanationVi": "'Sense of ownership' = cảm giác sở hữu, làm chủ. 'Over + N' = đối với.",
        "modelAnswer": "Gardening gives residents a stronger sense of ownership over public spaces.",
        "fallbackKeywords": [
          "sense of ownership",
          "public spaces"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w14cg_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"limited land availability\"):\n\n\"Sự hạn chế về đất đai khiến việc mở rộng vườn cộng đồng trở nên khó khăn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Limited land availability makes it difficult to expand community gardens.",
        "explanationVi": "'Limited land availability' = sự hạn chế về đất đai. 'Make it difficult to V' = khiến việc làm gì trở nên khó khăn.",
        "modelAnswer": "Limited land availability makes it difficult to expand community gardens.",
        "fallbackKeywords": [
          "limited land availability",
          "expand community gardens"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w14cg_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"environmental education\"):\n\n\"Vườn cộng đồng mang lại cơ hội giáo dục môi trường cho trẻ em.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community gardens provide environmental education opportunities for children.",
        "explanationVi": "'Environmental education' = giáo dục môi trường. 'Provide + N + for' = mang lại cho.",
        "modelAnswer": "Community gardens provide environmental education opportunities for children.",
        "fallbackKeywords": [
          "environmental education",
          "opportunities for children"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w14cg_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"carbon footprint reduction\"):\n\n\"Việc trồng thực phẩm tại chỗ góp phần vào việc giảm dấu chân carbon.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Growing food locally contributes to carbon footprint reduction.",
        "explanationVi": "'Carbon footprint reduction' = giảm dấu chân carbon. 'Contribute to + N' = góp phần vào.",
        "modelAnswer": "Growing food locally contributes to carbon footprint reduction.",
        "fallbackKeywords": [
          "growing food locally",
          "carbon footprint reduction"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w14cg_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"property value\"):\n\n\"Những vườn cộng đồng được chăm sóc tốt có thể làm tăng giá trị bất động sản xung quanh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Well-maintained community gardens can increase nearby property value.",
        "explanationVi": "'Property value' = giá trị bất động sản. 'Well-maintained' = được chăm sóc tốt.",
        "modelAnswer": "Well-maintained community gardens can increase nearby property value.",
        "fallbackKeywords": [
          "well-maintained",
          "property value"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 15,
    "block": "mixed",
    "topicName": "Public vs. Private Healthcare",
    "topicEmoji": "🏥",
    "essayType": "advantages_disadvantages",
    "prompt": "Some people think that good health is a basic human right, so medical services should not be run by profit-making companies. Do the disadvantages of private healthcare outweigh the advantages?",
    "hintAdvantages": [
      "high quality care",
      "shorter waiting times",
      "drives medical innovation"
    ],
    "hintDisadvantages": [
      "unaffordable for low-income patients",
      "profit over patient welfare",
      "widens healthcare inequality"
    ],
    "orderIndex": 14,
    "vocabularyList": [
      {
        "term": "healthcare system",
        "definitionVi": "hệ thống y tế",
        "example": "A well-funded healthcare system benefits the entire population."
      },
      {
        "term": "public healthcare",
        "definitionVi": "y tế công",
        "example": "Public healthcare ensures that all citizens receive medical treatment regardless of income."
      },
      {
        "term": "private healthcare",
        "definitionVi": "y tế tư nhân",
        "example": "Private healthcare often offers shorter waiting times and superior facilities."
      },
      {
        "term": "profit-making companies",
        "definitionVi": "các công ty vì lợi nhuận",
        "example": "Profit-making companies may prioritise revenue over patient welfare."
      },
      {
        "term": "basic human right",
        "definitionVi": "quyền cơ bản của con người",
        "example": "Access to healthcare is widely regarded as a basic human right."
      },
      {
        "term": "universal healthcare",
        "definitionVi": "chăm sóc y tế toàn dân",
        "example": "Universal healthcare ensures no one is denied treatment due to financial constraints."
      },
      {
        "term": "health insurance",
        "definitionVi": "bảo hiểm y tế",
        "example": "Health insurance plays an important role in reducing the financial burden of illness."
      },
      {
        "term": "medical expenses",
        "definitionVi": "chi phí y tế",
        "example": "High medical expenses prevent many people from seeking treatment."
      },
      {
        "term": "healthcare inequality",
        "definitionVi": "bất bình đẳng y tế",
        "example": "Privatization of healthcare may increase healthcare inequality between the rich and the poor."
      },
      {
        "term": "access to healthcare",
        "definitionVi": "tiếp cận dịch vụ y tế",
        "example": "Equal access to healthcare should be guaranteed by the government."
      },
      {
        "term": "financial burden",
        "definitionVi": "gánh nặng tài chính",
        "example": "Health insurance reduces the financial burden on individuals and families."
      },
      {
        "term": "affordable healthcare",
        "definitionVi": "y tế giá cả phải chăng",
        "example": "The government should ensure all citizens have access to affordable healthcare."
      },
      {
        "term": "privatization of healthcare",
        "definitionVi": "tư nhân hóa ngành y tế",
        "example": "The privatization of healthcare remains a controversial policy in many countries."
      },
      {
        "term": "profit-driven motives",
        "definitionVi": "động cơ vì lợi nhuận",
        "example": "Profit-driven motives in medicine can compromise ethical standards of care."
      },
      {
        "term": "medical innovation",
        "definitionVi": "đổi mới y tế",
        "example": "Competition in the private sector can stimulate medical innovation."
      },
      {
        "term": "medical insurance",
        "definitionVi": "bảo hiểm y tế",
        "example": "Without medical insurance, many people cannot afford proper treatment."
      },
      {
        "term": "waiting list",
        "definitionVi": "danh sách chờ điều trị",
        "example": "Long waiting lists in public hospitals push patients towards private care."
      },
      {
        "term": "preventive medicine",
        "definitionVi": "y học dự phòng",
        "example": "Investing in preventive medicine reduces long-term healthcare costs."
      },
      {
        "term": "pharmaceutical industry",
        "definitionVi": "ngành dược phẩm",
        "example": "The pharmaceutical industry invests billions in developing new treatments."
      },
      {
        "term": "doctor-to-patient ratio",
        "definitionVi": "tỷ lệ bác sĩ trên bệnh nhân",
        "example": "A low doctor-to-patient ratio leads to overworked medical staff and poor care."
      },
      {
        "term": "put patients' needs first",
        "definitionVi": "đặt nhu cầu bệnh nhân lên hàng đầu",
        "example": "A good healthcare system should put patients' needs first, not profit."
      },
      {
        "term": "shoulder rising healthcare costs",
        "definitionVi": "gánh chịu chi phí y tế ngày càng tăng",
        "example": "Public budgets increasingly shoulder rising healthcare costs."
      },
      {
        "term": "queue for treatment",
        "definitionVi": "xếp hàng chờ điều trị",
        "example": "Patients in public systems sometimes have to queue for treatment."
      },
      {
        "term": "drive up medical costs",
        "definitionVi": "đẩy chi phí y tế lên cao",
        "example": "Profit motives can drive up medical costs in private hospitals."
      },
      {
        "term": "guarantee universal coverage",
        "definitionVi": "đảm bảo bảo hiểm phổ cập",
        "example": "Public healthcare systems aim to guarantee universal coverage for all citizens."
      },
      {
        "term": "ease pressure on public hospitals",
        "definitionVi": "giảm áp lực cho các bệnh viện công",
        "example": "Private clinics can ease pressure on overcrowded public hospitals."
      },
      {
        "term": "compromise patient care",
        "definitionVi": "làm giảm chất lượng chăm sóc bệnh nhân",
        "example": "Cost-cutting measures should never compromise patient care."
      },
      {
        "term": "widen health inequalities",
        "definitionVi": "làm nới rộng bất bình đẳng về y tế",
        "example": "A purely private system risks widening health inequalities."
      },
      {
        "term": "invest in cutting-edge treatment",
        "definitionVi": "đầu tư vào phương pháp điều trị tiên tiến",
        "example": "Private hospitals often invest in cutting-edge treatment technology."
      },
      {
        "term": "deliver timely care",
        "definitionVi": "cung cấp dịch vụ chăm sóc kịp thời",
        "example": "Well-funded systems are better able to deliver timely care to patients."
      }
    ],
    "questions": [
      {
        "questionId": "w9t14_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài hỏi \"Do the disadvantages of private healthcare outweigh the advantages?\" — điều này có nghĩa là gì?",
        "options": [
          "Bạn chỉ nêu nhược điểm của y tế tư nhân",
          "Bạn đưa ra ý kiến về việc nhược điểm có lớn hơn ưu điểm không",
          "Bạn thảo luận nguyên nhân và giải pháp của vấn đề y tế",
          "Bạn chỉ nêu ưu điểm của y tế tư nhân"
        ],
        "baseWords": [],
        "correctAnswer": "Bạn đưa ra ý kiến về việc nhược điểm có lớn hơn ưu điểm không",
        "explanationVi": "\"Outweigh\" = vượt trội hơn. Dạng này là biến thể của Adv/Disadv, yêu cầu lập luận rõ ràng mặt nào nhiều hơn và đưa ra kết luận cá nhân.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w9t14_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Many people believe that good health is a _____ human right that should not depend on one's ability to pay.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "basic",
        "explanationVi": "\"Basic human right\" = quyền cơ bản của con người — cụm danh từ quan trọng trong IELTS chủ đề y tế và xã hội.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w9t14_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Chính phủ nên cung cấp dịch vụ y tế miễn phí cho tất cả công dân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should provide free medical treatment for all citizens.",
        "explanationVi": "'Provide + N + for + N' = cung cấp gì cho ai. 'Free medical treatment' = dịch vụ y tế miễn phí. 'All citizens' = tất cả công dân.",
        "modelAnswer": "The government should provide free medical treatment for all citizens.",
        "fallbackKeywords": [
          "government",
          "free medical treatment",
          "citizens",
          "provide"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w9t14_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các công ty vì lợi nhuận thường đặt lợi ích tài chính lên trên bệnh nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Profit-making companies often put financial gain above patient welfare.",
        "explanationVi": "'Put A above B' = đặt A lên trên B. 'Financial gain' = lợi ích tài chính. 'Patient welfare' = sức khỏe/phúc lợi bệnh nhân — từ vựng học thuật quan trọng.",
        "modelAnswer": "Profit-making companies often put financial gain above patient welfare.",
        "fallbackKeywords": [
          "profit-making companies",
          "financial gain",
          "patient welfare"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w9t14_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tư nhân hóa ngành y tế có thể làm gia tăng bất bình đẳng giữa người giàu và người nghèo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Privatization of healthcare may increase healthcare inequality between the rich and the poor.",
        "explanationVi": "'Privatization of healthcare' = tư nhân hóa ngành y tế. 'May increase' = có thể làm gia tăng. 'Between the rich and the poor' = giữa người giàu và người nghèo.",
        "modelAnswer": "Privatization of healthcare may increase healthcare inequality between the rich and the poor.",
        "fallbackKeywords": [
          "privatization",
          "healthcare inequality",
          "rich",
          "poor"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w9t14_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Bảo hiểm y tế đóng vai trò quan trọng trong việc giảm gánh nặng tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Health insurance plays an important role in reducing the financial burden.",
        "explanationVi": "'Play an important role in + V-ing' = đóng vai trò quan trọng trong việc. 'Financial burden' = gánh nặng tài chính. Cấu trúc này rất phổ biến trong IELTS.",
        "modelAnswer": "Health insurance plays an important role in reducing the financial burden.",
        "fallbackKeywords": [
          "health insurance",
          "financial burden",
          "reducing",
          "important"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w9t14_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp thành câu hoàn chỉnh:\n\n[profit-driven / While / can / private healthcare / motives / medical innovation, / encourage / may / also / compromise / patient care / and / medical ethics]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "While private healthcare can encourage medical innovation, profit-driven motives may also compromise patient care and medical ethics.",
        "explanationVi": "\"While + clause, + clause\" — cấu trúc đối lập. \"Compromise\" = làm ảnh hưởng tiêu cực đến.",
        "fallbackKeywords": [],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w9t14_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi gì? Hãy sửa lại:\n\n\"The government should ensures that all citizens have access to affordable healthcare.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should ensure that all citizens have access to affordable healthcare.",
        "explanationVi": "Lỗi: Sau \"should\" dùng V nguyên thể (bare infinitive). \"Ensures\" → \"ensure\".",
        "modelAnswer": "The government should ensure that all citizens have access to affordable healthcare.",
        "fallbackKeywords": [
          "government",
          "ensure",
          "affordable healthcare",
          "citizens"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w9t14_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Mục tiêu cuối cùng của ngành y tế nên là thu hẹp khoảng cách tiếp cận y tế, không phải tạo ra lợi nhuận.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.",
        "explanationVi": "'The ultimate goal' = mục tiêu cuối cùng. 'Close the gap' = thu hẹp khoảng cách. 'Generate profit' = tạo ra lợi nhuận. Cấu trúc 'not to + V' = không phải để làm gì.",
        "modelAnswer": "The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.",
        "fallbackKeywords": [
          "healthcare access gap",
          "ultimate goal",
          "profit",
          "generate"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w9t14_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Viết lại câu sau mà không dùng: good health, basic human right, medical services, profit-making companies:\n\n\"Some people think that good health is a basic human right, so medical services should not be run by profit-making companies.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.",
        "explanationVi": "Paraphrase: 'basic human right' → 'fundamental entitlement', 'profit-making' → 'commercial interests', 'run by' → 'driven by'. 'As such' = do đó, vì vậy.",
        "modelAnswer": "There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.",
        "fallbackKeywords": [
          "medical care",
          "fundamental entitlement",
          "commercial interests",
          "delivery",
          "services"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w9t14_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"basic human right\"):\n\n\"Nhiều người tin rằng sức khỏe tốt là quyền cơ bản của con người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many people believe that good health is a basic human right.",
        "explanationVi": "'A basic human right' = quyền cơ bản của con người (có mạo từ 'a'). 'Believe that + clause' = tin rằng.",
        "modelAnswer": "Many people believe that good health is a basic human right.",
        "fallbackKeywords": [
          "basic human right",
          "good health",
          "believe"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w9t14_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"free medical treatment\"):\n\n\"Chính phủ nên cung cấp dịch vụ y tế miễn phí cho tất cả công dân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should provide free medical treatment for all citizens.",
        "explanationVi": "'Provide + N + for + N' = cung cấp điều gì cho ai. 'All citizens' = tất cả công dân (không cần 'the').",
        "modelAnswer": "The government should provide free medical treatment for all citizens.",
        "fallbackKeywords": [
          "free medical treatment",
          "government",
          "all citizens"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w9t14_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"private healthcare\"):\n\n\"Một số người cho rằng ngành y tế tư nhân có thể mang lại dịch vụ chất lượng cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that private healthcare can provide higher-quality services.",
        "explanationVi": "'Higher-quality' là tính từ so sánh hơn ghép với gạch nối. 'Argue that' = lập luận rằng (academic hơn 'think that').",
        "modelAnswer": "Some people argue that private healthcare can provide higher-quality services.",
        "fallbackKeywords": [
          "private healthcare",
          "higher-quality",
          "services"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w9t14_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"profit-making companies\"):\n\n\"Tuy nhiên, các công ty vì lợi nhuận thường đặt lợi ích tài chính lên trên bệnh nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, profit-making companies often put financial gain above patient welfare.",
        "explanationVi": "'Put A above B' = đặt A lên trên B. 'Financial gain' = lợi ích tài chính. 'Patient welfare' = phúc lợi bệnh nhân. 'However' dùng dấu phẩy sau.",
        "modelAnswer": "However, profit-making companies often put financial gain above patient welfare.",
        "fallbackKeywords": [
          "profit-making companies",
          "financial gain",
          "patient welfare"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w9t14_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public healthcare system\"):\n\n\"Hệ thống y tế công giúp đảm bảo mọi người đều có thể tiếp cận dịch vụ y tế cơ bản.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The public healthcare system helps ensure that everyone can access basic medical services.",
        "explanationVi": "'Helps ensure that' = giúp đảm bảo rằng. 'Can access + N' = có thể tiếp cận. 'Basic medical services' = dịch vụ y tế cơ bản.",
        "modelAnswer": "The public healthcare system helps ensure that everyone can access basic medical services.",
        "fallbackKeywords": [
          "public healthcare system",
          "ensure",
          "access",
          "basic medical services"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w9t14_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"medical expenses\"):\n\n\"Ở nhiều quốc gia, chi phí y tế quá cao khiến người nghèo không thể điều trị bệnh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In many countries, excessively high medical expenses prevent poor people from receiving treatment.",
        "explanationVi": "'Prevent + O + from + V-ing' = ngăn ai làm gì. 'Excessively high' = quá cao. 'Receiving treatment' = được điều trị/nhận điều trị.",
        "modelAnswer": "In many countries, excessively high medical expenses prevent poor people from receiving treatment.",
        "fallbackKeywords": [
          "medical expenses",
          "high",
          "prevent",
          "treatment"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w9t14_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"privatization of healthcare\"):\n\n\"Tư nhân hóa ngành y tế có thể làm gia tăng bất bình đẳng giữa người giàu và người nghèo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The privatization of healthcare may increase inequality between the rich and the poor.",
        "explanationVi": "'The privatization of + N' = sự tư nhân hóa của. 'Between the rich and the poor' = giữa người giàu và người nghèo. 'May increase' = có thể làm tăng.",
        "modelAnswer": "The privatization of healthcare may increase inequality between the rich and the poor.",
        "fallbackKeywords": [
          "privatization of healthcare",
          "inequality",
          "rich",
          "poor"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w9t14_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"government funding\"):\n\n\"Hệ thống y tế công cộng cần nhiều đầu tư của chính phủ để duy trì hoạt động hiệu quả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The public healthcare system requires significant government funding to function effectively.",
        "explanationVi": "'Require + N + to V' = cần điều gì để làm gì. 'Significant government funding' = đầu tư đáng kể từ chính phủ. 'Function effectively' = hoạt động hiệu quả.",
        "modelAnswer": "The public healthcare system requires significant government funding to function effectively.",
        "fallbackKeywords": [
          "government funding",
          "public healthcare",
          "function effectively"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w9t14_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"healthcare infrastructure\" và \"life expectancy\"):\n\n\"Cải thiện cơ sở hạ tầng y tế là yếu tố thiết yếu để nâng cao tuổi thọ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Improving healthcare infrastructure is essential to increase life expectancy.",
        "explanationVi": "'Improving + N + is essential to + V' = cải thiện điều gì là thiết yếu để. 'Life expectancy' = tuổi thọ trung bình — danh từ không đếm được.",
        "modelAnswer": "Improving healthcare infrastructure is essential to increase life expectancy.",
        "fallbackKeywords": [
          "healthcare infrastructure",
          "essential",
          "life expectancy"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w9t14_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"affordable healthcare\"):\n\n\"Đảm bảo dịch vụ y tế có chi phí hợp lý là cách để đạt được công bằng xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Ensuring affordable healthcare is a way to achieve social equality.",
        "explanationVi": "'Ensuring + N + is a way to + V' = đảm bảo điều gì là cách để. 'Affordable healthcare' = dịch vụ y tế có giá phải chăng. 'Social equality' = bình đẳng xã hội.",
        "modelAnswer": "Ensuring affordable healthcare is a way to achieve social equality.",
        "fallbackKeywords": [
          "affordable healthcare",
          "social equality",
          "ensuring"
        ],
        "orderIndex": 21,
        "isActive": true
      }
    ]
  },
  {
    "week": 15,
    "block": "mixed",
    "topicName": "Consumerism and Society",
    "topicEmoji": "🛍️",
    "essayType": "agree_disagree",
    "prompt": "People today are buying more consumer goods than ever before. Is this a positive or negative development?",
    "hintAdvantages": [
      "stimulates economic growth",
      "creates jobs",
      "improves living standards and quality of life"
    ],
    "hintDisadvantages": [
      "generates excessive waste",
      "depletes natural resources",
      "encourages throwaway culture and overconsumption"
    ],
    "orderIndex": 15,
    "vocabularyList": [
      {
        "term": "consumer goods",
        "definitionVi": "hàng hóa tiêu dùng",
        "example": "The demand for consumer goods has surged in recent decades."
      },
      {
        "term": "consumerism",
        "definitionVi": "chủ nghĩa tiêu dùng",
        "example": "Consumerism drives economic growth but also leads to environmental damage."
      },
      {
        "term": "disposable income",
        "definitionVi": "thu nhập khả dụng",
        "example": "Rising disposable income has fuelled consumer spending worldwide."
      },
      {
        "term": "advertising campaigns",
        "definitionVi": "chiến dịch quảng cáo",
        "example": "Powerful advertising campaigns persuade people to buy things they do not need."
      },
      {
        "term": "online shopping",
        "definitionVi": "mua sắm trực tuyến",
        "example": "The rise of online shopping has made it easier to purchase goods from around the world."
      },
      {
        "term": "throwaway culture",
        "definitionVi": "văn hóa vứt bỏ",
        "example": "Mass production has given rise to a throwaway culture of disposable products."
      },
      {
        "term": "overconsumption",
        "definitionVi": "tiêu dùng quá mức",
        "example": "Overconsumption of resources is one of the main drivers of environmental degradation."
      },
      {
        "term": "environmental impact",
        "definitionVi": "tác động môi trường",
        "example": "The environmental impact of excessive shopping is considerable."
      },
      {
        "term": "waste generation",
        "definitionVi": "phát sinh rác thải",
        "example": "Waste generation has increased dramatically alongside rising consumerism."
      },
      {
        "term": "status symbol",
        "definitionVi": "biểu tượng địa vị",
        "example": "Luxury goods are often purchased as a status symbol rather than for their utility."
      },
      {
        "term": "impulsive buying",
        "definitionVi": "mua hàng bốc đồng",
        "example": "Impulsive buying leads to personal financial debt and unnecessary waste."
      },
      {
        "term": "sustainable consumption",
        "definitionVi": "tiêu dùng bền vững",
        "example": "Governments should promote sustainable consumption through awareness campaigns."
      },
      {
        "term": "overproduction",
        "definitionVi": "sản xuất thừa",
        "example": "Overproduction of cheap goods contributes to landfill and resource depletion."
      },
      {
        "term": "financial debt",
        "definitionVi": "nợ tài chính",
        "example": "Excessive shopping can lead individuals into serious financial debt."
      },
      {
        "term": "quality of life",
        "definitionVi": "chất lượng cuộc sống",
        "example": "Access to consumer goods can improve quality of life when used responsibly."
      },
      {
        "term": "disposable culture",
        "definitionVi": "văn hóa dùng xong bỏ đi",
        "example": "Disposable culture encourages people to replace products rather than repair them."
      },
      {
        "term": "brand loyalty",
        "definitionVi": "lòng trung thành thương hiệu",
        "example": "Advertising companies invest heavily in building brand loyalty."
      },
      {
        "term": "ethical consumption",
        "definitionVi": "tiêu dùng có đạo đức",
        "example": "Ethical consumption means choosing products that are sustainably and fairly produced."
      },
      {
        "term": "peer pressure",
        "definitionVi": "áp lực từ bạn bè / xã hội",
        "example": "Peer pressure drives many young people to buy the latest fashion items."
      },
      {
        "term": "planned obsolescence",
        "definitionVi": "lỗi thời có chủ ý (sản phẩm bị lỗi sớm)",
        "example": "Planned obsolescence encourages consumers to replace products more frequently than necessary."
      },
      {
        "term": "fuel a throwaway culture",
        "definitionVi": "thúc đẩy văn hóa dùng-rồi-vứt",
        "example": "Fast fashion continues to fuel a throwaway culture worldwide."
      },
      {
        "term": "chase material possessions",
        "definitionVi": "theo đuổi của cải vật chất",
        "example": "Many people chase material possessions in the belief they bring happiness."
      },
      {
        "term": "succumb to advertising pressure",
        "definitionVi": "khuất phục trước áp lực quảng cáo",
        "example": "Consumers often succumb to advertising pressure to buy unnecessary goods."
      },
      {
        "term": "live beyond one's means",
        "definitionVi": "sống vượt quá khả năng tài chính của bản thân",
        "example": "Easy credit encourages people to live beyond their means."
      },
      {
        "term": "place excessive value on",
        "definitionVi": "đặt giá trị quá mức vào",
        "example": "Modern society tends to place excessive value on owning the latest products."
      },
      {
        "term": "deplete natural resources",
        "definitionVi": "làm cạn kiệt tài nguyên thiên nhiên",
        "example": "Mass production and overconsumption deplete natural resources rapidly."
      },
      {
        "term": "cultivate mindful spending habits",
        "definitionVi": "xây dựng thói quen chi tiêu có ý thức",
        "example": "Financial education can help young people cultivate mindful spending habits."
      },
      {
        "term": "define self-worth by possessions",
        "definitionVi": "định nghĩa giá trị bản thân qua của cải",
        "example": "Some individuals define their self-worth by the possessions they own."
      },
      {
        "term": "generate excessive waste",
        "definitionVi": "tạo ra lượng rác thải quá mức",
        "example": "Disposable products generate excessive waste that harms the environment."
      },
      {
        "term": "resist consumerist pressures",
        "definitionVi": "chống lại áp lực tiêu dùng",
        "example": "Some communities actively resist consumerist pressures through minimalism."
      }
    ],
    "questions": [
      {
        "questionId": "w9t15_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài hỏi \"Is this a positive or negative development?\" — điều này yêu cầu gì?",
        "options": [
          "Thảo luận cả hai quan điểm mà không cần đưa ra ý kiến cá nhân",
          "Đưa ra ý kiến rõ ràng rằng đây là phát triển tích cực, tiêu cực, hoặc cả hai — và bảo vệ quan điểm đó",
          "Chỉ nêu nguyên nhân của xu hướng",
          "So sánh hai xu hướng khác nhau"
        ],
        "baseWords": [],
        "correctAnswer": "Đưa ra ý kiến rõ ràng rằng đây là phát triển tích cực, tiêu cực, hoặc cả hai — và bảo vệ quan điểm đó",
        "explanationVi": "Dạng \"positive or negative development\" = dạng Opinion Essay. PHẢI đưa ra lập trường rõ ràng ngay từ Introduction và duy trì nhất quán toàn bài.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w9t15_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"The rise of _____ shopping has made it easier than ever for people to buy goods from around the world.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "online",
        "explanationVi": "\"Online shopping\" = mua sắm trực tuyến — từ khóa trọng tâm khi bàn về xu hướng tiêu dùng hiện đại.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w9t15_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Ngày nay, con người mua nhiều hàng hóa tiêu dùng hơn bao giờ hết.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "People today are purchasing more consumer goods than ever before.",
        "explanationVi": "'More... than ever before' = nhiều hơn bao giờ hết — cụm so sánh nhấn mạnh xu hướng ngày càng tăng. 'Consumer goods' = hàng hóa tiêu dùng.",
        "modelAnswer": "People today are purchasing more consumer goods than ever before.",
        "fallbackKeywords": [
          "consumer goods",
          "purchasing",
          "ever before"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w9t15_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Chiến dịch quảng cáo mạnh mẽ khiến mọi người mua những thứ họ không thực sự cần.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Powerful advertising campaigns lead people to buy things they do not actually need.",
        "explanationVi": "'Lead + O + to V' = khiến ai làm gì (causative). 'Do not actually need' = không thực sự cần. 'Advertising campaigns' = chiến dịch quảng cáo.",
        "modelAnswer": "Powerful advertising campaigns lead people to buy things they do not actually need.",
        "fallbackKeywords": [
          "advertising campaigns",
          "people",
          "need",
          "buy"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w9t15_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều sản phẩm được sản xuất hàng loạt, tạo nên văn hóa vứt bỏ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many products are mass-produced, giving rise to a throwaway culture.",
        "explanationVi": "'Mass-produced' = được sản xuất hàng loạt (adjective). 'Give rise to' = tạo ra, dẫn đến. 'Throwaway culture' = văn hóa vứt bỏ — từ vựng học thuật quan trọng.",
        "modelAnswer": "Many products are mass-produced, giving rise to a throwaway culture.",
        "fallbackKeywords": [
          "mass-produced",
          "throwaway culture",
          "products"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w9t15_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc mua hàng bốc đồng dẫn đến nợ tài chính cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Impulsive buying leads to personal financial debt.",
        "explanationVi": "'Impulsive buying' = mua hàng bốc đồng (không có kế hoạch). 'Lead to + N' = dẫn đến. 'Financial debt' = nợ tài chính.",
        "modelAnswer": "Impulsive buying leads to personal financial debt.",
        "fallbackKeywords": [
          "impulsive buying",
          "financial debt",
          "personal"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w9t15_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp thành câu hoàn chỉnh:\n\n[a throwaway culture / Mass production / and / has / consumerism / of / encouraged / overconsumption, / leading / environmental damage / to / significant]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mass production and consumerism has encouraged a throwaway culture of overconsumption, leading to significant environmental damage.",
        "explanationVi": "\"Leading to + noun\" = dẫn đến — cụm phổ biến trong IELTS. \"Throwaway culture of overconsumption\" = văn hóa tiêu thụ vứt bỏ.",
        "fallbackKeywords": [],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w9t15_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi gì? Hãy sửa lại:\n\n\"Although buying more goods can stimulate the economy, but it also creates enormous amounts of waste.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.",
        "explanationVi": "Lỗi: Không dùng \"Although\" và \"but\" cùng lúc. Dùng một trong hai: \"Although...\" hoặc \"..., but...\"",
        "modelAnswer": "Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.",
        "fallbackKeywords": [
          "although",
          "stimulate",
          "economy",
          "waste",
          "enormous"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w9t15_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Chính phủ nên khuyến khích tiêu dùng bền vững thông qua các chiến dịch nâng cao nhận thức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The government should encourage sustainable consumption through awareness-raising campaigns.",
        "explanationVi": "'Sustainable consumption' = tiêu dùng bền vững. 'Awareness-raising campaigns' = chiến dịch nâng cao nhận thức (compound adjective). 'Through' = thông qua.",
        "modelAnswer": "The government should encourage sustainable consumption through awareness-raising campaigns.",
        "fallbackKeywords": [
          "sustainable consumption",
          "government",
          "awareness-raising",
          "campaigns"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w9t15_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Viết lại câu sau mà không dùng: people, buying, consumer goods, positive or negative:\n\n\"People today are buying more consumer goods than ever before. Is this a positive or negative development?\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.",
        "explanationVi": "Paraphrase mở bài: 'people today' → 'contemporary society', 'more than ever before' → 'unprecedented surge', 'positive or negative' → 'beneficial or detrimental'. Tách thành 2 câu.",
        "modelAnswer": "Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.",
        "fallbackKeywords": [
          "contemporary society",
          "manufactured products",
          "beneficial",
          "detrimental",
          "consumption"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w9t15_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"consumer goods\" và \"standard of living\"):\n\n\"Mức sống cao hơn đã làm tăng nhu cầu của người dân đối với hàng hóa tiêu dùng không thiết yếu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A higher standard of living has increased people's demand for non-essential consumer goods.",
        "explanationVi": "'Standard of living' = mức sống. 'Demand for + N' = nhu cầu đối với. 'Non-essential consumer goods' = hàng hóa tiêu dùng không thiết yếu. Present Perfect nhấn mạnh kết quả đến hiện tại.",
        "modelAnswer": "A higher standard of living has increased people's demand for non-essential consumer goods.",
        "fallbackKeywords": [
          "consumer goods",
          "standard of living",
          "demand",
          "non-essential"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w9t15_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"disposable income\"):\n\n\"Mức sống được cải thiện dẫn đến thu nhập khả dụng cao hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An improved standard of living leads to higher disposable income.",
        "explanationVi": "'Lead to + N' = dẫn đến. 'An improved standard of living' = mức sống được cải thiện (dùng 'An' vì 'improved' bắt đầu bằng nguyên âm). 'Disposable income' = thu nhập khả dụng.",
        "modelAnswer": "An improved standard of living leads to higher disposable income.",
        "fallbackKeywords": [
          "disposable income",
          "standard of living",
          "improved"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w9t15_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"advertising campaigns\" và \"brand loyalty\"):\n\n\"Các công ty đa quốc gia đầu tư hàng tỷ đô la vào chiến dịch quảng cáo để xây dựng lòng trung thành thương hiệu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Multinational companies invest billions of dollars in advertising campaigns to build brand loyalty.",
        "explanationVi": "'Invest + amount + in + N' = đầu tư bao nhiêu tiền vào. 'Billions of dollars' = hàng tỷ đô la. 'Build brand loyalty' = xây dựng lòng trung thành thương hiệu.",
        "modelAnswer": "Multinational companies invest billions of dollars in advertising campaigns to build brand loyalty.",
        "fallbackKeywords": [
          "advertising campaigns",
          "multinational",
          "invest",
          "brand loyalty"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w9t15_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"online shopping\"):\n\n\"Mua sắm trực tuyến giúp việc tiêu dùng trở nên dễ dàng và nhanh chóng hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Online shopping makes consumption easier and faster than ever.",
        "explanationVi": "'Make + N + adjective' = khiến điều gì trở nên... Hai tính từ so sánh 'easier and faster' song song. 'Than ever' = hơn bao giờ hết.",
        "modelAnswer": "Online shopping makes consumption easier and faster than ever.",
        "fallbackKeywords": [
          "online shopping",
          "consumption",
          "easier",
          "faster"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w9t15_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"overconsumption\" và \"environmental impact\"):\n\n\"Tuy nhiên, tiêu thụ quá mức có thể gây ra nhiều tác động tiêu cực đến môi trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, overconsumption can cause significant negative environmental impact.",
        "explanationVi": "'Cause + N' = gây ra. 'Significant negative environmental impact' = tác động tiêu cực đáng kể đến môi trường. Thứ tự tính từ: opinion → purpose noun.",
        "modelAnswer": "However, overconsumption can cause significant negative environmental impact.",
        "fallbackKeywords": [
          "overconsumption",
          "environmental impact",
          "negative"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w9t15_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mass production\" và \"planned obsolescence\"):\n\n\"Sản xuất hàng loạt kết hợp với chiến lược lỗi thời có chủ ý buộc người tiêu dùng phải thay thế sản phẩm thường xuyên hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Mass production combined with planned obsolescence compels consumers to replace products more frequently.",
        "explanationVi": "'Combined with' = kết hợp với. 'Planned obsolescence' = chiến lược lỗi thời có chủ ý. 'Compel + O + to V' = buộc ai phải làm gì (mạnh hơn 'force', trang trọng hơn).",
        "modelAnswer": "Mass production combined with planned obsolescence compels consumers to replace products more frequently.",
        "fallbackKeywords": [
          "mass production",
          "planned obsolescence",
          "compels",
          "consumers",
          "replace"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w9t15_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"impulsive buying\" và \"credit card\"):\n\n\"Việc sử dụng thẻ tín dụng không kiểm soát có thể làm trầm trọng thêm hành vi mua hàng bốc đồng và tạo ra nợ không cần thiết.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Uncontrolled use of credit cards can exacerbate impulsive buying behaviour and create unnecessary debt.",
        "explanationVi": "'Exacerbate' = làm trầm trọng thêm (Band 7+ thay cho 'worsen'). 'Impulsive buying behaviour' = hành vi mua hàng bốc đồng. 'Uncontrolled use of' = việc sử dụng không kiểm soát.",
        "modelAnswer": "Uncontrolled use of credit cards can exacerbate impulsive buying behaviour and create unnecessary debt.",
        "fallbackKeywords": [
          "impulsive buying",
          "credit cards",
          "exacerbate",
          "unnecessary debt"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w9t15_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"economic inequality\"):\n\n\"Tuy nhiên, việc tiêu dùng quá mức làm gia tăng bất bình đẳng kinh tế giữa người giàu và người nghèo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, overconsumption widens economic inequality between the rich and the poor.",
        "explanationVi": "'Widens + N' = làm rộng thêm/gia tăng (gap/inequality thường đi với 'widen'). 'Between the rich and the poor' = giữa người giàu và người nghèo.",
        "modelAnswer": "However, overconsumption widens economic inequality between the rich and the poor.",
        "fallbackKeywords": [
          "economic inequality",
          "overconsumption",
          "widens"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w9t15_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"recycling programs\" và \"second-hand goods\"):\n\n\"Để giảm lãng phí, mọi người nên tham gia chương trình tái chế hoặc mua hàng đã qua sử dụng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "To reduce waste, people should participate in recycling programs or purchase second-hand goods.",
        "explanationVi": "'To reduce waste' = infinitive of purpose đứng đầu câu. 'Participate in' = tham gia. 'Second-hand goods' = hàng đã qua sử dụng (có gạch nối).",
        "modelAnswer": "To reduce waste, people should participate in recycling programs or purchase second-hand goods.",
        "fallbackKeywords": [
          "recycling programs",
          "second-hand goods",
          "reduce waste"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w9t15_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"waste generation\"):\n\n\"Nếu xu hướng tiêu dùng tiếp tục tăng, lượng rác thải toàn cầu sẽ vượt kiểm soát.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If consumption trends continue to rise, global waste generation will spiral out of control.",
        "explanationVi": "'Spiral out of control' = mất kiểm soát/vượt tầm kiểm soát (idiom học thuật). Câu điều kiện loại 1: If + present, will + V.",
        "modelAnswer": "If consumption trends continue to rise, global waste generation will spiral out of control.",
        "fallbackKeywords": [
          "waste generation",
          "consumption trends",
          "spiral out of control"
        ],
        "orderIndex": 21,
        "isActive": true
      }
    ]
  },
  {
    "week": 16,
    "block": "mixed",
    "topicName": "Government Funding for the Arts",
    "topicEmoji": "🎨",
    "essayType": "discuss_both_views",
    "prompt": "In some countries, governments spend a large amount of money supporting the arts. Some people support this, while others believe the money should be spent on healthcare and education instead. Discuss both views and give your own opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 16,
    "vocabularyList": [
      {
        "term": "government funding",
        "definitionVi": "tài trợ của chính phủ",
        "example": "Government funding for the arts supports cultural development."
      },
      {
        "term": "allocate budget",
        "definitionVi": "phân bổ ngân sách",
        "example": "The government must allocate its budget wisely to meet all social needs."
      },
      {
        "term": "public money",
        "definitionVi": "tiền thuế công",
        "example": "Critics argue that public money should be spent on essential services."
      },
      {
        "term": "essential services",
        "definitionVi": "dịch vụ thiết yếu",
        "example": "Healthcare and education are among the most essential services."
      },
      {
        "term": "taxpayers",
        "definitionVi": "người đóng thuế",
        "example": "Taxpayers expect their money to be invested in practical needs."
      },
      {
        "term": "cultural identity",
        "definitionVi": "bản sắc văn hóa",
        "example": "The arts play a vital role in maintaining cultural identity."
      },
      {
        "term": "preserve heritage",
        "definitionVi": "bảo tồn di sản",
        "example": "Governments have a duty to preserve heritage for future generations."
      },
      {
        "term": "performing arts",
        "definitionVi": "nghệ thuật biểu diễn",
        "example": "Performing arts such as theatre and dance enrich community life."
      },
      {
        "term": "national pride",
        "definitionVi": "niềm tự hào dân tộc",
        "example": "Thriving arts industries can foster national pride."
      },
      {
        "term": "social cohesion",
        "definitionVi": "sự gắn kết xã hội",
        "example": "Arts and culture strengthen social cohesion within communities."
      },
      {
        "term": "stimulate creativity",
        "definitionVi": "kích thích sáng tạo",
        "example": "Investment in the arts can stimulate creativity across other sectors."
      },
      {
        "term": "boost tourism",
        "definitionVi": "thúc đẩy du lịch",
        "example": "Art exhibitions and museums boost tourism and generate revenue."
      },
      {
        "term": "economic benefits",
        "definitionVi": "lợi ích kinh tế",
        "example": "Cultural investment can bring significant economic benefits to a country."
      },
      {
        "term": "investment in the arts",
        "definitionVi": "đầu tư vào nghệ thuật",
        "example": "Investment in the arts generates returns both culturally and economically."
      },
      {
        "term": "enrich peoples lives",
        "definitionVi": "làm phong phú đời sống con người",
        "example": "The arts enrich peoples lives and promote well-being."
      },
      {
        "term": "cultural heritage",
        "definitionVi": "di sản văn hóa",
        "example": "The arts preserve a nation's cultural heritage for future generations."
      },
      {
        "term": "arts subsidy",
        "definitionVi": "trợ cấp nghệ thuật",
        "example": "Arts subsidies allow theatres and galleries to keep ticket prices affordable."
      },
      {
        "term": "creative industry",
        "definitionVi": "ngành công nghiệp sáng tạo",
        "example": "The creative industry contributes billions to the national economy each year."
      },
      {
        "term": "public funding",
        "definitionVi": "tài trợ công",
        "example": "Public funding ensures that arts institutions remain accessible to all citizens."
      },
      {
        "term": "artistic expression",
        "definitionVi": "biểu đạt nghệ thuật",
        "example": "Freedom of artistic expression is a cornerstone of a democratic society."
      },
      {
        "term": "enrich cultural life",
        "definitionVi": "làm phong phú đời sống văn hóa",
        "example": "Public funding for the arts helps enrich the cultural life of a nation."
      },
      {
        "term": "divert funds away from",
        "definitionVi": "chuyển hướng ngân sách ra khỏi",
        "example": "Critics argue arts funding diverts funds away from essential services."
      },
      {
        "term": "nurture creative talent",
        "definitionVi": "nuôi dưỡng tài năng sáng tạo",
        "example": "Public grants help nurture creative talent that might otherwise go unsupported."
      },
      {
        "term": "justify public spending on",
        "definitionVi": "biện minh cho chi tiêu công vào",
        "example": "It can be difficult to justify public spending on the arts during a recession."
      },
      {
        "term": "preserve cultural identity",
        "definitionVi": "bảo tồn bản sắc văn hóa",
        "example": "State funding helps preserve cultural identity through traditional art forms."
      },
      {
        "term": "stimulate the local economy",
        "definitionVi": "kích thích nền kinh tế địa phương",
        "example": "Arts festivals can stimulate the local economy through tourism."
      },
      {
        "term": "compete for limited resources",
        "definitionVi": "cạnh tranh vì nguồn lực hạn chế",
        "example": "The arts sector must compete for limited resources with healthcare and education."
      },
      {
        "term": "foster national pride",
        "definitionVi": "nuôi dưỡng niềm tự hào dân tộc",
        "example": "Successful cultural institutions can foster national pride."
      },
      {
        "term": "democratise access to culture",
        "definitionVi": "phổ cập hóa khả năng tiếp cận văn hóa",
        "example": "Public funding helps democratise access to culture for low-income citizens."
      },
      {
        "term": "yield intangible benefits",
        "definitionVi": "mang lại những lợi ích vô hình",
        "example": "Investment in the arts yields intangible benefits like well-being and creativity."
      }
    ],
    "questions": [
      {
        "questionId": "w10t16_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài có \"Discuss both views and give your own opinion.\" Ý kiến cá nhân nên xuất hiện ở đâu trong bài essay?",
        "options": [
          "Chỉ ở kết luận",
          "Ở Thesis Statement (cuối Introduction) VÀ nhắc lại trong kết luận",
          "Chỉ ở đầu bài, trước phần trình bày",
          "Ở giữa mỗi body paragraph"
        ],
        "baseWords": [],
        "correctAnswer": "Ở Thesis Statement (cuối Introduction) VÀ nhắc lại trong kết luận",
        "explanationVi": "Dạng Discuss Both Views: nêu ý kiến cá nhân trong Thesis Statement và nhất quán đến kết luận. Một số bài xuất sắc còn dẫn dắt ý kiến vào cả body paragraphs.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w10t16_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"The government has a responsibility to _____ its budget wisely, ensuring that both cultural and essential services receive adequate support.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "allocate",
        "explanationVi": "\"Allocate budget\" = phân bổ ngân sách — động từ quan trọng khi bàn về chi tiêu của chính phủ.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w10t16_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng chính phủ nên chi tiền để hỗ trợ nghệ thuật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that the government should provide funding to support the arts.",
        "explanationVi": "'Provide funding to support' = cung cấp tài trợ để hỗ trợ. 'Some people argue that' = cấu trúc chuẩn khi trình bày một quan điểm.",
        "modelAnswer": "Some people argue that the government should provide funding to support the arts.",
        "fallbackKeywords": [
          "government funding",
          "arts",
          "support",
          "argue"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w10t16_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các dịch vụ thiết yếu như bệnh viện và trường học cần được ưu tiên hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Essential services such as hospitals and schools need to be prioritized.",
        "explanationVi": "'Such as + examples' = ví dụ như. 'Need to be prioritized' = cần được ưu tiên (passive). 'Essential services' = dịch vụ thiết yếu.",
        "modelAnswer": "Essential services such as hospitals and schools need to be prioritized.",
        "fallbackKeywords": [
          "essential services",
          "hospitals",
          "schools",
          "prioritized"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w10t16_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng nghệ thuật giúp duy trì bản sắc văn hóa và truyền thống dân tộc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that the arts help maintain cultural identity and national traditions.",
        "explanationVi": "'Help + V' = giúp làm gì. 'Cultural identity' = bản sắc văn hóa. 'National traditions' = truyền thống dân tộc.",
        "modelAnswer": "Some people argue that the arts help maintain cultural identity and national traditions.",
        "fallbackKeywords": [
          "cultural identity",
          "national traditions",
          "arts",
          "maintain"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w10t16_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Việc đầu tư vào nghệ thuật có thể kích thích sự sáng tạo trong xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investment in the arts can stimulate creativity across society.",
        "explanationVi": "'Investment in + N' = đầu tư vào. 'Stimulate creativity' = kích thích sáng tạo. 'Across society' = trong toàn xã hội.",
        "modelAnswer": "Investment in the arts can stimulate creativity across society.",
        "fallbackKeywords": [
          "investment",
          "arts",
          "stimulate creativity",
          "society"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w10t16_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp thành câu hoàn chỉnh:\n\n[Although / the government / supports / cultural development / through / arts funding, / critics / argue / that / public money / is / better spent / on / essential services]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although the government supports cultural development through arts funding, critics argue that public money is better spent on essential services.",
        "explanationVi": "\"Although + clause, + clause\" — đối lập hai quan điểm. \"Better spent on\" = được chi tiêu tốt hơn cho.",
        "fallbackKeywords": [],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w10t16_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi gì? Hãy sửa lại:\n\n\"Art exhibitions and performing arts can boost tourism and bring economic benefit to a country.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.",
        "explanationVi": "Lỗi: \"economic benefit\" sau \"bring\" cần số nhiều: \"economic benefits\". Thêm \"significant\" để câu học thuật hơn.",
        "modelAnswer": "Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.",
        "fallbackKeywords": [
          "art exhibitions",
          "performing arts",
          "tourism",
          "economic benefits"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w10t16_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nghệ thuật có thể giúp tăng cường sự gắn kết xã hội và niềm tự hào dân tộc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The arts can help strengthen social cohesion and foster national pride.",
        "explanationVi": "'Strengthen social cohesion' = tăng cường sự gắn kết xã hội. 'Foster national pride' = nuôi dưỡng niềm tự hào dân tộc. 'Foster' = formal synonym for 'develop/encourage'.",
        "modelAnswer": "The arts can help strengthen social cohesion and foster national pride.",
        "fallbackKeywords": [
          "social cohesion",
          "national pride",
          "arts",
          "strengthen"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w10t16_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Viết lại câu sau mà không dùng: government, spend money, supporting the arts, more important things:\n\n\"Some people believe that the government should spend money on supporting the arts, while others think it should be spent on more important things.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.",
        "explanationVi": "Paraphrase: 'government' → 'public funds', 'spend money on arts' → 'directed towards cultural endeavours', 'more important things' → 'higher-priority sectors'.",
        "modelAnswer": "There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.",
        "fallbackKeywords": [
          "public funds",
          "cultural",
          "artistic endeavours",
          "higher-priority",
          "sectors"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w10t16_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"government funding\" và \"support the arts\"):\n\n\"Một số người cho rằng chính phủ nên chi tiền để hỗ trợ nghệ thuật.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that the government should provide funding to support the arts.",
        "explanationVi": "'Provide funding to + V' = cung cấp ngân sách để. 'The arts' (có mạo từ 'the') = nghệ thuật nói chung. 'Argue that' = cho rằng/lập luận rằng.",
        "modelAnswer": "Some people argue that the government should provide funding to support the arts.",
        "fallbackKeywords": [
          "government funding",
          "support the arts",
          "provide"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w10t16_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"healthcare\" và \"education\"):\n\n\"Những người khác tin rằng ngân sách này nên được dùng cho các lĩnh vực quan trọng hơn như y tế hoặc giáo dục.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Others believe that this budget should be spent on more important areas such as healthcare or education.",
        "explanationVi": "'Should be spent on' = bị động, nên được chi vào. 'Such as' = chẳng hạn như. 'More important areas' = các lĩnh vực quan trọng hơn.",
        "modelAnswer": "Others believe that this budget should be spent on more important areas such as healthcare or education.",
        "fallbackKeywords": [
          "healthcare",
          "education",
          "budget",
          "more important"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w10t16_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"public money\" và \"taxpayers\"):\n\n\"Tiền công từ người nộp thuế nên được sử dụng một cách khôn ngoan.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Public money from taxpayers should be used wisely.",
        "explanationVi": "'Should be used + adverb' = bị động + trạng từ. 'Wisely' = một cách khôn ngoan. 'Public money from taxpayers' = tiền công từ người nộp thuế.",
        "modelAnswer": "Public money from taxpayers should be used wisely.",
        "fallbackKeywords": [
          "public money",
          "taxpayers",
          "wisely"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w10t16_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"cultural identity\" và \"preserve heritage\"):\n\n\"Một số người cho rằng nghệ thuật giúp duy trì bản sắc văn hóa và truyền thống dân tộc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that the arts help maintain cultural identity and preserve national heritage.",
        "explanationVi": "'Help + V (bare infinitive)' = giúp làm gì (không cần 'to'). 'Maintain' và 'preserve' là hai động từ song song. 'National heritage' = di sản văn hóa dân tộc.",
        "modelAnswer": "Some people argue that the arts help maintain cultural identity and preserve national heritage.",
        "fallbackKeywords": [
          "cultural identity",
          "preserve heritage",
          "national traditions"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w10t16_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"art exhibitions\", \"performing arts\", và \"economic benefits\"):\n\n\"Các triển lãm nghệ thuật và biểu diễn có thể thu hút khách du lịch và mang lại lợi ích kinh tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Art exhibitions and performing arts can attract tourists and bring significant economic benefits.",
        "explanationVi": "'Attract tourists' = thu hút khách du lịch. 'Bring significant economic benefits' = mang lại lợi ích kinh tế đáng kể. Hai vị ngữ song song: attract... and bring...",
        "modelAnswer": "Art exhibitions and performing arts can attract tourists and bring significant economic benefits.",
        "fallbackKeywords": [
          "art exhibitions",
          "performing arts",
          "economic benefits",
          "tourists"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w10t16_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"investment in the arts\" và \"stimulate creativity\"):\n\n\"Việc đầu tư vào nghệ thuật có thể kích thích sự sáng tạo trong xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investment in the arts can stimulate creativity across society.",
        "explanationVi": "'Stimulate creativity' = kích thích sự sáng tạo. 'Across society' = trên toàn xã hội/trong xã hội. 'Investment in the arts' = đầu tư vào nghệ thuật.",
        "modelAnswer": "Investment in the arts can stimulate creativity across society.",
        "fallbackKeywords": [
          "investment in the arts",
          "stimulate creativity",
          "society"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w10t16_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"budget constraints\" và \"financial burden\"):\n\n\"Tuy nhiên, trong thời kỳ khủng hoảng kinh tế, chính phủ phải đối mặt với hạn chế ngân sách.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, during periods of economic crisis, governments face significant budget constraints and financial burdens.",
        "explanationVi": "'During periods of + N' = trong thời kỳ. 'Face + N' = đối mặt với. 'Budget constraints' = hạn chế ngân sách, 'financial burdens' = gánh nặng tài chính.",
        "modelAnswer": "However, during periods of economic crisis, governments face significant budget constraints and financial burdens.",
        "fallbackKeywords": [
          "budget constraints",
          "financial burden",
          "economic crisis"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w10t16_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social cohesion\" và \"national pride\"):\n\n\"Nghệ thuật có thể giúp tăng cường sự gắn kết xã hội và niềm tự hào dân tộc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The arts can help strengthen social cohesion and foster a sense of national pride.",
        "explanationVi": "'Strengthen' = tăng cường. 'Foster a sense of' = nuôi dưỡng/tạo ra cảm giác. 'Social cohesion' = sự gắn kết xã hội; 'national pride' = niềm tự hào dân tộc.",
        "modelAnswer": "The arts can help strengthen social cohesion and foster a sense of national pride.",
        "fallbackKeywords": [
          "social cohesion",
          "national pride",
          "strengthen"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w10t16_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"government responsibility\" và \"investment in the arts\"):\n\n\"Một số người tin rằng đầu tư vào nghệ thuật là một phần trách nhiệm của chính phủ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that investment in the arts is part of the government's responsibility.",
        "explanationVi": "'Part of the government's responsibility' = một phần trách nhiệm của chính phủ. Dùng sở hữu cách 'government's' thay vì 'of the government'.",
        "modelAnswer": "Some people believe that investment in the arts is part of the government's responsibility.",
        "fallbackKeywords": [
          "government responsibility",
          "investment in the arts",
          "part of"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w10t16_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"long-term development\" và \"balance between economy and culture\"):\n\n\"Về lâu dài, cả phát triển kinh tế và văn hóa đều cần được quan tâm song song.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.",
        "explanationVi": "'In the long term' = về lâu dài. 'Both A and B need to be addressed' = cả A lẫn B cần được giải quyết. 'Simultaneously' = đồng thời/song song.",
        "modelAnswer": "In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.",
        "fallbackKeywords": [
          "long-term development",
          "economic",
          "cultural",
          "simultaneously"
        ],
        "orderIndex": 21,
        "isActive": true
      }
    ]
  },
  {
    "week": 16,
    "block": "mixed",
    "topicName": "Youth Crime and Solutions",
    "topicEmoji": "⚖️",
    "essayType": "cause_solution",
    "prompt": "In many countries, children and teenagers are committing more crimes than in the past. Why is this happening? How should young people who break the law be punished?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 17,
    "vocabularyList": [
      {
        "term": "youth crime",
        "definitionVi": "tội phạm thanh thiếu niên",
        "example": "Youth crime is a growing concern in many urban areas."
      },
      {
        "term": "juvenile delinquency",
        "definitionVi": "tình trạng phạm tội ở thanh thiếu niên",
        "example": "Poverty and lack of education contribute to juvenile delinquency."
      },
      {
        "term": "peer pressure",
        "definitionVi": "áp lực từ bạn bè",
        "example": "Peer pressure is a key factor in youth crime."
      },
      {
        "term": "lack of parental supervision",
        "definitionVi": "thiếu sự giám sát của cha mẹ",
        "example": "A lack of parental supervision leaves young people more vulnerable to crime."
      },
      {
        "term": "family breakdown",
        "definitionVi": "gia đình tan vỡ",
        "example": "Family breakdown is a major social factor contributing to youth crime."
      },
      {
        "term": "poverty",
        "definitionVi": "đói nghèo",
        "example": "Poverty deprives young people of legitimate opportunities."
      },
      {
        "term": "unemployment",
        "definitionVi": "thất nghiệp",
        "example": "High youth unemployment is linked to rising crime rates."
      },
      {
        "term": "rehabilitation programs",
        "definitionVi": "chương trình cải tạo",
        "example": "Rehabilitation programs help young offenders reform their behaviour."
      },
      {
        "term": "counseling and guidance",
        "definitionVi": "tư vấn và hướng dẫn",
        "example": "Counseling and guidance can help troubled youth make better choices."
      },
      {
        "term": "create job opportunities",
        "definitionVi": "tạo cơ hội việc làm",
        "example": "Creating job opportunities for youth reduces the appeal of criminal activity."
      },
      {
        "term": "strengthen family bonds",
        "definitionVi": "củng cố mối liên kết gia đình",
        "example": "Strengthening family bonds is an effective crime prevention strategy."
      },
      {
        "term": "government intervention",
        "definitionVi": "sự can thiệp của chính phủ",
        "example": "Government intervention is needed to address the root causes of youth crime."
      },
      {
        "term": "public awareness campaigns",
        "definitionVi": "chiến dịch nâng cao nhận thức",
        "example": "Public awareness campaigns help communities understand and prevent crime."
      },
      {
        "term": "positive role models",
        "definitionVi": "hình mẫu tích cực",
        "example": "Access to positive role models helps young people make responsible decisions."
      },
      {
        "term": "crime prevention",
        "definitionVi": "phòng ngừa tội phạm",
        "example": "Education and employment are key pillars of crime prevention."
      },
      {
        "term": "community service",
        "definitionVi": "phục vụ cộng đồng",
        "example": "Community service is often used as an alternative to imprisonment for young offenders."
      },
      {
        "term": "socioeconomic inequality",
        "definitionVi": "bất bình đẳng kinh tế – xã hội",
        "example": "Socioeconomic inequality is strongly linked to higher rates of youth crime."
      },
      {
        "term": "mentorship programme",
        "definitionVi": "chương trình cố vấn",
        "example": "Mentorship programmes help at-risk young people make positive life choices."
      },
      {
        "term": "recidivism",
        "definitionVi": "tái phạm tội",
        "example": "Education and job training programmes significantly reduce recidivism rates."
      },
      {
        "term": "early intervention",
        "definitionVi": "can thiệp sớm",
        "example": "Early intervention programmes can prevent at-risk youth from committing crimes."
      },
      {
        "term": "fall into a life of crime",
        "definitionVi": "rơi vào con đường phạm tội",
        "example": "Without guidance, vulnerable teenagers may fall into a life of crime."
      },
      {
        "term": "tackle the underlying causes of",
        "definitionVi": "giải quyết nguyên nhân sâu xa của",
        "example": "Effective policy must tackle the underlying causes of youth crime."
      },
      {
        "term": "steer young people away from",
        "definitionVi": "hướng giới trẻ tránh xa khỏi",
        "example": "Community programmes aim to steer young people away from gangs."
      },
      {
        "term": "provide constructive outlets for",
        "definitionVi": "cung cấp lối thoát mang tính xây dựng cho",
        "example": "Sports clubs provide constructive outlets for troubled teenagers' energy."
      },
      {
        "term": "break the cycle of offending",
        "definitionVi": "phá vỡ vòng lặp tái phạm tội",
        "example": "Rehabilitation programmes aim to break the cycle of youth offending."
      },
      {
        "term": "come from broken homes",
        "definitionVi": "xuất thân từ những gia đình tan vỡ",
        "example": "A disproportionate number of young offenders come from broken homes."
      },
      {
        "term": "instil a sense of responsibility",
        "definitionVi": "hình thành ý thức trách nhiệm",
        "example": "Mentorship can instil a sense of responsibility in at-risk youth."
      },
      {
        "term": "reintegrate offenders into society",
        "definitionVi": "tái hòa nhập người phạm tội vào xã hội",
        "example": "Support services help reintegrate young offenders into society."
      },
      {
        "term": "address socioeconomic root causes",
        "definitionVi": "giải quyết nguyên nhân gốc rễ về kinh tế-xã hội",
        "example": "Long-term solutions must address socioeconomic root causes of crime."
      },
      {
        "term": "curb rising crime rates",
        "definitionVi": "kiềm chế tỷ lệ tội phạm gia tăng",
        "example": "Community policing has helped curb rising crime rates in some areas."
      }
    ],
    "questions": [
      {
        "questionId": "w10t17_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài hỏi \"What are the causes of this problem? How can it be solved?\" — đây là dạng essay nào?",
        "options": [
          "Discuss Both Views",
          "Advantages & Disadvantages",
          "Cause & Solution",
          "Agree or Disagree"
        ],
        "baseWords": [],
        "correctAnswer": "Cause & Solution",
        "explanationVi": "Hai câu hỏi rõ ràng: \"causes\" = nguyên nhân, \"solved\" = giải pháp. Dạng Cause & Solution: 1 đoạn nguyên nhân + 1 đoạn giải pháp, không được trộn lẫn.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w10t17_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Young people who grow up in broken families or poverty are more _____ to criminal behavior.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "susceptible",
        "explanationVi": "\"Susceptible to\" = dễ bị ảnh hưởng bởi — cụm từ học thuật quan trọng. \"Vulnerable to\" cũng chấp nhận được với nghĩa tương tự.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w10t17_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tỷ lệ tội phạm trong giới trẻ đang gia tăng nhanh chóng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The crime rate among young people is increasing rapidly.",
        "explanationVi": "'Crime rate' = tỷ lệ tội phạm. 'Among young people' = trong giới trẻ. 'Is increasing rapidly' = đang tăng nhanh (Present Continuous nhấn mạnh xu hướng).",
        "modelAnswer": "The crime rate among young people is increasing rapidly.",
        "fallbackKeywords": [
          "crime rate",
          "young people",
          "increasing rapidly"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w10t17_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Áp lực từ bạn bè và thiếu sự giám sát của cha mẹ là những nguyên nhân chính của vấn đề này.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Peer pressure and a lack of parental supervision are the main causes of this problem.",
        "explanationVi": "'A lack of parental supervision' = sự thiếu giám sát của cha mẹ. 'The main causes of' = những nguyên nhân chính của. Số nhiều 'causes' + 'are'.",
        "modelAnswer": "Peer pressure and a lack of parental supervision are the main causes of this problem.",
        "fallbackKeywords": [
          "peer pressure",
          "parental supervision",
          "causes",
          "problem"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w10t17_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Nhiều thanh thiếu niên phạm tội vì đến từ những gia đình tan vỡ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many young people commit crimes because they come from families affected by breakdown.",
        "explanationVi": "'Commit crimes' = phạm tội. 'Family breakdown' = gia đình tan vỡ. 'Because + clause' = vì/do (nguyên nhân).",
        "modelAnswer": "Many young people commit crimes because they come from families affected by breakdown.",
        "fallbackKeywords": [
          "young people",
          "commit crimes",
          "family breakdown"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w10t17_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các chương trình cải tạo và tư vấn có thể giúp thanh thiếu niên thay đổi hành vi.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rehabilitation programs and counseling can help young people change their behavior.",
        "explanationVi": "'Help + O + V' = giúp ai đó làm gì. 'Rehabilitation programs' = chương trình cải tạo. 'Counseling' = tư vấn tâm lý.",
        "modelAnswer": "Rehabilitation programs and counseling can help young people change their behavior.",
        "fallbackKeywords": [
          "rehabilitation programs",
          "counseling",
          "young people",
          "behavior"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w10t17_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp thành câu hoàn chỉnh:\n\n[poverty, unemployment, / Such / as / social factors / and / can / a lack of discipline / drive / to / young people / commit crimes]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Such social factors as poverty, unemployment, and a lack of discipline can drive young people to commit crimes.",
        "explanationVi": "\"Such + noun + as + examples\" = ví dụ như — cấu trúc liệt kê học thuật. \"Drive someone to + V\" = thúc đẩy ai đó làm gì.",
        "fallbackKeywords": [],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w10t17_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi gì? Hãy sửa lại:\n\n\"To solve this problem, the government should to create more job opportunities for young people.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "To solve this problem, the government should create more job opportunities for young people.",
        "explanationVi": "Lỗi: Sau \"should\" không dùng \"to + V\". Bỏ \"to\" trước \"create\".",
        "modelAnswer": "To solve this problem, the government should create more job opportunities for young people.",
        "fallbackKeywords": [
          "government",
          "should create",
          "job opportunities",
          "young people"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w10t17_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các chiến dịch nâng cao nhận thức cộng đồng có thể giúp giảm hành vi tội phạm trong giới trẻ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Public awareness campaigns can help reduce criminal behavior among young people.",
        "explanationVi": "'Public awareness campaigns' = chiến dịch nâng cao nhận thức cộng đồng. 'Criminal behavior among' = hành vi tội phạm trong giới. 'Help + V' = giúp làm gì.",
        "modelAnswer": "Public awareness campaigns can help reduce criminal behavior among young people.",
        "fallbackKeywords": [
          "public awareness campaigns",
          "reduce",
          "criminal behavior",
          "young people"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w10t17_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Viết lại câu sau mà không dùng: crime rate, young people, increasing rapidly:\n\n\"The crime rate among young people is increasing rapidly.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.",
        "explanationVi": "Paraphrase: 'crime rate increasing' → 'sharp rise in... unlawful behaviour', 'young people' → 'adolescents and young adults'. 'Engaging in unlawful behaviour' = tham gia hành vi phạm pháp.",
        "modelAnswer": "There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.",
        "fallbackKeywords": [
          "adolescents",
          "unlawful behaviour",
          "sharp rise",
          "recent years"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w10t17_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"youth crime\"):\n\n\"Tỷ lệ tội phạm trong giới trẻ đang gia tăng nhanh chóng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The rate of youth crime is increasing rapidly.",
        "explanationVi": "'The rate of + N + is increasing rapidly' = tỷ lệ đang tăng nhanh. Present Continuous nhấn mạnh xu hướng đang xảy ra. 'Rapidly' = một cách nhanh chóng.",
        "modelAnswer": "The rate of youth crime is increasing rapidly.",
        "fallbackKeywords": [
          "youth crime",
          "rate",
          "increasing rapidly"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w10t17_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"peer pressure\" và \"lack of parental supervision\"):\n\n\"Nguyên nhân chính của hiện tượng này là áp lực từ bạn bè và thiếu sự giám sát của cha mẹ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The main causes of this phenomenon are peer pressure and a lack of parental supervision.",
        "explanationVi": "'The main causes of this phenomenon are A and B' = liệt kê nguyên nhân theo cấu trúc song song. 'A lack of + N' = sự thiếu hụt về.",
        "modelAnswer": "The main causes of this phenomenon are peer pressure and a lack of parental supervision.",
        "fallbackKeywords": [
          "peer pressure",
          "lack of parental supervision",
          "main causes"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w10t17_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"juvenile delinquency\" và \"family breakdown\"):\n\n\"Nhiều thanh thiếu niên phạm tội vì đến từ những gia đình tan vỡ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.",
        "explanationVi": "'Stem from' = xuất phát từ/có nguồn gốc từ. 'Juvenile delinquency' = tội phạm vị thành niên. 'Families affected by breakdown' = gia đình tan vỡ (mệnh đề quan hệ rút gọn).",
        "modelAnswer": "Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.",
        "fallbackKeywords": [
          "juvenile delinquency",
          "family breakdown",
          "stem from"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w10t17_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"poverty\", \"unemployment\", và \"youth crime\"):\n\n\"Nghèo đói và thất nghiệp là hai yếu tố quan trọng dẫn đến tội phạm vị thành niên.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Poverty and unemployment are two significant factors contributing to youth crime.",
        "explanationVi": "'Factors contributing to + N' = các yếu tố góp phần vào (participial phrase rút gọn mệnh đề quan hệ). 'Significant' = đáng kể/quan trọng.",
        "modelAnswer": "Poverty and unemployment are two significant factors contributing to youth crime.",
        "fallbackKeywords": [
          "poverty",
          "unemployment",
          "youth crime",
          "contributing"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w10t17_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social media influence\" và \"exposure to violence\"):\n\n\"Một số người trẻ bị ảnh hưởng tiêu cực bởi mạng xã hội hoặc tiếp xúc với bạo lực.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some young people are negatively influenced by social media or exposure to violence.",
        "explanationVi": "'Are negatively influenced by' = bị ảnh hưởng tiêu cực bởi (bị động). 'Exposure to violence' = tiếp xúc với bạo lực — danh từ không đếm được.",
        "modelAnswer": "Some young people are negatively influenced by social media or exposure to violence.",
        "fallbackKeywords": [
          "social media influence",
          "exposure to violence",
          "negatively influenced"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w10t17_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"drug and alcohol abuse\" và \"aggressive behavior\"):\n\n\"Lạm dụng ma túy và rượu cũng góp phần làm gia tăng hành vi tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.",
        "explanationVi": "'Contribute to the rise in + N' = góp phần vào sự gia tăng của. 'Drug and alcohol abuse' là chủ ngữ số nhiều → 'contribute' (không có 's').",
        "modelAnswer": "Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.",
        "fallbackKeywords": [
          "drug and alcohol abuse",
          "aggressive behavior",
          "contribute"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w10t17_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"crime prevention\" và \"improve education system\"):\n\n\"Để ngăn ngừa tội phạm trong giới trẻ, chính phủ cần tăng cường giáo dục và hướng nghiệp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.",
        "explanationVi": "'To ensure + N' = để đảm bảo. 'Needs to + V' = cần phải. 'Vocational guidance' = hướng nghiệp. Hai vị ngữ song song: improve... and expand...",
        "modelAnswer": "To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.",
        "fallbackKeywords": [
          "crime prevention",
          "improve education system",
          "vocational guidance"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w10t17_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"family bonds\" và \"moral values\"):\n\n\"Gia đình cần dành thời gian cho con cái để củng cố mối quan hệ và định hướng đạo đức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Families need to spend time with their children to strengthen family bonds and instil moral values.",
        "explanationVi": "'Instil + N' = gieo trồng/định hướng (đặc biệt dùng cho giá trị đạo đức). 'Strengthen family bonds' = củng cố mối quan hệ gia đình. Hai V song song: strengthen... and instil...",
        "modelAnswer": "Families need to spend time with their children to strengthen family bonds and instil moral values.",
        "fallbackKeywords": [
          "family bonds",
          "moral values",
          "strengthen",
          "instil"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w10t17_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"stricter punishment\" và \"deter crime\"):\n\n\"Một số người tin rằng cần áp dụng hình phạt nghiêm khắc hơn để răn đe.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that stricter punishment is needed to deter crime.",
        "explanationVi": "'Is needed to + V' = cần phải (bị động). 'Deter crime' = ngăn chặn/răn đe tội phạm. 'Stricter punishment' = hình phạt nghiêm khắc hơn (so sánh hơn).",
        "modelAnswer": "Some people believe that stricter punishment is needed to deter crime.",
        "fallbackKeywords": [
          "stricter punishment",
          "deter crime",
          "needed"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w10t17_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"positive role models\" và \"peer pressure\"):\n\n\"Thanh thiếu niên cần những hình mẫu tích cực để noi theo thay vì bị ảnh hưởng bởi bạn bè xấu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Young people need positive role models to look up to instead of being swayed by negative peer pressure.",
        "explanationVi": "'Look up to' = noi gương/ngưỡng mộ. 'Instead of + V-ing' = thay vì. 'Swayed by' = bị ảnh hưởng/bị lôi kéo bởi. 'Negative peer pressure' = ảnh hưởng xấu từ bạn bè.",
        "modelAnswer": "Young people need positive role models to look up to instead of being swayed by negative peer pressure.",
        "fallbackKeywords": [
          "positive role models",
          "peer pressure",
          "instead of",
          "negative"
        ],
        "orderIndex": 22,
        "isActive": true
      }
    ]
  },
  {
    "week": 17,
    "block": "mixed",
    "topicName": "Prison vs. Rehabilitation",
    "topicEmoji": "🔒",
    "essayType": "discuss_both_views",
    "prompt": "Some people believe that all offenders should be sent to prison, while others argue that there are better alternatives for people who commit minor crimes, such as doing community service. Discuss both views and give your own opinion.",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 18,
    "vocabularyList": [
      {
        "term": "prison sentence",
        "definitionVi": "án tù",
        "example": "Longer prison sentences are sometimes seen as a deterrent to crime."
      },
      {
        "term": "deterrent",
        "definitionVi": "biện pháp răn đe",
        "example": "Long prison sentences may act as a deterrent, discouraging potential offenders."
      },
      {
        "term": "rehabilitation",
        "definitionVi": "cải tạo",
        "example": "Rehabilitation programs help prisoners become productive members of society."
      },
      {
        "term": "re-offend",
        "definitionVi": "tái phạm",
        "example": "Without rehabilitation, many offenders are likely to re-offend after release."
      },
      {
        "term": "law enforcement",
        "definitionVi": "thực thi pháp luật",
        "example": "Strong law enforcement is needed to maintain public order."
      },
      {
        "term": "alternative punishment",
        "definitionVi": "hình phạt thay thế",
        "example": "Community service is an alternative punishment to imprisonment."
      },
      {
        "term": "moral education",
        "definitionVi": "giáo dục đạo đức",
        "example": "Moral education in schools can help prevent youth crime."
      },
      {
        "term": "community service",
        "definitionVi": "lao động công ích",
        "example": "Community service allows offenders to repay their debt to society."
      },
      {
        "term": "counseling",
        "definitionVi": "tư vấn tâm lý",
        "example": "Counseling helps offenders address the root causes of their behaviour."
      },
      {
        "term": "reduce crime",
        "definitionVi": "giảm tội phạm",
        "example": "Both stricter sentences and rehabilitation aim to reduce crime in the long term."
      },
      {
        "term": "root causes",
        "definitionVi": "nguyên nhân gốc rễ",
        "example": "Prison alone does not tackle the root causes of criminal behaviour."
      },
      {
        "term": "vocational training",
        "definitionVi": "đào tạo nghề",
        "example": "Vocational training gives prisoners marketable skills for life after release."
      },
      {
        "term": "reintegrate into society",
        "definitionVi": "tái hòa nhập xã hội",
        "example": "Rehabilitation helps offenders reintegrate into society as law-abiding citizens."
      },
      {
        "term": "capital punishment",
        "definitionVi": "án tử hình",
        "example": "Capital punishment remains a controversial topic in criminal justice debates."
      },
      {
        "term": "social support",
        "definitionVi": "hỗ trợ xã hội",
        "example": "Social support networks are essential for offenders returning to the community."
      },
      {
        "term": "reintegration",
        "definitionVi": "tái hòa nhập xã hội",
        "example": "Successful reintegration into society reduces the likelihood of reoffending."
      },
      {
        "term": "deterrence",
        "definitionVi": "sự răn đe",
        "example": "Harsh sentences are intended to act as a deterrence for potential criminals."
      },
      {
        "term": "restorative justice",
        "definitionVi": "tư pháp phục hồi",
        "example": "Restorative justice focuses on repairing harm rather than punishing offenders."
      },
      {
        "term": "rehabilitation programme",
        "definitionVi": "chương trình cải tạo",
        "example": "Rehabilitation programmes teach prisoners vocational skills for life after release."
      },
      {
        "term": "prison overcrowding",
        "definitionVi": "quá tải trại giam",
        "example": "Prison overcrowding undermines efforts to rehabilitate offenders."
      },
      {
        "term": "act as a deterrent",
        "definitionVi": "đóng vai trò như một biện pháp răn đe",
        "example": "Harsh sentences are meant to act as a deterrent to future crime."
      },
      {
        "term": "fail to address root causes",
        "definitionVi": "không giải quyết được nguyên nhân gốc rễ",
        "example": "Long sentences alone fail to address the root causes of crime."
      },
      {
        "term": "reduce reoffending rates",
        "definitionVi": "giảm tỷ lệ tái phạm",
        "example": "Rehabilitation programmes have been shown to reduce reoffending rates."
      },
      {
        "term": "come at a great cost to society",
        "definitionVi": "gây tốn kém lớn cho xã hội",
        "example": "Mass incarceration comes at a great cost to society."
      },
      {
        "term": "equip offenders with skills",
        "definitionVi": "trang bị kỹ năng cho phạm nhân",
        "example": "Vocational programmes equip offenders with skills for life after release."
      },
      {
        "term": "serve as a wake-up call",
        "definitionVi": "đóng vai trò như một lời cảnh tỉnh",
        "example": "A short custodial sentence can serve as a wake-up call for first-time offenders."
      },
      {
        "term": "perpetuate a cycle of crime",
        "definitionVi": "duy trì vòng luẩn quẩn của tội phạm",
        "example": "Overcrowded prisons can perpetuate a cycle of crime rather than break it."
      },
      {
        "term": "prioritise rehabilitation over punishment",
        "definitionVi": "ưu tiên phục hồi hơn trừng phạt",
        "example": "Some countries prioritise rehabilitation over punishment with notable success."
      },
      {
        "term": "ease overcrowding in prisons",
        "definitionVi": "giảm bớt tình trạng quá tải trong nhà tù",
        "example": "Alternative sentencing can help ease overcrowding in prisons."
      },
      {
        "term": "restore offenders to productive life",
        "definitionVi": "đưa phạm nhân trở lại cuộc sống có ích",
        "example": "Restorative justice aims to restore offenders to a productive life."
      }
    ],
    "questions": [
      {
        "questionId": "w11t18_q01",
        "level": "beginner",
        "type": "essay_type_recognition",
        "questionText": "Đề bài: \"Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion.\" Đây là dạng essay gì?",
        "options": [
          "Advantages & Disadvantages",
          "Cause & Effect",
          "Discuss Both Views",
          "Opinion Essay"
        ],
        "baseWords": [],
        "correctAnswer": "Discuss Both Views",
        "explanationVi": "Cụm \"Discuss both views and give your own opinion\" xuất hiện trực tiếp. View 1 = án tù dài; View 2 = các phương pháp thay thế như cải tạo và giáo dục.",
        "fallbackKeywords": [],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w11t18_q02",
        "level": "beginner",
        "type": "fill_blank",
        "questionText": "Điền từ còn thiếu:\n\n\"Longer prison sentences may act as a strong _____, discouraging potential offenders from committing crimes.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "deterrent",
        "explanationVi": "\"Deterrent\" = biện pháp răn đe — từ khóa quan trọng khi lập luận về tác dụng của hình phạt tù.",
        "fallbackKeywords": [],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w11t18_q03",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Một số người cho rằng cách tốt nhất để giảm tội phạm là áp dụng mức án tù dài hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people argue that the best way to reduce crime is to impose longer prison sentences.",
        "explanationVi": "'Impose prison sentences' = áp đặt/tuyên bố mức án tù. 'The best way to' = cách tốt nhất để. 'Some people argue that' = cấu trúc trình bày quan điểm.",
        "modelAnswer": "Some people argue that the best way to reduce crime is to impose longer prison sentences.",
        "fallbackKeywords": [
          "reduce crime",
          "longer prison sentences",
          "argue",
          "impose"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w11t18_q04",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Tuy nhiên, nhiều người tin rằng tăng án tù không giải quyết nguyên nhân gốc rễ của tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "However, many people believe that increasing prison sentences does not address the root causes of crime.",
        "explanationVi": "'Root causes' = nguyên nhân gốc rễ. 'Address the root causes' = giải quyết nguyên nhân gốc rễ. 'Does not address' = không giải quyết.",
        "modelAnswer": "However, many people believe that increasing prison sentences does not address the root causes of crime.",
        "fallbackKeywords": [
          "root causes",
          "crime",
          "prison sentences",
          "address"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w11t18_q05",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Các chương trình cải tạo giúp tù nhân hòa nhập lại xã hội và giảm tái phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.",
        "explanationVi": "'Reintegrate into society' = tái hòa nhập xã hội. 'Reduce the likelihood of re-offending' = giảm khả năng tái phạm. 'Help + O + V' = giúp ai làm gì.",
        "modelAnswer": "Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.",
        "fallbackKeywords": [
          "rehabilitation programs",
          "reintegrate",
          "society",
          "re-offending",
          "prisoners"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w11t18_q06",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Giáo dục đạo đức và hướng nghiệp có thể giúp thanh thiếu niên tránh xa tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Moral education and vocational training can help young people stay away from crime.",
        "explanationVi": "'Moral education' = giáo dục đạo đức. 'Vocational training' = đào tạo nghề. 'Stay away from crime' = tránh xa tội phạm.",
        "modelAnswer": "Moral education and vocational training can help young people stay away from crime.",
        "fallbackKeywords": [
          "moral education",
          "vocational training",
          "young people",
          "crime"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w11t18_q07",
        "level": "elementary",
        "type": "rearrange",
        "questionText": "Sắp xếp thành câu hoàn chỉnh:\n\n[longer prison sentences / Whilst / potential criminals, / may / deter / they / do not / tackle / poverty, / unemployment, / such / as / root causes / the / and / family breakdown]",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Whilst longer prison sentences may deter potential criminals, they do not tackle the root causes such as poverty, unemployment, and family breakdown.",
        "explanationVi": "\"Whilst\" = trong khi đó (British English). \"Deter\" = răn đe. \"Tackle root causes\" = giải quyết nguyên nhân gốc rễ.",
        "fallbackKeywords": [],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w11t18_q08",
        "level": "elementary",
        "type": "error_correction",
        "questionText": "Câu sau có lỗi gì? Hãy sửa lại:\n\n\"Community service is often seen as a more effectively alternative to imprisonment for minor offences.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community service is often seen as a more effective alternative to imprisonment for minor offences.",
        "explanationVi": "Lỗi: \"more effectively\" sai — phải dùng tính từ \"effective\" để bổ nghĩa cho danh từ \"alternative\".",
        "modelAnswer": "Community service is often seen as a more effective alternative to imprisonment for minor offences.",
        "fallbackKeywords": [
          "community service",
          "effective alternative",
          "imprisonment",
          "offences"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w11t18_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Giải quyết cả nguyên nhân gốc rễ và hậu quả của tội phạm, đồng thời hỗ trợ tù nhân hòa nhập trở lại xã hội, sẽ giúp xã hội an toàn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.",
        "explanationVi": "'Addressing both A and B' = giải quyết cả A lẫn B. 'Contribute to a safer community' = góp phần tạo ra xã hội an toàn hơn. 'Ultimately' = cuối cùng.",
        "modelAnswer": "Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.",
        "fallbackKeywords": [
          "root causes",
          "reintegrate",
          "society",
          "safer community",
          "addressing"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w11t18_q10",
        "level": "intermediate",
        "type": "paraphrase",
        "questionText": "Viết lại câu sau mà không dùng: best way, reduce crime, longer prison sentences, better ways:\n\n\"Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.",
        "explanationVi": "Paraphrase: 'prison sentences' → 'custodial sentences', 'reduce crime' → 'curbing criminal activity', 'better ways' → 'alternative, more rehabilitative approaches'.",
        "modelAnswer": "While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.",
        "fallbackKeywords": [
          "custodial sentences",
          "curbing",
          "criminal activity",
          "rehabilitative",
          "alternative approaches"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w11t18_q11",
        "level": "elementary",
        "type": "topic_sentence",
        "questionText": "Body paragraph dưới đây thiếu topic sentence. Chọn câu phù hợp nhất:\n\n\"___. Offenders who serve extended sentences are removed from society and deterred from future crimes by the prospect of harsh punishment. Moreover, this sends a clear message to others that criminal behaviour will not be tolerated.\"",
        "options": [
          "Crime rates are very high in many countries today.",
          "There are many ways to address the problem of crime.",
          "Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.",
          "Prison rehabilitation is not always successful in reducing re-offending."
        ],
        "baseWords": [],
        "correctAnswer": "Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.",
        "explanationVi": "Topic sentence cần phản ánh nội dung đoạn văn (án tù dài → bảo vệ xã hội, răn đe). Câu C giới thiệu chính xác luận điểm được triển khai.",
        "fallbackKeywords": [],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w11t18_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"crime rate\"):\n\n\"Tỷ lệ tội phạm đang tăng nhanh ở nhiều quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The crime rate is rising rapidly in many countries.",
        "explanationVi": "'The crime rate is rising rapidly' = Present Continuous diễn tả xu hướng đang xảy ra. 'Rising' hoặc 'increasing' đều được chấp nhận.",
        "modelAnswer": "The crime rate is rising rapidly in many countries.",
        "fallbackKeywords": [
          "crime rate",
          "rising rapidly",
          "countries"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w11t18_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"prison sentence\" và \"deterrent\"):\n\n\"Các bản án tù dài hơn được cho là có tác dụng răn đe mạnh mẽ hơn đối với tội phạm tiềm năng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Longer prison sentences are believed to have a stronger deterrent effect on potential criminals.",
        "explanationVi": "'Are believed to + V' = passive reporting verb — được cho là. 'Deterrent effect on' = tác dụng răn đe đối với. 'Potential criminals' = tội phạm tiềm năng.",
        "modelAnswer": "Longer prison sentences are believed to have a stronger deterrent effect on potential criminals.",
        "fallbackKeywords": [
          "prison sentence",
          "deterrent effect",
          "potential criminals",
          "stronger"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w11t18_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"strict punishment\" và \"deterrent\"):\n\n\"Hình phạt nghiêm khắc có thể là một biện pháp răn đe mạnh mẽ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Strict punishment can serve as a powerful deterrent against criminal behaviour.",
        "explanationVi": "'Serve as + N' = đóng vai trò là/có tác dụng như. 'A powerful deterrent against' = biện pháp răn đe mạnh mẽ chống lại. 'Criminal behaviour' = hành vi tội phạm.",
        "modelAnswer": "Strict punishment can serve as a powerful deterrent against criminal behaviour.",
        "fallbackKeywords": [
          "strict punishment",
          "deterrent",
          "powerful"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w11t18_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"repeat offender\" và \"public safety\"):\n\n\"Những người tái phạm có thể bị ngăn cản khỏi gây hại cho xã hội nếu bị giam lâu hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.",
        "explanationVi": "'Be prevented from + V-ing' = bị ngăn cản làm gì. 'Repeat offenders' = những người tái phạm. 'Endangering public safety' = gây nguy hiểm cho an toàn cộng đồng.",
        "modelAnswer": "Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.",
        "fallbackKeywords": [
          "repeat offender",
          "public safety",
          "imprisoned",
          "longer"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w11t18_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"root causes\" và \"prison sentence\"):\n\n\"Mặt khác, nhiều người tin rằng tăng án tù không giải quyết nguyên nhân gốc rễ của tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "On the other hand, many people believe that longer prison sentences do not address the root causes of crime.",
        "explanationVi": "'On the other hand' = mặt khác (connective để đối lập View 2). 'Do not address the root causes of' = không giải quyết nguyên nhân gốc rễ của.",
        "modelAnswer": "On the other hand, many people believe that longer prison sentences do not address the root causes of crime.",
        "fallbackKeywords": [
          "root causes",
          "prison sentence",
          "do not address"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w11t18_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"poverty\", \"unemployment\", và \"commit a crime\"):\n\n\"Nghèo đói và thất nghiệp là những nguyên nhân quan trọng dẫn đến tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Poverty and unemployment are significant underlying causes that drive people to commit a crime.",
        "explanationVi": "'Underlying causes' = nguyên nhân sâu xa. 'Drive + O + to + V' = thúc đẩy ai làm gì. 'Commit a crime' = phạm tội.",
        "modelAnswer": "Poverty and unemployment are significant underlying causes that drive people to commit a crime.",
        "fallbackKeywords": [
          "poverty",
          "unemployment",
          "commit a crime",
          "underlying causes"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w11t18_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"rehabilitation\" và \"vocational skills\"):\n\n\"Không giống như hình phạt truyền thống, các chương trình phục hồi trang bị cho người phạm tội kỹ năng nghề để xây dựng lại cuộc sống.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike traditional punishment, rehabilitation programmes equip offenders with vocational skills to rebuild their lives.",
        "explanationVi": "'Unlike + N' = không giống như. 'Equip + O + with + N' = trang bị cho ai điều gì. 'Vocational skills' = kỹ năng nghề nghiệp. 'Rebuild their lives' = xây dựng lại cuộc sống.",
        "modelAnswer": "Unlike traditional punishment, rehabilitation programmes equip offenders with vocational skills to rebuild their lives.",
        "fallbackKeywords": [
          "rehabilitation",
          "vocational skills",
          "equip",
          "offenders",
          "rebuild"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w11t18_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"community service\" và \"alternative punishment\"):\n\n\"Một số người tin rằng lao động công ích là một hình phạt thay thế hiệu quả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Some people believe that community service is an effective alternative punishment.",
        "explanationVi": "'An effective alternative punishment' = một hình phạt thay thế hiệu quả. 'Community service' = lao động công ích/phục vụ cộng đồng.",
        "modelAnswer": "Some people believe that community service is an effective alternative punishment.",
        "fallbackKeywords": [
          "community service",
          "alternative punishment",
          "effective"
        ],
        "orderIndex": 20,
        "isActive": true
      },
      {
        "questionId": "w11t18_q21",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"law enforcement\" và \"prevent crime\"):\n\n\"Thực thi pháp luật hiệu quả là cần thiết để ngăn chặn tội phạm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Effective law enforcement is essential to prevent crime.",
        "explanationVi": "'Is essential to + V' = là thiết yếu để. 'Law enforcement' = thực thi pháp luật (danh từ không đếm được). 'Effective' đứng trước danh từ.",
        "modelAnswer": "Effective law enforcement is essential to prevent crime.",
        "fallbackKeywords": [
          "law enforcement",
          "prevent crime",
          "essential"
        ],
        "orderIndex": 21,
        "isActive": true
      },
      {
        "questionId": "w11t18_q22",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"root causes\" và \"safer society\"):\n\n\"Giải quyết cả nguyên nhân gốc rễ và hậu quả của tội phạm sẽ giúp xã hội an toàn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.",
        "explanationVi": "'Addressing both A and B' = giải quyết cả A lẫn B. 'Contribute to a safer society' = góp phần tạo ra xã hội an toàn hơn. 'Ultimately' = cuối cùng.",
        "modelAnswer": "Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.",
        "fallbackKeywords": [
          "root causes",
          "safer society",
          "addressing",
          "consequences"
        ],
        "orderIndex": 22,
        "isActive": true
      }
    ]
  },
  {
    "week": 18,
    "block": "translation",
    "topicName": "Dịch Câu - Môi Trường & Khí Hậu",
    "topicEmoji": "🌿",
    "essayType": "cause_solution",
    "prompt": "The increasing levels of pollution and climate change are threatening the planet. What are the causes of these problems, and what solutions can be implemented?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 19,
    "vocabularyList": [
      {
        "term": "climate change",
        "definitionVi": "biến đổi khí hậu",
        "example": "Climate change is causing more frequent extreme weather events."
      },
      {
        "term": "fossil fuels",
        "definitionVi": "nhiên liệu hóa thạch",
        "example": "Burning fossil fuels is a major cause of air pollution."
      },
      {
        "term": "renewable energy",
        "definitionVi": "năng lượng tái tạo",
        "example": "Switching to renewable energy can significantly reduce carbon emissions."
      },
      {
        "term": "carbon emissions",
        "definitionVi": "khí thải carbon",
        "example": "Reducing carbon emissions is essential to combat climate change."
      },
      {
        "term": "sustainability",
        "definitionVi": "tính bền vững",
        "example": "Economic development must prioritise sustainability."
      },
      {
        "term": "global warming",
        "definitionVi": "sự nóng lên toàn cầu",
        "example": "Global warming is causing ice caps to melt at an alarming rate."
      },
      {
        "term": "greenhouse gas",
        "definitionVi": "khí nhà kính",
        "example": "Methane is one of the most potent greenhouse gases."
      },
      {
        "term": "deforestation",
        "definitionVi": "phá rừng",
        "example": "Deforestation reduces the planet's capacity to absorb CO2."
      },
      {
        "term": "biodiversity",
        "definitionVi": "đa dạng sinh học",
        "example": "Climate change is a major threat to global biodiversity."
      },
      {
        "term": "air pollution",
        "definitionVi": "ô nhiễm không khí",
        "example": "Air pollution in large cities poses a serious risk to public health."
      },
      {
        "term": "water scarcity",
        "definitionVi": "khan hiếm nước",
        "example": "Water scarcity affects billions of people in arid regions."
      },
      {
        "term": "natural disaster",
        "definitionVi": "thiên tai",
        "example": "Rising temperatures increase the frequency of natural disasters."
      },
      {
        "term": "carbon tax",
        "definitionVi": "thuế carbon",
        "example": "A carbon tax encourages businesses to reduce their emissions."
      },
      {
        "term": "eco-friendly",
        "definitionVi": "thân thiện với môi trường",
        "example": "Consumers are increasingly choosing eco-friendly products."
      },
      {
        "term": "ozone layer",
        "definitionVi": "tầng ozone",
        "example": "The ozone layer protects the Earth from harmful ultraviolet radiation."
      },
      {
        "term": "electric vehicle",
        "definitionVi": "xe điện",
        "example": "Electric vehicles produce zero direct emissions, reducing urban air pollution."
      },
      {
        "term": "reforestation",
        "definitionVi": "trồng rừng",
        "example": "Reforestation projects help restore natural habitats and absorb carbon."
      },
      {
        "term": "sustainable farming",
        "definitionVi": "nông nghiệp bền vững",
        "example": "Sustainable farming practices help protect soil quality and biodiversity."
      },
      {
        "term": "plastic waste",
        "definitionVi": "rác thải nhựa",
        "example": "Plastic waste in the ocean is devastating marine ecosystems."
      },
      {
        "term": "environmental policy",
        "definitionVi": "chính sách môi trường",
        "example": "Strong environmental policies are essential for long-term ecological health."
      },
      {
        "term": "wreak environmental havoc",
        "definitionVi": "gây ra tàn phá môi trường nghiêm trọng",
        "example": "Unchecked industrial growth can wreak environmental havoc on ecosystems."
      },
      {
        "term": "curb greenhouse gas emissions",
        "definitionVi": "kiềm chế khí thải nhà kính",
        "example": "Nations have pledged to curb greenhouse gas emissions by 2050."
      },
      {
        "term": "push the planet to the brink",
        "definitionVi": "đẩy hành tinh đến bờ vực",
        "example": "Scientists warn that inaction could push the planet to the brink of crisis."
      },
      {
        "term": "adopt greener practices",
        "definitionVi": "áp dụng những thực hành xanh hơn",
        "example": "Businesses are being encouraged to adopt greener practices."
      },
      {
        "term": "mitigate the effects of climate change",
        "definitionVi": "giảm nhẹ tác động của biến đổi khí hậu",
        "example": "Reforestation can help mitigate the effects of climate change."
      },
      {
        "term": "exhaust natural resources",
        "definitionVi": "làm cạn kiệt tài nguyên thiên nhiên",
        "example": "Overconsumption continues to exhaust the planet's natural resources."
      },
      {
        "term": "transition to clean energy",
        "definitionVi": "chuyển đổi sang năng lượng sạch",
        "example": "Many governments are working to transition to clean energy sources."
      },
      {
        "term": "trigger extreme weather events",
        "definitionVi": "kích hoạt các hiện tượng thời tiết cực đoan",
        "example": "Rising temperatures can trigger extreme weather events worldwide."
      },
      {
        "term": "hold governments accountable",
        "definitionVi": "buộc chính phủ phải chịu trách nhiệm",
        "example": "Activists are working to hold governments accountable for their climate pledges."
      },
      {
        "term": "safeguard the planet for future generations",
        "definitionVi": "bảo vệ hành tinh cho các thế hệ tương lai",
        "example": "Bold action today can safeguard the planet for future generations."
      }
    ],
    "questions": [
      {
        "questionId": "w12_trans_env_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Biến đổi khí hậu là một trong những thách thức lớn nhất mà nhân loại đang phải đối mặt.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Climate change is one of the greatest challenges that humanity is currently facing.",
        "explanationVi": "'One of the + superlative + N' dùng khi nói về một trong những điều quan trọng nhất. 'Facing/confronting' = đối mặt. 'Humanity' = nhân loại — từ học thuật thay cho 'people'.",
        "modelAnswer": "Climate change is one of the greatest challenges that humanity is currently facing.",
        "fallbackKeywords": [
          "climate change",
          "challenges",
          "humanity",
          "facing"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q02",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"fossil fuels\" và \"global warming\"):\n\n\"Việc đốt nhiên liệu hóa thạch thải ra lượng lớn khí CO2, góp phần vào hiện tượng ấm lên toàn cầu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Burning fossil fuels releases large amounts of CO2, contributing to global warming.",
        "explanationVi": "'Burning + N' (gerund) làm chủ ngữ. '..., contributing to' (participial clause) diễn tả kết quả của hành động trước. Không dùng 'and contribute' ở đây.",
        "modelAnswer": "Burning fossil fuels releases large amounts of CO2, contributing to global warming.",
        "fallbackKeywords": [
          "fossil fuels",
          "releases",
          "CO2",
          "contributing",
          "global warming"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q03",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"renewable energy\" và \"fossil fuels\"):\n\n\"Chính phủ nên thực hiện các chính sách mạnh mẽ hơn để khuyến khích sử dụng năng lượng tái tạo và giảm sự phụ thuộc vào nhiên liệu hóa thạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.",
        "explanationVi": "'Implement policies' = thực thi chính sách. 'Reduce dependence on' = giảm sự phụ thuộc vào. 'Should' thể hiện khuyến nghị — rất cần trong đoạn solution.",
        "modelAnswer": "Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.",
        "fallbackKeywords": [
          "governments",
          "implement",
          "policies",
          "renewable energy",
          "fossil fuels",
          "reduce"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q04",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"deforestation\" và \"global warming\"):\n\n\"Việc chặt phá rừng không kiểm soát góp phần đáng kể vào hiện tượng nóng lên toàn cầu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Uncontrolled deforestation contributes significantly to global warming.",
        "explanationVi": "'Uncontrolled deforestation' = chặt phá rừng không kiểm soát. 'Contributes significantly to' = góp phần đáng kể vào. 'Global warming' = nóng lên toàn cầu (khác với climate change là thuật ngữ rộng hơn).",
        "modelAnswer": "Uncontrolled deforestation contributes significantly to global warming.",
        "fallbackKeywords": [
          "deforestation",
          "contributes significantly",
          "global warming"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q05",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"electric vehicles\" và \"carbon emissions\"):\n\n\"Nhiều quốc gia đang chuyển sang sử dụng xe điện nhằm giảm lượng khí thải carbon từ lĩnh vực giao thông.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many countries are transitioning to electric vehicles in order to reduce carbon emissions from the transport sector.",
        "explanationVi": "'Transition to' = chuyển sang (quá trình dần dần). 'In order to' = nhằm mục đích (trang trọng hơn 'to'). 'The transport sector' = lĩnh vực giao thông vận tải.",
        "modelAnswer": "Many countries are transitioning to electric vehicles in order to reduce carbon emissions from the transport sector.",
        "fallbackKeywords": [
          "electric vehicles",
          "carbon emissions",
          "transport sector",
          "transitioning"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"rising sea levels\" và \"relocate\"):\n\n\"Nước biển dâng đang đe dọa nhiều vùng ven biển thấp trên thế giới, buộc hàng triệu người phải di dời.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rising sea levels are threatening many low-lying coastal areas around the world, forcing millions of people to relocate.",
        "explanationVi": "'Rising sea levels' = nước biển dâng (Present Participle làm tính từ). 'Low-lying coastal areas' = vùng ven biển thấp. 'Forcing + O + to V' (participial clause) diễn tả hệ quả trực tiếp.",
        "modelAnswer": "Rising sea levels are threatening many low-lying coastal areas around the world, forcing millions of people to relocate.",
        "fallbackKeywords": [
          "rising sea levels",
          "low-lying coastal areas",
          "forcing",
          "relocate"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urgent action\" và \"public health\"):\n\n\"Nếu không có hành động khẩn cấp, tình trạng ô nhiễm không khí sẽ tiếp tục gây hại cho sức khỏe cộng đồng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Without urgent action, air pollution will continue to harm public health.",
        "explanationVi": "'Without + N/phrase' = nếu không có (điều kiện âm — không dùng 'If not have'). 'Will continue to' = sẽ tiếp tục. 'Harm public health' = gây hại cho sức khỏe cộng đồng.",
        "modelAnswer": "Without urgent action, air pollution will continue to harm public health.",
        "fallbackKeywords": [
          "urgent action",
          "air pollution",
          "harm",
          "public health"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"effective solution\" và \"solar and wind power\"):\n\n\"Một giải pháp hiệu quả là đầu tư vào các nguồn năng lượng tái tạo như điện mặt trời và điện gió.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An effective solution is to invest in renewable energy sources such as solar and wind power.",
        "explanationVi": "'An effective solution is to + V' = một giải pháp hiệu quả là. 'Such as' = chẳng hạn như (liệt kê ví dụ). 'Solar and wind power' = điện mặt trời và điện gió.",
        "modelAnswer": "An effective solution is to invest in renewable energy sources such as solar and wind power.",
        "fallbackKeywords": [
          "effective solution",
          "invest",
          "renewable energy",
          "solar",
          "wind power"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"dependence on fossil fuels\" và \"major cities\"):\n\n\"Sự phụ thuộc vào nhiên liệu hóa thạch đã dẫn đến mức độ ô nhiễm không khí nghiêm trọng ở nhiều thành phố lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Dependence on fossil fuels has led to severe levels of air pollution in many major cities.",
        "explanationVi": "'Dependence on' = sự phụ thuộc vào (danh từ). 'Has led to' = đã dẫn đến (Present Perfect — kết quả còn hiện hữu). 'Severe levels of' = mức độ nghiêm trọng của.",
        "modelAnswer": "Dependence on fossil fuels has led to severe levels of air pollution in many major cities.",
        "fallbackKeywords": [
          "dependence on fossil fuels",
          "led to",
          "air pollution",
          "major cities"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"impose taxes\" và \"cleaner production\"):\n\n\"Chính phủ nên đánh thuế cao vào các doanh nghiệp xả thải quá mức để buộc họ áp dụng quy trình sản xuất sạch hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should impose heavy taxes on companies that emit excessive pollutants to compel them to adopt cleaner production processes.",
        "explanationVi": "'Impose taxes on' = đánh thuế vào. 'Emit excessive pollutants' = xả thải quá mức. 'Compel + O + to V' = buộc ai phải làm gì (mạnh hơn 'encourage'). 'Adopt cleaner processes' = áp dụng quy trình sạch hơn.",
        "modelAnswer": "Governments should impose heavy taxes on companies that emit excessive pollutants to compel them to adopt cleaner production processes.",
        "fallbackKeywords": [
          "impose taxes",
          "excessive pollutants",
          "compel",
          "cleaner production"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"climate change\" và \"global food security\"):\n\n\"Biến đổi khí hậu không chỉ ảnh hưởng đến môi trường tự nhiên mà còn đe dọa an ninh lương thực toàn cầu.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Climate change not only affects the natural environment but also threatens global food security.",
        "explanationVi": "Cấu trúc 'not only A but also B' = không chỉ A mà còn B — liệt kê hai hệ quả song song. 'Global food security' = an ninh lương thực toàn cầu. 'Threaten' = đe dọa.",
        "modelAnswer": "Climate change not only affects the natural environment but also threatens global food security.",
        "fallbackKeywords": [
          "climate change",
          "natural environment",
          "threatens",
          "global food security"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"environmental protection\" và \"behavioural change\"):\n\n\"Giáo dục cộng đồng về tầm quan trọng của bảo vệ môi trường có thể thúc đẩy thay đổi hành vi ở cấp độ cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Community education about the importance of environmental protection can promote behavioural change at the individual level.",
        "explanationVi": "'Community education' = giáo dục cộng đồng. 'Promote behavioural change' = thúc đẩy thay đổi hành vi. 'At the individual level' = ở cấp độ cá nhân (trang trọng hơn 'individually').",
        "modelAnswer": "Community education about the importance of environmental protection can promote behavioural change at the individual level.",
        "fallbackKeywords": [
          "community education",
          "environmental protection",
          "promote",
          "behavioural change"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"Paris Agreement\" và \"greenhouse gas emissions\"):\n\n\"Các thỏa thuận quốc tế như Hiệp định Paris đóng vai trò quan trọng trong việc thúc đẩy các quốc gia giảm phát thải khí nhà kính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "International agreements such as the Paris Agreement play a crucial role in encouraging nations to reduce their greenhouse gas emissions.",
        "explanationVi": "'Play a crucial role in + V-ing' = đóng vai trò quan trọng trong việc. 'Encourage + O + to V' = thúc đẩy ai làm gì. 'Greenhouse gas emissions' = phát thải khí nhà kính.",
        "modelAnswer": "International agreements such as the Paris Agreement play a crucial role in encouraging nations to reduce their greenhouse gas emissions.",
        "fallbackKeywords": [
          "international agreements",
          "Paris Agreement",
          "crucial role",
          "greenhouse gas emissions"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"Unlike in the past, when...\"):\n\n\"Không giống như trước đây, khi thiệt hại môi trường được xem là vấn đề của từng địa phương, biến đổi khí hậu ngày nay được nhìn nhận là một tình trạng khẩn cấp toàn cầu mà không một quốc gia nào có thể tự mình giải quyết.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike in the past, when environmental damage was seen as a local problem, climate change is now regarded as a global emergency that no single country can solve on its own.",
        "explanationVi": "'Unlike in the past, when + S + V (quá khứ)' mở đầu bằng sự tương phản quá khứ – hiện tại, rất mạnh cho câu chủ đề. Mệnh đề 'when environmental damage was seen' dùng quá khứ đơn bị động; mệnh đề chính 'is now regarded as' dùng hiện tại. 'that no single country can solve on its own' là mệnh đề quan hệ bổ nghĩa cho 'emergency'.",
        "sentenceStructure": "Unlike in the past, when + S + V (quá khứ), S + V (hiện tại) ... + mệnh đề quan hệ",
        "modelAnswer": "Unlike in the past, when environmental damage was seen as a local problem, climate change is now regarded as a global emergency that no single country can solve on its own.",
        "fallbackKeywords": [
          "unlike in the past",
          "environmental damage",
          "climate change",
          "global emergency",
          "single country"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu điều kiện loại 2):\n\n\"Nếu mỗi hộ gia đình giảm mức tiêu thụ điện của mình đi chỉ mười phần trăm, tác động cộng gộp lên lượng khí thải carbon sẽ là rất lớn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If every household reduced its electricity consumption by just ten percent, the combined impact on carbon emissions would be enormous.",
        "explanationVi": "Câu điều kiện loại 2 diễn tả tình huống giả định, không có thật ở hiện tại: 'If + quá khứ đơn' ('reduced') và mệnh đề chính 'would + V' ('would be'). Dùng khi đề xuất một kịch bản mang tính giả thuyết trong đoạn giải pháp.",
        "sentenceStructure": "If + S + V (quá khứ đơn), S + would + V (nguyên thể) — điều kiện loại 2",
        "modelAnswer": "If every household reduced its electricity consumption by just ten percent, the combined impact on carbon emissions would be enormous.",
        "fallbackKeywords": [
          "if",
          "every household",
          "electricity consumption",
          "carbon emissions",
          "would be enormous"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q16",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"When...\"):\n\n\"Khi rừng bị chặt phá để làm nông nghiệp, đất nhanh chóng mất đi độ màu mỡ và một lượng lớn carbon tích trữ bị thải vào khí quyển.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When forests are cleared for farming, the soil quickly loses its fertility and large amounts of stored carbon are released into the atmosphere.",
        "explanationVi": "'When' + hiện tại đơn diễn tả một quy luật / sự thật chung. Hai mệnh đề dùng bị động ('are cleared', 'are released') vì tác nhân không quan trọng bằng hành động. 'Lose its fertility' = mất độ màu mỡ.",
        "sentenceStructure": "When + S + be + V3 (bị động), S + V + and + S + be + V3",
        "modelAnswer": "When forests are cleared for farming, the soil quickly loses its fertility and large amounts of stored carbon are released into the atmosphere.",
        "fallbackKeywords": [
          "when",
          "forests are cleared",
          "soil",
          "fertility",
          "stored carbon",
          "atmosphere"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"It is high time...\"):\n\n\"Đã đến lúc các chính phủ phải coi khủng hoảng khí hậu nghiêm trọng như cách họ coi trọng các mối đe dọa đối với an ninh quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "It is high time governments treated the climate crisis as seriously as they treat threats to national security.",
        "explanationVi": "'It is high time + S + quá khứ đơn' ('treated') là cấu trúc giả định diễn tả 'lẽ ra việc này đã phải xảy ra rồi'. Cụm so sánh 'as seriously as' nối hai cách hành xử.",
        "sentenceStructure": "It is high time + S + V (quá khứ đơn) — 'đã đến lúc ai đó nên làm gì'",
        "modelAnswer": "It is high time governments treated the climate crisis as seriously as they treat threats to national security.",
        "fallbackKeywords": [
          "it is high time",
          "governments",
          "climate crisis",
          "national security",
          "threats"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc so sánh kép \"The more..., the harder...\"):\n\n\"Một quốc gia càng phụ thuộc nhiều vào điện than, thì quốc gia đó càng khó đạt được các mục tiêu cắt giảm khí thải.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The more heavily a country relies on coal-fired power, the harder it becomes for that country to meet its emission-reduction targets.",
        "explanationVi": "Cấu trúc so sánh kép 'The + comparative..., the + comparative...' diễn tả hai đại lượng thay đổi song song. 'The more heavily' bổ nghĩa cho động từ 'relies'; 'the harder it becomes for sb to V' là mẫu câu rất tự nhiên.",
        "sentenceStructure": "The + comparative + S + V, the + comparative + S + V — 'càng... càng...'",
        "modelAnswer": "The more heavily a country relies on coal-fired power, the harder it becomes for that country to meet its emission-reduction targets.",
        "fallbackKeywords": [
          "the more",
          "coal-fired power",
          "the harder",
          "emission-reduction targets",
          "country"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"Despite + cụm danh từ\"):\n\n\"Bất chấp bằng chứng khoa học ngày càng nhiều, nhiều nhà hoạch định chính sách vẫn miễn cưỡng loại bỏ dần trợ cấp cho nhiên liệu hóa thạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Despite mounting scientific evidence, many policymakers remain reluctant to phase out subsidies for fossil fuels.",
        "explanationVi": "'Despite' đi với danh từ / cụm danh từ, KHÔNG đi với mệnh đề (sai: 'Despite scientific evidence is mounting'). 'Remain reluctant to V' = vẫn miễn cưỡng làm gì. 'Phase out' = loại bỏ dần.",
        "sentenceStructure": "Despite + cụm danh từ / V-ing, S + V (nhượng bộ)",
        "modelAnswer": "Despite mounting scientific evidence, many policymakers remain reluctant to phase out subsidies for fossil fuels.",
        "fallbackKeywords": [
          "despite",
          "scientific evidence",
          "policymakers",
          "reluctant",
          "phase out",
          "subsidies"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12_trans_env_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề quan hệ \", which...\" bình luận cả câu):\n\n\"Các thành phố ven biển đang chi hàng tỷ đô la cho hệ thống chống lũ, điều này cho thấy việc trì hoãn hành động về khí hậu đã trở nên tốn kém đến mức nào.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Coastal cities are spending billions of dollars on flood defences, which shows how costly delaying action on climate change has become.",
        "explanationVi": "Dấu phẩy + 'which' ở đây KHÔNG bổ nghĩa cho một danh từ mà bình luận về toàn bộ mệnh đề đứng trước. 'how costly ... has become' là mệnh đề danh từ (câu hỏi gián tiếp) làm tân ngữ cho 'shows'.",
        "sentenceStructure": "S + V + O, which + V — mệnh đề quan hệ không xác định bình luận cả câu",
        "modelAnswer": "Coastal cities are spending billions of dollars on flood defences, which shows how costly delaying action on climate change has become.",
        "fallbackKeywords": [
          "coastal cities",
          "flood defences",
          "which shows",
          "delaying action",
          "costly"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 18,
    "block": "translation",
    "topicName": "Dịch Câu - Công Nghệ & Truyền Thông",
    "topicEmoji": "💻",
    "essayType": "advantages_disadvantages",
    "prompt": "The rapid advancement of technology has transformed the way people communicate and work. What are the advantages and disadvantages of this development?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 20,
    "vocabularyList": [
      {
        "term": "artificial intelligence",
        "definitionVi": "trí tuệ nhân tạo",
        "example": "Artificial intelligence is revolutionising industries worldwide."
      },
      {
        "term": "social media",
        "definitionVi": "mạng xã hội",
        "example": "Social media platforms have changed the way news is consumed."
      },
      {
        "term": "automation",
        "definitionVi": "tự động hóa",
        "example": "Automation is threatening millions of low-skilled jobs worldwide."
      },
      {
        "term": "misinformation",
        "definitionVi": "thông tin sai lệch",
        "example": "The spread of misinformation on social media is a growing concern."
      },
      {
        "term": "digital literacy",
        "definitionVi": "kỹ năng số",
        "example": "Digital literacy is essential for success in the modern workplace."
      },
      {
        "term": "cybersecurity",
        "definitionVi": "an ninh mạng",
        "example": "Cybersecurity threats are growing as more services move online."
      },
      {
        "term": "data privacy",
        "definitionVi": "quyền riêng tư dữ liệu",
        "example": "Data privacy laws protect users from corporations misusing their personal information."
      },
      {
        "term": "algorithm",
        "definitionVi": "thuật toán",
        "example": "Social media algorithms determine what content users see in their feeds."
      },
      {
        "term": "fake news",
        "definitionVi": "tin giả",
        "example": "The spread of fake news online undermines public trust in journalism."
      },
      {
        "term": "e-commerce",
        "definitionVi": "thương mại điện tử",
        "example": "E-commerce has transformed the retail industry over the past decade."
      },
      {
        "term": "smartphone dependency",
        "definitionVi": "sự phụ thuộc vào điện thoại",
        "example": "Smartphone dependency can disrupt sleep patterns and face-to-face relationships."
      },
      {
        "term": "screen addiction",
        "definitionVi": "nghiện màn hình",
        "example": "Screen addiction is increasingly common among children and teenagers."
      },
      {
        "term": "big data",
        "definitionVi": "dữ liệu lớn",
        "example": "Companies use big data to personalise advertisements and services."
      },
      {
        "term": "cloud computing",
        "definitionVi": "điện toán đám mây",
        "example": "Cloud computing allows businesses to store and access data remotely."
      },
      {
        "term": "digital transformation",
        "definitionVi": "chuyển đổi số",
        "example": "Many industries are undergoing rapid digital transformation."
      },
      {
        "term": "internet of things (IoT)",
        "definitionVi": "vạn vật kết nối",
        "example": "The Internet of Things connects everyday devices to the internet."
      },
      {
        "term": "online privacy",
        "definitionVi": "sự riêng tư trực tuyến",
        "example": "Many users sacrifice online privacy for the convenience of free services."
      },
      {
        "term": "tech giant",
        "definitionVi": "tập đoàn công nghệ lớn",
        "example": "Tech giants like Google and Meta have been criticised for monopolistic practices."
      },
      {
        "term": "digital footprint",
        "definitionVi": "dấu chân kỹ thuật số",
        "example": "Every online action contributes to your digital footprint."
      },
      {
        "term": "innovation",
        "definitionVi": "sự đổi mới, sáng tạo",
        "example": "Technological innovation has dramatically improved medical treatments."
      },
      {
        "term": "transform the way we live",
        "definitionVi": "biến đổi cách chúng ta sống",
        "example": "Digital technology continues to transform the way we live and work."
      },
      {
        "term": "outpace regulation",
        "definitionVi": "vượt qua tốc độ của các quy định pháp luật",
        "example": "Rapid AI development often outpaces regulation designed to control it."
      },
      {
        "term": "raise ethical concerns",
        "definitionVi": "làm dấy lên những lo ngại về đạo đức",
        "example": "Facial recognition technology raises serious ethical concerns."
      },
      {
        "term": "safeguard user privacy",
        "definitionVi": "bảo vệ quyền riêng tư của người dùng",
        "example": "Tech companies must do more to safeguard user privacy."
      },
      {
        "term": "streamline everyday tasks",
        "definitionVi": "đơn giản hóa các công việc hằng ngày",
        "example": "Smart devices help streamline everyday tasks for busy households."
      },
      {
        "term": "widen the digital divide",
        "definitionVi": "nới rộng khoảng cách kỹ thuật số",
        "example": "Unequal internet access continues to widen the digital divide."
      },
      {
        "term": "disrupt traditional industries",
        "definitionVi": "làm gián đoạn, xáo trộn các ngành công nghiệp truyền thống",
        "example": "E-commerce has disrupted traditional retail industries."
      },
      {
        "term": "harness the power of data",
        "definitionVi": "khai thác sức mạnh của dữ liệu",
        "example": "Companies increasingly harness the power of data to improve services."
      },
      {
        "term": "expose users to risks",
        "definitionVi": "khiến người dùng tiếp xúc với rủi ro",
        "example": "Weak cybersecurity can expose users to serious online risks."
      },
      {
        "term": "drive technological innovation",
        "definitionVi": "thúc đẩy sự đổi mới công nghệ",
        "example": "Fierce competition continues to drive technological innovation forward."
      }
    ],
    "questions": [
      {
        "questionId": "w12_trans_tech_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Mạng xã hội cho phép mọi người kết nối với bạn bè và gia đình ở khắp nơi trên thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Social media allows people to connect with friends and family all over the world.",
        "explanationVi": "'Allow + O + to V' = cho phép ai làm gì. 'All over the world' = khắp nơi trên thế giới. Đây là câu mở bài/lập luận điển hình về lợi ích của mạng xã hội.",
        "modelAnswer": "Social media allows people to connect with friends and family all over the world.",
        "fallbackKeywords": [
          "social media",
          "allows",
          "connect",
          "friends",
          "family",
          "world"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q02",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"artificial intelligence\" và \"employment opportunities\"):\n\n\"Mặc dù trí tuệ nhân tạo có thể thay thế một số công việc, nhưng nó cũng tạo ra nhiều cơ hội việc làm mới trong lĩnh vực công nghệ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.",
        "explanationVi": "'Although A, B' = mặc dù A nhưng B (tương phản). 'Employment opportunities' = cơ hội việc làm. 'May replace' = có thể thay thế (chưa chắc chắn — dùng modal để thận trọng).",
        "modelAnswer": "Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.",
        "fallbackKeywords": [
          "artificial intelligence",
          "replace",
          "jobs",
          "employment opportunities",
          "technology sector"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q03",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"reliance on technology\" và \"social skills\"):\n\n\"Sự phụ thuộc quá mức vào công nghệ đã làm suy giảm kỹ năng xã hội của giới trẻ, khiến họ kém khả năng giao tiếp trực tiếp hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.",
        "explanationVi": "'Excessive reliance on' = sự phụ thuộc quá mức vào. 'Erode' = bào mòn, làm suy giảm dần. '...making them less capable of' = khiến họ kém khả năng. Present Perfect nhấn mạnh kết quả hiện tại.",
        "modelAnswer": "Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.",
        "fallbackKeywords": [
          "reliance on technology",
          "eroded",
          "social skills",
          "young people",
          "face-to-face"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q04",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"artificial intelligence\" và \"industries\"):\n\n\"Trí tuệ nhân tạo đang cách mạng hóa nhiều ngành công nghiệp, từ y tế đến tài chính.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Artificial intelligence is revolutionising many industries, from healthcare to finance.",
        "explanationVi": "'Revolutionise' = cách mạng hóa (British spelling: -ise). 'From A to B' = từ A đến B — liệt kê phạm vi rộng. Present Continuous nhấn mạnh xu hướng đang diễn ra.",
        "modelAnswer": "Artificial intelligence is revolutionising many industries, from healthcare to finance.",
        "fallbackKeywords": [
          "artificial intelligence",
          "revolutionising",
          "industries",
          "healthcare",
          "finance"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q05",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"social media\" và \"isolation\"):\n\n\"Mặc dù mạng xã hội tạo ra nhiều kết nối xã hội, nó cũng có thể dẫn đến sự cô lập và lo âu ở người dùng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although social media creates many social connections, it can also lead to isolation and anxiety among users.",
        "explanationVi": "'Although A, B' = mặc dù A nhưng B — cấu trúc tương phản trong một câu. 'Lead to isolation' = dẫn đến sự cô lập. 'Among users' = trong số người dùng (học thuật hơn 'for users').",
        "modelAnswer": "Although social media creates many social connections, it can also lead to isolation and anxiety among users.",
        "fallbackKeywords": [
          "social media",
          "connections",
          "isolation",
          "anxiety",
          "users"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"misinformation\" và \"democratic societies\"):\n\n\"Sự lan truyền của thông tin sai lệch trên mạng xã hội là mối lo ngại ngày càng tăng đối với các xã hội dân chủ.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The spread of misinformation on social media is a growing concern for democratic societies.",
        "explanationVi": "'The spread of' = sự lan truyền của (danh từ hóa). 'A growing concern' = mối lo ngại ngày càng tăng. 'Democratic societies' = các xã hội dân chủ.",
        "modelAnswer": "The spread of misinformation on social media is a growing concern for democratic societies.",
        "fallbackKeywords": [
          "spread",
          "misinformation",
          "social media",
          "growing concern",
          "democratic societies"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"automation\" và \"repetitive jobs\"):\n\n\"Tự động hóa đã nâng cao năng suất lao động, nhưng đồng thời cũng loại bỏ hàng triệu công việc lặp đi lặp lại.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Automation has increased labour productivity, but it has also eliminated millions of repetitive jobs.",
        "explanationVi": "'Labour productivity' = năng suất lao động. 'Eliminate repetitive jobs' = loại bỏ công việc lặp đi lặp lại. Present Perfect 'has eliminated' nhấn mạnh kết quả đến hiện tại.",
        "modelAnswer": "Automation has increased labour productivity, but it has also eliminated millions of repetitive jobs.",
        "fallbackKeywords": [
          "automation",
          "labour productivity",
          "eliminated",
          "repetitive jobs"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital literacy\" và \"critical thinking\"):\n\n\"Để tận dụng tối đa lợi ích của công nghệ, mọi người cần phát triển kỹ năng số và tư duy phản biện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "To maximise the benefits of technology, people need to develop digital literacy and critical thinking skills.",
        "explanationVi": "'To maximise' = để tối đa hóa (mục đích). 'Digital literacy' = kỹ năng số. 'Critical thinking skills' = kỹ năng tư duy phản biện. 'People need to + V' = mọi người cần phải.",
        "modelAnswer": "To maximise the benefits of technology, people need to develop digital literacy and critical thinking skills.",
        "fallbackKeywords": [
          "maximise benefits",
          "technology",
          "digital literacy",
          "critical thinking"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"growing reliance\" và \"face-to-face communication\"):\n\n\"Sự phụ thuộc ngày càng tăng vào thiết bị kỹ thuật số đã làm giảm khả năng tập trung và kỹ năng giao tiếp trực tiếp của nhiều người.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The growing reliance on digital devices has diminished many people's ability to concentrate and their face-to-face communication skills.",
        "explanationVi": "'Growing reliance on' = sự phụ thuộc ngày càng tăng vào. 'Diminish' = làm giảm, thu hẹp (học thuật hơn 'reduce'). 'Face-to-face communication' = giao tiếp trực tiếp.",
        "modelAnswer": "The growing reliance on digital devices has diminished many people's ability to concentrate and their face-to-face communication skills.",
        "fallbackKeywords": [
          "growing reliance",
          "digital devices",
          "diminished",
          "face-to-face communication"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technology companies\" và \"privacy\"):\n\n\"Các công ty công nghệ lớn đang thu thập lượng lớn dữ liệu người dùng, làm dấy lên lo ngại về quyền riêng tư.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Major technology companies are collecting vast amounts of user data, raising concerns about privacy.",
        "explanationVi": "'Vast amounts of' = lượng lớn (mạnh hơn 'large amounts'). 'Raising concerns about' (participial clause) = làm dấy lên lo ngại về — diễn đạt hệ quả đồng thời.",
        "modelAnswer": "Major technology companies are collecting vast amounts of user data, raising concerns about privacy.",
        "fallbackKeywords": [
          "technology companies",
          "vast amounts",
          "user data",
          "raising concerns",
          "privacy"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"stricter regulations\" và \"personal data\"):\n\n\"Chính phủ nên đặt ra các quy định chặt chẽ hơn để kiểm soát cách các công ty công nghệ sử dụng dữ liệu cá nhân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should establish stricter regulations to control how technology companies use personal data.",
        "explanationVi": "'Establish regulations' = đặt ra/ban hành quy định. 'Stricter' = chặt chẽ hơn (so sánh hơn). 'To control how...' = để kiểm soát cách... (mệnh đề danh ngữ làm tân ngữ).",
        "modelAnswer": "Governments should establish stricter regulations to control how technology companies use personal data.",
        "fallbackKeywords": [
          "establish",
          "stricter regulations",
          "technology companies",
          "personal data"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"digital divide\" và \"global inequality\"):\n\n\"Khoảng cách kỹ thuật số giữa các nước phát triển và đang phát triển có thể làm trầm trọng thêm bất bình đẳng toàn cầu nếu không được giải quyết kịp thời.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The digital divide between developed and developing countries may exacerbate global inequality if it is not addressed promptly.",
        "explanationVi": "'The digital divide' = khoảng cách kỹ thuật số. 'Exacerbate' = làm trầm trọng thêm (Band 7+ vocabulary). 'If not addressed promptly' = nếu không được giải quyết kịp thời.",
        "modelAnswer": "The digital divide between developed and developing countries may exacerbate global inequality if it is not addressed promptly.",
        "fallbackKeywords": [
          "digital divide",
          "developed countries",
          "developing countries",
          "exacerbate",
          "global inequality"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"technology in education\" và \"access to resources\"):\n\n\"Việc sử dụng công nghệ trong giáo dục có thể cải thiện trải nghiệm học tập và giúp học sinh tiếp cận nguồn tài nguyên phong phú hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The use of technology in education can improve the learning experience and give students access to a wider range of resources.",
        "explanationVi": "'The use of technology in education' = việc sử dụng công nghệ trong giáo dục (danh hóa học thuật). 'Give access to' = tạo điều kiện tiếp cận. 'A wider range of' = phạm vi đa dạng hơn.",
        "modelAnswer": "The use of technology in education can improve the learning experience and give students access to a wider range of resources.",
        "fallbackKeywords": [
          "technology in education",
          "learning experience",
          "access to",
          "resources"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"Unlike in the past, when...\"):\n\n\"Không giống như trước đây, khi người ta phải đến tận cơ quan để hoàn thành giấy tờ hành chính, ngày nay hầu hết các thủ tục có thể được xử lý trực tuyến chỉ trong vài phút.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike in the past, when people had to visit an office to complete official paperwork, most procedures can now be handled online in just a few minutes.",
        "explanationVi": "Tương phản quá khứ – hiện tại. 'had to + V' (bắt buộc trong quá khứ) đối lập với 'can now be handled' (bị động, hiện tại). 'In just a few minutes' nhấn mạnh sự tiện lợi.",
        "sentenceStructure": "Unlike in the past, when + S + had to + V, S + can now + V (bị động)",
        "modelAnswer": "Unlike in the past, when people had to visit an office to complete official paperwork, most procedures can now be handled online in just a few minutes.",
        "fallbackKeywords": [
          "unlike in the past",
          "official paperwork",
          "procedures",
          "handled online",
          "a few minutes"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu điều kiện loại 2 ở thể bị động):\n\n\"Nếu các nền tảng mạng xã hội phải chịu trách nhiệm pháp lý về nội dung mà họ quảng bá, việc lan truyền thông tin sai lệch sẽ giảm mạnh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If social media platforms were held legally responsible for the content they promote, the spread of misinformation would decline sharply.",
        "explanationVi": "Điều kiện loại 2 ở thể bị động: 'If ... were held responsible'. Mệnh đề chính 'would decline'. 'The content they promote' là mệnh đề quan hệ rút gọn (lược bỏ 'that/which').",
        "sentenceStructure": "If + S + were + V3, S + would + V — điều kiện loại 2 (bị động)",
        "modelAnswer": "If social media platforms were held legally responsible for the content they promote, the spread of misinformation would decline sharply.",
        "fallbackKeywords": [
          "if",
          "social media platforms",
          "legally responsible",
          "misinformation",
          "would decline"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"When...\"):\n\n\"Khi con người dựa vào thuật toán để quyết định họ nhìn thấy tin tức nào, họ dần bị giới hạn trong một góc nhìn hẹp và một chiều về thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When people rely on algorithms to decide which news they see, they are gradually exposed to a narrow and one-sided view of the world.",
        "explanationVi": "'When' + hiện tại đơn nêu điều kiện lặp lại; mệnh đề chính dùng bị động 'are exposed to'. 'Which news they see' là mệnh đề danh từ làm tân ngữ cho 'decide'.",
        "sentenceStructure": "When + S + V, S + be + V3 (kết quả)",
        "modelAnswer": "When people rely on algorithms to decide which news they see, they are gradually exposed to a narrow and one-sided view of the world.",
        "fallbackKeywords": [
          "when",
          "rely on algorithms",
          "which news",
          "exposed to",
          "one-sided view"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng đảo ngữ \"Not only...\"):\n\n\"Tự động hóa không chỉ định hình lại thị trường lao động mà còn thay đổi những kỹ năng mà nhà tuyển dụng mong đợi ở sinh viên mới ra trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not only has automation reshaped the labour market, but it has also changed the skills that employers expect from graduates.",
        "explanationVi": "Khi 'Not only' đứng đầu câu, mệnh đề đầu phải ĐẢO NGỮ: 'has automation reshaped' (không phải 'automation has reshaped'). Mệnh đề sau giữ trật tự thường với 'but ... also'.",
        "sentenceStructure": "Not only + trợ động từ + S + V, but + S + also + V — đảo ngữ nhấn mạnh",
        "modelAnswer": "Not only has automation reshaped the labour market, but it has also changed the skills that employers expect from graduates.",
        "fallbackKeywords": [
          "not only",
          "automation",
          "labour market",
          "employers",
          "graduates",
          "skills"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"such ... that ...\"):\n\n\"Điện thoại thông minh đã trở thành một phần thiết yếu của cuộc sống hằng ngày đến mức nhiều người trẻ cảm thấy lo lắng ngay khi bị tách khỏi thiết bị của mình.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Smartphones have become such an essential part of daily life that many young people feel anxious as soon as they are separated from their devices.",
        "explanationVi": "'such + (a/an) + tính từ + danh từ + that' diễn tả mức độ dẫn đến kết quả. Phân biệt với 'so + tính từ + that' (không có danh từ). 'As soon as' = ngay khi.",
        "sentenceStructure": "S + V + such + (a/an) + adj + N + that + S + V — 'đến mức'",
        "modelAnswer": "Smartphones have become such an essential part of daily life that many young people feel anxious as soon as they are separated from their devices.",
        "fallbackKeywords": [
          "smartphones",
          "such an essential part",
          "daily life",
          "anxious",
          "separated from"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"While...\" chỉ sự tương phản):\n\n\"Trong khi công nghệ đã khiến việc giao tiếp trở nên nhanh hơn và rẻ hơn, nó cũng được cho là đã làm cho các mối quan hệ cá nhân trở nên hời hợt hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "While technology has made communication faster and cheaper, it has arguably made personal relationships shallower.",
        "explanationVi": "'While' đầu câu = 'trong khi / mặc dù' nêu ý tương phản. Cả hai vế dùng 'make + O + adj' ('made communication faster', 'made relationships shallower'). 'Arguably' = có thể lập luận rằng.",
        "sentenceStructure": "While + S + V, S + V — mệnh đề nhượng bộ / tương phản",
        "modelAnswer": "While technology has made communication faster and cheaper, it has arguably made personal relationships shallower.",
        "fallbackKeywords": [
          "while",
          "technology",
          "communication",
          "personal relationships",
          "shallower"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12_trans_tech_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu chẻ giả \"What ... is ...\"):\n\n\"Điều khiến nhiều bậc phụ huynh lo lắng không phải là thời gian sử dụng màn hình mà là thiết kế gây nghiện của các ứng dụng mà con họ dùng.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "What worries many parents is not screen time itself but the addictive design of the apps their children use.",
        "explanationVi": "'What + mệnh đề + is + ...' nhấn mạnh phần đứng sau 'is'. Cặp 'not ... but ...' đối lập hai ý. 'The apps their children use' là mệnh đề quan hệ rút gọn.",
        "sentenceStructure": "What + S + V + is + (not) + N (+ but + N) — câu chẻ giả (pseudo-cleft)",
        "modelAnswer": "What worries many parents is not screen time itself but the addictive design of the apps their children use.",
        "fallbackKeywords": [
          "what worries many parents",
          "screen time",
          "addictive design",
          "apps",
          "children use"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 18,
    "block": "translation",
    "topicName": "Dịch Câu - Giáo Dục & Thanh Niên",
    "topicEmoji": "🎓",
    "essayType": "cause_effect",
    "prompt": "The education system in many countries is under pressure to prepare students for the challenges of the modern world. What are the causes and effects of this pressure?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 21,
    "vocabularyList": [
      {
        "term": "curriculum",
        "definitionVi": "chương trình học",
        "example": "The curriculum needs to be updated to include digital skills."
      },
      {
        "term": "extracurricular activities",
        "definitionVi": "hoạt động ngoại khóa",
        "example": "Extracurricular activities develop social and leadership skills."
      },
      {
        "term": "student engagement",
        "definitionVi": "sự tham gia của học sinh",
        "example": "Technology can enhance student engagement in lessons."
      },
      {
        "term": "critical thinking",
        "definitionVi": "tư duy phản biện",
        "example": "Modern education should prioritise critical thinking over rote learning."
      },
      {
        "term": "academic achievement",
        "definitionVi": "thành tích học tập",
        "example": "Academic achievement is often used as the sole measure of success."
      },
      {
        "term": "higher education",
        "definitionVi": "giáo dục đại học",
        "example": "Access to higher education remains unequal in many developing countries."
      },
      {
        "term": "scholarships",
        "definitionVi": "học bổng",
        "example": "Scholarships allow talented students from poor backgrounds to attend university."
      },
      {
        "term": "peer pressure",
        "definitionVi": "áp lực từ bạn bè",
        "example": "Peer pressure can push young people towards risky behaviours."
      },
      {
        "term": "gap year",
        "definitionVi": "năm nghỉ trước đại học",
        "example": "A gap year gives students time to gain work experience before university."
      },
      {
        "term": "standardised testing",
        "definitionVi": "kiểm tra chuẩn hóa",
        "example": "Critics argue that standardised testing fails to measure true academic ability."
      },
      {
        "term": "lifelong learning",
        "definitionVi": "học tập suốt đời",
        "example": "In a rapidly changing world, lifelong learning is increasingly important."
      },
      {
        "term": "school dropout",
        "definitionVi": "học sinh bỏ học",
        "example": "High school dropout rates are linked to poverty and lack of family support."
      },
      {
        "term": "tuition fees",
        "definitionVi": "học phí",
        "example": "Rising tuition fees are making higher education unaffordable for many families."
      },
      {
        "term": "youth unemployment",
        "definitionVi": "thất nghiệp thanh niên",
        "example": "Youth unemployment is high in countries without strong vocational training systems."
      },
      {
        "term": "role model",
        "definitionVi": "hình mẫu",
        "example": "Teachers play an important role as models for young people."
      },
      {
        "term": "inclusive education",
        "definitionVi": "giáo dục hòa nhập",
        "example": "Inclusive education ensures that students with disabilities learn alongside their peers."
      },
      {
        "term": "social mobility",
        "definitionVi": "dịch chuyển xã hội",
        "example": "Education is the most powerful driver of social mobility."
      },
      {
        "term": "grade inflation",
        "definitionVi": "lạm phát điểm số",
        "example": "Grade inflation undermines the value of academic qualifications."
      },
      {
        "term": "student well-being",
        "definitionVi": "sức khỏe và hạnh phúc của học sinh",
        "example": "Schools must prioritise student well-being alongside academic results."
      },
      {
        "term": "digital education",
        "definitionVi": "giáo dục kỹ thuật số",
        "example": "Digital education tools make learning more interactive and accessible."
      },
      {
        "term": "prepare students for the real world",
        "definitionVi": "chuẩn bị cho học sinh bước vào thực tế cuộc sống",
        "example": "Schools must do more to prepare students for the real world."
      },
      {
        "term": "place undue pressure on",
        "definitionVi": "đặt áp lực không cần thiết lên",
        "example": "Standardised testing can place undue pressure on young students."
      },
      {
        "term": "broaden students' horizons",
        "definitionVi": "mở rộng tầm nhìn của học sinh",
        "example": "Extracurricular activities help broaden students' horizons beyond academics."
      },
      {
        "term": "fall through the cracks",
        "definitionVi": "bị bỏ sót, không được quan tâm đúng mức",
        "example": "Struggling students can easily fall through the cracks in large classes."
      },
      {
        "term": "nurture well-rounded individuals",
        "definitionVi": "nuôi dưỡng những cá nhân phát triển toàn diện",
        "example": "A balanced curriculum helps nurture well-rounded individuals."
      },
      {
        "term": "shape young minds",
        "definitionVi": "định hình tư duy của giới trẻ",
        "example": "Teachers play a powerful role in shaping young minds."
      },
      {
        "term": "close the achievement gap",
        "definitionVi": "thu hẹp khoảng cách về thành tích học tập",
        "example": "Targeted support can help close the achievement gap between students."
      },
      {
        "term": "instil lifelong values",
        "definitionVi": "hình thành những giá trị suốt đời",
        "example": "Good education instils lifelong values such as honesty and resilience."
      },
      {
        "term": "equip youth with practical skills",
        "definitionVi": "trang bị cho giới trẻ những kỹ năng thực tiễn",
        "example": "Modern curricula should equip youth with practical, real-world skills."
      },
      {
        "term": "foster a love of learning",
        "definitionVi": "nuôi dưỡng niềm yêu thích học tập",
        "example": "Engaging teaching methods foster a genuine love of learning."
      }
    ],
    "questions": [
      {
        "questionId": "w12_trans_edu_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Giáo dục chất lượng cao là nền tảng của sự phát triển kinh tế và xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High-quality education is the foundation of economic and social development.",
        "explanationVi": "'High-quality' = chất lượng cao (tính từ ghép, có gạch nối khi đứng trước danh từ). 'Foundation of' = nền tảng của. Câu này phù hợp làm introduction hoặc thesis statement.",
        "modelAnswer": "High-quality education is the foundation of economic and social development.",
        "fallbackKeywords": [
          "education",
          "foundation",
          "economic",
          "social development"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q02",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"homework\" và \"extracurricular activities\"):\n\n\"Học sinh có quá nhiều bài tập về nhà thường cảm thấy căng thẳng và không có thời gian cho các hoạt động ngoại khóa.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Students who have too much homework often feel stressed and have no time for extracurricular activities.",
        "explanationVi": "Mệnh đề quan hệ 'who have too much homework' bổ nghĩa cho 'students'. 'Have no time for' = không có thời gian cho. 'Extracurricular activities' là cụm quan trọng khi viết về áp lực học tập.",
        "modelAnswer": "Students who have too much homework often feel stressed and have no time for extracurricular activities.",
        "fallbackKeywords": [
          "homework",
          "stressed",
          "extracurricular activities",
          "time"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q03",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"integrating technology\" và \"digital world\"):\n\n\"Việc tích hợp công nghệ vào lớp học không chỉ nâng cao sự tương tác của học sinh mà còn chuẩn bị cho họ những kỹ năng cần thiết trong thế giới kỹ thuật số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.",
        "explanationVi": "Cấu trúc 'not only A but also B' = không chỉ A mà còn B. 'Enhances engagement' = nâng cao sự tương tác. Gerund phrase 'Integrating technology...' làm chủ ngữ là cấu trúc học thuật cao cấp.",
        "modelAnswer": "Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.",
        "fallbackKeywords": [
          "integrating technology",
          "classroom",
          "enhances",
          "student engagement",
          "digital world",
          "skills"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q04",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"academic pressure\" và \"mental health\"):\n\n\"Áp lực học tập quá lớn có thể ảnh hưởng tiêu cực đến sức khỏe tâm thần của học sinh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Excessive academic pressure can negatively affect the mental health of students.",
        "explanationVi": "'Excessive academic pressure' = áp lực học tập quá lớn. 'Negatively affect' = ảnh hưởng tiêu cực đến. 'Can' diễn đạt khả năng — cẩn thận với mức độ chắc chắn.",
        "modelAnswer": "Excessive academic pressure can negatively affect the mental health of students.",
        "fallbackKeywords": [
          "excessive academic pressure",
          "negatively affect",
          "mental health",
          "students"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q05",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"rote learning\" và \"critical thinking\"):\n\n\"Nhiều hệ thống giáo dục trên thế giới vẫn ưu tiên học thuộc lòng hơn là phát triển tư duy phản biện.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many education systems around the world still prioritise rote learning over the development of critical thinking.",
        "explanationVi": "'Prioritise A over B' = ưu tiên A hơn B. 'Rote learning' = học thuộc lòng, học vẹt (không hiểu bản chất). 'The development of critical thinking' = sự phát triển tư duy phản biện.",
        "modelAnswer": "Many education systems around the world still prioritise rote learning over the development of critical thinking.",
        "fallbackKeywords": [
          "education systems",
          "prioritise",
          "rote learning",
          "critical thinking"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"qualified teachers\" và \"quality of education\"):\n\n\"Giáo viên có trình độ cao và được đào tạo tốt là yếu tố quan trọng nhất trong việc nâng cao chất lượng giáo dục.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Highly qualified and well-trained teachers are the most important factor in improving the quality of education.",
        "explanationVi": "'Highly qualified' = có trình độ cao. 'Well-trained' = được đào tạo tốt (tính từ ghép). 'The most important factor in + V-ing' = yếu tố quan trọng nhất trong việc.",
        "modelAnswer": "Highly qualified and well-trained teachers are the most important factor in improving the quality of education.",
        "fallbackKeywords": [
          "highly qualified",
          "well-trained teachers",
          "most important factor",
          "quality of education"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"educational resources\" và \"rural areas\"):\n\n\"Sự thiếu hụt tài nguyên giáo dục ở các vùng nông thôn dẫn đến bất bình đẳng trong cơ hội học tập.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The lack of educational resources in rural areas leads to inequality in learning opportunities.",
        "explanationVi": "'The lack of' = sự thiếu hụt (danh ngữ làm chủ ngữ). 'Rural areas' = vùng nông thôn. 'Leads to inequality in' = dẫn đến bất bình đẳng trong.",
        "modelAnswer": "The lack of educational resources in rural areas leads to inequality in learning opportunities.",
        "fallbackKeywords": [
          "lack of educational resources",
          "rural areas",
          "inequality",
          "learning opportunities"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"extracurricular activities\" và \"leadership skills\"):\n\n\"Các hoạt động ngoại khóa đóng vai trò quan trọng trong việc phát triển kỹ năng lãnh đạo và kỹ năng xã hội của học sinh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Extracurricular activities play an important role in developing students' leadership and social skills.",
        "explanationVi": "'Play an important role in + V-ing' = đóng vai trò quan trọng trong việc. 'Students'' = của học sinh (sở hữu cách). 'Leadership skills' = kỹ năng lãnh đạo.",
        "modelAnswer": "Extracurricular activities play an important role in developing students' leadership and social skills.",
        "fallbackKeywords": [
          "extracurricular activities",
          "play an important role",
          "leadership skills",
          "social skills"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"early childhood education\" và \"long-term benefits\"):\n\n\"Đầu tư vào giáo dục mầm non có thể mang lại lợi ích lâu dài cho cả cá nhân lẫn xã hội.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investing in early childhood education can bring long-term benefits for both individuals and society.",
        "explanationVi": "'Early childhood education' = giáo dục mầm non. 'Long-term benefits' = lợi ích lâu dài. 'Both A and B' = cả A lẫn B. Gerund 'Investing...' làm chủ ngữ.",
        "modelAnswer": "Investing in early childhood education can bring long-term benefits for both individuals and society.",
        "fallbackKeywords": [
          "early childhood education",
          "long-term benefits",
          "individuals",
          "society"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"reform the curriculum\" và \"digital age\"):\n\n\"Cần phải cải cách chương trình học để trang bị cho học sinh những kỹ năng cần thiết trong thời đại số.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "It is necessary to reform the curriculum to equip students with the skills required in the digital age.",
        "explanationVi": "'It is necessary to + V' = cần phải làm gì. 'Reform the curriculum' = cải cách chương trình học. 'Equip + O + with + N' = trang bị cho ai điều gì.",
        "modelAnswer": "It is necessary to reform the curriculum to equip students with the skills required in the digital age.",
        "fallbackKeywords": [
          "reform",
          "curriculum",
          "equip students",
          "skills required",
          "digital age"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"parental involvement\" và \"academic achievement\"):\n\n\"Sự tham gia của phụ huynh vào quá trình giáo dục có liên quan mật thiết đến thành tích học tập của con cái.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Parental involvement in the education process is closely linked to children's academic achievement.",
        "explanationVi": "'Parental involvement' = sự tham gia của phụ huynh. 'Is closely linked to' = có liên quan mật thiết đến. 'Children's academic achievement' = thành tích học tập của trẻ.",
        "modelAnswer": "Parental involvement in the education process is closely linked to children's academic achievement.",
        "fallbackKeywords": [
          "parental involvement",
          "education process",
          "closely linked to",
          "academic achievement"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"online education\" và \"social development\"):\n\n\"Mặc dù giáo dục trực tuyến cung cấp tính linh hoạt, nó thiếu tương tác trực tiếp vốn rất quan trọng cho sự phát triển xã hội của học sinh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although online education provides flexibility, it lacks the face-to-face interaction that is crucial for students' social development.",
        "explanationVi": "'Although A, B' diễn đạt tương phản. 'Lack + N' = thiếu. 'Crucial for' = rất quan trọng cho. Mệnh đề quan hệ 'that is crucial...' bổ nghĩa cho 'interaction'.",
        "modelAnswer": "Although online education provides flexibility, it lacks the face-to-face interaction that is crucial for students' social development.",
        "fallbackKeywords": [
          "online education",
          "flexibility",
          "face-to-face interaction",
          "social development"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"exam-oriented\" và \"holistic development\"):\n\n\"Giáo dục theo định hướng thi cử đang tạo ra căng thẳng không cần thiết và cản trở sự phát triển toàn diện của học sinh.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Exam-oriented education is creating unnecessary stress and hindering the holistic development of students.",
        "explanationVi": "'Exam-oriented education' = giáo dục theo định hướng thi cử (tính từ ghép có gạch nối). 'Hinder the development of' = cản trở sự phát triển. 'Holistic development' = phát triển toàn diện.",
        "modelAnswer": "Exam-oriented education is creating unnecessary stress and hindering the holistic development of students.",
        "fallbackKeywords": [
          "exam-oriented education",
          "unnecessary stress",
          "hindering",
          "holistic development"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"Unlike in the past, when...\"):\n\n\"Không giống như trước đây, khi một tấm bằng đại học gần như đảm bảo một sự nghiệp ổn định, sinh viên tốt nghiệp ngày nay thường phải đối mặt với sự cạnh tranh gay gắt ngay cả cho những vị trí mới vào nghề.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike in the past, when a university degree almost guaranteed a stable career, graduates today often face fierce competition even for entry-level positions.",
        "explanationVi": "Tương phản quá khứ – hiện tại làm câu chủ đề cho đoạn nguyên nhân. 'Almost guaranteed' (quá khứ đơn) đối lập 'often face' (hiện tại). 'Entry-level positions' = vị trí mới vào nghề.",
        "sentenceStructure": "Unlike in the past, when + S + V (quá khứ), S + V (hiện tại) today",
        "modelAnswer": "Unlike in the past, when a university degree almost guaranteed a stable career, graduates today often face fierce competition even for entry-level positions.",
        "fallbackKeywords": [
          "unlike in the past",
          "university degree",
          "stable career",
          "fierce competition",
          "entry-level positions"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu điều kiện loại 2):\n\n\"Nếu các trường học ít chú trọng vào các kỳ thi mang tính quyết định hơn, học sinh sẽ có nhiều tự do hơn để khám phá những môn học mà các em thực sự yêu thích.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If schools placed less emphasis on high-stakes exams, students would have more freedom to explore the subjects they are truly passionate about.",
        "explanationVi": "Điều kiện loại 2 đề xuất một kịch bản giả định: 'If ... placed less emphasis', 'students would have'. 'Place emphasis on' = chú trọng vào. 'Be passionate about' = đam mê.",
        "sentenceStructure": "If + S + V (quá khứ đơn), S + would + V — điều kiện loại 2",
        "modelAnswer": "If schools placed less emphasis on high-stakes exams, students would have more freedom to explore the subjects they are truly passionate about.",
        "fallbackKeywords": [
          "if",
          "schools",
          "less emphasis",
          "high-stakes exams",
          "would have more freedom",
          "subjects"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"When...\"):\n\n\"Khi trẻ em liên tục bị đem ra so sánh với bạn bè đồng trang lứa, các em có thể mất tự tin và hình thành nỗi sợ thất bại đi theo mình đến tận khi trưởng thành.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When children are constantly compared with their peers, they may lose confidence and develop a fear of failure that follows them into adulthood.",
        "explanationVi": "'When' + bị động ('are compared') nêu bối cảnh; 'may lose / develop' diễn tả hệ quả có khả năng xảy ra. 'That follows them into adulthood' bổ nghĩa cho 'a fear of failure'.",
        "sentenceStructure": "When + S + be + V3, S + may + V (+ that + mệnh đề quan hệ)",
        "modelAnswer": "When children are constantly compared with their peers, they may lose confidence and develop a fear of failure that follows them into adulthood.",
        "fallbackKeywords": [
          "when",
          "children",
          "compared with their peers",
          "lose confidence",
          "fear of failure",
          "adulthood"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng thức giả định \"It is essential that + S + (should) + V\"):\n\n\"Điều thiết yếu là chương trình học phải được cập nhật thường xuyên để phản ánh những kỹ năng mà thị trường lao động thực sự cần.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "It is essential that the curriculum be updated regularly so that it reflects the skills the labour market actually needs.",
        "explanationVi": "Sau 'It is essential/vital/important that', động từ ở dạng nguyên thể không chia: 'the curriculum be updated' (không phải 'is updated'). 'So that + mệnh đề' chỉ mục đích.",
        "sentenceStructure": "It is essential/vital that + S + (should) + V (nguyên thể) — thức giả định",
        "modelAnswer": "It is essential that the curriculum be updated regularly so that it reflects the skills the labour market actually needs.",
        "fallbackKeywords": [
          "it is essential that",
          "curriculum be updated",
          "regularly",
          "labour market",
          "skills"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc so sánh kép \"The more..., the more likely...\"):\n\n\"Cha mẹ càng gây áp lực buộc con phải đạt điểm cao, thì những đứa trẻ đó càng dễ rơi vào tình trạng kiệt sức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The more pressure parents put on their children to get top grades, the more likely those children are to suffer burnout.",
        "explanationVi": "So sánh kép với danh từ: 'The more pressure parents put on...'. Vế sau dùng mẫu 'the more likely + S + to be + to V'. 'Suffer burnout' = rơi vào kiệt sức.",
        "sentenceStructure": "The more + N + S + V, the more likely + S + be + to V — 'càng... càng...'",
        "modelAnswer": "The more pressure parents put on their children to get top grades, the more likely those children are to suffer burnout.",
        "fallbackKeywords": [
          "the more pressure",
          "parents",
          "top grades",
          "the more likely",
          "burnout"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"Despite + V-ing\"):\n\n\"Dù đã dành nhiều năm học thuộc lòng kiến thức để thi cử, nhiều học sinh rời ghế nhà trường mà không có những kỹ năng thực tế cần thiết cho cuộc sống hằng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Despite spending years memorising facts for exams, many students leave school without the practical skills needed for everyday life.",
        "explanationVi": "'Despite' + V-ing ('spending') vì chủ ngữ của hai vế trùng nhau. 'Without + N' = mà không có. 'Needed for everyday life' là mệnh đề quan hệ rút gọn bổ nghĩa cho 'skills'.",
        "sentenceStructure": "Despite + V-ing / cụm danh từ, S + V",
        "modelAnswer": "Despite spending years memorising facts for exams, many students leave school without the practical skills needed for everyday life.",
        "fallbackKeywords": [
          "despite spending years",
          "memorising facts",
          "leave school",
          "practical skills",
          "everyday life"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12_trans_edu_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề quan hệ \", which...\" bình luận cả câu):\n\n\"Ở nhiều quốc gia, nghề giáo đã trở thành một nghề bị trả lương thấp và bị xem nhẹ, điều này khiến những sinh viên tài năng ngại bước vào lĩnh vực này.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "In many countries, teaching has become an underpaid and undervalued profession, which discourages talented graduates from entering the field.",
        "explanationVi": "', which discourages...' bình luận về toàn bộ ý phía trước. 'Discourage sb from + V-ing' = làm ai nản lòng không làm gì. 'Underpaid and undervalued' là hai tính từ ghép.",
        "sentenceStructure": "S + V + O, which + V — mệnh đề quan hệ bình luận cả câu",
        "modelAnswer": "In many countries, teaching has become an underpaid and undervalued profession, which discourages talented graduates from entering the field.",
        "fallbackKeywords": [
          "teaching",
          "underpaid",
          "undervalued profession",
          "which discourages",
          "talented graduates"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 18,
    "block": "translation",
    "topicName": "Dịch Câu - Sức Khỏe & Đô Thị Hóa",
    "topicEmoji": "🏙️",
    "essayType": "effect_solution",
    "prompt": "Rapid urbanisation is having a significant impact on people's health and wellbeing in cities. What effects does this have, and what solutions can governments implement?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 22,
    "vocabularyList": [
      {
        "term": "sedentary lifestyle",
        "definitionVi": "lối sống ít vận động",
        "example": "A sedentary lifestyle increases the risk of chronic disease."
      },
      {
        "term": "obesity",
        "definitionVi": "béo phì",
        "example": "Childhood obesity is becoming an epidemic in many countries."
      },
      {
        "term": "workplace stress",
        "definitionVi": "căng thẳng tại nơi làm việc",
        "example": "Workplace stress is a leading cause of absenteeism."
      },
      {
        "term": "mental health",
        "definitionVi": "sức khỏe tâm thần",
        "example": "Mental health should be given the same priority as physical health."
      },
      {
        "term": "employee turnover",
        "definitionVi": "tỷ lệ nhân viên nghỉ việc",
        "example": "High stress levels contribute to employee turnover."
      },
      {
        "term": "urbanisation",
        "definitionVi": "đô thị hóa",
        "example": "Rapid urbanisation has put enormous pressure on city infrastructure."
      },
      {
        "term": "public health",
        "definitionVi": "sức khỏe cộng đồng",
        "example": "Governments invest in public health campaigns to reduce preventable diseases."
      },
      {
        "term": "mental health crisis",
        "definitionVi": "khủng hoảng sức khỏe tâm thần",
        "example": "Urbanisation contributes to the mental health crisis through increased stress and isolation."
      },
      {
        "term": "sanitation",
        "definitionVi": "vệ sinh môi trường",
        "example": "Adequate sanitation is essential for preventing the spread of disease."
      },
      {
        "term": "green space",
        "definitionVi": "không gian xanh",
        "example": "Access to green spaces in cities promotes physical and mental well-being."
      },
      {
        "term": "affordable housing",
        "definitionVi": "nhà ở giá rẻ",
        "example": "A shortage of affordable housing is one of the biggest challenges in modern cities."
      },
      {
        "term": "noise pollution",
        "definitionVi": "ô nhiễm tiếng ồn",
        "example": "Noise pollution in dense urban areas disrupts sleep and increases stress levels."
      },
      {
        "term": "infrastructure",
        "definitionVi": "cơ sở hạ tầng",
        "example": "Ageing infrastructure in many cities struggles to cope with rising populations."
      },
      {
        "term": "slum",
        "definitionVi": "khu ổ chuột",
        "example": "Rapid urbanisation without planning leads to the growth of slums."
      },
      {
        "term": "preventive healthcare",
        "definitionVi": "chăm sóc sức khỏe dự phòng",
        "example": "Investing in preventive healthcare reduces long-term costs for the health system."
      },
      {
        "term": "epidemic",
        "definitionVi": "dịch bệnh",
        "example": "Urban overcrowding can accelerate the spread of an epidemic."
      },
      {
        "term": "food security",
        "definitionVi": "an ninh lương thực",
        "example": "Urbanisation can threaten food security if farmland is converted to housing."
      },
      {
        "term": "well-being",
        "definitionVi": "sự khỏe mạnh toàn diện",
        "example": "City planners must consider residents' well-being, not just economic growth."
      },
      {
        "term": "air quality",
        "definitionVi": "chất lượng không khí",
        "example": "Poor air quality in cities is linked to respiratory diseases."
      },
      {
        "term": "healthcare access",
        "definitionVi": "khả năng tiếp cận dịch vụ y tế",
        "example": "Healthcare access is often limited in rapidly urbanising developing cities."
      },
      {
        "term": "put a strain on public services",
        "definitionVi": "gây áp lực lên các dịch vụ công",
        "example": "Rapid urbanisation puts a strain on public services like healthcare."
      },
      {
        "term": "exacerbate health problems",
        "definitionVi": "làm trầm trọng thêm các vấn đề sức khỏe",
        "example": "Air pollution in cities can exacerbate respiratory health problems."
      },
      {
        "term": "outstrip housing supply",
        "definitionVi": "vượt quá nguồn cung nhà ở",
        "example": "Population growth often outstrips housing supply in major cities."
      },
      {
        "term": "improve living conditions",
        "definitionVi": "cải thiện điều kiện sống",
        "example": "Investment in infrastructure can improve living conditions in slums."
      },
      {
        "term": "expand access to healthcare",
        "definitionVi": "mở rộng khả năng tiếp cận dịch vụ y tế",
        "example": "Cities must expand access to healthcare as populations grow."
      },
      {
        "term": "give rise to overcrowding",
        "definitionVi": "gây ra tình trạng quá tải",
        "example": "Uncontrolled urban growth can give rise to overcrowding and poor sanitation."
      },
      {
        "term": "invest in green infrastructure",
        "definitionVi": "đầu tư vào cơ sở hạ tầng xanh",
        "example": "Cities are investing in green infrastructure to improve residents' well-being."
      },
      {
        "term": "compromise public well-being",
        "definitionVi": "làm tổn hại đến phúc lợi cộng đồng",
        "example": "Poor urban planning can compromise public well-being in the long run."
      },
      {
        "term": "alleviate urban poverty",
        "definitionVi": "giảm bớt tình trạng nghèo đô thị",
        "example": "Job creation programmes can help alleviate urban poverty."
      },
      {
        "term": "cope with rapid urban growth",
        "definitionVi": "đối phó với sự tăng trưởng đô thị nhanh chóng",
        "example": "Many developing cities struggle to cope with rapid urban growth."
      }
    ],
    "questions": [
      {
        "questionId": "w12_trans_health_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Lối sống ít vận động là nguyên nhân hàng đầu dẫn đến béo phì và các bệnh tim mạch.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.",
        "explanationVi": "'Sedentary lifestyle' = lối sống ít vận động (tính từ 'sedentary' = ngồi nhiều, không vận động). 'The leading cause of' = nguyên nhân hàng đầu của. 'Cardiovascular diseases' = bệnh tim mạch.",
        "modelAnswer": "A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.",
        "fallbackKeywords": [
          "sedentary lifestyle",
          "leading cause",
          "obesity",
          "cardiovascular"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q02",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"obesity\" và \"sports facilities\"):\n\n\"Chính phủ có thể giảm tỷ lệ béo phì bằng cách đầu tư vào các cơ sở thể thao công cộng và khuyến khích người dân vận động nhiều hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.",
        "explanationVi": "'By + V-ing' = bằng cách. 'Invest in' = đầu tư vào. 'Encourage + O + to V' = khuyến khích ai làm gì. Ba cấu trúc này thường xuất hiện cùng nhau khi đề xuất giải pháp trong IELTS.",
        "modelAnswer": "Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.",
        "fallbackKeywords": [
          "governments",
          "reduce",
          "obesity",
          "investing",
          "sports facilities",
          "exercise"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q03",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"workplace stress\" và \"productivity\"):\n\n\"Mức độ căng thẳng cao tại nơi làm việc không chỉ ảnh hưởng đến sức khỏe tâm thần của nhân viên mà còn làm giảm năng suất lao động và tăng tỷ lệ nghỉ việc.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.",
        "explanationVi": "'Not only A but also B' liệt kê hai hệ quả. 'Employee turnover' = tỷ lệ nhân viên nghỉ việc. 'High levels of' = mức độ cao của — cách diễn đạt học thuật thay cho 'a lot of'.",
        "modelAnswer": "High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.",
        "fallbackKeywords": [
          "workplace stress",
          "mental health",
          "employees",
          "productivity",
          "employee turnover"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q04",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"air pollution\" và \"respiratory diseases\"):\n\n\"Ô nhiễm không khí ở các thành phố lớn đang gây ra sự gia tăng đáng kể các bệnh về hô hấp.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Air pollution in major cities is causing a significant increase in respiratory diseases.",
        "explanationVi": "'Air pollution' = ô nhiễm không khí. 'Significant increase in' = sự gia tăng đáng kể. 'Respiratory diseases' = bệnh về hô hấp (hệ hô hấp). Present Continuous nhấn mạnh xu hướng đang xảy ra.",
        "modelAnswer": "Air pollution in major cities is causing a significant increase in respiratory diseases.",
        "fallbackKeywords": [
          "air pollution",
          "major cities",
          "significant increase",
          "respiratory diseases"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q05",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"rapid urbanisation\" và \"green spaces\"):\n\n\"Đô thị hóa nhanh chóng dẫn đến tình trạng nhà ở chật chội và thiếu không gian xanh cho cư dân.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Rapid urbanisation leads to overcrowded housing and a lack of green spaces for residents.",
        "explanationVi": "'Rapid urbanisation' = đô thị hóa nhanh chóng. 'Overcrowded housing' = nhà ở chật chội, quá tải. 'Green spaces' = không gian xanh (công viên, cây cối).",
        "modelAnswer": "Rapid urbanisation leads to overcrowded housing and a lack of green spaces for residents.",
        "fallbackKeywords": [
          "rapid urbanisation",
          "overcrowded housing",
          "lack of",
          "green spaces",
          "residents"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"urban residents\" và \"physically active\"):\n\n\"Chính phủ nên xây dựng nhiều công viên và cơ sở thể thao công cộng để khuyến khích cư dân đô thị vận động nhiều hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Governments should build more parks and public sports facilities to encourage urban residents to be more physically active.",
        "explanationVi": "'Urban residents' = cư dân đô thị. 'Encourage + O + to V' = khuyến khích ai làm gì. 'Be physically active' = vận động thể chất tích cực (không nói 'exercise more' cho câu này).",
        "modelAnswer": "Governments should build more parks and public sports facilities to encourage urban residents to be more physically active.",
        "fallbackKeywords": [
          "parks",
          "public sports facilities",
          "encourage",
          "urban residents",
          "physically active"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"work-related stress\" và \"urban workers\"):\n\n\"Căng thẳng liên quan đến công việc là một trong những nguyên nhân chính gây ra sức khỏe tâm thần kém ở người lao động thành thị.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Work-related stress is one of the main causes of poor mental health among urban workers.",
        "explanationVi": "'Work-related stress' = căng thẳng liên quan đến công việc (tính từ ghép có gạch nối). 'One of the main causes of' = một trong những nguyên nhân chính gây ra. 'Among urban workers' = trong số người lao động thành thị.",
        "modelAnswer": "Work-related stress is one of the main causes of poor mental health among urban workers.",
        "fallbackKeywords": [
          "work-related stress",
          "main causes",
          "poor mental health",
          "urban workers"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"sustainable urban planning\" và \"quality of life\"):\n\n\"Quy hoạch đô thị bền vững, bao gồm hệ thống giao thông công cộng hiệu quả, có thể cải thiện đáng kể chất lượng cuộc sống.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Sustainable urban planning, including an efficient public transport system, can significantly improve the quality of life.",
        "explanationVi": "'Sustainable urban planning' = quy hoạch đô thị bền vững. 'Including...' (participial) = bao gồm, thêm thông tin phụ. 'Significantly improve the quality of life' = cải thiện đáng kể chất lượng cuộc sống.",
        "modelAnswer": "Sustainable urban planning, including an efficient public transport system, can significantly improve the quality of life.",
        "fallbackKeywords": [
          "sustainable urban planning",
          "public transport",
          "significantly improve",
          "quality of life"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"unhealthy diet\" và \"type 2 diabetes\"):\n\n\"Chế độ ăn uống không lành mạnh và thiếu vận động là hai yếu tố chính góp phần vào sự gia tăng bệnh tiểu đường loại 2.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "An unhealthy diet and a lack of physical activity are two key factors contributing to the rise in type 2 diabetes.",
        "explanationVi": "'An unhealthy diet' = chế độ ăn uống không lành mạnh. 'A lack of physical activity' = sự thiếu vận động. '...contributing to the rise in' (participial clause) = góp phần vào sự gia tăng.",
        "modelAnswer": "An unhealthy diet and a lack of physical activity are two key factors contributing to the rise in type 2 diabetes.",
        "fallbackKeywords": [
          "unhealthy diet",
          "lack of physical activity",
          "key factors",
          "type 2 diabetes"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"mental health programs\" và \"employee turnover\"):\n\n\"Các chương trình sức khỏe tâm thần nơi làm việc có thể giúp giảm tỷ lệ nghỉ việc và nâng cao năng suất lao động.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Workplace mental health programs can help reduce employee turnover and improve labour productivity.",
        "explanationVi": "'Workplace mental health programs' = chương trình sức khỏe tâm thần nơi làm việc. 'Employee turnover' = tỷ lệ nhân viên nghỉ việc. 'Labour productivity' = năng suất lao động.",
        "modelAnswer": "Workplace mental health programs can help reduce employee turnover and improve labour productivity.",
        "fallbackKeywords": [
          "workplace mental health programs",
          "employee turnover",
          "labour productivity"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"population density\" và \"infectious diseases\"):\n\n\"Mật độ dân số cao ở các thành phố khiến việc ngăn chặn sự lây lan của bệnh truyền nhiễm trở nên khó khăn hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High population density in cities makes it more difficult to prevent the spread of infectious diseases.",
        "explanationVi": "'Population density' = mật độ dân số. 'Make it + adj + to V' = khiến việc gì trở nên (cấu trúc hình thức). 'The spread of infectious diseases' = sự lây lan của bệnh truyền nhiễm.",
        "modelAnswer": "High population density in cities makes it more difficult to prevent the spread of infectious diseases.",
        "fallbackKeywords": [
          "population density",
          "cities",
          "prevent the spread",
          "infectious diseases"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"healthcare infrastructure\" và \"access to medical services\"):\n\n\"Đầu tư vào cơ sở hạ tầng y tế ở vùng ngoại ô giúp giảm áp lực lên các bệnh viện trung tâm và cải thiện khả năng tiếp cận dịch vụ y tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Investing in healthcare infrastructure in suburban areas helps reduce pressure on central hospitals and improves access to medical services.",
        "explanationVi": "'Healthcare infrastructure' = cơ sở hạ tầng y tế. 'Suburban areas' = vùng ngoại ô. 'Reduce pressure on' = giảm áp lực lên. 'Access to medical services' = khả năng tiếp cận dịch vụ y tế.",
        "modelAnswer": "Investing in healthcare infrastructure in suburban areas helps reduce pressure on central hospitals and improves access to medical services.",
        "fallbackKeywords": [
          "healthcare infrastructure",
          "suburban areas",
          "central hospitals",
          "access to medical services"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"banning advertisements\" và \"childhood obesity\"):\n\n\"Chính sách cấm quảng cáo thực phẩm không lành mạnh nhắm đến trẻ em là biện pháp quan trọng để giải quyết vấn đề béo phì ở trẻ em.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Banning advertisements for unhealthy food targeting children is an important measure to address the issue of childhood obesity.",
        "explanationVi": "'Banning advertisements' = cấm quảng cáo (Gerund làm chủ ngữ). 'Targeting children' = nhắm đến trẻ em (participial). 'Childhood obesity' = béo phì ở trẻ em. 'Measure to address' = biện pháp để giải quyết.",
        "modelAnswer": "Banning advertisements for unhealthy food targeting children is an important measure to address the issue of childhood obesity.",
        "fallbackKeywords": [
          "banning advertisements",
          "unhealthy food",
          "targeting children",
          "childhood obesity"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"Unlike in the past, when...\" và mệnh đề \", which...\"):\n\n\"Không giống như trước đây, khi hầu hết mọi người đi bộ hoặc đạp xe đi làm, cư dân thành phố ngày nay ngồi hàng giờ trong xe hơi và văn phòng, điều này đã góp phần làm gia tăng tỷ lệ béo phì.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike in the past, when most people walked or cycled to work, city residents today spend hours sitting in cars and offices, which has contributed to rising obesity rates.",
        "explanationVi": "Kết hợp hai cấu trúc: tương phản quá khứ – hiện tại ('Unlike in the past, when ... walked or cycled') và ', which has contributed' bình luận cả câu. 'Spend hours + V-ing' = dành hàng giờ làm gì.",
        "sentenceStructure": "Unlike in the past, when + S + V, S + V today, which + V",
        "modelAnswer": "Unlike in the past, when most people walked or cycled to work, city residents today spend hours sitting in cars and offices, which has contributed to rising obesity rates.",
        "fallbackKeywords": [
          "unlike in the past",
          "walked or cycled",
          "city residents",
          "sitting in cars",
          "which has contributed",
          "obesity rates"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu điều kiện loại 2 ở thể bị động):\n\n\"Nếu các thành phố được thiết kế với nhiều công viên, lối đi bộ và làn đường dành cho xe đạp hơn, cư dân sẽ thấy dễ dàng hơn nhiều khi đưa việc vận động vào thói quen hằng ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If cities were designed with more parks, footpaths and cycle lanes, residents would find it much easier to build exercise into their daily routines.",
        "explanationVi": "Điều kiện loại 2 thể bị động: 'If cities were designed'. 'Find it + adj + to V' = thấy việc gì đó thế nào. 'Build sth into a routine' = đưa việc gì vào thói quen.",
        "sentenceStructure": "If + S + were + V3, S + would + V — điều kiện loại 2 (bị động)",
        "modelAnswer": "If cities were designed with more parks, footpaths and cycle lanes, residents would find it much easier to build exercise into their daily routines.",
        "fallbackKeywords": [
          "if",
          "cities were designed",
          "parks",
          "cycle lanes",
          "would find it easier",
          "daily routines"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q16",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"When...\" và \"both ... and ...\"):\n\n\"Khi không gian xanh bị thay thế bằng bê tông và các tòa nhà cao tầng, cả sức khỏe thể chất lẫn tinh thần của cư dân địa phương đều có xu hướng giảm sút.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When green spaces are replaced by concrete and high-rise buildings, both the physical and mental health of local residents tend to suffer.",
        "explanationVi": "'When' + bị động ('are replaced') nêu điều kiện. 'Both A and B' làm chủ ngữ số nhiều nên động từ chia số nhiều ('tend'). 'Tend to suffer' = có xu hướng giảm sút.",
        "sentenceStructure": "When + S + be + V3, both + N + and + N + V",
        "modelAnswer": "When green spaces are replaced by concrete and high-rise buildings, both the physical and mental health of local residents tend to suffer.",
        "fallbackKeywords": [
          "when",
          "green spaces are replaced",
          "concrete",
          "high-rise buildings",
          "physical and mental health",
          "tend to suffer"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng đảo ngữ \"Only by + V-ing...\"):\n\n\"Chỉ bằng cách đầu tư mạnh vào chăm sóc sức khỏe dự phòng, các chính phủ mới có thể giảm được gánh nặng lâu dài đè lên những bệnh viện quá tải.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Only by investing heavily in preventive healthcare can governments reduce the long-term burden on overcrowded hospitals.",
        "explanationVi": "'Only by + V-ing' đứng đầu câu buộc ĐẢO NGỮ: 'can governments reduce' (không phải 'governments can reduce'). 'Preventive healthcare' = chăm sóc sức khỏe dự phòng.",
        "sentenceStructure": "Only by + V-ing + trợ động từ + S + V — đảo ngữ nhấn mạnh",
        "modelAnswer": "Only by investing heavily in preventive healthcare can governments reduce the long-term burden on overcrowded hospitals.",
        "fallbackKeywords": [
          "only by investing",
          "preventive healthcare",
          "can governments reduce",
          "long-term burden",
          "overcrowded hospitals"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"so ... that ...\"):\n\n\"Chất lượng không khí ở một số siêu đô thị đã xấu đi nghiêm trọng đến mức cư dân được khuyến cáo ở trong nhà vào những ngày ô nhiễm nặng nhất.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Air quality in some megacities has deteriorated so severely that residents are advised to stay indoors on the most polluted days.",
        "explanationVi": "'so + severely (trạng từ) + that' — mức độ dẫn đến kết quả, không có danh từ đi kèm (khác 'such'). 'Be advised to V' = được khuyến cáo làm gì.",
        "sentenceStructure": "S + V + so + trạng từ/tính từ + that + S + V — 'đến mức'",
        "modelAnswer": "Air quality in some megacities has deteriorated so severely that residents are advised to stay indoors on the most polluted days.",
        "fallbackKeywords": [
          "air quality",
          "megacities",
          "deteriorated so severely",
          "residents are advised",
          "stay indoors"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"Given that + S + V, ...\"):\n\n\"Xét đến việc dân số đô thị được dự báo sẽ tăng gấp đôi trong vài thập kỷ tới, việc quy hoạch nhà ở giá phải chăng và hệ thống vệ sinh không thể bị trì hoãn thêm nữa.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Given that urban populations are expected to double within a few decades, planning for affordable housing and sanitation can no longer be delayed.",
        "explanationVi": "'Given that + mệnh đề' = 'xét đến việc / vì đã biết rằng'. 'Be expected to + V' = được dự báo sẽ. 'Can no longer be delayed' = không thể trì hoãn thêm.",
        "sentenceStructure": "Given that + S + V, S + V — nêu tiền đề đã biết rồi rút ra kết luận",
        "modelAnswer": "Given that urban populations are expected to double within a few decades, planning for affordable housing and sanitation can no longer be delayed.",
        "fallbackKeywords": [
          "given that",
          "urban populations",
          "expected to double",
          "affordable housing",
          "sanitation",
          "no longer be delayed"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12_trans_health_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"While...\" chỉ sự tương phản):\n\n\"Trong khi quá trình đô thị hóa nhanh đã thúc đẩy tăng trưởng kinh tế, nó cũng đặt một gánh nặng khổng lồ lên các dịch vụ y tế công.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "While rapid urbanisation has driven economic growth, it has also placed an enormous strain on public health services.",
        "explanationVi": "'While' đầu câu nêu mặt tích cực trước, mệnh đề chính nêu mặt tiêu cực với 'also'. 'Place a strain on' = đặt gánh nặng lên (đồng nghĩa 'put pressure on').",
        "sentenceStructure": "While + S + V, S + also + V — tương phản",
        "modelAnswer": "While rapid urbanisation has driven economic growth, it has also placed an enormous strain on public health services.",
        "fallbackKeywords": [
          "while",
          "rapid urbanisation",
          "economic growth",
          "enormous strain",
          "public health services"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  },
  {
    "week": 18,
    "block": "translation",
    "topicName": "Dịch Câu - Kinh Tế & Toàn Cầu Hóa",
    "topicEmoji": "🌐",
    "essayType": "agree_disagree",
    "prompt": "Globalisation has brought significant changes to economies around the world, but its effects are not always positive. To what extent do you agree or disagree?",
    "hintAdvantages": [],
    "hintDisadvantages": [],
    "orderIndex": 23,
    "vocabularyList": [
      {
        "term": "globalisation",
        "definitionVi": "toàn cầu hóa",
        "example": "Globalisation has opened up new markets for businesses worldwide."
      },
      {
        "term": "income inequality",
        "definitionVi": "bất bình đẳng thu nhập",
        "example": "Globalisation has contributed to rising income inequality in some countries."
      },
      {
        "term": "minimum wage",
        "definitionVi": "lương tối thiểu",
        "example": "Raising the minimum wage can help reduce poverty."
      },
      {
        "term": "labour costs",
        "definitionVi": "chi phí lao động",
        "example": "High labour costs drive companies to automate their operations."
      },
      {
        "term": "automation",
        "definitionVi": "tự động hóa",
        "example": "Automation in manufacturing is displacing millions of low-skilled workers."
      },
      {
        "term": "free trade",
        "definitionVi": "thương mại tự do",
        "example": "Free trade agreements lower tariffs and increase the flow of goods between countries."
      },
      {
        "term": "inflation",
        "definitionVi": "lạm phát",
        "example": "High inflation erodes the purchasing power of ordinary citizens."
      },
      {
        "term": "multinational corporation",
        "definitionVi": "tập đoàn đa quốc gia",
        "example": "Multinational corporations can create jobs but may also exploit cheap labour."
      },
      {
        "term": "economic recession",
        "definitionVi": "suy thoái kinh tế",
        "example": "The economic recession led to mass unemployment and a drop in consumer spending."
      },
      {
        "term": "trade deficit",
        "definitionVi": "thâm hụt thương mại",
        "example": "A large trade deficit can weaken a country's currency."
      },
      {
        "term": "outsourcing",
        "definitionVi": "thuê ngoài",
        "example": "Outsourcing manufacturing to cheaper countries reduces production costs."
      },
      {
        "term": "unemployment rate",
        "definitionVi": "tỷ lệ thất nghiệp",
        "example": "The unemployment rate rose sharply after the factory closed."
      },
      {
        "term": "consumer spending",
        "definitionVi": "chi tiêu của người tiêu dùng",
        "example": "Consumer spending drives economic growth in market economies."
      },
      {
        "term": "foreign investment",
        "definitionVi": "đầu tư nước ngoài",
        "example": "Foreign investment can accelerate economic development in emerging markets."
      },
      {
        "term": "economic growth",
        "definitionVi": "tăng trưởng kinh tế",
        "example": "Sustained economic growth requires investment in education and infrastructure."
      },
      {
        "term": "tax evasion",
        "definitionVi": "trốn thuế",
        "example": "Tax evasion by large corporations deprives governments of vital revenue."
      },
      {
        "term": "supply chain",
        "definitionVi": "chuỗi cung ứng",
        "example": "The pandemic exposed the fragility of global supply chains."
      },
      {
        "term": "GDP (gross domestic product)",
        "definitionVi": "tổng sản phẩm quốc nội",
        "example": "GDP is the most common measure of a country's economic output."
      },
      {
        "term": "trade protectionism",
        "definitionVi": "chủ nghĩa bảo hộ thương mại",
        "example": "Trade protectionism can protect domestic industries but often triggers retaliation."
      },
      {
        "term": "currency depreciation",
        "definitionVi": "mất giá đồng tiền",
        "example": "Currency depreciation makes exports cheaper but raises the cost of imports."
      },
      {
        "term": "reap the benefits of globalisation",
        "definitionVi": "gặt hái lợi ích từ toàn cầu hóa",
        "example": "Developed economies have long reaped the benefits of globalisation."
      },
      {
        "term": "widen the gap between rich and poor",
        "definitionVi": "nới rộng khoảng cách giàu nghèo",
        "example": "Unequal trade practices can widen the gap between rich and poor nations."
      },
      {
        "term": "boost cross-border trade",
        "definitionVi": "thúc đẩy thương mại xuyên biên giới",
        "example": "Trade agreements have helped boost cross-border trade significantly."
      },
      {
        "term": "drive down production costs",
        "definitionVi": "kéo giảm chi phí sản xuất",
        "example": "Outsourcing helps companies drive down production costs."
      },
      {
        "term": "expose local industries to competition",
        "definitionVi": "khiến các ngành công nghiệp địa phương đối mặt cạnh tranh",
        "example": "Free trade exposes local industries to intense foreign competition."
      },
      {
        "term": "stimulate economic growth",
        "definitionVi": "kích thích tăng trưởng kinh tế",
        "example": "Foreign investment can stimulate economic growth in developing nations."
      },
      {
        "term": "erode local traditions",
        "definitionVi": "làm xói mòn các truyền thống địa phương",
        "example": "Some argue that globalisation gradually erodes local traditions."
      },
      {
        "term": "integrate into the global economy",
        "definitionVi": "hội nhập vào nền kinh tế toàn cầu",
        "example": "Emerging markets are working to integrate into the global economy."
      },
      {
        "term": "trigger job losses",
        "definitionVi": "gây ra tình trạng mất việc làm",
        "example": "Automation and outsourcing can trigger job losses in certain sectors."
      },
      {
        "term": "level the global playing field",
        "definitionVi": "tạo sân chơi toàn cầu công bằng",
        "example": "Fair trade policies aim to level the global playing field for smaller economies."
      }
    ],
    "questions": [
      {
        "questionId": "w12_trans_econ_q01",
        "level": "beginner",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh:\n\n\"Toàn cầu hóa đã tạo ra nhiều cơ hội kinh tế nhưng cũng làm gia tăng khoảng cách giàu nghèo.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.",
        "explanationVi": "'Widen the gap' = làm gia tăng khoảng cách. 'The gap between the rich and the poor' = khoảng cách giàu nghèo. Present Perfect nhấn mạnh kết quả hiện tại từ quá khứ.",
        "modelAnswer": "Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.",
        "fallbackKeywords": [
          "globalisation",
          "economic opportunities",
          "widened",
          "rich",
          "poor"
        ],
        "orderIndex": 1,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q02",
        "level": "elementary",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"automation\" và \"low-skilled workers\"):\n\n\"Tự động hóa trong sản xuất công nghiệp đang đe dọa việc làm của hàng triệu công nhân tay nghề thấp trên toàn thế giới.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.",
        "explanationVi": "Present Continuous 'is threatening' nhấn mạnh quá trình đang diễn ra liên tục. 'Low-skilled workers' = công nhân tay nghề thấp. 'Millions of' = hàng triệu (không nói 'million of').",
        "modelAnswer": "Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.",
        "fallbackKeywords": [
          "automation",
          "industrial production",
          "threatening",
          "low-skilled workers",
          "worldwide"
        ],
        "orderIndex": 2,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q03",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"minimum wage\" và \"labour costs\"):\n\n\"Mặc dù tăng lương tối thiểu có thể cải thiện đời sống của người lao động thu nhập thấp, một số doanh nghiệp nhỏ có thể phải thu hẹp hoặc đóng cửa do chi phí lao động tăng cao.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.",
        "explanationVi": "'Although + clause, clause' diễn đạt tương phản. 'May have to + V' = có thể phải. 'Downsize' = thu hẹp quy mô. 'Due to' = do, vì (giới từ, theo sau là danh từ/noun phrase).",
        "modelAnswer": "Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.",
        "fallbackKeywords": [
          "minimum wage",
          "improve",
          "low-income workers",
          "small businesses",
          "downsize",
          "labour costs"
        ],
        "orderIndex": 3,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q04",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"international trade\" và \"developing countries\"):\n\n\"Toàn cầu hóa đã thúc đẩy thương mại quốc tế và tạo ra nhiều cơ hội việc làm mới ở các nước đang phát triển.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Globalisation has boosted international trade and created many new employment opportunities in developing countries.",
        "explanationVi": "'Boost international trade' = thúc đẩy thương mại quốc tế ('boost' mạnh hơn 'increase'). 'Employment opportunities' = cơ hội việc làm. Present Perfect nhấn mạnh kết quả đến hiện tại.",
        "modelAnswer": "Globalisation has boosted international trade and created many new employment opportunities in developing countries.",
        "fallbackKeywords": [
          "globalisation",
          "international trade",
          "employment opportunities",
          "developing countries"
        ],
        "orderIndex": 4,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q05",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"economic growth\" và \"local cultural identity\"):\n\n\"Mặc dù toàn cầu hóa mang lại tăng trưởng kinh tế, nó cũng có thể gây ra sự xói mòn bản sắc văn hóa địa phương.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Although globalisation brings economic growth, it can also cause the erosion of local cultural identity.",
        "explanationVi": "'Erosion' = sự xói mòn, mai một dần (hình ảnh học thuật). 'Local cultural identity' = bản sắc văn hóa địa phương. 'Although A, B' diễn đạt tương phản.",
        "modelAnswer": "Although globalisation brings economic growth, it can also cause the erosion of local cultural identity.",
        "fallbackKeywords": [
          "globalisation",
          "economic growth",
          "erosion",
          "local cultural identity"
        ],
        "orderIndex": 5,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q06",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"income inequality\" và \"distributed equally\"):\n\n\"Bất bình đẳng thu nhập đã trở thành vấn đề nghiêm trọng hơn trong bối cảnh toàn cầu hóa, khi lợi ích kinh tế không được phân phối đồng đều.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Income inequality has become a more serious issue in the context of globalisation, as economic benefits are not distributed equally.",
        "explanationVi": "'In the context of' = trong bối cảnh. 'Distributed equally' = được phân phối đồng đều (passive). 'As' = vì, bởi vì (liên từ nguyên nhân).",
        "modelAnswer": "Income inequality has become a more serious issue in the context of globalisation, as economic benefits are not distributed equally.",
        "fallbackKeywords": [
          "income inequality",
          "globalisation",
          "economic benefits",
          "distributed equally"
        ],
        "orderIndex": 6,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q07",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"multinational corporations\" và \"job losses\"):\n\n\"Nhiều tập đoàn đa quốc gia chuyển sản xuất sang các nước có chi phí lao động thấp, gây ra mất việc làm ở các nước phát triển.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Many multinational corporations relocate their production to countries with lower labour costs, causing job losses in developed nations.",
        "explanationVi": "'Multinational corporations' = tập đoàn đa quốc gia. 'Relocate production to' = chuyển sản xuất sang. '...causing job losses' (participial clause) = gây ra mất việc làm — diễn đạt hệ quả trực tiếp.",
        "modelAnswer": "Many multinational corporations relocate their production to countries with lower labour costs, causing job losses in developed nations.",
        "fallbackKeywords": [
          "multinational corporations",
          "relocate",
          "lower labour costs",
          "job losses",
          "developed nations"
        ],
        "orderIndex": 7,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q08",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"income redistribution\" và \"implement policies\"):\n\n\"Để đảm bảo toàn cầu hóa mang lại lợi ích cho tất cả mọi người, chính phủ cần thực hiện các chính sách phân phối lại thu nhập hiệu quả.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "To ensure that globalisation benefits everyone, governments need to implement effective income redistribution policies.",
        "explanationVi": "'To ensure that' = để đảm bảo rằng. 'Implement policies' = thực thi/thực hiện chính sách. 'Income redistribution' = phân phối lại thu nhập.",
        "modelAnswer": "To ensure that globalisation benefits everyone, governments need to implement effective income redistribution policies.",
        "fallbackKeywords": [
          "ensure",
          "globalisation benefits",
          "implement",
          "income redistribution policies"
        ],
        "orderIndex": 8,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q09",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"labour costs\" và \"production facilities abroad\"):\n\n\"Chi phí lao động cao ở các nước phát triển là một trong những lý do chính khiến các công ty chuyển cơ sở sản xuất ra nước ngoài.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "High labour costs in developed countries are one of the main reasons why companies move their production facilities abroad.",
        "explanationVi": "'Labour costs' = chi phí lao động. 'Production facilities' = cơ sở sản xuất. 'Move abroad' = chuyển ra nước ngoài. 'One of the main reasons why' = một trong những lý do chính khiến.",
        "modelAnswer": "High labour costs in developed countries are one of the main reasons why companies move their production facilities abroad.",
        "fallbackKeywords": [
          "labour costs",
          "developed countries",
          "main reasons",
          "production facilities",
          "abroad"
        ],
        "orderIndex": 9,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q10",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"information technology\" và \"cross-border trade\"):\n\n\"Những tiến bộ trong công nghệ thông tin đã thúc đẩy toàn cầu hóa bằng cách làm cho giao tiếp và thương mại xuyên biên giới trở nên dễ dàng hơn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Advances in information technology have facilitated globalisation by making cross-border communication and trade easier.",
        "explanationVi": "'Advances in' = những tiến bộ trong. 'Facilitate' = tạo điều kiện thuận lợi cho, thúc đẩy (Band 7+ thay cho 'help'). 'Cross-border' = xuyên biên giới. 'By + V-ing' = bằng cách.",
        "modelAnswer": "Advances in information technology have facilitated globalisation by making cross-border communication and trade easier.",
        "fallbackKeywords": [
          "advances in technology",
          "facilitated globalisation",
          "cross-border",
          "communication",
          "trade"
        ],
        "orderIndex": 10,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q11",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"tend to benefit\" và \"resource exploitation\"):\n\n\"Trong khi các nước phát triển thường được hưởng lợi nhiều hơn từ toàn cầu hóa, các nước nghèo hơn có thể phải chịu hậu quả như khai thác tài nguyên quá mức.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "While developed countries tend to benefit more from globalisation, poorer nations may suffer negative consequences such as excessive resource exploitation.",
        "explanationVi": "'Tend to + V' = có xu hướng. 'Suffer negative consequences' = chịu hậu quả tiêu cực. 'Excessive resource exploitation' = khai thác tài nguyên quá mức. 'While A, B' diễn đạt tương phản.",
        "modelAnswer": "While developed countries tend to benefit more from globalisation, poorer nations may suffer negative consequences such as excessive resource exploitation.",
        "fallbackKeywords": [
          "tend to benefit",
          "globalisation",
          "poorer nations",
          "resource exploitation"
        ],
        "orderIndex": 11,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q12",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"small and medium-sized enterprises\" và \"competitive challenges\"):\n\n\"Toàn cầu hóa đã mở ra thị trường mới cho doanh nghiệp vừa và nhỏ, nhưng cũng đặt ra thách thức cạnh tranh lớn từ các tập đoàn quốc tế.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Globalisation has opened up new markets for small and medium-sized enterprises, but it has also posed significant competitive challenges from international corporations.",
        "explanationVi": "'Small and medium-sized enterprises (SMEs)' = doanh nghiệp vừa và nhỏ. 'Pose challenges' = đặt ra thách thức. 'International corporations' = tập đoàn quốc tế.",
        "modelAnswer": "Globalisation has opened up new markets for small and medium-sized enterprises, but it has also posed significant competitive challenges from international corporations.",
        "fallbackKeywords": [
          "small and medium-sized enterprises",
          "new markets",
          "competitive challenges",
          "international corporations"
        ],
        "orderIndex": 12,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q13",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch sang tiếng Anh (dùng từ \"minimum wages\" và \"substandard working conditions\"):\n\n\"Lương tối thiểu thấp ở các nước đang phát triển thu hút đầu tư nước ngoài nhưng đồng thời duy trì điều kiện làm việc không đạt chuẩn.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Low minimum wages in developing countries attract foreign investment but simultaneously maintain substandard working conditions.",
        "explanationVi": "'Low minimum wages' = lương tối thiểu thấp. 'Attract foreign investment' = thu hút đầu tư nước ngoài. 'Substandard working conditions' = điều kiện làm việc không đạt chuẩn. 'Simultaneously' = đồng thời.",
        "modelAnswer": "Low minimum wages in developing countries attract foreign investment but simultaneously maintain substandard working conditions.",
        "fallbackKeywords": [
          "minimum wages",
          "developing countries",
          "foreign investment",
          "substandard working conditions"
        ],
        "orderIndex": 13,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q14",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc \"Unlike in the past, when...\"):\n\n\"Không giống như trước đây, khi các cuộc khủng hoảng kinh tế thường chỉ giới hạn trong phạm vi biên giới quốc gia, một cú sốc tài chính ở một nền kinh tế lớn hiện nay có thể lan ra toàn cầu chỉ trong vài ngày.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Unlike in the past, when economic crises tended to stay within national borders, a financial shock in one major economy can now spread across the globe within days.",
        "explanationVi": "Tương phản quá khứ – hiện tại. 'Tended to stay' (quá khứ) đối lập 'can now spread' (hiện tại). Cặp 'within national borders' / 'across the globe' tạo sự đối lập về không gian.",
        "sentenceStructure": "Unlike in the past, when + S + V (quá khứ), S + can now + V",
        "modelAnswer": "Unlike in the past, when economic crises tended to stay within national borders, a financial shock in one major economy can now spread across the globe within days.",
        "fallbackKeywords": [
          "unlike in the past",
          "economic crises",
          "national borders",
          "financial shock",
          "can now spread",
          "within days"
        ],
        "orderIndex": 14,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q15",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng câu điều kiện loại 2):\n\n\"Nếu các quốc gia giàu chia sẻ công nghệ và chuyên môn một cách cởi mở hơn, các nước đang phát triển sẽ có thể công nghiệp hóa mà không lặp lại những sai lầm về môi trường tương tự.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "If wealthy nations shared technology and expertise more openly, developing countries would be able to industrialise without repeating the same environmental mistakes.",
        "explanationVi": "Điều kiện loại 2: 'If ... shared', 'would be able to industrialise'. 'Without + V-ing' = mà không. Đây là mẫu câu lập luận phản biện điển hình trong bài agree/disagree.",
        "sentenceStructure": "If + S + V (quá khứ đơn), S + would be able to + V — điều kiện loại 2",
        "modelAnswer": "If wealthy nations shared technology and expertise more openly, developing countries would be able to industrialise without repeating the same environmental mistakes.",
        "fallbackKeywords": [
          "if",
          "wealthy nations",
          "shared technology",
          "developing countries",
          "would be able to industrialise",
          "environmental mistakes"
        ],
        "orderIndex": 15,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q16",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng mệnh đề \"When...\"):\n\n\"Khi các tập đoàn đa quốc gia chuyển nhà máy đến bất cứ nơi nào có lao động rẻ nhất, người lao động ở các quốc gia có mức lương cao hơn thường bị mất việc làm.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "When multinational corporations move their factories to wherever labour is cheapest, workers in higher-wage countries are often left unemployed.",
        "explanationVi": "'When' + hiện tại đơn nêu quy luật. 'Wherever' = bất cứ nơi nào (mệnh đề trạng ngữ). 'Be left + tính từ' = bị rơi vào tình trạng nào đó ('left unemployed').",
        "sentenceStructure": "When + S + V, S + be + left + adj",
        "modelAnswer": "When multinational corporations move their factories to wherever labour is cheapest, workers in higher-wage countries are often left unemployed.",
        "fallbackKeywords": [
          "when",
          "multinational corporations",
          "move their factories",
          "wherever labour is cheapest",
          "left unemployed"
        ],
        "orderIndex": 16,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q17",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"It is often argued that ..., yet ...\"):\n\n\"Người ta thường lập luận rằng toàn cầu hóa mang lại lợi ích cho người tiêu dùng nhờ giá cả thấp hơn, tuy nhiên nó cũng có thể đẩy các nhà sản xuất nhỏ ở địa phương ra khỏi thị trường.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "It is often argued that globalisation benefits consumers through lower prices, yet it can also drive small local producers out of business.",
        "explanationVi": "'It is often argued/claimed that' là cách khách quan để dẫn một quan điểm phổ biến. 'Yet' = tuy nhiên (nối hai mệnh đề độc lập). 'Drive sb out of business' = đẩy ai khỏi thương trường.",
        "sentenceStructure": "It is often argued that + S + V, yet + S + V — nêu quan điểm phổ biến rồi phản biện",
        "modelAnswer": "It is often argued that globalisation benefits consumers through lower prices, yet it can also drive small local producers out of business.",
        "fallbackKeywords": [
          "it is often argued that",
          "globalisation benefits consumers",
          "lower prices",
          "drive small local producers",
          "out of business"
        ],
        "orderIndex": 17,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q18",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng cấu trúc so sánh kép \"The more..., the more vulnerable...\"):\n\n\"Một quốc gia càng hội nhập sâu vào nền kinh tế toàn cầu, thì quốc gia đó càng dễ bị tổn thương trước những đợt suy thoái bắt nguồn từ nơi khác.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "The more integrated a country becomes into the global economy, the more vulnerable it is to downturns that originate elsewhere.",
        "explanationVi": "So sánh kép với tính từ: 'The more integrated a country becomes', 'the more vulnerable it is'. 'That originate elsewhere' bổ nghĩa cho 'downturns'.",
        "sentenceStructure": "The more + adj + S + V, the more + adj + S + be — 'càng... càng...'",
        "modelAnswer": "The more integrated a country becomes into the global economy, the more vulnerable it is to downturns that originate elsewhere.",
        "fallbackKeywords": [
          "the more integrated",
          "global economy",
          "the more vulnerable",
          "downturns",
          "originate elsewhere"
        ],
        "orderIndex": 18,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q19",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng \"Despite + cụm danh từ\"):\n\n\"Bất chấp lượng của cải mà thương mại toàn cầu đã tạo ra, khoảng cách giữa những công dân giàu nhất và nghèo nhất vẫn tiếp tục nới rộng ở nhiều quốc gia.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Despite the wealth that global trade has generated, the gap between the richest and poorest citizens has continued to widen in many countries.",
        "explanationVi": "'Despite' + cụm danh từ 'the wealth that global trade has generated' (bên trong có mệnh đề quan hệ nhưng toàn bộ vẫn là một cụm danh từ). 'Continue to widen' = tiếp tục nới rộng.",
        "sentenceStructure": "Despite + cụm danh từ (+ mệnh đề quan hệ), S + V",
        "modelAnswer": "Despite the wealth that global trade has generated, the gap between the richest and poorest citizens has continued to widen in many countries.",
        "fallbackKeywords": [
          "despite the wealth",
          "global trade",
          "the gap",
          "richest and poorest citizens",
          "continued to widen"
        ],
        "orderIndex": 19,
        "isActive": true
      },
      {
        "questionId": "w12_trans_econ_q20",
        "level": "intermediate",
        "type": "translation",
        "questionText": "Dịch câu sau sang tiếng Anh (dùng đảo ngữ \"Not only does + S + V...\"):\n\n\"Chủ nghĩa bảo hộ không chỉ làm tăng giá cả đối với người tiêu dùng bình thường mà còn kéo theo sự trả đũa từ các đối tác thương mại.\"",
        "options": [],
        "baseWords": [],
        "correctAnswer": "Not only does protectionism raise prices for ordinary consumers, but it also invites retaliation from trading partners.",
        "explanationVi": "'Not only' đầu câu + trợ động từ 'does' + chủ ngữ + động từ nguyên thể 'raise'. Vế hai: 'but it also invites'. 'Invite retaliation' = kéo theo sự trả đũa.",
        "sentenceStructure": "Not only + trợ động từ (do/does) + S + V, but + S + also + V — đảo ngữ",
        "modelAnswer": "Not only does protectionism raise prices for ordinary consumers, but it also invites retaliation from trading partners.",
        "fallbackKeywords": [
          "not only",
          "protectionism",
          "raise prices",
          "ordinary consumers",
          "invites retaliation",
          "trading partners"
        ],
        "orderIndex": 20,
        "isActive": true
      }
    ]
  }
];

async function runSeed() {
  const Task2Topic = require('../models/Task2Topic');

  // Use week+orderIndex as unique key
  const ops = topics.map(t => ({
    replaceOne: { filter: { week: t.week, orderIndex: t.orderIndex }, replacement: t, upsert: true }
  }));

  const result = await Task2Topic.bulkWrite(ops);
  console.log(`[Task2Seed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} Task 2 topics`);
}

// Re-seed only week 12: delete all week-12 docs then insert fresh from seed data
async function reseedWeek12() {
  const Task2Topic = require('../models/Task2Topic');
  const week12Topics = topics.filter(t => t.week === 12);

  const del = await Task2Topic.deleteMany({ week: 12 });
  console.log(`[Task2Seed] Deleted ${del.deletedCount} week-12 topics`);

  const inserted = await Task2Topic.insertMany(week12Topics);
  console.log(`[Task2Seed] Inserted ${inserted.length} fresh week-12 topics`);
}

// Allow direct execution: node backend/scripts/seedTask2Exercises.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log('[Task2Seed] Done');
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, reseedWeek12, topics };
