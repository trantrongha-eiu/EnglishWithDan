'use strict';

// Model essay (sampleSections) + "Phân tích đề" (analysisSections) for every
// weekly Task 2 topic. seedTask2TopicEssays.js writes these onto the
// WritingTask2 doc that each Task2Topic.writingTask2Id points at, so the
// "Viết bài ngay" button on the practice screen opens a full task WITH a
// worked example and a Vietnamese breakdown — not a bare prompt.
//
// The analysis is built programmatically from the essay type + the
// brainstorm points already defined in task2Augment.js; only the model
// essay prose (intro / body1 / body2) is written per topic here. The
// conclusion paragraph is reused from task2Augment.js so the two features
// stay consistent.

const { AUG, SIDE_LABELS } = require('./task2Augment');
const { buildParagraph } = require('./task2SampleHighlights');

// Band 7+ rewrites (task2DanielRewrites.js) supersede the intro/body prose
// below for the topics they cover — keyed here by topicName.
const REWRITE_BY_TOPIC = new Map(
  require('./task2DanielRewrites').filter((r) => r.topic).map((r) => [r.topic, r]),
);

const ESSAY_VI = {
  advantages_disadvantages: 'Advantages & Disadvantages',
  cause_effect: 'Cause & Effect',
  cause_solution: 'Cause & Solution',
  effect_solution: 'Effect & Solution',
  agree_disagree: 'Agree or Disagree',
  discuss_both_views: 'Discuss Both Views',
  positive_or_negative_development: 'Positive or Negative Development',
};

const TYPE_REQUIREMENT = {
  advantages_disadvantages: 'Phân tích CÂN BẰNG cả mặt lợi và mặt hại. Nếu đề hỏi "outweigh / benefits greater than drawbacks" thì bắt buộc chốt rõ bên nào nặng hơn ở kết bài.',
  cause_effect: 'Thân bài 1 nêu nguyên nhân, thân bài 2 nêu hệ quả. Mỗi đoạn 1–2 ý chính + giải thích + ví dụ.',
  cause_solution: 'Thân bài 1 nêu nguyên nhân, thân bài 2 nêu giải pháp. Giải pháp nên tương ứng trực tiếp với nguyên nhân đã nêu.',
  effect_solution: 'Thân bài 1 nêu hệ quả (tác động), thân bài 2 nêu giải pháp — thường là giải pháp của chính phủ / nhà quy hoạch.',
  agree_disagree: 'Chọn RÕ một lập trường (đồng ý / không đồng ý / đồng ý một phần) ngay ở mở bài và giữ nhất quán. Có thể dành 1 đoạn cho ý phản biện rồi bác lại.',
  discuss_both_views: 'Trình bày công bằng cả hai quan điểm — mỗi quan điểm 1 thân bài — rồi nêu ý kiến RIÊNG của mình (ở kết bài hoặc câu cuối thân bài 2).',
  positive_or_negative_development: 'Đánh giá đây là bước phát triển tích cực hay tiêu cực. Thường 1 đoạn mặt tích cực, 1 đoạn mặt tiêu cực, rồi chốt đánh giá tổng thể ("on balance…").',
};

