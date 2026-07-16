"use strict";

const { lesson } = require("./builder");

const CATEGORY = "Conditionals";

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: "zero-conditional", title: "Zero Conditional", icon: "0️⃣", orderIndex: 13,
    overview: "Zero Conditional diễn tả sự thật hiển nhiên, quy luật khoa học, hoặc thói quen luôn đúng — kết quả luôn xảy ra khi điều kiện được đáp ứng.",
    formula: [
      { label: "Cấu trúc", structure: "If + S + V (hiện tại đơn), S + V (hiện tại đơn)", example: "If you heat ice, it melts." }
    ],
    usage: [
      { title: "Sự thật khoa học, quy luật tự nhiên", description: "If you mix blue and yellow, you get green." },
      { title: "Thói quen/quy tắc luôn đúng", description: "If it rains, the streets get flooded (ở khu vực đó)." }
    ],
    signalWords: ["if", "when (có thể thay thế if)", "whenever"],
    examples: [
      { en: "If the temperature drops below zero, water freezes.", vi: "Nếu nhiệt độ giảm xuống dưới 0 độ, nước đóng băng." },
      { en: "Plants die if they don't get enough sunlight.", vi: "Cây chết nếu không nhận đủ ánh sáng mặt trời." },
      { en: "When you press this button, the machine stops.", vi: "Khi bạn nhấn nút này, máy dừng lại." },
      { en: "If you don't eat, you feel hungry.", vi: "Nếu bạn không ăn, bạn cảm thấy đói." },
      { en: "Ice melts if you heat it.", vi: "Đá tan nếu bạn làm nóng nó." },
      { en: "If you touch fire, you get burned.", vi: "Nếu bạn chạm vào lửa, bạn bị bỏng." },
      { en: "Metal expands when it is heated.", vi: "Kim loại giãn nở khi bị nung nóng." },
      { en: "If children eat too much sugar, they often become hyperactive.", vi: "Nếu trẻ em ăn quá nhiều đường, chúng thường trở nên hiếu động thái quá." },
      { en: "Water boils when it reaches 100 degrees Celsius.", vi: "Nước sôi khi đạt tới 100 độ C." },
      { en: "If people don't get enough sleep, they feel tired the next day.", vi: "Nếu người ta không ngủ đủ giấc, họ cảm thấy mệt mỏi vào ngày hôm sau." },
      { en: "If you mix red and white paint, you get pink.", vi: "Nếu bạn trộn sơn đỏ và trắng, bạn được màu hồng." },
      { en: "Leaves change color when autumn comes.", vi: "Lá cây đổi màu khi mùa thu đến." }
    ],
    mistakes: [
      { wrong: "If you heat ice, it will melt.", right: "If you heat ice, it melts.", note: "Zero Conditional dùng hiện tại đơn ở CẢ HAI mệnh đề, không dùng \"will\"." },
      { wrong: "If people doesn't exercise, they gain weight.", right: "If people don't exercise, they gain weight.", note: "Chủ ngữ số nhiều \"people\" dùng trợ động từ \"don't\", không phải \"doesn't\"." },
      { wrong: "Ice melt when the temperature rises.", right: "Ice melts when the temperature rises.", note: "Động từ chính chia theo chủ ngữ số ít ngôi ba (ice) cần thêm \"-s\": melts." },
      { wrong: "If you don't stop now, you will get in trouble.", right: "If you don't stop now, you get in trouble.", note: "Khi diễn tả quy luật/hậu quả luôn đúng, mệnh đề kết quả của Zero Conditional dùng hiện tại đơn, không dùng \"will\"." },
      { wrong: "When she is tired, she will go to bed early.", right: "When she is tired, she goes to bed early.", note: "Thói quen luôn đúng dùng hiện tại đơn ở cả hai mệnh đề, kể cả khi thay \"if\" bằng \"when\"." }
    ],
    tips: [
      "Có thể thay \"if\" bằng \"when/whenever\" mà không đổi nghĩa vì đây là sự thật luôn đúng, không phải giả định."
    ],
    comparison: {
      title: "Zero vs First Conditional",
      headers: ["Zero Conditional", "First Conditional"],
      rows: [["Sự thật luôn đúng", "Tình huống có thể xảy ra trong tương lai"], ["If you heat water, it boils.", "If it rains, I will stay home."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"If water ___ 0°C, it freezes.\"", options: ["reach", "reaches", "will reach", "reached"], answerIndex: 1, explanation: "Chủ ngữ số ít \"water\" cần động từ thêm \"-s\": reaches." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["If you don't practice, you forget the skill.", "If you don't practice, you will forget the skill.", "If you won't practice, you forget the skill.", "If you don't practice, you forgot the skill."], answerIndex: 0, explanation: "Zero Conditional: cả hai vế đều chia hiện tại đơn." },
      { type: "fill_blank", question: "Điền động từ đúng: \"If you ___ (heat) sugar, it ___ (turn) into caramel.\"", answer: "heat; turns", explanation: "Cả hai mệnh đề chia hiện tại đơn; chủ ngữ \"it\" số ít nên \"turn\" thêm \"-s\"." },
      { type: "fill_blank", question: "Điền động từ đúng: \"Plants ___ (grow) faster if they ___ (get) enough water.\"", answer: "grow; get", explanation: "Cả hai vế của Zero Conditional chia hiện tại đơn theo chủ ngữ tương ứng." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If you touch a hot stove, you will get burned.\"", answer: "If you touch a hot stove, you get burned.", explanation: "Zero Conditional diễn tả sự thật luôn đúng, mệnh đề kết quả không dùng \"will\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If the sun sets, it get dark.\"", answer: "If the sun sets, it gets dark.", explanation: "Chủ ngữ số ít \"it\" cần động từ thêm \"-s\": gets." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu bạn đun sôi nước, nó bốc hơi.\"", answer: "If you boil water, it evaporates.", explanation: "Sự thật khoa học luôn đúng → Zero Conditional, cả hai vế chia hiện tại đơn." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Khi trẻ em mệt, chúng thường cáu kỉnh.\"", answer: "When children are tired, they usually get cranky.", explanation: "Thói quen luôn đúng có thể dùng \"when\" thay cho \"if\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If you don't switch off the lights, you waste electricity.\"", answer: "Nếu bạn không tắt đèn, bạn lãng phí điện.", explanation: "Câu diễn tả một sự thật/hậu quả luôn đúng." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Bread goes moldy if you leave it out too long.\"", answer: "Bánh mì bị mốc nếu bạn để nó bên ngoài quá lâu.", explanation: "Zero Conditional diễn tả một quy luật tự nhiên (thực phẩm hỏng)." },
      { type: "sentence_transformation", question: "Viết lại câu sau dùng \"when\" thay cho \"if\" mà không đổi nghĩa: \"If the temperature rises, snow melts.\"", answer: "When the temperature rises, snow melts.", explanation: "Với Zero Conditional, \"if\" và \"when\" có thể thay thế cho nhau vì đây là sự thật luôn đúng." },
      { type: "sentence_transformation", question: "Nối hai câu sau thành một câu Zero Conditional: \"You heat metal. It expands.\"", answer: "If you heat metal, it expands.", explanation: "Kết hợp hai câu đơn thành cấu trúc If + hiện tại đơn, hiện tại đơn." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng (diễn tả sự thật luôn đúng): \"If you drop a glass, it will break.\"", answer: "If you drop a glass, it breaks.", explanation: "Đây là sự thật vật lý luôn đúng nên dùng hiện tại đơn, không dùng \"will\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If babies is hungry, they cry.\"", answer: "If babies are hungry, they cry.", explanation: "Chủ ngữ số nhiều \"babies\" cần động từ \"are\", không phải \"is\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu (diễn tả sự thật chung): \"If you don't recycle, you will harm the environment.\"", answer: "Lỗi: \"will harm\" → sửa thành \"harm\" (bỏ will).", explanation: "Zero Conditional cho sự thật/hậu quả luôn đúng dùng hiện tại đơn ở mệnh đề kết quả." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"When the moon block the sun, we see an eclipse.\"", answer: "Lỗi: \"block\" → sửa thành \"blocks\".", explanation: "Chủ ngữ số ít \"the moon\" cần động từ thêm \"-s\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền dạng đúng của động từ):\nA: What happens if you ___ (mix) baking soda and vinegar?\nB: It ___ (fizz) and bubbles up immediately.\nA: That's a cool experiment!", answer: "mix; fizzes", explanation: "Zero Conditional: cả hai mệnh đề chia hiện tại đơn; chủ ngữ số ít \"it\" cần \"fizzes\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why do you always carry an umbrella?\nB: Well, if it ___ (rain) suddenly, I ___ (not/get) wet.\nA: That makes sense.", answer: "rains; don't get", explanation: "Cả hai vế Zero Conditional dùng hiện tại đơn; chủ ngữ \"I\" phủ định dùng \"don't\"." }
    ],
    quiz: [
      { question: "\"If you ___ this button, the light turns on.\"", options: ["press", "will press", "pressed", "are pressing"], answerIndex: 0, explanation: "Zero Conditional dùng hiện tại đơn ở cả 2 vế." },
      { question: "Chọn câu đúng:", options: ["If you don't water plants, they die.", "If you don't water plants, they will died.", "If you won't water plants, they die.", "If you don't water plants, they will dying."], answerIndex: 0, explanation: "Cả hai vế đều chia hiện tại đơn." },
      { question: "\"If you ___ hard, you usually succeed.\"", options: ["work", "will work", "worked", "are working"], answerIndex: 0, explanation: "Zero Conditional diễn tả quy luật chung nên dùng hiện tại đơn ở cả hai vế." },
      { question: "\"Metal ___ when it is heated.\"", options: ["expand", "expands", "will expand", "expanded"], answerIndex: 1, explanation: "Chủ ngữ số ít \"metal\" cần động từ thêm \"-s\": expands." },
      { question: "Chọn câu đúng:", options: ["If people doesn't sleep enough, they feel tired.", "If people don't sleep enough, they feel tired.", "If people won't sleep enough, they feel tired.", "If people don't sleep enough, they will feel tired."], answerIndex: 1, explanation: "Chủ ngữ số nhiều \"people\" dùng \"don't\"; cả hai vế chia hiện tại đơn." }
    ],
    summary: "Zero Conditional: If + hiện tại đơn, hiện tại đơn — diễn tả sự thật/quy luật luôn đúng."
  }),

  lesson({
    category: CATEGORY, lessonKey: "first-conditional", title: "First Conditional", icon: "1️⃣", orderIndex: 14,
    overview: "First Conditional diễn tả một tình huống có khả năng xảy ra trong tương lai và kết quả tương ứng nếu điều kiện đó xảy ra.",
    formula: [
      { label: "Cấu trúc", structure: "If + S + V (hiện tại đơn), S + will + V (bare)", example: "If the government invests in education, unemployment will decrease." }
    ],
    usage: [
      { title: "Tình huống có thể xảy ra trong tương lai gần", description: "If it rains tomorrow, we will cancel the picnic." },
      { title: "Đề xuất giải pháp trong Task 2 (nguyên nhân → kết quả)", description: "If more people use public transport, air pollution will reduce." }
    ],
    signalWords: ["if", "unless (= if...not)", "as long as", "provided that", "in case"],
    examples: [
      { en: "If the trend continues, the figure will exceed 50% by 2030.", vi: "Nếu xu hướng này tiếp tục, con số sẽ vượt 50% vào năm 2030." },
      { en: "Unless prices fall, demand will not increase.", vi: "Trừ khi giá giảm, nhu cầu sẽ không tăng." },
      { en: "If governments do not act now, pollution levels will keep rising.", vi: "Nếu chính phủ không hành động ngay, mức ô nhiễm sẽ tiếp tục tăng." },
      { en: "If you finish your homework early, you can watch TV.", vi: "Nếu bạn hoàn thành bài tập sớm, bạn có thể xem TV." },
      { en: "She will miss the flight if she doesn't hurry.", vi: "Cô ấy sẽ lỡ chuyến bay nếu không nhanh lên." },
      { en: "If it doesn't rain tomorrow, we will go hiking.", vi: "Nếu ngày mai trời không mưa, chúng tôi sẽ đi leo núi." },
      { en: "As long as you save regularly, you will build a comfortable retirement fund.", vi: "Miễn là bạn tiết kiệm đều đặn, bạn sẽ xây dựng được quỹ hưu trí thoải mái." },
      { en: "Provided that the flight is on time, we will arrive before noon.", vi: "Miễn là chuyến bay đúng giờ, chúng tôi sẽ đến trước buổi trưa." },
      { en: "If you don't apply for the scholarship, you will lose the opportunity.", vi: "Nếu bạn không nộp đơn xin học bổng, bạn sẽ mất cơ hội đó." },
      { en: "In case it gets cold tonight, I will bring an extra jacket.", vi: "Phòng khi tối nay trời lạnh, tôi sẽ mang thêm một chiếc áo khoác." },
      { en: "If the company cuts costs, it will remain profitable this year.", vi: "Nếu công ty cắt giảm chi phí, họ sẽ vẫn có lãi trong năm nay." },
      { en: "Unless you book in advance, you won't get a good seat.", vi: "Trừ khi bạn đặt trước, bạn sẽ không có được chỗ ngồi tốt." }
    ],
    mistakes: [
      { wrong: "If it will rain, I will stay home.", right: "If it rains, I will stay home.", note: "Không dùng \"will\" trong mệnh đề \"if\" của First Conditional — chỉ mệnh đề kết quả mới dùng \"will\"." },
      { wrong: "If I have time, I help you.", right: "If I have time, I will help you.", note: "Mệnh đề kết quả cần \"will\" để thể hiện tính tương lai/chắc chắn." },
      { wrong: "Unless you don't hurry, you will be late.", right: "Unless you hurry, you will be late.", note: "\"Unless\" đã mang nghĩa phủ định (= if...not), không thêm \"don't\" nữa." },
      { wrong: "If she will study harder, she will pass.", right: "If she studies harder, she will pass.", note: "Mệnh đề if không dùng \"will\"; động từ chia hiện tại đơn theo chủ ngữ (studies)." },
      { wrong: "If they will not finish on time, the client will complain.", right: "If they don't finish on time, the client will complain.", note: "Phủ định trong mệnh đề if của First Conditional dùng \"don't/doesn't\", không dùng \"will not\"." }
    ],
    tips: [
      "First Conditional là cấu trúc \"must-have\" cho Task 2 khi đề xuất giải pháp: \"If [giải pháp] is implemented, [kết quả tích cực] will follow.\"",
      "Có thể thay \"will\" bằng \"may/might/can\" để giảm mức độ chắc chắn khi kết quả không hoàn toàn hiển nhiên."
    ],
    comparison: {
      title: "First vs Second Conditional",
      headers: ["First Conditional", "Second Conditional"],
      rows: [["Có khả năng xảy ra thực tế", "Giả định không có thật/khó xảy ra"], ["If it rains, I will stay home.", "If I were rich, I would travel the world."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"If she ___ the exam, she will celebrate.\"", options: ["pass", "passes", "will pass", "passed"], answerIndex: 1, explanation: "Mệnh đề if của First Conditional chia hiện tại đơn: passes." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["Unless it rains, we go to the beach.", "Unless it rains, we will go to the beach.", "Unless it will rain, we will go to the beach.", "Unless it doesn't rain, we will go to the beach."], answerIndex: 1, explanation: "\"Unless\" = if...not; mệnh đề kết quả dùng \"will\"." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If you ___ (not/leave) now, you ___ (miss) the bus.\"", answer: "don't leave; will miss", explanation: "Mệnh đề if chia hiện tại đơn phủ định; mệnh đề kết quả dùng will." },
      { type: "fill_blank", question: "Điền dạng đúng: \"She ___ (be) upset if you ___ (forget) her birthday.\"", answer: "will be; forget", explanation: "Mệnh đề kết quả dùng will; mệnh đề if chia hiện tại đơn." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If I will see him, I will tell him.\"", answer: "If I see him, I will tell him.", explanation: "Mệnh đề if của First Conditional không dùng \"will\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Unless you don't apologize, she won't forgive you.\"", answer: "Unless you apologize, she won't forgive you.", explanation: "\"Unless\" đã mang nghĩa phủ định, không cần thêm \"don't\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu bạn không ôn tập, bạn sẽ trượt kỳ thi.\"", answer: "If you don't revise, you will fail the exam.", explanation: "Mệnh đề if phủ định chia hiện tại đơn (don't); mệnh đề kết quả dùng will." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Trừ khi trời mưa, chúng tôi sẽ chơi bóng đá vào Chủ nhật.\"", answer: "Unless it rains, we will play football on Sunday.", explanation: "\"Unless\" thay cho \"if...not\"; mệnh đề kết quả dùng will." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If the company invests in training, employees will become more productive.\"", answer: "Nếu công ty đầu tư vào đào tạo, nhân viên sẽ trở nên năng suất hơn.", explanation: "Câu diễn tả tình huống có khả năng xảy ra và kết quả trong tương lai." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"As long as you follow the instructions, the device will work properly.\"", answer: "Miễn là bạn làm theo hướng dẫn, thiết bị sẽ hoạt động bình thường.", explanation: "\"As long as\" đóng vai trò tương tự \"if\" trong First Conditional." },
      { type: "sentence_transformation", question: "Viết lại câu sau dùng \"unless\": \"If you don't wear a helmet, you might get hurt.\"", answer: "Unless you wear a helmet, you might get hurt.", explanation: "\"Unless\" thay thế cho \"if...not\" mà không đổi nghĩa." },
      { type: "sentence_transformation", question: "Nối hai câu sau thành một câu First Conditional: \"The weather improves. We will go camping.\"", answer: "If the weather improves, we will go camping.", explanation: "Kết hợp thành If + hiện tại đơn, will + V." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If it will be sunny tomorrow, we will have a picnic.\"", answer: "If it is sunny tomorrow, we will have a picnic.", explanation: "Mệnh đề if không dùng \"will\", chỉ chia hiện tại đơn." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If they invest more, unemployment reduce.\"", answer: "If they invest more, unemployment will reduce.", explanation: "Mệnh đề kết quả của First Conditional cần \"will\" để chỉ kết quả tương lai." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If she will arrive late, we will start without her.\"", answer: "Lỗi: \"will arrive\" → sửa thành \"arrives\".", explanation: "Mệnh đề if của First Conditional chia hiện tại đơn, không dùng \"will\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Provided that you pays on time, there will be no penalty.\"", answer: "Lỗi: \"pays\" → sửa thành \"pay\".", explanation: "Chủ ngữ \"you\" đi với động từ nguyên mẫu \"pay\", không thêm \"-s\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền dạng đúng của động từ):\nA: What will you do if it ___ (rain) during the match?\nB: If it rains, the referee ___ (postpone) the game.\nA: That makes sense.", answer: "rains; will postpone", explanation: "Mệnh đề if chia hiện tại đơn (rains); mệnh đề kết quả dùng will + V." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Are you ready for the interview tomorrow?\nB: Yes, if they ___ (ask) about my experience, I ___ (be) well prepared.\nA: Good luck!", answer: "ask; will be", explanation: "Mệnh đề if chia hiện tại đơn (ask); mệnh đề kết quả dùng will + V (will be)." }
    ],
    quiz: [
      { question: "\"If the policy ___ approved, prices will fall.\"", options: ["is", "will be", "was", "were"], answerIndex: 0, explanation: "Mệnh đề \"if\" của First Conditional chia hiện tại đơn." },
      { question: "Chọn câu đúng:", options: ["Unless you study, you will fail.", "Unless you don't study, you will fail.", "Unless you will study, you fail.", "Unless you study, you fail."], answerIndex: 0, explanation: "\"Unless\" = \"if...not\", đã mang nghĩa phủ định; mệnh đề kết quả dùng \"will\"." },
      { question: "\"If you ___ me the details, I will finish the report today.\"", options: ["send", "will send", "sent", "sending"], answerIndex: 0, explanation: "Mệnh đề if chia hiện tại đơn: send." },
      { question: "Chọn câu đúng:", options: ["If he doesn't apologize, she won't talk to him.", "If he don't apologize, she won't talk to him.", "If he won't apologize, she won't talk to him.", "If he doesn't apologizes, she won't talk to him."], answerIndex: 0, explanation: "Chủ ngữ \"he\" số ít dùng \"doesn't\"; mệnh đề kết quả dùng \"won't\"." },
      { question: "\"Provided that the data ___ accurate, the report will be reliable.\"", options: ["is", "will be", "was", "were"], answerIndex: 0, explanation: "\"Provided that\" hoạt động như \"if\", mệnh đề điều kiện chia hiện tại đơn." }
    ],
    summary: "First Conditional: If + hiện tại đơn, will + V — diễn tả tình huống có khả năng xảy ra và kết quả tương lai."
  }),

  lesson({
    category: CATEGORY, lessonKey: "second-conditional", title: "Second Conditional", icon: "2️⃣", orderIndex: 15,
    overview: "Second Conditional diễn tả một tình huống giả định không có thật hoặc khó xảy ra ở hiện tại/tương lai, cùng kết quả giả định tương ứng.",
    formula: [
      { label: "Cấu trúc", structure: "If + S + V-ed (quá khứ đơn), S + would + V (bare)", example: "If I were the mayor, I would ban private cars in the city centre." }
    ],
    usage: [
      { title: "Giả định trái với thực tế hiện tại", description: "If I had more money, I would buy a house (thực tế tôi không có nhiều tiền)." },
      { title: "Đưa ra ý kiến/khuyến nghị mang tính giả thuyết trong Task 2", description: "If governments invested more in public transport, congestion would decrease." }
    ],
    signalWords: ["if", "were (dùng cho mọi ngôi, kể cả I/he/she trong văn phong trang trọng)", "would/could/might"],
    examples: [
      { en: "If I were a policymaker, I would prioritize renewable energy.", vi: "Nếu tôi là nhà hoạch định chính sách, tôi sẽ ưu tiên năng lượng tái tạo." },
      { en: "If schools taught financial literacy, students would manage money better.", vi: "Nếu trường học dạy kiến thức tài chính, học sinh sẽ quản lý tiền tốt hơn." },
      { en: "What would you do if you won the lottery?", vi: "Bạn sẽ làm gì nếu trúng số?" },
      { en: "If I had a car, I would drive to work instead of taking the bus.", vi: "Nếu tôi có xe hơi, tôi sẽ lái xe đi làm thay vì đi xe buýt." },
      { en: "If she spoke Spanish, she could work in South America.", vi: "Nếu cô ấy biết nói tiếng Tây Ban Nha, cô ấy có thể làm việc ở Nam Mỹ." },
      { en: "We would save more time if we lived closer to the office.", vi: "Chúng tôi sẽ tiết kiệm được nhiều thời gian hơn nếu sống gần văn phòng hơn." },
      { en: "If people recycled more, there would be less waste in landfills.", vi: "Nếu người ta tái chế nhiều hơn, sẽ có ít rác thải hơn ở các bãi rác." },
      { en: "If I were in your position, I would ask for a pay rise.", vi: "Nếu tôi ở vị trí của bạn, tôi sẽ đề nghị tăng lương." },
      { en: "If the government reduced taxes, small businesses would grow faster.", vi: "Nếu chính phủ giảm thuế, các doanh nghiệp nhỏ sẽ phát triển nhanh hơn." },
      { en: "If he weren't so lazy, he would find a job easily.", vi: "Nếu anh ấy không lười biếng như vậy, anh ấy sẽ dễ dàng tìm được việc làm." },
      { en: "I would travel around the world if I had unlimited money.", vi: "Tôi sẽ đi du lịch khắp thế giới nếu có tiền không giới hạn." },
      { en: "If cities invested more in cycling paths, fewer people would drive cars.", vi: "Nếu các thành phố đầu tư nhiều hơn vào làn đường xe đạp, sẽ có ít người lái ô tô hơn." }
    ],
    mistakes: [
      { wrong: "If I was you, I would accept the offer.", right: "If I were you, I would accept the offer.", note: "Trong văn phong trang trọng/IELTS, dùng \"were\" cho mọi chủ ngữ (kể cả I/he/she), không dùng \"was\"." },
      { wrong: "If I had more time, I will travel more.", right: "If I had more time, I would travel more.", note: "Mệnh đề kết quả của Second Conditional dùng \"would\", không dùng \"will\"." },
      { wrong: "If she has more confidence, she would speak up.", right: "If she had more confidence, she would speak up.", note: "Mệnh đề if của Second Conditional chia quá khứ đơn (had), không chia hiện tại đơn." },
      { wrong: "If I would be rich, I would buy a house.", right: "If I were rich, I would buy a house.", note: "Mệnh đề if KHÔNG dùng \"would\" — chỉ mệnh đề kết quả mới dùng \"would\"." },
      { wrong: "If they lived nearer, they will visit us more often.", right: "If they lived nearer, they would visit us more often.", note: "Mệnh đề kết quả của Second Conditional dùng \"would\", không dùng \"will\"." }
    ],
    tips: [
      "Second Conditional giúp bài Task 2 thể hiện quan điểm một cách khiêm tốn, mang tính giả thuyết thay vì khẳng định chắc chắn.",
      "Luôn dùng \"were\" thay vì \"was\" sau \"if I/he/she/it\" để đạt điểm Grammar cao hơn."
    ],
    comparison: {
      title: "Second vs Third Conditional",
      headers: ["Second Conditional", "Third Conditional"],
      rows: [["Giả định không có thật ở hiện tại", "Giả định không có thật ở quá khứ (đã qua)"], ["If I were rich, I would travel.", "If I had studied harder, I would have passed."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"If I ___ you, I would take the job offer.\"", options: ["am", "was", "were", "will be"], answerIndex: 2, explanation: "Second Conditional dùng \"were\" cho mọi chủ ngữ, kể cả \"I\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["If she had a bike, she would cycle to work.", "If she has a bike, she would cycle to work.", "If she had a bike, she will cycle to work.", "If she would have a bike, she would cycle to work."], answerIndex: 0, explanation: "Mệnh đề if chia quá khứ đơn (had); mệnh đề kết quả dùng would." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If they ___ (live) in the city, they ___ (not/need) a car.\"", answer: "lived; wouldn't need", explanation: "Mệnh đề if chia quá khứ đơn; mệnh đề kết quả dùng would + not." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If I ___ (be) the manager, I ___ (change) the working hours.\"", answer: "were; would change", explanation: "Dùng \"were\" cho mọi chủ ngữ trong Second Conditional; mệnh đề kết quả dùng would." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If I would win the competition, I would be so happy.\"", answer: "If I won the competition, I would be so happy.", explanation: "Mệnh đề if không dùng \"would\", chỉ chia quá khứ đơn (won)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If he was more patient, he would succeed.\"", answer: "If he were more patient, he would succeed.", explanation: "Văn phong trang trọng dùng \"were\" cho mọi ngôi, không dùng \"was\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu tôi là bạn, tôi sẽ không từ chối lời đề nghị đó.\"", answer: "If I were you, I wouldn't refuse that offer.", explanation: "Dùng \"were\" sau \"if I\"; mệnh đề kết quả dùng \"wouldn't\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu chính phủ đầu tư nhiều hơn vào giáo dục, tỷ lệ thất nghiệp sẽ giảm.\"", answer: "If the government invested more in education, the unemployment rate would fall.", explanation: "Mệnh đề if chia quá khứ đơn (invested); mệnh đề kết quả dùng would." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If I had more free time, I would learn a new language.\"", answer: "Nếu tôi có nhiều thời gian rảnh hơn, tôi sẽ học một ngôn ngữ mới.", explanation: "Câu diễn tả giả định trái với thực tế hiện tại." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"What would you say if your boss asked you to work overtime?\"", answer: "Bạn sẽ nói gì nếu sếp của bạn yêu cầu bạn làm thêm giờ?", explanation: "Second Conditional dùng để hỏi về một tình huống giả định." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Second Conditional: \"I don't have enough money, so I can't buy a new laptop.\"", answer: "If I had enough money, I would buy a new laptop.", explanation: "Chuyển sự thật phủ định ở hiện tại thành giả định trái ngược với Second Conditional." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Second Conditional: \"She isn't confident, so she doesn't apply for the job.\"", answer: "If she were confident, she would apply for the job.", explanation: "Chuyển thực tế hiện tại thành giả định không có thật với \"were\" và \"would\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If I was rich, I would help poor people.\"", answer: "If I were rich, I would help poor people.", explanation: "Văn phong trang trọng của Second Conditional dùng \"were\", không dùng \"was\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If we work together, we would finish faster.\"", answer: "If we worked together, we would finish faster.", explanation: "Mệnh đề if của Second Conditional cần chia quá khứ đơn (worked), không phải hiện tại đơn." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If she would study harder, she would get better grades.\"", answer: "Lỗi: \"would study\" → sửa thành \"studied\".", explanation: "Mệnh đề if của Second Conditional không dùng \"would\", chỉ chia quá khứ đơn." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If I had wings, I will fly everywhere.\"", answer: "Lỗi: \"will fly\" → sửa thành \"would fly\".", explanation: "Mệnh đề kết quả của Second Conditional dùng \"would\", không dùng \"will\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền dạng đúng của động từ):\nA: What would you do if you ___ (find) a wallet full of cash on the street?\nB: If I ___ (find) it, I would take it to the police station.\nA: That's very honest of you.", answer: "found; found", explanation: "Second Conditional: mệnh đề if và câu trả lời đều chia quá khứ đơn (found)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: If you ___ (can) speak any language fluently, which one would you choose?\nB: I ___ (choose) Japanese, I think.\nA: Interesting choice!", answer: "could; would choose", explanation: "Mệnh đề if dùng \"could\" (dạng quá khứ của can); mệnh đề kết quả dùng would + V." }
    ],
    quiz: [
      { question: "\"If she ___ the truth, she would tell us.\"", options: ["knows", "knew", "had known", "will know"], answerIndex: 1, explanation: "Second Conditional: mệnh đề if chia quá khứ đơn (knew)." },
      { question: "Chọn câu đúng:", options: ["If I was you, I would apologize.", "If I were you, I would apologize.", "If I am you, I would apologize.", "If I were you, I will apologize."], answerIndex: 1, explanation: "Dùng \"were\" cho mọi ngôi và \"would\" ở mệnh đề kết quả." },
      { question: "\"If he ___ harder, he would pass the exam.\"", options: ["studies", "studied", "will study", "had studied"], answerIndex: 1, explanation: "Mệnh đề if của Second Conditional chia quá khứ đơn (studied)." },
      { question: "Chọn câu đúng:", options: ["If they had more staff, they would finish on time.", "If they have more staff, they would finish on time.", "If they had more staff, they will finish on time.", "If they would have more staff, they would finish on time."], answerIndex: 0, explanation: "Mệnh đề if chia quá khứ đơn (had); mệnh đề kết quả dùng would." },
      { question: "\"What ___ you do if you lost your job?\"", options: ["will", "would", "do", "did"], answerIndex: 1, explanation: "Second Conditional dùng \"would\" trong mệnh đề kết quả/câu hỏi giả định." }
    ],
    summary: "Second Conditional: If + quá khứ đơn (were), would + V — diễn tả giả định không có thật ở hiện tại."
  }),

  lesson({
    category: CATEGORY, lessonKey: "third-conditional", title: "Third Conditional", icon: "3️⃣", orderIndex: 16,
    overview: "Third Conditional diễn tả một tình huống giả định KHÔNG CÓ THẬT trong quá khứ và kết quả giả định tương ứng cũng đã không xảy ra — thường dùng để bày tỏ sự tiếc nuối hoặc phân tích nguyên nhân đã qua.",
    formula: [
      { label: "Cấu trúc", structure: "If + S + had + V3 (quá khứ hoàn thành), S + would have + V3", example: "If the government had acted sooner, the crisis would have been avoided." }
    ],
    usage: [
      { title: "Giả định trái với sự thật đã xảy ra trong quá khứ, thể hiện tiếc nuối", description: "If I had studied harder, I would have passed the exam." },
      { title: "Phân tích nguyên nhân-kết quả của một sự kiện lịch sử/quá khứ (Task 2)", description: "If more investment had been made in public health, the outbreak would not have spread so quickly." }
    ],
    signalWords: ["if + had + V3", "would have + V3", "if only (diễn tả tiếc nuối)"],
    examples: [
      { en: "If the company had invested in technology earlier, it would have remained competitive.", vi: "Nếu công ty đã đầu tư vào công nghệ sớm hơn, họ đã có thể duy trì tính cạnh tranh." },
      { en: "She would not have missed the flight if she had left earlier.", vi: "Cô ấy đã không lỡ chuyến bay nếu đã rời đi sớm hơn." },
      { en: "Would the outcome have been different if they had cooperated?", vi: "Kết quả có sẽ khác đi nếu họ đã hợp tác không?" },
      { en: "If I had known about the traffic, I would have left home earlier.", vi: "Nếu tôi đã biết về tình trạng kẹt xe, tôi đã rời nhà sớm hơn." },
      { en: "If he had saved his money, he wouldn't have gone bankrupt.", vi: "Nếu anh ấy đã tiết kiệm tiền, anh ấy đã không bị phá sản." },
      { en: "We would have won the match if our best player hadn't been injured.", vi: "Chúng tôi đã có thể thắng trận đấu nếu cầu thủ giỏi nhất của chúng tôi không bị chấn thương." },
      { en: "If they had listened to the warnings, the disaster could have been prevented.", vi: "Nếu họ đã lắng nghe những cảnh báo, thảm họa đã có thể được ngăn chặn." },
      { en: "If only I had studied medicine, I would have become a doctor.", vi: "Giá như tôi đã học y khoa, tôi đã trở thành một bác sĩ." },
      { en: "She would have gotten the promotion if she had applied earlier.", vi: "Cô ấy đã có thể được thăng chức nếu đã nộp đơn sớm hơn." },
      { en: "If the government had funded the research, the vaccine would have been developed sooner.", vi: "Nếu chính phủ đã tài trợ cho nghiên cứu, vắc-xin đã có thể được phát triển sớm hơn." },
      { en: "If I hadn't taken that wrong turn, I wouldn't have been late for the meeting.", vi: "Nếu tôi đã không rẽ nhầm đường, tôi đã không bị trễ cuộc họp." },
      { en: "Had they invested earlier, they would have made a huge profit.", vi: "Nếu họ đã đầu tư sớm hơn, họ đã kiếm được một khoản lợi nhuận khổng lồ." }
    ],
    mistakes: [
      { wrong: "If I would have known, I would have helped.", right: "If I had known, I would have helped.", note: "Mệnh đề \"if\" của Third Conditional KHÔNG dùng \"would have\" — chỉ dùng \"had + V3\"." },
      { wrong: "If she had study, she would have passed.", right: "If she had studied, she would have passed.", note: "Sau \"had\", động từ phải chia dạng V3 (studied), không phải nguyên mẫu." },
      { wrong: "If they had arrived on time, they will have caught the show.", right: "If they had arrived on time, they would have caught the show.", note: "Mệnh đề kết quả của Third Conditional dùng \"would have + V3\", không dùng \"will have\"." },
      { wrong: "If I had more money then, I would buy a house.", right: "If I had had more money then, I would have bought a house.", note: "Diễn tả giả định quá khứ hoàn toàn (kết quả cũng ở quá khứ) cần \"had + V3\" và \"would have + V3\" ở cả hai vế." },
      { wrong: "She wouldn't have failed if she had studies harder.", right: "She wouldn't have failed if she had studied harder.", note: "Sau \"had\" trong mệnh đề if, động từ chia V3 (studied), không thêm \"-s\" như hiện tại đơn." }
    ],
    tips: [
      "Third Conditional thể hiện khả năng phân tích nguyên nhân-kết quả sâu sắc trong quá khứ — điểm cộng lớn cho Task 2 band 7+.",
      "\"If only + had + V3\" là cách diễn đạt sự tiếc nuối rất tự nhiên, có thể dùng trong Speaking."
    ],
    comparison: {
      title: "Third Conditional vs Mixed Conditional",
      headers: ["Third Conditional", "Mixed Conditional"],
      rows: [["Điều kiện quá khứ → kết quả quá khứ", "Điều kiện quá khứ → kết quả hiện tại (hoặc ngược lại)"], ["If I had studied, I would have passed.", "If I had studied, I would be a doctor now."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"If we ___ more carefully, we wouldn't have made that mistake.\"", options: ["plan", "planned", "had planned", "have planned"], answerIndex: 2, explanation: "Mệnh đề if của Third Conditional dùng \"had + V3\": had planned." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["If he had trained harder, he would win the race.", "If he had trained harder, he would have won the race.", "If he trained harder, he would have won the race.", "If he had trained harder, he will have won the race."], answerIndex: 1, explanation: "Cấu trúc đúng: if + had + V3, would have + V3." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If she ___ (know) about the meeting, she ___ (attend) it.\"", answer: "had known; would have attended", explanation: "Mệnh đề if dùng had + V3; mệnh đề kết quả dùng would have + V3." },
      { type: "fill_blank", question: "Điền dạng đúng: \"We ___ (not/lose) the contract if we ___ (submit) the proposal on time.\"", answer: "wouldn't have lost; had submitted", explanation: "Kết quả phủ định dùng wouldn't have + V3; mệnh đề if dùng had + V3." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If you would have told me, I would have come.\"", answer: "If you had told me, I would have come.", explanation: "Mệnh đề if không dùng \"would have\", chỉ dùng \"had + V3\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If they had left earlier, they would arrived on time.\"", answer: "If they had left earlier, they would have arrived on time.", explanation: "Mệnh đề kết quả cần \"would have + V3\" (arrived), không phải \"would arrived\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu tôi đã biết trước, tôi đã không mắc phải sai lầm đó.\"", answer: "If I had known in advance, I wouldn't have made that mistake.", explanation: "Mệnh đề if dùng had + V3; mệnh đề kết quả dùng wouldn't have + V3." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu họ đã hành động sớm hơn, họ đã có thể cứu được công ty.\"", answer: "If they had acted sooner, they could have saved the company.", explanation: "\"Could have + V3\" diễn tả khả năng đã có thể xảy ra trong quá khứ." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If the manager had communicated more clearly, the project wouldn't have failed.\"", answer: "Nếu người quản lý đã giao tiếp rõ ràng hơn, dự án đã không thất bại.", explanation: "Câu diễn tả một giả định trái với quá khứ và hậu quả tương ứng." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If only she had listened to her doctor's advice.\"", answer: "Giá như cô ấy đã nghe theo lời khuyên của bác sĩ.", explanation: "\"If only + had + V3\" diễn tả sự tiếc nuối về quá khứ." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Third Conditional: \"He didn't wear a seatbelt, so he was seriously injured.\"", answer: "If he had worn a seatbelt, he wouldn't have been seriously injured.", explanation: "Chuyển sự thật đã xảy ra ở quá khứ thành giả định trái ngược (Third Conditional)." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Third Conditional: \"They didn't back up the files, so they lost all the data.\"", answer: "If they had backed up the files, they wouldn't have lost all the data.", explanation: "Chuyển nguyên nhân-kết quả thực tế trong quá khứ thành cấu trúc Third Conditional." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If I had more time yesterday, I would have finished the report.\"", answer: "If I had had more time yesterday, I would have finished the report.", explanation: "Mệnh đề if diễn tả giả định quá khứ cần \"had + V3\" (had had), không chỉ \"had\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"She would have passed if she try harder.\"", answer: "She would have passed if she had tried harder.", explanation: "Mệnh đề if của Third Conditional cần \"had + V3\" (had tried)." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If he had asked for help, he would solved the problem.\"", answer: "Lỗi: \"would solved\" → sửa thành \"would have solved\".", explanation: "Mệnh đề kết quả của Third Conditional cần \"would have + V3\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If we had book the tickets earlier, we would have gotten a discount.\"", answer: "Lỗi: \"had book\" → sửa thành \"had booked\".", explanation: "Sau \"had\" trong mệnh đề if, động từ phải chia dạng V3 (booked)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền dạng đúng của động từ):\nA: Why weren't you at the party last night?\nB: If I ___ (know) about it earlier, I ___ (come) for sure.\nA: That's a shame, we missed you.", answer: "had known; would have come", explanation: "Third Conditional: mệnh đề if dùng had + V3; mệnh đề kết quả dùng would have + V3." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: The team lost the final match yesterday.\nB: If their captain ___ (not/get) injured, they ___ (win) easily.\nA: Yes, that injury really changed everything.", answer: "hadn't gotten; would have won", explanation: "Mệnh đề if phủ định dùng hadn't + V3; mệnh đề kết quả dùng would have + V3." }
    ],
    quiz: [
      { question: "\"If they ___ earlier, they would have caught the train.\"", options: ["leave", "left", "had left", "have left"], answerIndex: 2, explanation: "Mệnh đề if của Third Conditional dùng \"had + V3\"." },
      { question: "Chọn câu đúng:", options: ["If I had known, I would have called you.", "If I would have known, I would have called you.", "If I have known, I would have called you.", "If I had known, I would call you."], answerIndex: 0, explanation: "Cấu trúc đúng: if + had + V3, would have + V3." },
      { question: "\"If she ___ harder, she would have gotten the promotion.\"", options: ["works", "worked", "had worked", "has worked"], answerIndex: 2, explanation: "Mệnh đề if của Third Conditional dùng \"had + V3\" (had worked)." },
      { question: "Chọn câu đúng:", options: ["If we had left sooner, we would avoided the traffic.", "If we had left sooner, we would have avoided the traffic.", "If we left sooner, we would have avoided the traffic.", "If we had left sooner, we will have avoided the traffic."], answerIndex: 1, explanation: "Mệnh đề kết quả cần đầy đủ \"would have + V3\" (would have avoided)." },
      { question: "\"___ he studied law, he would have become a lawyer.\"", options: ["If", "Had", "Unless", "When"], answerIndex: 1, explanation: "Đảo ngữ Third Conditional: \"Had + S + V3\" thay cho \"If + S + had + V3\"." }
    ],
    summary: "Third Conditional: If + had + V3, would have + V3 — diễn tả giả định trái với quá khứ, thường thể hiện tiếc nuối hoặc phân tích nguyên nhân-kết quả đã qua."
  }),

  lesson({
    category: CATEGORY, lessonKey: "mixed-conditional", title: "Mixed Conditional", icon: "🔀", orderIndex: 17,
    overview: "Mixed Conditional kết hợp hai mốc thời gian khác nhau: điều kiện ở quá khứ nhưng kết quả ảnh hưởng đến hiện tại (hoặc ngược lại) — giúp diễn đạt mối liên hệ phức tạp giữa quá khứ và hiện tại.",
    formula: [
      { label: "Quá khứ → Hiện tại", structure: "If + S + had + V3, S + would + V (bare) (+ now)", example: "If she had taken that job, she would be living in London now." },
      { label: "Hiện tại → Quá khứ", structure: "If + S + V-ed (quá khứ đơn), S + would have + V3", example: "If he were more careful, he would not have made that mistake." }
    ],
    usage: [
      { title: "Điều kiện giả định quá khứ dẫn đến kết quả giả định ở hiện tại", description: "If I had saved money then, I would be financially secure now." },
      { title: "Đặc điểm/tính cách hiện tại dẫn đến hành động giả định trong quá khứ", description: "If she weren't so shy, she would have spoken up at the meeting." }
    ],
    signalWords: ["now (tín hiệu kết quả hiện tại)", "then (tín hiệu điều kiện quá khứ)"],
    examples: [
      { en: "If the company had adapted to digital trends earlier, it would still be a market leader today.", vi: "Nếu công ty đã thích nghi với xu hướng số hóa sớm hơn, hiện tại họ vẫn sẽ là người dẫn đầu thị trường." },
      { en: "If he weren't so stubborn, he would have accepted the advice.", vi: "Nếu anh ấy không cứng đầu như vậy, anh ấy đã chấp nhận lời khuyên." },
      { en: "Would things be different now if that policy had passed?", vi: "Mọi thứ có khác đi ở hiện tại không nếu chính sách đó đã được thông qua?" },
      { en: "If I hadn't missed the flight, I would be in Paris right now.", vi: "Nếu tôi đã không lỡ chuyến bay, giờ này tôi đã đang ở Paris." },
      { en: "If she were more organized, she wouldn't have forgotten the appointment.", vi: "Nếu cô ấy ngăn nắp hơn, cô ấy đã không quên buổi hẹn." },
      { en: "If they had chosen a different career path, they would be much happier now.", vi: "Nếu họ đã chọn một con đường sự nghiệp khác, hiện tại họ sẽ hạnh phúc hơn nhiều." },
      { en: "If he weren't so shy, he would have introduced himself at the conference.", vi: "Nếu anh ấy không nhút nhát như vậy, anh ấy đã tự giới thiệu bản thân tại hội nghị." },
      { en: "If I had learned to swim as a child, I wouldn't be afraid of water now.", vi: "Nếu tôi đã học bơi từ nhỏ, giờ tôi sẽ không sợ nước." },
      { en: "If you weren't so careless, you wouldn't have lost your passport.", vi: "Nếu bạn không bất cẩn như vậy, bạn đã không làm mất hộ chiếu." },
      { en: "If the team had trained harder last year, they would be champions now.", vi: "Nếu đội đã tập luyện chăm chỉ hơn năm ngoái, hiện tại họ đã là nhà vô địch." },
      { en: "If she weren't so talented, she wouldn't have won the scholarship.", vi: "Nếu cô ấy không tài năng như vậy, cô ấy đã không giành được học bổng." },
      { en: "If we had bought that house, we would be living in the countryside now.", vi: "Nếu chúng tôi đã mua căn nhà đó, giờ chúng tôi đã đang sống ở vùng nông thôn." }
    ],
    mistakes: [
      { wrong: "If I had studied medicine, I would have been a doctor now.", right: "If I had studied medicine, I would be a doctor now.", note: "Khi kết quả là ở HIỆN TẠI, mệnh đề kết quả chỉ dùng \"would + V (bare)\", không dùng \"would have + V3\"." },
      { wrong: "If she was more confident, she would have gotten the job.", right: "If she were more confident, she would have gotten the job.", note: "Mệnh đề if diễn tả đặc điểm hiện tại dùng \"were\", không dùng \"was\"." },
      { wrong: "If he wasn't so lazy, he would have finished the project by now.", right: "If he weren't so lazy, he would have finished the project by now.", note: "Đặc điểm/tính cách hiện tại trong mệnh đề if dùng \"weren't\", không dùng \"wasn't\"." },
      { wrong: "If they had left earlier, they would arriving by now.", right: "If they had left earlier, they would be arriving by now.", note: "Kết quả ở hiện tại cần \"would + be + V-ing\" hoặc \"would + V (bare)\", không thể bỏ \"be\"." },
      { wrong: "If I would be taller, I would have played basketball professionally.", right: "If I were taller, I would have played basketball professionally.", note: "Mệnh đề if diễn tả đặc điểm hiện tại không dùng \"would be\", chỉ dùng \"were\"." }
    ],
    tips: [
      "Mixed Conditional là cấu trúc nâng cao, phù hợp để gây ấn tượng ở Speaking Part 3 hoặc Task 2 band 8+ — nhưng cần dùng chính xác, tránh lạm dụng khi không tự tin."
    ],
    comparison: {
      title: "Mixed Conditional vs Third Conditional",
      headers: ["Mixed Conditional", "Third Conditional"],
      rows: [["Hai mốc thời gian khác nhau (quá khứ + hiện tại)", "Cùng một mốc thời gian (quá khứ + quá khứ)"], ["If I had studied, I would be a doctor now.", "If I had studied, I would have passed then."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"If she had accepted that job offer, she ___ in London now.\"", options: ["would live", "would have lived", "lives", "will live"], answerIndex: 0, explanation: "Kết quả ở hiện tại (\"now\") → would + V (bare), không dùng \"would have + V3\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["If he wasn't so careless, he would have broken the vase.", "If he weren't so careless, he would have broken the vase.", "If he weren't so careless, he wouldn't have broken the vase.", "If he wasn't so careless, he wouldn't have broken the vase."], answerIndex: 2, explanation: "Đặc điểm hiện tại dùng \"weren't\"; kết quả (đã không xảy ra) dùng \"wouldn't have + V3\"." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If I ___ (take) that course last year, I ___ (have) the skills for this job now.\"", answer: "had taken; would have", explanation: "Điều kiện quá khứ (had taken) dẫn đến kết quả hiện tại (would have — dạng would + V bare)." },
      { type: "fill_blank", question: "Điền dạng đúng: \"If she ___ (not/be) so shy, she ___ (make) more friends at university back then.\"", answer: "weren't; would have made", explanation: "Đặc điểm hiện tại (weren't) dẫn đến kết quả giả định trong quá khứ (would have made)." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If they had invested wisely, they would have been rich now.\"", answer: "If they had invested wisely, they would be rich now.", explanation: "Kết quả ở hiện tại (\"now\") chỉ dùng \"would + V (bare)\", không dùng \"would have + V3\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"If I was more decisive, I would have taken that opportunity.\"", answer: "If I were more decisive, I would have taken that opportunity.", explanation: "Đặc điểm hiện tại trong mệnh đề if dùng \"were\", không dùng \"was\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu tôi đã không bỏ học đại học, giờ tôi đã có một công việc tốt hơn.\"", answer: "If I hadn't dropped out of university, I would have a better job now.", explanation: "Điều kiện quá khứ (hadn't dropped out) dẫn đến kết quả hiện tại (would have — would + V bare)." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Nếu anh ấy không nhút nhát như vậy, anh ấy đã phát biểu trong cuộc họp hôm qua.\"", answer: "If he weren't so shy, he would have spoken up in the meeting yesterday.", explanation: "Đặc điểm hiện tại (weren't) dẫn đến hành động giả định trong quá khứ (would have spoken up)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If we hadn't sold the old house, we would own two properties now.\"", answer: "Nếu chúng tôi đã không bán ngôi nhà cũ, hiện tại chúng tôi sẽ sở hữu hai bất động sản.", explanation: "Điều kiện quá khứ dẫn đến kết quả giả định ở hiện tại." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"If she weren't so ambitious, she wouldn't have moved abroad for work.\"", answer: "Nếu cô ấy không tham vọng như vậy, cô ấy đã không chuyển ra nước ngoài để làm việc.", explanation: "Đặc điểm hiện tại (weren't) dẫn đến hành động giả định trong quá khứ (wouldn't have moved)." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Mixed Conditional (kết quả ở hiện tại): \"He didn't go to law school, so he isn't a lawyer now.\"", answer: "If he had gone to law school, he would be a lawyer now.", explanation: "Điều kiện quá khứ (had gone) dẫn đến kết quả giả định hiện tại (would be)." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Mixed Conditional (kết quả ở quá khứ): \"She is very cautious, so she didn't take any financial risks last year.\"", answer: "If she weren't so cautious, she would have taken some financial risks last year.", explanation: "Đặc điểm hiện tại (weren't) dẫn đến kết quả giả định trong quá khứ (would have taken)." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If I had learned to drive, I would have been able to get to work faster now.\"", answer: "If I had learned to drive, I would be able to get to work faster now.", explanation: "Kết quả ở hiện tại (\"now\") dùng \"would + V (bare)\", không dùng \"would have + V3\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"If she was braver, she would have spoken up during the argument yesterday.\"", answer: "If she were braver, she would have spoken up during the argument yesterday.", explanation: "Mệnh đề if diễn tả đặc điểm hiện tại dùng \"were\", không dùng \"was\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If I had accepted that scholarship, I would have been fluent in French now.\"", answer: "Lỗi: \"would have been\" → sửa thành \"would be\".", explanation: "Kết quả ở hiện tại (\"now\") chỉ dùng \"would + V (bare)\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"If he wasn't so reckless, he wouldn't have crashed the car last night.\"", answer: "Lỗi: \"wasn't\" → sửa thành \"weren't\".", explanation: "Đặc điểm hiện tại trong mệnh đề if dùng \"weren't\", không dùng \"wasn't\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền dạng đúng của động từ):\nA: Why don't you speak German?\nB: Well, if I ___ (grow up) in Germany, I ___ (speak) it fluently now.\nA: That makes sense.", answer: "had grown up; would speak", explanation: "Điều kiện quá khứ (had grown up) dẫn đến kết quả giả định hiện tại (would speak)." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why didn't he apologize to his friend last week?\nB: If he ___ (not/be) so proud, he ___ (apologize) immediately.\nA: I agree, his pride really got in the way.", answer: "weren't; would have apologized", explanation: "Đặc điểm hiện tại (weren't) dẫn đến hành động giả định đã không xảy ra trong quá khứ (would have apologized)." }
    ],
    quiz: [
      { question: "\"If I had taken that job, I ___ in New York now.\"", options: ["would live", "would have lived", "will live", "lived"], answerIndex: 0, explanation: "Kết quả ở HIỆN TẠI (\"now\") → would + V (bare), không phải \"would have + V3\"." },
      { question: "Chọn câu đúng:", options: ["If she wasn't so busy, she would have joined us yesterday.", "If she weren't so busy, she would have joined us yesterday.", "If she weren't so busy, she would join us yesterday.", "If she wasn't so busy, she would join us yesterday."], answerIndex: 1, explanation: "Đặc điểm hiện tại (weren't) dẫn đến kết quả giả định trong quá khứ (would have joined)." },
      { question: "\"If they had planned better, they ___ less stressed right now.\"", options: ["would be", "would have been", "will be", "were"], answerIndex: 0, explanation: "Kết quả ở hiện tại (\"right now\") dùng \"would + V (bare)\": would be." },
      { question: "Chọn câu đúng:", options: ["If I wasn't so tired, I would have gone to the gym this morning.", "If I weren't so tired, I would have gone to the gym this morning.", "If I weren't so tired, I would go to the gym this morning.", "If I wasn't so tired, I would go to the gym this morning."], answerIndex: 1, explanation: "Đặc điểm hiện tại dùng \"weren't\"; kết quả trong quá khứ dùng \"would have gone\"." },
      { question: "\"If he ___ harder at university, he would have a much better job now.\"", options: ["studied", "had studied", "studies", "would study"], answerIndex: 1, explanation: "Điều kiện ở quá khứ dùng \"had + V3\" (had studied), dẫn đến kết quả giả định ở hiện tại." }
    ],
    summary: "Mixed Conditional kết hợp điều kiện và kết quả ở hai mốc thời gian khác nhau (quá khứ ↔ hiện tại), dùng \"would + V\" cho kết quả hiện tại và \"would have + V3\" cho kết quả quá khứ."
  })
];
