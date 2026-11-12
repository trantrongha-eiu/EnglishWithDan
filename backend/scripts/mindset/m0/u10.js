// Mindset for IELTS Foundation — Unit 10: Science and technology (pp. 114–123)
const { mcq, gap, match, order, write, speak, passage, picture, card, qMcq, qFill, qTable, lx } = require('../dsl');

const LECTURE1 = `Good morning, I'm here today to talk about the design and the success of smartphones. They are convenient, and they allow us to keep control of our lives. One important reason why I think smartphones are so successful is because of their simple, clean design. Of course, there are many different brands, but let's look at a common example on this picture.
First of all, on the front of the phone, we have the glass touch screen, also known as the display. It's very easy, you only need to press your finger on this when you want to use an app. Next, on the top right side of the smartphone, is the power button. You use this to turn the phone on or off again.
At the bottom, there is a USB input. This is where you plug in and charge your phone. You can also connect to a laptop and upload your files and photos from your phone. You will see just above this is the microphone. Whenever you make a call, you speak into this. At the opposite end of the touch screen, you can see the power bar, which you can look at to check the battery. If the bar is low, you will need to plug it in and charge it again soon.
Around the phone on the outside, keeping all of this in place is the case – sometimes made from plastic, but now more often made of metal. Many people think that the reason for the case is so that they can have a different design and colour and make it more personal. Actually, every phone needs a good, strong case to protect the phone from breaking.`;

const LECTURE2 = `Smartphones are becoming more popular every day, all around the world. In 2010, 38 percent of the world's population owned a smartphone. Most of these people were from developed areas of the world, like North America and Europe. Five years later, that figure was a lot higher. In 2015, 62 percent of all people had one. And, in the future, these amazing little devices will probably be even more popular. So popular that, by 2020, 78 percent of the population will own one, and by 2025 many scientists believe that this number will be even higher still. Not as high as 100%, but close. This is mostly because, in the less developed parts of the world, people will be richer than they are now. So, in that year, when 86 percent will own one, what will smartphones look like? Will they look the same as they do now? I'm afraid I can't say for sure, but I do know that they won't look the same as the one in the picture that we're looking at today.`;

const LORENZO = `1 It has a silver case, and the screen is bigger than most other smartphones. The display is also really clear. It's really light and thin, it's got a lot of memory, and the battery lasts for a very long time.
2 It's very expensive, so before I buy it, I'm going to visit a mobile phone shop first, so I can try all the new features. But I'm definitely going to get it online in the end. I'm sure it will be cheaper.
3 The phone I have now, the Plus 5, is the latest model – it came out last year. But I think it will start to be really slow and seem out of date soon. The Plus 6 is even faster, and it's better for playing games and streaming things online, so that's why I'm going to get it as soon as I can.
4 I'm not sure if it will help me with everything. It won't do my homework for me if I swipe the screen, for example. But I think it will be helpful for some things. There's an app for writing a study plan, so I'm going to download that, anyway.`;

const INTERNET = [
  'The internet is still quite a new development in technology, however it is impossible to think about life without it. It works in a very simple way. It takes information and sends it from one computer to another. It is not a difficult job, but it is a very big one. There are hundreds of millions of computers connected to the internet at the same time. However, they don\'t all do the same thing. Some computers are like a digital box that store information (like videos or music files) that people see, read or listen to. These stores of information are called servers, and there are three categories.',
  'The first type is a file server, which holds ordinary documents. The second is a mail server for sending and receiving emails. The third is a web server for web pages. We know these servers store information but how do people find this information or send it to each other? For this, you need a client.',
  'A client is a computer that gets information from a server and delivers it to another computer. When you go online on your smartphone, you are using it as a client. When two computers on the internet exchange information, they are known as peers.',
  'Peer-to-peer (P2P) communication is when you send someone a photo on your smartphone. When that person sees this photo, your smartphone is working as the server. It stores the photo and the other person\'s device is the client, which searches for your information. It then displays the photo on the other person\'s screen.',
];

