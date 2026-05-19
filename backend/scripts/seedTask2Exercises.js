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
      { term: 'social isolation', definitionVi: 'sự cô lập xã hội', example: 'Studying alone can lead to social isolation.' }
    ],
    questions: [
      {
        questionId: 'w1t1_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đọc đề bài sau và cho biết đây là dạng essay nào?\n\n"Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?"',
        options: ['Agree or Disagree', 'Advantages & Disadvantages', 'Discuss Both Views', 'Cause & Solution'],
        correctAnswer: 'Advantages & Disadvantages',
        explanationVi: 'Keyword "advantages and disadvantages" trong câu hỏi "What are the advantages and disadvantages" xác định ngay đây là dạng Advantages & Disadvantages. Dạng này yêu cầu phân tích cả hai mặt tích cực và tiêu cực một cách cân bằng.',      },
      {
        questionId: 'w1t1_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ còn thiếu để hoàn chỉnh câu mở bài:\n\n"In recent _____, online learning has become an increasingly prominent feature of modern life."',
        correctAnswer: 'years',
        explanationVi: "Công thức mở bài chuẩn: 'In recent years...' — luôn dùng 'years' (số nhiều). Đây là cách bắt đầu essay học thuật rất phổ biến.",      },
      {
        questionId: 'w1t1_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng từ "online learning"):\n\n"Nhiều trường đại học đã bắt đầu cung cấp khóa học trực tuyến để sinh viên có thể học ở bất cứ đâu."',
        correctAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        modelAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        fallbackKeywords: ['universities', 'online learning', 'students', 'anywhere', 'started'],
        explanationVi: "Cấu trúc 'so that + mệnh đề mục đích' diễn tả kết quả mong muốn. 'have started + V-ing' dùng Present Perfect để nhấn mạnh sự thay đổi gần đây.",      }
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
      { term: 'addiction', definitionVi: 'sự nghiện ngập', example: 'Smartphone addiction is a growing problem among teenagers.' },
      { term: 'face-to-face interaction', definitionVi: 'giao tiếp trực tiếp', example: 'Face-to-face interaction is important for building relationships.' }
    ],
    questions: [
      {
        questionId: 'w1t2_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đọc đề bài: "Do the advantages of this development outweigh the disadvantages?" — Đây là dạng essay nào?',
        options: ['Discuss Both Views', 'Advantages & Disadvantages', 'Cause & Effect', 'Agree or Disagree'],
        correctAnswer: 'Advantages & Disadvantages',
        explanationVi: "Câu hỏi 'Do the advantages outweigh the disadvantages?' là biến thể của dạng Advantages & Disadvantages. Bạn cần so sánh hai mặt và đưa ra quan điểm rõ ràng về bên nào nổi trội hơn.",      },
      {
        questionId: 'w1t2_q02', level: 'elementary', orderIndex: 2,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ sau thành câu hoàn chỉnh:\n[smartphones / of / One / most / the / advantages / is / convenience / their]',
        correctAnswer: 'One of the most advantages of smartphones is their convenience.',
        modelAnswer: 'One of the most significant advantages of smartphones is their convenience.',
        fallbackKeywords: ['advantages', 'smartphones', 'convenience'],
        explanationVi: "Cấu trúc 'One of the + most + adj + noun + of + noun' dùng để nêu một ưu điểm nổi bật nhất.",      },
      {
        questionId: 'w1t2_q03', level: 'intermediate', orderIndex: 3,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi ngữ pháp. Hãy sửa lại:\n\n"Although smartphones have many advantages, but they also cause addiction and reduce face-to-face interaction."',
        correctAnswer: 'Although smartphones have many advantages, they also cause addiction and reduce face-to-face interaction.',
        modelAnswer: 'Although smartphones have many advantages, they also cause addiction and reduce face-to-face interaction.',
        fallbackKeywords: ['although', 'smartphones', 'advantages', 'addiction'],
        explanationVi: "Lỗi: Không dùng 'Although' và 'but' cùng lúc trong một câu. Chọn một trong hai: 'Although...,' hoặc '..., but...'",      }
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
      { term: 'filter bubble', definitionVi: 'bong bóng thông tin', example: 'Social media algorithms create filter bubbles that limit our worldview.' }
    ],
    questions: [
      {
        questionId: 'w2t3_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"Social media has become a _____ source of news for millions of people worldwide."',
        correctAnswer: 'major',
        explanationVi: "'Major' nghĩa là 'chính, quan trọng'. Cụm 'a major source of' rất phổ biến trong IELTS Writing.",      },
      {
        questionId: 'w2t3_q02', level: 'elementary', orderIndex: 2,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence phù hợp nhất cho đoạn văn về NHƯỢC ĐIỂM của việc dùng mạng xã hội để đọc tin tức:',
        options: [
          'Social media is very popular nowadays.',
          'However, relying on social media for news has several significant drawbacks.',
          'People use social media every day.',
          'News can be found in many places.'
        ],
        correctAnswer: 'However, relying on social media for news has several significant drawbacks.',
        explanationVi: "Topic sentence phải nêu rõ luận điểm (nhược điểm) và dùng linking word 'However' để tạo đối lập với đoạn ưu điểm trước. Các lựa chọn khác quá chung chung.",      },
      {
        questionId: 'w2t3_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "misinformation" và "credibility"):\n\n"Một trong những nhược điểm lớn nhất của mạng xã hội là sự lan truyền của thông tin sai lệch, làm giảm độ tin cậy của các nguồn tin tức."',
        correctAnswer: 'One of the biggest disadvantages of social media is the spread of misinformation, which undermines the credibility of news sources.',
        modelAnswer: 'One of the biggest disadvantages of social media is the spread of misinformation, which undermines the credibility of news sources.',
        fallbackKeywords: ['disadvantages', 'social media', 'misinformation', 'credibility'],
        explanationVi: "Mệnh đề quan hệ 'which undermines...' giải thích hệ quả của misinformation. 'Undermine' nghĩa là 'làm suy yếu, làm giảm'.",      }
    ]
  },

  // ─── BLOCK 2: Week 3-4 — Cause & Effect/Solution / Education ───
  {
    week: 3, block: 'cause_effect', orderIndex: 4,
    topicName: 'Online Learning and Student Motivation', topicEmoji: '📉',
    essayType: 'cause_effect',
    prompt: 'Many students find it difficult to stay motivated when studying online. What are the causes of this problem, and what effects does it have on students?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'motivation', definitionVi: 'động lực', example: 'Lack of motivation is one of the biggest challenges in online learning.' },
      { term: 'distraction', definitionVi: 'sự phân tâm', example: 'Social media is a major source of distraction for online students.' },
      { term: 'procrastination', definitionVi: 'sự trì hoãn', example: 'Without deadlines, students tend to procrastinate.' }
    ],
    questions: [
      {
        questionId: 'w3t4_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What are the causes of this problem, and what effects does it have?" — Đây là dạng essay nào?',
        options: ['Agree or Disagree', 'Advantages & Disadvantages', 'Cause & Effect', 'Discuss Both Views'],
        correctAnswer: 'Cause & Effect',
        explanationVi: "Keyword 'causes' và 'effects' trong cùng một câu hỏi xác định đây là dạng Cause & Effect. Bài luận cần phân tích nguyên nhân (causes) và kết quả (effects) riêng biệt.",      },
      {
        questionId: 'w3t4_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"One of the main _____ of low motivation in online learning is the lack of direct interaction with teachers and classmates."',
        correctAnswer: 'causes',
        explanationVi: "'Causes' là danh từ số nhiều của 'cause' (nguyên nhân). Cấu trúc 'one of the main causes of + N' rất quan trọng khi viết đoạn cause.",      },
      {
        questionId: 'w3t4_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "distraction" và "academic performance"):\n\n"Sự phân tâm từ mạng xã hội là một nguyên nhân chính dẫn đến kết quả học tập kém của học sinh trực tuyến."',
        correctAnswer: 'Distraction from social media is a major cause of poor academic performance among online students.',
        modelAnswer: 'Distraction from social media is a major cause of poor academic performance among online students.',
        fallbackKeywords: ['distraction', 'social media', 'cause', 'academic performance', 'online'],
        explanationVi: "'Poor academic performance' là cụm danh từ chuẩn học thuật để nói về kết quả học kém. 'A major cause of' + danh từ diễn đạt nguyên nhân.",      }
    ]
  },
  {
    week: 3, block: 'cause_solution', orderIndex: 5,
    topicName: 'Academic Pressure on Teenagers', topicEmoji: '😓',
    essayType: 'cause_solution',
    prompt: 'Students today face more academic pressure than ever before. What are the causes of this pressure, and what can be done to reduce it?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'academic pressure', definitionVi: 'áp lực học tập', example: 'Academic pressure can lead to anxiety and depression.' },
      { term: 'competitive', definitionVi: 'cạnh tranh', example: 'The highly competitive job market puts pressure on students.' },
      { term: 'curriculum reform', definitionVi: 'cải cách chương trình học', example: 'Curriculum reform is needed to reduce student stress.' }
    ],
    questions: [
      {
        questionId: 'w3t5_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What are the causes of this pressure, and what can be done to reduce it?" — Đây là dạng essay nào?',
        options: ['Cause & Effect', 'Cause & Solution', 'Agree or Disagree', 'Advantages & Disadvantages'],
        correctAnswer: 'Cause & Solution',
        explanationVi: "Keyword 'causes' kết hợp với 'what can be done' (giải pháp) cho thấy đây là dạng Cause & Solution. Không có từ 'effects' — thay vào đó là yêu cầu tìm giải pháp.",      },
      {
        questionId: 'w3t5_q02', level: 'elementary', orderIndex: 2,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ thành câu về giải pháp:\n[pressure / reduce / school / academic / counselling / can / services / mental health]',
        correctAnswer: 'School mental health counselling services can reduce academic pressure.',
        modelAnswer: 'School mental health counselling services can reduce academic pressure.',
        fallbackKeywords: ['school', 'mental health', 'counselling', 'reduce', 'academic pressure'],
        explanationVi: "Cấu trúc 'N + can + V + O' dùng khi đề xuất giải pháp. 'Mental health counselling services' là cụm danh từ ghép.",      },
      {
        questionId: 'w3t5_q03', level: 'intermediate', orderIndex: 3,
        type: 'short_writing',
        questionText: 'Viết 1 body paragraph (~60-90 từ) về MỘT GIẢI PHÁP để giảm áp lực học tập cho học sinh.\n\nDùng cấu trúc: Topic Sentence → Explanation → Example\nGợi ý: cải cách chương trình học / hỗ trợ tâm lý / giảm thi cử',
        modelAnswer: 'One effective solution is to reform the curriculum to reduce the number of compulsory exams. This would allow students to learn at their own pace without the constant fear of failure. For example, Finland has successfully adopted a student-centred approach with fewer standardised tests, resulting in lower stress levels and higher academic achievement among young people.',
        fallbackKeywords: ['solution', 'reform', 'curriculum', 'exams', 'students', 'stress', 'example'],
        explanationVi: "Cấu trúc PEEL: Point (giải pháp) → Explain (tại sao hiệu quả) → Example (ví dụ cụ thể). Mỗi paragraph chỉ nêu MỘT giải pháp duy nhất.",
        useAiGrading: true,      }
    ]
  },
  {
    week: 4, block: 'effect_solution', orderIndex: 6,
    topicName: 'Decline in Reading Habits', topicEmoji: '📚',
    essayType: 'effect_solution',
    prompt: 'Young people are reading fewer books than in the past. What effects does this trend have on society, and what solutions can be implemented?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'critical thinking', definitionVi: 'tư duy phản biện', example: 'Reading books enhances critical thinking skills.' },
      { term: 'literacy rate', definitionVi: 'tỷ lệ biết đọc biết viết', example: 'Countries with high literacy rates tend to have stronger economies.' },
      { term: 'implement', definitionVi: 'thực hiện, áp dụng', example: 'The government plans to implement a national reading programme.' }
    ],
    questions: [
      {
        questionId: 'w4t6_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What effects does this trend have? What solutions can be implemented?" — Đây là dạng essay nào?',
        options: ['Cause & Effect', 'Effect & Solution', 'Discuss Both Views', 'Agree or Disagree'],
        correctAnswer: 'Effect & Solution',
        explanationVi: "Đề hỏi 'effects' (hệ quả) và 'solutions' (giải pháp) — không hỏi causes. Đây là dạng Effect & Solution. Bài luận cần trình bày: hệ quả → giải pháp.",      },
      {
        questionId: 'w4t6_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"One major _____ of declining reading habits is the weakening of critical thinking skills among young people."',
        correctAnswer: 'effect',
        explanationVi: "'Effect' (danh từ) = hệ quả. So sánh: 'cause' vs 'effect'. Câu này dùng 'one major effect of + N' để mở đầu đoạn phân tích hệ quả.",      },
      {
        questionId: 'w4t6_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "implement" và "reading programme"):\n\n"Chính phủ nên thực hiện các chương trình đọc sách quốc gia để khuyến khích thói quen đọc sách từ khi còn nhỏ."',
        correctAnswer: 'The government should implement national reading programmes to encourage reading habits from an early age.',
        modelAnswer: 'The government should implement national reading programmes to encourage reading habits from an early age.',
        fallbackKeywords: ['government', 'implement', 'reading', 'programme', 'encourage', 'early'],
        explanationVi: "'Implement' + danh từ = 'thực hiện/áp dụng' chính sách. 'From an early age' = 'từ khi còn nhỏ'. Dùng 'should' để đề xuất giải pháp.",      }
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
      { term: 'unemployment', definitionVi: 'thất nghiệp', example: 'High dropout rates contribute to youth unemployment.' }
    ],
    questions: [
      {
        questionId: 'w4t7_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"The high cost of university tuition is one of the main _____ of the increasing dropout rate."',
        correctAnswer: 'causes',
        explanationVi: "'Causes of + N' = nguyên nhân của. Đây là cấu trúc cơ bản để liệt kê nguyên nhân trong body paragraph.",      },
      {
        questionId: 'w4t7_q02', level: 'elementary', orderIndex: 2,
        type: 'error_correction',
        questionText: 'Câu sau có lỗi. Hãy sửa:\n\n"Dropping out of university have many negative effects on both individuals and society."',
        correctAnswer: 'Dropping out of university has many negative effects on both individuals and society.',
        modelAnswer: 'Dropping out of university has many negative effects on both individuals and society.',
        fallbackKeywords: ['dropping', 'university', 'has', 'negative', 'effects', 'individuals', 'society'],
        explanationVi: "Lỗi: 'Dropping out' là danh động từ (gerund phrase) làm chủ ngữ → động từ phải là số ít: 'has' (không phải 'have').",      },
      {
        questionId: 'w4t7_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "financial burden" và "dropout rate"):\n\n"Gánh nặng tài chính từ học phí đại học là nguyên nhân chính dẫn đến tỷ lệ bỏ học ngày càng tăng."',
        correctAnswer: 'The financial burden of university tuition fees is a major cause of the rising dropout rate.',
        modelAnswer: 'The financial burden of university tuition fees is a major cause of the rising dropout rate.',
        fallbackKeywords: ['financial burden', 'tuition', 'cause', 'dropout rate', 'rising'],
        explanationVi: "'The rising + N' = 'sự gia tăng của'. 'Financial burden' là cụm danh từ học thuật quan trọng.",      }
    ]
  },

  // ─── BLOCK 3: Week 5-6 — Agree or Disagree / Work ───
  {
    week: 5, block: 'agree_disagree', orderIndex: 8,
    topicName: 'Shorter Work Week', topicEmoji: '⏰',
    essayType: 'agree_disagree',
    prompt: 'The working week should be shorter and workers should have a longer weekend. Do you agree or disagree?',
    hintAdvantages: ['reduces stress', 'increases productivity', 'better work-life balance'],
    hintDisadvantages: ['economic impact', 'reduced income', 'lower output'],
    vocabularyList: [
      { term: 'work-life balance', definitionVi: 'cân bằng công việc và cuộc sống', example: 'A shorter work week promotes a healthier work-life balance.' },
      { term: 'productivity', definitionVi: 'năng suất lao động', example: 'Studies show that well-rested workers have higher productivity.' },
      { term: 'economic output', definitionVi: 'sản lượng kinh tế', example: 'Reducing working hours could lower economic output.' }
    ],
    questions: [
      {
        questionId: 'w5t8_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "Do you agree or disagree?" — Đây là dạng essay nào?',
        options: ['Advantages & Disadvantages', 'Cause & Solution', 'Agree or Disagree', 'Discuss Both Views'],
        correctAnswer: 'Agree or Disagree',
        explanationVi: "Câu hỏi 'Do you agree or disagree?' xác định rõ đây là dạng Opinion Essay (Agree/Disagree). Bạn PHẢI đưa ra quan điểm rõ ràng và nhất quán: hoàn toàn đồng ý, hoàn toàn không đồng ý, hoặc đồng ý một phần.",      },
      {
        questionId: 'w5t8_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ để hoàn chỉnh thesis statement:\n\n"I strongly _____ that a shorter working week would benefit both employees and employers in the long run."',
        correctAnswer: 'believe',
        explanationVi: "Trong Agree/Disagree essay, thesis statement cần thể hiện quan điểm cá nhân rõ ràng. 'I strongly believe/argue/contend that...' là các cụm từ chuẩn để mở đầu thesis.",      },
      {
        questionId: 'w5t8_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "productivity" và "work-life balance"):\n\n"Tuần làm việc ngắn hơn có thể cải thiện cân bằng giữa công việc và cuộc sống, từ đó tăng năng suất lao động."',
        correctAnswer: 'A shorter working week can improve work-life balance, thereby increasing productivity.',
        modelAnswer: 'A shorter working week can improve work-life balance, thereby increasing productivity.',
        fallbackKeywords: ['shorter', 'working week', 'work-life balance', 'productivity', 'improve'],
        explanationVi: "'Thereby + V-ing' = 'do đó, dẫn đến'. Đây là cách kết nối nguyên nhân - kết quả trong một câu ngắn gọn.",      }
    ]
  },
  {
    week: 5, block: 'agree_disagree', orderIndex: 9,
    topicName: 'Remote Work as the Future', topicEmoji: '🏠',
    essayType: 'agree_disagree',
    prompt: 'Working from home will become the main way people work in the future. Do you agree or disagree?',
    hintAdvantages: ['flexibility', 'cost savings', 'no commute'],
    hintDisadvantages: ['isolation', 'difficulty monitoring', 'blurred boundaries'],
    vocabularyList: [
      { term: 'remote work', definitionVi: 'làm việc từ xa', example: 'Remote work has become increasingly common since 2020.' },
      { term: 'commute', definitionVi: 'di chuyển đến nơi làm việc', example: 'Eliminating the daily commute saves both time and money.' },
      { term: 'collaboration', definitionVi: 'sự hợp tác', example: 'In-person collaboration is difficult to replicate online.' }
    ],
    questions: [
      {
        questionId: 'w5t9_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"In my opinion, remote work will _____ dominate the workplace within the next decade."',
        correctAnswer: 'certainly',
        explanationVi: "'Certainly/undoubtedly/inevitably' là các trạng từ dùng để thể hiện sự chắc chắn khi đồng ý với một quan điểm. Đây là cách nhấn mạnh lập trường trong Agree/Disagree essay.",      },
      {
        questionId: 'w5t9_q02', level: 'elementary', orderIndex: 2,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence tốt nhất cho đoạn văn lập luận PHẢN ĐỐI (disagree) với ý kiến remote work sẽ thống trị tương lai:',
        options: [
          'Remote work is popular in many countries.',
          'However, there are compelling reasons to believe that office-based work will remain essential.',
          'Working from home has many benefits.',
          'The future of work is uncertain.'
        ],
        correctAnswer: 'However, there are compelling reasons to believe that office-based work will remain essential.',
        explanationVi: "Đây là topic sentence cho đoạn phản đối. 'Compelling reasons' = lý do thuyết phục. 'However' chuyển hướng lập luận. Câu phải nêu rõ vị trí: office work vẫn cần thiết.",      },
      {
        questionId: 'w5t9_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "collaboration" và "remote work"):\n\n"Mặc dù làm việc từ xa mang lại sự linh hoạt, nhưng nó khó có thể thay thế hoàn toàn sự hợp tác trực tiếp trong văn phòng."',
        correctAnswer: 'Although remote work offers flexibility, it is unlikely to fully replace in-person collaboration in the office.',
        modelAnswer: 'Although remote work offers flexibility, it is unlikely to fully replace in-person collaboration in the office.',
        fallbackKeywords: ['remote work', 'flexibility', 'replace', 'collaboration', 'office'],
        explanationVi: "'It is unlikely to + V' = 'khó có thể'. 'In-person collaboration' = hợp tác trực tiếp. Cấu trúc Although... expresses contrast hiệu quả.",      }
    ]
  },
  {
    week: 6, block: 'agree_disagree', orderIndex: 10,
    topicName: 'Job Satisfaction vs. Salary', topicEmoji: '💼',
    essayType: 'agree_disagree',
    prompt: 'Job satisfaction is more important than a high salary. Do you agree or disagree?',
    hintAdvantages: ['long-term happiness', 'reduces stress', 'better performance'],
    hintDisadvantages: ['financial security needed', 'salary covers basic needs'],
    vocabularyList: [
      { term: 'job satisfaction', definitionVi: 'sự hài lòng với công việc', example: 'Job satisfaction leads to higher employee retention rates.' },
      { term: 'financial security', definitionVi: 'an toàn tài chính', example: 'A good salary provides financial security for the family.' },
      { term: 'intrinsic motivation', definitionVi: 'động lực nội tại', example: 'Intrinsic motivation drives employees to perform at their best.' }
    ],
    questions: [
      {
        questionId: 'w6t10_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "Job satisfaction is more important than a high salary. Do you agree or disagree?" — Bài luận dạng này yêu cầu gì?',
        options: [
          'Chỉ phân tích lợi ích và bất lợi',
          'Đưa ra quan điểm cá nhân rõ ràng và lập luận bảo vệ quan điểm đó',
          'Trình bày hai quan điểm đối lập một cách công bằng',
          'Giải thích nguyên nhân và tìm giải pháp'
        ],
        correctAnswer: 'Đưa ra quan điểm cá nhân rõ ràng và lập luận bảo vệ quan điểm đó',
        explanationVi: "Agree/Disagree essay yêu cầu bạn chọn MỘT lập trường (đồng ý/không đồng ý/một phần đồng ý) và nhất quán bảo vệ trong suốt bài. Không viết 'một mặt... mặt khác...' như Discuss Both Views.",      },
      {
        questionId: 'w6t10_q02', level: 'elementary', orderIndex: 2,
        type: 'rearrange',
        questionText: 'Sắp xếp các từ thành câu luận điểm:\n[satisfaction / job / more / health / mental / contributes / to / good]',
        correctAnswer: 'Job satisfaction contributes more to good mental health.',
        modelAnswer: 'Job satisfaction contributes more to good mental health.',
        fallbackKeywords: ['job satisfaction', 'contributes', 'mental health'],
        explanationVi: "'Contribute to + N' = góp phần vào. Đây là cách diễn đạt tác động tích cực. 'Mental health' là chủ đề quan trọng trong IELTS.",      },
      {
        questionId: 'w6t10_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "job satisfaction" và "intrinsic motivation"):\n\n"Sự hài lòng với công việc nuôi dưỡng động lực nội tại, điều này cuối cùng dẫn đến hiệu suất công việc cao hơn và sự nghiệp lâu dài hơn."',
        correctAnswer: 'Job satisfaction fosters intrinsic motivation, which ultimately leads to higher work performance and a longer career.',
        modelAnswer: 'Job satisfaction fosters intrinsic motivation, which ultimately leads to higher work performance and a longer career.',
        fallbackKeywords: ['job satisfaction', 'intrinsic motivation', 'performance', 'career', 'ultimately'],
        explanationVi: "'Foster' = nuôi dưỡng, thúc đẩy. 'Ultimately' = cuối cùng, rốt cuộc — rất tốt cho IELTS. Mệnh đề quan hệ 'which leads to' kết nối hệ quả.",      }
    ]
  },

  // ─── BLOCK 4: Week 7-8 — Discuss Both Views / Environment ───
  {
    week: 7, block: 'discuss_both_views', orderIndex: 11,
    topicName: 'Individual vs. Government Responsibility', topicEmoji: '🌍',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'carbon footprint', definitionVi: 'dấu chân carbon', example: 'Individuals can reduce their carbon footprint by using public transport.' },
      { term: 'collective action', definitionVi: 'hành động tập thể', example: 'Environmental problems require collective action from governments.' },
      { term: 'sustainable', definitionVi: 'bền vững', example: 'We need sustainable solutions to address climate change.' }
    ],
    questions: [
      {
        questionId: 'w7t11_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "Discuss both views and give your own opinion." — Đây là dạng essay nào?',
        options: ['Agree or Disagree', 'Cause & Effect', 'Advantages & Disadvantages', 'Discuss Both Views'],
        correctAnswer: 'Discuss Both Views',
        explanationVi: "Cụm 'Discuss both views' xác định rõ đây là dạng Balanced Opinion Essay. Bạn phải trình bày CẢ HAI quan điểm một cách công bằng trước khi đưa ra ý kiến riêng. Khác Agree/Disagree ở chỗ phải nêu cả hai phía.",      },
      {
        questionId: 'w7t11_q02', level: 'elementary', orderIndex: 2,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence tốt nhất cho đoạn văn trình bày QUAN ĐIỂM 1 (cá nhân không thể làm gì):',
        options: [
          'People can do many things to help the environment.',
          'On the one hand, some argue that environmental problems are too vast for individuals to address effectively.',
          'The environment is very important.',
          'Governments should protect the environment.'
        ],
        correctAnswer: 'On the one hand, some argue that environmental problems are too vast for individuals to address effectively.',
        explanationVi: "Trong Discuss Both Views, dùng 'On the one hand...' để mở đầu View 1. 'Some argue that...' cho thấy đây không phải ý kiến của bạn mà là quan điểm một nhóm người.",      },
      {
        questionId: 'w7t11_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "carbon footprint" và "collective action"):\n\n"Trong khi hành động cá nhân như giảm dấu chân carbon là quan trọng, chỉ có hành động tập thể ở cấp độ chính phủ mới có thể giải quyết các vấn đề môi trường ở quy mô toàn cầu."',
        correctAnswer: 'While individual actions such as reducing carbon footprints are important, only collective action at the governmental level can address environmental problems on a global scale.',
        modelAnswer: 'While individual actions such as reducing carbon footprints are important, only collective action at the governmental level can address environmental problems on a global scale.',
        fallbackKeywords: ['individual', 'carbon footprint', 'collective action', 'government', 'global', 'environmental'],
        explanationVi: "'Only + X + can...' = chỉ có X mới có thể. Cấu trúc 'While..., only...' tạo sự tương phản mạnh giữa cá nhân và chính phủ.",      }
    ]
  },
  {
    week: 7, block: 'discuss_both_views', orderIndex: 12,
    topicName: 'Car-Free Days vs. Alternative Solutions', topicEmoji: '🚗',
    essayType: 'discuss_both_views',
    prompt: 'Some people think international car-free days are an effective way to reduce air pollution. Others believe there are better ways to tackle this issue. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'air pollution', definitionVi: 'ô nhiễm không khí', example: 'Car-free days temporarily reduce air pollution in cities.' },
      { term: 'public transport', definitionVi: 'giao thông công cộng', example: 'Investing in public transport is a long-term solution.' },
      { term: 'emissions', definitionVi: 'khí thải', example: 'Electric vehicles produce zero direct emissions.' }
    ],
    questions: [
      {
        questionId: 'w7t12_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền linking word thích hợp:\n\n"_____ the other hand, others argue that long-term solutions such as electric vehicles are more effective."',
        correctAnswer: 'On',
        explanationVi: "'On the other hand' là cụm linking phrase dùng để chuyển sang View 2 trong Discuss Both Views essay. Luôn dùng cặp: 'On the one hand... On the other hand...'",      },
      {
        questionId: 'w7t12_q02', level: 'elementary', orderIndex: 2,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu hoàn chỉnh:\n[effective / car-free / days / in / reducing / are / pollution / cities / air]',
        correctAnswer: 'Car-free days are effective in reducing air pollution in cities.',
        modelAnswer: 'Car-free days are effective in reducing air pollution in cities.',
        fallbackKeywords: ['car-free days', 'effective', 'reducing', 'air pollution', 'cities'],
        explanationVi: "'Be effective in + V-ing' = hiệu quả trong việc. Đây là cách nêu ưu điểm của một giải pháp trong IELTS.",      },
      {
        questionId: 'w7t12_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "emissions" và "public transport"):\n\n"Đầu tư vào giao thông công cộng và các phương tiện điện là giải pháp lâu dài hơn để giảm khí thải, so với các ngày không dùng xe."',
        correctAnswer: 'Investing in public transport and electric vehicles is a more sustainable long-term solution to reduce emissions than car-free days.',
        modelAnswer: 'Investing in public transport and electric vehicles is a more sustainable long-term solution to reduce emissions than car-free days.',
        fallbackKeywords: ['public transport', 'electric vehicles', 'emissions', 'sustainable', 'long-term'],
        explanationVi: "Dùng so sánh hơn 'more...than' để so sánh hai giải pháp. 'Investing in + N' là chủ ngữ (gerund phrase).",      }
    ]
  },
  {
    week: 8, block: 'discuss_both_views', orderIndex: 13,
    topicName: 'Economic Growth vs. Environmental Protection', topicEmoji: '⚖️',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that economic development is more important than environmental protection. Others argue that protecting the environment should be prioritised. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'economic development', definitionVi: 'phát triển kinh tế', example: 'Economic development improves living standards.' },
      { term: 'deforestation', definitionVi: 'nạn phá rừng', example: 'Deforestation is a major consequence of unchecked economic development.' },
      { term: 'prioritise', definitionVi: 'ưu tiên', example: 'We must prioritise environmental protection to ensure a sustainable future.' }
    ],
    questions: [
      {
        questionId: 'w8t13_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Khi đề bài yêu cầu "Discuss both views and give your own opinion", đâu là cấu trúc bài luận đúng?',
        options: [
          'Intro → Chỉ một quan điểm → Kết luận',
          'Intro → View 1 → View 2 → Ý kiến riêng → Kết luận',
          'Intro → Nguyên nhân → Giải pháp → Kết luận',
          'Intro → Ưu điểm → Nhược điểm → Kết luận'
        ],
        correctAnswer: 'Intro → View 1 → View 2 → Ý kiến riêng → Kết luận',
        explanationVi: "Cấu trúc chuẩn: Para 1 = View 1 | Para 2 = View 2 | Para 3 = Your Opinion (hoặc tích hợp vào Conclusion). Tùy thầy cô, ý kiến riêng có thể ở cuối Para 2 hoặc Para riêng.",      },
      {
        questionId: 'w8t13_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"_____ proponents of economic growth argue that development creates jobs and reduces poverty, _____ critics warn that it comes at the cost of irreversible environmental damage."',
        correctAnswer: 'While',
        explanationVi: "'While A, B' = Trong khi A, thì B. Cấu trúc này hiệu quả khi tóm tắt hai quan điểm đối lập trong thesis statement của Discuss Both Views essay.",      },
      {
        questionId: 'w8t13_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "prioritise" và "deforestation"):\n\n"Nếu chúng ta không ưu tiên bảo vệ môi trường, các hệ quả như phá rừng và biến đổi khí hậu sẽ không thể đảo ngược."',
        correctAnswer: 'If we do not prioritise environmental protection, consequences such as deforestation and climate change will become irreversible.',
        modelAnswer: 'If we do not prioritise environmental protection, consequences such as deforestation and climate change will become irreversible.',
        fallbackKeywords: ['prioritise', 'environmental protection', 'deforestation', 'climate change', 'irreversible'],
        explanationVi: "Câu điều kiện loại 1: 'If + present simple, will + V'. 'Irreversible' = không thể đảo ngược — từ vựng học thuật quan trọng.",      }
    ]
  },

  // ─── BLOCK 5: Week 9-12 — Mixed Review ───
  {
    week: 9, block: 'mixed', orderIndex: 14,
    topicName: 'Public vs. Private Healthcare', topicEmoji: '🏥',
    essayType: 'advantages_disadvantages',
    prompt: 'Some people think that good health is a basic human right, so medical services should not be run by profit-making companies. Do the disadvantages of private healthcare outweigh the advantages?',
    hintAdvantages: ['high quality', 'shorter waiting times', 'specialised care'],
    hintDisadvantages: ['expensive', 'inaccessible for poor', 'profit over patient care'],
    vocabularyList: [
      { term: 'healthcare', definitionVi: 'dịch vụ y tế', example: 'Access to affordable healthcare is a fundamental right.' },
      { term: 'profit-making', definitionVi: 'vì lợi nhuận', example: 'Profit-making hospitals prioritise revenue over patient welfare.' },
      { term: 'inequality', definitionVi: 'bất bình đẳng', example: 'Private healthcare can worsen social inequality.' }
    ],
    questions: [
      {
        questionId: 'w9t14_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"Private healthcare, while offering superior quality, is often _____ for low-income individuals."',
        correctAnswer: 'unaffordable',
        explanationVi: "'Unaffordable' = không thể chi trả được. Tiền tố 'un-' phủ định 'affordable' (có thể chi trả). Đây là từ quan trọng khi viết về nhược điểm của y tế tư nhân.",      },
      {
        questionId: 'w9t14_q02', level: 'elementary', orderIndex: 2,
        type: 'error_correction',
        questionText: 'Sửa lỗi trong câu sau:\n\n"Private hospitals focuses on profit rather than on patient welfare, which lead to unequal access to care."',
        correctAnswer: 'Private hospitals focus on profit rather than on patient welfare, which leads to unequal access to care.',
        modelAnswer: 'Private hospitals focus on profit rather than on patient welfare, which leads to unequal access to care.',
        fallbackKeywords: ['private hospitals', 'focus', 'profit', 'patient welfare', 'leads', 'unequal'],
        explanationVi: "Lỗi 1: 'hospitals' (số nhiều) → động từ 'focus' (không có 's'). Lỗi 2: mệnh đề quan hệ 'which' có antecedent mệnh đề → dùng 'leads' (số ít).",      },
      {
        questionId: 'w9t14_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "profit-making" và "inequality"):\n\n"Các tổ chức y tế vì lợi nhuận có xu hướng làm gia tăng bất bình đẳng xã hội bằng cách ưu tiên những bệnh nhân giàu có hơn."',
        correctAnswer: 'Profit-making healthcare organisations tend to worsen social inequality by prioritising wealthier patients.',
        modelAnswer: 'Profit-making healthcare organisations tend to worsen social inequality by prioritising wealthier patients.',
        fallbackKeywords: ['profit-making', 'healthcare', 'inequality', 'prioritising', 'patients'],
        explanationVi: "'Tend to + V' = có xu hướng. 'By + V-ing' = bằng cách. 'Worsen' = làm tệ hơn. Đây là 3 cấu trúc quan trọng trong IELTS.",      }
    ]
  },
  {
    week: 9, block: 'mixed', orderIndex: 15,
    topicName: 'Consumerism and Society', topicEmoji: '🛍️',
    essayType: 'agree_disagree',
    prompt: 'People today are buying more consumer goods than ever before. Is this a positive or negative development?',
    hintAdvantages: ['stimulates economy', 'creates jobs', 'improves living standards'],
    hintDisadvantages: ['resource depletion', 'waste', 'environmental damage'],
    vocabularyList: [
      { term: 'consumerism', definitionVi: 'chủ nghĩa tiêu dùng', example: 'Consumerism drives economic growth but also leads to environmental damage.' },
      { term: 'materialism', definitionVi: 'chủ nghĩa vật chất', example: 'Materialism has replaced traditional values in many societies.' },
      { term: 'disposable income', definitionVi: 'thu nhập khả dụng', example: 'Rising disposable income has fuelled consumer spending.' }
    ],
    questions: [
      {
        questionId: 'w9t15_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "Is this a positive or negative development?" — Đây là dạng essay nào và yêu cầu gì?',
        options: [
          'Cause & Solution — tìm nguyên nhân và giải pháp',
          'Agree or Disagree — đưa ra quan điểm rõ ràng (tích cực/tiêu cực/cả hai)',
          'Discuss Both Views — trình bày hai quan điểm đều nhau',
          'Effect & Solution — phân tích hệ quả và giải pháp'
        ],
        correctAnswer: 'Agree or Disagree — đưa ra quan điểm rõ ràng (tích cực/tiêu cực/cả hai)',
        explanationVi: "'Is this positive or negative?' là dạng Agree/Disagree biến thể. Bạn có thể chọn: hoàn toàn tích cực, hoàn toàn tiêu cực, hoặc 'largely positive/negative' và giải thích.",      },
      {
        questionId: 'w9t15_q02', level: 'elementary', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"While consumerism stimulates economic growth, it also _____ significant environmental damage through excessive waste and resource depletion."',
        correctAnswer: 'causes',
        explanationVi: "'Cause + N' = gây ra. 'While A, B' = trong khi A, thì B (structure for balanced argument). 'Significant damage' = thiệt hại đáng kể.",      },
      {
        questionId: 'w9t15_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "consumerism" và "disposable income"):\n\n"Khi thu nhập khả dụng tăng lên, chủ nghĩa tiêu dùng lan rộng, dẫn đến sự gia tăng chất thải và cạn kiệt tài nguyên thiên nhiên."',
        correctAnswer: 'As disposable income rises, consumerism spreads, leading to increased waste and depletion of natural resources.',
        modelAnswer: 'As disposable income rises, consumerism spreads, leading to increased waste and depletion of natural resources.',
        fallbackKeywords: ['disposable income', 'consumerism', 'waste', 'depletion', 'natural resources'],
        explanationVi: "'As + present simple' = khi (quan hệ thời gian/nhân quả). 'Leading to + N' = dẫn đến (participle phrase). 'Depletion' = sự cạn kiệt.",      }
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
      { term: 'arts funding', definitionVi: 'tài trợ nghệ thuật', example: 'Arts funding helps preserve cultural heritage.' },
      { term: 'cultural heritage', definitionVi: 'di sản văn hóa', example: 'Governments have a duty to protect cultural heritage.' },
      { term: 'infrastructure', definitionVi: 'cơ sở hạ tầng', example: 'Healthcare and infrastructure should be top spending priorities.' }
    ],
    questions: [
      {
        questionId: 'w10t16_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền linking phrase:\n\n"_____ the one hand, arts funding preserves cultural heritage and promotes national identity."',
        correctAnswer: 'On',
        explanationVi: "'On the one hand' + 'On the other hand' = cặp linking phrases chuẩn trong Discuss Both Views. Luôn dùng cặp này khi trình bày hai quan điểm.",      },
      {
        questionId: 'w10t16_q02', level: 'elementary', orderIndex: 2,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence tốt nhất cho đoạn văn lập luận CHỐNG lại việc chi tiền công cho nghệ thuật:',
        options: [
          'Art is very important in society.',
          'On the other hand, critics argue that limited government funds should be directed towards essential services such as healthcare and education.',
          'The government has many responsibilities.',
          'Arts funding is controversial in many countries.'
        ],
        correctAnswer: 'On the other hand, critics argue that limited government funds should be directed towards essential services such as healthcare and education.',
        explanationVi: "Topic sentence View 2 phải: (1) dùng 'On the other hand' chuyển hướng, (2) nêu rõ quan điểm đối lập, (3) dùng 'critics argue that' để cho biết đây là ý kiến của người khác.",      },
      {
        questionId: 'w10t16_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "cultural heritage" và "infrastructure"):\n\n"Trong khi đầu tư vào di sản văn hóa là có giá trị, chính phủ nên ưu tiên cơ sở hạ tầng và y tế khi nguồn lực tài chính bị hạn chế."',
        correctAnswer: 'While investing in cultural heritage is valuable, governments should prioritise infrastructure and healthcare when financial resources are limited.',
        modelAnswer: 'While investing in cultural heritage is valuable, governments should prioritise infrastructure and healthcare when financial resources are limited.',
        fallbackKeywords: ['cultural heritage', 'infrastructure', 'healthcare', 'prioritise', 'resources', 'limited'],
        explanationVi: "'When + clause' = khi (điều kiện). 'Financial resources are limited' = nguồn lực tài chính bị hạn chế. 'Prioritise A over B' hoặc chỉ 'prioritise A'.",      }
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
      { term: 'juvenile delinquency', definitionVi: 'tình trạng phạm tội ở thanh thiếu niên', example: 'Poverty and lack of education contribute to juvenile delinquency.' },
      { term: 'rehabilitation', definitionVi: 'phục hồi, tái hội nhập', example: 'Rehabilitation programmes reduce reoffending rates.' },
      { term: 'peer pressure', definitionVi: 'áp lực từ bạn bè', example: 'Peer pressure is a key factor in youth crime.' }
    ],
    questions: [
      {
        questionId: 'w10t17_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Đề bài: "What are the causes of this problem? How can it be solved?" — Đây là dạng essay nào?',
        options: ['Cause & Effect', 'Effect & Solution', 'Cause & Solution', 'Discuss Both Views'],
        correctAnswer: 'Cause & Solution',
        explanationVi: "Keyword: 'causes' (nguyên nhân) + 'how can it be solved' (giải pháp). Dạng này yêu cầu phân tích nguyên nhân (causes) và đề xuất giải pháp (solutions) — không phân tích hệ quả.",      },
      {
        questionId: 'w10t17_q02', level: 'elementary', orderIndex: 2,
        type: 'rearrange',
        questionText: 'Sắp xếp thành câu về giải pháp:\n[reduce / programmes / youth / crime / rehabilitation / can / community]',
        correctAnswer: 'Community rehabilitation programmes can reduce youth crime.',
        modelAnswer: 'Community rehabilitation programmes can reduce youth crime.',
        fallbackKeywords: ['rehabilitation', 'programmes', 'reduce', 'youth crime', 'community'],
        explanationVi: "'Community rehabilitation programmes' = chương trình phục hồi cộng đồng. 'Can reduce' = có thể giảm. Đây là cách đề xuất giải pháp ngắn gọn, học thuật.",      },
      {
        questionId: 'w10t17_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "peer pressure" và "juvenile delinquency"):\n\n"Áp lực từ bạn bè là một trong những nguyên nhân chính của tình trạng phạm tội ở thanh thiếu niên, đặc biệt ở các khu vực nghèo."',
        correctAnswer: 'Peer pressure is one of the main causes of juvenile delinquency, particularly in disadvantaged areas.',
        modelAnswer: 'Peer pressure is one of the main causes of juvenile delinquency, particularly in disadvantaged areas.',
        fallbackKeywords: ['peer pressure', 'causes', 'juvenile delinquency', 'particularly', 'areas'],
        explanationVi: "'Particularly in + area' = đặc biệt ở. 'Disadvantaged areas' = khu vực bất lợi/nghèo. Cụm 'one of the main causes of' là cấu trúc chuẩn.",      }
    ]
  },
  {
    week: 11, block: 'mixed', orderIndex: 18,
    topicName: 'Prison vs. Rehabilitation', topicEmoji: '🔒',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'deterrence', definitionVi: 'sự răn đe', example: 'Long prison sentences act as a deterrence for potential criminals.' },
      { term: 'recidivism', definitionVi: 'tái phạm', example: 'High recidivism rates suggest that prison alone is not effective.' },
      { term: 'reintegration', definitionVi: 'tái hội nhập xã hội', example: 'Successful reintegration reduces the likelihood of reoffending.' }
    ],
    questions: [
      {
        questionId: 'w11t18_q01', level: 'beginner', orderIndex: 1,
        type: 'fill_blank',
        questionText: 'Điền từ thích hợp:\n\n"Proponents of longer sentences argue that imprisonment serves as a _____ to potential criminals."',
        correctAnswer: 'deterrence',
        explanationVi: "'Deterrence' = sự răn đe — danh từ. 'Serve as a deterrence' = đóng vai trò là sự răn đe. Đây là lập luận chính của View 1 (ủng hộ án tù dài).",      },
      {
        questionId: 'w11t18_q02', level: 'elementary', orderIndex: 2,
        type: 'topic_sentence',
        questionText: 'Chọn topic sentence tốt nhất cho đoạn văn về QUAN ĐIỂM 2 (có cách tốt hơn để giảm tội phạm):',
        options: [
          'Crime is a serious problem in society.',
          'Prison sentences are very long in some countries.',
          'On the other hand, many experts contend that rehabilitation and education programmes are far more effective at reducing reoffending.',
          'There are many types of crime in the world.'
        ],
        correctAnswer: 'On the other hand, many experts contend that rehabilitation and education programmes are far more effective at reducing reoffending.',
        explanationVi: "'Many experts contend that' = nhiều chuyên gia cho rằng. 'Far more effective' = hiệu quả hơn nhiều. 'On the other hand' chuyển sang View 2. Câu nêu rõ lập luận và so sánh.",      },
      {
        questionId: 'w11t18_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dịch câu sau sang tiếng Anh (dùng "recidivism" và "reintegration"):\n\n"Tỷ lệ tái phạm cao cho thấy rằng tù giam đơn thuần không đủ — cần có các chương trình tái hội nhập toàn diện để giảm tội phạm lâu dài."',
        correctAnswer: 'High recidivism rates suggest that imprisonment alone is insufficient — comprehensive reintegration programmes are needed to reduce crime in the long term.',
        modelAnswer: 'High recidivism rates suggest that imprisonment alone is insufficient — comprehensive reintegration programmes are needed to reduce crime in the long term.',
        fallbackKeywords: ['recidivism', 'imprisonment', 'insufficient', 'reintegration', 'programmes', 'reduce', 'crime'],
        explanationVi: "'Suggest that + clause' = cho thấy rằng. 'Alone is insufficient' = một mình là không đủ. Dấu '—' (em dash) dùng để giải thích thêm.",      }
    ]
  }
];

async function runSeed() {
  const Task2Topic = require('../models/Task2Topic');

  const existingNames = new Set(
    (await Task2Topic.find({}, 'topicName').lean()).map(t => t.topicName)
  );

  const toInsert = topics.filter(t => !existingNames.has(t.topicName));

  if (!toInsert.length) {
    console.log(`[Task2Seed] All ${topics.length} topics already present – skip`);
    return;
  }

  await Task2Topic.insertMany(toInsert);
  console.log(`[Task2Seed] Seeded ${toInsert.length} new Task 2 topics (total target: ${topics.length})`);
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
