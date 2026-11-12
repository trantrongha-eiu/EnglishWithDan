// Mindset for IELTS Level 1 — Unit 5: Consumerism (Reading pp. 86–91 · Listening pp. 98–101)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qMatch, qHeadings, qFill, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');

const SLOT = 3; // sách của lớp: Unit 5–6 → Sổ 3

const MALLS = `## The future of malls

**A** Shopping malls have never been just about shopping. They began in the United States after the Second World War and, for the young, they were always a place to 'hang out' and be seen. However, the world has moved on, and just providing shops and a food court is no longer enough to keep malls alive. Malls became less popular at the start of the 21st century, mainly because of online shopping. There is even a website, deadmalls.com, which shows the end of many US malls. **Malls need to change to survive.** So what will the mall of the future look like?

**B** Malls are already becoming bigger and better all over the world. Asia and not the US is now the 'mall capital' of the world and is home to the five largest malls in the world. China is home to the two largest. Some malls in the Middle East and East Asia are starting to specialise. It is predicted that this will happen more and more in the future. Some malls will only sell electrical items, for example, or only fashion for young people. Some malls will only include expensive shops or cheap shops, as already happens in Bangkok and Singapore.

**C** Malls are becoming 'the new downtown', with cinemas, bowling alleys, climbing walls and even concert halls. Xanadu, a mall 30 km from Madrid, is a recreation centre for a family day out as well as a shopping centre, with ski slopes, minigolf, go-karts, balloon rides, bowling and billiards. We have always been able to grab a burger at the mall, but in the future we are going to see 'fine dining' too, with more expensive restaurants based at malls, as well as spas, fitness centres and art galleries. There are also going to be more apartments and office space so that more people can live, work, shop and be entertained in one location.

**D** Mall owners are going to need to think of new ideas to remain in business. One growing trend is the seasonal changes in the mall. It began with having Santa Claus in December, but now there are 'pop-ups' – temporary shops, stalls and kiosks – for other seasons and events. Brent Cross in North London has an 'urban beach' in summer, and its main lobby has different promotions and events every week, from bungee jumping for kids to free health checks.

**E** So, we have looked at the facilities malls will need to offer. Malls will need to consider the environment too. There will be more open-air malls and more natural features. Mall designers will have to make sure people can get there by public transport. They will also need to use more natural sources of heat and light. We will see more plants, trees, grass and even waterfalls at our local malls in the future.

**F** The future of malls looks exciting: there will be 'virtual malls' and technology will be used within malls to help us shop, find bargains and even park our car. With all these creative innovations, the mall will go from strength to strength.`;

const MARKETS = `## Markets around the world

**A** We have become so used to shopping in big supermarkets and chain stores, identical in every town, that we have forgotten about one important way to shop – markets. Markets are found in every country in the world, but wherever you go they are different and reveal the local culture – and agriculture. From farmers' markets selling fresh produce to craft and antique markets, they are the best place to find something unique at a great price.

**B** Food is at its cheapest and freshest in markets. Farmers often sell direct to the consumer, without all the packaging, shipping and advertising that increases costs in shops and supermarkets. You can often find unusual products and those that are not mass-produced. Food markets vary hugely according to where they are in the world. For example the Kauppatori market in Helsinki, Finland sells moose, reindeer and bear salami. Wherever you are, food will be locally produced and reasonably priced.

**C** Markets are also good places to buy clothes. Some sell cheap new and second-hand clothes, while others specialise in vintage or ethically made clothes and original items. The markets of London are some of the best in the world for those who want to create a unique look for themselves. Many new designers start with a market stall, so if you are looking for a totally original item of clothing, you could get something really special at a bargain price at Brick Lane, Spitalfields or Portobello Road markets.

**D** Another type of market is a flea market. This is a much more informal type of market, where second-hand products can be sold by anyone. If you have unwanted items at home, you could take them to a flea market and sell them yourself. There are also antiques and possibly local crafts at this kind of market. In some parts of the world there may not even be stalls; rather, vendors lay out their goods on a sheet on the ground. In other parts of the world, flea markets have developed into car boot sales, where people sell their unwanted items from their cars.

**E** In some places, markets are directed at visitors and tend to sell handicrafts typical of the region. For many tourists, a visit to a nearby market to buy souvenirs is an important part of their holiday. Guadalajara in Mexico has a huge range of traditional textiles, glassware, ceramics and art works and Seoul in Korea has some wonderful original designs of all kinds of products at affordable prices. Countries in the Middle East usually have beautiful hand-made rugs and carpets, and Indian markets sell colourful handloom fabrics and beautiful silk scarves.

**F** In Europe, Christmas is the time when seasonal markets are held to sell decorations and gifts for the festive season. One of the most famous of these is held in Wenceslas Square in Prague in the Czech Republic. The market is made up of colourfully decorated wooden huts selling traditional handicrafts, embroidered lace, wooden toys, scented candles, Christmas tree ornaments, and puppets and dolls beautifully dressed in traditional costumes. This looks very pretty, especially in the snow.

**G** So, wherever you are in the world and whatever you are looking for, there is a market for you. You can get all kinds of unusual things at great prices.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T40 = `Recording 1
Whatever you do, don't miss our Summer Sale. This weekend, and this weekend only, we're reducing all our prices right across our store. So, on our first floor you'll find women's jeans at just $20 a pair. And, just in time for the holiday season, our T-shirts and swimwear are on special offer too. And if you're looking for shoes, you'll want to visit the fourth floor. You'll find a good selection of styles and colours in our footwear department situated right next to the coffee shop. This weekend, they're all half price and that includes a wide choice of sports shoes in most sizes! So, hurry before they're all gone! Sale ends Sunday! Miss our sale? Miss out!

