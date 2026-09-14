'use strict';
// Word-type / information-type prediction before listening — a foundational
// skill that underlies Form/Note/Table Completion, Sentence Completion, and
// most gap-fill question types. Sits at the end of "Kỹ thuật nghe nền tảng"
// (orderIndex between foundations.js's -4..-1 and byQuestionType.js's 1..6),
// same builder helpers as the rest of listeningTipsData/*.
const { overview, steps, list, example, callout, table, summary, lesson } = require('../readingTipsData/builder');

const CATEGORY = 'Kỹ thuật nghe nền tảng';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'predict-noun-adjective-verb', title: 'Dự đoán Noun / Adjective / Verb', icon: '🔎', orderIndex: -0.75,
    summaryText: 'Nhìn cấu trúc câu (a/an, be, to, must...) để đoán ô trống cần noun, adjective hay verb — trước khi audio phát.',
    blocks: [
      overview('Trước khi nghe, luôn tự hỏi: "Ô trống này đang cần thông tin gì?" — dựa vào cấu trúc câu hỏi (a/an, the, be, to, must...) để dự đoán từ loại trước, đừng đợi nghe xong mới biết.'),
      table('Dấu hiệu trong câu hỏi → Dự đoán', ['Dấu hiệu', 'Dự đoán'], [
        ['starts on ______', 'day / date'],
        ['costs £______', 'number / price'],
        ['contact ______', 'name / person'],
        ['located in ______', 'place'],
        ['______ Street', 'street name'],
        ['______ students', 'number'],
        ['a ______ problem', 'adjective / noun'],
        ['______ equipment', 'adjective / noun'],
        ['the ______ of the course', 'noun'],
        ['students must ______', 'verb'],
        ['students are required to ______', 'verb'],
        ['available ______', 'noun / time / day'],
        ['from ______ to ______', 'time / date / place'],
      ]),
      callout('⚠️ Đừng dừng lại ở "noun / verb / adjective"', 'Có thể dự đoán sâu và chính xác hơn nữa bằng cách nhìn đúng cấu trúc câu — xem các trường hợp cụ thể bên dưới.'),

      list('🔵 NOUN — 5 dấu hiệu nhận biết', [
        'Sau a / an / the',
        'Sau tính từ sở hữu (your / his / her)',
        'Sau giới từ (about, for...)',
        'Sau "the ___ of"',
        'Đứng trước một danh từ khác (noun bổ nghĩa cho noun)',
      ]),
      example([
        { label: '1. Sau a / an / the', statement: 'Students need to bring a ______.', note: '→ Noun. VD: a passport.' },
        { label: '2. Sau tính từ sở hữu', statement: 'Please give us your ______.', note: '→ thường là noun. VD: your address, your name.' },
        { label: '3. Sau giới từ', statement: 'Information about ______.', note: '→ thường là noun / noun phrase. VD: transportation, accommodation. (⚠️ đôi khi lại là V-ing, VD: parking.)' },
        { label: '4. Sau "the ___ of" — dấu hiệu cực mạnh', statement: 'the ______ of the course', note: '→ luôn là noun. VD: the cost / duration / location of the course.' },
        { label: '5. Đứng trước một danh từ khác', statement: 'student ______', note: '→ thường là noun bổ nghĩa cho noun. VD: student accommodation, course information, parking facilities, entrance fee.' },
      ]),
      callout('⚠️ Bẫy hay gặp', 'Thấy một noun ngay sau chỗ trống rồi vội nghĩ đáp án phải là adjective — nhưng nhiều khi đáp án vẫn là NOUN bổ nghĩa cho noun đó.\n"student accommodation" → noun + noun, không phải "spacious accommodation" (adjective + noun) trừ khi ngữ cảnh nói rõ tính chất.'),

      list('🟣 ADJECTIVE — 5 dấu hiệu nhận biết', [
        'Sau be (is / are / was / were)',
        'Sau look / seem / feel / become / remain',
        'Đứng trước một noun',
        'Sau very / quite / extremely / particularly',
        'Sau too / so',
      ]),
      example([
        { label: '1. Sau be', statement: 'The rooms are ______.', note: '→ Adjective. VD: spacious.' },
        { label: '2. Sau look / seem / feel / become / remain', statement: 'The accommodation seems ______.', note: '→ Adjective. VD: comfortable.' },
        { label: '3. Đứng trước một noun', statement: 'a ______ room', note: '→ Adjective. VD: a single / comfortable / large room.' },
        { label: '4. Sau very / quite / extremely / particularly', statement: 'The rooms are extremely ______.', note: '→ Adjective. VD: extremely comfortable, particularly spacious.' },
        { label: '5. Sau too / so', statement: 'The room was too ______.', note: '→ Adjective. VD: too small.' },
      ]),
      callout('⚠️ Cẩn thận: noun + noun ≠ adjective + noun', '"a large room" → adjective + noun.\n"a student room" → noun + noun (student không phải adjective).\nPhải nhìn nghĩa, không chỉ nhìn vị trí đứng trước noun.'),

      list('🟢 VERB — 2 dấu hiệu nhận biết', ['Sau "to"', 'Sau modal verbs (must / can / should / will / may / could)']),
      example([
        { label: '1. Sau "to"', statement: 'Students need to ______ their ID. / Students are required to ______ a form.', note: '→ Verb. VD: bring / complete.' },
        { label: '2. Sau modal verbs', statement: 'Students must ______ the form. / You should ______ early. / Visitors can ______ online. / The college will ______ a new course.', note: '→ Verb nguyên mẫu. VD: submit / arrive / book / offer.' },
      ]),
      summary('Nhìn cấu trúc câu trước khi nghe: a/an/the, tính từ sở hữu, giới từ, "the ___ of" → Noun. be/seem, đứng trước noun, very/too → Adjective. to, modal verbs → Verb.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'predict-number-date-place', title: 'Dự đoán Number / Date / Time / Name / Place', icon: '🔢', orderIndex: -0.5,
    summaryText: 'Number không chỉ là giá tiền; "from ___ to ___" có thể là time, ngày, tháng hoặc địa điểm — phải nhìn ngữ cảnh.',
    blocks: [
      overview('Ngoài noun / adjective / verb, nhiều ô trống cần một loại thông tin cụ thể hơn: number, date, time, tên người hoặc địa điểm.'),

      list('🔢 NUMBER — không chỉ là giá tiền', [
        'price', 'age', 'quantity', 'distance', 'duration', 'room number',
        'postcode', 'telephone number', 'percentage', 'score', 'year', 'date', 'time',
      ]),
      table('Ví dụ NUMBER theo ngữ cảnh', ['Câu hỏi', 'Loại number'], [
        ['The course costs £______.', 'price'],
        ['The course lasts ______ weeks.', 'duration'],
        ['The college has ______ classrooms.', 'quantity'],
        ['The building is ______ kilometres from the station.', 'distance'],
        ['Room ______', 'room number'],
        ['Telephone: ______', 'telephone number'],
      ]),

      list('📅 DATE / DAY / TIME — dấu hiệu nhận biết', ['on ______ (day)', 'on ______ September (date)', 'at ______ (time)', 'deadline / opening hours: ______']),
      example([
        { label: 'Dấu hiệu DAY', statement: 'The course starts on ______.', note: '→ Monday / Tuesday... (ngày trong tuần).' },
        { label: 'Dấu hiệu DATE', statement: 'The course starts on ______ September. / Application deadline: ______', note: '→ 21st / một ngày cụ thể.' },
        { label: 'Dấu hiệu TIME', statement: 'Classes begin at ______. / Opening hours: ______ to ______', note: '→ giờ cụ thể.' },
      ]),
      callout('🔥 "from ___ to ___" — đừng mặc định là time!', 'from 9:00 to 11:00 → time\nfrom Monday to Friday → days\nfrom June to September → months\nfrom London to Oxford → places\n→ Phải nhìn ngữ cảnh câu trước khi quyết định.'),

      list('🙋 NAME / PERSON — dấu hiệu nhận biết', ['Contact ______.', 'Ask for ______ at reception.', 'Course leader: ______', 'Instructor: ______']),
      callout('⚠️ Không phải lúc nào "Contact ___" cũng là tên người', '"Contact ______ for further information." → có thể là department / office / organisation, không nhất thiết là người — phải nghe kỹ ngữ cảnh.'),

      list('📍 PLACE — dấu hiệu nhận biết', ['located in ______', 'based in ______', 'held at ______', 'near ______', 'opposite ______', 'next to ______']),
      example([
        { label: 'Ví dụ', statement: 'Classes are held at ______.', note: '→ có thể là: the Community Centre / Room 204 / Westminster College.' },
      ]),
      summary('Number không chỉ là tiền — luôn xác định rõ đó là price/age/distance/duration hay số phòng. "From ___ to ___" luôn cần đọc ngữ cảnh trước khi quyết định time/day/month/place.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'predict-plural-countable-formula', title: 'Số ít/nhiều, V-ing, cụm từ & công thức dự đoán', icon: '🧠', orderIndex: -0.25,
    summaryText: 'Dự đoán thêm số ít/nhiều, đếm được/không, V-ing, cả cụm danh từ — cộng công thức 5 bước áp dụng cho mọi loại gap.',
    blocks: [
      overview('Ngoài từ loại, học sinh nên đoán thêm: số ít hay số nhiều? đếm được hay không? có phải V-ing hay cả một cụm từ không?'),

      list('🔢 Số ít / số nhiều', [
        'many / several / a number of / various / two ______ → plural noun',
        'a / an / one / each ______ → singular noun',
      ]),
      example([
        { label: 'Số nhiều', statement: 'several ______', note: '→ facilities (plural).' },
        { label: 'Số ít', statement: 'a ______', note: '→ facility (singular).' },
      ]),

      list('🧮 Đếm được / không đếm được', [
        'much ______ → thường là uncountable noun (VD: much information)',
        'many ______ → plural countable noun (VD: many students)',
        'a piece of ______ → uncountable noun (VD: a piece of equipment)',
      ]),
      callout('⚠️ IELTS Listening rất thích bẫy số nhiều sai', 'equipment ❌ equipments\ninformation ❌ informations\nadvice ❌ advices\n→ Đây là uncountable nouns, không có dạng số nhiều.'),

      list('✍️ Khi nào điền V-ing?', ['Sau giới từ (by, about, for...)', 'Sau một số động từ như involve, include']),
      example([
        { label: 'Sau giới từ', statement: 'Students can improve their English by ______ with native speakers.', note: '→ V-ing. VD: communicating.' },
        { label: 'Sau involve / include', statement: 'The course involves ______. / The programme includes ______.', note: '→ V-ing. VD: practising / training.' },
      ]),
      callout('📝 Đôi khi đáp án là cả một cụm danh từ (noun phrase)', 'Students need to bring ______. → có thể là: a valid passport / a copy of their ID / suitable sports equipment.\n→ Không nên ép học sinh đoán "MỘT TỪ DUY NHẤT" nếu đề cho phép nhiều từ (word limit).'),

      steps([
        { title: 'Bước 1 — Nó cần thông tin gì?', description: 'person? place? time? number? object?' },
        { title: 'Bước 2 — Nó cần từ loại gì?', description: 'noun? verb? adjective? adverb?' },
        { title: 'Bước 3 — Nếu là noun', description: 'singular hay plural?' },
        { title: 'Bước 4 — Nếu là number', description: 'price? age? date? time? quantity? distance?' },
        { title: 'Bước 5 — Có khả năng xuất hiện synonym / paraphrase không?', description: 'VD: "The course costs £______" → price → fee → cost → charge → tuition. Audio có thể nói "The fee is £350" dù đề viết "costs" — đừng chờ đúng từ gốc.' },
      ]),

      table('Bảng tổng hợp: nhìn cấu trúc → đoán đáp án', ['Cấu trúc trong đề', 'Dự đoán'], [
        ['a / an ______', 'singular noun'],
        ['the ______ of', 'noun'],
        ['your ______', 'noun'],
        ['about ______', 'noun / V-ing'],
        ['______ students / a ______ room', 'adjective / noun'],
        ['is / are ______ / seems ______', 'adjective / noun / V-ing'],
        ['very ______ / too ______', 'adjective'],
        ['to ______ / must / can / will ______', 'verb'],
        ['by ______', 'V-ing / noun'],
        ['many / several ______', 'plural noun'],
        ['much ______', 'uncountable noun'],
        ['£______', 'price'],
        ['______ km / ______ weeks', 'distance / duration'],
        ['at ______', 'time / place'],
        ['on ______', 'day / date'],
        ['from ______ to ______', 'time / date / place / range'],
        ['Room ______', 'number'],
        ['Contact ______ / located in ______', 'person, department / place'],
      ]),

      callout('🎯 Dự đoán cả MEANING, không chỉ GRAMMAR (semantic category)', 'Đừng chỉ ghi "noun" — hãy ghi rõ ý nghĩa:\n"Students should bring their ______ to the first class." → noun → personal document / ID.\n"The college provides ______ for students." → noun → accommodation / facilities / service.\n"Students can travel to the college by ______." → transport → bus / train / taxi.\nGrammar prediction + semantic prediction + context prediction giúp bắt đáp án nhanh hơn nhiều khi audio paraphrase.'),

      callout('⚠️ Golden Rule — dự đoán chỉ là giả thuyết, không phải đáp án', 'Audio có thể tự sửa lại thông tin ngay sau khi nói. Cảnh giác với các tín hiệu: actually / sorry / I mean / rather / no, that\'s wrong / let me correct that / I\'ve just realised / in fact.\nVD: "The course is held on Monday... actually, sorry, I mean Tuesday." → đáp án: Tuesday.\nVD: "The fee is £250. Oh, I forgot — the registration fee has increased, so it\'s actually £275." → đáp án: £275.'),
      summary('Dự đoán từ loại + số ít/nhiều + ý nghĩa (semantic) trước khi nghe — nhưng luôn sẵn sàng SỬA đáp án nếu nghe thấy tín hiệu correction (actually / sorry / I mean...). Dự đoán chỉ là giả thuyết, đáp án cuối cùng luôn nằm ở audio.'),
    ],
  }),
];
