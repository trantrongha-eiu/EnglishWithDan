// Mindset for IELTS Foundation — Unit 8: Health and medicine (pp. 92–102)
const { mcq, gap, match, order, write, speak, passage, picture, card, qMcq, qFill, qMatch, lx } = require('../dsl');

const PART1 = `Samantha: Hello, Tom.
Sarah: Hi, Tom. Where are you going?
Tom: Hi, Sarah. Hi, Samantha. I'm going to the sports centre.
Sarah: Oh, great. I'm thinking of joining the gym there.
Tom: Really? Why don't you come with me and get some information about it?`;

const PART2 = `Sarah: OK, thanks. Did you join the gym?
Tom: Yes, I did. It's got really great equipment – all very modern and new. However, it is a little bit expensive – almost forty pounds a month, and that's with a student discount… But I've been every day since I joined.
Sarah: £40 a month! That is expensive. However, if you think it's a good gym, maybe I'll try it.
Samantha: Well, I think £40 a month is way too much. I don't know why people spend so much money on a gym membership, when they can exercise in the park for free.
Tom: I've tried running in the park, but it was really boring! I prefer to exercise with friends because it encourages me to work harder.
Sarah: I prefer to do exercise with friends as well – it's much more fun than exercising alone.
Samantha: But it's not just running. They have group exercise classes there in the park in the morning. Exercising outside is better because you get lots of fresh air. And you can exercise with a personal trainer, too.
Sarah: That sounds good. I think I'd like to have a personal trainer. How much does one cost?
Samantha: I pay £20 an hour.
Tom: £20 an hour! Doesn't that work out to be more expensive than joining the gym?
Samantha: It is expensive, but I think that it's worth the money. You can find out which type of exercise is best for you, and you can get some really useful advice on diet, too.
Sarah: That does sound useful. I need some advice on my diet – it's not great at the moment. And I know that a healthy diet helps you get fit.
Samantha: I can give you the email address of my personal trainer if you want.
Sarah: That's great! Thanks Samantha.
Tom: What about the gym? Do you think you'll join it?
Sarah: Yes – I think I'm going to try both.`;

const RELAX = `Jim: When I need to relax, I usually read a book. I believe that reading can also change your mood. For example, a good novel can make you forget about all of your worries and a funny story can make you feel happy. If you're feeling sad, you shouldn't read a sad story though, as this will make you feel worse.
Elena: For me, doing yoga is the best way to relax. You don't even have to spend a long time doing it to feel the benefits – even five minutes of breathing exercises can make a difference. Doing yoga will help you breathe deeply, which is the fastest way to feel more relaxed. You can do yoga classes in many different places. It isn't expensive either! Many sports centres offer yoga classes at a low price. You have to find a good teacher though – that's really important.
Kate: I think that doing regular exercise is the best way to relax. It's good for the body and also for the mind. After a short run or work out we feel more relaxed and happier. Often a person's reason for not doing regular exercise is they don't have enough time. However, you can always find ways to do more exercise, like walking instead of getting the bus or driving.
Mike: When I am feeling stressed at work, I go straight outdoors for a walk in the park. Breathing fresh air and looking at nature helps me to deal with my problems. Being active for just twenty minutes outside is enough to make you feel healthier, but the longer you spend, the better. I try to spend half an hour every day exercising during my lunch break. I can't spend the whole hour outside because I don't always have time. Everyone should give it a try.
Mark: When I want to relax, the first thing I do is make myself a cup of tea. I think green tea makes me feel calmer than black tea, but all types of tea can make you feel less stressed. A recent study found that people who drink tea during stressful times are much more relaxed than those who don't. You shouldn't drink tea at night though or you may find it difficult to sleep.`;

const ESSAY = `Some parents may think that while their children are preparing for important school exams, they shouldn't have sports lessons. This could be because they want them to focus on exam subjects more, like science and maths. For a similar reason, some parents think children should also stop painting and music lessons in the final school term so they can spend more time studying. However, I disagree with these views, and believe that children should continue to have sports lessons. These lessons help students keep healthy and happy during the exam period.

Firstly, schools need to encourage young people to follow a healthy lifestyle and get regular exercise. Many young people don't do enough exercise. They prefer to spend their free time indoors on their computers or watching TV than going to the park and playing tennis, or going cycling. Many people today are overweight and have health problems. There is a lot of information about eating healthily, but people often forget that regular exercise is equally important.

Secondly, exercise helps us feel less stressed and tired. It also improves memory and helps us think clearly. When students are studying for exams, it's a good idea to take regular breaks and do something active for 20 minutes. Exercise also helps us to concentrate better on difficult tasks and helps us sleep better at night. Doing exercise may even help students get better results in their exams.

In conclusion, I believe that students who are revising for important exams should continue to have sports lessons because regular exercise is good for their body and mind.`;

