// Mindset for IELTS Foundation — Unit 4: Travel and holidays (pp. 45–57)
const { mcq, gap, match, cat, write, speak, passage, picture, card, qMcq, qMatch, lx } = require('../dsl');

const PART1 = `Presenter: Good afternoon everybody and welcome to the travel show. Today, I'm talking to Anna Cox from Cambridge, who has recently taken part in the Summer Cultural Exchange Programme. Good afternoon, Anna!
Anna: Good afternoon!
Presenter: Anna, where can students go on the Summer Cultural Exchange Programme?
Anna: Well, students can travel to France or Spain on a language exchange, or to the USA on a sports or music exchange. I didn't go to the USA because I'm not very good at sports. However, I study French and Spanish at school, so I had two options. I've been to France before, so I decided to go to Spain instead.`;

const PART2 = `Presenter: Where did you stay on your summer cultural exchange programme?
Anna: I stayed with a host family in a small village just outside the city of Seville. Most people in the city live in apartments, but my host family lived in a big house. The family had a daughter who was my age called Carmen, so we had lots of fun together. We also visited Carmen's grandparents who live on a farm in the countryside. As I love animals, it was a really good experience for me.
Presenter: How wonderful! How long are exchange programmes usually?
Anna: Well, most of the language exchange programmes last for two weeks but the sports and music exchange programmes last for four weeks. If you go on a language exchange programme in August, you can go for three weeks because it's the school holidays. I went on a language exchange to Spain in July, so I could only stay for two weeks, unfortunately.
Presenter: Who can take part in the programme?
Anna: Well, there are some age requirements for the programme. You must be over the age of fourteen to take part in the language exchange programme and sixteen for the sports and music exchange programme. If you want to take part in the sports and music exchange programme, you have to be on a school sports team or play in the school orchestra. You can only take part in the language exchange programme if you study French or Spanish.
Presenter: I see – so would you recommend this programme to other students?
Anna: Yes, definitely. I had a great time staying with Carmen and her family. I felt a bit homesick when I first arrived, but they were so friendly and welcoming. Carmen spoke really good English, so I was worried that I wouldn't improve my Spanish, but I always tried to speak Spanish with her parents. My language skills have improved a little bit, but I think that it's better to stay for three weeks because you have more time to practise the language.
Presenter: The whole programme sounds really interesting, Anna – thank you for telling us about it.`;

const HOLIDAYS = [
  ['WILDLIFE EXPERIENCE', 'Come and learn about nature on our wildlife adventure holidays. Find out where your favourite animals live, what they eat and how to protect them. Our guides will show you local wildlife in its natural environment. Don\'t forget your camera!'],
  ['FUN FAMILY HOLIDAYS', 'This is a great choice for families looking for fun on holiday. Choose from activities at zoos and water parks, as well as day trips to local attractions such as museums, art galleries and shopping centres. Accommodation and meals are all included, leaving you with more time to enjoy your favourite activities.'],
  ['DELICIOUS FOOD TOURS', 'If you enjoy trying new food, you will love this holiday! This is the perfect chance to visit popular markets and restaurants with other food-lovers, attend cookery demonstrations and prepare your own delicious meals with the help of local chefs.'],
  ['ADVENTURE HOLIDAYS', 'Are you looking for a real adventure in the great outdoors? Try one of our mountain climbing, horse riding or cycling tours! Our fully qualified activity instructors will share their knowledge of the area and entertain you with true stories about their past adventures. No previous experience is required, but you need to have lots of energy.'],
  ['BEACH ESCAPE', 'This is the perfect holiday for people who simply want to relax. We offer luxury accommodation in our beach resorts, a variety of restaurants serving delicious local food and perfect cafés to relax and watch the sunset. Water sports, including snorkelling, windsurfing and sailing, are also available.'],
  ['LANGUAGE EXCHANGE', 'Do you want to improve your language skills while experiencing life in another country? Our local host families will give you the chance to practise speaking the language, teach you how to cook traditional food and take you to the best local attractions. The Language Exchange holiday is a perfect way to make new friends and explore Europe.'],
  ['SAILING EXPERIENCE', 'Whether you are a complete beginner or an experienced sailor, we can give you the perfect sailing experience! Learn the basics of sailing or more advanced techniques with our qualified sailing instructors.'],
  ['CITY BREAKS', 'Do you enjoy visiting art galleries, museums or famous buildings? Do you want to visit other countries? On our cultural tours in Europe, you can learn about the history of the city you are visiting. Every day includes a different cultural visit.'],
];

const SIMON = `Hi Tony,

I went to Madrid for my last holiday – it was great! On the first day, I visited some of the famous sights here including the Prado museum and the Royal Palace. It is different to my usual holidays. Normally, I go to hot places and relax on the beach. At the moment, it's the opposite and it is quite cold here. On my second day, I went shopping and bought some souvenirs. That night it was really interesting because I ate in a Spanish restaurant. I usually don't try new food when I go on holiday, but I am very happy that I did this time. I tried a traditional meal of soup, vegetables and meat. It was delicious. It was only a short holiday, but I really enjoyed it. I took lots of photos. What did you do on your holiday? Where did you go?

Simon`;

