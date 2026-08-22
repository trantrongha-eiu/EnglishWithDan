// One-time content backfill — 7 cross-topic vocabulary lessons covering the
// building blocks of most IELTS Speaking Part 2 cue cards (Describe a
// person/place/event/object/activity/animal-or-place-in-nature/story you
// know), rather than a single fixed topic like the seedVocabLessonsIelts-
// SpeakingTopics.js lessons. Content supplied by the user (word/collocation/
// idiom + Vietnamese meaning + example for each entry); English definitions
// written here to match this repo's existing vocab-lesson convention (every
// prior seeded lesson has one) and to feed the MCQ quiz engine.
//
// Run: node scripts/seedVocabLessonsCueCardTopics.js
const ADMIN_EMAIL = 'tranhadeeptry@gmail.com'; // existing admin — createdBy, same as the other seedVocabLessons* scripts

// ── People ──────────────────────────────────────────────────────────────
const people = [
  ['charismatic', 'có sức lôi cuốn', "He is a charismatic person who easily attracts people's attention.", 'having a compelling charm that inspires devotion in others'],
  ['down-to-earth', 'chân chất, giản dị', 'Despite being successful, she is very down-to-earth.', 'sensible and practical, without pretension'],
  ['outgoing personality', 'tính cách hướng ngoại', 'His outgoing personality makes him easy to get along with.', 'the trait of being sociable and comfortable talking to new people'],
  ['a great sense of humour', 'khiếu hài hước', 'She has a great sense of humour and always makes me laugh.', 'the ability to find things funny and make others laugh'],
  ['easy to get along with', 'dễ hòa hợp', 'He is incredibly easy to get along with.', 'friendly and pleasant, so people find it simple to build a good relationship with them'],
  ['genuine kindness', 'lòng tốt chân thành', 'What I admire most is her genuine kindness.', 'sincere, heartfelt care and consideration for others'],
  ['a strong work ethic', 'tinh thần làm việc cao', 'He has a strong work ethic and never gives up easily.', 'a firm belief in the value of hard work and diligence'],
  ['a positive attitude', 'thái độ tích cực', 'She always has a positive attitude towards life.', 'an optimistic and hopeful way of viewing situations'],
  ['a source of inspiration', 'nguồn cảm hứng', 'My father has always been a source of inspiration to me.', 'someone or something that motivates others to think or act in a certain way'],
  ['look up to someone', 'ngưỡng mộ', 'I really look up to her because of her determination.', 'to admire and respect someone, often as a role model'],
  ['have a lot in common', 'có nhiều điểm chung', 'We have a lot in common, especially our love of music.', 'to share similar interests, experiences, or characteristics with someone'],
  ['leave a lasting impression', 'để lại ấn tượng lâu dài', 'She left a lasting impression on me.', 'to make people remember someone or something long after the encounter'],
  ['make a good impression', 'tạo ấn tượng tốt', 'He made a good impression when I first met him.', 'to cause other people to think well of someone from the start'],
  ['a role model', 'hình mẫu', 'She has always been a role model for me.', 'a person whose behaviour is worth imitating'],
  ["go out of one's way to do sth", 'cố gắng đặc biệt để làm gì', 'He always goes out of his way to help others.', 'to make a special, extra effort to do something for someone'],
  ['see eye to eye', 'đồng quan điểm', "We don't always see eye to eye, but we respect each other.", 'to agree with someone or share the same opinion'],
  ["have one's feet on the ground", 'thực tế, không viển vông', 'Despite his success, he still has his feet on the ground.', 'to be sensible and realistic rather than unrealistic or arrogant'],
  ['a people person', 'người giỏi giao tiếp', 'My sister is a real people person.', 'someone who is naturally good at interacting with and relating to others'],
  ['warm-hearted', 'ấm áp, tốt bụng', 'She is a warm-hearted person who always cares about others.', 'kind, friendly, and sympathetic towards others'],
  ['open-minded', 'cởi mở', "He is very open-minded and willing to listen to different opinions.", "willing to consider new ideas and other people's opinions"],
  ['reliable', 'đáng tin cậy', 'She is someone I can always rely on.', 'able to be trusted to do what is expected'],
  ['determined', 'quyết tâm', 'He is extremely determined to achieve his goals.', 'having made a firm decision and being resolved not to change it'],
  ['ambitious', 'có tham vọng', 'She is ambitious and always tries to improve herself.', 'having a strong desire to achieve success or a particular goal'],
  ['compassionate', 'giàu lòng trắc ẩn', 'He is a compassionate person who genuinely cares about others.', 'feeling or showing sympathy and concern for the suffering of others'],
  ['hard-working', 'chăm chỉ', 'My brother is incredibly hard-working.', 'putting a lot of effort and energy into work or tasks'],
  ['self-disciplined', 'có tính kỷ luật', 'She is very self-disciplined when it comes to her studies.', 'able to control own behaviour and stick to a plan without being told to'],
  ['a good listener', 'người biết lắng nghe', "She's a good listener, so I often talk to her about my problems.", 'someone who pays close attention and responds thoughtfully when others speak'],
  ['give someone a helping hand', 'giúp đỡ ai', 'He is always willing to give me a helping hand.', 'to help someone, especially with a practical task'],
  ['be there for someone', 'luôn ở bên khi ai cần', "She's always been there for me when I needed support.", 'to offer support and comfort to someone whenever they need it'],
  ['have a positive influence on', 'có ảnh hưởng tích cực đến', 'My teacher had a positive influence on me.', 'to affect someone in a way that helps them improve or feel better'],
  ['bring out the best in someone', 'giúp ai phát huy điểm tốt nhất', 'She always brings out the best in people around her.', 'to help someone show or develop their most positive qualities'],
  ['admire someone for something', 'ngưỡng mộ ai vì điều gì', 'I really admire him for his determination.', 'to respect and think highly of someone because of a particular quality or achievement'],
  ['have a way with people', 'rất khéo giao tiếp với mọi người', 'My father has a real way with people.', 'to be naturally skilled at talking to and getting on well with others'],
];

