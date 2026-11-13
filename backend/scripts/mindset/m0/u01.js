// Mindset for IELTS Foundation — Unit 1: Daily life (Student's Book pp. 10–19)
const { mcq, gap, match, order, cat, write, speak, passage, picture, card, qMcq, qMatch, lx, html } = require('../dsl');

const READING_TEXT = `## NINA — NORWAY

I live in a village on Norway's Atlantic coast. I get up at 7:30am and walk to college. Classes begin at 8:30am and finish at 3pm. After that, I go to one of the college clubs. These are not very expensive and there are lots to choose from. I do athletics and football but you can also do things like folk dancing and cross-country skiing. When my parents come home from work, my dad makes dinner and we all eat together. After that, my mum takes me out for a driving lesson. I've got my test soon and I need to practise!

## AVA — AUSTRALIA

I'm from a small town in Queensland. Most people in Australia live near the coast, but we live on a cattle farm in the centre of the country. I get up at around 7am and have breakfast. My mum teaches at my college, so I usually go with her in the car instead of taking the bus. College starts at 8:30am and finishes at 4pm. When I get home, I help my dad on the farm for a few hours. In the evenings, I try to watch TV but I'm usually too tired. I go to bed at about 10:00pm.

## MICHAEL — BRAZIL

I live in Rio de Janeiro. I get up at 6am and catch a bus to college at 6:30am. Lessons start at 7:20am. We have a break at 9:50am and then study until 12:30pm. I get home at about 1:40pm. After that, I often go to the beach with my friends to swim in the ocean or play beach volleyball, but I sometimes also just stay at home to sleep or study. In the evenings, I cook dinner for my family, then we watch TV or listen to the radio before bed. I switch off my light at about 10pm.`;

const DAN_TEXT = `Dan usually gets up at 8am, has a shower and eats breakfast. After that, he always gets his books ready and then goes to his lectures until midday. He usually returns home and makes lunch for himself at about 12:30pm. Then, he sometimes watches a bit of TV. At about 3pm, he often meets a friend for coffee. At 3:30pm, they sometimes go to the library together. Dan always studies for a few hours and then at around 6:30pm he goes home. He usually cooks dinner for himself and his flatmates. In the evening, he sometimes exercises at the gym or goes for a run. After that, he relaxes in front of the TV or sees his friends. He never goes to bed early, but usually falls asleep at around midnight.`;

const HOUSEWORK_TEXT = `I often help a lot around the house and I usually help my mum **do the laundry**. My brother is lazy and he never washes his clothes. He always leaves them in a pile on his bedroom floor. In the evening after school, I always **tidy up** my room. I put things away and get my schoolbag ready for the next day. My dad sometimes **washes up** after dinner. We don't have a dishwasher at the moment because our old one broke down, so he has to clean the dishes by himself. My sister likes cooking, so she often helps mum **make lunch and dinner**. She prepared a delicious meal of roast chicken at the weekend. Sometimes my brother **puts the rubbish out**, but he usually just leaves it by the back door instead of taking it out to the bins. We all usually try and help and **do the cleaning**. When the housework is done, we always relax and watch TV.`;

const EXCHANGE_TRANSCRIPT = `Carlos: Hi Jack! I'm really excited about coming to stay with you at your house on the student exchange trip to Australia next term.
Jack: Me too, Carlos! I know you're going to have a great time at my school and with my family.
Carlos: Tell me a bit about your family. What do you all like doing?
Jack: Well, I love playing volleyball and basketball. I do volleyball once a week and basketball twice a week.
Carlos: I remember you have a brother. What does he do? Is he interested in sport, too?
Jack: No, not really. He prefers staying at home and reading. He's a member of our local gym but he never goes.
Carlos: Oh, that sounds like me! You've got a sister too, haven't you?
Jack: Yes, she's really good at painting and drawing. Some of her work is hanging up on the walls at home, so you'll be able to see it when you come.
Carlos: That would be great. I'd love to see it. What about your parents?
Jack: Well, my mum loves growing things. She spends a lot of time outdoors, planting flowers and cutting the grass.
Carlos: That sounds interesting. And your dad? What does he like doing?
Jack: Well, he's really good at building and fixing things. If anything gets broken around the house, he fixes it. He makes new things, too, like furniture.
Carlos: Great! And I know your grandma lives with you. What does she like doing?
Jack: Well, we're lucky – she's an amazing cook and makes us all wonderful meals every day. She already wants to know what you like eating.
Carlos: [Laughs] Really? Well, that gives me an idea for a present for her – a recipe book from where I'm from in the USA.
Jack: Perfect!`;