module.exports = {
  n: 8,
  title: 'Health and medicine',
  titleVi: 'Sức khoẻ',
  pages: '92–102',
  outcomes: [
    'Nói về các hoạt động giữ sức khoẻ và cách thư giãn',
    'Nghe nhận ra ý kiến của từng người; nghe trắc nghiệm có bẫy',
    'Đọc bài luận nêu ý kiến; làm trắc nghiệm theo chiến lược',
    'Dùng should / shouldn\'t và have to / don\'t have to',
    'Mô tả tranh và cho lời khuyên; viết email khuyên bạn',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: hoạt động lành mạnh & cách thư giãn',
      titleEn: 'Lead-in · Vocabulary and speaking · Vocabulary: how to relax',
      minutes: 35,
      objectives: ['Gọi tên các hoạt động tốt cho sức khoẻ', 'Gọi tên 5 cách thư giãn', 'Dùng đúng động từ: play / go / do / drink / eat / get'],
      images: ['media:m0u08-activities.jpg|Ex. 4 (tr. 93): các hoạt động', 'media:m0u08-relax.jpg|Ex. 15 (tr. 97): cách thư giãn'],
      theory: [
        card('Cụm từ về sức khoẻ', 'Healthy activities', {
          usage: [
            '**play** tennis / basketball · **go** cycling / for a walk / running · **do** yoga / exercise',
            '**eat** fruit and vegetables · **drink** water / tea · **get** enough sleep / fresh air / advice · **join** a gym · **follow** a healthy diet',
            '**relax**, **feel stressed / tired**, **keep fit / stay healthy**',
          ],
        }),
      ],
      vocab: [
        ['keep healthy', 'giữ sức khoẻ', 'How do you like to keep healthy?'],
        ['eat fruit and vegetables', 'ăn rau quả', 'You should eat lots of fruit and vegetables.'],
        ['get enough sleep', 'ngủ đủ giấc', 'Get enough sleep every night.'],
        ['drink water', 'uống nước', 'Drink plenty of water when you do exercise.'],
        ['go cycling', 'đạp xe', 'I go cycling at the weekend.'],
        ['enjoy art and music', 'thưởng thức nghệ thuật, âm nhạc', 'Enjoying art and music helps you relax.'],
        ['do yoga', 'tập yoga', 'Doing yoga is the best way to relax.'],
        ['go for a walk', 'đi dạo', 'I go for a walk in the park.'],
        ['do exercise', 'tập thể dục', 'Regular exercise is good for the mind.'],
        ['drink tea', 'uống trà', 'Green tea makes me feel calmer.'],
        ['stressed', 'căng thẳng', 'I feel stressed before exams.'],
        ['relax', 'thư giãn', 'What do you do to relax?'],
        ['fresh air', 'không khí trong lành', 'You get lots of fresh air outside.'],
        ['join a gym', 'đăng ký phòng gym', 'It can be expensive to join a gym.'],
        ['personal trainer', 'huấn luyện viên cá nhân', 'Get a personal trainer for advice.'],
        ['healthy diet', 'chế độ ăn lành mạnh', 'It is important to follow a healthy diet.'],
      ],
      ex: [
        match('Hoạt động trong tranh (Ex. 4)', 'Nối tranh 1–8 với hoạt động.', [
          ['Picture 1', 'eat fruit and vegetables'], ['Picture 2', 'play basketball'], ['Picture 3', 'enjoy art and music'], ['Picture 4', 'go cycling'],
          ['Picture 5', 'play tennis'], ['Picture 6', 'drink water'], ['Picture 7', 'watch TV'], ['Picture 8', 'get enough sleep'],
        ], { stimulus: picture('media:m0u08-activities.jpg', 'Ex. 4') }),
        match('Cách thư giãn (Ex. 15)', 'Nối tranh 1–5 với cách thư giãn.', [
          ['Picture 1', 'do exercise'], ['Picture 2', 'drink tea'], ['Picture 3', 'read a book'], ['Picture 4', 'do yoga'], ['Picture 5', 'go for a walk'],
        ], { stimulus: picture('media:m0u08-relax.jpg', 'Ex. 15') }),
        match('Hoạt động thể thao (G&V Ex. 1)', 'Nối tranh 1–6 với hoạt động.', [
          ['Picture 1', 'go cycling'], ['Picture 2', 'do yoga'], ['Picture 3', 'play tennis'], ['Picture 4', 'play basketball'], ['Picture 5', 'go for a walk'], ['Picture 6', 'do exercise'],
        ], { stimulus: picture('media:m0u08-gv.jpg', 'G&V Ex. 1') }),
        gap('Động từ đi kèm (G&V Ex. 2)', 'Điền dạng đúng: get (x3), drink (x2), do (x2), eat, have, join, go (x2), play (x2).', [
          ['It can be expensive to ____ a gym, but they often have a lot of modern equipment.', 'join'],
          ['It is very important to ____ plenty of water whenever you ____ exercise.', ['drink', 'do']],
          ['I ____ lots of fruit and vegetables and ____ yoga twice a week.', ['eat', 'do']],
          ['I like to ____ running in the park so I can ____ some fresh air when I exercise.', ['go', 'get']],
          ['It is a good idea to ____ a personal trainer to ____ advice about living healthily.', ['have', 'get']],
          ['I ____ tennis three times a week and ____ for walks in the park.', ['play', 'go']],
          ['It is important to ____ lots of sleep every night.', 'get'],
          ['When you ____ green tea, it can help you relax.', 'drink'],
          ['Many young people ____ a sport or do exercise at school.', 'play'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: bài luận nêu ý kiến',
      titleEn: 'Reading: an opinion based essay',
      minutes: 45,
      objectives: ['Scan nhanh bài luận tìm các hoạt động được nhắc tới', 'Xác định người viết đồng ý hay phản đối và lý do', 'Làm trắc nghiệm theo chiến lược 5 bước, loại 2 phương án gây nhiễu'],
      theory: [
        card('Skimming & scanning', 'Reading an essay', {
          usage: ['**Skim**: đọc lướt để hiểu ý chính (người viết đồng ý hay phản đối?). **Scan**: đọc lại với tốc độ bình thường, tìm chi tiết cụ thể (TIP 06).', 'Bài luận ý kiến thường có: mở bài (ý kiến của người khác → **However, I disagree…**) → **Firstly** → **Secondly** → **In conclusion**.'],
        }),
        card('Trắc nghiệm: chiến lược 5 bước', 'Answering multiple-choice questions', {
          formula: ['**1** Đọc kỹ câu hỏi. **2** Gạch keyword trong câu hỏi và 3 phương án. **3** Tìm đoạn có thông tin. **4** Gạch các chi tiết liên quan đến từng phương án. **5** Chọn phương án khớp **chính xác**.'],
          usage: ['Chỉ **một** phương án đúng — hai phương án còn lại là **distractor** (gây nhiễu).', 'Ví dụ: "need sports lessons to keep healthy" (A) khớp "These lessons help students keep healthy". B và C là ý của **phụ huynh**, không phải người viết.'],
        }),
      ],
      links: [{ ref: 'reading:M0-U08-R1', title: 'Should students stop sports lessons before exams? (Ex. 6–9)', note: 'Bài luận nêu ý kiến — 5 câu trắc nghiệm A, B, C.' }],
      vocab: [
        ['focus on', 'tập trung vào', 'Parents want them to focus on exam subjects.'],
        ['final term', 'học kỳ cuối', 'in the final school term'],
        ['disagree with', 'không đồng ý với', 'I disagree with these views.'],
        ['encourage', 'khuyến khích', 'Schools need to encourage young people.'],
        ['healthy lifestyle', 'lối sống lành mạnh', 'Follow a healthy lifestyle.'],
        ['regular exercise', 'tập thể dục đều đặn', 'Regular exercise is equally important.'],
        ['overweight', 'thừa cân', 'Many people today are overweight.'],
        ['equally important', 'quan trọng như nhau', 'Exercise is equally important.'],
        ['improve memory', 'cải thiện trí nhớ', 'Exercise improves memory.'],
        ['concentrate', 'tập trung', 'It helps us concentrate better.'],
        ['revise', 'ôn tập', 'students who are revising for exams'],
        ['in conclusion', 'tóm lại', 'In conclusion, I believe that…'],
      ],
      ex: [
        mcq('Đọc lướt bài luận (Ex. 6–7)', 'Đọc nhanh bài luận và trả lời.', [
          ['Which activities from Exercise 4 does the essay talk about?', ['watching TV, going cycling, playing tennis, getting enough sleep', 'yoga, drinking tea, reading', 'basketball, swimming, eating fruit'], 'A'],
          ['Does the writer agree or disagree with the essay question ("Students… should stop sports lessons")?', ['agree', 'disagree'], 'B', '"However, I disagree with these views".'],
          ['What opinion does the writer give?', ['Sports lessons make students healthier and help them feel less stressed.', 'Students should only study maths and science.', 'Sports lessons are too expensive.'], 'A'],
        ], { stimulus: passage(ESSAY, { caption: 'Essay question: Students who are studying for important school exams should stop sports lessons. Discuss.' }) }),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: should / shouldn\'t & have to / don\'t have to',
      titleEn: 'Grammar 1: should / shouldn\'t · Grammar 2: have to / don\'t have to',
      minutes: 45,
      objectives: ['Dùng should / shouldn\'t để khuyên', 'Dùng have to (bắt buộc, quy định) và don\'t have to (không bắt buộc)', 'Đặt câu hỏi: Should I…? Do you have to…?'],
      keyLanguage: [
        'should + V: điều nên làm, lời khuyên · shouldn\'t (should not) + V: điều không nên. Không đổi dạng: He should go (KHÔNG: He shoulds go).',
        'Câu hỏi xin lời khuyên: Should children have sports lessons? (KHÔNG: Children should have…?)',
        'have to / has to + V: quy định, bắt buộc (We have to arrive on time) · don\'t / doesn\'t have to: không bắt buộc, có lựa chọn.',
        'Câu hỏi: Do you have to wear school uniform?',
      ],
      links: [{ grammar: 'modal-verbs', title: 'Modal verbs (should / have to)', note: 'lời khuyên, sự bắt buộc' }],
      ex: [
        mcq('should hay shouldn\'t? (Ex. 10–12)', 'Chọn đáp án đúng.', [
          ['"Children shouldn\'t have sports lessons." — Những phụ huynh này nghĩ học thể thao là ý…', ['good', 'bad'], 'B'],
          ['You ____ eat lots of fruit and vegetables. It is really good for your health.', ['should', 'shouldn\'t'], 'A'],
          ['Don\'t watch TV all day. You ____ only watch around three hours a day.', ['should', 'shouldn\'t'], 'A'],
          ['We ____ sit all day without doing some type of exercise.', ['should', 'shouldn\'t'], 'B'],
          ['I think we ____ all sleep between seven to 10 hours every night.', ['should', 'shouldn\'t'], 'A'],
          ['My friend ____ spend all day on a computer and play more sport instead.', ['should', 'shouldn\'t'], 'B'],
          ['"Children should have more lessons in their exam subjects." — The writer ____ children to have more lessons in their exam subjects.', ['wants', 'doesn\'t want'], 'A', 'should = lời khuyên nên làm → người viết muốn điều đó.'],
          ['"Children should not attend painting and music lessons." — The writer\'s advice for children is ____ to painting and music lessons.', ['to go', 'not to go'], 'B', 'should not = khuyên không nên.'],
        ]),
        mcq('have to hay don\'t have to? (Ex. 18, G&V Ex. 5)', 'Chọn đáp án đúng.', [
          ['We ____ arrive to school on time. It\'s one of the school\'s rules.', ['have to', 'don\'t have to'], 'A'],
          ['The deadline isn\'t until next week, so we ____ do it tonight.', ['have to', 'don\'t have to'], 'B'],
          ['____ play sport at school?', ['You have to', 'Do you have to'], 'B'],
          ['He didn\'t go to school yesterday, so he ____ give the teacher a doctor\'s note.', ['have to', 'has to'], 'B'],
          ['We ____ study languages but my teacher recommends it.', ['don\'t have to', 'doesn\'t have to'], 'A'],
          ['You ____ pass a swimming test to be a lifeguard.', ['have to', 'don\'t have to'], 'A'],
          ['You ____ be fit to do yoga because anyone can try it.', ['have to', 'don\'t have to'], 'B'],
          ['You ____ spend a lot of money to stay healthy. You can go running in the park for free.', ['have to', 'don\'t have to'], 'B'],
          ['Professional sports players ____ practise for at least three hours a day.', ['have to', 'don\'t have to'], 'A'],
          ['We ____ wear sports clothes during sport lessons otherwise we can\'t take part.', ['have to', 'don\'t have to'], 'A', 'otherwise we can\'t take part → bắt buộc.'],
          ['We ____ wear special shoes when we play football. Otherwise, it is difficult to run.', ['have to', 'don\'t have to'], 'A'],
          ['You ____ join the gym to take exercise classes, but they cost less for members.', ['have to', 'don\'t have to'], 'B', 'Không bắt buộc, chỉ rẻ hơn cho hội viên.'],
          ['You ____ be good at sports to stay fit, but regular physical activity is good for you.', ['have to', 'don\'t have to'], 'B'],
        ]),
        gap('Chương trình sức khoẻ trên TV (G&V Ex. 4)', 'Điền should / shouldn\'t + động từ: eat, drink, play, ride, watch, get.', [
          ['Do you know we ____ ____ five glasses of water a day?', ['should', 'drink']],
          ['I always think I ____ ____ more sleep.', ['should', 'get']],
          ['It said we ____ ____ more than two to three hours a day (of TV).', ['shouldn\'t|should not', 'watch']],
          ['You ____ ____ sport at school if you like it. If not, you ____ ____ a bicycle or walk to school.', ['should', 'play', 'should', 'ride']],
          ['We ____ ____ fast food more than once a week.', ['shouldn\'t|should not', 'eat']],
        ]),
        mcq('Câu đúng hay sai? (G&V Ex. 3)', 'Chọn câu đúng.', [
          ['Hỏi xin lời khuyên về ăn uống:', ['What you should eat to be healthy?', 'What should you eat to be healthy?'], 'B'],
          ['Is it a good idea to play computer games for many hours? — No, ____', ['you should play on your computer for so long.', 'you shouldn\'t play on your computer for so long.'], 'B'],
          ['I like doing yoga. ____', ['I think you shouldn\'t try it.', 'I think you should try it.'], 'B'],
          ['Is it important to exercise? — ____', ['Yes, you should exercise for at least 150 minutes a week.', 'Yes, you should to exercise for at least 150 minutes a week.'], 'A', 'Câu trong sách đã đúng: should + động từ nguyên mẫu (không có to).'],
          ['Do you have any other advice about being healthy? — ____', ['I think you should find ways to relax.', 'I think you should finding ways to relax.'], 'A', 'Câu trong sách đã đúng.'],
        ]),
        gap('Quy định ở trường (G&V Ex. 6)', 'Điền has to / have to / doesn\'t have to / don\'t have to.', [
          ['The most important rule is that we ____ turn off our mobile phones before the lesson.', 'have to'],
          ['However, unlike most schools, we ____ wear school uniform every day. We can wear our own clothes.', 'don\'t have to'],
          ['At university, students ____ come into class every morning. It is their choice.', 'don\'t have to'],
          ['If they are going to be late, they ____ send an email to their teacher.', 'have to'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: email khuyên bạn sống khoẻ',
      titleEn: 'Writing: an email to a friend giving advice',
      minutes: 45,
      objectives: ['Đọc email mẫu và tìm các lời khuyên', 'Dùng should / shouldn\'t / have to / don\'t have to để khuyên', 'Viết email 80–100 từ'],
      theory: [
        card('Email cho lời khuyên', 'Giving advice', {
          formula: ['**Hi Alice,**', '**Hoạt động nên làm**: I think it\'s a good idea to… / You should…', '**Cách thư giãn**: You should try… because…', '**Không nên**: You shouldn\'t… · **Không bắt buộc**: You don\'t have to…', '**Vì sao cần sống khoẻ**: Being healthy gives you more energy…', '**Kết**: Take care, + tên'],
          usage: ['Mỗi lời khuyên nên có **lý do** (because…).', 'Viết **đủ 3 ý** của đề, **80–100 từ**.'],
        }),
      ],
      vocab: [
        ['it\'s a good idea to', 'là một ý hay khi', "It's a good idea to play tennis."],
        ['make sure', 'đảm bảo', 'Make sure you get enough sleep.'],
        ['take regular breaks', 'nghỉ giải lao đều đặn', 'Take regular breaks when you study.'],
        ['stay healthy', 'giữ sức khoẻ', 'Playing sport is a good way to stay healthy.'],
        ['give you energy', 'cho bạn năng lượng', 'Being healthy gives you more energy.'],
        ['make you feel good', 'làm bạn thấy dễ chịu', 'Exercise makes you feel good.'],
        ['advice', 'lời khuyên', 'Thanks for asking for my advice.'],
        ['Take care', 'Bảo trọng (kết thư)', 'Take care, Minh'],
      ],
      ex: [
        mcq('Email của Helen (Ex. 19)', 'Đọc email của Helen gửi Alice và trả lời.', [
          ['What activities does Helen say are a good idea?', ['tennis and basketball', 'yoga and swimming', 'computer games'], 'A'],
          ['Which piece of advice uses "don\'t have to"?', ['You don\'t have to study for hours and should try to take regular breaks.', 'You should eat lots of fruit and vegetables.', 'I don\'t think you should play computer games all day.'], 'A'],
          ['Why is it important to stay healthy, according to Helen?', ['It gives you more energy and makes you feel good.', 'It helps you pass exams.', 'It is cheap.'], 'A'],
        ], { stimulus: passage("Hi Alice,\n\nI think it's a good idea to play tennis or basketball. Playing sport is a good way to stay healthy. I don't think you should play computer games all day. You should make sure you get enough sleep every night, between seven and 10 hours. You don't have to study for hours and should try to take regular breaks. You should eat lots of fruit and vegetables and get lots of regular exercise. Being healthy gives you more energy and makes you feel good.\n\nFrom,\nHelen", { caption: 'Email from Helen' }) }),
        write('Viết email khuyên Alice (Ex. 20)', 'Bạn của bạn, Alice, hỏi lời khuyên về cách sống khoẻ. Viết email trả lời (80–100 từ). Trong email: (1) nói Alice có thể làm những hoạt động gì để giữ sức khoẻ; (2) kể các hoạt động lành mạnh và cách thư giãn; (3) nói vì sao cần sống khoẻ. Dùng should / shouldn\'t / have to / don\'t have to.', {
          minWords: 80, maxWords: 115, mustUse: 3,
          targetStructures: ['should', "shouldn't", "don't have to", 'have to', 'because'],
          checklist: ['Các hoạt động giữ sức khoẻ', 'Ít nhất một cách thư giãn', 'Vì sao cần sống khoẻ', 'Dùng should / shouldn\'t và have to / don\'t have to đúng', '80–100 từ, có chào và kết'],
          sampleAnswer: "Hi Alice,\n\nThanks for your email. I think you should go cycling or play badminton after school, because doing sport is the best way to keep fit. You don't have to join an expensive gym – you can go running in the park for free. When you feel stressed, you should try yoga or go for a walk. You shouldn't stay up late on your phone, and you have to get at least eight hours of sleep. It's also important to drink lots of water. Being healthy gives you more energy and helps you study better.\n\nTake care,\nLinh",
          commonErrors: ['should + to V (should to go)', "Nhầm don't have to (không bắt buộc) với mustn't (cấm)"],
        }),
      ],
    },

    listening: {
      title: 'Listening: ý kiến & trắc nghiệm',
      titleEn: 'Listening 1: matching opinions · Listening 2: multiple-choice questions',
      minutes: 50,
      objectives: ['Nghe hội thoại 3 người và nhận ra ai nói ý kiến nào', 'Gạch từ khoá trong từng ý kiến — các ý kiến theo thứ tự bài nghe', 'Nghe 5 người nói về cách thư giãn: nối người với hoạt động, rồi trắc nghiệm'],
      theory: [
        card('Nhận ra ai nói gì', 'Matching opinions to speakers', {
          usage: ['Gạch **từ khoá** trong mỗi ý kiến (too expensive, boring, more fun, outdoors, personal trainer, healthy diet).', 'Các ý kiến **theo thứ tự** của hội thoại (TIP 03).', 'Cẩn thận: hai người có thể nói ý giống nhau — chọn người **nói rõ ràng nhất** ý đó.'],
        }),
        card('Trắc nghiệm có bẫy', 'Multiple-choice questions', {
          usage: ['Đọc kỹ **phần đầu câu hỏi** (TIP 17): người nói có thể nhắc chi tiết giống cả 3 phương án, nhưng chỉ một khớp **chính xác**.', 'VD Mike: 20 phút là đủ để khoẻ hơn; 1 tiếng là giờ nghỉ trưa; thực tế anh ấy dành **nửa tiếng** (30 phút).'],
        }),
      ],
      links: [
        { ref: 'listening:M0-U08-L1', title: 'Sarah, Tom & Samantha — Part 1 (Ex. 2)', note: 'Tom định đi đâu? Sarah đang nghĩ đến việc gì?' },
        { ref: 'listening:M0-U08-L2', title: 'Gym hay tập ngoài công viên? — Part 2 (Ex. 3)', note: 'Ai nói ý kiến nào: Samantha, Tom hay Sarah?' },
        { ref: 'listening:M0-U08-L3', title: '5 người nói về cách thư giãn (Ex. 16–17)', note: 'Nối người với hoạt động, rồi trả lời 5 câu trắc nghiệm.' },
      ],
      vocab: [
        ['equipment', 'thiết bị, dụng cụ', 'The gym has really great equipment.'],
        ['student discount', 'giảm giá cho sinh viên', 'that\'s with a student discount'],
        ['membership', 'thẻ hội viên', 'a gym membership'],
        ['for free', 'miễn phí', 'You can exercise in the park for free.'],
        ['encourage', 'khuyến khích, thúc đẩy', 'It encourages me to work harder.'],
        ['worth the money', 'đáng đồng tiền', "I think that it's worth the money."],
        ['mood', 'tâm trạng', 'Reading can change your mood.'],
        ['worries', 'nỗi lo lắng', 'A good novel can make you forget your worries.'],
        ['benefits', 'lợi ích', 'You don\'t have to spend a long time to feel the benefits.'],
        ['breathe deeply', 'hít thở sâu', 'Yoga helps you breathe deeply.'],
        ['deal with', 'giải quyết', 'Nature helps me deal with my problems.'],
        ['calm / calmer', 'bình tĩnh / bình tĩnh hơn', 'Green tea makes me feel calmer.'],
      ],
      ex: [
        mcq('Từ khoá trong ý kiến (Ex. 3)', 'Chọn từ khoá quan trọng nhất trong mỗi ý kiến.', [
          ['Joining the gym is too expensive.', ['gym', 'too expensive'], 'B'],
          ['Running is a boring way to exercise.', ['running', 'boring'], 'B'],
          ['It is better to exercise outdoors.', ['better', 'outdoors'], 'B'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: mô tả tranh & cho lời khuyên',
      titleEn: 'Speaking: describing a picture',
      minutes: 40,
      objectives: ['Mô tả tranh theo trình tự: chung → chi tiết → ý kiến', 'Dùng It looks like…, I think + hiện tại tiếp diễn', 'Cho lời khuyên với should / shouldn\'t, nói 1–2 phút'],
      images: ['media:m0u08-boy.jpg|Ex. 13 (tr. 96): cậu bé trong phòng ngủ', 'media:m0u08-pictures.jpg|Ex. 14 (tr. 97): hai bức tranh để mô tả'],
      theory: [
        card('Mô tả tranh + cho lời khuyên', 'Describing a picture', {
          formula: ['**1. Nói chung**: This picture shows… / In this picture, I can see… / There is / are…', '**2. Chi tiết**: It looks like… / I think + hiện tại tiếp diễn (I think the boy is playing…)', '**3. Ý kiến + lý do + lời khuyên**: I think… because… He/She should / shouldn\'t…'],
          usage: ['Dùng từ vựng về sức khoẻ của unit.', 'Nói 1–2 phút.'],
        }),
      ],
      vocab: [
        ['This picture shows', 'Bức tranh này cho thấy', 'This picture shows a boy in his bedroom.'],
        ['It looks like', 'Có vẻ như', 'It looks like the boy is tired.'],
        ['bed time', 'giờ đi ngủ', 'It is bed time.'],
        ['busy', 'bận rộn', 'The woman looks very busy.'],
        ['take a break', 'nghỉ ngơi một chút', 'She should take a break.'],
        ['healthy snack', 'món ăn vặt lành mạnh', 'He is eating a healthy snack.'],
      ],
      ex: [
        order('Sắp xếp phần mô tả tranh (Ex. 13)', 'Sắp xếp các chữ cái theo đúng trình tự mô tả: chung → chi tiết → ý kiến. (A: lời khuyên · B: chi tiết · C: mô tả chung)', [
          ['C B A', 'C "The picture shows a boy in his bedroom…" (chung) → B "I think the boy is playing on his computer at night…" (chi tiết) → A "I think the boy should go to sleep…" (ý kiến + lời khuyên).'],
        ], { stimulus: picture('media:m0u08-boy.jpg', 'Ex. 13') }),
        speak('Nói: mô tả tranh và khuyên (Ex. 14)', 'Nhìn hai bức tranh (người đàn ông ăn rau quả; người phụ nữ làm việc bận rộn). Nói 1–2 phút: mô tả chung, chi tiết, ý kiến và lời khuyên với should / shouldn\'t.', 2, [
          ['Describe the two pictures. Talk generally about what you can see, give specific details, give your opinion and reasons, and give advice using should / shouldn\'t.', 'The first picture shows a man sitting at a table with a plate of fruit and vegetables. It looks like he is thinking about what to eat. I think he is trying to eat healthily, which is a good idea because fruit and vegetables give you lots of energy. Maybe he should also drink more water. In the second picture, I can see a woman in an office. There are lots of books and papers on her desk, and it looks like she is very busy and stressed. I think she is working very long hours. In my opinion, she shouldn\'t work all day without a break. She should go for a short walk or do some exercise, because that helps you feel less stressed. She should also get enough sleep.', 'Hai tranh, mỗi tranh đi đủ 3 bước; có lý do (because) và lời khuyên (should / shouldn\'t).'],
        ], { stimulus: picture('media:m0u08-pictures.jpg', 'Ex. 14') }),
        speak('Nói: giữ sức khoẻ (Lead-in, Ex. 5)', 'Trả lời từng câu hỏi trong 15–25 giây.', 1, [
          ['How do you like to keep healthy?', 'I usually go cycling with my friends twice a week, and I try to eat lots of vegetables. I also drink a lot of water, especially when the weather is hot.', 'Hai–ba cách + tần suất.'],
          ['Imagine you have important exams and feel stressed. Which activities would help? Why?', 'I think going for a walk would help, because fresh air helps you think clearly. I would also make sure I get enough sleep, because it\'s difficult to remember anything when you\'re tired.', 'Hai hoạt động + lý do.'],
          ['What is your favourite way to relax?', 'My favourite way to relax is listening to music in my room. It helps me forget about my worries, and after twenty minutes I usually feel much calmer.', 'Cách thư giãn + tác dụng.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 8: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 8',
      minutes: 25,
      objectives: ['Ôn should / have to và các cụm từ sức khoẻ'],
      ex: [
        gap('Lời khuyên chơi tennis (G&V Ex. 7)', 'Điền should / shouldn\'t.', [
          ['I enjoy playing tennis but I want to improve. What ____ I do?', 'should'],
          ['My advice is you ____ practise as much as possible.', 'should'],
          ['I suggest you ____ train more often.', 'should'],
          ['I know I ____ have rest days when I don\'t practise.', 'should'],
          ['Maybe not every day, but you ____ just play twice a week – that\'s not enough.', 'shouldn\'t|should not'],
          ['I think you ____ have tennis lessons.', 'should'],
        ]),
        match('Nối nửa câu (G&V Ex. 8)', 'Nối hai nửa câu.', [
          ['It is a good idea to pay', 'for a personal trainer.'], ['Joining the gym', 'can be expensive.'], ['It is more fun when you go', 'running with other people.'],
          ['It is important to follow', 'a healthy diet.'], ['I think it\'s better to do', 'yoga than go to the gym.'], ['Running is a', 'great way to keep fit.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U08-R1',
      title: 'Mindset 0 · Unit 8 — Should students stop sports lessons?',
      content: '<p><strong>Essay question:</strong> <em>Students who are studying for important school exams should stop sports lessons. Discuss.</em></p>\n\n' + ESSAY.split(/\n\s*\n/).map((p) => '<p>' + p + '</p>').join('\n\n'),
      questionGroups: [
        qMcq(1, 'Read the essay and use the exam strategy to answer the multiple-choice questions. Choose the best option, A, B or C.', [
          ['The writer believes that children who have important exams', ['need sports lessons to keep healthy.', "don't need to focus on exam subjects more.", 'need to spend more time studying.'], 'A', 'Đoạn 1: "I disagree with these views, and believe that children should continue to have sports lessons. These lessons help students keep healthy" → A. B, C là ý của phụ huynh.'],
          ['The writer says many young people prefer to spend their free time', ['riding their bikes.', 'in the park.', 'in front of their computers.'], 'C', 'Đoạn 2: "They prefer to spend their free time indoors on their computers or watching TV than going to the park… or going cycling" → C. A, B là những việc họ KHÔNG chọn.'],
          ['The writer thinks that exercise for young people is', ['less important than diet.', 'just as important as diet.', 'more important than diet.'], 'B', 'Đoạn 2: "people often forget that regular exercise is **equally important**" = just as important → B.'],
          ['The writer believes regular exercise can make people feel', ['more active.', 'less stressed.', 'more tired at night.'], 'B', 'Đoạn 3: "exercise helps us feel less stressed and tired" → B. Exercise giúp ngủ ngon hơn, không làm mệt hơn (C sai).'],
          ['The writer thinks that exercising', ['benefits the body and the mind.', 'can affect studying in a negative way.', 'will help you get better exam results.'], 'A', 'Kết luận: "regular exercise is good for their body and mind" → A. C: bài chỉ nói "**may** even help" → không chắc chắn.'],
        ], 'Questions 1–5'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U08-L1', title: 'Mindset 0 · Unit 8 — Three friends (Part 1)', description: 'Samantha, Tom and Sarah meet in the street.',
      partNumber: 1, audioFile: 'MindsetIELTS_Foundation_14.mp3', transcript: PART1,
      questionGroups: [
        qFill(1, 'Listen to the first part of the conversation and answer the questions. Write NO MORE THAN THREE WORDS.', [
          ['Where does Tom plan to go?', 'to the sports centre / the sports centre / sports centre', lx('Tom định đi đâu?', 'Câu trả lời đầu tiên của Tom.', "I'm going to the sports centre", 'the sports centre.')],
          ['What is Sarah thinking of doing?', 'joining the gym / join the gym', lx('Sarah đang nghĩ đến việc gì?', 'Câu của Sarah.', "I'm thinking of joining the gym there", 'joining the gym.')],
        ], 'Questions 1–2'),
      ],
    },
    {
      ref: 'M0-U08-L2', title: 'Mindset 0 · Unit 8 — Gym or park? (Part 2)', description: 'The three friends discuss the gym, exercising in the park and personal trainers.',
      partNumber: 1, audioFile: 'MindsetIELTS_Foundation_15.mp3', transcript: PART2,
      questionGroups: [
        qMatch(1, 'Who gave each opinion? Choose A Samantha, B Tom or C Sarah. (Example: Joining the gym is too expensive. → Samantha)', ['Samantha', 'Tom', 'Sarah'], [
          ['Running is a boring way to exercise.', 'B', lx('Chạy bộ là cách tập nhàm chán.', 'Sau phần nói về giá gym.', "I've tried running in the park, but it was really boring!", 'Tom.')],
          ['It is more fun to exercise with other people.', 'C', lx('Tập cùng người khác vui hơn.', 'Ngay sau Tom.', ["I prefer to exercise with friends because it encourages me to work harder", "it's much more fun than exercising alone"], 'Tom nói tập với bạn giúp cố gắng hơn; Sarah mới nói "more fun" → Sarah.')],
          ['It is better to exercise outdoors.', 'A', lx('Tập ngoài trời tốt hơn.', 'Giữa bài.', 'Exercising outside is better because you get lots of fresh air', 'Samantha.')],
          ['It is a good idea to pay for a personal trainer.', 'A', lx('Thuê huấn luyện viên cá nhân là ý hay.', 'Sau câu hỏi về giá.', "It is expensive, but I think that it's worth the money", 'Samantha (trả £20/giờ và cho là đáng).')],
          ['It is important to follow a healthy diet.', 'C', lx('Ăn uống lành mạnh là quan trọng.', 'Gần cuối.', 'I know that a healthy diet helps you get fit', 'Sarah.')],
        ], { title: 'Questions 1–5', reuse: true, optionsTitle: 'Speakers', type: 'matching' }),
      ],
    },
    {
      ref: 'M0-U08-L3', title: 'Mindset 0 · Unit 8 — How do you relax?', description: 'Five people talk about their favourite way to relax.',
      partNumber: 1, audioFile: 'MindsetIELTS_Foundation_16.mp3', transcript: RELAX,
      questionGroups: [
        qMatch(1, 'Listen and match the speakers with the activities.', ['read a book', 'do yoga', 'do exercise', 'go for a walk', 'drink tea'], [
          ['Jim', 'A', lx('Jim', 'Người nói thứ nhất.', 'When I need to relax, I usually read a book', 'read a book.')],
          ['Elena', 'B', lx('Elena', 'Người nói thứ hai.', 'doing yoga is the best way to relax', 'do yoga.')],
          ['Kate', 'C', lx('Kate', 'Người nói thứ ba.', 'doing regular exercise is the best way to relax', 'do exercise.')],
          ['Mike', 'D', lx('Mike', 'Người nói thứ tư.', 'I go straight outdoors for a walk in the park', 'go for a walk.')],
          ['Mark', 'E', lx('Mark', 'Người nói cuối.', 'make myself a cup of tea', 'drink tea.')],
        ], { title: 'Questions 1–5', optionsTitle: 'Activities', type: 'matching' }),
        qMcq(6, 'Listen again and choose the correct answer, A, B or C.', [
          ['Jim thinks that people who feel sad shouldn\'t', ['forget about their problems.', 'read a funny book.', 'read a sad book.'], 'C', lx('Jim nghĩ người đang buồn không nên…', 'Cuối phần Jim.', "If you're feeling sad, you shouldn't read a sad story though", 'C. Truyện vui (B) thì NÊN đọc.')],
          ['Elena thinks that if you want to do yoga, you should', ['do it at your own home.', 'find the right teacher.', 'not pay lots of money.'], 'B', lx('Elena nghĩ nếu muốn tập yoga, bạn nên…', 'Cuối phần Elena.', "You have to find a good teacher though – that's really important", 'B. Chuyện giá rẻ chỉ là thông tin thêm.')],
          ['According to Kate, a common reason for not doing regular exercise is', ['it takes too much time.', 'it is too expensive.', 'it will make a person tired.'], 'A', lx('Theo Kate, lý do phổ biến khiến người ta không tập đều là…', 'Giữa phần Kate.', "Often a person's reason for not doing regular exercise is they don't have enough time", 'A.')],
          ['How much time does Mike usually spend outside on his lunch break?', ['20 minutes', '30 minutes', '60 minutes'], 'B', lx('Mike thường dành bao lâu ngoài trời giờ nghỉ trưa?', 'Phần Mike.', ['Being active for just twenty minutes outside is enough', 'I try to spend half an hour every day exercising during my lunch break', "I can't spend the whole hour outside"], '20 phút là "đủ" (nói chung); cả tiếng là không thể → half an hour = 30 phút → B.')],
          ['Which does Mark do to help him relax?', ['He drinks some green tea.', 'He has a cup of tea before bed.', 'He tries to get enough sleep.'], 'A', lx('Mark làm gì để thư giãn?', 'Phần Mark.', ['green tea makes me feel calmer than black tea', "You shouldn't drink tea at night"], 'A. Không nên uống trà buổi tối → B sai.')],
        ], 'Questions 6–10'),
      ],
    },
  ],
};
