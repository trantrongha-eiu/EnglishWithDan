'use strict';

// Augments the Task 2 weekly topics (backend/scripts/seedTask2Exercises.js)
// so each topic also trains the student to BRAINSTORM, to use CONCRETE
// EVIDENCE, and to WRITE A CONCLUSION — not just translate ready-made ideas.
//
// For every topic this adds:
//   - topic.brainstormHints : [{ side, points[] }]  (surfaced on the practice
//     screen as a "think first, then reveal" step)
//   - 2 × translation question : "câu ví dụ có dẫn chứng" (real facts:
//     WHO / UNESCO figures, named countries, named studies) — models the
//     band-7+ move of backing a point with a specific example
//   - 1 × translation question : a CONCLUSION sentence that follows the
//     standard template for that essay type and stays on the exact prompt
//   - 1 × short_writing question : write the concluding paragraph (2–3
//     sentences) for the real prompt, using the ideas just practised
//
// Existing questions / vocabulary / prompt are untouched.

const SIDE_LABELS = {
  advantages_disadvantages: ['Ưu điểm (Advantages)', 'Nhược điểm (Disadvantages)'],
  cause_effect:             ['Nguyên nhân (Causes)', 'Hệ quả (Effects)'],
  cause_solution:           ['Nguyên nhân (Causes)', 'Giải pháp (Solutions)'],
  effect_solution:          ['Hệ quả (Effects)', 'Giải pháp (Solutions)'],
  agree_disagree:           ['Lý do ĐỒNG Ý', 'Lý do KHÔNG đồng ý / phản biện'],
  discuss_both_views:       ['Quan điểm 1 (View 1)', 'Quan điểm 2 (View 2)'],
  positive_or_negative_development: ['Mặt tích cực (Positive)', 'Mặt tiêu cực (Negative)'],
};

const ESSAY_VI = {
  advantages_disadvantages: 'Advantages & Disadvantages',
  cause_effect: 'Cause & Effect',
  cause_solution: 'Cause & Solution',
  effect_solution: 'Effect & Solution',
  agree_disagree: 'Agree or Disagree',
  discuss_both_views: 'Discuss Both Views',
  positive_or_negative_development: 'Positive or Negative Development',
};