Recording 2
Dan: So, Jess, what do you think of my hat?
Jess: It's very nice – I like the colour, and it'll definitely keep the sun off your face. Actually, I didn't notice the clothing stalls.
Dan: I know you didn't! That's because you spent most of your time there looking at all the jewellery! And relaxing in all that fresh air, of course!
Jess: That's true – but actually, I managed to find a really nice necklace. And you'll never guess how cheap it was! Do you want to have a look?

Recording 3
A: So what did you think of it? It only opened a few weeks ago, didn't it?
B: Yes, that's right, so that's why it was very busy. In fact, it was a bit like being at a football match – there were so many people! But I really liked it – it's very convenient because there were at least 50 different shops all under one roof and there's a car park too. I'd really like to go back.
A: Then how about going along there together next weekend? I'd really like to see it for myself. I also need to buy a birthday present for my mum. You could help me choose something for her. And we can go for a coffee afterwards! I'll pay!`;

const T41 = `Recording 1
And now for the local news … A new branch of Sports World, the Danish sporting goods company, is opening on Saturday. Most of you will be familiar with the branch in the south of Grinstead that opened two years ago and which has enjoyed a lot of success. There was talk of them opening a new store in the Meadows Shopping Centre in the north of the town, but they have finally decided to open in the east, near the football stadium. As a special treat for fans, Grinstead Town's Danish striker Jesper Nielsen will be opening the store ahead of their home match at the weekend.

Recording 2
That's the end of our tour of the city, so you now have a couple of hours to spend exploring the city centre. If you want to buy souvenirs, you might find them cheaper near the hotel. However, if you're feeling a bit tired, there are plenty of teashops nearby and they also sell boxes of tea that make really good presents. A word of warning, you'll find a lot of cheap electronic stores offering cameras at really low prices. They might seem good quality, but we've had a lot of complaints from tourists who have bought them, only to find they break after about a week.

Recording 3
Thank you for calling the Eastgate Shopping Centre. The centre is currently closed. Our opening days and times are as follows … Monday to Saturday we are open from nine o'clock until six o'clock and on Sunday, our doors open at eleven o'clock and we close at five o'clock.

Recording 4
When I first opened the shop three years ago, we mainly sold shirts and jackets that I had designed, and these proved very popular. However, we added more products as the business started to grow. We also started selling online. The jackets and shirts are still really popular, especially online, but in the shop itself, we sell trousers more than any other item.`;

const T42 = `We also sell a lot of T-shirts. When I first opened the shop, I had a lot of designs that I'd worked on at university and in general these had writing on the front. I thought that it might be fun if people could put a photograph on the T-shirts as well. I invested quite a bit of money in this and they were popular at first. We sometimes have young children who come in with their parents and they buy T-shirts with photographs on. I've stopped designing T-shirts with writing on them, because I don't have the time, so now we sell more T-shirts with nothing on them at all. If fashions change, I might go back to designing them and if you want a photograph on your T-shirt, you know where to come.`;

const T43 = `Calling all fans of Sam West! This famous adventure writer will be in Westfield shopping centre tomorrow in Bookworms Bookshop on the first floor. He will be signing copies of his latest book, Timed Out. He is expected to get there at quarter past two and will stay until half past three. Get there as soon as you can because queues will start to form as early as noon. Don't miss this great opportunity to meet everyone's favourite writer!`;

const T44 = `I had a great day at that new shopping centre but I would complain about one thing – and not the usual kind of thing – the service in all the shops was good, and I had a delicious lunch in the cafe on the third floor. No, the annoying thing was the amount of rubbish I saw around me. I think it was because there weren't enough rubbish bins for people to put their empty cans and sweet wrappers in. But, apart from that, I would say that it's well worth a visit.`;

