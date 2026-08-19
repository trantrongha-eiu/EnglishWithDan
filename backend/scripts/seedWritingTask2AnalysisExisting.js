/**
 * Seed script – "Phân tích đề" (analysisSections) for the 31 pre-existing
 * WritingTask2 topics that predate seedWritingTasks2026Q3.js /
 * seedWritingTask2Analysis2026Q3.js and never got this field. Same
 * band-6.5+ guidance style as seedWritingTask2Analysis2026Q3.js: identify
 * the essay type, pick the SAFEST clear stance/structure for that type
 * (full agree/disagree over partial agreement, answer-both-parts for
 * two-part questions), and split Body 1/Body 2 accordingly.
 *
 * Matches existing docs by exact `prompt` text — does NOT upsert.
 *
 * Run: node backend/scripts/seedWritingTask2AnalysisExisting.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const ANALYSIS = [
  // ── 1. Study many subjects broadly vs few subjects in depth (older schoolchildren) ──
  {
    prompt: 'Some people think that it is better for older schoolchildren to study a large number of subjects and develop a range of knowledge. Others argue that they should study a smaller number of subjects and focus on details. Discuss both views and give your own experience',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss both views (+ "give your own experience" — vẫn cần nêu ý kiến cá nhân ở cuối, không chỉ trình bày trung lập).

2 quan điểm: (1) học NHIỀU môn để có kiến thức rộng, (2) học ÍT môn để đào sâu chuyên môn. Với band 6.5, mỗi Body trình bày 1 quan điểm KHÁCH QUAN (không thiên vị ngay), rồi mới nêu ý kiến cá nhân ở phần kết hoặc 1 câu ngắn cuối mỗi Body.

Thesis statement (mở bài):
While studying a wide range of subjects broadens students' general knowledge, focusing on fewer subjects allows for deeper expertise; in my experience, a balance between the two during secondary school is most beneficial.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Học nhiều môn giúp kiến thức rộng',
        content: `Ý chính: Học nhiều môn giúp học sinh khám phá sở thích/năng khiếu, có nền tảng kiến thức đa dạng để chọn ngành nghề sau này.

Topic sentence:
On the one hand, studying a broad range of subjects allows students to discover their interests and strengths before committing to a specific path.

Cấu trúc hay (an toàn cho band 6.5):
- allow/enable + O + to V
  Studying a broad range of subjects allows students to discover their interests before committing to a specific career.
- have a general understanding of
  Students gain a general understanding of many fields, which is useful in an increasingly interdisciplinary job market.
- for example
  For example, a student who studies both science and the arts may realise a passion for a field they would never have encountered otherwise.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Học ít môn giúp đào sâu chuyên môn',
        content: `Ý chính: Tập trung ít môn giúp học sinh hiểu sâu, chuẩn bị tốt hơn cho kỳ thi đại học/chuyên ngành, tránh bị dàn trải.

Topic sentence:
On the other hand, focusing on fewer subjects enables students to develop a deeper, more thorough understanding of each one.

Cấu trúc hay:
- develop a deeper understanding of
  Focusing on fewer subjects allows students to develop a deeper understanding of each one.
- be well-prepared for
  This approach leaves students well-prepared for specialised university courses or careers.
- in my experience (ý kiến cá nhân, dùng ở đây hoặc kết bài)
  In my experience, narrowing my focus to three core subjects in my final years of school helped me perform far better in my chosen field than when I studied many subjects superficially.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss both views + give your own experience"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu cả 2 view sẽ bàn + 1 câu thesis ngắn gọn về quan điểm cá nhân (không cần giải thích chi tiết ở đây).
BODY 1: trình bày view 1 khách quan, có lý do + ví dụ.
BODY 2: trình bày view 2 khách quan, có lý do + ví dụ — có thể lồng "kinh nghiệm cá nhân" vào cuối Body 2 hoặc để riêng 1 câu trong kết bài.
KẾT BÀI: tóm tắt cả 2 view + nêu rõ quan điểm/kinh nghiệm cá nhân cuối cùng.

Checklist để đạt 6.5+:
① Có trình bày CẢ 2 view một cách công bằng (không viết Body 2 chỉ 2 câu) không?
② Đề bài yêu cầu "give your own experience" — có thực sự nhắc đến trải nghiệm cá nhân (dù ngắn) không, hay chỉ nêu ý kiến chung chung?
③ Mỗi Body có ví dụ cụ thể, không chỉ lý thuyết suông không?`
      },
    ],
  },

  // ── 2. Recycling taught at school vs at home ──
  {
    prompt: 'Some people think that children should be taught at school to recycle materials and avoid waste. Other people believe that children should be taught this at home.Discuss both views and give your own experience',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss both views (+ "give your own experience").

2 quan điểm: (1) dạy tái chế/tiết kiệm ở TRƯỜNG, (2) dạy ở NHÀ. Đây là dạng "nơi nào phù hợp hơn để dạy 1 kỹ năng/thói quen" — công thức chung: Body 1 nêu lý do ủng hộ trường, Body 2 nêu lý do ủng hộ gia đình, mỗi bên đều có điểm mạnh riêng.

Thesis statement:
While schools can teach children the theory behind recycling and environmental responsibility, I believe the habit itself is best reinforced through everyday practice at home.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Trường học nên dạy tái chế',
        content: `Ý chính: Trường có chương trình học bài bản, giáo viên có kiến thức chuyên môn, và trẻ học được cùng bạn bè nên dễ hình thành ý thức cộng đồng.

Topic sentence:
On the one hand, schools are well-equipped to teach children the scientific reasons behind recycling and waste reduction.

Cấu trúc hay (an toàn cho band 6.5):
- be well-equipped to V
  Schools are well-equipped to teach children the scientific reasons behind recycling.
- through structured lessons
  Through structured lessons, students can learn exactly which materials can be recycled and why this matters for the environment.
- alongside peers, which reinforces...
  Learning this alongside peers reinforces the habit through a shared sense of responsibility.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Gia đình nên dạy tái chế',
        content: `Ý chính: Thói quen hình thành tốt nhất qua lặp lại hàng ngày tại nhà, và trẻ học theo hành vi của cha mẹ (role model) hiệu quả hơn lý thuyết ở lớp.

Topic sentence:
On the other hand, habits such as recycling are most effectively learned through daily repetition at home.

Cấu trúc hay:
- learn by observing/imitating
  Children often learn by observing and imitating their parents' daily behaviour.
- become second nature
  When parents consistently separate waste at home, recycling gradually becomes second nature to their children.
- in my experience
  In my experience, I only developed a genuine recycling habit after watching my parents do it every day, not from what I was taught in a classroom.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "nên dạy ở trường hay ở nhà?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu cả 2 view sẽ bàn + thesis ngắn.
BODY 1: điểm mạnh của việc dạy ở TRƯỜNG (kiến thức bài bản, môi trường tập thể).
BODY 2: điểm mạnh của việc dạy ở NHÀ (lặp lại hàng ngày, làm gương từ cha mẹ) — có thể lồng trải nghiệm cá nhân.
KẾT BÀI: tóm tắt + nêu quan điểm/kinh nghiệm cá nhân.

Checklist để đạt 6.5+:
① Mỗi Body có tập trung vào ĐIỂM MẠNH RIÊNG của môi trường đó, không lặp lại ý giữa 2 Body không?
② Có ví dụ cụ thể, không chỉ nói chung chung "trường tốt", "nhà tốt" không?
③ Có nhắc đến trải nghiệm cá nhân như đề yêu cầu không?`
      },
    ],
  },

  // ── 3. Being rich = opportunity to help others (agree/disagree) ──
  {
    prompt: 'Some people said that the most important thing about being rich is that it gives a person the opportunity to help other people. Do you agree or disagree?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — chọn HẲN 1 phía cho band 6.5.

Gợi ý chọn phe: AGREE thường dễ triển khai hơn (dễ tìm ví dụ về người giàu làm từ thiện, quỹ hỗ trợ...), nhưng DISAGREE cũng khả thi nếu lập luận rằng lợi ích lớn nhất của giàu có là tự do cá nhân/an toàn tài chính. Bài mẫu dưới đây chọn AGREE.

Thesis statement:
I agree that the greatest value of wealth lies in the ability it gives individuals to support others, rather than in personal comfort or status.`
      },
      {
        title: '2. Body 1 – Lý do 1: Người giàu có nguồn lực thực sự để tạo ra thay đổi lớn',
        content: `Ý chính: Chỉ những người có tiền bạc dư dả mới đủ khả năng tài trợ quy mô lớn (bệnh viện, học bổng, quỹ từ thiện) mà người bình thường không làm được.

Topic sentence:
Firstly, wealthy individuals have the financial resources to make a significant, large-scale impact that ordinary people simply cannot achieve.

Cấu trúc hay (an toàn cho band 6.5):
- have the resources to V
  Wealthy individuals have the resources to fund hospitals, scholarships, and disaster relief on a scale most people cannot match.
- for instance
  For instance, many billionaires have donated a substantial portion of their fortune to global health and education initiatives.
- make a tangible difference
  This allows them to make a tangible difference in the lives of thousands of people at once.`
      },
      {
        title: '3. Body 2 – Lý do 2: Giúp đỡ người khác mang lại ý nghĩa và sự thỏa mãn thật sự',
        content: `Ý chính: Nhiều người giàu sau khi thỏa mãn nhu cầu vật chất cá nhân nhận ra rằng cảm giác hạnh phúc bền vững đến từ việc cho đi, không phải từ tiêu dùng cá nhân.

Topic sentence:
Secondly, using wealth to help others often brings a deeper sense of purpose than spending it on personal luxury.

Cấu trúc hay:
- bring a sense of purpose/fulfilment
  Using wealth to help others often brings a deeper sense of purpose than personal spending.
- once basic needs are met
  Once their basic needs and comforts are met, many wealthy people find that further material consumption brings diminishing satisfaction.
- as a result
  As a result, they turn to philanthropy as a more meaningful use of their wealth.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree or Disagree" (khẳng định 1 giá trị/tính chất)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree ngay (thesis).
BODY 1: lý do 1 ủng hộ quan điểm đã chọn + ví dụ.
BODY 2: lý do 2 ủng hộ quan điểm đã chọn + ví dụ.
KẾT BÀI: nhắc lại quan điểm, không đổi ý.

Checklist để đạt 6.5+:
① Có chọn RÕ RÀNG agree hoặc disagree ngay từ mở bài, không lấp lửng không?
② 2 lý do ở Body 1 và Body 2 có thực sự KHÁC NHAU (không lặp ý) không?
③ Có ví dụ cụ thể minh họa mỗi lý do không?`
      },
    ],
  },

  // ── 4. Raise fuel price = best way to solve environmental problems (agree/disagree) ──
  {
    prompt: 'The best way to solve the world‘s environmental problem is to increase the price of fuel. To what extent do you agree or disagree?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree ("to what extent" — vẫn nên chọn hẳn 1 phía cho band 6.5, tránh viết "to some extent" chung chung).

Gợi ý chọn phe: DISAGREE thường AN TOÀN hơn — đề nói "the BEST way" (cách TỐT NHẤT) là một tuyên bố tuyệt đối, dễ phản biện rằng đây chỉ là MỘT trong nhiều giải pháp, không phải cách duy nhất/tốt nhất.

Thesis statement:
I disagree that raising fuel prices is the best solution to environmental problems, as it is only one of many measures needed and creates serious side effects on its own.`
      },
      {
        title: '2. Body 1 – Lý do 1: Tăng giá xăng chỉ giải quyết MỘT phần vấn đề (giao thông), không phải toàn bộ ô nhiễm môi trường',
        content: `Ý chính: Ô nhiễm môi trường đến từ nhiều nguồn (công nghiệp, nông nghiệp, phá rừng), không chỉ từ nhiên liệu giao thông — nên tăng giá xăng không thể là giải pháp DUY NHẤT/TỐT NHẤT.

Topic sentence:
Firstly, environmental problems stem from many sources besides fuel consumption, so raising its price alone cannot be considered the best solution.

Cấu trúc hay (an toàn cho band 6.5):
- stem from
  Environmental problems stem from many sources, including industrial waste, deforestation, and agricultural emissions.
- alone cannot solve
  Raising fuel prices alone cannot solve pollution caused by these other industries.
- a more comprehensive approach
  A more comprehensive approach, involving stricter regulations across all polluting sectors, would be far more effective.`
      },
      {
        title: '3. Body 2 – Lý do 2: Tăng giá xăng gây tác động tiêu cực đến kinh tế và người thu nhập thấp',
        content: `Ý chính: Giá nhiên liệu tăng làm tăng chi phí vận chuyển/sản xuất, ảnh hưởng nặng nề đến người nghèo và nền kinh tế nói chung — một giải pháp "tốt nhất" không nên tạo ra hậu quả xã hội lớn như vậy.

Topic sentence:
Secondly, sharply increasing fuel prices places a disproportionate burden on low-income households and the wider economy.

Cấu trúc hay:
- place a burden on
  Sharply increasing fuel prices places a disproportionate burden on low-income households.
- drive up the cost of
  Higher fuel prices drive up the cost of transportation and everyday goods, affecting everyone.
- rather than / instead of
  Rather than punishing consumers financially, investing in renewable energy and public transport would address the root cause more fairly.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "The best way to X is Y — Agree/Disagree"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + disagree rằng đây là cách "TỐT NHẤT" (dễ lập luận vì "duy nhất/tốt nhất" là tuyên bố tuyệt đối).
BODY 1: giải pháp đề xuất chỉ giải quyết 1 PHẦN của vấn đề, không phải toàn bộ.
BODY 2: giải pháp đề xuất có TÁC DỤNG PHỤ tiêu cực, nên không thể là "tốt nhất".
KẾT BÀI: đề xuất cách tiếp cận toàn diện hơn.

Checklist để đạt 6.5+:
① Có khai thác đúng điểm yếu của từ "the BEST way" (tuyệt đối hoá) thay vì chỉ nói chung chung "cách này không tốt" không?
② Có đề cập đến giải pháp thay thế/bổ sung ở Body hoặc kết bài không?
③ Ví dụ có cụ thể (ngành công nghiệp, người thu nhập thấp...) không?`
      },
    ],
  },

  // ── 5 & 13. Children play games instead of sports — why + positive/negative (SAME prompt, 2 separate docs) ──
  {
    prompt: 'Today many children spend a lot of time playing computer games and less time on sports. Why? Is this a negative or positive development?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 phần — (1) Why (nguyên nhân), (2) Negative or positive development (đánh giá xu hướng). KHÔNG phải "discuss both views" — cần trả lời DỨT KHOÁT là tiêu cực hay tích cực ở phần 2.

Gợi ý: chọn "Negative" thường dễ triển khai hơn (dễ liên hệ tới sức khỏe, ít vận động).

Thesis statement:
Children today play more computer games than sports mainly due to the appeal of technology and reduced outdoor safety; overall, I believe this is a negative development.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Why)',
        content: `Ý chính: 2 nguyên nhân chính — (1) game ngày càng hấp dẫn, dễ tiếp cận qua điện thoại/máy tính, (2) không gian vui chơi ngoài trời an toàn ngày càng ít ở đô thị.

Topic sentence:
There are two main reasons why children now favour computer games over physical sports.

Cấu trúc hay (an toàn cho band 6.5):
- be increasingly accessible
  Computer games are increasingly accessible through smartphones and home consoles, requiring no travel or equipment.
- due to a lack of
  This shift is also due to a lack of safe outdoor spaces in many crowded urban areas.
- as a result, parents feel more comfortable...
  As a result, parents feel more comfortable letting their children stay indoors and play games rather than go outside.`
      },
      {
        title: '3. Body 2 – Đánh giá: Đây là xu hướng tiêu cực (Negative)',
        content: `Ý chính: Ít vận động thể chất dẫn đến vấn đề sức khỏe (béo phì), đồng thời giảm cơ hội phát triển kỹ năng xã hội mà thể thao mang lại (làm việc nhóm, giao tiếp trực tiếp).

Topic sentence:
This trend is largely negative, primarily because of its impact on children's physical health.

Cấu trúc hay:
- lead to / contribute to
  A lack of physical activity contributes to health problems such as obesity and poor cardiovascular fitness.
- miss out on
  Children also miss out on the teamwork and social skills that team sports naturally develop.
- unlike... which...
  Unlike sports, which require face-to-face interaction, gaming often isolates children rather than connecting them with peers.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Why + Positive or negative development?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân chính + khẳng định RÕ tích cực/tiêu cực (thesis).
BODY 1: trình bày 1-2 NGUYÊN NHÂN (why) — đây là phần MÔ TẢ, chưa cần đánh giá.
BODY 2: đánh giá TÍCH CỰC hay TIÊU CỰC với lý do + ví dụ cụ thể — đây là phần thể hiện quan điểm.
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có tách RÕ 2 phần: nguyên nhân (Body 1) và đánh giá (Body 2), không gộp lẫn không?
② Có khẳng định DỨT KHOÁT tích cực hay tiêu cực (không lấp lửng "vừa tốt vừa xấu") không?
③ Mỗi Body có đủ 2 ý được phát triển, không chỉ liệt kê 1 câu không?`
      },
    ],
  },
  {
    prompt: 'Today many children spend a lot of time playing computer games and less time on sports. Why? Is this a negative or positive development?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 phần — (1) Why (nguyên nhân), (2) Negative or positive development (đánh giá xu hướng). KHÔNG phải "discuss both views" — cần trả lời DỨT KHOÁT là tiêu cực hay tích cực ở phần 2.

Gợi ý: chọn "Negative" thường dễ triển khai hơn (dễ liên hệ tới sức khỏe, ít vận động).

Thesis statement:
Children today play more computer games than sports mainly due to the appeal of technology and reduced outdoor safety; overall, I believe this is a negative development.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Why)',
        content: `Ý chính: 2 nguyên nhân chính — (1) game ngày càng hấp dẫn, dễ tiếp cận qua điện thoại/máy tính, (2) không gian vui chơi ngoài trời an toàn ngày càng ít ở đô thị.

Topic sentence:
There are two main reasons why children now favour computer games over physical sports.

Cấu trúc hay (an toàn cho band 6.5):
- be increasingly accessible
  Computer games are increasingly accessible through smartphones and home consoles, requiring no travel or equipment.
- due to a lack of
  This shift is also due to a lack of safe outdoor spaces in many crowded urban areas.
- as a result, parents feel more comfortable...
  As a result, parents feel more comfortable letting their children stay indoors and play games rather than go outside.`
      },
      {
        title: '3. Body 2 – Đánh giá: Đây là xu hướng tiêu cực (Negative)',
        content: `Ý chính: Ít vận động thể chất dẫn đến vấn đề sức khỏe (béo phì), đồng thời giảm cơ hội phát triển kỹ năng xã hội mà thể thao mang lại (làm việc nhóm, giao tiếp trực tiếp).

Topic sentence:
This trend is largely negative, primarily because of its impact on children's physical health.

Cấu trúc hay:
- lead to / contribute to
  A lack of physical activity contributes to health problems such as obesity and poor cardiovascular fitness.
- miss out on
  Children also miss out on the teamwork and social skills that team sports naturally develop.
- unlike... which...
  Unlike sports, which require face-to-face interaction, gaming often isolates children rather than connecting them with peers.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Why + Positive or negative development?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân chính + khẳng định RÕ tích cực/tiêu cực (thesis).
BODY 1: trình bày 1-2 NGUYÊN NHÂN (why) — đây là phần MÔ TẢ, chưa cần đánh giá.
BODY 2: đánh giá TÍCH CỰC hay TIÊU CỰC với lý do + ví dụ cụ thể — đây là phần thể hiện quan điểm.
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có tách RÕ 2 phần: nguyên nhân (Body 1) và đánh giá (Body 2), không gộp lẫn không?
② Có khẳng định DỨT KHOÁT tích cực hay tiêu cực (không lấp lửng "vừa tốt vừa xấu") không?
③ Mỗi Body có đủ 2 ý được phát triển, không chỉ liệt kê 1 câu không?`
      },
    ],
  },

  // ── 6. People travelling to other countries — why + positive/negative ──
  {
    prompt: 'Many people are travelling to other countries. Why? Is it a positive or negative development?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 phần — (1) Why (nguyên nhân), (2) Positive or negative development.

Gợi ý: chọn "Positive" thường dễ triển khai hơn (giao lưu văn hoá, kinh tế địa phương).

Thesis statement:
More people travel abroad today mainly due to cheaper flights and greater cultural curiosity; overall, this is a positive development.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Why)',
        content: `Ý chính: 2 nguyên nhân — (1) chi phí du lịch (vé máy bay, dịch vụ đặt phòng online) rẻ và dễ tiếp cận hơn trước, (2) mạng xã hội khiến con người tò mò muốn khám phá những nơi họ nhìn thấy trên mạng.

Topic sentence:
There are two main reasons behind the rise in international travel.

Cấu trúc hay (an toàn cho band 6.5):
- have become more affordable/accessible
  International flights have become far more affordable and accessible thanks to budget airlines and online booking platforms.
- be exposed to
  People are also constantly exposed to images of other countries through social media, which fuels their desire to travel.
- as a result
  As a result, travelling abroad is no longer seen as a luxury reserved for the wealthy.`
      },
      {
        title: '3. Body 2 – Đánh giá: Đây là xu hướng tích cực (Positive)',
        content: `Ý chính: Du lịch quốc tế giúp giao lưu văn hoá, tăng hiểu biết lẫn nhau giữa các quốc gia, đồng thời đóng góp vào kinh tế địa phương ở điểm đến.

Topic sentence:
This trend is largely positive, as it fosters greater understanding between different cultures.

Cấu trúc hay:
- foster understanding between
  International travel fosters greater understanding between people from different cultural backgrounds.
- contribute to the local economy
  Tourists also contribute significantly to the local economy through spending on accommodation, food, and services.
- broaden one's perspective
  Experiencing another culture firsthand broadens a traveller's perspective in ways that cannot be replicated at home.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Why + Positive or negative development?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân chính + khẳng định RÕ tích cực/tiêu cực.
BODY 1: trình bày NGUYÊN NHÂN (why) — mô tả, chưa đánh giá.
BODY 2: đánh giá TÍCH CỰC/TIÊU CỰC với lý do + ví dụ.
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có tách rõ nguyên nhân (Body 1) và đánh giá (Body 2) không?
② Có khẳng định dứt khoát tích cực/tiêu cực không?
③ Ví dụ có cụ thể (vé máy bay giá rẻ, mạng xã hội...) không?`
      },
    ],
  },

  // ── 7. Preserve historic buildings or replace with modern ones (opinion essay) ──
  {
    prompt: 'Should a city try to preserve its old, historic buildings or destroy them and replace them with modern buildings? Use specific reasons and examples to support your opinion.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Opinion essay (giống Agree/Disagree — chọn 1 trong 2 lựa chọn: bảo tồn hay phá bỏ để xây mới). Chọn HẲN 1 phía cho band 6.5.

Gợi ý chọn phe: "Preserve" (bảo tồn) thường dễ triển khai hơn — dễ liên hệ giá trị lịch sử, văn hoá, du lịch.

Thesis statement:
In my opinion, cities should prioritise preserving their historic buildings rather than demolishing them for modern development.`
      },
      {
        title: '2. Body 1 – Lý do 1: Công trình lịch sử là di sản văn hoá không thể thay thế',
        content: `Ý chính: Nhà cổ/di tích lưu giữ bản sắc, lịch sử của thành phố — một khi phá bỏ thì mất vĩnh viễn, không thể xây lại được giá trị đó.

Topic sentence:
Firstly, historic buildings represent a city's cultural identity and heritage, which cannot be recreated once lost.

Cấu trúc hay (an toàn cho band 6.5):
- represent + N
  Historic buildings represent a tangible link to a city's past and cultural identity.
- once + Ved, cannot be Ved
  Once a historic building is demolished, its architectural and historical value can never be replicated.
- serve as a reminder of
  These structures serve as a constant reminder of the city's history for future generations.`
      },
      {
        title: '3. Body 2 – Lý do 2: Bảo tồn di tích mang lại lợi ích kinh tế qua du lịch',
        content: `Ý chính: Các thành phố có công trình lịch sử nổi tiếng thu hút lượng lớn khách du lịch, tạo doanh thu và việc làm cho địa phương.

Topic sentence:
Secondly, preserving historic sites brings substantial economic benefits through tourism.

Cấu trúc hay:
- attract tourists from around the world
  Well-preserved historic districts attract tourists from around the world, generating significant revenue.
- create jobs in
  This, in turn, creates jobs in hospitality, guiding, and related local businesses.
- for example
  For example, cities like Hoi An have built much of their economy around the preservation of their ancient architecture.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "X hay Y? Nêu ý kiến" (Opinion essay 2 lựa chọn)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + chọn RÕ 1 lựa chọn (thesis).
BODY 1: lý do 1 ủng hộ lựa chọn đã chọn + ví dụ.
BODY 2: lý do 2 ủng hộ lựa chọn đã chọn + ví dụ.
KẾT BÀI: nhắc lại lựa chọn, không đổi ý.

Checklist để đạt 6.5+:
① Có chọn RÕ 1 phía ngay từ mở bài không?
② Đề yêu cầu "specific reasons and examples" — mỗi Body có ví dụ CỤ THỂ (tên địa danh, tình huống thật) không, hay chỉ nói chung chung?
③ 2 lý do có thực sự khác nhau (văn hoá vs kinh tế), không trùng ý không?`
      },
    ],
  },

  // ── 8. Open undiscovered areas for oil/gas due to global demand (agree/disagree) ──
  {
    prompt: 'With the increased global demand for oil and gas, undiscovered areas of the world should be opened up to access more resources. To what extent do you agree?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree ("to what extent" — vẫn chọn hẳn 1 phía cho band 6.5).

Gợi ý chọn phe: DISAGREE thường an toàn hơn — dễ lập luận về thiệt hại môi trường và việc cần chuyển sang năng lượng tái tạo thay vì khai thác thêm.

Thesis statement:
I disagree with opening up undiscovered areas for oil and gas extraction, as this would cause severe environmental damage and delay the shift towards renewable energy.`
      },
      {
        title: '2. Body 1 – Lý do 1: Khai thác ở vùng chưa được khám phá gây tổn hại nghiêm trọng đến môi trường',
        content: `Ý chính: Những khu vực chưa khai thác thường là hệ sinh thái nguyên vẹn (rừng nguyên sinh, vùng cực) — khai thác dầu khí ở đó gây ô nhiễm, phá huỷ môi trường sống của nhiều loài.

Topic sentence:
Firstly, extracting oil and gas from previously untouched areas would cause irreversible damage to fragile ecosystems.

Cấu trúc hay (an toàn cho band 6.5):
- cause irreversible damage to
  Drilling in untouched regions would cause irreversible damage to fragile ecosystems and wildlife habitats.
- put + N + at risk
  Oil spills and industrial waste from extraction sites put marine life at serious risk.
- for example
  For example, oil exploration in Arctic regions has already been linked to declining populations of native wildlife.`
      },
      {
        title: '3. Body 2 – Lý do 2: Nên đầu tư vào năng lượng tái tạo thay vì tiếp tục phụ thuộc nhiên liệu hoá thạch',
        content: `Ý chính: Thay vì mở rộng khai thác dầu khí (tài nguyên hữu hạn, gây ô nhiễm), thế giới nên tập trung nguồn lực vào năng lượng sạch — giải pháp bền vững hơn cho nhu cầu năng lượng dài hạn.

Topic sentence:
Secondly, continuing to expand fossil fuel extraction distracts from the more urgent need to invest in renewable energy.

Cấu trúc hay:
- distract from
  Expanding oil extraction distracts governments and companies from investing in cleaner alternatives.
- a finite resource
  Oil and gas are finite resources, so continually seeking new reserves only postpones an inevitable energy transition.
- instead of
  Instead of exploring untouched areas, resources should be redirected towards solar and wind energy infrastructure.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree or Disagree" (đề xuất chính sách/hành động cụ thể)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree ngay.
BODY 1: hậu quả trực tiếp/tác hại của việc thực hiện đề xuất đó.
BODY 2: lý do thứ 2 (hậu quả dài hạn, hoặc giải pháp thay thế tốt hơn).
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có chọn rõ agree/disagree, không viết "to some extent" chung chung không?
② Có đề cập giải pháp thay thế (renewable energy) để bài thuyết phục hơn không?
③ Ví dụ có liên hệ thực tế (Arctic, hệ sinh thái) không?`
      },
    ],
  },

  // ── 9. Planning for the future is a waste of time (agree/disagree) ──
  {
    prompt: 'Some people believe that planning for the future is a waste of time because they think that focusing on the present is more important. To what extent do you agree or disagree?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — chọn hẳn 1 phía.

Gợi ý chọn phe: DISAGREE thường dễ triển khai hơn (dễ lập luận về lợi ích của việc lập kế hoạch: tài chính, sự nghiệp, ổn định).

Thesis statement:
I disagree that planning for the future is a waste of time; in fact, I believe it is essential for achieving long-term stability and success.`
      },
      {
        title: '2. Body 1 – Lý do 1: Lập kế hoạch giúp đạt được mục tiêu dài hạn và ổn định tài chính',
        content: `Ý chính: Không có kế hoạch (tiết kiệm, học tập, sự nghiệp), con người dễ đưa ra quyết định ngắn hạn, thiếu định hướng, khó đạt được thành công lâu dài.

Topic sentence:
Firstly, planning ahead allows individuals to work systematically towards long-term goals such as financial security or career success.

Cấu trúc hay (an toàn cho band 6.5):
- work systematically towards
  Planning allows individuals to work systematically towards long-term goals rather than reacting to events as they occur.
- without a clear plan
  Without a clear plan, people often make short-sighted decisions that harm their future prospects.
- for example
  For example, someone who saves and invests according to a financial plan is far better prepared for emergencies or retirement.`
      },
      {
        title: '3. Body 2 – Lý do 2: Tập trung vào hiện tại và lập kế hoạch không hề mâu thuẫn, mà bổ trợ lẫn nhau',
        content: `Ý chính: Lập kế hoạch không có nghĩa là bỏ qua hiện tại — ngược lại, có kế hoạch rõ ràng giúp giảm lo lắng, cho phép con người tận hưởng hiện tại một cách yên tâm hơn.

Topic sentence:
Secondly, having a plan for the future does not prevent people from enjoying the present — it can actually reduce anxiety about what lies ahead.

Cấu trúc hay:
- reduce anxiety about
  Knowing that one has a clear plan for the future can reduce anxiety about the unknown.
- rather than being mutually exclusive
  Rather than being mutually exclusive, planning and living in the present can complement each other.
- as a result
  As a result, people with a clear direction often feel more secure enjoying their day-to-day lives.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree or Disagree" (phản bác 1 quan điểm/niềm tin)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do 1 phản bác quan điểm trong đề (hoặc ủng hộ, tùy phe chọn) + ví dụ.
BODY 2: lý do 2, có thể chỉ ra rằng 2 điều đề bài đặt đối lập thực ra KHÔNG mâu thuẫn.
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có chọn rõ 1 phía không?
② Lý do có logic chặt chẽ, không chỉ khẳng định suông không?
③ Có ví dụ cụ thể (tài chính, sự nghiệp...) không?`
      },
    ],
  },

  // ── 10. Studying abroad — advantages and disadvantages ──
  {
    prompt: 'In the past, when students did a university degree, they tended to study in their own country. Nowadays, they have more opportunities to study abroad. What are the advantages and disadvantages of this development?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages — trình bày CẢ 2 mặt một cách cân bằng (không cần chọn phe, khác với agree/disagree).

Cấu trúc an toàn cho band 6.5: Body 1 = advantages, Body 2 = disadvantages, mỗi bên 1-2 ý với ví dụ. Kết bài có thể nêu nhận định tổng quan (lợi ích có vượt trội hơn không) nhưng không bắt buộc.

Thesis statement:
Studying abroad offers students valuable exposure to new cultures and better career prospects, but it also brings challenges such as high costs and homesickness.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: (1) Trải nghiệm văn hoá mới, mở rộng tư duy, (2) cơ hội nghề nghiệp tốt hơn nhờ bằng cấp quốc tế và kỹ năng ngoại ngữ.

Topic sentence:
Studying abroad offers several significant advantages for students.

Cấu trúc hay (an toàn cho band 6.5):
- gain exposure to
  Students gain exposure to different cultures, languages, and ways of thinking that they would not encounter at home.
- enhance one's career prospects
  An international degree also enhances students' career prospects, as employers often value global experience and language skills.
- for example
  For example, graduates from renowned foreign universities often have access to a wider range of job opportunities.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: (1) Chi phí học tập và sinh hoạt ở nước ngoài rất cao, (2) sinh viên có thể gặp khó khăn tâm lý (nhớ nhà, cô đơn, sốc văn hoá) khi sống xa gia đình.

Topic sentence:
However, studying abroad also presents notable challenges.

Cấu trúc hay:
- place a financial burden on
  Tuition fees and living costs abroad often place a significant financial burden on students and their families.
- struggle with homesickness/culture shock
  Many students also struggle with homesickness and culture shock during their first months abroad.
- lack the support system
  Being far from family, they may lack the support system they would normally rely on during difficult times.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả lợi ích và hạn chế sẽ bàn (thesis).
BODY 1: TOÀN BỘ về advantages — 1-2 ý + ví dụ.
BODY 2: TOÀN BỘ về disadvantages — 1-2 ý + ví dụ.
KẾT BÀI: tóm tắt, có thể nêu nhận định tổng quan.

Checklist để đạt 6.5+:
① Có tách RÕ 2 Body theo advantages/disadvantages, không trộn lẫn trong 1 đoạn không?
② Mỗi bên có ví dụ cụ thể, không chỉ liệt kê tính từ (good, bad) không?
③ Độ dài 2 Body có cân bằng nhau không (không lệch hẳn về 1 phía)?`
      },
    ],
  },

  // ── 11. Self-employed — why + disadvantages ──
  {
    prompt: 'Nowadays, many people choose to be self-employed, rather than to work for a company or organisation. Why might this be the case? What could be the disadvantages of being self-employed?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 phần — (1) Why (nguyên nhân chọn tự kinh doanh), (2) Disadvantages (hạn chế của việc tự kinh doanh). KHÔNG cần nêu advantages, đề chỉ hỏi why + disadvantages.

Thesis statement:
People increasingly choose self-employment for greater freedom and control over their work, although this path also carries financial and job security risks.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Why)',
        content: `Ý chính: (1) Tự do sắp xếp thời gian, không bị gò bó bởi cấp trên, (2) mong muốn tự thân kiểm soát thu nhập và phát triển ý tưởng kinh doanh riêng.

Topic sentence:
There are two main reasons why more people are choosing to work for themselves.

Cấu trúc hay (an toàn cho band 6.5):
- have full control over
  Self-employment allows individuals to have full control over their working hours and decisions.
- be one's own boss
  Many people are drawn to the idea of being their own boss rather than following someone else's instructions.
- pursue one's own ideas
  Others are motivated by the desire to pursue their own business ideas rather than contributing to someone else's company.`
      },
      {
        title: '3. Body 2 – Hạn chế (Disadvantages)',
        content: `Ý chính: (1) Thu nhập không ổn định, không có các phúc lợi (bảo hiểm, nghỉ phép) như nhân viên công ty, (2) phải tự chịu trách nhiệm toàn bộ công việc, dễ căng thẳng, làm việc quá giờ.

Topic sentence:
However, self-employment also comes with significant disadvantages.

Cấu trúc hay:
- lack the security of
  Self-employed individuals lack the security of a stable monthly salary and standard employee benefits.
- bear full responsibility for
  They also bear full responsibility for every aspect of the business, from finances to daily operations.
- be prone to overworking
  As a result, many self-employed people are prone to overworking, with no clear boundary between work and personal life.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Why + Disadvantages" (hoặc Why + Advantages)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + hạn chế sẽ bàn.
BODY 1: TOÀN BỘ nguyên nhân (why) — mô tả, chưa đánh giá.
BODY 2: TOÀN BỘ về disadvantages (hoặc advantages, tùy đề) — có ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có trả lời ĐÚNG 2 câu hỏi đề bài hỏi (why + disadvantages), không lạc đề sang advantages không?
② Mỗi Body có 2 ý được phát triển đầy đủ, không chỉ liệt kê 1 câu không?
③ Có ví dụ/tình huống cụ thể không?`
      },
    ],
  },

  // ── 12 & 19. Smartphones/tablets/digital devices — advantages/disadvantages or outweigh ──
  {
    prompt: 'The widespread use of smartphones and tablets has changed the way peoplecommunicate. Do the advantages of this development outweigh the\ndisadvantages?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: "Do advantages outweigh disadvantages?" — đây là dạng CÂN NHẮC (weighing up), khác Advantages/Disadvantages thường: cần vừa trình bày cả 2 mặt, vừa đưa ra kết luận RÕ RÀNG bên nào nhiều hơn.

Gợi ý: chọn "advantages outweigh" thường dễ triển khai hơn.

Thesis statement:
While the widespread use of smartphones and tablets has some drawbacks, I believe the advantages of this development outweigh the disadvantages.`
      },
      {
        title: '2. Body 1 – Disadvantages (nêu trước, vì kết luận nghiêng về advantages)',
        content: `Ý chính: Giao tiếp qua màn hình làm giảm tương tác trực tiếp, có thể gây phụ thuộc thiết bị và giảm chất lượng các mối quan hệ thực.

Topic sentence:
On the one hand, the rise of smartphones has reduced the amount of face-to-face communication between people.

Cấu trúc hay (an toàn cho band 6.5):
- reduce the amount of
  Constant use of messaging apps has reduced the amount of meaningful face-to-face interaction between friends and family.
- become overly dependent on
  Many people have become overly dependent on their devices, even when spending time with others in person.

Topic sentence Body 1 (kết đoạn):
However, these drawbacks are relatively minor compared to the benefits this technology brings.`
      },
      {
        title: '3. Body 2 – Advantages (nêu sau, đây là phần "thắng" — nhấn mạnh outweigh)',
        content: `Ý chính: Smartphone/tablet giúp con người kết nối tức thời bất kể khoảng cách, hỗ trợ duy trì quan hệ gia đình/bạn bè ở xa và phối hợp công việc hiệu quả hơn.

Topic sentence:
On the other hand, smartphones allow people to stay connected instantly, regardless of physical distance.

Cấu trúc hay:
- regardless of
  Video calls and messaging apps allow families to stay connected regardless of the distance between them.
- far outweigh
  These benefits, in my view, far outweigh the drawbacks of reduced face-to-face contact.
- for example
  For example, a person working abroad can now maintain daily contact with their family, something that was far more difficult in the past.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Do advantages outweigh disadvantages?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + khẳng định NGAY bên nào outweigh (thesis).
BODY 1: trình bày mặt YẾU HƠN trước (disadvantages nếu chọn advantages outweigh) + 1 câu chuyển ý cuối đoạn.
BODY 2: trình bày mặt MẠNH HƠN (advantages) — đây là trọng tâm, cần lập luận thuyết phục hơn Body 1.
KẾT BÀI: khẳng định lại kết luận.

Checklist để đạt 6.5+:
① Có khẳng định RÕ ngay từ đầu bên nào outweigh, không lấp lửng không?
② Body 2 (bên "thắng") có được lập luận MẠNH hơn Body 1 không (không viết 2 đoạn ngang bằng)?
③ Có câu chuyển ý ở cuối Body 1 để dẫn sang Body 2 không?`
      },
    ],
  },
  {
    prompt: `Nowadays, many people spend a large amount of time using smartphones and other digital devices in their daily lives.What are the advantages and disadvantages of this development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages (khác đề "outweigh" — đây chỉ cần trình bày cân bằng 2 mặt, không bắt buộc kết luận bên nào hơn).

Thesis statement:
The widespread use of smartphones and digital devices brings both considerable benefits and notable drawbacks to people's daily lives.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: Thiết bị số giúp truy cập thông tin tức thời và làm việc/học tập linh hoạt hơn (làm việc từ xa, học online).

Topic sentence:
Digital devices offer considerable convenience in everyday life.

Cấu trúc hay (an toàn cho band 6.5):
- have instant access to
  Smartphones allow people to have instant access to information, news, and services at any time.
- enable + O + to V
  These devices also enable people to work or study remotely, offering greater flexibility.
- for example
  For example, many employees can now attend meetings and complete tasks from home using just a smartphone or tablet.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Sử dụng quá nhiều gây ảnh hưởng sức khỏe (mắt, giấc ngủ) và làm giảm khả năng tập trung, dễ gây xao nhãng.

Topic sentence:
However, excessive use of these devices also brings clear disadvantages.

Cấu trúc hay:
- take a toll on
  Prolonged screen time takes a toll on users' eyesight and sleep quality.
- be a constant source of distraction
  Notifications from social media and messaging apps are a constant source of distraction, reducing productivity.
- in my experience
  In my experience, keeping my phone away while studying significantly improves my concentration.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (công nghệ/thiết bị)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages + ví dụ.
BODY 2: TOÀN BỘ disadvantages + ví dụ (có thể lồng trải nghiệm cá nhân nếu đề cho phép).
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có tách rõ 2 Body theo advantages/disadvantages không?
② Đề yêu cầu "your own knowledge or experience" — có ví dụ thực tế/cá nhân không, hay chỉ lý thuyết chung chung?
③ Độ dài 2 Body cân bằng không?`
      },
    ],
  },

  // ── 14. Study many subjects vs fewer subjects in detail (discuss both, reworded) ──
  {
    prompt: 'Some people believe older students should study many subjects to gain broad knowledge, while others think they should focus on fewer subjects in more detail. Discuss both views and give your opinion.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss both views + give your opinion (khác bản trên ở chỗ: yêu cầu "opinion" chung, không bắt buộc phải là "trải nghiệm cá nhân" cụ thể).

Thesis statement:
While studying many subjects broadens students' general knowledge, focusing on fewer subjects allows for greater expertise; in my opinion, a combination of both is ideal during secondary education.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Học nhiều môn giúp kiến thức rộng',
        content: `Ý chính: Học nhiều môn giúp học sinh khám phá thế mạnh/sở thích của bản thân trước khi chọn chuyên ngành, đồng thời có kiến thức nền đa dạng hữu ích cho cuộc sống.

Topic sentence:
On the one hand, studying a wide range of subjects helps students discover their strengths and interests.

Cấu trúc hay (an toàn cho band 6.5):
- discover one's strengths/interests
  Studying a wide range of subjects helps students discover their strengths and interests before specialising.
- a well-rounded education
  A well-rounded education also equips students with knowledge useful in everyday life, not just their future career.
- for example
  For example, a student who studies both science and languages may find unexpected opportunities that combine both fields.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Học ít môn giúp chuyên sâu hơn',
        content: `Ý chính: Tập trung vào ít môn giúp học sinh có nền tảng vững chắc, chuẩn bị tốt hơn cho các kỳ thi chuyên/đại học và định hướng nghề nghiệp rõ ràng.

Topic sentence:
On the other hand, concentrating on fewer subjects allows students to build more solid expertise in their chosen field.

Cấu trúc hay:
- build solid expertise in
  Focusing on fewer subjects allows students to build solid expertise in their chosen field.
- be better prepared for
  This approach leaves students better prepared for competitive university entrance exams in specific subjects.
- in my opinion
  In my opinion, however, this level of specialisation is only appropriate once students already have a broad foundation to build on.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss both views + give your opinion"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu cả 2 view + thesis ngắn gọn về ý kiến cá nhân.
BODY 1: trình bày view 1 khách quan + ví dụ.
BODY 2: trình bày view 2 khách quan + ví dụ + có thể lồng ý kiến cá nhân ở cuối.
KẾT BÀI: tóm tắt + nêu rõ ý kiến cuối cùng.

Checklist để đạt 6.5+:
① Có trình bày CẢ 2 view công bằng không?
② Ý kiến cá nhân có RÕ RÀNG ở kết bài (hoặc cuối Body 2), không lấp lửng không?
③ Ví dụ có cụ thể không?`
      },
    ],
  },

  // ── 15. Young people reading fewer books — effects + solutions ──
  {
    prompt: 'Young people are reading fewer books than in the past. What effects does this trend have on society, and what solutions can be implemented?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Effects + Solutions (2 phần: hậu quả của xu hướng, và giải pháp khắc phục) — KHÁC dạng Causes + Solutions, ở đây đề hỏi HẬU QUẢ, không hỏi nguyên nhân.

Thesis statement:
The decline in reading among young people has negative effects on their critical thinking and language skills, but this trend can be addressed through targeted educational measures.`
      },
      {
        title: '2. Body 1 – Hậu quả (Effects)',
        content: `Ý chính: Đọc ít sách làm giảm khả năng tư duy phản biện, vốn từ vựng và khả năng tập trung dài hạn — ảnh hưởng đến chất lượng nguồn nhân lực tương lai của xã hội.

Topic sentence:
This decline in reading has several negative effects on society.

Cấu trúc hay (an toàn cho band 6.5):
- have a negative effect on
  Reading fewer books has a negative effect on young people's critical thinking and vocabulary.
- weaken one's ability to
  This trend weakens their ability to concentrate on long, complex texts.
- in the long run
  In the long run, this could lower the overall quality of a country's workforce, as reading is closely linked to analytical skills.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Nhà trường nên lồng ghép các hoạt động đọc sách hấp dẫn hơn (câu lạc bộ sách, thảo luận), và gia đình nên làm gương bằng cách đọc cùng con từ nhỏ.

Topic sentence:
Several measures could help reverse this trend.

Cấu trúc hay:
- introduce + N + to encourage
  Schools could introduce book clubs and reading competitions to make reading more engaging.
- set an example by
  Parents can also set an example by reading with their children from a young age.
- as a result
  As a result, children are more likely to develop a genuine love of reading rather than viewing it as a chore.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Effects + Solutions"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn hậu quả + giải pháp sẽ bàn.
BODY 1: TOÀN BỘ về hậu quả (effects) — 1-2 ý + ví dụ/hệ quả cụ thể.
BODY 2: TOÀN BỘ về giải pháp (solutions) — nên tương ứng với hậu quả đã nêu ở Body 1.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có phân biệt đúng "effects" (hậu quả) chứ không nhầm sang "causes" (nguyên nhân) không?
② Giải pháp ở Body 2 có LIÊN QUAN trực tiếp đến hậu quả ở Body 1 không?
③ Có ví dụ cụ thể không?`
      },
    ],
  },

  // ── 16. Online shopping — discuss both benefits and risks ──
  {
    prompt: 'Online shopping seems to be replacing the traditional method of buying. However, some buyers are skeptical of this practice. Discuss both benefits and risks associated with online shopping.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss both views, nhưng được diễn đạt dưới dạng "benefits and risks" — xử lý giống hệt Advantages/Disadvantages: 1 Body cho lợi ích, 1 Body cho rủi ro.

Thesis statement:
While online shopping offers considerable convenience, it also carries certain risks that make some buyers hesitant to fully embrace it.`
      },
      {
        title: '2. Body 1 – Benefits (Lợi ích)',
        content: `Ý chính: Mua sắm online tiết kiệm thời gian, cho phép so sánh giá dễ dàng, và tiếp cận được nhiều sản phẩm hơn so với cửa hàng truyền thống.

Topic sentence:
Online shopping offers several clear benefits over traditional methods.

Cấu trúc hay (an toàn cho band 6.5):
- save + O + time and effort
  Shopping online saves customers time and effort, as they can buy products without leaving their homes.
- compare prices easily
  It also allows buyers to compare prices across multiple sellers easily before making a decision.
- have access to a wider range of
  Customers have access to a much wider range of products than any single physical store could offer.`
      },
      {
        title: '3. Body 2 – Risks (Rủi ro)',
        content: `Ý chính: Người mua có nguy cơ gặp lừa đảo/hàng giả, và không thể kiểm tra sản phẩm trực tiếp trước khi mua — đây là lý do khiến nhiều người vẫn e ngại.

Topic sentence:
However, online shopping also carries certain risks that make some buyers cautious.

Cấu trúc hay:
- be vulnerable to
  Online shoppers are vulnerable to scams and counterfeit products, especially on unregulated platforms.
- be unable to inspect
  Buyers are also unable to inspect items physically before purchase, which can lead to disappointment upon delivery.
- as a result
  As a result, some customers remain reluctant to fully trust online retailers with high-value purchases.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss both benefits and risks/drawbacks"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu cả benefits và risks sẽ bàn.
BODY 1: TOÀN BỘ benefits + ví dụ.
BODY 2: TOÀN BỘ risks + ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có xử lý đề như dạng Advantages/Disadvantages quen thuộc, không nhầm sang Agree/Disagree không?
② Mỗi Body có ví dụ cụ thể không?
③ Có cân bằng độ dài giữa 2 Body không?`
      },
    ],
  },

  // ── 17. Online learning vs in-person classes — advantages/disadvantages ──
  {
    prompt: 'Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages.

Thesis statement:
Online learning offers greater flexibility and accessibility for students, but it also has drawbacks related to interaction and self-discipline.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: Học online linh hoạt về thời gian/địa điểm, và giúp học sinh ở vùng xa tiếp cận được giáo dục chất lượng mà trước đây khó có được.

Topic sentence:
Online learning offers several important advantages.

Cấu trúc hay (an toàn cho band 6.5):
- offer flexibility in terms of
  Online learning offers flexibility in terms of when and where students can study.
- provide access to
  It also provides access to quality education for students in remote areas who cannot attend traditional schools.
- for example
  For example, a student living far from any university can now complete a full degree programme entirely online.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Học online thiếu tương tác trực tiếp với giáo viên/bạn bè, và đòi hỏi tính tự giác cao — không phải học sinh nào cũng duy trì được động lực học tập.

Topic sentence:
However, online learning also has notable disadvantages.

Cấu trúc hay:
- lack face-to-face interaction with
  Online classes often lack face-to-face interaction with teachers, making it harder to ask questions or get immediate feedback.
- require a high level of self-discipline
  This learning method also requires a high level of self-discipline, which younger students in particular may lack.
- struggle to stay motivated
  As a result, many students struggle to stay motivated without the structure of a physical classroom.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (giáo dục/hình thức học tập)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages + ví dụ.
BODY 2: TOÀN BỘ disadvantages + ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có tách rõ 2 Body không?
② Ví dụ có liên hệ cụ thể đến bối cảnh học tập (giáo viên, học sinh, lớp học) không?
③ Có dùng từ nối rõ ràng (However, also) không?`
      },
    ],
  },

  // ── 18. Social media as major news source — advantages/disadvantages ──
  {
    prompt: 'Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?\n',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages.

Thesis statement:
Relying on social media for news provides speed and convenience, but it also raises serious concerns about accuracy and misinformation.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: Tin tức trên mạng xã hội cập nhật gần như tức thời, và miễn phí, dễ tiếp cận hơn báo chí truyền thống.

Topic sentence:
Using social media for news offers clear practical advantages.

Cấu trúc hay (an toàn cho band 6.5):
- keep + O + updated in real time
  Social media keeps users updated on breaking news in real time, often faster than traditional media.
- be free of charge and easily accessible
  This information is also free of charge and easily accessible to anyone with an internet connection.
- for example
  For example, news of major events often spreads on social media platforms minutes before it appears on television.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Tin tức trên mạng xã hội dễ chứa thông tin sai lệch/chưa kiểm chứng, và thuật toán có thể tạo ra "buồng vọng" (echo chamber) khiến người dùng chỉ tiếp cận 1 chiều thông tin.

Topic sentence:
However, relying on social media for news also carries significant risks.

Cấu trúc hay:
- be prone to spreading misinformation
  Social media is prone to spreading misinformation, as content is rarely fact-checked before being shared.
- create an echo chamber
  Algorithms can also create an echo chamber, showing users only content that matches their existing views.
- as a result
  As a result, users may develop a distorted or one-sided understanding of current events.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (truyền thông/thông tin)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages + ví dụ.
BODY 2: TOÀN BỘ disadvantages + ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có tách rõ 2 Body không?
② Có nhắc đến vấn đề ĐỘ TIN CẬY (misinformation) — đây là ý quan trọng nhất cho chủ đề social media/news không?
③ Ví dụ có cụ thể không?`
      },
    ],
  },

  // ── 20. AI/automation replacing human workers — advantages/disadvantages ──
  {
    prompt: `Many companies are replacing human workers with artificial intelligence (AI) and automated technologies. What are the advantages and disadvantages of this development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages.

Thesis statement:
Replacing human workers with AI and automation increases efficiency for businesses, but it also raises concerns about unemployment and the loss of human judgement.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: AI/tự động hoá giúp doanh nghiệp tăng năng suất, giảm chi phí nhân công, và có thể làm việc liên tục không mệt mỏi/sai sót do con người gây ra.

Topic sentence:
Automating tasks with AI brings clear benefits to businesses.

Cấu trúc hay (an toàn cho band 6.5):
- increase efficiency/productivity
  AI and automated systems increase efficiency by completing repetitive tasks faster than human workers.
- operate around the clock
  Unlike humans, these systems can operate around the clock without fatigue or error.
- for example
  For example, factories using robotic automation have significantly increased their production output.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Tự động hoá khiến nhiều lao động phổ thông mất việc làm, và AI vẫn thiếu khả năng đưa ra phán đoán linh hoạt như con người trong các tình huống phức tạp.

Topic sentence:
However, this development also has serious drawbacks.

Cấu trúc hay:
- lead to job losses in
  Automation often leads to job losses in industries that rely heavily on manual labour.
- lack the judgement/flexibility to
  AI systems still lack the human judgement needed to handle complex or unpredictable situations.
- in my experience/knowledge
  From what I have observed, customer service chatbots, for instance, often fail to resolve issues that require empathy or nuanced understanding.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (công nghệ thay thế con người)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages (góc nhìn doanh nghiệp/hiệu quả) + ví dụ.
BODY 2: TOÀN BỘ disadvantages (góc nhìn người lao động/xã hội) + ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có cân bằng góc nhìn: Body 1 từ phía doanh nghiệp, Body 2 từ phía người lao động/xã hội không?
② Đề yêu cầu ví dụ từ "own knowledge or experience" — có ví dụ thực tế không?
③ Có dùng từ nối rõ ràng không?`
      },
    ],
  },

  // ── 21 & 29. Academic pressure — causes + solutions (2 similar prompts) ──
  {
    prompt: 'Students today face more academic pressure than ever before. What are the causes of this pressure, and what can be done to reduce it?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes + Solutions.

Thesis statement:
Academic pressure among students today mainly stems from intense competition and high parental expectations, but this can be reduced through changes in how schools assess performance.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Causes)',
        content: `Ý chính: (1) Cạnh tranh gay gắt để vào đại học/tìm việc làm khiến học sinh phải nỗ lực hơn trước, (2) kỳ vọng cao từ cha mẹ và xã hội về thành tích học tập.

Topic sentence:
There are two main reasons behind the growing academic pressure on students.

Cấu trúc hay (an toàn cho band 6.5):
- stem from intense competition
  Much of this pressure stems from intense competition for places at top universities and in the job market.
- be placed under pressure by
  Students are also placed under pressure by parents who hold high expectations for their academic performance.
- as a result
  As a result, many students feel they must constantly outperform their peers to succeed.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Nhà trường nên đánh giá học sinh toàn diện hơn (không chỉ dựa vào điểm số/kỳ thi), và cha mẹ nên điều chỉnh kỳ vọng, tập trung vào sự tiến bộ thay vì so sánh thành tích.

Topic sentence:
Several measures could help reduce this pressure.

Cấu trúc hay:
- adopt a more holistic approach to
  Schools could adopt a more holistic approach to assessment, rather than relying solely on exam results.
- set realistic expectations
  Parents, meanwhile, should set realistic expectations and focus on their children's effort and progress rather than grades alone.
- as a result
  As a result, students would likely experience less stress and develop a healthier relationship with learning.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Causes + Solutions"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp sẽ bàn.
BODY 1: TOÀN BỘ nguyên nhân (causes) — 2 ý + ví dụ.
BODY 2: TOÀN BỘ giải pháp (solutions) — nên ứng với từng nguyên nhân đã nêu.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Mỗi giải pháp ở Body 2 có ứng với 1 nguyên nhân cụ thể ở Body 1 không (không đưa giải pháp chung chung không liên quan)?
② Có 2 nguyên nhân RÕ RÀNG, không chỉ 1 ý lặp lại không?
③ Có ví dụ/hệ quả cụ thể không?`
      },
    ],
  },
  {
    prompt: `In many countries, students are under increasing pressure to achieve high grades at school and university. This can have negative effects on their academic performance and well-being.

What are the main causes of this pressure? What measures can be taken to reduce it?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes + Solutions (tương tự đề "academic pressure" khác, nhưng nhấn cụ thể vào ÁP LỰC ĐIỂM SỐ — nên khai thác góc độ thi cử/kỳ vọng điểm số).

Thesis statement:
Pressure to achieve high grades mainly stems from competitive university admissions and parental expectations, but schools and families can take steps to reduce it.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Causes)',
        content: `Ý chính: (1) Hệ thống tuyển sinh đại học cạnh tranh khiến điểm số trở thành thước đo duy nhất của "thành công", (2) cha mẹ/nhà trường đặt nặng thành tích, so sánh học sinh với nhau.

Topic sentence:
This pressure to achieve high grades stems from two main sources.

Cấu trúc hay (an toàn cho band 6.5):
- treat + N + as the sole measure of
  Competitive university admissions systems treat exam results as the sole measure of a student's ability.
- compare + O + to their peers
  Parents and teachers often compare students to their peers, adding further psychological pressure.
- as a result
  As a result, students may come to see their self-worth as tied entirely to their grades.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Trường học nên áp dụng đánh giá đa chiều (dự án, kỹ năng mềm) thay vì chỉ dựa vào điểm thi, và phụ huynh nên khuyến khích nỗ lực thay vì chỉ tập trung vào kết quả.

Topic sentence:
Several measures could help alleviate this pressure.

Cấu trúc hay:
- introduce alternative forms of assessment
  Schools could introduce alternative forms of assessment, such as projects and continuous evaluation, rather than relying solely on final exams.
- praise effort rather than results
  Parents should also learn to praise effort rather than results, helping children build resilience rather than fear of failure.
- from what I have seen/experienced
  From what I have experienced, teachers who focus on individual progress rather than class rankings help students feel far less anxious about grades.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Causes + Solutions" (áp lực điểm số/thi cử)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân (causes) — tập trung vào hệ thống thi cử/kỳ vọng.
BODY 2: TOÀN BỘ giải pháp (solutions) — ứng với từng nguyên nhân.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có phân biệt đề này với đề "academic pressure" khác bằng cách nhấn vào GRADES/EXAMS cụ thể không?
② Giải pháp có ứng với nguyên nhân không?
③ Có ví dụ từ "own knowledge or experience" không?`
      },
    ],
  },

  // ── 22. Cyclists and drivers sharing the road — problems + solutions ──
  {
    prompt: 'Cyclists and car drivers sharing the same road cause some problems. What are the problems? What are the solutions?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Problems + Solutions.

Thesis statement:
Sharing roads between cyclists and drivers creates serious safety risks, but these problems can be addressed through better infrastructure and stricter regulations.`
      },
      {
        title: '2. Body 1 – Vấn đề (Problems)',
        content: `Ý chính: (1) Nguy cơ tai nạn cao do làn đường chung, tài xế khó quan sát người đi xe đạp, (2) xung đột/căng thẳng giữa 2 nhóm do tốc độ di chuyển khác nhau gây cản trở giao thông.

Topic sentence:
Sharing the road between cyclists and drivers creates two major problems.

Cấu trúc hay (an toàn cho band 6.5):
- pose a serious risk to
  The lack of separate lanes poses a serious risk to cyclists, who are far more vulnerable in a collision.
- lead to frustration among
  The difference in speed between cars and bicycles also leads to frustration among drivers stuck behind cyclists.
- as a result
  As a result, accidents and near-misses are common in areas without dedicated cycling infrastructure.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Xây dựng làn đường riêng cho xe đạp, và tăng cường quy định/giáo dục về an toàn giao thông cho cả 2 nhóm.

Topic sentence:
Several solutions could help reduce these problems.

Cấu trúc hay:
- construct/build dedicated lanes for
  City authorities could construct dedicated lanes for cyclists, physically separating them from motor traffic.
- enforce stricter regulations on
  Governments should also enforce stricter regulations on safe overtaking distances for drivers.
- raise awareness of
  Public campaigns could raise awareness of road safety among both cyclists and drivers.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Problems + Solutions"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn vấn đề + giải pháp.
BODY 1: TOÀN BỘ vấn đề (problems) — 2 ý + hệ quả cụ thể.
BODY 2: TOÀN BỘ giải pháp (solutions) — ứng với từng vấn đề.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Giải pháp ở Body 2 có ứng trực tiếp với vấn đề ở Body 1 không?
② Có 2 vấn đề RÕ RÀNG, không lặp ý không?
③ Có dùng từ vựng chuyên biệt về giao thông (lane, infrastructure, overtaking) không?`
      },
    ],
  },

  // ── 23. Children watching more TV, less active/creative things — causes + solutions ──
  {
    prompt: ' Studies have suggested that children watch much more television than they did in the past and spend less time on active or creative things. What are the reasons and what measures should be taken to encourage children to spend more time on active or creative things?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes (reasons) + Solutions (measures).

Thesis statement:
Children today watch more television mainly because of easy access to screens and busy parenting schedules, but this can be addressed through greater parental involvement and school initiatives.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Reasons)',
        content: `Ý chính: (1) Ti vi/thiết bị điện tử ngày càng dễ tiếp cận trong mỗi gia đình, (2) cha mẹ bận rộn, dùng ti vi như một cách "trông trẻ" tiện lợi.

Topic sentence:
There are two main reasons why children now spend more time watching television.

Cấu trúc hay (an toàn cho band 6.5):
- be readily available in
  Televisions and screens are readily available in almost every household, making them an easy default activity.
- use + N + as a convenient way to
  Busy parents often use television as a convenient way to keep children occupied while they work.
- as a result
  As a result, watching TV has become the default activity rather than a deliberate choice.`
      },
      {
        title: '3. Body 2 – Giải pháp (Measures)',
        content: `Ý chính: Cha mẹ nên giới hạn thời gian xem ti vi và chủ động tổ chức hoạt động thay thế (thể thao, vẽ tranh), nhà trường có thể tổ chức thêm câu lạc bộ ngoại khoá.

Topic sentence:
Several measures could encourage children to engage in more active or creative pursuits.

Cấu trúc hay:
- set limits on screen time
  Parents could set clear limits on screen time and actively plan alternative activities such as sports or art.
- offer extracurricular clubs
  Schools could also offer extracurricular clubs that make active and creative pursuits more appealing.
- as a result
  As a result, children would naturally spend less time in front of screens and more time developing other skills.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Reasons + Measures" (giống Causes + Solutions)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân (reasons) — 2 ý.
BODY 2: TOÀN BỘ giải pháp (measures) — ứng với từng nguyên nhân.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Giải pháp có ứng với nguyên nhân đã nêu không?
② Có ví dụ cụ thể (câu lạc bộ, giới hạn giờ xem) không?
③ Có phân biệt rõ 2 phần reasons/measures, không lẫn lộn không?`
      },
    ],
  },

  // ── 24. International tourism seen as bad — reasons + solutions to change attitudes ──
  {
    prompt: 'Many people believe that international tourism is a bad thing for their country. What are the reasons? Solutions to change negative attitudes?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Reasons + Solutions (ở đây "solutions" là giải pháp để THAY ĐỔI THÁI ĐỘ tiêu cực, không phải giải pháp cho chính vấn đề du lịch).

Thesis statement:
Some people view international tourism negatively due to overcrowding and cultural disruption, but these attitudes could be changed through better tourism management and public education.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Reasons người dân có thái độ tiêu cực)',
        content: `Ý chính: (1) Du lịch quá tải gây ảnh hưởng đến đời sống người dân địa phương (giá cả tăng, tắc nghẽn), (2) lo ngại về việc mất bản sắc văn hoá do ảnh hưởng từ du khách nước ngoài.

Topic sentence:
There are two main reasons why some people view international tourism negatively.

Cấu trúc hay (an toàn cho band 6.5):
- drive up the cost of living
  Overtourism can drive up the cost of living for local residents, particularly in housing and daily goods.
- be concerned about the erosion of
  Many locals are also concerned about the erosion of their traditional culture as foreign influence increases.
- as a result
  As a result, some residents come to associate tourism primarily with disruption rather than benefit.`
      },
      {
        title: '3. Body 2 – Giải pháp thay đổi thái độ (Solutions)',
        content: `Ý chính: Chính quyền nên quản lý du lịch bền vững (giới hạn lượng khách ở khu vực nhạy cảm), đồng thời đảm bảo lợi ích kinh tế từ du lịch được chia sẻ công bằng đến cộng đồng địa phương.

Topic sentence:
Several measures could help change these negative attitudes.

Cấu trúc hay:
- manage tourism more sustainably
  Local governments could manage tourism more sustainably by limiting visitor numbers in sensitive areas.
- ensure that + local communities benefit from
  Policies should also ensure that local communities directly benefit from tourism revenue, for example through community-run businesses.
- as a result
  As a result, residents would be more likely to see tourism as an opportunity rather than a threat.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Reasons + Solutions to change attitudes"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân khiến người dân có thái độ tiêu cực.
BODY 2: TOÀN BỘ giải pháp để THAY ĐỔI thái độ đó (không phải giải pháp giảm du lịch).
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có hiểu đúng "solutions" ở đây là để THAY ĐỔI THÁI ĐỘ, không phải để giảm/cấm du lịch không?
② Có ví dụ cụ thể không?
③ 2 nguyên nhân có khác nhau rõ ràng không?`
      },
    ],
  },

  // ── 25. Anti-social behaviour increase — causes + solutions ──
  {
    prompt: 'There is a general increase in anti-social behaviours and lack of respect for others. What are the causes and solutions?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes + Solutions.

Thesis statement:
The rise in anti-social behaviour is mainly caused by weaker family supervision and the anonymity of online interactions, but this can be addressed through stronger community engagement and education.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Causes)',
        content: `Ý chính: (1) Cha mẹ ít thời gian giám sát, dạy dỗ con cái về cách cư xử do bận rộn công việc, (2) môi trường mạng xã hội ẩn danh khiến con người dễ có hành vi thiếu tôn trọng người khác hơn ngoài đời thực.

Topic sentence:
There are two main causes behind the rise in anti-social behaviour.

Cấu trúc hay (an toàn cho band 6.5):
- receive less guidance from
  Many young people receive less guidance from parents who are increasingly occupied with work.
- the anonymity of online platforms
  The anonymity of online platforms also makes people bolder in behaving disrespectfully than they would in person.
- as a result
  As a result, disrespectful behaviour that begins online often carries over into real-life interactions.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Nhà trường nên tăng cường giáo dục đạo đức/kỹ năng sống, và cộng đồng nên có các chương trình gắn kết để xây dựng ý thức tôn trọng lẫn nhau.

Topic sentence:
Several measures could help address this issue.

Cấu trúc hay:
- incorporate + N + into the curriculum
  Schools could incorporate lessons on respect and social responsibility into the curriculum from an early age.
- foster a sense of community through
  Local authorities could foster a sense of community through neighbourhood programmes that bring residents together.
- as a result
  As a result, individuals would feel more accountable to those around them, reducing disrespectful behaviour.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Causes + Solutions" (hành vi xã hội)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân — 2 ý khác nhau (gia đình, xã hội/công nghệ).
BODY 2: TOÀN BỘ giải pháp — ứng với từng nguyên nhân.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có 2 nguyên nhân từ 2 góc độ khác nhau (gia đình vs xã hội/công nghệ) không?
② Giải pháp có ứng với nguyên nhân không?
③ Có ví dụ cụ thể không?`
      },
    ],
  },

  // ── 26. Bicycles used less — why + solutions to encourage more use ──
  {
    prompt: 'Nowadays people use bicycles less as a form of transport. Why is that? What can be done to encourage people to use bicycles more?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Why (causes) + Solutions.

Thesis statement:
People are using bicycles less mainly due to the convenience of cars and unsafe road conditions for cyclists, but this trend can be reversed through improved infrastructure and incentives.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Why)',
        content: `Ý chính: (1) Ô tô/xe máy tiện lợi và nhanh hơn cho quãng đường dài, (2) thiếu làn đường an toàn dành riêng cho xe đạp khiến người dân e ngại.

Topic sentence:
There are two main reasons why bicycle use has declined.

Cấu trúc hay (an toàn cho band 6.5):
- be more convenient for
  Cars and motorbikes are simply more convenient for longer journeys, especially in bad weather.
- deter people from
  A lack of safe, dedicated cycling lanes also deters many people from cycling in busy urban traffic.
- as a result
  As a result, cycling has increasingly been seen as impractical or even dangerous.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Xây dựng hệ thống làn đường xe đạp an toàn, và có chính sách khuyến khích (trợ giá xe đạp, ưu đãi cho người đi làm bằng xe đạp).

Topic sentence:
Several measures could encourage more people to cycle.

Cấu trúc hay:
- invest in dedicated infrastructure for
  Governments could invest in dedicated infrastructure for cyclists, separating them safely from motor traffic.
- offer incentives for
  Authorities could also offer incentives, such as subsidies, for people who commute by bicycle.
- as a result
  As a result, cycling would become both a safer and more attractive option for daily transport.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Why + Solutions to encourage X"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân (why).
BODY 2: TOÀN BỘ giải pháp (solutions) — nhắm vào việc KHUYẾN KHÍCH hành vi mong muốn.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Giải pháp có nhắm đúng vào việc khuyến khích xe đạp (không lạc đề sang giảm ô tô) không?
② Có 2 nguyên nhân rõ ràng không?
③ Có ví dụ cụ thể (làn đường, trợ giá) không?`
      },
    ],
  },

  // ── 27. Young people losing interest in formal education — causes + solutions ──
  {
    prompt: `In many countries, an increasing number of young people are losing interest in formal education and choosing to leave school as soon as possible.

What are the main causes of this problem? What solutions can be taken to encourage young people to continue their education?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes + Solutions.

Thesis statement:
Young people are increasingly losing interest in formal education mainly due to outdated curricula and financial pressures, but this can be addressed by making education more relevant and accessible.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Causes)',
        content: `Ý chính: (1) Chương trình học nặng lý thuyết, thiếu tính thực tiễn khiến học sinh cảm thấy không hữu ích cho tương lai, (2) áp lực tài chính khiến nhiều em phải nghỉ học sớm để đi làm phụ giúp gia đình.

Topic sentence:
There are two main reasons why young people are losing interest in formal education.

Cấu trúc hay (an toàn cho band 6.5):
- fail to prepare + O + for
  Many curricula fail to prepare students for real-world careers, focusing too heavily on theory.
- be forced to V due to financial pressure
  Some students are forced to leave school early due to financial pressure to support their families.
- as a result
  As a result, formal education can seem irrelevant or unaffordable to many young people.`
      },
      {
        title: '3. Body 2 – Giải pháp (Solutions)',
        content: `Ý chính: Cải cách chương trình học gắn với kỹ năng thực tế/nghề nghiệp, và cung cấp học bổng/hỗ trợ tài chính cho học sinh khó khăn.

Topic sentence:
Several solutions could help re-engage young people with education.

Cấu trúc hay:
- incorporate practical, career-relevant skills into
  Schools could incorporate practical, career-relevant skills into their curricula to make learning more meaningful.
- provide financial support such as
  Governments could provide financial support, such as scholarships, to students facing economic hardship.
- from what I have seen
  From what I have seen, vocational programmes that combine classroom learning with hands-on training keep students far more engaged.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Causes + Solutions" (bỏ học/mất hứng thú học tập)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + giải pháp.
BODY 1: TOÀN BỘ nguyên nhân — nên có 1 ý về CHƯƠNG TRÌNH HỌC và 1 ý về HOÀN CẢNH (tài chính/gia đình).
BODY 2: TOÀN BỘ giải pháp — ứng với từng nguyên nhân.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có 2 nguyên nhân từ 2 góc độ khác nhau (chương trình học vs hoàn cảnh cá nhân) không?
② Giải pháp có ứng với nguyên nhân không?
③ Có ví dụ từ "own knowledge or experience" không?`
      },
    ],
  },

  // ── 28. Digital devices replacing textbooks — advantages/disadvantages ──
  {
    prompt: `Some people believe that schools should replace traditional textbooks with digital devices such as tablets and laptops.

What are the advantages and disadvantages of using digital devices instead of traditional textbooks in education?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages.

Thesis statement:
Replacing textbooks with digital devices offers greater interactivity and convenience, but it also raises concerns about screen time and unequal access to technology.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: Thiết bị số nhẹ hơn, chứa được nhiều tài liệu và có tính tương tác cao hơn sách giáo khoa truyền thống (video, bài tập tương tác).

Topic sentence:
Using digital devices in the classroom offers several advantages over traditional textbooks.

Cấu trúc hay (an toàn cho band 6.5):
- store a vast amount of
  A single tablet can store a vast amount of material, eliminating the need to carry multiple heavy textbooks.
- offer interactive features such as
  Digital devices also offer interactive features, such as videos and quizzes, that make learning more engaging.
- for example
  For example, students can immediately look up unfamiliar terms or watch a demonstration related to their lesson.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Sử dụng thiết bị số nhiều gây hại cho mắt/tập trung, và không phải học sinh nào cũng có điều kiện tiếp cận thiết bị, tạo ra bất bình đẳng trong học tập.

Topic sentence:
However, this shift also brings certain disadvantages.

Cấu trúc hay:
- be detrimental to
  Extended screen time can be detrimental to students' eyesight and ability to concentrate.
- exacerbate inequality between
  Relying on digital devices can also exacerbate inequality between students who can and cannot afford them.
- in my experience
  In my experience, students without reliable access to a device at home often fall behind their classmates in digital-first classrooms.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (thay đổi phương pháp giáo dục)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages + ví dụ.
BODY 2: TOÀN BỘ disadvantages — nên có ý về BẤT BÌNH ĐẲNG TIẾP CẬN, một góc độ quan trọng cho chủ đề công nghệ giáo dục.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có đề cập đến vấn đề BẤT BÌNH ĐẲNG (không phải ai cũng có thiết bị) không — đây là ý hay bị bỏ sót?
② Có ví dụ từ "own knowledge or experience" không?
③ Có tách rõ 2 Body không?`
      },
    ],
  },

  // ── 30. University internships/work placements — advantages/disadvantages ──
  {
    prompt: `In many countries, university students are encouraged to take part in internships or work placements as part of their education.

What are the advantages and disadvantages of requiring students to gain work experience while studying at university?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Advantages and Disadvantages.

Thesis statement:
Requiring students to complete internships gives them valuable practical experience, but it can also place additional strain on their academic workload and free time.`
      },
      {
        title: '2. Body 1 – Advantages (Lợi ích)',
        content: `Ý chính: Thực tập giúp sinh viên áp dụng kiến thức vào thực tế, xây dựng kỹ năng nghề nghiệp và mạng lưới quan hệ (networking) trước khi tốt nghiệp.

Topic sentence:
Requiring students to gain work experience offers clear benefits.

Cấu trúc hay (an toàn cho band 6.5):
- apply theoretical knowledge to real-world settings
  Internships allow students to apply theoretical knowledge to real-world settings, deepening their understanding of their field.
- build a professional network
  Work placements also help students build a professional network, which can lead to job offers after graduation.
- for example
  For example, many companies hire their most capable interns directly into full-time roles.`
      },
      {
        title: '3. Body 2 – Disadvantages (Hạn chế)',
        content: `Ý chính: Vừa học vừa làm gây áp lực lớn về thời gian, có thể ảnh hưởng đến kết quả học tập và sức khỏe tinh thần của sinh viên.

Topic sentence:
However, mandatory work placements can also present challenges.

Cấu trúc hay:
- place a strain on
  Balancing coursework with an internship places a considerable strain on students' time and energy.
- come at the expense of
  This often comes at the expense of their academic performance or personal well-being.
- in my experience
  In my experience, students juggling both an internship and a full course load frequently report high levels of stress.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Advantages and Disadvantages" (chính sách giáo dục bắt buộc)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn cả 2 mặt.
BODY 1: TOÀN BỘ advantages (góc độ nghề nghiệp/kỹ năng) + ví dụ.
BODY 2: TOÀN BỘ disadvantages (góc độ thời gian/sức khỏe) + ví dụ.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có 2 góc nhìn khác nhau rõ ràng (lợi ích nghề nghiệp vs áp lực thời gian) không?
② Có ví dụ từ "own knowledge or experience" không?
③ Có tách rõ 2 Body không?`
      },
    ],
  },

  // ── 31. Students unmotivated studying online — causes + effects ──
  {
    prompt: ' Many students find it difficult to stay motivated when studying online. What are the causes of this problem, and what effects does it have on students?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Causes + Effects (KHÁC Causes + Solutions — đề này hỏi HẬU QUẢ, không hỏi giải pháp).

Thesis statement:
Students often struggle to stay motivated when studying online mainly due to distractions at home and a lack of direct interaction, which can seriously affect their academic performance.`
      },
      {
        title: '2. Body 1 – Nguyên nhân (Causes)',
        content: `Ý chính: (1) Học ở nhà dễ bị xao nhãng bởi các yếu tố khác (điện thoại, gia đình, mạng xã hội), (2) thiếu sự tương tác trực tiếp với giáo viên/bạn học khiến việc học kém sinh động, dễ chán.

Topic sentence:
There are two main reasons why students struggle to stay motivated while studying online.

Cấu trúc hay (an toàn cho band 6.5):
- be surrounded by distractions such as
  Studying at home, students are surrounded by distractions such as smartphones, television, and family members.
- lack the direct interaction of
  Online classes also lack the direct interaction of a physical classroom, making lessons feel less engaging.
- as a result
  As a result, many students find it difficult to maintain focus for an entire online lesson.`
      },
      {
        title: '3. Body 2 – Hậu quả (Effects)',
        content: `Ý chính: Thiếu động lực dẫn đến kết quả học tập giảm sút, và có thể ảnh hưởng tâm lý (cảm giác cô lập, chán nản) khi học sinh không hoàn thành được mục tiêu học tập.

Topic sentence:
This lack of motivation has several negative effects on students.

Cấu trúc hay:
- result in a decline in
  A lack of motivation often results in a decline in academic performance over time.
- take a toll on one's mental well-being
  Struggling to keep up with online coursework can also take a toll on students' mental well-being, causing stress or isolation.
- as a result
  As a result, some students may fall further behind, creating a discouraging cycle that is difficult to break.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Causes + Effects"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu ngắn gọn nguyên nhân + hậu quả.
BODY 1: TOÀN BỘ nguyên nhân (causes).
BODY 2: TOÀN BỘ hậu quả (effects) — KHÔNG phải giải pháp, cần phân biệt rõ với dạng Causes+Solutions.
KẾT BÀI: tóm tắt.

Checklist để đạt 6.5+:
① Có phân biệt đúng "effects" (hậu quả) với "solutions" (giải pháp) không — đây là lỗi hay gặp nhất ở dạng đề này?
② Có 2 nguyên nhân và hệ quả tương ứng rõ ràng không?
③ Có ví dụ/hệ quả cụ thể không?`
      },
    ],
  },
];

async function runSeed() {
  const WritingTask2 = require('../models/WritingTask2');

  const ops = ANALYSIS.map(a => ({
    updateOne: {
      filter: { prompt: a.prompt },
      update: { $set: { analysisSections: a.analysisSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask2.bulkWrite(ops);
  console.log(`[WritingTask2AnalysisExistingSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS.length})`);
  if (result.matchedCount !== ANALYSIS.length) {
    console.warn('[WritingTask2AnalysisExistingSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask2AnalysisExistingSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask2AnalysisExistingSeed] Failed:', err); process.exit(1); });
}
