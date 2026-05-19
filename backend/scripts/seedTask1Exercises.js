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
    questionVi: 'Số lượng người dùng ô tô ở Việt Nam là 5 triệu người.',
    dataContext: { type: 'table', subject: 'Vietnamese car users', year: '2000', value: '5 million', unit: 'million people' },
    sampleAnswers: [
      'The number of Vietnamese car users was 5 million.',
      'The number of Vietnamese car users stood at 5 million.',
      'The quantity of people using cars in Vietnam was 5 million.'
    ],
    primaryAnswer: 'The number of Vietnamese car users was 5 million.',
    grammarPoint: 'Structure 1: Data at end — The number of + noun + verb + figure',
    explanation: 'Cấu trúc 1: Dữ liệu ở cuối câu. Chủ ngữ là "The number of..."',
    hints: ['The number of', 'Vietnamese car users', 'was', '5 million'],
    xpReward: 8, orderIndex: 5
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh (dữ liệu ở đầu câu):',
    questionVi: '5 triệu người Việt Nam đã sử dụng ô tô.',
    sampleAnswers: [
      '5 million Vietnamese people used cars.',
      '5 million individuals in Vietnam traveled by cars.',
      '5 million people in Vietnam drove cars.'
    ],
    primaryAnswer: '5 million Vietnamese people used cars.',
    grammarPoint: 'Structure 2: Data at beginning — Figure + noun + verb',
    explanation: 'Cấu trúc 2: Dữ liệu ở đầu câu. Số liệu làm chủ ngữ.',
    hints: ['5 million', 'Vietnamese people', 'used cars'],
    xpReward: 8, orderIndex: 6
  },
  {
    skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh (dùng cấu trúc "There were"):',
    questionVi: 'Có 5 triệu người Việt Nam sử dụng ô tô.',
    sampleAnswers: [
      'There were 5 million Vietnamese people using cars.',
      'There were 5 million people in Vietnam who used cars.'
    ],
    primaryAnswer: 'There were 5 million Vietnamese people using cars.',
    grammarPoint: 'Structure 3: Data in middle — There were + figure + noun + V-ing',
    explanation: 'Cấu trúc 3: Dữ liệu ở giữa câu, dùng "There were"',
    hints: ['There were', '5 million', 'Vietnamese people', 'using cars'],
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
    questionEn: 'Vietnam Internet users = 20% of total Vietnamese population',
    baseWords: ['Internet', 'users', 'accounted', 'for', '20%', 'of', 'the', 'Vietnamese', 'population'],
    sampleAnswers: ['Internet users accounted for 20% of the Vietnamese population.'],
    primaryAnswer: 'Internet users accounted for 20% of the Vietnamese population.',
    grammarPoint: 'Percentage in middle: Subject + accounted for / made up + figure%',
    explanation: 'Dùng "accounted for" hoặc "made up" khi % nằm giữa câu',
    xpReward: 8, orderIndex: 9
  },

  // ─── MODULE 1: COMPARISON ────────────────────────────────────────────
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'fill_blank',
    instruction: 'Điền từ/cụm từ so sánh thích hợp:',
    sentenceWithBlanks: 'The number of Vietnamese car users was 5 million, ___ to 20 million motorbike users.',
    blanksCount: 1,
    sampleAnswers: ['compared', 'in comparison'],
    primaryAnswer: 'compared',
    grammarPoint: 'Comparison: compared to / in comparison with',
    explanation: 'Dùng "compared to" hoặc "in comparison with" để so sánh hai con số',
    hints: ['compared', 'in comparison'],
    xpReward: 5, orderIndex: 10
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu so sánh sau sang tiếng Anh dùng "while":',
    questionVi: 'Số người dùng ô tô là 5 triệu, trong khi số người dùng xe máy là 20 triệu.',
    sampleAnswers: [
      'The number of car users was 5 million, while the number of motorbike users was 20 million.',
      'There were 5 million car users, while there were 20 million motorbike users.',
      '5 million Vietnamese people used cars, while 20 million traveled by motorbikes.'
    ],
    primaryAnswer: 'The number of car users was 5 million, while the number of motorbike users was 20 million.',
    grammarPoint: 'Comparison with "while/whereas" — contrasting two figures',
    explanation: '"While/whereas" nối hai mệnh đề để so sánh hai số liệu khác nhau',
    hints: ['The number of car users', 'was 5 million', 'while', 'the number of motorbike users', 'was 20 million'],
    xpReward: 10, orderIndex: 11
  },
  {
    skillType: 'comparison', module: 1, level: 'elementary', type: 'translation',
    instruction: 'Dịch câu sau dùng "respectively":',
    questionVi: 'Số người dùng ô tô và xe máy ở Việt Nam lần lượt là 5 triệu và 20 triệu.',
    sampleAnswers: [
      'The numbers of Vietnamese car and motorbike users were 5 million and 20 million, respectively.',
      '5 million and 20 million Vietnamese people used cars and motorbikes, respectively.'
    ],
    primaryAnswer: 'The numbers of Vietnamese car and motorbike users were 5 million and 20 million, respectively.',
    grammarPoint: '"Respectively" — luôn đặt cuối câu, chỉ sự tương ứng',
    explanation: '"Respectively" = "lần lượt", đặt cuối câu để chỉ rõ số liệu nào thuộc về ai',
    hints: ['The numbers of', 'car and motorbike users', 'were', '5 million and 20 million', 'respectively'],
    xpReward: 10, orderIndex: 12
  },
  {
    skillType: 'comparison', module: 1, level: 'intermediate', type: 'translation',
    instruction: 'Dịch câu sau sang tiếng Anh dùng cụm "twice as many as":',
    questionVi: 'Số người dùng xe đạp là 10 triệu, gấp đôi so với người dùng ô tô.',
    sampleAnswers: [
      'The number of Vietnamese bike users was 10 million, which was twice as many as that of car users.',
      'The figure for bike users was 10 million, twice as many as the number of car users.'
    ],
    primaryAnswer: 'The number of Vietnamese bike users was 10 million, which was twice as many as that of car users.',
    grammarPoint: 'Multiplicative: twice as many as / double / treble / quadruple',
    explanation: '"Twice as many as" = gấp đôi. "that of" thay cho "the number of" để tránh lặp.',
    hints: ['The number of bike users', 'was 10 million', 'which was', 'twice as many as', 'that of car users'],
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
    blanksCount: 1,
    sampleAnswers: ['by'],
    primaryAnswer: 'by',
    grammarPoint: 'Preposition "by" = mức tăng/giảm (increase/decrease BY how much)',
    explanation: '"by" chỉ mức thay đổi: increased by 2,000 = tăng THÊM 2,000',
    hints: ['by', 'to'],
    xpReward: 5, orderIndex: 15
  },
  {
    skillType: 'trend_language', module: 2, level: 'beginner', type: 'fill_blank',
    instruction: 'Điền giới từ đúng: "to" hay "by"?',
    sentenceWithBlanks: 'The number of students increased ___ 10,000 after 2 years.',
    blanksCount: 1,
    sampleAnswers: ['to'],
    primaryAnswer: 'to',
    grammarPoint: 'Preposition "to" = giá trị cuối (increase/decrease TO a number)',
    explanation: '"to" chỉ điểm đến: increased to 10,000 = tăng LÊN TỚI 10,000',
    hints: ['to', 'by'],
    xpReward: 5, orderIndex: 16
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'multiple_choice',
    instruction: 'Chọn cách mô tả xu hướng ĐÚNG và HỌC THUẬT NHẤT:',
    questionEn: 'Car sales: 2000 = 5 million → 2010 = 15 million (tăng nhanh)',
    options: [
      'Car sales went up a lot.',
      'The number of car sales rapidly increased by 10 million to 15 million.',
      'Car sales increased to 15 million by 10 million rapidly.',
      'There was car sales that increased rapidly.'
    ],
    correctOptionIndex: 1,
    grammarPoint: 'Structure 1: Subject + Verb + Adverb + "by" + difference + "to" + final figure',
    explanation: 'Cấu trúc chuẩn: S + rapidly increased + by [mức tăng] + to [giá trị cuối]',
    xpReward: 8, orderIndex: 17
  },
  {
    skillType: 'trend_language', module: 2, level: 'elementary', type: 'translation',
    instruction: 'Dịch sang tiếng Anh dùng cấu trúc "There was a(n) adj + noun":',
    questionVi: 'Có một sự gia tăng nhanh chóng từ 10 triệu lên 15 triệu trong số người dùng ô tô.',
    sampleAnswers: [
      'There was a rapid increase of 10 million to 15 million in the number of Vietnamese car users.',
      'There was a rapid increase from 5 million to 15 million in the number of car users.'
    ],
    primaryAnswer: 'There was a rapid increase of 10 million to 15 million in the number of Vietnamese car users.',
    grammarPoint: 'Structure 2: There was a(n) [adj + noun] + of [difference] + to [final] + in [subject]',
    explanation: 'Cấu trúc danh từ: "a rapid increase" thay cho động từ "increased rapidly"',
    hints: ['There was', 'a rapid increase', 'of 10 million', 'to 15 million', 'in the number of'],
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
    questionVi: 'Doanh số ô tô tăng mạnh từ 1960 đến 1990 cho đến khi đạt đỉnh gần 95,000; tuy nhiên, doanh số bắt đầu giảm nhanh xuống dưới 65,000 vào 2010.',
    sampleAnswers: [
      'There was a sharp increase in GM car sales between 1960 and 1990 until it reached a high of almost $95,000; however, sales began to decrease swiftly to under $65,000 in 2010.',
      'Car sales increased sharply between 1960 and 1990, reaching a peak of almost $95,000; however, this figure then fell to under $65,000 by 2010.'
    ],
    primaryAnswer: 'There was a sharp increase in GM car sales between 1960 and 1990 until it reached a high of almost $95,000; however, sales began to decrease swiftly to under $65,000 in 2010.',
    grammarPoint: 'Connecting opposing trends: "until it reached a high of..." + "however" + opposite trend',
    explanation: 'Dùng "however" để nối hai xu hướng trái ngược. "until" chỉ điểm đảo chiều.',
    hints: ['until it reached a high of', 'however', 'began to decrease'],
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
    sentenceWithBlanks: 'GM car sales peaked ___ 2,000 in 1999.',
    blanksCount: 1,
    sampleAnswers: ['at'],
    primaryAnswer: 'at',
    grammarPoint: 'peaked at + number: "peak" dùng với "at"',
    explanation: '"peaked at 2,000" = đạt đỉnh tại mức 2,000. Sau peak/bottom/remain stable dùng "at".',
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
    instruction: 'Viết lại câu bắt đầu bằng "The number of cars":',
    questionEn: 'ORIGINAL: There was a gradual fall in the number of cars over the period from 1990 to 2000.',
    sampleAnswers: [
      'The number of cars fell gradually over the period from 1990 to 2000.',
      'The number of cars declined gradually between 1990 and 2000.',
      'The number of cars dropped gradually from 1990 to 2000.'
    ],
    primaryAnswer: 'The number of cars fell gradually over the period from 1990 to 2000.',
    grammarPoint: 'Sentence transformation: There was a [adj+noun] → Subject + Verb + Adverb',
    explanation: '"There was a gradual fall" (danh từ) → "fell gradually" (động từ + trạng từ)',
    hints: ['The number of cars', 'fell/declined/dropped', 'gradually', 'from 1990 to 2000'],
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

async function runSeed() {
  const Task1Exercise = require('../models/Task1Exercise');
  const count = await Task1Exercise.countDocuments();
  if (count >= exercises.length) {
    console.log(`[Task1Seed] Already has ${count} exercises – skip`);
    return;
  }
  await Task1Exercise.deleteMany({});
  await Task1Exercise.insertMany(exercises);
  console.log(`[Task1Seed] Seeded ${exercises.length} Task 1 exercises`);
}

module.exports = { runSeed, exercises };
