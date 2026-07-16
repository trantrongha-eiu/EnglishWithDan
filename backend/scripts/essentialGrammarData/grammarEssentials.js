"use strict";

const { lesson } = require("./builder");

const CATEGORY = "Grammar Essentials";

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: "articles", title: "Articles", icon: "🔤", orderIndex: 28,
    overview: "Mạo từ (a/an/the) xác định danh từ được nhắc đến là cụ thể hay chung chung — một trong những điểm ngữ pháp người Việt hay sai nhất vì tiếng Việt không có mạo từ.",
    formula: [
      { label: "A/An (không xác định, đếm được số ít)", structure: "a + danh từ bắt đầu phụ âm; an + danh từ bắt đầu nguyên âm", example: "a university (âm /juː/); an hour (âm câm h)." },
      { label: "The (xác định)", structure: "the + danh từ đã được nhắc/biết đến/duy nhất", example: "The sun rises in the east." },
      { label: "Zero article (không mạo từ)", structure: "∅ + danh từ số nhiều/không đếm được (nghĩa chung chung)", example: "Dogs are loyal animals. / Water is essential for life." }
    ],
    usage: [
      { title: "A/an: nhắc đến lần đầu, một trong nhiều", description: "I saw a cat in the garden." },
      { title: "The: đã nhắc trước đó, hoặc duy nhất/rõ ràng trong ngữ cảnh", description: "The cat I saw yesterday is still there." },
      { title: "Zero article: nói chung chung, không xác định", description: "Cats are independent animals." }
    ],
    signalWords: ["a/an (lần đầu nhắc đến)", "the (đã biết/duy nhất)", "no article (danh từ số nhiều/không đếm được chung chung)"],
    examples: [
      { en: "The government announced a new policy. The policy will take effect next year.", vi: "Chính phủ đã công bố một chính sách mới. Chính sách này sẽ có hiệu lực vào năm sau." },
      { en: "Education is important for everyone.", vi: "Giáo dục quan trọng với mọi người." },
      { en: "She bought an umbrella because it was raining.", vi: "Cô ấy đã mua một chiếc ô vì trời đang mưa." },
      { en: "I have a dog and a cat. The dog is friendly, but the cat is shy.", vi: "Tôi có một con chó và một con mèo. Con chó thân thiện, nhưng con mèo lại nhút nhát." },
      { en: "The Earth revolves around the Sun once every year.", vi: "Trái Đất quay quanh Mặt Trời một vòng mỗi năm." },
      { en: "He plays the guitar every weekend to relax.", vi: "Anh ấy chơi guitar mỗi cuối tuần để thư giãn." },
      { en: "We had lunch at a small restaurant near the river.", vi: "Chúng tôi đã ăn trưa tại một nhà hàng nhỏ gần con sông." },
      { en: "There is a book on the table; the book belongs to my brother.", vi: "Có một quyển sách trên bàn; quyển sách đó là của anh trai tôi." },
      { en: "Lions are dangerous animals in the wild.", vi: "Sư tử là loài động vật nguy hiểm trong tự nhiên hoang dã." },
      { en: "She is an honest woman who always tells the truth.", vi: "Cô ấy là một người phụ nữ trung thực, luôn nói sự thật." }
    ],
    mistakes: [
      { wrong: "I want to become the doctor.", right: "I want to become a doctor.", note: "Nghề nghiệp chung chung (chưa xác định cụ thể) dùng \"a/an\", không dùng \"the\"." },
      { wrong: "The money is not everything.", right: "Money is not everything.", note: "Danh từ không đếm được khi nói chung chung không cần mạo từ \"the\"." },
      { wrong: "I saw an unicorn in my dream.", right: "I saw a unicorn in my dream.", note: "\"Unicorn\" bắt đầu bằng âm /j/ (đọc như \"yunicorn\") nên dùng \"a\", quy tắc dựa vào ÂM chứ không phải chữ cái." },
      { wrong: "She is best student in the class.", right: "She is the best student in the class.", note: "Tính từ so sánh nhất (superlative) luôn cần \"the\" đứng trước." },
      { wrong: "I go to the school by bus every day.", right: "I go to school by bus every day.", note: "Khi nói về mục đích quen thuộc của địa điểm (đi học), không dùng \"the\" trước \"school\"." },
      { wrong: "He is an university student.", right: "He is a university student.", note: "\"University\" bắt đầu bằng âm /juː/ (phụ âm), nên dùng \"a\", không phải \"an\"." }
    ],
    tips: [
      "Quy tắc cốt lõi: nếu người nghe/đọc đã biết bạn đang nói về \"cái gì cụ thể\" thì dùng \"the\"; nếu chỉ đang giới thiệu ý tưởng/khái niệm chung thì bỏ mạo từ hoặc dùng a/an.",
      "Task 2 essay thường mắc lỗi thừa \"the\" trước danh từ số nhiều chung chung (VD: \"the students nowadays\" sai, nên là \"students nowadays\")."
    ],
    comparison: {
      title: "A/An vs The vs Zero Article",
      headers: ["A/An", "The", "Zero Article"],
      rows: [["Không xác định, lần đầu nhắc", "Xác định, đã biết/duy nhất", "Chung chung, khái quát"], ["a book", "the book (I mentioned)", "Books are useful."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ moon orbits ___ Earth.\"", options: ["The / the", "A / an", "∅ / ∅", "An / the"], answerIndex: 0, explanation: "Cả \"moon\" và \"Earth\" là những vật thể duy nhất, đã được xác định → dùng \"the\" cho cả hai." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["I need an new phone.", "I need a new phone.", "I need the new phone I want.", "I need new phone."], answerIndex: 1, explanation: "\"New\" bắt đầu bằng phụ âm /n/ nên dùng \"a\", không phải \"an\"." },
      { type: "fill_blank", question: "Điền mạo từ thích hợp (a/an/the/∅) vào hai chỗ trống: \"She works as ___ architect in ___ city center.\"", answer: "an; the", explanation: "\"Architect\" bắt đầu bằng nguyên âm → \"an\"; \"city center\" đã xác định cụ thể trong ngữ cảnh → \"the\"." },
      { type: "fill_blank", question: "Điền mạo từ thích hợp (a/an/the/∅): \"___ Vietnamese people are known for their hospitality.\"", answer: "∅ (không mạo từ)", explanation: "Nói chung chung về cả một dân tộc ở dạng số nhiều thì không cần mạo từ." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I want to be the teacher when I grow up.\"", answer: "I want to be a teacher when I grow up.", explanation: "Nghề nghiệp nói chung chung, chưa xác định cụ thể → dùng \"a\", không dùng \"the\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He bought an new car last week.\"", answer: "He bought a new car last week.", explanation: "\"New\" bắt đầu bằng phụ âm → dùng \"a\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy là một y tá làm việc tại một bệnh viện lớn.\"", answer: "She is a nurse who works at a large hospital.", explanation: "Nghề nghiệp và danh từ đếm được số ít, chưa xác định cụ thể → dùng \"a\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Mặt trăng đang chiếu sáng bầu trời đêm nay.\"", answer: "The moon is shining in the sky tonight.", explanation: "\"Moon\" và \"sky\" là vật thể duy nhất/đã xác định → dùng \"the\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"A friend of mine recommended this restaurant to me.\"", answer: "Một người bạn của tôi đã giới thiệu nhà hàng này cho tôi.", explanation: "\"A friend\" — một trong nhiều người bạn, chưa xác định cụ thể là ai." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Water is essential for all living things.\"", answer: "Nước là thiết yếu đối với mọi sinh vật sống.", explanation: "Danh từ không đếm được nói chung chung → không dùng mạo từ." },
      { type: "sentence_transformation", question: "Điền mạo từ đúng vào hai chỗ trống: \"I saw ___ owl in the garden last night. ___ owl was sitting on a branch.\"", answer: "I saw an owl in the garden last night. The owl was sitting on a branch.", explanation: "Lần đầu nhắc đến dùng \"an\" (owl bắt đầu bằng nguyên âm); lần thứ hai đã xác định → dùng \"the\"." },
      { type: "sentence_transformation", question: "Viết lại câu sau, thêm mạo từ còn thiếu nếu cần: \"Sun rises in east and sets in west.\"", answer: "The sun rises in the east and sets in the west.", explanation: "Các phương hướng và thiên thể duy nhất luôn dùng \"the\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I have interesting idea for the project.\"", answer: "I have an interesting idea for the project.", explanation: "\"Interesting\" bắt đầu bằng nguyên âm → cần mạo từ \"an\" trước danh từ số ít đếm được." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng (câu đang nói chung chung về loài vật): \"The dogs are loyal animals, and the cats are independent animals.\"", answer: "Dogs are loyal animals, and cats are independent animals.", explanation: "Khi nói khái quát về cả một loài, không dùng \"the\" trước danh từ số nhiều." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"My brother is studying to become a engineer.\"", answer: "Lỗi: \"a engineer\" → sửa thành \"an engineer\".", explanation: "\"Engineer\" bắt đầu bằng âm nguyên âm /e/ nên cần dùng \"an\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The information you gave me was very the useful.\"", answer: "Lỗi: \"very the useful\" → sửa thành \"very useful\" (bỏ \"the\").", explanation: "Không dùng \"the\" trước tính từ; \"the\" chỉ đứng trước danh từ." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền mạo từ đúng):\nA: Did you see ___ movie last night?\nB: Yes, it was about ___ astronaut who got lost in space.\nA: Wow, how did ___ story end?", answer: "the / an / the", explanation: "\"The movie\" đã xác định (bộ phim cụ thể); \"an astronaut\" lần đầu nhắc đến; \"the story\" đã xác định rõ trong ngữ cảnh." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What do you do for work?\nB: I'm ___ accountant. I work for ___ bank downtown.\nA: Oh nice, which one?", answer: "an / a", explanation: "\"Accountant\" bắt đầu bằng nguyên âm → \"an\"; \"bank\" chưa xác định cụ thể (một trong nhiều ngân hàng) → \"a\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"___ Internet has changed the way people communicate.\"", options: ["A", "An", "The", "∅ (không mạo từ)"], answerIndex: 2, explanation: "\"The Internet\" là cách dùng cố định vì đây là một thực thể duy nhất, đã được xác định." },
      { question: "Câu nào đúng?", options: ["I love a music.", "I love music.", "I love the music.", "I love an music."], answerIndex: 1, explanation: "\"Music\" là danh từ không đếm được, khi nói chung chung không dùng mạo từ." },
      { question: "Chọn đáp án đúng: \"My father works as ___ engineer.\"", options: ["a", "an", "the", "∅"], answerIndex: 1, explanation: "\"Engineer\" bắt đầu bằng nguyên âm /e/ nên dùng \"an\"." },
      { question: "Câu nào đúng?", options: ["She is a best singer in the group.", "She is the best singer in the group.", "She is best singer in the group.", "She is an best singer in the group."], answerIndex: 1, explanation: "Tính từ so sánh nhất (superlative) luôn cần \"the\"." },
      { question: "Chọn đáp án đúng: \"I saw ___ elephant at the zoo yesterday.\"", options: ["a", "an", "the", "∅"], answerIndex: 1, explanation: "\"Elephant\" bắt đầu bằng âm nguyên âm /e/ → dùng \"an\"." }
    ],
    summary: "Mạo từ a/an (không xác định), the (xác định), và zero article (khái quát) — chọn đúng dựa vào việc danh từ đã được xác định hay chỉ nói chung chung."
  }),

  lesson({
    category: CATEGORY, lessonKey: "countable-uncountable", title: "Countable vs Uncountable", icon: "🔢", orderIndex: 29,
    overview: "Phân biệt danh từ đếm được (có số nhiều) và danh từ không đếm được (chỉ chất liệu/khái niệm trừu tượng, không có số nhiều) — ảnh hưởng trực tiếp đến việc chọn much/many và số ít/số nhiều của động từ.",
    formula: [
      { label: "Đếm được", structure: "a/an + danh từ số ít; many/a few/several + danh từ số nhiều", example: "many students, a few chairs, several problems." },
      { label: "Không đếm được", structure: "much/a little/some + danh từ không đếm được (luôn dạng số ít)", example: "much information, a little advice, some furniture." }
    ],
    usage: [
      { title: "Dùng many/few với danh từ đếm được số nhiều", description: "There aren't many opportunities in this field." },
      { title: "Dùng much/little với danh từ không đếm được", description: "There isn't much evidence to support this claim." },
      { title: "Dùng \"a piece of/a pair of...\" để đếm danh từ không đếm được", description: "She gave me a piece of advice." }
    ],
    signalWords: ["many/few/a number of + đếm được", "much/little/a great deal of + không đếm được", "some/any + cả hai loại"],
    examples: [
      { en: "The research provides a great deal of information about climate change.", vi: "Nghiên cứu cung cấp rất nhiều thông tin về biến đổi khí hậu." },
      { en: "There are many pieces of furniture in the room, but not much space.", vi: "Có nhiều đồ nội thất trong phòng, nhưng không nhiều không gian." },
      { en: "Few people have access to this kind of equipment.", vi: "Rất ít người có được loại thiết bị này." },
      { en: "I need some advice on how to prepare for the interview.", vi: "Tôi cần một vài lời khuyên về cách chuẩn bị cho buổi phỏng vấn." },
      { en: "How much money do you have left this month?", vi: "Bạn còn lại bao nhiêu tiền trong tháng này?" },
      { en: "There are a few chairs left in the storage room.", vi: "Còn một vài chiếc ghế trong phòng kho." },
      { en: "She doesn't have much experience in marketing.", vi: "Cô ấy không có nhiều kinh nghiệm trong lĩnh vực marketing." },
      { en: "We bought several pieces of luggage for the trip.", vi: "Chúng tôi đã mua vài chiếc vali cho chuyến đi." },
      { en: "The teacher gave us a lot of homework this week.", vi: "Giáo viên đã giao cho chúng tôi rất nhiều bài tập về nhà tuần này." },
      { en: "How many countries have you visited so far?", vi: "Bạn đã đi du lịch được bao nhiêu quốc gia rồi?" }
    ],
    mistakes: [
      { wrong: "I have many informations.", right: "I have a lot of information.", note: "\"Information\" là danh từ KHÔNG đếm được, không có dạng số nhiều \"-s\"." },
      { wrong: "There is many problems.", right: "There are many problems.", note: "\"Problems\" số nhiều cần động từ \"are\", không phải \"is\"." },
      { wrong: "I need an advice from you.", right: "I need some advice from you.", note: "\"Advice\" không đếm được, không dùng \"an\" hay số nhiều; dùng \"some/a piece of advice\"." },
      { wrong: "How much people are coming to the party?", right: "How many people are coming to the party?", note: "\"People\" là danh từ đếm được số nhiều → dùng \"how many\", không dùng \"how much\"." },
      { wrong: "She bought a new furniture for her apartment.", right: "She bought some new furniture for her apartment.", note: "\"Furniture\" không đếm được, không dùng \"a\" trực tiếp trước nó." },
      { wrong: "We don't have many money.", right: "We don't have much money.", note: "\"Money\" là danh từ không đếm được → dùng \"much\", không dùng \"many\"." }
    ],
    tips: [
      "Các danh từ không đếm được phổ biến trong IELTS Writing hay bị chia sai số nhiều: information, advice, equipment, furniture, research, evidence, knowledge.",
      "Dùng \"a great deal of/a large amount of\" thay cho \"much\" ở văn phong học thuật trang trọng hơn."
    ],
    comparison: {
      title: "Countable vs Uncountable",
      headers: ["Đếm được (Countable)", "Không đếm được (Uncountable)"],
      rows: [["many/few/several + số nhiều", "much/little/a great deal of + số ít"], ["many chairs, few ideas", "much information, little advice"]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"We need ___ chairs for the meeting room.\"", options: ["much", "a little", "several", "less"], answerIndex: 2, explanation: "\"Chairs\" là danh từ đếm được số nhiều → dùng \"several\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["This equipment are expensive.", "This equipment is expensive.", "These equipments are expensive.", "These equipment is expensive."], answerIndex: 1, explanation: "\"Equipment\" không đếm được, luôn ở dạng số ít, đi với \"is\"." },
      { type: "fill_blank", question: "Điền much/many: \"There isn't ___ traffic on this road today.\"", answer: "much", explanation: "\"Traffic\" là danh từ không đếm được." },
      { type: "fill_blank", question: "Điền much/many: \"How ___ suitcases did you bring?\"", answer: "many", explanation: "\"Suitcases\" là danh từ đếm được số nhiều." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She gave me many useful informations.\"", answer: "She gave me a lot of useful information.", explanation: "\"Information\" không đếm được, không thêm \"-s\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"There is too much cars on the street.\"", answer: "There are too many cars on the street.", explanation: "\"Cars\" đếm được số nhiều → dùng \"are\" và \"many\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi không có đủ thời gian để hoàn thành dự án.\"", answer: "We don't have enough time to finish the project.", explanation: "\"Time\" là danh từ không đếm được." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Có bao nhiêu sinh viên trong lớp của bạn?\"", answer: "How many students are there in your class?", explanation: "\"Students\" đếm được số nhiều → dùng \"how many\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The company doesn't have much cash on hand right now.\"", answer: "Công ty hiện không có nhiều tiền mặt trong tay.", explanation: "\"Cash\" là danh từ không đếm được." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"She packed a few pieces of clothing for the weekend trip.\"", answer: "Cô ấy đã đóng gói vài bộ quần áo cho chuyến đi cuối tuần.", explanation: "\"Clothing\" không đếm được, cần \"a few pieces of\" để đếm số lượng cụ thể." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"a piece of\" thay cho danh từ không đếm được: \"She gave me good advice.\"", answer: "She gave me a piece of good advice.", explanation: "\"Advice\" không đếm được → dùng \"a piece of advice\" để chỉ số lượng cụ thể." },
      { type: "sentence_transformation", question: "Viết lại câu, sửa much/many cho đúng: \"We don't have many money left.\"", answer: "We don't have much money left.", explanation: "\"Money\" không đếm được → dùng \"much\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He has many knowledges about history.\"", answer: "He has a lot of knowledge about history.", explanation: "\"Knowledge\" không đếm được, không có dạng số nhiều." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"There isn't many furnitures in this room.\"", answer: "There isn't much furniture in this room.", explanation: "\"Furniture\" không đếm được, không thêm \"-s\", dùng \"much\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"I need some equipments for the experiment.\"", answer: "Lỗi: \"equipments\" → sửa thành \"equipment\" (bỏ \"-s\").", explanation: "\"Equipment\" là danh từ không đếm được, không có dạng số nhiều." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"How much books did you buy at the store?\"", answer: "Lỗi: \"How much books\" → sửa thành \"How many books\".", explanation: "\"Books\" đếm được số nhiều → dùng \"how many\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền much/many):\nA: How ___ money do you need for the trip?\nB: I'm not sure, but I don't need ___ suitcases, just one.\nA: Okay, that sounds manageable.", answer: "much / many", explanation: "\"Money\" không đếm được → much; \"suitcases\" đếm được số nhiều → many." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Do we have enough chairs for all the guests?\nB: I think so, but we might need a little more ___ in the hall.\nA: Good point, it does feel crowded.", answer: "space", explanation: "\"Space\" là danh từ không đếm được, đi với \"a little more\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"There isn't ___ evidence to prove this theory.\"", options: ["many", "a few", "much", "several"], answerIndex: 2, explanation: "\"Evidence\" là danh từ không đếm được → dùng \"much\"." },
      { question: "Câu nào đúng?", options: ["She gave me many advices.", "She gave me a piece of advice.", "She gave me an advice.", "She gave me much advices."], answerIndex: 1, explanation: "\"Advice\" không đếm được, không có \"-s\"; dùng \"a piece of advice\" để đếm." },
      { question: "Chọn đáp án đúng: \"How ___ time do we have before the meeting?\"", options: ["many", "much", "few", "several"], answerIndex: 1, explanation: "\"Time\" không đếm được → dùng \"much\"." },
      { question: "Câu nào đúng?", options: ["There are much people here.", "There are many people here.", "There is many people here.", "There is much people here."], answerIndex: 1, explanation: "\"People\" đếm được số nhiều → dùng \"many\" và \"are\"." },
      { question: "Chọn đáp án đúng: \"I bought ___ new luggage for my trip.\"", options: ["a", "many", "a piece of", "several"], answerIndex: 2, explanation: "\"Luggage\" không đếm được → dùng \"a piece of\" để đếm số lượng." }
    ],
    summary: "Danh từ đếm được dùng many/few + số nhiều; danh từ không đếm được (information, advice, equipment...) dùng much/little và luôn ở dạng số ít."
  }),

  lesson({
    category: CATEGORY, lessonKey: "modal-verbs", title: "Modal Verbs", icon: "🧩", orderIndex: 30,
    overview: "Động từ khiếm khuyết (can, could, must, should, may, might, have to...) diễn tả khả năng, sự cho phép, nghĩa vụ, lời khuyên hoặc suy đoán — giúp bài viết/nói thể hiện sắc thái ý kiến tinh tế hơn.",
    formula: [
      { label: "Cấu trúc chung", structure: "S + modal verb + V(bare)", example: "Governments must invest more in healthcare." },
      { label: "Phủ định", structure: "S + modal + not + V(bare)", example: "People should not ignore the risks of climate change." },
      { label: "Suy đoán về quá khứ", structure: "S + modal + have + V3", example: "The policy might have failed due to poor planning." }
    ],
    usage: [
      { title: "Diễn tả khả năng/năng lực", description: "She can speak three languages." },
      { title: "Diễn tả nghĩa vụ/sự bắt buộc", description: "Drivers must wear seatbelts." },
      { title: "Đưa ra lời khuyên/đề xuất (Task 2)", description: "The government should raise awareness about recycling." },
      { title: "Suy đoán mức độ chắc chắn khác nhau", description: "This may/might/could be the cause of the problem (không chắc chắn)." }
    ],
    signalWords: ["can/could (khả năng)", "must/have to (bắt buộc)", "should/ought to (lời khuyên)", "may/might/could (suy đoán)", "needn't (không cần thiết)"],
    examples: [
      { en: "Schools should teach financial literacy to prepare students for adulthood.", vi: "Trường học nên dạy kiến thức tài chính để chuẩn bị cho học sinh bước vào tuổi trưởng thành." },
      { en: "This trend might be explained by rising living costs.", vi: "Xu hướng này có thể được giải thích bởi chi phí sinh hoạt tăng." },
      { en: "You needn't worry — the deadline has been extended.", vi: "Bạn không cần phải lo lắng — hạn chót đã được gia hạn." },
      { en: "You must submit your application before Friday.", vi: "Bạn phải nộp đơn trước thứ Sáu." },
      { en: "Could you please pass me the salt?", vi: "Bạn có thể đưa tôi lọ muối được không?" },
      { en: "It could rain later this afternoon, so bring an umbrella.", vi: "Trời có thể mưa vào chiều nay, vì vậy hãy mang theo ô." },
      { en: "Employees have to wear a uniform during working hours.", vi: "Nhân viên phải mặc đồng phục trong giờ làm việc." },
      { en: "He must have left already because his car isn't here.", vi: "Chắc hẳn anh ấy đã rời đi rồi vì xe của anh ấy không có ở đây." },
      { en: "Visitors may not enter this area without permission.", vi: "Khách tham quan không được phép vào khu vực này nếu không có sự cho phép." },
      { en: "You had better see a doctor if the pain continues.", vi: "Bạn nên đi khám bác sĩ nếu cơn đau vẫn tiếp tục." }
    ],
    mistakes: [
      { wrong: "She can to swim very well.", right: "She can swim very well.", note: "Sau động từ khiếm khuyết, động từ chính KHÔNG có \"to\" và không chia dạng khác." },
      { wrong: "He musts finish the report today.", right: "He must finish the report today.", note: "Động từ khiếm khuyết không thêm \"-s\" dù chủ ngữ là ngôi thứ 3 số ít." },
      { wrong: "You don't must smoke here.", right: "You mustn't smoke here.", note: "Phủ định của \"must\" khi cấm đoán là \"mustn't\", không phải \"don't must\"." },
      { wrong: "I must to go now.", right: "I must go now.", note: "Sau modal verb không bao giờ dùng \"to\"." },
      { wrong: "He should have finish the report yesterday.", right: "He should have finished the report yesterday.", note: "\"Should have\" theo sau bởi V3/V-ed (quá khứ phân từ), không phải V nguyên mẫu." },
      { wrong: "Maybe she can comes tomorrow.", right: "Maybe she can come tomorrow.", note: "Sau modal \"can\", động từ chính không chia, luôn giữ nguyên dạng bare." }
    ],
    tips: [
      "Dùng \"may/might/could\" (thay vì \"will\") khi đưa ra suy đoán/nguyên nhân trong Task 2 để tránh khẳng định quá chắc chắn về điều chưa được chứng minh.",
      "\"Should\" là công cụ chính để đề xuất giải pháp trong Task 2 dạng \"problem-solution\"."
    ],
    comparison: {
      title: "Must vs Have To vs Should",
      headers: ["Must/Have to", "Should/Ought to"],
      rows: [["Bắt buộc, gần như không có lựa chọn", "Lời khuyên, có thể lựa chọn"], ["You must submit the form by Friday.", "You should submit the form early."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Passengers ___ fasten their seatbelts during takeoff.\"", options: ["can", "must", "might", "would"], answerIndex: 1, explanation: "Quy định bắt buộc → dùng \"must\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["He can plays the piano.", "He can play the piano.", "He cans play the piano.", "He can to play the piano."], answerIndex: 1, explanation: "Sau modal verb, động từ chính giữ nguyên dạng bare." },
      { type: "fill_blank", question: "Điền modal verb phù hợp (lời khuyên): \"You ___ see a doctor if the symptoms get worse.\"", answer: "should", explanation: "\"Should\" dùng để đưa ra lời khuyên." },
      { type: "fill_blank", question: "Điền modal verb phù hợp (không cần thiết): \"It's just a suggestion — you ___ accept it if you don't want to.\"", answer: "needn't / don't need to", explanation: "\"Needn't\" diễn tả việc không cần thiết phải làm gì." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She must to finish her homework before dinner.\"", answer: "She must finish her homework before dinner.", explanation: "Sau \"must\" không dùng \"to\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They can swimming very fast.\"", answer: "They can swim very fast.", explanation: "Sau modal verb \"can\", động từ chính ở dạng nguyên mẫu, không phải V-ing." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Bạn không được hút thuốc trong bệnh viện.\"", answer: "You mustn't smoke in the hospital.", explanation: "Cấm đoán dùng \"mustn't\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Có lẽ anh ấy đã quên cuộc họp.\"", answer: "He might have forgotten the meeting.", explanation: "Suy đoán về quá khứ dùng \"might have + V3\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"You don't have to attend the meeting if you're busy.\"", answer: "Bạn không cần phải tham dự cuộc họp nếu bạn bận.", explanation: "\"Don't have to\" diễn tả không bắt buộc, khác với \"mustn't\" (bị cấm)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"This could be one of the biggest challenges the company has ever faced.\"", answer: "Đây có thể là một trong những thách thức lớn nhất mà công ty từng đối mặt.", explanation: "\"Could\" diễn tả khả năng." },
      { type: "sentence_transformation", question: "Viết lại câu dùng modal verb diễn tả nghĩa vụ: \"It is necessary for students to submit the assignment by Monday.\"", answer: "Students must submit the assignment by Monday.", explanation: "\"Must\" diễn tả sự bắt buộc, thay cho cấu trúc \"it is necessary for... to\"." },
      { type: "sentence_transformation", question: "Viết lại câu sang thể suy đoán quá khứ dùng modal + have + V3: \"Perhaps he missed the bus.\"", answer: "He might have missed the bus.", explanation: "Suy đoán về một sự việc đã xảy ra trong quá khứ dùng \"might have + V3\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"You must to arrive on time for the exam.\"", answer: "You must arrive on time for the exam.", explanation: "Sau modal verb không dùng \"to\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She don't must work overtime tonight.\"", answer: "She doesn't have to work overtime tonight.", explanation: "Phủ định \"không cần thiết\" cần dùng \"doesn't have to\", không phải \"don't must\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He should have arrive earlier to catch the train.\"", answer: "Lỗi: \"should have arrive\" → sửa thành \"should have arrived\".", explanation: "Sau \"should have\" cần V3 (quá khứ phân từ), không phải V nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"We musts leave now or we'll be late.\"", answer: "Lỗi: \"musts\" → sửa thành \"must\".", explanation: "Động từ khiếm khuyết không chia theo ngôi, không thêm \"-s\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền modal verb phù hợp):\nA: ___ I borrow your pen for a second?\nB: Sure, go ahead.\nA: Thanks, I ___ finish this form quickly.", answer: "Could/May / can", explanation: "\"Could/May I\" dùng để xin phép lịch sự; \"can\" diễn tả khả năng làm được việc gì." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why didn't Tom come to the party?\nB: He ___ have forgotten about it — he's been really busy lately.\nA: That's possible, I'll message him.", answer: "might/could", explanation: "Suy đoán không chắc chắn về nguyên nhân trong quá khứ dùng \"might/could have + V3\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"The results ___ have been affected by a small sample size.\"", options: ["must", "might", "should", "can"], answerIndex: 1, explanation: "\"Might have + V3\" diễn tả suy đoán về nguyên nhân trong quá khứ, không chắc chắn." },
      { question: "Câu nào đúng?", options: ["He should to apologize.", "He should apologizes.", "He should apologize.", "He shoulds apologize."], answerIndex: 2, explanation: "Sau modal verb, động từ chính giữ nguyên dạng bare, không \"to\", không chia." },
      { question: "Chọn đáp án đúng: \"You ___ wear a helmet when riding a motorbike — it's the law.\"", options: ["might", "must", "could", "would"], answerIndex: 1, explanation: "Luật bắt buộc → dùng \"must\"." },
      { question: "Câu nào đúng?", options: ["You mustn't to park here.", "You mustn't park here.", "You don't must park here.", "You not must park here."], answerIndex: 1, explanation: "\"Mustn't\" + V nguyên mẫu (không \"to\") diễn tả sự cấm đoán." },
      { question: "Chọn đáp án đúng: \"She ___ be at home now — I saw her car in the driveway.\"", options: ["must", "mustn't", "needn't", "shouldn't"], answerIndex: 0, explanation: "Suy đoán chắc chắn ở hiện tại dùng \"must\"." }
    ],
    summary: "Động từ khiếm khuyết (can, must, should, may, might...) diễn tả khả năng, nghĩa vụ, lời khuyên, hoặc suy đoán — luôn theo sau bởi V nguyên mẫu không \"to\"."
  }),

  lesson({
    category: CATEGORY, lessonKey: "passive-voice", title: "Passive Voice", icon: "🔄", orderIndex: 31,
    overview: "Thể bị động nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người/vật thực hiện hành động — rất phổ biến trong Task 1 process diagrams và văn phong học thuật trang trọng.",
    formula: [
      { label: "Công thức chung", structure: "S(đối tượng) + to be + V3 + (by + tác nhân)", example: "The bridge was built in 1990 (by engineers)." },
      { label: "Hiện tại đơn bị động", structure: "am/is/are + V3", example: "Rice is grown in this region." },
      { label: "Hiện tại hoàn thành bị động", structure: "have/has been + V3", example: "The report has been completed." }
    ],
    usage: [
      { title: "Nhấn mạnh đối tượng/kết quả, không quan tâm ai làm", description: "The new policy was announced yesterday." },
      { title: "Mô tả quy trình trong Task 1 (không có chủ thể cụ thể)", description: "The materials are heated and then cooled." },
      { title: "Văn phong học thuật/formal (Task 2)", description: "It is widely believed that education is the key to social mobility." }
    ],
    signalWords: ["by + tác nhân (nếu cần nêu)", "it is + V3 + that (it is said/believed/reported that)"],
    examples: [
      { en: "The final product is packaged and shipped to retailers.", vi: "Sản phẩm cuối cùng được đóng gói và vận chuyển đến nhà bán lẻ." },
      { en: "It is believed that renewable energy will dominate the market by 2050.", vi: "Người ta tin rằng năng lượng tái tạo sẽ thống trị thị trường vào năm 2050." },
      { en: "The bridge has been repaired since the storm.", vi: "Cây cầu đã được sửa chữa kể từ sau cơn bão." },
      { en: "This song was written by a famous composer in the 1980s.", vi: "Bài hát này được sáng tác bởi một nhà soạn nhạc nổi tiếng vào những năm 1980." },
      { en: "New employees are trained during their first week.", vi: "Nhân viên mới được đào tạo trong tuần đầu tiên." },
      { en: "The results will be announced next Monday.", vi: "Kết quả sẽ được công bố vào thứ Hai tới." },
      { en: "Millions of tourists are attracted to this city every year.", vi: "Hàng triệu du khách bị thu hút đến thành phố này mỗi năm." },
      { en: "The documents must be signed before the deadline.", vi: "Các tài liệu phải được ký trước hạn chót." },
      { en: "It is estimated that half the population will live in cities by 2030.", vi: "Người ta ước tính rằng một nửa dân số sẽ sống ở các thành phố vào năm 2030." },
      { en: "This app has been downloaded over ten million times.", vi: "Ứng dụng này đã được tải xuống hơn mười triệu lần." }
    ],
    mistakes: [
      { wrong: "The report was wrote by the team.", right: "The report was written by the team.", note: "Cần dùng V3 (written), không dùng V2 (wrote)." },
      { wrong: "The cake is baking by my mother.", right: "The cake is baked by my mother.", note: "Nhầm chủ động tiếp diễn (baking) với bị động (baked)." },
      { wrong: "The letter is sent yesterday.", right: "The letter was sent yesterday.", note: "\"Yesterday\" là mốc quá khứ xác định, cần dùng \"was\" thay vì \"is\"." },
      { wrong: "The window was broke by the storm.", right: "The window was broken by the storm.", note: "Cần dùng V3 (broken), không dùng V2 (broke)." },
      { wrong: "English speak in many countries.", right: "English is spoken in many countries.", note: "Thiếu trợ động từ \"to be\" trong cấu trúc bị động; đối tượng \"English\" chịu tác động nên cần \"is spoken\"." }
    ],
    tips: [
      "Trong Task 1 process diagram, ưu tiên thể bị động vì hành động thường không có chủ thể rõ ràng.",
      "Cấu trúc \"It is said/believed/reported/estimated that...\" rất hữu ích trong Task 2 khi trích dẫn quan điểm chung mà không cần nêu nguồn cụ thể."
    ],
    comparison: {
      title: "Active vs Passive Voice",
      headers: ["Chủ động (Active)", "Bị động (Passive)"],
      rows: [["Nhấn mạnh người/vật thực hiện hành động", "Nhấn mạnh đối tượng chịu tác động"], ["Workers built the bridge.", "The bridge was built (by workers)."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"The Eiffel Tower ___ in 1889.\"", options: ["built", "was built", "is built", "builds"], answerIndex: 1, explanation: "Sự kiện quá khứ xác định, nhấn mạnh đối tượng → bị động quá khứ đơn: was built." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["The homework must finished today.", "The homework must be finish today.", "The homework must be finished today.", "The homework must be finishing today."], answerIndex: 2, explanation: "Sau modal verb ở thể bị động: modal + be + V3." },
      { type: "fill_blank", question: "Điền dạng bị động đúng: \"This bridge ___ (build) over 50 years ago.\"", answer: "was built", explanation: "Quá khứ xác định + bị động: was + V3." },
      { type: "fill_blank", question: "Điền dạng bị động đúng: \"The new policy ___ (announce) next week.\"", answer: "will be announced", explanation: "Tương lai bị động: will be + V3." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"The cake was baking by my sister yesterday.\"", answer: "The cake was baked by my sister yesterday.", explanation: "Cần dùng bị động (was baked), không phải chủ động tiếp diễn (baking)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"The report is write by the manager every month.\"", answer: "The report is written by the manager every month.", explanation: "Cần V3 (written) sau \"is\" trong câu bị động, không dùng V nguyên mẫu." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Gạo được trồng nhiều ở đồng bằng sông Cửu Long.\"", answer: "Rice is grown widely in the Mekong Delta.", explanation: "Nhấn mạnh đối tượng \"rice\", không cần nêu ai trồng → bị động hiện tại đơn." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cây cầu đã được sửa chữa xong vào tuần trước.\"", answer: "The bridge was repaired last week.", explanation: "Quá khứ xác định ('last week') → bị động quá khứ đơn." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"It is reported that the economy has grown by 5% this year.\"", answer: "Có báo cáo cho rằng nền kinh tế đã tăng trưởng 5% trong năm nay.", explanation: "Cấu trúc \"it is reported that\" trích dẫn thông tin không nêu nguồn cụ thể." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The museum was renovated last year.\"", answer: "Bảo tàng đã được cải tạo vào năm ngoái.", explanation: "Bị động quá khứ đơn nhấn mạnh đối tượng \"museum\"." },
      { type: "sentence_transformation", question: "Chuyển sang câu bị động: \"Someone stole my bike last night.\"", answer: "My bike was stolen last night.", explanation: "Đối tượng \"my bike\" trở thành chủ ngữ; \"someone\" không cần nêu vì không quan trọng." },
      { type: "sentence_transformation", question: "Chuyển sang câu bị động: \"They are building a new hospital in this area.\"", answer: "A new hospital is being built in this area.", explanation: "Hiện tại tiếp diễn bị động: is/are being + V3." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng thể bị động: \"The application form must filled out carefully.\"", answer: "The application form must be filled out carefully.", explanation: "Thiếu \"be\" trong cấu trúc modal + be + V3." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"This medicine should taken twice a day.\"", answer: "This medicine should be taken twice a day.", explanation: "Cấu trúc bị động với modal cần \"be\" trước V3." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The invitation cards were sending to all guests.\"", answer: "Lỗi: \"were sending\" → sửa thành \"were sent\".", explanation: "Bị động quá khứ đơn cần V3 (sent), không dùng V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"It is say that honesty is the best policy.\"", answer: "Lỗi: \"is say\" → sửa thành \"is said\".", explanation: "Cấu trúc \"it is said that\" cần V3 (said) sau \"is\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (dùng thể bị động):\nA: When ___ (this building / construct)?\nB: It was constructed in 2015.", answer: "was this building constructed", explanation: "Câu hỏi bị động quá khứ đơn: Was/Were + S + V3?" },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Has your car been repaired yet?\nB: Yes, it ___ (repair) yesterday.", answer: "was repaired", explanation: "Trả lời với mốc thời gian quá khứ xác định → bị động quá khứ đơn." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"Rice ___ in many Asian countries.\"", options: ["grows", "is grown", "is growing", "grew"], answerIndex: 1, explanation: "Nhấn mạnh đối tượng \"rice\", không rõ ai trồng → bị động hiện tại đơn: is grown." },
      { question: "Câu nào đúng?", options: ["The email was sent by she.", "The email was sent by her.", "The email were sent by her.", "The email was send by her."], answerIndex: 1, explanation: "Sau \"by\" dùng đại từ tân ngữ (her); động từ chia đúng V3 (sent)." },
      { question: "Chọn đáp án đúng: \"The new stadium ___ next year.\"", options: ["will complete", "will be completed", "is completing", "completed"], answerIndex: 1, explanation: "Tương lai bị động: will be + V3." },
      { question: "Câu nào đúng?", options: ["The car is repairing now.", "The car is being repaired now.", "The car is repaired now.", "The car being repaired now."], answerIndex: 1, explanation: "Hiện tại tiếp diễn bị động: is/are being + V3." },
      { question: "Chọn đáp án đúng: \"This novel ___ into fifteen languages.\"", options: ["has translated", "has been translated", "is translate", "translated"], answerIndex: 1, explanation: "Hiện tại hoàn thành bị động: have/has been + V3." }
    ],
    summary: "Thể bị động (to be + V3) nhấn mạnh đối tượng chịu tác động — dùng nhiều trong Task 1 process và văn phong học thuật trang trọng."
  }),

  lesson({
    category: CATEGORY, lessonKey: "relative-clauses", title: "Relative Clauses", icon: "🔗", orderIndex: 32,
    overview: "Mệnh đề quan hệ dùng để bổ sung thông tin về danh từ đứng trước mà không cần tách thành câu riêng — giúp câu văn học thuật, súc tích và tránh lặp từ.",
    formula: [
      { label: "Chỉ người (chủ ngữ)", structure: "N (person) + who/that + V", example: "The scientist who discovered this won a Nobel Prize." },
      { label: "Chỉ vật (chủ ngữ/tân ngữ)", structure: "N (thing) + which/that + V / S + V", example: "The report which was published last year is now outdated." },
      { label: "Chỉ sở hữu", structure: "N + whose + N + V", example: "The company whose profits fell is restructuring." }
    ],
    usage: [
      { title: "Mệnh đề quan hệ xác định (không dùng dấu phẩy)", description: "Students who study abroad often develop better language skills." },
      { title: "Mệnh đề quan hệ không xác định (có dấu phẩy, bổ sung thông tin)", description: "Ho Chi Minh City, which is the largest city in Vietnam, attracts many tourists." },
      { title: "Lược bỏ đại từ quan hệ khi nó là tân ngữ", description: "The book (which/that) I read last week was excellent." }
    ],
    signalWords: ["who (người, chủ ngữ)", "whom (người, tân ngữ, trang trọng)", "which (vật)", "that (không dùng trong mệnh đề không xác định)", "whose (sở hữu)", "where/when"],
    examples: [
      { en: "The policy, which was introduced in 2020, has reduced emissions significantly.", vi: "Chính sách, được ban hành năm 2020, đã giảm đáng kể lượng khí thải." },
      { en: "People who exercise regularly tend to live longer.", vi: "Những người tập thể dục thường xuyên có xu hướng sống lâu hơn." },
      { en: "This is the city where I was born.", vi: "Đây là thành phố nơi tôi sinh ra." },
      { en: "The company, whose profits fell last year, is now restructuring.", vi: "Công ty, có lợi nhuận giảm vào năm ngoái, hiện đang tái cơ cấu." },
      { en: "The laptop that I bought last month has already broken down.", vi: "Chiếc laptop mà tôi mua tháng trước đã hỏng rồi." },
      { en: "This is the reason why so many students choose to study abroad.", vi: "Đây là lý do tại sao nhiều sinh viên chọn du học." },
      { en: "The scientist who won the Nobel Prize spoke at our university.", vi: "Nhà khoa học đoạt giải Nobel đã phát biểu tại trường đại học của chúng tôi." },
      { en: "The film, which received excellent reviews, broke box office records.", vi: "Bộ phim, nhận được đánh giá xuất sắc, đã phá kỷ lục phòng vé." },
      { en: "Employees whose performance is outstanding receive an annual bonus.", vi: "Nhân viên có thành tích xuất sắc sẽ nhận được tiền thưởng hàng năm." },
      { en: "The house we visited last weekend is now for sale.", vi: "Ngôi nhà mà chúng tôi ghé thăm cuối tuần trước hiện đang được rao bán." }
    ],
    mistakes: [
      { wrong: "The man which called you is my brother.", right: "The man who called you is my brother.", note: "Dùng \"who\" (không phải \"which\") cho người." },
      { wrong: "My sister, that lives in Hanoi, is a teacher.", right: "My sister, who lives in Hanoi, is a teacher.", note: "Không dùng \"that\" trong mệnh đề quan hệ KHÔNG xác định (có dấu phẩy)." },
      { wrong: "The book who I read was boring.", right: "The book that/which I read was boring.", note: "\"Book\" là vật, dùng \"that/which\", không dùng \"who\" (chỉ dùng cho người)." },
      { wrong: "This is the company which CEO resigned recently.", right: "This is the company whose CEO resigned recently.", note: "Diễn tả sở hữu (CEO của công ty) cần dùng \"whose\", không dùng \"which\"." },
      { wrong: "The place, where I visited last year, was beautiful.", right: "The place that/which I visited last year was beautiful.", note: "\"Where\" chỉ dùng khi sau nó là một mệnh đề đầy đủ (có chủ ngữ + động từ đủ nghĩa mà không cần bổ ngữ nơi chốn); ở đây \"visited\" cần tân ngữ nên dùng \"that/which\"." }
    ],
    tips: [
      "Dùng mệnh đề quan hệ không xác định (có dấu phẩy) để chèn thêm thông tin bổ sung mà không làm gián đoạn ý chính — tăng điểm Grammatical Range.",
      "Có thể lược bỏ \"who/which/that\" khi nó đóng vai trò tân ngữ trong mệnh đề, giúp câu văn tự nhiên hơn."
    ],
    comparison: {
      title: "Defining vs Non-defining Relative Clauses",
      headers: ["Xác định (Defining)", "Không xác định (Non-defining)"],
      rows: [["Không có dấu phẩy, cần thiết để xác định danh từ", "Có dấu phẩy, chỉ bổ sung thông tin"], ["The book that I bought is great.", "This book, which I bought yesterday, is great."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đại từ quan hệ đúng: \"The woman ___ car was stolen called the police.\"", options: ["who", "which", "whose", "that"], answerIndex: 2, explanation: "Diễn tả sở hữu (xe của người phụ nữ) → dùng \"whose\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["The report, that was submitted late, was rejected.", "The report, which was submitted late, was rejected.", "The report who was submitted late was rejected.", "The report whose was submitted late was rejected."], answerIndex: 1, explanation: "Mệnh đề không xác định (có dấu phẩy) dùng \"which\", không dùng \"that\"." },
      { type: "fill_blank", question: "Điền đại từ quan hệ đúng: \"The engineer ___ designed this bridge won an award.\"", answer: "who", explanation: "\"The engineer\" là người, làm chủ ngữ → who." },
      { type: "fill_blank", question: "Điền đại từ quan hệ đúng: \"This is the town ___ I grew up.\"", answer: "where", explanation: "Chỉ nơi chốn, sau đó là mệnh đề đầy đủ → where." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"The student which won the prize is my classmate.\"", answer: "The student who won the prize is my classmate.", explanation: "\"Student\" là người → dùng \"who\", không dùng \"which\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"My father, that works as a doctor, is very busy.\"", answer: "My father, who works as a doctor, is very busy.", explanation: "Mệnh đề không xác định (có dấu phẩy) không dùng \"that\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Người đàn ông đang đứng ở cửa là giám đốc mới của chúng tôi.\"", answer: "The man who is standing at the door is our new director.", explanation: "\"Man\" là người, làm chủ ngữ mệnh đề quan hệ → who." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cuốn sách mà tôi mượn từ thư viện rất thú vị.\"", answer: "The book that/which I borrowed from the library is very interesting.", explanation: "\"Book\" là vật, làm tân ngữ mệnh đề quan hệ → that/which (có thể lược bỏ)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The hotel where we stayed had a beautiful view of the sea.\"", answer: "Khách sạn nơi chúng tôi ở có tầm nhìn tuyệt đẹp ra biển.", explanation: "\"Where\" chỉ nơi chốn, dịch là \"nơi\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Singapore, which has a very efficient public transport system, is a popular travel destination.\"", answer: "Singapore, nơi có hệ thống giao thông công cộng rất hiệu quả, là một điểm đến du lịch phổ biến.", explanation: "Mệnh đề không xác định bổ sung thông tin về Singapore." },
      { type: "sentence_transformation", question: "Nối hai câu sau bằng mệnh đề quan hệ: \"I have a colleague. Her presentations are always excellent.\"", answer: "I have a colleague whose presentations are always excellent.", explanation: "Diễn tả sở hữu → dùng \"whose\"." },
      { type: "sentence_transformation", question: "Nối hai câu sau bằng mệnh đề quan hệ không xác định: \"Hanoi is the capital of Vietnam. It has a rich history.\"", answer: "Hanoi, which has a rich history, is the capital of Vietnam.", explanation: "Thông tin bổ sung về Hà Nội, không cần thiết để xác định → mệnh đề không xác định với \"which\", có dấu phẩy." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"The lawyer which represented us won the case.\"", answer: "The lawyer who represented us won the case.", explanation: "\"Lawyer\" là người → dùng \"who\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"This is the reason that he was late, which was a traffic jam.\"", answer: "The reason why he was late was a traffic jam.", explanation: "Diễn đạt lại gọn hơn, dùng \"why\" cho mệnh đề chỉ lý do." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The players who won the tournament, were given medals.\"", answer: "Lỗi: dấu phẩy trước \"were\" — bỏ dấu phẩy vì đây là mệnh đề quan hệ xác định.", explanation: "Mệnh đề quan hệ xác định (cần thiết để xác định \"players\" nào) không dùng dấu phẩy." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The company who products are eco-friendly has grown rapidly.\"", answer: "Lỗi: \"who\" → sửa thành \"whose\" (diễn tả sở hữu của công ty).", explanation: "\"Whose\" diễn tả sở hữu, không dùng \"who\" trước danh từ." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền đại từ quan hệ):\nA: Do you know the woman ___ is talking to our teacher?\nB: Yes, she's the parent ___ daughter just won a scholarship.", answer: "who / whose", explanation: "\"Woman\" là người làm chủ ngữ → who; sở hữu (con gái của phụ huynh) → whose." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Is this the restaurant ___ you told me about?\nB: Yes, it's the place ___ they serve the best pho in town.", answer: "that/which / where", explanation: "\"Restaurant\" là vật, tân ngữ mệnh đề → that/which; \"place\" chỉ nơi chốn → where." }
    ],
    quiz: [
      { question: "Chọn đại từ quan hệ đúng: \"The teacher ___ taught me English has retired.\"", options: ["which", "whose", "who", "where"], answerIndex: 2, explanation: "\"The teacher\" là người, làm chủ ngữ của mệnh đề quan hệ → who." },
      { question: "Câu nào đúng?", options: ["Hanoi, that is the capital of Vietnam, is very old.", "Hanoi, which is the capital of Vietnam, is very old.", "Hanoi, who is the capital of Vietnam, is very old.", "Hanoi, whose is the capital of Vietnam, is very old."], answerIndex: 1, explanation: "Mệnh đề không xác định về một địa danh dùng \"which\", không dùng \"that\"." },
      { question: "Chọn đại từ quan hệ đúng: \"This is the shop ___ I bought my phone.\"", options: ["who", "which", "where", "whose"], answerIndex: 2, explanation: "\"Shop\" là nơi chốn, sau đó là mệnh đề đầy đủ → where." },
      { question: "Câu nào đúng?", options: ["The manager, whose team won the award, was proud.", "The manager, who team won the award, was proud.", "The manager, which team won the award, was proud.", "The manager, whom team won the award, was proud."], answerIndex: 0, explanation: "Diễn tả sở hữu (team của manager) → whose." },
      { question: "Chọn đại từ quan hệ đúng: \"The letter ___ I received yesterday contained good news.\"", options: ["who", "that", "where", "whose"], answerIndex: 1, explanation: "\"Letter\" là vật, làm tân ngữ mệnh đề quan hệ xác định → that (có thể lược bỏ)." }
    ],
    summary: "Mệnh đề quan hệ (who/which/whose) bổ sung thông tin về danh từ — nhớ không dùng \"that\" trong mệnh đề không xác định có dấu phẩy."
  }),

  lesson({
    category: CATEGORY, lessonKey: "comparisons", title: "Comparisons", icon: "⚖️", orderIndex: 33,
    overview: "Cấu trúc so sánh (hơn, kém, bằng, so sánh nhất) là công cụ bắt buộc cho Task 1 khi so sánh số liệu giữa các đối tượng/thời điểm.",
    formula: [
      { label: "So sánh hơn (ngắn)", structure: "adj-er + than", example: "The figure for the UK was higher than that for France." },
      { label: "So sánh hơn (dài)", structure: "more + adj + than", example: "Renewable energy is more sustainable than fossil fuels." },
      { label: "So sánh nhất", structure: "the + adj-est / the most + adj", example: "China had the highest number of exports in 2020." },
      { label: "So sánh bằng", structure: "as + adj + as", example: "The two figures were almost as high as each other." }
    ],
    usage: [
      { title: "So sánh 2 đối tượng/mốc thời gian trong Task 1", description: "Sales in 2020 were significantly lower than in 2019." },
      { title: "So sánh nhiều đối tượng, chọn ra cực trị", description: "Japan recorded the largest increase among the five countries." },
      { title: "So sánh mức độ tương đương", description: "The number of male and female graduates was roughly the same." }
    ],
    signalWords: ["than", "as...as", "the same as", "compared to/with", "while/whereas"],
    examples: [
      { en: "The proportion of renewable energy was much higher in Germany than in the USA.", vi: "Tỷ lệ năng lượng tái tạo cao hơn nhiều ở Đức so với Mỹ." },
      { en: "Vietnam had the lowest unemployment rate among the countries surveyed.", vi: "Việt Nam có tỷ lệ thất nghiệp thấp nhất trong số các quốc gia được khảo sát." },
      { en: "The two charts show roughly the same trend over the period.", vi: "Hai biểu đồ cho thấy xu hướng gần như tương tự nhau trong giai đoạn này." },
      { en: "Public transport is far more convenient in Singapore than in most other cities.", vi: "Giao thông công cộng ở Singapore tiện lợi hơn nhiều so với hầu hết các thành phố khác." },
      { en: "This smartphone is slightly more expensive than last year's model.", vi: "Chiếc điện thoại này đắt hơn một chút so với mẫu năm ngoái." },
      { en: "Online shopping is becoming as popular as visiting physical stores.", vi: "Mua sắm trực tuyến đang trở nên phổ biến ngang với việc đến các cửa hàng thực tế." },
      { en: "Of all the applicants, she has the most relevant experience.", vi: "Trong số tất cả ứng viên, cô ấy có kinh nghiệm liên quan nhất." },
      { en: "The traffic in this city is worse than it was five years ago.", vi: "Giao thông ở thành phố này tệ hơn so với năm năm trước." },
      { en: "Female students performed slightly better than male students in the exam.", vi: "Sinh viên nữ làm bài thi tốt hơn một chút so với sinh viên nam." },
      { en: "This is the most effective method we have tried so far.", vi: "Đây là phương pháp hiệu quả nhất mà chúng tôi đã thử cho đến nay." }
    ],
    mistakes: [
      { wrong: "This year is more better than last year.", right: "This year is better than last year.", note: "\"Better\" đã là dạng so sánh hơn bất quy tắc của \"good\" — không thêm \"more\"." },
      { wrong: "China is the most biggest country in the chart.", right: "China is the biggest country in the chart.", note: "Tính từ ngắn (big) dùng \"-est\", không kết hợp với \"the most\" cùng lúc." },
      { wrong: "This test is more easy than the previous one.", right: "This test is easier than the previous one.", note: "\"Easy\" là tính từ ngắn (kết thúc bằng -y) → đổi y thành i rồi thêm -er: easier." },
      { wrong: "She is the most old person in the room.", right: "She is the oldest person in the room.", note: "\"Old\" là tính từ ngắn (1 âm tiết) → dùng \"-est\", không dùng \"the most\"." },
      { wrong: "My score is same as yours.", right: "My score is the same as yours.", note: "Cụm cố định \"the same as\" luôn cần \"the\" phía trước." }
    ],
    tips: [
      "Đa dạng hóa cấu trúc so sánh (higher than/significantly more than/nearly as...as) thay vì lặp \"more than\" liên tục.",
      "Ghi nhớ tính từ so sánh bất quy tắc: good→better→best; bad→worse→worst; far→further/farther→furthest/farthest."
    ],
    comparison: {
      title: "Short vs Long Adjectives in Comparison",
      headers: ["Tính từ ngắn (1-2 âm tiết)", "Tính từ dài (≥2 âm tiết)"],
      rows: [["adj-er / the adj-est", "more adj / the most adj"], ["higher, the highest", "more significant, the most significant"]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"This route is ___ than the other one.\"", options: ["more short", "shorter", "the shortest", "most short"], answerIndex: 1, explanation: "\"Short\" là tính từ ngắn → so sánh hơn: shorter." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["He is more taller than his brother.", "He is taller than his brother.", "He is the taller than his brother.", "He is tallest than his brother."], answerIndex: 1, explanation: "\"Tall\" là tính từ ngắn, chỉ cần \"-er\", không kết hợp \"more\"." },
      { type: "fill_blank", question: "Điền dạng so sánh đúng: \"This laptop is ___ (expensive) than that one.\"", answer: "more expensive", explanation: "\"Expensive\" là tính từ dài (3 âm tiết) → dùng \"more\"." },
      { type: "fill_blank", question: "Điền dạng so sánh nhất đúng: \"That was ___ (bad) experience I've ever had.\"", answer: "the worst", explanation: "\"Bad\" là tính từ bất quy tắc: bad → worse → the worst." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"This exercise is more difficult than that.\"", answer: "This exercise is more difficult than that one.", explanation: "Cần danh từ thay thế \"that one\" thay vì chỉ \"that\" để câu rõ nghĩa hơn (lưu ý phong cách học thuật)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She is the most kind person I know.\"", answer: "She is the kindest person I know.", explanation: "\"Kind\" là tính từ ngắn (1 âm tiết) → dùng \"-est\", không dùng \"the most\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Thành phố này đông dân hơn nhiều so với thành phố kia.\"", answer: "This city is much more populous than that one.", explanation: "\"Populous\" là tính từ dài → dùng \"more\"; \"much\" nhấn mạnh mức độ chênh lệch." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đây là ngày nóng nhất trong năm.\"", answer: "This is the hottest day of the year.", explanation: "\"Hot\" là tính từ ngắn, nhân đôi phụ âm cuối rồi thêm \"-est\": hottest." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The two teams performed almost as well as each other.\"", answer: "Hai đội đã thi đấu gần như ngang nhau.", explanation: "\"As...as\" diễn tả sự tương đương." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Life expectancy is significantly higher in developed countries.\"", answer: "Tuổi thọ trung bình cao hơn đáng kể ở các nước phát triển.", explanation: "\"Significantly higher\" nhấn mạnh mức độ chênh lệch lớn." },
      { type: "sentence_transformation", question: "Viết lại câu dùng so sánh nhất: \"No other student in the class is as tall as Minh.\"", answer: "Minh is the tallest student in the class.", explanation: "Chuyển từ cấu trúc phủ định so sánh sang so sánh nhất trực tiếp." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"as...as\": \"This bag is cheaper than that one.\" (diễn đạt ý ngược lại - chúng không rẻ bằng nhau)", answer: "That bag is not as cheap as this one.", explanation: "Cấu trúc phủ định \"not as...as\" diễn tả sự không tương đương." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"This is the most easiest question on the test.\"", answer: "This is the easiest question on the test.", explanation: "\"Easy\" là tính từ ngắn, chỉ cần \"-est\", không kết hợp \"the most\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Today is more hot than yesterday.\"", answer: "Today is hotter than yesterday.", explanation: "\"Hot\" là tính từ ngắn → dùng \"-er\", không dùng \"more\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"This is the most strangest story I've ever heard.\"", answer: "Lỗi: \"the most strangest\" → sửa thành \"the strangest\".", explanation: "Không kết hợp \"the most\" với tính từ đã có \"-est\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Her performance was gooder than mine.\"", answer: "Lỗi: \"gooder\" → sửa thành \"better\".", explanation: "\"Good\" là tính từ bất quy tắc: good → better, không thêm \"-er\" trực tiếp." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (so sánh hơn):\nA: Which phone should I buy, this one or that one?\nB: This one is ___ (good) — it has better reviews.", answer: "better", explanation: "\"Good\" là tính từ bất quy tắc: good → better." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: How was the exam compared to last year's?\nB: It was ___ (difficult) than last year's, to be honest.", answer: "more difficult", explanation: "\"Difficult\" là tính từ dài → dùng \"more\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"The figure for Vietnam was ___ than the figure for Thailand.\"", options: ["more high", "higher", "most high", "the highest"], answerIndex: 1, explanation: "\"High\" là tính từ ngắn → so sánh hơn: higher than." },
      { question: "Câu nào đúng?", options: ["This is the more interesting book I've read.", "This is the most interesting book I've read.", "This is the interestingest book I've read.", "This is more interesting book I've read."], answerIndex: 1, explanation: "\"Interesting\" là tính từ dài → so sánh nhất: the most interesting." },
      { question: "Chọn đáp án đúng: \"Their new product is ___ than their previous one.\"", options: ["more innovative", "innovativer", "the most innovative", "innovativest"], answerIndex: 0, explanation: "\"Innovative\" là tính từ dài → dùng \"more...than\"." },
      { question: "Câu nào đúng?", options: ["This road is as busy than that one.", "This road is as busy as that one.", "This road is so busy as that one.", "This road is busy as that one."], answerIndex: 1, explanation: "Cấu trúc so sánh bằng chính xác là \"as + adj + as\"." },
      { question: "Chọn đáp án đúng: \"Of all the candidates, John has ___ qualifications.\"", options: ["the most impressive", "more impressive", "the impressivest", "most impressive"], answerIndex: 0, explanation: "So sánh nhất giữa nhiều đối tượng, tính từ dài → the most impressive." }
    ],
    summary: "Cấu trúc so sánh (adj-er/more...than, the adj-est/the most, as...as) giúp so sánh số liệu/đối tượng chính xác — chú ý tính từ ngắn vs dài và các dạng bất quy tắc."
  }),

  lesson({
    category: CATEGORY, lessonKey: "reported-speech", title: "Reported Speech", icon: "💬", orderIndex: 34,
    overview: "Câu tường thuật (reported speech) chuyển lời nói trực tiếp thành gián tiếp — thường dùng khi thuật lại ý kiến/nghiên cứu của người khác trong Task 2 hoặc kể chuyện trong Speaking.",
    formula: [
      { label: "Câu trần thuật (lùi thì)", structure: "S + said (that) + S + V (lùi một thì)", example: "\"I am tired,\" she said. → She said (that) she was tired." },
      { label: "Câu hỏi Yes/No", structure: "S + asked + if/whether + S + V", example: "\"Do you like tea?\" → He asked if I liked tea." },
      { label: "Câu hỏi Wh-", structure: "S + asked + Wh-word + S + V", example: "\"Where do you live?\" → She asked where I lived." }
    ],
    usage: [
      { title: "Thuật lại một phát biểu/nghiên cứu (Task 2)", description: "Researchers reported that the ice caps were melting at an alarming rate." },
      { title: "Thuật lại câu hỏi", description: "The interviewer asked whether the company planned to expand." },
      { title: "Thuật lại câu mệnh lệnh/yêu cầu", description: "The teacher told the students to submit their essays." }
    ],
    signalWords: ["said (that)", "told + O + (that)", "asked if/whether", "asked + Wh-word", "advised/ordered + O + to V"],
    examples: [
      { en: "The report stated that global temperatures had risen by 1.5 degrees.", vi: "Báo cáo nêu rằng nhiệt độ toàn cầu đã tăng 1,5 độ." },
      { en: "She asked me if I had ever visited Japan.", vi: "Cô ấy hỏi tôi liệu tôi đã từng đến Nhật Bản chưa." },
      { en: "The doctor advised him to exercise more regularly.", vi: "Bác sĩ khuyên anh ấy nên tập thể dục thường xuyên hơn." },
      { en: "He said that he would finish the project by Friday.", vi: "Anh ấy nói rằng anh ấy sẽ hoàn thành dự án trước thứ Sáu." },
      { en: "The manager told the staff to arrive earlier next time.", vi: "Người quản lý bảo nhân viên đến sớm hơn vào lần sau." },
      { en: "She asked whether the flight had been delayed.", vi: "Cô ấy hỏi liệu chuyến bay có bị hoãn không." },
      { en: "Experts have suggested that remote work increases productivity.", vi: "Các chuyên gia đã cho rằng làm việc từ xa làm tăng năng suất." },
      { en: "He admitted that he had made a mistake.", vi: "Anh ấy thừa nhận rằng anh ấy đã mắc lỗi." },
      { en: "The teacher asked why the students were late.", vi: "Giáo viên hỏi tại sao học sinh đến muộn." },
      { en: "They announced that the event would be postponed.", vi: "Họ thông báo rằng sự kiện sẽ bị hoãn lại." }
    ],
    mistakes: [
      { wrong: "She said me that she was busy.", right: "She told me that she was busy.", note: "\"Say\" không đi trực tiếp với tân ngữ chỉ người — dùng \"tell + O\" khi cần nêu người nghe." },
      { wrong: "He asked did I like tea.", right: "He asked if I liked tea.", note: "Trong câu hỏi tường thuật, không đảo ngữ trợ động từ — dùng \"if/whether\"." },
      { wrong: "She asked me what did I want.", right: "She asked me what I wanted.", note: "Câu hỏi Wh- tường thuật giữ trật tự từ như câu khẳng định, không đảo ngữ trợ động từ \"did\"." },
      { wrong: "He told that he was tired.", right: "He said that he was tired. / He told me that he was tired.", note: "\"Tell\" luôn cần một tân ngữ chỉ người theo sau (told + somebody); nếu không nêu người nghe, dùng \"say\"." },
      { wrong: "The teacher said to us finish the homework.", right: "The teacher told us to finish the homework.", note: "Câu mệnh lệnh tường thuật dùng \"tell/order/ask + O + to V\", không dùng \"say + to V\"." }
    ],
    tips: [
      "Khi thuật lại các sự thật KHÔNG đổi (chân lý khoa học), có thể giữ nguyên thì hiện tại thay vì lùi thì.",
      "Reported speech giúp Task 2 trích dẫn ý kiến chuyên gia/nghiên cứu một cách học thuật: \"Studies have shown that...\", \"Experts have suggested that...\"."
    ],
    comparison: {
      title: "Direct vs Reported Speech",
      headers: ["Trực tiếp (Direct)", "Gián tiếp (Reported)"],
      rows: [["Giữ nguyên thì, có dấu ngoặc kép", "Lùi một thì, không có dấu ngoặc kép"], ["\"I am busy,\" she said.", "She said (that) she was busy."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"I am tired,\" she said. → She said that she ___ tired.", options: ["is", "was", "has been", "will be"], answerIndex: 1, explanation: "Câu trần thuật lùi một thì: is → was." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["He asked me where do I work.", "He asked me where I worked.", "He asked me where did I work.", "He asked me where I work."], answerIndex: 1, explanation: "Câu hỏi Wh- tường thuật không đảo ngữ, và động từ lùi thì: worked." },
      { type: "fill_blank", question: "Chuyển sang câu tường thuật: \"I can help you,\" he said. → He said that he ___ help me.", answer: "could", explanation: "\"Can\" lùi thành \"could\" trong câu tường thuật." },
      { type: "fill_blank", question: "Chuyển sang câu tường thuật: \"Do you like coffee?\" she asked. → She asked ___ I liked coffee.", answer: "if/whether", explanation: "Câu hỏi Yes/No tường thuật dùng \"if/whether\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She told that she was leaving.\"", answer: "She said that she was leaving.", explanation: "\"Tell\" cần tân ngữ chỉ người; nếu không có, dùng \"say\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He asked what was I doing.\"", answer: "He asked what I was doing.", explanation: "Không đảo ngữ trong câu hỏi tường thuật; giữ trật tự chủ ngữ + động từ." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy nói rằng cô ấy sẽ không tham dự cuộc họp.\"", answer: "She said that she would not attend the meeting.", explanation: "\"Will not\" lùi thành \"would not\" trong câu tường thuật." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Anh ấy hỏi tôi đã sống ở đó bao lâu rồi.\"", answer: "He asked me how long I had lived there.", explanation: "Câu hỏi Wh- tường thuật, thì hiện tại hoàn thành lùi thành quá khứ hoàn thành." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The manager announced that the company would open a new branch.\"", answer: "Người quản lý thông báo rằng công ty sẽ mở một chi nhánh mới.", explanation: "\"Would\" là dạng lùi thì của \"will\" trong câu tường thuật." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"She asked if I had finished my homework.\"", answer: "Cô ấy hỏi liệu tôi đã hoàn thành bài tập về nhà chưa.", explanation: "Câu hỏi Yes/No tường thuật dùng \"if\"." },
      { type: "sentence_transformation", question: "Chuyển sang câu tường thuật: \"Close the door,\" the teacher said to the student.", answer: "The teacher told the student to close the door.", explanation: "Câu mệnh lệnh tường thuật: tell + O + to V." },
      { type: "sentence_transformation", question: "Chuyển sang câu tường thuật: \"Don't touch that,\" she said to the child.", answer: "She told the child not to touch that.", explanation: "Câu mệnh lệnh phủ định tường thuật: tell + O + not to V." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He said me he would come.\"", answer: "He told me he would come.", explanation: "\"Say\" không dùng trực tiếp với tân ngữ chỉ người; cần \"tell\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She asked that I was happy.\"", answer: "She asked if I was happy.", explanation: "Câu hỏi Yes/No tường thuật cần \"if/whether\", không dùng \"that\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He asked me did I want to leave.\"", answer: "Lỗi: \"did I want\" → sửa thành \"I wanted\" (bỏ đảo ngữ).", explanation: "Câu hỏi tường thuật không đảo ngữ trợ động từ." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She said to me that she was hungry.\"", answer: "Lỗi: \"said to me\" → sửa thành \"told me\" (hoặc bỏ \"to me\", giữ \"said that\").", explanation: "\"Say to somebody\" không phải cấu trúc chuẩn khi tường thuật; dùng \"tell somebody\" hoặc chỉ \"say that\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (chuyển sang câu tường thuật):\nA: What did the doctor say?\nB: He said that I ___ (need) to rest for a week.", answer: "needed", explanation: "Lùi thì: need → needed trong câu tường thuật." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What did she ask you?\nB: She asked me ___ I was coming to the party.", answer: "if/whether", explanation: "Câu hỏi Yes/No tường thuật dùng \"if/whether\"." }
    ],
    quiz: [
      { question: "Chuyển sang câu tường thuật: \"I will call you,\" he said. →", options: ["He said he will call me.", "He said he would call me.", "He said he calls me.", "He said he is calling me."], answerIndex: 1, explanation: "\"Will\" lùi thành \"would\" trong câu tường thuật." },
      { question: "Câu nào đúng?", options: ["She asked where did I live.", "She asked where I lived.", "She asked where I live.", "She asked where do I live."], answerIndex: 1, explanation: "Câu hỏi Wh- tường thuật không đảo ngữ, và động từ lùi thì: lived." },
      { question: "Chọn đáp án đúng: \"I have finished the report,\" she said. → She said that she ___ the report.", options: ["has finished", "had finished", "finished", "finishes"], answerIndex: 1, explanation: "Hiện tại hoàn thành lùi thành quá khứ hoàn thành: has finished → had finished." },
      { question: "Câu nào đúng?", options: ["He told me to not worry.", "He told me not to worry.", "He told me don't worry.", "He told to me not worry."], answerIndex: 1, explanation: "Câu mệnh lệnh phủ định tường thuật: tell + O + not to V." },
      { question: "Chọn đáp án đúng: \"Where do you live?\" she asked me. → She asked me where ___.", options: ["do I live", "did I live", "I lived", "I live"], answerIndex: 2, explanation: "Câu hỏi Wh- tường thuật không đảo ngữ và lùi thì: I lived." }
    ],
    summary: "Câu tường thuật lùi thì so với câu trực tiếp (say/tell + that/if/whether/Wh-word) — hữu ích khi trích dẫn ý kiến/nghiên cứu trong Task 2."
  }),

  lesson({
    category: CATEGORY, lessonKey: "gerunds", title: "Gerunds (V-ing as Nouns)", icon: "🌀", orderIndex: 35,
    overview: "Danh động từ (gerund, V-ing) là dạng V-ing đóng vai trò như một danh từ trong câu — làm chủ ngữ, tân ngữ, hoặc theo sau giới từ/một số động từ nhất định.",
    formula: [
      { label: "Làm chủ ngữ", structure: "V-ing + V", example: "Smoking damages your health." },
      { label: "Làm tân ngữ sau động từ", structure: "S + V (enjoy/avoid/consider...) + V-ing", example: "She enjoys reading in her free time." },
      { label: "Sau giới từ", structure: "S + V + preposition + V-ing", example: "He is interested in learning new languages." }
    ],
    usage: [
      { title: "Làm chủ ngữ của câu", description: "Recycling helps reduce environmental pollution." },
      { title: "Làm tân ngữ sau enjoy, avoid, suggest, consider, finish, mind", description: "They suggested postponing the meeting." },
      { title: "Theo sau giới từ (rất phổ biến, dễ nhầm với to-infinitive)", description: "She is good at solving problems." }
    ],
    signalWords: ["enjoy/avoid/suggest/consider/finish/mind/practise + V-ing", "be interested in/good at/worried about + V-ing", "before/after/without + V-ing"],
    examples: [
      { en: "Reducing plastic waste is essential for protecting marine life.", vi: "Giảm rác thải nhựa là điều cần thiết để bảo vệ sinh vật biển." },
      { en: "She avoided answering the question directly.", vi: "Cô ấy đã tránh trả lời câu hỏi một cách trực tiếp." },
      { en: "Before making a decision, he considered all the options.", vi: "Trước khi đưa ra quyết định, anh ấy đã cân nhắc tất cả các lựa chọn." },
      { en: "Learning a new language takes time and consistent practice.", vi: "Học một ngôn ngữ mới cần thời gian và luyện tập đều đặn." },
      { en: "He admitted making a mistake during the presentation.", vi: "Anh ấy thừa nhận đã mắc lỗi trong buổi thuyết trình." },
      { en: "Would you mind opening the window a little?", vi: "Bạn có phiền mở cửa sổ ra một chút không?" },
      { en: "Reading before bed helps me relax after a long day.", vi: "Đọc sách trước khi ngủ giúp tôi thư giãn sau một ngày dài." },
      { en: "The company is considering expanding into overseas markets.", vi: "Công ty đang cân nhắc việc mở rộng ra thị trường nước ngoài." },
      { en: "Without asking for permission, he took the last piece of cake.", vi: "Không xin phép, anh ấy đã lấy miếng bánh cuối cùng." },
      { en: "She kept complaining about the noisy neighbours.", vi: "Cô ấy cứ liên tục phàn nàn về những người hàng xóm ồn ào." }
    ],
    mistakes: [
      { wrong: "She is interested in learn new things.", right: "She is interested in learning new things.", note: "Sau giới từ (in) luôn dùng V-ing, không dùng V nguyên mẫu." },
      { wrong: "They suggested to postpone the meeting.", right: "They suggested postponing the meeting.", note: "\"Suggest\" là động từ bắt buộc theo sau bởi V-ing, không dùng to-infinitive." },
      { wrong: "He is good at play the piano.", right: "He is good at playing the piano.", note: "Sau cụm tính từ + giới từ (good at) luôn dùng V-ing." },
      { wrong: "I look forward to hear from you.", right: "I look forward to hearing from you.", note: "\"Look forward to\" — \"to\" ở đây là giới từ, theo sau là V-ing, không phải to-infinitive." },
      { wrong: "She denied to steal the money.", right: "She denied stealing the money.", note: "\"Deny\" là động từ bắt buộc theo sau bởi V-ing." }
    ],
    tips: [
      "Ghi nhớ nhóm động từ luôn theo sau bởi V-ing: enjoy, avoid, suggest, consider, finish, mind, practise, admit, deny, risk.",
      "Sau MỌI giới từ (in, on, at, about, for, without, before, after) luôn dùng V-ing, không bao giờ dùng to-infinitive."
    ],
    comparison: {
      title: "Gerund vs Infinitive (theo sau động từ)",
      headers: ["Theo sau bởi V-ing (Gerund)", "Theo sau bởi to-V (Infinitive)"],
      rows: [["enjoy, avoid, suggest, consider, finish, mind", "want, decide, plan, hope, promise, agree"], ["She enjoys swimming.", "She wants to swim."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"He avoids ___ junk food.\"", options: ["eat", "to eat", "eating", "ate"], answerIndex: 2, explanation: "\"Avoid\" là động từ bắt buộc theo sau bởi V-ing." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She is good at cook.", "She is good at to cook.", "She is good at cooking.", "She is good for cooking."], answerIndex: 2, explanation: "Sau giới từ \"at\" luôn dùng V-ing." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They practise ___ (speak) English every day.\"", answer: "speaking", explanation: "\"Practise\" theo sau bởi V-ing." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ (exercise) regularly improves overall health.\"", answer: "Exercising", explanation: "V-ing làm chủ ngữ của câu." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He risks to lose his job if he keeps arriving late.\"", answer: "He risks losing his job if he keeps arriving late.", explanation: "\"Risk\" theo sau bởi V-ing, không dùng to-infinitive." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I'm not used to work at night.\"", answer: "I'm not used to working at night.", explanation: "\"Be used to\" — \"to\" là giới từ, theo sau là V-ing." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tôi không thể tưởng tượng việc sống mà không có internet.\"", answer: "I can't imagine living without the internet.", explanation: "\"Imagine\" theo sau bởi V-ing." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy giỏi giải quyết các vấn đề phức tạp.\"", answer: "She is good at solving complex problems.", explanation: "\"Good at\" + V-ing." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Waiting for the bus in the rain is not pleasant.\"", answer: "Chờ xe buýt dưới mưa không hề dễ chịu.", explanation: "V-ing làm chủ ngữ của câu." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"He finished cleaning the house before his guests arrived.\"", answer: "Anh ấy đã dọn dẹp xong nhà trước khi khách đến.", explanation: "\"Finish\" theo sau bởi V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu dùng V-ing làm chủ ngữ: \"To swim every morning is her favourite habit.\"", answer: "Swimming every morning is her favourite habit.", explanation: "Có thể dùng gerund thay cho to-infinitive khi làm chủ ngữ, tự nhiên hơn." },
      { type: "sentence_transformation", question: "Viết lại câu sau, dùng \"mind\" + V-ing: \"Could you close the door, please?\"", answer: "Would you mind closing the door?", explanation: "\"Mind\" theo sau bởi V-ing, dùng để yêu cầu lịch sự." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She admitted to break the vase.\"", answer: "She admitted breaking the vase.", explanation: "\"Admit\" theo sau bởi V-ing, không dùng to-infinitive." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He is thinking to change his job.\"", answer: "He is thinking about changing his job.", explanation: "\"Think about\" + V-ing diễn tả đang cân nhắc điều gì." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"They enjoy to travel to new places.\"", answer: "Lỗi: \"to travel\" → sửa thành \"travelling\".", explanation: "\"Enjoy\" theo sau bởi V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She apologized for be late.\"", answer: "Lỗi: \"for be late\" → sửa thành \"for being late\".", explanation: "Sau giới từ \"for\" cần V-ing." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền V-ing):\nA: What do you enjoy doing on weekends?\nB: I really enjoy ___ (hike) in the mountains.", answer: "hiking", explanation: "\"Enjoy\" theo sau bởi V-ing." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why are you so tired?\nB: I'm not used to ___ (wake) up this early.", answer: "waking", explanation: "\"Be used to\" + V-ing (used to ở đây là tính từ + giới từ, không phải \"used to\" chỉ thói quen quá khứ)." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"He is worried about ___ the deadline.\"", options: ["miss", "to miss", "missing", "missed"], answerIndex: 2, explanation: "Sau giới từ \"about\" luôn dùng V-ing." },
      { question: "Câu nào đúng?", options: ["They finished to write the report.", "They finished writing the report.", "They finished write the report.", "They finished written the report."], answerIndex: 1, explanation: "\"Finish\" theo sau bởi V-ing (gerund)." },
      { question: "Chọn đáp án đúng: \"___ a second language opens up many career opportunities.\"", options: ["Learn", "To learn", "Learning", "Learned"], answerIndex: 2, explanation: "V-ing làm chủ ngữ của câu." },
      { question: "Câu nào đúng?", options: ["She denied to take the money.", "She denied taking the money.", "She denied take the money.", "She denied to taking the money."], answerIndex: 1, explanation: "\"Deny\" theo sau bởi V-ing." },
      { question: "Chọn đáp án đúng: \"I'm looking forward to ___ you soon.\"", options: ["see", "seeing", "saw", "have seen"], answerIndex: 1, explanation: "\"Look forward to\" — \"to\" là giới từ, theo sau là V-ing." }
    ],
    summary: "Danh động từ (V-ing) đóng vai trò danh từ — làm chủ ngữ, theo sau một số động từ cố định (enjoy, avoid, suggest...) và luôn theo sau giới từ."
  }),

  lesson({
    category: CATEGORY, lessonKey: "infinitives", title: "Infinitives (To + V)", icon: "➡️", orderIndex: 36,
    overview: "Động từ nguyên mẫu có \"to\" (to-infinitive) diễn tả mục đích, hoặc theo sau một số động từ/tính từ nhất định — cần phân biệt rõ với gerund (V-ing) để tránh lỗi ngữ pháp phổ biến.",
    formula: [
      { label: "Diễn tả mục đích", structure: "S + V + to + V(bare)", example: "People exercise to stay fit." },
      { label: "Theo sau động từ nhất định", structure: "S + V (want/decide/plan/hope...) + to + V", example: "She decided to change her career." },
      { label: "Theo sau tính từ", structure: "It + is + adj + to + V", example: "It is important to protect the environment." }
    ],
    usage: [
      { title: "Diễn tả mục đích của hành động", description: "The company invested in training to improve productivity." },
      { title: "Theo sau want, decide, plan, hope, agree, promise, refuse", description: "They agreed to sign the contract." },
      { title: "Theo sau tính từ để đưa ra nhận định/ý kiến", description: "It is essential to address climate change urgently." }
    ],
    signalWords: ["want/decide/plan/hope/agree/promise/refuse/manage + to V", "it is + adj (important/necessary/essential) + to V", "too + adj + to V / adj + enough + to V"],
    examples: [
      { en: "Governments need to invest more in public healthcare.", vi: "Các chính phủ cần đầu tư nhiều hơn vào y tế công cộng." },
      { en: "It is difficult to solve this problem without international cooperation.", vi: "Rất khó để giải quyết vấn đề này nếu không có sự hợp tác quốc tế." },
      { en: "The task was too complex to complete in one day.", vi: "Nhiệm vụ quá phức tạp để hoàn thành trong một ngày." },
      { en: "She promised to call me as soon as she arrived.", vi: "Cô ấy hứa sẽ gọi tôi ngay khi cô ấy đến nơi." },
      { en: "He is old enough to make his own decisions.", vi: "Anh ấy đã đủ lớn để tự đưa ra quyết định của mình." },
      { en: "They refused to answer any questions from the press.", vi: "Họ từ chối trả lời bất kỳ câu hỏi nào từ báo chí." },
      { en: "We need more volunteers to help organise the event.", vi: "Chúng tôi cần thêm tình nguyện viên để giúp tổ chức sự kiện." },
      { en: "It is essential to save money for emergencies.", vi: "Việc tiết kiệm tiền cho các trường hợp khẩn cấp là điều thiết yếu." },
      { en: "The company failed to meet its sales targets this quarter.", vi: "Công ty đã không đạt được mục tiêu doanh số trong quý này." },
      { en: "This exercise is too advanced for beginners to attempt.", vi: "Bài tập này quá nâng cao để người mới bắt đầu có thể thử." }
    ],
    mistakes: [
      { wrong: "She wants going abroad.", right: "She wants to go abroad.", note: "\"Want\" là động từ bắt buộc theo sau bởi to-infinitive, không dùng V-ing." },
      { wrong: "It is important protecting the environment.", right: "It is important to protect the environment.", note: "Cấu trúc \"It is + adj + to V\" cần \"to\" trước động từ." },
      { wrong: "He decided going to the party.", right: "He decided to go to the party.", note: "\"Decide\" theo sau bởi to-infinitive, không dùng V-ing." },
      { wrong: "This book is enough interesting to read twice.", right: "This book is interesting enough to read twice.", note: "\"Enough\" đứng SAU tính từ (adj + enough), không đứng trước." },
      { wrong: "The problem was too difficult solving quickly.", right: "The problem was too difficult to solve quickly.", note: "Cấu trúc \"too + adj\" cần theo sau bởi to-infinitive, không dùng V-ing." }
    ],
    tips: [
      "Ghi nhớ nhóm động từ luôn theo sau bởi to-infinitive: want, decide, plan, hope, promise, agree, refuse, manage, afford, seem, tend.",
      "Cấu trúc \"too + adj + to V\" và \"adj + enough + to V\" là điểm ngữ pháp nâng cao, dùng tốt sẽ tăng điểm Grammatical Range."
    ],
    comparison: {
      title: "To-infinitive vs Gerund (mục đích)",
      headers: ["To-infinitive (mục đích, sau động từ cố định)", "Gerund (chủ ngữ, sau giới từ, sau động từ khác)"],
      rows: [["want/decide/hope + to V", "enjoy/avoid/suggest + V-ing"], ["She hopes to travel.", "She enjoys traveling."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"They agreed ___ the contract next week.\"", options: ["signing", "sign", "to sign", "signed"], answerIndex: 2, explanation: "\"Agree\" theo sau bởi to-infinitive." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["This box is too heavy to lifting.", "This box is too heavy to lift.", "This box is too heavy lifting.", "This box is too heavy for lift."], answerIndex: 1, explanation: "Cấu trúc \"too + adj + to V\"." },
      { type: "fill_blank", question: "Điền dạng đúng: \"She hopes ___ (become) a doctor one day.\"", answer: "to become", explanation: "\"Hope\" theo sau bởi to-infinitive." },
      { type: "fill_blank", question: "Điền dạng đúng: \"He is old ___ to drive a car now.\"", answer: "enough", explanation: "Cấu trúc \"adj + enough + to V\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"We plan visiting Da Nang next month.\"", answer: "We plan to visit Da Nang next month.", explanation: "\"Plan\" theo sau bởi to-infinitive, không dùng V-ing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"It is necessary protecting our environment.\"", answer: "It is necessary to protect our environment.", explanation: "Cấu trúc \"It is + adj + to V\" cần \"to\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi cần thêm thời gian để hoàn thành dự án này.\"", answer: "We need more time to complete this project.", explanation: "\"To complete\" diễn tả mục đích." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy quá mệt để tiếp tục làm việc.\"", answer: "She is too tired to continue working.", explanation: "Cấu trúc \"too + adj + to V\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"It is important to arrive on time for the interview.\"", answer: "Việc đến đúng giờ cho buổi phỏng vấn là rất quan trọng.", explanation: "Cấu trúc \"It is + adj + to V\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"He managed to finish the marathon despite the heat.\"", answer: "Anh ấy đã cố gắng hoàn thành cuộc chạy marathon bất chấp thời tiết nóng.", explanation: "\"Manage\" theo sau bởi to-infinitive, diễn tả sự cố gắng đạt được điều gì." },
      { type: "sentence_transformation", question: "Viết lại câu dùng cấu trúc \"too...to\": \"The coffee was so hot that she couldn't drink it.\"", answer: "The coffee was too hot for her to drink.", explanation: "\"Too + adj + (for someone) + to V\" diễn tả mức độ quá mức khiến không thể làm gì." },
      { type: "sentence_transformation", question: "Viết lại câu dùng cấu trúc \"enough...to\": \"She is very experienced, so she can lead the project.\"", answer: "She is experienced enough to lead the project.", explanation: "\"Adj + enough + to V\" diễn tả đủ mức độ để làm gì." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He refused helping us with the move.\"", answer: "He refused to help us with the move.", explanation: "\"Refuse\" theo sau bởi to-infinitive." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"It's difficult finding a good job these days.\"", answer: "It's difficult to find a good job these days.", explanation: "Cấu trúc \"It is + adj + to V\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She seems being very happy today.\"", answer: "Lỗi: \"being\" → sửa thành \"to be\".", explanation: "\"Seem\" theo sau bởi to-infinitive, không dùng V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"This shirt is enough big for me.\"", answer: "Lỗi: \"enough big\" → sửa thành \"big enough\".", explanation: "\"Enough\" đứng sau tính từ, không đứng trước." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền to-infinitive):\nA: What are your plans for next year?\nB: I hope ___ (travel) around Southeast Asia.", answer: "to travel", explanation: "\"Hope\" theo sau bởi to-infinitive." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why didn't you buy the jacket?\nB: It was too expensive ___ (afford).", answer: "to afford", explanation: "Cấu trúc \"too + adj + to V\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"It is necessary ___ this issue immediately.\"", options: ["addressing", "to address", "address", "addressed"], answerIndex: 1, explanation: "Cấu trúc \"It is + adj + to V\" cần to-infinitive." },
      { question: "Câu nào đúng?", options: ["They planned visiting the museum.", "They planned to visit the museum.", "They planned visit the museum.", "They planned visited the museum."], answerIndex: 1, explanation: "\"Plan\" theo sau bởi to-infinitive." },
      { question: "Chọn đáp án đúng: \"The water was too cold ___ in.\"", options: ["swimming", "swim", "to swim", "for swim"], answerIndex: 2, explanation: "Cấu trúc \"too + adj + to V\"." },
      { question: "Câu nào đúng?", options: ["She is smart enough solving this problem.", "She is smart enough to solve this problem.", "She is enough smart to solve this problem.", "She is smart to enough solve this problem."], answerIndex: 1, explanation: "Cấu trúc đúng: adj + enough + to V." },
      { question: "Chọn đáp án đúng: \"He failed ___ his goals this year.\"", options: ["achieving", "achieve", "to achieve", "achieved"], answerIndex: 2, explanation: "\"Fail\" theo sau bởi to-infinitive." }
    ],
    summary: "Động từ nguyên mẫu có \"to\" diễn tả mục đích hoặc theo sau các động từ/tính từ cố định (want, decide, it is + adj) — phân biệt rõ với gerund."
  }),

  lesson({
    category: CATEGORY, lessonKey: "sentence-patterns", title: "Sentence Patterns", icon: "🏗️", orderIndex: 37,
    overview: "Nắm vững 3 loại câu cơ bản (đơn, ghép, phức) và cách kết hợp chúng linh hoạt là chìa khóa để đạt điểm cao ở tiêu chí Grammatical Range and Accuracy trong IELTS Writing.",
    formula: [
      { label: "Câu đơn (Simple)", structure: "S + V (+ O)", example: "The economy grew rapidly." },
      { label: "Câu ghép (Compound)", structure: "S + V, and/but/or/so + S + V", example: "The economy grew, but unemployment remained high." },
      { label: "Câu phức (Complex)", structure: "Mệnh đề chính + mệnh đề phụ (although/because/which/if...)", example: "Although the economy grew, unemployment remained high." }
    ],
    usage: [
      { title: "Câu đơn: truyền đạt một ý rõ ràng, súc tích", description: "Renewable energy is becoming more affordable." },
      { title: "Câu ghép: nối hai ý độc lập có liên quan bằng liên từ kết hợp (FANBOYS)", description: "Prices rose, so demand declined." },
      { title: "Câu phức: thể hiện quan hệ phụ thuộc (nguyên nhân, tương phản, điều kiện, quan hệ)", description: "Because prices rose, demand declined." }
    ],
    signalWords: ["and/but/or/so/for/nor/yet (FANBOYS - câu ghép)", "although/because/if/when/which/who (câu phức)"],
    examples: [
      { en: "The population is ageing rapidly, and this trend is expected to continue.", vi: "Dân số đang già hóa nhanh chóng, và xu hướng này được dự đoán sẽ tiếp tục." },
      { en: "Although renewable energy is more expensive initially, it is more sustainable in the long run.", vi: "Mặc dù năng lượng tái tạo ban đầu đắt hơn, nó bền vững hơn về lâu dài." },
      { en: "Cities that invest in public transport tend to have less traffic congestion.", vi: "Những thành phố đầu tư vào giao thông công cộng thường có ít ùn tắc hơn." },
      { en: "Technology has transformed education.", vi: "Công nghệ đã thay đổi giáo dục." },
      { en: "Prices increased sharply, so many families cut back on spending.", vi: "Giá cả tăng mạnh, vì vậy nhiều gia đình đã cắt giảm chi tiêu." },
      { en: "Because the harvest failed, food prices rose across the region.", vi: "Vì mùa màng thất bát, giá lương thực tăng khắp khu vực." },
      { en: "The company launched a new product, and sales increased immediately.", vi: "Công ty ra mắt sản phẩm mới, và doanh số tăng ngay lập tức." },
      { en: "While some people prefer working from home, others miss the office environment.", vi: "Trong khi một số người thích làm việc tại nhà, những người khác lại nhớ môi trường văn phòng." },
      { en: "The bridge, which was built in the 1960s, is now being renovated.", vi: "Cây cầu, được xây dựng vào những năm 1960, hiện đang được cải tạo." },
      { en: "She studied hard, yet she still failed the exam.", vi: "Cô ấy học chăm chỉ, nhưng vẫn trượt kỳ thi." }
    ],
    mistakes: [
      { wrong: "The economy grew, unemployment remained high.", right: "The economy grew, but unemployment remained high.", note: "Hai mệnh đề độc lập không thể chỉ nối bằng dấu phẩy (comma splice) — cần liên từ hoặc dấu chấm phẩy." },
      { wrong: "Because the price is high, that people still buy it.", right: "Because the price is high, people still buy it.", note: "Không lặp lại 2 liên từ (because...that) trong cùng một câu." },
      { wrong: "Although it rained, but we still went out.", right: "Although it rained, we still went out.", note: "Không dùng \"although\" và \"but\" cùng lúc trong một câu phức." },
      { wrong: "She studied hard she passed the exam.", right: "She studied hard, so she passed the exam. / She studied hard, and she passed the exam.", note: "Hai mệnh đề độc lập cần liên từ hoặc dấu câu phù hợp để nối, không thể đặt liền nhau." },
      { wrong: "Prices rose, and, unemployment increased.", right: "Prices rose, and unemployment increased.", note: "Không đặt dấu phẩy thừa ngay sau liên từ kết hợp (and)." }
    ],
    tips: [
      "Kết hợp linh hoạt cả 3 loại câu (đơn, ghép, phức) trong một đoạn văn Task 2 là cách hiệu quả nhất để đạt điểm cao ở \"Grammatical Range and Accuracy\".",
      "Tránh lỗi \"comma splice\" (nối 2 mệnh đề độc lập chỉ bằng dấu phẩy) — đây là lỗi bị giám khảo trừ điểm nghiêm trọng."
    ],
    comparison: {
      title: "Compound vs Complex Sentences",
      headers: ["Câu ghép (Compound)", "Câu phức (Complex)"],
      rows: [["2 mệnh đề độc lập, ngang hàng", "1 mệnh đề chính + 1 mệnh đề phụ thuộc"], ["It rained, so we stayed home.", "We stayed home because it rained."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Câu nào là câu ghép (compound sentence)?", options: ["The weather was cold.", "Because the weather was cold, we stayed in.", "The weather was cold, so we stayed in.", "The weather that was cold made us stay in."], answerIndex: 2, explanation: "Hai mệnh đề độc lập nối bằng \"so\" → câu ghép." },
      { type: "multiple_choice", question: "Câu nào đúng ngữ pháp?", options: ["Although she was tired, but she kept working.", "Although she was tired, she kept working.", "Although she was tired and she kept working.", "She was tired, although kept working."], answerIndex: 1, explanation: "Không kết hợp \"although\" với \"but\" trong cùng một câu." },
      { type: "fill_blank", question: "Điền liên từ FANBOYS phù hợp: \"He wanted to travel, ___ he couldn't afford it.\"", answer: "but", explanation: "Hai ý đối lập nối bằng \"but\"." },
      { type: "fill_blank", question: "Điền liên từ phụ thuộc phù hợp: \"___ the exam was difficult, most students passed.\"", answer: "Although", explanation: "Diễn tả sự tương phản giữa hai mệnh đề → although." },
      { type: "error_correction", question: "Sửa lỗi comma splice trong câu: \"The traffic was heavy, we arrived late.\"", answer: "The traffic was heavy, so we arrived late.", explanation: "Cần liên từ (so) để nối hai mệnh đề độc lập, không chỉ dùng dấu phẩy." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Because it was raining, so we cancelled the trip.\"", answer: "Because it was raining, we cancelled the trip.", explanation: "Không dùng \"because\" và \"so\" cùng lúc trong một câu." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng câu ghép với \"but\"): \"Anh ấy làm việc chăm chỉ, nhưng anh ấy không được thăng chức.\"", answer: "He worked hard, but he was not promoted.", explanation: "Hai mệnh đề độc lập, đối lập, nối bằng \"but\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng câu phức với \"because\"): \"Vì giá xăng tăng, chi phí vận chuyển cũng tăng theo.\"", answer: "Because fuel prices increased, transport costs rose as well.", explanation: "Mệnh đề phụ thuộc (because) + mệnh đề chính." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The city, which has a population of ten million, faces serious traffic problems.\"", answer: "Thành phố, có dân số mười triệu người, đang đối mặt với vấn đề giao thông nghiêm trọng.", explanation: "Câu phức với mệnh đề quan hệ không xác định." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Demand increased, and prices rose accordingly.\"", answer: "Nhu cầu tăng, và giá cả tăng theo tương ứng.", explanation: "Câu ghép nối bằng \"and\"." },
      { type: "sentence_transformation", question: "Kết hợp hai câu đơn thành câu phức dùng \"because\": \"Sales dropped. The company cut costs.\"", answer: "Because sales dropped, the company cut costs.", explanation: "Mệnh đề nguyên nhân (because) + mệnh đề kết quả." },
      { type: "sentence_transformation", question: "Kết hợp hai câu đơn thành câu ghép dùng \"and\": \"The government raised taxes. Public spending increased.\"", answer: "The government raised taxes, and public spending increased.", explanation: "Hai mệnh đề độc lập, liên quan, nối bằng \"and\"." },
      { type: "rewrite", question: "Viết lại câu sau để sửa lỗi comma splice: \"It was late, we decided to go home.\"", answer: "It was late, so we decided to go home.", explanation: "Thêm liên từ \"so\" để nối hai mệnh đề độc lập đúng ngữ pháp." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Although the plan was risky it succeeded.\"", answer: "Although the plan was risky, it succeeded.", explanation: "Cần dấu phẩy sau mệnh đề phụ thuộc khi nó đứng đầu câu." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Despite the rain we went out, and enjoyed the walk.\"", answer: "Lỗi: thiếu dấu phẩy sau \"the rain\" (mệnh đề mở đầu bằng \"despite\" cần dấu phẩy).", explanation: "Cụm mở đầu câu bằng giới từ/liên từ phụ thuộc cần có dấu phẩy ngăn cách với mệnh đề chính." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She likes reading she doesn't like writing.\"", answer: "Lỗi: thiếu liên từ giữa hai mệnh đề — cần thêm \"but\": \"She likes reading, but she doesn't like writing.\"", explanation: "Hai mệnh đề độc lập cần liên từ hoặc dấu câu phù hợp để nối." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền liên từ phù hợp):\nA: Why didn't you go to the concert?\nB: I wanted to go, ___ I had to work late.", answer: "but", explanation: "Hai ý đối lập nối bằng \"but\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why is the flight delayed?\nB: ___ the weather is bad, all flights have been delayed.", answer: "Because/Since/As", explanation: "Mệnh đề nguyên nhân đứng đầu câu, theo sau là dấu phẩy và mệnh đề kết quả." }
    ],
    quiz: [
      { question: "Câu nào là câu phức (complex sentence)?", options: ["The rain stopped, and the sun came out.", "Although it rained, we went out.", "It rained heavily.", "It rained, so we stayed in."], answerIndex: 1, explanation: "\"Although...\" là mệnh đề phụ thuộc kết hợp với mệnh đề chính → câu phức." },
      { question: "Câu nào mắc lỗi comma splice?", options: ["She studied hard, so she passed.", "She studied hard, she passed.", "She studied hard, and she passed.", "Because she studied hard, she passed."], answerIndex: 1, explanation: "Hai mệnh đề độc lập chỉ nối bằng dấu phẩy, thiếu liên từ → lỗi comma splice." },
      { question: "Câu nào là câu ghép đúng ngữ pháp?", options: ["He was late, he missed the train.", "He was late, so he missed the train.", "He was late so, he missed the train.", "He was late he missed the train."], answerIndex: 1, explanation: "Liên từ \"so\" nối hai mệnh đề độc lập, có dấu phẩy trước liên từ." },
      { question: "Chọn đáp án đúng để hoàn thành câu phức: \"___ the concert was cancelled, fans were disappointed.\"", options: ["So", "Because", "And", "But"], answerIndex: 1, explanation: "Mệnh đề nguyên nhân đứng đầu câu cần liên từ phụ thuộc \"because\"." },
      { question: "Câu nào đúng?", options: ["The book, that I read last month, was fascinating.", "The book, which I read last month, was fascinating.", "The book which I read last month was, fascinating.", "The book, who I read last month, was fascinating."], answerIndex: 1, explanation: "Mệnh đề quan hệ không xác định (có dấu phẩy) về vật dùng \"which\", không dùng \"that\"." }
    ],
    summary: "Kết hợp linh hoạt câu đơn, câu ghép (FANBOYS) và câu phức (although/because/which...) giúp tăng điểm Grammatical Range trong Writing."
  })
];
