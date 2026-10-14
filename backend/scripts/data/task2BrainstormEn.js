'use strict';

// English brainstorm ideas for the Task 2 lesson hub (topic.brainstormHints).
// Same topics / same order of points as AUG[topic].a / .b in task2Augment.js
// — those Vietnamese lists stay as they are because task2Essays.js prints
// them into the Vietnamese "Phân tích đề" sections.
//
// augmentTopics() uses these for brainstormHints when a topic has an entry
// here; scripts/applyTask2BrainstormEn.js writes them to existing topics.

const SIDE_LABELS_EN = {
  advantages_disadvantages: ['Advantages', 'Disadvantages'],
  cause_effect:             ['Causes', 'Effects'],
  cause_solution:           ['Causes', 'Solutions'],
  effect_solution:          ['Effects', 'Solutions'],
  agree_disagree:           ['Reasons to agree', 'Reasons to disagree / counter-arguments'],
  discuss_both_views:       ['View 1', 'View 2'],
  positive_or_negative_development: ['Positive aspects', 'Negative aspects'],
};

const BRAINSTORM_EN = {
  'Technology in Education': {
    a: ['Flexible learning anytime, anywhere', 'Wider access to education for remote areas and working adults', 'Lower costs: no commuting, digital materials, larger classes'],
    b: ['Lack of face-to-face interaction → lower motivation, higher dropout', 'Dependence on devices and a stable internet connection', 'Hard to concentrate; easily distracted when studying at home'],
  },
  'Mobile Devices and Communication': {
    a: ['Instant, low-cost communication across borders', 'Access to information and services anytime, anywhere', 'Staying connected with family and friends far away'],
    b: ['Less face-to-face communication, shallower relationships', 'Phone addiction, distraction and poor concentration', 'Privacy risks and the rapid spread of fake news'],
  },
  'Influence of Social Media': {
    a: ['Fast, free news from many perspectives', 'Everyone has a voice and can hold the powerful to account', 'Connects communities and spreads charitable causes'],
    b: ['Fake news and misinformation spread very quickly', 'Echo chambers make views more extreme', 'Harm to mental health: comparison, addiction, anxiety'],
  },
  'Wearable Health Technologies & AI Smart Devices': {
    a: ['Continuous health monitoring and early detection of problems', 'Motivation to exercise, sleep well and eat sensibly', 'Less pressure on hospitals: warnings before illness becomes serious'],
    b: ['Sensitive health data may be leaked or sold', 'Health anxiety and an obsession with numbers', 'Inaccurate readings can lead to misdiagnosis'],
  },
  'High Rates of University Dropout': {
    a: ['Financial hardship; students have to work long hours part-time', 'Choosing the wrong major, losing motivation, lack of direction', 'Not ready for the independent study university demands'],
    b: ['Individuals: tuition debt and lower lifetime earnings', 'Society: wasted training resources, shortage of highly skilled workers', 'Employers struggle to recruit enough qualified staff'],
  },
  'Decline in STEM Course Enrolments': {
    a: ['Science subjects seen as difficult and dull at school', 'Shortage of good teachers and laboratories', 'Students do not see clear career or salary prospects'],
    b: ['Future shortage of engineers, doctors and researchers', 'Slower technological innovation and national productivity', 'Reliance on foreign experts; brain drain'],
  },
  'Online Learning and Student Motivation': {
    a: ['Little direct interaction with or supervision from teachers', 'Many distractions in the home environment', 'No classmates, so no sense of competition or community'],
    b: ['Late assignments, lower grades, more students dropping out', 'Shallower acquisition of skills and knowledge', 'Social isolation and weaker attachment to school'],
  },
  'Dropout Rates in Higher Education': {
    a: ['High study costs force students to work long hours', 'Expectations do not match the reality of the course', 'Mental health: stress and loneliness when living away from home'],
    b: ['Individuals lose career opportunities and carry debt', 'Universities waste places and teaching resources', 'Society lacks skilled workers; inequality increases'],
  },
  'Rise in Modern Mental Stress & Anxiety': {
    a: ['Work and financial pressure, fierce competition', 'Social media: constant comparison and information overload', 'Social isolation and lack of community support'],
    b: ['Schools and companies offer accessible counselling services', 'Teach stress-management skills from an early age', 'Reduce the stigma of mental illness through media and policy'],
  },
  'Urban Sedentary Lifestyle': {
    a: ['Office jobs and long hours in front of screens', 'Cities lack pavements, parks and safe cycle lanes', 'Reliance on private vehicles and passive home entertainment'],
    b: ['Urban planning that prioritises walking, cycling and green space', 'Employers encourage activity: active breaks, on-site gyms', 'Media and schools raise awareness of physical activity'],
  },
  'Growing Rates of Childhood Obesity': {
    a: ['Fast food and sugary drinks are cheap and heavily advertised', 'Children spend hours on screens and play less outdoors', 'Busy parents cook fewer meals at home'],
    b: ['Tax sugary drinks and restrict advertising aimed at children', 'Schools provide healthy meals and more PE lessons', 'Nutrition education for parents and pupils'],
  },
  'Overreliance on Fast Food & Processed Foods': {
    a: ['Busy lifestyles leave little time for cooking', 'Fast food is cheap, convenient and everywhere', 'Declining cooking skills and aggressive marketing'],
    b: ['Government subsidies for fresh fruit and vegetables', 'Teach cooking and nutrition in schools', 'Clear nutrition labels and limits on advertising'],
  },
  'Severe Traffic Congestion in Urban Areas': {
    a: ['Wasted time, lower productivity and more stress', 'Air and noise pollution harm public health', 'Higher fuel and logistics costs damage the economy'],
    b: ['Invest in fast, punctual public transport', 'Congestion charges for city centres and parking limits', 'Compact planning, remote work and staggered working hours'],
  },
  'Overreliance on Private Motor Vehicles': {
    a: ['Sharp rise in emissions and air pollution', 'Congestion, more accidents and cars taking up urban space', 'People exercise less and depend on fossil fuels'],
    b: ['Upgrade buses and trains: fast, cheap, wide coverage', 'Cycle lanes, pedestrian streets and car-restricted zones', 'Discounted travel passes; taxes and fees on private cars'],
  },
  'Rising Freight Transport by Heavy Trucks': {
    a: ['High CO2 and fine-dust emissions per tonne of goods', 'Roads deteriorate quickly, with high maintenance costs', 'Serious accidents and congestion on motorways'],
    b: ['Shift long-distance freight to rail and waterways', 'Strict emission standards and support for electric trucks', 'Plan logistics hubs and optimise delivery routes'],
  },
  'Decline in Walking and Cycling Habits': {
    a: ['Less exercise → more obesity and heart disease', 'More motor vehicles → pollution, congestion, accidents', 'Less lively streets and weaker community ties'],
    b: ['Build separate cycle lanes and wide, safe pavements', 'Pedestrian zones, speed limits and priority for walkers', '"Walk to school" schemes and public bike-sharing'],
  },
  'Shorter Work Week': {
    a: ['More rest → less burnout and better health', 'Many studies show productivity stays the same or rises', 'More time for family, study and volunteering'],
    b: ['Some sectors (healthcare, services) cannot easily cut hours', 'Small businesses worry about the cost of hiring more staff', 'Cramming work into four days may cause more stress'],
  },
  'Remote Work as the Future': {
    a: ['Saves commuting time and costs; companies can hire globally', 'Video-conferencing and cloud technology are now mature', 'Many large corporations allow long-term remote work'],
    b: ['Many manual and service jobs must be done on site', 'Harder to build team spirit and train new staff', 'Blurred work–life boundaries can lead to burnout'],
  },
  'Job Satisfaction vs. Salary': {
    a: ['We spend most of our lives working, so satisfaction matters', 'A boring job causes stress and harms health, even if well paid', 'Satisfied employees work more effectively and stay longer'],
    b: ['Low pay causes financial insecurity and affects the family', 'For low earners, salary is a matter of survival', 'A high salary opens doors to education, housing and early retirement'],
  },
  'Unenjoyable Employment vs. Unemployment': {
    a: ['A job still provides income, skills and routine', 'Long-term unemployment causes depression and lost confidence', 'Gaps in a CV make it harder to find work later'],
    b: ['A truly bad job may harm health more than unemployment', 'Taking time off to retrain or change direction can be worthwhile', 'Savings or benefits make the risk smaller'],
  },
  'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes': {
    a: ['Subsidising fruit and vegetables helps poor families afford healthy food', 'A positive incentive rather than a punishment', 'Supports local farmers'],
    b: ['Taxing junk food cuts consumption and raises money for healthcare', 'Real-world evidence shows sugar taxes reduce soft-drink sales', 'Forces manufacturers to reformulate products with less sugar'],
  },
  'Funding Priorities: Free Public Libraries vs. Internet Infrastructure': {
    a: ['Internet: everyone can look things up; cheaper in the long run', 'Many believe online information is already sufficient', 'Tight public budgets mean digital infrastructure should come first'],
    b: ['Free libraries: study space and support for people without internet', 'Services for children, the elderly and job seekers', 'Preserve culture and host community events'],
  },
  'National Fitness Funding: Elite Athletes vs. Grassroots Sports': {
    a: ['Funding elite athletes: medals and national pride', 'Sports stars inspire young people', 'Attracts sponsorship, tourism and international events'],
    b: ['Funding community sport makes the whole population healthier', 'Lower healthcare costs because people exercise more', 'Public facilities serve far more people'],
  },
  'Economic Support: Higher Education vs. Vocational Training': {
    a: ['Universities drive research, innovation and national expertise', 'A degree is still linked to above-average earnings', 'A knowledge economy needs many highly skilled workers'],
    b: ['Vocational training tackles the immediate shortage of skilled trades', 'Shorter, cheaper courses with secure job prospects', 'Not everyone is suited to an academic path'],
  },
  'Rise in Eco-Tourism': {
    a: ['Generates income linked to nature conservation', 'Raises tourists\' environmental awareness', 'Creates jobs for local communities in remote areas'],
    b: ['Too many visitors damage fragile ecosystems', 'Many "green" tours are just marketing (greenwashing)', 'Profits go to large companies, not local people'],
  },
  'Transition to Electric Vehicles': {
    a: ['Lower emissions and less urban air pollution', 'Less dependence on imported fossil fuels', 'Lower running and maintenance costs in the long run'],
    b: ['Mining lithium and cobalt damages the environment', 'Charging may still rely on coal if the grid is not green', 'Expensive cars and too few charging points in developing countries'],
  },
  'Growth of Renewable Energy Infrastructure': {
    a: ['Cuts greenhouse gas emissions and tackles climate change', 'Energy security: no reliance on imported oil and gas', 'Creates new jobs in the clean energy sector'],
    b: ['Wind and solar power are intermittent and need large-scale battery storage', 'High upfront investment that requires subsidies', 'Panels and turbines take up land and create waste at the end of their life'],
  },
  'Conversion of Urban Spaces to Local Community Gardens': {
    a: ['Fresh produce and better neighbourhood food security', 'Builds community, reduces isolation and teaches children about nature', 'More green space and a weaker urban heat-island effect'],
    b: ['Urban land is scarce and could be used for affordable housing', 'Gardens are easily abandoned without people to maintain them', 'Small yields cannot meet large-scale food needs'],
  },
  'Public vs. Private Healthcare': {
    a: ['Public healthcare: everyone is treated, rich or poor', 'Lower administrative costs and better bargaining power on drug prices', 'Focus on prevention and public health'],
    b: ['Private healthcare: competition can shorten waiting times', 'Brings extra resources and new technology', 'But may put profit before patients\' needs'],
  },
  'Consumerism and Society': {
    a: ['High consumption drives economic growth and jobs', 'People have access to more goods and comforts', 'Competition encourages product innovation'],
    b: ['More waste and resource extraction harm the environment', 'A shopping culture causes debt, comparison and dissatisfaction', 'Products break quickly; "fast fashion" is wasteful'],
  },
  'Government Funding for the Arts': {
    a: ['Healthcare and education are more urgent needs for most people', 'The arts can raise private sponsorship and ticket revenue', 'Limited public budgets force governments to set priorities'],
    b: ['The arts are cultural heritage that must be preserved for future generations', 'Museums and theatres attract tourism and regenerate local economies', 'Arts in schools develop creative thinking'],
  },
  'Youth Crime and Solutions': {
    a: ['Poverty, lack of education and broken families', 'Few healthy activities; pressure from bad peer groups', 'Online violence and a lack of positive role models'],
    b: ['Invest in prevention: education, jobs and community activities', 'Restorative justice instead of prison alone', 'Family support and early counselling for at-risk children'],
  },
  'Prison vs. Rehabilitation': {
    a: ['Imprisoning all offenders deters crime and isolates dangerous people', 'Shows society takes crime seriously and reassures victims', 'But prisons are overcrowded and expensive'],
    b: ['For minor crimes: community service, probation, drug treatment', 'A focus on rehabilitation reduces reoffending', 'Cheaper, and keeps offenders connected to family and work'],
  },
  'Dịch Câu - Môi Trường & Khí Hậu': {
    a: ['Burning fossil fuels, deforestation and industry', 'Transport emissions and intensive farming', 'Overconsumption and wasted energy'],
    b: ['Switch to renewable energy and save electricity', 'International cooperation and carbon taxes', 'Reforestation, public transport and a circular economy'],
  },
  'Dịch Câu - Công Nghệ & Truyền Thông': {
    a: ['Fast, cheap access to information, education and services', 'Connects people across borders; enables remote work', 'Automation raises productivity'],
    b: ['Fake news, internet addiction and loss of privacy', 'Job losses from automation; the digital divide', 'Less face-to-face communication and depth'],
  },
  'Dịch Câu - Giáo Dục & Thanh Niên': {
    a: ['Exam pressure and high expectations from family and society', 'Theory-heavy curricula lacking practical skills', 'Competition for jobs and rapid technological change'],
    b: ['Students become stressed, unmotivated and mentally unwell', 'Skills do not match labour-market needs', 'Curriculum reform: teach critical thinking and vocational skills'],
  },
  'Dịch Câu - Sức Khỏe & Đô Thị Hóa': {
    a: ['Air pollution, noise and a lack of green space', 'Cramped housing, stressful lives and little exercise', 'Unequal access to healthcare between areas'],
    b: ['Green planning: parks, footpaths and cycle lanes', 'Invest in public transport and control emissions', 'Expand primary healthcare and community health programmes'],
  },
  'Dịch Câu - Kinh Tế & Toàn Cầu Hóa': {
    a: ['Lifts hundreds of millions out of poverty and boosts trade', 'Technology transfer, new jobs and cheaper goods', 'Global exchange of culture and knowledge'],
    b: ['Rising inequality; jobs moving overseas', 'Pollution and resource exploitation in producing countries', 'Erosion of local cultural identity'],
  },
  'Decline in Reading Habits': {
    a: ['Young people\'s vocabulary, background knowledge and concentration decline', 'Weaker writing skills and critical thinking', 'Less empathy and cultural understanding without exposure to literature'],
    b: ['Schools and libraries run reading clubs and free-reading time', 'Promote books through social media, influencers and reading apps', 'Parents set an example and read with children from an early age'],
  },
  'Academic Pressure on Teenagers': {
    a: ['High parental expectations and a culture that values qualifications', 'High-stakes exams, rankings and competition for top schools', 'Social media amplifies comparison of achievements'],
    b: ['Fewer high-stakes exams; more varied assessment (projects, coursework)', 'Schools provide counselling and teach stress management', 'Educate parents about the harm of excessive pressure'],
  },
  'Individual vs. Government Responsibility': {
    a: ['Only governments and large corporations can create change on the scale needed', 'Individual actions are tiny compared with industrial emissions', 'Without policy, individual efforts are discouraging and short-lived'],
    b: ['Millions of individual choices add up to a large impact', 'Changes in public behaviour pressure businesses and governments to act', 'Green consumer habits spread through communities and to the next generation'],
  },
  'Car-Free Days vs. Alternative Solutions': {
    a: ['Car-free days raise awareness and show how pleasant car-free streets can be', 'Cheap and easy to organise; builds political momentum for lasting change', 'Cut pollution and noise immediately on the day'],
    b: ['Long-term measures work better: public transport, cycle lanes, congestion charges', 'Car-free days are symbolic, with only a one-off effect', 'Lasting change needs infrastructure investment and emission standards'],
  },
  'Lack of Fluency in Foreign Languages': {
    a: ['Large classes focused on grammar and exams rather than communication', 'Few chances to practise with native speakers or use the language for real', 'Teachers with limited pronunciation/speaking skills; students afraid of mistakes'],
    b: ['Communicative teaching: less translation, more speaking and listening', 'Smaller classes; films, podcasts and language-exchange apps', 'Exchange programmes, summer camps and speaking assessments'],
  },
  'Lack of Practical Life Skills': {
    a: ['Individuals: debt from poor budgeting, poor diet from not being able to cook', 'Individuals: anxiety, longer dependence on parents, delayed independence', 'Society: more personal bankruptcies and lifestyle-related healthcare costs'],
    b: ['Make personal finance, cooking and basic repairs compulsory subjects', 'Project-based learning: class budgets, meal planning, spending plans', 'Parents give children chores and small financial responsibilities early'],
  },
};

module.exports = { SIDE_LABELS_EN, BRAINSTORM_EN };