// ── Places ──────────────────────────────────────────────────────────────
const places = [
  ['breathtaking scenery', 'phong cảnh ngoạn mục', 'The area is famous for its breathtaking scenery.', 'natural views so beautiful they amaze the viewer'],
  ['pristine beach', 'bãi biển nguyên sơ', "It has one of the most pristine beaches I've ever seen.", 'a beach that is completely clean and untouched by human activity'],
  ['lively and vibrant', 'sôi động', 'The city is lively and vibrant, especially at night.', 'full of energy, activity, and excitement'],
  ['serene and tranquil', 'yên bình, thanh tĩnh', 'The countryside is incredibly serene and tranquil.', 'calm, peaceful, and free from disturbance'],
  ['iconic landmark', 'địa danh biểu tượng', 'The Eiffel Tower is an iconic landmark.', 'a famous structure or feature that is instantly recognisable and symbolic of a place'],
  ['picturesque', 'đẹp như tranh', "It's a picturesque little town surrounded by mountains.", 'visually attractive, like a painting'],
  ['stunning view', 'khung cảnh tuyệt đẹp', 'You can enjoy a stunning view of the ocean.', 'an extremely impressive or beautiful sight'],
  ['peaceful atmosphere', 'bầu không khí yên bình', 'What I love most is its peaceful atmosphere.', 'a calm, relaxed mood or feeling in a place'],
  ['steeped in history', 'giàu giá trị lịch sử', 'The city is steeped in history and culture.', 'having a long and rich historical background'],
  ['well-preserved', 'được bảo tồn tốt', 'The old buildings are remarkably well-preserved.', 'kept in very good condition despite age'],
  ['off the beaten track', 'ít người biết đến', "It's a great place that's slightly off the beaten track.", 'in a remote place that few people visit'],
  ['a hidden gem', 'nơi tuyệt vời ít người biết', 'This small village is a real hidden gem.', 'an excellent place or thing that is not widely known'],
  ["a stone's throw from", 'rất gần', "The hotel is just a stone's throw from the beach.", 'very close to, only a short distance away'],
  ['within walking distance', 'trong khoảng cách đi bộ', 'Most attractions are within walking distance.', 'close enough to reach on foot without needing transport'],
  ['get away from it all', 'tránh xa cuộc sống bận rộn', 'I go there to get away from it all.', 'to escape from the stress and pressure of everyday life'],
  ['a breath of fresh air', 'điều mới mẻ/dễ chịu', 'The countryside was a breath of fresh air after months in the city.', 'something refreshingly new and different from what came before'],
  ['a change of scenery', 'thay đổi không gian', 'I sometimes travel just for a change of scenery.', 'a move to a different environment for variety or refreshment'],
  ['draw visitors from all over', 'thu hút khách từ khắp nơi', 'The festival draws visitors from all over the country.', 'to attract tourists or guests from many different places'],
  ['scenic', 'có phong cảnh đẹp', "It's a very scenic area surrounded by mountains.", 'having beautiful natural scenery'],
  ['lush greenery', 'cây cối xanh tươi', 'The area is surrounded by lush greenery.', 'thick, healthy plants and vegetation'],
  ['stunning architecture', 'kiến trúc ấn tượng', 'The city is known for its stunning architecture.', 'impressively beautiful building design'],
  ['bustling streets', 'đường phố nhộn nhịp', 'I love walking through its bustling streets.', 'streets full of busy activity and movement'],
  ['a laid-back atmosphere', 'bầu không khí thư thái', 'The town has a really laid-back atmosphere.', 'a relaxed, easy-going mood with no pressure or rush'],
  ['a vibrant atmosphere', 'bầu không khí sôi động', 'There is a vibrant atmosphere in the city centre.', 'an environment full of energy and life'],
  ['a sense of tranquillity', 'cảm giác yên bình', 'The place gives me a wonderful sense of tranquillity.', 'a feeling of calmness and peace'],
  ['surrounded by nature', 'được bao quanh bởi thiên nhiên', 'The house is completely surrounded by nature.', 'having natural scenery all around'],
  ['nestled in the mountains', 'nằm nép mình giữa núi', 'The village is nestled in the mountains.', 'situated snugly among mountains, often sheltered'],
  ['a popular tourist attraction', 'điểm du lịch nổi tiếng', "It's one of the country's most popular tourist attractions.", 'a place that many visitors like to go and see'],
  ['a local hotspot', 'địa điểm nổi tiếng với người địa phương', "It's a popular local hotspot for young people.", 'a place that is especially popular among local residents'],
  ['a place worth visiting', 'nơi đáng ghé thăm', "It's definitely a place worth visiting.", 'a location that deserves to be seen because it offers something valuable'],
  ['escape the hustle and bustle', 'tránh xa sự hối hả', 'I go there to escape the hustle and bustle of city life.', 'to get away from the noisy, busy pace of daily/city life'],
  ['feel at home', 'cảm thấy như ở nhà', 'I always feel at home whenever I visit this place.', "to feel comfortable and relaxed, as if in one's own house"],
];

