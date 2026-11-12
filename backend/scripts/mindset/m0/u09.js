// Mindset for IELTS Foundation — Unit 9: Language (pp. 103–113)
const { mcq, gap, match, order, cat, write, speak, passage, picture, card, qTF, qTable, qMcq, qFill, lx } = require('../dsl');

const PROJECT = `Sofia: Oliver, we need to discuss how to start our project. Remember that our teacher wants us to write the report on two things. One, how many students in college already speak more than one language…
Oliver: …yes, and two, what level their English is. It's a big project so I think we're going to have to speak to a lot of people.
Sofia: Yes, I know! Do you really think it'll be possible to speak to everyone? I'm not sure. There are over two hundred students in total.
Oliver: I know, but I guess only half of them speak just a single language.
Sofia: That's still a lot. I don't think we have enough time to go around and have a chat with the whole college. How are we going to show the results?
Oliver: I think it'll be a problem if we only include numbers. We need more than that.
Sofia: Yes, I agree. Maybe including some graphs or tables is a good idea. Let me think… First, we need to find out how many students we have here in the college in total. Then we can work out how many of them speak two or more languages.
Oliver: Can I make a suggestion? I think we can ask for that information from the college office first. I remember that, on my first day here, I put information about my second language on the registration form. So, I think it's the same for everyone.
Sofia: That's a good idea. That'll save us some time. I'll make an appointment to go and speak to somebody there after class. Who do I need to see? Is it Miss Wainwright?
Oliver: No, she works in the student services room. You need to see Miss Smith. She's in the college office.
Sofia: Can you remind me where that is? Is it next door to the IT services offices where Mr Black works?
Oliver: No, Mr Black is in the student administration office so you need to go to the floor above.
Sofia: Oh, OK. I know where that is now.
Oliver: Great. OK, I'm going to have lunch. Do you want to join me?
Sofia: No, sorry, I can't. I need to study for my maths test. Enjoy your lunch. I'm going to study in the library. Bye!`;

const ARTICLE = [
  'Today, over 50% of the world\'s total population can speak more than one language. Maybe you are one of these people who can communicate in many languages. However, it may be unlikely that you can speak more than Richard Doner, an American teenager who can hold a conversation in over twenty languages.',
  'Richard lives in New York. It is a city where there are people from hundreds of different countries. There are around 180 languages spoken in New York schools. This is why Richard believes that New York is the perfect city for him. \'I can discuss many different topics with people from all over the world and I don\'t even need to travel to another country,\' Richard says.',
  'Can he see a disadvantage? \'You can never rest. You have to continuously practise and put in lots of effort all the time to be able to remember the languages. I believe that, if your brain doesn\'t do any work, you can forget what you know. I don\'t have time to speak all of my languages every day, so if I want to get better, if I want to make progress, the important thing is that I speak each one as often as I can. If I don\'t, I start to forget the phrases and words that I know.\'',
  'He also believes that when you learn a language, you don\'t only learn words or phrases. \'A language helps you begin to learn more about the people and their cultures – their ideas, their food, what is important to them and so on.\'',
  'Richard is very popular all over the world. There are lots of videos online of him practising his skills in a wide range of languages, such as Arabic, Mandarin, German and even Swahili – a language that is common in West Africa.',
  'The most important thing for Richard is to have fun when he learns a language. Learning is easier if you can make it interesting for yourself, he explains. \'Also, take your time – you have to learn at a speed that works for you.\' I don\'t think many would disagree with him!',
];

const DICT_ESSAY = `Many students use an online dictionary to help them learn a language when they study in class. In this essay, I (1) ____ discuss the advantages and disadvantages of this.

Firstly, if a student doesn't (2) ____ the meaning of a word or phrase, they can find it quickly and easily with an online dictionary. The teacher can continue with the class and doesn't need to stop and answer questions all the time. Furthermore, a paper dictionary is sometimes too heavy and students don't like to carry one in their bags.

On the other hand, when a student is not very confident, or if they are afraid of (3) ____ a mistake, they might start to use their dictionary in the wrong way. If they stop to (4) ____ every word or phrase they do not know, they won't (5) ____ their language skills enough and they won't improve. Additionally, it is very difficult for a teacher to check that the students are (6) ____ their computers to look (7) ____ a word and not just playing online games. If they do not focus on the class, they won't (8) ____ any progress.

To sum up, an online dictionary is often useful for students. However, in my opinion, students should only go online when the teacher says to do so. If not, they won't learn for themselves.`;

