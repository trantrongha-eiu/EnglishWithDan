// Mindset for IELTS Level 2 — Unit 7: Education systems (Reading pp. 128–134 · Listening pp. 139–143)
const { mcq, gap, match, cat, passage, card, qMcq, qMatch, qTable, qNote, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 4; // sách của lớp: Unit 7–8 → Sổ 4

const ABROAD = txt('u07-abroad');
const UNILIFE = txt('u07-unilife');
const CAMPUS = txt('u07-campus');
const TYPEWRITER = txt('u07-typewriter');
const COMPUTER = txt('u07-computer');
const QUALS = txt('u07-qualifications');
const T = {};
for (let n = 60; n <= 65; n++) T[n] = txt('u07-t' + n);
const SCRIPTS = Object.values(T);
const READS = [ABROAD, UNILIFE, CAMPUS, TYPEWRITER, COMPUTER, QUALS];

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });
// Diagram labelling with typed answers: 'map' group (picture + text inputs).
const diagram = (title, instruction, image, qs) => ({
  groupType: 'map', groupTitle: title, instruction, imageUrl: image,
  questions: qs.map(([n, text, ans, ex]) => ({ questionNumber: n, type: 'fill-blank', questionText: text, correctAnswer: ans, explanation: ex })),
});
const TYPES = ['Nursery', 'Primary school', 'Secondary school', 'Sixth form college', 'Further education college', 'University', 'Adult education'];