// ── Events / Experiences ───────────────────────────────────────────────
const events = [
  ['a turning point', 'bước ngoặt', 'It was a real turning point in my life.', "a moment when a significant change in a situation or someone's life occurs"],
  ['a memorable experience', 'trải nghiệm đáng nhớ', 'It was one of the most memorable experiences of my life.', 'an event that stays in someone’s memory because it was special'],
  ['a once-in-a-lifetime experience', 'trải nghiệm có một lần trong đời', 'It was a once-in-a-lifetime experience.', 'something so rare or special it is unlikely to happen again'],
  ['an unforgettable experience', 'trải nghiệm không thể quên', 'It was truly an unforgettable experience.', 'an event that is impossible to forget because of how impactful it was'],
  ['a real eye-opener', 'trải nghiệm mở mang tầm mắt', 'Travelling alone was a real eye-opener for me.', 'an experience that reveals surprising or previously unrealised information'],
  ['leave a lasting impression', 'để lại ấn tượng lâu dài', 'The experience left a lasting impression on me.', 'to make people remember something long after it happened'],
  ['be caught off guard', 'bị bất ngờ', 'I was completely caught off guard.', 'to be surprised by something unexpected, without being prepared for it'],
  ['it dawned on me that…', 'tôi chợt nhận ra rằng', 'It suddenly dawned on me that I had made a mistake.', 'used to say that someone suddenly realised or understood something'],
  ['come to realise', 'dần nhận ra', 'I came to realise how important family is.', 'to gradually become aware of or understand something over time'],
  ['plucked up the courage', 'lấy hết can đảm', 'I finally plucked up the courage to speak in public.', 'to force oneself to be brave enough to do something difficult'],
  ['step out of my comfort zone', 'bước ra khỏi vùng an toàn', 'It encouraged me to step out of my comfort zone.', 'to do something unfamiliar or challenging instead of staying with what feels safe'],
  ['overcome a challenge', 'vượt qua thử thách', 'I managed to overcome a difficult challenge.', 'to successfully deal with or defeat a difficult problem'],
  ["things didn't go according to plan", 'mọi chuyện không diễn ra theo kế hoạch', "Unfortunately, things didn't go according to plan.", 'used to say that events did not happen the way that was intended'],
  ['everything worked out in the end', 'cuối cùng mọi chuyện ổn thỏa', 'Luckily, everything worked out in the end.', 'used to say that a situation was eventually resolved successfully'],
  ['be over the moon', 'cực kỳ vui', 'I was absolutely over the moon.', 'to be extremely happy and pleased about something'],
  ['be on cloud nine', 'cực kỳ hạnh phúc', 'I was on cloud nine when I heard the news.', 'to feel extremely happy, as if floating'],
  ['be a nervous wreck', 'cực kỳ lo lắng', 'Before my speech, I was a nervous wreck.', 'to be extremely anxious or stressed'],
  ['have mixed feelings', 'có cảm xúc trái chiều', 'Looking back, I have mixed feelings about it.', 'to feel both positive and negative emotions about something at the same time'],
  ['bittersweet', 'vừa vui vừa buồn', 'Graduation was a bittersweet experience.', 'causing feelings of both happiness and sadness at the same time'],
  ['worth every minute', 'hoàn toàn xứng đáng', 'All the hard work was worth every minute.', 'used to say that the time or effort spent on something was completely justified'],
  ['an unexpected turn of events', 'diễn biến bất ngờ', 'The day took an unexpected turn of events.', 'a sudden and surprising change in a situation'],
  ['things took an unexpected turn', 'mọi chuyện chuyển biến bất ngờ', 'Things took an unexpected turn after lunch.', 'used to say a situation changed suddenly and unpredictably'],
  ['a memorable occasion', 'dịp đáng nhớ', 'It was a truly memorable occasion.', 'a special event that is easy to remember'],
  ['a meaningful experience', 'trải nghiệm ý nghĩa', 'It was a very meaningful experience for me.', 'an event that has real personal significance or value'],
  ['a challenging experience', 'trải nghiệm đầy thử thách', 'It was a challenging experience, but I learned a lot.', "an event that tests someone's ability or determination"],
  ['an emotional roller coaster', 'cảm xúc lên xuống thất thường', 'The whole experience was an emotional roller coaster.', 'a situation involving a series of rapidly changing intense emotions'],
  ['feel a sense of accomplishment', 'cảm thấy đạt được thành tựu', 'I felt a real sense of accomplishment afterwards.', 'to feel proud and satisfied after achieving something'],
  ['face an unexpected problem', 'đối mặt với vấn đề bất ngờ', 'We suddenly had to face an unexpected problem.', 'to encounter a difficulty that was not anticipated'],
  ['deal with a difficult situation', 'xử lý tình huống khó khăn', 'I had to deal with a difficult situation on my own.', 'to handle or manage a challenging circumstance'],
  ['keep my cool', 'giữ bình tĩnh', 'I tried to keep my cool and think clearly.', 'to remain calm, especially under pressure'],
  ['lose my temper', 'mất bình tĩnh', 'I almost lost my temper, but eventually calmed down.', "to suddenly become angry and unable to control one's reaction"],
  ['learn from my mistakes', 'học từ sai lầm', 'The experience taught me to learn from my mistakes.', 'to use past errors as a way to improve future behaviour'],
  ['teach me a valuable lesson', 'dạy tôi bài học quý giá', 'It taught me a valuable lesson about responsibility.', 'used to say that an experience provided useful knowledge or wisdom'],
  ['change my perspective', 'thay đổi góc nhìn', 'The experience completely changed my perspective.', 'to alter the way someone views or thinks about something'],
  ['make the most of', 'tận dụng tối đa', 'I decided to make the most of the opportunity.', 'to use an opportunity or situation as fully and effectively as possible'],
];

