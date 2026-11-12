// Mindset for IELTS Foundation — Unit 6: Transport and places in town (pp. 70–79)
const { mcq, gap, match, cat, write, speak, passage, picture, card, qMcq, qNote, lx } = require('../dsl');

const PART1 = `Presenter: Hello everyone and welcome to this talk about Northfields' Shopping Centre. It opens next weekend and I'm very excited to be able to tell you about it tonight. It's a beautiful building, full of light and colour and a wonderful place to spend time in. It was designed by a prize-winning architect – John Gadzen. That's G-A-D-Z-E-N. Have a look at his website – he's done some fantastic work.
Northfields is just outside town, on Forest Drive. If you're coming by car and want to use your sat nav, then the postcode is WT3 5BX. That's the easiest way to do it; it works better than using the address.
We are open seven days a week, and our opening hours are ten am until six pm every day except Thursday. That's when we have late-night shopping until 8:00 pm. We're planning to open late on Wednesdays too, but that won't happen until we see how popular the centre is.
There are lots of ways to get to us. We have a large car park, which at the moment is free to use. You can also come by bus from the town centre. Bus 635 brings you to the entrance. There's also bus 729, but that stops further away and it's a five-minute walk to the shopping centre. And of course, you can use the underground. A ticket from town is only £3.50. The bus costs £2.00, so the underground is a bit more expensive but much faster. From the town centre, it only takes fifteen minutes!`;

const PART2 = `Presenter: OK, now let me show you a map of the shopping centre. As you can see, there are two floors. On the first floor there's a cinema, where you can see some great movies. And opposite that, in a smaller area, there are lots of places to eat and drink. There are fast-food restaurants as well, if you don't have time to sit and eat.
All the shops are on the ground floor. The biggest shop is the supermarket. If you use the car park entrance, it's the last shop on your right. Then, all the way over on the other side of the building, is the second biggest shop – Green's department store. You can get almost anything in there, including gifts, things for the kitchen, and furniture.
Also on the ground floor is a pharmacy selling medicine, and health and beauty products. You'll find it between the men's and women's clothes shop and the café. Male and female toilets are also on this floor, which is on the same side as the café. There's also a great book store selling everything you might need for school. If you're coming from the car park entrance, that's the second shop on your right, next to the sports shop. Oh, and if you need a mobile phone, that's the smallest shop in the shopping centre – between the bank and the shoe shop. You can get all the latest mobile phones there. So I hope you'll all visit Northfields' soon and that you'll have a great time here!`;

const SIGNS = [
  ['1 — Notice', 'PARKING FOR SUPERMARKET CUSTOMERS ONLY. Free for two hours – after that £2 an hour.'],
  ['2 — Message', 'Hi Tom, Jim and I are playing football in the park today. Do you want to join us? We\'ll get on the bus at the town centre at 12:30pm. Let me know, Harry'],
  ['3 — Notice', 'Trains travelling north out of this station are delayed because of heavy snow.'],
  ['4 — Email (To: Su, From: Lee, Subject: Holiday plans)', 'I just checked and there are seats available on the flight we want. Let\'s book them soon before the price gets too expensive!'],
  ['5 — Postcard', 'Hi Deon, I went sightseeing around the city today on an open top bus. We visited the museum and the castle along the way. We\'re going on a boat trip tomorrow and we\'ll be back home on Friday. George'],
  ['6 — Notice (Milltown Station)', 'Bicycles should be left in the bicycle stands only. For advice, please speak to a member of staff, who can give more details.'],
  ['7 — Message', 'Alice, how are you going to the theatre tonight? It\'s close enough for me to walk but Tim\'s going by car and he\'s offered to drive me. Let him know if you want him to drive you, too. Sonia'],
];

