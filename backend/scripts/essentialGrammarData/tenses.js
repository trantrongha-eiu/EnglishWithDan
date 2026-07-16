"use strict";

const { lesson } = require("./builder");

const CATEGORY = "Tenses";

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: "present-simple", title: "Present Simple", icon: "🔵", orderIndex: 1,
    overview: "Present Simple diễn tả thói quen, sự thật hiển nhiên, lịch trình cố định và cảm xúc/trạng thái. Đây là thì cơ bản nhất nhưng vẫn xuất hiện thường xuyên trong Task 1 (mô tả biểu đồ tĩnh) và Speaking Part 1.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + V(s/es) [I/You/We/They + V; He/She/It + V-s/es]", example: "The company exports rice to over 20 countries." },
      { label: "Phủ định (-)", structure: "S + do/does not + V(bare)", example: "This graph does not show any data for 2020." },
      { label: "Nghi vấn (?)", structure: "Do/Does + S + V(bare)?", example: "Does the chart include figures for the UK?" }
    ],
    usage: [
      { title: "Thói quen, hành động lặp lại", description: "I check my email every morning." },
      { title: "Sự thật hiển nhiên, chân lý", description: "Water boils at 100°C." },
      { title: "Lịch trình, thời gian biểu cố định", description: "The train leaves at 6 p.m. every day." },
      { title: "Miêu tả số liệu tĩnh trong Task 1", description: "The bar chart shows the number of visitors in five countries." }
    ],
    signalWords: ["always", "usually", "often", "sometimes", "rarely", "never", "every day/week/year", "generally", "in general"],
    examples: [
      { en: "The pie chart illustrates the proportion of household spending.", vi: "Biểu đồ tròn minh họa tỷ lệ chi tiêu hộ gia đình." },
      { en: "She works as an engineer.", vi: "Cô ấy làm kỹ sư." },
      { en: "The company does not offer refunds.", vi: "Công ty không hoàn tiền." },
      { en: "My brother plays football every Saturday morning.", vi: "Anh trai tôi chơi bóng đá vào mỗi sáng thứ Bảy." },
      { en: "The store opens at 8 a.m. and closes at 10 p.m.", vi: "Cửa hàng mở cửa lúc 8 giờ sáng và đóng cửa lúc 10 giờ tối." },
      { en: "Water freezes at zero degrees Celsius.", vi: "Nước đóng băng ở 0 độ C." },
      { en: "He doesn't drink coffee before bed.", vi: "Anh ấy không uống cà phê trước khi ngủ." },
      { en: "Do you usually take the bus to school?", vi: "Bạn có thường đi xe buýt đến trường không?" },
      { en: "The Earth orbits the Sun once a year.", vi: "Trái Đất quay quanh Mặt Trời một vòng mỗi năm." },
      { en: "My parents live in a small village near Hanoi.", vi: "Bố mẹ tôi sống ở một ngôi làng nhỏ gần Hà Nội." },
      { en: "This machine doesn't work properly.", vi: "Cái máy này không hoạt động đúng cách." }
    ],
    mistakes: [
      { wrong: "She work every day.", right: "She works every day.", note: "Quên thêm -s/-es cho ngôi thứ ba số ít (he/she/it)." },
      { wrong: "Does she works there?", right: "Does she work there?", note: "Sau do/does, động từ chính giữ nguyên dạng bare, không chia thêm." },
      { wrong: "He don't like spicy food.", right: "He doesn't like spicy food.", note: "Chủ ngữ số ít (he) cần dùng trợ động từ \"doesn't\", không dùng \"don't\"." },
      { wrong: "I likes chocolate very much.", right: "I like chocolate very much.", note: "Chỉ chia -s/-es cho ngôi thứ ba số ít, không chia cho \"I\"." },
      { wrong: "The shop close at 9 p.m.", right: "The shop closes at 9 p.m.", note: "\"Shop\" (it) là ngôi thứ ba số ít nên động từ phải thêm -s." },
      { wrong: "Does he goes to the gym every day?", right: "Does he go to the gym every day?", note: "Sau \"does\", động từ chính không chia, giữ nguyên dạng bare." }
    ],
    tips: [
      "Dùng Present Simple để mở đầu bài Task 1 khi miêu tả overview tổng quát (\"The chart shows...\").",
      "Trong Speaking Part 1, hầu hết câu trả lời về thói quen/sở thích nên dùng thì này."
    ],
    comparison: {
      title: "Present Simple vs Present Continuous",
      headers: ["Present Simple", "Present Continuous"],
      rows: [["Thói quen, sự thật lâu dài", "Hành động đang diễn ra ngay lúc nói"], ["I work in Hanoi.", "I am working on a report right now."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"The train ___ at 7 a.m. every day.\"", options: ["leave", "leaves", "is leaving", "left"], answerIndex: 1, explanation: "Lịch trình cố định dùng Present Simple; chủ ngữ số ít \"the train\" cần thêm -s: leaves." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She don't like tea.", "She doesn't likes tea.", "She doesn't like tea.", "She not like tea."], answerIndex: 2, explanation: "Phủ định ngôi thứ ba số ít: doesn't + V nguyên mẫu (like), không chia thêm -s." },
      { type: "fill_blank", question: "Điền dạng đúng của động từ: \"My father (work) ___ in a bank.\"", answer: "works", explanation: "Chủ ngữ số ít \"my father\" (he) cần thêm -s: works." },
      { type: "fill_blank", question: "Điền dạng đúng của động từ: \"They (not/like) ___ loud music.\"", answer: "don't like", explanation: "Chủ ngữ số nhiều \"they\" dùng \"don't\" + V nguyên mẫu." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He don't eat meat.\"", answer: "He doesn't eat meat.", explanation: "Ngôi thứ ba số ít dùng trợ động từ \"doesn't\", không dùng \"don't\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She go to work by motorbike.\"", answer: "She goes to work by motorbike.", explanation: "Ngôi thứ ba số ít cần thêm -es cho động từ \"go\" → goes." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Mặt trời mọc ở hướng đông.\"", answer: "The sun rises in the east.", explanation: "Sự thật hiển nhiên dùng Present Simple; chủ ngữ số ít \"sun\" + V-s: rises." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy không uống rượu.\"", answer: "She doesn't drink alcohol.", explanation: "Phủ định ngôi thứ ba số ít: doesn't + V nguyên mẫu." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The library closes at 9 p.m. on weekdays.\"", answer: "Thư viện đóng cửa lúc 9 giờ tối vào các ngày trong tuần.", explanation: "Present Simple diễn tả lịch trình cố định." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Do you usually walk to work?\"", answer: "Bạn có thường đi bộ đến chỗ làm không?", explanation: "Câu hỏi về thói quen dùng Do + S + V(bare)." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"He plays tennis on weekends.\"", answer: "He doesn't play tennis on weekends.", explanation: "Ngôi thứ ba số ít, phủ định dùng doesn't + V nguyên mẫu." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They live in the city center.\"", answer: "Do they live in the city center?", explanation: "Chủ ngữ số nhiều dùng \"Do\" để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"My sister study English every evening.\"", answer: "My sister studies English every evening.", explanation: "\"Study\" kết thúc bằng phụ âm + y → đổi y thành i rồi thêm -es: studies." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"It don't rain much in this region.\"", answer: "It doesn't rain much in this region.", explanation: "Chủ ngữ \"it\" là ngôi thứ ba số ít → doesn't, không dùng don't." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The manager check the reports every Friday.\"", answer: "Lỗi: \"check\" → sửa thành \"checks\".", explanation: "Chủ ngữ số ít \"the manager\" cần thêm -s cho động từ." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Does the shop opens on Sundays?\"", answer: "Lỗi: \"opens\" → sửa thành \"open\".", explanation: "Sau \"does\", động từ chính giữ nguyên dạng bare, không chia thêm -s." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (chia đúng động từ):\nA: What time ___ (the shop / open)?\nB: It ___ (open) at 8 a.m.\nA: And what time does it close?", answer: "does the shop open / opens", explanation: "Câu hỏi dùng Does + S + V(bare); câu trả lời chủ ngữ số ít \"it\" cần thêm -s: opens." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you like your new job?\nB: Yes, I ___ it a lot.\nA: That's great to hear!", answer: "Do / like", explanation: "Câu hỏi thói quen/cảm nhận dùng Do + S + V(bare); câu trả lời chủ ngữ \"I\" dùng V nguyên mẫu: like." }
    ],
    quiz: [
      { question: "Chọn câu đúng:", options: ["He go to work by bus.", "He goes to work by bus.", "He going to work by bus.", "He is go to work by bus."], answerIndex: 1, explanation: "Ngôi thứ ba số ít (he) cần thêm -es/-s: goes." },
      { question: "\"The Moon ___ around the Earth.\" Điền từ đúng:", options: ["revolve", "revolves", "revolving", "is revolve"], answerIndex: 1, explanation: "Sự thật khoa học dùng Present Simple, chủ ngữ số ít nên chia \"revolves\"." },
      { question: "\"Water ___ at 100°C at sea level.\"", options: ["boil", "boils", "is boiling", "boiled"], answerIndex: 1, explanation: "Sự thật khoa học dùng Present Simple; chủ ngữ số ít \"water\" cần thêm -s: boils." },
      { question: "Chọn câu đúng:", options: ["Does he likes tea?", "Does he like tea?", "Do he like tea?", "Is he like tea?"], answerIndex: 1, explanation: "Sau \"does\", động từ chính giữ nguyên dạng bare (like), không chia thêm -s." },
      { question: "\"They ___ in a small apartment downtown.\"", options: ["lives", "living", "live", "is living"], answerIndex: 2, explanation: "Chủ ngữ số nhiều \"they\" dùng động từ ở dạng nguyên mẫu: live." }
    ],
    summary: "Present Simple = thói quen + sự thật + lịch trình cố định. Nhớ thêm -s/-es với he/she/it."
  }),

  lesson({
    category: CATEGORY, lessonKey: "present-continuous", title: "Present Continuous", icon: "🔄", orderIndex: 2,
    overview: "Present Continuous diễn tả hành động đang xảy ra tại thời điểm nói, xu hướng đang thay đổi (dùng nhiều trong Task 1 khi mô tả xu hướng đang tăng/giảm), hoặc kế hoạch đã sắp xếp trong tương lai gần.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + am/is/are + V-ing", example: "The number of users is increasing rapidly." },
      { label: "Phủ định (-)", structure: "S + am/is/are + not + V-ing", example: "Sales are not falling this quarter." },
      { label: "Nghi vấn (?)", structure: "Am/Is/Are + S + V-ing?", example: "Is the trend rising or falling?" }
    ],
    usage: [
      { title: "Hành động đang diễn ra ngay lúc nói", description: "I am writing this essay now." },
      { title: "Xu hướng đang thay đổi (Task 1 line graph)", description: "The proportion of online shoppers is growing steadily." },
      { title: "Kế hoạch tương lai gần đã sắp xếp", description: "We are meeting the client tomorrow." },
      { title: "Tình huống tạm thời (không phải thói quen lâu dài)", description: "She is staying with her cousin this month." }
    ],
    signalWords: ["now", "right now", "at the moment", "currently", "these days", "still", "look!", "listen!"],
    examples: [
      { en: "The line graph shows that the figure is rising sharply.", vi: "Biểu đồ đường cho thấy con số đang tăng mạnh." },
      { en: "They are not attending the meeting today.", vi: "Họ không tham dự cuộc họp hôm nay." },
      { en: "Is the company expanding into new markets?", vi: "Công ty có đang mở rộng sang thị trường mới không?" },
      { en: "My phone is charging right now.", vi: "Điện thoại của tôi đang sạc pin ngay bây giờ." },
      { en: "We are currently redesigning our website.", vi: "Chúng tôi hiện đang thiết kế lại trang web của mình." },
      { en: "She isn't listening to me at the moment.", vi: "Cô ấy hiện không lắng nghe tôi." },
      { en: "Are you working on the report this week?", vi: "Bạn có đang làm báo cáo tuần này không?" },
      { en: "More young people are choosing to work remotely these days.", vi: "Ngày càng nhiều người trẻ đang chọn làm việc từ xa trong những ngày này." },
      { en: "The children are playing in the garden right now.", vi: "Bọn trẻ đang chơi trong vườn ngay bây giờ." },
      { en: "I'm meeting my dentist at 3 p.m. tomorrow.", vi: "Tôi có hẹn gặp nha sĩ lúc 3 giờ chiều mai." },
      { en: "Unemployment is falling for the third consecutive month.", vi: "Tỷ lệ thất nghiệp đang giảm trong tháng thứ ba liên tiếp." }
    ],
    mistakes: [
      { wrong: "She is loving this song.", right: "She loves this song.", note: "Động từ chỉ trạng thái (love, know, believe, want) thường không dùng ở dạng tiếp diễn." },
      { wrong: "The figure increasing now.", right: "The figure is increasing now.", note: "Thiếu trợ động từ to be trước V-ing." },
      { wrong: "I am understanding the lesson now.", right: "I understand the lesson now.", note: "\"Understand\" là động từ trạng thái, không chia tiếp diễn." },
      { wrong: "She working on a new project.", right: "She is working on a new project.", note: "Thiếu trợ động từ \"is\" trước V-ing." },
      { wrong: "Are you agreeing with me?", right: "Do you agree with me?", note: "\"Agree\" là động từ trạng thái, nên dùng Present Simple thay vì Continuous." },
      { wrong: "They is watching a movie.", right: "They are watching a movie.", note: "Chủ ngữ số nhiều \"they\" cần dùng \"are\", không dùng \"is\"." }
    ],
    tips: [
      "Trong Task 1 line graph, dùng Present Continuous nếu đề bài yêu cầu mô tả dữ liệu đang diễn ra — phổ biến hơn vẫn là Past Simple cho số liệu quá khứ.",
      "Cẩn thận nhóm động từ trạng thái (stative verbs): know, believe, want, need, seem — không chia tiếp diễn."
    ],
    comparison: {
      title: "Present Continuous vs Present Simple",
      headers: ["Present Continuous", "Present Simple"],
      rows: [["Đang xảy ra / xu hướng đang đổi", "Thói quen / sự thật cố định"], ["Prices are rising this month.", "Prices rise every January (seasonal pattern)."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Look! The bus ___ away.\"", options: ["drive", "drives", "is driving", "was driving"], answerIndex: 2, explanation: "\"Look!\" báo hiệu hành động đang diễn ra ngay lúc nói → is driving." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["He is wanting a new phone.", "He wants a new phone.", "He want a new phone.", "He is want a new phone."], answerIndex: 1, explanation: "\"Want\" là động từ trạng thái, không chia tiếp diễn → dùng Present Simple." },
      { type: "fill_blank", question: "Điền dạng đúng: \"The number of tourists (increase) ___ this year.\"", answer: "is increasing", explanation: "Xu hướng đang thay đổi ở hiện tại dùng Present Continuous." },
      { type: "fill_blank", question: "Điền dạng đúng: \"I (not/watch) ___ TV right now; I'm cooking.\"", answer: "am not watching", explanation: "Phủ định Present Continuous: am/is/are + not + V-ing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She is knowing the answer.\"", answer: "She knows the answer.", explanation: "\"Know\" là động từ trạng thái, không chia tiếp diễn." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They is having dinner now.\"", answer: "They are having dinner now.", explanation: "Chủ ngữ số nhiều \"they\" cần \"are\", không dùng \"is\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Ngày càng nhiều người đang mua sắm trực tuyến.\"", answer: "More and more people are shopping online.", explanation: "Xu hướng đang diễn ra dùng Present Continuous." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tôi hiện không sống ở Hà Nội.\"", answer: "I am not currently living in Hanoi.", explanation: "Tình huống tạm thời dùng Present Continuous với \"currently\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The proportion of car owners is falling steadily.\"", answer: "Tỷ lệ người sở hữu ô tô đang giảm đều đặn.", explanation: "Present Continuous mô tả xu hướng đang thay đổi." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Are they still waiting for the results?\"", answer: "Họ vẫn đang chờ kết quả phải không?", explanation: "Câu hỏi Present Continuous: Are + S + V-ing?" },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"We are attending the workshop today.\"", answer: "We are not attending the workshop today.", explanation: "Phủ định Present Continuous: am/is/are + not + V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"The figures are rising sharply.\"", answer: "Are the figures rising sharply?", explanation: "Đảo trợ động từ \"are\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She always is complaining about her job.\"", answer: "She is always complaining about her job.", explanation: "Trạng từ tần suất \"always\" đứng sau trợ động từ \"is\", trước V-ing." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He loving his new car.\"", answer: "He loves his new car.", explanation: "\"Love\" là động từ trạng thái, không chia tiếp diễn." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The company is needing more staff this month.\"", answer: "Lỗi: \"is needing\" → sửa thành \"needs\".", explanation: "\"Need\" là động từ trạng thái, không dùng dạng tiếp diễn." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Right now, she cook dinner.\"", answer: "Lỗi: \"cook\" → sửa thành \"is cooking\".", explanation: "\"Right now\" là tín hiệu hành động đang diễn ra → cần trợ động từ + V-ing." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What ___ you ___ (do) at the moment?\nB: I ___ (prepare) for my exam.\nA: Good luck!", answer: "are / doing / am preparing", explanation: "Câu hỏi Present Continuous: What + are + S + V-ing?; câu trả lời: am + V-ing." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ the situation ___ (improve)?\nB: Yes, things ___ (get) better slowly.\nA: That's good news.", answer: "Is / improving / are getting", explanation: "Câu hỏi và câu trả lời đều dùng cấu trúc Present Continuous để nói về xu hướng đang thay đổi." }
    ],
    quiz: [
      { question: "\"Look! The dog ___ across the road.\"", options: ["run", "runs", "is running", "running"], answerIndex: 2, explanation: "\"Look!\" là tín hiệu của hành động đang diễn ra ngay lúc nói → is running." },
      { question: "Câu nào SAI?", options: ["I am knowing the answer.", "I know the answer.", "She is cooking dinner.", "They are studying now."], answerIndex: 0, explanation: "\"Know\" là động từ trạng thái, không chia tiếp diễn." },
      { question: "\"I ___ this book at the moment; it's really interesting.\"", options: ["read", "reads", "am reading", "readed"], answerIndex: 2, explanation: "\"At the moment\" là tín hiệu hành động đang diễn ra → am reading." },
      { question: "Câu nào SAI?", options: ["The company is expanding fast.", "She is believing him.", "We are having a meeting now.", "They are moving to a new office."], answerIndex: 1, explanation: "\"Believe\" là động từ trạng thái, không chia tiếp diễn." },
      { question: "\"___ you working this weekend?\"", options: ["Do", "Are", "Is", "Does"], answerIndex: 1, explanation: "Chủ ngữ \"you\" dùng trợ động từ \"are\" cho câu hỏi Present Continuous." }
    ],
    summary: "Present Continuous = đang diễn ra / xu hướng đang đổi / kế hoạch gần. Không dùng với động từ trạng thái."
  }),

  lesson({
    category: CATEGORY, lessonKey: "present-perfect", title: "Present Perfect", icon: "✅", orderIndex: 3,
    overview: "Present Perfect nối kết quá khứ với hiện tại: hành động đã xảy ra nhưng còn ảnh hưởng/liên quan đến hiện tại, hoặc kinh nghiệm/trải nghiệm chưa xác định rõ thời gian. Rất hay dùng trong Writing Task 2 khi nói về xu hướng xã hội.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + have/has + V3/-ed", example: "The government has invested heavily in renewable energy." },
      { label: "Phủ định (-)", structure: "S + have/has + not + V3", example: "She has not finished her report yet." },
      { label: "Nghi vấn (?)", structure: "Have/Has + S + V3?", example: "Have they announced the results?" }
    ],
    usage: [
      { title: "Hành động xảy ra trong quá khứ, còn ảnh hưởng hiện tại", description: "I have lost my keys (nên bây giờ không vào nhà được)." },
      { title: "Kinh nghiệm/trải nghiệm (không rõ thời điểm cụ thể)", description: "I have visited Japan twice." },
      { title: "Hành động bắt đầu trong quá khứ, tiếp diễn đến hiện tại (for/since)", description: "She has lived here since 2015." },
      { title: "Thay đổi/xu hướng xã hội (Task 2)", description: "Technology has transformed the way people communicate." }
    ],
    signalWords: ["already", "just", "yet", "ever", "never", "since", "for", "so far", "recently", "up to now"],
    examples: [
      { en: "Obesity rates have increased significantly over the past decade.", vi: "Tỷ lệ béo phì đã tăng đáng kể trong thập kỷ qua." },
      { en: "I have never seen such a beautiful sunset.", vi: "Tôi chưa từng thấy hoàng hôn đẹp như vậy." },
      { en: "Has the number of students dropped since 2010?", vi: "Số lượng sinh viên có giảm kể từ 2010 không?" },
      { en: "Have you ever tried Vietnamese street food?", vi: "Bạn đã bao giờ thử đồ ăn đường phố Việt Nam chưa?" },
      { en: "The team has just released a new update.", vi: "Đội ngũ vừa mới phát hành một bản cập nhật mới." },
      { en: "I haven't finished reading that novel yet.", vi: "Tôi chưa đọc xong cuốn tiểu thuyết đó." },
      { en: "More companies have adopted remote work policies recently.", vi: "Nhiều công ty đã áp dụng chính sách làm việc từ xa gần đây." },
      { en: "She has already submitted her application.", vi: "Cô ấy đã nộp đơn xin việc rồi." },
      { en: "We have known each other since high school.", vi: "Chúng tôi đã biết nhau kể từ thời trung học." },
      { en: "They have not decided where to go on holiday.", vi: "Họ chưa quyết định sẽ đi đâu vào kỳ nghỉ." }
    ],
    mistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", note: "\"Yesterday\" là mốc thời gian xác định trong quá khứ → phải dùng Past Simple, không dùng Present Perfect." },
      { wrong: "She has live here for 10 years.", right: "She has lived here for 10 years.", note: "Quên chia động từ về dạng V3/-ed sau have/has." },
      { wrong: "I have been to Paris last summer.", right: "I went to Paris last summer.", note: "\"Last summer\" là mốc thời gian xác định → phải dùng Past Simple." },
      { wrong: "She has went to the market.", right: "She has gone to the market.", note: "Present Perfect dùng V3 (gone), không dùng V2 (went)." },
      { wrong: "Have you ever went to Japan?", right: "Have you ever been to Japan?", note: "Sau \"have\", động từ chia ở dạng V3; V3 của \"go\" là \"been/gone\", không phải \"went\"." },
      { wrong: "I have finish my work.", right: "I have finished my work.", note: "Thiếu \"-ed\" để tạo dạng V3 cho động từ có quy tắc." }
    ],
    tips: [
      "Không bao giờ dùng Present Perfect với mốc thời gian xác định trong quá khứ (yesterday, last year, in 2010) — đây là lỗi phổ biến nhất khi thi IELTS.",
      "Dùng \"for + khoảng thời gian\" và \"since + mốc thời gian\" chính xác để tăng điểm Grammatical Range."
    ],
    comparison: {
      title: "Present Perfect vs Past Simple",
      headers: ["Present Perfect", "Past Simple"],
      rows: [["Không rõ/không cần nói thời điểm, còn liên quan hiện tại", "Thời điểm xác định, đã kết thúc hẳn"], ["I have lost my phone.", "I lost my phone last week."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"He ___ his car twice this month.\"", options: ["washed", "has washed", "washes", "was washing"], answerIndex: 1, explanation: "\"This month\" chưa kết thúc + số lần lặp lại → Present Perfect." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["I have seen him yesterday.", "I saw him yesterday.", "I have see him yesterday.", "I did seen him yesterday."], answerIndex: 1, explanation: "\"Yesterday\" là mốc thời gian xác định → Past Simple, không dùng Present Perfect." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They (not/arrive) ___ yet.\"", answer: "haven't arrived", explanation: "\"Yet\" là tín hiệu Present Perfect phủ định: haven't + V3." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ you (finish) ___ the report?\"", answer: "Have ... finished", explanation: "Câu hỏi Present Perfect: Have + S + V3?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I have bought this car in 2020.\"", answer: "I bought this car in 2020.", explanation: "\"In 2020\" là mốc thời gian xác định → dùng Past Simple." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She has never eat sushi.\"", answer: "She has never eaten sushi.", explanation: "Sau \"has\", động từ chia ở dạng V3: eaten." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tỷ lệ thất nghiệp đã giảm đáng kể trong 5 năm qua.\"", answer: "The unemployment rate has decreased significantly over the past five years.", explanation: "Xu hướng kéo dài đến hiện tại → Present Perfect." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tôi chưa bao giờ ăn món này trước đây.\"", answer: "I have never eaten this dish before.", explanation: "Kinh nghiệm chưa xác định thời điểm → Present Perfect với \"never\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Scientists have discovered a new species of frog.\"", answer: "Các nhà khoa học đã phát hiện ra một loài ếch mới.", explanation: "Present Perfect nhấn mạnh kết quả, không cần mốc thời gian cụ thể." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Have you finished the assignment yet?\"", answer: "Bạn đã làm xong bài tập chưa?", explanation: "Câu hỏi Present Perfect với \"yet\"." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"They have completed the project.\"", answer: "They have not completed the project.", explanation: "Phủ định Present Perfect: have/has + not + V3." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"She has moved to a new apartment.\"", answer: "Has she moved to a new apartment?", explanation: "Đảo \"has\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I have saw this film before.\"", answer: "I have seen this film before.", explanation: "Present Perfect cần V3 (seen), không dùng V2 (saw)." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She hasn't call me yet.\"", answer: "She hasn't called me yet.", explanation: "Sau \"hasn't\", động từ chia ở dạng V3: called." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"We have lived here since five years.\"", answer: "Lỗi: \"since five years\" → sửa thành \"for five years\".", explanation: "\"Since\" đi với mốc thời gian, \"for\" đi với khoảng thời gian." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He has finished his degree in 2019.\"", answer: "Lỗi: \"has finished ... in 2019\" → sửa thành \"finished his degree in 2019\".", explanation: "\"In 2019\" là mốc thời gian xác định → phải dùng Past Simple, không dùng Present Perfect." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ever been to Korea?\nB: Yes, I ___ it twice.\nA: That's amazing!", answer: "Have / have visited", explanation: "Câu hỏi kinh nghiệm: Have + S + ever + V3?; câu trả lời: have + V3 (visited)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ the report ___ (submit) yet?\nB: No, she ___ (not/finish) it yet.\nA: Please remind her.", answer: "Has / been submitted / hasn't finished", explanation: "Câu hỏi và câu trả lời đều dùng Present Perfect với tín hiệu \"yet\"." }
    ],
    quiz: [
      { question: "Chọn câu đúng:", options: ["I have visited Paris in 2019.", "I visited Paris in 2019.", "I have visit Paris in 2019.", "I was visited Paris in 2019."], answerIndex: 1, explanation: "\"in 2019\" là mốc thời gian xác định → dùng Past Simple." },
      { question: "\"She ___ her homework yet.\"", options: ["doesn't finish", "hasn't finished", "didn't finished", "isn't finish"], answerIndex: 1, explanation: "\"yet\" là tín hiệu của Present Perfect ở câu phủ định/nghi vấn." },
      { question: "\"___ you ever visited London?\"", options: ["Do", "Did", "Have", "Has"], answerIndex: 2, explanation: "Chủ ngữ \"you\" dùng \"have\" để tạo câu hỏi Present Perfect." },
      { question: "Câu nào đúng?", options: ["I have seen that movie last week.", "I saw that movie last week.", "I have saw that movie last week.", "I did saw that movie last week."], answerIndex: 1, explanation: "\"Last week\" là mốc thời gian xác định → Past Simple." },
      { question: "\"She ___ in this company for five years.\"", options: ["works", "has worked", "worked", "is working"], answerIndex: 1, explanation: "\"For five years\" + hành động bắt đầu quá khứ tiếp diễn đến hiện tại → Present Perfect." }
    ],
    summary: "Present Perfect nối quá khứ-hiện tại: kinh nghiệm, kết quả còn ảnh hưởng, xu hướng dùng for/since. Không đi cùng mốc thời gian xác định."
  }),

  lesson({
    category: CATEGORY, lessonKey: "present-perfect-continuous", title: "Present Perfect Continuous", icon: "⏳", orderIndex: 4,
    overview: "Present Perfect Continuous nhấn mạnh tính liên tục, kéo dài của một hành động bắt đầu trong quá khứ và vẫn đang tiếp diễn (hoặc vừa mới kết thúc nhưng để lại kết quả rõ ràng ở hiện tại).",
    formula: [
      { label: "Khẳng định (+)", structure: "S + have/has + been + V-ing", example: "Researchers have been studying this phenomenon for years." },
      { label: "Phủ định (-)", structure: "S + have/has + not + been + V-ing", example: "They have not been working on the project recently." },
      { label: "Nghi vấn (?)", structure: "Have/Has + S + been + V-ing?", example: "Have you been waiting long?" }
    ],
    usage: [
      { title: "Nhấn mạnh khoảng thời gian kéo dài liên tục đến hiện tại", description: "I have been studying English for six years." },
      { title: "Hành động vừa kết thúc, để lại kết quả/dấu vết rõ ràng", description: "Her eyes are red — she has been crying." },
      { title: "Xu hướng đang diễn ra trong thời gian gần đây (Task 2)", description: "More people have been shopping online recently." }
    ],
    signalWords: ["for", "since", "lately", "recently", "all day/week", "how long...?"],
    examples: [
      { en: "The population has been growing steadily since 2000.", vi: "Dân số đã và đang tăng đều đặn kể từ năm 2000." },
      { en: "I have been working on this essay all morning.", vi: "Tôi đã làm bài luận này suốt cả buổi sáng." },
      { en: "Has it been raining all day?", vi: "Trời có mưa suốt cả ngày không?" },
      { en: "She has been feeling tired lately.", vi: "Dạo gần đây cô ấy cảm thấy mệt mỏi." },
      { en: "We have been planning this trip for months.", vi: "Chúng tôi đã lên kế hoạch cho chuyến đi này suốt nhiều tháng." },
      { en: "He hasn't been sleeping well recently.", vi: "Gần đây anh ấy ngủ không ngon giấc." },
      { en: "How long have you been learning English?", vi: "Bạn đã học tiếng Anh được bao lâu rồi?" },
      { en: "More consumers have been switching to electric cars.", vi: "Ngày càng nhiều người tiêu dùng đã và đang chuyển sang dùng xe điện." },
      { en: "The children have been playing outside since lunchtime.", vi: "Bọn trẻ đã chơi ngoài trời từ lúc ăn trưa đến giờ." },
      { en: "I have been trying to reach him all day.", vi: "Tôi đã cố gắng liên lạc với anh ấy suốt cả ngày." }
    ],
    mistakes: [
      { wrong: "I have been knowing her for years.", right: "I have known her for years.", note: "\"Know\" là động từ trạng thái, không dùng dạng tiếp diễn — kể cả trong Present Perfect Continuous." },
      { wrong: "She has been study English since 2018.", right: "She has been studying English since 2018.", note: "Thiếu \"-ing\" sau been." },
      { wrong: "They have been work overtime this week.", right: "They have been working overtime this week.", note: "Cấu trúc đúng là have/has + been + V-ing, không phải V nguyên mẫu." },
      { wrong: "I have been living here since five years.", right: "I have been living here for five years.", note: "\"For\" đi với khoảng thời gian, \"since\" đi với mốc thời gian." },
      { wrong: "He has been believing that story for years.", right: "He has believed that story for years.", note: "\"Believe\" là động từ trạng thái, không chia tiếp diễn." }
    ],
    tips: [
      "Dùng thì này để nhấn mạnh QUÁ TRÌNH/thời lượng thay vì kết quả — giúp bài Task 2 phong phú hơn khi bàn về xu hướng kéo dài.",
      "Phân biệt với Present Perfect đơn giản: Perfect Continuous nhấn mạnh \"bao lâu\", Perfect đơn giản nhấn mạnh \"bao nhiêu/kết quả\"."
    ],
    comparison: {
      title: "Present Perfect Continuous vs Present Perfect",
      headers: ["Present Perfect Continuous", "Present Perfect"],
      rows: [["Nhấn mạnh quá trình, khoảng thời gian", "Nhấn mạnh kết quả, số lượng hoàn thành"], ["I have been reading this book for 2 hours.", "I have read 3 chapters of this book."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"We ___ for over an hour; the bus still hasn't come.\"", options: ["wait", "waited", "have been waiting", "are waiting"], answerIndex: 2, explanation: "Nhấn mạnh khoảng thời gian kéo dài liên tục đến hiện tại → Present Perfect Continuous." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She has been knowing the truth for weeks.", "She has known the truth for weeks.", "She has been know the truth for weeks.", "She is knowing the truth for weeks."], answerIndex: 1, explanation: "\"Know\" là động từ trạng thái, không chia tiếp diễn." },
      { type: "fill_blank", question: "Điền dạng đúng: \"He (work) ___ on this project since January.\"", answer: "has been working", explanation: "\"Since January\" + nhấn mạnh quá trình kéo dài → Present Perfect Continuous." },
      { type: "fill_blank", question: "Điền dạng đúng: \"How long ___ you (learn) ___ to drive?\"", answer: "have ... been learning", explanation: "Câu hỏi \"How long\" hỏi về khoảng thời gian kéo dài → have/has been + V-ing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They have been discuss the issue for hours.\"", answer: "They have been discussing the issue for hours.", explanation: "Cần thêm \"-ing\" sau \"been\": discussing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I have been wanting a new phone for months.\"", answer: "I have wanted a new phone for months.", explanation: "\"Want\" là động từ trạng thái, không chia tiếp diễn." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Giá xăng đã tăng liên tục trong vài tháng qua.\"", answer: "Petrol prices have been rising continuously for the past few months.", explanation: "Nhấn mạnh quá trình tăng kéo dài → Present Perfect Continuous." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy đã làm việc ở đây được bao lâu rồi?\"", answer: "How long has she been working here?", explanation: "Câu hỏi về khoảng thời gian kéo dài dùng \"How long has/have + S + been + V-ing?\"" },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"My eyes hurt because I have been staring at the screen all day.\"", answer: "Mắt tôi đau vì tôi đã nhìn chằm chằm vào màn hình cả ngày.", explanation: "Present Perfect Continuous giải thích nguyên nhân của tình trạng hiện tại." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"They have been negotiating the contract for two weeks.\"", answer: "Họ đã đàm phán hợp đồng này suốt hai tuần.", explanation: "Nhấn mạnh quá trình đàm phán kéo dài liên tục." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"He has been feeling well recently.\"", answer: "He has not been feeling well recently.", explanation: "Phủ định: have/has + not + been + V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They have been living abroad for years.\"", answer: "Have they been living abroad for years?", explanation: "Đảo \"have\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She has been cry all morning.\"", answer: "She has been crying all morning.", explanation: "Cần thêm \"-ing\": crying." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I been studying for this exam for weeks.\"", answer: "I have been studying for this exam for weeks.", explanation: "Thiếu trợ động từ \"have\" trước \"been\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"We has been waiting for an hour.\"", answer: "Lỗi: \"has\" → sửa thành \"have\".", explanation: "Chủ ngữ số nhiều \"we\" dùng \"have\", không dùng \"has\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He has been owning this shop since 2010.\"", answer: "Lỗi: \"has been owning\" → sửa thành \"has owned\".", explanation: "\"Own\" là động từ trạng thái, không dùng dạng tiếp diễn." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: How long ___ you ___ (wait) here?\nB: I ___ (wait) for about 30 minutes.\nA: Sorry I'm late!", answer: "have / been waiting / have been waiting", explanation: "Câu hỏi và câu trả lời đều dùng Present Perfect Continuous để nhấn mạnh thời lượng chờ đợi." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why are your hands so dirty?\nB: I ___ (fix) the car engine all afternoon.\nA: Ah, that explains it!", answer: "have been fixing", explanation: "Present Perfect Continuous giải thích nguyên nhân của tình trạng hiện tại (tay bẩn)." }
    ],
    quiz: [
      { question: "\"They ___ for the bus for 20 minutes.\"", options: ["have waited", "have been waiting", "are waiting", "waited"], answerIndex: 1, explanation: "Nhấn mạnh khoảng thời gian kéo dài liên tục (\"for 20 minutes\") → Present Perfect Continuous." },
      { question: "Câu nào đúng?", options: ["I have been knowing him since 2015.", "I have known him since 2015.", "I am knowing him since 2015.", "I know him since 2015."], answerIndex: 1, explanation: "\"Know\" không dùng dạng tiếp diễn." },
      { question: "\"Her hands are covered in paint because she ___ the fence.\"", options: ["painted", "has painted", "has been painting", "paints"], answerIndex: 2, explanation: "Kết quả nhìn thấy hiện tại được giải thích bởi quá trình vừa diễn ra → Present Perfect Continuous." },
      { question: "Chọn đáp án đúng: \"___ have you been working on this report?\"", options: ["How long", "How many", "How much", "How often"], answerIndex: 0, explanation: "\"How long\" hỏi về khoảng thời gian kéo dài, phù hợp với Present Perfect Continuous." },
      { question: "Câu nào SAI?", options: ["She has been studying all night.", "He has been owning this car for years.", "They have been arguing for an hour.", "I have been feeling sick lately."], answerIndex: 1, explanation: "\"Own\" là động từ trạng thái, không dùng dạng tiếp diễn." }
    ],
    summary: "Present Perfect Continuous nhấn mạnh QUÁ TRÌNH kéo dài liên tục từ quá khứ đến hiện tại, thường đi với for/since."
  }),

  lesson({
    category: CATEGORY, lessonKey: "past-simple", title: "Past Simple", icon: "🟣", orderIndex: 5,
    overview: "Past Simple diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ, tại một thời điểm xác định. Đây là thì QUAN TRỌNG NHẤT cho Task 1 khi mô tả số liệu lịch sử.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + V2/-ed", example: "The number of tourists rose sharply in 2015." },
      { label: "Phủ định (-)", structure: "S + did not + V(bare)", example: "The figure did not change much between 2010 and 2012." },
      { label: "Nghi vấn (?)", structure: "Did + S + V(bare)?", example: "Did the population increase last year?" }
    ],
    usage: [
      { title: "Hành động/sự kiện đã kết thúc tại thời điểm xác định trong quá khứ", description: "The company was founded in 1998." },
      { title: "Chuỗi hành động liên tiếp trong quá khứ (kể chuyện)", description: "She woke up, got dressed and left for work." },
      { title: "Mô tả số liệu lịch sử trong Task 1", description: "Sales dropped by 20% in 2020 before recovering in 2021." }
    ],
    signalWords: ["yesterday", "last week/month/year", "in 1990", "ago", "when I was young", "then"],
    examples: [
      { en: "The figure peaked at 50% in 2018 before declining.", vi: "Con số đạt đỉnh 50% vào năm 2018 trước khi giảm." },
      { en: "They did not attend the conference last year.", vi: "Họ đã không tham dự hội nghị năm ngoái." },
      { en: "Did the price fall or rise in that period?", vi: "Giá đã giảm hay tăng trong giai đoạn đó?" },
      { en: "I graduated from university three years ago.", vi: "Tôi đã tốt nghiệp đại học ba năm trước." },
      { en: "She didn't call me back yesterday.", vi: "Cô ấy đã không gọi lại cho tôi hôm qua." },
      { en: "We visited my grandparents last weekend.", vi: "Chúng tôi đã thăm ông bà vào cuối tuần trước." },
      { en: "The government introduced a new tax policy in 2021.", vi: "Chính phủ đã ban hành một chính sách thuế mới vào năm 2021." },
      { en: "Did you enjoy the concert last night?", vi: "Bạn có thích buổi hòa nhạc tối qua không?" },
      { en: "He lost his job during the pandemic.", vi: "Anh ấy đã mất việc trong thời kỳ đại dịch." },
      { en: "The number of applicants doubled between 2015 and 2020.", vi: "Số lượng ứng viên đã tăng gấp đôi trong giai đoạn từ 2015 đến 2020." },
      { en: "I didn't have breakfast this morning.", vi: "Sáng nay tôi đã không ăn sáng." }
    ],
    mistakes: [
      { wrong: "She goed to the market.", right: "She went to the market.", note: "\"Go\" là động từ bất quy tắc → went, không phải \"goed\"." },
      { wrong: "Did she went there?", right: "Did she go there?", note: "Sau \"did\", động từ chính giữ nguyên dạng bare, không chia quá khứ." },
      { wrong: "I seen that film last year.", right: "I saw that film last year.", note: "Nhầm V3 (seen) với V2 (saw) — Past Simple luôn dùng V2, không dùng V3." },
      { wrong: "They didn't wanted to leave.", right: "They didn't want to leave.", note: "Sau \"didn't\", động từ giữ nguyên dạng bare, không chia thêm -ed." },
      { wrong: "She was graduated in 2018.", right: "She graduated in 2018.", note: "\"Graduate\" là nội động từ, không cần \"was/were\" trước nó ở thể chủ động." },
      { wrong: "Yesterday, I have finished my homework.", right: "Yesterday, I finished my homework.", note: "\"Yesterday\" là mốc thời gian xác định trong quá khứ → dùng Past Simple, không dùng Present Perfect." }
    ],
    tips: [
      "Học kỹ bảng động từ bất quy tắc (irregular verbs) — lỗi chia sai V2 rất phổ biến và bị giám khảo trừ điểm Grammar.",
      "Trong Task 1, dùng Past Simple làm thì nền cho MỌI số liệu có mốc thời gian trong quá khứ, kết hợp Past Perfect khi cần so sánh 2 mốc."
    ],
    comparison: {
      title: "Past Simple vs Present Perfect",
      headers: ["Past Simple", "Present Perfect"],
      rows: [["Có mốc thời gian xác định, đã kết thúc", "Không cần mốc thời gian cụ thể, còn liên quan hiện tại"], ["Sales rose in 2019.", "Sales have risen recently."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"The company ___ its first store in 2005.\"", options: ["open", "opens", "opened", "has opened"], answerIndex: 2, explanation: "\"In 2005\" là mốc thời gian xác định trong quá khứ → Past Simple: opened." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["He didn't went to the party.", "He didn't go to the party.", "He not go to the party.", "He doesn't went to the party."], answerIndex: 1, explanation: "Sau \"didn't\", động từ chính giữ nguyên dạng bare: go." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They (not/finish) ___ the project on time last month.\"", answer: "didn't finish", explanation: "Phủ định Past Simple: didn't + V nguyên mẫu." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ she (pass) ___ the exam last week?\"", answer: "Did ... pass", explanation: "Câu hỏi Past Simple: Did + S + V(bare)?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I buyed a new laptop last week.\"", answer: "I bought a new laptop last week.", explanation: "\"Buy\" là động từ bất quy tắc → bought, không phải \"buyed\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Did you went to the bank yesterday?\"", answer: "Did you go to the bank yesterday?", explanation: "Sau \"did\", động từ chính giữ nguyên dạng bare: go." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Doanh số bán hàng giảm mạnh vào năm 2020.\"", answer: "Sales fell sharply in 2020.", explanation: "\"In 2020\" là mốc thời gian xác định → dùng Past Simple." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tôi đã không ngủ ngon đêm qua.\"", answer: "I didn't sleep well last night.", explanation: "Phủ định Past Simple: didn't + V nguyên mẫu (sleep)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The population reached 10 million in 2015.\"", answer: "Dân số đã đạt 10 triệu người vào năm 2015.", explanation: "Past Simple mô tả số liệu tại một mốc thời gian xác định." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Did the museum close early yesterday?\"", answer: "Bảo tàng đã đóng cửa sớm hôm qua phải không?", explanation: "Câu hỏi Past Simple: Did + S + V(bare)?" },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"The price increased last quarter.\"", answer: "The price didn't increase last quarter.", explanation: "Phủ định Past Simple: didn't + V nguyên mẫu." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"She moved to Da Nang in 2019.\"", answer: "Did she move to Da Nang in 2019?", explanation: "Câu hỏi Past Simple dùng \"did\" + V nguyên mẫu (move)." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He runned five kilometers this morning.\"", answer: "He ran five kilometers this morning.", explanation: "\"Run\" là động từ bất quy tắc → ran, không phải \"runned\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"They was late for the meeting.\"", answer: "They were late for the meeting.", explanation: "Chủ ngữ số nhiều \"they\" dùng \"were\", không dùng \"was\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Last year, the firm have hired 50 new employees.\"", answer: "Lỗi: \"have hired\" → sửa thành \"hired\".", explanation: "\"Last year\" là mốc thời gian xác định → phải dùng Past Simple, không dùng Present Perfect." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She don't attend the ceremony last Friday.\"", answer: "Lỗi: \"don't attend\" → sửa thành \"didn't attend\".", explanation: "Phủ định Past Simple dùng \"didn't\", không dùng \"don't\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you (see) ___ the news last night?\nB: Yes, I ___ (watch) it right after dinner.\nA: What did they say?", answer: "Did / see / watched", explanation: "Câu hỏi Past Simple dùng \"did\" + V(bare); câu trả lời chia động từ ở dạng quá khứ: watched." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why ___ you (be) ___ late this morning?\nB: My car ___ (break) down on the way.\nA: Oh no, that's unlucky!", answer: "were / broke", explanation: "Câu hỏi dùng \"were\" (thì to be quá khứ với \"you\"); câu trả lời dùng Past Simple của động từ bất quy tắc \"break\" → broke." }
    ],
    quiz: [
      { question: "\"The economy ___ rapidly in the 1990s.\"", options: ["grow", "grows", "grew", "has grown"], answerIndex: 2, explanation: "\"in the 1990s\" là mốc thời gian xác định trong quá khứ → Past Simple: grew." },
      { question: "Chọn câu đúng:", options: ["She didn't went to school.", "She didn't go to school.", "She not went to school.", "She doesn't went to school."], answerIndex: 1, explanation: "Sau \"didn't\", động từ ở dạng nguyên mẫu (bare infinitive): go." },
      { question: "\"They ___ the contract two weeks ago.\"", options: ["sign", "signs", "signed", "have signed"], answerIndex: 2, explanation: "\"Two weeks ago\" là mốc thời gian xác định trong quá khứ → Past Simple: signed." },
      { question: "Câu nào đúng?", options: ["I seen him at the mall.", "I saw him at the mall.", "I have saw him at the mall.", "I was seen him at the mall."], answerIndex: 1, explanation: "\"See\" ở Past Simple chia thành \"saw\", không phải \"seen\" (đó là V3)." },
      { question: "\"___ the flight leave on time yesterday?\"", options: ["Was", "Did", "Does", "Is"], answerIndex: 1, explanation: "Câu hỏi Past Simple với động từ thường dùng trợ động từ \"Did\"." }
    ],
    summary: "Past Simple = hành động đã kết thúc tại một thời điểm xác định trong quá khứ. Thì chủ lực để mô tả số liệu lịch sử trong Task 1."
  }),

  lesson({
    category: CATEGORY, lessonKey: "past-continuous", title: "Past Continuous", icon: "🌀", orderIndex: 6,
    overview: "Past Continuous diễn tả một hành động đang diễn ra tại một thời điểm xác định trong quá khứ, thường bị một hành động khác (ở Past Simple) xen vào, hoặc hai hành động song song cùng diễn ra.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + was/were + V-ing", example: "They were discussing the report when I arrived." },
      { label: "Phủ định (-)", structure: "S + was/were + not + V-ing", example: "She was not paying attention during the meeting." },
      { label: "Nghi vấn (?)", structure: "Was/Were + S + V-ing?", example: "Were you working at 9 p.m. last night?" }
    ],
    usage: [
      { title: "Hành động đang diễn ra tại một thời điểm xác định trong quá khứ", description: "At 8 p.m. yesterday, I was having dinner." },
      { title: "Hành động đang diễn ra thì bị hành động khác xen vào", description: "I was reading when the phone rang." },
      { title: "Hai hành động song song trong quá khứ", description: "While she was cooking, he was cleaning the house." }
    ],
    signalWords: ["while", "when", "at that moment", "at 8 o'clock last night", "all day yesterday"],
    examples: [
      { en: "While the trend was rising, a sudden drop occurred in March.", vi: "Trong khi xu hướng đang tăng, một đợt giảm đột ngột xảy ra vào tháng 3." },
      { en: "I was not watching TV when you called.", vi: "Tôi đã không xem TV khi bạn gọi." },
      { en: "What were you doing at midnight?", vi: "Bạn đã đang làm gì lúc nửa đêm?" },
      { en: "She was driving to work when the accident happened.", vi: "Cô ấy đang lái xe đi làm thì tai nạn xảy ra." },
      { en: "We were having dinner when the power went out.", vi: "Chúng tôi đang ăn tối thì mất điện." },
      { en: "At this time last year, I was studying abroad.", vi: "Vào thời gian này năm ngoái, tôi đang du học." },
      { en: "They weren't paying attention during the lecture.", vi: "Họ đã không chú ý trong suốt buổi giảng." },
      { en: "Was it raining when you left the office?", vi: "Trời có đang mưa khi bạn rời văn phòng không?" },
      { en: "While prices were falling, demand was increasing.", vi: "Trong khi giá đang giảm, nhu cầu lại đang tăng." },
      { en: "He was talking on the phone while driving.", vi: "Anh ấy vừa lái xe vừa nói chuyện điện thoại." },
      { en: "I wasn't feeling well, so I stayed home.", vi: "Tôi cảm thấy không khỏe, nên tôi đã ở nhà." }
    ],
    mistakes: [
      { wrong: "I was knowing the answer.", right: "I knew the answer.", note: "Động từ trạng thái không dùng ở dạng tiếp diễn, kể cả ở quá khứ." },
      { wrong: "When I arrived, she was leave.", right: "When I arrived, she was leaving.", note: "Thiếu \"-ing\" sau \"was\"." },
      { wrong: "They was watching a movie at 8 p.m.", right: "They were watching a movie at 8 p.m.", note: "Chủ ngữ số nhiều \"they\" cần dùng \"were\", không dùng \"was\"." },
      { wrong: "While I was cook dinner, she arrived.", right: "While I was cooking dinner, she arrived.", note: "Sau \"was/were\" cần V-ing, không phải V nguyên mẫu." },
      { wrong: "She were sleeping when I called.", right: "She was sleeping when I called.", note: "Chủ ngữ số ít \"she\" cần dùng \"was\", không dùng \"were\"." }
    ],
    tips: [
      "Kết hợp \"while + Past Continuous, S + Past Simple\" là cấu trúc hay gặp trong bài kể chuyện Speaking Part 2.",
      "Trong Task 1, Past Continuous ít dùng hơn Past Simple — chỉ dùng khi cần nhấn mạnh một giai đoạn/quá trình đang diễn ra tại một mốc cụ thể."
    ],
    comparison: {
      title: "Past Continuous vs Past Simple",
      headers: ["Past Continuous", "Past Simple"],
      rows: [["Hành động đang diễn ra (nền)", "Hành động xen vào / hoàn tất"], ["I was cooking...", "...when the phone rang."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"I ___ a shower when the doorbell rang.\"", options: ["take", "took", "was taking", "have taken"], answerIndex: 2, explanation: "Hành động đang diễn ra bị hành động khác xen vào → Past Continuous: was taking." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["We was walking home.", "We were walking home.", "We were walk home.", "We was walk home."], answerIndex: 1, explanation: "Chủ ngữ số nhiều \"we\" cần \"were\" + V-ing." },
      { type: "fill_blank", question: "Điền dạng đúng: \"At 9 p.m. last night, she (study) ___ for her exam.\"", answer: "was studying", explanation: "Hành động đang diễn ra tại một thời điểm xác định trong quá khứ → Past Continuous." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They (not/listen) ___ when the teacher explained the rule.\"", answer: "weren't listening", explanation: "Phủ định Past Continuous: were/was + not + V-ing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"While I was reading, my sister was watch TV.\"", answer: "While I was reading, my sister was watching TV.", explanation: "Sau \"was\" cần V-ing: watching." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He were sleeping when the phone rang.\"", answer: "He was sleeping when the phone rang.", explanation: "Chủ ngữ số ít \"he\" dùng \"was\", không dùng \"were\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Khi tôi về đến nhà, mẹ tôi đang nấu ăn.\"", answer: "When I got home, my mother was cooking.", explanation: "Hành động đang diễn ra tại thời điểm hành động khác xảy ra → Past Continuous." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi đang thảo luận kế hoạch thì đèn tắt.\"", answer: "We were discussing the plan when the lights went out.", explanation: "\"While/When\" + Past Continuous (nền) + Past Simple (xen vào)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"She was crying when I found her.\"", answer: "Cô ấy đang khóc khi tôi tìm thấy cô ấy.", explanation: "Past Continuous mô tả hành động đang diễn ra khi một sự việc khác xảy ra." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"What were you doing at 10 p.m. last night?\"", answer: "Bạn đã đang làm gì lúc 10 giờ tối qua?", explanation: "Câu hỏi Past Continuous hỏi về hành động đang diễn ra tại một thời điểm cụ thể." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"They were arguing about money.\"", answer: "They were not arguing about money.", explanation: "Phủ định Past Continuous: were + not + V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"She was working late last night.\"", answer: "Was she working late last night?", explanation: "Đảo \"was\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I was know him very well back then.\"", answer: "I knew him very well back then.", explanation: "\"Know\" là động từ trạng thái, dùng Past Simple thay vì Past Continuous." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"While she was drive, he was texting.\"", answer: "While she was driving, he was texting.", explanation: "Sau \"was\" cần V-ing: driving." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"They was discussing the budget at that time.\"", answer: "Lỗi: \"was\" → sửa thành \"were\".", explanation: "Chủ ngữ số nhiều \"they\" cần dùng \"were\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"When the fire started, everyone were sleeping.\"", answer: "Lỗi: \"were\" → sửa thành \"was\".", explanation: "\"Everyone\" là chủ ngữ số ít, cần dùng \"was\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What ___ you ___ (do) when the storm hit?\nB: I ___ (drive) home from work.\nA: That must have been scary!", answer: "were / doing / was driving", explanation: "Câu hỏi Past Continuous: What were + S + V-ing?; câu trả lời chia tương tự: was driving." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ she ___ (wait) for you at the station?\nB: Yes, she ___ (stand) right by the entrance.\nA: Good, I saw her.", answer: "Was / waiting / was standing", explanation: "Câu hỏi và câu trả lời đều dùng Past Continuous để mô tả hành động đang diễn ra tại một thời điểm quá khứ cụ thể." }
    ],
    quiz: [
      { question: "\"While she ___ dinner, the phone rang.\"", options: ["cooked", "was cooking", "cooks", "has cooked"], answerIndex: 1, explanation: "Hành động nền đang diễn ra thì bị \"the phone rang\" xen vào → Past Continuous." },
      { question: "Chọn câu đúng:", options: ["They were knowing the truth.", "They knew the truth.", "They was know the truth.", "They were know the truth."], answerIndex: 1, explanation: "\"Know\" không chia tiếp diễn." },
      { question: "\"I ___ my keys when I realized they were in my pocket.\"", options: ["look for", "looked for", "was looking for", "have looked for"], answerIndex: 2, explanation: "Hành động đang diễn ra tại thời điểm phát hiện ra sự việc khác → Past Continuous." },
      { question: "Câu nào đúng?", options: ["He were working at 9 a.m.", "He was working at 9 a.m.", "He was work at 9 a.m.", "He is working at 9 a.m. yesterday."], answerIndex: 1, explanation: "Chủ ngữ số ít \"he\" dùng \"was\" + V-ing (working)." },
      { question: "\"___ you doing anything special last Sunday?\"", options: ["Did", "Was", "Were", "Are"], answerIndex: 2, explanation: "Chủ ngữ \"you\" trong câu hỏi Past Continuous dùng \"were\"." }
    ],
    summary: "Past Continuous = hành động đang diễn ra tại một thời điểm quá khứ xác định, thường làm nền cho một hành động khác xen vào."
  }),

  lesson({
    category: CATEGORY, lessonKey: "past-perfect", title: "Past Perfect", icon: "⏮️", orderIndex: 7,
    overview: "Past Perfect diễn tả một hành động xảy ra TRƯỚC một hành động/thời điểm khác trong quá khứ — giúp sắp xếp trình tự thời gian rõ ràng khi có hai mốc quá khứ.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + had + V3/-ed", example: "By 2010, the population had already doubled." },
      { label: "Phủ định (-)", structure: "S + had not + V3", example: "She had not finished the report before the deadline." },
      { label: "Nghi vấn (?)", structure: "Had + S + V3?", example: "Had the price increased before the policy changed?" }
    ],
    usage: [
      { title: "Hành động xảy ra trước một mốc/hành động khác trong quá khứ", description: "When I arrived, the meeting had already started." },
      { title: "So sánh 2 mốc thời gian trong Task 1", description: "By 2005, exports had reached 10 million tons, up from 6 million in 1995." }
    ],
    signalWords: ["before", "after", "by the time", "already", "just", "never...before", "by 2010"],
    examples: [
      { en: "By the time the study was published, attitudes had already changed.", vi: "Vào lúc nghiên cứu được công bố, thái độ đã thay đổi từ trước đó." },
      { en: "She had not visited the country before 2019.", vi: "Cô ấy đã chưa từng đến quốc gia đó trước năm 2019." },
      { en: "Had the numbers dropped before the new policy was introduced?", vi: "Số liệu đã giảm trước khi chính sách mới được ban hành chưa?" },
      { en: "When I got to the station, the train had already left.", vi: "Khi tôi đến ga, tàu đã rời đi rồi." },
      { en: "They had finished dinner before we arrived.", vi: "Họ đã ăn xong bữa tối trước khi chúng tôi đến." },
      { en: "I had never seen snow before I moved to Canada.", vi: "Tôi chưa từng thấy tuyết trước khi chuyển đến Canada." },
      { en: "Had she already left the company before the merger?", vi: "Cô ấy đã rời công ty trước khi sáp nhập chưa?" },
      { en: "By 2019, the firm had opened branches in five countries.", vi: "Đến năm 2019, công ty đã mở chi nhánh tại năm quốc gia." },
      { en: "He hadn't finished his report by the deadline.", vi: "Anh ấy đã chưa hoàn thành báo cáo trước thời hạn." },
      { en: "The prices had risen sharply before the government intervened.", vi: "Giá cả đã tăng mạnh trước khi chính phủ can thiệp." }
    ],
    mistakes: [
      { wrong: "I had saw the film before.", right: "I had seen the film before.", note: "Nhầm V2 (saw) với V3 (seen) — Past Perfect luôn dùng V3." },
      { wrong: "When I arrive, she had left.", right: "When I arrived, she had left.", note: "Mệnh đề mốc thời gian cũng cần chia Past Simple để đồng bộ trình tự quá khứ." },
      { wrong: "She had ate breakfast before she left.", right: "She had eaten breakfast before she left.", note: "Past Perfect dùng V3 (eaten), không dùng V2 (ate)." },
      { wrong: "By 2015, they had build the new bridge.", right: "By 2015, they had built the new bridge.", note: "\"Build\" là động từ bất quy tắc, V3 là \"built\", không phải \"build\"." },
      { wrong: "Had you finish the report before the meeting?", right: "Had you finished the report before the meeting?", note: "Sau \"had\" cần V3, không phải V nguyên mẫu." }
    ],
    tips: [
      "Dùng \"By + mốc thời gian, S had + V3\" là công thức \"ăn điểm\" khi so sánh 2 số liệu trong Task 1.",
      "Đừng lạm dụng Past Perfect cho mọi câu quá khứ — chỉ dùng khi thực sự cần thể hiện thứ tự trước-sau."
    ],
    comparison: {
      title: "Past Perfect vs Past Simple",
      headers: ["Past Perfect", "Past Simple"],
      rows: [["Xảy ra TRƯỚC mốc quá khứ khác", "Mốc quá khứ chính, hoặc mốc sau"], ["She had left before I arrived.", "I arrived at 9 a.m."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"By the time we got there, the shop ___.\"", options: ["closed", "has closed", "had closed", "was closing"], answerIndex: 2, explanation: "Hành động xảy ra trước một mốc quá khứ khác (chúng tôi đến) → Past Perfect: had closed." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She had went home before I called.", "She had gone home before I called.", "She has gone home before I called.", "She had go home before I called."], answerIndex: 1, explanation: "Past Perfect cần V3 (gone), không dùng V2 (went)." },
      { type: "fill_blank", question: "Điền dạng đúng: \"By 2020, the population (grow) ___ to over 5 million.\"", answer: "had grown", explanation: "So sánh mốc thời gian tương lai của quá khứ → Past Perfect: had grown." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ they (leave) ___ before the storm started?\"", answer: "Had ... left", explanation: "Câu hỏi Past Perfect: Had + S + V3?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"I had never saw such a big crowd before.\"", answer: "I had never seen such a big crowd before.", explanation: "Past Perfect cần V3 (seen), không dùng V2 (saw)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"When she arrive, we had already eaten.\"", answer: "When she arrived, we had already eaten.", explanation: "Mệnh đề \"when\" cần chia Past Simple (arrived) để đồng bộ với Past Perfect." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đến năm 2018, doanh thu đã tăng gấp đôi so với năm 2010.\"", answer: "By 2018, revenue had doubled compared to 2010.", explanation: "So sánh hai mốc quá khứ → Past Perfect: had doubled." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy đã rời khỏi văn phòng trước khi tôi gọi điện.\"", answer: "She had left the office before I called.", explanation: "Hành động xảy ra trước một mốc quá khứ khác → Past Perfect." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"By the time the ambulance arrived, the patient had already recovered.\"", answer: "Vào lúc xe cứu thương đến, bệnh nhân đã hồi phục rồi.", explanation: "Past Perfect diễn tả hành động hoàn tất trước một mốc quá khứ khác." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Had the company launched the product before the competitor did?\"", answer: "Công ty đã ra mắt sản phẩm trước đối thủ cạnh tranh chưa?", explanation: "Câu hỏi Past Perfect so sánh trình tự hai sự kiện quá khứ." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"They had signed the contract by then.\"", answer: "They had not signed the contract by then.", explanation: "Phủ định Past Perfect: had + not + V3." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"She had finished her thesis before graduation.\"", answer: "Had she finished her thesis before graduation?", explanation: "Đảo \"had\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"By 2012, sales had rise by 40%.\"", answer: "By 2012, sales had risen by 40%.", explanation: "Past Perfect cần V3 (risen), không dùng V nguyên mẫu (rise)." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She had never spoke to him before that day.\"", answer: "She had never spoken to him before that day.", explanation: "Past Perfect cần V3 (spoken), không dùng V2 (spoke)." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"When I woke up, the sun had already rose.\"", answer: "Lỗi: \"had already rose\" → sửa thành \"had already risen\".", explanation: "Past Perfect cần V3 (risen); \"rose\" là dạng V2." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"By 2005, the two companies had merge into one.\"", answer: "Lỗi: \"had merge\" → sửa thành \"had merged\".", explanation: "Sau \"had\" cần V3 (merged), không phải V nguyên mẫu." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ___ (finish) the report before the boss asked for it?\nB: Yes, I ___ (submit) it an hour earlier.\nA: Great, well done!", answer: "Had / finished / had submitted", explanation: "Câu hỏi Past Perfect: Had + S + V3?; câu trả lời: had + V3 (submitted)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why was the ground wet?\nB: It ___ (rain) heavily before we arrived.\nA: I see, that explains the puddles.", answer: "had rained", explanation: "Past Perfect giải thích nguyên nhân của một tình trạng nhìn thấy tại một mốc quá khứ khác." }
    ],
    quiz: [
      { question: "\"By 2010, the company ___ its profits.\"", options: ["doubled", "has doubled", "had doubled", "was doubling"], answerIndex: 2, explanation: "\"By 2010\" kết hợp với một mốc quá khứ ngầm định trước đó → Past Perfect: had doubled." },
      { question: "Chọn câu đúng:", options: ["When she arrived, the film had already start.", "When she arrived, the film had already started.", "When she arrived, the film has already started.", "When she arrive, the film had already started."], answerIndex: 1, explanation: "Past Perfect cần V3 (started) và mệnh đề \"when\" chia Past Simple (arrived)." },
      { question: "\"He ___ his keys, so he couldn't get in.\"", options: ["lost", "has lost", "had lost", "loses"], answerIndex: 2, explanation: "Hành động xảy ra trước kết quả trong quá khứ (không vào được nhà) → Past Perfect." },
      { question: "Câu nào đúng?", options: ["I had never ate lobster before.", "I had never eaten lobster before.", "I have never ate lobster before.", "I had never eat lobster before."], answerIndex: 1, explanation: "Past Perfect cần V3 (eaten), không dùng V2 (ate)." },
      { question: "\"___ the meeting started before you arrived?\"", options: ["Did", "Was", "Had", "Has"], answerIndex: 2, explanation: "Câu hỏi Past Perfect dùng \"Had\" để hỏi về trình tự trước-sau trong quá khứ." }
    ],
    summary: "Past Perfect diễn tả hành động xảy ra TRƯỚC một mốc/hành động khác trong quá khứ — rất hữu ích để so sánh hai giai đoạn số liệu."
  }),

  lesson({
    category: CATEGORY, lessonKey: "past-perfect-continuous", title: "Past Perfect Continuous", icon: "⏱️", orderIndex: 8,
    overview: "Past Perfect Continuous nhấn mạnh khoảng thời gian một hành động đã diễn ra liên tục TRƯỚC một mốc/hành động khác trong quá khứ.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + had + been + V-ing", example: "They had been negotiating for months before the deal was signed." },
      { label: "Phủ định (-)", structure: "S + had not + been + V-ing", example: "She had not been feeling well before the trip." },
      { label: "Nghi vấn (?)", structure: "Had + S + been + V-ing?", example: "Had they been working together before the merger?" }
    ],
    usage: [
      { title: "Nhấn mạnh khoảng thời gian kéo dài trước một mốc quá khứ khác", description: "He had been studying for three hours before he took a break." },
      { title: "Giải thích nguyên nhân/kết quả nhìn thấy tại một mốc quá khứ", description: "The ground was wet because it had been raining." }
    ],
    signalWords: ["for", "since", "before", "by the time", "how long"],
    examples: [
      { en: "Prices had been rising steadily before the crisis hit.", vi: "Giá đã tăng đều đặn trước khi khủng hoảng xảy ra." },
      { en: "She had not been sleeping well before the exam.", vi: "Cô ấy đã ngủ không ngon trước kỳ thi." },
      { en: "Had he been working there long before he resigned?", vi: "Anh ấy đã làm việc ở đó lâu chưa trước khi từ chức?" },
      { en: "They had been dating for two years before they got married.", vi: "Họ đã hẹn hò được hai năm trước khi kết hôn." },
      { en: "I was exhausted because I had been running all morning.", vi: "Tôi kiệt sức vì đã chạy bộ suốt cả buổi sáng." },
      { en: "The company had been losing money for months before it closed.", vi: "Công ty đã thua lỗ suốt nhiều tháng trước khi đóng cửa." },
      { en: "Had you been waiting long before the doctor called you in?", vi: "Bạn đã chờ lâu chưa trước khi bác sĩ gọi bạn vào?" },
      { en: "The children were tired because they had been playing all day.", vi: "Bọn trẻ mệt vì đã chơi cả ngày." },
      { en: "She hadn't been feeling well for weeks before she saw a doctor.", vi: "Cô ấy đã cảm thấy không khỏe suốt nhiều tuần trước khi đi khám bác sĩ." },
      { en: "We had been negotiating for hours before we reached an agreement.", vi: "Chúng tôi đã đàm phán suốt nhiều giờ trước khi đạt được thỏa thuận." }
    ],
    mistakes: [
      { wrong: "They had been know each other for years.", right: "They had known each other for years.", note: "\"Know\" không dùng dạng tiếp diễn — dùng Past Perfect đơn giản thay vì Continuous." },
      { wrong: "She had been study all night.", right: "She had been studying all night.", note: "Thiếu \"-ing\" sau \"been\"." },
      { wrong: "He had been believing that lie for years.", right: "He had believed that lie for years.", note: "\"Believe\" là động từ trạng thái, không chia tiếp diễn." },
      { wrong: "We had being working there since 2015.", right: "We had been working there since 2015.", note: "Nhầm lẫn \"being\" với \"been\" — cấu trúc đúng là had + been + V-ing." },
      { wrong: "Had they been argue before you arrived?", right: "Had they been arguing before you arrived?", note: "Sau \"been\" cần V-ing (arguing), không phải V nguyên mẫu." }
    ],
    tips: [
      "Ít xuất hiện trong Task 1/2 nhưng hữu ích cho Speaking Part 2 khi kể một câu chuyện có chiều sâu thời gian.",
      "Phân biệt rõ với Past Perfect đơn giản: Continuous nhấn mạnh QUÁ TRÌNH, đơn giản nhấn mạnh KẾT QUẢ/hoàn tất."
    ],
    comparison: {
      title: "Past Perfect Continuous vs Past Perfect",
      headers: ["Past Perfect Continuous", "Past Perfect"],
      rows: [["Nhấn mạnh quá trình kéo dài trước mốc quá khứ", "Nhấn mạnh việc đã hoàn tất trước mốc quá khứ"], ["He had been working for 5 hours when I called.", "He had finished the report when I called."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"She was tired because she ___ all day.\"", options: ["worked", "had worked", "had been working", "has been working"], answerIndex: 2, explanation: "Nhấn mạnh quá trình làm việc kéo dài trước kết quả (mệt) trong quá khứ → Past Perfect Continuous." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["They had been knowing the answer.", "They had known the answer.", "They had been know the answer.", "They have been knowing the answer."], answerIndex: 1, explanation: "\"Know\" là động từ trạng thái, không chia tiếp diễn." },
      { type: "fill_blank", question: "Điền dạng đúng: \"The ground was wet because it (rain) ___ all night.\"", answer: "had been raining", explanation: "Nhấn mạnh quá trình mưa kéo dài trước khi phát hiện đất ướt → Past Perfect Continuous." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ you (wait) ___ long when the bus finally came?\"", answer: "Had ... been waiting", explanation: "Câu hỏi Past Perfect Continuous: Had + S + been + V-ing?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He had been feel sick for days before he saw a doctor.\"", answer: "He had been feeling sick for days before he saw a doctor.", explanation: "Sau \"been\" cần V-ing: feeling." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"We had been own that house for ten years before we sold it.\"", answer: "We had owned that house for ten years before we sold it.", explanation: "\"Own\" là động từ trạng thái, không dùng dạng tiếp diễn." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy đã học tiếng Pháp được ba năm trước khi chuyển đến Paris.\"", answer: "She had been learning French for three years before she moved to Paris.", explanation: "Nhấn mạnh quá trình học kéo dài trước một mốc quá khứ khác → Past Perfect Continuous." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Mắt anh ấy đỏ vì đã khóc suốt đêm.\"", answer: "His eyes were red because he had been crying all night.", explanation: "Past Perfect Continuous giải thích nguyên nhân của một tình trạng quan sát được." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"They had been living in that apartment for a decade before they moved out.\"", answer: "Họ đã sống ở căn hộ đó suốt một thập kỷ trước khi chuyển đi.", explanation: "Past Perfect Continuous nhấn mạnh khoảng thời gian sinh sống kéo dài." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Had she been working there before the company went bankrupt?\"", answer: "Cô ấy đã làm việc ở đó trước khi công ty phá sản chưa?", explanation: "Câu hỏi Past Perfect Continuous về quá trình làm việc trước một sự kiện quá khứ khác." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"He had been smoking for years before he quit.\"", answer: "He had not been smoking for years before he quit.", explanation: "Phủ định Past Perfect Continuous: had + not + been + V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They had been planning the event for months.\"", answer: "Had they been planning the event for months?", explanation: "Đảo \"had\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She had been cry for an hour before we found her.\"", answer: "She had been crying for an hour before we found her.", explanation: "Sau \"been\" cần V-ing: crying." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"We had been discuss the issue for a long time before deciding.\"", answer: "We had been discussing the issue for a long time before deciding.", explanation: "Sau \"been\" cần V-ing: discussing." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He had been drive for six hours when he finally stopped to rest.\"", answer: "Lỗi: \"had been drive\" → sửa thành \"had been driving\".", explanation: "Sau \"been\" cần V-ing, không phải V nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She had been wanting that job for years before she finally got it.\"", answer: "Lỗi: \"had been wanting\" → sửa thành \"had wanted\".", explanation: "\"Want\" là động từ trạng thái, không dùng dạng tiếp diễn." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why was he so exhausted at the finish line?\nB: He ___ (run) for over four hours straight.\nA: Wow, that's impressive endurance!", answer: "had been running", explanation: "Past Perfect Continuous nhấn mạnh quá trình chạy kéo dài trước kết quả (kiệt sức)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ___ (learn) Spanish before you moved to Madrid?\nB: Yes, I ___ (study) it for two years already.\nA: That must have helped a lot.", answer: "Had / been learning / had been studying", explanation: "Câu hỏi và câu trả lời đều dùng Past Perfect Continuous để nhấn mạnh quá trình học kéo dài trước một mốc quá khứ." }
    ],
    quiz: [
      { question: "\"The road was flooded because it ___ for hours.\"", options: ["rained", "had rained", "had been raining", "has been raining"], answerIndex: 2, explanation: "Nhấn mạnh quá trình mưa kéo dài trước khi ngập → Past Perfect Continuous." },
      { question: "Chọn câu đúng:", options: ["She had been knowing him for years.", "She had known him for years.", "She had been know him for years.", "She has been knowing him for years."], answerIndex: 1, explanation: "\"Know\" không chia tiếp diễn." },
      { question: "\"He was out of breath because he ___ up the stairs.\"", options: ["ran", "had run", "had been running", "has been running"], answerIndex: 2, explanation: "Nhấn mạnh quá trình chạy kéo dài trước kết quả (hết hơi) trong quá khứ → Past Perfect Continuous." },
      { question: "Câu nào đúng?", options: ["They had been own the farm for decades.", "They had owned the farm for decades.", "They had been owning the farm for decades.", "They have been owning the farm for decades."], answerIndex: 1, explanation: "\"Own\" là động từ trạng thái, không dùng dạng tiếp diễn." },
      { question: "\"___ you been feeling unwell before you went to the hospital?\"", options: ["Did", "Were", "Had", "Have"], answerIndex: 2, explanation: "Câu hỏi Past Perfect Continuous: Had + S + been + V-ing?" }
    ],
    summary: "Past Perfect Continuous nhấn mạnh QUÁ TRÌNH kéo dài trước một mốc/hành động khác trong quá khứ."
  }),

  lesson({
    category: CATEGORY, lessonKey: "future-simple", title: "Future Simple", icon: "🔮", orderIndex: 9,
    overview: "Future Simple (will) dùng để dự đoán, quyết định tức thời tại thời điểm nói, hứa hẹn, hoặc đề xuất/tình nguyện. Rất phổ biến trong Task 1 dự đoán xu hướng và Task 2 khi đưa ra dự báo/khuyến nghị.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + will + V(bare)", example: "The number of users will exceed one million by 2030." },
      { label: "Phủ định (-)", structure: "S + will not (won't) + V", example: "The trend will not continue at the same rate." },
      { label: "Nghi vấn (?)", structure: "Will + S + V?", example: "Will the population increase further?" }
    ],
    usage: [
      { title: "Dự đoán không có bằng chứng cụ thể (dựa trên suy đoán/ý kiến)", description: "I think it will rain tomorrow." },
      { title: "Quyết định tức thời tại thời điểm nói", description: "I'll help you carry that." },
      { title: "Lời hứa, đề nghị, tình nguyện", description: "I will call you as soon as I arrive." },
      { title: "Dự báo số liệu tương lai trong Task 1", description: "Projections suggest the figure will rise to 80% by 2040." }
    ],
    signalWords: ["tomorrow", "next year", "in the future", "soon", "I think/believe/expect...", "probably", "by 2030"],
    examples: [
      { en: "Experts predict that emissions will decrease significantly.", vi: "Các chuyên gia dự đoán lượng khí thải sẽ giảm đáng kể." },
      { en: "The government will not cut the education budget.", vi: "Chính phủ sẽ không cắt giảm ngân sách giáo dục." },
      { en: "Will renewable energy replace fossil fuels?", vi: "Năng lượng tái tạo có thay thế nhiên liệu hóa thạch không?" },
      { en: "I'll help you move house this weekend.", vi: "Tôi sẽ giúp bạn chuyển nhà vào cuối tuần này." },
      { en: "She will probably arrive a bit late.", vi: "Cô ấy có lẽ sẽ đến hơi muộn." },
      { en: "Don't worry, I won't tell anyone your secret.", vi: "Đừng lo, tôi sẽ không kể bí mật của bạn cho ai đâu." },
      { en: "Will you marry me?", vi: "Em có đồng ý làm vợ anh không?" },
      { en: "I think more students will choose online courses in the future.", vi: "Tôi nghĩ ngày càng nhiều sinh viên sẽ chọn học trực tuyến trong tương lai." },
      { en: "The phone's ringing — I'll get it.", vi: "Điện thoại đang reo kìa — để tôi nghe cho." },
      { en: "They will not accept the offer under these conditions.", vi: "Họ sẽ không chấp nhận đề nghị trong những điều kiện này." },
      { en: "Will the new policy affect small businesses?", vi: "Chính sách mới có ảnh hưởng đến các doanh nghiệp nhỏ không?" }
    ],
    mistakes: [
      { wrong: "I will to go there.", right: "I will go there.", note: "Sau \"will\" là động từ nguyên mẫu KHÔNG \"to\"." },
      { wrong: "She will goes tomorrow.", right: "She will go tomorrow.", note: "Sau \"will\", động từ giữ nguyên dạng bare, không chia thêm -s." },
      { wrong: "They will to help us next week.", right: "They will help us next week.", note: "Sau \"will\" không bao giờ có \"to\" trước động từ." },
      { wrong: "I will not to attend the meeting.", right: "I will not attend the meeting.", note: "Phủ định \"will not\" vẫn theo sau bởi V nguyên mẫu, không thêm \"to\"." },
      { wrong: "Will she goes with us?", right: "Will she go with us?", note: "Trong câu hỏi, sau chủ ngữ là V nguyên mẫu (go), không chia thêm -es." }
    ],
    tips: [
      "Dùng \"will\" cho dự đoán mang tính cá nhân/suy đoán; dùng \"be going to\" khi có bằng chứng/kế hoạch rõ ràng.",
      "Trong Task 1 có mốc thời gian tương lai (dự báo), kết hợp \"will\" với các động từ xu hướng: rise, fall, remain stable."
    ],
    comparison: {
      title: "Will vs Be Going To",
      headers: ["Will", "Be Going To"],
      rows: [["Dự đoán/quyết định tức thời, không có bằng chứng rõ", "Kế hoạch đã định trước, có dấu hiệu/bằng chứng rõ ràng"], ["I think it will rain.", "Look at those clouds — it's going to rain."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"I promise I ___ you as soon as I land.\"", options: ["call", "will call", "am calling", "called"], answerIndex: 1, explanation: "Lời hứa dùng Future Simple: will + V(bare)." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She will to visit us next month.", "She will visits us next month.", "She will visit us next month.", "She wills visit us next month."], answerIndex: 2, explanation: "Sau \"will\" luôn là V nguyên mẫu, không \"to\", không chia." },
      { type: "fill_blank", question: "Điền dạng đúng: \"I think it (be) ___ sunny tomorrow.\"", answer: "will be", explanation: "\"I think\" báo hiệu dự đoán chủ quan → will + V(bare)." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They (not/attend) ___ the ceremony next week.\"", answer: "will not attend", explanation: "Phủ định Future Simple: will not (won't) + V nguyên mẫu." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He will to finish the project by Friday.\"", answer: "He will finish the project by Friday.", explanation: "Sau \"will\" không có \"to\" trước động từ." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Will she comes to the party?\"", answer: "Will she come to the party?", explanation: "Sau chủ ngữ trong câu hỏi Future Simple là V nguyên mẫu (come), không chia thêm -s." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Tôi nghĩ dân số thế giới sẽ tiếp tục tăng.\"", answer: "I think the world's population will continue to increase.", explanation: "Dự đoán chủ quan dùng Future Simple: will + V(bare)." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi sẽ không hủy chuyến đi.\"", answer: "We will not cancel the trip.", explanation: "Phủ định Future Simple: will not + V nguyên mẫu." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Analysts believe interest rates will rise next year.\"", answer: "Các nhà phân tích tin rằng lãi suất sẽ tăng vào năm sau.", explanation: "Future Simple dùng cho dự báo/dự đoán về xu hướng tương lai." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Will the new law come into effect next month?\"", answer: "Luật mới có sẽ có hiệu lực vào tháng sau không?", explanation: "Câu hỏi Future Simple: Will + S + V(bare)?" },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"The company will expand its operations abroad.\"", answer: "The company will not expand its operations abroad.", explanation: "Phủ định Future Simple: will not + V nguyên mẫu." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They will announce the results tomorrow.\"", answer: "Will they announce the results tomorrow?", explanation: "Đảo \"will\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I will to call you back later.\"", answer: "I will call you back later.", explanation: "Sau \"will\" không có \"to\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She wills join us for dinner.\"", answer: "She will join us for dinner.", explanation: "\"Will\" không chia theo chủ ngữ, luôn giữ nguyên \"will\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"By next decade, robots will to perform most factory jobs.\"", answer: "Lỗi: \"will to perform\" → sửa thành \"will perform\".", explanation: "Sau \"will\" không có \"to\" trước động từ nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"I hope she will passes the interview.\"", answer: "Lỗi: \"will passes\" → sửa thành \"will pass\".", explanation: "Sau \"will\", động từ giữ nguyên dạng bare, không chia thêm -es." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: The printer is broken again.\nB: Don't worry, I ___ (fix) it.\nA: Thanks, I really appreciate it.", answer: "will fix", explanation: "Quyết định tức thời tại thời điểm nói dùng Future Simple: will + V(bare)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Do you think it ___ (rain) tomorrow?\nB: I'm not sure, but it probably ___ (be) cloudy.\nA: I'd better bring an umbrella just in case.", answer: "will rain / will be", explanation: "Dự đoán chủ quan không có bằng chứng rõ ràng dùng Future Simple với \"will\"." }
    ],
    quiz: [
      { question: "\"I think the price ___ next month.\"", options: ["rise", "rises", "will rise", "is rising"], answerIndex: 2, explanation: "\"I think\" báo hiệu dự đoán chủ quan → will + V(bare)." },
      { question: "Chọn câu đúng:", options: ["She will comes tomorrow.", "She will to come tomorrow.", "She will come tomorrow.", "She wills come tomorrow."], answerIndex: 2, explanation: "Sau \"will\" luôn là V nguyên mẫu, không chia, không \"to\"." },
      { question: "\"___ you help me carry these boxes?\"", options: ["Do", "Are", "Will", "Did"], answerIndex: 2, explanation: "Lời đề nghị/yêu cầu tức thời dùng \"Will you...?\"" },
      { question: "Câu nào đúng?", options: ["They will not to come tonight.", "They will not comes tonight.", "They will not come tonight.", "They not will come tonight."], answerIndex: 2, explanation: "Phủ định đúng: will not + V nguyên mẫu (come)." },
      { question: "\"I promise I ___ late again.\"", options: ["won't be", "am not being", "don't be", "not will be"], answerIndex: 0, explanation: "Lời hứa dùng Future Simple ở thể phủ định: won't + V(bare)." }
    ],
    summary: "Future Simple (will) dùng cho dự đoán chủ quan, quyết định tức thời, lời hứa. Sau \"will\" luôn là động từ nguyên mẫu."
  }),

  lesson({
    category: CATEGORY, lessonKey: "future-continuous", title: "Future Continuous", icon: "🌤️", orderIndex: 10,
    overview: "Future Continuous diễn tả một hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai, hoặc một sự việc đã được lên lịch chắc chắn sẽ diễn ra theo tiến trình bình thường.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + will + be + V-ing", example: "This time next week, I will be sitting in the exam room." },
      { label: "Phủ định (-)", structure: "S + will not + be + V-ing", example: "They will not be attending the ceremony." },
      { label: "Nghi vấn (?)", structure: "Will + S + be + V-ing?", example: "Will you be using the car tomorrow morning?" }
    ],
    usage: [
      { title: "Hành động đang diễn ra tại một thời điểm xác định trong tương lai", description: "At 8 p.m. tomorrow, I will be flying to London." },
      { title: "Sự việc chắc chắn sẽ diễn ra theo lịch trình bình thường", description: "The committee will be reviewing the proposal next week." }
    ],
    signalWords: ["at this time tomorrow", "this time next year", "by then", "at 9 o'clock tonight"],
    examples: [
      { en: "This time next month, sales figures will be showing a clear upward trend.", vi: "Vào thời điểm này tháng sau, số liệu bán hàng sẽ đang cho thấy xu hướng tăng rõ rệt." },
      { en: "I will not be working this weekend.", vi: "Tôi sẽ không làm việc vào cuối tuần này." },
      { en: "Will you be attending the conference next week?", vi: "Bạn có sẽ tham dự hội nghị tuần tới không?" },
      { en: "At 8 a.m. tomorrow, I will be catching a flight to Tokyo.", vi: "Vào lúc 8 giờ sáng mai, tôi sẽ đang bắt chuyến bay đến Tokyo." },
      { en: "This time next year, she will be running her own business.", vi: "Vào thời điểm này năm sau, cô ấy sẽ đang điều hành công ty riêng của mình." },
      { en: "They won't be using the office on Friday afternoon.", vi: "Họ sẽ không sử dụng văn phòng vào chiều thứ Sáu." },
      { en: "The committee will be reviewing all applications next week.", vi: "Ủy ban sẽ đang xem xét tất cả các đơn ứng tuyển vào tuần tới." },
      { en: "Will you be staying at the same hotel this time?", vi: "Bạn có sẽ ở cùng khách sạn lần này không?" },
      { en: "By this time tomorrow, the team will be presenting the results.", vi: "Vào thời điểm này ngày mai, đội ngũ sẽ đang trình bày kết quả." },
      { en: "I will be working from home for the rest of the week.", vi: "Tôi sẽ làm việc tại nhà trong suốt thời gian còn lại của tuần này." },
      { en: "This time next week, we will be relaxing on a beach in Da Nang.", vi: "Vào thời điểm này tuần sau, chúng tôi sẽ đang thư giãn trên bãi biển ở Đà Nẵng." }
    ],
    mistakes: [
      { wrong: "I will being here tomorrow.", right: "I will be here tomorrow.", note: "Nếu không có động từ chính thì chỉ cần \"will be\", không phải \"will being\"." },
      { wrong: "She will be works then.", right: "She will be working then.", note: "Sau \"will be\" cần V-ing, không phải V nguyên dạng." },
      { wrong: "They will be to travel next month.", right: "They will be traveling next month.", note: "Sau \"will be\" không có \"to\", cần V-ing trực tiếp." },
      { wrong: "Will you working at 9 tomorrow?", right: "Will you be working at 9 tomorrow?", note: "Thiếu \"be\" giữa \"will\" và V-ing." },
      { wrong: "He will not be sleep at midnight.", right: "He will not be sleeping at midnight.", note: "Sau \"be\" trong Future Continuous cần V-ing, không phải V nguyên mẫu." }
    ],
    tips: [
      "Ít gặp trong IELTS Writing nhưng có thể dùng trong Speaking Part 3 khi nói về kế hoạch/dự đoán dài hạn để tăng độ đa dạng ngữ pháp."
    ],
    comparison: {
      title: "Future Continuous vs Future Simple",
      headers: ["Future Continuous", "Future Simple"],
      rows: [["Đang diễn ra tại một thời điểm tương lai cụ thể", "Sẽ xảy ra/hoàn tất, không nhấn mạnh quá trình"], ["At 9 a.m., I will be traveling.", "I will travel tomorrow."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"At 10 p.m. tonight, I ___ on the plane.\"", options: ["will be", "will be being", "am being", "will being"], answerIndex: 0, explanation: "\"Will be\" + trạng từ chỉ nơi chốn diễn tả trạng thái đang diễn ra tại một thời điểm tương lai xác định." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She will be attend the seminar.", "She will attending the seminar.", "She will be attending the seminar.", "She will being attend the seminar."], answerIndex: 2, explanation: "Cấu trúc đúng: will + be + V-ing." },
      { type: "fill_blank", question: "Điền dạng đúng: \"This time next week, we (travel) ___ around Europe.\"", answer: "will be traveling", explanation: "Hành động sẽ đang diễn ra tại một thời điểm tương lai xác định → Future Continuous." },
      { type: "fill_blank", question: "Điền dạng đúng: \"They (not/use) ___ the meeting room tomorrow morning.\"", answer: "will not be using", explanation: "Phủ định Future Continuous: will not + be + V-ing." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"At noon, she will be has lunch with her client.\"", answer: "At noon, she will be having lunch with her client.", explanation: "Sau \"will be\" cần V-ing: having." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Will they be arrive by then?\"", answer: "Will they be arriving by then?", explanation: "Sau \"be\" trong câu hỏi Future Continuous cần V-ing: arriving." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Vào giờ này ngày mai, chúng tôi sẽ đang bay đến Singapore.\"", answer: "This time tomorrow, we will be flying to Singapore.", explanation: "Hành động đang diễn ra tại một thời điểm tương lai cụ thể → Future Continuous." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cô ấy sẽ không sử dụng phòng thí nghiệm vào thứ Hai.\"", answer: "She will not be using the laboratory on Monday.", explanation: "Phủ định Future Continuous: will not + be + V-ing." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"By 7 p.m., I will be cooking dinner for the whole family.\"", answer: "Đến 7 giờ tối, tôi sẽ đang nấu bữa tối cho cả gia đình.", explanation: "Future Continuous mô tả hành động đang diễn ra tại một mốc tương lai xác định." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Will you be joining us for the trip next month?\"", answer: "Bạn có sẽ tham gia chuyến đi cùng chúng tôi vào tháng sau không?", explanation: "Câu hỏi Future Continuous: Will + S + be + V-ing?" },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"He will be presenting the report at the meeting.\"", answer: "He will not be presenting the report at the meeting.", explanation: "Phủ định Future Continuous: will not + be + V-ing." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They will be waiting outside the gate.\"", answer: "Will they be waiting outside the gate?", explanation: "Đảo \"will\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"At 9 a.m., she will teaching a class.\"", answer: "At 9 a.m., she will be teaching a class.", explanation: "Thiếu \"be\" giữa \"will\" và V-ing." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"We will be meet the clients this time tomorrow.\"", answer: "We will be meeting the clients this time tomorrow.", explanation: "Sau \"will be\" cần V-ing: meeting." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"This time next year, he will be graduate from university.\"", answer: "Lỗi: \"will be graduate\" → sửa thành \"will be graduating\".", explanation: "Sau \"will be\" cần V-ing, không phải V nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"I no will be working tomorrow.\"", answer: "Lỗi: \"I no will be working\" → sửa thành \"I will not be working\".", explanation: "Phủ định đúng của \"will\" là \"will not\", không dùng \"no will\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What ___ you ___ (do) this time tomorrow?\nB: I ___ (fly) to Ho Chi Minh City for a conference.\nA: Safe travels!", answer: "will / be doing / will be flying", explanation: "Câu hỏi Future Continuous: What will + S + be + V-ing?; câu trả lời tương tự: will be flying." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ___ (use) the car this afternoon?\nB: No, I ___ (work) from home all day.\nA: Great, I'll borrow it then.", answer: "Will / be using / will be working", explanation: "Câu hỏi và câu trả lời đều dùng Future Continuous để nói về kế hoạch đang diễn ra tại một thời điểm tương lai." }
    ],
    quiz: [
      { question: "\"This time tomorrow, we ___ on the beach.\"", options: ["will lie", "will be lying", "are lying", "will have lain"], answerIndex: 1, explanation: "\"This time tomorrow\" + hành động đang diễn ra tại thời điểm đó → Future Continuous." },
      { question: "Chọn câu đúng:", options: ["He will being late.", "He will be late.", "He will be being late.", "He wills be late."], answerIndex: 1, explanation: "\"Late\" là tính từ, không cần V-ing → chỉ cần \"will be late\"." },
      { question: "\"At this time next week, she ___ her final exams.\"", options: ["will take", "will be taking", "takes", "is taking"], answerIndex: 1, explanation: "Hành động đang diễn ra tại một mốc tương lai xác định → Future Continuous." },
      { question: "Câu nào đúng?", options: ["They will be arrive at noon.", "They will be arriving at noon.", "They will arrive be at noon.", "They will arriving at noon."], answerIndex: 1, explanation: "Cấu trúc đúng: will + be + V-ing (arriving)." },
      { question: "\"___ you be using the projector this afternoon?\"", options: ["Do", "Are", "Will", "Did"], answerIndex: 2, explanation: "Câu hỏi Future Continuous dùng \"Will\" + S + be + V-ing?" }
    ],
    summary: "Future Continuous = hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai."
  }),

  lesson({
    category: CATEGORY, lessonKey: "future-perfect", title: "Future Perfect", icon: "🏁", orderIndex: 11,
    overview: "Future Perfect diễn tả một hành động sẽ HOÀN THÀNH trước một thời điểm/mốc cụ thể trong tương lai.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + will have + V3/-ed", example: "By 2035, the city will have built three new metro lines." },
      { label: "Phủ định (-)", structure: "S + will not have + V3", example: "They will not have finished the project by June." },
      { label: "Nghi vấn (?)", structure: "Will + S + have + V3?", example: "Will the population have doubled by then?" }
    ],
    usage: [
      { title: "Hành động sẽ hoàn thành trước một mốc tương lai xác định", description: "By the time you arrive, I will have cooked dinner." },
      { title: "Dự báo số liệu đã \"hoàn tất\" một mức độ nhất định tại mốc tương lai (Task 1)", description: "By 2050, renewable sources will have overtaken fossil fuels." }
    ],
    signalWords: ["by 2030", "by the time", "by then", "before", "in the next decade"],
    examples: [
      { en: "By 2040, emissions will have fallen by half, according to projections.", vi: "Đến năm 2040, theo dự báo, lượng khí thải sẽ đã giảm một nửa." },
      { en: "She will not have completed her degree by next year.", vi: "Cô ấy sẽ chưa hoàn thành bằng cấp vào năm sau." },
      { en: "Will the company have expanded to Asia by 2030?", vi: "Công ty có sẽ đã mở rộng sang châu Á vào năm 2030 không?" },
      { en: "By the time you read this letter, I will have left the country.", vi: "Vào lúc bạn đọc lá thư này, tôi sẽ đã rời khỏi đất nước." },
      { en: "They will have finished renovating the house by summer.", vi: "Họ sẽ đã hoàn thành việc cải tạo ngôi nhà trước mùa hè." },
      { en: "By the age of 30, he will have saved enough for a house.", vi: "Đến năm 30 tuổi, anh ấy sẽ đã tiết kiệm đủ tiền để mua nhà." },
      { en: "We will not have finished the audit by Friday.", vi: "Chúng tôi sẽ chưa hoàn thành việc kiểm toán trước thứ Sáu." },
      { en: "Will they have signed the contract before the deadline?", vi: "Họ có sẽ đã ký hợp đồng trước hạn chót không?" },
      { en: "By next month, the price will have increased by 10%.", vi: "Đến tháng sau, giá cả sẽ đã tăng 10%." },
      { en: "I will have graduated by the time she starts university.", vi: "Tôi sẽ đã tốt nghiệp trước khi cô ấy bắt đầu học đại học." },
      { en: "By 2050, scientists will have found a cure for many diseases.", vi: "Đến năm 2050, các nhà khoa học sẽ đã tìm ra cách chữa trị cho nhiều căn bệnh." }
    ],
    mistakes: [
      { wrong: "By 2030, they will finished the bridge.", right: "By 2030, they will have finished the bridge.", note: "Thiếu \"have\" trong cấu trúc will have + V3." },
      { wrong: "She will have finish it soon.", right: "She will have finished it soon.", note: "Sau \"will have\" cần V3, không phải V nguyên mẫu." },
      { wrong: "By next year, he will has completed the course.", right: "By next year, he will have completed the course.", note: "\"Will\" luôn đi với \"have\", không chia thành \"has\" theo chủ ngữ." },
      { wrong: "We will have wrote the report by tomorrow.", right: "We will have written the report by tomorrow.", note: "Future Perfect cần V3 (written), không dùng V2 (wrote)." },
      { wrong: "Will you finished the project by June?", right: "Will you have finished the project by June?", note: "Câu hỏi Future Perfect cần \"have\" giữa chủ ngữ và V3." }
    ],
    tips: [
      "Cấu trúc \"By + mốc tương lai, S will have + V3\" là điểm cộng lớn khi Task 1 yêu cầu dự đoán xu hướng đến một mốc xa trong tương lai."
    ],
    comparison: {
      title: "Future Perfect vs Future Simple",
      headers: ["Future Perfect", "Future Simple"],
      rows: [["Hoàn thành TRƯỚC một mốc tương lai", "Sẽ xảy ra, không nhấn mạnh đã xong hay chưa"], ["By 2030, it will have doubled.", "It will double by 2030."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"By the end of this year, sales ___ 20%.\"", options: ["will rise", "will have risen", "rise", "have risen"], answerIndex: 1, explanation: "\"By the end of this year\" + hoàn thành trước mốc đó → Future Perfect: will have risen." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She will has left by then.", "She will have left by then.", "She will leave by then already.", "She has will left by then."], answerIndex: 1, explanation: "\"Will\" luôn đi với \"have\", không chia thành \"has\"." },
      { type: "fill_blank", question: "Điền dạng đúng: \"By 2035, the city (build) ___ a new airport.\"", answer: "will have built", explanation: "Hoàn thành trước một mốc tương lai xác định → Future Perfect." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ they (finish) ___ the tests by tomorrow?\"", answer: "Will ... have finished", explanation: "Câu hỏi Future Perfect: Will + S + have + V3?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"By next week, I will have wrote the whole thesis.\"", answer: "By next week, I will have written the whole thesis.", explanation: "Future Perfect cần V3 (written), không dùng V2 (wrote)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They will have leave the office by 6 p.m.\"", answer: "They will have left the office by 6 p.m.", explanation: "Sau \"will have\" cần V3 (left), không phải V nguyên mẫu." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đến năm 2045, dân số thành phố sẽ đã vượt quá 10 triệu người.\"", answer: "By 2045, the city's population will have exceeded 10 million.", explanation: "Dự báo hoàn thành trước một mốc tương lai xa → Future Perfect." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi sẽ chưa hoàn thành dự án trước cuối tháng.\"", answer: "We will not have finished the project by the end of the month.", explanation: "Phủ định Future Perfect: will not have + V3." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"By the time she retires, she will have worked here for 30 years.\"", answer: "Vào lúc cô ấy nghỉ hưu, cô ấy sẽ đã làm việc ở đây được 30 năm.", explanation: "Future Perfect nhấn mạnh khoảng thời gian hoàn thành trước một mốc tương lai." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Will the technology have changed dramatically in ten years?\"", answer: "Công nghệ có sẽ đã thay đổi đáng kể trong mười năm nữa không?", explanation: "Câu hỏi Future Perfect: Will + S + have + V3?" },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"By June, they will have completed the merger.\"", answer: "By June, they will not have completed the merger.", explanation: "Phủ định Future Perfect: will not have + V3." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"She will have submitted her thesis by Monday.\"", answer: "Will she have submitted her thesis by Monday?", explanation: "Đảo \"will\" lên trước chủ ngữ, giữ \"have + V3\" phía sau." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"By 2028, the firm will have expand into new markets.\"", answer: "By 2028, the firm will have expanded into new markets.", explanation: "Future Perfect cần V3 (expanded), không dùng V nguyên mẫu." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"We will have ate dinner before you arrive.\"", answer: "We will have eaten dinner before you arrive.", explanation: "Future Perfect cần V3 (eaten), không dùng V2 (ate)." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"By next month, she will has finished her internship.\"", answer: "Lỗi: \"will has finished\" → sửa thành \"will have finished\".", explanation: "\"Will\" luôn kết hợp với \"have\", không chia thành \"has\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"They will have arrived before we will leave.\"", answer: "Lỗi: \"before we will leave\" → sửa thành \"before we leave\".", explanation: "Mệnh đề thời gian sau \"before\" trong câu tương lai không dùng \"will\", chỉ chia Present Simple." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ___ (finish) the report by Monday?\nB: Yes, I ___ (complete) it by Friday at the latest.\nA: Perfect, that gives us time to review it.", answer: "Will / have finished / will have completed", explanation: "Câu hỏi Future Perfect: Will + S + have + V3?; câu trả lời: will have + V3 (completed)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: How much progress will we have made by the end of the year?\nB: We ___ (launch) the new product by then.\nA: That sounds like a solid plan.", answer: "will have launched", explanation: "Future Perfect diễn tả một mốc hoàn thành cụ thể trong tương lai (by then)." }
    ],
    quiz: [
      { question: "\"By next year, she ___ her studies.\"", options: ["will finish", "will have finished", "will be finishing", "has finished"], answerIndex: 1, explanation: "\"By next year\" + hoàn thành trước mốc đó → Future Perfect." },
      { question: "Chọn câu đúng:", options: ["They will have arrive by 9pm.", "They will have arrived by 9pm.", "They will arrived by 9pm.", "They will having arrived by 9pm."], answerIndex: 1, explanation: "Cấu trúc đúng: will have + V3 (arrived)." },
      { question: "\"By the time the movie starts, we ___ dinner.\"", options: ["will finish", "will have finished", "finish", "are finishing"], answerIndex: 1, explanation: "Hoàn thành trước một mốc tương lai khác (movie starts) → Future Perfect." },
      { question: "Câu nào đúng?", options: ["He will has completed the course.", "He will have completed the course.", "He have will completed the course.", "He will completed the course."], answerIndex: 1, explanation: "\"Will\" không chia thành \"has\"; cấu trúc đúng: will have + V3." },
      { question: "\"___ the company have paid off its debt by 2030?\"", options: ["Do", "Did", "Will", "Is"], answerIndex: 2, explanation: "Câu hỏi Future Perfect: Will + S + have + V3?" }
    ],
    summary: "Future Perfect = hành động sẽ HOÀN THÀNH trước một mốc/thời điểm cụ thể trong tương lai (will have + V3)."
  }),

  lesson({
    category: CATEGORY, lessonKey: "be-going-to", title: "Be Going To", icon: "🎯", orderIndex: 12,
    overview: "\"Be going to\" diễn tả kế hoạch/dự định đã quyết định từ trước, hoặc dự đoán dựa trên bằng chứng/dấu hiệu rõ ràng ở hiện tại.",
    formula: [
      { label: "Khẳng định (+)", structure: "S + am/is/are + going to + V(bare)", example: "The government is going to raise the minimum wage next year." },
      { label: "Phủ định (-)", structure: "S + am/is/are + not + going to + V", example: "They are not going to attend the summit." },
      { label: "Nghi vấn (?)", structure: "Am/Is/Are + S + going to + V?", example: "Is the company going to expand overseas?" }
    ],
    usage: [
      { title: "Kế hoạch/dự định đã quyết định từ trước", description: "I am going to study abroad next year." },
      { title: "Dự đoán dựa trên bằng chứng/dấu hiệu rõ ràng hiện tại", description: "Look at those dark clouds — it is going to rain." }
    ],
    signalWords: ["look!", "plan to", "intend to", "be about to", "next week/month/year (đã có kế hoạch)"],
    examples: [
      { en: "Based on current trends, the figure is going to keep rising.", vi: "Dựa trên xu hướng hiện tại, con số này sẽ tiếp tục tăng." },
      { en: "We are not going to cancel the event.", vi: "Chúng tôi sẽ không hủy sự kiện." },
      { en: "Are they going to launch the new product this year?", vi: "Họ có định ra mắt sản phẩm mới năm nay không?" },
      { en: "I'm going to start a new job next Monday.", vi: "Tôi sắp bắt đầu công việc mới vào thứ Hai tới." },
      { en: "Watch out! That glass is going to fall off the table.", vi: "Coi chừng! Cái ly đó sắp rơi khỏi bàn rồi." },
      { en: "She isn't going to accept the job offer.", vi: "Cô ấy sẽ không nhận lời mời làm việc đó." },
      { en: "We are going to renovate the kitchen this summer.", vi: "Chúng tôi định sửa lại nhà bếp vào mùa hè này." },
      { en: "Is he going to apply for that scholarship?", vi: "Anh ấy có định nộp đơn xin học bổng đó không?" },
      { en: "Given the dark clouds, it's going to rain soon.", vi: "Với những đám mây đen kịt kia, trời sắp mưa rồi." },
      { en: "They are going to move to a bigger house next year.", vi: "Họ định chuyển đến một ngôi nhà lớn hơn vào năm sau." },
      { en: "I'm not going to give up on my dream.", vi: "Tôi sẽ không từ bỏ ước mơ của mình." }
    ],
    mistakes: [
      { wrong: "She is going to studies medicine.", right: "She is going to study medicine.", note: "Sau \"going to\" là V nguyên mẫu, không chia." },
      { wrong: "I going to leave now.", right: "I am going to leave now.", note: "Thiếu trợ động từ \"am/is/are\" trước \"going to\"." },
      { wrong: "They is going to visit us.", right: "They are going to visit us.", note: "Chủ ngữ số nhiều \"they\" cần dùng \"are\", không dùng \"is\"." },
      { wrong: "Is going to rain today?", right: "Is it going to rain today?", note: "Câu hỏi cần chủ ngữ giả \"it\" trước \"going to\" khi nói về thời tiết." },
      { wrong: "She not going to come to the party.", right: "She is not going to come to the party.", note: "Thiếu trợ động từ \"is\" trong câu phủ định." }
    ],
    tips: [
      "Dùng \"be going to\" khi dự đoán có căn cứ rõ ràng (số liệu, xu hướng hiện tại) — phù hợp hơn \"will\" khi phân tích biểu đồ Task 1 đã có dấu hiệu rõ trong dữ liệu."
    ],
    comparison: {
      title: "Be Going To vs Will",
      headers: ["Be Going To", "Will"],
      rows: [["Kế hoạch định trước / dự đoán có bằng chứng", "Quyết định tức thời / dự đoán chủ quan"], ["I'm going to visit her (đã lên kế hoạch).", "I'll visit her (quyết định ngay lúc nói)."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Look at those dark clouds! It ___ to storm.\"", options: ["will", "is going", "going", "is"], answerIndex: 1, explanation: "Dự đoán dựa trên bằng chứng rõ ràng hiện tại (dark clouds) → is going to storm." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["We is going to open a new branch.", "We going to open a new branch.", "We are going to open a new branch.", "We are going to opens a new branch."], answerIndex: 2, explanation: "Chủ ngữ số nhiều \"we\" dùng \"are\" + going to + V nguyên mẫu." },
      { type: "fill_blank", question: "Điền dạng đúng: \"He (not/take) ___ the job because the salary is too low.\"", answer: "isn't going to take", explanation: "Quyết định/kế hoạch đã định trước, phủ định: is/are + not + going to + V." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ you (visit) ___ your grandparents this weekend?\"", answer: "Are ... going to visit", explanation: "Câu hỏi \"be going to\": Am/Is/Are + S + going to + V?" },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"She going to start her own business.\"", answer: "She is going to start her own business.", explanation: "Thiếu trợ động từ \"is\" trước \"going to\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They are going to travels to Japan next month.\"", answer: "They are going to travel to Japan next month.", explanation: "Sau \"going to\" là V nguyên mẫu (travel), không chia thêm -s." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Dựa trên báo cáo tài chính, công ty sắp cắt giảm nhân sự.\"", answer: "Based on the financial report, the company is going to cut jobs.", explanation: "Dự đoán có căn cứ/bằng chứng rõ ràng → be going to." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Chúng tôi định chuyển văn phòng vào tháng tới.\"", answer: "We are going to move offices next month.", explanation: "Kế hoạch/dự định đã quyết định từ trước → be going to." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"She has already booked the venue — she's going to hold the wedding in June.\"", answer: "Cô ấy đã đặt địa điểm rồi — cô ấy định tổ chức đám cưới vào tháng Sáu.", explanation: "Kế hoạch có bằng chứng cụ thể (đã đặt địa điểm) → be going to." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Are they going to renovate the old building?\"", answer: "Họ có định cải tạo tòa nhà cũ không?", explanation: "Câu hỏi \"be going to\" về kế hoạch/dự định." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể phủ định: \"He is going to quit his job.\"", answer: "He is not going to quit his job.", explanation: "Phủ định \"be going to\": is/are/am + not + going to + V." },
      { type: "sentence_transformation", question: "Viết lại câu ở thể nghi vấn: \"They are going to sign the deal.\"", answer: "Are they going to sign the deal?", explanation: "Đảo \"are\" lên trước chủ ngữ để tạo câu hỏi." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I'm going to studies abroad next year.\"", answer: "I'm going to study abroad next year.", explanation: "Sau \"going to\" là V nguyên mẫu, không chia: study." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She going to attend the workshop tomorrow.\"", answer: "She is going to attend the workshop tomorrow.", explanation: "Thiếu trợ động từ \"is\" trước \"going to\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Based on the data, unemployment is going to rises next quarter.\"", answer: "Lỗi: \"is going to rises\" → sửa thành \"is going to rise\".", explanation: "Sau \"going to\" là V nguyên mẫu (rise), không chia thêm -s." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"We not going to attend the conference this year.\"", answer: "Lỗi: \"We not going to\" → sửa thành \"We are not going to\".", explanation: "Thiếu trợ động từ \"are\" trong câu phủ định." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: ___ you ___ (do) anything special this weekend?\nB: Yes, I ___ (visit) my parents in the countryside.\nA: That sounds lovely!", answer: "Are / going to do / am going to visit", explanation: "Câu hỏi và câu trả lời đều dùng \"be going to\" để nói về kế hoạch đã định trước." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why did you buy so much paint?\nB: We ___ (repaint) the whole house next week.\nA: That's a big project!", answer: "are going to repaint", explanation: "Bằng chứng rõ ràng (đã mua sơn) cho một kế hoạch định trước → be going to." }
    ],
    quiz: [
      { question: "\"She has bought a ticket. She ___ to Paris next week.\"", options: ["will go", "is going", "is going to go", "goes"], answerIndex: 2, explanation: "Đã mua vé = kế hoạch định trước → be going to." },
      { question: "Chọn câu đúng:", options: ["They are going to travels soon.", "They going to travel soon.", "They are going to travel soon.", "They is going to travel soon."], answerIndex: 2, explanation: "Cấu trúc đúng: are (số nhiều \"they\") + going to + V nguyên mẫu." },
      { question: "\"Look at the schedule! The train ___ to arrive at 6 p.m.\"", options: ["will", "is going", "going", "is"], answerIndex: 1, explanation: "Dự đoán dựa trên bằng chứng cụ thể (lịch trình) → be going to." },
      { question: "Câu nào đúng?", options: ["He isn't going to accepts the offer.", "He isn't going to accept the offer.", "He don't going to accept the offer.", "He not going to accept the offer."], answerIndex: 1, explanation: "Cấu trúc phủ định đúng: is/are + not + going to + V nguyên mẫu (accept)." },
      { question: "\"___ she going to apply for the scholarship?\"", options: ["Do", "Does", "Is", "Will"], answerIndex: 2, explanation: "Câu hỏi \"be going to\" dùng trợ động từ to be phù hợp với chủ ngữ: Is." }
    ],
    summary: "\"Be going to\" = kế hoạch đã định trước hoặc dự đoán có bằng chứng rõ ràng ở hiện tại."
  })
];
