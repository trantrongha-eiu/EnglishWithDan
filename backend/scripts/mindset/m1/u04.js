// Mindset for IELTS Level 1 — Unit 4: Food and drink (Reading pp. 64–69 · Listening pp. 75–79)
const { mcq, gap, match, cat, fix, passage, picture, card, qMcq, qMatch, qFill, lx, html } = require('../dsl');
const { vocabFrom } = require('./_vocab');

const SLOT = 2; // sách của lớp: Unit 3–4 → Sổ 2

const SHOCK = `## Food culture shock

**A — Charles** You would think that eating with your fingers would be easy. In the US, there are only certain things you can eat with your fingers, like burgers, for example, and that's easy enough. When I went to South India, though, I realised that it is a whole new skill to learn to eat rice and curry with your fingers. You have to mix the curries together and with the rice and form a 'ball'. Daal* is particularly helpful as a kind of glue. You use your fingertips, never the palm of your hand, and use your thumb to pop it into your mouth. I thought I knew where my mouth was, but my first few attempts were a disaster. There was food everywhere! (*Daal is a lentil curry widely eaten in the Indian subcontinent.)

**B — Alfredo** For me, when I travel, the 'fast food' culture always shocks me. I can't believe there are people in the world who live on 'junk food' like burgers and just grab a sandwich for lunch. Back home, food is very important to us. We cook fresh food for lunch and dinner and sit down and eat as a family at least once a day, twice at weekends. A lot of people grow their own vegetables and keep chickens. Food is part of your identity, so what are you saying about yourself when you eat some rubbish which contains chemicals and goodness knows what else? The worst thing I have seen on my travels is a baby being given a fizzy drink in a bottle. That really shocked me!

**C — Qiang Shi** I enjoy trying food from different countries, but what interests me more is the culture and habits surrounding food and eating. In China, when we go to a restaurant with colleagues, when we are offered something, we say 'No thanks', even though we want it, because the person will definitely repeat the offer. In other countries, though, 'no' means 'no', so if you are just trying to be polite and don't take it the first time, you will end up with nothing! To me, it feels wrong to take something the first time it is offered, so it took me a while to get used to that when I travel abroad.

**D — Pauline** Being a vegetarian is so easy here in the UK that we forget that not everyone in the world understands vegetarianism. For vegans the situation is even more difficult. Probably the best place I've been to is India, as everything is divided into 'veg' or 'non veg' so you know exactly what you're getting. In many countries, they don't even realise that there is a concept of not eating meat for ethical reasons. In many parts of the world, meat equates to prosperity, so the idea of going out for a meal and not having meat is alien to them. I have travelled to places where, as a vegetarian, all I have been able to eat is salad, fruit and chips. I'm glad to get home where we have special vegetarian products.

**E — Aileen** I think breakfast is the meal where food culture shock really hits you. In Australia, there are certain foods you eat for breakfast and certain foods you don't. We usually eat cereal or toast, maybe yoghurt and fruit. We would never eat chicken or vegetables. But when I travelled in Asia, I realised that in many places, there is no difference between breakfast and dinner: rice, curry, noodles, soup, steamed vegetables and fish all appeared at breakfast. Even though I love all those things, I just can't face them at breakfast!`;

