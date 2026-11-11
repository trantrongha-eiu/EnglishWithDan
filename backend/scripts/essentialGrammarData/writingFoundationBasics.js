"use strict";

// Writing Foundation — Part 1 & 2: the two basic sentence structures and the
// skills for building a complete sentence (A2+). Helpers: writingFoundationHelpers.js
const { lesson } = require("./builder");
const { CATEGORY, STEP, eg, err, mc, ex, qz, table, c, t } = require("./writingFoundationHelpers");

module.exports = [
  // ─────────────────────────────────────────────────────────────
  // 1. STRUCTURE 1 – S + V
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-subject-verb", title: "Structure 1: S + V (câu có hành động)", icon: "🏃", orderIndex: 1,
    overview: "Cấu trúc 1 dùng khi ý chính của câu là một ĐỘNG TỪ THƯỜNG: một hoạt động (play, eat, study), một thói quen (get up early) hoặc một trạng thái được diễn đạt bằng động từ (like, know, have, need, want). Đây là “bộ khung” của phần lớn câu tiếng Anh. Chuyên đề Writing Foundation đi theo 5 bước: Hiểu nghĩa → Chọn cấu trúc → Viết câu → Mở rộng câu → Kết nối câu. Đừng chỉ học thuộc công thức — hãy luyện đủ cả 5 bước ở phần bài tập.",
    formula: [
      { label: "Công thức tổng quát", structure: "S + V + (O) + (thông tin bổ sung: nơi chốn, thời gian...)", example: "My father works in a hospital. / I study English every day." },
      { label: "Có tân ngữ (O)", structure: "S + V + O", example: "I study English. / They watched a movie last night." },
      { label: "Không cần tân ngữ", structure: "S + V (+ thông tin)", example: "She sleeps early. / The baby is crying." },
      { label: "Phủ định", structure: "S + do/does/did + not + V nguyên mẫu", example: "He doesn't play football. / I didn't watch TV yesterday." },
      { label: "Câu hỏi Yes/No", structure: "Do/Does/Did + S + V nguyên mẫu ...?", example: "Do you study English every day? / Did she call you?" }
    ],
    usage: [
      { title: "Bước 1 – Hiểu nghĩa: chủ ngữ LÀM gì / CÓ, CẦN, BIẾT, THÍCH gì?", description: "Nếu ý chính của câu là một động từ (học, chơi, làm việc, thích, biết, có, cần...) → dùng Cấu trúc 1. Ví dụ: “Tôi thích tiếng Anh” → động từ “thích” = like → I like English." },
      { title: "Bước 2 – Chọn cấu trúc: tìm chủ ngữ và động từ chính", description: "Hỏi “Ai?” để tìm chủ ngữ, hỏi “Làm gì?” để tìm động từ. Đã có động từ thường thì KHÔNG thêm am/is/are: I like English (không phải I am like English)." },
      { title: "Bước 3 – Viết câu: chia động từ theo thì", description: "Nhìn từ chỉ thời gian: every day → V(s/es); yesterday → V2/ed; tomorrow → will + V; now → am/is/are + V-ing; for/since → have/has + V3." },
      { title: "Bước 4 – Mở rộng câu", description: "Thêm tân ngữ, nơi chốn, thời gian: I study → I study English → I study English at home every evening." },
      { title: "Bước 5 – Kết nối câu", description: "Nối hai câu S + V bằng and/but/so/because (học ở các bài sau): I study English every day because I want to study abroad." },
      { title: "Động từ chỉ trạng thái vẫn là Cấu trúc 1", description: "Không phải động từ nào cũng là hành động: like, love, know, have, need, want, believe... vẫn dùng S + V. Ví dụ: She likes English. They have two children. He knows the answer." },
      { title: "Lưu ý: am/is/are + V-ing vẫn là Cấu trúc 1", description: "Trong thì tiếp diễn (We are learning English), am/is/are chỉ là trợ động từ đi kèm V-ing, động từ chính vẫn là learn. Lỗi cần tránh là am/is/are + V nguyên mẫu (I am learn English ❌)." }
    ],
    signalWords: ["every day / usually → V(s/es)", "yesterday / last week / ago → V2/ed", "tomorrow / next week → will + V", "now / at the moment → am/is/are + V-ing", "for / since / already → have/has + V3", "He / She / It → V-s/es"],
    examples: [
      eg("I study English.", "Tôi học tiếng Anh."),
      eg("She plays badminton every weekend.", "Cô ấy chơi cầu lông mỗi cuối tuần."),
      eg("My father works in a hospital.", "Bố tôi làm việc ở một bệnh viện."),
      eg("They watched a movie last night.", "Họ đã xem một bộ phim tối qua."),
      eg("We are learning English now.", "Bây giờ chúng tôi đang học tiếng Anh."),
      eg("I eat breakfast every morning.", "Tôi ăn sáng mỗi buổi sáng."),
      eg("She likes English.", "Cô ấy thích tiếng Anh."),
      eg("They have two children.", "Họ có hai đứa con."),
      eg("He knows the answer.", "Anh ấy biết câu trả lời."),
      eg("My sister will visit Da Nang next month.", "Chị gái tôi sẽ đi thăm Đà Nẵng vào tháng tới."),
      eg("I have studied English for three years.", "Tôi đã học tiếng Anh được ba năm."),
      eg("The children were playing in the park at 5 p.m. yesterday.", "Lúc 5 giờ chiều hôm qua, lũ trẻ đang chơi trong công viên."),
      eg("My brother doesn't drink coffee.", "Anh trai tôi không uống cà phê.")
    ],
    mistakes: [
      err("I am study English.", "I study English.", "Đã có động từ thường (study) thì không thêm am/is/are. Muốn nói “đang học” thì dùng am + V-ing: I am studying English."),
      err("I am like English.", "I like English.", "“Like” là động từ thường — câu đã có động từ nên không cần am."),
      err("She play badminton every day.", "She plays badminton every day.", "Hiện tại đơn: He/She/It (và danh từ số ít) + V-s/es."),
      err("He studys English.", "He studies English.", "Phụ âm + y → đổi y thành i rồi thêm -es: study → studies."),
      err("They goed to school yesterday.", "They went to school yesterday.", "“Go” là động từ bất quy tắc: go → went."),
      err("She will studies English.", "She will study English.", "Sau will luôn là động từ nguyên mẫu, với mọi chủ ngữ."),
      err("He doesn't likes coffee.", "He doesn't like coffee.", "Sau does/did + not, động từ trở về nguyên mẫu (does đã mang -s rồi).")
    ],
    tips: [
      "Viết xong mỗi câu, tự hỏi 3 câu: (1) Chủ ngữ là ai? (2) Động từ chính là gì? (3) Thì nào — đã chia đúng chưa (-s/-es, V2, will + V)?",
      "Lỗi quên -s ở ngôi thứ ba số ít (he/she/it, my father, the government...) là lỗi phổ biến nhất làm giảm điểm Grammatical Accuracy trong IELTS Writing và Speaking.",
      "Danh từ số ít hoặc không đếm được làm chủ ngữ cũng chia như he/she/it: Technology changes our lives. The number of students increases every year."
    ],
    comparison: [
      table("Chia động từ thường theo thì", ["Thì", "Công thức", "Ví dụ", "Dấu hiệu"], [
        ["Present Simple", "S + V(s/es)", "She studies English.", "every day, usually, often"],
        ["Past Simple", "S + V2/ed", "She studied English.", "yesterday, last week, ago"],
        ["Future Simple", "S + will + V", "She will study English.", "tomorrow, next week"],
        ["Present Continuous", "S + am/is/are + V-ing", "She is studying English.", "now, at the moment"],
        ["Past Continuous", "S + was/were + V-ing", "She was studying English.", "at 8 p.m. yesterday"],
        ["Present Perfect", "S + have/has + V3", "She has studied English.", "for, since, already"]
      ]),
      table("Thêm -s/-es cho He/She/It (Present Simple)", ["Động từ tận cùng bằng", "Cách thêm", "Ví dụ"], [
        ["Hầu hết động từ", "+ s", "play → plays, work → works"],
        ["-o, -s, -sh, -ch, -x, -z", "+ es", "go → goes, watch → watches, fix → fixes"],
        ["Phụ âm + y", "bỏ y + ies", "study → studies, cry → cries"],
        ["Nguyên âm + y", "+ s", "play → plays, buy → buys"],
        ["have (bất quy tắc)", "→ has", "She has two cats."]
      ]),
      table("Past Simple: có quy tắc và bất quy tắc", ["Loại", "Quy tắc", "Ví dụ"], [
        ["Có quy tắc", "V + ed", "work → worked, play → played, study → studied"],
        ["Bất quy tắc", "học thuộc V2", "go → went, eat → ate, see → saw, have → had, do → did"],
        ["Bất quy tắc (tiếp)", "học thuộc V2", "buy → bought, make → made, write → wrote, take → took, get → got"]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Câu “Tôi có hai anh trai” nên dùng cấu trúc nào?", ["S + V (have)", "S + be + N", "S + be + Adj", "Không cần động từ"], 0, "“Có” = have, một động từ thường → Cấu trúc 1: I have two brothers."),
      mc(STEP.meaning + "Câu nào KHÔNG thuộc Cấu trúc 1 (S + V)?", ["She likes music.", "He knows the answer.", "My mother is a nurse.", "They are playing football."], 2, "“My mother is a nurse” = S + be + N (Cấu trúc 2). “are playing” là thì tiếp diễn của động từ play nên vẫn là S + V."),
      mc(STEP.structure + "Chọn câu đúng cho “Tôi thích đọc sách.”", ["I am like reading books.", "I like reading books.", "I liking reading books.", "I am liking read books."], 1, "“Like” là động từ thường → S + V, không thêm am."),
      ex("fill_blank", STEP.write + "Chia động từ trong ngoặc: “My mother (cook) ___ dinner every evening.”", "cooks", "Every evening → hiện tại đơn; My mother = she → cook + s."),
      ex("fill_blank", STEP.write + "Chia động từ trong ngoặc: “We (visit) ___ our grandparents last Sunday.”", "visited", "Last Sunday → quá khứ đơn: visit + ed."),
      ex("fill_blank", STEP.write + "Chia động từ trong ngoặc: “Look! The children (play) ___ in the garden.”", "are playing", "“Look!” → việc đang diễn ra → hiện tại tiếp diễn: are + V-ing."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “I am go to school by bus every day.”", "I go to school by bus every day.", "Đã có động từ thường go → bỏ am."),
      ex("error_correction", STEP.write + "Sửa lỗi: “She didn't went to the party last night.”", "She didn't go to the party last night.", "Sau didn't, động từ ở dạng nguyên mẫu."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Bố tôi làm việc ở một bệnh viện.”", "My father works in a hospital.", "My father = he → works; “ở một bệnh viện” = in a hospital."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Họ đã xem một bộ phim tối qua.”", "They watched a movie last night.", "Tối qua → quá khứ đơn: watch → watched."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “My brother doesn't drink coffee, but he drinks a lot of tea.”", "Anh trai tôi không uống cà phê, nhưng anh ấy uống rất nhiều trà.", "Hai vế đều là S + V; vế 1 phủ định với doesn't + V nguyên mẫu."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “She has studied English for five years.”", "Cô ấy đã học tiếng Anh được năm năm.", "Has + V3 + for → việc bắt đầu trong quá khứ và vẫn tiếp tục đến nay."),
      ex("sentence_transformation", STEP.write + "Chuyển sang quá khứ đơn, thay “every day” bằng “yesterday”: “She studies English every day.”", "She studied English yesterday.", "Yesterday → V2/ed: study → studied."),
      ex("sentence_transformation", STEP.write + "Chuyển sang câu phủ định: “He plays football every weekend.”", "He doesn't play football every weekend.", "He → doesn't + V nguyên mẫu (plays → play)."),
      ex("sentence_transformation", STEP.write + "Chuyển sang tương lai đơn với “tomorrow”: “I watch a movie.”", "I will watch a movie tomorrow.", "Tomorrow → will + V nguyên mẫu."),
      ex("rewrite", STEP.expand + "Mở rộng câu “I study English.” bằng cách thêm nơi chốn (at home) và thời gian (every evening).", "I study English at home every evening.", "Thứ tự: S + V + O + nơi chốn + thời gian."),
      ex("rewrite", STEP.expand + "Mở rộng câu “She reads books.” — thêm loại sách (English), nơi chốn (in the library) và thời gian (every afternoon).", "She reads English books in the library every afternoon.", "Tính từ đứng trước danh từ (English books); nơi chốn trước thời gian."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “My sister watch TV every night.”", "Lỗi: watch → watches.", "My sister = she → watch + es (động từ tận cùng -ch)."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “They will to travel to Hue next week.”", "Lỗi: will to travel → will travel.", "Sau will là V nguyên mẫu, không có “to”."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại (chia động từ trong ngoặc):\nA: What do you usually do in the evening?\nB: I usually ___ (do) my homework, and then I ___ (watch) TV.\nA: What did you do last night?\nB: I ___ (go) to the cinema with my friends.", "do / watch / went", "Usually → hiện tại đơn (do, watch); last night → quá khứ đơn (go → went).")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Chia động từ theo thì",
      intro: "Chia động từ trong ngoặc — nhìn từ chỉ thời gian để chọn thì. Viết cả trợ động từ nếu có (ví dụ: doesn't like, will have). Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("She ___ (go) to school by bike every day.", "goes", "Every day + she → go + es."),
        c("I ___ (see) a famous singer at the airport yesterday.", "saw", "Yesterday → quá khứ đơn; see → saw (bất quy tắc)."),
        c("We ___ (have) a test tomorrow.", ["will have", "are going to have", "are having"], "Tomorrow → will + V."),
        c("My parents ___ (live) in Can Tho.", "live", "Sự thật ở hiện tại; My parents = they → live."),
        c("Be quiet! The baby ___ (sleep).", "is sleeping", "“Be quiet!” → đang diễn ra → is + V-ing."),
        c("He ___ (not / like) spicy food.", "doesn't like", "Phủ định hiện tại đơn với he: doesn't + V nguyên mẫu."),
        c("They ___ (buy) a new car two days ago.", "bought", "Ago → quá khứ đơn; buy → bought."),
        c("I ___ (study) English since 2020.", ["have studied", "have been studying"], "Since → hiện tại hoàn thành: have + V3."),
        c("At 8 p.m. last night, we ___ (watch) a football match.", "were watching", "Một thời điểm cụ thể trong quá khứ → quá khứ tiếp diễn."),
        c("Tom ___ (fix) his bike every weekend.", "fixes", "Every weekend + Tom (he) → fix + es."),
        c("She ___ (not / go) to the party last week.", "didn't go", "Phủ định quá khứ đơn: didn't + V nguyên mẫu."),
        c("My brother ___ (become) a doctor in the future.", ["will become", "is going to become"], "In the future → will + V."),
        c("The shop ___ (open) at 8 a.m. every day.", "opens", "Lịch cố định, every day → open + s.")
      ]
    }],
    translationDrills: [{
      title: "Luyện viết câu S + V: Việt → Anh",
      intro: "Dịch sang tiếng Anh bằng Cấu trúc 1 (S + V), chia động từ đúng thì.",
      items: [
        t("Tôi học tiếng Anh mỗi ngày.", ["I study English every day.", "I learn English every day."], "Hiện tại đơn, chủ ngữ I → động từ nguyên mẫu."),
        t("Mẹ tôi nấu bữa tối ở nhà mỗi tối.", ["My mother cooks dinner at home every evening.", "My mom cooks dinner at home every evening.", "My mother cooks dinner at home every night.", "My mom cooks dinner at home every night."], "My mother = she → cook thêm -s; thứ tự: S + V + O + nơi chốn + thời gian."),
        t("Cô ấy thích tiếng Anh.", "She likes English.", "Like là động từ thường — không thêm is."),
        t("Họ có hai đứa con.", ["They have two children.", "They have two kids."], "“Có” = have."),
        t("Anh ấy đã chơi bóng đá ở trường hôm qua.", ["He played football at school yesterday.", "He played soccer at school yesterday."], "Hôm qua → V2/ed."),
        t("Chúng tôi sẽ đi thăm ông bà vào tuần tới.", ["We will visit our grandparents next week.", "We are going to visit our grandparents next week."], "Tuần tới → will + V nguyên mẫu."),
        t("Bây giờ tôi đang làm bài tập về nhà.", ["I am doing my homework now.", "I am doing homework now.", "Now I am doing my homework.", "I am doing my homework right now."], "Đang → am + V-ing."),
        t("Em trai tôi không uống cà phê.", ["My younger brother doesn't drink coffee.", "My little brother doesn't drink coffee.", "My brother doesn't drink coffee."], "Phủ định với he → doesn't + V nguyên mẫu."),
        t("Bố tôi biết câu trả lời.", ["My father knows the answer.", "My dad knows the answer."], "Know là động từ chỉ trạng thái nhưng vẫn là S + V."),
        t("Tôi đã học tiếng Anh được ba năm.", ["I have studied English for three years.", "I have learned English for three years.", "I have learnt English for three years.", "I have been studying English for three years.", "I have been learning English for three years."], "“Được ba năm” → have + V3 + for."),
        t("Bạn có chơi thể thao mỗi cuối tuần không?", ["Do you play sports every weekend?", "Do you play sport every weekend?", "Do you play sports at the weekend?", "Do you play sports on weekends?"], "Câu hỏi: Do + S + V nguyên mẫu?")
      ]
    }],
    quiz: [
      qz("Chọn đáp án đúng: “He ___ English every day.”", ["study", "studies", "is study", "studying"], 1, "He + hiện tại đơn → studies."),
      qz("Chọn đáp án đúng: “They ___ football yesterday.”", ["play", "plays", "played", "will play"], 2, "Yesterday → quá khứ đơn."),
      qz("Câu nào dịch đúng “Tôi cần một cái máy tính mới”?", ["I am need a new computer.", "I need a new computer.", "I needs a new computer.", "I am a new computer."], 1, "Need là động từ thường; chủ ngữ I → need."),
      qz("Chọn đáp án đúng: “She ___ to Da Lat next week.”", ["travels", "travelled", "will travel", "is travel"], 2, "Next week → will + V."),
      qz("Câu nào đúng?", ["My father work in a bank.", "My father is work in a bank.", "My father works in a bank.", "My father working in a bank."], 2, "My father = he → works; không thêm is."),
      qz("Chọn đáp án đúng: “Listen! Somebody ___ the piano.”", ["plays", "is playing", "play", "played"], 1, "“Listen!” → đang diễn ra → is playing.")
    ],
    summary: "Cấu trúc 1 = S + V (+ O) + thông tin. Dùng khi ý chính là một động từ thường (hành động, thói quen, like/know/have/need). Đã có động từ thường thì không thêm am/is/are; chia động từ theo thì dựa vào từ chỉ thời gian."
  }),

  // ─────────────────────────────────────────────────────────────
  // 2. STRUCTURE 2 – S + BE + ADJ / N
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-subject-be", title: "Structure 2: S + be + Adj/N (mô tả, trạng thái, danh tính)", icon: "🪞", orderIndex: 2,
    overview: "Cấu trúc 2 dùng khi câu KHÔNG có động từ hành động mà chỉ mô tả chủ ngữ: tính chất (beautiful), cảm xúc/trạng thái (tired), danh tính/nghề nghiệp (a student) hoặc vị trí (at home). Động từ BE (am/is/are/was/were/will be) là “chiếc cầu” nối chủ ngữ với phần mô tả. Tiếng Việt thường bỏ “là/thì” (“Cô ấy đẹp”, “Tôi mệt”) nên người Việt rất hay quên BE.",
    formula: [
      { label: "Tính chất / cảm xúc", structure: "S + be + Adj", example: "She is intelligent. / I am tired." },
      { label: "Danh tính / nghề nghiệp", structure: "S + be + (a/an) + N", example: "My father is an engineer. / They are students." },
      { label: "Vị trí", structure: "S + be + giới từ + nơi chốn", example: "The book is on the table. / I am at home." },
      { label: "Phủ định", structure: "S + be + not + Adj/N", example: "I am not tired. / They weren't at home." },
      { label: "Câu hỏi Yes/No", structure: "Be + S + Adj/N ...?", example: "Are you a student? / Was the test difficult?" }
    ],
    usage: [
      { title: "Bước 1 – Hiểu nghĩa: câu mô tả chủ ngữ NHƯ THẾ NÀO / LÀ AI / Ở ĐÂU?", description: "“Tôi mệt”, “Cô ấy là giáo viên”, “Họ ở trong lớp” → không có hành động → Cấu trúc 2." },
      { title: "Bước 2 – Chọn cấu trúc & chọn BE theo chủ ngữ", description: "I → am/was; He/She/It/danh từ số ít → is/was; You/We/They/danh từ số nhiều → are/were." },
      { title: "Bước 3 – Viết câu: chia BE theo thì", description: "now/every day → am/is/are; yesterday/last year → was/were; tomorrow/in the future → will be; for/since → have/has been." },
      { title: "Bước 4 – Mở rộng câu", description: "Thêm trạng từ mức độ (very, quite, really), tính từ trước danh từ, nơi chốn/thời gian: She is a teacher → She is a very kind teacher at my school." },
      { title: "Bước 5 – Kết nối câu", description: "Kết hợp với Cấu trúc 1: My sister is a nurse, and she works at a big hospital." },
      { title: "Danh từ nghề nghiệp số ít cần a/an", description: "My father is a doctor (không phải is doctor). An + nguyên âm: an engineer, an English teacher." }
    ],
    signalWords: ["I → am / was", "He / She / It → is / was", "You / We / They → are / were", "tomorrow / in the future → will be", "for / since → have/has been", "very / quite / really + Adj"],
    examples: [
      eg("I am happy.", "Tôi vui."),
      eg("She is beautiful.", "Cô ấy đẹp."),
      eg("They are tired after the trip.", "Họ mệt sau chuyến đi."),
      eg("He is a student.", "Anh ấy là học sinh."),
      eg("My father is a doctor.", "Bố tôi là bác sĩ."),
      eg("English is an important subject.", "Tiếng Anh là một môn học quan trọng."),
      eg("The city is beautiful and peaceful.", "Thành phố đẹp và yên bình."),
      eg("I am at home.", "Tôi đang ở nhà."),
      eg("The book is on the table.", "Cuốn sách ở trên bàn."),
      eg("They were excited about the trip yesterday.", "Hôm qua họ rất hào hứng về chuyến đi."),
      eg("She will be a teacher in the future.", "Trong tương lai cô ấy sẽ là giáo viên."),
      eg("We have been friends for ten years.", "Chúng tôi đã là bạn được mười năm."),
      eg("The test wasn't difficult.", "Bài kiểm tra không khó.")
    ],
    mistakes: [
      err("She beautiful.", "She is beautiful.", "Câu mô tả bằng tính từ phải có BE — tiếng Việt không có “là” nhưng tiếng Anh bắt buộc."),
      err("I very happy.", "I am very happy.", "Thiếu động từ BE: S + be + (very) + Adj."),
      err("He is play football.", "He plays football. / He is playing football.", "Không dùng BE + V nguyên mẫu. Thói quen → plays; đang diễn ra → is playing."),
      err("My father is doctor.", "My father is a doctor.", "Danh từ nghề nghiệp số ít cần a/an."),
      err("They was tired yesterday.", "They were tired yesterday.", "They → were (quá khứ)."),
      err("I am agree with you.", "I agree with you.", "“Agree” là động từ thường → Cấu trúc 1, không thêm am."),
      err("She will is a teacher.", "She will be a teacher.", "Sau will dùng be (nguyên mẫu), không dùng is/am/are."),
      err("I am interesting in English.", "I am interested in English.", "Cảm xúc của người dùng tính từ -ed (interested, bored); tính từ -ing mô tả sự vật (The film is interesting).")
    ],
    tips: [
      "Mẹo nhanh: thử thêm chữ “là / thì / ở” vào câu tiếng Việt. Nếu câu chỉ mô tả, nhận diện hoặc nói vị trí (không có hành động) → cần BE.",
      "Không bao giờ đặt BE trước động từ nguyên mẫu (I am study ❌, I am agree ❌). BE chỉ đi với tính từ, danh từ, cụm nơi chốn hoặc V-ing (thì tiếp diễn).",
      "Trong IELTS Writing Task 1, Cấu trúc 2 dùng rất nhiều để nhận xét số liệu: The figure was highest in 2010. Coal is the most popular source of energy."
    ],
    comparison: [
      table("Chia động từ BE theo thì", ["Thì", "Công thức", "Ví dụ"], [
        ["Present Simple", "am / is / are", "She is happy."],
        ["Past Simple", "was / were", "She was happy."],
        ["Future Simple", "will be", "She will be happy."],
        ["Present Perfect", "have / has been", "She has been happy."]
      ]),
      table("Bảng chọn BE theo chủ ngữ", ["Chủ ngữ", "Hiện tại", "Quá khứ", "Phủ định viết tắt"], [
        ["I", "am", "was", "I'm not / wasn't"],
        ["He / She / It / danh từ số ít", "is", "was", "isn't / wasn't"],
        ["You / We / They / danh từ số nhiều", "are", "were", "aren't / weren't"]
      ]),
      table("So sánh Cấu trúc 1 và Cấu trúc 2", ["Câu", "Cấu trúc", "Nghĩa"], [
        ["I study English.", "S + V", "Tôi học tiếng Anh."],
        ["I am a student.", "S + be + N", "Tôi là học sinh."],
        ["She plays football.", "S + V", "Cô ấy chơi bóng đá."],
        ["She is happy.", "S + be + Adj", "Cô ấy vui."],
        ["They live in Vietnam.", "S + V", "Họ sống ở Việt Nam."],
        ["They are Vietnamese.", "S + be + Adj", "Họ là người Việt Nam."]
      ]),
      table("Mẹo 3 bước chọn cấu trúc", ["Bước", "Tự hỏi", "Kết quả"], [
        ["1. Hiểu nghĩa", "Câu nói về hoạt động/thói quen, hay về đặc điểm, cảm xúc, danh tính, vị trí?", "Hoạt động → Cấu trúc 1; mô tả → Cấu trúc 2"],
        ["2. Tìm động từ", "Đã có động từ thường phù hợp chưa?", "Có → không thêm BE; chỉ có tính từ/danh từ → thêm BE"],
        ["3. Chia thì", "Chuyện xảy ra khi nào?", "I studied English yesterday. / I was tired yesterday."]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Câu “Cô ấy là một y tá” nói về điều gì?", ["Hành động", "Danh tính / nghề nghiệp", "Thói quen", "Lý do"], 1, "Danh tính/nghề nghiệp → Cấu trúc 2: She is a nurse."),
      mc(STEP.structure + "Chọn câu đúng cho “Tôi rất mệt.”", ["I very tired.", "I am very tired.", "I tired very.", "I am very tire."], 1, "S + be + very + Adj: I am very tired."),
      mc(STEP.structure + "Chỗ trống nào cần điền động từ BE?", ["She ___ English every day.", "They ___ very friendly.", "He ___ football on Sundays.", "I ___ breakfast at 7."], 1, "“Very friendly” là tính từ → cần BE: They are very friendly. Các câu còn lại cần động từ thường."),
      ex("fill_blank", STEP.write + "Điền BE: “My parents ___ teachers.” (hiện tại)", "are", "My parents = they → are."),
      ex("fill_blank", STEP.write + "Điền BE: “I ___ at home last night.”", "was", "Last night + I → was."),
      ex("fill_blank", STEP.write + "Điền BE: “The weather ___ sunny tomorrow.”", "will be", "Tomorrow → will be."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “My sister is work in a bank.”", "My sister works in a bank.", "Work là động từ thường → bỏ is, thêm -s."),
      ex("error_correction", STEP.write + "Sửa lỗi: “The students was excited about the trip.”", "The students were excited about the trip.", "The students (số nhiều) → were."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Thành phố của tôi rất đẹp và yên bình.”", "My city is very beautiful and peaceful.", "S + be + Adj; nối hai tính từ bằng and."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Cuốn sách ở trên bàn.”", "The book is on the table.", "Vị trí → S + be + giới từ + nơi chốn."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “My mother is a nurse, and she is very kind.”", "Mẹ tôi là y tá, và bà ấy rất tốt bụng.", "Vế 1: be + N (nghề nghiệp); vế 2: be + Adj (tính cách)."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “We were tired, but we were happy.”", "Chúng tôi mệt, nhưng chúng tôi vui.", "Were = quá khứ của are."),
      ex("sentence_transformation", STEP.write + "Chuyển sang quá khứ, thêm “yesterday”: “I am tired.”", "I was tired yesterday.", "I + quá khứ → was."),
      ex("sentence_transformation", STEP.write + "Chuyển sang câu hỏi: “They are in the classroom.”", "Are they in the classroom?", "Câu hỏi với BE: đảo BE lên trước chủ ngữ."),
      ex("sentence_transformation", STEP.write + "Chuyển sang câu phủ định: “English is difficult.”", "English is not difficult. / English isn't difficult.", "Phủ định: BE + not."),
      ex("rewrite", STEP.expand + "Mở rộng câu “She is a teacher.” bằng hai tính từ (young, friendly) và nơi chốn (at my school).", "She is a young and friendly teacher at my school.", "Tính từ đứng trước danh từ; nơi chốn đứng cuối."),
      ex("rewrite", STEP.connect + "Viết 2 câu về cùng một người: 1 câu Cấu trúc 2, 1 câu Cấu trúc 1. Gợi ý: My father / doctor / work / hospital.", "My father is a doctor. He works in a hospital.", "Câu 1: S + be + N; câu 2: S + V (works)."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “He is a engineer and he very busy.”", "Lỗi 1: a engineer → an engineer. Lỗi 2: he very busy → he is very busy.", "An + âm nguyên âm; câu mô tả bằng tính từ cần BE."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “I am interesting in learning English.”", "Lỗi: interesting → interested.", "Cảm xúc của người → tính từ -ed: be interested in."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại với dạng đúng của BE:\nA: Where ___ you yesterday?\nB: I ___ at my grandmother's house. She ___ sick.\nA: Oh, ___ she better now?\nB: Yes, she ___ fine now, thanks.", "were / was / was / Is / is", "Yesterday → were/was; now → is.")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Điền BE hoặc động từ thường",
      intro: "Điền dạng đúng của từ trong ngoặc. Nếu là (be) → chọn am/is/are/was/were/will be theo chủ ngữ và thời gian; nếu là động từ thường → chia theo thì. Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("I ___ (be) a student at Nguyen Du High School.", "am", "I → am."),
        c("She ___ (be) very happy yesterday.", "was", "Yesterday + she → was."),
        c("My parents ___ (be) at work now.", "are", "My parents = they → are."),
        c("He ___ (work) in a bank.", "works", "Work là động từ thường; he → works."),
        c("The test ___ (be) easy last week.", "was", "Last week + danh từ số ít → was."),
        c("We ___ (be) in Grade 11 next year.", "will be", "Next year → will be."),
        c("Tom and Jerry ___ (be) good friends.", "are", "Hai người → are."),
        c("My mother ___ (cook) very well.", "cooks", "Cook là động từ thường; my mother → cooks."),
        c("They ___ (not / be) at home last night.", "weren't", "Phủ định quá khứ với they → weren't."),
        c("___ (be) you tired now?", "Are", "Câu hỏi: Are + you...?"),
        c("It ___ (be) cold and windy yesterday.", "was", "Yesterday + it → was."),
        c("I ___ (be) interested in music.", "am", "I → am; be interested in."),
        c("English ___ (be) an important subject.", "is", "English (danh từ không đếm được) → is.")
      ]
    }],
    translationDrills: [{
      title: "Luyện viết câu S + be: Việt → Anh",
      intro: "Dịch sang tiếng Anh bằng Cấu trúc 2 (S + be + Adj/N/nơi chốn).",
      items: [
        t("Tôi là học sinh.", ["I am a student.", "I am a pupil."], "Nghề nghiệp/danh tính số ít → a + N."),
        t("Cô ấy rất thân thiện.", "She is very friendly.", "S + be + very + Adj."),
        t("Bố tôi là một kỹ sư.", ["My father is an engineer.", "My dad is an engineer."], "Engineer bắt đầu bằng âm nguyên âm → an."),
        t("Chúng tôi đang ở trong lớp học.", ["We are in the classroom.", "We are in class.", "We are in the class."], "“Đang ở” là vị trí → be + in..., không dùng V-ing."),
        t("Hôm qua tôi đã rất mệt.", ["I was very tired yesterday.", "Yesterday I was very tired.", "I was so tired yesterday."], "Hôm qua + I → was."),
        t("Tiếng Anh là một môn học quan trọng.", "English is an important subject.", "Important bắt đầu bằng nguyên âm → an."),
        t("Họ không vui.", ["They are not happy.", "They are unhappy."], "Phủ định: are + not."),
        t("Bài kiểm tra hôm qua có khó không?", ["Was the test difficult yesterday?", "Was yesterday's test difficult?", "Was the test yesterday difficult?", "Was the test hard yesterday?", "Was yesterday's test hard?"], "Câu hỏi quá khứ: Was + S + Adj?"),
        t("Em gái tôi sẽ là bác sĩ trong tương lai.", ["My younger sister will be a doctor in the future.", "My little sister will be a doctor in the future.", "My sister will be a doctor in the future."], "Tương lai → will be."),
        t("Thành phố này đẹp nhưng đông đúc.", ["This city is beautiful but crowded.", "This city is beautiful, but it is crowded.", "The city is beautiful but crowded.", "The city is beautiful, but it is crowded."], "Hai tính từ trái nghĩa nối bằng but."),
        t("Tôi hứng thú với âm nhạc.", ["I am interested in music."], "Cảm xúc của người → -ed: be interested in.")
      ]
    }],
    quiz: [
      qz("Chọn đáp án đúng: “My friends ___ very friendly.”", ["is", "are", "am", "be"], 1, "My friends (số nhiều) → are."),
      qz("Câu nào dịch đúng “Tôi đã ở nhà hôm qua”?", ["I am at home yesterday.", "I was at home yesterday.", "I were at home yesterday.", "I at home yesterday."], 1, "Yesterday + I → was."),
      qz("Câu nào đúng?", ["He is play football.", "He plays football.", "He is plays football.", "He playing football."], 1, "Play là động từ thường → không thêm is."),
      qz("Chọn đáp án đúng: “She ___ a doctor in the future.”", ["is", "was", "will be", "will is"], 2, "In the future → will be."),
      qz("Chọn đáp án đúng: “My father is ___.”", ["engineer", "an engineer", "a engineer", "the engineers"], 1, "Nghề nghiệp số ít + âm nguyên âm → an engineer."),
      qz("Câu nào SAI?", ["I am a student.", "She is at school.", "They are agree with me.", "We are tired."], 2, "Agree là động từ thường → They agree with me.")
    ],
    summary: "Cấu trúc 2 = S + be + Adj / N / nơi chốn. Dùng khi mô tả tính chất, cảm xúc, danh tính, nghề nghiệp, vị trí. Chọn BE theo chủ ngữ (am/is/are – was/were – will be) và không bao giờ đặt BE trước động từ nguyên mẫu."
  }),

  // ─────────────────────────────────────────────────────────────
  // 3. SENTENCE BUILDING SKILLS
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-building-skills", title: "Sentence Building Skills: viết câu hoàn chỉnh", icon: "🧱", orderIndex: 3,
    overview: "Biết công thức chưa đủ — bài này dạy cách lắp các thành phần thành một câu hoàn chỉnh và đủ ý: câu luôn có chủ ngữ + động từ, không dịch từng chữ tiếng Việt, viết theo thứ tự S + V + O + nơi chốn + thời gian, chọn thì nhờ từ chỉ thời gian và mở rộng câu bằng How / Where / When / Why. Cuối bài có bảng từ vựng nền tảng để tự đặt câu.",
    formula: [
      { label: "Câu luôn cần", structure: "Chủ ngữ (S) + Động từ (V hoặc BE)", example: "Very beautiful. ❌ → The city is very beautiful. ✅" },
      { label: "Thứ tự cơ bản", structure: "S + V + O + Place + Time", example: "I study English at home every evening." },
      { label: "Công thức mở rộng", structure: "S + V + O + How + Where + When + Why", example: "She studies English carefully at home every evening because she wants to get a high IELTS score." },
      { label: "Trạng từ tần suất", structure: "S + always/usually/often/sometimes/never + V  •  S + be + always/usually...", example: "I usually get up early. / She is always friendly." },
      { label: "“Có” (tồn tại)", structure: "There is + N số ít / There are + N số nhiều + nơi chốn", example: "There is a big library at my school." }
    ],
    usage: [
      { title: "Quy tắc 1 – Một câu phải có chủ ngữ và động từ", description: "Tiếng Việt hay bỏ chủ ngữ (“Học tiếng Anh mỗi ngày”), tiếng Anh thì không: I study English every day. Câu chỉ có tính từ cũng thiếu: Happy with my friends ❌ → I am happy with my friends ✅." },
      { title: "Quy tắc 2 – Không dịch từng từ tiếng Việt", description: "“Tôi rất thích tiếng Anh” → I really like English / I like English very much (không phải I very like English). “Tôi rất vui” → I am very happy (cần BE). “Ở trường tôi có thư viện” → There is a library at my school / My school has a library (không phải At my school has a library)." },
      { title: "Quy tắc 3 – Viết theo thứ tự S + V + O + Place + Time", description: "Nơi chốn đứng trước thời gian; không chen trạng từ vào giữa động từ và tân ngữ: I like English very much (không phải I like very much English)." },
      { title: "Quy tắc 4 – Dùng từ chỉ thời gian để chọn thì", description: "every day/usually → hiện tại đơn; yesterday/last week/ago → quá khứ đơn; tomorrow/next week → will; now → hiện tại tiếp diễn." },
      { title: "Quy tắc 5 – Thêm thông tin để câu dài hơn", description: "I study English → I study English every day → I study English at home every day → I study English at home every day because I want to improve my English." },
      { title: "Quy trình 5 bước khi viết một câu", description: "Hiểu nghĩa (câu nói gì?) → Chọn cấu trúc (S + V hay S + be?) → Viết câu (chia thì) → Mở rộng câu (How/Where/When/Why) → Kết nối câu (and/but/so/because...)." }
    ],
    signalWords: ["Who? → Subject", "Do what? → Verb + Object", "How? → carefully, quickly, hard", "Where? → at home, at school, in the library", "When? → every day, yesterday, tomorrow", "Why? → because + S + V", "always / usually / often / sometimes / never"],
    examples: [
      eg("I study English at home every evening.", "Tôi học tiếng Anh ở nhà mỗi tối."),
      eg("She reads books in the library every day.", "Cô ấy đọc sách ở thư viện mỗi ngày."),
      eg("They play football at school after class.", "Họ chơi bóng đá ở trường sau giờ học."),
      eg("My mother cooks dinner at home every evening.", "Mẹ tôi nấu bữa tối ở nhà mỗi tối."),
      eg("I really like English.", "Tôi rất thích tiếng Anh."),
      eg("I am very happy with my friends.", "Tôi rất vui khi ở cùng bạn bè."),
      eg("There is a big library at my school.", "Ở trường tôi có một thư viện lớn."),
      eg("I usually get up at six o'clock.", "Tôi thường dậy lúc sáu giờ."),
      eg("She is always friendly to everyone.", "Cô ấy luôn thân thiện với mọi người."),
      eg("I played football yesterday, and I will play again tomorrow.", "Hôm qua tôi đã chơi bóng đá, và ngày mai tôi sẽ chơi tiếp."),
      eg("I study English at home every day because I want to improve my English.", "Tôi học tiếng Anh ở nhà mỗi ngày vì tôi muốn cải thiện tiếng Anh của mình."),
      eg("She studies English carefully at home every evening because she wants to get a high IELTS score.", "Cô ấy học tiếng Anh chăm chỉ ở nhà mỗi tối vì cô ấy muốn đạt điểm IELTS cao.")
    ],
    mistakes: [
      err("I very like English.", "I really like English. / I like English very much.", "“Very” không đứng trước động từ. Dùng really + V, hoặc V + O + very much."),
      err("Study English every day.", "I study English every day.", "Câu tiếng Anh phải có chủ ngữ."),
      err("I like very much English.", "I like English very much.", "Không chen trạng từ giữa động từ và tân ngữ."),
      err("I study every evening English at home.", "I study English at home every evening.", "Thứ tự: V + O + nơi chốn + thời gian."),
      err("At my school has a big library.", "There is a big library at my school. / My school has a big library.", "Cụm nơi chốn không làm chủ ngữ được. “Ở... có...” → There is/are hoặc dùng địa điểm làm chủ ngữ + has."),
      err("She always is late.", "She is always late.", "Trạng từ tần suất đứng SAU BE nhưng TRƯỚC động từ thường (She always arrives late)."),
      err("Yesterday I play football.", "Yesterday I played football.", "Có “yesterday” → quá khứ đơn.")
    ],
    tips: [
      "Viết câu ngắn đúng trước, rồi mới thêm thông tin — một câu dài sai cấu trúc bị trừ điểm nhiều hơn một câu ngắn đúng.",
      "Trước khi viết, “tách” câu tiếng Việt thành: Ai? – Làm gì/Là gì? – Cái gì? – Ở đâu? – Khi nào? – Tại sao? rồi lắp lại theo thứ tự tiếng Anh.",
      "IELTS Speaking Part 1: trả lời bằng 1 câu cơ bản + 1–2 thông tin mở rộng là tự nhiên nhất: I usually study at the library in the evening because it's quiet."
    ],
    comparison: [
      table("Phân tích câu theo thứ tự S + V + O + Place + Time", ["Subject", "Verb", "Object", "Place", "Time"], [
        ["I", "study", "English", "at home", "every evening"],
        ["She", "reads", "books", "in the library", "every day"],
        ["They", "play", "football", "at school", "after class"],
        ["My mother", "cooks", "dinner", "at home", "every evening"]
      ]),
      table("Từ chỉ thời gian → Thì", ["Time expressions", "Thì thường dùng", "Ví dụ"], [
        ["every day, usually, often", "Present Simple", "I play football every day."],
        ["yesterday, last week, two days ago", "Past Simple", "I played football yesterday."],
        ["tomorrow, next week", "Future Simple", "I will play football tomorrow."],
        ["now, at the moment", "Present Continuous", "I am playing football now."]
      ]),
      table("Mở rộng câu từng bước", ["Thêm", "Câu"], [
        ["Câu gốc", "I study English."],
        ["+ When", "I study English every day."],
        ["+ Where", "I study English at home every day."],
        ["+ Why", "I study English at home every day because I want to improve my English."],
        ["+ How", "I study English carefully at home every day because I want to improve my English."]
      ]),
      table("Từ vựng: Động từ thông dụng", ["Verb", "Nghĩa", "Verb", "Nghĩa"], [
        ["study", "học", "learn", "học / tiếp thu"],
        ["improve", "cải thiện", "practise / practice", "luyện tập"],
        ["read", "đọc", "write", "viết"],
        ["speak", "nói", "listen", "nghe"],
        ["work", "làm việc", "play", "chơi"],
        ["exercise", "tập thể dục", "travel", "du lịch"],
        ["visit", "thăm", "enjoy", "tận hưởng"],
        ["prefer", "thích hơn", "like", "thích"],
        ["love", "yêu thích", "hate", "ghét"],
        ["need", "cần", "want", "muốn"],
        ["help", "giúp đỡ", "make", "làm / tạo ra"],
        ["do", "làm", "buy", "mua"],
        ["eat", "ăn", "drink", "uống"],
        ["sleep", "ngủ", "live", "sống"],
        ["stay", "ở", "become", "trở thành"],
        ["feel", "cảm thấy", "seem", "có vẻ"],
        ["know", "biết", "believe", "tin"]
      ]),
      table("Từ vựng: Tính từ thông dụng", ["Adjective", "Nghĩa", "Adjective", "Nghĩa"], [
        ["happy", "vui", "sad", "buồn"],
        ["tired", "mệt", "excited", "hào hứng"],
        ["nervous", "lo lắng", "relaxed", "thư giãn"],
        ["busy", "bận", "free", "rảnh"],
        ["friendly", "thân thiện", "helpful", "hay giúp đỡ"],
        ["kind", "tốt bụng", "intelligent", "thông minh"],
        ["interesting", "thú vị", "boring", "nhàm chán"],
        ["difficult", "khó", "easy", "dễ"],
        ["important", "quan trọng", "useful", "hữu ích"],
        ["beautiful", "đẹp", "expensive", "đắt"],
        ["cheap", "rẻ", "convenient", "tiện lợi"],
        ["healthy", "khỏe mạnh", "popular", "phổ biến"]
      ]),
      table("Từ vựng: Danh từ thông dụng", ["Noun", "Nghĩa", "Noun", "Nghĩa"], [
        ["student", "học sinh", "teacher", "giáo viên"],
        ["friend", "bạn bè", "family", "gia đình"],
        ["school", "trường học", "subject", "môn học"],
        ["hobby", "sở thích", "exercise", "bài tập / việc tập thể dục"],
        ["knowledge", "kiến thức", "experience", "kinh nghiệm"],
        ["environment", "môi trường", "technology", "công nghệ"],
        ["education", "giáo dục", "health", "sức khỏe"],
        ["opportunity", "cơ hội", "problem", "vấn đề"],
        ["solution", "giải pháp", "advantage / disadvantage", "lợi ích / bất lợi"]
      ]),
      table("Cụm từ hữu ích", ["Phrase", "Nghĩa", "Phrase", "Nghĩa"], [
        ["every day", "mỗi ngày", "in my free time", "vào thời gian rảnh"],
        ["at school", "ở trường", "at home", "ở nhà"],
        ["with my friends", "với bạn bè", "in the future", "trong tương lai"],
        ["a lot of", "nhiều", "a little", "một ít"],
        ["really", "thực sự / rất", "very", "rất"],
        ["quite", "khá", "especially", "đặc biệt là"],
        ["for example", "ví dụ", "such as", "chẳng hạn như"],
        ["in my opinion", "theo ý kiến của tôi", "", ""]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Câu nào là một câu HOÀN CHỈNH?", ["Very beautiful.", "Study English every day.", "The city is very beautiful.", "Happy with my friends."], 2, "Chỉ câu C có đủ chủ ngữ (The city) và động từ (is)."),
      mc(STEP.structure + "Chọn câu dịch đúng: “Tôi rất thích tiếng Anh.”", ["I very like English.", "I like very much English.", "I really like English.", "I am very like English."], 2, "Really + V; hoặc I like English very much."),
      mc(STEP.structure + "Câu nào đúng trật tự?", ["I football play in the park every Sunday.", "I play in the park football every Sunday.", "I play football in the park every Sunday.", "Every Sunday I in the park play football."], 2, "S + V + O + Place + Time."),
      mc(STEP.write + "Chọn đáp án đúng: “I ___ my grandparents two days ago.”", ["visit", "visited", "will visit", "am visiting"], 1, "Two days ago → quá khứ đơn."),
      ex("fill_blank", STEP.write + "Chia động từ: “Look! I (play) ___ football with my brother now.”", "am playing", "Now → hiện tại tiếp diễn."),
      ex("fill_blank", STEP.structure + "Điền từ thích hợp: “There ___ a big library at my school.”", "is", "There is + danh từ số ít."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “I very happy with my new school.”", "I am very happy with my new school.", "Câu mô tả cảm xúc cần BE."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “At my school has a big library.”", "There is a big library at my school. / My school has a big library.", "Cụm nơi chốn không làm chủ ngữ; dùng There is hoặc My school has."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Cô ấy đọc sách ở thư viện mỗi ngày.”", "She reads books in the library every day.", "S + V + O + Place + Time; she → reads."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Ở thành phố của tôi có nhiều công viên.”", "There are many parks in my city. / My city has many parks.", "“Ở... có...” → There are + danh từ số nhiều."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “They play football at school after class.”", "Họ chơi bóng đá ở trường sau giờ học.", "Nơi chốn (at school) đứng trước thời gian (after class)."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “In my free time, I usually listen to music with my friends.”", "Vào thời gian rảnh, tôi thường nghe nhạc cùng bạn bè.", "Usually đứng trước động từ thường listen."),
      ex("sentence_transformation", STEP.write + "Sắp xếp thành câu đúng: every evening / dinner / cooks / at home / my mother", "My mother cooks dinner at home every evening.", "S + V + O + Place + Time."),
      ex("sentence_transformation", STEP.write + "Sắp xếp thành câu đúng: always / is / she / friendly", "She is always friendly.", "Trạng từ tần suất đứng sau BE."),
      ex("sentence_transformation", STEP.write + "Sắp xếp thành câu đúng: in the library / we / English books / read / on Saturdays", "We read English books in the library on Saturdays.", "S + V + O + Place + Time."),
      ex("rewrite", STEP.expand + "Mở rộng câu “I play badminton.” theo công thức S + V + O + Where + When + Why.", "I play badminton in the park every morning because I want to stay healthy.", "Where (in the park) → When (every morning) → Why (because + S + V)."),
      ex("rewrite", STEP.expand + "Mở rộng câu “My brother studies.” — thêm môn học (maths), How (very hard), Where (in his room), When (every night).", "My brother studies maths very hard in his room every night.", "S + V + O + How + Where + When."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “I like very much reading books.”", "Lỗi: like very much reading books → like reading books very much.", "Very much đứng sau tân ngữ."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “Yesterday my father buy a new phone.”", "Lỗi: buy → bought.", "Yesterday → quá khứ đơn; buy → bought."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại bằng câu tiếng Anh đầy đủ:\nA: What do you usually do in your free time?\nB: ___ (Tôi thường đọc sách ở nhà vào buổi tối.)\nA: Why?\nB: ___ (Vì tôi muốn cải thiện tiếng Anh.)", "I usually read books at home in the evening. / Because I want to improve my English.", "Câu 1: S + usually + V + O + Place + Time. Trong hội thoại, câu trả lời “Because...” cho câu hỏi Why được chấp nhận.")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Chọn thì theo từ chỉ thời gian",
      intro: "Chia động từ trong ngoặc. Gạch chân từ chỉ thời gian trước khi viết — nó cho biết dùng thì nào. Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("I ___ (play) football every day.", "play", "Every day → hiện tại đơn."),
        c("I ___ (play) football yesterday.", "played", "Yesterday → quá khứ đơn."),
        c("I ___ (play) football tomorrow.", ["will play", "am going to play", "am playing"], "Tomorrow → will + V."),
        c("Shh! I ___ (play) the piano now.", "am playing", "Now → hiện tại tiếp diễn."),
        c("My sister usually ___ (walk) to school.", "walks", "Usually + my sister → walks."),
        c("We ___ (move) to a new house last year.", "moved", "Last year → quá khứ đơn."),
        c("He ___ (call) you next week.", ["will call", "is going to call"], "Next week → will + V."),
        c("They ___ (eat) pho two days ago.", "ate", "Ago → quá khứ đơn; eat → ate."),
        c("My teacher often ___ (give) us homework.", "gives", "Often + my teacher → gives."),
        c("At the moment, she ___ (write) an email.", "is writing", "At the moment → hiện tại tiếp diễn."),
        c("Mai ___ (not / come) to class yesterday.", "didn't come", "Phủ định quá khứ: didn't + V."),
        c("I ___ (meet) my friends after school tomorrow.", ["will meet", "am going to meet", "am meeting"], "Tomorrow → will + V.")
      ]
    }],
    translationDrills: [
      {
        title: "Luyện viết câu đủ thành phần: Việt → Anh",
        intro: "Dịch sang tiếng Anh: đủ chủ ngữ + động từ, đúng thứ tự S + V + O + nơi chốn + thời gian.",
        items: [
          t("Tôi rất thích tiếng Anh.", ["I really like English.", "I like English very much.", "I love English."], "Không dùng very + động từ."),
          t("Tôi rất vui khi ở cùng bạn bè.", ["I am very happy with my friends.", "I am very happy when I am with my friends.", "I feel very happy with my friends."], "Cảm xúc → am + Adj."),
          t("Họ chơi bóng đá ở trường sau giờ học.", ["They play football at school after class.", "They play football at school after school.", "They play soccer at school after class."], "Nơi chốn trước thời gian."),
          t("Ở trường tôi có một thư viện lớn.", ["There is a big library at my school.", "There is a large library at my school.", "My school has a big library.", "My school has a large library."], "“Ở... có...” → There is..."),
          t("Tôi thường dậy lúc sáu giờ.", ["I usually get up at six o'clock.", "I usually get up at six.", "I usually wake up at six o'clock.", "I usually wake up at six.", "I often get up at six o'clock.", "I often get up at six."], "Usually đứng trước động từ thường."),
          t("Cô ấy luôn đi học muộn.", ["She is always late for school.", "She always goes to school late.", "She is always late for class."], "Always đứng sau BE, trước động từ thường."),
          t("Mẹ tôi nấu bữa tối ở nhà mỗi tối.", ["My mother cooks dinner at home every evening.", "My mom cooks dinner at home every evening.", "My mother cooks dinner at home every night.", "My mom cooks dinner at home every night."], "S + V + O + Place + Time."),
          t("Chúng tôi đã đi thăm bảo tàng tuần trước.", ["We visited the museum last week.", "We visited a museum last week.", "We went to the museum last week.", "We went to a museum last week."], "Tuần trước → quá khứ đơn."),
          t("Ở thành phố của tôi có nhiều công viên.", ["There are many parks in my city.", "There are a lot of parks in my city.", "My city has many parks.", "My city has a lot of parks."], "Danh từ số nhiều → There are."),
          t("Tôi học tiếng Anh ở nhà mỗi ngày vì tôi muốn du học.", ["I study English at home every day because I want to study abroad.", "I learn English at home every day because I want to study abroad."], "S + V + O + Where + When + because + S + V.")
        ]
      },
      {
        title: "Sắp xếp và mở rộng câu",
        intro: "Ghép các phần cho sẵn thành MỘT câu đúng thứ tự. Chia động từ nếu cần.",
        items: [
          t("she / read / books / every day / in the library", "She reads books in the library every day.", "Place (in the library) trước Time (every day); she → reads."),
          t("I / study / English / every evening / at home / carefully", "I study English carefully at home every evening.", "S + V + O + How + Where + When."),
          t("my father / drive / to work / every morning", "My father drives to work every morning.", "My father → drives."),
          t("we / play / badminton / last Sunday / in the park", "We played badminton in the park last Sunday.", "Last Sunday → played."),
          t("they / visit / Hoi An / next summer", ["They will visit Hoi An next summer.", "They are going to visit Hoi An next summer."], "Next summer → will + V."),
          t("I / do / my homework / now", "I am doing my homework now.", "Now → am + V-ing."),
          t("she / usually / be / tired / after school", "She is usually tired after school.", "Trạng từ tần suất đứng sau BE."),
          t("I / practise / speaking / every day / because / I / want / to pass the IELTS exam", ["I practise speaking every day because I want to pass the IELTS exam.", "I practice speaking every day because I want to pass the IELTS exam."], "Câu chính + because + S + V.")
        ]
      }
    ],
    quiz: [
      qz("Câu nào thiếu động từ?", ["She is my best friend.", "My best friend very kind.", "My friend lives near my house.", "We often study together."], 1, "“My best friend very kind” thiếu BE → My best friend is very kind."),
      qz("Chọn câu đúng thứ tự:", ["I every day study English at home.", "I study English at home every day.", "I study at home English every day.", "Every day English I study at home."], 1, "S + V + O + Place + Time."),
      qz("Chọn đáp án đúng: “She ___ late.”", ["always is", "is always", "always", "be always"], 1, "Trạng từ tần suất đứng sau BE."),
      qz("“I ___ to the zoo last weekend.”", ["go", "goes", "went", "will go"], 2, "Last weekend → went."),
      qz("Câu nào dịch đúng “Ở nhà tôi có ba phòng ngủ”?", ["At my house has three bedrooms.", "There are three bedrooms in my house.", "In my house have three bedrooms.", "There is three bedrooms in my house."], 1, "There are + danh từ số nhiều + nơi chốn."),
      qz("Phần nào trả lời câu hỏi WHY trong câu: “I study English at home every day because I want a good job.”?", ["at home", "every day", "because I want a good job", "English"], 2, "Because + S + V = lý do (Why).")
    ],
    summary: "5 quy tắc viết câu: (1) luôn có chủ ngữ + động từ, (2) không dịch từng chữ, (3) S + V + O + Place + Time, (4) chọn thì theo từ chỉ thời gian, (5) mở rộng bằng How/Where/When/Why. Viết câu ngắn đúng trước, rồi mới mở rộng."
  })
];
