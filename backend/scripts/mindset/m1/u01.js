// Mindset for IELTS Level 1 — Unit 1: Relationships (Reading pp. 8–11 · Listening pp. 16–18)
const { mcq, gap, match, cat, passage, card, qMcq, qTF, qFill, qNote, lx, html } = require('../dsl');

const SLOT = 1; // sách của lớp: Unit 1–2 → Sổ 1

const BLOOD = `## Blood is thicker than water

**A** Blood is thicker than water. This means that family is more important than anyone else. Many young people, though, spend more time with their friends than with their family. They value their friends' opinions more and enjoy their company. When it's time to visit grandma or go to a cousin's wedding, teenagers often prefer to be left at home. But are they missing out?

**B** In Asia, the Middle East, South America and Sub-Saharan Africa over 40% of children live in families with other adults such as aunts, uncles and grandparents in addition to their parents. In South Africa, it is almost 70%. On the other hand, in Europe, Australia and North America, less than 25% of children live in extended families. Is the lack of close contact with relatives putting some children at a disadvantage?

**C** The people they live with have a great influence on the way children grow up. Those who live with their extended family have many advantages. They usually get lots of love and attention. Grandparents often have more time to read to children and play with them. As they are often retired, they are not always busy and stressed as many parents are. They have learnt to be patient and they have already handled most of the problems children and young people face.

**D** It is good for children to grow up to understand the needs of older people: they may become more caring and less selfish if they spend time helping their grandparents. Children learn about the past from grandparents' stories. Sometimes they feel closer to their grandparents than to their parents.

**E** Young adults often feel that living alone will be exciting, but they forget that it can also be lonely. By remaining with the family during this stage of their lives, they can avoid this. They can also save money for their education and future.

**F** Young people whose grandparents live far away can gain some of these advantages by keeping in close contact by phone, email, letters and visits. It is nice to know there is someone you can go to if you have a problem. As the Italian proverb says, 'Se non sta andando bene chiamare la nonna.' – 'If things aren't going well, call your grandmother.'

**G** Friends are important to young people, but friends come and go. Your family is always on your side. Grandparents won't be there forever. Appreciate them while you can.`;

const FRIENDSHIP = `## Social media and the meaning of friendship

There have been a lot of scientific studies into what makes a friendship. It seems today that ideas of what friendship is are also changing. A study in 1993 at the University of Oxford showed that people could only maintain 150 relationships. However, with the explosion of social media since then, many people now have over 300 people who they think of as friends. Some people think that these friends are not real friends, but others believe that social media has helped us to expand and keep our friendships because we have more time and opportunities.

Another change from the past is that people don't stay in the place where they were born. They go to different cities and countries for education and jobs. People are in general more geographically mobile nowadays. This means that we have more chances to meet and make friends with people from different cultures and different backgrounds. People still often make friends at college who remain friends for life, but making new friends at work is more difficult. People now have less security at work and this also means that they find it harder to build new relationships.

As people get older, they sometimes also have less free time. They become busier with their jobs and families and have less time to spend with friends. Friendships can be very different when we are at different ages. Young children often choose their friends because of convenience, for example, they go to the same school, they live near each other or their parents are friends. As we get older, friendships are more connected with having similar interests and opinions.

One thing is definitely true though, it doesn't matter how old we are or how many friends we have on social media, friendship is good for our health. People who spend time with friends have fewer mental health problems and are generally happier and in a better physical state of health than people who spend their free time alone.`;