module.exports = {
  n: 4,
  title: 'Travel and holidays',
  titleVi: 'Du lịch & kỳ nghỉ',
  pages: '45–57',
  outcomes: [
    'Gọi tên các loại kỳ nghỉ và hoạt động du lịch',
    'Đọc để tìm thông tin cụ thể và ghép người với kỳ nghỉ phù hợp',
    'Nghe phỏng vấn trên radio, chọn đáp án đúng',
    'Thêm chi tiết và lý do khi nói (as, so, because)',
    'Dùng quá khứ đơn và hiện tại đơn; viết email kể về kỳ nghỉ',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: loại kỳ nghỉ & hoạt động du lịch',
      titleEn: 'Lead-in · Vocabulary: holiday activities',
      minutes: 35,
      objectives: ['Phân biệt 5 loại kỳ nghỉ: adventure holiday, city break, language exchange, beach holiday, family holiday', 'Gọi tên 12 hoạt động du lịch (go on day trips, see local attractions…)', 'Ghép hoạt động với loại kỳ nghỉ phù hợp'],
      images: ['media:m0u04-holidays.jpg|Lead-in (tr. 46): Đây là những loại kỳ nghỉ nào?', 'media:m0u04-activities.jpg|Ex. 2 (tr. 47): các hoạt động trong kỳ nghỉ'],
      theory: [
        card('Loại kỳ nghỉ', 'Types of holiday', {
          usage: [
            '**an adventure holiday** — kỳ nghỉ phiêu lưu: leo núi, cưỡi ngựa, đạp xe đường dài',
            '**a city break** — chuyến đi thành phố ngắn ngày: bảo tàng, toà nhà nổi tiếng, mua sắm',
            '**a beach holiday** — nghỉ biển · **a family holiday** — kỳ nghỉ gia đình',
            '**a language exchange** — trao đổi ngôn ngữ: ở nhà dân bản xứ (host family)',
          ],
          notes: ['go on a holiday / a trip / a day trip · go + V-ing: go shopping, go horse riding · visit / see + nơi chốn: visit water parks, see famous buildings'],
        }),
      ],
      vocab: [
        ['adventure holiday', 'kỳ nghỉ phiêu lưu', 'Tom wants to go on an adventure holiday.'],
        ['city break', 'chuyến du lịch thành phố ngắn ngày', 'I went on a city break to Paris.'],
        ['beach holiday', 'kỳ nghỉ ở biển', 'We usually go on a beach holiday.'],
        ['language exchange', 'chương trình trao đổi ngôn ngữ', 'She is going on a language exchange to Italy.'],
        ['try traditional food', 'thử món ăn truyền thống', 'I love to try traditional food on holiday.'],
        ['go horse riding', 'cưỡi ngựa', 'We went horse riding in the countryside.'],
        ['visit water parks', 'đi công viên nước', 'Families like to visit water parks in summer.'],
        ['go mountain climbing', 'leo núi', "Don't go mountain climbing alone."],
        ['go on a cycling tour', 'đi tour xe đạp', 'A cycling tour is a good way to see the country.'],
        ['visit a beach resort', 'đến khu nghỉ dưỡng biển', 'We stayed at a beach resort in Phu Quoc.'],
        ['go shopping', 'đi mua sắm', 'We often go shopping in the airport.'],
        ['see famous buildings', 'ngắm các toà nhà nổi tiếng', 'In Paris, you can see famous buildings.'],
        ['see local attractions', 'tham quan điểm hấp dẫn địa phương', 'You can see local attractions like the castle.'],
        ['go on a day trip', 'đi chơi trong ngày', 'You can go on a day trip to the countryside.'],
        ['go on a cultural visit', 'tham quan văn hoá', 'Every day includes a cultural visit.'],
        ['stay with a host family', 'ở cùng gia đình bản xứ', 'It is cheaper to stay with a host family.'],
      ],
      ex: [
        match('Types of holiday (Lead-in Ex. 1)', 'Match pictures 1–4 with the types of holiday.', [
          ['Picture 1', 'a beach holiday'], ['Picture 2', 'a language exchange'], ['Picture 3', 'an adventure holiday'], ['Picture 4', 'a city break'],
        ], { stimulus: picture('media:m0u04-holidays.jpg', 'Lead-in') }),
        match('Holiday activities (Ex. 2)', 'Match pictures 1–12 with the activities.', [
          ['Picture 1', 'try traditional food'], ['Picture 2', 'go horse riding'], ['Picture 3', 'visit water parks'], ['Picture 4', 'go mountain climbing'],
          ['Picture 5', 'go on cycling tours'], ['Picture 6', 'visit beach resorts'], ['Picture 7', 'go shopping'], ['Picture 8', 'see famous buildings'],
          ['Picture 9', 'see local attractions'], ['Picture 10', 'go on day trips'], ['Picture 11', 'go on cultural visits'], ['Picture 12', 'stay with host families'],
        ], { stimulus: picture('media:m0u04-activities.jpg', 'Ex. 2') }),
        cat('Which holiday for each activity? (G&V Ex. 2)', 'Put each activity with the type of holiday it suits best.', { city: 'city break', adv: 'adventure holiday', beach: 'beach holiday', lang: 'language exchange' }, [
          ['go on day trips', 'city'], ['see local attractions', 'city'], ['go shopping', 'city'], ['try traditional food', 'city'], ['see famous buildings', 'city'], ['go on cultural visits', 'city'],
          ['go mountain climbing', 'adv'], ['go horse riding', 'adv'], ['go on cycling tours', 'adv'], ['visit water parks', 'adv'],
          ['visit beach resorts', 'beach'], ['stay with host families', 'lang'],
        ]),
        gap('Types of holiday (G&V Ex. 1)', 'Complete the sentences with: a city break, a beach holiday, a family holiday, a language exchange, an adventure holiday.', [
          ['You can do lots of activities like cycling and horse-riding on ____.', 'an adventure holiday'],
          ['My friends want to go on ____, but I don\'t enjoy relaxing all the time.', 'a beach holiday'],
          ['I went on ____ to Paris. It was interesting to visit all the museums.', 'a city break'],
          ['My sister is going on ____ and will stay with a host family in Italy.', 'a language exchange'],
          ['I went on ____ with my parents and we camped by a lake.', 'a family holiday'],
        ], { wordBank: ['a city break', 'a beach holiday', 'a family holiday', 'a language exchange', 'an adventure holiday'] }),
      ],
    },

    reading: {
      title: 'Reading: ghép người với kỳ nghỉ phù hợp',
      titleEn: 'Reading: reading for specific information and detailed meaning',
      minutes: 45,
      objectives: ['Gạch từ khoá về NHU CẦU của từng người', 'Đối chiếu với 8 mô tả kỳ nghỉ — chỉ một mô tả khớp TẤT CẢ yêu cầu', 'Loại các lựa chọn chỉ khớp một phần'],
      theory: [
        card('Dạng bài: ghép người với mô tả', 'Matching people to descriptions', {
          formula: [
            '**Bước 1**: Với mỗi người, gạch 2–3 **yêu cầu chính** (tuổi, đi cùng ai, thích gì, KHÔNG thích gì).',
            '**Bước 2**: Đọc 8 mô tả, tìm mô tả khớp **tất cả** yêu cầu — không chỉ một.',
            '**Bước 3**: Kiểm tra điều kiện phủ định: Tom **không** muốn thể thao dưới nước nữa, **chán** biển.',
          ],
          usage: [
            'MINI TIP 05.1: bố mẹ Julia **không cho** con ở nước ngoài **mà không có người lớn** → cần chỗ có người lớn chăm sóc: host family.',
            'MINI TIP 05.2: điều quan trọng nhất với Charlie là **làm việc với động vật** trong tương lai → wildlife.',
            'MINI TIP 05.4: Roger **không chỉ** muốn bảo tàng — còn cần hoạt động **vui cho trẻ em** và **mua sắm** → family holiday.',
          ],
          notes: ['Trong bài thi, một số thông tin khớp nhưng **không phải tất cả** — đó là bẫy (Bullet box).'],
        }),
      ],
      links: [{ ref: 'reading:M0-U04-R1', title: 'Eight holidays — chọn kỳ nghỉ cho 4 người (Ex. 4–5)', note: 'Đọc 8 mô tả kỳ nghỉ A–H, chọn kỳ nghỉ hợp nhất cho Julia, Charlie, Joanna và Roger.' }],
      vocab: [
        ['wildlife', 'động vật hoang dã', 'Come and learn about wildlife.'],
        ['natural environment', 'môi trường tự nhiên', 'See animals in their natural environment.'],
        ['protect', 'bảo vệ', 'Learn how to protect animals.'],
        ['local attraction', 'điểm tham quan địa phương', 'Day trips to local attractions.'],
        ['art gallery', 'phòng trưng bày nghệ thuật', 'Roger wants to visit art galleries.'],
        ['cookery demonstration', 'buổi trình diễn nấu ăn', 'Attend cookery demonstrations.'],
        ['qualified instructor', 'huấn luyện viên có chứng chỉ', 'Our fully qualified instructors.'],
        ['no previous experience is required', 'không cần kinh nghiệm', 'No previous experience is required.'],
        ['luxury accommodation', 'chỗ ở sang trọng', 'We offer luxury accommodation.'],
        ['watch the sunset', 'ngắm hoàng hôn', 'Relax and watch the sunset.'],
        ['beginner', 'người mới bắt đầu', 'Whether you are a complete beginner…'],
        ['explore', 'khám phá', 'Make new friends and explore Europe.'],
        ['entertain', 'giải trí, làm vui', 'Fun activities to entertain the children.'],
        ['allow', 'cho phép', 'Their parents will not allow them to travel alone.'],
      ],
      ex: [
        mcq('Each person\'s key words', 'Read the description of each person and choose their MOST IMPORTANT requirement.', [
          ['Tom (19) is very active… He has done a lot of water sports… he would like to try something different… He went to the beach last year, but got bored.', ['relaxing on a beach', 'a new, active sport on land', 'learning to sail'], 'B', 'Tom năng động, muốn thử điều KHÁC thể thao dưới nước, chán biển → Adventure Holidays (D).'],
          ['Julia (16)… Their parents will not allow their daughters to be in another country without any adults… They both study Spanish.', ['travelling abroad alone', 'adults to look after them + practising Spanish', 'a beach holiday with friends'], 'B', '→ Language Exchange (F): ở với host family (có người lớn), luyện ngôn ngữ, khám phá châu Âu.'],
          ['Charlie (21)… prefers holidays in the countryside… would like to get a job working with animals in the future.', ['working with animals / the countryside', 'cities and museums', 'food'], 'A', '→ Wildlife Experience (A).'],
          ['Joanna (32)… very tired after a busy term… somewhere hot and near the sea. She wants to relax and not do very much.', ['somewhere hot + the sea + relaxing', 'mountain climbing', 'learning to cook'], 'A', '→ Beach Escape (E).'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: Quá khứ đơn & Hiện tại đơn',
      titleEn: 'Grammar: past simple and present simple',
      minutes: 40,
      objectives: ['Phân biệt hiện tại đơn (trạng thái/thói quen hiện tại) và quá khứ đơn (việc đã xong)', 'Chia đúng động từ có quy tắc và bất quy tắc ở quá khứ', 'Viết câu phủ định và câu hỏi với did / was'],
      keyLanguage: [
        'Hiện tại đơn: trạng thái hiện tại (I\'m not good at sports) và thói quen (I go to French lessons twice a week).',
        'Quá khứ đơn: việc đã xong trong quá khứ (I decided to go to Spain) và trạng thái quá khứ (Seville was very nice).',
        'Phủ định: was/were + not · did not (didn\'t) + V nguyên mẫu — Câu hỏi: Was Seville nice? · Did you decide…?',
        'Bất quy tắc thường gặp: go → went, buy → bought, eat → ate, take → took, have → had, see → saw, feel → felt, learn → learnt',
      ],
      links: [
        { grammar: 'past-simple', title: 'Past Simple', note: 'động từ có quy tắc / bất quy tắc, did / didn\'t' },
        { grammar: 'present-simple', title: 'Present Simple', note: 'so sánh với hiện tại đơn' },
      ],
      ex: [
        mcq('Present or past? (Ex. 13–14)', 'Read what Anna says again and choose the correct answer.', [
          ['"I\'m not very good at sports." — this sentence describes…', ['a state in the present', 'a habit', 'a finished action in the past'], 'A'],
          ['"I study French and Spanish at school." — this sentence describes…', ['a state in the present', 'a habit / regular activity', 'a finished action in the past'], 'B'],
          ['"I decided to go to Spain instead." — this sentence describes…', ['a habit', 'a finished action in the past'], 'B'],
          ['"Students can travel to France or Spain." — thì gì?', ['Present simple', 'Past simple'], 'A'],
          ['"I didn\'t go to the USA." — thì gì?', ['Present simple', 'Past simple'], 'B'],
        ]),
        gap('Correct the verbs in the summary (Ex. 15)', 'The summary about Anna has six verbs in the wrong tense. Write the correct form (if a verb is already correct, copy it).', [
          ['Anna ____ (1: study) French and Spanish at school at the moment.', 'studies', 'at the moment + thói quen hiện tại, she → studies.'],
          ['Last summer, she ____ (2: goes) to Spain on a language exchange…', 'went', 'last summer → quá khứ.'],
          ['…where she ____ (3: stayed) with a family in a village.', 'stayed', 'Đã đúng.'],
          ['Anna now ____ (4: thought) that the language exchange programme…', 'thinks', 'now → hiện tại.'],
          ['…____ (5: was) a good experience for her…', 'was', 'Đã đúng.'],
          ['…although she ____ (6: wasn\'t) much better at Spanish now than before.', 'isn\'t|is not', 'now → hiện tại: isn\'t.'],
        ]),
        mcq('A conversation about holidays (G&V Ex. 5)', 'Choose the correct answer.', [
          ['A: ____ going on holiday?', ['Do you like', 'You like'], 'A'],
          ['B: Yes, ____. I always have a great time on holiday with my family.', ['I do', 'I did'], 'A'],
          ['A: I do, too. Where ____?', ['did you usually go', 'do you usually go'], 'B', 'usually → hiện tại đơn.'],
          ['B: Usually we go on a beach holiday but last summer we ____ on a city break.', ['go', 'went'], 'B'],
          ['A: What ____ there?', ['do you do', 'did you do'], 'B'],
          ['B: Well, because my parents ____ going to the theatre, …', ['enjoy', 'enjoys'], 'A', 'my parents (số nhiều) → enjoy.'],
          ['B: … ____ to see a play by a famous British writer.', ['we all go', 'we all went'], 'B', 'Kể chuyện mùa hè năm ngoái → quá khứ đơn.'],
          ['A: ____ good?', ['Is it', 'Was it'], 'B'],
          ['A: I ____ plays. I think they are boring.', ['not really like', 'don\'t really like'], 'B'],
          ['B: I thought that, too, but this one ____ boring at all.', ['wasn\'t', 'didn\'t'], 'A'],
        ]),
        gap('Sarah\'s email (G&V Ex. 6)', 'Put the verbs in brackets into the present simple or past simple.', [
          ['I ____ (go) to Germany with my family last February.', 'went'],
          ['My family and I ____ (not like) beach holidays, so we ____ (decide) to go to Berlin for a weekend.', ['don\'t like|do not like', 'decided']],
          ['Usually on holiday, I ____ (enjoy) visiting lots of famous museums but we ____ (not have) time to see everything.', ['enjoy', 'didn\'t have|did not have']],
          ['So we just ____ (see) the main ones, like the Berlin Wall. In my opinion, they ____ (be) both very interesting monuments.', ['saw', 'are']],
          ['I ____ (learn) about them at school last year. We ____ (feel) cold a lot of the time because it ____ (be) the middle of winter.', ['learnt|learned', 'felt', 'was']],
          ['Where ____ (you / like) going on holiday?', ['do you like'], 'Hỏi thói quen/sở thích chung → hiện tại đơn.'],
          ['____ (you / prefer) city breaks in winter or beach holidays in the summer?', ['Do you prefer|do you prefer']],
        ]),
      ],
    },

    writing: {
      title: 'Writing: email kể về kỳ nghỉ',
      titleEn: 'Writing: emails',
      minutes: 50,
      objectives: ['Đọc email mẫu và nhận ra các đặc điểm của một email tốt', 'Chia đúng quá khứ đơn khi kể chuyện, hiện tại đơn cho thói quen', 'Viết email 150–175 từ kể về kỳ nghỉ gần nhất'],
      theory: [
        card('Email kể về kỳ nghỉ', 'Writing an email about a holiday', {
          formula: ['**Hi + tên,**', '**Đi đâu** (I went to…) → **Làm gì** theo ngày (On the first day… On my second day… That night…)', '**So sánh với thói quen** (Normally, I go to… / I usually don\'t…) → **cảm nhận** (It was delicious / I really enjoyed it)', '**Hỏi lại bạn** (What did you do on your holiday? Where did you go?) → **Tên**'],
          usage: ['Kể chuyện đã qua → **quá khứ đơn**; nói thói quen → **hiện tại đơn**; trạng thái lúc viết (it is cold here) → hiện tại.', 'Chỉ viết những gì đề yêu cầu (Ex. 20): đi đâu, làm gì, hỏi bạn — đủ số từ.'],
        }),
      ],
      vocab: [
        ['last holiday', 'kỳ nghỉ vừa rồi', 'I went to Madrid for my last holiday.'],
        ['famous sights', 'thắng cảnh nổi tiếng', 'I visited some of the famous sights.'],
        ['souvenir', 'quà lưu niệm', 'I bought some souvenirs.'],
        ['normally', 'thường thì', 'Normally, I go to hot places.'],
        ['the opposite', 'điều ngược lại', "It's the opposite here – it is cold."],
        ['traditional meal', 'bữa ăn truyền thống', 'I tried a traditional meal.'],
        ['delicious', 'ngon', 'It was delicious.'],
        ['take photos', 'chụp ảnh', 'I took lots of photos.'],
        ['short holiday', 'kỳ nghỉ ngắn', 'It was only a short holiday.'],
        ['I really enjoyed it', 'tôi thực sự rất thích', 'It was short, but I really enjoyed it.'],
      ],
      ex: [
        mcq('Read Simon\'s email quickly (Ex. 16)', 'Read the email quickly (two minutes) and answer the question.', [
          ['Where did Simon go?', ['Barcelona', 'Madrid', 'Seville'], 'B'],
          ['Why was this holiday different to his trips before?', ['It was a city break and the weather was cold; normally he goes on beach holidays in warm weather.', 'He went with his family for the first time.', 'He stayed with a host family.'], 'A'],
        ], { stimulus: passage(SIMON, { caption: 'Email from Simon' }) }),
        gap('Verbs in Simon\'s email (Ex. 17)', 'Put the verbs in brackets into the correct form.', [
          ['I ____ (go) to Madrid for my last holiday – it ____ (be) great!', ['went', 'was']],
          ['On the first day, I ____ (visit) some of the famous sights. Normally, I ____ (go) to hot places.', ['visited', 'go']],
          ['On my second day, I ____ (go) shopping and ____ (buy) some souvenirs.', ['went', 'bought']],
          ['That night it ____ (be) really interesting because I ____ (eat) in a Spanish restaurant.', ['was', 'ate']],
          ['I usually ____ (not try) new food on holiday, but I am very happy that I ____ (do) this time.', ['don\'t try|do not try', 'did']],
          ['I ____ (try) a traditional meal. It ____ (be) delicious. It ____ (be) only a short holiday, but I really enjoyed it.', ['tried', 'was', 'was']],
          ['I ____ (take) lots of photos. What ____ (do) you do on your holiday? Where ____ (do) you go?', ['took', 'did', 'did']],
        ]),
        cat('What is in Simon\'s email? (Ex. 18)', 'Which features ARE in Simon\'s email and which are NOT?', { y: 'Yes – in the email', n: 'No – not in the email' }, [
          ['He uses a greeting to start the email.', 'y'], ['He says where he went on holiday.', 'y'], ['He says how he travelled there.', 'n'], ['He says how long he stayed.', 'n'],
          ['He says what he did on holiday.', 'y'], ['He says what he usually does on holiday.', 'y'], ['He asks about his friend\'s last holiday.', 'y'], ['He asks about his friend\'s next holiday.', 'n'], ['He finishes with his name at the end.', 'y'],
        ]),
        write('Write an email about a holiday (Ex. 19)', 'Your friend Hannah wants to know about your last holiday: where you went and what you did. Write an email to Hannah (150–175 words). In your email: (1) say where you went; (2) say what you did there; (3) ask Hannah about her last holiday.', {
          minWords: 140, maxWords: 190, mustUse: 4,
          targetStructures: ['went', 'visited', 'was', 'On the first day', 'usually', 'What did you', 'Where did you'],
          checklist: ['Lời chào (Hi Hannah,) và tên ở cuối', 'Nói đã đi đâu', 'Kể đã làm gì (theo ngày/thứ tự)', 'Hỏi Hannah về kỳ nghỉ của bạn ấy', 'Dùng đúng quá khứ đơn (động từ bất quy tắc)', '150–175 từ'],
          sampleAnswer: 'Hi Hannah,\n\nThanks for your email. I went to Da Nang with my family last summer and it was fantastic! We stayed in a small hotel near My Khe beach for five days.\n\nOn the first day, we swam in the sea and relaxed on the beach. The water was warm and very clean. On the second day, we went on a day trip to Hoi An. We walked around the old town, saw lots of beautiful old buildings and took hundreds of photos. In the evening, the streets were full of colourful lanterns. I usually don\'t like trying new food, but I tried cao lau, a traditional noodle dish, and it was delicious! On the last day, we visited the Marble Mountains and climbed to the top. It was hot and tiring, but the view was amazing.\n\nI really enjoyed the holiday and I want to go back next year. What about you? Where did you go on your last holiday and what did you do there?\n\nWrite soon,\nMinh',
          commonErrors: ['Dùng hiện tại cho việc đã qua (I go to Da Nang last summer)', 'Sai động từ bất quy tắc (buyed, eated, taked)', 'Quên hỏi lại Hannah'],
        }),
      ],
    },

    listening: {
      title: 'Listening: phỏng vấn trên radio',
      titleEn: 'Listening: interview task',
      minutes: 40,
      objectives: ['Gạch từ khoá trong câu hỏi và 3 lựa chọn', 'Nghe được TẤT CẢ các lựa chọn nhưng chỉ một trả lời đúng câu hỏi', 'Nghe điều kiện, con số, tuổi'],
      theory: [
        card('Nghe phỏng vấn — chọn đáp án', 'Interview task', {
          formula: ['Gạch **keyword** trong câu hỏi và trong **3 lựa chọn**.', 'Bạn có thể nghe **tất cả** keyword, nhưng chỉ **một** trả lời đúng câu hỏi.', 'Đáp án thường **không lặp lại đúng chữ** trong câu hỏi.'],
          usage: ['Ví dụ (Part 1): Anna không đi Mỹ vì không giỏi thể thao; học cả tiếng Pháp và Tây Ban Nha; đã từng đến Pháp → chọn Tây Ban Nha vì muốn đi **nơi mới** (C), không phải vì "chỉ học tiếng Tây Ban Nha" (B sai).'],
          notes: ['Cẩn thận với các con số gần nhau: two weeks / three weeks / four weeks; over 14 / 16.'],
        }),
      ],
      links: [
        { ref: 'listening:M0-U04-L1', title: 'Phỏng vấn Anna — Part 1 (Ex. 7–8)', note: 'Câu ví dụ: vì sao Anna chọn đi Tây Ban Nha?' },
        { ref: 'listening:M0-U04-L2', title: 'Phỏng vấn Anna — Part 2 (Ex. 9)', note: '5 câu trắc nghiệm về chương trình trao đổi văn hoá mùa hè.' },
      ],
      vocab: [
        ['take part in', 'tham gia', 'Anna took part in the exchange programme.'],
        ['programme', 'chương trình', 'The Summer Cultural Exchange Programme.'],
        ['option', 'lựa chọn', 'I had two options.'],
        ['instead', 'thay vào đó', 'I decided to go to Spain instead.'],
        ['countryside', 'vùng nông thôn', 'Her grandparents live in the countryside.'],
        ['last (v)', 'kéo dài', 'Most programmes last for two weeks.'],
        ['unfortunately', 'thật không may', 'I could only stay for two weeks, unfortunately.'],
        ['age requirement', 'yêu cầu về độ tuổi', 'There are some age requirements.'],
        ['orchestra', 'dàn nhạc', 'You have to play in the school orchestra.'],
        ['recommend', 'giới thiệu, khuyên dùng', 'Would you recommend this programme?'],
        ['homesick', 'nhớ nhà', 'I felt a bit homesick at first.'],
        ['welcoming', 'thân thiện, niềm nở', 'They were so friendly and welcoming.'],
        ['improve', 'cải thiện', 'My language skills have improved a little.'],
      ],
      ex: [
        mcq('Why is C the correct answer? (Ex. 8)', 'Read Part 1 and answer the question.', [
          ['Why did Anna decide to go on a language exchange programme in Spain?', ['She is good at sports.', 'She studies Spanish and not French.', 'She wanted to go somewhere new.'], 'C', '"I\'ve been to France before, so I decided to go to Spain instead." A sai (không giỏi thể thao); B sai (học CẢ tiếng Pháp và Tây Ban Nha).'],
        ], { stimulus: passage(PART1.split('\n').slice(-1)[0].replace('Anna: ', ''), { caption: 'Part 1 (tr. 51)' }) }),
      ],
    },

    speaking: {
      title: 'Speaking: thêm chi tiết, lý do & kể trải nghiệm',
      titleEn: 'Speaking: adding more detail and giving reasons · experiences',
      minutes: 45,
      objectives: ['Nối ý bằng as / so / because để thêm lý do và kết quả', 'Nói 1–2 phút về một chuyến đi bạn thích (giống IELTS Part 2)', 'Phân biệt trip – journey – travel'],
      theory: [
        card('AS – SO – BECAUSE', 'Giving reasons', {
          formula: ['**because / as** + LÝ DO: I didn\'t go to the USA **because** I\'m not very good at sports. · **As** I love animals, it was a good experience.', '**so** + KẾT QUẢ: The family had a daughter my age, **so** we had a lot of fun together.'],
          usage: ['**As** thường đứng **đầu câu** (As + lý do, kết quả). **Because** thường đứng **giữa câu**.', 'Thêm lý do giúp câu trả lời dài hơn và được đánh giá cao hơn.'],
        }),
        card('Bài nói Part 2: kể về một chuyến đi', 'Exam speaking task — your own experiences', {
          formula: ['**Đề**: Describe a trip you really liked. You should say: where you went · what you did · why you went · why you liked it so much.'],
          usage: ['Dùng **1 phút chuẩn bị** để ghi từ khoá — KHÔNG viết lên thẻ đề.', 'Theo đúng thứ tự gợi ý trên thẻ; nói **gần 2 phút**; có **ví dụ và lý do**.', '**trip** = chuyến đi (du lịch/công tác) · **journey** = hành trình di chuyển từ A đến B · **travel** (động từ) = đi lại, du lịch.'],
        }),
      ],
      vocab: [
        ['as', 'vì (đầu câu)', 'As I love animals, it was a good experience.'],
        ['so', 'vì vậy', 'She spoke good English, so I was worried.'],
        ['because', 'bởi vì', "I didn't go because I'm not good at sports."],
        ['trip', 'chuyến đi', 'Describe a trip you really liked.'],
        ['journey', 'hành trình', 'The journey to Da Lat took eight hours.'],
        ['travel (v)', 'đi lại, du lịch', 'I love to travel with my friends.'],
        ['experience', 'trải nghiệm', 'It was a really good experience.'],
        ['the main reason', 'lý do chính', 'The main reason I went was…'],
        ['I\'ll never forget', 'tôi sẽ không bao giờ quên', "I'll never forget the view from the top."],
        ['in the end', 'cuối cùng', 'In the end, we stayed for three days.'],
      ],
      ex: [
        match('Match the sentence halves (Ex. 10)', 'Match the two halves of the sentences from what Anna says.', [
          ['I didn\'t go to the USA', 'because I\'m not very good at sports.'],
          ['The family had a daughter my age called Carmen,', 'so we had a lot of fun together.'],
          ['As I love animals', 'it was a really good experience for me.'],
          ['Carmen spoke really good English,', 'so I was worried that I wouldn\'t improve my Spanish.'],
        ]),
        mcq('As, so or because? (Ex. 11, G&V Ex. 8)', 'Choose the correct linking word.', [
          ['I didn\'t go on the language exchange ____ my language level wasn\'t high enough.', ['because', 'so'], 'A', 'Theo sau là LÝ DO.'],
          ['____ we enjoy kayaking, we decided to go on an adventure holiday this year.', ['As', 'So'], 'A', 'As + lý do ở đầu câu.'],
          ['The host family spoke English really well ____ I wasn\'t worried.', ['so', 'because'], 'A', 'Theo sau là KẾT QUẢ.'],
          ['We prefer city breaks ____ we enjoy exploring new places.', ['so', 'because'], 'B'],
          ['____ my parents enjoy trying traditional food, they went on a food tour.', ['So', 'As'], 'B'],
        ]),
        speak('Speaking: give reasons (Ex. 12)', 'Answer each question in 20–30 seconds. Use as / so / because to explain.', 1, [
          ['If you were on a language exchange, would you like to stay with a host family or in a hotel? Why?', 'I would definitely prefer a host family, because I could practise speaking English every day. As they know the area well, they could also show me interesting places that tourists don\'t usually see.', 'because + as, có hai lý do.'],
          ['What do you like more – holidays with your friends or holidays with your family? Why?', 'I like holidays with my friends more because we like the same activities, so we never get bored. With my family, we usually just relax at the beach, which is nice but a bit boring for me.', 'So sánh hai lựa chọn.'],
          ['What\'s better: a beach holiday or a city break? Why?', 'For me, a city break is better. As I love history and old buildings, I always want to visit museums. I get bored quickly on the beach, so I don\'t often choose beach holidays.', 'As + so.'],
        ]),
        speak('Speaking: a trip you really enjoyed (Ex. 22–23)', 'Read the task, prepare for one minute (make notes), then speak for 1–2 minutes.', 2, [
          ['Describe a trip you really liked.\nYou should say:\n• where you went\n• what you did on the trip\n• why you went\nand explain why you liked it so much.', 'I\'d like to talk about a trip to Da Lat that I went on with my classmates last December. Da Lat is a city in the mountains in the south of Vietnam, and it\'s famous for its cool weather and flowers. We went there because it was the end of our school term and our teacher organised a trip to celebrate. We travelled by coach and the journey took about seven hours, so we sang songs and played games on the way. During the trip, we visited a beautiful flower garden, walked around Xuan Huong Lake and went to the night market, where I tried grilled rice paper for the first time. It was delicious! On the second day, we got up very early to watch the sunrise from a hill, and that was amazing. I liked this trip so much because I spent time with my best friends without our parents for the first time, so I felt very free and grown-up. Also, as the weather in my city is always hot, it was really nice to wear a jacket and feel cold. I\'ll never forget it.', 'Đi đủ 4 ý trên thẻ theo thứ tự; nhiều chi tiết (thời gian, ai, phương tiện, món ăn); dùng because / so / as cho phần giải thích.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 4: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 4',
      minutes: 30,
      objectives: ['Ôn hoạt động du lịch, tính từ mô tả và quá khứ đơn của Unit 4'],
      ex: [
        gap('Holiday activities (G&V Ex. 3)', 'Complete the sentences with: visit water parks, go on day trips, go shopping, go horse-riding, go on a cycling tour, go on a cultural visit, visit a beach resort, go mountain climbing, visit local attractions, stay with a host family.', [
          ['We often ____ in the airport where you can buy things more cheaply.', 'go shopping'],
          ['When I visit my aunt, we often ____ in the countryside. I love animals.', 'go horse-riding|go horse riding'],
          ['You can ____ like a 9th century castle in my town.', 'visit local attractions'],
          ['Families like to ____ when the weather is hot so they can cool down.', 'visit water parks'],
          ['You can ____ by coach to the countryside from the city.', 'go on day trips'],
          ['It is often cheaper to ____ in their own home than in a hotel.', 'stay with a host family'],
          ['If you are fit, a good way to see more of a country is to ____.', 'go on a cycling tour'],
          ['You shouldn\'t ____ alone as it can be a dangerous sport.', 'go mountain climbing'],
          ['When you ____ in a city, you have the chance to see museums and art galleries.', 'go on a cultural visit'],
          ['If you ____ you can enjoy being by the sea.', 'visit a beach resort'],
        ]),
        gap('Describing adjectives (G&V Ex. 4)', 'Complete the sentences with: boring, local, natural, traditional, famous, cultural, fun, popular, delicious, interesting.', [
          ['The USA is a very ____ country to visit. Last year, it had over a million visitors.', 'popular'],
          ['I think it is more ____ to go on holiday with friends than with family.', 'fun'],
          ['I would prefer to see animals in their ____ environment than in a zoo.', 'natural'],
          ['On a language exchange, you can learn a lot about the ____ area where your host family lives.', 'local'],
          ['A lot of people like to go to the beach for holidays, but I find it ____.', 'boring'],
          ['I prefer to do ____ activities on holiday, like visiting museums and art galleries.', 'cultural'],
          ['Barcelona has a lot of ____ buildings. Many of them were designed by Antoni Gaudí.', 'interesting'],
          ['On the last night of my holiday, I ate the most ____ meal in a restaurant by the sea.', 'delicious'],
          ['The Eiffel Tower is the most ____ building in Paris.', 'famous'],
          ['I love to eat ____ food when I go on holiday.', 'traditional'],
        ], { wordBank: ['boring', 'local', 'natural', 'traditional', 'famous', 'cultural', 'fun', 'popular', 'delicious', 'interesting'] }),
        match('Match the sentence halves (G&V Ex. 7)', 'Match the two halves of the sentences.', [
          ['I go to French lessons', 'twice a week.'], ['The weather in Stockholm wasn\'t very nice', 'when we visited in December.'],
          ['I\'m not good at sport', 'but I enjoy hiking and horse-riding.'], ['Did you decide to', 'stay with a host family?'], ['Are you good', 'at sailing?'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U04-R1',
      title: 'Mindset 0 · Unit 4 — Which holiday is best?',
      content: '<p><em>You are going to read about some people who want to book a holiday. First, read the descriptions of eight different types of holiday.</em></p>\n\n' +
        HOLIDAYS.map(([t, d], i) => '<p><strong>' + 'ABCDEFGH'[i] + ' ' + t + '</strong><br>' + d + '</p>').join('\n\n'),
      questionGroups: [
        qMatch(1, 'Read what type of holiday each person wants to go on. Choose the best holiday, A–H, for each person. (Example: Tom is 19 and is very active… → D Adventure Holidays)', HOLIDAYS.map(([t]) => t.charAt(0) + t.slice(1).toLowerCase()), [
          ['Julia is 16 and would like to go on holiday with her best friend from school during the summer holidays. They want to travel to a new place, visit local attractions and try new food. Their parents will not allow their daughters to be in another country without any adults, but they will allow them to travel on their own. Julia and her friend both study Spanish at school and are planning to take a Spanish exam next year.', 'F', 'Language Exchange: ở với host family (có người lớn ở nước ngoài — bố mẹ cho phép), luyện nói tiếng, nấu món truyền thống, thăm điểm du lịch địa phương, khám phá châu Âu (Tây Ban Nha). City Breaks/Food Tours không có người lớn chăm sóc (MINI TIP 05.1).'],
          ['Charlie is 21 years old and has just finished university. He would like to spend the summer doing something interesting with some friends before they start looking for jobs. He prefers holidays in the countryside to holidays in cities or at the beach. He thinks that he would like to get a job working with animals in the future.', 'A', 'Điều quan trọng nhất: muốn làm việc với động vật (MINI TIP 05.2) + thích nông thôn → Wildlife Experience: "learn about nature… local wildlife in its natural environment".'],
          ['Joanna is 32 and works as a teacher. She wants to book a holiday in August with her husband. She is usually very tired after a busy term at school and would like to go somewhere hot and near the sea. She wants to relax and not do very much.', 'E', 'Hai điều cô ấy cần (MINI TIP 05.3): gần biển + thư giãn → Beach Escape: "perfect holiday for people who simply want to relax… beach resorts". Sailing Experience gần biển nhưng phải học → không thư giãn.'],
          ['Roger is 50 and wants to book a holiday for his wife and two children. They would like to do some cultural activities, such as visiting museums and art galleries, but also some fun activities to entertain the children. They also love shopping.', 'B', 'Fun Family Holidays: zoos, water parks (vui cho trẻ) + museums, art galleries + shopping centres. City Breaks chỉ có văn hoá, không có hoạt động cho trẻ và mua sắm (MINI TIP 05.4).'],
        ], { title: 'Questions 1–4', optionsTitle: 'Holidays' }),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U04-L1',
      title: 'Mindset 0 · Unit 4 — Radio interview with Anna (Part 1)',
      description: 'A travel show interview about the Summer Cultural Exchange Programme — Part 1.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_06.mp3',
      transcript: PART1,
      questionGroups: [
        qMcq(1, 'Listen to Part 1 of the interview and choose the correct answer, A, B or C.', [
          ['Why did Anna decide to go on a language exchange programme in Spain?', ['She is good at sports.', 'She studies Spanish and not French.', 'She wanted to go somewhere new.'], 'C', lx('Vì sao Anna chọn đi trao đổi ngôn ngữ ở Tây Ban Nha?', 'Câu trả lời đầu tiên của Anna.', ["I didn't go to the USA because I'm not very good at sports", 'I study French and Spanish at school, so I had two options', "I've been to France before, so I decided to go to Spain instead"], 'Nghe được keyword của cả 3 lựa chọn: sports (A sai — không giỏi thể thao), Spanish (B sai — học cả tiếng Pháp), đã đi Pháp rồi nên chọn nơi mới → C.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M0-U04-L2',
      title: 'Mindset 0 · Unit 4 — Radio interview with Anna (Part 2)',
      description: 'A travel show interview about the Summer Cultural Exchange Programme — Part 2.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_07.mp3',
      transcript: PART2,
      questionGroups: [
        qMcq(1, 'Listen to Part 2 of the radio interview. For each question, choose the correct answer, A, B or C.', [
          ["Where did Anna's host family live?", ['in an apartment', 'in a house', 'on a farm'], 'B', lx('Gia đình bản xứ của Anna sống ở đâu?', 'Câu trả lời đầu tiên của Part 2.', 'Most people in the city live in apartments, but my host family lived in a big house', 'apartment là nhà của "most people"; farm là nhà ông bà Carmen → B.')],
          ['How long did Anna stay with her host family?', ['two weeks', 'three weeks', 'four weeks'], 'A', lx('Anna ở với gia đình bản xứ bao lâu?', 'Khi nói về độ dài chương trình.', 'I went on a language exchange to Spain in July, so I could only stay for two weeks, unfortunately', '3 tuần là nếu đi tháng 8; 4 tuần là chương trình thể thao/âm nhạc → A.')],
          ['How old do students have to be to take part in the language exchange programme?', ['13', 'over 14', '16'], 'B', lx('Học sinh phải bao nhiêu tuổi để tham gia chương trình trao đổi ngôn ngữ?', 'Phần "age requirements".', 'You must be over the age of fourteen to take part in the language exchange programme and sixteen for the sports and music exchange programme', '16 là của chương trình thể thao/âm nhạc → B.')],
          ['Students can go on the language exchange programme if', ['they are 16 or over and their parents allow them.', 'they study a language like French or Spanish at school.', 'they play in a school sports team or in the school orchestra.'], 'B', lx('Học sinh được đi chương trình trao đổi ngôn ngữ nếu…', 'Cuối phần điều kiện.', 'You can only take part in the language exchange programme if you study French or Spanish', 'C là điều kiện của chương trình thể thao/âm nhạc → B.')],
          ['Anna thinks that her Spanish', ["hasn't improved.", 'has improved a little.', 'has improved a lot.'], 'B', lx('Anna nghĩ tiếng Tây Ban Nha của mình…', 'Cuối bài.', 'My language skills have improved a little bit', '"a little bit" → B.')],
        ], 'Questions 1–5'),
      ],
    },
  ],
};
