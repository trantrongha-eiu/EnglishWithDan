"use strict";

// Pronunciation — how to say the -s/-es and -ed endings. Same lesson shape as
// the grammar lessons; examples carry `say` (the word/phrase the 🔊 button
// reads aloud) and the conjugation drill asks for the ending sound.
const { lesson } = require("./builder");

const CATEGORY = "Pronunciation";

// Answers for "this ending sounds like ___": accept with or without slashes,
// and plain "id"/"iz" for students who can't type ɪ.
const SOUND = {
  s: ["/s/", "s"],
  z: ["/z/", "z"],
  iz: ["/ɪz/", "ɪz", "/iz/", "iz"],
  t: ["/t/", "t"],
  d: ["/d/", "d"],
  id: ["/ɪd/", "ɪd", "/id/", "id"]
};
const soundItem = (word, sound, explanation) => ({ sentence: word + " → ___", answers: SOUND[sound], explanation });

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: "s-es-endings", title: "Phát âm đuôi -s / -es", icon: "🔊", orderIndex: 50,
    overview: "Đuôi -s/-es xuất hiện ở danh từ số nhiều (cats), động từ ngôi thứ ba số ít (he watches), sở hữu cách (Tom's) và dạng rút gọn (it's, he's). Có 3 cách đọc: /s/, /z/ và /ɪz/ — quyết định bởi ÂM CUỐI của từ gốc (không phải chữ cái cuối). Người Việt hay nuốt mất âm cuối này, khiến giám khảo IELTS Speaking trừ điểm Pronunciation và cả Grammar (vì nghe như sai số ít/số nhiều).",
    formula: [
      { label: "/ɪz/ — sau âm gió (xuýt)", structure: "Âm cuối /s/, /z/, /ʃ/, /ʒ/, /tʃ/, /dʒ/ (thường là chữ s, x, z, ce, se, sh, ch, ge) → đọc thêm một âm tiết /ɪz/", example: "buses /ˈbʌsɪz/, boxes, washes, watches, changes, roses" },
      { label: "/s/ — sau âm vô thanh", structure: "Âm cuối /p/, /t/, /k/, /f/, /θ/ (thường là chữ p, t, k, f, gh, th) → /s/", example: "stops /stɒps/, cats, books, laughs, months" },
      { label: "/z/ — các trường hợp còn lại", structure: "Âm cuối là nguyên âm hoặc phụ âm hữu thanh /b/, /d/, /g/, /v/, /m/, /n/, /ŋ/, /l/, /r/, /ð/ → /z/", example: "plays /pleɪz/, dogs, bags, lives, rooms, cars" }
    ],
    usage: [
      { title: "Danh từ số nhiều", description: "two cats /kæts/ · three dogs /dɒgz/ · four boxes /ˈbɒksɪz/" },
      { title: "Động từ ngôi thứ ba số ít (he/she/it)", description: "She works /wɜːks/ · He plays /pleɪz/ · It washes /ˈwɒʃɪz/" },
      { title: "Sở hữu cách và dạng rút gọn ('s) — cùng quy tắc", description: "Mark's /mɑːks/ car · John's /dʒɒnz/ book · George's /ˈdʒɔːdʒɪz/ house · it's /ɪts/ · he's /hiːz/" }
    ],
    signalWords: ["/ɪz/: s, x, z, ce, se, sh, ch, ge", "/s/: p, t, k, f, gh (laugh), th (month)", "/z/: nguyên âm + b, d, g, v, m, n, ng, l, r", "Mẹo /s/: \"Thời phong kiến phương Tây\" (th, p, k, f, t)", "Mẹo /ɪz/: \"Sóng gió chẳng shợ zó xa\" (s, ge, ch, sh, z, x)"],
    examples: [
      { en: "cats /kæts/ · books /bʊks/ · stops /stɒps/", vi: "Âm cuối /t/, /k/, /p/ vô thanh → /s/", say: "cats, books, stops" },
      { en: "laughs /lɑːfs/ · months /mʌnθs/ · coughs /kɒfs/", vi: "\"gh\" đọc /f/, \"th\" đọc /θ/ → vẫn là /s/", say: "laughs, months, coughs" },
      { en: "dogs /dɒgz/ · bags /bægz/ · beds /bedz/", vi: "Âm cuối /g/, /d/ hữu thanh → /z/", say: "dogs, bags, beds" },
      { en: "plays /pleɪz/ · trees /triːz/ · goes /gəʊz/", vi: "Kết thúc bằng nguyên âm → /z/", say: "plays, trees, goes" },
      { en: "lives /lɪvz/ · rooms /ruːmz/ · cars /kɑːz/", vi: "Âm cuối /v/, /m/, /r/ → /z/", say: "lives, rooms, cars" },
      { en: "buses /ˈbʌsɪz/ · boxes /ˈbɒksɪz/ · quizzes /ˈkwɪzɪz/", vi: "Âm cuối /s/, /ks/, /z/ → thêm âm tiết /ɪz/", say: "buses, boxes, quizzes" },
      { en: "washes /ˈwɒʃɪz/ · watches /ˈwɒtʃɪz/ · changes /ˈtʃeɪndʒɪz/", vi: "Âm cuối /ʃ/, /tʃ/, /dʒ/ → /ɪz/", say: "washes, watches, changes" },
      { en: "places /ˈpleɪsɪz/ · roses /ˈrəʊzɪz/ · houses /ˈhaʊzɪz/", vi: "Chữ cuối là \"e\" câm nhưng âm cuối là /s/ hoặc /z/ → /ɪz/", say: "places, roses, houses" },
      { en: "She works in a bank and plays tennis at weekends.", vi: "works /s/ — plays /z/", say: "She works in a bank and plays tennis at weekends." },
      { en: "My brother watches films and reads books every night.", vi: "watches /ɪz/ — films /z/ — reads /z/ — books /s/", say: "My brother watches films and reads books every night." },
      { en: "The city's parks attract thousands of visitors.", vi: "city's /z/ — parks /s/ — thousands /z/ — visitors /z/", say: "The city's parks attract thousands of visitors." },
      { en: "It's Jack's idea, but George's plan looks better.", vi: "it's /s/ — Jack's /s/ — George's /ɪz/ — looks /s/", say: "It's Jack's idea, but George's plan looks better." }
    ],
    mistakes: [
      { wrong: "Nuốt âm cuối: \"She work there\", \"two book\" (nghe như không có -s)", right: "She works /wɜːks/ there · two books /bʊks/", note: "Bỏ âm -s khiến người nghe hiểu là sai ngữ pháp. Luyện bật nhẹ âm /s/ rõ ràng ở cuối từ." },
      { wrong: "boxes đọc /bɒks/ (một âm tiết)", right: "boxes /ˈbɒksɪz/ (hai âm tiết)", note: "Sau âm gió /s/, /z/, /ʃ/, /tʃ/, /dʒ/ phải thêm hẳn một âm tiết /ɪz/." },
      { wrong: "laughs đọc /ɪz/ hoặc /z/ vì nhìn chữ \"gh\"", right: "laughs /lɑːfs/", note: "Quy tắc dựa vào ÂM: \"gh\" trong laugh đọc /f/ (vô thanh) → /s/." },
      { wrong: "makes đọc /ˈmeɪkɪz/ vì chữ cuối là \"e\"", right: "makes /meɪks/", note: "\"e\" cuối là âm câm; âm cuối thật là /k/ → /s/. Chỉ đọc /ɪz/ khi âm cuối là âm gió (places, uses)." },
      { wrong: "dogs đọc /dɒgs/ (âm /s/ gắt)", right: "dogs /dɒgz/", note: "Sau âm hữu thanh /g/ → /z/ (rung dây thanh như tiếng ong \"zzz\")." },
      { wrong: "Thêm âm /ɪz/ cho mọi từ có -es: goes /ˈgəʊɪz/, does /ˈduːɪz/", right: "goes /gəʊz/ · does /dʌz/", note: "-es sau nguyên âm (go, do) chỉ là cách viết; vẫn đọc /z/, không thêm âm tiết." }
    ],
    tips: [
      "Trong IELTS Speaking, âm cuối -s rõ ràng giúp cả Pronunciation lẫn Grammatical Range & Accuracy — giám khảo không thể chấm \"đúng số nhiều\" nếu không nghe thấy -s.",
      "Mẹo kiểm tra hữu thanh/vô thanh: đặt tay lên cổ họng khi phát âm âm cuối — rung là hữu thanh (→ /z/), không rung là vô thanh (→ /s/).",
      "Khi nối âm, -s/-es nối sang nguyên âm của từ sau: \"He lives in\" → /hiː lɪv zɪn/; \"It takes a while\" → /teɪk sə/.",
      "Ghi âm chính mình đọc các câu ví dụ rồi nghe lại — đây là cách nhanh nhất để phát hiện thói quen nuốt âm cuối."
    ],
    comparison: {
      title: "Bảng tổng hợp cách đọc -s/-es",
      headers: ["Cách đọc", "Âm cuối của từ gốc", "Chữ cái thường gặp", "Ví dụ"],
      rows: [
        ["/ɪz/", "/s/ /z/ /ʃ/ /ʒ/ /tʃ/ /dʒ/", "s, ss, x, z, ce, se, sh, ch, ge", "kisses, fixes, wishes, catches, judges"],
        ["/s/", "/p/ /t/ /k/ /f/ /θ/", "p, t, k, ke, f, fe, gh, th", "hopes, hats, likes, cliffs, myths"],
        ["/z/", "Nguyên âm + /b/ /d/ /g/ /v/ /m/ /n/ /ŋ/ /l/ /r/ /ð/", "y, o, b, d, g, ve, m, n, ng, l, r", "cries, rubs, ends, songs, calls"]
      ]
    },
    exercises: [
      { type: "multiple_choice", question: "Đuôi -s trong \"maps\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 0, explanation: "Âm cuối /p/ vô thanh → /s/." },
      { type: "multiple_choice", question: "Đuôi -es trong \"dishes\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 2, explanation: "Âm cuối /ʃ/ là âm gió → /ɪz/." },
      { type: "multiple_choice", question: "Đuôi -s trong \"pens\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 1, explanation: "Âm cuối /n/ hữu thanh → /z/." },
      { type: "multiple_choice", question: "Từ nào có đuôi đọc KHÁC các từ còn lại?", options: ["books", "cups", "bags", "hats"], answerIndex: 2, explanation: "bags /z/; books, cups, hats /s/." },
      { type: "fill_blank", question: "Đuôi -es trong \"bridges\" đọc là /___/.", answer: "/ɪz/", explanation: "Âm cuối /dʒ/ (chữ ge) là âm gió → /ɪz/." },
      { type: "fill_blank", question: "Đuôi -s trong \"months\" đọc là /___/.", answer: "/s/", explanation: "Âm cuối /θ/ vô thanh → /s/." },
      { type: "error_correction", question: "Sửa phân tích sai: \"knives đọc đuôi /s/ vì từ gốc knife kết thúc bằng f.\"", answer: "knives đọc /naɪvz/ — đuôi /z/, vì ở dạng số nhiều f đã đổi thành /v/ (hữu thanh).", explanation: "Xét âm cuối ngay trước -s của dạng đã thêm đuôi: /v/ → /z/." },
      { type: "error_correction", question: "Sửa phân tích sai: \"likes đọc /ˈlaɪkɪz/ vì có chữ e.\"", answer: "likes đọc /laɪks/ — đuôi /s/.", explanation: "\"e\" câm; âm cuối /k/ vô thanh → /s/." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh rồi chỉ ra cách đọc đuôi -s: \"Mẹ tôi nấu ăn mỗi ngày.\"", answer: "My mother cooks every day. — cooks: /s/ (âm cuối /k/).", explanation: "Ngôi thứ ba số ít → cooks; /k/ vô thanh → /s/." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh rồi chỉ ra cách đọc đuôi -es: \"Anh ấy rửa bát sau bữa tối.\"", answer: "He washes the dishes after dinner. — washes /ɪz/, dishes /ɪz/.", explanation: "Âm cuối /ʃ/ → /ɪz/." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt và cho biết cách đọc đuôi của \"changes\": \"The city changes quickly.\"", answer: "Thành phố thay đổi nhanh chóng. — changes đọc /ɪz/.", explanation: "Âm cuối /dʒ/ → /ɪz/." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt và cho biết cách đọc đuôi của \"lives\": \"She lives near the sea.\"", answer: "Cô ấy sống gần biển. — lives đọc /z/.", explanation: "Âm cuối /v/ hữu thanh → /z/." },
      { type: "sentence_transformation", question: "Chuyển chủ ngữ sang \"She\" và đọc đúng đuôi động từ: \"I watch TV and fix my bike.\"", answer: "She watches TV and fixes her bike. — watches /ɪz/, fixes /ɪz/.", explanation: "Âm cuối /tʃ/ và /ks/ → /ɪz/." },
      { type: "sentence_transformation", question: "Chuyển sang số nhiều và đọc đúng đuôi: \"a cat, a dog, a horse\"", answer: "cats /s/, dogs /z/, horses /ɪz/", explanation: "/t/ → /s/; /g/ → /z/; /s/ → /ɪz/." },
      { type: "rewrite", question: "Viết lại câu ở hiện tại đơn với chủ ngữ \"He\" và ghi cách đọc mỗi động từ: \"I play football, stop at six, and rush home.\"", answer: "He plays football, stops at six, and rushes home. — plays /z/, stops /s/, rushes /ɪz/.", explanation: "Ba động từ minh họa đủ ba cách đọc." },
      { type: "rewrite", question: "Viết lại dùng sở hữu cách và ghi cách đọc: \"the car of Mike\", \"the house of James\"", answer: "Mike's car — /s/; James's house — /ɪz/.", explanation: "Mike kết thúc /k/ → /s/; James kết thúc /z/ → /ɪz/." },
      { type: "find_mistake", question: "Tìm từ có đuôi đọc khác: \"roses – buses – watches – walks\"", answer: "walks (/s/); các từ còn lại đọc /ɪz/.", explanation: "walk kết thúc /k/ vô thanh → /s/." },
      { type: "find_mistake", question: "Tìm từ có đuôi đọc khác: \"plays – dreams – laughs – calls\"", answer: "laughs (/s/); các từ còn lại đọc /z/.", explanation: "laugh kết thúc /f/ → /s/." },
      { type: "mini_dialogue", question: "Đọc hội thoại, ghi cách đọc đuôi của các từ in hoa:\nA: What does your sister do?\nB: She TEACHES English and WRITES BOOKS. She also SINGS in a band.", answer: "teaches /ɪz/ · writes /s/ · books /s/ · sings /z/", explanation: "/tʃ/ → /ɪz/; /t/, /k/ → /s/; /ŋ/ → /z/." },
      { type: "mini_dialogue", question: "Đọc hội thoại, ghi cách đọc đuôi của các từ in hoa:\nA: How many CLASSES do you have?\nB: Three. My FRIEND'S class STARTS at eight, but mine ENDS late.", answer: "classes /ɪz/ · friend's /z/ · starts /s/ · ends /z/", explanation: "/s/ → /ɪz/; /d/ → /z/; /t/ → /s/." }
    ],
    conjugationDrills: [{
      title: "Luyện nhanh: đuôi -s/-es đọc là gì?",
      intro: "Gõ cách đọc đuôi: s, z hoặc iz (có thể gõ /s/, /z/, /ɪz/). Nhấn Enter để sang từ tiếp theo, hết danh sách bấm Kiểm tra.",
      items: [
        soundItem("hopes", "s", "Âm cuối /p/ vô thanh."),
        soundItem("girls", "z", "Âm cuối /l/ hữu thanh."),
        soundItem("kisses", "iz", "Âm cuối /s/ là âm gió."),
        soundItem("weeks", "s", "Âm cuối /k/ vô thanh."),
        soundItem("cities", "z", "Kết thúc bằng nguyên âm /i/."),
        soundItem("oranges", "iz", "Âm cuối /dʒ/ là âm gió."),
        soundItem("photographs", "s", "\"ph\" đọc /f/ vô thanh."),
        soundItem("clothes", "z", "Âm cuối /ð/ hữu thanh."),
        soundItem("brushes", "iz", "Âm cuối /ʃ/ là âm gió."),
        soundItem("students", "s", "Âm cuối /t/ vô thanh."),
        soundItem("songs", "z", "Âm cuối /ŋ/ hữu thanh."),
        soundItem("prizes", "iz", "Âm cuối /z/ là âm gió."),
        soundItem("cliffs", "s", "Âm cuối /f/ vô thanh."),
        soundItem("knows", "z", "Kết thúc bằng nguyên âm /əʊ/."),
        soundItem("garages", "iz", "Âm cuối /ʒ/ hoặc /dʒ/ là âm gió.")
      ]
    }],
    quiz: [
      { question: "Đuôi -s trong \"students\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 0, explanation: "Âm cuối /t/ → /s/." },
      { question: "Đuôi -es trong \"buses\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 2, explanation: "Âm cuối /s/ → /ɪz/." },
      { question: "Đuôi -s trong \"friends\" đọc là?", options: ["/s/", "/z/", "/ɪz/"], answerIndex: 1, explanation: "Âm cuối /d/ → /z/." },
      { question: "Từ nào có đuôi đọc /ɪz/?", options: ["takes", "pages", "plays", "laughs"], answerIndex: 1, explanation: "pages: âm cuối /dʒ/ → /ɪz/." },
      { question: "Từ nào có đuôi đọc KHÁC các từ còn lại?", options: ["cooks", "maps", "months", "bees"], answerIndex: 3, explanation: "bees /z/; các từ còn lại /s/." },
      { question: "Quy tắc đọc -s/-es dựa vào điều gì?", options: ["Chữ cái cuối của từ", "Âm cuối của từ gốc", "Số âm tiết của từ", "Từ loại (danh từ hay động từ)"], answerIndex: 1, explanation: "Dựa vào ÂM cuối, không phải chữ cái." }
    ],
    summary: "Đuôi -s/-es: /ɪz/ sau âm gió (s, z, sh, ch, ge, x), /s/ sau âm vô thanh (p, t, k, f, th), /z/ sau nguyên âm và âm hữu thanh. Luôn xét ÂM cuối, và đừng nuốt âm cuối khi nói."
  }),

  lesson({
    category: CATEGORY, lessonKey: "ed-endings", title: "Phát âm đuôi -ed", icon: "🔈", orderIndex: 51,
    overview: "Đuôi -ed của động từ quá khứ/quá khứ phân từ (worked, played, wanted) và tính từ đuôi -ed (interested, bored) có 3 cách đọc: /ɪd/, /t/ và /d/ — tùy ÂM CUỐI của động từ gốc. Lỗi phổ biến của người Việt: đọc mọi đuôi -ed thành /ɪd/ (\"work-ợt\"), hoặc nuốt hẳn đuôi khiến câu nghe như thì hiện tại.",
    formula: [
      { label: "/ɪd/ — sau /t/ và /d/", structure: "Âm cuối /t/ hoặc /d/ (thường là chữ t, te, d, de) → thêm một âm tiết /ɪd/", example: "wanted /ˈwɒntɪd/, needed, decided, visited, ended" },
      { label: "/t/ — sau âm vô thanh", structure: "Âm cuối /p/, /k/, /f/, /s/, /ʃ/, /tʃ/, /θ/ (thường là p, k, f, gh, s, ss, ce, x, sh, ch) → /t/", example: "stopped /stɒpt/, looked, laughed, missed, washed, watched" },
      { label: "/d/ — các trường hợp còn lại", structure: "Âm cuối là nguyên âm hoặc phụ âm hữu thanh /b/, /g/, /v/, /z/, /m/, /n/, /ŋ/, /l/, /r/, /ð/, /dʒ/ → /d/", example: "played /pleɪd/, cleaned, lived, opened, called, changed" }
    ],
    usage: [
      { title: "Động từ quá khứ đơn / quá khứ phân từ", description: "I worked /wɜːkt/ late. · She has decided /dɪˈsaɪdɪd/ to leave. · They played /pleɪd/ well." },
      { title: "Tính từ đuôi -ed (cùng quy tắc)", description: "interested /ˈɪntrəstɪd/ · bored /bɔːd/ · tired /ˈtaɪəd/ · relaxed /rɪˈlækst/" },
      { title: "Một số tính từ đặc biệt luôn đọc /ɪd/", description: "naked, wicked, beloved, sacred, crooked, rugged, ragged, wretched, learned (uyên bác), aged (cao tuổi), blessed — VD: a naked /ˈneɪkɪd/ eye" }
    ],
    signalWords: ["/ɪd/: t, d", "/t/: p, k, f, gh, s, ss, x, ce, sh, ch", "/d/: nguyên âm + b, g, v, z, m, n, l, r, ge", "Mẹo /t/: \"Khi sang sông phải chờ phà\" (k, s, sh, p, ch, ph/f)", "Ngoại lệ /ɪd/: naked, wicked, beloved, sacred, crooked"],
    examples: [
      { en: "wanted /ˈwɒntɪd/ · visited /ˈvɪzɪtɪd/ · started /ˈstɑːtɪd/", vi: "Âm cuối /t/ → /ɪd/ (thêm âm tiết)", say: "wanted, visited, started" },
      { en: "needed /ˈniːdɪd/ · decided /dɪˈsaɪdɪd/ · ended /ˈendɪd/", vi: "Âm cuối /d/ → /ɪd/", say: "needed, decided, ended" },
      { en: "stopped /stɒpt/ · looked /lʊkt/ · worked /wɜːkt/", vi: "Âm cuối /p/, /k/ vô thanh → /t/", say: "stopped, looked, worked" },
      { en: "laughed /lɑːft/ · missed /mɪst/ · fixed /fɪkst/", vi: "Âm cuối /f/, /s/, /ks/ → /t/", say: "laughed, missed, fixed" },
      { en: "washed /wɒʃt/ · watched /wɒtʃt/ · danced /dɑːnst/", vi: "Âm cuối /ʃ/, /tʃ/, /s/ → /t/", say: "washed, watched, danced" },
      { en: "played /pleɪd/ · studied /ˈstʌdid/ · agreed /əˈgriːd/", vi: "Kết thúc bằng nguyên âm → /d/", say: "played, studied, agreed" },
      { en: "cleaned /kliːnd/ · called /kɔːld/ · lived /lɪvd/", vi: "Âm cuối /n/, /l/, /v/ hữu thanh → /d/", say: "cleaned, called, lived" },
      { en: "changed /tʃeɪndʒd/ · used /juːzd/ · robbed /rɒbd/", vi: "Âm cuối /dʒ/, /z/, /b/ hữu thanh → /d/", say: "changed, used, robbed" },
      { en: "I was interested in the talk, but my friend looked bored.", vi: "interested /ɪd/ — looked /t/ — bored /d/", say: "I was interested in the talk, but my friend looked bored." },
      { en: "She finished her work, called her mum, and decided to go out.", vi: "finished /t/ — called /d/ — decided /ɪd/", say: "She finished her work, called her mum, and decided to go out." },
      { en: "We walked to the station and waited for an hour.", vi: "walked /t/ — waited /ɪd/", say: "We walked to the station and waited for an hour." },
      { en: "The old man walked with a crooked stick.", vi: "walked /t/ — crooked (tính từ) /ˈkrʊkɪd/", say: "The old man walked with a crooked stick." }
    ],
    mistakes: [
      { wrong: "worked đọc /ˈwɜːkɪd/ (\"work-ợt\")", right: "worked /wɜːkt/ (một âm tiết)", note: "Chỉ thêm âm tiết /ɪd/ khi âm cuối là /t/ hoặc /d/. Các trường hợp khác -ed KHÔNG tạo thêm âm tiết." },
      { wrong: "Nuốt đuôi: \"Yesterday I watch a film\" (nghe như hiện tại)", right: "Yesterday I watched /wɒtʃt/ a film.", note: "Bỏ âm /t/ hoặc /d/ cuối khiến câu nghe sai thì → mất điểm cả Pronunciation và Grammar." },
      { wrong: "laughed đọc /lɑːgd/ vì nhìn chữ \"gh\"", right: "laughed /lɑːft/", note: "\"gh\" trong laugh đọc /f/ vô thanh → /t/." },
      { wrong: "played đọc /pleɪt/", right: "played /pleɪd/", note: "Sau nguyên âm → /d/ (hữu thanh, nhẹ)." },
      { wrong: "naked đọc /neɪkt/", right: "naked /ˈneɪkɪd/", note: "Một số tính từ đặc biệt luôn đọc /ɪd/: naked, wicked, crooked, beloved, sacred…" },
      { wrong: "used to đọc /juːzd tuː/", right: "used to /ˈjuːst tə/", note: "\"used to\" (đã từng) đọc /juːst/; \"used\" (đã dùng) mới đọc /juːzd/." }
    ],
    tips: [
      "Trong Speaking Part 2 (kể chuyện quá khứ), đuôi -ed rõ ràng là bằng chứng bạn dùng đúng thì quá khứ — đừng để giám khảo phải đoán.",
      "Nối âm: đuôi /t/, /d/ nối sang nguyên âm của từ sau: \"looked at\" → /lʊk tæt/, \"lived in\" → /lɪv dɪn/.",
      "Khi -ed đứng giữa hai phụ âm (\"I watched TV\", \"stopped by\"), người bản xứ thường đọc rất nhẹ — nhưng người học vẫn nên giữ âm này để rõ thì.",
      "Mẹo nhanh: hỏi \"âm cuối có phải /t/ hoặc /d/ không?\" — có → /ɪd/; không → đặt tay lên cổ: không rung → /t/, rung → /d/."
    ],
    comparison: {
      title: "Bảng tổng hợp cách đọc -ed",
      headers: ["Cách đọc", "Âm cuối của động từ gốc", "Chữ cái thường gặp", "Ví dụ"],
      rows: [
        ["/ɪd/", "/t/ /d/", "t, te, d, de", "wanted, hated, needed, provided"],
        ["/t/", "/p/ /k/ /f/ /s/ /ʃ/ /tʃ/ /θ/", "p, k, ke, f, gh, s, ss, ce, x, sh, ch", "hoped, asked, laughed, kissed, relaxed, pushed, reached"],
        ["/d/", "Nguyên âm + /b/ /g/ /v/ /z/ /m/ /n/ /ŋ/ /l/ /r/ /ð/ /dʒ/", "y, e, b, g, ve, se (/z/), m, n, l, r, ge", "stayed, begged, moved, raised, seemed, joined, travelled, managed"]
      ]
    },
    exercises: [
      { type: "multiple_choice", question: "Đuôi -ed trong \"helped\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 0, explanation: "Âm cuối /p/ vô thanh → /t/." },
      { type: "multiple_choice", question: "Đuôi -ed trong \"invited\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 2, explanation: "Âm cuối /t/ → /ɪd/." },
      { type: "multiple_choice", question: "Đuôi -ed trong \"opened\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 1, explanation: "Âm cuối /n/ hữu thanh → /d/." },
      { type: "multiple_choice", question: "Từ nào có đuôi -ed đọc KHÁC các từ còn lại?", options: ["asked", "watched", "travelled", "jumped"], answerIndex: 2, explanation: "travelled /d/; asked, watched, jumped /t/." },
      { type: "fill_blank", question: "Đuôi -ed trong \"recommended\" đọc là /___/.", answer: "/ɪd/", explanation: "Âm cuối /d/ → /ɪd/." },
      { type: "fill_blank", question: "Đuôi -ed trong \"cooked\" đọc là /___/.", answer: "/t/", explanation: "Âm cuối /k/ → /t/." },
      { type: "error_correction", question: "Sửa phân tích sai: \"danced đọc /d/ vì chữ cuối là e.\"", answer: "danced đọc /dɑːnst/ — đuôi /t/.", explanation: "\"ce\" đọc /s/ vô thanh → /t/." },
      { type: "error_correction", question: "Sửa phân tích sai: \"stayed đọc /ɪd/ vì có hai chữ e và d.\"", answer: "stayed đọc /steɪd/ — đuôi /d/.", explanation: "Kết thúc bằng nguyên âm /eɪ/ → /d/; chỉ /t/, /d/ mới đọc /ɪd/." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh rồi chỉ ra cách đọc đuôi -ed: \"Hôm qua tôi đã dọn phòng.\"", answer: "I cleaned my room yesterday. — cleaned /d/.", explanation: "Âm cuối /n/ → /d/." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh rồi chỉ ra cách đọc đuôi -ed: \"Chúng tôi đã đợi xe buýt rất lâu.\"", answer: "We waited for the bus for a long time. — waited /ɪd/.", explanation: "Âm cuối /t/ → /ɪd/." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt và cho biết cách đọc đuôi của \"relaxed\": \"I felt relaxed after the holiday.\"", answer: "Tôi cảm thấy thư thái sau kỳ nghỉ. — relaxed đọc /t/.", explanation: "Âm cuối /ks/ → /t/." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt và cho biết cách đọc đuôi của \"moved\": \"They moved to Hanoi last year.\"", answer: "Năm ngoái họ đã chuyển ra Hà Nội. — moved đọc /d/.", explanation: "Âm cuối /v/ → /d/." },
      { type: "sentence_transformation", question: "Chuyển sang quá khứ đơn và ghi cách đọc mỗi động từ: \"I visit my grandparents, help them, and play chess.\"", answer: "I visited my grandparents, helped them, and played chess. — visited /ɪd/, helped /t/, played /d/.", explanation: "Ba động từ minh họa đủ ba cách đọc." },
      { type: "sentence_transformation", question: "Chuyển sang quá khứ đơn và ghi cách đọc: \"She needs help and asks for it.\"", answer: "She needed help and asked for it. — needed /ɪd/, asked /t/.", explanation: "/d/ → /ɪd/; /k/ → /t/." },
      { type: "rewrite", question: "Viết lại dùng tính từ -ed và ghi cách đọc: \"The film bored me. The ending surprised me.\"", answer: "I was bored by the film and surprised by the ending. — bored /d/, surprised /d/.", explanation: "bore: âm cuối là nguyên âm /ɔː/ → /d/; surprise: âm cuối /z/ → /d/." },
      { type: "rewrite", question: "Viết lại ở quá khứ và ghi cách đọc: \"He works hard and earns a lot.\"", answer: "He worked hard and earned a lot. — worked /t/, earned /d/.", explanation: "/k/ → /t/; /n/ → /d/." },
      { type: "find_mistake", question: "Tìm từ có đuôi -ed đọc khác: \"wanted – needed – painted – stopped\"", answer: "stopped (/t/); các từ còn lại đọc /ɪd/.", explanation: "stop kết thúc /p/ → /t/." },
      { type: "find_mistake", question: "Tìm từ có đuôi -ed đọc khác: \"called – lived – washed – opened\"", answer: "washed (/t/); các từ còn lại đọc /d/.", explanation: "wash kết thúc /ʃ/ vô thanh → /t/." },
      { type: "mini_dialogue", question: "Đọc hội thoại, ghi cách đọc đuôi -ed của các từ in hoa:\nA: How was your weekend?\nB: Great! I VISITED my aunt, we COOKED dinner together, and then we WATCHED a film. I REALLY ENJOYED it.", answer: "visited /ɪd/ · cooked /t/ · watched /t/ · enjoyed /d/", explanation: "/t/ → /ɪd/; /k/, /tʃ/ → /t/; nguyên âm /ɔɪ/ → /d/." },
      { type: "mini_dialogue", question: "Đọc hội thoại, ghi cách đọc đuôi -ed của các từ in hoa:\nA: Why were you late?\nB: The train STOPPED for an hour, so I CALLED my boss and EXPLAINED. She wasn't PLEASED.", answer: "stopped /t/ · called /d/ · explained /d/ · pleased /d/", explanation: "/p/ → /t/; /l/, /n/, /z/ → /d/." }
    ],
    conjugationDrills: [{
      title: "Luyện nhanh: đuôi -ed đọc là gì?",
      intro: "Gõ cách đọc đuôi: t, d hoặc id (có thể gõ /t/, /d/, /ɪd/). Nhấn Enter để sang từ tiếp theo, hết danh sách bấm Kiểm tra.",
      items: [
        soundItem("jumped", "t", "Âm cuối /p/ vô thanh."),
        soundItem("rained", "d", "Âm cuối /n/ hữu thanh."),
        soundItem("hated", "id", "Âm cuối /t/."),
        soundItem("kissed", "t", "Âm cuối /s/ vô thanh."),
        soundItem("cried", "d", "Kết thúc bằng nguyên âm /aɪ/."),
        soundItem("added", "id", "Âm cuối /d/."),
        soundItem("brushed", "t", "Âm cuối /ʃ/ vô thanh."),
        soundItem("arrived", "d", "Âm cuối /v/ hữu thanh."),
        soundItem("reached", "t", "Âm cuối /tʃ/ vô thanh."),
        soundItem("provided", "id", "Âm cuối /d/."),
        soundItem("smiled", "d", "Âm cuối /l/ hữu thanh."),
        soundItem("coughed", "t", "\"gh\" đọc /f/ vô thanh."),
        soundItem("protected", "id", "Âm cuối /t/."),
        soundItem("managed", "d", "Âm cuối /dʒ/ hữu thanh."),
        soundItem("mixed", "t", "Âm cuối /ks/ vô thanh.")
      ]
    }],
    quiz: [
      { question: "Đuôi -ed trong \"talked\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 0, explanation: "Âm cuối /k/ → /t/." },
      { question: "Đuôi -ed trong \"decided\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 2, explanation: "Âm cuối /d/ → /ɪd/." },
      { question: "Đuôi -ed trong \"showed\" đọc là?", options: ["/t/", "/d/", "/ɪd/"], answerIndex: 1, explanation: "Nguyên âm /əʊ/ → /d/." },
      { question: "Từ nào có đuôi -ed đọc /ɪd/?", options: ["passed", "rested", "loved", "pushed"], answerIndex: 1, explanation: "rest kết thúc /t/ → /ɪd/." },
      { question: "Từ nào có đuôi -ed đọc KHÁC các từ còn lại?", options: ["finished", "laughed", "hoped", "returned"], answerIndex: 3, explanation: "returned /d/; các từ còn lại /t/." },
      { question: "Tính từ nào luôn đọc đuôi /ɪd/ dù âm cuối không phải /t/, /d/?", options: ["tired", "naked", "bored", "relaxed"], answerIndex: 1, explanation: "naked /ˈneɪkɪd/ là ngoại lệ." }
    ],
    summary: "Đuôi -ed: /ɪd/ sau /t/, /d/; /t/ sau âm vô thanh (p, k, f, s, sh, ch, gh); /d/ sau nguyên âm và âm hữu thanh. Chỉ /ɪd/ mới thêm âm tiết — đừng đọc \"work-ợt\", và đừng nuốt đuôi khi kể chuyện quá khứ."
  })
];