// ── Objects / Things ────────────────────────────────────────────────────
const objects = [
  ['family heirloom', 'đồ gia truyền', "It's a family heirloom passed down from my grandmother.", 'a valuable object that has been passed down through generations of a family'],
  ['sentimental value', 'giá trị tinh thần', 'It has enormous sentimental value to me.', 'worth based on personal or emotional attachment rather than money'],
  ['a keepsake', 'vật lưu niệm', 'I kept the ticket as a keepsake.', 'a small item kept to remember a person, place, or event'],
  ['a treasured possession', 'món đồ rất quý', "It's one of my most treasured possessions.", 'an item someone values highly and takes great care of'],
  ['worn with age', 'cũ theo thời gian', 'The bag is worn with age but still looks beautiful.', 'showing signs of wear because it is old'],
  ['well-preserved', 'được bảo quản tốt', "It's surprisingly well-preserved for its age.", 'kept in very good condition despite age'],
  ['irreplaceable', 'không thể thay thế', "Although it's not expensive, it's completely irreplaceable to me.", 'impossible to replace with something of equal value'],
  ['have sentimental value', 'có giá trị kỷ niệm', 'The necklace has a lot of sentimental value.', 'to be valued mainly for the personal memories or emotions attached to it'],
  ['pass down', 'truyền lại', 'It was passed down from generation to generation.', 'to give something to a younger generation within a family'],
  ['hand down', 'truyền lại', 'My grandmother handed it down to my mother.', 'to give an item, tradition, or skill to someone younger, especially in a family'],
  ['serve as a reminder of', 'đóng vai trò như lời nhắc về', 'It serves as a reminder of my childhood.', 'to help someone remember something, often by its presence'],
  ['bring back memories', 'gợi lại ký ức', 'Looking at it always brings back memories.', 'to cause someone to remember past experiences'],
  ['become obsolete', 'trở nên lỗi thời', 'Many electronic devices become obsolete very quickly.', 'to become outdated and no longer useful because of newer alternatives'],
  ['state-of-the-art', 'hiện đại nhất', 'It was a state-of-the-art device at the time.', 'using the most modern and advanced technology or methods'],
  ['compact yet powerful', 'nhỏ gọn nhưng mạnh', "It's compact yet surprisingly powerful.", 'small in size but still highly effective or strong'],
  ['built to last', 'được làm để dùng lâu', "It's a simple product but it's built to last.", 'made with durable materials so it will function for a long time'],
  ['a practical item', 'món đồ thiết thực', "It's a very practical item for everyday use.", 'an object that is useful and functional in everyday life'],
  ['an everyday essential', 'vật dụng thiết yếu hằng ngày', 'My phone has become an everyday essential.', 'something considered necessary for daily life'],
  ['a useful gadget', 'thiết bị hữu ích', "It's one of the most useful gadgets I own.", 'a small device that performs a helpful function'],
  ['a personal possession', 'vật sở hữu cá nhân', "It's one of my most valuable personal possessions.", 'an item that belongs to an individual'],
  ['a valuable item', 'món đồ có giá trị', "It isn't necessarily an expensive item, but it's valuable to me.", "an object that is important or worth a lot, whether financially or personally"],
  ['a meaningful gift', 'món quà ý nghĩa', "It was one of the most meaningful gifts I've ever received.", 'a present that carries emotional or personal significance'],
  ['a thoughtful gift', 'món quà thể hiện sự chu đáo', 'It was such a thoughtful gift from my friend.', "a present chosen with care to suit the receiver's tastes or needs"],
  ['hold onto something', 'giữ lại thứ gì', "I've held onto it for many years.", 'to keep an item instead of giving it away or discarding it'],
  ['cherish something', 'trân trọng', 'I really cherish this old photograph.', 'to care for and value something deeply'],
  ['have fond memories of', 'có ký ức đẹp về', 'I have many fond memories of this toy.', 'to remember something with warmth and affection'],
  ['be attached to something', 'gắn bó với thứ gì', "I'm quite emotionally attached to it.", 'to feel an emotional connection to an object'],
  ['be in good condition', 'còn trong tình trạng tốt', "Surprisingly, it's still in good condition.", 'to be undamaged and still functioning or looking well'],
  ['stand the test of time', 'tồn tại tốt qua thời gian', 'This old watch has really stood the test of time.', 'to remain useful, valuable, or respected over a long period'],
  ['a piece of my childhood', 'một phần tuổi thơ', "To me, it's a piece of my childhood.", 'an object that represents or reminds someone of their early years'],
  ['more than just an object', 'hơn cả một món đồ', "It's more than just an object; it represents my family history.", 'used to say something has significance beyond its physical or practical use'],
];