// ── per-topic material (keyed by exact topicName) ─────────────────────────
const AUG = {
  // ═══ WEEK 1 — Technology · Advantages & Disadvantages ═══
  'Technology in Education': {
    a: ['Học linh hoạt mọi lúc, mọi nơi', 'Mở rộng tiếp cận giáo dục cho vùng xa / người đi làm', 'Chi phí thấp hơn: không đi lại, tài liệu số, lớp đông'],
    b: ['Thiếu tương tác trực tiếp → giảm động lực, dễ bỏ học', 'Phụ thuộc thiết bị và đường truyền ổn định', 'Khó tập trung, dễ xao nhãng khi học ở nhà'],
    evidence: [
      { vi: 'Ví dụ, UNESCO cho biết vào lúc đỉnh dịch COVID-19, việc đóng cửa trường học đã ảnh hưởng tới hơn 1,5 tỷ học sinh, phần lớn phải chuyển sang một hình thức học trực tuyến nào đó.',
        en: 'For example, UNESCO reported that at the peak of the COVID-19 pandemic, school closures affected more than 1.5 billion students, most of whom had to move to some form of online learning.' },
      { vi: 'Chẳng hạn, các nền tảng như Coursera và edX hợp tác với những trường đại học hàng đầu để cung cấp khóa học trực tuyến miễn phí cho hàng triệu người học trên khắp thế giới.',
        en: 'For instance, platforms such as Coursera and edX partner with leading universities to provide free online courses to millions of learners around the world.' },
    ],
    conclusion: { vi: 'Tóm lại, mặc dù học trực tuyến có những hạn chế như thiếu tương tác trực tiếp và đòi hỏi tính tự giác cao, những lợi ích về sự linh hoạt và khả năng tiếp cận khiến ưu điểm của xu hướng này lớn hơn nhược điểm.',
      en: 'In conclusion, although online learning has drawbacks such as a lack of face-to-face interaction and a need for strong self-discipline, its benefits in terms of flexibility and accessibility mean that the advantages of this trend outweigh the disadvantages.' },
  },
  'Mobile Devices and Communication': {
    a: ['Liên lạc tức thời, chi phí thấp, xuyên biên giới', 'Truy cập thông tin và dịch vụ mọi lúc mọi nơi', 'Kết nối gia đình / bạn bè ở xa'],
    b: ['Giao tiếp trực tiếp giảm, quan hệ nông hơn', 'Nghiện điện thoại, xao nhãng, mất tập trung', 'Rủi ro riêng tư và tin giả lan nhanh'],
    evidence: [
      { vi: 'Ví dụ, các ứng dụng nhắn tin như WhatsApp và Zalo cho phép một gia đình sống ở nhiều quốc gia gọi video miễn phí hằng ngày, điều gần như không thể trước đây.',
        en: 'For example, messaging apps such as WhatsApp and Zalo let a family living in different countries make free video calls every day, something that was almost impossible in the past.' },
      { vi: 'Tuy nhiên, nhiều nghiên cứu tâm lý học cho thấy việc chỉ cần có điện thoại trên bàn cũng đủ làm giảm khả năng tập trung và chất lượng của một cuộc trò chuyện trực tiếp.',
        en: 'However, several psychology studies have found that merely having a phone on the table is enough to reduce concentration and the quality of a face-to-face conversation.' },
    ],
    conclusion: { vi: 'Tóm lại, dù điện thoại thông minh làm giao tiếp trực tiếp ít đi và gây ra tình trạng lệ thuộc, khả năng kết nối con người ngay lập tức và với chi phí thấp cho thấy lợi ích của thiết bị di động vẫn lớn hơn tác hại.',
      en: 'In conclusion, although smartphones have reduced face-to-face contact and created a degree of dependence, their power to connect people instantly and cheaply means that the benefits of mobile devices still outweigh the drawbacks.' },
  },

  // ═══ WEEK 2 — Technology · Advantages & Disadvantages ═══
  'Influence of Social Media': {
    a: ['Cập nhật tin tức nhanh, miễn phí, đa chiều', 'Ai cũng có thể lên tiếng, giám sát quyền lực', 'Kết nối cộng đồng, lan tỏa hoạt động thiện nguyện'],
    b: ['Tin giả và thông tin sai lệch lan rất nhanh', 'Buồng vọng (echo chamber) làm quan điểm cực đoan hơn', 'Ảnh hưởng sức khỏe tinh thần: so sánh, nghiện, lo âu'],
    evidence: [
      { vi: 'Ví dụ, một nghiên cứu nổi tiếng của MIT phân tích hàng triệu dòng tin trên Twitter và phát hiện tin giả lan nhanh hơn và xa hơn tin thật khoảng sáu lần.',
        en: 'For example, a well-known MIT study analysed millions of posts on Twitter and found that false news spread roughly six times faster and further than true news.' },
      { vi: 'Mặt khác, trong nhiều thảm họa thiên nhiên, người dân đã dùng mạng xã hội để tổ chức cứu trợ và tìm người mất tích nhanh hơn các kênh chính thức.',
        en: 'On the other hand, during many natural disasters, people have used social media to organise relief and locate missing persons faster than official channels could.' },
    ],
    conclusion: { vi: 'Tóm lại, dù mạng xã hội giúp mọi người tiếp cận tin tức nhanh và tự do bày tỏ ý kiến, nguy cơ tin giả và tác hại lên sức khỏe tinh thần lớn đến mức, đối với tin tức, nhược điểm của việc phụ thuộc vào mạng xã hội có thể lớn hơn ưu điểm.',
      en: 'In conclusion, although social media lets people access news quickly and express their opinions freely, the risks of misinformation and harm to mental health are so serious that, for news, the drawbacks of relying on social media may outweigh the benefits.' },
  },
  'Wearable Health Technologies & AI Smart Devices': {
    a: ['Theo dõi sức khỏe liên tục, phát hiện sớm bất thường', 'Tạo động lực vận động, ngủ và ăn uống điều độ', 'Giảm tải cho bệnh viện: cảnh báo trước khi bệnh nặng'],
    b: ['Dữ liệu sức khỏe nhạy cảm có thể bị rò rỉ / bán', 'Gây lo âu sức khỏe, ám ảnh số liệu', 'Đo lường thiếu chính xác dẫn tới chẩn đoán sai'],
    evidence: [
      { vi: 'Ví dụ, đồng hồ thông minh như Apple Watch nay có thể đo điện tâm đồ (ECG) và đã cảnh báo một số người dùng về rối loạn nhịp tim nghiêm trọng mà họ chưa hề biết.',
        en: 'For example, smartwatches such as the Apple Watch can now record an electrocardiogram (ECG) and have alerted some users to serious heart-rhythm problems they were unaware of.' },
      { vi: 'Tuy nhiên, các chuyên gia y tế cảnh báo rằng chỉ số từ thiết bị đeo không phải lúc nào cũng chính xác và có thể khiến người khỏe mạnh lo lắng quá mức hoặc tự chẩn đoán sai.',
        en: 'However, medical experts warn that readings from wearable devices are not always accurate and can make healthy people worry excessively or misdiagnose themselves.' },
    ],
    conclusion: { vi: 'Tóm lại, mặc dù thiết bị theo dõi sức khỏe làm dấy lên lo ngại về quyền riêng tư dữ liệu và sự lo âu quá mức, khả năng phát hiện sớm vấn đề và khuyến khích lối sống lành mạnh cho thấy ưu điểm của xu hướng này lớn hơn nhược điểm.',
      en: 'In conclusion, although health-tracking devices raise concerns about data privacy and excessive anxiety, their ability to detect problems early and encourage a healthier lifestyle means that the advantages of this trend outweigh the disadvantages.' },
  },

  // ═══ WEEK 3 — Education · Cause & Effect ═══
  'High Rates of University Dropout': {
    a: ['Khó khăn tài chính, phải đi làm thêm nhiều', 'Chọn sai ngành, mất động lực, thiếu định hướng', 'Chưa sẵn sàng về kỹ năng tự học ở bậc đại học'],
    b: ['Cá nhân: nợ học phí, thu nhập thấp hơn suốt đời', 'Xã hội: lãng phí nguồn lực đào tạo, thiếu lao động trình độ cao', 'Doanh nghiệp khó tuyển đủ nhân sự có bằng cấp'],
    evidence: [
      { vi: 'Ví dụ, ở Mỹ chỉ khoảng 60% sinh viên bắt đầu chương trình cử nhân bốn năm hoàn thành nó trong vòng sáu năm, phần còn lại bỏ dở giữa chừng.',
        en: 'For example, in the United States only about 60% of students who begin a four-year bachelor\'s degree complete it within six years, while the rest drop out along the way.' },
      { vi: 'Một nguyên nhân thường được nhắc tới là gánh nặng tài chính: nhiều sinh viên phải làm việc bán thời gian quá nhiều giờ nên không theo kịp việc học.',
        en: 'One frequently cited cause is financial pressure: many students have to work so many part-time hours that they cannot keep up with their studies.' },
    ],
    conclusion: { vi: 'Tóm lại, khó khăn tài chính và việc chọn sai ngành học là những nguyên nhân chính khiến sinh viên bỏ học, và xu hướng này gây ra hậu quả nghiêm trọng cho cả bản thân người học lẫn nguồn nhân lực của xã hội.',
      en: 'In conclusion, financial hardship and choosing the wrong course of study are the main causes of university dropout, and this trend has serious consequences both for the individuals concerned and for society\'s skilled workforce.' },
  },
  'Decline in STEM Course Enrolments': {
    a: ['Môn khoa học bị coi là khó và khô khan ở phổ thông', 'Thiếu giáo viên giỏi và phòng thí nghiệm', 'Học sinh không thấy rõ cơ hội nghề nghiệp / thu nhập'],
    b: ['Thiếu kỹ sư, bác sĩ, nhà nghiên cứu trong tương lai', 'Đổi mới công nghệ và năng suất quốc gia chậm lại', 'Phụ thuộc chuyên gia nước ngoài, chảy máu chất xám'],
    evidence: [
      { vi: 'Ví dụ, các nước như Đức và Hàn Quốc đã triển khai học bổng và chiến dịch quốc gia để thu hút thêm học sinh vào ngành kỹ thuật và khoa học vì lo ngại thiếu hụt lao động.',
        en: 'For example, countries such as Germany and South Korea have launched scholarships and national campaigns to attract more students into engineering and science because of fears of a labour shortage.' },
      { vi: 'Một hệ quả rõ rệt là nhiều công ty công nghệ phải tuyển kỹ sư từ nước ngoài, làm tăng chi phí và khiến nền kinh tế trong nước phụ thuộc vào nhân tài nhập khẩu.',
        en: 'One clear effect is that many technology companies have to recruit engineers from abroad, which raises costs and leaves the domestic economy dependent on imported talent.' },
    ],
    conclusion: { vi: 'Tóm lại, việc các môn khoa học bị xem là khó và ít hấp dẫn về nghề nghiệp là nguyên nhân chính khiến số học sinh chọn ngành STEM giảm, và điều này đe dọa nguồn cung kỹ sư cùng năng lực đổi mới của cả xã hội.',
      en: 'In conclusion, the perception that science subjects are difficult and offer poor career prospects is the main cause of the fall in STEM enrolments, and this threatens society\'s future supply of engineers and its capacity for innovation.' },
  },

  // ═══ WEEK 4 — Education · Cause & Effect ═══
  'Online Learning and Student Motivation': {
    a: ['Thiếu tương tác và giám sát trực tiếp từ giáo viên', 'Môi trường ở nhà nhiều yếu tố gây xao nhãng', 'Không có bạn học cùng nên mất tính cạnh tranh, cộng đồng'],
    b: ['Học sinh nộp bài trễ, điểm thấp hơn, dễ bỏ khóa', 'Kỹ năng và kiến thức tiếp thu nông hơn', 'Cô lập xã hội, giảm gắn kết với trường lớp'],
    evidence: [
      { vi: 'Ví dụ, nhiều khóa học trực tuyến mở đại chúng (MOOC) có tỷ lệ hoàn thành dưới 10%, cho thấy phần lớn người học mất động lực và bỏ dở.',
        en: 'For example, many massive open online courses (MOOCs) have completion rates below 10%, showing that most learners lose motivation and give up.' },
      { vi: 'Một hệ quả thường thấy là học sinh yếu càng tụt lại xa hơn, vì các em cần sự nhắc nhở và hỗ trợ trực tiếp mà lớp học online khó cung cấp.',
        en: 'A common effect is that weaker students fall even further behind, because they need the direct reminders and support that an online classroom struggles to provide.' },
    ],
    conclusion: { vi: 'Tóm lại, việc thiếu tương tác trực tiếp và có quá nhiều yếu tố gây xao nhãng ở nhà là nguyên nhân chính khiến học sinh mất động lực khi học online, và điều này dẫn tới kết quả học tập kém hơn cùng nguy cơ bỏ học cao hơn.',
      en: 'In conclusion, the lack of direct interaction and the many distractions at home are the main causes of low motivation in online study, and this leads to poorer academic results and a higher risk of dropping out.' },
  },
  'Dropout Rates in Higher Education': {
    a: ['Chi phí học tập cao, sinh viên phải đi làm nhiều', 'Kỳ vọng không khớp thực tế chương trình học', 'Sức khỏe tinh thần: căng thẳng, cô đơn khi xa nhà'],
    b: ['Cá nhân mất cơ hội nghề nghiệp, mang nợ', 'Trường lãng phí chỗ học và nguồn lực giảng dạy', 'Xã hội thiếu lao động trình độ cao, tăng bất bình đẳng'],
    evidence: [
      { vi: 'Ví dụ, khảo sát ở nhiều nước châu Âu cho thấy sinh viên năm nhất là nhóm bỏ học nhiều nhất, chủ yếu vì "sốc" với cách học tự chủ ở đại học.',
        en: 'For example, surveys across several European countries show that first-year students are the group most likely to drop out, mainly because they are shocked by the independent style of learning at university.' },
      { vi: 'Về mặt xã hội, mỗi sinh viên bỏ học là một khoản đầu tư công bị lãng phí và một lao động trình độ cao mà nền kinh tế đáng lẽ có được.',
        en: 'In social terms, every student who drops out represents a wasted public investment and a skilled worker the economy should have gained.' },
    ],
    conclusion: { vi: 'Tóm lại, gánh nặng tài chính và sự chuẩn bị chưa đầy đủ cho môi trường đại học là những nguyên nhân chính của tình trạng bỏ học, gây thiệt hại cho cả sinh viên lẫn xã hội và cần được nhà trường lẫn chính phủ quan tâm.',
      en: 'In conclusion, financial pressure and inadequate preparation for university life are the main causes of rising dropout rates, and this harms both students and society, so it deserves the attention of universities and governments alike.' },
  },

  // ═══ WEEK 5 — Health · Cause & Solution ═══
  'Rise in Modern Mental Stress & Anxiety': {
    a: ['Áp lực công việc và tài chính, cạnh tranh gay gắt', 'Mạng xã hội: so sánh liên tục, quá tải thông tin', 'Cô lập xã hội, thiếu hỗ trợ từ cộng đồng'],
    b: ['Trường học, công ty cung cấp tư vấn tâm lý dễ tiếp cận', 'Giáo dục kỹ năng quản lý căng thẳng từ sớm', 'Giảm kỳ thị bệnh tâm lý qua truyền thông, chính sách'],
    evidence: [
      { vi: 'Ví dụ, Tổ chức Y tế Thế giới ước tính trầm cảm và rối loạn lo âu khiến kinh tế toàn cầu thiệt hại khoảng một nghìn tỷ đô la mỗi năm do năng suất lao động giảm.',
        en: 'For example, the World Health Organization estimates that depression and anxiety disorders cost the global economy around one trillion dollars a year in lost productivity.' },
      { vi: 'Một giải pháp đã chứng minh hiệu quả là các chương trình tư vấn tâm lý miễn phí trong trường học ở một số nước Bắc Âu, giúp phát hiện và hỗ trợ học sinh sớm.',
        en: 'One solution that has proved effective is the free school counselling programmes in some Nordic countries, which help to identify and support struggling students early.' },
    ],
    conclusion: { vi: 'Tóm lại, áp lực công việc cùng với ảnh hưởng tiêu cực của mạng xã hội là những nguyên nhân chính làm gia tăng căng thẳng và lo âu, nhưng việc cung cấp dịch vụ tư vấn dễ tiếp cận và dạy kỹ năng đối phó từ sớm có thể giúp cải thiện đáng kể sức khỏe tinh thần cộng đồng.',
      en: 'In conclusion, workplace pressure together with the negative effects of social media are the main causes of rising stress and anxiety, but providing accessible counselling and teaching coping skills from an early age can significantly improve public mental well-being.' },
  },
  'Urban Sedentary Lifestyle': {
    a: ['Công việc văn phòng, ngồi màn hình nhiều giờ', 'Đô thị thiếu vỉa hè, công viên, đường xe đạp an toàn', 'Phụ thuộc xe cá nhân, giải trí thụ động tại nhà'],
    b: ['Quy hoạch đô thị ưu tiên đi bộ, xe đạp, không gian xanh', 'Doanh nghiệp khuyến khích vận động: giờ nghỉ, phòng gym', 'Truyền thông và trường học nâng nhận thức về vận động'],
    evidence: [
      { vi: 'Ví dụ, Tổ chức Y tế Thế giới khuyến nghị mỗi người trưởng thành vận động ít nhất 150 phút ở mức trung bình mỗi tuần, nhưng phần lớn dân thành thị không đạt mức này.',
        en: 'For example, the World Health Organization recommends that every adult do at least 150 minutes of moderate physical activity a week, yet most city dwellers fail to meet this target.' },
      { vi: 'Một giải pháp thành công là mô hình của Hà Lan, nơi hàng chục năm đầu tư vào làn đường xe đạp riêng đã biến đạp xe thành phương tiện chính cho các chuyến đi ngắn.',
        en: 'One successful solution is the Dutch model, where decades of investment in dedicated cycle lanes have made cycling the main means of transport for short journeys.' },
    ],
    conclusion: { vi: 'Tóm lại, công việc ít vận động và một môi trường đô thị không thân thiện với người đi bộ là những nguyên nhân chính của lối sống thụ động, nhưng quy hoạch thành phố ưu tiên đi bộ và đạp xe cùng các chính sách khuyến khích tại nơi làm việc có thể thúc đẩy người dân vận động nhiều hơn.',
      en: 'In conclusion, sedentary work and an urban environment that is unfriendly to pedestrians are the main causes of an inactive lifestyle, but city planning that prioritises walking and cycling, along with workplace incentives, can encourage people to be far more active.' },
  },

  // ═══ WEEK 6 — Health · Cause & Solution ═══
  'Growing Rates of Childhood Obesity': {
    a: ['Đồ ăn nhanh, nước ngọt rẻ và quảng cáo tràn lan', 'Trẻ ngồi màn hình nhiều, ít chơi vận động', 'Cha mẹ bận rộn, thiếu bữa ăn nấu tại nhà'],
    b: ['Đánh thuế đồ uống có đường, hạn chế quảng cáo tới trẻ', 'Trường học cung cấp bữa ăn lành mạnh, tăng giờ thể dục', 'Giáo dục dinh dưỡng cho phụ huynh và học sinh'],
    evidence: [
      { vi: 'Ví dụ, sau khi Anh áp thuế đồ uống có đường năm 2018, nhiều nhà sản xuất đã thay đổi công thức để giảm lượng đường trong sản phẩm của họ.',
        en: 'For example, after the UK introduced a tax on sugary drinks in 2018, many manufacturers reformulated their products to contain less sugar.' },
      { vi: 'Tương tự, Chile dán nhãn cảnh báo màu đen lên thực phẩm nhiều đường và chất béo, và các nghiên cứu cho thấy lượng nước ngọt được mua đã giảm rõ rệt sau đó.',
        en: 'Similarly, Chile placed black warning labels on foods high in sugar and fat, and studies found that purchases of sugary drinks fell significantly afterwards.' },
    ],
    conclusion: { vi: 'Tóm lại, đồ ăn nhanh giá rẻ được quảng cáo mạnh cùng với lối sống ít vận động là những nguyên nhân chính của béo phì ở trẻ em, nhưng việc đánh thuế thực phẩm không lành mạnh, cải thiện bữa ăn học đường và giáo dục dinh dưỡng có thể giúp kiểm soát vấn đề này.',
      en: 'In conclusion, cheap, heavily advertised fast food together with inactive lifestyles are the main causes of childhood obesity, but taxing unhealthy food, improving school meals and teaching nutrition can help to bring the problem under control.' },
  },
  'Overreliance on Fast Food & Processed Foods': {
    a: ['Nhịp sống bận rộn, ít thời gian nấu ăn', 'Đồ ăn nhanh rẻ, tiện, có mặt khắp nơi', 'Kỹ năng nấu nướng mai một, marketing mạnh'],
    b: ['Nhà nước trợ giá rau củ, thực phẩm tươi', 'Dạy nấu ăn và dinh dưỡng trong trường học', 'Quy định nhãn dinh dưỡng rõ ràng, hạn chế quảng cáo'],
    evidence: [
      { vi: 'Ví dụ, nhiều thành phố đã xuất hiện "sa mạc thực phẩm" — khu dân cư thu nhập thấp gần như không có cửa hàng bán rau quả tươi, chỉ toàn cửa hàng tiện lợi và đồ ăn nhanh.',
        en: 'For example, many cities now have "food deserts" — low-income neighbourhoods with almost no shops selling fresh produce, only convenience stores and fast-food outlets.' },
      { vi: 'Một giải pháp được thử nghiệm là chương trình phiếu mua rau quả cho hộ nghèo ở Mỹ, giúp tăng đáng kể lượng thực phẩm tươi mà các gia đình này tiêu thụ.',
        en: 'One solution that has been trialled is a fruit-and-vegetable voucher scheme for low-income households in the United States, which significantly increased the amount of fresh food these families ate.' },
    ],
    conclusion: { vi: 'Tóm lại, lối sống bận rộn và sự tiện lợi giá rẻ của đồ ăn nhanh là những nguyên nhân chính khiến con người lệ thuộc vào thực phẩm chế biến sẵn, nhưng chính phủ và cộng đồng có thể ứng phó bằng cách trợ giá thực phẩm tươi, dạy kỹ năng nấu ăn và siết chặt quảng cáo.',
      en: 'In conclusion, busy lifestyles and the cheap convenience of fast food are the main causes of our reliance on processed food, but governments and communities can respond by subsidising fresh produce, teaching cooking skills and restricting advertising.' },
  },

  // ═══ WEEK 7 — Transport · Effect & Solution ═══
  'Severe Traffic Congestion in Urban Areas': {
    a: ['Mất thời gian, giảm năng suất, tăng căng thẳng', 'Ô nhiễm không khí và tiếng ồn, hại sức khỏe', 'Chi phí nhiên liệu và logistics tăng, kinh tế thiệt hại'],
    b: ['Đầu tư giao thông công cộng nhanh, đúng giờ', 'Thu phí vào trung tâm, hạn chế đỗ xe', 'Quy hoạch nén, làm việc từ xa, lệch giờ làm'],
    evidence: [
      { vi: 'Ví dụ, sau khi London áp dụng phí ùn tắc năm 2003, lượng xe vào trung tâm giảm khoảng 30% trong những năm đầu và tốc độ lưu thông được cải thiện rõ.',
        en: 'For example, after London introduced its congestion charge in 2003, traffic entering the city centre fell by around 30% in the first few years and journey speeds clearly improved.' },
      { vi: 'Về hệ quả kinh tế, các nghiên cứu ước tính ùn tắc khiến những đô thị lớn thiệt hại hàng tỷ đô la mỗi năm do thời gian bị lãng phí và nhiên liệu tiêu hao vô ích.',
        en: 'In terms of economic effects, studies estimate that congestion costs major cities billions of dollars a year in wasted time and fuel burned needlessly.' },
    ],
    conclusion: { vi: 'Tóm lại, ùn tắc giao thông gây ra những hệ quả nặng nề như lãng phí thời gian, ô nhiễm và thiệt hại kinh tế, nhưng chính phủ có thể giảm bớt bằng cách đầu tư mạnh cho giao thông công cộng và áp dụng phí vào trung tâm thành phố.',
      en: 'In conclusion, traffic congestion has serious effects such as wasted time, pollution and economic loss, but governments can ease it by investing heavily in public transport and charging drivers to enter city centres.' },
  },
  'Overreliance on Private Motor Vehicles': {
    a: ['Khí thải và ô nhiễm không khí tăng mạnh', 'Đường tắc, tai nạn nhiều, chiếm dụng không gian đô thị', 'Người dân ít vận động, phụ thuộc nhiên liệu hóa thạch'],
    b: ['Nâng cấp xe buýt, tàu điện: nhanh, rẻ, phủ rộng', 'Làn xe đạp, phố đi bộ, khu vực hạn chế ô tô', 'Ưu đãi vé tháng, thuế / phí với xe cá nhân'],
    evidence: [
      { vi: 'Ví dụ, thành phố Oslo của Na Uy đã gỡ bỏ gần như toàn bộ chỗ đỗ xe trên phố ở trung tâm và thay bằng làn xe đạp cùng không gian cho người đi bộ.',
        en: 'For example, the city of Oslo in Norway has removed almost all on-street parking from its centre and replaced it with cycle lanes and space for pedestrians.' },
      { vi: 'Về hệ quả môi trường, giao thông đường bộ là một trong những nguồn phát thải khí nhà kính lớn nhất ở nhiều quốc gia phát triển.',
        en: 'In terms of environmental effects, road transport is one of the largest sources of greenhouse-gas emissions in many developed countries.' },
    ],
    conclusion: { vi: 'Tóm lại, việc lệ thuộc vào xe cá nhân gây ra những hệ quả như ô nhiễm nặng, ùn tắc và lối sống ít vận động, nhưng các thành phố có thể khắc phục bằng cách xây dựng giao thông công cộng chất lượng cao và mạnh dạn hạn chế ô tô ở khu trung tâm.',
      en: 'In conclusion, over-dependence on private cars causes effects such as heavy pollution, congestion and inactive lifestyles, but cities can address these by building high-quality public transport and firmly restricting cars in central areas.' },
  },

  // ═══ WEEK 8 — Transport · Effect & Solution ═══
  'Rising Freight Transport by Heavy Trucks': {
    a: ['Phát thải CO2 và bụi mịn cao trên mỗi tấn hàng', 'Đường hư hỏng nhanh, chi phí bảo trì lớn', 'Tai nạn nghiêm trọng và tắc nghẽn trên cao tốc'],
    b: ['Chuyển hàng đường dài sang đường sắt và đường thủy', 'Tiêu chuẩn khí thải chặt, hỗ trợ xe tải điện', 'Quy hoạch trung tâm logistics, tối ưu tuyến vận chuyển'],
    evidence: [
      { vi: 'Ví dụ, Thụy Sĩ đã chuyển phần lớn hàng hóa nặng từ đường bộ sang đường sắt thông qua "Sáng kiến Alpine" để giảm ô nhiễm trong các thung lũng núi.',
        en: 'For example, Switzerland has shifted much of its heavy freight from road to rail through its "Alpine Initiative" in order to cut pollution in its mountain valleys.' },
      { vi: 'Về hệ quả, vận tải đường bộ hạng nặng làm mặt đường xuống cấp nhanh hơn nhiều so với xe con, buộc ngân sách công phải chi lớn cho sửa chữa.',
        en: 'As for the effects, heavy road freight wears out road surfaces far faster than cars do, forcing public budgets to spend heavily on repairs.' },
    ],
    conclusion: { vi: 'Tóm lại, việc vận chuyển hàng hóa bằng xe tải hạng nặng gây ra ô nhiễm, hư hại hạ tầng và tai nạn, nhưng những tác động này có thể được giảm bớt bằng cách chuyển hàng đường dài sang đường sắt và đường thủy cùng các tiêu chuẩn khí thải nghiêm ngặt hơn.',
      en: 'In conclusion, moving goods by heavy trucks causes pollution, infrastructure damage and accidents, but these impacts can be reduced by shifting long-distance freight to rail and water and by imposing stricter emissions standards.' },
  },
  'Decline in Walking and Cycling Habits': {
    a: ['Ít vận động hơn → béo phì, bệnh tim mạch tăng', 'Nhiều xe cơ giới hơn → ô nhiễm, ùn tắc, tai nạn', 'Đường phố kém sức sống, quan hệ cộng đồng suy giảm'],
    b: ['Xây làn xe đạp riêng, vỉa hè rộng, an toàn', 'Phố đi bộ, hạn chế tốc độ, ưu tiên người đi bộ', 'Chương trình "đi bộ đến trường", cho thuê xe đạp công cộng'],
    evidence: [
      { vi: 'Ví dụ, thành phố Copenhagen đã đầu tư nhiều thập kỷ vào hạ tầng xe đạp, và hiện nay phần lớn cư dân đạp xe đi làm hoặc đến trường mỗi ngày.',
        en: 'For example, the city of Copenhagen has invested for decades in cycling infrastructure, and today the majority of residents cycle to work or school every day.' },
      { vi: 'Về hệ quả, khi ít người đi bộ và đạp xe hơn, số phương tiện cơ giới trên đường tăng lên, kéo theo ô nhiễm không khí và nguy cơ tai nạn cao hơn.',
        en: 'As an effect, when fewer people walk and cycle, the number of motor vehicles on the road rises, bringing more air pollution and a higher risk of accidents.' },
    ],
    conclusion: { vi: 'Tóm lại, việc ít đi bộ và đạp xe khiến người dân kém khỏe mạnh hơn và làm giao thông đô thị thêm ô nhiễm, nhưng các nhà quy hoạch có thể đảo ngược xu hướng này bằng cách xây dựng làn đường an toàn, mở rộng phố đi bộ và triển khai chương trình xe đạp công cộng.',
      en: 'In conclusion, walking and cycling less makes people less healthy and makes urban transport more polluting, but planners can reverse this trend by building safe lanes, expanding pedestrian streets and running public bike-share schemes.' },
  },

  // ═══ WEEK 9 — Work · Agree or Disagree ═══
  'Shorter Work Week': {
    a: ['Nghỉ nhiều hơn → giảm kiệt sức, sức khỏe tốt hơn', 'Nhiều nghiên cứu cho thấy năng suất giữ nguyên hoặc tăng', 'Có thời gian cho gia đình, học tập, tình nguyện'],
    b: ['Một số ngành (y tế, dịch vụ) khó giảm giờ', 'Doanh nghiệp nhỏ lo tăng chi phí thuê thêm người', 'Nguy cơ dồn việc vào 4 ngày gây căng thẳng hơn'],
    evidence: [
      { vi: 'Ví dụ, một cuộc thử nghiệm quy mô lớn về tuần làm việc bốn ngày ở Iceland từ 2015 đến 2019 cho thấy năng suất giữ nguyên hoặc cải thiện trong khi người lao động ít căng thẳng hơn hẳn.',
        en: 'For example, a large-scale trial of a four-day working week in Iceland between 2015 and 2019 found that productivity stayed the same or improved while workers reported far less stress.' },
      { vi: 'Tương tự, nhiều công ty ở Anh tham gia thử nghiệm tuần bốn ngày năm 2022 đã quyết định duy trì vĩnh viễn vì doanh thu không giảm còn nhân viên hài lòng hơn.',
        en: 'Similarly, many UK companies that joined a four-day-week trial in 2022 chose to keep it permanently because revenue did not fall and staff were happier.' },
    ],
    conclusion: { vi: 'Tóm lại, mặc dù một số ngành đặc thù khó áp dụng, tôi đồng ý rằng tuần làm việc nên ngắn hơn, bởi các bằng chứng cho thấy điều này cải thiện sức khỏe và sự cân bằng cuộc sống của người lao động mà không làm giảm năng suất.',
      en: 'In conclusion, although some sectors would find it hard to apply, I agree that the working week should be shorter, because the evidence shows that this improves workers\' health and work-life balance without reducing productivity.' },
  },
  'Remote Work as the Future': {
    a: ['Tiết kiệm thời gian, chi phí đi lại; tuyển dụng toàn cầu', 'Công nghệ họp trực tuyến, đám mây đã đủ trưởng thành', 'Nhiều tập đoàn lớn cho phép làm từ xa lâu dài'],
    b: ['Nhiều công việc chân tay, dịch vụ phải làm tại chỗ', 'Khó gắn kết đội nhóm, đào tạo nhân viên mới', 'Ranh giới công việc – đời sống mờ đi, dễ kiệt sức'],
    evidence: [
      { vi: 'Ví dụ, sau năm 2020, các công ty như Twitter và Spotify đã thông báo cho nhân viên rằng họ có thể làm việc tại nhà vĩnh viễn nếu muốn.',
        en: 'For example, after 2020, companies such as Twitter and Spotify told their employees that they could work from home permanently if they wished.' },
      { vi: 'Tuy nhiên, phần lớn lực lượng lao động toàn cầu — công nhân nhà máy, nhân viên bán lẻ, y tá — làm những công việc về bản chất không thể thực hiện từ xa.',
        en: 'However, most of the global workforce — factory workers, retail staff, nurses — do jobs that by their nature cannot be done remotely.' },
    ],
    conclusion: { vi: 'Tóm lại, dù làm việc từ xa sẽ ngày càng phổ biến trong các ngành văn phòng, tôi không hoàn toàn đồng ý rằng nó sẽ trở thành cách làm việc chính của phần lớn mọi người, bởi vô số công việc thiết yếu vẫn buộc phải thực hiện trực tiếp.',
      en: 'In conclusion, although remote work will become increasingly common in office-based sectors, I do not fully agree that it will become the main way most people work, because countless essential jobs must still be carried out in person.' },
  },

  // ═══ WEEK 10 — Work · Agree or Disagree ═══
  'Job Satisfaction vs. Salary': {
    a: ['Ta dành phần lớn cuộc đời để làm việc → hài lòng quan trọng', 'Công việc chán gây căng thẳng, hại sức khỏe dù lương cao', 'Người hài lòng làm việc hiệu quả và gắn bó lâu hơn'],
    b: ['Lương thấp gây bất an tài chính, ảnh hưởng gia đình', 'Với người thu nhập thấp, tiền lương là ưu tiên sống còn', 'Lương cao mở ra cơ hội học tập, an cư, nghỉ hưu sớm'],
    evidence: [
      { vi: 'Ví dụ, nhiều khảo sát nơi làm việc cho thấy sau khi thu nhập đủ trang trải nhu cầu cơ bản, các yếu tố như ý nghĩa công việc và quan hệ đồng nghiệp mới quyết định mức độ gắn bó.',
        en: 'For example, many workplace surveys show that once income covers basic needs, factors such as a sense of purpose and good relationships with colleagues become the main drivers of staff loyalty.' },
      { vi: 'Mặt khác, với một lao động nuôi cả gia đình, một công việc lương cao nhưng ít thú vị vẫn có thể là lựa chọn hợp lý và có trách nhiệm hơn.',
        en: 'On the other hand, for a worker supporting a whole family, a well-paid but less enjoyable job can still be the more sensible and responsible choice.' },
    ],
    conclusion: { vi: 'Tóm lại, dù một mức lương ổn định là điều thiết yếu, tôi đồng ý rằng sự hài lòng trong công việc quan trọng hơn mức lương cao, bởi nó ảnh hưởng trực tiếp đến sức khỏe tinh thần và chất lượng cuộc sống lâu dài của một người.',
      en: 'In conclusion, although a stable salary is essential, I agree that job satisfaction matters more than a high salary, because it directly affects a person\'s long-term mental health and quality of life.' },
  },
  'Unenjoyable Employment vs. Unemployment': {
    a: ['Có việc vẫn đem lại thu nhập, kỹ năng, nề nếp', 'Thất nghiệp kéo dài gây trầm cảm, mất tự tin', 'Khoảng trống trong CV khiến khó xin việc sau này'],
    b: ['Công việc quá tệ có thể hại sức khỏe hơn cả thất nghiệp', 'Nghỉ tạm để học lại, đổi hướng có thể xứng đáng', 'Có tiết kiệm hoặc trợ cấp thì rủi ro thấp hơn'],
    evidence: [
      { vi: 'Ví dụ, các nghiên cứu tâm lý học lao động cho thấy thất nghiệp dài hạn là một trong những trải nghiệm làm giảm mức độ hài lòng với cuộc sống nhiều nhất, ngang với ly hôn hay mất người thân.',
        en: 'For example, studies in occupational psychology find that long-term unemployment is one of the experiences that lowers life satisfaction the most, comparable to divorce or bereavement.' },
      { vi: 'Tuy nhiên, cũng có bằng chứng cho thấy một môi trường làm việc độc hại, với sếp lạm quyền và giờ giấc khắc nghiệt, có thể gây hại cho sức khỏe tinh thần không kém gì việc không có việc làm.',
        en: 'However, there is also evidence that a toxic workplace, with an abusive manager and punishing hours, can be just as damaging to mental health as having no job at all.' },
    ],
    conclusion: { vi: 'Tóm lại, dù một công việc thực sự độc hại có thể là ngoại lệ, tôi không đồng ý rằng thất nghiệp nhìn chung tốt hơn một công việc không như ý, bởi thu nhập, kỹ năng và cấu trúc mà công việc mang lại thường quan trọng hơn.',
      en: 'In conclusion, although a genuinely toxic job may be an exception, I disagree that being unemployed is generally better than staying in an unenjoyable job, because the income, skills and structure that work provides usually matter more.' },
  },

  // ═══ WEEK 11 — Government spending · Discuss both views ═══
  'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes': {
    a: ['Trợ giá rau quả: giúp người nghèo mua được thực phẩm lành mạnh', 'Khuyến khích tích cực, không mang tính trừng phạt', 'Hỗ trợ nông dân địa phương'],
    b: ['Đánh thuế đồ ăn vặt: giảm tiêu thụ, tạo nguồn thu cho y tế', 'Bằng chứng thực tế cho thấy thuế đường làm giảm mua nước ngọt', 'Buộc nhà sản xuất đổi công thức, ít đường hơn'],
    evidence: [
      { vi: 'Ví dụ, sau khi Mexico áp thuế đồ uống có đường năm 2014, lượng nước ngọt được mua đã giảm khoảng 8% trong hai năm, mức giảm mạnh nhất ở nhóm hộ nghèo.',
        en: 'For example, after Mexico introduced a tax on sugary drinks in 2014, purchases of soft drinks fell by around 8% over two years, with the largest fall among low-income households.' },
      { vi: 'Ngược lại, những người phản đối cho rằng thuế đánh nặng nhất vào người nghèo, nên trợ giá thực phẩm tươi là cách công bằng hơn để hướng người dân tới chế độ ăn lành mạnh.',
        en: 'Conversely, opponents argue that such taxes hit the poor hardest, so subsidising fresh food is a fairer way to guide people towards a healthy diet.' },
    ],
    conclusion: { vi: 'Tóm lại, dù trợ giá thực phẩm lành mạnh giúp giảm gánh nặng cho người nghèo, tôi cho rằng đánh thuế đồ ăn vặt là chiến lược hiệu quả hơn, bởi bằng chứng thực tế cho thấy nó vừa giảm tiêu thụ vừa tạo nguồn thu để tài trợ cho các chương trình y tế.',
      en: 'In conclusion, although subsidising healthy food eases the burden on the poor, I believe taxing junk food is the more effective strategy, because real-world evidence shows that it both reduces consumption and raises revenue to fund health programmes.' },
  },
  'Funding Priorities: Free Public Libraries vs. Internet Infrastructure': {
    a: ['Thư viện miễn phí: không gian học tập, hỗ trợ người không có internet', 'Dịch vụ cho trẻ em, người già, người tìm việc', 'Bảo tồn văn hóa, tổ chức sự kiện cộng đồng'],
    b: ['Internet: ai cũng tra cứu được, chi phí thấp hơn về lâu dài', 'Nhiều người cho rằng thông tin trên mạng đã đủ dùng', 'Ngân sách công eo hẹp, cần ưu tiên hạ tầng số'],
    evidence: [
      { vi: 'Ví dụ, thư viện trung tâm mới của Helsinki mang tên "Oodi" đón hàng triệu lượt khách mỗi năm và cung cấp cả xưởng sáng chế, phòng thu và không gian làm việc, chứ không chỉ sách.',
        en: 'For example, Helsinki\'s new central library, "Oodi", attracts millions of visitors a year and offers workshops, recording studios and workspaces, not just books.' },
      { vi: 'Tuy vậy, những người ủng hộ đầu tư cho internet chỉ ra rằng ở nhiều vùng nông thôn, một đường truyền tốc độ cao sẽ giúp được nhiều người hơn là một tòa nhà thư viện duy nhất.',
        en: 'Even so, supporters of internet investment point out that in many rural areas a fast connection would help more people than a single library building.' },
    ],
    conclusion: { vi: 'Tóm lại, dù internet giúp thông tin dễ tiếp cận hơn, tôi tin rằng chính phủ vẫn nên tài trợ thư viện công miễn phí, bởi chúng cung cấp không gian, sự hướng dẫn và các dịch vụ cộng đồng mà một kết nối mạng đơn thuần không thể thay thế.',
      en: 'In conclusion, although the internet makes information more accessible, I believe governments should still fund free public libraries, because they provide the space, guidance and community services that a mere internet connection cannot replace.' },
  },

  // ═══ WEEK 12 — Government spending · Discuss both views ═══
  'National Fitness Funding: Elite Athletes vs. Grassroots Sports': {
    a: ['Đầu tư cho VĐV đỉnh cao: huy chương, niềm tự hào dân tộc', 'Ngôi sao thể thao truyền cảm hứng cho giới trẻ', 'Thu hút tài trợ, du lịch, sự kiện quốc tế'],
    b: ['Đầu tư cho thể thao cộng đồng: cả xã hội khỏe hơn', 'Giảm chi phí y tế nhờ dân vận động nhiều', 'Cơ sở công cộng phục vụ được nhiều người hơn'],
    evidence: [
      { vi: 'Ví dụ, sau khi Anh chi mạnh cho thể thao đỉnh cao trước Olympic London 2012, số huy chương tăng vọt nhưng tỷ lệ người trưởng thành tập thể dục thường xuyên gần như không đổi.',
        en: 'For example, after the UK spent heavily on elite sport before the London 2012 Olympics, its medal count soared but the share of adults who exercised regularly barely changed.' },
      { vi: 'Ngược lại, những người ủng hộ thể thao đỉnh cao lập luận rằng thành tích quốc tế tạo ra "hiệu ứng truyền cảm hứng", khiến nhiều trẻ em muốn tham gia các môn thể thao địa phương hơn.',
        en: 'Conversely, supporters of elite sport argue that international success creates an "inspiration effect" that makes more children want to take part in local sports.' },
    ],
    conclusion: { vi: 'Tóm lại, dù việc tài trợ cho vận động viên đỉnh cao đem lại niềm tự hào và hình mẫu, tôi cho rằng đầu tư vào các cơ sở thể thao cộng đồng là hướng đi hợp lý hơn, bởi nó cải thiện sức khỏe của toàn dân và giảm chi phí y tế về lâu dài.',
      en: 'In conclusion, although funding elite athletes brings pride and role models, I believe investing in community sports facilities is the wiser choice, because it improves the health of the whole population and lowers healthcare costs in the long run.' },
  },
  'Economic Support: Higher Education vs. Vocational Training': {
    a: ['Đại học: nghiên cứu, đổi mới, nâng trình độ quốc gia', 'Bằng cử nhân vẫn gắn với thu nhập cao hơn trung bình', 'Nền kinh tế tri thức cần nhiều lao động trình độ cao'],
    b: ['Đào tạo nghề: giải quyết ngay tình trạng thiếu thợ lành nghề', 'Thời gian học ngắn, chi phí thấp, việc làm chắc chắn', 'Không phải ai cũng hợp với con đường học thuật'],
    evidence: [
      { vi: 'Ví dụ, hệ thống "đào tạo kép" của Đức, kết hợp học lý thuyết với thực tập có lương tại doanh nghiệp, thường được ghi nhận là lý do nước này có tỷ lệ thất nghiệp ở thanh niên thấp.',
        en: 'For example, Germany\'s "dual system" of vocational training, which combines classroom study with paid apprenticeships at companies, is often credited with the country\'s low youth unemployment.' },
      { vi: 'Ngược lại, những người ủng hộ đại học chỉ ra rằng các quốc gia có tỷ lệ tốt nghiệp đại học cao thường thu hút được nhiều ngành công nghệ giá trị cao hơn.',
        en: 'Conversely, supporters of higher education point out that countries with high university-completion rates tend to attract more high-value technology industries.' },
    ],
    conclusion: { vi: 'Tóm lại, dù giáo dục đại học là nền tảng cho nghiên cứu và đổi mới, tôi cho rằng chính phủ nên dành nhiều nguồn lực hơn cho đào tạo nghề, bởi nó giải quyết trực tiếp tình trạng thiếu lao động lành mạnh và mở ra việc làm ổn định cho nhiều người hơn.',
      en: 'In conclusion, although higher education underpins research and innovation, I believe governments should devote more resources to vocational training, because it directly tackles skills shortages and opens up stable jobs for a wider range of people.' },
  },

  // ═══ WEEK 13 — Environment · Positive or Negative Development ═══
  'Rise in Eco-Tourism': {
    a: ['Tạo thu nhập gắn với việc bảo tồn thiên nhiên', 'Nâng nhận thức của du khách về môi trường', 'Việc làm cho cộng đồng địa phương ở vùng xa'],
    b: ['Quá tải du khách phá vỡ hệ sinh thái mong manh', 'Nhiều tour "xanh" chỉ là chiêu marketing (greenwashing)', 'Lợi nhuận chảy về công ty lớn, không về dân bản địa'],
    evidence: [
      { vi: 'Ví dụ, Costa Rica đã xây dựng ngành du lịch quanh việc bảo vệ rừng nhiệt đới, và nguồn thu từ du lịch sinh thái đã giúp nước này đảo ngược nạn phá rừng.',
        en: 'For example, Costa Rica has built its tourism industry around protecting its rainforests, and revenue from eco-tourism has helped the country reverse deforestation.' },
      { vi: 'Tuy nhiên, ở một số điểm nóng, lượng khách tăng quá nhanh đã làm xói mòn đường mòn, quấy nhiễu động vật hoang dã và đẩy giá sinh hoạt của người dân địa phương lên cao.',
        en: 'However, at some hotspots, visitor numbers have risen so fast that they have eroded trails, disturbed wildlife and pushed up the cost of living for local residents.' },
    ],
    conclusion: { vi: 'Tóm lại, dù du lịch sinh thái có nguy cơ gây quá tải cho những vùng thiên nhiên nhạy cảm, về tổng thể đây là một xu hướng tích cực, bởi nó gắn thu nhập với việc bảo tồn và nâng cao ý thức môi trường cho cả du khách lẫn cộng đồng địa phương.',
      en: 'In conclusion, although eco-tourism risks overwhelming sensitive natural areas, on balance it is a positive development, because it links income to conservation and raises environmental awareness among both visitors and local communities.' },
  },
  'Transition to Electric Vehicles': {
    a: ['Giảm khí thải và ô nhiễm không khí ở đô thị', 'Giảm phụ thuộc nhiên liệu hóa thạch nhập khẩu', 'Chi phí vận hành và bảo trì thấp hơn về lâu dài'],
    b: ['Khai thác lithium, cobalt gây hại môi trường', 'Điện sạc có thể vẫn đến từ than nếu lưới điện chưa xanh', 'Giá xe cao, hạ tầng sạc thiếu ở nước đang phát triển'],
    evidence: [
      { vi: 'Ví dụ, ở Na Uy, các ưu đãi thuế hào phóng đã đưa xe điện lên tới hơn 80% doanh số ô tô mới, mức cao nhất thế giới.',
        en: 'For example, in Norway, generous tax incentives have pushed electric vehicles to more than 80% of new car sales, the highest share in the world.' },
      { vi: 'Tuy vậy, các nhà phê bình lưu ý rằng lợi ích khí hậu của xe điện phụ thuộc vào việc điện được sản xuất như thế nào; nếu lưới điện vẫn chủ yếu chạy bằng than thì mức giảm phát thải là hạn chế.',
        en: 'Even so, critics note that the climate benefit of electric cars depends on how the electricity is produced; if the grid still runs mainly on coal, the reduction in emissions is limited.' },
    ],
    conclusion: { vi: 'Tóm lại, dù việc sản xuất pin và nguồn điện còn nhiều vấn đề, việc chuyển sang xe điện về tổng thể là một bước phát triển tích cực, bởi nó cắt giảm ô nhiễm không khí đô thị và giảm sự lệ thuộc vào nhiên liệu hóa thạch.',
      en: 'In conclusion, although battery production and electricity sources remain problematic, the shift to electric vehicles is on balance a positive development, because it cuts urban air pollution and reduces dependence on fossil fuels.' },
  },

  // ═══ WEEK 14 — Environment · Positive or Negative Development ═══
  'Growth of Renewable Energy Infrastructure': {
    a: ['Giảm phát thải khí nhà kính, chống biến đổi khí hậu', 'An ninh năng lượng: không phụ thuộc dầu khí nhập khẩu', 'Tạo việc làm mới trong ngành năng lượng sạch'],
    b: ['Điện gió, mặt trời không ổn định, cần lưu trữ pin lớn', 'Chi phí đầu tư ban đầu cao, cần trợ cấp', 'Tấm pin, tua-bin chiếm đất và tạo rác thải cuối vòng đời'],
    evidence: [
      { vi: 'Ví dụ, năm 2023, lần đầu tiên các nguồn tái tạo tạo ra nhiều điện hơn nhiên liệu hóa thạch trong toàn Liên minh châu Âu.',
        en: 'For example, in 2023, renewable sources generated more electricity than fossil fuels across the European Union for the first time.' },
      { vi: 'Tuy nhiên, các chuyên gia lưới điện cảnh báo rằng nếu không đầu tư song song vào công nghệ lưu trữ, việc phụ thuộc vào điện gió và mặt trời có thể gây mất điện khi thời tiết bất lợi.',
        en: 'However, grid experts warn that without parallel investment in storage technology, reliance on wind and solar power can cause blackouts in unfavourable weather.' },
    ],
    conclusion: { vi: 'Tóm lại, dù năng lượng tái tạo còn thách thức về tính ổn định và chi phí, việc mở rộng hạ tầng này là một bước phát triển tích cực, bởi nó là cách thực tế nhất để cắt giảm khí thải và tăng cường an ninh năng lượng quốc gia.',
      en: 'In conclusion, although renewable energy still faces challenges of reliability and cost, expanding this infrastructure is a positive development, because it is the most practical way to cut emissions and strengthen a country\'s energy security.' },
  },
  'Conversion of Urban Spaces to Local Community Gardens': {
    a: ['Cung cấp rau sạch, cải thiện an ninh lương thực khu phố', 'Gắn kết cộng đồng, giảm cô lập, dạy trẻ về tự nhiên', 'Tăng mảng xanh, giảm hiệu ứng đảo nhiệt đô thị'],
    b: ['Đất đô thị khan hiếm, có thể dùng xây nhà ở giá rẻ', 'Vườn dễ bị bỏ hoang nếu thiếu người duy trì', 'Sản lượng nhỏ, khó giải quyết nhu cầu thực phẩm quy mô lớn'],
    evidence: [
      { vi: 'Ví dụ, ở các thành phố như Detroit, người dân đã biến hàng nghìn lô đất bỏ trống thành vườn cộng đồng cung cấp rau tươi cho khu dân cư địa phương.',
        en: 'For example, in cities such as Detroit, residents have turned thousands of vacant lots into community gardens that supply fresh vegetables to local neighbourhoods.' },
      { vi: 'Mặt khác, ở những đô thị đang thiếu nhà ở trầm trọng, một số ý kiến cho rằng cùng mảnh đất đó nên được ưu tiên để xây căn hộ giá phải chăng.',
        en: 'On the other hand, in cities facing a severe housing shortage, some argue that the same land should be prioritised for building affordable flats.' },
    ],
    conclusion: { vi: 'Tóm lại, dù đất đô thị luôn khan hiếm, việc chuyển đổi các không gian bỏ trống thành vườn cộng đồng nhìn chung là một bước phát triển tích cực, bởi nó cung cấp thực phẩm tươi, tăng mảng xanh và gắn kết cư dân với nhau.',
      en: 'In conclusion, although urban land is always scarce, turning unused spaces into community gardens is on balance a positive development, because it provides fresh food, adds greenery and brings residents together.' },
  },

  // ═══ WEEK 15 — Revision (mixed) ═══
  'Public vs. Private Healthcare': {
    a: ['Y tế công: mọi người được chăm sóc dù giàu hay nghèo', 'Chi phí quản lý thấp hơn, thương lượng giá thuốc tốt hơn', 'Chú trọng phòng bệnh và sức khỏe cộng đồng'],
    b: ['Y tế tư: cạnh tranh có thể rút ngắn thời gian chờ', 'Có thêm nguồn lực và công nghệ mới', 'Nhưng dễ ưu tiên lợi nhuận hơn nhu cầu bệnh nhân'],
    evidence: [
      { vi: 'Ví dụ, các nghiên cứu so sánh cho thấy nước Mỹ, nơi y tế do tư nhân dẫn dắt, chi cho y tế bình quân đầu người cao hơn hẳn nhưng tuổi thọ trung bình lại thấp hơn nhiều nước có hệ thống công.',
        en: 'For example, comparative studies show that the United States, where healthcare is led by private companies, spends far more per person on health yet has a lower average life expectancy than many countries with public systems.' },
      { vi: 'Ngược lại, những người ủng hộ y tế tư cho rằng ở các nước có hệ thống công quá tải, phòng khám tư giúp giảm thời gian chờ cho những ai có khả năng chi trả.',
        en: 'Conversely, supporters of private healthcare argue that in countries with overstretched public systems, private clinics reduce waiting times for those who can afford to pay.' },
    ],
    conclusion: { vi: 'Tóm lại, dù các bệnh viện tư có thể bổ sung nguồn lực và rút ngắn thời gian chờ, tôi cho rằng nhược điểm của một hệ thống y tế vì lợi nhuận lớn hơn ưu điểm, bởi nó có xu hướng đặt khả năng chi trả lên trên nhu cầu chữa bệnh.',
      en: 'In conclusion, although private hospitals can add resources and cut waiting times, I believe the disadvantages of a profit-driven healthcare system outweigh the advantages, because it tends to put ability to pay above medical need.' },
  },
  'Consumerism and Society': {
    a: ['Tiêu dùng nhiều thúc đẩy tăng trưởng và việc làm', 'Người dân tiếp cận nhiều hàng hóa, tiện nghi hơn', 'Cạnh tranh thúc đẩy đổi mới sản phẩm'],
    b: ['Rác thải và khai thác tài nguyên tăng, hại môi trường', 'Văn hóa "mua sắm" gây nợ nần, so sánh, bất mãn', 'Đồ dùng nhanh hỏng, "thời trang nhanh" lãng phí'],
    evidence: [
      { vi: 'Ví dụ, hãng tư vấn McKinsey ước tính người tiêu dùng ngày nay mua nhiều quần áo hơn khoảng 60% so với 15 năm trước nhưng giữ mỗi món chỉ bằng một nửa thời gian.',
        en: 'For example, the consultancy McKinsey estimates that consumers today buy around 60% more clothing than 15 years ago but keep each item for only half as long.' },
      { vi: 'Mặt khác, những người ủng hộ tiêu dùng cho rằng nhu cầu mua sắm mạnh giúp duy trì hàng triệu việc làm trong sản xuất, bán lẻ và vận tải.',
        en: 'On the other hand, supporters of consumer spending argue that strong demand keeps millions of jobs in manufacturing, retail and transport.' },
    ],
    conclusion: { vi: 'Tóm lại, dù việc mua sắm nhiều giúp duy trì tăng trưởng và việc làm, tôi cho rằng đây phần lớn là một xu hướng tiêu cực, bởi nó tạo ra lượng rác thải khổng lồ, khai thác tài nguyên quá mức và nuôi dưỡng một lối sống chạy theo vật chất.',
      en: 'In conclusion, although buying more sustains growth and employment, I believe this is largely a negative development, because it creates enormous waste, over-exploits natural resources and fosters a materialistic way of life.' },
  },

  // ═══ WEEK 16 — Revision (mixed) ═══
  'Government Funding for the Arts': {
    a: ['Nghệ thuật là di sản văn hóa, cần bảo tồn cho thế hệ sau', 'Bảo tàng, nhà hát thu hút du lịch, tái sinh kinh tế địa phương', 'Nghệ thuật trong trường học phát triển tư duy sáng tạo'],
    b: ['Y tế và giáo dục là nhu cầu cấp thiết hơn với đa số dân', 'Nghệ thuật có thể tự huy động tài trợ tư nhân, vé', 'Ngân sách công eo hẹp buộc phải chọn ưu tiên'],
    evidence: [
      { vi: 'Ví dụ, sau khi bảo tàng Guggenheim mở tại Bilbao (Tây Ban Nha), thành phố này thu hút hàng triệu du khách mỗi năm và cả một khu vực suy thoái đã được hồi sinh — hiện tượng được gọi là "hiệu ứng Bilbao".',
        en: 'For example, after the Guggenheim Museum opened in Bilbao, Spain, the city attracted millions of tourists a year and a whole declining area was regenerated — an effect now known as the "Bilbao effect".' },
      { vi: 'Ngược lại, những người phản đối cho rằng ở một quốc gia có bệnh viện quá tải, khoản tiền tương tự sẽ cứu được nhiều mạng người hơn nếu chi cho y tế.',
        en: 'Conversely, opponents argue that in a country with overcrowded hospitals, the same money would save more lives if it were spent on healthcare.' },
    ],
    conclusion: { vi: 'Tóm lại, dù chi tiêu cho y tế và giáo dục rõ ràng là cấp thiết, tôi cho rằng chính phủ vẫn nên tài trợ cho nghệ thuật ở một mức hợp lý, bởi nghệ thuật gìn giữ bản sắc văn hóa và có thể mang lại lợi ích kinh tế đáng kể cho địa phương.',
      en: 'In conclusion, although spending on healthcare and education is clearly pressing, I believe governments should still fund the arts at a reasonable level, because the arts preserve cultural identity and can bring significant economic benefits to local areas.' },
  },
  'Youth Crime and Solutions': {
    a: ['Nghèo đói, thất học, gia đình tan vỡ', 'Thiếu sân chơi lành mạnh, bị nhóm xấu lôi kéo', 'Ảnh hưởng từ bạo lực trên mạng và thiếu hình mẫu tốt'],
    b: ['Đầu tư phòng ngừa: giáo dục, việc làm, hoạt động cộng đồng', 'Xử lý theo hướng phục hồi thay vì chỉ bỏ tù', 'Hỗ trợ gia đình, tư vấn tâm lý sớm cho trẻ có nguy cơ'],
    evidence: [
      { vi: 'Ví dụ, Scotland đã giảm mạnh tội phạm bạo lực ở thanh thiếu niên bằng cách coi bạo lực dao là một vấn đề y tế công cộng và đầu tư vào phòng ngừa thay vì chỉ tăng án tù.',
        en: 'For example, Scotland sharply reduced violent youth crime by treating knife crime as a public-health problem and investing in prevention rather than only longer prison sentences.' },
      { vi: 'Một nguyên nhân thường được nêu là sự thiếu vắng cơ hội: nơi nào có ít việc làm và hoạt động cho thanh niên, nơi đó tỷ lệ phạm tội ở lứa tuổi này thường cao hơn.',
        en: 'One frequently cited cause is a lack of opportunity: where there are few jobs and activities for young people, youth crime rates tend to be higher.' },
    ],
    conclusion: { vi: 'Tóm lại, đói nghèo và thiếu cơ hội là những nguyên nhân chính khiến tội phạm vị thành niên gia tăng, và cách xử lý hiệu quả nhất là kết hợp các chương trình phòng ngừa với hình phạt mang tính phục hồi thay vì chỉ dựa vào nhà tù.',
      en: 'In conclusion, poverty and a lack of opportunity are the main causes of rising youth crime, and the most effective response is to combine prevention programmes with rehabilitative punishment rather than relying on prison alone.' },
  },

  // ═══ WEEK 17 — Revision (mixed) ═══
  'Prison vs. Rehabilitation': {
    a: ['Bỏ tù mọi tội phạm: răn đe, cách ly người nguy hiểm', 'Thể hiện xã hội xử nghiêm, an lòng nạn nhân', 'Nhưng nhà tù quá tải và tốn kém ngân sách'],
    b: ['Với tội nhẹ: lao động công ích, quản chế, cai nghiện', 'Tập trung phục hồi giúp giảm tái phạm', 'Rẻ hơn và giữ người phạm tội gắn với gia đình, việc làm'],
    evidence: [
      { vi: 'Ví dụ, hệ thống nhà tù của Na Uy tập trung vào phục hồi thay vì trừng phạt, và nước này có một trong những tỷ lệ tái phạm thấp nhất thế giới.',
        en: 'For example, Norway\'s prison system focuses on rehabilitation rather than punishment, and the country has one of the lowest reoffending rates in the world.' },
      { vi: 'Ngược lại, những người ủng hộ án tù nghiêm khắc cho rằng với tội phạm bạo lực, việc cách ly là cần thiết để bảo vệ cộng đồng bất kể chi phí.',
        en: 'Conversely, supporters of tough prison sentences argue that for violent offenders, removing them from society is necessary to protect the public whatever the cost.' },
    ],
    conclusion: { vi: 'Tóm lại, dù việc giam giữ là cần thiết với những tội phạm nguy hiểm, tôi cho rằng đối với các tội nhẹ, những biện pháp thay thế như lao động công ích thuyết phục hơn, bởi chúng ít tốn kém hơn và bằng chứng cho thấy chúng giúp giảm tái phạm.',
      en: 'In conclusion, although imprisonment is necessary for dangerous offenders, I believe that for minor crimes, alternatives such as community service are more convincing, because they are less costly and the evidence shows they help to reduce reoffending.' },
  },

  // ═══ WEEK 18 — Translation drills by theme ═══
  'Dịch Câu - Môi Trường & Khí Hậu': {
    a: ['Đốt nhiên liệu hóa thạch, phá rừng, công nghiệp', 'Phát thải giao thông, nông nghiệp thâm canh', 'Tiêu dùng quá mức, lãng phí năng lượng'],
    b: ['Chuyển sang năng lượng tái tạo, tiết kiệm điện', 'Hợp tác quốc tế, đánh thuế carbon', 'Trồng rừng, giao thông công cộng, kinh tế tuần hoàn'],
    evidence: [
      { vi: 'Ví dụ, Thỏa thuận Paris năm 2015 là lần đầu tiên gần như mọi quốc gia trên thế giới cùng cam kết giới hạn mức tăng nhiệt độ toàn cầu.',
        en: 'For example, the 2015 Paris Agreement was the first time that almost every country in the world jointly committed to limiting the rise in global temperatures.' },
      { vi: 'Tổ chức Y tế Thế giới ước tính ô nhiễm không khí, phần lớn do đốt nhiên liệu hóa thạch, góp phần gây ra khoảng bảy triệu ca tử vong sớm mỗi năm trên toàn cầu.',
        en: 'The World Health Organization estimates that air pollution, largely from burning fossil fuels, contributes to around seven million premature deaths worldwide every year.' },
    ],
    conclusion: { vi: 'Tóm lại, việc đốt nhiên liệu hóa thạch và nạn phá rừng là những nguyên nhân chính của ô nhiễm và biến đổi khí hậu, nhưng chuyển dịch sang năng lượng sạch cùng với hợp tác quốc tế mạnh mẽ có thể giúp giải quyết những vấn đề này.',
      en: 'In conclusion, burning fossil fuels and clearing forests are the main causes of pollution and climate change, but shifting to clean energy and stronger international cooperation can help to solve these problems.' },
  },
  'Dịch Câu - Công Nghệ & Truyền Thông': {
    a: ['Tiếp cận thông tin, học tập, dịch vụ nhanh và rẻ', 'Kết nối con người xuyên biên giới, làm việc từ xa', 'Tự động hóa nâng cao năng suất'],
    b: ['Tin giả, nghiện mạng, xói mòn quyền riêng tư', 'Mất việc do tự động hóa, khoảng cách số', 'Giao tiếp trực tiếp và chiều sâu suy giảm'],
    evidence: [
      { vi: 'Ví dụ, một nghiên cứu của MIT phát hiện tin giả lan trên mạng xã hội nhanh hơn và xa hơn tin thật khoảng sáu lần.',
        en: 'For example, an MIT study found that false news spreads on social media roughly six times faster and further than true news.' },
      { vi: 'Mặt khác, các nền tảng học trực tuyến như Khan Academy cung cấp bài giảng miễn phí cho hàng triệu học sinh ở những nơi thiếu trường lớp chất lượng.',
        en: 'On the other hand, online learning platforms such as Khan Academy provide free lessons to millions of students in places that lack good schools.' },
    ],
    conclusion: { vi: 'Tóm lại, dù công nghệ và truyền thông hiện đại làm nảy sinh những vấn đề như tin giả và nghiện màn hình, khả năng kết nối con người và mở rộng tiếp cận tri thức khiến lợi ích của sự phát triển này lớn hơn tác hại.',
      en: 'In conclusion, although modern technology and media create problems such as misinformation and screen addiction, their power to connect people and widen access to knowledge means that the benefits of this development outweigh the drawbacks.' },
  },
  'Dịch Câu - Giáo Dục & Thanh Niên': {
    a: ['Áp lực thi cử, kỳ vọng cao từ gia đình và xã hội', 'Chương trình nặng lý thuyết, thiếu kỹ năng thực tế', 'Cạnh tranh việc làm và thay đổi công nghệ nhanh'],
    b: ['Học sinh căng thẳng, mất động lực, sức khỏe tinh thần kém', 'Kỹ năng không khớp nhu cầu thị trường lao động', 'Cần cải cách chương trình, dạy tư duy phản biện và nghề'],
    evidence: [
      { vi: 'Ví dụ, ở Hàn Quốc, phần lớn học sinh học thêm tại các trung tâm tư ("hagwon") đến tận khuya, đến mức chính phủ phải áp lệnh giới nghiêm với các trung tâm này để giảm áp lực.',
        en: 'For example, in South Korea most students attend private academies ("hagwons") until late at night, to the point that the government has imposed a curfew on them to reduce pressure.' },
      { vi: 'Ngược lại, Phần Lan giao ít bài tập về nhà và hầu như không tổ chức thi chuẩn hóa, nhưng học sinh nước này vẫn thường xuyên đứng đầu các bảng xếp hạng giáo dục quốc tế.',
        en: 'Conversely, Finland sets little homework and holds almost no standardised tests, yet its students regularly rank among the best in international education league tables.' },
    ],
    conclusion: { vi: 'Tóm lại, áp lực thi cử và một chương trình học nặng lý thuyết là những nguyên nhân chính khiến hệ thống giáo dục quá tải, và điều này gây ra căng thẳng cho học sinh cùng khoảng cách giữa kỹ năng được đào tạo và nhu cầu thực tế của xã hội.',
      en: 'In conclusion, exam pressure and a theory-heavy curriculum are the main causes of strain on the education system, and this leads to stress for students and a gap between the skills that are taught and what society actually needs.' },
  },
  'Dịch Câu - Sức Khỏe & Đô Thị Hóa': {
    a: ['Ô nhiễm không khí, tiếng ồn, thiếu không gian xanh', 'Nhà ở chật chội, áp lực sống, ít vận động', 'Chênh lệch tiếp cận dịch vụ y tế giữa các khu vực'],
    b: ['Quy hoạch xanh: công viên, đường đi bộ, xe đạp', 'Đầu tư giao thông công cộng, kiểm soát khí thải', 'Mở rộng y tế cơ sở, chương trình sức khỏe cộng đồng'],
    evidence: [
      { vi: 'Ví dụ, Liên Hợp Quốc dự báo đến năm 2050 khoảng hai phần ba dân số thế giới sẽ sống ở đô thị, tạo áp lực lớn lên hạ tầng và sức khỏe của cư dân.',
        en: 'For example, the United Nations projects that by 2050 around two thirds of the world\'s population will live in cities, placing great pressure on infrastructure and residents\' health.' },
      { vi: 'Tổ chức Y tế Thế giới ước tính ô nhiễm không khí ở đô thị góp phần gây ra hàng triệu ca bệnh hô hấp và tim mạch mỗi năm.',
        en: 'The World Health Organization estimates that urban air pollution contributes to millions of cases of respiratory and cardiovascular disease every year.' },
    ],
    conclusion: { vi: 'Tóm lại, đô thị hóa nhanh gây ra những hệ quả nghiêm trọng cho sức khỏe như ô nhiễm không khí và lối sống chật chội, ít vận động, nhưng chính phủ có thể giảm bớt bằng cách quy hoạch nhiều không gian xanh và đầu tư mạnh cho giao thông công cộng.',
      en: 'In conclusion, rapid urbanisation has serious effects on health such as air pollution and cramped, inactive lifestyles, but governments can reduce these by planning more green space and investing heavily in public transport.' },
  },
  'Dịch Câu - Kinh Tế & Toàn Cầu Hóa': {
    a: ['Đưa hàng trăm triệu người thoát nghèo, tăng thương mại', 'Chuyển giao công nghệ, tạo việc làm, hạ giá hàng hóa', 'Kết nối văn hóa, tri thức toàn cầu'],
    b: ['Bất bình đẳng gia tăng, việc làm dịch chuyển ra nước ngoài', 'Ô nhiễm và khai thác tài nguyên ở nước sản xuất', 'Bản sắc văn hóa địa phương bị mai một'],
    evidence: [
      { vi: 'Ví dụ, kể từ khi gia nhập Tổ chức Thương mại Thế giới năm 2001, Trung Quốc đã đưa hàng trăm triệu người thoát khỏi đói nghèo, nhưng sự bùng nổ sản xuất cũng gây ô nhiễm không khí nghiêm trọng.',
        en: 'For example, since joining the World Trade Organization in 2001, China has lifted hundreds of millions of people out of poverty, but its manufacturing boom has also caused severe air pollution.' },
      { vi: 'Mặt khác, nhiều cộng đồng ở các nước phát triển đã chứng kiến nhà máy đóng cửa khi sản xuất được chuyển sang những nơi có chi phí lao động thấp hơn.',
        en: 'On the other hand, many communities in developed countries have seen factories close as production moved to places with lower labour costs.' },
    ],
    conclusion: { vi: 'Tóm lại, dù toàn cầu hóa đã giúp giảm nghèo và thúc đẩy tăng trưởng ở nhiều nơi, tôi đồng ý rằng tác động của nó không phải lúc nào cũng tích cực, bởi nó cũng làm gia tăng bất bình đẳng, gây ô nhiễm và đe dọa các nền văn hóa địa phương.',
      en: 'In conclusion, although globalisation has reduced poverty and driven growth in many places, I agree that its effects are not always positive, because it also widens inequality, causes pollution and threatens local cultures.' },
  },

  // ═══ EXTRA topics added via the admin panel (not in seedTask2Exercises.js's
  //     `topics` array) — augmented separately by scripts/augmentExtraTask2Topics.js ═══
  'Decline in Reading Habits': {
    a: ['Vốn từ, kiến thức nền và khả năng tập trung của giới trẻ giảm', 'Kỹ năng viết và tư duy phản biện yếu đi', 'Ít đồng cảm và hiểu biết văn hóa hơn khi thiếu tiếp xúc văn học'],
    b: ['Trường học và thư viện tổ chức câu lạc bộ đọc, giờ đọc tự do', 'Quảng bá sách qua mạng xã hội, người có ảnh hưởng, ứng dụng đọc', 'Cha mẹ làm gương và đọc cùng con từ nhỏ'],
    evidence: [
      { vi: 'Ví dụ, các khảo sát của OECD cho thấy học sinh thường xuyên đọc sách để giải trí đạt điểm đọc hiểu cao hơn hẳn, bất kể hoàn cảnh gia đình.',
        en: 'For example, OECD surveys show that students who regularly read for pleasure score markedly higher in reading comprehension, regardless of their family background.' },
      { vi: 'Một giải pháp hiệu quả là chương trình "đọc thầm 20 phút mỗi ngày" được nhiều trường áp dụng, giúp biến việc đọc thành thói quen thay vì một nhiệm vụ.',
        en: 'One effective solution is the "20 minutes of silent reading a day" programme used by many schools, which turns reading into a habit rather than a chore.' },
    ],
    conclusion: { vi: 'Tóm lại, việc giới trẻ đọc ít sách hơn làm suy giảm vốn từ, khả năng tập trung và tư duy phản biện của cả một thế hệ, nhưng nhà trường và gia đình có thể đảo ngược xu hướng này bằng cách tạo thói quen đọc mỗi ngày và quảng bá sách qua các kênh mà người trẻ yêu thích.',
      en: 'In conclusion, young people reading fewer books weakens a whole generation\'s vocabulary, concentration and critical thinking, but schools and families can reverse this trend by building a daily reading habit and promoting books through the channels young people already use.' },
  },
  'Academic Pressure on Teenagers': {
    a: ['Kỳ vọng cao từ cha mẹ và văn hóa coi trọng bằng cấp', 'Thi cử quyết định, xếp hạng, cạnh tranh vào trường tốt', 'Mạng xã hội khuếch đại việc so sánh thành tích'],
    b: ['Giảm số kỳ thi quyết định, đánh giá đa dạng hơn (dự án, quá trình)', 'Trường cung cấp tư vấn tâm lý và dạy kỹ năng quản lý căng thẳng', 'Giáo dục cha mẹ về tác hại của việc tạo áp lực quá mức'],
    evidence: [
      { vi: 'Ví dụ, ở Hàn Quốc, chính phủ đã áp lệnh giới nghiêm với các trung tâm luyện thi tư nhân sau 22 giờ để giảm bớt áp lực học tập lên học sinh.',
        en: 'For example, in South Korea the government has imposed a 10 p.m. curfew on private cram schools in an attempt to ease the academic pressure on students.' },
      { vi: 'Ngược lại, Phần Lan giao rất ít bài tập về nhà và gần như không tổ chức thi chuẩn hóa, nhưng học sinh nước này vẫn thường xuyên nằm trong nhóm dẫn đầu thế giới.',
        en: 'Conversely, Finland sets very little homework and holds almost no standardised tests, yet its students consistently rank among the best in the world.' },
    ],
    conclusion: { vi: 'Tóm lại, kỳ vọng cao của gia đình và một hệ thống thi cử quá coi trọng điểm số là những nguyên nhân chính gây áp lực học tập lên thanh thiếu niên, nhưng việc giảm bớt các kỳ thi quyết định, đánh giá đa dạng hơn và hỗ trợ tâm lý trong trường học có thể làm giảm đáng kể áp lực này.',
      en: 'In conclusion, high family expectations and an exam system that overvalues grades are the main causes of the academic pressure on teenagers, but reducing high-stakes exams, using more varied assessment and providing counselling in schools can significantly ease it.' },
  },
  'Individual vs. Government Responsibility': {
    a: ['Chỉ chính phủ và tập đoàn lớn mới tạo được thay đổi ở quy mô cần thiết', 'Hành động cá nhân quá nhỏ so với phát thải công nghiệp', 'Thiếu chính sách thì nỗ lực cá nhân dễ nản và không bền'],
    b: ['Hàng triệu lựa chọn cá nhân cộng lại tạo ra tác động lớn', 'Người dân thay đổi tạo áp lực buộc doanh nghiệp, chính phủ hành động', 'Thói quen tiêu dùng xanh lan tỏa qua cộng đồng và thế hệ sau'],
    evidence: [
      { vi: 'Ví dụ, phần lớn khí thải nhà kính toàn cầu đến từ một số ít tập đoàn nhiên liệu hóa thạch, nên nếu không có quy định của chính phủ thì hành động cá nhân khó tạo ra khác biệt đáng kể.',
        en: 'For example, the majority of global greenhouse-gas emissions come from a small number of fossil-fuel corporations, so without government regulation individual actions can make little real difference.' },
      { vi: 'Mặt khác, khi hàng triệu hộ gia đình ở châu Âu lắp pin mặt trời áp mái và giảm ăn thịt, nhu cầu năng lượng sạch tăng vọt đã buộc cả ngành điện phải chuyển hướng.',
        en: 'On the other hand, when millions of European households installed rooftop solar panels and cut down on meat, the surge in demand for clean options forced the whole energy industry to change course.' },
    ],
    conclusion: { vi: 'Tóm lại, dù hành động cá nhân đơn lẻ là nhỏ bé so với quy mô của vấn đề môi trường, tôi cho rằng chúng vẫn quan trọng, bởi hàng triệu lựa chọn cộng lại vừa cắt giảm phát thải vừa tạo áp lực chính trị buộc chính phủ và doanh nghiệp phải thay đổi.',
      en: 'In conclusion, although a single person\'s actions are small compared with the scale of the environmental problem, I believe they still matter, because millions of choices combined both cut emissions and create the political pressure that forces governments and businesses to act.' },
  },
  'Car-Free Days vs. Alternative Solutions': {
    a: ['Ngày không xe: nâng nhận thức, cho thấy phố xá không ô tô dễ chịu ra sao', 'Rẻ, dễ tổ chức, tạo động lực chính trị cho thay đổi lâu dài', 'Giảm ô nhiễm và tiếng ồn ngay trong ngày đó'],
    b: ['Giải pháp lâu dài hiệu quả hơn: giao thông công cộng, làn xe đạp, phí ùn tắc', 'Ngày không xe chỉ mang tính biểu tượng, tác động một lần', 'Cần đầu tư hạ tầng và tiêu chuẩn khí thải để thay đổi bền vững'],
    evidence: [
      { vi: 'Ví dụ, thành phố Bogotá (Colombia) tổ chức "Ngày không ô tô" hằng năm và chương trình "Ciclovía" hằng tuần, giúp thay đổi thái độ của người dân với việc đi lại bằng xe đạp.',
        en: 'For example, the city of Bogotá in Colombia runs an annual "Car-Free Day" and a weekly "Ciclovía" programme, which has helped shift residents\' attitudes towards cycling.' },
      { vi: 'Tuy nhiên, mức giảm ô nhiễm bền vững nhất ở London lại đến từ phí ùn tắc và vùng phát thải cực thấp, chứ không phải từ những sự kiện một ngày.',
        en: 'However, the most lasting cut in pollution in London has come from its congestion charge and ultra-low-emission zone, not from one-day events.' },
    ],
    conclusion: { vi: 'Tóm lại, dù ngày không xe quốc tế có ích trong việc nâng cao nhận thức, tôi cho rằng các giải pháp lâu dài như đầu tư giao thông công cộng và thu phí ùn tắc mới thực sự giảm ô nhiễm không khí, bởi chúng thay đổi thói quen đi lại hằng ngày chứ không chỉ trong một ngày.',
      en: 'In conclusion, although international car-free days are useful for raising awareness, I believe long-term measures such as investment in public transport and congestion charging are what genuinely reduce air pollution, because they change everyday travel habits rather than behaviour for a single day.' },
  },
  'Lack of Fluency in Foreign Languages': {
    a: ['Lớp học đông, tập trung ngữ pháp và thi cử hơn là giao tiếp', 'Ít cơ hội thực hành với người bản xứ, thiếu môi trường dùng thật', 'Giáo viên hạn chế về phát âm/giao tiếp; học sinh ngại mắc lỗi'],
    b: ['Dạy theo hướng giao tiếp, giảm dịch, tăng nói và nghe', 'Lớp nhỏ hơn, dùng phim/podcast/ứng dụng trao đổi ngôn ngữ', 'Chương trình trao đổi, trại hè, và đánh giá kỹ năng nói'],
    evidence: [
      { vi: 'Ví dụ, các nước Bắc Âu như Hà Lan và Thụy Điển đạt trình độ tiếng Anh rất cao một phần vì họ chiếu phim và chương trình truyền hình bằng tiếng Anh có phụ đề thay vì lồng tiếng.',
        en: 'For example, Nordic countries such as the Netherlands and Sweden reach very high levels of English partly because they show films and TV programmes in English with subtitles rather than dubbing them.' },
      { vi: 'Ngược lại, ở nhiều nước có kết quả kém hơn, giờ học ngoại ngữ vẫn dành phần lớn thời gian cho việc chép ngữ pháp và làm bài kiểm tra viết.',
        en: 'By contrast, in many lower-performing countries foreign-language lessons still spend most of their time on copying grammar rules and sitting written tests.' },
    ],
    conclusion: { vi: 'Tóm lại, việc dạy nặng ngữ pháp cùng với quá ít cơ hội thực hành nói là những nguyên nhân chính khiến học sinh không thành thạo ngoại ngữ sau nhiều năm học, nhưng chuyển sang phương pháp giao tiếp, lớp nhỏ hơn và tăng tiếp xúc với ngôn ngữ thật có thể cải thiện rõ rệt việc học ngôn ngữ.',
      en: 'In conclusion, grammar-heavy teaching together with too few chances to actually speak are the main causes of poor fluency after years of study, but moving to a communicative approach, smaller classes and more exposure to the real language can markedly improve language education.' },
  },
  'Lack of Practical Life Skills': {
    a: ['Cá nhân: nợ nần do không biết lập ngân sách, ăn uống kém do không nấu được', 'Cá nhân: lo âu, phụ thuộc cha mẹ lâu hơn, chậm tự lập', 'Xã hội: tỷ lệ vỡ nợ cá nhân và chi phí y tế do lối sống tăng'],
    b: ['Đưa tài chính cá nhân, nấu ăn, sửa chữa cơ bản vào chương trình bắt buộc', 'Học qua dự án thực tế: tự lập ngân sách lớp, bữa ăn, kế hoạch chi tiêu', 'Cha mẹ giao việc nhà và trách nhiệm tài chính nhỏ từ sớm'],
    evidence: [
      { vi: 'Ví dụ, nhiều khảo sát ở Anh và Mỹ cho thấy phần lớn người trẻ mới ra trường không thể lập một bảng ngân sách hằng tháng đơn giản hay hiểu cách hoạt động của lãi kép.',
        en: 'For example, surveys in the UK and the US find that most recent school-leavers cannot draw up a simple monthly budget or explain how compound interest works.' },
      { vi: 'Một giải pháp đã được thử nghiệm là đưa môn "giáo dục tài chính" thành bắt buộc ở trường trung học tại một số bang của Mỹ, và các nghiên cứu cho thấy học sinh sau đó vay nợ ít rủi ro hơn.',
        en: 'One solution that has been trialled is making "financial education" a compulsory school subject in several US states, and studies show that students later take on less risky debt.' },
    ],
    conclusion: { vi: 'Tóm lại, việc rời ghế nhà trường mà thiếu các kỹ năng sống cơ bản khiến nhiều người trẻ mắc nợ, phụ thuộc lâu hơn vào gia đình và tạo gánh nặng cho xã hội, nhưng đưa các kỹ năng như quản lý tài chính và nấu ăn vào chương trình bắt buộc, dạy qua dự án thực tế, có thể giải quyết vấn đề này.',
      en: 'In conclusion, leaving education without basic life skills leaves many young people in debt, dependent on their families for longer and a burden on society, but making skills such as budgeting and cooking a compulsory, project-based part of the curriculum can address the problem.' },
  },
};

