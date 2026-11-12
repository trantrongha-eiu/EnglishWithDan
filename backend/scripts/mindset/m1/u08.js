// Mindset for IELTS Level 1 — Unit 8: Natural world (Reading pp. 149–154 · Listening pp. 156–160)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qMatch, qEndings, qNote, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');

const SLOT = 4; // sách của lớp: Unit 7–8 → Sổ 4

const FRIENDS = `## Our friends and protectors

**A** When asked their favourite animals, many people answer 'dolphins'. They are known as friendly, intelligent creatures that have a special relationship with humans. For example, dolphins can tell when a woman is pregnant. They can also tell when someone is in trouble. No one is really sure why this is the case. Experts think they may understand that humans are similar to them and try to protect them from predators and other dangers. Dolphins' protection of humans might not be just automatic or instinctive: they may actively decide to help in certain situations.

**B** There are many stories about dolphins protecting humans from sharks. Wildlife filmmaker Hardy Jones was filming a group of dolphins, when a large shark swam towards him ready to attack. Four dolphins came to his rescue and drove the shark away. Perhaps they could tell he was a person who cared very much about dolphins. In fact, Jones was a well-known campaigner against the killing of dolphins. In another incident, in 2004, in New Zealand, four people were saved from a great white shark by a pod of dolphins. The dolphins herded the swimmers into a group and formed a protective ring around them. As they had not yet seen the shark, one of them tried to swim away. He couldn't get away, because every time he tried, he was pushed back inside the ring by the dolphins.

**C** Dolphins don't only save humans from sharks, but protect them in other situations too. A scuba diver was hit by a boat near the Channel Islands (between England and France) in 2006. The man was unconscious, but survived 56 hours in the water, watched over by a pod of about 150 dolphins. In 2014, dolphins again came to the help of a human. Joey Trevino was losing hope. He had been in the sea for 24 hours after his boat sank in the Gulf of Mexico. He felt he couldn't keep going any more. A friendly dolphin approached him and gently pushed him, as if to say 'don't give up'. That moral support and encouragement may have saved Trevino's life.

**D** Dolphins have also been known to help other species. In New Zealand, two pygmy sperm whales were in difficulty next to a sand bank. People were trying their best to get them back out to sea, but the whales couldn't find their way past the sand bank. After several hours of failed attempts, they were ready to give up. Along came 'Moko', a bottlenose dolphin, who seemed to communicate with the whales and led them to a channel which took them back to the ocean.

**E** Whales have also been known to protect both humans and other mammals. In California, in 2012, a BBC Planet Earth film crew filmed a group of humpback whales who were protecting migrating grey whales from attacks by orcas (killer whales) over a period of at least seven hours. In China, Yang Yun applied for a job training whales at Polar Land in the city of Harbin. For the 'interview' she had to dive down as far as possible in the seven-metre deep pool. When she was about five metres down, Yang Yun found she couldn't move her legs due to the freezing temperatures. Two beluga whales, Mila and Nicola, sensed that she was in trouble. Mila gripped Yang Yun's leg in her mouth and pushed Yun to the surface, saving her life.

**F** Stories of marine mammals helping humans – and each other – date back to Ancient Greece. Although we may never be sure why they help us, many people feel that it is a good reason for us to do whatever we can to protect them.`;

const ZOO = `## The modern zoo

The first zoo is believed to have been in Egypt in around 3500 BC. Early collections of animals on display often belonged to royalty. King Henry I of England had lions, leopards and camels. He had received them as gifts. Until the late twentieth century, the main purpose of zoos was for entertainment. They existed to give people the chance to see animals they could not see in the wild. In 1959, famous wildlife expert Gerald Durrell opened the first zoo which put conservation of animals first.

Nowadays zoos' aims are: conservation, education, entertainment, in that order. Modern zoos try to get a balance between providing safe, comfortable homes for the animals and opportunities for visitors to see animals in natural surroundings. Zoos now share their knowledge and support each other. The World Association for Zoos and Aquariums (WAZA) works to educate people about animal welfare and conservation. It also helps to coordinate breeding programmes.

From the 1990s, zoos began to see their main role as saving the most threatened species. Each zoo focuses on a small number of species. The Siberian tiger and the orangutan are two species that have been saved through breeding programmes run by zoos. For example, in 2005 there were between 331 and 393 Siberian tigers in the Russian Far East. By 2015, there were 562. The tigers were helped to breed under the Species Survival Plan of the Association of Zoos and Aquariums (AZA). Often the aim is to reintroduce endangered species into their natural habitats. In Indonesia, Borneo Orangutan Rescue teaches orangutans how to live in the wild. When they are ready, they are taken to protected forests to live naturally.

Now that we have a better understanding of animals, zoos try to recreate natural habitats of animals as accurately as possible. For example, polar bears live in a plain, white open space. Zoos try to provide 'enrichment' for the animals to improve their wellbeing. This includes climbing frames, feeding puzzles, unusual objects and different types of food. It allows animals to behave in a normal way, such as scratching, climbing, digging and solving problems. Another type of enrichment is mixing up types of animal that would naturally mix in the wild. Colchester Zoo in England has a 'kingdom of the wild' paddock where several species live together. They have found positive changes to the behaviour of these animals as a result.

Different types of technology are used to help create natural environments for animals. In Indianapolis Zoo, in the United States, for example, there is a 'functional forest' called the Hutan Trail, a series of towers and cables 20 metres above the ground. This allows the orangutans to swing around the zoo as they would swing around the forest in their native Indonesia. The cables are strong enough to give them a safe and comfortable trip around the zoo. They have access to three oases, where they can go when they want to be apart from the group.

Likewise, technology has been used to engage the public more with the animals. In many zoos there are webcams in some enclosures so visitors can keep up with their favourite animals between visits to the zoo.

Zoos have moved on over the last few decades. They now play an important role in protecting animals and in making people more aware of the importance of animals. Zoos have made people aware that animals should not be over-hunted and that they play an important role in the ecology of the planet and in helping to maintain the balance of nature.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T66 = `Speaker 1
This creature is found in the mountains of Central Africa. It has black hair all over its body, which is much thicker than that of other members of the species. This means that it can live in colder temperatures. There are only about 900 of these apes in the wild. A lot of the green plants they eat have been destroyed, and they have also been killed in the past for their fur.