const FOODTV = `## Food TV: education or entertainment?

**A** Shows about cookery have become more and more popular all over the world. But what are the reasons for this, and does it make us cook more? In the UK, BBC viewers complained to the programme Points of View that there were too many cookery shows on TV. In one week, the BBC showed 21 hours of cookery. When shows on other channels were included, this came to an amazing 434.5 hours of food TV.

**B** In the past, TV cookery shows were there to teach people how to cook. One of the first famous TV cooks, Julia Child, was American. She began her career as a cook when, in 1948, she moved to Paris and learnt to cook sophisticated French cuisine because her husband loved good food. On her return home, she published a collection of French recipes made simple, for ordinary American housewives to use, which was an instant success. She was invited to do a TV show, where her humour and strong personality soon won her great fame.

**C** Nowadays TV chefs are famous for all sorts of different reasons. Gordon Ramsay, for example, is an interesting TV chef. He is famous for having a bad temper and using foul language. In his TV show, Hell's Kitchen, he shouts at his staff when they make mistakes because he wants all the food at his restaurants to be perfect. He has many restaurants in different countries. Jamie Oliver is a good-looking, working-class boy who made healthy eating fashionable. He believes children should eat healthy food and he worked with the government to make school meals healthier. His style of cooking is quick, easy and fun.

**D** There are some famous pairs of TV cooks as well. The Hairy Bikers are a pair of chefs who have beards and ride motorbikes. They travel around to different places and cook there. They were both fat but then did a series of shows on how to cook diet food and both lost weight. Another famous pair was the Two Fat Ladies. They cooked unhealthy food using lots of fat and they didn't care about healthy eating. They also rode a motorbike.

**E** The introduction of a competitive element to many cookery shows reminds us that food TV is more entertainment than education these days. Many of us love shows like Masterchef, where a contestant is eliminated on every show. The personalities of both the contestants and the judges are far more important than the cookery. In a popular competitive show called The Great British Bake-Off, there was a 'nice judge', Mary Berry, and a 'nasty judge', Paul Hollywood.

**F** We know that cooking at home is better for us than eating ready-made or takeaway meals. However, the fact that there is more cookery on TV doesn't necessarily mean people cook more. Different studies have produced different results, but most agree that people generally spend less time cooking than they did in the past. Certain cookery shows influence viewers more than others. One study found that the most influential show was Jamie Oliver's 15 Minute Meals, which influenced 21% of viewers. This may be because his method is to cook quick, simple, healthy meals rather than 'restaurant-style' food.

**G** It seems, though, that teaching children to cook at home and at school has much more influence on healthy eating than watching TV programmes on cooking. Grandparents have an important role to play because they may have more time and experience than parents. Cooking with family members on a regular basis and making food preparation part of the school curriculum is likely to ensure that children become adults who can and do cook.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T32 = `Mike: So, what type of meal do you think we should have at the party, Jane?
Jane: I don't know, Mike. Do you have any ideas?
Mike: What do you think about preparing a Mexican meal?
Jane: I really like Mexican food and we could have some fun Mexican party games, but I think it might be too spicy for some people.
Mike: That's true. We could have pizza. Everybody likes pizza.
Jane: Hmm, I think we should have something healthier.
Mike: I know! We could have salad and roast chicken.
Jane: That sounds like a good idea. And it's fairly simple to prepare. Let's do that.`;

const T33 = `A: So do you think that we now have everything ready for the meal?
B: Almost, I was just wondering what would be the best way of preparing the potatoes.
A: Well, you could just boil them and serve them with the fish.
B: That would be easy, but I don't think it would be very exciting.
A: What about frying them? Everybody likes fried potatoes.
B: They aren't very healthy though, and I haven't got much oil left.
A: You could bake them and serve them with the salad Elly's preparing.
B: That would taste good, but it takes ages to bake potatoes in the oven. I know, I'll boil them and then put them with Elly's salad.`;

const T34 = `A: Before we go back to the flat, I think we need to check we have everything that we need.
B: OK, well you went to Arcadia, so I imagine that you got the strawberries and apples from there?
A: Yes, I did.
B: Did you notice if they had any cucumbers while you were over there?
A: I'm not sure. I thought you were going to get them.
B: Well I went over to Best Buy, and I got some nice carrots and peas, but I didn't like the look of the cucumbers.
A: Oh, I suppose we can go there on the way back to the station.
B: Don't forget we need to get some cakes and pastries too. We can get those after we've been to Hampton's to get the lamb and chicken.
A: OK, good plan.`;

const T35 = `A: In this new series of 'Talk of the Town' we'll be looking at the different restaurants in and around Ogdenville and getting some tips and recommendations from our resident food critic, Chris Griffin. So Chris, where have you been this week?
B: Well, one restaurant that I really enjoyed is Adam's. It's on the Town Square. I ordered a steak au poivre and it was perfect.
A: What's that?
B: It's a steak in peppercorns – it's quite a typical French dish.
A: So, is it a French restaurant or a steakhouse?
B: Well, the chef is French, but it serves food from all over the world. It has a wide variety of dishes. One word of warning though, it gets really busy at weekends, so you should check they have places before you go.
A: Have you got any other recommendations for us this week, Chris?
B: Oh, yes. I can really recommend the Duke on Smith Street. I had lobster and it was really tasty. It also has a few vegetarian dishes, but it's the fish dishes that make it famous in the town. The food isn't that low-cost though, so you might want to save going here for a special treat.
A: What about people who are on a budget? Have you got any suggestions for them?
B: Yes, I have. The Tower in Market Street is a fashionable restaurant where people can get a good meal at a reasonable price. I had a pizza, but it isn't a fast food restaurant, it specialises in all different types of food from Italy. I've heard that the lasagne is especially good.
A: Thanks, Chris. You certainly have given us all food for thought.`;

const T36 = `Chef: I suppose one thing that everybody knows about Japanese, Chinese and Korean cooking is that they all use chopsticks rather than knives and forks like people in the West. The chopsticks that people use in the different countries are quite different though. In China the chopsticks tend to be made of wood and are round at the end, whereas in Korea they're made of stainless steel and are rough at the end. This is because in the past the emperor would use silver chopsticks, as they changed colour if there was any poison in the dish. They can be quite tricky to use, but in Korea people use a spoon to eat their rice. In Japan they use a variety of things to make chopsticks. Wood and plastic are the most popular now, but you can find bone, metal and even ivory ones.
If we look at the food of the different countries, it's very difficult to talk about China in general terms because it has many different cuisines. So it might be better if we look at Korean and Japanese food a little more. It's well known that Koreans tend to like spicier food and red peppers can be found in a wide number of dishes. I suppose that everybody thinks of sushi when they think of Japanese food, but you can also find a lot of influences from all over Asia and even Europe, for example tempura, which came to Japan from Portugal. Those aren't present in Chinese and Korean food.
Traditionally, in both Japan and in Korea meat plays less of an important role than in Europe, perhaps because it's so expensive due to the lack of space for keeping animals. That said, both the Japanese and Koreans enjoy meat. Barbecues of all types are popular in Korea and beef forms the basis of many special meals in both of the countries. Now moving back to Chinese cuisine …`;

const T37 = `Interviewer: Today in the studio I am pleased to have with me the famous chef, Graham Shepherd. Graham has just come back from Beijing in China, where he was making a TV programme on the food you can try in this historic city. So, Graham, what can you tell us about your trip? Was it how you expected it to be?
Graham: It was quite surprising really. I suppose that most people think of Beijing duck when they think of Beijing and I did try some of this tasty traditional dish, but with so many people from all over the country living in Beijing there really are a lot of different foods from all regions of the country. One dish that I really enjoyed and I didn't expect to find was kebabs. These tasty snacks are originally from north-west China, but they're very popular street food in Beijing. They're especially popular as a tasty snack at lunchtime for school pupils. They have less meat and more vegetables than we are used to, so they're a bit healthier.
Interviewer: I'm sure that most people have tried kebabs, but did you try anything that might be unusual for our listeners?
Graham: Oh, yes. One of the things that I had was jellyfish. It added a nice texture to the dish, but I thought it didn't taste of much. One dish that did have a strong taste was hotpot. The dish I had was made in the Sichuan style, so it was very spicy. What I found interesting was that the hotpot was put on a hotplate in the centre of the table, and we were given a dish of raw food and we chose what we wanted and put it into the pot ourselves, and got it out when it was ready. It was great fun and very sociable. And very tasty!
Interviewer: I'm sure that you tried some of the dishes that we all know and love too. Can you tell us something interesting about them?
Graham: Of course, everybody knows about noodles and dumplings, but I doubt many people know how many different types there are! One of the highlights for me was learning how to make fresh noodles with a chef from Northern China. The recipe of egg, salt and wheat flour is quite simple, but to make the noodles by hand you need to be quite a skilful chef.
Something which is much simpler to make are dumplings. The basic ingredients are flour and water, but the beauty of this dish is that it's very flexible. You can fill them with whatever you like. I especially enjoyed one with raw prawns, but all sorts of meat and vegetables can be put in them.
Interviewer: Thanks Graham, that's really interesting, but unfortunately we've run out of time. If you'd like to know more about Graham's adventures, the series will be starting on Thursday at 7 o'clock on Channel 9.`;