const T45 = `Hello everyone. So can you all hear me and see me? OK, my name's David Edwards and I'm your tour leader for your shopping tour today. Now, as you can see, we're parked just in front of the main theatre. If any of you would like tickets for tonight's performance, we can arrange that for you. We're just round the corner from the railway station. If you want to come on our Historic Buildings tour tomorrow, the coach will leave from just outside the station. And if you want to go for a drink at the end of our tour today, there are plenty of cafes just behind the station.
We're still waiting for a few people, but while we wait I can tell you a little about the theatre. Although the building is very modern, in fact a theatre has existed on this site for over 200 years. The original theatre used to be very popular because of the musicals it put on. However, it had to be rebuilt after a fire. Some people love the striking modern design, others hate it. These days, its popularity is mainly due to the fact that it attracts a lot of well-known performers.
Now, in a few minutes' time – at 9.30 – we'll be starting our tour. First we're going to make our way down to Market Place, which is one of the most famous squares in the city – that should take us about ten minutes. There's not too much traffic on the roads, so we should get there at quarter to ten at the latest.
Market Place was the city's old food market. People used to come in from the countryside to sell their fresh fruit and vegetables. Remember that these were the days before supermarkets! You won't find any food here now though. It's now a craft market and I think you'll find lots to interest you – especially if you want to take presents home. You'll see all kinds of things like hand-painted local pottery and leather goods. Personally, I suggest that you visit the jewellery stalls. You really won't find anything like it anywhere else! But if you're looking for clothes, I'm afraid you'll be disappointed. Wait for this afternoon's visit.
We'll stop at Market Place for an hour and a half and then continue the tour with a visit to the Regional Food Centre. Here you can find over 50 types of local cheeses! There is also fresh fruit juice on sale – orange juice, peach juice, pomegranate juice, produced in the villages of the region, and local jam too. You're welcome to buy things to take home with you, but the real reason for our visit is lunch. The idea is that you buy food and drink from the stalls and take it to eat in the lovely open-air dining area.
And finally, in the afternoon we will be visiting the Fashion Fair in the exhibition centre on the outskirts of the city. This is a huge venue, so try not to get lost. There is a whole hall devoted just to footwear – every kind of shoes and boots you can imagine. You can easily find it because it has a green roof. Just don't go through the blue doors at the entrance of the centre – you have to pay for that part of the exhibition. And if all that shopping has exhausted you, there's a cafe where you can rest your weary feet! That's in the building with a red sign. But don't worry, I'll remind you all about that later.
Right, everyone's here now, so, if you've all got your shopping bags, let's go!`;

const HEADINGS_EX = ['i Innovate and stay alive', 'ii Fast food paradise', 'iii Expanding and improving', 'iv Malls and the natural world', 'v A new city centre'];
const HEADINGS_MK = ['i Local art and craft work to take home', 'ii Inexpensive things to eat straight from the countryside', 'iii Toys for children of all ages', 'iv Invent a new style for yourself at bargain prices', 'v London has the best markets', 'vi Find gifts for winter celebrations', "vii Sell what you don't need"];

