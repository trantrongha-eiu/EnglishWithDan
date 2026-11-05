"use strict";

// Writing Foundation — Part 5 & 6: from sentences to paragraphs, and the
// review test for the whole series (A2+). Helpers: writingFoundationHelpers.js
const { lesson } = require("./builder");
const { CATEGORY, STEP, eg, err, mc, ex, qz, table, c, t } = require("./writingFoundationHelpers");

// Model paragraphs — shown as examples and as the model answer of each writing task.
const MODEL_DAILY_LIFE = "I am a student at Le Loi High School. I usually get up at six o'clock, and I have breakfast with my family. My school, which is near my house, is very big and modern, so I walk there every morning. I study many subjects, but I like English best because it is useful for my future. Although my timetable is busy, I always find time for sport. In my free time, I play badminton with my friends who live in my neighbourhood. In the future, I want to study abroad, so I study English every day.";
const MODEL_DAILY_LIFE_VI = "Tôi là học sinh trường THPT Lê Lợi. Tôi thường dậy lúc sáu giờ và ăn sáng cùng gia đình. Trường tôi, nằm gần nhà, rất rộng và hiện đại, nên sáng nào tôi cũng đi bộ đến trường. Tôi học nhiều môn, nhưng tôi thích tiếng Anh nhất vì nó hữu ích cho tương lai của tôi. Mặc dù thời khóa biểu bận rộn, tôi luôn dành thời gian cho thể thao. Vào thời gian rảnh, tôi chơi cầu lông với những người bạn sống cùng khu phố. Trong tương lai, tôi muốn đi du học, vì vậy tôi học tiếng Anh mỗi ngày.";

const MODEL_HOMETOWN = "My hometown is Hoi An, a small city in central Vietnam. It is very beautiful and peaceful, and the people there are friendly. There are many old houses and tourist attractions, so a lot of tourists visit it every year. People who live there often ride bicycles because the streets are narrow. Although it is not very modern, it is convenient for daily life. There are many places where you can try delicious local food, such as cao lau. I love my hometown because it always makes me feel relaxed.";
const MODEL_HOMETOWN_VI = "Quê tôi là Hội An, một thành phố nhỏ ở miền Trung Việt Nam. Nơi đây rất đẹp và yên bình, và người dân ở đó thân thiện. Có nhiều nhà cổ và điểm tham quan, nên mỗi năm có rất nhiều du khách đến thăm. Những người sống ở đó thường đi xe đạp vì đường phố hẹp. Mặc dù không hiện đại lắm, nơi đây vẫn tiện lợi cho cuộc sống hằng ngày. Có nhiều nơi bạn có thể thưởng thức món ăn địa phương ngon, chẳng hạn như cao lầu. Tôi yêu quê mình vì nó luôn khiến tôi cảm thấy thư thái.";

const MODEL_SUBJECT = "My favourite subject is English. I enjoy studying it because it is interesting and useful. The teacher who teaches me English is very kind, and her lessons are always fun. Although English grammar is quite difficult, I practise it every day. I usually learn new words at home in the evening, and I watch English videos at the weekend. This subject helps me understand foreign films and talk to tourists. In the future, I want to become a tour guide, so English is very important for my career.";
const MODEL_SUBJECT_VI = "Môn học yêu thích của tôi là tiếng Anh. Tôi thích học môn này vì nó thú vị và hữu ích. Cô giáo dạy tôi tiếng Anh rất tốt bụng, và các bài học của cô luôn vui. Mặc dù ngữ pháp tiếng Anh khá khó, tôi luyện tập mỗi ngày. Tôi thường học từ mới ở nhà vào buổi tối, và xem video tiếng Anh vào cuối tuần. Môn học này giúp tôi hiểu phim nước ngoài và nói chuyện với du khách. Trong tương lai, tôi muốn trở thành hướng dẫn viên du lịch, nên tiếng Anh rất quan trọng cho sự nghiệp của tôi.";

const MODEL_BEST_FRIEND = "My best friend is Lan. We have been friends since primary school, and now we study in the same class. Lan is tall and has long black hair. She is very friendly and helpful, but she is quite shy with strangers. Her mother, who is a nurse, often cooks delicious food for us. After school, we usually do our homework together, and at the weekend we ride our bikes around the lake. Although we sometimes argue, we always make up quickly. I like Lan because she always listens to me when I have problems. She is a friend whose kindness makes my life happier, so I hope our friendship will last forever.";
const MODEL_BEST_FRIEND_VI = "Bạn thân nhất của tôi là Lan. Chúng tôi là bạn từ hồi tiểu học, và bây giờ học cùng lớp. Lan cao và có mái tóc đen dài. Bạn ấy rất thân thiện và hay giúp đỡ người khác, nhưng khá nhút nhát với người lạ. Mẹ bạn ấy, là một y tá, thường nấu những món ngon cho chúng tôi. Sau giờ học, chúng tôi thường làm bài tập cùng nhau, và cuối tuần chúng tôi đạp xe quanh hồ. Mặc dù đôi khi cãi nhau, chúng tôi luôn làm lành rất nhanh. Tôi quý Lan vì bạn ấy luôn lắng nghe tôi khi tôi gặp khó khăn. Lan là người bạn có lòng tốt khiến cuộc sống của tôi vui hơn, nên tôi mong tình bạn của chúng tôi sẽ mãi bền lâu.";

