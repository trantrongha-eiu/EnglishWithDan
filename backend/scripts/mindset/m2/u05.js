// Mindset for IELTS Level 2 — Unit 5: Business and work (Reading pp. 88–93 · Listening pp. 101–103)
const { mcq, gap, match, cat, passage, card, qMcq, qMatch, qEndings, qNote, qFill, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 3; // sách của lớp: Unit 5–6 → Sổ 3

const ENTRE = txt('u05-entrepreneurs');
const IDEAS = txt('u05-ideas');
const T = {};
for (let n = 42; n <= 47; n++) T[n] = txt('u05-t' + n);
const SCRIPTS = Object.values(T);

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });
const CI = ['Correct', 'Incorrect'];

module.exports = {
  n: 5,
  title: 'Business and work',
  titleVi: 'Kinh doanh và công việc',
  pages: '88–93, 101–103',
  outcomes: [
    'Reading: phân biệt fact, opinion, theory; matching features (nối ý kiến/sự kiện với người); matching sentence endings',
    'Grammar: will và going to',
    'Listening: Section 4 (bài giảng) — xác định ghi chú đúng/sai; điền ghi chú; nhận ra so sánh và đối lập',
    'Từ vựng kinh doanh, doanh nghiệp, thuế (Sổ 3)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: facts, opinions and theories',
      titleEn: 'Lead-in (p. 88)',
      slot: SLOT,
      minutes: 25,
      objectives: ['Phân biệt fact (sự kiện), opinion (ý kiến) và theory (giả thuyết, dự đoán của chuyên gia)'],
      theory: [
        card('Fact, opinion, theory', 'Facts, opinions and theories', {
          usage: ['**Fact**: kiểm chứng được — "The first working robot was introduced in 1961."', '**Opinion**: quan điểm cá nhân — "I don\'t believe space tourism will ever be possible."', '**Theory**: dự đoán/giả thuyết, thường của chuyên gia — "According to experts, robots will soon reach human levels of intelligence."'],
        }),
      ],
      vocab: vocabFile('u05-reading', [ENTRE, IDEAS, ...SCRIPTS]),
      ex: [
        cat('Fact, opinion or theory? (Ex. 1)', 'Read statements 1–3 and decide which category they belong to: fact, opinion or theory.', { f: 'fact', o: 'opinion', t: 'theory' }, [
          ["I don't believe space tourism will ever be possible - it is far too dangerous.", 'o', '"I don\'t believe…" → ý kiến cá nhân.'],
          ['According to experts, robots will soon reach human levels of intelligence.', 't', 'Dự đoán của chuyên gia → theory.'],
          ['The first working robot was introduced in 1961. It worked on a production line making cars for Ford.', 'f', 'Sự kiện có năm cụ thể.'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: matching features & sentence endings',
      titleEn: 'Matching features · Matching sentences · Exam skills (pp. 88–93)',
      minutes: 60,
      objectives: ['Xác định bài chủ yếu là sự kiện, ý kiến hay giả thuyết', 'Nối phát biểu với người (matching features) bằng từ đồng nghĩa', 'Nối đầu câu với cuối câu (matching sentence endings)'],
      theory: [
        card('Matching features', 'Matching features', {
          formula: ['Thứ tự: ① đọc kỹ **instructions** → ② **skim** cả bài → ③ xác định bài chủ yếu là fact/opinion/theory → ④ **scan** tìm tên người, key words và từ đồng nghĩa → ⑤ đọc câu **trước và sau** tên người → ⑥ nối.'],
          usage: ['Thường là nối với **người**, nhưng cũng có thể là nơi chốn, năm, vật.', 'Một chữ cái có thể dùng **nhiều lần**; có thể có người **không dùng** (distractor).', 'Đừng chọn tên **gần nhất** với từ khóa — đọc cả phần để chắc ý đó là của ai.', 'Dựa vào **bài đọc**, không dựa vào hiểu biết riêng.'],
        }),
        card('Matching sentence endings', 'Matching sentences', {
          usage: ['Câu hỏi đi **theo thứ tự** bài.', 'Có thể chỉ hỏi về **một phần** bài.', 'Các đuôi câu thường **giống nhau về ngữ pháp** → phải dựa vào nghĩa.', 'Tập trung vào **đầu câu**; sẽ có đuôi câu thừa.', 'Tìm **từ tương tự**, không phải từ trùng.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U05-R1', title: 'Successful entrepreneurs — matching features (Ex. 8)', note: '5 câu, nối với Carnegie, Ford, Lauder, Jobs.' },
        { ref: 'reading:M2-U05-R2', title: 'Exam skills: Business ideas of the future (Ex. 14, 23)', note: 'Matching features (người) + matching sentence endings.' },
      ],
      ex: [
        match('Key words and synonyms (Ex. 6–7)', 'Look back at the text and match key words in the statements with their synonyms in the text.', [
          ['fast', 'quickly / every 93 minutes'], ['popular', 'the masses'], ['family member', 'uncle'], ['at home', 'family garage'],
          ['first-rate', 'high-quality'], ['looking after clients', 'customer service'], ['gave … wealth away', 'donated'],
        ], { stimulus: stim(ENTRE, 'Successful entrepreneurs (p. 89)') }),
        match('Approaching matching features tasks (Ex. 9)', 'Put the steps in the correct order.', [
          ['Step 1', 'Read all the instructions carefully.'],
          ['Step 2', 'Skim read the whole passage to gain a general understanding.'],
          ['Step 3', 'Decide if the text is mainly factual, opinion-based or theoretical.'],
          ['Step 4', 'Scan both the passage and question and identify the options, key words and synonyms.'],
          ['Step 5', 'Read the sentence before and after each option in the passage and match the information to a statement.'],
          ['Step 6', 'Match a statement to a name/option.'],
        ]),
        mcq('What kind of text is it? (Ex. 5, 11)', 'Decide whether each text is mainly factual, theoretical or opinion-based.', [
          ['Successful entrepreneurs (Carnegie, Ford, Lauder, Jobs)', ['factual', 'theoretical', 'opinion-based'], 'A', 'Toàn năm, số liệu, sự kiện.'],
          ['Business ideas of the future', ['factual', 'theoretical', 'opinion-based'], 'C', 'Answer Key: chủ yếu là ý kiến/dự đoán của nhiều người (predicts, believes, feels, warns).'],
        ]),
        match('Sentence beginnings and endings (Ex. 17)', 'Complete each sentence beginning, 1–5, with the correct ending, A–E.', [
          ['Aside from the job itself,', 'the work environment is very important to an employee.'],
          ['A positive work environment makes', 'employees feel good about coming to work.'],
          ["If you're looking for a new job,", 'assessing the work environment is very important.'],
          ['Having a sense of balance between work and personal life', 'improves job satisfaction among employees.'],
          ['Employees should work in an environment', 'where they are not afraid to suggest ideas for improvement.'],
        ]),
        match('Find the paragraph, then the ending (Ex. 19–21)', 'Match each sentence beginning with its paragraph in "Business ideas of the future" and then with its ending.', [
          ['Starting a new business can be difficult (paragraph A)', 'but the rewards can be great.', 'A: "No new business start-up is without risk, but the benefits can be immeasurable."'],
          ['The first jetpack available to the public (paragraph C)', 'will not be able to travel far.', 'C: "The craft will work for short trips only".'],
          ['Animal rights activists would definitely (paragraph D)', 'support the idea of producing meat in a laboratory.', 'D: "appeals greatly to animal rights activists".'],
        ], { stimulus: stim(IDEAS, 'Business ideas of the future (p. 90)') }),
        match('Synonyms in the text (Ex. 13)', 'Scan the text "Business ideas of the future" and the statements in exercise 12. Match the key words in the statements with their synonyms in the text.', [
          ['save lives', 'search-and-rescue operations'], ['harmful', 'serious health problems'], ['controlled using technology', 'an app … will be able to handle'],
          ['fulfil a worldwide need', 'satisfy a growing global demand'], ['significant impact on an existing business', 'mean the end of traditional cattle farming'],
        ], { stimulus: stim(IDEAS, 'Business ideas of the future (p. 90)') }),
      ],
    },

    grammar: {
      title: 'Grammar focus: will and going to',
      titleEn: 'Grammar focus: future — will and going to (p. 91)',
      minutes: 25,
      objectives: ['Dùng going to cho kế hoạch đã định', 'Dùng will hoặc going to cho dự đoán', 'Dùng will cho quyết định ngay lúc nói'],
      keyLanguage: [
        '**Kế hoạch đã định** → going to: several private companies have planned tourist missions into space, which **are going to take place** in the next few years.',
        '**Dự đoán** → will hoặc going to: the space tourism industry **will be** worth $1.3 billion · space hotels **are going to be** big business.',
        '**Quyết định tức thì** → will: "Are you going to the exhibition?" — "I\'m not sure, maybe I **will**."',
      ],
      theory: [
        card('will và going to', 'Future: will and going to', {
          formula: ['S + will + V', 'S + am/is/are going to + V'],
          examples: [['In the future, robots will / are going to do many of our manual tasks.', 'Dự đoán → cả hai.'], ['The new invention is going to be revealed to the public tomorrow, according to the schedule.', 'Lịch đã định → going to.']],
        }),
      ],
      links: [{ grammar: 'future-simple', title: 'Future Simple (will)', note: 'dự đoán, quyết định tức thì' }, { grammar: 'be-going-to', title: 'Be Going To', note: 'kế hoạch đã định' }],
      ex: [
        mcq('Planned action or prediction? (Ex. 15)', 'Look at the extract about space tourism and answer the questions using will, going to, or both.', [
          ['Which future form is used to express a planned action?', ['going to', 'will', 'both'], 'A', '"have planned tourist missions into space, which are going to take place".'],
          ['Which future form is used to express a prediction?', ['both', 'going to', 'will'], 'A', '"predict that… will be worth $1.3 billion" và "predicts that space hotels are going to be big business".'],
        ]),
        gap('The correct future form (Ex. 16)', 'Complete the sentences using the correct future form. More than one answer may be possible.', [
          ['In the future, robots ____ do many of our manual tasks.', 'will|are going to', 'Dự đoán → will hoặc are going to.'],
          ['The new invention ____ to be revealed to the public tomorrow, according to the schedule given to the media.', 'is going', 'Theo lịch đã định → is going (to be revealed).'],
          ["A: Are you going to the exhibition on space travel this afternoon? B: I'm not sure, maybe I ____.", 'will', 'Quyết định chưa chắc, ngay lúc nói → will.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: lectures — notes, comparisons & contrasts',
      titleEn: 'Lead-in · Identifying correct notes · Completion tasks · Identifying comparisons and contrasts · Exam skills (pp. 101–103)',
      slot: SLOT,
      minutes: 60,
      objectives: ['Hiểu ba loại hình doanh nghiệp ở Anh: sole trader, partnership, limited liability company', 'Xác định ghi chú đúng/sai và sửa lại', 'Điền ghi chú, hoàn thành câu tóm tắt', 'Nhận ra từ nối so sánh/đối lập: however, similarly, on the other hand, on the negative side, the same is true'],
      theory: [
        card('Ghi chú trong bài giảng', 'Identifying correct notes', {
          usage: ['Nghe kỹ để **chọn đúng thông tin**: người nói thường nhắc cả thông tin đúng và thông tin dễ gây nhầm (every month ↔ once a year).', 'Câu tóm tắt **không dùng đúng từ** bạn nghe, nhưng **cùng thông tin, cùng thứ tự**.', 'Viết **đúng chính tả** — sai chính tả là mất điểm.'],
        }),
        card('So sánh và đối lập', 'Identifying comparisons and contrasts', {
          usage: ['Đối lập: **however**, **on the other hand**, **on the negative side** → sắp có ý trái ngược (thường là nhược điểm).', 'Giống nhau: **similarly**, **the same is true of…**, **as with…** → ý tương tự với điều vừa nói.', 'Nhận ra những từ này giúp bạn **đoán trước** thông tin sắp tới.'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U05-L1', title: 'Three types of business (Ex. 1)', note: 'Nối loại hình với mô tả A, B, C.' },
        { ref: 'listening:M2-U05-L2', title: 'Sole traders: correct or incorrect? (Ex. 2)', note: 'Ghi chú nào đúng, ghi chú nào sai?' },
        { ref: 'listening:M2-U05-L3', title: 'Partnerships: complete the notes (Ex. 3)', note: 'Dùng từ trong khung.' },
        { ref: 'listening:M2-U05-L4', title: 'Limited liability companies (Ex. 4)', note: 'ONE OR TWO WORDS AND/OR A NUMBER.' },
        { ref: 'listening:M2-U05-L5', title: 'Comparisons and contrasts (Ex. 5)', note: 'however, similarly, on the other hand…' },
        { ref: 'listening:M2-U05-L6', title: 'Exam skills: three case studies (Ex. 6)', note: 'TWO WORDS OR ONE WORD AND/OR A NUMBER — chú ý chính tả.' },
      ],
      vocab: vocabFile('u05-listening', [...SCRIPTS, ENTRE, IDEAS]),
      ex: [
        cat('Same or different? (Ex. 5)', 'Which words and phrases introduce a contrast and which introduce a similarity?', { c: 'Contrast', s: 'Similarity' }, [
          ['however', 'c'], ['on the other hand', 'c'], ['on the negative side', 'c'], ['similarly', 's'], ['the same is true of …', 's'], ['as with …', 's'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U05-R1',
      title: 'Mindset 2 · Unit 5 — Successful entrepreneurs',
      content: html(ENTRE),
      questionGroups: [
        qMatch(1, 'Match each statement with the correct entrepreneur, A–D. You may use any letter more than once. (Ex. 8)', ['Andrew Carnegie', 'Henry Ford', 'Estee Lauder', 'Steve Jobs'], [
          ['established a fast and economical way to produce a popular product', 'B', 'B: assembly line… "allowed cars to be produced more **quickly** and efficiently"; "afforded by **the masses**" (popular).'],
          ['started their first company with a family member', 'C', 'C: "she started her first beauty company with a skin cream developed by her **uncle**". BẪY: Jobs lập công ty với Steve Wozniak — không phải người thân.'],
          ['began by inventing products at home', 'D', 'D: "The project started in the **family garage**".'],
          ['focused on creating first-rate items and looking after clients', 'C', 'C: "producing **high-quality** products and focusing on excellent **customer service**".'],
          ['a charitable entrepreneur, who gave a great deal of wealth away', 'A', 'A: "he **donated** roughly $350 million to charities".'],
        ], { title: 'Questions 1–5', optionsTitle: 'Entrepreneurs', reuse: true, type: 'matching-info' }),
      ],
    },
    {
      ref: 'M2-U05-R2',
      title: 'Mindset 2 · Unit 5 — Business ideas of the future',
      content: html(IDEAS),
      questionGroups: [
        qMatch(1, 'Look at statements 1–5 and the list of people. Match each statement with the correct person. This person believes this new idea … (Ex. 14)', ['Jeffrey Jones', 'Daniel Kluka', 'Peter Coker', 'Peter Diamandis', 'Jason Matheny', 'Professor Post'], [
          ['could be used to save lives.', 'C', 'C: Peter Coker — "they could also be useful in **search-and-rescue** operations".'],
          ['could be harmful.', 'A', 'B: Jeffrey Jones — "warns that even a short journey into space could cause **serious health problems**". BẪY: Tracey Hayes nói "damaging" nhưng không có trong danh sách.'],
          ['is best controlled using technology.', 'B', 'F: Daniel Kluka — "software will be used to look after these multiple farms remotely… an app… will be able to handle the day-to-day care of crops".'],
          ['would fulfil a worldwide need.', 'E', 'D: Jason Matheny — "would **satisfy a growing global demand** for meat".'],
          ['could have a significant impact on an existing business.', 'F', 'D: Professor Post — "\'cultured meat\' will mean **the end of traditional cattle farming**". BẪY: Matheny ở cùng đoạn nhưng nói về nhu cầu toàn cầu.'],
        ], { title: 'Questions 1–5', optionsTitle: 'List of people', type: 'matching-info' }),
        qEndings(6, 'Complete sentences with the correct endings, A–G. There are two more endings than you need. (Ex. 23)', [
          'is currently available only to the rich.', 'the majority of the population will be living in urban areas.', 'at first are still worth following.', 'will be kept to a minimum using technology.',
          'will be possible in the future, based on the evidence of current projects.', 'is not as high as on traditional farms.', 'will not be possible in the future.',
        ], [
          ['New ideas that are not always believed in', 'C', 'A: "Inventions such as the automobile, the internet and the iPad were all initially met with a high degree of criticism, so it is important to maintain the belief that anything is possible!"'],
          ['It has been predicted that accommodation in space', 'E', 'B: "Peter Diamandis also predicts that space hotels are going to be big business, with companies from around the world **already working on such projects**". BẪY: G trái ngược.'],
          ['The invention which has been created to enable people to fly', 'A', 'C: jetpack… "cost approximately $150,000"… "used by the rich for pleasure".'],
          ['It has been predicted that in years to come', 'B', 'E: "in the future, 86% of people living in developed countries will live in cities" (urban areas).'],
          ['The price of producing food in the city', 'D', 'F: "this use of technology will help to keep costs to a minimum" → D (will be kept to a minimum using technology). BẪY: F — bài không so sánh chi phí đã thấp hơn.'],
        ], 'Questions 6–10'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U05-L1', title: 'Mindset 2 · Unit 5 — Three types of business',
      description: 'Two lecturers introduce different types of business in the UK.', partNumber: 4, audioFile: 'Mindset_L2_42.mp3', transcript: T[42],
      questionGroups: [
        qMatch(1, 'Listen to the introduction and match the type of business with the correct description, A, B or C. (Ex. 1)', [
          'personal and business finances are separate · easier to borrow money · corporation tax',
          'personal and business finances are not separate · no shares · income tax',
          'personal and business finances may be / may not be separate · members own business together · income tax',
        ], [
          ['sole trader', 'B', lx('Cá nhân kinh doanh', '', '', 'Tài chính cá nhân và doanh nghiệp không tách rời; đóng income tax.')],
          ['partnership', 'C', lx('Hợp danh', '', '', 'Các thành viên cùng sở hữu; tài chính có thể tách hoặc không (simple partnership / LLP).')],
          ['limited liability company', 'A', lx('Công ty trách nhiệm hữu hạn', '', "'Limited liability' means that, if the business fails… they only lose the money and goods which are in the business, and not their own personal money and goods", 'Tách bạch tài chính; đóng corporation tax.')],
        ], { title: 'Questions 1–3', optionsTitle: 'Descriptions', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U05-L2', title: 'Mindset 2 · Unit 5 — Sole traders',
      description: 'A lecturer talks about being a sole trader.', partNumber: 4, audioFile: 'Mindset_L2_43.mp3', transcript: T[43],
      questionGroups: [
        qMcq(1, 'Listen to the lecturer talking about the structure, advantages and disadvantages of being a sole trader. Decide which notes are correct and which are not. (Ex. 2)', [
          ['A sole trader can start a business without registering with Companies House.', CI, 'A', lx('Ghi chú A', '', "there's no need to register with Companies House", 'Correct.')],
          ['Employing other people is not possible for a sole trader.', CI, 'B', lx('Ghi chú B', '', 'You can also employ or give contracts to other people to do work for you', 'Incorrect: sole traders may employ other people.')],
          ['Sole traders must pay tax on their earnings every month.', CI, 'B', lx('Ghi chú C', '', ['your employer takes your tax from your earnings every month', 'a document which you send to the tax office once a year'], 'Incorrect: sole traders pay tax every year. "every month" là trường hợp người làm thuê (distractor).')],
          ['A sole trader might pay more tax than a company pays.', CI, 'A', lx('Ghi chú D', '', 'you pay a higher rate of income tax, which is higher than the corporation tax rates that companies pay', 'Correct.')],
          ['Lately, more people like teachers and computer programmers are becoming sole traders.', CI, 'A', lx('Ghi chú E', '', 'increasingly these days… sole traders are coming from other professions, such as computer programming and even teaching', 'Correct.')],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U05-L3', title: 'Mindset 2 · Unit 5 — Partnerships',
      description: 'A lecturer talks about partnerships.', partNumber: 4, audioFile: 'Mindset_L2_44.mp3', transcript: T[44],
      questionGroups: [
        qFill(1, 'Listen and complete the notes with the correct words or phrases from the box: accounts, borrow money, contracts, pay debts, tax. (Ex. 3)', [
          ['Partnership: easier to ______ than sole trader', 'borrow money', lx('Hợp danh: dễ ___ hơn cá nhân kinh doanh', '', 'it can be easier for a partnership to borrow money from a bank than it can for a sole trader')],
          ['If simple partnership fails, all partners may lose personal possessions to ______', 'pay debts', lx('Nếu hợp danh đơn giản thất bại…', '', 'you and your partners may lose your personal possessions to pay debts if the business fails')],
          ['LLP members must send ______ to Companies House', 'accounts', lx('Thành viên LLP phải gửi ___ cho Companies House', '', 'They have to make sure that they send accounts to Companies House')],
          ['LLP better chance of getting ______ from larger organisations', 'contracts', lx('LLP có cơ hội nhận ___ từ tổ chức lớn', '', 'larger organisations who would prefer to give contracts to a registered company or partnership')],
          ['Members of partnership may pay more ______ than owners of limited liability companies', 'tax', lx('Thành viên hợp danh có thể đóng nhiều ___ hơn', '', 'they will still pay more tax than the owner of a limited liability company')],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U05-L4', title: 'Mindset 2 · Unit 5 — Limited liability companies',
      description: 'A lecturer talks about limited liability companies.', partNumber: 4, audioFile: 'Mindset_L2_45.mp3', transcript: T[45],
      questionGroups: [
        qNote('Listen and complete the sentences. Write ONE OR TWO WORDS AND/OR A NUMBER for each answer. (Ex. 4)', 'Limited liability companies', [
          'Shareholders in a limited liability company do not lose their __Q1__ or property to pay debts because liability is limited to the business.',
          'A limited company must have a registered address where the company keeps its __Q2__ and __Q3__.',
          'The shareholders must pay __Q4__ on any money they take out of the company as a salary.',
          'For many people who think about setting up a business, it is a good idea to start as a __Q5__ and form a limited company later.',
        ], { 1: 'personal goods / goods / personal possessions', 2: 'documents / records', 3: 'records / documents', 4: 'income tax', 5: 'sole trader' }, {
          1: lx('Không mất ___ hay tài sản', '', 'the business owners lose only what they have put into the business and not their own personal goods and property'),
          2: lx('Nơi lưu giữ ___ và ___', '', 'a registered address, where all the company documents and records must be kept', 'Hai chỗ 2 và 3: documents và records, thứ tự nào cũng được.'),
          3: lx('Nơi lưu giữ ___ và ___', '', 'a registered address, where all the company documents and records must be kept', 'Hai chỗ 2 và 3: documents và records, thứ tự nào cũng được.'),
          4: lx('Phải đóng ___ trên tiền lương rút ra', '', 'you also have to pay income tax on any money you take as a salary from your company', 'BẪY: corporation tax là thuế trên lợi nhuận công ty.'),
          5: lx('Nên bắt đầu là ___', '', 'you could start as a sole trader and, if business is doing well, turn your business into a limited company at a later date'),
        }, 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U05-L5', title: 'Mindset 2 · Unit 5 — Comparisons and contrasts',
      description: 'The lecturer summarises the advantages and disadvantages of each structure.', partNumber: 4, audioFile: 'Mindset_L2_46.mp3', transcript: T[46],
      questionGroups: [
        qNote('Listen and use the words and phrases in the box to complete the notes: however, similarly, the negative side, the other hand, the same is true. (Ex. 5)', 'Disadvantages', [
          'Sole trader: On __Q1__, danger of losing personal goods and property to pay debts; may pay more tax; more difficult to get contracts',
          'Partnership: On __Q2__, it might be difficult to run the business effectively if there are serious disagreements',
          'Regarding taxes, __Q3__ of partnerships as sole traders',
          'In a simple partnership, __Q4__, members are personally responsible for business debts',
          'Limited liability company: annual return and company accounts must be sent to Companies House. __Q5__, company records must be kept at the registered address',
        ], { 1: 'the other hand', 2: 'the negative side', 3: 'the same is true', 4: 'however', 5: 'Similarly / similarly' }, {
          1: lx('Cá nhân kinh doanh — nhược điểm', '', 'On the other hand, you may end up paying more in tax than you would as a limited company'),
          2: lx('Hợp danh — nhược điểm', '', 'On the negative side, liability is shared among the partners… more complicated when there are disagreements'),
          3: lx('Về thuế', '', 'The same is true of partnerships, as members are treated individually for this purpose'),
          4: lx('Hợp danh đơn giản', '', 'In a simple partnership, however, like sole traders, the members are personally responsible for any business debts'),
          5: lx('Công ty TNHH', '', 'Similarly, there is a legal requirement to keep company records at the registered address'),
        }, 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U05-L6', title: 'Mindset 2 · Unit 5 — Exam skills: three case studies',
      description: 'The lecturer presents three case studies to illustrate each business type.', partNumber: 4, audioFile: 'Mindset_L2_47.mp3', transcript: T[47],
      questionGroups: [
        qNote('Listen to the lecturer presenting three different case studies. Complete the notes with information from the listening. Write TWO WORDS OR ONE WORD AND/OR A NUMBER in each gap. (Ex. 6)', 'Case studies', [
          'Sanjay and Tanya: plan to set up business to provide __Q1__ to __Q2__',
          'Sanjay and Tanya: better to set up a __Q3__ company if employ their own staff',
          'Melissa and Jane: intend to spend __Q4__ on __Q5__ to use in the business',
          'Melissa and Jane: limited company best as have enough __Q6__ and __Q7__ to be successful',
          'Barry: could use one of his __Q8__',
          'Barry: could set up as sole trader, or start a limited company with relative as __Q9__',
        ], {
          1: 'food', 2: 'businesses', 3: 'limited liability / limited', 4: '£10,000 / 10,000 / £10000 / 10000', 5: 'equipment',
          6: 'knowledge', 7: 'experience', 8: 'three bikes / 3 bikes / three motorbikes / 3 motorbikes / own bikes / own motorbikes / bikes', 9: 'sleeping partner / a sleeping partner',
        }, {
          1: lx('Cung cấp ___', 'Ca 1.', 'a catering service delivering food to businesses'),
          2: lx('… cho ___', 'Ca 1.', 'a catering service delivering food to businesses'),
          3: lx('Nếu tự thuê nhân viên', 'Ca 1.', 'they could set up a limited liability company if they expect to grow quickly and want to keep every aspect of their business in-house, employing staff directly', 'BẪY: LLP là lựa chọn được khuyên — nhưng câu hỏi nói về trường hợp tự thuê nhân viên.'),
          4: lx('Dự định chi ___', 'Ca 2.', "They've managed to save over £3,000 to rent office space and £10,000 to buy equipment", 'BẪY: £3,000 là tiền thuê văn phòng.'),
          5: lx('… cho ___', 'Ca 2.', '£10,000 to buy equipment'),
          6: lx('Có đủ ___', 'Ca 2.', 'they have a good level of knowledge and experience which will benefit them'),
          7: lx('… và ___', 'Ca 2.', 'a good level of knowledge and experience'),
          8: lx('Barry có thể dùng một trong những ___', 'Ca 3.', 'he has three bikes for his own use already'),
          9: lx('Mở công ty với người thân làm ___', 'Ca 3.', "This person wouldn't take an active part in the business - they would be known as a 'sleeping partner'"),
        }, 'Questions 1–9'),
      ],
    },
  ],
};
