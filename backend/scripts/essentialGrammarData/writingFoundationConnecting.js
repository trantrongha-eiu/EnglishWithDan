"use strict";

// Writing Foundation — Part 3 & 4: connecting sentences (compound + complex)
// and relative clauses (A2+). Helpers: writingFoundationHelpers.js
const { lesson } = require("./builder");
const { CATEGORY, STEP, eg, err, mc, ex, qz, table, c, t } = require("./writingFoundationHelpers");

module.exports = [
  // ─────────────────────────────────────────────────────────────
  // 4. COMPOUND SENTENCES – AND, BUT, SO
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-and-but-so", title: "Compound Sentences: And, But, So", icon: "🔗", orderIndex: 41,
    overview: "Câu ghép (compound sentence) = hai câu đơn hoàn chỉnh (mỗi câu có S + V) nối bằng một liên từ: AND (bổ sung), BUT (tương phản), SO (kết quả). Trước khi nối, phải hiểu QUAN HỆ NGHĨA giữa hai ý — đây là bước học sinh hay bỏ qua nhất, dẫn đến dùng sai liên từ.",
    formula: [
      { label: "AND – và (bổ sung)", structure: "S + V ..., and S + V ...", example: "I like English, and my brother likes French." },
      { label: "BUT – nhưng (tương phản)", structure: "S + V ..., but S + V ...", example: "The book is interesting, but it is expensive." },
      { label: "SO – vì vậy / nên (kết quả)", structure: "S + V (nguyên nhân), so S + V (kết quả)", example: "It was raining, so we stayed at home." },
      { label: "Cùng chủ ngữ (rút gọn)", structure: "S + V1 ... and/but + V2 ... (bỏ chủ ngữ thứ hai, không cần dấu phẩy)", example: "I like reading and enjoy writing. / He is friendly and helpful." }
    ],
    usage: [
      { title: "Bước 1 – Hiểu nghĩa: hai ý có quan hệ gì?", description: "Ý 2 thêm thông tin cùng chiều → and. Ý 2 trái ngược / bất ngờ so với ý 1 → but. Ý 2 là kết quả của ý 1 → so." },
      { title: "Bước 2 – Chọn cấu trúc: SO đứng trước KẾT QUẢ", description: "I was tired (nguyên nhân), so I went to bed early (kết quả). Không viết I went to bed early, so I was tired." },
      { title: "Bước 3 – Viết câu: mỗi vế là một câu hoàn chỉnh", description: "Mỗi vế phải có S + V. Đặt dấu phẩy TRƯỚC and/but/so khi nối hai câu đầy đủ. Không nối hai câu chỉ bằng dấu phẩy (I was tired, I went to bed ❌)." },
      { title: "Bước 4 – Mở rộng câu", description: "Mở rộng từng vế bằng nơi chốn/thời gian/mức độ: I was very tired after school, so I went to bed early." },
      { title: "Bước 5 – Kết nối nhiều ý", description: "Có thể nối 3 ý: English is difficult, but I like it, so I practise every day. Không nên nối quá 3 vế trong một câu." },
      { title: "Lưu ý: văn viết học thuật", description: "Trong bài luận IELTS, hạn chế bắt đầu câu bằng And/But/So; thay bằng In addition, However, Therefore (xem chuyên đề Linking Words)." }
    ],
    signalWords: ["and – và, cũng", "but – nhưng", "so – vì vậy, nên", ", and / , but / , so (nối 2 câu đầy đủ)", "cùng chủ ngữ → bỏ chủ ngữ, bỏ dấu phẩy"],
    examples: [
      eg("I like English, and I like mathematics.", "Tôi thích tiếng Anh, và tôi thích toán."),
      eg("She is friendly, and she is helpful.", "Cô ấy thân thiện, và cô ấy hay giúp đỡ người khác."),
      eg("I study English, and my brother studies French.", "Tôi học tiếng Anh, còn anh trai tôi học tiếng Pháp."),
      eg("I like reading and enjoy writing.", "Tôi thích đọc và thích viết."),
      eg("I like English, but I don't like mathematics.", "Tôi thích tiếng Anh, nhưng tôi không thích toán."),
      eg("She is young, but she is very responsible.", "Cô ấy còn trẻ, nhưng rất có trách nhiệm."),
      eg("The book is interesting, but it is expensive.", "Cuốn sách thú vị, nhưng nó đắt."),
      eg("I was tired, so I went to bed early.", "Tôi mệt, vì vậy tôi đi ngủ sớm."),
      eg("It was raining, so we stayed at home.", "Trời mưa, nên chúng tôi ở nhà."),
      eg("English is important, so I study it every day.", "Tiếng Anh quan trọng, vì vậy tôi học nó mỗi ngày."),
      eg("The restaurant was expensive, but the food was delicious.", "Nhà hàng đắt, nhưng đồ ăn rất ngon."),
      eg("English is difficult, but I like it, so I practise every day.", "Tiếng Anh khó, nhưng tôi thích nó, nên tôi luyện tập mỗi ngày.")
    ],
    mistakes: [
      err("I went to bed early, so I was tired.", "I was tired, so I went to bed early.", "SO đứng trước KẾT QUẢ. Đi ngủ sớm là kết quả của việc mệt."),
      err("Because I was tired, so I went to bed early.", "I was tired, so I went to bed early. / Because I was tired, I went to bed early.", "Tiếng Việt nói “Vì… nên…”, tiếng Anh chỉ dùng MỘT từ: because HOẶC so."),
      err("I like football, I like basketball.", "I like football, and I like basketball.", "Không nối hai câu hoàn chỉnh chỉ bằng dấu phẩy — cần liên từ hoặc dấu chấm."),
      err("She studied hard, so she failed the exam.", "She studied hard, but she failed the exam.", "Học chăm mà vẫn trượt là điều trái ngược → but."),
      err("I like English, but I like maths.", "I like English, and I like maths.", "Hai ý cùng chiều (đều thích) → and."),
      err("He is friendly, and helpful.", "He is friendly and helpful.", "Khi bỏ chủ ngữ + động từ của vế 2 (chỉ nối hai tính từ), không dùng dấu phẩy.")
    ],
    tips: [
      "Đọc to hai ý và tự hỏi: “ý 2 thêm thông tin, trái ngược, hay là kết quả?” — trả lời được câu này là chọn đúng liên từ.",
      "Đừng nối and… and… and… liên tục. Mỗi câu tối đa 2–3 vế, xen kẽ với câu đơn để bài viết dễ đọc.",
      "IELTS Speaking: and/but/so giúp câu trả lời trôi chảy hơn: I live in a small town, but it is very lively, so I never feel bored."
    ],
    comparison: [
      table("AND – BUT – SO", ["Liên từ", "Quan hệ nghĩa", "Tiếng Việt", "Ví dụ"], [
        ["and", "Bổ sung, cùng chiều", "và, còn", "She is friendly, and she is helpful."],
        ["but", "Tương phản, trái ngược", "nhưng", "The book is interesting, but it is expensive."],
        ["so", "Kết quả", "vì vậy, nên", "It was raining, so we stayed at home."]
      ]),
      table("Dấu phẩy khi nối câu", ["Trường hợp", "Dấu phẩy?", "Ví dụ"], [
        ["Nối hai câu đầy đủ (mỗi vế có S + V)", "Có, trước liên từ", "I was tired, so I went to bed early."],
        ["Cùng chủ ngữ, bỏ chủ ngữ vế sau", "Không", "I like reading and enjoy writing."],
        ["Nối hai tính từ / danh từ", "Không", "He is friendly and helpful."],
        ["Hai câu đầy đủ, không có liên từ", "Sai! Dùng liên từ hoặc dấu chấm", "I was tired, I went to bed. ❌"]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Hai ý “It was cold. We stayed inside.” có quan hệ gì?", ["Bổ sung → and", "Tương phản → but", "Kết quả → so", "Không có quan hệ"], 2, "Ở trong nhà là kết quả của trời lạnh → It was cold, so we stayed inside."),
      mc(STEP.structure + "Chọn đáp án đúng: “The phone is very old, ___ it still works well.”", ["and", "but", "so", "because"], 1, "Cũ nhưng vẫn chạy tốt → tương phản → but."),
      mc(STEP.structure + "Chọn đáp án đúng: “I didn't have breakfast, ___ I was hungry at 10 a.m.”", ["and", "but", "so", "or"], 2, "Đói là kết quả của việc không ăn sáng → so."),
      mc(STEP.write + "Câu nào đúng?", ["I was tired, I went to bed early.", "Because I was tired, so I went to bed early.", "I was tired, so I went to bed early.", "I was tired so, I went to bed early."], 2, "Hai câu đầy đủ nối bằng “, so”."),
      ex("fill_blank", STEP.structure + "Điền and / but / so: “My sister plays the piano, ___ my brother plays the guitar.”", "and", "Hai thông tin bổ sung cho nhau → and."),
      ex("fill_blank", STEP.structure + "Điền and / but / so: “He studied very hard, ___ he got a high score.”", "so", "Điểm cao là kết quả của việc học chăm → so."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “Because it was raining, so we stayed at home.”", "It was raining, so we stayed at home. / Because it was raining, we stayed at home.", "Không dùng because và so trong cùng một câu."),
      ex("error_correction", STEP.meaning + "Sửa lỗi: “She studied hard, so she failed the exam.”", "She studied hard, but she failed the exam.", "Học chăm mà trượt → trái ngược → but."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Tôi thích tiếng Anh, nhưng tôi không thích toán.”", "I like English, but I don't like maths.", "Tương phản → but; vế 2 phủ định với don't + V."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Hôm qua trời mưa, vì vậy chúng tôi ở nhà.”", "It rained yesterday, so we stayed at home. / It was raining yesterday, so we stayed at home.", "Kết quả → so; quá khứ đơn."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “She is young, but she is very responsible.”", "Cô ấy còn trẻ, nhưng cô ấy rất có trách nhiệm.", "But = nhưng."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “English is important, so I study it every day.”", "Tiếng Anh quan trọng, vì vậy tôi học nó mỗi ngày.", "So = vì vậy / nên."),
      ex("sentence_transformation", STEP.connect + "Nối hai câu bằng liên từ thích hợp: “The book is interesting. It is expensive.”", "The book is interesting, but it is expensive.", "Thú vị nhưng đắt → but."),
      ex("sentence_transformation", STEP.connect + "Nối hai câu và rút gọn chủ ngữ: “I like reading. I enjoy writing.”", "I like reading and enjoy writing.", "Cùng chủ ngữ I → bỏ I ở vế 2, không dùng dấu phẩy."),
      ex("sentence_transformation", STEP.connect + "Nối hai câu: “I missed the bus. I was late for school.”", "I missed the bus, so I was late for school.", "Đi học muộn là kết quả → so."),
      ex("rewrite", STEP.expand + "Mở rộng từng vế của câu “I was tired, so I went to bed.” — thêm very, after school, early.", "I was very tired after school, so I went to bed early.", "Mở rộng vế 1 bằng very + after school; vế 2 bằng early."),
      ex("rewrite", STEP.connect + "Nối 3 ý thành một câu bằng but và so: “English is difficult. I like it. I practise every day.”", "English is difficult, but I like it, so I practise every day.", "Khó nhưng thích (but) → nên luyện tập (so)."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “I like football, I like basketball.”", "Lỗi: thiếu liên từ → I like football, and I like basketball.", "Hai câu đầy đủ không được nối chỉ bằng dấu phẩy."),
      ex("find_mistake", STEP.meaning + "Tìm lỗi sai: “It was very hot, but we turned on the fan.”", "Lỗi: but → so.", "Bật quạt là kết quả của trời nóng → so."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại với and / but / so:\nA: Did you go to the beach last weekend?\nB: No. I wanted to go, ___ it rained all day, ___ I stayed at home.\nA: What did you do at home?\nB: I read a book, ___ I watched a film.", "but / so / and", "Muốn đi nhưng mưa (but) → nên ở nhà (so); đọc sách và xem phim (and).")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Điền AND / BUT / SO",
      intro: "Điền and, but hoặc so. Trước tiên xác định ý 2 là bổ sung, tương phản hay kết quả. Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("I like apples, ___ my sister likes oranges.", ["and", "but"], "Hai sở thích khác nhau: and (bổ sung) hoặc but (đối lập) đều được."),
        c("It was late, ___ we took a taxi home.", "so", "Đi taxi là kết quả của việc muộn."),
        c("The test was difficult, ___ I passed it.", "but", "Khó nhưng vẫn đậu → tương phản."),
        c("She is clever, ___ she is very kind.", "and", "Hai ưu điểm → bổ sung."),
        c("I forgot my umbrella, ___ I got wet.", "so", "Bị ướt là kết quả."),
        c("He is rich, ___ he isn't happy.", "but", "Giàu nhưng không vui → tương phản."),
        c("We went to the market, ___ we bought some fruit.", "and", "Hai hành động nối tiếp → and."),
        c("My phone was broken, ___ I couldn't call you.", "so", "Không gọi được là kết quả."),
        c("I wanted to buy the shoes, ___ they were too expensive.", "but", "Muốn mua nhưng quá đắt → tương phản."),
        c("The film was boring, ___ I fell asleep.", "so", "Ngủ gật là kết quả của phim chán."),
        c("My father reads the newspaper, ___ my mother cooks breakfast.", "and", "Hai thông tin song song → and."),
        c("It's sunny today, ___ let's go to the park.", "so", "Đề nghị đi chơi là kết quả của trời đẹp.")
      ]
    }],
    translationDrills: [
      {
        title: "Nối câu với AND / BUT / SO",
        intro: "Nối hai câu thành MỘT câu ghép bằng and, but hoặc so.",
        items: [
          t("I like English. / I don't like mathematics.", ["I like English, but I don't like mathematics.", "I like English but not mathematics."], "Thích – không thích → tương phản."),
          t("She was tired. / She went to bed early.", "She was tired, so she went to bed early.", "Đi ngủ sớm là kết quả."),
          t("He is friendly. / He is helpful.", ["He is friendly and helpful.", "He is friendly, and he is helpful."], "Hai ưu điểm → and; có thể rút gọn: friendly and helpful."),
          t("I wanted to go outside. / It was raining.", "I wanted to go outside, but it was raining.", "Muốn ra ngoài nhưng trời mưa → but."),
          t("English is important. / I study it every day.", "English is important, so I study it every day.", "Học mỗi ngày là kết quả → so."),
          t("My brother likes football. / I like basketball.", ["My brother likes football, but I like basketball.", "My brother likes football, and I like basketball."], "Hai sở thích khác nhau → but (đối lập) hoặc and."),
          t("The restaurant was expensive. / The food was delicious.", "The restaurant was expensive, but the food was delicious.", "Đắt nhưng ngon → but."),
          t("She studied hard. / She passed the exam.", "She studied hard, so she passed the exam.", "Đậu là kết quả của học chăm → so.")
        ]
      },
      {
        title: "Luyện dịch câu ghép: Việt → Anh",
        intro: "Dịch sang tiếng Anh, dùng and / but / so đúng nghĩa.",
        items: [
          t("Tôi thích đọc sách, và em gái tôi thích vẽ.", ["I like reading books, and my younger sister likes drawing.", "I like reading, and my sister likes drawing.", "I like reading books, and my sister likes drawing.", "I like reading, and my younger sister likes drawing.", "I like reading books, and my little sister likes drawing."], "Hai chủ ngữ khác nhau → giữ cả hai, nối bằng “, and”."),
          t("Trời lạnh, nên tôi mặc áo khoác.", ["It was cold, so I wore a coat.", "It is cold, so I wear a coat.", "It was cold, so I wore a jacket.", "It is cold, so I am wearing a coat.", "It is cold, so I am wearing a jacket."], "Mặc áo khoác là kết quả → so."),
          t("Ngôi nhà nhỏ nhưng rất đẹp.", ["The house is small but very beautiful.", "The house is small, but it is very beautiful."], "Tương phản → but."),
          t("Anh ấy bị ốm, vì vậy anh ấy không đi học.", ["He was sick, so he didn't go to school.", "He was ill, so he didn't go to school.", "He is sick, so he doesn't go to school.", "He was sick, so he did not go to school."], "Không đi học là kết quả → so."),
          t("Tôi gọi cho cô ấy, nhưng cô ấy không trả lời.", ["I called her, but she didn't answer.", "I phoned her, but she didn't answer.", "I called her, but she didn't reply."], "Tương phản → but; quá khứ đơn."),
          t("Chúng tôi chơi bóng đá và sau đó đi ăn kem.", ["We played football and then ate ice cream.", "We played football and then went to eat ice cream.", "We played football, and then we ate ice cream.", "We played football and then had ice cream."], "Cùng chủ ngữ → có thể bỏ “we” ở vế sau."),
          t("Cô ấy dậy muộn, nên cô ấy lỡ chuyến xe buýt.", ["She got up late, so she missed the bus.", "She woke up late, so she missed the bus."], "Lỡ xe là kết quả → so."),
          t("Bài tập dễ, nhưng tôi vẫn mắc lỗi.", ["The exercise was easy, but I still made mistakes.", "The exercise was easy, but I still made a mistake.", "The homework was easy, but I still made mistakes."], "Tương phản → but; still = vẫn.")
        ]
      }
    ],
    quiz: [
      qz("Chọn đáp án đúng: “She was hungry, ___ she made a sandwich.”", ["and", "but", "so", "or"], 2, "Làm bánh là kết quả của đói."),
      qz("Chọn đáp án đúng: “I studied hard, ___ I didn't pass the test.”", ["and", "but", "so", "because"], 1, "Học chăm nhưng không đậu → but."),
      qz("Câu nào đúng dấu câu?", ["I like tea, I don't like coffee.", "I like tea, but I don't like coffee.", "I like tea but, I don't like coffee.", "I like tea. But, I don't like coffee"], 1, "Hai câu đầy đủ: dấu phẩy đứng TRƯỚC but."),
      qz("Chọn đáp án đúng: “My father is a doctor, ___ my mother is a teacher.”", ["so", "and", "because", "although"], 1, "Hai thông tin bổ sung → and."),
      qz("Câu nào SAI?", ["It rained, so we stayed in.", "Because it rained, so we stayed in.", "Because it rained, we stayed in.", "It rained, and the road was wet."], 1, "Không dùng because và so cùng lúc."),
      qz("Chọn câu rút gọn đúng của “She sings well. She dances well.”", ["She sings well, and dances well.", "She sings well and dances well.", "She sings and well dances well.", "She sings well so dances well."], 1, "Cùng chủ ngữ → bỏ chủ ngữ, không dùng dấu phẩy.")
    ],
    summary: "Câu ghép = Câu 1 + , and / but / so + Câu 2. AND bổ sung, BUT tương phản, SO đứng trước kết quả. Hiểu quan hệ nghĩa trước khi chọn liên từ; không dùng because + so cùng lúc và không nối hai câu chỉ bằng dấu phẩy."
  }),

  // ─────────────────────────────────────────────────────────────
  // 5. COMPLEX SENTENCES – BECAUSE, ALTHOUGH, DESPITE
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-because-although-despite", title: "Complex Sentences: Because, Although, Despite", icon: "🧠", orderIndex: 42,
    overview: "Câu phức (complex sentence) gồm một mệnh đề chính và một mệnh đề phụ bắt đầu bằng because (lý do) hoặc although (sự nhượng bộ: “mặc dù… vẫn…”). DESPITE có cùng nghĩa với although nhưng theo sau là danh từ hoặc V-ing, không phải một câu. Mấu chốt: nhìn xem phía SAU từ nối là S + V hay N/V-ing.",
    formula: [
      { label: "BECAUSE – bởi vì (lý do)", structure: "S + V + because + S + V  •  Because + S + V, S + V", example: "I study English because I want to get a good job. / Because I was tired, I went to bed early." },
      { label: "ALTHOUGH – mặc dù", structure: "Although + S + V, S + V  •  S + V + although + S + V", example: "Although it was raining, we went outside. / I like this restaurant although it is expensive." },
      { label: "DESPITE – mặc dù", structure: "Despite + Noun / V-ing, S + V", example: "Despite the rain, we went outside. / Despite being tired, she continued studying." },
      { label: "Bonus: BECAUSE OF – vì", structure: "S + V + because of + Noun / V-ing", example: "We stayed at home because of the rain." }
    ],
    usage: [
      { title: "Bước 1 – Hiểu nghĩa: ý phụ là LÝ DO hay là điều TRÁI NGƯỢC?", description: "Ý phụ giải thích “tại sao” → because. Ý phụ là một trở ngại nhưng ý chính vẫn xảy ra (“mặc dù… vẫn…”) → although / despite." },
      { title: "Bước 2 – Chọn cấu trúc: nhìn phía SAU từ nối", description: "S + V (một câu) → because / although. Danh từ hoặc V-ing → because of / despite. Although it was raining = Despite the rain." },
      { title: "Bước 3 – Viết câu: mệnh đề phụ không đứng một mình", description: "Because I was tired. ❌ (thiếu mệnh đề chính). Khi mệnh đề phụ đứng đầu câu, dùng dấu phẩy ngăn cách: Although she was tired, she continued studying." },
      { title: "Bước 4 – Mở rộng / biến đổi câu", description: "Although she was tired → Despite being tired (cùng chủ ngữ) → Despite her tiredness. I stayed at home because I was sick ↔ I was sick, so I stayed at home." },
      { title: "Bước 5 – Kết nối câu", description: "Kết hợp với câu ghép: Although English is difficult, I enjoy it because it is useful for my future." },
      { title: "Lưu ý: “Vì… nên…”, “Mặc dù… nhưng…”", description: "Tiếng Anh chỉ dùng MỘT từ nối cho mỗi quan hệ: Although…, (không thêm but). Because…, (không thêm so)." }
    ],
    signalWords: ["because + S + V", "because of + N / V-ing", "although / even though + S + V", "despite / in spite of + N / V-ing", "despite the fact that + S + V"],
    examples: [
      eg("I study English because I want to get a good job.", "Tôi học tiếng Anh vì tôi muốn có một công việc tốt."),
      eg("She stayed at home because she was sick.", "Cô ấy ở nhà vì cô ấy bị ốm."),
      eg("I like this book because it is interesting.", "Tôi thích cuốn sách này vì nó thú vị."),
      eg("Because it was raining, we stayed at home.", "Vì trời mưa, chúng tôi ở nhà."),
      eg("Although it was raining, we went outside.", "Mặc dù trời mưa, chúng tôi vẫn ra ngoài."),
      eg("Although she was tired, she continued studying.", "Mặc dù mệt, cô ấy vẫn tiếp tục học."),
      eg("I like this restaurant although it is expensive.", "Tôi thích nhà hàng này mặc dù nó đắt."),
      eg("Despite the rain, we went outside.", "Bất chấp trời mưa, chúng tôi vẫn ra ngoài."),
      eg("Despite being tired, she continued studying.", "Dù mệt, cô ấy vẫn tiếp tục học."),
      eg("Despite the high price, I bought the book.", "Dù giá cao, tôi vẫn mua cuốn sách."),
      eg("We cancelled the picnic because of the bad weather.", "Chúng tôi hủy buổi dã ngoại vì thời tiết xấu."),
      eg("Although English is difficult, I enjoy learning it because it is useful.", "Mặc dù tiếng Anh khó, tôi vẫn thích học vì nó hữu ích.")
    ],
    mistakes: [
      err("Although it was raining, but we went outside.", "Although it was raining, we went outside.", "Không dùng but cùng với although trong một câu."),
      err("Despite she was tired, she continued studying.", "Despite being tired, she continued studying. / Although she was tired, she continued studying.", "Sau despite là N / V-ing, không phải S + V."),
      err("Because I was tired, so I went to bed early.", "Because I was tired, I went to bed early.", "Không dùng because cùng với so."),
      err("I stayed at home because the rain.", "I stayed at home because of the rain.", "Sau because là S + V; trước danh từ phải dùng because of."),
      err("Despite of the rain, we went out.", "Despite the rain, we went out. / In spite of the rain, we went out.", "Despite không đi với “of”; in spite of thì có “of”."),
      err("I like this book. Because it is interesting.", "I like this book because it is interesting.", "Mệnh đề “Because…” không đứng một mình thành câu riêng trong văn viết.")
    ],
    tips: [
      "Mẹo chọn Although hay Despite: sau chỗ trống có chủ ngữ + động từ → Although. Sau chỗ trống là danh từ hoặc V-ing → Despite.",
      "Despite + V-ing chỉ dùng khi hai vế CÙNG chủ ngữ: Despite being tired, she… (người mệt chính là she).",
      "IELTS Writing Task 2: câu phức với although/because giúp tăng điểm Grammatical Range — nhưng chỉ khi viết đúng: Although technology brings many benefits, it also causes some problems."
    ],
    comparison: [
      table("Although vs Despite", ["Although", "Despite"], [
        ["Although + S + V", "Despite + N / V-ing"],
        ["Although it was raining, ...", "Despite the rain, ..."],
        ["Although she was tired, ...", "Despite being tired, ..."],
        ["Although the price was high, ...", "Despite the high price, ..."]
      ]),
      table("Từ nối và thứ đứng sau", ["Từ nối", "Nghĩa", "Theo sau là", "Ví dụ"], [
        ["because", "bởi vì", "S + V", "because it was raining"],
        ["because of", "vì", "N / V-ing", "because of the rain"],
        ["although / even though", "mặc dù", "S + V", "although it was raining"],
        ["despite / in spite of", "mặc dù, bất chấp", "N / V-ing", "despite the rain / despite being busy"],
        ["so (câu ghép)", "vì vậy", "S + V (kết quả)", "it was raining, so we stayed home"]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "“___ it was late, she continued working.” Ý phụ “it was late” là gì so với ý chính?", ["Lý do → Because", "Điều trái ngược → Although", "Kết quả → So", "Danh từ → Despite"], 1, "Muộn nhưng vẫn làm tiếp → nhượng bộ → Although (sau đó là S + V)."),
      mc(STEP.structure + "Chọn đáp án đúng: “___ the heavy traffic, we arrived on time.”", ["Although", "Because", "Despite", "But"], 2, "Sau chỗ trống là cụm danh từ (the heavy traffic) và nghĩa trái ngược → Despite."),
      mc(STEP.structure + "Chọn đáp án đúng: “She stayed at home ___ she was sick.”", ["although", "despite", "because", "so"], 2, "Ốm là lý do → because + S + V."),
      mc(STEP.structure + "Chọn đáp án đúng: “We cancelled the picnic ___ the bad weather.”", ["because", "because of", "although", "despite"], 1, "Lý do + cụm danh từ → because of."),
      ex("fill_blank", STEP.write + "Hoàn thành câu với một lý do: “I study English because ___.”", "Gợi ý: I want to study abroad. / it is useful for my future job.", "Sau because phải là một câu có S + V."),
      ex("fill_blank", STEP.write + "Hoàn thành câu: “Although I was tired, ___.”", "Gợi ý: I finished my homework. / I went to the gym.", "Vế sau là một việc VẪN xảy ra dù mệt; không thêm but."),
      ex("fill_blank", STEP.write + "Hoàn thành câu: “Despite being busy, ___.”", "Gợi ý: she always helps her mother. / he called me every day.", "Despite + V-ing; vế sau là S + V hoàn chỉnh."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “Although it was raining, but we went outside.”", "Although it was raining, we went outside.", "Bỏ but — although đã mang nghĩa “mặc dù… nhưng”."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “Despite she was tired, she continued studying.”", "Despite being tired, she continued studying. / Although she was tired, she continued studying.", "Despite + V-ing; hoặc đổi sang Although + S + V."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Mặc dù trời mưa, chúng tôi vẫn đi học.”", "Although it was raining, we still went to school. / Despite the rain, we went to school.", "Although + S + V hoặc Despite + N."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Tôi thích cuốn sách này vì nó thú vị.”", "I like this book because it is interesting.", "Because + S + V."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “Despite the high price, I bought the book.”", "Dù giá cao, tôi vẫn mua cuốn sách.", "Despite + cụm danh từ = “dù / bất chấp”."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “Although English is difficult, I enjoy learning it because it is useful.”", "Mặc dù tiếng Anh khó, tôi vẫn thích học vì nó hữu ích.", "Một câu có cả although (nhượng bộ) và because (lý do)."),
      ex("sentence_transformation", STEP.expand + "Viết lại: “Although it was raining, we went outside.” → Despite ___", "Despite the rain, we went outside.", "It was raining → danh từ the rain."),
      ex("sentence_transformation", STEP.expand + "Viết lại: “Despite being tired, she continued studying.” → Although ___", "Although she was tired, she continued studying.", "Being tired → she was tired (S + V)."),
      ex("sentence_transformation", STEP.expand + "Viết lại: “I stayed at home because I was sick.” → I was sick, so ___", "I was sick, so I stayed at home.", "Because (lý do) ↔ so (kết quả): đổi chỗ hai vế."),
      ex("rewrite", STEP.expand + "Viết lại: “Although English is difficult, I enjoy learning it.” → English is difficult, but ___", "English is difficult, but I enjoy learning it.", "Although (câu phức) ↔ but (câu ghép)."),
      ex("rewrite", STEP.connect + "Kết hợp 3 ý thành 1 câu bằng although và because: English is difficult / I study it every day / I want to study abroad.", "Although English is difficult, I study it every day because I want to study abroad.", "Although + nhượng bộ, mệnh đề chính, because + lý do."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “I stayed at home because the rain.”", "Lỗi: because the rain → because of the rain.", "Trước danh từ dùng because of."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “Despite of the traffic, he arrived early.”", "Lỗi: Despite of → Despite (hoặc In spite of).", "Despite không có “of”."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại với Because / despite / Although:\nA: Why didn't you go to the party?\nB: ___ I had a lot of homework.\nA: But you went to the cinema ___ having so much homework!\nB: Yes… ___ I was busy, I really wanted to see that film.", "Because / despite / Although", "Lý do → Because; trước V-ing → despite; trước S + V và nghĩa nhượng bộ → Although.")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Điền because / because of / although / despite",
      intro: "Điền một từ nối. Bước 1: ý phụ là lý do hay điều trái ngược? Bước 2: phía sau là S + V hay danh từ/V-ing? Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("___ it was cold, he didn't wear a coat.", ["Although", "Even though"], "Trái ngược + S + V → Although."),
        c("She was late ___ the traffic jam.", "because of", "Lý do + cụm danh từ → because of."),
        c("___ the noise, I slept well.", ["Despite", "In spite of"], "Trái ngược + danh từ → Despite."),
        c("I can't go out ___ I have a lot of homework.", "because", "Lý do + S + V → because."),
        c("___ having little money, they were happy.", ["Despite", "In spite of"], "Trái ngược + V-ing → Despite."),
        c("He passed the exam ___ he studied hard.", "because", "Lý do + S + V → because."),
        c("We enjoyed the trip ___ the bad weather.", ["despite", "in spite of"], "Trái ngược + danh từ → despite."),
        c("___ the food was cheap, it was delicious.", ["Although", "Even though"], "Trái ngược + S + V → Although."),
        c("The match was cancelled ___ the heavy rain.", "because of", "Lý do + danh từ → because of."),
        c("I like her ___ she is always honest.", "because", "Lý do + S + V → because."),
        c("___ he is very young, he is very responsible.", ["Although", "Even though"], "Trái ngược + S + V → Although."),
        c("She went to work ___ feeling ill.", ["despite", "in spite of"], "Trái ngược + V-ing → despite.")
      ]
    }],
    translationDrills: [
      {
        title: "Viết lại câu: Although ↔ Despite ↔ but / so",
        intro: "Viết lại câu bắt đầu bằng phần cho sẵn, giữ nguyên nghĩa.",
        items: [
          t("Although she was ill, she went to work. → Despite …", ["Despite being ill, she went to work.", "Despite her illness, she went to work."], "Cùng chủ ngữ → Despite + being + Adj."),
          t("Although the weather was bad, we played football. → Despite …", "Despite the bad weather, we played football.", "The weather was bad → the bad weather."),
          t("Despite the high price, I bought the phone. → Although …", ["Although the price was high, I bought the phone.", "Although the phone was expensive, I bought it.", "Although it was expensive, I bought the phone."], "The high price → the price was high."),
          t("Despite being tired, he finished the report. → Although …", "Although he was tired, he finished the report.", "Being tired → he was tired."),
          t("I stayed at home because I was sick. → I was sick, so …", "I was sick, so I stayed at home.", "Because ↔ so."),
          t("It was raining, so we cancelled the trip. → Because …", "Because it was raining, we cancelled the trip.", "Because + S + V đứng đầu câu, có dấu phẩy."),
          t("We stayed indoors because it was raining. → We stayed indoors because of …", "We stayed indoors because of the rain.", "It was raining → the rain."),
          t("Although English is difficult, I enjoy learning it. → English is difficult, but …", "English is difficult, but I enjoy learning it.", "Although ↔ but.")
        ]
      },
      {
        title: "Luyện dịch câu phức: Việt → Anh",
        intro: "Dịch sang tiếng Anh, dùng because / although / despite đúng cấu trúc.",
        items: [
          t("Tôi học tiếng Anh vì tôi muốn có một công việc tốt.", ["I study English because I want to get a good job.", "I study English because I want to have a good job.", "I learn English because I want to get a good job.", "I learn English because I want to have a good job."], "Because + S + V."),
          t("Cô ấy ở nhà vì cô ấy bị ốm.", ["She stayed at home because she was sick.", "She stayed at home because she was ill.", "She stays at home because she is sick.", "She is at home because she is sick."], "Lý do → because."),
          t("Mặc dù trời mưa, chúng tôi vẫn ra ngoài.", ["Although it was raining, we went outside.", "Although it was raining, we still went outside.", "Although it rained, we still went out.", "Although it was raining, we still went out.", "Although it rained, we went out."], "Although + S + V, không thêm but."),
          t("Dù mệt, cô ấy vẫn tiếp tục học.", ["Although she was tired, she continued studying.", "Although she was tired, she kept studying.", "Despite being tired, she continued studying.", "Despite being tired, she kept studying.", "Although she was tired, she continued to study.", "Despite being tired, she continued to study."], "Although she was tired / Despite being tired."),
          t("Chúng tôi hủy buổi dã ngoại vì thời tiết xấu.", ["We cancelled the picnic because of the bad weather.", "We canceled the picnic because of the bad weather.", "We cancelled the picnic because the weather was bad.", "We canceled the picnic because the weather was bad."], "Because of + N, hoặc because + S + V."),
          t("Mặc dù anh ấy giàu, anh ấy không hạnh phúc.", ["Although he is rich, he is not happy.", "Although he is rich, he is unhappy.", "Despite being rich, he is not happy."], "Không dùng “but” sau although."),
          t("Bất chấp tắc đường, cô ấy đến đúng giờ.", ["Despite the traffic jam, she arrived on time.", "Despite the traffic, she arrived on time.", "In spite of the traffic jam, she arrived on time.", "Despite the heavy traffic, she arrived on time."], "Despite + cụm danh từ."),
          t("Tôi thích thành phố này vì người dân rất thân thiện.", ["I like this city because the people are very friendly.", "I like this city because people are very friendly.", "I like this city because the people here are very friendly."], "Because + S + be + Adj.")
        ]
      }
    ],
    quiz: [
      qz("Chọn đáp án đúng: “___ he was hungry, he didn't eat anything.”", ["Because", "Although", "Despite", "So"], 1, "Đói nhưng không ăn → trái ngược; sau là S + V → Although."),
      qz("Chọn đáp án đúng: “She couldn't sleep ___ the noise.”", ["because", "because of", "although", "despite"], 1, "Lý do + danh từ → because of."),
      qz("Chọn đáp án đúng: “___ being tired, he kept running.”", ["Although", "Because", "Despite", "Even though"], 2, "Sau chỗ trống là V-ing → Despite."),
      qz("Câu nào đúng?", ["Although it was cold, but we swam.", "Despite it was cold, we swam.", "Although it was cold, we swam.", "Despite of the cold, we swam."], 2, "Although + S + V, không thêm but."),
      qz("Câu nào cùng nghĩa với “I was hungry, so I ate a cake.”?", ["Although I was hungry, I ate a cake.", "Because I was hungry, I ate a cake.", "Despite being hungry, I ate a cake.", "I was hungry because I ate a cake."], 1, "So (kết quả) ↔ because (lý do)."),
      qz("Chọn đáp án đúng: “I bought the dress ___ it was expensive.”", ["because of", "despite", "although", "so"], 2, "Trái ngược + S + V → although.")
    ],
    summary: "Because + S + V (lý do) – because of + N. Although + S + V (mặc dù) – despite / in spite of + N / V-ing. Nhìn phía SAU từ nối để chọn đúng; không dùng although + but hay because + so trong cùng một câu."
  }),

  // ─────────────────────────────────────────────────────────────
  // 6. RELATIVE CLAUSES – WHO, WHOM, WHICH, WHOSE, WHERE, WHEN
  // ─────────────────────────────────────────────────────────────
  lesson({
    category: CATEGORY, lessonKey: "sb-relative-clauses", title: "Relative Clauses: Who, Whom, Which, Whose, Where, When", icon: "🧩", orderIndex: 43,
    overview: "Mệnh đề quan hệ bổ sung thông tin cho một danh từ ngay trong câu thay vì viết thêm một câu mới — câu dài hơn, mượt hơn và không lặp từ. Bí quyết khi nối hai câu: (1) tìm từ bị lặp lại, (2) xác định nó là người, vật, nơi chốn hay thời gian và đang làm chủ ngữ, tân ngữ hay sở hữu, (3) thay bằng đại từ quan hệ phù hợp và đặt ngay sau danh từ.",
    formula: [
      { label: "WHO – người (chủ ngữ)", structure: "N (người) + who + V", example: "I have a friend who speaks English very well." },
      { label: "WHOM – người (tân ngữ)", structure: "N (người) + whom + S + V", example: "The teacher whom I met yesterday is very friendly." },
      { label: "WHICH – vật / con vật", structure: "N (vật) + which + V  •  N (vật) + which + S + V", example: "I have a book which is very interesting. / The phone which I bought yesterday is expensive." },
      { label: "WHOSE – sở hữu", structure: "N + whose + N + V", example: "I have a friend whose father is a doctor." },
      { label: "WHERE – nơi chốn", structure: "N (nơi chốn) + where + S + V", example: "This is the school where I study." },
      { label: "WHEN – thời gian", structure: "N (thời gian) + when + S + V", example: "I remember the day when I first met my teacher." }
    ],
    usage: [
      { title: "Bước 1 – Hiểu nghĩa: tìm từ bị lặp lại", description: "I have a friend. HE speaks English very well. → “he” chính là “a friend” → nối bằng đại từ quan hệ thay cho “he”." },
      { title: "Bước 2 – Chọn đại từ quan hệ", description: "he/she/they (người, chủ ngữ) → who; him/her/them (người, tân ngữ) → whom/who; it/they (vật) → which; his/her/its/their → whose; there → where; then / on that day → when." },
      { title: "Bước 3 – Viết câu: đặt ngay sau danh từ, BỎ từ bị thay thế", description: "I have a friend who speaks English (không viết who he speaks). The phone which I bought (không viết which I bought it)." },
      { title: "Bước 4 – Mở rộng câu", description: "Chèn mệnh đề quan hệ vào giữa câu để bổ sung cho chủ ngữ: The teacher who teaches me English is very friendly." },
      { title: "Bước 5 – Kết nối câu", description: "Kết hợp với and/but/because: I have a friend whose father is a doctor, so he knows a lot about health." },
      { title: "Lược bỏ & thay thế", description: "Khi who/whom/which làm TÂN NGỮ có thể bỏ: The teacher (whom) I met yesterday... Trong giao tiếp, whom thường được thay bằng who. “That” có thể thay who/which trong mệnh đề xác định." }
    ],
    signalWords: ["who – người (chủ ngữ)", "whom – người (tân ngữ)", "which – vật / con vật", "whose + N – sở hữu", "where – nơi chốn", "when – thời gian", "that – thay who/which"],
    examples: [
      eg("I have a friend who speaks English very well.", "Tôi có một người bạn nói tiếng Anh rất giỏi."),
      eg("The teacher who teaches me English is very friendly.", "Thầy/cô dạy tôi tiếng Anh rất thân thiện."),
      eg("Students who study hard usually get good results.", "Những học sinh học chăm chỉ thường đạt kết quả tốt."),
      eg("The teacher whom I met yesterday is very friendly.", "Thầy/cô mà tôi gặp hôm qua rất thân thiện."),
      eg("The girl whom you saw is my sister.", "Cô gái mà bạn nhìn thấy là em gái tôi."),
      eg("The phone which I bought yesterday is expensive.", "Chiếc điện thoại tôi mua hôm qua rất đắt."),
      eg("I like movies which make me laugh.", "Tôi thích những bộ phim làm tôi cười."),
      eg("I have a friend whose father is a doctor.", "Tôi có một người bạn có bố là bác sĩ."),
      eg("The student whose English is excellent won the prize.", "Bạn học sinh có tiếng Anh xuất sắc đã giành giải."),
      eg("This is the school where I study.", "Đây là ngôi trường nơi tôi học."),
      eg("The restaurant where we had dinner was very beautiful.", "Nhà hàng nơi chúng tôi ăn tối rất đẹp."),
      eg("I remember the day when I first met my teacher.", "Tôi nhớ ngày tôi gặp thầy/cô giáo lần đầu."),
      eg("Sunday is the day when I usually relax.", "Chủ nhật là ngày tôi thường thư giãn.")
    ],
    mistakes: [
      err("I have a friend which speaks English well.", "I have a friend who speaks English well.", "Người → who, không dùng which."),
      err("This is the school which I study.", "This is the school where I study. / This is the school which I study at.", "Sau where là S + V đầy đủ; nếu dùng which thì cần giới từ (study at)."),
      err("He is a teacher who teach English.", "He is a teacher who teaches English.", "Động từ sau who chia theo danh từ đứng trước (a teacher → teaches)."),
      err("I have a friend who he speaks English well.", "I have a friend who speaks English well.", "Who đã thay cho “he” → bỏ “he”."),
      err("I know a girl who her father is a doctor.", "I know a girl whose father is a doctor.", "Sở hữu (her father) → whose + N."),
      err("The phone which I bought it yesterday is expensive.", "The phone which I bought yesterday is expensive.", "Which đã thay cho “it” → bỏ “it”."),
      err("I remember the day where I met her.", "I remember the day when I met her.", "Thời gian → when; nơi chốn mới dùng where.")
    ],
    tips: [
      "Động từ sau who/which chia theo danh từ đứng trước: a friend who speaks / friends who speak.",
      "Phân biệt where và which: where + S + V đầy đủ (the city where I live); which + V (the city which is famous for...) hoặc which + S + V + giới từ (the city which I live in).",
      "IELTS: mệnh đề quan hệ là cách đơn giản nhất để câu dài và “học thuật” hơn: People who live in big cities often face high living costs."
    ],
    comparison: [
      table("Tóm tắt đại từ quan hệ", ["Từ", "Dùng cho", "Chức năng", "Ví dụ"], [
        ["who", "Người", "Chủ ngữ (và tân ngữ trong văn nói)", "a friend who speaks English"],
        ["whom", "Người", "Tân ngữ", "the teacher whom I met"],
        ["which", "Vật / động vật", "Chủ ngữ hoặc tân ngữ", "the phone which I bought"],
        ["whose", "Người / vật", "Sở hữu (+ N)", "a friend whose father is a doctor"],
        ["where", "Địa điểm", "Nơi mà (+ S + V)", "the school where I study"],
        ["when", "Thời gian", "Khi mà (+ S + V)", "the day when I met her"]
      ]),
      table("Từ bị thay thế → đại từ quan hệ", ["Trong câu thứ hai có", "Thay bằng", "Nối câu"], [
        ["he / she / they (người, chủ ngữ)", "who", "I have a friend. He speaks English. → a friend who speaks English"],
        ["him / her / them (người, tân ngữ)", "whom / who", "The man is my teacher. You met him. → The man whom you met is my teacher."],
        ["it / they (vật)", "which", "I bought a book. It is interesting. → a book which is interesting"],
        ["his / her / its / their", "whose", "I know a girl. Her father is a doctor. → a girl whose father is a doctor"],
        ["there / in that place", "where", "This is the school. I study there. → the school where I study"],
        ["then / on that day", "when", "I remember the day. I met her on that day. → the day when I met her"]
      ])
    ],
    exercises: [
      mc(STEP.meaning + "Trong hai câu “I have a friend. He speaks English very well.”, từ nào bị lặp lại ý?", ["I – he", "a friend – he", "English – well", "have – speaks"], 1, "“He” chính là “a friend” → thay “he” bằng who."),
      mc(STEP.structure + "Chọn đáp án đúng: “The man ___ lives next door is a doctor.”", ["which", "who", "whose", "where"], 1, "Người, làm chủ ngữ của lives → who."),
      mc(STEP.structure + "Chọn đáp án đúng: “This is the house ___ I was born.”", ["which", "when", "where", "who"], 2, "Nơi chốn + S + V đầy đủ → where."),
      mc(STEP.structure + "Chọn đáp án đúng: “I know a boy ___ mother is a famous singer.”", ["who", "whose", "whom", "which"], 1, "Sở hữu (mẹ của cậu bé) → whose + N."),
      ex("fill_blank", STEP.structure + "Điền đại từ quan hệ: “I like movies ___ make me laugh.”", "which (that)", "Vật (movies) làm chủ ngữ → which."),
      ex("fill_blank", STEP.structure + "Điền đại từ quan hệ: “2020 was the year ___ I started learning English.”", "when", "Thời gian + S + V → when."),
      ex("error_correction", STEP.structure + "Sửa lỗi: “I have a friend which speaks English well.”", "I have a friend who speaks English well.", "Người → who."),
      ex("error_correction", STEP.write + "Sửa lỗi: “He is a teacher who teach English.”", "He is a teacher who teaches English.", "A teacher (số ít) → teaches."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Tôi có một người bạn nói tiếng Anh rất giỏi.”", "I have a friend who speaks English very well.", "Người làm chủ ngữ → who + V(s)."),
      ex("translation_vn_en", STEP.write + "Dịch sang tiếng Anh: “Đây là ngôi trường nơi tôi học.”", "This is the school where I study.", "Nơi chốn → where + S + V."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “The student whose English is excellent won the prize.”", "Bạn học sinh có tiếng Anh xuất sắc đã giành giải thưởng.", "Whose English = tiếng Anh của bạn ấy."),
      ex("translation_en_vn", STEP.meaning + "Dịch sang tiếng Việt: “Sunday is the day when I usually relax.”", "Chủ nhật là ngày tôi thường thư giãn.", "When = khi mà / ngày mà."),
      ex("sentence_transformation", STEP.connect + "Nối câu: “The man is my teacher. You met him yesterday.”", "The man whom you met yesterday is my teacher. / The man (who) you met yesterday is my teacher.", "Him = tân ngữ → whom/who, có thể lược bỏ; chèn mệnh đề ngay sau “The man”."),
      ex("sentence_transformation", STEP.connect + "Nối câu: “The students are very friendly. They study in my class.”", "The students who study in my class are very friendly.", "They = chủ ngữ, người → who; động từ chính “are” đứng sau mệnh đề quan hệ."),
      ex("sentence_transformation", STEP.connect + "Nối câu: “I remember the day. I first met my teacher on that day.”", "I remember the day when I first met my teacher.", "On that day → when."),
      ex("rewrite", STEP.expand + "Mở rộng câu “My friend is very friendly.” bằng mệnh đề quan hệ (who studies in my class).", "My friend, who studies in my class, is very friendly.", "Mệnh đề bổ sung cho chủ ngữ đứng ngay sau chủ ngữ; khi danh từ đã xác định rõ (my friend), dùng dấu phẩy hai bên."),
      ex("rewrite", STEP.connect + "Viết một câu về quê bạn, dùng where và because. Gợi ý: Hue / the city / I was born / love / peaceful.", "Hue is the city where I was born, and I love it because it is very peaceful.", "Where + S + V; nối thêm ý bằng and + because."),
      ex("find_mistake", STEP.write + "Tìm lỗi sai: “The phone which I bought it yesterday is expensive.”", "Lỗi: bỏ “it” → The phone which I bought yesterday is expensive.", "Which đã thay cho it."),
      ex("find_mistake", STEP.structure + "Tìm lỗi sai: “I know a girl who her brother studies abroad.”", "Lỗi: who her brother → whose brother.", "Sở hữu → whose + N."),
      ex("mini_dialogue", STEP.connect + "Hoàn thành hội thoại với who / which / where / whose:\nA: Who is that girl?\nB: She's the student ___ won the speaking contest.\nA: Is she the girl ___ mother teaches maths?\nB: Yes! And that's the café ___ she practises English every weekend.\nA: Wow. What's the book ___ she is holding?", "who / whose / where / which", "Người chủ ngữ → who; sở hữu → whose; nơi chốn → where; vật → which.")
    ],
    conjugationDrills: [{
      title: "Luyện tập thêm: Điền who / whom / which / whose / where / when",
      intro: "Điền đại từ quan hệ phù hợp (nếu có hai đáp án đúng, viết một). Hỏi: danh từ trước chỗ trống là người, vật, nơi chốn hay thời gian? Nhấn Enter để sang câu tiếp theo.",
      items: [
        c("The woman ___ works in the library is my aunt.", ["who", "that"], "Người, chủ ngữ → who."),
        c("I lost the book ___ you gave me.", ["which", "that"], "Vật → which."),
        c("This is the park ___ we often play football.", "where", "Nơi chốn + S + V → where."),
        c("Do you remember the summer ___ we went to Nha Trang?", "when", "Thời gian → when."),
        c("He is the boy ___ bike was stolen.", "whose", "Sở hữu (xe của cậu bé) → whose."),
        c("The singer ___ we met yesterday was very kind.", ["whom", "who", "that"], "Người, tân ngữ → whom (who)."),
        c("I have a cat ___ sleeps all day.", ["which", "that"], "Con vật → which."),
        c("Students ___ do their homework get better marks.", ["who", "that"], "Người, chủ ngữ → who."),
        c("Ha Noi is the city ___ my parents were born.", "where", "Nơi chốn → where."),
        c("I know a man ___ son is a famous footballer.", "whose", "Sở hữu → whose."),
        c("Monday is the day ___ I have English class.", "when", "Thời gian → when."),
        c("The laptop ___ is on the desk belongs to my brother.", ["which", "that"], "Vật, chủ ngữ → which.")
      ]
    }],
    translationDrills: [
      {
        title: "Nối câu bằng mệnh đề quan hệ",
        intro: "Nối hai câu thành MỘT câu bằng who, whom, which, whose, where hoặc when.",
        items: [
          t("I have a friend. / He speaks English very well.", ["I have a friend who speaks English very well.", "I have a friend that speaks English very well."], "He (người, chủ ngữ) → who."),
          t("This is the school. / I study there.", ["This is the school where I study.", "This is the school which I study at.", "This is the school that I study at.", "This is the school I study at."], "There → where."),
          t("I bought a book. / It is very interesting.", ["I bought a book which is very interesting.", "I bought a book that is very interesting."], "It (vật) → which."),
          t("I know a girl. / Her father is a doctor.", "I know a girl whose father is a doctor.", "Her father → whose father."),
          t("This is the restaurant. / We had dinner there.", ["This is the restaurant where we had dinner.", "This is the restaurant which we had dinner at.", "This is the restaurant that we had dinner at.", "This is the restaurant we had dinner at."], "There → where."),
          t("I remember the day. / I first met my teacher on that day.", ["I remember the day when I first met my teacher.", "I remember the day I first met my teacher."], "On that day → when."),
          t("The man is my teacher. / You met him yesterday.", ["The man whom you met yesterday is my teacher.", "The man who you met yesterday is my teacher.", "The man that you met yesterday is my teacher.", "The man you met yesterday is my teacher."], "Him (tân ngữ) → whom/who; có thể bỏ."),
          t("The students are very friendly. / They study in my class.", ["The students who study in my class are very friendly.", "The students that study in my class are very friendly."], "They (chủ ngữ) → who; chèn ngay sau “The students”.")
        ]
      },
      {
        title: "Luyện dịch câu có mệnh đề quan hệ: Việt → Anh",
        intro: "Dịch sang tiếng Anh, dùng đại từ quan hệ phù hợp.",
        items: [
          t("Tôi có một người bạn sống ở Đà Nẵng.", ["I have a friend who lives in Da Nang.", "I have a friend that lives in Da Nang."], "Who + V(s)."),
          t("Tôi thích cuốn sách mà tôi mua hôm qua.", ["I like the book which I bought yesterday.", "I like the book that I bought yesterday.", "I like the book I bought yesterday."], "Which + S + V; có thể lược bỏ which."),
          t("Đây là ngôi nhà nơi tôi sinh ra.", ["This is the house where I was born.", "This is the house which I was born in.", "This is the house I was born in."], "Where + S + V."),
          t("Cô ấy là giáo viên dạy tôi tiếng Anh.", ["She is the teacher who teaches me English.", "She is the teacher that teaches me English.", "She is the teacher who teaches me English at school."], "Who + teaches."),
          t("Tôi biết một cậu bé có anh trai là ca sĩ.", ["I know a boy whose brother is a singer.", "I know a boy whose older brother is a singer."], "Whose + N."),
          t("Tết là thời gian khi gia đình tôi sum họp.", ["Tet is the time when my family gets together.", "Tet is the time when my family comes together.", "Tet is the time when my family reunites.", "Tet is the time when my family members get together."], "When + S + V."),
          t("Những người tập thể dục mỗi ngày thường khỏe mạnh.", ["People who exercise every day are usually healthy.", "People who do exercise every day are usually healthy.", "People who exercise every day are often healthy."], "People who + V, rồi mới đến động từ chính (are)."),
          t("Chiếc điện thoại mà bố tặng tôi rất đắt.", ["The phone which my father gave me is very expensive.", "The phone that my father gave me is very expensive.", "The phone my father gave me is very expensive.", "The phone which my dad gave me is very expensive.", "The phone my dad gave me is very expensive."], "Mệnh đề quan hệ chèn giữa chủ ngữ và động từ chính.")
        ]
      }
    ],
    quiz: [
      qz("Chọn đáp án đúng: “The girl ___ is singing is my cousin.”", ["which", "who", "whose", "where"], 1, "Người, chủ ngữ → who."),
      qz("Chọn đáp án đúng: “This is the cake ___ my mother made.”", ["who", "which", "where", "whose"], 1, "Vật → which."),
      qz("Chọn đáp án đúng: “I visited the village ___ my grandfather grew up.”", ["which", "when", "where", "who"], 2, "Nơi chốn + S + V → where."),
      qz("Chọn đáp án đúng: “He's the man ___ car was stolen.”", ["who", "whom", "whose", "which"], 2, "Sở hữu → whose + N."),
      qz("Câu nào đúng?", ["I have a friend who she is a nurse.", "I have a friend which is a nurse.", "I have a friend who is a nurse.", "I have a friend whose is a nurse."], 2, "Người, chủ ngữ → who; không lặp “she”."),
      qz("Chọn đáp án đúng: “I'll never forget the year ___ I graduated.”", ["where", "which", "when", "who"], 2, "Thời gian → when.")
    ],
    summary: "Người → who (chủ ngữ) / whom (tân ngữ); vật → which; sở hữu → whose + N; nơi chốn → where + S + V; thời gian → when + S + V. Đặt mệnh đề quan hệ ngay sau danh từ và bỏ từ bị thay thế (he, it, there...)."
  })
];
