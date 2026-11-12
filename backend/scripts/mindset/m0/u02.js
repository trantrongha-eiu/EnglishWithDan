// Mindset for IELTS Foundation — Unit 2: House and home (Student's Book pp. 20–33)
const { mcq, gap, match, order, cat, fix, write, speak, passage, picture, card, qMcq, qFill, qNote, lx } = require('../dsl');

const GIORGIO_ROOM = `Giorgio: I'm excited about going to university, but I feel nervous about leaving my home, especially my bedroom. I like it a lot. My bed is very comfortable – I've got four big pillows. When I sit on my bed, if I look out of the window I can see the garden. I often do my homework at my desk and, to help me study, I sometimes turn on the lamp so I can see my notes and my course books better. When I want to relax, I usually play games on my phone, which I keep in the drawers next to my bed. I haven't got my own bathroom. I need to go down the hall if I want a shower or bath. However, I have got a sink where I brush my teeth every morning before I go to college. I have two posters: one is above my bed and the other one is next to the TV. What else? I don't like curtains very much, so I don't have them. At the window, I have a blind instead. I think it will be strange at first sleeping somewhere new but I'm sure I'll get used to it and I'll make it feel like home.`;

const AGENCY_CALL = `Andrew: Good afternoon, Prime Location Agency, Andrew Taylor speaking. Can I first check your student status?
Giorgio: Hello, yes, of course. My name's Giorgio Rossi and I will soon be a student at Brickbat University. I'm calling today to discuss where to live when I come to the UK to study at the university.
Andrew: Oh, hello, Giorgio. Thank you for your call, I have some questions for you. I hope that you don't mind. Can you speak English?
Giorgio: Yes, but I apologise if I make any mistakes.
Andrew: Don't worry. So, what do you want to study?
Giorgio: I'm not sure exactly, but something with engineering.
Andrew: First of all, where do you want to live – in a room on campus or in private accommodation?
Giorgio: I'm not sure. Can you give me some advice?
Andrew: Of course! Well, tell me a little about your personality and your preferences. Are you a sociable person?
Giorgio: Oh, yes, I am definitely sociable. I live with my parents at the moment. We have a big family and there are always lots of visitors.
Andrew: OK, that's great. Do you also like to sometimes have a quiet room to study in private?
Giorgio: Well, it depends on how I feel. I sometimes like to be sociable and other times, I prefer to study alone. Can I ask, where exactly the accommodation is?
Andrew: Well, if you live in a room on campus, it is very convenient for your studies, as you actually live in a building in the university. However, it's also noisy. There are hundreds of other students who also live there, and they often make lots of noise, but if you live in private accommodation you have a quiet life in a different part of the city with maybe one or two other students who are your housemates. Although, it often takes a long time to travel to university. What do you think?
Giorgio: It's a difficult decision. I want to make lots of new friends, but I also know that I need to work hard and study.
Andrew: OK, one final question. Meals. Would you prefer to live somewhere which is catered?
Giorgio: I'm not sure. What does catered mean?
Andrew: Catered means that all your food is included in the price of the accommodation. For example, if you decide to live on campus you can usually choose catered accommodation. That means that, for example, every day, you can go to the canteen for your breakfast, lunch or dinner, and it's always free. The other option is self-catered accommodation, where you can either cook at home or you can go out for all of your meals. However, you always have to pay for your food.`;

const GIORGIO_MORNING = `Every weekday morning, my alarm goes off at 8:30am. This gives me enough time to get ready before my lectures start at 10:00am. Then, I get up and go downstairs. I'm often too tired to eat breakfast, so I sometimes go to the fridge and just get some juice. I always talk to my housemates if they are there, in the kitchen. After that, I head back upstairs to get ready. I go to the bathroom, brush my teeth and sometimes tidy my room. When it's time to leave, I pack my bag and go to college. At the end of the day when I get back home, I sometimes help the others with the housework – if we don't do it, all the rooms we share get very messy. When the house is clean again, we usually spend some time in the living room. We sit down together on the sofa and play games online for a while. We're always happy when we get the chance to do this, as it helps us relax. Before I go to sleep, I sit at my desk and do my homework. I never forget to do it. At the weekend, I can finally relax. I have a lie in until about 11:30am.`;