module.exports = {
  n: 1,
  title: 'Daily life',
  titleVi: 'Cuộc sống hằng ngày',
  pages: '10–19',
  outcomes: [
    'Hiểu và nói về các hoạt động trong thói quen hằng ngày (daily routine)',
    'Dùng thì hiện tại đơn và trạng từ chỉ tần suất (always, usually, often, sometimes, never)',
    'Đọc nhiều đoạn văn ngắn để chọn đáp án đúng; đoán nghĩa từ qua ngữ cảnh',
    'Viết đoạn văn mô tả thói quen hằng ngày',
    'Nghe hội thoại về chuyến trao đổi học sinh và nối thông tin',
    'Nói 1–2 phút về một ngày của bạn',
  ],
  lessons: {
    // ── 1. Lead-in + Vocabulary and speaking (pp. 10–11) ──
    vocab: {
      title: 'Từ vựng: hoạt động hằng ngày',
      titleEn: 'Lead-in · Vocabulary and speaking',
      minutes: 35,
      objectives: [
        'Gọi tên 10 hoạt động hằng ngày trong tranh (get up, catch the bus, go online…)',
        'Chọn đúng động từ đi kèm: catch the bus, do sightseeing, chat to friends…',
        'Lưu 18 cụm từ vào Sổ 1 và luyện đến khi đúng ≥70%',
      ],
      images: ['media:m0u01-leadin.jpg|Lead-in (tr. 10): Bạn làm những hoạt động nào mỗi ngày?'],
      theory: [
        card('Cụm từ chỉ thói quen hằng ngày', 'Daily routine collocations', {
          formula: ['**động từ + danh từ** đi thành cụm cố định — học cả cụm, đừng học từng từ lẻ'],
          usage: [
            '**get up** (thức dậy, ra khỏi giường) ≠ **stand up** (đứng dậy) ≠ **stay up** (thức khuya)',
            '**catch / take the bus** (bắt xe buýt) — KHÔNG nói "go the bus"',
            '**have breakfast / lunch / dinner** — KHÔNG dùng "eat a breakfast"',
            '**do some sightseeing** (đi tham quan), **do exercise**, **do homework**',
            '**go online** (lên mạng), **go to bed**, **go to school/college**',
            '**watch TV** (xem TV) — "see" dùng cho phim ở rạp/nhìn thấy; "look at" là nhìn vào',
          ],
          examples: [
            ['Ping gets up at 7:30am every morning.', 'Ping thức dậy lúc 7:30 mỗi sáng.'],
            ['At 8:30am, he catches the bus to his language school.', 'Lúc 8:30 cậu ấy bắt xe buýt đến trường ngôn ngữ.'],
            ['He often does some sightseeing with his friends.', 'Cậu ấy thường đi tham quan cùng bạn bè.'],
          ],
          notes: [
            '**come from** + nơi chốn = đến từ (quê ở): The students all come from different countries.',
            '**chat to/with someone** = trò chuyện; "tell" phải có tân ngữ (tell somebody something).',
          ],
        }),
      ],
      vocab: [
        ['get up', 'thức dậy (ra khỏi giường)', 'I get up at 7am every day.'],
        ['stay up', 'thức khuya', 'I sometimes stay up late to watch films.'],
        ['have breakfast', 'ăn sáng', 'Ping has breakfast with his host family.'],
        ['catch the bus', 'bắt xe buýt', 'He catches the bus to his language school.'],
        ['exercise', 'tập thể dục', 'I exercise for 30 minutes every morning.'],
        ['study', 'học bài', 'I study English in the evening.'],
        ['work', 'làm việc', 'My parents work in the city.'],
        ['go online', 'lên mạng', 'In the evening, he watches TV or goes online.'],
        ['watch TV', 'xem TV', 'We watch TV after dinner.'],
        ['relax with friends', 'thư giãn cùng bạn bè', 'At the weekend, I relax with friends.'],
        ['go to bed', 'đi ngủ', 'I go to bed at about 11pm.'],
        ['chat to someone', 'trò chuyện với ai đó', 'Ping chats to his classmates during the day.'],
        ['come from', 'đến từ', 'The students come from different countries around the world.'],
        ['do some sightseeing', 'đi tham quan', 'He often does some sightseeing in the city.'],
        ['host family', 'gia đình bản xứ (nhận học sinh ở cùng)', 'Ping lives with a host family in the UK.'],
        ['language course', 'khoá học ngôn ngữ', 'He is doing a language course in the UK.'],
        ['classmate', 'bạn cùng lớp', 'My classmates are very friendly.'],
        ['daily routine', 'thói quen hằng ngày', 'My daily routine is quite busy.'],
        ["make a mess","bày bừa, làm bừa bộn","My little brother always makes a mess in the kitchen."],
        ["brush my teeth","đánh răng","After breakfast, I brush my teeth."],
        ["make a noise","gây ồn","Please don't make a noise – the baby is asleep."],
      ],
      ex: [
        mcq('Ping in England – choose the correct word (Ex. 3)', 'Read the sentences about Ping, a young man on a language course in England. Choose the best answer, A, B or C.', [
          ['Ping ____ at 7:30am every morning and has breakfast with his host family.', ['gets up', 'stands up', 'stays up'], 'A', 'get up = thức dậy, rời giường buổi sáng. stand up = đứng lên (từ tư thế ngồi); stay up = thức khuya.'],
          ['At 8:30am, he ____ the bus to his language school.', ['goes', 'catches', 'travels'], 'B', 'Cụm cố định: catch the bus (bắt xe buýt). "go" và "travel" cần giới từ: go/travel by bus.'],
          ['During the day, Ping studies English and ____ to his classmates.', ['laughs', 'chats', 'tells'], 'B', 'chat to somebody = trò chuyện với ai. "laugh to" sai; "tell" cần tân ngữ trực tiếp (tell them a story).'],
          ['Everyone speaks English in his class because the students all ____ from different countries around the world.', ['arrive', 'live', 'come'], 'C', 'come from = đến từ (quê ở đâu). arrive from = vừa tới từ (một chuyến đi), không hợp nghĩa "quê quán".'],
          ['After Ping finishes school at 3:00pm, he often ____ some sightseeing in the city with his friends.', ['does', 'makes', 'has'], 'A', 'Cụm cố định: do some sightseeing (đi tham quan).'],
          ['In the evening, Ping relaxes with his host family, ____ TV or goes online.', ['watches', 'sees', 'looks'], 'A', 'watch TV = xem TV (theo dõi một thứ đang chuyển động). see = nhìn thấy; look (at) = nhìn vào.'],
        ]),
        gap('Everyday phrases (Lead-in)', 'Complete the phrases from the Lead-in pictures with ONE verb. Change the form of the verb if necessary.', [
          ['Every morning I ____ breakfast at 7am.', 'have', 'have breakfast — ăn sáng (không dùng "eat a breakfast").'],
          ['I usually ____ the bus to college at 7:30.', 'catch|take', 'catch/take the bus.'],
          ['After dinner, my sister ____ online and chats to her friends.', 'goes', 'go online — chủ ngữ số ít (my sister) → goes.'],
          ['My dad ____ TV in the living room every evening.', 'watches', 'watch TV — he/she → thêm -es (watches).'],
          ['I always ____ to bed at about 10:30pm.', 'go', 'go to bed — đi ngủ.'],
          ['At the weekend, I ____ with friends in a café.', 'relax', 'relax with friends — thư giãn cùng bạn.'],
        ]),
      ],
    },

    // ── 2. Reading: choose the correct answer / sentence completion / matching (pp. 12–15) ──
    reading: {
      title: 'Reading: chọn đáp án đúng từ nhiều đoạn văn',
      titleEn: 'Reading: choose the correct answer · sentence completion · matching',
      minutes: 50,
      objectives: [
        'Đọc lướt (skim) 3 đoạn văn ngắn để nắm ý chính trong 1–2 phút',
        'Làm dạng câu hỏi "Who…?" khi thông tin nằm rải rác ở nhiều đoạn',
        'Đoán nghĩa từ mới dựa vào ngữ cảnh xung quanh',
        'Nhận ra các cụm từ đồng nghĩa (do the laundry = wash the clothes)',
      ],
      theory: [
        card('Dạng bài: chọn đáp án đúng từ nhiều đoạn văn', 'Choose the correct answer — multiple texts', {
          formula: [
            '**Bước 1 – Skim**: đọc lướt cả 3 đoạn (1–2 phút), gạch chân hoạt động chính của từng người.',
            '**Bước 2 – Đọc câu hỏi**: gạch từ khoá (keyword) — ví dụ "**works** with a **member of the family** after college".',
            '**Bước 3 – Scan**: tìm ý đồng nghĩa trong CẢ 3 đoạn, vì nhiều người có thông tin gần giống nhau.',
            '**Bước 4 – Kiểm tra**: loại 2 người còn lại bằng chứng cứ, chọn người khớp 100%.',
          ],
          usage: [
            'Câu hỏi hiếm khi lặp lại đúng chữ trong bài — chúng **diễn đạt lại (paraphrase)**: "prepares the evening meal" = "cook dinner".',
            'Thông tin về một câu hỏi thường xuất hiện ở **nhiều hơn một đoạn** (TIP 06 của sách): Ava và Nina đều đi ô tô, nhưng chỉ Ava đi ô tô **tới trường**.',
          ],
          examples: [
            ['Who finishes studying before 1pm? → Michael: "study until 12:30pm"', 'Nina học đến 3pm, Ava đến 4pm → chỉ Michael đúng.'],
            ['Who gets a lift in a car to college? → Ava: "I usually go with her in the car"', 'get a lift = được chở đi nhờ.'],
          ],
          notes: [
            'MINI TIP 6.1: đoạn nào cũng nhắc tới người thân — hãy xem ai **làm việc cùng** người thân **sau giờ học** (Ava giúp bố ở trang trại).',
            'Đừng chọn chỉ vì thấy một từ giống câu hỏi — đọc cả câu để chắc nghĩa khớp.',
          ],
        }),
        card('Đoán nghĩa từ qua ngữ cảnh', 'Guessing meaning from context', {
          usage: [
            'Nhìn **từ loại**: đứng sau "a/the" thường là danh từ; sau "I/we" là động từ.',
            'Nhìn **ví dụ đi kèm**: "things **like** folk dancing and cross-country skiing" → đây là các hoạt động/môn thể thao.',
            'Nhìn **câu trước/sau**: "My mum teaches at my college, so I go with her **in the car**" → get a lift = được chở đi.',
          ],
          examples: [
            ['We live on a cattle farm in the centre of the country.', 'cattle farm = trang trại nuôi bò (đoán qua "farm" + "help my dad on the farm").'],
            ['I switch off my light at about 10pm.', 'switch off = tắt (đèn) → nghĩa là đi ngủ.'],
          ],
        }),
      ],
      links: [
        { ref: 'reading:M0-U01-R1', title: 'A Day in the Life — 3 học sinh, 7 câu hỏi "Who…?" (Ex. 5–6)', note: 'Đọc lướt 1 lần, rồi chọn Ava / Michael / Nina cho từng câu. Có giải thích chi tiết sau khi nộp.' },
      ],
      vocab: [
        ['coast', 'bờ biển', "I live in a village on Norway's Atlantic coast."],
        ['village', 'ngôi làng', 'My grandparents live in a small village.'],
        ['college club', 'câu lạc bộ ở trường', 'After class, I go to one of the college clubs.'],
        ['athletics', 'điền kinh', 'I do athletics and football.'],
        ['folk dancing', 'múa dân gian', 'You can also do folk dancing.'],
        ['driving lesson', 'buổi học lái xe', 'My mum takes me out for a driving lesson.'],
        ['cattle farm', 'trang trại nuôi bò', 'We live on a cattle farm.'],
        ['get a lift', 'được chở đi nhờ', 'I usually get a lift to college with my mum.'],
        ['instead of', 'thay vì', 'I go in the car instead of taking the bus.'],
        ['too tired', 'quá mệt', "I'm usually too tired to watch TV."],
        ['break', 'giờ giải lao', 'We have a break at 9:50am.'],
        ['switch off', 'tắt (đèn, máy)', 'I switch off my light at about 10pm.'],
        ['lecture', 'bài giảng (đại học)', 'He goes to his lectures until midday.'],
        ['flatmate', 'bạn ở chung căn hộ', 'He cooks dinner for his flatmates.'],
        ['fall asleep', 'ngủ thiếp đi', 'He usually falls asleep at around midnight.'],
        ['do the laundry', 'giặt giũ quần áo', 'I help my mum do the laundry.'],
        ['tidy up', 'dọn dẹp cho gọn', 'I always tidy up my room in the evening.'],
        ['wash up', 'rửa bát đĩa', 'My dad washes up after dinner.'],
        ['put the rubbish out', 'đem rác ra ngoài', 'My brother sometimes puts the rubbish out.'],
        ['do the cleaning', 'lau dọn nhà cửa', 'We all help and do the cleaning.'],
      ],
      ex: [
        mcq('Words in "A Day in the Life"', 'Read the sentences from the text again and choose the best meaning of the phrase in bold. Use the context to help you.', [
          ['"You can also do things like **folk dancing** and cross-country skiing." — What is folk dancing?', ['a kind of traditional activity / dance', 'a kind of Norwegian food', 'a compulsory school subject'], 'A', '"things like…" giới thiệu các hoạt động ở câu lạc bộ → folk dancing = múa dân gian.'],
          ['"We live on a **cattle farm** in the centre of the country." — What are cattle?', ['rice plants', 'cows (farm animals)', 'lorries'], 'B', 'Cattle = gia súc (bò). Ava còn "help my dad on the farm" — đúng ngữ cảnh trang trại.'],
          ['"My mum teaches at my college, so I usually go with her in the car **instead of** taking the bus."', ['together with', 'in place of / rather than', 'after'], 'B', 'Ava đi ô tô với mẹ, KHÔNG đi xe buýt → instead of = thay vì.'],
          ['"In the evenings, I try to watch TV but I\'m usually **too tired**."', ['I really enjoy it', 'so tired that I can\'t do it', 'too busy studying'], 'B', '"try to… but…" → muốn xem TV nhưng không làm được vì quá mệt (làm trang trại cả buổi chiều).'],
          ['"I **switch off** my light at about 10pm."', ['turn the light on', 'turn the light off (go to sleep)', 'change the light bulb'], 'B', 'switch off = tắt; tắt đèn lúc 10pm = giờ đi ngủ.'],
        ], { stimulus: passage(READING_TEXT.replace(/## /g, ''), { caption: 'A Day in the Life (tr. 12)' }) }),
        gap('Dan\'s daily routine (Ex. 10)', 'Read the information about Dan, a student at a university in the UK. Put the verbs in brackets into the present simple.', [
          ['Dan usually ____ (get up) at 8am, ____ (have) a shower and ____ (eat) breakfast.', ['gets up', 'has', 'eats'], 'Chủ ngữ Dan (he) → gets up, has (bất quy tắc: have → has), eats.'],
          ['After that, he always ____ (get) his books ready and then ____ (go) to his lectures until midday.', ['gets', 'goes'], 'go → goes (động từ tận cùng -o thêm -es).'],
          ['He usually ____ (return) home and ____ (make) lunch for himself at about 12:30pm.', ['returns', 'makes'], 'Động từ thường → thêm -s.'],
          ['Then, he sometimes ____ (watch) a bit of TV. At about 3pm, he often ____ (meet) a friend for coffee.', ['watches', 'meets'], 'watch → watches (tận cùng -ch thêm -es).'],
          ['At 3:30pm, they sometimes ____ (go) to the library together.', ['go'], 'Chủ ngữ "they" (số nhiều) → giữ nguyên go.'],
          ['Dan always ____ (study) for a few hours and then at around 6:30pm he ____ (go) home.', ['studies', 'goes'], 'study → studies (phụ âm + y → ies).'],
          ['He usually ____ (cook) dinner for himself and his flatmates. In the evening, he sometimes ____ (exercise) at the gym.', ['cooks', 'exercises'], 'cook → cooks; exercise → exercises.'],
          ['After that, he relaxes in front of the TV or ____ (see) his friends. He never goes to bed early, but usually ____ (fall) asleep at around midnight.', ['sees', 'falls'], 'see → sees; fall → falls.'],
        ], { stimulus: { kind: 'text', caption: 'TIP 11', rows: [['Highlighted words', 'usually, always, sometimes, often, never — they tell you how often Dan does something.']] } }),
        match('Phrases with a similar meaning – housework (Ex. 12)', 'Read the text about housework and match each phrase (1–6) with a phrase with a similar meaning (A–F).', [
          ['do the laundry', 'wash the clothes', 'do the laundry = giặt quần áo. Bài: "My brother… never washes his clothes."'],
          ['tidy up', 'put things away', 'tidy up = dọn gọn; câu sau giải thích "I put things away".'],
          ['wash up', 'clean the dishes', 'wash up = rửa bát; "he has to clean the dishes by himself".'],
          ['make lunch/dinner', 'prepare a meal', 'make dinner = prepare a meal; "She prepared a delicious meal".'],
          ['put the rubbish out', 'take out the bins', 'put the rubbish out = mang rác ra thùng; "taking it out to the bins".'],
          ['do the cleaning', 'do the housework', 'do the cleaning ≈ do the housework; "When the housework is done…".'],
        ], { stimulus: passage(HOUSEWORK_TEXT, { caption: 'Ex. 12 — Helping around the house' }) }),
      ],
    },

    // ── 3. Grammar and speaking (p. 14) + Grammar & Vocabulary Ex. 5–7 (pp. 18–19) ──
    grammar: {
      title: 'Ngữ pháp: Hiện tại đơn & trạng từ tần suất',
      titleEn: 'Grammar: present simple · adverbs of frequency',
      minutes: 30,
      objectives: [
        'Biết khi nào dùng hiện tại đơn: thói quen, việc lặp lại hằng ngày',
        'Thêm đúng -s / -es / -ies cho he/she/it',
        'Đặt trạng từ tần suất (always, usually, often, sometimes, never) đúng vị trí',
      ],
      keyLanguage: [
        'Hiện tại đơn dùng để nói về thói quen & hoạt động hằng ngày: I get up at 7am.',
        'he/she/it: Nhóm 1 thêm -s (gets up) · Nhóm 2 động từ tận cùng -s, -ch, -sh, -x thêm -es (watches) · Nhóm 3 phụ âm + y → -ies (tries, studies) · Nhóm 4 go, do, wash… thêm -es (goes, washes)',
        'Trạng từ tần suất: never (0%) → sometimes → often → usually → always (100%)',
        'Vị trí: ĐỨNG TRƯỚC động từ thường (He always gets up early) · ĐỨNG SAU "be" (I am never late)',
      ],
      links: [
        { grammar: 'present-simple', title: 'Present Simple', note: 'bài giảng + bài luyện chia động từ, câu phủ định và câu hỏi' },
        { grammar: 'sb-subject-verb', title: 'Câu S + V cơ bản', note: 'viết câu hoàn chỉnh chủ ngữ + động từ (nền tảng cho phần Writing)' },
      ],
      ex: [
        match('Grammar box: questions and answers (Ex. 7)', 'Read the Grammar box, then match questions 1–3 with answers A–C.', [
          ['What do we use the present simple for?', 'to talk about every day routines and habits', 'Hiện tại đơn diễn tả thói quen, hoạt động lặp lại.'],
          ['Why do we use adverbs of frequency?', 'to say how often we do something', 'always/usually/often/sometimes/never cho biết mức độ thường xuyên.'],
          ['What do verbs for he/she/it end in?', '-s', 'he/she/it + V-s/es.'],
        ]),
        cat('Third person verb endings (Ex. 8)', 'Put each verb into the correct group for he/she/it.', {
          g1: 'Group 1: add -s (gets up)', g2: 'Group 2: -s, -ch, -sh, -x → add -es (watches)', g3: 'Group 3: consonant + y → -ies (tries)', g4: 'Group 4: go/do/wash… → -es (goes)',
        }, [
          ['exercise', 'g1', 'exercises'], ['work', 'g1', 'works'], ['play', 'g1', 'plays — nguyên âm + y chỉ thêm -s'], ['cook', 'g1', 'cooks'], ['listen', 'g1', 'listens'],
          ['catch', 'g2', 'catches'], ['relax', 'g2', 'relaxes'], ['finish', 'g2', 'finishes'], ['switch', 'g2', 'switches'], ['teach', 'g2', 'teaches'],
          ['study', 'g3', 'studies'], ['try', 'g3', 'tries'], ['cry', 'g3', 'cries'],
          ['go', 'g4', 'goes'], ['do', 'g4', 'does'],
          ['live', 'g1', 'lives'], ['come', 'g1', 'comes'], ['get up', 'g1', 'gets up'], ['help', 'g1', 'helps'], ['swim', 'g1', 'swims'], ['stay', 'g1', 'stays — nguyên âm + y chỉ thêm -s'], ['practise', 'g1', 'practises'],
          ['watch', 'g2', 'watches'],
        ]),
        gap('Third person singular (G&V Ex. 5)', 'Complete the sentences with the he/she/it form of the verb in brackets.', [
          ['My dad ____ (wash) his car every weekend.', 'washes', 'wash → washes (-sh + es).'],
          ['Jim ____ (watch) too much TV.', 'watches', '-ch + es.'],
          ["Adrian's baby ____ (cry) a lot.", 'cries', 'phụ âm + y → ies.'],
          ['My brother is good at chess and ____ (practise) every day.', 'practises|practices', 'practise → practises.'],
          ['Olga ____ (go) jogging most evenings after work.', 'goes', 'go → goes.'],
          ['Tom\'s wife cooks and Tom ____ (do) the washing up.', 'does', 'do → does.'],
          ['Anna ____ (catch) the 253 bus to college each morning.', 'catches', 'catch → catches.'],
          ['Nadia ____ (relax) by doing yoga.', 'relaxes', '-x + es.'],
          ['I think our teacher ____ (give) us far too much homework.', 'gives', 'give → gives.'],
          ['My brother ____ (switch off) his light at about midnight.', 'switches off', 'switch → switches; "off" giữ nguyên.'],
        ]),
        mcq('Choose the correct verb form (G&V Ex. 6)', 'Choose the correct form of the verb in each sentence.', [
          ['My brother ____ for a computer company in the city.', ['works', 'work'], 'A', 'My brother = he → works.'],
          ['My friends and I often ____ basketball together at the weekends.', ['play', 'plays'], 'A', 'My friends and I = we → play.'],
          ['I go to a college where everyone ____ different languages.', ['study', 'studies'], 'B', 'everyone luôn đi với động từ số ít → studies.'],
          ['My grandparents ____ from a small village in Germany.', ['come', 'comes'], 'A', 'grandparents (số nhiều) → come.'],
          ['In Britain, most school students ____ a uniform.', ['wear', 'wears'], 'A', 'students (số nhiều) → wear.'],
          ['In the evenings, I ____ to chat to my friends online.', ['like', 'likes'], 'A', 'I → like.'],
          ['In my family, only my sister ____ before 6am.', ['gets up', 'get up'], 'A', 'my sister = she → gets up.'],
          ['I ____ a dance class every Wednesday evening.', ['have', 'has'], 'A', 'I → have.'],
          ['My friend is good at baking and ____ amazing cakes.', ['make', 'makes'], 'B', 'My friend = he/she → makes.'],
          ['My lunch break ____ at 12pm and finishes at 12:45pm.', ['begin', 'begins'], 'B', 'My lunch break = it → begins.'],
        ]),
        order('Position of frequency adverbs', 'Put the words in the correct order to make sentences. Frequency adverbs go BEFORE most verbs and AFTER the verb "be".', [
          ['He always gets up early.', 'always đứng trước động từ thường gets up.'],
          ['I am never late for college.', 'never đứng sau "am".'],
          ['My sister often helps mum make dinner.', 'often + helps.'],
          ['We sometimes go to the beach after college.', 'sometimes + go.'],
          ['Ava is usually too tired to watch TV.', 'usually đứng sau "is".'],
        ]),
      ],
    },

    // ── 4. Writing: describing a daily routine / a description (pp. 15–16) ──
    writing: {
      title: 'Writing: mô tả thói quen hằng ngày',
      titleEn: 'Writing: describing a daily routine · a description',
      minutes: 50,
      objectives: [
        'Viết đoạn văn 70–120 từ mô tả một ngày: hoạt động + thời gian',
        'Nối các câu bằng từ chỉ trình tự: First, After that, Next, Then, Finally',
        'Dùng trạng từ tần suất và chia đúng hiện tại đơn',
        'Tự sửa lỗi chính tả, ngữ pháp, dấu câu trước khi nộp (Ex. 14)',
      ],
      images: ['media:m0u01-julia.jpg|Ex. 13 (tr. 15): Một ngày của Julia Grant — tình nguyện viên dự án khoa học ở Fiji'],
      theory: [
        card('Bố cục đoạn văn mô tả một ngày', 'Describing a daily routine', {
          formula: [
            '**Câu mở đầu**: giới thiệu người viết/nhân vật — Julia Grant is 21 years old and works as a volunteer…',
            '**Thân đoạn (theo thứ tự thời gian)**: Every morning, she … at 7am. **After that**, … **Next**, … **Then**, …',
            '**Câu kết**: hoạt động cuối ngày / cảm nhận — She usually goes to bed at 10pm because she is very tired.',
          ],
          usage: [
            'Mỗi câu nên có: **thời gian + hoạt động** (at 7am / in the afternoon / after lunch).',
            'Từ trình tự đứng đầu câu, theo sau là dấu phẩy: **After that,** she has breakfast.',
            'Thêm **trạng từ tần suất** cho tự nhiên: she **usually** works on her laptop, she **sometimes** goes snorkelling.',
          ],
          examples: [
            ['Every morning, she gets up at 6:30am.', 'Mỗi sáng cô ấy dậy lúc 6:30.'],
            ['After that, she always checks her emails on her laptop.', 'Sau đó, cô ấy luôn kiểm tra email trên laptop.'],
            ['In the evening, she often sits by a campfire with her friends.', 'Buổi tối cô ấy thường ngồi bên lửa trại với bạn.'],
          ],
          notes: [
            'Lỗi hay gặp: quên -s/-es (she **go** ✗ → she **goes** ✓), đặt trạng từ sai chỗ (she goes always ✗).',
            'Viết **in hoa** đầu câu và tên riêng (Fiji, Julia), kết thúc câu bằng dấu chấm.',
          ],
        }),
      ],
      vocab: [
        ['volunteer', 'tình nguyện viên', 'Julia works as a volunteer on a science project.'],
        ['science project', 'dự án khoa học', 'She works on a science project in Fiji.'],
        ['after that', 'sau đó', 'After that, she has breakfast.'],
        ['next', 'tiếp theo', 'Next, she works on her laptop.'],
        ['then', 'rồi thì, sau đó', 'Then, she cooks lunch with her friends.'],
        ['finally', 'cuối cùng', 'Finally, she goes to bed at 10pm.'],
        ['every morning', 'mỗi buổi sáng', 'Every morning, she gets up at 6am.'],
        ['check emails', 'kiểm tra email', 'She checks her emails after breakfast.'],
        ['hang out the washing', 'phơi quần áo', 'She hangs out the washing in the garden.'],
        ['read on the beach', 'đọc sách trên bãi biển', 'In the afternoon, she sometimes reads on the beach.'],
        ['go snorkelling', 'đi lặn ngắm san hô', 'At the weekend, she goes snorkelling.'],
        ['campfire', 'lửa trại', 'They sit around a campfire in the evening.'],
        ['take out the bins', 'đem thùng rác ra ngoài', 'My brother often takes out the bins.'],
        ['prepare a meal', 'chuẩn bị bữa ăn', 'My sister prepares a meal for the family.'],
      ],
      ex: [
        gap('Sequencing words and frequency adverbs', 'Complete the sentences with after that, next, then, finally, always or never.', [
          ['First, I get up at 6:30am. ____, I have a shower.', 'After that|Next|Then', 'Từ trình tự nối hai hoạt động liên tiếp.'],
          ['I go to bed at 10pm because I ____ get up early. I am never late for class.', 'always', 'always (100%) — hợp với "never late".'],
          ['My brother is lazy. He ____ washes his clothes.', 'never', 'lazy → never (0%).'],
          ['I study in the library all afternoon. ____, at 10pm, I go to bed.', 'Finally', 'Finally = cuối cùng (hoạt động cuối ngày).'],
        ], { wordBank: ['After that', 'Next', 'Then', 'Finally', 'always', 'never'] }),
        order('Sentences describing a routine', 'Put the words in the correct order to make sentences. Remember the comma after a sequencing word.', [
          ['Every morning, she gets up at half past six.', 'Thời gian đứng đầu câu + dấu phẩy.'],
          ['After that, she usually works on her laptop.', 'usually trước động từ thường.'],
          ['In the evening, she often sits by the campfire with her friends.', 'often + sits.'],
        ]),
        write('Write about your daily routine (Ex. 11)', 'Look again at the paragraph about Dan (Ex. 10). Write a paragraph (70–100 words) about YOUR daily routine: what you do and when. Use at least four frequency adverbs (always, usually, often, sometimes, never) and two sequencing words (After that, Then, Next…). Example: I sometimes do the laundry. I never make dinner. My brother often takes out the bins.', {
          minWords: 70, maxWords: 130, mustUse: 4,
          targetStructures: ['always', 'usually', 'often', 'sometimes', 'never', 'After that', 'Then'],
          checklist: ['Nêu thời gian cho các hoạt động (at 7am, in the evening…)', 'Dùng ≥4 trạng từ tần suất, đặt đúng vị trí', 'Chia đúng hiện tại đơn', 'Có từ chỉ trình tự nối câu'],
          sampleAnswer: 'I usually get up at 6:30am and have breakfast with my family. After that, I always catch the bus to school at 7am. Lessons start at 7:30am and finish at 4:30pm. I often chat to my friends during the break. When I get home, I sometimes help my mum make dinner, but I never wash up because my brother does it. Then, I usually do my homework for two hours. In the evening, I often go online or watch TV. I go to bed at about 11pm.',
          commonErrors: ['Quên -s/-es với he/she/it', 'Đặt trạng từ tần suất sau động từ thường (I go always)', 'Viết "at the morning" thay vì "in the morning"'],
        }),
        write('A day in the life of Julia Grant (Ex. 13)', 'Look at the pictures of Julia Grant, a volunteer on a science project. Write a paragraph (80–120 words) describing a day in Julia\'s life. (1) Begin: "Julia Grant is 21 years old and works as a volunteer on a science project in Fiji. Every morning, she …" (2) Write what she does and when. (3) Use After that… / Next… / Then… (4) Use frequency adverbs.', {
          minWords: 80, maxWords: 140, mustUse: 4,
          targetStructures: ['Every morning, she', 'After that', 'Next', 'Then', 'usually', 'often', 'sometimes'],
          checklist: ['Bắt đầu đúng câu mở đầu đề cho', 'Mô tả ít nhất 6 hoạt động trong tranh theo thứ tự', 'Có giờ cụ thể cho các hoạt động', 'Dùng After that / Next / Then', 'Chia động từ ngôi she: -s/-es'],
          sampleAnswer: 'Julia Grant is 21 years old and works as a volunteer on a science project in Fiji. Every morning, she gets up at 6:30am. After that, she always checks her emails on her laptop. Next, she cooks breakfast with her friend at about 8am. Then, she works outside and washes the equipment for the project. At lunchtime, she usually hangs out the washing. In the afternoon, she sometimes reads a book on the beach. Some days, she goes snorkelling and looks at the turtles. In the evening, she often has dinner in a small restaurant by the sea. Finally, she sits by the campfire with her friends before she goes to bed.',
          commonErrors: ['she go / she have → she goes / she has', 'Quên dấu phẩy sau After that, Next, Then'],
        }, { stimulus: picture('media:m0u01-julia.jpg', 'A day in the life of Julia Grant in Fiji') }),
      ],
    },

    // ── 5. Listening: matching (pp. 15–16) ──
    listening: {
      title: 'Listening: nối thông tin (matching)',
      titleEn: 'Listening: matching — a student exchange trip',
      minutes: 40,
      objectives: [
        'Đọc trước câu hỏi, đoán loại thông tin sẽ nghe',
        'Nghe hiểu hội thoại giữa hai người bạn về chuyến trao đổi học sinh',
        'Nối người với hoạt động — nhận ra từ đồng nghĩa và bẫy (distractor)',
      ],
      images: ['media:m0u01-exchange-web.jpg|Ex. 15 (tr. 15): trang web chương trình trao đổi học sinh'],
      theory: [
        card('Dạng bài Listening: Matching', 'Listening — matching people and activities', {
          formula: [
            '**Trước khi nghe (30 giây)**: đọc danh sách A–H, nghĩ ra từ đồng nghĩa: repairing ≈ fixing; doing art ≈ painting, drawing.',
            '**Trong khi nghe**: thông tin đến **theo thứ tự** người 1 → 5; nghe tên người rồi tập trung vào hoạt động.',
            '**Cẩn thận bẫy**: người nói có thể nhắc một hoạt động rồi **phủ định** nó.',
          ],
          usage: [
            'Đáp án hiếm khi giống hệt từ trong danh sách — nghe **ý nghĩa** (MINI TIP 17.0): Jack "volleyball and basketball" → H playing team sports.',
            'MINI TIP 17.1: anh trai Jack "is a member of our local gym but he **never goes**" → KHÔNG chọn B going to the gym.',
            'MINI TIP 17.4: "fixing" ≈ **repairing** → bố của Jack = E.',
          ],
          examples: [
            ['She spends a lot of time outdoors, planting flowers and cutting the grass.', '→ taking care of the garden (chăm sóc vườn).'],
            ["She's an amazing cook and makes us all wonderful meals.", '→ cooking.'],
          ],
          notes: [
            'Trong bài thi IELTS có nhiều lựa chọn hơn số câu hỏi (8 lựa chọn cho 5 câu) — sẽ có 3 lựa chọn KHÔNG dùng.',
          ],
        }),
      ],
      links: [
        { ref: 'listening:M0-U01-L1', title: 'Carlos & Jack — chuyến trao đổi học sinh (Ex. 16–17)', note: 'Nghe audio gốc của sách: chọn quốc gia của 2 bạn, rồi nối 5 người thân với hoạt động A–H. Có transcript & giải thích.' },
      ],
      vocab: [
        ['student exchange', 'trao đổi học sinh', "I'm coming on the student exchange trip to Australia."],
        ['abroad', 'ở nước ngoài', 'Students can spend a term abroad.'],
        ['term', 'học kỳ', 'A term is less than a year.'],
        ['pocket money', 'tiền tiêu vặt', 'You need to take some pocket money.'],
        ['join in with', 'tham gia cùng', 'Join in with family activities.'],
        ['team sports', 'môn thể thao đồng đội', 'Jack loves playing team sports like volleyball.'],
        ['prefer', 'thích (cái gì) hơn', 'He prefers staying at home and reading.'],
        ['member', 'thành viên', "He's a member of our local gym."],
        ['painting and drawing', 'vẽ tranh màu và vẽ chì', "She's really good at painting and drawing."],
        ['take care of the garden', 'chăm sóc vườn', 'My mum takes care of the garden.'],
        ['plant flowers', 'trồng hoa', 'She spends a lot of time planting flowers.'],
        ['cut the grass', 'cắt cỏ', 'My dad cuts the grass at the weekend.'],
        ['fix / repair', 'sửa chữa', 'If anything gets broken, he fixes it.'],
        ['furniture', 'đồ nội thất', 'He makes new things, like furniture.'],
        ['recipe book', 'sách dạy nấu ăn', 'A recipe book is a good present for her.'],
      ],
      ex: [
        mcq('Before you listen: true or false? (Ex. 15)', 'Read the information on the website about a student exchange programme. Are the sentences true or false?', [
          ['All students spend at least a year abroad.', ['True', 'False'], 'B', 'Trang web: "Spend a **term or** a whole year" → có thể chỉ 1 học kỳ (ít hơn 1 năm) — MINI TIP 15.1.'],
          ['Host families give students pocket money during their stay.', ['True', 'False'], 'B', '"You need to pay for flights and **take some pocket money**" → học sinh tự mang tiền, gia đình không cho — MINI TIP 15.2.'],
          ['Students should do housework and be involved with family activities.', ['True', 'False'], 'A', '"help with jobs around the house and **join in with** family activities" — join in with = tham gia (MINI TIP 15.3).'],
        ], { stimulus: { kind: 'passage', imageUrl: 'media:m0u01-exchange-web.jpg', caption: 'Spend a term or a whole year in another country', text: 'Stay with a host family and go to a local college. Learn all about the culture, and maybe learn a new language. Make new friends and have a great time. You need to pay for flights and take some pocket money, but that\'s all. Host families are not paid. All they ask is that you help with jobs around the house and join in with family activities.\n\nGo to student_exchange.com and explore our website to learn more!' } }),
        mcq('Words with a similar meaning', 'The speakers use different words from the list A–H. Choose the activity that has the same meaning as what the speaker says.', [
          ['"He\'s really good at building and **fixing things**."', ['repairing things', 'shopping', 'going to the gym'], 'A', 'fix = repair (sửa chữa).'],
          ['"She\'s really good at **painting and drawing**."', ['reading books', 'doing art', 'cooking'], 'B', 'painting and drawing = doing art.'],
          ['"She spends a lot of time outdoors, **planting flowers and cutting the grass**."', ['taking care of the garden', 'playing team sports', 'shopping'], 'A', 'trồng hoa, cắt cỏ = chăm sóc vườn.'],
          ['"I love playing **volleyball and basketball**."', ['going to the gym', 'playing team sports', 'doing art'], 'B', 'bóng chuyền, bóng rổ = thể thao đồng đội.'],
        ]),
      ],
    },

    // ── 6. Speaking: talking about your day (p. 17) ──
    speaking: {
      title: 'Speaking: nói về một ngày của bạn',
      titleEn: 'Speaking: talking about your day',
      minutes: 40,
      objectives: [
        'Ghi chú nhanh bằng từ khoá (không viết cả câu) trong 1–2 phút chuẩn bị',
        'Nói 1–2 phút liên tục về một ngày bình thường, đủ các ý trong đề',
        'Thêm lý do (because) và ví dụ (for example / like) để câu trả lời dài và hay hơn',
      ],
      theory: [
        card('Nói 1–2 phút về một chủ đề (giống IELTS Speaking Part 2)', 'Talking about your day — long turn', {
          formula: [
            '**Đề**: Describe what you usually do on an average day. You should say: what you do · who you do it with · where you do it — and explain what you enjoy most about your day and why.',
            '**1–2 phút chuẩn bị**: ghi 3–4 từ khoá cho mỗi ý (6:30 get up – bus – school 7:30…).',
            '**Khi nói**: đi theo thứ tự trong ngày → mỗi ý thêm 1 chi tiết → kết bằng phần "explain".',
          ],
          usage: [
            'Chỉ ghi **từ hoặc cụm ngắn** — nếu viết cả câu rồi đọc lên, bạn sẽ bị mất điểm.',
            '3 ý đầu là **thông tin thực tế** — không nghĩ ra gì đúng sự thật thì **có thể bịa** (TIP 19).',
            'Đừng trả lời quá ngắn: thêm lý do với **because**, ví dụ với **for example / like**.',
          ],
          examples: [
            ['I usually get up at about 6:30, and the first thing I do is have a quick breakfast with my mum.', 'Mở đầu tự nhiên, có thời gian + người.'],
            ['What I enjoy most about my day is the evening, because I can relax and chat with my friends online.', 'Phần "explain" có lý do.'],
          ],
          notes: [
            'Ex. 20: người nghe chấm bạn theo 6 điều — dễ hiểu? ngập ngừng nhiều không? đúng chủ đề? quá dài/quá ngắn? có thú vị không?',
          ],
        }),
      ],
      vocab: [
        ['average day', 'một ngày bình thường', 'On an average day, I get up at 6:30.'],
        ['the first thing I do', 'việc đầu tiên tôi làm', 'The first thing I do is have a shower.'],
        ['spend time with', 'dành thời gian với', 'I spend time with my family in the evening.'],
        ['what I enjoy most', 'điều tôi thích nhất', 'What I enjoy most is the evening.'],
        ['make notes', 'ghi chú', 'Make notes before you speak.'],
        ['pause', 'ngừng lại', 'Try not to pause too often.'],
        ['hesitate', 'ngập ngừng', "Don't hesitate — keep talking."],
        ['stay on the topic', 'nói đúng chủ đề', 'The speaker stays on the topic of the question.'],
        ['easy to understand', 'dễ hiểu', 'The talk is easy to understand.'],
        ['interesting', 'thú vị', 'Add details to make your talk interesting.'],
      ],
      ex: [
        mcq('Tips for a 1–2 minute talk', 'Choose the CORRECT way to prepare and speak.', [
          ['In the one minute of preparation time, you should…', ['write full sentences and read them out', 'write key words and short phrases for each point', 'not write anything'], 'B', 'Sách nhấn mạnh: chỉ ghi từ/cụm ngắn; đọc câu viết sẵn sẽ mất điểm.'],
          ['If you can\'t remember who you go to school with, you should…', ['stop talking until you remember', 'skip that point', 'invent a reasonable detail and keep talking'], 'C', '3 ý đầu là thông tin thực tế — bạn có thể bịa nếu cần (TIP 19).'],
          ['Which answer is longer and better?', ['I like evening.', 'I like the evening because I can relax and chat to my friends, for example on Messenger.', 'Evening. Good.'], 'B', 'Thêm lý do (because) và ví dụ (for example) — bullet box của sách.'],
          ['According to Ex. 20, which is a BAD sign?', ['The talk is easy to understand.', 'The speaker often pauses and hesitates.', 'The speaker stays on the topic.'], 'B', 'Ngập ngừng, dừng lại nhiều làm giảm độ trôi chảy (fluency).'],
        ]),
        speak('Speaking: an average day (Ex. 19–21)', 'Read the task, spend one minute making notes, then speak for 1–2 minutes. Describe what you usually do on an average day. You should say: what you do · who you do it with · where you do it — and explain what you enjoy most about your day and why.', 2, [
          ['Describe what you usually do on an average day.\nYou should say:\n• what you do\n• who you do it with\n• where you do it\nand explain what you enjoy most about your day and why.',
            'I\'d like to talk about a normal weekday for me. I usually get up at about half past six, and the first thing I do is have a quick breakfast with my mum in the kitchen. After that, I catch the bus to school with my best friend, Lan, because we live on the same street. Lessons start at seven thirty and finish at about four thirty, so I spend most of the day at school with my classmates. In the break, we often chat or play badminton in the yard. When I get home, I sometimes help my mum make dinner, and then I do my homework in my bedroom for about two hours. In the evening, I usually watch TV with my family or go online. What I enjoy most about my day is the evening, because I can finally relax. For example, last night I watched a funny film with my little brother and we laughed a lot. I normally go to bed at around eleven.',
            'Đi theo thứ tự thời gian, mỗi ý có chi tiết (giờ, người, nơi chốn). Phần "explain" có lý do (because) và ví dụ cụ thể (last night…).'],
        ]),
        speak('Speaking: questions about your routine (Ex. 4, 18)', 'Answer each question in 15–25 seconds: a direct answer → a reason → an example.', 1, [
          ['What time does your school, college or job start and finish?', 'My school starts at seven thirty in the morning and finishes at about four thirty. It\'s quite a long day, so I\'m usually tired when I get home, but I like the afternoon lessons because we often do group work.', 'Trả lời thẳng giờ giấc, thêm cảm nhận + lý do.'],
          ['What do young people like to do in the evenings in your country?', 'Most young people in Vietnam like to go online in the evenings. For example, they chat with friends or watch videos on their phones. Some people also go out for milk tea or play football with their friends.', 'Nêu ý chính + ví dụ cụ thể (for example).'],
          ['Would you like to go to another country to study? Why or why not?', 'Yes, I would. I\'d love to study in Australia because I want to improve my English and learn about a new culture. I think living with a host family would be a great experience.', 'Yes/No rõ ràng → lý do (because) → thêm một chi tiết.'],
        ]),
      ],
    },

    // ── 7. Grammar and vocabulary review (pp. 18–19) ──
    review: {
      title: 'Ôn tập Unit 1: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 1',
      minutes: 35,
      objectives: ['Ôn giờ giấc, make/do, động từ thói quen và hiện tại đơn của cả Unit 1'],
      ex: [
        match('Telling the time (G&V Ex. 1)', 'Match the times in numbers with the times in words.', [
          ['05:15', "It's quarter past five."], ['08:20', "It's twenty past eight."], ['06:45', "It's quarter to seven."],
          ['14:30', "It's half past two."], ['20:50', "It's ten to nine."], ['09:10', "It's ten past nine."],
          ['15:35', "It's twenty-five to four."], ['10:05', "It's five past ten."], ['12:00', "It's twelve o'clock."], ['16:55', "It's five to five."],
        ]),
        gap('A morning routine – unscramble the words (G&V Ex. 2)', 'Put the letters in brackets in the correct order to make words.', [
          ['When I get up in the morning, the first thing that I do is ____ (avhe) a shower.', 'have'],
          ['After breakfast, I ____ (bhusr) my teeth. Then I ____ (emte) my friends and we ____ (chact) the bus to the college.', ['brush', 'meet', 'catch']],
          ['At four o\'clock, we ____ (vlaee) the college and ____ (og) home by bus.', ['leave', 'go']],
          ['In the evenings, I usually ____ (cwaht) TV, unless I have a lot of homework. I always ____ (od) my homework in the evenings.', ['watch', 'do']],
          ['At night, I always ____ (og) to bed and ____ (lafl) asleep straight away.', ['go', 'fall']],
        ]),
        cat('MAKE or DO? (G&V Ex. 3)', 'Put each phrase into the MAKE or DO column.', { make: 'MAKE', do: 'DO' }, [
          ['a mess', 'make', 'make a mess = bày bừa'], ['a noise', 'make', 'make a noise = gây ồn'], ['the beds', 'make', 'make the beds = dọn giường'],
          ['dinner', 'make', 'make dinner'], ['lunch', 'make', 'make lunch'],
          ['the cleaning', 'do', 'do the cleaning'], ['some homework', 'do', 'do homework'], ['the laundry', 'do', 'do the laundry'],
          ['the shopping', 'do', 'do the shopping'], ['the housework', 'do', 'do the housework'],
        ]),
        gap('An email from France (G&V Ex. 4)', 'Complete Harry\'s email with the words in the box.', [
          ['My host family are very nice. They ____ in an apartment in an area called Pantin, and they both ____ as journalists.', ['live', 'work']],
          ['They ____ very early in the morning and ____ the house before me.', ['get up', 'leave']],
          ['I ____ breakfast at about 8am and then go to the language school. I usually ____ there, but if I\'m late I ____ the bus.', ['have', 'walk', 'catch']],
          ['Lessons at the school ____ at 4pm and we can go home.', ['finish']],
          ['We ____ after school in a café or ____ in the evenings to the cinema.', ['meet', 'go out']],
        ], { wordBank: ['walk', 'leave', 'have', 'finish', 'get up', 'catch', 'go out', 'work', 'meet', 'live'] }),
        order('Make sentences (G&V Ex. 7)', 'Put the words in the correct order to make sentences.', [
          ['My friend tidies the room.'], ['I play football at the weekend.'], ['I take a sandwich to college for lunch.'],
          ['I wake up at half past six.'], ['My brother checks his phone every five minutes.'], ['I have a shower in the evening.'],
          ['I try to stop studying before 9pm.'], ['I go to the dentist every six months.'],
          ['My father does most of the housework.', 'Sách in các từ "my / the / housework / of / does / father / most" (Answer Key ghi "My mother…") — dùng đúng các từ được cho.'],
          ['I visit my family at the weekends.'],
        ]),
        gap('A new job at the supermarket (G&V Ex. 8)', 'Complete the text with the words in the box. Change the form of the verbs if necessary.', [
          ['I have got a new job! It\'s in a supermarket and I ____ there every Saturday. I ____ at 8am and the shop ____ at 9am.', ['work', 'start', 'opens']],
          ['I ____ the shelves with food products and ____ the shopping baskets by the entrance. I ____ the floors and ____ at the checkout.', ['fill', 'tidy', 'clean', 'work']],
          ['My manager is very nice. She ____ me what to do and never ____.', ['tells', 'shouts']],
          ['We ____ three breaks a day and ____ at 4pm. It\'s hard work because the shop ____ very busy, but I really ____ it.', ['take', 'finish', 'gets', 'enjoy']],
        ], { wordBank: ['shouts', 'work', 'opens', 'work', 'enjoy', 'start', 'fill', 'clean', 'take', 'tidy', 'tells', 'finish', 'gets'] }),
      ],
    },
  },

  // ── Reading.html passage (Ex. 5–6) ──
  passages: [
    {
      ref: 'M0-U01-R1',
      title: 'Mindset 0 · Unit 1 — A Day in the Life',
      content: '<p><em>Three college students from around the world tell us about their daily routine.</em></p>\n\n' + html(READING_TEXT),
      questionGroups: [
        qMcq(1, 'Read the article again and the sentences. Choose the best answer, A, B or C. (Example: Who finishes studying before 1pm? → B Michael)', [
          ['Who works with a member of the family after college?', ['Ava', 'Michael', 'Nina'], 'A', 'Ava: "When I get home, I help my dad on the farm for a few hours." Nina chỉ được mẹ dạy lái xe (không phải làm việc); Michael nấu ăn cho gia đình chứ không làm việc CÙNG ai. → A'],
          ['Who goes out in the car in the evenings?', ['Ava', 'Michael', 'Nina'], 'C', 'Nina: "After that, my mum takes me out for a driving lesson." Ava đi ô tô vào BUỔI SÁNG tới trường. → C'],
          ['Who gets a lift in a car to college most mornings?', ['Ava', 'Michael', 'Nina'], 'A', 'Ava: "My mum teaches at my college, so I usually go with her in the car instead of taking the bus." usually = most mornings. Michael đi xe buýt, Nina đi bộ. → A'],
          ['Who prepares the evening meal for the family?', ['Ava', 'Michael', 'Nina'], 'B', 'Michael: "In the evenings, I cook dinner for my family." Ở nhà Nina, bố nấu bữa tối (my dad makes dinner). → B'],
          ['Who pays to do extra activities in the afternoons?', ['Ava', 'Michael', 'Nina'], 'C', 'Nina: "I go to one of the college clubs. These are **not very expensive**" → có trả tiền (dù rẻ). Michael chơi bóng chuyền bãi biển miễn phí. → C'],
          ['Who finds it difficult to watch TV in the evenings?', ['Ava', 'Michael', 'Nina'], 'A', 'Ava: "I try to watch TV but I\'m usually too tired." Michael xem TV với gia đình bình thường. → A'],
          ['Who lives a long way from the sea?', ['Ava', 'Michael', 'Nina'], 'A', 'Ava: "Most people in Australia live near the coast, but we live on a cattle farm in the **centre of the country**." Nina sống ở bờ biển, Michael đi biển mỗi chiều. → A'],
        ], 'Questions 1–7'),
      ],
    },
  ],

  // ── Listening.html section (Ex. 16–17), track 02 ──
  sections: [
    {
      ref: 'M0-U01-L1',
      title: 'Mindset 0 · Unit 1 — A student exchange trip',
      description: 'Carlos and Jack talk about Carlos\'s student exchange trip and Jack\'s family.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_02.mp3',
      transcript: EXCHANGE_TRANSCRIPT,
      questionGroups: [
        qMcq(1, 'You are going to listen to two friends, Carlos and Jack, talking about a student exchange trip. Listen and decide which countries Carlos and Jack come from.', [
          ['Which country does Jack come from?', ['Australia', 'the USA', 'the UK'], 'A', lx('Jack đến từ nước nào?', 'Ngay câu đầu tiên của Carlos.', "I'm really excited about coming to stay with you at your house on the student exchange trip to Australia", 'Carlos sẽ tới NHÀ Jack trong chuyến trao đổi tới Úc → Jack sống ở Úc → Australia.')],
          ['Which country does Carlos come from?', ['Australia', 'the USA', 'the UK'], 'B', lx('Carlos đến từ nước nào?', 'Cuối bài, khi Carlos nghĩ quà cho bà của Jack.', "a recipe book from where I'm from in the USA", '"where I\'m from in the USA" = quê tôi ở Mỹ → the USA.')],
        ], 'Questions 1–2'),
        qMatch(3, 'Listen again. What activity does each member of Jack\'s family like doing? For questions 3–7, choose the correct letter A–H next to each person. (Example: Jack → H playing team sports)', [
          'A cooking', 'B going to the gym', 'C taking care of the garden', 'D doing art', 'E repairing things', 'F reading books', 'G shopping', 'H playing team sports',
        ], [
          ["Jack's brother", 'F', lx('Anh trai của Jack', 'Sau khi Jack nói về bóng chuyền, bóng rổ.', ["He prefers staying at home and reading", "He's a member of our local gym but he never goes"], 'prefers… reading = thích đọc sách → F. BẪY: có nhắc "gym" nhưng "never goes" → không chọn B (MINI TIP 17.1).')],
          ["Jack's sister", 'D', lx('Chị/em gái của Jack', 'Khi Carlos hỏi "You\'ve got a sister too".', "she's really good at painting and drawing", 'painting and drawing = vẽ → doing art → D.')],
          ["Jack's mum", 'C', lx('Mẹ của Jack', 'Khi Carlos hỏi về bố mẹ.', 'my mum loves growing things. She spends a lot of time outdoors, planting flowers and cutting the grass', 'trồng cây, trồng hoa, cắt cỏ = chăm sóc vườn → C.')],
          ["Jack's dad", 'E', lx('Bố của Jack', 'Ngay sau phần nói về mẹ.', "he's really good at building and fixing things. If anything gets broken around the house, he fixes it", 'fixing = repairing (MINI TIP 17.4) → E. "makes new things, like furniture" chỉ là ý thêm.')],
          ["Jack's grandmother", 'A', lx('Bà của Jack', 'Phần cuối hội thoại.', "she's an amazing cook and makes us all wonderful meals every day", 'amazing cook = nấu ăn giỏi → cooking → A.')],
        ], { title: 'Questions 3–7', optionsTitle: 'Activity', type: 'matching' }),
      ],
    },
  ],
};