module.exports = [
  // ─────────────────────────────────────────────────────────────
  // 7. FROM SENTENCES TO PARAGRAPHS
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-sentences-to-paragraphs", title: "From Sentences to Paragraphs: viết đoạn văn", icon: "📝", orderIndex: 44,
    overview: "Bài tổng hợp: dùng mọi kỹ năng đã học để đi từ một câu đơn đến một đoạn văn 80–120 từ. Không cần viết câu dài ngay từ đầu — hãy đi đúng trình tự: (1) viết câu đơn đúng, (2) chọn đúng thì, (3) thêm thời gian, địa điểm, lý do, (4) kết nối hai câu, (5) mở rộng bằng mệnh đề quan hệ, (6) sắp xếp thành đoạn văn hoàn chỉnh. Bài có 4 đề viết kèm bài mẫu: My Daily Life, My Hometown, My Favourite Subject, My Best Friend.",
    formula: [
      { label: "Mở rộng một câu", structure: "Câu gốc → + When/Where → + Why (because) → + Although / and / but / so → + who / which", example: "I study English. → Although English is difficult, I study it at home every day because I want to improve my English." },
      { label: "Bố cục đoạn văn", structure: "Câu chủ đề (Topic sentence) → 5–7 câu chi tiết (Supporting sentences) → Câu kết (Concluding sentence)", example: "My hometown is Hoi An, a small city in central Vietnam. … I love my hometown because it always makes me feel relaxed." },
      { label: "Checklist cấu trúc", structure: "≥2 câu S + V • ≥2 câu S + be • and/but/so • because • although/despite • ≥1 mệnh đề quan hệ", example: "I usually get up at six. / My school is big. / …, so I walk there. / … because it is useful. / Although… / My school, which is near my house, …" }
    ],
    usage: [
      { title: "Đề 1 – My Daily Life", description: "Ý tưởng: I am a student. I study at… I usually… In my free time, I… I like… because… Although…, I… My school, which…, is… I want to… in the future." },
      { title: "Đề 2 – My Hometown", description: "Từ vựng: beautiful, peaceful, crowded, modern, convenient, friendly, local food, shopping malls, parks, tourist attractions. Cấu trúc: My hometown is… It has… People who live there… There are many places where… Although it is…, I… I like my hometown because…" },
      { title: "Đề 3 – My Favourite Subject", description: "Từ vựng: interesting, useful, important, difficult, enjoyable, improve, knowledge, future career. Cấu trúc: My favourite subject is… I enjoy studying… because… Although…, I… The teacher who teaches me… is… This subject helps me…" },
      { title: "Đề 4 – My Best Friend (100–120 từ)", description: "Giới thiệu người bạn → miêu tả tính cách → các hoạt động cùng nhau → vì sao em quý bạn ấy. Dùng and, but, so, because; although hoặc despite; ít nhất một mệnh đề who hoặc whose." },
      { title: "Cách làm: dàn ý trước, viết sau", description: "Ghi 6–8 ý ngắn (tiếng Việt cũng được) → biến mỗi ý thành 1 câu Cấu trúc 1 hoặc 2 → nối/mở rộng một số câu → đọc lại theo checklist." }
    ],
    signalWords: ["Topic sentence: My… is… / I am…", "In my free time, …", "for example / such as", "Although…, …", "…, which / who …", "In short, … / That is why…", "In the future, …"],
    examples: [
      eg("I study English.", "Tôi học tiếng Anh. (câu gốc)"),
      eg("I study English every day.", "Tôi học tiếng Anh mỗi ngày. (+ When)"),
      eg("I study English at home every day.", "Tôi học tiếng Anh ở nhà mỗi ngày. (+ Where)"),
      eg("I study English at home every day because I want to improve my English.", "Tôi học tiếng Anh ở nhà mỗi ngày vì tôi muốn cải thiện tiếng Anh. (+ Why)"),
      eg("Although English is difficult, I study it at home every day because I want to improve my English.", "Mặc dù tiếng Anh khó, tôi học nó ở nhà mỗi ngày vì tôi muốn cải thiện tiếng Anh. (+ Although)"),
      eg("My friend is friendly.", "Bạn tôi thân thiện. (câu gốc)"),
      eg("My friend is very friendly.", "Bạn tôi rất thân thiện. (+ very)"),
      eg("My friend is very friendly, and she is helpful.", "Bạn tôi rất thân thiện, và bạn ấy hay giúp đỡ người khác. (+ and)"),
      eg("My friend, who studies in my class, is very friendly and helpful.", "Bạn tôi, người học cùng lớp với tôi, rất thân thiện và hay giúp đỡ. (+ who)"),
      eg(MODEL_DAILY_LIFE, "Bài mẫu “My Daily Life”: " + MODEL_DAILY_LIFE_VI),
      eg(MODEL_HOMETOWN, "Bài mẫu “My Hometown”: " + MODEL_HOMETOWN_VI),
      eg(MODEL_SUBJECT, "Bài mẫu “My Favourite Subject”: " + MODEL_SUBJECT_VI),
      eg(MODEL_BEST_FRIEND, "Bài mẫu “My Best Friend”: " + MODEL_BEST_FRIEND_VI)
    ],
    mistakes: [
      err("My hometown very peaceful.", "My hometown is very peaceful.", "Câu mô tả bằng tính từ cần BE — lỗi thiếu BE rất hay gặp khi viết nhanh."),
      err("Yesterday I go to school and I meet my friend.", "Yesterday I went to school and met my friend.", "Giữ thì thống nhất: chuyện hôm qua → toàn bộ quá khứ đơn."),
      err("I like my school and it is big and it has a library and the teachers are kind.", "I like my school because it is big and has a library. The teachers, who are very kind, always help us.", "Đừng nối and… and… and… liên tục; tách câu và dùng because / mệnh đề quan hệ."),
      err("Because I want to improve my English.", "I study every day because I want to improve my English.", "Mệnh đề because không đứng một mình — phải có mệnh đề chính."),
      err("My best friend, who she lives near my house, is very kind.", "My best friend, who lives near my house, is very kind.", "Who đã thay cho she → bỏ she."),
      err("I get up at 6. I have breakfast. I go to school. I study.", "I get up at 6 a.m., and after breakfast I go to school, where I study until 4 p.m.", "Toàn câu ngắn giống nhau khiến đoạn văn rời rạc; kết hợp một số câu bằng and / where / because.")
    ],
    tips: [
      "80–100 từ ≈ 7–9 câu. Không cần câu nào cũng dài — xen kẽ câu ngắn và câu phức giúp đoạn văn dễ đọc.",
      "Đọc lại theo checklist: mỗi câu có S + V? Thì đúng chưa? Có thiếu -s/-es hay BE không? Dấu phẩy sau mệnh đề although/because đứng đầu câu?",
      "IELTS Speaking Part 2 (Describe your hometown / a friend / a subject you like) có thể dùng chính các đoạn văn này làm nền rồi nói thêm chi tiết."
    ],
    comparison: [
      table("Dàn ý đoạn văn (ví dụ: My Daily Life)", ["Phần", "Nhiệm vụ", "Câu mẫu"], [
        ["Topic sentence", "Giới thiệu chủ đề", "I am a student at Le Loi High School."],
        ["Supporting 1", "Thói quen buổi sáng", "I usually get up at six o'clock, and I have breakfast with my family."],
        ["Supporting 2", "Trường học", "My school, which is near my house, is very big and modern, so I walk there every morning."],
        ["Supporting 3", "Môn học", "I study many subjects, but I like English best because it is useful for my future."],
        ["Supporting 4", "Thời gian rảnh", "In my free time, I play badminton with my friends who live in my neighbourhood."],
        ["Concluding", "Kết / dự định", "In the future, I want to study abroad, so I study English every day."]
      ]),
      table("Checklist trước khi nộp bài", ["Yêu cầu", "Ví dụ trong bài mẫu My Daily Life"], [
        ["≥2 câu S + V", "I usually get up at six o'clock. / I play badminton…"],
        ["≥2 câu S + be + Adj/N", "I am a student… / My school… is very big and modern."],
        ["and / but / so", "…, and I have breakfast… / …, but I like English best… / …, so I walk there…"],
        ["because", "…because it is useful for my future."],
        ["although / despite", "Although my timetable is busy, I always find time for sport."],
        ["≥1 mệnh đề quan hệ", "My school, which is near my house, … / my friends who live in my neighbourhood"]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Câu nào là câu chủ đề (topic sentence) phù hợp cho đoạn văn “My Hometown”?", ["I had pho for breakfast.", "My hometown is a small but beautiful city in the north of Vietnam.", "Because it is peaceful.", "There are many parks."], 1, "Câu chủ đề giới thiệu chủ đề chính của cả đoạn văn."),
      mc(STEP.structure + "Câu nào có mệnh đề quan hệ?", ["I like my school because it is big.", "My school, which is near my house, is very modern.", "My school is big, and it is modern.", "Although my school is old, it is beautiful."], 1, "“which is near my house” bổ sung thông tin cho “My school”."),
      mc(STEP.connect + "Chọn câu kết (concluding sentence) phù hợp nhất cho đoạn văn “My Favourite Subject”:", ["Maths is difficult.", "In short, English is the subject which I enjoy most because it opens many doors for my future.", "My teacher is tall.", "I get up at 6 a.m."], 1, "Câu kết nhắc lại ý chính (English là môn yêu thích) và lý do."),
      ex("fill_blank", STEP.connect + "Điền từ nối: “I like my hometown ___ it is peaceful. ___ it is not very modern, it is convenient.”", "because / Although", "Lý do → because; điều trái ngược + S + V → Although."),
      ex("fill_blank", STEP.write + "Chia động từ: “My best friend ___ (be) Nam. He ___ (live) near my house.”", "is / lives", "Câu 1: S + be + N; câu 2: S + V, he → lives."),
      ex("error_correction", STEP.write + "Sửa lỗi trong đoạn văn: “Yesterday I go to school and I meet my friend.”", "Yesterday I went to school and met my friend.", "Yesterday → quá khứ đơn cho cả hai động từ."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “My hometown very peaceful, and people there friendly.”", "My hometown is very peaceful, and the people there are friendly.", "Cả hai vế đều thiếu BE."),
      ex("translation_vn_en", STEP.write + "Dịch câu chủ đề: “Môn học yêu thích của tôi là tiếng Anh.”", "My favourite subject is English.", "S + be + N."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Ở quê tôi có nhiều nơi mà bạn có thể thưởng thức món ăn địa phương ngon.”", "There are many places in my hometown where you can enjoy delicious local food.", "There are… + where + S + V."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “People who live there often ride bicycles because the streets are narrow.”", "Những người sống ở đó thường đi xe đạp vì đường phố hẹp.", "Who live there bổ sung cho People; because chỉ lý do."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “Although we sometimes argue, we always make up quickly.”", "Mặc dù đôi khi chúng tôi cãi nhau, chúng tôi luôn làm lành rất nhanh.", "Although = mặc dù; make up = làm lành."),
      ex("sentence_transformation", STEP.expand + "Mở rộng câu “I study English.” thành một câu có cả although và because (gợi ý: English is difficult / at home every day / improve my English).", "Although English is difficult, I study it at home every day because I want to improve my English.", "Câu gốc → + Where/When → + because → + Although."),
      ex("sentence_transformation", STEP.expand + "Mở rộng câu “My friend is friendly.” bằng very, and helpful, và mệnh đề who studies in my class.", "My friend, who studies in my class, is very friendly and helpful.", "Mệnh đề quan hệ đứng ngay sau chủ ngữ My friend."),
      ex("rewrite", STEP.connect + "Writing task: Viết đoạn văn 80–100 từ về “My Daily Life”. Yêu cầu: ≥2 câu S + V, ≥2 câu S + be + Adj/N, dùng and/but/so, because và ít nhất 1 mệnh đề quan hệ.", "Bài mẫu: " + MODEL_DAILY_LIFE, "So bài của em với checklist: S + V (get up, study), S + be (am a student, is very big), and/but/so, because, although, mệnh đề quan hệ (which, who)."),
      ex("rewrite", STEP.connect + "Writing task: Viết đoạn văn 80–100 từ về “My Hometown”. Dùng các từ gợi ý: beautiful, peaceful, modern, convenient, friendly, local food, tourist attractions.", "Bài mẫu: " + MODEL_HOMETOWN, "Bài mẫu dùng: People who live there…, There are many places where…, Although it is not very modern…, because…"),
      ex("rewrite", STEP.connect + "Writing task: Viết đoạn văn 80–100 từ về “My Favourite Subject”. Dùng: My favourite subject is…, because…, Although…, The teacher who teaches me…", "Bài mẫu: " + MODEL_SUBJECT, "Bài mẫu có đủ: câu chủ đề, lý do (because), nhượng bộ (although), mệnh đề quan hệ (who), câu kết (so…)."),
      ex("rewrite", STEP.connect + "Writing challenge: Viết đoạn văn 100–120 từ về “My Best Friend”: giới thiệu bạn, tính cách, hoạt động cùng nhau, vì sao em quý bạn ấy. Dùng and, but, so, because; although hoặc despite; ít nhất 1 mệnh đề who hoặc whose.", "Bài mẫu: " + MODEL_BEST_FRIEND, "Bài mẫu dùng: and, but, so, because, Although, Her mother, who is a nurse…, a friend whose kindness…"),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “My best friend, who she lives near my house, is very kind.”", "Lỗi: who she lives → who lives.", "Who đã thay cho she."),
      ex("find_mistake", STEP.connect + "Tìm lỗi sai trong đoạn văn: “I study hard every day. Because I want to improve my English.”", "Lỗi: “Because I want…” đứng một mình → I study hard every day because I want to improve my English.", "Mệnh đề because phải đi cùng mệnh đề chính."),
      ex("mini_dialogue", STEP.connect + "IELTS Speaking Part 1 — trả lời bằng câu đầy đủ:\nExaminer: Do you like your hometown?\nYou: Yes, I do. ___ (nó yên bình và người dân thân thiện)\nExaminer: Is there anything you don't like about it?\nYou: ___ (mặc dù nó đẹp, nhưng không có nhiều trung tâm mua sắm)", "It is peaceful, and the people are friendly. / Although it is beautiful, there aren't many shopping malls.", "Câu 1: S + be + Adj, and S + be + Adj. Câu 2: Although + S + V, there aren't… (không thêm but).")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Hoàn thành đoạn văn “My Daily Life”",
      intro: "Mỗi câu thiếu một phần: chia động từ trong ngoặc, hoặc điền từ nối (and / but / so / because / although / which / who). Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("I ___ (be) a student at Le Loi High School.", "am", "I → am."),
        c("I usually ___ (get) up at six o'clock.", "get", "Usually + I → get."),
        c("My school, ___ is near my house, is very big and modern.", "which", "Vật → which; mệnh đề bổ sung có dấu phẩy không dùng that."),
        c("My school is near my house, ___ I walk there every morning.", "so", "Đi bộ là kết quả của việc trường gần."),
        c("I study many subjects, ___ I like English best.", "but", "Nhiều môn nhưng thích nhất tiếng Anh → but."),
        c("I like English ___ it is useful for my future.", "because", "Lý do + S + V → because."),
        c("___ my timetable is busy, I always find time for sport.", ["Although", "Even though"], "Trái ngược + S + V → Although."),
        c("I play badminton with my friends ___ live in my neighbourhood.", ["who", "that"], "Người, chủ ngữ → who."),
        c("Last weekend, we ___ (go) to the park together.", "went", "Last weekend → went."),
        c("My brother ___ (be) a university student now.", "is", "Now + my brother → is."),
        c("Tomorrow I ___ (have) an English test.", ["will have", "am going to have", "have", "am having"], "Tomorrow → will have (lịch thi cố định cũng có thể dùng have)."),
        c("In the future, I want ___ (study) abroad.", "to study", "Want + to V.")
      ]
    }],
    translationDrills: [
      {
        title: "Mở rộng câu từng bước",
        intro: "Viết lại câu, thêm phần trong ngoặc vào đúng vị trí (giữ nguyên các phần khác).",
        items: [
          t("I study English. (+ every day)", "I study English every day.", "Thời gian đứng cuối câu."),
          t("I study English every day. (+ at home)", "I study English at home every day.", "Nơi chốn đứng TRƯỚC thời gian."),
          t("I study English at home every day. (+ because I want to improve my English)", "I study English at home every day because I want to improve my English.", "Because + S + V đứng sau mệnh đề chính."),
          t("My friend is friendly. (+ very)", "My friend is very friendly.", "Very đứng trước tính từ."),
          t("My friend is very friendly. (+ she is helpful — nối bằng and)", ["My friend is very friendly, and she is helpful.", "My friend is very friendly and helpful."], "Cùng chủ ngữ có thể rút gọn: friendly and helpful."),
          t("My friend is very friendly and helpful. (+ she studies in my class — dùng who)", ["My friend, who studies in my class, is very friendly and helpful.", "My friend who studies in my class is very friendly and helpful."], "Who + V đứng ngay sau My friend."),
          t("My hometown is beautiful. (+ it is not modern — dùng Although ở đầu câu)", ["Although my hometown is not modern, it is beautiful.", "Although it is not modern, my hometown is beautiful."], "Although + S + V, S + V."),
          t("There are many parks. (+ people can relax there — dùng where)", "There are many parks where people can relax.", "There → where, bỏ “there” ở cuối.")
        ]
      },
      {
        title: "Viết câu cho đoạn văn: Việt → Anh",
        intro: "Dịch từng câu của một đoạn văn ngắn về trường học.",
        items: [
          t("Tôi là học sinh lớp 10.", ["I am a student in Grade 10.", "I am a Grade 10 student.", "I am in Grade 10.", "I am a tenth-grade student.", "I am a student in grade 10."], "S + be + N."),
          t("Trường tôi lớn và hiện đại.", ["My school is big and modern.", "My school is large and modern."], "S + be + Adj and Adj."),
          t("Có một thư viện nơi chúng tôi đọc sách mỗi ngày.", ["There is a library where we read books every day.", "There is a library where we read every day."], "There is… + where + S + V."),
          t("Tôi thích cô giáo dạy tiếng Anh vì cô ấy rất vui tính.", ["I like my English teacher because she is very funny.", "I like the teacher who teaches English because she is very funny.", "I like the English teacher because she is very funny.", "I like my English teacher because she is very cheerful.", "I like the teacher who teaches English because she is very cheerful."], "Because + S + be + Adj."),
          t("Mặc dù có nhiều bài tập, tôi vẫn thích đi học.", ["Although I have a lot of homework, I still like going to school.", "Although I have a lot of homework, I still enjoy going to school.", "Although there is a lot of homework, I still like going to school.", "Although I have a lot of homework, I still like to go to school.", "Despite having a lot of homework, I still like going to school."], "Although + S + V, không thêm but."),
          t("Sau giờ học, tôi chơi bóng rổ với bạn bè.", ["After school, I play basketball with my friends.", "After class, I play basketball with my friends.", "I play basketball with my friends after school."], "S + V + O + with my friends."),
          t("Hôm qua đội của chúng tôi đã thắng, nên chúng tôi rất vui.", ["Our team won yesterday, so we were very happy.", "Yesterday our team won, so we were very happy."], "Quá khứ đơn + so + kết quả."),
          t("Tôi muốn trở thành giáo viên trong tương lai.", ["I want to become a teacher in the future.", "I want to be a teacher in the future."], "Want + to V.")
        ]
      }
    ],
    quiz: [
      qz("Đoạn văn 80–100 từ thường có khoảng bao nhiêu câu?", ["2–3 câu", "7–9 câu", "20 câu", "1 câu dài"], 1, "Khoảng 10–14 từ một câu → 7–9 câu."),
      qz("Thứ tự mở rộng câu nào hợp lý?", ["Why → câu gốc → When", "Câu gốc → When/Where → Why → Although", "Although → câu gốc → who", "Không cần câu gốc"], 1, "Viết câu gốc đúng trước, rồi thêm thông tin, cuối cùng mới kết nối."),
      qz("Câu nào là câu kết phù hợp cho đoạn “My Best Friend”?", ["Lan is tall.", "That is why Lan is the best friend I have ever had.", "We ride bikes.", "Her mother is a nurse."], 1, "Câu kết tổng hợp lại ý chính của cả đoạn."),
      qz("Câu nào sai?", ["My hometown is peaceful.", "People who live there are friendly.", "There are many places where tourists can relax.", "Although it is small, but it is beautiful."], 3, "Although không đi với but → Although it is small, it is beautiful."),
      qz("Trong bài mẫu “My Daily Life”, “My school, which is near my house, is very big” dùng cấu trúc gì?", ["Câu ghép and/but/so", "Mệnh đề quan hệ which", "Despite + N", "Câu hỏi"], 1, "Which is near my house bổ sung cho My school.")
    ],
    summary: "Đi từ câu đến đoạn: câu đơn đúng → đúng thì → thêm When/Where/Why → nối bằng and/but/so/because/although → mở rộng bằng who/which/where → sắp xếp thành Topic sentence + chi tiết + câu kết. Luôn đọc lại theo checklist trước khi nộp."
  }),

  // ─────────────────────────────────────────────────────────────
  // 8. REVIEW & PRACTICE
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-review", title: "Review & Practice: ôn tập tổng hợp", icon: "🏆", orderIndex: 45,
    overview: "Bài ôn tập cả chuyên đề Writing Foundation: S + V, S + be, kỹ năng viết câu, and/but/so, because/although/despite, mệnh đề quan hệ. Làm phần trắc nghiệm để tính điểm hoàn thành bài, sau đó làm 4 bài luyện tự chấm ở cuối: điền BE/động từ, dịch Việt → Anh, viết câu từ từ gợi ý, sửa lỗi sai. Câu nào sai, hãy quay lại bài tương ứng để ôn.",
    formula: [
      { label: "Cấu trúc 1", structure: "S + V + (O) + Place + Time", example: "I study English at home every evening." },
      { label: "Cấu trúc 2", structure: "S + be + Adj / N / nơi chốn", example: "My father is a doctor. / I am tired." },
      { label: "Câu ghép", structure: "S + V, and / but / so + S + V", example: "It was raining, so we stayed at home." },
      { label: "Câu phức", structure: "Because / Although + S + V, S + V  •  Despite + N / V-ing, S + V", example: "Although she was tired, she continued studying." },
      { label: "Mệnh đề quan hệ", structure: "N + who / whom / which / whose / where / when + …", example: "This is the school where I study." }
    ],
    usage: [
      { title: "1. Viết câu đơn đúng", description: "Có chủ ngữ + động từ; S + V hay S + be tùy nghĩa câu." },
      { title: "2. Chọn đúng thì", description: "Dựa vào từ chỉ thời gian: every day / yesterday / tomorrow / now." },
      { title: "3. Thêm thời gian, địa điểm, lý do", description: "S + V + O + How + Where + When + Why." },
      { title: "4. Kết nối hai câu", description: "and / but / so; because / although / despite." },
      { title: "5. Mở rộng bằng mệnh đề quan hệ", description: "who / whom / which / whose / where / when." },
      { title: "6. Viết đoạn văn hoàn chỉnh", description: "Topic sentence → supporting sentences → concluding sentence." }
    ],
    signalWords: ["S + V", "S + be + Adj/N", "and / but / so", "because / because of", "although / despite", "who / whom / which", "whose / where / when"],
    examples: [
      eg("My father works in a hospital.", "Bố tôi làm việc ở một bệnh viện. (S + V)"),
      eg("My father is a doctor.", "Bố tôi là bác sĩ. (S + be + N)"),
      eg("She is very friendly.", "Cô ấy rất thân thiện. (S + be + Adj)"),
      eg("I study English at home every evening.", "Tôi học tiếng Anh ở nhà mỗi tối. (S + V + O + Place + Time)"),
      eg("I was tired, so I went to bed early.", "Tôi mệt, nên tôi đi ngủ sớm. (so)"),
      eg("The book is interesting, but it is expensive.", "Cuốn sách thú vị, nhưng nó đắt. (but)"),
      eg("I like English because it is useful.", "Tôi thích tiếng Anh vì nó hữu ích. (because)"),
      eg("Although it was raining, we went to school.", "Mặc dù trời mưa, chúng tôi vẫn đi học. (although)"),
      eg("Despite the rain, we went to school.", "Bất chấp trời mưa, chúng tôi vẫn đi học. (despite)"),
      eg("I have a friend who speaks English very well.", "Tôi có một người bạn nói tiếng Anh rất giỏi. (who)"),
      eg("I have a friend whose father is a doctor.", "Tôi có một người bạn có bố là bác sĩ. (whose)"),
      eg("This is the school where I study.", "Đây là ngôi trường nơi tôi học. (where)")
    ],
    mistakes: [
      err("I am study English every day.", "I study English every day.", "Không dùng BE + V nguyên mẫu."),
      err("She very beautiful.", "She is very beautiful.", "Câu mô tả bằng tính từ cần BE."),
      err("He play football yesterday.", "He played football yesterday.", "Yesterday → quá khứ đơn."),
      err("I very like English.", "I really like English.", "Very không đứng trước động từ."),
      err("Although it was raining, but we went outside.", "Although it was raining, we went outside.", "Không dùng although cùng but."),
      err("Despite she was tired, she continued studying.", "Despite being tired, she continued studying.", "Despite + N / V-ing."),
      err("I have a friend which speaks English well.", "I have a friend who speaks English well.", "Người → who."),
      err("This is the school which I study.", "This is the school where I study.", "Nơi chốn + S + V → where.")
    ],
    tips: [
      "Làm bài theo thứ tự: trắc nghiệm (tính điểm) → điền từ → dịch → viết câu từ gợi ý → sửa lỗi. Phần tự luận có đáp án gợi ý để tự chấm.",
      "Ghi lại những lỗi mình hay mắc (thiếu BE, quên -s, although + but…) vào sổ và kiểm tra lại mỗi khi viết đoạn văn.",
      "Đạt từ 80% phần trắc nghiệm là hoàn thành bài; nếu chưa đạt, ôn lại bài tương ứng trong chuyên đề rồi làm lại."
    ],
    comparison: table("Bảng tóm tắt chuyên đề", ["Cấu trúc", "Dùng khi", "Ví dụ"], [
      ["S + V", "Hành động, thói quen, like/know/have/need", "She plays badminton every weekend."],
      ["S + be + Adj/N", "Tính chất, cảm xúc, danh tính, vị trí", "My mother is a nurse."],
      ["and / but / so", "Bổ sung / tương phản / kết quả", "I was tired, so I went to bed early."],
      ["because / because of", "Lý do (+ S + V / + N)", "We stayed home because of the rain."],
      ["although / despite", "Mặc dù (+ S + V / + N, V-ing)", "Despite being tired, she kept studying."],
      ["who / which / whose", "Bổ sung cho người / vật / sở hữu", "I know a girl whose brother studies abroad."],
      ["where / when", "Bổ sung cho nơi chốn / thời gian", "I remember the day when I met her."]
    ]),
    exercises: [
      mc(STEP.meaning + "Câu nào dùng Cấu trúc 2 (S + be + Adj/N)?", ["My sister works in a bank.", "My sister is a banker.", "My sister likes coffee.", "My sister has a cat."], 1, "Is a banker → S + be + N. Các câu còn lại có động từ thường."),
      mc(STEP.structure + "Chọn đáp án đúng: “___ the bad weather, the match continued.”", ["Although", "Because", "Despite", "So"], 2, "Trái ngược + cụm danh từ → Despite."),
      mc(STEP.structure + "Chọn đáp án đúng: “The man ___ daughter is my classmate is a pilot.”", ["who", "whose", "which", "whom"], 1, "Sở hữu (con gái của ông ấy) → whose."),
      mc(STEP.connect + "Chọn đáp án đúng: “I was hungry, ___ I cooked some noodles.”", ["but", "so", "although", "because"], 1, "Nấu mì là kết quả → so."),
      ex("fill_blank", STEP.connect + "Điền vào chỗ trống: “She ___ (not / be) at school yesterday ___ she was sick.”", "wasn't / because", "Phủ định quá khứ của be với she → wasn't; lý do → because."),
      ex("fill_blank", STEP.structure + "Điền đại từ quan hệ: “This is the café ___ we first met.”", "where", "Nơi chốn + S + V → where."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “My mother is cook very well.”", "My mother cooks very well.", "Cook là động từ thường → bỏ is, thêm -s."),
      ex("error_correction", STEP.connect + "Sửa lỗi: “Although he is rich, but he is not happy.”", "Although he is rich, he is not happy. / He is rich, but he is not happy.", "Chỉ dùng although HOẶC but."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Tôi có một người bạn có mẹ là giáo viên.”", "I have a friend whose mother is a teacher.", "Sở hữu → whose + N."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Vì hôm qua trời mưa nên tôi không đi chơi.”", "Because it rained yesterday, I didn't go out. / It rained yesterday, so I didn't go out.", "Chỉ dùng because HOẶC so, không dùng cả hai."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “The city where I live is crowded, but it is very convenient.”", "Thành phố nơi tôi sống đông đúc, nhưng rất tiện lợi.", "Where I live bổ sung cho The city; but = nhưng."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “Despite being busy, my father always has breakfast with us.”", "Dù bận, bố tôi luôn ăn sáng cùng chúng tôi.", "Despite + V-ing = dù / mặc dù."),
      ex("sentence_transformation", STEP.expand + "Viết lại: “Although the test was difficult, I passed it.” → Despite …", "Despite the difficult test, I passed it. / Despite the difficulty of the test, I passed it.", "The test was difficult → cụm danh từ the difficult test."),
      ex("sentence_transformation", STEP.connect + "Nối câu bằng whose: “I know a man. His son is a pilot.”", "I know a man whose son is a pilot.", "His son → whose son."),
      ex("rewrite", STEP.expand + "Mở rộng câu “I like my school.” bằng mệnh đề which (is near my house) và một lý do với because.", "I like my school, which is near my house, because the teachers are very kind.", "Mệnh đề which đứng ngay sau my school; because + S + V ở cuối."),
      ex("rewrite", STEP.connect + "Viết 5 câu về gia đình em, mỗi câu dùng một cấu trúc: (1) S + V, (2) S + be + N, (3) and/but/so, (4) because/although, (5) who/whose.", "Gợi ý: (1) My father works in a bank. (2) My mother is a teacher. (3) My brother is young, but he is very clever. (4) I love my family because they always support me. (5) My grandmother, who lives with us, cooks delicious food.", "Mỗi câu kiểm tra một cấu trúc của chuyên đề."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “Despite she was tired, she went to work.”", "Lỗi: Despite she was tired → Despite being tired / Although she was tired.", "Despite + V-ing / N."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “The book which I bought it last week is interesting.”", "Lỗi: bỏ “it” → The book which I bought last week is interesting.", "Which đã thay cho it."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại:\nA: Who is the woman ___ is talking to your mum?\nB: She's my aunt. She ___ (live) in Da Lat.\nA: Da Lat? I love it ___ it is cool all year.\nB: Me too. ___ it is far, we visit her every summer.", "who / lives / because / Although", "Người, chủ ngữ → who; she → lives; lý do → because; nhượng bộ + S + V → Although.")
    ],
    conjugationDrills: [{
      title: "Exercise 1: Điền BE hoặc động từ thường",
      intro: "Điền BE (am/is/are/was/were/will be) hoặc động từ thường theo gợi ý trong ngoặc, chia đúng thì. Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("I ___ (be) a student.", "am", "I → am."),
        c("She ___ (học) English every day.", ["studies", "learns"], "Every day + she → studies."),
        c("They ___ (be) very happy yesterday.", "were", "Yesterday + they → were."),
        c("My father ___ (làm việc) in a hospital.", "works", "My father → works."),
        c("English ___ (be) an important subject.", "is", "English → is."),
        c("He ___ (chơi) football every weekend.", "plays", "Every weekend + he → plays."),
        c("We ___ (be) tired after the trip last week.", "were", "Last week + we → were."),
        c("I ___ (làm) my homework last night.", ["did", "finished"], "Last night → did (do my homework)."),
        c("My friends ___ (be) friendly.", "are", "My friends → are."),
        c("She ___ (be) a doctor in the future.", "will be", "In the future → will be.")
      ]
    }],
    translationDrills: [
      {
        title: "Exercise 2: Dịch sang tiếng Anh",
        intro: "Dịch sang tiếng Anh, chọn đúng cấu trúc cho từng câu.",
        items: [
          t("Tôi là học sinh.", ["I am a student.", "I am a pupil."], "S + be + N."),
          t("Tôi học tiếng Anh mỗi ngày.", ["I study English every day.", "I learn English every day."], "S + V."),
          t("Cô ấy rất thân thiện.", "She is very friendly.", "S + be + Adj."),
          t("Tôi đã đi học hôm qua.", ["I went to school yesterday.", "Yesterday I went to school."], "Quá khứ đơn: go → went."),
          t("Chúng tôi sẽ đi du lịch vào tuần tới.", ["We will travel next week.", "We are going to travel next week.", "We will go on a trip next week.", "We are going to go on a trip next week.", "We will go travelling next week."], "Tuần tới → will + V."),
          t("Tôi thích tiếng Anh vì nó hữu ích.", ["I like English because it is useful."], "Because + S + V."),
          t("Mặc dù trời mưa, chúng tôi vẫn đi học.", ["Although it was raining, we went to school.", "Although it was raining, we still went to school.", "Although it rained, we still went to school.", "Although it rained, we went to school.", "Despite the rain, we went to school.", "Despite the rain, we still went to school."], "Although + S + V hoặc Despite + N; không thêm but."),
          t("Tôi có một người bạn nói tiếng Anh rất tốt.", ["I have a friend who speaks English very well.", "I have a friend that speaks English very well."], "Who + speaks."),
          t("Đây là ngôi trường nơi tôi học.", ["This is the school where I study.", "This is the school which I study at.", "This is the school I study at."], "Where + S + V."),
          t("Tôi thích cuốn sách mà tôi đã mua hôm qua.", ["I like the book which I bought yesterday.", "I like the book that I bought yesterday.", "I like the book I bought yesterday."], "Which + S + V; có thể lược bỏ which.")
        ]
      },
      {
        title: "Exercise 3: Viết câu hoàn chỉnh từ từ gợi ý",
        intro: "Viết câu hoàn chỉnh từ các từ gợi ý: chia động từ, thêm mạo từ/dấu câu nếu cần.",
        items: [
          t("I / study / English / every day", "I study English every day.", "Hiện tại đơn."),
          t("She / be / very / friendly", "She is very friendly.", "She → is."),
          t("They / play / football / yesterday", ["They played football yesterday.", "Yesterday they played football."], "Yesterday → played."),
          t("My father / be / a / doctor", "My father is a doctor.", "My father → is."),
          t("I / like / English / because / it / be / useful", "I like English because it is useful.", "It → is."),
          t("Although / I / be / tired / I / continue / study", ["Although I am tired, I continue studying.", "Although I am tired, I continue to study.", "Although I was tired, I continued studying.", "Although I was tired, I continued to study."], "Although + S + V, S + V; continue + V-ing / to V."),
          t("I / have / a friend / who / speak / English / well", "I have a friend who speaks English well.", "A friend (số ít) → who speaks."),
          t("This / be / the school / where / I / study", "This is the school where I study.", "This → is.")
        ]
      },
      {
        title: "Exercise 4: Sửa lỗi sai",
        intro: "Mỗi câu có một lỗi sai. Viết lại câu đúng.",
        items: [
          t("I am study English every day.", ["I study English every day.", "I am studying English every day."], "Không dùng am + V nguyên mẫu."),
          t("She very beautiful.", "She is very beautiful.", "Thiếu BE."),
          t("He play football yesterday.", "He played football yesterday.", "Yesterday → played."),
          t("I very like English.", ["I really like English.", "I like English very much."], "Very không đứng trước động từ."),
          t("Although it was raining, but we went outside.", ["Although it was raining, we went outside.", "It was raining, but we went outside."], "Bỏ but (hoặc bỏ although)."),
          t("Despite she was tired, she continued studying.", ["Despite being tired, she continued studying.", "Although she was tired, she continued studying.", "Despite her tiredness, she continued studying."], "Despite + V-ing."),
          t("I have a friend which speaks English well.", ["I have a friend who speaks English well.", "I have a friend that speaks English well."], "Người → who."),
          t("This is the school which I study.", ["This is the school where I study.", "This is the school which I study at.", "This is the school that I study at.", "This is the school I study at."], "Nơi chốn + S + V → where."),
          t("He is a teacher who teach English.", ["He is a teacher who teaches English.", "He is a teacher that teaches English."], "A teacher → who teaches."),
          t("I was tired, I went to bed early.", ["I was tired, so I went to bed early.", "Because I was tired, I went to bed early.", "I went to bed early because I was tired."], "Không nối hai câu chỉ bằng dấu phẩy — thêm so hoặc dùng because.")
        ]
      }
    ],
    quiz: [
      qz("Chọn đáp án đúng: “My brother ___ a lot of books.”", ["is have", "has", "have", "is"], 1, "Have là động từ thường; my brother → has."),
      qz("Chọn đáp án đúng: “The children ___ excited yesterday.”", ["was", "were", "are", "is"], 1, "Yesterday + the children (số nhiều) → were."),
      qz("Câu nào đúng thứ tự?", ["She every morning reads the news at home.", "She reads the news at home every morning.", "She reads at home the news every morning.", "Every morning she at home reads the news."], 1, "S + V + O + Place + Time."),
      qz("Chọn đáp án đúng: “It was very cold, ___ we stayed inside.”", ["but", "so", "because", "although"], 1, "Ở trong nhà là kết quả → so."),
      qz("Chọn đáp án đúng: “She passed the exam ___ she didn't study much.”", ["because", "so", "although", "despite"], 2, "Trái ngược + S + V → although."),
      qz("Chọn đáp án đúng: “We went out ___ the heavy rain.”", ["although", "despite", "because", "so"], 1, "Trái ngược + danh từ → despite."),
      qz("Chọn đáp án đúng: “I'm reading a book ___ my teacher recommended.”", ["who", "which", "where", "whose"], 1, "Vật → which."),
      qz("Chọn đáp án đúng: “That's the hospital ___ my mother works.”", ["which", "who", "where", "when"], 2, "Nơi chốn + S + V → where."),
      qz("Câu nào SAI?", ["I agree with you.", "She is a nurse.", "They are play games.", "We were at home."], 2, "They are play → They play / They are playing."),
      qz("Chọn đáp án đúng: “She is the singer ___ songs are very popular.”", ["who", "whose", "which", "whom"], 1, "Sở hữu → whose + N.")
    ],
    summary: "Ôn lại toàn bộ chuyên đề: S + V, S + be, thứ tự câu, and/but/so, because/although/despite, mệnh đề quan hệ. Đạt từ 80% phần trắc nghiệm để hoàn thành; làm thêm 4 bài tự chấm ở cuối và ghi lại các lỗi hay mắc."
  })
];
