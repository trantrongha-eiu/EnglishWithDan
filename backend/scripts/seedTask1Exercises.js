const exercises = [
  // ─── MODULE 1: NOUN PHRASE ───────────────────────────────────────────
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền từ thích hợp vào chỗ trống:',
    sentenceWithBlanks: 'The ___ of Vietnamese Internet users in 2003 was 5 million people.',
    blanksCount: 1,
    sampleAnswers: ['number', 'quantity'],
    primaryAnswer: 'number',
    grammarPoint: 'Countable noun data: The number/quantity of + plural countable noun',
    explanation: 'Dùng "number" hoặc "quantity" với danh từ đếm được (người dùng Internet)',
    hints: ['number', 'quantity'],
    xpReward: 5, orderIndex: 1
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền từ thích hợp vào chỗ trống:',
    sentenceWithBlanks: 'The ___ of water used in the year 2010 was 5 million m³.',
    blanksCount: 1,
    sampleAnswers: ['amount', 'quantity'],
    primaryAnswer: 'amount',
    grammarPoint: 'Uncountable noun data: The amount/quantity of + uncountable noun',
    explanation: 'Dùng "amount" với danh từ không đếm được (water)',
    hints: ['amount', 'quantity'],
    xpReward: 5, orderIndex: 2
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn cách diễn đạt ĐÚNG cho dữ liệu phần trăm:',
    questionEn: 'Subject: Internet users | Data: 20% | Context: percentage of Vietnamese population',
    options: [
      'The number of Vietnamese Internet users was 20%.',
      'The percentage of Vietnamese Internet users was 20% of the total population.',
      'There were 20% Vietnamese Internet users.',
      'The amount of Internet users was 20%.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Percentage data: The percentage/proportion/rate of + noun',
    explanation: 'Dữ liệu phần trăm dùng "percentage/proportion/rate". Không dùng "number" hay "amount" cho %.',
    xpReward: 5, orderIndex: 3
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn cụm từ ĐÚNG để mô tả dữ liệu:',
    questionVi: '20 triệu người Việt Nam sử dụng xe máy',
    options: [
      'The number of Vietnamese motorbike users was 20 million.',
      'The amount of Vietnamese motorbike users was 20 million.',
      'The percentage of Vietnamese motorbike users was 20 million.',
      'The figure of Vietnamese motorbike users was 20 million.'
    ],
    correctOptionIndex: 0,
    grammarPoint: 'The number of + countable noun (người dùng xe máy = đếm được)',
    explanation: '"Motorbike users" là danh từ đếm được → dùng "The number of"',
    xpReward: 5, orderIndex: 4
  },

  // ─── MODULE 1: DATA DESCRIPTION ─────────────────────────────────────
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh (dữ liệu ở cuối câu):',
    questionVi: 'Số lượng sinh viên đại học ở Anh năm 2010 là 2,5 triệu người.',
    dataContext: { type: 'table', subject: 'UK university students', year: '2010', value: '2.5 million', unit: 'students' },
    sampleAnswers: [
      'The number of university students in the UK was 2.5 million in 2010.',
      'The number of university students in the UK stood at 2.5 million in 2010.',
      'The quantity of university students in the UK was 2.5 million in 2010.'
    ],
    primaryAnswer: 'The number of university students in the UK was 2.5 million in 2010.',
    grammarPoint: 'Structure 1: Data at end — The number of + noun + was/stood at + figure',
    explanation: 'Cấu trúc 1: Dữ liệu ở cuối câu. Chủ ngữ là "The number of...". "stood at" là cách hay thay cho "was".',
    hints: ['The number of', 'university students', 'in the UK', 'was/stood at', '2.5 million'],
    xpReward: 8, orderIndex: 5
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh (dữ liệu ở đầu câu):',
    questionVi: '38% dân số Australia sử dụng phương tiện công cộng vào năm 2018.',
    sampleAnswers: [
      '38% of the Australian population used public transport in 2018.',
      "38% of Australia's population travelled by public transport in 2018."
    ],
    primaryAnswer: '38% of the Australian population used public transport in 2018.',
    grammarPoint: 'Structure 2: Data at beginning — Figure% of + noun + verb',
    explanation: 'Cấu trúc 2: Dữ liệu ở đầu câu. Số liệu (38%) làm chủ ngữ. Dùng "of" để chỉ thuộc về.',
    hints: ['38% of', 'the Australian population', 'used', 'in 2018'],
    xpReward: 8, orderIndex: 6
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh (dùng cấu trúc "There were"):',
    questionVi: 'Có khoảng 1,2 tỷ người sử dụng xe đạp trên toàn thế giới vào năm 2015.',
    sampleAnswers: [
      'There were approximately 1.2 billion people using bicycles worldwide in 2015.',
      'There were around 1.2 billion bicycle users across the world in 2015.'
    ],
    primaryAnswer: 'There were approximately 1.2 billion people using bicycles worldwide in 2015.',
    grammarPoint: 'Structure 3: Data in middle — There were + figure + noun + V-ing',
    explanation: 'Cấu trúc 3: Dùng "There were" khi số liệu nằm ở giữa câu. "approximately/around" = khoảng.',
    hints: ['There were', 'approximately', '1.2 billion people', 'using bicycles', 'worldwide'],
    xpReward: 8, orderIndex: 7
  },
  {
    skillType: 'data_description', module: 1, level: 'elementary', type: 'rearrange',
    instruction: 'Sắp xếp các từ thành câu đúng mô tả dữ liệu phần trăm:',
    questionEn: 'UK: 55% Internet users (1990)',
    baseWords: ['55%', 'of', 'the', 'UK', 'population', 'used', 'the', 'Internet', 'in', '1990'],
    sampleAnswers: ['55% of the UK population used the Internet in 1990.'],
    primaryAnswer: '55% of the UK population used the Internet in 1990.',
    grammarPoint: 'Percentage at beginning: Figure% of + noun + verb',
    explanation: 'Phần trăm ở đầu câu: X% of [subject] + verb',
    xpReward: 8, orderIndex: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'elementary', type: 'rearrange',
    instruction: 'Sắp xếp các từ thành câu đúng:',
    questionEn: "Brazil coffee exports = $5 billion (2005)",
    baseWords: ["Brazil's", 'coffee', 'exports', 'were', 'worth', '$5', 'billion', 'in', '2005'],
    sampleAnswers: ["Brazil's coffee exports were worth $5 billion in 2005."],
    primaryAnswer: "Brazil's coffee exports were worth $5 billion in 2005.",
    grammarPoint: 'Subject + were worth + monetary figure (dùng cho dữ liệu tiền tệ/thương mại)',
    explanation: 'Dữ liệu tài chính dùng "were worth" thay vì "were + figure". "$5 billion" = 5 tỷ đô.',
    xpReward: 8, orderIndex: 9
  },

  // ─── MODULE 1: COMPARISON ────────────────────────────────────────────
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền từ/cụm từ so sánh thích hợp:',
    sentenceWithBlanks: 'The UK spent $50 billion on education in 2019, ___ only $30 billion in France.',
    blanksCount: 1,
    sampleAnswers: ['compared to', 'compared with', 'in comparison with'],
    primaryAnswer: 'compared to',
    grammarPoint: 'Comparison: compared to/with | in comparison with — so sánh 2 giá trị trong cùng câu',
    explanation: '"compared to/with" nối trực tiếp hai số liệu trong cùng câu. "in comparison with" = cùng nghĩa, trang trọng hơn.',
    hints: ['compared to', 'compared with'],
    xpReward: 5, orderIndex: 10
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu so sánh sau sang tiếng Anh dùng "whereas":',
    questionVi: 'Số người dùng ô tô là 10 triệu, trong khi số người đi xe buýt là 25 triệu.',
    sampleAnswers: [
      'The number of car users was 10 million, whereas the number of bus users was 25 million.',
      'There were 10 million car users, whereas there were 25 million bus users.',
      'The figure for car users was 10 million, whereas the figure for bus users was 25 million.'
    ],
    primaryAnswer: 'The number of car users was 10 million, whereas the number of bus users was 25 million.',
    grammarPoint: 'Comparison with "whereas/while" — contrasting two different figures in one sentence',
    explanation: '"whereas" thường trang trọng hơn "while". Cả hai đặt ở giữa câu nối hai mệnh đề tương phản.',
    hints: ['The number of car users', 'was 10 million', 'whereas', 'the number of bus users', 'was 25 million'],
    xpReward: 10, orderIndex: 11
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau dùng "respectively":',
    questionVi: 'Tỷ lệ nam và nữ theo học đại học lần lượt là 55% và 45%.',
    sampleAnswers: [
      'The proportions of male and female university students were 55% and 45%, respectively.',
      'The figures for male and female university enrolment were 55% and 45%, respectively.'
    ],
    primaryAnswer: 'The proportions of male and female university students were 55% and 45%, respectively.',
    grammarPoint: '"Respectively" — luôn đặt cuối câu, chỉ sự tương ứng theo thứ tự',
    explanation: '"respectively" = "lần lượt", đặt cuối câu sau dấu phẩy để chỉ rõ số liệu nào thuộc về ai.',
    hints: ['The proportions of', 'male and female', 'were 55% and 45%', 'respectively'],
    xpReward: 10, orderIndex: 12
  },
  {
    skillType: 'comparison', module: 1, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh dùng cụm "three times as many as":',
    questionVi: 'Số người dùng điện thoại thông minh gấp ba lần số người dùng máy tính bảng.',
    sampleAnswers: [
      'The number of smartphone users was three times as many as that of tablet users.',
      'The figure for smartphone users was three times as high as that for tablet users.',
      'There were three times as many smartphone users as tablet users.'
    ],
    primaryAnswer: 'The number of smartphone users was three times as many as that of tablet users.',
    grammarPoint: 'Multiplicative: X times as many/much as + "that of" (tránh lặp từ)',
    explanation: '"three times as many as" = gấp ba lần. "that of" thay thế "the number of" để tránh lặp.',
    hints: ['three times as many as', 'that of tablet users'],
    xpReward: 12, orderIndex: 13
  },

  // ─── MODULE 2: TREND LANGUAGE ────────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ MÔ TẢ XU HƯỚNG TĂNG phù hợp nhất:',
    questionEn: 'The number of students ___ significantly in 2005.',
    options: ['increased', 'decreased', 'remained', 'fluctuated'],
    correctOptionIndex: 0,
    grammarPoint: 'Trend verbs: rise, grow, climb, increase, jump, rocket',
    explanation: '"Increased" = tăng. Các từ tăng khác: rose, grew, climbed, jumped',
    xpReward: 5, orderIndex: 14
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng vào chỗ trống:',
    sentenceWithBlanks: 'The number of students increased ___ 2,000 after 2 years.',
    dataContext: {
      type: 'table',
      subject: 'Number of students',
      year: '2003 → 2005',
      value: '8,000 → 10,000',
      unit: 'students',
      additionalData: { fromValue: '8,000', toValue: '10,000', difference: '2,000',
        note: 'Mức tăng (difference) = 10,000 − 8,000 = 2,000' }
    },
    blanksCount: 1,
    sampleAnswers: ['by'],
    primaryAnswer: 'by',
    grammarPoint: '"by" = mức thay đổi (difference): increased by [difference]',
    explanation: '"increased by 2,000" = tăng THÊM 2,000 đơn vị. Từ 8,000 tăng thêm 2,000 → đến 10,000.',
    hints: ['by', 'to'],
    xpReward: 5, orderIndex: 15
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng vào chỗ trống:',
    sentenceWithBlanks: 'The number of students increased ___ 10,000 after 2 years.',
    dataContext: {
      type: 'table',
      subject: 'Number of students',
      year: '2003 → 2005',
      value: '8,000 → 10,000',
      unit: 'students',
      additionalData: { fromValue: '8,000', toValue: '10,000',
        note: 'Giá trị cuối (final value) = 10,000' }
    },
    blanksCount: 1,
    sampleAnswers: ['to'],
    primaryAnswer: 'to',
    grammarPoint: '"to" = giá trị cuối (final value): increased to [final value]',
    explanation: '"increased to 10,000" = tăng LÊN TỚI 10,000. Khởi đầu 8,000, điểm cuối là 10,000.',
    hints: ['to', 'by'],
    xpReward: 5, orderIndex: 16
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn cách mô tả xu hướng ĐÚNG và HỌC THUẬT NHẤT:',
    questionEn: 'Wind energy production: 2000 = 10 GW → 2020 = 200 GW (tăng rất mạnh)',
    options: [
      'Wind energy went up a lot from 2000 to 2020.',
      'There was a dramatic increase in wind energy production, from 10 GW in 2000 to 200 GW in 2020.',
      'Wind energy increased to 200 GW by 10 GW dramatically.',
      'There was wind energy that increased dramatically from 2000.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Structure 1: There was a [adj] + noun + in [subject] + from X to Y',
    explanation: 'Cấu trúc danh từ "There was a dramatic increase in..." rất học thuật. Không dùng "went up a lot" (không trang trọng).',
    xpReward: 8, orderIndex: 17
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'translation',
    instruction: 'Dịch sang tiếng Anh dùng cấu trúc "experienced":',
    questionVi: 'Số lượng khách du lịch đến Thái Lan tăng đều đặn từ 20 triệu lên 40 triệu trong giai đoạn 2000-2019.',
    sampleAnswers: [
      'The number of tourists visiting Thailand experienced a steady increase from 20 million to 40 million between 2000 and 2019.',
      'Tourism in Thailand experienced a gradual rise from 20 million to 40 million visitors between 2000 and 2019.'
    ],
    primaryAnswer: 'The number of tourists visiting Thailand experienced a steady increase from 20 million to 40 million between 2000 and 2019.',
    grammarPoint: 'Structure 2: Subject + experienced a [adj] + noun + from X to Y + between A and B',
    explanation: '"experienced" = "trải qua/ghi nhận". "a steady increase" là cấu trúc danh từ, lịch sự hơn "increased steadily".',
    hints: ['experienced', 'a steady increase', 'from 20 million', 'to 40 million', 'between 2000 and 2019'],
    xpReward: 12, orderIndex: 18
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn tính từ mô tả mức độ thay đổi MẠNH NHẤT:',
    questionEn: 'The figure ___ from 500 to 12,000 in just 6 years.',
    options: ['slightly increased', 'gradually rose', 'dramatically jumped', 'minimally grew'],
    correctOptionIndex: 2,
    grammarPoint: 'Adverbs of degree: dramatically > significantly > considerably > moderately > gradually > slightly',
    explanation: '500 → 12,000 là tăng gấp 24 lần → dùng "dramatically" (mạnh nhất)',
    xpReward: 8, orderIndex: 19
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền giới từ thích hợp:',
    sentenceWithBlanks: 'Sales reached a peak ___ 45,000 in early March.',
    blanksCount: 1,
    sampleAnswers: ['of'],
    primaryAnswer: 'of',
    grammarPoint: 'Preposition "of": reach a peak OF + number',
    explanation: '"reach a peak of..." = đạt đỉnh ở mức... Dùng "of" sau peak/high/low',
    xpReward: 5, orderIndex: 20
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'translation',
    instruction: 'Dịch sang tiếng Anh dùng cấu trúc kết hợp 2 xu hướng (tăng rồi giảm):',
    questionVi: 'Giá bất động sản tại Mỹ tăng mạnh từ 1990 đến 2006, cho đến khi đạt đỉnh gần $300,000; tuy nhiên, sau đó bắt đầu giảm nhanh xuống dưới $180,000 vào năm 2010.',
    sampleAnswers: [
      'US property prices rose sharply between 1990 and 2006, until they reached a peak of almost $300,000; however, prices began to fall steeply to under $180,000 by 2010.',
      'There was a sharp increase in US property prices between 1990 and 2006, reaching a high of almost $300,000; however, prices then declined rapidly to under $180,000 in 2010.'
    ],
    primaryAnswer: 'US property prices rose sharply between 1990 and 2006, until they reached a peak of almost $300,000; however, prices began to fall steeply to under $180,000 by 2010.',
    grammarPoint: 'Connecting opposing trends: "until they reached a peak of..." + "however" + opposite trend',
    explanation: 'Dùng "however" (dấu chấm phẩy trước) để nối hai xu hướng trái ngược. "until" chỉ điểm đảo chiều.',
    hints: ['until they reached a peak of', 'however', 'began to fall steeply'],
    xpReward: 15, orderIndex: 21
  },

  // ─── MODULE 2: PREPOSITIONS ──────────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng (from, to, by, at, of, between, and):',
    sentenceWithBlanks: '___ 1990 ___ 2000, there was a drop ___ 15%.',
    blanksCount: 3,
    sampleAnswers: ['From, to, of'],
    primaryAnswer: 'From 1990 to 2000, there was a drop of 15%.',
    grammarPoint: 'From [year] to [year] = giai đoạn. A drop of [%] = sự giảm bao nhiêu %.',
    explanation: '"From...to..." = khoảng thời gian. "a drop of %" dùng "of" chỉ mức độ.',
    xpReward: 8, orderIndex: 22
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng:',
    sentenceWithBlanks: 'Solar panel installations peaked ___ 80,000 units in 2020.',
    blanksCount: 1,
    sampleAnswers: ['at'],
    primaryAnswer: 'at',
    grammarPoint: 'peaked at + number: "peak" (động từ) dùng với "at"',
    explanation: '"peaked at 80,000" = đạt đỉnh tại mức 80,000. Sau các từ chỉ trạng thái (peak, bottom, remain) dùng "at".',
    hints: ['at', 'to', 'by'],
    xpReward: 5, orderIndex: 23
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền giới từ đúng:',
    sentenceWithBlanks: 'The unemployment rate of Vietnam fluctuated ___ 8% and 12% from 2007 to 2010.',
    blanksCount: 1,
    sampleAnswers: ['between'],
    primaryAnswer: 'between',
    grammarPoint: 'fluctuate between X and Y = dao động trong khoảng X và Y',
    explanation: '"fluctuate between A and B" = dao động từ A đến B. Luôn dùng "between...and..."',
    hints: ['between', 'from', 'around'],
    xpReward: 5, orderIndex: 24
  },

  // ─── MODULE 2: SENTENCE REWRITING ────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'data_transform',
    instruction: 'Viết lại câu bắt đầu bằng "The number of electric vehicles":',
    questionEn: 'ORIGINAL: There was a gradual rise in the number of electric vehicles sold in Europe from 2015 to 2022.',
    sampleAnswers: [
      'The number of electric vehicles sold in Europe rose gradually from 2015 to 2022.',
      'The number of electric vehicles sold in Europe increased gradually between 2015 and 2022.',
      'The number of electric vehicles sold in Europe grew gradually from 2015 to 2022.'
    ],
    primaryAnswer: 'The number of electric vehicles sold in Europe rose gradually from 2015 to 2022.',
    grammarPoint: 'Sentence transformation: There was a [adj+noun] → Subject + Verb + Adverb',
    explanation: '"There was a gradual rise" (cụm danh từ) → "rose gradually" (động từ + trạng từ). Đây là phép biến đổi noun phrase → verb phrase.',
    hints: ['The number of electric vehicles', 'rose/increased/grew', 'gradually', 'from 2015 to 2022'],
    xpReward: 12, orderIndex: 25
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'data_transform',
    instruction: 'Viết lại câu bắt đầu bằng "The year 2005":',
    questionEn: 'ORIGINAL: The research investment decreased significantly in 2005.',
    sampleAnswers: [
      'The year 2005 witnessed a significant decrease in research investment.',
      'The year 2005 saw a significant fall in research investment.',
      '2005 experienced a significant decline in research investment.'
    ],
    primaryAnswer: 'The year 2005 witnessed a significant decrease in research investment.',
    grammarPoint: 'Structure: [Year] witnessed/saw + a [adj+noun] + in [subject]',
    explanation: 'Dùng "The year... saw/witnessed" để đổi chủ ngữ thành năm, tránh lặp',
    hints: ['The year 2005', 'witnessed/saw', 'a significant decrease', 'in research investment'],
    xpReward: 12, orderIndex: 26
  },

  // ─── MODULE 2: FUTURE TENSE ──────────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'multiple_choice',
    instruction: 'Chọn cách diễn đạt DỰ ĐOÁN TƯƠNG LAI đúng nhất:',
    questionEn: 'In 2050, gas [?] 40% of total energy production.',
    options: ['accounted for', 'accounts for', 'is predicted to account for', 'will accounts for'],
    correctOptionIndex: 2,
    grammarPoint: 'Future prediction: is expected/predicted/projected/anticipated to + V',
    explanation: 'Dữ liệu tương lai: "is predicted/expected/projected to + verb". KHÔNG dùng thì quá khứ.',
    xpReward: 8, orderIndex: 27
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu dự đoán tương lai sang tiếng Anh:',
    questionVi: 'Lượng nước sạch tiêu thụ ở Paris được dự đoán sẽ tăng đáng kể từ 1,200m³ vào năm 2030 lên 3,000m³ vào năm 2050.',
    sampleAnswers: [
      'The amount of clean water consumed in Paris is expected to increase significantly from 1,200m³ in 2030 to 3,000m³ in 2050.',
      'Clean water consumption in Paris is predicted to rise significantly from 1,200m³ in 2030 to 3,000m³ in 2050.',
      'Paris is projected to experience a significant increase in clean water consumption, from 1,200m³ in 2030 to 3,000m³ in 2050.'
    ],
    primaryAnswer: 'The amount of clean water consumed in Paris is expected to increase significantly from 1,200m³ in 2030 to 3,000m³ in 2050.',
    grammarPoint: 'is expected to + V / is predicted to + V / is projected to + V',
    explanation: 'Dùng "is expected/predicted/projected to" cho dự đoán. Giữ đúng trật tự thời gian.',
    hints: ['The amount of clean water', 'is expected to increase', 'significantly', 'from 1,200m³', 'to 3,000m³'],
    xpReward: 15, orderIndex: 28
  },

  // ─── MODULE 3: PARAPHRASE ────────────────────────────────────────────
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Câu nào là cách PARAPHRASE TỐT NHẤT cho câu gốc?',
    questionEn: 'ORIGINAL: "The graph below shows the consumption of fish and different kinds of meat in a European country between 1979 and 2004."',
    options: [
      'The graph below shows the consumption of fish and different kinds of meat in a European country between 1979 and 2004.',
      'The line graph illustrates the amount of fish and 3 other types of meat which were consumed in a European country from 1979 to 2004.',
      'The chart shows fish and meat consumption.',
      'The line graph shows some information about food in Europe.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Paraphrasing: Replace "shows" → "illustrates", "graph" → "line graph", restructure',
    explanation: 'Đáp án 1: copy nguyên văn. Đáp án 3,4: quá ngắn, thiếu thông tin. Đáp án 2: đúng — đổi từ, giữ đủ ý.',
    xpReward: 8, orderIndex: 29
  },
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ thay thế TỐT NHẤT cho "shows" trong mở bài IELTS Task 1:',
    questionEn: 'The graph ___ the number of tourists visiting three countries.',
    options: ['shows', 'illustrates / depicts / compares / gives information about', 'says', 'tells'],
    correctOptionIndex: 1,
    grammarPoint: 'Paraphrase verbs: illustrates, depicts, compares, gives information about, demonstrates',
    explanation: 'Trong Task 1, thay "shows" bằng: illustrates, depicts, compares, demonstrates',
    xpReward: 5, orderIndex: 30
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'translation',
    instruction: 'Viết câu mở bài (paraphrase) cho đề bài Task 1 sau:',
    questionEn: 'ORIGINAL: "The graph below shows the contribution of three sectors – Agriculture, Manufacturing, and Business and Financial services - to the UK economy in the twentieth century."',
    sampleAnswers: [
      'The bar chart illustrates the percentages of three different areas, namely Agriculture, Manufacturing, and Business and Financial, in the economy of the UK from 1901 to 2000.',
      'The bar chart illustrates how three areas, namely Industry, Agriculture, and Business and Financial Services, contributed to the economy of the UK from 1901 to 2000.',
      'The bar chart compares three different areas, namely Agriculture, Manufacturing, and Business and Financial Services, in terms of their contribution to the economy of the UK from 1901 to 2000.'
    ],
    primaryAnswer: 'The bar chart illustrates the percentages of three different areas, namely Agriculture, Manufacturing, and Business and Financial, in the economy of the UK from 1901 to 2000.',
    grammarPoint: '3 paraphrase methods: (1) replace synonyms, (2) noun→verb + "how", (3) "compare...in terms of"',
    explanation: 'Ba cách paraphrase: đơn giản, đổi dạng từ + "how", dùng "compare in terms of"',
    hints: ['bar chart', 'illustrates/compares', 'namely', 'from 1901 to 2000'],
    xpReward: 15, orderIndex: 31
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn cách viết lại ĐÚNG dùng cấu trúc "how many":',
    questionEn: 'ORIGINAL: "The chart shows the average number of commuters travelling each day by car, bus or train."',
    options: [
      'The chart shows the average number of commuters.',
      'The chart illustrates how many people commuted daily by three different means of transport.',
      'The chart shows how much commuters travelled.',
      'The chart compares commuters in the UK.'
    ],
    correctOptionIndex: 1,
    grammarPoint: '"the number of" → "how many + S + V" | "the amount of" → "how much + S + V"',
    explanation: '"the number of commuters" → "how many people commuted". Đổi danh từ → động từ.',
    xpReward: 8, orderIndex: 32
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'error_correction',
    instruction: 'Tìm và sửa lỗi trong câu mở bài (có 2 lỗi):',
    questionEn: 'ORIGINAL: "The graph below shows the proportion of different categories of families living in poverty in Australia in 1999."',
    sentenceWithBlanks: 'The table compares proportions of australians from six different family types who were class as poor in 1999.',
    blanksCount: 0,
    sampleAnswers: [
      'The table compares proportions of Australians from six different family types who were classed as poor in 1999.',
      'The table gives information about poverty rates among six types of households in Australia in the year 1999.'
    ],
    primaryAnswer: 'The table compares proportions of Australians from six different family types who were classed as poor in 1999.',
    grammarPoint: 'Error types: capitalization (Australians), passive voice (were classed ≠ were class)',
    explanation: 'Lỗi 1: "australians" → "Australians" (viết hoa). Lỗi 2: "were class" → "were classed" (passive)',
    xpReward: 10, orderIndex: 33
  },

  // ─── MODULE 4: OVERVIEW ───────────────────────────────────────────────
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu Overview TỐT NHẤT cho biểu đồ sau:\n[Biểu đồ: Chicken tăng từ 150g → 250g; Beef giảm từ 220g → 150g; Lamb giảm; Fish ổn định ~50g. Giai đoạn 1979-2004]',
    questionEn: 'Line graph: Fish and meat consumption in a European country 1979-2004',
    options: [
      'Overall, chicken increased and beef decreased.',
      'It is clear that chicken consumption rose significantly while the consumption of other meats declined over the period. Additionally, fish remained the least consumed throughout.',
      'The graph shows many changes in meat consumption.',
      'Overall, all meats changed between 1979 and 2004.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Overview: 2 key features, no specific figures, use "It is clear/noticeable that" + "Additionally"',
    explanation: 'Overview tốt: 2 đặc điểm nổi bật, không có số liệu cụ thể, dùng linking words',
    xpReward: 10, orderIndex: 34
  },
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'multiple_choice',
    instruction: 'Câu Overview nào MẮC LỖI vì có số liệu cụ thể?',
    options: [
      'Overall, it is clear that Internet usage increased significantly during the period.',
      'It is also noticeable that the figure for young adults was by far the highest throughout.',
      'Overall, Internet usage rose from 10% in 1990 to 85% in 2020.',
      'Additionally, while some countries saw growth, others experienced decline.'
    ],
    correctOptionIndex: 2,
    grammarPoint: 'Overview rule: KHÔNG đưa số liệu cụ thể vào Overview',
    explanation: 'Phần Overview KHÔNG được có số liệu cụ thể (10%, 85%, 1990, 2020). Chỉ nêu xu hướng tổng quát.',
    xpReward: 8, orderIndex: 35
  },
  {
    skillType: 'overview', module: 4, level: 'intermediate', type: 'translation',
    instruction: 'Viết câu Overview cho biểu đồ sau:\n- Chicken: tăng liên tục từ 1979 đến 2004 → trở thành loại thịt được tiêu thụ nhiều nhất\n- Beef và Lamb: đều giảm\n- Fish: ổn định, ít nhất',
    questionVi: 'Viết 2 câu Overview (không dùng số liệu cụ thể)',
    sampleAnswers: [
      'Overall, it is clear that chicken consumption experienced an upward trend and became the most widely consumed meat by the end of the period. Additionally, while beef and lamb saw continuous declines, fish remained relatively stable at the lowest level throughout.',
      'It is clear that chicken was the only meat whose consumption increased over the period, while the figures for beef and lamb both fell. Additionally, fish remained the least popular choice throughout the years shown.'
    ],
    primaryAnswer: 'Overall, it is clear that chicken consumption experienced an upward trend and became the most widely consumed meat by the end of the period. Additionally, while beef and lamb saw continuous declines, fish remained relatively stable at the lowest level throughout.',
    grammarPoint: 'Overview formula: Sentence 1 (most prominent feature) + Sentence 2 (second feature/contrast)',
    explanation: 'Câu 1: nêu xu hướng nổi bật nhất. Câu 2: nêu xu hướng trái ngược hoặc thứ hai.',
    hints: ['It is clear that', 'experienced an upward trend', 'while', 'Additionally'],
    xpReward: 20, orderIndex: 36
  }
];

