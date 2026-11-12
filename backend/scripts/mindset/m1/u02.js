// Mindset for IELTS Level 1 — Unit 2: Places and buildings (Reading pp. 24–29 · Listening pp. 35–38)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qFill, lx, html } = require('../dsl');

const SLOT = 1; // sách của lớp: Unit 1–2 → Sổ 1

const HOMES = `## Amazing homes

Most people live in a house or a flat. When they go on holiday they stay in a hotel or a guest house. But some places where you can live or stay are a bit different.

**1** One unusual place to live is a houseboat. Amsterdam in Holland is famous for its houseboats – there are about 2,500 of them. They have everything that a normal house has: a living room, bedroom, kitchen, bathroom and even sometimes a terrace on the roof. They are cheaper than houses and people who live on houseboats enjoy being close to nature. Some houseboats can be moved to other parts of the river, while others are permanently in one place.

**2** In Tokyo, Japan, there is a see-through house. It is like a normal Japanese house but all the walls are made of glass. There is plenty of daylight but no privacy. Architect Sou Fujimoto designed it for a couple to make their home. He based his ideas on early man living in trees. It wouldn't suit everyone but the couple who live there love the feeling of being surrounded by the natural world.

**3** All around the world, people live in homes made from shipping containers. Some use only one container, while others are made from several containers joined together. One house in Chile was built from 12 containers. They are cheap to buy and eco-friendly. They can also be placed in the garden or drive as guest rooms, studies or utility rooms.

**4** In Germany, you can stay in a one-metre-square house, the smallest house in the world, called the House NA. Van Bo Le-Mentzel, a refugee from Laos, built it to draw attention to the world housing shortage. It is a wooden structure on wheels and weighs 40 kg. It has a locking door and a window. You can turn it onto its side when you want to lie down. Franz from Munich spent the night in one recently 'just to see what it was like'. He found it a bit uncomfortable!

**5** For an unusual holiday you can stay in an igloo, a house made of ice. These can be found in several countries including Sweden, Norway and Finland. They are built new every winter. Jenny and Callum, visitors from Australia, told us, 'We slept in an igloo last night. It's so cold here – minus 5 degrees centigrade. We used reindeer skins to keep warm!'

**6** Another couple, Shaun and Rachel from Manchester, enjoyed a recent holiday in a treehouse in Sussex, England. They said, 'It was right up in the trees and had everything we needed, even wifi! It had a small kitchen and we did our own cooking. It was the perfect place to get away from our busy lives.'`;

const HOME_FROM_HOME = `## Home from home

**I remember feeling the first time I left home that I would never be able to feel at home anywhere but in my home. No other place would have my mum and dad, my annoying little brother and my cat, Tilly. Nowhere would smell like my home – my mum's roast chicken in the oven and the salty, seaweed smell that drifted in from the nearby beach. The sound of seagulls squawking was the sound of home. Nowhere else would I feel comfortable enough to put my feet up under me and gaze into the log fire dreaming of the future.**

I was 15 when I first went away from home on a school trip to Germany. My friends were going too, but we would all stay with different families. I was nervous about this. I knew the home I was going to would not be as comfortable as mine, the family would not be as kind, and who knew what the German food would be like? I knew I would spend three weeks, homesick and sad, missing my family back home.

We arrived in Germany late at night after a long journey by coach and boat. I was tired and hungry. We went into the school hall, where the host families were waiting to meet us. I wondered which one would be mine. Would they give me dinner at this time and would I be able to eat the unfamiliar food? Suddenly I heard my name called and the name of my exchange partner, Brigitte Schmitt. A pretty, blonde girl stepped forward, smiling widely. Behind her stood her parents, a pleasant-looking couple who were also smiling. They held out their hands and said, 'Willkommen in Deutschland. Welcome to Germany.'

I spent three happy weeks with the Schmitt family. Brigitte had an elder brother, Hendrik, and a younger sister, Lisa. They had two cats, Ping and Pong, who sat on my lap as I looked into the fire in the evenings. The whole family were kind and welcoming. My room was cosy and warm and looked out onto a forest. The fresh clean smell of the trees and of apples baking in the oven became familiar and comforting, like the smells of home. I learnt in those three weeks that you can feel at home anywhere that people are kind to you.

Later that year, Brigitte came to stay with me in the UK. I gave her my room and moved in with my brother. I cleared space for her clothes and put fresh flowers in a vase by the bed. I asked my mum to make her famous roast chicken and an apple pie to make our guest feel at home. We made a welcome banner and put it up on the front door. I did everything I could to help Brigitte feel at home with us. I now understood the importance of a warm welcome.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

// ── audioscripts ──
const T15 = `Conversation 1
Man: Good morning, how can I help you?
Woman: Hello, I'd like some information about your facilities.
Man: OK, well we have a swimming pool, squash courts, a gym and we have a couple of outdoor tennis courts too. You may have seen them on the left as you came in. Now, our website tells you how you can become a member and how much the yearly fee is. Do you want to make a note of the address?

Conversation 2
Bank clerk: Good afternoon, can I help you?
Customer: I'd like to open a new account please.
Bank clerk: Certainly – now, is it a basic account you're looking to open or a savings account?
Customer: A savings account.
Bank clerk: Right – we can complete your application online. I'll just get the form up on screen now. It won't take long.`;

const T16 = `Conversation 1
Man: Good morning, how can I help you?
Woman: Hello, I'd like some information about your facilities.
Man: OK, well we have a swimming pool, squash courts, a gym and we have a couple of outdoor tennis courts too. You may have seen them on the left as you came in. Now, our website tells you how you can become a member and how much the yearly fee is. Do you want to make a note of the address?
Woman: Oh, yes please. I'll just put it on my phone now.
Man: OK, it's www dot getactive dot com. That's G-E-T-A-C-T-I-V-E dot com.
Woman: 'Get active' – is that all one word?
Man: Yes, that's right.
Woman: OK, I've got that. Thanks very much for your help.

