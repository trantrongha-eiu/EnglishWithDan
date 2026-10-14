/**
 * "Từ vựng chủ đề" for standalone Writing Task 2 prompts (writing.html,
 * shown under "Phân tích đề"). Applied by scripts/fillWritingTask2Vocab.js.
 *
 * Prompts whose text is identical to a weekly-course Task2Topic need no
 * entry here — writingService.attachTask2Vocab borrows that topic's list at
 * request time. This file covers the rest:
 *   - FROM_TOPIC: near-identical wording of a course topic → copy that
 *     topic's vocabularyList (by topicName).
 *   - LISTS: hand-written lists, [term, definitionVi, example] tuples.
 *
 * Keyed by WritingTask2 _id.
 */

const FROM_TOPIC = {
  '69e86945d4a26e0e1ef31203': 'Mobile Devices and Communication',   // smartphones & tablets changed communication
  '6a3d1e42a64d86d76bf66400': 'Mobile Devices and Communication',   // time spent on digital devices
  '6a3bc26d6e41a07162431dbc': 'Influence of Social Media',          // social media as a news source
  '6a74098166bdb38d66a0c6c8': 'Academic Pressure on Teenagers',     // pressure to achieve high grades
  '6a905d2231a29bc08f2e5a71': 'Decline in STEM Course Enrolments',
  '6a905d2731a29bc08f2e5a7b': 'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes',
  '6a905d2731a29bc08f2e5a7c': 'Funding Priorities: Free Public Libraries vs. Internet Infrastructure',
  '6a9313479ca5a616963131a1': 'Funding Priorities: Free Public Libraries vs. Internet Infrastructure',
  '6a905d2731a29bc08f2e5a7d': 'National Fitness Funding: Elite Athletes vs. Grassroots Sports',
  '6a905d2931a29bc08f2e5a81': 'Growth of Renewable Energy Infrastructure',
  '6a905d2931a29bc08f2e5a82': 'Conversion of Urban Spaces to Local Community Gardens',
  '6a905d2a31a29bc08f2e5a85': 'Government Funding for the Arts',
  '6a905d2a31a29bc08f2e5a86': 'Youth Crime and Solutions',
  '6a905d2a31a29bc08f2e5a87': 'Prison vs. Rehabilitation',
  '6a910cb4fd0973a6cd2b3a0c': 'Remote Work as the Future',          // working from home / hybrid model
};

// ── Shared lists (the same prompt entered more than once) ─────────────
const SUBJECTS_BREADTH = [
  ['a broad-based curriculum', 'chương trình học đa dạng, bao quát', 'A broad-based curriculum exposes older pupils to both the sciences and the humanities.'],
  ['well-rounded knowledge', 'kiến thức toàn diện', 'Studying many subjects gives teenagers well-rounded knowledge of the world.'],
  ['specialise in a field', 'chuyên sâu vào một lĩnh vực', 'Students who specialise in a field early can reach a higher level before university.'],
  ['in-depth understanding', 'hiểu biết sâu sắc', 'Focusing on fewer subjects allows an in-depth understanding of each one.'],
  ['keep career options open', 'giữ nhiều lựa chọn nghề nghiệp', 'A wide range of subjects helps teenagers keep their career options open.'],
  ['academic workload', 'khối lượng học tập', 'Taking too many subjects increases the academic workload and causes stress.'],
  ['transferable skills', 'kỹ năng có thể áp dụng ở nhiều lĩnh vực', 'Different subjects develop transferable skills such as analysis and writing.'],
  ['superficial knowledge', 'kiến thức hời hợt, nông', 'Covering too many subjects may leave students with only superficial knowledge.'],
  ['university entrance requirements', 'yêu cầu đầu vào đại học', 'Specialised study prepares students better for university entrance requirements.'],
  ['discover their strengths', 'khám phá thế mạnh của bản thân', 'A wider curriculum gives pupils the chance to discover their strengths.'],
];

const GAMES_VS_SPORTS = [
  ['sedentary lifestyle', 'lối sống ít vận động', 'Hours of gaming encourage a sedentary lifestyle among children.'],
  ['screen time', 'thời gian dùng màn hình', 'Parents should set clear limits on their children\'s screen time.'],
  ['addictive design', 'thiết kế gây nghiện', 'Many games use addictive design, such as daily rewards, to keep children playing.'],
  ['physical fitness', 'thể lực, sức khỏe thể chất', 'Regular sport improves children\'s physical fitness and coordination.'],
  ['childhood obesity', 'béo phì ở trẻ em', 'A lack of exercise is a major contributor to childhood obesity.'],
  ['team spirit', 'tinh thần đồng đội', 'Football and basketball teach children team spirit and cooperation.'],
  ['problem-solving skills', 'kỹ năng giải quyết vấn đề', 'Some strategy games can sharpen children\'s problem-solving skills.'],
  ['a lack of safe outdoor space', 'thiếu không gian ngoài trời an toàn', 'In crowded cities, a lack of safe outdoor space keeps children indoors.'],
  ['social isolation', 'sự cô lập xã hội', 'Gaming alone for long periods can lead to social isolation.'],
  ['strike a balance between', 'cân bằng giữa', 'Children need to strike a balance between digital entertainment and physical activity.'],
];