module.exports = {
  n: 5,
  title: 'Consumerism',
  titleVi: 'Tiêu dùng và mua sắm',
  pages: '86–91, 98–101',
  outcomes: [
    'Reading: câu chủ đề (topic sentence), ý chính và ý phụ; matching headings; matching information',
    'Grammar: will và going to để nói về tương lai',
    'Listening: Section 2 (một người nói); nhận diện distractors; multiple choice 3 phương án; paraphrase',
    'Từ vựng mua sắm, trung tâm thương mại, chợ (Sổ 3)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: shopping malls',
      titleEn: 'Lead-in · Skim reading (pp. 86–87)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Kể tên các hoạt động có thể làm ở trung tâm thương mại', 'Skim bài "The future of malls" trong 1 phút và nhớ lại nội dung'],
      theory: [
        card('Skim reading', 'Skim reading', {
          usage: ['Đọc thật nhanh trong 1 phút, **không quay lại bài**, rồi tự hỏi: bài nhắc đến những hoạt động/nơi nào? Bài chủ yếu nói về **quá khứ, hiện tại hay tương lai**?', 'Đọc lướt giúp bạn biết **bố cục** bài trước khi làm câu hỏi.'],
        }),
      ],
      vocab: vocabFile('u05-reading', [MALLS, MARKETS]),
      ex: [
        cat('Activities at a mall (Ex. 1–2)', 'Which of these activities are mentioned in the text "The future of malls"? (According to the text, all of them can be done at a mall.)', { y: 'Mentioned in the text', n: 'Not mentioned' }, [
          ['go climbing', 'y', 'climbing walls (C).'], ['ski', 'y', 'ski slopes ở Xanadu (C).'], ['go in a hot air balloon', 'y', 'balloon rides (C).'], ['have a beauty treatment', 'y', 'spas (C).'],
          ['check your health', 'y', 'free health checks (D).'], ['go to the beach', 'y', "an 'urban beach' in summer (D)."], ['have an expensive meal', 'y', "'fine dining' (C)."], ['see plants and trees', 'y', 'plants, trees, grass (E).'],
          ['buy or rent an apartment', 'y', 'more apartments and office space (C).'], ['see a film', 'y', 'cinemas (C).'], ['see an art exhibition', 'y', 'art galleries (C).'],
        ], { stimulus: stim(MALLS, 'The future of malls (p. 87)') }),
        mcq('Skim reading (Ex. 2)', 'Read the text in one minute. Answer the questions.', [
          ['Which places are mentioned in the text?', ['the US, China, Bangkok, Singapore, Madrid, London', 'Paris, Tokyo, New York, Sydney', 'Brazil, India, Russia, Canada'], 'A'],
          ['Is the text mainly about the past, present or future?', ['the past', 'the present and future', 'only the past and present'], 'B', 'Có nhắc lịch sử (đoạn A) nhưng chủ yếu nói về hiện tại (are becoming…) và tương lai (will, going to).'],
        ], { stimulus: stim(MALLS, 'The future of malls') }),
      ],
    },

    reading: {
      title: 'Reading: topic sentences & matching headings',
      titleEn: 'Matching headings · Topic sentences and main and supporting ideas · Paraphrase · Exam skills (pp. 88–91)',
      minutes: 55,
      objectives: ['Tìm câu chủ đề của đoạn (thường — không phải luôn — là câu đầu)', 'Phân biệt ý chính và ý phụ (bằng chứng)', 'Nhận ra tiêu đề là paraphrase của ý chính (synonyms, antonyms)', 'Làm matching headings và matching information'],
      theory: [
        card('Câu chủ đề và ý hỗ trợ', 'Topic sentences, main and supporting ideas', {
          usage: ['**Topic sentence** tóm tắt ý chính của đoạn — vd. đoạn A: "**Malls need to change to survive.**"', 'Các câu còn lại là **supporting ideas** (bằng chứng): the world has moved on; malls became less popular because of online shopping; the website deadmalls.com.', 'Câu chủ đề **thường** là câu đầu đoạn, nhưng **không phải luôn** (đoạn A nằm ở gần cuối).'],
        }),
        card('Matching headings', 'Matching headings', {
          formula: ['Có **nhiều tiêu đề hơn số đoạn** → có tiêu đề không dùng.', 'Tiêu đề = **paraphrase** ý chính: "Adapt or die" ↔ "Malls need to change to survive" (change ↔ adapt: đồng nghĩa; survive ↔ die: trái nghĩa).'],
          usage: ['Tìm câu chủ đề → so với từng tiêu đề → để ý synonym/antonym.', 'Cẩn thận tiêu đề "bẫy" chỉ khớp một chi tiết (Fast food paradise ↔ chỉ nhắc "grab a burger").', 'Ghi danh sách từ đồng nghĩa vào sổ — kỹ năng then chốt của IELTS.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U05-R1', title: 'The future of malls — matching headings (Ex. 8)', note: 'Chọn tiêu đề i–v cho đoạn B–E.' },
        { ref: 'reading:M1-U05-R2', title: 'Exam skills: Markets around the world (Ex. 11–12)', note: 'Matching information A–G + matching headings i–vii.' },
      ],
      ex: [
        cat('Supporting ideas in paragraph B (Ex. 3)', 'The topic sentence in paragraph B is "Malls are already becoming bigger and better all over the world." Which sentences are evidence that supports it?', { s: 'Supports the topic sentence', n: 'Does not support it' }, [
          ["Asia and not the US is now the 'mall capital' of the world and is home to the five largest malls in the world.", 's', 'Bằng chứng cho "bigger".'],
          ['China is home to the two largest.', 's'],
          ['Malls became less popular at the start of the 21st century.', 'n', 'Thuộc đoạn A, nói về sự suy giảm.'],
          ['There is even a website, deadmalls.com.', 'n', 'Đoạn A.'],
        ], { stimulus: stim(MALLS, 'The future of malls') }),
        mcq('Topic sentences of C, D and E (Ex. 4)', 'Find the topic sentences in paragraphs C, D and E.', [
          ['Paragraph C', ["Malls are becoming 'the new downtown', with cinemas, bowling alleys, climbing walls and even concert halls.", 'Xanadu, a mall 30 km from Madrid, is a recreation centre for a family day out.', 'There are also going to be more apartments and office space.'], 'A', 'Các câu sau là ví dụ cho "the new downtown".'],
          ['Paragraph D', ['Mall owners are going to need to think of new ideas to remain in business.', 'It began with having Santa Claus in December.', 'Brent Cross in North London has an \'urban beach\' in summer.'], 'A'],
          ['Paragraph E', ['So, we have looked at the facilities malls will need to offer.', 'Malls will need to consider the environment too.', 'We will see more plants, trees, grass and even waterfalls.'], 'B', 'Câu đầu chỉ là câu chuyển ý; câu chủ đề là câu thứ hai.'],
        ], { stimulus: stim(MALLS, 'The future of malls') }),
        mcq('One more supporting idea (Ex. 5)', 'Choose one more supporting idea for each paragraph.', [
          ['C — Xanadu is a recreation centre for a family day out as well as a shopping centre. Another supporting idea:', ['There will be spas, fitness centres and art galleries.', 'Malls use natural sources of heat and light.', 'There are pop-up shops for different seasons.'], 'A'],
          ['D — Brent Cross has different promotions and events every week. Another supporting idea:', ["There are 'pop-up' shops, stalls and kiosks at different times of the year.", 'There will be more apartments and office space.', 'China is home to the two largest malls.'], 'A'],
          ['E — There will be more open-air malls and more natural features. Another supporting idea:', ['Malls will have to make sure people can reach them by public transport.', 'Malls will only sell electrical items.', 'There will be virtual malls.'], 'A'],
        ], { stimulus: stim(MALLS, 'The future of malls') }),
        match('Headings and topic sentences (Ex. 7)', 'Match the words and phrases 1–6 (from the headings) with the words and phrases a–f (from the topic sentences of paragraphs B–E).', [
          ['innovate', 'think of new ideas'], ['stay alive', 'remain in business'], ['expanding', 'becoming bigger'], ['improving', 'becoming better'], ['natural world', 'environment'], ['city centre', 'downtown'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: will and going to',
      titleEn: 'Grammar focus: future forms (p. 90)',
      minutes: 30,
      objectives: ['Tìm hai cách nói về tương lai trong bài', 'Phân biệt will (dự đoán, niềm tin) và going to (có liên hệ với hiện tại: kế hoạch, dấu hiệu)'],
      keyLanguage: [
        '**going to + V**: có **liên hệ với hiện tại** — kế hoạch đã có, thay đổi đã bắt đầu: Mall owners **are going to need** to think of new ideas (nhiều mall đã bắt đầu đổi mới).',
        '**will + V**: **dự đoán / niềm tin** của người viết, không cần bằng chứng hiện tại: …the mall **will go** from strength to strength.',
        'Thấy kế hoạch, bản vẽ, bài báo đưa tin → going to · I think / I expect / I\'m afraid → will.',
      ],
      theory: [
        card('will vs going to', 'Future forms', {
          formula: ['S + will + V (nguyên mẫu)', 'S + am/is/are + going to + V'],
          examples: [['Look at these plans for the new mall! There is going to be a climbing wall!', 'Có kế hoạch/bản vẽ → going to.'], ['I think it will be great when it is finished!', 'Ý kiến, dự đoán → will.']],
        }),
      ],
      links: [{ grammar: 'future-simple', title: 'Future Simple (will)', note: 'dự đoán, niềm tin' }, { grammar: 'be-going-to', title: 'Be Going To', note: 'kế hoạch, dấu hiệu ở hiện tại' }],
      ex: [
        cat('Future forms in the passage (Ex. 9)', 'Find examples of future forms in the passage "The future of malls". Which form does each example use?', { w: 'will + infinitive', g: 'going to + infinitive' }, [
          ['So what will the mall of the future look like?', 'w'], ['It is predicted that this will happen more and more in the future.', 'w'], ['Some malls will only sell electrical items.', 'w'],
          ["In the future we are going to see 'fine dining' too.", 'g'], ['There are also going to be more apartments and office space.', 'g'], ['Mall owners are going to need to think of new ideas.', 'g'],
          ['Malls will need to consider the environment too.', 'w'], ['The mall will go from strength to strength.', 'w'],
        ]),
        gap('will or going to? (Ex. 10)', 'Complete the sentences with the correct form of will or going to.', [
          ['Look at these plans for the new mall! There ____ be a climbing wall!', 'is going to', 'Có bản kế hoạch → going to.'],
          ['This newspaper article says they ____ spend $25 million on the project.', 'are going to', 'Kế hoạch đã được đưa tin.'],
          ['I think it ____ be great when it is finished!', 'will', 'I think → dự đoán.'],
          ["I agree, but I'm afraid many local businesses ____ have to close.", 'will|are going to'],
          ['I heard there ____ be 12 different restaurants!', 'are going to', 'Thông tin về kế hoạch.'],
          ['I expect most of the shops ____ be expensive ones.', 'will', 'I expect → dự đoán.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: Section 2 — distractors & multiple choice',
      titleEn: 'Lead-in · Section 2 · Identifying distractors · Paraphrase and synonyms · Multiple-choice questions · Exam skills (pp. 98–101)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Biết đặc điểm Section 2: một người nói, chủ đề đời sống, chia làm 2 phần', 'Nhận diện distractors — từ/cụm từ được nhắc nhưng không phải đáp án', 'Nhận ra paraphrase của từng phương án A, B, C', 'Làm multiple choice: chỉ chọn MỘT đáp án'],
      images: ['media:m1u05-shops.jpg|Ex. 1 (p. 98): places to shop A–E'],
      theory: [
        card('Section 2 của bài thi Listening', 'Section 2', {
          usage: ['Khó hơn Section 1 một chút: **một người nói** (hoặc chủ yếu một người) về chủ đề chung (giới thiệu tour, thông báo, bài nói…).', 'Không có người thứ hai đặt câu hỏi để "dẫn đường" → phải tự bám câu hỏi.', 'Bài nghe chia **hai phần**, mỗi phần có câu hỏi riêng.'],
        }),
        card('Distractors', 'Identifying distractors', {
          usage: ['**Distractor** = từ ngữ trong bài nghe là đáp án SAI: "Most of you will be familiar with the branch in the **south**… talk of… the **north**… but they have finally decided to open in the **east**".', 'Đừng chọn một phương án chỉ vì **nghe thấy từ của nó** — hãy nghĩ về **nghĩa của cả câu**.', 'Thứ tự câu hỏi theo bài nghe, nhưng thứ tự phương án A, B, C thì **không**.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U05-L1', title: 'Three short recordings: which place? (Ex. 2)', note: 'Mỗi người nói đang nói về địa điểm nào?' },
        { ref: 'listening:M1-U05-L2', title: 'Four recordings: answers and distractors (Ex. 3–4)', note: 'Ghi đáp án đúng rồi ghi cả các distractor.' },
        { ref: 'listening:M1-U05-L3', title: 'Which T-shirts sell best? (Ex. 6)', note: 'plain = nothing on them.' },
        { ref: 'listening:M1-U05-L4', title: 'A book signing (Ex. 7)', note: 'noon, quarter past two, half past three…' },
        { ref: 'listening:M1-U05-L5', title: 'A complaint (Ex. 8)', note: 'staff, litter hay food?' },
        { ref: 'listening:M1-U05-L6', title: 'Exam skills: a shopping tour (Ex. 9)', note: '6 câu multiple choice A, B, C — cẩn thận distractor.' },
      ],
      vocab: vocabFile('u05-listening', [T40, T41, T42, T43, T44, T45]),
      ex: [
        match('Places to shop (Ex. 1)', 'Match the places in the box with pictures A–E: coffee shop, department store, outdoor market, shopping centre, supermarket.', [
          ['Picture A', 'supermarket'], ['Picture B', 'shopping centre'], ['Picture C', 'outdoor market'], ['Picture D', 'department store'], ['Picture E', 'coffee shop'],
        ], { stimulus: picture('media:m1u05-shops.jpg', 'Ex. 1') }),
        match('Synonyms and paraphrases (Ex. 5)', 'Match the words and phrases 1–6 with their synonyms or paraphrases a–f.', [
          ['a good selection', 'a wide choice'], ['at the weekend', 'on Saturday and Sunday'], ['shoes', 'footwear'], ['under one roof', 'in one building'], ['walk', 'go on foot'], ['picture', 'photograph'],
        ]),
        mcq('Paraphrases of the options (Ex. 6–8)', 'Match the options with the paraphrases.', [
          ['"What kind of T-shirts does the man sell most of?" — Option C "plain T-shirts" means…', ['T-shirts with nothing on them', 'T-shirts with writing on them', 'T-shirts with a photograph on them'], 'A', 'plain = trơn, không in gì.'],
          ['"The writer will arrive at…" — Option B "2.15 pm" can be said as…', ['quarter to two', 'quarter past two', 'half past two'], 'B'],
          ['"The writer will arrive at…" — Option A "12.00 pm" can be said as…', ['midnight', 'noon'], 'B', '12.00 pm = 12 giờ trưa = noon.'],
          ['"What does the woman complain about? A the staff B the litter C the food" — Which paraphrase is INCORRECT?', ['the staff = the customers', 'the litter = the rubbish', 'the food = the lunch'], 'A', 'Staff là nhân viên phục vụ khách, không phải khách hàng.'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U05-R1',
      title: 'Mindset 1 · Unit 5 — The future of malls',
      content: html(MALLS),
      questionGroups: [
        qHeadings(1, 'Choose a heading from the list for paragraphs B–E. There is one heading you won\'t need. (Ex. 8)', HEADINGS_EX, [
          ['Paragraph B', 'iii', 'Câu chủ đề: "Malls are already becoming **bigger and better**" → expanding (bigger) and improving (better).'],
          ['Paragraph C', 'v', 'Câu chủ đề: "Malls are becoming \'**the new downtown**\'" → downtown = city centre. BẪY: "Fast food paradise" chỉ khớp chi tiết "grab a burger".'],
          ['Paragraph D', 'i', 'Câu chủ đề: "Mall owners are going to need to **think of new ideas to remain in business**" → innovate and stay alive.'],
          ['Paragraph E', 'iv', 'Câu chủ đề: "Malls will need to consider **the environment** too" → the natural world.'],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M1-U05-R2',
      title: 'Mindset 1 · Unit 5 — Markets around the world',
      content: html(MARKETS),
      questionGroups: [
        qMatch(1, 'Which paragraph contains information on the following? Write the correct letter, A–G.', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
          ['markets put on at a particular time of year', 'F', 'F: "Christmas is the time when **seasonal markets** are held".'],
          ['markets where anyone can sell anything', 'D', 'D: flea market "where second-hand products can be sold **by anyone**".'],
          ['markets selling things to eat', 'B', 'B: "**Food** is at its cheapest and freshest in markets".'],
          ['advice for people who want to dress differently from others', 'C', 'C: "for those who want to **create a unique look** for themselves".'],
          ['examples of markets outside Europe', 'E', 'E: Guadalajara in Mexico, Seoul in Korea, the Middle East, India.'],
        ], { title: 'Questions 1–5', type: 'matching-info' }),
        qHeadings(6, 'The reading passage has seven paragraphs, A–G. Choose the correct heading for paragraphs B–F from the list of headings below. There are two headings you won\'t need.', HEADINGS_MK, [
          ['Paragraph B', 'ii', 'Food… cheapest (inexpensive) and freshest; farmers sell direct (straight from the countryside).'],
          ['Paragraph C', 'iv', 'clothes… "create a unique look" (invent a new style) "at a bargain price". BẪY: v "London has the best markets" — đoạn chỉ nói chợ London là "some of the best" cho quần áo.'],
          ['Paragraph D', 'vii', 'flea market: "If you have unwanted items at home… sell them yourself" → sell what you don\'t need.'],
          ['Paragraph E', 'i', 'markets for visitors… handicrafts typical of the region, souvenirs → local art and craft work to take home.'],
          ['Paragraph F', 'vi', 'Christmas markets… "decorations and gifts for the festive season" → gifts for winter celebrations. BẪY: iii — wooden toys chỉ là một chi tiết.'],
        ], 'Questions 6–10'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U05-L1', title: 'Mindset 1 · Unit 5 — Which place?',
      description: 'Three short recordings about places to shop.', partNumber: 2, audioFile: 'Mindset_L1_40.mp3', transcript: T40,
      questionGroups: [
        qMatch(1, 'Listen to three short recordings. Which place, A–E, is each speaker talking about? (Ex. 2)', ['A supermarket', 'B shopping centre', 'C outdoor market', 'D department store', 'E coffee shop'], [
          ['Recording 1', 'D', lx('Bản ghi 1', '', ['on our first floor you\'ll find women\'s jeans', 'visit the fourth floor… our footwear department situated right next to the coffee shop'], 'Nhiều tầng, nhiều gian hàng (department) → department store. BẪY: coffee shop chỉ là vị trí.')],
          ['Recording 2', 'C', lx('Bản ghi 2', '', ["I didn't notice the clothing stalls", 'relaxing in all that fresh air'], 'stalls + fresh air → chợ ngoài trời.')],
          ['Recording 3', 'B', lx('Bản ghi 3', '', 'there were at least 50 different shops all under one roof and there\'s a car park too', 'BẪY: "football match" chỉ là so sánh; "go for a coffee" là kế hoạch.')],
        ], { title: 'Questions 1–3', optionsTitle: 'Places', type: 'matching' }),
      ],
    },
    {
      ref: 'M1-U05-L2', title: 'Mindset 1 · Unit 5 — Answers and distractors',
      description: 'Four short recordings: a new shop, a tour guide, opening times and a shop owner.', partNumber: 2, audioFile: 'Mindset_L1_41.mp3', transcript: T41,
      questionGroups: [
        qFill(1, 'Listen to four short recordings and answer questions 1–4. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. (Ex. 3)', [
          ['The new sport shop is going to be located in the ______ of the town.', 'east', lx('Cửa hàng thể thao mới sẽ nằm ở phía ___ thị trấn.', 'Bản ghi 1.', ['the branch in the south of Grinstead', 'opening a new store in the Meadows Shopping Centre in the north', 'they have finally decided to open in the east'], 'Distractors: south (chi nhánh cũ), north (chỉ là tin đồn).')],
          ['What does the tour guide recommend they buy?', 'tea', lx('Hướng dẫn viên khuyên mua gì?', 'Bản ghi 2.', ['If you want to buy souvenirs, you might find them cheaper near the hotel', 'they also sell boxes of tea that make really good presents', 'cameras… they break after about a week'], 'Distractors: souvenirs, cameras (bị cảnh báo).')],
          ["The shopping centre opens at ______ o'clock on Sundays.", '11 / eleven', lx('Trung tâm mở cửa lúc ___ giờ Chủ nhật.', 'Bản ghi 3.', ["Monday to Saturday we are open from nine o'clock until six o'clock", "on Sunday, our doors open at eleven o'clock and we close at five o'clock"], 'Distractors: 9, 6, 5.')],
          ['What is the most popular product in the shop?', 'trousers', lx('Sản phẩm bán chạy nhất trong cửa hàng?', 'Bản ghi 4.', ['we mainly sold shirts and jackets', 'in the shop itself, we sell trousers more than any other item'], 'Distractors: shirts, jackets (bán chạy online).')],
        ], 'Questions 1–4'),
        {
          groupType: 'plain', groupTitle: 'Questions 5–13', instruction: 'Listen to the recordings again. Write the distractors (Ex. 4). Write ONE WORD OR A NUMBER for each answer. The answers in each pair can be in either order.',
          questions: [
            [5, 'Q1 distractor 1 (a part of the town)', 'south', 'Chi nhánh cũ "in the south of Grinstead".'], [6, 'Q1 distractor 2 (a part of the town)', 'north', 'Chỉ là tin đồn "in the north of the town".'],
            [7, 'Q2 distractor 1 (something to buy)', 'souvenirs', '"If you want to buy souvenirs…" — không phải lời khuyên chính.'], [8, 'Q2 distractor 2 (something to buy)', 'cameras', 'Bị cảnh báo: hỏng sau một tuần.'],
            [9, "Q3 distractor 1 (o'clock)", '9 / nine', 'Giờ mở cửa thứ Hai–thứ Bảy.'], [10, "Q3 distractor 2 (o'clock)", '6 / six', 'Giờ đóng cửa thứ Hai–thứ Bảy.'], [11, "Q3 distractor 3 (o'clock)", '5 / five', 'Giờ đóng cửa Chủ nhật.'],
            [12, 'Q4 distractor 1 (a product)', 'shirts', 'Bán chạy online.'], [13, 'Q4 distractor 2 (a product)', 'jackets', 'Bán chạy online.'],
          ].map(([n, t, a, e]) => ({ questionNumber: n, type: 'fill-blank', questionText: t, correctAnswer: a, explanation: lx(t, '', '', e) })),
        },
      ],
    },
    {
      ref: 'M1-U05-L3', title: 'Mindset 1 · Unit 5 — Which T-shirts sell best?',
      description: 'A shop owner talks about T-shirts.', partNumber: 2, audioFile: 'Mindset_L1_42.mp3', transcript: T42 + '\n\n' + T43 + '\n\n' + T44,
      questionGroups: [
        qMcq(1, 'Read the question and match the options with their paraphrases. Then listen and choose the correct answer, A, B or C. (Ex. 6)', [
          ['What kind of T-shirts does the man sell most of?', ['T-shirts with a picture on them', 'T-shirts with words on them', 'plain T-shirts'], 'C', lx('Người đàn ông bán loại áo phông nào nhiều nhất?', 'Cuối bài.', ["I've stopped designing T-shirts with writing on them… so now we sell more T-shirts with nothing on them at all"], 'nothing on them = plain. Ảnh và chữ chỉ là distractor.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M1-U05-L4', title: 'Mindset 1 · Unit 5 — A book signing',
      description: 'A book signing announcement.', partNumber: 2, audioFile: 'Mindset_L1_43.mp3', transcript: T43,
      questionGroups: [
        qMcq(1, 'Read the question and identify the key words. Then listen and choose the correct answer, A, B or C. (Ex. 7)', [
          ['The writer will arrive at', ['12.00 pm.', '2.15 pm.', '3.30 pm.'], 'B', lx('Nhà văn sẽ đến lúc', '', ['He is expected to get there at quarter past two and will stay until half past three', 'queues will start to form as early as noon'], 'quarter past two = 2.15. Noon là lúc người ta xếp hàng; 3.30 là lúc ông ấy về.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M1-U05-L5', title: 'Mindset 1 · Unit 5 — A complaint',
      description: 'A woman talks about a new shopping centre.', partNumber: 2, audioFile: 'Mindset_L1_44.mp3', transcript: T44,
      questionGroups: [
        qMcq(1, 'Listen and choose the correct answer, A, B or C. Then explain why the other options are wrong. (Ex. 8)', [
          ['What does the woman complain about?', ['the staff', 'the litter', 'the food'], 'B', lx('Người phụ nữ phàn nàn về điều gì?', '', ['the service in all the shops was good, and I had a delicious lunch', 'the annoying thing was the amount of rubbish I saw around me'], 'rubbish = litter. Service (staff) tốt, bữa trưa ngon → A, C sai.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M1-U05-L6', title: 'Mindset 1 · Unit 5 — Exam skills: a shopping tour',
      description: 'A tour guide talks to some tourists.', partNumber: 2, audioFile: 'Mindset_L1_45.mp3', transcript: T45,
      questionGroups: [
        qMcq(1, 'You will hear a tour guide talking to some tourists. Listen and choose the correct letter, A, B or C. (Ex. 9)', [
          ['The Shopping Tour bus is outside', ['the theatre.', 'the train station.', 'some cafes.'], 'A', lx('Xe buýt của tour mua sắm đang đỗ ở', 'Đầu bài.', ["we're parked just in front of the main theatre", 'the coach will leave from just outside the station', 'plenty of cafes just behind the station'], 'Ga tàu là chỗ đón tour ngày mai; quán cà phê sau ga.')],
          ['Nowadays the theatre is popular because of', ['its modern architecture.', 'its music performances.', 'the famous actors that appear there.'], 'C', lx('Ngày nay nhà hát được ưa chuộng vì', 'Đoạn về nhà hát.', ['The original theatre used to be very popular because of the musicals', 'Some people love the striking modern design, others hate it', 'These days, its popularity is mainly due to the fact that it attracts a lot of well-known performers'], 'well-known performers = famous actors. Musicals là của nhà hát cũ.')],
          ['The shopping tour will begin at', ['9.10.', '9.30.', '9.45.'], 'B', lx('Tour mua sắm bắt đầu lúc', '', ["in a few minutes' time – at 9.30 – we'll be starting our tour", 'we should get there at quarter to ten'], '9.45 là giờ đến Market Place.')],
          ['What can people buy in Market Place today?', ['souvenirs', 'fruit and vegetables', 'clothes'], 'A', lx('Hôm nay mọi người mua được gì ở Market Place?', 'Đoạn Market Place.', ["You won't find any food here now though. It's now a craft market", 'especially if you want to take presents home', "if you're looking for clothes, I'm afraid you'll be disappointed"], 'presents to take home, pottery, leather goods = souvenirs.')],
          ['The main purpose of the visit to the Regional Food Centre is', ['to have a meal.', 'to buy local fruit juices.', 'to taste cheeses from the region.'], 'A', lx('Mục đích chính khi đến Regional Food Centre là', '', 'the real reason for our visit is lunch', 'Phô mai, nước ép là distractor.')],
          ['At the Fashion Fair, how will people on the tour know which building the footwear is in?', ['It is a red building.', 'It has a green roof.', 'It has blue doors.'], 'B', lx('Làm sao biết toà nhà bán giày dép?', 'Cuối bài.', ['There is a whole hall devoted just to footwear… You can easily find it because it has a green roof', "Just don't go through the blue doors", "That's in the building with a red sign"], 'Cửa xanh dương là khu phải trả tiền; biển đỏ là quán cà phê.')],
        ], 'Questions 1–6'),
      ],
    },
  ],
};
