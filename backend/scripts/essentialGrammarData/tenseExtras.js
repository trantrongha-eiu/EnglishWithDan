"use strict";

// Extra blocks for the 12 Tenses lessons, keyed by lessonKey and merged into
// each lesson in tenses.js:
//   videos           – teaching video(s) from the YouTube channel
//                      "Lớp tiếng Anh cô Quỳnh - MyPas" (playlist "12 Thì trong tiếng Anh")
//   conjugationDrill – "chia động từ trong ngoặc", auto-checked
//   translationDrill – Việt → Anh, checked against the accepted answers
//   verbForms        – V0 → V2 (Past Simple) / V0 → V3 (Present Perfect)
//
// Answers: a string, or an array of accepted answers. The student page
// already treats contractions as equal to the long form (doesn't = does not,
// I'm = I am ...), ignores case/punctuation and reads "five" as "5", so only
// list alternatives that differ in wording.

const CHANNEL = "Lớp tiếng Anh cô Quỳnh - MyPas";

function video(youtubeId, title, duration, label) {
  return { youtubeId, title, duration, channel: CHANNEL, ...(label ? { label } : {}) };
}

const ED_VIDEO = video("b2z0W-zCCz4", "[English Tenses] \"-ED\" PRONUNCIATION - Quy tắc đọc \"-ed\"", "4:19",
  "Bonus: cách đọc đuôi -ed của động từ có quy tắc");

function c(sentence, answers, explanation) {
  return { sentence, answers: [].concat(answers), explanation };
}
function t(vi, answers, hint) {
  return { vi, answers: [].concat(answers), hint };
}

// ── Verb table: base, nghĩa, V2, V3 (alternatives separated by "|") ──
const VERBS = {};
function verb(base, meaning, past, pastParticiple, note) {
  VERBS[base] = { base, meaning, past: past.split("|"), pastParticiple: pastParticiple.split("|"), ...(note ? { note } : {}) };
}
// Có quy tắc
verb("work", "làm việc", "worked", "worked");
verb("play", "chơi", "played", "played", "Nguyên âm + y → giữ y, thêm -ed.");
verb("study", "học", "studied", "studied", "Phụ âm + y → đổi y thành i rồi thêm -ed.");
verb("stop", "dừng lại", "stopped", "stopped", "1 nguyên âm + 1 phụ âm cuối (từ 1 âm tiết) → gấp đôi phụ âm cuối.");
verb("live", "sống", "lived", "lived", "Tận cùng bằng -e → chỉ thêm -d.");
verb("plan", "lên kế hoạch", "planned", "planned", "1 nguyên âm + 1 phụ âm cuối → gấp đôi phụ âm cuối.");
verb("cry", "khóc", "cried", "cried", "Phụ âm + y → đổi y thành i rồi thêm -ed.");
verb("visit", "thăm", "visited", "visited", "Trọng âm ở âm tiết đầu (VIS-it) → không gấp đôi t.");
verb("travel", "đi du lịch", "travelled|traveled", "travelled|traveled", "Anh-Anh: travelled · Anh-Mỹ: traveled.");
verb("try", "thử, cố gắng", "tried", "tried", "Phụ âm + y → đổi y thành i rồi thêm -ed.");
verb("enjoy", "thích, tận hưởng", "enjoyed", "enjoyed", "Nguyên âm + y → giữ y, thêm -ed.");
verb("watch", "xem", "watched", "watched");
verb("decide", "quyết định", "decided", "decided", "Tận cùng bằng -e → chỉ thêm -d.");
verb("prefer", "thích hơn", "preferred", "preferred", "Trọng âm ở âm tiết cuối (pre-FER) → gấp đôi r.");
verb("finish", "hoàn thành", "finished", "finished");
verb("increase", "tăng", "increased", "increased", "Tận cùng bằng -e → chỉ thêm -d.");
verb("arrive", "đến nơi", "arrived", "arrived", "Tận cùng bằng -e → chỉ thêm -d.");
// Bất quy tắc
verb("go", "đi", "went", "gone", "been cũng là V3 hay gặp: \"have been to\" = đã từng đến (và đã về).");
verb("be", "thì, là, ở", "was|were", "been", "was dùng cho I/he/she/it; were dùng cho you/we/they.");
verb("have", "có", "had", "had");
verb("do", "làm", "did", "done");
verb("see", "nhìn thấy", "saw", "seen");
verb("eat", "ăn", "ate", "eaten");
verb("buy", "mua", "bought", "bought");
verb("take", "lấy, cầm", "took", "taken");
verb("make", "làm, chế tạo", "made", "made");
verb("come", "đến", "came", "come", "V3 giống hệt V0: come – came – come.");
verb("write", "viết", "wrote", "written");
verb("drink", "uống", "drank", "drunk");
verb("think", "nghĩ", "thought", "thought");
verb("teach", "dạy", "taught", "taught");
verb("catch", "bắt", "caught", "caught");
verb("find", "tìm thấy", "found", "found");
verb("get", "nhận được", "got", "got|gotten", "Anh-Mỹ hay dùng V3 là gotten.");
verb("give", "cho, tặng", "gave", "given");
verb("know", "biết", "knew", "known");
verb("leave", "rời đi", "left", "left");
verb("meet", "gặp", "met", "met");
verb("pay", "trả tiền", "paid", "paid", "Không viết payed.");
verb("read", "đọc", "read", "read", "Viết giống nhau nhưng V2/V3 đọc là /red/.");
verb("run", "chạy", "ran", "run", "V3 giống hệt V0: run – ran – run.");
verb("sell", "bán", "sold", "sold");
verb("send", "gửi", "sent", "sent");
verb("sleep", "ngủ", "slept", "slept");
verb("speak", "nói", "spoke", "spoken");
verb("swim", "bơi", "swam", "swum");
verb("tell", "kể, bảo", "told", "told");
verb("understand", "hiểu", "understood", "understood");
verb("win", "thắng", "won", "won");
verb("begin", "bắt đầu", "began", "begun");
verb("break", "làm vỡ", "broke", "broken");
verb("bring", "mang đến", "brought", "brought");
verb("choose", "chọn", "chose", "chosen");
verb("drive", "lái xe", "drove", "driven");
verb("fall", "ngã, rơi", "fell", "fallen");
verb("feel", "cảm thấy", "felt", "felt");
verb("fly", "bay", "flew", "flown");
verb("forget", "quên", "forgot", "forgotten");
verb("grow", "lớn lên, trồng", "grew", "grown");
verb("hear", "nghe thấy", "heard", "heard");
verb("lose", "làm mất", "lost", "lost");
verb("put", "đặt, để", "put", "put", "Cả 3 dạng giống nhau.");
verb("ride", "đi (xe đạp), cưỡi", "rode", "ridden");
verb("sing", "hát", "sang", "sung");
verb("steal", "ăn trộm", "stole", "stolen");
verb("wear", "mặc, đội", "wore", "worn");
verb("become", "trở thành", "became", "become", "V3 giống hệt V0: become – became – become.");
verb("show", "cho xem", "showed", "shown|showed");
verb("throw", "ném", "threw", "thrown");
verb("wake", "thức dậy", "woke", "woken");
verb("hide", "trốn, giấu", "hid", "hidden");
verb("draw", "vẽ", "drew", "drawn");
verb("rise", "tăng, mọc", "rose", "risen");