Speaker 2
This creature lives in the ocean from Australia up to Japan. Many of them are quite small, with a body that grows up to five centimetres long, and they have long tentacles, or arms. Its name comes from the bright blue rings that show up when it's frightened. You need to be careful in the sea around them as they are very poisonous.

Speaker 3
These creatures live mainly in desert areas and can survive in both mountains and valleys. Their tails help them to balance when they are climbing or sleeping in trees. Their black and yellow coats help them to hide in the places where they live. Unfortunately, there are only about 250 of these beautiful big cats left in the wild today.

Speaker 4
This strange-looking animal lives in wet areas and comes from the area south of the tropics in China. There are very few in the wild now. As you can see, it has antlers like most deer, but it has a neck like a camel and hooves or feet like a cow. They eat mainly grass and live partly on land and partly in water.`;

const T67 = `Hello everyone. Today I'm going to talk about a project I've done about the mountain gorilla. I think it's a truly fascinating animal. They originate in Africa – Central Africa, in fact.
So now I'm going to talk a little about where they live. As you can probably guess, and as you can see in this first photo, their name reflects the environment they live in – tropical mountain forests.
Now just like all other apes, they build nests out of leaves. But they don't make their nests high up as other species do – mountain gorillas make them on the ground instead. And they sleep wherever they end their day and they rarely sleep in the same bed twice!
So, I'll move on to talk about the physical features of the mountain gorilla. In other words, what it looks like. So here are some more photographs on screen for you all to have a look at. This gorilla here on the left is a male gorilla. We know that he's an older male gorilla because of the colour of his coat. As you can see, his coat is grey. He's called a silverback. Younger male gorillas are called blackbacks. And there's an obvious reason for that! Yes, a young adult male has a black coat. As he gets older, his coat turns from black to grey.
Next, I'm going to tell you a little about the diet of the mountain gorilla. Interestingly, mountain gorillas are herbivores. In other words, they survive on a diet of plants. As you can see from this next picture, this gorilla is eating leaves. They also eat fruit and flowers. They occasionally eat insects too, but only when they're very hungry! And it might interest you to know that mountain gorillas very rarely drink water, even though they live in a very warm climate. It appears they get all the water they need from plants.
I'd like to conclude by talking about some of the threats that mountain gorillas face. They are in serious danger of disappearing from our world altogether. Let's have a look at two reasons why they're in such danger. And both of these reasons are connected to human activity. Firstly, people are damaging the mountain forests where these gorillas live. They're cutting down the trees to build farms and towns. Mountain gorillas live in close family groups and this means that it's difficult for them to get enough to eat in the small areas they now have to live in. Secondly, gorillas are also suffering as a result of hunting. Sadly, some people find and kill them to sell. So it's a very sad situation indeed for these beautiful animals.`;

const T68 = `Good morning, everyone. In today's lecture I want to talk to you about a very unpopular animal here in Britain. In fact, you could say that it's one of our least loved animals! It's called the American bullfrog and yes, it does in fact come from America – the east of America, to be exact – and it was brought to Britain in the early 19th century, so you could say that it's been here for quite a long time. It wasn't brought here on purpose – it actually arrived in a big container of aquatic plants. In other words, it was accidentally introduced into Britain.
Now, I'll tell you a little about its appearance. The American bullfrog is a very large – and ugly – species of frog. And when I say it's large, I mean large. Interestingly, female American bullfrogs are usually much larger than the males. In fact, they can weigh up to 750 grams, whereas the males only go up to about 600 grams. Take a look at its head – it's really broad and flat, isn't it? And you can see its mouth just here – that's quite large too.
Now, both the male and the female American bullfrogs have green or brown bodies and have dark spots on the top. But there's one important difference between them – the male's throat is yellow but the female has a white one instead. And the other difference is their eardrums, here just behind their eyes. Those of the male are much larger than the female's.
So, let's move on to why we so dislike the American bullfrog. Well, this is because it has threatened our own native species of frogs. Firstly, it breeds very quickly indeed. For example, female bullfrogs can lay up to 25,000 eggs every single season. And secondly, the American bullfrog is very greedy. In fact, they eat just about anything they can put into their mouths! As well as other frogs, they eat insects, fish and have even been known to eat birds and snakes! So, in other words, they eat the food sources of our own native species. Thirdly, they carry a disease that is dangerous to other frogs. And finally, they don't just damage our natural world, they cause financial damage too. Around £100,000 has been spent monitoring the American bullfrog in the wild.
So, as scientists, we can learn a lesson from this about the dangers of introducing any living species into a new environment.`;

const T69 = `OK everyone, I think we're ready to make a start. Now, when you think of a dangerous animal, what do you think of? A tiger perhaps? Or maybe a leopard? Most people think that all dangerous animals live on land, but in fact, some of the most dangerous animals on the planet live in our seas and oceans. I'm going to talk today about one of these – the box jellyfish.
There are different types of box jellyfish, and they are found in warm coastal seas anywhere from the Indian Ocean to as far north as Japan, but the most dangerous ones are found in the oceans around Australia.
OK, so now let's examine what these box jellyfish look like. There are no prizes for guessing why it's called a box jellyfish! You can see that it's shaped like a box or a cube, with four sides and rounded corners. And you can also see that its body is light blue.
So, let's take a look at the tentacles of the box jellyfish more closely. It's got 15 of these growing from each of the four corners of the box. Now, you may be surprised to learn that these tentacles can grow to a length of three metres! And another surprising thing is its large number of eyes, that's six eyes on each of its four sides, so 24 altogether.
So now let's move on to talk about the sting of a box jellyfish. What is it? Well, a jellyfish has a lot of tentacles, and each tentacle has thousands of cells which can produce a poison. If the tentacles come into contact with a fish, or a person, they stick to their skin. If the tentacles are very long, they are in contact with a lot of the body, giving a bad sting which hurts terribly. This can be dangerous to the victim.
There are two ways that people can die as the result of a jellyfish sting. Firstly, a very severe sting can cause a person to have a heart attack. This can happen within minutes. Secondly, sometimes a swimmer goes into shock and can't make it back to the beach because they are in such extreme pain. If they're in the water alone, they'll die.
And now I'd like to conclude with advice on how to help someone who has been stung by a box jellyfish. If they have had a heart attack, of course the most important thing is to try to revive them first of all. And then, the best thing to help is vinegar. Yes, the same vinegar you use when you're cooking! Many Australian beaches keep bottles of it near the jellyfish warning signs. You should pour a bottle over the tentacles for 30 seconds, and then the tentacles can be removed. However, if you get stung and don't have any vinegar, you should pour seawater on the skin. This will help to ease the pain before you can get further medical help.`;

