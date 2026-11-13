// Mindset for IELTS Level 1 — Unit 6: Leisure time (Reading pp. 106–111 · Listening pp. 117–120)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qTFNG, qMatch, qSummary, qFill, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');

const SLOT = 3; // sách của lớp: Unit 5–6 → Sổ 3

const SPORTS = `## Unusual sports

**A** Do you ever get bored with the same old sports? If you're tired of tennis, fed up with football or bored of basketball, don't worry. There are plenty of new and unusual sports out there for you to try. Many of these are a mix of existing sports, sometimes with a local element added. Bossaball, for example, is a mix of football and volleyball, played on an inflatable pitch with a trampoline in the middle. To make it more exciting, it also has elements of Brazilian martial arts!

**B** If you are very good at horse riding, you could try the national sport of Afghanistan, buzkashi. Many versions have been played in the Central Asian region for hundreds of years. The game involves players on horseback trying to get hold of a dead goat. The Afghan Buzkashi Federation wants the game to spread throughout the world and has finally written down the rules because they hope to get Olympic status for the sport.

**C** A sport that is more likely to become famous is kabaddi. It is popular in India and other parts of South Asia. It is similar in some ways to the game called 'tag' or 'it' which schoolchildren play. One person is 'it' and has to catch the others. In kabaddi, a 'raider' from one team tries to tag a player from the other team and then return to their own half of the field without getting caught. In some versions of the game, the raider must chant the word 'kabaddi' as he returns to his place. Kabaddi is good fun, good exercise and doesn't need any equipment. It is played at the Asian Games.

**D** There is an unusual sport which describes itself as a 'classic mix of brains and brawn'. The game, called 'chess boxing', involves a round of chess and then a round of boxing, then another of chess, and so on. There is one minute between rounds. The first chess boxing world championship took place in 2003 in Amsterdam and was won by a Dutchman, Iepe Rubingh. Since then, it has become more popular, particularly in Germany, the UK, India and Russia. It is a difficult sport, as players need to be very good at two very different activities and be able to switch quickly between the two.

**E** Finally, an unusual sport that will be familiar to most of us is roshambo, which began in China about 2000 years ago and spread gradually to the rest of the world. Played by young and old, in the UK it is known as 'rock-paper-scissors'. It is surprising that it is called a sport and taken so seriously: there's a World Rock Paper Scissors Society and a league which holds championships every year. So, whatever kinds of sport you like, there is something new and interesting for you to try.`;

const PARKOUR = `## Parkour

**A** Parkour was developed in France in the 1980s by Raymond Belle and later by his son David Belle and his friends. It is based on military obstacle course training. The aim is to get from one point to another in any way you can, and express yourself while doing so. There are no limits on how you move in parkour: running, climbing, swinging, jumping, rolling and any other types of movement are possible. Parkour is more of a philosophy or set of ideas than a sport. It is a new way of seeing the environment and finding ways to go over, under, around, across or through obstacles.

**B** Parkour can be done alone or in groups. The most famous group of traceurs (people who do parkour) were the Yamakasi, a group made up of David Belle and his friends and cousins. They formed in the late 1980s and became popular during the 1990s and 2000s after appearing in several films, documentaries and advertisements. In the Yamakasi, there were strict rules. Members had to arrive on time and they were not allowed to complain or make excuses. They valued humility, so they were not allowed to show off or compete with other members.

**C** Parkour is a 'state of mind'. It is about getting over mental as well as physical barriers. It teaches people to touch the world and interact with it. It is about understanding what it means to be human. The organisation Parkour.net believes that parkour can never be a competitive sport. It is an art and is concerned with self-development. They say you can't ask, 'Who is the best at parkour?' Raymond Belle's advice is: 'If two roads open up before you, always take the more difficult one. Because you know you can travel the easy one.'

**D** There are some gyms and camps where you can practise and learn parkour. However, many traceurs do not like the idea of special places for their activity. The idea behind parkour is to adapt to any environment and be creative about how you get through it. It is about freedom and self-expression. The founder of parkour refused to teach people how to do moves or get over obstacles. The whole point is to learn your own technique and way of moving. So the idea of having classes or a limited space to practise in conflicts with the values of parkour.

**E** Parkour is also known as freerunning. Sometimes freerunning refers to another form of parkour developed by Sebastien Foucan, which has more focus on the individual. The term freerunning came out of the film Jump London (2003). It told the story of three French traceurs practising parkour around the famous monuments of London. Freerunning was the English translation of parkour. There are more similarities than differences between the two activities, and the Parkour UK website uses the two terms to refer to the same activity.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T49 = `Melissa: Thanks for offering to drive us all to the concert. It's really kind of you and makes getting there much easier. I don't live far from you at all. First, you need to turn right onto Maple Avenue and drive to the bottom of the road, passing the supermarket on your left. Then, you need to turn left at the traffic lights and then take a sharp right onto Main Street. You can also go straight on here, past the surgery, but I usually drive down Main Street. Follow this road until you reach a roundabout – you'll pass a park and some shops on your right. When you get to the roundabout, take the first turning on the left, onto Silver Street. As you approach the crossroads here, my house is the first on the corner.`;

const T50 = `Melissa: Sorry, I've just remembered, I told Sarah you would collect her on the way. Forget the route I just gave you, I'll give you another set of directions. This route might even be easier. Again, you need to turn right onto Maple Avenue, and go up to the lights. Instead of turning left here, turn right, with the park on your left. Then after the zebra crossing, take the first turning on your left onto New Road. Drive along New Road until you reach the bridge. Sarah's house is the second house after the bridge. That's on the right; there are shops on the left. Once you've picked up Sarah, take the first turning on the left, onto Silver Street, and go straight ahead until you reach the roundabout. Go straight ahead at the roundabout and then take the first turning on the right, Oak Avenue. My house is number 1. It's on the corner.`;

