// Mindset for IELTS Level 1 — Unit 7: Fame and the media (Reading pp. 126–131 · Listening pp. 137–141)
const { mcq, gap, match, cat, order, passage, card, qMatch, qYNNG, qNote, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');

const SLOT = 4; // sách của lớp: Unit 7–8 → Sổ 4

const RICH = `## Become rich and famous through the internet

In the past, to become famous you needed a talent: singing, playing an instrument, dancing or writing books. Nowadays, it is much easier to become famous. This is because of the internet. All you need is a camera or webcam, computer, internet connection and a bit of creativity.

First of all, you need to decide what you are going to write or speak about: hair and makeup, comedy, sport, news and current affairs, raising money for a charity or something specialist like keeping tropical fish. Then choose a site to post on. Some sites are international and some may be particular to one country, such as Weibo in China. YouTube is a good site to choose if you make your own videos. It is easy to upload your short films, and many people use it.

If you want to become famous on YouTube, you should make lots of videos and release one every day. YouTubers who become popular are often those who present tips, advice, 'how to' guides and opinions on entertainment or stories in the news. If you allow advertisements in your videos, you will make money when people view the adverts. Facebook is a good platform for those who want to make money, but not for those who want to be famous. To earn money through Facebook, you need a very original and/or funny page, with interesting photos which can get you a few hundred thousand 'likes'. If you achieve fame on Facebook, it probably won't last.

Twitter is a social media site where people can communicate through short messages. It works well for those who want to be well-known but are not so interested in making money. If you want to become known on Twitter, you will need to post lots of entertaining content. Instagram is a site where people mainly put up photos and videos. It is a site which can make you well-known, particularly if you want to become a famous photographer.

Creating your own blog is possibly the best way to become internet famous and make money, through advertising, especially once you have become known on one of the sites above. You need to be aware of the topics and issues that are 'trending' (that are popular right now) and post about those ideas. Learn to create 'vines' (a series of short extracts from videos put together in a creative way) and become an expert on photo editing. With these few easily learnt skills and some imagination, you can achieve the fame you've always dreamed of – online at least.`;

const ANIMALS = `## Famous animals

**A** Like people, animals each have their own personality and talents. And like some people, some animals achieve fame. Some of them become famous through films, TV or advertisements, and others through their work, for example rescuing people or playing a role in a war. Still others have done something special or been the first to do something.

**B** There have been many famous dogs in history. One of them is Hachiko, a dog remembered for his loyalty to his owner. Hachiko was born in Japan in 1923 and was owned by Hidesaburo Ueno, a professor at Tokyo University. Every day, Hachiko waited for Ueno at Shibuya station and the pair walked home together. One day in May 1925, Ueno died suddenly while he was at work. For the next nine years, nine months and 15 days, his faithful dog continued to meet the train his owner used to take every day. At first the station staff did not welcome him, but gradually people understood his loyalty and began giving him food and treats. Hachiko did not stop waiting for Ueno until his own death in 1935. There have been films and books about Hachiko, and every year there is a ceremony to commemorate him at the railway station in Tokyo, where he waited so faithfully.

**C** One animal that achieved fame in the twenty-first century is Knut the polar bear. Knut was born in Berlin Zoo in December 2006. Sadly, Knut was rejected by his mother, Tosca, and was raised by zookeepers. Knut was extremely popular with the public, not only in Germany, but across the world. Knut's story increased attendance at the zoo by about 30% and increased the zoo's revenue by five million euros. The zoo made substantial amounts of money by selling Knut toys, candy and other products. There were even songs written about him. By the time he was a year old, Knut weighed almost 100 kg and it was too dangerous for him to be handled by humans. Poor Knut missed his favourite keeper. Knut suffered in his short life without his mother, and later without human contact. He died of a virus at the age of four.

**D** Even some wild animals have become famous. One of them is Elsa the lioness, born in 1956. Elsa's mother was killed by a game warden, a person whose job it was to protect wild animals. The warden, George Adamson, had killed the lioness to defend himself, but he felt guilty about the orphaned cubs. He and his wife, Joy, took them home and brought them up. They trained Elsa, one of the cubs, to live in the wild. During her adult life in the wild, she had three cubs and took them to visit her human foster parents. Joy Adamson told Elsa's story in a book called Born Free. Born Free was made into a film, which was popular with both adults and children. In 1984, the actors who had starred in the film started the Born Free Foundation, an organisation that protects wildlife in many ways. The Foundation's important work includes improving conditions in zoos and circuses, stopping hunting for 'sport' and working against the killing of elephants for ivory.

**E** Many of us enjoy learning about famous animals. They can inspire us with their characters and stories, just as human celebrities can. Some of them are remembered for years through books, films, toys and other items created in their memory. But in the end, it is humans and not the animals themselves who benefit from that fame.`;

const FAMOUS_SHORT = `Being famous is not as much fun as it sounds. I am only a little bit famous. About two or three times a day people stop me to ask me to sign a piece of paper or to have their photo taken with me. For me, it is not at all enjoyable, as it often makes me late. However, I feel I should be polite to the person and have a chat with them. Sometimes I wonder how it would feel to be very famous. You wouldn't be able to get a quick coffee with a friend or go to a movie. I don't think life would be very easy.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T59 = `Justin Bieber's rise to fame is an interesting story. He was interested in music from a very early age and he taught himself how to play a whole selection of musical instruments, which I think is rare in youngsters these days. Like a lot of teenagers who want to be pop stars, he learnt the guitar. But, whereas very few of those teenagers put in the effort needed to be successful, Bieber, on the other hand, not only learnt how to play the piano as well, but also mastered the drums and even the trumpet! One day he hopes to learn the violin.
He was clearly gifted, and his mother used to arrange for him to take part in local competitions. He came second in one, and his mother posted his performance on YouTube. She kept posting other clips of him singing, and soon these attracted a number of fans who started following him, though at this point he still hadn't found fame.
His big break came when a music executive came across these videos by accident when he was looking for a performance by a different artist. He immediately recognised Bieber's talent and gave the teenager a contract with his recording company. His first record was a worldwide hit. He shot to fame in just two years and is now a global superstar, one of the most well-known performers the world has ever seen.`;

const T60 = `A: I wouldn't like to be famous. I would hate people to recognise me all the time. You would always be followed by journalists and never able to have a private life. Being followed on a good day, when you've been to the hairdresser and are wearing your best jeans, is perhaps acceptable, but can you imagine how it would make you feel on a bad day?
B: I would love to be famous. I would adore all the attention and the special treatment. Everywhere I went, people would know my name and I wouldn't need to queue any more. The best part, though, would be meeting other famous people. I can imagine that would be so interesting. They would come to my private yacht and I would visit their mansions.`;

const T61 = `Interviewer: So, you've been a famous singer for over three decades now. What advice would you give to someone wanting to become famous?
Celebrity: Well, my first piece of advice is – don't try and become famous. Instead focus on being good at something. Choose something you enjoy and then work hard at doing well in that area.
Interviewer: What did you do to become such a successful singer?
Celebrity: Well, a good way to be the best is to learn from the experts. Find people you admire in your area of interest. Try to get as close to them as possible. Observe them carefully. If possible, talk to them. Ask lots of questions. Don't copy them, but try to learn from them. And don't be afraid to experiment, try something new.
Interviewer: Being the best is one thing, but how did you get yourself known?
Celebrity: Getting yourself known is indeed another skill you must work on. One thing is for sure, nobody is going to come to you. You have to make opportunities for yourself. You have a product to sell and the product is you. It's much easier to do that these days, especially with the internet around. Many people use social media for this.
Interviewer: Any other piece of advice?
Celebrity: Yes, the last thing I would say is, if you want to be really successful in something, you will most likely experience a certain amount of failure. People who fail at some point often say that the experience has been a great lesson and helped them on the road to success. Try to learn from these moments instead of being frightened of them. In fact, some of the most successful people have often failed countless times before reaching their end goal. What makes them successful, is that they kept on trying regardless.`;

const T62 = `If you're going to take film-making seriously, you need to learn how to get the best from your camcorder. Many people use camcorders these days, to make short videos of their friends and family, and often people just use the automatic functions. These work well enough for those types of occasion, but if you want to take a more professional approach for the production of your short film, you should have some knowledge of the camcorder's manual functions too.
In this tutorial I will start by discussing three of the most basic functions: the focus, the iris and the zoom. The focus control is usually the manual focus ring at the front of the lens, well certainly with professional cameras. It's a particularly useful function if used correctly. The ring turns anti-clockwise for a more distant focus and clockwise for a closer focus.
Next, I will talk about the iris ring. This is also located on the lens. It manages how much light appears through the lens, through the adjustable opening called the aperture. As you let more light into the shot, it naturally becomes brighter.
Finally, I will talk about the zoom function. Many people use this function and it's often over-used! Used in moderation, however, this very popular feature can be a really useful tool. It moves your perspective closer or further away from your chosen subject. I would advise, however, that whilst shooting a long zoom, you use a tripod.`;

const T63 = `So welcome to Film-makers' Club. I hope you're excited at the thought of making a film and that you're bursting with great ideas. I've put you all into groups, so here's what you're going to do. Now you might think the first thing that you need to do is to come up with an idea for a story, but even before that you need to think about what type of film you want to make.
Remember that a film is really a story in pictures. There are lots of ways of telling a story. So choose a style of film that suits the talents of the group. If you have talented artists, but no good writers, or actors, you might want to make your film in the style of a cartoon or some other kind of animation. Last year a group made an excellent film using Lego bricks.
So having decided that, you can start to think of your idea for the story. Think about the movies you like to watch. What is it that makes them interesting? Is it the characters, the plot? As regards plot, my advice is – don't be too ambitious, don't make it complicated. Keep it simple – the simplest ideas are often the ones that work the best. Initially you just need to find the basic concept. You can fill in the details later. It's a good idea to keep a notebook in your pocket and carry it everywhere. You never know when a great idea will suddenly come to you! And the more ideas, the better, in my opinion.
The next stage is to write the screenplay – for this you need to divide the story up into a series of scenes. For each scene, the screenplay should begin with a short description of where it takes place and the time of day, that is day or night. Then the rest consists of the script – the lines the actors will speak, and it should also describe the camera movements, and give directions to the actors about how they should move.
Before you can start filming, you need to prepare a storyboard of your film to help everyone involved to imagine the scenes clearly and to understand what you are trying to achieve. This is similar to a comic-book version of your film, but without speech balloons.
And at this point you need to appoint a director. This is a major role and it's vital that he or she is a good communicator, as they are the key link between the actors and the rest of the team. This person will have responsibility for the creative side of the project. He or she will have the final say in the choice of the main actors and in directing the action of the film.
That brings me to the next stage – casting your film – finding the actors. Don't just rely on your friends. Be creative! Perhaps you could advertise on social media. Or if your film needs a doctor, perhaps you could ask one from the local hospital if they could spare a couple of hours for you?
And then before filming finally starts, you will need to assign other jobs, such as director of photography – in your case this will be the person who operates the camera; someone in charge of sound and music, and someone in charge of costumes and props (including furniture and any other objects needed) and also someone to look after hair and make-up. But we'll look at these roles in more detail in our next session.`;

const ARROW = '↓';
const flow = (steps) => steps.flatMap((s, i) => (i ? [ARROW, s] : [s]));

module.exports = {
  n: 7,
  title: 'Fame and the media',
  titleVi: 'Danh tiếng và truyền thông',
  pages: '126–131, 137–141',
  outcomes: [
    'Reading: matching features (nối câu với người/vật trong danh sách); xác định quan điểm tác giả — YES / NO / NOT GIVEN',
    'Grammar: câu điều kiện loại 1 (If + hiện tại đơn, will / should + V)',
    'Listening: flow-chart completion; đoán loại từ cần điền; flow-chart kỹ thuật',
    'Từ vựng mạng xã hội, người nổi tiếng, làm phim (Sổ 4)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: the internet and fame',
      titleEn: 'Lead-in · Skim reading (p. 126)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Từ vựng về Internet: search engine, social media, upload, trending…', 'Skim bài đọc để tìm mục đích của bài'],
      theory: [
        card('Mục đích của bài đọc', 'The purpose of a passage', {
          usage: ['Khi skim, tự hỏi: tác giả viết để **làm gì** — so sánh ưu/nhược điểm, **hướng dẫn/khuyên**, hay giải thích cho người mới?', 'Dấu hiệu bài **khuyên**: you need to…, you should…, If you want to…, choose…, learn to…'],
        }),
      ],
      vocab: vocabFile('u07-reading', [RICH, ANIMALS, FAMOUS_SHORT]),
      ex: [
        cat('The internet (Ex. 1)', 'How much do you know about the internet? Put each website into the correct group.', { s: 'Search engine', n: 'News website', m: 'Social media site', f: 'Factual information on many topics' }, [
          ['Google', 's'], ['Bing', 's'], ['BBC News', 'n'], ['The New York Times', 'n'], ['Facebook', 'm'], ['Instagram', 'm'], ['Weibo', 'm'], ['Wikipedia', 'f'], ['Britannica.com', 'f'],
        ]),
        mcq('Skim reading (Ex. 3)', 'Skim read the passage in ONE MINUTE.', [
          ['What is the purpose of the passage?', ['to give the advantages and disadvantages of the internet', 'to advise people how to become famous on the internet', 'to explain how beginners can start to use the internet'], 'B', 'Tiêu đề "Become rich and famous through the internet" + các câu khuyên: you need to decide…, you should make lots of videos…'],
        ], { stimulus: stim(RICH, 'Become rich and famous through the internet (p. 126)') }),
      ],
    },

    reading: {
      title: "Reading: matching features & the writer's views",
      titleEn: "Matching features · Identifying the writer's views · Exam skills (pp. 127–131)",
      minutes: 55,
      objectives: ['Matching features: scan tên trong danh sách, đọc hết thông tin về từng tên', 'Phân biệt sự thật (fact) và quan điểm tác giả (view)', 'YES / NO / NOT GIVEN: đọc từng chữ ở phần liên quan'],
      theory: [
        card('Matching features', 'Matching features', {
          formula: ['Danh sách người/nơi/vật + danh sách câu → nối mỗi câu với một mục. Có thể dùng **một chữ cái nhiều lần**.'],
          usage: ['Câu hỏi **không theo thứ tự** bài, nhưng các mục trong danh sách (A–E) thì **theo thứ tự** bài → phải "nhảy" quanh bài.', 'Scan gạch chân **mọi lần** tên (vd. YouTube) xuất hiện, đọc hết thông tin về nó, rồi tìm câu khớp.', 'Chỉ dùng thông tin **trong bài**, kể cả khi bạn nghĩ bài sai.'],
        }),
        card('Quan điểm của tác giả', "Identifying the writer's views", {
          usage: ['Quan điểm **không nói thẳng**: "Over 1.5 billion people **waste their time** on Facebook" → cụm "waste their time" cho thấy tác giả không thích Facebook.', 'Một từ nhỏ có thể đổi nghĩa: "**too** friendly" biến tính từ tích cực thành tiêu cực.'],
          formula: ['**YES** = khớp với ý tác giả · **NO** = trái với ý tác giả · **NOT GIVEN** = không thể biết tác giả nghĩ gì.'],
          examples: [['The writer considers herself to be very well known. → NO', '"I am only a little bit famous."'], ['She would like to drink more coffee. → NOT GIVEN', 'Bài chỉ nói không thể "get a quick coffee" nếu rất nổi tiếng.']],
        }),
      ],
      links: [
        { ref: 'reading:M1-U07-R1', title: 'Become rich and famous through the internet (Ex. 4, 7–9)', note: 'Matching features A–E + YES/NO/NOT GIVEN.' },
        { ref: 'reading:M1-U07-R2', title: 'Exam skills: Famous animals (Ex. 11)', note: '7 câu matching features + 9 câu YES/NO/NOT GIVEN.' },
      ],
      ex: [
        mcq("The writer's view (Ex. 5)", 'Look at statements A to C. All of them give information about social media. Only one of them contains the writer\'s personal view. Which one?', [
          ["Which statement contains the writer's personal view?", ["'Weibo' is the Twitter of China, but actually has twice as many users as Twitter.", 'In the United States, over 70% of the population have a social media account.', 'Over 1.5 billion people waste their time on Facebook.'], 'C', 'Ý kiến không nói thẳng, nhưng cụm "waste their time" cho thấy tác giả không thích Facebook. A và B là sự thật (số liệu).'],
        ]),
        mcq('Is it famous to be fun? (Ex. 6)', 'Read the short text. Do the following statements agree with the claims of the writer? Choose YES, NO or NOT GIVEN.', [
          ['The writer considers herself to be very well known.', ['YES', 'NO', 'NOT GIVEN'], 'B', '"I am only a little bit famous."'],
          ["It is inconvenient for her to be stopped by people she doesn't know.", ['YES', 'NO', 'NOT GIVEN'], 'A', '"it is not at all enjoyable, as it often makes me late".'],
          ['She would like to drink more coffee.', ['YES', 'NO', 'NOT GIVEN'], 'C', 'Bài chỉ nói người rất nổi tiếng không thể "get a quick coffee with a friend" — không nói cô ấy muốn uống thêm cà phê.'],
        ], { stimulus: passage(FAMOUS_SHORT, { caption: 'Ex. 6 (p. 128)' }) }),
      ],
    },

    grammar: {
      title: 'Grammar focus: the first conditional',
      titleEn: 'Grammar focus: first conditional (p. 129)',
      minutes: 30,
      objectives: ['Nhận diện mệnh đề If và mệnh đề kết quả', 'Biết dùng should thay cho will để khuyên'],
      keyLanguage: [
        'Câu điều kiện loại 1: **If + hiện tại đơn, will / won\'t + V** — If you want to become known on Twitter, you **will need** to post lots of entertaining content.',
        'Mệnh đề kết quả có thể dùng **should** (lời khuyên) thay cho will: If you want to become famous on YouTube, you **should make** lots of videos.',
        'Hai mệnh đề đổi chỗ được; nếu mệnh đề If đứng đầu thì có **dấu phẩy**.',
      ],
      theory: [
        card('Câu điều kiện loại 1', 'The first conditional', {
          formula: ['If + S + V (hiện tại đơn), S + will / won\'t + V', 'If + S + V (hiện tại đơn), S + should + V (lời khuyên)'],
          examples: [['If you allow advertisements in your videos, you will make money.', 'Nếu bạn cho phép quảng cáo, bạn sẽ kiếm được tiền.'], ["If you achieve fame on Facebook, it probably won't last.", 'Nếu nổi tiếng trên Facebook, có lẽ sẽ không lâu.']],
        }),
      ],
      links: [{ grammar: 'first-conditional', title: 'First Conditional', note: 'If + hiện tại đơn, will + V' }],
      ex: [
        match('If clauses and result clauses (Ex. 10)', 'Find three more sentences from the passage which begin with "If". Match each If clause with its result clause.', [
          ['If you want to become famous on YouTube,', 'you should make lots of videos and release one every day.'],
          ['If you allow advertisements in your videos,', 'you will make money when people view the adverts.'],
          ['If you achieve fame on Facebook,', "it probably won't last."],
          ['If you want to become known on Twitter,', 'you will need to post lots of entertaining content.'],
        ]),
        mcq('Instead of will (Ex. 10)', 'Answer the question.', [
          ["What is used instead of will / won't in one of the result clauses?", ['should', 'can', 'must'], 'A', 'If you want to become famous on YouTube, you **should** make lots of videos.'],
        ]),
        gap('Make first conditional sentences (Ex. 10)', 'Complete the sentences with the correct form of the verbs in brackets (first conditional).', [
          ['If you ____ (post) a video every day, more people ____ (follow) you.', ['post', 'will follow|\'ll follow']],
          ['If she ____ (not / have) a good camera, her photos ____ (not / look) professional.', ["doesn't have|does not have", "won't look|will not look"]],
          ['If you ____ (want) to become a famous photographer, you should use Instagram.', 'want'],
          ['People ____ (not / watch) your films if they ____ (be) boring.', ["won't watch|will not watch", 'are']],
          ['If he ____ (create) his own blog, he ____ (make) money through advertising.', ['creates', "will make|'ll make"]],
        ]),
      ],
    },

    listening: {
      title: 'Listening: flow-chart completion',
      titleEn: 'Lead-in · Flow-chart completion · Predicting the answer · Technical / scientific flow-charts · Exam skills (pp. 137–141)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Hoàn thành flow-chart (sơ đồ các bước) theo thứ tự bài nghe', 'Đoán loại từ cần điền (danh từ, động từ, tính từ…) từ chữ trước/sau chỗ trống', 'Không hoảng với từ kỹ thuật: tập trung vào từ đã biết'],
      theory: [
        card('Flow-chart completion', 'Flow-chart completion', {
          usage: ['Giống các dạng điền từ khác: **chọn từ trong danh sách** hoặc **dùng từ trong bài nghe**; đề cho biết số từ tối đa.', 'Đáp án **theo thứ tự** bài nghe — mỗi ô là một bước.', 'Từ trong bài nghe **thường khác** từ trong sơ đồ (paraphrase), và có **thông tin thừa** dễ gây nhầm (guitar, drums, trumpet… nhưng đáp án là piano).'],
        }),
        card('Đoán đáp án', 'Predicting the answer', {
          formula: ['Gạch chân từ khoá → đọc **từ trước và sau** chỗ trống → ghi chú **loại từ** (noun / verb / adjective) → đoán vài từ có thể.'],
          usage: ['"I would hate people to ___ me" → sau "to" và trước "me" → **động từ** (recognise).', '"followed by ___" → **danh từ** chỉ người (journalists).', 'Trong phòng thi khó đoán đúng y từ, nhưng biết **loại từ** giúp bạn nghe trúng hơn.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U07-L1', title: "Justin Bieber's rise to fame (Ex. 2)", note: 'Flow-chart, NO MORE THAN TWO WORDS.' },
        { ref: 'listening:M1-U07-L2', title: 'Would you like to be famous? (Ex. 5)', note: 'Điền 8 chỗ trống đã đoán loại từ.' },
        { ref: 'listening:M1-U07-L3', title: 'How to become famous (Ex. 7)', note: 'Flow-chart 4 bước.' },
        { ref: 'listening:M1-U07-L4', title: 'Getting the best from your camcorder (Ex. 10)', note: 'Chọn 7 từ A–J cho flow-chart kỹ thuật.' },
        { ref: 'listening:M1-U07-L5', title: 'Exam skills: making a short film (Ex. 11)', note: '7 bước, NO MORE THAN TWO WORDS.' },
      ],
      vocab: vocabFile('u07-listening', [T59, T60, T61, T62, T63]),
      ex: [
        mcq('Think about the flow-chart (Ex. 3)', 'Think about how you completed the flow-chart in exercise 2 and answer the questions.', [
          ['Were the words in the recording exactly the same as the words in the flow-chart?', ['Yes', 'No'], 'B', 'vd. "talent competitions" ↔ "local competitions", "discovered by" ↔ "came across these videos".'],
          ["Was there extra information in the listening which you didn't need and which might have led you to give the wrong answer?", ['Yes', 'No'], 'A', 'guitar, drums, trumpet, violin; "came second"…'],
        ]),
        cat('Predicting the answer (Ex. 4)', 'Read the opinions on being famous. What type of word is missing from each gap?', { v: 'verb', n: 'noun', a: 'adjective' }, [
          ['I would hate people to (1) ___ me all the time.', 'v'], ['You would always be followed by (2) ___', 'n'], ['…wearing your best jeans, is perhaps (3) ___', 'a'],
          ['I would adore all the (4) ___ and the special treatment.', 'n'], ["…people would know my name and I wouldn't need to (5) ___ any more.", 'v'],
          ['I can imagine that would be so (6) ___', 'a'], ['They would come to my (7) ___ yacht', 'a'], ['…and I would (8) ___ their mansions.', 'v'],
        ]),
        cat('Predicting the answer (Ex. 6)', 'Read the flow-chart "How to become famous". Predict the grammatical form of the missing words.', { v: 'verb', n: 'noun (or noun phrase)' }, [
          ['Find something you like doing and (1) ___ at becoming the best in that particular skill.', 'v', 'and + động từ song song với "find".'],
          ['Study (2) ___ and try to learn as much as possible.', 'n', 'Sau "study" cần danh từ (hoặc trạng từ).'],
          ['Create (3) ___ and market yourself.', 'n'],
          ["Don't worry if sometimes you (4) ___. You can learn from the experience.", 'v'],
        ]),
        cat('Technical flow-chart (Ex. 8)', 'Read the flow-chart "Getting the best from your camcorder". What type of word is missing from each gap?', { a: 'adjective', n: 'noun' }, [
          ['…learn how to use the (1) ___ controls.', 'a'], ['The Focus function on the camera is very (2) ___.', 'a'], ['…whether the object you want to film is (3) ___ or further away.', 'a'],
          ['…controls the amount of (4) ___ coming through the lens.', 'n'], ['…more light comes in and the picture appears (5) ___.', 'a'], ['…the Zoom is a very (6) ___ manual function', 'a'], ['For (7) ___ zooms a tripod is recommended.', 'a'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U07-R1',
      title: 'Mindset 1 · Unit 7 — Become rich and famous through the internet',
      content: html(RICH),
      questionGroups: [
        qMatch(1, 'Choose the correct website (A–E) for each statement. You may choose any website more than once. (Ex. 4)', ['A YouTube', 'B Facebook', 'C Twitter', 'D Instagram', 'E your own blog'], [
          ['You want to be rich and become famous.', 'E', 'Đoạn cuối: blog "is possibly the best way to **become internet famous and make money**".'],
          ['You want to take photographs as a career.', 'D', 'Instagram: "particularly if you want to become a **famous photographer**".'],
          ["You want people to know you but don't care about money.", 'C', 'Twitter: "for those who want to be **well-known** but are **not so interested in making money**".'],
          ['You want to make money but not be famous.', 'B', 'Facebook: "a good platform for those who want to **make money, but not** for those who want to be famous".'],
          ['You can post a new film daily.', 'A', 'YouTube: "make lots of videos and **release one every day**".'],
          ['You want to show people how to do something.', 'A', 'YouTube: "those who present tips, advice, **\'how to\' guides**".'],
        ], { title: 'Questions 1–6', optionsTitle: 'Websites', reuse: true, type: 'matching-info' }),
        qYNNG(7, 'Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this. (Ex. 7–9)', [
          ["Before the internet, you didn't need any special skills to become famous.", 'NO', 'Đoạn 1: "In the past, to become famous you **needed a talent**" (talent = special skills).'],
          ['If you choose a specialist subject, you are more likely to get known.', 'NOT GIVEN', 'Đoạn 2 chỉ liệt kê chủ đề chuyên môn cùng với comedy, sport…; không nói chủ đề nào dễ nổi tiếng hơn.'],
          ['Having your own blog is an excellent way to find fame.', 'YES', 'Đoạn cuối: blog "is possibly **the best way** to become internet famous".'],
          ['You can get famous easily through Facebook.', 'NO', 'Facebook "not for those who want to be famous… If you achieve fame on Facebook, it probably **won\'t last**".'],
          ['It is not worth the effort needed to get famous through Twitter.', 'NOT GIVEN', 'Bài nói cần đăng nhiều nội dung giải trí, nhưng không đánh giá có đáng công hay không.'],
          ["Learning to make 'vines' could help you, if you are aiming to become famous.", 'YES', 'Đoạn cuối: "Learn to create \'vines\'… With these few easily learnt skills… you can achieve the fame".'],
        ], 'Questions 7–12'),
      ],
    },
    {
      ref: 'M1-U07-R2',
      title: 'Mindset 1 · Unit 7 — Famous animals',
      content: html(ANIMALS),
      questionGroups: [
        qMatch(1, 'Choose the correct animal (A–C) for each question. You may choose any animal more than once. Which animal…', ['A Hachiko', 'B Knut', 'C Elsa'], [
          ['never forgot their human friend?', 'A', 'B: Hachiko chờ chủ suốt "nine years, nine months and 15 days".'],
          ['lived part of their life in the wild?', 'C', 'D: "They trained Elsa… to live in the wild. During her adult life in the wild…"'],
          ['made large profits for the humans who cared for them?', 'B', 'C: "increased the zoo\'s revenue by five million euros".'],
          ['was not wanted by their parent?', 'B', 'C: "Knut was **rejected by his mother**".'],
          ['has had valuable work done in their memory?', 'C', 'D: the Born Free Foundation\'s "important work".'],
          ['is formally remembered at regular times?', 'A', 'B: "every year there is a **ceremony** to commemorate him".'],
          ['had souvenirs of them made?', 'B', 'C: "selling Knut toys, candy and other products".'],
        ], { title: 'Questions 1–7', optionsTitle: 'Animals', reuse: true, type: 'matching-info' }),
        qYNNG(8, 'Do the following statements agree with the claims of the writer in the reading passage? Write YES, NO or NOT GIVEN.', [
          ['All animals are very much the same.', 'NO', 'A: "animals **each have their own personality** and talents".'],
          ['There are many different reasons why animals might be remembered.', 'YES', 'A: films, TV, advertisements, work, rescuing people, war, being the first…'],
          ['Ueno died after a long illness.', 'NO', 'B: "Ueno **died suddenly** while he was at work".'],
          ['After some time, the people who worked at the railway station were kind to Hachiko.', 'YES', 'B: "At first the station staff did not welcome him, but **gradually**… began giving him food and treats".'],
          ['The songs written about Knut were very popular.', 'NOT GIVEN', 'C chỉ nói "There were even songs written about him".'],
          ['Knut had a happy life because of his fame.', 'NO', 'C: "Knut **suffered** in his short life".'],
          ['The Adamsons made money from Elsa.', 'NOT GIVEN', 'D: có sách và phim, nhưng không nói gia đình Adamson kiếm được tiền.'],
          ['The Born Free Foundation does useful work.', 'YES', 'D: "The Foundation\'s **important work** includes…".'],
          ['Famous animals get many advantages from their fame.', 'NO', 'E: "it is humans and **not the animals themselves** who benefit from that fame".'],
        ], 'Questions 8–16'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U07-L1', title: "Mindset 1 · Unit 7 — Justin Bieber's rise to fame",
      description: 'A journalist talks about how this artist became famous.', partNumber: 2, audioFile: 'Mindset_L1_59.mp3', transcript: T59,
      questionGroups: [qNote('Complete the flow-chart below. Write NO MORE THAN TWO WORDS for each answer. (Ex. 2)', 'How Justin Bieber became famous', flow([
        'He learnt how to play a variety of instruments: __Q1__, guitar, drums and trumpet.',
        'He entered talent __Q2__ in his home town and his mother posted some videos on YouTube.',
        'The YouTube clips brought him a lot of __Q3__.',
        'He was discovered by a __Q4__.',
        'He signed a recording __Q5__ and became a __Q6__.',
      ]), { 1: 'piano', 2: 'competitions', 3: 'fans', 4: 'music executive', 5: 'contract', 6: ['global superstar', 'superstar'] }, {
        1: lx('Anh ấy học chơi nhiều nhạc cụ: ___, guitar, trống và kèn trumpet.', 'Đầu bài.', 'not only learnt how to play the piano as well, but also mastered the drums and even the trumpet', 'BẪY: violin là nhạc cụ anh ấy MUỐN học.'),
        2: lx('Anh ấy tham gia các ___ tài năng ở quê nhà.', '', 'his mother used to arrange for him to take part in local competitions', ''),
        3: lx('Các video trên YouTube mang lại cho anh ấy nhiều ___', '', 'these attracted a number of fans who started following him', ''),
        4: lx('Anh ấy được phát hiện bởi một ___', '', 'a music executive came across these videos by accident', 'discovered ↔ came across.'),
        5: lx('Anh ấy ký một ___ thu âm', '', "gave the teenager a contract with his recording company", ''),
        6: lx('…và trở thành một ___', 'Câu cuối.', 'is now a global superstar', 'Tối đa 2 từ.'),
      }, 'Questions 1–6')],
    },
    {
      ref: 'M1-U07-L2', title: 'Mindset 1 · Unit 7 — Would you like to be famous?',
      description: 'Two opinions on being famous.', partNumber: 2, audioFile: 'Mindset_L1_60.mp3', transcript: T60,
      questionGroups: [qNote('Listen and fill the gaps. Write ONE WORD for each answer. (Ex. 5)', 'Opinions on being famous', [
        "A: I wouldn't like to be famous. I would hate people to __Q1__ me all the time. You would always be followed by __Q2__ and never able to have a private life. Being followed on a good day, when you've been to the hairdresser and are wearing your best jeans, is perhaps __Q3__, but can you imagine how it would make you feel on a bad day?",
        "B: I would love to be famous. I would adore all the __Q4__ and the special treatment. Everywhere I went, people would know my name and I wouldn't need to __Q5__ any more. The best part, though, would be meeting other famous people. I can imagine that would be so __Q6__. They would come to my __Q7__ yacht and I would __Q8__ their mansions.",
      ], { 1: 'recognise / recognize', 2: 'journalists', 3: 'acceptable', 4: 'attention', 5: 'queue', 6: 'interesting', 7: 'private', 8: 'visit' }, {
        1: lx('Tôi ghét bị người ta ___ mọi lúc.', '', 'I would hate people to recognise me all the time', 'Động từ.'),
        2: lx('bị ___ theo dõi', '', 'You would always be followed by journalists', 'Danh từ số nhiều.'),
        3: lx('có lẽ cũng ___', '', 'is perhaps acceptable', 'Tính từ.'),
        4: lx('Tôi thích mọi sự ___', '', 'I would adore all the attention', 'Danh từ.'),
        5: lx('tôi sẽ không cần ___ nữa', '', "I wouldn't need to queue any more", 'Động từ.'),
        6: lx('sẽ rất ___', '', 'that would be so interesting', 'Tính từ.'),
        7: lx('du thuyền ___ của tôi', '', 'my private yacht', 'Tính từ.'),
        8: lx('tôi sẽ ___ biệt thự của họ', '', 'I would visit their mansions', 'Động từ.'),
      }, 'Questions 1–8')],
    },
    {
      ref: 'M1-U07-L3', title: 'Mindset 1 · Unit 7 — How to become famous',
      description: 'A famous singer gives advice.', partNumber: 2, audioFile: 'Mindset_L1_61.mp3', transcript: T61,
      questionGroups: [qNote('Complete the flow-chart below. Write NO MORE THAN TWO WORDS for each answer. (Ex. 7)', 'How to become famous', flow([
        'Find something you like doing and __Q1__ at becoming the best in that particular skill.',
        'Study __Q2__ and try to learn as much as possible.',
        'Create __Q3__ and market yourself. You need to be able to sell yourself. Social media is a great way to do this these days.',
        "Don't worry if sometimes you __Q4__. You can learn from the experience.",
      ]), { 1: ['work hard', 'work'], 2: ['the experts', 'experts'], 3: 'opportunities', 4: 'fail' }, {
        1: lx('…và ___ để trở thành giỏi nhất', 'Câu trả lời đầu.', 'Choose something you enjoy and then work hard at doing well in that area', ''),
        2: lx('Học ___', '', 'a good way to be the best is to learn from the experts', 'study ↔ learn from.'),
        3: lx('Tạo ra ___', '', 'You have to make opportunities for yourself', 'create ↔ make.'),
        4: lx('Đừng lo nếu đôi khi bạn ___', 'Cuối bài.', ['you will most likely experience a certain amount of failure', 'People who fail at some point'], 'Cần động từ → fail (không phải failure).'),
      }, 'Questions 1–4')],
    },
    {
      ref: 'M1-U07-L4', title: 'Mindset 1 · Unit 7 — Getting the best from your camcorder',
      description: 'A talk on the focus, iris and zoom functions.', partNumber: 2, audioFile: 'Mindset_L1_62.mp3', transcript: T62,
      questionGroups: [qMatch(1, 'You will hear a talk on how to get the best from your camcorder. Choose SEVEN answers from the list and write the correct letter, A–J, next to questions 1–7. (Ex. 10) — 1 learn how to use the ___ controls · 2 The Focus function is very ___ · 3 the object is ___ or further away · 4 controls the amount of ___ coming through the lens · 5 the picture appears ___ · 6 the Zoom is a very ___ manual function · 7 For ___ zooms a tripod is recommended.', ['A bigger', 'B brighter', 'C closer', 'D important', 'E light', 'F long', 'G manual', 'H popular', 'I short', 'J useful'], [
        ['(1) …you must also learn how to use the ___ controls.', 'G', lx('…học cách dùng các nút điều khiển ___', 'Đầu bài.', "you should have some knowledge of the camcorder's manual functions too", 'manual ≠ automatic.')],
        ['(2) The Focus function on the camera is very ___.', 'J', lx('Chức năng lấy nét rất ___', '', "It's a particularly useful function if used correctly", 'BẪY: important không được nói.')],
        ['(3) …whether the object you want to film is ___ or further away.', 'C', lx('…vật ở ___ hay xa hơn', '', 'anti-clockwise for a more distant focus and clockwise for a closer focus', '')],
        ['(4) …controls the amount of ___ coming through the lens.', 'E', lx('…điều chỉnh lượng ___ qua ống kính', '', 'It manages how much light appears through the lens', '')],
        ['(5) …more light comes in and the picture appears ___.', 'B', lx('…hình ảnh trở nên ___', '', 'As you let more light into the shot, it naturally becomes brighter', 'BẪY: bigger.')],
        ['(6) …the Zoom is a very ___ manual function and therefore often over-used.', 'H', lx('…zoom là chức năng rất ___', '', "this very popular feature can be a really useful tool", 'BẪY: "useful" cũng xuất hiện, nhưng "very popular feature… often over-used" khớp chỗ trống 6 (useful đã dùng cho câu 2).')],
        ['(7) For ___ zooms a tripod is recommended.', 'F', lx('Với những cú zoom ___ nên dùng chân máy', 'Câu cuối.', 'whilst shooting a long zoom, you use a tripod', 'BẪY: short.')],
      ], { title: 'Questions 1–7', optionsTitle: 'Words', type: 'matching' })],
    },
    {
      ref: 'M1-U07-L5', title: 'Mindset 1 · Unit 7 — Exam skills: making a short film',
      description: "A lecture at the Film-makers' Club.", partNumber: 2, audioFile: 'Mindset_L1_63.mp3', transcript: T63,
      questionGroups: [qNote('You will hear a lecture on how to make a short film. Complete the flow-chart below. Write NO MORE THAN TWO WORDS for each answer. (Ex. 11)', 'Making a short film', flow([
        'When deciding which type of film to make, use the __Q1__ you have among you.',
        'Make the plot of your film __Q2__.',
        'Have a __Q3__ with you at all times.',
        "Write the screenplay: a description of the scene, the location, the actors' words, the __Q4__ and directions for the actors about what they should do.",
        'Prepare a storyboard. This is a bit like a __Q5__.',
        'Choose a director. He or she is in control of the __Q6__ elements of the film.',
        'Cast your film. One way to find actors might be to __Q7__.',
      ]), { 1: 'talents', 2: 'simple', 3: 'notebook', 4: 'camera movements', 5: ['comic book', 'comic-book'], 6: 'creative', 7: 'advertise' }, {
        1: lx('…tận dụng ___ mà nhóm có', 'Đoạn 2.', 'choose a style of film that suits the talents of the group', ''),
        2: lx('Làm cốt truyện ___', 'Đoạn 3.', ["don't make it complicated. Keep it simple"], 'Tính từ.'),
        3: lx('Luôn mang theo một ___', 'Đoạn 3.', "It's a good idea to keep a notebook in your pocket and carry it everywhere", 'at all times ↔ everywhere.'),
        4: lx('…lời thoại của diễn viên, ___ và hướng dẫn cho diễn viên', 'Đoạn 4.', 'it should also describe the camera movements, and give directions to the actors', ''),
        5: lx('Storyboard giống như một ___', 'Đoạn 5.', 'This is similar to a comic-book version of your film', ''),
        6: lx('Đạo diễn phụ trách các yếu tố ___', 'Đoạn 6.', 'This person will have responsibility for the creative side of the project', 'in control of ↔ have responsibility for.'),
        7: lx('Một cách tìm diễn viên là ___', 'Đoạn 7.', ["Don't just rely on your friends", 'Perhaps you could advertise on social media'], 'Cần động từ.'),
      }, 'Questions 1–7')],
    },
  ],
};