// ── per-topic model essay prose (keyed by exact topicName) ───────────────
// `kw` / `thesis` feed the analysis. intro/body1/body2 prose only remains
// for topics without a band 7+ rewrite in task2DanielRewrites.js.
const ESSAY = {
  'Technology in Education': {
    kw: 'schools offer online learning · alternative to in-person classes · advantages and disadvantages',
    thesis: 'Online learning mang lại lợi ích rõ về tính linh hoạt và khả năng tiếp cận, nhưng cũng có nhược điểm đáng kể về tương tác và động lực học.',
  },
  'Mobile Devices and Communication': {
    kw: 'widespread use of smartphones and tablets · changed the way people communicate · advantages outweigh disadvantages',
    thesis: 'Điện thoại thông minh làm giao tiếp trực tiếp ít đi, nhưng khả năng kết nối tức thời và chi phí thấp khiến lợi ích của chúng lớn hơn tác hại.',
  },
  'Influence of Social Media': {
    kw: 'social media · staying connected · getting news updates · benefits outweigh the drawbacks',
    thesis: 'Mạng xã hội giúp tiếp cận tin tức nhanh và tự do bày tỏ ý kiến, nhưng đối với tin tức, nguy cơ tin giả và tác hại lên sức khỏe tinh thần có thể lớn hơn lợi ích.',
  },
  'Wearable Health Technologies & AI Smart Devices': {
    kw: 'smartwatches and health-tracking applications · monitor daily physical condition · advantages outweigh disadvantages',
    thesis: 'Thiết bị theo dõi sức khỏe làm dấy lên lo ngại về quyền riêng tư và lo âu quá mức, nhưng khả năng phát hiện sớm vấn đề và khuyến khích lối sống lành mạnh khiến ưu điểm lớn hơn.',
  },
  'High Rates of University Dropout': {
    kw: 'university students leave higher education before completing their degree · main causes · effects on society',
    thesis: 'Khó khăn tài chính và việc chọn sai ngành là nguyên nhân chính khiến sinh viên bỏ học, gây thiệt hại cho cả người học lẫn nguồn nhân lực xã hội.',
  },
  'Decline in STEM Course Enrolments': {
    kw: 'not enough students choosing science subjects at university · causes · effects on society',
    thesis: 'Việc các môn khoa học bị xem là khó và ít hấp dẫn về nghề nghiệp là nguyên nhân chính khiến số sinh viên chọn ngành STEM giảm, đe dọa nguồn cung kỹ sư và năng lực đổi mới.',
  },
  'Online Learning and Student Motivation': {
    kw: 'students find it difficult to stay motivated when studying online · causes · effects on students',
    thesis: 'Thiếu tương tác trực tiếp và quá nhiều yếu tố gây xao nhãng ở nhà là nguyên nhân chính khiến học sinh mất động lực khi học online, dẫn tới kết quả kém hơn và nguy cơ bỏ học cao hơn.',
  },
  'Dropout Rates in Higher Education': {
    kw: 'number of students dropping out of university is increasing · causes · effects on individuals and society',
    thesis: 'Gánh nặng tài chính và sự chuẩn bị chưa đủ cho môi trường đại học là nguyên nhân chính của tình trạng bỏ học, gây hại cho cả sinh viên lẫn xã hội.',
  },
  'Rise in Modern Mental Stress & Anxiety': {
    kw: 'stress-related mental illnesses and anxiety disorders increasingly prevalent · primary causes · solutions',
    thesis: 'Áp lực công việc cùng ảnh hưởng tiêu cực của mạng xã hội là nguyên nhân chính làm gia tăng căng thẳng và lo âu, nhưng dịch vụ tư vấn dễ tiếp cận và giáo dục kỹ năng đối phó từ sớm có thể cải thiện đáng kể.',
  },
  'Urban Sedentary Lifestyle': {
    kw: 'adults in major cities struggle to get enough physical exercise · causes · measures to encourage activity',
    thesis: 'Công việc ít vận động và một môi trường đô thị không thân thiện với người đi bộ là nguyên nhân chính của lối sống thụ động, nhưng quy hoạch ưu tiên đi bộ, đạp xe cùng chính sách tại nơi làm việc có thể thúc đẩy vận động.',
  },
  'Growing Rates of Childhood Obesity': {
    kw: 'childhood obesity rates have risen sharply · underlying causes · steps to tackle it',
    thesis: 'Đồ ăn nhanh giá rẻ được quảng cáo mạnh cùng lối sống ít vận động là nguyên nhân chính của béo phì ở trẻ em, nhưng đánh thuế thực phẩm không lành mạnh, cải thiện bữa ăn học đường và giáo dục dinh dưỡng có thể kiểm soát vấn đề.',
  },
  'Overreliance on Fast Food & Processed Foods': {
    kw: 'people consume more processed and fast food than fresh home-cooked meals · main causes · how governments and communities can address it',
    thesis: 'Nhịp sống bận rộn và sự tiện lợi giá rẻ của đồ ăn nhanh là nguyên nhân chính khiến con người lệ thuộc vào thực phẩm chế biến sẵn, nhưng chính phủ và cộng đồng có thể ứng phó bằng trợ giá thực phẩm tươi, dạy kỹ năng nấu ăn và siết chặt quảng cáo.',
  },
  'Severe Traffic Congestion in Urban Areas': {
    kw: 'traffic congestion in major cities is worsening · longer commuting times and increased pollution · effects on urban residents · solutions governments can adopt',
    thesis: 'Ùn tắc giao thông gây lãng phí thời gian, ô nhiễm và thiệt hại kinh tế, nhưng chính phủ có thể giảm bớt bằng cách đầu tư mạnh cho giao thông công cộng và áp dụng phí vào trung tâm.',
  },
  'Overreliance on Private Motor Vehicles': {
    kw: 'most city commuters prefer private cars and motorbikes over public transit · effects on environment and society · measures to promote public transport',
    thesis: 'Việc lệ thuộc vào xe cá nhân gây ô nhiễm nặng, ùn tắc và lối sống ít vận động, nhưng các thành phố có thể khắc phục bằng cách xây dựng giao thông công cộng chất lượng cao và mạnh dạn hạn chế ô tô ở trung tâm.',
  },
  'Rising Freight Transport by Heavy Trucks': {
    kw: 'freight moved long distances by heavy trucks rather than rail or water · effects of reliance on road transport · solutions',
    thesis: 'Vận chuyển hàng hóa bằng xe tải hạng nặng gây ô nhiễm, hư hại hạ tầng và tai nạn, nhưng có thể giảm bớt bằng cách chuyển hàng đường dài sang đường sắt và đường thủy cùng tiêu chuẩn khí thải nghiêm ngặt hơn.',
  },
  'Decline in Walking and Cycling Habits': {
    kw: 'fewer citizens choose to walk or cycle for daily short-distance journeys · effects · how urban planners can encourage non-motorized travel',
    thesis: 'Việc ít đi bộ và đạp xe khiến người dân kém khỏe hơn và làm giao thông đô thị ô nhiễm hơn, nhưng các nhà quy hoạch có thể đảo ngược bằng cách xây làn đường an toàn, mở rộng phố đi bộ và triển khai xe đạp công cộng.',
  },
  'Shorter Work Week': {
    kw: 'working week should be shorter · workers should have a longer weekend · agree or disagree',
    thesis: 'Dù một số ngành đặc thù khó áp dụng, tôi đồng ý rằng tuần làm việc nên ngắn hơn vì bằng chứng cho thấy điều này cải thiện sức khỏe và cân bằng cuộc sống mà không làm giảm năng suất.',
  },
  'Remote Work as the Future': {
    kw: 'working from home will become the main way people work in the future · agree or disagree',
    thesis: 'Dù làm việc từ xa sẽ ngày càng phổ biến trong các ngành văn phòng, tôi không hoàn toàn đồng ý rằng nó sẽ trở thành cách làm việc chính của phần lớn mọi người, vì vô số công việc thiết yếu vẫn phải làm trực tiếp.',
  },
  'Job Satisfaction vs. Salary': {
    kw: 'job satisfaction is more important than a high salary · agree or disagree',
    thesis: 'Dù một mức lương ổn định là điều thiết yếu, tôi đồng ý rằng sự hài lòng trong công việc quan trọng hơn lương cao vì nó ảnh hưởng trực tiếp đến sức khỏe tinh thần và chất lượng cuộc sống lâu dài.',
  },
  'Unenjoyable Employment vs. Unemployment': {
    kw: 'better to be unemployed than to stay in a job that they do not enjoy · to what extent do you agree or disagree',
    thesis: 'Dù một công việc thực sự độc hại có thể là ngoại lệ, tôi không đồng ý rằng thất nghiệp nhìn chung tốt hơn một công việc không như ý, vì thu nhập, kỹ năng và cấu trúc mà công việc mang lại thường quan trọng hơn.',
  },
  'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes': {
    kw: 'subsidising fruits and vegetables · taxing junk food · discuss both views and give your own opinion',
    thesis: 'Dù trợ giá thực phẩm lành mạnh giúp giảm gánh nặng cho người nghèo, tôi cho rằng đánh thuế đồ ăn vặt là chiến lược hiệu quả hơn vì bằng chứng cho thấy nó vừa giảm tiêu thụ vừa tạo nguồn thu cho y tế.',
  },
  'Funding Priorities: Free Public Libraries vs. Internet Infrastructure': {
    kw: 'government should provide free public libraries · waste of money because people can find information on the internet · discuss both views and give your own opinion',
    thesis: 'Dù internet giúp thông tin dễ tiếp cận hơn, tôi tin rằng chính phủ vẫn nên tài trợ thư viện công miễn phí vì chúng cung cấp không gian, sự hướng dẫn và dịch vụ cộng đồng mà một kết nối mạng đơn thuần không thể thay thế.',
  },
  'National Fitness Funding: Elite Athletes vs. Grassroots Sports': {
    kw: 'build more sports facilities to train top athletes · build facilities that ordinary people can use · discuss both views and give your own opinion',
    thesis: 'Dù việc tài trợ cho vận động viên đỉnh cao đem lại niềm tự hào và hình mẫu, tôi cho rằng đầu tư vào cơ sở thể thao cộng đồng là hướng đi hợp lý hơn vì nó cải thiện sức khỏe toàn dân và giảm chi phí y tế lâu dài.',
  },
  'Economic Support: Higher Education vs. Vocational Training': {
    kw: 'invest more money in vocational training and trade skills · prioritise university education · discuss both views and give your own opinion',
    thesis: 'Dù giáo dục đại học là nền tảng cho nghiên cứu và đổi mới, tôi cho rằng chính phủ nên dành nhiều nguồn lực hơn cho đào tạo nghề vì nó giải quyết trực tiếp tình trạng thiếu thợ lành nghề và mở ra việc làm ổn định cho nhiều người hơn.',
  },
  'Rise in Eco-Tourism': {
    kw: 'organising tours to remote regions and rural communities is becoming popular · positive or negative development for local residents and their environment',
    thesis: 'Dù du lịch sinh thái có nguy cơ gây quá tải cho những vùng thiên nhiên nhạy cảm, về tổng thể đây là một xu hướng tích cực vì nó gắn thu nhập với việc bảo tồn và nâng cao ý thức môi trường.',
  },
  'Transition to Electric Vehicles': {
    kw: 'governments promoting electric vehicles to combat air pollution and reduce carbon emissions · positive or negative development',
    thesis: 'Dù việc sản xuất pin và nguồn điện còn nhiều vấn đề, việc chuyển sang xe điện về tổng thể là bước phát triển tích cực vì nó cắt giảm ô nhiễm không khí đô thị và giảm lệ thuộc nhiên liệu hóa thạch.',
  },
  'Growth of Renewable Energy Infrastructure': {
    kw: 'countries investing heavily in renewable energy such as wind and solar rather than fossil fuels · positive or negative development',
    thesis: 'Dù năng lượng tái tạo còn thách thức về tính ổn định và chi phí, việc mở rộng hạ tầng này là bước phát triển tích cực vì nó là cách thực tế nhất để cắt giảm khí thải và tăng an ninh năng lượng.',
  },
  'Conversion of Urban Spaces to Local Community Gardens': {
    kw: 'public parks and open spaces being turned into community gardens where residents grow fruit and vegetables · positive or negative development',
    thesis: 'Dù đất đô thị luôn khan hiếm, việc chuyển đổi các không gian bỏ trống thành vườn cộng đồng nhìn chung là bước phát triển tích cực vì nó cung cấp thực phẩm tươi, tăng mảng xanh và gắn kết cư dân.',
  },
  'Public vs. Private Healthcare': {
    kw: 'good health is a basic human right · medical services should not be run by profit-making companies · do the disadvantages of private healthcare outweigh the advantages',
    thesis: 'Dù các bệnh viện tư có thể bổ sung nguồn lực và rút ngắn thời gian chờ, tôi cho rằng nhược điểm của một hệ thống y tế vì lợi nhuận lớn hơn ưu điểm vì nó có xu hướng đặt khả năng chi trả lên trên nhu cầu chữa bệnh.',
  },
  'Consumerism and Society': {
    kw: 'people are buying more consumer goods than ever before · positive or negative development',
    thesis: 'Dù việc mua sắm nhiều giúp duy trì tăng trưởng và việc làm, tôi cho rằng đây phần lớn là xu hướng tiêu cực vì nó tạo ra lượng rác thải khổng lồ, khai thác tài nguyên quá mức và nuôi dưỡng lối sống chạy theo vật chất.',
  },
  'Government Funding for the Arts': {
    kw: 'government should spend money supporting the arts · money should be spent on healthcare and education instead · discuss both views and give your own opinion',
    thesis: 'Dù chi tiêu cho y tế và giáo dục rõ ràng là cấp thiết, tôi cho rằng chính phủ vẫn nên tài trợ nghệ thuật ở mức hợp lý vì nghệ thuật gìn giữ bản sắc văn hóa và có thể mang lại lợi ích kinh tế đáng kể cho địa phương.',
  },
  'Youth Crime and Solutions': {
    kw: 'children and teenagers are committing more crimes · why is this happening · how should young offenders be punished',
    thesis: 'Đói nghèo và thiếu cơ hội là nguyên nhân chính khiến tội phạm vị thành niên gia tăng, và cách xử lý hiệu quả nhất là kết hợp các chương trình phòng ngừa với hình phạt mang tính phục hồi thay vì chỉ dựa vào nhà tù.',
  },
  'Prison vs. Rehabilitation': {
    kw: 'all offenders should be sent to prison · better alternatives for minor crimes such as community service · discuss both views and give your own opinion',
    thesis: 'Dù việc giam giữ là cần thiết với những tội phạm nguy hiểm, tôi cho rằng đối với các tội nhẹ, những biện pháp thay thế như lao động công ích thuyết phục hơn vì chúng ít tốn kém hơn và giúp giảm tái phạm.',
  },
  'Dịch Câu - Môi Trường & Khí Hậu': {
    kw: 'increasing levels of pollution and climate change · causes · solutions',
    thesis: 'Việc đốt nhiên liệu hóa thạch và nạn phá rừng là nguyên nhân chính của ô nhiễm và biến đổi khí hậu, nhưng chuyển dịch sang năng lượng sạch cùng hợp tác quốc tế mạnh mẽ có thể giải quyết những vấn đề này.',
  },
  'Dịch Câu - Công Nghệ & Truyền Thông': {
    kw: 'rapid advancement of technology · transformed the way people communicate and work · advantages and disadvantages',
    thesis: 'Dù công nghệ và truyền thông hiện đại làm nảy sinh những vấn đề như tin giả và nghiện màn hình, khả năng kết nối con người và mở rộng tiếp cận tri thức khiến lợi ích của sự phát triển này lớn hơn tác hại.',
  },
  'Dịch Câu - Giáo Dục & Thanh Niên': {
    kw: 'education system is under pressure to prepare students for the modern world · causes · effects',
    thesis: 'Áp lực thi cử và một chương trình học nặng lý thuyết là nguyên nhân chính khiến hệ thống giáo dục quá tải, gây căng thẳng cho học sinh và khoảng cách giữa kỹ năng được đào tạo và nhu cầu thực tế.',
  },
  'Dịch Câu - Sức Khỏe & Đô Thị Hóa': {
    kw: 'rapid urbanisation has a significant impact on people\'s health and wellbeing in cities · effects · solutions governments can implement',
    thesis: 'Đô thị hóa nhanh gây ra những hệ quả nghiêm trọng cho sức khỏe như ô nhiễm không khí và lối sống chật chội, ít vận động, nhưng chính phủ có thể giảm bớt bằng cách quy hoạch nhiều không gian xanh và đầu tư mạnh cho giao thông công cộng.',
  },
  'Dịch Câu - Kinh Tế & Toàn Cầu Hóa': {
    kw: 'globalisation has brought significant changes to economies · its effects are not always positive · to what extent do you agree or disagree',
    thesis: 'Dù toàn cầu hóa đã giúp giảm nghèo và thúc đẩy tăng trưởng ở nhiều nơi, tôi đồng ý rằng tác động của nó không phải lúc nào cũng tích cực vì nó cũng làm gia tăng bất bình đẳng, gây ô nhiễm và đe dọa các nền văn hóa địa phương.',
  },

  // ═══ EXTRA topics added via the admin panel ═══
  'Decline in Reading Habits': {
    kw: 'young people are reading fewer books than in the past · effects on society · solutions',
    thesis: 'Việc giới trẻ đọc ít sách hơn làm suy giảm vốn từ, khả năng tập trung và tư duy phản biện của cả một thế hệ, nhưng nhà trường và gia đình có thể đảo ngược xu hướng này bằng cách tạo thói quen đọc mỗi ngày.',
    intro: 'It is true that young people today read far fewer books than earlier generations did. This essay will examine the effects this decline has on society and the solutions that could be put in place.',
    body1: 'The effects on society are significant. Regular reading builds vocabulary, background knowledge and the ability to concentrate for long periods, so a generation that reads little tends to write less clearly and think less critically. OECD surveys show that students who read for pleasure score markedly higher in comprehension regardless of family background. Extended reading of fiction also develops empathy, and its loss can leave people less able to understand viewpoints different from their own.',
    body2: 'Schools and families can reverse the trend. Programmes such as "twenty minutes of silent reading a day", now used by many schools, turn reading into a habit rather than a chore, while book clubs and free-choice reading time make it social and enjoyable. Publishers and libraries can also promote titles through the social-media channels and reading apps that young people already use, and parents who read themselves and read aloud to young children set the strongest example of all.',
  },
  'Academic Pressure on Teenagers': {
    kw: 'students face more academic pressure than ever before · causes of this pressure · what can be done to reduce it',
    thesis: 'Kỳ vọng cao của gia đình và một hệ thống thi cử quá coi trọng điểm số là những nguyên nhân chính gây áp lực học tập lên thanh thiếu niên, nhưng giảm thi cử quyết định và hỗ trợ tâm lý trong trường học có thể làm giảm đáng kể áp lực này.',
    intro: 'Teenagers today appear to face greater academic pressure than any previous generation. This essay will discuss the main causes of this pressure and what can be done to reduce it.',
    body1: 'The pressure has two main sources. The first is family and cultural expectation: in many societies a prestigious university place is seen as essential to a good life, so parents push their children hard and children internalise the fear of failing them. The second is the exam system itself, which relies on a few high-stakes tests and public rankings, turning school into a constant competition. Social media then amplifies this by making every classmate\'s achievements visible.',
    body2: 'Several measures could ease the burden. Education systems can reduce the number of decisive exams and assess students in more varied ways, such as coursework and projects, so that a single bad day matters less. Schools should provide counselling and teach stress-management skills, as some Nordic countries do. Finland, which sets little homework and holds almost no standardised tests yet performs strongly, shows that this pressure is a choice rather than a necessity.',
  },
  'Individual vs. Government Responsibility': {
    kw: 'individuals cannot do anything to improve the environment · individual actions can make a difference · discuss both views and give your own opinion',
    thesis: 'Dù hành động cá nhân đơn lẻ là nhỏ bé so với quy mô vấn đề môi trường, tôi cho rằng chúng vẫn quan trọng vì hàng triệu lựa chọn cộng lại vừa cắt giảm phát thải vừa tạo áp lực chính trị buộc chính phủ và doanh nghiệp thay đổi.',
  },
  'Car-Free Days vs. Alternative Solutions': {
    kw: 'international car-free days are an effective way to reduce air pollution · there are better ways to tackle this issue · discuss both views and give your own opinion',
    thesis: 'Dù ngày không xe quốc tế có ích trong việc nâng cao nhận thức, tôi cho rằng các giải pháp lâu dài như đầu tư giao thông công cộng và thu phí ùn tắc mới thực sự giảm ô nhiễm không khí.',
  },
  'Lack of Fluency in Foreign Languages': {
    kw: 'many graduates are still unable to speak foreign languages fluently despite years of study · causes · solutions to improve language education',
    thesis: 'Việc dạy nặng ngữ pháp cùng với quá ít cơ hội thực hành nói là nguyên nhân chính khiến học sinh không thành thạo ngoại ngữ sau nhiều năm học, nhưng chuyển sang phương pháp giao tiếp và tăng tiếp xúc với ngôn ngữ thật có thể cải thiện rõ rệt.',
  },
  'Lack of Practical Life Skills': {
    kw: 'young people graduate without basic life skills such as budgeting or cooking · effects on individuals and society · solutions',
    thesis: 'Việc rời ghế nhà trường mà thiếu kỹ năng sống cơ bản khiến nhiều người trẻ mắc nợ, phụ thuộc lâu hơn vào gia đình và tạo gánh nặng cho xã hội, nhưng đưa các kỹ năng như quản lý tài chính và nấu ăn vào chương trình bắt buộc có thể giải quyết vấn đề.',
  },
};