// ── Activities / Skills ─────────────────────────────────────────────────
const activities = [
  ['natural flair for', 'năng khiếu tự nhiên về', 'She has a natural flair for languages.', 'an inborn talent or aptitude for something'],
  ['pick up a skill', 'học được kỹ năng', 'I picked up this skill from my brother.', 'to learn a skill, often informally or through practice'],
  ['develop a talent', 'phát triển tài năng', "I'd like to develop my talent further.", 'to improve and grow a natural ability over time'],
  ["hone one's skills", 'mài giũa kỹ năng', 'I practise regularly to hone my skills.', 'to improve a skill through practice until it is very good'],
  ['master a skill', 'thành thạo kỹ năng', 'It took me years to master the skill.', 'to become highly proficient at doing something'],
  ['build discipline', 'xây dựng tính kỷ luật', 'Exercise has helped me build discipline.', "to gradually develop the ability to control one's behaviour and stick to a routine"],
  ['build confidence', 'xây dựng sự tự tin', 'Public speaking helped me build confidence.', "to gradually develop belief in one's own abilities"],
  ['step out of my comfort zone', 'bước khỏi vùng an toàn', 'It pushed me to step out of my comfort zone.', 'to do something unfamiliar or challenging instead of staying with what feels safe'],
  ['push myself to the limit', 'thúc đẩy bản thân tới giới hạn', 'Running pushes me to the limit.', 'to make oneself work as hard as physically or mentally possible'],
  ['make steady progress', 'tiến bộ đều đặn', "I'm making steady progress.", 'to improve gradually and consistently over time'],
  ['go from strength to strength', 'ngày càng tiến bộ', "I've gone from strength to strength since then.", 'to become increasingly successful'],
  ['stress-relieving', 'giúp giảm stress', "It's a very stress-relieving activity.", 'helping to reduce feelings of tension or worry'],
  ['clear my head', 'làm đầu óc thư giãn', 'Going for a run helps me clear my head.', 'to help oneself think more calmly by relaxing or taking a break'],
  ['blow off steam', 'xả stress', 'I play football to blow off steam.', 'to release built-up stress or anger through activity'],
  ['get the hang of something', 'bắt đầu hiểu/có kỹ năng làm gì', 'It took me a while to get the hang of it.', 'to begin to understand or become skilled at doing something'],
  ['give it a shot', 'thử làm', "I've never tried surfing, but I'd love to give it a shot.", 'to attempt something, especially for the first time'],
  ['take up a hobby', 'bắt đầu một sở thích', 'I took up photography during university.', 'to start doing an activity regularly for enjoyment'],
  ['keep at it', 'kiên trì', 'It was difficult at first, but I kept at it.', 'to continue trying despite difficulty'],
  ['have a knack for', 'có năng khiếu về', "I've always had a knack for drawing.", 'to have a natural ability to do something well'],
  ['be good at something', 'giỏi việc gì', "I've always been quite good at cooking.", 'to perform a particular activity skilfully'],
  ['improve gradually', 'cải thiện dần dần', 'My skills have improved gradually over time.', 'to get better slowly and steadily over time'],
  ['put in the effort', 'bỏ công sức', "If you put in the effort, you'll eventually improve.", 'to work hard at something in order to achieve a result'],
  ['put something into practice', 'áp dụng vào thực tế', 'I try to put what I learn into practice.', 'to actually use knowledge or a plan in a real situation'],
  ['learn by trial and error', 'học qua thử và sai', 'I learned how to cook mainly through trial and error.', 'to learn by trying different approaches and correcting mistakes'],
  ['get better at something', 'trở nên giỏi hơn', "I'm slowly getting better at it.", "to improve one's ability in a particular activity"],
  ['struggle with something', 'gặp khó khăn với', 'I used to struggle with public speaking.', 'to find something difficult to do or cope with'],
  ['overcome a weakness', 'khắc phục điểm yếu', 'Practising regularly helped me overcome my weakness.', 'to successfully deal with or improve a personal shortcoming'],
  ['stay motivated', 'duy trì động lực', "It's important to stay motivated when learning a skill.", "to keep one's enthusiasm and determination going over time"],
  ['stay consistent', 'duy trì đều đặn', 'The key is to stay consistent.', 'to keep doing something regularly in the same way'],
  ['make time for something', 'dành thời gian cho', 'I try to make time for exercise every day.', 'to arrange schedule so there is time available for an activity'],
  ["fit something into my routine", 'sắp xếp vào thói quen/lịch trình', 'I try to fit reading into my daily routine.', 'to arrange for an activity to become a regular part of daily life'],
  ['reap the benefits', 'hưởng lợi ích', 'Regular exercise helps me reap both physical and mental benefits.', 'to receive the positive results of an action or effort'],
  ['become second nature', 'trở thành thói quen tự nhiên', 'After months of practice, it became second nature to me.', 'to become so familiar that it is done automatically, without conscious thought'],
];

