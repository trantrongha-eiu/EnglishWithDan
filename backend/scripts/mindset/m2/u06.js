// Mindset for IELTS Level 2 — Unit 6: The natural environment (Reading pp. 108–113 · Listening pp. 115–121)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qYNNG, qSummary, qNote, qFill, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 3; // sách của lớp: Unit 5–6 → Sổ 3

const SHORT = txt('u06-short');
const ZOOS = txt('u06-zoos');
const GORILLAS = txt('u06-gorillas');
const CONSERV = txt('u06-conservation');
const T = {};
for (let n = 49; n <= 57; n++) T[n] = txt('u06-t' + n);
const SCRIPTS = Object.values(T);
const READS = [SHORT, ZOOS, GORILLAS, CONSERV];

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });
const YNNG = ['Yes', 'No', 'Not Given'];

module.exports = {
  n: 6,
  title: 'The natural environment',
  titleVi: 'Môi trường tự nhiên',
  pages: '108–113, 115–121',
  outcomes: [
    'Reading: Yes / No / Not Given (quan điểm của người viết); summary completion (từ trong khung hoặc từ trong bài)',
    'Grammar: so, too, either, neither để đồng ý / không đồng ý',
    'Listening: Section 4 — hoàn thành sơ đồ quy trình; lượng từ (quantifiers); multiple choice; signposting',
    'Từ vựng môi trường, bảo tồn, năng lượng (Sổ 3)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: the environment',
      titleEn: 'Lead-in (p. 108)',
      slot: SLOT,
      minutes: 25,
      objectives: ['Hiểu các từ về môi trường và bảo tồn: habitat, extinction, conservation, endangered, species, threaten, poach, captivity'],
      theory: [
        card('Chủ đề môi trường', 'The natural environment', {
          usage: ['Môi trường là chủ đề rất hay gặp trong IELTS. Học theo họ từ: **endangered** species, risk **extinction**, **conservation** projects, loss of **habitat**, kept in **captivity**, animals are **poached**.'],
        }),
      ],
      vocab: vocabFile('u06-reading', [...READS, ...SCRIPTS]),
      ex: [
        match('Environment words (Ex. 1)', 'Match the words in the box with the definitions 1–8.', [
          ['the natural environment of an animal or plant', 'habitat'],
          ['a situation in which a type of animal no longer exists', 'extinction'],
          ['the protection of nature', 'conservation'],
          ['situation where animals or plants may soon not exist because there are very few now alive', 'endangered'],
          ['a group of plants or animals that share similar characteristics', 'species'],
          ['be likely to cause harm or damage to something or someone', 'threaten'],
          ['illegally catch or kill animals, especially by going onto land without the permission of the person who owns it', 'poach'],
          ['a situation in which an animal is kept in a zoo or a person is kept as a prisoner, rather than being free', 'captivity'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: Yes / No / Not Given & summary completion',
      titleEn: 'Yes / No / Not Given tasks · Summary completion tasks · Exam skills (pp. 109–113)',
      minutes: 60,
      objectives: ['Phân biệt YES (đồng ý với quan điểm người viết), NO (trái với quan điểm), NOT GIVEN (không biết người viết nghĩ gì)', 'Làm summary completion với từ trong khung (có distractor) và với từ trong bài', 'Kiểm tra ngữ pháp của câu sau khi điền'],
      theory: [
        card('Yes / No / Not Given', 'Yes / No / Not Given tasks', {
          formula: ['YES — phát biểu **khớp với quan điểm/nhận định** của người viết', 'NO — phát biểu **trái ngược** quan điểm người viết', 'NOT GIVEN — **không thể biết** người viết nghĩ gì về điều này'],
          usage: ['"View" = ý kiến cá nhân; "claim" = điều người viết khẳng định là đúng.', 'Thứ tự: ① đọc kỹ instructions → ② skim bài → ③ đọc phát biểu, gạch chân key words → ④ scan tìm key words hoặc từ đồng nghĩa → ⑤ gạch chân trong bài → ⑥ đọc câu trước và sau → ⑦ chọn Yes/No/Not Given.', 'Chú ý từ tuyệt đối: "**Most** people do not care" ↔ bài nói "**the majority of us** do give it the attention it deserves" → NO. "**All** zoos" ↔ "**many** zoos" → NO.'],
        }),
        card('Summary completion', 'Summary completion tasks', {
          usage: ['Hai dạng: chọn từ trong **khung** (có từ thừa, có distractor) hoặc lấy từ **trong bài**.', 'Bản tóm tắt thường chỉ bao một **phần** bài.', 'Xác định **loại từ** cần điền (noun, adjective…) trước khi scan.', 'Điền xong đọc lại — câu phải **đúng ngữ pháp**: "This is handled ___" cần trạng từ (carefully, không phải animal).'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U06-R1', title: 'The role of the modern zoo — Yes/No/Not Given + summary (Ex. 4, 7)', note: '4 câu Y/N/NG + 4 chỗ trống chọn từ trong khung.' },
        { ref: 'reading:M2-U06-R2', title: 'Mountain gorillas — summary from the text (Ex. 10)', note: 'ONE WORD from the text.' },
        { ref: 'reading:M2-U06-R3', title: 'Exam skills: How effective are conservation efforts? (Ex. 11–12)', note: '4 câu Y/N/NG + 6 chỗ trống chọn A–L.' },
      ],
      ex: [
        mcq('Yes, No or Not Given? A short text (Ex. 2)', 'Read the short text. Do the statements agree with the views of the writer? Write YES, NO or NOT GIVEN.', [
          ['Some people do not pay attention to environmental issues because they do not believe their involvement would make an impact.', YNNG, 'A', '"Other people just do not feel that their **contribution makes a difference**" (involvement ↔ contribution; make an impact ↔ makes a difference).'],
          ['Some people tackle environmental problems in the wrong way.', YNNG, 'C', 'Bài không nói gì về việc giải quyết vấn đề "sai cách".'],
          ['Most people do not care about environmental issues.', YNNG, 'B', '"the **majority of us** do give it the attention it deserves" → trái ngược.'],
          ['Some people do a great deal to protect the environment.', YNNG, 'A', '"many people **go to great lengths** to ensure the planet is protected" (do a great deal ↔ go to great lengths).'],
        ], { stimulus: stim(SHORT, 'A short text (p. 109)') }),
        match('Approaching Yes / No / Not Given tasks (Ex. 3)', 'Put the steps in order.', [
          ['Step 1', 'Read the instructions carefully.'], ['Step 2', 'Skim read the text to gain a general understanding of the topic.'],
          ['Step 3', 'Read the question statements carefully and underline key words.'], ['Step 4', 'Scan the text for these key words or words of a similar meaning.'],
          ['Step 5', 'Underline these words in the text.'], ['Step 6', 'Read the sentence before and after the key words or synonyms in the text.'],
          ['Step 7', 'Choose Yes, No or Not Given.'],
        ]),
        mcq('Distractors in the summary (Ex. 8)', 'Look at the words in the box in exercise 7 (carefully, quickly, entertaining, animal, conservation, reproduce, younger). Which words are distractors, and where would they have been grammatically correct?', [
          ['"quickly" is a distractor. In which gap would it have been grammatically correct?', ['gap 3 (This is handled ___)', 'gap 1 (focused mainly on ___ the public)', 'gap 4 (to inform the ___ generation)'], 'A', 'Gap 3 cần trạng từ — quickly đúng ngữ pháp nhưng sai nghĩa (bài nói "manage the programmes carefully").'],
          ['"animal" is a distractor. In which gap would it have been grammatically correct?', ['gap 2 (an active part in ___ projects)', 'gap 3 (This is handled ___)', 'gap 1 (focused mainly on ___ the public)'], 'A', '"animal projects" đúng ngữ pháp nhưng bài nói về conservation projects.'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: so, too, either and neither',
      titleEn: 'Grammar focus: so, too, either and neither (p. 110)',
      minutes: 25,
      objectives: ['Đồng ý với câu khẳng định: Me too / So do I / I do, too', 'Đồng ý với câu phủ định: Me neither / Neither do I / I don\'t either', 'Không đồng ý: I don\'t / I\'m not / I would / I wouldn\'t'],
      keyLanguage: [
        'Đồng ý (khẳng định): "I love visiting zoos." — **Me too. / So do I. / I do, too.**',
        'Đồng ý (phủ định): "I don\'t like seeing animals in cages." — **Me neither. / Neither do I. / I don\'t either.**',
        'Trợ động từ phải **khớp** với câu gốc: I\'m interested → So **am** I · I would love → So **would** I / I **wouldn\'t** (không đồng ý).',
      ],
      theory: [
        card('So, too, either, neither', 'Agreeing and disagreeing', {
          formula: ['So + trợ động từ + S (đồng ý với câu khẳng định)', 'Neither + trợ động từ + S (đồng ý với câu phủ định)', 'S + trợ động từ (+ not) + too / either'],
          examples: [["'I'm more interested in animals in the wild.' — 'So am I.'", ''], ["'I don't know anything about endangered species.' — 'Neither do I.'", ''], ["'I would love to go on a safari holiday.' — 'I wouldn't.'", 'Không đồng ý.']],
        }),
      ],
      ex: [
        gap('Agree or disagree (Ex. 6)', 'Answer using so, too, either and neither. More than one answer is possible.', [
          ["'I like exploring nature.' (agree) → '____'", "Me too.|So do I.|I do, too.|Me too|So do I|I do too|I do, too|I do too.", 'Đồng ý với câu khẳng định, trợ động từ do.'],
          ["'I would love to go on a safari holiday.' (disagree) → '____'", "I wouldn't.|I wouldn't|I would not.|I would not", 'Không đồng ý với "I would…" → I wouldn\'t.'],
          ["'I'm really interested in animal conservation.' (agree) → '____'", "Me too.|So am I.|I am, too.|Me too|So am I|I am too|I am, too|I am too.", 'Trợ động từ am.'],
          ["'I don't know anything about endangered species.' (agree) → '____'", "Neither do I.|Me neither.|I don't either.|Neither do I|Me neither|I don't either", 'Đồng ý với câu phủ định → neither / either.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: diagrams, quantifiers, multiple choice & signposting',
      titleEn: 'Lead-in · Completing diagrams · Quantifiers · Multiple-choice tasks · Understanding signposting · Exam skills (pp. 115–121)',
      slot: SLOT,
      minutes: 65,
      objectives: ['Phân loại nguồn năng lượng tái tạo / không tái tạo', 'Hoàn thành sơ đồ quy trình (fracking)', 'Dùng đúng lượng từ với danh từ đếm được / không đếm được', 'Làm multiple choice: nghe ý, không nghe từ trùng', 'Nhận ra signposting để theo dõi bài giảng'],
      images: ['media:m2u06-pictures.jpg|Ex. 2 (p. 116): pictures A–D', 'media:m2u06-fracking.jpg|Ex. 4 (p. 116): the fracking process'],
      theory: [
        card('Hoàn thành sơ đồ', 'Completing diagrams', {
          usage: ['Nhìn cả sơ đồ để nắm ý chung, nhưng **tập trung vào chỗ trống**.', 'Không cần hiểu hết từ trong sơ đồ.', 'Vòng tròn lớn phóng to một phần quan trọng; mũi tên cho biết **trình tự** (bắt đầu ở giếng, đi xuống, rẽ ngang, khí đi lên).', 'Đoán **loại từ** cho mỗi chỗ trống (lớp đất → danh từ, thứ thoát ra → danh từ).'],
        }),
        card('Lượng từ', 'Quantifiers with countable and uncountable nouns', {
          formula: ['Chỉ với danh từ đếm được: few, fewer, several, many, every', 'Chỉ với danh từ không đếm được: (a) little, much, less', 'Với cả hai: all, a lot of, more, some'],
          examples: [['Few of the renewable energy sources… have been developed.', 'sources đếm được → few.'], ['much more gas is used', 'gas không đếm được → much.']],
        }),
        card('Multiple choice và signposting', 'Multiple choice · Signposting', {
          usage: ['Đừng nghe tìm **từ trùng** với câu hỏi; hãy hiểu **ý** người nói: "according to supporters of fracking" = "those who are in favour of fracking"; "prices will come down" = "lower energy bills".', 'Nghe đến hết trước khi chọn.', '**Signposting**: to begin with, first, secondly, the last (trình tự); what\'s more (thêm ý); while (đối lập); now I\'d like to turn to (đổi chủ đề); clearly (thái độ); to summarise (tóm tắt).'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U06-L1', title: 'Energy sources (Ex. 1)', note: 'Renewable hay non-renewable?' },
        { ref: 'listening:M2-U06-L2', title: 'Words from the lecture (Ex. 2)', note: 'Nối mô tả với tranh A–D.' },
        { ref: 'listening:M2-U06-L3', title: 'The fracking process: complete the diagram (Ex. 4)', note: 'NO MORE THAN ONE WORD AND/OR A NUMBER.' },
        { ref: 'listening:M2-U06-L4', title: 'Fracking in different countries: quantifiers (Ex. 6)', note: 'Chọn lượng từ đúng với ý người nói.' },
        { ref: 'listening:M2-U06-L5', title: 'The benefits of fracking: the main benefit (Ex. 8)', note: 'Nghe ý, không nghe từ trùng.' },
        { ref: 'listening:M2-U06-L6', title: 'Benefits: jobs and businesses (Ex. 11)', note: 'Gạch chân từ quan trọng trước khi nghe.' },
        { ref: 'listening:M2-U06-L7', title: 'Benefits for the environment (Ex. 13)', note: '2 câu multiple choice.' },
        { ref: 'listening:M2-U06-L8', title: "People's concerns about fracking (Ex. 14)", note: '4 câu multiple choice.' },
        { ref: 'listening:M2-U06-L9', title: 'Exam skills: the future of energy (Ex. 17)', note: '5 câu multiple choice.' },
      ],
      vocab: vocabFile('u06-listening', [...SCRIPTS, ...READS]),
      ex: [
        match('Words from the lecture (Ex. 2)', 'Match the words with the correct picture, A–D.', [
          ['Picture A', 'well'], ['Picture B', 'fissure'], ['Picture C', 'drill'], ['Picture D', 'shale'],
        ], { stimulus: picture('media:m2u06-pictures.jpg', 'Ex. 2') }),
        mcq('Choose the correct quantifier (Ex. 5)', 'Choose the correct quantifier in these sentences.', [
          ['___ of the renewable energy sources, such as wind and wave power, have been developed and used around the world.', ['Little', 'Few'], 'B', 'sources đếm được → Few.'],
          ['Although coal is still widely used, ___ more gas is used instead these days.', ['much', 'many'], 'A', 'gas không đếm được → much.'],
          ['___ non-renewable resources have negative effects on the environment.', ['All', 'Every'], 'A', 'Every + danh từ số ít; resources số nhiều → All.'],
          ['___ energy production in the UK comes from wind turbines.', ['Several', 'Some'], 'B', 'production không đếm được → Some.'],
          ['There are not ___ suitable sites for solar power in the UK.', ['a lot of', 'much'], 'A', 'sites đếm được, số nhiều → a lot of.'],
        ]),
        cat('Countable or uncountable? (Ex. 7)', 'Write the quantifiers in the correct place in the table.', { c: 'Used only with countable nouns', u: 'Used only with uncountable nouns', b: 'Used with both' }, [
          ['few', 'c'], ['fewer', 'c'], ['several', 'c'], ['many', 'c'], ['every', 'c'],
          ['a little', 'u'], ['much', 'u'], ['less', 'u'],
          ['all', 'b'], ['a lot of', 'b'], ['more', 'b'], ['some', 'b'],
        ]),
        gap('Signposting (Ex. 16)', "Listen again to the lecturer talking about people's concerns. Complete each sentence with a signposting word or expression from the box, then write its function: sequencing (SE), contrast (C), addition (AD), summarising (SU), topic change (T) or attitude (AT). Example: To begin with, let's look at the environmental concerns. → SE", [
          ['The ____ and possibly most significant environmental concern is … → ____', ['first', 'SE|sequencing'], 'first = thứ nhất → liệt kê theo trình tự (sequencing).'],
          ["____, it is likely that, although countries which produce shale gas … → ____", ["What's more|Whats more", 'AD|addition'], "What's more = hơn nữa → thêm ý (addition)."],
          ['____, there are serious pollution problems … → ____', ['Secondly', 'SE|sequencing'], 'Secondly = thứ hai → trình tự (sequencing).'],
          ['The ____ environmental concern connected with drilling is that of earthquakes. → ____', ['last', 'SE|sequencing'], 'The last … = mối lo cuối cùng → trình tự (sequencing).'],
          ["____ I'd like to turn to the economic concerns. → ____", ['Now', 'T|topic change'], "Now I'd like to turn to … = chuyển sang chủ đề mới (topic change)."],
          ["____ there's clearly an increase in economic activity … → ____", ['While', 'C|contrast'], 'While = trong khi → đối lập (contrast).'],
          ['As I mentioned ____, there are a lot of concerns … → ____', ['earlier', 'SE|sequencing'], 'As I mentioned earlier = như tôi đã nói ở trên → nhắc lại trình tự bài nói (sequencing, theo Answer Key).'],
          ['____, a lot more research needs to be done … → ____', ['Clearly', 'AT|attitude'], 'Clearly = rõ ràng → thể hiện thái độ/quan điểm người nói (attitude).'],
        ], { wordBank: ['clearly', 'earlier', 'to begin with', 'secondly', 'now', 'while', 'that', 'first', 'to summarise', "what's more", 'last'] }),
        match('Same meaning, different words (Ex. 9)', 'Match the words in question 1 and the correct answer with the words and phrases in the listening which mean the same.', [
          ['those who are in favour of fracking', 'supporters of fracking'], ['the main benefit', 'the economic benefit… is usually seen as more significant'], ['lower energy bills', 'energy prices will come down'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U06-R1',
      title: 'Mindset 2 · Unit 6 — The role of the modern zoo',
      content: html(ZOOS),
      questionGroups: [
        qYNNG(1, 'Do the following statements agree with the views or claims of the writer? Write YES, NO or NOT GIVEN. (Ex. 4)', [
          ['Zoos have been very successful in protecting endangered species.', 'NOT GIVEN', 'Bài mô tả các cách zoo bảo vệ loài nguy cấp, nhưng không đánh giá chúng đã "very successful" hay chưa.'],
          ['Putting endangered animals back into the wild to reproduce is a good way to increase their populations.', 'NOT GIVEN', 'Bài nói reintroduction programmes "release animals… back into their natural habitats" nhưng không nói đó là cách tốt để tăng số lượng (việc tăng số lượng là của captive breeding).'],
          ['All zoos now focus on teaching people about animals facing extinction.', 'NO', '"**many** zoos now concentrate on educating the public" → không phải "all".'],
          ['Zoo visits increase awareness of environmental problems.', 'YES', '"Visiting the zoo… also **reminds individuals about environmental issues**".'],
        ], 'Questions 1–4'),
        qSummary('Complete the summary with a word from the list, A–G. (Ex. 7)',
          'In the past, zoos focused mainly on __Q5__ the public. This is certainly not the case any more. Today, the role of good zoos is to take an active part in __Q6__ projects. Several methods are used to achieve this. One way to avoid the extinction of certain species is to ensure that animals within zoos breed. This is handled __Q7__, however, to ensure genetic diversity. Another method is to release the animals back into their natural habitat. Perhaps the most significant role of the zoo, however, is its capacity to educate the general public about conservation and, more specifically, to inform the __Q8__ generation.',
          ['carefully', 'quickly', 'entertaining', 'animal', 'conservation', 'reproduce', 'younger'],
          { 5: 'entertaining', 6: 'conservation', 7: 'carefully', 8: 'younger' }, {
            5: '"Initially seen purely as centres of **entertainment**" → focused on entertaining the public.',
            6: '"a major force in **conserving** biodiversity" → conservation projects. BẪY: animal (đúng ngữ pháp, sai nghĩa).',
            7: '"manage the programmes **carefully** to ensure genetic variation". BẪY: quickly.',
            8: '"educating the public, particularly the **younger** generation".',
          }, 'Questions 5–8'),
      ],
    },
    {
      ref: 'M2-U06-R2',
      title: 'Mindset 2 · Unit 6 — Mountain gorillas',
      content: html(GORILLAS),
      questionGroups: [
        qNote('Complete the summary using ONE WORD from the text. (Ex. 10)', 'Mountain gorillas', [
          'Mountain gorillas are one of the most __Q1__ species in the world. With fewer than 900 surviving, there are several factors which have caused their decline.',
          'The biggest factor is humans moving into their areas and destroying their __Q2__.',
          'The risk of being __Q3__ is another major reason.',
          'In response to this decline in mountain gorillas, efforts have been made by __Q4__ groups to try and increase numbers.',
        ], { 1: 'endangered', 2: 'habitats', 3: 'poached', 4: 'conservation' }, {
          1: '"they are classed as critically **endangered**" (cần tính từ).',
          2: '"humans are moving further into their territory and consequently destroying their **habitats**" (số nhiều).',
          3: '"the threat of being **poached**" (being + V3).',
          4: '"Many **conservation** projects have been set up to aid mountain gorillas".',
        }, 'Questions 1–4'),
      ],
    },
    {
      ref: 'M2-U06-R3',
      title: 'Mindset 2 · Unit 6 — How effective are conservation efforts?',
      content: html(CONSERV),
      questionGroups: [
        qYNNG(1, 'Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN. (Ex. 11)', [
          ['Captive breeding programmes ensure that animals can cope in their natural habitat.', 'NO', '"after several generations in captivity, species could become **less able to survive in the wild**".'],
          ['Poachers are good at hiding the way in which they kill animals.', 'YES', '"The poachers are clever and use methods which are sometimes completely **undetectable**".'],
          ['Releasing animals into the wild after captive breeding has led to infections spreading.', 'NOT GIVEN', 'Bài chỉ nói việc thả động vật "**could** introduce disease" — không nói điều đó đã xảy ra.'],
          ['Conservation projects have not made any impact on saving natural habitats.', 'NO', '"conservation measures have helped to prevent humans from completely destroying all natural habitats".'],
        ], 'Questions 1–4'),
        qSummary('Complete the summary using the list of words, A–L. (Ex. 12)',
          'The problems faced by conservationists. A great deal of effort is put into conservation work in order to protect endangered species from becoming __Q5__. Whilst some of these conservation efforts are successful to an extent, they are still not enough to safeguard certain species in the long term. Culturally, these sought-after endangered __Q6__ are still valuable property and therefore they will always be at risk from __Q7__. __Q8__ is perhaps the best method to ensure their survival, but is also problematic. After generations of being held in a __Q9__ environment, these species may lose their ability to cope in their natural habitat. One of the most significant factors is the increase in the population of the human race, leading to many natural habitats being taken over and __Q10__.',
          ['lost', 'poachers', 'strange', 'diseases', 'extinct', 'species', 'protected', 'human', 'destroy', 'captive breeding', 'destroyed', 'changed'],
          { 5: 'extinct', 6: 'species', 7: 'poachers', 8: 'captive breeding', 9: 'protected', 10: 'destroyed' }, {
            5: '"protecting animals from **extinction**" → becoming extinct (cần tính từ).',
            6: '"a demand for exotic animals… endangered **species** will always be at risk".',
            7: '"at risk of being hunted and **poached**" → at risk from poachers.',
            8: '"**Captive breeding** is perhaps the most effective method of protecting animals from extinction, but this also has its problems".',
            9: 'captive environment = môi trường được bảo vệ, kiểm soát → protected.',
            10: '"prevent humans from completely **destroying** all natural habitats" → being taken over and destroyed. BẪY: destroy (sai dạng từ).',
          }, 'Questions 5–10'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U06-L1', title: 'Mindset 2 · Unit 6 — Energy sources',
      description: 'The first part of a lecture about the environment and energy sources.', partNumber: 4, audioFile: 'Mindset_L2_49.mp3', transcript: T[49],
      questionGroups: [
        qMcq(1, 'Listen to the first part of the lecture and decide whether each energy source is renewable or non-renewable. (Ex. 1)', [
          ['fracking', ['Renewable', 'Non-renewable'], 'B', lx('Fracking', '', '', 'Khai thác khí đá phiến — khí đốt không tái tạo.')],
          ['petroleum', ['Renewable', 'Non-renewable'], 'B', lx('Dầu mỏ', '', '', 'Không tái tạo.')],
          ['solar power', ['Renewable', 'Non-renewable'], 'A', lx('Năng lượng mặt trời', '', '', 'Tái tạo.')],
          ['wave power', ['Renewable', 'Non-renewable'], 'A', lx('Năng lượng sóng', '', '', 'Tái tạo.')],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M2-U06-L2', title: 'Mindset 2 · Unit 6 — Words from the lecture',
      description: 'Descriptions of four words from the lecture.', partNumber: 4, audioFile: 'Mindset_L2_50.mp3', transcript: T[50],
      questionGroups: [
        qMcq(1, 'Listen to descriptions of some words from the lecture and match them with the correct picture, A–D. (Ex. 2)', [
          ['Description 1', ['Picture A', 'Picture B', 'Picture C', 'Picture D'], 'C', lx('Mô tả 1', '', 'You can use this machine to make a hole in something', 'drill (máy khoan) → C.')],
          ['Description 2', ['Picture A', 'Picture B', 'Picture C', 'Picture D'], 'A', lx('Mô tả 2', '', 'This is a hole in the ground which is dug in order to extract water, oil or gas', 'well (giếng) → A.')],
          ['Description 3', ['Picture A', 'Picture B', 'Picture C', 'Picture D'], 'D', lx('Mô tả 3', '', "a kind of rock deep in the ground that isn't very hard and is easy to break", 'shale (đá phiến) → D.')],
          ['Description 4', ['Picture A', 'Picture B', 'Picture C', 'Picture D'], 'B', lx('Mô tả 4', '', 'This is a narrow space which appears inside rock when the rock breaks', 'fissure (khe nứt) → B.')],
        ], 'Questions 1–4', { image: 'media:m2u06-pictures.jpg' }),
      ],
    },
    {
      ref: 'M2-U06-L3', title: 'Mindset 2 · Unit 6 — The fracking process',
      description: 'The lecturer explains the fracking process.', partNumber: 4, audioFile: 'Mindset_L2_51.mp3', transcript: T[51],
      questionGroups: [{
        groupType: 'map', groupTitle: 'Questions 1–3', imageUrl: 'media:m2u06-fracking.jpg',
        instruction: 'The lecturer is talking about the fracking process. Listen and complete the diagram with NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. (Label 1, "Water table", is the example.) (Ex. 4)',
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Label 2 (the deep layer of rock)', correctAnswer: 'shale', explanation: lx('Nhãn 2', '', ['a lot of gas is found inside a type of rock called \'shale\'', 'When the drill reaches the shale, which is where the gas is, it turns sideways'], 'Lớp đá nơi giếng rẽ ngang.') },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Label 3 (the small breaks in the rock)', correctAnswer: 'fissures / fissure', explanation: lx('Nhãn 3', '', "These small breaks in the rock are known as 'fissures', and these fissures release the gas from the shale") },
          { questionNumber: 3, type: 'fill-blank', questionText: 'Label 4 (what comes up the well)', correctAnswer: 'gas', explanation: lx('Nhãn 4', '', 'these fissures release the gas from the shale', 'Mũi tên đi lên giếng → khí (gas) thoát ra.') },
        ],
      }],
    },
    {
      ref: 'M2-U06-L4', title: 'Mindset 2 · Unit 6 — Fracking in different countries',
      description: 'The lecturer talks about fracking in different countries.', partNumber: 4, audioFile: 'Mindset_L2_52.mp3', transcript: T[52],
      questionGroups: [
        qFill(1, 'Listen and complete the sentences with the quantifier from the box which correctly reflects what the lecturer says: a little, more, all, every, few, fewer, a lot of, many, less, much, some, several. (Ex. 6)', [
          ['In Canada, ______ shale gas has been found in various areas.', 'a lot of', lx('Canada', '', 'a huge amount of shale gas has been found in many areas of the country', 'a huge amount = a lot of (gas không đếm được).')],
          ['Only a ______ Canadian regions have allowed fracking to take place.', 'few', lx('Các vùng của Canada', '', "most regions haven't allowed fracking to take place", 'regions đếm được; "only a few".')],
          ['In the USA, ______ of the requirement for gas is met by shale gas.', 'some', lx('Mỹ', '', 'shale gas now provides around a quarter of all gas used in the US', 'Một phần tư → some (không phải all/much).')],
          ['A great deal ______ shale gas is being produced in Australia now than a decade ago.', 'more', lx('Úc', '', "it's over 20 times greater than it was ten years ago", 'a great deal more… than.')],
          ['If fracking takes place in the UK, people might save ______ money on their gas bills.', 'a little', lx('Anh', '', 'gas bills could be 5% lower', '5% → chỉ một ít (money không đếm được).')],
          ['There are far ______ people per kilometre in the USA than in the UK.', 'fewer', lx('Mật độ dân số', '', 'in the USA there are on average only about 40 people per square kilometre, in the UK there are almost 250 people', 'people đếm được → fewer.')],
        ], 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U06-L5', title: 'Mindset 2 · Unit 6 — The benefits of fracking',
      description: 'The lecturer talks about the benefits of fracking.', partNumber: 4, audioFile: 'Mindset_L2_53.mp3', transcript: T[53],
      questionGroups: [
        qMcq(1, 'Listen to the first part of the lecture and choose the correct answer, A, B or C. (Ex. 8)', [
          ['Those who are in favour of fracking say that the main benefit is', ['better energy supply.', 'lower energy bills.', 'increased electricity generation.'], 'B', lx('Người ủng hộ fracking nói lợi ích chính là', '', ['the economic benefit to the consumer is usually seen as more significant', 'energy prices will come down… according to supporters of fracking'], 'supporters = those in favour; more significant = main; prices come down = lower bills. A: có nhắc nhưng không phải lợi ích chính; C: không nói "increased".')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U06-L6', title: 'Mindset 2 · Unit 6 — Benefits: jobs and the environment',
      description: 'The lecturer talks about economic activity and environmental benefits.', partNumber: 4, audioFile: 'Mindset_L2_54.mp3', transcript: T[54],
      questionGroups: [
        qMcq(1, 'Underline the important words and phrases in the question, then listen and choose the correct answer, A, B or C. (Ex. 11)', [
          ['When fracking starts in a new location', ['local businesses lose many of their employees.', 'companies bring in most of the workers needed.', 'it creates more opportunities for businesses in the area.'], 'C', lx('Khi fracking bắt đầu ở nơi mới', '', 'When a new area is developed, the local economy benefits, with increases in services to the fracking company', 'A: bài nói lao động mới tuyển từ dân địa phương, không nói họ rời doanh nghiệp khác. B: "companies often bring their own workers" — không nói "most".')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U06-L7', title: 'Mindset 2 · Unit 6 — Benefits for the environment',
      description: 'The lecturer talks about the environmental benefits claimed by supporters.', partNumber: 4, audioFile: 'Mindset_L2_55.mp3', transcript: T[55],
      questionGroups: [
        qMcq(1, 'Listen to the next part of the lecture and choose the correct answer, A, B or C. (Ex. 13)', [
          ['Although burning gas produces carbon dioxide,', ['it does not produce chemicals which are harmful to the body.', 'the amount produced is slightly less than from coal and oil.', 'it produces much less water than coal and oil burning produces.'], 'A', lx('Dù đốt khí sinh ra CO2,', '', 'Burning coal and oil also produces sulphur and mercury, which can be very dangerous to health if breathed in', 'Khí đốt không sinh ra các chất độc này. B sai: "far less… up to 50% less" (không phải slightly). C nói về nước dùng trong sản xuất, không phải nước sinh ra.')],
          ['Some people think that using more gas from fracking to produce energy means that', ['50% less electricity will be produced than now.', 'more water can be used in the production of coal and oil.', 'there will be more time to work on environmentally friendly sources of energy.'], 'C', lx('Một số người cho rằng dùng nhiều khí hơn nghĩa là', 'Cuối đoạn.', 'One final benefit could be its use as a bridge to carbon-free energy… the development of renewable sources of energy can take longer', '50% là lượng CO2, không phải điện.')],
        ], 'Questions 1–2'),
      ],
    },
    {
      ref: 'M2-U06-L8', title: "Mindset 2 · Unit 6 — People's concerns about fracking",
      description: "The lecturer talks about people's concerns about fracking.", partNumber: 4, audioFile: 'Mindset_L2_56.mp3', transcript: T[56],
      questionGroups: [
        qMcq(1, 'Listen and choose the correct answer, A, B or C. (Ex. 14)', [
          ['One of the environmental concerns is that', ['increased use of shale gas will significantly raise carbon dioxide levels.', 'using shale gas in some areas will not benefit the environment overall.', 'countries that use shale gas will still use high levels of oil and natural gas.'], 'B', lx('Một mối lo về môi trường', '', "although countries which produce shale gas will use less coal and oil, the use of coal and oil will still continue to increase in other places, so globally there will be little or no benefit to the environment", 'C sai: các nước dùng khí đá phiến sẽ dùng ÍT than và dầu hơn.')],
          ['Fracking may not be economically beneficial because', ['it can reduce the value of homes in the areas where it takes place.', 'after five years of fracking, production can fall significantly.', 'the levels of gas in the ground are unlikely to be sustainable.'], 'A', lx('Fracking có thể không có lợi về kinh tế vì', '', "there's good evidence that house prices fall", 'B là một mối lo kinh tế khác nhưng chỉ "can drop… to as little as 10% in five years" — Answer Key chọn A.')],
          ['One medical concern related to fracking is that', ['the quality of the water supply in some areas can be badly affected.', 'poor air quality causes breathing problems in healthy people.', 'workers are passing on illnesses to local people.'], 'A', lx('Một mối lo về sức khỏe', '', ['the chemicals can leak into the drinking water supply', 'seeing brown water and mud coming out'])],
          ['Fracking has not been able to take place in some places because', ['local people have managed to prevent it.', 'the authorities are waiting for better information about its effects.', 'some countries want to follow the example of France.'], 'B', lx('Fracking chưa thể diễn ra ở một số nơi vì', '', ["local, regional and national governments… announce that fracking won't start until they're quite sure that it's safe", "until there's enough evidence to assure its safety"], 'C: Pháp đã cấm hẳn — nhưng không nói nước khác muốn làm theo.')],
        ], 'Questions 1–4'),
      ],
    },
    {
      ref: 'M2-U06-L9', title: 'Mindset 2 · Unit 6 — Exam skills: the future of energy',
      description: 'The lecturer talks about the future of fracking and other forms of energy.', partNumber: 4, audioFile: 'Mindset_L2_57.mp3', transcript: T[57],
      questionGroups: [
        qMcq(1, 'The lecturer is talking about the future of fracking and other forms of energy. Listen and choose the correct answer, A, B or C. (Ex. 17)', [
          ['The problem with fracking is that it', ['has caused carbon dioxide levels to rise by more than a third.', 'will not help countries meet their energy requirements.', 'will make the world climate warmer by 1 degree Celsius.'], 'B', lx('Vấn đề của fracking là', 'Đầu bài.', "fracking isn't the answer to the growing worldwide need for energy", 'A, C: "over a third" và "almost one degree" là số liệu về CO2 và nhiệt độ nói chung, không phải do fracking.')],
          ['One result of climate change is', ['lower levels of rain in some parts of Europe.', 'serious problems for food production in some African regions.', 'increased risk of ice in populated areas by the sea.'], 'B', lx('Một hệ quả của biến đổi khí hậu', '', 'sub-Saharan Africa are expected to become hotter and drier, with deserts growing in area and seriously affecting farmland', 'A sai: north-west Europe "warmer and wetter". C sai: băng tan, nước biển dâng → lũ.')],
          ['A reason renewable energy sources are not being developed quickly is that', ['fracking is the best way to reduce global warming at the moment.', 'governments want to find other long-term solutions.', 'energy companies are afraid the cost will affect their businesses.'], 'C', lx('Lý do năng lượng tái tạo phát triển chậm', '', "energy companies don't want to lose customers by asking them to pay more", 'B sai: chính phủ thường nghĩ "short-term answers".')],
          ['To develop renewable sources further', ['commercial organisations need external help.', 'governments need to produce less gas and oil.', 'countries should work together to change their economies.'], 'A', lx('Để phát triển nguồn tái tạo', '', "it's important for international organisations like the United Nations and national governments to support the development of renewable resources", 'Các công ty năng lượng cần sự hỗ trợ từ bên ngoài (external help).')],
          ['Environmental groups believe that', ['fracking can help reduce global warming in the short term.', 'non-renewable sources can continue alongside renewable sources.', 'only renewable sources will be able to provide energy in the future.'], 'C', lx('Các nhóm môi trường tin rằng', 'Cuối bài.', ['They want to see continued action and are trying to persuade governments to develop wind, wave and solar power', 'coal, oil and gas will run out one day'], 'A là ý "may well be true" của người giảng, không phải của các nhóm môi trường.')],
        ], 'Questions 1–5'),
      ],
    },
  ],
};