module.exports = {
  n: 9,
  title: 'Language',
  titleVi: 'Ngôn ngữ',
  pages: '103–113',
  outcomes: [
    'Nói về các cách học tiếng Anh và giao tiếp (talk to, chat with, communicate by…)',
    'Dùng be going to cho kế hoạch tương lai',
    'Nghe thảo luận về một dự án; nghe vị trí phòng ban',
    'Đọc bài báo: tóm tắt ý chính đoạn văn, hoàn thành câu (≤3 từ)',
    'Nói 1–2 phút về một ngôn ngữ bạn học; viết bài luận ưu – nhược điểm',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: cách học ngôn ngữ & giao tiếp',
      titleEn: 'Lead-in · Vocabulary and speaking',
      minutes: 35,
      objectives: ['Gọi tên 8 cách học tiếng Anh', 'Dùng đúng giới từ: talk to, communicate by/with, discuss (không giới từ), chat with/about', 'Hỏi – đáp về việc học ngôn ngữ'],
      images: ['media:m0u09-leadin.jpg|Lead-in (tr. 103): các cách học tiếng Anh'],
      theory: [
        card('Động từ giao tiếp + giới từ', 'Communication verbs', {
          usage: [
            '**talk to / with** somebody · **talk about** something',
            '**communicate with** somebody **by** email / phone',
            '**discuss** something (KHÔNG có giới từ: discuss a topic) · **have a chat about** something',
            '**chat with** somebody / **chat about** something · **hold a conversation with** somebody',
          ],
          examples: [['I usually communicate by email with my lecturer.', 'Tôi thường liên lạc với giảng viên qua email.'], ['Do you want to discuss a topic for the project?', 'Bạn muốn bàn một chủ đề cho dự án không?']],
        }),
      ],
      vocab: [
        ['use a dictionary', 'dùng từ điển', 'I use a dictionary to check new words.'],
        ['keep a vocabulary notebook', 'ghi sổ từ vựng', "I'm going to keep a vocabulary notebook."],
        ['first language', 'tiếng mẹ đẻ', 'Talk to people whose first language is English.'],
        ['watch videos online', 'xem video trực tuyến', 'I watch videos online to learn English.'],
        ['communicate by email', 'liên lạc qua email', 'It is best to communicate by email first.'],
        ['talk to', 'nói chuyện với', 'I need to talk to you.'],
        ['chat with / about', 'trò chuyện với / về', 'They always chat with me.'],
        ['discuss', 'thảo luận', 'The weather is a popular topic to discuss.'],
        ['hold a conversation', 'duy trì một cuộc trò chuyện', 'I can hold a conversation in English.'],
        ['main language', 'ngôn ngữ chính', 'What is the main language in your country?'],
        ['language learning', 'việc học ngôn ngữ', 'Reading newspapers can help with language learning.'],
        ['online study', 'học trực tuyến', 'Online study is popular now.'],
      ],
      ex: [
        match('Ways to learn English (Lead-in)', 'Match pictures 1–8 with the ways of learning.', [
          ['Picture 1', 'use a dictionary'], ['Picture 2', 'talk to people whose first language is English'], ['Picture 3', 'listen to songs in English'], ['Picture 4', 'write an email to a friend'],
          ['Picture 5', 'keep a vocabulary notebook'], ['Picture 6', 'study with a teacher in a classroom'], ['Picture 7', 'watch videos online'], ['Picture 8', 'read newspapers and magazines'],
        ], { stimulus: picture('media:m0u09-leadin.jpg', 'Lead-in') }),
        mcq('Prepositions with communication verbs (Ex. 3)', 'Choose the correct preposition.', [
          ['Can you phone me when you are free? I need to talk ____ you.', ['for', 'to', 'by'], 'B'],
          ['When you apply for a job, I think it is best to communicate ____ email first.', ['to', 'with', 'by'], 'C'],
          ['The weather is a popular topic to talk ____ in the UK.', ['for', 'about', 'by'], 'B', 'talk about + chủ đề. (Lưu ý: discuss KHÔNG cần giới từ — discuss the weather.)'],
          ['Whenever I visit your home, they always chat ____ me.', ['about', 'with', 'for'], 'B'],
          ['I know enough of the language to hold a conversation ____ someone.', ['with', 'for', 'to'], 'A'],
        ]),
        match('Match the question halves (Ex. 4)', 'Match the two halves of the questions.', [
          ['What is the main language that', 'you speak in your country?'], ['Do you prefer to communicate', 'by phone or by email?'], ['How often do you talk', 'to people on the internet?'],
          ['What do you usually chat', 'about with your friends?'], ['Do you think reading newspapers', 'can help with language learning?'],
        ]),
        match('Plans for learning English (G&V Ex. 2)', 'Match the two halves of the sentences.', [
          ["I'm going to study", 'with a teacher in a classroom.'], ["I'm going to talk", 'to people whose first language is English.'], ["I'm going to use", 'a dictionary.'], ["I'm going to listen", 'to songs in English.'],
          ["I'm going to keep", 'a vocabulary notebook.'], ["I'm going to watch", 'online videos.'], ["I'm going to read", 'newspapers and magazines.'], ["I'm going to write", 'emails to my friends.'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: ý chính đoạn văn & hoàn thành câu',
      titleEn: 'Vocabulary and reading · Reading: sentence completion',
      minutes: 50,
      objectives: ['Dùng đúng collocation: hold a conversation, make progress, have fun…', 'Tóm tắt ý chính mỗi đoạn bằng ít từ', 'Hoàn thành câu với KHÔNG QUÁ BA TỪ — diễn đạt lại câu gốc'],
      theory: [
        card('Collocation', 'Collocations', {
          usage: ['Collocation = cụm từ đi với nhau tự nhiên: **hold** a conversation · **have** an advantage · **practise** your skills · **make** an effort · **do** some work · **have** fun · **speak** a language · **take** someone\'s advice · **have** time · **make** progress', 'Chúng ta nói **have** extra lessons (KHÔNG take), **take** care of (KHÔNG have care), **have** a cup of tea (TIP 15).', '**make**: a mistake, dinner, somebody laugh, a noise, a difference, a guess · **take**: a test, an exam, a picture, a walk'],
        }),
        card('Hoàn thành câu (≤ 3 từ)', 'Sentence completion — NO MORE THAN THREE WORDS', {
          formula: ['Đọc câu hỏi → tìm câu gốc trong đoạn được chỉ định → câu hỏi **diễn đạt lại** (paraphrase) câu gốc → lấy từ còn thiếu.'],
          usage: ['VD: "In New York City, you can find people from a large number of ____" ↔ "a city where there are people from hundreds of **different countries**" → different countries.', 'Viết **quá số từ cho phép** là mất điểm.', 'Mỗi đoạn có **một ý chính** — hãy thử tóm tắt nó bằng ít từ (TIP 17).'],
        }),
      ],
      links: [{ ref: 'reading:M0-U09-R1', title: 'Multilingual — Richard Doner nói hơn 20 thứ tiếng (Ex. 16–20)', note: 'Ý chính các đoạn + hoàn thành câu với không quá 3 từ.' }],
      vocab: [
        ['multilingual', 'đa ngôn ngữ', 'Richard is multilingual.'],
        ['total population', 'tổng dân số', 'over 50% of the world\'s total population'],
        ['communicate', 'giao tiếp', 'people who can communicate in many languages'],
        ['unlikely', 'không chắc, khó có thể', 'It may be unlikely that you can speak more.'],
        ['disadvantage', 'bất lợi', 'Can he see a disadvantage?'],
        ['continuously', 'liên tục', 'You have to continuously practise.'],
        ['put in effort', 'bỏ công sức', 'Put in lots of effort all the time.'],
        ['make progress', 'tiến bộ', 'If I want to make progress, I speak each language often.'],
        ['culture', 'văn hoá', 'A language helps you learn about their culture.'],
        ['a wide range of', 'nhiều loại, đa dạng', 'a wide range of languages'],
        ['common', 'phổ biến', 'Swahili is common in West Africa.'],
        ['have fun', 'vui vẻ', 'The most important thing is to have fun.'],
        ['take your time', 'cứ từ từ', 'Take your time.'],
        ['at a speed that works for you', 'theo tốc độ phù hợp với bạn', 'Learn at a speed that works for you.'],
        ["make a mistake","mắc lỗi","Don't worry about making mistakes."],
        ["take a test","làm bài kiểm tra","I'm going to take a test on Friday."],
        ["make a difference","tạo ra sự khác biệt","Practising every day makes a difference."],
        ["make a guess","đoán","If you don't know the word, make a guess."],
        ["take a picture","chụp ảnh","I always take lots of pictures on holiday."],
        ["make somebody laugh","làm ai đó cười","Robert really makes me laugh."],
      ],
      ex: [
        mcq('Collocations (Ex. 15)', 'Choose the correct verb.', [
          ['____ a conversation', ['speak', 'do', 'hold'], 'C'], ['____ an advantage', ['make', 'have', 'do'], 'B'], ['____ your skills', ['have', 'get', 'practise'], 'C'],
          ['____ an effort', ['make', 'give', 'take'], 'A'], ['____ some work', ['practise', 'do', 'hold'], 'B'], ['____ fun', ['get', 'begin', 'have'], 'C'],
          ['____ a language', ['get', 'hold', 'speak'], 'C'], ['____ someone\'s advice', ['do', 'take', 'speak'], 'B'], ['____ time (to do something)', ['have', 'practise', 'do'], 'A'], ['____ progress', ['do', 'make', 'have'], 'B'],
        ]),
        cat('MAKE or TAKE? (G&V Ex. 7)', 'Put each phrase into the MAKE or TAKE column.', { make: 'make', take: 'take' }, [
          ['a mistake', 'make'], ['dinner', 'make'], ['somebody laugh', 'make'], ['a noise', 'make'], ['a difference', 'make'], ['a guess', 'make'],
          ['a test', 'take'], ['an exam', 'take'], ['a picture', 'take'], ['a walk', 'take'],
        ]),
        gap('A conversation about Susan\'s brother (G&V Ex. 5)', 'Complete the conversation with: time, advantage, skills, advice, effort, progress, fun, work.', [
          ['My brother says he won\'t be able to pass his English exam, so he\'s not going to make an ____. — Well, he never does any ____.', ['effort', 'work']],
          ['I tried to give him some ____, but he didn\'t take it. He only wants to have ____.', ['advice', 'fun']],
          ['I told him that it takes a long ____ to learn a language.', 'time'],
          ['He should also practise his speaking ____ as well as listening. It\'s more difficult to make any ____ if you don\'t speak.', ['skills', 'progress']],
          ['He also has a big ____ because your dad is an English teacher!', 'advantage'],
        ], { wordBank: ['time', 'advantage', 'skills', 'advice', 'effort', 'progress', 'fun', 'work'] }),
        gap('Paraphrase the conversation (G&V Ex. 6)', 'Complete the sentences that paraphrase the conversation in the previous exercise. Write ONE to THREE words.', [
          ['Susan\'s brother isn\'t going to study because he believes he is going to fail ____.', 'his English exam|his exam'],
          ['He didn\'t want to take Susan\'s ____.', 'advice'],
          ['Susan\'s brother isn\'t interested in his studies and he would much rather ____.', 'have fun'],
          ['George told Susan\'s brother that it takes a lot of effort to learn a language, and it happens over a ____.', 'long time'],
          ['George thinks that without practising your speaking skills, it is more difficult to ____.', 'make any progress|make progress'],
          ['The biggest advantage that Susan\'s brother has is that their father teaches ____.', 'English'],
        ]),
        mcq('Summarise the main ideas (Ex. 17)', 'Read the text about Richard Doner again and choose the correct word to summarise the main idea.', [
          ['Richard Doner is very special because he can speak ____ languages…', ['more', 'less', 'most'], 'A'],
          ['…than ____ people.', ['more', 'most of', 'most'], 'C', 'most people = hầu hết mọi người (không có "of" khi không có the/my…).'],
          ['Richard is very lucky as he has ____ opportunities to practise his language skills.', ['many', 'any', 'lots of'], 'C', 'Đáp án sách: lots of.'],
          ['Richard practises speaking each language ____ to improve.', ['all the time', 'regularly', 'every day'], 'B', 'Đáp án sách: regularly (đều đặn).'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: be going to — kế hoạch tương lai',
      titleEn: 'Grammar: going to for future plans',
      minutes: 40,
      objectives: ['Nói và hỏi về kế hoạch với am/is/are (not) going to + V', 'Đặt câu hỏi Wh- với going to', 'Dùng trạng từ thời gian (tonight, next week…) ở cuối câu'],
      keyLanguage: [
        'Khẳng định / phủ định: I am going to learn five new phrases. We are not going to talk about school.',
        'Câu hỏi Yes/No: Are you going to move to Canada? Is he going to video call his cousin later?',
        'Câu hỏi Wh-: What are you going to do at the weekend? Where is he going to go to university?',
        'Trạng từ thời gian (tonight, this afternoon, next week, at the weekend) thường đứng CUỐI câu. "gonna" chỉ dùng trong văn nói thân mật — KHÔNG viết.',
      ],
      links: [{ grammar: 'be-going-to', title: 'Be Going To', note: 'kế hoạch, dự định' }, { grammar: 'future-simple', title: 'Future Simple (will)', note: 'so sánh will và be going to' }],
      ex: [
        gap('Plans (Ex. 5)', 'Complete the sentences with the verbs: learn, meet, send, study, video call.', [
          ['I\'m going to ____ my friends at the cinema tonight.', 'meet'],
          ['I\'m going to ____ my cousin on the computer this afternoon. He\'s moving to Canada next week.', 'video call'],
          ['Whenever I read a newspaper, I say to myself: \'I\'m going to ____ five new phrases today\'.', 'learn'],
          ['I\'m going to ____ in the library this morning.', 'study'],
          ['I\'m going to ____ an email to my English friend at the weekend.', 'send'],
        ], { wordBank: ['learn', 'meet', 'send', 'study', 'video call'] }),
        mcq('Correct or incorrect? (Ex. 9)', 'Choose the CORRECT sentence.', [
          ['A plan to study in the UK at 18:', ['When I am 18, I going to study in the UK.', 'When I am 18, I am going to study in the UK.'], 'B', 'Thiếu "am".'],
          ['An invitation to go shopping later:', ['Are you going to come shopping with me later?', 'You going to come shopping with me later?'], 'A'],
          ['Her plan to buy a new phone:', ['She is going buy a new smartphone at the weekend.', 'She is going to buy a new smartphone at the weekend.'], 'B', 'Thiếu "to".'],
          ['A question about telling your parents:', ['You are going to tell your parents that you got bad results?', 'Are you going to tell your parents that you got bad results?'], 'B', 'Câu hỏi phải đảo are lên trước.'],
          ['A question about where to watch the match:', ['Where are you going to watch the football match?', 'Where you are going to watch the football match?'], 'A'],
          ['Not ordering food at the restaurant:', ['I\'m not going to order any food at the restaurant – I\'m not hungry.', 'I\'m going not to order any food at the restaurant – I\'m not hungry.'], 'A', 'Câu trong sách đã đúng: not đứng ngay sau am.'],
        ]),
        gap('Positive, negative and questions (G&V Ex. 3)', 'Write the correct form of going to (+ / − / ?).', [
          ['(−/I/worry) ____ about my English test tomorrow. It is only a practice test.', 'I\'m not going to worry|I am not going to worry'],
          ['(?/you/learn) ____ some French before your holiday in Paris?', 'Are you going to learn'],
          ['(+/I/try) ____ my hardest to improve my vocabulary.', 'I\'m going to try|I am going to try'],
          ['(?/you/meet) ____ them outside the library?', 'Are you going to meet'],
          ['(−/she/live) ____ in campus accommodation when she goes to university.', 'She isn\'t going to live|She is not going to live|She\'s not going to live'],
        ]),
        order('Questions with going to (G&V Ex. 4)', 'Put the words in the correct order to make questions.', [
          ['Who are you going to do the language project with?'], ['Where are you going to buy a dictionary from?'], ['How are you going to improve your language skills?'], ['Why are you not going to go to university next year?'],
          ['When are you going to tell the teacher you want to move up to a higher level class?'],
        ]),
        mcq('Sentences about plans (Ex. 6)', 'Look again at the five sentences in "Plans (Ex. 5)" and answer the questions.', [
          ['How do we know the writer is talking about future plans?', ['The writer uses going to.', 'The writer uses the past simple.', 'The writer uses can.'], 'A', 'be going to + V = kế hoạch đã định.'],
          ['Which of these is NOT an adverb of time used in the sentences?', ['tonight', 'this afternoon', 'yesterday'], 'C', 'Các trạng từ trong bài: tonight, this afternoon, next week, today, this morning, at the weekend.'],
          ['Adverbs of time (next week, tomorrow, later…) usually go ____.', ['at the start of the sentence', 'at the end of the sentence', 'before going to'], 'B', 'Theo hộp gợi ý của sách: thường đứng cuối câu.'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: bài luận ngắn ưu – nhược điểm',
      titleEn: 'Writing: a short essay on a topic',
      minutes: 55,
      objectives: ['Sắp xếp bố cục 4 phần: mở bài – ưu điểm – nhược điểm – kết luận', 'Dùng từ nối: Firstly, Furthermore, Additionally, On the other hand, However, To sum up', 'Viết bài luận 220–250 từ về ưu – nhược điểm của việc học tiếng Anh cùng bạn cùng quốc tịch'],
      theory: [
        card('Bố cục bài luận ưu – nhược điểm', 'Advantages and disadvantages essay', {
          formula: ['**Introduction** — giới thiệu chủ đề + "In this essay, I am going to discuss the advantages and disadvantages of…"', '**Paragraph 1 (advantages)** — **Firstly**, … **Furthermore / Additionally**, …', '**Paragraph 2 (disadvantages)** — **On the other hand**, … **Additionally**, …', '**Conclusion** — **To sum up**, … **However, in my opinion**, …'],
          usage: ['**Firstly**: ý chính đầu tiên · **Furthermore / Additionally**: thêm thông tin · **On the other hand / However**: ý mới, đối lập · **To sum up**: kết luận.'],
        }),
      ],
      vocab: [
        ['advantage', 'ưu điểm', 'One advantage is that it is quick.'],
        ['disadvantage', 'nhược điểm', 'The main disadvantage is…'],
        ['firstly', 'thứ nhất', 'Firstly, students can find words quickly.'],
        ['furthermore', 'hơn nữa', 'Furthermore, it is free.'],
        ['additionally', 'ngoài ra', 'Additionally, it is easy to use.'],
        ['on the other hand', 'mặt khác', 'On the other hand, students might stop thinking.'],
        ['to sum up', 'tóm lại', 'To sum up, online dictionaries are useful.'],
        ['look up a word', 'tra từ', 'Look up a word in the dictionary.'],
        ['confident', 'tự tin', 'when a student is not very confident'],
        ['be afraid of', 'sợ', 'They are afraid of making a mistake.'],
        ['motivated', 'có động lực', 'You have to be very motivated.'],
      ],
      ex: [
        order('Essay structure (Ex. 23)', 'Put the parts of the essay in the correct order (A: disadvantages paragraph · B: conclusion · C: introduction · D: advantages paragraph).', [
          ['C D A B', 'Introduction → Paragraph (advantages) → Paragraph (disadvantages) → Conclusion.'],
        ]),
        mcq('An essay about online dictionaries (Ex. 24–25)', 'Read the student\'s essay and choose the correct answer for each gap.', [
          ['(1) In this essay, I ____ discuss the advantages and disadvantages of this.', ['am going', 'going to', 'am going to'], 'C'],
          ['(2) if a student doesn\'t ____ the meaning of a word', ['see', 'know', 'think'], 'B'],
          ['(3) if they are afraid of ____ a mistake', ['having', 'doing', 'making'], 'C', 'make a mistake.'],
          ['(4) If they stop to ____ every word or phrase they do not know', ['look', 'see', 'check'], 'C'],
          ['(5) they won\'t ____ their language skills enough', ['practise', 'try', 'speak'], 'A'],
          ['(6) check that the students are ____ their computers', ['using', 'use', 'used'], 'A'],
          ['(7) to look ____ a word', ['up', 'at', 'to'], 'A', 'look up = tra cứu.'],
          ['(8) they won\'t ____ any progress', ['do', 'make', 'have'], 'B'],
        ], { stimulus: passage(DICT_ESSAY, { caption: 'What are the advantages and disadvantages of using an online dictionary in a language class?' }) }),
        cat('What are linking words used for? (Ex. 26)', 'Put the linking words into groups by function.', { main: 'The first main point', extra: 'Adding information', new: 'A new or contrasting point', end: 'Conclusion' }, [
          ['Firstly', 'main'], ['Furthermore', 'extra'], ['Additionally', 'extra'], ['On the other hand', 'new'], ['However', 'new'], ['To sum up', 'end'],
        ]),
        write('Write an essay: classmates from the same country (Ex. 27)', 'Write an essay (220–250 words): "What are the advantages and disadvantages of taking English lessons with classmates from the same country?" Include a clear introduction and conclusion, body paragraphs about the advantages and the disadvantages, and linking words to organise your ideas (Firstly, Furthermore, On the other hand, However, To sum up…).', {
          minWords: 200, maxWords: 270, mustUse: 4,
          targetStructures: ['Firstly', 'Furthermore', 'Additionally', 'On the other hand', 'However', 'To sum up', 'In this essay'],
          checklist: ['Mở bài giới thiệu chủ đề và mục đích bài luận', 'Một đoạn ưu điểm (ít nhất 2 ý)', 'Một đoạn nhược điểm (ít nhất 2 ý)', 'Kết luận có ý kiến cá nhân', 'Dùng từ nối đúng chức năng', '220–250 từ'],
          sampleAnswer: 'Many students want to learn English, but most of them cannot travel to an English-speaking country. Instead, they study in their own country, in classes where everybody has the same first language. In this essay, I am going to discuss the advantages and disadvantages of this.\n\nFirstly, if a student does not understand a word or the teacher\'s instructions, a classmate can quickly explain it in their first language. This saves time and helps weaker students feel less worried. Furthermore, the teacher usually knows the typical problems that students from that country have, such as difficult sounds or grammar, so they can focus on these problems in every lesson. Additionally, it is often cheaper to study in your own country than to go abroad.\n\nOn the other hand, students may speak their own language too often, especially in group work, so they do not practise their English enough. Shy or lazy students might never try to communicate in English at all. Moreover, if everybody makes the same mistakes, nobody notices them, and the mistakes become habits. Finally, students do not learn about other cultures, which is an important part of learning a language.\n\nTo sum up, studying with classmates who share your first language can be helpful, because they can support you with difficult grammar and vocabulary. However, in my opinion, students in this kind of class must be very motivated and should try to use only English in the classroom if they want to make real progress.',
          commonErrors: ['Thiếu mở bài hoặc kết luận', 'Dùng sai từ nối (However để thêm ý)', 'Quá ít hoặc quá nhiều từ'],
        }),
      ],
    },

    listening: {
      title: 'Listening: thảo luận dự án ngôn ngữ',
      titleEn: 'Listening: discussing a language project',
      minutes: 35,
      objectives: ['Nghe hội thoại và quyết định True / False', 'Nghe ai làm ở phòng nào (điền bảng)', 'Nghe kế hoạch tiếp theo của người nói'],
      theory: [
        card('True / False khi nghe', 'Listening for detail', {
          usage: ['Con số: "over two hundred students **in total**" — KHÔNG phải 200 người nói nhiều thứ tiếng; "only **half** of them speak just a single language".', 'Suy luận: Oliver ghi "my second language" trên đơn đăng ký → Oliver nói được hơn một ngôn ngữ.', 'Bảng phòng ban: nghe "**No**, she works in…" — người nói hay **sửa lại** thông tin sai.'],
          notes: ['Trong văn nói, "going to" thường đọc thành **gonna** — chỉ dùng khi nói thân mật, KHÔNG viết.'],
        }),
      ],
      links: [{ ref: 'listening:M0-U09-L1', title: 'Sofia & Oliver — dự án ngôn ngữ (Ex. 11–12)', note: '3 câu True/False, bảng phòng làm việc và câu hỏi Sofia đi đâu tiếp theo.' }],
      vocab: [
        ['report', 'bản báo cáo', 'Write the report on two things.'],
        ['level', 'trình độ', 'what level their English is'],
        ['in total', 'tổng cộng', 'over two hundred students in total'],
        ['single', 'đơn, duy nhất', 'only half of them speak a single language'],
        ['include', 'đưa vào, bao gồm', 'if we only include numbers'],
        ['graph / table', 'biểu đồ / bảng', 'including some graphs or tables'],
        ['make a suggestion', 'đưa ra gợi ý', 'Can I make a suggestion?'],
        ['registration form', 'phiếu đăng ký', 'I put it on the registration form.'],
        ['save time', 'tiết kiệm thời gian', "That'll save us some time."],
        ['make an appointment', 'đặt lịch hẹn', "I'll make an appointment."],
        ['remind', 'nhắc', 'Can you remind me where that is?'],
        ['the floor above', 'tầng trên', 'You need to go to the floor above.'],
      ],
      ex: [
        mcq('Collocations in the recording', 'Choose the correct word (from the conversation between Sofia and Oliver).', [
          ['Can I ____ a suggestion?', ['make', 'do', 'take'], 'A'],
          ['I\'ll ____ an appointment to go and speak to somebody.', ['take', 'make', 'have'], 'B'],
          ['We don\'t have enough time to ____ a chat with the whole college.', ['have', 'do', 'take'], 'A'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: nói 1–2 phút về một ngôn ngữ bạn học',
      titleEn: 'Speaking: a longer talk about a topic',
      minutes: 40,
      objectives: ['Dùng 1 phút chuẩn bị, ghi chú từ khoá', 'Nói 1–2 phút về ngôn ngữ bạn đang học (dùng going to)', 'Trả lời câu hỏi tiếp theo'],
      theory: [
        card('Bài nói về chủ đề cá nhân', 'A longer talk about a topic', {
          formula: ['**Đề**: Describe a language that you are studying, other than your first language. You should say: what the language is · how well you know the language · how long you are going to study it for — and explain why you are learning it.'],
          usage: ['Bạn có **1 phút** chuẩn bị và được dùng ghi chú khi nói (bullet box 13).', 'Dùng **going to** cho kế hoạch: I\'m going to take the IELTS test next year.', 'Dùng collocation của unit: hold a conversation, make progress, practise my skills.'],
        }),
      ],
      vocab: [
        ['other than', 'ngoài', 'a language other than your first language'],
        ['fluent', 'trôi chảy', "I'm not fluent yet."],
        ['intermediate', 'trung cấp', 'My English is at an intermediate level.'],
        ['practise my skills', 'luyện kỹ năng', 'I practise my skills every day.'],
        ['make progress', 'tiến bộ', "I'm making progress slowly."],
        ['study abroad', 'du học', "I'm going to study abroad."],
        ['job opportunities', 'cơ hội việc làm', 'English gives you more job opportunities.'],
        ['follow-up question', 'câu hỏi tiếp theo', 'Ask follow-up questions about the topic.'],
      ],
      ex: [
        speak('Speaking: a language you are learning (Ex. 13–14)', 'Read the task, prepare for one minute, then speak for 1–2 minutes.', 2, [
          ['Describe a language that you are studying, other than your first language.\nYou should say:\n• what the language is\n• how well you know the language\n• how long you are going to study the language for\nand explain why you are learning this language.', 'The language I\'m studying at the moment is English. I started learning it in primary school, so I\'ve studied it for about eight years, but I think my level is only pre-intermediate. I can read simple articles and I can hold a short conversation about everyday topics, but I still find listening quite difficult, especially when people speak fast. I\'m going to study English for at least two more years, because I\'m going to take the IELTS test before I finish high school. My plan is to practise my skills every day – for example, I\'m going to watch one video online and learn ten new words each evening. The main reason I\'m learning English is that I want to study abroad, maybe in Australia. Also, English gives you more job opportunities, and it helps me talk to people from all over the world, so I think it\'s really worth the effort.', 'Đủ 4 ý; dùng going to cho kế hoạch, collocation (hold a conversation, practise my skills, worth the effort), có lý do cụ thể.'],
        ]),
        speak('Speaking: questions about learning languages (Ex. 2, 5)', 'Answer each question in 15–25 seconds.', 1, [
          ['Which ways of learning English work best for you? Why?', 'Watching videos online works best for me, because I can learn real English and it\'s fun. I also keep a vocabulary notebook, so I can review new words before tests.', 'Hai cách + lý do.'],
          ['Do you prefer to communicate by phone or by email?', 'I prefer to communicate by phone, because it\'s faster and I can hear the other person\'s voice. I only use email for school or when I need to send documents.', 'Lựa chọn + lý do + ngoại lệ.'],
          ['What are you going to do to improve your English next month?', 'Next month, I\'m going to join an English club at school, and I\'m going to read one short book in English. I think speaking with other students will help me become more confident.', 'Dùng going to.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 9: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 9',
      minutes: 30,
      objectives: ['Ôn giới từ giao tiếp, make/take, going to và từ nối'],
      ex: [
        mcq('Prepositions (G&V Ex. 1)', 'Choose the correct preposition (or "no preposition").', [
          ['I usually communicate ____ email with my lecturer at university.', ['by', 'to', '(no preposition)'], 'A'],
          ['If you are having a difficult time, it is best to talk ____ someone.', ['to', 'about', '(no preposition)'], 'A', 'talk to / with somebody.'],
          ['You must be able to hold a conversation ____ someone to pass the exam.', ['with', 'about', '(no preposition)'], 'A'],
          ['You can\'t take the course, unless you speak ____ English really well.', ['to', 'with', '(no preposition)'], 'C', 'speak + tên ngôn ngữ, không giới từ.'],
          ['Have you got any free time? I want to have a chat ____ something.', ['about', 'by', '(no preposition)'], 'A'],
          ['You can go to the careers office to have a chat ____ someone about jobs.', ['with', 'by', '(no preposition)'], 'A'],
          ['Do you want to discuss ____ a topic for the project?', ['about', 'with', '(no preposition)'], 'C', 'discuss + tân ngữ trực tiếp.'],
        ]),
        mcq('MAKE or TAKE? (G&V Ex. 8)', 'Choose the correct answer.', [
          ['It is a beautiful day. I ____ a walk.', ['am going to take', 'am taking', 'am going to make'], 'A'],
          ['Lucinda is upset. She thinks she ____ many mistakes in the exam.', ['took', 'made', 'makes'], 'B'],
          ['Robert is so funny. He really ____ me laugh.', ['makes', 'takes', 'is making'], 'A'],
          ['I always ____ lots of photos when I go sightseeing on holiday.', ['make', 'am taking', 'take'], 'C'],
          ['What really ____ a difference to your language skills is if you don\'t worry about making mistakes.', ['makes', 'is making', 'made'], 'A'],
        ]),
        gap('Verb forms (G&V Ex. 10)', 'Complete the sentences with the correct form of: have (x2), discuss, hold, communicate, try.', [
          ['I don\'t know what university to apply for. My father and I ____ a chat about it tomorrow.', 'are going to have|are having'],
          ['Come in, Alison. We ____ to decide what to have for dinner.', 'are trying|\'re trying'],
          ['Look, we ____ this last week – I don\'t want to have a party for my birthday.', 'discussed'],
          ['I don\'t know anyone who ____ by letter anymore.', 'communicates'],
          ['Our English teacher always tells us ____ more conversations with each other after class.', 'to hold'],
          ['I ____ a chat with my mum about what language course to take.', 'had|am having|\'m having|will have|am going to have|\'m going to have', 'Sách chấp nhận nhiều thì: had / am having / will have / am going to have.'],
        ]),
        gap('Put the linking words in the right place (G&V Ex. 9)', 'Five linking words in bold in the text are in the wrong places. Write the correct linking word for each position 1–5 (use: To sum up, firstly, However, Furthermore, Additionally).', [
          ['I\'m going to talk about a project I did at college. (1) ____, it was a language project, and I worked with my friend, Peter.', 'Firstly', 'Ý đầu tiên → Firstly.'],
          ['We had to find out how many people in college speak more than one language and, (2) ____, what their level of English is.', 'additionally|furthermore', 'Thêm một việc nữa phải tìm hiểu → additionally / furthermore.'],
          ['I like doing this sort of project, so was happy to work hard. (3) ____, Peter is also a very good student, so we helped each other a lot.', 'Furthermore|Additionally', 'Bổ sung thêm ý tích cực → Furthermore / Additionally.'],
          ['…and it was quite easy in the end. (4) ____, we didn\'t get any good advice from Miss Smith in the college office.', 'However', 'Chuyển sang ý trái ngược (khó khăn) → However.'],
          ['…and then she couldn\'t find the correct information herself! (5) ____, she didn\'t help us at all.', 'To sum up', 'Câu kết luận → To sum up.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U09-R1',
      title: 'Mindset 0 · Unit 9 — Multilingual: what it is like to speak many languages',
      content: '<p><em>You are going to read an article about a teenager who has a special skill.</em></p>\n\n' + ARTICLE.map((p, i) => '<p><strong>' + (i + 1) + '</strong> ' + p + '</p>').join('\n\n'),
      questionGroups: [
        qMcq(1, 'Read paragraphs 1–3 again. Choose the correct words to summarise the main ideas.', [
          ['Richard Doner is very special because he can speak ____ languages than most people.', ['more', 'less', 'most'], 'A', 'Đoạn 1: "hold a conversation in over twenty languages" → nhiều hơn hầu hết mọi người.'],
          ['Richard is very lucky as he has ____ opportunities to practise his language skills.', ['any', 'lots of', 'much'], 'B', 'Đoạn 2: New York có người từ hàng trăm quốc gia → rất nhiều cơ hội.'],
          ['Richard practises speaking each language ____ to improve.', ['all the time', 'regularly', 'every day'], 'B', 'Đoạn 3: "I don\'t have time to speak all of my languages every day… I speak each one as often as I can" → regularly (không phải mỗi ngày).'],
        ], 'Questions 1–3'),
        qFill(4, 'Complete the sentences using NO MORE THAN THREE WORDS from the article.', [
          ['If Richard wants to talk with people from different countries, it isn\'t necessary to travel ____. (Paragraph 2)', 'to another country', '"I don\'t even need to travel to another country" → to another country.'],
          ['To remember languages, Richard makes sure his brain does ____. (Paragraph 3)', 'some work / work', '"if your brain doesn\'t do any work, you can forget" → his brain does some work.'],
          ['If you know a language, you can start to understand about the people and ____. (Paragraph 4)', 'their cultures / cultures', '"learn more about the people and their cultures".'],
          ['Swahili is a popular language in ____. (Paragraph 5)', 'West Africa', '"Swahili – a language that is common in West Africa" (common = popular).'],
          ['When he learns a language, it is absolutely necessary for Richard to ____. (Paragraph 6)', 'have fun', '"The most important thing for Richard is to have fun".'],
        ], 'Questions 4–8'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U09-L1',
      title: 'Mindset 0 · Unit 9 — Discussing a language project',
      description: 'Sofia and Oliver plan a language project at an international college.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_17.mp3',
      transcript: PROJECT,
      questionGroups: [
        qTF(1, 'Listen to Sofia and Oliver. Decide whether these sentences are True or False.', [
          ['There are over 200 students in the school who speak more than one language.', 'False', lx('Có hơn 200 học sinh trong trường nói được hơn một ngôn ngữ.', 'Đầu bài.', ['There are over two hundred students in total', 'I guess only half of them speak just a single language'], '200 là TỔNG số học sinh, không phải số người nói nhiều thứ tiếng → False.')],
          ['Oliver thinks that they shouldn\'t only include numbers in the report.', 'True', lx('Oliver nghĩ không nên chỉ đưa con số vào báo cáo.', 'Giữa bài.', "I think it'll be a problem if we only include numbers. We need more than that", 'True.')],
          ['Oliver can speak more than one language.', 'True', lx('Oliver nói được hơn một ngôn ngữ.', 'Khi Oliver đưa ra gợi ý.', 'I put information about my second language on the registration form', 'Có ngôn ngữ thứ hai → True.')],
        ], 'Questions 1–3'),
        qTable('Listen again and complete the table. Write NO MORE THAN THREE WORDS for each answer.', ['Name', 'Room where they work'], [
          ['Miss Wainwright', '__Q4__'], ['Miss Smith', '__Q5__'], ['Mr Black', '__Q6__'],
        ], { 4: 'student services / student services room', 5: 'college office / the college office', 6: 'student administration office / student administration' }, {
          4: lx('Phòng của Miss Wainwright', 'Khi Sofia hỏi cần gặp ai.', 'No, she works in the student services room', 'student services.'),
          5: lx('Phòng của Miss Smith', 'Ngay sau đó.', "You need to see Miss Smith. She's in the college office", 'college office.'),
          6: lx('Phòng của Mr Black', 'Gần cuối.', ['Is it next door to the IT services offices where Mr Black works?', 'No, Mr Black is in the student administration office'], 'BẪY: IT services là ý sai của Sofia → student administration office.'),
        }, 'Questions 4–6'),
        qMcq(7, 'Choose the correct answer.', [
          ['Where is Sofia going to next?', ['The library.', 'The maths classroom.', 'The café.'], 'A', lx('Sofia sẽ đi đâu tiếp theo?', 'Câu cuối.', ["I need to study for my maths test", "I'm going to study in the library"], 'Ôn thi toán (không phải lớp toán) ở thư viện; Oliver mới đi ăn trưa → A.')],
        ], 'Question 7'),
      ],
    },
  ],
};