// ─── 50 CÂU MẪU IELTS TASK 1 ──────────────────────────────────────────────
const sampleExercises = [
  // ─── NOUN PHRASE ────────────────────────────────────────────────────────
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền từ thích hợp vào chỗ trống:',
    sentenceWithBlanks: 'The ___ of CO₂ emitted by factories in 2010 was 500 tonnes.',
    blanksCount: 1,
    sampleAnswers: ['amount', 'quantity'],
    primaryAnswer: 'amount',
    grammarPoint: 'Uncountable noun: The amount/quantity of + uncountable noun (CO₂, water, energy)',
    explanation: 'CO₂ là danh từ không đếm được → dùng "amount" hoặc "quantity", không dùng "number"',
    hints: ['amount', 'quantity'],
    orderIndex: 37, xpReward: 5
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn cụm từ ĐÚNG để mô tả dữ liệu:',
    questionEn: 'Subject: students enrolled in university | Data: 45%',
    options: [
      'The number of students enrolled was 45%.',
      'The proportion of students enrolled in university was 45%.',
      'The amount of students enrolled was 45%.',
      'The figure of enrolled students was 45%.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Percentage data → The proportion/percentage/rate of + noun',
    explanation: 'Dữ liệu % dùng proportion/percentage/rate. "Number" và "amount" không dùng cho %.',
    orderIndex: 38, xpReward: 5
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền từ thích hợp (number / amount / proportion):',
    sentenceWithBlanks: 'The ___ of electricity consumed in Germany doubled between 2000 and 2020.',
    blanksCount: 1,
    sampleAnswers: ['amount', 'quantity'],
    primaryAnswer: 'amount',
    grammarPoint: 'Electricity = uncountable → amount of electricity',
    explanation: 'Điện (electricity) không đếm được → "amount". Tương tự: water, oil, gas, food.',
    hints: ['amount', 'quantity'],
    orderIndex: 39, xpReward: 5
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu ĐÚNG ngữ pháp:',
    questionEn: 'Chủ đề: tourists visiting Paris | Năm: 2019 | Số liệu: 38 million',
    options: [
      'The amount of tourists visiting Paris was 38 million in 2019.',
      'The number of tourists visiting Paris stood at 38 million in 2019.',
      'The percentage of tourists in Paris was 38 million.',
      'There was 38 million tourists visiting Paris.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Countable noun (tourists) → The number of + plural noun + stood at',
    explanation: '"tourists" đếm được → "number". "stood at" = cách hay thay cho "was/were".',
    orderIndex: 40, xpReward: 5
  },
  {
    skillType: 'noun_phrase', module: 1, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn cụm danh từ ĐÚNG cho dữ liệu sau:',
    questionEn: 'Data: 60% of workers in the UK used public transport in 2015',
    options: [
      'The number of UK workers using public transport was 60%.',
      'The rate of UK workers using public transport stood at 60% in 2015.',
      'The amount of workers in the UK was 60% in 2015.',
      '60% figures of UK workers used public transport.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Percentage → rate/proportion/percentage of + noun',
    explanation: '"rate" = tỷ lệ, dùng khi nói đến hành vi/thói quen của nhóm người.',
    orderIndex: 41, xpReward: 5
  },

  // ─── DATA DESCRIPTION ───────────────────────────────────────────────────
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch sang tiếng Anh (dữ liệu ở cuối câu):',
    questionVi: 'Số lượng sinh viên đại học ở Anh năm 2010 là 2,5 triệu người.',
    sampleAnswers: [
      'The number of university students in the UK was 2.5 million in 2010.',
      'The number of university students in the UK stood at 2.5 million in 2010.',
      'The quantity of university students in the UK was 2.5 million in 2010.'
    ],
    primaryAnswer: 'The number of university students in the UK was 2.5 million in 2010.',
    grammarPoint: 'Structure 1: The number of + noun + was/stood at + figure + in [year]',
    explanation: 'Cấu trúc cơ bản nhất: chủ ngữ là "The number of...", dữ liệu ở cuối.',
    hints: ['The number of', 'university students', 'was/stood at', '2.5 million'],
    orderIndex: 42, xpReward: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch sang tiếng Anh (dữ liệu ở đầu câu):',
    questionVi: '38% dân số Australia sử dụng phương tiện công cộng vào năm 2018.',
    sampleAnswers: [
      '38% of the Australian population used public transport in 2018.',
      "38% of Australia's population travelled by public transport in 2018."
    ],
    primaryAnswer: '38% of the Australian population used public transport in 2018.',
    grammarPoint: 'Structure 2: Figure% of + noun + verb (data at start of sentence)',
    explanation: 'Khi % ở đầu câu: [X%] of [subject] + verb. Không cần "The percentage of".',
    hints: ['38% of', 'the Australian population', 'used', 'in 2018'],
    orderIndex: 43, xpReward: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'rearrange',
    instruction: 'Sắp xếp các từ thành câu đúng:',
    questionEn: 'Japan renewable energy = 20% of total electricity (2020)',
    baseWords: ['renewable', 'energy', 'accounted', 'for', '20%', 'of', "Japan's", 'total', 'electricity', 'in', '2020'],
    sampleAnswers: ["Renewable energy accounted for 20% of Japan's total electricity in 2020."],
    primaryAnswer: "Renewable energy accounted for 20% of Japan's total electricity in 2020.",
    grammarPoint: 'Subject + accounted for + figure% + of + noun',
    explanation: '"accounted for" = chiếm tỉ lệ, thường dùng khi % nằm sau động từ.',
    orderIndex: 44, xpReward: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch sang tiếng Anh dùng cấu trúc "There were":',
    questionVi: 'Có khoảng 1,2 tỷ người sử dụng xe đạp trên toàn thế giới vào năm 2015.',
    sampleAnswers: [
      'There were approximately 1.2 billion people using bicycles worldwide in 2015.',
      'There were around 1.2 billion bicycle users across the world in 2015.'
    ],
    primaryAnswer: 'There were approximately 1.2 billion people using bicycles worldwide in 2015.',
    grammarPoint: 'Structure 3: There were + figure + noun + V-ing / prepositional phrase',
    explanation: '"approximately/around" = khoảng, dùng khi số liệu không chính xác tuyệt đối.',
    hints: ['There were', 'approximately', '1.2 billion people', 'using bicycles', 'worldwide'],
    orderIndex: 45, xpReward: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'elementary', type: 'rearrange',
    instruction: 'Sắp xếp thành câu mô tả dữ liệu đúng:',
    questionEn: 'Brazil coffee exports = $5 billion (2005)',
    baseWords: ["Brazil's", 'coffee', 'exports', 'were', 'worth', '$5', 'billion', 'in', '2005'],
    sampleAnswers: ["Brazil's coffee exports were worth $5 billion in 2005."],
    primaryAnswer: "Brazil's coffee exports were worth $5 billion in 2005.",
    grammarPoint: 'Subject + were worth + monetary figure (dùng cho dữ liệu tiền tệ)',
    explanation: 'Dữ liệu tài chính dùng "were worth" thay vì "was/were + figure".',
    orderIndex: 46, xpReward: 8
  },
  {
    skillType: 'data_description', module: 1, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau dùng cụm "constituted":',
    questionVi: 'Lĩnh vực dịch vụ chiếm 72% GDP của Anh vào năm 2000.',
    sampleAnswers: [
      "The service sector constituted 72% of the UK's GDP in 2000.",
      "The service sector made up 72% of the UK's GDP in 2000.",
      'The service sector represented 72% of UK GDP in 2000.'
    ],
    primaryAnswer: "The service sector constituted 72% of the UK's GDP in 2000.",
    grammarPoint: 'constitute / make up / represent = chiếm (% của tổng thể)',
    explanation: '"constitute/make up/represent" là các từ học thuật thay thế "accounted for".',
    orderIndex: 47, xpReward: 10
  },

  // ─── COMPARISON ─────────────────────────────────────────────────────────
  {
    skillType: 'comparison', module: 1, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền từ/cụm từ so sánh thích hợp:',
    sentenceWithBlanks: 'The UK spent $50 billion on education, ___ only $30 billion in France.',
    blanksCount: 1,
    sampleAnswers: ['compared to', 'compared with', 'in comparison with'],
    primaryAnswer: 'compared to',
    grammarPoint: 'compared to/with | in comparison with — so sánh 2 giá trị',
    explanation: '"compared to/with" dùng nối trực tiếp hai số liệu trong cùng câu.',
    hints: ['compared to', 'compared with', 'in comparison with'],
    orderIndex: 48, xpReward: 5
  },
  {
    skillType: 'comparison', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau dùng "whereas":',
    questionVi: 'Số người dùng ô tô là 10 triệu, trong khi số người đi xe buýt là 25 triệu.',
    sampleAnswers: [
      'The number of car users was 10 million, whereas the number of bus users was 25 million.',
      'The figure for car users was 10 million, whereas the figure for bus users was 25 million.',
      'There were 10 million car users, whereas there were 25 million bus users.'
    ],
    primaryAnswer: 'The number of car users was 10 million, whereas the number of bus users was 25 million.',
    grammarPoint: 'whereas = while = trong khi (nối 2 mệnh đề tương phản)',
    explanation: '"whereas" thường trang trọng hơn "while", cả hai đặt ở giữa câu.',
    hints: ['The number of car users', 'was 10 million', 'whereas', 'the number of bus users', 'was 25 million'],
    orderIndex: 49, xpReward: 10
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau dùng "respectively":',
    questionVi: 'Tỷ lệ nam và nữ học đại học lần lượt là 55% và 45%.',
    sampleAnswers: [
      'The proportions of male and female university students were 55% and 45%, respectively.',
      'The figures for male and female university students were 55% and 45%, respectively.'
    ],
    primaryAnswer: 'The proportions of male and female university students were 55% and 45%, respectively.',
    grammarPoint: 'respectively — luôn đặt CUỐI câu, chỉ sự tương ứng theo thứ tự',
    explanation: '"respectively" = lần lượt, phải đặt cuối câu sau dấu phẩy.',
    hints: ['The proportions of', 'male and female', 'were 55% and 45%', 'respectively'],
    orderIndex: 50, xpReward: 10
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau dùng "three times as many as":',
    questionVi: 'Số người dùng điện thoại thông minh gấp ba lần số người dùng máy tính bảng.',
    sampleAnswers: [
      'The number of smartphone users was three times as many as that of tablet users.',
      'The figure for smartphone users was three times as high as that for tablet users.',
      'There were three times as many smartphone users as tablet users.'
    ],
    primaryAnswer: 'The number of smartphone users was three times as many as that of tablet users.',
    grammarPoint: 'Multiplicative: X times as many/much as + "that of" (tránh lặp)',
    explanation: '"that of" thay thế "the number of" để tránh lặp từ trong câu.',
    hints: ['three times as many as', 'that of tablet users'],
    orderIndex: 51, xpReward: 12
  },
  {
    skillType: 'comparison', module: 1, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu dùng "by contrast":',
    questionVi: "Dân số đô thị của Trung Quốc tăng mạnh lên 60%. Ngược lại, dân số nông thôn giảm xuống còn 40%.",
    sampleAnswers: [
      "China's urban population rose significantly to 60%. By contrast, the rural population declined to 40%.",
      'The urban population of China increased sharply to 60%. By contrast, the rural figure fell to just 40%.'
    ],
    primaryAnswer: "China's urban population rose significantly to 60%. By contrast, the rural population declined to 40%.",
    grammarPoint: 'By contrast / In contrast — đặt đầu câu thứ hai, nối hai xu hướng trái chiều',
    explanation: '"By contrast" thay thế "however", đặt đầu câu + dấu phẩy.',
    orderIndex: 52, xpReward: 12
  },
  {
    skillType: 'comparison', module: 1, level: 'intermediate', type: 'multiple_choice',
    instruction: 'Chọn câu SO SÁNH đúng nhất:',
    questionEn: 'Germany: 80 million tonnes steel | France: 40 million tonnes steel (same year)',
    options: [
      'Germany produced as twice as much steel as France.',
      'Germany produced twice as much steel as France.',
      'Germany produced two times more steel as France.',
      "Germany's steel was double than France."
    ],
    correctOptionIndex: 1,
    grammarPoint: 'twice as much as (không có "as" trước "twice", không có "more")',
    explanation: '"twice as much as" là cấu trúc cố định. KHÔNG nói "as twice as" hay "double than".',
    orderIndex: 53, xpReward: 8
  },

  // ─── TREND LANGUAGE ─────────────────────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ mô tả xu hướng GIẢM phù hợp nhất:',
    questionEn: 'The number of coal mines ___ sharply between 1980 and 2000.',
    options: ['increased', 'declined', 'fluctuated', 'stabilised'],
    correctOptionIndex: 1,
    grammarPoint: 'Decline/fall/drop/decrease/plummet/plunge = xu hướng giảm',
    explanation: 'Các từ chỉ giảm: fell, dropped, declined, decreased, plummeted, plunged.',
    orderIndex: 54, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng (to / by / at / of):',
    sentenceWithBlanks: 'Oil prices fell ___ $30 per barrel in 2016.',
    blanksCount: 1,
    sampleAnswers: ['to'],
    primaryAnswer: 'to',
    grammarPoint: 'fell TO = giảm xuống tới mức (giá trị cuối)',
    explanation: '"to" = điểm đến (giá trị sau khi thay đổi). "by" = mức thay đổi. Ví dụ: fell by $20 vs fell to $30.',
    hints: ['to', 'by'],
    orderIndex: 55, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng:',
    sentenceWithBlanks: 'House prices rose ___ 15% over the decade.',
    blanksCount: 1,
    sampleAnswers: ['by'],
    primaryAnswer: 'by',
    grammarPoint: 'rose BY = tăng thêm (mức tăng, không phải giá trị cuối)',
    explanation: '"by 15%" = tăng THÊM 15%. Nếu ban đầu là 100, sau là 115.',
    hints: ['by', 'to'],
    orderIndex: 56, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng:',
    sentenceWithBlanks: 'Internet usage levelled off ___ around 70% from 2015 onwards.',
    blanksCount: 1,
    sampleAnswers: ['at'],
    primaryAnswer: 'at',
    grammarPoint: 'level off AT / stabilise AT / remain stable AT = ổn định ở mức',
    explanation: 'Sau các từ chỉ trạng thái ổn định (level off, stabilise, plateau, remain) dùng "at".',
    hints: ['at', 'to'],
    orderIndex: 57, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu mô tả xu hướng HỌC THUẬT NHẤT:',
    questionEn: 'Wind energy production: 2000 = 10 GW → 2020 = 200 GW (tăng rất mạnh)',
    options: [
      'Wind energy went up a lot from 2000 to 2020.',
      'There was a dramatic increase in wind energy production, from 10 GW in 2000 to 200 GW in 2020.',
      'Wind energy increased by 10 GW to 200 GW from 2000 dramatically.',
      'Wind energy was 10 GW before and then 200 GW.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'There was a [adj] + noun + in [subject] + from X to Y = cấu trúc danh từ chuẩn',
    explanation: 'Cấu trúc danh từ "There was a dramatic increase in..." rất học thuật và phổ biến trong Task 1.',
    orderIndex: 58, xpReward: 8
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'translation',
    instruction: 'Dịch sang tiếng Anh dùng cấu trúc "experienced":',
    questionVi: 'Số lượng khách du lịch đến Thái Lan tăng đều đặn từ 20 triệu lên 40 triệu trong giai đoạn 2000-2019.',
    sampleAnswers: [
      'The number of tourists visiting Thailand experienced a steady increase from 20 million to 40 million between 2000 and 2019.',
      'Tourism in Thailand experienced a gradual rise from 20 million to 40 million visitors between 2000 and 2019.'
    ],
    primaryAnswer: 'The number of tourists visiting Thailand experienced a steady increase from 20 million to 40 million between 2000 and 2019.',
    grammarPoint: 'Subject + experienced a [adj] + noun + from X to Y + between A and B',
    explanation: '"experienced" = "trải qua/ghi nhận", dùng chủ ngữ là chủ đề, không phải năm.',
    hints: ['experienced', 'a steady increase', 'from 20 million', 'to 40 million', 'between 2000 and 2019'],
    orderIndex: 59, xpReward: 12
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền từ chỉ xu hướng ổn định thích hợp:',
    sentenceWithBlanks: 'The birth rate in Japan ___ at approximately 1.2% throughout the 2010s.',
    blanksCount: 1,
    sampleAnswers: ['remained stable', 'stayed constant', 'levelled off', 'plateaued'],
    primaryAnswer: 'remained stable',
    grammarPoint: 'Stable trend: remained stable / stayed constant / levelled off / plateaued',
    explanation: 'Xu hướng không đổi: "remained stable/constant", "levelled off", "plateaued" đều được.',
    orderIndex: 60, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau dùng "reached a peak":',
    questionVi: 'Doanh số bán điện thoại thông minh đạt đỉnh ở mức 1,5 tỷ chiếc vào năm 2017 trước khi bắt đầu giảm.',
    sampleAnswers: [
      'Smartphone sales reached a peak of 1.5 billion units in 2017 before beginning to decline.',
      'Smartphone sales peaked at 1.5 billion in 2017 before starting to fall.'
    ],
    primaryAnswer: 'Smartphone sales reached a peak of 1.5 billion units in 2017 before beginning to decline.',
    grammarPoint: 'reached a peak of + figure / peaked at + figure — dùng "of" sau "peak", "at" sau "peaked"',
    explanation: '"reached a peak OF 1.5 billion" (danh từ "peak" + "of"). "peaked AT 1.5 billion" (động từ "peaked" + "at").',
    hints: ['reached a peak of', 'before beginning to decline'],
    orderIndex: 61, xpReward: 10
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau dùng "witnessed":',
    questionVi: 'Năm 2008 chứng kiến sự sụt giảm mạnh về giá bất động sản tại Mỹ, từ 300.000$ xuống còn 180.000$.',
    sampleAnswers: [
      'The year 2008 witnessed a sharp decline in US property prices, from $300,000 to $180,000.',
      '2008 witnessed a dramatic fall in US house prices, dropping from $300,000 to $180,000.'
    ],
    primaryAnswer: 'The year 2008 witnessed a sharp decline in US property prices, from $300,000 to $180,000.',
    grammarPoint: '[Year] witnessed/saw + a [adj] + noun + in [subject], from X to Y',
    explanation: 'Đổi chủ ngữ thành năm để tránh lặp. "witnessed" = "saw" = "chứng kiến".',
    orderIndex: 62, xpReward: 12
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'data_transform',
    instruction: 'Viết lại câu bắt đầu bằng "There was":',
    questionEn: 'Solar panel installations rose sharply from 5,000 to 80,000 units between 2010 and 2020.',
    sampleAnswers: [
      'There was a sharp rise in solar panel installations, from 5,000 to 80,000 units between 2010 and 2020.',
      'There was a dramatic increase in the number of solar panel installations from 5,000 to 80,000 between 2010 and 2020.'
    ],
    primaryAnswer: 'There was a sharp rise in solar panel installations, from 5,000 to 80,000 units between 2010 and 2020.',
    grammarPoint: 'Verb → Noun transformation: rose sharply → a sharp rise / increased dramatically → a dramatic increase',
    explanation: 'Chuyển động từ + trạng từ → tính từ + danh từ để thay đổi cấu trúc câu.',
    orderIndex: 63, xpReward: 12
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu dự đoán tương lai sang tiếng Anh:',
    questionVi: "Dân số thế giới được dự báo sẽ đạt 10 tỷ người vào năm 2050.",
    sampleAnswers: [
      "The world's population is projected to reach 10 billion by 2050.",
      'The global population is predicted to reach 10 billion by 2050.',
      'The world population is expected to hit 10 billion by 2050.'
    ],
    primaryAnswer: "The world's population is projected to reach 10 billion by 2050.",
    grammarPoint: 'is projected/predicted/expected/anticipated to + verb (dự đoán tương lai)',
    explanation: 'Dữ liệu tương lai KHÔNG dùng thì quá khứ. Dùng "is projected/predicted/expected to".',
    hints: ['is projected/predicted/expected to', 'reach', 'by 2050'],
    orderIndex: 64, xpReward: 10
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'fill_blank',
    instruction: 'Điền giới từ đúng vào tất cả chỗ trống:',
    sentenceWithBlanks: '___ 2005 ___ 2015, the unemployment rate fluctuated ___ 5% and 9%, finally settling ___ around 6%.',
    blanksCount: 4,
    sampleAnswers: ['From, to, between, at'],
    primaryAnswer: 'From 2005 to 2015, the unemployment rate fluctuated between 5% and 9%, finally settling at around 6%.',
    grammarPoint: 'From...to... | fluctuate between...and... | settle at',
    explanation: '"fluctuate between A and B" = dao động. "settle at" = ổn định ở mức cuối.',
    orderIndex: 65, xpReward: 10
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'multiple_choice',
    instruction: 'Chọn tính từ mô tả mức độ thay đổi ĐÚNG nhất:',
    questionEn: 'Sales: Jan = 10,000 → Feb = 10,200 (thay đổi rất nhỏ)',
    options: ['dramatically increased', 'sharply rose', 'slightly increased', 'significantly grew'],
    correctOptionIndex: 2,
    grammarPoint: 'Scale: dramatically > significantly > considerably > moderately > gradually > slightly',
    explanation: 'Tăng 200 trên 10,000 (2%) = rất nhỏ → "slightly". Chọn adverb phù hợp với MỨC ĐỘ thay đổi.',
    orderIndex: 66, xpReward: 8
  },

  // ─── PARAPHRASE ─────────────────────────────────────────────────────────
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn cách paraphrase TỐT NHẤT cho câu gốc:',
    questionEn: 'ORIGINAL: "The chart below shows the number of overseas students studying in five English-speaking countries in 2012."',
    options: [
      'The chart below shows the number of overseas students studying in five English-speaking countries in 2012.',
      'The bar chart illustrates how many international students studied in five countries where English is the primary language in 2012.',
      'The chart shows overseas students in countries.',
      'There is a chart about students in 2012.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Paraphrase: chart → bar chart | shows → illustrates | overseas → international | the number of → how many',
    explanation: 'Đổi tên biểu đồ, đổi động từ, đổi tính từ/danh từ đồng nghĩa. KHÔNG sao chép nguyên văn.',
    orderIndex: 67, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ thay thế ĐÚNG cho "between 2000 and 2020":',
    questionEn: 'The graph shows changes in energy consumption ___ 2000 ___ 2020.',
    options: [
      'between...and... (giữ nguyên)',
      'from...to...',
      'during the period from...to...',
      'Tất cả B và C đều đúng'
    ],
    correctOptionIndex: 3,
    grammarPoint: '"between X and Y" = "from X to Y" = "during the period from X to Y" = "over the X-Y period"',
    explanation: 'Tất cả đều đúng và có thể thay thế nhau khi paraphrase thời gian.',
    orderIndex: 68, xpReward: 5
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'translation',
    instruction: 'Viết câu mở bài (paraphrase) cho đề bài sau:',
    questionEn: 'ORIGINAL: "The diagram below shows how solar panels work to produce electricity for home use."',
    sampleAnswers: [
      'The diagram illustrates the process by which solar panels generate electricity for domestic use.',
      'The diagram depicts how electricity is produced from solar panels for use in homes.',
      'The diagram shows the stages involved in generating electricity from solar panels for household purposes.'
    ],
    primaryAnswer: 'The diagram illustrates the process by which solar panels generate electricity for domestic use.',
    grammarPoint: 'Process diagram paraphrase: shows how → illustrates the process by which | home → domestic/household',
    explanation: 'Với process diagram: "illustrates the process by which..." hoặc "depicts how...". "home" → "domestic/household".',
    hints: ['illustrates', 'the process by which', 'generate', 'domestic use'],
    orderIndex: 69, xpReward: 15
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'translation',
    instruction: 'Viết câu mở bài cho đề bài sau:',
    questionEn: 'ORIGINAL: "The table below shows the percentage of the population who used the Internet in six countries in 2000 and 2010."',
    sampleAnswers: [
      'The table compares the proportions of internet users in six countries in 2000 and 2010.',
      'The table illustrates the rates of internet usage among the populations of six different countries in 2000 and 2010.',
      'The table provides data on the percentage of people who had access to the internet in six countries across two years, 2000 and 2010.'
    ],
    primaryAnswer: 'The table compares the proportions of internet users in six countries in 2000 and 2010.',
    grammarPoint: 'percentage → proportion/rate | used the Internet → internet users/internet usage',
    explanation: '"the percentage of people who used" → gộp lại thành "internet users" hoặc "internet usage" ngắn gọn hơn.',
    orderIndex: 70, xpReward: 15
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'error_correction',
    instruction: 'Tìm và sửa LỖI trong câu mở bài sau:',
    questionEn: 'The pie chart compare the main reasons why people choose to work aboard in 2019.',
    sampleAnswers: ['The pie chart compares the main reasons why people choose to work abroad in 2019.'],
    primaryAnswer: 'The pie chart compares the main reasons why people choose to work abroad in 2019.',
    grammarPoint: 'Subject-verb agreement (chart = singular → compares) + spelling (aboard → abroad)',
    explanation: 'Lỗi 1: "compare" → "compares" (chủ ngữ số ít). Lỗi 2: "aboard" (trên tàu) → "abroad" (nước ngoài).',
    orderIndex: 71, xpReward: 10
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'translation',
    instruction: 'Viết câu mở bài cho đề bài sau (dùng cấu trúc "in terms of"):',
    questionEn: 'ORIGINAL: "The charts below show the electricity generated in Germany and France from all sources and renewables in 2009."',
    sampleAnswers: [
      'The charts compare Germany and France in terms of their total electricity generation and the share produced from renewable sources in 2009.',
      'The charts illustrate the total electricity output and the proportion from renewable energy in both Germany and France in 2009.'
    ],
    primaryAnswer: 'The charts compare Germany and France in terms of their total electricity generation and the share produced from renewable sources in 2009.',
    grammarPoint: 'compare X and Y in terms of Z = so sánh X và Y về mặt Z',
    explanation: '"in terms of" dùng để chỉ tiêu chí so sánh. "generated" → "generation/output". "renewables" → "renewable sources".',
    orderIndex: 72, xpReward: 15
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'error_correction',
    instruction: 'Sửa tất cả lỗi trong câu mở bài:',
    questionEn: 'The line graph illustrate informations about how much money was spend on fast food in britain between 1970 and 1990.',
    sampleAnswers: ['The line graph illustrates the amount of money spent on fast food in Britain between 1970 and 1990.'],
    primaryAnswer: 'The line graph illustrates the amount of money spent on fast food in Britain between 1970 and 1990.',
    grammarPoint: 'illustrate→illustrates | informations (uncountable) → information/the amount | spend→spent | britain→Britain',
    explanation: '4 lỗi: subject-verb agreement, "informations" không tồn tại, "spend"→"spent", viết hoa Britain.',
    orderIndex: 73, xpReward: 12
  },

  // ─── OVERVIEW ────────────────────────────────────────────────────────────
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu Overview TỐT NHẤT:',
    questionEn: '[Biểu đồ cột: Chi tiêu giáo dục của 5 nước. UK cao nhất ~$8,000; Japan thấp nhất ~$3,000; các nước còn lại ở giữa]',
    options: [
      'Overall, the UK had the highest education spending at $8,000, while Japan had the lowest at $3,000.',
      'It is clear that the UK spent the most on education, while Japan allocated the least. The other three countries all fell between these two extremes.',
      'Overall, education spending varied across countries.',
      "The UK's education budget was $8,000 in total."
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Overview: KHÔNG có số liệu cụ thể | Nêu 2 đặc điểm nổi bật | Dùng "It is clear that"',
    explanation: 'Đáp án A có số liệu cụ thể ($8,000, $3,000) → SAI. B nêu xu hướng tổng quát không có số → ĐÚNG.',
    orderIndex: 74, xpReward: 10
  },
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'multiple_choice',
    instruction: 'Câu nào KHÔNG phù hợp để bắt đầu Overview?',
    questionEn: 'Chọn cụm từ KHÔNG dùng để mở đầu Overview:',
    options: [
      'Overall, it is clear that...',
      'In summary, the most noticeable trend is...',
      'To begin with, the figure for...',
      'It is also noticeable that...'
    ],
    correctOptionIndex: 2,
    grammarPoint: 'Overview starters: Overall / In general / It is clear/noticeable that — KHÔNG dùng "To begin with" (dành cho body)',
    explanation: '"To begin with" dùng để mở đầu đoạn body, không phải Overview. Overview dùng: Overall, In general, It is clear/noticeable that.',
    orderIndex: 75, xpReward: 8
  },
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'translation',
    instruction: 'Viết 2 câu Overview cho biểu đồ sau (KHÔNG dùng số liệu):',
    questionEn: '[Pie chart: Energy sources in the UK 2019. Coal = 5%, Gas = 40%, Nuclear = 20%, Renewables = 30%, Oil = 5%]',
    sampleAnswers: [
      'Overall, it is clear that gas was the dominant energy source in the UK, accounting for the largest share of total production. Additionally, renewable energy was the second most significant source, while coal and oil contributed the least.',
      "In general, gas dominated the UK's energy mix, with renewables coming in second place. By contrast, coal and oil played only a minor role in electricity generation."
    ],
    primaryAnswer: 'Overall, it is clear that gas was the dominant energy source in the UK, accounting for the largest share of total production. Additionally, renewable energy was the second most significant source, while coal and oil contributed the least.',
    grammarPoint: 'Overview formula: Câu 1 (đặc điểm nổi bật nhất) + Câu 2 (đặc điểm phụ/tương phản)',
    explanation: 'Câu 1: nêu cái chiếm tỷ lệ lớn nhất. Câu 2: nêu cái ít nhất / tương phản. Không có con số.',
    hints: ['it is clear that', 'dominant', 'Additionally', 'while', 'contributed the least'],
    orderIndex: 76, xpReward: 20
  },
  {
    skillType: 'overview', module: 4, level: 'elementary', type: 'translation',
    instruction: 'Viết 2 câu Overview cho biểu đồ đường (KHÔNG dùng số liệu):',
    questionEn: '[Line graph: 3 loại phương tiện giao thông tại UK 1970-2030. Car: tăng liên tục và cao nhất. Bus: giảm nhẹ. Train: tăng sau 2000, được dự đoán tăng mạnh đến 2030]',
    sampleAnswers: [
      'Overall, car travel was by far the most popular mode of transport throughout the period and is expected to continue rising. It is also noticeable that train usage is predicted to increase significantly towards 2030, while bus travel showed a gradual decline.',
      'In general, the car remained the dominant form of transport over the entire period shown. Additionally, while bus usage saw a slight downward trend, train travel is projected to grow considerably in the coming years.'
    ],
    primaryAnswer: 'Overall, car travel was by far the most popular mode of transport throughout the period and is expected to continue rising. It is also noticeable that train usage is predicted to increase significantly towards 2030, while bus travel showed a gradual decline.',
    grammarPoint: 'Mixed tense in overview: past tense (1970-present) + future prediction (is expected/predicted to)',
    explanation: 'Dữ liệu quá khứ → past tense. Dữ liệu tương lai trong biểu đồ → is expected/projected to.',
    orderIndex: 77, xpReward: 20
  },
  {
    skillType: 'overview', module: 4, level: 'intermediate', type: 'error_correction',
    instruction: 'Sửa lỗi trong câu Overview sau:',
    questionEn: 'Overall, it is clear that the number of car ownership increased from 5 million to 15 million over the period, while bicycle usage fell from 8 million to 2 million.',
    sampleAnswers: ['Overall, it is clear that car ownership increased significantly over the period, while bicycle usage experienced a notable decline.'],
    primaryAnswer: 'Overall, it is clear that car ownership increased significantly over the period, while bicycle usage experienced a notable decline.',
    grammarPoint: 'Overview lỗi: có số liệu cụ thể (5→15 million, 8→2 million) → phải bỏ hết',
    explanation: 'Overview TUYỆT ĐỐI không có số liệu cụ thể. Chỉ nêu xu hướng, không nêu con số.',
    orderIndex: 78, xpReward: 12
  },
  {
    skillType: 'overview', module: 4, level: 'intermediate', type: 'translation',
    instruction: 'Viết Overview cho biểu đồ MAP/PLAN (không dùng số liệu):',
    questionEn: '[Map: A town in 1980 vs 2020. Thêm: shopping centre, hospital, residential area. Bỏ: farmland, forest. Đường xá mở rộng]',
    sampleAnswers: [
      'Overall, the town underwent significant development over the 40-year period, with the addition of several key facilities and a considerable expansion of residential and commercial areas. The most notable change was the replacement of natural land with urban infrastructure.',
      'In general, the town became considerably more urbanised between 1980 and 2020, with natural areas giving way to new buildings and improved transport links.'
    ],
    primaryAnswer: 'Overall, the town underwent significant development over the 40-year period, with the addition of several key facilities and a considerable expansion of residential and commercial areas. The most notable change was the replacement of natural land with urban infrastructure.',
    grammarPoint: 'Map Overview: general trend of change (urbanisation/development) + most notable feature',
    explanation: 'Map overview nêu xu hướng tổng quát (đô thị hóa, phát triển) + thay đổi nổi bật nhất.',
    orderIndex: 79, xpReward: 20
  },

  // ─── PARAPHRASE: NOUN PHRASES (3 kỹ thuật) ──────────────────────────────
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ ĐỒNG NGHĨA (synonym) thay thế cho từ in đậm:',
    questionEn: 'ORIGINAL: "The bar chart shows the **amount** of water used for agriculture in Australia in 2015."',
    options: [
      'number',
      'quantity',
      'percentage',
      'figure'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Synonym – Cách 1: amount → quantity (danh từ không đếm được)',
    explanation: '"amount" và "quantity" đều dùng cho danh từ không đếm được (water). "number" dùng cho danh từ đếm được. "figure" thay cho số liệu, không thay cho "amount" trực tiếp.',
    orderIndex: 87, xpReward: 5
  },
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ ĐỒNG NGHĨA thay thế cho "number" (danh từ đếm được):',
    questionEn: 'ORIGINAL: "The graph shows the **number** of tourists visiting coastal cities between 2000 and 2010."',
    options: [
      'amount',
      'quantity',
      'figure',
      'Cả B và C đều đúng'
    ],
    correctOptionIndex: 2,
    grammarPoint: 'Synonym – Cách 1: number → figure (chỉ số liệu đếm được)',
    explanation: '"figure" = con số, có thể thay cho "number" trong ngữ cảnh học thuật. "amount/quantity" không dùng cho danh từ đếm được (tourists).',
    orderIndex: 88, xpReward: 5
  },
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn cặp synonym ĐÚNG để paraphrase các từ được gạch dưới:',
    questionEn: 'ORIGINAL: "The table shows the number of cars **produced** in different **countries** in 2020."',
    options: [
      'produced → made | countries → nations',
      'produced → consumed | countries → cities',
      'produced → exported | countries → regions',
      'produced → used | countries → areas'
    ],
    correctOptionIndex: 0,
    grammarPoint: 'Synonym pairs: produce → make | country → nation | use → utilize | number → figure',
    explanation: '"produced → made" và "countries → nations" là cặp synonym phổ biến và chính xác nhất. "made" tương đương "produced" trong ngữ cảnh sản xuất.',
    orderIndex: 89, xpReward: 5
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền dạng DANH TỪ phù hợp (word form – Cách 2):',
    sentenceWithBlanks: 'ORIGINAL: "The amount of water **consumed** in households." → PARAPHRASE: "Water ___ in households."',
    blanksCount: 1,
    sampleAnswers: ['consumption'],
    primaryAnswer: 'consumption',
    grammarPoint: 'Word form – Cách 2: consumed (verb) → consumption (noun)',
    explanation: '"consumed" là động từ → biến đổi thành danh từ "consumption". Cấu trúc: [Subject] + [noun form] + [prepositional phrase].',
    hints: ['consumption', 'consuming'],
    orderIndex: 90, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền dạng DANH TỪ phù hợp (word form – Cách 2):',
    sentenceWithBlanks: 'ORIGINAL: "The number of cars **sold** in Asia." → PARAPHRASE: "Car ___ in Asia."',
    blanksCount: 1,
    sampleAnswers: ['sales'],
    primaryAnswer: 'sales',
    grammarPoint: 'Word form – Cách 2: sold (verb) → sales (noun)',
    explanation: '"sold" là động từ quá khứ của "sell" → danh từ là "sales". Ví dụ tương tự: export → exports, import → imports.',
    hints: ['sales', 'selling'],
    orderIndex: 91, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu paraphrase dùng WORD FORM đúng (Cách 2):',
    questionEn: 'ORIGINAL: "The amount of money **spent** on education in five countries in 2018."',
    options: [
      'The money spending on education in five countries in 2018.',
      'Education expenditure in five countries in 2018.',
      'The amount of money expenditure on education in five countries in 2018.',
      'The spending money on education in five countries in 2018.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Word form: spent (verb) → expenditure / spending (noun)',
    explanation: '"spent" → "expenditure" (học thuật hơn) hoặc "spending". Cấu trúc: [Subject] + [noun form] + [location/context]. KHÔNG ghép "amount of" với "expenditure".',
    orderIndex: 92, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu ĐÚNG dùng cấu trúc "The + Noun + of + Noun" (Cách 3 – đổi trật tự từ):',
    questionEn: 'ORIGINAL: "Electricity consumption in Germany between 2000 and 2020."',
    options: [
      'The electricity of consumption in Germany between 2000 and 2020.',
      'The consumption of electricity in Germany between 2000 and 2020.',
      'The consuming of electricity in Germany between 2000 and 2020.',
      'Electricity of the consumption in Germany between 2000 and 2020.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Word order – Cách 3: [Noun₁] + [Noun₂] → The + [Noun₂] + of + [Noun₁]',
    explanation: '"Electricity consumption" → "The consumption of electricity". Luôn dùng danh từ đúng, không dùng V-ing.',
    orderIndex: 93, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn câu áp dụng ĐÚNG cả 3 cách paraphrase:',
    questionEn: 'ORIGINAL: "The graph shows the number of cars sold in Asia from 2015 to 2020."',
    options: [
      'The line graph illustrates car sales in Asia during the period 2015 to 2020.',
      'The graph shows car selling in Asian countries in 2015 and 2020.',
      'The graph illustrates how much cars were sold in Asia from 2015 to 2020.',
      'The graph illustrates the numbers of sold cars in Asian from 2015 to 2020.'
    ],
    correctOptionIndex: 0,
    grammarPoint: 'Combine 3 methods: shows→illustrates (synonym) | the number of cars sold→car sales (word form) | from...to...→during the period (synonym)',
    explanation: 'Đáp án A: dùng đủ 3 kỹ thuật. B: sai ("car selling" không tự nhiên). C: "how much" sai (cars đếm được → "how many"). D: "numbers of sold" không đúng cấu trúc.',
    orderIndex: 94, xpReward: 10
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'translation',
    instruction: 'Paraphrase câu sau theo Cách 1 (synonym) — thay ít nhất 3 từ:',
    questionEn: 'ORIGINAL: "The graph below shows the number of tourists visiting coastal cities between 2000 and 2010."',
    sampleAnswers: [
      'The line graph illustrates the figure for tourists travelling to seaside cities from 2000 to 2010.',
      'The chart depicts how many visitors came to coastal towns during the period from 2000 to 2010.',
      'The graph presents the figure for people visiting coastal cities over the 2000–2010 period.'
    ],
    primaryAnswer: 'The line graph illustrates the figure for tourists travelling to seaside cities from 2000 to 2010.',
    grammarPoint: 'Synonym: graph→line graph | shows→illustrates | number→figure | visiting→travelling to | between...and...→from...to...',
    explanation: 'Thay ít nhất 3 từ: động từ (shows→illustrates), danh từ (number→figure), tính từ/danh từ (coastal→seaside), giới từ thời gian (between...and...→from...to...).',
    hints: ['illustrates/depicts', 'figure for', 'travelling to / coming to', 'from ... to ...'],
    orderIndex: 95, xpReward: 15
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'data_transform',
    instruction: 'Viết lại câu dùng WORD FORM (Cách 2) — bắt đầu bằng từ gợi ý:',
    questionEn: 'ORIGINAL: "The amount of money spent on education in five countries in 2018."\nViết lại bắt đầu bằng: "Education ___"',
    sampleAnswers: [
      'Education expenditure in five countries in 2018.',
      'Education spending in five countries in 2018.'
    ],
    primaryAnswer: 'Education expenditure in five countries in 2018.',
    grammarPoint: 'Word form: the amount of money spent → expenditure/spending (bỏ "the amount of money")',
    explanation: '"spent" → "expenditure/spending". Bỏ "the amount of money" đi, chỉ cần "Education expenditure/spending". Đây là cách rút gọn rất phổ biến trong Task 1.',
    hints: ['Education expenditure', 'Education spending'],
    orderIndex: 96, xpReward: 12
  },
  {
    skillType: 'paraphrase', module: 3, level: 'elementary', type: 'data_transform',
    instruction: 'Viết lại câu dùng CẤU TRÚC "The + Noun + of + Noun" (Cách 3):',
    questionEn: 'ORIGINAL: "Car sales in Asia from 2015 to 2020."\nViết lại bắt đầu bằng: "The ___ of ___"',
    sampleAnswers: [
      'The sales of cars in Asia from 2015 to 2020.',
      'The sale of cars in Asia from 2015 to 2020.'
    ],
    primaryAnswer: 'The sales of cars in Asia from 2015 to 2020.',
    grammarPoint: 'Word order: [Noun₁ + Noun₂] → The + [Noun₂] + of + [Noun₁]',
    explanation: '"Car sales" → "The sales of cars". Cấu trúc này áp dụng được cho: water consumption → the consumption of water, electricity use → the use of electricity, student enrolment → the enrolment of students.',
    hints: ['The sales of cars'],
    orderIndex: 97, xpReward: 12
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'translation',
    instruction: 'Paraphrase câu sau theo CẢ 3 CÁCH (viết 3 câu riêng biệt):',
    questionEn: 'ORIGINAL: "The percentage of students who participated in sports activities in 2022."',
    sampleAnswers: [
      'Cách 1 (synonym): The proportion of learners who took part in athletic activities in 2022.',
      'Cách 2 (word form): Student participation in sports activities in 2022.',
      'Cách 3 (word order): The participation of students in sports activities in 2022.'
    ],
    primaryAnswer: 'The proportion of learners who took part in athletic activities in 2022.',
    grammarPoint: 'Apply all 3 methods: percentage→proportion (synonym) | participated→participation (word form) | student participation→the participation of students (word order)',
    explanation: 'Cách 1: percentage→proportion, students→learners, participated→took part in. Cách 2: bỏ "The percentage of...who", dùng "Student participation". Cách 3: "Student participation" → "The participation of students".',
    hints: ['proportion of', 'learners/pupils', 'took part in / engaged in', 'student participation', 'the participation of students'],
    orderIndex: 98, xpReward: 20
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'translation',
    instruction: 'Paraphrase câu mở bài Task 1 sau dùng ÍT NHẤT 2 trong 3 kỹ thuật:',
    questionEn: 'ORIGINAL: "The bar chart below shows the amount of water used for agriculture in Australia in 2015."',
    sampleAnswers: [
      'The bar chart illustrates the quantity of water utilized for farming in Australia in 2015.',
      'The bar chart depicts agricultural water use in Australia in 2015.',
      'The bar chart presents the use of water for agricultural purposes in Australia in 2015.'
    ],
    primaryAnswer: 'The bar chart illustrates the quantity of water utilized for farming in Australia in 2015.',
    grammarPoint: 'Cách 1: shows→illustrates, amount→quantity, used→utilized, agriculture→farming. Cách 2: water used→water use. Cách 3: water use→the use of water',
    explanation: 'Đáp án mẫu 1: dùng Cách 1 (synonym). Đáp án 2: dùng Cách 2 (word form: used→use). Đáp án 3: dùng Cách 3 (word order). Tất cả đều chấp nhận được.',
    hints: ['illustrates/depicts', 'quantity/volume', 'utilized/employed', 'farming/agricultural purposes'],
    orderIndex: 99, xpReward: 15
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'error_correction',
    instruction: 'Tìm và sửa LỖI trong câu paraphrase sau:',
    questionEn: 'ORIGINAL: "The graph shows the number of people who used public transport in major cities in 2010."\nPARAPHRASE: "The chart illustrate how much people travelled by public transport in large city in 2010."',
    sampleAnswers: [
      'The chart illustrates how many people travelled by public transport in large cities in 2010.'
    ],
    primaryAnswer: 'The chart illustrates how many people travelled by public transport in large cities in 2010.',
    grammarPoint: 'Errors: illustrate→illustrates (subject-verb) | how much→how many (countable noun: people) | large city→large cities (plural)',
    explanation: '3 lỗi: (1) "illustrate" → "illustrates" (chủ ngữ số ít). (2) "how much" → "how many" (people = đếm được). (3) "large city" → "large cities" (số nhiều, tương ứng "major cities" trong gốc).',
    orderIndex: 100, xpReward: 12
  },
  {
    skillType: 'paraphrase', module: 3, level: 'intermediate', type: 'translation',
    instruction: 'Viết câu mở bài Task 1 hoàn chỉnh cho đề bài sau (dùng ít nhất 2 kỹ thuật paraphrase):',
    questionEn: 'ORIGINAL: "The pie chart below shows the percentage of people who used different types of energy in Australia in 2020."',
    sampleAnswers: [
      'The pie chart illustrates the proportion of Australians who utilized various types of energy in 2020.',
      'The pie chart depicts energy usage among different types by the Australian population in 2020.',
      'The pie chart compares the rates of energy use across different sources in Australia in 2020.'
    ],
    primaryAnswer: 'The pie chart illustrates the proportion of Australians who utilized various types of energy in 2020.',
    grammarPoint: 'Paraphrase checklist: shows→illustrates | percentage→proportion | people→Australians | used→utilized | different→various',
    explanation: 'Đổi: động từ (shows→illustrates/depicts/compares), danh từ (percentage→proportion/rate), tính từ (different→various), danh từ chỉ người (people in Australia→Australians). Không cần giữ "below" trong câu mở bài.',
    hints: ['illustrates/depicts/compares', 'proportion/rate', 'utilized/employed', 'various/different types of', 'Australians/the Australian population'],
    orderIndex: 101, xpReward: 20
  },

  // ─── MIXED EXERCISES ────────────────────────────────────────────────────
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ mô tả xu hướng DAO ĐỘNG phù hợp nhất:',
    questionEn: 'The price of oil ___ between $40 and $80 per barrel throughout the 2000s.',
    options: ['increased', 'decreased', 'fluctuated', 'doubled'],
    correctOptionIndex: 2,
    grammarPoint: 'fluctuate = dao động lên xuống không ổn định (dùng "between...and...")',
    explanation: '"fluctuate" = lúc tăng lúc giảm, không theo hướng rõ ràng. Luôn dùng kèm "between X and Y".',
    orderIndex: 80, xpReward: 5
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau mô tả biểu đồ tròn (pie chart):',
    questionVi: 'Giao thông cá nhân chiếm tỷ lệ lớn nhất với 45%, tiếp theo là xe buýt với 30% và tàu điện với 25%.',
    sampleAnswers: [
      'Private transport accounted for the largest share at 45%, followed by bus at 30% and tram at 25%.',
      'Private vehicles constituted the highest proportion at 45%, with bus and tram making up 30% and 25% respectively.'
    ],
    primaryAnswer: 'Private transport accounted for the largest share at 45%, followed by bus at 30% and tram at 25%.',
    grammarPoint: 'Pie chart language: accounted for the largest/smallest share | followed by | at [figure]',
    explanation: '"followed by" = tiếp theo là, dùng sau khi nêu giá trị cao nhất. "at 45%" = đứng ở mức 45%.',
    hints: ['accounted for the largest share', 'at 45%', 'followed by', 'at 30%', 'and...at 25%'],
    orderIndex: 81, xpReward: 12
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'rearrange',
    instruction: 'Sắp xếp từ thành câu so sánh đúng:',
    questionEn: 'Context: Spain tourism revenue > Germany tourism revenue (both in 2019)',
    baseWords: ['Spain', 'earned', 'significantly', 'more', 'tourism', 'revenue', 'than', 'Germany', 'in', '2019'],
    sampleAnswers: ['Spain earned significantly more tourism revenue than Germany in 2019.'],
    primaryAnswer: 'Spain earned significantly more tourism revenue than Germany in 2019.',
    grammarPoint: 'Comparative: more + noun + than (so sánh hơn với danh từ)',
    explanation: '"more...than" = so sánh hơn. Trạng từ (significantly) đặt trước "more".',
    orderIndex: 82, xpReward: 8
  },
  {
    skillType: 'paraphrase', module: 3, level: 'beginner', type: 'multiple_choice',
    instruction: 'Chọn từ thay thế ĐÚNG và HỌC THUẬT cho "shows" trong Task 1:',
    questionEn: 'The bar chart ___ the population growth in three Asian cities from 1990 to 2020.',
    options: ['shows', 'illustrates', 'depicts', 'Cả B và C đều đúng'],
    correctOptionIndex: 3,
    grammarPoint: 'Paraphrase verbs: illustrates / depicts / compares / demonstrates / presents / gives information about',
    explanation: 'Cả "illustrates" và "depicts" đều là thay thế học thuật tốt cho "shows".',
    orderIndex: 83, xpReward: 5
  },
  {
    skillType: 'data_description', module: 1, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau mô tả bảng số liệu (table) với nhiều dữ liệu:',
    questionVi: 'Năm 2010, Mỹ dẫn đầu về chi tiêu quân sự với 690 tỷ đô, gấp gần ba lần chi tiêu của Trung Quốc là 240 tỷ đô.',
    sampleAnswers: [
      "In 2010, the USA led in military spending at $690 billion, which was almost three times as much as China's expenditure of $240 billion.",
      'The USA topped military spending in 2010 at $690 billion, nearly three times the figure for China at $240 billion.'
    ],
    primaryAnswer: "In 2010, the USA led in military spending at $690 billion, which was almost three times as much as China's expenditure of $240 billion.",
    grammarPoint: 'led in [category] at [figure] | almost/nearly three times as much as',
    explanation: '"led in" = đứng đầu về. "at $690 billion" chỉ giá trị. "almost three times as much as" = gần gấp ba.',
    orderIndex: 84, xpReward: 15
  },
  {
    skillType: 'trend_language', module: 2, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau mô tả xu hướng có ĐẢO CHIỀU:',
    questionVi: 'Số lượng người hút thuốc lá ở Anh liên tục giảm từ 1990 đến 2010, tuy nhiên sau đó tăng nhẹ trở lại vào năm 2015.',
    sampleAnswers: [
      'The number of smokers in the UK declined continuously from 1990 to 2010; however, this figure experienced a slight recovery in 2015.',
      'Smoking rates in the UK fell steadily between 1990 and 2010, before experiencing a modest increase in 2015.'
    ],
    primaryAnswer: 'The number of smokers in the UK declined continuously from 1990 to 2010; however, this figure experienced a slight recovery in 2015.',
    grammarPoint: 'Contrasting trends: declined... however, experienced a slight recovery | fell... before experiencing an increase',
    explanation: '"however" (dấu chấm phẩy trước) hoặc "before + V-ing" để nối xu hướng đảo chiều.',
    orderIndex: 85, xpReward: 15
  },
  {
    skillType: 'overview', module: 4, level: 'intermediate', type: 'translation',
    instruction: 'Viết Overview cho biểu đồ cột so sánh (KHÔNG dùng số liệu cụ thể):',
    questionEn: '[Bar chart: Household spending in 5 categories (UK 2020). Food = highest. Entertainment = second. Clothing, Transport, Other = roughly equal and lowest]',
    sampleAnswers: [
      'Overall, food was by far the largest expenditure category for UK households, followed by entertainment. The remaining three categories — clothing, transport and other — were all broadly similar in terms of spending levels.',
      'In general, households allocated the greatest proportion of their budget to food, with entertainment coming in second place. By contrast, spending on clothing, transport, and other items was relatively low and fairly consistent across these categories.'
    ],
    primaryAnswer: 'Overall, food was by far the largest expenditure category for UK households, followed by entertainment. The remaining three categories — clothing, transport and other — were all broadly similar in terms of spending levels.',
    grammarPoint: 'Overview cho bar chart so sánh: nêu cao nhất + thứ hai + nhóm thấp/tương đương',
    explanation: 'Cấu trúc Overview 3 phần: (1) cao nhất, (2) thứ hai, (3) nhóm tương đương ở dưới.',
    hints: ['by far the largest', 'followed by', 'broadly similar', 'in terms of'],
    orderIndex: 86, xpReward: 20
  }
];