const R_VOCAB = `eat with one's fingers: ăn bốc
fingertip: đầu ngón tay
palm: lòng bàn tay
attempt: lần thử, nỗ lực
fast food culture: văn hóa đồ ăn nhanh
junk food: đồ ăn không lành mạnh
grab a sandwich: ăn vội một cái bánh mì kẹp
grow one's own vegetables: tự trồng rau
keep chickens: nuôi gà
identity: bản sắc
fizzy drink: nước ngọt có ga
be polite: lịch sự
get used to: quen với
vegetarian: người ăn chay
for ethical reasons: vì lý do đạo đức
prosperity: sự thịnh vượng, giàu có
be alien to sb: xa lạ với ai
culture shock: cú sốc văn hóa
steamed vegetables: rau hấp
can't face sth: không nuốt nổi, không thiết (ăn) cái gì
cookery show: chương trình dạy nấu ăn
sophisticated: tinh tế, cầu kỳ
cuisine: ẩm thực
recipe: công thức nấu ăn
an instant success: thành công ngay lập tức
have a bad temper: nóng tính
foul language: ngôn từ thô tục
make healthy eating fashionable: biến ăn uống lành mạnh thành xu hướng
lose weight: giảm cân
competitive element: yếu tố cạnh tranh
contestant: thí sinh
be eliminated: bị loại
ready-made meals: đồ ăn chế biến sẵn
influential: có sức ảnh hưởng
on a regular basis: một cách thường xuyên
school curriculum: chương trình học ở trường`;

const L_VOCAB = `spicy: cay
simple to prepare: dễ chuẩn bị
boil: luộc
fry: chiên, rán
bake: nướng (bằng lò)
serve sth with: dọn món gì kèm với
take ages: mất rất nhiều thời gian
tips and recommendations: lời khuyên và gợi ý
food critic: nhà phê bình ẩm thực
a wide variety of: rất nhiều loại
word of warning: lời cảnh báo
tasty: ngon
low-cost: giá rẻ
a special treat: dịp tự thưởng đặc biệt
be on a budget: phải chi tiêu dè sẻn
specialise in: chuyên về
food for thought: điều đáng suy ngẫm
chopsticks: đũa
stainless steel: thép không gỉ
tricky: khó, rắc rối
in general terms: nói chung
play a role: đóng vai trò
due to the lack of: do thiếu
form the basis of: là nền tảng của
historic city: thành phố cổ, giàu lịch sử
street food: đồ ăn đường phố
texture: kết cấu (độ dai, giòn của món ăn)
raw: sống, chưa nấu
sociable: mang tính giao lưu, vui vẻ
dumpling: bánh bao, sủi cảo
skilful: khéo léo, lành nghề
ingredient: nguyên liệu
flexible: linh hoạt
run out of time: hết thời gian
hotpot: món lẩu`;