Conversation 2
Bank clerk: Good afternoon, can I help you?
Customer: I'd like to open a new account, please.
Bank clerk: Certainly – now, is it a basic account you're looking to open or a savings account?
Customer: A savings account.
Bank clerk: Right, we can complete your application online. I'll just get the form up on screen now. It won't take long. So, I just need a few personal details. Can you give me your full name, please?
Customer: James Clarke.
Bank clerk: Is that Clark with an 'e' or without?
Customer: It's got an 'e' at the end. C-L-A-R-K-E.
Bank clerk: And where do you live? What's your address?
Customer: 2 Waddington Road.
Bank clerk: Can you spell that for me?
Customer: That's W-A-double D-I-N-G-T-O-N Road.
Bank clerk: Is that Waddington with a double D, did you say?
Customer: That's right.
Bank clerk: OK, so I just need a little more information about …`;

const T17 = `Man: Do you want to make a note of the address?
Woman: Oh, yes please. I'll just put it on my phone now.
Man: OK, it's www dot getactive dot com. That's G-E-T-A-C-T-I-V-E dot com.
Woman: 'Get active' – is that all one word?
Man: Yes, that's right.

Bank clerk: So, I just need a few personal details. Can you give me your full name, please?
Customer: James Clarke.
Bank clerk: Is that Clark with an 'e' or without?
Customer: It's got an 'e' at the end. C-L-A-R-K-E.
Bank clerk: And where do you live? What's your address?
Customer: 2 Waddington Road.
Bank clerk: Can you spell that for me?
Customer: That's W-A-double D-I-N-G-T-O-N Road.
Bank clerk: Is that Waddington with a double D, did you say?
Customer: That's right.`;

const T18 = `A: I really enjoyed that little place we went to last weekend – there was a really good choice of meat and fish, wasn't there?
B: Did you really think so? I wish I could say the same, but actually, I thought it was pretty limited. There were far too many fish dishes on the menu and I can't stand seafood. There just wasn't enough meat.
A: Oh, come on Jo! We really enjoyed the steak we had, and you said that the beef the people on the other table were eating looked delicious too.
B: Well, I won't be going back. It was much too expensive.
A: Well, I thought it was pretty reasonable. In fact I couldn't believe it when the bill arrived. £40, including a tip. That's only £20 per person. You can't get steak for less than £15 anywhere in town.`;

const T19 = `David: Hi, Leila! Where are you? We need to leave for the party soon.
Leila: I'm on my way home – I'm still waiting for the bus. I was going to get a taxi back but I've just checked my phone and there's a bus due in about 15 minutes – 7.50 pm to be exact. And it seems to be running on time. It left the railway station a couple of minutes ago, so it's not too far away.
David: Do you want me to pick you up? I've got the car, so it's no problem. Where's the bus stop exactly?
Leila: It's the one on Blythe Road.
David: Blythe Road? I'm just checking it on my phone. Is that B-L-Y-T-H?
Leila: There's an e at the end of Blythe.
David: Got it. OK, I won't be long.
Leila: Actually, David – no need to pick me up. The traffic lights have just changed and I can see the bus coming now. I'd better go – I'll see you at home in a few minutes.`;

const T20 = `Darren: Hi there, Alicia! How was your weekend? You were on a sailing course down at the harbour, weren't you?
Alicia: That's right – I really enjoyed breathing in all that fresh sea air. It was only two days but the time flew by! The instructor began by teaching us safety rules, which was necessary, but not very exciting. But then on the first morning we learnt how to open the sails and I even learnt how to turn the boat. The water wasn't as calm as it looked, I can tell you – I lost my balance a few times!
Darren: Sounds like you had a lot of fun. I'd love to learn to sail.
Alicia: Well, there are plenty of courses and I think they run them once a month – so just let me check the website here. OK, so this was my course here – see – 4th and 5th of August. Now you could sign up for the next one, at the beginning of September. And it looks like there are still some spaces available.
Darren: So, the next one starts on 1st of September? I think I could do that.
Alicia: Well, let me give you the name of the course leader so that you can give him a call. He's a really experienced sailor … OK, it's Jon Galloway.
Darren: Is that the usual spelling of John?
Alicia: No, there's no 'H' – he's just J-O-N.
Darren: OK, got you. And did you say his surname's Galloway? Can you spell that for me?
Alicia: Yes – Galloway – that's G-A-double L-O-W-A-Y. And I've got his number too. Why don't you give him a ring?`;

const T21 = `Jon: So, how's your very first week at university going, Rita? It's Orientation Week for all you new students, isn't it?
Rita: Yes, that's right – Orientation Week. Yes, it's great fun – there are so many different events going on to help us make friends and find our way around the university. And to get around the city, come to that! But you'll remember all that, Jon. You were a new student once!
Jon: That's true. I remember I went on a walking tour of the city on my first day. And I think some students did a bus tour.
Rita: Well, I did a bike tour – I was sent an email about it and I decided to sign up. There were only eight places and there were seven other names on the list already, so I got the very last place.
Jon: I didn't know you had a bike.
Rita: I don't have a bike but that didn't matter. We all hired them – from a little cycle hire shop on Barkway Street. You probably know the place.
Jon: Barclay Street? Do you mean the 'Barclay Street' on campus?
Rita: No, it's Barkway Street – B-A-R-K-W-A-Y. Number 22 Barkway Street, to be exact. It was great – we could choose a traditional bike or an electric one.
Jon: So I take it you went electric!
Rita: Yes, of course I did! Well, think about it – why ride a traditional bike when you can get around the city much faster on an electric one! And because there was a group of us, it wasn't too expensive. In fact the cycle hire was only $120 for the whole group. So the cost was only $15 per person and that was for three whole hours!
Jon: Did you say $50?
Rita: No, $15. So I thought it was really quite cheap. And I didn't have to bring along a helmet to wear either. That was included – and we also got a lock, so it was easy to park our bikes safely when we wanted to stop and take a break!
Jon: Sounds good. Have you got the website address of the place you got your bike from? I quite like the idea of doing a bike tour.
Rita: Yes – it's a really easy one to remember. It's tradelectric.com`;