const plain = (t) => t.replace(/^## .*\n\n/, '');

// ── audioscripts (Listening scripts, Unit 1) ──
const T02 = `Conversation 1
Manager: Good evening, Willowtree Hotel. How can I help?
Customer: Hello, I'd like to make a reservation in your restaurant for next Saturday evening.
Manager: Next Saturday? If you hold on, I'll just check … So … for how many people?
Customer: I need a table for 12 – it's my husband's 30th birthday, so we're having a celebration dinner.

Conversation 2
Sales assistant: Good afternoon, can I help you?
Customer: Yes, I'm looking for a gift for my sister. She's going to be 18 next week. So I thought a piece of jewellery would be nice.
Sales assistant: Good idea! Do you have anything particular in mind – a necklace, perhaps?
Customer: Mm, she has so many necklaces. I was thinking of a pair of earrings, possibly.
Sales assistant: Does she have a favourite colour?
Customer: Mm, she likes blue …`;

const T03 = `a the 3rd
b $10.50
c the 6th
d 70
e 19
f 62
g £110
h the 27th`;

const T04 = `Customer: I need a table for 12 – it's my husband's 30th birthday, so we're having a celebration dinner.
Manager: So that's 12 people for the 16th.
Customer: No, no, it's the day after – the 17th – Saturday the 17th, at eight o'clock.
Manager: Ah, yes, of course. A party of 12 for the Saturday … Oh, I'm sorry, but I'm afraid our main restaurant is fully booked that evening, but we do have a small room available for private hire. It can seat up to 20 people, so there would be plenty of space for 12 of you.
Customer: That sounds perfect.`;

const T05 = `Customer: That sounds perfect.
Manager: Excellent. Now we offer a set three-course menu for £23 per person and we can also supply you with a birthday cake at no extra charge. How does that sound?
Customer: That sounds good. So how much would that cost in total?
Manager: Let me see – for the food and the room, that will come to £318.
Customer: Did you say three hundred and eighty pounds?
Manager: No, three hundred and eighteen.
Customer: OK, I think I'd like to go ahead and make a booking.
Manager: OK, I'll just take your details.`;

const T06 = `Sales assistant: Good afternoon, can I help you?
Customer: Yes, I'm looking for a gift for my sister. She's going to be 18 next week. So I thought a piece of jewellery would be nice.
Sales assistant: Good idea! Do you have anything particular in mind – a necklace, perhaps?
Customer: Mm, she has so many necklaces. I was thinking of a pair of earrings, possibly.
Sales assistant: Does she have a favourite colour?
Customer: Mm, she likes blue …
Sales assistant: What about this pair? They have some beautiful little blue stones.
Customer: Mm … They're quite nice, I suppose.
Sales assistant: They're silver, and they're handmade, so you won't find anything like them anywhere else.
Customer: Oh, really? So, how much are they?
Sales assistant: Well, they were £30, but actually we've got a sale on at the moment, so they're a little cheaper – only £20. So you can save £10!
Customer: Great. I'll take them.
Sales assistant: And would you like me to giftwrap them for you?
Customer: How much do you charge for that?
Sales assistant: For £4 we give you a pretty box and your own choice of wrapping paper. Or for £5 you can have our luxury wrapping service, which includes a silver box and silver ribbon. And if you would like a card to write your own personal message, that will be £2 extra.
Customer: Well, it's a special birthday so I'll take the luxury option. But I already have a card, thank you.
Sales assistant: That's fine. I'll do that for you now. And how would you like to pay – cash or card?`;

const T07 = `Customer: Oh, really? So, how much are they?
Sales assistant: Well they were £30, but actually we've got a sale on at the moment, so they're a little cheaper – only £20. So you can save £10!`;

const T08 = `Mark: Hi there, Nam! You aren't still working on your history assignment, are you?
Nam: Hi, Mark! No, I'm taking a break. I'm looking at some photos, actually – a family celebration. Do you want to see them?
Mark: So, who's the cute baby in this picture here?
Nam: She's my niece – my brother's daughter. Her name's Tae-Hee. She's one year old in this picture. It's a very important birthday in Korea – we call it 'Dol' or Doljanchi. It's a very special celebration – in fact, I think it's probably more important than a wedding or a graduation! And we invite all our family and friends and sometimes our neighbours. Here's a picture of the restaurant where we celebrated Tae-Hee's big day.
Mark: What a lovely place – and a beautiful garden, too.
Nam: Yes, it's a perfect location for taking photographs. Can you see me just there next to the trees?
Mark: Ah yes, I like your hat! And I like the red and silver hat Tae-Hee's wearing too. It's really pretty.
Nam: Yes, it's a traditional hat for a girl. Baby boys wear a different one – all black. It looks very serious!
Mark: That's a bit boring. Black and silver would be more interesting. What's Tae-Hee wearing round her skirt?
Nam: That's a little purse. Boy babies wear this too. It's made of silk and it means good luck in our culture. And she's wearing a belt too. Look – do you see? The belt means she will have a long life!
Mark: And what's this on the table there? It's very colourful.
Nam: It's rice cakes.
Mark: I've never seen anything like that before. It looks like a rainbow!
Nam: We always eat rice cakes at a baby's party. There are usually 12 different types of them on the table. Look – this rice cake is completely orange in colour and this one here is bright green!
Mark: It looks like a vegetable!
Nam: Now, look – this is me with my brother's wife, Mi-Cha. We get on really well together.
Mark: What are you holding?
Nam: Oh, it's a little bag. All the guests get a gift bag at the end of the party. And inside there's a present from the baby's parents. It's really fun to open it because you don't know what you'll get. So it could be a candle, or some chocolates. Guess what I got? You can see it in this next photo.
Mark: It looks like a box of tea. But shouldn't it be the other way round – the baby gets the presents?
Nam: Well, the baby receives money from the guests, so in a way you're right! And actually, I've got my present right here. So, why don't we open the box right now and have a cup of tea? Then we can try to finish our assignments.
Mark: Sounds good to me!`;

module.exports = {
  n: 1,
  title: 'Relationships',
  titleVi: 'Các mối quan hệ',
  pages: '8–11, 16–18',
  outcomes: [
    'Reading: trả lời câu hỏi ngắn (short-answer, tối đa 2–3 từ) — tìm từ khoá trong câu hỏi, scan bài đọc',
    'Grammar: thì hiện tại đơn cho sự thật chung + vị trí trạng từ chỉ tần suất',
    'Listening: Section 1 — nhận diện người nói, nghe số, nghe chi tiết; multiple choice 3 phương án',
    'Từ vựng gia đình & các mối quan hệ (Sổ 1)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: family and relationships',
      titleEn: 'Lead-in · Vocabulary (Reading, pp. 8–9)',
      slot: SLOT,
      minutes: 35,
      objectives: ['Giải thích các từ chỉ thành viên gia đình (cousin, niece, father-in-law…)', 'Đọc lướt bài "Blood is thicker than water" để kiểm tra ý', 'Đoán nghĩa từ mới dựa vào ngữ cảnh (context)'],
      theory: [
        card('Đoán nghĩa từ qua ngữ cảnh', 'Using the context to work out meaning', {
          usage: [
            'Không cần biết hết mọi từ trong bài: đọc **câu chứa từ đó và các từ xung quanh** để đoán nghĩa (TIP của sách).',
            'Làm **từ đã biết trước**, rồi loại trừ dần các nghĩa còn lại.',
            'Ví dụ: "As they are often retired, they are not always busy and **stressed**" → đi với *busy*, nói về cha mẹ bận rộn → stressed = căng thẳng, không thư giãn được.',
          ],
        }),
        card('Từ vựng gia đình', 'Family words', {
          usage: [
            '**cousin** anh chị em họ · **niece / nephew** cháu gái / cháu trai (con của anh chị em) · **aunt / uncle** cô dì / chú bác',
            '**father-in-law** bố chồng / bố vợ · **great-aunt** bà cô / bà dì (chị em của ông bà) · **extended family** đại gia đình (nhiều thế hệ)',
          ],
          examples: [['My cousin is my aunt or uncle\'s son or daughter.', 'Anh/chị/em họ là con của cô/dì/chú/bác.'], ['My niece is my brother or sister\'s daughter.', 'Cháu gái là con gái của anh/chị/em mình.']],
        }),
      ],
      vocab: [
        ['blood is thicker than water', 'một giọt máu đào hơn ao nước lã', 'Blood is thicker than water: family is more important than anyone else.'],
        ["value sb's opinion", 'coi trọng ý kiến của ai', "They value their friends' opinions more."],
        ["enjoy sb's company", 'thích ở bên ai', 'They enjoy their friends\' company.'],
        ['miss out', 'bỏ lỡ (điều thú vị)', 'But are they missing out?'],
        ['extended family', 'đại gia đình (nhiều thế hệ sống chung)', 'Less than 25% of children live in extended families.'],
        ['relative', 'họ hàng, người thân', 'They have little close contact with relatives.'],
        ['at a disadvantage', 'ở thế bất lợi', 'Is this putting some children at a disadvantage?'],
        ['have an influence on', 'có ảnh hưởng đến', 'The people they live with have a great influence on children.'],
        ['grow up', 'lớn lên, trưởng thành', 'It is good for children to grow up with grandparents.'],
        ['retired', 'đã nghỉ hưu', 'Grandparents are often retired.'],
        ['stressed', 'căng thẳng', 'Many parents are busy and stressed.'],
        ['patient', 'kiên nhẫn', 'They have learnt to be patient.'],
        ['handle a problem', 'xử lý vấn đề', 'They have already handled most of the problems children face.'],
        ['the needs of older people', 'nhu cầu của người lớn tuổi', 'Children grow up to understand the needs of older people.'],
        ['caring', 'biết quan tâm, chu đáo', 'They may become more caring.'],
        ['selfish', 'ích kỷ', 'They may become less selfish.'],
        ['lonely', 'cô đơn', 'Living alone can also be lonely.'],
        ["stage of one's life", 'giai đoạn trong cuộc đời', 'Remain with the family during this stage of their lives.'],
        ['gain', 'có được, đạt được', 'They can gain some of these advantages.'],
        ['keep in close contact', 'giữ liên lạc thường xuyên', 'Keep in close contact by phone and email.'],
        ['proverb', 'tục ngữ', 'As the Italian proverb says, "call your grandmother".'],
        ['come and go', 'đến rồi đi, không bền lâu', 'Friends come and go.'],
        ["be on sb's side", 'đứng về phía ai', 'Your family is always on your side.'],
        ['appreciate', 'trân trọng, biết ơn', 'Appreciate them while you can.'],
        ['love and attention', 'tình yêu thương và sự quan tâm', 'They usually get lots of love and attention.'],
        ['maintain a relationship', 'duy trì mối quan hệ', 'People could only maintain 150 relationships.'],
        ['the explosion of social media', 'sự bùng nổ của mạng xã hội', 'With the explosion of social media, people have more friends.'],
        ['expand', 'mở rộng', 'Social media has helped us to expand our friendships.'],
        ['geographically mobile', 'hay chuyển nơi sống', 'People are more geographically mobile nowadays.'],
        ['background', 'xuất thân, hoàn cảnh', 'We meet people from different backgrounds.'],
        ['remain friends for life', 'là bạn suốt đời', 'People make friends at college who remain friends for life.'],
        ['security at work', 'sự ổn định trong công việc', 'People now have less security at work.'],
        ['build new relationships', 'xây dựng mối quan hệ mới', 'They find it harder to build new relationships.'],
        ['convenience', 'sự tiện lợi', 'Young children choose their friends because of convenience.'],
        ['similar interests', 'sở thích tương đồng', 'Friendships are connected with having similar interests.'],
        ['mental health problems', 'các vấn đề sức khỏe tinh thần', 'People with friends have fewer mental health problems.'],
        ['physical state of health', 'tình trạng sức khỏe thể chất', 'They are in a better physical state of health.'],
      ],
      ex: [
        match('Family words (Ex. 1)', 'Lead-in. Match each family word with its meaning.', [
          ['brother', "my parents' son"],
          ['cousin', "my aunt or uncle's son or daughter"],
          ['father-in-law', "my husband or wife's father"],
          ['grandfather', "my mother or father's father"],
          ['uncle', "my mother or father's brother"],
          ['aunt', "my mother or father's sister"],
          ['nephew', "my brother or sister's son"],
          ['niece', "my brother or sister's daughter"],
          ['great-aunt', "my grandmother or grandfather's sister"],
          ['grandmother', "my mother or father's mother"],
        ]),
        cat('Advantages of an extended family (Ex. 2)', 'You are going to read about some advantages of living in an extended family. Read the text quickly. Which advantages are mentioned? Ignore the highlighted words.', { yes: 'Mentioned in the text', no: 'Not mentioned' }, [
          ['Older people are fun to live with.', 'no', 'Bài không nói người lớn tuổi "vui" khi sống cùng.'],
          ['Older people are patient and experienced.', 'yes', 'Đoạn C: "They have learnt to be patient and they have already handled most of the problems…"'],
          ['You can save money by living together.', 'yes', 'Đoạn E: "They can also save money for their education and future."'],
          ['Grandparents are not as busy as parents.', 'yes', 'Đoạn C: "they are not always busy and stressed as many parents are."'],
          ['Children get plenty of love and attention.', 'yes', 'Đoạn C: "They usually get lots of love and attention."'],
        ], { stimulus: passage(BLOOD.replace(/^## /, ''), { caption: 'Blood is thicker than water (pp. 8–9)' }) }),
        match('Highlighted words (Ex. 3)', 'Match the highlighted words from the text with their meanings. Start with words you already know. Use the context to work out the meaning of the other words.', [
          ['value', 'believe something is important', 'Đoạn A: "They value their friends\' opinions more" → coi trọng.'],
          ['(have an) influence', '(have an) effect (on)', 'Đoạn C: "have a great influence on the way children grow up".'],
          ['stressed', 'worried; not able to relax', 'Đi cùng "busy" → căng thẳng.'],
          ['handled', 'dealt with, had experience of', '"handled most of the problems" → đã xử lý/trải qua.'],
          ['selfish', 'caring only about yourself and not other people', 'Đối lập với "caring" trong cùng câu.'],
          ['gain', 'get (something positive)', '"gain some of these advantages" → có được.'],
          ['proverb', 'a well-known phrase giving advice', '"As the Italian proverb says…" → câu tục ngữ.'],
          ['appreciate', 'be grateful for', '"Appreciate them while you can" → trân trọng.'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: short-answer questions',
      titleEn: 'Short-answer questions · Finding information · Key words · Scanning · Exam skills',
      minutes: 55,
      objectives: ['Tìm nhanh thông tin trong bài (finding information)', 'Gạch chân từ khoá (key words) trong câu hỏi', 'Scan bài để trả lời câu hỏi ngắn, đúng giới hạn số từ', 'Tránh 4 lỗi hay gặp: quá số từ, sai thông tin, đổi từ trong bài, sai chính tả'],
      theory: [
        card('Dạng bài Short-answer questions', 'Short-answer questions', {
          formula: ['Trả lời bằng **tối đa 3 từ**, hoặc **tối đa 2 từ và/hoặc một số** — đề bài luôn ghi rõ (NO MORE THAN TWO WORDS AND/OR A NUMBER).', 'Đáp án là **từ lấy nguyên văn trong bài**, không viết thành câu hoàn chỉnh.'],
          usage: ['Dạng này kiểm tra bạn có **tìm đúng chỗ trong bài nhanh** và hiểu thông tin hay không.', 'Câu hỏi thường đi **theo thứ tự** của bài đọc.'],
        }),
        card('Từ khoá và scanning', 'Key words and scanning', {
          formula: ['① Gạch chân **key words** — những từ quan trọng nhất của câu hỏi (tên riêng, số, danh từ chính) → ② nghĩ **từ đồng nghĩa** → ③ **scan**: lướt mắt nhanh theo chiều ngang và dọc, không đọc từng chữ → ④ thấy từ khoá thì **đọc kỹ câu quanh nó**.'],
          usage: ['Ví dụ: "What do <u>young people</u> often <u>think</u> about <u>older family members</u>?"', 'Bài có tiêu đề/đoạn có chữ cái → dùng chúng để biết nên đọc đoạn nào trước.', 'Có thể **bỏ mạo từ** (a, the, some) để vừa đủ số từ cho phép.'],
        }),
        card('4 lỗi làm mất điểm', 'Common mistakes', {
          usage: [
            '**a** Viết quá số từ cho phép / viết cả câu → "Living alone can be lonely." ✗ → **lonely** ✓',
            '**b** Lấy nhầm thông tin (đọc sai câu) → "20%" ✗',
            '**c** Đổi từ trong bài → "your gran" ✗ → **your grandmother** ✓',
            '**d** Sai chính tả → "storys" ✗ → **stories** ✓',
          ],
        }),
      ],
      links: [
        { ref: 'reading:M1-U01-R1', title: 'Blood is thicker than water (Ex. 5–8)', note: '7 câu short-answer — gạch chân từ khoá, scan, chép đúng từ trong bài.' },
        { ref: 'reading:M1-U01-R2', title: 'Exam skills: Social media and the meaning of friendship (Ex. 12)', note: '5 câu hỏi, NO MORE THAN THREE WORDS.' },
      ],
      ex: [
        match('Finding information (Ex. 4)', 'To practise finding information quickly, find the following phrases in the text. Which paragraph (A–G) is each phrase in?', [
          ["grandparents' stories", 'Paragraph D', 'D: "Children learn about the past from grandparents\' stories."'],
          ["cousin's wedding", 'Paragraph A', 'A: "…or go to a cousin\'s wedding…"'],
          ['young adults', 'Paragraph E', 'E: "Young adults often feel that living alone will be exciting…"'],
          ['extended families', 'Paragraph B', 'B: "…less than 25% of children live in extended families."'],
          ['come and go', 'Paragraph G', 'G: "…but friends come and go."'],
          ['Italian proverb', 'Paragraph F', 'F: "As the Italian proverb says…"'],
        ], { stimulus: passage(BLOOD.replace(/^## /, ''), { caption: 'Blood is thicker than water' }) }),
        mcq('Identifying the key words (Ex. 5)', 'Choose the best set of key words for each question.', [
          ['What percentage of children live in extended families in Asia, the Middle East, South America and Sub-Saharan Africa?', ['percentage / children / extended families / Asia, the Middle East, South America, Sub-Saharan Africa', 'What / of / live / in', 'children / live / families'], 'A', 'Key words = từ mang thông tin: loại thông tin cần tìm (percentage) + chủ thể + các tên riêng (dễ scan nhất).'],
          ['Why are grandparents often less busy and stressed than parents?', ['Why / are / often', 'grandparents / less busy / stressed / parents', 'grandparents / parents'], 'B', 'Cần cả "less busy / stressed" để biết đang hỏi về lý do nào.'],
          ['What do young adults often think living alone will be like?', ['young adults / think / living alone', 'What / do / will be', 'young / alone'], 'A', '"young adults" và "living alone" là cụm từ có thể scan được trong đoạn E.'],
        ]),
        gap('Scanning a text (Ex. 6)', 'Answer the questions in exercise 5. Use words from the text.', [
          ['What percentage of children live in extended families in Asia, the Middle East, South America and Sub-Saharan Africa? → ____', 'over 40%|over 40 percent|40%', 'Đoạn B: "over 40% of children live in families with other adults".'],
          ['Why are grandparents often less busy and stressed than parents? → They are often ____.', 'retired', 'Đoạn C: "As they are often retired, they are not always busy and stressed".'],
          ['What do young adults often think living alone will be like? → ____', 'exciting', 'Đoạn E: "Young adults often feel that living alone will be exciting".'],
        ], { stimulus: passage(BLOOD.replace(/^## /, ''), { caption: 'Blood is thicker than water' }) }),
        match('What is wrong with the answers? (Ex. 7)', 'Read this exam task (NO MORE THAN TWO WORDS AND/OR A NUMBER) and the answers. What is wrong with each answer? Match the answers 1–4 with the advice a–d.', [
          ['Q1 What percentage of children in South Africa live with their extended family? — Answer: 20%', "b Make sure that you use the correct information when you answer a question.", 'Bài nói ở South Africa là "almost 70%"; 20%/25% là con số của châu Âu, Úc, Bắc Mỹ → lấy sai thông tin.'],
          ['Q2 What helps children in extended families learn about the past? — Answer: grandparents storys', 'd Be careful with spelling. You can lose marks if your spelling is wrong.', 'Sai chính tả: stories (và thiếu dấu sở hữu grandparents\').'],
          ['Q3 What negative word can describe how it sometimes feels to live alone? — Answer: Living alone can be lonely.', "a Don't write more than the number of words you are given. You mustn't write full sentences.", 'Viết cả câu → quá số từ. Chỉ cần "lonely".'],
          ['Q4 According to the Italian proverb, who should you phone when you have a problem? — Answer: your gran', "c Don't change words in the text. Remember, the instructions tell you to choose words from the text.", 'Bài viết "your grandmother" → không được đổi thành "gran".'],
        ]),
        gap('Correct the answers (Ex. 8)', 'Now correct the answers in exercise 7. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.', [
          ['Q1 What percentage of children in South Africa live with their extended family? → ____', 'over 40%|over 40 percent|almost 70%|70%|almost 70 percent', 'Đáp án sách: over 40%. Đoạn B: "In Asia, the Middle East, South America and Sub-Saharan Africa over 40% of children live in families with other adults… In South Africa, it is almost 70%." South Africa thuộc Sub-Saharan Africa nên "over 40%" đúng; "almost 70%" là con số cụ thể của riêng South Africa nên cũng được chấm đúng. Lỗi của "20%": lấy nhầm con số của nơi khác (châu Âu, Úc, Bắc Mỹ là dưới 25%).'],
          ['Q2 What helps children in extended families learn about the past? → ____', "grandparents' stories|grandparents stories", 'Đoạn D: "Children learn about the past from grandparents\' stories."'],
          ['Q3 What negative word can describe how it sometimes feels to live alone? → ____', 'lonely', 'Đoạn E: "it can also be lonely".'],
          ['Q4 According to the Italian proverb, who should you phone when you have a problem? → ____', 'your grandmother|grandmother', 'Đoạn F: "If things aren\'t going well, call your grandmother."'],
        ], { stimulus: passage(BLOOD.replace(/^## /, ''), { caption: 'Blood is thicker than water' }) }),
      ],
    },

    grammar: {
      title: 'Grammar focus: present simple & adverbs of frequency',
      titleEn: 'Grammar focus: tenses · adverbs of frequency (p. 11)',
      minutes: 30,
      objectives: ['Nhận ra thì hiện tại đơn dùng cho sự thật chung trong bài đọc', 'Nhận diện trạng từ chỉ tần suất và nắm quy tắc vị trí'],
      keyLanguage: [
        'Thì hiện tại đơn: diễn tả **sự thật chung / thói quen** → bài đọc học thuật dùng rất nhiều (Young adults often **feel** that…).',
        'Trạng từ tần suất: always > usually > often > sometimes > rarely/seldom > never.',
        'Vị trí: **giữa chủ ngữ và động từ thường** (They **usually get** lots of love) · **sau động từ to be** (Your family **is always** on your side) · sometimes/usually có thể **đứng đầu câu** (Sometimes they feel closer…).',
      ],
      theory: [
        card('Trạng từ chỉ tần suất', 'Adverbs of frequency', {
          formula: ['S + **adverb** + V (thường): Grandparents **often have** more time.', 'S + be + **adverb**: They **are often** retired.', '**Sometimes / Usually**, S + V …'],
          examples: [['Your family is always on your side.', 'Gia đình luôn đứng về phía bạn.'], ['Teenagers often prefer to be left at home.', 'Thanh thiếu niên thường thích ở nhà hơn.'], ['Sometimes they feel closer to their grandparents.', 'Đôi khi chúng thấy gần ông bà hơn.']],
        }),
      ],
      links: [{ grammar: 'present-simple', title: 'Present Simple', note: 'sự thật chung, thói quen, trạng từ tần suất' }],
      ex: [
        mcq('Grammar focus: tenses (Ex. 9)', 'Answer these questions about the text "Blood is thicker than water".', [
          ['What tense are most of the verbs in the text?', ['present simple', 'present continuous', 'past simple'], 'A', 'value, enjoy, prefer, live, have, feel… → hiện tại đơn.'],
          ['Choose the correct reason for the choice of tense.', ['The verbs describe events which are happening now.', 'The verbs describe things that are generally true.', "The verbs give the writer's opinion."], 'B', 'Hiện tại đơn dùng cho sự thật chung / điều thường xảy ra.'],
        ]),
        gap('Adverbs of frequency (Ex. 10)', 'Identify the frequency adverb(s) in these sentences from the text.', [
          ['Your family is always on your side. → ____', 'always'],
          ['Teenagers often prefer to be left at home. → ____', 'often'],
          ['As they are often retired, they are not always busy … → ____ and ____', ['often', 'always']],
          ['They usually get lots of love and attention. → ____', 'usually'],
          ['Sometimes they feel closer to their grandparents than to their parents. → ____', 'sometimes|Sometimes'],
        ]),
        mcq('Position of frequency adverbs (Ex. 11)', 'Study the position of the frequency adverbs in exercise 10. Choose the correct rule.', [
          ['With most verbs (e.g. get, prefer, feel), the frequency adverb usually goes…', ['between the subject and the verb', 'at the end of the sentence', 'after the verb'], 'A', 'They usually get… / Teenagers often prefer…'],
          ['When the verb is "to be", the frequency adverb goes…', ['before the verb', 'after the verb', 'at the start of the sentence'], 'B', 'Your family is always on your side. / they are often retired.'],
          ['Which frequency adverb from the text can also start a sentence?', ['always', 'sometimes', 'often'], 'B', 'Sometimes they feel closer… (usually cũng có thể đứng đầu câu).'],
          ['Choose the correct sentence.', ['I cook often at the weekend.', 'I often cook at the weekend.', 'Often I am cook at the weekend.'], 'B', 'S + adverb + V.'],
          ['Choose the correct sentence.', ['It always is cold in winter.', 'It is always cold in winter.', 'Always it cold in winter.'], 'B', 'be + adverb.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: Section 1 — numbers & multiple choice',
      titleEn: 'Identifying the speakers · Listening for numbers · Multiple-choice questions · Exam skills (pp. 16–18)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Biết Section 1 là hội thoại đời thường giữa 2 người', 'Phân biệt người nói (nam/nữ, ai hỏi – ai trả lời)', 'Nghe số: ngày tháng, giá tiền, số lượng — chọn đúng số giữa nhiều số được nhắc', 'Multiple choice: nghe từ đồng nghĩa, không nghe y nguyên từ trong đáp án'],
      theory: [
        card('Section 1 của bài thi Listening', 'Listening Section 1', {
          usage: ['Hai người nói chuyện trong **tình huống đời thường** (đặt bàn, mua quà, hỏi thông tin…). Thường **một người phải hỏi thông tin** từ người kia.', 'Giọng hai người **khác nhau rõ** để bạn dễ phân biệt ai đang nói. Đáp án có thể đến từ bất kỳ người nào.', 'Section 3 có 2–3 người nói, chủ đề học tập (vd. bài tập lớn — course assignment).'],
        }),
        card('Nghe số', 'Listening for numbers', {
          usage: ['Thường bạn sẽ nghe **tất cả** các số trong đáp án nhưng chỉ một số đúng → nghe **cụm từ then chốt**: "No, no, it\'s the day after – the **17th**", "Did you say 380? – **No**, 318".', 'Cặp dễ nhầm: **thirteen / thirty**, **fifteen / fifty**, **eighteen / eighty** (trọng âm: thir**TEEN** vs **THIR**ty).', 'Giá tiền: £10.50 = "ten pounds fifty"; ngày: the 3rd, the 27th.'],
        }),
        card('Multiple-choice questions', 'Multiple choice', {
          formula: ['Hai kiểu: **câu hỏi + 3 phương án** hoặc **câu chưa hoàn chỉnh + 3 cách kết thúc**.'],
          usage: ['Từ trong đáp án **thường không giống** từ trong bài nghe → nghe **từ đồng nghĩa** (a leaving party ↔ a goodbye party, colleagues ↔ work in the same office).', 'Trước khi nghe, **đọc câu hỏi và đoán chủ đề** (màu sắc, đồ ăn, quà…). Câu hỏi đi **theo thứ tự** bài nghe.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U01-L1', title: 'Two Section 1 conversations (Ex. 2–4)', note: 'Tình huống nào? Người nói nam hay nữ? Khách muốn gì?' },
        { ref: 'listening:M1-U01-L2', title: 'Listening for numbers (Ex. 5)', note: 'Chọn số bạn nghe được trong mỗi cặp.' },
        { ref: 'listening:M1-U01-L3', title: 'Booking a table (Ex. 6–7)', note: 'Bao nhiêu người? Ngày nào? Phòng chứa tối đa bao nhiêu người?' },
        { ref: 'listening:M1-U01-L4', title: 'The total cost (Ex. 8)', note: '318 hay 380?' },
        { ref: 'listening:M1-U01-L5', title: 'Buying earrings (Ex. 9–10)', note: 'Giá đôi bông tai và tiền gói quà.' },
        { ref: 'listening:M1-U01-L6', title: 'Exam skills: a family celebration in Korea (Ex. 13)', note: '6 câu multiple choice A, B, C.' },
      ],
      vocab: [
        ['make a reservation', 'đặt chỗ trước', "I'd like to make a reservation in your restaurant."],
        ['celebration dinner', 'bữa tối ăn mừng', "We're having a celebration dinner."],
        ['a piece of jewellery', 'một món trang sức', 'A piece of jewellery would be nice.'],
        ['have sth in mind', 'đã có ý định, ý tưởng về cái gì', 'Do you have anything particular in mind?'],
        ['handmade', 'làm thủ công', "They're handmade, so you won't find anything like them."],
        ['have a sale on', 'đang có đợt giảm giá', "We've got a sale on at the moment."],
        ['save money', 'tiết kiệm tiền', 'So you can save £10!'],
        ['giftwrap', 'gói quà', 'Would you like me to giftwrap them?'],
        ['wrapping paper', 'giấy gói quà', 'Your own choice of wrapping paper.'],
        ['luxury option', 'lựa chọn cao cấp', "I'll take the luxury option."],
        ['personal message', 'lời nhắn riêng', 'A card to write your own personal message.'],
        ['fully booked', 'đã kín chỗ', 'Our main restaurant is fully booked that evening.'],
        ['available for private hire', 'có thể thuê riêng', 'We have a small room available for private hire.'],
        ['seat up to', 'có sức chứa tối đa', 'It can seat up to 20 people.'],
        ['plenty of space', 'nhiều chỗ, rộng rãi', 'There would be plenty of space for 12 of you.'],
        ['a set three-course menu', 'thực đơn cố định ba món', 'We offer a set three-course menu for £23 per person.'],
        ['at no extra charge', 'không tính thêm phí', 'A birthday cake at no extra charge.'],
        ['come to', 'tổng cộng lên tới (số tiền)', 'That will come to £318.'],
        ['go ahead', 'tiến hành, làm luôn', "I'd like to go ahead and make a booking."],
        ["take sb's details", 'ghi lại thông tin của ai', "I'll just take your details."],
        ['take a break', 'nghỉ giải lao', "I'm taking a break."],
        ['assignment', 'bài tập lớn', 'Are you still working on your history assignment?'],
        ['niece', 'cháu gái (con của anh chị em)', "She's my niece – my brother's daughter."],
        ['family celebration', 'buổi tiệc mừng của gia đình', "I'm looking at some photos of a family celebration."],
        ['graduation', 'lễ tốt nghiệp', "It's more important than a wedding or a graduation."],
        ['perfect location', 'địa điểm lý tưởng', "It's a perfect location for taking photographs."],
        ['traditional', 'truyền thống', "It's a traditional hat for a girl."],
        ['be made of silk', 'được làm bằng lụa', "It's made of silk."],
        ['good luck', 'sự may mắn', 'It means good luck in our culture.'],
        ['colourful', 'nhiều màu sắc, sặc sỡ', "It's very colourful."],
        ['get on well with', 'hòa thuận, hợp với', 'We get on really well together.'],
        ['gift bag', 'túi quà', 'All the guests get a gift bag.'],
        ['the other way round', 'ngược lại', "Shouldn't it be the other way round?"],
        ['in a way', 'ở một khía cạnh nào đó', "So in a way you're right!"],
      ],
      ex: [
        cat('Section 1 situations (Ex. 1)', 'In Section 1 of the Listening test you will hear two people talking in everyday situations. Which TWO situations could be in Section 1?', { s1: 'Could be in Section 1', no: 'Not Section 1' }, [
          ['Discussing a course assignment', 'no', 'Bài tập của khoá học → học thuật → Section 3.'],
          ['Describing changes in family life over time', 'no', 'Độc thoại/bài giảng mang tính học thuật → Section 4.'],
          ['Choosing a gift', 's1', 'Tình huống đời thường giữa khách và người bán.'],
          ['Arranging a birthday celebration', 's1', 'Đặt bàn cho tiệc sinh nhật — tình huống đời thường.'],
        ]),
        mcq('Phrases with numbers (Ex. 7)', 'Look at the following phrases taken from the recording (track 04). Which number is missing? Then check on the listening task.', [
          ["No, no, it's the day after – the ____", ['16th', '17th'], 'B', '"the day after" (ngày hôm sau) của 16th → 17th. Người khách đang sửa lại thông tin sai của quản lý.'],
          ['The private room can seat up to ____ people.', ['12', '20'], 'B', '12 là số người đặt; phòng chứa tối đa ("seat up to") 20 người → "plenty of space for 12 of you".'],
        ]),
        match('Words with a similar meaning (Ex. 11)', 'Match the words and phrases 1–5 to words and phrases a–e, which have a similar meaning.', [
          ['a goodbye party', 'a leaving party'],
          ['a soccer game', 'a football match'],
          ['a celebration', 'a birthday party'],
          ['brother and sister', 'members of the same family'],
          ['work in the same office', 'colleagues'],
        ]),
        match('Topic areas of the questions (Ex. 12)', 'Read questions 1–6 in the Exam skills task and match them with the topic areas.', [
          ['1 Who are the two speakers?', 'The relationship between the people'],
          ['2 What celebration are they talking about?', 'The type of event'],
          ['3 What colour hat do baby girls wear at the event in Korea?', 'Colour'],
          ['4 The purse represents …', 'The meaning of something'],
          ['5 What food do guests have at the event?', 'Food'],
          ['6 What does the baby receive from the guests?', 'Presents'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U01-R1',
      title: 'Mindset 1 · Unit 1 — Blood is thicker than water',
      content: html(BLOOD),
      questionGroups: [
        qFill(1, 'Answer the questions below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.', [
          ['What percentage of children live in extended families in Asia, the Middle East, South America and Sub-Saharan Africa?', 'over 40% / over 40 percent', 'Đoạn B: "In Asia, the Middle East, South America and Sub-Saharan Africa **over 40%** of children live in families with other adults…" — key words: percentage, Asia, Middle East… → scan tên riêng.'],
          ['Why are grandparents often less busy and stressed than parents? They are often ______.', 'retired', 'Đoạn C: "As they are often **retired**, they are not always busy and stressed as many parents are."'],
          ['What do young adults often think living alone will be like?', 'exciting', 'Đoạn E: "Young adults often feel that living alone will be **exciting**" (feel = think).'],
          ['What percentage of children in South Africa live with their extended family?', 'over 40% / over 40 percent / almost 70% / 70% / almost 70 percent', 'Đáp án sách: **over 40%**. Đoạn B: "In Asia, the Middle East, South America and Sub-Saharan Africa **over 40%** of children live in families with other adults… In South Africa, it is **almost 70%**." South Africa thuộc Sub-Saharan Africa nên "over 40%" đúng; "almost 70%" là con số riêng của South Africa nên cũng được chấm đúng. BẪY: 25% là con số của châu Âu/Úc/Bắc Mỹ.'],
          ['What helps children in extended families learn about the past?', "grandparents' stories / grandparents stories", 'Đoạn D: "Children learn about the past from **grandparents\' stories**." Nhớ viết đúng chính tả stories.'],
          ['What negative word can describe how it sometimes feels to live alone?', 'lonely', 'Đoạn E: "they forget that it can also be **lonely**." Chỉ viết 1 từ, không viết cả câu.'],
          ['According to the Italian proverb, who should you phone when you have a problem?', 'your grandmother / grandmother', 'Đoạn F: "If things aren\'t going well, call **your grandmother**." Không đổi thành "gran".'],
        ], 'Questions 1–7'),
      ],
    },
    {
      ref: 'M1-U01-R2',
      title: 'Mindset 1 · Unit 1 — Social media and the meaning of friendship',
      content: html(FRIENDSHIP),
      questionGroups: [
        qFill(1, 'Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.', [
          ['What has enabled people to have more friends than in the past, according to some people?', 'social media / the explosion of social media', 'Đoạn 1: "with the explosion of **social media** since then, many people now have over 300 people who they think of as friends… social media has helped us to expand and keep our friendships".'],
          ["What phrase does the writer use to describe people who don't stay in the same place?", 'geographically mobile', 'Đoạn 2: "people don\'t stay in the place where they were born… People are in general more **geographically mobile** nowadays."'],
          ['What work-related problem do people have that makes them less likely to form friendships?', 'less security', 'Đoạn 2: "People now have **less security** at work and this also means that they find it harder to build new relationships." (form friendships = build new relationships)'],
          ['What frequently influences the friendships of young children?', 'convenience', 'Đoạn 3: "Young children often choose their friends because of **convenience**" (frequently = often).'],
          ['What are people with friends less likely to suffer from?', 'mental health problems', 'Đoạn 4: "People who spend time with friends have fewer **mental health problems**" (less likely to suffer = have fewer).'],
        ], 'Questions 1–5'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U01-L1',
      title: 'Mindset 1 · Unit 1 — Two Section 1 conversations',
      description: 'A restaurant booking and buying a present: who is speaking and what do they want?',
      partNumber: 1,
      audioFile: 'Mindset_L1_02.mp3',
      transcript: T02,
      questionGroups: [
        qMcq(1, 'Listen and match the conversations with two of the situations. (Ex. 2)', [
          ['Conversation 1 is about…', ['Discussing a course assignment', 'Describing changes in family life over time', 'Choosing a gift', 'Arranging a birthday celebration'], 'D', lx('Hội thoại 1 nói về…', 'Đầu hội thoại 1.', "I need a table for 12 – it's my husband's 30th birthday, so we're having a celebration dinner", 'Đặt bàn cho tiệc sinh nhật chồng → D.')],
          ['Conversation 2 is about…', ['Discussing a course assignment', 'Describing changes in family life over time', 'Choosing a gift', 'Arranging a birthday celebration'], 'C', lx('Hội thoại 2 nói về…', 'Đầu hội thoại 2.', "I'm looking for a gift for my sister", 'Chọn quà cho em gái → C. (Có nhắc sinh nhật 18 tuổi nhưng không phải tổ chức tiệc.)')],
        ], 'Questions 1–2'),
        qMcq(3, 'Listen again and pay attention to the speakers. Is each person male or female? (Ex. 3)', [
          ['Conversation 1 — the manager', ['Male', 'Female'], 'A', lx('Người quản lý', 'Hội thoại 1.', 'Good evening, Willowtree Hotel. How can I help?', 'Giọng nam.')],
          ['Conversation 1 — the customer', ['Male', 'Female'], 'B', lx('Khách hàng', 'Hội thoại 1.', "it's my husband's 30th birthday", '"my husband" → khách là nữ.')],
          ['Conversation 2 — the shop assistant', ['Male', 'Female'], 'B', lx('Người bán hàng', 'Hội thoại 2.', 'Good afternoon, can I help you?', 'Giọng nữ.')],
          ['Conversation 2 — the customer', ['Male', 'Female'], 'A', lx('Khách hàng', 'Hội thoại 2.', "I'm looking for a gift for my sister", 'Giọng nam.')],
        ], 'Questions 3–6'),
        qMcq(7, 'Listen again and choose the correct answer, A or B. (Ex. 4)', [
          ['In conversation 1, the customer would like to…', ['book a table.', 'order a meal.'], 'A', lx('Khách muốn…', 'Hội thoại 1.', "I'd like to make a reservation in your restaurant", 'make a reservation = book a table → A.')],
          ['In conversation 2, the customer wants to buy…', ['a necklace.', 'earrings.'], 'B', lx('Khách muốn mua…', 'Hội thoại 2.', ['a necklace, perhaps?', 'she has so many necklaces. I was thinking of a pair of earrings'], 'BẪY: người bán gợi ý necklace nhưng khách từ chối → B.')],
        ], 'Questions 7–8'),
      ],
    },
    {
      ref: 'M1-U01-L2',
      title: 'Mindset 1 · Unit 1 — Listening for numbers',
      description: 'Listen and choose the number you hear in each pair.',
      partNumber: 1,
      audioFile: 'Mindset_L1_03.mp3',
      transcript: T03,
      questionGroups: [
        qMcq(1, 'Listen and choose the number you hear in each pair. (Ex. 5)', [
          ['a', ['1st', '3rd'], 'B', lx('the third', '', 'the 3rd', 'third /θɜːd/ — âm "th" đầu.')],
          ['b', ['$10.50', '$10.15'], 'A', lx('ten dollars fifty', '', '$10.50', 'fifty /ˈfɪfti/ trọng âm đầu; fifteen trọng âm cuối.')],
          ['c', ['6th', '8th'], 'A', lx('the sixth', '', 'the 6th', '')],
          ['d', ['17', '70'], 'B', lx('seventy', '', '70', 'SEVenty (trọng âm đầu) ≠ sevenTEEN.')],
          ['e', ['19', '90'], 'A', lx('nineteen', '', '19', 'nineTEEN (trọng âm cuối).')],
          ['f', ['52', '62'], 'B', lx('sixty-two', '', '62', '')],
          ['g', ['£110', '£810'], 'A', lx('a hundred and ten pounds', '', '£110', '')],
          ['h', ['22nd', '27th'], 'B', lx('the twenty-seventh', '', 'the 27th', '')],
        ], 'Questions 1–8'),
      ],
    },
    {
      ref: 'M1-U01-L3',
      title: 'Mindset 1 · Unit 1 — Booking a table',
      description: 'The next part of conversation 1: the restaurant booking.',
      partNumber: 1,
      audioFile: 'Mindset_L1_04.mp3',
      transcript: T04,
      questionGroups: [
        qMcq(1, 'Listen to the next part of conversation 1 and choose the correct answer. (Ex. 6)', [
          ['How many people does the woman want to make the booking for?', ['8', '12', '16'], 'B', lx('Người phụ nữ muốn đặt cho bao nhiêu người?', 'Câu đầu.', ["I need a table for 12", "So that's 12 people for the 16th"], '12 người. 16 là ngày (bị sửa lại) — không phải số người.')],
          ['What is the date of the booking?', ['12th', '16th', '17th'], 'C', lx('Ngày đặt bàn là ngày nào?', 'Khi khách sửa lại.', "No, no, it's the day after – the 17th – Saturday the 17th", 'BẪY: quản lý nói "16th" nhưng khách sửa "No, no… the 17th" → C.')],
        ], 'Questions 1–2'),
        qMcq(3, 'Which number is missing from each phrase? (Ex. 7)', [
          ["No, no, it's the day after – the ______", ['16th', '17th'], 'B', lx('Không, không, là ngày hôm sau – ngày ___', '', "it's the day after – the 17th", '"the day after" = ngày sau 16 → 17th.')],
          ['The private room can seat up to ______ people.', ['12', '20'], 'B', lx('Phòng riêng chứa tối đa ___ người.', 'Cuối đoạn.', 'It can seat up to 20 people, so there would be plenty of space for 12 of you', 'seat up to = sức chứa tối đa → 20.')],
        ], 'Questions 3–4'),
      ],
    },
    {
      ref: 'M1-U01-L4',
      title: 'Mindset 1 · Unit 1 — The total cost of the booking',
      description: 'The rest of conversation 1.',
      partNumber: 1,
      audioFile: 'Mindset_L1_05.mp3',
      transcript: T05,
      questionGroups: [
        qMcq(1, 'Now listen to the rest of conversation 1 and choose the correct answer. (Ex. 8)', [
          ['How much is the total cost of the booking?', ['£218', '£318', '£380'], 'B', lx('Tổng chi phí đặt bàn là bao nhiêu?', 'Cuối hội thoại.', ["that will come to £318", "Did you say three hundred and eighty pounds?", "No, three hundred and eighteen"], 'Khách nghe nhầm 380, quản lý sửa lại 318 → B. "come to" = tổng cộng.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M1-U01-L5',
      title: 'Mindset 1 · Unit 1 — Buying earrings',
      description: 'The second part of conversation 2.',
      partNumber: 1,
      audioFile: 'Mindset_L1_06.mp3',
      transcript: T06,
      questionGroups: [
        qMcq(1, 'Listen to the second part of conversation 2 and answer the questions. (Ex. 9)', [
          ['The price of the earrings now is…', ['£10', '£20', '£30'], 'B', lx('Giá đôi bông tai bây giờ là…', 'Khi khách hỏi giá.', "they were £30, but actually we've got a sale on at the moment, so they're a little cheaper – only £20", '£30 là giá cũ, £10 là số tiền tiết kiệm; giá hiện tại ("now") = £20.')],
          ['How much does the customer pay for the gift wrapping?', ['£4', '£5', '£7'], 'B', lx('Khách trả bao nhiêu tiền gói quà?', 'Cuối hội thoại.', ["for £5 you can have our luxury wrapping service", "I'll take the luxury option. But I already have a card"], 'Chọn gói luxury £5; không lấy thiệp (+£2) → không phải £7.')],
        ], 'Questions 1–2'),
        qNote('Listen again and complete this part of the conversation. Write a NUMBER for each answer. (Ex. 10)', 'Customer: Oh, really? So, how much are they?', [
          'Assistant: Well, they were __Q3__ pounds, but actually we\'ve got a sale on at the moment, so they\'re a little cheaper – only __Q4__ pounds. So you can save __Q5__ pounds!',
        ], { 3: ['30', 'thirty'], 4: ['20', 'twenty'], 5: ['10', 'ten'] }, {
          3: lx('Trước đây giá ___ bảng', '', 'they were £30'),
          4: lx('chỉ còn ___ bảng', '', 'only £20'),
          5: lx('bạn tiết kiệm được ___ bảng', '', 'So you can save £10!'),
        }, 'Questions 3–5'),
      ],
    },
    {
      ref: 'M1-U01-L6',
      title: 'Mindset 1 · Unit 1 — Exam skills: a baby\'s first birthday',
      description: 'Nam shows Mark photos of a family celebration in Korea.',
      partNumber: 1,
      audioFile: 'Mindset_L1_08.mp3',
      transcript: T08,
      questionGroups: [
        qMcq(1, 'Listen to the conversation and choose the correct letter, A, B or C. (Ex. 13)', [
          ['Who are the two speakers?', ['good friends', 'work colleagues', 'family members'], 'A', lx('Hai người nói là ai?', 'Đầu bài.', ["Hi there, Nam! You aren't still working on your history assignment, are you?", 'Then we can try to finish our assignments'], 'Hai bạn học cùng làm bài tập (assignment), chào nhau thân mật → bạn bè. Không phải đồng nghiệp hay người nhà.')],
          ['What celebration are they talking about?', ['a birthday party', 'a graduation', 'a wedding'], 'A', lx('Họ nói về dịp lễ nào?', 'Đầu bài.', ["She's one year old in this picture. It's a very important birthday in Korea", 'more important than a wedding or a graduation'], 'Sinh nhật 1 tuổi (Doljanchi). BẪY: wedding/graduation chỉ được nhắc để so sánh.')],
          ['What colour hat do baby girls wear at the event in Korea?', ['black and silver', 'black', 'red and silver'], 'C', lx('Bé gái đội mũ màu gì?', 'Đoạn nói về mũ.', ["I like the red and silver hat Tae-Hee's wearing too", "it's a traditional hat for a girl. Baby boys wear a different one – all black"], 'Bé gái: red and silver. Black = bé trai; black and silver là ý kiến của Mark.')],
          ['The purse represents…', ['good health.', 'good fortune.', 'wealth.'], 'B', lx('Chiếc ví tượng trưng cho…', 'Đoạn về chiếc ví.', "It's made of silk and it means good luck in our culture", 'good luck = good fortune (đồng nghĩa) → B. Long life là ý nghĩa của chiếc thắt lưng.')],
          ['What food do guests have at the event?', ['oranges', 'vegetables', 'rice cakes'], 'C', lx('Khách ăn món gì?', 'Đoạn về bàn tiệc.', ["It's rice cakes.", 'We always eat rice cakes at a baby\'s party'], 'BẪY: "orange in colour" và "looks like a vegetable" chỉ mô tả bánh gạo → C.')],
          ['What does the baby receive from the guests?', ['a candle', 'some money', 'some tea'], 'B', lx('Em bé nhận được gì từ khách?', 'Cuối bài.', 'the baby receives money from the guests', 'Candle/chocolates/tea là quà khách nhận trong túi quà → B.')],
        ], 'Questions 1–6'),
      ],
    },
  ],
};
