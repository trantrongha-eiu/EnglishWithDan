// Mindset for IELTS Level 2 — Unit 2: Leisure and recreation (Reading pp. 28–33 · Listening pp. 39–41)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qMulti, qMatch, qTable, html } = require('../dsl');
const { lx } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt } = require('./_text');

const SLOT = 1; // sách của lớp: Unit 1–2 → Sổ 1

const ALI = txt('u02-ali');
const SERENA = txt('u02-serena');
const BECKHAM = txt('u02-beckham');
const FOOTBALL = txt('u02-football');
const T11 = txt('u02-t11');
const T12 = txt('u02-t12');
const T13 = txt('u02-t13');
const T14 = txt('u02-t14');
const T15 = txt('u02-t15');
const T16 = txt('u02-t16');
const ALL = [ALI, SERENA, BECKHAM, FOOTBALL, T11, T12, T13, T14, T15, T16];

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const mapQs = (n, qs) => qs.map(([text, ans, ex], i) => ({ questionNumber: n + i, type: 'map-labelling', questionText: text, correctAnswer: ans, explanation: ex }));
// Map labelling on listening.html: 'map' group = picture + drag-drop chips (the stored answer is the chip text).
const mapGroup = (title, instruction, image, letters, qs) => ({
  groupType: 'map', groupTitle: title, instruction, imageUrl: image,
  dragDropConfig: { text: '', words: letters.split('') }, questions: qs,
});

const ROADS = ['bend', 'crossroads', 'flyover', 'junction', 'roundabout', 'traffic lights'];
const SPORTS = ['gymnastics', 'basketball', 'weightlifting', 'badminton', 'table tennis'];