module.exports = {
  n: 2,
  title: 'Places and buildings',
  titleVi: 'Nơi chốn và công trình',
  pages: '24–29, 35–38',
  outcomes: [
    'Reading: skimming & scanning; nhận diện paraphrase; sentence completion (chép từ trong bài)',
    'Grammar: hiện tại đơn và quá khứ đơn trong bài đọc',
    'Listening: short-answer questions; nghe đánh vần tên riêng, địa chỉ, website',
    'Từ vựng nhà ở, công trình và địa điểm trong thành phố (Sổ 1)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: unusual homes',
      titleEn: 'Lead-in · Skimming and scanning (pp. 24–26)',
      slot: SLOT,
      minutes: 35,
      objectives: ['Gọi tên các kiểu nhà đặc biệt: treehouse, houseboat, igloo, shipping container home', 'Skim bài "Amazing homes" trong 1 phút để nắm ý chính', 'Phân biệt skimming và scanning'],
      images: ['media:m1u02-homes.jpg|Ex. 3 (p. 25): A–D — find the igloo, treehouse, houseboat and shipping container homes'],
      theory: [
        card('Skimming và scanning', 'Skimming and scanning a text', {
          formula: ['**Skimming** = đọc lướt nhanh để biết bài nói về **cái gì** (ý chính).', '**Scanning** = đọc lướt để **tìm một thông tin cụ thể** (từ khoá, số, tên riêng).'],
          usage: [
            'Trước khi xem câu hỏi: đọc lướt cả bài **không quá 1 phút**.',
            'Bỏ qua từ chức năng (the, they, our, through); để ý **từ nội dung** — danh từ, động từ.',
            'Đọc câu hỏi → scan tìm từ khoá hoặc từ đồng nghĩa → đọc kỹ đoạn đó.',
          ],
        }),
      ],
      vocab: [
        ['luxury apartment', 'căn hộ cao cấp', 'I would like to live in a luxury apartment in the city.'],
        ['treehouse', 'nhà trên cây', 'They enjoyed a holiday in a treehouse in Sussex.'],
        ['houseboat', 'nhà thuyền', 'Amsterdam is famous for its houseboats.'],
        ['shipping container', 'công-te-nơ vận chuyển hàng', 'People live in homes made from shipping containers.'],
        ['guest house', 'nhà nghỉ', 'When they go on holiday they stay in a hotel or a guest house.'],
        ['terrace', 'sân thượng, sân hiên', 'Some houseboats even have a terrace on the roof.'],
        ['be close to nature', 'gần gũi với thiên nhiên', 'People who live on houseboats enjoy being close to nature.'],
        ['permanently', 'cố định, vĩnh viễn', 'Others are permanently in one place.'],
        ['transparent', 'trong suốt', 'The couple live in a transparent house.'],
        ['daylight', 'ánh sáng ban ngày', 'There is plenty of daylight but no privacy.'],
        ['privacy', 'sự riêng tư', 'A glass house has no privacy.'],
        ['architect', 'kiến trúc sư', 'Architect Sou Fujimoto designed it.'],
        ['be surrounded by', 'được bao quanh bởi', 'They love being surrounded by the natural world.'],
        ['the natural world', 'thế giới tự nhiên', 'They love the feeling of being surrounded by the natural world.'],
        ['eco-friendly', 'thân thiện với môi trường', 'Containers are cheap to buy and eco-friendly.'],
        ['utility room', 'phòng tiện ích (giặt giũ, để đồ)', 'They can be used as studies or utility rooms.'],
        ['refugee', 'người tị nạn', 'Van Bo Le-Mentzel, a refugee from Laos, built it.'],
        ['draw attention to', 'thu hút sự chú ý đến', 'He built it to draw attention to the world housing shortage.'],
        ['housing shortage', 'tình trạng thiếu nhà ở', 'There is a housing shortage all over the world.'],
        ['wooden structure', 'kết cấu bằng gỗ', 'It is a wooden structure on wheels.'],
        ['uncomfortable', 'không thoải mái', 'He found it a bit uncomfortable!'],
        ['get away from', 'thoát khỏi, tránh xa', 'It was the perfect place to get away from our busy lives.'],
        ['busy lives', 'cuộc sống bận rộn', 'We wanted to get away from our busy lives.'],
        ['well equipped', 'được trang bị đầy đủ', 'The treehouse was very well equipped.'],
        ['occupant', 'người cư ngụ', 'Houseboat occupants like living close to nature.'],
        ['make sb feel at home', 'khiến ai thấy thoải mái như ở nhà', 'I did everything I could to make Brigitte feel at home.'],
        ['homesick', 'nhớ nhà', 'I knew I would spend three weeks homesick and sad.'],
        ['school trip', 'chuyến đi do trường tổ chức', 'I first went away from home on a school trip.'],
        ['host family', 'gia đình bản xứ (nhận khách ở cùng)', 'The host families were waiting to meet us.'],
        ['exchange partner', 'bạn trong chương trình trao đổi', 'I heard the name of my exchange partner.'],
        ['unfamiliar', 'lạ lẫm, không quen thuộc', 'Would I be able to eat the unfamiliar food?'],
        ['welcoming', 'niềm nở, hiếu khách', 'The whole family were kind and welcoming.'],
        ['cosy', 'ấm cúng', 'My room was cosy and warm.'],
        ['familiar', 'quen thuộc', 'The smell of apples baking became familiar.'],
        ['comforting', 'dễ chịu, an ủi', 'The smells became familiar and comforting.'],
        ['a warm welcome', 'sự chào đón nồng hậu', 'I now understood the importance of a warm welcome.'],
      ],
      ex: [
        match('Types of homes (Ex. 3)', 'Find these in the pictures A–D: igloo, treehouse, houseboat, shipping container homes.', [
          ['Picture A', 'treehouse'], ['Picture B', 'shipping container homes'], ['Picture C', 'igloo'], ['Picture D', 'houseboat'],
        ], { stimulus: picture('media:m1u02-homes.jpg', 'Ex. 3') }),
        mcq('What is the passage about? (Ex. 4)', 'Read "Amazing homes" in ONE minute and choose one of the options.', [
          ['What is the passage about?', ['Life in different cities around the world', 'Unusual places to live or stay around the world', 'The type of houses and flats most people live in'], 'B', 'Câu mở đầu: "some places where you can live or stay are a bit different" + houseboat, nhà kính, container, igloo, treehouse → nơi ở khác thường. Đây là kỹ năng skimming (lấy ý chính).'],
        ], { stimulus: stim(HOMES, 'Amazing homes (p. 26)') }),
        mcq('Skimming or scanning? (Ex. 5–6)', 'Read the passage again to find the words igloo, treehouse, houseboat and shipping container homes as quickly as you can. Then answer the questions.', [
          ['In which paragraph is "igloo"?', ['Paragraph 2', 'Paragraph 4', 'Paragraph 5'], 'C', 'Đoạn 5: "you can stay in an igloo, a house made of ice".'],
          ['In which paragraph is "treehouse"?', ['Paragraph 1', 'Paragraph 6', 'Paragraph 3'], 'B', 'Đoạn 6: "a holiday in a treehouse in Sussex".'],
          ['Which activity practised SCANNING?', ['exercise 4 (What is the passage about?)', 'exercise 5 (finding the words quickly)'], 'B', 'Tìm một từ/thông tin cụ thể = scanning.'],
          ['Which activity practised SKIMMING?', ['exercise 4 (What is the passage about?)', 'exercise 5 (finding the words quickly)'], 'A', 'Đọc nhanh lấy ý chính = skimming.'],
        ], { stimulus: stim(HOMES, 'Amazing homes') }),
      ],
    },

    reading: {
      title: 'Reading: paraphrase & sentence completion',
      titleEn: 'Understanding paraphrase · Sentence completion · Exam skills (pp. 27–29)',
      minutes: 50,
      objectives: ['Nhận ra paraphrase — cùng ý nhưng khác từ', 'Làm sentence completion: chép đúng từ trong bài, đúng số từ, đúng ngữ pháp', 'Luyện đề: Home from home (6 câu, NO MORE THAN THREE WORDS)'],
      theory: [
        card('Paraphrase', 'Understanding paraphrase', {
          usage: ['Câu hỏi IELTS **không dùng y nguyên từ** trong bài: houseboats → *homes on the water*; privacy → *not being watched by others*; permanently → *forever, always*.', 'Khi scan, tìm **cả từ đồng nghĩa** của từ khoá, không chỉ chính từ đó.'],
        }),
        card('Sentence completion', 'How to do sentence completion questions', {
          formula: ['① Gạch chân từ khoá trong câu (houseboat occupants) → ② scan tìm từ khoá hoặc từ cùng nghĩa (people who live on houseboats) → ③ đọc kỹ câu quanh đó (like living = enjoy being) → ④ chọn từ điền vào.'],
          usage: ['Kiểm tra lại: **nghĩa** câu khớp với bài; **ngữ pháp** đúng; **số ít/số nhiều**; **đúng số từ** cho phép.', 'Ví dụ: Houseboat occupants like living ______ → **close to nature**.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U02-R1', title: 'Amazing homes — sentence completion (Ex. 9)', note: '4 câu, NO MORE THAN TWO WORDS.' },
        { ref: 'reading:M1-U02-R2', title: 'Exam skills: Home from home (Ex. 13)', note: '6 câu, NO MORE THAN THREE WORDS.' },
      ],
      ex: [
        match('Paraphrases (Ex. 7)', 'Match these words and phrases from the text (1–6) with their paraphrases (a–f).', [
          ['houseboats', 'homes on the water'],
          ['permanently', 'forever, always'],
          ['privacy', 'not being watched by others'],
          ['surrounded by the natural world', 'having nature all around'],
          ['uncomfortable', 'not feeling pleasant'],
          ['Sweden, Norway and Finland', 'Nordic countries'],
        ]),
        mcq('Choose the best paraphrase (Ex. 8)', 'Choose the best paraphrase for these sentences from the text.', [
          ['The treehouse had everything we needed.', ['We needed some more things for our stay in the treehouse.', 'The treehouse was very well equipped.', 'We need everything for the treehouse.'], 'B', 'had everything we needed = được trang bị đầy đủ (well equipped).'],
          ['Some houseboats can be moved to other parts of the river.', ['Not all houseboats are permanently fixed in one place.', 'Only some parts of the river have houseboats.', 'You can move to a houseboat in another part of the river.'], 'A', 'Một số nhà thuyền di chuyển được → không phải tất cả đều cố định.'],
          ['One house in Chile was built from 12 containers.', ['There are 12 houses in Chile made from containers.', '12 containers were used to make one house.', 'You need 12 containers to make a house in Chile.'], 'B', 'MỘT ngôi nhà, dùng 12 container. C sai vì nói như quy định chung.'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: present simple & past simple',
      titleEn: 'Grammar focus: past simple and present simple (p. 28)',
      minutes: 30,
      objectives: ['Biết vì sao bài đọc đổi thì: hiện tại đơn mô tả ngôi nhà, quá khứ đơn kể trải nghiệm', 'Chọn và chia đúng hiện tại đơn / quá khứ đơn'],
      keyLanguage: [
        '**Hiện tại đơn**: mô tả sự vật, thói quen, điều luôn đúng — Houseboats **have** everything a normal house has.',
        '**Quá khứ đơn**: kể trải nghiệm, việc đã xảy ra (thiết kế, xây dựng) — Sou Fujimoto **designed** it. We **slept** in an igloo last night.',
        'Dấu hiệu: now, nowadays, usually → hiện tại · last year, in 2010, once, in the past → quá khứ.',
      ],
      theory: [
        card('Nhận diện thì khi đọc lướt', 'Tenses in a passage', {
          usage: ['Lần đọc lướt đầu tiên, để ý bài viết chủ yếu ở **quá khứ, hiện tại hay tương lai**, và thì có **thay đổi** không — giúp bạn hiểu bài nhanh hơn (TIP của sách).'],
          examples: [['Most people in China live in flats.', 'Sự thật chung → hiện tại đơn.'], ['In 2010, my parents moved to Australia.', 'Mốc quá khứ → quá khứ đơn.']],
        }),
      ],
      links: [{ grammar: 'present-simple', title: 'Present Simple', note: 'mô tả, sự thật chung' }, { grammar: 'past-simple', title: 'Past Simple', note: 'kể lại trải nghiệm' }],
      ex: [
        mcq('Tenses in "Amazing homes" (Ex. 10)', 'Answer these questions about the Amazing homes passage.', [
          ['Which tenses does the passage use?', ['present tenses', 'past tenses', 'both present and past tenses'], 'C'],
          ['Which tense is used to describe the houses?', ['present simple', 'past simple'], 'A', 'They have everything that a normal house has…'],
          ['Which tense is used to describe habit or things that are always true?', ['present simple', 'past simple'], 'A', 'Most people live in a house or a flat.'],
          ["Which tense is used to describe people's experiences on holidays?", ['present simple', 'past simple'], 'B', 'We slept in an igloo last night… We used reindeer skins…'],
          ['Which tense is used to talk about designing or building the house?', ['present simple', 'past simple'], 'B', 'Sou Fujimoto designed it… One house in Chile was built from 12 containers.'],
        ]),
        mcq('Present simple or past simple? (Ex. 11)', 'Choose the correct verb, present simple or past simple.', [
          ['Most people in China ____ in flats.', ['live', 'lived'], 'A', 'Sự thật hiện tại.'],
          ['In the UK most houses ____ gardens.', ['have', 'had'], 'A'],
          ['In 2010, my parents ____ to Australia.', ['move', 'moved'], 'B', 'In 2010 → quá khứ.'],
          ['Nowadays Sarah usually ____ her holidays in cities.', ['spends', 'spent'], 'A', 'Nowadays, usually → hiện tại đơn.'],
          ['In the past she ____ beach holidays.', ['prefers', 'preferred'], 'B', 'In the past → quá khứ.'],
        ]),
        gap('Correct form of the verb (Ex. 12)', 'Complete the sentences with the correct form of the verb in brackets.', [
          ['Farid now ____ (share) a flat with some other students.', 'shares', 'now + chủ ngữ số ít → shares.'],
          ['Last year he ____ (live) at home with his parents.', 'lived'],
          ['Once I ____ (stay) on a campsite next to a lake in Italy.', 'stayed', 'Once (đã từng một lần) → quá khứ.'],
          ['My flat ____ (have) two balconies.', 'has'],
          ['In 2014 we ____ (move) into our new house.', 'moved'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: short-answer questions & spelling names',
      titleEn: 'Lead-in · Spelling names · Short-answer questions · Exam skills (pp. 35–38)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Từ vựng địa điểm trong thành phố', 'Nghe đánh vần: double D, "with an e", all one word', 'Đọc câu hỏi, đoán loại đáp án (số, ngày, tên, nơi chốn…)', 'Short-answer: đúng số từ, đúng chính tả, viết số bằng chữ số'],
      images: ['media:m1u02-places.jpg|Ex. 1 (p. 35): places in a town A–G'],
      theory: [
        card('Nghe đánh vần tên riêng', 'Spelling names', {
          usage: ['Section 1 hay có **tên người, tên đường, website** — thường được **đánh vần một lần** duy nhất. Sai một chữ là mất điểm.', 'Cụm hay gặp: **double D** = DD · **with an "e" (at the end)** = có chữ e (Clark**e**) · **all one word** = viết liền (getactive) · **no "H"** = Jon (không phải John).', 'Ôn bảng chữ cái: dễ nhầm **A/E/I**, **G/J**, **B/V**, **M/N**.'],
        }),
        card('Short-answer questions', 'Short-answer questions in Listening', {
          formula: ['① Đọc câu hỏi, gạch chân **từ khoá** → ② đoán **loại thông tin** (a date, a price, a time, a place, a name…) → ③ nghe và viết đúng **số từ cho phép**.'],
          usage: ['Viết số bằng **chữ số** (7.50, 15) — nhanh hơn và ít sai chính tả hơn.', 'Đáp án "shoes" đúng; "he bought shoes" = 3 từ → SAI nếu đề cho ONE WORD.', 'Hay có bẫy **sửa lại**: "Did you say $50?" – "No, $15."'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U02-L1', title: 'Two short conversations: where are the speakers? (Ex. 3)', note: 'Nghe xem người nói đang ở đâu.' },
        { ref: 'listening:M1-U02-L2', title: 'Spelling names (Ex. 4–5)', note: 'Website, tên người, địa chỉ được đánh vần.' },
        { ref: 'listening:M1-U02-L3', title: 'A meal out (Ex. 9)', note: 'NO MORE THAN ONE WORD AND/OR A NUMBER.' },
        { ref: 'listening:M1-U02-L4', title: 'Waiting for the bus (Ex. 11)', note: '7.15 hay 7.50? Blythe viết thế nào?' },
        { ref: 'listening:M1-U02-L5', title: 'A sailing course (Ex. 12)', note: '4 câu short-answer.' },
        { ref: 'listening:M1-U02-L6', title: 'Exam skills: a bike tour in Orientation Week (Ex. 15)', note: '8 câu — kiểm tra chính tả và số từ.' },
      ],
      vocab: [
        ['facilities', 'cơ sở vật chất, tiện nghi', "I'd like some information about your facilities."],
        ['squash court', 'sân bóng quần', 'We have a swimming pool and squash courts.'],
        ['become a member', 'trở thành hội viên', 'Our website tells you how you can become a member.'],
        ['yearly fee', 'phí hằng năm', 'How much is the yearly fee?'],
        ['make a note of', 'ghi lại', 'Do you want to make a note of the address?'],
        ['open an account', 'mở tài khoản', "I'd like to open a new account."],
        ['savings account', 'tài khoản tiết kiệm', 'Is it a basic account or a savings account?'],
        ['complete an application', 'hoàn thành đơn đăng ký', 'We can complete your application online.'],
        ['personal details', 'thông tin cá nhân', 'I just need a few personal details.'],
        ['a good choice of', 'nhiều lựa chọn về', 'There was a really good choice of meat and fish.'],
        ['far too many', 'quá nhiều', 'There were far too many fish dishes.'],
        ["can't stand", 'không chịu nổi', "I can't stand seafood."],
        ['much too expensive', 'quá đắt', 'It was much too expensive.'],
        ['including a tip', 'đã bao gồm tiền boa', '£40, including a tip.'],
        ['pick sb up', 'đón ai', 'Do you want me to pick you up?'],
        ['be due', 'dự kiến đến (xe, tàu)', "There's a bus due in about 15 minutes."],
        ['run on time', 'chạy đúng giờ', 'It seems to be running on time.'],
        ['traffic lights', 'đèn giao thông', 'The traffic lights have just changed.'],
        ['harbour', 'bến cảng', 'You were on a sailing course down at the harbour.'],
        ['sailing course', 'khóa học chèo thuyền buồm', 'I went on a sailing course at the weekend.'],
        ['breathe in fresh air', 'hít thở không khí trong lành', 'I really enjoyed breathing in all that fresh sea air.'],
        ['the time flew by', 'thời gian trôi thật nhanh', 'It was only two days but the time flew by!'],
        ['instructor', 'người hướng dẫn', 'The instructor began by teaching us safety rules.'],
        ['safety rules', 'quy tắc an toàn', 'First we learnt the safety rules.'],
        ["lose one's balance", 'mất thăng bằng', 'I lost my balance a few times!'],
        ['sign up for', 'đăng ký tham gia', 'You could sign up for the next one.'],
        ['experienced', 'giàu kinh nghiệm', "He's a really experienced sailor."],
        ['give sb a ring', 'gọi điện cho ai', "Why don't you give him a ring?"],
        ['Orientation Week', 'tuần lễ định hướng cho tân sinh viên', "It's Orientation Week for all you new students."],
        ["find one's way around", 'làm quen, biết đường đi lối lại', 'Events help us find our way around the university.'],
        ['walking tour', 'chuyến tham quan đi bộ', 'I went on a walking tour of the city.'],
        ['hire', 'thuê', 'We all hired bikes from a little shop.'],
        ['electric', 'chạy bằng điện', 'We could choose a traditional bike or an electric one.'],
        ['helmet', 'mũ bảo hiểm', 'A helmet was included.'],
      ],
      ex: [
        match('Places in a town (Ex. 1)', 'Here are some pictures of places in a town. Match pictures A–G with the words in the box: railway station, museum, bank, harbour, sports centre, restaurant, bus stop.', [
          ['Picture A', 'sports centre'], ['Picture B', 'museum'], ['Picture C', 'bank'], ['Picture D', 'railway station'],
          ['Picture E', 'bus stop'], ['Picture F', 'restaurant'], ['Picture G', 'harbour'],
        ], { stimulus: picture('media:m1u02-places.jpg', 'Ex. 1') }),
        cat('Groups of places (Ex. 2)', 'Put the words in exercise 1 into the correct group.', { t: 'Travel and transport', s: 'Sports and leisure', a: 'Arts and culture', m: 'Money' }, [
          ['harbour', 't'], ['bus stop', 't'], ['railway station', 't'], ['sports centre', 's'], ['restaurant', 's'], ['museum', 'a'], ['bank', 'm'],
        ]),
        match('Which kind of answer? (Ex. 6–7)', 'Read the questions. Underline the key words. Which kind of information does each question need?', [
          ['1 What did the speakers order in the restaurant?', 'a meal or a kind of food'],
          ['2 How much did each person pay for their meal?', 'a price'],
          ['3 What time is the bus due?', 'a time'],
          ['4 Where is the bus stop?', 'a place'],
          ['5 How long did the course last?', 'a period of time'],
          ['6 Which TWO things did the speaker do on the course?', 'the names of activities or skills'],
          ['7 What is the date of the next course?', 'a date'],
          ['8 Who will lead the course?', 'a name of a person'],
        ]),
        cat('Do you need a number? (Ex. 8)', 'Look at the questions in exercise 7. For which questions do you need to write a number?', { num: 'Needs a number', no: 'No number' }, [
          ['1 What did the speakers order in the restaurant?', 'no'],
          ['2 How much did each person pay for their meal?', 'num', 'Giá tiền.'],
          ['3 What time is the bus due?', 'num', 'Giờ (7.50).'],
          ['4 Where is the bus stop?', 'no'],
          ['5 How long did the course last?', 'num', 'Khoảng thời gian (2 days).'],
          ['6 Which TWO things did the speaker do on the course?', 'no'],
          ['7 What is the date of the next course?', 'num', 'Ngày tháng (1st September).'],
          ['8 Who will lead the course?', 'no'],
        ]),
        mcq('Word limits (Ex. 10)', 'Answer the question. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. "What did the boy buy in the shopping mall?"', [
          ['Which answer is correct?', ['shoes', 'he bought shoes'], 'A', '"he bought shoes" = 3 từ, đề chỉ cho phép ONE WORD AND/OR A NUMBER → sai.'],
        ]),
        mcq('Check your answers (Ex. 11, 13)', 'Answer the questions about the exam rules.', [
          ['"What time is the bus due?" The speaker says "7.50 pm to be exact". Which answer is correct?', ['seven fifteen', 'seven fiftty', '7.15', '7.50'], 'D', '7.50 đúng; "seven fiftty" sai chính tả; 7.15 / seven fifteen là sai giờ.'],
          ['"Where is the bus stop?" The speaker says "There\'s an e at the end of Blythe." Which answer is correct?', ['Blithe Road', 'Blith Road', 'Blythe Road', 'Blyth Road'], 'C'],
          ['In the Exam skills task, which questions need a number ONLY?', ['questions 3 and 5', 'questions 1 and 2', 'questions 4 and 8'], 'A', 'Q3 How many people (8), Q5 How much ($15). Q4 là địa chỉ — có số NHƯNG có cả tên đường.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U02-R1',
      title: 'Mindset 1 · Unit 2 — Amazing homes',
      content: html(HOMES),
      questionGroups: [
        qFill(1, 'Complete the sentences. Choose NO MORE THAN TWO WORDS from the passage for each answer.', [
          ["The two people who live in the transparent house love it, but it wouldn't ______.", 'suit everyone', 'Đoạn 2: "It **wouldn\'t suit everyone** but the couple who live there love the feeling…" — transparent = see-through, made of glass.'],
          ['The designer of the smallest house hopes to ______ to the lack of houses all over the world.', 'draw attention', 'Đoạn 4: "built it to **draw attention** to the world housing shortage" (lack of houses = housing shortage).'],
          ['People who stay in igloos sometimes protect themselves from the cold by making use of ______.', 'reindeer skins', 'Đoạn 5: "We used **reindeer skins** to keep warm!" (making use of = used; protect from the cold = keep warm).'],
          ['People who have ______ would find a holiday in a treehouse ideal.', 'busy lives', 'Đoạn 6: "It was the perfect place to get away from our **busy lives**." (ideal = perfect place).'],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M1-U02-R2',
      title: 'Mindset 1 · Unit 2 — Home from home',
      content: html(HOME_FROM_HOME),
      questionGroups: [
        qFill(1, 'Read the passage and complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer.', [
          ["The writer's mother often cooks ______.", 'roast chicken', 'Đoạn 1: "my mum\'s **roast chicken** in the oven"; đoạn cuối: "her famous roast chicken".'],
          ['She thought the visit to Germany would make her feel ______.', 'homesick and sad', 'Đoạn 2: "I knew I would spend three weeks, **homesick and sad**".'],
          ['Brigitte came to pick up the girl with ______.', 'her parents', 'Đoạn 3: "Behind her stood **her parents**, a pleasant-looking couple".'],
          ["The Schmitt family's pets' names are ______.", 'Ping and Pong', 'Đoạn 4: "They had two cats, **Ping and Pong**". BẪY: Tilly là mèo của tác giả.'],
          ['From her bedroom the girl could see a ______.', 'forest', 'Đoạn 4: "My room was cosy and warm and looked out onto a **forest**."'],
          ['The girl and her family tried hard to make Brigitte ______.', 'feel at home / feel welcome', 'Đoạn cuối: "I did everything I could to help Brigitte **feel at home** with us." (tried hard = did everything I could).'],
        ], 'Questions 1–6'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U02-L1', title: 'Mindset 1 · Unit 2 — Where are the speakers?',
      description: 'Two short conversations in places in a town.', partNumber: 1, audioFile: 'Mindset_L1_15.mp3', transcript: T15,
      questionGroups: [
        qMcq(1, 'Listen to two short conversations. Where are the speakers? (Ex. 3)', [
          ['Conversation 1', ['sports centre', 'bank', 'museum'], 'A', lx('Hội thoại 1 diễn ra ở đâu?', 'Hội thoại 1.', 'we have a swimming pool, squash courts, a gym and … outdoor tennis courts', 'Hồ bơi, sân squash, phòng gym → trung tâm thể thao.')],
          ['Conversation 2', ['restaurant', 'bank', 'railway station'], 'B', lx('Hội thoại 2 diễn ra ở đâu?', 'Hội thoại 2.', "I'd like to open a new account … a savings account", 'Mở tài khoản tiết kiệm → ngân hàng.')],
        ], 'Questions 1–2'),
      ],
    },
    {
      ref: 'M1-U02-L2', title: 'Mindset 1 · Unit 2 — Spelling names',
      description: 'The rest of the two conversations: a website, a name and an address.', partNumber: 1, audioFile: 'Mindset_L1_16.mp3', transcript: T16,
      questionGroups: [
        qMcq(1, 'Listen to the rest of conversations 1 and 2 and answer the questions. (Ex. 4)', [
          ['Conversation 1: What is the address of the sports website?', ['www.getactive.com', 'www.getaktive.com'], 'A', lx('Địa chỉ website là gì?', 'Hội thoại 1.', "That's G-E-T-A-C-T-I-V-E dot com", 'Đánh vần có chữ C, không phải K.')],
        ], 'Question 1'),
        qFill(2, 'Conversation 2. Write ONE WORD AND/OR A NUMBER for each answer.', [
          ["What is the man's name? James ______", 'Clarke', lx('Tên người đàn ông là gì?', 'Đầu phần thông tin cá nhân.', ["Is that Clark with an 'e' or without?", "It's got an 'e' at the end. C-L-A-R-K-E"], 'Có chữ e ở cuối: Clarke.')],
          ['What is his address? ______ Waddington Road (write the house number)', '2', lx('Địa chỉ của anh ấy?', 'Sau câu hỏi về địa chỉ.', ['2 Waddington Road', 'W-A-double D-I-N-G-T-O-N Road'], 'Số nhà 2, đường Waddington (double D = DD).')],
        ], 'Questions 2–3'),
        qMcq(4, 'Listen again and complete the extracts from the two conversations. (Ex. 5)', [
          ["'Get active' – is that a__ o__ w__?", ['all one word', 'another web word', 'any other way'], 'A', lx('"Get active" – viết liền một từ phải không?', 'Hội thoại 1.', "'Get active' – is that all one word?", 'all one word = viết liền.')],
          ['Is that Clark w__ an "e" or without?', ['with', 'where', 'what'], 'A', lx('Là Clark có chữ "e" hay không?', 'Hội thoại 2.', "Is that Clark with an 'e' or without?", '')],
          ["It's got an 'e' at the e__.", ['edge', 'end', 'entry'], 'B', lx('Có chữ "e" ở cuối.', 'Hội thoại 2.', "It's got an 'e' at the end", '')],
          ["Is that Waddington with a d__ 'd', did you say?", ['different', 'double', 'dotted'], 'B', lx('Waddington có hai chữ "d" phải không?', 'Hội thoại 2.', 'Is that Waddington with a double D, did you say?', 'double D = DD.')],
        ], 'Questions 4–7'),
      ],
    },
    {
      ref: 'M1-U02-L3', title: 'Mindset 1 · Unit 2 — A meal out',
      description: 'Two friends talk about a restaurant.', partNumber: 1, audioFile: 'Mindset_L1_18.mp3', transcript: T18,
      questionGroups: [
        qFill(1, 'Listen to the conversation and answer the questions. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. (Ex. 9)', [
          ['What did both speakers order?', 'steak', lx('Cả hai người đã gọi món gì?', 'Giữa bài.', 'We really enjoyed the steak we had', 'BẪY: fish, seafood, beef (của bàn bên cạnh) đều được nhắc → đáp án steak.')],
          ['How much did each person pay for the meal? £______', '20', lx('Mỗi người trả bao nhiêu?', 'Cuối bài.', ["£40, including a tip. That's only £20 per person", 'You can\'t get steak for less than £15'], '£40 là tổng hoá đơn; mỗi người = £20. Chỉ viết số.')],
        ], 'Questions 1–2'),
      ],
    },
    {
      ref: 'M1-U02-L4', title: 'Mindset 1 · Unit 2 — Waiting for the bus',
      description: 'Leila is waiting for a bus.', partNumber: 1, audioFile: 'Mindset_L1_19.mp3', transcript: T19,
      questionGroups: [
        qFill(1, 'Listen to the conversation. Answer the questions. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. (Ex. 11)', [
          ['What time is the bus due? ______ pm', '7.50 / 7:50 / seven fifty', lx('Xe buýt dự kiến đến lúc mấy giờ?', 'Đầu bài.', "there's a bus due in about 15 minutes – 7.50 pm to be exact", 'BẪY: "15 minutes" → không phải 7.15. Viết bằng số 7.50.')],
          ['Where is the bus stop?', 'Blythe Road', lx('Trạm xe buýt ở đâu?', 'Giữa bài.', ["It's the one on Blythe Road", "Is that B-L-Y-T-H?", "There's an e at the end of Blythe"], 'Có chữ e ở cuối: Blythe.')],
        ], 'Questions 1–2'),
      ],
    },
    {
      ref: 'M1-U02-L5', title: 'Mindset 1 · Unit 2 — A sailing course',
      description: 'Alicia tells a friend about a sailing course.', partNumber: 1, audioFile: 'Mindset_L1_20.mp3', transcript: T20,
      questionGroups: [
        qFill(1, 'Listen to Alicia telling a friend about a sailing course and answer the questions. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. (Ex. 12)', [
          ['How long did the sailing course last?', '2 days / two days', lx('Khoá học kéo dài bao lâu?', 'Đầu bài.', 'It was only two days but the time flew by!', '')],
          ['What was the first thing that Alicia learnt?', 'safety rules', lx('Điều đầu tiên Alicia học là gì?', 'Đầu bài.', 'The instructor began by teaching us safety rules', 'began by = bắt đầu bằng → điều đầu tiên. Mở buồm, quay thuyền là sau đó.')],
          ['What is the date of the next course?', '1st September / 1 September / 1st of September', lx('Khoá sau bắt đầu ngày nào?', 'Giữa bài.', ['4th and 5th of August', 'So, the next one starts on 1st of September?'], '4–5/8 là khoá của Alicia (đã học).')],
          ['Who will lead the next course?', 'Jon Galloway', lx('Ai dẫn khoá sau?', 'Cuối bài.', ["it's Jon Galloway", "he's just J-O-N", 'G-A-double L-O-W-A-Y'], 'Jon không có H; Galloway có double L.')],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M1-U02-L6', title: 'Mindset 1 · Unit 2 — Exam skills: a bike tour',
      description: 'Rita tells Jon about a bike tour in Orientation Week.', partNumber: 1, audioFile: 'Mindset_L1_21.mp3', transcript: T21,
      questionGroups: [
        qFill(1, 'Answer the questions below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. (Ex. 15)', [
          ['What kind of tour did the woman do?', 'bike tour / bike / cycle tour / cycling tour / cycle / cycling', lx('Người phụ nữ đi tour loại gì?', 'Đầu bài.', ['I went on a walking tour', 'some students did a bus tour', 'Well, I did a bike tour'], 'Walking tour là của Jon, bus tour là của sinh viên khác.')],
          ['How did she find out about the tour?', 'email / by email', lx('Cô ấy biết về tour qua đâu?', 'Ngay sau đó.', 'I was sent an email about it', '')],
          ['How many people were on the tour?', '8 / eight', lx('Có bao nhiêu người tham gia?', '', 'There were only eight places and there were seven other names on the list already, so I got the very last place', '7 người + Rita = 8.')],
          ['What is the address of the hire shop?', '22 Barkway Street', lx('Địa chỉ cửa hàng cho thuê?', 'Giữa bài.', ['Barclay Street?', "No, it's Barkway Street – B-A-R-K-W-A-Y. Number 22 Barkway Street"], 'BẪY: Barclay Street là của Jon. Viết cả số nhà.')],
          ['How much did each student in the group pay? $______', '15 / fifteen', lx('Mỗi sinh viên trả bao nhiêu?', '', ['only $120 for the whole group. So the cost was only $15 per person', 'Did you say $50?', 'No, $15'], '$120 cho cả nhóm; $50 là nghe nhầm.')],
        ], 'Questions 1–5'),
        {
          groupType: 'plain', groupTitle: 'Questions 6–7', instruction: 'Which TWO items were included in the cost of the hire? Write ONE WORD for each answer.', interchangeableAnswers: true,
          questions: [
            { questionNumber: 6, type: 'fill-blank', questionText: 'Item 1', correctAnswer: 'helmet', explanation: lx('Món thứ nhất được bao gồm trong giá thuê', 'Gần cuối.', "I didn't have to bring along a helmet to wear either. That was included – and we also got a lock", 'helmet và lock — thứ tự nào cũng được.') },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Item 2', correctAnswer: 'lock', explanation: lx('Món thứ hai được bao gồm trong giá thuê', 'Gần cuối.', 'and we also got a lock', '') },
          ],
        },
        qFill(8, 'Write ONE WORD AND/OR A NUMBER.', [
          ['What is the website address of the hire shop?', 'tradelectric.com / www.tradelectric.com', lx('Địa chỉ website của cửa hàng?', 'Câu cuối.', "It's tradelectric.com", '')],
        ], 'Question 8'),
      ],
    },
  ],
};