// ── Nature / Animals / Science ──────────────────────────────────────────
const nature = [
  ['biodiversity', 'đa dạng sinh học', 'The area is known for its rich biodiversity.', 'the variety of plant and animal life in a particular habitat'],
  ['natural habitat', 'môi trường sống tự nhiên', 'Many animals have lost their natural habitat.', 'the natural environment in which an animal or plant normally lives'],
  ['habitat loss', 'mất môi trường sống', 'Habitat loss is a serious threat to wildlife.', 'the destruction or disappearance of the natural environment where a species lives'],
  ['endangered species', 'loài có nguy cơ tuyệt chủng', 'Tigers are an endangered species.', 'a type of animal or plant that is at risk of dying out completely'],
  ['on the verge of extinction', 'bên bờ tuyệt chủng', 'Some species are on the verge of extinction.', 'very close to disappearing completely as a species'],
  ['apex predator', 'động vật săn mồi đầu bảng', 'The tiger is an apex predator.', 'an animal at the top of the food chain with no natural predators of its own'],
  ['elusive creature', 'sinh vật khó bắt gặp', "It's an extremely elusive creature.", 'an animal that is difficult to find, see, or catch'],
  ['conservation efforts', 'nỗ lực bảo tồn', 'Conservation efforts have helped protect the species.', 'actions taken to protect and preserve the natural environment or species'],
  ['raise environmental awareness', 'nâng cao nhận thức môi trường', 'Campaigns can raise environmental awareness.', 'to help more people understand and pay attention to environmental issues'],
  ['reduce our carbon footprint', 'giảm dấu chân carbon', 'We need to reduce our carbon footprint.', "to lower the amount of greenhouse gases produced by one's activities"],
  ['renewable energy', 'năng lượng tái tạo', 'Renewable energy could reduce pollution.', 'energy from sources that are naturally replenished, such as sunlight or wind'],
  ['cutting-edge research', 'nghiên cứu tiên tiến', 'The university conducts cutting-edge research.', 'scientific study using the most advanced and modern methods'],
  ['scientific breakthrough', 'đột phá khoa học', 'It could lead to a major scientific breakthrough.', 'an important and sudden advance in scientific knowledge or understanding'],
  ['be fascinated by', 'bị cuốn hút bởi', "I've always been fascinated by space.", 'to find something extremely interesting or captivating'],
  ['be curious about', 'tò mò về', "I've always been curious about the human brain.", 'to have a strong desire to learn or know more about something'],
  ['awe-inspiring', 'gây choáng ngợp', 'The landscape was absolutely awe-inspiring.', 'causing feelings of wonder or amazement'],
  ['at one with nature', 'hòa mình với thiên nhiên', 'Camping makes me feel at one with nature.', 'feeling deeply connected and at peace with the natural world'],
  ['rich biodiversity', 'đa dạng sinh học phong phú', 'The region is known for its rich biodiversity.', 'a great variety of different plant and animal species in an area'],
  ['natural surroundings', 'môi trường thiên nhiên xung quanh', 'I love being surrounded by natural surroundings.', 'the natural environment and scenery around a place'],
  ['stunning landscape', 'cảnh quan tuyệt đẹp', 'The area has a stunning landscape.', 'an extremely beautiful view of natural scenery'],
  ['breathtaking natural beauty', 'vẻ đẹp thiên nhiên ngoạn mục', 'The region is famous for its breathtaking natural beauty.', 'natural scenery so beautiful it amazes the viewer'],
  ['wildlife conservation', 'bảo tồn động vật hoang dã', 'Wildlife conservation should be taken more seriously.', 'the protection and management of wild animals and their habitats'],
  ['protect endangered species', 'bảo vệ các loài có nguy cơ tuyệt chủng', 'We need to do more to protect endangered species.', 'to take action to prevent species at risk of extinction from dying out'],
  ['preserve natural habitats', 'bảo tồn môi trường sống tự nhiên', 'Governments should work harder to preserve natural habitats.', 'to keep natural environments safe from damage or destruction'],
  ['threaten wildlife', 'đe dọa động vật hoang dã', 'Human activity continues to threaten wildlife.', 'to put wild animals at risk of harm or extinction'],
  ['human impact on nature', 'tác động của con người lên thiên nhiên', "I'm concerned about the human impact on nature.", 'the effect that human activity has on the natural environment'],
  ['environmentally friendly', 'thân thiện với môi trường', 'We should adopt more environmentally friendly habits.', 'not harmful to the environment'],
  ['sustainable development', 'phát triển bền vững', 'Sustainable development is becoming increasingly important.', "growth that meets present needs without harming future generations' ability to meet theirs"],
  ['natural resources', 'tài nguyên thiên nhiên', 'We need to use natural resources responsibly.', 'materials or substances that occur in nature and are used by humans, such as water, minerals, or forests'],
  ['raise public awareness', 'nâng cao nhận thức cộng đồng', 'Campaigns can raise public awareness about environmental issues.', 'to help more people become informed about an issue'],
  ['be in harmony with nature', 'sống hài hòa với thiên nhiên', 'Traditional communities often live in harmony with nature.', 'to live in a balanced, peaceful relationship with the natural world'],
  ['a rare sight', 'cảnh tượng hiếm gặp', 'Seeing this animal in the wild was a rare sight.', 'something that is seen or observed very infrequently'],
];

