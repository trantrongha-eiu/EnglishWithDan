// Mindset for IELTS Foundation — Unit 3: Hobbies, leisure and entertainment (pp. 34–44)
const { mcq, gap, match, order, cat, write, speak, passage, picture, card, qMcq, qTFNG, lx } = require('../dsl');

const ADVENTURE = `Deon: Hey, Mark! Are you still interested in coming on a week's adventure holiday with me this summer?
Mark: Of course, but can we go in August? I can't do June or July because of college.
Deon: Yeah, sure! I guess we need to book soon. There's a company called World Trek that my friend told me about. He went on one of their cycling holidays last year, and loved it. There's lots of information on their website.
Mark: Really?
Deon: Yes – they do different kinds of adventure holidays. There's one by the sea with lots of water sports, and another in the forest where you can do hiking and cooking, and you learn how to cook outdoors. The one I like best is in the mountains. We can do things like climbing and white water rafting. What do you think?
Mark: That sounds amazing! Is it expensive?
Deon: So so – there's a special offer on at the moment. Normally the price is six hundred and fifty pounds, but if you book before Friday, it's five hundred pounds. The sailing holidays are eight hundred pounds, so it's not bad!
Mark: What does that include?
Deon: Transport, accommodation and our guide. We only have to pay for meals and drinks.
Mark: That's really good, isn't it? Let's book tonight! Shall I come to your place this evening around seven?
Deon: Can you come at eight? I've got a tennis lesson until seven thirty.
Mark: Yes, sure. See you then.`;

const BLOG = `I'm having a great time here in Iceland. I don't miss home at all. I'm not staying in a hotel. I'm staying at a little guesthouse with 11 other people. Every day, we get up early and go hiking or climbing. At the moment, I'm resting in my room because I'm exhausted. At home, I usually sleep about eight hours a night but on this holiday I need at least 10 hours a night because I'm so active! Our guide is great. He looks after us really well and he always makes us laugh. I'm happy with the food, but my friend doesn't like it very much. Today, we're having reindeer burgers. The chef is cooking them now and they smell delicious.`;

const AIMEE = `Aimee Fuller was born in England but now lives in the USA. She moved to the east coast of the United States at the age of 12 because she knew she wanted to be a professional snowboarder. It wasn't possible to train properly in her hometown because it hardly ever snowed. There was a dry ski slope in her town, where she learnt how to ski and snowboard, but there weren't any mountains with snow to practise the sport.

Aimee quickly found sponsors and a coach when she arrived in the USA, and she is now a successful and well-known snowboarding star. She has done really well in many national competitions and her dream is to win an Olympic gold medal one day.

Aimee spends most of her time practising on the snow, and trains in the gym four to five times a week. She also goes cycling and running. Aimee says it is very important to keep fit because that helps her stay safe when she is doing snowboarding tricks and jumps. Her advice to people who want to learn how to do jumps, is to start small and only do bigger jumps when they feel ready.

**During her free time, Aimee likes to spend time at home, switch off her phone and laptop and hang out with her friends and family.**`;

