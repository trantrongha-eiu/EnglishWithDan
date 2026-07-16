"use strict";

const { lesson } = require("./builder");

const LINKING = "Linking Words";
const SEQUENCING = "Sequencing Words";

module.exports = [
  lesson({
    category: LINKING, lessonKey: "addition", title: "Addition", icon: "➕", orderIndex: 18,
    overview: "Nhóm từ nối bổ sung dùng để thêm thông tin, ý tưởng cùng chiều với câu trước, giúp bài viết mạch lạc và tránh lặp từ \"and\" liên tục.",
    formula: [
      { label: "Đầu câu (theo sau dấu phẩy)", structure: "Moreover/Furthermore/In addition, + S + V", example: "The policy reduces emissions. Moreover, it creates thousands of jobs." },
      { label: "Giữa câu", structure: "S + V, and + S + also + V", example: "The scheme cuts costs, and it also boosts efficiency." }
    ],
    usage: [
      { title: "Bổ sung ý tương đồng, thường ở đầu câu mới", description: "Furthermore, the data reveals a similar pattern in urban areas." },
      { title: "Nhấn mạnh thêm một lý do/lợi ích", description: "Not only does exercise improve health, but it also enhances mood." }
    ],
    signalWords: ["moreover", "furthermore", "in addition", "additionally", "besides", "not only...but also", "as well as"],
    examples: [
      { en: "Public transport reduces traffic. Additionally, it lowers air pollution.", vi: "Giao thông công cộng giảm ùn tắc. Ngoài ra, nó còn giảm ô nhiễm không khí." },
      { en: "Not only did sales increase, but profits also doubled.", vi: "Doanh số không chỉ tăng mà lợi nhuận cũng tăng gấp đôi." },
      { en: "The city is green; besides, it has excellent public services.", vi: "Thành phố này xanh; bên cạnh đó, nó còn có dịch vụ công tuyệt vời." },
      { en: "The new phone has a better camera. In addition, its battery lasts longer.", vi: "Chiếc điện thoại mới có camera tốt hơn. Ngoài ra, pin của nó cũng bền hơn." },
      { en: "She is fluent in English; furthermore, she speaks fluent French and Spanish.", vi: "Cô ấy thông thạo tiếng Anh; hơn nữa, cô ấy còn nói trôi chảy tiếng Pháp và Tây Ban Nha." },
      { en: "The hotel offers free breakfast. Moreover, guests can use the gym at no extra charge.", vi: "Khách sạn cung cấp bữa sáng miễn phí. Hơn nữa, khách có thể dùng phòng gym mà không mất thêm phí." },
      { en: "Recycling saves resources, and it also reduces landfill waste.", vi: "Tái chế tiết kiệm tài nguyên, và nó cũng giảm rác thải chôn lấp." },
      { en: "The company not only cut costs but also improved customer satisfaction.", vi: "Công ty không chỉ cắt giảm chi phí mà còn cải thiện sự hài lòng của khách hàng." },
      { en: "Online courses are flexible; besides, they are often cheaper than traditional classes.", vi: "Khóa học trực tuyến linh hoạt; bên cạnh đó, chúng thường rẻ hơn lớp học truyền thống." },
      { en: "As well as improving air quality, the new policy has created green jobs.", vi: "Bên cạnh việc cải thiện chất lượng không khí, chính sách mới còn tạo ra việc làm xanh." },
      { en: "The museum is free to enter; in addition, it offers guided tours every hour.", vi: "Bảo tàng miễn phí vào cửa; ngoài ra, nó còn có tour hướng dẫn mỗi giờ." },
      { en: "Regular exercise strengthens the heart. Additionally, it reduces stress levels.", vi: "Tập thể dục thường xuyên giúp tim khỏe hơn. Ngoài ra, nó còn giảm mức độ căng thẳng." }
    ],
    mistakes: [
      { wrong: "Moreover the price is high.", right: "Moreover, the price is high.", note: "Từ nối đầu câu như \"Moreover/Furthermore/In addition\" luôn theo sau bởi dấu phẩy." },
      { wrong: "Not only sales increased but also profits doubled.", right: "Not only did sales increase, but profits also doubled.", note: "\"Not only\" ở đầu câu gây đảo ngữ: cần trợ động từ trước chủ ngữ." },
      { wrong: "The city is clean, moreover it is safe.", right: "The city is clean. Moreover, it is safe.", note: "\"Moreover\" thường bắt đầu một câu MỚI (sau dấu chấm), không nối trực tiếp hai mệnh đề độc lập bằng dấu phẩy." },
      { wrong: "Besides, she is smart, she is kind.", right: "Besides being smart, she is kind. / She is smart; besides, she is kind.", note: "\"Besides\" cần cấu trúc rõ ràng: dùng như giới từ (+ V-ing/danh từ) hoặc như trạng từ liên kết nối hai câu, không chèn tùy tiện giữa câu." },
      { wrong: "In addition to reduce costs, the company improved quality.", right: "In addition to reducing costs, the company improved quality.", note: "\"In addition to\" là giới từ, theo sau là V-ing/danh từ, không phải to-infinitive." },
      { wrong: "He speaks English and also French and also German.", right: "He speaks English, French, and also German. / He speaks English as well as French and German.", note: "Không lặp lại \"and also\" nhiều lần trong một câu liệt kê." }
    ],
    tips: [
      "Đa dạng hóa từ nối bổ sung (đừng chỉ dùng \"and\") để tăng điểm Coherence & Cohesion trong Writing.",
      "\"Not only...but also\" là cấu trúc đảo ngữ nâng cao, dùng đúng sẽ gây ấn tượng với giám khảo."
    ],
    comparison: {
      title: "Addition vs Contrast linkers",
      headers: ["Addition", "Contrast"],
      rows: [["Cùng chiều, bổ sung thông tin", "Đối lập, tương phản thông tin"], ["Moreover, costs fell.", "However, quality declined."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn từ nối đúng: \"The city built more parks. ___, it planted thousands of trees.\"", options: ["However", "In addition", "Although", "Whereas"], answerIndex: 1, explanation: "\"In addition\" bổ sung ý cùng chiều." },
      { type: "multiple_choice", question: "Câu nào đúng ngữ pháp?", options: ["Besides that expensive, it is unreliable.", "Besides being expensive, it is unreliable.", "Besides expensive, it is unreliable.", "Besides to be expensive, it is unreliable."], answerIndex: 1, explanation: "\"Besides\" (giới từ) + V-ing/danh từ." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"The hotel is cheap. ___, it is close to the beach.\"", answer: "Moreover/Furthermore/In addition", explanation: "Cần từ nối bổ sung cùng chiều đứng đầu câu mới." },
      { type: "fill_blank", question: "Điền cặp từ nối phù hợp: \"___ is the app free, ___ it works offline.\"", answer: "Not only; but also", explanation: "Cặp từ nối đảo ngữ \"not only...but also\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Furthermore the price increased sharply.\"", answer: "Furthermore, the price increased sharply.", explanation: "Từ nối đầu câu \"furthermore\" cần dấu phẩy theo sau." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Not only she is smart but also kind.\"", answer: "Not only is she smart, but she is also kind.", explanation: "\"Not only\" ở đầu câu gây đảo ngữ trợ động từ + chủ ngữ." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"moreover\"): \"Chính sách này giảm ô nhiễm. Hơn nữa, nó tạo ra việc làm mới.\"", answer: "This policy reduces pollution. Moreover, it creates new jobs.", explanation: "\"Moreover\" mở đầu câu bổ sung, có dấu phẩy theo sau." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"not only...but also\"): \"Anh ấy không chỉ thông minh mà còn chăm chỉ.\"", answer: "He is not only intelligent but also hard-working.", explanation: "Cấu trúc \"not only...but also\" nối hai tính từ." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The scheme reduces traffic; besides, it improves air quality.\"", answer: "Kế hoạch này giảm ùn tắc giao thông; bên cạnh đó, nó còn cải thiện chất lượng không khí.", explanation: "\"Besides\" nối hai câu, bổ sung ý cùng chiều." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"As well as saving money, recycling protects the environment.\"", answer: "Bên cạnh việc tiết kiệm tiền, tái chế còn bảo vệ môi trường.", explanation: "\"As well as\" + V-ing bổ sung một lợi ích khác." },
      { type: "sentence_transformation", question: "Nối hai câu sau dùng \"furthermore\": \"The product is affordable. It is also environmentally friendly.\"", answer: "The product is affordable. Furthermore, it is environmentally friendly.", explanation: "\"Furthermore\" mở đầu câu mới bổ sung ý cùng chiều." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"not only...but also\": \"The app is fast. The app is also secure.\"", answer: "The app is not only fast but also secure.", explanation: "Kết hợp hai tính từ bằng cấu trúc \"not only...but also\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"In addition to reduce costs, the plan boosts morale.\"", answer: "In addition to reducing costs, the plan boosts morale.", explanation: "\"In addition to\" là giới từ, theo sau bởi V-ing/danh từ." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"The city is clean, moreover it is safe.\"", answer: "The city is clean. Moreover, it is safe.", explanation: "\"Moreover\" nên bắt đầu một câu mới, không nối trực tiếp bằng dấu phẩy." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Additionally the team improved efficiency.\"", answer: "Lỗi: thiếu dấu phẩy sau \"Additionally\".", explanation: "Từ nối đầu câu cần dấu phẩy theo sau." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He speaks French and also he speaks German and also Spanish.\"", answer: "Lỗi: lặp \"and also\" nhiều lần → sửa thành \"He speaks French, German, and Spanish.\"", explanation: "Không lặp lại \"and also\" nhiều lần trong một câu liệt kê." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền từ nối bổ sung):\nA: Why do you like this laptop?\nB: It's lightweight. ___, the battery lasts all day.", answer: "Moreover/Furthermore/In addition", explanation: "Từ nối bổ sung cùng chiều mở đầu câu mới." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Is the new policy effective?\nB: Yes, ___ did it reduce costs, but it also improved service quality.", answer: "not only", explanation: "Cặp từ nối \"not only...but also\", đảo ngữ ở đầu câu." }
    ],
    quiz: [
      { question: "Chọn từ nối đúng: \"The plan saves money. ___, it reduces waste.\"", options: ["However", "Furthermore", "Although", "Whereas"], answerIndex: 1, explanation: "Cần từ nối bổ sung cùng chiều → Furthermore." },
      { question: "\"___ did the government cut taxes, but it also increased benefits.\"", options: ["Not only", "Although", "Despite", "Whereas"], answerIndex: 0, explanation: "\"Not only...but also\" là cặp từ nối bổ sung, đảo ngữ ở đầu câu." },
      { question: "Chọn từ nối đúng: \"The scheme is affordable. ___, it is easy to implement.\"", options: ["Besides", "However", "Whereas", "Despite"], answerIndex: 0, explanation: "\"Besides\" bổ sung ý cùng chiều." },
      { question: "Câu nào đúng?", options: ["In addition to save time, it reduces cost.", "In addition to saving time, it reduces cost.", "In addition save time, it reduces cost.", "In addition to saved time, it reduces cost."], answerIndex: 1, explanation: "\"In addition to\" + V-ing." },
      { question: "Chọn từ nối đúng: \"The city is safe ___ clean.\"", options: ["as well as", "although", "despite", "whereas"], answerIndex: 0, explanation: "\"As well as\" nối hai tính từ cùng chiều." }
    ],
    summary: "Từ nối bổ sung (moreover, furthermore, in addition, not only...but also) thêm ý cùng chiều, giúp bài viết mạch lạc và đa dạng."
  }),

  lesson({
    category: LINKING, lessonKey: "contrast", title: "Contrast", icon: "⚖️", orderIndex: 19,
    overview: "Nhóm từ nối tương phản dùng để thể hiện hai ý đối lập nhau — kỹ năng bắt buộc trong Task 2 discussion essays và Task 1 khi so sánh dữ liệu ngược chiều.",
    formula: [
      { label: "Đầu câu độc lập", structure: "However, + S + V", example: "The economy grew. However, unemployment remained high." },
      { label: "Liên từ phụ thuộc", structure: "Although/Even though + S + V, S + V", example: "Although prices rose, demand stayed strong." },
      { label: "Giới từ + V-ing/danh từ", structure: "Despite/In spite of + V-ing/N, S + V", example: "Despite the rain, the event continued." }
    ],
    usage: [
      { title: "Đối lập giữa hai câu độc lập", description: "The city is expanding rapidly. However, infrastructure has not kept pace." },
      { title: "Đối lập trong cùng một câu phức", description: "Whereas rural areas rely on agriculture, urban areas depend on services." }
    ],
    signalWords: ["however", "nevertheless", "on the other hand", "although", "even though", "whereas", "while", "despite", "in spite of"],
    examples: [
      { en: "Sales fell in Europe. On the other hand, they rose sharply in Asia.", vi: "Doanh số giảm ở châu Âu. Mặt khác, chúng tăng mạnh ở châu Á." },
      { en: "Even though the policy is unpopular, it has proven effective.", vi: "Mặc dù chính sách này không được lòng dân, nó đã chứng minh hiệu quả." },
      { en: "Despite facing criticism, the company continued its expansion.", vi: "Dù đối mặt với chỉ trích, công ty vẫn tiếp tục mở rộng." },
      { en: "The north of the country is mountainous, whereas the south is flat.", vi: "Miền bắc của đất nước có nhiều núi, trong khi miền nam bằng phẳng." },
      { en: "In spite of the high cost, many people still choose to study abroad.", vi: "Mặc dù chi phí cao, nhiều người vẫn chọn du học." },
      { en: "The team played well; nevertheless, they lost the match.", vi: "Đội đã chơi tốt; tuy nhiên, họ vẫn thua trận." },
      { en: "While some countries have ageing populations, others face rapid population growth.", vi: "Trong khi một số quốc gia có dân số già hóa, các quốc gia khác lại đối mặt với sự tăng trưởng dân số nhanh." },
      { en: "Although the movie received poor reviews, it earned a huge profit at the box office.", vi: "Mặc dù bộ phim nhận đánh giá kém, nó vẫn thu lợi nhuận khổng lồ tại phòng vé." },
      { en: "The restaurant is expensive. On the other hand, the food quality is excellent.", vi: "Nhà hàng này đắt đỏ. Mặt khác, chất lượng đồ ăn lại xuất sắc." },
      { en: "Despite having less experience, she outperformed her colleagues.", vi: "Mặc dù ít kinh nghiệm hơn, cô ấy vẫn làm việc tốt hơn đồng nghiệp." }
    ],
    mistakes: [
      { wrong: "Despite it rained, we went out.", right: "Despite the rain, we went out. / Although it rained, we went out.", note: "\"Despite/In spite of\" theo sau là danh từ/V-ing, KHÔNG phải mệnh đề." },
      { wrong: "Although the price is high, but people still buy it.", right: "Although the price is high, people still buy it.", note: "Không dùng \"although\" và \"but\" cùng lúc trong một câu." },
      { wrong: "Despite of the rain, we continued playing.", right: "Despite the rain, we continued playing. / In spite of the rain, we continued playing.", note: "\"Despite\" KHÔNG đi với \"of\"; chỉ \"in spite of\" mới có \"of\"." },
      { wrong: "Whereas he is rich, but he is not happy.", right: "Whereas he is rich, he is not happy.", note: "\"Whereas\" đã mang nghĩa tương phản, không cần thêm \"but\"." },
      { wrong: "However he was tired, he kept working.", right: "However tired he was, he kept working. / Although he was tired, he kept working.", note: "\"However\" đứng đầu câu độc lập không nối trực tiếp hai mệnh đề như liên từ phụ thuộc; cần \"although\" nếu muốn nối trong một câu." }
    ],
    tips: [
      "Đa dạng hóa cách diễn đạt tương phản (however/although/despite/whereas) thay vì lặp \"but\" nhiều lần.",
      "Nhớ \"despite/in spite of\" + N/V-ing, còn \"although/even though/though\" + mệnh đề đầy đủ."
    ],
    comparison: {
      title: "Despite vs Although",
      headers: ["Despite/In spite of", "Although/Even though"],
      rows: [["+ Noun / V-ing", "+ Clause (S + V)"], ["Despite the rain, ...", "Although it rained, ..."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ having a small budget, the team achieved great results.\"", options: ["Although", "Despite", "Because", "So"], answerIndex: 1, explanation: "Sau chỗ trống là V-ing (\"having\") → dùng \"Despite\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["Whereas the city is crowded, but it is exciting.", "Whereas the city is crowded, it is exciting.", "Despite the city is crowded, it is exciting.", "Whereas the city crowded, it is exciting."], answerIndex: 1, explanation: "\"Whereas\" không kết hợp với \"but\"." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"___ the low salary, she loves her job.\"", answer: "Despite/In spite of", explanation: "Theo sau là cụm danh từ → despite/in spite of." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"He studied hard. ___, he failed the exam.\"", answer: "However/Nevertheless", explanation: "Từ nối đầu câu độc lập diễn tả tương phản." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"In spite the traffic, we arrived early.\"", answer: "In spite of the traffic, we arrived early.", explanation: "\"In spite of\" cần đủ ba từ, không bỏ \"of\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Even though the high price, people still buy it.\"", answer: "Even though the price is high, people still buy it. / Despite the high price, people still buy it.", explanation: "\"Even though\" cần mệnh đề đầy đủ (S+V), không dùng với cụm danh từ trực tiếp." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"although\"): \"Mặc dù trời mưa, chúng tôi vẫn đi dã ngoại.\"", answer: "Although it was raining, we still went on the picnic.", explanation: "\"Although\" + mệnh đề đầy đủ." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"whereas\"): \"Ở thành thị, mọi người đi làm bằng ô tô, trong khi ở nông thôn, họ đi bộ.\"", answer: "In urban areas, people commute by car, whereas in rural areas, they walk.", explanation: "\"Whereas\" nối hai mệnh đề đối lập." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Despite the economic downturn, the company's profits increased.\"", answer: "Mặc dù suy thoái kinh tế, lợi nhuận của công ty vẫn tăng.", explanation: "\"Despite\" + cụm danh từ." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The plan seemed perfect; however, it failed in practice.\"", answer: "Kế hoạch có vẻ hoàn hảo; tuy nhiên, nó đã thất bại trong thực tế.", explanation: "\"However\" nối hai câu độc lập, thể hiện tương phản." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"despite\": \"Although it was expensive, she bought the dress.\"", answer: "Despite the high price, she bought the dress.", explanation: "Chuyển từ \"although + mệnh đề\" sang \"despite + cụm danh từ\"." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"whereas\": \"Sales increased in Asia. Sales decreased in Europe.\"", answer: "Sales increased in Asia, whereas they decreased in Europe.", explanation: "\"Whereas\" nối hai mệnh đề đối lập thành một câu phức." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Despite that he was tired, he finished the race.\"", answer: "Despite being tired, he finished the race. / Although he was tired, he finished the race.", explanation: "\"Despite\" không theo sau bởi \"that + mệnh đề\"; dùng V-ing hoặc đổi sang \"although\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"He is rich, whereas he is generous.\"", answer: "He is rich, and he is generous. / Although he is rich, he is also generous.", explanation: "\"Whereas\" chỉ dùng cho sự ĐỐI LẬP; ở đây hai ý không đối lập nên cần liên từ khác." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Despite of his young age, he is very mature.\"", answer: "Lỗi: \"despite of\" → sửa thành \"despite\" (bỏ \"of\").", explanation: "\"Despite\" không bao giờ đi kèm \"of\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Although she practiced hard, but she didn't win.\"", answer: "Lỗi: bỏ \"but\" — sửa thành \"Although she practiced hard, she didn't win.\"", explanation: "Không kết hợp \"although\" và \"but\" trong cùng một câu." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền từ nối tương phản):\nA: How was the trip, considering the bad weather?\nB: ___ the rain, we still had a great time.", answer: "Despite/In spite of", explanation: "Theo sau là cụm danh từ (\"the rain\") → despite/in spite of." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Did the new policy work well?\nB: It seemed promising at first. ___, it caused several problems later.", answer: "However/Nevertheless", explanation: "Từ nối đầu câu độc lập diễn tả sự tương phản với ý trước." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"___ the heavy traffic, she arrived on time.\"", options: ["Although", "Despite", "Because", "Whereas"], answerIndex: 1, explanation: "Sau chỗ trống là cụm danh từ (\"the heavy traffic\") → dùng \"Despite\"." },
      { question: "Câu nào đúng ngữ pháp?", options: ["Although the plan is risky, but it may succeed.", "Although the plan is risky, it may succeed.", "Despite the plan is risky, it may succeed.", "Despite the plan risky, it may succeed."], answerIndex: 1, explanation: "\"Although\" đi với mệnh đề đầy đủ và không kết hợp với \"but\"." },
      { question: "Chọn đáp án đúng: \"___ many people prefer tea, others prefer coffee.\"", options: ["Despite", "Whereas", "Because of", "So"], answerIndex: 1, explanation: "\"Whereas\" nối hai mệnh đề đối lập." },
      { question: "Câu nào đúng?", options: ["In spite the cold, they went swimming.", "In spite of the cold, they went swimming.", "Despite of the cold, they went swimming.", "Despite the cold weather they went swimming, however.", ], answerIndex: 1, explanation: "\"In spite of\" cần đủ ba từ." },
      { question: "Chọn đáp án đúng: \"The report was well-written. ___, it lacked concrete data.\"", options: ["Moreover", "However", "Furthermore", "Besides"], answerIndex: 1, explanation: "\"However\" thể hiện sự tương phản giữa hai câu." }
    ],
    summary: "Từ nối tương phản (however, although, despite, whereas) thể hiện hai ý đối lập — chú ý despite/in spite of + N/V-ing, although/even though + mệnh đề."
  }),

  lesson({
    category: LINKING, lessonKey: "cause-and-effect", title: "Cause & Effect", icon: "🔗", orderIndex: 20,
    overview: "Nhóm từ nối nguyên nhân-kết quả giúp giải thích lý do và hệ quả một cách rõ ràng, mạch lạc — cực kỳ quan trọng trong Task 2 (essay dạng cause-solution/cause-effect).",
    formula: [
      { label: "Liên từ phụ thuộc (nguyên nhân)", structure: "Because/Since/As + S + V, S + V", example: "Because fuel prices rose, transport costs increased." },
      { label: "Giới từ (nguyên nhân)", structure: "Because of/Due to + N/V-ing, S + V", example: "Due to rising fuel prices, transport costs increased." },
      { label: "Đầu câu (kết quả)", structure: "Therefore/As a result/Consequently, + S + V", example: "Fuel prices rose. As a result, transport costs increased." }
    ],
    usage: [
      { title: "Nêu nguyên nhân bằng liên từ phụ thuộc", description: "Since demand outstripped supply, prices rose sharply." },
      { title: "Nêu nguyên nhân bằng giới từ + danh từ/V-ing", description: "Owing to the economic downturn, many businesses closed." },
      { title: "Nêu kết quả ở đầu câu mới", description: "The factory closed. Consequently, hundreds of workers lost their jobs." }
    ],
    signalWords: ["because", "since", "as", "because of", "due to", "owing to", "therefore", "as a result", "consequently", "thus", "hence"],
    examples: [
      { en: "Because of rapid urbanisation, traffic congestion has worsened.", vi: "Do đô thị hóa nhanh, tình trạng ùn tắc giao thông đã trở nên tồi tệ hơn." },
      { en: "As fewer people read newspapers, print media has declined. Consequently, many publishers have shifted online.", vi: "Vì ngày càng ít người đọc báo giấy, truyền thông in đã suy giảm. Do đó, nhiều nhà xuất bản đã chuyển sang trực tuyến." },
      { en: "The bridge was poorly built; therefore, it collapsed within a year.", vi: "Cây cầu được xây dựng kém chất lượng; do đó, nó sập trong vòng một năm." },
      { en: "Owing to the drought, crop yields fell sharply this year.", vi: "Do hạn hán, sản lượng cây trồng đã giảm mạnh trong năm nay." },
      { en: "Since the factory closed, hundreds of workers have lost their jobs.", vi: "Kể từ khi nhà máy đóng cửa, hàng trăm công nhân đã mất việc." },
      { en: "The internet has made information more accessible; hence, self-study has become more popular.", vi: "Internet đã làm cho thông tin dễ tiếp cận hơn; do đó, tự học đã trở nên phổ biến hơn." },
      { en: "Due to a lack of funding, the research project was cancelled.", vi: "Do thiếu kinh phí, dự án nghiên cứu đã bị hủy bỏ." },
      { en: "As the population grows, demand for housing continues to rise.", vi: "Khi dân số tăng, nhu cầu về nhà ở tiếp tục tăng lên." },
      { en: "The company failed to adapt to new technology; as a result, it lost market share.", vi: "Công ty không thích nghi kịp với công nghệ mới; do đó, họ đã mất thị phần." },
      { en: "Because the roads were flooded, many schools were forced to close.", vi: "Vì đường sá bị ngập lụt, nhiều trường học buộc phải đóng cửa." }
    ],
    mistakes: [
      { wrong: "Because of the price increased, sales fell.", right: "Because of the price increase, sales fell. / Because the price increased, sales fell.", note: "\"Because of\" theo sau là DANH TỪ, không phải mệnh đề." },
      { wrong: "Prices rose, therefore costs increased and.", right: "Prices rose. Therefore, costs increased.", note: "\"Therefore/As a result/Consequently\" thường đứng đầu câu MỚI, có dấu phẩy theo sau." },
      { wrong: "Due to it rained heavily, the match was postponed.", right: "Due to heavy rain, the match was postponed. / Because it rained heavily, the match was postponed.", note: "\"Due to\" theo sau là cụm danh từ, không phải mệnh đề đầy đủ." },
      { wrong: "As a result of, prices increased significantly.", right: "As a result, prices increased significantly.", note: "\"As a result\" (không có \"of\") đứng đầu câu; \"as a result of\" cần theo sau một danh từ cụ thể, không dùng đơn lẻ." },
      { wrong: "Since of the heavy traffic, I was late.", right: "Because of the heavy traffic, I was late. / Since the traffic was heavy, I was late.", note: "\"Since\" không kết hợp với \"of\"; dùng \"because of\" (+ danh từ) hoặc \"since\" (+ mệnh đề)." }
    ],
    tips: [
      "Phân biệt \"because\" (+ mệnh đề) và \"because of/due to\" (+ danh từ/V-ing) là lỗi ngữ pháp phổ biến nhất trong bài thi.",
      "Task 2 dạng \"causes and effects\" nên luân phiên dùng vài từ nối khác nhau: since, as, owing to, consequently, hence."
    ],
    comparison: {
      title: "Because vs Because Of",
      headers: ["Because", "Because of / Due to"],
      rows: [["+ Clause (S + V)", "+ Noun / V-ing"], ["Because prices rose, ...", "Because of rising prices, ..."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ heavy congestion, the city built a new metro line.\"", options: ["Because", "Due to", "As", "Since"], answerIndex: 1, explanation: "Sau chỗ trống là cụm danh từ (\"heavy congestion\") → dùng \"Due to\"." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["Because the flood, the road was closed.", "Because of the flood, the road was closed.", "Because of the flood was, the road was closed.", "Because flood, the road was closed."], answerIndex: 1, explanation: "\"Because of\" + danh từ (\"the flood\")." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"___ the shortage of teachers, class sizes have increased.\"", answer: "Due to/Owing to/Because of", explanation: "Theo sau là cụm danh từ → dùng giới từ chỉ nguyên nhân." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"Costs rose sharply. ___, the company raised its prices.\"", answer: "As a result/Consequently/Therefore", explanation: "Từ nối chỉ kết quả đứng đầu câu mới." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Because the storm, flights were cancelled.\"", answer: "Because of the storm, flights were cancelled.", explanation: "Cần \"because of\" (+ danh từ), không dùng \"because\" trực tiếp với danh từ." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"As a result of the economy improved, unemployment fell.\"", answer: "As a result of the improved economy, unemployment fell. / As the economy improved, unemployment fell.", explanation: "\"As a result of\" cần theo sau là cụm danh từ, không phải mệnh đề." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"due to\"): \"Do biến đổi khí hậu, mực nước biển đang dâng cao.\"", answer: "Due to climate change, sea levels are rising.", explanation: "\"Due to\" + cụm danh từ." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"as a result\"): \"Nhu cầu giảm. Do đó, nhiều cửa hàng đã phải đóng cửa.\"", answer: "Demand fell. As a result, many shops had to close.", explanation: "\"As a result\" mở đầu câu chỉ kết quả." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Owing to a rapid rise in fuel prices, transport costs have increased.\"", answer: "Do giá nhiên liệu tăng nhanh, chi phí vận chuyển đã tăng lên.", explanation: "\"Owing to\" + cụm danh từ chỉ nguyên nhân." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The bridge was closed for repairs; consequently, traffic was diverted.\"", answer: "Cây cầu đã bị đóng để sửa chữa; do đó, giao thông đã được chuyển hướng.", explanation: "\"Consequently\" chỉ kết quả, đứng đầu câu mới." },
      { type: "sentence_transformation", question: "Nối hai câu sau dùng \"because\": \"Fewer tourists visited. The economy suffered a downturn.\"", answer: "Because fewer tourists visited, the economy suffered a downturn.", explanation: "\"Because\" + mệnh đề nguyên nhân đầy đủ." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"due to\" thay cho \"because\": \"Because the roads were icy, many accidents occurred.\"", answer: "Due to icy roads, many accidents occurred.", explanation: "Chuyển từ \"because + mệnh đề\" sang \"due to + cụm danh từ\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Owing to the price rose, demand fell.\"", answer: "Owing to the price rise, demand fell. / Because the price rose, demand fell.", explanation: "\"Owing to\" cần theo sau là danh từ (price rise), không phải mệnh đề." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"The team lost, therefore they were disappointed and.\"", answer: "The team lost. Therefore, they were disappointed.", explanation: "Bỏ từ thừa \"and\"; \"therefore\" mở đầu câu mới, có dấu phẩy theo sau." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Since of the bad weather, the flight was delayed.\"", answer: "Lỗi: \"since of\" → sửa thành \"because of\" hoặc \"since\" + mệnh đề.", explanation: "\"Since\" không kết hợp với \"of\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Hence the delay, we missed our connecting flight.\"", answer: "Lỗi: \"Hence the delay\" → sửa thành \"Because of the delay\" (hence không dùng để mở đầu nguyên nhân theo cách này).", explanation: "\"Hence\" diễn tả KẾT QUẢ, không dùng để giới thiệu nguyên nhân như \"because of\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền từ nối nguyên nhân-kết quả):\nA: Why was the concert cancelled?\nB: ___ the singer's illness, the whole event was cancelled.", answer: "Due to/Owing to/Because of", explanation: "Theo sau là cụm danh từ chỉ nguyên nhân." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why did the company's profits fall?\nB: Sales dropped significantly. ___, they had to cut jobs.", answer: "As a result/Consequently/Therefore", explanation: "Từ nối chỉ kết quả đứng đầu câu mới." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"___ the storm, the flight was delayed.\"", options: ["Because", "Due to", "Since", "As"], answerIndex: 1, explanation: "Sau chỗ trống là cụm danh từ (\"the storm\") → dùng \"Due to\"." },
      { question: "Câu nào đúng?", options: ["Since prices rose, demand fell.", "Since of prices rising, demand fell.", "Since price rose, therefore demand fell.", "Since prices rose, so demand fell."], answerIndex: 0, explanation: "\"Since\" + mệnh đề đầy đủ là cấu trúc đúng cho nguyên nhân." },
      { question: "Chọn đáp án đúng: \"Sales dropped sharply. ___, the store closed permanently.\"", options: ["Because", "As a result", "Due to", "Since"], answerIndex: 1, explanation: "\"As a result\" chỉ kết quả, đứng đầu câu mới." },
      { question: "Câu nào đúng?", options: ["Owing to the heavy rain, the game was postponed.", "Owing the heavy rain, the game was postponed.", "Owing to heavy rain was, the game was postponed.", "Owing that heavy rain, the game was postponed."], answerIndex: 0, explanation: "\"Owing to\" + cụm danh từ." },
      { question: "Chọn đáp án đúng: \"The bridge collapsed ___ poor maintenance.\"", options: ["because", "due to", "since", "as"], answerIndex: 1, explanation: "Theo sau là cụm danh từ (\"poor maintenance\") → dùng \"due to\"." }
    ],
    summary: "Từ nối nguyên nhân-kết quả (because/since/as + mệnh đề; because of/due to + danh từ; therefore/as a result + câu mới) giúp lập luận rõ ràng, mạch lạc."
  }),

  lesson({
    category: LINKING, lessonKey: "purpose", title: "Purpose", icon: "🎯", orderIndex: 21,
    overview: "Nhóm từ nối mục đích diễn tả lý do/mục tiêu của một hành động — thường dùng trong Task 2 khi đề xuất giải pháp và Task 1 process diagrams.",
    formula: [
      { label: "To-infinitive", structure: "S + V + to + V(bare)", example: "Governments raise taxes to fund public services." },
      { label: "In order to / So as to", structure: "S + V, in order to/so as to + V(bare)", example: "The company invested in R&D in order to stay competitive." },
      { label: "So that", structure: "S + V + so that + S + can/could/will + V", example: "Schools use technology so that students can learn more effectively." }
    ],
    usage: [
      { title: "Nêu mục đích ngắn gọn bằng to-infinitive", description: "People exercise to stay healthy." },
      { title: "Nêu mục đích trang trọng hơn với in order to/so as to", description: "The government introduced the policy in order to reduce inequality." },
      { title: "Nêu mục đích khi chủ ngữ hai vế khác nhau, dùng so that", description: "The teacher spoke slowly so that the students could understand." }
    ],
    signalWords: ["to", "in order to", "so as to", "so that", "for the purpose of", "with the aim of"],
    examples: [
      { en: "The city built more bike lanes in order to reduce traffic congestion.", vi: "Thành phố đã xây thêm làn đường xe đạp nhằm giảm ùn tắc giao thông." },
      { en: "The company lowered prices so that more customers could afford its products.", vi: "Công ty đã hạ giá để nhiều khách hàng hơn có thể mua được sản phẩm." },
      { en: "Students should manage their time well so as to balance study and rest.", vi: "Học sinh nên quản lý thời gian tốt để cân bằng học tập và nghỉ ngơi." },
      { en: "The government launched a campaign in order to raise awareness about recycling.", vi: "Chính phủ đã phát động một chiến dịch nhằm nâng cao nhận thức về tái chế." },
      { en: "She saved money every month so that she could travel abroad.", vi: "Cô ấy tiết kiệm tiền mỗi tháng để có thể đi du lịch nước ngoài." },
      { en: "He wore headphones so as not to disturb his roommate.", vi: "Anh ấy đeo tai nghe để không làm phiền bạn cùng phòng." },
      { en: "Companies invest heavily in advertising to attract new customers.", vi: "Các công ty đầu tư mạnh vào quảng cáo để thu hút khách hàng mới." },
      { en: "The school introduced a new curriculum with the aim of improving critical thinking skills.", vi: "Trường học đã giới thiệu chương trình học mới với mục tiêu cải thiện kỹ năng tư duy phản biện." },
      { en: "Doctors recommend regular check-ups in order to detect illnesses early.", vi: "Các bác sĩ khuyên nên khám sức khỏe định kỳ để phát hiện bệnh sớm." },
      { en: "The airline added extra flights so that more passengers could travel during the holiday.", vi: "Hãng hàng không đã thêm các chuyến bay để nhiều hành khách hơn có thể di chuyển trong kỳ nghỉ." }
    ],
    mistakes: [
      { wrong: "The government raised taxes for fund public services.", right: "The government raised taxes to fund/in order to fund public services.", note: "\"For\" + V-ing/danh từ diễn tả mục đích chung, không dùng \"for + V nguyên mẫu\"." },
      { wrong: "She studied hard so that pass the exam.", right: "She studied hard so that she could pass the exam.", note: "\"So that\" cần một mệnh đề đầy đủ, không theo sau bởi động từ nguyên mẫu trực tiếp." },
      { wrong: "He left early in order not being late.", right: "He left early in order not to be late.", note: "Dạng phủ định của \"in order to\" là \"in order not to + V\", không dùng \"not being\"." },
      { wrong: "I bought a dictionary for learn new words.", right: "I bought a dictionary to learn new words. / I bought a dictionary for learning new words.", note: "\"For\" + mục đích chỉ đi với V-ing hoặc danh từ, không đi với to-infinitive kiểu \"for learn\"." },
      { wrong: "They built a wall so as protect the city.", right: "They built a wall so as to protect the city.", note: "\"So as to\" cần đủ cụm từ \"so as to\", không bỏ \"to\"." }
    ],
    tips: [
      "Dùng \"in order to/so as to\" (thay vì chỉ \"to\") ở Task 2 giúp câu văn trang trọng và học thuật hơn.",
      "\"So as to\" đặc biệt hữu ích khi cần thể hiện mục đích ở dạng phủ định: \"so as not to + V\"."
    ],
    comparison: {
      title: "To-infinitive vs So that",
      headers: ["To-infinitive / In order to", "So that"],
      rows: [["Chủ ngữ 2 vế giống nhau", "Chủ ngữ 2 vế có thể khác nhau"], ["She studies hard to pass.", "She explains slowly so that we can understand."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"They planted trees ___ improve air quality.\"", options: ["for", "so as to", "so", "because"], answerIndex: 1, explanation: "\"So as to\" + V diễn tả mục đích." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["She whispered so as not wake him.", "She whispered so as to not wake him.", "She whispered so as not to wake him.", "She whispered so not to wake him."], answerIndex: 2, explanation: "Dạng phủ định đúng: \"so as not to + V\"." },
      { type: "fill_blank", question: "Điền từ/cụm từ phù hợp: \"He works two jobs ___ he can support his family.\"", answer: "so that", explanation: "Chủ ngữ 2 vế khác nhau ngầm định (nhấn mạnh mục đích) → so that." },
      { type: "fill_blank", question: "Điền từ/cụm từ phù hợp: \"She turned off her phone ___ focus on studying.\"", answer: "to/in order to/so as to", explanation: "Chủ ngữ 2 vế giống nhau → to-infinitive/in order to/so as to." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"They saved money for buy a house.\"", answer: "They saved money to buy a house.", explanation: "\"To + V\" diễn tả mục đích, không dùng \"for + V\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"He spoke quietly so as to not disturb others.\"", answer: "He spoke quietly so as not to disturb others.", explanation: "Dạng phủ định đúng: \"so as not to\", không phải \"so as to not\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"in order to\"): \"Chính phủ đã đầu tư vào giáo dục nhằm giảm bất bình đẳng.\"", answer: "The government invested in education in order to reduce inequality.", explanation: "\"In order to\" diễn tả mục đích trang trọng." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"so that\"): \"Cô giáo viết to lên bảng để mọi học sinh đều có thể nhìn thấy.\"", answer: "The teacher wrote in large letters on the board so that all students could see.", explanation: "\"So that\" khi chủ ngữ hai vế khác nhau (teacher/students)." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The company reduced working hours so as to improve employee wellbeing.\"", answer: "Công ty đã giảm giờ làm việc nhằm cải thiện sức khỏe tinh thần của nhân viên.", explanation: "\"So as to\" diễn tả mục đích." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"He locked the door so that no one could enter.\"", answer: "Anh ấy đã khóa cửa để không ai có thể vào được.", explanation: "\"So that\" + mệnh đề đầy đủ diễn tả mục đích." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"so that\": \"She spoke slowly to help the students understand.\"", answer: "She spoke slowly so that the students could understand.", explanation: "Chuyển từ to-infinitive sang \"so that\" khi nhấn mạnh chủ thể khác thực hiện hành động." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"in order not to\": \"He didn't want to be late, so he left early.\"", answer: "He left early in order not to be late.", explanation: "Dạng phủ định của \"in order to\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"They worked overtime for finish the project.\"", answer: "They worked overtime to finish the project. / They worked overtime in order to finish the project.", explanation: "\"To/in order to + V\" diễn tả mục đích, không dùng \"for + V\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"I wear glasses so I can to see better.\"", answer: "I wear glasses so that I can see better.", explanation: "\"So that\" + mệnh đề với modal verb (can), không thêm \"to\" trước \"see\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"She exercises every day for stay healthy.\"", answer: "Lỗi: \"for stay\" → sửa thành \"to stay\".", explanation: "\"To + V\" diễn tả mục đích, không dùng \"for + V nguyên mẫu\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"He whispered so as to not to wake the baby.\"", answer: "Lỗi: lặp \"to\" — sửa thành \"so as not to wake the baby\".", explanation: "Cấu trúc phủ định chỉ cần một \"to\": so as not to + V." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền cụm từ chỉ mục đích):\nA: Why are you learning Japanese?\nB: I'm learning it ___ I can work in Japan someday.", answer: "so that", explanation: "\"So that\" diễn tả mục đích với modal verb \"can\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Why did you turn down the volume?\nB: I turned it down ___ not to wake the baby.", answer: "so as", explanation: "Cấu trúc phủ định: \"so as not to + V\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"He whispered ___ not wake the baby.\"", options: ["for", "so as to", "so that", "because"], answerIndex: 1, explanation: "\"So as to\" + V có thể dùng ở dạng phủ định \"so as not to\" để diễn tả mục đích." },
      { question: "Câu nào đúng?", options: ["I saved money for buy a car.", "I saved money to buy a car.", "I saved money for to buy a car.", "I saved money so buy a car."], answerIndex: 1, explanation: "\"To + V nguyên mẫu\" diễn tả mục đích khi chủ ngữ hai vế giống nhau." },
      { question: "Chọn đáp án đúng: \"The teacher repeated the instructions ___ everyone understood.\"", options: ["to", "so that", "for", "so as to"], answerIndex: 1, explanation: "Chủ ngữ hai vế khác nhau (teacher/everyone) → so that." },
      { question: "Câu nào đúng?", options: ["She left early so as to not miss the train.", "She left early so as not to miss the train.", "She left early not so as to miss the train.", "She left early so to not miss the train."], answerIndex: 1, explanation: "Dạng phủ định đúng: \"so as not to + V\"." },
      { question: "Chọn đáp án đúng: \"They installed cameras ___ improve security.\"", options: ["for", "so as to", "so", "because of"], answerIndex: 1, explanation: "\"So as to\" diễn tả mục đích." }
    ],
    summary: "Từ nối mục đích (to, in order to, so as to, so that) diễn tả lý do của hành động — chọn cấu trúc phù hợp theo chủ ngữ hai vế giống hay khác nhau."
  }),

  lesson({
    category: SEQUENCING, lessonKey: "process-sequencing", title: "Sequencing in Processes", icon: "📋", orderIndex: 22,
    overview: "Từ nối trình tự trong mô tả quy trình (process diagram) giúp sắp xếp các bước theo đúng thứ tự logic — kỹ năng bắt buộc cho Task 1 process/flow-chart.",
    formula: [
      { label: "Mở đầu quy trình", structure: "First(ly)/To begin with, + S + is/are + V3 (bị động thường gặp)", example: "First, the raw materials are collected." },
      { label: "Bước tiếp theo", structure: "Then/Next/After that/Following this, + S + V", example: "Next, the materials are transported to the factory." },
      { label: "Kết thúc quy trình", structure: "Finally/Eventually/Lastly, + S + V", example: "Finally, the finished product is packaged for distribution." }
    ],
    usage: [
      { title: "Bắt đầu mô tả một quy trình nhiều bước", description: "First, water is pumped from the reservoir." },
      { title: "Nối các bước trung gian theo thứ tự", description: "After that, the water is filtered before being treated with chemicals." },
      { title: "Kết thúc quy trình/vòng lặp", description: "Finally, the clean water is distributed to households." }
    ],
    signalWords: ["first(ly)", "to begin with", "then", "next", "after that", "following this", "subsequently", "finally", "eventually", "once this is done"],
    examples: [
      { en: "First, the paper pulp is mixed with water. Next, it is spread onto a mesh screen.", vi: "Đầu tiên, bột giấy được trộn với nước. Tiếp theo, nó được trải lên một tấm lưới." },
      { en: "Once this stage is complete, the mixture is heated to a high temperature.", vi: "Khi giai đoạn này hoàn tất, hỗn hợp được đun nóng đến nhiệt độ cao." },
      { en: "Finally, the product is inspected before being shipped to retailers.", vi: "Cuối cùng, sản phẩm được kiểm tra trước khi được vận chuyển đến các nhà bán lẻ." },
      { en: "To begin with, raw cotton is harvested from the fields.", vi: "Đầu tiên, bông thô được thu hoạch từ các cánh đồng." },
      { en: "After that, the cotton is cleaned and separated from its seeds.", vi: "Sau đó, bông được làm sạch và tách khỏi hạt." },
      { en: "Subsequently, the fibres are spun into yarn.", vi: "Tiếp theo đó, các sợi được xe thành sợi chỉ." },
      { en: "Following this, the yarn is woven into fabric on large looms.", vi: "Sau bước này, sợi chỉ được dệt thành vải trên các khung dệt lớn." },
      { en: "Once the fabric is dyed, it is left to dry completely.", vi: "Khi vải đã được nhuộm xong, nó được để khô hoàn toàn." },
      { en: "Eventually, the fabric is cut and sewn into finished garments.", vi: "Cuối cùng, vải được cắt và may thành trang phục hoàn chỉnh." },
      { en: "Lastly, the garments are folded, packaged, and sent to stores.", vi: "Sau cùng, quần áo được gấp lại, đóng gói và gửi đến các cửa hàng." }
    ],
    mistakes: [
      { wrong: "First, second, third, the materials are processed.", right: "First, the materials are collected. Then, they are processed. Finally, they are packaged.", note: "Không liệt kê \"first, second, third\" liền nhau như một danh sách — mỗi từ nối cần gắn với MỘT bước cụ thể." },
      { wrong: "At the end the product is ready.", right: "Finally/At the end of the process, the product is ready.", note: "\"At the end\" cần rõ nghĩa \"kết thúc CỦA CÁI GÌ\" hoặc thay bằng \"finally\"." },
      { wrong: "Next the material heat to high temperature.", right: "Next, the material is heated to a high temperature.", note: "Quy trình mô tả bị động cần \"is/are + V3\"; câu gốc thiếu trợ động từ \"is\" và dùng sai dạng động từ." },
      { wrong: "Then, then the mixture is cooled.", right: "Then, the mixture is cooled.", note: "Không lặp lại từ nối \"then\" hai lần liên tiếp." },
      { wrong: "The final step, the product being packaged.", right: "In the final step, the product is packaged.", note: "Câu cần đầy đủ trợ động từ \"is\" trong cấu trúc bị động, và thêm giới từ \"in\" trước cụm \"the final step\"." }
    ],
    tips: [
      "Trong Task 1 process, luôn dùng thể bị động (passive voice) kết hợp từ nối trình tự vì quy trình thường không có chủ thể rõ ràng.",
      "Đa dạng hóa từ nối (first/next/after that/subsequently/finally) thay vì lặp \"then\" liên tục."
    ],
    comparison: {
      title: "Process Sequencing vs Narrative Sequencing",
      headers: ["Process (Task 1)", "Narrative/Essay"],
      rows: [["Thường dùng bị động: is/are + V3", "Thường dùng chủ động: S + V"], ["First, the material is heated.", "First, I woke up early."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn từ nối phù hợp để nối bước trung gian trong quy trình:", options: ["Although", "After that", "Despite", "Because"], answerIndex: 1, explanation: "\"After that\" nối các bước trung gian theo thứ tự." },
      { type: "multiple_choice", question: "Câu nào đúng ngữ pháp trong mô tả quy trình?", options: ["Finally, the boxes is sealed.", "Finally, the boxes are sealed.", "Finally, the boxes seals.", "Finally, the boxes sealing."], answerIndex: 1, explanation: "Chủ ngữ số nhiều \"boxes\" + bị động \"are sealed\"." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"___, the grapes are harvested by hand.\"", answer: "First/To begin with", explanation: "Từ nối mở đầu quy trình." },
      { type: "fill_blank", question: "Điền dạng bị động đúng: \"Next, the water ___ (filter) to remove impurities.\"", answer: "is filtered", explanation: "Quy trình dùng bị động hiện tại đơn: is + V3." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"First, the seeds plant in the soil.\"", answer: "First, the seeds are planted in the soil.", explanation: "Cần bị động: are planted, không dùng chủ động \"plant\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Then the mixture heat until it boils.\"", answer: "Then, the mixture is heated until it boils.", explanation: "Thiếu trợ động từ \"is\" và dạng V3 \"heated\" trong câu bị động." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (mô tả quy trình, dùng bị động): \"Đầu tiên, nguyên liệu thô được thu thập từ các nhà cung cấp.\"", answer: "First, the raw materials are collected from suppliers.", explanation: "Bị động hiện tại đơn: are collected." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Cuối cùng, sản phẩm hoàn thiện được đóng gói và vận chuyển.\"", answer: "Finally, the finished product is packaged and shipped.", explanation: "\"Finally\" kết thúc quy trình, dùng bị động." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Once the dough has risen, it is shaped into loaves.\"", answer: "Khi bột đã nở, nó được tạo hình thành các ổ bánh.", explanation: "\"Once\" chỉ mốc chuyển tiếp giữa các bước." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Subsequently, the bottles are filled and sealed.\"", answer: "Tiếp theo đó, các chai được đổ đầy và đóng nắp.", explanation: "\"Subsequently\" nối bước tiếp theo trong quy trình." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở thể bị động: \"Workers collect the eggs every morning.\"", answer: "The eggs are collected by workers every morning.", explanation: "Mô tả quy trình ưu tiên thể bị động, nhấn mạnh đối tượng." },
      { type: "sentence_transformation", question: "Nối hai bước sau bằng từ nối trình tự: \"The wood is cut. The wood is sanded smooth.\"", answer: "First, the wood is cut. Then, it is sanded smooth.", explanation: "Dùng từ nối trình tự để nối hai bước liên tiếp." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Next the machine assemble the parts.\"", answer: "Next, the machine assembles the parts. / Next, the parts are assembled by the machine.", explanation: "Cần dấu phẩy sau \"Next\" và chia đúng động từ (assembles hoặc dạng bị động)." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"At the end product is checked for quality.\"", answer: "At the end of the process, the product is checked for quality.", explanation: "\"At the end\" cần rõ \"của cái gì\" (of the process)." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"First, second, the ingredients are mixed together.\"", answer: "Lỗi: \"First, second\" → sửa thành \"First\" (bỏ \"second\", mỗi từ nối gắn với một bước riêng).", explanation: "Không liệt kê nhiều từ nối trình tự liên tiếp cho cùng một bước." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Then, the can filled with liquid.\"", answer: "Lỗi: thiếu \"is\" → sửa thành \"the can is filled with liquid\".", explanation: "Câu bị động cần trợ động từ \"is/are\" trước V3." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (mô tả quy trình):\nA: How is olive oil made?\nB: ___, the olives are pressed to extract the oil.", answer: "First", explanation: "Từ nối mở đầu quy trình." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What happens after the oil is extracted?\nB: ___, it is filtered to remove impurities.", answer: "After that/Next/Then", explanation: "Từ nối bước tiếp theo trong quy trình." }
    ],
    quiz: [
      { question: "Chọn từ nối phù hợp nhất để bắt đầu mô tả quy trình:", options: ["Therefore", "First", "However", "Despite"], answerIndex: 1, explanation: "\"First\" mở đầu quy trình theo đúng trình tự thời gian." },
      { question: "Câu nào đúng ngữ pháp và tự nhiên trong mô tả quy trình?", options: ["Then, the seeds is planted.", "Then, the seeds are planted.", "Then, the seeds plant.", "Then, the seeds planting."], answerIndex: 1, explanation: "Chủ ngữ số nhiều \"seeds\" + bị động \"are planted\"." },
      { question: "Chọn từ nối phù hợp để kết thúc quy trình:", options: ["First", "Meanwhile", "Finally", "Despite"], answerIndex: 2, explanation: "\"Finally\" kết thúc quy trình." },
      { question: "Câu nào đúng?", options: ["Once the metal cool, it is shaped.", "Once the metal is cooled, it is shaped.", "Once the metal cooling, it is shaped.", "Once the metal cools it, is shaped."], answerIndex: 1, explanation: "Bị động đúng: is cooled." },
      { question: "Chọn từ nối phù hợp: \"___ this stage, the liquid is filtered.\"", options: ["Following", "Despite", "Because", "So"], answerIndex: 0, explanation: "\"Following this stage\" nối bước tiếp theo." }
    ],
    summary: "Từ nối trình tự (first, then, next, after that, finally) sắp xếp các bước trong quy trình theo đúng thứ tự, thường kết hợp thể bị động."
  }),

  lesson({
    category: SEQUENCING, lessonKey: "narrative-essay-sequencing", title: "Sequencing in Narratives & Essays", icon: "📝", orderIndex: 23,
    overview: "Từ nối trình tự trong bài kể chuyện (Speaking Part 2) hoặc bài luận (Task 2) giúp sắp xếp ý tưởng/sự kiện mạch lạc, khác với sequencing trong process diagram vì thường đi cùng câu chủ động.",
    formula: [
      { label: "Mở đầu", structure: "Firstly/In the beginning/At first, + S + V", example: "Firstly, social media connects people across the globe." },
      { label: "Ý tiếp theo", structure: "Secondly/Moreover/Subsequently, + S + V", example: "Secondly, it provides a platform for businesses to reach customers." },
      { label: "Kết luận", structure: "Finally/In conclusion/To conclude, + S + V", example: "In conclusion, the benefits of social media outweigh its drawbacks." }
    ],
    usage: [
      { title: "Sắp xếp luận điểm trong bài luận Task 2", description: "Firstly, remote work improves work-life balance. Secondly, it reduces commuting costs." },
      { title: "Kể một câu chuyện theo trình tự thời gian (Speaking Part 2)", description: "At first, I was nervous. Eventually, I became more confident." }
    ],
    signalWords: ["firstly/first of all", "secondly", "in the beginning", "at first", "eventually", "subsequently", "in the end", "finally", "to conclude/in conclusion"],
    examples: [
      { en: "Firstly, online learning offers flexibility. Secondly, it reduces travel time for students.", vi: "Thứ nhất, học trực tuyến mang lại sự linh hoạt. Thứ hai, nó giảm thời gian di chuyển cho học sinh." },
      { en: "At first, I found the course difficult, but eventually I improved.", vi: "Ban đầu tôi thấy khóa học khó, nhưng cuối cùng tôi đã tiến bộ." },
      { en: "To conclude, while there are challenges, the overall impact is positive.", vi: "Tóm lại, dù có những thách thức, tác động tổng thể vẫn tích cực." },
      { en: "In the beginning, the two companies were fierce competitors.", vi: "Ban đầu, hai công ty là đối thủ cạnh tranh gay gắt." },
      { en: "First of all, remote work reduces commuting time.", vi: "Trước hết, làm việc từ xa giảm thời gian đi lại." },
      { en: "Eventually, she realised that studying abroad was the right decision.", vi: "Cuối cùng, cô ấy nhận ra rằng du học là quyết định đúng đắn." },
      { en: "In the end, both sides reached a mutually beneficial agreement.", vi: "Cuối cùng, cả hai bên đã đạt được một thỏa thuận đôi bên cùng có lợi." },
      { en: "Subsequently, the company expanded into three new markets.", vi: "Sau đó, công ty đã mở rộng sang ba thị trường mới." },
      { en: "Overall, the advantages of city life outweigh the disadvantages.", vi: "Nhìn chung, lợi ích của cuộc sống thành thị vượt trội hơn bất lợi." },
      { en: "At first, nobody believed the plan would work, but it eventually succeeded.", vi: "Ban đầu không ai tin kế hoạch sẽ thành công, nhưng cuối cùng nó đã thành công." }
    ],
    mistakes: [
      { wrong: "Firstly... Second... Finally...", right: "Firstly.../Secondly.../Finally...", note: "Giữ tính nhất quán về hình thái — nếu dùng \"firstly\" thì nên dùng \"secondly\"." },
      { wrong: "In conclusion I think that...", right: "In conclusion, I think that...", note: "Cụm từ nối mở đầu câu như \"in conclusion/to conclude\" cần dấu phẩy theo sau." },
      { wrong: "Firstly, is remote work convenient.", right: "Firstly, remote work is convenient.", note: "\"Firstly\" không gây đảo ngữ; giữ trật tự chủ ngữ + động từ bình thường." },
      { wrong: "At the end, I want to say that education matters.", right: "In conclusion/To conclude, I want to say that education matters.", note: "\"At the end\" thường dùng cho quy trình/câu chuyện vật lý; kết luận bài luận nên dùng \"in conclusion/to conclude\"." },
      { wrong: "Firstly, ... Moreover, ... In conclusion, ... Secondly ...", right: "Firstly, ... Secondly, ... Finally/In conclusion, ...", note: "Giữ trình tự logic nhất quán — không đặt \"secondly\" sau \"in conclusion\"." }
    ],
    tips: [
      "Trong Task 2, dùng \"Firstly.../Secondly.../Finally...\" để cấu trúc các luận điểm trong thân bài rõ ràng, tăng điểm Coherence.",
      "Không nên dùng \"Firstly\" nếu bài chỉ có một ý — chỉ dùng khi thực sự liệt kê từ 2 ý trở lên."
    ],
    comparison: {
      title: "Narrative/Essay Sequencing vs Process Sequencing",
      headers: ["Narrative/Essay", "Process (Task 1)"],
      rows: [["Sắp xếp luận điểm/sự kiện, câu chủ động", "Sắp xếp các bước kỹ thuật, thường bị động"], ["Firstly, education matters.", "First, the material is processed."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn từ nối phù hợp để mở đầu luận điểm đầu tiên:", options: ["In conclusion", "Firstly", "As a result", "Despite"], answerIndex: 1, explanation: "\"Firstly\" mở đầu luận điểm đầu tiên trong bài luận." },
      { type: "multiple_choice", question: "Câu nào đúng?", options: ["To conclude I believe the policy works.", "To conclude, I believe the policy works.", "To conclude that I believe the policy works.", "To conclude believe I the policy works."], answerIndex: 1, explanation: "\"To conclude\" cần dấu phẩy theo sau." },
      { type: "fill_blank", question: "Điền từ nối phù hợp: \"___, I was scared of public speaking, but I gradually became confident.\"", answer: "At first", explanation: "\"At first\" diễn tả giai đoạn đầu trong một câu chuyện." },
      { type: "fill_blank", question: "Điền từ nối phù hợp để tổng kết bài luận: \"___, the benefits of exercise are undeniable.\"", answer: "In conclusion/To conclude/Overall", explanation: "Từ nối kết luận đứng cuối bài luận." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Firstly the plan is cost-effective.\"", answer: "Firstly, the plan is cost-effective.", explanation: "\"Firstly\" cần dấu phẩy theo sau." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"In conclusion that the government should act now.\"", answer: "In conclusion, the government should act now.", explanation: "Không dùng \"that\" sau \"in conclusion\"; chỉ cần dấu phẩy." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"firstly...secondly\"): \"Thứ nhất, du lịch mở rộng tầm nhìn. Thứ hai, nó tạo ra những kỷ niệm đáng nhớ.\"", answer: "Firstly, travelling broadens one's perspective. Secondly, it creates memorable experiences.", explanation: "Cặp từ nối \"firstly...secondly\" sắp xếp luận điểm nhất quán." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng \"eventually\"): \"Ban đầu dự án gặp nhiều khó khăn, nhưng cuối cùng nó đã thành công.\"", answer: "At first, the project faced many difficulties, but it eventually succeeded.", explanation: "\"Eventually\" diễn tả kết quả sau một quá trình." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Overall, the benefits of renewable energy outweigh the costs.\"", answer: "Nhìn chung, lợi ích của năng lượng tái tạo vượt trội hơn chi phí.", explanation: "\"Overall\" dùng để tổng kết ý kiến." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"In the beginning, few people supported the idea, but attitudes gradually changed.\"", answer: "Ban đầu, ít người ủng hộ ý tưởng này, nhưng thái độ dần thay đổi.", explanation: "\"In the beginning\" mở đầu câu chuyện/quá trình." },
      { type: "sentence_transformation", question: "Viết lại đoạn văn dùng từ nối trình tự: \"Remote work saves time. Remote work reduces stress. Remote work should be encouraged.\"", answer: "Firstly, remote work saves time. Secondly, it reduces stress. In conclusion, remote work should be encouraged.", explanation: "Sắp xếp 3 luận điểm bằng firstly/secondly/in conclusion." },
      { type: "sentence_transformation", question: "Viết lại câu dùng \"eventually\": \"She struggled at first, but in the end she passed the exam.\"", answer: "She struggled at first, but she eventually passed the exam.", explanation: "\"Eventually\" thay cho \"in the end\", cùng nghĩa \"cuối cùng\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"In conclusion the essay has shown that education is important.\"", answer: "In conclusion, the essay has shown that education is important.", explanation: "Cần dấu phẩy sau \"in conclusion\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Firstly is the cost, secondly is the time.\"", answer: "Firstly, there is the cost. Secondly, there is the time.", explanation: "\"Firstly/secondly\" không gây đảo ngữ; cần cấu trúc câu đầy đủ, tự nhiên." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Firstly, the plan saves money. Second, it saves time.\"", answer: "Lỗi: \"Second\" → sửa thành \"Secondly\" (giữ nhất quán hình thái với \"Firstly\").", explanation: "Cần giữ tính nhất quán: firstly...secondly, không trộn first/second với firstly." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"To conclude I would say the project failed.\"", answer: "Lỗi: thiếu dấu phẩy sau \"To conclude\".", explanation: "\"To conclude\" cần dấu phẩy theo sau khi mở đầu câu." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền từ nối):\nA: How did you find the new job?\nB: ___, I was nervous, but I settled in quickly.", answer: "At first", explanation: "\"At first\" mở đầu một câu chuyện." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: What's your final opinion on remote work?\nB: ___, I think it benefits both employees and employers.", answer: "Overall/In conclusion/To conclude", explanation: "Từ nối tổng kết ý kiến cuối cùng." }
    ],
    quiz: [
      { question: "Chọn từ nối phù hợp để kết luận bài luận:", options: ["Firstly", "Moreover", "In conclusion", "Whereas"], answerIndex: 2, explanation: "\"In conclusion\" dùng để tổng kết bài luận." },
      { question: "Câu nào đúng?", options: ["In conclusion the plan is effective.", "In conclusion, the plan is effective.", "In the conclusion, the plan is effective.", "As conclusion, the plan is effective."], answerIndex: 1, explanation: "\"In conclusion,\" cần dấu phẩy sau khi mở đầu câu." },
      { question: "Chọn từ nối phù hợp cho luận điểm thứ hai (sau khi đã dùng \"Firstly\"):", options: ["Second", "Secondly", "Two", "Next first"], answerIndex: 1, explanation: "Giữ nhất quán hình thái: firstly...secondly." },
      { question: "Câu nào đúng?", options: ["At first I was nervous, eventually I relaxed.", "At first, I was nervous, but eventually I relaxed.", "At the first, I was nervous, eventually relaxed.", "First I nervous, eventually relaxed."], answerIndex: 1, explanation: "\"At first\" mở đầu câu, cần liên từ \"but\" để nối với ý sau." },
      { question: "Chọn từ nối phù hợp: \"___, the benefits of this policy outweigh its drawbacks.\"", options: ["Firstly", "Overall", "Despite", "Because"], answerIndex: 1, explanation: "\"Overall\" dùng để tổng kết quan điểm chung." }
    ],
    summary: "Từ nối trình tự trong bài luận/kể chuyện (firstly, secondly, eventually, in conclusion) giúp sắp xếp luận điểm hoặc sự kiện mạch lạc, thường đi với câu chủ động."
  })
];