// ── Culture / Media / Stories ────────────────────────────────────────────
const culture = [
  ['thought-provoking', 'gợi nhiều suy nghĩ', 'It was a thought-provoking film.', 'causing careful thought or serious consideration'],
  ['deeply moving', 'rất cảm động', 'I found the ending deeply moving.', 'causing strong emotional feelings, especially sadness or sympathy'],
  ['emotionally engaging', 'giàu tính cảm xúc', 'The story was emotionally engaging.', "able to draw the audience in and connect with their feelings"],
  ['cultural significance', 'ý nghĩa văn hóa', 'The festival has great cultural significance.', 'importance in relation to the beliefs, customs, or history of a group of people'],
  ['cultural heritage', 'di sản văn hóa', "It's an important part of our cultural heritage.", 'the traditions, monuments, and values inherited from previous generations'],
  ['passed down through generations', 'truyền qua nhiều thế hệ', 'The story has been passed down through generations.', 'handed on from parents or grandparents to children over a long period of time'],
  ['oral tradition', 'truyền thống truyền miệng', 'It comes from a long oral tradition.', 'stories, knowledge, or customs passed on by speech rather than in writing'],
  ['resonate with someone', 'tạo sự đồng cảm', 'The message really resonated with me.', 'to have special meaning or emotional significance for someone'],
  ['strike a chord with someone', 'chạm đến cảm xúc', 'The film struck a chord with young people.', 'to produce a strong feeling of sympathy, understanding, or recognition'],
  ['go viral', 'lan truyền mạnh', 'The video went viral overnight.', 'to be shared rapidly and widely on the internet'],
  ['raise awareness', 'nâng cao nhận thức', 'The documentary raised awareness of the issue.', 'to help more people know about or understand an issue'],
  ['spark a conversation', 'khơi mào cuộc trò chuyện', 'The post sparked a conversation among my friends.', 'to cause people to start discussing a topic'],
  ["capture people's attention", 'thu hút sự chú ý', "The video quickly captured people's attention.", 'to make people notice and become interested in something'],
  ['reflect society', 'phản ánh xã hội', 'Good films often reflect society.', 'to show or represent the values, issues, and characteristics of a society'],
  ['a powerful message', 'thông điệp mạnh mẽ', 'The film carries a powerful message.', 'an idea or theme that has a strong impact on the audience'],
  ['a gripping storyline', 'cốt truyện hấp dẫn', 'It has a really gripping storyline.', "a plot that holds the audience's attention closely"],
  ['a memorable performance', 'màn trình diễn đáng nhớ', 'She gave a memorable performance.', 'an acting performance that is impressive and easy to remember'],
  ['stop me in my tracks', 'khiến tôi phải dừng lại/suy ngẫm', 'One scene really stopped me in my tracks.', 'to make someone suddenly pause, often because of a strong reaction'],
  ['captivating', 'cuốn hút', 'It was a truly captivating story.', "able to attract and hold someone's interest and attention"],
  ['compelling', 'hấp dẫn, thuyết phục', 'The documentary presented a compelling story.', 'so interesting or convincing that it demands attention'],
  ['entertaining', 'thú vị, giải trí', 'It was both educational and entertaining.', 'providing enjoyment or amusement'],
  ['informative', 'giàu thông tin', 'I found the video extremely informative.', 'providing useful or interesting information'],
  ['inspiring', 'truyền cảm hứng', 'It was a genuinely inspiring story.', 'giving someone the encouragement or motivation to do something'],
  ['relatable', 'dễ đồng cảm', 'The characters were very relatable.', 'easy to understand and identify with, from personal experience'],
  ['visually appealing', 'bắt mắt', 'The video was visually appealing.', 'attractive and pleasing to look at'],
  ['a powerful storyline', 'cốt truyện mạnh mẽ', 'The film has a powerful storyline.', 'a plot with a strong emotional or dramatic impact'],
  ['a memorable character', 'nhân vật đáng nhớ', 'The main character was particularly memorable.', "a fictional character that stays in the audience's memory"],
  ['a meaningful message', 'thông điệp ý nghĩa', 'The film conveys a meaningful message.', 'an idea within a story that has real significance or value'],
  ['convey a message', 'truyền tải thông điệp', 'The story conveys an important message about family.', 'to communicate an idea or feeling to an audience'],
  ['tell a compelling story', 'kể một câu chuyện hấp dẫn', 'The documentary tells a compelling story.', "to narrate an account that strongly holds the listener's or viewer's interest"],
  ["capture the audience's attention", 'thu hút sự chú ý của khán giả', "The opening scene immediately captured the audience's attention.", 'to make the people watching or listening focus their interest'],
  ['keep me engaged', 'khiến tôi tiếp tục chú ý', 'The storyline kept me engaged from beginning to end.', "to hold someone's interest and attention throughout"],
  ['broaden my horizons', 'mở rộng hiểu biết/tầm nhìn', 'Watching documentaries helps broaden my horizons.', "to expand one's knowledge, experience, or understanding of the world"],
];