const LISTS = {
  // Broad vs specialised subjects for older schoolchildren
  '69ccec5d84749e2f69dfb2a4': SUBJECTS_BREADTH,
  '69ead8d512d21842dfb93022': SUBJECTS_BREADTH,

  // Recycling taught at school or at home
  '69ccec6b84749e2f69dfb2a9': [
    ['environmental awareness', 'nhận thức về môi trường', 'Schools can raise environmental awareness through practical projects.'],
    ['waste reduction', 'giảm thiểu rác thải', 'Lessons on waste reduction teach children to reuse rather than throw away.'],
    ['sort recyclable materials', 'phân loại vật liệu tái chế', 'Children can learn to sort recyclable materials in the school canteen.'],
    ['single-use plastics', 'đồ nhựa dùng một lần', 'Families can avoid single-use plastics by carrying reusable bags.'],
    ['lead by example', 'làm gương', 'Parents who recycle at home lead by example.'],
    ['form lifelong habits', 'hình thành thói quen suốt đời', 'Habits formed in childhood often become lifelong habits.'],
    ['the national curriculum', 'chương trình giảng dạy quốc gia', 'Recycling could be included in the national curriculum as part of science lessons.'],
    ['a sense of responsibility', 'tinh thần trách nhiệm', 'Daily chores at home give children a sense of responsibility for the environment.'],
    ['reinforce lessons', 'củng cố bài học', 'Parents can reinforce lessons that children have learned at school.'],
    ['a joint effort', 'nỗ lực chung', 'Teaching children to protect the environment should be a joint effort between families and schools.'],
  ],

  // Being rich = the chance to help others
  '69ccec7d84749e2f69dfb2ae': [
    ['philanthropy', 'hoạt động từ thiện', 'Philanthropy allows wealthy people to fund schools and hospitals.'],
    ['donate to charity', 'quyên góp cho tổ chức từ thiện', 'Many billionaires donate to charity on a regular basis.'],
    ['financial security', 'sự an toàn về tài chính', 'For most people, the main benefit of wealth is financial security for their families.'],
    ['a comfortable lifestyle', 'cuộc sống sung túc', 'Money also buys a comfortable lifestyle and more free time.'],
    ['give back to society', 'đóng góp lại cho xã hội', 'Successful entrepreneurs often feel a duty to give back to society.'],
    ['the less fortunate', 'những người kém may mắn', 'Wealth can be used to support the less fortunate in the community.'],
    ['social inequality', 'bất bình đẳng xã hội', 'Generous donations can help to reduce social inequality.'],
    ['personal freedom', 'tự do cá nhân', 'Many people value the personal freedom that money brings above everything else.'],
    ['charitable foundation', 'quỹ từ thiện', 'Bill Gates set up a charitable foundation to fight disease in poor countries.'],
    ['make a lasting impact', 'tạo ra ảnh hưởng lâu dài', 'A rich person can make a lasting impact by funding education.'],
  ],

  // Raise fuel prices to solve environmental problems
  '69ccec8684749e2f69dfb2b3': [
    ['fuel tax', 'thuế nhiên liệu', 'A higher fuel tax would discourage unnecessary car journeys.'],
    ['carbon emissions', 'khí thải carbon', 'Transport is one of the largest sources of carbon emissions.'],
    ['fossil fuel consumption', 'mức tiêu thụ nhiên liệu hóa thạch', 'Expensive petrol may reduce fossil fuel consumption.'],
    ['low-income households', 'các hộ gia đình thu nhập thấp', 'Higher fuel prices would hit low-income households hardest.'],
    ['the cost of living', 'chi phí sinh hoạt', 'Rising fuel costs push up the cost of living, as goods become more expensive to transport.'],
    ['renewable energy', 'năng lượng tái tạo', 'Governments should invest more in renewable energy such as solar and wind power.'],
    ['public transport', 'giao thông công cộng', 'Affordable public transport is a better way to reduce car use.'],
    ['a multi-faceted problem', 'vấn đề nhiều mặt', 'Environmental damage is a multi-faceted problem that one policy cannot solve.'],
    ['deforestation', 'nạn phá rừng', 'Fuel prices do nothing to stop deforestation or plastic pollution.'],
    ['stricter regulations', 'quy định chặt chẽ hơn', 'Stricter regulations on factories would cut industrial pollution.'],
  ],

  // Computer games vs sports (asked three times)
  '69ccec9b84749e2f69dfb2b8': GAMES_VS_SPORTS,
  '69ead86e12d21842dfb92fc5': GAMES_VS_SPORTS,
  '6a848738c4d5b5ac38bce88d': GAMES_VS_SPORTS,

  // International travel — why, positive or negative
  '69cceca384749e2f69dfb2bd': [
    ['budget airlines', 'hãng hàng không giá rẻ', 'Budget airlines have made overseas trips affordable for ordinary people.'],
    ['rising disposable income', 'thu nhập khả dụng tăng', 'Rising disposable income means more families can travel abroad.'],
    ['broaden one\'s horizons', 'mở rộng tầm nhìn', 'Travelling to other countries helps people broaden their horizons.'],
    ['cultural exchange', 'giao lưu văn hóa', 'International travel encourages cultural exchange and mutual understanding.'],
    ['boost the local economy', 'thúc đẩy kinh tế địa phương', 'Foreign visitors boost the local economy by spending on hotels and food.'],
    ['job opportunities', 'cơ hội việc làm', 'Tourism creates job opportunities in hospitality and transport.'],
    ['carbon footprint', 'lượng khí thải carbon (dấu chân carbon)', 'Frequent flying greatly increases a person\'s carbon footprint.'],
    ['overtourism', 'du lịch quá tải', 'Overtourism has damaged historic sites in cities such as Venice.'],
    ['visa restrictions', 'hạn chế thị thực', 'The easing of visa restrictions has made travel much simpler.'],
    ['work or study overseas', 'làm việc hoặc học tập ở nước ngoài', 'Many young people move abroad to work or study overseas.'],
  ],

  // Preserve historic buildings or replace them
  '69ccecb184749e2f69dfb2c2': [
    ['historic buildings', 'công trình lịch sử', 'Historic buildings tell the story of a city\'s past.'],
    ['cultural heritage', 'di sản văn hóa', 'Old temples and churches are part of a nation\'s cultural heritage.'],
    ['architectural value', 'giá trị kiến trúc', 'Many colonial buildings in Hanoi have great architectural value.'],
    ['sense of identity', 'bản sắc', 'Preserving old districts gives a city a unique sense of identity.'],
    ['attract tourists', 'thu hút khách du lịch', 'Hoi An\'s ancient town attracts tourists from all over the world.'],
    ['restoration costs', 'chi phí trùng tu', 'High restoration costs can be a burden on local governments.'],
    ['urban development', 'phát triển đô thị', 'Rapid urban development often puts old buildings at risk.'],
    ['housing shortage', 'thiếu nhà ở', 'Modern apartment blocks can help to ease the housing shortage.'],
    ['safety standards', 'tiêu chuẩn an toàn', 'Some old structures no longer meet modern safety standards.'],
    ['strike a balance between', 'cân bằng giữa', 'Cities must strike a balance between conservation and modernisation.'],
  ],

  // Open up undiscovered areas for oil and gas
  '69ccecd384749e2f69dfb2c7': [
    ['energy demand', 'nhu cầu năng lượng', 'Global energy demand continues to rise as economies grow.'],
    ['untouched wilderness', 'vùng hoang dã còn nguyên sơ', 'Drilling in untouched wilderness such as the Arctic could destroy fragile ecosystems.'],
    ['fragile ecosystem', 'hệ sinh thái mong manh', 'An oil spill could permanently damage a fragile ecosystem.'],
    ['oil spill', 'sự cố tràn dầu', 'The Deepwater Horizon oil spill polluted thousands of kilometres of coastline.'],
    ['energy security', 'an ninh năng lượng', 'New oil fields would improve a country\'s energy security.'],
    ['non-renewable resources', 'tài nguyên không tái tạo', 'Oil and gas are non-renewable resources that will eventually run out.'],
    ['transition to clean energy', 'chuyển đổi sang năng lượng sạch', 'Investment should go into the transition to clean energy instead.'],
    ['economic growth', 'tăng trưởng kinh tế', 'Supporters argue that new reserves would drive economic growth.'],
    ['biodiversity loss', 'mất đa dạng sinh học', 'Opening up rainforests to drilling would accelerate biodiversity loss.'],
    ['a short-term solution', 'giải pháp ngắn hạn', 'Exploiting new reserves is only a short-term solution to the energy problem.'],
  ],

  // Planning for the future vs living in the present
  '69ccecee84749e2f69dfb2ce': [
    ['long-term goals', 'mục tiêu dài hạn', 'Setting long-term goals gives people direction in life.'],
    ['financial planning', 'lập kế hoạch tài chính', 'Careful financial planning protects families from unexpected costs.'],
    ['live in the moment', 'sống cho hiện tại', 'Some people prefer to live in the moment and enjoy life now.'],
    ['unforeseen circumstances', 'những tình huống bất ngờ', 'Plans can easily be ruined by unforeseen circumstances such as illness.'],
    ['peace of mind', 'sự yên tâm', 'Having savings for retirement brings peace of mind.'],
    ['delayed gratification', 'trì hoãn sự thỏa mãn', 'Delayed gratification, such as studying instead of partying, often pays off later.'],
    ['mental well-being', 'sức khỏe tinh thần', 'Worrying too much about the future can harm mental well-being.'],
    ['adapt to change', 'thích nghi với thay đổi', 'Flexible people adapt to change better than rigid planners.'],
    ['a sense of purpose', 'cảm giác có mục đích', 'Working towards a future goal gives people a sense of purpose.'],
    ['seize opportunities', 'nắm bắt cơ hội', 'Focusing on the present helps people seize opportunities when they appear.'],
  ],

  // Studying abroad — advantages and disadvantages
  '69cced3e84749e2f69dfb2dd': [
    ['study abroad', 'du học', 'More Vietnamese students now choose to study abroad in Australia and the UK.'],
    ['international exposure', 'trải nghiệm môi trường quốc tế', 'International exposure makes graduates more attractive to global employers.'],
    ['language proficiency', 'trình độ ngoại ngữ', 'Living overseas greatly improves a student\'s language proficiency.'],
    ['tuition fees', 'học phí', 'Tuition fees for international students are often extremely high.'],
    ['culture shock', 'sốc văn hóa', 'Many students experience culture shock in their first months abroad.'],
    ['homesickness', 'nỗi nhớ nhà', 'Homesickness can affect students\' concentration and mood.'],
    ['brain drain', 'chảy máu chất xám', 'If graduates stay overseas, their home country suffers from brain drain.'],
    ['become more independent', 'trở nên tự lập hơn', 'Living alone in a foreign country forces students to become more independent.'],
    ['a globally recognised degree', 'bằng cấp được công nhận toàn cầu', 'A globally recognised degree opens doors to international careers.'],
    ['scholarship', 'học bổng', 'Scholarships make studying abroad possible for talented students from poorer families.'],
  ],

  // Self-employment — reasons and disadvantages
  '69cced5184749e2f69dfb2e2': [
    ['self-employed', 'tự kinh doanh, làm chủ', 'Many young people prefer to be self-employed rather than work for a company.'],
    ['flexible working hours', 'giờ làm việc linh hoạt', 'Flexible working hours allow freelancers to plan their own day.'],
    ['be your own boss', 'tự làm chủ', 'The chance to be your own boss is a major attraction.'],
    ['the gig economy', 'nền kinh tế việc làm tự do', 'Platforms such as Grab and Upwork have fuelled the gig economy.'],
    ['irregular income', 'thu nhập không ổn định', 'Freelancers often struggle with an irregular income.'],
    ['job security', 'sự ổn định công việc', 'Self-employed workers have little job security.'],
    ['employee benefits', 'phúc lợi nhân viên', 'They miss out on employee benefits such as paid leave and health insurance.'],
    ['financial risk', 'rủi ro tài chính', 'Starting a business involves considerable financial risk.'],
    ['work-life balance', 'cân bằng công việc và cuộc sống', 'Without fixed hours, it can be hard to maintain a work-life balance.'],
    ['start-up capital', 'vốn khởi nghiệp', 'Many people cannot raise enough start-up capital to begin.'],
  ],

  // Online shopping — benefits and risks
  '6a0be7cc1d7ec40efce5ee00': [
    ['e-commerce platform', 'sàn thương mại điện tử', 'E-commerce platforms such as Shopee offer millions of products.'],
    ['convenience', 'sự tiện lợi', 'The main appeal of online shopping is its convenience.'],
    ['compare prices', 'so sánh giá', 'Shoppers can easily compare prices across different sellers.'],
    ['home delivery', 'giao hàng tận nhà', 'Home delivery saves customers time and travel.'],
    ['counterfeit goods', 'hàng giả', 'Some sellers sell counterfeit goods at suspiciously low prices.'],
    ['online fraud', 'lừa đảo trực tuyến', 'Online fraud remains a serious risk for inexperienced buyers.'],
    ['customer reviews', 'đánh giá của khách hàng', 'Reading customer reviews helps buyers avoid poor-quality products.'],
    ['impulse buying', 'mua sắm bốc đồng', 'One-click payment encourages impulse buying.'],
    ['brick-and-mortar stores', 'cửa hàng truyền thống', 'Many brick-and-mortar stores have closed because of online competition.'],
    ['personal data', 'dữ liệu cá nhân', 'Shoppers must share personal data, which may be stolen or misused.'],
  ],

  // AI and automation replacing human workers
  '6a3d1f11a64d86d76bf67104': [
    ['automation', 'tự động hóa', 'Automation has already replaced many factory jobs.'],
    ['artificial intelligence', 'trí tuệ nhân tạo', 'Artificial intelligence can now answer customer questions instantly.'],
    ['boost productivity', 'tăng năng suất', 'Machines boost productivity because they can work around the clock.'],
    ['cut labour costs', 'cắt giảm chi phí nhân công', 'Companies use robots to cut labour costs.'],
    ['human error', 'lỗi do con người', 'Automated systems reduce human error in tasks such as accounting.'],
    ['job displacement', 'tình trạng mất việc do bị thay thế', 'Job displacement is a major concern for low-skilled workers.'],
    ['repetitive tasks', 'công việc lặp đi lặp lại', 'AI is best suited to repetitive tasks such as data entry.'],
    ['retrain workers', 'đào tạo lại người lao động', 'Governments should help to retrain workers who lose their jobs.'],
    ['widen the income gap', 'nới rộng khoảng cách thu nhập', 'Automation may widen the income gap between skilled and unskilled workers.'],
    ['the human touch', 'sự quan tâm, tương tác của con người', 'Jobs in care and teaching still require the human touch.'],
  ],

  // Cyclists and drivers sharing roads — problems and solutions
  '6a71eabe0404f51873811136': [
    ['road safety', 'an toàn giao thông', 'Mixing bikes and cars on one road creates serious road safety risks.'],
    ['traffic accidents', 'tai nạn giao thông', 'Cyclists are often seriously injured in traffic accidents.'],
    ['vulnerable road users', 'người tham gia giao thông dễ bị tổn thương', 'Cyclists and pedestrians are the most vulnerable road users.'],
    ['dedicated cycle lanes', 'làn đường riêng cho xe đạp', 'Dedicated cycle lanes separate bikes from fast-moving traffic.'],
    ['traffic congestion', 'ùn tắc giao thông', 'Slow cyclists can add to traffic congestion during rush hour.'],
    ['reckless driving', 'lái xe ẩu', 'Reckless driving puts cyclists in danger.'],
    ['traffic regulations', 'luật lệ giao thông', 'Both groups must obey traffic regulations.'],
    ['physical barriers', 'rào chắn vật lý', 'Physical barriers between lanes prevent cars from drifting into bike paths.'],
    ['road-sharing etiquette', 'văn hóa chia sẻ làn đường', 'Driving lessons should teach road-sharing etiquette.'],
    ['urban planning', 'quy hoạch đô thị', 'Good urban planning can make roads safer for everyone.'],
  ],

  // Children watch more TV, less active/creative — reasons and measures
  '6a71eb030404f51873811137': [
    ['passive entertainment', 'giải trí thụ động', 'Television is a form of passive entertainment that requires little effort.'],
    ['busy working parents', 'bố mẹ bận rộn', 'Busy working parents often use TV to keep children occupied.'],
    ['on-demand streaming', 'dịch vụ xem phim theo yêu cầu', 'On-demand streaming means cartoons are available at any time.'],
    ['creative activities', 'hoạt động sáng tạo', 'Creative activities such as drawing and music develop imagination.'],
    ['extracurricular activities', 'hoạt động ngoại khóa', 'Schools should offer more extracurricular activities after class.'],
    ['attention span', 'khả năng tập trung', 'Fast-paced programmes may shorten children\'s attention span.'],
    ['outdoor play', 'vui chơi ngoài trời', 'Outdoor play helps children develop physically and socially.'],
    ['limit screen time', 'giới hạn thời gian xem màn hình', 'Parents should limit screen time to one or two hours a day.'],
    ['community facilities', 'cơ sở vật chất cộng đồng', 'Local councils can build community facilities such as playgrounds and art centres.'],
    ['role model', 'tấm gương', 'Parents who read and exercise act as role models for their children.'],
  ],

  // International tourism seen as bad — reasons and solutions
  '6a71eb1a0404f51873811138': [
    ['mass tourism', 'du lịch đại trà', 'Mass tourism can overwhelm small towns during peak season.'],
    ['overcrowding', 'tình trạng quá đông đúc', 'Residents complain about overcrowding in popular areas.'],
    ['rising property prices', 'giá nhà đất tăng', 'Holiday rentals have led to rising property prices for locals.'],
    ['cultural insensitivity', 'thiếu tôn trọng văn hóa', 'Cultural insensitivity, such as wearing inappropriate clothes in temples, angers locals.'],
    ['environmental degradation', 'suy thoái môi trường', 'Too many visitors cause environmental degradation on beaches.'],
    ['local residents', 'cư dân địa phương', 'Local residents should share in the profits from tourism.'],
    ['sustainable tourism', 'du lịch bền vững', 'Sustainable tourism limits the number of visitors to fragile sites.'],
    ['tourist tax', 'thuế du lịch', 'A tourist tax can fund the repair of local infrastructure.'],
    ['economic benefits', 'lợi ích kinh tế', 'Governments should explain the economic benefits that tourism brings to communities.'],
    ['visitor code of conduct', 'quy tắc ứng xử cho du khách', 'A visitor code of conduct can reduce disrespectful behaviour.'],
  ],

  // Anti-social behaviour and lack of respect — causes and solutions
  '6a71eb3c0404f51873811139': [
    ['anti-social behaviour', 'hành vi chống đối xã hội', 'Vandalism and loud noise at night are common forms of anti-social behaviour.'],
    ['lack of parental supervision', 'thiếu sự giám sát của cha mẹ', 'A lack of parental supervision leaves teenagers free to misbehave.'],
    ['peer pressure', 'áp lực từ bạn bè', 'Peer pressure can push young people into rude or aggressive behaviour.'],
    ['online anonymity', 'tính ẩn danh trên mạng', 'Online anonymity makes people more likely to insult others.'],
    ['erosion of traditional values', 'sự mai một giá trị truyền thống', 'Some blame the erosion of traditional values for the lack of respect.'],
    ['moral education', 'giáo dục đạo đức', 'Schools should put more emphasis on moral education.'],
    ['community service', 'lao động công ích', 'Offenders could be ordered to do community service.'],
    ['social cohesion', 'sự gắn kết xã hội', 'Anti-social behaviour weakens social cohesion in neighbourhoods.'],
    ['impose fines', 'phạt tiền', 'Local authorities can impose fines for littering and vandalism.'],
    ['youth centres', 'trung tâm sinh hoạt thanh thiếu niên', 'Youth centres give teenagers a positive way to spend their free time.'],
  ],

  // People use bicycles less — why and how to encourage cycling
  '6a71eb570404f5187381113a': [
    ['car ownership', 'việc sở hữu ô tô', 'Rising car ownership has reduced the popularity of cycling.'],
    ['urban sprawl', 'đô thị hóa tràn lan', 'Urban sprawl means many people live too far from work to cycle.'],
    ['heavy traffic', 'giao thông đông đúc', 'Heavy traffic makes cycling feel dangerous.'],
    ['air pollution', 'ô nhiễm không khí', 'Cyclists are directly exposed to air pollution on busy roads.'],
    ['bike-sharing schemes', 'hệ thống xe đạp công cộng', 'Bike-sharing schemes in cities like Paris have encouraged more people to cycle.'],
    ['cycling infrastructure', 'cơ sở hạ tầng cho xe đạp', 'Better cycling infrastructure, such as safe lanes and parking, is essential.'],
    ['eco-friendly transport', 'phương tiện thân thiện môi trường', 'Bicycles are the most eco-friendly transport for short trips.'],
    ['financial incentives', 'ưu đãi tài chính', 'Employers can offer financial incentives to staff who cycle to work.'],
    ['shower facilities', 'phòng tắm (tại nơi làm việc)', 'Offices with shower facilities make cycling to work more practical.'],
    ['health benefits', 'lợi ích sức khỏe', 'Campaigns should highlight the health benefits of cycling.'],
  ],

  // Young people leaving school early — causes and solutions
  '6a74047566bdb38d66a0c579': [
    ['drop out of school', 'bỏ học', 'Some teenagers drop out of school to support their families.'],
    ['financial hardship', 'khó khăn tài chính', 'Financial hardship forces some students to start work early.'],
    ['an irrelevant curriculum', 'chương trình học không thực tế', 'Many students lose interest because of an irrelevant curriculum.'],
    ['exam-oriented education', 'giáo dục nặng thi cử', 'Exam-oriented education leaves little room for creativity.'],
    ['lose motivation', 'mất động lực', 'Students who fall behind often lose motivation.'],
    ['vocational training', 'đào tạo nghề', 'Vocational training can keep practical learners in education.'],
    ['career guidance', 'tư vấn hướng nghiệp', 'Good career guidance shows students why qualifications matter.'],
    ['financial assistance', 'hỗ trợ tài chính', 'Financial assistance for poor families reduces dropout rates.'],
    ['limited job prospects', 'triển vọng việc làm hạn chế', 'Early school leavers often face limited job prospects.'],
    ['interactive teaching methods', 'phương pháp dạy học tương tác', 'Interactive teaching methods make lessons more engaging.'],
  ],

  // Digital devices instead of textbooks
  '6a74052d66bdb38d66a0c6c6': [
    ['digital devices', 'thiết bị số', 'Digital devices such as tablets can replace heavy textbooks.'],
    ['interactive learning materials', 'tài liệu học tập tương tác', 'Interactive learning materials include videos and quizzes.'],
    ['up-to-date information', 'thông tin cập nhật', 'E-books can be updated instantly, so students always have up-to-date information.'],
    ['reduce paper consumption', 'giảm tiêu thụ giấy', 'Switching to tablets would reduce paper consumption in schools.'],
    ['digital distraction', 'sự xao nhãng do thiết bị số', 'Digital distraction from games and social media is a major drawback.'],
    ['eye strain', 'mỏi mắt', 'Reading on screens for hours can cause eye strain.'],
    ['the digital divide', 'khoảng cách số', 'Poorer families may not afford devices, widening the digital divide.'],
    ['technical problems', 'sự cố kỹ thuật', 'Technical problems such as flat batteries can interrupt lessons.'],
    ['initial investment', 'khoản đầu tư ban đầu', 'Equipping every classroom requires a large initial investment.'],
    ['deep reading', 'đọc sâu', 'Some research suggests printed books support deep reading better than screens.'],
  ],

  // Compulsory internships while at university
  '6a7409db66bdb38d66a0c6ef': [
    ['work placement', 'kỳ thực tập', 'A work placement allows students to apply theory in a real company.'],
    ['hands-on experience', 'kinh nghiệm thực tế', 'Employers value graduates with hands-on experience.'],
    ['bridge the gap between theory and practice', 'thu hẹp khoảng cách giữa lý thuyết và thực hành', 'Internships bridge the gap between theory and practice.'],
    ['employability', 'khả năng được tuyển dụng', 'Work experience greatly improves graduates\' employability.'],
    ['professional network', 'mạng lưới quan hệ nghề nghiệp', 'Students can build a professional network during their placement.'],
    ['soft skills', 'kỹ năng mềm', 'Internships develop soft skills such as teamwork and communication.'],
    ['unpaid internships', 'thực tập không lương', 'Unpaid internships are unfair to students from poorer families.'],
    ['academic performance', 'kết quả học tập', 'Working while studying may harm students\' academic performance.'],
    ['menial tasks', 'việc vặt', 'Some interns are only given menial tasks such as making photocopies.'],
    ['a smooth transition into employment', 'sự chuyển tiếp suôn sẻ vào công việc', 'Placements ensure a smooth transition into employment after graduation.'],
  ],

  // Celebrities famous for glamour, not achievements
  '6a848738c4d5b5ac38bce894': [
    ['influencer culture', 'văn hóa người có sức ảnh hưởng', 'Influencer culture celebrates wealth rather than talent.'],
    ['materialistic values', 'lối sống/giá trị vật chất', 'Celebrities who flaunt luxury goods promote materialistic values.'],
    ['flaunt their wealth', 'khoe khoang sự giàu có', 'Many stars flaunt their wealth on social media.'],
    ['impressionable young people', 'giới trẻ dễ bị ảnh hưởng', 'Impressionable young people often copy what they see online.'],
    ['role model', 'tấm gương', 'A good role model is admired for hard work, not designer clothes.'],
    ['instant fame', 'nổi tiếng nhanh chóng', 'Social media has made instant fame possible without any real achievement.'],
    ['unrealistic expectations', 'kỳ vọng phi thực tế', 'Glamorous images create unrealistic expectations about life.'],
    ['genuine accomplishments', 'thành tựu thực sự', 'Scientists and athletes are respected for their genuine accomplishments.'],
    ['media literacy', 'khả năng hiểu và phân tích thông tin truyền thông', 'Schools should teach media literacy so teenagers can question what they see.'],
    ['self-esteem', 'lòng tự trọng, sự tự tin', 'Comparing themselves with celebrities can damage teenagers\' self-esteem.'],
  ],

  // Imported films/TV vs domestic production
  '6a848738c4d5b5ac38bce896': [
    ['foreign films', 'phim nước ngoài', 'Foreign films introduce audiences to different ways of life.'],
    ['cultural diversity', 'sự đa dạng văn hóa', 'Imported programmes increase cultural diversity on television.'],
    ['local film industry', 'ngành công nghiệp điện ảnh trong nước', 'Too many Hollywood films may weaken the local film industry.'],
    ['cultural homogenisation', 'sự đồng nhất hóa văn hóa', 'Some fear that global media leads to cultural homogenisation.'],
    ['national identity', 'bản sắc dân tộc', 'Domestic films help to preserve national identity.'],
    ['high production values', 'chất lượng sản xuất cao', 'Imported films often have high production values that local studios cannot match.'],
    ['screen quotas', 'hạn ngạch chiếu phim', 'South Korea once used screen quotas to protect its own cinema.'],
    ['government subsidies', 'trợ cấp của chính phủ', 'Government subsidies can help local producers compete.'],
    ['soft power', 'quyền lực mềm', 'Korean dramas have become a powerful source of soft power.'],
    ['traditional customs', 'phong tục truyền thống', 'Local programmes can showcase traditional customs and festivals.'],
  ],

  // Using animals for human benefit — acceptable or wrong
  '6a848738c4d5b5ac38bce895': [
    ['animal welfare', 'quyền lợi/phúc lợi động vật', 'Strict laws are needed to protect animal welfare.'],
    ['animal testing', 'thử nghiệm trên động vật', 'Animal testing has contributed to the development of vaccines.'],
    ['medical breakthroughs', 'đột phá y học', 'Many medical breakthroughs relied on research on animals.'],
    ['factory farming', 'chăn nuôi công nghiệp', 'Factory farming keeps animals in cramped and painful conditions.'],
    ['ethical concerns', 'mối lo ngại về đạo đức', 'Using animals for entertainment raises serious ethical concerns.'],
    ['endangered species', 'loài có nguy cơ tuyệt chủng', 'Hunting has pushed many endangered species close to extinction.'],
    ['cause unnecessary suffering', 'gây đau đớn không cần thiết', 'Testing cosmetics on animals causes unnecessary suffering.'],
    ['humane treatment', 'đối xử nhân đạo', 'Farm animals deserve humane treatment throughout their lives.'],
    ['alternative methods', 'phương pháp thay thế', 'Scientists are developing alternative methods such as computer models.'],
    ['a source of food', 'nguồn thực phẩm', 'For many communities, livestock remains an essential source of food.'],
  ],

  // Detailed crime reporting should be limited
  '6a848738c4d5b5ac38bce893': [
    ['crime reporting', 'việc đưa tin về tội phạm', 'Detailed crime reporting can frighten the public unnecessarily.'],
    ['copycat crimes', 'tội phạm bắt chước', 'Describing methods in detail may inspire copycat crimes.'],
    ['sensationalism', 'giật gân hóa tin tức', 'Some newspapers rely on sensationalism to sell more copies.'],
    ['public awareness', 'nhận thức của công chúng', 'Crime news raises public awareness of local dangers.'],
    ['the right to know', 'quyền được biết', 'Citizens have the right to know what is happening in their community.'],
    ['fear of crime', 'nỗi sợ tội phạm', 'Constant coverage increases fear of crime, even when crime rates are falling.'],
    ['victims\' privacy', 'quyền riêng tư của nạn nhân', 'Graphic reports can violate victims\' privacy.'],
    ['press freedom', 'tự do báo chí', 'Limiting crime news could threaten press freedom.'],
    ['responsible journalism', 'báo chí có trách nhiệm', 'Responsible journalism reports facts without unnecessary violent details.'],
    ['hold authorities accountable', 'buộc chính quyền chịu trách nhiệm', 'Reporting on crime helps the public hold the police accountable.'],
  ],

  // Economic growth vs environmental harm
  '6a848738c4d5b5ac38bce892': [
    ['economic growth', 'tăng trưởng kinh tế', 'Economic growth has lifted millions of people out of poverty in Asia.'],
    ['lift people out of poverty', 'giúp người dân thoát nghèo', 'Industrialisation helped to lift people out of poverty in China.'],
    ['food security', 'an ninh lương thực', 'Higher incomes improve food security in developing countries.'],
    ['industrialisation', 'công nghiệp hóa', 'Rapid industrialisation often comes at an environmental cost.'],
    ['depletion of natural resources', 'cạn kiệt tài nguyên thiên nhiên', 'Unlimited growth leads to the depletion of natural resources.'],
    ['greenhouse gas emissions', 'khí thải nhà kính', 'Factories release large amounts of greenhouse gas emissions.'],
    ['sustainable development', 'phát triển bền vững', 'Sustainable development aims to grow the economy without harming the planet.'],
    ['green technology', 'công nghệ xanh', 'Investing in green technology can create jobs and cut pollution.'],
    ['living standards', 'mức sống', 'Growth raises living standards through better housing and healthcare.'],
    ['environmental regulations', 'quy định về môi trường', 'Strong environmental regulations can limit the damage caused by growth.'],
  ],

  // Spend more on youth leisure activities instead of education
  '6a848738c4d5b5ac38bce891': [
    ['leisure facilities', 'cơ sở vui chơi giải trí', 'Many towns lack affordable leisure facilities for teenagers.'],
    ['academic pressure', 'áp lực học tập', 'Heavy academic pressure leaves young people little time to relax.'],
    ['recreational activities', 'hoạt động giải trí', 'Recreational activities help young people manage stress.'],
    ['holistic development', 'phát triển toàn diện', 'Sport and art contribute to a child\'s holistic development.'],
    ['public spending', 'chi tiêu công', 'Public spending on education brings long-term economic returns.'],
    ['a skilled workforce', 'lực lượng lao động có tay nghề', 'Education produces the skilled workforce a modern economy needs.'],
    ['burnout', 'kiệt sức', 'Students who never rest are at risk of burnout.'],
    ['keep young people off the streets', 'giữ giới trẻ tránh xa tệ nạn đường phố', 'Youth clubs help to keep young people off the streets.'],
    ['social mobility', 'sự dịch chuyển xã hội (cơ hội đổi đời)', 'Education remains the main route to social mobility for poor children.'],
    ['allocate funds', 'phân bổ ngân sách', 'Governments should allocate funds to both education and leisure.'],
  ],

  // Children should watch TV at home and at school
  '6a848738c4d5b5ac38bce890': [
    ['educational programmes', 'chương trình giáo dục', 'Educational programmes like documentaries can make science come alive.'],
    ['visual learning', 'học qua hình ảnh', 'Television supports visual learning for young children.'],
    ['passive learning', 'học thụ động', 'Watching TV is a form of passive learning with no interaction.'],
    ['critical thinking', 'tư duy phản biện', 'Discussion in class develops critical thinking better than watching a screen.'],
    ['age-appropriate content', 'nội dung phù hợp lứa tuổi', 'Parents must make sure children watch age-appropriate content.'],
    ['short attention span', 'khả năng tập trung ngắn', 'Fast-moving shows may lead to a short attention span.'],
    ['face-to-face interaction', 'tương tác trực tiếp', 'Children learn social skills through face-to-face interaction.'],
    ['a supplementary tool', 'công cụ bổ trợ', 'TV should be a supplementary tool, not a replacement for teachers.'],
    ['physical inactivity', 'sự thiếu vận động', 'Too much TV contributes to physical inactivity.'],
    ['spark curiosity', 'khơi gợi sự tò mò', 'A good nature documentary can spark curiosity about animals.'],
  ],

  // Immediate international action to cut fossil fuels
  '6a848738c4d5b5ac38bce88f': [
    ['fossil fuel consumption', 'mức tiêu thụ nhiên liệu hóa thạch', 'Fossil fuel consumption is the main driver of global warming.'],
    ['climate change', 'biến đổi khí hậu', 'Climate change is causing more frequent floods and droughts.'],
    ['international cooperation', 'hợp tác quốc tế', 'Climate change can only be solved through international cooperation.'],
    ['emission targets', 'mục tiêu cắt giảm khí thải', 'The Paris Agreement sets emission targets for each country.'],
    ['renewable energy sources', 'nguồn năng lượng tái tạo', 'Countries should switch to renewable energy sources like wind and solar.'],
    ['developing nations', 'các quốc gia đang phát triển', 'Developing nations argue that they still need cheap energy to grow.'],
    ['financial support', 'hỗ trợ tài chính', 'Rich countries should provide financial support for poorer nations\' green transition.'],
    ['irreversible damage', 'thiệt hại không thể đảo ngược', 'Delaying action could cause irreversible damage to the planet.'],
    ['rising sea levels', 'mực nước biển dâng', 'Rising sea levels threaten coastal cities such as Ho Chi Minh City.'],
    ['a global crisis', 'một cuộc khủng hoảng toàn cầu', 'Climate change is a global crisis that no country can tackle alone.'],
  ],

  // Why some people work harder; is hard work always good
  '6a848738c4d5b5ac38bce88e': [
    ['intrinsic motivation', 'động lực nội tại', 'People with strong intrinsic motivation work hard without being pushed.'],
    ['financial pressure', 'áp lực tài chính', 'Financial pressure forces many workers to take on extra hours.'],
    ['career advancement', 'thăng tiến sự nghiệp', 'Ambitious employees work long hours for career advancement.'],
    ['personality traits', 'đặc điểm tính cách', 'Personality traits such as perfectionism also play a part.'],
    ['competitive environment', 'môi trường cạnh tranh', 'A competitive environment pushes students to study harder.'],
    ['diligence', 'sự chăm chỉ', 'Diligence is often the key to academic success.'],
    ['burnout', 'kiệt sức', 'Working too hard for too long can lead to burnout.'],
    ['work-life balance', 'cân bằng công việc và cuộc sống', 'A healthy work-life balance keeps people productive.'],
    ['diminishing returns', 'hiệu suất giảm dần', 'After a certain point, extra hours bring diminishing returns.'],
    ['work smarter, not harder', 'làm việc thông minh thay vì chỉ chăm chỉ', 'Good time management helps people work smarter, not harder.'],
  ],

  // Celebrities and media intrusion into private lives
  '6a848738c4d5b5ac38bce88c': [
    ['invasion of privacy', 'xâm phạm quyền riêng tư', 'Photographing a star\'s children is a clear invasion of privacy.'],
    ['paparazzi', 'thợ săn ảnh', 'Paparazzi follow celebrities everywhere to get exclusive photos.'],
    ['public figures', 'người của công chúng', 'Public figures accept some attention as part of their job.'],
    ['the price of fame', 'cái giá của sự nổi tiếng', 'Losing privacy is often described as the price of fame.'],
    ['tabloid journalism', 'báo lá cải', 'Tabloid journalism focuses on gossip rather than real news.'],
    ['public interest', 'lợi ích công chúng', 'Reporting is justified only when it serves the public interest.'],
    ['mental health', 'sức khỏe tinh thần', 'Constant media attention can damage celebrities\' mental health.'],
    ['self-promotion', 'tự quảng bá bản thân', 'Many stars use the media for self-promotion when it suits them.'],
    ['legal protection', 'sự bảo vệ của pháp luật', 'Privacy laws should give celebrities legal protection at home.'],
    ['draw a line between', 'phân định ranh giới giữa', 'The media must draw a line between public roles and private lives.'],
  ],

  // Expecting things instantly — beneficial or harmful
  '6a848738c4d5b5ac38bce88b': [
    ['instant gratification', 'sự thỏa mãn tức thì', 'Technology has created a culture of instant gratification.'],
    ['same-day delivery', 'giao hàng trong ngày', 'Same-day delivery has raised customers\' expectations.'],
    ['on-demand services', 'dịch vụ theo yêu cầu', 'On-demand services let people order food or rides in seconds.'],
    ['boost efficiency', 'nâng cao hiệu quả', 'Fast services boost efficiency in business and daily life.'],
    ['impatience', 'sự thiếu kiên nhẫn', 'Constant speed may breed impatience in young people.'],
    ['delayed gratification', 'trì hoãn sự thỏa mãn', 'Long-term success often depends on delayed gratification.'],
    ['pressure on workers', 'áp lực lên người lao động', 'Instant delivery puts huge pressure on workers such as drivers.'],
    ['superficial information', 'thông tin hời hợt', 'Quick online searches can give only superficial information.'],
    ['a competitive edge', 'lợi thế cạnh tranh', 'Fast service gives companies a competitive edge.'],
    ['environmental cost', 'cái giá về môi trường', 'Express deliveries have a high environmental cost in packaging and fuel.'],
  ],

  // Long working hours to afford basic living — causes and solutions
  '6a910c61fd0973a6cd2b3a06': [
    ['the cost of living', 'chi phí sinh hoạt', 'The cost of living in big cities has risen faster than wages.'],
    ['stagnant wages', 'lương trì trệ, không tăng', 'Stagnant wages force workers to take second jobs.'],
    ['housing affordability', 'khả năng chi trả nhà ở', 'Poor housing affordability is a major cause of long working hours.'],
    ['make ends meet', 'kiếm đủ sống', 'Many families work two jobs just to make ends meet.'],
    ['a living wage', 'mức lương đủ sống', 'Employers should pay a living wage, not just the legal minimum.'],
    ['quality family time', 'thời gian chất lượng bên gia đình', 'Long hours leave parents with little quality family time.'],
    ['overtime culture', 'văn hóa làm thêm giờ', 'An overtime culture makes it hard for staff to leave on time.'],
    ['affordable childcare', 'dịch vụ trông trẻ giá hợp lý', 'Affordable childcare would let parents work fewer hours.'],
    ['social housing', 'nhà ở xã hội', 'Building more social housing would reduce rent pressure.'],
    ['working-hour limits', 'giới hạn giờ làm việc', 'Legal working-hour limits protect employees from exploitation.'],
  ],

  // Older job seekers competing with younger ones
  '6a910c6bfd0973a6cd2b3a07': [
    ['age discrimination', 'phân biệt tuổi tác', 'Age discrimination prevents many experienced workers from finding jobs.'],
    ['an ageing population', 'dân số già hóa', 'An ageing population means more people work beyond 60.'],
    ['outdated skills', 'kỹ năng lỗi thời', 'Some older applicants have outdated skills, especially in technology.'],
    ['salary expectations', 'kỳ vọng mức lương', 'Employers may avoid older candidates because of their higher salary expectations.'],
    ['digital literacy', 'kỹ năng số', 'Training in digital literacy can help older workers compete.'],
    ['lifelong learning', 'học tập suốt đời', 'Lifelong learning programmes keep workers\' skills up to date.'],
    ['a wealth of experience', 'kinh nghiệm dày dặn', 'Older employees bring a wealth of experience to the workplace.'],
    ['anonymous recruitment', 'tuyển dụng ẩn danh', 'Anonymous recruitment removes age from the first stage of hiring.'],
    ['mentoring', 'kèm cặp, hướng dẫn', 'Older staff can provide mentoring for younger colleagues.'],
    ['tax incentives', 'ưu đãi thuế', 'Tax incentives can encourage firms to hire older workers.'],
  ],

  // Moving away from family to find work
  '6a910c76fd0973a6cd2b3a08': [
    ['job opportunities', 'cơ hội việc làm', 'Big cities offer far more job opportunities than rural areas.'],
    ['regional inequality', 'bất bình đẳng giữa các vùng', 'Regional inequality pushes young people to move to the capital.'],
    ['higher wages', 'mức lương cao hơn', 'Higher wages in cities attract workers from the countryside.'],
    ['relocate for work', 'chuyển nơi ở vì công việc', 'Many graduates relocate for work after university.'],
    ['loneliness', 'sự cô đơn', 'Living far from home can lead to loneliness.'],
    ['support network', 'mạng lưới hỗ trợ', 'Migrant workers often lack a support network in a new city.'],
    ['remote work', 'làm việc từ xa', 'Remote work allows some people to stay in their hometowns.'],
    ['regional development', 'phát triển vùng', 'Investment in regional development would create local jobs.'],
    ['relocation allowance', 'trợ cấp chuyển nơi ở', 'Companies can offer a relocation allowance to help new staff settle in.'],
    ['ageing parents', 'cha mẹ già', 'Workers who move away worry about their ageing parents.'],
  ],

  // Women under-represented in senior leadership
  '6a910c82fd0973a6cd2b3a09': [
    ['gender equality', 'bình đẳng giới', 'Gender equality in the workplace has improved but is not complete.'],
    ['the glass ceiling', 'rào cản vô hình (trần kính)', 'Many women still hit the glass ceiling in their careers.'],
    ['senior leadership roles', 'vị trí lãnh đạo cấp cao', 'Women hold only a small share of senior leadership roles.'],
    ['caregiving responsibilities', 'trách nhiệm chăm sóc gia đình', 'Caregiving responsibilities often fall mainly on women.'],
    ['gender stereotypes', 'định kiến giới', 'Gender stereotypes suggest that leaders should be aggressive.'],
    ['unconscious bias', 'thiên kiến vô thức', 'Unconscious bias can affect promotion decisions.'],
    ['shared parental leave', 'nghỉ phép chăm con chia sẻ cho cả bố và mẹ', 'Shared parental leave lets fathers take on more childcare.'],
    ['mentorship programmes', 'chương trình cố vấn', 'Mentorship programmes help talented women prepare for leadership.'],
    ['female role models', 'hình mẫu nữ', 'More female role models would inspire young women.'],
    ['diversity targets', 'chỉ tiêu đa dạng', 'Some governments set diversity targets for company boards.'],
  ],

  // Graduate / youth unemployment
  '6a910c8efd0973a6cd2b3a0a': [
    ['youth unemployment', 'thất nghiệp ở người trẻ', 'Youth unemployment is a growing problem in many countries.'],
    ['a skills mismatch', 'sự lệch pha kỹ năng (giữa đào tạo và nhu cầu)', 'There is a skills mismatch between university courses and employers\' needs.'],
    ['an oversupply of graduates', 'dư thừa cử nhân', 'An oversupply of graduates in business has made jobs hard to find.'],
    ['practical experience', 'kinh nghiệm thực tế', 'Employers prefer candidates with practical experience.'],
    ['a competitive job market', 'thị trường việc làm cạnh tranh', 'Graduates face a competitive job market.'],
    ['internships', 'thực tập', 'Internships help students gain experience before they graduate.'],
    ['professional networking', 'xây dựng quan hệ nghề nghiệp', 'Professional networking can lead to job offers.'],
    ['upskill', 'nâng cao kỹ năng', 'Graduates can upskill through short online courses.'],
    ['a strong portfolio', 'hồ sơ năng lực ấn tượng', 'A strong portfolio shows employers what a candidate can do.'],
    ['in-demand industries', 'ngành đang thiếu nhân lực', 'Students should consider courses in in-demand industries.'],
  ],

  // Workplace burnout — effects and solutions
  '6a910c98fd0973a6cd2b3a0b': [
    ['workplace burnout', 'kiệt sức vì công việc', 'Workplace burnout leaves employees exhausted and unmotivated.'],
    ['chronic stress', 'căng thẳng kéo dài', 'Chronic stress is linked to heart disease and depression.'],
    ['excessive workload', 'khối lượng công việc quá tải', 'An excessive workload is the main cause of burnout.'],
    ['decline in productivity', 'sự sụt giảm năng suất', 'Burnt-out staff cause a decline in productivity.'],
    ['high staff turnover', 'tỉ lệ nghỉ việc cao', 'High staff turnover increases recruitment and training costs.'],
    ['absenteeism', 'tình trạng vắng mặt, nghỉ làm', 'Stress-related illness leads to absenteeism.'],
    ['the right to disconnect', 'quyền ngắt kết nối (ngoài giờ làm)', 'France introduced the right to disconnect from work emails after hours.'],
    ['employee well-being', 'sức khỏe, hạnh phúc của nhân viên', 'Companies should invest in employee well-being programmes.'],
    ['flexible scheduling', 'lịch làm việc linh hoạt', 'Flexible scheduling helps staff manage personal commitments.'],
    ['a supportive work environment', 'môi trường làm việc hỗ trợ', 'A supportive work environment reduces stress and absence.'],
  ],

  // Hard to balance work with the rest of life — reasons and solutions
  '6ac0b78973c776372979799b': [
    ['work-life balance', 'cân bằng công việc và cuộc sống', 'Many people struggle to maintain a healthy work-life balance.'],
    ['always-on culture', 'văn hóa luôn trực tuyến', 'Smartphones have created an always-on culture where staff answer emails at night.'],
    ['long commutes', 'quãng đường đi làm dài', 'Long commutes eat into time for family and exercise.'],
    ['job insecurity', 'sự bất ổn trong công việc', 'Job insecurity makes workers afraid to refuse extra tasks.'],
    ['blur the line between work and home', 'xóa nhòa ranh giới giữa công việc và gia đình', 'Working from home can blur the line between work and home.'],
    ['time management', 'quản lý thời gian', 'Good time management helps people finish tasks within working hours.'],
    ['set boundaries', 'đặt ra giới hạn', 'Employees should set boundaries, such as not checking emails after 7 pm.'],
    ['flexible working arrangements', 'chế độ làm việc linh hoạt', 'Flexible working arrangements allow parents to collect their children.'],
    ['a four-day week', 'tuần làm việc 4 ngày', 'Trials of a four-day week in the UK reported happier staff.'],
    ['leisure time', 'thời gian rảnh rỗi', 'More leisure time improves both health and productivity.'],
  ],
};

// Tuples → the {term, definitionVi, example} shape WritingTask2 stores.
function toVocab(list) {
  return list.map(([term, definitionVi, example]) => ({ term, definitionVi, example }));
}

module.exports = { FROM_TOPIC, LISTS, toVocab };
