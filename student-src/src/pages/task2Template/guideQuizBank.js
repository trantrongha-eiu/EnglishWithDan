// Hand-written questions for the reading-check quizzes on the Task 2 type
// guide ("Hướng dẫn dạng bài này"). Each item checks one thing the guide
// (backend scripts/data/task2/typeGuides.js) says. guideQuizRules.js adds the
// questions it can build from the guide itself (outline order, upgrade
// table, useful language, model-essay roles) and the recognition drills
// on PROMPTS below.
//
// Item shapes:
//   { q, ok, no: [3 wrong], why }   multiple choice (options shuffled)
//   { q, tf: true|false, why }      Đúng / Sai

// Option labels for "which essay type is this?"
export const TYPE_NAME = {
  type01: 'Advantages & Disadvantages (Ưu – nhược điểm)',
  type02: 'Discuss Both Views (Thảo luận hai quan điểm)',
  type03: 'Cause – Solution (Nguyên nhân – Giải pháp)',
  type04: 'Effect – Solution (Hậu quả – Giải pháp)',
  type05: 'Cause – Effect (Nguyên nhân – Hậu quả)',
  type06: 'Agree / Disagree (Đồng ý / Không đồng ý)',
  type07: 'Positive / Negative Development (Tích cực hay tiêu cực)',
};

// What the essay has to do — the answer to "đề này cần viết gì?"
export const WRITE = {
  type01: 'Một đoạn ưu điểm + một đoạn nhược điểm; nếu đề hỏi "outweigh / more … than" thì phải chọn phe ở cả mở bài và kết bài',
  type02: 'Một đoạn cho quan điểm 1 + một đoạn cho quan điểm 2 (dài tương đương), nêu ý kiến riêng ở mở bài và kết bài',
  type03: 'Trả lời đủ HAI câu hỏi: nguyên nhân (Body 1) và giải pháp cho đúng các nguyên nhân đó (Body 2)',
  type04: 'Trả lời đủ HAI câu hỏi: hậu quả / vấn đề gây ra (Body 1) và giải pháp cho các hậu quả đó (Body 2)',
  type05: 'Nguyên nhân (Body 1) và hậu quả (Body 2) — KHÔNG viết giải pháp',
  type06: 'Nêu rõ đồng ý / không đồng ý / đồng ý một phần ngay mở bài, hai body đều bảo vệ lập trường đó',
  type07: 'Đánh giá tốt hay xấu ngay mở bài, phần lớn bài bảo vệ đánh giá đó (chỉ thừa nhận ngắn mặt còn lại)',
};

// The types each one is most often confused with — used as wrong options.
export const CONFUSE = {
  type01: ['type07', 'type02', 'type06'],
  type02: ['type06', 'type01', 'type07'],
  type03: ['type04', 'type05', 'type01'],
  type04: ['type03', 'type05', 'type07'],
  type05: ['type03', 'type04', 'type07'],
  type06: ['type02', 'type07', 'type01'],
  type07: ['type01', 'type06', 'type02'],
};

// Practice prompts to classify. `cue` = the words that give the type away.
export const PROMPTS = [
  { t: 'type01', cue: 'What are the advantages and disadvantages', p: 'More and more people are choosing to shop online rather than in stores. What are the advantages and disadvantages of this trend?' },
  { t: 'type01', cue: 'Do the advantages outweigh the disadvantages?', p: 'Many students now go abroad for their university education. Do the advantages of this outweigh the disadvantages?' },
  { t: 'type01', cue: 'Discuss the advantages and disadvantages', p: 'Some companies now allow employees to work four days a week instead of five. Discuss the advantages and disadvantages of this.' },
  { t: 'type01', cue: 'more advantages than disadvantages?', p: 'Nowadays, many young people take a gap year before starting university. Does this have more advantages than disadvantages?' },
  { t: 'type01', cue: 'Do the benefits outweigh the drawbacks?', p: 'Tourism is growing rapidly in many developing countries. Do the benefits of this outweigh the drawbacks for local communities?' },

  { t: 'type02', cue: 'Some people believe… while others think… Discuss both views', p: 'Some people believe that university education should be free for everyone, while others think students should pay for it. Discuss both views and give your own opinion.' },
  { t: 'type02', cue: 'Some people think… while others believe… Discuss both these views', p: 'Some people think children should start school at a very early age, while others believe they should not begin until they are older. Discuss both these views and give your opinion.' },
  { t: 'type02', cue: 'Some argue… while others believe… Discuss both views', p: 'Some argue that governments should spend money on space exploration, while others believe this money should be used to solve problems on Earth. Discuss both views and give your own opinion.' },
  { t: 'type02', cue: 'Some people say… Others believe… Discuss both views', p: 'Some people say that the best way to learn a foreign language is to live in the country where it is spoken. Others believe it can be learned just as well at home. Discuss both views and give your opinion.' },
  { t: 'type02', cue: 'Some people think… while others believe… Discuss both views', p: 'Some people think that zoos are cruel and should be closed, while others believe they help to protect endangered animals. Discuss both views and give your own opinion.' },

  { t: 'type03', cue: 'What are the causes… what solutions can you suggest?', p: 'Obesity rates among children are rising in many countries. What are the causes of this problem, and what solutions can you suggest?' },
  { t: 'type03', cue: 'Why is this happening… what can be done to address it?', p: 'Many young people today are leaving rural areas to live in big cities. Why is this happening, and what can be done to address it?' },
  { t: 'type03', cue: 'What are the main causes… how can the problem be solved?', p: 'In many cities, traffic congestion is getting worse every year. What are the main causes, and how can the problem be solved?' },
  { t: 'type03', cue: 'Why is this the case… what measures could be taken', p: 'Fewer students are choosing to study science subjects at university. Why is this the case, and what measures could be taken to encourage more students to study science?' },

  { t: 'type04', cue: 'What problems does this cause… what can be done', p: 'More and more people spend many hours a day on social media. What problems does this cause, and what can be done to reduce them?' },
  { t: 'type04', cue: 'What effects does this have… what measures can be taken', p: 'Many cities are suffering from increasing noise pollution. What effects does this have on residents, and what measures can be taken to tackle it?' },
  { t: 'type04', cue: 'What problems will this cause… what solutions can you suggest?', p: 'The number of elderly people in many countries is rising. What problems will this cause for society, and what solutions can you suggest?' },
  { t: 'type04', cue: 'What impact does this have… how can the situation be improved?', p: 'Huge amounts of plastic waste are ending up in the world’s oceans. What impact does this have, and how can the situation be improved?' },

  { t: 'type05', cue: 'What are the reasons… what effects does it have', p: 'In many countries, the average age at which people get married is increasing. What are the reasons for this, and what effects does it have on society?' },
  { t: 'type05', cue: 'Why is this happening… what are the consequences', p: 'More and more people are moving abroad to work. Why is this happening, and what are the consequences for the countries they leave?' },
  { t: 'type05', cue: 'What are the causes… what effects does it have', p: 'Children today spend much less time playing outdoors than in the past. What are the causes of this, and what effects does it have on their development?' },
  { t: 'type05', cue: 'What has caused this… what are the effects?', p: 'Many traditional skills, such as handwriting and cooking from scratch, are disappearing. What has caused this, and what are the effects?' },

  { t: 'type06', cue: 'To what extent do you agree or disagree?', p: 'Unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?' },
  { t: 'type06', cue: 'Do you agree or disagree?', p: 'Governments should spend more money on public transport than on building new roads. Do you agree or disagree?' },
  { t: 'type06', cue: 'To what extent do you agree or disagree?', p: 'It is more important for schools to teach practical skills than academic subjects. To what extent do you agree or disagree?' },
  { t: 'type06', cue: 'Some people believe that… What is your opinion?', p: 'Some people believe that famous people should not expect to have private lives because they are public figures. What is your opinion?' },
  { t: 'type06', cue: 'Do you agree or disagree with this statement?', p: 'Advertising should be banned on television programmes aimed at children. Do you agree or disagree with this statement?' },

  { t: 'type07', cue: 'Is this a positive or negative development?', p: 'In many countries, people are increasingly buying food from supermarkets rather than local markets. Is this a positive or negative development?' },
  { t: 'type07', cue: 'Do you think this is a positive or negative trend?', p: 'More and more older people are using social media to stay in touch with their families. Do you think this is a positive or negative trend?' },
  { t: 'type07', cue: 'Is this a positive or negative development?', p: 'English is becoming the main language of international business. Is this a positive or negative development?' },
  { t: 'type07', cue: 'Is this a positive or negative change for society?', p: 'Many young adults now choose to live alone rather than with their families. Is this a positive or negative change for society?' },
];