function toWordDoc([word, meaning, example, definition]) {
  return { word, meaning, example, definition, ipa: '', partOfSpeech: '', collocations: [], distractors: [] };
}

// A few phrases (e.g. "step out of my comfort zone", "well-preserved") are
// deliberately reused verbatim across two of the source lists above — drop
// later repeats so a single lesson never quizzes the same word twice.
function dedupeWords(entries) {
  const seen = new Set();
  return entries.filter(([word]) => {
    const key = word.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// order 58+ — a fresh, unused range clear of the IELTS Speaking topic
// lessons (19-35) and both Mindset course lesson ranges (10-19, 40-57).
const lessons = [
  { title: 'IELTS Speaking – Describing People', description: 'Từ vựng & collocation miêu tả tính cách, con người — dùng cho nhiều cue card Part 2/3 khác nhau.', difficulty: 'B2', order: 58, words: dedupeWords(people) },
  { title: 'IELTS Speaking – Describing Places', description: 'Từ vựng & collocation miêu tả địa điểm, phong cảnh — dùng cho nhiều cue card Part 2/3 khác nhau.', difficulty: 'B2', order: 59, words: dedupeWords(places) },
  { title: 'IELTS Speaking – Describing Events & Experiences', description: 'Từ vựng & collocation kể lại sự kiện, trải nghiệm — nhóm quan trọng nhất, tái sử dụng được cho rất nhiều cue card.', difficulty: 'B2', order: 60, words: dedupeWords(events) },
  { title: 'IELTS Speaking – Describing Objects', description: 'Từ vựng & collocation miêu tả đồ vật, món quà, kỷ vật — dùng cho các cue card về đồ vật.', difficulty: 'B2', order: 61, words: dedupeWords(objects) },
  { title: 'IELTS Speaking – Activities & Skills', description: 'Từ vựng & collocation nói về hoạt động, sở thích, kỹ năng và quá trình phát triển bản thân.', difficulty: 'B2', order: 62, words: dedupeWords(activities) },
  { title: 'IELTS Speaking – Nature, Animals & Science', description: 'Từ vựng & collocation về thiên nhiên, động vật, môi trường và khoa học.', difficulty: 'B2', order: 63, words: dedupeWords(nature) },
  { title: 'IELTS Speaking – Culture, Media & Stories', description: 'Từ vựng & collocation nói về phim ảnh, sách, câu chuyện và văn hóa.', difficulty: 'B2', order: 64, words: dedupeWords(culture) },
];

async function runSeed() {
  const VocabularyLesson = require('../models/VocabularyLesson');
  const User = require('../models/User');

  const admin = await User.findOne({ email: ADMIN_EMAIL }).select('_id').lean();
  if (!admin) throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);

  for (const lesson of lessons) {
    const existing = await VocabularyLesson.findOne({ title: lesson.title }).lean();
    if (existing) {
      console.log(`[SeedVocabCueCardTopics] "${lesson.title}" already exists (_id=${existing._id}) – skip`);
      continue;
    }
    const doc = await VocabularyLesson.create({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      order: lesson.order,
      targetClass: '',
      published: true,
      createdBy: admin._id,
      words: lesson.words.map(toWordDoc),
    });
    console.log(`[SeedVocabCueCardTopics] Inserted "${doc.title}" (_id=${doc._id}, ${doc.words.length} words)`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedVocabCueCardTopics] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, lessons };