module.exports = {
  n: 3,
  title: 'Hobbies, leisure and entertainment',
  titleVi: 'Sở thích & giải trí',
  pages: '34–44',
  outcomes: [
    'Nói về các hoạt động giải trí và thể thao (play / do / go)',
    'Nghe thông tin cụ thể trong hội thoại (multiple choice)',
    'Dùng hiện tại đơn và hiện tại tiếp diễn',
    'Đọc bài báo để tìm ý chính; làm True / False / Not Given',
    'Mô tả tranh; viết tin nhắn trả lời bạn',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: hoạt động giải trí & thể thao',
      titleEn: 'Lead-in · Speaking and vocabulary',
      minutes: 40,
      objectives: [
        'Gọi tên các hoạt động phiêu lưu: hiking, canoeing, white water rafting…',
        'Dùng đúng play / do / go với từng môn thể thao',
        'Dùng các động từ thể thao: win, lose, beat, score, hit, kick, throw, catch',
      ],
      images: ['media:m0u03-leadin.jpg|Lead-in (tr. 34): Nối hoạt động với tranh — có 3 hoạt động thừa'],
      theory: [
        card('PLAY – DO – GO + môn thể thao', 'play / do / go', {
          formula: ['**play** + môn có **bóng/đối thủ**: play tennis, football, chess, badminton', '**do** + môn **võ / tập luyện cá nhân**: do judo, karate, gymnastics, athletics, yoga', '**go** + môn tận cùng **-ing**: go swimming, cycling, hiking, sailing, skiing, fishing'],
          examples: [['I play basketball twice a week.', 'Tôi chơi bóng rổ 2 lần/tuần.'], ['My sister does taekwondo.', 'Em gái tôi tập taekwondo.'], ['We go hiking in the mountains.', 'Chúng tôi đi bộ đường dài trên núi.']],
        }),
        card('Động từ thể thao', 'Sports verbs', {
          usage: [
            '**win** a match (thắng trận) ≠ **beat** someone (đánh bại ai): We **won** the match. / We **beat** them 3–1.',
            '**lose** a match (thua) · **score** a goal (ghi bàn)',
            '**hit** (đánh bằng vợt/gậy) · **kick** (đá) · **throw** (ném) · **catch** (bắt)',
          ],
        }),
      ],
      vocab: [
        ['hiking', 'đi bộ đường dài', 'We go hiking in the forest.'],
        ['canoeing', 'chèo xuồng', 'Canoeing on the river is fun.'],
        ['cycling', 'đạp xe', 'He went on a cycling holiday.'],
        ['sailing', 'chèo thuyền buồm', 'Sailing holidays are expensive.'],
        ['climbing', 'leo núi', 'We can do climbing in the mountains.'],
        ['white water rafting', 'chèo bè vượt thác', 'White water rafting is scary but exciting.'],
        ['leisure activity', 'hoạt động giải trí', 'What leisure activities do you enjoy?'],
        ['scary', 'đáng sợ', 'I think climbing is scary.'],
        ['boring', 'nhàm chán', 'Shopping is boring for me.'],
        ['score a goal', 'ghi bàn', 'He scored two goals.'],
        ['win / lose a match', 'thắng / thua trận', 'I hope I win some of my matches.'],
        ['beat', 'đánh bại', 'Every team we play against beats us.'],
        ['racket', 'cái vợt', 'You use a racket in tennis.'],
        ['kick / throw / catch / hit', 'đá / ném / bắt / đánh', 'In football, you kick the ball.'],
        ['get fit', 'khoẻ lên, cải thiện thể lực', 'Swimming helps you get fit.'],
        ['play in a team', 'chơi theo đội', 'In basketball, you play in a team.'],
        ['table tennis', 'bóng bàn', 'You use a small racket in table tennis.'],
        ['tai chi', 'thái cực quyền', 'Tai chi helps you relax your mind.'],
        ['kite flying', 'thả diều', 'Kite flying is popular on windy days.'],
        ['move a piece', 'đi một quân cờ', 'In chess, you move a piece on the board.'],
        ['equipment', 'dụng cụ, thiết bị', 'A bat and a racket are sports equipment.'],
        ['tournament', 'giải đấu', "I'm playing in a tennis tournament tomorrow."],
        ["boxing","quyền anh","He does boxing at the sports centre."],
        ["badminton","cầu lông","We play badminton after school."],
        ["hockey","khúc côn cầu","You use a stick in hockey."],
        ["bowling","bowling","We go bowling on Saturday evenings."],
        ["horse-riding","cưỡi ngựa","I go horse-riding in the countryside."],
      ],
      ex: [
        match('Activities in the pictures (Lead-in Ex. 1)', 'Match pictures 1–6 with the activities. There are nine activities, so three are not used: shopping, cooking, reading.', [
          ['Picture 1', 'hiking'], ['Picture 2', 'canoeing'], ['Picture 3', 'cycling'], ['Picture 4', 'sailing'], ['Picture 5', 'climbing'], ['Picture 6', 'white water rafting'],
        ], { stimulus: picture('media:m0u03-leadin.jpg', 'Lead-in') }),
        match('Sports in the pictures (G&V Ex. 1)', 'Match pictures 1–10 with the names of the sports.', [
          ['Picture 1', 'tennis'], ['Picture 2', 'volleyball'], ['Picture 3', 'basketball'], ['Picture 4', 'football'], ['Picture 5', 'badminton'],
          ['Picture 6', 'swimming'], ['Picture 7', 'skiing'], ['Picture 8', 'cycling'], ['Picture 9', 'sailing'], ['Picture 10', 'hiking'],
        ], { stimulus: picture('media:m0u03-sports.jpg', 'G&V Ex. 1') }),
        cat('PLAY, DO or GO? (G&V Ex. 2)', 'Put each sport into the correct column.', { play: 'play', do: 'do', go: 'go' }, [
          ['tennis', 'play'], ['chess', 'play'], ['volleyball', 'play'], ['football', 'play'], ['badminton', 'play'], ['hockey', 'play'], ['table tennis', 'play'], ['basketball', 'play'],
          ['karate', 'do'], ['judo', 'do'], ['boxing', 'do'], ['gymnastics', 'do'], ['taekwondo', 'do'], ['athletics', 'do'],
          ['horse-riding', 'go'], ['swimming', 'go'], ['skiing', 'go'], ['cycling', 'go'], ['sailing', 'go'], ['hiking', 'go'], ['canoeing', 'go'], ['fishing', 'go'], ['bowling', 'go'],
        ]),
        gap('Sports verbs (G&V Ex. 3)', 'Complete the sentences with the correct form of the verbs in the box: score, win, kick, play, hit, throw, catch, lose, beat.', [
          ['I\'m playing in a tennis tournament tomorrow. I hope I ____ some of my matches.', 'win'],
          ['Our school football team is not doing well this term. Every team we play against ____ us.', 'beats'],
          ['I really want to learn how to ____ baseball but it isn\'t a popular sport in Britain.', 'play'],
          ['It is quite difficult to learn how to ____ the ball with the racket when you start playing tennis.', 'hit'],
          ['When you ____ a sports match, it is important to learn from your mistakes.', 'lose'],
          ['In rugby, players usually pass the ball to each other by ____ it.', 'throwing'],
          ['In football, players can\'t hold the ball – they must move it by ____ it.', 'kicking'],
          ['In baseball, players wear a special glove to help them ____ the ball.', 'catch'],
          ['In football and handball, the team that ____ the most goals is the winner.', 'scores'],
        ], { wordBank: ['score', 'win', 'kick', 'play', 'hit', 'throw', 'catch', 'lose', 'beat'] }),
        mcq('Cricket (G&V Ex. 4)', 'Choose the correct word.', [
          ['Cricket is a ____ sport in several countries around the world, including India and Britain.', ['popular', 'good', 'favourite'], 'A'],
          ['There are 11 people in a cricket ____.', ['team', 'group', 'set'], 'A'],
          ['You play the sport by ____ a hard red ball with a bat.', ['throwing', 'hitting', 'kicking'], 'B'],
          ['It can take five days to complete a cricket ____.', ['goal', 'match', 'point'], 'B'],
          ['People often ____ white clothes to play cricket.', ['use', 'wear', 'put'], 'B'],
        ]),
        mcq('Which activity? (Speaking and vocabulary Ex. 15)', 'The pictures show basketball, football, badminton, table tennis, chess, tai chi and kite flying. In which activity do you…?', [
          ['…catch a ball?', ['basketball', 'badminton', 'chess'], 'A', 'Bóng rổ: bắt và ném bóng bằng tay.'],
          ['…throw a ball? (ném bóng)', ['table tennis', 'basketball', 'tai chi'], 'B'],
          ['…kick a ball?', ['football', 'badminton', 'kite flying'], 'A'],
          ['…hit a ball?', ['football', 'chess', 'table tennis'], 'C', 'Sách: badminton, table tennis — đánh bằng vợt.'],
          ['…score a goal? (ghi bàn)', ['football', 'tai chi', 'table tennis'], 'A'],
          ['…use a racket?', ['basketball', 'badminton', 'chess'], 'B', 'Sách: badminton, table tennis.'],
          ['…move a piece?', ['chess', 'football', 'kite flying'], 'A', 'piece = quân cờ.'],
          ['…relax your mind?', ['football', 'tai chi', 'basketball'], 'B', 'Sách: kite flying, tai chi.'],
          ['…play in a team?', ['chess', 'basketball', 'kite flying'], 'B', 'Sách: basketball, football.'],
          ['…play alone?', ['football', 'basketball', 'kite flying'], 'C', 'Sách: badminton, table tennis, kite flying, tai chi, chess.'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: True / False / Not Given',
      titleEn: 'Reading: use of distraction — Snowboarding star',
      minutes: 45,
      objectives: [
        'Đọc lướt bài báo để trả lời: ai, làm gì, vì sao viết bài',
        'Làm dạng True / False / Not Given — phân biệt FALSE và NOT GIVEN',
        'Nhận ra "bẫy" (distraction): từ giống bài nhưng nghĩa khác',
      ],
      theory: [
        card('True / False / Not Given', 'Use of distraction', {
          formula: [
            '**TRUE**: bài nói **đúng như vậy** (có thể bằng từ khác).',
            '**FALSE**: bài nói **ngược lại** câu hỏi.',
            '**NOT GIVEN**: bài **không nói đến** — không đủ thông tin để biết đúng hay sai.',
          ],
          usage: [
            'Câu hỏi đi **theo thứ tự** của bài — tìm đoạn chứa keyword rồi đọc kỹ 2–3 câu xung quanh.',
            'Bẫy thường gặp: bài có **cùng từ** với câu hỏi nhưng ý khác. VD câu 4: bài có "Olympic gold medal" nhưng đó là **ước mơ** (her dream is to win…), chưa giành được → FALSE.',
            'Đừng dùng **hiểu biết bên ngoài** — chỉ dựa vào bài.',
          ],
          examples: [
            ['Q1: Aimee learnt to ski before she started snowboarding.', 'Bài: "she learnt how to ski and snowboard" → không nói môn nào trước → NOT GIVEN.'],
            ['Q2: It often snowed in Aimee\'s hometown.', 'Bài: "it hardly ever snowed" (hầu như không bao giờ) → FALSE.'],
          ],
        }),
      ],
      links: [
        { ref: 'reading:M0-U03-R1', title: 'Aimee Fuller — Snowboarding Star (Ex. 12–13)', note: '7 câu True / False / Not Given. Đọc lướt trước, rồi tìm từng keyword.' },
      ],
      vocab: [
        ['professional', 'chuyên nghiệp', 'She wanted to be a professional snowboarder.'],
        ['train', 'luyện tập (thể thao)', 'It wasn\'t possible to train properly in her hometown.'],
        ['hardly ever', 'hầu như không bao giờ', 'It hardly ever snowed.'],
        ['ski slope', 'dốc trượt tuyết', 'There was a dry ski slope in her town.'],
        ['sponsor', 'nhà tài trợ', 'Aimee quickly found sponsors.'],
        ['coach', 'huấn luyện viên', 'She found a coach in the USA.'],
        ['successful', 'thành công', 'She is a successful snowboarding star.'],
        ['well-known', 'nổi tiếng', 'She is well-known in the USA.'],
        ['competition', 'cuộc thi', 'She has done well in many competitions.'],
        ['gold medal', 'huy chương vàng', 'Her dream is to win a gold medal.'],
        ['keep fit', 'giữ dáng, giữ sức khoẻ', 'It is important to keep fit.'],
        ['stay safe', 'giữ an toàn', 'Being fit helps her stay safe.'],
        ['trick', 'động tác biểu diễn khó', 'She does snowboarding tricks and jumps.'],
        ['advice', 'lời khuyên', 'Her advice is to start small.'],
        ['hang out with', 'đi chơi, tụ tập với', 'She hangs out with her friends.'],
      ],
      ex: [
        mcq('What is the article about? (Ex. 12)', 'Skim the article and answer the question.', [
          ['Who is Aimee Fuller?', ['an English snowboarder who lives in the USA', 'an American ski coach', 'a famous Olympic champion'], 'A', '"born in England but now lives in the USA… professional snowboarder".'],
          ['What sport has Aimee become successful in?', ['skiing', 'snowboarding', 'cycling'], 'B'],
          ['What is the reason for this article?', ['to sell snowboards', 'to tell readers about Aimee\'s life and career', 'to explain the rules of snowboarding'], 'B', 'Bài giới thiệu cuộc đời và sự nghiệp của Aimee.'],
        ], { stimulus: passage(AIMEE, { caption: 'Snowboarding star (tr. 38)' }) }),
        gap('Words in the article (Ex. 14)', 'Complete the words from the article that match the definitions.', [
          ['This is someone who is paid to do a sport or other activity. → p____', 'professional|rofessional'],
          ['This means to practise your sport. → t____', 'train|rain'],
          ['This word describes someone who is doing well in his/her life. → s____', 'successful|uccessful'],
          ['When you are this, you don\'t get tired easily when you exercise or do sport. → f____', 'fit|it'],
          ['You ask someone for this when you want to know what to do. → a____', 'advice|dvice'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: Hiện tại đơn & Hiện tại tiếp diễn',
      titleEn: 'Grammar: present simple / present continuous',
      minutes: 45,
      objectives: [
        'Phân biệt hiện tại đơn (thói quen) và hiện tại tiếp diễn (đang xảy ra)',
        'Viết đúng dạng -s/-es/-ies và -ing',
        'Đặt câu hỏi ở cả hai thì',
      ],
      keyLanguage: [
        'Hiện tại đơn: thói quen, việc lặp lại — với always, usually, sometimes, every day: Every day, we get up early.',
        'Hiện tại tiếp diễn (am/is/are + V-ing): việc ĐANG xảy ra — với now, at the moment, today; mô tả hành động trong ảnh: I\'m resting in my room.',
        'Câu hỏi: hiện tại đơn dùng do/does (Do you usually get up early?) · tiếp diễn dùng be (Are you enjoying your holiday?)',
        'Chính tả -ing: live → living · run → running · lie → lying · begin → beginning',
      ],
      links: [
        { grammar: 'present-simple', title: 'Present Simple', note: 'thói quen, sự thật' },
        { grammar: 'present-continuous', title: 'Present Continuous', note: 'đang xảy ra lúc nói, mô tả tranh' },
      ],
      ex: [
        cat('Verbs in the blog (Ex. 6)', 'Read the blog from Iceland. Which tense is each verb phrase?', { ps: 'Present simple', pc: 'Present continuous' }, [
          ['we get up', 'ps'], ['I don\'t miss', 'ps'], ['I usually sleep', 'ps'], ['He looks after us', 'ps'], ['he always makes us laugh', 'ps'], ['my friend doesn\'t like', 'ps'],
          ['I\'m having a great time', 'pc'], ['I\'m not staying', 'pc'], ['I\'m resting', 'pc'], ['we\'re having reindeer burgers', 'pc'], ['The chef is cooking', 'pc'],
        ], { stimulus: passage(BLOG, { caption: 'MY BLOG — Iceland' }) }),
        mcq('Rules for the tenses (Ex. 7, 9)', 'Choose "simple" or "continuous".', [
          ['We use the present ____ with time words and phrases, such as at the moment, today and now.', ['simple', 'continuous'], 'B'],
          ['We use the present ____ with adverbs, such as always, sometimes, usually and every day.', ['simple', 'continuous'], 'A'],
          ['We use the present ____ to talk about habits and routines.', ['simple', 'continuous'], 'A'],
          ['We use the present ____ to describe the action in photographs.', ['simple', 'continuous'], 'B'],
          ['When you make a question in the present ____, use the auxiliary verb do.', ['simple', 'continuous'], 'A'],
          ['When you make a question in the present ____, use the question form of the verb to be.', ['simple', 'continuous'], 'B'],
        ]),
        gap('-s and -ing forms (Ex. 8)', 'Write the third person (-s/-es/-ies) form and the -ing form of the verbs.', [
          ['live → ____ / ____', ['lives', 'living']], ['get → ____ / ____', ['gets', 'getting']], ['carry → ____ / ____', ['carries', 'carrying']],
          ['hope → ____ / ____', ['hopes', 'hoping']], ['run → ____ / ____', ['runs', 'running']], ['lie → ____ / ____', ['lies', 'lying']],
          ['cry → ____ / ____', ['cries', 'crying']], ['make → ____ / ____', ['makes', 'making']], ['begin → ____ / ____', ['begins', 'beginning']],
        ]),
        match('Questions and answers in two tenses (Ex. 9)', 'Match questions 1–4 with answers A–D.', [
          ['Are you enjoying your holiday?', 'Yes, I am. / No, I\'m not.'],
          ['What are you doing at the moment?', 'I\'m having a rest.'],
          ['Do you usually get up early?', 'Yes, I do. / No, I don\'t.'],
          ['When does your brother get up?', 'At about 7am.'],
        ]),
        gap('A conversation – verb forms (Ex. 10)', 'Put the verbs in brackets into the present simple or present continuous.', [
          ['A: Hi, Gabby. What ____ (you/do) at the moment? Do you ____ (want) to go out somewhere?', ['are you doing', 'want']],
          ['B: I can\'t, sorry. I ____ (watch) a football match on TV. My team usually ____ (play) really well but they ____ (lose) very badly today!', ['\'m watching|am watching', 'plays', 'are losing|\'re losing']],
          ['A: Tom, I ____ (wait) for you outside the cinema. — B: I\'m sorry, this bus never ____ (arrive) on time.', ['\'m waiting|am waiting', 'arrives']],
          ['Sam ____ (not answer) my calls today. — He\'s got a French exam next week, so he ____ (study) at the moment.', ['isn\'t answering|is not answering', '\'s studying|is studying']],
          ['How do you usually ____ (get) to college? — I ____ (walk). It ____ (not take) long.', ['get', 'walk', 'doesn\'t take|does not take']],
          ['My Dad usually ____ (drive) me there but he ____ (work) today.', ['drives', '\'s working|is working']],
        ]),
        order('Make questions (Ex. 11)', 'Put the words in the correct order to make questions.', [
          ['Why are you learning English?'], ['What time do you usually get up?'], ['What are you learning about in geography at the moment?'], ['Do you play tennis?'], ['What is the teacher doing now?'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: trả lời tin nhắn của bạn',
      titleEn: 'Writing: responding to a message from a friend',
      minutes: 40,
      objectives: [
        'Ghi chú thông tin từ quảng cáo + email (ngày, giá, giờ, phim, đồ mang theo)',
        'Hiểu mục đích tin nhắn của bạn',
        'Viết tin nhắn trả lời đủ 6 ý, dùng đúng hiện tại đơn / tiếp diễn',
      ],
      theory: [
        card('Viết tin nhắn trả lời (đủ các ý được yêu cầu)', 'Responding to a message', {
          formula: ['**Hi Richard,** → trả lời câu hỏi của bạn (Yes, that would be great!)', '**Nói bạn đang ở đâu, với ai, đang làm gì, chuyện gì đang xảy ra** → dùng **hiện tại tiếp diễn**', '**Hẹn gặp ở đâu + bạn nên mang gì** → See you soon, + tên'],
          usage: ['Đề có **6 gạch đầu dòng** → viết **đủ cả 6**, mỗi ý 1 câu là đủ.', 'Kiểm tra chính tả, dấu câu, và thì (Ex. 24).'],
          examples: [['I\'m in Sunnyhill Park at the moment, at a film festival with Andrew.', 'đang ở đâu + với ai'], ['We\'re watching Child in Time – it\'s fantastic!', 'đang làm gì']],
        }),
      ],
      vocab: [
        ['film festival', 'liên hoan phim', 'There is a film festival in the park.'],
        ['entrance', 'lối vào, cổng', 'See you at the entrance at 1pm.'],
        ['on the day', 'mua vào ngày diễn ra', 'Tickets are £20 on the day.'],
        ['food stall', 'quầy đồ ăn', 'There are food stalls at the festival.'],
        ['umbrella', 'cái ô', "Don't forget an umbrella."],
        ['meet up', 'gặp nhau', 'Do you want to meet up?'],
        ['bored', 'chán', "I'm really bored at home."],
        ['Let me know', 'Cho tôi biết nhé', 'Let me know soon!'],
        ['I can\'t wait to', 'tôi rất mong được', "I can't wait to see Child in Time!"],
        ['at the moment', 'lúc này', "I'm at the festival at the moment."],
      ],
      ex: [
        gap('Notes: a film festival (Ex. 21)', 'Read the advert and Andrew\'s email, then complete Joshua\'s notes.', [
          ['Date we will go: ____ 23rd June', 'Saturday', 'Andrew: "I can only go on Saturday as I\'m working on Sunday." Quảng cáo: Saturday 23rd and Sunday 24th June.'],
          ['Cost for me: £____', '15', 'Andrew mua vé online tối nay → giá online £15 (mua tại chỗ £20).'],
          ['Time to meet Andrew: ____', '1:00pm|1pm|1.00pm', '"See you at the entrance at 1:00pm."'],
          ['Film we will see: ____ ____ ____', ['Child', 'in', 'Time'], '"I don\'t mind if we miss Blue Rain, but I can\'t wait to see Child in Time!"'],
          ['What to take: an ____', 'umbrella', '"don\'t forget an umbrella as it looks like the weather won\'t be good."'],
        ], { stimulus: passage('FILM FESTIVAL IN SUNNYHILL PARK — Saturday 23rd and Sunday 24th June\n2:00PM Blue Rain · 4:00PM Child in Time\nTICKETS: £20 on the day or £15 from www.parkcinema.com\nAlso available – food stalls, art and other activities\n\nTo: Joshua · From: Andrew\nHi Joshua, I\'m emailing you about the film festival at the weekend. I can only go on Saturday as I\'m working on Sunday. I don\'t mind if we miss Blue Rain, but I can\'t wait to see Child in Time! We can get food there, but don\'t forget an umbrella as it looks like the weather won\'t be good. I\'ll get the tickets online tonight and you can pay me then. See you at the entrance at 1:00pm. Andrew', { caption: 'Ex. 21 — Place: Sunnyhill Park (ví dụ)' }) }),
        mcq('What does Richard want? (Ex. 22)', 'You and Andrew are at the film festival. Richard sends you a text message.', [
          ['What does Richard want to do?', ['watch TV at home with you', 'meet up with you', 'buy tickets for the festival'], 'B', '"Do you want to meet up? Let me know soon!"'],
        ], { stimulus: passage('Hi Joshua,\nWhere are you? Are you busy? I\'m watching TV at home at the moment but I\'m really bored.\nDo you want to meet up? Let me know soon!\nRichard', { caption: 'Message from Richard' }) }),
        write('Write a reply to Richard (Ex. 23)', 'Use the information in this unit to write a reply to Richard (about 60–90 words). Include: where you are · who you are with · what you are doing · what is happening · where you can meet Richard · what Richard should bring. Use the present simple and present continuous correctly.', {
          minWords: 55, maxWords: 100, mustUse: 3,
          targetStructures: ["I'm", "We're", 'at the moment', 'Bring', 'See you'],
          checklist: ['Nơi bạn đang ở', 'Đi cùng ai', 'Đang làm gì', 'Chuyện gì đang diễn ra', 'Hẹn gặp ở đâu', 'Richard nên mang gì', 'Dùng hiện tại tiếp diễn cho việc đang xảy ra'],
          sampleAnswer: 'Hi Richard,\n\nYes, that would be great! I\'m in Sunnyhill Park at the moment, at a film festival with Andrew. We\'re watching Child in Time – it\'s fantastic! Lots of people are sitting on the grass and some are eating at the food stalls. The next film starts at 4pm. You can meet us at the entrance near the car park. Bring some money for food and an umbrella as it may rain.\n\nSee you soon,\nJoshua',
          commonErrors: ['Dùng hiện tại đơn cho việc đang xảy ra (We watch a film now)', 'Thiếu 1–2 ý trong 6 gạch đầu dòng'],
        }),
      ],
    },

    listening: {
      title: 'Listening: trắc nghiệm (multiple choice)',
      titleEn: 'Listening: multiple choice questions',
      minutes: 35,
      objectives: [
        'Đọc trước câu hỏi và 3 lựa chọn, gạch keyword',
        'Nghe NGHĨA chứ không chỉ nghe từ giống (MINI TIP 05.1)',
        'Cẩn thận với con số và thông tin bị thay đổi (giá, giờ hẹn)',
      ],
      theory: [
        card('Multiple choice khi nghe', 'Listening for specific information', {
          formula: ['**Trước khi nghe**: gạch keyword trong câu hỏi; để ý lựa chọn khác nhau ở đâu (tháng? giá? giờ?)', '**Khi nghe**: các lựa chọn đều có thể được nhắc tới — chỉ **một** khớp hoàn toàn với câu hỏi.', '**Sau khi nghe**: kiểm tra từ phủ định (NOT) trong câu hỏi.'],
          usage: [
            'MINI TIP 05.0: Mark nói không đi được tháng 6, 7 vì còn học → đáp án là **August**.',
            'MINI TIP 05.1: "a friend told me" = "someone he knows" — nghe **nghĩa**, không chỉ nghe từ.',
            'Con số: £650 là giá **bình thường**, £500 nếu đặt **trước thứ Sáu** (book now) → chú ý điều kiện.',
            'Giờ hẹn bị **đổi**: Mark đề nghị 7 giờ, Deon xin **8 giờ** → nghe đến cuối.',
          ],
        }),
      ],
      links: [
        { ref: 'listening:M0-U03-L1', title: 'Deon & Mark — kỳ nghỉ phiêu lưu (Ex. 4–5)', note: 'Nghe audio gốc: chọn đáp án A, B hoặc C cho 6 câu.' },
      ],
      vocab: [
        ['adventure holiday', 'kỳ nghỉ phiêu lưu', 'Are you interested in an adventure holiday?'],
        ['book', 'đặt (vé, chỗ)', 'We need to book soon.'],
        ['special offer', 'ưu đãi đặc biệt', "There's a special offer on at the moment."],
        ['normally', 'thông thường', 'Normally the price is £650.'],
        ['include', 'bao gồm', 'What does that include?'],
        ['transport', 'phương tiện đi lại', 'Transport and accommodation are included.'],
        ['guide', 'hướng dẫn viên', 'Our guide is great.'],
        ['water sports', 'thể thao dưới nước', 'There are lots of water sports by the sea.'],
        ['cook outdoors', 'nấu ăn ngoài trời', 'You learn how to cook outdoors.'],
        ['That sounds amazing', 'Nghe tuyệt quá', 'That sounds amazing! Is it expensive?'],
        ['so so', 'tàm tạm', 'Is it expensive? – So so.'],
        ['Shall I…?', 'Tôi … nhé? (đề nghị)', 'Shall I come to your place at seven?'],
      ],
      ex: [
        mcq('Which activities are mentioned? (Ex. 4)', 'Which of these activities DOES Deon mention?', [
          ['cycling', ['mentioned', 'not mentioned'], 'A', '"He went on one of their cycling holidays last year".'],
          ['shopping', ['mentioned', 'not mentioned'], 'B'],
          ['hiking and cooking', ['mentioned', 'not mentioned'], 'A', '"in the forest where you can do hiking and cooking".'],
          ['canoeing', ['mentioned', 'not mentioned'], 'B', 'Có nói "water sports" nhưng không nói canoeing.'],
          ['climbing and white water rafting', ['mentioned', 'not mentioned'], 'A', '"in the mountains… climbing and white water rafting".'],
          ['sailing', ['mentioned', 'not mentioned'], 'A', '"The sailing holidays are eight hundred pounds".'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: mô tả tranh & nói về sở thích',
      titleEn: 'Speaking and vocabulary: describing pictures · hobbies and interests',
      minutes: 40,
      objectives: [
        'Mô tả tranh bằng hiện tại tiếp diễn: A man is running…',
        'Tìm điểm giống và khác giữa hai bức tranh',
        'Nói về sở thích, môn thể thao yêu thích, có lý do',
      ],
      images: ['media:m0u03-park-pictures.jpg|Ex. 19 (tr. 40): Picture 1 & Picture 2 — mô tả và tìm 5 điểm giống, 5 điểm khác'],
      theory: [
        card('Mô tả tranh', 'Describing a picture', {
          formula: ['**In this picture, I can see…** / **There is / There are…**', '**Người + am/is/are + V-ing**: A man **is running**. Two people **are doing** yoga.', '**Vị trí**: on the left / on the right / in the middle / at the top / at the bottom'],
          usage: ['So sánh: **In both pictures**, … (giống) · **In picture 1**, … **but in picture 2**, … (khác)'],
          examples: [['In picture 1, a father is walking with his son, but in picture 2 I can\'t see them.', 'Câu nêu điểm khác.'], ['In both pictures, a person is doing push-ups on the grass.', 'Câu nêu điểm giống.']],
        }),
      ],
      vocab: [
        ['in this picture', 'trong bức tranh này', 'In this picture, I can see a park.'],
        ['on the left / on the right', 'bên trái / bên phải', 'On the left, a man is riding a bike.'],
        ['in the middle', 'ở giữa', 'In the middle, some people are doing yoga.'],
        ['in both pictures', 'trong cả hai tranh', 'In both pictures, there are trees.'],
        ['difference', 'điểm khác nhau', 'Find five differences.'],
        ['do push-ups', 'chống đẩy', 'A man is doing push-ups.'],
        ['do yoga', 'tập yoga', 'Some people are doing yoga.'],
        ['hold hands', 'nắm tay', 'A father is holding hands with his son.'],
        ['free time', 'thời gian rảnh', 'What do you do in your free time?'],
        ['spend time outdoors', 'dành thời gian ngoài trời', 'It is important to spend time outdoors.'],
      ],
      ex: [
        speak('Speaking: describe two pictures of a park (Ex. 19)', 'Look at Picture 1 and Picture 2. Speak for about one minute: describe what is happening in each picture and give 3–5 similarities and 3–5 differences. Use the present continuous.', 2, [
          ['Describe Picture 1 and Picture 2. Say what is happening in each picture, and find things that are the same and different.', 'In both pictures, I can see a big park with lots of trees and green grass, and people are doing exercise. In picture 1, a man is riding a bike at the top and a woman is lying on a bench. In the middle, some people are standing on a red mat and talking. A father is walking with his son and holding hands. In picture 2, there is no bike, but a person is running at the bottom. In the middle, a group of people are doing yoga, and on the right a man is doing push-ups. So the main difference is that people in picture 2 are more active.', 'Mở bằng điểm chung (In both pictures), rồi lần lượt tranh 1 → tranh 2, có vị trí (at the top, in the middle, on the right), kết bằng nhận xét.'],
        ], { stimulus: picture('media:m0u03-park-pictures.jpg', 'Picture 1 & 2') }),
        speak('Speaking: your free-time activities (Ex. 3, 20)', 'Answer each question in 15–25 seconds.', 1, [
          ['What activities do you like doing in your free time?', 'In my free time I usually play badminton with my friends after school. I also love reading comics because it helps me relax before I go to sleep.', '2 hoạt động + tần suất + lý do.'],
          ['Which sports do you like doing? Which sports do you watch on TV?', 'I like swimming because it\'s good exercise and it keeps me fit. On TV, I usually watch football with my dad, especially when Vietnam is playing.', 'Tách 2 ý: chơi gì / xem gì.'],
          ['Is it important to spend time outdoors? Why or why not?', 'Yes, I think so. We spend too much time looking at screens, so going outside helps us feel healthier and happier. For example, I feel much better after a walk in the park.', 'Opinion → reason → example.'],
          ['What activities are popular in your country?', 'Football is definitely the most popular sport in Vietnam. Lots of young people also like playing badminton in the park and going out with friends for coffee at the weekend.', 'Nêu 2–3 hoạt động phổ biến.'],
        ]),
      ],
    },
    review: {
      title: 'Ôn tập Unit 3: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 3',
      minutes: 35,
      objectives: ['Ôn từ vựng thể thao, hiện tại đơn / tiếp diễn và động từ chỉ trạng thái (know, want, belong…)'],
      keyLanguage: ['Động từ chỉ trạng thái (state verbs) KHÔNG dùng tiếp diễn: know, understand, remember, want, like, belong, hear (can hear) → I don\'t know (KHÔNG: I\'m not knowing).'],
      ex: [
        mcq('Odd one out (G&V Ex. 5)', 'Choose the word that is DIFFERENT from the others.', [
          ['sailing · swimming · tennis · canoeing · windsurfing', ['sailing', 'tennis', 'canoeing'], 'B', 'Các từ khác là water sports (thể thao dưới nước).'],
          ['football · rugby · cricket · athletics · baseball', ['rugby', 'cricket', 'athletics'], 'C', 'Các từ khác là team sports.'],
          ['catch · hit · kick · lose · run', ['hit', 'lose', 'run'], 'B', 'Các từ khác là hành động trong khi chơi thể thao (actions used in sports).'],
          ['match · game · tournament · race · judo', ['judo', 'race', 'game'], 'A', 'Các từ khác là các loại cuộc thi (types of competition).'],
          ['snowboarding · boxing · skiing · climbing · hiking', ['skiing', 'boxing', 'hiking'], 'B', 'Các từ khác là mountain sports.'],
          ['ball · winner · bat · racket · stick', ['winner', 'bat', 'stick'], 'A', 'Các từ khác là dụng cụ thể thao (sports equipment).'],
        ]),
        match('Match the sentence halves (G&V Ex. 7)', 'Match the two halves of the sentences.', [
          ['My mum is working', 'in Italy at the moment.'], ['I often go to the cinema', 'on a Saturday evening.'], ['I can\'t speak to you right now', 'because I\'m studying.'],
          ['What does your brother', 'like doing in his free time?'], ['In this photo, I\'m climbing', 'a volcano with my uncle.'], ['What do you usually do', 'at the weekend?'], ['Why isn\'t Sam', 'eating his sandwich?'],
        ]),
        mcq('State verbs (G&V Ex. 8)', 'Choose the correct form.', [
          ['____ how to play tennis, but I would like to learn.', ['I don\'t know', 'I\'m not knowing'], 'A', 'know là state verb → không dùng tiếp diễn.'],
          ['I\'m very sorry, ____ your name.', ['I can\'t remember', 'I\'m not remembering'], 'A'],
          ['Can you help me with my homework? ____ this question.', ['I\'m not understanding', 'I don\'t understand'], 'B'],
          ['John ____ a great time on holiday. Look at these pictures on his blog!', ['is having', 'has'], 'A', 'have a great time = hành động (trải qua) → được dùng tiếp diễn.'],
          ['It ____ to my sister and she ____ it at the moment.', ['belongs / is reading', 'is belonging / reads'], 'A', 'belong là state verb; "at the moment" → is reading.'],
          ['____ go out tonight. I\'m too tired!', ['I don\'t want to', 'I\'m not wanting to'], 'A'],
          ['My brother ____ so many hobbies! At the moment, he ____ photos in the garden.', ['has / is taking', 'is having / takes'], 'A', 'have (sở hữu) là state verb; at the moment → is taking.'],
          ['Sue ____ you at the moment. She ____ a shower.', ['isn\'t hearing / has', 'can\'t hear / is having'], 'B'],
        ]),
        gap('Katy\'s email from Leeds (G&V Ex. 9)', 'Put the verbs in brackets into the present simple or present continuous.', [
          ['I ____ (have) a great time here in Leeds. The city is really big and it ____ (have) so many interesting places to visit.', ['am having|\'m having', 'has']],
          ['I ____ (enjoy) my course so far and I really ____ (like) my classmates.', ['am enjoying|\'m enjoying', 'like']],
          ['I ____ (stay) in one of the halls of residence this year.', ['am staying|\'m staying']],
          ['I ____ (have got) a job in a local restaurant. I ____ (work) there three evenings a week.', ['have got|\'ve got', 'work']],
          ['It\'s fine, but at the moment I ____ (look) for another job. I ____ (want) one that ____ (finish) a bit earlier.', ['am looking|\'m looking', 'want', 'finishes']],
        ]),
        match('Short answers (G&V Ex. 10)', 'Match the questions with the correct short answers.', [
          ['Is that your brother playing tennis over there?', 'Yes, it is.'], ['Do you always get up so early?', 'Yes, I do.'],
          ['Are your parents staying in a hotel?', 'Yes, they are.'], ['Are you making chocolate cake?', 'No, I\'m not.'],
          ['Is your brother having a good time in Iceland?', 'Yes, he is.'], ['Do you and your parents always eat together in the evenings?', 'No, we don\'t.'],
          ['Look at this picture of me as a young child. Am I wearing your gold necklace?', 'Yes, you are.'], ['Do any of your school friends do taekwondo?', 'No, they don\'t.'],
        ]),
        gap('Third person and -ing forms (G&V Ex. 6)', 'Write the third person singular (present simple) and the -ing form of each verb.', [
          ['snow → ____ / ____', ['snows', 'snowing']],
          ['fix → ____ / ____', ['fixes', 'fixing'], '-x → thêm -es.'],
          ['get → ____ / ____', ['gets', 'getting'], 'Phụ âm–nguyên âm–phụ âm → gấp đôi t: getting.'],
          ['stop → ____ / ____', ['stops', 'stopping']],
          ['invite → ____ / ____', ['invites', 'inviting'], 'Tận cùng -e → bỏ e rồi thêm -ing.'],
          ['marry → ____ / ____', ['marries', 'marrying'], 'Phụ âm + y → -ies; nhưng -ing giữ nguyên y.'],
          ['wash → ____ / ____', ['washes', 'washing'], '-sh → -es.'],
          ['make → ____ / ____', ['makes', 'making']],
          ['offer → ____ / ____', ['offers', 'offering'], 'Trọng âm ở âm đầu (OF-fer) → không gấp đôi r.'],
          ['buy → ____ / ____', ['buys', 'buying'], 'Nguyên âm + y → chỉ thêm -s.'],
          ['cross → ____ / ____', ['crosses', 'crossing'], '-ss → -es.'],
          ['copy → ____ / ____', ['copies', 'copying']],
          ['dance → ____ / ____', ['dances', 'dancing']],
          ['swim → ____ / ____', ['swims', 'swimming']],
          ['happen → ____ / ____', ['happens', 'happening']],
          ['travel → ____ / ____', ['travels', 'travelling|traveling'], 'Anh-Anh gấp đôi l: travelling (Anh-Mỹ: traveling).'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U03-R1',
      title: 'Mindset 0 · Unit 3 — Aimee Fuller: Snowboarding Star',
      content: '<p><em>You are going to read an article about a sportsperson.</em></p>\n\n' + AIMEE.split(/\n\s*\n/).map((p) => '<p>' + p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>').join('\n\n'),
      questionGroups: [
        qTFNG(1, 'Do the following statements agree with the information in the article? Choose TRUE, FALSE or NOT GIVEN. (Example: Aimee spent the first few years of her life in England. → TRUE)', [
          ['Aimee learnt to ski before she started snowboarding.', 'NOT GIVEN', 'Bài: "she learnt how to ski and snowboard" — có học cả hai nhưng KHÔNG nói học môn nào trước → NOT GIVEN.'],
          ["It often snowed during winter in Aimee's hometown.", 'FALSE', 'Bài: "it hardly ever snowed" (hầu như không bao giờ có tuyết) — ngược với "often" → FALSE.'],
          ['It took Aimee a long time to find a coach after she moved to the USA.', 'FALSE', 'Bài: "Aimee **quickly** found sponsors and a coach" — ngược với "a long time" → FALSE.'],
          ['Aimee has won an Olympic medal.', 'FALSE', 'Bẫy: bài có "Olympic gold medal" nhưng đó là ước mơ: "her dream is to win an Olympic gold medal **one day**" → chưa giành được → FALSE.'],
          ['Aimee practises snowboarding in the mountains at least three times a week.', 'NOT GIVEN', 'Bài nói tập gym "four to five times a week" và "spends most of her time practising on the snow", nhưng không nói tập trên núi mấy lần/tuần → NOT GIVEN.'],
          ['Aimee thinks that snowboarding is more dangerous for her when she is not fit.', 'TRUE', 'Bài: "it is very important to keep fit because that helps her stay safe" → không khoẻ thì kém an toàn hơn → TRUE.'],
          ['In her free time, Aimee prefers being with people to spending time on her laptop.', 'TRUE', 'Chú thích ảnh: "switch off her phone and laptop and hang out with her friends and family" → TRUE.'],
        ], 'Questions 1–7'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U03-L1',
      title: 'Mindset 0 · Unit 3 — An adventure holiday',
      description: 'Deon and Mark talk about booking an adventure holiday with World Trek.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_05.mp3',
      transcript: ADVENTURE,
      questionGroups: [
        qMcq(1, 'Listen to two friends, Deon and Mark, talking about an adventure holiday. Choose the correct answer, A, B or C. (Example: When will Deon and Mark go on the adventure holiday? → C August)', [
          ['How did Deon first find out about World Trek holidays?', ['He has been on one of their holidays.', 'He found their website online.', 'He heard about it from someone he knows.'], 'C', lx('Deon biết đến World Trek lần đầu bằng cách nào?', 'Ngay sau khi hai bạn chọn tháng 8.', "There's a company called World Trek that my friend told me about", '"my friend told me" = "someone he knows" (MINI TIP 05.1). Bẫy A: người bạn đi rồi, không phải Deon. Bẫy B: website có nhắc nhưng không phải cách Deon biết lần đầu.')],
          ['Deon would like to go on an adventure holiday', ['in a forest.', 'in the mountains.', 'near the sea.'], 'B', lx('Deon muốn đi kỳ nghỉ phiêu lưu…', 'Khi Deon kể các loại tour.', 'The one I like best is in the mountains', 'Cả 3 nơi đều được nhắc, nhưng "the one I like best" = in the mountains → B.')],
          ['How much does the holiday they want to go on cost if they book it now?', ['£500', '£650', '£800'], 'A', lx('Kỳ nghỉ họ muốn đi giá bao nhiêu nếu đặt ngay bây giờ?', 'Khi Mark hỏi "Is it expensive?"', "Normally the price is six hundred and fifty pounds, but if you book before Friday, it's five hundred pounds", '£650 là giá thường; đặt trước thứ Sáu (= bây giờ) → £500. £800 là tour thuyền buồm.')],
          ['The price of the holiday does NOT include', ['food.', 'the guide.', 'transport.'], 'A', lx('Giá kỳ nghỉ KHÔNG bao gồm…', 'Khi Mark hỏi "What does that include?"', ['Transport, accommodation and our guide', 'We only have to pay for meals and drinks'], 'Phải tự trả tiền "meals and drinks" = food → A.')],
          ['What time will the boys meet this evening?', ['7pm', '7:30pm', '8pm'], 'C', lx('Tối nay hai bạn gặp nhau lúc mấy giờ?', 'Cuối bài.', ['Shall I come to your place this evening around seven?', "Can you come at eight? I've got a tennis lesson until seven thirty", 'Yes, sure'], '7 giờ là đề nghị đầu tiên; 7:30 là giờ học tennis kết thúc; chốt lại 8 giờ → C.')],
        ], 'Questions 1–5'),
      ],
    },
  ],
};