function verbList(bases) {
  return bases.map(b => {
    if (!VERBS[b]) throw new Error("tenseExtras: unknown verb " + b);
    return VERBS[b];
  });
}

module.exports = {
  "present-simple": {
    videos: [video("7MothR_-dz0", "[English Tenses] PRESENT SIMPLE - Thì Hiện tại đơn", "6:01")],
    conjugationDrill: [
      c("Mai (watch) ___ TV every evening.", "watches", "Chủ ngữ số ít; watch tận cùng -ch → thêm -es."),
      c("My parents (not/eat) ___ meat on Fridays.", "don't eat", "Chủ ngữ số nhiều → don't + V nguyên mẫu."),
      c("___ (your brother / play) the guitar?", "Does your brother play", "Chủ ngữ số ít → Does + S + V nguyên mẫu?"),
      c("The baby (cry) ___ when she is hungry.", "cries", "Phụ âm + y → đổi y thành i, thêm -es."),
      c("He usually (fly) ___ to Da Nang for work.", "flies", "Phụ âm + y → ies; trạng từ tần suất \"usually\"."),
      c("The museum (not/open) ___ on Mondays.", "doesn't open", "Chủ ngữ số ít → doesn't + V nguyên mẫu."),
      c("Water (cover) ___ about 71% of the Earth's surface.", "covers", "Sự thật hiển nhiên, chủ ngữ số ít → thêm -s."),
      c("My best friend (have) ___ two cats.", "has", "have → has với he/she/it."),
      c("We (go) ___ swimming twice a week.", "go", "Chủ ngữ \"we\" → giữ nguyên V."),
      c("How often ___ (she / visit) her grandparents?", "does she visit", "Câu hỏi Wh-: Wh- + does + S + V nguyên mẫu?"),
      c("Tom (fix) ___ computers for a living.", "fixes", "fix tận cùng -x → thêm -es."),
      c("I (not/understand) ___ this word.", "don't understand", "Chủ ngữ \"I\" → don't + V nguyên mẫu.")
    ],
    translationDrill: [
      t("Tôi thường đi học bằng xe đạp.", ["I usually go to school by bike.", "I usually go to school by bicycle.", "I usually ride my bike to school.", "I usually cycle to school."], "Trạng từ tần suất đứng trước động từ thường: I usually go..."),
      t("Anh ấy không thích ăn rau.", ["He doesn't like eating vegetables.", "He doesn't like to eat vegetables.", "He doesn't like vegetables."], "he → doesn't + V nguyên mẫu."),
      t("Bạn có sống gần đây không?", ["Do you live near here?", "Do you live nearby?", "Do you live around here?"], "Do + you + V nguyên mẫu?"),
      t("Mẹ tôi dậy lúc 5 giờ sáng mỗi ngày.", ["My mother gets up at 5 a.m. every day.", "My mother wakes up at 5 a.m. every day.", "My mom gets up at 5 a.m. every day.", "My mum gets up at 5 a.m. every day.", "My mother gets up at 5 o'clock every morning."], "get up / wake up → gets up / wakes up (ngôi thứ ba số ít)."),
      t("Tàu hỏa khởi hành lúc 7 giờ tối.", ["The train leaves at 7 p.m.", "The train departs at 7 p.m.", "The train leaves at 7 o'clock in the evening."], "Lịch trình cố định → Present Simple: leaves / departs."),
      t("Chị gái tôi làm y tá ở một bệnh viện lớn.", ["My sister works as a nurse in a big hospital.", "My sister works as a nurse at a big hospital.", "My older sister works as a nurse in a big hospital.", "My older sister works as a nurse at a big hospital.", "My sister is a nurse in a big hospital.", "My sister is a nurse at a big hospital."], "work as + nghề nghiệp: works as a nurse."),
      t("Trái Đất quay quanh Mặt Trời.", ["The Earth goes around the Sun.", "The Earth moves around the Sun.", "The Earth orbits the Sun.", "The Earth revolves around the Sun.", "The Earth goes round the Sun."], "Sự thật hiển nhiên; chủ ngữ số ít → V-s."),
      t("Chúng tôi không đi làm vào Chủ nhật.", ["We don't go to work on Sundays.", "We don't work on Sundays.", "We don't go to work on Sunday."], "we → don't + V; on Sundays = vào các ngày Chủ nhật."),
      t("Cô ấy có hay đọc sách trước khi ngủ không?", ["Does she often read books before bed?", "Does she often read before bed?", "Does she often read books before going to bed?", "Does she often read before going to bed?", "Does she often read books before she goes to bed?", "Does she usually read books before bed?"], "Does + she + often + V nguyên mẫu?"),
      t("Biểu đồ cho thấy số lượng khách du lịch đến Việt Nam.", ["The chart shows the number of tourists visiting Vietnam.", "The chart shows the number of tourists coming to Vietnam.", "The chart shows the number of tourists to Vietnam.", "The chart shows the number of visitors to Vietnam."], "Câu mở bài Task 1: The chart shows + the number of + N số nhiều.")
    ]
  },

  "present-continuous": {
    videos: [video("Pbcp9DzurG4", "[English Tenses] PRESENT CONTINUOUS - Thì hiện tại tiếp diễn", "5:56")],
    conjugationDrill: [
      c("Listen! Someone (knock) ___ at the door.", "is knocking", "\"Listen!\" → hành động đang diễn ra."),
      c("The kids (swim) ___ in the pool right now.", "are swimming", "swim → swimming (gấp đôi m)."),
      c("I (not/use) ___ the laptop at the moment, so you can borrow it.", "am not using", "I → am not + V-ing."),
      c("___ (you / wait) for the bus?", "Are you waiting", "Are + you + V-ing?"),
      c("She (lie) ___ on the beach now.", "is lying", "lie → lying (ie → y + ing)."),
      c("Look! It (start) ___ to rain.", "is starting", "\"Look!\" → đang xảy ra."),
      c("More and more people (move) ___ to big cities these days.", "are moving", "Xu hướng đang thay đổi; move → moving (bỏ e)."),
      c("My dad (not/work) ___ today because he is ill.", "isn't working", "Tình huống tạm thời hôm nay → is not + V-ing."),
      c("What ___ (they / talk) about?", "are they talking", "Wh- + are + they + V-ing?"),
      c("We (have) ___ dinner with our grandparents tonight.", "are having", "Kế hoạch đã sắp xếp cho tương lai gần."),
      c("The price of houses (rise) ___ quickly this year.", "is rising", "Chủ ngữ \"the price\" số ít; rise → rising.")
    ],
    translationDrill: [
      t("Bây giờ tôi đang làm bài tập về nhà.", ["I am doing my homework now.", "I am doing my homework right now.", "I am doing homework now.", "Now I am doing my homework."], "I am + V-ing; \"làm bài tập\" = do homework."),
      t("Nhìn kìa! Con mèo đang trèo lên cây.", ["Look! The cat is climbing the tree.", "Look! The cat is climbing up the tree.", "Look! The cat is climbing a tree."], "Look! + S + is + V-ing."),
      t("Họ không xem tivi lúc này.", ["They are not watching TV at the moment.", "They are not watching TV now.", "They are not watching TV right now."], "They are not + V-ing; lúc này = at the moment."),
      t("Bạn đang nghĩ gì vậy?", ["What are you thinking about?", "What are you thinking?"], "What + are + you + V-ing (about)?"),
      t("Giá nhà đang tăng nhanh.", ["House prices are rising quickly.", "House prices are rising fast.", "House prices are increasing quickly.", "House prices are rising rapidly.", "House prices are increasing rapidly."], "Xu hướng đang diễn ra; prices số nhiều → are rising."),
      t("Em trai tôi đang ngủ trong phòng.", ["My younger brother is sleeping in his room.", "My little brother is sleeping in his room.", "My younger brother is sleeping in the room.", "My brother is sleeping in his room."], "is + sleeping."),
      t("Tối nay chúng tôi sẽ đi xem phim (đã lên kế hoạch).", ["We are going to the cinema tonight.", "We are going to the movies tonight.", "We are seeing a film tonight.", "We are watching a movie tonight.", "We are watching a film tonight."], "Kế hoạch đã sắp xếp → Present Continuous, không cần \"will\"."),
      t("Cô ấy đang học để thi IELTS.", ["She is studying for the IELTS exam.", "She is studying for the IELTS test.", "She is studying for IELTS.", "She is preparing for the IELTS exam.", "She is preparing for the IELTS test."], "study for / prepare for + kỳ thi."),
      t("Tuần này bố bạn có làm việc ở nhà không?", ["Is your father working from home this week?", "Is your father working at home this week?", "Is your dad working from home this week?", "Is your dad working at home this week?"], "Tình huống tạm thời \"tuần này\" → Is + S + V-ing?"),
      t("Ngày càng nhiều học sinh đang sử dụng AI để học.", ["More and more students are using AI to study.", "More and more students are using AI to learn.", "More and more students are using AI for studying.", "More and more students are using AI for learning."], "More and more + N số nhiều + are + V-ing.")
    ]
  },

  "present-perfect": {
    videos: [
      video("IKqqZ-uwwqU", "[English Tenses] PRESENT PERFECT - Thì Hiện tại hoàn thành", "5:41"),
      ED_VIDEO
    ],
    verbForms: {
      target: "pastParticiple",
      items: verbList([
        "go", "finish", "be", "do", "see", "study", "eat", "take", "write", "stop", "drink", "give",
        "know", "live", "speak", "break", "buy", "choose", "drive", "travel", "fall", "fly", "forget", "make",
        "grow", "ride", "try", "sing", "steal", "wear", "swim", "begin", "lose", "run", "come", "become",
        "increase", "throw", "wake", "hide", "draw", "rise", "meet", "read", "put", "show"
      ])
    },
    conjugationDrill: [
      c("I (lose) ___ my wallet, so I can't pay.", "have lost", "Hành động quá khứ còn ảnh hưởng hiện tại; lose → lost (V3)."),
      c("She (never / be) ___ to Phu Quoc.", "has never been", "has + never + V3 (be → been)."),
      c("They (live) ___ in this house since 2015.", "have lived", "since + mốc thời gian → Present Perfect."),
      c("___ (you / ever / eat) sushi?", "Have you ever eaten", "Have + you + ever + V3? (eat → eaten)"),
      c("We (not/see) ___ him for three years.", "haven't seen", "for + khoảng thời gian; see → seen."),
      c("My brother (just / finish) ___ his homework.", "has just finished", "has + just + V3: vừa mới."),
      c("The number of electric cars (increase) ___ dramatically since 2020.", "has increased", "\"The number of\" là chủ ngữ số ít → has."),
      c("___ (she / write) the report yet?", "Has she written", "Câu hỏi với yet; write → written."),
      c("I (already / buy) ___ the tickets.", "have already bought", "have + already + V3 (buy → bought)."),
      c("He (break) ___ his leg, so he can't play football.", "has broken", "break → broke → broken."),
      c("How many books ___ (you / read) this year?", "have you read", "this year chưa kết thúc → Present Perfect.")
    ],
    translationDrill: [
      t("Tôi đã sống ở Hà Nội được 10 năm.", ["I have lived in Hanoi for 10 years.", "I have been living in Hanoi for 10 years.", "I have lived in Ha Noi for 10 years."], "have + V3 + for + khoảng thời gian."),
      t("Bạn đã bao giờ đến Đà Lạt chưa?", ["Have you ever been to Da Lat?", "Have you ever been to Dalat?", "Have you ever visited Da Lat?", "Have you ever visited Dalat?"], "Have you ever been to + nơi chốn? (đã từng đến)"),
      t("Cô ấy vừa mới về nhà.", ["She has just come home.", "She has just got home.", "She has just gotten home.", "She has just arrived home.", "She has just returned home."], "has + just + V3."),
      t("Chúng tôi chưa ăn trưa.", ["We haven't had lunch yet.", "We haven't eaten lunch yet.", "We haven't had lunch.", "We haven't eaten lunch."], "haven't + V3 + yet (yet đứng cuối câu)."),
      t("Anh ấy đã làm mất điện thoại.", ["He has lost his phone.", "He has lost his mobile phone.", "He has lost his cell phone."], "Kết quả còn ở hiện tại (bây giờ không có điện thoại) → has lost."),
      t("Tôi chưa bao giờ đi máy bay.", ["I have never travelled by plane.", "I have never traveled by plane.", "I have never flown.", "I have never been on a plane.", "I have never taken a plane.", "I have never flown on a plane."], "have + never + V3."),
      t("Họ đã biết nhau từ năm 2010.", ["They have known each other since 2010."], "know là động từ trạng thái → have known (không dùng tiếp diễn)."),
      t("Giá xăng đã tăng gấp đôi kể từ năm 2015.", ["Petrol prices have doubled since 2015.", "Gas prices have doubled since 2015.", "The price of petrol has doubled since 2015.", "The price of gas has doubled since 2015.", "Fuel prices have doubled since 2015."], "double = tăng gấp đôi; since + năm."),
      t("Bạn đã làm xong bài tập chưa?", ["Have you finished your homework yet?", "Have you done your homework yet?", "Have you finished your homework?", "Have you done your homework?", "Have you completed your homework yet?"], "Have + you + V3 ... yet?"),
      t("Tôi đã đọc cuốn sách này ba lần.", ["I have read this book three times.", "I have read this book 3 times."], "Số lần (three times) → Present Perfect; read – read – read.")
    ]
  },

  "present-perfect-continuous": {
    videos: [video("jaD6Iwxmvb0", "[English Tenses] PRESENT PERFECT CONTINUOUS - Thì Hiện tại hoàn thành tiếp diễn", "6:26")],
    conjugationDrill: [
      c("I (wait) ___ for you for two hours!", "have been waiting", "Nhấn mạnh quá trình kéo dài đến bây giờ."),
      c("She (learn) ___ English since she was six.", "has been learning", "has been + V-ing + since."),
      c("It (rain) ___ all morning, so the streets are flooded.", "has been raining", "Hành động kéo dài, kết quả thấy ở hiện tại."),
      c("How long ___ (you / study) here?", "have you been studying", "How long + have + S + been + V-ing?"),
      c("They (not/sleep) ___ well recently.", "haven't been sleeping", "haven't been + V-ing."),
      c("My hands are dirty because I (work) ___ in the garden.", "have been working", "Dấu vết ở hiện tại của một hoạt động vừa kéo dài."),
      c("He (play) ___ video games for five hours.", "has been playing", "for + khoảng thời gian."),
      c("We (save) ___ money to buy a house.", "have been saving", "save → saving (bỏ e)."),
      c("___ (she / cry)? Her eyes are red.", "Has she been crying", "Has + she + been + V-ing?"),
      c("The company (lose) ___ customers for months.", "has been losing", "lose → losing (bỏ e).")
    ],
    translationDrill: [
      t("Tôi đã học tiếng Anh được 5 năm rồi.", ["I have been learning English for 5 years.", "I have been studying English for 5 years."], "have been + V-ing + for."),
      t("Trời mưa suốt từ sáng.", ["It has been raining since this morning.", "It has been raining since the morning.", "It has been raining all morning."], "It has been raining + since..."),
      t("Bạn đã đợi bao lâu rồi?", ["How long have you been waiting?"], "How long + have + you + been + V-ing?"),
      t("Cô ấy đã làm việc ở công ty này từ năm 2018.", ["She has been working at this company since 2018.", "She has been working for this company since 2018.", "She has been working in this company since 2018."], "has been working + since + năm."),
      t("Họ đã chơi game cả buổi chiều.", ["They have been playing games all afternoon.", "They have been playing video games all afternoon.", "They have been playing computer games all afternoon."], "all afternoon = cả buổi chiều."),
      t("Tay tôi bẩn vì tôi đã sửa xe đạp.", ["My hands are dirty because I have been fixing my bike.", "My hands are dirty because I have been repairing my bike.", "My hands are dirty because I have been fixing my bicycle.", "My hands are dirty because I have been repairing my bicycle."], "Dấu vết hiện tại (tay bẩn) ← hoạt động vừa kéo dài."),
      t("Gần đây anh ấy ngủ không ngon.", ["He hasn't been sleeping well recently.", "He hasn't been sleeping well lately.", "Recently he hasn't been sleeping well.", "Lately he hasn't been sleeping well."], "hasn't been + V-ing + recently/lately."),
      t("Chúng tôi đã tiết kiệm tiền để mua nhà.", ["We have been saving money to buy a house.", "We have been saving money for a house.", "We have been saving up to buy a house.", "We have been saving to buy a house."], "have been saving (quá trình vẫn đang tiếp diễn)."),
      t("Số người dùng điện thoại thông minh đã tăng đều đặn trong thập kỷ qua.", ["The number of smartphone users has been increasing steadily over the past decade.", "The number of smartphone users has been rising steadily over the past decade.", "The number of smartphone users has been growing steadily over the past decade.", "The number of smartphone users has been increasing steadily over the last decade.", "The number of smartphone users has been rising steadily over the last decade.", "The number of smartphone users has been increasing steadily in the past decade."], "The number of ... (số ít) + has been + V-ing + over the past decade."),
      t("Sao bạn mệt vậy? Bạn vừa chạy bộ à?", ["Why are you so tired? Have you been running?", "Why are you so tired? Have you been jogging?"], "Hỏi nguyên nhân của trạng thái hiện tại → Have you been + V-ing?")
    ]
  },

  "past-simple": {
    videos: [
      video("bshfXtV5F3M", "[English Tenses] PAST SIMPLE - Thì Quá khứ đơn", "8:14"),
      ED_VIDEO
    ],
    verbForms: {
      target: "past",
      items: verbList([
        "work", "go", "play", "buy", "study", "eat", "stop", "see", "live", "take", "plan", "come",
        "cry", "write", "visit", "think", "travel", "teach", "be", "catch", "try", "find", "enjoy", "get",
        "prefer", "leave", "decide", "meet", "pay", "read", "watch", "run", "sell", "swim", "tell", "understand",
        "win", "begin", "bring", "fly", "feel", "drink", "speak", "sleep", "send", "have"
      ])
    },
    conjugationDrill: [
      c("We (visit) ___ Hue last summer.", "visited", "last summer → Past Simple; động từ có quy tắc + -ed."),
      c("She (buy) ___ a new dress yesterday.", "bought", "buy → bought (bất quy tắc)."),
      c("I (not/go) ___ to school last Monday because I was sick.", "didn't go", "didn't + V nguyên mẫu (không chia went)."),
      c("___ (you / see) the film last night?", "Did you see", "Did + S + V nguyên mẫu?"),
      c("He (stop) ___ the car at the traffic lights.", "stopped", "stop → stopped (gấp đôi p)."),
      c("My grandfather (study) ___ in Russia in the 1980s.", "studied", "study → studied (y → ied)."),
      c("They (not/enjoy) ___ the party.", "didn't enjoy", "didn't + V nguyên mẫu."),
      c("Where ___ (you / go) on holiday last year?", "did you go", "Wh- + did + S + V nguyên mẫu?"),
      c("The company (open) ___ its first store in 2005.", "opened", "in + năm trong quá khứ → Past Simple."),
      c("I (write) ___ a letter to my pen pal two days ago.", "wrote", "write → wrote; \"ago\" là dấu hiệu quá khứ."),
      c("She (be) ___ very tired after the trip.", "was", "she → was."),
      c("We (be) ___ at home yesterday evening.", "were", "we → were.")
    ],
    translationDrill: [
      t("Hôm qua tôi đã gặp cô giáo cũ.", ["I met my old teacher yesterday.", "Yesterday I met my old teacher.", "I met my former teacher yesterday.", "I saw my old teacher yesterday."], "meet → met."),
      t("Chúng tôi đã đi Nha Trang vào mùa hè năm ngoái.", ["We went to Nha Trang last summer.", "Last summer we went to Nha Trang.", "We visited Nha Trang last summer.", "We travelled to Nha Trang last summer.", "We traveled to Nha Trang last summer."], "go → went; last summer."),
      t("Anh ấy không đến lớp tuần trước.", ["He didn't come to class last week.", "He didn't go to class last week.", "He didn't attend class last week."], "didn't + V nguyên mẫu."),
      t("Bạn có xem trận đấu tối qua không?", ["Did you watch the match last night?", "Did you watch the game last night?", "Did you see the match last night?", "Did you see the game last night?"], "Did + you + V nguyên mẫu ... last night?"),
      t("Cô ấy mua chiếc xe này ba năm trước.", ["She bought this car three years ago.", "She bought this car 3 years ago."], "buy → bought; ... ago."),
      t("Bố tôi sinh năm 1975.", ["My father was born in 1975.", "My dad was born in 1975."], "\"sinh ra\" = was/were born."),
      t("Bộ phim kết thúc lúc 10 giờ tối.", ["The film ended at 10 p.m.", "The movie ended at 10 p.m.", "The film finished at 10 p.m.", "The movie finished at 10 p.m."], "end/finish + -ed."),
      t("Năm 2010, doanh số bán hàng đạt 2 triệu đô la.", ["In 2010, sales reached 2 million dollars.", "Sales reached 2 million dollars in 2010.", "In 2010, sales reached $2 million.", "Sales reached $2 million in 2010."], "Số liệu năm quá khứ trong Task 1 → Past Simple: reached."),
      t("Tối qua bạn đã ăn gì?", ["What did you eat last night?", "What did you have for dinner last night?", "What did you eat for dinner last night?"], "What + did + you + V nguyên mẫu?"),
      t("Họ đã không hiểu bài giảng.", ["They didn't understand the lecture.", "They didn't understand the lesson."], "didn't + understand (không dùng understood sau didn't).")
    ]
  },

  "past-continuous": {
    videos: [video("351bm-JH_K0", "[English Tense] PAST CONTINUOUS - Thì Quá khứ tiếp diễn", "6:36")],
    conjugationDrill: [
      c("At 8 p.m. yesterday, I (watch) ___ a film.", "was watching", "Thời điểm cụ thể trong quá khứ → was/were + V-ing."),
      c("They (play) ___ football when it started to rain.", "were playing", "Hành động đang diễn ra thì hành động khác xen vào."),
      c("While she (cook) ___, the phone rang.", "was cooking", "while + quá khứ tiếp diễn."),
      c("What ___ (you / do) at 10 o'clock last night?", "were you doing", "Wh- + were + you + V-ing?"),
      c("We (not/sleep) ___ when the earthquake happened.", "weren't sleeping", "weren't + V-ing."),
      c("The sun (shine) ___ and the birds were singing.", "was shining", "Miêu tả bối cảnh trong quá khứ; shine → shining."),
      c("I (walk) ___ home when I met my old teacher.", "was walking", "Hành động nền bị hành động ngắn (met) xen vào."),
      c("___ (he / drive) fast when the accident happened?", "Was he driving", "Was + he + V-ing?"),
      c("While I was reading, my brother (listen) ___ to music.", "was listening", "Hai hành động diễn ra song song → cả hai dùng quá khứ tiếp diễn."),
      c("She (not/pay) ___ attention, so she missed her bus stop.", "wasn't paying", "wasn't + V-ing.")
    ],
    translationDrill: [
      t("Lúc 8 giờ tối qua, tôi đang xem tivi.", ["At 8 p.m. last night, I was watching TV.", "I was watching TV at 8 p.m. last night.", "At 8 o'clock last night, I was watching TV.", "At 8 p.m. yesterday, I was watching TV."], "Mốc giờ cụ thể trong quá khứ → was + V-ing."),
      t("Khi bạn gọi, tôi đang tắm.", ["When you called, I was taking a shower.", "When you called, I was having a shower.", "I was taking a shower when you called.", "I was having a shower when you called.", "When you called, I was taking a bath.", "When you called, I was having a bath."], "Hành động đang diễn ra (was taking a shower) + hành động xen vào (called)."),
      t("Họ đang chơi bóng đá thì trời bắt đầu mưa.", ["They were playing football when it started to rain.", "They were playing football when it began to rain.", "They were playing football when it started raining.", "They were playing soccer when it started to rain."], "were playing ... when + Past Simple."),
      t("Trong khi mẹ tôi nấu ăn thì bố tôi đọc báo.", ["While my mother was cooking, my father was reading the newspaper.", "While my mom was cooking, my dad was reading the newspaper.", "While my mum was cooking, my dad was reading the newspaper.", "While my mother was cooking, my father was reading the paper."], "Hai hành động song song → while + was V-ing, was V-ing."),
      t("Bạn đang làm gì lúc 9 giờ tối qua?", ["What were you doing at 9 p.m. last night?", "What were you doing at 9 o'clock last night?", "What were you doing at 9 p.m. yesterday?"], "What + were + you + doing?"),
      t("Cô ấy không nghe khi thầy giáo đang giảng bài.", ["She wasn't listening when the teacher was explaining the lesson.", "She wasn't listening when the teacher explained the lesson.", "She wasn't listening while the teacher was explaining the lesson."], "wasn't + V-ing."),
      t("Lúc đó trời đang mưa rất to.", ["It was raining very heavily at that time.", "It was raining heavily at that time.", "At that time, it was raining very heavily.", "It was raining very hard at that time.", "At that time, it was raining very hard."], "It was raining + at that time."),
      t("Tôi đang đi bộ về nhà thì gặp một người bạn cũ.", ["I was walking home when I met an old friend.", "I was walking home when I saw an old friend.", "I was walking home when I ran into an old friend."], "was walking ... when + met."),
      t("Anh ấy có đang lái xe khi tai nạn xảy ra không?", ["Was he driving when the accident happened?", "Was he driving when the accident occurred?"], "Was + he + V-ing ... when + Past Simple?"),
      t("Giờ này năm ngoái, chúng tôi đang sống ở Đà Nẵng.", ["This time last year, we were living in Da Nang.", "At this time last year, we were living in Da Nang.", "We were living in Da Nang this time last year.", "This time last year, we were living in Danang."], "This time last year → quá khứ tiếp diễn.")
    ]
  },

  "past-perfect": {
    videos: [video("hOXiCxjZ7Ro", "[English Tenses] PAST PERFECT - Thì Quá khứ hoàn thành", "4:17")],
    conjugationDrill: [
      c("When we arrived, the film (already / start) ___.", "had already started", "Xảy ra trước một hành động quá khứ khác → had + V3."),
      c("She (never / see) ___ snow before she went to Japan.", "had never seen", "had + never + V3 (see → seen)."),
      c("After he (finish) ___ his homework, he went out.", "had finished", "after + quá khứ hoàn thành (hành động xảy ra trước)."),
      c("I couldn't get in because I (lose) ___ my key.", "had lost", "lose → lost; mất chìa khóa xảy ra trước."),
      c("___ (they / leave) before you got there?", "Had they left", "Had + S + V3?"),
      c("By the time the police came, the thief (escape) ___.", "had escaped", "By the time + Past Simple → mệnh đề chính dùng Past Perfect."),
      c("We (not/eat) ___ anything all day, so we were very hungry.", "hadn't eaten", "hadn't + V3 (eat → eaten)."),
      c("He told me he (meet) ___ her before.", "had met", "Câu tường thuật lùi thì; meet → met."),
      c("By 2015, the population (double) ___.", "had doubled", "By + mốc quá khứ → Past Perfect (Task 1)."),
      c("The train (leave) ___ when we reached the station.", "had left", "Tàu đi trước khi chúng tôi đến; leave → left.")
    ],
    translationDrill: [
      t("Khi tôi đến, bộ phim đã bắt đầu rồi.", ["When I arrived, the film had already started.", "When I arrived, the movie had already started.", "When I got there, the film had already started.", "When I got there, the movie had already started.", "When I arrived, the film had already begun."], "Hành động xảy ra trước → had (already) + V3."),
      t("Cô ấy chưa từng thấy tuyết trước khi đến Hàn Quốc.", ["She had never seen snow before she came to Korea.", "She had never seen snow before she went to Korea.", "She had never seen snow before coming to Korea.", "She had never seen snow before going to Korea."], "had + never + V3 + before ..."),
      t("Sau khi làm xong bài tập, anh ấy đi ngủ.", ["After he had finished his homework, he went to bed.", "After he had done his homework, he went to bed.", "He went to bed after he had finished his homework.", "He went to bed after he had done his homework."], "After + had V3, + Past Simple."),
      t("Tôi không vào nhà được vì tôi đã làm mất chìa khóa.", ["I couldn't get into the house because I had lost my key.", "I couldn't get in because I had lost my key.", "I couldn't get into the house because I had lost my keys.", "I couldn't get in because I had lost my keys.", "I couldn't enter the house because I had lost my key."], "because + had lost (mất chìa khóa xảy ra trước)."),
      t("Khi cảnh sát đến, tên trộm đã trốn thoát.", ["When the police arrived, the thief had escaped.", "When the police arrived, the thief had already escaped.", "When the police came, the thief had escaped.", "When the police came, the thief had already escaped.", "By the time the police arrived, the thief had escaped.", "When the police arrived, the thief had run away."], "police đi với động từ số nhiều; the thief had escaped."),
      t("Họ đã rời đi trước khi chúng tôi đến chưa?", ["Had they left before we arrived?", "Had they left before we got there?", "Had they left before we came?"], "Had + they + V3 + before + Past Simple?"),
      t("Chúng tôi đói vì cả ngày chưa ăn gì.", ["We were hungry because we hadn't eaten anything all day.", "We were hungry because we had eaten nothing all day.", "We were hungry because we hadn't eaten all day."], "hadn't eaten anything = had eaten nothing."),
      t("Đến năm 2015, dân số thành phố đã tăng gấp đôi.", ["By 2015, the city's population had doubled.", "By 2015, the population of the city had doubled."], "By + năm quá khứ → had + V3."),
      t("Anh ấy nói rằng anh ấy đã gặp cô ấy trước đó.", ["He said that he had met her before.", "He said he had met her before.", "He said that he had seen her before.", "He said he had seen her before."], "Tường thuật: said (that) + had + V3."),
      t("Khi chúng tôi đến ga thì tàu đã rời đi.", ["When we got to the station, the train had left.", "When we got to the station, the train had already left.", "When we arrived at the station, the train had left.", "When we arrived at the station, the train had already left.", "The train had left when we got to the station.", "The train had left when we arrived at the station.", "By the time we got to the station, the train had left."], "when + Past Simple, + had left.")
    ]
  },

  "past-perfect-continuous": {
    videos: [video("kQzgX2NBb2c", "[English Tenses] PAST PERFECT CONTINUOUS - Thì Quá khứ hoàn thành tiếp diễn", "6:28")],
    conjugationDrill: [
      c("She was tired because she (work) ___ all day.", "had been working", "Quá trình kéo dài trước một thời điểm quá khứ → had been + V-ing."),
      c("They (wait) ___ for an hour before the bus came.", "had been waiting", "for + khoảng thời gian + before ..."),
      c("The road was wet because it (rain) ___.", "had been raining", "Dấu vết trong quá khứ (đường ướt) ← mưa kéo dài trước đó."),
      c("How long ___ (you / live) there before you moved?", "had you been living", "How long + had + S + been + V-ing?"),
      c("He (not/feel) ___ well for weeks before he saw a doctor.", "hadn't been feeling", "hadn't been + V-ing."),
      c("I (study) ___ English for five years before I took the IELTS test.", "had been studying", "had been + V-ing + for ... before ..."),
      c("We (drive) ___ for three hours when the car broke down.", "had been driving", "drive → driving (bỏ e)."),
      c("___ (she / cry)? Her eyes were red.", "Had she been crying", "Had + she + been + V-ing?"),
      c("The company (lose) ___ money for years before it closed.", "had been losing", "Quá trình kéo dài nhiều năm trước khi đóng cửa."),
      c("The kids were dirty because they (play) ___ in the mud.", "had been playing", "had been + V-ing.")
    ],
    translationDrill: [
      t("Cô ấy mệt vì đã làm việc cả ngày.", ["She was tired because she had been working all day.", "She was tired because she had been working the whole day."], "was tired ← had been working."),
      t("Chúng tôi đã đợi một tiếng thì xe buýt đến.", ["We had been waiting for an hour when the bus came.", "We had been waiting for an hour when the bus arrived.", "We had been waiting for an hour before the bus came.", "We had been waiting for an hour before the bus arrived.", "We had been waiting for 1 hour when the bus came."], "had been waiting for + thời gian + when/before + Past Simple."),
      t("Mặt đất ướt vì trời đã mưa suốt đêm.", ["The ground was wet because it had been raining all night.", "The ground was wet because it had been raining the whole night."], "it had been raining all night."),
      t("Anh ấy đã học tiếng Anh 5 năm trước khi thi IELTS.", ["He had been learning English for 5 years before he took the IELTS test.", "He had been studying English for 5 years before he took the IELTS test.", "He had been learning English for 5 years before he took the IELTS exam.", "He had been studying English for 5 years before he took the IELTS exam.", "He had been studying English for 5 years before taking the IELTS test.", "He had been learning English for 5 years before taking the IELTS test."], "had been + V-ing + for ... before ..."),
      t("Họ đã sống ở đó bao lâu trước khi chuyển đi?", ["How long had they been living there before they moved?", "How long had they been living there before they moved out?", "How long had they been living there before moving?", "How long had they been living there before they moved away?"], "How long + had + they + been + V-ing?"),
      t("Mắt cô ấy đỏ vì cô ấy đã khóc.", ["Her eyes were red because she had been crying."], "were red ← had been crying."),
      t("Chúng tôi đã lái xe được 3 tiếng thì xe bị hỏng.", ["We had been driving for 3 hours when the car broke down.", "We had been driving for 3 hours when our car broke down."], "break down = (xe) bị hỏng; broke down là V2."),
      t("Công ty đã thua lỗ nhiều năm trước khi đóng cửa.", ["The company had been losing money for years before it closed.", "The company had been losing money for many years before it closed.", "The company had been losing money for years before it closed down.", "The company had been losing money for many years before it closed down.", "The company had been losing money for years before closing."], "lose money = thua lỗ."),
      t("Bọn trẻ bẩn vì chúng đã chơi ngoài vườn.", ["The children were dirty because they had been playing in the garden.", "The kids were dirty because they had been playing in the garden.", "The children were dirty because they had been playing in the yard.", "The kids were dirty because they had been playing in the yard."], "were dirty ← had been playing."),
      t("Tôi đã ngủ không đủ giấc nhiều tuần trước khi bị ốm.", ["I hadn't been sleeping enough for weeks before I got sick.", "I hadn't been sleeping enough for weeks before I fell ill.", "I hadn't been getting enough sleep for weeks before I got sick.", "I hadn't been getting enough sleep for weeks before I fell ill.", "I hadn't been sleeping enough for weeks before I got ill."], "hadn't been + V-ing + for weeks.")
    ]
  },

  "future-simple": {
    videos: [video("v0WxNvAHlfY", "[English Tenses] FUTURE SIMPLE - Thì Tương lai đơn", "4:57")],
    conjugationDrill: [
      c("I think it (rain) ___ tomorrow.", "will rain", "Dự đoán theo ý kiến (I think) → will + V."),
      c("Don't worry, I (help) ___ you with your homework.", "will help", "Lời đề nghị giúp đỡ → will."),
      c("She (not/come) ___ to the party tonight. She told me she's too busy.", "won't come", "won't = will not + V nguyên mẫu."),
      c("___ (you / marry) me?", "Will you marry", "Will + you + V? (lời cầu hôn / đề nghị)"),
      c("Wait, I (open) ___ the door for you.", "will open", "Quyết định ngay lúc nói → will."),
      c("Perhaps they (win) ___ the match.", "will win", "perhaps / maybe + will."),
      c("In the future, robots (do) ___ most of the housework.", "will do", "Dự đoán tương lai."),
      c("I promise I (not/tell) ___ anyone.", "won't tell", "Lời hứa → will / won't."),
      c("The phone is ringing. I (answer) ___ it.", "will answer", "Quyết định tức thời → will."),
      c("___ (it / be) cold tomorrow?", "Will it be", "Will + it + be?")
    ],
    translationDrill: [
      t("Tôi nghĩ ngày mai trời sẽ mưa.", ["I think it will rain tomorrow."], "I think + S + will + V."),
      t("Tôi sẽ giúp bạn mang cái túi này.", ["I will help you carry this bag.", "I will help you to carry this bag.", "I will help you with this bag.", "I will carry this bag for you."], "Lời đề nghị → I will..."),
      t("Cô ấy sẽ không đến bữa tiệc.", ["She won't come to the party.", "She won't go to the party.", "She won't attend the party."], "won't + V nguyên mẫu."),
      t("Tối nay bạn sẽ gọi cho tôi chứ?", ["Will you call me tonight?", "Will you call me this evening?", "Will you phone me tonight?", "Will you phone me this evening?"], "Will + you + V?"),
      t("Có lẽ họ sẽ thắng trận đấu.", ["Perhaps they will win the match.", "Maybe they will win the match.", "Perhaps they will win the game.", "Maybe they will win the game.", "They will probably win the match."], "perhaps / maybe + S + will + V."),
      t("Tôi hứa sẽ không nói với ai.", ["I promise I won't tell anyone.", "I promise I won't tell anybody.", "I promise not to tell anyone."], "Lời hứa: I promise (that) I won't..."),
      t("Trong tương lai, robot sẽ làm hầu hết việc nhà.", ["In the future, robots will do most of the housework.", "In the future, robots will do most housework.", "In the future, robots will do most of the household chores."], "Dự đoán tương lai → will."),
      t("Điện thoại đang reo. Tôi sẽ nghe máy.", ["The phone is ringing. I will answer it.", "The phone is ringing. I will get it.", "The phone is ringing. I will pick it up."], "Quyết định ngay lúc nói → I'll answer it."),
      t("Ngày mai trời có lạnh không?", ["Will it be cold tomorrow?"], "Will + it + be + tính từ?"),
      t("Tôi tin rằng giá nhà sẽ tiếp tục tăng.", ["I believe that house prices will continue to rise.", "I believe house prices will continue to rise.", "I believe that house prices will continue to increase.", "I believe house prices will continue to increase.", "I believe house prices will keep rising.", "I believe that house prices will keep rising."], "I believe (that) + S + will + V (Task 2 dự đoán).")
    ]
  },

  "future-continuous": {
    videos: [video("RSRMW8tCC_c", "Thì tương lai tiếp diễn - Future continuous", "3:50")],
    conjugationDrill: [
      c("This time tomorrow, I (lie) ___ on the beach.", "will be lying", "This time tomorrow → will be + V-ing; lie → lying."),
      c("At 9 a.m. next Monday, we (take) ___ the exam.", "will be taking", "Thời điểm cụ thể trong tương lai."),
      c("Don't call me at 8. I (have) ___ dinner then.", "will be having", "Hành động sẽ đang diễn ra lúc 8 giờ."),
      c("___ (you / use) your car tonight?", "Will you be using", "Hỏi lịch sự về kế hoạch → Will + you + be + V-ing?"),
      c("She (not/work) ___ this time next week. She'll be on holiday.", "won't be working", "won't be + V-ing."),
      c("In 2050, many people (live) ___ in smart cities.", "will be living", "Tình huống đang diễn ra tại thời điểm tương lai."),
      c("At midnight, they (fly) ___ over the Pacific.", "will be flying", "At + giờ tương lai → will be + V-ing."),
      c("When you arrive, I (wait) ___ for you at the gate.", "will be waiting", "Mệnh đề when dùng hiện tại đơn; mệnh đề chính dùng will be + V-ing."),
      c("What ___ (you / do) at 7 p.m. tomorrow?", "will you be doing", "Wh- + will + you + be + V-ing?"),
      c("The team (play) ___ in the final this time next month.", "will be playing", "this time next month → will be + V-ing.")
    ],
    translationDrill: [
      t("Giờ này ngày mai, tôi sẽ đang nằm trên bãi biển.", ["This time tomorrow, I will be lying on the beach.", "At this time tomorrow, I will be lying on the beach.", "I will be lying on the beach this time tomorrow."], "will be + lying (lie → lying)."),
      t("Lúc 9 giờ sáng thứ Hai tới, chúng tôi sẽ đang làm bài thi.", ["At 9 a.m. next Monday, we will be taking the exam.", "At 9 a.m. next Monday, we will be doing the exam.", "At 9 a.m. next Monday, we will be taking the test.", "At 9 a.m. next Monday, we will be doing the test.", "At 9 a.m. next Monday, we will be sitting the exam."], "At + giờ + next Monday → will be + V-ing."),
      t("Đừng gọi cho tôi lúc 8 giờ, lúc đó tôi sẽ đang ăn tối.", ["Don't call me at 8. I will be having dinner then.", "Don't call me at 8, I will be having dinner then.", "Don't call me at 8 o'clock. I will be having dinner then.", "Don't call me at 8. I will be eating dinner then.", "Don't call me at 8. I will be having dinner at that time."], "Lúc đó sẽ đang ... → will be + V-ing."),
      t("Tối nay bạn có dùng xe không? (hỏi lịch sự)", ["Will you be using your car tonight?", "Will you be using the car tonight?", "Will you be using your car this evening?", "Will you be using the car this evening?"], "Will you be + V-ing? là cách hỏi lịch sự về kế hoạch."),
      t("Giờ này tuần sau cô ấy sẽ không làm việc.", ["She won't be working this time next week.", "This time next week, she won't be working.", "She won't be working at this time next week."], "won't be + V-ing."),
      t("Khi bạn đến, tôi sẽ đang đợi ở cổng.", ["When you arrive, I will be waiting at the gate.", "I will be waiting at the gate when you arrive.", "When you come, I will be waiting at the gate.", "When you get there, I will be waiting at the gate."], "When + hiện tại đơn, S + will be + V-ing."),
      t("Lúc nửa đêm, họ sẽ đang bay qua Thái Bình Dương.", ["At midnight, they will be flying over the Pacific.", "At midnight, they will be flying over the Pacific Ocean.", "They will be flying over the Pacific at midnight.", "They will be flying over the Pacific Ocean at midnight."], "At midnight → will be flying."),
      t("Bạn sẽ đang làm gì vào 7 giờ tối mai?", ["What will you be doing at 7 p.m. tomorrow?", "What will you be doing at 7 o'clock tomorrow evening?", "What will you be doing at 7 tomorrow evening?", "What will you be doing at 7 p.m. tomorrow evening?"], "What + will + you + be + doing?"),
      t("Vào năm 2050, nhiều người sẽ đang làm việc từ xa.", ["In 2050, many people will be working remotely.", "In 2050, a lot of people will be working remotely.", "In 2050, many people will be working from home."], "In + năm tương lai → will be + V-ing."),
      t("Giờ này tháng sau, đội tuyển sẽ đang thi đấu trận chung kết.", ["This time next month, the team will be playing in the final.", "This time next month, the team will be playing the final.", "The team will be playing in the final this time next month."], "This time next month → will be playing.")
    ]
  },

  "future-perfect": {
    videos: [video("jvKt40Zf0QQ", "[English Tenses] FUTURE PERFECT - Thì Tương lai hoàn thành", "5:01")],
    conjugationDrill: [
      c("By next June, I (graduate) ___ from university.", "will have graduated", "By + mốc tương lai → will have + V3."),
      c("By the time you arrive, we (finish) ___ dinner.", "will have finished", "By the time + hiện tại đơn → will have + V3."),
      c("She (write) ___ three books by the end of this year.", "will have written", "write → written."),
      c("By 2030, the city (complete) ___ the new metro line.", "will have completed", "will have + V3."),
      c("___ (you / finish) the report by Friday?", "Will you have finished", "Will + S + have + V3?"),
      c("They (not/arrive) ___ by 6 p.m.", "won't have arrived", "won't have + V3."),
      c("By the end of the month, I (save) ___ 5 million dong.", "will have saved", "save → saved."),
      c("Next year, he (work) ___ here for ten years.", "will have worked", "Tính đến một mốc tương lai, đã được bao lâu."),
      c("By tomorrow morning, the snow (melt) ___.", "will have melted", "will have + V3."),
      c("By the time she is 30, she (visit) ___ 20 countries.", "will have visited", "By the time + hiện tại đơn → will have + V3.")
    ],
    translationDrill: [
      t("Đến tháng 6 năm sau, tôi sẽ tốt nghiệp đại học.", ["By next June, I will have graduated from university.", "By June next year, I will have graduated from university.", "By next June, I will have graduated from college.", "By June next year, I will have graduated from college."], "By + mốc tương lai → will have + V3."),
      t("Khi bạn đến thì chúng tôi đã ăn tối xong rồi.", ["By the time you arrive, we will have finished dinner.", "By the time you come, we will have finished dinner.", "By the time you arrive, we will have had dinner.", "By the time you arrive, we will have eaten dinner.", "By the time you get here, we will have finished dinner."], "\"Khi bạn đến\" (mốc tương lai) → By the time + hiện tại đơn."),
      t("Đến cuối năm nay, cô ấy sẽ viết xong ba cuốn sách.", ["By the end of this year, she will have written three books.", "She will have written three books by the end of this year.", "By the end of the year, she will have written three books.", "By the end of this year, she will have finished writing three books."], "will have written."),
      t("Bạn sẽ hoàn thành báo cáo trước thứ Sáu chứ?", ["Will you have finished the report by Friday?", "Will you have completed the report by Friday?", "Will you have finished your report by Friday?", "Will you have completed your report by Friday?"], "\"trước + mốc\" thường dịch là by + mốc."),
      t("Đến 6 giờ tối họ sẽ vẫn chưa tới nơi.", ["They won't have arrived by 6 p.m.", "They won't have arrived by 6 o'clock.", "They won't have arrived by 6 o'clock in the evening.", "By 6 p.m., they won't have arrived."], "won't have + V3 + by."),
      t("Đến cuối tháng, tôi sẽ tiết kiệm được 5 triệu đồng.", ["By the end of the month, I will have saved 5 million dong.", "By the end of the month, I will have saved 5 million VND.", "I will have saved 5 million dong by the end of the month."], "will have saved."),
      t("Đến năm 2030, thành phố sẽ hoàn thành tuyến metro.", ["By 2030, the city will have completed the metro line.", "By 2030, the city will have finished the metro line.", "By 2030, the city will have completed the subway line.", "By 2030, the city will have completed the metro."], "By + năm tương lai (Task 1 dự báo) → will have + V3."),
      t("Đến sáng mai, tuyết sẽ tan hết.", ["By tomorrow morning, the snow will have melted.", "By tomorrow morning, all the snow will have melted.", "The snow will have melted by tomorrow morning.", "By tomorrow morning, the snow will have completely melted."], "will have melted."),
      t("Đến năm 30 tuổi, cô ấy sẽ đã đi được 20 quốc gia.", ["By the time she is 30, she will have visited 20 countries.", "By the age of 30, she will have visited 20 countries.", "By the time she is 30, she will have been to 20 countries.", "By the age of 30, she will have been to 20 countries.", "By the time she is 30, she will have travelled to 20 countries.", "By the time she is 30, she will have traveled to 20 countries."], "By the time she is 30 / By the age of 30."),
      t("Đến năm sau, anh ấy sẽ làm việc ở đây được 10 năm.", ["By next year, he will have worked here for 10 years.", "By next year, he will have been working here for 10 years.", "Next year, he will have worked here for 10 years."], "will have worked + for + khoảng thời gian.")
    ]
  },

  "be-going-to": {
    videos: [
      video("smJOTiUPJW0", "[English Tenses] NEAR FUTURE - Thì Tương lai gần", "5:43"),
      video("mJA71nKVR7Q", "Các thì động từ thể hiện ý tương lai dành cho học sinh tiểu học", "1:43", "Bonus: phân biệt các cách nói về tương lai")
    ],
    conjugationDrill: [
      c("Look at those dark clouds! It (rain) ___.", "is going to rain", "Dự đoán có căn cứ (mây đen) → be going to."),
      c("I (buy) ___ a new laptop next week. I've saved enough money.", "am going to buy", "Dự định đã có từ trước → be going to."),
      c("They (not/sell) ___ their house.", "aren't going to sell", "are not going to + V."),
      c("___ (you / study) abroad next year?", "Are you going to study", "Are + you + going to + V?"),
      c("Be careful! You (fall) ___.", "are going to fall", "Dấu hiệu rõ ràng ngay trước mắt → be going to."),
      c("She (have) ___ a baby in May.", "is going to have", "Sự việc chắc chắn có căn cứ."),
      c("We (visit) ___ our grandparents this weekend.", "are going to visit", "Kế hoạch đã định."),
      c("What ___ (he / do) after graduation?", "is he going to do", "Wh- + is + he + going to + V?"),
      c("The team is playing badly. They (lose) ___ the match.", "are going to lose", "Dự đoán dựa trên tình hình hiện tại."),
      c("I (not/eat) ___ fast food any more.", "am not going to eat", "Quyết tâm đã đưa ra từ trước → am not going to.")
    ],
    translationDrill: [
      t("Nhìn những đám mây đen kia kìa! Trời sắp mưa.", ["Look at those dark clouds! It is going to rain.", "Look at those black clouds! It is going to rain.", "Look at the dark clouds! It is going to rain."], "Có căn cứ trước mắt → It is going to rain."),
      t("Tôi định mua một chiếc laptop mới vào tuần tới.", ["I am going to buy a new laptop next week.", "Next week, I am going to buy a new laptop."], "\"định\" = be going to."),
      t("Họ sẽ không bán ngôi nhà của họ (đã quyết định).", ["They are not going to sell their house."], "are not going to + V."),
      t("Bạn có định đi du học vào năm sau không?", ["Are you going to study abroad next year?"], "Are + you + going to + V?"),
      t("Cẩn thận! Bạn sắp ngã kìa.", ["Be careful! You are going to fall.", "Careful! You are going to fall.", "Watch out! You are going to fall."], "Dấu hiệu ngay trước mắt → be going to."),
      t("Cô ấy sắp sinh em bé vào tháng Năm.", ["She is going to have a baby in May."], "have a baby = sinh em bé."),
      t("Cuối tuần này chúng tôi định về thăm ông bà.", ["We are going to visit our grandparents this weekend.", "This weekend, we are going to visit our grandparents.", "We are going to visit our grandparents at the weekend.", "We are going to see our grandparents this weekend."], "Kế hoạch đã định → are going to visit."),
      t("Anh ấy định làm gì sau khi tốt nghiệp?", ["What is he going to do after graduation?", "What is he going to do after he graduates?", "What is he going to do after graduating?"], "What + is + he + going to + do?"),
      t("Đội đang chơi rất tệ. Họ sắp thua rồi.", ["The team is playing very badly. They are going to lose.", "The team is playing very badly. They are going to lose the match.", "The team are playing very badly. They are going to lose.", "The team is playing really badly. They are going to lose."], "Dự đoán dựa trên tình hình hiện tại."),
      t("Tôi sẽ không ăn đồ ăn nhanh nữa (đã quyết tâm).", ["I am not going to eat fast food anymore.", "I am not going to eat fast food any more."], "am not going to + V + anymore.")
    ]
  }
};