module.exports = {
  n: 4,
  title: 'Food and drink',
  titleVi: 'Ẩm thực',
  pages: '64–69, 75–79',
  outcomes: [
    'Reading: định vị thông tin nhanh; nối thông tin với người/đoạn (matching information, matching features); sentence completion 1 từ',
    'Grammar: danh từ đếm được / không đếm được; some, any, much, many',
    'Listening: matching — nhận diện "distractors"; classification A–C; synonym & paraphrase',
    'Từ vựng món ăn, cách chế biến, văn hoá ẩm thực (Sổ 2)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: food and food culture',
      titleEn: 'Lead-in · Locating information in a text (pp. 64–65)',
      slot: SLOT,
      minutes: 35,
      objectives: ['Gọi tên món ăn và phân loại đếm được / không đếm được', 'Đọc lướt "Food culture shock" — 5 người kể về cú sốc văn hoá ẩm thực'],
      images: ['media:m1u04-foods.jpg|Ex. 1 (p. 64): pictures 1–8'],
      theory: [
        card('Đếm được hay không đếm được', 'Countable and uncountable food words', {
          usage: ['**Countable**: có số nhiều — three apples, burgers, chips, noodles, vegetables.', '**Uncountable**: không có số nhiều, không dùng a/an — bread, cereal, rice, curry, salad, toast, mashed potato.', '**chicken / fish** là thịt/cá dùng làm món ăn → không đếm được (some chicken); khi là con vật → đếm được (two chickens).'],
        }),
      ],
      vocab: vocabFrom(R_VOCAB, [SHOCK, FOODTV]),
      ex: [
        match('Foods in the pictures (Ex. 1)', 'Find the foods in the pictures 1–8.', [
          ['Picture 1', 'curry and rice'], ['Picture 2', 'cereal'], ['Picture 3', 'mashed potato'], ['Picture 4', 'fish and chips'],
          ['Picture 5', 'noodles, vegetables and chicken'], ['Picture 6', 'chicken and salad'], ['Picture 7', 'toast'], ['Picture 8', 'burger'],
        ], { stimulus: picture('media:m1u04-foods.jpg', 'Ex. 1') }),
        cat('Countable or uncountable? (Ex. 1)', 'Put the food words into the correct column: countable or uncountable.', { c: 'Countable', u: 'Uncountable' }, [
          ['burger', 'c'], ['cereal', 'u'], ['chips', 'c'], ['curry', 'u'], ['fish', 'u'], ['mashed potato', 'u'],
          ['chicken', 'u'], ['noodle', 'c'], ['rice', 'u'], ['salad', 'u'], ['toast', 'u'], ['vegetable', 'c'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: locating & matching information',
      titleEn: 'Locating information · Paraphrase · Sentence completion · Exam skills (pp. 65–69)',
      minutes: 55,
      objectives: ['Tìm rất nhanh thông tin cụ thể (một từ, một tên nước)', 'Nối câu hỏi "Who…?" với người nói nhờ paraphrase', 'Hoàn thành câu bằng 1 từ trong bài', 'Matching information (đoạn nào chứa…) và matching features (nối mô tả với tên người)'],
      theory: [
        card('Tìm thông tin cụ thể', 'Locating information in a text', {
          usage: ['Có câu hỏi chỉ cần **một chi tiết** (a food used as glue → daal). Scan tìm từ khoá hoặc **từ cùng nghĩa** (glue ↔ "a kind of glue").', 'Định vị nhanh còn giúp làm **sentence completion**: tìm đúng câu rồi chọn từ phù hợp ngữ pháp.'],
        }),
        card('Paraphrase trong câu hỏi "Who…?"', 'Paraphrase', {
          usage: ['Câu hỏi: *Who is concerned about healthy eating?* → **Alfredo** — đoạn B không có cụm "healthy eating" nhưng có các manh mối: "fast food culture always shocks me", "rubbish which contains chemicals", "a baby being given a fizzy drink".', 'Đọc cả **ý của câu**, không chỉ tìm từ giống hệt.'],
        }),
        card('Matching information & matching features', 'Exam skills: matching', {
          formula: ['**Which paragraph contains…?** → nối thông tin với đoạn A–G. **NB You may use any letter more than once** = một đoạn có thể là đáp án nhiều lần.', '**Matching features** → nối mô tả với tên (người/vật) trong danh sách.'],
          usage: ['Câu hỏi matching information **không theo thứ tự** bài → đọc lướt từng đoạn, nhớ đại ý mỗi đoạn.', 'Với matching features, scan **tên riêng** trước, rồi đọc kỹ câu quanh tên đó.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U04-R1', title: 'Food culture shock (Ex. 4–6)', note: 'Locate information · Who…? · sentence completion.' },
        { ref: 'reading:M1-U04-R2', title: 'Exam skills: Food TV — education or entertainment? (Ex. 9–10)', note: 'Matching information A–G + matching features (chefs).' },
      ],
      ex: [
        match('Questions and evidence (Ex. 5)', 'Match questions 1–6 with the evidence a–f from the text.', [
          ['Who realised that some people eat the same dishes for different meals?', "But when I travelled in Asia, I realised that in many places, there is no difference between breakfast and dinner", 'Aileen (E): no difference between breakfast and dinner = eat the same dishes for different meals.'],
          ['Who dislikes the takeaway culture?', "I can't believe there are people in the world who live on 'junk food'", "Alfredo (B): fast food/junk food ↔ takeaway culture."],
          ['Who discusses travelling for people on a special diet?', '… we forget that not everyone in the world understands vegetarianism.', 'Pauline (D): vegetarian/vegan = special diet.'],
          ['Who talks about what is considered polite in different cultures?', "In China, when we are offered something, we say 'No thanks' … In other countries, though, 'no' means 'no'", 'Qiang Shi (C).'],
          ['Who found it difficult to learn a new way of eating?', 'I thought I knew where my mouth was, but my first few attempts were a disaster.', 'Charles (A): ăn bốc lần đầu thất bại.'],
          ['Who talks about producing your own food?', 'A lot of people grow their own vegetables and keep chickens.', 'Alfredo (B): grow vegetables, keep chickens = producing your own food.'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: countable & uncountable nouns',
      titleEn: 'Grammar focus: countable and uncountable nouns · some, any, much, many (p. 66)',
      minutes: 30,
      objectives: ['Sửa lỗi thường gặp với danh từ không đếm được (fruit is, chicken)', 'Bỏ "the" khi nói chung chung (Burgers and pizza…, vegetarian food)', 'Dùng some / any / much / many'],
      keyLanguage: [
        'Danh từ không đếm được + **động từ số ít**: Fresh fruit **is** healthy (không phải fruit are). Đại từ thay thế: **it** (không phải them).',
        'Nói **chung chung** → không dùng "the": **Burgers and pizza** are the cheapest foods. In **India** (không có the) it is easy to find **vegetarian food**.',
        '**some**: khẳng định + lời mời/đề nghị (Can I have some more cake?) · **any**: phủ định/câu hỏi · **many** + số nhiều · **much** + không đếm được (How much rice…?).',
      ],
      theory: [
        card('some / any / much / many', 'Quantifiers', {
          formula: ['some + N (số nhiều / không đếm được) — câu khẳng định, lời đề nghị', 'any + N — câu hỏi, câu phủ định', 'many + N đếm được số nhiều · much + N không đếm được (thường trong câu hỏi, phủ định)'],
          examples: [['There are some mushrooms in the fridge.', 'Khẳng định.'], ["I don't put much sugar in my tea.", 'Phủ định + không đếm được.'], ['How much rice do you eat every week?', 'Câu hỏi + không đếm được.']],
        }),
      ],
      links: [{ grammar: 'countable-uncountable', title: 'Countable vs Uncountable', note: 'some, any, much, many' }, { grammar: 'articles', title: 'Articles (a / an / the)', note: 'khi nào bỏ "the"' }],
      ex: [
        fix('Correct the errors (Ex. 7)', 'Correct the errors in these sentences.', [
          ['Fresh fruit are healthy and we should eat them every day.', 'Fresh fruit is healthy and we should eat it every day.', 'fruit không đếm được → is, it.'],
          ['Chips cooked in the oven is healthier than fried chips.', 'Chips cooked in the oven are healthier than fried chips.', 'chips số nhiều → are.'],
          ['The burgers and the pizza are the cheapest foods you can buy.', 'Burgers and pizza are the cheapest foods you can buy.', 'Nói chung chung → bỏ the.'],
          ['In the India it is easy to find the vegetarian food.', 'In India it is easy to find vegetarian food.', 'Tên nước không dùng the; vegetarian food nói chung → bỏ the.'],
          ['My favourite food is chickens.', 'My favourite food is chicken.', 'Thịt gà (món ăn) không đếm được.'],
        ]),
        gap('some, any, much or many? (Ex. 8)', 'Complete the sentences with some, any, much or many.', [
          ['There are ____ mushrooms in the fridge.', 'some'],
          ['Are ____ people vegetarian in your country?', 'many'],
          ["I don't put ____ sugar in my tea – just half a spoonful.", 'much'],
          ['Do we have ____ flour left?', 'any|much'],
          ['Can I have ____ more cake, please?', 'some', 'Lời đề nghị/yêu cầu → some.'],
          ['How ____ rice do you eat every week?', 'much'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: matching & classification',
      titleEn: 'Lead-in · Matching tasks · Synonym and paraphrase · Classification tasks · Exam skills (pp. 75–79)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Từ vựng cách chế biến và nhóm thực phẩm', 'Matching: nghe hết thông tin về mọi phương án, loại "distractors"', 'Nhận ra câu đồng nghĩa / không đồng nghĩa', 'Classification: nối câu với A–C (dùng lại được)'],
      images: ['media:m1u04-cooking.jpg|Ex. 1 (p. 75): ways of preparing food A–D'],
      theory: [
        card('Matching tasks và distractors', 'Matching tasks', {
          usage: ['Bạn có thể nghe thông tin về **nhiều phương án**, nhưng chỉ **một** đúng (Jane bác Mexican vì quá cay, bác pizza vì muốn món lành mạnh hơn → chọn salad & roast chicken).', '**Distractor** = phương án được nhắc đến nhưng bị phủ định/không phù hợp ("is it a French restaurant? – Well, … it serves food from all over the world").', 'Không cần dùng hết các chữ cái; câu hỏi đi **theo thứ tự** bài nghe.'],
        }),
        card('Classification tasks', 'Classification', {
          formula: ['Nối nhiều câu (1–5) với **3 lựa chọn A–C**; mỗi chữ cái **dùng lại được**.'],
          usage: ['Nghe **ý**, không chờ đúng từ: "hot, peppery food" ↔ "spicier food… red peppers" (Korea); "different types of regional cooking" ↔ "many different cuisines" (China).'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U04-L1', title: 'Planning a party meal (Ex. 3)', note: 'Nối gợi ý của Mike với câu trả lời của Jane.' },
        { ref: 'listening:M1-U04-L2', title: 'Preparing the potatoes (Ex. 4)', note: 'Boil, bake hay fry?' },
        { ref: 'listening:M1-U04-L3', title: 'Food shopping (Ex. 5)', note: 'Nối cửa hàng với loại thực phẩm.' },
        { ref: 'listening:M1-U04-L4', title: 'Talk of the Town: three restaurants (Ex. 6)', note: 'Nối nhà hàng với loại nhà hàng A–G.' },
        { ref: 'listening:M1-U04-L5', title: 'A TV chef: China, Japan, Korea (Ex. 11)', note: 'Classification A–C.' },
        { ref: 'listening:M1-U04-L6', title: 'Exam skills: food in Beijing (Ex. 12)', note: 'Chọn 4 món A–F cho câu 1–4.' },
      ],
      vocab: vocabFrom(L_VOCAB, [T32, T33, T34, T35, T36, T37]),
      ex: [
        match('Ways of preparing food (Ex. 1)', 'Label the different ways of preparing food with verbs from the box: bake, boil, fry, grill.', [
          ['Picture A', 'boil'], ['Picture B', 'fry'], ['Picture C', 'bake'], ['Picture D', 'grill'],
        ], { stimulus: picture('media:m1u04-cooking.jpg', 'Ex. 1') }),
        cat('Types of food (Ex. 2)', 'Match the words with the type of food they are.', { m: 'Meat dishes', v: 'Vegetables', f: 'Fruits', s: 'Sweets' }, [
          ['beef', 'm'], ['steak', 'm'], ['burger', 'm'], ['lamb', 'm'], ['potatoes', 'v'], ['carrots', 'v'], ['cucumbers', 'v'], ['peas', 'v'],
          ['apples', 'f'], ['strawberries', 'f'], ['pears', 'f'], ['bananas', 'f'], ['biscuits', 's'], ['cake', 's'], ['chocolate', 's'], ['pastries', 's'],
        ]),
        match('Words in the script (Ex. 8)', 'Find words in the Listening script of exercise 6 that mean the following.', [
          ['crowded', 'busy'], ['delicious', 'tasty'], ['cheap', 'low-cost'], ['smart', 'fashionable'], ['inexpensive', 'reasonable'],
        ]),
        mcq('Synonym and paraphrase (Ex. 9)', 'Choose the option, A, B or C, which does NOT mean the same as the first sentence.', [
          ['The price of food in the restaurant is cheap.', ['The price of a meal in the restaurant is reasonable.', 'The restaurant is excellent if you want a budget meal.', 'The food in the restaurant is overpriced.'], 'C', 'overpriced = quá đắt (ngược với cheap).'],
          ['Marco cooked us a really tasty meal.', ['The meal Marco prepared was delicious.', 'Marco cooked us a really unappetising meal.', 'The meal Marco made for us was mouth-watering.'], 'B', 'unappetising = không ngon miệng.'],
          ['We were served food that was cooked in the old-fashioned way.', ['The meal we had was very contemporary in style.', 'The meal we had was very traditional.', 'The meal was made from a historic recipe.'], 'A', 'contemporary = hiện đại (ngược với old-fashioned).'],
          ['When I went to Thailand, I really enjoyed trying the street food.', ['I really liked tasting the food that was sold outdoors in Thailand.', 'In Thailand I loved the food we bought from stalls in the streets.', 'I enjoyed eating at restaurants when I was in Thailand.'], 'C', 'restaurants ≠ street food.'],
          ['The chef at the Lodge Hotel is very skilful.', ['The chef at the Lodge Hotel is bad at his job.', 'The chef at the Lodge Hotel has a lot of expertise.', 'The chef at the Lodge Hotel is highly trained.'], 'A'],
          ['The ingredients for the recipe can be changed to ones you have available.', ["You can use different ingredients to make this dish if you can't find everything.", 'You can be flexible about what ingredients you add to this recipe.', "You should follow the recipe strictly or it won't taste good."], 'C', 'strictly = nghiêm ngặt (ngược với can be changed).'],
          ['The chef at the new restaurant is famous across the country.', ['The chef at the new restaurant is well known nationally.', 'The chef at the new restaurant is recognised across the country.', 'The chef at the new restaurant is unknown outside of his town.'], 'C'],
          ["I didn't like the soup; it was too spicy.", ['The soup had too much pepper.', "The soup wasn't tasty.", 'The soup was a bit too hot for my taste.'], 'B', '"wasn\'t tasty" = không ngon — không nói đến cay.'],
        ]),
        match('Words that helped you (Ex. 10)', 'Match the words in the first sentences of exercise 9 with the words in the options that mean the same.', [
          ['cheap', 'reasonable, budget'], ['tasty', 'delicious, mouth-watering'], ['old-fashioned', 'traditional, historic'], ['street food', 'sold outdoors, from stalls in the streets'],
          ['skilful', 'expertise, highly trained'], ['can be changed', 'use different ingredients, flexible'], ['famous', 'well known, recognised'], ['too spicy', 'too much pepper, too hot'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U04-R1',
      title: 'Mindset 1 · Unit 4 — Food culture shock',
      content: html(SHOCK),
      questionGroups: [
        qFill(1, 'Quickly find the following information in the text. Write ONE WORD for each answer. (Ex. 4)', [
          ["a food that can be used as a 'glue'", 'daal / dal / dhal', 'A (Charles): "**Daal** is particularly helpful as a kind of glue."'],
          ['a meat not usually eaten for breakfast in Australia', 'chicken', 'E (Aileen): "We would never eat **chicken** or vegetables."'],
          ["a country where 'no' doesn't always mean 'no'", 'China', 'C (Qiang Shi): "In **China**… we say \'No thanks\', even though we want it".'],
          ["an example of a 'junk food'", 'burgers / burger', 'B (Alfredo): "\'junk food\' like **burgers**".'],
          ['a country which is easy for vegetarians', 'India', 'D (Pauline): "Probably the best place I\'ve been to is **India**".'],
          ['a food eaten with fingers in the US', 'burgers / burger', 'A (Charles): "In the US… you can eat with your fingers, like **burgers**".'],
        ], 'Questions 1–6'),
        qMatch(7, 'Which person (A–E): (Ex. 5) NB You may use any letter more than once.', ['A Charles', 'B Alfredo', 'C Qiang Shi', 'D Pauline', 'E Aileen'], [
          ['realised that some people eat the same dishes for different meals?', 'E', 'Aileen: "in many places, there is **no difference between breakfast and dinner**".'],
          ['dislikes the takeaway culture?', 'B', 'Alfredo: "the \'fast food\' culture always shocks me".'],
          ['discusses travelling for people on a special diet?', 'D', 'Pauline: vegetarian, vegans.'],
          ['talks about what is considered polite in different cultures?', 'C', 'Qiang Shi: "if you are just trying to be polite and don\'t take it the first time…".'],
          ['found it difficult to learn a new way of eating?', 'A', 'Charles: "my first few attempts were a disaster".'],
          ['talks about producing your own food?', 'B', 'Alfredo: "grow their own vegetables and keep chickens".'],
        ], { title: 'Questions 7–12', optionsTitle: 'People', reuse: true }),
        qFill(13, 'Complete these sentences using ONE word from the text. (Ex. 6)', [
          ['In China, if you refuse food, the host will usually ______ the offer.', 'repeat', 'C: "the person will definitely **repeat** the offer".'],
          ["For Alfredo, food plays an important role in a person's ______.", 'identity', 'B: "Food is part of your **identity**".'],
          ['In India, you should not use your ______ when eating.', 'palm / palms', 'A: "You use your fingertips, never the **palm** of your hand".'],
          ['In some countries, eating meat represents ______.', 'prosperity', 'D: "meat equates to **prosperity**" (equates to = represents).'],
          ['In many places in ______, there is no difference between foods eaten for breakfast and dinner.', 'Asia', 'E: "when I travelled in **Asia**, I realised that in many places, there is no difference between breakfast and dinner".'],
        ], 'Questions 13–17'),
      ],
    },
    {
      ref: 'M1-U04-R2',
      title: 'Mindset 1 · Unit 4 — Food TV: education or entertainment?',
      content: html(FOODTV),
      questionGroups: [
        qMatch(1, 'Read the article about Food TV. Which paragraphs contain the following information? Write the correct letter, A–G. NB You may use any letter more than once.', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
          ['The cooking show that affects people most', 'F', 'F: "the most influential show was Jamie Oliver\'s 15 Minute Meals" (affects people most = most influential).'],
          ['A TV chef who was first famous as an author', 'B', 'B: Julia Child "published a collection of French recipes… an instant success. She was invited to do a TV show".'],
          ['The number of food shows on TV', 'A', 'A: "the BBC showed 21 hours of cookery… 434.5 hours of food TV".'],
          ['The role of cookery shows for enjoyment rather than learning', 'E', 'E: "food TV is more entertainment than education these days".'],
          ['Why children should be taught to cook at school', 'G', 'G: "making food preparation part of the school curriculum is likely to ensure that children become adults who can and do cook".'],
          ['Research about the amount of time people cook', 'F', 'F: "most agree that people generally spend less time cooking than they did in the past".'],
          ['Examples of famous cookery partners', 'D', 'D: "There are some famous pairs of TV cooks… The Hairy Bikers… the Two Fat Ladies".'],
        ], { title: 'Questions 1–7', reuse: true, type: 'matching-info' }),
        qMatch(8, 'Look at the following descriptions (8–14) and the list of famous chefs. Match each description with the correct chef, A–F. NB You may use any letter more than once.', ['A Mary Berry', 'B Jamie Oliver', 'C The Hairy Bikers', 'D Gordon Ramsay', 'E Julia Child', 'F Two Fat Ladies'], [
          ['Changed the style of cooking on some of their programmes', 'C', 'D: The Hairy Bikers "were both fat but then did a series of shows on how to cook diet food".'],
          ['One of the first TV chefs', 'E', 'B: "One of the first famous TV cooks, Julia Child".'],
          ['Helped to get children eating healthy food', 'B', 'C: Jamie Oliver "worked with the government to make school meals healthier".'],
          ['The kinder of two judges', 'A', 'E: "a \'nice judge\', Mary Berry, and a \'nasty judge\', Paul Hollywood".'],
          ['Cooked food that was not very good for you', 'F', 'D: Two Fat Ladies "cooked unhealthy food using lots of fat".'],
          ['Is very rude to the kitchen workers', 'D', 'C: Gordon Ramsay "shouts at his staff… using foul language".'],
          ['Showed people that cooking foreign dishes need not be difficult', 'E', 'B: Julia Child published "French recipes made simple, for ordinary American housewives".'],
        ], { title: 'Questions 8–14', optionsTitle: 'Famous chefs', reuse: true }),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U04-L1', title: 'Mindset 1 · Unit 4 — Planning a party meal',
      description: 'Mike and Jane decide what to cook for a party.', partNumber: 1, audioFile: 'Mindset_L1_32.mp3', transcript: T32,
      questionGroups: [
        qMatch(1, "Listen to two friends talking about a party they are planning. Match Mike's suggestions (1–3) with Jane's answers (A–C). (Ex. 3)", ['A I think we should have something healthier.', "B That sounds like a good idea. Let's do that.", 'C I think it might be too spicy for some people.'], [
          ['What do you think about preparing a Mexican meal?', 'C', lx('Làm món Mexico thì sao?', 'Gợi ý 1.', "I think it might be too spicy for some people", '')],
          ['We could have pizza. Everybody likes pizza.', 'A', lx('Mình có thể làm pizza.', 'Gợi ý 2.', 'I think we should have something healthier', '')],
          ['I know! We could have salad and roast chicken.', 'B', lx('Mình làm salad và gà quay nhé!', 'Gợi ý 3.', "That sounds like a good idea. And it's fairly simple to prepare. Let's do that", 'Họ sẽ làm salad và gà quay.')],
        ], { title: 'Questions 1–3', optionsTitle: "Jane's answers", type: 'matching' }),
      ],
    },
    {
      ref: 'M1-U04-L2', title: 'Mindset 1 · Unit 4 — Preparing the potatoes',
      description: 'Two friends talk about preparing a meal.', partNumber: 1, audioFile: 'Mindset_L1_33.mp3', transcript: T33,
      questionGroups: [
        qMcq(1, 'Listen to two friends talking about preparing a meal. (Ex. 4)', [
          ['How are they going to prepare the potatoes?', ['boil', 'bake', 'fry'], 'A', lx('Họ sẽ chế biến khoai tây thế nào?', 'Câu cuối.', ["They aren't very healthy though, and I haven't got much oil left", 'it takes ages to bake potatoes in the oven', "I know, I'll boil them"], 'Chiên không tốt cho sức khoẻ, nướng mất quá lâu → luộc. Chờ đến câu quyết định cuối cùng.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M1-U04-L3', title: 'Mindset 1 · Unit 4 — Food shopping',
      description: 'Two friends check their food shopping.', partNumber: 1, audioFile: 'Mindset_L1_34.mp3', transcript: T34,
      questionGroups: [
        qMatch(1, 'Listen to two friends discussing food shopping. Match the names of the shops (1–3) with the different types of food, A–D. (Ex. 5)', ['A vegetables', 'B meat', 'C fruit', 'D sweets'], [
          ['Arcadia', 'C', lx('Arcadia', 'Đầu bài.', 'you went to Arcadia, so I imagine that you got the strawberries and apples from there?', 'strawberries, apples = fruit.')],
          ['Best Buy', 'A', lx('Best Buy', 'Giữa bài.', 'I went over to Best Buy, and I got some nice carrots and peas', 'carrots, peas = vegetables. Dưa chuột cũng ở đây nhưng chưa mua.')],
          ["Hampton's", 'B', lx("Hampton's", 'Cuối bài.', ["we need to get some cakes and pastries too. We can get those after we've been to Hampton's to get the lamb and chicken"], 'BẪY: cakes and pastries (D) được nhắc nhưng mua SAU khi đi Hampton\'s; ở Hampton\'s họ mua lamb and chicken = meat. D không khớp cửa hàng nào.')],
        ], { title: 'Questions 1–3', optionsTitle: 'Types of food', type: 'matching' }),
      ],
    },
    {
      ref: 'M1-U04-L4', title: "Mindset 1 · Unit 4 — Talk of the Town: three restaurants",
      description: 'A food critic recommends restaurants in Ogdenville.', partNumber: 1, audioFile: 'Mindset_L1_35.mp3', transcript: T35,
      questionGroups: [
        qMatch(1, 'Look at the names of restaurants (1–3) and the list of types of restaurant. Match each restaurant with the correct type, A–G. (Ex. 6)', ['A vegetarian', 'B steakhouse', 'C seafood', 'D Italian', 'E international', 'F French', 'G fast food'], [
          ["Adam's", 'E', lx("Adam's", 'Đầu bài.', ["So, is it a French restaurant or a steakhouse?", 'the chef is French, but it serves food from all over the world'], 'BẪY: steak au poivre là món Pháp, đầu bếp người Pháp — nhưng nhà hàng phục vụ món khắp thế giới → international.')],
          ['The Duke', 'C', lx('The Duke', 'Giữa bài.', ["I had lobster", "It also has a few vegetarian dishes, but it's the fish dishes that make it famous"], 'BẪY: có vài món chay, nhưng nổi tiếng nhờ món cá → seafood.')],
          ['The Tower', 'D', lx('The Tower', 'Cuối bài.', ["I had a pizza, but it isn't a fast food restaurant, it specialises in all different types of food from Italy"], 'BẪY: pizza nhưng "isn\'t a fast food restaurant" → Italian.')],
        ], { title: 'Questions 1–3', optionsTitle: 'Types of restaurant', type: 'matching' }),
      ],
    },
    {
      ref: 'M1-U04-L5', title: 'Mindset 1 · Unit 4 — Chopsticks and cuisines',
      description: 'A TV chef talks about Chinese, Japanese and Korean food.', partNumber: 1, audioFile: 'Mindset_L1_36.mp3', transcript: T36,
      questionGroups: [
        qMatch(1, 'Listen to a famous TV chef talking about different countries and their cuisines. Match the statements with the correct country, A–C. You may use any letter more than once. (Ex. 11)', ['A China', 'B Japan', 'C Korea'], [
          ['They use chopsticks made of several different materials.', 'B', lx('Họ dùng đũa làm từ nhiều chất liệu khác nhau.', 'Đoạn đầu.', 'In Japan they use a variety of things to make chopsticks. Wood and plastic … bone, metal and even ivory ones', 'China: gỗ; Korea: thép không gỉ; Japan: nhiều chất liệu.')],
          ['You can find a lot of different types of regional cooking here.', 'A', lx('Ở đây có nhiều kiểu nấu ăn vùng miền.', 'Đoạn 2.', "it's very difficult to talk about China in general terms because it has many different cuisines", 'many different cuisines = different types of regional cooking.')],
          ['This place is famous for hot, peppery food.', 'C', lx('Nơi này nổi tiếng với đồ ăn cay.', 'Đoạn 2.', "Koreans tend to like spicier food and red peppers can be found in a wide number of dishes", '')],
          ['In this country people use recipes that came from different countries.', 'B', lx('Ở nước này người ta dùng công thức đến từ nước khác.', 'Đoạn 2.', 'you can also find a lot of influences from all over Asia and even Europe, for example tempura, which came to Japan from Portugal', '')],
          ['This country is well known for its grilled meat.', 'C', lx('Nước này nổi tiếng với thịt nướng.', 'Đoạn 3.', 'Barbecues of all types are popular in Korea', 'barbecues = grilled meat.')],
        ], { title: 'Questions 1–5', optionsTitle: 'Countries', reuse: true, type: 'matching' }),
      ],
    },
    {
      ref: 'M1-U04-L6', title: 'Mindset 1 · Unit 4 — Exam skills: food in Beijing',
      description: 'An interview with a chef about his TV programme on food in China.', partNumber: 1, audioFile: 'Mindset_L1_37.mp3', transcript: T37,
      questionGroups: [
        qMatch(1, 'Choose FOUR answers from the types of food in the box and write the correct letter, A–F, next to questions 1–4. Which of the foods… (Ex. 12)', ['A Beijing duck', 'B kebabs', 'C dumplings', 'D noodles', 'E hotpot', 'F jellyfish'], [
          ['is often enjoyed by children?', 'B', lx('Món nào trẻ em thường thích?', 'Đoạn kebabs.', "They're especially popular as a tasty snack at lunchtime for school pupils", 'school pupils = children.')],
          ['can be cooked in a short time by the dinner guests?', 'E', lx('Món nào khách tự nấu nhanh?', 'Đoạn hotpot.', 'we were given a dish of raw food and we chose what we wanted and put it into the pot ourselves, and got it out when it was ready', '')],
          ['needs expertise to make?', 'D', lx('Món nào cần tay nghề?', 'Đoạn noodles.', 'to make the noodles by hand you need to be quite a skilful chef', 'skilful = expertise.')],
          ['can be adapted to your tastes?', 'C', lx('Món nào thay đổi theo khẩu vị được?', 'Đoạn dumplings.', "it's very flexible. You can fill them with whatever you like", 'flexible, whatever you like = adapted to your tastes. Duck và jellyfish không dùng.')],
        ], { title: 'Questions 1–4', optionsTitle: 'Types of food', type: 'matching' }),
      ],
    },
  ],
};
