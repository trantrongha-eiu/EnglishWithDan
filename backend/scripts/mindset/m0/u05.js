// Mindset for IELTS Foundation — Unit 5: Food (pp. 58–69)
const { mcq, gap, match, order, cat, write, speak, passage, picture, card, qMcq, qMatch, qFill, lx } = require('../dsl');

const FESTIVAL_CALL = `Mark: Hi, Jane.
Jane: Oh, hi Mark.
Mark: I'm really looking forward to the food festival. I love Chinese food and I hope our friends can come.
Jane: Well, I'm afraid most of them are busy.
Mark: What, even Marco? He always says he has nothing to do and that he's interested in trying new food.
Jane: Mohammed says Marco has no money. Mohammed can't go because he is helping his flatmate decorate his room.
Mark: But the festival is free!
Jane: Yes, but we have to go there on the underground and I'm sure he'll want to buy some food when he's there.
Mark: Well, I don't have much money either, perhaps Pierre could lend him some. He's got a job and he is Marco's best friend.
Jane: Oh, Pierre can't come either.
Mark: Really? Is he at work? All he thinks about is work!
Jane: No, his parents are coming from France and he's going to show them around London … you know, Big Ben, Tower Bridge …
Mark: OK, what about Hang Vie, her mother owns a Chinese restaurant, she must be interested.
Jane: She is, but she's going to help with the cooking for her family's party on the day we're going. I don't know about Lucy and Larissa though.
Mark: Well, I phoned Lucy, but her flatmate said she was on holiday in Italy and won't be back until the week after the festival.
Jane: I didn't even know she was on holiday. And Larissa?
Mark: She's got a really important exam, so she needs to prepare for it!
Jane: Well, it looks like it's just going to be you and me then. Not to worry. We'll take lots of photos to show everyone!`;

const CHEF_INTRO = `Chef: Today, I'm going to show you how to make one of my favourite recipes. It's a type of food that's been popular for thousands of years. The Jiaozi or dumplings are beautiful and have the shape of a half-moon. You start by making them in a similar way to noodles. You need to make some dough first, but this is quite easy.`;

const CHEF_METHOD = `Chef: OK, so what do you need to make the dumplings? First of all, you need to make the cases. These are the cases which you'll put the other ingredients in. To make the cases, you need to make the dough. Of course, you need flour for this. To make 20 cases, you'll need four cups of flour. Then, mix the flour with two cups of water. Don't forget to add some salt, but only a little to add some taste.
When you've mixed the ingredients, leave the dough for ten minutes in the bowl to make sure it's ready. You can make the filling to go inside the dough while you wait.
There are two main ingredients in the filling. Firstly, you have the cabbage. You need to chop this up finely and add it to another important ingredient, the meat. You can use any meat, but today I'm using lamb. Put the meat and cabbage together and mix it by hand. When it's mixed well, you can add some other ingredients. In China, people like to add spring onions to their dumplings and I do too! I'd like some seafood today, too, so I'm going to add some shrimps. Chop the spring onions and shrimps into small pieces and mix them together with the rest of the filling. To make sure that everything sticks together, add some vegetable oil.
Now that the mixture is ready, you need to finish the cases. First, cut the dough into twenty pieces, making sure they're all the same size, and roll them into flat little circular shapes. Put the mixture into the centre of the cases. Make sure you don't put too much filling in at this stage otherwise you won't be able to close the cases and all the filling will come out when it's cooking. Then, fold them into half-moon shapes. Finally, boil the dumplings three times, and there you have it. Delicious half-moon dumplings ready to eat.`;

const FESTIVAL_TEXT = `This year, the Chinese food festival is at the South Bank Riverside Walkway by the River Thames in London. The three-day food festival celebrates real Chinese cooking and dishes from other countries. You can taste wonderful food at the many food stalls, and watch famous chefs showing you how to make some tasty dishes. All the family can come and enjoy food, traditional Chinese performances and try Chinese arts and crafts.

**The festival starts on 25th September and tickets are free! Just go to our website and download your free ticket.**`;

const MY_MEAL = `I don't usually like cooking meals and because I live alone, I often go to restaurants or eat fast food in the week. At the weekend, I have more free time, so I usually cook my favourite meal. My favourite meal is chicken curry with rice and vegetables. I don't have an oven, so I fry the chicken on its own in a pan and boil the rice in water. I like this meal so much that sometimes I also order it in restaurants. I sometimes also eat it four times a week! It is very popular in my country, too. I think a lot of people like it because it is healthy and easy to make. You can also change the recipe so it is spicy or not, so everybody can enjoy it.`;

const dumplingGroup = Object.assign(qFill(1, 'Listen to the second part of the chef\'s demonstration. Complete the descriptions of the diagram using ONE verb from the box: boil, chop (x2), cut, fold, mix (x2), roll.', [
  ['You need to ____ water with flour to make the cases.', 'mix', lx('Bạn cần ____ nước với bột để làm vỏ bánh.', 'Đầu phần hướng dẫn.', 'Then, mix the flour with two cups of water', 'mix (trộn).')],
  ['You need to ____ the cabbage to make the filling.', 'chop', lx('Bạn cần ____ bắp cải để làm nhân.', 'Phần nhân bánh.', 'You need to chop this up finely', 'chop (băm/thái nhỏ).')],
  ['You ____ the meat and cabbage by hand.', 'mix', lx('Bạn ____ thịt và bắp cải bằng tay.', 'Ngay sau đó.', 'Put the meat and cabbage together and mix it by hand', 'mix.')],
  ['You need to ____ the spring onions and shrimps into small pieces.', 'chop', lx('Bạn cần ____ hành lá và tôm thành miếng nhỏ.', 'Phần thêm hải sản.', 'Chop the spring onions and shrimps into small pieces', 'chop.')],
  ['You need to ____ the dough into 20 equal pieces to make the cases.', 'cut', lx('Bạn cần ____ bột thành 20 phần bằng nhau.', 'Phần hoàn thiện vỏ.', 'First, cut the dough into twenty pieces, making sure they\'re all the same size', 'cut (cắt). "the same size" = equal.')],
  ['Then you ____ the dough into flat cases.', 'roll', lx('Sau đó bạn ____ bột thành vỏ dẹt.', 'Ngay sau khi cắt.', 'roll them into flat little circular shapes', 'roll (cán).')],
  ['You ____ the dough into half-moon shapes.', 'fold', lx('Bạn ____ bột thành hình bán nguyệt.', 'Sau khi cho nhân.', 'Then, fold them into half-moon shapes', 'fold (gấp).')],
  ['You ____ the dumplings three times and they are ready to eat.', 'boil', lx('Bạn ____ bánh ba lần là có thể ăn.', 'Câu cuối.', 'Finally, boil the dumplings three times', 'boil (luộc).')],
], 'Questions 1–8'), { groupType: 'map', imageUrl: 'media:m0u05-dumplings.jpg' });

