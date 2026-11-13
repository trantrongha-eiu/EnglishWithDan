// Mindset for IELTS Level 2 — Unit 8: Festivals and traditions (Reading pp. 148–153 · Listening pp. 160–164)
const { mcq, gap, cat, passage, card, qMcq, qMatch, qTFNG, qNote, qTable, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 4; // sách của lớp: Unit 7–8 → Sổ 4

const THREE = txt('u08-three');
const BIRTHDAY = txt('u08-birthday');
const CHINESE = txt('u08-chinese');
const VENICE = txt('u08-venice');
const T = {};
for (let n = 68; n <= 73; n++) T[n] = txt('u08-t' + n);
const SCRIPTS = Object.values(T);
const READS = [THREE, BIRTHDAY, CHINESE, VENICE];

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });
const TFNG = ['True', 'False', 'Not Given'];

module.exports = {
  n: 8,
  title: 'Festivals and traditions',
  titleVi: 'Lễ hội và truyền thống',
  pages: '148–153, 160–164',
  outcomes: [
    'Reading: True / False / Not Given — thông tin sự kiện; nhận ra khi nào thông tin là Not Given',
    'Grammar: câu điều kiện loại 1 và loại 2',
    'Listening: summary completion; điền bảng theo nhóm thông tin; Section 3–4 về tổ chức lễ hội',
    'Từ vựng lễ hội, sự kiện, tổ chức (Sổ 4)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: festivals around the world',
      titleEn: 'Lead-in · True / False / Not Given questions (pp. 148–150)',
      slot: SLOT,
      minutes: 35,
      objectives: ['Đọc ba đoạn văn ngắn về các lễ hội nổi tiếng', 'Làm quen với True / False / Not Given: thông tin sự kiện, không phải ý kiến', 'Không dùng hiểu biết riêng hay phỏng đoán khi trả lời Not Given'],
      theory: [
        card('True / False / Not Given', 'True / False / Not Given questions', {
          formula: ['TRUE — phát biểu **khớp** với thông tin trong bài', 'FALSE — phát biểu **trái ngược** thông tin trong bài', 'NOT GIVEN — bài **không có** thông tin này'],
          usage: ['Giống Yes/No/Not Given nhưng chỉ về **thông tin sự kiện**, không phải ý kiến người viết.', 'Khó nhất là nhận ra **Not Given**: chỉ dựa vào bài, không dựa vào **hiểu biết riêng** hay **phỏng đoán** ("The candles on the cake often represent your age" — đúng ngoài đời nhưng bài không nói → Not Given).'],
        }),
      ],
      vocab: vocabFile('u08-reading', [...READS, ...SCRIPTS]),
      ex: [
        mcq('True, False or Not Given? Three festivals (Ex. 3–5)', 'Read statements 1–3 relating to the short texts and decide if they are True, False or Not Given.', [
          ['Any number of people can attend La Tomatina.', TFNG, 'B', 'Từ làm câu này sai: officials have had to **limit** the event to 20,000 people.'],
          ['The mud festival is used to sell a beauty product.', TFNG, 'A', 'Cụm làm câu này đúng: the company did not want to spend money on **advertising**, so the festival was born.'],
          ['On Dia de los muertos people do the same activities their loved ones enjoyed in life.', TFNG, 'C', 'Bài chỉ liệt kê hoạt động (altars, cleaning graves, funny stories…), không nói người đã khuất từng thích chúng.'],
        ], { stimulus: stim(THREE, 'Three festivals (pp. 148–149)') }),
        mcq('True, False or Not Given? Birthdays (Ex. 6)', 'Read this short text and answer True, False or Not Given.', [
          ['The candles on the cake often represent your age.', TFNG, 'C', 'Ngoài đời thường đúng, nhưng bài không nói → Not Given.'],
          ['Everyone has a party on their birthday.', TFNG, 'B', 'Bài: "**Many** people have a party" — không phải everyone.'],
          ['Presents are often given on birthdays.', TFNG, 'A', '"together with **gifts** and cards" (gifts = presents).'],
          ['Everyone likes birthdays.', TFNG, 'C'],
          ['Birthdays are celebrated differently around the world.', TFNG, 'C'],
        ], { stimulus: stim(BIRTHDAY, 'Birthdays (p. 150)') }),
        gap('Tips for True / False / Not Given (Ex. 7)', 'Complete the tips using ONE word from the box in each gap: carefully, change, order, rely, same, synonyms. There is one word you do not need.', [
          ['Do not ____ on matching words in the text and question to decide on your answer.', 'rely'],
          ['Answers are in the same ____ as they appear in the text.', 'order'],
          ['True means that the information is the ____ as in the text, not similar.', 'same'],
          ['Read the relevant part of the text very ____.', 'carefully'],
          ['It is useful to look for ____, as the words in the question are rarely the same as those in the text.', 'synonyms'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: True / False / Not Given',
      titleEn: 'True / False / Not Given questions · Exam skills (pp. 150–153)',
      minutes: 45,
      objectives: ['Áp dụng các mẹo: không dựa vào từ trùng, đáp án theo thứ tự, True = giống hệt thông tin, đọc kỹ phần liên quan, tìm từ đồng nghĩa', 'Làm True / False / Not Given với bài đọc dài'],
      theory: [
        card('Mẹo làm True / False / Not Given', 'Tips', {
          usage: ['Không dựa vào **từ trùng** để chọn đáp án.', 'Đáp án theo **thứ tự** của bài.', '**True** = thông tin **giống** trong bài, không chỉ gần giống.', 'Đọc phần liên quan **thật kỹ**; tìm **từ đồng nghĩa**.', 'Chú ý từ hạn định: only, all, none, few, before, during — một từ có thể biến câu thành False.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U08-R1', title: 'Chinese festivals — True / False / Not Given (Ex. 8)', note: '5 câu.' },
        { ref: 'reading:M2-U08-R2', title: 'Exam skills: The Venice carnival (Ex. 11)', note: '7 câu True / False / Not Given.' },
      ],
      ex: [
        cat('True, False or Not Given? Key words (Ex. 3–8)', 'Which kind of evidence leads to each answer?', { t: 'True', f: 'False', n: 'Not Given' }, [
          ['The statement means the same as the text, using synonyms.', 't'], ['The text says something different (e.g. "many" in the text, "everyone" in the statement).', 'f'],
          ['The text contradicts a word like "only" or "any number".', 'f'], ['It may be true in real life, but the text does not say it.', 'n'], ['The text does not mention the topic at all.', 'n'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: first and second conditionals',
      titleEn: 'Grammar focus: first and second conditionals (p. 152)',
      minutes: 30,
      objectives: ['Dùng câu điều kiện loại 1 cho việc có thể xảy ra', 'Dùng câu điều kiện loại 2 cho việc khó / không thể xảy ra'],
      keyLanguage: [
        '**First conditional** — có thể xảy ra: If I **have** the time this weekend, I **will come** to the Dragon Boat Festival with you.',
        '**Second conditional** — khó xảy ra / giả định: If I **could attend** any festival in the world, it **would be** the carnival in Rio de Janeiro.',
      ],
      theory: [
        card('Câu điều kiện loại 1 và 2', 'First and second conditionals', {
          formula: ['If + present simple, … will + infinitive', 'If + past simple, … would + infinitive'],
          examples: [['If you go to the festival in town tomorrow, there will be crowds of people.', 'Có khả năng xảy ra.'], ["If I had enough money, I'd celebrate New Year in Australia.", "Không có tiền → giả định (\"I just don't have the money\")."]],
        }),
      ],
      links: [{ grammar: 'first-conditional', title: 'First Conditional', note: 'có thể xảy ra' }, { grammar: 'second-conditional', title: 'Second Conditional', note: 'giả định' }],
      ex: [
        mcq('First or second conditional? (Ex. 9)', 'Read statements a and b: a If I have the time this weekend, I will come to the Dragon Boat Festival with you. b If I could attend any festival in the world, it would be the carnival in Rio de Janeiro.', [
          ['In which statement does the speaker believe that attending the festival is unlikely to happen?', ['b', 'a'], 'A'],
          ['In which statement does the speaker believe that attending the festival may happen?', ['a', 'b'], 'A'],
          ['Statement a is the …', ['first conditional', 'second conditional'], 'A'],
          ['Statement b is the …', ['second conditional', 'first conditional'], 'A'],
        ]),
        gap('The rules (Ex. 9)', 'Complete these rules with these words: past simple, present simple, infinitive, would.', [
          ['First conditional: If + ____, … will + ____', ['present simple', 'infinitive']],
          ['Second conditional: If + ____, … ____ + infinitive', ['past simple', 'would']],
        ]),
        gap('First or second conditional? (Ex. 10)', 'Complete the sentences with suitable verbs, using either the first or second conditional form.', [
          ['If you ____ to the festival in town tomorrow, there ____ crowds of people. You did say you were going.', ['go', 'will be|\'ll be'], 'Có khả năng → loại 1.'],
          ['If I ____ the time, I ____ to more festivals. I am just too busy with other things.', ['had', "would go|'d go"], 'Thực tế không có thời gian → loại 2.'],
          ['If I ____ the time, I ____ bake a cake for the party. I should be able to do it this evening.', ['have', "will|'ll"], 'Có khả năng → loại 1.'],
          ["If I ____ enough money, I ____ celebrate New Year in Australia. I just don't have the money at the moment.", ['had', "would|'d"], 'Giả định → loại 2.'],
          ['If he ____ this fancy dress costume this afternoon, he ____ be very hot in this summer heat.', ['wears', "will|'ll"], 'Có khả năng → loại 1.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: summaries & tables',
      titleEn: 'Lead-in · Summary completion · Completing tables · Exam skills (pp. 160–164)',
      slot: SLOT,
      minutes: 60,
      objectives: ['Nhận ra loại sự kiện qua từ khóa', 'Hoàn thành bản tóm tắt: xác định chủ đề, thông tin thiếu, loại từ', 'Hoàn thành bảng có nhiều nhóm thông tin (theo từng người nói, từng mục)'],
      theory: [
        card('Summary completion', 'Summary completion', {
          usage: ['Trước khi nghe: xác định **chủ đề**, **thông tin thiếu** và **loại từ** (noun, verb, adjective, adverb…).', 'Gạch chân **key words** trong bản tóm tắt; thông tin trong bài nghe **theo thứ tự** của bản tóm tắt.', 'Có thể nghe cả hai phương án — dựa vào **ngữ cảnh** để chọn đúng.'],
        }),
        card('Điền bảng', 'Completing tables', {
          usage: ['Bảng chia theo **nhóm rõ ràng** (người nói, mục tổ chức, chấp nhận / bác bỏ).', 'Nhìn các nhóm có chỗ trống và nghĩ xem cần **loại thông tin** gì.', 'Bài thi có thể cho viết **tối đa ba từ và/hoặc một số**.'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U08-L1', title: 'Six speakers: what kind of event? (Ex. 1)', note: 'Nối người nói với loại sự kiện.' },
        { ref: 'listening:M2-U08-L2', title: 'Preparing the arts festival (Ex. 2)', note: 'Chọn phương án đúng trong bản tóm tắt.' },
        { ref: 'listening:M2-U08-L3', title: "Dr Saunders' review of the festival (Ex. 3)", note: 'Up to TWO WORDS AND/OR A NUMBER.' },
        { ref: 'listening:M2-U08-L4', title: 'Discussion on events (Ex. 4)', note: 'Chọn phương án đúng trong ghi chú.' },
        { ref: 'listening:M2-U08-L5', title: 'Discussion on organisation (Ex. 5)', note: 'ONE WORD AND/OR A NUMBER.' },
        { ref: 'listening:M2-U08-L6', title: "Exam skills: the students' suggestions (Ex. 6)", note: 'NO MORE THAN TWO WORDS AND/OR A NUMBER.' },
      ],
      vocab: vocabFile('u08-listening', [...SCRIPTS, ...READS]),
      ex: [
        cat('Key words for each event (Ex. 1)', 'Which type of event does each group of key words suggest?', { s: 'Sports festival', f: 'Food festival', m: 'Music festival', t: 'Technology fair', p: 'Poetry and literature festival', a: 'Arts and crafts festival' }, [
          ['athletics events, champions, competition', 's'], ['dishes, produce from different parts of the world', 'f'], ['main attraction, cancel, throat infection', 'm'],
          ['products, practical applications, developments', 't'], ['talks, novelist, plotting and characterisation', 'p'], ['works on display, exhibition space, portraits', 'a'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U08-R1',
      title: 'Mindset 2 · Unit 8 — Chinese festivals',
      content: html(CHINESE),
      questionGroups: [
        qTFNG(1, 'Do the following statements agree with the information given in the texts? Write TRUE, FALSE or NOT GIVEN. (Ex. 8)', [
          ['The Dragon Boat Festival celebrates when Qu Yuan was saved by the people who stopped the fish eating him.', 'FALSE', 'Dragon Boat: "Qu Yuan **was drowned** and the people were unable to find the body" → ông không được cứu.'],
          ['When the Harbin Ice and Snow Festival first began, only the Chinese entered the competition.', 'FALSE', 'Harbin: "Initially, **the majority of** participants were Chinese" → không phải "only".'],
          ['If conditions allow, the exhibits at the Harbin Ice and Snow Festival are displayed when the official festival is over.', 'TRUE', '"exhibits often open earlier and **finish later, weather permitting**" (weather permitting = if conditions allow).'],
          ['There are a variety of things to do and see at the Lantern Festival.', 'TRUE', '"There are **several different activities** involved in this celebration… watching fireworks or solving the riddles".'],
          ['Chinese New Year is also known as the Spring Festival.', 'NOT GIVEN', 'Bài không nói tên gọi khác của Tết. BẪY: "the return of spring" nói về Lantern Festival.'],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U08-R2',
      title: 'Mindset 2 · Unit 8 — The Venice carnival',
      content: html(VENICE),
      questionGroups: [
        qTFNG(1, 'Do these statements agree with the information given in the text? Write TRUE, FALSE or NOT GIVEN. (Ex. 11)', [
          ['Before the 20th century, only the rich participated in the carnival.', 'FALSE', '"**Regardless of social status**, participants wore costumes and masks".'],
          ['The Venice carnival was banned in the 18th century.', 'NOT GIVEN', 'Bài chỉ nói "this period of festivities came to an end" — không nói bị cấm.'],
          ['The most popular days at the carnival are during the week.', 'FALSE', '"**The weekends** are the busiest times at the carnival".'],
          ['None of the festivities take place outside.', 'FALSE', '"take part in a large **open-air** festival".'],
          ['There are few places in Venice where you can purchase your costume and mask.', 'FALSE', '"**Numerous** shops in Venice sell these costumes and masks".'],
          ['In order to take part in the costume competition you need to be Italian.', 'NOT GIVEN', 'Bài có nói về cuộc thi trang phục nhưng không nói điều kiện tham gia.'],
          ["The tickets for the Valentine's Grand Masquerade Ball are worth a lot of money.", 'TRUE', '"One of the **most expensive** parties is the Valentine\'s Grand Masquerade Ball".'],
        ], 'Questions 1–7'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U08-L1', title: 'Mindset 2 · Unit 8 — What kind of event?',
      description: 'Short extracts from talks about six different events.', partNumber: 4, audioFile: 'Mindset_L2_68.mp3', transcript: T[68],
      questionGroups: [
        qMatch(1, 'Listen to these short extracts from talks and choose the type of event each speaker is talking about. (Ex. 1)', ['Music festival', 'Arts and crafts festival', 'Poetry and literature festival', 'Food festival', 'Sports festival', 'Technology fair'], [
          ['Speaker 1', 'E', lx('Người nói 1', '', 'the athletics events', 'Sports festival (Answer Key: các loại khác đã dùng cho người nói 2–6).')],
          ['Speaker 2', 'D', lx('Người nói 2', '', 'the preparation of the dishes and the display of the produce from different parts of the world')],
          ['Speaker 3', 'A', lx('Người nói 3', '', 'the main attraction, Paul Simmons, had to cancel at the last minute as he\'d been suffering from a serious throat infection')],
          ['Speaker 4', 'F', lx('Người nói 4', '', 'We saw practical applications that\'ll make significant developments in education and even business')],
          ['Speaker 5', 'C', lx('Người nói 5', '', 'The talk given by the top novelist, Henry Peters, on effective plotting and characterisation')],
          ['Speaker 6', 'B', lx('Người nói 6', '', 'we could only have one room for portraits')],
        ], { title: 'Questions 1–6', optionsTitle: 'Events', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U08-L2', title: 'Mindset 2 · Unit 8 — Preparing the arts festival',
      description: 'Dr Saunders talks about the preparations for a recent arts festival.', partNumber: 4, audioFile: 'Mindset_L2_69.mp3', transcript: T[69],
      questionGroups: [
        qMcq(1, 'Listen and choose the correct alternative in each sentence to create a summary of his talk. (You may hear both alternatives, but the context should help you make the correct choice.) (Ex. 2)', [
          ['The festival has grown in four years from having mostly music and performing arts in the first year to including other art forms, most recently …', ['painting and crafts', 'photography and films'], 'A', lx('Gần đây nhất', '', ['More forms of art, in particular short films and photography, were added over the next two years', 'this year we have extended our offer to include painting and crafts'], 'Phim và ảnh là các năm trước.')],
          ['Dr Saunders is particularly encouraged by the number of … who took part in the latest festival.', ['students', 'professional artists'], 'A', lx('Điều đáng mừng', '', 'What was particularly encouraging this year was that we had contributions to the festival from the highest number of students to date')],
          ['The festival visitors stayed at the university and at the city college, with the students helping with the … arrangements.', ['accommodation', 'catering'], 'B', lx('Sinh viên giúp gì?', '', ['We also arranged the catering both here and at the city college', 'to create the menus and work with the catering company'])],
          ["The aims of the festival include giving students the chance to get experience of organising events, mainly as …", ['paid workers', 'volunteers'], 'B', lx('Kinh nghiệm', '', "give them some experience of real work, mostly as volunteers", 'BẪY: "we had to pay for professional organisers".')],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M2-U08-L3', title: "Mindset 2 · Unit 8 — Dr Saunders' review",
      description: "Dr Saunders' review of the festival.", partNumber: 4, audioFile: 'Mindset_L2_70.mp3', transcript: T[70],
      questionGroups: [
        qNote("Listen to Dr Saunders' review of the festival and complete the sentences in the summary. Write up to TWO WORDS AND/OR A NUMBER in each gap. (Ex. 3)", 'Review of the festival', [
          'At 12,500, visitors were up by 10% on the previous year.',
          'The __Q1__ event was the most popular with many different entries and high levels of attendance.',
          'The crafts exhibition was __Q2__ despite the variety and quality of crafts on display, so it needs to be reviewed.',
          'Although there was good security present, __Q3__, which were worth about £3,000, were stolen.',
          'The extra accommodation which was supplied was of a __Q4__.',
          'A lot of money was spent on __Q5__ to work with the volunteers but they were possibly not worth the money.',
          'There needs to be more __Q6__, such as advertising and sponsorship, from local companies for the next festival.',
        ], {
          1: 'short film', 2: 'poorly attended / badly attended', 3: 'three paintings / 3 paintings',
          4: 'lower standard / low standard / poor standard / poorer standard / lower quality / poor quality', 5: 'paid helpers', 6: 'business support',
        }, {
          1: lx('Sự kiện đông nhất', '', 'The short film event at the university cinema was the best attended'),
          2: lx('Triển lãm thủ công', '', 'the exhibition was poorly attended'),
          3: lx('Bị mất cắp', '', 'three paintings were stolen'),
          4: lx('Chỗ ở thêm', '', 'some people ended up in accommodation of a lower standard'),
          5: lx('Chi nhiều tiền cho', '', 'some of the paid helpers that we brought in to supervise the activities were not really worth the expense'),
          6: lx('Cần thêm', '', 'get more business support from local companies, who could help the festival grow by sponsoring events and advertising'),
        }, 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U08-L4', title: 'Mindset 2 · Unit 8 — Discussion on events',
      description: 'Dr Reynolds, Sangita and Lawrence discuss the festival programme.', partNumber: 3, audioFile: 'Mindset_L2_71.mp3', transcript: T[71],
      questionGroups: [
        qMcq(1, 'A lecturer, Dr Reynolds, and two students, Sangita and Lawrence, are discussing the festival programme. Listen and choose the correct alternative in these notes. (Ex. 4)', [
          ['Music — Sangita: artist in reserve:', ['Student band', 'Well-known local band'], 'A', lx('Âm nhạc — Sangita', '', ['It could be a small act, like a student band', 'we could use the student band to play the last night'])],
          ['Music — Lawrence:', ['Book local band for the last night', 'Book local band every night'], 'A', lx('Âm nhạc — Lawrence', '', 'a good local band… We could put them on the last evening')],
          ['Crafts — Lawrence:', ['Show clothes, glass and pottery', 'Show only clothes'], 'B', lx('Thủ công — Lawrence', '', 'Perhaps we should just have the clothes on display, maybe even extend that section?', 'BẪY: "I don\'t think we should get rid of the glass and pottery altogether" là ý của Dr Reynolds.')],
          ['Theatre and poetry — Lawrence:', ["Have students' plays and poems", 'Have only famous plays and poems'], 'A', lx('Kịch và thơ — Lawrence', '', 'perhaps we should use at least one day to present new plays and poems by our own students')],
          ['Photography — Sangita:', ['Have only digital photographs displayed', 'Have digital and non-digital photographs displayed'], 'B', lx('Nhiếp ảnh — Sangita', '', ["I don't agree", 'Perhaps we could have two sections - digital displays and non-digital displays'], '"Only digital" là ý của Lawrence.')],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U08-L5', title: 'Mindset 2 · Unit 8 — Discussion on organisation',
      description: 'Dr Reynolds, Sangita and Lawrence discuss the practical aspects of the festival.', partNumber: 3, audioFile: 'Mindset_L2_72.mp3', transcript: T[72],
      questionGroups: [
        qTable('Listen and complete the notes with ONE WORD AND/OR A NUMBER. (Ex. 5)', ['Aspect of organisation', 'Sangita', 'Lawrence'], [
          ['Accommodation', 'Use holiday accommodation for __Q1__', 'Having young people at the festival helps the university in future.'],
          ['Catering', 'Encourage students to give their ideas and offer to use their own __Q2__ skills.', 'Agrees'],
          ['Professional help / volunteers', 'Former students would organise it better.', 'The __Q3__ did not work well as they saw the festival as just a student event.'],
          ['Security', 'Windows were open. Everyone should be more careful and take personal __Q4__ for security.', 'Nothing to add, as there were security guards around all the time.'],
          ['Finance', "It's a good idea for businesses to sponsor or advertise as long as they respect the spirit of the festival.", 'Businesses can sponsor specific events and present __Q5__.'],
        ], { 1: 'families', 2: 'cooking', 3: 'professionals', 4: 'responsibility', 5: 'prizes' }, {
          1: lx('Chỗ ở', '', 'advertising them as accommodation specifically for families with children'),
          2: lx('Ăn uống', '', 'volunteer their own cooking skills to help with it'),
          3: lx('Người tổ chức', '', ['Do you think it was a good idea to get professionals for the organising?', 'In a word, no… They were thinking it was just a student event'], 'Lawrence: những người tổ chức chuyên nghiệp (professionals) làm không tốt.'),
          4: lx('An ninh', '', "it's their personal responsibility to be careful and look out for any security issues"),
          5: lx('Tài chính', '', 'sponsor specific events, award prizes, and so on'),
        }, 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U08-L6', title: "Mindset 2 · Unit 8 — Exam skills: the students' suggestions",
      description: "Dr Reynolds tells Dr Saunders about the students' suggestions.", partNumber: 4, audioFile: 'Mindset_L2_73.mp3', transcript: T[73],
      questionGroups: [
        qNote("Dr Reynolds is telling Dr Saunders about the students' suggestions. Listen and complete the notes with NO MORE THAN TWO WORDS AND/OR A NUMBER. (Ex. 6)", 'Suggestions from the discussion on the festival', [
          'Crafts (rejected): stop pottery and glass exhibition — need to encourage all __Q1__ of art, not just the popular ones',
          'Theatre and poetry (accepted): plays and poems by students — it would help to raise __Q2__',
          'Photography (rejected): digital and non-digital exhibition — not next year because of the __Q3__',
          'Catering (accepted): encourage students to take part in cooking — helps their __Q4__',
          'Security (accepted): encourage students to be more careful — it will increase __Q5__ among students',
          'Finance (rejected): encourage students to have more events to raise money — would take their attention away from their __Q6__',
        ], { 1: 'forms / types / kinds', 2: 'standards', 3: 'high cost / cost', 4: 'development / all-round development', 5: 'trust', 6: 'studies / studying / work / academic work / course / courses' }, {
          1: lx('Thủ công — bác bỏ', '', "it's important for the university to be seen to encourage all forms of art and not just the most popular ones"),
          2: lx('Kịch, thơ — chấp nhận', '', "It'd help a lot to raise standards in writing and performance"),
          3: lx('Nhiếp ảnh — bác bỏ', '', "so it's not an option for next year because of the high cost"),
          4: lx('Ăn uống — chấp nhận', '', 'it will clearly be helpful for their all-round development'),
          5: lx('An ninh — chấp nhận', '', "it'd really help to increase trust among all our students"),
          6: lx('Tài chính — bác bỏ', '', "they'll spend less time on their studies"),
        }, 'Questions 1–6'),
      ],
    },
  ],
};