const tfQ = (q, tf, why) => ({ q, tf, why });

export const BANK = {
  type01: {
    recognise: [
      tfQ('Đề "Discuss the advantages and disadvantages of…" BẮT BUỘC bạn phải chọn một phe.', false,
        'Sai. Chỉ "discuss the advantages and disadvantages" thì có thể trung lập. Chỉ khi đề hỏi "more advantages or more disadvantages" hoặc "outweigh" mới bắt buộc chọn phe.'),
      { q: 'Đề hỏi "Do the benefits outweigh the drawbacks?". Bạn phải nêu phe mình chọn ở đâu?', ok: 'Ở cả Introduction và Conclusion', no: ['Chỉ ở Conclusion là đủ', 'Chỉ ở Body 2', 'Không cần nêu, chỉ cần liệt kê hai mặt'],
        why: 'Hướng dẫn: hỏi "outweigh" → BẮT BUỘC chọn một phe và nói rõ ở cả Introduction lẫn Conclusion. Không chọn phe là mất điểm Task Response.' },
      { q: 'Advantages & Disadvantages khác Discuss Both Views ở điểm nào?', ok: 'Adv/Disadv bàn mặt tốt – mặt xấu của MỘT sự việc; Discuss Both Views bàn ý kiến của HAI nhóm người',
        no: ['Adv/Disadv luôn phải nêu ý kiến riêng, Discuss Both Views thì không', 'Adv/Disadv có ba thân bài, Discuss Both Views có hai', 'Hai dạng giống hệt nhau, chỉ khác cách hỏi'],
        why: 'Advantages/Disadvantages nói về mặt tốt và mặt xấu của MỘT thứ; Discuss Both Views nói về quan điểm của HAI nhóm người.' },
    ],
    outline: [
      { q: 'Mỗi đoạn thân bài của dạng này phát triển theo thứ tự nào?', ok: 'IDEA → BECAUSE → RESULT → EXAMPLE', no: ['EXAMPLE → IDEA → RESULT → BECAUSE', 'IDEA → EXAMPLE → BECAUSE → RESULT', 'BECAUSE → IDEA → EXAMPLE → RESULT'],
        why: 'Dàn ý mỗi body: IDEA → BECAUSE (tại sao) → RESULT (dẫn đến gì) → EXAMPLE (ví dụ cụ thể).' },
      { q: 'Phần "RESULT" trong một đoạn thân bài là gì?', ok: 'Ý đó dẫn đến điều gì (kết quả)', no: ['Một ví dụ cụ thể', 'Lý do tại sao', 'Nhắc lại đề bài'],
        why: 'RESULT = dẫn đến gì; BECAUSE = tại sao; EXAMPLE = ví dụ cụ thể.' },
      tfQ('Ở dạng này, Body 1 viết ưu điểm, Body 2 viết nhược điểm.', true, 'Đúng: INTRO → BODY 1: ADVANTAGES → BODY 2: DISADVANTAGES → CONCLUSION + OPINION.'),
      { q: 'Theo dàn ý, ý kiến cá nhân (OPINION) nằm ở đâu?', ok: 'Ở kết bài (CONCLUSION + OPINION); đề hỏi "outweigh" thì nêu cả ở mở bài', no: ['Chỉ ở Body 1', 'Dạng này không có ý kiến cá nhân', 'Ở giữa Body 2'],
        why: 'Dàn ý kết thúc bằng CONCLUSION + OPINION; phần Nhận diện đề nói thêm: đề hỏi "outweigh" thì phải nêu phe ở cả Introduction.' },
    ],
    essay: [
      { q: 'Bài mẫu kết luận thế nào?', ok: 'Ưu điểm nhiều hơn nhược điểm', no: ['Nhược điểm nhiều hơn ưu điểm', 'Hai mặt ngang nhau, không chọn phe', 'Không nêu ý kiến'],
        why: '"On balance, it can be argued that the advantages of this arrangement outweigh its drawbacks…"' },
      { q: 'Ví dụ nào minh hoạ cho ưu điểm "được giúp chăm con"?', ok: 'Ông bà trông cháu để bố mẹ đi làm toàn thời gian', no: ['Ông bà dạy cháu học tiếng Anh', 'Bố mẹ thuê người giúp việc', 'Con cái chuyển ra ở riêng'],
        why: '"Grandparents often help look after young children, allowing parents to maintain full-time employment…"' },
      { q: 'Body 2 nêu những nhược điểm nào?', ok: 'Thiếu riêng tư gây căng thẳng giữa các thế hệ, và quá phụ thuộc vào bố mẹ', no: ['Chi phí nhà ở tăng cao', 'Trẻ em ít được ông bà quan tâm', 'Bố mẹ phải nghỉ việc ở nhà'],
        why: '"a lack of privacy may lead to tension and conflict between generations" và "an over-reliance on parents could result in reduced independence".' },
    ],
    mistakes: [
      { q: 'Body 1 có năm câu, Body 2 chỉ có hai câu. Đây là lỗi gì?', ok: 'Hai body mất cân đối — nên giữ độ dài xấp xỉ nhau', no: ['Không lỗi gì, Body 1 càng dài càng tốt', 'Thiếu ví dụ ở mở bài', 'Viết sai dạng bài'],
        why: 'Giám khảo sẽ thấy bài mất cân đối. Giữ hai đoạn xấp xỉ bằng nhau.' },
      { q: 'Cách viết thân bài nào tốt hơn?', ok: 'Hai ý, mỗi ý được giải thích và có ví dụ', no: ['Liệt kê bốn ý, mỗi ý một câu', 'Càng nhiều ý càng tốt, không cần ví dụ', 'Một ý nhắc lại nhiều lần cho dài'],
        why: 'Hai ý được phát triển đầy đủ luôn tốt hơn bốn ý bị bỏ dở.' },
      { q: 'Lỗi mất điểm nặng nhất ở dạng này là gì?', ok: 'Quên chọn phe khi đề hỏi "outweigh"', no: ['Dùng từ "advantage" quá nhiều lần', 'Kết bài quá ngắn', 'Không đặt tiêu đề cho bài'],
        why: 'Hướng dẫn ghi rõ: quên chọn phe khi đề hỏi "outweigh" là lỗi mất điểm nặng nhất.' },
      tfQ('Advantages & Disadvantages và Discuss Both Views là cùng một dạng, viết giống nhau.', false, 'Sai. Một bên là mặt tốt / xấu của MỘT thứ, một bên là quan điểm của HAI nhóm người.'),
      tfQ('Hai ý được phát triển đầy đủ luôn tốt hơn bốn ý bị bỏ dở.', true, 'Đúng — đây là lỗi thứ hai trong danh sách: liệt kê nhiều ý mà không giải thích ý nào.'),
    ],
  },

  type02: {
    recognise: [
      { q: 'Đề có "Discuss both views and give your own opinion". Bạn phải nêu quan điểm riêng ở đâu?', ok: 'Ở Introduction VÀ nhắc lại ở Conclusion', no: ['Chỉ ở Conclusion là đủ', 'Chỉ ở Body 2', 'Không cần — chỉ trình bày hai quan điểm'],
        why: 'Chỉ nêu ở kết bài là chưa đủ và thường bị giữ ở Band 6.' },
      tfQ('Chỉ cần viết kỹ quan điểm mình đồng ý; quan điểm còn lại viết qua loa cũng được.', false, 'Sai. Phải viết về cả hai quan điểm với độ dài tương đương, kể cả quan điểm bạn không đồng ý.'),
      { q: 'Dấu hiệu nhận ra dạng Discuss Both Views?', ok: 'Đề nêu HAI nhóm người với HAI ý kiến trái ngược, thường kèm "give your own opinion"',
        no: ['Đề hỏi "Is this a positive or negative development?"', 'Đề hỏi "What are the causes and what are the solutions?"', 'Đề nêu MỘT nhận định rồi hỏi "Do you agree or disagree?"'],
        why: 'Dấu hiệu: đề nêu hai nhóm người với hai ý kiến trái ngược, và gần như luôn có cụm "give your own opinion".' },
    ],
    outline: [
      { q: 'Mỗi đoạn thân bài của dạng này đi theo thứ tự nào?', ok: 'VIEW → WHY? → RESULT → EXAMPLE', no: ['WHY? → VIEW → EXAMPLE → RESULT', 'EXAMPLE → VIEW → RESULT → WHY?', 'VIEW → EXAMPLE → WHY? → RESULT'],
        why: 'VIEW → WHY? (tại sao họ nghĩ vậy) → RESULT → EXAMPLE.' },
      { q: 'Phần "WHY?" trong đoạn thân bài trả lời câu hỏi gì?', ok: 'Tại sao nhóm người đó nghĩ như vậy', no: ['Tại sao bạn không đồng ý với họ', 'Đề bài hỏi gì', 'Ví dụ lấy ở đâu'],
        why: 'WHY? = tại sao họ nghĩ vậy — bạn đang tường thuật lý lẽ của nhóm người đó.' },
      tfQ('Ở dạng này, quan điểm cá nhân xuất hiện ở cả mở bài và kết bài.', true, 'Đúng: INTRO + OPINION → … → CONCLUSION + OPINION.'),
      { q: 'Bạn đồng ý với View 2. Đoạn nào nên được viết thuyết phục hơn?', ok: 'Body 2 (View 2)', no: ['Body 1 (View 1)', 'Mở bài', 'Không quan trọng'],
        why: 'Nếu bạn nói đồng ý với View 2 ở Introduction, Body 2 phải được viết thuyết phục hơn Body 1.' },
    ],
    essay: [
      { q: 'Người viết bài mẫu đứng về phía nào?', ok: 'Phía thứ hai: cần thêm những biện pháp khác ngoài ngày không xe', no: ['Phía thứ nhất: ngày không xe là đủ hiệu quả', 'Không đứng về phía nào', 'Phản đối cả hai quan điểm'],
        why: '"…before explaining why I side with the latter" và kết bài: nên kết hợp với quy định khí thải chặt hơn và đầu tư giao thông công cộng.' },
      { q: 'Body 2 đưa ra lý do gì cho thấy ngày không xe chưa đủ?', ok: 'Lượng khí thải giảm chỉ tạm thời, và phần lớn khí thải đến từ công nghiệp, xây dựng, sản xuất điện',
        no: ['Người dân không thích đi xe đạp', 'Ngày không xe làm tăng tai nạn giao thông', 'Chính phủ không có tiền tổ chức'],
        why: '"the reduction in emissions is only temporary" và "a large share of urban emissions originates from industry, construction and power generation".' },
      { q: 'Ở Body 1 và Body 2, người viết dùng cách viết nào?', ok: 'Tường thuật ý kiến người khác ("some people", "critics argue"), chưa dùng "I think"', no: ['Dùng "I think" ở mọi câu', 'Viết như mình thuộc nhóm thứ nhất', 'Chỉ liệt kê số liệu'],
        why: 'Ở hai body bạn đang tường thuật quan điểm của người khác; "I believe" chỉ xuất hiện ở mở bài / kết bài.' },
    ],
    mistakes: [
      tfQ('"Both sides are right" là một quan điểm cá nhân rõ ràng.', false, 'Sai. Hướng dẫn: "Both sides are right" không phải là một quan điểm.'),
      { q: 'Mở bài nói đồng ý với View 2, nhưng Body 1 (View 1) lại dài và thuyết phục hơn Body 2. Lỗi gì?', ok: 'Quan điểm cá nhân mâu thuẫn với thân bài', no: ['Không lỗi gì', 'Thiếu ví dụ', 'Sai dạng bài'],
        why: 'Đồng ý với View 2 thì Body 2 phải được viết thuyết phục hơn Body 1.' },
      { q: 'Câu mở đầu nào hợp với Body 1 (tường thuật View 1)?', ok: '"Some people believe that…"', no: ['"I strongly think that…"', '"In conclusion,…"', '"I totally disagree that…"'],
        why: 'Ở Body 1 và 2 bạn tường thuật quan điểm người khác, chưa dùng "I think".' },
      tfQ('Hai đoạn thân bài phải cân bằng vì đề yêu cầu "discuss both views".', true, 'Đúng — viết một quan điểm dài, quan điểm kia qua loa là lỗi đầu tiên trong danh sách.'),
      tfQ('Hết giờ thì có thể bỏ phần nêu quan điểm riêng, vì đề chủ yếu yêu cầu thảo luận.', false, 'Sai. Đề có "give your own opinion" thì không nêu (hoặc nêu mơ hồ) là mất điểm Task Response.'),
    ],
  },

  type03: {
    recognise: [
      { q: 'Đề Cause – Solution có mấy câu hỏi phải trả lời?', ok: 'Hai: nguyên nhân VÀ giải pháp', no: ['Một: chỉ hỏi giải pháp', 'Một: chỉ hỏi nguyên nhân', 'Ba: nguyên nhân, hậu quả và giải pháp'],
        why: 'Đề luôn có HAI câu hỏi.' },
      tfQ('Bỏ sót một trong hai câu hỏi của đề là mất điểm Task Response ngay lập tức.', true, 'Đúng — hướng dẫn ghi rõ điều này.'),
      { q: 'Giải pháp nên liên quan đến nguyên nhân thế nào?', ok: 'Giải quyết đúng các nguyên nhân đã nêu — điểm cộng lớn cho Coherence', no: ['Không cần liên quan', 'Nên nói về một vấn đề khác cho phong phú', 'Một giải pháp chung chung cho mọi nguyên nhân là đủ'],
        why: 'Giải pháp nên giải quyết đúng nguyên nhân bạn đã nêu — sự ăn khớp này là điểm cộng lớn cho Coherence.' },
    ],
    outline: [
      { q: 'Trong đoạn nguyên nhân, mỗi ý đi theo thứ tự nào?', ok: 'CAUSE → WHY? → RESULT → EXAMPLE', no: ['EXAMPLE → CAUSE → WHY? → RESULT', 'CAUSE → EXAMPLE → RESULT → WHY?', 'WHY? → RESULT → CAUSE → EXAMPLE'],
        why: 'CAUSES: CAUSE → WHY? → RESULT → EXAMPLE.' },
      { q: 'Trong đoạn giải pháp, mỗi ý đi theo thứ tự nào?', ok: 'SOLUTION → HOW IT HELPS → RESULT', no: ['RESULT → SOLUTION → HOW IT HELPS', 'HOW IT HELPS → RESULT → SOLUTION', 'SOLUTION → CAUSE → EXAMPLE'],
        why: 'SOLUTIONS: SOLUTION → HOW IT HELPS → RESULT.' },
      tfQ('Dạng Cause – Solution bắt buộc có một đoạn viết về hậu quả.', false, 'Sai. Dàn ý: INTRO → BODY 1: CAUSES → BODY 2: SOLUTIONS → CONCLUSION.'),
      { q: '"HOW IT HELPS" nghĩa là gì?', ok: 'Giải thích giải pháp đó giúp giải quyết vấn đề như thế nào', no: ['Nêu ai đã gây ra vấn đề', 'Kể một ví dụ về nguyên nhân', 'Nhắc lại đề bài'],
        why: 'Sau khi nêu giải pháp, nói rõ nó giúp thế nào rồi mới đến kết quả.' },
    ],
    essay: [
      { q: 'Bài mẫu nêu hai nguyên nhân nào?', ok: 'Công nghệ cho phép làm mọi việc tại nhà, và công việc ngồi một chỗ, giờ làm dài', no: ['Thời tiết xấu và thiếu sân chơi', 'Phòng gym đắt và thiếu huấn luyện viên', 'Trường học bỏ môn thể dục'],
        why: '"the pervasive influence of technology on everyday routines" và "the length of the modern working day… most jobs today are sedentary".' },
      { q: 'Biện pháp nào được cho là hiệu quả nhất về lâu dài?', ok: 'Thiết kế lại đô thị để đi bộ, đạp xe là lựa chọn dễ nhất', no: ['Phạt người không tập thể dục', 'Cấm các ứng dụng giao đồ ăn', 'Giảm giờ học ở trường'],
        why: 'Kết bài: "redesigning cities around walking and cycling would prove the most effective in the long term".' },
      { q: 'Giải pháp "doanh nghiệp cho giờ làm linh hoạt hoặc phòng tập tại chỗ" nhắm vào nguyên nhân nào?', ok: 'Công việc ngồi nhiều và giờ làm dài', no: ['Các ứng dụng giao đồ ăn', 'Ô nhiễm không khí', 'Thiếu trường học'],
        why: 'Giải pháp ăn khớp với nguyên nhân thứ hai — đúng điều hướng dẫn khuyên.' },
    ],
    mistakes: [
      { q: 'Câu giải pháp nào bị coi là quá chung chung?', ok: '"The government should do something about it."',
        no: ['"Local councils should build protected cycle lanes so that cycling to work feels safe."', '"Employers could offer on-site gyms so that staff can exercise during breaks."', '"Schools could add a daily 30-minute sports session to the timetable."'],
        why: 'Hãy nói rõ ai làm gì và điều đó giúp thế nào.' },
      tfQ('Hai nguyên nhân được giải thích rõ được điểm cao hơn bốn nguyên nhân chỉ liệt kê.', true, 'Đúng — liệt kê bốn nguyên nhân không giải thích cái nào là lỗi đầu tiên trong danh sách.'),
      { q: 'Nguyên nhân là "người trẻ nghiện điện thoại", giải pháp lại là "xây thêm bệnh viện". Lỗi gì?', ok: 'Giải pháp không ăn khớp với nguyên nhân (lỗi Coherence)', no: ['Không lỗi gì', 'Thiếu kết bài', 'Dùng từ quá học thuật'],
        why: 'Giải pháp không ăn khớp với nguyên nhân là lỗi Coherence rất phổ biến.' },
      { q: 'Bạn chưa chắc cách dùng "root causes", "viable approaches". Nên làm gì?', ok: 'Dùng bản Band 6+ đơn giản mà đúng', no: ['Cứ dùng từ khó để được điểm cao', 'Bỏ luôn ý đó', 'Viết từ đó bằng tiếng Việt'],
        why: 'Sai từ khó bị trừ điểm nặng hơn dùng từ dễ mà đúng.' },
      tfQ('Liệt kê càng nhiều nguyên nhân càng chứng tỏ hiểu đề, nên được điểm cao.', false, 'Sai — ít ý nhưng giải thích rõ mới được điểm cao.'),
    ],
  },

  type04: {
    recognise: [
      { q: 'Câu hỏi "What problems does this cause?" hỏi về điều gì?', ok: 'Hậu quả — những vấn đề mà nó gây ra', no: ['Nguyên nhân — vì sao nó xảy ra', 'Giải pháp', 'Bạn đồng ý hay không đồng ý'],
        why: '"What problems does this cause?" hỏi hậu quả, không hỏi vì sao.' },
      { q: 'Effect – Solution khác Cause – Solution ở đâu?', ok: 'Body 1 viết HẬU QUẢ thay vì nguyên nhân; Body 2 vẫn là giải pháp', no: ['Effect – Solution không cần giải pháp', 'Effect – Solution có ba thân bài', 'Không khác gì, viết giống hệt nhau'],
        why: 'Hai dạng gần như giống hệt. Khác biệt duy nhất: Body 1 nói về HẬU QUẢ thay vì nguyên nhân.' },
      tfQ('Đề Effect – Solution có hai câu hỏi (hậu quả và giải pháp), phải trả lời đủ cả hai.', true, 'Đúng — giống Cause – Solution, bỏ một câu hỏi là mất điểm Task Response.'),
    ],
    outline: [
      { q: 'Trong đoạn hậu quả, mỗi ý đi theo thứ tự nào?', ok: 'EFFECT → WHY? → RESULT → EXAMPLE', no: ['WHY? → EFFECT → EXAMPLE → RESULT', 'EFFECT → EXAMPLE → WHY? → RESULT', 'EXAMPLE → RESULT → EFFECT → WHY?'],
        why: 'EFFECTS: EFFECT → WHY? → RESULT → EXAMPLE.' },
      { q: 'Trong đoạn giải pháp, mỗi ý đi theo thứ tự nào?', ok: 'SOLUTION → HOW? → RESULT', no: ['HOW? → SOLUTION → EXAMPLE', 'RESULT → HOW? → SOLUTION', 'SOLUTION → EFFECT → WHY?'],
        why: 'SOLUTIONS: SOLUTION → HOW? → RESULT.' },
      tfQ('Body 1 của dạng này viết về nguyên nhân của vấn đề.', false, 'Sai. Dàn ý: INTRO → BODY 1: EFFECTS → BODY 2: SOLUTIONS → CONCLUSION.'),
      { q: 'Giải pháp ở Body 2 nên nhắm vào đâu?', ok: 'Đúng các hậu quả đã nêu ở Body 1', no: ['Một vấn đề khác của xã hội', 'Nguyên nhân sâu xa chưa được nêu trong bài', 'Không cần liên hệ với Body 1'],
        why: 'Giải pháp không nhắm vào hậu quả đã nêu là một lỗi thường gặp của dạng này.' },
    ],
    essay: [
      { q: 'Bài mẫu nêu hai hậu quả nào của thiếu ngủ?', ok: 'Giảm khả năng tập trung, ra quyết định và hại sức khỏe thể chất', no: ['Tai nạn giao thông và cãi nhau trong gia đình', 'Tốn tiền mua thuốc và mất việc', 'Khó kết bạn và cô đơn'],
        why: '"reduced cognitive performance" và "Another significant impact is on physical health".' },
      { q: 'Vì sao thiếu ngủ làm giảm khả năng tập trung, theo Body 1?', ok: 'Vì não củng cố trí nhớ và phục hồi sự chú ý trong giấc ngủ sâu', no: ['Vì cơ thể bị thiếu nước', 'Vì ánh sáng màn hình làm hỏng mắt', 'Vì người thiếu ngủ ăn ít hơn'],
        why: '"the brain consolidates memory and restores attention during deep sleep".' },
      { q: 'Giải pháp thứ hai trong bài mẫu là gì?', ok: 'Chính sách nơi làm việc bảo vệ thời gian riêng, ví dụ hạn chế email ngoài giờ', no: ['Uống thêm cà phê cho tỉnh táo', 'Cấm dùng điện thoại sau 9 giờ tối', 'Bác sĩ kê thuốc ngủ cho mọi người'],
        why: '"introduce workplace policies that protect employees’ personal time, such as limiting after-hours emails".' },
    ],
    mistakes: [
      { q: 'Đề hỏi "What problems does this cause?" nhưng Body 1 lại giải thích vì sao vấn đề xảy ra. Lỗi gì?', ok: 'Viết nguyên nhân thay vì hậu quả', no: ['Không lỗi gì', 'Thiếu giải pháp', 'Body quá dài'],
        why: 'Đây là lỗi đầu tiên trong danh sách — đọc kỹ đề.' },
      { q: 'Sau khi nêu một hậu quả, nên viết gì tiếp?', ok: 'Giải thích: vì sao nó xảy ra / nó dẫn đến điều gì', no: ['Chuyển ngay sang hậu quả tiếp theo', 'Nêu giải pháp ngay trong câu đó', 'Nhắc lại đề bài'],
        why: 'Sau mỗi hậu quả, hãy trả lời "Why does this happen?" hoặc "What does this lead to?".' },
      { q: 'Hậu quả bạn nêu là "căng thẳng, trầm cảm". Giải pháp nào ăn khớp nhất?', ok: 'Mở dịch vụ tư vấn tâm lý miễn phí ở trường và nơi làm việc', no: ['Xây thêm đường cao tốc', 'Giảm thuế nhập khẩu ô tô', 'Trồng thêm cây xanh ven biển'],
        why: 'Hậu quả là sức khỏe tinh thần thì giải pháp cũng nên liên quan đến sức khỏe tinh thần.' },
      tfQ('Chỉ cần liệt kê thật nhiều hậu quả, không cần giải thích từng cái.', false, 'Sai — chỉ liệt kê hậu quả mà không giải thích là một lỗi thường gặp.'),
      tfQ('Nếu hậu quả bạn nêu là về sức khỏe tinh thần, giải pháp cũng nên về sức khỏe tinh thần.', true, 'Đúng — giải pháp phải nhắm vào hậu quả đã nêu.'),
    ],
  },

  type05: {
    recognise: [
      tfQ('Ở dạng Cause – Effect, nên viết thêm một đoạn giải pháp để bài đầy đủ hơn.', false, 'Sai. Đề KHÔNG hỏi giải pháp — viết giải pháp không được tính điểm và lãng phí thời gian.'),
      { q: 'Điểm khác biệt then chốt của Cause – Effect so với Cause – Solution?', ok: 'Đề KHÔNG hỏi giải pháp — Body 2 viết hậu quả', no: ['Đề hỏi thêm ý kiến cá nhân', 'Đề không hỏi nguyên nhân', 'Bài chỉ có một thân bài'],
        why: 'Cause – Effect: nguyên nhân + hậu quả, không có giải pháp.' },
      { q: 'Nếu vẫn viết giải pháp trong bài Cause – Effect thì sao?', ok: 'Phần đó không được tính điểm, lại mất thời gian', no: ['Được cộng điểm Task Response', 'Được cộng điểm Lexical Resource', 'Bắt buộc phải có'],
        why: 'Nếu bạn viết giải pháp, phần đó không được tính điểm và bạn đã lãng phí thời gian.' },
    ],
    outline: [
      { q: 'Câu mở đầu Body 2 nên làm gì để ghi điểm Coherence?', ok: 'Nhắc lại nguyên nhân, ví dụ "These developments have had a marked effect on…"', no: ['Đặt một câu hỏi tu từ', 'Nêu ngay một giải pháp', 'Bắt đầu bằng "In conclusion"'],
        why: 'Câu mở đầu Body 2 nhắc lại nguyên nhân sẽ nối hai đoạn — ghi điểm Coherence rất tốt.' },
      { q: 'Trong đoạn nguyên nhân, mỗi ý đi theo thứ tự nào?', ok: 'CAUSE → WHY? → EFFECT → EXAMPLE', no: ['EFFECT → CAUSE → EXAMPLE → WHY?', 'CAUSE → EXAMPLE → WHY? → EFFECT', 'WHY? → CAUSE → EFFECT → EXAMPLE'],
        why: 'CAUSES: CAUSE → WHY? → EFFECT → EXAMPLE.' },
      { q: 'Trong đoạn hậu quả, mỗi ý đi theo thứ tự nào?', ok: 'EFFECT → WHY? → RESULT → EXAMPLE', no: ['RESULT → EFFECT → WHY? → EXAMPLE', 'EFFECT → EXAMPLE → RESULT → WHY?', 'WHY? → EXAMPLE → EFFECT → RESULT'],
        why: 'EFFECTS: EFFECT → WHY? → RESULT → EXAMPLE.' },
      tfQ('Body 1 viết nguyên nhân, Body 2 viết hậu quả.', true, 'Đúng: INTRO → BODY 1: CAUSES → BODY 2: EFFECTS → CONCLUSION.'),
    ],
    essay: [
      { q: 'Nguyên nhân thứ nhất trong bài mẫu là gì?', ok: 'Giải trí kỹ thuật số (video, game, mạng xã hội) chiếm hết thời gian rảnh', no: ['Sách quá đắt', 'Thư viện đóng cửa', 'Trường học không dạy đọc'],
        why: '"the sheer availability of digital entertainment, which competes directly for people’s limited free time".' },
      { q: 'Hậu quả lâu dài được nêu là gì?', ok: 'Vốn từ hẹp hơn và tư duy phản biện yếu hơn', no: ['Mắt kém đi vì đọc nhiều', 'Ngành in sách phát triển mạnh', 'Mọi người có nhiều thời gian rảnh hơn'],
        why: '"the long-term implications may include a narrower vocabulary and weaker critical thinking".' },
      tfQ('Bài mẫu không đưa ra giải pháp nào — đúng yêu cầu của dạng Cause – Effect.', true, 'Đúng. Kết bài chỉ tóm tắt nguyên nhân, hậu quả và đánh giá mức độ nghiêm trọng.'),
    ],
    mistakes: [
      { q: '"Vì sao chuyện này xảy ra?" là câu hỏi về…', ok: 'Nguyên nhân', no: ['Hậu quả', 'Giải pháp', 'Quan điểm cá nhân'],
        why: 'Nguyên nhân trả lời "Vì sao chuyện này xảy ra?"; hậu quả trả lời "Chuyện này dẫn đến điều gì?".' },
      { q: '"Chuyện này dẫn đến điều gì?" là câu hỏi về…', ok: 'Hậu quả', no: ['Nguyên nhân', 'Giải pháp', 'Mở bài'],
        why: 'Hậu quả trả lời "Chuyện này dẫn đến điều gì?".' },
      { q: 'Lỗi phổ biến nhất ở dạng Cause – Effect là gì?', ok: 'Viết giải pháp dù đề không hỏi', no: ['Đưa quá nhiều ví dụ', 'Dùng từ "cause" nhiều lần', 'Không có câu hỏi tu từ'],
        why: 'Viết giải pháp dù đề không hỏi — đọc lại đề trước khi viết Body 2.' },
      { q: 'Nguyên nhân bạn nêu là "giờ làm việc dài". Hậu quả nào nối tự nhiên với nguyên nhân đó?', ok: 'Người ta kiệt sức, ít thời gian cho gia đình và sức khỏe', no: ['Giá xăng tăng', 'Nhiều người đi du lịch hơn', 'Trẻ em thích chơi điện tử'],
        why: 'Hậu quả nên là kết quả tự nhiên của nguyên nhân đã nêu — hai đoạn phải liên quan đến nhau.' },
      tfQ('Hai đoạn nguyên nhân và hậu quả có thể nói về hai chuyện không liên quan.', false, 'Sai — hai đoạn không liên quan đến nhau là một lỗi thường gặp.'),
    ],
  },

  type06: {
    recognise: [
      { q: 'Có mấy cách trả lời dạng Agree / Disagree?', ok: 'Ba: hoàn toàn đồng ý, hoàn toàn không đồng ý, đồng ý một phần', no: ['Một: luôn phải đồng ý', 'Hai: đồng ý hoặc không, không có cách khác', 'Bốn: thêm cách "không có ý kiến"'],
        why: 'Ba cách trả lời — chọn MỘT và giữ nguyên đến hết bài.' },
      tfQ('Hoàn toàn đồng ý luôn được điểm cao hơn đồng ý một phần.', false, 'Sai. Không có cách nào cho điểm cao hơn cách nào.'),
      { q: 'Nên chọn cách trả lời nào?', ok: 'Cách mà bạn có nhiều ý nhất, rồi giữ nguyên đến hết bài', no: ['Cách khó nhất để gây ấn tượng', 'Đổi lập trường giữa bài cho cân bằng', 'Mỗi đoạn một cách cho phong phú'],
        why: 'Chọn cách bạn có nhiều ý nhất — và giữ nguyên.' },
    ],
    outline: [
      { q: 'Đồng ý một phần: Body 1 và Body 2 viết gì?', ok: 'Body 1 thừa nhận phần đúng của phía kia ("While it is true that…"), Body 2 bảo vệ quan điểm chính ("However, I believe that…")',
        no: ['Body 1 đồng ý, Body 2 không đồng ý, kết bài không chọn phía nào', 'Cả hai body đều phản bác quan điểm của mình', 'Body 1 nêu nguyên nhân, Body 2 nêu giải pháp'],
        why: 'Đồng ý một phần: Body 1 "While it is true that (opposing point)…", Body 2 "However, I believe that (your main position)…".' },
      { q: 'Hoàn toàn đồng ý: hai body viết gì?', ok: 'Cả hai body đều đưa lý do bảo vệ nhận định', no: ['Body 1 ủng hộ, Body 2 phản bác', 'Body 1 nguyên nhân, Body 2 giải pháp', 'Cả hai body tường thuật ý kiến người khác'],
        why: 'Hoàn toàn đồng ý — hai body đều bảo vệ nhận định.' },
      { q: 'Mỗi đoạn thân bài đi theo thứ tự nào?', ok: 'REASON → BECAUSE → RESULT → EXAMPLE', no: ['EXAMPLE → REASON → RESULT → BECAUSE', 'BECAUSE → EXAMPLE → REASON → RESULT', 'REASON → EXAMPLE → BECAUSE → RESULT'],
        why: 'REASON → BECAUSE → RESULT → EXAMPLE.' },
      tfQ('Lập trường được nêu ở cả mở bài và kết bài.', true, 'Đúng: INTRO + LẬP TRƯỜNG → … → CONCLUSION + LẬP TRƯỜNG.'),
    ],
    essay: [
      { q: 'Lập trường của người viết bài mẫu là gì?', ok: 'Không đồng ý: báo in và sách in sẽ không biến mất', no: ['Đồng ý: sẽ không còn ai mua báo in', 'Đồng ý một phần nhưng nghiêng về đồng ý', 'Không nêu lập trường'],
        why: '"This essay will argue that printed materials are unlikely to vanish…" và "I maintain that printed newspapers and books will not disappear entirely".' },
      { q: 'Lý do ở Body 2 là gì?', ok: 'Nội dung chất lượng sẽ không mãi miễn phí — báo chí cần doanh thu, nhiều nơi đã thu phí', no: ['Người lớn tuổi không biết dùng điện thoại', 'Giấy rẻ hơn tiền điện', 'Sách in đẹp hơn sách điện tử'],
        why: '"not all online content will remain free… most quality outlets have already moved behind paywalls".' },
      { q: 'Câu "Admittedly, digital formats will continue to dominate in volume; nevertheless…" có tác dụng gì?', ok: 'Thừa nhận một điểm của phía kia rồi quay lại củng cố lập trường', no: ['Đổi lập trường sang đồng ý', 'Đưa ra một giải pháp', 'Tóm tắt cả bài'],
        why: '"Admittedly…" thừa nhận, "nevertheless…" quay về lập trường chính.' },
    ],
    mistakes: [
      { q: 'Mở bài nói đồng ý, Body 2 lại nghiêng sang phía kia. Lỗi gì?', ok: 'Lập trường thay đổi giữa bài — lỗi Task Response nghiêm trọng', no: ['Không lỗi, như vậy là cân bằng', 'Lỗi chính tả', 'Thiếu ví dụ'],
        why: 'Lập trường thay đổi giữa bài là lỗi Task Response nghiêm trọng.' },
      tfQ('"I agree 50% and disagree 50%" là một cách đồng ý một phần hợp lệ.', false, 'Sai. Đó không phải là quan điểm — đồng ý một phần vẫn phải nghiêng rõ về một phía.'),
      { q: 'Giám khảo cần thấy lập trường của bạn từ đâu?', ok: 'Ngay từ mở bài', no: ['Từ Body 2', 'Chỉ ở kết bài', 'Không cần nêu'],
        why: 'Không nêu quan điểm ở Introduction là một lỗi thường gặp.' },
      { q: 'Bạn muốn viết một câu phản biện phức tạp nhưng chưa chắc ngữ pháp. Nên làm gì?', ok: 'Bỏ câu đó — một lý do rõ ràng, có ví dụ tốt vẫn đủ cho Band 7', no: ['Vẫn viết vì câu dài được điểm cao', 'Viết câu đó bằng tiếng Việt', 'Chép lại đề bài cho an toàn'],
        why: 'Cố viết câu phản biện phức tạp rồi sai ngữ pháp là lỗi thường gặp.' },
      tfQ('Đồng ý một phần vẫn phải nghiêng rõ về một phía.', true, 'Đúng.'),
    ],
  },

  type07: {
    recognise: [
      tfQ('Dạng Positive / Negative Development viết cân bằng hai mặt tốt – xấu giống Advantages & Disadvantages.', false,
        'Sai. Đây KHÔNG phải dạng cân bằng hai mặt — đề hỏi đánh giá của bạn: xu hướng này tốt hay xấu?'),
      { q: 'Phải nêu đánh giá (tốt hay xấu) ở đâu?', ok: 'Ngay ở Introduction, rồi giữ đến kết bài', no: ['Chỉ ở Conclusion', 'Không cần nêu', 'Ở cuối Body 2'],
        why: 'Chọn một phía ngay ở Introduction và dành phần lớn bài để bảo vệ đánh giá đó.' },
      { q: 'Có được nhắc đến mặt còn lại không?', ok: 'Có, ở Body 2 — nhưng phải quay lại củng cố đánh giá của mình', no: ['Không bao giờ được nhắc', 'Có, và nên viết dài bằng Body 1', 'Có, và kết bài nên đổi sang phía đó'],
        why: 'Có thể thừa nhận mặt còn lại ở Body 2, nhưng phải quay về củng cố quan điểm của mình.' },
    ],
    outline: [
      { q: 'Body 2 của dạng này đi theo thứ tự nào?', ok: 'ADMIT → EXPLAIN → HOWEVER → LẬP TRƯỜNG', no: ['HOWEVER → ADMIT → LẬP TRƯỜNG → EXPLAIN', 'LẬP TRƯỜNG → HOWEVER → EXPLAIN → ADMIT', 'ADMIT → LẬP TRƯỜNG → EXPLAIN → HOWEVER'],
        why: 'BODY 2: ADMIT (thừa nhận) → EXPLAIN → HOWEVER → LẬP TRƯỜNG.' },
      { q: 'Mỗi lý do ở Body 1 đi theo thứ tự nào?', ok: 'REASON → WHY? → RESULT → EXAMPLE', no: ['WHY? → REASON → EXAMPLE → RESULT', 'REASON → EXAMPLE → RESULT → WHY?', 'EXAMPLE → WHY? → REASON → RESULT'],
        why: 'BODY 1: REASON → WHY? → RESULT → EXAMPLE.' },
      { q: 'Body 2 nên dành khoảng bao nhiêu cho mặt trái?', ok: 'Khoảng ba câu, rồi quay lại củng cố quan điểm', no: ['Cả đoạn, dài bằng Body 1', 'Không câu nào', 'Nhiều hơn Body 1 để cân bằng'],
        why: 'Body 2 chỉ nên dành khoảng ba câu cho mặt trái, rồi quay lại củng cố quan điểm.' },
      tfQ('Body 1 trình bày hai lý do chính cho đánh giá của bạn.', true, 'Đúng: BODY 1: HAI LÝ DO.'),
    ],
    essay: [
      { q: 'Đánh giá của người viết bài mẫu là gì?', ok: 'Phần lớn là tích cực', no: ['Phần lớn là tiêu cực', 'Hai mặt ngang nhau', 'Không nêu đánh giá'],
        why: '"In my view, this constitutes a largely positive development…"' },
      { q: 'Mặt trái nào được thừa nhận ở Body 2?', ok: 'Mất giao tiếp tự nhiên trong nhóm, nhân viên mới dễ bị cô lập', no: ['Tiền điện ở nhà tăng', 'Công ty phải trả lương cao hơn', 'Ô nhiễm tăng vì đi lại nhiều hơn'],
        why: '"remote employees lose the informal contact that builds trust within a team… junior staff in particular may feel isolated".' },
      { q: 'Câu "Nevertheless, such drawbacks are largely outweighed by the benefits…" có tác dụng gì?', ok: 'Quay lại củng cố đánh giá tích cực sau khi thừa nhận mặt trái', no: ['Đổi sang đánh giá tiêu cực', 'Mở đầu bài viết', 'Nêu thêm một mặt trái mới'],
        why: 'Đúng khung Body 2: ADMIT → EXPLAIN → HOWEVER → LẬP TRƯỜNG.' },
    ],
    mistakes: [
      { q: 'Hai body cân bằng hoàn toàn, bài không nghiêng về phía nào. Vấn đề là gì?', ok: 'Bài đã thành Advantages & Disadvantages — trả lời sai đề', no: ['Không sao, cân bằng là tốt nhất', 'Chỉ thiếu ví dụ', 'Chỉ cần viết kết bài dài hơn'],
        why: 'Nếu hai body cân bằng hoàn toàn và bạn không nghiêng về phía nào, bạn đã trả lời sai đề.' },
      tfQ('Body 2 nên dài bằng Body 1 và chỉ nói về mặt trái.', false, 'Sai. Body 2 chỉ khoảng ba câu cho mặt trái rồi quay lại củng cố quan điểm.'),
      { q: 'Câu mở bài nào nêu đánh giá rõ ràng?', ok: '"In my view, this is a largely positive development."', no: ['"This essay will discuss both sides of this issue."', '"There are many advantages and disadvantages of this trend."', '"People have different opinions about this."'],
        why: 'Giám khảo cần biết bạn nghĩ gì ngay từ đoạn đầu.' },
      { q: 'Giám khảo cần biết đánh giá của bạn từ đâu?', ok: 'Ngay từ mở bài', no: ['Từ Body 2', 'Chỉ ở kết bài', 'Không cần nêu'],
        why: 'Quên nêu đánh giá ở Introduction là một lỗi thường gặp.' },
      tfQ('Có thể thừa nhận mặt trái, miễn là quay lại củng cố đánh giá của mình.', true, 'Đúng.'),
    ],
  },
};
