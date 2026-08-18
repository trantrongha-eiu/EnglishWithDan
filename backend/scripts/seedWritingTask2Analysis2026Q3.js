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
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const ANALYSIS = [
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
  console.log(`[WritingTask2AnalysisSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS.length})`);
  if (result.matchedCount !== ANALYSIS.length) {
    console.warn('[WritingTask2AnalysisSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask2AnalysisSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask2AnalysisSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, ANALYSIS };