module.exports = {
  n: 8,
  title: 'Natural world',
  titleVi: 'Thế giới tự nhiên',
  pages: '149–154, 156–160',
  outcomes: [
    'Reading: notes completion bằng từ trong bài; matching sentence endings',
    'Grammar: động từ khuyết thiếu chỉ khả năng xảy ra (may, might, could) và năng lực (can, could)',
    'Listening: note completion — dùng tiêu đề (headings) và từ "signposting" để theo dõi bài nói',
    'Từ vựng động vật, bảo tồn, môi trường (Sổ 4)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: animals and nature',
      titleEn: 'Lead-in · Skim reading (p. 149)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Nhận ra cặp từ đồng nghĩa / trái nghĩa trong cùng câu (predator – prey, survive – die)', 'Skim bài "Our friends and protectors" trong 1 phút'],
      theory: [
        card('Đồng nghĩa và trái nghĩa trong câu', 'Similar or opposite meaning', {
          usage: ['**predator** (thú săn mồi) ↔ **prey** (con mồi): trái nghĩa · **group** = **pod** (đàn cá heo) · **conservation** ≈ **protection**', '**survived** ↔ **died**: trái nghĩa · **automatic** ≈ **instinctive** (bản năng).', 'Nhận ra đồng nghĩa/trái nghĩa giúp hiểu câu hỏi đã paraphrase bài đọc thế nào.'],
        }),
      ],
      vocab: vocabFile('u08-reading', [FRIENDS, ZOO]),
      ex: [
        mcq('Similar or opposite meaning? (Ex. 1–2)', 'Do the two underlined words in each sentence have a similar meaning or the opposite meaning?', [
          ['A PREDATOR catches and eats its PREY.', ['similar meaning', 'opposite meaning'], 'B', 'predator = thú săn mồi; prey = con mồi.'],
          ['A GROUP of dolphins is called a POD.', ['similar meaning', 'opposite meaning'], 'A'],
          ['Environmentalists work for the CONSERVATION and PROTECTION of the planet.', ['similar meaning', 'opposite meaning'], 'A'],
          ['Only a few baby turtles SURVIVED; all the others DIED.', ['similar meaning', 'opposite meaning'], 'B'],
          ['Mothers have an AUTOMATIC desire to protect their babies; keeping them safe is INSTINCTIVE behaviour.', ['similar meaning', 'opposite meaning'], 'A'],
        ], { stimulus: stim(FRIENDS, 'Our friends and protectors (p. 150)') }),
        match('Words with similar meanings (Ex. 4)', 'Read paragraph B in detail. Then match the words and phrases 1–5 from paragraph B with words and phrases a–e which have similar meanings.', [
          ['filming', 'videoing'], ['came to his rescue', 'saved the life of'], ['well-known', 'famous'], ['against the killing of', 'for the protection of'], ['pod', 'group (of dolphins)'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: notes completion & sentence endings',
      titleEn: 'Notes completion · Matching sentence endings · Exam skills (pp. 151–154)',
      minutes: 55,
      objectives: ['Notes completion: tìm đúng đoạn, đọc kỹ, chép từ trong bài đúng ngữ pháp', 'Matching sentence endings: tự hoàn thành câu trước rồi mới so với các đuôi câu', 'Không bị lừa bởi đuôi câu có từ giống trong bài'],
      theory: [
        card('Notes completion', 'Notes completion', {
          formula: ['Đọc kỹ đề (bao nhiêu từ? lấy từ bài hay từ khung?) → đọc ghi chú → nghĩ **từ đồng nghĩa** của từ khoá → đoán **loại từ** (giới từ in/from, mạo từ a/an/the là manh mối) → tìm đúng đoạn → điền → đọc lại.'],
          usage: ['Ghi chú thường chỉ liên quan **một phần** của bài; thứ tự có thể khác bài.', 'Ví dụ: "Stories of whales and dolphins assisting people were first heard of in ___" → marine mammals helping humans **date back to** → **Ancient Greece** ("in" → năm hoặc nơi chốn).'],
        }),
        card('Matching sentence endings', 'Matching sentence endings', {
          formula: ['Đọc phần đầu câu → từ khoá + từ đồng nghĩa → tìm chỗ trong bài → **tự viết đuôi câu** → chọn đuôi giống ý của bạn → kiểm tra ngữ pháp, số ít/nhiều.'],
          usage: ['Có **nhiều đuôi câu hơn** số câu.', '**Đừng bị lừa** bởi đuôi câu chứa từ trong bài: "because her first attempts had failed" — attempts/failed có trong bài nhưng là của **con người**, không phải của Moko.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U08-R1', title: 'Our friends and protectors (Ex. 5–10)', note: 'Notes completion + sentence endings.' },
        { ref: 'reading:M1-U08-R2', title: 'Exam skills: The modern zoo (Ex. 13)', note: '6 câu notes completion + 5 câu sentence endings.' },
      ],
      ex: [
        mcq('Which paragraph? (Ex. 5–7)', 'Answer the questions about where to find the information.', [
          ['Which paragraph did you need to read in detail to complete the notes about Hardy Jones?', ['Paragraph A', 'Paragraph B', 'Paragraph C'], 'B', 'Không cần đọc cả đoạn — chỉ phần về Hardy Jones.'],
          ['Which paragraph did you need to read to complete the notes about the orcas and the beluga whales?', ['Paragraph D', 'Paragraph E', 'Paragraph F'], 'B'],
          ["Which paragraph do you need to read to find the ending to the sentence 'Moko \"spoke\" to the beached whales …'?", ['Paragraph B', 'Paragraph C', 'Paragraph D'], 'C'],
        ], { stimulus: stim(FRIENDS, 'Our friends and protectors') }),
        mcq('Choose the ending (Ex. 8–9)', 'Choose one of these endings for the sentence.', [
          ["Moko 'spoke' to the beached whales …", ['because her first attempts had failed.', 'to help them return to the deep water.', 'because she led them to safety.'], 'B', '"led them to a channel which took them back to the ocean" = help them return to the deep water. A: attempts/failed là của con người. C: dẫn tới nơi an toàn không phải LÝ DO Moko "nói chuyện" với cá voi.'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: modals of possibility and ability',
      titleEn: 'Grammar focus: modals of possibility and ability (p. 153)',
      minutes: 30,
      objectives: ['Dùng may / might / could để nói điều có thể xảy ra (chưa chắc chắn)', 'Dùng can / could / couldn\'t để nói năng lực ở hiện tại và quá khứ'],
      keyLanguage: [
        '**Khả năng xảy ra (possibility)**: may, might, could + V — Experts think dolphins **may understand** that humans are similar to them.',
        '**Năng lực (ability)**: can (hiện tại), could / couldn\'t (quá khứ) — Dolphins **can tell** when a woman is pregnant. Yang Yun found she **couldn\'t move** her legs.',
        '**could** có hai nghĩa — dựa vào ngữ cảnh: "Perhaps they **could tell** he was a person who cared…" (năng lực trong quá khứ).',
      ],
      theory: [
        card('Modal verbs', 'Modals of possibility and ability', {
          formula: ['may / might / could + V (có thể, chưa chắc)', 'can + V (có khả năng — hiện tại)', 'could / couldn\'t + V (có / không có khả năng — quá khứ)'],
          examples: [["Dolphins' protection of humans might not be just automatic or instinctive.", 'Có thể không chỉ là bản năng.'], ["He couldn't get away.", 'Anh ta đã không thể thoát ra.']],
        }),
      ],
      links: [{ grammar: 'modal-verbs', title: 'Modal Verbs', note: 'may, might, could, can' }],
      ex: [
        cat('Possibility or ability? (Ex. 11–12)', 'Find examples of modals in paragraphs A, B, E and F. Is each modal about possibility or ability?', { p: 'Possibility', a: 'Ability' }, [
          ['Dolphins can tell when a woman is pregnant.', 'a'],
          ['Experts think they may understand that humans are similar to them.', 'p'],
          ["Dolphins' protection of humans might not be just automatic or instinctive.", 'p'],
          ['They may actively decide to help in certain situations.', 'p'],
          ['Perhaps they could tell he was a person who cared very much about dolphins.', 'a'],
          ["He couldn't get away.", 'a'],
          ["Yang Yun found she couldn't move her legs due to the freezing temperatures.", 'a'],
          ['Although we may never be sure why they help us…', 'p'],
        ]),
        gap('Complete with a modal (Ex. 11–12)', 'Complete the sentences with can, could, couldn\'t, may or might.', [
          ['Dolphins ____ tell when someone is in trouble. (ability, present)', 'can'],
          ["Joey Trevino felt he ____ keep going any more. (ability, past, negative)", "couldn't|could not"],
          ['That moral support ____ have saved Trevino\'s life. (possibility)', 'may|might|could'],
          ['The whales ____ find their way past the sand bank. (ability, past, negative)', "couldn't|could not"],
          ['We ____ never be sure why they help us. (possibility)', 'may|might'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: note completion & signposting',
      titleEn: 'Lead-in · Note completion · Using headings · Signposting words · Exam skills (pp. 156–160)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Dùng tiêu đề trong ghi chú để theo dõi bài nói', 'Nhận ra từ "signposting" báo hiệu chủ đề mới, lý do, kết luận', 'Đoán loại thông tin cho từng chỗ trống', 'Kiểm tra chính tả, chữ số, số ít/số nhiều'],
      images: ['media:m1u08-animals.jpg|Ex. 1 (p. 156): animals A–D'],
      theory: [
        card('Note completion', 'Note completion', {
          usage: ['Điền **tối đa 3 từ** (hoặc 2 từ và/hoặc một số); dùng **đúng từ nghe được**.', 'Ghi chú thường có **tiêu đề** (Habitat, Diet, Dangers…) — giúp bạn biết người nói đang ở phần nào.', 'Ghi chú **không theo ngữ pháp đầy đủ** (thiếu trợ động từ, mạo từ) hoặc là gạch đầu dòng.', 'Có thể **đặt lại thành câu hỏi**: "female weighs up to ___ grams" → How much does it weigh?'],
        }),
        card('Signposting words', "'Signposting' words", {
          usage: ['**So, now I\'m going to talk a little about… / So, I\'ll move on to…** → chủ đề mới (có thể là tiêu đề mới).', '**I\'d like to conclude by…** → chủ đề cuối cùng.', '**Let\'s have a look at two reasons why…** → sắp có 2 lý do · **Firstly… Secondly…** → lý do 1, lý do 2.', '**In other words…** → nói lại ý vừa rồi bằng từ khác.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U08-L1', title: 'Four animals (Ex. 2)', note: 'Mỗi người nói đang mô tả con vật nào?' },
        { ref: 'listening:M1-U08-L2', title: 'The mountain gorilla (Ex. 8–9)', note: '5 chỗ trống, NO MORE THAN TWO WORDS.' },
        { ref: 'listening:M1-U08-L3', title: 'The American bullfrog (Ex. 11)', note: '6 chỗ trống, ONE WORD AND/OR A NUMBER.' },
        { ref: 'listening:M1-U08-L4', title: 'Exam skills: the box jellyfish (Ex. 13)', note: 'Note completion 6 câu.' },
      ],
      vocab: vocabFile('u08-listening', [T66, T67, T68, T69]),
      ex: [
        match('Animals (Ex. 1)', 'Match photographs A–D with the names of the animals.', [
          ['Photograph A', 'mountain gorilla'], ['Photograph B', 'blue ring octopus'], ['Photograph C', "Pere David's deer"], ['Photograph D', 'Arabian leopard'],
        ], { stimulus: picture('media:m1u08-animals.jpg', 'Ex. 1') }),
        match('Headings and questions (Ex. 3)', 'Match the headings 1–5 with the questions a–e.', [
          ['Country of origin', 'Where does it come from?'], ['Dangers', 'What threats does it face?'], ['Diet', 'What does it eat?'], ['Habitat', 'Where does it live?'], ['Physical description', 'What does it look like?'],
        ]),
        match('Headings and notes (Ex. 4)', 'Look at the notes about the animals. Match each note with a heading.', [
          ['Comes from Africa', 'Country of origin'], ['People are using its land for cows and sheep', 'Dangers'], ['Mainly eats grass', 'Diet'], ['Lives on wet lands', 'Habitat'], ['Has long arms', 'Physical description'],
        ]),
        mcq('Signposting words (Ex. 5)', 'Look at the signposting phrases. What do they signal?', [
          ["So, now I'm going to talk a little about …", ['a new topic – might be a new heading on the notes', 'the same thing in different words', 'two reasons'], 'A'],
          ["Let's have a look at two reasons why …", ['a new topic – the last one', 'two reasons – listen carefully for both', 'the same thing in different words'], 'B'],
          ["So, I'll move on to talk about …", ['a new topic – might be a new heading on the notes', 'the first and the second reason', 'the last topic'], 'A'],
          ['Firstly … Secondly …', ['the same thing in different words', 'here is the first reason … and here is the second reason', 'a new topic'], 'B'],
          ["I'd like to conclude by talking about …", ['a new topic – this will be the last thing the speaker talks about', 'two reasons', 'the same thing in different words'], 'A'],
          ['In other words …', ['a new topic', 'the speaker is going to say the same thing using different words', 'two reasons'], 'B'],
        ]),
        match('What kind of word? (Ex. 7)', 'Look at the gaps 1–5 in the notes about the mountain gorilla. What kind of word do you have to listen for?', [
          ['Gap 1: Builds a nest on the ___', 'the name of a place'], ['Gap 2: Older males have a ___ coloured coat', 'a colour'], ['Gap 3: Younger males are called ___', 'a name'],
          ['Gap 4: Plants provide the ___ they require', 'something gorillas need to eat or drink'], ['Gap 5: Dangers: ___', 'something bad for gorillas'],
        ]),
        match('Gaps and questions (Ex. 10)', 'Read the notes about the American bullfrog. Match gaps 1–6 in the notes with the questions a–f.', [
          ['Gap 1: introduced into the UK at the beginning of the ___ century', 'When did it come to Britain?'], ['Gap 2: female weighs up to ___ grams', 'How much does it weigh?'],
          ['Gap 3: has a flat ___', 'What part of its body is flat?'], ['Gap 4: male frog has a ___ coloured throat', 'What colour is the throat of the male?'],
          ['Gap 5: eats … birds and animals including ___', 'What kind of animals does it eat?'], ['Gap 6: a total of £___ already spent', 'How much money has been spent on control measures?'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U08-R1',
      title: 'Mindset 1 · Unit 8 — Our friends and protectors',
      content: html(FRIENDS),
      questionGroups: [
        qNote('Complete the notes below. Write NO MORE THAN TWO WORDS from the passage for each answer. (Ex. 5)', 'Dolphins to the rescue', [
          'A pod of dolphins saved the life of a man called __Q1__, while he was videoing them.',
          'The man was a famous __Q2__ for the protection of dolphins.',
        ], { 1: 'Hardy Jones', 2: 'campaigner' }, {
          1: 'B: "Wildlife filmmaker **Hardy Jones** was filming a group of dolphins… Four dolphins came to his rescue" (filming = videoing; came to his rescue = saved the life of).',
          2: 'B: "Jones was a well-known **campaigner** against the killing of dolphins" (well-known = famous; against the killing of = for the protection of).',
        }, 'Questions 1–2'),
        qNote('Complete the notes below. Write NO MORE THAN THREE WORDS from the passage for each answer. (Ex. 6)', 'Whales as protectors', [
          'Orcas were trying to catch and hurt a group of __Q3__ who were travelling from one place to another.',
          'The migrating whales were helped by __Q4__. The whole incident lasted more than __Q5__.',
          "Beluga whales helped a diver who couldn't get to the surface. Because of the icy waters she was unable to __Q6__. One of the whales saved her life by taking hold of her __Q7__ and giving her a push upwards.",
        ], { 3: 'grey whales', 4: 'humpback whales', 5: ['seven hours', '7 hours'], 6: 'move her legs', 7: 'leg' }, {
          3: 'E: "protecting **migrating grey whales** from attacks by orcas" (travelling from one place to another = migrating).',
          4: 'E: "a group of **humpback whales** who were protecting migrating grey whales".',
          5: 'E: "over a period of **at least seven hours**" (more than = at least).',
          6: 'E: "she couldn\'t **move her legs** due to the freezing temperatures" (icy = freezing).',
          7: 'E: "Mila gripped Yang Yun\'s **leg** in her mouth and pushed Yun to the surface" (taking hold of = gripped). Số ít: leg.',
        }, 'Questions 3–7'),
        qEndings(8, 'Complete each sentence with the correct ending, A–H. (Ex. 10)', [
          'so we should protect them.', 'to encourage him not to lose hope.', 'because there were so many dolphins.', 'because they recognise that humans are similar to them.',
          'because they sometimes actively decide to help.', 'because he had not seen the shark.', 'because a shark was about to attack him.', 'because he was a campaigner for dolphin protection.',
        ], [
          ['Dolphins may protect humans', 'D', 'A: "Experts think they may understand that humans are similar to them and try to protect them" (recognise = understand). BẪY: E "actively decide to help" nói về việc giúp không chỉ là bản năng.'],
          ['Dolphins swam towards Hardy Jones', 'G', 'B: "a large shark swam towards him ready to attack. Four dolphins came to his rescue". BẪY: H chỉ là phỏng đoán "Perhaps…".'],
          ['The swimmer tried to leave the protective ring of dolphins', 'F', 'B: "As they had not yet seen the shark, one of them tried to swim away."'],
          ['A dolphin nudged Joey Trevino', 'B', 'C: "gently pushed him, as if to say \'don\'t give up\'" (nudged = gently pushed) → B "to encourage him not to lose hope" (don\'t give up = not lose hope).'],
          ['Dolphins and whales help us', 'A', 'F: "it is a good reason for us to do whatever we can to protect them".'],
        ], 'Questions 8–12'),
      ],
    },
    {
      ref: 'M1-U08-R2',
      title: 'Mindset 1 · Unit 8 — The modern zoo',
      content: html(ZOO),
      questionGroups: [
        qNote('Complete the notes below. Choose NO MORE THAN TWO WORDS from the passage for each answer.', 'The modern zoo', [
          'Before the 1990s, zoos existed mainly for __Q1__.',
          'The first zoo to focus on protecting animals was started by __Q2__.',
          'Since the 1990s a number of zoos have introduced programmes which aim to breed threatened animals and return them to their __Q3__. But first the animals have to learn how to survive in the __Q4__.',
          'Zoos offer animals __Q5__ by making it challenging for them to find their food, providing them with climbing equipment, and even mixing them with other species.',
          '__Q6__ enable the public to view zoo animals from their homes.',
        ], { 1: 'entertainment', 2: 'Gerald Durrell', 3: 'natural habitats', 4: 'wild', 5: 'enrichment', 6: 'Webcams' }, {
          1: 'Đoạn 1: "Until the late twentieth century, the main purpose of zoos was for **entertainment**."',
          2: 'Đoạn 1: "In 1959, famous wildlife expert **Gerald Durrell** opened the first zoo which put conservation of animals first."',
          3: 'Đoạn 3: "the aim is to reintroduce endangered species into their **natural habitats**".',
          4: 'Đoạn 3: "Borneo Orangutan Rescue teaches orangutans how to live in the **wild**."',
          5: 'Đoạn 4: "Zoos try to provide \'**enrichment**\'… climbing frames, feeding puzzles… mixing up types of animal".',
          6: 'Đoạn 6: "there are **webcams** in some enclosures so visitors can keep up with their favourite animals between visits".',
        }, 'Questions 1–6'),
        qEndings(7, 'Complete each sentence with the correct ending, A–H.', [
          "has created an environment that copies the animals' natural habitat.", 'was started by Gerald Durrell.', 'has webcams in all the enclosures.', 'prepares one species to return to their own environment.',
          'does not always separate different types of animal.', 'is part of the AZA.', 'is involved in teaching about how to better care for animals and protect them and in helping zoos work together.', 'was a private collection of animals.',
        ], [
          ['The first zoo', 'H', 'Đoạn 1: "Early collections of animals on display often **belonged to royalty**" → bộ sưu tập riêng. B sai: Durrell mở zoo bảo tồn đầu tiên năm 1959, không phải zoo đầu tiên.'],
          ['The World Association for Zoos and Aquariums (WAZA)', 'G', 'Đoạn 2: "works to educate people about animal welfare and conservation. It also helps to coordinate breeding programmes".'],
          ['Borneo Orangutan Rescue', 'D', 'Đoạn 3: "teaches orangutans how to live in the wild… taken to protected forests".'],
          ['Colchester Zoo', 'E', 'Đoạn 4: "a \'kingdom of the wild\' paddock where several species live together".'],
          ['Indianapolis Zoo', 'A', 'Đoạn 5: the Hutan Trail lets orangutans "swing around the zoo as they would swing around the forest in their native Indonesia". C sai: webcams "in some enclosures", ở nhiều zoo.'],
        ], 'Questions 7–11'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U08-L1', title: 'Mindset 1 · Unit 8 — Four animals',
      description: 'Four short extracts describing animals.', partNumber: 4, audioFile: 'Mindset_L1_66.mp3', transcript: T66,
      questionGroups: [qMatch(1, 'Listen to the four short extracts. Which animal is each speaker describing? (Ex. 2)', ['A mountain gorilla', 'B blue ring octopus', "C Pere David's deer", 'D Arabian leopard'], [
        ['Speaker 1', 'A', lx('Người nói 1', '', ['found in the mountains of Central Africa', 'There are only about 900 of these apes in the wild'], 'apes, mountains → mountain gorilla.')],
        ['Speaker 2', 'B', lx('Người nói 2', '', ['long tentacles, or arms', 'Its name comes from the bright blue rings'], '')],
        ['Speaker 3', 'D', lx('Người nói 3', '', ['live mainly in desert areas', 'Their black and yellow coats', 'these beautiful big cats'], 'big cats, desert → Arabian leopard.')],
        ['Speaker 4', 'C', lx('Người nói 4', '', 'it has antlers like most deer, but it has a neck like a camel', '')],
      ], { title: 'Questions 1–4', optionsTitle: 'Animals', type: 'matching' })],
    },
    {
      ref: 'M1-U08-L2', title: 'Mindset 1 · Unit 8 — The mountain gorilla',
      description: 'A student talks about a project on the mountain gorilla.', partNumber: 4, audioFile: 'Mindset_L1_67.mp3', transcript: T67,
      questionGroups: [qNote('Listen and complete the notes. Write NO MORE THAN TWO WORDS for each answer. (Ex. 8–9)', 'The mountain gorilla', [
        'Country of origin: Comes from Central Africa',
        'Habitat: Lives in mountain forests · Builds a nest on the __Q1__',
        'Physical description: Has a thick coat of fur · Older males have a __Q2__ coloured coat · Younger males are called __Q3__',
        'Diet: Eats plants, including leaves, fruit and flowers · Plants provide the __Q4__ they require',
        'Dangers for gorillas: People are destroying the environment where the gorillas live · __Q5__',
      ], { 1: 'ground', 2: ['grey', 'gray'], 3: ['blackbacks', 'black backs'], 4: 'water', 5: 'hunting' }, {
        1: lx('Xây tổ trên ___', 'Phần Habitat.', "But they don't make their nests high up as other species do – mountain gorillas make them on the ground instead", 'BẪY: "high up" là loài khác.'),
        2: lx('Con đực lớn tuổi có bộ lông màu ___', 'Phần Physical description.', ["his coat is grey. He's called a silverback"], 'BẪY: silverback là tên gọi, không phải màu (và black là màu của con đực trẻ).'),
        3: lx('Con đực trẻ được gọi là ___', '', 'Younger male gorillas are called blackbacks', ''),
        4: lx('Thực vật cung cấp ___ chúng cần', 'Phần Diet.', ['mountain gorillas very rarely drink water', 'they get all the water they need from plants'], 'BẪY: insects — chỉ ăn khi rất đói.'),
        5: lx('Mối nguy thứ hai', 'Phần Dangers ("Secondly").', ['Firstly, people are damaging the mountain forests', 'Secondly, gorillas are also suffering as a result of hunting'], 'Signposting "two reasons… Firstly… Secondly".'),
      }, 'Questions 1–5')],
    },
    {
      ref: 'M1-U08-L3', title: 'Mindset 1 · Unit 8 — The American bullfrog',
      description: 'A lecture about an unpopular animal in Britain.', partNumber: 4, audioFile: 'Mindset_L1_68.mp3', transcript: T68,
      questionGroups: [qNote('Listen and complete the notes. Write ONE WORD AND/OR A NUMBER for each answer. (Ex. 11)', 'The American bullfrog', [
        'Origin: East United States · was introduced into the UK at the beginning of the __Q1__ century',
        'Physical description: female weighs up to __Q2__ grams · has a green and brown body · has a flat __Q3__ · male frog has a __Q4__ coloured throat',
        'Reasons for unpopularity: breeds rapidly, so numbers are increasing · eats the food of native British frogs – insects, fish, birds and animals including __Q5__ – and also eats the frogs themselves! · carries a disease that can kill other frogs · financial cost – a total of £__Q6__ already spent on research into American bullfrogs',
      ], { 1: ['19th', 'nineteenth'], 2: '750', 3: 'head', 4: 'yellow', 5: 'snakes', 6: ['100,000', '100000', 'one hundred thousand'] }, {
        1: lx('được đưa vào Anh đầu thế kỷ ___', 'Đầu bài.', 'it was brought to Britain in the early 19th century', 'beginning = early.'),
        2: lx('con cái nặng tới ___ gram', '', 'they can weigh up to 750 grams, whereas the males only go up to about 600 grams', 'BẪY: 600 là con đực.'),
        3: lx('có ___ dẹt', '', "Take a look at its head – it's really broad and flat", 'BẪY: mouth — "quite large", không phải flat.'),
        4: lx('con đực có cổ họng màu ___', '', "the male's throat is yellow but the female has a white one", ''),
        5: lx('ăn … chim và các loài vật gồm cả ___', '', 'have even been known to eat birds and snakes', 'Số nhiều: snakes.'),
        6: lx('tổng cộng £___ đã chi', 'Cuối bài.', 'Around £100,000 has been spent monitoring the American bullfrog', 'BẪY: 25,000 là số trứng.'),
      }, 'Questions 1–6')],
    },
    {
      ref: 'M1-U08-L4', title: 'Mindset 1 · Unit 8 — Exam skills: the box jellyfish',
      description: 'A talk about one of the most dangerous animals in the sea.', partNumber: 4, audioFile: 'Mindset_L1_69.mp3', transcript: T69,
      questionGroups: [qNote('Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer. (Ex. 13)', 'The box jellyfish', [
        'Habitat: In warm seas, not far from the coast · Most dangerous box jellyfish found in the sea near __Q1__',
        'Appearance: Shaped like a box · Light blue in colour · Tentacles grow up to __Q2__ metres in length · Has __Q3__ eyes',
        'How the box jellyfish stings: cells on tentacles can produce a powerful poison · when tentacles touch a human or a fish, they __Q4__ to them and deliver a strong sting',
        "Dangers to people: The sting can result in death · by causing a heart attack · if a swimmer can't swim back to the shore because the sting has caused such great __Q5__",
        'What to do if someone has been stung: heart attack – try to revive them · pour vinegar over the tentacles · if vinegar not available, put __Q6__ on the skin',
      ], { 1: 'Australia', 2: ['3', 'three'], 3: ['24', 'twenty-four'], 4: 'stick', 5: 'pain', 6: ['seawater', 'sea water', 'water'] }, {
        1: lx('Loài sứa hộp nguy hiểm nhất ở vùng biển gần ___', 'Đoạn 2.', ['anywhere from the Indian Ocean to as far north as Japan', 'the most dangerous ones are found in the oceans around Australia'], 'BẪY: Indian Ocean, Japan.'),
        2: lx('Xúc tu dài tới ___ mét', 'Đoạn 4.', ["It's got 15 of these growing from each of the four corners", 'these tentacles can grow to a length of three metres'], 'BẪY: 15 là số xúc tu mỗi góc.'),
        3: lx('Có ___ mắt', 'Đoạn 4.', "six eyes on each of its four sides, so 24 altogether", 'Tổng cộng 24 (6 × 4).'),
        4: lx('khi chạm vào người hoặc cá, chúng ___ vào', 'Đoạn 5.', 'If the tentacles come into contact with a fish, or a person, they stick to their skin', ''),
        5: lx('vì vết đốt gây ___ quá lớn', 'Đoạn 6.', "can't make it back to the beach because they are in such extreme pain", 'great ↔ extreme. Cần danh từ.'),
        6: lx('nếu không có giấm, đổ ___ lên da', 'Cuối bài.', "if you get stung and don't have any vinegar, you should pour seawater on the skin", ''),
      }, 'Questions 1–6')],
    },
  ],
};