module.exports = {
  n: 2,
  title: 'House and home',
  titleVi: 'Nhà cửa',
  pages: '20–33',
  outcomes: [
    'Gọi tên các phòng, khu vực và đồ vật trong nhà',
    'Dùng động từ "be", hiện tại đơn ở dạng khẳng định, phủ định, câu hỏi',
    'Dùng trạng từ tần suất đúng vị trí',
    'Nghe mô tả để chọn tranh; trả lời ngắn TWO or THREE words',
    'Nói về việc chọn chỗ ở; viết email trả lời bạn',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: phòng & đồ vật trong nhà',
      titleEn: 'Lead-in · Speaking: items in a home · Speaking and vocabulary',
      minutes: 40,
      objectives: [
        'Gọi tên 4 phòng chính và 7 khu vực trong/quanh nhà (attic, basement, hallway…)',
        'Gọi tên 12 đồ vật trong nhà qua tranh (curtains, blind, sink, pillow…)',
        'Phân biệt các cặp dễ nhầm: curtains/blinds, fridge/freezer, bath/sink',
      ],
      images: [
        'media:m0u02-rooms.jpg|Ex. 1 (tr. 20): 4 phòng trong nhà — b _ _ _ _ _ _, b _ _ _ _ _ _ _, k _ _ _ _ _ _, l _ _ _ _ _ r _ _ _',
        'media:m0u02-places.jpg|Ex. 2 (tr. 20): các khu vực khác trong và quanh nhà',
      ],
      theory: [
        card('Phòng và khu vực trong nhà', 'Rooms and places in a home', {
          usage: [
            '**bedroom** phòng ngủ · **bathroom** phòng tắm · **kitchen** bếp · **living room** phòng khách · **study** phòng làm việc/học',
            '**attic** gác mái (trên cùng, dưới mái) ≠ **basement** tầng hầm (dưới mặt đất)',
            '**hall** sảnh/lối vào ngay sau cửa chính · **hallway** hành lang nối các phòng',
            '**garage** nhà để xe · **garden** vườn',
          ],
          examples: [
            ['I need to go down the hall if I want a shower.', 'Tôi phải đi dọc hành lang nếu muốn tắm.'],
            ['We keep old toys in the attic.', 'Chúng tôi cất đồ chơi cũ trên gác mái.'],
          ],
          notes: ['UK: **flat** = US: **apartment** (căn hộ). **house** = nhà riêng.'],
        }),
        card('Cặp đồ vật dễ nhầm', 'Commonly confused items (Ex. 6)', {
          usage: [
            '**curtains** rèm vải (kéo ngang) ≠ **blind** rèm sáo/cuốn (kéo lên xuống)',
            '**fridge** tủ lạnh (giữ lạnh) ≠ **freezer** tủ đông (làm đá)',
            '**bath** bồn tắm (nằm) ≠ **sink** bồn rửa (rửa tay, đánh răng)',
            '**study** phòng học/làm việc ≠ **living room** phòng khách',
            '**oven/cooker** lò nướng/bếp nấu · **drawers** ngăn kéo · **wardrobe** tủ quần áo · **cupboard** tủ chạn/tủ đồ',
          ],
        }),
      ],
      vocab: [
        ['bedroom', 'phòng ngủ', 'My bedroom is small but comfortable.'],
        ['bathroom', 'phòng tắm', 'The bathroom is next to my bedroom.'],
        ['kitchen', 'nhà bếp', 'We have breakfast in the kitchen.'],
        ['living room', 'phòng khách', 'We watch TV in the living room.'],
        ['study', 'phòng học / làm việc', 'My dad works in the study.'],
        ['attic', 'gác mái', 'There are old boxes in the attic.'],
        ['basement', 'tầng hầm', 'The washing machine is in the basement.'],
        ['hall', 'sảnh lối vào', 'Leave your shoes in the hall.'],
        ['hallway', 'hành lang', 'The bathroom is down the hallway.'],
        ['garage', 'nhà để xe', 'My dad keeps his car in the garage.'],
        ['garden', 'khu vườn', 'I can see the garden from my window.'],
        ['flat / apartment', 'căn hộ', 'We live in a flat in the city centre.'],
        ['curtains', 'rèm cửa (vải)', 'I close the curtains at night.'],
        ['blind', 'rèm sáo / rèm cuốn', 'I have a blind instead of curtains.'],
        ['table lamp', 'đèn bàn', 'I turn on the table lamp to study.'],
        ['drawers', 'ngăn kéo / tủ ngăn kéo', 'I keep my phone in the drawers.'],
        ['shower', 'vòi sen', 'I have a shower every morning.'],
        ['sink', 'bồn rửa', 'I brush my teeth at the sink.'],
        ['pillow', 'cái gối', 'My bed has four big pillows.'],
        ['oven / cooker', 'lò nướng / bếp', 'Turn on the oven to cook the chicken.'],
        ['fridge', 'tủ lạnh', 'Put the milk in the fridge.'],
        ['freezer', 'tủ đông', 'The ice cream is in the freezer.'],
        ["wardrobe","tủ quần áo","Most of my clothes are in my wardrobe."],
      ],
      ex: [
        gap('Rooms in a house (Ex. 1)', 'Look at the pictures of four rooms and write the name of each room. The first letter is given – type the whole word.', [
          ['Picture 1: b _ _ _ _ _ _ → ____', 'bedroom|edroom', 'bedroom — phòng ngủ.'],
          ['Picture 2: b _ _ _ _ _ _ _ → ____', 'bathroom|athroom', 'bathroom — phòng tắm.'],
          ['Picture 3: k _ _ _ _ _ _ → ____', 'kitchen|itchen', 'kitchen — nhà bếp.'],
          ['Picture 4: l _ _ _ _ _  r _ _ _ → ____ ____', ['living|iving', 'room|oom'], 'living room — phòng khách.'],
        ], { stimulus: picture('media:m0u02-rooms.jpg', 'Ex. 1 — What rooms are they?') }),
        match('Places in and around a house (Ex. 2)', 'Match pictures 1–7 with the places: garden, hall, hallway, basement, attic, garage, study.', [
          ['Picture 1', 'basement', 'Tầng hầm — dưới mặt đất, có cầu thang đi xuống.'],
          ['Picture 2', 'hall', 'Sảnh — khoảng trống ngay khi bước vào cửa.'],
          ['Picture 3', 'hallway', 'Hành lang — có cầu thang và lối đi giữa các phòng.'],
          ['Picture 4', 'study', 'Phòng học/làm việc — có bàn và kệ sách.'],
          ['Picture 5', 'attic', 'Gác mái — phòng dưới mái nhà.'],
          ['Picture 6', 'garage', 'Nhà để xe.'],
          ['Picture 7', 'garden', 'Vườn.'],
        ], { stimulus: picture('media:m0u02-places.jpg', 'Ex. 2') }),
        match('Things in a house – Student A (Ex. 3–4)', 'Look at the six pictures and match each picture with the name of the item.', [
          ['Picture 1', 'curtains'], ['Picture 2', 'table lamp'], ['Picture 3', 'TV'],
          ['Picture 4', 'desk'], ['Picture 5', 'shower'], ['Picture 6', 'drawers'],
        ], { stimulus: picture('media:m0u02-items-a.jpg', 'Student A pictures') }),
        match('Things in a house – Student B (Ex. 3–4)', 'Look at the six pictures and match each picture with the name of the item.', [
          ['Picture 1', 'window'], ['Picture 2', 'poster'], ['Picture 3', 'blind'],
          ['Picture 4', 'sink'], ['Picture 5', 'pillows'], ['Picture 6', 'oven / cooker'],
        ], { stimulus: picture('media:m0u02-items-b.jpg', 'Student B pictures') }),
        mcq('Pairs of words (Ex. 6)', 'Choose the correct word for each sentence.', [
          ['I keep the ice cream in the ____ — it needs to stay frozen.', ['fridge', 'freezer'], 'B', 'freezer làm đông (âm độ); fridge chỉ giữ lạnh.'],
          ['I pull the ____ down at night. It has lots of thin pieces of plastic.', ['curtains', 'blind'], 'B', 'blind là rèm sáo/cuốn kéo lên xuống; curtains là rèm vải kéo ngang.'],
          ['I wash my hands and brush my teeth at the ____.', ['bath', 'sink'], 'B', 'sink = bồn rửa; bath = bồn tắm để nằm.'],
          ['My parents have a ____ with a big desk and lots of books where they work.', ['study', 'living room'], 'A', 'study = phòng làm việc/học.'],
          ['In the UK, people say "flat". In the USA, people say "____".', ['apartment', 'house'], 'A', 'flat (Anh) = apartment (Mỹ).'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: ghi chú & xây dựng hội thoại',
      titleEn: 'Reading: note taking · dialogue building and matching',
      minutes: 45,
      objectives: [
        'Ghi chú thông tin (tên, công ty, địa chỉ, email) từ quảng cáo + email',
        'So sánh hai nguồn để phát hiện thông tin bị sửa (TIP 09)',
        'Chọn câu hỏi đúng ngữ pháp để hoàn thành hội thoại',
        'Ghép câu trả lời hợp lý vào hội thoại (có câu thừa)',
      ],
      theory: [
        card('Dạng bài: ghi chú (note taking)', 'Note completion from two texts', {
          formula: [
            '**Bước 1**: đọc đề ghi chú, đoán loại thông tin: tên người? tên công ty? địa điểm? email?',
            '**Bước 2**: tìm trong quảng cáo trước, rồi **đối chiếu với email** — email có thể sửa lại thông tin.',
            '**Bước 3**: chép **đúng chính tả** (tên riêng, email) — sai một chữ là mất điểm.',
          ],
          usage: [
            'TIP 09: thông tin trong email và quảng cáo có thể **khác nhau** — Gavin nói email phải là **.co.uk**, không phải .com.',
            'Đọc kỹ các từ chỉ thời gian: "only works in the office from Monday to Saturday, but you can contact him **any time** you want **by email**" → Chủ nhật: liên hệ bằng email.',
          ],
        }),
        card('Câu hỏi đúng trật tự từ', 'Question word order', {
          formula: ['**(Wh-) + do/does + S + V?** → Where **do you want** to live?', '**Be + S + …?** → **Are you** a sociable person?', '**Can + S + V?** → **Can you give** me some advice?'],
          notes: ['Sai hay gặp: "Where you want to live?" (thiếu do), "What is catered mean?" (đúng: What **does** catered mean?).'],
        }),
      ],
      links: [
        { ref: 'reading:M0-U02-R1', title: 'Prime Location Agency — quảng cáo & email (Ex. 9)', note: 'Hoàn thành 5 ô ghi chú của Giorgio. Nhớ đối chiếu email của Gavin với quảng cáo!' },
      ],
      vocab: [
        ['accommodation', 'chỗ ở', 'He needs to organise his accommodation.'],
        ['agency', 'công ty môi giới / đại lý', 'Prime Location Agency finds rooms for students.'],
        ['agent', 'người môi giới', 'Mr Taylor is the best agent in the UK.'],
        ['advert', 'quảng cáo', 'The advert has a mistake.'],
        ['be based in', 'có trụ sở ở', 'We are based in our office in London.'],
        ['location', 'địa điểm', 'We have flats in locations all over the country.'],
        ['contact', 'liên hệ', 'You can contact him by email.'],
        ['on campus', 'trong khuôn viên trường', 'Do you want a room on campus?'],
        ['private accommodation', 'nhà ở tư nhân (ngoài trường)', 'I live in private accommodation.'],
        ['sociable', 'thích giao du, hoà đồng', 'I am definitely sociable.'],
        ['preference', 'sở thích, điều ưa thích hơn', 'Tell me about your preferences.'],
        ['housemate', 'bạn ở chung nhà', 'I live with two housemates.'],
        ['roommate', 'bạn cùng phòng', 'I like the idea of having a roommate.'],
        ['broadband', 'mạng internet tốc độ cao', 'The house has superfast broadband.'],
        ['connection', 'kết nối (mạng)', 'Is the Wi-Fi connection better on campus?'],
        ['catered', 'có bao ăn', 'Would you prefer catered accommodation?'],
        ['advice', 'lời khuyên', 'Can you give me some advice?'],
      ],
      ex: [
        mcq('Building a conversation (Ex. 14)', 'Read the sentences from the phone call between Giorgio and Andrew Taylor. Choose the best sentence, A, B or C, for each gap.', [
          ['Andrew: Good afternoon, Prime Location Agency, Andrew Taylor speaking. ____', ['Can I check your student status?', 'Can I give you my student status?', 'Have you got time to speak? Can you check my student status?'], 'A', 'Andrew (người môi giới) muốn kiểm tra tư cách sinh viên của khách → "Can I check…?"'],
          ['Andrew: Thank you for your call, I have some questions for you. ____', ['I hope that you don\'t mind.', 'I hope that you mind.', 'Do you mind?'], 'A', 'Lịch sự: "I hope you don\'t mind" = mong bạn không phiền.'],
          ['Andrew: First of all, ____ – in a room on campus or in private accommodation?', ['Where you want to live?', 'Where you do want to live?', 'Where do you want to live?'], 'C', 'Wh- + do + you + V.'],
          ['Giorgio: I\'m not sure. ____', ['You can give me some advice?', 'Can you give me some advice?', 'Can give me you some advice?'], 'B', 'Can + S + V?'],
          ['Andrew: Tell me a little about your personality. ____', ['Are you a sociable person?', 'You are a sociable person?', 'Do you be a sociable person?'], 'A', 'Câu hỏi với be: đảo "are" lên trước chủ ngữ.'],
          ['Andrew: OK, that\'s great. ____ sometimes have a quiet room where you can study in private?', ['Do you also like to', 'You also like to', 'Do you also like'], 'A', '"like to + V" và cần trợ động từ do.'],
          ['Andrew: …it takes a long time to travel to university. ____', ['What you think?', 'What you do think?', 'What do you think?'], 'C', 'What + do + you + think?'],
          ['Giorgio: I\'m not sure. ____', ['What is catered mean?', 'What does catered mean?', 'What means catered?'], 'B', 'What does + từ + mean? = từ … nghĩa là gì?'],
        ]),
        match('Complete the conversation (Ex. 16)', 'Read the end of the conversation. Match each of Andrew\'s answers with what Giorgio says JUST BEFORE it.', [
          ['Andrew: "I think the house has superfast broadband. The Wi-Fi is sometimes very busy and slow on campus."', 'Yes. Is the Wi-Fi connection better on campus or in the private house?', 'Andrew trả lời về Wi-Fi → Giorgio vừa hỏi về Wi-Fi (D).'],
          ['Andrew: "You also have a TV in the private room, so you can connect your computer and play games on the TV."', 'Oh, that\'s good to know. I really like playing online games, you see.', 'Andrew nói thêm về chơi game trên TV → Giorgio vừa nói thích chơi game online (G).'],
          ['Andrew: "No, but you or your roommate can bring one."', 'Oh, great. Do the rooms on campus also have TVs?', '"No… can bring one" = trả lời câu hỏi Yes/No về TV (A).'],
          ['Andrew: "Yes, it\'s good because you can study together."', 'Really? I like the idea of having a roommate.', 'Học cùng nhau → nói về bạn cùng phòng (B).'],
          ['Andrew: "Would you like to discuss everything with your parents?"', 'Yes, but I prefer to study alone. Oh, I don\'t know what to choose.', 'Giorgio phân vân → Andrew gợi ý hỏi bố mẹ (E).'],
          ['Andrew: "OK. Let me email you some information."', 'Yes, that\'s a good idea. They always give me good advice.', 'Giorgio đồng ý hỏi bố mẹ → Andrew gửi thông tin (F).'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: be / hiện tại đơn (+ − ?) & trạng từ tần suất',
      titleEn: 'Grammar: simple present positive, negative and questions · adverbs of frequency',
      minutes: 40,
      objectives: [
        'Viết câu khẳng định, phủ định, câu hỏi với be, động từ thường và can',
        'Đặt câu hỏi với từ để hỏi (Where/What/Why)',
        'Đặt trạng từ tần suất: SAU be, TRƯỚC động từ thường',
      ],
      keyLanguage: [
        'be: I am a student. / I am not a student. / Are you a student? — Where is the accommodation?',
        'Động từ thường: I live… / I don\'t live… / He doesn\'t live… / Do you live…? / Does he live…? — What do you want to study?',
        'can: I can speak English. / I can\'t speak… / Can he speak English?',
        'Trạng từ tần suất: SAU "be" (I am often too tired…) · TRƯỚC động từ thường (We usually spend time…)',
      ],
      links: [
        { grammar: 'present-simple', title: 'Present Simple', note: 'khẳng định, phủ định (don\'t/doesn\'t), câu hỏi (Do/Does…?)' },
        { grammar: 'sb-subject-be', title: 'Câu S + be + Adj/N', note: 'dùng "be" để mô tả: The bed is comfortable.' },
        { grammar: 'modal-verbs', title: 'Modal verbs (can)', note: 'can / can\'t + V nguyên mẫu' },
      ],
      ex: [
        gap('Complete the grammar table (Ex. 11)', 'Complete the positive (+), negative (−) and question (?) forms.', [
          ['(−) I ____ a student.', 'am not|\'m not', 'Phủ định của be: am not.'],
          ['(+) I ____ with my parents.', 'live', 'I + V nguyên mẫu.'],
          ['(−) He ____ ____ with his parents.', ['doesn\'t|does not', 'live'], 'He/She + doesn\'t + V nguyên mẫu.'],
          ['(?) ____ he live with his parents?', 'Does', 'Câu hỏi ngôi thứ ba: Does + he + V?'],
          ['(+) I ____ speak English very well.', 'can', 'can + V.'],
          ['(?) ____ I ____ English?', ['Can', 'speak'], 'Can + S + V?'],
          ['(?) What do you ____ to study?', 'want', 'What + do + you + V?'],
          ['(?) Why ____ he want to live in the UK?', 'does', 'Why + does + he + V?'],
        ]),
        gap('The car / I play games (Ex. 12)', 'Rewrite each sentence in the form in brackets: (+) positive, (−) negative, (?) question.', [
          ['The car ____ in the garage. (−)', 'isn\'t|is not', 'be phủ định.'],
          ['____ ____ ____ in the garage? (?)', ['Is', 'the', 'car'], 'Đảo is lên đầu.'],
          ['Where ____ the car? (?)', 'is', 'Where + is + S?'],
          ['I ____ ____ games on my phone in my bedroom. (−)', ['don\'t|do not', 'play'], 'I don\'t + V.'],
          ['____ you ____ games on your phone in your bedroom? (?)', ['Do', 'play'], 'Do you + V?'],
          ['What games ____ you ____ on your phone? (?)', ['do', 'play'], 'What + do + you + V?'],
          ['Can ____ ____ a game on my phone later? (?)', ['I', 'play'], 'Can I + V?'],
        ]),
        mcq('Giorgio\'s morning (Ex. 18)', 'Read Giorgio\'s description of his day and choose the correct answer, A, B or C.', [
          ['Every weekday morning, my alarm goes ____ at 8:30am.', ['up', 'on', 'off'], 'C', 'alarm goes off = chuông báo thức reo.'],
          ['Then, I ____ up and go downstairs.', ['get', 'go', 'put'], 'A', 'get up = thức dậy.'],
          ['I sometimes go to the ____ and just get some juice.', ['fridge', 'sink', 'freezer'], 'A', 'Nước ép để trong tủ lạnh (fridge).'],
          ['I always talk to my housemates if they are there, in the ____.', ['basement', 'kitchen', 'bathroom'], 'B', 'Đang lấy nước ép → ở bếp.'],
          ['I go to the bathroom, ____ my teeth…', ['wash', 'tidy', 'brush'], 'C', 'brush teeth = đánh răng.'],
          ['…and sometimes ____ my room.', ['wash', 'tidy', 'brush'], 'B', 'tidy my room = dọn phòng.'],
          ['I sometimes help the others with the ____ – if we don\'t do it, all the rooms get very messy.', ['homework', 'housework', 'workhouse'], 'B', 'housework = việc nhà (khác homework = bài tập về nhà).'],
          ['We sit down together on the ____ and play games online.', ['chair', 'desk', 'sofa'], 'C', '"sit down together" trong phòng khách → sofa.'],
          ['Before I go to sleep, I sit at my ____ and do my homework.', ['desk', 'bed', 'drawers'], 'A', 'Ngồi vào bàn học (desk).'],
          ['At the weekend, I have a lie ____ until about 11:30am.', ['on', 'up', 'in'], 'C', 'have a lie in = ngủ nướng.'],
        ], { stimulus: passage(GIORGIO_MORNING.replace('goes off', 'goes (1) ____').replace('I get up', 'I (2) ____ up').replace('to the fridge', 'to the (3) ____').replace('in the kitchen', 'in the (4) ____').replace('brush my teeth', '(5) ____ my teeth').replace('tidy my room', '(6) ____ my room').replace('with the housework', 'with the (7) ____').replace('on the sofa', 'on the (8) ____').replace('at my desk', 'at my (9) ____').replace('a lie in', 'a lie (10) ____'), { caption: 'Ex. 18 — Giorgio\'s day (đã che các từ cần điền)' }) }),
        mcq('Rules for adverb position (Ex. 19–21)', 'Choose the correct answer.', [
          ['With the verb "to be", the frequency adverb goes ____ the verb.', ['before', 'after'], 'B', 'I am often too tired… → sau "am".'],
          ['With other verbs, the frequency adverb goes ____ the verb.', ['before', 'after'], 'A', 'We usually spend time… → trước "spend".'],
          ['Which sentence is correct?', ['I am never late for school.', 'I never am late for school.', 'I am late never for school.'], 'A', 'never đứng sau am.'],
          ['Which sentence is correct?', ['I forget never to do my homework.', 'I never forget to do my homework.', 'Never I forget to do my homework.'], 'B', 'never đứng trước forget.'],
        ]),
        fix('Correct the adverb position (G&V Ex. 7)', 'Some sentences have the adverb or the words in the wrong place. Write the correct sentence (if the sentence is already correct, copy it).', [
          ['In my country, people live usually in apartments and not houses.', 'In my country, people usually live in apartments and not houses.', 'usually đứng trước động từ thường live.'],
          ['My uncle keeps his car always in the garage because it is very expensive.', 'My uncle always keeps his car in the garage because it is very expensive.', 'always trước keeps.'],
          ['Our sink sometimes makes a very strange noise.', 'Our sink sometimes makes a very strange noise.', 'Câu đúng.'],
          ['I have a housemate but I don\'t see very often him – he is always studying.', 'I have a housemate but I don\'t see him very often – he is always studying.', 'very often đứng cuối câu, sau tân ngữ him (hoặc: I don\'t very often see him).'],
          ['In your country, do people usually celebrate their 18th birthday with a party?', 'In your country, do people usually celebrate their 18th birthday with a party?', 'Câu đúng: usually đứng sau chủ ngữ, trước động từ celebrate.'],
          ['Do you prefer to do your homework in your bedroom?', 'Do you prefer to do your homework in your bedroom?', 'Câu đúng.'],
        ]),
        fix('Make questions (G&V Ex. 6)', 'Rewrite each sentence as a Yes/No question.', [
          ['It is okay to come to your house this evening.', 'Is it okay to come to your house this evening?', 'be → đảo Is lên đầu.'],
          ['You can check that the windows are all closed before we go out.', 'Can you check that the windows are all closed before we go out?', 'can → đảo Can lên đầu.'],
          ['You are in the living room next to the kitchen.', 'Are you in the living room next to the kitchen?', 'are → Are you…?'],
          ['You want to sit in the garden.', 'Do you want to sit in the garden?', 'Động từ thường → thêm Do.'],
          ['You help your parents with the housework.', 'Do you help your parents with the housework?', 'Do + you + V? (câu ví dụ của sách)'],
          ['The apartments in the UK are very different from the apartments in your country.', 'Are the apartments in the UK very different from the apartments in your country?', 'are → đảo Are lên trước chủ ngữ số nhiều.'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: email trả lời bạn về chỗ ở',
      titleEn: 'Writing: an email to a friend about accommodation',
      minutes: 45,
      objectives: [
        'Xác định mục đích của một email (Ex. 26)',
        'Viết hoa và dùng dấu câu đúng (Ex. 27)',
        'Viết email 60–80 từ trả lời đủ câu hỏi của bạn và hỏi lại 2 câu (Ex. 28)',
      ],
      theory: [
        card('Bố cục email thân mật', 'An informal email', {
          formula: [
            '**Chào**: Hi Giorgio, / Hello Gavin,',
            '**Trả lời câu hỏi của bạn** (mỗi câu hỏi 1–2 câu): I live on campus. I\'m very happy with…',
            '**Hỏi lại**: Do you…? / Is your…?',
            '**Kết**: Write soon, / See you soon, + tên',
          ],
          usage: [
            '**Viết hoa**: chữ đầu câu, tên riêng (Gavin, London), đại từ **I**, tên ngày/tháng.',
            '**Dấu chấm (.)** cuối câu kể; **dấu hỏi (?)** cuối câu hỏi; **dấu phẩy (,)** sau lời chào: Hi Gavin,',
            'Câu ngắn, rõ ràng. Nối ý bằng **and, but, because, so**.',
          ],
          examples: [
            ['hi gavin i live in private accommodation', 'Hi Gavin, I live in private accommodation.'],
            ['do you have wi-fi in your room', 'Do you have Wi-Fi in your room?'],
          ],
          notes: ['Đề 60–80 từ: viết quá ngắn sẽ thiếu ý, quá dài dễ lạc đề. Phải trả lời **tất cả** câu hỏi trong email nhận được.'],
        }),
      ],
      vocab: [
        ['reply', 'trả lời (thư)', 'Reply to Giorgio and answer his questions.'],
        ['punctuation', 'dấu câu', 'He does not use correct punctuation.'],
        ['capital letter', 'chữ in hoa', 'Start every sentence with a capital letter.'],
        ['full stop', 'dấu chấm', 'Put a full stop at the end of the sentence.'],
        ['question mark', 'dấu chấm hỏi', 'Questions end with a question mark.'],
        ['comfortable', 'thoải mái, êm', 'My bed is very comfortable.'],
        ['I\'m happy with', 'tôi hài lòng với', "I'm very happy with my room."],
        ['Write soon', 'Viết thư sớm nhé (câu kết)', 'Write soon, Gavin'],
        ['choice', 'sự lựa chọn', 'Are you happy with your choice?'],
        ['online games', 'trò chơi trực tuyến', 'I can also play online games.'],
      ],
      ex: [
        mcq('The purpose of the email (Ex. 26)', 'Read Gavin\'s email to Giorgio. What is the main reason Gavin is writing?', [
          ['The main reason for writing is…', ['to say thank you to Giorgio.', 'to ask Giorgio for advice.', 'to tell Giorgio that he likes university.'], 'C', 'Bài mẫu của sách chọn C: Gavin kể mình thích phòng ở trường và hỏi chuyện Giorgio. Không có lời cảm ơn hay xin lời khuyên.'],
        ], { stimulus: passage('Hi Giorgio,\n\nSo, we\'re both university students now! I like my room on campus very much. Are you on campus or in private accommodation? Are you happy with your choice of where you\'re living? Please tell me about your room. What other things do you like about where you live?\n\nWrite soon,\nGavin', { caption: 'Email from Gavin' }) }),
        mcq('Capital letters and punctuation (Ex. 27)', 'Giorgio\'s email has no capital letters or punctuation. For each part, choose the CORRECT version.', [
          ['hi gavin', ['Hi Gavin,', 'hi Gavin', 'Hi gavin.'], 'A', 'Viết hoa chữ đầu và tên riêng; dấu phẩy sau lời chào.'],
          ['i live in private accommodation i am very happy with my room', ['I live in private accommodation, i am very happy with my room.', 'I live in private accommodation. I am very happy with my room.', 'i live in private accommodation. I am very happy with my room'], 'B', 'Đại từ I luôn viết hoa; hai ý → hai câu, mỗi câu kết bằng dấu chấm.'],
          ['the Wi-Fi here is very fast i am happy about that', ['The Wi-Fi here is very fast. I am happy about that.', 'The Wi-Fi here is very fast I am happy about that.', 'the Wi-Fi here is very fast. i am happy about that.'], 'A', 'Câu mới bắt đầu bằng chữ in hoa; có dấu chấm giữa hai câu.'],
          ['do you have Wi-Fi in your room is the food nice where you live', ['Do you have Wi-Fi in your room. Is the food nice where you live.', 'Do you have Wi-Fi in your room? Is the food nice where you live?', 'Do you have Wi-Fi in your room, is the food nice where you live?'], 'B', 'Hai câu hỏi → hai dấu chấm hỏi.'],
          ['write soon giorgio', ['write soon, giorgio', 'Write soon. Giorgio.', 'Write soon,\nGiorgio'], 'C', 'Câu kết viết hoa, dấu phẩy, tên ở dòng dưới và viết hoa.'],
        ]),
        write('Write a reply to Giorgio (Ex. 28)', 'Imagine you are Gavin. Write a reply to Giorgio (60–80 words): answer his two questions ("Do you have Wi-Fi in your room?" and "Is the food nice where you live?"), then ask Giorgio two questions about his accommodation. Remember to use capital letters and correct punctuation.', {
          minWords: 60, maxWords: 95, mustUse: 2,
          targetStructures: ['Hi Giorgio', 'Do you', 'Is your', 'Write soon'],
          checklist: ['Mở đầu "Hi Giorgio," và kết "Write soon, Gavin"', 'Trả lời câu hỏi về Wi-Fi', 'Trả lời câu hỏi về đồ ăn', 'Hỏi lại Giorgio 2 câu về chỗ ở', 'Viết hoa, dấu chấm và dấu hỏi đúng', '60–80 từ'],
          sampleAnswer: 'Hi Giorgio,\n\nThanks for your email. Yes, I have Wi-Fi in my room, but it is sometimes slow in the evening because lots of students use it. The food here is quite nice. I live in catered accommodation, so I eat breakfast and dinner in the canteen every day. My favourite meal is the pasta on Fridays!\n\nHow many people live in your house? Do you cook your own meals?\n\nWrite soon,\nGavin',
          commonErrors: ['Không trả lời đủ 2 câu hỏi của Giorgio', 'Quên dấu chấm hỏi ở câu hỏi', 'Viết thường "i"'],
        }),
      ],
    },

    listening: {
      title: 'Listening: mô tả tranh & trả lời ngắn',
      titleEn: 'Listening 1: picture description · Listening 2: short answers',
      minutes: 45,
      objectives: [
        'Nghe hết thông tin rồi mới chọn tranh (TIP 07)',
        'Trả lời ngắn đúng giới hạn TWO or THREE words',
        'Nghe để biết người nói CÓ hay KHÔNG nhắc tới một chủ đề (YES/NO)',
      ],
      images: ['media:m0u02-bedrooms.jpg|Ex. 7 (tr. 22): Tranh nào là phòng ngủ của Giorgio?'],
      theory: [
        card('Chọn tranh đúng khi nghe mô tả', 'Picture description', {
          formula: [
            '**Trước khi nghe**: so sánh các tranh — chúng **khác nhau ở đâu**? (rèm vải hay rèm sáo? cửa sổ nhìn ra vườn hay thành phố?)',
            '**Khi nghe**: đánh dấu chi tiết khớp/không khớp cho TỪNG tranh.',
            '**TIP 07**: nghe **hết** thông tin rồi mới chọn — chi tiết quyết định thường ở cuối ("I don\'t like curtains… I have a blind instead").',
          ],
        }),
        card('Trả lời ngắn có giới hạn số từ', 'Short answers — TWO or THREE words', {
          usage: [
            'Đề nói "TWO or THREE words" → viết **2 hoặc 3 từ**, không hơn không kém.',
            'Dùng chính từ trong bài nghe: How does Giorgio describe his bed? → **very comfortable**.',
            'Câu "Why…?" → trả lời bằng **to + V**: Why does he play games on his phone? → **to relax**.',
          ],
          notes: ['Bài YES/NO (Listening 2): đề hỏi người nói **có bàn đến** chủ đề đó không. MINI TIP 13.1: Giorgio có nhắc **tên khoá học** cụ thể không? ("something with engineering" → có nói về khoá học → YES).'],
        }),
      ],
      links: [
        { ref: 'listening:M0-U02-L1', title: 'Phòng ngủ của Giorgio (Ex. 7–8)', note: 'Chọn tranh đúng (câu 1), rồi trả lời 6 câu hỏi ngắn TWO or THREE words.' },
        { ref: 'listening:M0-U02-L2', title: 'Giorgio gọi cho công ty nhà ở (Ex. 13)', note: 'Nghe cuộc gọi: chủ đề nào CÓ được bàn đến (YES/NO)?' },
      ],
      vocab: [
        ['nervous', 'lo lắng, hồi hộp', 'I feel nervous about leaving my home.'],
        ['look out of the window', 'nhìn ra ngoài cửa sổ', 'If I look out of the window, I can see the garden.'],
        ['turn on the lamp', 'bật đèn', 'I turn on the lamp to see my notes.'],
        ['course book', 'sách giáo trình', 'I can see my course books better.'],
        ['go down the hall', 'đi dọc hành lang', 'I need to go down the hall to have a shower.'],
        ['get used to', 'quen với', "I'm sure I'll get used to it."],
        ['apologise', 'xin lỗi', 'I apologise if I make any mistakes.'],
        ['engineering', 'ngành kỹ thuật', 'I want to study something with engineering.'],
        ['convenient', 'tiện lợi', 'A room on campus is very convenient.'],
        ['noisy', 'ồn ào', "It's also noisy on campus."],
        ['canteen', 'nhà ăn, căng tin', 'You can go to the canteen for lunch.'],
        ['self-catered', 'tự nấu ăn (không bao ăn)', 'In self-catered accommodation, you cook at home.'],
        ['depend on', 'tuỳ thuộc vào', 'It depends on how I feel.'],
        ['difficult decision', 'quyết định khó khăn', "It's a difficult decision."],
      ],
      ex: [
        cat('Who is speaking? (Ex. 10)', 'Giorgio phones Andrew Taylor. Who is more likely to say each sentence?', { g: 'Giorgio', a: 'Andrew Taylor' }, [
          ['Are you a student?', 'a', 'Người môi giới hỏi để kiểm tra tư cách sinh viên.'],
          ['I am a student.', 'g'],
          ['What do you want to study?', 'a'],
          ['I live with my parents at the moment.', 'g'],
          ['Can you speak English?', 'a'],
          ['Where is the accommodation?', 'g', 'Người thuê hỏi chỗ ở nằm đâu.'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: chọn chỗ ở',
      titleEn: 'Speaking: choosing accommodation',
      minutes: 40,
      objectives: [
        'So sánh hai lựa chọn chỗ ở theo các tiêu chí (Wi-Fi, khoảng cách, phòng tắm, bữa ăn)',
        'Nêu ý kiến & lý do: I think… / I prefer… because…',
        'Nói về một ngày trong tuần và cuối tuần của bạn',
      ],
      theory: [
        card('Nêu lựa chọn và lý do', 'Giving opinions and reasons', {
          formula: ['**I think** campus accommodation is better for Giorgio **because** he is sociable.', '**I prefer** a private room **because** I like to study alone.', '**The advantage** of… is… **The disadvantage** is…'],
          usage: [
            'Luôn kèm **lý do** (because…) — câu trả lời chỉ "Yes"/"No" là quá ngắn.',
            'Dùng **but / however** để nêu mặt trái: It\'s convenient, **but** it\'s noisy.',
            '"It doesn\'t matter to me." = Tôi không quan tâm/không sao cả.',
          ],
        }),
      ],
      vocab: [
        ['I prefer… because', 'tôi thích … hơn vì', 'I prefer private accommodation because it is quiet.'],
        ['in my opinion', 'theo ý kiến tôi', 'In my opinion, fast Wi-Fi is more important.'],
        ['advantage', 'ưu điểm', 'The advantage is that you can make friends.'],
        ['disadvantage', 'nhược điểm', 'The disadvantage is the noise.'],
        ['it doesn\'t matter to me', 'tôi không bận tâm', "Sharing a bathroom doesn't matter to me."],
        ['share a bathroom', 'dùng chung phòng tắm', 'I don\'t want to share a bathroom.'],
        ['provided', 'được cung cấp sẵn', 'Pillows and sheets are provided.'],
        ['ground floor', 'tầng trệt', 'My bedroom is on the ground floor.'],
        ['lecture hall', 'giảng đường', 'It is a five-minute walk to the lecture hall.'],
        ['detached house', 'nhà riêng biệt (không chung tường)', 'It is a detached house with three bedrooms.'],
        ['meals included', 'bao gồm bữa ăn', 'All meals are included in the price.'],
        ['have a lie in', 'ngủ nướng', 'I have a lie in at the weekend.'],
      ],
      ex: [
        cat('Campus or private? (Ex. 24)', 'Which accommodation that Andrew Taylor sent to Giorgio has each feature?', { c: 'Campus accommodation', p: 'Private accommodation' }, [
          ['Five minutes\' walk to the lecture hall', 'c'], ['25-minute bus ride to the lecture hall', 'p'],
          ['Fast Wi-Fi (sometimes slow at busy times)', 'c'], ['Superfast Wi-Fi (always)', 'p'],
          ['Shared bathroom on every floor', 'c'], ['Private bathroom', 'p'],
          ['Live with 159 other students', 'c'], ['Live with two other students and the homeowner', 'p'],
          ['All meals included', 'c'], ['No meals included', 'p'],
          ['Single bed – no pillows or sheets provided', 'c'], ['Double bed – pillows and sheets provided', 'p'],
        ]),
        speak('Speaking: which accommodation would you choose? (Ex. 25)', 'Answer each question in 20–30 seconds. Give your choice + a reason (because) + a detail.', 3, [
          ['In your opinion, what is more important, having superfast Wi-Fi or having a short walk to lectures?', 'For me, a short walk to lectures is more important. I often get up late, so if I live five minutes from the lecture hall, I will never be late. Wi-Fi is useful, but I can always study in the library.', 'Chọn rõ ràng → lý do cá nhân → nhắc lại lựa chọn kia (but…).'],
          ['Are you unhappy about the idea of sharing a bathroom with other students? Or does it not matter to you?', 'To be honest, I don\'t really like it. I prefer a private bathroom because I can take my time in the morning. When I share a bathroom with my brother, we often argue about it!', 'Thêm ví dụ thật từ cuộc sống.'],
          ['What do you think about having all your meals included?', 'I think it\'s a great idea, because I can\'t cook very well and it saves a lot of time. However, the food in a canteen is sometimes boring, so I would also like to cook at the weekend.', 'Nêu cả ưu điểm và nhược điểm (However…).'],
          ['What are the advantages and disadvantages of living with lots of other students?', 'The main advantage is that you can make lots of new friends and you never feel lonely. The disadvantage is that it can be very noisy, especially at night, so it is difficult to study or sleep.', 'Dùng "The main advantage is… The disadvantage is…".'],
        ]),
        speak('Speaking: weekdays and weekends (Ex. 17, 23)', 'Answer each question in 15–25 seconds.', 1, [
          ['On a weekday morning, what time does your alarm go off?', 'My alarm usually goes off at six fifteen, but I always press snooze once! I get up at about six thirty because my school starts at seven fifteen.', 'Dùng đúng cụm "alarm goes off" của bài.'],
          ['Do you like to have a lie in at the weekend?', 'Yes, I love it. On Sundays I usually have a lie in until nine o\'clock because I\'m tired after a long week. Then I have a big breakfast with my family.', 'Yes → lý do → hoạt động tiếp theo.'],
          ['Describe a typical day for you at the weekend.', 'On Saturdays I usually help my mum with the housework in the morning. In the afternoon, I often meet my friends at a café, and in the evening we sometimes watch a film at home.', 'Theo trình tự sáng – chiều – tối + trạng từ tần suất.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 2: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 2',
      minutes: 35,
      objectives: ['Ôn từ vựng nhà cửa, câu hỏi và trật tự từ của Unit 2'],
      ex: [
        gap('Places in a house – definitions (G&V Ex. 1)', 'Read the definitions and write the correct word.', [
          ['This is the place where you usually sleep every night. → ____', 'bedroom'],
          ['This is the place where you have a wash and brush your teeth. → ____', 'bathroom'],
          ['This is the place where people usually sit together to talk, play games or watch TV. → ____ ____', ['living', 'room']],
          ['This is the place where you keep the car. → ____', 'garage'],
          ['This is the place that you walk through to move from one room to another. → ____', 'hallway|hall'],
          ['This is the place where you can be outside and sit on the grass. → ____', 'garden'],
        ]),
        mcq('Choose the correct word (G&V Ex. 2)', 'Choose the word that matches the description.', [
          ['It keeps food cold but not frozen.', ['a fridge', 'a freezer'], 'A'],
          ['A house that shares one wall with the house next to it.', ['a terraced house', 'a semi-detached house'], 'B', 'semi-detached = nhà song lập (chung 1 bức tường); terraced = nhà liền dãy.'],
          ['A piece of furniture with boxes you pull out to keep clothes in.', ['a desk', 'some drawers'], 'B'],
          ['The room where the family sits and watches TV.', ['a living room', 'a study'], 'A'],
          ['The room at the top of the house, under the roof.', ['an attic', 'a basement'], 'A'],
          ['A small piece of furniture with a door, often in the kitchen, for cups and plates.', ['a wardrobe', 'a cupboard'], 'B', 'wardrobe = tủ quần áo.'],
          ['You sit on it alone; it has four legs and a back.', ['a chair', 'a sofa'], 'A'],
        ]),
        match('Questions and answers (G&V Ex. 3)', 'Match each question with the correct answer.', [
          ['What do you like about your room?', 'My comfortable bed and my posters.'],
          ['Who do you live with?', 'My parents, my sister and my grandparents.'],
          ['Do you like to cook?', 'Yes, and I think I\'m quite good at it.'],
          ['Where do you watch television?', 'Usually in the living room and sometimes in my bedroom.'],
          ['Is it often sunny where you live?', 'Yes. I like it because I can spend time in the garden.'],
          ['Where do you do your homework?', 'Usually in the study and sometimes in my bedroom.'],
          ['Can you tell me where the bathroom is, please?', 'Yes. Go down the hall and it is next to the living room.'],
          ['Why don\'t you often go in the kitchen?', 'Because I can\'t cook!'],
        ]),
        gap('Spelling mistakes (G&V Ex. 5)', 'Each sentence has one word spelt wrongly (in brackets). Write the word correctly.', [
          ['I really like my (certains) – they are red and black. → ____', 'curtains'],
          ['I have a bright (tabel lamb) that I use when I do my homework. → ____ ____', ['table', 'lamp']],
          ['I think (potsers) make the walls look more interesting. → ____', 'posters'],
          ['It is good to sleep with two (bilows). → ____', 'pillows'],
          ['The only thing he can do is turn on the (uven)! → ____', 'oven'],
          ['Most of my clothes are in my (walldrobe). → ____', 'wardrobe'],
        ]),
        order('Make sentences (G&V Ex. 8)', 'Put the words in the correct order to make sentences.', [
          ['He never does the washing up.'], ['Can you give me some advice?'], ['I always leave my house at eight o\'clock in the morning.'],
          ['What time does your alarm usually go off?'], ['My cousin often comes to my house for dinner.'], ['Where do you want to live in the future?'],
          ['How many people do you live with?'], ['Do you live on the university campus?'],
        ]),
        gap('Find 11 words (G&V Ex. 4)', 'The book has a word square with 11 words about the home. Use the clues and the first letters to write the 11 words.', [
          ['The room or space just under the roof of a house: ____ (a…)', 'attic'],
          ['The area with grass and flowers around a house: ____ (g…)', 'garden'],
          ['A room in a house for working or reading: ____ (s…)', 'study'],
          ['A room below the ground: ____ (b…)', 'basement'],
          ['The room where you cook: ____ (k…)', 'kitchen'],
          ['A machine for watching films and the news: ____ (t…)', 'television|TV'],
          ['A table for studying or working: ____ (d…)', 'desk'],
          ['You stand under it to wash: ____ (s…)', 'shower'],
          ['You look outside through it: ____ (w…)', 'window'],
          ['You wash your hands or the dishes in it: ____ (s…)', 'sink'],
          ['It covers a window to keep out the light: ____ (b…)', 'blind'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U02-R1',
      title: 'Mindset 0 · Unit 2 — Prime Location Agency',
      content: '<p><em>In Listening 1, Giorgio spoke about going to university. Before he goes, he needs to organise his accommodation. He emails his friend Gavin for help and advice. Read the advert and the email.</em></p>\n\n<p style="text-align:center"><img src="media:m0u02-advert.jpg" alt="Prime Location Agency advert" style="max-width:100%;max-height:420px;height:auto;border-radius:6px"></p>\n\n<h3>Email</h3>\n\n<p><strong>To:</strong> Giorgio<br><strong>From:</strong> Gavin</p>\n\n<p>Hi Giorgio,</p>\n\n<p>Here is the information you need. Mr Taylor is the best agent in the UK for helping you with your future accommodation. He can definitely find you somewhere nice to live. He only works in the office from Monday to Saturday, but you can contact him any time you want by email. Oh, one more thing – the advert has a mistake. His email address finishes with .co.uk and not .com.</p>\n\n<p>Gavin</p>',
      questionGroups: [
        qNote('Complete Giorgio\'s notes. Write NO MORE THAN THREE WORDS (or the email address) for each answer.', "Giorgio's notes", [
          'Name of person to contact: __Q1__',
          'Name of company: __Q2__',
          'Office location: __Q3__',
          'Email: __Q4__',
          'Contact: Monday to Saturday – in the office. Sunday – __Q5__',
        ], { 1: 'Andrew Taylor', 2: 'Prime Location Agency', 3: 'London', 4: 'andrewtaylor@uniaccom.co.uk', 5: 'by email / email' }, {
          1: 'Quảng cáo: "Taylor – Andrew Taylor"; email gọi là "Mr Taylor".',
          2: 'Tên công ty ở đầu quảng cáo: "Prime Location Agency".',
          3: 'Quảng cáo: "We are based in our office in London".',
          4: 'Quảng cáo ghi andrewtaylor@uniaccom.com NHƯNG email của Gavin sửa: "the advert has a mistake. His email address finishes with .co.uk and not .com" → andrewtaylor@uniaccom.co.uk (TIP 09).',
          5: '"He only works in the office from Monday to Saturday, but you can contact him any time you want by email" → Chủ nhật liên hệ bằng email.',
        }, 'Questions 1–5'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U02-L1',
      title: "Mindset 0 · Unit 2 — Giorgio's bedroom",
      description: 'Giorgio describes his bedroom before he goes to university.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_03.mp3',
      transcript: GIORGIO_ROOM,
      questionGroups: [
        qMcq(1, 'You are going to listen to a student, Giorgio, describing his bedroom. Listen and decide which picture is Giorgio\'s bedroom.', [
          ["Which picture is Giorgio's bedroom?", ['Picture 1', 'Picture 2', 'Picture 3'], 'B', lx('Tranh nào là phòng ngủ của Giorgio?', 'Rải rác cả bài; chi tiết quyết định ở cuối.', ['if I look out of the window I can see the garden', "I don't like curtains very much, so I don't have them. At the window, I have a blind instead"], 'Tranh 3 nhìn ra thành phố → loại. Tranh 1 có rèm vải (curtains) → loại. Tranh 2: cửa sổ nhìn ra vườn + rèm sáo (blind) → Picture 2. Đúng TIP 07: nghe hết mới chọn.')],
        ], 'Question 1', { image: 'media:m0u02-bedrooms.jpg' }),
        qFill(2, 'Listen again. Answer the questions using TWO or THREE words.', [
          ['How does Giorgio describe his bed?', 'very comfortable', lx('Giorgio mô tả giường của mình thế nào?', 'Đầu bài.', "My bed is very comfortable – I've got four big pillows", 'very comfortable (2 từ).')],
          ['What can he see outside of his window?', 'the garden / garden', lx('Cậu ấy nhìn thấy gì ngoài cửa sổ?', 'Ngay sau phần nói về giường.', 'if I look out of the window I can see the garden', 'the garden.')],
          ['Why does he play games on his phone?', 'to relax', lx('Vì sao cậu ấy chơi game trên điện thoại?', 'Giữa bài.', 'When I want to relax, I usually play games on my phone', 'Câu hỏi Why → trả lời "to relax" (để thư giãn).')],
          ['Where is the bathroom?', 'down the hall', lx('Phòng tắm ở đâu?', 'Khi nói không có phòng tắm riêng.', 'I need to go down the hall if I want a shower or bath', 'down the hall (3 từ).')],
          ['What does he always do before he goes to college every morning?', 'brushes his teeth / brush his teeth', lx('Mỗi sáng trước khi đến trường cậu ấy luôn làm gì?', 'Khi nói về bồn rửa.', 'I have got a sink where I brush my teeth every morning before I go to college', 'brushes his teeth (3 từ).')],
          ['What is at the window?', 'a blind / blind', lx('Ở cửa sổ có gì?', 'Cuối bài.', 'At the window, I have a blind instead', 'Không có curtains → a blind.')],
        ], 'Questions 2–7'),
      ],
    },
    {
      ref: 'M0-U02-L2',
      title: 'Mindset 0 · Unit 2 — Calling an accommodation agency',
      description: 'Giorgio phones Andrew Taylor at Prime Location Agency.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_04.mp3',
      transcript: AGENCY_CALL,
      questionGroups: [
        qMcq(1, 'Listen to a conversation between Giorgio and Andrew Taylor who works at the accommodation agency. What do they discuss? Choose YES or NO.', [
          ['The course Giorgio wants to study at university.', ['YES', 'NO'], 'B', lx('Khoá học Giorgio muốn học ở đại học.', 'Khi Andrew hỏi "what do you want to study?"', "I'm not sure exactly, but something with engineering", 'Đáp án sách: NO — Giorgio không nêu được tên một khoá học cụ thể ("not sure… something with engineering"). MINI TIP 13.1: có nghe tên chính xác của khoá học không? → không.')],
          ['His study habits.', ['YES', 'NO'], 'A', lx('Thói quen học tập của cậu ấy.', 'Giữa bài.', ['Do you also like to sometimes have a quiet room to study in private?', 'other times, I prefer to study alone'], 'Có bàn về cách học (học một mình, cần phòng yên tĩnh) → YES.')],
          ['The number of other students that also live there.', ['YES', 'NO'], 'A', lx('Số sinh viên khác cũng sống ở đó.', 'Khi Andrew so sánh hai loại chỗ ở.', ['There are hundreds of other students who also live there', 'maybe one or two other students who are your housemates'], 'MINI TIP 13.3: có con số → "hundreds", "one or two" → YES.')],
          ['Two types of accommodation.', ['YES', 'NO'], 'A', lx('Hai loại chỗ ở.', 'Câu hỏi "First of all…".', 'in a room on campus or in private accommodation?', 'MINI TIP 13.2: hai lựa chọn: campus và private → YES.')],
          ['The teachers and lecturers at the university.', ['YES', 'NO'], 'B', lx('Giáo viên và giảng viên của trường.', '', '', 'Không ai nhắc tới giảng viên → NO.')],
          ['Where the accommodation is.', ['YES', 'NO'], 'A', lx('Chỗ ở nằm ở đâu.', 'Giorgio hỏi giữa bài.', ['Can I ask, where exactly the accommodation is?', 'in a different part of the city'], 'Có hỏi và trả lời về vị trí → YES.')],
          ["Giorgio's travel options from home to university.", ['YES', 'NO'], 'B', lx('Các cách Giorgio đi từ nhà tới trường.', '', 'it often takes a long time to travel to university', 'Chỉ nói "mất nhiều thời gian", KHÔNG bàn các phương tiện đi lại (bus, train…) → NO.')],
          ['The different types of food you can eat there.', ['YES', 'NO'], 'B', lx('Các loại đồ ăn bạn có thể ăn ở đó.', 'Cuối bài.', 'Catered means that all your food is included in the price', 'Chỉ bàn về chi phí/hình thức ăn (catered, self-catered), KHÔNG nói về các loại món ăn → NO.')],
        ], 'Questions 1–8'),
      ],
    },
  ],
};
