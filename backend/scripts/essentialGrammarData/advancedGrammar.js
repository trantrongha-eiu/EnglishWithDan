"use strict";

// Advanced Grammar — the structures from "Viết câu nâng cao" (scripts/data/
// advSentences.js) that the handbook had no lesson for: inversion, cleft
// sentences, parallel structures, participle clauses. Each lesson ends with a
// Việt → Anh drill built from that group's sentences, so the theory here and
// the translation practice there use the same model answers.
const { lesson } = require("./builder");
const advGroups = require("../data/advSentences");

const CATEGORY = "Advanced Grammar";

// The adv-sentence group's sentences as a translation drill (+ extra accepted
// answers keyed by sentence order).
function advDrill(code, title, intro, extra = {}) {
  const g = advGroups.find(x => x.code === code);
  if (!g) throw new Error("advSentences.js has no group " + code);
  return {
    title, intro,
    items: g.sentences.map(s => ({
      vi: s.promptVi,
      answers: [s.answerEn, ...(extra[s.order] || [])],
      ...(s.hintWords && s.hintWords.length ? { hint: s.hintWords.join(" · ") } : {})
    }))
  };
}

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: "inversion", title: "Inversion (Đảo ngữ)", icon: "❗", orderIndex: 46,
    overview: "Đảo ngữ là đưa một trạng từ/cụm từ mang nghĩa phủ định hoặc hạn chế (Never, Rarely, Not only, Only by…) lên đầu câu, rồi đảo trợ động từ lên TRƯỚC chủ ngữ giống như câu hỏi. Mục đích: nhấn mạnh ý và tạo văn phong trang trọng — rất được giám khảo IELTS đánh giá cao ở tiêu chí Grammatical Range khi dùng đúng và vừa phải (1–2 câu/bài).",
    formula: [
      { label: "Not only … but also", structure: "Not only + trợ động từ + S + V, but S + also + V", example: "Not only does this policy reduce congestion, but it also improves air quality." },
      { label: "Never / Rarely / Seldom", structure: "Never (before) / Rarely / Seldom + trợ động từ + S + V", example: "Never before have people had access to so much information." },
      { label: "Only by / Only when / Only after / Only if", structure: "Only by V-ing / Only when S + V + trợ động từ + S + V (đảo ở MỆNH ĐỀ CHÍNH)", example: "Only by investing in public transport can cities solve congestion." },
      { label: "Not until", structure: "Not until + mốc thời gian / S + V + trợ động từ + S + V", example: "Not until the 1990s did the Internet become widely available." },
      { label: "Hardly … when / No sooner … than", structure: "Hardly/Scarcely + had + S + V3 + when …; No sooner + had + S + V3 + than …", example: "No sooner had the law been passed than prices began to rise." },
      { label: "Under no circumstances / On no account / In no way", structure: "Cụm phủ định + trợ động từ + S + V", example: "Under no circumstances should children be left unsupervised online." },
      { label: "Đảo ngữ câu điều kiện (bỏ if)", structure: "Should + S + V (loại 1) / Were + S + to V (loại 2) / Had + S + V3 (loại 3)", example: "Had the government acted earlier, the crisis could have been avoided." }
    ],
    usage: [
      { title: "Nhấn mạnh hai lợi ích/tác hại cùng lúc (Task 2)", description: "Not only does remote work save time, but it also reduces carbon emissions." },
      { title: "Nhấn mạnh điều kiện/cách duy nhất để giải quyết vấn đề (kết luận, giải pháp)", description: "Only by raising public awareness can we protect the environment." },
      { title: "Nhấn mạnh tính chưa từng có / hiếm có", description: "Rarely has a single invention changed society so dramatically." },
      { title: "Thay câu điều kiện có if bằng dạng trang trọng hơn", description: "Were taxes on fuel to rise, people would drive less. (= If taxes on fuel rose …)" }
    ],
    signalWords: ["Not only … but also", "Never (before)", "Rarely / Seldom", "Little", "Only by / Only when / Only after / Only if", "Not until", "Hardly … when", "No sooner … than", "Under no circumstances", "On no account", "So + adj … that", "Should / Were / Had (đảo ngữ điều kiện)"],
    examples: [
      { en: "Not only does this policy help reduce traffic congestion, but it also improves air quality in large cities.", vi: "Chính sách này không chỉ giúp giảm ùn tắc giao thông mà còn cải thiện chất lượng không khí tại các thành phố lớn." },
      { en: "Never before have people had access to such a vast amount of information.", vi: "Chưa bao giờ con người có thể tiếp cận một lượng thông tin lớn như hiện nay." },
      { en: "Only by investing in public transport can cities solve the problem of traffic congestion in the long term.", vi: "Chỉ bằng cách đầu tư vào giao thông công cộng, các thành phố mới có thể giải quyết vấn đề ùn tắc trong dài hạn." },
      { en: "Rarely do young people today write letters by hand.", vi: "Giới trẻ ngày nay hiếm khi viết thư tay." },
      { en: "Seldom has a single technology spread so quickly across the world.", vi: "Hiếm khi có một công nghệ nào lan rộng khắp thế giới nhanh đến vậy." },
      { en: "Not until the 1990s did the Internet become widely available to the public.", vi: "Mãi đến những năm 1990, Internet mới trở nên phổ biến với công chúng." },
      { en: "Only when governments work together will climate change be brought under control.", vi: "Chỉ khi các chính phủ hợp tác với nhau thì biến đổi khí hậu mới được kiểm soát." },
      { en: "No sooner had the new law been passed than housing prices began to rise.", vi: "Luật mới vừa được thông qua thì giá nhà đã bắt đầu tăng." },
      { en: "Under no circumstances should children be left alone on the Internet.", vi: "Trong bất kỳ hoàn cảnh nào cũng không nên để trẻ em một mình trên mạng." },
      { en: "Little did they know that the factory would close a year later.", vi: "Họ hoàn toàn không biết rằng nhà máy sẽ đóng cửa một năm sau đó." },
      { en: "So serious is the problem that immediate action is required.", vi: "Vấn đề nghiêm trọng đến mức cần phải hành động ngay lập tức." },
      { en: "Had the government acted earlier, the crisis could have been avoided.", vi: "Nếu chính phủ hành động sớm hơn thì cuộc khủng hoảng đã có thể tránh được." },
      { en: "Should you need further information, please contact the office.", vi: "Nếu bạn cần thêm thông tin, vui lòng liên hệ văn phòng." }
    ],
    mistakes: [
      { wrong: "Not only this policy reduces congestion, but it also improves air quality.", right: "Not only does this policy reduce congestion, but it also improves air quality.", note: "Sau \"Not only\" đầu câu phải đảo trợ động từ (does/did/has/can…) lên trước chủ ngữ; động từ chính trở về nguyên mẫu." },
      { wrong: "Never before people have had access to so much information.", right: "Never before have people had access to so much information.", note: "Trợ động từ \"have\" phải đứng TRƯỚC chủ ngữ \"people\"." },
      { wrong: "Only by investing in public transport cities can solve congestion.", right: "Only by investing in public transport can cities solve congestion.", note: "Với \"Only by/when/after…\", đảo ngữ xảy ra ở mệnh đề chính, không phải trong cụm \"Only by…\"." },
      { wrong: "Only when will the government act, the problem will be solved.", right: "Only when the government acts will the problem be solved.", note: "Mệnh đề đi với \"Only when\" giữ trật tự thường; chỉ mệnh đề chính phía sau mới đảo." },
      { wrong: "Rarely people write letters by hand nowadays.", right: "Rarely do people write letters by hand nowadays.", note: "Câu gốc không có trợ động từ (thì hiện tại đơn) → phải mượn do/does/did để đảo." },
      { wrong: "Not until the 1990s the Internet became popular.", right: "Not until the 1990s did the Internet become popular.", note: "Quá khứ đơn → mượn \"did\", và động từ chính trở về nguyên mẫu (become, không phải became)." },
      { wrong: "Had the government acted earlier, the crisis would be avoided.", right: "Had the government acted earlier, the crisis would have been avoided.", note: "\"Had + S + V3\" là đảo ngữ điều kiện loại 3 → mệnh đề chính dùng would/could have + V3." }
    ],
    tips: [
      "Mỗi bài Task 2 chỉ cần 1–2 câu đảo ngữ đúng là đủ ghi điểm; dùng quá nhiều khiến bài viết gượng ép, thiếu tự nhiên.",
      "Mẫu an toàn và hữu dụng nhất: \"Not only … but also …\" (thân bài) và \"Only by V-ing can …\" (giải pháp, kết bài).",
      "Kiểm tra theo 2 bước: (1) câu gốc có trợ động từ chưa? Nếu chưa, thêm do/does/did; (2) đưa trợ động từ lên trước chủ ngữ, động từ chính về nguyên mẫu.",
      "Trong Speaking, đảo ngữ nghe khá trang trọng — chỉ dùng tự nhiên ở Part 3 như \"Not only is it cheaper, but it's also more convenient.\""
    ],
    comparison: [
      {
        title: "Câu thường vs Câu đảo ngữ",
        headers: ["Câu thường", "Câu đảo ngữ"],
        rows: [
          ["People have never had so much information.", "Never have people had so much information."],
          ["This policy not only reduces costs but also saves time.", "Not only does this policy reduce costs, but it also saves time."],
          ["Cities can solve congestion only by investing in transport.", "Only by investing in transport can cities solve congestion."],
          ["The Internet didn't become popular until the 1990s.", "Not until the 1990s did the Internet become popular."],
          ["If the government had acted earlier, …", "Had the government acted earlier, …"]
        ]
      },
      {
        title: "Mượn trợ động từ theo thì",
        headers: ["Câu gốc", "Trợ động từ đảo lên"],
        rows: [
          ["Hiện tại đơn (S + V/Vs)", "do / does + S + V"],
          ["Quá khứ đơn (S + V2)", "did + S + V"],
          ["Hiện tại/Quá khứ hoàn thành", "have / has / had + S + V3"],
          ["Có động từ khuyết thiếu", "can / will / should … + S + V"],
          ["Có động từ to be", "am / is / are / was / were + S …"]
        ]
      }
    ],
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Not only ___ time, but it also reduces stress.\"", options: ["remote work saves", "does remote work save", "remote work does save", "saves remote work"], answerIndex: 1, explanation: "Sau \"Not only\" đầu câu: does + S + V nguyên mẫu." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Only by raising public awareness ___ the environment.\"", options: ["we can protect", "can we protect", "we protect can", "do we can protect"], answerIndex: 1, explanation: "Đảo ngữ ở mệnh đề chính: can + we + protect." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Never before ___ so many people living in cities.\"", options: ["there have been", "have there been", "there has been", "has been there"], answerIndex: 1, explanation: "\"there\" đóng vai chủ ngữ giả → have + there + been." },
      { type: "fill_blank", question: "Điền trợ động từ thích hợp: \"Rarely ___ (do) students read printed newspapers nowadays.\"", answer: "do", explanation: "Hiện tại đơn, chủ ngữ số nhiều \"students\" → mượn \"do\"." },
      { type: "fill_blank", question: "Điền trợ động từ thích hợp: \"Not until 2010 ___ the city open its first metro line.\"", answer: "did", explanation: "Quá khứ đơn → mượn \"did\", động từ chính \"open\" giữ nguyên mẫu." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Not only technology has changed the way we work, but it has also changed the way we communicate.\"", answer: "Not only has technology changed the way we work, but it has also changed the way we communicate.", explanation: "Trợ động từ \"has\" phải đứng trước chủ ngữ \"technology\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Seldom the government listens to young people.\"", answer: "Seldom does the government listen to young people.", explanation: "Hiện tại đơn, chủ ngữ số ít → does + S + V nguyên mẫu (listen, bỏ -s)." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng đảo ngữ): \"Chỉ bằng cách hợp tác, các quốc gia mới có thể giải quyết biến đổi khí hậu.\"", answer: "Only by working together can countries tackle climate change.", explanation: "Only by + V-ing + can + S + V." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng đảo ngữ): \"Chưa bao giờ việc học trực tuyến lại phổ biến như bây giờ.\"", answer: "Never before has online learning been as popular as it is now.", explanation: "Never before + has + S + V3." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"No sooner had the meeting started than the power went out.\"", answer: "Cuộc họp vừa mới bắt đầu thì mất điện.", explanation: "No sooner … than = vừa mới … thì đã …" },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Under no circumstances should personal data be shared without consent.\"", answer: "Trong bất kỳ trường hợp nào cũng không được chia sẻ dữ liệu cá nhân khi chưa có sự đồng ý.", explanation: "Under no circumstances = tuyệt đối không, trong bất kỳ hoàn cảnh nào cũng không." },
      { type: "sentence_transformation", question: "Viết lại bắt đầu bằng \"Not only\": \"Exercise improves physical health and it also reduces stress.\"", answer: "Not only does exercise improve physical health, but it also reduces stress.", explanation: "Not only + does + S + V, but S + also + V." },
      { type: "sentence_transformation", question: "Viết lại bắt đầu bằng \"Had\": \"If she had studied harder, she would have passed the exam.\"", answer: "Had she studied harder, she would have passed the exam.", explanation: "Đảo ngữ điều kiện loại 3: bỏ \"if\", đưa \"had\" lên trước chủ ngữ." },
      { type: "rewrite", question: "Viết lại câu với \"Only when\": \"The problem will be solved only when people change their habits.\"", answer: "Only when people change their habits will the problem be solved.", explanation: "Mệnh đề \"when\" giữ nguyên trật tự; mệnh đề chính đảo: will + the problem + be solved." },
      { type: "rewrite", question: "Viết lại câu với \"Rarely\": \"People rarely question what they read online.\"", answer: "Rarely do people question what they read online.", explanation: "Rarely + do + S + V nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"Hardly had she arrived than the meeting began.\"", answer: "Lỗi: \"than\" → sửa thành \"when\" (Hardly … when).", explanation: "Hardly/Scarcely đi với \"when\"; \"than\" đi với \"No sooner\"." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"Only after the exam did she realised her mistake.\"", answer: "Lỗi: \"realised\" → sửa thành \"realise\".", explanation: "Đã mượn \"did\" thì động từ chính phải ở dạng nguyên mẫu." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (dùng đảo ngữ):\nA: Is the new bus system any good?\nB: Yes! Not only ___ (it / be) cheaper, but it's also much faster.", answer: "is it", explanation: "Có động từ to be → đảo \"is\" lên trước \"it\"." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (dùng đảo ngữ):\nA: Have you ever seen the city this crowded?\nB: Never ___ (I / see) so many tourists here.", answer: "have I seen", explanation: "Never + have + I + V3." }
    ],
    quiz: [
      { question: "\"Not only ___ the exam, but she also got the highest score.\"", options: ["she passed", "did she pass", "she did pass", "passed she"], answerIndex: 1, explanation: "Quá khứ đơn → did + S + V nguyên mẫu." },
      { question: "\"Only by working together ___ this problem.\"", options: ["we can solve", "can we solve", "we solve", "solve we can"], answerIndex: 1, explanation: "Only by + V-ing + trợ động từ + S + V." },
      { question: "\"No sooner had he left ___ it started to rain.\"", options: ["when", "than", "then", "that"], answerIndex: 1, explanation: "No sooner … than." },
      { question: "\"___ I known about the traffic, I would have left earlier.\"", options: ["If", "Had", "Should", "Were"], answerIndex: 1, explanation: "Đảo ngữ điều kiện loại 3: Had + S + V3." },
      { question: "Câu nào đúng?", options: ["Rarely people visit this museum.", "Rarely do people visit this museum.", "Rarely people do visit this museum.", "Rarely visit people this museum."], answerIndex: 1, explanation: "Rarely + do + S + V." },
      { question: "\"Not until she moved abroad ___ how much she loved her hometown.\"", options: ["she realised", "did she realise", "she did realise", "realised she"], answerIndex: 1, explanation: "Not until + mệnh đề, rồi đảo ở mệnh đề chính: did + she + realise." }
    ],
    translationDrills: [advDrill("inversion", "Dịch câu Việt → Anh (giống Viết câu nâng cao)", "Dịch các câu sau sang tiếng Anh, BẮT BUỘC dùng đảo ngữ (Not only… / Never before… / Only by…). Gõ xong bấm Kiểm tra để so với đáp án mẫu.")],
    summary: "Đảo ngữ = cụm phủ định/hạn chế ở đầu câu + trợ động từ + S + V. Ba mẫu dễ dùng nhất cho IELTS: Not only … but also, Never before …, Only by V-ing can … — dùng 1–2 câu mỗi bài để nhấn mạnh ý."
  }),

  lesson({
    category: CATEGORY, lessonKey: "cleft-sentences", title: "Cleft Sentences (Câu chẻ)", icon: "✂️", orderIndex: 47,
    overview: "Câu chẻ \"chẻ\" một câu đơn thành hai mệnh đề để làm nổi bật MỘT thành phần (chủ ngữ, tân ngữ, trạng ngữ hoặc cả hành động). Hai mẫu chính: \"It is/was … that/who …\" (= Chính … mà …) và \"What … is/was …\" (= Điều mà … là …). Đây là cách nhấn mạnh ý chính rất tự nhiên trong Writing Task 2 và Speaking Part 3.",
    formula: [
      { label: "It-cleft (nhấn mạnh danh từ/cụm danh từ)", structure: "It is/was + thành phần được nhấn mạnh + that/who + phần còn lại", example: "It is the lack of affordable housing that makes city life difficult." },
      { label: "It-cleft (nhấn mạnh trạng ngữ)", structure: "It is/was + trạng ngữ (thời gian/nơi chốn/lý do) + that + S + V", example: "It was in 2008 that the financial crisis began." },
      { label: "What-cleft (nhấn mạnh tân ngữ/ý chính)", structure: "What + S + V + is/was + danh từ/cụm từ", example: "What many students need is more effective guidance." },
      { label: "What-cleft (nhấn mạnh hành động)", structure: "What + S + do/did + is/was + (to) V", example: "What cities need to do is invest more in public infrastructure." },
      { label: "Nhấn mạnh phủ định", structure: "It is not … but … that … / What S need is not … but …", example: "It is not money but time that most parents lack." }
    ],
    usage: [
      { title: "Chỉ rõ NGUYÊN NHÂN chính của một vấn đề (Task 2)", description: "It is the rapid growth of cities that has caused this housing crisis." },
      { title: "Nêu GIẢI PHÁP/nhu cầu thực sự", description: "What governments should do is provide more affordable housing." },
      { title: "Sửa/đính chính một ý (đối lập)", description: "It is not the teachers but the curriculum that needs to change." },
      { title: "Nhấn mạnh thời điểm/nơi chốn trong Speaking", description: "It was at university that I first became interested in economics." }
    ],
    signalWords: ["It is/was … that …", "It is/was … who … (người)", "What … is/was …", "What … do is (to) V", "The reason why … is that …", "All (that) … is …", "It is not … but … that …"],
    examples: [
      { en: "It is the lack of affordable housing that makes it difficult for many young people to live in cities.", vi: "Chính sự thiếu hụt nhà ở giá rẻ là nguyên nhân khiến nhiều người trẻ gặp khó khăn khi sống ở thành phố." },
      { en: "What many students need is not more homework but more effective guidance from teachers.", vi: "Điều mà nhiều học sinh cần không phải là nhiều bài tập hơn mà là sự hướng dẫn hiệu quả hơn từ giáo viên." },
      { en: "It is the rapid development of technology that has changed the way people access education.", vi: "Chính sự phát triển nhanh chóng của công nghệ đã thay đổi cách mọi người tiếp cận giáo dục." },
      { en: "What cities need to do is invest more in public infrastructure.", vi: "Điều mà các thành phố cần làm là đầu tư nhiều hơn vào cơ sở hạ tầng công cộng." },
      { en: "It is the lack of time that prevents many people from maintaining a healthy lifestyle.", vi: "Chính việc thiếu thời gian là lý do khiến nhiều người không thể duy trì một lối sống lành mạnh." },
      { en: "It was my grandmother who taught me how to cook.", vi: "Chính bà tôi là người đã dạy tôi nấu ăn." },
      { en: "It was in 2008 that the global financial crisis began.", vi: "Chính vào năm 2008, cuộc khủng hoảng tài chính toàn cầu đã bắt đầu." },
      { en: "What surprised me most was the friendliness of the local people.", vi: "Điều làm tôi ngạc nhiên nhất là sự thân thiện của người dân địa phương." },
      { en: "What I enjoy about my job is the chance to meet new people.", vi: "Điều tôi thích ở công việc của mình là cơ hội gặp gỡ người mới." },
      { en: "It is not money but time that most working parents lack.", vi: "Thứ mà hầu hết các bậc cha mẹ đi làm thiếu không phải là tiền mà là thời gian." },
      { en: "The reason why many people move to cities is that they want better job opportunities.", vi: "Lý do nhiều người chuyển đến thành phố là họ muốn có cơ hội việc làm tốt hơn." }
    ],
    mistakes: [
      { wrong: "It is the lack of time makes people stressed.", right: "It is the lack of time that makes people stressed.", note: "Câu chẻ \"It is … \" phải có \"that/who\" nối sang phần còn lại." },
      { wrong: "What students need are more guidance.", right: "What students need is more guidance.", note: "Mệnh đề What… đóng vai chủ ngữ số ít → thường dùng \"is\" (\"guidance\" cũng không đếm được)." },
      { wrong: "It was my teacher which encouraged me to study abroad.", right: "It was my teacher who/that encouraged me to study abroad.", note: "Nhấn mạnh người → dùng \"who\" hoặc \"that\", không dùng \"which\"." },
      { wrong: "It is in 2008 that the crisis began.", right: "It was in 2008 that the crisis began.", note: "Sự việc trong quá khứ → dùng \"It was\"." },
      { wrong: "What cities need to do is investing in transport.", right: "What cities need to do is (to) invest in transport.", note: "Sau \"What … do is\" dùng V nguyên mẫu (có hoặc không có \"to\"), không dùng V-ing." },
      { wrong: "The thing what I like most is the food.", right: "What I like most is the food. / The thing (that) I like most is the food.", note: "Không dùng \"the thing what\"; chọn một trong hai mẫu." }
    ],
    tips: [
      "Câu chẻ rất hợp để viết câu chủ đề (topic sentence) nêu nguyên nhân chính: \"It is the high cost of living that …\".",
      "\"What … need to do is …\" là cách mở đầu đoạn giải pháp gọn gàng, tự nhiên.",
      "Trong Speaking, What-cleft giúp trả lời có điểm nhấn: \"What I really love about my hometown is …\" — nghe tự nhiên hơn đảo ngữ.",
      "Đừng lạm dụng: 1–2 câu chẻ mỗi bài là đủ để thể hiện sự đa dạng ngữ pháp."
    ],
    comparison: {
      title: "It-cleft vs What-cleft",
      headers: ["", "It is/was … that …", "What … is/was …"],
      rows: [
        ["Nhấn mạnh", "Một danh từ, người, thời gian, nơi chốn", "Tân ngữ / cả hành động / ý chính"],
        ["Dịch", "Chính … mà/là …", "Điều mà … là …"],
        ["Ví dụ", "It is pollution that worries me most.", "What worries me most is pollution."],
        ["Hành động", "(ít dùng)", "What we should do is recycle more."]
      ]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"It is the high cost of living ___ forces many young people to leave the city.\"", options: ["what", "that", "which it", "this"], answerIndex: 1, explanation: "It is + thành phần nhấn mạnh + that + phần còn lại." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ I need is a long holiday.\"", options: ["That", "Which", "What", "It"], answerIndex: 2, explanation: "What-cleft: What + S + V + is + …" },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"It was my father ___ taught me to swim.\"", options: ["which", "who", "what", "whom it"], answerIndex: 1, explanation: "Nhấn mạnh người làm chủ ngữ → who/that." },
      { type: "fill_blank", question: "Điền từ thích hợp: \"___ was in 1969 that humans first landed on the Moon.\"", answer: "It", explanation: "It-cleft nhấn mạnh thời gian: It was + trạng ngữ + that …" },
      { type: "fill_blank", question: "Điền từ thích hợp: \"What governments should do ___ invest in renewable energy.\"", answer: "is", explanation: "What + S + do + is + (to) V." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"It is social media causes many teenagers to feel anxious.\"", answer: "It is social media that causes many teenagers to feel anxious.", explanation: "Thiếu \"that\" nối hai vế câu chẻ." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"What schools need to do is teaching practical skills.\"", answer: "What schools need to do is (to) teach practical skills.", explanation: "Sau \"What … do is\" dùng V nguyên mẫu." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng câu chẻ): \"Chính ô nhiễm không khí là nguyên nhân gây ra nhiều bệnh hô hấp.\"", answer: "It is air pollution that causes many respiratory diseases.", explanation: "It is + danh từ nhấn mạnh + that + V." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng câu chẻ): \"Điều mà người già cần nhất là sự quan tâm từ gia đình.\"", answer: "What elderly people need most is care from their families.", explanation: "What + S + need + is + danh từ." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"It was during the pandemic that online shopping really took off.\"", answer: "Chính trong thời kỳ đại dịch, mua sắm trực tuyến mới thực sự bùng nổ.", explanation: "It was + trạng ngữ thời gian + that … = Chính vào lúc … mà …" },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"What worries parents most is the amount of time children spend online.\"", answer: "Điều khiến cha mẹ lo lắng nhất là lượng thời gian trẻ em dành cho việc lên mạng.", explanation: "What … is … = Điều mà … là …" },
      { type: "sentence_transformation", question: "Viết lại bắt đầu bằng \"It is\": \"Poor diet causes most health problems.\"", answer: "It is poor diet that causes most health problems.", explanation: "Chủ ngữ \"poor diet\" được nhấn mạnh." },
      { type: "sentence_transformation", question: "Viết lại bắt đầu bằng \"What\": \"Young people need more job opportunities.\"", answer: "What young people need is more job opportunities.", explanation: "What + S + V + is + tân ngữ." },
      { type: "rewrite", question: "Viết lại câu nhấn mạnh thời gian: \"I met my best friend at university.\"", answer: "It was at university that I met my best friend.", explanation: "Nhấn mạnh trạng ngữ nơi chốn → It was + at university + that …" },
      { type: "rewrite", question: "Viết lại câu nhấn mạnh hành động bằng What-cleft: \"We should reduce our use of plastic.\"", answer: "What we should do is reduce our use of plastic.", explanation: "What + S + should do + is + V." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"It is the teachers which make a school successful.\"", answer: "Lỗi: \"which\" → sửa thành \"who\" hoặc \"that\".", explanation: "Nhấn mạnh người → who/that." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"It is in 1990 that the company was founded.\"", answer: "Lỗi: \"It is\" → sửa thành \"It was\".", explanation: "Sự việc quá khứ → It was." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (dùng câu chẻ):\nA: Do you like living in the city because of the shops?\nB: Not really. ___ I love most is the nightlife.", answer: "What", explanation: "What-cleft: What I love most is …" },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (dùng câu chẻ):\nA: Did your mum teach you English?\nB: No, it was my uncle ___ taught me.", answer: "who (hoặc that)", explanation: "Nhấn mạnh người → who/that." }
    ],
    quiz: [
      { question: "\"It is the government ___ should take responsibility.\"", options: ["what", "that", "which it", "whose"], answerIndex: 1, explanation: "It is + danh từ + that …" },
      { question: "\"What the city needs ___ a better public transport system.\"", options: ["are", "is", "be", "being"], answerIndex: 1, explanation: "Mệnh đề What… là chủ ngữ số ít → is." },
      { question: "\"It ___ in Paris that they first met.\"", options: ["is", "was", "were", "has"], answerIndex: 1, explanation: "Sự việc quá khứ → It was." },
      { question: "Câu nào đúng?", options: ["What we should do is planting more trees.", "What we should do is plant more trees.", "What we should do are plant more trees.", "That we should do is plant more trees."], answerIndex: 1, explanation: "What … do is + V nguyên mẫu." },
      { question: "\"It was my sister ___ found the lost keys.\"", options: ["which", "who", "what", "whom"], answerIndex: 1, explanation: "Nhấn mạnh người làm chủ ngữ → who/that." },
      { question: "Câu nào dịch đúng \"Chính sự thiếu thời gian khiến tôi không tập thể dục\"?", options: ["The lack of time is it that stops me exercising.", "It is the lack of time that stops me from exercising.", "What the lack of time stops me from exercising.", "It is the lack of time stops me exercising."], answerIndex: 1, explanation: "It is + danh từ + that + V." }
    ],
    translationDrills: [advDrill("cleft-sentences", "Dịch câu Việt → Anh (giống Viết câu nâng cao)", "Dịch các câu sau sang tiếng Anh bằng câu chẻ (It is … that … / What … is …). Gõ xong bấm Kiểm tra để so với đáp án mẫu.")],
    summary: "Câu chẻ làm nổi bật một thành phần: \"It is/was X that …\" (Chính X …) và \"What … is/was X\" (Điều mà … là X). Rất hợp để nêu nguyên nhân chính và giải pháp trong Task 2."
  }),

  lesson({
    category: CATEGORY, lessonKey: "parallel-structures", title: "Parallel Structures (Cấu trúc song song)", icon: "⚖️", orderIndex: 48,
    overview: "Cấu trúc song song: khi liệt kê hoặc so sánh nhiều ý bằng and/or/but, both … and, either … or, not only … but also…, các thành phần phải CÙNG DẠNG ngữ pháp (cùng V-ing, cùng to V, cùng danh từ, cùng tính từ, cùng mệnh đề). Câu song song đọc mạch lạc, cân đối — và là lỗi người học hay mắc nhất khi viết câu dài liệt kê 3 ý.",
    formula: [
      { label: "Liệt kê V-ing", structure: "… + V-ing, V-ing, and V-ing", example: "invest in improving education, reducing unemployment, and enhancing quality of life" },
      { label: "Liệt kê to V / V", structure: "… + to V, (to) V, and (to) V", example: "aims to reduce waste, protect the environment, and encourage recycling" },
      { label: "Liệt kê tính từ", structure: "be + adj, adj, and adj", example: "needs to be fast, reliable, and affordable" },
      { label: "Liệt kê danh từ/cụm danh từ", structure: "N, N, and N", example: "knowledge, skills, and experience" },
      { label: "Cặp liên từ (correlative)", structure: "both A and B / either A or B / neither A nor B / not only A but also B (A, B cùng dạng)", example: "Both reading and writing are essential skills." }
    ],
    usage: [
      { title: "Liệt kê 2–3 lợi ích/giải pháp trong một câu (Task 2)", description: "Higher education helps students develop knowledge, improve critical thinking, and expand career opportunities." },
      { title: "Mô tả đặc điểm bằng chuỗi tính từ", description: "An efficient transport system needs to be fast, reliable, and affordable." },
      { title: "So sánh hai lựa chọn cân đối", description: "Studying online is often cheaper than studying on campus." },
      { title: "Dùng cặp liên từ để nhấn mạnh", description: "The policy benefits not only students but also teachers." }
    ],
    signalWords: ["and / or / but", "both … and", "either … or", "neither … nor", "not only … but also", "rather than", "than / as … as (so sánh)"],
    examples: [
      { en: "Governments should invest in improving the education system, reducing unemployment, and enhancing people's quality of life.", vi: "Chính phủ nên đầu tư để cải thiện hệ thống giáo dục, giảm tỷ lệ thất nghiệp và nâng cao chất lượng cuộc sống của người dân." },
      { en: "This programme aims to reduce waste, protect the environment, and encourage people to recycle.", vi: "Chương trình này nhằm giảm lượng rác thải, bảo vệ môi trường và khuyến khích người dân tái chế." },
      { en: "Higher education can help students develop specialised knowledge, improve their critical-thinking skills, and expand their career opportunities.", vi: "Giáo dục đại học có thể giúp sinh viên phát triển kiến thức chuyên môn, cải thiện kỹ năng tư duy phản biện và mở rộng cơ hội nghề nghiệp." },
      { en: "An efficient transport system needs to be fast, reliable, and affordable.", vi: "Một hệ thống giao thông hiệu quả cần phải nhanh chóng, đáng tin cậy và có giá cả phải chăng." },
      { en: "Companies should encourage employees to work more efficiently, use their time more effectively, and maintain a healthy work-life balance.", vi: "Các công ty nên khuyến khích nhân viên làm việc hiệu quả hơn, sử dụng thời gian hợp lý hơn và duy trì sự cân bằng giữa công việc và cuộc sống." },
      { en: "Both parents and teachers play an important role in a child's development.", vi: "Cả cha mẹ và giáo viên đều đóng vai trò quan trọng trong sự phát triển của trẻ." },
      { en: "Students can either live on campus or rent a flat nearby.", vi: "Sinh viên có thể ở ký túc xá hoặc thuê một căn hộ gần đó." },
      { en: "Cycling is not only good for your health but also good for the environment.", vi: "Đạp xe không chỉ tốt cho sức khỏe mà còn tốt cho môi trường." },
      { en: "I prefer reading books to watching television.", vi: "Tôi thích đọc sách hơn xem tivi." },
      { en: "The new park is clean, spacious, and safe for children.", vi: "Công viên mới sạch sẽ, rộng rãi và an toàn cho trẻ em." },
      { en: "Many people choose to work from home rather than commute every day.", vi: "Nhiều người chọn làm việc tại nhà thay vì đi lại mỗi ngày." }
    ],
    mistakes: [
      { wrong: "Governments should invest in improving education, reduce unemployment, and the enhancement of quality of life.", right: "Governments should invest in improving education, reducing unemployment, and enhancing quality of life.", note: "Ba thành phần sau \"invest in\" phải cùng dạng V-ing." },
      { wrong: "A good transport system should be fast, reliable, and it should not cost much.", right: "A good transport system should be fast, reliable, and affordable.", note: "Hai tính từ + một mệnh đề → không song song; đổi thành tính từ thứ ba." },
      { wrong: "She likes swimming, to dance, and reading.", right: "She likes swimming, dancing, and reading.", note: "Không trộn V-ing với to V trong cùng một chuỗi." },
      { wrong: "The programme aims to reduce waste, protecting the environment, and encourage recycling.", right: "The programme aims to reduce waste, protect the environment, and encourage recycling.", note: "Sau \"aim to\" các động từ đều ở dạng nguyên mẫu." },
      { wrong: "Cycling is not only healthy but also it saves money.", right: "Cycling is not only healthy but also economical. / Cycling not only is healthy but also saves money.", note: "Sau \"not only\" và \"but also\" phải là hai thành phần cùng dạng (adj – adj hoặc V – V)." },
      { wrong: "Studying online is cheaper than to study on campus.", right: "Studying online is cheaper than studying on campus.", note: "Hai vế so sánh phải cùng dạng (V-ing – V-ing)." }
    ],
    tips: [
      "Quy tắc 3 ý: khi liệt kê 3 lợi ích/giải pháp, kiểm tra từ đầu tiên của mỗi ý — chúng phải cùng loại (cùng V-ing, cùng V nguyên mẫu, cùng tính từ…).",
      "Câu liệt kê 3 ý song song là cách nhanh nhất để viết câu dài mà vẫn rõ ràng, giúp tăng điểm Coherence & Grammatical Range.",
      "Với \"both/either/neither/not only\", đặt từ này ngay trước thành phần được so sánh để hai vế cân đối.",
      "Dùng dấu phẩy trước \"and\" ở ý cuối (Oxford comma) giúp câu dài dễ đọc hơn — cả hai cách đều được chấp nhận, miễn là nhất quán."
    ],
    comparison: {
      title: "Không song song vs Song song",
      headers: ["❌ Không song song", "✅ Song song"],
      rows: [
        ["to save money, protecting nature, and health", "to save money, protect nature, and improve health"],
        ["fast, reliable, and it is cheap", "fast, reliable, and cheap"],
        ["by reading books or to watch films", "by reading books or watching films"],
        ["not only a teacher but also writes novels", "not only a teacher but also a novelist"]
      ]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"The scheme aims to cut costs, save energy, and ___ jobs.\"", options: ["creating", "create", "creation of", "to creating"], answerIndex: 1, explanation: "Sau \"aims to\": cut, save, create — cùng V nguyên mẫu." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"She enjoys hiking, cooking, and ___.\"", options: ["to paint", "paint", "painting", "she paints"], answerIndex: 2, explanation: "Chuỗi V-ing: hiking, cooking, painting." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"The hotel was clean, comfortable, and ___.\"", options: ["the price was cheap", "cheaply", "cheap", "cheapness"], answerIndex: 2, explanation: "Chuỗi tính từ: clean, comfortable, cheap." },
      { type: "fill_blank", question: "Điền dạng đúng của từ trong ngoặc: \"Regular exercise helps people lose weight, sleep better, and ___ (reduce) stress.\"", answer: "reduce", explanation: "Sau \"helps people\": lose, sleep, reduce — cùng V nguyên mẫu." },
      { type: "fill_blank", question: "Điền dạng đúng: \"Governments should focus on building schools, training teachers, and ___ (provide) free meals.\"", answer: "providing", explanation: "Sau \"focus on\": building, training, providing — cùng V-ing." },
      { type: "error_correction", question: "Sửa lỗi: \"Online learning is flexible, cheap, and it saves time.\"", answer: "Online learning is flexible, cheap, and time-saving.", explanation: "Ba thành phần nên cùng là tính từ." },
      { type: "error_correction", question: "Sửa lỗi: \"The job requires patience, creativity, and to be organised.\"", answer: "The job requires patience, creativity, and organisation.", explanation: "Chuỗi danh từ: patience, creativity, organisation." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Du lịch giúp con người mở mang hiểu biết, học hỏi văn hóa mới và thư giãn.\"", answer: "Travelling helps people broaden their horizons, learn about new cultures, and relax.", explanation: "Sau \"helps people\": ba động từ nguyên mẫu song song." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Một giáo viên giỏi cần kiên nhẫn, sáng tạo và nhiệt tình.\"", answer: "A good teacher needs to be patient, creative, and enthusiastic.", explanation: "Ba tính từ song song sau \"to be\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Neither the students nor the teachers were happy with the new timetable.\"", answer: "Cả học sinh lẫn giáo viên đều không hài lòng với thời khóa biểu mới.", explanation: "Neither A nor B = cả A lẫn B đều không." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The city plans to build more parks, widen roads, and improve public transport.\"", answer: "Thành phố dự định xây thêm công viên, mở rộng đường sá và cải thiện giao thông công cộng.", explanation: "Ba động từ nguyên mẫu song song sau \"plans to\"." },
      { type: "sentence_transformation", question: "Gộp thành một câu song song: \"Social media helps people stay in touch. It also helps them share news. It helps them find jobs too.\"", answer: "Social media helps people stay in touch, share news, and find jobs.", explanation: "Ba động từ nguyên mẫu sau \"helps people\"." },
      { type: "sentence_transformation", question: "Viết lại dùng \"both … and\": \"Exercise is good for the body. It is also good for the mind.\"", answer: "Exercise is good for both the body and the mind.", explanation: "both + N + and + N." },
      { type: "rewrite", question: "Viết lại cho song song: \"I like to read, swimming, and go to the cinema.\"", answer: "I like reading, swimming, and going to the cinema. (hoặc: I like to read, swim, and go to the cinema.)", explanation: "Chọn một dạng duy nhất cho cả chuỗi." },
      { type: "rewrite", question: "Viết lại cho song song: \"Working from home is better than to commute to the office.\"", answer: "Working from home is better than commuting to the office.", explanation: "Hai vế so sánh cùng V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"The new policy will reduce traffic, cutting pollution, and save time.\"", answer: "Lỗi: \"cutting\" → sửa thành \"cut\".", explanation: "Sau \"will\": reduce, cut, save — cùng V nguyên mẫu." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"He is not only intelligent but also works hard.\"", answer: "Lỗi: \"works hard\" → sửa thành \"hard-working\" (adj – adj).", explanation: "\"not only\" + adj thì \"but also\" + adj." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (giữ song song):\nA: What do you do at the weekend?\nB: I usually go shopping, meet friends, and ___ (watch) films.", answer: "watch", explanation: "go, meet, watch — cùng V nguyên mẫu." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại (giữ song song):\nA: What makes a good boss?\nB: Someone who is fair, supportive, and ___ (organise).", answer: "organised", explanation: "fair, supportive, organised — cùng tính từ." }
    ],
    quiz: [
      { question: "\"The course teaches students how to plan, write, and ___ essays.\"", options: ["editing", "edit", "to editing", "edited"], answerIndex: 1, explanation: "plan, write, edit — cùng V nguyên mẫu." },
      { question: "Câu nào song song?", options: ["He likes running, to swim, and cycling.", "He likes running, swimming, and cycling.", "He likes to run, swimming, and cycle.", "He likes run, swim, and cycling."], answerIndex: 1, explanation: "Chuỗi V-ing." },
      { question: "\"The flat is small, noisy, and ___.\"", options: ["it is expensive", "expensively", "expensive", "expense"], answerIndex: 2, explanation: "Ba tính từ song song." },
      { question: "\"You can pay either by card ___ in cash.\"", options: ["and", "nor", "or", "but"], answerIndex: 2, explanation: "either … or." },
      { question: "\"Reading is more relaxing than ___ TV.\"", options: ["watch", "to watching", "watching", "watched"], answerIndex: 2, explanation: "Reading – watching: cùng V-ing." },
      { question: "\"The government should invest in training teachers and ___ schools.\"", options: ["build", "to build", "building", "built"], answerIndex: 2, explanation: "Sau \"invest in\": training – building." }
    ],
    translationDrills: [advDrill("parallel-structures", "Dịch câu Việt → Anh (giống Viết câu nâng cao)", "Dịch các câu sau sang tiếng Anh, giữ các ý liệt kê ở CÙNG DẠNG (V-ing / to V / tính từ). Gõ xong bấm Kiểm tra để so với đáp án mẫu.")],
    summary: "Cấu trúc song song: các thành phần được nối bằng and/or/both…and/not only…but also phải cùng dạng ngữ pháp. Kiểm tra từ đầu tiên của mỗi ý trước khi nộp bài."
  }),

  lesson({
    category: CATEGORY, lessonKey: "participle-clauses", title: "Participle Clauses (Cụm phân từ)", icon: "🧬", orderIndex: 49,
    overview: "Cụm phân từ (participle clause) dùng V-ing, V3/ed hoặc Having + V3 để rút gọn một mệnh đề, giúp nối hai ý liên quan thành một câu gọn và học thuật. Ở Task 2, mẫu hữu dụng nhất là nêu HỆ QUẢ ở cuối câu: \"…, thereby + V-ing\" và \"…, allowing/enabling sb to V\". Điều kiện quan trọng: chủ ngữ ngầm của cụm phân từ phải trùng với chủ ngữ của mệnh đề chính (hoặc là cả hành động của mệnh đề trước).",
    formula: [
      { label: "Hệ quả: thereby + V-ing", structure: "Mệnh đề, thereby + V-ing …", example: "Remote working eliminates the need to commute, thereby reducing stress and emissions." },
      { label: "Hệ quả: allowing/enabling/helping", structure: "Mệnh đề, allowing/enabling + sb + to V / helping (to) V …", example: "Online courses provide access to knowledge, allowing students to study anywhere." },
      { label: "Hành động trước (Perfect participle)", structure: "Having + V3, S + V …", example: "Having invested heavily in education, the country has made significant progress." },
      { label: "Hành động chủ động đồng thời / nguyên nhân (V-ing)", structure: "V-ing …, S + V …", example: "Realising the danger, the government banned the chemical." },
      { label: "Nghĩa bị động (V3/ed)", structure: "V3 …, S + V … / N + V3 …", example: "Built in 1890, the bridge is the oldest in the city." }
    ],
    usage: [
      { title: "Nêu hệ quả/kết quả của hành động phía trước (Task 2)", description: "Many factories have moved abroad, resulting in job losses at home." },
      { title: "Nói hành động xảy ra trước một hành động khác", description: "Having finished her degree, she started her own business." },
      { title: "Nêu nguyên nhân/lý do (thay cho because/as)", description: "Lacking funds, many schools cannot afford new equipment." },
      { title: "Rút gọn mệnh đề quan hệ", description: "Students living far from campus often feel isolated. (= who live …)" }
    ],
    signalWords: [", thereby + V-ing", ", allowing sb to V", ", enabling sb to V", ", resulting in + N", ", leading to + N", "Having + V3, …", "V-ing …, S + V", "V3/ed …, S + V"],
    examples: [
      { en: "Remote working eliminates the need for employees to commute every day, thereby reducing stress and carbon emissions.", vi: "Làm việc từ xa giúp người lao động không phải di chuyển hằng ngày, từ đó giảm căng thẳng và lượng khí thải carbon." },
      { en: "Online courses provide students with access to knowledge from anywhere, allowing them to study without moving to large cities.", vi: "Các khóa học trực tuyến giúp sinh viên tiếp cận kiến thức từ bất cứ đâu, cho phép họ học tập mà không cần chuyển đến các thành phố lớn." },
      { en: "The government has built more metro lines, thereby helping to reduce the number of cars on the roads.", vi: "Chính phủ đã xây dựng thêm nhiều tuyến tàu điện ngầm, từ đó giúp giảm số lượng xe hơi trên đường." },
      { en: "Having invested heavily in education, the country has made significant economic progress.", vi: "Sau khi đầu tư mạnh vào giáo dục, quốc gia này đã đạt được những tiến bộ đáng kể về kinh tế." },
      { en: "The use of solar energy reduces dependence on fossil fuels, thereby limiting negative impacts on the environment.", vi: "Việc sử dụng năng lượng mặt trời giúp giảm sự phụ thuộc vào nhiên liệu hóa thạch, từ đó hạn chế tác động tiêu cực đến môi trường." },
      { en: "Health applications provide users with useful information, allowing them to monitor their health more easily.", vi: "Các ứng dụng sức khỏe cung cấp cho người dùng thông tin hữu ích, cho phép họ theo dõi tình trạng sức khỏe của mình dễ dàng hơn." },
      { en: "Many young people move to cities, leading to a shortage of workers in rural areas.", vi: "Nhiều người trẻ chuyển lên thành phố, dẫn đến tình trạng thiếu lao động ở nông thôn." },
      { en: "Feeling tired after the long journey, we went straight to bed.", vi: "Cảm thấy mệt sau chuyến đi dài, chúng tôi đi ngủ ngay." },
      { en: "Built in the 19th century, the museum attracts thousands of visitors every year.", vi: "Được xây dựng vào thế kỷ 19, bảo tàng thu hút hàng nghìn du khách mỗi năm." },
      { en: "Having lost his job, he decided to retrain as a nurse.", vi: "Sau khi mất việc, anh ấy quyết định học lại để trở thành y tá." },
      { en: "Students living far from campus often spend hours travelling each day.", vi: "Những sinh viên sống xa trường thường mất hàng giờ đi lại mỗi ngày." }
    ],
    mistakes: [
      { wrong: "Walking along the street, the rain started.", right: "Walking along the street, I got caught in the rain.", note: "Lỗi \"dangling participle\": chủ ngữ ngầm của cụm phân từ (người đi bộ) phải trùng chủ ngữ mệnh đề chính." },
      { wrong: "Remote working reduces commuting, thereby reduce stress.", right: "Remote working reduces commuting, thereby reducing stress.", note: "Sau \"thereby\" dùng V-ing." },
      { wrong: "Online courses are cheap, allowing students study anywhere.", right: "Online courses are cheap, allowing students to study anywhere.", note: "allow/enable + sb + TO V." },
      { wrong: "Having invest in education, the country grew quickly.", right: "Having invested in education, the country grew quickly.", note: "Having + V3 (quá khứ phân từ)." },
      { wrong: "Building in 1890, the bridge is the oldest in the city.", right: "Built in 1890, the bridge is the oldest in the city.", note: "Cây cầu \"được\" xây → nghĩa bị động → dùng V3 (Built)." },
      { wrong: "Many people moved to cities, leading to the rural workforce shrinks.", right: "Many people moved to cities, leading to a shrinking rural workforce.", note: "\"lead to / result in\" + danh từ/cụm danh từ, không + mệnh đề." }
    ],
    tips: [
      "Mẫu \"…, thereby + V-ing\" và \"…, allowing sb to V\" là cách nhanh nhất để nối nguyên nhân → hệ quả trong một câu thân bài Task 2.",
      "Luôn kiểm tra: ai/cái gì thực hiện hành động trong cụm phân từ? Nếu không phải chủ ngữ mệnh đề chính (và không phải cả sự việc phía trước) → câu bị lỗi dangling.",
      "V-ing = chủ động; V3/ed = bị động; Having + V3 = hành động xảy ra TRƯỚC.",
      "Không nên dùng cụm phân từ cho mọi câu — xen kẽ với mệnh đề đầy đủ (because, which…) để bài viết tự nhiên."
    ],
    comparison: [
      {
        title: "Mệnh đề đầy đủ vs Cụm phân từ",
        headers: ["Mệnh đề đầy đủ", "Cụm phân từ"],
        rows: [
          ["…, and this reduces stress.", "…, thereby reducing stress."],
          ["…, which allows them to study anywhere.", "…, allowing them to study anywhere."],
          ["After the country had invested in education, it grew.", "Having invested in education, the country grew."],
          ["Because she felt tired, she went home.", "Feeling tired, she went home."],
          ["The bridge, which was built in 1890, …", "Built in 1890, the bridge …"]
        ]
      },
      {
        title: "V-ing vs V3/ed vs Having + V3",
        headers: ["Dạng", "Nghĩa", "Ví dụ"],
        rows: [
          ["V-ing", "Chủ động, đồng thời/nguyên nhân", "Knowing the answer, she raised her hand."],
          ["V3/ed", "Bị động", "Written in 1950, the book is still popular."],
          ["Having + V3", "Chủ động, xảy ra trước", "Having read the book, I watched the film."],
          ["Having been + V3", "Bị động, xảy ra trước", "Having been told the news, she called home."]
        ]
      }
    ],
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"Solar panels cut electricity bills, ___ households to save money.\"", options: ["allow", "allowing", "allowed", "to allow"], answerIndex: 1, explanation: "Hệ quả: …, allowing sb to V." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ the report, the manager called a meeting.\"", options: ["Having read", "Have read", "Being read", "Read having"], answerIndex: 0, explanation: "Hành động đọc xảy ra trước → Having + V3." },
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ in 1998, the company now employs 5,000 people.\"", options: ["Founding", "Founded", "Having founded", "To found"], answerIndex: 1, explanation: "Công ty \"được\" thành lập → bị động → V3." },
      { type: "fill_blank", question: "Điền dạng đúng: \"Public transport reduces the number of cars, thereby ___ (cut) air pollution.\"", answer: "cutting", explanation: "thereby + V-ing." },
      { type: "fill_blank", question: "Điền dạng đúng: \"___ (finish) her homework, she went out with her friends.\"", answer: "Having finished", explanation: "Hành động xảy ra trước → Having + V3." },
      { type: "error_correction", question: "Sửa lỗi: \"The internet connects people worldwide, enabling them share ideas instantly.\"", answer: "The internet connects people worldwide, enabling them to share ideas instantly.", explanation: "enable + sb + to V." },
      { type: "error_correction", question: "Sửa lỗi: \"Writing in 1865, the novel is still widely read.\"", answer: "Written in 1865, the novel is still widely read.", explanation: "Cuốn tiểu thuyết \"được viết\" → bị động → Written." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng thereby): \"Chính phủ đã tăng thuế thuốc lá, từ đó giảm số người hút thuốc.\"", answer: "The government has raised taxes on cigarettes, thereby reducing the number of smokers.", explanation: "Mệnh đề, thereby + V-ing." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh (dùng Having): \"Sau khi tốt nghiệp đại học, cô ấy chuyển đến London.\"", answer: "Having graduated from university, she moved to London.", explanation: "Having + V3, S + V." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Smartphones give children instant access to games, making it harder for them to concentrate on studying.\"", answer: "Điện thoại thông minh giúp trẻ em truy cập trò chơi ngay lập tức, khiến chúng khó tập trung vào việc học hơn.", explanation: "…, making it harder for sb to V = khiến ai đó khó … hơn." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Having lived abroad for ten years, he speaks three languages fluently.\"", answer: "Đã sống ở nước ngoài mười năm, anh ấy nói trôi chảy ba thứ tiếng.", explanation: "Having + V3 diễn tả hành động/trải nghiệm xảy ra trước." },
      { type: "sentence_transformation", question: "Viết lại dùng \"allowing\": \"Libraries offer free Wi-Fi, which allows students to study online.\"", answer: "Libraries offer free Wi-Fi, allowing students to study online.", explanation: "Bỏ \"which\", đổi \"allows\" thành \"allowing\"." },
      { type: "sentence_transformation", question: "Viết lại dùng cụm phân từ: \"After she had saved enough money, she bought a car.\"", answer: "Having saved enough money, she bought a car.", explanation: "Cùng chủ ngữ \"she\" → After she had V3 = Having V3." },
      { type: "rewrite", question: "Viết lại dùng cụm phân từ: \"Because he felt ill, he stayed at home.\"", answer: "Feeling ill, he stayed at home.", explanation: "Nguyên nhân, chủ động, cùng chủ ngữ → V-ing." },
      { type: "rewrite", question: "Viết lại dùng \"thereby\": \"Cities are planting more trees, and this improves air quality.\"", answer: "Cities are planting more trees, thereby improving air quality.", explanation: "and this + V → thereby + V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"Arriving at the station, the train had already left.\"", answer: "Lỗi dangling: tàu không \"arriving\" → sửa: \"Arriving at the station, I found that the train had already left.\"", explanation: "Chủ ngữ của cụm phân từ phải trùng chủ ngữ mệnh đề chính." },
      { type: "find_mistake", question: "Tìm lỗi sai: \"Many farmers left the countryside, resulting in food production fell.\"", answer: "Lỗi: \"food production fell\" → sửa thành \"a fall in food production\".", explanation: "result in + danh từ/cụm danh từ." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại:\nA: Why do you like working from home?\nB: It saves me two hours a day, ___ (allow) me to spend more time with my kids.", answer: "allowing", explanation: "…, allowing sb to V." },
      { type: "mini_dialogue", question: "Hoàn thành hội thoại:\nA: When did you start your business?\nB: ___ (work) for a big company for five years, I decided to go it alone.", answer: "Having worked", explanation: "Hành động xảy ra trước → Having + V3." }
    ],
    quiz: [
      { question: "\"The city built new cycle lanes, ___ the number of cyclists.\"", options: ["thereby increase", "thereby increasing", "thereby increased", "thereby to increase"], answerIndex: 1, explanation: "thereby + V-ing." },
      { question: "\"___ his keys, he couldn't get into the house.\"", options: ["Having lost", "Lost", "Have lost", "Being lose"], answerIndex: 0, explanation: "Hành động xảy ra trước → Having + V3." },
      { question: "\"___ by millions of people, the app is now the most popular in the country.\"", options: ["Using", "Used", "Having used", "To use"], answerIndex: 1, explanation: "Ứng dụng \"được\" dùng → V3." },
      { question: "\"Video calls connect families, enabling them ___ in touch.\"", options: ["stay", "staying", "to stay", "stayed"], answerIndex: 2, explanation: "enable sb to V." },
      { question: "Câu nào KHÔNG bị lỗi dangling?", options: ["Opening the door, the cat ran out.", "Opening the door, I saw the cat run out.", "Opening the door, the room was dark.", "Opening the door, it was raining."], answerIndex: 1, explanation: "\"I\" là người mở cửa → trùng chủ ngữ." },
      { question: "\"Prices rose sharply, ___ a fall in demand.\"", options: ["leading to", "leading", "led to", "to lead to"], answerIndex: 0, explanation: "…, leading to + danh từ." }
    ],
    translationDrills: [advDrill("participle-clauses", "Dịch câu Việt → Anh (giống Viết câu nâng cao)", "Dịch các câu sau sang tiếng Anh bằng cụm phân từ (…, thereby V-ing / …, allowing sb to V / Having V3, …). Gõ xong bấm Kiểm tra để so với đáp án mẫu.")],
    summary: "Cụm phân từ rút gọn mệnh đề: V-ing (chủ động), V3 (bị động), Having V3 (xảy ra trước). Với Task 2, nhớ hai mẫu nêu hệ quả \"…, thereby V-ing\" và \"…, allowing sb to V\" — và luôn kiểm tra chủ ngữ để tránh lỗi dangling."
  })
];