const allExercises = [...exercises, ...sampleExercises];

async function runSeed() {
  const Task1Exercise = require('../models/Task1Exercise');
  const existingIndexes = new Set(
    (await Task1Exercise.find({}, 'orderIndex').lean()).map(e => e.orderIndex)
  );
  const toInsert = allExercises.filter(e => !existingIndexes.has(e.orderIndex));
  if (toInsert.length === 0) {
    console.log(`[Task1Seed] All ${allExercises.length} exercises already present – skip`);
    return;
  }
  await Task1Exercise.insertMany(toInsert);
  console.log(`[Task1Seed] Seeded ${toInsert.length} new Task 1 exercises (total target: ${allExercises.length})`);
}

// Update existing DB exercises with current seed file content (for the core 36 exercises)
async function runUpdate() {
  const Task1Exercise = require('../models/Task1Exercise');
  let updated = 0;
  for (const ex of exercises) {
    const result = await Task1Exercise.updateOne(
      { orderIndex: ex.orderIndex },
      { $set: { ...ex, isActive: true } },
      { upsert: true }
    );
    if (result.modifiedCount > 0 || result.upsertedCount > 0) updated++;
  }
  console.log(`[Task1Update] Updated/upserted ${updated} core exercises (orderIndex 1-36)`);
}

module.exports = { runSeed, runUpdate, exercises: allExercises };