const T51 = `Tanya: Hi Jane, this is Tanya. I'm calling to make arrangements for the concert on Saturday. I can't believe you've never been to the Arena before. I often go at the weekend. There isn't just the Arena concert venue, there are also lots of other things to do: shopping, restaurants, exhibitions. I'm giving Melissa and Sarah a lift, so shall we all meet up for a coffee before the concert? I'll give you directions. OK, listen carefully.
As you walk through the main entrance, you come to a square with a big fountain in the middle. This is where people usually arrange to meet up and sometimes they have live music here. Beyond the square, on Main Avenue, on your right, there are several restaurants, and opposite these on your left is an exhibition centre. There used to be a cinema here, but they moved it when they finished building the Arena.
So there are several coffee shops to choose from, one near the fountain and one in the north end of the building, but I suggest that we go to the one at the end of Main Avenue, because it'll probably be less busy than the others. It's right at the end, after you pass the art gallery on the right. So shall we all meet there at seven o'clock?
Then, after we've had a coffee, to get into the Arena we just need to go through the shopping centre, which will be on our right once we go back down Main Avenue. It can be a bit tempting, but there's no other way to get there, as the Arena is the other side of it. Oh, and there are toilets beside the entrance if you need them. And then after the concert, they open the door opposite and you can go straight out into the car park, which is very convenient.
Let me know if you can make it for seven. I'm looking forward to seeing you – it's been a while.`;

const T52 = `First of all, welcome to our activity summer camp. I hope you enjoy all the activities we have on offer. We start our tour at the outdoor theatre here, where we hold many of our evening activities. From here you can see our various watersport activities. Directly in front of the campsite, on the edge of the lake, we have the kayaking centre. And then in front of the beach, we have an area reserved for diving. Swimming isn't permitted here.
If you like racket sports, just behind the beach you can practise badminton in the large building. That's quite popular in the evenings. We also have some outdoor tennis courts. We used to have basketball in the building too, but now you can play it on the court behind the building. And if these activities make you hungry, the path from there takes you straight to the cafe and dining hall.
However, we'll continue our walk along the lake shore and I'd like to draw your attention to two other areas. One is this part of the lake which is perfect for swimming, but, for safety reasons, only when an instructor is present. Unfortunately we can't offer sailing as an option here this year. And I also want to point out, just across the lake, a track for cycling. Some people in the past have also gone running on the track, but there were a few accidents because there isn't enough space for runners and cyclists, so now running isn't allowed.
So now let's take this path here, towards the tennis courts. On our left, you can see there's a football field. Gary's our coach and he'll be organising tournaments during the week. He'll arrive tomorrow, because he's taking part in a rugby game today.
And now if we walk up to the right of the tennis courts, we can see the archery field, surrounded by trees. And in the building just to the right of this, you can hire equipment for the archery and buy snacks and drinks. It also has some table tennis tables, so you can go there and have a game if the weather turns bad.`;

const T53 = `Good morning. I'd like to thank the council for agreeing to this meeting and for welcoming us here today to explain to you our plans for Pine Woods Centre. Our aim is to make Pine Woods a place where people of all ages can come and enjoy their free time. The centre will feature our Tree Tops Challenge – only for the brave and fearless! For the less brave, and for families with children, there will be adventure playgrounds, indoor and outdoor, and a feeding area for farm animals and we will also offer cycle trails through the woods.
I'll give you an overview of Pine Woods first and then tell you more about each area in more detail. This first slide shows the overall layout of the centre and where all the activities will be situated. As you can see from the map, the entrance to this attraction will be on the south side. As visitors enter from the car park, they will walk along this path leading them to the cafe and gift shop. The gift shop will be where tickets are on sale and therefore needs to be near the entrance. So this building here on the right will be the cafe and the building on the left will be the gift shop. There will also be a picnic field behind the cafe for the warmer months. It's the area just to the right of the cafe as you look at the map. And in the bottom right-hand corner of the picnic field we're planning to have a barbecue area, where people can hire a barbecue and bring their own food to cook. It'll be great for parties. In summer we plan to have bands performing here in the evenings.
To the west of the gift shop is where the Tree Tops Challenge will take place. There's a path here winding through the forest, and up in the trees there will be all sorts of high-level adventure apparatus – rope swings, awesome rope bridges and tunnels, and zip wires where you can fly way above the forest floor. This adventure experience will only be open to those aged 15 and over.
Beyond the Tree Tops Challenge there will be an adventure playground. To get to it, you go along this path from the entrance until you reach the crossroads, then you turn left. The young children's playground will have a fence around it, making it safer and keeping them away from the lake. The indoor play area, only for the very young, will be on the east side of the farm, near the cafe and just inside the picnic area.
And finally, let's turn our attention back to this area here, where the paths meet and form a crossroads. This path leading to the east end of the farm will take our visitors to the area which houses the farm animals. Children will be able to watch the animals being fed and cared for, and in some instances they will be able to feed the animals themselves. The sheep will be in this first area on the right here, directly opposite the pigs, and the goats will go at the very end there. We haven't quite decided on the other areas yet.
So those are our plans. We hope they will be approved, and we look forward to welcoming you back in the not too distant future to see the final result.`;