module.exports = {
  n: 5,
  title: 'Food',
  titleVi: 'Ẩm thực',
  pages: '58–69',
  outcomes: [
    'Gọi tên nguyên liệu, món ăn và cách chế biến (chop, mix, fry, boil…)',
    'Dùng danh từ đếm được / không đếm được với a, an, some, any, much, many, a lot of',
    'Đọc bài báo và hướng dẫn nấu ăn; hoàn thành câu',
    'Nghe nối người với lý do; nghe hướng dẫn nấu ăn',
    'Viết mô tả cách làm một món ăn',
  ],
  lessons: {
    vocab: {
      title: 'Từ vựng: món ăn, nguyên liệu & cách chế biến',
      titleEn: 'Lead-in · Vocabulary and speaking · Vocabulary and listening',
      minutes: 40,
      objectives: ['Nối món ăn nổi tiếng với quốc gia và nguyên liệu', 'Phân loại thực phẩm: meat, vegetables, fish/seafood, carbohydrates', 'Gọi tên 7 động từ chế biến: boil, chop, cut, fold, fry, mix, roll'],
      images: ['media:m0u05-countries.jpg|Lead-in (tr. 58): món ăn của Saudi Arabia, the UK, China, Italy, Brazil', 'media:m0u05-foods.jpg|Ex. 10 (tr. 61): onion, pasta, flour, salmon, garlic, carrot, rice, spring onion, lamb', 'media:m0u05-verbs.jpg|Ex. 13 (tr. 61): boil, chop, cut, fold, fry, mix, roll'],
      theory: [
        card('Động từ chế biến món ăn', 'Verbs for preparing food', {
          usage: [
            '**chop** thái/băm nhỏ · **cut** cắt (thành miếng/lát) · **mix** trộn · **roll** cán (bột) · **fold** gấp',
            '**boil** luộc/đun sôi (trong nước) · **fry** chiên/rán (trong dầu) · **bake** nướng (lò, nhiệt khô)',
          ],
          examples: [['Chop the spring onions into small pieces.', 'Thái nhỏ hành lá.'], ['Fry the chicken in a pan.', 'Rán gà trong chảo.'], ['Boil the rice in water.', 'Nấu cơm/luộc gạo trong nước.']],
        }),
        card('Nhóm thực phẩm', 'Food groups', {
          usage: ['**Meat**: beef, lamb, chicken, duck · **Vegetables**: carrot, onion, garlic, cabbage, lettuce, cauliflower', '**Fish/Seafood**: salmon, shrimps, prawns, lobster · **Carbohydrates**: rice, pasta, noodles, potatoes, spaghetti · **Other**: flour, salt, pepper, oil'],
        }),
      ],
      vocab: [
        ['ingredient', 'nguyên liệu', 'What are the ingredients of pizza?'],
        ['dish', 'món ăn', 'Fish and chips is a British dish.'],
        ['noodles', 'mì', 'Beef chow mein has noodles.'],
        ['flour', 'bột mì', 'You need flour to make bread.'],
        ['garlic', 'tỏi', 'Chop some garlic.'],
        ['spring onion', 'hành lá', 'Add some spring onions.'],
        ['salmon', 'cá hồi', 'Salmon is my favourite fish.'],
        ['lamb', 'thịt cừu', 'Today I\'m using lamb.'],
        ['shrimp / prawn', 'tôm', 'I\'m going to add some shrimps.'],
        ['carbohydrates', 'tinh bột', 'Rice and pasta are carbohydrates.'],
        ['chop', 'thái nhỏ, băm', 'Chop the onion into small pieces.'],
        ['mix', 'trộn', 'Mix the flour with water.'],
        ['roll', 'cán (bột)', 'Roll the dough into flat circles.'],
        ['fold', 'gấp', 'Fold them into half-moon shapes.'],
        ['boil', 'luộc, đun sôi', 'Boil the dumplings three times.'],
        ['fry', 'chiên, rán', 'Fry the meat for five minutes.'],
        ['bake', 'nướng (bằng lò)', 'Bake the cake in the oven.'],
        ["beef","thịt bò","Beef is popular in many countries."],
        ["duck","con vịt, thịt vịt","Roast duck is a famous Chinese dish."],
        ["lettuce","rau xà lách","I put some lettuce in my sandwich."],
        ["lobster","tôm hùm","Lobster is expensive seafood."],
        ["spaghetti","mì Ý sợi dài","Spaghetti is a kind of pasta."],
        ["cauliflower","súp lơ trắng","Boil the cauliflower for ten minutes."],
        ["countable noun","danh từ đếm được","Apple is a countable noun: an apple, two apples."],
        ["uncountable noun","danh từ không đếm được","Rice is an uncountable noun: some rice."],
      ],
      ex: [
        match('Món ăn của nước nào? (Lead-in)', 'Nối tranh 1–5 với quốc gia.', [
          ['Picture 1', 'China'], ['Picture 2', 'Saudi Arabia'], ['Picture 3', 'Italy'], ['Picture 4', 'the United Kingdom'], ['Picture 5', 'Brazil'],
        ], { stimulus: picture('media:m0u05-countries.jpg', 'Lead-in') }),
        match('Món ăn & nguyên liệu (Ex. 2)', 'Nối món ăn 1–5 với nhóm nguyên liệu A–E.', [
          ['Beef Chow Mein', 'meat, noodles, oil, garlic', 'Mì xào bò Trung Hoa.'],
          ['Al Kabsa', 'chicken, rice, tomato, onion', 'Cơm gà Ả Rập.'],
          ['Pizza', 'tomatoes, cheese, flour for bread', 'Ý.'],
          ['Fish and chips', 'fish, potatoes', 'Anh.'],
          ['Moqueca', 'tomatoes, fish, prawns, rice, coconut milk', 'Món hải sản Brazil.'],
        ]),
        match('Thực phẩm trong tranh (Ex. 10)', 'Nối tranh 1–9 với tên thực phẩm.', [
          ['Picture 1', 'flour'], ['Picture 2', 'spring onions'], ['Picture 3', 'garlic'], ['Picture 4', 'rice'], ['Picture 5', 'pasta'],
          ['Picture 6', 'lamb'], ['Picture 7', 'salmon'], ['Picture 8', 'carrot'], ['Picture 9', 'onion'],
        ], { stimulus: picture('media:m0u05-foods.jpg', 'Ex. 10') }),
        cat('Phân loại thực phẩm (Ex. 11, G&V Ex. 2)', 'Xếp mỗi từ vào nhóm đúng.', { meat: 'Meat', veg: 'Vegetables', fish: 'Fish / Seafood', carb: 'Carbohydrates', other: 'Other ingredients' }, [
          ['lamb', 'meat'], ['beef', 'meat'], ['duck', 'meat'], ['carrot', 'veg'], ['garlic', 'veg'], ['lettuce', 'veg'], ['cauliflower', 'veg'],
          ['salmon', 'fish'], ['lobster', 'fish'], ['rice', 'carb'], ['pasta', 'carb'], ['spaghetti', 'carb'], ['flour', 'other'], ['salt', 'other'],
        ]),
        match('Động từ chế biến (Ex. 13)', 'Nối tranh 1–7 với động từ.', [
          ['Picture 1', 'chop'], ['Picture 2', 'mix'], ['Picture 3', 'cut'], ['Picture 4', 'roll'], ['Picture 5', 'fold'], ['Picture 6', 'boil'], ['Picture 7', 'fry'],
        ], { stimulus: picture('media:m0u05-verbs.jpg', 'Ex. 13') }),
        match('Định nghĩa cách nấu (G&V Ex. 3)', 'Nối động từ với định nghĩa.', [
          ['bake', 'to cook something such as bread or a cake with dry heat in the oven'], ['boil', 'to cook food in water'],
          ['chop', 'to cut something into small pieces'], ['fry', 'to cook something in hot oil or fat'], ['mix', 'to put two or more ingredients together'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: lễ hội ẩm thực & công thức nấu ăn',
      titleEn: 'Vocabulary and reading · Reading: sentence completion 1 & 2',
      minutes: 50,
      objectives: ['Đọc lướt bài báo về lễ hội ẩm thực Trung Hoa ở London; làm True / False / Not Given', 'Sắp xếp tranh theo trình tự công thức (Bulgogi) và điền từ', 'Chọn từ đúng điền vào đoạn văn (sentence completion 2)'],
      images: ['media:m0u05-festival-photos.jpg|Ex. 4 (tr. 59): Bạn có thể thấy gì ở một lễ hội ẩm thực?'],
      theory: [
        card('Đọc kỹ từng chữ (TIP 06)', 'Read carefully — true, false or not given', {
          usage: ['Các câu hỏi có **từ in đậm** — đó chính là chỗ cần kiểm tra: "**every year**", "**only** Chinese cooking", "**learn** to make".', 'Từ **only** thường làm câu thành FALSE nếu bài có nhắc thêm thứ khác ("dishes from other countries").', 'Câu 6 nói về vé: bài chỉ nói vé **miễn phí khi tải trên web**, KHÔNG nói không tải thì phải trả tiền → NOT GIVEN.'],
        }),
        card('Hướng dẫn nấu ăn: từ chỉ trình tự', 'Instructions — sequencing words', {
          formula: ['**First, … Then, … After this, … Afterwards, … Finally, …**', 'Câu mệnh lệnh: **động từ đứng đầu** — Take one large onion… Mix them all together… Fry for 5–10 minutes.'],
          usage: ['Dùng **a** + danh từ đếm được số ít (a large onion), **some** + số nhiều/không đếm được (some spring onions, some soy sauce).'],
        }),
      ],
      links: [{ ref: 'reading:M0-U05-R1', title: 'Chinese Food Festival in London (Ex. 5–6)', note: '6 câu True / False / Not Given — để ý các từ in đậm trong câu hỏi.' }],
      vocab: [
        ['food festival', 'lễ hội ẩm thực', 'The Chinese food festival is in London.'],
        ['celebrate', 'tôn vinh, kỷ niệm', 'The festival celebrates real Chinese cooking.'],
        ['taste', 'nếm, thưởng thức', 'You can taste wonderful food.'],
        ['food stall', 'quầy bán đồ ăn', 'There are many food stalls.'],
        ['famous chef', 'đầu bếp nổi tiếng', 'Watch famous chefs cooking.'],
        ['tasty', 'ngon', 'They show you how to make tasty dishes.'],
        ['performance', 'buổi biểu diễn', 'Enjoy traditional Chinese performances.'],
        ['arts and crafts', 'thủ công mỹ nghệ', 'Try Chinese arts and crafts.'],
        ['download', 'tải xuống', 'Download your free ticket.'],
        ['slice', 'lát (thịt, bánh)', 'Cut the beef into slices.'],
        ['soy sauce', 'nước tương', 'Put some soy sauce in a bowl.'],
        ['serve', 'dọn ra, phục vụ', 'Serve it to your friends.'],
        ['healthy', 'tốt cho sức khoẻ', 'It is healthy and easy to make.'],
        ['spicy', 'cay', 'You can make it spicy or not.'],
        ['fast food', 'đồ ăn nhanh', 'I often eat fast food in the week.'],
      ],
      ex: [
        order('Sắp xếp tranh: món Bulgogi (Ex. 21)', 'Nhìn tranh A–F và đọc hướng dẫn. Sắp xếp các chữ cái theo đúng trình tự nấu (bắt đầu bằng B).', [
          ['B C F A E D', 'B: thái hành → C: cho nước tương + nước vào bát và trộn → F: thái thịt bò → A: để tủ lạnh 4 tiếng → E: chiên thịt → D: bày ra đĩa.'],
        ], { stimulus: picture('media:m0u05-bulgogi.jpg', 'Bulgogi — pictures A–F') }),
        gap('Hoàn thành công thức Bulgogi (Ex. 22)', 'Điền a, some hoặc một động từ.', [
          ['First, take ____ large onion and ____ spring onions and ____ them into small pieces.', ['a', 'some', 'chop|cut'], 'a + danh từ số ít; some + số nhiều; chop = thái nhỏ.'],
          ['Then, in a large bowl put ____ soy sauce and ____ cup of cold water.', ['some', 'a'], 'soy sauce không đếm được → some; a cup.'],
          ['After this, add the onions and spring onions and ____ them all together.', 'mix', 'mix together.'],
          ['Then, you will need to take your beef and ____ it into slices.', 'cut', 'cut into slices.'],
          ['Afterwards, remove the meat from the bowl and ____ for 5–10 minutes.', 'fry|cook', 'Tranh E: chảo trên bếp → fry.'],
        ]),
        mcq('Hoàn thành đoạn văn: món ăn yêu thích (Ex. 24)', 'Chọn đáp án đúng nhất A, B, C hoặc D.', [
          ['I don\'t usually like ____ meals…', ['cooking', 'cook', 'do', 'doing'], 'A', 'like + V-ing; cook meals.'],
          ['…I often go ____ restaurants or eat fast food in the week.', ['in', 'at', 'to', 'for'], 'C', 'go to + nơi chốn.'],
          ['____ the weekend, I have more free time…', ['For', 'At', 'In', 'With'], 'B', 'at the weekend (Anh-Anh).'],
          ['…I have more ____ time, so I usually cook my favourite meal.', ['extra', 'free', 'off', 'hobby'], 'B', 'free time = thời gian rảnh.'],
          ['My ____ meal is chicken curry with rice and vegetables.', ['lovely', 'liked', 'favourite', 'popular'], 'C'],
          ['I don\'t have an oven, so I ____ the chicken on its own in a pan…', ['fold', 'mix', 'fry', 'chop'], 'C', 'in a pan → fry.'],
          ['…and ____ the rice in water.', ['fry', 'cut', 'roll', 'boil'], 'D', 'in water → boil.'],
          ['It is very popular ____ my country, too.', ['in', 'with', 'at', 'on'], 'A'],
        ], { stimulus: passage(MY_MEAL.replace('like cooking', 'like (1) ____').replace('go to restaurants', 'go (2) ____ restaurants').replace('At the weekend', '(3) ____ the weekend').replace('more free time', 'more (4) ____ time').replace('My favourite meal', 'My (5) ____ meal').replace('I fry the', 'I (6) ____ the').replace('and boil the', 'and (7) ____ the').replace('popular in my', 'popular (8) ____ my'), { caption: 'Ex. 24' }) }),
      ],
    },

    grammar: {
      title: 'Ngữ pháp: danh từ đếm được / không đếm được',
      titleEn: 'Grammar: countable and uncountable nouns — a/an, some, any, much, many, a lot of',
      minutes: 40,
      objectives: ['Phân biệt danh từ đếm được (số ít, số nhiều) và không đếm được', 'Dùng a / an / some / any đúng chỗ', 'Dùng much / many / a lot of trong câu khẳng định, phủ định, câu hỏi'],
      keyLanguage: [
        'Đếm được số ít: a cabbage, an apple (a trước phụ âm, an trước nguyên âm) · số nhiều: some potatoes · không đếm được: some flour, some milk.',
        'some: câu khẳng định, lời mời/đề nghị (Would you like some tea?) · any: câu phủ định và câu hỏi (I don\'t have any milk. Do you have any onions?)',
        'a lot of: khẳng định (và phủ định) với cả hai loại · many: hỏi/phủ định với danh từ ĐẾM ĐƯỢC (How many carrots?) · much: hỏi/phủ định với KHÔNG ĐẾM ĐƯỢC (How much water?)',
      ],
      links: [{ grammar: 'countable-uncountable', title: 'Countable vs Uncountable', note: 'a/an, some/any, much/many/a lot of' }, { grammar: 'articles', title: 'Articles (a / an / the)', note: 'mạo từ' }],
      ex: [
        cat('Đếm được hay không? (Ex. 16)', 'Xếp mỗi từ vào nhóm đúng.', { cs: 'Countable (singular)', cp: 'Countable (plural)', u: 'Uncountable' }, [
          ['(an) apple', 'cs'], ['(a) cabbage', 'cs'], ['onions', 'cp'], ['oranges', 'cp'], ['potatoes', 'cp'], ['shrimps', 'cp'],
          ['flour', 'u'], ['meat', 'u'], ['milk', 'u'], ['rice', 'u'], ['salt', 'u'], ['water', 'u'],
        ]),
        gap('a, an, some hay any? (G&V Ex. 4)', 'Điền a, an, some hoặc any.', [
          ['I have ____ sandwich for lunch. I had ____ apple for a snack today.', ['a', 'an']],
          ['I have got ____ juice in the fridge. There are ____ oranges in the cupboard.', ['some', 'some']],
          ['Are there ____ tomatoes? Is there ____ fish on the menu?', ['any', 'any']],
          ['Can I have ____ water, please? Would you like ____ tea?', ['some', 'some'], 'Lời đề nghị/yêu cầu → some.'],
          ['Quy tắc: Before singular countable nouns we use ____ before a consonant and ____ before a vowel.', ['a', 'an'], 'a + phụ âm (a sandwich), an + nguyên âm (an apple).'],
          ['Quy tắc: In positive sentences, with plural and uncountable nouns we use ____.', ['some']],
          ['Quy tắc: In questions and negative sentences with countable and uncountable nouns, we use ____.', ['any']],
          ['Quy tắc: In offers and requests, we use ____.', ['some'], 'Would you like some…? / Can I have some…?'],
        ]),
        mcq('much, many hay a lot of? (G&V Ex. 5–6)', 'Chọn đáp án đúng.', [
          ['We have ____ oranges to eat because we have an orange tree in our garden.', ['much', 'a lot of'], 'B', 'Khẳng định → a lot of.'],
          ['How ____ lemons do you need for the recipe?', ['much', 'many'], 'B', 'lemons đếm được → many.'],
          ['How ____ coffee is there in the cupboard?', ['many', 'much'], 'B', 'coffee không đếm được → much.'],
          ['Could you go to the shop? There isn\'t ____ milk in the fridge.', ['some', 'many', 'much'], 'C'],
          ['How ____ eggs do we need to make the cake?', ['many', 'much', 'a lot of'], 'A'],
          ['There are ____ potatoes in the cupboard, so we could make chips.', ['much', 'any', 'a lot of'], 'C'],
          ['Do you have ____ spaghetti?', ['any', 'many', 'a'], 'A'],
          ['I think that we have ____ carrots in the fridge.', ['much', 'some', 'any'], 'B'],
          ['How ____ sugar would you like in your coffee?', ['many', 'much', 'any'], 'B'],
          ['There aren\'t ____ vegetables in the shop, just cauliflower and lettuce.', ['any', 'many', 'much'], 'B'],
          ['We don\'t have ____ beef left. Everyone ate it.', ['any', 'many', 'much'], 'A'],
          ['I would like ____ fish, please.', ['some', 'much', 'many'], 'A', 'Lời yêu cầu → some.'],
          ['There are ____ different salads on the menu. I don\'t know which one to choose.', ['any', 'much', 'a lot of'], 'C', 'Câu khẳng định, danh từ số nhiều → a lot of.'],
        ]),
        mcq('Đoạn văn về pizza (G&V Ex. 7)', 'Chọn đáp án đúng nhất.', [
          ['My ____ food is pizza.', ['best', 'lovely', 'favourite'], 'C'],
          ['I like ____ pizzas because they are very easy to prepare.', ['eating', 'eat', 'ate'], 'A'],
          ['If you want to ____ your own pizza, all you need to do is make the bread for the base.', ['get', 'have', 'make'], 'C'],
          ['You can ____ tomatoes and cheese…', ['mix', 'fold', 'add'], 'C'],
          ['…and ____ other ingredients on top.', ['a lot', 'many', 'much'], 'B'],
          ['You then ____ it in the oven for 10 to 15 minutes.', ['cook', 'boil', 'fry'], 'A'],
          ['…you can buy ____ pizza from your local supermarket.', ['much', 'some', 'a'], 'C'],
          ['Nowadays, ____ of people are so busy that they don\'t have time to cook.', ['much', 'a lot', 'many'], 'B'],
          ['…or they like to have a rest ____ the weekend.', ['at', 'in', 'for'], 'A'],
          ['…they go ____ a take-away restaurant and buy a pizza.', ['in', 'for', 'to'], 'C'],
        ]),
        gap('a / an hay some? (Ex. 17)', 'Hoàn thành quy tắc bằng a / an hoặc some.', [
          ['For singular countable nouns, we put ____ before the word, e.g. ____ cabbage.', ['a|an|a/an', 'a'], 'Danh từ đếm được số ít → a/an.'],
          ['For plural countable nouns, we can put ____ before the word and we usually add an \'s\', e.g. ____ dumplings.', ['some', 'some']],
          ['For uncountable nouns, we put ____ before the word, e.g. ____ milk.', ['some', 'some'], 'Không đếm được → không dùng a/an, không thêm -s.'],
        ]),
        mcq('Hoàn thành tiêu đề bảng (Ex. 18)', 'Đọc các câu ví dụ trong bảng của sách và chọn tiêu đề đúng cho mỗi cột.', [
          ['Cột 1: I have some apples. · I don\'t have any cabbages. · Do you have any onions? · How many carrots do we need? → ____ nouns', ['Countable', 'Uncountable'], 'A', 'apples, cabbages, onions, carrots đều đếm được (có số nhiều).'],
          ['Cột 2: I have some rice. · I don\'t have any milk. · Do you have any meat? · How much water do I put in? → ____ nouns', ['Countable', 'Uncountable'], 'B', 'rice, milk, meat, water không đếm được → dùng much.'],
        ]),
      ],
    },

    writing: {
      title: 'Writing: mô tả cách làm một món ăn',
      titleEn: 'Writing: describing a process · food in your country',
      minutes: 50,
      objectives: ['Sắp xếp các bước của một công thức', 'Nối các bước bằng First, Then, After this, Next, Finally', 'Viết bài 120–150 từ về một món ăn phổ biến ở nước bạn: nguyên liệu, cách làm, lý do phổ biến'],
      theory: [
        card('Mô tả một quy trình nấu ăn', 'Describing a process', {
          formula: ['**Giới thiệu món ăn** + nguyên liệu: To make phở bò, you need some beef, rice noodles, onions…', '**Các bước** theo thứ tự: **First**, … **Then**, … **After this**, … **Next**, … **Finally**, …', '**Lý do phổ biến**: It is popular because it is cheap, healthy and delicious.'],
          usage: ['Mỗi bước = **động từ mệnh lệnh** hoặc **you + V**: Boil the bones for three hours. / You need to chop the onions.', 'Dùng đúng **a / some** với nguyên liệu; động từ chế biến của unit: chop, mix, fry, boil, cut, roll, fold.'],
        }),
      ],
      vocab: [
        ['recipe', 'công thức nấu ăn', 'This is my mum\'s recipe.'],
        ['first of all', 'trước hết', 'First of all, wash the rice.'],
        ['after this', 'sau bước này', 'After this, add the vegetables.'],
        ['afterwards', 'sau đó', 'Afterwards, fry the meat.'],
        ['finally', 'cuối cùng', 'Finally, serve it with herbs.'],
        ['pan', 'chảo', 'Fry the chicken in a pan.'],
        ['bowl', 'bát tô', 'Put the noodles in a bowl.'],
        ['add', 'thêm vào', 'Add some salt and pepper.'],
        ['remove', 'lấy ra', 'Remove the meat from the bowl.'],
        ['popular', 'phổ biến', 'It is popular in my country.'],
      ],
      ex: [
        match('Món súp lơ Ả Rập: tranh ↔ bước (G&V Ex. 8)', 'Đây là 7 bước làm món súp lơ kiểu Ả Rập. Nối thứ tự bước (1–7) với câu hướng dẫn đúng.', [
          ['Step 1', 'First, take a large cauliflower and cut the leaves off so that you only have the white part.'],
          ['Step 2', 'Next, take the cauliflower and place it in boiling water.'],
          ['Step 3', 'While the cauliflower is boiling, chop some garlic.'],
          ['Step 4', 'Next, add the garlic to some special mixture called tahini paste and some lemon juice.'],
          ['Step 5', 'Mix the paste, the lemon juice and the garlic together.'],
          ['Step 6', 'Add the mixture of paste, garlic and lemon juice to the cauliflower.'],
          ['Step 7', 'Finally, cover the dish and put it in the fridge until you are ready to eat it.'],
        ]),
        write('Viết: món ăn phổ biến ở nước bạn (Ex. 23, 26)', 'Dùng kiến thức của unit này, viết bài (120–150 từ) về một món ăn phổ biến ở Việt Nam hoặc món bạn thích. Bài viết cần có: (1) cần những nguyên liệu gì; (2) hướng dẫn cách làm theo từng bước (First, Then, After this, Finally…); (3) lý do món ăn này phổ biến.', {
          minWords: 110, maxWords: 170, mustUse: 4,
          targetStructures: ['First', 'Then', 'After this', 'Finally', 'some', 'chop', 'boil', 'fry', 'because'],
          checklist: ['Nêu nguyên liệu (dùng a/an/some đúng)', 'Các bước theo thứ tự với từ nối trình tự', 'Dùng động từ chế biến (chop, mix, fry, boil…)', 'Giải thích vì sao món ăn phổ biến', '120–150 từ'],
          sampleAnswer: 'Bánh mì is one of the most popular foods in Vietnam. To make it, you need a baguette, some pork, some pâté, a cucumber, a carrot, some fresh herbs and some chilli sauce.\n\nFirst, cut the carrot into thin pieces and mix it with a little sugar and vinegar. Then, cut the pork into slices and fry it in a pan for about ten minutes with some garlic and soy sauce. After this, cut the baguette in half and spread some pâté inside. Next, add the pork, the carrot, some cucumber and the herbs. Finally, put some chilli sauce on top and close the bread.\n\nBánh mì is popular because it is cheap, quick and delicious. You can buy it on almost every street, and people often eat it for breakfast on the way to school or work. You can also change the filling, so everybody can enjoy it.',
          commonErrors: ['Thiếu từ nối trình tự', 'Dùng a với danh từ không đếm được (a rice)', 'Quên giải thích lý do món ăn phổ biến'],
        }),
      ],
    },

    listening: {
      title: 'Listening: nối thông tin & nghe hướng dẫn nấu ăn',
      titleEn: 'Listening: matching · Vocabulary and listening',
      minutes: 50,
      objectives: ['Nghe ý chính của cuộc trò chuyện', 'Nối người với lý do — có nhiều lý do hơn số người', 'Nghe hướng dẫn và điền động từ chế biến vào sơ đồ'],
      images: ['media:m0u05-recipes.jpg|Ex. 14 (tr. 62): noodles, mooncakes hay dumplings?'],
      theory: [
        card('Nối người với lý do', 'Matching — more options than people', {
          usage: [
            'Có **nhiều lý do hơn số người** (8 lý do cho 6 người) → sẽ có 2 lý do không dùng (TIP 08).',
            'Nghe **toàn bộ** thông tin về một người: Mark đoán Pierre "đang làm việc" nhưng Jane nói **không** — Pierre dẫn bố mẹ đi tham quan (sightseeing).',
            'MINI TIP: **sightseeing** = đi ngắm cảnh; **can\'t afford** = không đủ tiền; **flatmate** = người ở cùng căn hộ.',
          ],
        }),
        card('Nghe để điền vào sơ đồ', 'Listening to a process', {
          usage: ['**Trước khi nghe**: nhìn hình, đoán động từ cho mỗi bước (TIP 15).', 'Bạn không nghe đúng y từ trong câu đề: "the same size" = "equal pieces".'],
        }),
      ],
      links: [
        { ref: 'listening:M0-U05-L1', title: 'Mark & Jane — ai không đi lễ hội được? (Ex. 7–9)', note: 'Chọn chủ đề chính, rồi nối 6 người bạn với lý do A–H.' },
        { ref: 'listening:M0-U05-L2', title: 'Đầu bếp giới thiệu món ăn (Ex. 14)', note: 'Món đầu bếp sắp làm là gì?' },
        { ref: 'listening:M0-U05-L3', title: 'Cách làm bánh há cảo (Ex. 15)', note: 'Điền 8 động từ chế biến vào sơ đồ.' },
      ],
      vocab: [
        ['look forward to', 'mong chờ', "I'm really looking forward to the food festival."],
        ['busy', 'bận', 'Most of them are busy.'],
        ['can\'t afford', 'không đủ tiền', 'Marco can\'t afford to go.'],
        ['lend', 'cho mượn', 'Perhaps Pierre could lend him some money.'],
        ['decorate', 'trang trí, sơn sửa', 'He is helping his flatmate decorate his room.'],
        ['show someone around', 'dẫn ai đi tham quan', "He's going to show them around London."],
        ['sightseeing', 'đi ngắm cảnh', 'Pierre is going sightseeing.'],
        ['prepare for an exam', 'ôn thi', 'She needs to prepare for her exam.'],
        ['dough', 'bột nhào', 'You need to make some dough first.'],
        ['filling', 'nhân bánh', 'Make the filling while you wait.'],
        ['finely', 'nhỏ, mịn', 'Chop the cabbage finely.'],
        ['half-moon', 'hình bán nguyệt', 'Fold them into half-moon shapes.'],
        ['equal', 'bằng nhau', 'Cut the dough into 20 equal pieces.'],
      ],
      ex: [
        mcq('Từ đồng nghĩa trước khi nghe (MINI TIPS 08)', 'Chọn nghĩa đúng.', [
          ['"sightseeing" means…', ['visiting famous places', 'eating in a restaurant', 'working in an office'], 'A'],
          ['If you "can\'t afford" something, you don\'t have…', ['time', 'enough money', 'friends'], 'B'],
          ['A "flatmate" is someone who…', ['lives in the same flat as you', 'works with you', 'studies in your class'], 'A'],
        ]),
      ],
    },

    speaking: {
      title: 'Speaking: thói quen ăn uống & món ăn bạn thích',
      titleEn: 'Speaking: eating habits · a meal you enjoy',
      minutes: 40,
      objectives: ['Đặt câu hỏi về thói quen ăn uống với much / many / any', 'Nói 1–2 phút về một bữa ăn bạn thích: ai nấu, khi nào ăn, vì sao thích'],
      theory: [
        card('Nói về món ăn bạn thích', 'Talking about a meal you enjoy', {
          formula: ['**My favourite meal is…** → **Who** prepares it: My mum usually cooks it… → **When**: We usually have it on Sundays… → **Why**: I like it because…'],
          usage: ['Thêm chi tiết về **nguyên liệu** và **cách làm** (dùng từ của unit: fry, boil, chop).', 'Câu hỏi khảo sát: **How much** water do you drink? **How many** cups of coffee…? **Are there any** foods you don\'t like? **Have you ever eaten**…?'],
        }),
      ],
      vocab: [
        ['eating habits', 'thói quen ăn uống', 'Ask your partner about their eating habits.'],
        ['How much…?', 'bao nhiêu (không đếm được)', 'How much water do you drink each day?'],
        ['How many…?', 'bao nhiêu (đếm được)', 'How many eggs do you eat a week?'],
        ['favourite meal', 'bữa ăn / món yêu thích', 'My favourite meal is phở.'],
        ['prepare', 'chuẩn bị, nấu', 'My grandmother prepares it for me.'],
        ['homemade', 'tự làm ở nhà', 'Homemade food is healthier.'],
        ['smell delicious', 'thơm ngon', 'The soup smells delicious.'],
        ['reminds me of', 'làm tôi nhớ đến', 'It reminds me of my childhood.'],
      ],
      ex: [
        order('Câu hỏi khảo sát ăn uống (Ex. 19)', 'Sắp xếp thành câu hỏi đúng.', [
          ['How much meat do you eat each week?'], ['Are there any recipes you like to cook?'], ['How many cups of tea do you drink a day?'], ['Are there any foods you don\'t like?'],
        ]),
        speak('Nói: món ăn bạn thích (Ex. 25)', 'Nói 1–2 phút về một bữa ăn bạn thích. Bạn nên nói: ai chuẩn bị món đó cho bạn · khi nào bạn ăn · vì sao bạn thích nó.', 2, [
          ['Talk about a meal that you enjoy.\nYou should say:\n• who prepares it for you\n• when you eat it\nand explain why you like it.', 'The meal I enjoy most is my grandmother\'s fish soup with rice. She usually prepares it for the whole family when we visit her house on Sunday. First, she fries some tomatoes and onions, then she adds fresh fish, pineapple and some herbs, and boils everything for about twenty minutes. The kitchen smells delicious! We usually eat it at lunchtime, all together around a big table, so it\'s a very happy time. I like this meal for two reasons. Firstly, it\'s healthy and not too heavy, so I never feel tired after eating it. Secondly, it reminds me of my childhood, because my grandmother has cooked it for me since I was very small. I\'ve tried fish soup in restaurants, but it\'s never as good as hers.', 'Đủ 3 ý theo thứ tự (who → when → why), có mô tả cách nấu bằng động từ của unit, phần "why" có 2 lý do (Firstly, Secondly).'],
        ]),
        speak('Nói: trả lời câu hỏi về ẩm thực (Ex. 3, 20)', 'Trả lời từng câu hỏi trong 15–25 giây.', 1, [
          ['What is your favourite food from your country?', 'My favourite Vietnamese food is bún chả. It\'s grilled pork with rice noodles and fresh herbs. I love it because the meat is sweet and smoky, and it\'s perfect for lunch on a hot day.', 'Món + mô tả nguyên liệu + lý do.'],
          ['What food is popular in your country?', 'Rice is the most popular food in Vietnam – we eat it almost every day. Noodle soups like phở are also very popular, especially for breakfast.', 'Nêu 2 ví dụ.'],
          ['How much water do you drink every day?', 'Not as much as I should! I probably drink about four glasses a day, but I know I need to drink more, especially when I play sport.', 'Câu trả lời trung thực + chi tiết.'],
        ]),
      ],
    },

    review: {
      title: 'Ôn tập Unit 5: Grammar & Vocabulary',
      titleEn: 'Grammar and vocabulary — Unit 5',
      minutes: 25,
      objectives: ['Ôn tên thực phẩm và much / many / a lot of của Unit 5'],
      keyLanguage: ['a lot of: khẳng định (và phủ định) với cả danh từ đếm được và không đếm được · many: hỏi/phủ định với danh từ đếm được · much: hỏi/phủ định với danh từ không đếm được.'],
      ex: [
        match('Thực phẩm trong ảnh (G&V Ex. 1)', 'Nối ảnh 1–8 với từ trong khung: beef, lettuce, duck, lobster, spaghetti, salmon, garlic, cauliflower.', [
          ['Photo 1', 'duck'], ['Photo 2', 'lettuce'], ['Photo 3', 'lobster'], ['Photo 4', 'garlic'],
          ['Photo 5', 'salmon'], ['Photo 6', 'spaghetti'], ['Photo 7', 'beef'], ['Photo 8', 'cauliflower'],
        ], { stimulus: picture('media:m0u05-gv-foods.jpg', 'G&V Ex. 1') }),
        mcq('Bảng quy tắc a lot of / much / many (G&V Ex. 5)', 'Đọc các câu trong bảng và chọn đáp án đúng.', [
          ['We use ____ with positive and negative sentences with countable and uncountable nouns.', ['a lot of', 'many'], 'A'],
          ['We have ____ oranges to eat because we have an orange tree in our garden.', ['much', 'a lot of'], 'B', 'Câu khẳng định → a lot of.'],
          ['We don\'t have ____ fruit to eat in winter.', ['a lot of', 'many'], 'A', 'fruit không đếm được → không dùng many.'],
          ['We use ____ with questions and negatives with countable nouns.', ['much', 'many'], 'B'],
          ['How ____ lemons do you need for the recipe?', ['much', 'many'], 'B'],
          ['There aren\'t ____ cauliflowers in the shop.', ['much', 'many'], 'B'],
          ['We use ____ with questions and negatives with uncountable nouns.', ['many', 'much'], 'B'],
          ['How ____ coffee is there in the cupboard?', ['many', 'much'], 'B'],
          ['There isn\'t ____ sugar in the dish.', ['many', 'much'], 'B'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M0-U05-R1',
      title: 'Mindset 0 · Unit 5 — Chinese Food Festival in London',
      content: '<p style="text-align:center"><img src="media:m0u05-festival-photos.jpg" alt="Food festival" style="max-width:100%;max-height:300px;height:auto;border-radius:6px"></p>\n\n' + FESTIVAL_TEXT.split(/\n\s*\n/).map((p) => '<p>' + p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>').join('\n\n'),
      questionGroups: [
        {
          groupType: 'plain', groupTitle: 'Questions 1–6',
          instruction: 'Read the article again. Do the statements agree with the information in the article? Choose TRUE, FALSE or NOT GIVEN. Pay attention to the words in CAPITALS.',
          questions: [
            ['The Chinese food festival is in London EVERY YEAR.', 'NOT GIVEN', 'Bài chỉ nói "**This year**, the Chinese food festival is at…" — không nói năm nào cũng tổ chức ở London → NOT GIVEN.'],
            ['The festival ONLY includes Chinese cooking.', 'FALSE', 'Bài: "celebrates real Chinese cooking **and dishes from other countries**" → không chỉ món Trung Hoa → FALSE.'],
            ['You can LEARN to make some of the Chinese food at the festival.', 'TRUE', 'Bài: "watch famous chefs **showing you how to make** some tasty dishes" → có thể học cách làm → TRUE.'],
            ['CHILDREN can come to the festival.', 'TRUE', 'Bài: "**All the family** can come" → trẻ em đi được → TRUE.'],
            ['The festival is ONLY about cooking.', 'FALSE', 'Bài còn có "traditional Chinese performances" và "arts and crafts" → FALSE.'],
            ["If you don't download a ticket, you MUST PAY to enter on the day.", 'NOT GIVEN', 'Bài chỉ nói vé miễn phí khi tải trên website; không nói gì về việc không tải vé thì có phải trả tiền không → NOT GIVEN.'],
          ].map(([t, a, e], i) => ({ questionNumber: i + 1, type: 'true-false-ng', questionText: t, correctAnswer: a, explanation: e })),
        },
      ],
    },
  ],

  sections: [
    {
      ref: 'M0-U05-L1',
      title: 'Mindset 0 · Unit 5 — Who can come to the food festival?',
      description: 'Mark and Jane talk about which friends can go to the food festival.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_08.mp3',
      transcript: FESTIVAL_CALL,
      questionGroups: [
        qMcq(1, 'You are going to listen to Mark and Jane discussing the food festival. What is the main topic of their conversation? Choose the best answer, A, B or C.', [
          ['What is the main topic of their conversation?', ['The activities they want to see there.', 'The friends they will invite to the festival.', "The reasons their other friends can't go."], 'C', lx('Chủ đề chính của cuộc trò chuyện là gì?', 'Cả bài.', ["Well, I'm afraid most of them are busy", "it looks like it's just going to be you and me then"], 'Họ lần lượt nói lý do từng người bạn KHÔNG đi được → C. Không bàn hoạt động ở lễ hội (A); không phải danh sách mời (B).')],
        ], 'Question 1'),
        qMatch(2, 'Listen again and match the people, 2–7, with the reasons, A–H. There are more reasons than people, so you won\'t use all the letters.', [
          'A is going sightseeing', 'B can\'t afford to go', 'C is working', 'D is going to a restaurant', 'E is helping someone', 'F is doing something with their flatmate', 'G is in a different country', 'H is studying',
        ], [
          ['Marco', 'B', lx('Marco', 'Đầu bài.', 'Mohammed says Marco has no money', 'no money = can\'t afford to go (MINI TIP 08.B) → B. Lễ hội miễn phí nhưng phải đi tàu điện ngầm và mua đồ ăn.')],
          ['Mohammed', 'F', lx('Mohammed', 'Ngay sau Marco.', 'Mohammed can\'t go because he is helping his flatmate decorate his room', 'Làm việc cùng flatmate → F. (E "helping someone" cũng gần đúng nhưng F cụ thể hơn — Hang Vie mới là E.)')],
          ['Pierre', 'A', lx('Pierre', 'Giữa bài.', ["Is he at work?", "No, his parents are coming from France and he's going to show them around London … you know, Big Ben, Tower Bridge"], 'BẪY: Mark đoán đang làm việc (C) nhưng Jane nói "No". Dẫn bố mẹ đi xem Big Ben, Tower Bridge = sightseeing → A.')],
          ['Hang Vie', 'E', lx('Hang Vie', 'Khi nói về nhà hàng của mẹ Hang Vie.', "she's going to help with the cooking for her family's party", 'BẪY: có nhắc "Chinese restaurant" (D) nhưng đó là nghề của mẹ. Cô ấy giúp nấu ăn → E.')],
          ['Lucy', 'G', lx('Lucy', 'Gần cuối.', 'her flatmate said she was on holiday in Italy', 'Đang ở Ý → G. Có từ "flatmate" nhưng chỉ là người nghe điện thoại → không chọn F.')],
          ['Larissa', 'H', lx('Larissa', 'Cuối bài.', "She's got a really important exam, so she needs to prepare for it", 'prepare for an exam = studying → H.')],
        ], { title: 'Questions 2–7', optionsTitle: 'Reasons', type: 'matching' }),
      ],
    },
    {
      ref: 'M0-U05-L2',
      title: 'Mindset 0 · Unit 5 — A cooking demonstration (introduction)',
      description: 'A chef introduces the recipe he is going to cook.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_09.mp3',
      transcript: CHEF_INTRO,
      questionGroups: [
        qMcq(1, 'You are going to listen to a chef giving a cooking demonstration. Listen to the introduction. Which recipe is he going to cook?', [
          ['Which recipe is the chef going to cook?', ['noodles', 'mooncakes', 'dumplings'], 'C', lx('Đầu bếp sắp nấu món gì?', 'Cả đoạn giới thiệu.', ['The Jiaozi or dumplings are beautiful and have the shape of a half-moon', 'You start by making them in a similar way to noodles'], 'BẪY: có nhắc "noodles" nhưng chỉ để so sánh cách làm. Món chính là dumplings (há cảo, hình bán nguyệt) → C.')],
        ], 'Question 1', { image: 'media:m0u05-recipes.jpg' }),
      ],
    },
    {
      ref: 'M0-U05-L3',
      title: 'Mindset 0 · Unit 5 — How to make dumplings',
      description: 'The second part of the chef\'s cooking demonstration.',
      partNumber: 1,
      audioFile: 'MindsetIELTS_Foundation_10.mp3',
      transcript: CHEF_METHOD,
      questionGroups: [dumplingGroup],
    },
  ],
};