// ── builder ──────────────────────────────────────────────────────────────
const AI_LONG_NOTE = 'Đây là bước "chốt bài": không đưa ý mới, chỉ tóm tắt 2 luận điểm chính đã luyện rồi khẳng định lại lập trường. AI sẽ chấm dựa trên việc bạn có mở bằng "In conclusion/To sum up", có nhắc lại đúng 2 ý, và có câu chốt quan điểm hay không.';

const isAugQuestion = (q) => /(?:^|[-_])aug[-_]/.test(String(q && q.questionId || ''));

function augmentTopics(topics) {
  let added = 0;
  for (const t of topics) {
    const aug = AUG[t.topicName];
    if (!aug) continue;
    const [labA, labB] = SIDE_LABELS[t.essayType] || ['Nhóm ý 1', 'Nhóm ý 2'];

    t.brainstormHints = [
      { side: labA, points: aug.a.slice() },
      { side: labB, points: aug.b.slice() },
    ];

    // Idempotent: drop any previously-appended *-aug-* questions first so a
    // re-run replaces rather than stacks them.
    t.questions = (t.questions || []).filter((q) => !isAugQuestion(q));
    const startOrder = t.questions.reduce((m, q) => Math.max(m, q.orderIndex || 0), 0);
    const key = `${t.week}-${t.orderIndex}`;
    const extra = [];

    aug.evidence.forEach((ev, i) => extra.push({
      questionId: `${key}-aug-ev${i + 1}`,
      level: 'intermediate',
      type: 'translation',
      questionText: `Dịch câu VÍ DỤ CÓ DẪN CHỨNG sau sang tiếng Anh:\n\n"${ev.vi}"`,
      correctAnswer: ev.en,
      modelAnswer: ev.en,
      explanationVi: 'Câu "ví dụ minh họa": chống đỡ luận điểm bằng một dẫn chứng cụ thể (số liệu, quốc gia, tổ chức, nghiên cứu, sự kiện có thật) thay vì nói chung chung — đây là điều bài band 7+ cần. Mẫu mở đầu: "For example, ...", "A notable example is ...", "In countries such as ...".',
      orderIndex: startOrder + extra.length + 1,
      isActive: true,
    }));

    extra.push({
      questionId: `${key}-aug-concl`,
      level: 'intermediate',
      type: 'translation',
      questionText: `Dịch câu KẾT BÀI sau sang tiếng Anh (mẫu kết bài cho dạng ${ESSAY_VI[t.essayType] || t.essayType}):\n\n"${aug.conclusion.vi}"`,
      correctAnswer: aug.conclusion.en,
      modelAnswer: aug.conclusion.en,
      explanationVi: aug.conclusion.note || 'Mẫu kết bài: "In conclusion, + tóm tắt lại 2 luận điểm chính đã phân tích + khẳng định lại quan điểm / đánh giá tổng thể." Tuyệt đối không thêm ý mới ở kết bài.',
      sentenceStructure: 'In conclusion, although + [nhượng bộ], + [khẳng định lại quan điểm] because + [lý do chính].',
      orderIndex: startOrder + extra.length + 1,
      isActive: true,
    });

    extra.push({
      questionId: `${key}-aug-sw`,
      level: 'intermediate',
      type: 'short_writing',
      questionText: `Viết ĐOẠN KẾT BÀI (2–3 câu) bằng tiếng Anh cho đề sau:\n\n"${t.prompt}"\n\nDùng các ý bạn vừa luyện. Gợi ý cấu trúc: (1) mở bằng "In conclusion" hoặc "To sum up"; (2) nhắc lại 2 luận điểm chính (ngắn gọn); (3) một câu khẳng định lại quan điểm / đánh giá. KHÔNG thêm ý mới.`,
      modelAnswer: aug.conclusion.en,
      fallbackKeywords: ['in conclusion', 'to sum up', 'overall', 'therefore'],
      explanationVi: AI_LONG_NOTE,
      orderIndex: startOrder + extra.length + 1,
      isActive: true,
    });

    t.questions = t.questions.concat(extra);
    added += extra.length;
  }
  return { topicsAugmented: Object.keys(AUG).length, questionsAdded: added };
}

module.exports = { AUG, SIDE_LABELS, augmentTopics, isAugQuestion };
