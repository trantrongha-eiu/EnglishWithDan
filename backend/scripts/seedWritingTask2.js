// Writing Task 2 content seed — merged from 5 separate one-off scripts
// (each already run against the live DB): analysis-sections guidance for
// the 12 topics added in 2026Q3, an analysis pass for pre-existing topics,
// band-sample answers for the 2026Q3 topics, and two rounds of collocation
// vocab merged into existing Task2 vocab lessons. Each keeps its own data
// array and its own seed function exactly as originally written — only the
// shared requires/dotenv/connect-disconnect boilerplate and the final
// runner were consolidated. Run: node backend/scripts/seedWritingTask2.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

/**
 * Seed script – "Phân tích đề" (analysisSections) for the 12 WritingTask2
 * topics added by seedWritingTasks2026Q3.js. Each topic gets guidance for
 * band 6.5+: how to identify the essay type, which stance/argument to
 * pick, and how to split Body 1 / Body 2 — deliberately the SAFEST
 * strategy for each type (full agree/disagree rather than partial
 * agreement, answer-both-questions for two-part prompts), not the more
 * nuanced band-8+ approach.
 *
 * Matches existing WritingTask2 docs by exact `prompt` text — does NOT
 * upsert (no `upsert: true`), so if a prompt doesn't match an existing doc
 * this reports modifiedCount 0 for it instead of silently creating a
 * broken half-populated topic.
 *
 * Run: node backend/scripts/seedWritingTask2Analysis2026Q3.js
 */

