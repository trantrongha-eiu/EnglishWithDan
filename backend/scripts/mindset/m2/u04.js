// Mindset for IELTS Level 2 — Unit 4: Travel and transport (Reading pp. 68–73 · Listening pp. 80–83)
const { mcq, gap, match, order, passage, card, qMcq, qMatch, qHeadings, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 2; // sách của lớp: Unit 3–4 → Sổ 2

const TIPS = txt('u04-tips');
const SIBERIAN = txt('u04-siberian');
const T = {};
for (let n = 30; n <= 37; n++) T[n] = txt('u04-t' + n);
const SCRIPTS = Object.values(T);

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const HEADINGS_TIPS = ['i Research the culture', 'ii Use body language', 'iii Be flexible and relax', 'iv The best time of day to be a tourist', 'v Observe daily life', 'vi Take photographs', 'vii Try to speak the language', 'viii Spend time with the locals'];
const HEADINGS_TSR = ['i The impact the railway line had on Siberia', 'ii The reasons why peasants migrated to Siberia', 'iii The construction of the line', 'iv The speed and style of the train', 'v The controversy which surrounded the building of the line', 'vi The attraction of the Trans-Siberian Railway', 'vii The role of prisoners and soldiers in the building of the project', 'viii The length of time it took to build the line', 'ix The role the line has in the local economy'];
const FUNCS = ['Expressing doubt', 'Persuading', 'Complaining', 'Proposing', 'Enquiring']; // book letters F–J

module.exports = {
  n: 4,
  title: 'Travel and transport',
  titleVi: 'Du lịch và giao thông',
  pages: '68–73, 80–83',
  outcomes: [
    'Reading: matching headings — hiểu ý chính của đoạn; nhận ra từ đồng nghĩa giữa tiêu đề và bài',
    'Grammar: present continuous, present perfect simple / continuous và past simple',
    'Listening: matching questions; nhận ra chức năng giao tiếp (proposing, persuading, complaining, doubt…)',
    'Từ vựng du lịch, giao thông đô thị (Sổ 2)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: travel',
      titleEn: 'Lead-in (p. 68)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Hiểu nghĩa các từ về du lịch: attraction, a local, custom, integrate, offend…', 'Dùng các từ này trong câu của riêng mình'],
      theory: [
        card('Chủ đề du lịch trong IELTS', 'Travel and transport', {
          usage: ['Travel and transport là chủ đề rất hay gặp. Học từ theo cụm: **meet the locals**, **face delays and cancellations**, **integrate into a society**, **offend locals**, **use body language**.'],
        }),
      ],
      vocab: vocabFile('u04-reading', [TIPS, SIBERIAN, ...SCRIPTS]),
      ex: [
        match('Travel words and definitions (Ex. 1)', 'Match the words and phrases 1–10 with definitions a–j.', [
          ['attraction', 'a place that people visit for pleasure and interest, usually while they are on holiday'],
          ['a local', 'someone who lives in the area you are talking about'],
          ['cancellation', 'the act of stopping something that was going to happen or stopping an order for something'],
          ['mother tongue', 'the first language that you learn when you are a child'],
          ['custom', 'a habit or tradition'],
          ['body language', 'the way you move your body, showing people what you are feeling'],
          ['native', 'relating to the people who lived in a country first, before other people took control of it'],
          ['integrate', 'to become part of a group or society, or to help someone do this'],
          ['offend', 'to make someone upset or angry'],
          ['focus on', 'to give all your attention to something that you are doing'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: matching headings',
      titleEn: 'Matching headings · Recognising synonyms · Useful strategies and tips · Exam skills (pp. 69–73)',
      minutes: 55,
      objectives: ['Hiểu ý chính của cả đoạn để chọn tiêu đề', 'Viết tóm tắt ngắn cho từng đoạn trước khi nối tiêu đề', 'Nhận ra từ đồng nghĩa giữa tiêu đề và bài'],
      theory: [
        card('Matching headings', 'Matching headings', {
          usage: [
            'Tiêu đề **tóm tắt ý chính** của đoạn/phần.', 'Có tiêu đề chỉ đúng với **một dòng hoặc một cụm** trong đoạn — nếu không tóm tắt **cả đoạn** thì không phải đáp án.',
            'Ví dụ đoạn A (Travel tips): "Taking photographs" và "Seeing the best attractions" chỉ khớp một chi tiết; chỉ "The best time of day to be a tourist" khớp cả đoạn.',
            'Đừng chỉ tìm **từ trùng** rồi kết luận.',
          ],
        }),
        card('Viết tóm tắt trước', 'Summarising each paragraph', {
          formula: ['① Gạch chân từ khóa và viết tóm tắt vài chữ cho mỗi đoạn → ② so sánh với bạn → ③ nối tóm tắt với tiêu đề.'],
          examples: [['A: best attractions, avoid queues, early morning… → Good to get up early.', ''], ['C: delays, cancellations, not frustrated, body language, plans to change… → Don\'t get upset if plans change.', '']],
        }),
        card('Mẹo làm matching headings', 'Useful strategies and tips', {
          usage: ['Không dùng **một tiêu đề hai lần**.', 'Theo dõi **thời gian**.', 'Đọc **đoạn ngắn nhất trước**.', 'Bỏ qua **từ không hiểu**.', 'Tiêu đề thường dùng **từ đồng nghĩa**: construction ↔ building, convicts ↔ prisoners, arguments ↔ controversy, move to a new area ↔ migrate, exports ↔ items sold abroad, impact ↔ effect.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U04-R1', title: 'Travel tips — matching headings (Ex. 3–5)', note: 'Chọn tiêu đề cho đoạn B–F (đoạn A làm mẫu).' },
        { ref: 'reading:M2-U04-R2', title: 'Exam skills: Trans-Siberian Railway (Ex. 12)', note: '6 đoạn A–F, 9 tiêu đề i–ix.' },
      ],
      ex: [
        mcq('The most suitable heading (Ex. 3–4)', 'Choose the most suitable heading for the paragraph.', [
          ['Paragraph B', ['Do not worry about making mistakes.', 'Make an effort with the language.', 'Your pronunciation is not important.'], 'B', 'Cả đoạn nói về việc cố gắng dùng ngôn ngữ địa phương (memorise phrases, practise, people who make an effort). A và C chỉ là chi tiết.'],
          ['Paragraph C', ['Delays and cancellations', 'Be relaxed if things do not go to plan', 'Use body language'], 'B', 'Đoạn nói chung về việc không bực bội khi kế hoạch thay đổi (see the funny side). Delays và body language chỉ là ví dụ.'],
        ], { stimulus: stim(TIPS, 'Travel tips (p. 69)') }),
        match('Recognising synonyms (Ex. 10)', 'Match words and phrases 1–7 with the correct synonym a–g.', [
          ['construction', 'building'], ['convicts', 'prisoners'], ['arguments', 'controversy'], ['move to a new area', 'migrate'], ['revolution', 'transformation'], ['exports', 'items sold abroad'], ['impact', 'effect'],
        ]),
        order('Useful strategies and tips (Ex. 11)', 'Put the words in the correct order.', [
          ['Do not use the same heading twice'], ['Keep track of time'], ['Read the shortest paragraph first'], ['Ignore words you do not understand'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: present perfect, past simple and more',
      titleEn: 'Grammar focus: present continuous, present perfect simple, present perfect continuous and past simple (p. 72)',
      minutes: 30,
      objectives: ['Nhận ra các thì trong bài Trans-Siberian Railway', 'Phân biệt past simple (đã xong) với present perfect simple / continuous (còn liên hệ với hiện tại)'],
      keyLanguage: [
        '**Past simple**: hành động trong quá khứ, **đã kết thúc**: From the moment building began, the project **faced** many difficulties.',
        '**Present perfect simple** (has/have + V3): bắt đầu trong quá khứ, **còn liên hệ với hiện tại**: The journey **has captured** the imagination of travellers… since 1891.',
        '**Present perfect continuous** (has/have been + V-ing): hành động **kéo dài** từ quá khứ đến nay: officials **have been building** this line since 1891.',
        '**Present continuous passive** (is being + V3): it **is** still **being expanded** today.',
      ],
      theory: [
        card('Thì quá khứ và hoàn thành', 'Past simple vs present perfect', {
          formula: ['past simple: V2/V-ed', 'present perfect: has/have + V3', 'present perfect continuous: has/have + been + V-ing'],
          examples: [["I'm so tired. I've been travelling all day.", 'Kéo dài đến bây giờ, còn mệt.'], ['Last year, I went on my first-ever cruise.', '"Last year" → past simple.'], ["I am very well travelled, I've visited many countries.", 'Kinh nghiệm tính đến nay.']],
        }),
      ],
      links: [{ grammar: 'past-simple', title: 'Past Simple', note: 'đã kết thúc' }, { grammar: 'present-perfect', title: 'Present Perfect', note: 'liên hệ với hiện tại' }, { grammar: 'present-perfect-continuous', title: 'Present Perfect Continuous', note: 'kéo dài đến nay' }],
      ex: [
        match('Tenses in the text (Ex. 7)', 'Study sentences a–c, taken from the text. What tenses are used in the sentences?', [
          ['The journey has captured the imagination of travellers from far and wide since construction began in 1891.', 'present perfect + past simple'],
          ['From the moment building began, the project faced many difficulties.', 'past simple'],
          ['Although officials have been building this line since 1891, it is still being expanded today.', 'present perfect continuous + present continuous passive'],
        ]),
        match('Tenses and their meanings (Ex. 8)', 'Match sentences a–c from exercise 7 with definitions 1–3.', [
          ['An action which took place in the past, and is now finished.', 'b From the moment building began, the project faced many difficulties.'],
          ['An action which took place in the past, and still has a connection to the present.', 'a The journey has captured the imagination of travellers…'],
          ['A continuous action which took place in the past, and still has a connection to the present.', 'c Although officials have been building this line since 1891…'],
        ]),
        gap('Which tense? (Ex. 9)', 'Complete the sentences with the verb in brackets in the correct form of either the present perfect simple, past simple or present perfect continuous.', [
          ["I'm so tired. I ____ (travel) all day.", "have been travelling|'ve been travelling|have been traveling|'ve been traveling", 'Kéo dài cả ngày đến giờ → present perfect continuous.'],
          ['I ____ (get up) early this morning to avoid the crowds.', 'got up', '"this morning" đã qua → past simple.'],
          ["I'm so annoyed that my flight ____ (cancel).", 'has been cancelled|has been canceled', 'Bị động, kết quả còn ở hiện tại.'],
          ['My back is red, I ____ (sunbathe) too much.', "have been sunbathing|'ve been sunbathing", 'Hành động kéo dài để lại dấu vết bây giờ.'],
          ["I am very well travelled, I ____ (visit) many countries.", "have visited|'ve visited", 'Kinh nghiệm đến nay → present perfect simple.'],
          ['Last year, I ____ (go) on my first-ever cruise.', 'went', '"Last year" → past simple.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: matching & functions',
      titleEn: 'Lead-in · Matching questions · Identifying different functions · Exam skills (pp. 80–83)',
      slot: SLOT,
      minutes: 60,
      objectives: ['Nhận ra vấn đề giao thông trong từng hội thoại', 'Làm matching questions: số câu và số lựa chọn có thể khác nhau', 'Nhận ra chức năng giao tiếp: proposing, persuading, complaining, enquiring, expressing doubt, correcting…'],
      theory: [
        card('Matching questions', 'Matching questions', {
          usage: ['Câu hỏi theo **thứ tự** bài nghe; đáp án là **chữ cái** của lựa chọn.', 'Số câu và số lựa chọn **không phải lúc nào cũng bằng nhau**: ít lựa chọn hơn câu → một chữ cái dùng nhiều lần; nhiều lựa chọn hơn → có lựa chọn không dùng.'],
        }),
        card('Chức năng giao tiếp', 'Identifying different functions', {
          usage: [
            '**Proposing**: Shall we take the train? · What about…?', '**Persuading**: I really think you should… · I\'m sure you\'d agree that…',
            '**Enquiring**: Excuse me, could you tell me…?', '**Expressing doubt**: Are you sure? I really don\'t think that\'s a good idea. · I\'m not sure about that.',
            '**Complaining**: I don\'t believe it! This service is getting worse and worse!', '**Correcting**: Actually, … that\'s not quite right.', '**Approving**: I think you have a good point there.',
          ],
        }),
      ],
      links: [
        { ref: 'listening:M2-U04-L1', title: 'Five conversations: problems and functions (Ex. 1–2)', note: 'Vấn đề A–E và chức năng của người nói.' },
        { ref: 'listening:M2-U04-L2', title: "The students' project: the main problem (Ex. 4)", note: 'Một câu A–D.' },
        { ref: 'listening:M2-U04-L3', title: 'The worst affected places (Ex. 5)', note: 'Nối địa điểm với vị trí — thừa một vị trí.' },
        { ref: 'listening:M2-U04-L4', title: 'Solutions and disadvantages (Ex. 6)', note: 'Nối giải pháp với nhược điểm.' },
        { ref: 'listening:M2-U04-L5', title: 'The costs (Ex. 7)', note: 'Thừa hai mức chi phí.' },
        { ref: 'listening:M2-U04-L6', title: 'The benefits (Ex. 8)', note: 'Một chữ cái có thể dùng nhiều lần.' },
        { ref: 'listening:M2-U04-L7', title: 'Identifying functions: six extracts (Ex. 9)', note: 'Thừa một chức năng.' },
        { ref: 'listening:M2-U04-L8', title: 'Exam skills: changes in Ashtown (Ex. 10)', note: '3 câu multiple choice + 5 câu matching.' },
      ],
      vocab: vocabFile('u04-listening', [...SCRIPTS, TIPS, SIBERIAN]),
      ex: [
        match('Functions in the conversations (Ex. 3)', 'Match the functions with each of these sentences from the conversations.', [
          ['Well, shall we take the train?', 'Proposing'], ['I really think you should do some more exercise.', 'Persuading'], ['Excuse me, could you tell me …?', 'Enquiring'],
          ["Are you sure? I really don't think that's a good idea.", 'Expressing doubt'], ["I don't believe it!", 'Complaining'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U04-R1',
      title: 'Mindset 2 · Unit 4 — Travel tips',
      content: html(TIPS),
      questionGroups: [
        qHeadings(1, 'Choose the correct heading for paragraphs B–F from the list of headings. Paragraph A: iv (example). (Ex. 5)', HEADINGS_TIPS, [
          ['Paragraph B', 'vii', 'Tóm tắt: nói ngôn ngữ địa phương dù có mắc lỗi (memorise useful phrases, practising the language, people who make an effort).'],
          ['Paragraph C', 'iii', 'Tóm tắt: đừng bực khi kế hoạch thay đổi ("prepared for plans to change", "see the funny side"). BẪY: ii Use body language chỉ là một chi tiết.'],
          ['Paragraph D', 'i', 'Tóm tắt: tìm hiểu về con người và phong tục trước chuyến đi ("find out about the people and customs") → research the culture.'],
          ['Paragraph E', 'viii', 'Tóm tắt: trò chuyện với người địa phương ("start conversations with locals… talking regularly with natives").'],
          ['Paragraph F', 'v', 'Tóm tắt: ngồi quan sát cuộc sống ("just watching daily life happen around you").'],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U04-R2',
      title: 'Mindset 2 · Unit 4 — Trans-Siberian Railway',
      content: html(SIBERIAN),
      questionGroups: [
        qHeadings(1, "The reading passage 'Trans-Siberian Railway' has six paragraphs, A–F. Choose the correct heading for paragraphs A–F from the list of headings. Write the correct number, i–ix. (Ex. 12)", HEADINGS_TSR, [
          ['Paragraph A', 'vi', '"described by some as the most memorable journey on Earth… has captured the imagination of travellers" → sức hấp dẫn của tuyến đường. BẪY: viii — năm 1891 chỉ là chi tiết.'],
          ['Paragraph B', 'iii', 'Cả đoạn nói về việc xây dựng (building, engineers, climate, workmen). BẪY: vii chỉ khớp câu "soldiers and convicts had to be conscripted".'],
          ['Paragraph C', 'v', '"there were **arguments** about the quality of work… Many claimed convicts had sabotaged the line" → arguments = controversy.'],
          ['Paragraph D', 'i', '"The Siberian economy exploded… Without the Trans-Siberian Railway, Siberia\'s industrial revolution would not have happened" → impact on Siberia. BẪY: ii — đoạn có nhắc 2.5 million poor people moved there nhưng không giải thích lý do.'],
          ['Paragraph E', 'iv', '"an average speed of 60 km/h… Nor are the trains particularly glamorous" → speed and style.'],
          ['Paragraph F', 'ix', '"it gets most of its use from domestic passengers… responsible for 30% of Russian exports" → vai trò trong kinh tế.'],
        ], 'Questions 1–6'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U04-L1', title: 'Mindset 2 · Unit 4 — Five conversations about transport',
      description: 'Five conversations about transport problems.', partNumber: 3, audioFile: 'Mindset_L2_30.mp3', transcript: T[30],
      questionGroups: [
        qMatch(1, 'What is the problem in each case? Listen to five conversations and choose from the list, A–E. (Ex. 1)', ['A method of travel', 'A travel plan', 'Using the bicycle or car', 'The bus service', 'The next train'], [
          ['Conversation 1', 'D', lx('Hội thoại 1', '', ["It's due in twenty minutes", 'This service is getting worse and worse!'], 'Phàn nàn về dịch vụ xe buýt.')],
          ['Conversation 2', 'E', lx('Hội thoại 2', '', "could you tell me why the 4.50 train to London hasn't arrived yet?", 'Hỏi về chuyến tàu tiếp theo.')],
          ['Conversation 3', 'B', lx('Hội thoại 3', '', ["Should we take the car?", 'shall we take the train?'], 'Bàn kế hoạch đi Bristol (travel plan).')],
          ['Conversation 4', 'C', lx('Hội thoại 4', '', ["You're not using the car, are you?", "it's a lovely day for cycling"], 'Đi xe đạp hay ô tô.')],
          ['Conversation 5', 'A', lx('Hội thoại 5', '', "I'm thinking of buying a motorbike", 'Một phương tiện đi lại (motorbike).')],
        ], { title: 'Questions 1–5', optionsTitle: 'Problems', type: 'matching' }),
        qMatch(6, 'Listen again and identify the type of function that the speakers use in each conversation. Choose from the list. (Ex. 2 — in the book the functions are F–J)', FUNCS, [
          ['Conversation 1', 'C', lx('Hội thoại 1', '', "I don't believe it! It should be every ten minutes", 'Complaining (H trong sách).')],
          ['Conversation 2', 'E', lx('Hội thoại 2', '', "Excuse me, could you tell me why…", 'Enquiring (J).')],
          ['Conversation 3', 'D', lx('Hội thoại 3', '', ['Should we take the car?', 'shall we take the train?'], 'Proposing (I).')],
          ['Conversation 4', 'B', lx('Hội thoại 4', '', 'I really think you should do some more exercise', 'Persuading (G).')],
          ['Conversation 5', 'A', lx('Hội thoại 5', '', "A bike? Are you sure? I really don't think that's a good idea", 'Expressing doubt (F).')],
        ], { title: 'Questions 6–10', optionsTitle: 'Functions', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U04-L2', title: 'Mindset 2 · Unit 4 — The main problem',
      description: 'Two students working on a university project about transport.', partNumber: 3, audioFile: 'Mindset_L2_31.mp3', transcript: T[31],
      questionGroups: [
        qMcq(1, 'You will hear two students working on a university project. They are talking about a transport problem. What is the problem? Choose from the list, A–D. (Ex. 4)', [
          ['What is the problem?', ['The number of road accidents in the town has risen.', 'There are not enough buses and they are too crowded.', 'There is too much traffic in the town centre.', 'The train service into the town has been losing money and may close.'], 'C', lx('Vấn đề là gì?', '', ["I don't think that's the main reason for the heavy traffic", "that's exactly what we have to deal with: the problem of too many vehicles coming in"], 'Xe buýt, tàu hỏa đều được nhắc nhưng không phải vấn đề chính; tai nạn thực ra đã giảm ("the road accident rate has been falling").')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U04-L3', title: 'Mindset 2 · Unit 4 — The worst affected places',
      description: 'The students discuss where the traffic is worst.', partNumber: 3, audioFile: 'Mindset_L2_32.mp3', transcript: T[32],
      questionGroups: [
        qMatch(1, 'Listen to the conversation and match each place with the correct location. There is ONE more location than you need. (Ex. 5)', ['at the junction of East Road and Station Road', 'by the main roundabout', 'at the shopping centre', 'by Central Park'], [
          ['Town Hall', 'D', lx('Tòa thị chính', 'Cuối bài.', "the town hall side of Central Park is the worst in the area", 'BẪY: shopping centre ở phía bên kia Central Park — vị trí thừa.')],
          ['Starview Cinema', 'A', lx('Rạp Starview', '', ["I thought it was by the main roundabout", "Well, in actual fact, it's by the junction of East Road and Station Road"], 'Robert nhầm, Sophie sửa lại.')],
          ['Arts Centre', 'B', lx('Trung tâm Nghệ thuật', '', "It's especially bad just by the Arts Centre where the road comes into the roundabout")],
        ], { title: 'Questions 1–3', optionsTitle: 'Locations', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U04-L4', title: 'Mindset 2 · Unit 4 — Solutions and disadvantages',
      description: 'The students discuss possible solutions and their disadvantages.', partNumber: 3, audioFile: 'Mindset_L2_33.mp3', transcript: T[33],
      questionGroups: [
        qMatch(1, 'Listen to the conversation and match the disadvantages, A–D, with the solutions, 1–4. (Ex. 6)', ['It will cause problems with deliveries for businesses.', 'It will move traffic into residential areas.', 'It will cost too much.', "People won't use it much."], [
          ['Bus and cycle-only lanes', 'B', lx('Làn xe buýt và xe đạp', '', 'car traffic tends to go off into the areas around town where people live', 'areas where people live = residential areas.')],
          ['Park and ride', 'D', lx('Gửi xe và đi xe buýt', '', 'The main problem is lack of take-up. Drivers just don\'t use them')],
          ['Pedestrian area and one-way system', 'A', lx('Khu đi bộ và đường một chiều', '', 'there would be huge problems with deliveries')],
          ['Tram transport system', 'C', lx('Tàu điện', '', 'the main problem with that kind of project is the expense')],
        ], { title: 'Questions 1–4', optionsTitle: 'Disadvantages', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U04-L5', title: 'Mindset 2 · Unit 4 — The costs',
      description: "The students' discussion about costs.", partNumber: 3, audioFile: 'Mindset_L2_34.mp3', transcript: T[34],
      questionGroups: [
        qMatch(1, 'Listen and match the costs, A–F, with the solutions, 1–4. There are TWO more costs than you need. (Ex. 7)', ['£10m', '£15m', '£20m', '£23m', '£25m', '£30m'], [
          ['Tram transport system', 'F', lx('Tàu điện', '', ['It would cost over £20 million just to prepare the route', 'No less than £30 million in the end', 'I thought it was closer to £25 million, but clearly it isn\'t'], 'Distractors: £20m (chỉ phần chuẩn bị), £25m (Robert đoán sai).')],
          ['Bus and cycle-only lanes', 'A', lx('Làn xe buýt và xe đạp', '', ["around £8 million… and at least another £2 million", "So you're saying it's around £10 million?"])],
          ['Park and ride', 'B', lx('Gửi xe và đi xe buýt', '', 'that comes to around £15 million for the park and ride in total')],
          ['Pedestrian area and one-way system', 'E', lx('Khu đi bộ và đường một chiều', '', ["So that's around £23 million", "Actually, that's £25 million, Robert"], 'BẪY: £23m là con số Robert tính sai.')],
        ], { title: 'Questions 1–4', optionsTitle: 'Costs', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U04-L6', title: 'Mindset 2 · Unit 4 — The benefits',
      description: 'The likely benefits of each proposal.', partNumber: 3, audioFile: 'Mindset_L2_35.mp3', transcript: T[35],
      questionGroups: [
        qMatch(1, 'Listen and match the proposals, A–D, with the benefits, 1–5. Letters may be used more than once. (Ex. 8)', ['Park and ride', 'Bus and cycle-only routes', 'Pedestrian area and one-way system', 'Tram transport system'], [
          ['Better public transport', 'D', lx('Giao thông công cộng tốt hơn', '', "the tram system would actually improve public transport the most", 'Bus and cycle routes có thể đẩy xe ra ngoài.')],
          ['More visitors', 'C', lx('Nhiều khách hơn', '', ["So perhaps the pedestrian area and one-way system would be best in that respect", "that's clearly the best way of bringing visitors in. So we agree on that"], 'BẪY: park and ride được đề xuất trước rồi bị đổi.')],
          ['Better health', 'B', lx('Sức khỏe tốt hơn', '', 'Creating bus and cycle-only routes would be the best way of getting people to exercise')],
          ['Less pollution and congestion', 'A', lx('Ít ô nhiễm và tắc đường', '', "OK, we'll agree on a park and ride, then")],
          ['Greater safety', 'C', lx('An toàn hơn', 'Cuối bài.', ['I\'d say the bus and cycle routes would be best', 'I really think the pedestrian area and one-way system would be safer', 'Shall we change that then?'], 'BẪY: ban đầu đồng ý bus and cycle routes, sau đó đổi.')],
        ], { title: 'Questions 1–5', optionsTitle: 'Proposals', type: 'matching', reuse: true }),
      ],
    },
    {
      ref: 'M2-U04-L7', title: 'Mindset 2 · Unit 4 — Identifying functions',
      description: "Six extracts from Sophie and Robert's conversations.", partNumber: 3, audioFile: 'Mindset_L2_36.mp3', transcript: T[36],
      questionGroups: [
        qMatch(1, 'Listen to extracts from their conversations and write the function used in each. There is one more function than you need. (Ex. 9)', ['Proposing / suggesting', 'Approving / accepting', 'Expressing doubt / reservations', 'Complaining', 'Disagreeing', 'Persuading', 'Correcting'], [
          ['Extract 1', 'E', lx('Trích đoạn 1', '', "Actually, Robert, that's not quite right", 'Answer Key: Disagreeing.')],
          ['Extract 2', 'B', lx('Trích đoạn 2', '', 'I think you have a good point there', 'Approving.')],
          ['Extract 3', 'G', lx('Trích đoạn 3', '', 'On the face of it, yes, but in actual fact it can make things worse', 'Correcting.')],
          ['Extract 4', 'A', lx('Trích đoạn 4', '', 'What about the second one, a park and ride scheme?', 'Proposing.')],
          ['Extract 5', 'F', lx('Trích đoạn 5', '', "Up to a point, yes, but I'm sure you'd agree that…", 'Persuading.')],
          ['Extract 6', 'C', lx('Trích đoạn 6', '', "I'm not sure about that. Statistics show that…", 'Expressing doubt.')],
        ], { title: 'Questions 1–6', optionsTitle: 'Functions', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U04-L8', title: 'Mindset 2 · Unit 4 — Exam skills: changes in Ashtown',
      description: 'Jane and Bill discuss the results of a survey about changes to their town.', partNumber: 3, audioFile: 'Mindset_L2_37.mp3', transcript: T[37],
      questionGroups: [
        qMcq(1, 'Listen to Jane and Bill and choose the correct answer, A, B or C. (Ex. 10)', [
          ["In Bill's opinion, why are there fewer buses in Ashtown?", ['The buses are old and uncomfortable.', 'Fares have gone up too much.', 'There are not so many routes.'], 'C', lx('Theo Bill, vì sao ít xe buýt hơn?', '', ['A lot of people think it is because fares are higher, but that isn\'t true', 'the buses now just go to the most popular destinations… there are even fewer places where buses can go'], 'A sai: xe cũ đã được thay bằng xe mới.')],
          ['What change does Bill think has benefited the town centre the most?', ['the construction of a bypass', 'the development of cycle paths', 'the banning of cars from certain areas'], 'B', lx('Thay đổi có lợi nhất cho trung tâm', '', 'The biggest success in my opinion is the building of areas for cyclists', 'Đường tránh (bypass) vẫn chưa được xây.')],
          ['Which area does Bill think most people are employed in?', ['manufacturing', 'services', 'education'], 'C', lx('Lĩnh vực nhiều người làm nhất', '', 'the number of universities and colleges that have opened… to see that is where most of the jobs are now')],
        ], 'Questions 1–3'),
        qMatch(4, 'What changes have been made to the facilities? Choose FIVE answers from the box and write the correct letter, A–G, next to facilities 4–8.', ['it has moved to a new location', 'it is now used for a different purpose', 'it uses more technology than in the past', 'it has been closed down', 'it is less popular than it used to be', 'it has been sold to a different organisation', 'it has been expanded'], [
          ['railway station car park', 'G', lx('Bãi xe nhà ga', '', 'Twenty-five years ago the car park was much smaller… most of the spaces have only been there for five years')],
          ['cinema', 'A', lx('Rạp chiếu phim', '', 'they rebuilt one exactly the same as the old one over in King Street')],
          ['indoor market', 'F', lx('Chợ trong nhà', '', 'It used to be owned by the council, but a private business bought it', 'BẪY: chợ ngoài trời mới là chợ đã đóng cửa.')],
          ['library', 'C', lx('Thư viện', '', 'since they made tablets and computers available, more people have started visiting it', 'BẪY: E — thư viện không kém phổ biến đi.')],
          ['art college', 'B', lx('Trường nghệ thuật', '', "the art college is now used as a doctor's surgery")],
        ], { title: 'Questions 4–8', optionsTitle: 'Action', type: 'matching' }),
      ],
    },
  ],
};