// ── builder ──────────────────────────────────────────────────────────────
function buildEssaySections(topicName, essayType, prompt) {
  const e = ESSAY[topicName];
  const a = AUG[topicName];
  if (!e || !a) return null;

  const TITLES = ['Introduction', 'Body Paragraph 1', 'Body Paragraph 2', 'Conclusion'];
  const rw = REWRITE_BY_TOPIC.get(topicName);
  const sampleSections = rw
    ? [rw.intro, rw.body1, rw.body2, rw.conclusion].map((pairs, i) => ({ title: TITLES[i], ...buildParagraph(pairs) }))
    : [e.intro, e.body1, e.body2, a.conclusion.en].map((content, i) => ({ title: TITLES[i], content }));

  const [sideA, sideB] = SIDE_LABELS[essayType] || ['Nhóm ý 1', 'Nhóm ý 2'];
  const bullets = (arr) => arr.map((p) => '• ' + p).join('\n');

  const analysisSections = [
    {
      title: '1. Dạng bài & cách làm',
      content:
        `Dạng: ${ESSAY_VI[essayType] || essayType}.\n` +
        `${TYPE_REQUIREMENT[essayType] || ''}\n` +
        `Bố cục 4 đoạn (~250–280 từ, ~40 phút): Mở bài (paraphrase đề + nêu lập trường) → Thân bài 1 → Thân bài 2 → Kết bài (không thêm ý mới).`,
    },
    {
      title: '2. Từ khóa trong đề cần paraphrase',
      content: (e.kw || '') + '\n→ Ở mở bài, viết lại các cụm này bằng cách diễn đạt khác; KHÔNG chép nguyên đề.',
    },
    {
      title: '3. Lập trường & dàn ý 2 thân bài',
      content:
        `Lập trường: ${e.thesis}\n\n` +
        `THÂN BÀI 1 — ${sideA}:\n${bullets(a.a)}\n\n` +
        `THÂN BÀI 2 — ${sideB}:\n${bullets(a.b)}\n\n` +
        `Mỗi thân bài: 1 câu chủ đề → giải thích → 1 ví dụ cụ thể → (nếu cần) 1 câu chốt.`,
    },
    {
      title: '4. Dẫn chứng & ngôn ngữ gợi ý',
      content:
        `Ví dụ cụ thể có thể dùng:\n• ${a.evidence[0].en}\n• ${a.evidence[1].en}\n\n` +
        `Cụm nối: On the one hand… / On the other hand… / For example… / This helps explain why… / However…\n` +
        `Mẫu kết bài: "In conclusion, although + [nhượng bộ], + [khẳng định lại quan điểm] because + [lý do chính]."`,
    },
  ];

  return { sampleSections, analysisSections };
}

module.exports = { ESSAY, buildEssaySections };
