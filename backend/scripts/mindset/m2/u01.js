// Mindset for IELTS Level 2 — Unit 1: The man-made environment (Reading pp. 8–13 · Listening pp. 21–23)
const { mcq, gap, match, cat, fix, passage, picture, card, qMcq, qMatch, qNote, qFill, lx, html } = require('../dsl');
const { vocabFile } = require('./_vocab');
const { txt, untitled } = require('./_text');

const SLOT = 1; // sách của lớp: Unit 1–2 → Sổ 1

const ANTILIA = txt('u01-antilia');
const HEARST = txt('u01-hearst');
const T02 = txt('u01-t02');
const T03 = txt('u01-t03');
const T04 = txt('u01-t04');
const T05 = txt('u01-t05');
const T06 = txt('u01-t06');
const T07 = txt('u01-t07');

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

module.exports = {
  n: 1,
  title: 'The man-made environment',
  titleVi: 'Nhà ở và công trình',
  pages: '8–13, 21–23',
  outcomes: [
    'Reading: skimming và scanning; short-answer questions; sentence completion; paraphrase',
    'Grammar: present simple và present continuous',
    'Listening: Section 1 — dự đoán loại thông tin, nghe số phức tạp và đánh vần, loại distractors trong multiple choice',
    'Từ vựng nhà ở, kiến trúc, mua bán nhà (Sổ 1)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: homes',
      titleEn: 'Lead-in · Skimming and scanning (pp. 8–9)',
      slot: SLOT,
      minutes: 30,
      objectives: ['Xếp từ vựng về nhà ở theo nhóm: vị trí, loại nhà, phong cách, phòng, bộ phận của phòng, vật liệu', 'Phân biệt skimming (đọc lấy ý chung) và scanning (tìm thông tin cụ thể)'],
      theory: [
        card('Skimming và scanning', 'Skimming and scanning', {
          usage: [
            '**Skim** = đọc lướt thật nhanh để nắm **ý chung** của bài; bỏ qua từ mới.',
            '**Scan** = quét mắt tìm **thông tin cụ thể**: tên riêng, con số, ngày tháng, từ khóa.',
            'Thời gian thi có hạn → skim để biết bố cục, rồi scan để tìm đáp án.',
          ],
        }),
      ],
      vocab: vocabFile('u01-reading', [ANTILIA, HEARST, T02, T03, T04, T05, T06, T07]),
      ex: [
        cat('Vocabulary: homes (Ex. 1)', 'A common topic in the exam is "home". Put these words under the correct heading.', {
          loc: 'Location', type: 'Building type', style: 'Style', rooms: 'Rooms', parts: 'Parts of a room', mat: 'Materials',
        }, [
          ['beach', 'loc'], ['city centre', 'loc'], ['mountains', 'loc'], ['countryside', 'loc'], ['remote island', 'loc'],
          ['apartment', 'type'], ['skyscraper', 'type'], ['bungalow', 'type'], ['mansion', 'type'], ['castle', 'type'], ['garage', 'type'],
          ['glamorous', 'style'], ['simple', 'style'], ['traditional', 'style'], ['modern', 'style'], ['spacious', 'style'],
          ['cellar', 'rooms'], ['gym', 'rooms'], ['dining room', 'rooms'],
          ['staircase', 'parts'], ['floor', 'parts'], ['ceiling', 'parts'], ['window', 'parts'],
          ['wood', 'mat'], ['marble', 'mat'], ['leather', 'mat'], ['stone', 'mat'],
        ]),
        cat('Skimming or scanning? (Ex. 3)', 'For each activity, decide whether you would use skimming or scanning.', { sk: 'skimming', sc: 'scanning' }, [
          ['looking up a word in the dictionary', 'sc', 'Tìm đúng một từ → scan.'],
          ['browsing the internet for the latest news stories', 'sk', 'Lướt xem có tin gì → skim.'],
          ['choosing a book from a library or bookshop', 'sk', 'Đọc lướt để biết sách nói về gì → skim.'],
          ['finding a particular news story in a newspaper', 'sc', 'Tìm một bài cụ thể → scan.'],
          ['finding the price of a product in a catalogue', 'sc', 'Tìm một con số → scan.'],
          ['looking through a magazine for an interesting article', 'sk', 'Lướt tìm bài hay → skim.'],
        ]),
        cat('What did you focus on when skimming? (Ex. 6)', 'When you were skim reading the text, which of these types of word did you focus on?', { y: 'Focus on these', n: 'Ignore these' }, [
          ['names', 'y', 'Tên riêng cho biết bài nói về ai, ở đâu.'], ['verbs', 'y'], ['adjectives', 'y'], ['numbers', 'y'],
          ['prepositions', 'n', 'Giới từ (in, on, at…) không mang ý chính.'], ['articles', 'n', 'Mạo từ (a, an, the) không mang ý chính.'],
        ]),
      ],
    },

    reading: {
      title: 'Reading: scanning, short answers & paraphrase',
      titleEn: 'Skimming and scanning · Paraphrasing · Short-answer questions · Completing sentences · Exam skills (pp. 9–13)',
      minutes: 55,
      objectives: ['Skim bài để nắm thứ tự thông tin', 'Scan tìm tên riêng, con số để trả lời short-answer questions', 'Nhận ra paraphrase (synonyms) giữa câu hỏi và bài đọc', 'Làm short-answer và sentence completion đúng giới hạn số từ'],
      theory: [
        card('Short-answer questions', 'Short-answer questions', {
          formula: ['Đọc kỹ giới hạn: **NO MORE THAN THREE WORDS AND/OR A NUMBER** → tối đa 3 từ và/hoặc 1 con số.', 'Đáp án lấy **nguyên từ trong bài**, không đổi từ.'],
          usage: ['Câu hỏi hỏi về **chi tiết sự kiện** (ai, cái gì, bao nhiêu…).', 'Đáp án thường xuất hiện **theo thứ tự** của bài.', 'Gạch chân từ khóa trong câu hỏi → scan bài tìm từ đó hoặc từ đồng nghĩa.'],
        }),
        card('Sentence completion', 'Completing sentences', {
          usage: ['Câu cho sẵn **paraphrase** ý trong bài: "accommodate a large number of ___" ↔ "designed to entertain **guests**".', 'Điền xong đọc lại cả câu: phải **đúng ngữ pháp**.'],
        }),
        card('Paraphrasing', 'Paraphrasing', {
          usage: ['Paraphrase = nói lại ý bằng từ khác, thường đơn giản và ngắn hơn.', 'Chìa khóa là **từ đồng nghĩa**: interior ↔ inside, visitors ↔ guests, extravagant ↔ expensive.'],
        }),
        card('Cách tìm đáp án nhanh', 'Locating the answer: one approach', {
          usage: ['Đọc câu hỏi trước để có chúng trong đầu khi đọc bài.', 'Hiểu đúng câu hỏi — gạch chân từ khóa.', 'Skim bài lấy ý chính → biết đại khái đáp án nằm ở đoạn nào, rồi đọc lại đoạn đó.', 'Bấm giờ: luyện tìm thông tin càng nhanh càng tốt.'],
        }),
      ],
      links: [
        { ref: 'reading:M2-U01-R1', title: 'Antilia — scanning, short answers, sentence completion, paraphrase (Ex. 7, 8, 10, 11)', note: '18 câu: scan tìm số liệu, trả lời ngắn, hoàn thành câu, nối câu paraphrase với đoạn A–F.' },
        { ref: 'reading:M2-U01-R2', title: 'Exam skills: Hearst Castle (Ex. 15)', note: '12 câu short-answer + sentence completion — bấm giờ!' },
      ],
      ex: [
        mcq('An overall title (Ex. 6)', 'Skim the text. What overall title would you give the text?', [
          ['Choose the best title.', ['Antilia: a billion-dollar home in Mumbai', 'The richest men in the world', 'How to design a garden'], 'A', 'Cả bài nói về ngôi nhà Antilia ở Mumbai (chủ nhà, vật liệu, tiện nghi, ý kiến). B chỉ là chi tiết ở đoạn A; C không có trong bài.'],
        ], { stimulus: stim(untitled(ANTILIA), 'The home in the photo (p. 9)') }),
        match('The order of information (Ex. 6)', 'Put the information in the order in which it appears in the passage.', [
          ['1st', 'the owner of the house', 'Đoạn A: Mukesh Ambani.'],
          ['2nd', 'the cost and address of the house', 'Đoạn A: more than one billion dollars; Altamount Road in Mumbai.'],
          ['3rd', 'the materials used for the interior', 'Đoạn B: marble floors, rare wood, fine rugs.'],
          ['4th', 'the facilities in the house', 'Đoạn C: garage, helipads, spa, gym, pools…'],
          ['5th', 'information about the theatre and ballroom', 'Đoạn D.'],
          ['6th', 'where the family live', 'Đoạn E: the living quarters are on the top floors.'],
          ['7th', 'opinions on the house', 'Đoạn F: experts criticise it; Mrs Ambani describes it.'],
        ], { stimulus: stim(untitled(ANTILIA), 'The home in the photo') }),
        match('Synonyms for paraphrasing (Ex. 9)', 'The key to paraphrasing is understanding synonyms and words or phrases with a similar meaning. Match these words and expressions.', [
          ['desirable facilities', 'health spa and libraries'],
          ['outside spaces', 'gardens'],
          ['inside', 'interior'],
          ['extravagant', 'expensive'],
          ['city', 'Mumbai'],
          ['visitors', 'guests'],
          ['equipped to make visitors feel welcome', 'designed to entertain guests'],
          ['expensive materials', 'rare wood and fine rugs'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: present simple and present continuous',
      titleEn: 'Grammar focus: present simple / present continuous (pp. 11–12)',
      minutes: 30,
      objectives: ['Biết khi nào dùng present simple, khi nào dùng present continuous', 'Nhận ra động từ chỉ trạng thái (believe, think…) không dùng thì tiếp diễn'],
      keyLanguage: [
        '**Present continuous** (am/is/are + V-ing): hành động **đang xảy ra lúc nói**, hành động **chưa kết thúc**, tình huống **tạm thời**: I **am renting** in the city centre for now.',
        '**Present simple**: hành động **lặp lại** (thói quen), **sự thật chung**, **ý kiến**: Every day his mum **cleans** the house. · Mrs Ambani **believes** that…',
        'Động từ chỉ trạng thái/ý kiến (believe, think = cho rằng, like, want, own…) thường **không** dùng ở thì tiếp diễn.',
      ],
      theory: [
        card('Present simple và present continuous', 'Present simple / present continuous', {
          formula: ['S + V(s/es) — present simple', 'S + am/is/are + V-ing — present continuous'],
          usage: ['Mindmap trong sách: present continuous ← temporary, an action which is not complete, happening at the time of speaking; present simple ← repeated actions, general facts, opinions.'],
          examples: [['Mukesh Ambani lives in Mumbai.', 'Sự thật chung → present simple (không dùng "is living").'], ['Currently, my mum is working in the study.', 'Đang diễn ra, tạm thời → present continuous.']],
        }),
      ],
      links: [{ grammar: 'present-simple', title: 'Present Simple', note: 'thói quen, sự thật, ý kiến' }, { grammar: 'present-continuous', title: 'Present Continuous', note: 'đang xảy ra, tạm thời' }],
      ex: [
        cat('The mindmap (Ex. 12)', 'Put these words and phrases with the appropriate tense in the mindmap.', { pc: 'Present continuous', ps: 'Present simple' }, [
          ['temporary', 'pc'], ['an action which is not complete', 'pc'], ['happening at the time of speaking', 'pc'],
          ['repeated actions', 'ps'], ['general facts', 'ps'], ['opinions', 'ps'],
        ]),
        fix('Correct the sentences (Ex. 13)', 'Using the rules in the mindmap, correct these sentences where necessary. If a sentence is already correct, write it again.', [
          ['Mukesh Ambani is living in Mumbai.', 'Mukesh Ambani lives in Mumbai.', 'Sự thật chung (nơi ông ấy sống lâu dài) → present simple.'],
          ['Mrs Ambani is believing that her home has an Indian heart.', 'Mrs Ambani believes that her home has an Indian heart.', 'believe là động từ chỉ ý kiến → không chia tiếp diễn.'],
          ['The family live on the top floor because they want as much exposure to sunlight as possible.', 'The family live on the top floor because they want as much exposure to sunlight as possible.', 'Câu đúng: sự thật chung + mong muốn (want không chia tiếp diễn).'],
          ['When the children are at home, they are cleaning their own rooms.', 'When the children are at home, they clean their own rooms.', 'Việc lặp lại mỗi khi ở nhà → present simple.'],
          ['Mrs Ambani entertains her guests in the ballroom at the moment.', 'Mrs Ambani is entertaining her guests in the ballroom at the moment.', '"at the moment" → đang xảy ra lúc nói → present continuous.'],
        ]),
        gap('Present simple or present continuous? (Ex. 14)', 'Complete the sentences using the word in brackets and the correct form of the present continuous or the present simple.', [
          ['Currently, my mum ____ (work) in the study.', 'is working|\'s working', '"Currently" → đang diễn ra.'],
          ['I ____ (rent) in the city centre for now.', "am renting|'m renting", '"for now" → tạm thời.'],
          ['I ____ (think) that buying a new house now would be a very good idea.', 'think', 'think = cho rằng (ý kiến) → present simple.'],
          ['What is that going to be? They ____ (build) a new accommodation block for students.', "are building|'re building", 'Việc xây đang diễn ra, chưa xong.'],
          ['Every day his mum ____ (clean) the house.', 'cleans', '"Every day" → thói quen.'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: Section 1 — specific information & distractors',
      titleEn: 'Lead-in · Listening for specific information · Numbers · Dealing with distractors · Exam skills (pp. 21–23)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Đọc ghi chú trước khi nghe và đoán loại thông tin cần điền (tên, địa chỉ, số…)', 'Nghe và viết đúng số phức tạp: giá tiền, số điện thoại, kích thước', 'Nghe đánh vần tên riêng', 'Loại distractors trong câu multiple choice'],
      images: ['media:m2u01-properties.jpg|Ex. 1 (p. 21): three properties A–C'],
      theory: [
        card('Nghe thông tin cụ thể', 'Listening for specific information', {
          usage: ['Trong bài thi, bạn được biết **bối cảnh** và có thời gian **đọc câu hỏi trước** khi nghe.', 'Nhìn từng chỗ trống và đoán: cần **địa chỉ, số, tên, giờ, đồ vật**…?', 'Tên riêng thường được **đánh vần**: C-H-U-R-C-H-I-L-L; người nói hay **sửa lại** thông tin ("Did you say Church Mill Road?" — "No, Churchill Road").'],
        }),
        card('Số phức tạp', 'Numbers', {
          usage: ['Giá tiền: £53.72 (fifty-three pounds seventy-two); khoảng cách: 472 km.', 'Kích thước: "4.3 m **by** 3.28 m" = 4.3 m x 3.28 m (dài x rộng).', 'Cẩn thận khi người nói nhắc **số sai trước rồi sửa**: "Did you say £43.72?" — "No, £53.72."'],
        }),
        card('Distractors', 'Dealing with distractors', {
          usage: ['Câu multiple choice có **1 đáp án đúng và 2 distractor**.', 'Distractor thường **dùng đúng từ trong bài nghe nhưng khác nghĩa**, hoặc đúng sự thật nhưng **không trả lời câu hỏi**.', 'Ví dụ: "The en-suite bathroom will be useful because…" — A "it has a shower unit" đúng nhưng không phải lý do; B sai (bồn tắm lớn ở phòng tắm chính); C đúng: "useful when we all get up to get ready for school or work".'],
        }),
      ],
      links: [
        { ref: 'listening:M2-U01-L1', title: 'Three properties for sale (Ex. 1–2)', note: 'Nghe mô tả và chọn tranh A, B hay C.' },
        { ref: 'listening:M2-U01-L2', title: 'Phoning the estate agent: notes (Ex. 3)', note: 'Địa chỉ, số phòng, giờ hẹn, tên và số điện thoại.' },
        { ref: 'listening:M2-U01-L3', title: 'Numbers in five conversations (Ex. 4)', note: 'Giá tiền, km, số điện thoại, kích thước.' },
        { ref: 'listening:M2-U01-L4', title: 'Viewing the house: the information sheet (Ex. 5)', note: 'Giá và kích thước các phòng.' },
        { ref: 'listening:M2-U01-L5', title: 'Making an offer: questions (Ex. 6)', note: 'Nghe ý chính của cuộc hội thoại cuối.' },
        { ref: 'listening:M2-U01-L6', title: 'Dealing with distractors (Ex. 7)', note: 'Nghe lại một đoạn ngắn và xem vì sao A, B sai.' },
        { ref: 'listening:M2-U01-L7', title: 'Exam skills: multiple choice (Ex. 8)', note: '5 câu A, B, C — loại distractor.' },
      ],
      vocab: vocabFile('u01-listening', [T02, T03, T04, T05, T06, T07, ANTILIA, HEARST]),
      ex: [
        cat('Predict the kind of information (Ex. 3)', 'Look at the notes and think about the kind of information that you will need for each gap.', { addr: 'an address / a name', num: 'a number', thing: 'a place or a thing', time: 'a time' }, [
          ['Address of property: ____', 'addr', 'Cần tên đường (có thể được đánh vần).'],
          ['Number of bedrooms: ____', 'num'],
          ['Number of lounges: ____', 'num'],
          ['Access to the ____ through sun-room door', 'thing', 'Một nơi: the garden.'],
          ['Kitchen: fully-fitted, includes ____ and ____', 'thing', 'Đồ dùng nhà bếp.'],
          ['Appointment time: ____', 'time'],
          ["Estate agent's name: Peter ____", 'addr', 'Họ của người — chú ý đánh vần.'],
          ["Estate agent's number: ____", 'num', 'Số điện thoại — nghe theo từng cụm số.'],
        ]),
        mcq('Why are the other options wrong? (Ex. 7)', 'Look at this example. "The en-suite bathroom will be useful because A it has a shower unit. B it has a big bath. C it helps everyone in the mornings." The answer is C.', [
          ['Why is A wrong?', ['It is true, but it is not the reason why the bathroom will be useful for the woman and her family.', 'It is not true: the en-suite bathroom has no shower.', 'The woman does not like showers.'], 'A', '"it only has a shower unit" — đúng sự thật, nhưng không phải lý do nó hữu ích.'],
          ['Why is B wrong?', ['It is not true: the big bath is in the main bathroom, not the en-suite.', 'The woman says the bath is too small.', 'It is true, but the woman does not mention it.'], 'A', '"not a big bath like the main bathroom".'],
          ['Why is C correct?', ['The woman says it will be useful "when we all get up to get ready for school or work" — that happens in the morning.', 'The estate agent says it is the best room in the house.', 'The woman says she has three children.'], 'A', 'Cùng nghĩa với bài nghe dù không dùng chữ "morning".'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M2-U01-R1',
      title: 'Mindset 2 · Unit 1 — Antilia',
      content: html(ANTILIA),
      questionGroups: [
        qFill(1, 'Scan the text for the information to answer these questions. (Ex. 7)', [
          ['Who owns the property?', 'Mukesh Ambani / Ambani', 'Đoạn A: "**Mukesh Ambani** is one of the richest men in the world, and the first man to own a private residence…" — scan tên riêng.'],
          ['How many floors does it have?', '27 / twenty-seven', 'Đoạn A: "the property has **27** floors".'],
          ['What are the floors made out of?', 'marble / marble floors', 'Đoạn B: "**Marble** floors, rare wood and fine rugs…".'],
          ['What are the common symbols used throughout the house?', 'the lotus flower and the sun / lotus flower and sun / the lotus flower and sun / lotus flower and the sun', 'Đoạn B: "**The lotus flower and the sun** are common symbols used throughout".'],
          ['How many cars does the garage have space for?', '168', 'Đoạn C: "a multi-storey garage with space for **168** cars".'],
          ['How many people are required to work in the home?', '600 / six hundred / 600 staff', 'Đoạn E: "The 400,000 ft² residence requires **600** staff". BẪY: 400,000 là diện tích.'],
        ], 'Questions 1–6'),
        qFill(7, 'Answer the questions. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. (Ex. 10)', [
          ['How many lifts does the home have?', '9 / nine', 'Đoạn C: "The lobby has numerous reception areas and **nine** lifts."'],
          ['What can you find in the ice-room?', 'man-made snow', 'Đoạn C: "an \'ice-room\' which creates **man-made snow**".'],
          ['What do the Ambani children have to do when at home?', 'clean their rooms / clean their own rooms / clean their room', 'Đoạn E: "all three Ambani children are required to **clean their own rooms**" (are required to = have to). "clean their own rooms" = 4 từ; "clean their rooms" vẫn đúng ý và đúng giới hạn.'],
        ], 'Questions 7–9'),
        qFill(10, 'Complete the sentences. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. (Ex. 11)', [
          ['The name Antilia comes from a ______.', 'mythical island', 'Đoạn A: "Named after **the mythical island** Antilia" (named after = the name comes from).'],
          ['There are many facilities to accommodate a large number of ______.', 'guests', 'Đoạn D: "clearly designed to entertain **guests**… a theatre which seats 50, several guest bedrooms".'],
          ['Opinions on the ______ of the house vary.', 'architecture', 'Đoạn F: "Several experts have criticised **the architecture**… Mrs Ambani, however, describes her home as…" → ý kiến khác nhau (vary).'],
        ], 'Questions 10–12'),
        qMatch(13, 'These statements paraphrase each of the paragraphs in the text. Match each statement with the correct paragraph, A–F. (Ex. 8)', ['A', 'B', 'C', 'D', 'E', 'F'], [
          ['The house has many desirable facilities and outside spaces. Guests can either drive or fly to the home.', 'C', 'Đoạn C: garage for 168 cars (drive), three helipads (fly), spa, libraries, gardens.'],
          ['The family live on the top floor because they want exposure to sunlight.', 'E', 'Đoạn E: "The living quarters are on the top floors, because the family wanted as much sunlight as possible."'],
          ['Mrs Ambani and the architecture experts have different opinions about the house.', 'F', 'Đoạn F: experts "criticised"; Mrs Ambani "however, describes her home as…".'],
          ['Antilia is situated in Mumbai and owned by Mukesh Ambani.', 'A', 'Đoạn A.'],
          ['The appearance inside the house is very extravagant and expensive materials have been used. The house also has magnificent views of the city.', 'B', 'Đoạn B: interior = inside; marble, rare wood; "spectacular views of Mumbai".'],
          ['The home is fully equipped to make visitors feel welcome.', 'D', 'Đoạn D: "clearly designed to entertain guests".'],
        ], { title: 'Questions 13–18', type: 'matching-info' }),
      ],
    },
    {
      ref: 'M2-U01-R2',
      title: 'Mindset 2 · Unit 1 — Hearst Castle',
      content: html(HEARST),
      questionGroups: [
        qFill(1, 'Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.', [
          ['What job did William Hearst do?', 'newspaper publisher / publisher', 'Đoạn A: "a successful American **newspaper publisher**".'],
          ['Who helped Hearst design the Castle?', 'Julia Morgan', 'Đoạn A: "he hired **Julia Morgan**, the first female architect in California. Together… they designed a magnificent castle".'],
          ['How much did Hearst spend on art during his lifetime?', '$3.5 million / 3.5 million dollars / $3,500,000', 'Đoạn B: "during his lifetime, spent **$3.5 million** on his collection". BẪY: $10 million là giá một tác phẩm hiện nay; 10 million dollars là chi phí xây lâu đài.'],
          ['How many times was the Neptune pool rebuilt before Hearst was happy with it?', '3 / three / three times / 3 times', 'Đoạn C: "The pool was rebuilt **three** times until he was satisfied" (satisfied = happy).'],
          ['What were visitors to the Castle required to do every evening?', 'attend formal dinners / attend formal dinner / attend dinners', 'Đoạn E: "Guests had to **attend formal dinners** every evening" (had to = were required to).'],
          ['Who owns the mansion now?', 'the State of California / State of California', 'Đoạn F: "the mansion was donated to **the State of California**". BẪY: gia đình Hearst chỉ "still allowed to use it".'],
        ], 'Questions 1–6'),
        qFill(7, 'Complete the sentences. Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.', [
          ['As a child, Hearst enjoyed his holidays to ______.', 'Europe', 'Đoạn B: "Hearst loved travelling to **Europe** when he was a child".'],
          ['Hearst inherited the land from his ______.', 'mother', 'Đoạn A: "received over 1,000 km² of land when his **mother** died" (inherit = nhận thừa kế).'],
          ['Builders spent ______ creating the magnificent Neptune Pool.', '15 years / fifteen years', 'Đoạn C: "It took **15 years** to build". BẪY: 28 years là thời gian xây cả lâu đài.'],
          ['Hearst took animals from ______ for his private zoo.', 'every continent', 'Đoạn D: "the world\'s largest private zoo, holding animals from **every continent**".'],
          ['Although the zoo is now closed, ______ still walk about the hillside.', 'zebras', 'Đoạn D: "Although the zoo is now closed, **zebras** can still be seen on the hillside."'],
          ['The family donated the property because of ______.', 'expensive maintenance / the expensive maintenance', 'Đoạn F: "his family learnt how **expensive maintenance** would be, and the mansion was donated". Viết tối đa 2 từ.'],
        ], 'Questions 7–12'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M2-U01-L1', title: 'Mindset 2 · Unit 1 — Three properties for sale',
      description: 'An estate agent describes three properties.', partNumber: 1, audioFile: 'Mindset_L2_02.mp3', transcript: T02,
      questionGroups: [
        qMcq(1, 'Listen to an estate agent describing the three properties in the pictures. Which picture, A, B or C, does each description match? (Ex. 1–2)', [
          ['Description 1', ['Picture A', 'Picture B', 'Picture C'], 'C', lx('Mô tả 1', 'Căn đầu tiên.', ['a very nice ground floor two-bedroom flat', 'The garden is accessible through the living room and the kitchen'], 'ground floor + two bedrooms → tranh C (chỉ tầng trệt có phòng ở).')],
          ['Description 2', ['Picture A', 'Picture B', 'Picture C'], 'B', lx('Mô tả 2', 'Căn thứ hai.', ['This first floor flat', 'two double bedrooms, one bathroom', 'There are stairs to the garden at the back'], 'first floor + cầu thang xuống vườn → tranh B.')],
          ['Description 3', ['Picture A', 'Picture B', 'Picture C'], 'A', lx('Mô tả 3', 'Căn thứ ba.', ['The flat is on two levels - there\'s a first floor and a second floor, above a separate ground floor flat', 'a large double bedroom and a smaller double, as well as a third bedroom'], 'two levels (tầng 1 và 2) + ba phòng ngủ → tranh A.')],
        ], 'Questions 1–3', { image: 'media:m2u01-properties.jpg' }),
      ],
    },
    {
      ref: 'M2-U01-L2', title: 'Mindset 2 · Unit 1 — Phoning the estate agent',
      description: 'Caroline phones an estate agent about a house for sale.', partNumber: 1, audioFile: 'Mindset_L2_03.mp3', transcript: T03,
      questionGroups: [
        qNote('Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. (Ex. 3)', 'Property enquiry', [
          'Address of property: __Q1__',
          'Number of bedrooms: __Q2__',
          'Number of lounges: __Q3__',
          'Access to the __Q4__ through sun-room door',
          'Kitchen: fully-fitted, includes __Q5__ and __Q6__',
          'Appointment time: __Q7__',
          "Estate agent's name: Peter __Q8__",
          "Estate agent's number: __Q9__",
        ], {
          1: 'Churchill Road', 2: '3 / three', 3: '2 / two', 4: 'garden',
          5: 'cooker / a cooker / dishwasher / a dishwasher', 6: 'dishwasher / a dishwasher / cooker / a cooker',
          7: "1 o'clock / one o'clock / 1.00 / 1:00 / 1 pm / 1.00 pm", 8: 'Eliot', 9: '07863 905073 / 07863905073',
        }, {
          1: lx('Địa chỉ', 'Đầu bài.', ['in Churchill Road', 'Did you say Church Mill Road?', 'No. Churchill Road - C-H-U-R-C-H-I-L-L'], 'BẪY: "Church Mill Road" là nghe nhầm và bị sửa.'),
          2: lx('Số phòng ngủ', '', ["We have two for sale in Churchill Road - a three-bedroom property and a two-bedroom one", "It's the three-bedroom one"], 'Distractor: two-bedroom (căn kia).'),
          3: lx('Số phòng khách', '', ['how many lounges has it got?', "There are two. There's a small one at the front and a larger one at the back"]),
          4: lx('Lối ra', '', 'you can get to the garden through the sun-room door'),
          5: lx('Đồ bếp có sẵn', '', 'it includes a cooker and a dishwasher', 'Hai chỗ 5 và 6 điền cooker và dishwasher, thứ tự nào cũng được.'),
          6: lx('Đồ bếp có sẵn', '', 'it includes a cooker and a dishwasher', 'Hai chỗ 5 và 6 điền cooker và dishwasher, thứ tự nào cũng được.'),
          7: lx('Giờ hẹn', '', ["Is 11 o'clock OK?", "I'm busy then", "How about one o'clock then, or one forty-five?", "One o'clock would be best for me"], "Distractors: 11 o'clock, 1.45."),
          8: lx('Tên người môi giới', '', ["I'm Peter Eliot", "Is that with two 'l's?", 'No, one: E-L-I-O-T'], 'Một chữ l.'),
          9: lx('Số điện thoại', '', 'My number is 07863 905073', 'BẪY: 07945 872310 là số của Caroline.'),
        }, 'Questions 1–9'),
      ],
    },
    {
      ref: 'M2-U01-L3', title: 'Mindset 2 · Unit 1 — Numbers in five conversations',
      description: 'Five short conversations with prices, distances, phone numbers and sizes.', partNumber: 1, audioFile: 'Mindset_L2_04.mp3', transcript: T04,
      questionGroups: [
        qNote('Listen to these short conversations and write down the numbers in each. (Ex. 4)', 'Numbers', [
          'Conversation 1: £__Q1__',
          'Conversation 2: __Q2__ km',
          'Conversation 3: __Q3__',
          'Conversation 4: __Q4__ m x __Q5__ m',
          'Conversation 5: __Q6__',
        ], { 1: '53.72 / £53.72', 2: '472', 3: '01897 625730 / 01897625730', 4: '110', 5: '55', 6: '81074 / B1074' }, {
          1: lx('Giá tiền', 'Hội thoại 1.', ["That's £53.72, please", 'Sorry, did you say £43.72?', 'No, £53.72'], 'Distractor: £43.72 (nghe nhầm).'),
          2: lx('Khoảng cách', 'Hội thoại 2.', "It's 472 km"),
          3: lx('Số điện thoại', 'Hội thoại 3.', ['call him on 01897 625730', 'Did you say 01857 629730?', "No, it's 01897 625730"], 'Distractor: 01857 629730.'),
          4: lx('Chiều dài sân bóng', 'Hội thoại 4.', "It's 110 m by 55 m", '110 m long and 55 m wide.'),
          5: lx('Chiều rộng sân bóng', 'Hội thoại 4.', "110 m long and 55 m wide"),
          6: lx('Số hội viên', 'Hội thoại 5.', ["It's 81074", 'Sorry, did you say 01074?', 'No, 81074'], 'Audioscript ghi 81074; Answer Key của sách in "B1074" — cả hai đều được chấm đúng. Distractor: 01074.'),
        }, 'Questions 1–6'),
      ],
    },
    {
      ref: 'M2-U01-L4', title: 'Mindset 2 · Unit 1 — Viewing the house',
      description: 'The estate agent shows Caroline round the house.', partNumber: 1, audioFile: 'Mindset_L2_05.mp3', transcript: T05,
      questionGroups: [
        qNote('Listen to the estate agent and client and complete the information sheet. (Ex. 5)', 'Property for sale', [
          'Price: £__Q1__',
          'Kitchen: 3.10 x 2.25 m',
          'Lounge 1: __Q2__ x __Q3__ m',
          'Lounge 2: 6.50 x 4.25 m',
          'Front garden: 10 x 8 m',
          'Rear garden: __Q4__ x __Q5__ m — patio, lawn and flower beds',
          'Bedroom 1: __Q6__ x __Q7__ m',
          'Bedroom 2: __Q8__ x __Q9__ m',
          'Bedroom 3: 3.25 x 2.5 m',
        ], { 1: '350,000 / £350,000 / 350000', 2: '4.3', 3: '3.28', 4: '30', 5: '10', 6: '4.91', 7: '3.95', 8: '4.2', 9: '3.55' }, {
          1: lx('Giá', 'Đầu bài.', ["If I remember rightly, it's £340,000", "Actually, it's £350,000 at the moment"], 'Distractor: £340,000 (Caroline nhớ nhầm).'),
          2: lx('Phòng khách 1 — chiều dài', '', "It's 4.3 m by 3.28 m", '4.3 m long and 3.28 m wide.'),
          3: lx('Phòng khách 1 — chiều rộng', '', "4.3 m long and 3.28 m wide"),
          4: lx('Vườn sau — chiều dài', '', "It's 30 m long and 10 m wide"),
          5: lx('Vườn sau — chiều rộng', '', "30 m by 10 m?"),
          6: lx('Phòng ngủ 1 — chiều dài', '', "It's 4.91 m x 3.95 m", "that's 4.91 m long and 3.95 m wide."),
          7: lx('Phòng ngủ 1 — chiều rộng', '', "4.91 m long and 3.95 m wide"),
          8: lx('Phòng ngủ 2 — chiều dài', '', "It's 4.2 m x 3.55 m - ideal for children to share"),
          9: lx('Phòng ngủ 2 — chiều rộng', '', "4.2 m long and 3.55 m wide?"),
        }, 'Questions 1–9'),
      ],
    },
    {
      ref: 'M2-U01-L5', title: 'Mindset 2 · Unit 1 — Making an offer',
      description: 'Caroline gives the estate agent her details and makes an offer.', partNumber: 1, audioFile: 'Mindset_L2_06.mp3', transcript: T06,
      questionGroups: [
        qMcq(1, 'Listen to the final conversation between the estate agent and client and answer these questions. (Ex. 6)', [
          ['What information does the estate agent need?', ["her name, address and home phone number", 'her name, email address and work phone number', "her address and her husband's work address"], 'A', lx('Người môi giới cần thông tin gì?', 'Đầu bài.', ['let me take your details… How do you spell it?', "And what's your present address?", 'And your home phone number?'], 'Số di động thì ông ấy đã có sẵn.')],
          ['How will the client get the money to pay for the house?', ['a mortgage from the bank and a deposit in her bank account', 'money from her relatives and a loan from the bank', 'a loan from the estate agent'], 'A', lx('Khách lấy tiền ở đâu để mua nhà?', '', ["they're happy to offer us what we need, up to £300,000", 'We also have a 15% deposit in our bank account'], 'mortgage = khoản vay mua nhà của ngân hàng.')],
        ], 'Questions 1–2'),
        qFill(3, 'Write NO MORE THAN TWO WORDS for the answer.', [
          ['How long does the estate agent think it will take to sell the house?', 'two months / 2 months / about two months', lx('Người môi giới nghĩ bán nhà mất bao lâu?', '', ['we should complete it in about two months at the most', "we hope it won't be more than three months"], 'Thường là two months; tối đa three months nếu có vấn đề.')],
        ], 'Question 3'),
        qMcq(4, 'Choose the correct letter, A, B or C.', [
          ['The most important thing for the client is', ['to stay a little longer where she is living now.', 'to help her husband travel to work more easily.', 'to move in before the end of the school holiday.'], 'C', lx('Điều quan trọng nhất với khách là', 'Cuối bài.', ['my husband has a long journey to get to work, but those aren\'t the things I\'m really worried about', 'If we can move in before the end of the summer, it\'ll be much easier for the children to go to their new school'], 'Chuyện ở nhờ họ hàng và đường đi làm của chồng đều bị gạt đi ("those aren\'t the things I\'m really worried about").')],
        ], 'Question 4'),
      ],
    },
    {
      ref: 'M2-U01-L6', title: 'Mindset 2 · Unit 1 — Dealing with distractors',
      description: 'A short extract from the house viewing.', partNumber: 1, audioFile: 'Mindset_L2_07.mp3', transcript: T07,
      questionGroups: [
        qMcq(1, 'Listen to part of the recording again and choose the correct letter, A, B or C. (Ex. 7)', [
          ['The en-suite bathroom will be useful because', ['it has a shower unit.', 'it has a big bath.', 'it helps everyone in the mornings.'], 'C', lx('Phòng tắm riêng sẽ hữu ích vì', '', ['though it only has a shower unit and not a big bath like the main bathroom', 'That would come in very useful when we all get up to get ready for school or work'], 'A đúng sự thật nhưng không phải lý do; B sai (bồn lớn ở phòng tắm chính); get up to get ready for school or work = in the mornings.')],
        ], 'Question 1'),
      ],
    },
    {
      ref: 'M2-U01-L7', title: 'Mindset 2 · Unit 1 — Exam skills: making an offer',
      description: 'The final conversation between the estate agent and Caroline.', partNumber: 1, audioFile: 'Mindset_L2_06.mp3', transcript: T06,
      questionGroups: [
        qMcq(1, 'Listen to the final conversation again and choose the correct letter, A, B or C. (Ex. 8)', [
          ['At the moment, Caroline lives in', ['Prendergast Road.', 'Lanchester Road.', 'Riverside Road.'], 'B', lx('Hiện Caroline sống ở', 'Đầu bài.', '52, Lanchester Road… It\'s in the Riverside part of town', 'Prendergast là họ của cô; Riverside là khu (part of town), không phải tên đường.')],
          ['Caroline wants to make a first offer of', ['£300,000.', '£350,000.', '£340,000.'], 'C', lx('Caroline muốn trả giá lần đầu', '', ['the house is on the market for £350,000', 'I think £340,000 would be fair', 'up to £300,000'], '£350,000 là giá rao; £300,000 là khoản ngân hàng cho vay.')],
          ['Caroline and her family', ['have sold their house.', 'are selling their house now.', "will sell their house in two months' time."], 'A', lx('Gia đình Caroline', '', 'We sold it a couple of months ago and we\'re staying with relatives', '"two months" là thời gian hoàn tất việc mua nhà mới.')],
          ['It may take longer to sell the house if', ['the bank does not check the house quickly.', 'there are plans to do some building near the house.', 'her husband has problems at work.'], 'B', lx('Việc bán nhà có thể lâu hơn nếu', '', ['there might be plans for a new road in the local area. Anything like that can delay the sale'], 'a new road = some building near the house. Ngân hàng chỉ "do the survey"; chồng cô chỉ đi làm xa.')],
          ['If the sellers do not accept her first offer, Caroline will need to', ['increase her offer.', 'come to an agreement in a week.', 'contact her bank and ask for more money.'], 'A', lx('Nếu người bán không nhận giá đầu, Caroline sẽ phải', 'Cuối bài.', "If they don't, you'll need to put in a higher one quickly", 'put in a higher one = increase her offer. "by the end of the week" chỉ là dự đoán thời điểm thỏa thuận.')],
        ], 'Questions 1–5'),
      ],
    },
  ],
};