module.exports = {
  n: 10,
  title: 'Science and technology',
  titleVi: 'Khoa học & công nghệ',
  pages: '114–123',
  outcomes: [
    'Gọi tên thiết bị và từ vựng máy tính, internet (crash, backup, stream…)',
    'Đọc và hoàn thành câu bằng cách diễn đạt lại (paraphrase)',
    'Nghe bài giảng ngắn về điện thoại thông minh; nghe số liệu %',
    'Dùng will / won\'t cho tương lai; từ vựng mô tả thay đổi (rise, fall, increase…)',
    'Mô tả biểu đồ đường; nói về một thiết bị bạn muốn mua',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: thiết bị & máy tính',
      titleEn: 'Lead-in · Vocabulary and reading',
      minutes: 35,
      objectives: ['Gọi tên 8 thiết bị công nghệ', 'Viết đúng chính tả từ máy tính (crashed, shut down, websites, devices, network)', 'Dùng attachment, download, stream, backup, store'],
      images: ['media:m0u10-tech.jpg|Lead-in (tr. 114): các thiết bị công nghệ'],
      theory: [
        card('Từ vựng máy tính & internet', 'Computers and the internet', {
          usage: [
            '**crash** (máy) bị treo/sập · **shut down** tắt máy · **back up / a backup** sao lưu / bản sao lưu',
            '**download** tải xuống · **stream** xem/nghe trực tuyến không cần tải · **store** lưu trữ',
            '**attachment** tệp đính kèm · **device** thiết bị · **network** mạng · **website** trang web · **app** ứng dụng',
          ],
          notes: ['TIP 03: viết **đúng chính tả** — sai chính tả là mất điểm trong bài thi (crashed ≠ crushed, devices ≠ advices).'],
        }),
      ],
      vocab: [
        ['smartphone', 'điện thoại thông minh', 'I use my smartphone to contact friends.'],
        ['laptop', 'máy tính xách tay', 'I can work from anywhere with my laptop.'],
        ['tablet', 'máy tính bảng', 'My sister reads books on her tablet.'],
        ['desktop computer', 'máy tính để bàn', 'We have a desktop computer at home.'],
        ['landline telephone', 'điện thoại bàn', 'My grandparents still use a landline telephone.'],
        ['smart watch', 'đồng hồ thông minh', 'A smart watch can count your steps.'],
        ['crash', '(máy) bị treo, sập', 'My computer crashed and I lost my homework.'],
        ['shut down', 'tắt máy', 'Shut down your laptop when you finish.'],
        ['device', 'thiết bị', 'I own three devices.'],
        ['network', 'mạng', 'The computers are connected to the same network.'],
        ['attachment', 'tệp đính kèm', 'Don\'t open attachments from strangers.'],
        ['download', 'tải xuống', 'I often download music from the internet.'],
        ['stream', 'phát trực tuyến', 'You can stream films online.'],
        ['backup', 'bản sao lưu', 'Create a backup of your files.'],
        ['store', 'lưu trữ', 'The cloud is where you can store your files.'],
        ['app', 'ứng dụng', 'There\'s an app for writing a study plan.'],
      ],
      ex: [
        match('Thiết bị trong tranh (Lead-in)', 'Nối tranh 1–8 với thiết bị.', [
          ['Picture 1', 'smartphone'], ['Picture 2', 'letter'], ['Picture 3', 'laptop'], ['Picture 4', 'tablet'],
          ['Picture 5', 'landline telephone'], ['Picture 6', 'smart TV'], ['Picture 7', 'smart watch'], ['Picture 8', 'desktop computer'],
        ], { stimulus: picture('media:m0u10-tech.jpg', 'Lead-in') }),
        mcq('Chính tả đúng (Ex. 3)', 'Chọn cách viết đúng.', [
          ['My computer ____ and I lost my homework.', ['crushed', 'crashed', 'crached'], 'B'],
          ['You need to ____ your laptop when you finish using it.', ['shout down', 'shot down', 'shut down'], 'C'],
          ['There are some excellent ____ that can help you to study.', ['wepsites', 'websites', 'websides'], 'B'],
          ['I own three ____ – a smartphone, a laptop and a tablet.', ['devices', 'advices', 'divises'], 'A'],
          ['The computers at school are all connected to the same ____.', ['netwalk', 'netwok', 'network'], 'C'],
        ]),
        gap('Từ máy tính (Ex. 4)', 'Điền: attachments, backup, download, store, stream.', [
          ['If you don\'t know who sent you the email, then it isn\'t a good idea to open the ____.', 'attachments'],
          ['I often ____ music from the internet.', 'download'],
          ['You can ____ films online a few months after they are released at the cinema.', 'stream'],
          ['You should create a ____ of your files, so you don\'t lose them.', 'backup'],
          ['The cloud is the name for the place on the internet where you can ____ your files.', 'store'],
        ], { wordBank: ['attachments', 'backup', 'download', 'store', 'stream'] }),
        gap('Định nghĩa (G&V Ex. 2)', 'Điền: stream, website, device, crash, attachment, backup.', [
          ['A set of pages of information on the internet about a particular subject. → ____', 'website'],
          ['A copy of the files from your computer that you keep in a different place. → ____', 'backup'],
          ['A machine, like a smartphone, that can connect to the internet. → ____', 'device'],
          ['A file, like an essay, that you add to an email before sending it. → ____', 'attachment'],
          ['This happens when your computer suddenly stops working. → ____', 'crash'],
          ['Music or video that you watch on the internet without downloading it first. → ____', 'stream'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: internet hoạt động thế nào? — paraphrasing',
      titleEn: 'Vocabulary and reading: completing paraphrased sentences',
      minutes: 45,
      objectives: ['Đọc lướt chọn tiêu đề phù hợp nhất', 'Hiểu server, client, peer-to-peer', 'Hoàn thành câu diễn đạt lại (1–3 từ)'],
      theory: [
        card('Paraphrasing', 'Completing paraphrased sentences', {
          formula: ['Paraphrase = đọc, hiểu nghĩa, rồi **nói lại bằng từ khác**.', 'Câu hỏi viết lại thông tin trong bài → tìm câu gốc → điền 1–3 từ sao cho **cùng nghĩa**.'],
          usage: ['Ví dụ: "It is not a **difficult** job" → "Sending information… is an **easy job**" (MINI TIP 06.0: trái nghĩa của difficult là easy).', 'MINI TIP 06.1: "they don\'t all do the **same** thing" → trái nghĩa của same là **different** → "doing different things".', 'Paraphrasing quan trọng trong **cả 4 kỹ năng**.'],
        }),
      ],
      links: [{ ref: 'reading:M0-U10-R1', title: 'How people communicate on the internet (Ex. 5–6)', note: 'Chọn tiêu đề, rồi hoàn thành 5 câu diễn đạt lại (1–3 từ).' }],
      vocab: [
        ['development', 'sự phát triển, bước tiến', 'The internet is a new development in technology.'],
        ['connected to', 'được kết nối với', 'Millions of computers are connected to the internet.'],
        ['server', 'máy chủ', 'Servers store information.'],
        ['category', 'loại, hạng mục', 'There are three categories of servers.'],
        ['ordinary', 'thông thường', 'A file server holds ordinary documents.'],
        ['client', 'máy khách', 'Your smartphone is a client when you go online.'],
        ['deliver', 'chuyển, giao', 'It delivers information to another computer.'],
        ['exchange', 'trao đổi', 'Two computers exchange information.'],
        ['peer', 'máy ngang hàng', 'They are known as peers.'],
        ['display', 'hiển thị; màn hình', 'It displays the photo on the screen.'],
        ['paraphrase', 'diễn đạt lại', 'Paraphrasing is important in every exam.'],
      ],
      ex: [
        mcq('Chọn tiêu đề (Ex. 5)', 'Đọc lướt bài báo và chọn tiêu đề phù hợp nhất.', [
          ['What is the best title for the article?', ['New developments on the internet', 'How people communicate on the internet', 'Why people use the internet'], 'B', 'Bài giải thích thông tin đi từ máy này sang máy khác như thế nào (server, client, peer-to-peer).'],
        ], { stimulus: passage(INTERNET.join('\n\n'), { caption: 'Article' }) }),
        mcq('Từ trái nghĩa / đồng nghĩa (MINI TIPS)', 'Chọn từ cùng nghĩa hoặc trái nghĩa đúng.', [
          ['The opposite of "difficult" is…', ['easy', 'big', 'simple'], 'A'],
          ['The opposite of "the same" is…', ['similar', 'different', 'equal'], 'B'],
          ['"deliver information" means…', ['send information', 'delete information', 'store information'], 'A'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: will / won\'t & từ vựng mô tả thay đổi',
      titleEn: 'Grammar and vocabulary: will for the future · describing changes',
      minutes: 45,
      objectives: ['Dùng will / won\'t + V để dự đoán tương lai', 'Đặt câu hỏi Will…? / What will…?', 'Dùng rise, increase, go up, fall, decrease, go down (động từ & danh từ)'],
      keyLanguage: [
        'Khẳng định: People will be richer than they are now. · Phủ định: They won\'t look the same.',
        'Câu hỏi: Will they look the same as they do now? · What will smartphones look like?',
        'Tăng: rise → rose → a rise · increase → increased → an increase · go up → went up',
        'Giảm: fall → fell → a fall · decrease → decreased → a decrease · go down → went down',
        'increase from 74% to 82% · fall by 6% · finish on 86%',
      ],
      links: [{ grammar: 'future-simple', title: 'Future Simple (will)', note: 'dự đoán tương lai' }, { grammar: 'be-going-to', title: 'Be Going To', note: 'so sánh với kế hoạch' }],
      ex: [
        gap('Bảng will / won\'t (Ex. 10)', 'Hoàn thành câu từ bài giảng Part 2.', [
          ['(+) People ____ ____ richer than they are now.', ['will', 'be']],
          ['(−) They ____ ____ the same as the one in the picture today.', ['won\'t|will not', 'look']],
          ['(?) ____ they ____ the same as they do now?', ['Will', 'look']],
          ['(?) What ____ smartphones ____ like?', ['will', 'look']],
        ]),
        gap('Phỏng vấn về tương lai (G&V Ex. 3)', 'Chia động từ với will / won\'t.', [
          ['No, the cars ____ (communicate) with each other and make sure they all have enough space.', 'will communicate'],
          ['There ____ (not be) any crashes ever again.', 'won\'t be|will not be'],
          ['____ (the cars / be able) to fly?', 'Will the cars be able'],
          ['And food – what ____ (people / eat)?', 'will people eat'],
          ['If we want to eat as much meat as we do now, we ____ (definitely need) more space for animals.', 'will definitely need'],
          ['I\'m not sure that ____ (be) possible.', 'will be'],
          ['Well, how ____ (the animals / breathe) when they are on the moon?', 'will the animals breathe'],
        ]),
        gap('Từ chỉ thay đổi (Ex. 12)', 'Điền dạng đúng.', [
          ['to rise → (past) ____ → (noun) a rise', 'rose'],
          ['to increase → (past) increased → (noun) ____', 'an increase'],
          ['to go up → (past) ____', 'went up'],
          ['to fall → (past) fell → (noun) ____', 'a fall'],
          ['to decrease → (past) ____ → (noun) a decrease', 'decreased'],
          ['to go down → (past) ____', 'went down'],
        ]),
        mcq('Mô tả số liệu điện thoại thông minh (Ex. 14)', 'Đọc mô tả và chọn đáp án đúng.', [
          ['The percentage of people with smartphones increased ____ 38% in 2010…', ['at', 'from', 'to'], 'B'],
          ['…____ 62% in 2015.', ['to', 'by', 'at'], 'A'],
          ['In the future, this ____ will…', ['rised', 'rose', 'rise'], 'C', 'Danh từ: this rise.'],
          ['…will ____.', ['to continue', 'continue', 'continuing'], 'B', 'will + V nguyên mẫu.'],
          ['At the end of the period in 2025, this percentage will ____ on 86%.', ['finish', 'finishing', 'be finish'], 'A'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: mô tả biểu đồ đường',
      titleEn: 'Writing: describing a graph',
      minutes: 50,
      objectives: ['Đọc xu hướng chính của từng đường', 'Dùng từ tăng/giảm + giới từ from…to, by, on', 'Viết đoạn mô tả biểu đồ 100–130 từ — làm quen IELTS Writing Task 1'],
      images: ['media:m0u10-graph.jpg|Ex. 15 (tr. 119): Percentage of people who own the devices from 2010 to 2025'],
      theory: [
        card('Mô tả biểu đồ đường', 'Describing a line graph', {
          formula: ['**Câu mở đầu**: The graph shows the percentage of people who own… from 2010 to 2025.', '**Xu hướng chính** (tóm tắt): Overall, … rose, while … fell.', '**Chi tiết từng đường**: The percentage of … increased from 38% in 2010 to 62% in 2015. It will continue to rise and will finish on 86% in 2025.'],
          usage: ['Quá khứ (2010–2015) → **rose / increased / went up / fell**; tương lai (2020–2025) → **will rise / will fall**.', '**from X to Y** (từ…đến), **by X%** (tăng/giảm một lượng), **finish on X%** (kết thúc ở mức).', 'Một bản **tóm tắt** tốt nêu xu hướng chính — KHÔNG liệt kê mọi con số (G&V Ex. 6).'],
        }),
      ],
      vocab: [
        ['line graph', 'biểu đồ đường', 'Look at the line graph.'],
        ['percentage', 'tỷ lệ phần trăm', 'the percentage of people who own a laptop'],
        ['own', 'sở hữu', 'More people will own a smart watch.'],
        ['rise / rose', 'tăng', 'It rose from 38% to 62%.'],
        ['fall / fell', 'giảm', 'It fell by 6%.'],
        ['increase', 'tăng; sự tăng', 'There was an increase of 35%.'],
        ['decrease', 'giảm; sự giảm', 'There was a decrease in his business score.'],
        ['reach a peak', 'đạt đỉnh', 'It reached a peak in 2015.'],
        ['overall', 'nhìn chung', 'Overall, smartphones became more popular.'],
        ['period', 'giai đoạn', 'At the end of the period…'],
      ],
      ex: [
        mcq('Xu hướng từng đường (Ex. 15)', 'Nhìn biểu đồ và chọn mô tả đúng.', [
          ['Smartphone:', ['rises steadily from 38% to 86%', 'falls from 86% to 38%', 'stays the same'], 'A'],
          ['Laptop:', ['rises a lot', 'goes up a little to about 71% in 2015, then falls to about 59%', 'falls to 0%'], 'B'],
          ['Smart watch:', ['starts very low and increases to 40%', 'decreases from 40%', 'is the most popular device'], 'A'],
          ['Tablet:', ['rises from 22% to about 62% in 2020, then falls slightly', 'falls all the time', 'rises to 86%'], 'A'],
        ], { stimulus: picture('media:m0u10-graph.jpg', 'Percentage of people who own the devices from 2010 to 2025') }),
        mcq('Bản tóm tắt tốt nhất (G&V Ex. 6)', 'Nhìn biểu đồ Line A / Line B. Đâu là bản tóm tắt tốt nhất?', [
          ['Best summary?', ['Both lines went up and down a lot. Line A changed much more than Line B.', 'The biggest changes for Line A will happen in the last ten years shown on the graph. However, Line B had its own most important changes earlier, especially between 2005 and 2015.', 'Line A went up to 40% in 2010, then down to 20% by 2020, then up to 75% in 2025 and back down to 65%… Line B increased to 75% in 2015, then went down to 40% in 2020…'], 'B', 'A quá chung chung và sai ("changed much more"); C liệt kê quá nhiều số liệu — không phải tóm tắt; B nêu đúng xu hướng chính của mỗi đường.'],
        ], { stimulus: picture('media:m0u10-lineab.jpg', 'Line A & Line B') }),
        gap('Mô tả Line B (G&V Ex. 5)', 'Hoàn thành mô tả Line B bằng: fall, down, rise, decrease, went, increased, 2020, 55%, 50%, 2015, 40%, 2005.', [
          ['After it ____ from 30% in ____ to ____ in 2010,', ['increased', '2005', '55%']],
          ['line B ____ up by another 20% between 2010 and 2015. This was its highest point.', 'went'],
          ['It started to ____ in 2015, going ____ to 40% in ____.', ['fall|decrease', 'down', '2020']],
          ['It will ____ to 50% in 2025, and then will ____ to 45% in 2030.', ['rise', 'decrease|fall']],
        ], { stimulus: picture('media:m0u10-lineab.jpg', 'Line A & Line B') }),
        write('Viết: mô tả biểu đồ sở hữu thiết bị (Ex. 15–16)', 'Nhìn biểu đồ "Percentage of people who own the devices from 2010 to 2025" (smartphone, laptop, smart watch, tablet). Viết đoạn văn 100–130 từ mô tả các thay đổi chính: câu mở đầu giới thiệu biểu đồ, một câu nêu xu hướng chung (Overall…), rồi mô tả từng thiết bị bằng rise / increase / go up / fall / decrease / go down và from… to…, by…. Dùng quá khứ cho 2010–2015 và will cho 2020–2025.', {
          minWords: 100, maxWords: 150, mustUse: 4,
          targetStructures: ['The graph shows', 'Overall', 'increased', 'rose', 'fell', 'will', 'from', 'to'],
          checklist: ['Câu mở đầu giới thiệu biểu đồ', 'Câu tổng quan (Overall…)', 'Mô tả cả 4 thiết bị', 'Có số liệu chính xác (from… to…)', 'Đúng thì: quá khứ cho 2010–2015, will cho tương lai', '100–130 từ'],
          sampleAnswer: 'The graph shows the percentage of people who owned four different devices between 2010 and 2015, and the expected figures up to 2025.\n\nOverall, smartphones became the most popular device, while laptops became less popular.\n\nThe percentage of people with a smartphone rose from 38% in 2010 to 62% in 2015, and it will continue to increase to 86% in 2025. Laptop ownership went up slightly from 62% to about 71% in 2015, but it will fall to around 59% by the end of the period. Tablets increased quickly from 22% to 51% in 2015 and will reach a peak of about 62% in 2020 before decreasing a little. Smart watches started at almost 0%, but they will rise sharply to 40% in 2025.',
          commonErrors: ['Dùng hiện tại cho quá khứ (It rises from 38% in 2010)', 'Liệt kê mọi con số mà không có câu tổng quan', 'Sai giới từ (increase at / to / by)'],
        }, { stimulus: picture('media:m0u10-graph.jpg', 'Percentage of people who own the devices from 2010 to 2025') }),
      ],
    },

    listening: {
      title: 'Listening: bài giảng về điện thoại thông minh',
      titleEn: 'Listening 1: a lecture · Listening 2 and grammar',
      minutes: 50,
      objectives: ['Hoàn thành bảng bộ phận – công dụng (2–3 từ, đúng chính tả)', 'Nghe số liệu phần trăm theo năm', 'Nghe câu trả lời của Lorenzo và nối với câu hỏi'],
      images: ['media:m0u10-phone.jpg|Ex. 7 (tr. 116): các bộ phận của điện thoại thông minh'],
      theory: [
        card('Nghe bài giảng ngắn', 'A lecture', {
          usage: ['Trước khi nghe: nhìn sơ đồ, biết tên các bộ phận (display, power button, input, microphone, power bar, case).', 'Câu 3 cần **ba từ** để nói **cả hai** công dụng (MINI TIP 08.2): charge your phone, upload files.', 'Viết **đúng chính tả** — sai chính tả là sai đáp án.', 'Con số: phân biệt **38 / 62 / 78 / 86** theo từng năm; "Not as high as 100%, but close".'],
        }),
      ],
      links: [
        { ref: 'listening:M0-U10-L1', title: 'Smartphones lecture — Part 1 (Ex. 7–8)', note: 'Nghe và điền công dụng của 6 bộ phận điện thoại.' },
        { ref: 'listening:M0-U10-L2', title: 'Smartphones lecture — Part 2 (Ex. 9)', note: 'Điền % dân số có điện thoại thông minh năm 2010, 2015, 2020, 2025.' },
        { ref: 'listening:M0-U10-L3', title: 'Lorenzo — thiết bị muốn mua (Ex. 17–19)', note: 'Nối 4 câu trả lời của Lorenzo với câu hỏi (có 2 câu hỏi thừa).' },
      ],
      vocab: [
        ['lecture', 'bài giảng', 'Listen to a short lecture about smartphones.'],
        ['touch screen', 'màn hình cảm ứng', 'the glass touch screen'],
        ['power button', 'nút nguồn', 'You use the power button to turn the phone on.'],
        ['input', 'cổng cắm', 'the USB input'],
        ['plug in', 'cắm điện', 'Plug in and charge your phone.'],
        ['charge', 'sạc', 'You need to charge it again soon.'],
        ['upload', 'tải lên', 'Upload your files and photos.'],
        ['power bar', 'thanh pin', 'Check the battery on the power bar.'],
        ['protect', 'bảo vệ', 'A strong case protects the phone.'],
        ['developed', 'phát triển', 'developed areas of the world'],
        ['latest model', 'mẫu mới nhất', 'The Plus 5 is the latest model.'],
        ['out of date', 'lỗi thời', 'It will seem out of date soon.'],
        ['feature', 'tính năng', 'I can try all the new features.'],
        ['swipe', 'vuốt', 'Swipe the screen.'],
        ['memory', 'bộ nhớ', "It's got a lot of memory."],
      ],
      ex: [
        gap('Tên bộ phận điện thoại (Ex. 7)', 'Sắp xếp lại chữ cái để được tên bộ phận.', [
          ['touch screen or d____ (SLPIYA)', 'display|isplay'], ['p____ b____ (REWO / TOTNU)', ['power|ower', 'button|utton']],
          ['USB i____ (TUPN)', 'input|nput'], ['m____ (RENOPICHO)', 'microphone|icrophone'],
          ['p____ b____ (WORE / RA)', ['power|ower', 'bar|ar']], ['c____ (SAE)', 'case|ase'],
        ], { stimulus: picture('media:m0u10-phone.jpg', 'Parts of a smartphone') }),
        match('Từ trong câu trả lời của Lorenzo (Ex. 18)', 'Nối từ với định nghĩa.', [
          ['features', 'Important and interesting parts of a device.'], ['latest model', 'The newest device you can buy.'],
          ['swipe', 'To move your finger from one side to the other on a device.'], ['out of date', 'A device that is old.'], ['memory', 'The part of a device that stores data.'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: mô tả một thiết bị',
      titleEn: 'Speaking: describing a gadget',
      minutes: 40,
      objectives: ['Chọn 4 ý để nói về một thiết bị bạn muốn mua', 'Dùng will / be going to, từ vựng công nghệ của unit', 'Nói 1–2 phút'],
      theory: [
        card('Nói về một thiết bị muốn mua', 'Describing a gadget', {
          formula: ['**Đề**: Describe a piece of technology that you would like to buy in the future.', 'Chọn 4 ý: **What does it look like? · Where do you want to buy it from? · Why do you want to buy it? · How will it make your life better?**'],
          usage: ['Dùng **going to** cho kế hoạch (I\'m going to buy it online) và **will** cho dự đoán (It will help me…).', 'Từ vựng: screen, case, memory, battery, features, latest model, out of date, download, stream.'],
        }),
      ],
      vocab: [
        ['gadget', 'thiết bị nhỏ, đồ công nghệ', 'Describe a gadget you would like to buy.'],
        ['light and thin', 'nhẹ và mỏng', "It's really light and thin."],
        ['the battery lasts', 'pin dùng được (lâu)', 'The battery lasts for a very long time.'],
        ['as soon as I can', 'sớm nhất có thể', "I'm going to get it as soon as I can."],
        ['make my life better', 'làm cuộc sống tốt hơn', 'It will make my life better.'],
        ['study plan', 'kế hoạch học tập', 'an app for writing a study plan'],
        ['wireless earphones', 'tai nghe không dây', 'I want some wireless earphones.'],
        ['save up', 'tiết kiệm tiền', "I'm saving up for a new laptop."],
      ],
      ex: [
        mcq('Câu trả lời nào trả lời câu hỏi nào? (Ex. 19)', 'Đọc 4 câu trả lời của Lorenzo và chọn câu hỏi tương ứng.', [
          ['Answer 1: "It has a silver case, and the screen is bigger than most other smartphones…"', ['What does it look like?', 'How much does it cost?', 'Why is it so popular?'], 'A'],
          ['Answer 2: "It\'s very expensive, so before I buy it, I\'m going to visit a mobile phone shop… But I\'m definitely going to get it online in the end."', ['How much does it cost?', 'Where do you want to buy it from?', 'Why is it so popular?'], 'B', 'Có nhắc giá nhưng ý chính là mua ở đâu.'],
          ['Answer 3: "The phone I have now… will seem out of date soon. The Plus 6 is even faster… so that\'s why I\'m going to get it."', ['Why do you want to buy it?', 'What does it look like?', 'How will it make your life better?'], 'A'],
          ['Answer 4: "It won\'t do my homework for me… But I think it will be helpful for some things."', ['Why is it so popular?', 'How will it make your life better?', 'How much does it cost?'], 'B'],
        ], { stimulus: passage(LORENZO, { caption: "Lorenzo's answers" }) }),
        speak('Nói: thiết bị bạn muốn mua (Ex. 20–22)', 'Chuẩn bị 1 phút, rồi nói 1–2 phút.', 2, [
          ['Describe a piece of technology that you would like to buy in the future.\nYou should say:\n• what it looks like\n• where you want to buy it from\n• why you want to buy it\nand explain how it will make your life better.', 'The piece of technology I\'d like to buy is a new laptop. I\'m thinking of a light, thin one with a silver case and a big, clear screen, because I want to carry it to school every day. It should also have a lot of memory and a battery that lasts all day. I\'m going to buy it online, because it\'s usually cheaper than in shops, but first I\'m going to visit a computer shop to try the keyboard. The main reason I want it is that my family only has one old desktop computer, and it\'s really out of date – it crashes almost every time I open more than two websites! I think a laptop will make my life much better. I\'ll be able to study anywhere, for example in the library, and I\'ll download English lessons and stream videos to improve my listening. I\'m saving up for it now, so I hope I can buy it next summer.', 'Đủ 4 ý; dùng going to (kế hoạch), will (dự đoán); từ vựng unit: memory, battery lasts, out of date, crashes, download, stream.'],
        ]),
        speak('Nói: công nghệ trong đời sống (Lead-in Ex. 2)', 'Trả lời từng câu hỏi trong 15–25 giây.', 1, [
          ['Which devices do you use for studying?', 'I mostly use my laptop for studying because the screen is bigger and I can type my essays. I also use my smartphone to look up words in an online dictionary.', 'Thiết bị + lý do.'],
          ['How do you usually contact your friends?', 'I usually send messages on my smartphone, because it\'s quick and free. Sometimes we make video calls in the evening when we do homework together.', 'Cách + lý do + ví dụ.'],
          ['Do you think smartphones will look different in the future?', 'Yes, I think they will. They will probably be thinner and maybe they will fold, so the screen will be bigger. I don\'t think people will stop using them, though.', 'Dùng will cho dự đoán.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 10: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 10',
      minutes: 25,
      objectives: ['Ôn từ vựng công nghệ và will / going to của Unit 10'],
      ex: [
        mcq('Chọn từ đúng (G&V Ex. 1)', 'Chọn đáp án đúng.', [
          ['My brother ____ his files on his computer but doesn\'t back them up.', ['streams', 'stores'], 'B'],
          ['You can connect a series of computers together on a ____.', ['website', 'network'], 'B'],
          ['I prefer to use a ____ as I can work from anywhere.', ['laptop', 'desktop computer'], 'A'],
          ['Stop playing games! ____ your computer right now!', ['Shut down', 'Crash'], 'A'],
          ['I don\'t like paying a lot of money for ____, but it can cause problems if you only ____ them for free.', ['attachments / backup', 'apps / download'], 'B'],
        ]),
        mcq('Email của ông nội (G&V Ex. 7)', 'Chọn đáp án đúng.', [
          ['I have some news – ____ buy a smartphone.', ['I will', 'I\'m going to', 'I going to'], 'B', 'Kế hoạch đã quyết định → going to.'],
          ['Your mum told me that you have the ____.', ['latest model', 'later modern', 'late model'], 'A'],
          ['I don\'t mind if it\'s a bit ____ – I\'ll be happy with something a bit older.', ['out of order', 'out of time', 'out of date'], 'C'],
          ['I see a lot of advertisements for phones with great ____.', ['features', 'devices', 'websites'], 'A'],
          ['It will be strange to play cards by ____ a ____.', ['swiping / screen', 'sweeping / charger', 'swapping / case'], 'A'],
          ['Your mother also said that your smartphone has a lot of ____.', ['memory', 'memories', 'memry'], 'A'],
          ['…you have a lot of space to ____ apps and files.', ['stand', 'store', 'shop'], 'B'],
          ['I know your phone has a silver ____ but I would prefer mine in black.', ['case', 'screen', 'battery'], 'A'],
        ]),
        mcq('Câu nào mô tả đoạn nào của Line A? (G&V Ex. 4)', 'Nhìn Line A (đường màu xanh) trên biểu đồ. Mỗi câu mô tả đoạn nào? Có những câu thừa (không đúng với Line A).', [
          ['It increased from 10% to 40%.', ['2005–2010', '2010–2015', '2020–2025', 'Câu thừa'], 'A', '2005: 10% → 2010: 40%.'],
          ['This rise will continue after 2025.', ['2015–2020', '2020–2025', '2025–2030', 'Câu thừa'], 'D', 'Sau 2025 Line A giảm (75% → 65%), không tăng tiếp.'],
          ['It decreased by 15%.', ['2010–2015', '2015–2020', '2025–2030', 'Câu thừa'], 'A', '40% → 25% = giảm 15%.'],
          ['It fell by 30%.', ['2010–2015', '2015–2020', '2025–2030', 'Câu thừa'], 'D', 'Line A không có đoạn nào giảm 30%.'],
          ['It will finish on 65%.', ['in 2025', 'in 2030', 'in 2020', 'Câu thừa'], 'B', 'Điểm cuối 2030: 65%.'],
          ['It went up from 40% to 50%.', ['2005–2010', '2020–2025', '2025–2030', 'Câu thừa'], 'D', 'Câu này đúng với Line B (2020–2025), không phải Line A.'],
          ['It will fall again after 2020.', ['2015–2020', '2020–2025', '2025–2030', 'Câu thừa'], 'D', 'Sau 2020 Line A tăng mạnh (20% → 75%).'],
          ['There will be a rise of 55%.', ['2010–2015', '2020–2025', '2025–2030', 'Câu thừa'], 'B', '20% → 75% = tăng 55%.'],
          ['It went down by 5%.', ['2010–2015', '2015–2020', '2025–2030', 'Câu thừa'], 'B', '25% → 20%.'],
          ['There was an increase of 35%.', ['2005–2010', '2020–2025', '2010–2015', 'Câu thừa'], 'D', 'Không đoạn nào của Line A tăng đúng 35% (2005–2010 tăng 30%).'],
        ], { stimulus: picture('media:m0u10-lineab.jpg', 'G&V Ex. 4 — Line A') }),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U10-R1',
      title: 'Mindset 0 · Unit 10 — How people communicate on the internet',
      content: '<p><em>You are going to read an article about the internet.</em></p>\n\n' + INTERNET.map((p, i) => '<p><strong>Paragraph ' + (i + 1) + '</strong><br>' + p + '</p>').join('\n\n'),
      questionGroups: [
        qFill(1, 'Read the article again. Complete the paraphrased sentences using ONE to THREE words. (Example: Sending information from one computer to another is an easy job.)', [
          ['All the computers connected to the internet are doing ____ at the same time. (Paragraph 1)', 'different things', 'Bài: "they don\'t all do the same thing" → trái nghĩa của same → different things (MINI TIP 06.1).'],
          ['You can send and receive emails ____ server. (Paragraph 2)', 'using a mail / with a mail / through a mail / on a mail', 'Bài: "a mail server for sending and receiving emails" → using a mail server.'],
          ['The client ____ from one computer to another using a server. (Paragraph 3)', 'sends information / delivers information', 'Bài: "gets information from a server and delivers it to another computer" → sends information.'],
          ['Your smartphone becomes the client when you use it ____. (Paragraph 3)', 'to go online', 'Bài: "When you go online on your smartphone, you are using it as a client" → to go online.'],
          ['The client finds the photo by ____ from the server, which stores it. (Paragraph 4)', 'searching for information / searching for it', 'Bài: "the client, which searches for your information" → searching for information.'],
        ], 'Questions 1–5'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U10-L1',
      title: 'Mindset 0 · Unit 10 — Smartphones lecture (Part 1)',
      description: 'A short lecture about the design of smartphones.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_18.mp3',
      transcript: LECTURE1,
      questionGroups: [
        Object.assign(qFill(1, 'Look at the diagram. Listen to Part 1 of the lecture and complete the reason why a smartphone has each part. Write TWO or THREE words for each answer.', [
          ['1 touch screen or display — to ____', 'use an app', lx('Màn hình — để ___', 'Phần đầu.', 'you only need to press your finger on this when you want to use an app', 'use an app.')],
          ['2 power button — to turn the phone ____', 'on or off', lx('Nút nguồn — để bật/tắt máy', 'Ngay sau display.', 'You use this to turn the phone on or off again', 'on or off.')],
          ['3 USB input — to ____ (two things)', 'charge your phone, upload files / charge, upload files', lx('Cổng USB — để ___ (hai việc)', 'Phần cuối máy.', ['This is where you plug in and charge your phone', 'upload your files and photos'], 'MINI TIP 08.2: cần nêu CẢ HAI việc: sạc và tải tệp lên.')],
          ['4 microphone — to ____ when you phone someone', 'speak into', lx('Micro — để ___ khi gọi điện', 'Ngay trên cổng USB.', 'Whenever you make a call, you speak into this', 'speak into.')],
          ['5 power bar — to ____', 'check the battery', lx('Thanh pin — để ___', 'Đầu đối diện màn hình.', 'you can look at to check the battery', 'check the battery.')],
          ['6 case — to ____', 'protect the phone', lx('Vỏ — để ___', 'Cuối Part 1.', ['Many people think that the reason for the case is so that they can have a different design', 'every phone needs a good, strong case to protect the phone from breaking'], 'BẪY: nhiều người nghĩ vỏ để trang trí ("Actually…") → protect the phone.')],
        ], 'Questions 1–6'), { groupType: 'map', imageUrl: 'media:m0u10-phone.jpg' }),
      ],
    },
    {
      ref: 'M0-U10-L2',
      title: 'Mindset 0 · Unit 10 — Smartphones lecture (Part 2)',
      description: 'How many people own a smartphone — now and in the future.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_19.mp3',
      transcript: LECTURE2,
      questionGroups: [
        qTable('Listen to Part 2 of the lecture and complete the table. Write A NUMBER for each answer.', ['Year', '% of population with smartphones'], [
          ['2010', '__Q1__'], ['2015', '__Q2__'], ['2020', '__Q3__'], ['2025', '__Q4__'],
        ], { 1: '38', 2: '62', 3: '78', 4: '86' }, {
          1: lx('Năm 2010', 'Đầu Part 2.', "In 2010, 38 percent of the world's population owned a smartphone", '38.'),
          2: lx('Năm 2015', 'Ngay sau.', 'In 2015, 62 percent of all people had one', '62.'),
          3: lx('Năm 2020', 'Phần dự đoán.', 'by 2020, 78 percent of the population will own one', '78.'),
          4: lx('Năm 2025', 'Cuối bài.', ['Not as high as 100%, but close', 'in that year, when 86 percent will own one'], '100% chỉ là để so sánh → 86.'),
        }, 'Questions 1–4'),
      ],
    },
    {
      ref: 'M0-U10-L3',
      title: "Mindset 0 · Unit 10 — Lorenzo's new phone",
      description: 'Lorenzo answers questions about a piece of technology he would like to buy.',
      partNumber: 2,
      audioFile: 'MindsetIELTS_Foundation_20.mp3',
      transcript: LORENZO,
      questionGroups: [
        qMcq(1, 'Listen to Lorenzo answer the question "Describe a piece of technology that you would like to buy in the future." Which question does each answer (1–4) respond to?', [
          ['Answer 1 responds to…', ['How will it make your life better?', 'What does it look like?', 'Why is it so popular?'], 'B', lx('Câu trả lời 1', 'Câu 1.', 'It has a silver case, and the screen is bigger than most other smartphones', 'Mô tả vẻ ngoài → What does it look like?')],
          ['Answer 2 responds to…', ['How much does it cost?', 'Where do you want to buy it from?', 'Why do you want to buy it?'], 'B', lx('Câu trả lời 2', 'Câu 2.', ["before I buy it, I'm going to visit a mobile phone shop first", "I'm definitely going to get it online in the end"], 'BẪY: có "very expensive" nhưng ý chính là mua ở đâu → online.')],
          ['Answer 3 responds to…', ['Why do you want to buy it?', 'Why is it so popular?', 'What does it look like?'], 'A', lx('Câu trả lời 3', 'Câu 3.', "The Plus 6 is even faster… so that's why I'm going to get it", 'Lý do cá nhân muốn mua → Why do you want to buy it?')],
          ['Answer 4 responds to…', ['How much does it cost?', 'How will it make your life better?', 'Where do you want to buy it from?'], 'B', lx('Câu trả lời 4', 'Câu 4.', "I'm not sure if it will help me with everything… I think it will be helpful for some things", 'Giúp ích cuộc sống thế nào → How will it make your life better?')],
        ], 'Questions 1–4'),
        qFill(5, 'Complete the words from Lorenzo\'s answers.', [
          ['Important and interesting parts of a device: ____', 'features', lx('Các phần quan trọng, thú vị của thiết bị', 'Câu 2.', 'so I can try all the new features', 'features.')],
          ['The newest device you can buy: ____', 'latest model', lx('Thiết bị mới nhất', 'Câu 3.', 'the Plus 5, is the latest model', 'latest model.')],
          ['A device that is old: ____', 'out of date', lx('Thiết bị cũ', 'Câu 3.', 'seem out of date soon', 'out of date.')],
        ], 'Questions 5–7'),
      ],
    },
  ],
};
