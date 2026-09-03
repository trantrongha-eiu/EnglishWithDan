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
const ESSAY = {
  'Technology in Education': {
    kw: 'schools offer online learning · alternative to in-person classes · advantages and disadvantages',
    thesis: 'Online learning mang lại lợi ích rõ về tính linh hoạt và khả năng tiếp cận, nhưng cũng có nhược điểm đáng kể về tương tác và động lực học.',
    intro: 'It is true that a growing number of schools now provide online learning instead of, or alongside, traditional classes. While this shift offers clear benefits in terms of flexibility and access, it also brings significant drawbacks that should not be ignored.',
    body1: 'On the one hand, online learning is highly flexible and widens access to education. Students can study whenever and wherever suits them, which is invaluable for those who work or live far from a campus. For instance, platforms such as Coursera and edX partner with leading universities to offer free courses to millions of learners in developing countries, opportunities that would otherwise be out of reach.',
    body2: 'On the other hand, studying online can weaken interaction and motivation. Without a teacher physically present, many learners find it hard to stay disciplined and feel cut off from their classmates. This helps explain why many massive open online courses have completion rates below ten per cent: once the novelty fades, students lose focus and drift away.',
  },
  'Mobile Devices and Communication': {
    kw: 'widespread use of smartphones and tablets · changed the way people communicate · advantages outweigh disadvantages',
    thesis: 'Điện thoại thông minh làm giao tiếp trực tiếp ít đi, nhưng khả năng kết nối tức thời và chi phí thấp khiến lợi ích của chúng lớn hơn tác hại.',
    intro: 'It is undeniable that smartphones and tablets have transformed the way people communicate. Although some argue that this has harmed the quality of human relationships, I believe the advantages of instant, low-cost connection clearly outweigh the disadvantages.',
    body1: 'The main benefit is that mobile devices allow people to stay in touch instantly, cheaply and across any distance. Messaging apps such as WhatsApp and Zalo let a family living in several countries make free video calls every day, something that was almost impossible a generation ago. This has made it far easier for migrant workers, students abroad and dispersed families to maintain close ties.',
    body2: 'The most common criticism is that constant device use reduces face-to-face contact and shortens attention spans. Several psychology studies have found that merely having a phone on the table lowers concentration and the quality of a conversation. However, this is largely a matter of self-control: with sensible limits, such as phone-free meals, people can enjoy the benefits without letting devices dominate their lives.',
  },
  'Influence of Social Media': {
    kw: 'social media · staying connected · getting news updates · benefits outweigh the drawbacks',
    thesis: 'Mạng xã hội giúp tiếp cận tin tức nhanh và tự do bày tỏ ý kiến, nhưng đối với tin tức, nguy cơ tin giả và tác hại lên sức khỏe tinh thần có thể lớn hơn lợi ích.',
    intro: 'These days, social media is used worldwide both to stay connected and to follow the news. While it offers speed and openness, I would argue that, as a source of news, its drawbacks may in fact outweigh its benefits.',
    body1: 'The obvious advantage is that news spreads instantly and from many perspectives. Anyone can report an event, hold the powerful to account, and organise support during a crisis. During many natural disasters, for example, ordinary people have used social media to coordinate relief and locate missing persons faster than official channels could.',
    body2: 'However, the same openness allows misinformation to spread very fast. A well-known MIT study of millions of Twitter posts found that false news travelled roughly six times faster and further than true stories. In addition, "echo chambers" tend to push users towards more extreme views, and heavy use is linked to anxiety and constant social comparison. For news in particular, these harms are serious enough to outweigh the convenience.',
  },
  'Wearable Health Technologies & AI Smart Devices': {
    kw: 'smartwatches and health-tracking applications · monitor daily physical condition · advantages outweigh disadvantages',
    thesis: 'Thiết bị theo dõi sức khỏe làm dấy lên lo ngại về quyền riêng tư và lo âu quá mức, nhưng khả năng phát hiện sớm vấn đề và khuyến khích lối sống lành mạnh khiến ưu điểm lớn hơn.',
    intro: 'It is increasingly common for people to wear smartwatches or use health apps to track their daily physical condition. Although there are valid concerns about privacy and over-monitoring, I believe the advantages of this trend outweigh the disadvantages.',
    body1: 'The chief benefit is early detection and prevention. Modern smartwatches such as the Apple Watch can now record an electrocardiogram and have alerted some users to serious heart-rhythm problems they were completely unaware of. On a daily level, step counts and sleep scores also nudge ordinary people towards more exercise and better routines, easing pressure on health services.',
    body2: 'The main drawbacks are privacy and anxiety. Sensitive health data could be leaked or sold, and doctors warn that inaccurate readings can make healthy people worry excessively or misdiagnose themselves. Even so, these problems can be limited through stronger data-protection laws and clearer advice that wearables are a guide, not a diagnosis, so the overall balance remains positive.',
  },
  'High Rates of University Dropout': {
    kw: 'university students leave higher education before completing their degree · main causes · effects on society',
    thesis: 'Khó khăn tài chính và việc chọn sai ngành là nguyên nhân chính khiến sinh viên bỏ học, gây thiệt hại cho cả người học lẫn nguồn nhân lực xã hội.',
    intro: 'In many countries, a growing number of students abandon their degree before finishing it. This essay will examine the main causes of this trend, chiefly financial pressure and poor course choice, and its damaging effects on both individuals and society.',
    body1: 'The most important cause is financial hardship. In the United States, only about 60% of students who begin a four-year degree complete it within six years, and many of the rest leave because they have to work so many part-time hours that they cannot keep up. A second cause is choosing the wrong subject: students who lack guidance often lose motivation once they realise the course does not suit them.',
    body2: 'The effects are serious at every level. Individuals are left with debt but no qualification and face lower lifetime earnings. Universities waste places and teaching resources, while society loses skilled workers it has already partly paid to train. Employers, in turn, struggle to fill graduate roles, which slows economic growth.',
  },
  'Decline in STEM Course Enrolments': {
    kw: 'not enough students choosing science subjects at university · causes · effects on society',
    thesis: 'Việc các môn khoa học bị xem là khó và ít hấp dẫn về nghề nghiệp là nguyên nhân chính khiến số sinh viên chọn ngành STEM giảm, đe dọa nguồn cung kỹ sư và năng lực đổi mới.',
    intro: 'It is a concern that fewer young people are choosing to study science subjects at university. This essay will look at why this is happening and at the effects it has on society as a whole.',
    body1: 'One major cause is that science is often taught as difficult and abstract at school, and there are too few well-trained teachers or well-equipped laboratories to make it engaging. Just as importantly, many students cannot see a clear career or salary pay-off, so they choose subjects that seem safer or easier.',
    body2: 'The effects are felt across the economy. As Germany and South Korea have found, a shortage of engineers and researchers forces technology firms to recruit talent from abroad, which raises costs and creates dependence on imported skills. Over time, weaker STEM enrolment slows innovation and national productivity, leaving a country less able to compete.',
  },
  'Online Learning and Student Motivation': {
    kw: 'students find it difficult to stay motivated when studying online · causes · effects on students',
    thesis: 'Thiếu tương tác trực tiếp và quá nhiều yếu tố gây xao nhãng ở nhà là nguyên nhân chính khiến học sinh mất động lực khi học online, dẫn tới kết quả kém hơn và nguy cơ bỏ học cao hơn.',
    intro: 'Many students report that it is hard to stay motivated when their lessons take place online. This essay will explore the causes of this problem and the effects it has on learners.',
    body1: 'The first cause is the absence of direct interaction and supervision. When a teacher is not physically present, weaker students in particular miss the reminders, encouragement and immediate help they rely on. A second cause is the home environment itself, which is full of distractions such as television, family members and social media that a classroom removes.',
    body2: 'These causes have clear effects. Unmotivated students submit work late, achieve lower marks and are more likely to drop a course altogether: many open online courses have completion rates under ten per cent. Beyond grades, learners also feel isolated and less connected to their school, which can harm their confidence and wider engagement with education.',
  },
  'Dropout Rates in Higher Education': {
    kw: 'number of students dropping out of university is increasing · causes · effects on individuals and society',
    thesis: 'Gánh nặng tài chính và sự chuẩn bị chưa đủ cho môi trường đại học là nguyên nhân chính của tình trạng bỏ học, gây hại cho cả sinh viên lẫn xã hội.',
    intro: 'The proportion of university students who leave without graduating is rising in many countries. This essay will discuss the main causes of this trend and its consequences for individuals and for society.',
    body1: 'A leading cause is the cost of studying, which forces many students into long hours of paid work that leave little time for coursework. A second cause is inadequate preparation: surveys across Europe show that first-year students are the most likely to drop out, largely because they are shocked by the independent, self-directed style of university learning and receive too little support.',
    body2: 'The effects are damaging on both sides. Students lose time and money and may be left with debt but no qualification, while every dropout represents a wasted public investment and a skilled worker the economy should have gained. Widening this gap between those who complete a degree and those who do not can also deepen social inequality.',
  },
  'Rise in Modern Mental Stress & Anxiety': {
    kw: 'stress-related mental illnesses and anxiety disorders increasingly prevalent · primary causes · solutions',
    thesis: 'Áp lực công việc cùng ảnh hưởng tiêu cực của mạng xã hội là nguyên nhân chính làm gia tăng căng thẳng và lo âu, nhưng dịch vụ tư vấn dễ tiếp cận và giáo dục kỹ năng đối phó từ sớm có thể cải thiện đáng kể.',
    intro: 'Stress-related illnesses and anxiety disorders have become far more common in modern society. This essay will identify the main causes of this problem and suggest solutions to improve public mental well-being.',
    body1: 'The primary causes are the pressures of modern working life and the effects of social media. Long hours, job insecurity and constant competition leave many people permanently on edge, while social media encourages endless comparison and information overload. Social isolation, as people spend more time alone and less in strong communities, makes matters worse.',
    body2: 'Several solutions can help. Schools and workplaces should provide free, easy-to-access counselling, as some Nordic countries already do, so that problems are identified early. Teaching stress-management and coping skills from a young age builds resilience, and public campaigns that reduce the stigma around mental illness encourage people to seek help before a crisis develops.',
  },
  'Urban Sedentary Lifestyle': {
    kw: 'adults in major cities struggle to get enough physical exercise · causes · measures to encourage activity',
    thesis: 'Công việc ít vận động và một môi trường đô thị không thân thiện với người đi bộ là nguyên nhân chính của lối sống thụ động, nhưng quy hoạch ưu tiên đi bộ, đạp xe cùng chính sách tại nơi làm việc có thể thúc đẩy vận động.',
    intro: 'A large share of adults in big cities do not get enough physical activity in their daily routine. This essay will examine why this sedentary lifestyle has developed and what can be done to encourage people to move more.',
    body1: 'The main cause is the nature of modern work and travel. Most city jobs involve sitting at a screen for hours, and people then commute by car or public transport rather than on foot. Cities themselves often lack safe pavements, parks and cycle lanes, so even willing residents find it difficult to build exercise into an ordinary day.',
    body2: 'The most effective measures are structural. City planning that prioritises walking and cycling, as decades of investment in dedicated bike lanes have done in the Netherlands, makes active travel the easy option. Employers can also help through standing desks, exercise breaks and subsidised gym membership, while the WHO target of 150 minutes of activity a week gives people a clear, achievable goal.',
  },
  'Growing Rates of Childhood Obesity': {
    kw: 'childhood obesity rates have risen sharply · underlying causes · steps to tackle it',
    thesis: 'Đồ ăn nhanh giá rẻ được quảng cáo mạnh cùng lối sống ít vận động là nguyên nhân chính của béo phì ở trẻ em, nhưng đánh thuế thực phẩm không lành mạnh, cải thiện bữa ăn học đường và giáo dục dinh dưỡng có thể kiểm soát vấn đề.',
    intro: 'Rates of childhood obesity have climbed steeply in many parts of the world. This essay will explain the underlying causes of the problem and outline steps that should be taken to address it.',
    body1: 'The root causes are diet and inactivity. Fast food and sugary drinks are cheap, widely available and heavily advertised to children, while home-cooked meals are less common in busy households. At the same time, children spend far more time on screens and far less playing outdoors than previous generations, so they take in more calories and burn fewer.',
    body2: 'Governments and communities can respond in several ways. After the UK taxed sugary drinks in 2018, many producers cut the sugar in their products, and Chile\'s black warning labels significantly reduced purchases of unhealthy food. Alongside such measures, schools should serve healthier meals, increase physical-education time, and teach both children and parents about nutrition.',
  },
  'Overreliance on Fast Food & Processed Foods': {
    kw: 'people consume more processed and fast food than fresh home-cooked meals · main causes · how governments and communities can address it',
    thesis: 'Nhịp sống bận rộn và sự tiện lợi giá rẻ của đồ ăn nhanh là nguyên nhân chính khiến con người lệ thuộc vào thực phẩm chế biến sẵn, nhưng chính phủ và cộng đồng có thể ứng phó bằng trợ giá thực phẩm tươi, dạy kỹ năng nấu ăn và siết chặt quảng cáo.',
    intro: 'People today eat far more processed and fast food than fresh, home-cooked meals. This essay will discuss the main causes of this shift and how governments and communities can address the resulting health concerns.',
    body1: 'The principal cause is convenience under time pressure. Long working hours and long commutes leave families with little time or energy to cook, and fast food is cheap, quick and available on almost every street. Declining cooking skills and aggressive marketing reinforce the habit, and in some low-income "food deserts" there are barely any shops selling fresh produce at all.',
    body2: 'A range of policies can shift the balance back. Governments can subsidise fruit and vegetables so that healthy eating is affordable; a fruit-and-vegetable voucher scheme trialled with low-income families in the United States clearly increased how much fresh food they ate. Clear nutrition labelling, restrictions on junk-food advertising and cooking lessons in schools also help communities rebuild healthier habits.',
  },
  'Severe Traffic Congestion in Urban Areas': {
    kw: 'traffic congestion in major cities is worsening · longer commuting times and increased pollution · effects on urban residents · solutions governments can adopt',
    thesis: 'Ùn tắc giao thông gây lãng phí thời gian, ô nhiễm và thiệt hại kinh tế, nhưng chính phủ có thể giảm bớt bằng cách đầu tư mạnh cho giao thông công cộng và áp dụng phí vào trung tâm.',
    intro: 'Traffic congestion is becoming steadily worse in large cities, lengthening journeys and adding to pollution. This essay will consider the effects this has on urban residents and the solutions governments can use to relieve the pressure.',
    body1: 'The effects are wide-ranging. Residents lose hours each week sitting in traffic, which lowers productivity and raises stress, while exhaust fumes and noise damage health. There is also a heavy economic cost: studies estimate that congestion costs major cities billions of dollars a year in wasted time and fuel, and unreliable roads make businesses less efficient.',
    body2: 'Governments have proven tools to tackle the problem. Heavy investment in fast, frequent public transport gives people a real alternative to the car. Demand-management measures also work well: after London introduced a congestion charge in 2003, traffic entering the centre fell by around 30% and journey speeds improved. Compact planning and flexible working hours can further spread demand.',
  },
  'Overreliance on Private Motor Vehicles': {
    kw: 'most city commuters prefer private cars and motorbikes over public transit · effects on environment and society · measures to promote public transport',
    thesis: 'Việc lệ thuộc vào xe cá nhân gây ô nhiễm nặng, ùn tắc và lối sống ít vận động, nhưng các thành phố có thể khắc phục bằng cách xây dựng giao thông công cộng chất lượng cao và mạnh dạn hạn chế ô tô ở trung tâm.',
    intro: 'In most cities, commuters still prefer private cars and motorbikes to buses or trains. This essay will examine the effects of this preference on the environment and society and suggest measures to encourage the use of public transport.',
    body1: 'The effects are largely negative. Road transport is one of the largest sources of greenhouse-gas emissions in many developed countries, and private vehicles also cause chronic congestion, frequent accidents and a loss of public space to roads and parking. Because people drive rather than walk or cycle, they are also less physically active.',
    body2: 'To reverse this, cities need to make public transport genuinely attractive and cars less convenient. Upgrading buses and rail so they are fast, affordable and widespread is essential, alongside cycle lanes and pedestrian zones. Bolder steps also help: Oslo has removed almost all on-street parking from its centre and replaced it with space for people, sharply cutting car use.',
  },
  'Rising Freight Transport by Heavy Trucks': {
    kw: 'freight moved long distances by heavy trucks rather than rail or water · effects of reliance on road transport · solutions',
    thesis: 'Vận chuyển hàng hóa bằng xe tải hạng nặng gây ô nhiễm, hư hại hạ tầng và tai nạn, nhưng có thể giảm bớt bằng cách chuyển hàng đường dài sang đường sắt và đường thủy cùng tiêu chuẩn khí thải nghiêm ngặt hơn.',
    intro: 'A large share of goods is transported over long distances by heavy trucks instead of by rail or water. This essay will discuss the effects of this reliance on road freight and the solutions that could address its negative impacts.',
    body1: 'The effects are significant. Per tonne of cargo, heavy trucks produce far more carbon dioxide and fine particulate pollution than trains or barges. They also wear out road surfaces much faster than cars, forcing public budgets to spend heavily on repairs, and their size makes crashes on motorways especially serious and disruptive.',
    body2: 'The clearest solution is to shift long-distance freight back to rail and inland waterways, as Switzerland has done through its "Alpine Initiative" to protect its mountain valleys from pollution. This can be supported by stricter emissions standards, incentives for electric and low-emission trucks, and better-planned logistics hubs that cut the number of empty or half-full journeys.',
  },
  'Decline in Walking and Cycling Habits': {
    kw: 'fewer citizens choose to walk or cycle for daily short-distance journeys · effects · how urban planners can encourage non-motorized travel',
    thesis: 'Việc ít đi bộ và đạp xe khiến người dân kém khỏe hơn và làm giao thông đô thị ô nhiễm hơn, nhưng các nhà quy hoạch có thể đảo ngược bằng cách xây làn đường an toàn, mở rộng phố đi bộ và triển khai xe đạp công cộng.',
    intro: 'For everyday short trips, fewer city residents now choose to walk or cycle. This essay will examine the effects of this change and how urban planners can encourage people to return to non-motorised travel.',
    body1: 'The effects are felt in both health and the environment. As people walk and cycle less, rates of obesity and heart disease rise, and the extra motor vehicles on the road bring more air pollution, congestion and accidents. Streets also become less lively and social when they are dominated by traffic rather than people.',
    body2: 'Planners can reverse the trend by making active travel the safe and obvious choice. Building separated cycle lanes and wide pavements, as Copenhagen has done over several decades, has made cycling the main way most of its residents travel. Pedestrian priority zones, lower speed limits, "walk to school" schemes and public bike-share systems all reinforce the habit.',
  },
  'Shorter Work Week': {
    kw: 'working week should be shorter · workers should have a longer weekend · agree or disagree',
    thesis: 'Dù một số ngành đặc thù khó áp dụng, tôi đồng ý rằng tuần làm việc nên ngắn hơn vì bằng chứng cho thấy điều này cải thiện sức khỏe và cân bằng cuộc sống mà không làm giảm năng suất.',
    intro: 'Some people believe that the working week should be cut and the weekend extended. Although this would be difficult in a few sectors, I largely agree, because the evidence suggests that shorter hours improve well-being without harming output.',
    body1: 'The strongest argument in favour is that a shorter week reduces burnout and gives people time for family, study and community life. Importantly, it does not appear to cost productivity: a large four-day-week trial in Iceland between 2015 and 2019 found that output stayed the same or improved while employees reported far less stress, and many UK firms that trialled it in 2022 chose to keep it.',
    body2: 'The main counter-argument is practical. In healthcare, emergency services and some small businesses, cutting hours may require hiring extra staff, which raises costs, and there is a risk that the same work is simply squeezed into fewer, more intense days. These concerns are real, but they call for careful, sector-by-sector implementation rather than rejecting the idea altogether.',
  },
  'Remote Work as the Future': {
    kw: 'working from home will become the main way people work in the future · agree or disagree',
    thesis: 'Dù làm việc từ xa sẽ ngày càng phổ biến trong các ngành văn phòng, tôi không hoàn toàn đồng ý rằng nó sẽ trở thành cách làm việc chính của phần lớn mọi người, vì vô số công việc thiết yếu vẫn phải làm trực tiếp.',
    intro: 'It is often claimed that working from home will become the dominant mode of work. While remote work will certainly keep expanding in office-based fields, I do not fully agree that it will become the main way most people work.',
    body1: 'There are good reasons to expect further growth. Video-conferencing and cloud tools are now mature, and after 2020 companies such as Twitter and Spotify told staff they could work from home permanently. For many employers, remote work cuts office costs and widens the talent pool, while employees save commuting time and money.',
    body2: 'However, most of the global workforce cannot work remotely at all. Factory workers, nurses, farmers, builders and retail staff must be physically present, and these jobs make up the majority of employment worldwide. Even in office work, firms report that training new staff and building team culture are harder from a distance, so a hybrid model is more likely than a fully remote future.',
  },
  'Job Satisfaction vs. Salary': {
    kw: 'job satisfaction is more important than a high salary · agree or disagree',
    thesis: 'Dù một mức lương ổn định là điều thiết yếu, tôi đồng ý rằng sự hài lòng trong công việc quan trọng hơn lương cao vì nó ảnh hưởng trực tiếp đến sức khỏe tinh thần và chất lượng cuộc sống lâu dài.',
    intro: 'Some people argue that being satisfied with your work matters more than earning a large salary. While money certainly cannot be ignored, I agree that job satisfaction is ultimately more important.',
    body1: 'The central reason is that work occupies most of our waking lives for decades. A tedious or stressful job, however well paid, damages mental and physical health, whereas people who find their work meaningful tend to be more productive and stay in a role far longer. Many workplace surveys confirm that, once pay covers basic needs, purpose and good colleagues become the strongest drivers of loyalty.',
    body2: 'The opposing view is that a low income creates financial insecurity that harms the whole family, and for someone supporting dependents, a well-paid but dull job can be the responsible choice. This is a fair point, but it mainly applies below a certain income level; beyond that threshold, extra money adds little to happiness while an unfulfilling job continues to take a toll.',
  },
  'Unenjoyable Employment vs. Unemployment': {
    kw: 'better to be unemployed than to stay in a job that they do not enjoy · to what extent do you agree or disagree',
    thesis: 'Dù một công việc thực sự độc hại có thể là ngoại lệ, tôi không đồng ý rằng thất nghiệp nhìn chung tốt hơn một công việc không như ý, vì thu nhập, kỹ năng và cấu trúc mà công việc mang lại thường quan trọng hơn.',
    intro: 'Some people claim that it is preferable to have no job at all than to remain in one that gives no enjoyment. I disagree with this in most cases, although I accept that a genuinely toxic workplace is an exception.',
    body1: 'The main reason to keep even an unsatisfying job is that work provides far more than a wage. It supplies income, professional skills, social contact and a daily structure, all of which are lost during unemployment. Research in occupational psychology consistently finds that long-term joblessness is one of the experiences that lowers life satisfaction the most, comparable to divorce or bereavement, and a gap on a CV makes the next job harder to find.',
    body2: 'That said, the argument has some force when a job is actively harmful. A workplace with an abusive manager, unsafe conditions or punishing hours can damage mental health as much as unemployment does, and a short, planned break to retrain or change direction may then be worthwhile. In such situations leaving can be sensible, but simply disliking a job is not, on its own, a good reason to become unemployed.',
  },
  'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes': {
    kw: 'subsidising fruits and vegetables · taxing junk food · discuss both views and give your own opinion',
    thesis: 'Dù trợ giá thực phẩm lành mạnh giúp giảm gánh nặng cho người nghèo, tôi cho rằng đánh thuế đồ ăn vặt là chiến lược hiệu quả hơn vì bằng chứng cho thấy nó vừa giảm tiêu thụ vừa tạo nguồn thu cho y tế.',
    intro: 'To make people eat better, some argue that governments should subsidise fresh produce, while others favour taxing unhealthy food. This essay will consider both approaches before giving my own view that taxation is the stronger option.',
    body1: 'Supporters of subsidies point out that healthy eating is often a matter of cost. Fruit and vegetables can be expensive, especially for low-income families, so lowering their price is a positive, non-punitive way to guide diets and it also supports local farmers. The weakness is that subsidies are expensive for the state and do nothing to discourage the junk food that causes the harm.',
    body2: 'Advocates of taxation argue that raising the price of unhealthy products both cuts consumption and generates revenue for health programmes. Real-world evidence backs this up: after Mexico taxed sugary drinks in 2014, purchases fell by around 8% over two years, with the biggest drop among the poorest households, and manufacturers reformulated products to contain less sugar. Critics say such taxes hit the poor hardest, but this can be offset by using the money for health services in disadvantaged areas.',
  },
  'Funding Priorities: Free Public Libraries vs. Internet Infrastructure': {
    kw: 'government should provide free public libraries · waste of money because people can find information on the internet · discuss both views and give your own opinion',
    thesis: 'Dù internet giúp thông tin dễ tiếp cận hơn, tôi tin rằng chính phủ vẫn nên tài trợ thư viện công miễn phí vì chúng cung cấp không gian, sự hướng dẫn và dịch vụ cộng đồng mà một kết nối mạng đơn thuần không thể thay thế.',
    intro: 'Some people believe the government should fund a free public library in every town, while others see this as wasteful now that information is available online. This essay will discuss both positions before explaining why I support continued library funding.',
    body1: 'Those who would cut library funding argue that the internet has made a physical collection of books largely redundant. Almost any fact can be looked up instantly and cheaply, and in rural areas a fast broadband connection arguably helps more people than a single building. Public budgets are limited, so the money might be better spent on digital infrastructure.',
    body2: 'However, this view misunderstands what modern libraries do. Helsinki\'s central library, "Oodi", attracts millions of visitors a year and offers workshops, recording studios, meeting rooms and staff who help people find reliable information. Libraries provide a quiet, free place to study and services for children, the elderly and jobseekers. These social functions cannot be replaced by an internet connection alone, which is why I believe they deserve public support.',
  },
  'National Fitness Funding: Elite Athletes vs. Grassroots Sports': {
    kw: 'build more sports facilities to train top athletes · build facilities that ordinary people can use · discuss both views and give your own opinion',
    thesis: 'Dù việc tài trợ cho vận động viên đỉnh cao đem lại niềm tự hào và hình mẫu, tôi cho rằng đầu tư vào cơ sở thể thao cộng đồng là hướng đi hợp lý hơn vì nó cải thiện sức khỏe toàn dân và giảm chi phí y tế lâu dài.',
    intro: 'Governments must decide whether to fund elite training centres or everyday community facilities. This essay will discuss both priorities before arguing that grassroots provision should come first.',
    body1: 'Supporters of elite funding argue that international medals bring national pride and unite the public, and that successful athletes inspire children to take up sport. There is some truth to this "inspiration effect". However, the benefits are narrow: after the UK spent heavily on elite sport before the 2012 Olympics, its medal count rose sharply but the share of adults exercising regularly barely moved.',
    body2: 'Investing in community facilities such as local pools, pitches and gyms benefits the whole population directly. When ordinary people of all ages can exercise cheaply near home, rates of obesity and heart disease fall, which reduces the long-term burden on health services. Because this improves millions of lives rather than a handful, I believe grassroots sport is the wiser use of limited public money.',
  },
  'Economic Support: Higher Education vs. Vocational Training': {
    kw: 'invest more money in vocational training and trade skills · prioritise university education · discuss both views and give your own opinion',
    thesis: 'Dù giáo dục đại học là nền tảng cho nghiên cứu và đổi mới, tôi cho rằng chính phủ nên dành nhiều nguồn lực hơn cho đào tạo nghề vì nó giải quyết trực tiếp tình trạng thiếu thợ lành nghề và mở ra việc làm ổn định cho nhiều người hơn.',
    intro: 'Governments face a choice between funding universities and funding practical vocational training. This essay will weigh both views before explaining why I would give greater priority to vocational education.',
    body1: 'The case for prioritising universities is that they drive research, innovation and a knowledge-based economy, and graduates still tend to earn above-average salaries. Countries with high university-completion rates also attract more high-value technology industries. The drawback is that an over-supply of graduates can leave many young people in debt and in jobs that do not require a degree.',
    body2: 'Vocational training, by contrast, tackles skills shortages head-on. Germany\'s "dual system", which combines classroom study with paid apprenticeships, is widely credited with the country\'s low youth unemployment. Such courses are shorter and cheaper, lead to secure, well-paid trades, and suit students who are not drawn to academic study. Because these benefits are broad and immediate, I believe governments should shift more resources towards this path.',
  },
  'Rise in Eco-Tourism': {
    kw: 'organising tours to remote regions and rural communities is becoming popular · positive or negative development for local residents and their environment',
    thesis: 'Dù du lịch sinh thái có nguy cơ gây quá tải cho những vùng thiên nhiên nhạy cảm, về tổng thể đây là một xu hướng tích cực vì nó gắn thu nhập với việc bảo tồn và nâng cao ý thức môi trường.',
    intro: 'Tours to remote areas and rural communities are growing in popularity. This essay will argue that, although there are real risks, this is on balance a positive development for local people and the environment.',
    body1: 'On the positive side, eco-tourism links income directly to conservation. Costa Rica built its tourism industry around protecting its rainforests, and the revenue this generates has helped the country reverse deforestation. Visitors also leave with a greater understanding of environmental issues, and remote communities gain jobs as guides, hosts and producers that reduce pressure to log or hunt.',
    body2: 'The main danger is that success brings crowds. At some hotspots, rapid growth in visitor numbers has eroded trails, disturbed wildlife and pushed up local living costs, and some "green" tours are little more than marketing. These problems, however, can be managed through visitor limits, certification schemes and rules that keep profits in the community, so they do not outweigh the overall benefits.',
  },
  'Transition to Electric Vehicles': {
    kw: 'governments promoting electric vehicles to combat air pollution and reduce carbon emissions · positive or negative development',
    thesis: 'Dù việc sản xuất pin và nguồn điện còn nhiều vấn đề, việc chuyển sang xe điện về tổng thể là bước phát triển tích cực vì nó cắt giảm ô nhiễm không khí đô thị và giảm lệ thuộc nhiên liệu hóa thạch.',
    intro: 'Many governments are actively promoting electric vehicles in order to cut air pollution and carbon emissions. This essay will argue that, despite some drawbacks, this is a positive development.',
    body1: 'The clearest benefit is cleaner air in cities. Electric cars produce no exhaust fumes at the point of use, which reduces the respiratory and heart disease linked to traffic pollution. They also cut a country\'s dependence on imported oil and are cheaper to run and maintain. Incentives can shift the market quickly: in Norway, tax breaks have pushed electric vehicles to more than 80% of new car sales.',
    body2: 'There are genuine costs. Mining the lithium and cobalt for batteries damages local environments, and if the electricity grid still runs mainly on coal, the climate gain is limited. High purchase prices and sparse charging networks also slow adoption in poorer countries. These issues are serious, but they are being reduced as grids decarbonise and battery recycling improves, so the overall direction remains beneficial.',
  },
  'Growth of Renewable Energy Infrastructure': {
    kw: 'countries investing heavily in renewable energy such as wind and solar rather than fossil fuels · positive or negative development',
    thesis: 'Dù năng lượng tái tạo còn thách thức về tính ổn định và chi phí, việc mở rộng hạ tầng này là bước phát triển tích cực vì nó là cách thực tế nhất để cắt giảm khí thải và tăng an ninh năng lượng.',
    intro: 'A growing number of countries are investing heavily in renewable energy rather than in fossil fuels. This essay will argue that this is a positive development overall, despite some real challenges.',
    body1: 'The main advantage is environmental. Wind and solar power produce almost no greenhouse gases, so expanding them is the most practical way to slow climate change and reduce air pollution. Renewables also improve energy security, since a country that generates its own electricity is less exposed to volatile oil and gas prices: in 2023, renewables produced more of the EU\'s electricity than fossil fuels for the first time.',
    body2: 'The drawbacks are largely technical and financial. Wind and solar output varies with the weather, so without heavy investment in storage and grid upgrades there is a risk of blackouts, and the initial construction cost is high. However, these problems are being solved as battery technology matures and costs fall, so they do not change the fundamentally positive nature of the shift.',
  },
  'Conversion of Urban Spaces to Local Community Gardens': {
    kw: 'public parks and open spaces being turned into community gardens where residents grow fruit and vegetables · positive or negative development',
    thesis: 'Dù đất đô thị luôn khan hiếm, việc chuyển đổi các không gian bỏ trống thành vườn cộng đồng nhìn chung là bước phát triển tích cực vì nó cung cấp thực phẩm tươi, tăng mảng xanh và gắn kết cư dân.',
    intro: 'In some cities, unused public land is being converted into community gardens for residents to grow their own produce. This essay will argue that this is, on balance, a positive development.',
    body1: 'Such gardens bring several benefits. They supply fresh vegetables to local neighbourhoods, improving diet and food security, as thousands of vacant lots turned into gardens in Detroit have shown. They also add greenery that cools the city and absorbs rainwater, and, perhaps most importantly, they bring neighbours together to work on a shared project, reducing isolation and teaching children about nature.',
    body2: 'The obvious drawback is that urban land is scarce and could be used for badly needed housing, and a garden may fall into neglect if too few residents maintain it. These are fair concerns, but community gardens usually occupy small, otherwise idle plots and can be run on flexible leases, so the wider social and environmental gains outweigh the loss of a modest amount of building land.',
  },
  'Public vs. Private Healthcare': {
    kw: 'good health is a basic human right · medical services should not be run by profit-making companies · do the disadvantages of private healthcare outweigh the advantages',
    thesis: 'Dù các bệnh viện tư có thể bổ sung nguồn lực và rút ngắn thời gian chờ, tôi cho rằng nhược điểm của một hệ thống y tế vì lợi nhuận lớn hơn ưu điểm vì nó có xu hướng đặt khả năng chi trả lên trên nhu cầu chữa bệnh.',
    intro: 'It is often argued that, because health is a basic right, medical care should not be provided by profit-making firms. This essay will argue that the disadvantages of private healthcare do indeed outweigh its advantages.',
    body1: 'Private providers do offer some benefits. Competition can shorten waiting times for those who can pay, and private investment brings additional funding, staff and new technology into a system. In countries where the public sector is overstretched, private clinics take some pressure off state hospitals.',
    body2: 'However, the drawbacks are more serious. A profit motive tends to prioritise ability to pay over medical need, so the poor receive worse care and prevention is neglected because it is less lucrative than treatment. Comparative studies show that the United States, where healthcare is private-led, spends far more per person yet has a lower life expectancy than many countries with public systems. This suggests that market forces are the wrong basis for essential medical care.',
  },
  'Consumerism and Society': {
    kw: 'people are buying more consumer goods than ever before · positive or negative development',
    thesis: 'Dù việc mua sắm nhiều giúp duy trì tăng trưởng và việc làm, tôi cho rằng đây phần lớn là xu hướng tiêu cực vì nó tạo ra lượng rác thải khổng lồ, khai thác tài nguyên quá mức và nuôi dưỡng lối sống chạy theo vật chất.',
    intro: 'People around the world now buy far more consumer goods than in the past. This essay will argue that, although this has economic benefits, it is largely a negative development.',
    body1: 'On the positive side, high consumer demand keeps economies growing and sustains millions of jobs in manufacturing, retail and transport. It also means that ordinary people can afford goods and conveniences that were once luxuries, and competition between companies drives useful innovation.',
    body2: 'The costs, however, are heavy. Producing and disposing of so many goods generates enormous waste and over-exploits natural resources: McKinsey estimates that people now buy around 60% more clothing than 15 years ago but keep each item half as long. A culture of constant buying also fuels household debt and a sense of dissatisfaction, as people measure themselves against what others own. For these reasons the trend does more harm than good.',
  },
  'Government Funding for the Arts': {
    kw: 'government should spend money supporting the arts · money should be spent on healthcare and education instead · discuss both views and give your own opinion',
    thesis: 'Dù chi tiêu cho y tế và giáo dục rõ ràng là cấp thiết, tôi cho rằng chính phủ vẫn nên tài trợ nghệ thuật ở mức hợp lý vì nghệ thuật gìn giữ bản sắc văn hóa và có thể mang lại lợi ích kinh tế đáng kể cho địa phương.',
    intro: 'Some believe governments should fund the arts, while others think the money would be better spent on healthcare and education. This essay will discuss both views before arguing that a moderate level of arts funding is still justified.',
    body1: 'Those who oppose arts funding make a strong practical case. In a country with overcrowded hospitals and under-resourced schools, the same money spent on doctors, nurses or teachers would meet more urgent needs and, arguably, save lives. They also argue that the arts can raise their own income through tickets, sponsorship and private donations.',
    body2: 'However, the arts deliver benefits that markets alone will not provide. They preserve a nation\'s cultural heritage for future generations and can regenerate whole areas: after the Guggenheim Museum opened in Bilbao, the declining city attracted millions of tourists a year, an effect now known as the "Bilbao effect". Arts education also develops creativity in children. Provided health and education remain the priority, I believe a reasonable level of arts funding is worthwhile.',
  },
  'Youth Crime and Solutions': {
    kw: 'children and teenagers are committing more crimes · why is this happening · how should young offenders be punished',
    thesis: 'Đói nghèo và thiếu cơ hội là nguyên nhân chính khiến tội phạm vị thành niên gia tăng, và cách xử lý hiệu quả nhất là kết hợp các chương trình phòng ngừa với hình phạt mang tính phục hồi thay vì chỉ dựa vào nhà tù.',
    intro: 'In many countries, more children and teenagers are becoming involved in crime. This essay will examine why this is happening and how young offenders should be dealt with.',
    body1: 'The main causes are social. Poverty, family breakdown and a lack of jobs or safe activities leave many young people with little to lose and vulnerable to being drawn into gangs. Exposure to violence online and a shortage of positive role models make matters worse, and where opportunities are scarce, youth crime rates are consistently higher.',
    body2: 'Punishment for young offenders should focus on rehabilitation rather than imprisonment. For minor crimes, measures such as community service, supervision and counselling keep young people connected to school, work and family, which reduces reoffending. Prevention is even more effective: Scotland sharply cut violent youth crime by treating knife crime as a public-health issue and investing in early support rather than longer sentences. Prison should be reserved for the most serious cases.',
  },
  'Prison vs. Rehabilitation': {
    kw: 'all offenders should be sent to prison · better alternatives for minor crimes such as community service · discuss both views and give your own opinion',
    thesis: 'Dù việc giam giữ là cần thiết với những tội phạm nguy hiểm, tôi cho rằng đối với các tội nhẹ, những biện pháp thay thế như lao động công ích thuyết phục hơn vì chúng ít tốn kém hơn và giúp giảm tái phạm.',
    intro: 'Some people believe every offender should be imprisoned, while others argue that minor crimes are better dealt with through alternatives such as community service. This essay will discuss both views before giving my own opinion.',
    body1: 'The argument for imprisoning all offenders is that prison deters crime, removes dangerous people from society and reassures victims that wrongdoing has consequences. For violent or repeat offenders, this protective function is essential. The weakness of a blanket policy, however, is that prisons quickly become overcrowded and extremely expensive, and short sentences for minor crimes often make matters worse by cutting people off from work and family.',
    body2: 'For less serious offences, alternatives are more effective. Community service, probation and treatment programmes keep offenders in their communities, cost far less and have better outcomes: Norway\'s rehabilitation-focused prison system has one of the lowest reoffending rates in the world. I therefore believe prison should be reserved for those who genuinely threaten public safety, while minor offenders are given a chance to make amends.',
  },
  'Dịch Câu - Môi Trường & Khí Hậu': {
    kw: 'increasing levels of pollution and climate change · causes · solutions',
    thesis: 'Việc đốt nhiên liệu hóa thạch và nạn phá rừng là nguyên nhân chính của ô nhiễm và biến đổi khí hậu, nhưng chuyển dịch sang năng lượng sạch cùng hợp tác quốc tế mạnh mẽ có thể giải quyết những vấn đề này.',
    intro: 'Rising pollution and climate change are among the greatest threats facing the planet. This essay will discuss the main causes of these problems and the solutions that could be put in place.',
    body1: 'The principal causes are the burning of fossil fuels and the destruction of forests. Coal, oil and gas power stations, along with cars and heavy industry, release vast amounts of carbon dioxide, while clearing land for farming removes the trees that would absorb it. Over-consumption and wasteful use of energy in wealthy countries add further pressure.',
    body2: 'A combination of solutions is required. Countries need to switch rapidly to renewable energy, improve energy efficiency and put a price on carbon so that polluters pay. International cooperation is essential, as shown by the 2015 Paris Agreement, the first time almost every nation committed to limiting global warming. Reforestation, better public transport and a shift towards a circular economy would reinforce these efforts.',
  },
  'Dịch Câu - Công Nghệ & Truyền Thông': {
    kw: 'rapid advancement of technology · transformed the way people communicate and work · advantages and disadvantages',
    thesis: 'Dù công nghệ và truyền thông hiện đại làm nảy sinh những vấn đề như tin giả và nghiện màn hình, khả năng kết nối con người và mở rộng tiếp cận tri thức khiến lợi ích của sự phát triển này lớn hơn tác hại.',
    intro: 'Rapid technological progress has changed the way people communicate and work almost beyond recognition. This essay will examine both the advantages and the disadvantages of this development.',
    body1: 'The main advantages are connection and access. People can now communicate instantly across the world, work remotely, and reach information and services that were once limited to a few. Online learning platforms such as Khan Academy, for example, provide free lessons to millions of students in places that lack good schools, while automation has raised productivity in many industries.',
    body2: 'The disadvantages centre on misuse and dependence. An MIT study found that false news spreads on social media around six times faster than true news, and heavy screen use is linked to shorter attention spans and weaker face-to-face skills. Automation also threatens some jobs, and a digital divide leaves poorer groups behind. On balance, though, these problems can be managed, and the benefits are greater.',
  },
  'Dịch Câu - Giáo Dục & Thanh Niên': {
    kw: 'education system is under pressure to prepare students for the modern world · causes · effects',
    thesis: 'Áp lực thi cử và một chương trình học nặng lý thuyết là nguyên nhân chính khiến hệ thống giáo dục quá tải, gây căng thẳng cho học sinh và khoảng cách giữa kỹ năng được đào tạo và nhu cầu thực tế.',
    intro: 'Education systems in many countries are under growing pressure to prepare young people for a fast-changing world. This essay will explore the causes of this pressure and the effects it produces.',
    body1: 'The pressure has several causes. Exams and league tables push schools to focus narrowly on test results, and families and society expect ever-higher qualifications in an intensely competitive job market. At the same time, curricula remain heavy on theory and slow to add the practical, digital and critical-thinking skills that modern workplaces demand.',
    body2: 'The effects are visible in students and in the economy. In South Korea, most students attend private academies until late at night, to the point that the government has imposed a curfew to reduce stress, and rates of anxiety among young people have risen. Meanwhile, employers complain that graduates lack workplace skills, creating a mismatch between what schools teach and what society needs. Finland, which sets little homework and few standardised tests, shows that this pressure is not inevitable.',
  },
  'Dịch Câu - Sức Khỏe & Đô Thị Hóa': {
    kw: 'rapid urbanisation has a significant impact on people\'s health and wellbeing in cities · effects · solutions governments can implement',
    thesis: 'Đô thị hóa nhanh gây ra những hệ quả nghiêm trọng cho sức khỏe như ô nhiễm không khí và lối sống chật chội, ít vận động, nhưng chính phủ có thể giảm bớt bằng cách quy hoạch nhiều không gian xanh và đầu tư mạnh cho giao thông công cộng.',
    intro: 'Rapid urbanisation is having a major effect on the health and well-being of city residents. This essay will discuss these effects and the solutions that governments can implement.',
    body1: 'The health effects are significant. As cities grow quickly, air pollution, noise and a shortage of green space contribute to millions of cases of respiratory and heart disease each year, according to the WHO. Overcrowded, expensive housing raises stress levels, and car-dependent, screen-based city life leaves many residents dangerously inactive, while access to healthcare is often uneven between rich and poor districts.',
    body2: 'Governments have several tools to respond. Planning rules can require parks, tree cover and walkable, cycle-friendly streets in every new development, and heavy investment in clean public transport reduces both pollution and inactivity. Stricter limits on vehicle and factory emissions protect air quality, and expanding local clinics and community health programmes helps close the gap in medical access. The UN projects that two thirds of the world will live in cities by 2050, so acting now is essential.',
  },
  'Dịch Câu - Kinh Tế & Toàn Cầu Hóa': {
    kw: 'globalisation has brought significant changes to economies · its effects are not always positive · to what extent do you agree or disagree',
    thesis: 'Dù toàn cầu hóa đã giúp giảm nghèo và thúc đẩy tăng trưởng ở nhiều nơi, tôi đồng ý rằng tác động của nó không phải lúc nào cũng tích cực vì nó cũng làm gia tăng bất bình đẳng, gây ô nhiễm và đe dọa các nền văn hóa địa phương.',
    intro: 'Globalisation has reshaped economies around the world, and it is often said that its effects are not always beneficial. I largely agree with this view, although the picture is mixed.',
    body1: 'On the positive side, globalisation has driven remarkable economic progress. Since joining the World Trade Organization in 2001, China has lifted hundreds of millions of people out of poverty, and freer trade has lowered prices, transferred technology and created jobs in many developing countries. Consumers everywhere have access to a far wider range of goods.',
    body2: 'However, the benefits are unevenly shared. Many communities in developed countries have seen factories close as production moved to cheaper locations, widening inequality, and rapid industrialisation has caused severe pollution in producing nations. Global brands and media can also erode distinctive local cultures and traditions. Because these harms are real and widespread, I agree that the effects of globalisation are not always positive.',
  },
};

// ── builder ──────────────────────────────────────────────────────────────
function buildEssaySections(topicName, essayType, prompt) {
  const e = ESSAY[topicName];
  const a = AUG[topicName];
  if (!e || !a) return null;

  const conclusion = a.conclusion.en;
  const sampleSections = [
    { title: 'Introduction', content: e.intro },
    { title: 'Body Paragraph 1', content: e.body1 },
    { title: 'Body Paragraph 2', content: e.body2 },
    { title: 'Conclusion', content: conclusion },
  ];

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
