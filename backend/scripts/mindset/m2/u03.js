// Mindset for IELTS Level 2 — Unit 3: The news and media (Reading pp. 48–53 · Listening pp. 60–64)
const { mcq, gap, match, cat, passage, card, qMcq, qMatch, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 2; // sách của lớp: Unit 3–4 → Sổ 2

const QUOTES = txt('u03-quotes');
const EXTRACTS = txt('u03-extracts');
const SMARTER = txt('u03-smarter');
const YOUNGER = txt('u03-younger');
const T = {};
for (const n of [20, 21, 22, 23, 24, 25, 26, 27, 28]) T[n] = txt('u03-t' + n);
const SCRIPTS = Object.values(T);
const READS = [QUOTES, EXTRACTS, SMARTER, YOUNGER];

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });
const PNN = ['Positive', 'Negative', 'Neutral'];

module.exports = {
  n: 3,
  title: 'The news and media',
  titleVi: 'Tin tức và truyền thông',
  pages: '48–53, 60–64',
  outcomes: [
    'Reading: matching information (đoạn nào chứa thông tin); nhận diện loại thông tin (fact, opinion, reason, cause and effect, summary…)',
    'Grammar: câu bị động (present simple / continuous / perfect, past simple passive)',
    'Listening: Section 3 — nhận ra thái độ và ý kiến của người nói; distractors trong multiple choice; nhận ra paraphrase',
    'Từ vựng tin tức, truyền thông, thái độ (Sổ 2)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: how we consume the news',
      titleEn: 'Lead-in · Opinions about the news (p. 48)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Đọc các ý kiến về cách mọi người tiếp nhận tin tức', 'Nối câu paraphrase với ý kiến tương ứng — bước đầu của matching information'],
      theory: [
        card('Matching information — khởi động', 'Matching information', {
          usage: ['Trong bài thi, bạn phải nối thông tin trong câu hỏi với thông tin trong bài — bài dài 750–950 từ và phải nối với **một đoạn**.', 'Câu hỏi **paraphrase** bài: "Continual exposure to the news is bad for us" ↔ "access… 24 hours a day… negative impact".'],
        }),
      ],
      vocab: vocabFile('u03-reading', [...READS, ...SCRIPTS]),
      ex: [
        match('Opinions about the news (Ex. 2)', 'Read the quotes, which give different opinions about how news is consumed. Match statements 1–4 with quotes A–D.', [
          ['Continual exposure to the news is bad for us.', 'A (Sarah)', '"access… 24 hours a day, 7 days a week… increasingly negative impact on society".'],
          ['As a news source, there is more confidence in television than in the internet.', 'D (Mary)', '"I wouldn\'t trust it for any serious news… I\'d only rely on television bulletins."'],
          ['Teenagers are only interested in news about actors and pop stars.', 'C (Charles)', '"The only news they might be interested in is entertainment news."'],
          ["The older generation don't know how to read the news using the internet.", 'B (Matt)', '"Adults aged 60+… they don\'t know how to access news online."'],
        ], { stimulus: stim(QUOTES, 'Quotes A–D (p. 48)') }),
      ],
    },

    reading: {
      title: 'Reading: matching information',
      titleEn: 'Matching information · Identifying different types of information · Exam skills (pp. 49–53)',
      minutes: 55,
      objectives: ['Làm matching information: đoạn nào chứa thông tin', 'Nhận ra từ đồng nghĩa giữa câu hỏi và bài', 'Gắn nhãn loại thông tin cho từng đoạn trước khi làm bài để tiết kiệm thời gian'],
      theory: [
        card('Matching information', 'Matching information', {
          formula: ['Câu hỏi: "Which paragraph contains the following information?" — ghi chữ cái của đoạn.'],
          usage: [
            'Đáp án **không theo thứ tự** của bài.', 'Đáp án **không nhất thiết là ý chính** của đoạn — có thể là một chi tiết.',
            'Một đoạn có thể chứa **nhiều đáp án** (You may use any letter more than once); có đoạn **không chứa** đáp án nào.',
            'Câu hỏi thường dùng **từ đồng nghĩa**: 66% ↔ over half; survey ↔ questionnaire; on a weekly basis ↔ often; 25% ↔ a quarter of.',
          ],
        }),
        card('Loại thông tin', 'Identifying different types of information', {
          usage: ['Mẹo tiết kiệm thời gian: **gắn nhãn** mục đích từng đoạn trước khi làm câu hỏi.', 'Các loại thường gặp: a fact, a reason, a summary, a cause, an effect, a conclusion, a description, a finding, an opinion, a reaction, an account (tường thuật sự việc).', 'Ví dụ: "The overall trend, however, is not to use just one digital device…" (bài) ↔ "the most popular way to access the news digitally is by using several methods" (câu hỏi) — cả hai đều **tóm tắt sự kiện**.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U03-R1', title: 'A smarter way to access the news? — matching information (Ex. 5)', note: '4 câu, đoạn A–D, một chữ cái có thể dùng nhiều lần.' },
        { ref: 'reading:M2-U03-R2', title: 'Exam skills: How the younger generation consumes the news (Ex. 15)', note: '6 câu matching information, đoạn A–F.' },
      ],
      ex: [
        cat('What do you notice about the answers? (Ex. 6)', 'Look at your answers to the questions in exercise 5 and decide if these statements are True or False.', { t: 'True', f: 'False' }, [
          ['The answers do not follow the same order as the text.', 't'], ['The answers may not be the main idea of the paragraph.', 't'],
          ['Some paragraphs contain more than one answer.', 't', 'Đoạn D chứa đáp án câu 3 và 4.'], ['Not all paragraphs contain an answer.', 't', 'Đoạn C không chứa đáp án nào.'],
          ['The questions will often use synonyms rather than wording from the text.', 't'],
        ]),
        match('Words in the text and in the question (Ex. 7)', 'Look again at the text "A smarter way to access the news?" and your answers to exercise 5. Match the words in the text with the words in the questions or their synonyms.', [
          ['66%', 'over half'], ['a combination of two or three', 'several methods'], ['25%', 'a quarter of'], ['survey', 'questionnaire'], ['on a weekly basis', 'often'],
        ], { stimulus: stim(SMARTER, 'A smarter way to access the news? (p. 49)') }),
        match('Types of information (Ex. 8)', 'Read extracts 1–6, taken from various news reports. Then match the extracts with a label from the box: account, cause and effect, description, opinion, reaction, summary.', [
          ['Extract 1 (tennis fans)', 'reaction', 'Phản ứng của người hâm mộ: "were left shocked".'],
          ['Extract 2 (school meals)', 'opinion', 'Ý kiến: "the government feels… Headteachers feel…".'],
          ['Extract 3 (health)', 'cause and effect', '"must be responsible… otherwise the National Health Service will no longer be able to cope" (nguyên nhân → hậu quả).'],
          ["Extract 4 (the nation's economy)", 'summary', '"Overall, last year was a very good year…" — tóm tắt.'],
          ["Extract 5 (the Queen's visit)", 'description', 'Mô tả sự kiện đón tiếp.'],
          ['Extract 6 (the robbery)', 'account', 'Tường thuật lại diễn biến vụ trộm.'],
        ], { stimulus: stim(EXTRACTS, 'Extracts 1–6 (p. 50)') }),
        mcq('Label the paragraphs (Ex. 9)', 'Skim the text "How the younger generation consumes the news" for the main ideas, then label each paragraph with ONE or more of the descriptions: cause and effect, factual, opinion, problems, reason, summary. (Paragraph A: opinion/factual.)', [
          ['Paragraph B', ['reason / factual', 'summary', 'problems'], 'A', 'Giải thích lý do giới trẻ đọc tin qua thiết bị số + số liệu Ofcom.'],
          ['Paragraph C', ['cause and effect', 'opinion', 'summary'], 'A', 'Tiêu đề tin hiện ra → bắt mắt → được bấm vào (consequently).'],
          ['Paragraph D', ['problems / factual', 'reason', 'cause and effect'], 'A', 'Hạn chế của mạng xã hội (not relied on in terms of accuracy) + sự kiện.'],
          ['Paragraph E', ['opinion', 'summary', 'problems'], 'A', 'Ý kiến của Alison Preston ("she states that…").'],
          ['Paragraph F', ['summary', 'reason', 'cause and effect'], 'A', '"Overall, it is fair to say…" — tóm tắt cả bài.'],
        ], { stimulus: stim(YOUNGER, 'How the younger generation consumes the news (p. 51)') }),
        mcq('Matching information: what have you learnt? (Ex. 14)', 'Answer these questions using what you have learnt in this lesson.', [
          ['What should you read carefully before starting a matching information task?', ['the questions and instructions', 'the title only', 'the last paragraph'], 'A'],
          ['Are you looking for matching words or synonyms?', ['synonyms', 'matching words'], 'A'],
          ['Do the answers follow the same order as the text?', ['No', 'Yes'], 'A'],
          ['Can the same letter be used more than once?', ['Yes', 'No'], 'A', 'Khi đề ghi "You may use any letter more than once".'],
          ['Do all paragraphs need to be used?', ['No', 'Yes'], 'A'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: the passive',
      titleEn: 'Grammar focus: the passive (pp. 51–52)',
      minutes: 30,
      objectives: ['Nhận ra các thì của câu bị động trong bài', 'Hiểu vì sao bản tin hay dùng bị động', 'Chuyển câu chủ động sang bị động'],
      keyLanguage: [
        'Bị động = **be** (chia theo thì) + **V3/V-ed**: social media **is used** · it **was** also **revealed** · social networks **are being used** · treasure **has been recovered**.',
        'Dùng bị động khi **người thực hiện không quan trọng** hoặc không cần nêu, và trong **văn viết trang trọng** (bản tin, báo cáo).',
      ],
      theory: [
        card('Các dạng bị động', 'The passive', {
          formula: ['present simple: am/is/are + V3', 'present continuous: am/is/are being + V3', 'present perfect: has/have been + V3', 'past simple: was/were + V3'],
          examples: [['Holidays are ruined by air strikes.', 'present simple passive'], ['The victims of the air disaster were named earlier this morning.', 'past simple passive'], ['A new medicine… is being developed in Cambridge at the moment.', 'present continuous passive']],
        }),
      ],
      links: [{ grammar: 'passive-voice', title: 'Passive Voice', note: 'câu bị động' }],
      ex: [
        match('Passive forms in the text (Ex. 10)', 'Look at extracts 1–4 from the text. Match a tense from the box with each extract.', [
          ['… social media is used for breaking news …', 'present simple passive'],
          ['… it was also revealed …', 'past simple passive'],
          ['… social networks are being used selectively …', 'present continuous passive'],
          ['… there has been growing concern by researchers …', 'present perfect passive'],
        ]),
        mcq('Why the passive? (Ex. 11)', 'Why has the writer chosen to use the passive rather than the active in these extracts?', [
          ['Choose the best explanation.', ['The passive is common in formal writing, and the agent (who does the action) is not important.', 'The passive makes the sentences shorter and more informal.', 'The writer wants to show exactly who did each action.'], 'A', 'Vd. "social media is used for breaking news" — ta không quan tâm AI dùng.'],
        ]),
        gap('Passive headlines (Ex. 12)', 'Complete headlines 1–4 with the verb in brackets in one of these passive forms: past simple, present continuous, present perfect, present simple.', [
          ['Holidays ____ (ruin) by air strikes.', 'are ruined', 'Ví dụ của sách (present simple).'],
          ["The launch of London's night tube ____ (delay) until further notice.", 'has been delayed|is delayed', 'present perfect (hoặc present simple) passive.'],
          ['The victims of the air disaster ____ (name) earlier this morning.', 'were named', '"earlier this morning" → past simple.'],
          ['A new medicine to help fight cancer ____ (develop) in Cambridge at the moment.', 'is being developed', '"at the moment" → present continuous.'],
        ]),
        gap('Active to passive (Ex. 13)', 'Read these news headlines written in the active, then change them to the passive.', [
          ['People blame all the wet weather on climate change. → Climate change ____ all the wet weather.', 'is blamed for', 'blame sth on sb/sth = blame sb/sth for sth.'],
          ['Police found the Hollywood actor unconscious in his Manhattan apartment. → The Hollywood actor ____ unconscious in his Manhattan apartment.', 'was found'],
          ['Researchers have recovered treasure from a sunken Spanish ship. → Treasure ____ from a sunken Spanish ship.', 'has been recovered'],
          ['Today, the public are celebrating a royal wedding. → A royal wedding ____ today.', 'is being celebrated'],
        ]),
      ],
    },

    listening: {
      title: "Listening: speakers' attitudes & multiple choice",
      titleEn: "Lead-in · Identifying speakers and their opinions · Understanding speakers' attitudes · Recognising paraphrases · Exam skills (pp. 60–64)",
      slot: SLOT,
      minutes: 60,
      objectives: ['Xác định chủ đề chính của cuộc thảo luận', 'Nhận ra thái độ tích cực, tiêu cực, trung lập qua ngữ điệu và cách diễn đạt', 'Phân biệt từng người nói và ý kiến của họ', 'Loại distractor và nhận ra paraphrase trong multiple choice'],
      theory: [
        card('Thái độ của người nói', "Understanding speakers' attitudes", {
          usage: ['Thái độ thể hiện qua **ngữ điệu** và **cách diễn đạt**.', '**Tích cực**: certainly, definitely, I\'m all for that, a good thing.', '**Tiêu cực**: I don\'t see how…, I can\'t seriously believe that, I really don\'t think…', '**Trung lập**: well, to be honest, I\'m not really worried · It\'s all the same to me, it shouldn\'t matter.'],
        }),
        card('Distractors trong multiple choice', 'Multiple choice: distractors', {
          usage: ['Mỗi câu có 1 đáp án đúng và 2 **distractor**: chúng nhắc tới nội dung đúng nhưng **thông tin sai**, hoặc **không trả lời câu hỏi**.', 'Ví dụ: "Pluto project is successful" → không phải Mars (A sai); "robots and machines… colony" → dự án Moon của Trung Quốc (B sai).', 'Khi kiểm tra đáp án, nghĩ xem **vì sao** distractor sai.'],
        }),
        card('Nhận ra paraphrase', 'Recognising paraphrases', {
          usage: ['Đáp án đúng thường **diễn đạt lại** ý trong bài: "isolation… no escape" ↔ "difficulty being in a closed space".', 'Phương án dùng **đúng từ** trong bài ("quiet", "hit Martin") thường là bẫy.'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U03-L1', title: 'Three discussions: the main topic (Ex. 1)', note: 'Mỗi cuộc thảo luận có thêm một chủ đề phụ.' },
        { ref: 'listening:M2-U03-L2', title: "Speakers' attitudes: modern art & climate change (Ex. 2)", note: 'Ai tích cực, ai tiêu cực, ai trung lập?' },
        { ref: 'listening:M2-U03-L3', title: 'Choosing a study topic: three space expeditions (Ex. 3–4)', note: 'Lựa chọn cuối cùng + thái độ từng người.' },
        { ref: 'listening:M2-U03-L4', title: 'Six short conversations: attitudes (Ex. 5)', note: 'Positive, negative hay neutral?' },
        { ref: 'listening:M2-U03-L5', title: 'Distractors: why Mars? (Ex. 7)', note: '1 câu — rồi xem vì sao A, B sai.' },
        { ref: 'listening:M2-U03-L6', title: 'One month later (Ex. 9)', note: '3 câu, mỗi câu 1 đáp án + 1 distractor.' },
        { ref: 'listening:M2-U03-L7', title: 'Recognising paraphrases: an example (Ex. 10)', note: 'Ví dụ trong sách.' },
        { ref: 'listening:M2-U03-L8', title: 'Paraphrases: the next part (Ex. 11)', note: '3 câu A, B, C.' },
        { ref: 'listening:M2-U03-L9', title: 'Exam skills: the final part (Ex. 12)', note: '6 câu multiple choice.' },
      ],
      vocab: vocabFile('u03-listening', [...SCRIPTS, ...READS]),
      ex: [
        cat('Expressions of attitude (Ex. 6)', 'Listen to the conversations again and write the key words and expressions which express the speaker\'s attitude. Decide whether each is positive, negative or neutral.', { p: 'Positive', n: 'Negative', u: 'Neutral' }, [
          ["I don't see how …", 'n', 'Hội thoại 1.'], ['certainly, definitely', 'p', 'Hội thoại 2.'], ["Well, (to be honest,) I'm not really worried", 'u', 'Hội thoại 3.'],
          ["I'm all for that; it's a good thing", 'p', 'Hội thoại 4.'], ["I can't seriously believe that; I really don't think …", 'n', 'Hội thoại 5.'], ["It's all the same to me; it shouldn't matter", 'u', 'Hội thoại 6.'],
        ]),
        mcq('Why are the other options wrong? (Ex. 8)', '"Dr Thornton thinks studying the Mars expedition is a good idea because … C the students will have the chance to study it until it ends." Answer these questions to find out why the other two options are not correct.', [
          ['What does Dr Thornton say is actually successful?', ['the Pluto project', 'the Mars project', 'the Chinese Moon project'], 'A', 'Cô nói dự án Pluto thành công, không nói vậy về Mars → A sai.'],
          ['Which expedition is sending robots and machines to find a suitable place for a colony?', ['a Chinese project on the Moon', 'the Mars expedition', 'the Pluto expedition'], 'A', '→ B sai.'],
          ['What time reference do you hear about the Mars project?', ['It will last six months — just the right length of time for the students.', 'It will last ten years.', 'It has already ended.'], 'A', '→ C đúng.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U03-R1',
      title: 'Mindset 2 · Unit 3 — A smarter way to access the news?',
      content: html(SMARTER),
      questionGroups: [
        qMatch(1, 'Which paragraphs (A–D) contain this information? You may write any letter more than once. (Ex. 5)', ['A', 'B', 'C', 'D'], [
          ['other ways news is accessed online', 'B', 'Đoạn B: tablets, laptops and desktops — các cách khác để đọc tin trên mạng.'],
          ['over half of smartphone users access news via their phones', 'A', 'Đoạn A: "**66%** of smartphone users are now using the device for news" (66% = over half). BẪY: đoạn C có cụm "over half of smartphone users (51%)" nhưng nói về ứng dụng BBC.'],
          ['the most popular way to access the news digitally is by using several methods', 'D', 'Đoạn D: "not to use just one digital device… but rather **a combination of two or three**" (= several methods).'],
          ['the younger generation are more likely to use their smartphone to access the news', 'D', 'Đoạn D: "This is particularly true of **those aged under 35**, with the figure rising to 41%".'],
        ], { title: 'Questions 1–4', reuse: true, type: 'matching-info' }),
      ],
    },
    {
      ref: 'M2-U03-R2',
      title: 'Mindset 2 · Unit 3 — How the younger generation consumes the news',
      content: html(YOUNGER),
      questionGroups: [
        qMatch(1, "The reading passage 'How the younger generation consumes the news' has six paragraphs, A–F. Which paragraph contains the following information? You may use any letter more than once. (Ex. 15)", ['A', 'B', 'C', 'D', 'E', 'F'], [
          ['the reasons why the younger generation seeks news', 'E', 'Đoạn E: "**motivations** for following the news… for the younger generation, news is largely about convenience and being social" (motivations = reasons).'],
          ['the opinion that news is important to the younger generation', 'A', 'Đoạn A: "85% of youngsters say that keeping up to date with the news is **important** to them".'],
          ['the percentage of older adults in the UK who access the news digitally', 'B', 'Đoạn B: "compared to just **21%** of those in the older age range".'],
          ['the idea that the younger generation largely encounters the news by chance', 'C', 'Đoạn C: "they encounter it **accidentally**" (accidentally = by chance).'],
          ['the news is of great significance to both young and old people', 'F', 'Đoạn F: "news plays an important part in all our everyday lives, **regardless of generation**".'],
          ['why the younger generation consumes the news through modern technology', 'B', 'Đoạn B: "Born into a digital age… simply accesses news through the digital devices they grew up using".'],
        ], { title: 'Questions 1–6', reuse: true, type: 'matching-info' }),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U03-L1', title: 'Mindset 2 · Unit 3 — Three discussions',
      description: 'Three short discussions, each on a particular topic.', partNumber: 3, audioFile: 'Mindset_L2_20.mp3', transcript: T[20],
      questionGroups: [
        qMcq(1, 'Listen to three short discussions. In each discussion, another topic is also referred to. Choose the main topic in each discussion. (Ex. 1)', [
          ['Discussion 1', ['sport', 'politics', 'economics'], 'B', lx('Thảo luận 1', '', ['if this government wins the election tomorrow', 'ready to vote for a change'], 'Chủ đề chính: bầu cử (politics); kinh tế chỉ được nhắc thêm.')],
          ['Discussion 2', ['business', 'science', 'entertainment'], 'C', lx('Thảo luận 2', '', ['I saw it last night… all the characters were actually well developed', "I'm going to see it tonight. I listened to the review on the radio"], 'Bàn về một bộ phim → entertainment. "science fiction" và "make as much money as possible" chỉ là chủ đề phụ (distractors).')],
          ['Discussion 3', ['technology', 'sport', 'business'], 'A', lx('Thảo luận 3', '', ['it is amazing what they can get machines to do with the right programming these days', 'those robots can detect the ball'], 'Robot và lập trình → technology. "football", "Messi" và "money-making business" chỉ là chủ đề phụ.')],
        ], 'Questions 1–3'),
      ],
    },
    {
      ref: 'M2-U03-L2', title: "Mindset 2 · Unit 3 — Speakers' attitudes",
      description: 'Three speakers on modern art and on combating climate change.', partNumber: 3, audioFile: 'Mindset_L2_21.mp3', transcript: T[21],
      questionGroups: [
        qMcq(1, 'Listen to Speakers 1–3. Identify who has the positive attitude, the negative attitude and the neutral attitude. (Ex. 2)', [
          ['Topic 1: Modern art — positive attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'C', lx('Nghệ thuật hiện đại — tích cực', '', 'Oh, I think not enough people appreciate it')],
          ['Topic 1: Modern art — negative attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'B', lx('Nghệ thuật hiện đại — tiêu cực', '', 'Well, from what I can see, you have a lot of people looking', 'Người nói 2 chê bai.')],
          ['Topic 1: Modern art — neutral attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'A', lx('Nghệ thuật hiện đại — trung lập', '', "I don't really have much of an opinion about it")],
          ['Topic 2: Combating climate change — positive attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'A', lx('Chống biến đổi khí hậu — tích cực', '', "It's so important that we tackle this issue head-on")],
          ['Topic 2: Combating climate change — negative attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'B', lx('Chống biến đổi khí hậu — tiêu cực', '', "There's so much nonsense spoken about it")],
          ['Topic 2: Combating climate change — neutral attitude', ['Speaker 1', 'Speaker 2', 'Speaker 3'], 'C', lx('Chống biến đổi khí hậu — trung lập', '', "I'm not really convinced either way, actually")],
        ], 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U03-L3', title: 'Mindset 2 · Unit 3 — Three space expeditions',
      description: 'Maria, Simon and Dr Thornton choose a study topic.', partNumber: 3, audioFile: 'Mindset_L2_22.mp3', transcript: T[22],
      questionGroups: [
        qMcq(1, 'Listen and identify their final choice, A, B or C. (Ex. 3)', [
          ['Their final choice is the', ['Moon expedition.', 'Mars expedition.', 'Pluto expedition.'], 'B', lx('Lựa chọn cuối cùng', 'Cuối đoạn.', ["I'd prefer to see how a group of people get along living together in a difficult situation, like they'll be doing in Arizona", "I agree. I'd prefer to go for that one", "So that's agreed then"], 'Dự án ở Arizona chuẩn bị cho chuyến đi sao Hỏa → Mars.')],
        ], 'Question 1'),
        qMcq(2, 'Listen to the first part of the discussion again and decide what each speaker says they prefer first for each suggestion: positive, negative or neutral. (Ex. 4)', [
          ['Simon — Pluto expedition', PNN, 'A', lx('Simon về Pluto', '', 'It should be really interesting', 'Positive.')],
          ['Simon — Mars expedition', PNN, 'C', lx('Simon về Mars', '', "It was in the news last week. They've built a sort of camp in the desert in Arizona", 'Chỉ mô tả thông tin → neutral.')],
          ['Simon — Moon expedition', PNN, 'C', lx('Simon về Moon', '', "I'd just like to mention one more. I heard that the Chinese are planning an expedition to the moon", 'Chỉ nêu thêm một lựa chọn → neutral.')],
          ['Maria — Pluto expedition', PNN, 'A', lx('Maria về Pluto', '', 'That sounds like a good idea', 'Positive.')],
          ['Maria — Mars expedition', PNN, 'A', lx('Maria về Mars', '', "Hmm ... yeah ... that sounds promising", 'Positive.')],
          ['Maria — Moon expedition', PNN, 'B', lx('Maria về Moon', '', "That's already been done. I don't think the moon's particularly interesting these days", 'Negative.')],
          ['Dr Thornton — Pluto expedition', PNN, 'B', lx('Dr Thornton về Pluto', '', "Well, I'm not so sure about that one", 'Negative.')],
          ['Dr Thornton — Mars expedition', PNN, 'A', lx('Dr Thornton về Mars', '', "That'd be ideal. Six months is just right for you", 'Positive.')],
          ['Dr Thornton — Moon expedition', PNN, 'C', lx('Dr Thornton về Moon', '', "Simon has a point. I mean, the Chinese are coming up now and they've got some new ideas", 'Không khen, không chê → neutral.')],
        ], 'Questions 2–10'),
      ],
    },
    {
      ref: 'M2-U03-L4', title: 'Mindset 2 · Unit 3 — Six short conversations',
      description: 'Six short conversations: the attitude of the second speaker.', partNumber: 3, audioFile: 'Mindset_L2_23.mp3', transcript: T[23],
      questionGroups: [
        qMcq(1, 'Listen to six short conversations and choose Positive (A), Negative (B) or Neutral (C) for each attitude expressed by the second speaker. (Ex. 5)', [
          ['Conversation 1', PNN, 'B', lx('Hội thoại 1', '', "Seriously? I really don't see how", 'I don\'t see how → negative.')],
          ['Conversation 2', PNN, 'A', lx('Hội thoại 2', '', '', 'certainly, definitely → positive.')],
          ['Conversation 3', PNN, 'C', lx('Hội thoại 3', '', '', "Well, to be honest, I'm not really worried → neutral.")],
          ['Conversation 4', PNN, 'A', lx('Hội thoại 4', '', '', "I'm all for that… a good thing → positive.")],
          ['Conversation 5', PNN, 'B', lx('Hội thoại 5', '', '', "I can't seriously believe that… I really don't think → negative.")],
          ['Conversation 6', PNN, 'C', lx('Hội thoại 6', '', '', "It's all the same to me… it shouldn't matter → neutral.")],
        ], 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U03-L5', title: 'Mindset 2 · Unit 3 — Why Mars?',
      description: 'Part of the conversation between Maria, Simon and Dr Thornton.', partNumber: 3, audioFile: 'Mindset_L2_24.mp3', transcript: T[24],
      questionGroups: [
        qMcq(1, 'Listen to part of the conversation again and choose the correct answer, A, B or C. (Ex. 7)', [
          ['Dr Thornton thinks studying the Mars expedition is a good idea because', ['she thinks the mission will be successful.', 'robots and machines will be used to start a colony there.', 'the students will have the chance to study it until it ends.'], 'C', lx('Dr Thornton cho rằng nghiên cứu dự án Mars là ý hay vì', 'Đầu đoạn.', "That'd be ideal. Six months is just right", 'Dự án kéo dài 6 tháng — vừa đủ để sinh viên theo dõi đến hết. A: chính dự án Pluto mới "successful"; B: robot và máy móc thuộc dự án Moon của Trung Quốc.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U03-L6', title: 'Mindset 2 · Unit 3 — One month later',
      description: 'Maria, Simon and Dr Thornton one month after the start of the project.', partNumber: 3, audioFile: 'Mindset_L2_25.mp3', transcript: T[25],
      questionGroups: [
        qMcq(1, 'There are two options for each question: one correct answer and one distractor. Choose the correct answer and think about why the distractor is wrong. (Ex. 9)', [
          ['Alfonso has left the Mars project because', ['he became ill while they were in Arizona.', 'he had a problem unconnected to the project.'], 'B', lx('Alfonso rời dự án vì', '', 'Apparently, his mother was taken ill, so he decided it was more important to be with her', 'Người bị ốm là MẸ của Alfonso, không phải anh ấy → một vấn đề không liên quan đến dự án. A là distractor.')],
          ['If someone leaves the Mars project, the rules say that', ['a new person must take their place.', 'no new people can join at a later date.'], 'B', lx('Nếu có người rời dự án, quy định là', '', "according to the rules of the project, no one else can come in once it's started", 'A là distractor (Simon chỉ hỏi "Are they planning to bring someone else in").')],
          ['Simon agrees that', ['only one person should look after the food production.', 'more than one person should look after the food production.'], 'B', lx('Simon đồng ý rằng', '', ['I personally think the best solution would be to share the work', 'Yeah, I agree with Dr Thornton'], 'A là ý của Maria (Carla nên đảm nhận) — Simon không đồng ý với ý đó.')],
        ], 'Questions 1–3'),
      ],
    },
    {
      ref: 'M2-U03-L7', title: 'Mindset 2 · Unit 3 — Recognising paraphrases: an example',
      description: 'The next conversation about the project.', partNumber: 3, audioFile: 'Mindset_L2_26.mp3', transcript: T[26],
      questionGroups: [
        qMcq(1, 'Listen and choose the answer, A, B or C, which correctly paraphrases the information in the recording. (Ex. 10)', [
          ['One person has most probably been physically violent because', ['they do not speak very much as a rule.', 'they might have difficulty being in a closed space.', 'they always disliked another participant.'], 'B', lx('Một người có lẽ đã có hành vi bạo lực vì', '', '', 'Ví dụ trong sách: Joe trầm tính chỉ là một nhận xét, không phải lý do (A sai). Có nói anh ấy đánh Martin nhưng không nói anh ấy luôn ghét Martin (C sai). Lý do được nêu là sự cô lập — ở trong không gian kín, không lối thoát → B.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U03-L8', title: 'Mindset 2 · Unit 3 — Paraphrases: the next part',
      description: 'The next part of the conversation about the Mars project.', partNumber: 3, audioFile: 'Mindset_L2_27.mp3', transcript: T[27],
      questionGroups: [
        qMcq(1, 'Now listen to the next part of the conversation and choose the correct answer, A, B or C. (Ex. 11)', [
          ["Dr Thornton's main interest is in", ['what kinds of people take part in projects like this.', 'how she can be a psychology expert on the project.', 'how people interact in long periods of isolation together.'], 'C', lx('Mối quan tâm chính của Dr Thornton là', 'Đầu đoạn.', 'Well, as psychology tutor, I find that really interesting', 'Cô là giảng viên tâm lý học và nói nhiều kiểu người tham gia, nhưng điều cô đặc biệt quan tâm là con người hòa hợp ra sao khi bị cô lập cùng nhau.')],
          ["Dr Thornton thinks it's good that", ['it took some time for the first serious conflict to take place.', 'problems like these happen on this type of project.', 'the project is not like a television series or soap opera.'], 'A', lx('Dr Thornton cho là điều tốt khi', '', '', 'Cô không ngạc nhiên vì có xung đột; cô đồng ý với Maria rằng đây không phải phim truyền hình, nhưng điều tích cực là dấu hiệu tức giận đầu tiên chỉ xuất hiện sau ba tháng.')],
          ['Simon states that', ['Joe could cause problems for the environment of the building if he stays.', 'Joe successfully dealt with a serious environmental situation.', 'they could solve any environmental problems if Joe left.'], 'B', lx('Simon nói rằng', '', '', 'Simon nhắc đến sự cố môi trường nhưng không phải do Joe gây ra; "giải quyết vấn đề" là nói về xung đột. Joe đã sửa được hệ thống thông gió (ventilation system).')],
        ], 'Questions 1–3'),
      ],
    },
    {
      ref: 'M2-U03-L9', title: 'Mindset 2 · Unit 3 — Exam skills: the end of the project',
      description: 'The final part of the conversation.', partNumber: 3, audioFile: 'Mindset_L2_28.mp3', transcript: T[28],
      questionGroups: [
        qMcq(1, 'Listen to the final part of the conversation and choose the correct answer, A, B or C. (Ex. 12)', [
          ['Simon is going to base his main study on', ['why just over half of the participants stayed until the end of the project.', 'how to make sure that people can survive on a real trip to Mars.', 'how much the project was covered in the news media.'], 'B', lx('Nghiên cứu chính của Simon dựa trên', 'Đầu bài.', ["I've got lots of data on the environmental systems and life support, and that's the key focus of my project report", 'in a real situation people could have been killed'], 'life support = hệ thống giúp con người sống sót. BẪY: A — chỉ có 6/10 người hoàn thành là chi tiết Maria nhắc; C — tin tức chỉ được nhắc thêm.')],
          ['One surprising result of the project was that', ['it was reported as a major news item.', 'the participants were in danger of losing their lives.', 'information from the project will be used in a new design.'], 'A', lx('Một kết quả bất ngờ của dự án là', '', "Who would've thought that it'd be on the front page and the first item on the evening bulletin?", 'Who would\'ve thought = thật bất ngờ. B sai: "they weren\'t actually in danger"; C chỉ là hy vọng của Simon.')],
          ['One thing that Dr Thornton is interested in finding out about the people in the Mars project is', ['why they had health problems.', 'how they coped physically with living close together.', 'how their physical well-being might develop in the future.'], 'C', lx('Điều Dr Thornton muốn tìm hiểu', '', "It'd be interesting to see if any of them will have any long-term health changes", 'long-term health changes = physical well-being… in the future.')],
          ['Maria intends to', ['make a contribution to an important scientific publication.', 'write about how well the participants performed while living in a small space.', 'focus only on the psychological issues affecting the participants.'], 'B', lx('Maria dự định', '', ["the main thing is the efficiency of the crew and how well they managed to perform their duties", 'living in an enclosed environment'], 'enclosed environment = a small space. A: Maria chỉ khen ý của Simon; C: cô chỉ mở rộng thêm phần tâm lý, không phải "only".')],
          ['In the end, the total spent on the Mars project was', ['just over the planned amount.', 'twice the planned amount.', 'just under the planned amount.'], 'C', lx('Tổng chi phí của dự án Mars', '', ['Everyone was expecting it to go over the original $10 million', 'the final cost was $9.5 million, so they saved half a million'], '$9.5 million < $10 million kế hoạch → just under.')],
          ['The person who would absolutely refuse to be a participant in a repeat project is', ['Simon.', 'Dr Thornton.', 'Maria.'], 'A', lx('Người chắc chắn từ chối tham gia nếu dự án lặp lại', 'Cuối bài.', "Oh, you wouldn't catch me inside one of those places!", 'Maria "wouldn\'t say no"; Dr Thornton "might even volunteer".')],
        ], 'Questions 1–6'),
      ],
    },
  ],
};
