// Mindset for IELTS Foundation — Unit 7: Jobs, work and study (pp. 80–91)
const { mcq, gap, match, cat, write, speak, passage, picture, card, qNote, qTFNG, lx } = require('../dsl');

const JACK = `Jack: Good evening! Hello, my name's Jack Riley. I worked in a restaurant when I was younger, but now I'm a famous chef. You can listen to my cooking show on Mondays at half past seven. This Wednesday, you can see me on the TV show Before They Were Famous. I'm going to tell you about my life before I became a TV chef. You can see the programme on channel three and they will show it at eight o'clock.
People often ask me how I became so successful, and I tell them that it wasn't always that way. Most of my friends left school when they were eighteen and went to university, but I left school when I was sixteen. At school, I was a really bad student. I only passed my exams in History and French. I couldn't understand maths easily and I couldn't write very well, so I failed my exams in both maths and English.
I always enjoyed trying different foods, especially on holidays in Spain with my family, but I first discovered my love of cooking when I got a summer job working in the kitchen in an Italian restaurant near my home. The chefs there could make these amazing dishes out of really simple ingredients. I wanted to be like them, but I lived in a small village near Cambridge and it wasn't possible to train to be a chef there. I applied for jobs in Rome, but I couldn't speak Italian so in the end, I decided to move to London and train to be a chef.
Today, my career is more successful than I could have ever imagined. I first appeared on TV in The Food Show in 2005, and I started presenting my radio show, Dinner with Jack in 2006. I wrote my first bestselling cookbook, Jack's Best Dishes in 2004. And I worked as head chef at two top London restaurants: The Olive Tree in 2001, and The Lemon Grove between 2002 and 2005. I'm married with two beautiful children – and my third child will be born in December!
When I was 16, I could only cook soup from a tin and I couldn't write a sentence without making lots of mistakes. Now, I can cook over 100 dishes and write books. I can't work for really long hours any more like I did at The Lemon Grove. That was the hardest I have ever worked in my life! And I still can't do maths!`;

const ARTICLE = [
  ['GETTING A SUMMER JOB', 'A summer job will give you the chance to earn money and get some work experience, as well as learn new skills. Many teenagers think that it will be difficult to find a job because they don\'t have as much experience as an adult. However, that\'s not the case at all. Many employers like to give jobs to young people because they have lots of energy and enthusiasm. Before you apply for a job, make a list of the skills you have so you can write them on your application form. Not sure which job would be best for you? Here are some ideas to get you started.'],
  ['BE A SPORTS COACH AT A SUMMER CAMP', 'Can you play football, basketball or tennis? Are you good at teaching people new skills? Then this could be the job for you. Working as a sports coach allows you to spend time outside, play the sports you love and get paid for it! It will give you useful experience of working with young people, which is ideal if you are thinking of doing a teaching course in the future.'],
  ['HELP ELDERLY PEOPLE IN YOUR TOWN', 'Working with elderly people is a really good way of helping others while giving something back to the community. You will help elderly people who can\'t go to the supermarket, so having a car would be very useful. However, if you don\'t there are a lot of other things that you can do. You can help them use computers, clean their homes, do the gardening and simply be there to keep them company. Contact your local care home to find out about opportunities for summer work.'],
  ['WORK IN FASHION', 'How about working in a designer clothes store during your summer holiday? There are plenty of opportunities to use a variety of skills. You can use your fashion knowledge to help people choose the right outfit or use your knowledge of technology to show people how the latest designer smart watch works. This type of job is often very sociable as sales assistants will need to speak to customers and with other members of staff. It is a good opportunity to work as part of a team.'],
  ['BE A LIFEGUARD AT YOUR LOCAL SWIMMING POOL', 'Being a lifeguard is an excellent choice if you want to become more confident and develop your decision-making skills. To get a job as a lifeguard, you need to take a swimming test and get a certificate. You also need to do a short training course. In the summer months, local swimming pools are often busier and are open for longer, so there will be a lot of lifeguard jobs available, but you might have to work long hours on some days of the week.'],
  ['LEARN TO BE A DIGITAL DESIGNER', 'Are you interested in computers and learning how to design computer games? You probably won\'t be able to find a job in an IT company, but many of them have training programmes for young people during the summer holidays where they can learn a wide range of IT skills. This is a great choice for anyone who is thinking of studying a computer-related course at university. These courses and jobs are very popular these days, so it will definitely be useful to get some experience!'],
];