const ANALYSIS_2026Q3 = [
  // ── 1. Instant services/info/goods — beneficial or harmful? ──
  {
    prompt: 'Nowadays, more and more people expect things to be done instantly, such as receiving services, obtaining information, or purchasing goods without having to wait. Do you think this is a beneficial or harmful development?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: "Beneficial or harmful development?" — đây là dạng CHỌN 1 PHE (giống agree/disagree), KHÔNG phải discuss both views. Với band 6.5, hãy chọn HẲN 1 phía, đừng viết nửa vời.

Gợi ý chọn phe: "Harmful" thường dễ triển khai hơn cho topic này (dễ tìm ví dụ về mặt tiêu cực của "văn hoá tức thời").

Thesis statement (nêu ngay ở mở bài):
While instant access to services and information offers convenience, I believe this trend is largely harmful because it reduces patience and lowers the quality of decisions.`
      },
      {
        title: '2. Body 1 – Lý do 1: Giảm tính kiên nhẫn (mất khả năng chờ đợi)',
        content: `Ý chính: Khi quen được đáp ứng ngay lập tức, con người dần mất khả năng chịu đựng sự chờ đợi trong các tình huống khác của cuộc sống (công việc, học tập, quan hệ).

Topic sentence:
Firstly, constant instant gratification makes people less patient in other areas of life.

Cấu trúc hay (an toàn cho band 6.5):
- make + O + adjective
  Constant instant gratification makes people less patient.
- for example / for instance
  For example, students who are used to instant answers online often give up quickly when a problem takes longer to solve.
- as a result
  As a result, people struggle with tasks that require time and effort.`
      },
      {
        title: '3. Body 2 – Lý do 2: Quyết định vội vàng, thiếu suy nghĩ',
        content: `Ý chính: Muốn có ngay lập tức khiến người ta không dành thời gian suy nghĩ kỹ, dẫn đến quyết định (mua sắm, chọn thông tin) kém chất lượng.

Topic sentence:
Secondly, the pressure to get things instantly often leads to poor-quality decisions.

Cấu trúc hay:
- lead to + N
  This pressure often leads to poor-quality decisions.
- without + V-ing
  People frequently buy products without carefully comparing prices or reading reviews.
- in the long run
  In the long run, this can result in wasted money and unnecessary regret.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Beneficial or harmful development?"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu thesis (chọn hẳn 1 phía: beneficial HOẶC harmful).
BODY 1: lý do 1 + ví dụ cụ thể.
BODY 2: lý do 2 + ví dụ cụ thể.
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có chọn RÕ RÀNG 1 phía (không lấp lửng "vừa tốt vừa xấu") không?
② Mỗi Body có 1 lý do CHÍNH + ít nhất 1 ví dụ minh hoạ không?
③ Có dùng từ nối rõ ràng (Firstly, Secondly, For example, As a result) không?
④ Kết bài có nhất quán với thesis ở mở bài không (không đổi ý giữa chừng)?`
      },
    ],
  },

  // ── 2. Celebrities' privacy vs media ──
  {
    prompt: 'Many celebrities complain about the way the media publicises their private lives. Some people believe that they should accept this as part of being famous. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Người nổi tiếng nên chấp nhận việc bị soi đời tư như một phần của sự nổi tiếng."

Với band 6.5: chọn HẲN 1 phía (agree hoàn toàn hoặc disagree hoàn toàn), đừng viết "to some extent" — khó triển khai mạch lạc ở band này.

Gợi ý: DISAGREE thường dễ viết hơn (dễ tìm lý do bảo vệ quyền riêng tư).

Thesis statement:
I disagree with this view, as I believe celebrities still have the right to privacy despite their public status.`
      },
      {
        title: '2. Body 1 – Lý do 1: Quyền riêng tư là quyền cơ bản của con người',
        content: `Ý chính: Nổi tiếng không có nghĩa là từ bỏ mọi quyền riêng tư — vẫn cần được bảo vệ trong cuộc sống cá nhân (gia đình, con cái, sức khỏe).

Topic sentence:
Firstly, privacy is a basic human right that should not be lost simply because someone is famous.

Cấu trúc hay:
- have the right to + N
  Everyone, including celebrities, has the right to privacy.
- simply because
  This right should not be lost simply because someone becomes famous.
- especially when it comes to
  This is especially true when it comes to their family members, such as young children, who did not choose to be in the public eye.`
      },
      {
        title: '3. Body 2 – Lý do 2: Xâm phạm đời tư gây hại tâm lý',
        content: `Ý chính: Việc bị theo dõi/đưa tin liên tục gây căng thẳng, ảnh hưởng sức khỏe tinh thần của người nổi tiếng.

Topic sentence:
Secondly, constant media intrusion can seriously damage a celebrity's mental health.

Cấu trúc hay:
- can seriously damage/harm
  Constant intrusion can seriously damage a person's mental health.
- be under pressure to
  Many celebrities are under constant pressure to look and act perfectly in public.
- there have been cases where
  There have been cases where excessive media attention has led to serious stress and anxiety.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (đơn giản, chọn 1 phe)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree hay disagree.
BODY 1: lý do 1 ủng hộ quan điểm đã chọn + ví dụ.
BODY 2: lý do 2 ủng hộ quan điểm đã chọn + ví dụ.
KẾT BÀI: nhắc lại quan điểm, không đổi ý.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG ngay từ câu mở bài không?
② Cả 2 Body có cùng ủng hộ MỘT phía không (không Body 1 khen, Body 2 chê)?
③ Có ví dụ cụ thể (không chỉ nói lý thuyết chung chung) không?`
      },
    ],
  },

  // ── 3. Children: games vs sports — why + beneficial/harmful ──
  {
    prompt: 'Nowadays, many children spend a considerable amount of time playing computer games and less time participating in sports. Why is this the case? Is this a beneficial or harmful trend?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 câu hỏi (Why? + Beneficial or harmful?) — đây là dạng "Two-part question". Với band 6.5, cách AN TOÀN NHẤT là trả lời MỖI câu hỏi ở MỘT Body riêng — không gộp chung.

Cấu trúc: Body 1 = trả lời "Why?", Body 2 = trả lời "Beneficial or harmful?".

Thesis statement:
This essay will explain why children today play more computer games than sports, and will argue that this is a harmful trend.`
      },
      {
        title: '2. Body 1 – Trả lời câu hỏi "Why?" (nguyên nhân)',
        content: `Ý chính: Trò chơi điện tử dễ tiếp cận hơn (điện thoại, ở nhà, không cần bạn chơi cùng), trong khi hoạt động thể thao cần thời gian, không gian, sự chuẩn bị.

Topic sentence:
There are two main reasons why children now prefer computer games to sports.

Cấu trúc hay:
- be more accessible than
  Computer games are far more accessible than sports, as they can be played at home at any time.
- require + N
  Sports require more time, space, and often other people to play with.
- another reason is that
  Another reason is that many parents feel it is safer for children to stay indoors playing games than to play outside.`
      },
      {
        title: '3. Body 2 – Trả lời câu hỏi "Beneficial or harmful?"',
        content: `Ý chính (chọn HARMFUL — dễ triển khai): ảnh hưởng sức khỏe thể chất (ít vận động) và kỹ năng xã hội (ít giao tiếp trực tiếp) so với chơi thể thao.

Topic sentence:
In my opinion, this trend is largely harmful to children's physical and social development.

Cấu trúc hay:
- harmful to + N
  This trend is harmful to children's physical health.
- unlike sports, which...
  Unlike sports, which help children stay physically active, computer games often lead to a sedentary lifestyle.
- miss out on
  Children who spend most of their time gaming also miss out on important social skills gained through team sports.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2 câu hỏi (Why + Opinion)"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu sẽ trả lời cả 2 câu hỏi.
BODY 1: trả lời câu hỏi ĐẦU TIÊN (thường là "Why?").
BODY 2: trả lời câu hỏi THỨ HAI (thường là ý kiến/đánh giá).
KẾT BÀI: tóm tắt cả 2 ý.

Checklist để đạt 6.5+:
① Có trả lời ĐỦ CẢ 2 câu hỏi không (lỗi rất hay gặp: chỉ trả lời 1 câu)?
② Mỗi Body có tập trung vào ĐÚNG 1 câu hỏi, không lẫn lộn không?
③ Body 2 có nêu rõ quan điểm (beneficial/harmful) ngay từ topic sentence không?`
      },
    ],
  },

  // ── 4. Working harder — why + always good? ──
  {
    prompt: 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: 2 câu hỏi (Why? + Is it always good?) — dạng "Two-part question", giống cấu trúc đề trước. Trả lời từng câu ở từng Body riêng.

Thesis statement:
This essay will explain why some people work harder than others, and will argue that working hard is not always beneficial.`
      },
      {
        title: '2. Body 1 – Trả lời câu hỏi "Why do some people work harder?"',
        content: `Ý chính: Động lực cá nhân khác nhau — có người bị thúc đẩy bởi mục tiêu/tham vọng cá nhân, có người bị áp lực bên ngoài (tài chính, gia đình, cạnh tranh).

Topic sentence:
People work harder than others for a variety of personal and external reasons.

Cấu trúc hay:
- be motivated/driven by
  Some individuals are driven by strong personal ambition or a desire to succeed.
- while others...
  While others work hard mainly due to financial pressure or family responsibilities.
- naturally more + adj
  Some people are also naturally more disciplined and hard-working than others.`
      },
      {
        title: '3. Body 2 – Trả lời câu hỏi "Is it always a good thing?" (chọn KHÔNG luôn tốt)',
        content: `Ý chính: Làm việc quá sức có thể gây hại — ảnh hưởng sức khỏe, mất cân bằng cuộc sống, giảm hiệu quả về lâu dài.

Topic sentence:
However, working hard is not always beneficial, as it can lead to serious negative effects if taken to an extreme.

Cấu trúc hay:
- lead to negative effects
  Working excessively hard can lead to serious health problems such as stress and burnout.
- at the expense of
  People who overwork often do so at the expense of their family time and personal well-being.
- in moderation
  Hard work is only beneficial when practised in moderation.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2 câu hỏi (Why + Is it always true?)"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu sẽ trả lời cả 2 câu hỏi.
BODY 1: trả lời "Why?" — nêu 2 nguyên nhân (nên có cả yếu tố cá nhân và yếu tố bên ngoài).
BODY 2: trả lời câu hỏi Yes/No — chọn hẳn "not always" (an toàn hơn "always" vì dễ tìm phản ví dụ).
KẾT BÀI: tóm tắt cả 2 ý.

Checklist để đạt 6.5+:
① Có trả lời ĐỦ CẢ 2 câu hỏi không?
② Với câu hỏi dạng "Is X always true?", có chọn "not always" (dễ viết hơn "always") không?
③ Body 2 có nêu rõ ĐIỀU KIỆN khi nào việc đó KHÔNG tốt (thay vì phủ định hoàn toàn) không?`
      },
    ],
  },

  // ── 5. Fossil fuel reduction — agree/disagree ──
  {
    prompt: 'The international community must take immediate action to ensure that all nations reduce their consumption of fossil fuels, such as gas and oil. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Cộng đồng quốc tế cần hành động ngay để giảm tiêu thụ nhiên liệu hoá thạch."

Với band 6.5: chọn AGREE hoàn toàn — đây là quan điểm dễ triển khai nhất (có nhiều lý do phổ biến, quen thuộc).

Thesis statement:
I completely agree that urgent global action is needed to reduce fossil fuel consumption, mainly because of its environmental and health impacts.`
      },
      {
        title: '2. Body 1 – Lý do 1: Nhiên liệu hoá thạch gây biến đổi khí hậu',
        content: `Ý chính: Đốt nhiên liệu hoá thạch thải ra khí nhà kính, là nguyên nhân chính gây nóng lên toàn cầu, thiên tai ngày càng nghiêm trọng.

Topic sentence:
Firstly, burning fossil fuels is the main cause of climate change, which is already having severe consequences.

Cấu trúc hay:
- be the main cause of
  Burning fossil fuels is the main cause of global warming.
- release + N + into the atmosphere
  Fossil fuels release large amounts of greenhouse gases into the atmosphere.
- lead to + N (thiên tai)
  This has led to more frequent natural disasters such as floods and droughts.`
      },
      {
        title: '3. Body 2 – Lý do 2: Ảnh hưởng đến sức khỏe con người',
        content: `Ý chính: Ô nhiễm không khí từ nhiên liệu hoá thạch gây các bệnh về hô hấp, ảnh hưởng trực tiếp đến sức khỏe cộng đồng, đặc biệt ở đô thị.

Topic sentence:
Secondly, the use of fossil fuels causes serious air pollution, which directly threatens public health.

Cấu trúc hay:
- cause air pollution
  Burning oil and gas causes significant air pollution in major cities.
- be linked to
  This pollution is linked to respiratory diseases such as asthma.
- particularly affect
  Air pollution particularly affects children and the elderly.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (chủ đề môi trường)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do 1 (thường là môi trường/khí hậu).
BODY 2: lý do 2 (thường là sức khỏe/kinh tế).
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG không?
② Với chủ đề môi trường, có nêu được ít nhất 1 hậu quả CỤ THỂ (thiên tai, ô nhiễm, bệnh tật) thay vì nói chung chung "bad for the environment" không?
③ Có phân biệt rõ 2 lý do khác nhau ở Body 1 và Body 2 (không lặp ý) không?`
      },
    ],
  },

  // ── 6. Children learning via TV — agree/disagree ──
  {
    prompt: 'Children can learn effectively by watching television, so they should be encouraged to watch TV both at home and at school. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Trẻ em nên được khuyến khích xem TV ở cả nhà và trường vì có thể học hiệu quả qua đó."

Với band 6.5: chọn DISAGREE thường an toàn hơn (dễ tìm lý do phản đối việc khuyến khích xem TV, đặc biệt ở TRƯỜNG HỌC).

Thesis statement:
I disagree with this view, as I believe encouraging children to watch television, especially at school, does more harm than good.`
      },
      {
        title: '2. Body 1 – Lý do 1: TV không thể thay thế phương pháp học tương tác',
        content: `Ý chính: Xem TV là hoạt động thụ động (passive), thiếu tương tác — kém hiệu quả hơn so với học qua sách vở, thảo luận, thực hành ở trường.

Topic sentence:
Firstly, watching television is a passive activity that cannot replace more interactive methods of learning.

Cấu trúc hay:
- a passive activity
  Watching TV is a passive activity, unlike reading or group discussion.
- cannot replace
  It cannot replace the interactive learning that takes place in a classroom.
- fail to develop
  Children who learn mainly through television may fail to develop critical thinking skills.`
      },
      {
        title: '3. Body 2 – Lý do 2: Xem TV quá nhiều ảnh hưởng sức khỏe và thói quen',
        content: `Ý chính: Dành nhiều thời gian trước màn hình gây hại cho mắt, giảm vận động, và có thể khiến trẻ phụ thuộc vào giải trí thụ động thay vì tự học.

Topic sentence:
Secondly, excessive screen time can negatively affect children's health and study habits.

Cấu trúc hay:
- excessive screen time
  Excessive screen time is known to cause eyesight problems in children.
- become dependent on
  Children may become dependent on television for entertainment rather than developing good study habits.
- discourage + N + from + V-ing
  This could discourage children from engaging in physical activities or reading books.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (chủ đề giáo dục/công nghệ)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do 1 (thường liên quan đến hiệu quả học tập).
BODY 2: lý do 2 (thường liên quan đến sức khỏe/thói quen).
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG không?
② Có phân biệt rõ giữa "xem TV nói chung" và "khuyến khích xem TV Ở TRƯỜNG" — đề bài nhắc đến CẢ 2 nơi không?
③ Có ví dụ/hệ quả cụ thể (không chỉ nói "TV is bad") không?`
      },
    ],
  },

  // ── 7. Education vs leisure spending — agree/disagree ──
  {
    prompt: 'Too much emphasis is placed on education for young people. Some people believe that governments should spend more money on leisure activities for the youth instead. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Chính phủ nên chi nhiều tiền cho hoạt động giải trí của giới trẻ thay vì tập trung quá nhiều vào giáo dục."

Với band 6.5: chọn DISAGREE thường an toàn hơn (giáo dục là chủ đề dễ bảo vệ, có nhiều lý do quen thuộc).

Thesis statement:
I disagree with this view, as I believe education should remain the top priority for government spending on young people.`
      },
      {
        title: '2. Body 1 – Lý do 1: Giáo dục là nền tảng cho tương lai',
        content: `Ý chính: Giáo dục trang bị kiến thức, kỹ năng cần thiết cho công việc và cuộc sống sau này — ảnh hưởng lâu dài hơn nhiều so với giải trí.

Topic sentence:
Firstly, education provides young people with the knowledge and skills they need for their future careers.

Cấu trúc hay:
- provide + O + with + N
  Education provides young people with essential skills for the future.
- have a long-term impact on
  Good education has a long-term impact on a person's career and quality of life.
- unlike leisure activities, which...
  Unlike leisure activities, which offer only short-term enjoyment, education brings lasting benefits.`
      },
      {
        title: '3. Body 2 – Lý do 2: Giải trí không nên bị bỏ hoàn toàn nhưng không thể thay thế giáo dục',
        content: `Ý chính: Thừa nhận giải trí cũng có lợi ích (sức khỏe tinh thần, kỹ năng xã hội), nhưng không thể ưu tiên hơn giáo dục — nên đầu tư CÂN BẰNG, không đảo ngược thứ tự ưu tiên.

Topic sentence:
While leisure activities do offer some benefits, they should not be prioritised over education.

Cấu trúc hay:
- while it is true that
  While it is true that leisure activities help young people relax, this benefit is far smaller than that of education.
- should not be prioritised over
  Leisure activities should not be prioritised over education.
- rather than / instead
  Governments should improve access to both, rather than shifting funding away from schools.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (so sánh 2 lựa chọn chi tiêu)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do chính ủng hộ lựa chọn mình chọn (ở đây: giáo dục).
BODY 2: thừa nhận điểm tốt của lựa chọn còn lại, nhưng giải thích vì sao vẫn không nên ưu tiên hơn.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG không?
② Body 2 có tránh việc phủ nhận HOÀN TOÀN giải trí (nghe thiếu thuyết phục) mà thay vào đó thừa nhận nhưng vẫn giữ vững lập trường không?
③ Có dùng cấu trúc so sánh (unlike, rather than, more... than) không?`
      },
    ],
  },

  // ── 8. Economic growth vs environment — discuss both views ──
  {
    prompt: 'Some people believe that economic growth is essential for eliminating global poverty and hunger, while others argue that it can have harmful effects on the environment. Consider both arguments and present your viewpoint.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss Both Views — phải trình bày CẢ 2 quan điểm (không chỉ chọn 1 phe như agree/disagree), sau đó nêu ý kiến cá nhân.

Quan điểm 1: Tăng trưởng kinh tế cần thiết để xóa đói giảm nghèo.
Quan điểm 2: Tăng trưởng kinh tế gây hại môi trường.

Với band 6.5: nêu ý kiến cá nhân đơn giản ở cuối — có thể nghiêng nhẹ về 1 phía (vd: cả 2 đều đúng, nhưng cần tăng trưởng có kiểm soát).

Thesis statement:
This essay will discuss both the economic benefits and the environmental risks of economic growth, before giving my own opinion.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Tăng trưởng kinh tế giúp xóa đói giảm nghèo',
        content: `Ý chính: Tăng trưởng tạo việc làm, tăng thu nhập, giúp chính phủ có ngân sách đầu tư y tế/giáo dục — giảm nghèo đói.

Topic sentence:
On the one hand, economic growth is widely seen as essential for reducing poverty and hunger.

Cấu trúc hay:
- on the one hand
  On the one hand, economic growth is seen as essential for reducing poverty.
- create job opportunities
  Growth creates job opportunities, which help lift families out of poverty.
- allow governments to
  It also allows governments to invest more in healthcare and education.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Tăng trưởng kinh tế gây hại môi trường + ý kiến cá nhân',
        content: `Ý chính: Tăng trưởng thường đi kèm khai thác tài nguyên, ô nhiễm, phá rừng. Ý kiến cá nhân: cả 2 quan điểm đều có lý, cần tăng trưởng bền vững (sustainable growth).

Topic sentence:
On the other hand, rapid economic growth often comes at a significant cost to the environment.

Cấu trúc hay:
- on the other hand
  On the other hand, rapid growth often comes at a cost to the environment.
- come at the cost of
  This growth often comes at the cost of natural resources and clean air.
- in my opinion / personally
  In my opinion, both views are valid, and governments should aim for growth that is both economically beneficial and environmentally sustainable.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss Both Views"',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu sẽ bàn luận cả 2 quan điểm.
BODY 1: trình bày quan điểm 1 (lý do + ví dụ) — KHÔNG chê quan điểm này.
BODY 2: trình bày quan điểm 2 (lý do + ví dụ) + ý kiến cá nhân ở cuối.
KẾT BÀI: nhắc lại ý kiến cá nhân.

Checklist để đạt 6.5+:
① Có trình bày CẢ 2 quan điểm một cách công bằng không (không thiên vị ngay từ Body 1)?
② Ý kiến cá nhân có xuất hiện RÕ RÀNG (thường ở cuối Body 2 hoặc trong kết bài) không — đây là phần hay bị thiếu?
③ Có dùng cặp từ nối "on the one hand / on the other hand" đúng chỗ không?`
      },
    ],
  },

  // ── 9. Detailed crime reporting — agree/disagree ──
  {
    prompt: 'Some people believe that detailed reporting of crimes in newspapers and on TV can lead to harmful consequences and should therefore be limited. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Đưa tin chi tiết về tội phạm gây hại và nên bị hạn chế."

Với band 6.5: chọn AGREE thường dễ triển khai hơn (có nhiều lý do quen thuộc về tác hại của tin tức bạo lực chi tiết).

Thesis statement:
I agree that detailed crime reporting can have harmful effects and should be limited, mainly because it can cause public fear and even encourage copycat crimes.`
      },
      {
        title: '2. Body 1 – Lý do 1: Gây hoang mang, sợ hãi trong công chúng',
        content: `Ý chính: Tin tức chi tiết, giật gân về tội phạm khiến người xem cảm thấy bất an, cho rằng xã hội nguy hiểm hơn thực tế.

Topic sentence:
Firstly, detailed crime reports can create unnecessary fear and anxiety among the public.

Cấu trúc hay:
- create fear/anxiety
  Detailed crime reports can create unnecessary fear among viewers.
- give people the impression that
  This can give people the impression that crime rates are higher than they actually are.
- feel unsafe
  As a result, many people feel unsafe even in areas with low crime rates.`
      },
      {
        title: '3. Body 2 – Lý do 2: Có thể khuyến khích hành vi bắt chước (copycat crime)',
        content: `Ý chính: Mô tả quá chi tiết cách thức phạm tội có thể vô tình trở thành "hướng dẫn" cho những đối tượng có ý định xấu.

Topic sentence:
Secondly, overly detailed reporting can unintentionally encourage copycat crimes.

Cấu trúc hay:
- unintentionally encourage
  Detailed descriptions can unintentionally encourage similar crimes.
- provide + O + with information on how to
  Some reports even provide viewers with information on how a crime was carried out.
- there is evidence that
  There is evidence that highly publicised crimes are sometimes copied by other offenders.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (chủ đề truyền thông)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do 1 (ảnh hưởng đến cảm nhận/tâm lý công chúng).
BODY 2: lý do 2 (hệ quả xã hội cụ thể hơn, vd copycat crime).
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG không?
② Có phân biệt "đưa tin tội phạm" (bình thường) và "đưa tin CHI TIẾT" (vấn đề của đề bài) không — đây là từ khóa quan trọng?
③ Có ví dụ/hệ quả cụ thể thay vì chỉ nói "it is bad" không?`
      },
    ],
  },

  // ── 10. Celebrities famous for glamour/wealth — agree/disagree ──
  {
    prompt: 'Nowadays, many celebrities are famous for their glamour and wealth rather than their achievements, which may set a negative example for young people. To what extent do you agree or disagree with this belief?',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Agree or Disagree — "Người nổi tiếng vì vẻ ngoài/tiền bạc hơn là thành tựu, gây ảnh hưởng xấu đến giới trẻ."

Với band 6.5: chọn AGREE thường dễ triển khai hơn (chủ đề quen thuộc, dễ tìm ví dụ).

Thesis statement:
I agree that many celebrities today are famous mainly for their wealth and image rather than genuine achievements, and that this can negatively influence young people.`
      },
      {
        title: '2. Body 1 – Lý do 1: Giới trẻ hình thành giá trị sai lệch (coi trọng vẻ ngoài hơn nỗ lực)',
        content: `Ý chính: Khi thần tượng những người nổi tiếng chỉ vì giàu có/ngoại hình, giới trẻ có thể nghĩ rằng thành công không cần nỗ lực, học tập.

Topic sentence:
Firstly, this trend can lead young people to develop unrealistic and unhealthy values about success.

Cấu trúc hay:
- lead + O + to + V
  This trend can lead young people to believe that success does not require hard work.
- rather than
  They may admire wealth and image rather than genuine talent or effort.
- look up to
  Many teenagers look up to these celebrities as role models.`
      },
      {
        title: '3. Body 2 – Lý do 2: Ảnh hưởng đến mục tiêu, định hướng nghề nghiệp của giới trẻ',
        content: `Ý chính: Giới trẻ có thể chạy theo hình ảnh (mạng xã hội, ngoại hình) thay vì phát triển kỹ năng thực sự, ảnh hưởng đến định hướng học tập/nghề nghiệp.

Topic sentence:
Secondly, this can negatively affect young people's career aspirations and priorities.

Cấu trúc hay:
- negatively affect
  This trend can negatively affect young people's career choices.
- prioritise A over B
  Some teenagers prioritise their online image over their studies.
- as a consequence
  As a consequence, they may neglect the skills and effort needed for real long-term success.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Agree/Disagree" (chủ đề giới trẻ/mạng xã hội)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu rõ agree/disagree.
BODY 1: lý do 1 (ảnh hưởng đến GIÁ TRỊ/nhận thức của giới trẻ).
BODY 2: lý do 2 (ảnh hưởng đến HÀNH ĐỘNG/lựa chọn thực tế của giới trẻ).
KẾT BÀI: nhắc lại quan điểm.

Checklist để đạt 6.5+:
① Có agree/disagree RÕ RÀNG không?
② Cả 2 Body có tập trung vào ẢNH HƯỞNG ĐẾN GIỚI TRẺ (đúng trọng tâm đề bài) chứ không lạc sang chê người nổi tiếng nói chung không?
③ Có ví dụ cụ thể (mạng xã hội, thần tượng...) không?`
      },
    ],
  },

  // ── 11. Using animals for human benefit — discuss both views ──
  {
    prompt: 'Some people believe that it is acceptable to use animals in any way that benefits humans, while others argue that this is morally wrong. Consider both arguments and present your viewpoint.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss Both Views — trình bày CẢ 2 quan điểm rồi nêu ý kiến cá nhân.

Quan điểm 1: Được phép sử dụng động vật theo bất kỳ cách nào có lợi cho con người.
Quan điểm 2: Điều đó là sai về mặt đạo đức.

Với band 6.5: nêu ý kiến cá nhân đơn giản — có thể nghiêng nhẹ về việc CẦN CÓ GIỚI HẠN (không hoàn toàn cấm, không hoàn toàn tự do).

Thesis statement:
This essay will examine both viewpoints before concluding that the use of animals should be allowed, but only within reasonable limits.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Sử dụng động vật mang lại lợi ích lớn cho con người',
        content: `Ý chính: Động vật được dùng trong nghiên cứu y học (thử thuốc, vắc-xin), thực phẩm, lao động — mang lại lợi ích thiết thực cho con người.

Topic sentence:
On the one hand, many people argue that using animals is justified because of the significant benefits it brings to humans.

Cấu trúc hay:
- be justified because
  Using animals is justified because of its medical benefits.
- play a vital role in
  Animal testing has played a vital role in developing life-saving medicines and vaccines.
- rely on + N
  Humans also rely on animals for food and labour in many parts of the world.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Gây đau đớn/bất công cho động vật + ý kiến cá nhân',
        content: `Ý chính: Nhiều hoạt động (thử nghiệm mỹ phẩm, giải trí) gây đau đớn không cần thiết cho động vật, không phải lúc nào cũng thực sự cần thiết. Ý kiến cá nhân: chỉ nên cho phép khi thực sự cần thiết (y học), không nên cho phép khi không cần thiết (giải trí, mỹ phẩm).

Topic sentence:
On the other hand, others believe this view is morally wrong because it causes unnecessary suffering to animals.

Cấu trúc hay:
- cause unnecessary suffering
  Some practices, such as cosmetic testing, cause unnecessary suffering to animals.
- not always necessary
  Unlike medical research, this kind of use is not always necessary.
- in my view / personally
  In my view, using animals should only be allowed when it is truly necessary, such as in medical research, but not for purposes like entertainment.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss Both Views" (chủ đề đạo đức)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu sẽ bàn luận cả 2 quan điểm.
BODY 1: trình bày quan điểm 1 (lý do + ví dụ) — KHÔNG chê quan điểm này.
BODY 2: trình bày quan điểm 2 (lý do + ví dụ) + ý kiến cá nhân ở cuối.
KẾT BÀI: nhắc lại ý kiến cá nhân.

Checklist để đạt 6.5+:
① Có trình bày CẢ 2 quan điểm công bằng, không thiên vị ngay từ đầu không?
② Ý kiến cá nhân có đưa ra được TIÊU CHÍ rõ ràng (khi nào nên/không nên) thay vì chỉ nói "cần cân bằng" chung chung không?
③ Có ví dụ cụ thể (y học, mỹ phẩm, thực phẩm...) không?`
      },
    ],
  },

  // ── 12. Imported vs domestic films/TV — discuss both views ──
  {
    prompt: "Some people believe that showing imported films and TV programmes is beneficial for a country's culture, while others argue that countries should produce their own films and television programmes. Consider both arguments and present your viewpoint.",
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Dạng bài: Discuss Both Views — trình bày CẢ 2 quan điểm rồi nêu ý kiến cá nhân.

Quan điểm 1: Phim/TV nhập khẩu có lợi cho văn hóa.
Quan điểm 2: Các nước nên tự sản xuất phim/TV của riêng mình.

Với band 6.5: ý kiến cá nhân đơn giản — nên có sự CÂN BẰNG giữa 2 (vừa xem phim nước ngoài, vừa phát triển phim nội địa).

Thesis statement:
This essay will discuss both the benefits of imported films and the importance of producing local content, before giving my own opinion.`
      },
      {
        title: '2. Body 1 – Quan điểm 1: Phim nhập khẩu có lợi cho văn hóa',
        content: `Ý chính: Xem phim nước ngoài giúp người dân hiểu biết về các nền văn hóa khác, học ngôn ngữ, mở rộng tầm nhìn.

Topic sentence:
On the one hand, imported films and television programmes can broaden people's cultural understanding.

Cấu trúc hay:
- broaden + O + understanding
  Imported films can broaden people's understanding of other cultures.
- be exposed to
  Viewers are exposed to different languages, traditions, and ways of life.
- help + O + learn
  Watching foreign films can also help people learn a new language more naturally.`
      },
      {
        title: '3. Body 2 – Quan điểm 2: Cần sản xuất phim nội địa để bảo tồn văn hóa + ý kiến cá nhân',
        content: `Ý chính: Nếu chỉ xem phim nước ngoài, văn hóa, ngôn ngữ, câu chuyện bản địa có thể dần bị lãng quên, mai một. Ý kiến cá nhân: nên có sự cân bằng — vừa nhập khẩu vừa đầu tư sản xuất nội địa.

Topic sentence:
On the other hand, relying too heavily on imported content may weaken a country's own cultural identity.

Cấu trúc hay:
- rely too heavily on
  Relying too heavily on imported content may weaken local culture.
- risk + V-ing
  Countries risk losing touch with their own traditions and stories.
- strike a balance
  In my opinion, countries should strike a balance by importing foreign content while also investing in their own film industry.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "Discuss Both Views" (chủ đề văn hóa/truyền thông)',
        content: `Mỗi đề dạng này chỉ cần làm:
MỞ BÀI: paraphrase đề + nêu sẽ bàn luận cả 2 quan điểm.
BODY 1: trình bày quan điểm 1 (lý do + ví dụ) — KHÔNG chê quan điểm này.
BODY 2: trình bày quan điểm 2 (lý do + ví dụ) + ý kiến cá nhân ở cuối.
KẾT BÀI: nhắc lại ý kiến cá nhân.

Checklist để đạt 6.5+:
① Có trình bày CẢ 2 quan điểm công bằng không?
② Ý kiến cá nhân có đưa ra giải pháp CỤ THỂ (strike a balance) thay vì chỉ lặp lại 1 trong 2 quan điểm không?
③ Có dùng cặp từ nối "on the one hand / on the other hand" đúng chỗ không?`
      },
    ],
  },
];

async function runSeedAnalysis2026Q3() {
  const WritingTask2 = require('../models/WritingTask2');

  const ops = ANALYSIS_2026Q3.map(a => ({
    updateOne: {
      filter: { prompt: a.prompt },
      update: { $set: { analysisSections: a.analysisSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask2.bulkWrite(ops);
  console.log(`[WritingTask2AnalysisSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS_2026Q3.length})`);
  if (result.matchedCount !== ANALYSIS_2026Q3.length) {
    console.warn('[WritingTask2AnalysisSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}


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

const ANALYSIS_EXISTING = [
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

async function runSeedAnalysisExisting() {
  const WritingTask2 = require('../models/WritingTask2');

  const ops = ANALYSIS_EXISTING.map(a => ({
    updateOne: {
      filter: { prompt: a.prompt },
      update: { $set: { analysisSections: a.analysisSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask2.bulkWrite(ops);
  console.log(`[WritingTask2AnalysisExistingSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS_EXISTING.length})`);
  if (result.matchedCount !== ANALYSIS_EXISTING.length) {
    console.warn('[WritingTask2AnalysisExistingSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}


/**
 * Seed script – band 7+ sample essays (sampleSections) for the 12
 * WritingTask2 topics added by seedWritingTasks2026Q3.js. Written
 * originally (not copied from an external source) following the exact
 * stance/argument structure already laid out in each topic's
 * analysisSections — the site presents these as "Bài mẫu từ Daniel", so
 * content needs to be original rather than scraped from a third-party site.
 *
 * Same 4-section convention as the site's existing WritingTask2 samples:
 * Introduction / Body 1 / Body 2 / Conclusion.
 *
 * Matches existing docs by exact `prompt` text — does NOT upsert.
 *
 * Run: node backend/scripts/seedWritingTask2Samples2026Q3.js
 */

const SAMPLES_2026Q3_T2 = [
  {
    prompt: 'Nowadays, more and more people expect things to be done instantly, such as receiving services, obtaining information, or purchasing goods without having to wait. Do you think this is a beneficial or harmful development?',
    sampleSections: [
      { title: 'Introduction', content: 'In today’s fast-paced world, an increasing number of people expect to receive services, information, and goods without delay. While this trend undoubtedly offers convenience, I believe it is largely a harmful development because it diminishes patience and encourages poor decision-making.' },
      { title: 'Body 1', content: 'One of the main drawbacks of this culture of instant gratification is that it makes people increasingly impatient in other areas of their lives. When individuals become accustomed to having their needs met immediately, they gradually lose the ability to tolerate delay or difficulty in situations that require time and effort. For example, students who are used to finding instant answers online often abandon academic tasks that demand sustained concentration, simply because they are unwilling to persevere. This growing impatience can have far-reaching consequences, affecting not only academic performance but also personal relationships and professional development, both of which require patience to succeed.' },
      { title: 'Body 2', content: 'A further problem is that the pressure to obtain things instantly often results in poorly considered decisions. Without adequate time to reflect, people are more likely to make impulsive choices that they later regret. This is particularly evident in online shopping, where consumers frequently purchase items without comparing prices or reading reviews, driven by the desire for immediate satisfaction. Over time, such impulsive behaviour can lead to unnecessary financial waste and a general decline in the quality of the decisions people make.' },
      { title: 'Conclusion', content: 'In conclusion, although the expectation of instant services may seem like a positive feature of modern life, its long-term effects on patience and decision-making suggest that it is, on balance, a harmful trend that societies should be cautious of.' },
    ],
  },
  {
    prompt: 'Many celebrities complain about the way the media publicises their private lives. Some people believe that they should accept this as part of being famous. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'It is often argued that celebrities, by virtue of their fame, should simply accept extensive media coverage of their private lives. However, I disagree with this view, as I believe that fame does not strip individuals of their fundamental right to privacy, and that constant media intrusion can cause genuine harm.' },
      { title: 'Body 1', content: 'Firstly, privacy is a basic human right that should not be forfeited merely because a person becomes well-known. While celebrities may accept a certain level of public interest in their professional achievements, this does not mean that every aspect of their personal lives, including their families, health, and relationships, should be open to public scrutiny. This is especially true for the children of celebrities, who did not choose to be in the public eye and yet are frequently subjected to intense media attention through no fault of their own.' },
      { title: 'Body 2', content: "Secondly, constant media intrusion can have a severe impact on a celebrity's mental health. Being followed, photographed, and written about on a daily basis creates immense psychological pressure, leaving many public figures under constant stress to appear flawless. There have been numerous documented cases in which relentless media attention has contributed to serious anxiety and even depression among well-known individuals. Such consequences demonstrate that the assumption that fame justifies any level of intrusion is both unfair and potentially damaging." },
      { title: 'Conclusion', content: "In conclusion, I firmly disagree with the notion that celebrities should simply accept invasive media coverage as an unavoidable part of fame. Protecting their privacy, and that of their families, is essential not only as a matter of basic rights but also for their overall psychological well-being." },
    ],
  },
  {
    prompt: 'Nowadays, many children spend a considerable amount of time playing computer games and less time participating in sports. Why is this the case? Is this a beneficial or harmful trend?',
    sampleSections: [
      { title: 'Introduction', content: "It has become increasingly common for children to spend more time playing computer games than participating in sports. This essay will explore the reasons behind this shift before arguing that, on balance, it represents a harmful trend for young people's development." },
      { title: 'Body 1', content: 'There are two main reasons why computer games have become more popular among children than sports. Firstly, video games are far more accessible than sports, as they can be played at home at any time without requiring specific equipment, weather conditions, or other participants. In contrast, sports usually demand dedicated time, appropriate facilities, and often teammates, all of which can be difficult to arrange in busy modern households. Secondly, many parents perceive gaming as a safer alternative to outdoor sports, preferring their children to remain indoors under supervision rather than face potential risks associated with outdoor play.' },
      { title: 'Body 2', content: "Despite these understandable reasons, I believe this trend is ultimately harmful to children's overall development. Physically, excessive gaming contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems, whereas sports naturally promote regular exercise and physical fitness. Just as importantly, sports provide valuable opportunities for developing social skills, teamwork, and resilience through direct interaction with peers, benefits that solitary gaming cannot easily replicate. Children who spend the majority of their free time gaming therefore risk missing out on crucial aspects of both their physical and social development." },
      { title: 'Conclusion', content: 'In conclusion, while the convenience and perceived safety of computer games explain their growing popularity among children, the resulting decline in physical activity and social interaction makes this a concerning and largely harmful trend.' },
    ],
  },
  {
    prompt: 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?',
    sampleSections: [
      { title: 'Introduction', content: 'In both education and employment, it is evident that some individuals consistently work harder than others. This essay will examine the reasons behind this difference before arguing that working hard, while often admirable, is not always beneficial.' },
      { title: 'Body 1', content: 'People work harder than others for a variety of personal and external reasons. Some individuals are driven by strong personal ambition, a clear sense of purpose, or a genuine passion for what they do, all of which naturally motivate them to invest greater effort. Others, however, work hard primarily due to external pressures, such as financial necessity or family responsibilities, rather than any inherent desire to excel. In addition, personality traits play a role, as some people are simply more naturally disciplined and conscientious than others, regardless of their circumstances.' },
      { title: 'Body 2', content: 'However, I do not believe that working hard is always a positive thing. When taken to an extreme, excessive hard work can lead to serious negative consequences, including burnout, chronic stress, and long-term health problems. Individuals who consistently prioritise work above all else often do so at the expense of their family relationships, personal well-being, and overall quality of life. Furthermore, working excessively hard does not always translate into better outcomes; beyond a certain point, productivity and creativity can actually decline due to fatigue and lack of rest. Hard work is only truly beneficial, therefore, when it is balanced with adequate time for rest and personal life.' },
      { title: 'Conclusion', content: 'In conclusion, while there are understandable reasons why some people work harder than others, it is important to recognise that hard work is not inherently good in all circumstances, and that moderation remains essential for long-term success and well-being.' },
    ],
  },
  {
    prompt: 'The international community must take immediate action to ensure that all nations reduce their consumption of fossil fuels, such as gas and oil. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Many people believe that the international community must act immediately to reduce the consumption of fossil fuels such as oil and gas. I strongly agree with this view, primarily because of the severe environmental and health consequences associated with continued reliance on these energy sources.' },
      { title: 'Body 1', content: 'The most pressing reason for urgent action is the role fossil fuels play in accelerating climate change. Burning oil, coal, and gas releases vast quantities of greenhouse gases into the atmosphere, which is widely recognised as the primary driver of global warming. The consequences of this are already visible around the world, in the form of more frequent and severe natural disasters, including floods, droughts, and extreme storms. If nations continue to delay meaningful action, these environmental effects are likely to become increasingly irreversible, making immediate reductions in fossil fuel consumption essential.' },
      { title: 'Body 2', content: 'A second compelling reason concerns the direct impact of fossil fuels on human health. The burning of oil and gas is a major contributor to air pollution, particularly in densely populated urban areas, where emissions from vehicles and factories accumulate. Exposure to this polluted air has been strongly linked to a range of respiratory illnesses, such as asthma and bronchitis, with children and elderly people being especially vulnerable. Reducing fossil fuel consumption would therefore not only benefit the environment but also lead to significant improvements in public health outcomes worldwide.' },
      { title: 'Conclusion', content: 'In conclusion, given the undeniable environmental damage and serious health risks associated with fossil fuels, I firmly believe that the global community must take swift and decisive action to reduce their consumption before the consequences become even more severe.' },
    ],
  },
  {
    prompt: 'Children can learn effectively by watching television, so they should be encouraged to watch TV both at home and at school. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people argue that because children can learn effectively by watching television, they should be actively encouraged to do so both at home and in school. I disagree with this view, believing that such encouragement, particularly within the school environment, would ultimately do more harm than good.' },
      { title: 'Body 1', content: "Firstly, watching television is fundamentally a passive activity, and as such, it cannot adequately replace the more interactive methods of learning that schools are designed to provide. Effective education typically relies on discussion, collaboration, and hands-on practice, all of which actively engage children's critical thinking skills. Television, by contrast, requires little active participation from viewers, meaning that children who rely heavily on it as a learning tool may fail to develop the analytical and problem-solving abilities that more interactive approaches naturally foster." },
      { title: 'Body 2', content: "Secondly, encouraging excessive television use carries genuine risks to children's health and study habits. Prolonged periods spent in front of a screen are commonly associated with eyesight problems and reduced physical activity, both of which can negatively affect a child's overall development. Moreover, children who become accustomed to television as their primary source of entertainment and information may grow increasingly dependent on it, at the expense of developing independent study habits such as reading and self-directed research, skills that are crucial for long-term academic success." },
      { title: 'Conclusion', content: "In conclusion, although television can occasionally serve as a useful supplementary resource, I firmly disagree that children should be actively encouraged to watch it at home and school. The passive nature of television, combined with its potential health and developmental drawbacks, means that more interactive and engaging teaching methods should remain the priority in children's education." },
    ],
  },
  {
    prompt: 'Too much emphasis is placed on education for young people. Some people believe that governments should spend more money on leisure activities for the youth instead. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people believe that too much importance is placed on educating young people, and that governments should instead direct more funding towards leisure activities for youth. I disagree with this view, as I believe education should remain the primary focus of government spending on young people.' },
      { title: 'Body 1', content: "The most compelling reason to prioritise education is that it provides young people with the knowledge and skills essential for their future careers and overall quality of life. A strong education system equips individuals with the ability to secure stable employment, contribute meaningfully to society, and adapt to an increasingly competitive job market. These benefits have a long-term impact that extends well beyond childhood, shaping an individual's entire future, whereas the enjoyment gained from leisure activities, though valuable, tends to be far more short-lived by comparison." },
      { title: 'Body 2', content: 'That said, I do not believe leisure activities should be dismissed entirely, as they undoubtedly offer genuine benefits, including opportunities for relaxation, social interaction, and the development of important life skills such as teamwork. However, these benefits are considerably smaller in scale than those provided by a solid education, and therefore should not be prioritised above it. Rather than shifting funding away from schools, governments would be better advised to seek ways of improving access to both education and leisure activities simultaneously, ensuring that young people benefit from a well-rounded upbringing without compromising their academic development.' },
      { title: 'Conclusion', content: "In conclusion, while leisure activities certainly play a valuable role in young people's lives, I firmly believe that education must remain the top priority for government spending, given its far greater and more lasting impact on their future prospects." },
    ],
  },
  {
    prompt: 'Some people believe that economic growth is essential for eliminating global poverty and hunger, while others argue that it can have harmful effects on the environment. Consider both arguments and present your viewpoint.',
    sampleSections: [
      { title: 'Introduction', content: 'There is ongoing debate as to whether economic growth is essential for reducing global poverty and hunger, or whether it primarily causes harm to the environment. This essay will discuss both perspectives before presenting my own view that, while growth is important, it must be pursued sustainably.' },
      { title: 'Body 1', content: 'On the one hand, many people argue that economic growth plays an indispensable role in alleviating poverty and hunger around the world. As economies expand, new job opportunities are created, providing individuals and families with the income needed to escape poverty and improve their standard of living. Furthermore, economic growth generates greater tax revenue for governments, enabling them to invest more heavily in essential public services such as healthcare, education, and food security programmes, all of which are crucial in the fight against hunger and deprivation.' },
      { title: 'Body 2', content: 'On the other hand, it is equally true that rapid economic growth often comes at a significant environmental cost. The industrial activity that drives growth typically involves the extensive consumption of natural resources, widespread deforestation, and substantial carbon emissions, all of which contribute to environmental degradation and climate change. In my opinion, both viewpoints hold considerable merit, and the most sensible approach is not to choose between economic growth and environmental protection, but to pursue growth that is genuinely sustainable, with governments actively promoting renewable energy and responsible resource management.' },
      { title: 'Conclusion', content: 'In conclusion, although economic growth remains vital for tackling poverty and hunger, it must be carefully balanced with environmental responsibility in order to be truly beneficial in the long run.' },
    ],
  },
  {
    prompt: 'Some people believe that detailed reporting of crimes in newspapers and on TV can lead to harmful consequences and should therefore be limited. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people believe that the detailed reporting of crimes in newspapers and on television can have harmful consequences and should therefore be restricted. I agree with this view, primarily because such reporting can generate unnecessary public fear and, in some cases, even inspire further criminal behaviour.' },
      { title: 'Body 1', content: "Firstly, detailed and sensationalised crime reports often create a disproportionate sense of fear and anxiety among the general public. When crimes are reported with excessive detail and dramatic emphasis, viewers can develop a distorted impression that crime rates are far higher than they actually are, even in areas where crime remains relatively rare. This heightened, and often unfounded, sense of danger can significantly affect people's daily lives, making them feel unsafe in their own communities and unnecessarily altering their behaviour out of fear." },
      { title: 'Body 2', content: 'Secondly, and perhaps more seriously, overly detailed reporting can unintentionally provide a blueprint for future crimes. When media coverage describes precisely how a crime was carried out, including the specific methods used, it risks equipping individuals with dangerous ideas or techniques they might not otherwise have considered. There is credible evidence to suggest that highly publicised crimes are sometimes replicated by other offenders, a phenomenon commonly referred to as copycat crime, which represents a genuinely harmful and largely avoidable consequence of excessive media detail.' },
      { title: 'Conclusion', content: 'In conclusion, given the potential for detailed crime reporting to spread unwarranted fear and inadvertently encourage further offences, I firmly agree that such reporting should be limited. News organisations have a responsibility to inform the public without causing unnecessary alarm or providing a template for criminal behaviour.' },
    ],
  },
  {
    prompt: 'Nowadays, many celebrities are famous for their glamour and wealth rather than their achievements, which may set a negative example for young people. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'It has become increasingly common for celebrities to achieve fame primarily through their wealth and glamorous lifestyles rather than genuine accomplishments, a trend that many believe sets a poor example for young people. I agree with this view, as I believe it can distort the values and priorities of impressionable young audiences.' },
      { title: 'Body 1', content: 'Firstly, this trend risks encouraging young people to develop unrealistic and ultimately unhealthy attitudes towards success. When teenagers repeatedly see individuals celebrated for their appearance or material wealth rather than their skills, effort, or achievements, they may begin to believe that success can be attained without genuine hard work or dedication. Many young people look up to these celebrities as role models, and admiring wealth and image over talent or perseverance can lead to a fundamentally distorted understanding of what real success actually requires.' },
      { title: 'Body 2', content: "Secondly, this phenomenon can negatively influence the career aspirations and daily priorities of young people. Increasingly, teenagers focus their energy on cultivating an appealing online image, often through social media, rather than on developing practical skills or academic knowledge that would genuinely benefit their futures. As a consequence, some may neglect their education or the meaningful effort required to build a genuinely successful and sustainable career, instead chasing the fleeting, and often unattainable, glamour associated with modern celebrity culture." },
      { title: 'Conclusion', content: 'In conclusion, I firmly agree that celebrities who are famous primarily for their wealth and glamour, rather than their genuine achievements, can set a damaging example for young people, potentially shaping both their values and their long-term aspirations in an unhealthy direction.' },
    ],
  },
  {
    prompt: 'Some people believe that it is acceptable to use animals in any way that benefits humans, while others argue that this is morally wrong. Consider both arguments and present your viewpoint.',
    sampleSections: [
      { title: 'Introduction', content: 'There is ongoing debate over whether it is acceptable to use animals in any way that benefits humans, or whether doing so is fundamentally morally wrong. This essay will explore both sides of this argument before concluding that the use of animals should be permitted, but only within carefully defined limits.' },
      { title: 'Body 1', content: 'On the one hand, many people argue that the use of animals is justified given the substantial benefits it provides to humanity. Perhaps most significantly, animal testing has played a vital role in the development of numerous life-saving medicines and vaccines, contributing enormously to advances in modern medicine that have saved countless human lives. Beyond medical research, humans have also long relied on animals for food, labour, and companionship, particularly in agricultural communities where such practices remain economically essential.' },
      { title: 'Body 2', content: 'On the other hand, opponents contend that many uses of animals are morally indefensible, as they inflict unnecessary suffering without providing any genuinely essential benefit. Practices such as testing cosmetics on animals, for example, are widely regarded as ethically questionable, since alternative testing methods are increasingly available. In my view, the use of animals should be permitted only when it serves a genuinely essential purpose, such as medical research that could save human lives, but not for purposes that are merely convenient or profitable, such as cosmetic testing or entertainment.' },
      { title: 'Conclusion', content: 'In conclusion, although using animals for human benefit remains a contentious issue, distinguishing between essential and non-essential uses offers a reasonable and ethically sound path forward.' },
    ],
  },
  {
    prompt: "Some people believe that showing imported films and TV programmes is beneficial for a country's culture, while others argue that countries should produce their own films and television programmes. Consider both arguments and present your viewpoint.",
    sampleSections: [
      { title: 'Introduction', content: "Some people argue that importing foreign films and television programmes benefits a country's culture, while others believe that nations should focus on producing their own domestic content. This essay will consider both perspectives before presenting my own opinion that a balanced approach is most beneficial." },
      { title: 'Body 1', content: 'On the one hand, imported films and television programmes can significantly broaden audiences’ cultural understanding and awareness. By watching content from other countries, viewers are exposed to different languages, traditions, and ways of life that they might otherwise never encounter, fostering greater cross-cultural appreciation and tolerance. Additionally, watching foreign-language content can be an effective and enjoyable way for people to improve their language skills, as they naturally absorb vocabulary and pronunciation through repeated exposure.' },
      { title: 'Body 2', content: "On the other hand, an overreliance on imported content poses a genuine risk to a country's own cultural identity. If domestic audiences consistently consume foreign films and programmes rather than local productions, national stories, traditions, and even languages may gradually be overshadowed or forgotten, particularly among younger generations. In my opinion, the most effective solution lies in striking a careful balance: countries should continue to welcome imported content for the cultural exposure it provides, while simultaneously investing in and promoting their own domestic film industries." },
      { title: 'Conclusion', content: 'In conclusion, while imported entertainment offers valuable cultural benefits, nations must not neglect their own creative industries, as maintaining this balance is essential for preserving cultural identity in an increasingly globalised world.' },
    ],
  },
];

async function runSeedSamples2026Q3() {
  const WritingTask2 = require('../models/WritingTask2');

  const ops = SAMPLES_2026Q3_T2.map(s => ({
    updateOne: {
      filter: { prompt: s.prompt },
      update: { $set: { sampleSections: s.sampleSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask2.bulkWrite(ops);
  console.log(`[WritingTask2SamplesSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${SAMPLES_2026Q3_T2.length})`);
  if (result.matchedCount !== SAMPLES_2026Q3_T2.length) {
    console.warn('[WritingTask2SamplesSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}


/**
 * Merges additional Part-2/topic vocabulary (student-provided word lists,
 * 2026-08-19) into the 5 existing "Task 2 - X (Collocations)" lessons
 * created earlier the same day (Education/Technology/Environment/Health/
 * Work). Word/meaning/example were given verbatim by the user; this script
 * adds a dictionary-style English `definition` per word (the one field the
 * quiz engine's Study view + fill-blank question type actually reads —
 * see dashboard-lesson.js). Deliberately no `collocations`/`distractors`
 * per entry: dashboard-lesson.js's pickDistractorWords/pickDistractorMeanings
 * already fall back to pulling other words from the SAME lesson when a
 * word's own distractors array is empty, and each of these 5 lessons
 * already has 19-20 sibling words, so MCQ generation works fine without it.
 *
 * Additive only: skips any word that already exists in the target lesson
 * (case-insensitive exact match on word text) — safe to re-run.
 *
 * Run: node backend/scripts/seedWritingTask2VocabMerge.js
 */

const TOPICS_VM1 = [
  {
    lessonTitle: 'Task 2 - Education (Collocations)',
    words: [
      ['access to education', 'cơ hội tiếp cận giáo dục', "Everyone should have equal access to education.", 'The opportunity or right to receive schooling and instruction.'],
      ['quality education', 'giáo dục chất lượng', 'Governments should provide quality education for all children.', 'Teaching and learning of a high standard that genuinely benefits students.'],
      ['higher education', 'giáo dục đại học', "Higher education can improve people's career prospects.", 'Education at university or college level, beyond secondary school.'],
      ['academic performance', 'kết quả học tập', "Technology can have a positive effect on students' academic performance.", "A student's level of achievement in schoolwork and exams."],
      ['educational institutions', 'các cơ sở giáo dục', 'Educational institutions should adapt to modern technology.', 'Organisations such as schools, colleges, and universities that provide education.'],
      ['school curriculum', 'chương trình học', 'The school curriculum should include practical skills.', 'The full range of subjects and content taught in a school.'],
      ['academic pressure', 'áp lực học tập', "Excessive academic pressure can affect students' mental health.", 'The stress students feel from the demands of schoolwork and exams.'],
      ['tuition fees', 'học phí', 'High tuition fees may prevent poor students from attending university.', 'The money charged by a school or university for teaching.'],
      ['equal opportunities', 'cơ hội bình đẳng', 'Schools should provide equal opportunities for students.', 'The same chances and access given to everyone, regardless of background.'],
      ['practical skills', 'kỹ năng thực tế', 'Students need practical skills to prepare for employment.', 'Abilities that can be applied directly to real-world tasks, not just theory.'],
      ['critical thinking', 'tư duy phản biện', 'Education should encourage critical thinking.', 'The ability to analyse information carefully and form a reasoned judgement.'],
      ['lifelong learning', 'học tập suốt đời', "Lifelong learning is increasingly important in today's society.", "The ongoing process of gaining new knowledge or skills throughout one's life."],
      ['distance learning', 'học từ xa', 'Distance learning allows students to study from home.', 'A method of education in which students study remotely rather than in person.'],
      ['online courses', 'khóa học trực tuyến', 'Online courses are becoming increasingly popular.', 'Courses of study delivered over the internet rather than in a classroom.'],
      ['vocational training', 'đào tạo nghề', 'Vocational training can help young people find jobs.', 'Training that teaches the specific skills needed for a particular trade or job.'],
      ['learning environment', 'môi trường học tập', 'A positive learning environment can motivate students.', 'The physical and social setting in which learning takes place.'],
      ['teaching methods', 'phương pháp giảng dạy', 'Teachers should use a variety of teaching methods.', 'The techniques and approaches a teacher uses to help students learn.'],
      ['qualified teachers', 'giáo viên có trình độ', 'Schools need more qualified teachers.', 'Teachers who have the necessary training and certification to teach.'],
      ['develop knowledge', 'phát triển kiến thức', 'Reading helps students develop knowledge.', "To build up and expand one's understanding of a subject over time."],
      ['acquire skills', 'tiếp thu kỹ năng', 'Students can acquire useful skills through group projects.', 'To gain a new ability or competence through learning or practice.'],
      ["broaden one's horizons", 'mở rộng hiểu biết', "Travelling can broaden students' horizons.", "To expand one's knowledge, experience, or outlook on life."],
      ['memorise information', 'ghi nhớ thông tin', 'Students often memorise information before exams.', 'To learn facts or details so they can be recalled exactly from memory.'],
      ['sit an exam', 'tham gia kỳ thi', 'Students have to sit several exams each year.', 'To take a formal test, usually as part of a course of study.'],
      ['drop out of school', 'bỏ học', 'Some teenagers drop out of school to find employment.', 'To leave school before completing one\'s education.'],
      ['academic success', 'thành công trong học tập', 'Hard work is essential for academic success.', 'Achieving strong results and reaching one\'s goals in education.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Technology (Collocations)',
    words: [
      ['technological development', 'sự phát triển công nghệ', 'Technological development has transformed modern society.', 'The process by which new technology is created and improved over time.'],
      ['rapid technological change', 'thay đổi công nghệ nhanh chóng', 'People must adapt to rapid technological change.', 'Fast, continuous advances in technology that quickly make old methods outdated.'],
      ['digital technology', 'công nghệ kỹ thuật số', 'Digital technology has changed the way people communicate.', 'Technology based on computer systems and electronic devices, such as smartphones and the internet.'],
      ['artificial intelligence', 'trí tuệ nhân tạo', 'Artificial intelligence may replace some human jobs.', 'Computer systems designed to perform tasks that normally require human intelligence.'],
      ['automation', 'tự động hóa', 'Automation can increase productivity in factories.', 'The use of machines or computer systems to perform tasks without human involvement.'],
      ['technological innovation', 'đổi mới công nghệ', "Technological innovation can improve people's quality of life.", 'The creation of new technology, methods, or ideas that improve on what already exists.'],
      ['access to information', 'tiếp cận thông tin', 'The Internet provides easy access to information.', 'The ability to find and obtain facts, data, or knowledge.'],
      ['online platforms', 'nền tảng trực tuyến', 'Online platforms have changed the way people shop.', 'Websites or applications that allow users to carry out activities such as shopping or communicating.'],
      ['social media platforms', 'nền tảng mạng xã hội', 'Social media platforms are widely used by young people.', 'Online services such as Facebook or Instagram that let users share content and connect with others.'],
      ['digital devices', 'thiết bị kỹ thuật số', 'Children spend too much time using digital devices.', 'Electronic devices such as smartphones, tablets, and computers.'],
      ['screen time', 'thời gian sử dụng màn hình', "Excessive screen time can affect children's health.", 'The amount of time spent using a device with a screen, such as a phone or TV.'],
      ['digital literacy', 'hiểu biết kỹ thuật số', 'Digital literacy is essential in the modern workplace.', 'The ability to use digital devices and technology effectively and safely.'],
      ['data privacy', 'quyền riêng tư dữ liệu', "Companies should protect users' data privacy.", "A person's right to control how their personal information is collected and used."],
      ['cybercrime', 'tội phạm mạng', 'Cybercrime is becoming increasingly common.', 'Criminal activity that is carried out using computers or the internet.'],
      ['online communication', 'giao tiếp trực tuyến', 'Online communication allows people to stay connected.', 'The exchange of messages or information over the internet.'],
      ['face-to-face interaction', 'tương tác trực tiếp', 'Technology may reduce face-to-face interaction.', 'Direct communication between people who are physically present with each other.'],
      ['remote working', 'làm việc từ xa', 'Remote working has become more common.', 'A way of working in which employees work from a location other than a central office.'],
      ['increase productivity', 'tăng năng suất', 'Technology can increase productivity.', "To raise the amount of work or output achieved in a given period."],
      ['save time and effort', 'tiết kiệm thời gian và công sức', 'Online shopping can save time and effort.', 'To reduce the time and energy needed to complete a task.'],
      ['rely heavily on technology', 'phụ thuộc nhiều vào công nghệ', 'Modern society relies heavily on technology.', 'To depend a great deal on technology to complete everyday tasks.'],
      ['bridge the digital divide', 'thu hẹp khoảng cách kỹ thuật số', 'Governments should help bridge the digital divide.', 'To reduce the gap between people who have access to technology and those who do not.'],
      ['replace human workers', 'thay thế lao động con người', 'Robots may replace human workers in some industries.', 'To use machines or automated systems instead of people to perform jobs.'],
      ['technological dependence', 'sự phụ thuộc công nghệ', "Technological dependence can reduce people's independence.", 'A strong reliance on technology to carry out daily tasks or functions.'],
      ['improve efficiency', 'cải thiện hiệu quả', 'Computers can improve efficiency in the workplace.', 'To make a process work better, faster, or with less waste.'],
      ['have access to the Internet', 'có quyền tiếp cận Internet', 'Most students now have access to the Internet.', 'To be able to connect to and use the internet.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Environment (Collocations)',
    words: [
      ['environmental protection', 'bảo vệ môi trường', 'Environmental protection should be a government priority.', 'Actions taken to preserve the natural environment from damage or destruction.'],
      ['environmental problems', 'các vấn đề môi trường', 'Governments must tackle environmental problems.', 'Issues that harm the natural world, such as pollution or climate change.'],
      ['climate change', 'biến đổi khí hậu', 'Climate change is one of the biggest global challenges.', "A long-term shift in the Earth's weather patterns and average temperatures."],
      ['global warming', 'nóng lên toàn cầu', 'Global warming is causing serious environmental problems.', "A gradual increase in the Earth's overall temperature."],
      ['air pollution', 'ô nhiễm không khí', 'Air pollution is a major problem in large cities.', 'The contamination of the air with harmful gases, dust, or smoke.'],
      ['water pollution', 'ô nhiễm nước', 'Industrial waste can cause water pollution.', 'The contamination of rivers, lakes, or seas with harmful substances.'],
      ['plastic waste', 'rác thải nhựa', 'Plastic waste is harmful to marine life.', 'Discarded plastic products and materials that are no longer used.'],
      ['carbon emissions', 'khí thải carbon', 'Governments should reduce carbon emissions.', 'The release of carbon dioxide into the atmosphere, mainly from burning fuel.'],
      ['greenhouse gases', 'khí nhà kính', 'Cars produce greenhouse gases.', "Gases that trap heat in the Earth's atmosphere and contribute to warming."],
      ['renewable energy', 'năng lượng tái tạo', 'Countries should invest in renewable energy.', 'Energy from sources that are naturally replenished, such as sunlight or wind.'],
      ['fossil fuels', 'nhiên liệu hóa thạch', 'Many countries still depend on fossil fuels.', 'Natural fuels such as coal, oil, and gas formed from the remains of ancient organisms.'],
      ['solar power', 'năng lượng mặt trời', 'Solar power is a clean source of energy.', 'Energy produced by converting sunlight into electricity or heat.'],
      ['wind power', 'năng lượng gió', 'Wind power can reduce dependence on fossil fuels.', 'Energy generated by using wind to turn turbines and produce electricity.'],
      ['natural resources', 'tài nguyên thiên nhiên', 'Humans are using natural resources too quickly.', 'Materials or substances that occur naturally and are used by humans, such as water, minerals, and forests.'],
      ['natural habitats', 'môi trường sống tự nhiên', 'Deforestation destroys natural habitats.', 'The natural environments in which animals and plants normally live.'],
      ['endangered species', 'các loài có nguy cơ tuyệt chủng', 'Governments should protect endangered species.', 'Types of animals or plants that are at serious risk of dying out completely.'],
      ['deforestation', 'nạn phá rừng', 'Deforestation contributes to climate change.', 'The clearing or cutting down of large areas of forest.'],
      ['loss of biodiversity', 'mất đa dạng sinh học', 'Pollution can lead to a loss of biodiversity.', 'A reduction in the variety of plant and animal life in an ecosystem.'],
      ['environmentally friendly', 'thân thiện với môi trường', 'People should use environmentally friendly products.', 'Not harmful to the environment.'],
      ['sustainable development', 'phát triển bền vững', 'Sustainable development is essential for future generations.', 'Development that meets present needs without harming the ability of future generations to meet their own.'],
      ['reduce waste', 'giảm rác thải', 'People should reduce waste by reusing products.', 'To produce or throw away less rubbish.'],
      ['recycle household waste', 'tái chế rác thải gia đình', 'Citizens should recycle household waste.', 'To process waste materials from the home so they can be used again.'],
      ['protect the environment', 'bảo vệ môi trường', 'Everyone has a responsibility to protect the environment.', 'To take action to prevent harm to the natural world.'],
      ['raise environmental awareness', 'nâng cao nhận thức môi trường', 'Schools can raise environmental awareness.', "To help people understand and pay more attention to environmental issues."],
      ['future generations', 'các thế hệ tương lai', 'We must protect natural resources for future generations.', 'People who will be born and live after the present generation.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Health (Collocations)',
    words: [
      ['public health', 'sức khỏe cộng đồng', 'Governments should invest more in public health.', 'The health of the population as a whole, and efforts to protect and improve it.'],
      ['healthcare system', 'hệ thống chăm sóc sức khỏe', 'A strong healthcare system benefits society.', 'The organisations, people, and resources that provide medical care to a population.'],
      ['healthcare services', 'dịch vụ chăm sóc sức khỏe', 'Rural areas often lack adequate healthcare services.', 'Medical services provided to diagnose, treat, or prevent illness.'],
      ['healthy lifestyle', 'lối sống lành mạnh', 'Regular exercise is part of a healthy lifestyle.', 'A way of living that promotes good physical and mental health.'],
      ['balanced diet', 'chế độ ăn cân bằng', 'Children should have a balanced diet.', 'A diet containing the right proportions of different types of food for good health.'],
      ['physical activity', 'hoạt động thể chất', 'Regular physical activity reduces the risk of disease.', 'Any bodily movement that requires energy, such as exercise or sport.'],
      ['regular exercise', 'tập thể dục thường xuyên', 'Regular exercise improves physical health.', 'Physical activity carried out consistently and often, such as several times a week.'],
      ['mental health', 'sức khỏe tinh thần', 'Social pressure can negatively affect mental health.', "A person's psychological and emotional well-being."],
      ['obesity', 'béo phì', 'Childhood obesity is becoming a serious problem.', 'The condition of being significantly overweight, to the point of harming health.'],
      ['sedentary lifestyle', 'lối sống ít vận động', 'A sedentary lifestyle can lead to health problems.', 'A way of living that involves little or no physical exercise.'],
      ['unhealthy eating habits', 'thói quen ăn uống không lành mạnh', 'Unhealthy eating habits can cause obesity.', 'Regular patterns of eating that are harmful to health, such as consuming too much fat or sugar.'],
      ['processed food', 'thực phẩm chế biến sẵn', 'Processed food often contains too much sugar.', 'Food that has been altered from its natural state, often with added preservatives or sugar.'],
      ['junk food', 'đồ ăn nhanh/đồ ăn không lành mạnh', 'Children should eat less junk food.', 'Food that is quick to prepare or eat but low in nutritional value.'],
      ['health problems', 'vấn đề sức khỏe', 'Lack of exercise can cause health problems.', 'Physical or mental conditions that negatively affect a person\'s well-being.'],
      ['prevent diseases', 'phòng ngừa bệnh tật', 'Exercise can help prevent diseases.', 'To stop illnesses from occurring or developing.'],
      ['reduce the risk of', 'giảm nguy cơ', 'Exercise can reduce the risk of heart disease.', 'To lower the chance or likelihood of something harmful happening.'],
      ['life expectancy', 'tuổi thọ', 'Better healthcare has increased life expectancy.', 'The average number of years a person is expected to live.'],
      ['medical treatment', 'điều trị y tế', 'Poor people may struggle to afford medical treatment.', 'Care given by doctors or hospitals to cure or manage an illness or injury.'],
      ['access to healthcare', 'tiếp cận dịch vụ y tế', 'Everyone should have access to healthcare.', 'The ability to obtain medical services when needed.'],
      ['health awareness', 'nhận thức về sức khỏe', 'Schools should promote health awareness.', "Understanding of, and attention paid to, issues affecting one's health."],
      ['healthcare costs', 'chi phí chăm sóc sức khỏe', 'Rising healthcare costs are a concern.', 'The amount of money spent on medical treatment and services.'],
      ['preventive measures', 'biện pháp phòng ngừa', 'Governments should introduce preventive measures.', 'Actions taken in advance to stop a problem, such as illness, from occurring.'],
      ['public awareness campaigns', 'chiến dịch nâng cao nhận thức cộng đồng', 'Public awareness campaigns can encourage healthy behaviour.', 'Organised efforts to inform and educate the public about an issue.'],
      ['consume too much sugar', 'tiêu thụ quá nhiều đường', 'Many children consume too much sugar.', 'To eat or drink an excessive amount of sugar.'],
      ['lead a healthy life', 'sống một cuộc sống lành mạnh', 'People should exercise regularly to lead a healthy life.', 'To live in a way that maintains good physical and mental health.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Work (Collocations)',
    words: [
      ['job satisfaction', 'sự hài lòng với công việc', 'Job satisfaction is more important than a high salary for some people.', 'The feeling of pleasure or fulfilment a person gets from their job.'],
      ['job security', 'sự ổn định công việc', 'Many employees value job security.', 'The assurance that a person will keep their job without the risk of losing it.'],
      ['career prospects', 'triển vọng nghề nghiệp', 'Higher education can improve career prospects.', "The likelihood and potential for advancement in a person's career."],
      ['employment opportunities', 'cơ hội việc làm', 'Technology creates new employment opportunities.', 'Chances for people to find paid work.'],
      ['unemployment rate', 'tỷ lệ thất nghiệp', 'The unemployment rate increased during the economic crisis.', 'The percentage of the workforce that does not have a job.'],
      ['working conditions', 'điều kiện làm việc', 'Companies should improve working conditions.', 'The environment and circumstances in which employees do their jobs.'],
      ['working environment', 'môi trường làm việc', 'A positive working environment improves productivity.', 'The physical and social setting in which people work.'],
      ['work-life balance', 'cân bằng công việc-cuộc sống', 'Employees need a good work-life balance.', "The balance between the time and energy given to a job and to one's personal life."],
      ['long working hours', 'giờ làm việc dài', 'Long working hours can cause stress.', 'A greater-than-normal number of hours spent working each day or week.'],
      ['flexible working hours', 'giờ làm việc linh hoạt', 'Flexible working hours can benefit employees.', 'A work schedule that allows employees some choice over when they start and finish work.'],
      ['remote working', 'làm việc từ xa', 'Remote working saves employees commuting time.', 'Working from a location away from a central office, such as from home.'],
      ['career development', 'phát triển nghề nghiệp', 'Training is important for career development.', "The process of gaining skills and experience to advance in one's profession."],
      ['professional skills', 'kỹ năng chuyên môn', 'Workers need strong professional skills.', 'Abilities and expertise relevant to performing a particular job well.'],
      ['transferable skills', 'kỹ năng có thể áp dụng ở nhiều công việc', 'Communication is an important transferable skill.', 'Skills that can be used effectively in different jobs or industries.'],
      ['workplace stress', 'căng thẳng nơi làm việc', "Workplace stress can affect employees' health.", 'Mental or emotional strain caused by pressures at work.'],
      ['earn a living', 'kiếm sống', 'People need a job to earn a living.', 'To make enough money through work to support oneself.'],
      ['provide employment', 'tạo việc làm', 'Small businesses provide employment for local people.', 'To give people jobs.'],
      ['create job opportunities', 'tạo cơ hội việc làm', 'Economic growth can create job opportunities.', 'To generate new chances for people to find paid work.'],
      ['climb the career ladder', 'thăng tiến trong sự nghiệp', 'Some employees are highly motivated to climb the career ladder.', 'To progress steadily to higher positions within a profession.'],
      ['gain work experience', 'tích lũy kinh nghiệm làm việc', 'Internships help students gain work experience.', 'To acquire practical knowledge and skills by actually working in a job.'],
      ['competitive salary', 'mức lương cạnh tranh', 'Skilled workers expect a competitive salary.', 'A rate of pay that is as good as, or better than, similar jobs elsewhere.'],
      ['financial stability', 'ổn định tài chính', 'A stable job provides financial stability.', 'A secure financial situation in which a person can reliably meet their needs.'],
      ['job market', 'thị trường lao động', 'Young people face strong competition in the job market.', 'The overall availability of jobs and the level of demand for workers.'],
      ['workplace equality', 'bình đẳng nơi làm việc', 'Companies should promote workplace equality.', 'The fair and equal treatment of all employees, regardless of background.'],
      ['employee productivity', 'năng suất nhân viên', 'A comfortable workplace can increase employee productivity.', 'The amount and quality of work produced by an employee in a given time.'],
    ],
  },
];

async function runVocabMerge1() {
  const VocabularyLesson = require('../models/VocabularyLesson');

  let totalAdded = 0, totalSkipped = 0;
  const summary = [];

  for (const topic of TOPICS_VM1) {
    const lesson = await VocabularyLesson.findOne({ title: topic.lessonTitle });
    if (!lesson) {
      console.log(`NOT FOUND: "${topic.lessonTitle}" — skipping this whole topic (expected to already exist).`);
      continue;
    }
    const existing = new Set(lesson.words.map(w => w.word.toLowerCase().trim()));
    const toAdd = [];
    let skipped = 0;
    for (const [word, meaning, example, definition] of topic.words) {
      const key = word.toLowerCase().trim();
      if (existing.has(key)) { skipped++; continue; }
      existing.add(key);
      toAdd.push({ word, meaning, example, definition, collocations: [], distractors: [] });
    }
    if (toAdd.length) {
      await VocabularyLesson.updateOne(
        { _id: lesson._id },
        { $push: { words: { $each: toAdd } }, $set: { updatedAt: new Date() } }
      );
    }
    totalAdded += toAdd.length;
    totalSkipped += skipped;
    summary.push({ lesson: topic.lessonTitle, added: toAdd.length, skipped, newTotal: lesson.words.length + toAdd.length });
    console.log(`"${topic.lessonTitle}": +${toAdd.length} added, ${skipped} skipped (already present), now ${lesson.words.length + toAdd.length} words total`);
  }

  console.log(`\n=== SUMMARY === ${totalAdded} words added, ${totalSkipped} skipped as duplicates`);
  console.log(JSON.stringify(summary, null, 2));

}


/**
 * Second batch of Part-2/topic vocabulary (student-provided, 2026-08-19):
 * 3 topics merge into existing "Task 2 - X (Collocations)" lessons whose
 * theme overlaps (Government & Society -> Government Spending, Crime & Law
 * -> Crime, Transport & Cities -> Transportation — same "merge on theme,
 * not exact title" pattern the user confirmed for the first batch); 4 have
 * no existing match and become new lessons (Family & Children,
 * Globalisation, Media & Advertising, Culture & Lifestyle).
 *
 * Same rules as seedWritingTask2VocabMerge.js: word/meaning/example given
 * verbatim by the user, `definition` authored here, collocations/
 * distractors left empty (dashboard-lesson.js's MCQ builder falls back to
 * sibling words in the same lesson). Additive only — skips a word already
 * present in its target lesson; safe to re-run.
 *
 * Run: node backend/scripts/seedWritingTask2VocabMerge2.js
 */

// { lessonTitle, isNew, words } — isNew: true creates the lesson if it
// doesn't exist yet; false expects it to already exist (merge target).
const TOPICS_VM2 = [
  {
    lessonTitle: 'Task 2 - Government Spending (Collocations)',
    isNew: false,
    words: [
      ['government funding', 'nguồn tài trợ của chính phủ', 'Schools need more government funding.', 'Money provided by the government to support an organisation or project.'],
      ['government spending', 'chi tiêu chính phủ', 'Government spending should focus on essential public services.', 'The total amount of money a government spends on public services and projects.'],
      ['public services', 'dịch vụ công', 'Governments are responsible for providing public services.', 'Services such as healthcare, education, and transport provided by the government for everyone.'],
      ['social welfare', 'phúc lợi xã hội', 'Social welfare programmes can help disadvantaged people.', 'Government support, such as financial aid, provided to people in need.'],
      ['public facilities', 'cơ sở vật chất công cộng', 'Cities need better public facilities.', 'Buildings, spaces, or equipment provided for public use, such as parks or libraries.'],
      ['social inequality', 'bất bình đẳng xã hội', 'Education can help reduce social inequality.', 'Unequal access to resources, opportunities, and status among members of society.'],
      ['income inequality', 'bất bình đẳng thu nhập', 'Income inequality is a serious social problem.', 'A large gap between the earnings of the richest and poorest members of society.'],
      ['living standards', 'mức sống', 'Economic growth can improve living standards.', "The level of material comfort available to a person or community."],
      ['quality of life', 'chất lượng cuộc sống', 'Public transport can improve quality of life.', "The general well-being and comfort of a person's everyday life."],
      ['social responsibility', 'trách nhiệm xã hội', 'Businesses should have a sense of social responsibility.', 'An obligation to act in ways that benefit society as a whole.'],
      ['community development', 'phát triển cộng đồng', 'Government investment can support community development.', 'The process of improving the social and economic well-being of a local community.'],
      ['disadvantaged groups', 'các nhóm thiệt thòi', 'Governments should support disadvantaged groups.', 'Groups of people who have fewer opportunities or resources than others in society.'],
      ['vulnerable people', 'người dễ bị tổn thương', 'Welfare programmes can protect vulnerable people.', 'People who are at greater risk of harm or hardship, such as the elderly or the poor.'],
      ['public awareness', 'nhận thức cộng đồng', 'Governments need to raise public awareness.', 'The general level of knowledge or concern the public has about an issue.'],
      ['law enforcement', 'thực thi pháp luật', 'Effective law enforcement can reduce crime.', 'The system of ensuring that laws are obeyed, usually carried out by the police.'],
      ['government intervention', 'sự can thiệp của chính phủ', 'Government intervention may be necessary.', 'Direct action taken by a government to influence economic or social outcomes.'],
      ['allocate resources', 'phân bổ nguồn lực', 'Governments should allocate resources effectively.', 'To assign money, time, or materials for a particular purpose.'],
      ['raise taxes', 'tăng thuế', 'Governments may need to raise taxes to fund public services.', 'To increase the amount of tax people or businesses must pay.'],
      ['pay taxes', 'nộp thuế', 'Citizens have a responsibility to pay taxes.', 'To give a portion of one\'s income or spending to the government as required by law.'],
      ['tackle social problems', 'giải quyết vấn đề xã hội', 'Governments should tackle social problems.', 'To take action to deal with and resolve issues affecting society.'],
      ['protect citizens', 'bảo vệ người dân', 'One role of government is to protect citizens.', 'To keep the people of a country safe from harm.'],
      ['promote equality', 'thúc đẩy bình đẳng', 'Policies should promote equality.', 'To encourage and support fair and equal treatment for everyone.'],
      ['reduce poverty', 'giảm nghèo', 'Economic policies should aim to reduce poverty.', "To lower the number of people living without enough money to meet basic needs."],
      ['economic growth', 'tăng trưởng kinh tế', 'Education contributes to economic growth.', "An increase in a country's production of goods and services over time."],
      ['national development', 'phát triển quốc gia', 'Education plays an important role in national development.', "The overall improvement of a country's economy, infrastructure, and society."],
    ],
  },
  {
    lessonTitle: 'Task 2 - Crime (Collocations)',
    isNew: false,
    words: [
      ['crime rate', 'tỷ lệ tội phạm', 'Better education may reduce the crime rate.', 'The number of crimes committed in a particular area within a given period.'],
      ['violent crime', 'tội phạm bạo lực', 'Violent crime is a serious threat to society.', 'Crime that involves the use of force or the threat of force against a person.'],
      ['juvenile crime', 'tội phạm vị thành niên', 'Family problems can contribute to juvenile crime.', 'Crime committed by people who are under the legal age of adulthood.'],
      ['criminal behaviour', 'hành vi phạm tội', 'Poverty may contribute to criminal behaviour.', 'Actions that break the law.'],
      ['strict laws', 'luật nghiêm khắc', 'Some people believe that strict laws are necessary.', 'Laws that are firmly enforced and allow little flexibility.'],
      ['tough punishment', 'hình phạt nghiêm khắc', 'Tough punishment does not always prevent crime.', 'Severe penalties given to someone who has broken the law.'],
      ['prison sentence', 'án tù', 'The offender received a long prison sentence.', 'A period of time a convicted person is legally required to spend in prison.'],
      ['capital punishment', 'án tử hình', 'Capital punishment remains controversial.', 'The legal punishment of death for a serious crime.'],
      ['life imprisonment', 'tù chung thân', 'Some serious crimes can result in life imprisonment.', "A sentence requiring a person to spend the rest of their life in prison."],
      ['rehabilitation programmes', 'chương trình cải tạo', 'Rehabilitation programmes can help offenders return to society.', 'Structured programmes designed to help offenders reform and reintegrate into society.'],
      ['criminal justice system', 'hệ thống tư pháp hình sự', 'The criminal justice system should treat offenders fairly.', 'The system of police, courts, and prisons used to enforce the law and punish crime.'],
      ['prevent crime', 'ngăn chặn tội phạm', 'Better education can help prevent crime.', 'To take action to stop crime from happening.'],
      ['deter criminals', 'ngăn chặn tội phạm', 'Heavy fines may deter criminals.', 'To discourage someone from committing a crime through fear of punishment.'],
      ['commit a crime', 'phạm tội', 'People who commit a crime should face consequences.', 'To carry out an illegal act.'],
      ['break the law', 'vi phạm pháp luật', 'Anyone who breaks the law should be punished.', 'To act in a way that is against the law.'],
      ['serve a sentence', 'chấp hành án', 'Prisoners must serve their sentences.', 'To spend the period of time in prison that a court has ordered.'],
      ['pay a fine', 'nộp phạt', 'Minor offenders may have to pay a fine.', 'To pay a sum of money as a penalty for breaking a rule or law.'],
      ['reduce crime', 'giảm tội phạm', 'Better policing can reduce crime.', 'To lower the amount or rate of criminal activity.'],
      ['repeat offenders', 'người tái phạm', 'Repeat offenders may receive harsher punishments.', 'People who commit crimes more than once.'],
      ['lack of education', 'thiếu giáo dục', 'A lack of education may increase the risk of crime.', 'Insufficient access to or attainment of schooling.'],
      ['family background', 'hoàn cảnh gia đình', "Family background can influence children's behaviour.", 'The circumstances and environment a person grew up in, including their family\'s social and economic situation.'],
      ['rehabilitate offenders', 'cải tạo người phạm tội', 'Prisons should aim to rehabilitate offenders.', 'To help someone who has committed a crime return to a normal, law-abiding life.'],
      ['crime prevention', 'phòng chống tội phạm', 'Crime prevention should be a priority.', 'Efforts and strategies aimed at reducing the occurrence of crime.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Transportation (Collocations)',
    isNew: false,
    words: [
      ['public transport', 'giao thông công cộng', 'Governments should invest in public transport.', 'Transport services, such as buses or trains, available for use by the general public.'],
      ['public transportation system', 'hệ thống giao thông công cộng', 'A reliable public transportation system reduces car use.', 'The full network of public transport services in a city or country.'],
      ['traffic congestion', 'tắc nghẽn giao thông', 'Traffic congestion is a major urban problem.', 'A situation in which roads are overcrowded with vehicles, causing delays.'],
      ['traffic jams', 'ùn tắc giao thông', 'Traffic jams waste a lot of time.', 'Long lines of vehicles that are stopped or moving very slowly.'],
      ['road infrastructure', 'cơ sở hạ tầng đường bộ', 'Governments need to improve road infrastructure.', 'The physical systems, such as roads and bridges, that support transport.'],
      ['transport infrastructure', 'cơ sở hạ tầng giao thông', 'Better transport infrastructure supports economic growth.', 'The facilities and systems, such as roads, railways, and airports, that make transport possible.'],
      ['private vehicles', 'phương tiện cá nhân', 'The number of private vehicles is increasing.', 'Vehicles owned and used by individuals, rather than public or shared transport.'],
      ['public spaces', 'không gian công cộng', 'Cities need more public spaces.', 'Areas, such as parks or squares, that are open and accessible to everyone.'],
      ['urban areas', 'khu vực đô thị', 'Population growth puts pressure on urban areas.', 'Towns and cities, as opposed to rural or countryside areas.'],
      ['urbanisation', 'đô thị hóa', 'Rapid urbanisation creates many challenges.', 'The process by which more people come to live in towns and cities.'],
      ['urban population', 'dân số đô thị', 'The urban population is growing rapidly.', 'The number of people living in towns and cities.'],
      ['overcrowded cities', 'thành phố quá đông đúc', 'Overcrowded cities often suffer from pollution.', 'Cities that have too many people for their available space and resources.'],
      ['housing shortage', 'thiếu nhà ở', 'Rapid population growth can cause a housing shortage.', 'A situation in which there are not enough homes available to meet demand.'],
      ['affordable housing', 'nhà ở giá phải chăng', 'Governments should provide affordable housing.', 'Housing that people on low or average incomes can reasonably afford.'],
      ['cost of living', 'chi phí sinh hoạt', 'The cost of living is high in major cities.', 'The amount of money needed to cover basic expenses such as housing, food, and transport.'],
      ['reduce traffic congestion', 'giảm tắc nghẽn giao thông', 'Better public transport can reduce traffic congestion.', 'To lower the level of overcrowding and delay on roads.'],
      ['ease traffic pressure', 'giảm áp lực giao thông', 'New roads may ease traffic pressure.', 'To reduce the strain caused by heavy traffic on a road network.'],
      ['commute to work', 'đi lại đến nơi làm việc', 'Many people commute to work by car.', 'To travel regularly between home and one\'s workplace.'],
      ['long-distance commuting', 'đi lại đường dài', 'Long-distance commuting can be stressful.', "Travelling a great distance regularly, usually between home and work."],
      ['pedestrian-friendly', 'thân thiện với người đi bộ', 'Cities should become more pedestrian-friendly.', 'Designed or suited to be safe and convenient for people walking.'],
      ['cycle lanes', 'làn đường dành cho xe đạp', 'More cycle lanes could encourage cycling.', 'Sections of road specifically marked out for the use of bicycles.'],
      ['green spaces', 'không gian xanh', 'Parks provide valuable green spaces in cities.', 'Areas of grass, trees, or other vegetation within an urban environment.'],
      ['sustainable urban development', 'phát triển đô thị bền vững', 'Cities need sustainable urban development.', 'The planning and growth of cities in ways that do not harm the environment or deplete resources.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Family and Children (Collocations)',
    isNew: true,
    description: 'Collocation vocabulary for IELTS Writing Task 2 essays on Family and Children',
    words: [
      ['family values', 'giá trị gia đình', 'Parents play an important role in teaching family values.', 'The beliefs and principles that a family considers important and passes on to its members.'],
      ['family relationships', 'mối quan hệ gia đình', 'Modern lifestyles can affect family relationships.', 'The bonds and connections between members of a family.'],
      ['parental responsibility', 'trách nhiệm của cha mẹ', 'Parents have a strong sense of parental responsibility.', 'The duties and obligations parents have towards raising and caring for their children.'],
      ['parental supervision', 'sự giám sát của cha mẹ', 'Children need adequate parental supervision.', 'The oversight and guidance parents provide to keep their children safe and well-behaved.'],
      ['child development', 'sự phát triển của trẻ', 'A supportive environment is important for child development.', "The physical, mental, and emotional growth of a child over time."],
      ['childcare', 'chăm sóc trẻ', 'Working parents often need affordable childcare.', 'The care and supervision of children, especially while their parents are working.'],
      ['single-parent families', 'gia đình đơn thân', 'Single-parent families may face financial difficulties.', 'Families in which children are raised by only one parent.'],
      ['working parents', 'cha mẹ đi làm', 'Working parents often have limited time with their children.', 'Parents who are employed outside the home in addition to raising children.'],
      ['family support', 'sự hỗ trợ từ gia đình', 'Family support is important during difficult times.', 'Help and encouragement provided by family members.'],
      ['generation gap', 'khoảng cách thế hệ', 'The generation gap can cause conflicts.', 'Differences in attitudes and values between older and younger generations.'],
      ['peer pressure', 'áp lực từ bạn bè', 'Teenagers are often influenced by peer pressure.', 'The influence exerted by people of the same age or social group to behave in a certain way.'],
      ['social skills', 'kỹ năng xã hội', 'Children develop social skills through interaction.', 'The abilities needed to communicate and interact effectively with other people.'],
      ['emotional development', 'phát triển cảm xúc', "Parents influence children's emotional development.", "The growth of a child's ability to understand and manage their own feelings."],
      ['discipline children', 'kỷ luật trẻ', 'Parents should learn how to discipline children effectively.', 'To teach children to behave well, often through rules and consequences.'],
      ['set a good example', 'làm gương tốt', 'Parents should set a good example for their children.', "To behave in a way that others, especially children, are encouraged to imitate."],
      ['spend quality time', 'dành thời gian chất lượng', 'Parents should spend quality time with their children.', 'To spend time together doing meaningful, enjoyable activities.'],
      ['raise children', 'nuôi dạy con', 'Raising children can be challenging.', 'To care for and bring up children until they are adults.'],
      ['provide emotional support', 'hỗ trợ về mặt cảm xúc', 'Parents should provide emotional support.', "To offer comfort, encouragement, and understanding to someone."],
      ['build strong relationships', 'xây dựng mối quan hệ bền chặt', 'Family activities help build strong relationships.', 'To develop close and lasting bonds with other people.'],
      ['develop independence', 'phát triển tính độc lập', 'Children should gradually develop independence.', "To become able to think, act, and take care of oneself without relying on others."],
      ['protect children from', 'bảo vệ trẻ khỏi', 'Parents should protect children from harmful content.', 'To keep children safe from something dangerous or harmful.'],
      ['childhood obesity', 'béo phì ở trẻ em', 'Childhood obesity is becoming increasingly common.', 'The condition of being significantly overweight during childhood.'],
      ['academic pressure', 'áp lực học tập', 'Too much academic pressure can harm children.', 'The stress children feel from the demands of school and exams.'],
      ['household responsibilities', 'trách nhiệm trong gia đình', 'Children should share household responsibilities.', 'Tasks and duties related to running a home, such as cleaning or cooking.'],
      ['work-life balance', 'cân bằng công việc-cuộc sống', 'Parents need a good work-life balance.', "The balance between the time and energy given to a job and to one's personal or family life."],
    ],
  },
  {
    lessonTitle: 'Task 2 - Globalisation (Collocations)',
    isNew: true,
    description: 'Collocation vocabulary for IELTS Writing Task 2 essays on Globalisation',
    words: [
      ['globalisation', 'toàn cầu hóa', 'Globalisation has connected economies around the world.', 'The process by which businesses and cultures around the world become increasingly interconnected.'],
      ['global economy', 'nền kinh tế toàn cầu', 'Countries are increasingly dependent on the global economy.', "The economic activity and trade that takes place across the world's countries."],
      ['international trade', 'thương mại quốc tế', 'International trade creates economic opportunities.', 'The exchange of goods and services between different countries.'],
      ['foreign investment', 'đầu tư nước ngoài', 'Foreign investment can create jobs.', 'Money invested by individuals or companies from one country into another country.'],
      ['multinational companies', 'các công ty đa quốc gia', 'Multinational companies operate in many countries.', 'Large companies that operate in more than one country.'],
      ['economic integration', 'hội nhập kinh tế', 'Globalisation encourages economic integration.', "The process by which different countries' economies become closely linked."],
      ['cultural exchange', 'giao lưu văn hóa', 'International travel promotes cultural exchange.', 'The sharing of ideas, customs, and traditions between different cultures.'],
      ['cultural diversity', 'đa dạng văn hóa', 'Globalisation can increase cultural diversity.', 'The presence of many different cultures within a society or group.'],
      ['cultural identity', 'bản sắc văn hóa', 'Globalisation may threaten cultural identity.', 'The sense of belonging to a particular culture, based on shared customs, language, and values.'],
      ['local traditions', 'truyền thống địa phương', 'Young people should preserve local traditions.', 'Customs and practices that are specific to a particular place or community.'],
      ['western culture', 'văn hóa phương Tây', 'Western culture has influenced many societies.', 'The customs, values, and way of life typical of Western countries such as the US and Europe.'],
      ['developing countries', 'các nước đang phát triển', 'Developing countries can benefit from foreign investment.', 'Countries with a lower level of industrial and economic development.'],
      ['developed countries', 'các nước phát triển', 'Developed countries often have stronger economies.', 'Countries with an advanced economy and a high standard of living.'],
      ['international cooperation', 'hợp tác quốc tế', 'Global problems require international cooperation.', 'Countries working together to achieve a common goal.'],
      ['cross-cultural communication', 'giao tiếp đa văn hóa', 'English facilitates cross-cultural communication.', 'Communication between people from different cultural backgrounds.'],
      ['economic opportunities', 'cơ hội kinh tế', 'Globalisation creates new economic opportunities.', 'Chances for individuals or businesses to improve their financial situation.'],
      ['job opportunities', 'cơ hội việc làm', 'International companies provide job opportunities.', 'Chances for people to find paid work.'],
      ['standard of living', 'mức sống', 'Global trade can improve the standard of living.', 'The level of wealth, comfort, and material goods available to a person or community.'],
      ['economic inequality', 'bất bình đẳng kinh tế', 'Globalisation may increase economic inequality.', 'An unequal distribution of income and wealth among people or countries.'],
      ['cultural homogenisation', 'đồng nhất hóa văn hóa', 'Globalisation may lead to cultural homogenisation.', 'The process by which different cultures become more similar to one another, often losing distinct characteristics.'],
      ['preserve cultural heritage', 'bảo tồn di sản văn hóa', 'Governments should preserve cultural heritage.', "To protect and maintain a society's traditions, monuments, and customs for future generations."],
      ['compete in the global market', 'cạnh tranh trên thị trường toàn cầu', 'Small businesses struggle to compete in the global market.', 'To try to succeed commercially against companies from around the world.'],
      ['expand overseas', 'mở rộng ra nước ngoài', 'Companies can expand overseas through globalisation.', "To grow a business's operations into other countries."],
      ['benefit from globalisation', 'hưởng lợi từ toàn cầu hóa', 'Developing countries can benefit from globalisation.', 'To gain an advantage as a result of increasing global connection and trade.'],
      ['global challenges', 'những thách thức toàn cầu', 'Climate change requires countries to address global challenges.', 'Major problems that affect the whole world and require international action.'],
    ],
  },
  {
    lessonTitle: 'Task 2 - Media and Advertising (Collocations)',
    isNew: true,
    description: 'Collocation vocabulary for IELTS Writing Task 2 essays on Media and Advertising',
    words: [
      ['mass media', 'truyền thông đại chúng', 'Mass media has a powerful influence on society.', 'Means of communication, such as television and newspapers, that reach large numbers of people.'],
      ['social media', 'mạng xã hội', 'Social media plays an important role in modern communication.', 'Websites and applications that enable users to create and share content or participate in networking.'],
      ['traditional media', 'truyền thông truyền thống', 'Traditional media remains important for older people.', 'Older forms of media such as newspapers, radio, and television.'],
      ['news coverage', 'độ phủ tin tức', 'The media provides extensive news coverage.', 'The reporting of news events by the media.'],
      ['reliable information', 'thông tin đáng tin cậy', 'People should check whether information is reliable.', 'Information that can be trusted to be accurate and truthful.'],
      ['fake news', 'tin giả', 'Fake news can spread rapidly online.', 'False or misleading information presented as if it were genuine news.'],
      ['misleading information', 'thông tin gây hiểu lầm', 'Social media can contain misleading information.', 'Information that gives a false or inaccurate impression.'],
      ['freedom of the press', 'tự do báo chí', 'Freedom of the press is important in a democratic society.', 'The right of newspapers, television, and other media to report news without government control.'],
      ['advertising campaign', 'chiến dịch quảng cáo', 'The company launched a successful advertising campaign.', 'A planned series of advertisements designed to promote a product or idea.'],
      ['target audience', 'đối tượng mục tiêu', 'Advertisements are designed for a specific target audience.', 'The particular group of people that an advertisement or product is aimed at.'],
      ['consumer behaviour', 'hành vi người tiêu dùng', 'Advertising can influence consumer behaviour.', 'The way people decide what to buy and how they spend their money.'],
      ['consumerism', 'chủ nghĩa tiêu dùng', 'Advertising can encourage consumerism.', 'The tendency of people to buy and consume goods in excessive amounts.'],
      ['brand awareness', 'nhận diện thương hiệu', 'Advertising helps companies increase brand awareness.', 'The extent to which consumers recognise and remember a particular brand.'],
      ['commercial advertisement', 'quảng cáo thương mại', 'Commercial advertisements are everywhere.', 'A paid announcement promoting a product or service.'],
      ['product placement', 'quảng cáo sản phẩm trong phim/chương trình', 'Product placement is common in films.', 'A form of advertising in which products are featured within films or TV shows.'],
      ['celebrity endorsement', 'quảng cáo nhờ người nổi tiếng', 'Celebrity endorsement can increase product sales.', 'The use of a famous person to promote a product or brand.'],
      ['influence public opinion', 'ảnh hưởng dư luận', 'The media can influence public opinion.', "To affect what the general public thinks or believes about an issue."],
      ["shape people's attitudes", 'định hình thái độ của mọi người', "Media can shape people's attitudes.", "To influence how people think or feel about something over time."],
      ['raise awareness', 'nâng cao nhận thức', 'Advertising can raise awareness of social issues.', 'To increase public knowledge or concern about a particular issue.'],
      ['spread information', 'lan truyền thông tin', 'Social media helps spread information quickly.', 'To make information known to a wide number of people.'],
      ['access information instantly', 'tiếp cận thông tin ngay lập tức', 'The Internet allows people to access information instantly.', 'To obtain information immediately, without delay.'],
      ['media literacy', 'hiểu biết về truyền thông', 'Media literacy is important for young people.', 'The ability to critically evaluate and understand information presented through media.'],
      ['privacy concerns', 'lo ngại về quyền riêng tư', 'Social media has raised privacy concerns.', "Worries about how personal information is collected, stored, or shared."],
      ['excessive media exposure', 'tiếp xúc quá mức với truyền thông', 'Excessive media exposure can affect children.', 'Spending too much time consuming media content such as TV or social media.'],
      ['influence consumer choices', 'ảnh hưởng lựa chọn của người tiêu dùng', 'Advertisements can influence consumer choices.', "To affect what products or services people decide to buy."],
    ],
  },
  {
    lessonTitle: 'Task 2 - Culture and Lifestyle (Collocations)',
    isNew: true,
    description: 'Collocation vocabulary for IELTS Writing Task 2 essays on Culture and Lifestyle',
    words: [
      ['cultural heritage', 'di sản văn hóa', 'Governments should protect cultural heritage.', "A society's inherited traditions, monuments, and customs that are valued and passed down."],
      ['cultural identity', 'bản sắc văn hóa', 'Traditional food is part of cultural identity.', 'The sense of belonging to a particular culture, based on shared customs and values.'],
      ['traditional values', 'giá trị truyền thống', 'Modern lifestyles can affect traditional values.', 'Long-established beliefs and principles that are important within a culture.'],
      ['local traditions', 'truyền thống địa phương', 'Young people should preserve local traditions.', 'Customs and practices that are specific to a particular place or community.'],
      ['customs and traditions', 'phong tục và truyền thống', 'Customs and traditions vary between countries.', 'Established practices and beliefs that are passed down within a culture.'],
      ['cultural diversity', 'đa dạng văn hóa', 'Immigration can increase cultural diversity.', 'The presence of many different cultures within a society or group.'],
      ['traditional culture', 'văn hóa truyền thống', 'Traditional culture should be preserved.', 'The customs, beliefs, and way of life that have existed in a society for a long time.'],
      ['modern lifestyle', 'lối sống hiện đại', 'A modern lifestyle can be stressful.', 'A way of living shaped by contemporary technology, habits, and values.'],
      ['fast-paced lifestyle', 'lối sống nhanh', 'Many urban residents have a fast-paced lifestyle.', 'A way of living characterised by a high level of activity and little time to relax.'],
      ['consumer culture', 'văn hóa tiêu dùng', 'Advertising contributes to consumer culture.', 'A culture in which buying and owning goods is highly valued.'],
      ['materialistic lifestyle', 'lối sống coi trọng vật chất', 'A materialistic lifestyle does not necessarily bring happiness.', 'A way of living that places great importance on owning money and possessions.'],
      ['work-life balance', 'cân bằng công việc-cuộc sống', 'People need a good work-life balance.', "The balance between the time and energy given to a job and to one's personal life."],
      ['quality of life', 'chất lượng cuộc sống', 'Leisure activities can improve quality of life.', "The general well-being and comfort of a person's everyday life."],
      ['leisure activities', 'hoạt động giải trí', 'People need leisure activities to reduce stress.', 'Activities done for enjoyment during free time.'],
      ['cultural activities', 'hoạt động văn hóa', 'Museums offer educational and cultural activities.', "Activities related to the arts, history, or traditions of a society."],
      ['the arts', 'nghệ thuật', 'The arts play an important role in society.', 'Creative activities such as painting, music, literature, and theatre.'],
      ['performing arts', 'nghệ thuật biểu diễn', 'Governments should support the performing arts.', 'Art forms performed in front of an audience, such as music, dance, and theatre.'],
      ['cultural festivals', 'lễ hội văn hóa', 'Cultural festivals attract tourists.', 'Public celebrations of a community\'s traditions, arts, or customs.'],
      ['historical sites', 'địa điểm lịch sử', 'Historical sites should be protected.', 'Places of historical importance, such as monuments or ancient buildings.'],
      ['preserve traditions', 'bảo tồn truyền thống', 'Communities should preserve traditions for future generations.', 'To protect and maintain long-established customs so they are not lost.'],
      ['promote cultural awareness', 'nâng cao nhận thức văn hóa', 'Schools can promote cultural awareness.', "To help people understand and appreciate different cultures."],
      ['cultural exchange', 'giao lưu văn hóa', 'Travel encourages cultural exchange.', 'The sharing of ideas, customs, and traditions between different cultures.'],
      ['cultural differences', 'khác biệt văn hóa', 'People should respect cultural differences.', 'The ways in which different cultures vary in their customs, beliefs, and behaviour.'],
      ['embrace modernity', 'đón nhận sự hiện đại', 'Societies need to embrace modernity while preserving traditions.', 'To willingly accept and adopt modern ideas, technology, and ways of life.'],
      ['pass traditions down to future generations', 'truyền lại truyền thống cho thế hệ tương lai', 'Families can pass traditions down to future generations.', 'To teach and hand on customs and practices to one\'s children and grandchildren.'],
    ],
  },
];

async function runVocabMerge2() {
  const VocabularyLesson = require('../models/VocabularyLesson');

  let totalAdded = 0, totalSkipped = 0, lessonsCreated = 0;
  const summary = [];

  for (const topic of TOPICS_VM2) {
    let lesson = await VocabularyLesson.findOne({ title: topic.lessonTitle });

    if (!lesson) {
      if (!topic.isNew) {
        console.log(`NOT FOUND (expected existing): "${topic.lessonTitle}" — skipping.`);
        continue;
      }
      lesson = await VocabularyLesson.create({
        title: topic.lessonTitle,
        description: topic.description || '',
        difficulty: 'B2',
        order: 0,
        published: true,
        createdBy: '697f122cba33544fa9772c89', // tranhadeeptry@gmail.com, admin
        words: [],
      });
      lessonsCreated++;
      console.log(`CREATED new lesson: "${topic.lessonTitle}"`);
    }

    const existing = new Set(lesson.words.map(w => w.word.toLowerCase().trim()));
    const toAdd = [];
    let skipped = 0;
    for (const [word, meaning, example, definition] of topic.words) {
      const key = word.toLowerCase().trim();
      if (existing.has(key)) { skipped++; continue; }
      existing.add(key);
      toAdd.push({ word, meaning, example, definition, collocations: [], distractors: [] });
    }
    if (toAdd.length) {
      await VocabularyLesson.updateOne(
        { _id: lesson._id },
        { $push: { words: { $each: toAdd } }, $set: { updatedAt: new Date() } }
      );
    }
    totalAdded += toAdd.length;
    totalSkipped += skipped;
    summary.push({ lesson: topic.lessonTitle, isNew: topic.isNew, added: toAdd.length, skipped, newTotal: lesson.words.length + toAdd.length });
    console.log(`"${topic.lessonTitle}": +${toAdd.length} added, ${skipped} skipped, now ${lesson.words.length + toAdd.length} words total`);
  }

  console.log(`\n=== SUMMARY === ${totalAdded} words added, ${totalSkipped} skipped as duplicates, ${lessonsCreated} new lessons created`);
  console.log(JSON.stringify(summary, null, 2));

}


async function runSeed() {
  await runSeedAnalysis2026Q3();
  await runSeedAnalysisExisting();
  await runSeedSamples2026Q3();
  await runVocabMerge1();
  await runVocabMerge2();
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask2Seed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask2Seed] Failed:', err); process.exit(1); });
}

module.exports = {
  runSeed,
  runSeedAnalysis2026Q3, runSeedAnalysisExisting, runSeedSamples2026Q3,
  runVocabMerge1, runVocabMerge2,
  ANALYSIS_2026Q3, ANALYSIS_EXISTING, SAMPLES_2026Q3_T2, TOPICS_VM1, TOPICS_VM2,
};