module.exports = {
  n: 2,
  title: 'Leisure and recreation',
  titleVi: 'Thể thao và giải trí',
  pages: '28–33, 39–41',
  outcomes: [
    'Reading: phân biệt câu hỏi về sự kiện (factual) và câu hỏi về ý kiến người viết (opinion); multiple choice (chọn 1 và chọn 2); global understanding',
    'Grammar: past simple và past continuous',
    'Listening: chỉ đường và điền bản đồ; nối mô tả với môn thể thao; điền bảng',
    'Từ vựng thể thao, thi đấu, đường sá (Sổ 1)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: sporting legends',
      titleEn: 'Lead-in · Sporting legends quiz (pp. 28–29)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Nói về các huyền thoại thể thao và môn thể thao của họ', 'Làm quen dạng multiple choice: đáp án luôn nằm trong bài đọc, không kiểm tra kiến thức chung'],
      theory: [
        card('Multiple choice trong Reading', 'Multiple-choice questions', {
          usage: ['Bài thi Reading có dạng câu hỏi trắc nghiệm như quiz này, nhưng **đáp án luôn nằm trong bài đọc** — không kiểm tra kiến thức chung của bạn.', 'Đừng chọn theo hiểu biết riêng; hãy tìm bằng chứng trong bài.'],
        }),
      ],
      vocab: vocabFile('u02-reading', ALL),
      ex: [
        match('Sporting legends (Ex. 1)', 'Which sport are/were these people famous for?', [
          ['Muhammad Ali', 'boxing'], ['Michael Jordan', 'basketball'], ['Serena Williams', 'tennis'], ['David Beckham', 'football'], ['Jack Nicklaus', 'golf'],
        ]),
        mcq('Sporting legends quiz (Ex. 3)', 'With a partner, try and answer the multiple-choice quiz.', [
          ['In what year did Serena Williams first become World Number 1?', ['1995', '2002', '2007'], 'B'],
          ['How many major championships did Jack Nicklaus win during his career?', ['18', '21', '12'], 'A'],
          ['How old was Muhammad Ali when he started training?', ['21', '12', '8'], 'B', 'Bài đọc ở buổi Reading: "Muhammad Ali began training at just 12 years old".'],
          ['How long was David Beckham captain of the England team?', ['3 years', '10 years', '6 years'], 'C'],
          ['How tall is Michael Jordan?', ['1.98 m', '1.70 m', '1.82 m'], 'A'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: facts, opinions & multiple choice',
      titleEn: 'Facts and opinions · Approaching the question · Global understanding · Exam skills (pp. 29–33)',
      minutes: 55,
      objectives: ['Phân biệt câu hỏi hỏi sự kiện và câu hỏi hỏi ý kiến người viết', 'Áp dụng quy trình 5 bước để trả lời multiple choice', 'Không chọn đáp án chỉ vì có từ giống bài — tìm từ đồng nghĩa', 'Chọn tiêu đề phù hợp cho cả bài (global understanding)'],
      theory: [
        card('Sự kiện và ý kiến', 'Facts and opinions', {
          usage: ['Có hai loại câu hỏi: hỏi **thông tin sự kiện** (năm, tên, con số…) và hỏi **ý kiến của người viết** (why does the writer think…).', 'Câu hỏi ý kiến: nhiều phương án nghe có vẻ đúng → chọn phương án **phù hợp nhất** với toàn bộ ý của người viết.', '**Từ trùng với bài thường là bẫy**: "appeal", "successful athlete" xuất hiện trong bài nhưng A, C không phải đáp án đúng.'],
        }),
        card('Quy trình làm bài', 'Approaching the question', {
          formula: ['① Đọc kỹ **instructions** → ② đọc bài để **hiểu ý chung** → ③ đọc lại câu hỏi, gạch chân **key words** (ngày, tên…) → ④ **scan** tìm key words hoặc từ đồng nghĩa → đọc quanh chỗ đó → chọn đáp án → ⑤ kiểm tra nhanh vì sao các phương án khác **sai**.'],
          usage: ['Đọc kỹ đề: số chữ cái cần chọn có thể thay đổi (**Choose TWO letters**).'],
        }),
        card('Global understanding', 'Global understanding', {
          usage: ['Câu hỏi kiểm tra hiểu **cả bài** (tiêu đề tốt nhất, mục đích của bài).', 'Đừng chọn dựa trên **một đoạn**: tiêu đề chỉ khớp một đoạn (vd. chỉ nói về rắc rối) là bẫy.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U02-R1', title: 'Serena Williams — Choose TWO letters (Ex. 7)', note: '3 câu, mỗi câu chọn 2 đáp án — tìm từ đồng nghĩa.' },
        { ref: 'reading:M2-U02-R2', title: 'Exam skills: A brief history of football (Ex. 15)', note: '4 câu multiple choice A, B, C.' },
      ],
      ex: [
        mcq('Facts and opinions: Muhammad Ali (Ex. 4)', 'Read these paragraphs and answer the questions which follow. Choose the correct letter, A, B or C.', [
          ['Why does the writer think that Muhammad Ali is still considered a legend?', ['because he is a successful athlete', 'because of several factors, not just his abilities as a boxer', 'because he has great appeal'], 'B', '"there was much more to this man\'s appeal. Not only was he a successful athlete, but he was also well known for his strong work ethic and fearless approach…" → nhiều yếu tố, không chỉ tài boxing. A, C dùng từ trùng với bài (successful athlete, appeal) nhưng chỉ là một phần ý.'],
          ['What name did Muhammad Ali give himself during his career?', ['Cassius Clay', 'The Greatest', 'The Champion'], 'B', '"He referred to himself as \'The Greatest\'" (referred to himself as = gave himself the name). Cassius Clay là tên khai sinh.'],
        ], { stimulus: stim(ALI, 'Muhammad Ali (p. 29)') }),
        cat('Factual or opinion? (Ex. 5)', 'Which question is factual and which asks for the writer\'s opinion?', { f: 'Factual information', o: "The writer's opinion" }, [
          ['Why does the writer think that Muhammad Ali is still considered a legend?', 'o', '"Why does the writer think…" → ý kiến người viết.'],
          ['What name did Muhammad Ali give himself during his career?', 'f', 'Hỏi một sự kiện (cái tên).'],
        ]),
        gap('Approaching the question (Ex. 6)', 'Complete the flow-chart showing one approach with words from the box: instructions, understand, key, questions, scan, wrong.', [
          ['① Read the ____ carefully.', 'instructions|questions', 'Answer Key chấp nhận cả instructions và questions.'],
          ['② Read the text to understand the general meaning. ③ Read the questions again and underline the ____ words, e.g. dates, names etc.', 'key'],
          ['④ ____ the text for the key words or synonyms. Read around the key words in the text. Re-read the questions and choose an answer.', 'Scan|scan'],
          ['⑤ Quickly check the other options are ____ and make your final choices.', 'wrong'],
        ]),
        mcq('Global understanding: David Beckham (Ex. 14)', 'Read the text and choose the correct letter, A, B or C. What is the best title for this article?', [
          ['What is the best title for this article?', ['What has Beckham achieved during his career?', 'Despite all the media attention, was Beckham a good football player?', 'What problems did Beckham have during his football career?'], 'B', 'Cả bài: câu đầu "Despite Beckham\'s good looks and famous marriage… he was actually an exceptionally good footballer", rồi đến thành tích, khó khăn và sự nghiệp sau giải nghệ. A chỉ khớp phần thành tích; C chỉ khớp đoạn World Cup 1998.'],
        ], { stimulus: stim(BECKHAM, 'David Beckham (p. 32)') }),
        match('Synonyms in the questions (Ex. 8)', 'Look at exercise 7 again. Match the words in the text with the words used in the questions.', [
          ['powerful (text)', 'strong (question)'], ['determination', 'self-belief'], ['be important', 'focused on'], ['training to be tennis stars', 'tennis training'],
          ['education', 'studies'], ['speed of thought', 'thinks quickly'], ['powerful shots', 'can hit the ball hard'],
        ], { stimulus: stim(SERENA, 'Serena Williams (p. 30)') }),
        cat('Complete the sentence or answer the question? (Ex. 8)', 'Which questions in exercise 7 ask you to complete the sentence and which ask you to answer the question?', { c: 'Complete the sentence', q: 'Answer the question' }, [
          ['According to the writer, Serena has become so famous because …', 'c'], ["During Serena's upbringing, what did her father consider to be important?", 'q'], ['Her tennis game is so successful because …', 'c'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: past simple and past continuous',
      titleEn: 'Grammar focus: past simple / past continuous (p. 31)',
      minutes: 30,
      objectives: ['Nhận ra các thì quá khứ trong bài đọc', 'Dùng past continuous cho hành động nền (dài) và past simple cho hành động ngắn, đã xong'],
      keyLanguage: [
        '…**whilst she was playing** a match in the 2013 Australian Open, Serena **hit** a serve at a speed of just under 207 km per hour.',
        '**Past continuous** (was/were + V-ing) = hành động **nền, kéo dài** (playing a match); **past simple** = hành động **ngắn, đã hoàn tất** xen vào (hit a serve). Cả hai đều đã kết thúc.',
        'Hay đi với **while / whilst** (+ past continuous) và **when** (+ past simple).',
      ],
      theory: [
        card('Past simple và past continuous', 'Past simple / past continuous', {
          formula: ['S + was/were + V-ing (hành động nền) … S + V-ed (hành động ngắn)', 'PAST ——— playing a tennis match ——— PRESENT; ↑ I hit a serve'],
          examples: [['Whilst she was playing basketball, her phone rang.', 'đang chơi (nền) → điện thoại reo (ngắn).'], ['It started to rain in the middle of the race.', 'Một hành động ngắn → past simple.'], ['It was raining during the race.', 'Kéo dài suốt cuộc đua → past continuous.']],
        }),
      ],
      links: [{ grammar: 'past-simple', title: 'Past Simple', note: 'hành động ngắn, đã xong' }, { grammar: 'past-continuous', title: 'Past Continuous', note: 'hành động nền đang diễn ra' }],
      ex: [
        cat('Past tenses in the text (Ex. 9)', 'Say which tenses are used in the text about Serena Williams.', { y: 'Used in the text', n: 'Not used in the text' }, [
          ['past simple', 'y', 'was born, moved, started, hit…'], ['past continuous', 'y', 'were training, was playing'], ['present perfect', 'y', 'has dominated, has become, has won'],
          ['past perfect', 'n'], ['future simple', 'n'],
        ], { stimulus: stim(SERENA, 'Serena Williams (p. 30)') }),
        mcq('Two actions in the past (Ex. 10–11)', '"… whilst she was playing a match in the 2013 Australian Open, Serena hit a serve at a speed of just under 207 km per hour …" Answer the questions.', [
          ['Which two past tenses are in the sentence?', ['was playing (past continuous) and hit (past simple)', 'was playing (past simple) and hit (past perfect)', 'both are past simple'], 'A'],
          ['Which is the long, continued action?', ['playing a match', 'hitting a serve'], 'A', 'Trận đấu kéo dài → nền.'],
          ['Which is the short, finished action?', ['hitting a serve', 'playing a match'], 'A', 'Cú giao bóng xảy ra trong chốc lát.'],
          ['Are both actions finished now?', ['Yes', 'No'], 'A', 'Cả hai đều ở quá khứ (2013).'],
          ['Which is another example of the past continuous in the text?', ['whilst they were training to be tennis stars', 'Serena was born on 26 September 1981', 'her family moved to California'], 'A'],
        ]),
        gap('Complete the rule (Ex. 11)', 'Complete this rule.', [
          ['When we use the simple past and the past continuous in the same sentence, we use the ____ to talk about the "background action" and the ____ to talk about the shorter, completed action.', ['past continuous', 'past simple|simple past']],
        ]),
        gap('Past continuous or past simple? (Ex. 12)', 'Complete the sentences by putting the verb in brackets in the correct form of the past continuous or past simple.', [
          ['Whilst she ____ (play) basketball, her phone ____ (ring).', ['was playing', 'rang'], 'Đang chơi (nền) → điện thoại reo (ngắn).'],
          ['He ____ (fall), while ____ (run) for the ball.', ['fell', 'running|he was running|was running'], 'Ngã (ngắn) trong khi đang chạy (nền). Sau "while" có thể lược chủ ngữ + be: while (he was) running.'],
          ['It ____ (start) to rain in the middle of the race.', 'started', 'Một thời điểm → past simple.'],
          ['It ____ (rain) during the race.', 'was raining', 'Kéo dài suốt cuộc đua → past continuous.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: directions, maps & tables',
      titleEn: 'Lead-in · Completion/matching tasks · Exam skills (pp. 39–41)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Hiểu từ vựng chỉ đường: bend, crossroads, flyover, junction, roundabout, traffic lights', 'Nghe chỉ đường và điền vị trí trên bản đồ', 'Nối mô tả với môn thể thao bằng từ khóa', 'Điền bảng: nhìn thông tin có sẵn để đoán thông tin còn thiếu'],
      images: ['media:m2u02-roads.jpg|Ex. 1 (p. 39): road diagrams 1–6', 'media:m2u02-map.jpg|Ex. 3 (p. 40): map — boxes numbered 1–6'],
      theory: [
        card('Điền bản đồ', 'Completion/matching tasks: maps', {
          usage: ['Trước khi nghe: **nhìn kỹ bản đồ**, xác định điểm xuất phát và các loại địa điểm cần tìm.', 'Khi nghe: bám các cụm **turn left, go straight on/over, carry on, after the flyover…** và đoán thông tin tiếp theo.', 'Cẩn thận lời phủ định: "You see a sign to Hinton saying turn left… **don\'t take that one**".'],
        }),
        card('Nối mô tả', 'Matching descriptions', {
          usage: ['Tập trung vào **từ khóa** cho biết đang mô tả cái gì — và cái gì **không** phải: goal, run, kick → football; ride, wheel, race → cycling.', 'shuttlecock, smaller playing area → badminton; very tall, run, throw → basketball.'],
        }),
        card('Điền bảng', 'Completing tables', {
          usage: ['Nhìn thông tin **đã có** trong bảng để biết cần nghe gì: "nets" đã có ở cột basketball → câu 2 là một đồ dùng khác cho basketball.', 'Viết **đúng từ nghe được**, đúng số từ cho phép; đáp án theo **thứ tự** bài nghe.'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U02-L1', title: 'Directions 1–6 (Ex. 2)', note: 'Mỗi câu chỉ đường nói về loại đường nào?' },
        { ref: 'listening:M2-U02-L2', title: 'Map: from South Hinton to North Hinton (Ex. 3)', note: 'Kéo chữ A–F vào ô 1–6 trên bản đồ.' },
        { ref: 'listening:M2-U02-L3', title: 'Descriptions of sports (Ex. 4)', note: 'Mô tả 1–5 là môn nào?' },
        { ref: 'listening:M2-U02-L4', title: 'Preparing the rooms (Ex. 5)', note: 'Điền môn thể thao vào bảng — một môn xuất hiện hai lần.' },
        { ref: 'listening:M2-U02-L5', title: 'Exam skills: the equipment (Ex. 6)', note: 'Điền bảng, ONE WORD ONLY.' },
        { ref: 'listening:M2-U02-L6', title: 'Who is in charge? (Ex. 7)', note: 'Nối sự kiện với người phụ trách A–D.' },
      ],
      vocab: vocabFile('u02-listening', [T11, T12, T13, T14, T15, T16, ALI, SERENA, BECKHAM, FOOTBALL]),
      ex: [
        match('Roads and directions (Ex. 1)', 'Write the correct word under each diagram to check your understanding of language connected with road travel and directions.', [
          ['Diagram 1', 'crossroads', 'Hai đường cắt nhau.'], ['Diagram 2', 'junction', 'Ngã ba (một đường nhập vào đường khác).'], ['Diagram 3', 'bend', 'Khúc cua.'],
          ['Diagram 4', 'flyover', 'Cầu vượt.'], ['Diagram 5', 'traffic lights', 'Đèn giao thông.'], ['Diagram 6', 'roundabout', 'Vòng xuyến.'],
        ], { stimulus: picture('media:m2u02-roads.jpg', 'Ex. 1') }),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U02-R1',
      title: 'Mindset 2 · Unit 2 — Serena Williams',
      content: html(SERENA),
      questionGroups: [
        qMulti(1, 'Choose TWO letters, A–D. (Ex. 7)', 'According to the writer, Serena has become so famous because …', ['she is aggressive.', 'she has a strong tennis game.', 'she is very good at fashion.', 'she has self-belief.'], ['B', 'D'], [
          'Đoạn 1: "known for her determination, **powerful game**…" → powerful = strong → B.',
          'Đoạn 1: "known for her **determination**" → determination = self-belief → D. BẪY: C — bài có chữ "fashion" (unique fashion sense) nhưng không nói cô nổi tiếng vì giỏi thời trang; A không có trong bài.',
        ], 'Questions 1–2'),
        qMulti(3, 'Choose TWO letters, A–D.', "During Serena's upbringing, what did her father consider to be important?", ['staying at home', 'tennis training', 'her studies', 'training her to be a star'], ['B', 'C'], [
          'Đoạn 2: "Mr Williams was determined that his daughters would succeed in the tennis world" → tennis training.',
          'Đoạn 2: "he was also focused on giving them a good **education**… he also took responsibility for their home-schooling" → her studies. BẪY: A dùng chữ "home" (home-schooling = học ở nhà, không phải "ở nhà"); D dùng lại "training to be tennis stars".',
        ], 'Questions 3–4'),
        qMulti(5, 'Choose TWO letters, A–D.', 'Her tennis game is so successful because …', ['she thinks quickly.', 'she can hit the ball hard.', 'she is the third fastest player in the world.', 'her opponents are nervous of her.'], ['A', 'B'], [
          'Đoạn 3: "rapid movement, **speed of thought**…" → thinks quickly.',
          'Đoạn 3: "**powerful shots**" → can hit the ball hard. BẪY: C — "the third fastest" là tốc độ giao bóng trong số các tay vợt nữ, không phải "fastest player in the world"; D — "put her opponents under pressure" không có nghĩa là họ sợ cô.',
        ], 'Questions 5–6'),
      ],
    },
    {
      ref: 'M2-U02-R2',
      title: 'Mindset 2 · Unit 2 — A brief history of football',
      content: html(FOOTBALL),
      questionGroups: [
        qMcq(1, 'Choose the correct letter, A, B or C. (Ex. 15)', [
          ['Where can the first traces of football be found?', ['Egypt', 'China', 'England'], 'B', 'Đoạn 1: "Aspects of the game can be **traced** as early as the second and third centuries BC in **China**". BẪY: Egypt chỉ nằm trong danh sách nước; England là nơi trò chơi hiện đại phát triển.'],
          ['Why did Edward II ban football in the 1300s?', ['because it was too violent and death was common', 'because he was preparing to go to war with China', "because people weren't practising archery"], 'C', 'Đoạn 2: "Edward II banned the sport because people were playing football **rather than practising archery**". BẪY: A đúng là trận đấu bạo lực nhưng không phải lý do cấm; B — chiến tranh với Scotland, không phải China.'],
          ['Before rules were established in the 1800s, which of these activities was considered normal?', ['stealing from opponents', "destroying players' property", 'being violent towards the referee'], 'B', 'Đoạn 4: "it was considered normal to hit players on the opposite team and to **damage their possessions**" (damage possessions = destroy property). C sai: "no referees".'],
          ['Women started playing football because', ['the ban was lifted in 1971.', 'they started to work during the First World War.', 'in 1991 there was the first Women\'s World Cup.'], 'B', 'Đoạn cuối: "An increase in women playing the sport began during the First World War, when women did jobs traditionally done by men. Those working in places like factories regularly met to play." A, C xảy ra sau này.'],
        ], 'Questions 1–4'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U02-L1', title: 'Mindset 2 · Unit 2 — Directions',
      description: 'Six short directions.', partNumber: 2, audioFile: 'Mindset_L2_11.mp3', transcript: T11,
      questionGroups: [
        qMatch(1, 'Listen to directions 1–6 and write the correct word from the box, A–F. (Ex. 2)', ROADS, [
          ['Direction 1', 'C', lx('Chỉ dẫn 1', '', 'Stay in the middle lane so that you can go over the motorway', 'go over the motorway → flyover.')],
          ['Direction 2', 'F', lx('Chỉ dẫn 2', '', "You'll have to wait on the right till it changes for you to turn", 'chờ đến khi "đổi màu" → traffic lights.')],
          ['Direction 3', 'E', lx('Chỉ dẫn 3', '', 'Go round and take the third exit on the right', 'go round, third exit → roundabout.')],
          ['Direction 4', 'A', lx('Chỉ dẫn 4', '', 'Slow down here because it goes to the left quite sharply', 'đường cong gấp sang trái → bend.')],
          ['Direction 5', 'B', lx('Chỉ dẫn 5', '', 'When you get there, go straight across', 'đi thẳng qua → crossroads.')],
          ['Direction 6', 'D', lx('Chỉ dẫn 6', '', 'When you get to the end of this road, take the left turn', 'cuối đường phải rẽ → junction (ngã ba).')],
        ], { title: 'Questions 1–6', optionsTitle: 'Words', type: 'matching', reuse: false }),
      ],
    },
    {
      ref: 'M2-U02-L2', title: 'Mindset 2 · Unit 2 — Directions to North Hinton Sports Centre',
      description: 'The Director of Sports gives directions from one sports centre to another.', partNumber: 2, audioFile: 'Mindset_L2_12.mp3', transcript: T12,
      questionGroups: [mapGroup('Questions 1–6', 'Listen to the Director of Sports giving directions from one sports centre to another. Write the letters in the correct position on the map: A roundabout, B junction, C traffic lights, D crossroads, E flyover, F bend. (Ex. 3)', 'media:m2u02-map.jpg', 'ABCDEF', mapQs(1, [
        ['Box 1', 'C', lx('Ô 1 (góc West Road, gần North Hinton)', 'Cuối bài.', 'The turning for Hinton is just after that at the traffic lights… Turn right into West Road', 'C = traffic lights.')],
        ['Box 2', 'F', lx('Ô 2', '', 'Then you go left round a bend and just after the bend you see a petrol station on the left', 'F = bend.')],
        ['Box 3', 'A', lx('Ô 3 (trên Lily Road)', 'Đầu đường đi.', ['come out of our sports centre into Lily Road. Turn left and go about two hundred metres and you come to a roundabout', "so don't take that one. Go straight over that roundabout"], 'A = roundabout.')],
        ['Box 4', 'D', lx('Ô 4', '', ['Go straight over that roundabout and you come to a crossroads', "The left turn here also takes you into the centre, so don't take that one either"], 'D = crossroads.')],
        ['Box 5', 'E', lx('Ô 5 (qua đường cao tốc)', '', 'The road goes up onto a flyover over the motorway to Longchester', 'E = flyover.')],
        ['Box 6', 'B', lx('Ô 6 (giao Bramley Road)', '', 'After the flyover, you come to the junction with Bramley Road. This is where you go left', 'B = junction.')],
      ]))],
    },
    {
      ref: 'M2-U02-L3', title: 'Mindset 2 · Unit 2 — Descriptions of sports',
      description: 'Five short descriptions of sports.', partNumber: 2, audioFile: 'Mindset_L2_13.mp3', transcript: T13,
      questionGroups: [
        qMatch(1, 'Listen to the descriptions of sports 1–5. Which sport, A–E, is each speaker describing? (Ex. 4)', SPORTS, [
          ['Description 1', 'D', lx('Mô tả 1', '', ['This game is similar to tennis', 'people hit a shuttlecock - a light object with feathers - instead of a ball'], 'shuttlecock → badminton.')],
          ['Description 2', 'A', lx('Mô tả 2', '', 'You have to be very strong in your arms and legs but also light and flexible… you use your whole body all the time', 'light and flexible, whole body → gymnastics.')],
          ['Description 3', 'E', lx('Mô tả 3', '', 'the playing area is so small and the ball is so light', 'sân nhỏ, bóng nhẹ, tay nhanh → table tennis.')],
          ['Description 4', 'C', lx('Mô tả 4', '', ['very strong arms', "you don't move around to do it"], 'sức mạnh, đứng yên → weightlifting.')],
          ['Description 5', 'B', lx('Mô tả 5', '', 'People who play this sport are usually very tall… run a lot, move quickly and throw very well', 'tall, run, throw → basketball.')],
        ], { title: 'Questions 1–5', optionsTitle: 'Sports', type: 'matching' }),
      ],
    },
    {
      ref: 'M2-U02-L4', title: 'Mindset 2 · Unit 2 — Preparing the rooms',
      description: 'The Director of Sports gives instructions for preparing three rooms.', partNumber: 2, audioFile: 'Mindset_L2_14.mp3', transcript: T14,
      questionGroups: [
        qTable('Write the sports in the correct gap in the table: badminton, basketball, gymnastics, table tennis, weightlifting. One of the sports appears twice. (Ex. 5)',
          ['North Hinton Sports Centre', 'Dean Room', 'Carsley Room', 'Forster Room'],
          [['Sport event – morning', '__Q1__', '__Q2__', '__Q3__'], ['Sport event – afternoon', '__Q4__', '__Q5__', '__Q6__']],
          { 1: 'badminton', 2: 'gymnastics', 3: 'weightlifting', 4: 'basketball', 5: 'table tennis', 6: 'weightlifting' }, {
            1: lx('Phòng Dean, buổi sáng', '', 'The Dean Room is for the badminton competition'),
            2: lx('Phòng Carsley, buổi sáng', '', 'the Carsley Room is where the gymnastics will be'),
            3: lx('Phòng Forster, buổi sáng', '', 'We have to get the Forster Room ready for the weightlifting, which is taking place in there all day'),
            4: lx('Phòng Dean, buổi chiều', '', ['in the afternoon, the table tennis is taking place in the Dean Room, so you\'ll need to - oh, wait a minute', 'actually, the basketball will be in the Dean Room'], 'BẪY: table tennis bị sửa lại — người nói đổi kế hoạch.'),
            5: lx('Phòng Carsley, buổi chiều', '', 'That means the table tennis will be taking place in the Carsley Room in the afternoon'),
            6: lx('Phòng Forster, buổi chiều', '', 'which is taking place in there all day', 'all day → môn weightlifting xuất hiện hai lần.'),
          }, 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U02-L5', title: 'Mindset 2 · Unit 2 — Exam skills: the equipment',
      description: 'The last part of the message: the equipment for each sport.', partNumber: 2, audioFile: 'Mindset_L2_15.mp3', transcript: T15,
      questionGroups: [
        qTable('Listen to the last part of the message and complete the table with the pieces of equipment. Write ONE WORD ONLY in each gap. (Ex. 6)',
          ['Sport event', 'Equipment'],
          [['basketball', 'nets, __Q2__'], ['gymnastics', 'vaulting horse, __Q3__, __Q4__, rings, pommel horse'], ['table tennis', 'tables, nets, __Q5__'], ['badminton', '__Q1__, racquets, shuttlecocks'], ['weightlifting', 'barbells, weights, __Q6__, chalk']],
          { 1: 'nets', 2: 'balls', 3: 'mats', 4: 'bars', 5: 'bats', 6: 'bench' }, {
            1: lx('Cầu lông', 'Đầu bài.', 'For the badminton in the Dean Room, there are two nets in the storeroom to set up'),
            2: lx('Bóng rổ', '', 'For the basketball in the afternoon, you only need to bring in the balls because the nets are always up', 'nets đã có trong bảng.'),
            3: lx('Thể dục dụng cụ', '', 'Put one mat in front and another behind the horse, and have some other mats ready'),
            4: lx('Thể dục dụng cụ', '', 'Then on the side, set up the bars for the gymnastics'),
            5: lx('Bóng bàn', '', "there's a box of bats there, so bring those in as well"),
            6: lx('Cử tạ', '', 'The bench for the bench press should be in there already'),
          }, 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U02-L6', title: 'Mindset 2 · Unit 2 — Who is in charge?',
      description: 'Jeff leaves another message for the three helpers.', partNumber: 2, audioFile: 'Mindset_L2_16.mp3', transcript: T16,
      questionGroups: [
        qMatch(1, 'Listen and write the correct organiser, A, B, C or D, next to events 1–6. (Ex. 7)', ['Steve', 'Amanda', 'Malik', 'Jeff'], [
          ['badminton', 'B', lx('Cầu lông', 'Buổi sáng.', 'Amanda… you also once did some training in the rules of badminton, so it might be best if you take that on', 'BẪY: Steve cũng thích badminton.')],
          ['gymnastics', 'A', lx('Thể dục dụng cụ', '', "I'll put Steve in charge of the gymnastics", 'BẪY: Amanda từng tập gymnastics.')],
          ['weightlifting (morning)', 'C', lx('Cử tạ buổi sáng', '', 'Malik can take care of the weightlifting in the morning')],
          ['basketball', 'C', lx('Bóng rổ', 'Buổi chiều.', ['perhaps Amanda, you can do the basketball. Actually, no', 'How about you do the basketball, Malik?'], 'BẪY: Amanda được nhắc trước rồi bị đổi.')],
          ['weightlifting (afternoon)', 'D', lx('Cử tạ buổi chiều', '', 'Then I can take over the weightlifting in the afternoon', 'Jeff (I). Steve chỉ thay tạm nếu Jeff đến muộn.')],
          ['table tennis', 'B', lx('Bóng bàn', '', 'So then, Amanda, you can do the table tennis')],
        ], { title: 'Questions 1–6', optionsTitle: 'Organisers', type: 'matching', reuse: true }),
      ],
    },
  ],
};