const mapQs = (n, qs) => qs.map(([text, ans, ex], i) => ({ questionNumber: n + i, type: 'map-labelling', questionText: text, correctAnswer: ans, explanation: ex }));
// Map labelling on listening.html: 'map' group = picture + drag-drop chips
// (dragDropConfig.words); the stored answer is the chip text (a letter here).
const mapGroup = (title, instruction, image, letters, qs) => ({
  groupType: 'map', groupTitle: title, instruction, imageUrl: image,
  dragDropConfig: { text: '', words: letters.split('') }, questions: qs,
});

module.exports = {
  n: 6,
  title: 'Leisure time',
  titleVi: 'Thời gian rảnh rỗi',
  pages: '106–111, 117–120',
  outcomes: [
    'Reading: scan tìm đúng đoạn; True / False / Not Given; summary completion có word bank',
    'Grammar: so sánh hơn (faster, more dangerous, not as … as)',
    'Listening: chỉ đường; map labelling (bản đồ thị trấn, toà nhà, công viên); nhận diện distractors',
    'Từ vựng thể thao, giải trí, chỉ đường (Sổ 3)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: sports',
      titleEn: 'Lead-in (p. 106)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Gọi tên các môn thể thao và mô tả đặc điểm (team sport, score goals, racket…)'],
      images: ['media:m1u06-sports.jpg|Ex. 1 (p. 106): sports A–E'],
      theory: [
        card('Từ vựng mô tả môn thể thao', 'Describing sports', {
          usage: ['**team sport** môn đồng đội · **score goals** ghi bàn · **goalkeeper** thủ môn · **coloured belts** đai màu (võ thuật)', '**hit the ball over a net** đánh bóng qua lưới · **bat** gậy/vợt (bóng chày, bóng bàn) · **racket** vợt (tennis) · **singles / doubles** đánh đơn / đôi', '**tackle** cản/xoạc người chơi khác · **play on grass** chơi trên cỏ'],
        }),
      ],
      vocab: vocabFile('u06-reading', [SPORTS, PARKOUR]),
      ex: [
        match('Name the sports (Ex. 1)', 'Can you name these sports?', [
          ['Picture A', 'baseball'], ['Picture B', 'martial arts'], ['Picture C', 'hockey'], ['Picture D', 'table tennis'], ['Picture E', 'rugby'],
        ], { stimulus: picture('media:m1u06-sports.jpg', 'Ex. 1') }),
        mcq('Sports and descriptions (Ex. 2)', 'Match the sports with the descriptions. Each sport matches several descriptions. Choose the correct set for each sport.', [
          ['hockey', ["It's a team sport; you score goals; there's a goalkeeper; it's played with a ball; you tackle other players; you play on grass.", 'You hit the ball over a net; you can play singles or doubles; you use a racket.', 'You earn coloured belts.'], 'A'],
          ['tennis', ['You hit the ball over a net; you can play singles or doubles; it\'s played with a ball; you use a racket.', "It's a team sport; you score goals; there's a goalkeeper.", 'You hit the ball with a bat; you play on grass.'], 'A'],
          ['volleyball', ["It's a team sport; you hit the ball over a net; you mustn't run with the ball; it's played with a ball.", 'You use a racket; you can play singles or doubles.', "You score goals; there's a goalkeeper; you play on grass."], 'A'],
          ['football', ["It's a team sport; you score goals; there's a goalkeeper; it's played with a ball; you tackle other players; you play on grass.", 'You hit the ball with a bat.', 'You earn coloured belts.'], 'A'],
          ['rugby', ["It's a team sport; it's played with a ball; you tackle other players; you play on grass.", 'You hit the ball over a net; you use a racket.', "You mustn't run with the ball."], 'A', 'Rugby được chạy cầm bóng; không có thủ môn.'],
          ['baseball', ["It's a team sport; you hit the ball with a bat; it's played with a ball.", "There's a goalkeeper; you score goals.", 'You can play singles or doubles; you use a racket.'], 'A'],
          ['table tennis', ['You hit the ball over a net; you hit the ball with a bat; you can play singles or doubles; it\'s played with a ball.', "It's a team sport; you tackle other players.", 'You play on grass; you score goals.'], 'A', 'Vợt bóng bàn gọi là bat (Anh-Anh).'],
          ['martial arts', ['You earn coloured belts.', "It's played with a ball; you play on grass.", 'You use a racket.'], 'A'],
          ['basketball', ["It's a team sport; you score goals; it's played with a ball.", 'You hit the ball with a bat.', "There's a goalkeeper; you play on grass."], 'A'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: True / False / Not Given & summary completion',
      titleEn: 'True / False / Not Given · Summary completion · Exam skills (pp. 107–111)',
      minutes: 60,
      objectives: ['Phân biệt TRUE (khớp), FALSE (trái ngược) và NOT GIVEN (bài không nói)', 'Chỉ dựa vào bài đọc, không dùng hiểu biết riêng', 'Summary completion với word bank: đoán loại từ trước khi chọn', 'Cẩn thận từ như some, often, only làm đổi nghĩa câu'],
      theory: [
        card('True / False / Not Given', 'True / False / Not Given', {
          formula: ['**TRUE**: câu khớp với thông tin trong bài · **FALSE**: bài nói điều **ngược lại** hoặc khác · **NOT GIVEN**: bài **không có thông tin** để biết đúng hay sai.'],
          usage: ['Chỉ trả lời theo **bài đọc**, không theo hiểu biết của bạn.', 'Câu hỏi đi **theo thứ tự** bài → scan tìm đúng đoạn rồi đọc kỹ vài câu.', 'NOT GIVEN chỉ liên quan **một phần** của bài: đọc kỹ đoạn đó, không thấy thông tin → NOT GIVEN, đừng lục cả bài.', 'Từ như **only, some, often, occasionally** dễ biến câu thành FALSE/NOT GIVEN ("some sports" ≠ "many sports").'],
          examples: [['Kabaddi is only played by men. → NOT GIVEN', 'Đoạn C dùng "he" cho raider nhưng không nói chỉ nam giới chơi.'], ['Bossaball is played on grass. → FALSE', 'Bài: "played on an inflatable pitch".']],
        }),
        card('Summary completion', 'Summary completion', {
          formula: ['Đọc cả đoạn tóm tắt → xác định **loại từ** cần điền (danh từ, động từ, tính từ…) → **đoán** trước → chọn từ trong khung → đọc lại câu kiểm tra ngữ pháp và nghĩa.'],
          usage: ['Ví dụ: "a number of ___ new sports" → trước tính từ + danh từ → cần tính từ/trạng từ → boring hay strange? → **strange**.', 'Có **nhiều từ hơn chỗ trống**.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U06-R1', title: 'Unusual sports (Ex. 5–10)', note: 'Scan · True/False · Not Given · summary completion.' },
        { ref: 'reading:M1-U06-R2', title: 'Exam skills: Parkour (Ex. 12)', note: '8 câu TFNG + 7 câu summary completion.' },
      ],
      ex: [
        match('Scan for the paragraph (Ex. 5)', 'Quickly scan the text to find the paragraph which contains information about these sports.', [
          ['a sport which is trying to get into the Olympic games', 'Paragraph B (buzkashi)'],
          ['a sport which has been played for more than a thousand years and is based on an activity most of us know', 'Paragraph E (roshambo)'],
          ['a sport influenced by two very popular sports', 'Paragraph A (bossaball)'],
          ['a sport which may involve repeating a word', 'Paragraph C (kabaddi)'],
          ['a sport which involves two activities which are very unlike each other', 'Paragraph D (chess boxing)'],
        ], { stimulus: stim(SPORTS, 'Unusual sports (p. 107)') }),
      ],
    },

    grammar: {
      title: 'Grammar focus: comparatives',
      titleEn: 'Grammar focus: comparatives (p. 109)',
      minutes: 30,
      objectives: ['Tạo dạng so sánh hơn của tính từ ngắn và dài', 'Dùng not as … as để so sánh', 'Nói ý kiến về các môn thể thao bằng câu so sánh'],
      keyLanguage: [
        'Tính từ **1 âm tiết**: + **-er** (fast → fast**er**, hard → hard**er**); tận cùng -y → **-ier** (healthy → health**ier**); 1 nguyên âm + 1 phụ âm → gấp đôi (big → big**ger**).',
        'Tính từ **2+ âm tiết**: **more** + adj (more dangerous, more exciting, more popular). Bất quy tắc: good → better, bad → worse.',
        '**not as + adj + as**: Roshambo is **not as** dangerous **as** chess boxing. Trong bài: Kabaddi is a sport that is **more likely** to become famous. / it has become **more popular**.',
      ],
      theory: [
        card('So sánh hơn', 'Comparatives', {
          formula: ['A + is + adj-er + than + B', 'A + is + more + adj + than + B', 'A + is + not as + adj + as + B'],
          examples: [['Kabaddi is faster than roshambo.', 'Kabaddi nhanh hơn oẳn tù tì.'], ['Chess boxing is more dangerous than roshambo.', 'Đấm bốc cờ vua nguy hiểm hơn.'], ['Bossaball is not as unusual as buzkashi.', 'Bossaball không lạ bằng buzkashi.']],
        }),
      ],
      links: [{ grammar: 'comparisons', title: 'Comparisons', note: '-er / more / not as … as' }],
      ex: [
        gap('Comparative forms (Ex. 11)', 'Complete these comparative sentences about the sports in the text. Use the comparative form of the adjective in brackets.', [
          ['Kabaddi is ____ (fast) than roshambo.', 'faster'],
          ['Chess boxing is ____ (dangerous) than roshambo.', 'more dangerous'],
          ['Bossaball is ____ (exciting) than ordinary volleyball.', 'more exciting'],
          ['Chess boxing is ____ (hard) than kabaddi because you need two different skills.', 'harder'],
          ['Roshambo is not as ____ (unusual) as buzkashi.', 'unusual', 'not as + adj (nguyên mẫu) + as.'],
          ['Kabaddi is a sport that is ____ (likely) to become famous.', 'more likely', 'Câu trong bài.'],
          ['Since then, chess boxing has become ____ (popular).', 'more popular', 'Câu trong bài.'],
          ['Kabaddi is ____ (cheap) to play than buzkashi – you don\'t need any equipment.', 'cheaper'],
          ['Is football ____ (healthy) than computer games?', 'healthier', 'healthy → healthier.'],
          ['I think tennis is ____ (good) than badminton.', 'better', 'good → better (bất quy tắc).'],
        ]),
        mcq('Choose the correct comparative (Ex. 11)', 'Choose the correct sentence.', [
          ['Which sentence is correct?', ['Rugby is more dangerous than tennis.', 'Rugby is dangerouser than tennis.', 'Rugby is more dangerouser than tennis.'], 'A'],
          ['Which sentence is correct?', ['Table tennis is not as fast as squash.', 'Table tennis is not as faster as squash.', 'Table tennis is not fast than squash.'], 'A'],
          ['Which sentence is correct?', ['Basketball is more easy than hockey.', 'Basketball is easier than hockey.', 'Basketball is easyer than hockey.'], 'B', 'easy → easier.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: directions & labelling a map',
      titleEn: 'Lead-in · Labelling a map · Recognising distractors · Map of a building · Map of a park · Exam skills (pp. 117–120)',
      slot: SLOT,
      minutes: 60,
      objectives: ['Từ vựng chỉ đường: turn left/right, go straight on, go past, opposite, behind…', 'Hiểu bản đồ trước khi nghe; câu hỏi theo thứ tự bài nghe', 'Nhận diện distractor khi nghe chỉ đường', 'Ghi nhãn bản đồ thị trấn, toà nhà, khu cắm trại'],
      images: ['media:m1u06-directions.jpg|Ex. 1 (p. 117): useful verbs and prepositions of place 1–8', 'media:m1u06-places.jpg|Ex. 3 (p. 118): places on the map 1–8'],
      theory: [
        card('Ba kiểu map labelling', 'Labelling a map', {
          usage: ['① Nghe và **chọn chữ cái** chỉ vị trí trên bản đồ · ② chọn **nhãn từ danh sách** (nhiều nhãn hơn cần) · ③ **tự viết** nhãn (tối đa 3 từ).', 'Trước khi nghe: đọc câu hỏi, **xem kỹ bản đồ** (hướng Bắc, lối vào, đường, toà nhà), đoán từ ngữ sẽ nghe.', 'Câu hỏi đi **theo thứ tự** bài nghe.'],
        }),
        card('Từ ngữ chỉ đường', 'Giving directions', {
          usage: ['**turn left / right (onto X Street)** · **go straight ahead / straight on** · **go past** · **take the first turning on the left** · **at the roundabout / traffic lights / crossroads**', '**next to · opposite · in front of · behind · on the corner · at the end of · beside**'],
        }),
        card('Distractors khi chỉ đường', 'Recognising distractors', {
          usage: ['"You **can also** go straight on here… **but I usually** drive down Main Street." → đường đúng là Main Street.', '"**Instead of** turning left here, turn right" → không rẽ trái.', '"Sarah\'s house is… on the right; there are shops on the left." → đừng chọn khu cửa hàng.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U06-L1', title: "Melissa's directions (Ex. 4)", note: 'Main Street, Silver Street, nhà Melissa — chọn chữ A–K.' },
        { ref: 'listening:M1-U06-L2', title: "Melissa's second message (Ex. 5)", note: 'New Road, nhà Sarah, Oak Avenue.' },
        { ref: 'listening:M1-U06-L3', title: 'Map of a building: the Arena (Ex. 7)', note: 'Chọn A–H cho vị trí 1–4.' },
        { ref: 'listening:M1-U06-L4', title: 'Map of a park: an activity camp (Ex. 9)', note: 'Viết tên hoạt động (tối đa 2 từ).' },
        { ref: 'listening:M1-U06-L5', title: 'Exam skills: Pine Woods Centre (Ex. 10)', note: '8 câu map labelling A–M.' },
      ],
      vocab: vocabFile('u06-listening', [T49, T50, T51, T52, T53]),
      ex: [
        match('Words for giving directions (Ex. 1)', 'Each picture illustrates a word or phrase used to give directions. Match the pictures with the words in the box.', [
          ['Picture 1', 'turn right'], ['Picture 2', 'go straight ahead / straight on'], ['Picture 3', 'turn left'], ['Picture 4', 'go past'],
          ['Picture 5', 'next to'], ['Picture 6', 'opposite'], ['Picture 7', 'in front of'], ['Picture 8', 'behind'],
        ], { stimulus: picture('media:m1u06-directions.jpg', 'Ex. 1') }),
        match('Places on the map (Ex. 3)', 'Match the places that appear on the map (the words in the box) with the pictures.', [
          ['Picture 1', 'roundabout'], ['Picture 2', 'park'], ['Picture 3', 'traffic lights'], ['Picture 4', 'pond'],
          ['Picture 5', 'zebra crossing'], ['Picture 6', 'crossroads'], ['Picture 7', 'river'], ['Picture 8', 'bridge'],
        ], { stimulus: picture('media:m1u06-places.jpg', 'Ex. 3') }),
        mcq('Recognising distractors (Ex. 6)', "Read the extracts from Melissa's messages. Which words or phrases may distract you from choosing the correct answer?", [
          ["(Question 1) Then, you need to turn left at the traffic lights and then take a sharp right onto Main Street. You can also go straight on here, past the surgery, but I usually drive down Main Street.", ['You can also go straight on here, past the surgery', 'take a sharp right onto Main Street', 'turn left at the traffic lights'], 'A', 'Đường thẳng qua phòng khám là một lựa chọn khác, không phải Main Street.'],
          ['(Question 4) Again, you need to turn right onto Maple Avenue, and up to the lights. Instead of turning left here, turn right, with the park on your left.', ['Instead of turning left here', 'turn right onto Maple Avenue', 'with the park on your left'], 'A'],
          ["(Question 5) Drive along New Road until you reach the bridge. Sarah's house is the second house after the bridge. That's on the right; there are shops on the left.", ['there are shops on the left', 'the second house after the bridge', "That's on the right"], 'A'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U06-R1',
      title: 'Mindset 1 · Unit 6 — Unusual sports',
      content: html(SPORTS),
      questionGroups: [
        qTFNG(1, 'The following questions relate to the sections you found. Decide if they are TRUE or FALSE. (Ex. 6)', [
          ['Players of chess boxing only need to reach a high level in one of the activities.', 'FALSE', 'D: "players need to be very good at **two** very different activities".'],
          ['Buzkashi got written rules long after the game first started.', 'TRUE', 'B: chơi "for hundreds of years" và "has **finally** written down the rules".'],
          ['Roshambo can be played by anyone, even children and the elderly.', 'TRUE', 'E: "Played by **young and old**".'],
          ['Bossaball is played on grass.', 'FALSE', 'A: "played on an **inflatable pitch** with a trampoline".'],
          ['It could be quite expensive to play kabaddi.', 'FALSE', 'C: "doesn\'t need any equipment" → không tốn kém.'],
        ], 'Questions 1–5'),
        qTFNG(6, 'Does this statement agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN. (Ex. 7) Hint: you ONLY need to read the paragraph about kabaddi.', [
          ['Kabaddi is only played by men.', 'NOT GIVEN', 'Đoạn C dùng "he" cho người raider nhưng không nói chỉ nam giới chơi → NOT GIVEN.'],
        ], 'Question 6'),
        qTFNG(7, 'Read only the relevant paragraphs. Is this information TRUE or NOT GIVEN? (Ex. 8)', [
          ['Bossaball is only played in Brazil.', 'NOT GIVEN', 'A chỉ nói có yếu tố võ thuật Brazil, không nói nơi chơi.'],
          ['Buzkashi is sometimes played with a sheep instead of a goat.', 'NOT GIVEN', 'B chỉ nhắc "a dead goat".'],
          ['There are different versions of the game kabaddi.', 'TRUE', 'C: "In **some versions** of the game…".'],
          ['Chess boxing is played in several different countries.', 'TRUE', 'D: "Germany, the UK, India and Russia".'],
          ['The roshambo world champion is from China.', 'NOT GIVEN', 'E: roshambo bắt nguồn từ Trung Quốc, có giải vô địch, nhưng không nói nhà vô địch đến từ đâu.'],
        ], 'Questions 7–11'),
        qTFNG(12, 'Answer TRUE, FALSE or NOT GIVEN to these questions about the text. (Ex. 9)', [
          ['People play bossaball on a soft surface.', 'TRUE', 'A: "inflatable pitch with a trampoline" → mặt sân mềm.'],
          ['Buzkashi is an Olympic sport.', 'FALSE', 'B: "they **hope to get** Olympic status" → chưa phải.'],
          ['Kabaddi is often played in schools.', 'NOT GIVEN', 'C: kabaddi **giống** trò "tag" mà học sinh chơi — không nói kabaddi được chơi ở trường.'],
          ['Iepe Rubingh invented chess boxing.', 'NOT GIVEN', 'D: ông **thắng** giải vô địch đầu tiên, không nói ông phát minh.'],
          ['Iepe Rubingh is from Germany.', 'FALSE', 'D: "a **Dutchman**, Iepe Rubingh" (người Hà Lan).'],
          ['People consider roshambo a serious sport.', 'TRUE', 'E: "taken so seriously: there\'s a World Rock Paper Scissors Society and a league".'],
        ], 'Questions 12–17'),
        qSummary('Complete the summary using the list of words A–L below. (Ex. 10)',
          'If you have had enough of the ordinary sports people play, you can try a number of strange new sports. Some of these were created when people __Q18__ two well-known sports. Sometimes they added a __Q19__ from the part of the world where they live. Bossaball is an example of this. It takes volleyball and football, adds a trampoline and some Brazilian martial arts. Buzkashi, a sport from Afghanistan, is played on __Q20__ and uses a dead goat instead of a ball! People in Afghanistan would like this sport to become international. Chess boxing is a sport where you need to __Q21__ rapidly from one type of activity to another. You need to be __Q22__ and also fit. It is becoming more and more popular and now holds world championships.',
          ['boring', 'change', 'clever', 'feature', 'horses', 'join', 'mixed', 'moving', 'serious', 'sport', 'strange', 'trampolines'],
          { 18: 'mixed', 19: 'feature', 20: 'horses', 21: 'change', 22: 'clever' },
          {
            18: 'A: "Many of these are **a mix of** existing sports" → mixed (động từ quá khứ sau "people"). "join" sai thì.',
            19: 'A: "sometimes with a **local element** added" → a feature (sau mạo từ "a" cần danh từ số ít).',
            20: 'B: "players **on horseback**" → played on horses.',
            21: 'D: "be able to **switch** quickly between the two" → change (sau "need to" cần động từ nguyên mẫu).',
            22: 'D: "a classic mix of **brains** and brawn" → clever (tính từ, đi cùng "fit").',
          }, 'Questions 18–22'),
      ],
    },
    {
      ref: 'M1-U06-R2',
      title: 'Mindset 1 · Unit 6 — Parkour',
      content: html(PARKOUR),
      questionGroups: [
        qTFNG(1, 'Do the following statements agree with the information in the text? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.', [
          ['You have to use a limited number of moves in parkour.', 'FALSE', 'A: "There are **no limits** on how you move in parkour".'],
          ['Parkour is mainly done in the countryside.', 'NOT GIVEN', 'Bài nói "adapt to any environment", không nói chủ yếu ở nông thôn.'],
          ['Parkour began in the twentieth century.', 'TRUE', 'A: "developed in France in the **1980s**".'],
          ['The Yamakasi did not allow latecomers.', 'TRUE', 'B: "Members **had to arrive on time**".'],
          ['When doing parkour, Raymond Belle recommends that you always choose the easy route.', 'FALSE', 'C: "always take the **more difficult** one".'],
          ['There are many gyms in France where you can do parkour.', 'NOT GIVEN', 'D: "There are **some** gyms and camps" — không nói nhiều, không nói ở Pháp.'],
          ['The founder of parkour was a very good teacher of parkour.', 'FALSE', 'D: "The founder of parkour **refused to teach** people".'],
          ['Freerunning and parkour are similar.', 'TRUE', 'E: "There are **more similarities than differences** between the two activities".'],
        ], 'Questions 1–8'),
        qSummary('Complete the summary of the text using the list of words A–M below.',
          'Parkour is an activity that involves __Q9__ in many different ways through different environments. People who practise parkour are called __Q10__. They believe that parkour is not a sport and can never be part of a __Q11__. The values of parkour are adaptability, __Q12__ and freedom. Parkour should not be taught because it is about discovering your own way of moving and overcoming __Q13__. Although there are gyms and other places where you can learn and practise parkour, many feel that this __Q14__ with the values of the discipline. Freerunning is a type of parkour. However, it is more about __Q15__ development than parkour, which is often, but not always, done as part of a group.',
          ['agrees', 'barriers', 'competition', 'conflicts', 'creativity', 'latecomers', 'move', 'moving', 'personal', 'respect', 'team', 'tournaments', 'traceurs'],
          { 9: 'moving', 10: 'traceurs', 11: 'competition', 12: 'creativity', 13: 'barriers', 14: 'conflicts', 15: 'personal' },
          {
            9: 'A: "running, climbing, swinging…" — sau "involves" cần V-ing → moving (không phải move).',
            10: 'B: "traceurs (people who do parkour)".',
            11: 'C: "parkour can never be a **competitive sport**" → part of a competition. (tournaments số nhiều không hợp với "a").',
            12: 'D: "adapt to any environment and **be creative**" → creativity.',
            13: 'C: "getting over mental as well as physical **barriers**".',
            14: 'D: "the idea of having classes… **conflicts with** the values of parkour". BẪY: agrees nghĩa ngược lại.',
            15: 'E: freerunning "has more focus on the **individual**" → personal development.',
          }, 'Questions 9–15'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U06-L1', title: "Mindset 1 · Unit 6 — Melissa's directions",
      description: 'Melissa gives Tanya directions to her house.', partNumber: 2, audioFile: 'Mindset_L1_49.mp3', transcript: T49,
      questionGroups: [mapGroup('Questions 1–3', "Look at the map and find Tanya's house. Listen to Melissa giving Tanya directions to her house and label the map. Write the correct letter, A–K, next to questions 1–3. (Ex. 4)", 'media:m1u06-town.jpg', 'ABCDEFGHIJK', mapQs(1, [
        ['Main Street', 'G', lx('Phố Main', 'Đầu bài.', ['turn left at the traffic lights and then take a sharp right onto Main Street', 'You can also go straight on here, past the surgery, but I usually drive down Main Street'], 'Từ đèn giao thông rẽ trái rồi rẽ gắt sang phải → con đường chạy dọc cửa hàng (G). BẪY: đi thẳng qua phòng khám là đường khác.')],
        ['Silver Street', 'D', lx('Phố Silver', 'Giữa bài.', ["Follow this road until you reach a roundabout – you'll pass a park and some shops on your right", 'take the first turning on the left, onto Silver Street'], '')],
        ["Melissa's house", 'C', lx('Nhà Melissa', 'Cuối bài.', 'As you approach the crossroads here, my house is the first on the corner', '')],
      ]))],
    },
    {
      ref: 'M1-U06-L2', title: "Mindset 1 · Unit 6 — Melissa's second message",
      description: 'A new route that picks up Sarah on the way.', partNumber: 2, audioFile: 'Mindset_L1_50.mp3', transcript: T50,
      questionGroups: [mapGroup('Questions 4–6', "Now listen to Melissa's second message. She wants Tanya to pick up another friend, Sarah, on the way. Label the map. Write the correct letter, A–K, next to questions 4–6. (Ex. 5)", 'media:m1u06-town.jpg', 'ABCDEFGHIJK', mapQs(4, [
        ['New Road', 'K', lx('Đường New', '', ['Instead of turning left here, turn right, with the park on your left', 'after the zebra crossing, take the first turning on your left onto New Road'], 'BẪY: "Instead of turning left".')],
        ["Sarah's house", 'I', lx('Nhà Sarah', '', ["Sarah's house is the second house after the bridge. That's on the right; there are shops on the left"], 'BẪY: cửa hàng ở bên trái.')],
        ['Oak Avenue', 'B', lx('Đại lộ Oak', 'Cuối bài.', ['Go straight ahead at the roundabout and then take the first turning on the right, Oak Avenue'], '')],
      ]))],
    },
    {
      ref: 'M1-U06-L3', title: 'Mindset 1 · Unit 6 — Map of a building: the Arena',
      description: "Tanya's message to a friend, arranging to meet before the concert.", partNumber: 2, audioFile: 'Mindset_L1_51.mp3', transcript: T51,
      questionGroups: [{
        groupType: 'map', groupTitle: 'Questions 1–4', imageUrl: 'media:m1u06-building.jpg',
        instruction: "Listen to Tanya's description and label the map. Choose the correct place (A art gallery, B cinema, C live music, D car park, E restaurants, F exhibition centre, G Arena, H shopping centre) for places 1–4 on the map. (Ex. 7)",
        dragDropConfig: { text: '', words: ['art gallery', 'cinema', 'live music', 'car park', 'restaurants', 'exhibition centre', 'Arena', 'shopping centre'] },
        questions: mapQs(1, [
          ['Place 1 (on the map)', 'exhibition centre', lx('Vị trí 1', 'Đoạn 2.', ['on Main Avenue, on your right, there are several restaurants, and opposite these on your left is an exhibition centre', 'There used to be a cinema here'], 'Vị trí 1 ở bên trái Main Avenue → exhibition centre. BẪY: cinema đã chuyển đi.')],
          ['Place 2 (on the map)', 'art gallery', lx('Vị trí 2', 'Đoạn 3.', ["I suggest that we go to the one at the end of Main Avenue", "It's right at the end, after you pass the art gallery on the right"], 'Ô 2 nằm bên phải Main Avenue, ngay trước quán cà phê ở cuối đường → art gallery (Answer Key: 2 A). BẪY: "restaurants" cũng ở bên phải nhưng là ba ô nhỏ gần lối vào, không đánh số.')],
          ['Place 3 (on the map)', 'shopping centre', lx('Vị trí 3', 'Đoạn 4.', 'to get into the Arena we just need to go through the shopping centre, which will be on our right once we go back down Main Avenue', '')],
          ['Place 4 (on the map)', 'Arena', lx('Vị trí 4', 'Đoạn 4.', 'the Arena is the other side of it', 'Arena nằm sau trung tâm mua sắm.')],
        ]),
      }],
    },
    {
      ref: 'M1-U06-L4', title: 'Mindset 1 · Unit 6 — Map of a park: an activity camp',
      description: 'The manager gives a tour of the activity camp.', partNumber: 2, audioFile: 'Mindset_L1_52.mp3', transcript: T52,
      questionGroups: [Object.assign(qFill(1, 'Listen to the manager giving a tour of the activity camp to a group of teenagers. Label the map with which activity they can do in each place. Use NO MORE THAN TWO WORDS for each activity. (Ex. 9)', [
        ['Place 1 (on the map)', 'diving', lx('Vị trí 1', '', 'in front of the beach, we have an area reserved for diving. Swimming isn\'t permitted here', 'BẪY: không được bơi ở đây.')],
        ['Place 2 (on the map)', 'badminton', lx('Vị trí 2', '', 'just behind the beach you can practise badminton in the large building', '')],
        ['Place 3 (on the map)', 'basketball', lx('Vị trí 3', '', 'We used to have basketball in the building too, but now you can play it on the court behind the building', '')],
        ['Place 4 (on the map)', 'swimming', lx('Vị trí 4', '', "this part of the lake which is perfect for swimming… Unfortunately we can't offer sailing", 'BẪY: sailing không có.')],
        ['Place 5 (on the map)', 'cycling', lx('Vị trí 5', '', "a track for cycling… so now running isn't allowed", 'BẪY: running không được phép.')],
        ['Place 6 (on the map)', 'football', lx('Vị trí 6', '', "On our left, you can see there's a football field", 'BẪY: rugby là việc của huấn luyện viên hôm nay.')],
        ['Place 7 (on the map)', 'table tennis', lx('Vị trí 7', '', 'in the building just to the right of this… It also has some table tennis tables', '')],
      ], 'Questions 1–7'), { groupType: 'map', imageUrl: 'media:m1u06-camp.jpg' })],
    },
    {
      ref: 'M1-U06-L5', title: 'Mindset 1 · Unit 6 — Exam skills: Pine Woods Centre',
      description: 'A talk about plans for a new forest centre.', partNumber: 2, audioFile: 'Mindset_L1_53.mp3', transcript: T53,
      questionGroups: [mapGroup('Questions 1–8', 'You will hear someone giving a talk about plans for a new forest centre. Label the map. Choose the correct letter, A–M, and write the answers next to questions 1–8. (Ex. 10)', 'media:m1u06-pinewoods.jpg', 'ABCDEFGHIJKLM', mapQs(1, [
        ['tickets on sale here', 'J', lx('Nơi bán vé', '', ['The gift shop will be where tickets are on sale', 'this building here on the right will be the cafe and the building on the left will be the gift shop'], 'Lối vào ở phía nam; toà bên trái lối đi = gift shop (J); bên phải = cafe (K).')],
        ['picnic field', 'L', lx('Bãi dã ngoại', '', "It's the area just to the right of the cafe as you look at the map", '')],
        ['barbecue area', 'M', lx('Khu nướng BBQ', '', 'in the bottom right-hand corner of the picnic field', '')],
        ['Tree Tops Challenge', 'I', lx('Tree Tops Challenge', '', 'To the west of the gift shop… a path here winding through the forest', '')],
        ['playground for young children', 'B', lx('Sân chơi trẻ nhỏ', '', ['Beyond the Tree Tops Challenge… you reach the crossroads, then you turn left', 'will have a fence around it… keeping them away from the lake'], 'Có hàng rào, gần hồ → B.')],
        ['indoor play area', 'F', lx('Khu vui chơi trong nhà', '', 'on the east side of the farm, near the cafe and just inside the picnic area', '')],
        ['sheep', 'G', lx('Cừu', '', 'The sheep will be in this first area on the right here, directly opposite the pigs', '')],
        ['goats', 'E', lx('Dê', '', 'the goats will go at the very end there', '')],
      ]))],
    },
  ],
};