module.exports = {
  n: 6,
  title: 'Transport and places in town',
  titleVi: 'Giao thông & địa điểm trong thành phố',
  pages: '70–79',
  outcomes: [
    'Gọi tên địa điểm trong thành phố và phương tiện giao thông',
    'Đọc biển báo, tin nhắn ngắn để tìm ý chính',
    'Nghe điền thông tin (tên, mã bưu chính, giờ, số xe buýt) và nghe chỉ vị trí trên bản đồ',
    'Dùng so sánh hơn và so sánh nhất',
    'Viết email khoảng 100 từ giới thiệu nơi nên đến và cách đi lại',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: địa điểm & phương tiện',
      titleEn: 'Lead-in · Reading and vocabulary',
      minutes: 35,
      objectives: ['Gọi tên các công trình nổi tiếng: bridge, stadium, statue, castle, tower', 'Phân loại từ: địa điểm trong thành phố / giao thông', 'Ghép hoạt động với địa điểm (post office, library, station…)'],
      images: ['media:m0u06-landmarks.jpg|Lead-in (tr. 70): statue, castle, stadium, tower, bridge'],
      theory: [
        card('Địa điểm & giao thông', 'Places in a city · Travel and transport', {
          usage: [
            '**Places**: square (quảng trường), post office (bưu điện), police station (đồn cảnh sát), library (thư viện), sports centre (trung tâm thể thao), shopping centre (trung tâm mua sắm), department store (cửa hàng bách hoá), car park (bãi đỗ xe), museum, theatre, castle',
            '**Transport**: motorway (đường cao tốc), motorbike, coach (xe khách đường dài), platform (sân ga), ticket, the underground (tàu điện ngầm), flight, boat trip',
          ],
          notes: ['go **by** bus / car / train / bike — nhưng go **on foot** = walk. "the underground" ở London = "the subway" (Mỹ).'],
        }),
      ],
      vocab: [
        ['bridge', 'cây cầu', 'Sydney Harbour Bridge is in Australia.'],
        ['stadium', 'sân vận động', "The Bird's Nest stadium is in Beijing."],
        ['statue', 'bức tượng', 'The Statue of Liberty is in New York.'],
        ['castle', 'lâu đài', 'We visited the castle along the way.'],
        ['tower', 'toà tháp', 'The Leaning Tower of Pisa is in Italy.'],
        ['square', 'quảng trường', 'Let\'s meet in the main square.'],
        ['post office', 'bưu điện', 'Go to the post office to send a parcel.'],
        ['police station', 'đồn cảnh sát', 'You speak to a policeman at the police station.'],
        ['library', 'thư viện', 'You borrow books from the library.'],
        ['department store', 'cửa hàng bách hoá', "Green's department store sells almost everything."],
        ['car park', 'bãi đỗ xe', 'The car park is free to use.'],
        ['motorway', 'đường cao tốc', 'Cars drive fast on the motorway.'],
        ['coach', 'xe khách', 'You can go by coach to the countryside.'],
        ['platform', 'sân ga', 'The train leaves from platform 2.'],
        ['the underground', 'tàu điện ngầm', 'The underground is fast but expensive.'],
        ['monument', 'đài tưởng niệm, di tích', 'Are there any famous monuments in your town?'],
      ],
      ex: [
        match('Famous places (Lead-in Ex. 1–2)', 'Match pictures 1–5 with the words: statue, castle, stadium, tower, bridge.', [
          ['Picture 1 (Sydney Harbour, Australia)', 'bridge'], ['Picture 2 (Bird\'s Nest, China)', 'stadium'], ['Picture 3 (Liberty, USA)', 'statue'], ['Picture 4 (Neuschwanstein, Germany)', 'castle'], ['Picture 5 (Pisa, Italy)', 'tower'],
        ], { stimulus: picture('media:m0u06-landmarks.jpg', 'Lead-in') }),
        cat('Places or transport? (Ex. 4–5)', 'Put each word into the correct group.', { place: 'Places in a city', travel: 'Travel and transport' }, [
          ['square', 'place'], ['post office', 'place'], ['police station', 'place'], ['library', 'place'], ['sports centre', 'place'], ['department store', 'place'], ['museum', 'place'], ['theatre', 'place'],
          ['motorway', 'travel'], ['motorbike', 'travel'], ['coach', 'travel'], ['platform', 'travel'], ['ticket', 'travel'], ['the underground', 'travel'], ['flight', 'travel'], ['boat trip', 'travel'],
        ]),
        match('Where do you go to…? (G&V Ex. 1)', 'Match the activities with the places.', [
          ['send a parcel', 'post office'], ['stay for a few days', 'hotel'], ['speak to a policeman', 'police station'], ['exercise', 'sports centre'], ['have a meal', 'restaurant'],
          ['do some food shopping', 'supermarket'], ['catch a bus or a train', 'station'], ['relax on the grass', 'park'], ['borrow a book', 'library'], ['look at things from the past', 'museum'],
        ]),
        match('Which place is it? (G&V Ex. 2)', 'Match each group of words with a place or thing.', [
          ['seat · ticket · platform · travel', 'train'], ['lift · floor · clothes · toys', 'department store'], ['cars · road · sign · fast', 'motorway'],
          ['coffee · snack · talk · table', 'cafe'], ['houses · cars · bikes · neighbours', 'street'], ['history · visitors · building · museum', 'castle'], ['flight · plane · passenger · pilot', 'airport'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: biển báo & tin nhắn ngắn',
      titleEn: 'Reading and vocabulary: signs, notices and messages',
      minutes: 40,
      objectives: ['Đọc văn bản ngắn thực tế (biển báo, tin nhắn, bưu thiếp, email)', 'Tìm Ý CHÍNH — không bị lừa bởi lựa chọn dùng lại từ của văn bản', 'Xác định mục đích người viết'],
      images: ['media:m0u06-signs.jpg|Ex. 5 (tr. 71): biển báo và tin nhắn'],
      theory: [
        card('Đọc văn bản ngắn thực tế', 'Signs, notices and messages', {
          formula: ['Đọc **toàn bộ** văn bản → hỏi: **ai viết? cho ai? để làm gì?**', 'Gạch **từ khoá** quyết định nghĩa: Free for **two hours**, **delayed**, **Let him know**…', 'So sánh từng lựa chọn với **ý chính** — loại lựa chọn đúng chi tiết nhưng sai mục đích.'],
          usage: [
            'MINI TIP 06.1: các lựa chọn đều dùng từ của biển báo — hãy chọn cái khớp **ý nghĩa**. "Free for two hours" = không phải trả tiền nếu mua sắm xong trong 2 tiếng.',
            'MINI TIP 06.2: tin nhắn có nói nơi và giờ đá bóng, nhưng **lý do viết** là để **mời** Tom.',
          ],
        }),
      ],
      links: [{ ref: 'reading:M0-U06-R1', title: 'Signs and messages — 7 văn bản ngắn (Ex. 5–6)', note: 'Chọn A, B hoặc C: văn bản này nói gì / người viết muốn gì?' }],
      vocab: [
        ['customer', 'khách hàng', 'Parking for supermarket customers only.'],
        ['delayed', 'bị hoãn, trễ', 'Trains are delayed because of heavy snow.'],
        ['heavy snow', 'tuyết rơi dày', 'Trains are late because of heavy snow.'],
        ['available', 'còn trống, có sẵn', 'There are seats available on the flight.'],
        ['open top bus', 'xe buýt mui trần', 'I went sightseeing on an open top bus.'],
        ['along the way', 'trên đường đi', 'We visited the castle along the way.'],
        ['bicycle stand', 'chỗ để xe đạp', 'Leave bicycles in the bicycle stands.'],
        ['member of staff', 'nhân viên', 'Speak to a member of staff.'],
        ['offer to', 'đề nghị (giúp)', "He's offered to drive me."],
        ['give somebody a lift', 'cho ai đi nhờ xe', 'Tim can give you a lift.'],
        ['join', 'tham gia cùng', 'Do you want to join us?'],
        ['crowded / full of', 'đông đúc', 'The centre was full of people.'],
      ],
      ex: [
        mcq('Sally\'s shopping story (G&V Ex. 4)', 'Choose the correct word.', [
          ['Sally and her friend had nothing to do and they felt a bit ____.', ['bored', 'sorry', 'heavy'], 'A'],
          ['They decided to go to the shopping centre to get some ____ clothes.', ['latest', 'new', 'early'], 'B'],
          ['The shopping centre had all of Sally\'s ____ shops.', ['popular', 'favourite', 'great'], 'B'],
          ['It was the weekend, and the centre was ____ of people.', ['full', 'busy', 'crowded'], 'A', 'full of = đầy; busy/crowded không đi với "of".'],
          ['Sally was ____ not to spend too much money.', ['worried', 'ready', 'careful'], 'C', 'be careful not to + V.'],
          ['After a couple of hours, Sally and her friend felt ____, so they went to a café to relax.', ['wrong', 'difficult', 'tired'], 'C'],
          ['They had a drink and a ____ snack and then went home.', ['right', 'healthy', 'fast'], 'B'],
        ]),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: So sánh hơn & so sánh nhất',
      titleEn: 'Grammar: comparatives and superlatives',
      minutes: 45,
      objectives: ['Tạo so sánh hơn / nhất cho tính từ 1 âm tiết, 2+ âm tiết, tận cùng -y, bất quy tắc', 'Dùng than với so sánh hơn và the với so sánh nhất', 'Viết câu so sánh về một thành phố'],
      keyLanguage: [
        '1 âm tiết: small → smaller → the smallest · phụ âm–nguyên âm–phụ âm: big → bigger → the biggest',
        '2+ âm tiết: expensive → more expensive (than) → the most expensive',
        '2 âm tiết tận cùng -y: easy → easier → the easiest · happy → happier → the happiest',
        'Bất quy tắc: good → better → the best · bad → worse → the worst · far → further → the furthest · much/many → more → the most',
      ],
      links: [{ grammar: 'comparisons', title: 'Comparisons', note: 'so sánh hơn, so sánh nhất, as … as' }],
      ex: [
        gap('Comparative and superlative forms (Ex. 13)', 'Write the comparative and superlative forms.', [
          ['tall → ____ / the ____', ['taller', 'tallest']], ['famous → ____ / the ____', ['more famous', 'most famous']], ['hot → ____ / the ____', ['hotter', 'hottest']],
          ['busy → ____ / the ____', ['busier', 'busiest']], ['interesting → ____ / the ____', ['more interesting', 'most interesting']], ['friendly → ____ / the ____', ['friendlier|more friendly', 'friendliest|most friendly']],
          ['old → ____ / the ____', ['older', 'oldest']], ['thin → ____ / the ____', ['thinner', 'thinnest']],
        ]),
        mcq('Facts about Manchester (Ex. 14)', 'Choose the correct form.', [
          ['Manchester is in the north of England and is the UK\'s fifth ____ city.', ['largest', 'larger'], 'A', 'the + fifth + so sánh nhất.'],
          ['Manchester has ____ students than any other city in the world.', ['most', 'more'], 'B', 'than → so sánh hơn.'],
          ['Manchester\'s Chetham\'s Library is the ____ public library in the English-speaking world.', ['old', 'oldest'], 'B'],
          ['____ languages are spoken in Manchester than any other city in Western Europe.', ['Many', 'More'], 'B'],
          ['The world\'s ____ passenger train station was built in Manchester in 1830.', ['first', 'last'], 'A'],
          ['Recently, Manchester was voted the ____ UK city to live in.', ['better', 'best'], 'B'],
          ['Manchester airport is ____ than Birmingham airport.', ['larger', 'largest'], 'A'],
          ['Manchester United is the ____ successful football club in England.', ['more', 'most'], 'B'],
          ['Manchester Piccadilly is one of the ____ train stations in England.', ['busy', 'busiest'], 'B', 'one of the + so sánh nhất + danh từ số nhiều.'],
          ['____ than 20 Nobel prize winners have come from Manchester.', ['More', 'Most'], 'A'],
        ]),
        cat('-er/-est or more/the most? (G&V Ex. 6)', 'Put the adjectives into the correct column.', { er: '+er / +est', more: 'more / the most' }, [
          ['clean', 'er'], ['low', 'er'], ['high', 'er'], ['cheap', 'er'], ['old', 'er'], ['new', 'er'], ['fast', 'er'], ['strong', 'er'],
          ['expensive', 'more'], ['modern', 'more'], ['comfortable', 'more'], ['difficult', 'more'], ['important', 'more'], ['careful', 'more'], ['interesting', 'more'], ['crowded', 'more'],
        ]),
        gap('Three cars (G&V Ex. 9)', 'Look at the pictures of three cars, A (1), B (2) and C (3), and complete the sentences with the superlative form.', [
          ['Car A is ____ (cheap).', 'the cheapest'], ['Car B has ____ (many) doors.', 'the most'], ['Car C has ____ (large) engine.', 'the largest'],
          ['Car A has ____ (many) kilometres on the clock.', 'the most'], ['Car C is ____ (expensive).', 'the most expensive'], ['Car A has ____ (small) engine.', 'the smallest'], ['Car B is ____ (old).', 'the oldest'],
        ], { stimulus: picture('media:m0u06-cars.jpg', 'Cars A, B, C (1, 2, 3)') }),
      ],
    },

    writing: {
      title: 'Writing: email giới thiệu đất nước bạn',
      titleEn: 'Writing: a longer piece of continuous writing',
      minutes: 45,
      objectives: ['Lập dàn ý trả lời TẤT CẢ câu hỏi trong email của bạn', 'Dùng tính từ so sánh nhất để giới thiệu địa điểm', 'Viết email ~100 từ, nối ý bằng if, so, because, after that'],
      theory: [
        card('Trả lời email: nên đi đâu, đi bằng gì', 'A longer piece of continuous writing', {
          formula: ['**Hi Sandy,** I\'m really pleased you\'re coming to visit my country.', '**Nơi 1 + lý do**: The first place you should visit is… It\'s one of the most famous… because…', '**Nơi 2 + lý do**: After that, you should go to… I think this is the most beautiful…', '**Cách đi lại**: The best way to travel is… · **Best wishes,** + tên'],
          usage: ['Sandy hỏi **3 câu**: nên đi đâu? vì sao thú vị? cách đi lại tốt nhất? → trả lời **đủ cả 3**.', 'Từ nối hữu ích: **if** (If you like shopping, …), **so**, **because**, **after that**.', 'Kiểm tra so sánh hơn/nhất, chính tả, dấu câu (Ex. 23).'],
        }),
      ],
      vocab: [
        ['pen-friend', 'bạn qua thư', 'This is an email from my pen-friend, Sandy.'],
        ['I\'m really pleased', 'tôi rất vui', "I'm really pleased you're coming."],
        ['you should visit', 'bạn nên đến thăm', 'The first place you should visit is Hanoi.'],
        ['one of the most famous', 'một trong những … nổi tiếng nhất', "It's one of the most famous cities in Asia."],
        ['perfect if you like', 'hoàn hảo nếu bạn thích', "It's perfect if you like shopping."],
        ['the best way to travel', 'cách đi lại tốt nhất', 'The best way to travel is by train.'],
        ['get around', 'đi lại (trong một nơi)', 'Use the buses to get around.'],
        ['fantastic', 'tuyệt vời', 'It has fantastic museums and parks.'],
        ['Best wishes', 'Thân chúc (câu kết thư)', 'Best wishes, Martin'],
        ['deep / deepest', 'sâu / sâu nhất', 'The largest and deepest lakes.'],
      ],
      ex: [
        gap('Describing adjectives (G&V Ex. 5)', 'Complete the sentences with the adjectives: friendly, high, comfortable, old, famous, interesting, modern.', [
          ['I didn\'t enjoy the flight because my seat was not at all ____.', 'comfortable'],
          ['The library looks very ____ – the building is made of glass and it is an unusual shape.', 'modern'],
          ['The staff at the hotel were always polite and ____.', 'friendly'],
          ['I\'m reading a very ____ book at the moment about the future of the planet.', 'interesting'],
          ['I bought some beautiful ____ jewellery from the market. It\'s from the 19th century.', 'old'],
          ['The mountain isn\'t very ____ but the views from the top are still amazing.', 'high'],
          ['I sat next to a well-known actor on the train. I had never seen a ____ person before that.', 'famous'],
        ], { wordBank: ['friendly', 'high', 'comfortable', 'old', 'famous', 'interesting', 'modern'] }),
        mcq('Martin\'s model email (Ex. 22)', 'Read the model email and answer the questions.', [
          ['Martin answers how many of Sandy\'s questions?', ['1', '2', 'all 3'], 'C', 'Nơi nên đến, vì sao thú vị, cách đi lại.'],
          ['Which sentence uses a superlative to say why a place is interesting?', ['The buses and the underground are the best ways to travel.', 'It\'s one of the most famous cities in the world.', 'You can get there by train.'], 'B'],
          ['Which linker introduces the second place?', ['After that', 'Because', 'If'], 'A'],
        ], { stimulus: passage('Hi Sandy,\n\nI\'m really pleased you\'re coming to visit my country. The first place you should visit is London. It\'s one of the most famous cities in the world. It has fantastic museums and parks and is perfect if you like shopping. The buses and the underground are the best ways to travel.\n\nAfter that you should go to the Lake District. I think this is the most beautiful part of England. It has the highest mountains in the country and the largest and deepest lakes. You can get there by train and then use the buses to get around.\n\nBest wishes,\nMartin', { caption: 'Model answer' }) }),
        write('Write a reply to Sandy (Ex. 20–22)', 'This is part of an email from your penfriend Sandy: "I\'m coming to your country next month on holiday. Where do you think I should go and why are those places interesting? What\'s the best way for me to travel around?" Write a reply to Sandy (about 100 words). Begin: "Hi Sandy, I\'m really pleased you\'re coming to visit my country. The first place you should visit is…". Use comparatives and superlatives and the linking words if, so, because, after that.', {
          minWords: 90, maxWords: 140, mustUse: 3,
          targetStructures: ['the most', 'the best', 'because', 'After that', 'If you like'],
          checklist: ['Trả lời: nên đi đâu (ít nhất 2 nơi)', 'Giải thích vì sao các nơi đó thú vị', 'Nói cách đi lại tốt nhất', 'Dùng ít nhất 2 tính từ so sánh nhất', 'Mở đầu và kết thúc email đúng', 'Khoảng 100 từ'],
          sampleAnswer: 'Hi Sandy,\n\nI\'m really pleased you\'re coming to visit my country. The first place you should visit is Hanoi. It\'s the capital and one of the oldest cities in Vietnam. The Old Quarter is the most interesting part because the streets are full of small shops and delicious street food. If you like history, you should also visit the Temple of Literature.\n\nAfter that, you should go to Ha Long Bay. I think it\'s the most beautiful place in the country. You can take a boat trip and sleep on the boat. The best way to get there is by coach because it\'s cheaper than a taxi.\n\nBest wishes,\nNam',
          commonErrors: ['more beautiful than / the most beautiful dùng lẫn lộn', 'most famous thiếu "the"', 'Quên nói cách đi lại'],
        }),
      ],
    },

    listening: {
      title: 'Listening: điền thông tin & bản đồ',
      titleEn: 'Listening: gap-fill · map',
      minutes: 50,
      objectives: ['Nghe điền: tên riêng (đánh vần), mã bưu chính, ngày, số, thời gian', 'Dùng giới từ chỉ vị trí: next to, opposite, between, on the left/right of', 'Nghe mô tả và xác định vị trí các cửa hàng trên bản đồ'],
      images: ['media:m0u06-map.jpg|Ex. 10 (tr. 73): bản đồ Northfields\' shopping centre'],
      theory: [
        card('Nghe điền thông tin cụ thể', 'Gap-fill', {
          usage: ['Đọc câu hỏi trước để biết cần nghe **loại thông tin** gì: ngày trong tuần, giá, cách đánh vần, con số, mã bưu chính.', 'Luyện **bảng chữ cái** thường xuyên — tên riêng thường được đánh vần (G-A-D-Z-E-N).', 'Cẩn thận thông tin bị **thay đổi/phủ định**: muốn mở muộn thứ Tư "but that won\'t happen until…" → chỉ **thứ Năm** mở muộn.'],
        }),
        card('Giới từ chỉ vị trí', 'Prepositions of place', {
          usage: ['**next to** cạnh · **opposite** đối diện · **between** ở giữa (A và B) · **on the left of / on the right of** bên trái/phải của', '**in front of** phía trước · **behind** phía sau · **across the road from** bên kia đường · **on your left/right** (khi bạn đi tới) bên tay trái/phải'],
          examples: [['The pharmacy is between the clothes shop and the café.', 'Hiệu thuốc ở giữa cửa hàng quần áo và quán cà phê.'], ['It\'s the last shop on your right.', 'Đó là cửa hàng cuối cùng bên tay phải bạn.']],
        }),
      ],
      links: [
        { ref: 'listening:M0-U06-L1', title: 'Northfields\' Shopping Centre — Part 1 (Ex. 7–8)', note: 'Điền 5 thông tin: tên kiến trúc sư, mã bưu chính, ngày mở muộn, số tuyến xe buýt, thời gian đi tàu điện ngầm.' },
        { ref: 'listening:M0-U06-L2', title: 'Northfields\' Shopping Centre — Part 2 (Ex. 10)', note: 'Nhìn bản đồ và chọn chữ cái A–F cho 6 cửa hàng.' },
      ],
      vocab: [
        ['architect', 'kiến trúc sư', 'It was designed by a prize-winning architect.'],
        ['postcode', 'mã bưu chính', 'The postcode is WT3 5BX.'],
        ['opening hours', 'giờ mở cửa', 'Our opening hours are 10am until 6pm.'],
        ['late-night shopping', 'mua sắm đêm (mở cửa muộn)', 'Late-night shopping is on Thursday.'],
        ['entrance', 'lối vào', 'Bus 635 brings you to the entrance.'],
        ['pharmacy', 'hiệu thuốc', 'The pharmacy sells medicine.'],
        ['ground floor', 'tầng trệt', 'All the shops are on the ground floor.'],
        ['first floor', 'tầng 1 (trên tầng trệt)', 'The cinema is on the first floor.'],
        ['next to', 'bên cạnh', 'The book store is next to the sports shop.'],
        ['opposite', 'đối diện', 'The cafés are opposite the cinema.'],
        ['between', 'ở giữa', 'It is between the bank and the shoe shop.'],
        ['on your right', 'bên tay phải bạn', "It's the last shop on your right."],
        ['behind', 'phía sau', 'The park is behind the cinema.'],
        ['in front of', 'phía trước', 'The bus stop is in front of the park.'],
      ],
      ex: [
        match('Prepositions of place (Ex. 9)', 'Look at the five pictures (the red house and the building) and match each picture with a preposition.', [
          ['Diagram 1', 'on the left of'], ['Diagram 2', 'on the right of'], ['Diagram 3', 'opposite'], ['Diagram 4', 'next to'], ['Diagram 5', 'between'],
        ], { stimulus: picture('media:m0u06-prepositions.jpg', 'Ex. 9') }),
        gap('A town map (G&V Ex. 3)', 'Look at the map and complete the sentences with: next, in front of, on your left, behind, on your right, across, opposite, between.', [
          ['The park is ____ the cinema.', 'opposite'],
          ['The petrol station is ____ the road from the cinema.', 'across'],
          ['The post office is ____ the café and the hotel.', 'between'],
          ['The theatre is ____ the petrol station.', 'behind'],
          ['The sports centre is ____ to the hotel.', 'next'],
          ['When you come out of the hotel, the post office is ____.', 'on your right'],
          ['The bus stop is ____ the park.', 'in front of'],
          ['When you come out of the museum, the library is ____.', 'on your left'],
        ], { stimulus: picture('media:m0u06-town-map.jpg', 'Town map'), wordBank: ['next', 'in front of', 'on your left', 'behind', 'on your right', 'across', 'opposite', 'between'] }),
      ],
    },

    speaking: {
      title: 'Speaking: giao thông & quê hương',
      titleEn: 'Speaking: talking about transport and towns',
      minutes: 40,
      objectives: ['Hỏi đường và chỉ vị trí trên bản đồ', 'Trả lời câu hỏi về giao thông và quê hương, dùng so sánh hơn/nhất', 'Không trả lời quá ngắn — cho giám khảo thấy vốn từ của bạn'],
      theory: [
        card('Nói về giao thông và quê hương', 'Transport and hometown', {
          usage: ['Dùng **từ vựng của unit** (motorway, the underground, square, castle…) và **so sánh** (It\'s much faster than…, the oldest part of my town is…).', 'Trả lời **dài hơn** bằng lý do và ví dụ — đừng chỉ "By bus."', 'Hỏi đường: **Where\'s the…?** — **It\'s on the ground floor, opposite the café / between the bank and the shoe shop.**'],
        }),
      ],
      vocab: [
        ['traffic', 'giao thông, xe cộ', 'Traffic is a big problem in my city.'],
        ['traffic jam', 'kẹt xe', 'There are traffic jams every morning.'],
        ['hometown', 'quê nhà', 'My hometown is a small city by the sea.'],
        ['popular with tourists', 'được du khách yêu thích', 'Hoi An is very popular with tourists.'],
        ['the oldest part', 'khu cổ nhất', 'The oldest part of my town is the market.'],
        ['convenient', 'tiện lợi', 'Motorbikes are the most convenient way to travel.'],
        ['pollution', 'ô nhiễm', 'More buses would reduce pollution.'],
        ['public transport', 'phương tiện công cộng', 'We need better public transport.'],
      ],
      ex: [
        mcq('Asking for directions on a map (Ex. 12)', 'Use the map of Northfields (Part 2 of the recording) and choose the correct answer.', [
          ['Where\'s the mobile phone shop?', ['It\'s between the bank and the shoe shop.', 'It\'s next to the café.', 'It\'s on the first floor.'], 'A'],
          ['Where can I watch a film?', ['In the cinema on the first floor.', 'In Green\'s department store.', 'Next to the toilets.'], 'A'],
          ['Where is the book store?', ['The last shop on your right.', 'The second shop on your right from the car park entrance, next to the sports shop.', 'Opposite the cinema.'], 'B'],
        ], { stimulus: picture('media:m0u06-map.jpg', 'Northfields\' map') }),
        speak('Speaking: transport and your home town (Ex. 18)', 'Answer each question in 15–25 seconds. Use the vocabulary of this unit and comparatives/superlatives.', 1, [
          ['How did you travel here today?', 'I came by motorbike with my older brother. It only took about fifteen minutes, which is much faster than taking the bus, because the bus stops at so many places.', 'Phương tiện + thời gian + so sánh.'],
          ['How do people prefer to travel in your country?', 'Most people in Vietnam prefer motorbikes because they are cheap and you can go almost anywhere. In big cities, more people are starting to use the metro and buses now.', 'Ý chính + lý do + xu hướng mới.'],
          ['Is traffic a problem in your town?', 'Yes, definitely. In the morning and evening there are terrible traffic jams, especially near schools. I think the government should build more bus lanes.', 'Yes + ví dụ + gợi ý.'],
          ['Tell me about the most interesting places in your town.', 'The most interesting place is probably the old market in the centre. It\'s the oldest building in town and you can buy almost anything there. There\'s also a lovely park by the river, which is the best place to relax.', 'Hai địa điểm + so sánh nhất.'],
          ['How could you make your town better?', 'I think we need more green spaces and better public transport. If there were more buses, there would be less traffic and less pollution.', 'Hai đề xuất + kết quả.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 6: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 6',
      minutes: 30,
      objectives: ['Ôn so sánh hơn và so sánh nhất của Unit 6'],
      ex: [
        gap('Comparatives (G&V Ex. 7)', 'Complete the sentences with the comparative form of the adjective in brackets.', [
          ['I think trains are ____ (safe) and ____ (fast) than cars.', ['safer', 'faster']], ['The traffic is usually ____ (bad) in the city than in the countryside.', 'worse'],
          ['In London, the bus is ____ (cheap) than the trains.', 'cheaper'], ['The main square is ____ (old) than any other parts of the town.', 'older'],
          ['My old house was ____ (big) than the one I live in now.', 'bigger'], ['I live far from college so I have to get up ____ (early) than my friends.', 'earlier'],
          ['Our garden always looks ____ (pretty) in summer than in winter.', 'prettier'], ['My friend has lost weight and is much ____ (thin) than last year.', 'thinner'],
          ['It is ____ (good) for your health to cycle to work than get the bus.', 'better'], ['Jon lives ____ (far) away from me than Pete.', 'further|farther'],
        ]),
        gap('…but … is even more! (G&V Ex. 8)', 'Complete the sentences with the comparative form.', [
          ['My bike was expensive but my brother\'s was ____.', 'more expensive'], ['Art galleries are interesting but museums are ____.', 'more interesting'],
          ['Madrid is hot but Kuwait is ____.', 'hotter'], ['This garden is pretty but the one we saw yesterday was ____.', 'prettier'],
          ['This restaurant is good but the Italian one is ____.', 'better'], ['I was excited about the trip but my friend was ____.', 'more excited'],
          ['Cars are noisy but motorbikes are ____.', 'noisier'], ['I\'m bad at maths but my friend is ____.', 'worse'],
        ]),
        gap('William\'s email from Munich (G&V Ex. 10)', 'Put the adjectives in brackets into the comparative or superlative form.', [
          ['It isn\'t ____ (good) hotel in town but it is nice enough and it was ____ (cheap) than most of the others.', ['the best', 'cheaper']],
          ['…the Englischer Garten, a beautiful park that is ____ (big) than Central Park in New York!', 'bigger'],
          ['…the Deutsches Museum – one of ____ (large) in Europe. ____ (interesting) part for me was the space exhibition.', ['the largest', 'The most interesting']],
          ['The guidebook says it is one of ____ (fine) palaces in the whole of Germany.', 'the finest'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U06-R1',
      title: 'Mindset 0 · Unit 6 — Signs, notices and messages',
      content: '<p><em>Read the signs and messages.</em></p>\n\n<p style="text-align:center"><img src="media:m0u06-signs.jpg" alt="Signs and messages" style="max-width:100%;height:auto;border-radius:6px"></p>\n\n' + SIGNS.map(([h, t]) => '<p><strong>' + h + '</strong><br>' + t + '</p>').join('\n\n'),
      questionGroups: [
        qMcq(1, 'Read the signs and messages again. Choose the correct answer, A, B or C.', [
          ['What does the supermarket notice say?', ['You can pay £2 to leave your car in the supermarket car park all day.', 'Supermarket customers can only park here for 2 hours at a time.', "You don't need to pay if you finish shopping within 2 hours."], 'C', '"Free for two hours – after that £2 an hour" → mua sắm xong trong 2 tiếng thì không mất tiền. A sai (£2 MỖI GIỜ, không phải cả ngày); B sai (có thể đỗ lâu hơn nếu trả tiền). MINI TIP 06.1.'],
          ['Why did Harry write this message?', ['To give Tom and Jim instructions on how to get to the park.', 'To invite Tom to play football with him and Jim.', 'To find out what time Tom would like to play football.'], 'B', '"Do you want to join us?" = lời mời. Thông tin về xe buýt và giờ chỉ là chi tiết (MINI TIP 06.2).'],
          ['What is the notice telling passengers?', ['They should wait for news about the weather before travelling.', 'Some passengers will be late today because of the weather.', 'The station is closed until the weather improves.'], 'B', '"Trains travelling north… are delayed because of heavy snow" → một số (đi về phía bắc) sẽ đến muộn. Ga không đóng cửa (C).'],
          ['What does Lee suggest?', ['To book the flights as soon as possible.', 'To choose a less expensive flight.', "To change the date of his and Su's flight."], 'A', '"Let\'s book them soon before the price gets too expensive!" → đặt sớm.'],
          ['What does George say?', ['His sightseeing trip included a visit to a museum and castle.', 'He visited the castle and museum after going on the boat trip.', 'He hopes to do a boat trip and an open bus tour before returning home.'], 'A', '"We visited the museum and the castle along the way" (trong chuyến xe buýt). Boat trip là NGÀY MAI → B sai; xe buýt đã đi rồi → C sai.'],
          ['What are train passengers told at the station?', ['They must not leave bikes at the station.', 'Cycle parking is only for members of station staff.', 'If they need to know more, they can ask someone who works there.'], 'C', '"For advice, please speak to a member of staff, who can give more details" → hỏi nhân viên. Được để xe ở chỗ để xe (A sai).'],
          ['What should Alice do?', ['Contact Tim if she would like a lift to the theatre.', 'Tell Sonia what her travel plans are for this evening.', "Let Tim or Sonia know if she's going to the theatre."], 'A', '"Let **him** know if you want him to drive you" → liên hệ Tim nếu muốn đi nhờ xe.'],
        ], 'Questions 1–7'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U06-L1',
      title: "Mindset 0 · Unit 6 — Northfields' Shopping Centre (Part 1)",
      description: 'Information about a new shopping centre — Part 1.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_11.mp3',
      transcript: PART1,
      questionGroups: [
        qNote('Listen and complete the information. Write ONE WORD AND/OR A NUMBER for each answer.', "Northfields' shopping centre information", [
          'Name of architect who designed Northfields\': John __Q1__',
          'Address and postcode: Forest Drive, __Q2__',
          'Opening hours: 10am to 6pm',
          'Late night shopping until 8pm on __Q3__',
          'Transport — By car: free car park',
          'By bus: there are __Q4__ buses',
          'Underground: from the town centre it only takes __Q5__ minutes',
        ], { 1: 'Gadzen', 2: 'WT3 5BX / WT35BX', 3: 'Thursday / Thursdays', 4: '2 / two', 5: '15 / fifteen' }, {
          1: lx('Tên kiến trúc sư: John ___', 'Đầu bài.', "John Gadzen. That's G-A-D-Z-E-N", 'Tên được đánh vần — nghe từng chữ cái.'),
          2: lx('Địa chỉ và mã bưu chính: Forest Drive, ___', 'Khi nói về sat nav.', 'the postcode is WT3 5BX', 'Mã bưu chính Anh: chữ + số.'),
          3: lx('Mua sắm muộn tới 8pm vào ___', 'Phần giờ mở cửa.', ["every day except Thursday. That's when we have late-night shopping until 8:00 pm", "We're planning to open late on Wednesdays too, but that won't happen until…"], 'BẪY: thứ Tư chỉ là kế hoạch tương lai → Thursday.'),
          4: lx('Có ___ tuyến xe buýt', 'Phần giao thông.', ['Bus 635 brings you to the entrance', "There's also bus 729"], 'Hai tuyến 635 và 729 → 2. Đừng ghi số tuyến.'),
          5: lx('Tàu điện ngầm từ trung tâm chỉ mất ___ phút', 'Cuối Part 1.', 'From the town centre, it only takes fifteen minutes!', '£3.50 là giá vé, £2.00 là giá xe buýt → 15.'),
        }, 'Questions 1–5'),
      ],
    },
    {
      ref: 'M0-U06-L2',
      title: "Mindset 0 · Unit 6 — Northfields' Shopping Centre (Part 2)",
      description: 'Information about a new shopping centre — Part 2: the map.',
      partNumber: 2,
      audioFile: 'MindsetIELTS_Foundation_12.mp3',
      transcript: PART2,
      questionGroups: [
        qMcq(1, 'Look at the map of Northfields\' shopping centre. Listen and choose the correct letter, A–F, for each place.', [
          ['cinema', ['A', 'B', 'C', 'D', 'E', 'F'], 'F', lx('rạp chiếu phim', 'Đầu Part 2.', "On the first floor there's a cinema", 'Tầng 1 có 2 khu: khu nhỏ là Cafés and Restaurants (đã ghi), khu còn lại là F.')],
          ['supermarket', ['A', 'B', 'C', 'D', 'E', 'F'], 'C', lx('siêu thị', 'Phần tầng trệt.', ["The biggest shop is the supermarket. If you use the car park entrance, it's the last shop on your right"], 'Cửa hàng lớn nhất, cuối cùng bên phải từ lối vào bãi đỗ xe → C.')],
          ["Green's department store", ['A', 'B', 'C', 'D', 'E', 'F'], 'A', lx('cửa hàng bách hoá Green\'s', 'Ngay sau siêu thị.', 'all the way over on the other side of the building, is the second biggest shop', 'Phía bên kia toà nhà, lớn thứ hai → A.')],
          ['pharmacy', ['A', 'B', 'C', 'D', 'E', 'F'], 'E', lx('hiệu thuốc', 'Giữa Part 2.', "You'll find it between the men's and women's clothes shop and the café", 'Giữa cửa hàng thời trang và quán cà phê → E.')],
          ['book store', ['A', 'B', 'C', 'D', 'E', 'F'], 'B', lx('hiệu sách', 'Gần cuối.', "If you're coming from the car park entrance, that's the second shop on your right, next to the sports shop", 'Cạnh Sports shop → B.')],
          ['mobile phone shop', ['A', 'B', 'C', 'D', 'E', 'F'], 'D', lx('cửa hàng điện thoại', 'Cuối bài.', "that's the smallest shop in the shopping centre – between the bank and the shoe shop", 'Giữa Bank và Shoes → D.')],
        ], 'Questions 1–6', { image: 'media:m0u06-map.jpg' }),
      ],
    },
  ],
};