module.exports = {
  n: 7,
  title: 'Education systems',
  titleVi: 'Hệ thống giáo dục',
  pages: '128–134, 139–143',
  outcomes: [
    'Reading: hoàn thành flow-chart, bảng, sơ đồ và hình vẽ kỹ thuật; tìm đáp án nhanh; hiểu cách bài giải thích thuật ngữ',
    'Grammar: modal verbs chỉ sự bắt buộc — should, have to, must',
    'Listening: điền bảng và sơ đồ; hoàn thành câu; theo dõi hướng đi của cuộc hội thoại',
    'Từ vựng giáo dục, đại học (Sổ 4)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: university life',
      titleEn: 'Lead-in (p. 128)',
      slot: SLOT,
      minutes: 25,
      objectives: ['Hiểu các từ về đại học: lecture, enrol, fund, assignment, campus, faculty, undergraduate, postgraduate…'],
      theory: [
        card('Từ vựng đại học', 'University words', {
          usage: ['**undergraduate** (sinh viên học bằng đầu tiên) ↔ **postgraduate** (đã có bằng, học lên cao).', "**Bachelor's degree** (3–4 năm) → **Master's degree** (thêm 1–2 năm).", '**enrol on** a course · **fund** your course · **submit** an assignment · the **Faculty** of Education.'],
        }),
      ],
      vocab: vocabFile('u07-reading', [...READS, ...SCRIPTS]),
      ex: [
        match('University words (Ex. 2)', 'Read the signs displayed in a local university. Match the words in bold with the definitions 1–10.', [
          ['a formal talk given to a group of people in order to teach them about a subject', 'lecture'],
          ['to become or make someone become an official member of a course, college or group', 'enrol'],
          ['to provide money for an event, activity or organisation', 'fund'],
          ['a piece of work or job that you are given to do', 'assignment'],
          ['the land and buildings belonging to a college or university', 'campus'],
          ['a particular department at a college or university, or the teachers in that department', 'faculty'],
          ['a higher university qualification that usually takes one or two more years of study after your first degree', "Master's degree"],
          ['a student who is studying for their first university degree', 'undergraduate'],
          ['a university degree that is given after a course of study that usually takes three or four years', "Bachelor's degree"],
          ['a student who has one degree and is now studying at a university for a more advanced degree', 'postgraduate'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: flow-charts, tables & diagrams',
      titleEn: 'Completing flow-charts · Charts and diagrams · Locating the answer quickly · Understanding explanations · Exam skills (pp. 129–134)',
      minutes: 65,
      objectives: ['Đọc tiêu đề và các mục của flow-chart để đoán thông tin cần điền', 'Xác định loại từ thiếu (noun, adverb, adjective…)', 'Tìm đáp án nhanh trên sơ đồ nhờ từ chỉ vị trí (behind, next to, in front of)', 'Nhận ra thuật ngữ được giải thích bằng footnote, ngay trong bài hoặc qua ngữ cảnh'],
      theory: [
        card('Flow-chart, bảng và sơ đồ', 'Completing flow-charts and diagrams', {
          usage: ['Đọc **tiêu đề** và các **mục chính** trước để biết sơ đồ nói về gì.', 'Không cần hiểu hết từ — tập trung vào **key words**.', 'Đoán **loại từ** còn thiếu; đáp án thường **theo thứ tự** bài.', 'Điền xong kiểm tra: câu có **đúng ngữ pháp** và sơ đồ có **hợp lý** không? Từ có gạch nối tính là **một từ**.'],
        }),
        card('Tìm đáp án nhanh', 'Locating the answer quickly', {
          usage: ['Đáp án thường chỉ nằm ở **một phần** bài (vd. hai đoạn cuối).', 'Dùng tên địa điểm đã có trên sơ đồ và **giới từ vị trí** (next to, behind, in front of) để định vị.', 'Chép **đúng chính tả** thuật ngữ kỹ thuật.'],
        }),
        card('Cách giải thích thuật ngữ', 'Understanding explanations', {
          usage: ['**Footnote**: lever*, microchip* — giải thích ở cuối.', '**Ngay trong bài**: "a piece of cloth with ink on it called the ribbon"; "a hard drive (a huge magnetic memory)".', '**Qua ngữ cảnh**: carriage return lever — hiểu nhờ câu xung quanh nói nó làm gì.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U07-R1', title: 'University life — complete the timetable (Ex. 7)', note: 'NO MORE THAN TWO WORDS AND/OR A NUMBER.' },
        { ref: 'reading:M2-U07-R2', title: 'The university campus — label the diagram (Ex. 13)', note: 'Tìm nhanh bằng giới từ vị trí.' },
        { ref: 'reading:M2-U07-R3', title: 'The typewriter — technical drawing (Ex. 15)', note: 'NO MORE THAN TWO WORDS — chép đúng chính tả.' },
        { ref: 'reading:M2-U07-R4', title: 'How the modern computer works (Ex. 18)', note: 'Hoàn thành sơ đồ.' },
        { ref: 'reading:M2-U07-R5', title: 'Exam skills: Australian university qualifications (Ex. 19)', note: '4 chỗ trống trên sơ đồ.' },
      ],
      ex: [
        mcq('Study the flow-chart (Ex. 3)', 'Look at the flow-chart "Applying to study at university in Australia (for international students)", ignoring the gaps for the moment. Answer the questions. (1: Once you have chosen, you can apply ___ to the university for a place. 2: Once you have confirmation of ___ 3: and adequate ___ for the first year… 4: especially for ___ students.)', [
          ['What does the title suggest the chart is about?', ['how to apply to an Australian university as an international student', 'how to find a job in Australia', 'the history of Australian universities'], 'A'],
          ['What type of word is missing in gap 1 (apply ___ to the university)?', ['adverb', 'noun', 'adjective'], 'A', 'Bổ nghĩa cho động từ apply → trạng từ.'],
          ['What type of word is missing in gap 2 (confirmation of ___)?', ['noun', 'verb', 'adverb'], 'A', 'Sau giới từ of → danh từ.'],
          ['What type of word is missing in gap 3 (adequate ___)?', ['noun', 'adverb', 'verb'], 'A', 'Sau tính từ adequate → danh từ.'],
          ['What type of word is missing in gap 4 (for ___ students)?', ['adjective', 'adverb', 'verb'], 'A', 'Trước danh từ students → tính từ.'],
        ]),
        gap('Complete the flow-chart (Ex. 4)', 'Read the short text and then complete the flow-chart using ONE WORD ONLY from the text.', [
          ['Step 1 – Choose a university and enrol: Once you have chosen, you can apply ____ to the university for a place.', 'directly', '"you can contact the university **directly** in order to apply".'],
          ['Step 2 – Apply for a student visa: Once you have confirmation of ____ and adequate ____ for the first year, you can apply for your visa.', ['admission', 'funds'], '"you will need proof of **admission**… enough **funds** for the first year".'],
          ['Step 3 – Book your flight and accommodation: each university has an accommodation team that can help you find a place, especially for ____ students.', 'new', '"preferential treatment is given for **new** students from abroad".'],
        ], { stimulus: stim(ABROAD, 'Studying abroad (p. 129)') }),
        mcq('University signs (Ex. 11)', 'Study these university signs. Which sentence in each pair is most likely to be correct and why?', [
          ['1a YOU MUST NOT EAT IN CLASSROOMS. / 1b YOU DON\'T HAVE TO EAT IN CLASSROOMS.', ['1a — it expresses a rule, something which is not allowed', '1b — eating is optional'], 'A'],
          ["2a YOU DON'T HAVE TO CHEAT IN THE EXAM. / 2b YOU MUST NOT CHEAT IN THE EXAM.", ['2b — it expresses a rule, something which is not allowed', '2a — cheating is optional'], 'A'],
          ["3a You don't have to return your library book to the reception desk – you can also use the boxes provided. / 3b You must not return your library book to the reception desk – you can also use the boxes provided.", ['3a — it expresses an idea which is optional', '3b — returning books to reception is not allowed'], 'A', '"you can also use the boxes" → có lựa chọn → don\'t have to.'],
        ]),
        cat('How were the words explained? (Ex. 16–17)', 'How were these words explained in the texts: by footnote, an explanation in the text, or an explanation given by the surrounding context?', { f: 'footnote', t: 'explanation in the text', c: 'surrounding context' }, [
          ['lever', 'f'], ['ribbon', 't', '"a piece of cloth with ink on it called the ribbon".'], ['carriage return lever', 'c'],
          ['hard drive', 't', '"a hard drive (a huge magnetic memory)".'], ['flash memory cards', 't', '"other kinds of storage, such as flash memory cards".'],
          ['high-resolution', 'c', '"such as very clear and detailed photographs".'], ['microchip', 'f'],
        ], { stimulus: stim(COMPUTER, 'How the modern computer works (p. 133)') }),
      ],
    },

    grammar: {
      title: 'Grammar focus: should, have to and must',
      titleEn: 'Grammar focus: modal verbs of obligation (pp. 130–131)',
      minutes: 30,
      objectives: ['Phân biệt lời khuyên (should) với sự bắt buộc (have to, must)', "Phân biệt mustn't (không được phép) với don't have to (không bắt buộc)", 'Dạng phủ định và quá khứ'],
      keyLanguage: [
        '**should** = lời khuyên: you **should** choose something you will enjoy.',
        '**have to** = bắt buộc (quy định từ bên ngoài): I **have to** attend three lectures a week. · **must** = bắt buộc mạnh: you **must** have a great deal of self-discipline.',
        "**mustn't** = không được phép: You **mustn't** cheat in exams. · **don't have to** = không bắt buộc: You **don't have to** study tonight.",
        'Quá khứ: have to / must → **had to**; should → **should have + V3**.',
      ],
      theory: [
        card('Modal verbs of obligation', 'Should, have to and must', {
          formula: ['should / ought to + V — lời khuyên', 'have to / must + V — bắt buộc', "mustn't + V — cấm · don't have to / needn't + V — không cần"],
          examples: [['I must study harder.', 'bắt buộc mạnh'], ["I don't have to go to school today.", 'không bắt buộc'], ['You should revise for your exams this weekend.', 'lời khuyên'], ["You mustn't be late for lessons.", 'cấm']],
        }),
      ],
      links: [{ grammar: 'modal-verbs', title: 'Modal Verbs', note: 'should, have to, must' }],
      ex: [
        mcq('Advice or obligation? (Ex. 8)', 'Look at phrases a–c taken from the text: a I have to attend three lectures a week · b you must have a great deal of self-discipline · c you should choose something you will enjoy.', [
          ['Which of these statements expresses advice?', ['c', 'a', 'b'], 'A'],
          ['Which two of these statements express an obligation?', ['a and b', 'a and c', 'b and c'], 'A'],
          ['Which of these statements expresses a strong obligation?', ['b', 'a', 'c'], 'A'],
          ['What is the past tense of "I have to attend"?', ['I had to attend', 'I have had attend', 'I must attended'], 'A'],
          ['What is the past tense of "you should choose something you will enjoy"?', ['You should have chosen something you would enjoy.', 'You should chose something you would enjoy.', 'You had should choose something.'], 'A'],
        ]),
        gap('Strength of obligation (Ex. 10)', 'Complete the sentences to show strength of obligation. More than one answer is possible.', [
          ['I ____ study harder. (strong obligation)', 'must|have to'],
          ['I ____ go to school today. (no obligation)', "don't have to|do not have to|needn't|need not"],
          ['You ____ revise for your exams this weekend. (advice)', 'should|ought to'],
          ['You ____ be late for lessons. (strong negative obligation)', "mustn't|must not"],
        ]),
      ],
    },

    listening: {
      title: 'Listening: charts, diagrams & conversations',
      titleEn: 'Lead-in · Charts and diagrams · Completing sentences · Following conversations · Exam skills (pp. 139–143)',
      slot: SLOT,
      minutes: 60,
      objectives: ['Hiểu các cấp học ở Anh: nursery, primary, secondary, sixth form, further education, university, adult education', 'Hoàn thành bảng và sơ đồ có mũi tên', 'Chọn đúng từ trong câu khi nghe', 'Theo dõi hướng đi của cuộc hội thoại để chọn ghi chú đúng'],
      images: ['media:m2u07-post16.jpg|Ex. 4 (p. 141): choices at 16'],
      theory: [
        card('Bảng và sơ đồ', 'Charts and diagrams', {
          usage: ['Nhìn kỹ bảng/sơ đồ và nghĩ xem cần **loại thông tin** gì.', 'Trong bảng hệ thống giáo dục, **độ tuổi** là gợi ý giúp chọn đúng (5–7: infant; 7–11: junior).', 'Sơ đồ có **mũi tên** → dùng mũi tên để đoán thứ tự thông tin sẽ nghe.'],
        }),
        card('Theo dõi hội thoại', 'Following conversations', {
          usage: ['Người nói hay nói một ý rồi **điều chỉnh**: "you might have three weeks between tutorials… So that works out at about one every two weeks."', 'Nghe đến hết ý trước khi chọn; để ý các từ **minimum / maximum / at least / no upper limit**.'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U07-L1', title: 'Seven conversations: types of education (Ex. 1–2)', note: 'Ghi số hội thoại và thông tin A–G cho từng cấp học.' },
        { ref: 'listening:M2-U07-L2', title: 'The education system up to 16 (Ex. 3)', note: 'Chọn đáp án đúng trong bảng.' },
        { ref: 'listening:M2-U07-L3', title: 'Choices at 16 — complete the diagram (Ex. 4)', note: 'ONE OR TWO WORDS.' },
        { ref: 'listening:M2-U07-L4', title: 'Applying to university (Ex. 5)', note: 'Chọn từ đúng trong mỗi câu.' },
        { ref: 'listening:M2-U07-L5', title: 'Following a conversation: a new student (Ex. 6)', note: 'Chọn ghi chú a hay b.' },
        { ref: 'listening:M2-U07-L6', title: 'Exam skills: after graduation (Ex. 7)', note: 'NO MORE THAN TWO WORDS.' },
      ],
      vocab: vocabFile('u07-listening', [...SCRIPTS, ...READS]),
      ex: [
        cat('Which stage of education? (Ex. 1)', 'Which type of education is each of these about?', { early: 'Nursery / primary school', school: 'Secondary school / sixth form', after: 'Further / higher / adult education' }, [
          ['Children usually start in an early class called "Reception".', 'early'], ['Children learn to read and write in infant school.', 'early'],
          ['Students go to different classrooms for different subjects.', 'school'], ['Students prepare for A levels for two years.', 'school'],
          ['A vocational course prepares students for work in a profession.', 'after'], ['Students live away from home for the first time.', 'after'], ['Cheap evening and weekend courses.', 'after'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U07-R1',
      title: 'Mindset 2 · Unit 7 — University life',
      content: html(UNILIFE),
      questionGroups: [
        qTable('Complete the gaps in the chart. Write NO MORE THAN TWO WORDS AND/OR A NUMBER. (Ex. 7)',
          ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          [
            ['9.00–12.00', '__Q1__', '', '__Q3__', '', 'Lecture'],
            ['12.00–15.00', '', '', '', '', ''],
            ['15.00–18.00', 'Private study', '__Q2__', 'Tutorial', 'Private study', '__Q5__'],
            ['18.00–21.00', '', 'Cinema club', '', '__Q4__', ''],
          ],
          { 1: 'lecture / lectures', 2: 'private study', 3: 'lecture / lectures', 4: 'football training / football', 5: 'tutorial / tutorials' }, {
            1: '"I have to attend three **lectures** a week, all in the morning" → 3 buổi sáng: thứ Hai, thứ Tư, thứ Sáu.',
            2: '"In the afternoons, I use my time for **private study**… unless I have a scheduled tutorial".',
            3: 'Buổi **lecture** thứ ba trong tuần ("three lectures a week, all in the morning").',
            4: '"Towards the end of the week, I have **football training** in the evening".',
            5: '"I attend **tutorials** weekly, one in the middle and one at the end of the week" → thứ Tư và thứ Sáu.',
          }, 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U07-R2',
      title: 'Mindset 2 · Unit 7 — The university campus',
      content: html(CAMPUS),
      questionGroups: [diagram('Questions 1–4', 'Complete the gaps in the diagram using NO MORE THAN TWO WORDS AND/OR A NUMBER. Try to locate the answers as quickly as possible. (Ex. 13)', 'media:m2u07-campus.jpg', [
        [1, 'Label 1 (between student services and residential services)', 'library / university library', '"the university **library**, situated next to residential services and just behind the finance office".'],
        [2, 'Label 2 (next to the students\' union)', 'gym', '"either to the **gym** or the students\' union… both are close by, near student services".'],
        [3, 'Label 3 (behind the medical centre)', 'careers centre / careers center', '"the **careers centre**, which is just behind the medical centre".'],
        [4, 'Label 4 (in front of the finance office)', 'reception / main reception', '"the main **reception**, in front of the finance office".'],
      ])],
    },
    {
      ref: 'M2-U07-R3',
      title: 'Mindset 2 · Unit 7 — The typewriter',
      content: html(TYPEWRITER),
      questionGroups: [diagram('Questions 1–4', 'Study the diagram, then read the text. Write NO MORE THAN TWO WORDS from the text for each answer. (1 Key and 6 Carriage return lever are given.) (Ex. 15)', 'media:m2u07-typewriter.jpg', [
        [1, 'Label 2', 'lever', '"press down on one of the keys and the **lever*** makes another lever… move up" — nối với phím.'],
        [2, 'Label 3', 'type hammer', '"another lever called the **type hammer** move up towards the paper".'],
        [3, 'Label 4', 'ribbon', '"a piece of cloth with ink on it called the **ribbon** moves upwards between the type and the paper".'],
        [4, 'Label 5', 'carriage', '"the **carriage**, which is the cylinder-shaped part at the top where the paper is held".'],
      ])],
    },
    {
      ref: 'M2-U07-R4',
      title: 'Mindset 2 · Unit 7 — How the modern computer works',
      content: html(COMPUTER),
      questionGroups: [diagram('Questions 1–3', 'Using your understanding of the text, complete this diagram. Write NO MORE THAN TWO WORDS from the text for each answer. (Ex. 18)', 'media:m2u07-computer.jpg', [
        [1, 'Label 1 (storage)', 'hard drive', '"Most computers store all this information on a **hard drive**".'],
        [2, 'Label 2 (keyboard and mouse)', 'input / input units', '"The mouse and keyboard are **input** units".'],
        [3, 'Label 3 (output)', 'LCD screen / LCD screens', '"Many computers now have **LCD screens**".'],
      ])],
    },
    {
      ref: 'M2-U07-R5',
      title: 'Mindset 2 · Unit 7 — Common Australian university qualifications',
      content: html(QUALS),
      questionGroups: [diagram('Questions 1–4', 'Read the text and complete the diagram using NO MORE THAN TWO WORDS AND/OR A NUMBER. (Ex. 19)', 'media:m2u07-qualifications.jpg', [
        [1, 'Undergraduate: Bachelor Degree 1 ___ (4 years)', 'professional', '"**Professional** degrees such as engineering or law are completed over four years".'],
        [2, 'Undergraduate: Bachelor Degree with 2 ___ (Bachelor Degree + 1 year)', 'honours / honors', '"A bachelor degree with \'**honours**\' is usually achieved by doing an extra year of study".'],
        [3, 'Postgraduate: Master Degree 3 ___ (1 year)', 'full-time / full time', '"Masters courses are typically one year in duration for **full-time** study (or two years when completed part-time)".'],
        [4, 'Postgraduate: 4 ___ (3–4 years)', 'doctoral degree / doctorate', '"A **doctoral degree**… Generally this degree will last three to four years". BẪY: MBA chỉ 1–2 năm.'],
      ])],
    },
  ],

  sections: [
    {
      ref: 'M2-U07-L1', title: 'Mindset 2 · Unit 7 — Types of education',
      description: 'Seven short conversations about education in the UK.', partNumber: 1, audioFile: 'Mindset_L2_60.mp3', transcript: T[60],
      questionGroups: [
        qMatch(1, 'Listen to seven short conversations. Which conversation is mainly about each type of education? (Ex. 1)', ['Conversation 1', 'Conversation 2', 'Conversation 3', 'Conversation 4', 'Conversation 5', 'Conversation 6', 'Conversation 7'], [
          ['Nursery', 'D', lx('Mẫu giáo', 'Hội thoại 4.', ['it\'s really useful for them to start early', 'when they start school', "I can't get a free place for my son"])],
          ['Primary school', 'B', lx('Tiểu học', 'Hội thoại 2.', ["It's always difficult when they start school", "it's the law - she has to go!"])],
          ['Secondary school', 'F', lx('Trung học', 'Hội thoại 6.', "it's not like his last school, when he did everything in the same class. He has to make sure he knows his timetable and gets to the right classroom")],
          ['Sixth form college', 'G', lx('Cao đẳng dự bị (16–18)', 'Hội thoại 7.', ['My son passed all his GCSE exams and wants to go to university in two years\' time', 'that new college'])],
          ['Further education college', 'A', lx('Cao đẳng nghề / bổ túc', 'Hội thoại 1.', ["I can take my exams again at the local college", "Maybe I'll take a vocational course there instead"])],
          ['University', 'E', lx('Đại học', 'Hội thoại 5.', 'my daughter is off tomorrow to start her degree course - a whole new adventure in a new city')],
          ['Adult education', 'C', lx('Giáo dục người lớn', 'Hội thoại 3.', ["this evening course in photography… only costs £150 for the term", 'to be learning something new again after so many years'])],
        ], { title: 'Questions 1–7', optionsTitle: 'Conversations', type: 'matching' }),
        qMatch(8, 'Read the information A–G about different educational institutions in the UK. Listen again and choose the correct information for each type of education. (Ex. 2)', [
          'This is usually the first time students become completely independent. It\'s normal in the UK for these students to study in places a long way from their homes.',
          'You can take courses in all kinds of subjects, usually after work or at the weekend. The courses are usually quite cheap.',
          'The purpose of a vocational course is to prepare students for work in a certain profession, like hairdressing or car mechanics.',
          'Students no longer study in one classroom, but have to go to different classrooms depending on the subjects that they are studying.',
          'Parents can choose to send their children here. Many places are free, but parents often have to pay.',
          'When children are required to start full-time education, the majority of them go to this institution.',
          'Although students can prepare to pass exams for university entry at their schools, they can also choose to go to this special institution for two years.',
        ], TYPES.map((t, i) => [t, 'EFDGCAB'[i], lx(t, '', '', ['Không bắt buộc, có chỗ miễn phí nhưng thường phải trả tiền (E).', 'Bắt buộc theo luật — đa số trẻ đi học ở đây (F).', 'Học ở nhiều phòng theo môn (D).', 'Học 2 năm để thi vào đại học (G).', 'Khóa học nghề (C).', 'Lần đầu tự lập, học xa nhà (A).', 'Khóa học buổi tối, giá rẻ (B).'][i])]), { title: 'Questions 8–14', optionsTitle: 'Information', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U07-L2', title: 'Mindset 2 · Unit 7 — The education system up to 16',
      description: 'A lecturer talks about the education system in England and Wales up to the age of 16.', partNumber: 4, audioFile: 'Mindset_L2_61.mp3', transcript: T[61],
      questionGroups: [
        qMcq(1, 'The lecturer is talking about the education system in England and Wales up until the age of 16. Listen and choose the correct answers in the table. (Ex. 3)', [
          ['Key stage 0 (age 4/5) — school: Nursery or Reception?', ['Nursery', 'Reception'], 'B', lx('Giai đoạn 0', '', "when they reach the age of four, they usually start school in an early class called 'Reception'")],
          ['Key stage 1 (age 5–7) — Primary: Infant or Junior?', ['Infant', 'Junior'], 'A', lx('Giai đoạn 1', '', "The first part of primary school, between the ages of five and seven, is traditionally known as 'infant school'")],
          ['Key stage 2 (age 7–11) — Primary: Infant or Junior?', ['Infant', 'Junior'], 'B', lx('Giai đoạn 2', '', "The second part of primary school, from seven to 11, is known as 'junior school'")],
          ['Key stage 2 — assessments: Standard Assessment Tests or Teacher Assessments?', ['Standard Assessment Tests', 'Teacher Assessments'], 'A', lx('Đánh giá giai đoạn 2', '', 'at the end of Key Stage 2, unlike in Key Stage 1, pupils have to take SATS')],
          ['Key stage 3 (age 11–14) — assessments: Standard Assessment Tests or Teacher Assessments?', ['Standard Assessment Tests', 'Teacher Assessments'], 'B', lx('Đánh giá giai đoạn 3', '', 'this time, the students are assessed directly by the teachers and not by sitting national tests')],
          ['Key stage 4 (age 14–16) — assessments: Standard Assessment Tests or General Certificates of Secondary Education?', ['Standard Assessment Tests', 'General Certificates of Secondary Education'], 'B', lx('Đánh giá giai đoạn 4', '', "these assessments, known as 'General Certificate of Secondary Education' exams, or 'GCSEs'")],
          ['Key stage 2 — compulsory subjects include: Modern Foreign Languages or Citizenship?', ['Modern Foreign Languages', 'Citizenship'], 'A', lx('Môn bắt buộc giai đoạn 2', '', ['Modern Foreign Languages start in primary school, and continue up to Key Stage 3', 'students take Citizenship from Key Stage 3'], 'Citizenship chỉ bắt đầu từ trung học.')],
        ], 'Questions 1–7'),
      ],
    },
    {
      ref: 'M2-U07-L3', title: 'Mindset 2 · Unit 7 — Choices at 16',
      description: 'The lecturer talks about post-16 educational opportunities.', partNumber: 4, audioFile: 'Mindset_L2_62.mp3', transcript: T[62],
      questionGroups: [diagram('Questions 1–5', 'The lecturer is talking about post-16 educational opportunities – the choices which pupils can make between the ages of 16 and 18. Listen and complete the diagram. Write ONE OR TWO WORDS in each gap. (Ex. 4)', 'media:m2u07-post16.jpg', [
        [1, 'Label 1 (continue studying: the other path besides vocational)', 'academic', lx('Nhãn 1', '', 'there are two paths: academic and vocational')],
        [2, 'Label 2 (… college)', 'further education / FE', lx('Nhãn 2', '', ["a further education college, also known as an 'FE' college", 'those who wish to study a vocational qualification will typically go to a Further Education college'])],
        [3, 'Label 3 (after the sixth form or college)', 'university', lx('Nhãn 3', '', 'Either of these routes will take students to university')],
        [4, 'Label 4 (where all the arrows end)', 'employment', lx('Nhãn 4', '', 'after qualifying, will be ready for employment')],
        [5, 'Label 5 (… and job-related qualification)', 'apprenticeship / an apprenticeship', lx('Nhãn 5', '', ['to join an apprenticeship or traineeship scheme', 'They study towards a qualification related to the job they are doing'])],
      ])],
    },
    {
      ref: 'M2-U07-L4', title: 'Mindset 2 · Unit 7 — Applying to university',
      description: 'A school student discusses how to apply for university with a teacher.', partNumber: 3, audioFile: 'Mindset_L2_63.mp3', transcript: T[63],
      questionGroups: [
        qMcq(1, 'A school student is discussing how to apply for university with a teacher. Listen and choose the correct word in each sentence. (Ex. 5)', [
          ['Register on the UCAS website, enter your personal details and choose ___ universities which offer a course you want to study.', ['five', 'seven'], 'A', lx('Chọn bao nhiêu trường?', '', ['there are seven good choices I could give you', 'the maximum number that you can put on your application is five'], 'BẪY: seven là số gợi ý của thầy.')],
          ['Write your personal ___, telling the universities about you and why they should offer you a place.', ['assessment', 'statement'], 'B', lx('Bài viết cá nhân', '', "You mean your 'personal statement'?")],
          ['The ___ will be supplied by your UCAS adviser at school.', ['reference', 'advice'], 'A', lx('Thư giới thiệu', '', 'I can add the reference and your predicted grades before sending it to UCAS')],
          ['Offers may be ___, which means you have to get certain grades.', ['provisional', 'conditional'], 'B', lx('Loại thư mời', '', 'Usually any offer from a university will be a conditional offer', 'BẪY: "provisional" nói về điểm dự đoán.')],
          ['If your exam results meet the requirements, the university will ___ the offer and you can accept or reject it.', ['renew', 'confirm'], 'B', lx('Xác nhận', '', "If you meet the predicted grades, they'll usually confirm the original offer, but if not, they don't tend to renew it")],
          ['Many universities use a ___ system to offer unfilled places on their courses.', ['clearing', 'reapplying'], 'A', lx('Hệ thống xét tuyển bổ sung', '', "you can try to get a place through 'clearing'")],
        ], 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U07-L5', title: 'Mindset 2 · Unit 7 — A new student and his tutor',
      description: 'A student who has just started university discusses his course with a tutor.', partNumber: 3, audioFile: 'Mindset_L2_64.mp3', transcript: T[64],
      questionGroups: [
        qMcq(1, 'Practise following the direction of a conversation by choosing the correct notes (a or b) for 1–5. (Ex. 6)', [
          ['Seminars and lectures', ['Students usually attend a seminar after they have been to a lecture.', 'Students usually attend a lecture after they have been to a seminar.'], 'A', lx('Seminar và bài giảng', '', ['review your notes following the lecture and also do some extra reading', 'When you attend the seminar, you should have some of your own ideas to discuss'])],
          ['Tutorials', ['Students usually attend tutorials every three weeks to discuss their progress with the tutor.', 'Students usually attend tutorials every two weeks to discuss their progress with the tutor.'], 'B', lx('Buổi gặp tutor', '', ['at times that might mean you have three weeks between tutorials', 'So that works out at about one every two weeks'], 'Người nói điều chỉnh: "three weeks" chỉ là đôi khi.')],
          ['Assessment', ['The assessment over the whole course is 60% course assignments and 40% exams.', 'The assessment over the whole course is 40% course assignments and 60% exams.'], 'A', lx('Đánh giá', '', 'through your assignments, which is over half of your overall assessment, usually 60%')],
          ['Length of assignments', ['Course assignments should be no fewer than 2,000 words.', 'Course assignments should not be more than 3,000 words.'], 'A', lx('Độ dài bài', '', ["there's a minimum of 2,000, and while there's no upper limit"], 'BẪY: 3,000 là độ dài thường gặp, không phải giới hạn.')],
          ['References', ['Every assignment should have at least three academic references and five non-academic ones.', 'Every assignment should have at least five academic references and three non-academic ones.'], 'B', lx('Tài liệu tham khảo', '', 'we expect a minimum of five sources which are academic journals and books')],
        ], 'Questions 1–5'),
      ],
    },
    {
      ref: 'M2-U07-L6', title: 'Mindset 2 · Unit 7 — Exam skills: after graduation',
      description: 'A student who is about to finish university discusses opportunities with a tutor.', partNumber: 3, audioFile: 'Mindset_L2_65.mp3', transcript: T[65],
      questionGroups: [
        qNote('Listen and complete each sentence with NO MORE THAN TWO WORDS. (Ex. 7)', 'Opportunities after university', [
          'If you want to teach in a school, the best option is to complete a __Q1__ in Education.',
          'You can also apply to study on a __Q2__ of __Q3__ course.',
          'If you want to do a __Q4__ like a PhD, it may take at least three years to complete.',
          'A __Q5__ provides a good opportunity to gain commercial experience in your chosen profession.',
          'If you want to find work, a good idea would be to attend a __Q6__, which gives you the opportunity to talk to many potential employers in one place.',
        ], { 1: 'Postgraduate Certificate', 2: 'Master', 3: 'Science', 4: 'research degree', 5: 'company internship / internship', 6: 'graduate fair' }, {
          1: lx('Muốn dạy học', '', 'your main route into teaching would be to do a Postgraduate Certificate in Education'),
          2: lx('Khóa học tiếp theo', '', 'you could always take a Master of Science degree'),
          3: lx('Khóa học tiếp theo', '', 'a Master of Science degree'),
          4: lx('Như PhD', '', "I've often thought of doing a research degree"),
          5: lx('Kinh nghiệm thương mại', '', 'A company internship is a chance to work in a company without actually being an employee'),
          6: lx('Gặp nhà tuyển dụng', '', "There's a graduate fair here in the city every year"),
        }, 'Questions 1–6'),
      ],
    },
  ],
};
