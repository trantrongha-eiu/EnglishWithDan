/**
 * Seed script for Task2Topic collection
 * 18 topics across 12 weeks — 3 sample questions each (beginner + elementary + intermediate)
 * Run: node backend/scripts/seedTask2Exercises.js
 */

const topics = [
  // ─── BLOCK 1: Week 1-2 — Advantages & Disadvantages / Technology & Media ───
  {
    week: 1, block: 'advantages_disadvantages', orderIndex: 1,
    topicName: 'Technology in Education', topicEmoji: '🖥️',
    essayType: 'advantages_disadvantages',
    prompt: 'Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?',
    hintAdvantages: ['flexible schedule', 'cost-effective', 'accessible from anywhere'],
    hintDisadvantages: ['lack of face-to-face interaction', 'lower motivation', 'technical difficulties'],
    vocabularyList: [
      { term: 'online learning', definitionVi: 'học trực tuyến', example: 'Online learning offers flexibility for working adults.' },
      { term: 'in-person classes', definitionVi: 'lớp học trực tiếp', example: 'Many students prefer in-person classes for better interaction.' },
      { term: 'flexible schedule', definitionVi: 'lịch học linh hoạt', example: 'A flexible schedule allows students to study at their own pace.' },
      { term: 'self-discipline', definitionVi: 'tính kỷ luật tự giác', example: 'Online learning requires strong self-discipline.' },
      { term: 'social isolation', definitionVi: 'sự cô lập xã hội', example: 'Studying alone can lead to social isolation.' },
      { term: 'face-to-face interaction', definitionVi: 'giao tiếp mặt đối mặt', example: 'Face-to-face interaction helps build stronger relationships between students and teachers.' },
      { term: 'access to education', definitionVi: 'tiếp cận giáo dục', example: 'The internet expands access to education for people in remote areas.' },
      { term: 'remote area', definitionVi: 'vùng sâu vùng xa', example: 'Students in remote areas benefit greatly from online learning.' },
      { term: 'digital fatigue', definitionVi: 'mệt mỏi vì màn hình số', example: 'Spending too much time online can lead to digital fatigue.' },
      { term: 'academic performance', definitionVi: 'kết quả học tập', example: 'Poor motivation negatively affects academic performance.' },
      { term: 'working adults', definitionVi: 'người đi làm', example: 'Online learning is particularly beneficial for working adults.' },
      { term: 'cost-effective', definitionVi: 'tiết kiệm chi phí', example: 'Online courses are generally more cost-effective than traditional classes.' },
      { term: 'technical difficulties', definitionVi: 'sự cố kỹ thuật', example: 'Students in rural areas often face technical difficulties when studying online.' },
      { term: 'digital literacy', definitionVi: 'hiểu biết về công nghệ số', example: 'Digital literacy is now an essential skill for modern students.' },
      { term: 'interactive platform', definitionVi: 'nền tảng tương tác', example: 'Interactive platforms make online learning more engaging.' }
    ],
    questions: [
      {
        questionId: 'w1t1_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đọc đề bài sau và cho biết đây là dạng essay nào?\n\n"Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?"',
        options: ['Agree or Disagree', 'Advantages & Disadvantages', 'Discuss Both Views', 'Cause & Solution'],
        correctAnswer: 'Advantages & Disadvantages',
        explanationVi: 'Keyword "advantages and disadvantages" trong câu hỏi xác định ngay đây là dạng Advantages & Disadvantages. Dạng này yêu cầu phân tích cả hai mặt tích cực và tiêu cực một cách cân bằng.'
      },
      {
        questionId: 'w1t1_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu để hoàn chỉnh câu mở bài:\n\n"In recent _____, online learning has become an increasingly prominent feature of modern education."',
        correctAnswer: 'years',
        explanationVi: "Công thức mở bài chuẩn: 'In recent years...' — luôn dùng 'years' (số nhiều). Đây là cách bắt đầu essay học thuật rất phổ biến."
      },
      {
        questionId: 'w1t1_q03', level: 'beginner', orderIndex: 3,
        type: 'topic_sentence',
        questionText: 'Chọn Thesis Statement phù hợp nhất cho bài essay dạng Advantages & Disadvantages về online learning:',
        options: [
          'Online learning is better than in-person classes.',
          'This essay will examine both the advantages and disadvantages of online learning.',
          'I strongly agree that online learning should replace traditional schools.',
          'The government should invest more in online education.'
        ],
        correctAnswer: 'This essay will examine both the advantages and disadvantages of online learning.',
        explanationVi: "Thesis statement của Advantages & Disadvantages essay phải nêu rõ bài sẽ phân tích CẢ HAI mặt. Các lựa chọn khác thể hiện lập trường một chiều, không phù hợp với dạng bài này."
      },
      {
        questionId: 'w1t1_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều trường đại học đã bắt đầu cung cấp khóa học trực tuyến để sinh viên có thể học ở bất cứ đâu."',
        correctAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        modelAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        fallbackKeywords: ['universities', 'online learning', 'courses', 'students', 'anywhere'],
        explanationVi: "Cấu trúc 'so that + mệnh đề mục đích' diễn tả kết quả mong muốn. 'have started + V-ing' dùng Present Perfect để nhấn mạnh sự thay đổi gần đây."
      },
      {
        questionId: 'w1t1_q05', level: 'beginner', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học trực tuyến mang lại lịch học linh hoạt cho những người đi làm."',
        correctAnswer: 'Online learning provides a flexible schedule for working adults.',
        modelAnswer: 'Online learning provides a flexible schedule for working adults.',
        fallbackKeywords: ['online learning', 'flexible schedule', 'working adults'],
        explanationVi: "'Provide + N + for + N' là cấu trúc diễn tả lợi ích. 'Working adults' = những người vừa đi làm vừa học."
      },
      {
        questionId: 'w1t1_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học online có thể dẫn đến thiếu sự tương tác trực tiếp giữa học sinh và giáo viên."',
        correctAnswer: 'Online learning can lead to a lack of face-to-face interaction between students and teachers.',
        modelAnswer: 'Online learning can lead to a lack of face-to-face interaction between students and teachers.',
        fallbackKeywords: ['online learning', 'face-to-face', 'interaction', 'students', 'teachers'],
        explanationVi: "'Lead to + N' = dẫn đến. 'A lack of + N' = sự thiếu hụt của. Đây là cách diễn đạt nhược điểm rất chuẩn trong IELTS."
      },
      {
        questionId: 'w1t1_q07', level: 'elementary', orderIndex: 7,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học online có thể gây ra sự cô lập xã hội vì học sinh có ít cơ hội giao lưu với bạn bè hơn."',
        correctAnswer: 'Online learning may cause social isolation as students have fewer opportunities to interact with peers.',
        modelAnswer: 'Online learning may cause social isolation as students have fewer opportunities to interact with peers.',
        fallbackKeywords: ['social isolation', 'students', 'opportunities', 'peers', 'interact'],
        explanationVi: "'As + mệnh đề' giải thích nguyên nhân. 'Fewer opportunities to + V' = ít cơ hội hơn để làm gì. 'Peers' = bạn cùng trang lứa."
      },
      {
        questionId: 'w1t1_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[of online learning / significant / One / advantage / the / most / is / its flexibility]',
        correctAnswer: 'One of the most significant advantages of online learning is its flexibility.',
        modelAnswer: 'One of the most significant advantages of online learning is its flexibility.',
        fallbackKeywords: ['significant', 'advantages', 'online learning', 'flexibility'],
        explanationVi: "Cấu trúc 'One of the most + adj + N + of + N + is + N' dùng để nhấn mạnh một điểm nổi bật nhất. 'Significant' = đáng kể, quan trọng."
      },
      {
        questionId: 'w1t1_q09', level: 'elementary', orderIndex: 9,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi ngữ pháp. Hãy sửa lại:\n\n"Although online learning has many advantages, but it also has some disadvantages."',
        correctAnswer: 'Although online learning has many advantages, it also has some disadvantages.',
        modelAnswer: 'Although online learning has many advantages, it also has some disadvantages.',
        fallbackKeywords: ['although', 'online learning', 'advantages', 'disadvantages'],
        explanationVi: "Lỗi: Không dùng 'Although' và 'but' cùng lúc trong một câu. Chọn một: 'Although..., [no but]' hoặc '..., but...' (xóa Although)."
      },
      {
        questionId: 'w1t1_q10', level: 'elementary', orderIndex: 10,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence tốt nhất cho đoạn văn về ƯU ĐIỂM của online learning:',
        options: [
          'Online learning is very popular nowadays.',
          'One of the main advantages of online learning is its flexibility and convenience.',
          'Online learning has some disadvantages that cannot be ignored.',
          'Many students prefer studying in traditional classrooms.'
        ],
        correctAnswer: 'One of the main advantages of online learning is its flexibility and convenience.',
        explanationVi: "Topic sentence phải nêu rõ luận điểm chính của đoạn. 'One of the main advantages' giới thiệu trực tiếp nội dung sẽ phân tích. Các lựa chọn khác quá chung chung hoặc lạc đề."
      },
      {
        questionId: 'w1t1_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Internet giúp mở rộng cơ hội tiếp cận giáo dục cho người dân ở vùng sâu vùng xa."',
        correctAnswer: 'The Internet helps expand access to education for people in remote areas.',
        modelAnswer: 'The Internet helps expand access to education for people in remote areas.',
        fallbackKeywords: ['internet', 'access', 'education', 'remote areas'],
        explanationVi: "'Expand access to + N' = mở rộng khả năng tiếp cận. 'Remote areas' = vùng sâu vùng xa. Đây là lập luận ủng hộ online learning rất thuyết phục."
      },
      {
        questionId: 'w1t1_q12', level: 'intermediate', orderIndex: 12,
        type: 'paraphrase',
        questionText: 'Paraphrase câu sau (viết lại theo nghĩa tương đương):\n\n"Many schools now offer online learning as an alternative to in-person classes."',
        correctAnswer: 'Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.',
        modelAnswer: 'Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.',
        fallbackKeywords: ['educational institutions', 'digital', 'substitute', 'traditional', 'teaching'],
        explanationVi: "Paraphrase tốt thay 'schools' → 'educational institutions', 'offer' → 'providing', 'alternative' → 'substitute', 'in-person' → 'face-to-face'. Không được giữ nguyên quá nhiều từ gốc."
      },
      {
        questionId: 'w1t1_q13', level: 'intermediate', orderIndex: 13,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về MỘT ƯU ĐIỂM của online learning.\n\nDùng cấu trúc: Topic Sentence → Explanation → Example → Result\nGợi ý: flexibility / working adults / self-paced learning',
        modelAnswer: 'One of the most significant advantages of online learning is its flexibility, which particularly benefits working adults. Unlike traditional classroom settings, online platforms allow students to access lectures and complete assignments at their own pace, without being constrained by fixed timetables. For example, a full-time employee can study after work hours or during weekends, making it possible to pursue higher qualifications without sacrificing their career. As a result, online learning has opened up educational opportunities for millions of people who would otherwise be unable to attend conventional classes.',
        fallbackKeywords: ['flexibility', 'online learning', 'working adults', 'own pace', 'access', 'educational opportunities'],
        explanationVi: "Cấu trúc PEEL: Point (topic sentence) → Explain (giải thích tại sao) → Example (ví dụ cụ thể) → Link (kết nối lại chủ đề). Mỗi body paragraph chỉ nêu MỘT ý chính duy nhất."
      },
      {
        questionId: 'w1t1_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "online learning"):\n\n"Nhiều trường đại học đã bắt đầu cung cấp khóa học trực tuyến để sinh viên có thể học ở bất cứ đâu."',
        correctAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        modelAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        fallbackKeywords: ['online learning', 'universities', 'offering', 'students', 'anywhere'],
        explanationVi: "'Online learning' là danh từ ghép không cần mạo từ. Cấu trúc 'so that + clause' diễn đạt mục đích của hành động."
      },
      {
        questionId: 'w1t1_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "in-person classes"):\n\n"Một số người cho rằng lớp học trực tiếp giúp học sinh tương tác hiệu quả hơn."',
        correctAnswer: 'Some people argue that in-person classes help students interact more effectively.',
        modelAnswer: 'Some people argue that in-person classes help students interact more effectively.',
        fallbackKeywords: ['in-person classes', 'students', 'interact', 'effectively'],
        explanationVi: "'In-person classes' = lớp học trực tiếp (đối lập với online). 'Argue that' = cho rằng, lập luận rằng — dùng khi trình bày quan điểm học thuật."
      },
      {
        questionId: 'w1t1_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "virtual classroom"):\n\n"Trong lớp học ảo, giáo viên và học sinh giao tiếp thông qua các nền tảng trực tuyến."',
        correctAnswer: 'In a virtual classroom, teachers and students communicate through online platforms.',
        modelAnswer: 'In a virtual classroom, teachers and students communicate through online platforms.',
        fallbackKeywords: ['virtual classroom', 'teachers', 'students', 'communicate', 'online platforms'],
        explanationVi: "'Virtual classroom' = lớp học ảo. 'Communicate through' = giao tiếp thông qua — dùng 'through' thay cho 'via' trong văn phong học thuật."
      },
      {
        questionId: 'w1t1_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "distance education"):\n\n"Giáo dục từ xa tạo cơ hội cho những người không thể đến trường."',
        correctAnswer: 'Distance education creates opportunities for those who are unable to attend school in person.',
        modelAnswer: 'Distance education creates opportunities for those who are unable to attend school in person.',
        fallbackKeywords: ['distance education', 'opportunities', 'unable to attend', 'in person'],
        explanationVi: "'Distance education' = giáo dục từ xa. 'Those who are unable to' = những người không thể — 'unable to' mang sắc thái chính thức hơn 'cannot'."
      },
      {
        questionId: 'w1t1_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "blended learning"):\n\n"Học kết hợp giúp cân bằng giữa sự linh hoạt và tương tác trực tiếp."',
        correctAnswer: 'Blended learning helps strike a balance between flexibility and face-to-face interaction.',
        modelAnswer: 'Blended learning helps strike a balance between flexibility and face-to-face interaction.',
        fallbackKeywords: ['blended learning', 'balance', 'flexibility', 'face-to-face interaction'],
        explanationVi: "'Blended learning' = học kết hợp online và offline. 'Strike a balance between A and B' = cân bằng giữa hai yếu tố — collocation cố định quan trọng."
      },
      {
        questionId: 'w1t1_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "digital literacy"):\n\n"Sinh viên cần có khả năng sử dụng công nghệ số để học hiệu quả."',
        correctAnswer: 'Students need digital literacy skills to learn effectively in the modern era.',
        modelAnswer: 'Students need digital literacy skills to learn effectively in the modern era.',
        fallbackKeywords: ['digital literacy', 'students', 'skills', 'effectively'],
        explanationVi: "'Digital literacy' = khả năng hiểu biết và sử dụng công nghệ số. 'In the modern era' = trong thời đại hiện đại — thêm vào cuối câu để nâng tính học thuật."
      },
      {
        questionId: 'w1t1_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "technological advancement"):\n\n"Sự phát triển của công nghệ hiện đại đã thay đổi cách chúng ta học tập."',
        correctAnswer: 'Technological advancement has transformed the way we learn.',
        modelAnswer: 'Technological advancement has transformed the way we learn.',
        fallbackKeywords: ['technological advancement', 'transformed', 'the way we learn'],
        explanationVi: "'Technological advancement' = sự tiến bộ công nghệ (học thuật hơn 'development'). 'Transform' mạnh hơn 'change' — thể hiện sự thay đổi sâu sắc."
      },
      {
        questionId: 'w1t1_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "self-discipline"):\n\n"Học online yêu cầu người học có tính kỷ luật tự giác cao."',
        correctAnswer: 'Online learning requires learners to have a high level of self-discipline.',
        modelAnswer: 'Online learning requires learners to have a high level of self-discipline.',
        fallbackKeywords: ['self-discipline', 'online learning', 'requires', 'high level'],
        explanationVi: "'Require + O + to V' = yêu cầu ai làm gì. 'A high level of self-discipline' = mức độ tự giác cao — 'level of + noun' là cấu trúc hay dùng trong IELTS."
      },
      {
        questionId: 'w1t1_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "time management skills"):\n\n"Học sinh cần rèn luyện kỹ năng quản lý thời gian để theo kịp tiến độ học."',
        correctAnswer: 'Students need to develop time management skills to keep up with their studies.',
        modelAnswer: 'Students need to develop time management skills to keep up with their studies.',
        fallbackKeywords: ['time management skills', 'develop', 'keep up', 'studies'],
        explanationVi: "'Time management skills' = kỹ năng quản lý thời gian. 'Keep up with' = theo kịp — phrasal verb quan trọng trong văn phong học thuật."
      },
      {
        questionId: 'w1t1_q23', level: 'intermediate', orderIndex: 23,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "internet connectivity"):\n\n"Ở một số vùng nông thôn, kết nối Internet vẫn là một thách thức lớn."',
        correctAnswer: 'In some rural areas, internet connectivity remains a significant challenge.',
        modelAnswer: 'In some rural areas, internet connectivity remains a significant challenge.',
        fallbackKeywords: ['internet connectivity', 'rural areas', 'remains', 'significant challenge'],
        explanationVi: "'Internet connectivity' = khả năng kết nối Internet. 'Remains' thay cho 'is still' — lịch sự và học thuật hơn. 'Significant challenge' = thách thức đáng kể."
      }
    ]
  },
  {
    week: 1, block: 'advantages_disadvantages', orderIndex: 2,
    topicName: 'Mobile Devices and Communication', topicEmoji: '📱',
    essayType: 'advantages_disadvantages',
    prompt: 'The widespread use of smartphones and tablets has changed the way people communicate. Do the advantages of this development outweigh the disadvantages?',
    hintAdvantages: ['instant communication', 'supports remote work', 'access to information'],
    hintDisadvantages: ['addiction', 'reduced face-to-face interaction', 'health issues'],
    vocabularyList: [
      { term: 'widespread', definitionVi: 'phổ biến rộng rãi', example: 'The widespread use of technology has changed our lives.' },
      { term: 'digital addiction', definitionVi: 'nghiện công nghệ số', example: 'Digital addiction is a growing problem among teenagers.' },
      { term: 'face-to-face interaction', definitionVi: 'giao tiếp trực tiếp', example: 'Face-to-face interaction is important for building relationships.' },
      { term: 'interpersonal relationship', definitionVi: 'mối quan hệ giữa người với người', example: 'Overuse of smartphones can damage interpersonal relationships.' },
      { term: 'screen time', definitionVi: 'thời gian sử dụng màn hình', example: 'Excessive screen time can harm children\'s mental health.' },
      { term: 'instant communication', definitionVi: 'giao tiếp tức thì', example: 'Smartphones enable instant communication across the globe.' },
      { term: 'proliferation', definitionVi: 'sự phổ biến rộng rãi', example: 'The proliferation of mobile devices has transformed daily life.' },
      { term: 'overdependence', definitionVi: 'sự phụ thuộc quá mức', example: 'Overdependence on technology can reduce critical thinking skills.' },
      { term: 'mental well-being', definitionVi: 'sức khỏe tâm thần', example: 'Excessive screen time can harm the mental well-being of children.' },
      { term: 'mobile device', definitionVi: 'thiết bị di động', example: 'Mobile devices have become indispensable tools in modern life.' },
      { term: 'communication pattern', definitionVi: 'mẫu giao tiếp', example: 'Smartphones have fundamentally altered communication patterns.' },
      { term: 'social media platform', definitionVi: 'nền tảng mạng xã hội', example: 'Social media platforms allow users to connect worldwide.' },
      { term: 'human interaction', definitionVi: 'sự tương tác giữa con người', example: 'Excessive phone use can diminish quality human interaction.' },
      { term: 'connectivity', definitionVi: 'khả năng kết nối', example: 'Smartphones provide unparalleled connectivity to the internet.' },
      { term: 'distraction', definitionVi: 'sự phân tâm', example: 'Smartphones are a major source of distraction in classrooms.' }
    ],
    questions: [
      {
        questionId: 'w1t2_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đọc đề bài: "Do the advantages of this development outweigh the disadvantages?" — Đây là dạng essay nào và yêu cầu gì?',
        options: [
          'Bạn chỉ nêu ưu điểm',
          'Bạn đưa ra ý kiến xem ưu điểm hay nhược điểm nhiều hơn',
          'Bạn thảo luận cả hai quan điểm của người khác',
          'Bạn nêu nguyên nhân và giải pháp'
        ],
        correctAnswer: 'Bạn đưa ra ý kiến xem ưu điểm hay nhược điểm nhiều hơn',
        explanationVi: "Câu hỏi 'Do the advantages outweigh?' yêu cầu bạn so sánh hai mặt và đưa ra ý kiến rõ ràng về bên nào nổi trội hơn. Đây là biến thể của Advantages & Disadvantages essay có kèm lập trường cá nhân."
      },
      {
        questionId: 'w1t2_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"The _____ use of smartphones has transformed the way people communicate with each other."',
        correctAnswer: 'widespread',
        explanationVi: "'Widespread' = phổ biến rộng rãi. Cụm 'the widespread use of + N' là collocation học thuật quan trọng trong IELTS. Lấy trực tiếp từ đề bài — hãy học thuộc."
      },
      {
        questionId: 'w1t2_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhờ có Internet, con người có thể giao tiếp tức thời dù ở bất kỳ đâu trên thế giới."',
        correctAnswer: 'Thanks to the Internet, people can communicate instantly no matter where they are in the world.',
        modelAnswer: 'Thanks to the Internet, people can communicate instantly no matter where they are in the world.',
        fallbackKeywords: ['internet', 'communicate', 'instantly', 'world'],
        explanationVi: "'Thanks to + N' = nhờ có. 'No matter where' = dù ở bất kỳ đâu. 'Instantly' = tức thì — adverb quan trọng để mô tả giao tiếp qua smartphone."
      },
      {
        questionId: 'w1t2_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc sử dụng điện thoại quá mức có thể dẫn đến nghiện công nghệ số."',
        correctAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        modelAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        fallbackKeywords: ['excessive', 'smartphones', 'digital addiction'],
        explanationVi: "'Excessive use of' = việc sử dụng quá mức. 'Lead to + N' = dẫn đến. 'Digital addiction' là thuật ngữ học thuật phù hợp hơn 'phone addiction'."
      },
      {
        questionId: 'w1t2_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc lạm dụng điện thoại có thể ảnh hưởng tiêu cực đến các mối quan hệ giữa người với người."',
        correctAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        modelAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        fallbackKeywords: ['overuse', 'smartphones', 'interpersonal relationships'],
        explanationVi: "'Overuse' = lạm dụng (danh từ/động từ). 'Negatively affect' = ảnh hưởng tiêu cực đến. 'Interpersonal relationships' = mối quan hệ giữa người với người — cụm từ học thuật quan trọng."
      },
      {
        questionId: 'w1t2_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Thời gian sử dụng màn hình quá nhiều có thể gây hại cho sức khỏe tâm thần của trẻ em."',
        correctAnswer: 'Excessive screen time can harm the mental well-being of children.',
        modelAnswer: 'Excessive screen time can harm the mental well-being of children.',
        fallbackKeywords: ['screen time', 'mental well-being', 'children', 'harm'],
        explanationVi: "'Screen time' = thời gian dùng màn hình. 'Mental well-being' = sức khỏe tâm thần (academic hơn 'mental health'). 'Harm' = gây hại (verb mạnh hơn 'affect negatively')."
      },
      {
        questionId: 'w1t2_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[smartphones / Whilst / have / many advantages, / they / also / have / serious drawbacks]',
        correctAnswer: 'Whilst smartphones have many advantages, they also have serious drawbacks.',
        modelAnswer: 'Whilst smartphones have many advantages, they also have serious drawbacks.',
        fallbackKeywords: ['smartphones', 'advantages', 'drawbacks'],
        explanationVi: "'Whilst' = trong khi (formal hơn 'while'). 'Drawbacks' = nhược điểm (academic hơn 'disadvantages'). Cấu trúc 'Whilst X, Y' dùng để thể hiện sự tương phản."
      },
      {
        questionId: 'w1t2_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi ngữ pháp. Hãy sửa lại:\n\n"Mobile technology makes people to communicate faster than before."',
        correctAnswer: 'Mobile technology makes people communicate faster than before.',
        modelAnswer: 'Mobile technology makes people communicate faster than before.',
        fallbackKeywords: ['mobile technology', 'communicate', 'faster'],
        explanationVi: "Lỗi: Sau 'make + object' dùng bare infinitive (động từ nguyên thể không 'to'). Cấu trúc: 'make + O + V (bare)'. Không dùng 'to' sau 'make' theo nghĩa causative."
      },
      {
        questionId: 'w1t2_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Con người ngày càng phụ thuộc quá mức vào công nghệ trong cuộc sống hàng ngày."',
        correctAnswer: 'People are increasingly showing overdependence on technology in their daily lives.',
        modelAnswer: 'People are increasingly showing overdependence on technology in their daily lives.',
        fallbackKeywords: ['overdependence', 'technology', 'daily lives', 'increasingly'],
        explanationVi: "'Overdependence on + N' = sự phụ thuộc quá mức vào. 'Increasingly' = ngày càng (adverb nhấn mạnh xu hướng). Dùng Present Continuous nhấn mạnh xu hướng đang diễn ra."
      },
      {
        questionId: 'w1t2_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Paraphrase câu sau:\n\n"The widespread use of smartphones and tablets has changed the way people communicate."',
        correctAnswer: 'The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.',
        modelAnswer: 'The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.',
        fallbackKeywords: ['proliferation', 'mobile devices', 'transformed', 'communication', 'patterns'],
        explanationVi: "'Proliferation' = sự phổ biến rộng rãi (thay 'widespread use'). 'Fundamentally transformed' = thay đổi căn bản (mạnh hơn 'changed'). 'Communication patterns' = mẫu giao tiếp."
      },
      {
        questionId: 'w1t2_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) lập luận rằng ưu điểm của smartphone VƯỢT TRỘI hơn nhược điểm.\n\nGợi ý: instant communication / remote work / access to information',
        modelAnswer: 'On balance, the advantages of smartphones significantly outweigh their disadvantages. The most compelling benefit is that these devices enable instant communication across vast distances, allowing people to maintain relationships and collaborate professionally regardless of location. Furthermore, smartphones provide unprecedented access to information, education, and services, empowering individuals in both developed and developing nations. While concerns about addiction and reduced face-to-face interaction are valid, these can be managed through responsible usage habits. Overall, the transformative impact of smartphones on connectivity and productivity makes them an overwhelmingly positive development.',
        fallbackKeywords: ['advantages', 'outweigh', 'communication', 'access', 'information', 'connectivity', 'productivity'],
        explanationVi: "Dạng 'outweigh' essay cần nêu lập trường ngay ở topic sentence, sau đó trình bày lý do ủng hộ. Có thể nhắc nhược điểm nhưng phải phủ nhận hoặc giảm nhẹ chúng."
      },
      {
        questionId: 'w1t2_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "widespread use"):\n\n"Việc sử dụng rộng rãi điện thoại thông minh đã thay đổi cách con người giao tiếp."',
        correctAnswer: 'The widespread use of smartphones has changed the way people communicate.',
        modelAnswer: 'The widespread use of smartphones has changed the way people communicate.',
        fallbackKeywords: ['widespread use', 'smartphones', 'communicate', 'the way'],
        explanationVi: "'The widespread use of + N' = việc sử dụng rộng rãi của. Đây là cụm danh từ học thuật thường gặp trong mở bài IELTS."
      },
      {
        questionId: 'w1t2_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "digital devices"):\n\n"Nhiều người dành quá nhiều thời gian cho thiết bị kỹ thuật số như điện thoại và máy tính bảng."',
        correctAnswer: 'Many people spend too much time on digital devices such as smartphones and tablets.',
        modelAnswer: 'Many people spend too much time on digital devices such as smartphones and tablets.',
        fallbackKeywords: ['digital devices', 'smartphones', 'tablets', 'too much time'],
        explanationVi: "'Digital devices' = thiết bị kỹ thuật số. 'Spend time on + N' = dành thời gian cho cái gì. 'Such as' = ví dụ như — liệt kê ví dụ cụ thể."
      },
      {
        questionId: 'w1t2_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "mobile technology"):\n\n"Công nghệ di động đã giúp việc liên lạc trở nên nhanh chóng và thuận tiện hơn."',
        correctAnswer: 'Mobile technology has made communication faster and more convenient.',
        modelAnswer: 'Mobile technology has made communication faster and more convenient.',
        fallbackKeywords: ['mobile technology', 'communication', 'faster', 'convenient'],
        explanationVi: "'Make + O + adjective' = làm cho cái gì trở nên như thế nào. 'Faster and more convenient' = so sánh hơn kết hợp hai tính từ cùng lúc."
      },
      {
        questionId: 'w1t2_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "social networking sites"):\n\n"Các trang mạng xã hội như Facebook hay Instagram kết nối hàng triệu người mỗi ngày."',
        correctAnswer: 'Social networking sites such as Facebook and Instagram connect millions of people every day.',
        modelAnswer: 'Social networking sites such as Facebook and Instagram connect millions of people every day.',
        fallbackKeywords: ['social networking sites', 'Facebook', 'Instagram', 'connect', 'millions'],
        explanationVi: "'Social networking sites' = trang mạng xã hội. 'Millions of people' = hàng triệu người — không dùng 'millions people'. 'Every day' ở cuối câu."
      },
      {
        questionId: 'w1t2_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "virtual interaction"):\n\n"Nhiều người trẻ ngày nay thích tương tác ảo hơn là gặp gỡ ngoài đời thật."',
        correctAnswer: 'Many young people today prefer virtual interaction to meeting in real life.',
        modelAnswer: 'Many young people today prefer virtual interaction to meeting in real life.',
        fallbackKeywords: ['virtual interaction', 'young people', 'prefer', 'real life'],
        explanationVi: "'Prefer A to B' = thích A hơn B — không dùng 'prefer A than B'. 'Meeting in real life' dùng gerund làm tân ngữ sau giới từ 'to'."
      },
      {
        questionId: 'w1t2_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "face-to-face communication"):\n\n"Tuy nhiên, giao tiếp trực tiếp vẫn quan trọng trong việc xây dựng mối quan hệ sâu sắc."',
        correctAnswer: 'However, face-to-face communication remains important for building deeper relationships.',
        modelAnswer: 'However, face-to-face communication remains important for building deeper relationships.',
        fallbackKeywords: ['face-to-face communication', 'remains', 'important', 'relationships'],
        explanationVi: "'Remains important' = vẫn còn quan trọng — 'remain' + adjective. 'For building' = mục đích, dùng gerund sau giới từ 'for'."
      },
      {
        questionId: 'w1t2_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "digital addiction"):\n\n"Việc sử dụng điện thoại quá mức có thể dẫn đến nghiện công nghệ."',
        correctAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        modelAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        fallbackKeywords: ['digital addiction', 'excessive use', 'smartphones', 'lead to'],
        explanationVi: "'Excessive use of' = việc sử dụng quá mức (học thuật hơn 'too much use'). 'Lead to + N' = dẫn đến — không được dùng 'lead to + V-ing' cho danh từ."
      },
      {
        questionId: 'w1t2_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "attention span"):\n\n"Việc sử dụng điện thoại thường xuyên có thể làm giảm khả năng tập trung."',
        correctAnswer: "Frequent use of smartphones can reduce one's attention span.",
        modelAnswer: "Frequent use of smartphones can reduce one's attention span.",
        fallbackKeywords: ['attention span', 'frequent use', 'smartphones', 'reduce'],
        explanationVi: "'Attention span' = khoảng thời gian tập trung. \"One's\" = của ai đó (đại từ sở hữu trung lập). 'Frequent use of' = việc sử dụng thường xuyên."
      },
      {
        questionId: 'w1t2_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "interpersonal relationships"):\n\n"Việc lạm dụng điện thoại có thể ảnh hưởng tiêu cực đến các mối quan hệ giữa người với người."',
        correctAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        modelAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        fallbackKeywords: ['interpersonal relationships', 'overuse', 'smartphones', 'negatively affect'],
        explanationVi: "'Overuse of + N' = việc lạm dụng (tiền tố over- = quá mức). 'Negatively affect' = ảnh hưởng tiêu cực — adverb đặt trước động từ chính."
      },
      {
        questionId: 'w1t2_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "emotional connection"):\n\n"Giao tiếp qua màn hình thường thiếu đi sự kết nối cảm xúc thật sự."',
        correctAnswer: 'Communication through screens often lacks a genuine emotional connection.',
        modelAnswer: 'Communication through screens often lacks a genuine emotional connection.',
        fallbackKeywords: ['emotional connection', 'screens', 'lacks', 'genuine'],
        explanationVi: "'Lacks + N' = thiếu cái gì (động từ, không phải 'lack of'). 'Genuine' = thật sự, chân thật — từ học thuật thể hiện mức độ sâu sắc của kết nối."
      }
    ]
  },
  {
    week: 2, block: 'advantages_disadvantages', orderIndex: 3,
    topicName: 'Influence of Social Media', topicEmoji: '📲',
    essayType: 'advantages_disadvantages',
    prompt: 'Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?',
    hintAdvantages: ['fast updates', 'diverse sources', 'interactive'],
    hintDisadvantages: ['fake news', 'bias', 'lack of verification'],
    vocabularyList: [
      { term: 'misinformation', definitionVi: 'thông tin sai lệch', example: 'Misinformation spread rapidly on social media during the pandemic.' },
      { term: 'credibility', definitionVi: 'độ tin cậy', example: 'The credibility of online news sources is often questioned.' },
      { term: 'fake news', definitionVi: 'tin giả', example: 'Many people are easily deceived by fake news spreading on the internet.' },
      { term: 'fact-checking', definitionVi: 'kiểm chứng thông tin', example: 'Fact-checking is very important before sharing any post online.' },
      { term: 'echo chamber', definitionVi: 'buồng vọng / hiệu ứng buồng vọng', example: 'The echo chamber effect causes users to only see opinions similar to their own.' },
      { term: 'breaking news', definitionVi: 'tin tức nóng hổi', example: 'Many people now read breaking news on social media instead of watching TV.' },
      { term: 'public opinion', definitionVi: 'dư luận xã hội', example: 'Social media can be used to manipulate public opinion.' },
      { term: 'democratization of information', definitionVi: 'dân chủ hóa thông tin', example: 'Social media contributes to the democratization of information.' },
      { term: 'algorithm', definitionVi: 'thuật toán', example: 'Social media algorithms decide which news users see most often.' },
      { term: 'media literacy', definitionVi: 'hiểu biết về truyền thông', example: 'Media literacy helps people identify fake news.' },
      { term: 'primary channel', definitionVi: 'kênh chính', example: 'Social media has become a primary channel for news distribution.' },
      { term: 'manipulation', definitionVi: 'sự thao túng', example: 'The manipulation of public opinion through fake news is a serious problem.' },
      { term: 'viral content', definitionVi: 'nội dung lan truyền nhanh', example: 'Viral content is not always accurate or verified.' },
      { term: 'current events', definitionVi: 'sự kiện thời sự', example: 'Social media keeps people informed about current events in real time.' },
      { term: 'filter bubble', definitionVi: 'bong bóng thông tin', example: 'Filter bubbles limit exposure to diverse viewpoints.' }
    ],
    questions: [
      {
        questionId: 'w2t3_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Từ khóa nào trong đề bài xác định đây là dạng Advantages & Disadvantages?\n\n"Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?"',
        options: [
          'social media platforms',
          'major source of news',
          'advantages and disadvantages',
          'relying on social media'
        ],
        correctAnswer: 'advantages and disadvantages',
        explanationVi: "Keyword 'advantages and disadvantages' trực tiếp xác định dạng bài. Đây là dấu hiệu rõ ràng nhất — khi thấy cụm này, lập tức biết cần phân tích cả hai mặt cân bằng."
      },
      {
        questionId: 'w2t3_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều người dễ bị lừa bởi tin giả đang lan truyền trên Internet."',
        correctAnswer: 'Many people are easily deceived by fake news spreading on the Internet.',
        modelAnswer: 'Many people are easily deceived by fake news spreading on the Internet.',
        fallbackKeywords: ['fake news', 'deceived', 'internet', 'spreading'],
        explanationVi: "'Be deceived by' = bị lừa bởi (passive voice). 'Spreading on the Internet' là participle phrase mô tả fake news. Câu này thể hiện nhược điểm quan trọng của mạng xã hội."
      },
      {
        questionId: 'w2t3_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều người hiện nay thường đọc tin tức nóng trên Facebook hoặc Twitter thay vì xem TV."',
        correctAnswer: 'Many people now read breaking news on Facebook or Twitter instead of watching TV.',
        modelAnswer: 'Many people now read breaking news on Facebook or Twitter instead of watching TV.',
        fallbackKeywords: ['breaking news', 'facebook', 'twitter', 'television'],
        explanationVi: "'Breaking news' = tin tức nóng hổi. 'Instead of + V-ing' = thay vì làm gì. Đây là ưu điểm của mạng xã hội: cập nhật tin tức nhanh chóng."
      },
      {
        questionId: 'w2t3_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc kiểm chứng thông tin là rất quan trọng trước khi chia sẻ bất kỳ bài đăng nào trên mạng."',
        correctAnswer: 'Fact-checking is very important before sharing any post online.',
        modelAnswer: 'Fact-checking is very important before sharing any post online.',
        fallbackKeywords: ['fact-checking', 'important', 'sharing', 'online'],
        explanationVi: "'Fact-checking' = kiểm chứng thông tin (danh động từ làm chủ ngữ). 'Before + V-ing' = trước khi làm gì. Đây là giải pháp cho vấn đề tin giả."
      },
      {
        questionId: 'w2t3_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Hiệu ứng buồng vọng có thể khiến người dùng chỉ tiếp xúc với những quan điểm giống quan điểm của họ."',
        correctAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        modelAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        fallbackKeywords: ['echo chamber', 'users', 'opinions', 'mirror'],
        explanationVi: "'Cause + O + to + V' = khiến ai làm gì. 'Mirror their own' = phản chiếu quan điểm của chính họ. 'Echo chamber' là thuật ngữ học thuật về hiện tượng này."
      },
      {
        questionId: 'w2t3_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"Social media has become one of the most popular source of news today."',
        correctAnswer: 'Social media has become one of the most popular sources of news today.',
        modelAnswer: 'Social media has become one of the most popular sources of news today.',
        fallbackKeywords: ['social media', 'popular', 'sources', 'news'],
        explanationVi: "Lỗi: Sau 'one of the most + adj' phải dùng danh từ số NHIỀU. 'Source' → 'sources'. Cấu trúc: 'one of the + superlative + plural noun'."
      },
      {
        questionId: 'w2t3_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Sự thao túng dư luận qua tin giả đang trở thành một vấn đề nghiêm trọng."',
        correctAnswer: 'The manipulation of public opinion through fake news is becoming a serious problem.',
        modelAnswer: 'The manipulation of public opinion through fake news is becoming a serious problem.',
        fallbackKeywords: ['manipulation', 'public opinion', 'fake news', 'serious'],
        explanationVi: "'The manipulation of + N' = sự thao túng của. Present Continuous 'is becoming' nhấn mạnh xu hướng đang gia tăng. 'Public opinion' = dư luận xã hội."
      },
      {
        questionId: 'w2t3_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Mạng xã hội góp phần vào dân chủ hóa thông tin, giúp mọi người dễ dàng chia sẻ quan điểm của mình."',
        correctAnswer: 'Social media contributes to the democratization of information, enabling everyone to share their views easily.',
        modelAnswer: 'Social media contributes to the democratization of information, enabling everyone to share their views easily.',
        fallbackKeywords: ['democratization', 'information', 'share', 'views', 'easily'],
        explanationVi: "'Contribute to + N' = góp phần vào. 'The democratization of information' = dân chủ hóa thông tin. Participle phrase 'enabling...' bổ nghĩa thêm hệ quả tích cực."
      },
      {
        questionId: 'w2t3_q09', level: 'intermediate', orderIndex: 9,
        type: 'paraphrase',
        questionText: 'Paraphrase câu sau:\n\n"Social media platforms have become a major source of news and information."',
        correctAnswer: 'Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.',
        modelAnswer: 'Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.',
        fallbackKeywords: ['networking sites', 'primary channel', 'public', 'current events', 'knowledge'],
        explanationVi: "Thay 'social media platforms' → 'online networking sites', 'major source' → 'primary channel', 'news' → 'current events', 'information' → 'knowledge'. 'Have emerged as' = đã nổi lên thành."
      },
      {
        questionId: 'w2t3_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về MỘT NHƯỢC ĐIỂM của việc phụ thuộc vào mạng xã hội để đọc tin tức.\n\nGợi ý: misinformation / fake news / credibility / echo chamber',
        modelAnswer: 'One significant disadvantage of relying on social media for news is the widespread circulation of misinformation. Unlike traditional media outlets, social media platforms lack rigorous editorial standards, allowing unverified or deliberately false content to spread rapidly among millions of users. The echo chamber effect further exacerbates this problem, as algorithms prioritise content that aligns with users\' existing beliefs, reinforcing biases rather than exposing them to balanced reporting. Consequently, public opinion can be easily manipulated, undermining the credibility of journalism and eroding informed democratic debate.',
        fallbackKeywords: ['misinformation', 'social media', 'fake news', 'credibility', 'echo chamber', 'public opinion'],
        explanationVi: "Đoạn văn tốt cần: topic sentence rõ ràng → giải thích vì sao → hệ quả cụ thể → linking word kết nối. Tránh chỉ liệt kê mà không giải thích."
      },
      {
        questionId: 'w2t3_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "social media platforms"):\n\n"Ngày nay, các nền tảng mạng xã hội đã trở thành nguồn tin tức chính của nhiều người."',
        correctAnswer: 'Nowadays, social media platforms have become the primary source of news for many people.',
        modelAnswer: 'Nowadays, social media platforms have become the primary source of news for many people.',
        fallbackKeywords: ['social media platforms', 'primary source', 'news', 'many people'],
        explanationVi: "'Social media platforms' = nền tảng mạng xã hội. 'Have become' = Present Perfect nhấn mạnh sự thay đổi đến hiện tại. 'Primary source' = nguồn chính — formal hơn 'main source'."
      },
      {
        questionId: 'w2t3_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "news consumption"):\n\n"Việc tiếp nhận tin tức qua mạng xã hội đang ngày càng phổ biến."',
        correctAnswer: 'News consumption through social media is becoming increasingly common.',
        modelAnswer: 'News consumption through social media is becoming increasingly common.',
        fallbackKeywords: ['news consumption', 'social media', 'increasingly common'],
        explanationVi: "'News consumption' = việc tiêu thụ/đọc tin tức. 'Is becoming increasingly' = đang ngày càng trở nên (Present Continuous + adverb)."
      },
      {
        questionId: 'w2t3_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "reliable sources"):\n\n"Không phải tất cả thông tin trên mạng đều đến từ nguồn tin đáng tin cậy."',
        correctAnswer: 'Not all information online comes from reliable sources.',
        modelAnswer: 'Not all information online comes from reliable sources.',
        fallbackKeywords: ['reliable sources', 'not all', 'information online'],
        explanationVi: "'Reliable sources' = nguồn đáng tin cậy. 'Not all + N + V' = không phải tất cả đều... — cấu trúc phủ định từng phần quan trọng trong IELTS."
      },
      {
        questionId: 'w2t3_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "misinformation"):\n\n"Một trong những vấn đề lớn nhất của mạng xã hội là sự lan truyền của thông tin sai lệch."',
        correctAnswer: 'One of the biggest problems with social media is the spread of misinformation.',
        modelAnswer: 'One of the biggest problems with social media is the spread of misinformation.',
        fallbackKeywords: ['misinformation', 'social media', 'spread', 'biggest problems'],
        explanationVi: "'Misinformation' = thông tin sai lệch (không cố ý). 'One of the biggest problems with X' = một trong những vấn đề lớn nhất của X — cấu trúc diễn đạt nhược điểm."
      },
      {
        questionId: 'w2t3_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "media literacy"):\n\n"Học sinh cần được dạy kỹ năng hiểu biết truyền thông để phân biệt tin thật và tin giả."',
        correctAnswer: 'Students need to be taught media literacy skills to distinguish real news from fake news.',
        modelAnswer: 'Students need to be taught media literacy skills to distinguish real news from fake news.',
        fallbackKeywords: ['media literacy', 'students', 'distinguish', 'fake news'],
        explanationVi: "'Media literacy' = khả năng hiểu và đánh giá thông tin truyền thông. 'Need to be taught' = passive infinitive — nhấn mạnh hành động giảng dạy từ phía nhà trường."
      },
      {
        questionId: 'w2t3_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "citizen journalism"):\n\n"Nhiều người dân hiện nay tham gia vào báo chí công dân bằng cách đăng video hoặc bài viết về sự kiện."',
        correctAnswer: 'Many people now participate in citizen journalism by posting videos or articles about events.',
        modelAnswer: 'Many people now participate in citizen journalism by posting videos or articles about events.',
        fallbackKeywords: ['citizen journalism', 'participate', 'posting', 'videos', 'articles'],
        explanationVi: "'Citizen journalism' = báo chí công dân. 'By + V-ing' = bằng cách làm gì — cấu trúc diễn đạt phương tiện/phương cách."
      },
      {
        questionId: 'w2t3_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "information overload"):\n\n"Người dùng có thể bị choáng ngợp vì quá tải thông tin trên mạng xã hội."',
        correctAnswer: 'Users can be overwhelmed by information overload on social media.',
        modelAnswer: 'Users can be overwhelmed by information overload on social media.',
        fallbackKeywords: ['information overload', 'overwhelmed', 'users', 'social media'],
        explanationVi: "'Information overload' = quá tải thông tin (compound noun). 'Be overwhelmed by' = bị choáng ngợp bởi — passive voice nhấn mạnh trạng thái bị động của người dùng."
      },
      {
        questionId: 'w2t3_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "credibility of news"):\n\n"Độ tin cậy của các bài đăng thường thấp hơn độ tin cậy của tin tức từ các hãng truyền thông lớn."',
        correctAnswer: 'The credibility of social media posts is often lower than that of news from major media outlets.',
        modelAnswer: 'The credibility of social media posts is often lower than that of news from major media outlets.',
        fallbackKeywords: ['credibility', 'social media posts', 'media outlets', 'lower'],
        explanationVi: "'That of' thay thế cho danh từ đã đề cập trước đó (the credibility of). 'Media outlets' = hãng truyền thông — học thuật hơn 'media companies'."
      },
      {
        questionId: 'w2t3_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "algorithm-driven content"):\n\n"Các thuật toán điều hướng nội dung khiến người dùng chỉ thấy những gì họ muốn thấy."',
        correctAnswer: 'Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.',
        modelAnswer: 'Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.',
        fallbackKeywords: ['algorithm-driven content', 'users', 'limiting', 'diverse perspectives'],
        explanationVi: "'Algorithm-driven content' = nội dung được thuật toán điều hướng. Mệnh đề bổ nghĩa 'limiting their exposure...' = participle clause nêu hệ quả tiêu cực."
      },
      {
        questionId: 'w2t3_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "echo chamber effect"):\n\n"Hiệu ứng buồng vọng có thể khiến người dùng chỉ nghe những ý kiến giống mình."',
        correctAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        modelAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        fallbackKeywords: ['echo chamber effect', 'users', 'opinions', 'mirror'],
        explanationVi: "'Echo chamber effect' = hiệu ứng buồng vọng. 'Mirror their own' = phản chiếu quan điểm của họ — 'mirror' dùng làm động từ."
      }
    ]
  },

  // ─── BLOCK 2: Week 3-4 — Cause & Effect/Solution / Education ───
  {
    week: 3, block: 'cause_effect', orderIndex: 4,
    topicName: 'Online Learning and Student Motivation', topicEmoji: '📚',
    essayType: 'cause_effect',
    prompt: 'Many students find it difficult to stay motivated when studying online. What are the causes of this problem, and what effects does it have on students?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'motivation', definitionVi: 'động lực', example: 'Lack of motivation is one of the biggest challenges in online learning.' },
      { term: 'distraction', definitionVi: 'sự phân tâm', example: 'Social media is a major source of distraction for online students.' },
      { term: 'procrastination', definitionVi: 'sự trì hoãn', example: 'Without deadlines, students tend to procrastinate.' },
      { term: 'academic burnout', definitionVi: 'kiệt sức học tập', example: 'Students may suffer from academic burnout if they study too much without rest.' },
      { term: 'peer interaction', definitionVi: 'sự tương tác với bạn bè cùng trang lứa', example: 'The lack of peer interaction makes online studying less engaging.' },
      { term: 'digital fatigue', definitionVi: 'mệt mỏi vì màn hình số', example: 'Sitting in front of a screen for too long can lead to digital fatigue.' },
      { term: 'structured learning environment', definitionVi: 'môi trường học tập có cấu trúc', example: 'A structured learning environment helps students stay on task.' },
      { term: 'intrinsic motivation', definitionVi: 'động lực nội tại', example: 'Intrinsic motivation helps students maintain enthusiasm for learning.' },
      { term: 'academic performance', definitionVi: 'kết quả học tập', example: 'Low motivation directly impacts academic performance.' },
      { term: 'dropout rate', definitionVi: 'tỷ lệ bỏ học', example: 'Poor motivation contributes to higher dropout rates in online courses.' },
      { term: 'self-regulation', definitionVi: 'khả năng tự điều tiết', example: 'Online learning demands strong self-regulation from students.' },
      { term: 'isolation', definitionVi: 'sự cô lập', example: 'Social isolation is a common effect of prolonged online study.' },
      { term: 'engagement', definitionVi: 'sự gắn kết, tham gia tích cực', example: 'Low engagement in online classes leads to poor learning outcomes.' },
      { term: 'flexible learning', definitionVi: 'học tập linh hoạt', example: 'Flexible learning can also lead to a lack of routine.' },
      { term: 'long-term', definitionVi: 'dài hạn', example: 'Intrinsic motivation sustains learning over the long term.' }
    ],
    questions: [
      {
        questionId: 'w3t4_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài hỏi: "What are the causes of this problem, and what effects does it have?" — Cấu trúc bài luận gồm mấy phần?',
        options: [
          '1 phần (chỉ nguyên nhân)',
          '2 phần: một về nguyên nhân, một về hệ quả',
          '2 phần: quan điểm ủng hộ và phản đối',
          '3 phần: nguyên nhân, hệ quả, và giải pháp'
        ],
        correctAnswer: '2 phần: một về nguyên nhân, một về hệ quả',
        explanationVi: "Đề hỏi 'causes' AND 'effects' → bài cần 2 body paragraphs riêng biệt: BP1 về nguyên nhân, BP2 về hệ quả. Không có 'solutions' nên không cần phần giải pháp."
      },
      {
        questionId: 'w3t4_q02', level: 'beginner', orderIndex: 2,
        type: 'essay_type_recognition',
        questionText: 'Chọn từ đúng để hoàn chỉnh câu:\n\n"There are several _____ why students lack motivation when studying online."',
        options: ['effects', 'solutions', 'reasons', 'advantages'],
        correctAnswer: 'reasons',
        explanationVi: "'Reasons why + clause' = lý do tại sao. Trong Cause & Effect essay, 'reasons' và 'causes' được dùng thay thế nhau. Tránh nhầm với 'effects' (hệ quả)."
      },
      {
        questionId: 'w3t4_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Ở nhà, có quá nhiều yếu tố gây xao nhãng khi học trực tuyến."',
        correctAnswer: 'At home, there are too many distractions when studying online.',
        modelAnswer: 'At home, there are too many distractions when studying online.',
        fallbackKeywords: ['home', 'distractions', 'studying online'],
        explanationVi: "'Distraction' (danh từ đếm được) = yếu tố gây phân tâm. 'Too many + countable noun plural' = quá nhiều. Câu này nêu một nguyên nhân phổ biến trong bài Cause & Effect."
      },
      {
        questionId: 'w3t4_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Sự thiếu tương tác với bạn học khiến việc học trở nên kém hấp dẫn hơn."',
        correctAnswer: 'The lack of peer interaction makes studying less engaging.',
        modelAnswer: 'The lack of peer interaction makes studying less engaging.',
        fallbackKeywords: ['peer interaction', 'studying', 'engaging'],
        explanationVi: "'The lack of + N' = sự thiếu hụt của. 'Make + O + adj' = khiến cho. 'Engaging' = hấp dẫn, thu hút. Cấu trúc này diễn đạt nguyên nhân rất gọn gàng."
      },
      {
        questionId: 'w3t4_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học sinh có thể bị kiệt sức học tập nếu học quá nhiều mà không nghỉ ngơi đầy đủ."',
        correctAnswer: 'Students may suffer from academic burnout if they study too much without adequate rest.',
        modelAnswer: 'Students may suffer from academic burnout if they study too much without adequate rest.',
        fallbackKeywords: ['academic burnout', 'students', 'study', 'rest'],
        explanationVi: "'Suffer from + N' = chịu đựng, bị mắc phải. 'Academic burnout' = kiệt sức học tập. 'Adequate rest' = nghỉ ngơi đầy đủ (academic hơn 'enough rest')."
      },
      {
        questionId: 'w3t4_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Ngồi trước màn hình quá lâu có thể dẫn đến tình trạng mệt mỏi kỹ thuật số."',
        correctAnswer: 'Sitting in front of a screen for too long can lead to digital fatigue.',
        modelAnswer: 'Sitting in front of a screen for too long can lead to digital fatigue.',
        fallbackKeywords: ['screen', 'digital fatigue', 'lead to'],
        explanationVi: "Gerund 'Sitting in front of a screen' làm chủ ngữ. 'For too long' = trong thời gian quá lâu. 'Digital fatigue' = mệt mỏi kỹ thuật số — hệ quả quan trọng của học online."
      },
      {
        questionId: 'w3t4_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp các cụm từ sau thành câu hoàn chỉnh:\n[lack of peer interaction / As a result of / , / many students / feel isolated / and lose motivation]',
        correctAnswer: 'As a result of the lack of peer interaction, many students feel isolated and lose motivation.',
        modelAnswer: 'As a result of the lack of peer interaction, many students feel isolated and lose motivation.',
        fallbackKeywords: ['peer interaction', 'students', 'isolated', 'motivation'],
        explanationVi: "'As a result of + N' = do kết quả của (nêu nguyên nhân). Dấu phẩy sau mệnh đề trạng ngữ đứng đầu câu là bắt buộc. 'Feel isolated' = cảm thấy bị cô lập."
      },
      {
        questionId: 'w3t4_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"One of the main cause of low motivation is the absence of a structured learning environment."',
        correctAnswer: 'One of the main causes of low motivation is the absence of a structured learning environment.',
        modelAnswer: 'One of the main causes of low motivation is the absence of a structured learning environment.',
        fallbackKeywords: ['causes', 'motivation', 'structured', 'learning environment'],
        explanationVi: "Lỗi: 'one of the + superlative + plural noun' → 'cause' phải là 'causes'. Quy tắc: sau 'one of the' luôn dùng danh từ số nhiều."
      },
      {
        questionId: 'w3t4_q09', level: 'elementary', orderIndex: 9,
        type: 'topic_sentence',
        questionText: 'Chọn linking word phù hợp để điền vào chỗ trống:\n\n"Students are easily distracted at home. _____, their academic performance tends to decline."',
        options: ['However', 'In contrast', 'As a result', 'On the other hand'],
        correctAnswer: 'As a result',
        explanationVi: "'As a result' = do đó, kết quả là — linking word chỉ hệ quả. Câu sau là HỆ QUẢ của câu trước (dễ bị phân tâm → kết quả học tập giảm). 'However' chỉ sự tương phản, không phù hợp ở đây."
      },
      {
        questionId: 'w3t4_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Động lực nội tại giúp sinh viên duy trì hứng thú học tập trong thời gian dài."',
        correctAnswer: 'Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.',
        modelAnswer: 'Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.',
        fallbackKeywords: ['intrinsic motivation', 'students', 'enthusiasm', 'learning', 'long term'],
        explanationVi: "'Intrinsic motivation' = động lực nội tại (đến từ bên trong, không phải phần thưởng bên ngoài). 'Maintain enthusiasm for' = duy trì hứng thú với. 'Over the long term' = trong thời gian dài."
      },
      {
        questionId: 'w3t4_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 topic sentence hoàn chỉnh cho đoạn Body về CÁC HỆ QUẢ của việc thiếu động lực học online. Sau đó giải thích ngắn gọn (2-3 câu).',
        modelAnswer: 'As a result of this lack of motivation, students\' academic performance declines significantly, which can ultimately lead to higher dropout rates. When students fail to engage with course material, they fall behind in assignments and examinations, creating a cycle of underachievement. In severe cases, persistent demotivation causes students to abandon their studies entirely, wasting both personal time and educational resources.',
        fallbackKeywords: ['academic performance', 'declines', 'dropout', 'motivation', 'underachievement'],
        explanationVi: "Topic sentence của đoạn Effects phải bắt đầu bằng linking word chỉ hệ quả ('As a result', 'Consequently') và nêu rõ hệ quả chính."
      },
      {
        questionId: 'w3t4_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về CÁC NGUYÊN NHÂN khiến học sinh thiếu động lực khi học trực tuyến.',
        modelAnswer: 'There are several key reasons why students struggle to stay motivated in an online learning environment. Firstly, the absence of a structured classroom setting means that students must rely entirely on self-discipline, which many find challenging. Secondly, the lack of face-to-face peer interaction removes the social element of learning, making it feel isolating and tedious. Additionally, the constant presence of distractions at home, such as social media and household noise, further diminishes students\' concentration, ultimately leading to declining engagement with their coursework.',
        fallbackKeywords: ['structured', 'self-discipline', 'peer interaction', 'distractions', 'concentration', 'engagement'],
        explanationVi: "Đoạn Causes cần dùng listing words: 'Firstly', 'Secondly', 'Additionally'. Mỗi nguyên nhân cần một câu giải thích ngắn. Kết thúc bằng hệ quả tổng quát để chuyển tiếp."
      },
      {
        questionId: 'w3t4_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "self-discipline"):\n\n"Học trực tuyến đòi hỏi sinh viên phải có tính tự giác cao."',
        correctAnswer: 'Online learning demands that students possess a high level of self-discipline.',
        modelAnswer: 'Online learning demands that students possess a high level of self-discipline.',
        fallbackKeywords: ['self-discipline', 'online learning', 'demands', 'high level'],
        explanationVi: "'Demands that + S + V' (bare infinitive) = đòi hỏi rằng — cấu trúc subjunctive mood trang trọng. 'Possess' = có, sở hữu — formal hơn 'have'."
      },
      {
        questionId: 'w3t4_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "lack of motivation"):\n\n"Một trong những vấn đề lớn nhất là thiếu động lực học tập."',
        correctAnswer: 'One of the biggest problems is a lack of motivation to study.',
        modelAnswer: 'One of the biggest problems is a lack of motivation to study.',
        fallbackKeywords: ['lack of motivation', 'biggest problems', 'study'],
        explanationVi: "'A lack of + N' = sự thiếu hụt của (danh từ). 'Motivation to study' = động lực để học — 'to + V' là mệnh đề mục đích bổ nghĩa cho danh từ."
      },
      {
        questionId: 'w3t4_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "time management skills"):\n\n"Nhiều sinh viên gặp khó khăn trong việc quản lý thời gian hiệu quả."',
        correctAnswer: 'Many students struggle with managing their time effectively, lacking adequate time management skills.',
        modelAnswer: 'Many students struggle with managing their time effectively, lacking adequate time management skills.',
        fallbackKeywords: ['time management skills', 'students', 'struggle', 'effectively'],
        explanationVi: "'Struggle with + V-ing' = gặp khó khăn trong việc. Mệnh đề bổ sung 'lacking adequate time management skills' = participle clause giải thích nguyên nhân."
      },
      {
        questionId: 'w3t4_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "distraction"):\n\n"Ở nhà, có quá nhiều yếu tố gây xao nhãng khi học online."',
        correctAnswer: 'At home, there are too many sources of distraction when studying online.',
        modelAnswer: 'At home, there are too many sources of distraction when studying online.',
        fallbackKeywords: ['distraction', 'home', 'too many', 'studying online'],
        explanationVi: "'Sources of distraction' = các nguồn gây xao nhãng. 'When + V-ing' = khi đang làm gì — rút gọn mệnh đề thời gian khi chủ ngữ giống nhau."
      },
      {
        questionId: 'w3t4_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "procrastination"):\n\n"Sự trì hoãn là nguyên nhân phổ biến khiến sinh viên không hoàn thành bài tập đúng hạn."',
        correctAnswer: 'Procrastination is a common reason why students fail to complete assignments on time.',
        modelAnswer: 'Procrastination is a common reason why students fail to complete assignments on time.',
        fallbackKeywords: ['procrastination', 'students', 'assignments', 'on time'],
        explanationVi: "'Procrastination' = sự trì hoãn (noun). 'Fail to + V' = không làm được, không hoàn thành — mang sắc thái kết quả tiêu cực."
      },
      {
        questionId: 'w3t4_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic performance"):\n\n"Học sinh có xu hướng giảm kết quả học tập khi thiếu động lực."',
        correctAnswer: 'Students tend to experience a decline in academic performance when they lack motivation.',
        modelAnswer: 'Students tend to experience a decline in academic performance when they lack motivation.',
        fallbackKeywords: ['academic performance', 'decline', 'lack motivation', 'tend to'],
        explanationVi: "'Tend to + V' = có xu hướng làm gì. 'A decline in academic performance' = sự sụt giảm kết quả — dùng 'decline in + N' thay vì 'decrease of'."
      },
      {
        questionId: 'w3t4_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "intrinsic motivation"):\n\n"Động lực nội tại giúp sinh viên duy trì hứng thú học tập lâu dài."',
        correctAnswer: 'Intrinsic motivation helps students maintain long-term interest in learning.',
        modelAnswer: 'Intrinsic motivation helps students maintain long-term interest in learning.',
        fallbackKeywords: ['intrinsic motivation', 'students', 'long-term interest', 'maintain'],
        explanationVi: "'Intrinsic motivation' = động lực nội tại (xuất phát từ bên trong). 'Maintain long-term interest in + N' = duy trì hứng thú lâu dài — collocation quan trọng."
      },
      {
        questionId: 'w3t4_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "extrinsic motivation"):\n\n"Một số sinh viên chỉ học để được điểm cao, đó là động lực bên ngoài."',
        correctAnswer: 'Some students study only to achieve high grades, which is a form of extrinsic motivation.',
        modelAnswer: 'Some students study only to achieve high grades, which is a form of extrinsic motivation.',
        fallbackKeywords: ['extrinsic motivation', 'high grades', 'form of'],
        explanationVi: "'Extrinsic motivation' = động lực bên ngoài (điểm số, phần thưởng). 'A form of + N' = một dạng của — 'which is a form of' là mệnh đề quan hệ giải thích."
      },
      {
        questionId: 'w3t4_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "digital fatigue"):\n\n"Ngồi trước màn hình quá lâu có thể dẫn đến mệt mỏi kỹ thuật số."',
        correctAnswer: 'Spending too long in front of a screen can lead to digital fatigue.',
        modelAnswer: 'Spending too long in front of a screen can lead to digital fatigue.',
        fallbackKeywords: ['digital fatigue', 'screen', 'lead to', 'spending'],
        explanationVi: "'Digital fatigue' = mệt mỏi do sử dụng thiết bị số quá nhiều. 'Spending too long + doing' = dành quá nhiều thời gian — gerund làm chủ ngữ."
      },
      {
        questionId: 'w3t4_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "mental well-being"):\n\n"Áp lực học online trong thời gian dài ảnh hưởng đến sức khỏe tinh thần."',
        correctAnswer: "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        modelAnswer: "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        fallbackKeywords: ['mental well-being', 'online learning', 'pressure', 'affect'],
        explanationVi: "'Mental well-being' = sức khỏe tinh thần (học thuật hơn 'mental health'). 'Sustained pressure' = áp lực kéo dài — 'sustained' = liên tục, không giảm."
      }
    ]
  },
  {
    week: 3, block: 'cause_solution', orderIndex: 5,
    topicName: 'Academic Pressure on Teenagers', topicEmoji: '🏫',
    essayType: 'cause_solution',
    prompt: 'Students today face more academic pressure than ever before. What are the causes of this pressure, and what can be done to reduce it?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'academic pressure', definitionVi: 'áp lực học tập', example: 'Academic pressure can lead to anxiety and depression.' },
      { term: 'exam-oriented', definitionVi: 'định hướng thi cử', example: 'An exam-oriented system places too much emphasis on test scores.' },
      { term: 'counselling services', definitionVi: 'dịch vụ tư vấn tâm lý', example: 'Schools should provide counselling services for stressed students.' },
      { term: 'coping strategies', definitionVi: 'chiến lược đối phó', example: 'Students need to learn coping strategies to manage stress effectively.' },
      { term: 'mental health', definitionVi: 'sức khỏe tâm thần', example: 'Unrealistic expectations from parents can harm children\'s mental health.' },
      { term: 'competitive', definitionVi: 'cạnh tranh', example: 'The highly competitive job market puts enormous pressure on students.' },
      { term: 'test scores', definitionVi: 'điểm thi', example: 'Many parents judge their children\'s worth by their test scores.' },
      { term: 'homework loads', definitionVi: 'khối lượng bài tập về nhà', example: 'Reducing homework loads can significantly decrease student stress.' },
      { term: 'emotional support', definitionVi: 'hỗ trợ về mặt cảm xúc', example: 'Emotional support from teachers helps students cope with pressure.' },
      { term: 'unrealistic expectations', definitionVi: 'kỳ vọng phi thực tế', example: 'Unrealistic expectations from parents can negatively impact children.' },
      { term: 'curriculum reform', definitionVi: 'cải cách chương trình học', example: 'Curriculum reform is needed to reduce excessive academic demands.' },
      { term: 'parental pressure', definitionVi: 'áp lực từ cha mẹ', example: 'Parental pressure is one of the leading causes of student anxiety.' },
      { term: 'well-being', definitionVi: 'sức khỏe và hạnh phúc tổng thể', example: 'Schools should prioritise students\' well-being alongside academic results.' },
      { term: 'standardised testing', definitionVi: 'kiểm tra chuẩn hóa', example: 'Standardised testing increases pressure on both students and teachers.' },
      { term: 'extracurricular activities', definitionVi: 'hoạt động ngoại khóa', example: 'Extracurricular activities help students relieve academic stress.' }
    ],
    questions: [
      {
        questionId: 'w3t5_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What are the causes of this pressure, and what can be done to reduce it?" — Đây là dạng essay nào?',
        options: ['Cause & Effect', 'Effect & Solution', 'Cause & Solution', 'Discuss Both Views'],
        correctAnswer: 'Cause & Solution',
        explanationVi: "Keyword 'causes' kết hợp với 'what can be done' (giải pháp) xác định đây là dạng Cause & Solution. Không có 'effects' → không cần phân tích hệ quả."
      },
      {
        questionId: 'w3t5_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Firstly, _____ pressure from parents who expect their children to achieve top grades is a significant cause of student anxiety."',
        correctAnswer: 'parental',
        explanationVi: "'Parental pressure' = áp lực từ cha mẹ. Đây là collocation chuẩn. 'Parental' là adjective của 'parents'. Cụm này xuất hiện rất thường trong IELTS về giáo dục."
      },
      {
        questionId: 'w3t5_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Ngày nay, học sinh phải chịu áp lực học tập nhiều hơn bao giờ hết."',
        correctAnswer: 'Nowadays, students face more academic pressure than ever before.',
        modelAnswer: 'Nowadays, students face more academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'students', 'nowadays', 'ever before'],
        explanationVi: "'More + N + than ever before' = nhiều hơn bao giờ hết — cụm nhấn mạnh mức độ. 'Nowadays' đứng đầu câu làm trạng ngữ thời gian. Lấy trực tiếp từ đề bài."
      },
      {
        questionId: 'w3t5_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nền giáo dục hiện nay quá chú trọng đến điểm số và kết quả thi cử."',
        correctAnswer: 'The current exam-oriented education system places too much emphasis on grades and test scores.',
        modelAnswer: 'The current exam-oriented education system places too much emphasis on grades and test scores.',
        fallbackKeywords: ['exam-oriented', 'education', 'grades', 'test scores'],
        explanationVi: "'Exam-oriented' = định hướng thi cử (hyphenated adjective). 'Place emphasis on' = chú trọng đến. 'Test scores' = điểm thi — quan trọng hơn 'scores' đơn thuần."
      },
      {
        questionId: 'w3t5_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhà trường nên cung cấp dịch vụ tư vấn tâm lý cho những học sinh đang chịu căng thẳng."',
        correctAnswer: 'Schools should provide counselling services for students who are under stress.',
        modelAnswer: 'Schools should provide counselling services for students who are under stress.',
        fallbackKeywords: ['counselling services', 'schools', 'students', 'stress'],
        explanationVi: "'Counselling services' = dịch vụ tư vấn tâm lý. 'Under stress' = đang chịu căng thẳng (idiomatic). 'Should + V' dùng để đề xuất giải pháp trong Cause & Solution essay."
      },
      {
        questionId: 'w3t5_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học sinh cần được dạy các chiến lược đối phó để quản lý căng thẳng hiệu quả hơn."',
        correctAnswer: 'Students need to be taught coping strategies to manage stress more effectively.',
        modelAnswer: 'Students need to be taught coping strategies to manage stress more effectively.',
        fallbackKeywords: ['coping strategies', 'students', 'stress', 'effectively'],
        explanationVi: "'Need to be taught' = passive voice — học sinh là người được dạy. 'Coping strategies' = chiến lược đối phó. 'More effectively' = một cách hiệu quả hơn."
      },
      {
        questionId: 'w3t5_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[could / Schools / by providing / reduce pressure / emotional support / and reducing homework loads]',
        correctAnswer: 'Schools could reduce pressure by providing emotional support and reducing homework loads.',
        modelAnswer: 'Schools could reduce pressure by providing emotional support and reducing homework loads.',
        fallbackKeywords: ['schools', 'reduce pressure', 'emotional support', 'homework loads'],
        explanationVi: "Cấu trúc: 'Subject + could + V + by + V-ing' diễn đạt giải pháp và cách thực hiện. 'Homework loads' = khối lượng bài tập. 'Emotional support' = hỗ trợ cảm xúc."
      },
      {
        questionId: 'w3t5_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"One solution is that schools should to offer more mental health support."',
        correctAnswer: 'One solution is that schools should offer more mental health support.',
        modelAnswer: 'One solution is that schools should offer more mental health support.',
        fallbackKeywords: ['schools', 'mental health', 'support', 'solution'],
        explanationVi: "Lỗi: Sau modal verb 'should' KHÔNG dùng 'to'. Cấu trúc: 'should + bare infinitive'. Xóa 'to' trước 'offer'."
      },
      {
        questionId: 'w3t5_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Kỳ vọng phi thực tế từ cha mẹ có thể có tác động tiêu cực đến sức khỏe tâm thần của trẻ em."',
        correctAnswer: 'Unrealistic expectations from parents can have a negative impact on children\'s mental health.',
        modelAnswer: 'Unrealistic expectations from parents can have a negative impact on children\'s mental health.',
        fallbackKeywords: ['unrealistic expectations', 'parents', 'negative impact', 'mental health'],
        explanationVi: "'Have a negative impact on + N' = có tác động tiêu cực lên. Academic hơn 'affect negatively'. 'Unrealistic expectations' = kỳ vọng phi thực tế — collocation quan trọng."
      },
      {
        questionId: 'w3t5_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về CÁC NGUYÊN NHÂN gây ra áp lực học tập cho học sinh.\n\nGợi ý: exam-oriented system / parental pressure / competitive job market',
        modelAnswer: 'There are two primary causes of the growing academic pressure experienced by students today. The first is the exam-oriented education system, which prioritises test scores over holistic development, compelling students to spend excessive hours memorising content rather than developing practical skills. The second cause is parental pressure; many parents, driven by a desire for their children\'s success in an increasingly competitive job market, impose unrealistic expectations that generate considerable anxiety. Together, these factors create an environment in which students feel perpetually stressed and unable to meet the demands placed upon them.',
        fallbackKeywords: ['exam-oriented', 'parental pressure', 'competitive', 'unrealistic expectations', 'anxiety', 'test scores'],
        explanationVi: "Đoạn Causes dùng 'The first... The second...' hoặc 'Firstly... Secondly...' để liệt kê. Mỗi nguyên nhân cần giải thích cơ chế tại sao nó gây ra áp lực."
      },
      {
        questionId: 'w3t5_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic pressure"):\n\n"Ngày nay, học sinh phải chịu áp lực học tập lớn hơn bao giờ hết."',
        correctAnswer: 'Today, students face greater academic pressure than ever before.',
        modelAnswer: 'Today, students face greater academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'students', 'greater than ever'],
        explanationVi: "'Than ever before' = hơn bao giờ hết — nhấn mạnh mức độ so sánh. 'Face + N' = phải đối mặt với, phải chịu đựng."
      },
      {
        questionId: 'w3t5_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "parental pressure" + "high expectations"):\n\n"Cha mẹ thường đặt ra kỳ vọng cao đối với kết quả học tập của con cái."',
        correctAnswer: "Parents often place high expectations on their children's academic results, creating significant parental pressure.",
        modelAnswer: "Parents often place high expectations on their children's academic results, creating significant parental pressure.",
        fallbackKeywords: ['parental pressure', 'high expectations', 'academic results', 'children'],
        explanationVi: "'Place high expectations on' = đặt kỳ vọng cao vào (collocation: place/put expectations on). Participle clause 'creating...' = hậu quả trực tiếp."
      },
      {
        questionId: 'w3t5_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "exam-oriented education"):\n\n"Nền giáo dục hiện nay quá chú trọng đến điểm số và kỳ thi."',
        correctAnswer: 'Modern education places excessive emphasis on grades and exams, reflecting an exam-oriented education system.',
        modelAnswer: 'Modern education places excessive emphasis on grades and exams, reflecting an exam-oriented education system.',
        fallbackKeywords: ['exam-oriented education', 'grades', 'excessive emphasis'],
        explanationVi: "'Exam-oriented' = định hướng theo kỳ thi (compound adjective). 'Place excessive emphasis on' = quá chú trọng đến — collocation học thuật."
      },
      {
        questionId: 'w3t5_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "performance anxiety"):\n\n"Lo lắng về thành tích khiến nhiều học sinh không thể tập trung học."',
        correctAnswer: 'Performance anxiety prevents many students from focusing on their studies.',
        modelAnswer: 'Performance anxiety prevents many students from focusing on their studies.',
        fallbackKeywords: ['performance anxiety', 'students', 'focusing', 'studies'],
        explanationVi: "'Performance anxiety' = lo lắng về thành tích. 'Prevent + O + from + V-ing' = ngăn cản ai làm gì — cấu trúc quan trọng trong IELTS."
      },
      {
        questionId: 'w3t5_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "perfectionism"):\n\n"Chủ nghĩa cầu toàn khiến học sinh sợ mắc lỗi trong học tập."',
        correctAnswer: 'Perfectionism causes students to fear making mistakes in their academic work.',
        modelAnswer: 'Perfectionism causes students to fear making mistakes in their academic work.',
        fallbackKeywords: ['perfectionism', 'students', 'fear', 'mistakes'],
        explanationVi: "'Perfectionism' = chủ nghĩa cầu toàn. 'Cause + O + to V' = khiến ai làm gì. 'Fear + V-ing' = sợ việc làm gì (gerund sau 'fear')."
      },
      {
        questionId: 'w3t5_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "fear of failure"):\n\n"Nỗi sợ thất bại có thể khiến học sinh mất tự tin."',
        correctAnswer: 'A fear of failure can cause students to lose self-confidence.',
        modelAnswer: 'A fear of failure can cause students to lose self-confidence.',
        fallbackKeywords: ['fear of failure', 'students', 'self-confidence', 'lose'],
        explanationVi: "'A fear of failure' = nỗi sợ thất bại (danh từ + of + danh từ). 'Cause + O + to V' = khiến ai làm gì. 'Lose self-confidence' = mất tự tin."
      },
      {
        questionId: 'w3t5_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "self-esteem"):\n\n"Áp lực học tập ảnh hưởng tiêu cực đến lòng tự trọng của học sinh."',
        correctAnswer: "Academic pressure negatively affects students' self-esteem.",
        modelAnswer: "Academic pressure negatively affects students' self-esteem.",
        fallbackKeywords: ['self-esteem', 'academic pressure', 'negatively affects'],
        explanationVi: "'Self-esteem' = lòng tự trọng/tự tin. 'Negatively affects' = ảnh hưởng tiêu cực — adverb đặt trước động từ. Không nhầm với 'self-confidence' (tự tin)."
      },
      {
        questionId: 'w3t5_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic workload"):\n\n"Thiếu ngủ là hậu quả phổ biến của khối lượng học tập lớn."',
        correctAnswer: 'Sleep deprivation is a common consequence of a heavy academic workload.',
        modelAnswer: 'Sleep deprivation is a common consequence of a heavy academic workload.',
        fallbackKeywords: ['academic workload', 'sleep deprivation', 'consequence'],
        explanationVi: "'Sleep deprivation' = thiếu ngủ (formal, học thuật). 'A common consequence of' = hậu quả phổ biến của — 'consequence of + N' là collocation chuẩn IELTS."
      },
      {
        questionId: 'w3t5_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "emotional support"):\n\n"Học sinh cần được hỗ trợ tinh thần từ cha mẹ và thầy cô."',
        correctAnswer: 'Students need emotional support from their parents and teachers.',
        modelAnswer: 'Students need emotional support from their parents and teachers.',
        fallbackKeywords: ['emotional support', 'students', 'parents', 'teachers'],
        explanationVi: "'Emotional support' = hỗ trợ về mặt tinh thần/cảm xúc. Câu đơn giản nhưng chính xác — 'need + N + from + N' không cần mệnh đề phức."
      },
      {
        questionId: 'w3t5_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "coping strategies"):\n\n"Chiến lược đối phó giúp học sinh kiểm soát căng thẳng hiệu quả hơn."',
        correctAnswer: 'Coping strategies help students manage stress more effectively.',
        modelAnswer: 'Coping strategies help students manage stress more effectively.',
        fallbackKeywords: ['coping strategies', 'students', 'manage stress', 'effectively'],
        explanationVi: "'Coping strategies' = chiến lược đối phó (với căng thẳng). 'Help + O + V (bare infinitive)' = giúp ai làm gì. 'More effectively' = so sánh hơn của adverb."
      }
    ]
  },
  {
    week: 4, block: 'effect_solution', orderIndex: 6,
    topicName: 'Decline in Reading Habits', topicEmoji: '📖',
    essayType: 'effect_solution',
    prompt: 'Young people are reading fewer books than in the past. What effects does this trend have on society, and what solutions can be implemented?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'critical thinking', definitionVi: 'tư duy phản biện', example: 'Reading books enhances critical thinking skills.' },
      { term: 'literacy rate', definitionVi: 'tỷ lệ biết đọc biết viết', example: 'Countries with high literacy rates have stronger economies.' },
      { term: 'cognitive skills', definitionVi: 'kỹ năng nhận thức', example: 'The decline in reading may result in a deterioration of cognitive skills.' },
      { term: 'broaden horizons', definitionVi: 'mở rộng tầm nhìn', example: 'Reading helps broaden horizons and nurture imagination.' },
      { term: 'vocabulary range', definitionVi: 'vốn từ vựng', example: 'Declining reading habits lead to a reduced vocabulary range.' },
      { term: 'promote reading', definitionVi: 'khuyến khích đọc sách', example: 'The government should organise campaigns to promote reading.' },
      { term: 'imagination', definitionVi: 'trí tưởng tượng', example: 'Books nurture children\'s imagination in ways that screens cannot.' },
      { term: 'deterioration', definitionVi: 'sự suy giảm, thoái hóa', example: 'A deterioration of reading habits weakens academic ability.' },
      { term: 'implement', definitionVi: 'thực hiện, áp dụng', example: 'The government plans to implement a national reading programme.' },
      { term: 'reading programme', definitionVi: 'chương trình đọc sách', example: 'A national reading programme could reverse declining literacy trends.' },
      { term: 'digital entertainment', definitionVi: 'giải trí số', example: 'Digital entertainment has largely replaced reading among young people.' },
      { term: 'nurture', definitionVi: 'nuôi dưỡng', example: 'Schools should nurture a love of reading from an early age.' },
      { term: 'concentration', definitionVi: 'khả năng tập trung', example: 'Regular reading improves concentration and attention span.' },
      { term: 'empathy', definitionVi: 'sự đồng cảm', example: 'Reading fiction develops empathy by exposing readers to different perspectives.' },
      { term: 'academic ability', definitionVi: 'năng lực học thuật', example: 'Poor reading habits directly undermine academic ability.' }
    ],
    questions: [
      {
        questionId: 'w4t6_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What effects does this trend have on society, and what solutions can be implemented?" — Đây là dạng essay nào?',
        options: ['Cause & Effect', 'Effect & Solution', 'Cause & Solution', 'Advantages & Disadvantages'],
        correctAnswer: 'Effect & Solution',
        explanationVi: "Đề hỏi 'effects' (hệ quả) và 'solutions' (giải pháp) — không hỏi 'causes'. Đây là dạng Effect & Solution. BP1 phân tích hệ quả; BP2 đề xuất giải pháp."
      },
      {
        questionId: 'w4t6_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc không đọc sách có thể làm giảm khả năng tư duy phản biện của học sinh."',
        correctAnswer: 'Not reading books may reduce students\' ability to think critically.',
        modelAnswer: 'Not reading books may reduce students\' ability to think critically.',
        fallbackKeywords: ['reading', 'students', 'critical thinking', 'reduce'],
        explanationVi: "'Ability to + V' = khả năng làm gì. 'Think critically' = tư duy phản biện (dùng adverb). 'May + V' biểu thị khả năng, phù hợp khi nêu hệ quả không chắc chắn."
      },
      {
        questionId: 'w4t6_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Chính phủ nên tổ chức các chiến dịch để khuyến khích đọc sách trong giới trẻ."',
        correctAnswer: 'The government should organise campaigns to promote reading among young people.',
        modelAnswer: 'The government should organise campaigns to promote reading among young people.',
        fallbackKeywords: ['government', 'campaigns', 'promote reading', 'young people'],
        explanationVi: "'Organise campaigns to + V' = tổ chức chiến dịch để làm gì. 'Promote reading' = khuyến khích đọc sách. 'Among young people' = trong giới trẻ. Đây là giải pháp cấp chính phủ."
      },
      {
        questionId: 'w4t6_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Đọc sách giúp mở rộng tầm nhìn và nuôi dưỡng trí tưởng tượng."',
        correctAnswer: 'Reading helps broaden horizons and nurture imagination.',
        modelAnswer: 'Reading helps broaden horizons and nurture imagination.',
        fallbackKeywords: ['reading', 'broaden horizons', 'imagination', 'nurture'],
        explanationVi: "'Broaden horizons' = mở rộng tầm nhìn (idiomatic expression). 'Nurture imagination' = nuôi dưỡng trí tưởng tượng. Cả hai là collocations quan trọng trong IELTS."
      },
      {
        questionId: 'w4t6_q05', level: 'elementary', orderIndex: 5,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"One of the effect of declining reading habits is a decrease in vocabulary range."',
        correctAnswer: 'One of the effects of declining reading habits is a decrease in vocabulary range.',
        modelAnswer: 'One of the effects of declining reading habits is a decrease in vocabulary range.',
        fallbackKeywords: ['effects', 'reading habits', 'vocabulary', 'decrease'],
        explanationVi: "Lỗi: 'one of the + plural noun' → 'effect' phải là 'effects'. Quy tắc: sau 'one of the' luôn dùng số nhiều."
      },
      {
        questionId: 'w4t6_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Sự suy giảm thói quen đọc sách có thể dẫn đến sự thoái hóa kỹ năng nhận thức ở người trẻ."',
        correctAnswer: 'The decline in reading habits may result in a deterioration of cognitive skills among young people.',
        modelAnswer: 'The decline in reading habits may result in a deterioration of cognitive skills among young people.',
        fallbackKeywords: ['decline', 'reading habits', 'cognitive skills', 'young people'],
        explanationVi: "'Result in + N' = dẫn đến (nhấn mạnh kết quả trực tiếp hơn 'lead to'). 'A deterioration of + N' = sự suy thoái của. 'Cognitive skills' = kỹ năng nhận thức — academic term quan trọng."
      },
      {
        questionId: 'w4t6_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về MỘT GIẢI PHÁP để cải thiện thói quen đọc sách trong giới trẻ.\n\nGợi ý: schools / reading programmes / libraries / curriculum',
        modelAnswer: 'One effective solution is for schools to integrate regular reading sessions into the curriculum, making it a compulsory part of the school day. If students are exposed to a wide variety of books from an early age, they are more likely to develop a genuine love of reading that persists into adulthood. Furthermore, schools could establish well-stocked libraries and reading clubs that create an engaging social atmosphere around books. Evidence from countries such as Finland suggests that embedding reading culture within formal education significantly improves both literacy rates and overall academic performance.',
        fallbackKeywords: ['schools', 'reading', 'curriculum', 'literacy', 'libraries', 'academic performance'],
        explanationVi: "Giải pháp tốt cần: nêu giải pháp cụ thể → giải thích cơ chế → dẫn chứng hoặc ví dụ → liên kết lại kết quả kỳ vọng."
      },
      {
        questionId: 'w4t6_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic pressure"):\n\n"Ngày nay, học sinh phải chịu áp lực học tập lớn hơn bao giờ hết."',
        correctAnswer: 'Students today face more academic pressure than ever before.',
        modelAnswer: 'Students today face more academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'today', 'more than ever'],
        explanationVi: "'More... than ever before' = nhiều hơn bao giờ hết. 'Students today' đặt 'today' sau danh từ — nhấn mạnh ngữ cảnh hiện tại."
      },
      {
        questionId: 'w4t6_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "parental expectations"):\n\n"Cha mẹ thường đặt kỳ vọng rất cao vào con cái."',
        correctAnswer: 'Parents often place extremely high parental expectations on their children.',
        modelAnswer: 'Parents often place extremely high parental expectations on their children.',
        fallbackKeywords: ['parental expectations', 'high', 'children', 'place'],
        explanationVi: "'Parental expectations' = kỳ vọng của cha mẹ. 'Place expectations on' = đặt kỳ vọng vào — 'place' học thuật hơn 'put'. 'Extremely high' = cực kỳ cao."
      },
      {
        questionId: 'w4t6_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "comparison among students"):\n\n"Việc so sánh giữa học sinh với nhau khiến nhiều em cảm thấy tự ti."',
        correctAnswer: 'Comparison among students makes many of them feel inferior.',
        modelAnswer: 'Comparison among students makes many of them feel inferior.',
        fallbackKeywords: ['comparison among students', 'inferior', 'feel', 'makes'],
        explanationVi: "'Comparison among students' = sự so sánh giữa các học sinh. 'Make + O + feel + adj' = khiến ai cảm thấy thế nào. 'Inferior' = tự ti, kém cỏi hơn."
      },
      {
        questionId: 'w4t6_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "heavy workload"):\n\n"Học sinh phải đối mặt với khối lượng bài tập khổng lồ mỗi ngày."',
        correctAnswer: 'Students are faced with a heavy workload of assignments every single day.',
        modelAnswer: 'Students are faced with a heavy workload of assignments every single day.',
        fallbackKeywords: ['heavy workload', 'students', 'assignments', 'every day'],
        explanationVi: "'Be faced with' = phải đối mặt với — passive idiom. 'Every single day' = mỗi ngày (nhấn mạnh hơn 'every day'). 'Heavy workload' = khối lượng công việc nặng nề."
      },
      {
        questionId: 'w4t6_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "stress and burnout"):\n\n"Áp lực học tập có thể gây ra căng thẳng và kiệt sức."',
        correctAnswer: 'Academic pressure can cause both stress and burnout in students.',
        modelAnswer: 'Academic pressure can cause both stress and burnout in students.',
        fallbackKeywords: ['stress', 'burnout', 'academic pressure', 'cause'],
        explanationVi: "'Both... and...' = cả... lẫn... — nhấn mạnh hai hệ quả cùng lúc. 'Burnout' = kiệt sức về tinh thần (do căng thẳng kéo dài)."
      },
      {
        questionId: 'w4t6_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "work–life balance"):\n\n"Một số học sinh mất cân bằng giữa học tập và nghỉ ngơi."',
        correctAnswer: 'Some students lose their work–life balance between studying and resting.',
        modelAnswer: 'Some students lose their work–life balance between studying and resting.',
        fallbackKeywords: ['work-life balance', 'studying', 'resting', 'lose'],
        explanationVi: "'Work–life balance' = cân bằng giữa công việc/học tập và cuộc sống. 'Between A and B' = giữa A và B — hai gerund song song."
      },
      {
        questionId: 'w4t6_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "supportive learning environment"):\n\n"Giáo viên nên tạo môi trường học tập thoải mái và hỗ trợ hơn."',
        correctAnswer: 'Teachers should create a more comfortable and supportive learning environment.',
        modelAnswer: 'Teachers should create a more comfortable and supportive learning environment.',
        fallbackKeywords: ['supportive learning environment', 'teachers', 'comfortable', 'create'],
        explanationVi: "'Supportive learning environment' = môi trường học tập hỗ trợ. 'Should create' = nên tạo ra — modal verb diễn đạt đề xuất. 'More comfortable and supportive' = so sánh hơn song song."
      },
      {
        questionId: 'w4t6_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "extracurricular activities" + "reduce stress"):\n\n"Việc tham gia hoạt động ngoại khóa có thể giúp giảm căng thẳng."',
        correctAnswer: 'Participating in extracurricular activities can help students reduce stress.',
        modelAnswer: 'Participating in extracurricular activities can help students reduce stress.',
        fallbackKeywords: ['extracurricular activities', 'reduce stress', 'participating'],
        explanationVi: "'Extracurricular activities' = hoạt động ngoại khóa. 'Participating in + N' = việc tham gia vào (gerund làm chủ ngữ). 'Help + O + V (bare infinitive)'."
      },
      {
        questionId: 'w4t6_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "realistic academic goals"):\n\n"Học sinh nên học cách đặt mục tiêu học tập hợp lý."',
        correctAnswer: 'Students should learn how to set realistic academic goals.',
        modelAnswer: 'Students should learn how to set realistic academic goals.',
        fallbackKeywords: ['realistic academic goals', 'students', 'set', 'learn how'],
        explanationVi: "'Realistic academic goals' = mục tiêu học tập thực tế/hợp lý. 'Learn how to + V' = học cách làm gì — cấu trúc diễn đạt kỹ năng cần rèn luyện."
      },
      {
        questionId: 'w4t6_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "grades are not the only measure of success"):\n\n"Xã hội cần thay đổi quan điểm rằng điểm số là thước đo duy nhất của thành công."',
        correctAnswer: 'Society needs to change the mindset that grades are the only measure of success.',
        modelAnswer: 'Society needs to change the mindset that grades are the only measure of success.',
        fallbackKeywords: ['grades', 'only measure of success', 'mindset', 'change'],
        explanationVi: "'Mindset' = quan điểm/tư duy (học thuật hơn 'thinking'). 'The only measure of success' = thước đo duy nhất của thành công — 'measure of' là collocation quan trọng."
      }
    ]
  },
  {
    week: 4, block: 'cause_effect', orderIndex: 7,
    topicName: 'Dropout Rates in Higher Education', topicEmoji: '🎓',
    essayType: 'cause_effect',
    prompt: 'The number of students dropping out of university is increasing in many countries. What are the causes of this problem, and what effects does it have on individuals and society?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'dropout rate', definitionVi: 'tỷ lệ bỏ học', example: 'The dropout rate has increased significantly in the past decade.' },
      { term: 'financial burden', definitionVi: 'gánh nặng tài chính', example: 'University fees are a heavy financial burden for many families.' },
      { term: 'tuition fees', definitionVi: 'học phí', example: 'High tuition fees prevent many students from continuing their studies.' },
      { term: 'unemployment', definitionVi: 'thất nghiệp', example: 'High dropout rates contribute to youth unemployment.' },
      { term: 'social stability', definitionVi: 'sự ổn định xã hội', example: 'High dropout rates can undermine long-term social stability.' },
      { term: 'career guidance', definitionVi: 'hướng nghiệp', example: 'Universities need to strengthen career guidance services.' },
      { term: 'social resources', definitionVi: 'nguồn lực xã hội', example: 'High dropout rates represent a waste of social resources.' },
      { term: 'mental health support', definitionVi: 'hỗ trợ sức khỏe tâm thần', example: 'Universities should provide better mental health support for struggling students.' },
      { term: 'academic pressure', definitionVi: 'áp lực học tập', example: 'Academic pressure is a leading cause of university dropout.' },
      { term: 'scholarship', definitionVi: 'học bổng', example: 'More scholarships could prevent financially disadvantaged students from dropping out.' },
      { term: 'income inequality', definitionVi: 'bất bình đẳng thu nhập', example: 'Income inequality means poorer students are more likely to drop out.' },
      { term: 'undermine', definitionVi: 'làm suy yếu, phá hoại', example: 'High dropout rates undermine investment in public education.' },
      { term: 'higher education', definitionVi: 'giáo dục đại học', example: 'Access to quality higher education remains unequal in many countries.' },
      { term: 'productivity', definitionVi: 'năng suất', example: 'Dropouts generally contribute less to national productivity.' },
      { term: 'vocational training', definitionVi: 'đào tạo nghề', example: 'Vocational training provides an alternative pathway for students who leave university.' }
    ],
    questions: [
      {
        questionId: 'w4t7_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What are the causes of this problem, and what effects does it have on individuals and society?" — Đây là dạng essay nào?',
        options: ['Cause & Solution', 'Cause & Effect', 'Effect & Solution', 'Opinion Essay'],
        correctAnswer: 'Cause & Effect',
        explanationVi: "Từ khóa 'causes' và 'effects' cùng xuất hiện → dạng Cause & Effect. Bài cần BP1 phân tích nguyên nhân, BP2 phân tích hệ quả với cá nhân VÀ xã hội."
      },
      {
        questionId: 'w4t7_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một trong những nguyên nhân chính là gánh nặng tài chính của giáo dục đại học."',
        correctAnswer: 'One of the main causes is the financial burden of higher education.',
        modelAnswer: 'One of the main causes is the financial burden of higher education.',
        fallbackKeywords: ['financial burden', 'causes', 'higher education'],
        explanationVi: "'One of the main causes is + N' — cấu trúc nêu nguyên nhân chuẩn trong IELTS. 'Financial burden' = gánh nặng tài chính — collocation quan trọng."
      },
      {
        questionId: 'w4t7_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Học phí cao ngăn cản nhiều sinh viên tiếp tục việc học."',
        correctAnswer: 'High tuition fees prevent many students from continuing their studies.',
        modelAnswer: 'High tuition fees prevent many students from continuing their studies.',
        fallbackKeywords: ['tuition fees', 'students', 'continuing', 'studies'],
        explanationVi: "'Prevent + O + from + V-ing' = ngăn cản ai làm gì. 'Tuition fees' = học phí. Cấu trúc này rất phổ biến trong IELTS Writing khi nêu trở ngại."
      },
      {
        questionId: 'w4t7_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Tỷ lệ bỏ học cao cũng đồng nghĩa với sự lãng phí đáng kể nguồn lực xã hội."',
        correctAnswer: 'A high dropout rate also represents a significant waste of social resources.',
        modelAnswer: 'A high dropout rate also represents a significant waste of social resources.',
        fallbackKeywords: ['dropout rate', 'waste', 'social resources'],
        explanationVi: "'Represent + N' = đại diện cho, đồng nghĩa với. 'A significant waste of' = sự lãng phí đáng kể của. Đây là hệ quả ở cấp độ xã hội."
      },
      {
        questionId: 'w4t7_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các trường đại học cần tăng cường dịch vụ hướng nghiệp cho sinh viên."',
        correctAnswer: 'Universities need to strengthen career guidance for students.',
        modelAnswer: 'Universities need to strengthen career guidance for students.',
        fallbackKeywords: ['universities', 'career guidance', 'students'],
        explanationVi: "'Strengthen + N' = tăng cường, củng cố. 'Career guidance' = hướng nghiệp — giải pháp phổ biến trong essay về dropout. Dùng 'need to + V' để đề xuất biện pháp cần thiết."
      },
      {
        questionId: 'w4t7_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"Dropping out of university can leads to unemployment and low income."',
        correctAnswer: 'Dropping out of university can lead to unemployment and low income.',
        modelAnswer: 'Dropping out of university can lead to unemployment and low income.',
        fallbackKeywords: ['dropping out', 'university', 'unemployment', 'income'],
        explanationVi: "Lỗi: Sau modal verb 'can' phải dùng bare infinitive. 'leads' → 'lead' (bỏ -s). Quy tắc: 'can/could/will/would/should + V (nguyên thể không to)'."
      },
      {
        questionId: 'w4t7_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nếu không được giải quyết kịp thời, tỷ lệ bỏ học cao có thể làm suy yếu sự ổn định xã hội."',
        correctAnswer: 'If not addressed promptly, high dropout rates could undermine social stability.',
        modelAnswer: 'If not addressed promptly, high dropout rates could undermine social stability.',
        fallbackKeywords: ['dropout rates', 'social stability', 'addressed', 'undermine'],
        explanationVi: "'If not addressed promptly' = nếu không được giải quyết kịp thời (passive conditional). 'Undermine' = làm suy yếu, phá hoại ngầm. 'Could' = khả năng trong tương lai."
      },
      {
        questionId: 'w4t7_q08', level: 'intermediate', orderIndex: 8,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) về HỆ QUẢ của tỷ lệ bỏ học cao đối với XÃ HỘI.\n\nGợi ý: unemployment / social resources / productivity / social stability',
        modelAnswer: 'The rising dropout rate has several damaging consequences for society as a whole. Firstly, graduates who abandon their studies are more likely to face long-term unemployment, placing additional pressure on government welfare systems. Furthermore, public investment in higher education is essentially wasted when students fail to complete their degrees, representing a misallocation of social resources. Over time, a less educated workforce reduces national productivity and hampers economic growth. If these trends are not reversed, high dropout rates could ultimately undermine social stability and widen existing income inequalities.',
        fallbackKeywords: ['unemployment', 'social resources', 'productivity', 'economic growth', 'social stability', 'dropout'],
        explanationVi: "Đoạn Effects về xã hội cần bao gồm hệ quả kinh tế, xã hội, và dài hạn. Dùng 'Firstly... Furthermore... Over time...' để tổ chức mạch lạc."
      },
      {
        questionId: 'w4t7_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "drop out of university"):\n\n"Ngày càng có nhiều sinh viên bỏ học đại học ở nhiều quốc gia."',
        correctAnswer: 'An increasing number of students are choosing to drop out of university across many countries.',
        modelAnswer: 'An increasing number of students are choosing to drop out of university across many countries.',
        fallbackKeywords: ['drop out of university', 'increasing number', 'countries'],
        explanationVi: "'An increasing number of + plural N' = ngày càng nhiều — trang trọng hơn 'more and more'. 'Across many countries' = ở nhiều quốc gia (across = khắp)."
      },
      {
        questionId: 'w4t7_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "university dropout rate"):\n\n"Tỉ lệ bỏ học đại học đang tăng nhanh trong thập kỷ qua."',
        correctAnswer: 'The university dropout rate has been rising rapidly over the past decade.',
        modelAnswer: 'The university dropout rate has been rising rapidly over the past decade.',
        fallbackKeywords: ['university dropout rate', 'rising rapidly', 'past decade'],
        explanationVi: "'Has been rising' = Present Perfect Continuous nhấn mạnh xu hướng liên tục. 'Over the past decade' = trong thập kỷ qua (decade = 10 năm)."
      },
      {
        questionId: 'w4t7_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "financial burden"):\n\n"Một trong những nguyên nhân chính là gánh nặng tài chính."',
        correctAnswer: 'One of the main causes is the financial burden placed on students and their families.',
        modelAnswer: 'One of the main causes is the financial burden placed on students and their families.',
        fallbackKeywords: ['financial burden', 'main causes', 'students'],
        explanationVi: "'Financial burden' = gánh nặng tài chính. 'Placed on + N' = participle clause bổ nghĩa cho 'burden', chỉ rõ đối tượng chịu gánh nặng."
      },
      {
        questionId: 'w4t7_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "tuition fees"):\n\n"Học phí cao khiến nhiều sinh viên không thể tiếp tục học."',
        correctAnswer: 'High tuition fees prevent many students from continuing their education.',
        modelAnswer: 'High tuition fees prevent many students from continuing their education.',
        fallbackKeywords: ['tuition fees', 'high', 'prevent', 'continuing', 'education'],
        explanationVi: "'Tuition fees' = học phí. 'Prevent + O + from + V-ing' = ngăn cản ai làm gì — cấu trúc IELTS Band 7+ quan trọng."
      },
      {
        questionId: 'w4t7_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "student loan debt"):\n\n"Nhiều sinh viên phải gánh nợ vay lớn sau khi tốt nghiệp."',
        correctAnswer: 'Many students are burdened with significant student loan debt after graduating.',
        modelAnswer: 'Many students are burdened with significant student loan debt after graduating.',
        fallbackKeywords: ['student loan debt', 'burdened', 'significant', 'graduating'],
        explanationVi: "'Be burdened with' = bị gánh nặng bởi — passive idiom học thuật. 'After graduating' = rút gọn mệnh đề thời gian khi chủ ngữ giống nhau."
      },
      {
        questionId: 'w4t7_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic failure"):\n\n"Một số sinh viên bỏ học vì thất bại trong học tập."',
        correctAnswer: 'Some students drop out due to academic failure and an inability to meet course requirements.',
        modelAnswer: 'Some students drop out due to academic failure and an inability to meet course requirements.',
        fallbackKeywords: ['academic failure', 'drop out', 'course requirements'],
        explanationVi: "'Due to + N' = do, vì — giới từ nguyên nhân (academic hơn 'because of'). 'An inability to + V' = sự không có khả năng — cấu trúc danh từ hóa trang trọng."
      },
      {
        questionId: 'w4t7_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "mental health issues"):\n\n"Vấn đề sức khỏe tinh thần khiến sinh viên khó tiếp tục học."',
        correctAnswer: 'Mental health issues make it difficult for students to continue their studies.',
        modelAnswer: 'Mental health issues make it difficult for students to continue their studies.',
        fallbackKeywords: ['mental health issues', 'students', 'continue', 'studies'],
        explanationVi: "'Make it difficult for + O + to V' = khiến việc làm gì trở nên khó khăn — 'it' là dummy subject. Cấu trúc này phổ biến hơn 'make students difficult to'."
      },
      {
        questionId: 'w4t7_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "low income" + "unemployment"):\n\n"Việc không có bằng đại học có thể dẫn đến thu nhập thấp và thất nghiệp."',
        correctAnswer: 'Not having a university degree can lead to low income and unemployment.',
        modelAnswer: 'Not having a university degree can lead to low income and unemployment.',
        fallbackKeywords: ['low income', 'unemployment', 'university degree', 'lead to'],
        explanationVi: "'Not having + N' = gerund phủ định làm chủ ngữ. 'Lead to + N' = dẫn đến (hai kết quả song song: low income and unemployment)."
      },
      {
        questionId: 'w4t7_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "academic counseling"):\n\n"Chính phủ nên cung cấp nhiều chương trình tư vấn học tập hơn cho sinh viên."',
        correctAnswer: 'The government should provide more academic counseling programmes to support students.',
        modelAnswer: 'The government should provide more academic counseling programmes to support students.',
        fallbackKeywords: ['academic counseling', 'government', 'programmes', 'support'],
        explanationVi: "'Academic counseling' = tư vấn học tập/hướng nghiệp. 'Should provide' = should + V (đề xuất giải pháp). 'Programmes' = spelling British English."
      },
      {
        questionId: 'w4t7_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "career guidance"):\n\n"Các trường đại học cần tăng cường hướng nghiệp cho sinh viên."',
        correctAnswer: 'Universities need to strengthen career guidance services for their students.',
        modelAnswer: 'Universities need to strengthen career guidance services for their students.',
        fallbackKeywords: ['career guidance', 'universities', 'strengthen', 'students'],
        explanationVi: "'Career guidance' = hướng dẫn nghề nghiệp. 'Strengthen' = tăng cường, củng cố — học thuật hơn 'improve' hay 'increase'. 'Services' nhấn mạnh đây là dịch vụ thể chế."
      }
    ]
  },

  // ─── BLOCK 3: Week 5-6 — Agree or Disagree / Work ───
  {
    week: 5, block: 'agree_disagree', orderIndex: 8,
    topicName: 'Shorter Work Week', topicEmoji: '💼',
    essayType: 'agree_disagree',
    prompt: 'The working week should be shorter and workers should have a longer weekend. Do you agree or disagree?',
    hintAdvantages: ['reduces stress', 'increases productivity', 'better work-life balance'],
    hintDisadvantages: ['economic impact', 'reduced income', 'lower output'],
    vocabularyList: [
      { term: 'work-life balance', definitionVi: 'cân bằng công việc và cuộc sống', example: 'A shorter work week promotes a healthier work-life balance.' },
      { term: 'productivity', definitionVi: 'năng suất lao động', example: 'Studies show that well-rested workers have higher productivity.' },
      { term: 'economic output', definitionVi: 'sản lượng kinh tế', example: 'Reducing working hours could lower economic output.' },
      { term: 'burnout', definitionVi: 'kiệt sức (do làm việc quá sức)', example: 'Overworking for an extended period can lead to burnout.' },
      { term: 'employee well-being', definitionVi: 'sức khỏe và phúc lợi nhân viên', example: 'More rest time significantly improves employee well-being.' },
      { term: 'labor productivity', definitionVi: 'năng suất lao động', example: 'Research suggests that reducing working hours can improve labor productivity.' },
      { term: 'extended period', definitionVi: 'khoảng thời gian dài', example: 'Overworking for an extended period can damage physical health.' },
      { term: 'economic growth', definitionVi: 'tăng trưởng kinh tế', example: 'Some argue a shorter working week may slow economic growth.' },
      { term: 'leisure time', definitionVi: 'thời gian giải trí, nghỉ ngơi', example: 'Workers need sufficient leisure time to recharge.' },
      { term: 'overworking', definitionVi: 'làm việc quá sức', example: 'Overworking is linked to serious health conditions.' },
      { term: 'workforce', definitionVi: 'lực lượng lao động', example: 'A healthier workforce is more productive in the long run.' },
      { term: 'morale', definitionVi: 'tinh thần làm việc', example: 'Shorter working hours can boost employee morale significantly.' },
      { term: 'output', definitionVi: 'sản lượng đầu ra', example: 'Critics worry that less work time will reduce total output.' },
      { term: 'recovery', definitionVi: 'sự phục hồi', example: 'Extended weekends allow workers adequate recovery time.' },
      { term: 'stress-related illness', definitionVi: 'bệnh liên quan đến căng thẳng', example: 'Reducing hours could decrease stress-related illnesses in the workplace.' }
    ],
    questions: [
      {
        questionId: 'w5t8_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Để đạt Band 6.5+ trong bài Agree/Disagree, cấu trúc bài luận nào là phù hợp nhất?',
        options: [
          'Viết 1 body đồng ý + 1 body không đồng ý (không rõ lập trường)',
          'Viết rõ lập trường (đồng ý hoặc không đồng ý), duy trì nhất quán suốt bài',
          'Không cần nêu ý kiến cá nhân trong Introduction',
          'Kết luận không cần nhắc lại lập trường'
        ],
        correctAnswer: 'Viết rõ lập trường (đồng ý hoặc không đồng ý), duy trì nhất quán suốt bài',
        explanationVi: "Band 6.5+ yêu cầu lập trường rõ ràng và nhất quán từ đầu đến cuối. Nếu viết 1 body đồng ý + 1 body không đồng ý mà không có lập trường chủ đạo, bài sẽ bị đánh giá 'unclear position' → giảm điểm Task Response."
      },
      {
        questionId: 'w5t8_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Cân bằng giữa công việc và cuộc sống là yếu tố quan trọng để duy trì hạnh phúc tổng thể."',
        correctAnswer: 'Work-life balance is a crucial factor in maintaining overall happiness.',
        modelAnswer: 'Work-life balance is a crucial factor in maintaining overall happiness.',
        fallbackKeywords: ['work-life balance', 'crucial', 'happiness', 'maintaining'],
        explanationVi: "'A crucial factor in + V-ing' = yếu tố quan trọng trong việc. 'Maintaining overall happiness' = duy trì hạnh phúc tổng thể. 'Crucial' = quan trọng (mạnh hơn 'important')."
      },
      {
        questionId: 'w5t8_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Làm việc quá sức trong thời gian dài có thể dẫn đến kiệt sức."',
        correctAnswer: 'Overworking for an extended period can lead to burnout.',
        modelAnswer: 'Overworking for an extended period can lead to burnout.',
        fallbackKeywords: ['overworking', 'extended period', 'burnout', 'lead to'],
        explanationVi: "'Overworking' = làm việc quá sức (gerund làm chủ ngữ). 'For an extended period' = trong thời gian dài (formal hơn 'for a long time'). 'Burnout' = kiệt sức do công việc."
      },
      {
        questionId: 'w5t8_q04', level: 'beginner', orderIndex: 4,
        type: 'topic_sentence',
        questionText: 'Chọn Thesis Statement tốt nhất cho bài essay ĐỒNG Ý với tuần làm việc ngắn hơn:',
        options: [
          'I will discuss both the advantages and disadvantages of a shorter working week.',
          'I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.',
          'Some people agree while others disagree with this idea.',
          'A shorter working week is an interesting topic to discuss.'
        ],
        correctAnswer: 'I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.',
        explanationVi: "'I strongly agree that...' nêu lập trường rõ ràng. 'As this would...' giải thích lý do ngay trong thesis — đây là kỹ thuật nâng cao. Lựa chọn 1 là Advantages & Disadvantages, không phải Agree/Disagree."
      },
      {
        questionId: 'w5t8_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Khi được nghỉ ngơi nhiều hơn, sức khỏe và phúc lợi của nhân viên được cải thiện đáng kể."',
        correctAnswer: 'When given more rest time, employee well-being improves significantly.',
        modelAnswer: 'When given more rest time, employee well-being improves significantly.',
        fallbackKeywords: ['employee well-being', 'rest', 'improves', 'significantly'],
        explanationVi: "'When given + N' = khi được cho/nhận (passive participle clause). 'Employee well-being' = sức khỏe và phúc lợi nhân viên. 'Improves significantly' = cải thiện đáng kể."
      },
      {
        questionId: 'w5t8_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng tuần làm việc ngắn hơn có thể làm chậm tăng trưởng kinh tế."',
        correctAnswer: 'Some people argue that a shorter working week may slow down economic growth.',
        modelAnswer: 'Some people argue that a shorter working week may slow down economic growth.',
        fallbackKeywords: ['shorter working week', 'economic growth', 'slow down', 'argue'],
        explanationVi: "'Some people argue that...' = một số người cho rằng — cách trình bày quan điểm đối lập mà không mất lập trường cá nhân. 'Slow down' = làm chậm."
      },
      {
        questionId: 'w5t8_q07', level: 'elementary', orderIndex: 7,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"I agree that working weeks should be shorter because workers need time to resting."',
        correctAnswer: 'I agree that working weeks should be shorter because workers need time to rest.',
        modelAnswer: 'I agree that working weeks should be shorter because workers need time to rest.',
        fallbackKeywords: ['agree', 'working weeks', 'shorter', 'workers', 'rest'],
        explanationVi: "Lỗi: Sau 'need + time + to' phải dùng bare infinitive. 'to resting' → 'to rest'. Cấu trúc: 'need time to + V (nguyên thể)'."
      },
      {
        questionId: 'w5t8_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nghiên cứu cho thấy việc giảm giờ làm thực ra có thể cải thiện năng suất lao động."',
        correctAnswer: 'Research suggests that reducing working hours can actually improve labor productivity.',
        modelAnswer: 'Research suggests that reducing working hours can actually improve labor productivity.',
        fallbackKeywords: ['research', 'working hours', 'labor productivity', 'improve'],
        explanationVi: "'Research suggests that...' = nghiên cứu cho thấy — cách dẫn chứng học thuật không cần trích nguồn cụ thể. 'Actually' nhấn mạnh điều ngược trực giác. 'Labor productivity' = năng suất lao động."
      },
      {
        questionId: 'w5t8_q09', level: 'intermediate', orderIndex: 9,
        type: 'paraphrase',
        questionText: 'Paraphrase câu sau:\n\n"The working week should be shorter and workers should have a longer weekend."',
        correctAnswer: 'Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.',
        modelAnswer: 'Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.',
        fallbackKeywords: ['employees', 'reduction', 'leisure', 'recovery', 'extended'],
        explanationVi: "Thay 'workers' → 'employees', 'shorter' → 'reduction in', 'longer weekend' → 'extended periods of leisure and recovery'. 'Allowing for' = cho phép, tạo điều kiện cho."
      },
      {
        questionId: 'w5t8_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) ĐỒNG Ý rằng tuần làm việc nên ngắn hơn.\n\nGợi ý: productivity / burnout / work-life balance / employee well-being',
        modelAnswer: 'I strongly believe that reducing the length of the working week would bring considerable benefits to both workers and employers. When employees are given adequate rest, they return to work with renewed energy and sharper focus, which research consistently shows leads to higher labor productivity. Moreover, a longer weekend provides valuable time for physical exercise, family activities, and personal development, all of which contribute to improved mental well-being. Countries such as Iceland have already trialled a four-day working week with overwhelmingly positive results, demonstrating that this approach is both practical and economically viable.',
        fallbackKeywords: ['productivity', 'rest', 'well-being', 'work-life balance', 'four-day', 'employees'],
        explanationVi: "Đoạn Agree cần: lập trường rõ → lý do 1 → lý do 2 → bằng chứng/ví dụ thực tế. Không nên nhắc nhược điểm trong đoạn này."
      },
      {
        questionId: 'w5t8_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "working week"):\n\n"Nhiều người tin rằng tuần làm việc nên ngắn hơn để có nhiều thời gian nghỉ ngơi."',
        correctAnswer: 'Many people believe that the working week should be shorter in order to allow more time for rest.',
        modelAnswer: 'Many people believe that the working week should be shorter in order to allow more time for rest.',
        fallbackKeywords: ['working week', 'shorter', 'rest', 'allow'],
        explanationVi: "'In order to + V' = để (mục đích, trang trọng hơn 'to'). 'Allow + time for + N' = cho phép có thời gian cho — collocation học thuật."
      },
      {
        questionId: 'w5t8_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "productivity" + "efficiency"):\n\n"Làm việc ít giờ hơn có thể giúp cải thiện năng suất và hiệu quả công việc."',
        correctAnswer: 'Working fewer hours can help improve both productivity and overall efficiency.',
        modelAnswer: 'Working fewer hours can help improve both productivity and overall efficiency.',
        fallbackKeywords: ['productivity', 'efficiency', 'fewer hours', 'improve'],
        explanationVi: "'Fewer hours' = ít giờ hơn (đếm được). 'Both A and B' = cả A lẫn B. 'Overall efficiency' = hiệu quả tổng thể — 'overall' nhấn mạnh phạm vi rộng."
      },
      {
        questionId: 'w5t8_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "work–life balance"):\n\n"Cân bằng giữa công việc và cuộc sống là yếu tố quan trọng để duy trì hạnh phúc."',
        correctAnswer: 'Work–life balance is a crucial factor in maintaining personal well-being and happiness.',
        modelAnswer: 'Work–life balance is a crucial factor in maintaining personal well-being and happiness.',
        fallbackKeywords: ['work-life balance', 'crucial', 'well-being', 'happiness'],
        explanationVi: "'Crucial factor' = yếu tố then chốt (mạnh hơn 'important factor'). 'In maintaining' = trong việc duy trì — gerund sau giới từ."
      },
      {
        questionId: 'w5t8_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "family bonding"):\n\n"Khi có nhiều thời gian rảnh, người lao động có thể dành thời gian cho gia đình."',
        correctAnswer: 'With more free time, workers can dedicate time to family bonding.',
        modelAnswer: 'With more free time, workers can dedicate time to family bonding.',
        fallbackKeywords: ['family bonding', 'free time', 'workers', 'dedicate'],
        explanationVi: "'Family bonding' = gắn kết gia đình. 'Dedicate time to + N/V-ing' = dành thời gian cho — formal hơn 'spend time with'."
      },
      {
        questionId: 'w5t8_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "burnout"):\n\n"Việc làm việc quá nhiều giờ có thể gây ra căng thẳng và kiệt sức."',
        correctAnswer: 'Working excessive hours can cause both stress and burnout.',
        modelAnswer: 'Working excessive hours can cause both stress and burnout.',
        fallbackKeywords: ['burnout', 'excessive hours', 'stress', 'cause'],
        explanationVi: "'Burnout' = kiệt sức do làm việc quá độ. 'Excessive hours' = số giờ quá mức (excessive = formal hơn 'too many'). 'Both A and B' liệt kê hai kết quả."
      },
      {
        questionId: 'w5t8_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "flexible schedule"):\n\n"Lịch làm việc linh hoạt giúp nhân viên kiểm soát tốt hơn thời gian của mình."',
        correctAnswer: 'A flexible schedule gives employees greater control over their own time.',
        modelAnswer: 'A flexible schedule gives employees greater control over their own time.',
        fallbackKeywords: ['flexible schedule', 'employees', 'control', 'time'],
        explanationVi: "'Control over + N' = quyền kiểm soát đối với — 'over' là giới từ đi với 'control'. 'Greater control' = so sánh hơn của danh từ."
      },
      {
        questionId: 'w5t8_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "employee performance"):\n\n"Nhân viên có thời gian nghỉ ngơi hợp lý thường làm việc hiệu quả hơn."',
        correctAnswer: 'Employees who have adequate rest time generally show better employee performance.',
        modelAnswer: 'Employees who have adequate rest time generally show better employee performance.',
        fallbackKeywords: ['employee performance', 'rest time', 'adequate', 'better'],
        explanationVi: "'Adequate rest time' = thời gian nghỉ ngơi đầy đủ. 'Show better performance' = thể hiện/có hiệu suất tốt hơn — 'show' học thuật hơn 'have'."
      },
      {
        questionId: 'w5t8_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "job satisfaction" + "working environment"):\n\n"Một môi trường làm việc tốt giúp tăng sự hài lòng trong công việc."',
        correctAnswer: 'A positive working environment helps increase job satisfaction among employees.',
        modelAnswer: 'A positive working environment helps increase job satisfaction among employees.',
        fallbackKeywords: ['job satisfaction', 'working environment', 'positive', 'increase'],
        explanationVi: "'A positive working environment' = môi trường làm việc tích cực. 'Among employees' = trong số nhân viên — 'among' thay 'for' khi nói về nhóm người."
      },
      {
        questionId: 'w5t8_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "personal development"):\n\n"Việc có thêm thời gian nghỉ giúp họ phát triển kỹ năng cá nhân."',
        correctAnswer: 'Having extra time off allows employees to invest in personal development.',
        modelAnswer: 'Having extra time off allows employees to invest in personal development.',
        fallbackKeywords: ['personal development', 'extra time off', 'invest', 'allows'],
        explanationVi: "'Time off' = thời gian nghỉ (từ ghép). 'Allow + O + to V' = cho phép ai làm gì. 'Invest in personal development' = đầu tư vào phát triển cá nhân."
      },
      {
        questionId: 'w5t8_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "turnover rate"):\n\n"Giảm giờ làm việc có thể giúp giảm tỉ lệ nghỉ việc."',
        correctAnswer: 'Reducing working hours may help lower the employee turnover rate.',
        modelAnswer: 'Reducing working hours may help lower the employee turnover rate.',
        fallbackKeywords: ['turnover rate', 'reducing working hours', 'lower'],
        explanationVi: "'Turnover rate' = tỉ lệ nhân viên nghỉ việc và thay thế. 'May help lower' = có thể giúp giảm — 'may' nhẹ hơn 'can' (mức độ khả năng)."
      }
    ]
  },
  {
    week: 5, block: 'agree_disagree', orderIndex: 9,
    topicName: 'Remote Work as the Future', topicEmoji: '🧑‍💻',
    essayType: 'agree_disagree',
    prompt: 'Working from home will become the main way people work in the future. Do you agree or disagree?',
    hintAdvantages: ['flexibility', 'cost savings', 'no commute'],
    hintDisadvantages: ['isolation', 'difficulty monitoring', 'blurred boundaries'],
    vocabularyList: [
      { term: 'remote work', definitionVi: 'làm việc từ xa', example: 'Remote work has become increasingly common since 2020.' },
      { term: 'commuting time', definitionVi: 'thời gian đi lại', example: 'Employees can save commuting time by working from home.' },
      { term: 'hybrid work model', definitionVi: 'mô hình làm việc kết hợp', example: 'Many companies have shifted to a hybrid work model.' },
      { term: 'company culture', definitionVi: 'văn hóa doanh nghiệp', example: 'Working from home may negatively affect company culture.' },
      { term: 'long-term sustainability', definitionVi: 'bền vững dài hạn', example: 'Some argue that remote work lacks long-term sustainability.' },
      { term: 'prevalent', definitionVi: 'phổ biến', example: 'Remote work has become more prevalent since the pandemic.' },
      { term: 'pandemic', definitionVi: 'đại dịch', example: 'The pandemic accelerated the shift to remote work globally.' },
      { term: 'collaboration', definitionVi: 'sự hợp tác', example: 'In-person collaboration is difficult to replicate online.' },
      { term: 'dominant', definitionVi: 'chiếm ưu thế, chủ đạo', example: 'Remote work is unlikely to become the dominant working style.' },
      { term: 'flexibility', definitionVi: 'tính linh hoạt', example: 'Remote work offers greater flexibility to employees.' },
      { term: 'isolation', definitionVi: 'sự cô lập', example: 'Prolonged remote work can lead to professional isolation.' },
      { term: 'in-person', definitionVi: 'trực tiếp (gặp mặt)', example: 'In-person meetings remain essential for complex negotiations.' },
      { term: 'office-based work', definitionVi: 'làm việc tại văn phòng', example: 'Office-based work remains necessary for many industries.' },
      { term: 'productivity', definitionVi: 'năng suất làm việc', example: 'The impact of remote work on productivity varies by industry.' },
      { term: 'blurred boundaries', definitionVi: 'ranh giới mờ nhạt', example: 'Remote work creates blurred boundaries between work and personal life.' }
    ],
    questions: [
      {
        questionId: 'w5t9_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Làm việc từ xa đã trở nên phổ biến hơn kể từ sau đại dịch."',
        correctAnswer: 'Remote work has become more prevalent since the pandemic.',
        modelAnswer: 'Remote work has become more prevalent since the pandemic.',
        fallbackKeywords: ['remote work', 'prevalent', 'pandemic'],
        explanationVi: "'Prevalent' = phổ biến, lan rộng (academic hơn 'popular' hoặc 'common'). 'Since + N' dùng với Present Perfect để diễn đạt thay đổi từ một điểm trong quá khứ đến nay."
      },
      {
        questionId: 'w5t9_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhân viên có thể tiết kiệm thời gian đi lại bằng cách làm việc tại nhà mỗi ngày."',
        correctAnswer: 'Employees can save commuting time by working from home every day.',
        modelAnswer: 'Employees can save commuting time by working from home every day.',
        fallbackKeywords: ['employees', 'commuting time', 'working from home'],
        explanationVi: "'Save + N + by + V-ing' = tiết kiệm gì bằng cách làm gì. 'Commuting time' = thời gian đi lại (danh từ ghép). Đây là một lợi ích cụ thể của remote work."
      },
      {
        questionId: 'w5t9_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều công ty đã chuyển sang mô hình làm việc kết hợp, kết hợp cả làm ở nhà và tại văn phòng."',
        correctAnswer: 'Many companies have shifted to a hybrid work model combining home-based and office work.',
        modelAnswer: 'Many companies have shifted to a hybrid work model combining home-based and office work.',
        fallbackKeywords: ['hybrid work model', 'companies', 'home-based', 'office'],
        explanationVi: "'Shift to + N' = chuyển sang. 'Hybrid work model' = mô hình làm việc kết hợp. 'Combining...' là participle phrase bổ nghĩa. Present Perfect nhấn mạnh sự thay đổi đã xảy ra."
      },
      {
        questionId: 'w5t9_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Làm việc tại nhà có thể ảnh hưởng tiêu cực đến văn hóa doanh nghiệp."',
        correctAnswer: 'Working from home may have a negative impact on company culture.',
        modelAnswer: 'Working from home may have a negative impact on company culture.',
        fallbackKeywords: ['company culture', 'negative impact', 'working from home'],
        explanationVi: "'Have a negative impact on + N' = ảnh hưởng tiêu cực đến. 'Company culture' = văn hóa doanh nghiệp. Đây là một trong những nhược điểm chính của remote work."
      },
      {
        questionId: 'w5t9_q05', level: 'elementary', orderIndex: 5,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n[remote work / I / will / believe / the dominant / become / working style of the future]',
        correctAnswer: 'I believe remote work will become the dominant working style of the future.',
        modelAnswer: 'I believe remote work will become the dominant working style of the future.',
        fallbackKeywords: ['remote work', 'dominant', 'working style', 'future'],
        explanationVi: "Cấu trúc: 'I believe + (that) + S + will + V'. 'Dominant' = chiếm ưu thế. 'Working style of the future' = phong cách làm việc của tương lai."
      },
      {
        questionId: 'w5t9_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng làm việc từ xa thiếu tính bền vững lâu dài."',
        correctAnswer: 'Some people argue that remote work lacks long-term sustainability.',
        modelAnswer: 'Some people argue that remote work lacks long-term sustainability.',
        fallbackKeywords: ['remote work', 'long-term sustainability', 'argue'],
        explanationVi: "'Lack + N' = thiếu, không có (verb, không cần 'lacks of'). 'Long-term sustainability' = tính bền vững lâu dài. 'Some people argue that' = cách trình bày quan điểm phản bác."
      },
      {
        questionId: 'w5t9_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) PHẢN ĐỐI ý kiến cho rằng làm việc từ xa sẽ là cách làm việc chính trong tương lai.\n\nGợi ý: company culture / collaboration / isolation / office-based work',
        modelAnswer: 'Despite the growing popularity of remote work, I disagree that it will become the dominant working arrangement in the future. Many industries, including manufacturing, healthcare, and hospitality, require physical presence and therefore cannot transition fully to remote models. Furthermore, even in knowledge-based sectors, in-person collaboration remains crucial for innovation, team cohesion, and maintaining a strong company culture. Prolonged remote work has also been linked to professional isolation and blurred work-life boundaries, which ultimately diminish employee well-being and retention. A hybrid approach is far more sustainable than complete remote working.',
        fallbackKeywords: ['company culture', 'collaboration', 'isolation', 'office', 'hybrid', 'dominant'],
        explanationVi: "Đoạn Disagree cần nêu lập trường rõ ngay đầu, sau đó đưa ra 2-3 lý do phản đối với giải thích cụ thể. Kết bằng alternative solution (hybrid model) thuyết phục hơn."
      },
      {
        questionId: 'w5t9_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "remote work"):\n\n"Làm việc từ xa đã trở nên phổ biến hơn sau đại dịch."',
        correctAnswer: 'Remote work has become far more widespread since the pandemic.',
        modelAnswer: 'Remote work has become far more widespread since the pandemic.',
        fallbackKeywords: ['remote work', 'widespread', 'pandemic'],
        explanationVi: "'Far more widespread' = phổ biến hơn nhiều — 'far' tăng cường so sánh hơn. 'Since the pandemic' = kể từ đại dịch — Present Perfect đi với 'since'."
      },
      {
        questionId: 'w5t9_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "work–life balance"):\n\n"Nhiều người thích làm việc tại nhà vì họ có thể cân bằng giữa công việc và cuộc sống tốt hơn."',
        correctAnswer: 'Many people prefer working from home because it enables a better work–life balance.',
        modelAnswer: 'Many people prefer working from home because it enables a better work–life balance.',
        fallbackKeywords: ['work-life balance', 'working from home', 'better', 'enables'],
        explanationVi: "'Prefer + V-ing' = thích làm gì hơn (khi không so sánh trực tiếp). 'Enable' = cho phép, tạo điều kiện cho — academic hơn 'allow' hay 'let'."
      },
      {
        questionId: 'w5t9_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "digital communication tools"):\n\n"Các công cụ giao tiếp kỹ thuật số giúp kết nối nhân viên dù họ ở xa nhau."',
        correctAnswer: 'Digital communication tools help connect employees regardless of their physical location.',
        modelAnswer: 'Digital communication tools help connect employees regardless of their physical location.',
        fallbackKeywords: ['digital communication tools', 'connect', 'employees', 'location'],
        explanationVi: "'Regardless of' = bất kể, không phụ thuộc vào — formal phrase thay cho 'no matter'. 'Physical location' = vị trí địa lý thực tế."
      },
      {
        questionId: 'w5t9_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "social isolation"):\n\n"Một số người cảm thấy cô lập và ít tương tác xã hội khi làm việc ở nhà."',
        correctAnswer: 'Some people feel a sense of social isolation and have fewer social interactions when working from home.',
        modelAnswer: 'Some people feel a sense of social isolation and have fewer social interactions when working from home.',
        fallbackKeywords: ['social isolation', 'working from home', 'interactions', 'fewer'],
        explanationVi: "'A sense of social isolation' = cảm giác cô lập xã hội — 'a sense of' nhấn mạnh cảm nhận chủ quan. 'Fewer social interactions' = so sánh hơn với danh từ đếm được."
      },
      {
        questionId: 'w5t9_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "hybrid model"):\n\n"Nhiều công ty chuyển sang mô hình làm việc kết hợp giữa ở nhà và tại văn phòng."',
        correctAnswer: 'Many companies are shifting to a hybrid model that combines working from home and in the office.',
        modelAnswer: 'Many companies are shifting to a hybrid model that combines working from home and in the office.',
        fallbackKeywords: ['hybrid model', 'home', 'office', 'combining', 'shifting'],
        explanationVi: "'Shift to' = chuyển sang (phrasal verb học thuật). 'A hybrid model that combines A and B' = mô hình kết hợp — mệnh đề quan hệ bổ nghĩa."
      },
      {
        questionId: 'w5t9_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "technological advancement"):\n\n"Công nghệ hiện đại cho phép các nhóm làm việc hiệu quả dù ở xa nhau."',
        correctAnswer: 'Modern technological advancement allows teams to work efficiently even at a distance.',
        modelAnswer: 'Modern technological advancement allows teams to work efficiently even at a distance.',
        fallbackKeywords: ['technological advancement', 'teams', 'efficiently', 'distance'],
        explanationVi: "'At a distance' = từ xa, ở khoảng cách xa. 'Even at a distance' = ngay cả khi ở xa — 'even' nhấn mạnh tính bất thường hoặc ngạc nhiên."
      },
      {
        questionId: 'w5t9_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "internet connectivity"):\n\n"Kết nối Internet yếu có thể ảnh hưởng đến hiệu suất làm việc."',
        correctAnswer: 'Poor internet connectivity can negatively affect work performance and productivity.',
        modelAnswer: 'Poor internet connectivity can negatively affect work performance and productivity.',
        fallbackKeywords: ['internet connectivity', 'poor', 'work performance', 'productivity'],
        explanationVi: "'Poor internet connectivity' = kết nối internet kém. 'Negatively affect' = ảnh hưởng tiêu cực. 'Work performance and productivity' = hai danh từ bổ nghĩa lẫn nhau."
      },
      {
        questionId: 'w5t9_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "time management"):\n\n"Một số người gặp khó khăn trong việc quản lý thời gian khi làm việc tại nhà."',
        correctAnswer: 'Some people struggle with time management when working from home.',
        modelAnswer: 'Some people struggle with time management when working from home.',
        fallbackKeywords: ['time management', 'struggle', 'working from home'],
        explanationVi: "'Struggle with + N/V-ing' = gặp khó khăn với. 'When working from home' = rút gọn từ 'when they are working from home'."
      },
      {
        questionId: 'w5t9_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "communication barrier"):\n\n"Thiếu giao tiếp trực tiếp có thể gây ra rào cản trong hợp tác nhóm."',
        correctAnswer: 'A lack of direct interaction can create a communication barrier in team collaboration.',
        modelAnswer: 'A lack of direct interaction can create a communication barrier in team collaboration.',
        fallbackKeywords: ['communication barrier', 'direct interaction', 'team collaboration'],
        explanationVi: "'Communication barrier' = rào cản giao tiếp. 'Create a barrier' = tạo ra rào cản — 'create' học thuật hơn 'cause'. 'Team collaboration' = hợp tác nhóm."
      },
      {
        questionId: 'w5t9_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "corporate culture"):\n\n"Làm việc tại nhà có thể ảnh hưởng đến văn hóa doanh nghiệp."',
        correctAnswer: 'Working from home can have a significant impact on corporate culture.',
        modelAnswer: 'Working from home can have a significant impact on corporate culture.',
        fallbackKeywords: ['corporate culture', 'working from home', 'significant impact'],
        explanationVi: "'Corporate culture' = văn hóa doanh nghiệp/công ty. 'Have a significant impact on' = có tác động đáng kể lên — 'have an impact' là collocation cố định."
      }
    ]
  },
  {
    week: 6, block: 'agree_disagree', orderIndex: 10,
    topicName: 'Job Satisfaction vs. Salary', topicEmoji: '📈',
    essayType: 'agree_disagree',
    prompt: 'Job satisfaction is more important than a high salary. Do you agree or disagree?',
    hintAdvantages: ['long-term happiness', 'reduces stress', 'better performance'],
    hintDisadvantages: ['financial security needed', 'salary covers basic needs'],
    vocabularyList: [
      { term: 'job satisfaction', definitionVi: 'sự hài lòng với công việc', example: 'Job satisfaction leads to higher employee retention rates.' },
      { term: 'financial security', definitionVi: 'an toàn tài chính', example: 'A good salary provides financial security for the family.' },
      { term: 'intrinsic motivation', definitionVi: 'động lực nội tại', example: 'Intrinsic motivation drives employees to perform at their best.' },
      { term: 'job burnout', definitionVi: 'kiệt sức vì công việc', example: 'Many people experience job burnout when doing work they dislike.' },
      { term: 'sense of fulfillment', definitionVi: 'cảm giác mãn nguyện', example: 'A sense of fulfillment motivates people every single day.' },
      { term: 'long-term happiness', definitionVi: 'hạnh phúc lâu dài', example: 'Pursuing job satisfaction ultimately leads to greater long-term happiness.' },
      { term: 'performance', definitionVi: 'hiệu suất, kết quả làm việc', example: 'People who love their jobs often achieve higher performance.' },
      { term: 'work motivation', definitionVi: 'động lực làm việc', example: 'Work motivation is closely linked to job satisfaction.' },
      { term: 'employee retention', definitionVi: 'giữ chân nhân viên', example: 'High job satisfaction improves employee retention rates.' },
      { term: 'pursue', definitionVi: 'theo đuổi', example: 'Many young people pursue careers that offer personal meaning over high pay.' },
      { term: 'well-being', definitionVi: 'sức khỏe và hạnh phúc', example: 'Job satisfaction is a key factor in overall personal well-being.' },
      { term: 'dislike', definitionVi: 'không thích', example: 'Working in a role you dislike can lead to chronic stress.' },
      { term: 'ultimately', definitionVi: 'cuối cùng, rốt cuộc', example: 'Financial success without job satisfaction ultimately feels hollow.' },
      { term: 'survive', definitionVi: 'tồn tại, sống sót', example: 'Without adequate income, people cannot survive comfortably.' },
      { term: 'passion', definitionVi: 'đam mê', example: 'Following one\'s passion often leads to greater professional success.' }
    ],
    questions: [
      {
        questionId: 'w6t10_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Mức lương cao giúp mang lại sự an toàn tài chính cho người lao động."',
        correctAnswer: 'A high salary helps provide financial security for workers.',
        modelAnswer: 'A high salary helps provide financial security for workers.',
        fallbackKeywords: ['high salary', 'financial security', 'workers'],
        explanationVi: "'Help + V (bare)' = giúp làm gì. 'Provide financial security' = mang lại sự an toàn tài chính. Đây là lập luận phản đối (disagree) — lương cao đáp ứng nhu cầu cơ bản."
      },
      {
        questionId: 'w6t10_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Cảm giác mãn nguyện trong công việc tạo động lực cho con người mỗi ngày."',
        correctAnswer: 'A sense of fulfillment in work motivates people every single day.',
        modelAnswer: 'A sense of fulfillment in work motivates people every single day.',
        fallbackKeywords: ['sense of fulfillment', 'motivates', 'people', 'work'],
        explanationVi: "'A sense of fulfillment' = cảm giác mãn nguyện (noun phrase). 'Every single day' = mỗi ngày (nhấn mạnh hơn 'every day'). Đây là lập luận ủng hộ job satisfaction."
      },
      {
        questionId: 'w6t10_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Những người yêu thích công việc của mình thường đạt hiệu suất cao hơn nhờ động lực nội tại mạnh mẽ."',
        correctAnswer: 'People who love their jobs often achieve higher performance due to strong intrinsic motivation.',
        modelAnswer: 'People who love their jobs often achieve higher performance due to strong intrinsic motivation.',
        fallbackKeywords: ['intrinsic motivation', 'performance', 'love', 'jobs'],
        explanationVi: "'Due to + N' = do, vì (chỉ nguyên nhân — formal). 'Achieve higher performance' = đạt hiệu suất cao hơn. Relative clause 'who love their jobs' xác định nhóm người cụ thể."
      },
      {
        questionId: 'w6t10_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều người cảm thấy kiệt sức khi làm công việc họ không thích, dù lương có cao."',
        correctAnswer: 'Many people experience job burnout when doing work they dislike, even if the salary is high.',
        modelAnswer: 'Many people experience job burnout when doing work they dislike, even if the salary is high.',
        fallbackKeywords: ['job burnout', 'dislike', 'salary', 'high'],
        explanationVi: "'Experience job burnout' = trải qua kiệt sức vì công việc. 'Even if' = dù cho, ngay cả khi. 'Work they dislike' = relative clause không cần 'which/that' (object relative clause)."
      },
      {
        questionId: 'w6t10_q05', level: 'elementary', orderIndex: 5,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa lại:\n\n"I disagree that job satisfaction is more important than salary, because without money, peoples cannot survive."',
        correctAnswer: 'I disagree that job satisfaction is more important than salary, because without money, people cannot survive.',
        modelAnswer: 'I disagree that job satisfaction is more important than salary, because without money, people cannot survive.',
        fallbackKeywords: ['job satisfaction', 'salary', 'people', 'survive'],
        explanationVi: "Lỗi: 'peoples' không tồn tại. 'People' đã là số nhiều (uncountable collective noun). Không thêm 's' vào 'people'."
      },
      {
        questionId: 'w6t10_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Dù đồng ý hay không, việc theo đuổi sự hài lòng trong công việc cuối cùng dẫn đến hạnh phúc lâu dài hơn."',
        correctAnswer: 'Regardless of one\'s view, pursuing job satisfaction ultimately leads to greater long-term happiness.',
        modelAnswer: 'Regardless of one\'s view, pursuing job satisfaction ultimately leads to greater long-term happiness.',
        fallbackKeywords: ['job satisfaction', 'long-term happiness', 'pursuing', 'ultimately'],
        explanationVi: "'Regardless of one\'s view' = bất kể quan điểm của ai (formal phrase). 'Pursuing + N' (gerund làm chủ ngữ). 'Ultimately' = cuối cùng, rốt cuộc — adverb học thuật quan trọng."
      },
      {
        questionId: 'w6t10_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80-100 từ) ĐỒNG Ý rằng sự hài lòng trong công việc quan trọng hơn mức lương cao.\n\nGợi ý: intrinsic motivation / job burnout / performance / long-term happiness',
        modelAnswer: 'I firmly agree that job satisfaction is more important than a high salary in the long run. When individuals are genuinely passionate about their work, they are driven by intrinsic motivation, which consistently produces higher levels of performance and creativity than financial incentives alone. In contrast, employees who pursue high salaries in roles they find unfulfilling are significantly more susceptible to job burnout, leading to disengagement, absenteeism, and ultimately career breakdown. Research indicates that long-term happiness is more strongly correlated with a sense of purpose at work than with financial compensation, making job satisfaction the more valuable priority.',
        fallbackKeywords: ['job satisfaction', 'intrinsic motivation', 'burnout', 'performance', 'long-term happiness', 'purpose'],
        explanationVi: "Bài Agree cần: thesis rõ → lý do ủng hộ có giải thích → contrast với lập trường đối lập → kết bằng dẫn chứng. Tránh đề cập lương quan trọng hơn vì sẽ mâu thuẫn lập trường."
      },
      {
        questionId: 'w6t10_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "job satisfaction"):\n\n"Nhiều người tin rằng sự hài lòng trong công việc quan trọng hơn mức lương cao."',
        correctAnswer: 'Many people believe that job satisfaction is more important than a high salary.',
        modelAnswer: 'Many people believe that job satisfaction is more important than a high salary.',
        fallbackKeywords: ['job satisfaction', 'important', 'high salary'],
        explanationVi: "'Job satisfaction' = sự hài lòng trong công việc. So sánh hơn 'more important than' — không nhầm với 'more important as'. 'Believe that' = tin rằng (formal)."
      },
      {
        questionId: 'w6t10_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "financial security"):\n\n"Mức lương cao giúp mang lại sự an toàn tài chính cho người lao động."',
        correctAnswer: 'A high salary helps provide financial security for workers.',
        modelAnswer: 'A high salary helps provide financial security for workers.',
        fallbackKeywords: ['financial security', 'high salary', 'workers', 'provide'],
        explanationVi: "'Financial security' = sự an toàn/bảo đảm tài chính. 'Provide + N + for + N' = cung cấp cái gì cho ai. 'Help + V (bare infinitive)' = giúp làm gì."
      },
      {
        questionId: 'w6t10_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "working environment"):\n\n"Một môi trường làm việc tích cực giúp nhân viên cảm thấy hạnh phúc hơn."',
        correctAnswer: 'A positive working environment makes employees feel happier and more motivated.',
        modelAnswer: 'A positive working environment makes employees feel happier and more motivated.',
        fallbackKeywords: ['working environment', 'positive', 'employees', 'happier', 'motivated'],
        explanationVi: "'Make + O + feel + adj' = khiến ai cảm thấy thế nào. 'Happier and more motivated' = hai so sánh hơn song song cho hai loại tính từ khác nhau."
      },
      {
        questionId: 'w6t10_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "meaningful work"):\n\n"Nhiều người sẵn sàng nhận lương thấp hơn nếu họ yêu thích công việc của mình."',
        correctAnswer: 'Many people are willing to accept a lower salary if they find their work meaningful.',
        modelAnswer: 'Many people are willing to accept a lower salary if they find their work meaningful.',
        fallbackKeywords: ['meaningful work', 'lower salary', 'willing', 'find'],
        explanationVi: "'Be willing to + V' = sẵn sàng làm gì. 'Find + O + adj' = thấy cái gì như thế nào. 'Meaningful' = có ý nghĩa — 'find their work meaningful' tự nhiên hơn 'find their work is meaningful'."
      },
      {
        questionId: 'w6t10_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "work fulfillment"):\n\n"Cảm giác mãn nguyện khi làm việc khiến con người có động lực hơn mỗi ngày."',
        correctAnswer: 'A sense of work fulfillment motivates people to perform better every day.',
        modelAnswer: 'A sense of work fulfillment motivates people to perform better every day.',
        fallbackKeywords: ['work fulfillment', 'motivates', 'perform better', 'every day'],
        explanationVi: "'A sense of work fulfillment' = cảm giác mãn nguyện trong công việc. 'Motivate + O + to V' = thúc đẩy ai làm gì. 'Perform better' = làm việc tốt hơn."
      },
      {
        questionId: 'w6t10_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "career development"):\n\n"Sự phát triển nghề nghiệp giúp nhân viên cảm thấy họ đang tiến bộ."',
        correctAnswer: 'Career development gives employees a sense that they are making progress.',
        modelAnswer: 'Career development gives employees a sense that they are making progress.',
        fallbackKeywords: ['career development', 'employees', 'progress', 'sense'],
        explanationVi: "'Career development' = sự phát triển nghề nghiệp. 'A sense that + clause' = cảm giác rằng. 'Make progress' = tiến bộ — 'make' là collocating verb cố định."
      },
      {
        questionId: 'w6t10_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "mental well-being"):\n\n"Làm việc quá nhiều giờ có thể ảnh hưởng tiêu cực đến sức khỏe tinh thần."',
        correctAnswer: "Working excessively long hours can negatively affect one's mental well-being.",
        modelAnswer: "Working excessively long hours can negatively affect one's mental well-being.",
        fallbackKeywords: ['mental well-being', 'excessively', 'negatively affect'],
        explanationVi: "'Excessively long hours' = số giờ quá mức. \"One's mental well-being\" dùng đại từ sở hữu trung lập. 'Negatively affect' = ảnh hưởng tiêu cực."
      },
      {
        questionId: 'w6t10_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "employee retention"):\n\n"Nơi làm việc thân thiện giúp tăng khả năng giữ chân nhân viên."',
        correctAnswer: 'A friendly workplace helps improve employee retention.',
        modelAnswer: 'A friendly workplace helps improve employee retention.',
        fallbackKeywords: ['employee retention', 'friendly workplace', 'improve'],
        explanationVi: "'Employee retention' = việc giữ chân nhân viên (không phải 'keeping employees'). 'A friendly workplace' = môi trường làm việc thân thiện. 'Helps improve' = giúp cải thiện."
      },
      {
        questionId: 'w6t10_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "corporate culture"):\n\n"Văn hóa doanh nghiệp ảnh hưởng lớn đến mức độ hài lòng của nhân viên."',
        correctAnswer: 'Corporate culture has a significant impact on employee satisfaction levels.',
        modelAnswer: 'Corporate culture has a significant impact on employee satisfaction levels.',
        fallbackKeywords: ['corporate culture', 'employee satisfaction', 'significant impact'],
        explanationVi: "'Have a significant impact on' = có tác động đáng kể lên — collocation cố định quan trọng. 'Satisfaction levels' = mức độ hài lòng."
      },
      {
        questionId: 'w6t10_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "sense of purpose"):\n\n"Cảm giác có mục đích trong công việc khiến cuộc sống trở nên ý nghĩa hơn."',
        correctAnswer: "Having a sense of purpose in one's work makes life feel more meaningful.",
        modelAnswer: "Having a sense of purpose in one's work makes life feel more meaningful.",
        fallbackKeywords: ['sense of purpose', 'work', 'meaningful', 'makes life'],
        explanationVi: "'A sense of purpose' = cảm giác có mục đích. 'Make + O + feel + adj' = khiến thứ gì đó cảm thấy như thế nào. 'More meaningful' = ý nghĩa hơn."
      }
    ]
  },

  // ─── BLOCK 4: Week 7-8 — Discuss Both Views / Environment ───
  {
    week: 7, block: 'discuss_both_views', orderIndex: 11,
    topicName: 'Individual vs. Government Responsibility', topicEmoji: '🌍',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference. Discuss both views and give your own opinion.',
    hintAdvantages: ['environmental problems are too large-scale for individual action', 'only governments can enforce regulations', 'systemic change requires collective policy'],
    hintDisadvantages: ['everyday choices reduce carbon footprint', 'collective individual effort creates meaningful change', 'eco-friendly behaviour raises public awareness'],
    vocabularyList: [
      { term: 'environmental protection', definitionVi: 'bảo vệ môi trường', example: 'Environmental protection is a shared responsibility of individuals and governments.' },
      { term: 'individual responsibility', definitionVi: 'trách nhiệm cá nhân', example: 'Individual responsibility plays a key role in protecting the environment.' },
      { term: 'collective effort', definitionVi: 'nỗ lực chung', example: 'Collective effort from all sectors is needed to combat climate change.' },
      { term: 'climate change', definitionVi: 'biến đổi khí hậu', example: 'Climate change is one of the greatest threats to our planet.' },
      { term: 'carbon footprint', definitionVi: 'dấu chân carbon', example: 'Individuals can reduce their carbon footprint by using public transport.' },
      { term: 'renewable energy', definitionVi: 'năng lượng tái tạo', example: 'Switching to renewable energy is essential to achieve net-zero emissions.' },
      { term: 'sustainable lifestyle', definitionVi: 'lối sống bền vững', example: 'Adopting a sustainable lifestyle can significantly reduce environmental impact.' },
      { term: 'recycling', definitionVi: 'tái chế', example: 'Recycling helps conserve natural resources and reduce landfill waste.' },
      { term: 'plastic pollution', definitionVi: 'ô nhiễm nhựa', example: 'Plastic pollution is threatening marine ecosystems worldwide.' },
      { term: 'eco-friendly behavior', definitionVi: 'hành vi thân thiện môi trường', example: 'Eco-friendly behavior such as reducing plastic use benefits the planet.' },
      { term: 'government regulation', definitionVi: 'quy định của chính phủ', example: 'Strict government regulation is needed to limit industrial pollution.' },
      { term: 'greenhouse gas emissions', definitionVi: 'khí thải nhà kính', example: 'Greenhouse gas emissions from factories contribute significantly to climate change.' },
      { term: 'deforestation', definitionVi: 'nạn phá rừng', example: 'Deforestation for agriculture is one of the leading causes of habitat loss.' },
      { term: 'environmental degradation', definitionVi: 'suy thoái môi trường', example: 'Rapid industrialisation has led to severe environmental degradation.' },
      { term: 'make a difference', definitionVi: 'tạo ra sự khác biệt', example: 'Every small action can make a difference in the fight against climate change.' }
    ],
    questions: [
      {
        questionId: 'w7t11_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đọc đề bài: "Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference. Discuss both views and give your own opinion." Đây là dạng essay nào?',
        options: ['Advantages & Disadvantages', 'Agree or Disagree', 'Discuss Both Views', 'Cause & Solution'],
        correctAnswer: 'Discuss Both Views',
        explanationVi: 'Keyword "Discuss both views and give your own opinion" xác định dạng bài. Dạng này yêu cầu trình bày CẢ HAI quan điểm một cách công bằng, sau đó đưa ra ý kiến cá nhân rõ ràng.'
      },
      {
        questionId: 'w7t11_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Environmental problems such as _____ change and pollution require urgent attention from governments and individuals alike."',
        correctAnswer: 'climate',
        explanationVi: '"Climate change" — biến đổi khí hậu — là cụm từ cố định phổ biến nhất trong IELTS chủ đề môi trường.'
      },
      {
        questionId: 'w7t11_q03', level: 'beginner', orderIndex: 3,
        type: 'topic_sentence',
        questionText: 'Chọn câu Thesis Statement phù hợp nhất cho dạng Discuss Both Views về chủ đề môi trường:',
        options: [
          'I strongly believe that only governments can solve environmental problems.',
          'This essay will argue that individual actions are completely useless.',
          'While some argue that environmental issues are beyond individual control, others maintain that personal choices can drive meaningful change.',
          'The government should ban all fossil fuels immediately.'
        ],
        correctAnswer: 'While some argue that environmental issues are beyond individual control, others maintain that personal choices can drive meaningful change.',
        explanationVi: 'Thesis Statement của Discuss Both Views phải phản ánh CẢ HAI quan điểm. Câu C trung lập, cân bằng, dẫn dắt vào cả hai luận điểm mà chưa thiên về bên nào.'
      },
      {
        questionId: 'w7t11_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Bảo vệ môi trường là trách nhiệm của cả cá nhân và chính phủ."',
        correctAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        modelAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        fallbackKeywords: ['environmental protection', 'responsibility', 'individuals', 'government'],
        explanationVi: "'The responsibility of both A and B' = trách nhiệm của cả A lẫn B. 'Environmental protection' là cụm danh từ học thuật quan trọng."
      },
      {
        questionId: 'w7t11_q05', level: 'beginner', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng hành động của mỗi cá nhân không thể tạo ra sự khác biệt lớn."',
        correctAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        modelAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        fallbackKeywords: ['argue', 'individual', 'significant difference', 'actions'],
        explanationVi: "'Make a significant difference' = tạo ra sự khác biệt đáng kể. 'Some people argue that' = cấu trúc chuẩn khi trình bày quan điểm của người khác."
      },
      {
        questionId: 'w7t11_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Lối sống bền vững có thể giúp giảm lượng khí thải carbon."',
        correctAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        modelAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        fallbackKeywords: ['sustainable lifestyle', 'carbon footprint', 'reduce'],
        explanationVi: "'Carbon footprint' = dấu chân carbon / lượng khí thải cá nhân. 'Help + V' = giúp làm gì. 'One\'s' = của mỗi người."
      },
      {
        questionId: 'w7t11_q07', level: 'elementary', orderIndex: 7,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nếu mỗi người cùng hành động, nỗ lực chung sẽ tạo ra sự thay đổi lớn."',
        correctAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        modelAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        fallbackKeywords: ['collective effort', 'significant change', 'together'],
        explanationVi: "'Collective effort' = nỗ lực chung. 'Bring about change' = tạo ra sự thay đổi. Câu điều kiện loại 1: If + present simple, will + V."
      },
      {
        questionId: 'w7t11_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ/cụm từ sau thành câu hoàn chỉnh:\n\n[individual actions / While / can / some / argue / that / make a difference, / others / believe / only / governments / have / the power to address / environmental issues]',
        correctAnswer: 'While some argue that individual actions can make a difference, others believe only governments have the power to address environmental issues.',
        explanationVi: "Cấu trúc \"While + clause, + clause\" dùng để đối lập hai quan điểm — đặc trưng của Discuss Both Views."
      },
      {
        questionId: 'w7t11_q09', level: 'elementary', orderIndex: 9,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"People should to reduce their energy consumption in order to protect the environment."',
        correctAnswer: 'People should reduce their energy consumption in order to protect the environment.',
        modelAnswer: 'People should reduce their energy consumption in order to protect the environment.',
        fallbackKeywords: ['should reduce', 'energy consumption', 'environment', 'protect'],
        explanationVi: "Lỗi: Sau \"should\" không dùng \"to + V\" mà dùng bare infinitive. \"Should reduce\" — không phải \"should to reduce\"."
      },
      {
        questionId: 'w7t11_q10', level: 'elementary', orderIndex: 10,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence phù hợp nhất cho đoạn văn sau:\n\n"___. For instance, by recycling household waste, using public transportation, and reducing plastic consumption, ordinary citizens can collectively lower greenhouse gas emissions. These small habits, when adopted widely, accumulate into a substantial positive impact on the planet."',
        options: [
          'The government must take full responsibility for environmental damage.',
          'The environment is in a very poor state today.',
          'On the other hand, proponents of individual action contend that everyday choices can lead to meaningful environmental improvements.',
          'Many people are unaware of the damage caused by pollution.'
        ],
        correctAnswer: 'On the other hand, proponents of individual action contend that everyday choices can lead to meaningful environmental improvements.',
        explanationVi: 'Topic sentence cần khớp với nội dung đoạn văn (tái chế, xe công cộng → hành động cá nhân). Câu C giới thiệu quan điểm về cá nhân đúng ngữ cảnh.'
      },
      {
        questionId: 'w7t11_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Sự hợp tác toàn cầu là yếu tố then chốt trong việc giải quyết biến đổi khí hậu."',
        correctAnswer: 'Global cooperation is a crucial factor in addressing climate change.',
        modelAnswer: 'Global cooperation is a crucial factor in addressing climate change.',
        fallbackKeywords: ['global cooperation', 'crucial', 'climate change', 'addressing'],
        explanationVi: "'Crucial factor in + V-ing' = yếu tố then chốt trong việc. 'Address' = giải quyết (formal hơn 'solve'). 'Global cooperation' = sự hợp tác toàn cầu."
      },
      {
        questionId: 'w7t11_q12', level: 'intermediate', orderIndex: 12,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng các từ gốc: individuals, cannot, improve, environment, individual actions, make a difference:\n\n"Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference."',
        correctAnswer: 'There is ongoing debate as to whether ordinary citizens are powerless to bring about environmental change, or whether personal choices and daily habits hold the potential to contribute meaningfully to ecological preservation.',
        modelAnswer: 'There is ongoing debate as to whether ordinary citizens are powerless to bring about environmental change, or whether personal choices and daily habits hold the potential to contribute meaningfully to ecological preservation.',
        fallbackKeywords: ['ordinary citizens', 'environmental change', 'personal choices', 'ecological', 'powerless'],
        explanationVi: "Paraphrase tốt thay 'individuals' → 'ordinary citizens', 'make a difference' → 'contribute meaningfully', 'environment' → 'ecological preservation'. Không giữ nguyên quá nhiều từ gốc."
      },
      {
        questionId: 'w7t11_q13', level: 'intermediate', orderIndex: 13,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) trình bày quan điểm rằng chính phủ — không phải cá nhân — phải chịu trách nhiệm chính về môi trường.\n\nCấu trúc: Topic Sentence → Explanation → Example\nGợi ý: government regulation / fossil fuels / greenhouse gas emissions / environmental degradation',
        modelAnswer: 'Those who argue that governments bear the primary responsibility for environmental protection point out that large-scale ecological problems such as greenhouse gas emissions and deforestation cannot be meaningfully addressed by individual action alone. Only governments possess the legislative authority to enforce environmental regulations, restrict the use of fossil fuels, and hold corporations accountable for pollution. For example, countries that have introduced strict carbon tax policies have seen measurable reductions in industrial emissions, demonstrating that systemic government intervention is far more impactful than the combined efforts of individual citizens.',
        fallbackKeywords: ['government', 'environmental', 'regulations', 'fossil fuels', 'emissions', 'corporations', 'policy'],
        explanationVi: "Cấu trúc PEEL: Point (topic sentence View 1) → Explain → Evidence → Link. Dùng 'On the one hand' để mở đầu View 1 trong Discuss Both Views."
      },
      // ── QT-4 Intermediate (W7T1) ──
      {
        questionId: 'w7t11_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "environmental protection"):\n\n"Bảo vệ môi trường là trách nhiệm của cả cá nhân và chính phủ."',
        correctAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        modelAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        fallbackKeywords: ['environmental protection', 'responsibility', 'individuals', 'government'],
        explanationVi: "'The responsibility of both A and B' = trách nhiệm của cả A lẫn B. 'Environmental protection' dùng làm chủ ngữ không cần mạo từ."
      },
      {
        questionId: 'w7t11_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "make a difference"):\n\n"Một số người cho rằng hành động của mỗi cá nhân không thể tạo ra sự khác biệt lớn."',
        correctAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        modelAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        fallbackKeywords: ['make a difference', 'individual', 'significant'],
        explanationVi: "'Make a significant difference' = tạo ra sự khác biệt đáng kể. 'Argue that + clause' là cách trích dẫn quan điểm chuẩn trong IELTS."
      },
      {
        questionId: 'w7t11_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "sustainable lifestyle"):\n\n"Lối sống bền vững có thể giúp giảm lượng khí thải carbon."',
        correctAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        modelAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        fallbackKeywords: ['sustainable lifestyle', 'carbon', 'reduce'],
        explanationVi: "'Carbon footprint' = lượng khí thải carbon cá nhân (tự nhiên hơn 'carbon emissions' trong bối cảnh cá nhân). 'One\'s' = của một người."
      },
      {
        questionId: 'w7t11_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "renewable energy"):\n\n"Việc sử dụng năng lượng tái tạo là cách hiệu quả để chống lại biến đổi khí hậu."',
        correctAnswer: 'Using renewable energy is an effective way to combat climate change.',
        modelAnswer: 'Using renewable energy is an effective way to combat climate change.',
        fallbackKeywords: ['renewable energy', 'effective', 'combat', 'climate change'],
        explanationVi: "'An effective way to + V' = cách hiệu quả để làm gì. 'Combat' (= chống lại) mạnh và học thuật hơn 'fight' hay 'reduce'."
      },
      {
        questionId: 'w7t11_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "public campaign"):\n\n"Nhiều chiến dịch cộng đồng được tổ chức để nâng cao nhận thức về môi trường."',
        correctAnswer: 'Many public campaigns are organised to raise awareness about environmental issues.',
        modelAnswer: 'Many public campaigns are organised to raise awareness about environmental issues.',
        fallbackKeywords: ['public campaign', 'raise awareness', 'environmental'],
        explanationVi: "'Are organised to + V' = bị động có mục đích. 'Raise awareness about' = nâng cao nhận thức về. Dùng 'environmental issues' tự nhiên hơn 'environment' thuần túy."
      },
      {
        questionId: 'w7t11_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "government regulation"):\n\n"Chính phủ nên ban hành các quy định nghiêm ngặt về khí thải nhà kính."',
        correctAnswer: 'The government should introduce strict regulations on greenhouse gas emissions.',
        modelAnswer: 'The government should introduce strict regulations on greenhouse gas emissions.',
        fallbackKeywords: ['government regulation', 'strict', 'greenhouse gas', 'emissions'],
        explanationVi: "'Introduce regulations on' = ban hành quy định về. 'Greenhouse gas emissions' = khí thải nhà kính — cụm từ kỹ thuật không thể đổi."
      },
      {
        questionId: 'w7t11_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "collective effort"):\n\n"Nếu mỗi người cùng hành động, nỗ lực chung sẽ tạo ra sự thay đổi lớn."',
        correctAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        modelAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        fallbackKeywords: ['collective effort', 'together', 'significant change'],
        explanationVi: "'Bring about + change' = tạo ra sự thay đổi. 'Collective effort' = nỗ lực tập thể/chung. Câu điều kiện loại 1: If + present, will + V."
      },
      {
        questionId: 'w7t11_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "energy consumption"):\n\n"Ô nhiễm môi trường ngày càng nghiêm trọng do sự tiêu thụ năng lượng quá mức."',
        correctAnswer: 'Environmental pollution is becoming increasingly severe due to excessive energy consumption.',
        modelAnswer: 'Environmental pollution is becoming increasingly severe due to excessive energy consumption.',
        fallbackKeywords: ['energy consumption', 'excessive', 'pollution', 'increasingly severe'],
        explanationVi: "'Is becoming increasingly severe' = đang ngày càng nghiêm trọng (Present Continuous + adverb). 'Due to + N' = do/vì. 'Excessive' = quá mức."
      },
      {
        questionId: 'w7t11_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "environmental degradation"):\n\n"Mọi người cần nâng cao nhận thức về hậu quả của sự suy thoái môi trường."',
        correctAnswer: 'People need to raise awareness about the consequences of environmental degradation.',
        modelAnswer: 'People need to raise awareness about the consequences of environmental degradation.',
        fallbackKeywords: ['environmental degradation', 'awareness', 'consequences'],
        explanationVi: "'Raise awareness about' = nâng cao nhận thức về. 'Consequences of + N' = hậu quả của. 'Environmental degradation' = suy thoái môi trường."
      },
      {
        questionId: 'w7t11_q23', level: 'intermediate', orderIndex: 23,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "reduce, reuse, recycle"):\n\n"Việc giảm, tái sử dụng và tái chế là thói quen mà ai cũng nên thực hiện."',
        correctAnswer: 'The habit of reduce, reuse, and recycle is something everyone should practise.',
        modelAnswer: 'The habit of reduce, reuse, and recycle is something everyone should practise.',
        fallbackKeywords: ['reduce', 'reuse', 'recycle', 'habit', 'everyone'],
        explanationVi: "'The habit of + V/N' = thói quen về. 'Something everyone should practise' = điều mà ai cũng nên thực hiện. 'Practise' (BrE) = luyện tập, thực hiện."
      }
    ]
  },
  {
    week: 7, block: 'discuss_both_views', orderIndex: 12,
    topicName: 'Car-Free Days vs. Alternative Solutions', topicEmoji: '🚗',
    essayType: 'discuss_both_views',
    prompt: 'Some people think international car-free days are an effective way to reduce air pollution. Others believe there are better ways to tackle this issue. Discuss both views and give your own opinion.',
    hintAdvantages: ['raises public awareness of pollution', 'reduces emissions temporarily', 'encourages use of public transport'],
    hintDisadvantages: ['short-term effect only', 'electric vehicles and urban planning are more effective', 'government policy must address root causes'],
    vocabularyList: [
      { term: 'air pollution', definitionVi: 'ô nhiễm không khí', example: 'Car-free days temporarily reduce air pollution in cities.' },
      { term: 'car-free day', definitionVi: 'ngày không xe', example: 'Many cities have adopted car-free days to raise environmental awareness.' },
      { term: 'traffic congestion', definitionVi: 'tắc nghẽn giao thông', example: 'Traffic congestion is a major cause of urban air pollution.' },
      { term: 'exhaust fumes', definitionVi: 'khói thải xe', example: 'Exhaust fumes from vehicles are the main cause of air pollution in cities.' },
      { term: 'greenhouse gas emissions', definitionVi: 'khí thải nhà kính', example: 'Reducing greenhouse gas emissions requires a shift away from fossil fuels.' },
      { term: 'environmental awareness', definitionVi: 'nhận thức môi trường', example: 'Car-free days help raise environmental awareness among citizens.' },
      { term: 'public transportation', definitionVi: 'giao thông công cộng', example: 'Investing in public transportation reduces reliance on private cars.' },
      { term: 'electric vehicles', definitionVi: 'xe điện', example: 'Electric vehicles are becoming a more environmentally friendly alternative.' },
      { term: 'alternative transport', definitionVi: 'phương tiện thay thế', example: 'Cycling and walking are popular forms of alternative transport.' },
      { term: 'sustainable transportation', definitionVi: 'giao thông bền vững', example: 'Sustainable transportation is a long-term solution for densely populated cities.' },
      { term: 'energy-efficient technology', definitionVi: 'công nghệ tiết kiệm năng lượng', example: 'Investment in energy-efficient technology benefits both the economy and environment.' },
      { term: 'government policy', definitionVi: 'chính sách chính phủ', example: 'Effective government policy is needed to enforce emission standards.' },
      { term: 'urban planning', definitionVi: 'quy hoạch đô thị', example: 'Better urban planning can reduce the need for private vehicles.' },
      { term: 'air quality', definitionVi: 'chất lượng không khí', example: 'Poor air quality in major cities poses serious health risks.' },
      { term: 'pollution control', definitionVi: 'kiểm soát ô nhiễm', example: 'Pollution control measures must be enforced by local authorities.' }
    ],
    questions: [
      {
        questionId: 'w7t12_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài có cụm "Discuss both views and give your own opinion." Điều này yêu cầu bạn làm gì?',
        options: [
          'Chỉ đồng ý hoặc không đồng ý với một quan điểm',
          'Phân tích ưu điểm và nhược điểm của một vấn đề',
          'Trình bày cả hai quan điểm, sau đó nêu ý kiến cá nhân rõ ràng',
          'Tìm nguyên nhân và đề xuất giải pháp'
        ],
        correctAnswer: 'Trình bày cả hai quan điểm, sau đó nêu ý kiến cá nhân rõ ràng',
        explanationVi: 'Dạng Discuss Both Views: (1) đoạn View 1, (2) đoạn View 2, (3) ý kiến cá nhân rõ ràng trong Thesis Statement và kết luận.'
      },
      {
        questionId: 'w7t12_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Car-free days help raise _____ about the harmful effects of vehicle emissions on urban air quality."',
        correctAnswer: 'awareness',
        explanationVi: '"Raise awareness" = nâng cao nhận thức — cụm động từ phổ biến khi bàn về chiến dịch cộng đồng.'
      },
      {
        questionId: 'w7t12_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Ô nhiễm không khí là một trong những vấn đề nghiêm trọng nhất ở các thành phố lớn."',
        correctAnswer: 'Air pollution is one of the most serious problems in major cities.',
        modelAnswer: 'Air pollution is one of the most serious problems in major cities.',
        fallbackKeywords: ['air pollution', 'serious', 'major cities'],
        explanationVi: "'One of the most + adj + N' = một trong những... nhất. 'Major cities' = các thành phố lớn. Đây là câu mở bài phổ biến cho chủ đề ô nhiễm."
      },
      {
        questionId: 'w7t12_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Khí thải từ xe cộ là nguyên nhân chính gây ô nhiễm không khí."',
        correctAnswer: 'Exhaust fumes from vehicles are the main cause of air pollution.',
        modelAnswer: 'Exhaust fumes from vehicles are the main cause of air pollution.',
        fallbackKeywords: ['exhaust fumes', 'vehicles', 'air pollution', 'cause'],
        explanationVi: "'Exhaust fumes' = khói thải/khí thải từ xe. 'The main cause of' = nguyên nhân chính của. Số nhiều 'fumes' đi với động từ số nhiều 'are'."
      },
      {
        questionId: 'w7t12_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Xe điện đang trở thành lựa chọn thay thế thân thiện với môi trường hơn."',
        correctAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        modelAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        fallbackKeywords: ['electric vehicles', 'environmentally friendly', 'alternative'],
        explanationVi: "'Are becoming' = đang trở thành (Present Continuous nhấn mạnh xu hướng đang thay đổi). 'Environmentally friendly alternative' = lựa chọn thay thế thân thiện môi trường."
      },
      {
        questionId: 'w7t12_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Giao thông bền vững là giải pháp lâu dài cho các thành phố đông dân."',
        correctAnswer: 'Sustainable transportation is a long-term solution for densely populated cities.',
        modelAnswer: 'Sustainable transportation is a long-term solution for densely populated cities.',
        fallbackKeywords: ['sustainable transportation', 'long-term', 'cities'],
        explanationVi: "'Long-term solution' = giải pháp lâu dài. 'Densely populated cities' = các thành phố đông dân. Đây là lập luận quan trọng ủng hộ các giải pháp thay thế car-free days."
      },
      {
        questionId: 'w7t12_q07', level: 'elementary', orderIndex: 7,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"Car-free days is only one of the many ways to reduce air pollution in cities."',
        correctAnswer: 'Car-free days are only one of the many ways to reduce air pollution in cities.',
        modelAnswer: 'Car-free days are only one of the many ways to reduce air pollution in cities.',
        fallbackKeywords: ['car-free days', 'are', 'reduce', 'air pollution'],
        explanationVi: "Lỗi: \"Car-free days\" là danh từ số nhiều → dùng \"are\" không phải \"is\"."
      },
      {
        questionId: 'w7t12_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[an effective / Car-free days / raising / are / means / environmental awareness, / of / but / they / alone / long-term / cannot / solve / air pollution]',
        correctAnswer: 'Car-free days are an effective means of raising environmental awareness, but they alone cannot solve long-term air pollution.',
        explanationVi: '"means of + V-ing" = phương tiện để làm gì. "Alone" đứng sau chủ ngữ để nhấn mạnh.'
      },
      {
        questionId: 'w7t12_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều người cho rằng chính phủ nên tập trung vào công nghệ tiết kiệm năng lượng thay vì cấm ô tô."',
        correctAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        modelAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        fallbackKeywords: ['energy-efficient technology', 'government', 'rather than', 'banning cars'],
        explanationVi: "'Rather than + V-ing' = thay vì. 'Focus on + V-ing' = tập trung vào. 'Energy-efficient technology' = công nghệ tiết kiệm năng lượng — từ vựng học thuật quan trọng."
      },
      {
        questionId: 'w7t12_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: car-free days, effective, reduce, air pollution, better ways, tackle:\n\n"Some people think international car-free days are an effective way to reduce air pollution. Others believe there are better ways to tackle this issue."',
        correctAnswer: 'While some argue that designating vehicle-free days on a global scale can meaningfully curb urban emissions, others maintain that more lasting structural measures are required to genuinely combat this environmental challenge.',
        modelAnswer: 'While some argue that designating vehicle-free days on a global scale can meaningfully curb urban emissions, others maintain that more lasting structural measures are required to genuinely combat this environmental challenge.',
        fallbackKeywords: ['vehicle-free days', 'urban emissions', 'structural measures', 'environmental challenge', 'combat'],
        explanationVi: "Paraphrase tốt thay 'car-free days' → 'vehicle-free days', 'reduce' → 'curb', 'better ways' → 'structural measures'. 'Lasting' = lâu dài. 'Combat' = chống lại."
      },
      {
        questionId: 'w7t12_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng các giải pháp thay thế (như xe điện, giao thông công cộng, quy hoạch đô thị) hiệu quả hơn car-free days.\n\nGợi ý: electric vehicles / sustainable transportation / government policy / urban planning / pollution control',
        modelAnswer: 'While car-free days can raise environmental awareness, they are essentially a temporary measure that fails to address the underlying causes of air pollution. A more sustainable solution would involve long-term government policy changes, such as investing in electric vehicles and expanding public transportation networks. Urban planning that prioritises cycling lanes and pedestrian zones can permanently reduce reliance on private vehicles. Countries like Norway, which have heavily subsidised electric vehicles through tax incentives, have demonstrated that such strategies produce measurable, lasting improvements in air quality — far exceeding the impact of a single car-free day.',
        fallbackKeywords: ['electric vehicles', 'public transportation', 'government policy', 'urban planning', 'sustainable', 'air quality'],
        explanationVi: "Cấu trúc PEEL: trình bày View 2, giải thích tại sao alternatives hiệu quả hơn, đưa ví dụ cụ thể (EV, urban planning), kết luận view."
      },
      // ── QT-4 Intermediate (W7T2) ──
      {
        questionId: 'w7t12_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "car-free day"):\n\n"Nhiều người tin rằng các ngày không ô tô giúp giảm lượng khí thải ra môi trường."',
        correctAnswer: 'Many people believe that car-free days help reduce the amount of emissions released into the environment.',
        modelAnswer: 'Many people believe that car-free days help reduce the amount of emissions released into the environment.',
        fallbackKeywords: ['car-free day', 'reduce', 'emissions', 'environment'],
        explanationVi: "'Help + V (bare infinitive)' = giúp làm gì. 'Emissions released into the environment' = khí thải thải ra môi trường — cụm danh từ mở rộng."
      },
      {
        questionId: 'w7t12_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "exhaust fumes"):\n\n"Khí thải từ xe cộ là nguyên nhân chính gây ô nhiễm không khí."',
        correctAnswer: 'Exhaust fumes from vehicles are the primary cause of air pollution.',
        modelAnswer: 'Exhaust fumes from vehicles are the primary cause of air pollution.',
        fallbackKeywords: ['exhaust fumes', 'vehicles', 'primary cause', 'air pollution'],
        explanationVi: "'Exhaust fumes' là danh từ số nhiều, dùng 'are'. 'Primary cause' = nguyên nhân đầu tiên/chính (formal hơn 'main cause')."
      },
      {
        questionId: 'w7t12_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "traffic congestion"):\n\n"Các thành phố lớn thường đối mặt với tình trạng tắc nghẽn giao thông nghiêm trọng."',
        correctAnswer: 'Major cities frequently face severe traffic congestion.',
        modelAnswer: 'Major cities frequently face severe traffic congestion.',
        fallbackKeywords: ['traffic congestion', 'major cities', 'severe'],
        explanationVi: "'Frequently face' = thường xuyên đối mặt ('frequently' học thuật hơn 'often'). 'Severe traffic congestion' = tắc nghẽn giao thông nghiêm trọng."
      },
      {
        questionId: 'w7t12_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "electric vehicles"):\n\n"Xe điện đang trở thành lựa chọn thay thế thân thiện với môi trường hơn."',
        correctAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        modelAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        fallbackKeywords: ['electric vehicles', 'environmentally friendly', 'alternative'],
        explanationVi: "'Are becoming' = đang trở thành (Present Continuous nhấn mạnh xu hướng). 'Environmentally friendly alternative' = lựa chọn thân thiện với môi trường."
      },
      {
        questionId: 'w7t12_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "environmental campaign"):\n\n"Chính phủ nên khuyến khích người dân tham gia các chiến dịch bảo vệ môi trường."',
        correctAnswer: 'The government should encourage people to participate in environmental campaigns.',
        modelAnswer: 'The government should encourage people to participate in environmental campaigns.',
        fallbackKeywords: ['environmental campaign', 'encourage', 'participate'],
        explanationVi: "'Encourage + O + to V' = khuyến khích ai làm gì. 'Participate in' = tham gia (formal hơn 'join')."
      },
      {
        questionId: 'w7t12_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "vehicle restriction"):\n\n"Nhiều người cho rằng việc hạn chế phương tiện là cách hiệu quả để giảm ô nhiễm."',
        correctAnswer: 'Many people argue that vehicle restriction is an effective way to reduce pollution.',
        modelAnswer: 'Many people argue that vehicle restriction is an effective way to reduce pollution.',
        fallbackKeywords: ['vehicle restriction', 'effective', 'reduce pollution'],
        explanationVi: "'An effective way to + V' = cách hiệu quả để. 'Argue that' = cho rằng/lập luận rằng (chuẩn hơn 'think that' trong IELTS)."
      },
      {
        questionId: 'w7t12_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "fuel consumption"):\n\n"Việc giảm tiêu thụ nhiên liệu góp phần làm giảm lượng khí thải nhà kính."',
        correctAnswer: 'Reducing fuel consumption contributes to lowering greenhouse gas emissions.',
        modelAnswer: 'Reducing fuel consumption contributes to lowering greenhouse gas emissions.',
        fallbackKeywords: ['fuel consumption', 'reducing', 'greenhouse gas emissions'],
        explanationVi: "'Contribute to + V-ing' = góp phần vào việc (to là giới từ → sau là V-ing). 'Greenhouse gas emissions' = khí thải nhà kính."
      },
      {
        questionId: 'w7t12_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "awareness-raising activities"):\n\n"Các hoạt động nâng cao nhận thức giúp người dân hiểu rõ hơn về vấn đề môi trường."',
        correctAnswer: 'Awareness-raising activities help people better understand environmental issues.',
        modelAnswer: 'Awareness-raising activities help people better understand environmental issues.',
        fallbackKeywords: ['awareness-raising activities', 'understand', 'environmental issues'],
        explanationVi: "'Help + O + V (bare infinitive)' = giúp ai làm gì. 'Better understand' = hiểu rõ hơn. 'Awareness-raising' là tính từ ghép đứng trước danh từ."
      },
      {
        questionId: 'w7t12_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "energy-efficient technology"):\n\n"Nhiều người cho rằng chính phủ nên tập trung vào công nghệ tiết kiệm năng lượng thay vì cấm ô tô."',
        correctAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        modelAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        fallbackKeywords: ['energy-efficient technology', 'government', 'rather than', 'banning'],
        explanationVi: "'Rather than + V-ing' = thay vì làm gì. 'Focus on + V-ing' = tập trung vào. 'Energy-efficient technology' là cụm tính từ ghép, gạch nối giữa 'energy' và 'efficient'."
      },
      {
        questionId: 'w7t12_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "government policy"):\n\n"Chính sách của chính phủ đóng vai trò quan trọng trong việc kiểm soát ô nhiễm."',
        correctAnswer: 'Government policy plays a crucial role in controlling pollution.',
        modelAnswer: 'Government policy plays a crucial role in controlling pollution.',
        fallbackKeywords: ['government policy', 'crucial role', 'controlling pollution'],
        explanationVi: "'Play a crucial role in + V-ing' = đóng vai trò quan trọng trong việc. 'Crucial' = then chốt/quan trọng (stronger than 'important')."
      }
    ]
  },
  {
    week: 8, block: 'discuss_both_views', orderIndex: 13,
    topicName: 'Economic Growth vs. Environmental Protection', topicEmoji: '⚖️',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that economic development is more important than environmental protection. Others argue that protecting the environment should be prioritized. Discuss both views and give your own opinion.',
    hintAdvantages: ['economic growth reduces poverty and creates jobs', 'developing nations need industrial growth', 'technology will solve environmental problems'],
    hintDisadvantages: ['environmental damage is irreversible', 'overexploitation depletes natural resources', 'sustainable development balances both goals'],
    vocabularyList: [
      { term: 'economic development', definitionVi: 'phát triển kinh tế', example: 'Economic development improves living standards and reduces poverty.' },
      { term: 'environmental protection', definitionVi: 'bảo vệ môi trường', example: 'Environmental protection must be a global priority.' },
      { term: 'sustainable development', definitionVi: 'phát triển bền vững', example: 'Sustainable development balances growth with ecological responsibility.' },
      { term: 'industrialization', definitionVi: 'công nghiệp hóa', example: 'Rapid industrialization has transformed many developing economies.' },
      { term: 'economic growth', definitionVi: 'tăng trưởng kinh tế', example: 'Economic growth creates jobs and raises living standards.' },
      { term: 'poverty reduction', definitionVi: 'giảm nghèo', example: 'Poverty reduction is a key argument for prioritising economic growth.' },
      { term: 'job creation', definitionVi: 'tạo việc làm', example: 'Industrial projects boost job creation in developing countries.' },
      { term: 'environmental degradation', definitionVi: 'suy thoái môi trường', example: 'Rapid industrial development may lead to environmental degradation.' },
      { term: 'deforestation', definitionVi: 'nạn phá rừng', example: 'Deforestation for agriculture is destroying critical ecosystems.' },
      { term: 'natural resources', definitionVi: 'tài nguyên thiên nhiên', example: 'Overexploitation of natural resources causes long-term consequences for the planet.' },
      { term: 'overexploitation', definitionVi: 'khai thác quá mức', example: 'Overexploitation of forests and minerals threatens future generations.' },
      { term: 'renewable energy', definitionVi: 'năng lượng tái tạo', example: 'Investing in renewable energy allows growth without ecological damage.' },
      { term: 'eco-friendly policies', definitionVi: 'chính sách thân thiện môi trường', example: 'Eco-friendly policies can limit industrial pollution effectively.' },
      { term: 'long-term consequences', definitionVi: 'hậu quả lâu dài', example: 'Ignoring climate change will have devastating long-term consequences.' },
      { term: 'sustainable economy', definitionVi: 'nền kinh tế bền vững', example: 'A sustainable economy grows without depleting environmental resources.' }
    ],
    questions: [
      {
        questionId: 'w8t13_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Keyword nào trong đề bài xác định đây là dạng Discuss Both Views?',
        options: [
          'economic development',
          'environmental protection',
          'Discuss both views and give your own opinion',
          'more important than'
        ],
        correctAnswer: 'Discuss both views and give your own opinion',
        explanationVi: 'Cụm "Discuss both views" là dấu hiệu nhận biết trực tiếp. Các từ như "economic development" hay "environmental protection" chỉ là chủ đề, không phải dấu hiệu dạng bài.'
      },
      {
        questionId: 'w8t13_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều quốc gia đang tập trung vào phát triển kinh tế để nâng cao mức sống của người dân."',
        correctAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        modelAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        fallbackKeywords: ['economic development', 'countries', 'living standards', 'improve'],
        explanationVi: "'Focus on + V-ing/N' = tập trung vào. 'Living standards' = mức sống. 'To improve' = to-infinitive chỉ mục đích."
      },
      {
        questionId: 'w8t13_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người tin rằng giảm nghèo và tạo việc làm nên được ưu tiên hơn."',
        correctAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        modelAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        fallbackKeywords: ['poverty reduction', 'job creation', 'prioritized', 'believe'],
        explanationVi: "'Poverty reduction' = giảm nghèo (noun phrase). 'Job creation' = tạo việc làm. 'Should be prioritized' = nên được ưu tiên (passive voice)."
      },
      {
        questionId: 'w8t13_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Sự phát triển công nghiệp quá nhanh có thể dẫn đến suy thoái môi trường."',
        correctAnswer: 'Rapid industrial development may lead to environmental degradation.',
        modelAnswer: 'Rapid industrial development may lead to environmental degradation.',
        fallbackKeywords: ['industrial development', 'environmental degradation', 'rapid', 'lead to'],
        explanationVi: "'Lead to + N' = dẫn đến. 'Environmental degradation' = suy thoái môi trường. 'May' = có thể (modal nhấn mạnh khả năng)."
      },
      {
        questionId: 'w8t13_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc khai thác quá mức tài nguyên thiên nhiên gây ra những hậu quả lâu dài cho hành tinh."',
        correctAnswer: 'Overexploitation of natural resources causes long-term consequences for the planet.',
        modelAnswer: 'Overexploitation of natural resources causes long-term consequences for the planet.',
        fallbackKeywords: ['overexploitation', 'natural resources', 'long-term consequences', 'planet'],
        explanationVi: "'Overexploitation' = khai thác quá mức (danh từ). 'Long-term consequences' = hậu quả lâu dài. 'For the planet' = cho hành tinh."
      },
      {
        questionId: 'w8t13_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"Economic growth often goes hand in hand with environment pollution."',
        correctAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        modelAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        fallbackKeywords: ['economic growth', 'environmental pollution', 'hand in hand'],
        explanationVi: "Lỗi: \"environment pollution\" sai — phải dùng tính từ \"environmental\" + danh từ \"pollution\"."
      },
      {
        questionId: 'w8t13_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[short-term benefits / prioritize / Many businesses / while ignoring / only / the long-term consequences / economic / of / overexploitation]',
        correctAnswer: 'Many businesses only prioritize short-term benefits while ignoring the long-term consequences of economic overexploitation.',
        explanationVi: '"Prioritize short-term benefits while ignoring..." — cấu trúc đối lập dùng "while + V-ing".'
      },
      {
        questionId: 'w8t13_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Phát triển bền vững là cách duy nhất để cân bằng giữa tăng trưởng kinh tế và bảo vệ môi trường."',
        correctAnswer: 'Sustainable development is the only way to strike a balance between economic growth and environmental protection.',
        modelAnswer: 'Sustainable development is the only way to strike a balance between economic growth and environmental protection.',
        fallbackKeywords: ['sustainable development', 'balance', 'economic growth', 'environmental protection'],
        explanationVi: "'Strike a balance between A and B' = cân bằng giữa A và B (idiom học thuật). 'The only way to' = cách duy nhất để."
      },
      {
        questionId: 'w8t13_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Chính phủ nên ban hành chính sách thân thiện môi trường để hạn chế ô nhiễm."',
        correctAnswer: 'The government should introduce eco-friendly policies to limit pollution.',
        modelAnswer: 'The government should introduce eco-friendly policies to limit pollution.',
        fallbackKeywords: ['eco-friendly policies', 'government', 'pollution', 'limit'],
        explanationVi: "'Introduce policies' = ban hành/đưa ra chính sách (chuẩn hơn 'issue policies'). 'Eco-friendly' = thân thiện môi trường. 'Limit pollution' = hạn chế ô nhiễm."
      },
      {
        questionId: 'w8t13_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: economic development, more important, environmental protection, prioritized:\n\n"Some people believe that economic development is more important than environmental protection. Others argue that protecting the environment should be prioritized."',
        correctAnswer: 'Opinions are divided on whether financial growth and industrialization should take precedence over ecological conservation, or whether safeguarding the natural world ought to be society\'s primary concern.',
        modelAnswer: 'Opinions are divided on whether financial growth and industrialization should take precedence over ecological conservation, or whether safeguarding the natural world ought to be society\'s primary concern.',
        fallbackKeywords: ['financial growth', 'industrialization', 'ecological conservation', 'precedence', 'natural world'],
        explanationVi: "Paraphrase: 'economic development' → 'financial growth and industrialization', 'environmental protection' → 'ecological conservation', 'more important' → 'take precedence over'."
      },
      {
        questionId: 'w8t13_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng bảo vệ môi trường nên được ưu tiên hơn phát triển kinh tế.\n\nGợi ý: environmental degradation / long-term consequences / sustainable development / eco-friendly policies / climate change',
        modelAnswer: 'Those who advocate prioritising environmental protection over economic growth argue that the long-term consequences of environmental degradation far outweigh any short-term economic benefits. Unchecked industrialization leads to deforestation, carbon emissions, and irreversible climate change, which ultimately threaten the natural resources upon which all economic activity depends. For instance, the destruction of rainforests not only reduces biodiversity but also eliminates the carbon sinks that regulate global temperatures. Without eco-friendly policies and sustainable development strategies, short-term economic gains will come at the cost of a habitable planet for future generations.',
        fallbackKeywords: ['environmental degradation', 'long-term', 'climate change', 'sustainable development', 'eco-friendly', 'economic growth'],
        explanationVi: "Cấu trúc PEEL cho View 2: topic sentence → hai ví dụ cụ thể (deforestation, emissions) → hệ quả → kết luận. 'Imperative' = cấp bách, bắt buộc."
      },
      // ── QT-4 Intermediate (W7T3) ──
      {
        questionId: 'w8t13_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "economic development" và "living standards"):\n\n"Nhiều quốc gia đang tập trung vào phát triển kinh tế để nâng cao mức sống của người dân."',
        correctAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        modelAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        fallbackKeywords: ['economic development', 'improve', 'living standards'],
        explanationVi: "'Are focusing on + N' = đang tập trung vào. 'To improve + N' = để nâng cao (cụm mục đích). 'Living standards' = mức sống (thường dùng số nhiều)."
      },
      {
        questionId: 'w8t13_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "industrialization" và "environmental degradation"):\n\n"Sự phát triển công nghiệp quá nhanh có thể dẫn đến suy thoái môi trường."',
        correctAnswer: 'Rapid industrialization may lead to serious environmental degradation.',
        modelAnswer: 'Rapid industrialization may lead to serious environmental degradation.',
        fallbackKeywords: ['industrialization', 'rapid', 'environmental degradation'],
        explanationVi: "'Lead to + N/V-ing' = dẫn đến. 'Rapid industrialization' = công nghiệp hóa nhanh chóng. 'Environmental degradation' = suy thoái môi trường."
      },
      {
        questionId: 'w8t13_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "climate change" và "deforestation"):\n\n"Biến đổi khí hậu và phá rừng là hai hậu quả nghiêm trọng của sự phát triển thiếu kiểm soát."',
        correctAnswer: 'Climate change and deforestation are two serious consequences of uncontrolled development.',
        modelAnswer: 'Climate change and deforestation are two serious consequences of uncontrolled development.',
        fallbackKeywords: ['climate change', 'deforestation', 'uncontrolled development', 'consequences'],
        explanationVi: "'Consequences of + N' = hậu quả của. 'Uncontrolled development' = sự phát triển thiếu kiểm soát. Hai chủ ngữ dùng 'are' (số nhiều)."
      },
      {
        questionId: 'w8t13_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "economic growth" và "environmental pollution"):\n\n"Tăng trưởng kinh tế thường đi kèm với ô nhiễm môi trường."',
        correctAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        modelAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        fallbackKeywords: ['economic growth', 'hand in hand', 'environmental pollution'],
        explanationVi: "'Go hand in hand with' = đi đôi với/gắn liền với — thành ngữ học thuật. Chủ ngữ là 'Economic growth' (không đếm được) → động từ số ít 'goes'."
      },
      {
        questionId: 'w8t13_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "poverty reduction" và "job creation"):\n\n"Một số người tin rằng giảm nghèo và tạo việc làm nên được ưu tiên hơn."',
        correctAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        modelAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        fallbackKeywords: ['poverty reduction', 'job creation', 'prioritized'],
        explanationVi: "'Should be prioritized' = bị động, nên được ưu tiên. 'Poverty reduction' = giảm nghèo, 'job creation' = tạo việc làm — danh từ hóa từ động từ."
      },
      {
        questionId: 'w8t13_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "environmental protection"):\n\n"Trong khi đó, những người khác cho rằng bảo vệ môi trường là điều cần được đặt lên hàng đầu."',
        correctAnswer: 'Meanwhile, others argue that environmental protection should come first.',
        modelAnswer: 'Meanwhile, others argue that environmental protection should come first.',
        fallbackKeywords: ['environmental protection', 'others argue', 'come first'],
        explanationVi: "'Come first' = được ưu tiên/đặt lên hàng đầu. 'Meanwhile' = trong khi đó — transition word để đối lập quan điểm. 'Others argue that' = những người khác cho rằng."
      },
      {
        questionId: 'w8t13_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "overexploitation" và "long-term consequences"):\n\n"Việc khai thác quá mức tài nguyên thiên nhiên gây ra những hậu quả lâu dài cho hành tinh."',
        correctAnswer: 'The overexploitation of natural resources causes long-term consequences for the planet.',
        modelAnswer: 'The overexploitation of natural resources causes long-term consequences for the planet.',
        fallbackKeywords: ['overexploitation', 'natural resources', 'long-term consequences'],
        explanationVi: "'The overexploitation of + N' = sự khai thác quá mức về. 'Long-term consequences for' = hậu quả lâu dài cho. 'Causes' (số ít) vì chủ ngữ là 'overexploitation'."
      },
      {
        questionId: 'w8t13_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "short-term benefits" và "long-term consequences"):\n\n"Nhiều doanh nghiệp chỉ quan tâm đến lợi ích ngắn hạn mà bỏ qua hậu quả lâu dài."',
        correctAnswer: 'Many businesses focus only on short-term benefits while ignoring long-term consequences.',
        modelAnswer: 'Many businesses focus only on short-term benefits while ignoring long-term consequences.',
        fallbackKeywords: ['short-term benefits', 'long-term consequences', 'ignoring'],
        explanationVi: "'While + V-ing' = trong khi (đồng thời). 'Focus only on' = chỉ tập trung vào. 'Short-term' và 'long-term' là tính từ ghép có gạch nối."
      },
      {
        questionId: 'w8t13_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "balance between economy and environment"):\n\n"Việc cân bằng giữa kinh tế và môi trường là điều cần thiết để phát triển lâu dài."',
        correctAnswer: 'Maintaining a balance between economy and environment is essential for long-term development.',
        modelAnswer: 'Maintaining a balance between economy and environment is essential for long-term development.',
        fallbackKeywords: ['balance', 'economy', 'environment', 'essential', 'long-term'],
        explanationVi: "'Maintaining + N + is essential for' = duy trì điều gì là thiết yếu cho. Chủ ngữ là danh động từ 'Maintaining' → động từ số ít 'is'."
      },
      {
        questionId: 'w8t13_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "environmental awareness"):\n\n"Việc nâng cao nhận thức về môi trường có thể giúp người dân thay đổi hành vi tiêu dùng."',
        correctAnswer: 'Raising environmental awareness can help people change their consumption behaviour.',
        modelAnswer: 'Raising environmental awareness can help people change their consumption behaviour.',
        fallbackKeywords: ['environmental awareness', 'raising', 'consumption behaviour'],
        explanationVi: "'Raising + N + can help + O + V' = nâng cao điều gì có thể giúp ai thay đổi. 'Consumption behaviour' = hành vi tiêu dùng (BrE: behaviour)."
      }
    ]
  },

  // ─── BLOCK 5: Week 9-12 — Mixed Review ───
  {
    week: 9, block: 'mixed', orderIndex: 14,
    topicName: 'Public vs. Private Healthcare', topicEmoji: '🏥',
    essayType: 'advantages_disadvantages',
    prompt: 'Some people think that good health is a basic human right, so medical services should not be run by profit-making companies. Do the disadvantages of private healthcare outweigh the advantages?',
    hintAdvantages: ['high quality care', 'shorter waiting times', 'drives medical innovation'],
    hintDisadvantages: ['unaffordable for low-income patients', 'profit over patient welfare', 'widens healthcare inequality'],
    vocabularyList: [
      { term: 'healthcare system', definitionVi: 'hệ thống y tế', example: 'A well-funded healthcare system benefits the entire population.' },
      { term: 'public healthcare', definitionVi: 'y tế công', example: 'Public healthcare ensures that all citizens receive medical treatment regardless of income.' },
      { term: 'private healthcare', definitionVi: 'y tế tư nhân', example: 'Private healthcare often offers shorter waiting times and superior facilities.' },
      { term: 'profit-making companies', definitionVi: 'các công ty vì lợi nhuận', example: 'Profit-making companies may prioritise revenue over patient welfare.' },
      { term: 'basic human right', definitionVi: 'quyền cơ bản của con người', example: 'Access to healthcare is widely regarded as a basic human right.' },
      { term: 'universal healthcare', definitionVi: 'chăm sóc y tế toàn dân', example: 'Universal healthcare ensures no one is denied treatment due to financial constraints.' },
      { term: 'health insurance', definitionVi: 'bảo hiểm y tế', example: 'Health insurance plays an important role in reducing the financial burden of illness.' },
      { term: 'medical expenses', definitionVi: 'chi phí y tế', example: 'High medical expenses prevent many people from seeking treatment.' },
      { term: 'healthcare inequality', definitionVi: 'bất bình đẳng y tế', example: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.' },
      { term: 'access to healthcare', definitionVi: 'tiếp cận dịch vụ y tế', example: 'Equal access to healthcare should be guaranteed by the government.' },
      { term: 'financial burden', definitionVi: 'gánh nặng tài chính', example: 'Health insurance reduces the financial burden on individuals and families.' },
      { term: 'affordable healthcare', definitionVi: 'y tế giá cả phải chăng', example: 'The government should ensure all citizens have access to affordable healthcare.' },
      { term: 'privatization of healthcare', definitionVi: 'tư nhân hóa ngành y tế', example: 'The privatization of healthcare remains a controversial policy in many countries.' },
      { term: 'profit-driven motives', definitionVi: 'động cơ vì lợi nhuận', example: 'Profit-driven motives in medicine can compromise ethical standards of care.' },
      { term: 'medical innovation', definitionVi: 'đổi mới y tế', example: 'Competition in the private sector can stimulate medical innovation.' }
    ],
    questions: [
      {
        questionId: 'w9t14_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài hỏi "Do the disadvantages of private healthcare outweigh the advantages?" — điều này có nghĩa là gì?',
        options: [
          'Bạn chỉ nêu nhược điểm của y tế tư nhân',
          'Bạn đưa ra ý kiến về việc nhược điểm có lớn hơn ưu điểm không',
          'Bạn thảo luận nguyên nhân và giải pháp của vấn đề y tế',
          'Bạn chỉ nêu ưu điểm của y tế tư nhân'
        ],
        correctAnswer: 'Bạn đưa ra ý kiến về việc nhược điểm có lớn hơn ưu điểm không',
        explanationVi: '"Outweigh" = vượt trội hơn. Dạng này là biến thể của Adv/Disadv, yêu cầu lập luận rõ ràng mặt nào nhiều hơn và đưa ra kết luận cá nhân.'
      },
      {
        questionId: 'w9t14_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Many people believe that good health is a _____ human right that should not depend on one\'s ability to pay."',
        correctAnswer: 'basic',
        explanationVi: '"Basic human right" = quyền cơ bản của con người — cụm danh từ quan trọng trong IELTS chủ đề y tế và xã hội.'
      },
      {
        questionId: 'w9t14_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Chính phủ nên cung cấp dịch vụ y tế miễn phí cho tất cả công dân."',
        correctAnswer: 'The government should provide free medical treatment for all citizens.',
        modelAnswer: 'The government should provide free medical treatment for all citizens.',
        fallbackKeywords: ['government', 'free medical treatment', 'citizens', 'provide'],
        explanationVi: "'Provide + N + for + N' = cung cấp gì cho ai. 'Free medical treatment' = dịch vụ y tế miễn phí. 'All citizens' = tất cả công dân."
      },
      {
        questionId: 'w9t14_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các công ty vì lợi nhuận thường đặt lợi ích tài chính lên trên bệnh nhân."',
        correctAnswer: 'Profit-making companies often put financial gain above patient welfare.',
        modelAnswer: 'Profit-making companies often put financial gain above patient welfare.',
        fallbackKeywords: ['profit-making companies', 'financial gain', 'patient welfare'],
        explanationVi: "'Put A above B' = đặt A lên trên B. 'Financial gain' = lợi ích tài chính. 'Patient welfare' = sức khỏe/phúc lợi bệnh nhân — từ vựng học thuật quan trọng."
      },
      {
        questionId: 'w9t14_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Tư nhân hóa ngành y tế có thể làm gia tăng bất bình đẳng giữa người giàu và người nghèo."',
        correctAnswer: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.',
        modelAnswer: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.',
        fallbackKeywords: ['privatization', 'healthcare inequality', 'rich', 'poor'],
        explanationVi: "'Privatization of healthcare' = tư nhân hóa ngành y tế. 'May increase' = có thể làm gia tăng. 'Between the rich and the poor' = giữa người giàu và người nghèo."
      },
      {
        questionId: 'w9t14_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Bảo hiểm y tế đóng vai trò quan trọng trong việc giảm gánh nặng tài chính."',
        correctAnswer: 'Health insurance plays an important role in reducing the financial burden.',
        modelAnswer: 'Health insurance plays an important role in reducing the financial burden.',
        fallbackKeywords: ['health insurance', 'financial burden', 'reducing', 'important'],
        explanationVi: "'Play an important role in + V-ing' = đóng vai trò quan trọng trong việc. 'Financial burden' = gánh nặng tài chính. Cấu trúc này rất phổ biến trong IELTS."
      },
      {
        questionId: 'w9t14_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[profit-driven / While / can / private healthcare / motives / medical innovation, / encourage / they / may / also / compromise / patient care / and / medical ethics]',
        correctAnswer: 'While private healthcare can encourage medical innovation, profit-driven motives may also compromise patient care and medical ethics.',
        explanationVi: '"While + clause, + clause" — cấu trúc đối lập. "Compromise" = làm ảnh hưởng tiêu cực đến.'
      },
      {
        questionId: 'w9t14_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"The government should ensures that all citizens have access to affordable healthcare."',
        correctAnswer: 'The government should ensure that all citizens have access to affordable healthcare.',
        modelAnswer: 'The government should ensure that all citizens have access to affordable healthcare.',
        fallbackKeywords: ['government', 'ensure', 'affordable healthcare', 'citizens'],
        explanationVi: "Lỗi: Sau \"should\" dùng V nguyên thể (bare infinitive). \"Ensures\" → \"ensure\"."
      },
      {
        questionId: 'w9t14_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Mục tiêu cuối cùng của ngành y tế nên là thu hẹp khoảng cách tiếp cận y tế, không phải tạo ra lợi nhuận."',
        correctAnswer: 'The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.',
        modelAnswer: 'The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.',
        fallbackKeywords: ['healthcare access gap', 'ultimate goal', 'profit', 'generate'],
        explanationVi: "'The ultimate goal' = mục tiêu cuối cùng. 'Close the gap' = thu hẹp khoảng cách. 'Generate profit' = tạo ra lợi nhuận. Cấu trúc 'not to + V' = không phải để làm gì."
      },
      {
        questionId: 'w9t14_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: good health, basic human right, medical services, profit-making companies:\n\n"Some people think that good health is a basic human right, so medical services should not be run by profit-making companies."',
        correctAnswer: 'There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.',
        modelAnswer: 'There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.',
        fallbackKeywords: ['medical care', 'fundamental entitlement', 'commercial interests', 'delivery', 'services'],
        explanationVi: "Paraphrase: 'basic human right' → 'fundamental entitlement', 'profit-making' → 'commercial interests', 'run by' → 'driven by'. 'As such' = do đó, vì vậy."
      },
      {
        questionId: 'w9t14_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng nhược điểm của y tế tư nhân VƯỢT TRỘI hơn ưu điểm.\n\nGợi ý: healthcare inequality / financial burden / access to healthcare / profit-driven motives / patient care',
        modelAnswer: 'Despite the advantages of private healthcare, such as shorter waiting times and higher-quality equipment, its disadvantages are far more significant. The most critical concern is healthcare inequality: when medical services are run by profit-making companies, access becomes dependent on financial ability rather than medical need. This leaves low-income individuals without essential medical services, widening the gap between the wealthy and the poor. Moreover, profit-driven motives can compromise medical ethics, as providers may recommend unnecessary procedures to maximise revenue. For these reasons, the financial burden placed on ordinary patients makes the disadvantages of private healthcare outweigh its benefits.',
        fallbackKeywords: ['healthcare inequality', 'financial burden', 'profit-driven', 'access', 'medical ethics', 'patient'],
        explanationVi: "Đoạn 'outweigh' phải: nêu lập trường rõ ràng → lý do chính (profit over patients) → hệ quả cụ thể (inequality, denied access) → kết luận khẳng định."
      },
      // ── QT-4 Intermediate (W9T4) ──
      {
        questionId: 'w9t14_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "basic human right"):\n\n"Nhiều người tin rằng sức khỏe tốt là quyền cơ bản của con người."',
        correctAnswer: 'Many people believe that good health is a basic human right.',
        modelAnswer: 'Many people believe that good health is a basic human right.',
        fallbackKeywords: ['basic human right', 'good health', 'believe'],
        explanationVi: "'A basic human right' = quyền cơ bản của con người (có mạo từ 'a'). 'Believe that + clause' = tin rằng."
      },
      {
        questionId: 'w9t14_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "free medical treatment"):\n\n"Chính phủ nên cung cấp dịch vụ y tế miễn phí cho tất cả công dân."',
        correctAnswer: 'The government should provide free medical treatment for all citizens.',
        modelAnswer: 'The government should provide free medical treatment for all citizens.',
        fallbackKeywords: ['free medical treatment', 'government', 'all citizens'],
        explanationVi: "'Provide + N + for + N' = cung cấp điều gì cho ai. 'All citizens' = tất cả công dân (không cần 'the')."
      },
      {
        questionId: 'w9t14_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "private healthcare"):\n\n"Một số người cho rằng ngành y tế tư nhân có thể mang lại dịch vụ chất lượng cao hơn."',
        correctAnswer: 'Some people argue that private healthcare can provide higher-quality services.',
        modelAnswer: 'Some people argue that private healthcare can provide higher-quality services.',
        fallbackKeywords: ['private healthcare', 'higher-quality', 'services'],
        explanationVi: "'Higher-quality' là tính từ so sánh hơn ghép với gạch nối. 'Argue that' = lập luận rằng (academic hơn 'think that')."
      },
      {
        questionId: 'w9t14_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "profit-making companies"):\n\n"Tuy nhiên, các công ty vì lợi nhuận thường đặt lợi ích tài chính lên trên bệnh nhân."',
        correctAnswer: 'However, profit-making companies often put financial gain above patient welfare.',
        modelAnswer: 'However, profit-making companies often put financial gain above patient welfare.',
        fallbackKeywords: ['profit-making companies', 'financial gain', 'patient welfare'],
        explanationVi: "'Put A above B' = đặt A lên trên B. 'Financial gain' = lợi ích tài chính. 'Patient welfare' = phúc lợi bệnh nhân. 'However' dùng dấu phẩy sau."
      },
      {
        questionId: 'w9t14_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "public healthcare system"):\n\n"Hệ thống y tế công giúp đảm bảo mọi người đều có thể tiếp cận dịch vụ y tế cơ bản."',
        correctAnswer: 'The public healthcare system helps ensure that everyone can access basic medical services.',
        modelAnswer: 'The public healthcare system helps ensure that everyone can access basic medical services.',
        fallbackKeywords: ['public healthcare system', 'ensure', 'access', 'basic medical services'],
        explanationVi: "'Helps ensure that' = giúp đảm bảo rằng. 'Can access + N' = có thể tiếp cận. 'Basic medical services' = dịch vụ y tế cơ bản."
      },
      {
        questionId: 'w9t14_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "medical expenses"):\n\n"Ở nhiều quốc gia, chi phí y tế quá cao khiến người nghèo không thể điều trị bệnh."',
        correctAnswer: 'In many countries, excessively high medical expenses prevent poor people from receiving treatment.',
        modelAnswer: 'In many countries, excessively high medical expenses prevent poor people from receiving treatment.',
        fallbackKeywords: ['medical expenses', 'high', 'prevent', 'treatment'],
        explanationVi: "'Prevent + O + from + V-ing' = ngăn ai làm gì. 'Excessively high' = quá cao. 'Receiving treatment' = được điều trị/nhận điều trị."
      },
      {
        questionId: 'w9t14_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "privatization of healthcare"):\n\n"Tư nhân hóa ngành y tế có thể làm gia tăng bất bình đẳng giữa người giàu và người nghèo."',
        correctAnswer: 'The privatization of healthcare may increase inequality between the rich and the poor.',
        modelAnswer: 'The privatization of healthcare may increase inequality between the rich and the poor.',
        fallbackKeywords: ['privatization of healthcare', 'inequality', 'rich', 'poor'],
        explanationVi: "'The privatization of + N' = sự tư nhân hóa của. 'Between the rich and the poor' = giữa người giàu và người nghèo. 'May increase' = có thể làm tăng."
      },
      {
        questionId: 'w9t14_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "government funding"):\n\n"Hệ thống y tế công cộng cần nhiều đầu tư của chính phủ để duy trì hoạt động hiệu quả."',
        correctAnswer: 'The public healthcare system requires significant government funding to function effectively.',
        modelAnswer: 'The public healthcare system requires significant government funding to function effectively.',
        fallbackKeywords: ['government funding', 'public healthcare', 'function effectively'],
        explanationVi: "'Require + N + to V' = cần điều gì để làm gì. 'Significant government funding' = đầu tư đáng kể từ chính phủ. 'Function effectively' = hoạt động hiệu quả."
      },
      {
        questionId: 'w9t14_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "healthcare infrastructure" và "life expectancy"):\n\n"Cải thiện cơ sở hạ tầng y tế là yếu tố thiết yếu để nâng cao tuổi thọ."',
        correctAnswer: 'Improving healthcare infrastructure is essential to increase life expectancy.',
        modelAnswer: 'Improving healthcare infrastructure is essential to increase life expectancy.',
        fallbackKeywords: ['healthcare infrastructure', 'essential', 'life expectancy'],
        explanationVi: "'Improving + N + is essential to + V' = cải thiện điều gì là thiết yếu để. 'Life expectancy' = tuổi thọ trung bình — danh từ không đếm được."
      },
      {
        questionId: 'w9t14_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "affordable healthcare"):\n\n"Đảm bảo dịch vụ y tế có chi phí hợp lý là cách để đạt được công bằng xã hội."',
        correctAnswer: 'Ensuring affordable healthcare is a way to achieve social equality.',
        modelAnswer: 'Ensuring affordable healthcare is a way to achieve social equality.',
        fallbackKeywords: ['affordable healthcare', 'social equality', 'ensuring'],
        explanationVi: "'Ensuring + N + is a way to + V' = đảm bảo điều gì là cách để. 'Affordable healthcare' = dịch vụ y tế có giá phải chăng. 'Social equality' = bình đẳng xã hội."
      }
    ]
  },
  {
    week: 9, block: 'mixed', orderIndex: 15,
    topicName: 'Consumerism and Society', topicEmoji: '🛍️',
    essayType: 'agree_disagree',
    prompt: 'People today are buying more consumer goods than ever before. Is this a positive or negative development?',
    hintAdvantages: ['stimulates economic growth', 'creates jobs', 'improves living standards and quality of life'],
    hintDisadvantages: ['generates excessive waste', 'depletes natural resources', 'encourages throwaway culture and overconsumption'],
    vocabularyList: [
      { term: 'consumer goods', definitionVi: 'hàng hóa tiêu dùng', example: 'The demand for consumer goods has surged in recent decades.' },
      { term: 'consumerism', definitionVi: 'chủ nghĩa tiêu dùng', example: 'Consumerism drives economic growth but also leads to environmental damage.' },
      { term: 'disposable income', definitionVi: 'thu nhập khả dụng', example: 'Rising disposable income has fuelled consumer spending worldwide.' },
      { term: 'advertising campaigns', definitionVi: 'chiến dịch quảng cáo', example: 'Powerful advertising campaigns persuade people to buy things they do not need.' },
      { term: 'online shopping', definitionVi: 'mua sắm trực tuyến', example: 'The rise of online shopping has made it easier to purchase goods from around the world.' },
      { term: 'throwaway culture', definitionVi: 'văn hóa vứt bỏ', example: 'Mass production has given rise to a throwaway culture of disposable products.' },
      { term: 'overconsumption', definitionVi: 'tiêu dùng quá mức', example: 'Overconsumption of resources is one of the main drivers of environmental degradation.' },
      { term: 'environmental impact', definitionVi: 'tác động môi trường', example: 'The environmental impact of excessive shopping is considerable.' },
      { term: 'waste generation', definitionVi: 'phát sinh rác thải', example: 'Waste generation has increased dramatically alongside rising consumerism.' },
      { term: 'status symbol', definitionVi: 'biểu tượng địa vị', example: 'Luxury goods are often purchased as a status symbol rather than for their utility.' },
      { term: 'impulsive buying', definitionVi: 'mua hàng bốc đồng', example: 'Impulsive buying leads to personal financial debt and unnecessary waste.' },
      { term: 'sustainable consumption', definitionVi: 'tiêu dùng bền vững', example: 'Governments should promote sustainable consumption through awareness campaigns.' },
      { term: 'overproduction', definitionVi: 'sản xuất thừa', example: 'Overproduction of cheap goods contributes to landfill and resource depletion.' },
      { term: 'financial debt', definitionVi: 'nợ tài chính', example: 'Excessive shopping can lead individuals into serious financial debt.' },
      { term: 'quality of life', definitionVi: 'chất lượng cuộc sống', example: 'Access to consumer goods can improve quality of life when used responsibly.' }
    ],
    questions: [
      {
        questionId: 'w9t15_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài hỏi "Is this a positive or negative development?" — điều này yêu cầu gì?',
        options: [
          'Thảo luận cả hai quan điểm mà không cần đưa ra ý kiến cá nhân',
          'Đưa ra ý kiến rõ ràng rằng đây là phát triển tích cực, tiêu cực, hoặc cả hai — và bảo vệ quan điểm đó',
          'Chỉ nêu nguyên nhân của xu hướng',
          'So sánh hai xu hướng khác nhau'
        ],
        correctAnswer: 'Đưa ra ý kiến rõ ràng rằng đây là phát triển tích cực, tiêu cực, hoặc cả hai — và bảo vệ quan điểm đó',
        explanationVi: 'Dạng "positive or negative development" = dạng Opinion Essay. PHẢI đưa ra lập trường rõ ràng ngay từ Introduction và duy trì nhất quán toàn bài.'
      },
      {
        questionId: 'w9t15_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"The rise of _____ shopping has made it easier than ever for people to buy goods from around the world."',
        correctAnswer: 'online',
        explanationVi: '"Online shopping" = mua sắm trực tuyến — từ khóa trọng tâm khi bàn về xu hướng tiêu dùng hiện đại.'
      },
      {
        questionId: 'w9t15_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Ngày nay, con người mua nhiều hàng hóa tiêu dùng hơn bao giờ hết."',
        correctAnswer: 'People today are purchasing more consumer goods than ever before.',
        modelAnswer: 'People today are purchasing more consumer goods than ever before.',
        fallbackKeywords: ['consumer goods', 'purchasing', 'ever before'],
        explanationVi: "'More... than ever before' = nhiều hơn bao giờ hết — cụm so sánh nhấn mạnh xu hướng ngày càng tăng. 'Consumer goods' = hàng hóa tiêu dùng."
      },
      {
        questionId: 'w9t15_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Chiến dịch quảng cáo mạnh mẽ khiến mọi người mua những thứ họ không thực sự cần."',
        correctAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        modelAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        fallbackKeywords: ['advertising campaigns', 'people', 'need', 'buy'],
        explanationVi: "'Lead + O + to V' = khiến ai làm gì (causative). 'Do not actually need' = không thực sự cần. 'Advertising campaigns' = chiến dịch quảng cáo."
      },
      {
        questionId: 'w9t15_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều sản phẩm được sản xuất hàng loạt, tạo nên văn hóa vứt bỏ."',
        correctAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        modelAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        fallbackKeywords: ['mass-produced', 'throwaway culture', 'products'],
        explanationVi: "'Mass-produced' = được sản xuất hàng loạt (adjective). 'Give rise to' = tạo ra, dẫn đến. 'Throwaway culture' = văn hóa vứt bỏ — từ vựng học thuật quan trọng."
      },
      {
        questionId: 'w9t15_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc mua hàng bốc đồng dẫn đến nợ tài chính cá nhân."',
        correctAnswer: 'Impulsive buying leads to personal financial debt.',
        modelAnswer: 'Impulsive buying leads to personal financial debt.',
        fallbackKeywords: ['impulsive buying', 'financial debt', 'personal'],
        explanationVi: "'Impulsive buying' = mua hàng bốc đồng (không có kế hoạch). 'Lead to + N' = dẫn đến. 'Financial debt' = nợ tài chính."
      },
      {
        questionId: 'w9t15_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[a throwaway culture / Mass production / and / has / consumerism / of / encouraged / overconsumption, / leading / and / environmental damage / to / significant]',
        correctAnswer: 'Mass production and consumerism has encouraged a throwaway culture of overconsumption, leading to significant environmental damage.',
        explanationVi: '"Leading to + noun" = dẫn đến — cụm phổ biến trong IELTS. "Throwaway culture of overconsumption" = văn hóa tiêu thụ vứt bỏ.'
      },
      {
        questionId: 'w9t15_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"Although buying more goods can stimulate the economy, but it also creates enormous amounts of waste."',
        correctAnswer: 'Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.',
        modelAnswer: 'Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.',
        fallbackKeywords: ['although', 'stimulate', 'economy', 'waste', 'enormous'],
        explanationVi: "Lỗi: Không dùng \"Although\" và \"but\" cùng lúc. Dùng một trong hai: \"Although...\" hoặc \"..., but...\""
      },
      {
        questionId: 'w9t15_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Chính phủ nên khuyến khích tiêu dùng bền vững thông qua các chiến dịch nâng cao nhận thức."',
        correctAnswer: 'The government should encourage sustainable consumption through awareness-raising campaigns.',
        modelAnswer: 'The government should encourage sustainable consumption through awareness-raising campaigns.',
        fallbackKeywords: ['sustainable consumption', 'government', 'awareness-raising', 'campaigns'],
        explanationVi: "'Sustainable consumption' = tiêu dùng bền vững. 'Awareness-raising campaigns' = chiến dịch nâng cao nhận thức (compound adjective). 'Through' = thông qua."
      },
      {
        questionId: 'w9t15_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: people, buying, consumer goods, positive or negative:\n\n"People today are buying more consumer goods than ever before. Is this a positive or negative development?"',
        correctAnswer: 'Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.',
        modelAnswer: 'Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.',
        fallbackKeywords: ['contemporary society', 'manufactured products', 'beneficial', 'detrimental', 'consumption'],
        explanationVi: "Paraphrase mở bài: 'people today' → 'contemporary society', 'more than ever before' → 'unprecedented surge', 'positive or negative' → 'beneficial or detrimental'. Tách thành 2 câu."
      },
      {
        questionId: 'w9t15_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng việc mua sắm quá nhiều là một xu hướng TIÊU CỰC.\n\nGợi ý: throwaway culture / overconsumption / environmental impact / waste generation / sustainable consumption',
        modelAnswer: 'The rapid growth of consumerism is largely a negative development, primarily due to its devastating environmental impact. Mass production to meet ever-increasing demand contributes to overconsumption, generating enormous quantities of waste that overwhelm landfills and pollute natural ecosystems. The throwaway culture encouraged by affordable, disposable goods means that products are discarded long before the end of their useful life, further depleting natural resources. Moreover, impulsive buying fuelled by aggressive marketing strategies leads to personal financial debt. Unless governments actively promote sustainable consumption through stricter regulations and public awareness campaigns, this trend will continue to erode environmental sustainability.',
        fallbackKeywords: ['overconsumption', 'environmental impact', 'waste', 'throwaway culture', 'sustainable consumption', 'consumerism'],
        explanationVi: "Opinion essay cần: lập trường rõ ràng → lý do chính (environmental impact) → ví dụ (mass production, advertising) → kết luận kêu gọi hành động."
      },
      // ── QT-4 Intermediate (W9T5) ──
      {
        questionId: 'w9t15_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "consumer goods"):\n\n"Ngày nay, con người mua nhiều hàng hóa tiêu dùng hơn bao giờ hết."',
        correctAnswer: 'People today are purchasing more consumer goods than ever before.',
        modelAnswer: 'People today are purchasing more consumer goods than ever before.',
        fallbackKeywords: ['consumer goods', 'purchasing', 'more than ever'],
        explanationVi: "'More than ever before' = hơn bao giờ hết. 'Are purchasing' nhấn mạnh xu hướng hiện tại. 'Consumer goods' = hàng hóa tiêu dùng."
      },
      {
        questionId: 'w9t15_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "disposable income"):\n\n"Mức sống được cải thiện dẫn đến thu nhập khả dụng cao hơn."',
        correctAnswer: 'An improved standard of living leads to higher disposable income.',
        modelAnswer: 'An improved standard of living leads to higher disposable income.',
        fallbackKeywords: ['disposable income', 'standard of living', 'improved'],
        explanationVi: "'Lead to + N' = dẫn đến. 'An improved standard of living' = mức sống được cải thiện (dùng 'An' vì 'improved' bắt đầu bằng nguyên âm). 'Disposable income' = thu nhập khả dụng."
      },
      {
        questionId: 'w9t15_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "advertising campaigns"):\n\n"Chiến dịch quảng cáo mạnh mẽ khiến mọi người mua những thứ họ không thực sự cần."',
        correctAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        modelAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        fallbackKeywords: ['advertising campaigns', 'powerful', 'do not need'],
        explanationVi: "'Lead + O + to V' = khiến ai làm gì. 'Do not actually need' = không thực sự cần. 'Powerful advertising campaigns' = chiến dịch quảng cáo mạnh mẽ."
      },
      {
        questionId: 'w9t15_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "online shopping"):\n\n"Mua sắm trực tuyến giúp việc tiêu dùng trở nên dễ dàng và nhanh chóng hơn."',
        correctAnswer: 'Online shopping makes consumption easier and faster than ever.',
        modelAnswer: 'Online shopping makes consumption easier and faster than ever.',
        fallbackKeywords: ['online shopping', 'consumption', 'easier', 'faster'],
        explanationVi: "'Make + N + adjective' = khiến điều gì trở nên... Hai tính từ so sánh 'easier and faster' song song. 'Than ever' = hơn bao giờ hết."
      },
      {
        questionId: 'w9t15_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "overconsumption" và "environmental impact"):\n\n"Tuy nhiên, tiêu thụ quá mức có thể gây ra nhiều tác động tiêu cực đến môi trường."',
        correctAnswer: 'However, overconsumption can cause significant negative environmental impact.',
        modelAnswer: 'However, overconsumption can cause significant negative environmental impact.',
        fallbackKeywords: ['overconsumption', 'environmental impact', 'negative'],
        explanationVi: "'Cause + N' = gây ra. 'Significant negative environmental impact' = tác động tiêu cực đáng kể đến môi trường. Thứ tự tính từ: opinion → purpose noun."
      },
      {
        questionId: 'w9t15_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "mass production" và "throwaway culture"):\n\n"Nhiều sản phẩm được sản xuất hàng loạt, tạo nên văn hóa vứt bỏ."',
        correctAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        modelAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        fallbackKeywords: ['mass production', 'throwaway culture', 'giving rise to'],
        explanationVi: "'Are mass-produced' = bị động. 'Giving rise to' = tạo ra/dẫn đến (participial phrase). 'Throwaway culture' = văn hóa tiêu dùng một lần rồi bỏ."
      },
      {
        questionId: 'w9t15_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "impulsive buying" và "financial debt"):\n\n"Việc mua hàng bốc đồng dẫn đến nợ tài chính cá nhân."',
        correctAnswer: 'Impulsive buying leads to personal financial debt.',
        modelAnswer: 'Impulsive buying leads to personal financial debt.',
        fallbackKeywords: ['impulsive buying', 'financial debt', 'personal'],
        explanationVi: "'Lead to + N' = dẫn đến. 'Impulsive buying' = hành vi mua hàng bốc đồng. 'Personal financial debt' = nợ tài chính cá nhân."
      },
      {
        questionId: 'w9t15_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "economic inequality"):\n\n"Tuy nhiên, việc tiêu dùng quá mức làm gia tăng bất bình đẳng kinh tế giữa người giàu và người nghèo."',
        correctAnswer: 'However, overconsumption widens economic inequality between the rich and the poor.',
        modelAnswer: 'However, overconsumption widens economic inequality between the rich and the poor.',
        fallbackKeywords: ['economic inequality', 'overconsumption', 'widens'],
        explanationVi: "'Widens + N' = làm rộng thêm/gia tăng (gap/inequality thường đi với 'widen'). 'Between the rich and the poor' = giữa người giàu và người nghèo."
      },
      {
        questionId: 'w9t15_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "recycling programs" và "second-hand goods"):\n\n"Để giảm lãng phí, mọi người nên tham gia chương trình tái chế hoặc mua hàng đã qua sử dụng."',
        correctAnswer: 'To reduce waste, people should participate in recycling programs or purchase second-hand goods.',
        modelAnswer: 'To reduce waste, people should participate in recycling programs or purchase second-hand goods.',
        fallbackKeywords: ['recycling programs', 'second-hand goods', 'reduce waste'],
        explanationVi: "'To reduce waste' = infinitive of purpose đứng đầu câu. 'Participate in' = tham gia. 'Second-hand goods' = hàng đã qua sử dụng (có gạch nối)."
      },
      {
        questionId: 'w9t15_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "waste generation"):\n\n"Nếu xu hướng tiêu dùng tiếp tục tăng, lượng rác thải toàn cầu sẽ vượt kiểm soát."',
        correctAnswer: 'If consumption trends continue to rise, global waste generation will spiral out of control.',
        modelAnswer: 'If consumption trends continue to rise, global waste generation will spiral out of control.',
        fallbackKeywords: ['waste generation', 'consumption trends', 'spiral out of control'],
        explanationVi: "'Spiral out of control' = mất kiểm soát/vượt tầm kiểm soát (idiom học thuật). Câu điều kiện loại 1: If + present, will + V."
      }
    ]
  },
  {
    week: 10, block: 'mixed', orderIndex: 16,
    topicName: 'Government Funding for the Arts', topicEmoji: '🎨',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that the government should spend money on supporting the arts, while others think it should be spent on more important things. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'government funding', definitionVi: 'tài trợ của chính phủ', example: 'Government funding for the arts supports cultural development.' },
      { term: 'allocate budget', definitionVi: 'phân bổ ngân sách', example: 'The government must allocate its budget wisely to meet all social needs.' },
      { term: 'public money', definitionVi: 'tiền thuế công', example: 'Critics argue that public money should be spent on essential services.' },
      { term: 'essential services', definitionVi: 'dịch vụ thiết yếu', example: 'Healthcare and education are among the most essential services.' },
      { term: 'taxpayers', definitionVi: 'người đóng thuế', example: 'Taxpayers expect their money to be invested in practical needs.' },
      { term: 'cultural identity', definitionVi: 'bản sắc văn hóa', example: 'The arts play a vital role in maintaining cultural identity.' },
      { term: 'preserve heritage', definitionVi: 'bảo tồn di sản', example: 'Governments have a duty to preserve heritage for future generations.' },
      { term: 'performing arts', definitionVi: 'nghệ thuật biểu diễn', example: 'Performing arts such as theatre and dance enrich community life.' },
      { term: 'national pride', definitionVi: 'niềm tự hào dân tộc', example: 'Thriving arts industries can foster national pride.' },
      { term: 'social cohesion', definitionVi: 'sự gắn kết xã hội', example: 'Arts and culture strengthen social cohesion within communities.' },
      { term: 'stimulate creativity', definitionVi: 'kích thích sáng tạo', example: 'Investment in the arts can stimulate creativity across other sectors.' },
      { term: 'boost tourism', definitionVi: 'thúc đẩy du lịch', example: 'Art exhibitions and museums boost tourism and generate revenue.' },
      { term: 'economic benefits', definitionVi: 'lợi ích kinh tế', example: 'Cultural investment can bring significant economic benefits to a country.' },
      { term: 'investment in the arts', definitionVi: 'đầu tư vào nghệ thuật', example: 'Investment in the arts generates returns both culturally and economically.' },
      { term: 'enrich peoples lives', definitionVi: 'làm phong phú đời sống con người', example: 'The arts enrich peoples lives and promote well-being.' }
    ],
    questions: [
      {
        questionId: 'w10t16_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài có "Discuss both views and give your own opinion." Ý kiến cá nhân nên xuất hiện ở đâu trong bài essay?',
        options: [
          'Chỉ ở kết luận',
          'Ở Thesis Statement (cuối Introduction) VÀ nhắc lại trong kết luận',
          'Chỉ ở đầu bài, trước phần trình bày',
          'Ở giữa mỗi body paragraph'
        ],
        correctAnswer: 'Ở Thesis Statement (cuối Introduction) VÀ nhắc lại trong kết luận',
        explanationVi: 'Dạng Discuss Both Views: nêu ý kiến cá nhân trong Thesis Statement và nhất quán đến kết luận. Một số bài xuất sắc còn dẫn dắt ý kiến vào cả body paragraphs.'
      },
      {
        questionId: 'w10t16_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"The government has a responsibility to _____ its budget wisely, ensuring that both cultural and essential services receive adequate support."',
        correctAnswer: 'allocate',
        explanationVi: '"Allocate budget" = phân bổ ngân sách — động từ quan trọng khi bàn về chi tiêu của chính phủ.'
      },
      {
        questionId: 'w10t16_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng chính phủ nên chi tiền để hỗ trợ nghệ thuật."',
        correctAnswer: 'Some people argue that the government should provide funding to support the arts.',
        modelAnswer: 'Some people argue that the government should provide funding to support the arts.',
        fallbackKeywords: ['government funding', 'arts', 'support', 'argue'],
        explanationVi: "'Provide funding to support' = cung cấp tài trợ để hỗ trợ. 'Some people argue that' = cấu trúc chuẩn khi trình bày một quan điểm."
      },
      {
        questionId: 'w10t16_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các dịch vụ thiết yếu như bệnh viện và trường học cần được ưu tiên hơn."',
        correctAnswer: 'Essential services such as hospitals and schools need to be prioritized.',
        modelAnswer: 'Essential services such as hospitals and schools need to be prioritized.',
        fallbackKeywords: ['essential services', 'hospitals', 'schools', 'prioritized'],
        explanationVi: "'Such as + examples' = ví dụ như. 'Need to be prioritized' = cần được ưu tiên (passive). 'Essential services' = dịch vụ thiết yếu."
      },
      {
        questionId: 'w10t16_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng nghệ thuật giúp duy trì bản sắc văn hóa và truyền thống dân tộc."',
        correctAnswer: 'Some people argue that the arts help maintain cultural identity and national traditions.',
        modelAnswer: 'Some people argue that the arts help maintain cultural identity and national traditions.',
        fallbackKeywords: ['cultural identity', 'national traditions', 'arts', 'maintain'],
        explanationVi: "'Help + V' = giúp làm gì. 'Cultural identity' = bản sắc văn hóa. 'National traditions' = truyền thống dân tộc."
      },
      {
        questionId: 'w10t16_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Việc đầu tư vào nghệ thuật có thể kích thích sự sáng tạo trong xã hội."',
        correctAnswer: 'Investment in the arts can stimulate creativity across society.',
        modelAnswer: 'Investment in the arts can stimulate creativity across society.',
        fallbackKeywords: ['investment', 'arts', 'stimulate creativity', 'society'],
        explanationVi: "'Investment in + N' = đầu tư vào. 'Stimulate creativity' = kích thích sáng tạo. 'Across society' = trong toàn xã hội."
      },
      {
        questionId: 'w10t16_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[government / Although / the arts / supports / the / funding / cultural development, / argue / critics / that / public money / on / better spent / is / essential services]',
        correctAnswer: 'Although the government supports cultural development through arts funding, critics argue that public money is better spent on essential services.',
        explanationVi: '"Although + clause, + clause" — đối lập hai quan điểm. "Better spent on" = được chi tiêu tốt hơn cho.'
      },
      {
        questionId: 'w10t16_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"Art exhibitions and performing arts can boost tourism and bring economic benefit to a country."',
        correctAnswer: 'Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.',
        modelAnswer: 'Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.',
        fallbackKeywords: ['art exhibitions', 'performing arts', 'tourism', 'economic benefits'],
        explanationVi: 'Lỗi: "economic benefit" sau "bring" cần số nhiều: "economic benefits". Thêm "significant" để câu học thuật hơn.'
      },
      {
        questionId: 'w10t16_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nghệ thuật có thể giúp tăng cường sự gắn kết xã hội và niềm tự hào dân tộc."',
        correctAnswer: 'The arts can help strengthen social cohesion and foster national pride.',
        modelAnswer: 'The arts can help strengthen social cohesion and foster national pride.',
        fallbackKeywords: ['social cohesion', 'national pride', 'arts', 'strengthen'],
        explanationVi: "'Strengthen social cohesion' = tăng cường sự gắn kết xã hội. 'Foster national pride' = nuôi dưỡng niềm tự hào dân tộc. 'Foster' = formal synonym for 'develop/encourage'."
      },
      {
        questionId: 'w10t16_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: government, spend money, supporting the arts, more important things:\n\n"Some people believe that the government should spend money on supporting the arts, while others think it should be spent on more important things."',
        correctAnswer: 'There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.',
        modelAnswer: 'There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.',
        fallbackKeywords: ['public funds', 'cultural', 'artistic endeavours', 'higher-priority', 'sectors'],
        explanationVi: "Paraphrase: 'government' → 'public funds', 'spend money on arts' → 'directed towards cultural endeavours', 'more important things' → 'higher-priority sectors'."
      },
      {
        questionId: 'w10t16_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng chính phủ NÊN tài trợ cho nghệ thuật.\n\nGợi ý: cultural identity / social cohesion / boost tourism / economic benefits / preserve heritage / artistic expression',
        modelAnswer: 'Proponents of government funding for the arts argue that cultural investment yields both social and economic benefits that extend far beyond artistic expression. The arts play a vital role in preserving cultural heritage and strengthening national identity, fostering a sense of social cohesion that binds communities together. Furthermore, thriving arts industries attract tourists, boost local economies, and stimulate creativity across other sectors. Countries such as France and South Korea, which allocate significant portions of their national budgets to cultural development, demonstrate that investment in the arts generates considerable economic returns while enriching the lives of citizens at every level of society.',
        fallbackKeywords: ['cultural heritage', 'social cohesion', 'economic benefits', 'tourism', 'government funding', 'arts'],
        explanationVi: "Cấu trúc PEEL: topic sentence (View 1) → explanation (social + economic benefits) → example (France, South Korea) → conclusion."
      },
      // ── QT-4 Intermediate (W9T6) ──
      {
        questionId: 'w10t16_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "government funding" và "support the arts"):\n\n"Một số người cho rằng chính phủ nên chi tiền để hỗ trợ nghệ thuật."',
        correctAnswer: 'Some people argue that the government should provide funding to support the arts.',
        modelAnswer: 'Some people argue that the government should provide funding to support the arts.',
        fallbackKeywords: ['government funding', 'support the arts', 'provide'],
        explanationVi: "'Provide funding to + V' = cung cấp ngân sách để. 'The arts' (có mạo từ 'the') = nghệ thuật nói chung. 'Argue that' = cho rằng/lập luận rằng."
      },
      {
        questionId: 'w10t16_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "healthcare" và "education"):\n\n"Những người khác tin rằng ngân sách này nên được dùng cho các lĩnh vực quan trọng hơn như y tế hoặc giáo dục."',
        correctAnswer: 'Others believe that this budget should be spent on more important areas such as healthcare or education.',
        modelAnswer: 'Others believe that this budget should be spent on more important areas such as healthcare or education.',
        fallbackKeywords: ['healthcare', 'education', 'budget', 'more important'],
        explanationVi: "'Should be spent on' = bị động, nên được chi vào. 'Such as' = chẳng hạn như. 'More important areas' = các lĩnh vực quan trọng hơn."
      },
      {
        questionId: 'w10t16_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "public money" và "taxpayers"):\n\n"Tiền công từ người nộp thuế nên được sử dụng một cách khôn ngoan."',
        correctAnswer: 'Public money from taxpayers should be used wisely.',
        modelAnswer: 'Public money from taxpayers should be used wisely.',
        fallbackKeywords: ['public money', 'taxpayers', 'wisely'],
        explanationVi: "'Should be used + adverb' = bị động + trạng từ. 'Wisely' = một cách khôn ngoan. 'Public money from taxpayers' = tiền công từ người nộp thuế."
      },
      {
        questionId: 'w10t16_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "cultural identity" và "preserve heritage"):\n\n"Một số người cho rằng nghệ thuật giúp duy trì bản sắc văn hóa và truyền thống dân tộc."',
        correctAnswer: 'Some people argue that the arts help maintain cultural identity and preserve national heritage.',
        modelAnswer: 'Some people argue that the arts help maintain cultural identity and preserve national heritage.',
        fallbackKeywords: ['cultural identity', 'preserve heritage', 'national traditions'],
        explanationVi: "'Help + V (bare infinitive)' = giúp làm gì (không cần 'to'). 'Maintain' và 'preserve' là hai động từ song song. 'National heritage' = di sản văn hóa dân tộc."
      },
      {
        questionId: 'w10t16_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "art exhibitions", "performing arts", và "economic benefits"):\n\n"Các triển lãm nghệ thuật và biểu diễn có thể thu hút khách du lịch và mang lại lợi ích kinh tế."',
        correctAnswer: 'Art exhibitions and performing arts can attract tourists and bring significant economic benefits.',
        modelAnswer: 'Art exhibitions and performing arts can attract tourists and bring significant economic benefits.',
        fallbackKeywords: ['art exhibitions', 'performing arts', 'economic benefits', 'tourists'],
        explanationVi: "'Attract tourists' = thu hút khách du lịch. 'Bring significant economic benefits' = mang lại lợi ích kinh tế đáng kể. Hai vị ngữ song song: attract... and bring..."
      },
      {
        questionId: 'w10t16_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "investment in the arts" và "stimulate creativity"):\n\n"Việc đầu tư vào nghệ thuật có thể kích thích sự sáng tạo trong xã hội."',
        correctAnswer: 'Investment in the arts can stimulate creativity across society.',
        modelAnswer: 'Investment in the arts can stimulate creativity across society.',
        fallbackKeywords: ['investment in the arts', 'stimulate creativity', 'society'],
        explanationVi: "'Stimulate creativity' = kích thích sự sáng tạo. 'Across society' = trên toàn xã hội/trong xã hội. 'Investment in the arts' = đầu tư vào nghệ thuật."
      },
      {
        questionId: 'w10t16_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "budget constraints" và "financial burden"):\n\n"Tuy nhiên, trong thời kỳ khủng hoảng kinh tế, chính phủ phải đối mặt với hạn chế ngân sách."',
        correctAnswer: 'However, during periods of economic crisis, governments face significant budget constraints and financial burdens.',
        modelAnswer: 'However, during periods of economic crisis, governments face significant budget constraints and financial burdens.',
        fallbackKeywords: ['budget constraints', 'financial burden', 'economic crisis'],
        explanationVi: "'During periods of + N' = trong thời kỳ. 'Face + N' = đối mặt với. 'Budget constraints' = hạn chế ngân sách, 'financial burdens' = gánh nặng tài chính."
      },
      {
        questionId: 'w10t16_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "social cohesion" và "national pride"):\n\n"Nghệ thuật có thể giúp tăng cường sự gắn kết xã hội và niềm tự hào dân tộc."',
        correctAnswer: 'The arts can help strengthen social cohesion and foster a sense of national pride.',
        modelAnswer: 'The arts can help strengthen social cohesion and foster a sense of national pride.',
        fallbackKeywords: ['social cohesion', 'national pride', 'strengthen'],
        explanationVi: "'Strengthen' = tăng cường. 'Foster a sense of' = nuôi dưỡng/tạo ra cảm giác. 'Social cohesion' = sự gắn kết xã hội; 'national pride' = niềm tự hào dân tộc."
      },
      {
        questionId: 'w10t16_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "government responsibility" và "investment in the arts"):\n\n"Một số người tin rằng đầu tư vào nghệ thuật là một phần trách nhiệm của chính phủ."',
        correctAnswer: 'Some people believe that investment in the arts is part of the government\'s responsibility.',
        modelAnswer: 'Some people believe that investment in the arts is part of the government\'s responsibility.',
        fallbackKeywords: ['government responsibility', 'investment in the arts', 'part of'],
        explanationVi: "'Part of the government\'s responsibility' = một phần trách nhiệm của chính phủ. Dùng sở hữu cách 'government\'s' thay vì 'of the government'."
      },
      {
        questionId: 'w10t16_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "long-term development" và "balance between economy and culture"):\n\n"Về lâu dài, cả phát triển kinh tế và văn hóa đều cần được quan tâm song song."',
        correctAnswer: 'In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.',
        modelAnswer: 'In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.',
        fallbackKeywords: ['long-term development', 'economic', 'cultural', 'simultaneously'],
        explanationVi: "'In the long term' = về lâu dài. 'Both A and B need to be addressed' = cả A lẫn B cần được giải quyết. 'Simultaneously' = đồng thời/song song."
      }
    ]
  },
  {
    week: 10, block: 'mixed', orderIndex: 17,
    topicName: 'Youth Crime and Solutions', topicEmoji: '⚖️',
    essayType: 'cause_solution',
    prompt: 'The crime rate among young people is increasing rapidly. What are the causes of this problem? How can it be solved?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'youth crime', definitionVi: 'tội phạm thanh thiếu niên', example: 'Youth crime is a growing concern in many urban areas.' },
      { term: 'juvenile delinquency', definitionVi: 'tình trạng phạm tội ở thanh thiếu niên', example: 'Poverty and lack of education contribute to juvenile delinquency.' },
      { term: 'peer pressure', definitionVi: 'áp lực từ bạn bè', example: 'Peer pressure is a key factor in youth crime.' },
      { term: 'lack of parental supervision', definitionVi: 'thiếu sự giám sát của cha mẹ', example: 'A lack of parental supervision leaves young people more vulnerable to crime.' },
      { term: 'family breakdown', definitionVi: 'gia đình tan vỡ', example: 'Family breakdown is a major social factor contributing to youth crime.' },
      { term: 'poverty', definitionVi: 'đói nghèo', example: 'Poverty deprives young people of legitimate opportunities.' },
      { term: 'unemployment', definitionVi: 'thất nghiệp', example: 'High youth unemployment is linked to rising crime rates.' },
      { term: 'rehabilitation programs', definitionVi: 'chương trình cải tạo', example: 'Rehabilitation programs help young offenders reform their behaviour.' },
      { term: 'counseling and guidance', definitionVi: 'tư vấn và hướng dẫn', example: 'Counseling and guidance can help troubled youth make better choices.' },
      { term: 'create job opportunities', definitionVi: 'tạo cơ hội việc làm', example: 'Creating job opportunities for youth reduces the appeal of criminal activity.' },
      { term: 'strengthen family bonds', definitionVi: 'củng cố mối liên kết gia đình', example: 'Strengthening family bonds is an effective crime prevention strategy.' },
      { term: 'government intervention', definitionVi: 'sự can thiệp của chính phủ', example: 'Government intervention is needed to address the root causes of youth crime.' },
      { term: 'public awareness campaigns', definitionVi: 'chiến dịch nâng cao nhận thức', example: 'Public awareness campaigns help communities understand and prevent crime.' },
      { term: 'positive role models', definitionVi: 'hình mẫu tích cực', example: 'Access to positive role models helps young people make responsible decisions.' },
      { term: 'crime prevention', definitionVi: 'phòng ngừa tội phạm', example: 'Education and employment are key pillars of crime prevention.' }
    ],
    questions: [
      {
        questionId: 'w10t17_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài hỏi "What are the causes of this problem? How can it be solved?" — đây là dạng essay nào?',
        options: ['Discuss Both Views', 'Advantages & Disadvantages', 'Cause & Solution', 'Agree or Disagree'],
        correctAnswer: 'Cause & Solution',
        explanationVi: 'Hai câu hỏi rõ ràng: "causes" = nguyên nhân, "solved" = giải pháp. Dạng Cause & Solution: 1 đoạn nguyên nhân + 1 đoạn giải pháp, không được trộn lẫn.'
      },
      {
        questionId: 'w10t17_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Young people who grow up in broken families or poverty are more _____ to criminal behavior."',
        correctAnswer: 'susceptible',
        explanationVi: '"Susceptible to" = dễ bị ảnh hưởng bởi — cụm từ học thuật quan trọng. "Vulnerable to" cũng chấp nhận được với nghĩa tương tự.'
      },
      {
        questionId: 'w10t17_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Tỷ lệ tội phạm trong giới trẻ đang gia tăng nhanh chóng."',
        correctAnswer: 'The crime rate among young people is increasing rapidly.',
        modelAnswer: 'The crime rate among young people is increasing rapidly.',
        fallbackKeywords: ['crime rate', 'young people', 'increasing rapidly'],
        explanationVi: "'Crime rate' = tỷ lệ tội phạm. 'Among young people' = trong giới trẻ. 'Is increasing rapidly' = đang tăng nhanh (Present Continuous nhấn mạnh xu hướng)."
      },
      {
        questionId: 'w10t17_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Áp lực từ bạn bè và thiếu sự giám sát của cha mẹ là những nguyên nhân chính của vấn đề này."',
        correctAnswer: 'Peer pressure and a lack of parental supervision are the main causes of this problem.',
        modelAnswer: 'Peer pressure and a lack of parental supervision are the main causes of this problem.',
        fallbackKeywords: ['peer pressure', 'parental supervision', 'causes', 'problem'],
        explanationVi: "'A lack of parental supervision' = sự thiếu giám sát của cha mẹ. 'The main causes of' = những nguyên nhân chính của. Số nhiều 'causes' + 'are'."
      },
      {
        questionId: 'w10t17_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Nhiều thanh thiếu niên phạm tội vì đến từ những gia đình tan vỡ."',
        correctAnswer: 'Many young people commit crimes because they come from families affected by breakdown.',
        modelAnswer: 'Many young people commit crimes because they come from families affected by breakdown.',
        fallbackKeywords: ['young people', 'commit crimes', 'family breakdown'],
        explanationVi: "'Commit crimes' = phạm tội. 'Family breakdown' = gia đình tan vỡ. 'Because + clause' = vì/do (nguyên nhân)."
      },
      {
        questionId: 'w10t17_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các chương trình cải tạo và tư vấn có thể giúp thanh thiếu niên thay đổi hành vi."',
        correctAnswer: 'Rehabilitation programs and counseling can help young people change their behavior.',
        modelAnswer: 'Rehabilitation programs and counseling can help young people change their behavior.',
        fallbackKeywords: ['rehabilitation programs', 'counseling', 'young people', 'behavior'],
        explanationVi: "'Help + O + V' = giúp ai đó làm gì. 'Rehabilitation programs' = chương trình cải tạo. 'Counseling' = tư vấn tâm lý."
      },
      {
        questionId: 'w10t17_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[poverty, unemployment, / Such / as / social factors / and / can / a lack of discipline / drive / to / young people / commit crimes]',
        correctAnswer: 'Such social factors as poverty, unemployment, and a lack of discipline can drive young people to commit crimes.',
        explanationVi: '"Such + noun + as + examples" = ví dụ như — cấu trúc liệt kê học thuật. "Drive someone to + V" = thúc đẩy ai đó làm gì.'
      },
      {
        questionId: 'w10t17_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"To solve this problem, the government should to create more job opportunities for young people."',
        correctAnswer: 'To solve this problem, the government should create more job opportunities for young people.',
        modelAnswer: 'To solve this problem, the government should create more job opportunities for young people.',
        fallbackKeywords: ['government', 'should create', 'job opportunities', 'young people'],
        explanationVi: "Lỗi: Sau \"should\" không dùng \"to + V\". Bỏ \"to\" trước \"create\"."
      },
      {
        questionId: 'w10t17_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các chiến dịch nâng cao nhận thức cộng đồng có thể giúp giảm hành vi tội phạm trong giới trẻ."',
        correctAnswer: 'Public awareness campaigns can help reduce criminal behavior among young people.',
        modelAnswer: 'Public awareness campaigns can help reduce criminal behavior among young people.',
        fallbackKeywords: ['public awareness campaigns', 'reduce', 'criminal behavior', 'young people'],
        explanationVi: "'Public awareness campaigns' = chiến dịch nâng cao nhận thức cộng đồng. 'Criminal behavior among' = hành vi tội phạm trong giới. 'Help + V' = giúp làm gì."
      },
      {
        questionId: 'w10t17_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: crime rate, young people, increasing rapidly:\n\n"The crime rate among young people is increasing rapidly."',
        correctAnswer: 'There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.',
        modelAnswer: 'There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.',
        fallbackKeywords: ['adolescents', 'unlawful behaviour', 'sharp rise', 'recent years'],
        explanationVi: "Paraphrase: 'crime rate increasing' → 'sharp rise in... unlawful behaviour', 'young people' → 'adolescents and young adults'. 'Engaging in unlawful behaviour' = tham gia hành vi phạm pháp."
      },
      {
        questionId: 'w10t17_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) trình bày HAI NGUYÊN NHÂN chính khiến tội phạm vị thành niên gia tăng.\n\nGợi ý: peer pressure / family breakdown / poverty / unemployment / social media influence / exposure to violence',
        modelAnswer: 'There are several key factors that contribute to the rise in youth crime. First, family breakdown and a lack of parental supervision leave many young people without moral guidance, making them more susceptible to peer pressure and negative influences. Children raised in single-parent households or unstable family environments are significantly more likely to engage in delinquent behaviour. Second, poverty and unemployment deprive young people of legitimate opportunities, pushing some towards criminal activity as a means of financial survival. Without stable employment prospects or adequate support systems, economically disadvantaged youth face heightened vulnerability to crime.',
        fallbackKeywords: ['peer pressure', 'family breakdown', 'poverty', 'unemployment', 'youth crime', 'susceptible'],
        explanationVi: "Dạng Cause & Solution: đoạn nguyên nhân phải nêu 2 nguyên nhân rõ ràng, mỗi nguyên nhân có giải thích. Dùng 'First,...Second,...' để phân tách."
      },
      {
        questionId: 'w10t17_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) đề xuất HAI GIẢI PHÁP để giải quyết vấn đề tội phạm trong giới trẻ.\n\nGợi ý: rehabilitation programs / counseling and guidance / create job opportunities / government intervention / public awareness campaigns / strengthen family bonds',
        modelAnswer: 'Addressing youth crime requires a multi-faceted approach targeting both its immediate symptoms and root causes. One effective solution is the expansion of rehabilitation programs and counseling services, which provide young offenders with the psychological support and moral guidance needed to reform their behaviour and avoid reoffending. Additionally, governments should create job opportunities and vocational training schemes specifically tailored to at-risk youth, giving them legitimate pathways to financial stability. When young people have access to meaningful employment and community support, the appeal of criminal activity diminishes significantly, contributing to long-term crime prevention.',
        fallbackKeywords: ['rehabilitation programs', 'counseling', 'job opportunities', 'government', 'crime prevention', 'vocational training'],
        explanationVi: "Đoạn giải pháp phải nêu 2 giải pháp cụ thể, mỗi giải pháp có giải thích tại sao hiệu quả. Dùng 'One effective solution is...' và 'Additionally,...' để phân tách."
      },
      // ── QT-4 Intermediate (W9T7) ──
      {
        questionId: 'w10t17_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "youth crime"):\n\n"Tỷ lệ tội phạm trong giới trẻ đang gia tăng nhanh chóng."',
        correctAnswer: 'The rate of youth crime is increasing rapidly.',
        modelAnswer: 'The rate of youth crime is increasing rapidly.',
        fallbackKeywords: ['youth crime', 'rate', 'increasing rapidly'],
        explanationVi: "'The rate of + N + is increasing rapidly' = tỷ lệ đang tăng nhanh. Present Continuous nhấn mạnh xu hướng đang xảy ra. 'Rapidly' = một cách nhanh chóng."
      },
      {
        questionId: 'w10t17_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "peer pressure" và "lack of parental supervision"):\n\n"Nguyên nhân chính của hiện tượng này là áp lực từ bạn bè và thiếu sự giám sát của cha mẹ."',
        correctAnswer: 'The main causes of this phenomenon are peer pressure and a lack of parental supervision.',
        modelAnswer: 'The main causes of this phenomenon are peer pressure and a lack of parental supervision.',
        fallbackKeywords: ['peer pressure', 'lack of parental supervision', 'main causes'],
        explanationVi: "'The main causes of this phenomenon are A and B' = liệt kê nguyên nhân theo cấu trúc song song. 'A lack of + N' = sự thiếu hụt về."
      },
      {
        questionId: 'w10t17_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "juvenile delinquency" và "family breakdown"):\n\n"Nhiều thanh thiếu niên phạm tội vì đến từ những gia đình tan vỡ."',
        correctAnswer: 'Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.',
        modelAnswer: 'Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.',
        fallbackKeywords: ['juvenile delinquency', 'family breakdown', 'stem from'],
        explanationVi: "'Stem from' = xuất phát từ/có nguồn gốc từ. 'Juvenile delinquency' = tội phạm vị thành niên. 'Families affected by breakdown' = gia đình tan vỡ (mệnh đề quan hệ rút gọn)."
      },
      {
        questionId: 'w10t17_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "poverty", "unemployment", và "youth crime"):\n\n"Nghèo đói và thất nghiệp là hai yếu tố quan trọng dẫn đến tội phạm vị thành niên."',
        correctAnswer: 'Poverty and unemployment are two significant factors contributing to youth crime.',
        modelAnswer: 'Poverty and unemployment are two significant factors contributing to youth crime.',
        fallbackKeywords: ['poverty', 'unemployment', 'youth crime', 'contributing'],
        explanationVi: "'Factors contributing to + N' = các yếu tố góp phần vào (participial phrase rút gọn mệnh đề quan hệ). 'Significant' = đáng kể/quan trọng."
      },
      {
        questionId: 'w10t17_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "social media influence" và "exposure to violence"):\n\n"Một số người trẻ bị ảnh hưởng tiêu cực bởi mạng xã hội hoặc tiếp xúc với bạo lực."',
        correctAnswer: 'Some young people are negatively influenced by social media or exposure to violence.',
        modelAnswer: 'Some young people are negatively influenced by social media or exposure to violence.',
        fallbackKeywords: ['social media influence', 'exposure to violence', 'negatively influenced'],
        explanationVi: "'Are negatively influenced by' = bị ảnh hưởng tiêu cực bởi (bị động). 'Exposure to violence' = tiếp xúc với bạo lực — danh từ không đếm được."
      },
      {
        questionId: 'w10t17_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "drug and alcohol abuse" và "aggressive behavior"):\n\n"Lạm dụng ma túy và rượu cũng góp phần làm gia tăng hành vi tội phạm."',
        correctAnswer: 'Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.',
        modelAnswer: 'Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.',
        fallbackKeywords: ['drug and alcohol abuse', 'aggressive behavior', 'contribute'],
        explanationVi: "'Contribute to the rise in + N' = góp phần vào sự gia tăng của. 'Drug and alcohol abuse' là chủ ngữ số nhiều → 'contribute' (không có 's')."
      },
      {
        questionId: 'w10t17_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "crime prevention" và "improve education system"):\n\n"Để ngăn ngừa tội phạm trong giới trẻ, chính phủ cần tăng cường giáo dục và hướng nghiệp."',
        correctAnswer: 'To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.',
        modelAnswer: 'To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.',
        fallbackKeywords: ['crime prevention', 'improve education system', 'vocational guidance'],
        explanationVi: "'To ensure + N' = để đảm bảo. 'Needs to + V' = cần phải. 'Vocational guidance' = hướng nghiệp. Hai vị ngữ song song: improve... and expand..."
      },
      {
        questionId: 'w10t17_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "family bonds" và "moral values"):\n\n"Gia đình cần dành thời gian cho con cái để củng cố mối quan hệ và định hướng đạo đức."',
        correctAnswer: 'Families need to spend time with their children to strengthen family bonds and instil moral values.',
        modelAnswer: 'Families need to spend time with their children to strengthen family bonds and instil moral values.',
        fallbackKeywords: ['family bonds', 'moral values', 'strengthen', 'instil'],
        explanationVi: "'Instil + N' = gieo trồng/định hướng (đặc biệt dùng cho giá trị đạo đức). 'Strengthen family bonds' = củng cố mối quan hệ gia đình. Hai V song song: strengthen... and instil..."
      },
      {
        questionId: 'w10t17_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "stricter punishment" và "deter crime"):\n\n"Một số người tin rằng cần áp dụng hình phạt nghiêm khắc hơn để răn đe."',
        correctAnswer: 'Some people believe that stricter punishment is needed to deter crime.',
        modelAnswer: 'Some people believe that stricter punishment is needed to deter crime.',
        fallbackKeywords: ['stricter punishment', 'deter crime', 'needed'],
        explanationVi: "'Is needed to + V' = cần phải (bị động). 'Deter crime' = ngăn chặn/răn đe tội phạm. 'Stricter punishment' = hình phạt nghiêm khắc hơn (so sánh hơn)."
      },
      {
        questionId: 'w10t17_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "positive role models" và "peer pressure"):\n\n"Thanh thiếu niên cần những hình mẫu tích cực để noi theo thay vì bị ảnh hưởng bởi bạn bè xấu."',
        correctAnswer: 'Young people need positive role models to look up to instead of being swayed by negative peer pressure.',
        modelAnswer: 'Young people need positive role models to look up to instead of being swayed by negative peer pressure.',
        fallbackKeywords: ['positive role models', 'peer pressure', 'instead of', 'negative'],
        explanationVi: "'Look up to' = noi gương/ngưỡng mộ. 'Instead of + V-ing' = thay vì. 'Swayed by' = bị ảnh hưởng/bị lôi kéo bởi. 'Negative peer pressure' = ảnh hưởng xấu từ bạn bè."
      }
    ]
  },
  // ─── WEEK 12: Translation Practice ──────────────────────────────────────
  {
    week: 12, block: 'translation', orderIndex: 19,
    topicName: 'Dịch Câu - Môi Trường & Khí Hậu', topicEmoji: '🌿',
    essayType: 'cause_solution',
    prompt: 'The increasing levels of pollution and climate change are threatening the planet. What are the causes of these problems, and what solutions can be implemented?',
    vocabularyList: [
      { term: 'climate change', definitionVi: 'biến đổi khí hậu', example: 'Climate change is causing more frequent extreme weather events.' },
      { term: 'fossil fuels', definitionVi: 'nhiên liệu hóa thạch', example: 'Burning fossil fuels is a major cause of air pollution.' },
      { term: 'renewable energy', definitionVi: 'năng lượng tái tạo', example: 'Switching to renewable energy can significantly reduce carbon emissions.' },
      { term: 'carbon emissions', definitionVi: 'khí thải carbon', example: 'Reducing carbon emissions is essential to combat climate change.' },
      { term: 'sustainability', definitionVi: 'tính bền vững', example: 'Economic development must prioritise sustainability.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_env_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Biến đổi khí hậu là một trong những thách thức lớn nhất mà nhân loại đang phải đối mặt."',
        correctAnswer: 'Climate change is one of the greatest challenges that humanity is currently facing.',
        modelAnswer: 'Climate change is one of the greatest challenges that humanity is currently facing.',
        fallbackKeywords: ['climate change', 'challenges', 'humanity', 'facing'],
        explanationVi: "'One of the + superlative + N' dùng khi nói về một trong những điều quan trọng nhất. 'Facing/confronting' = đối mặt. 'Humanity' = nhân loại — từ học thuật thay cho 'people'."
      },
      {
        questionId: 'w12_trans_env_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "fossil fuels" và "global warming"):\n\n"Việc đốt nhiên liệu hóa thạch thải ra lượng lớn khí CO2, góp phần vào hiện tượng ấm lên toàn cầu."',
        correctAnswer: 'Burning fossil fuels releases large amounts of CO2, contributing to global warming.',
        modelAnswer: 'Burning fossil fuels releases large amounts of CO2, contributing to global warming.',
        fallbackKeywords: ['fossil fuels', 'releases', 'CO2', 'contributing', 'global warming'],
        explanationVi: "'Burning + N' (gerund) làm chủ ngữ. '..., contributing to' (participial clause) diễn tả kết quả của hành động trước. Không dùng 'and contribute' ở đây."
      },
      {
        questionId: 'w12_trans_env_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "renewable energy" và "fossil fuels"):\n\n"Chính phủ nên thực hiện các chính sách mạnh mẽ hơn để khuyến khích sử dụng năng lượng tái tạo và giảm sự phụ thuộc vào nhiên liệu hóa thạch."',
        correctAnswer: 'Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.',
        modelAnswer: 'Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.',
        fallbackKeywords: ['governments', 'implement', 'policies', 'renewable energy', 'fossil fuels', 'reduce'],
        explanationVi: "'Implement policies' = thực thi chính sách. 'Reduce dependence on' = giảm sự phụ thuộc vào. 'Should' thể hiện khuyến nghị — rất cần trong đoạn solution."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 20,
    topicName: 'Dịch Câu - Công Nghệ & Truyền Thông', topicEmoji: '💻',
    essayType: 'advantages_disadvantages',
    prompt: 'The rapid advancement of technology has transformed the way people communicate and work. What are the advantages and disadvantages of this development?',
    vocabularyList: [
      { term: 'artificial intelligence', definitionVi: 'trí tuệ nhân tạo', example: 'Artificial intelligence is revolutionising industries worldwide.' },
      { term: 'social media', definitionVi: 'mạng xã hội', example: 'Social media platforms have changed the way news is consumed.' },
      { term: 'automation', definitionVi: 'tự động hóa', example: 'Automation is threatening millions of low-skilled jobs worldwide.' },
      { term: 'misinformation', definitionVi: 'thông tin sai lệch', example: 'The spread of misinformation on social media is a growing concern.' },
      { term: 'digital literacy', definitionVi: 'kỹ năng số', example: 'Digital literacy is essential for success in the modern workplace.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_tech_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Mạng xã hội cho phép mọi người kết nối với bạn bè và gia đình ở khắp nơi trên thế giới."',
        correctAnswer: 'Social media allows people to connect with friends and family all over the world.',
        modelAnswer: 'Social media allows people to connect with friends and family all over the world.',
        fallbackKeywords: ['social media', 'allows', 'connect', 'friends', 'family', 'world'],
        explanationVi: "'Allow + O + to V' = cho phép ai làm gì. 'All over the world' = khắp nơi trên thế giới. Đây là câu mở bài/lập luận điển hình về lợi ích của mạng xã hội."
      },
      {
        questionId: 'w12_trans_tech_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "artificial intelligence" và "employment opportunities"):\n\n"Mặc dù trí tuệ nhân tạo có thể thay thế một số công việc, nhưng nó cũng tạo ra nhiều cơ hội việc làm mới trong lĩnh vực công nghệ."',
        correctAnswer: 'Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.',
        modelAnswer: 'Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.',
        fallbackKeywords: ['artificial intelligence', 'replace', 'jobs', 'employment opportunities', 'technology sector'],
        explanationVi: "'Although A, B' = mặc dù A nhưng B (tương phản). 'Employment opportunities' = cơ hội việc làm. 'May replace' = có thể thay thế (chưa chắc chắn — dùng modal để thận trọng)."
      },
      {
        questionId: 'w12_trans_tech_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "reliance on technology" và "social skills"):\n\n"Sự phụ thuộc quá mức vào công nghệ đã làm suy giảm kỹ năng xã hội của giới trẻ, khiến họ kém khả năng giao tiếp trực tiếp hơn."',
        correctAnswer: 'Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.',
        modelAnswer: 'Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.',
        fallbackKeywords: ['reliance on technology', 'eroded', 'social skills', 'young people', 'face-to-face'],
        explanationVi: "'Excessive reliance on' = sự phụ thuộc quá mức vào. 'Erode' = bào mòn, làm suy giảm dần. '...making them less capable of' = khiến họ kém khả năng. Present Perfect nhấn mạnh kết quả hiện tại."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 21,
    topicName: 'Dịch Câu - Giáo Dục & Thanh Niên', topicEmoji: '🎓',
    essayType: 'cause_effect',
    prompt: 'The education system in many countries is under pressure to prepare students for the challenges of the modern world. What are the causes and effects of this pressure?',
    vocabularyList: [
      { term: 'curriculum', definitionVi: 'chương trình học', example: 'The curriculum needs to be updated to include digital skills.' },
      { term: 'extracurricular activities', definitionVi: 'hoạt động ngoại khóa', example: 'Extracurricular activities develop social and leadership skills.' },
      { term: 'student engagement', definitionVi: 'sự tham gia của học sinh', example: 'Technology can enhance student engagement in lessons.' },
      { term: 'critical thinking', definitionVi: 'tư duy phản biện', example: 'Modern education should prioritise critical thinking over rote learning.' },
      { term: 'academic achievement', definitionVi: 'thành tích học tập', example: 'Academic achievement is often used as the sole measure of success.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_edu_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Giáo dục chất lượng cao là nền tảng của sự phát triển kinh tế và xã hội."',
        correctAnswer: 'High-quality education is the foundation of economic and social development.',
        modelAnswer: 'High-quality education is the foundation of economic and social development.',
        fallbackKeywords: ['education', 'foundation', 'economic', 'social development'],
        explanationVi: "'High-quality' = chất lượng cao (tính từ ghép, có gạch nối khi đứng trước danh từ). 'Foundation of' = nền tảng của. Câu này phù hợp làm introduction hoặc thesis statement."
      },
      {
        questionId: 'w12_trans_edu_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "homework" và "extracurricular activities"):\n\n"Học sinh có quá nhiều bài tập về nhà thường cảm thấy căng thẳng và không có thời gian cho các hoạt động ngoại khóa."',
        correctAnswer: 'Students who have too much homework often feel stressed and have no time for extracurricular activities.',
        modelAnswer: 'Students who have too much homework often feel stressed and have no time for extracurricular activities.',
        fallbackKeywords: ['homework', 'stressed', 'extracurricular activities', 'time'],
        explanationVi: "Mệnh đề quan hệ 'who have too much homework' bổ nghĩa cho 'students'. 'Have no time for' = không có thời gian cho. 'Extracurricular activities' là cụm quan trọng khi viết về áp lực học tập."
      },
      {
        questionId: 'w12_trans_edu_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "integrating technology" và "digital world"):\n\n"Việc tích hợp công nghệ vào lớp học không chỉ nâng cao sự tương tác của học sinh mà còn chuẩn bị cho họ những kỹ năng cần thiết trong thế giới kỹ thuật số."',
        correctAnswer: 'Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.',
        modelAnswer: 'Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.',
        fallbackKeywords: ['integrating technology', 'classroom', 'enhances', 'student engagement', 'digital world', 'skills'],
        explanationVi: "Cấu trúc 'not only A but also B' = không chỉ A mà còn B. 'Enhances engagement' = nâng cao sự tương tác. Gerund phrase 'Integrating technology...' làm chủ ngữ là cấu trúc học thuật cao cấp."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 22,
    topicName: 'Dịch Câu - Sức Khỏe & Đô Thị Hóa', topicEmoji: '🏙️',
    essayType: 'effect_solution',
    prompt: 'Rapid urbanisation is having a significant impact on people\'s health and wellbeing in cities. What effects does this have, and what solutions can governments implement?',
    vocabularyList: [
      { term: 'sedentary lifestyle', definitionVi: 'lối sống ít vận động', example: 'A sedentary lifestyle increases the risk of chronic disease.' },
      { term: 'obesity', definitionVi: 'béo phì', example: 'Childhood obesity is becoming an epidemic in many countries.' },
      { term: 'workplace stress', definitionVi: 'căng thẳng tại nơi làm việc', example: 'Workplace stress is a leading cause of absenteeism.' },
      { term: 'mental health', definitionVi: 'sức khỏe tâm thần', example: 'Mental health should be given the same priority as physical health.' },
      { term: 'employee turnover', definitionVi: 'tỷ lệ nhân viên nghỉ việc', example: 'High stress levels contribute to employee turnover.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_health_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Lối sống ít vận động là nguyên nhân hàng đầu dẫn đến béo phì và các bệnh tim mạch."',
        correctAnswer: 'A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.',
        modelAnswer: 'A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.',
        fallbackKeywords: ['sedentary lifestyle', 'leading cause', 'obesity', 'cardiovascular'],
        explanationVi: "'Sedentary lifestyle' = lối sống ít vận động (tính từ 'sedentary' = ngồi nhiều, không vận động). 'The leading cause of' = nguyên nhân hàng đầu của. 'Cardiovascular diseases' = bệnh tim mạch."
      },
      {
        questionId: 'w12_trans_health_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "obesity" và "sports facilities"):\n\n"Chính phủ có thể giảm tỷ lệ béo phì bằng cách đầu tư vào các cơ sở thể thao công cộng và khuyến khích người dân vận động nhiều hơn."',
        correctAnswer: 'Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.',
        modelAnswer: 'Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.',
        fallbackKeywords: ['governments', 'reduce', 'obesity', 'investing', 'sports facilities', 'exercise'],
        explanationVi: "'By + V-ing' = bằng cách. 'Invest in' = đầu tư vào. 'Encourage + O + to V' = khuyến khích ai làm gì. Ba cấu trúc này thường xuất hiện cùng nhau khi đề xuất giải pháp trong IELTS."
      },
      {
        questionId: 'w12_trans_health_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "workplace stress" và "productivity"):\n\n"Mức độ căng thẳng cao tại nơi làm việc không chỉ ảnh hưởng đến sức khỏe tâm thần của nhân viên mà còn làm giảm năng suất lao động và tăng tỷ lệ nghỉ việc."',
        correctAnswer: 'High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.',
        modelAnswer: 'High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.',
        fallbackKeywords: ['workplace stress', 'mental health', 'employees', 'productivity', 'employee turnover'],
        explanationVi: "'Not only A but also B' liệt kê hai hệ quả. 'Employee turnover' = tỷ lệ nhân viên nghỉ việc. 'High levels of' = mức độ cao của — cách diễn đạt học thuật thay cho 'a lot of'."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 23,
    topicName: 'Dịch Câu - Kinh Tế & Toàn Cầu Hóa', topicEmoji: '🌐',
    essayType: 'agree_disagree',
    prompt: 'Globalisation has brought significant changes to economies around the world, but its effects are not always positive. To what extent do you agree or disagree?',
    vocabularyList: [
      { term: 'globalisation', definitionVi: 'toàn cầu hóa', example: 'Globalisation has opened up new markets for businesses worldwide.' },
      { term: 'income inequality', definitionVi: 'bất bình đẳng thu nhập', example: 'Globalisation has contributed to rising income inequality in some countries.' },
      { term: 'minimum wage', definitionVi: 'lương tối thiểu', example: 'Raising the minimum wage can help reduce poverty.' },
      { term: 'labour costs', definitionVi: 'chi phí lao động', example: 'High labour costs drive companies to automate their operations.' },
      { term: 'automation', definitionVi: 'tự động hóa', example: 'Automation in manufacturing is displacing millions of low-skilled workers.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_econ_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Toàn cầu hóa đã tạo ra nhiều cơ hội kinh tế nhưng cũng làm gia tăng khoảng cách giàu nghèo."',
        correctAnswer: 'Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.',
        modelAnswer: 'Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.',
        fallbackKeywords: ['globalisation', 'economic opportunities', 'widened', 'rich', 'poor'],
        explanationVi: "'Widen the gap' = làm gia tăng khoảng cách. 'The gap between the rich and the poor' = khoảng cách giàu nghèo. Present Perfect nhấn mạnh kết quả hiện tại từ quá khứ."
      },
      {
        questionId: 'w12_trans_econ_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "automation" và "low-skilled workers"):\n\n"Tự động hóa trong sản xuất công nghiệp đang đe dọa việc làm của hàng triệu công nhân tay nghề thấp trên toàn thế giới."',
        correctAnswer: 'Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.',
        modelAnswer: 'Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.',
        fallbackKeywords: ['automation', 'industrial production', 'threatening', 'low-skilled workers', 'worldwide'],
        explanationVi: "Present Continuous 'is threatening' nhấn mạnh quá trình đang diễn ra liên tục. 'Low-skilled workers' = công nhân tay nghề thấp. 'Millions of' = hàng triệu (không nói 'million of')."
      },
      {
        questionId: 'w12_trans_econ_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "minimum wage" và "labour costs"):\n\n"Mặc dù tăng lương tối thiểu có thể cải thiện đời sống của người lao động thu nhập thấp, một số doanh nghiệp nhỏ có thể phải thu hẹp hoặc đóng cửa do chi phí lao động tăng cao."',
        correctAnswer: 'Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.',
        modelAnswer: 'Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.',
        fallbackKeywords: ['minimum wage', 'improve', 'low-income workers', 'small businesses', 'downsize', 'labour costs'],
        explanationVi: "'Although + clause, clause' diễn đạt tương phản. 'May have to + V' = có thể phải. 'Downsize' = thu hẹp quy mô. 'Due to' = do, vì (giới từ, theo sau là danh từ/noun phrase)."
      }
    ]
  },

  // ─── WEEK 12: Model Answer Practice ─────────────────────────────────────
  {
    week: 12, block: 'model_answer', orderIndex: 24,
    topicName: 'Bài Mẫu - Paraphrase Câu Mở Bài', topicEmoji: '✏️',
    essayType: 'advantages_disadvantages',
    prompt: 'Technology has transformed almost every aspect of modern life. What are the advantages and disadvantages of this development?',
    vocabularyList: [
      { term: 'paraphrase', definitionVi: 'diễn đạt lại', example: 'In IELTS writing, you should paraphrase the question in your introduction.' },
      { term: 'synonyms', definitionVi: 'từ đồng nghĩa', example: 'Using synonyms helps avoid repetition in academic writing.' },
      { term: 'thesis statement', definitionVi: 'luận điểm chính', example: 'A clear thesis statement guides the reader through your essay.' }
    ],
    questions: [
      {
        questionId: 'w12_model_intro_q01', level: 'beginner', orderIndex: 1,
        type: 'paraphrase',
        questionText: 'Đọc câu sau và viết lại với nghĩa tương tự, thay thế các từ in nghiêng bằng từ đồng nghĩa:\n\n"In recent years, technology has become an increasingly important part of modern education."\n\nGợi ý từ dùng: "nowadays", "significant role", "contemporary schooling"',
        correctAnswer: 'Nowadays, technology plays an increasingly significant role in contemporary schooling.',
        modelAnswer: 'Nowadays, technology plays an increasingly significant role in contemporary schooling.',
        fallbackKeywords: ['nowadays', 'technology', 'significant', 'role', 'schooling'],
        explanationVi: "'In recent years' → 'Nowadays/Currently/In the modern era'. 'Become an important part of' → 'play a significant role in'. 'Education' → 'schooling/academic study'. Khi paraphrase, hãy thay đổi cả từ vựng lẫn cấu trúc câu."
      },
      {
        questionId: 'w12_model_intro_q02', level: 'elementary', orderIndex: 2,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau theo cách diễn đạt khác:\n\n"Climate change has become one of the most pressing issues facing the world today."\n\nGợi ý từ dùng: "global warming", "urgent", "challenges", "humanity"',
        correctAnswer: 'Global warming has emerged as one of the most urgent challenges facing humanity in the modern era.',
        modelAnswer: 'Global warming has emerged as one of the most urgent challenges facing humanity in the modern era.',
        fallbackKeywords: ['global warming', 'urgent', 'challenges', 'facing humanity'],
        explanationVi: "'Climate change' → 'Global warming'. 'Pressing' → 'Urgent/Critical/Serious'. 'Issues' → 'challenges/problems'. 'The world today' → 'humanity/the modern era'. 'Has become' → 'has emerged as'."
      },
      {
        questionId: 'w12_model_intro_q03', level: 'intermediate', orderIndex: 3,
        type: 'paraphrase',
        questionText: 'Đây là câu mở bài từ một bài mẫu IELTS. Hãy viết lại bằng từ của bạn:\n\n"The increasing demands of modern work have made it more difficult for people to maintain a healthy work-life balance."\n\nGợi ý từ dùng: "mounting pressures", "contemporary professional life", "balance between work and personal wellbeing"',
        correctAnswer: 'The mounting pressures of contemporary professional life have made it increasingly difficult to maintain a healthy balance between work and personal wellbeing.',
        modelAnswer: 'The mounting pressures of contemporary professional life have made it increasingly difficult to maintain a healthy balance between work and personal wellbeing.',
        fallbackKeywords: ['mounting pressures', 'professional life', 'balance', 'work', 'wellbeing'],
        explanationVi: "'Increasing demands' → 'mounting pressures'. 'Modern work' → 'contemporary professional life'. Câu paraphrase tốt không copy bất kỳ cụm từ 3 từ liên tiếp nào từ câu gốc."
      }
    ]
  },
  {
    week: 12, block: 'model_answer', orderIndex: 25,
    topicName: 'Bài Mẫu - Đoạn Thân Bài Nguyên Nhân', topicEmoji: '🔍',
    essayType: 'cause_solution',
    prompt: 'Youth unemployment is increasing in many countries. What are the causes of this problem, and what measures can governments take to address it?',
    vocabularyList: [
      { term: 'youth unemployment', definitionVi: 'thất nghiệp ở thanh niên', example: 'Youth unemployment remains above 20% in several European countries.' },
      { term: 'practical experience', definitionVi: 'kinh nghiệm thực tế', example: 'Many graduates lack practical experience that employers demand.' },
      { term: 'mismatch', definitionVi: 'sự không phù hợp', example: 'There is a mismatch between graduates\' skills and market needs.' },
      { term: 'single-use plastics', definitionVi: 'nhựa dùng một lần', example: 'Single-use plastics are a major source of ocean pollution.' },
      { term: 'income inequality', definitionVi: 'bất bình đẳng thu nhập', example: 'Globalisation has worsened income inequality in many regions.' }
    ],
    questions: [
      {
        questionId: 'w12_model_cause_q01', level: 'beginner', orderIndex: 1,
        type: 'short_writing',
        questionText: 'Đọc đoạn mẫu về nguyên nhân gây ra thất nghiệp thanh niên:\n\n📝 BÀI MẪU:\n"One significant cause of youth unemployment is the lack of relevant practical skills. Many young graduates possess academic qualifications but have limited real-world experience. As a result, employers often prefer candidates who can contribute immediately, leaving fresh graduates struggling to find suitable work."\n\n✏️ VIẾT đoạn văn tương tự (~50-80 từ) về MỘT NGUYÊN NHÂN KHÁC.\nGợi ý: sự không phù hợp bằng cấp với nhu cầu thị trường / thiếu kỹ năng mềm / ảnh hưởng của tự động hóa',
        modelAnswer: 'Another major cause of youth unemployment is the mismatch between university qualifications and market demands. While many young people graduate with degrees in humanities, employers increasingly seek candidates with technical and digital skills. This gap between what graduates offer and what employers need means that many qualified young people remain unemployed despite holding university degrees.',
        fallbackKeywords: ['cause', 'youth unemployment', 'graduates', 'employers', 'skills', 'market'],
        explanationVi: "Cấu trúc body paragraph (PEEL): Point (nguyên nhân) → Explain (tại sao xảy ra) → Evidence/Example → Link (kết quả). Mỗi paragraph chỉ nói MỘT nguyên nhân. Dùng 'Another/A further/A primary cause of' để mở đầu."
      },
      {
        questionId: 'w12_model_cause_q02', level: 'elementary', orderIndex: 2,
        type: 'short_writing',
        questionText: 'Đọc đoạn mẫu về nguyên nhân ô nhiễm môi trường:\n\n📝 BÀI MẪU:\n"A primary cause of environmental pollution is the excessive reliance on fossil fuels. When coal and oil are burned in power plants and vehicles, they release large quantities of CO2 and other harmful gases. Without a shift towards cleaner energy sources, this contribution to air pollution will continue to worsen."\n\n✏️ VIẾT đoạn tương tự (~50-80 từ) về MỘT NGUYÊN NHÂN KHÁC của ô nhiễm.\nGợi ý: rác thải nhựa / nạn phá rừng / xả thải công nghiệp',
        modelAnswer: 'Another significant cause of environmental pollution is the widespread use of single-use plastics. These materials are cheap to produce but take hundreds of years to decompose, leading to enormous quantities of waste polluting oceans and landfills. Without strict regulations on plastic production and disposal, this source of environmental damage will continue to escalate.',
        fallbackKeywords: ['cause', 'pollution', 'plastic', 'waste', 'regulations', 'decompose'],
        explanationVi: "Cấu trúc: Topic Sentence (nguyên nhân) → Explanation (cơ chế: tại sao nó gây ô nhiễm) → Consequence (hệ quả nếu không hành động). 'Without + N, will + V' nhấn mạnh sự cần thiết của giải pháp."
      },
      {
        questionId: 'w12_model_cause_q03', level: 'intermediate', orderIndex: 3,
        type: 'short_writing',
        questionText: 'Đọc đoạn mẫu về nguyên nhân bất bình đẳng thu nhập:\n\n📝 BÀI MẪU:\n"One underlying cause of income inequality is the unequal access to quality education. Children from disadvantaged backgrounds often attend underfunded schools with fewer qualified teachers, resulting in lower academic achievement. This educational disparity creates a cycle of poverty that is difficult to break without targeted government intervention."\n\n✏️ VIẾT đoạn tương tự (~60-90 từ) về MỘT NGUYÊN NHÂN của bất bình đẳng thu nhập hoặc nghèo đói.\nGợi ý: toàn cầu hóa làm mất việc làm / thiếu cơ hội / hệ thống thuế không công bằng',
        modelAnswer: 'A further cause of income inequality is the impact of globalisation on labour markets. While globalisation has created wealth for businesses and highly-skilled workers, it has led to the outsourcing of low-skilled jobs to countries with cheaper labour. This shift has displaced millions of workers in developed nations, widening the income gap between educated professionals and those with limited qualifications.',
        fallbackKeywords: ['cause', 'income inequality', 'globalisation', 'labour', 'workers', 'skilled', 'gap'],
        explanationVi: "Trình độ intermediate cần: (1) Topic sentence học thuật, (2) Lập luận logic 2-3 bước nhân quả, (3) Từ vựng nâng cao (outsourcing, displaced, labour markets). 'While A, B' thể hiện sự tương phản trong cùng một câu."
      }
    ]
  },
  {
    week: 12, block: 'model_answer', orderIndex: 26,
    topicName: 'Bài Mẫu - Đoạn Thân Bài Lập Luận', topicEmoji: '💬',
    essayType: 'agree_disagree',
    prompt: 'Governments should spend more money on education than on defence and military. To what extent do you agree or disagree?',
    vocabularyList: [
      { term: 'long-term investment', definitionVi: 'đầu tư dài hạn', example: 'Education is the most valuable long-term investment a nation can make.' },
      { term: 'national security', definitionVi: 'an ninh quốc gia', example: 'Maintaining national security requires significant military expenditure.' },
      { term: 'carbon tax', definitionVi: 'thuế carbon', example: 'A carbon tax penalises companies for excessive emissions.' }
    ],
    questions: [
      {
        questionId: 'w12_model_opinion_q01', level: 'beginner', orderIndex: 1,
        type: 'paraphrase',
        questionText: 'Đọc đoạn lập luận sau và viết lại ý chính bằng ngôn ngữ của bạn (1-2 câu):\n\n📝 BÀI MẪU:\n"Firstly, investing in education has long-term benefits that far outweigh military spending. A well-educated population drives economic growth and innovation, reducing poverty and creating a more stable society. Countries that have prioritised education, such as Finland and South Korea, have consistently achieved higher levels of prosperity."\n\nDùng: "long-term benefits", "educated workforce", "economic growth".',
        correctAnswer: 'Investing in education yields long-term benefits as an educated workforce drives economic growth and creates a more stable and prosperous society.',
        modelAnswer: 'Investing in education yields long-term benefits as an educated workforce drives economic growth and creates a more stable and prosperous society.',
        fallbackKeywords: ['education', 'long-term benefits', 'educated', 'economic growth', 'society'],
        explanationVi: "Khi tóm tắt lập luận: nêu ĐIỂM CHÍNH (education > military) và LÝ DO CHÍNH (educated workforce → economic growth). Không cần liệt kê ví dụ vì chỉ tóm tắt trong 1-2 câu."
      },
      {
        questionId: 'w12_model_opinion_q02', level: 'elementary', orderIndex: 2,
        type: 'short_writing',
        questionText: 'Đọc đoạn mẫu lập luận ủng hộ quy định môi trường nghiêm ngặt hơn:\n\n📝 BÀI MẪU:\n"Stricter environmental regulations are essential to protect ecosystems from industrial damage. Without firm legal consequences, many corporations will continue to prioritise short-term profits over environmental responsibility. Countries such as Germany have demonstrated that robust laws can significantly reduce industrial pollution without hampering economic growth."\n\n✏️ VIẾT đoạn tương tự (~60-80 từ) lập luận ủng hộ MỘT CHÍNH SÁCH của chính phủ.\nGợi ý: thuế carbon / cấm nhựa dùng một lần / năng lượng tái tạo bắt buộc',
        modelAnswer: 'A carbon tax is a crucial policy tool for reducing greenhouse gas emissions. Without financial penalties for polluting, companies have little incentive to adopt cleaner production methods. Denmark and Sweden have successfully implemented carbon taxes that have significantly reduced national emissions while simultaneously funding investment in renewable energy, proving that environmental and economic goals need not conflict.',
        fallbackKeywords: ['policy', 'reduce', 'emissions', 'companies', 'incentive', 'implemented', 'renewable'],
        explanationVi: "Cấu trúc lập luận: Claim → Warrant (tại sao đúng) → Evidence (ví dụ quốc gia cụ thể) → Conclusion. Ví dụ quốc gia cụ thể (Denmark, Sweden, Germany) làm lập luận thuyết phục hơn nhiều trong IELTS."
      },
      {
        questionId: 'w12_model_opinion_q03', level: 'intermediate', orderIndex: 3,
        type: 'short_writing',
        questionText: 'Đọc đoạn mẫu lập luận PHẢN ĐỐI làm việc từ xa:\n\n📝 BÀI MẪU:\n"Despite its popularity, remote work has significant drawbacks that undermine workplace cohesion. Physical distance makes spontaneous collaboration and mentorship far more challenging, particularly for junior employees who rely on guidance from experienced colleagues. Research has found that remote workers report feeling more isolated and show reduced creativity compared to office-based counterparts."\n\n✏️ VIẾT đoạn tương tự (~70-90 từ) lập luận PHẢN ĐỐI một xu hướng hiện đại.\nGợi ý: học trực tuyến toàn thời gian / AI trong giáo dục / trẻ em dùng mạng xã hội',
        modelAnswer: 'Despite the enthusiasm surrounding AI in education, excessive reliance on these tools may hinder the development of critical thinking skills. When students depend on AI to generate essays and solve problems, they lose the opportunity to develop independent reasoning. A Stanford study found that students who regularly used AI writing assistants scored significantly lower on assessments requiring original argumentation, suggesting that over-dependence on technology compromises genuine learning.',
        fallbackKeywords: ['despite', 'AI', 'education', 'critical thinking', 'students', 'depend', 'development', 'learning'],
        explanationVi: "Lập luận phản đối mạnh cần: (1) 'Despite' thừa nhận mặt tích cực, (2) Lý do cụ thể tại sao có vấn đề, (3) Bằng chứng/nghiên cứu. 'Hinder the development of' = cản trở sự phát triển của — từ vựng học thuật Band 7+."
      }
    ]
  },
  {
    week: 12, block: 'model_answer', orderIndex: 27,
    topicName: 'Bài Mẫu - Viết Kết Bài', topicEmoji: '🏁',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that globalisation has been largely beneficial for the world economy. Others argue that it has created more problems than it has solved. Discuss both views and give your own opinion.',
    vocabularyList: [
      { term: 'in conclusion', definitionVi: 'tóm lại, kết luận', example: 'In conclusion, both sides of the argument have valid points.' },
      { term: 'on balance', definitionVi: 'xét tổng thể', example: 'On balance, the benefits outweigh the drawbacks.' },
      { term: 'provided that', definitionVi: 'miễn là, với điều kiện', example: 'Globalisation is beneficial provided that governments manage its effects fairly.' }
    ],
    questions: [
      {
        questionId: 'w12_model_concl_q01', level: 'beginner', orderIndex: 1,
        type: 'paraphrase',
        questionText: 'Đọc kết bài mẫu và viết lại bằng cách thay đổi từ ngữ:\n\n📝 BÀI MẪU:\n"In conclusion, although social media has drawbacks such as the spread of misinformation, the benefits of connecting people and sharing information outweigh these concerns. I therefore believe that social media, used responsibly, is a positive development."\n\nViết lại kết bài tương tự. Dùng: "To summarise", "despite", "connectivity", "used wisely".',
        correctAnswer: 'To summarise, despite concerns about misinformation, the advantages of social media in terms of connectivity and information sharing outweigh its drawbacks. I therefore believe that, when used wisely, social media is a largely positive development for society.',
        modelAnswer: 'To summarise, despite concerns about misinformation, the advantages of social media in terms of connectivity and information sharing outweigh its drawbacks. I therefore believe that, when used wisely, social media is a largely positive development for society.',
        fallbackKeywords: ['summarise', 'despite', 'advantages', 'connectivity', 'wisely', 'positive'],
        explanationVi: "'In conclusion' → 'To summarise/To conclude/In summary'. 'Although' → 'Despite (+ N/V-ing)'. Kết bài không nên nêu ý mới — chỉ tóm tắt và khẳng định lại lập trường."
      },
      {
        questionId: 'w12_model_concl_q02', level: 'elementary', orderIndex: 2,
        type: 'short_writing',
        questionText: 'Đọc kết bài mẫu cho bài luận về công nghệ:\n\n📝 BÀI MẪU:\n"In conclusion, while technology presents risks including addiction and job displacement, its transformative benefits in education, healthcare and communication far outweigh these drawbacks. I am firmly of the opinion that embracing technological advancement, combined with appropriate regulation, is essential for human progress."\n\n✏️ VIẾT kết bài tương tự (~50-70 từ) cho bài luận về toàn cầu hóa (globalisation).\nGợi ý: nhắc lại hai quan điểm ngắn gọn → quan điểm riêng → nhận định tổng quát.',
        modelAnswer: 'In conclusion, while globalisation has exacerbated income inequality and threatened local cultures, its role in driving economic growth and fostering international cooperation is undeniable. On balance, I believe globalisation is a largely beneficial force, provided that governments implement policies to ensure its advantages are shared equitably across all sections of society.',
        fallbackKeywords: ['conclusion', 'globalisation', 'inequality', 'economic growth', 'beneficial', 'governments', 'policies'],
        explanationVi: "Kết bài chuẩn IELTS: (1) Linking word mở đầu, (2) Tóm tắt 2 quan điểm NGẮN GỌN, (3) Quan điểm riêng RÕ RÀNG, (4) Điều kiện nếu cần ('provided that'). Tối đa 80 từ, không nêu ý mới."
      },
      {
        questionId: 'w12_model_concl_q03', level: 'intermediate', orderIndex: 3,
        type: 'paraphrase',
        questionText: 'Đọc và viết lại kết bài phức tạp sau bằng từ của bạn:\n\n📝 BÀI MẪU:\n"In summary, urbanisation offers significant economic opportunities through job creation and improved infrastructure, but simultaneously generates serious social and environmental challenges. Governments must therefore pursue sustainable urban development strategies that maximise the benefits of city growth while protecting the wellbeing of all residents, particularly those from marginalised communities."\n\nDùng: "urban migration", "on the one hand", "inclusive", "policy-making".',
        correctAnswer: 'In conclusion, urban migration brings economic benefits such as employment and improved services, but on the one hand creates social strain and environmental pressure. With inclusive policy-making, cities can be developed in ways that benefit all residents equally, including the most vulnerable.',
        modelAnswer: 'In conclusion, urban migration brings economic benefits such as employment and improved services, but on the one hand creates social strain and environmental pressure. With inclusive policy-making, cities can be developed in ways that benefit all residents equally, including the most vulnerable.',
        fallbackKeywords: ['urban migration', 'economic', 'inclusive', 'policy', 'residents', 'social'],
        explanationVi: "'Urban migration' = urbanisation (từ học thuật thay thế). 'Inclusive policy-making' = hoạch định chính sách có tính bao gồm. 'Marginalised communities' → 'the most vulnerable' (diễn đạt khác cho nhóm bị thiệt thòi)."
      }
    ]
  },
  {
    week: 12, block: 'model_answer', orderIndex: 28,
    topicName: 'Bài Mẫu - Paraphrase Đề Bài IELTS', topicEmoji: '📋',
    essayType: 'agree_disagree',
    prompt: 'The ability to accurately paraphrase the IELTS task prompt is essential for achieving Band 7+. Practise rewriting task prompts using synonyms and alternative sentence structures.',
    vocabularyList: [
      { term: 'paraphrase', definitionVi: 'diễn đạt lại', example: 'You must paraphrase the question — do not copy it word for word.' },
      { term: 'rephrase', definitionVi: 'diễn đạt theo cách khác', example: 'Try to rephrase the given statement using your own vocabulary.' },
      { term: 'wealth disparity', definitionVi: 'chênh lệch giàu nghèo', example: 'The wealth disparity between developed and developing nations is widening.' }
    ],
    questions: [
      {
        questionId: 'w12_model_paraph_q01', level: 'beginner', orderIndex: 1,
        type: 'paraphrase',
        questionText: 'Viết lại câu đề bài sau bằng từ của bạn (không copy quá 2 từ liên tiếp):\n\n"Young people today spend too much time on social media."\n\nGợi ý từ dùng: "teenagers", "excessive amount of time", "online platforms"',
        correctAnswer: 'Teenagers today devote an excessive amount of time to online social platforms.',
        modelAnswer: 'Teenagers today devote an excessive amount of time to online social platforms.',
        fallbackKeywords: ['teenagers', 'excessive', 'time', 'online', 'platforms'],
        explanationVi: "'Young people' → 'teenagers/young adults/the younger generation'. 'Spend time on' → 'devote time to/spend hours on'. 'Social media' → 'online platforms/social networking sites'. Thay đổi cả từ vựng lẫn cấu trúc (spend → devote to)."
      },
      {
        questionId: 'w12_model_paraph_q02', level: 'elementary', orderIndex: 2,
        type: 'paraphrase',
        questionText: 'Viết lại câu đề bài sau bằng từ của bạn:\n\n"Governments should invest more in public transport rather than expanding roads for private cars."\n\nGợi ý từ dùng: "public authorities", "allocate greater funds", "mass transit", "road infrastructure"',
        correctAnswer: 'Public authorities should allocate greater funds to mass transit systems rather than expanding road infrastructure for private vehicles.',
        modelAnswer: 'Public authorities should allocate greater funds to mass transit systems rather than expanding road infrastructure for private vehicles.',
        fallbackKeywords: ['public authorities', 'allocate', 'mass transit', 'road infrastructure', 'private vehicles'],
        explanationVi: "'Governments' → 'public authorities/policymakers'. 'Invest in' → 'allocate funds to/channel resources into'. 'Public transport' → 'mass transit/public transportation'. 'Roads for private cars' → 'road infrastructure for private vehicles'."
      },
      {
        questionId: 'w12_model_paraph_q03', level: 'intermediate', orderIndex: 3,
        type: 'paraphrase',
        questionText: 'Viết lại câu đề bài phức tạp sau, thay đổi cả từ vựng lẫn cấu trúc câu:\n\n"The increasing gap between the rich and the poor is the most pressing social issue of the twenty-first century."\n\nGợi ý từ dùng: "widening wealth disparity", "arguably", "paramount", "contemporary society"',
        correctAnswer: 'The widening wealth disparity between affluent and disadvantaged populations is arguably the most paramount social challenge facing contemporary society.',
        modelAnswer: 'The widening wealth disparity between affluent and disadvantaged populations is arguably the most paramount social challenge facing contemporary society.',
        fallbackKeywords: ['widening wealth disparity', 'affluent', 'disadvantaged', 'paramount', 'contemporary society'],
        explanationVi: "'The gap' → 'the disparity/divide'. 'The rich and the poor' → 'affluent and disadvantaged populations'. 'Most pressing' → 'paramount/most critical'. 'Twenty-first century' → 'contemporary society'. 'Arguably' = có thể nói là — thể hiện quan điểm học thuật thận trọng."
      }
    ]
  },

  // ─── WEEK 11 (continued): Prison vs. Rehabilitation ──────────────────────
  {
    week: 11, block: 'mixed', orderIndex: 18,
    topicName: 'Prison vs. Rehabilitation', topicEmoji: '🔒',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'prison sentence', definitionVi: 'án tù', example: 'Longer prison sentences are sometimes seen as a deterrent to crime.' },
      { term: 'deterrent', definitionVi: 'biện pháp răn đe', example: 'Long prison sentences may act as a deterrent, discouraging potential offenders.' },
      { term: 'rehabilitation', definitionVi: 'cải tạo', example: 'Rehabilitation programs help prisoners become productive members of society.' },
      { term: 're-offend', definitionVi: 'tái phạm', example: 'Without rehabilitation, many offenders are likely to re-offend after release.' },
      { term: 'law enforcement', definitionVi: 'thực thi pháp luật', example: 'Strong law enforcement is needed to maintain public order.' },
      { term: 'alternative punishment', definitionVi: 'hình phạt thay thế', example: 'Community service is an alternative punishment to imprisonment.' },
      { term: 'moral education', definitionVi: 'giáo dục đạo đức', example: 'Moral education in schools can help prevent youth crime.' },
      { term: 'community service', definitionVi: 'lao động công ích', example: 'Community service allows offenders to repay their debt to society.' },
      { term: 'counseling', definitionVi: 'tư vấn tâm lý', example: 'Counseling helps offenders address the root causes of their behaviour.' },
      { term: 'reduce crime', definitionVi: 'giảm tội phạm', example: 'Both stricter sentences and rehabilitation aim to reduce crime in the long term.' },
      { term: 'root causes', definitionVi: 'nguyên nhân gốc rễ', example: 'Prison alone does not tackle the root causes of criminal behaviour.' },
      { term: 'vocational training', definitionVi: 'đào tạo nghề', example: 'Vocational training gives prisoners marketable skills for life after release.' },
      { term: 'reintegrate into society', definitionVi: 'tái hòa nhập xã hội', example: 'Rehabilitation helps offenders reintegrate into society as law-abiding citizens.' },
      { term: 'capital punishment', definitionVi: 'án tử hình', example: 'Capital punishment remains a controversial topic in criminal justice debates.' },
      { term: 'social support', definitionVi: 'hỗ trợ xã hội', example: 'Social support networks are essential for offenders returning to the community.' }
    ],
    questions: [
      {
        questionId: 'w11t18_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion." Đây là dạng essay gì?',
        options: ['Advantages & Disadvantages', 'Cause & Effect', 'Discuss Both Views', 'Opinion Essay'],
        correctAnswer: 'Discuss Both Views',
        explanationVi: 'Cụm "Discuss both views and give your own opinion" xuất hiện trực tiếp. View 1 = án tù dài; View 2 = các phương pháp thay thế như cải tạo và giáo dục.'
      },
      {
        questionId: 'w11t18_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu:\n\n"Longer prison sentences may act as a strong _____, discouraging potential offenders from committing crimes."',
        correctAnswer: 'deterrent',
        explanationVi: '"Deterrent" = biện pháp răn đe — từ khóa quan trọng khi lập luận về tác dụng của hình phạt tù.'
      },
      {
        questionId: 'w11t18_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Một số người cho rằng cách tốt nhất để giảm tội phạm là áp dụng mức án tù dài hơn."',
        correctAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        modelAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        fallbackKeywords: ['reduce crime', 'longer prison sentences', 'argue', 'impose'],
        explanationVi: "'Impose prison sentences' = áp đặt/tuyên bố mức án tù. 'The best way to' = cách tốt nhất để. 'Some people argue that' = cấu trúc trình bày quan điểm."
      },
      {
        questionId: 'w11t18_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Tuy nhiên, nhiều người tin rằng tăng án tù không giải quyết nguyên nhân gốc rễ của tội phạm."',
        correctAnswer: 'However, many people believe that increasing prison sentences does not address the root causes of crime.',
        modelAnswer: 'However, many people believe that increasing prison sentences does not address the root causes of crime.',
        fallbackKeywords: ['root causes', 'crime', 'prison sentences', 'address'],
        explanationVi: "'Root causes' = nguyên nhân gốc rễ. 'Address the root causes' = giải quyết nguyên nhân gốc rễ. 'Does not address' = không giải quyết."
      },
      {
        questionId: 'w11t18_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Các chương trình cải tạo giúp tù nhân hòa nhập lại xã hội và giảm tái phạm."',
        correctAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        modelAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        fallbackKeywords: ['rehabilitation programs', 'reintegrate', 'society', 're-offending', 'prisoners'],
        explanationVi: "'Reintegrate into society' = tái hòa nhập xã hội. 'Reduce the likelihood of re-offending' = giảm khả năng tái phạm. 'Help + O + V' = giúp ai làm gì."
      },
      {
        questionId: 'w11t18_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Giáo dục đạo đức và hướng nghiệp có thể giúp thanh thiếu niên tránh xa tội phạm."',
        correctAnswer: 'Moral education and vocational training can help young people stay away from crime.',
        modelAnswer: 'Moral education and vocational training can help young people stay away from crime.',
        fallbackKeywords: ['moral education', 'vocational training', 'young people', 'crime'],
        explanationVi: "'Moral education' = giáo dục đạo đức. 'Vocational training' = đào tạo nghề. 'Stay away from crime' = tránh xa tội phạm."
      },
      {
        questionId: 'w11t18_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n\n[longer prison sentences / Whilst / potential criminals, / may / deter / they / do not / tackle / poverty, / unemployment, / such / as / root causes / the / and / family breakdown]',
        correctAnswer: 'Whilst longer prison sentences may deter potential criminals, they do not tackle the root causes such as poverty, unemployment, and family breakdown.',
        explanationVi: '"Whilst" = trong khi đó (British English). "Deter" = răn đe. "Tackle root causes" = giải quyết nguyên nhân gốc rễ.'
      },
      {
        questionId: 'w11t18_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi gì? Hãy sửa lại:\n\n"Community service is often seen as a more effectively alternative to imprisonment for minor offences."',
        correctAnswer: 'Community service is often seen as a more effective alternative to imprisonment for minor offences.',
        modelAnswer: 'Community service is often seen as a more effective alternative to imprisonment for minor offences.',
        fallbackKeywords: ['community service', 'effective alternative', 'imprisonment', 'offences'],
        explanationVi: "Lỗi: \"more effectively\" sai — phải dùng tính từ \"effective\" để bổ nghĩa cho danh từ \"alternative\"."
      },
      {
        questionId: 'w11t18_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh:\n\n"Giải quyết cả nguyên nhân gốc rễ và hậu quả của tội phạm, đồng thời hỗ trợ tù nhân hòa nhập trở lại xã hội, sẽ giúp xã hội an toàn hơn."',
        correctAnswer: 'Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.',
        modelAnswer: 'Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.',
        fallbackKeywords: ['root causes', 'reintegrate', 'society', 'safer community', 'addressing'],
        explanationVi: "'Addressing both A and B' = giải quyết cả A lẫn B. 'Contribute to a safer community' = góp phần tạo ra xã hội an toàn hơn. 'Ultimately' = cuối cùng."
      },
      {
        questionId: 'w11t18_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viết lại câu sau mà không dùng: best way, reduce crime, longer prison sentences, better ways:\n\n"Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime."',
        correctAnswer: 'While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.',
        modelAnswer: 'While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.',
        fallbackKeywords: ['custodial sentences', 'curbing', 'criminal activity', 'rehabilitative', 'alternative approaches'],
        explanationVi: "Paraphrase: 'prison sentences' → 'custodial sentences', 'reduce crime' → 'curbing criminal activity', 'better ways' → 'alternative, more rehabilitative approaches'."
      },
      {
        questionId: 'w11t18_q11', level: 'elementary', orderIndex: 11,
        type: 'topic_sentence',
        questionText: 'Body paragraph dưới đây thiếu topic sentence. Chọn câu phù hợp nhất:\n\n"___. Offenders who serve extended sentences are removed from society and deterred from future crimes by the prospect of harsh punishment. Moreover, this sends a clear message to others that criminal behaviour will not be tolerated."',
        options: [
          'Crime rates are very high in many countries today.',
          'There are many ways to address the problem of crime.',
          'Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.',
          'Prison rehabilitation is not always successful in reducing re-offending.'
        ],
        correctAnswer: 'Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.',
        explanationVi: 'Topic sentence cần phản ánh nội dung đoạn văn (án tù dài → bảo vệ xã hội, răn đe). Câu C giới thiệu chính xác luận điểm được triển khai.'
      },
      {
        questionId: 'w11t18_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viết 1 đoạn body paragraph (~80–100 từ) lập luận rằng cải tạo và tái hòa nhập xã hội hiệu quả hơn án tù dài để giảm tội phạm.\n\nGợi ý: rehabilitation / vocational training / root causes / reintegrate into society / community service / social support',
        modelAnswer: 'Critics of lengthy imprisonment argue that extended incarceration fails to address the root causes of criminal behaviour, such as poverty, unemployment, and family breakdown. Without tackling these underlying social factors, offenders are likely to re-offend upon release, perpetuating a cycle of crime. A more effective approach involves rehabilitation programs that equip prisoners with vocational training and counseling, enabling them to reintegrate into society as productive members. Countries that have invested in rehabilitative justice, such as Norway, report significantly lower re-offending rates compared to those relying primarily on strict punishment, demonstrating that social support is a more sustainable crime-reduction strategy.',
        fallbackKeywords: ['rehabilitation', 'root causes', 'reintegrate', 'vocational training', 'crime', 'social support'],
        explanationVi: "Cấu trúc PEEL: topic sentence (View 2) → explanation (root causes not addressed by prison) → example (Norway) → conclusion. 'Perpetuating a cycle' = duy trì vòng lặp."
      },
      // ── QT-4 Intermediate (W9T8) ──
      {
        questionId: 'w11t18_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "crime rate"):\n\n"Tỷ lệ tội phạm đang tăng nhanh ở nhiều quốc gia."',
        correctAnswer: 'The crime rate is rising rapidly in many countries.',
        modelAnswer: 'The crime rate is rising rapidly in many countries.',
        fallbackKeywords: ['crime rate', 'rising rapidly', 'countries'],
        explanationVi: "'The crime rate is rising rapidly' = Present Continuous diễn tả xu hướng đang xảy ra. 'Rising' hoặc 'increasing' đều được chấp nhận."
      },
      {
        questionId: 'w11t18_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "prison sentence" và "reduce crime"):\n\n"Một số người cho rằng cách tốt nhất để giảm tội phạm là áp dụng mức án tù dài hơn."',
        correctAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        modelAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        fallbackKeywords: ['prison sentence', 'reduce crime', 'longer', 'impose'],
        explanationVi: "'The best way to + V + is to + V' = cách tốt nhất để... là... 'Impose prison sentences' = áp dụng/tuyên án tù. 'Longer' = dài hơn (so sánh hơn)."
      },
      {
        questionId: 'w11t18_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "strict punishment" và "deterrent"):\n\n"Hình phạt nghiêm khắc có thể là một biện pháp răn đe mạnh mẽ."',
        correctAnswer: 'Strict punishment can serve as a powerful deterrent against criminal behaviour.',
        modelAnswer: 'Strict punishment can serve as a powerful deterrent against criminal behaviour.',
        fallbackKeywords: ['strict punishment', 'deterrent', 'powerful'],
        explanationVi: "'Serve as + N' = đóng vai trò là/có tác dụng như. 'A powerful deterrent against' = biện pháp răn đe mạnh mẽ chống lại. 'Criminal behaviour' = hành vi tội phạm."
      },
      {
        questionId: 'w11t18_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "repeat offender" và "public safety"):\n\n"Những người tái phạm có thể bị ngăn cản khỏi gây hại cho xã hội nếu bị giam lâu hơn."',
        correctAnswer: 'Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.',
        modelAnswer: 'Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.',
        fallbackKeywords: ['repeat offender', 'public safety', 'imprisoned', 'longer'],
        explanationVi: "'Be prevented from + V-ing' = bị ngăn cản làm gì. 'Repeat offenders' = những người tái phạm. 'Endangering public safety' = gây nguy hiểm cho an toàn cộng đồng."
      },
      {
        questionId: 'w11t18_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "root causes" và "prison sentence"):\n\n"Mặt khác, nhiều người tin rằng tăng án tù không giải quyết nguyên nhân gốc rễ của tội phạm."',
        correctAnswer: 'On the other hand, many people believe that longer prison sentences do not address the root causes of crime.',
        modelAnswer: 'On the other hand, many people believe that longer prison sentences do not address the root causes of crime.',
        fallbackKeywords: ['root causes', 'prison sentence', 'do not address'],
        explanationVi: "'On the other hand' = mặt khác (connective để đối lập View 2). 'Do not address the root causes of' = không giải quyết nguyên nhân gốc rễ của."
      },
      {
        questionId: 'w11t18_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "poverty", "unemployment", và "commit a crime"):\n\n"Nghèo đói và thất nghiệp là những nguyên nhân quan trọng dẫn đến tội phạm."',
        correctAnswer: 'Poverty and unemployment are significant underlying causes that drive people to commit a crime.',
        modelAnswer: 'Poverty and unemployment are significant underlying causes that drive people to commit a crime.',
        fallbackKeywords: ['poverty', 'unemployment', 'commit a crime', 'underlying causes'],
        explanationVi: "'Underlying causes' = nguyên nhân sâu xa. 'Drive + O + to + V' = thúc đẩy ai làm gì. 'Commit a crime' = phạm tội."
      },
      {
        questionId: 'w11t18_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "rehabilitation" và "reintegrate into society"):\n\n"Các chương trình cải tạo giúp tù nhân hòa nhập lại xã hội và giảm tái phạm."',
        correctAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        modelAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        fallbackKeywords: ['rehabilitation', 'reintegrate into society', 're-offending'],
        explanationVi: "'Help + O + V (bare infinitive)' = giúp ai làm gì. 'Reintegrate into society' = tái hòa nhập xã hội. 'The likelihood of re-offending' = khả năng tái phạm."
      },
      {
        questionId: 'w11t18_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "community service" và "alternative punishment"):\n\n"Một số người tin rằng lao động công ích là một hình phạt thay thế hiệu quả."',
        correctAnswer: 'Some people believe that community service is an effective alternative punishment.',
        modelAnswer: 'Some people believe that community service is an effective alternative punishment.',
        fallbackKeywords: ['community service', 'alternative punishment', 'effective'],
        explanationVi: "'An effective alternative punishment' = một hình phạt thay thế hiệu quả. 'Community service' = lao động công ích/phục vụ cộng đồng."
      },
      {
        questionId: 'w11t18_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "law enforcement" và "prevent crime"):\n\n"Thực thi pháp luật hiệu quả là cần thiết để ngăn chặn tội phạm."',
        correctAnswer: 'Effective law enforcement is essential to prevent crime.',
        modelAnswer: 'Effective law enforcement is essential to prevent crime.',
        fallbackKeywords: ['law enforcement', 'prevent crime', 'essential'],
        explanationVi: "'Is essential to + V' = là thiết yếu để. 'Law enforcement' = thực thi pháp luật (danh từ không đếm được). 'Effective' đứng trước danh từ."
      },
      {
        questionId: 'w11t18_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dịch sang tiếng Anh (dùng từ "root causes" và "safer society"):\n\n"Giải quyết cả nguyên nhân gốc rễ và hậu quả của tội phạm sẽ giúp xã hội an toàn hơn."',
        correctAnswer: 'Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.',
        modelAnswer: 'Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.',
        fallbackKeywords: ['root causes', 'safer society', 'addressing', 'consequences'],
        explanationVi: "'Addressing both A and B' = giải quyết cả A lẫn B. 'Contribute to a safer society' = góp phần tạo ra xã hội an toàn hơn. 'Ultimately' = cuối cùng."
      }
    ]
  }
];

async function runSeed() {
  const Task2Topic = require('../models/Task2Topic');

  const ops = topics.map(t => ({
    replaceOne: { filter: { topicName: t.topicName }, replacement: t, upsert: true }
  }));

  const result = await Task2Topic.bulkWrite(ops);
  console.log(`[Task2Seed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} Task 2 topics`);
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

module.exports = { runSeed, topics };