module.exports = {
  n: 7,
  title: 'Jobs, work and study',
  titleVi: 'Công việc & học tập',
  pages: '80–91',
  outcomes: [
    'Nói về kỹ năng, khả năng và kinh nghiệm làm việc',
    'Dùng can / can\'t / could / couldn\'t cho khả năng hiện tại và quá khứ',
    'Nghe điền ghi chú (số, ngày, tên, năm)',
    'Đọc lướt và làm True / False / Not Given theo chiến lược 5 bước',
    'Viết email ứng tuyển việc làm hè 60–80 từ',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: kỹ năng & công việc',
      titleEn: 'Lead-in · Vocabulary: skills and abilities · work experience',
      minutes: 35,
      objectives: ['Gọi tên 10 kỹ năng (write well, read a map, do well in exams…)', 'Gọi tên các công việc làm hè và nghề nghiệp', 'Phân biệt skills (học được) và abilities (khả năng)'],
      images: ['media:m0u07-leadin.jpg|Lead-in (tr. 80): helping the elderly, wearing a uniform, meeting, studying', 'media:m0u07-skills.jpg|Ex. 2 (tr. 81): kỹ năng & khả năng'],
      theory: [
        card('Kỹ năng và khả năng', 'Skills and abilities', {
          usage: [
            '**Skills** là những thứ bạn **học** được; **abilities** có thể học được hoặc vốn có sẵn — trong unit này coi như cùng nghĩa (TIP 02).',
            'Cụm thường gặp: **write well**, **talk to new people easily**, **read a map**, **play sport well**, **cook many types of food**, **work for long hours**, **understand maths easily**, **speak many languages**, **remember a lot of information**, **do well in exams**.',
          ],
          examples: [['I can talk to new people easily.', 'Tôi có thể nói chuyện với người lạ dễ dàng.'], ['I couldn\'t understand maths easily at school.', 'Hồi đi học tôi không hiểu toán dễ dàng.']],
        }),
      ],
      vocab: [
        ['skill', 'kỹ năng', 'What are your best skills?'],
        ['ability', 'khả năng', 'Skills and abilities are very similar.'],
        ['write well', 'viết tốt', 'Jack couldn\'t write well at school.'],
        ['talk to new people easily', 'dễ dàng nói chuyện với người lạ', 'I can talk to new people easily.'],
        ['read a map', 'đọc bản đồ', 'Lucy is lost – she can\'t read maps very well.'],
        ['work long hours', 'làm việc nhiều giờ', 'Lifeguards might work long hours.'],
        ['understand maths easily', 'hiểu toán dễ dàng', 'He couldn\'t understand maths easily.'],
        ['remember a lot of information', 'nhớ nhiều thông tin', 'I can remember a lot of information.'],
        ['do well in exams', 'làm bài thi tốt', 'Jim can just do very well in exams.'],
        ['wear a uniform', 'mặc đồng phục', 'Firefighters wear a uniform.'],
        ['the elderly', 'người cao tuổi', 'She is helping the elderly.'],
        ['lifeguard', 'nhân viên cứu hộ', 'My brother is a lifeguard at the swimming pool.'],
        ['sales assistant', 'nhân viên bán hàng', 'Sales assistants speak to customers.'],
        ['sports coach', 'huấn luyện viên thể thao', 'Be a sports coach at a summer camp.'],
        ['receptionist', 'lễ tân', 'I\'m interested in the hotel receptionist job.'],
        ['work experience', 'kinh nghiệm làm việc', 'A summer job gives you work experience.'],
        ["cleaner","nhân viên dọn dẹp","The cleaner cleans the hotel rooms every morning."],
        ["guest","khách (khách sạn)","The hotel has 200 guests this week."],
        ["cash desk","quầy thu ngân","Please pay at the cash desk."],
        ["changing room","phòng thử đồ","You can try on the clothes in the changing room."],
        ["lift","thang máy","Take the lift to the fifth floor."],
      ],
      ex: [
        match('Họ đang làm gì? (Lead-in Ex. 1)', 'Nối ảnh 1–4 với hoạt động.', [
          ['Photo 1', 'meeting'], ['Photo 2', 'studying'], ['Photo 3', 'helping the elderly'], ['Photo 4', 'wearing a uniform'],
        ], { stimulus: picture('media:m0u07-leadin.jpg', 'Lead-in') }),
        match('Kỹ năng trong tranh (Ex. 2)', 'Nối tranh 1–10 với kỹ năng.', [
          ['Picture 1', 'write well'], ['Picture 2', 'remember a lot of information'], ['Picture 3', 'work for long hours'], ['Picture 4', 'play sport well'], ['Picture 5', 'understand maths easily'],
          ['Picture 6', 'talk to new people easily'], ['Picture 7', 'do well in exams'], ['Picture 8', 'speak many languages'], ['Picture 9', 'cook many types of food'], ['Picture 10', 'read a map'],
        ], { stimulus: picture('media:m0u07-skills.jpg', 'Ex. 2') }),
        match('Việc làm hè (Ex. 12)', 'Nối ảnh 1–5 với công việc.', [
          ['Photo 1', 'video game designer'], ['Photo 2', 'helping elderly people'], ['Photo 3', 'sports coach'], ['Photo 4', 'lifeguard'], ['Photo 5', 'sales assistant'],
        ], { stimulus: picture('media:m0u07-summerjobs.jpg', 'Ex. 12') }),
        match('Nghề nghiệp (G&V Ex. 3)', 'Nối tranh 1–8 với nghề.', [
          ['Picture 1', 'receptionist'], ['Picture 2', 'doctor'], ['Picture 3', 'waiter'], ['Picture 4', 'teacher'], ['Picture 5', 'lifeguard'], ['Picture 6', 'shop assistant'], ['Picture 7', 'cleaner'], ['Picture 8', 'chef'],
        ], { stimulus: picture('media:m0u07-jobs.jpg', 'G&V Ex. 3') }),
        cat('Nhà hàng, khách sạn hay cửa hàng? (G&V Ex. 6)', 'Xếp từ vào nơi làm việc phù hợp.', { r: 'Restaurant', h: 'Hotel', s: 'Shop' }, [
          ['waiter', 'r'], ['tables', 'r'], ['chef', 'r'], ['meal', 'r'],
          ['receptionist', 'h'], ['rooms', 'h'], ['guests', 'h'], ['lift', 'h'], ['cleaner', 'h'],
          ['cash desk', 's'], ['clothes', 's'], ['changing rooms', 's'], ['shop assistant', 's'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: True / False / Not Given — Summer jobs',
      titleEn: 'Reading 1: true, false, not given',
      minutes: 50,
      objectives: ['Đọc lướt (skim) trong 2 phút để nắm ý chính', 'Áp dụng chiến lược 5 bước cho True / False / Not Given', 'Nhận ra từ đồng nghĩa: young people = teenagers'],
      theory: [
        card('Chiến lược 5 bước: True / False / Not Given', 'Exam strategy', {
          formula: [
            '**1.** Đọc **thật kỹ** câu hỏi.',
            '**2.** Gạch **từ khoá**: Helen Green thinks that it is **difficult** for **young people** to **find a summer job**.',
            '**3.** Tìm **đoạn** trong bài có thông tin về câu đó.',
            '**4.** Scan tìm từ khoá — để ý **từ đồng nghĩa**: young people = **teenagers**.',
            '**5.** Quyết định: khớp → TRUE · ngược lại → FALSE · không đề cập → NOT GIVEN.',
          ],
          usage: ['Câu ví dụ: bài nói "Many teenagers think that it will be difficult… However, **that\'s not the case at all**" — đó là ý của teenagers, Helen Green **phản đối** → đáp án sách cho là **Not Given** đối với ý kiến "Helen Green thinks it is difficult".', 'TIP 15: nếu thông tin **chính xác** trong câu không được nhắc tới → NOT GIVEN.'],
        }),
      ],
      links: [{ ref: 'reading:M0-U07-R1', title: 'Summer Jobs — bài báo của Helen Green (Ex. 13–16)', note: '8 câu True / False / Not Given. Đọc lướt 2 phút trước, rồi áp dụng chiến lược 5 bước.' }],
      vocab: [
        ['careers advisor', 'chuyên viên tư vấn nghề nghiệp', 'Helen Green is a careers advisor.'],
        ['earn money', 'kiếm tiền', 'A summer job gives you the chance to earn money.'],
        ['employer', 'nhà tuyển dụng', 'Many employers like young people.'],
        ['enthusiasm', 'sự nhiệt tình', 'Young people have lots of energy and enthusiasm.'],
        ['apply for a job', 'nộp đơn xin việc', 'Before you apply for a job, make a list of your skills.'],
        ['application form', 'mẫu đơn xin việc', 'Write your skills on your application form.'],
        ['give something back to the community', 'đóng góp cho cộng đồng', 'Helping elderly people gives something back to the community.'],
        ['keep somebody company', 'ở bên, bầu bạn với ai', 'Simply be there to keep them company.'],
        ['care home', 'viện dưỡng lão', 'Contact your local care home.'],
        ['outfit', 'bộ trang phục', 'Help people choose the right outfit.'],
        ['work as part of a team', 'làm việc nhóm', 'It is a good opportunity to work as part of a team.'],
        ['confident', 'tự tin', 'Being a lifeguard helps you become more confident.'],
        ['decision-making skills', 'kỹ năng ra quyết định', 'Develop your decision-making skills.'],
        ['certificate', 'chứng chỉ', 'You need to get a certificate.'],
        ['training programme', 'chương trình đào tạo', 'IT companies have training programmes.'],
      ],
      ex: [
        mcq('Đọc lướt bài báo (Ex. 13–14)', 'Đọc nhanh phần giới thiệu và bài báo, trả lời câu hỏi.', [
          ['What does a careers advisor do?', ['gives people advice about jobs and careers', 'finds jobs for teachers', 'teaches IT skills'], 'A'],
          ['What will Helen Green do in this article?', ['explain how young people can use their summer holiday to get useful work experience', 'tell her life story', 'advertise her company'], 'A'],
          ['Why is it good for young people to get a summer job?', ['They earn money, get work experience and learn new skills.', 'They don\'t need to go to university.', 'They can travel abroad.'], 'A'],
          ['How many different types of summer jobs does Helen Green write about?', ['three', 'four', 'five'], 'C', 'Sports coach, helping elderly people, fashion, lifeguard, digital designer.'],
        ], { stimulus: passage(ARTICLE[0][1], { caption: 'Summer Jobs — introduction' }) }),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: can / can\'t / could / couldn\'t',
      titleEn: 'Grammar: can / can\'t / could / couldn\'t',
      minutes: 35,
      objectives: ['Dùng can / can\'t cho khả năng ở hiện tại', 'Dùng could / couldn\'t cho khả năng ở quá khứ', 'Đặt câu hỏi: Can you…? Could you…? và trả lời ngắn'],
      keyLanguage: [
        'Hiện tại: can / can\'t (cannot) + V nguyên mẫu — I can cook many types of food. I can\'t work long hours.',
        'Quá khứ: could / couldn\'t (could not) + V — When I was 16, I could only cook soup. I couldn\'t write well.',
        'Câu hỏi: Can you read a map? What sports can you play? · Could you read a map (when you were young)?',
        'Trả lời ngắn: Yes, I can. / No, I can\'t. — Yes, I could. / No, I couldn\'t.',
      ],
      links: [{ grammar: 'modal-verbs', title: 'Modal verbs (can / could)', note: 'khả năng hiện tại và quá khứ' }],
      ex: [
        cat('Jack Riley: xưa và nay (Ex. 7)', 'Xếp các khả năng của đầu bếp Jack vào đúng ô.', { can: 'can (now)', cant: "can't (now)", could: 'could (past)', couldnt: "couldn't (past)" }, [
          ['write books', 'can'], ['cook many types of food', 'can'], ['work long hours', 'cant'],
          ['cook only one type of food', 'could'], ['understand maths easily', 'couldnt'], ['write well', 'couldnt'], ['do well in exams', 'couldnt'],
        ]),
        gap('Hội thoại về kỹ năng (Ex. 8)', 'Điền can / can\'t / could / couldn\'t.', [
          ['Well, I have a good memory. I ____ remember lots of information.', 'can'],
          ['No, not really. I ____ really play sport that well.', 'can\'t|cannot'],
          ['When I was younger, I ____ play badminton a little bit, but I stopped because I found it boring.', 'could'],
          ['When I was a child, I ____ talk to new people at all.', 'couldn\'t|could not'],
          ['In the past, I ____ cook anything very well without burning it…', 'couldn\'t|could not'],
          ['…but I\'ve been taking cooking classes and I ____ cook many different types of food.', 'can'],
        ]),
        match('Nối nửa câu (G&V Ex. 1)', 'Nối hai nửa câu.', [
          ['John works many hours, but he doesn\'t mind because he', 'can finish early on Fridays.'],
          ['Julia learnt Spanish very quickly this year. I think it is because she', 'could already speak two other languages.'],
          ['I have improved a lot. I got top marks for my essay, but just a year ago, I', 'couldn\'t even write very well.'],
          ['Jim\'s results are really impressive and he didn\'t even study that much. He', 'can just do very well in exams.'],
          ['In the job interview, it\'s important that you don\'t forget anything.', 'Can you remember a lot of information?'],
          ['Matteo will become a chef one day, I think. He', 'can cook many types of food.'],
          ['Sandra is very popular and has so many friends. It\'s difficult to believe that she', 'couldn\'t even talk to new people easily a few months ago.'],
          ['I know it is simple but I need to use my calculator because I', 'can\'t understand maths very easily.'],
          ['Joseph is really good at football, tennis and basketball.', 'Could he play sport well when he was a child, too?'],
          ['Lucy is late. I think she is lost. She', 'can\'t read maps very well.'],
        ]),
        mcq('Hỏi và trả lời với can (G&V Ex. 7–8)', 'Chọn đáp án đúng.', [
          ['A: ____ play sport?', ['You can', 'You can\'t', 'Can you'], 'C'],
          ['B: Yes, ____ play basketball.', ['I can', 'I can\'t', 'can I'], 'A'],
          ['A: Not really, ____ play many sports, but I like watching them on TV.', ['I can', 'I can\'t', 'can I'], 'B'],
          ['B: How many languages ____ speak?', ['you can', 'you can\'t', 'can you'], 'C'],
          ['I got top marks for my English essay. I think it\'s because I ____ write really well.', ['can', 'can\'t', 'couldn\'t'], 'A'],
          ['I was so nervous last year in my science exam that I ____ remember a thing.', ['can\'t', 'couldn\'t', 'could'], 'B'],
          ['A: Four. ____ speak English, Russian, Chinese and Thai.', ['I can', 'I can\'t', 'can I'], 'A', 'Câu khẳng định trả lời câu hỏi → I can.'],
          ['I got a bad mark in my exams. My problem is that I ____ remember facts.', ['can', 'can\'t', 'could'], 'B', 'Vấn đề ở hiện tại → can\'t.'],
          ['I did really badly in my history exam last summer. I didn\'t do enough homework so I ____ understand the subject very well.', ['can', 'could', 'couldn\'t'], 'C', 'last summer → quá khứ → couldn\'t.'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: email xin việc làm hè',
      titleEn: 'Writing: an email for a summer job',
      minutes: 45,
      objectives: ['Đọc đề và biết phải viết đủ 3 ý', 'Đánh giá email mẫu theo bảng tiêu chí', 'Viết email 60–80 từ, dùng đúng can/could'],
      theory: [
        card('Email ứng tuyển việc làm hè', 'An email for a summer job', {
          formula: ['**Dear Simon,**', '**Ý 1** — I\'m interested in the… job.', '**Ý 2** — kỹ năng hiện có: I can… / I\'m good at…', '**Ý 3** — kỹ năng trước đây chưa có nhưng giờ đã có: When I was younger, I couldn\'t…, but now I can…', '**Kết lịch sự**: Thank you for reading my email. / Best wishes, + tên'],
          usage: ['Viết **đủ 3 ý**, **không thêm** thông tin ngoài đề (email của Laura kể thêm kinh nghiệm làm nhà hàng → thừa).', 'Đúng **60–80 từ**; có thể chia đoạn cho từng ý.', 'Kiểm tra can/could: Laura viết "I **could** talk to new people easily" (sai — hiện tại phải là **can**).'],
        }),
      ],
      vocab: [
        ['Dear …,', 'Kính gửi … (mở đầu thư)', 'Dear Simon,'],
        ['I\'m interested in', 'tôi quan tâm đến', "I'm interested in the lifeguard job."],
        ['apply', 'ứng tuyển', 'I would like to apply for the job.'],
        ['co-ordinator', 'điều phối viên', 'Simon Stone, summer job co-ordinator.'],
        ['I\'m good at', 'tôi giỏi', "I'm good at teaching people new skills."],
        ['when I was younger', 'khi tôi còn nhỏ', "When I was younger, I couldn't swim."],
        ['improve', 'cải thiện', 'My cooking skills have improved a lot.'],
        ['Thank you for reading', 'cảm ơn đã đọc', 'Thank you for reading my email.'],
        ['shy', 'nhút nhát', "I'm still quite shy."],
        ['hard-working', 'chăm chỉ', 'You should be hard-working.'],
      ],
      ex: [
        cat('Email của Laura có gì? (Ex. 18–19)', 'Đọc email của Laura (ứng tuyển lễ tân khách sạn). Đặc điểm nào CÓ (đạt) và đặc điểm nào KHÔNG?', { y: 'Có / đạt', n: 'Không / chưa đạt' }, [
          ['She says which job she is interested in.', 'y'], ['She says what skills she has.', 'y'],
          ['She says what skills she didn\'t have in the past but does now.', 'n', 'Laura viết "I can\'t work long hours but I want to learn this" — không phải kỹ năng quá khứ.'],
          ['She uses a good structure – greeting to start the email and ends with her name.', 'y'],
          ['She uses correct and appropriate grammar.', 'n', '"I could talk… I could speak" phải là can (hiện tại).'],
          ['She only talks about the information in the instructions.', 'n', 'Thêm chuyện làm nhà hàng — không được yêu cầu.'],
          ['She uses the correct number of words.', 'y'],
        ], { stimulus: passage('Dear Simon,\n\nI\'m interested in the hotel receptionist job. I think I have good skills to be a hotel receptionist. I could talk to new people easily and I could speak three languages – English, Spanish and Arabic. I can\'t work long hours but I want to learn this. I have a lot of experience. When I was younger, I worked in a restaurant.\n\nThanks,\nLaura', { caption: "Laura's email" }) }),
        mcq('Sửa email của Pablo (G&V Ex. 9)', 'Email của Pablo xin làm cứu hộ. Mỗi câu dùng can/could đúng hay sai?', [
          ['"I could swim very well." (nói về hiện tại)', ['Đúng', 'Sai → I can swim very well.'], 'B'],
          ['"I couldn\'t swim when I was a child but I learnt when I was 12."', ['Đúng', 'Sai'], 'A'],
          ['"I can also remember lots of information and instructions very well."', ['Đúng', 'Sai'], 'A'],
          ['"They could talk to new people easily?"', ['Đúng', 'Sai → Could they talk to new people easily?'], 'B', 'Câu hỏi phải đảo could lên trước chủ ngữ.'],
          ['"I can so I think I am a good choice for this job."', ['Đúng', 'Sai'], 'A'],
        ]),
        write('Viết email xin việc làm hè (Ex. 17, 20–21)', 'Bạn nhận được email về các việc làm hè. Hãy viết email cho Simon Stone (điều phối viên việc làm hè) để ứng tuyển MỘT công việc trong bài báo (sports coach, helping elderly people, fashion sales assistant, lifeguard, digital designer). Trong email: (1) nói bạn quan tâm công việc nào; (2) bạn có những kỹ năng, khả năng gì; (3) kỹ năng nào trước đây bạn chưa có nhưng bây giờ đã có. Viết 60–80 từ, có lời chào và kết thư lịch sự.', {
          minWords: 60, maxWords: 90, mustUse: 3,
          targetStructures: ['Dear Simon', "I'm interested in", 'I can', "couldn't", 'now I can'],
          checklist: ['Nói rõ công việc muốn ứng tuyển', 'Nêu kỹ năng hiện có (can)', 'Nêu kỹ năng trước đây chưa có nhưng nay đã có (couldn\'t… but now I can…)', 'Mở đầu Dear Simon, kết thư lịch sự + tên', 'Không thêm thông tin ngoài đề', '60–80 từ'],
          sampleAnswer: 'Dear Simon,\n\nI\'m interested in the sports coach job at the summer camp.\n\nI can play football and basketball well, and I\'m good at teaching younger children because I often help my little cousins with their homework. I can also work long hours outside.\n\nWhen I was younger, I couldn\'t talk to new people easily because I was very shy. Now I can make friends quickly, so I think I can work well in a team.\n\nBest wishes,\nMai',
          commonErrors: ['Dùng could cho khả năng hiện tại', 'Quên ý 3 (kỹ năng trước chưa có)', 'Kể thêm thông tin không được yêu cầu'],
        }),
      ],
    },

    listening: {
      title: 'Listening: điền ghi chú (note completion)',
      titleEn: 'Listening: note completion extension',
      minutes: 35,
      objectives: ['Đọc ghi chú trước và đoán loại thông tin bị thiếu', 'Nghe số, ngày, giờ, năm, tuổi, tên', 'Viết số bằng chữ số (4 thay vì four) để tránh sai chính tả'],
      theory: [
        card('Dự đoán thông tin trước khi nghe', 'Note completion', {
          formula: ['Đọc lướt ghi chú → với mỗi chỗ trống hỏi: **loại từ gì?** — số (ngày, giờ, năm, tuổi) hay từ (danh từ, tên, tính từ)?', 'Khi nghe, bạn đã biết cần nghe gì (TIP 05).'],
          usage: ['Nếu đáp án là **số**, viết **chữ số** (4, 16, 2004) để tránh sai chính tả.', 'Cẩn thận thông tin gây nhiễu: "cooking show on **Mondays** at half past seven" là chương trình RADIO; chương trình TV Before They Were Famous là **Wednesday** lúc **8:00**.', 'The Lemon Grove **between 2002 and 2005** — 2001 là The Olive Tree.'],
        }),
      ],
      links: [{ ref: 'listening:M0-U07-L1', title: 'Before They Were Famous — Jack Riley (Ex. 4–5)', note: 'Hoàn thành 14 ô ghi chú về cuộc đời đầu bếp Jack Riley.' }],
      vocab: [
        ['advertisement', 'quảng cáo', 'Listen to a radio advertisement.'],
        ['channel', 'kênh (TV)', 'You can see the programme on channel three.'],
        ['leave school', 'rời trường, nghỉ học', 'I left school when I was sixteen.'],
        ['pass / fail an exam', 'đỗ / trượt kỳ thi', 'I failed my exams in maths and English.'],
        ['discover', 'khám phá ra', 'I discovered my love of cooking.'],
        ['ingredient', 'nguyên liệu', 'amazing dishes out of simple ingredients'],
        ['apply for', 'nộp đơn xin', 'I applied for jobs in Rome.'],
        ['train to be', 'học để trở thành', 'I decided to train to be a chef in London.'],
        ['career', 'sự nghiệp', 'My career is very successful.'],
        ['present a show', 'dẫn chương trình', 'I started presenting my radio show in 2006.'],
        ['bestselling', 'bán chạy nhất', 'my first bestselling cookbook'],
        ['head chef', 'bếp trưởng', 'I worked as head chef at two restaurants.'],
      ],
      ex: [
        mcq('Đoán loại thông tin (Ex. 4)', 'Trước khi nghe: mỗi chỗ trống trong ghi chú cần loại thông tin gì?', [
          ['Day: ____', ['a day of the week', 'a number', 'a name'], 'A'],
          ['Time: ____', ['a time', 'a year', 'an age'], 'A'],
          ['left school at the age of ____', ['a year', 'an age (number)', 'a place'], 'B'],
          ['trained to be a chef in ____', ['a place (city)', 'a time', 'a job'], 'A'],
          ['wrote his first bestselling cookbook in ____', ['a year', 'a name', 'a day'], 'A'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: nói về kỹ năng & khả năng',
      titleEn: 'Speaking: describing skills and abilities',
      minutes: 35,
      objectives: ['Hỏi và trả lời về kỹ năng hiện tại và trước đây', 'Thêm lý do (because) và ví dụ (for example / like)', 'Không trả lời quá ngắn'],
      theory: [
        card('Nói về kỹ năng', 'Describing skills and abilities', {
          formula: ['**My best skill is…** / **I\'m good at…** / **I can… quite well**', '**When I was younger, I couldn\'t…, but now I can…**', '**I\'d like to learn how to…** because…'],
          usage: ['Thêm **lý do** với because và **ví dụ** với for example / like (bullet box).'],
        }),
      ],
      vocab: [
        ['my best skill', 'kỹ năng tốt nhất của tôi', 'My best skill is cooking.'],
        ['I\'m good at', 'tôi giỏi', "I'm good at remembering information."],
        ['I\'d like to learn how to', 'tôi muốn học cách', "I'd like to learn how to make sushi."],
        ['memory', 'trí nhớ', 'I have a good memory.'],
        ['challenge', 'thử thách', 'My next challenge is to learn to drive.'],
        ['improve on', 'cải thiện', 'I want to improve on my cooking skills.'],
        ['take classes', 'đi học lớp', "I've been taking cooking classes."],
        ['patient', 'kiên nhẫn', 'You need to be patient with children.'],
      ],
      ex: [
        speak('Nói: kỹ năng và khả năng của bạn (Ex. 9–11)', 'Trả lời từng câu hỏi trong 20–30 giây. Dùng can / can\'t / could / couldn\'t, thêm lý do và ví dụ.', 1, [
          ['What are your best skills and abilities?', 'I think my best skill is remembering information. For example, I can learn twenty new English words in an evening and still remember them the next week. I\'m also quite good at drawing, because I practise every weekend.', 'Kỹ năng + ví dụ cụ thể + lý do.'],
          ['What skills do you want to learn?', 'I\'d really like to learn how to cook, because at the moment I can only make instant noodles! My mum is a great cook, so I want to learn some traditional dishes from her, like spring rolls.', 'Mong muốn + lý do + ví dụ.'],
          ['What skills and abilities did you have when you were younger?', 'When I was younger, I could swim really well – I was in the school swimming team. I could also play the piano a little, but I stopped when I started secondary school.', 'Dùng could cho quá khứ.'],
          ['What skills did you NOT have when you were younger?', 'I couldn\'t talk to new people easily because I was very shy. For example, I never spoke in class. Now I can give presentations in front of my classmates, although I still feel a bit nervous.', "couldn't → now I can: cho thấy sự tiến bộ."],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 7: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 7',
      minutes: 30,
      objectives: ['Ôn động từ học tập/công việc, giới từ in/on/at và từ vựng quảng cáo việc làm'],
      ex: [
        gap('Động từ học tập & công việc (G&V Ex. 2)', 'Điền dạng đúng: get, learn (x2), teach, pass, start (x2), fail, take (x2), finish, study.', [
          ['I ____ my driving test last month. Now, I drive to school every day.', 'passed'],
          ['My older sister is ____ law. When she ____ university, she wants to be a family lawyer.', ['studying', 'finishes']],
          ['I think that it is difficult for young people to ____ a good job without experience.', 'get'],
          ['My father ____ me how to cook when I was a child.', 'taught'],
          ['I didn\'t ____ how to play a musical instrument when I was younger. I would like to ____ piano lessons, but they are very expensive.', ['learn', 'take']],
          ['Many students ____ the exam. They will ____ it again next month.', ['failed', 'take']],
          ['I ____ my computer course last week. I want to ____ how to design my own website.', ['started', 'learn']],
          ['My friend is ____ her new job tomorrow. She feels a bit nervous.', 'starting'],
        ]),
        gap('Quảng cáo việc làm hè (G&V Ex. 4)', 'Điền: experience, friendly and helpful, sports, art or music, energy, long hours, speak another language, hard-working, weekend.', [
          ['Waiter/Waitress: You do not need to have ____ of working in a restaurant, but you should be ____ and happy to work in a team.', ['experience', 'hard-working']],
          ['You will work ____, especially at the weekends when we are very busy.', 'long hours'],
          ['Receptionist for busy city hotel, who can ____ (French, German or Spanish). You should be ____ to guests.', ['speak another language', 'friendly and helpful']],
          ['Summer Camp Leaders to teach children ____ at a summer camp. You should have a lot of ____.', ['sports, art or music', 'energy']],
          ['You will need to work weekdays and at the ____, but you will have one day off each week.', 'weekend'],
        ], { wordBank: ['experience', 'friendly and helpful', 'sports, art or music', 'energy', 'long hours', 'speak another language', 'hard-working', 'weekend'] }),
        mcq('in / on / at (G&V Ex. 5)', 'Chọn giới từ đúng.', [
          ['My brother is working as a lifeguard ____ the swimming pool.', ['in', 'on', 'at'], 'C'],
          ['My cousin studies nursing ____ university.', ['in', 'on', 'at'], 'C'],
          ['I wouldn\'t like to work ____ a restaurant. I think it would be too stressful.', ['in', 'on', 'at'], 'A'],
          ['I\'m not working ____ Monday. It is my day off.', ['in', 'on', 'at'], 'B'],
          ['I was ____ work yesterday, so I didn\'t watch the football match.', ['in', 'on', 'at'], 'C'],
          ['I usually finish work ____ five o\'clock.', ['in', 'on', 'at'], 'C'],
          ['My friend wants to be a chef ____ a top restaurant.', ['in / at', 'on'], 'A', 'Sách chấp nhận cả in và at: a chef in/at a restaurant.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U07-R1',
      title: 'Mindset 0 · Unit 7 — Summer Jobs',
      content: '<p><em>Helen Green is a careers advisor who works with teenagers and young adults. In this article, she explains how young people can use their summer holidays to get some work experience.</em></p>\n\n' + ARTICLE.map(([h, t]) => '<h3>' + h + '</h3>\n<p>' + t + '</p>').join('\n\n'),
      questionGroups: [
        qTFNG(1, 'Read the article again and use the exam strategies. Do the statements agree with the information in the article? Choose TRUE, FALSE or NOT GIVEN.', [
          ['Young people should give employers information about what they can do.', 'TRUE', 'GETTING A SUMMER JOB: "make a list of the skills you have so you can write them on your application form" → đưa thông tin kỹ năng cho nhà tuyển dụng → TRUE.'],
          ["Sports coaches at a summer camp don't get paid very much money.", 'NOT GIVEN', 'Bài chỉ nói "get paid for it", không nói lương nhiều hay ít → NOT GIVEN.'],
          ['You need to have a car to get a job working with older people.', 'FALSE', '"having a car would be very useful. However, if you don\'t there are a lot of other things that you can do" → không bắt buộc → FALSE.'],
          ['Young people who work in designer clothes stores can help customers decide what to buy.', 'TRUE', '"use your fashion knowledge to help people choose the right outfit" = help customers decide what to buy → TRUE.'],
          ["Sales assistants in designer fashion stores shouldn't talk to other staff members at work.", 'FALSE', '"sales assistants will need to speak to customers and with other members of staff" → FALSE.'],
          ['You only need to get a certificate to get a job as a lifeguard.', 'FALSE', 'Cần thi bơi + chứng chỉ + "You also need to do a short training course" → không chỉ chứng chỉ → FALSE.'],
          ['In the summertime, lifeguards often need to work in the evenings or at the weekend.', 'NOT GIVEN', 'Bài nói "work long hours on some days of the week", không nói buổi tối hay cuối tuần → NOT GIVEN.'],
          ['Many IT companies offer jobs to young people in the summer.', 'FALSE', '"You probably won\'t be able to find a job in an IT company, but many of them have training programmes" → có khoá đào tạo, KHÔNG phải việc làm → FALSE.'],
        ], 'Questions 1–8'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U07-L1',
      title: 'Mindset 0 · Unit 7 — Before They Were Famous: Jack Riley',
      description: 'A radio advertisement about a TV programme with chef Jack Riley.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_13.mp3',
      transcript: JACK,
      questionGroups: [
        qNote('Listen to the radio advertisement and complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', 'Before They Were Famous', [
          'Jack Riley, famous __Q1__',
          'TV programme details — Day: __Q2__ · Channel: __Q3__ · Time: __Q4__',
          "Jack's life before he was famous",
          '• left school at the age of __Q5__',
          '• failed exams in both __Q6__ and __Q7__',
          '• got a job in an __Q8__ restaurant near his home',
          '• trained to be a chef in __Q9__',
          "Jack's life now",
          '• has presented a radio show called Dinner with __Q10__ since 2006',
          '• wrote his first bestselling cookbook in __Q11__',
          '• worked as head chef at The Lemon Grove between __Q12__ and __Q13__',
          '• married with __Q14__ children',
        ], { 1: 'chef', 2: 'Wednesday', 3: '3 / three', 4: '8:00 / 8.00 / 8 / eight / 8pm', 5: '16 / sixteen', 6: 'maths / math', 7: 'English', 8: 'Italian', 9: 'London', 10: 'Jack', 11: '2004', 12: '2002', 13: '2005', 14: '2 / two' }, {
          1: lx('Jack Riley, ___ nổi tiếng', 'Câu mở đầu.', "now I'm a famous chef", 'chef.'),
          2: lx('Ngày phát sóng', 'Đầu bài.', ['You can listen to my cooking show on Mondays', 'This Wednesday, you can see me on the TV show Before They Were Famous'], 'Thứ Hai là chương trình radio — TV là Wednesday.'),
          3: lx('Kênh', 'Đầu bài.', 'You can see the programme on channel three', '3.'),
          4: lx('Giờ', 'Đầu bài.', "they will show it at eight o'clock", 'BẪY: "half past seven" là chương trình radio → 8:00.'),
          5: lx('Rời trường lúc ___ tuổi', 'Đoạn 2.', ['Most of my friends left school when they were eighteen', 'but I left school when I was sixteen'], '18 là tuổi của bạn bè → 16.'),
          6: lx('Trượt môn ___', 'Đoạn 2.', 'I failed my exams in both maths and English', 'History và French là các môn đỗ.'),
          7: lx('… và ___', 'Đoạn 2.', 'both maths and English', 'English.'),
          8: lx('Làm việc ở một nhà hàng ___ gần nhà', 'Đoạn 3.', 'working in the kitchen in an Italian restaurant near my home', 'Spain là nơi đi nghỉ → Italian.'),
          9: lx('Học làm đầu bếp ở ___', 'Cuối đoạn 3.', ['I applied for jobs in Rome, but I couldn\'t speak Italian', 'I decided to move to London and train to be a chef'], 'Rome không được → London.'),
          10: lx('Chương trình radio tên Dinner with ___', 'Đoạn 4.', 'I started presenting my radio show, Dinner with Jack in 2006', 'Jack.'),
          11: lx('Viết cuốn sách nấu ăn bán chạy đầu tiên năm ___', 'Đoạn 4.', "I wrote my first bestselling cookbook, Jack's Best Dishes in 2004", '2005 là năm lên TV lần đầu → 2004.'),
          12: lx('Bếp trưởng ở The Lemon Grove từ ___', 'Đoạn 4.', 'The Olive Tree in 2001, and The Lemon Grove between 2002 and 2005', '2001 là The Olive Tree → 2002.'),
          13: lx('… đến ___', 'Đoạn 4.', 'between 2002 and 2005', '2005.'),
          14: lx('Có ___ con', 'Cuối đoạn 4.', "I'm married with two beautiful children – and my third child will be born in December", 'Đứa thứ ba chưa sinh → 2.'),
        }, 'Questions 1–14'),
      ],
    },
  ],
};
