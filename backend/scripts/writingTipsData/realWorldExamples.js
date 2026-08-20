'use strict';
// "IELTS Real-World Examples Bank" — facts/examples/templates for Writing
// Task 2, organized as one lesson per topic (matching byType.js's one-lesson-
// per-Task-2-type granularity) plus summary/template/country lessons.
// orderIndex 30-56 — safe range above byBand.js's highest (23), see
// general.js/byType.js/byBand.js for the existing 1-23 range this must not
// collide with.
const { overview, steps, list, example, callout, table, summary, lesson } = require('./builder');

const CATEGORY = 'IELTS Real-World Examples Bank';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'how-to-use', title: 'Cách dùng tài liệu này', icon: '📘', orderIndex: 30,
    summaryText: 'Công thức FACT → EXAMPLE → EXPLANATION → RESULT — một ví dụ tốt không cần dài hay nhiều số liệu.',
    blocks: [
      overview('Trong IELTS Writing Task 2, một ví dụ thực tế tốt không cần quá dài hoặc quá nhiều số liệu.\nHọc sinh nên học theo công thức:\nFACT → EXAMPLE → EXPLANATION → RESULT'),
      example([
        {
          label: 'Ví dụ minh hoạ công thức',
          lines: [
            { tag: 'FACT', text: 'Electric vehicles are becoming increasingly popular worldwide.' },
            { tag: 'EXAMPLE', text: 'More than one in five cars sold globally were electric in 2024.' },
            { tag: 'EXPLANATION', text: 'This shows that consumers are gradually adopting cleaner transportation technologies.' },
            { tag: 'RESULT', text: 'This could reduce dependence on fossil fuels and help governments tackle urban air pollution.' },
          ],
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-education', title: '1. Education (Giáo dục)', icon: '🎓', orderIndex: 31,
    summaryText: 'Bất bình đẳng giáo dục (OECD/PISA 2022) và AI tạo sinh trong giáo dục.',
    blocks: [
      example([
        {
          label: 'FACT 1 – Educational Inequality',
          lines: [
            { tag: 'FACT', text: 'OECD data from PISA 2022 showed that students from more advantaged socio-economic backgrounds performed significantly better in mathematics than disadvantaged students. The average difference among OECD countries was around 93 points.' },
            { tag: 'KEY IDEA', text: 'Family background and economic circumstances can strongly influence educational outcomes.' },
            { tag: 'IELTS EXAMPLE', text: 'For example, OECD data show that students from disadvantaged backgrounds tend to perform significantly worse academically than their wealthier peers, suggesting that family income can strongly influence educational outcomes.' },
            { tag: 'EXPLANATION', text: 'Children from wealthier families may have better access to private tutoring, technology, books and high-quality educational resources.' },
          ],
          note: 'Dùng cho: Free education, Equal opportunities, Government spending, Children from poor families, Private vs public schools, Educational inequality',
        },
        {
          label: 'FACT 2 – Generative AI in Education',
          lines: [
            { tag: 'FACT', text: 'UNESCO has developed global guidance on the use of generative AI in education and research, highlighting both its potential benefits and concerns related to privacy, ethics and responsible use.' },
            { tag: 'KEY IDEA', text: 'AI can improve learning, but it can also create new educational challenges.' },
            { tag: 'IELTS EXAMPLE', text: 'A good example is the growing use of generative AI in education, which can help students access personalised learning materials but also raises concerns about academic integrity and overdependence on technology.' },
            { tag: 'EXPLANATION', text: 'AI can provide personalised explanations and learning materials, but students may become overly dependent on it instead of developing their own critical-thinking and writing skills.' },
          ],
          note: 'Dùng cho: Technology in education, Artificial intelligence, Online learning, Teachers\' roles, Academic integrity, Advantages/disadvantages of technology',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-technology', title: '2. Technology (Công nghệ)', icon: '📱', orderIndex: 32,
    summaryText: 'Smartphone trong trường học và cách phát triển idea về sự xao nhãng.',
    blocks: [
      example([
        {
          label: 'Smartphones in Schools',
          lines: [
            { tag: 'FACT', text: 'By March 2026, UNESCO reported that 114 education systems, representing around 58% of countries, had introduced bans or restrictions on mobile-phone use in schools.' },
            { tag: 'KEY IDEA', text: 'Technology can be useful, but excessive smartphone use can distract students from learning.' },
            { tag: 'IELTS EXAMPLE', text: 'For instance, an increasing number of education systems have restricted the use of smartphones in schools because excessive phone use can distract students from their studies.' },
          ],
          note: 'Chuỗi hữu ích: Technology → Distraction → Education → Young people → Government regulation. Dùng cho: Children and smartphones, Technology in education, Social media, Screen time, Government regulation, Concentration, Children\'s well-being',
        },
      ]),
      steps([
        { title: 'Idea', description: 'Smartphones can negatively affect students\' concentration.' },
        { title: 'Explanation', description: 'Students may spend time checking messages, watching videos or using social media instead of focusing on lessons.' },
        { title: 'Result', description: 'This can reduce concentration and potentially affect academic performance.' },
        { title: 'IELTS sentence', description: 'Although smartphones can provide useful educational resources, excessive use during lessons may distract students and reduce their ability to concentrate.' },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-environment', title: '3. Environment (Môi trường)', icon: '🌱', orderIndex: 33,
    summaryText: 'Ô nhiễm nhựa toàn cầu và các lệnh cấm nhựa dùng một lần.',
    blocks: [
      example([
        {
          label: 'Plastic Pollution',
          lines: [
            { tag: 'FACT', text: 'Humanity produces more than 400 million tonnes of plastic every year, and a significant amount eventually enters the environment.' },
            { tag: 'KEY IDEA', text: 'Modern consumption creates a huge amount of plastic waste.' },
            { tag: 'IELTS EXAMPLE', text: 'The scale of plastic consumption illustrates this problem clearly. According to the UN Environment Programme, humanity produces more than 400 million tonnes of plastic every year, much of which eventually becomes environmental waste.' },
            { tag: 'EXPLANATION', text: 'Plastic is cheap and convenient, so consumers often use it for a short period before throwing it away.' },
            { tag: 'RESULT', text: 'Large amounts of plastic waste can accumulate in landfills, rivers and oceans.' },
          ],
          note: 'Dùng cho: Plastic bags, Environmental protection, Consumerism, Government regulation, Recycling, Individual responsibility, Waste management',
        },
        {
          label: 'Single-Use Plastic Bans',
          lines: [
            { tag: 'FACT', text: 'A number of countries have introduced policies restricting plastic bags and other single-use plastic products.' },
            { tag: 'KEY IDEA', text: 'Government intervention can influence consumer behaviour more effectively than relying solely on individual responsibility.' },
            { tag: 'IELTS EXAMPLE', text: 'For example, bans on certain single-use plastic products show how governments can directly influence consumer behaviour through environmental regulations.' },
          ],
          note: 'Dùng cho: Environmental protection, Plastic pollution, Government intervention, Consumer behaviour, Individual responsibility',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-air-pollution', title: '4. Air Pollution (Ô nhiễm không khí)', icon: '🌫️', orderIndex: 34,
    summaryText: 'Ví dụ "siêu đa năng": chi phí ẩn của phát triển kinh tế.',
    blocks: [
      example([
        {
          label: 'Super Example – Air Pollution',
          lines: [
            { tag: 'FACT', text: "The World Health Organization estimates that around 99% of the world's population lives in places where air quality exceeds WHO guideline limits. Air pollution is also associated with around seven million premature deaths every year." },
            { tag: 'KEY IDEA', text: 'Environmental problems can become major public-health problems.' },
            { tag: 'IELTS EXAMPLE', text: 'Air pollution provides a clear example of the hidden costs of economic development. Although cars and factories contribute to economic activity, excessive emissions can seriously damage public health.' },
          ],
          note: 'Chuỗi: Economic development → More factories and vehicles → More emissions → Air pollution → Health problems. Dùng cho: Cars, Public transport, Fossil fuels, Climate change, Urbanisation, Government responsibility, Health, Economic development, Industrialisation',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-health', title: '5. Health (Sức khỏe)', icon: '🏃', orderIndex: 35,
    summaryText: 'Lối sống ít vận động của người trưởng thành trên toàn thế giới.',
    blocks: [
      example([
        {
          label: 'Physical Inactivity',
          lines: [
            { tag: 'FACT', text: 'The World Health Organization estimates that around 31% of adults worldwide, equivalent to approximately 1.8 billion people, do not meet recommended levels of physical activity.' },
            { tag: 'KEY IDEA', text: 'Modern lifestyles are becoming increasingly sedentary.' },
            { tag: 'IELTS EXAMPLE', text: 'For example, around one-third of adults worldwide do not engage in enough physical activity, partly reflecting the increasingly sedentary nature of modern lifestyles.' },
            { tag: 'EXPLANATION', text: "Office-based work, car use and long periods of screen time can reduce people's opportunities to exercise." },
            { tag: 'RESULT', text: 'A lack of physical activity can contribute to wider public-health problems.' },
          ],
          note: 'Dùng cho: Sedentary lifestyle, Office jobs, Technology, Obesity, Public health, Sports, Government spending, Screen time',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-transport', title: '6. Transport (Giao thông)', icon: '🚗', orderIndex: 36,
    summaryText: 'Xe điện toàn cầu và sự tăng trưởng ở Đông Nam Á.',
    blocks: [
      example([
        {
          label: 'Electric Vehicles',
          lines: [
            { tag: 'FACT', text: 'According to the International Energy Agency, global electric-car sales were expected to reach around 17 million vehicles in 2024, representing more than one-fifth of all cars sold worldwide.' },
            { tag: 'KEY IDEA', text: 'Technological innovation can reduce dependence on fossil fuels.' },
            { tag: 'IELTS EXAMPLE', text: "The rapid growth of electric vehicles demonstrates how technological innovation can gradually reduce society's dependence on fossil fuels." },
            { tag: 'EXPLANATION', text: 'Electric vehicles can reduce the use of petrol and diesel, particularly when electricity comes from renewable sources.' },
          ],
          note: 'Dùng cho: Electric vehicles, Public transport, Climate change, Technology, Fossil fuels, Future transportation, Air pollution',
        },
        {
          label: 'Southeast Asia – Electric Vehicles',
          lines: [
            { tag: 'FACT', text: 'In 2024, electric vehicles accounted for around 9% of car sales in Southeast Asia, almost twice the proportion recorded the previous year.' },
            { tag: 'KEY IDEA', text: 'The transition towards cleaner transportation is also taking place in developing and emerging markets.' },
            { tag: 'IELTS EXAMPLE', text: 'This trend can also be seen in Southeast Asia, where electric vehicles have become increasingly popular as governments and consumers seek cleaner alternatives to conventional cars.' },
          ],
          note: 'Dùng cho: Southeast Asia, Vietnam, Electric vehicles, Climate change, Technology, Transport',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-work', title: '7. Work (Việc làm)', icon: '🏠', orderIndex: 37,
    summaryText: 'COVID-19 và sự trỗi dậy của làm việc từ xa.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Remote Work',
          lines: [
            { tag: 'FACT', text: 'The COVID-19 pandemic forced many companies to close physical offices and move employees to remote working.' },
            { tag: 'KEY IDEA', text: 'Technology allows many office-based jobs to be performed without employees being physically present in an office.' },
            { tag: 'IELTS EXAMPLE', text: 'The COVID-19 pandemic demonstrated that many office-based jobs can be performed remotely, as companies were forced to adopt video-conferencing and cloud-based technologies on a large scale.' },
            { tag: 'ADVANTAGE', text: 'Remote working can reduce commuting time and give employees greater flexibility.' },
            { tag: 'DISADVANTAGE', text: 'However, it may reduce face-to-face interaction and make communication more difficult for some teams.' },
          ],
          note: 'Chuỗi: COVID-19 → Offices closed → Employees worked from home → Companies adopted video-conferencing and cloud platforms → Remote/hybrid working became common. Dùng cho: Working from home, Technology, Work-life balance, Productivity, Office work, Urban transport, Commuting',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-globalisation', title: '8. Globalisation (Toàn cầu hóa)', icon: '📱', orderIndex: 38,
    summaryText: 'Chuỗi cung ứng toàn cầu của một chiếc smartphone.',
    blocks: [
      example([
        {
          label: 'Real-World Example – International Supply Chains',
          lines: [
            { tag: 'FACT', text: 'A modern smartphone may involve design in the United States, components from several countries, manufacturing/assembly in Asia, and global distribution and sales.' },
            { tag: 'KEY IDEA', text: 'Globalisation has made national economies increasingly interconnected.' },
            { tag: 'IELTS EXAMPLE', text: 'The smartphone industry is a good illustration of globalisation, as the design, components, manufacturing and distribution of a single product can involve several different countries.' },
            { tag: 'EXPLANATION', text: 'Countries can specialise in different stages of production according to their skills, resources and costs.' },
            { tag: 'RESULT', text: 'International trade can increase economic interdependence between countries.' },
          ],
          note: 'Dùng cho: Globalisation, International trade, Technology, Multinational companies, Economic interdependence, Manufacturing',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-consumerism', title: '9. Consumerism (Chủ nghĩa tiêu dùng)', icon: '👕', orderIndex: 39,
    summaryText: 'Thời trang nhanh và lãng phí dệt may.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Fast Fashion',
          lines: [
            { tag: 'FACT', text: 'Fast-fashion companies offer inexpensive clothing and frequently introduce new designs, encouraging consumers to purchase clothes more often.' },
            { tag: 'KEY IDEA', text: 'Low prices and rapidly changing trends can encourage excessive consumption.' },
            { tag: 'IELTS EXAMPLE', text: 'The fast-fashion industry illustrates how cheap products can encourage consumers to buy clothes more frequently, which can contribute to excessive waste and environmental pressure.' },
            { tag: 'EXPLANATION', text: 'When clothes are inexpensive, consumers may be less likely to repair them or keep them for a long time.' },
          ],
          note: 'Chuỗi: Cheap clothes → Frequent purchases → Short product lifespan → More textile waste → Environmental problems. Dùng cho: Consumerism, Environment, Advertising, Fashion, Waste, Young people, Sustainable consumption',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-social-media', title: '10. Social Media (Mạng xã hội)', icon: '📲', orderIndex: 40,
    summaryText: 'Tốc độ lan truyền thông tin — và mặt trái là tin giả.',
    blocks: [
      example([
        {
          label: 'Information Spreads Instantly',
          lines: [
            { tag: 'FACT', text: 'A major event occurring in one country can reach people in another country within minutes through platforms such as TikTok, Instagram, Facebook and X.' },
            { tag: 'KEY IDEA', text: 'Social media has dramatically accelerated communication.' },
            { tag: 'IELTS EXAMPLE', text: 'Social media has dramatically accelerated the spread of information. For example, major events can now reach a global audience within minutes rather than days.' },
          ],
          note: 'Dùng cho: Social media, Communication, Globalisation, News, Technology, Information sharing',
        },
        {
          label: 'The Negative Side – Misinformation',
          lines: [
            { tag: 'FACT', text: 'The same technology that allows reliable information to spread quickly can also allow false or misleading information to spread rapidly.' },
            { tag: 'KEY IDEA', text: 'Technological progress can create both benefits and risks.' },
            { tag: 'IELTS EXAMPLE', text: 'However, the same speed can allow misinformation to spread rapidly, making it increasingly difficult for users to distinguish reliable information from misleading content.' },
          ],
          note: 'Dùng cho: Fake news, Social media, Technology, Education, Critical thinking, Young people',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-tourism', title: '11. Tourism (Du lịch)', icon: '🏨', orderIndex: 41,
    summaryText: 'Tạo việc làm — nhưng cũng gây áp lực môi trường.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Job Creation',
          lines: [
            { tag: 'FACT', text: 'Tourism can create employment in hotels, restaurants, transportation, tour companies, local shops and entertainment.' },
            { tag: 'KEY IDEA', text: 'Tourism can generate employment and income for local communities.' },
            { tag: 'IELTS EXAMPLE', text: 'Tourism can generate employment in sectors such as hotels, restaurants and transportation.' },
          ],
          note: 'Dùng cho: Tourism, Employment, Economic development, Local communities, Developing countries',
        },
        {
          label: 'Tourism – Environmental Pressure',
          lines: [
            { tag: 'KEY IDEA', text: 'Tourism can bring economic benefits while also creating social and environmental costs.' },
            { tag: 'IELTS EXAMPLE', text: 'However, an excessive number of visitors can also place pressure on local infrastructure and the environment.' },
          ],
          note: 'Chuỗi: More tourists → More waste → More traffic → Greater demand for housing → Pressure on infrastructure → Environmental damage',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-food', title: '12. Food (Thực phẩm)', icon: '🛒', orderIndex: 42,
    summaryText: 'Lãng phí thực phẩm trong siêu thị và nhà hàng.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Food Waste',
          lines: [
            { tag: 'FACT', text: 'Restaurants and supermarkets may discard food that has not been sold, is close to its expiry date or does not meet commercial appearance standards.' },
            { tag: 'KEY IDEA', text: 'Modern food systems can create significant waste even when food remains edible.' },
            { tag: 'IELTS EXAMPLE', text: 'Supermarkets provide a clear example of food waste, as perfectly edible products may sometimes be discarded because they are close to their expiry dates or do not meet commercial standards.' },
            { tag: 'EXPLANATION', text: 'Consumers often expect fruit, vegetables and other products to have a perfect appearance, which can cause shops to reject products that are still safe to eat.' },
          ],
          note: 'Dùng cho: Food waste, Consumerism, Poverty, Environment, Supermarkets, Government regulation',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-cities', title: '13. Cities (Đô thị hóa)', icon: '🏙️', orderIndex: 43,
    summaryText: 'Đô thị hóa nhanh và tình trạng ùn tắc giao thông.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Traffic Congestion',
          lines: [
            { tag: 'FACT', text: 'When more people move into cities and purchase private vehicles, roads can become increasingly congested.' },
            { tag: 'KEY IDEA', text: 'Rapid urbanisation can create serious transportation problems.' },
            { tag: 'IELTS EXAMPLE', text: 'Rapid urbanisation can create serious transportation problems. As more people move to cities and purchase private vehicles, roads can become increasingly congested, resulting in longer commuting times and higher levels of air pollution.' },
          ],
          note: 'Chuỗi: Population growth → More private cars/motorbikes → Traffic congestion → Longer commuting time → Air pollution. Dùng cho: Cities, Urbanisation, Transport, Pollution, Population growth, Quality of life',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-government', title: '14. Government (Vai trò của chính phủ)', icon: '🚭', orderIndex: 44,
    summaryText: 'Quản lý hút thuốc — khi lựa chọn cá nhân tạo chi phí xã hội.',
    blocks: [
      example([
        {
          label: 'Real-World Example – Smoking Regulation',
          lines: [
            { tag: 'FACT', text: 'Governments can control smoking through higher taxes, advertising restrictions, smoking bans in public places, and health warnings on tobacco products.' },
            { tag: 'KEY IDEA', text: 'Government intervention can influence individual behaviour when personal choices create wider social costs.' },
            { tag: 'IELTS EXAMPLE', text: 'Restrictions on smoking demonstrate that government intervention can influence individual behaviour when personal choices create wider social costs.' },
            { tag: 'EXPLANATION', text: 'Although people have freedom to make personal choices, smoking can create wider costs through healthcare spending and exposure to second-hand smoke.' },
          ],
          note: 'Dùng cho: Government intervention, Public health, Taxation, Individual freedom, Regulation, Smoking',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'topic-tech-jobs', title: '15. Technology & Jobs (AI & việc làm)', icon: '🤖', orderIndex: 45,
    summaryText: 'AI vừa xóa bỏ vừa tạo ra việc làm mới.',
    blocks: [
      example([
        {
          label: 'Real-World Example – AI and Automation',
          lines: [
            { tag: 'FACT', text: 'AI can increasingly automate routine tasks such as customer service, data entry, translation, basic content creation and administrative tasks — while creating demand for AI specialists, data scientists, cybersecurity professionals, AI trainers and digital specialists.' },
            { tag: 'KEY IDEA', text: 'Technology can both eliminate and create jobs.' },
            { tag: 'IELTS EXAMPLE', text: 'The development of AI illustrates how technology can both eliminate and create jobs. Routine administrative tasks may increasingly be automated, while demand for workers with digital and technical skills is likely to grow.' },
          ],
          note: 'Chuỗi: Automation → Some routine jobs disappear → Workers need new skills → Demand for digital skills increases → New types of employment emerge. Dùng cho: AI, Unemployment, Future jobs, Education, Automation, Skills, Technology',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'super-examples-10', title: '⭐ 20 Super Examples nên học thuộc', icon: '⭐', orderIndex: 46,
    summaryText: 'Không cần học 50 facts — chỉ cần nhớ 20 ví dụ có thể tái sử dụng cho mọi topic, kể cả các đề siêu hiếm (space, SETI, Antarctica...).',
    blocks: [
      overview('Không cần học thuộc 50 facts rời rạc. Chỉ cần nhớ khoảng 20 examples có thể tái sử dụng cho rất nhiều chủ đề khác nhau — kể cả những đề IELTS siêu hiếm mà học sinh thường không có ví dụ (space exploration, extraterrestrial life, Antarctica, biotechnology...).'),
      example([
        {
          label: '1. 📱 Smartphone Bans in Schools',
          lines: [
            { tag: 'FACT', text: 'UNESCO báo cáo rằng đến tháng 3/2026, 114 hệ thống giáo dục (khoảng 58% số quốc gia) đã có lệnh cấm hoặc hạn chế điện thoại di động trong trường học.' },
            { tag: 'CHAIN', text: 'Technology → Smartphone use → Distraction → Reduced concentration → Government/school restrictions' },
            { tag: 'IELTS EXAMPLE', text: 'For example, an increasing number of education systems have restricted smartphone use in schools because excessive phone use can distract students from their studies.' },
            { tag: 'IDEA', text: "Không cần chứng minh 'điện thoại xấu'. Có thể lập luận: Technology is useful → BUT excessive use can create negative consequences → therefore reasonable regulation is necessary." },
          ],
          note: 'Dùng cho: Technology / Education / Children / Social media / Concentration / Government regulation',
        },
        {
          label: '2. 🤖 Generative AI in Education',
          lines: [
            { tag: 'FACT', text: "AI tạo sinh đang được dùng để hỗ trợ học tập, trong khi các tổ chức giáo dục lo ngại về academic integrity, privacy và students' overdependence on AI." },
            { tag: 'CHAIN', text: 'AI → Personalised learning → Faster access to information → More learning support → But potential overdependence / academic dishonesty' },
            { tag: 'IELTS EXAMPLE', text: 'The growing use of generative AI in education illustrates both the benefits and risks of technological progress. AI can provide personalised explanations and learning materials, but excessive dependence on it may discourage students from developing independent thinking skills.' },
            { tag: 'IDEA', text: 'Example cực tốt cho dạng Discuss both views vì cùng một fact có thể phát triển được cả advantage và disadvantage.' },
          ],
          note: 'Dùng cho: Technology / Education / AI / Jobs / Academic integrity',
        },
        {
          label: '3. 🚗 Electric Vehicles',
          lines: [
            { tag: 'FACT', text: "IEA dự báo doanh số xe điện toàn cầu đạt khoảng 17 triệu chiếc trong năm 2024, chiếm hơn 1/5 số ô tô bán ra." },
            { tag: 'CHAIN', text: 'Electric vehicles → Less petrol/diesel consumption → Cleaner transportation → Potentially lower emissions → Less dependence on fossil fuels' },
            { tag: 'IELTS EXAMPLE', text: 'The rapid growth of electric vehicles demonstrates how technological innovation can help reduce society\'s dependence on fossil fuels.' },
          ],
          note: 'Dùng cho: Transport / Environment / Technology / Climate change / Government',
        },
        {
          label: '4. 🌫️ Air Pollution',
          lines: [
            { tag: 'FACT', text: 'WHO cho biết khoảng 99% dân số thế giới đang sống ở những nơi có chất lượng không khí vượt quá hướng dẫn của WHO.' },
            { tag: 'CHAIN', text: 'Cars + factories → Emissions → Air pollution → Respiratory/cardiovascular problems → Healthcare costs' },
            { tag: 'IELTS EXAMPLE', text: 'Air pollution demonstrates that economic development can sometimes create hidden social costs. Although factories and vehicles contribute to economic activity, their emissions can seriously damage public health.' },
            { tag: 'IDEA', text: 'Example rất mạnh vì nối được: ECONOMY → ENVIRONMENT → HEALTH.' },
          ],
          note: 'Dùng cho: Environment / Health / Transport / Cities / Industry / Economic development',
        },
        {
          label: '5. 🏥 Universal Healthcare',
          lines: [
            { tag: 'FACT', text: 'Universal Health Coverage là mục tiêu để mọi người tiếp cận được các dịch vụ y tế thiết yếu mà không gặp khó khăn tài chính. WHO cho biết năm 2023 vẫn có khoảng 4.6 tỷ người chưa được bao phủ đầy đủ bởi dịch vụ y tế thiết yếu; năm 2022 có khoảng 2.1 tỷ người gặp khó khăn tài chính vì chi phí y tế.' },
            { tag: 'CHAIN', text: 'Healthcare access → Early diagnosis → Early treatment → Better health outcomes → More productive population' },
            { tag: 'CHAIN (ngược lại)', text: 'Expensive healthcare → Delayed treatment → Financial hardship → Greater inequality' },
            { tag: 'IELTS EXAMPLE', text: 'Access to affordable healthcare is particularly important for reducing social inequality. If medical treatment is prohibitively expensive, low-income families may delay seeking professional help, potentially allowing minor health problems to become more serious.' },
            { tag: 'COUNTRY EXAMPLE', text: "The UK's National Health Service provides a useful example of how governments can attempt to make essential healthcare accessible regardless of a person's income." },
            { tag: 'KEY IDEA', text: 'Healthcare không chỉ là vấn đề sức khỏe: HEALTH → EQUALITY → POVERTY → PRODUCTIVITY → ECONOMY.' },
          ],
          note: 'Dùng cho: Healthcare / Government spending / Equality / Poverty / Quality of life / Education / Economy',
        },
        {
          label: '6. 🩺 Telemedicine in Remote Areas',
          lines: [
            { tag: 'FACT', text: 'WHO cho biết telemedicine có khả năng mở rộng healthcare tới các cộng đồng vùng sâu vùng xa. Năm 2026, Bộ Y tế Timor-Leste phối hợp WHO triển khai chương trình telemedicine để đưa chuyên môn y tế tới cộng đồng nông thôn — bác sĩ địa phương có thể trao đổi trực tiếp với bác sĩ chuyên khoa tại bệnh viện quốc gia.' },
            { tag: 'CHAIN', text: 'Remote areas → Few specialist doctors → Internet/telemedicine → Remote consultation → Better healthcare access' },
            { tag: 'IELTS EXAMPLE', text: 'Timor-Leste provides a useful example of how technology can reduce geographical inequality in healthcare. Through telemedicine, doctors in remote areas can consult specialists based in the country\'s main hospital without requiring every patient to travel long distances.' },
            { tag: 'IDEA', text: 'Technology không nhất thiết thay thế bác sĩ — technology có thể: CONNECT PATIENTS → WITH DOCTORS.' },
          ],
          note: 'Dùng cho: Technology / Healthcare / Rural areas / Equality / Internet / Government',
        },
        {
          label: '7. 🏃 Physical Inactivity',
          lines: [
            { tag: 'FACT', text: 'WHO ước tính khoảng 31% người trưởng thành thế giới (~1.8 tỷ người) không đạt mức vận động thể chất được khuyến nghị.' },
            { tag: 'CHAIN', text: 'Office work + cars + screen time → Sedentary lifestyle → Less physical activity → Health problems' },
            { tag: 'IELTS EXAMPLE', text: 'The increasingly sedentary nature of modern life illustrates how technological and economic changes can unintentionally create public-health problems.' },
          ],
          note: 'Dùng cho: Health / Lifestyle / Technology / Obesity / Work',
        },
        {
          label: '8. 👕 Fast Fashion',
          lines: [
            { tag: 'CHAIN', text: 'Cheap clothes → Frequent purchases → Shorter product lifespan → Textile waste → Environmental pressure' },
            { tag: 'IELTS EXAMPLE', text: 'The fast-fashion industry illustrates how low prices and rapidly changing trends can encourage excessive consumption and generate large amounts of textile waste.' },
          ],
          note: 'Dùng cho: Consumerism / Environment / Fashion / Waste / Advertising',
        },
        {
          label: '9. 🥤 Plastic Pollution',
          lines: [
            { tag: 'FACT', text: 'UNEP cho biết thế giới sản xuất hơn 400 triệu tấn nhựa mỗi năm.' },
            { tag: 'CHAIN', text: 'Mass consumption → Plastic production → Single-use products → Waste → Ocean/land pollution' },
            { tag: 'IELTS EXAMPLE', text: 'The enormous scale of global plastic production demonstrates that individual recycling alone may not be sufficient; governments and manufacturers may also need to reduce unnecessary plastic production.' },
            { tag: 'IDEA', text: 'Individual responsibility VS Government/corporate responsibility.' },
          ],
          note: 'Dùng cho: Environment / Consumerism / Government / Recycling / Lifestyle',
        },
        {
          label: '10. 🏠 Remote Work',
          lines: [
            { tag: 'FACT', text: 'COVID-19 buộc nhiều công ty chuyển sang remote working và sử dụng video conferencing, cloud computing và các nền tảng cộng tác trực tuyến.' },
            { tag: 'CHAIN', text: 'COVID-19 → Office closures → Remote work → Technology adoption → Hybrid work' },
            { tag: 'IELTS EXAMPLE', text: 'The COVID-19 pandemic demonstrated that technology can fundamentally change traditional working practices, as millions of employees were able to continue working remotely.' },
            { tag: 'ADVANTAGE', text: 'Less commuting → Less traffic → More flexible working.' },
            { tag: 'DISADVANTAGE', text: 'Less face-to-face interaction → Communication challenges → Social isolation.' },
          ],
          note: 'Dùng cho: Technology / Jobs / Work-life balance / Transport / Cities',
        },
        {
          label: '11. 🌎 Global Supply Chains',
          lines: [
            { tag: 'FACT', text: 'Một smartphone có thể: design tại Mỹ, components từ nhiều quốc gia, manufacturing/assembly tại châu Á, distribution ra thị trường toàn cầu.' },
            { tag: 'CHAIN', text: 'International specialisation → Global supply chains → Lower production costs → Cheaper products → Economic interdependence' },
            { tag: 'IELTS EXAMPLE', text: 'The smartphone industry is a clear illustration of globalisation, as the design, manufacture and distribution of a single product can involve numerous countries.' },
          ],
          note: 'Dùng cho: Globalisation / International trade / Technology / Multinational companies / Economy',
        },
        {
          label: '12. 🏙️ Urban Traffic Congestion',
          lines: [
            { tag: 'CHAIN', text: 'Urbanisation → Population growth → More vehicles → Traffic congestion → Longer commuting times → Air pollution' },
            { tag: 'IELTS EXAMPLE', text: 'Rapid urbanisation can create severe transportation problems because population growth is often accompanied by a rise in private vehicle ownership.' },
          ],
          note: 'Dùng cho: Cities / Transport / Environment / Urbanisation / Quality of life',
        },
        {
          label: '13. 🚲 Netherlands – Cycling',
          lines: [
            { tag: 'FACT', text: 'Khoảng 27% các chuyến đi tại Netherlands được thực hiện bằng xe đạp. Chính phủ hỗ trợ cycling infrastructure và cycle superhighways để khuyến khích đi xe đạp.' },
            { tag: 'CHAIN', text: 'Cycling infrastructure → Safer cycling → More convenient → Fewer short car journeys → Less congestion/pollution' },
            { tag: 'IELTS EXAMPLE', text: 'The Netherlands provides a useful example of how infrastructure can influence transport behaviour. Extensive cycling infrastructure has made bicycles a practical alternative to private cars for many short journeys.' },
          ],
          note: 'Dùng cho: Transport / Environment / Health / Cities / Government',
        },
        {
          label: '14. 🇳🇴 Norway – Electric Vehicles',
          lines: [
            { tag: 'FACT', text: 'Norway dùng nhiều chính sách/ưu đãi để thúc đẩy xe không phát thải. Năm 2025, electric vehicles chiếm khoảng 95% doanh số xe chở khách mới.' },
            { tag: 'CHAIN', text: 'Government incentives → Lower financial barriers → EV adoption → Less dependence on petrol/diesel → Cleaner transportation' },
            { tag: 'IELTS EXAMPLE', text: 'Norway provides a strong example of how financial incentives can accelerate technological adoption. Government policies have helped make electric vehicles an attractive alternative to conventional cars.' },
          ],
          note: 'Dùng cho: Environment / Technology / Government / Transport / Climate change',
        },
        {
          label: '15. 🇯🇵 Japan – Ageing Population',
          lines: [
            { tag: 'FACT', text: 'Năm 2024, người từ 65 tuổi trở lên chiếm 29.3% dân số Nhật Bản.' },
            { tag: 'CHAIN', text: 'Low birth rate + longer life expectancy → Ageing population → Smaller working-age population → Labour shortages → Pressure on pensions + healthcare' },
            { tag: 'IELTS EXAMPLE', text: 'Japan provides a clear example of the economic consequences of population ageing. As the proportion of elderly people increases, governments may face greater pressure to finance pensions and healthcare while maintaining an adequate workforce.' },
          ],
          note: 'Dùng cho: Ageing population / Birth rate / Healthcare / Immigration / Employment / Economy',
        },
        {
          label: '16. 🏝️ Galápagos – Protecting "Untouched" Areas',
          lines: [
            { tag: 'FACT', text: 'Galápagos có những khu vực không dân cư được kiểm soát nghiêm ngặt với itinerary du lịch được quy hoạch. Ecuador dùng visitor management, permits, quotas, zoning, biosecurity và tourism controls để giảm tác động lên hệ sinh thái. UNESCO xác định tourism growth và invasive species là các mối đe dọa quan trọng với Galápagos.' },
            { tag: 'CHAIN', text: 'Untouched ecosystem → Tourism interest → More visitors → Environmental pressure → Tourism restrictions → Conservation' },
            { tag: 'IELTS EXAMPLE', text: 'The Galápagos Islands illustrate the dilemma between exploration and conservation. Although the islands attract tourists because of their unique wildlife and relatively undisturbed ecosystems, Ecuador has introduced visitor-management systems, permits and controlled itineraries to minimise environmental damage.' },
            { tag: 'IDEA', text: 'Not everything that humans CAN explore should necessarily be explored — cực mạnh cho đề "Should humans explore every part of the planet?"' },
          ],
          note: 'Dùng cho: Tourism / Environment / Untouched areas / Exploration / Wildlife / Government regulation',
        },
        {
          label: '17. 🧊 Antarctica – Science vs. Human Interference',
          lines: [
            { tag: 'FACT', text: 'Nghị định thư về môi trường của Antarctic Treaty xác định Antarctica là "a natural reserve, devoted to peace and science" — hoạt động của con người phải được lên kế hoạch để hạn chế tác động xấu. Tourism cũng chịu quy định/guidelines để không gây tổn hại môi trường và giá trị khoa học.' },
            { tag: 'CHAIN', text: 'Remote/fragile environment → Scientific value → Human curiosity → Tourism/research → Environmental risk → Strict regulation' },
            { tag: 'IELTS EXAMPLE', text: 'Antarctica provides a compelling example of why some remote environments may need to be protected from unrestricted human activity. Although the continent is extremely valuable for scientific research, international agreements require activities to be carefully managed in order to minimise environmental damage.' },
            { tag: 'IDEA', text: 'Scientific exploration ≠ unlimited human access. Dùng cho đề "Should humans explore remote areas?" — YES: scientific knowledge, BUT: exploration should be controlled to protect fragile ecosystems.' },
          ],
          note: 'Dùng cho: Exploration / Science / Tourism / Environment / Untouched areas / International cooperation',
        },
        {
          label: '18. 🪐 NASA Europa Clipper – Searching for Life Beyond Earth',
          lines: [
            { tag: 'FACT', text: "NASA's Europa Clipper được phóng ngày 14/10/2024, hành trình tới Europa (mặt trăng của Jupiter) để nghiên cứu xem nơi này có điều kiện phù hợp với sự sống hay không. NASA dự kiến tàu đến Jupiter năm 2030, thực hiện 49 lần bay qua Europa. Europa có bằng chứng về một đại dương nước lỏng dưới lớp băng." },
            { tag: 'CHAIN', text: 'Space exploration → Scientific research → Search for habitable environments → Knowledge about life → Better understanding of the universe' },
            { tag: 'IELTS EXAMPLE', text: "NASA's Europa Clipper mission provides a real-world example of the value of space exploration. The spacecraft is investigating whether Jupiter's moon Europa has conditions suitable for life, demonstrating how governments can invest in scientific research to answer fundamental questions about humanity's place in the universe." },
            { tag: 'ARGUMENT NGƯỢC LẠI', text: 'However, such missions are extremely expensive and their benefits are often uncertain, which raises the question of whether limited public funds should instead be directed towards immediate problems such as poverty, healthcare and climate change.' },
            { tag: 'IDEA', text: 'Example rất tốt cho dạng "Government money: Earth vs Space".' },
          ],
          note: 'Dùng cho: Space exploration / Science / Government spending / Technology / Human curiosity / Future',
        },
        {
          label: '19. 👽 If Humans Receive a Signal From Extraterrestrial Intelligence',
          lines: [
            { tag: 'FACT', text: 'Theo các nguyên tắc SETI được cập nhật tháng 6/2026: nếu phát hiện tín hiệu được xác nhận từ extraterrestrial intelligence, các nhà khoa học nên tham vấn quốc tế, cân nhắc liệu có nên phản hồi, không gửi reply nếu chưa có kết quả tham vấn — các cuộc tham vấn nên qua UN và các tổ chức quốc tế đại diện rộng rãi.' },
            { tag: 'CHAIN', text: 'Possible ET signal → Scientific verification → International consultation → Ethical/legal discussion → Coordinated response' },
            { tag: 'IELTS EXAMPLE', text: 'The international principles developed for SETI demonstrate that even a hypothetical discovery of extraterrestrial intelligence would require international cooperation. Scientists are encouraged to verify a potential signal carefully and consult international bodies before any response is sent.' },
            { tag: 'IDEA', text: 'Even hypothetical technological developments can create ethical and international questions that cannot be solved by one country alone. Dùng cho: "Should scientists be allowed to do anything they want?", "Should governments cooperate on scientific research?", "Who should make decisions about potentially dangerous discoveries?"' },
          ],
          note: 'Dùng cho: Extraterrestrial life / Science / International cooperation / Ethics / Government / Technology',
        },
        {
          label: '20. 🧬 Scientific Discovery → Ethics → Government Regulation',
          lines: [
            { tag: 'FRAMEWORK', text: 'Scientific discovery → New capability → Potential benefits → Potential risks → Ethical concerns → Government regulation' },
            { tag: 'IELTS EXAMPLE', text: 'Advances in biotechnology illustrate why scientific progress often needs to be accompanied by ethical and legal safeguards. Although new technologies can potentially improve healthcare, governments may need to regulate their use when they raise concerns about safety, privacy or human rights.' },
            { tag: 'IDEA', text: 'Dùng khung này khi đề hỏi về genetic engineering, cloning, AI, biotechnology, human experimentation, scientific research — những topic học sinh thường không có ví dụ cụ thể.' },
          ],
          note: 'Dùng cho: Science / Technology / Medicine / Ethics / Government / Human rights',
        },
      ]),
      steps([
        { title: '① Real-world case', description: 'Tìm một ví dụ gần nhất mà bạn biết — không cần đúng 100% chủ đề.' },
        { title: '② What happened?', description: 'Chuyện gì đã thực sự xảy ra trong ví dụ đó?' },
        { title: '③ Why did it happen?', description: 'Nguyên nhân/động lực đằng sau là gì?' },
        { title: '④ What was the consequence?', description: 'Hậu quả hoặc kết quả quan sát được là gì?' },
        { title: '⑤ What does it prove?', description: 'Điều này chứng minh hoặc hỗ trợ luận điểm gì cho bài viết của bạn?' },
      ]),
      callout('Ví dụ áp dụng Master Formula', 'Đề: "Should humans explore remote areas that have remained untouched?"\n\nHọc sinh nghĩ đến Antarctica → Scientific research happens there → But the environment is extremely fragile → Therefore international regulations limit human impact → Therefore exploration should be controlled rather than unrestricted.\n\nĐây chính là cách biến một fact thành một IELTS argument: FACT → CHAIN → EXPLANATION → ARGUMENT — thay vì học thuộc một đống quốc gia và số liệu rời rạc.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'fact-to-example-formula', title: 'Công thức biến Fact → IELTS Example', icon: '🛠️', orderIndex: 47,
    summaryText: '3 bước + 2 quy tắc để biến một fact khô khan thành câu ví dụ IELTS tự nhiên.',
    blocks: [
      steps([
        { title: 'Bước 1 – Nhớ Fact', description: 'Electric vehicles are becoming increasingly popular worldwide.' },
        { title: 'Bước 2 – Giải thích fact cho thấy điều gì', description: 'This shows that consumers are gradually adopting cleaner transportation technologies.' },
        { title: 'Bước 3 – Giải thích kết quả', description: 'This could reduce dependence on fossil fuels and help governments tackle urban air pollution.' },
        { title: 'Câu IELTS hoàn chỉnh', description: 'For example, the rapid growth of electric vehicles shows how governments and consumers are increasingly looking for cleaner alternatives to conventional cars.' },
      ]),
      callout('Không nên học thuộc số liệu không cần thiết', '❌ Cách viết yếu: "According to a study in 2019, 73.56% of people…" — khó nhớ, dễ dùng sai, nghe như học vẹt và thường không cần thiết.'),
      table('So sánh cách viết ví dụ', ['❌ Yếu (chung chung)', '✅ Tốt hơn (cụ thể + có nguồn)'], [
        ['Many countries are trying to reduce pollution.', 'Norway used financial incentives to encourage electric-vehicle adoption, and electric vehicles accounted for around 95% of new passenger-car sales in 2025.'],
        ["Governments should stop children from eating unhealthy food.", 'Chile introduced restrictions on the sale and advertising of foods high in sugar, sodium, saturated fat and calories in schools.'],
        ['People should cycle more.', 'In the Netherlands, around 27% of journeys are made by bicycle, supported by extensive cycling infrastructure.'],
        ['Governments should reduce sugar consumption.', "Singapore introduced the Nutri-Grade system for beverages, and the median sugar level of pre-packaged beverages fell from 7.1% in 2017 to 4.6% in 2023."],
      ]),
      list('Các mẫu câu ví dụ IELTS linh hoạt (Universal Templates)', [
        'For example, [COUNTRY] provides a clear example of how [POLICY/TREND] can [RESULT]. — vd: Norway provides a clear example of how government incentives can accelerate the adoption of electric vehicles.',
        'A clear real-world example of this is [EXAMPLE]. — vd: A clear real-world example of this is the rapid growth of electric vehicles in Norway.',
        'This can be seen in [COUNTRY], where the government has introduced [POLICY] in an attempt to [GOAL]. — vd: This can be seen in Singapore, where the government has introduced nutritional labelling requirements in an attempt to encourage healthier consumption.',
        '[EXAMPLE] demonstrates how [CAUSE] can lead to [RESULT]. — vd: The Netherlands demonstrates how investment in cycling infrastructure can lead to reduced dependence on private vehicles.',
        '[COUNTRY/EXAMPLE] illustrates both the benefits and drawbacks of [TOPIC]. — vd: The growth of tourism in Japan illustrates both the economic benefits and social challenges associated with international tourism.',
      ]),
      steps([
        { title: '① What happened?', description: 'Fact thực tế là gì?' },
        { title: '② What did the government/people do?', description: 'Chính sách, hành động hay thay đổi là gì?' },
        { title: '③ What happened after that?', description: 'Kết quả đo được/quan sát được là gì?' },
        { title: '④ What does it prove?', description: 'Điều này hỗ trợ luận điểm của bạn như thế nào?' },
      ]),
      callout('Master Formula', 'For example, [COUNTRY] introduced [POLICY/ACTION] in order to [GOAL]. This has [RESULT], demonstrating that [LINK TO ARGUMENT].\n\nVí dụ: For example, Singapore introduced the Nutri-Grade system to encourage consumers to reduce their intake of sugary beverages. The median sugar level of pre-packaged beverages subsequently fell from 7.1% in 2017 to 4.6% in 2023, demonstrating that government regulation can influence both consumer behaviour and the products offered by companies.'),
      summary('Đừng học thuộc: chỉ tên nước, hoặc một con số ngẫu nhiên không có bối cảnh. Hãy nhớ: COUNTRY + REAL POLICY + REAL RESULT + WHAT IT PROVES — đó là công thức biến một "fact" thành một ví dụ IELTS hiệu quả.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-chile', title: '🇨🇱 Chile — Food Regulation', icon: '🇨🇱', orderIndex: 48,
    summaryText: 'Nhãn cảnh báo dinh dưỡng + cấm quảng cáo thực phẩm không lành mạnh cho trẻ em (2016).',
    blocks: [
      overview("Năm 2016, Chile triển khai một hệ thống chính sách toàn diện để hạn chế thực phẩm và đồ uống có hàm lượng cao về đường, sodium, saturated fat hoặc calories. Các sản phẩm vượt ngưỡng phải có cảnh báo dinh dưỡng ở mặt trước bao bì. Ngoài ra: không được bán các sản phẩm \"high-in\" trong trường học; hạn chế quảng cáo hướng tới trẻ em; hạn chế các hình thức khuyến mãi dành cho trẻ em."),
      table('Kết quả thực tế (Real Result)', ['Chỉ số', 'Kết quả'], [
        ['Lượng mua đồ uống "high-in" (2.383 hộ gia đình)', 'Giảm khoảng 23.7% sau khi chính sách triển khai'],
        ['Lượng đường trong tổng thực phẩm/đồ uống mua', 'Giảm khoảng 10% sau giai đoạn đầu'],
        ['Lượng sodium', 'Giảm khoảng 5%'],
      ]),
      callout('Lưu ý khi viết', '❌ Không nên viết: "Chile banned fast food." (quá đơn giản, không chính xác)\n✅ Nên viết: "Chile introduced strict regulations on foods and beverages high in sugar, sodium, saturated fat and calories."'),
      example([
        { label: 'Topic: Obesity', lines: [
          { tag: 'IDEA', text: 'Governments can regulate the food environment.' },
          { tag: 'EXAMPLE', text: 'Chile provides a clear example of this approach. The country introduced warning labels and restrictions on the sale and advertising of foods high in sugar, salt, saturated fat and calories, particularly in schools.' },
          { tag: 'EXPLANATION', text: 'Such policies make unhealthy products less accessible and less attractive to children.' },
          { tag: 'RESULT', text: 'Therefore, government intervention can complement individual responsibility in tackling obesity.' },
        ] },
        { label: 'Topic: Advertising to Children', lines: [
          { tag: 'IDEA', text: 'Children are particularly vulnerable to food advertising.' },
          { tag: 'EXAMPLE', text: 'Chile has restricted child-directed marketing of unhealthy foods and beverages as part of its national food regulations.' },
          { tag: 'EXPLANATION', text: 'Children may not have enough critical awareness to recognise persuasive advertising techniques.' },
          { tag: 'RESULT', text: "Restricting such marketing can reduce children's exposure to unhealthy-food promotion." },
        ] },
        { label: 'Topic: Government vs Individual Responsibility', lines: [
          { tag: 'IDEA', text: 'Individual choices alone may not be sufficient.' },
          { tag: 'EXAMPLE', text: "Chile's experience demonstrates that governments can change the food environment through labelling, school restrictions and advertising controls." },
          { tag: 'RESULT', text: 'This suggests that public policy can make healthy choices easier for individuals.' },
        ] },
      ]),
      summary('CHILE (2016): Food labelling → "High-in" warning labels → Unhealthy food restricted in schools → Child-directed ad restrictions → Lower purchases of unhealthy products. Key idea: Government intervention can change consumer behaviour.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-singapore', title: '🇸🇬 Singapore — Nutri-Grade', icon: '🇸🇬', orderIndex: 49,
    summaryText: 'Hệ thống chấm điểm dinh dưỡng A-D cho đồ uống đóng gói (từ 2022).',
    blocks: [
      overview("Singapore introduced its Nutri-Grade system for pre-packaged beverages in December 2022. Drinks are graded A → B → C → D according to their sugar and saturated-fat content — mức đường/chất béo càng cao thì grade càng thấp. Advertising for Grade D beverages is prohibited. The system was later extended to freshly prepared beverages."),
      table('Kết quả thực tế (Real Result)', ['Chỉ số', 'Trước', 'Sau'], [
        ['Median sugar level (đồ uống đóng gói)', '7.1% (2017)', '4.6% (2023)'],
        ['Tỷ lệ đồ uống được mua đạt Grade A/B', '37% (2017)', '69% (2023)'],
        ['Lượng đường trung bình tiêu thụ mỗi ngày', '60g (2018)', '56g (2022)'],
      ]),
      callout('Lưu ý khi viết', '❌ Không nên viết: "Singapore banned sugary drinks."\n✅ Nên viết: "Singapore introduced mandatory nutrition labelling and advertising restrictions for high-sugar beverages."'),
      example([
        { label: 'Topic: Government Regulation', lines: [
          { tag: 'IDEA', text: 'Governments can influence consumer choices through information.' },
          { tag: 'EXAMPLE', text: "Singapore's Nutri-Grade system requires beverages to display nutritional grades based on their sugar and saturated-fat content." },
          { tag: 'EXPLANATION', text: 'Consumers can immediately identify products that contain relatively high levels of sugar.' },
          { tag: 'RESULT', text: 'This can encourage people to choose healthier alternatives.' },
        ] },
        { label: 'Topic: Obesity / Diabetes', lines: [
          { tag: 'IDEA', text: 'Reducing sugar consumption can be an important part of public-health policy.' },
          { tag: 'EXAMPLE', text: 'Singapore introduced Nutri-Grade labels and advertising restrictions for sugary beverages.' },
          { tag: 'RESULT', text: 'The median sugar level of pre-packaged beverages fell substantially after the policy was introduced, demonstrating that government regulation can influence both manufacturers and consumers.' },
        ] },
        { label: 'Topic: Advertising', lines: [
          { tag: 'IDEA', text: 'Advertising can influence consumer preferences.' },
          { tag: 'EXAMPLE', text: 'Singapore prohibits advertising for the highest-sugar Nutri-Grade beverages.' },
          { tag: 'EXPLANATION', text: 'This reduces the exposure of consumers, particularly younger people, to marketing for products with high sugar content.' },
        ] },
      ]),
      summary('SINGAPORE: Sugary drinks → Nutri-Grade A-D → High-sugar drinks labelled → Grade D advertising prohibited → Companies reformulate products → Sugar levels decreased → More consumers choose A/B drinks. Key idea: Governments can change behaviour through information + regulation.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-netherlands', title: '🇳🇱 Netherlands — Cycling', icon: '🇳🇱', orderIndex: 50,
    summaryText: 'Văn hóa đạp xe và hạ tầng giao thông giảm phụ thuộc ô tô.',
    blocks: [
      overview('Cycling is deeply integrated into the Dutch transport system. According to the Dutch government, around 27% of all journeys in the Netherlands are made by bicycle. The government has also supported regional cycling routes and cycle superhighways to encourage more people to cycle, particularly for commuting. More than half of car journeys are shorter than 7.5 km — meaning many journeys could potentially be replaced by cycling. The government therefore supports cycling infrastructure, cycle superhighways, better bicycle facilities, and financial incentives such as a tax-free cycling mileage allowance for employees.'),
      callout('Điều này chứng minh điều gì?', "People's transport behaviour is not determined only by personal preference — infrastructure matters. If cycling is SAFE + CONVENIENT + CHEAP, people are more likely to cycle."),
      example([
        { label: 'Topic: Traffic Congestion', lines: [
          { tag: 'IDEA', text: 'Governments should invest in alternatives to private cars.' },
          { tag: 'EXAMPLE', text: 'The Netherlands provides a strong example, with around 27% of journeys made by bicycle and extensive cycling infrastructure.' },
          { tag: 'EXPLANATION', text: 'When people have safe and convenient alternatives, they may be less dependent on private vehicles.' },
          { tag: 'RESULT', text: 'This can reduce the number of cars on roads and ease congestion.' },
        ] },
        { label: 'Topic: Environment', lines: [
          { tag: 'IDEA', text: 'Transport policies can help reduce pollution.' },
          { tag: 'EXAMPLE', text: 'The Netherlands has invested heavily in cycling infrastructure to encourage people to use bicycles instead of cars for shorter journeys.' },
          { tag: 'RESULT', text: 'A shift from private cars to bicycles can contribute to cleaner urban environments, since cycling does not produce direct exhaust emissions.' },
        ] },
        { label: 'Topic: Health', lines: [
          { tag: 'IDEA', text: 'Transport policy can also affect public health.' },
          { tag: 'EXAMPLE', text: 'The Dutch government actively encourages cycling, including cycling to work.' },
          { tag: 'RESULT', text: 'Cycling incorporates physical activity into daily routines, encouraging a more active lifestyle without requiring extra gym time.' },
        ] },
      ]),
      summary('NETHERLANDS: 27% of journeys by bicycle → Cycling culture → Cycling infrastructure + cycle superhighways → More convenient cycling → Fewer short car journeys → Less congestion + pollution → More daily physical activity. Key idea: Good infrastructure can change behaviour.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-norway', title: '🇳🇴 Norway — Electric Vehicles', icon: '🇳🇴', orderIndex: 51,
    summaryText: 'Ưu đãi thuế đưa xe điện lên 95% doanh số xe mới (2025).',
    blocks: [
      overview('Norway has used a combination of financial and practical incentives — including tax advantages — to encourage the adoption of electric vehicles. Norway set a target that all new passenger cars should be zero-emission vehicles by 2025. By 2025, electric vehicles accounted for around 95% of new passenger-car sales, according to the Norwegian government.'),
      callout('Điều này chứng minh điều gì?', 'Consumers may be willing to adopt environmentally friendly technologies when governments make them financially attractive and convenient. Thay vì chỉ nói "People should buy electric cars", hãy viết: "Governments can create conditions that make cleaner choices economically attractive."'),
      example([
        { label: 'Topic: Climate Change', lines: [
          { tag: 'IDEA', text: 'Governments can accelerate the transition to cleaner transportation.' },
          { tag: 'EXAMPLE', text: 'Norway provides a strong example of this approach. The country introduced incentives for zero-emission vehicles and set a target for all new passenger cars to be zero-emission by 2025.' },
          { tag: 'RESULT', text: 'Electric vehicles eventually accounted for around 95% of new passenger-car sales in 2025, suggesting that financial incentives can significantly influence consumer behaviour.' },
        ] },
        { label: 'Topic: Government vs Individual Responsibility', lines: [
          { tag: 'IDEA', text: 'Individuals may want to make environmentally friendly choices but still respond strongly to financial incentives.' },
          { tag: 'EXAMPLE', text: 'Norway used tax advantages and other incentives to make electric vehicles more attractive.' },
          { tag: 'EXPLANATION', text: 'The lower financial burden reduces one of the main barriers to purchasing an electric vehicle, letting more consumers switch away from conventional petrol/diesel vehicles.' },
        ] },
        { label: 'Topic: Technology', lines: [
          { tag: 'IDEA', text: 'Technology alone is not enough; governments may need to support its adoption.' },
          { tag: 'EXAMPLE', text: 'Electric vehicles already existed as a technology, but Norway used government incentives to accelerate their adoption.' },
        ] },
      ]),
      summary('NORWAY: Electric vehicles → Government incentives → Lower financial barriers → More consumers choose EVs → 95% of new passenger-car sales electric in 2025 → Faster transition away from fossil-fuel vehicles. Key idea: Government incentives can accelerate technological change.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-japan', title: '🇯🇵 Japan — Ageing Population', icon: '🇯🇵', orderIndex: 52,
    summaryText: 'Tỷ lệ sinh thấp + tuổi thọ tăng → dân số già hóa nhanh nhất thế giới.',
    blocks: [
      overview('Japan is one of the clearest examples of population ageing. According to Japan\'s Statistics Bureau, in 2024 the population aged 65+ reached 36.243 million people, representing 29.3% of the total population (compared to 59.6% aged 15-64 and 11.2% under 15). The proportion aged 65+ had increased in 44 of Japan\'s 47 prefectures.'),
      list('Chuỗi nguyên nhân → hệ quả', [
        'Low birth rate + longer life expectancy',
        '→ Growing elderly population',
        '→ Smaller working-age population',
        '→ Labour shortages',
        '→ Greater pressure on pensions and healthcare',
        '→ Government faces higher social spending',
      ]),
      example([
        { label: 'Topic: Ageing Population', lines: [
          { tag: 'IDEA', text: 'An ageing population can put pressure on government budgets.' },
          { tag: 'EXAMPLE', text: 'Japan provides a clear example. In 2024, people aged 65 and over represented 29.3% of the population.' },
          { tag: 'EXPLANATION', text: 'As the elderly population grows, governments may need to spend more on healthcare, pensions and social support.' },
          { tag: 'RESULT', text: 'At the same time, a smaller working-age population may generate less tax revenue and create labour shortages.' },
        ] },
        { label: 'Topic: Low Birth Rate', lines: [
          { tag: 'IDEA', text: 'Declining birth rates can have consequences that appear decades later.' },
          { tag: 'EXAMPLE', text: "Japan's ageing population illustrates the long-term consequences of demographic change." },
          { tag: 'RESULT', text: 'When fewer children are born, the country eventually has fewer young adults entering the workforce, contributing to labour shortages.' },
        ] },
        { label: 'Topic: Retirement Age', lines: [
          { tag: 'IDEA', text: 'Countries with ageing populations may need to reconsider traditional retirement policies.' },
          { tag: 'EXAMPLE', text: "Japan's demographic structure creates a strong economic incentive to keep older people economically active for longer." },
          { tag: 'RESULT', text: 'If more older adults remain in employment, they continue contributing skills, labour and tax revenue, partially reducing pressure on pensions.' },
        ] },
        { label: 'Topic: Immigration', lines: [
          { tag: 'IDEA', text: 'Immigration can potentially help countries with shrinking working-age populations.' },
          { tag: 'EXAMPLE', text: "Japan's ageing population and shrinking workforce provide a useful context for discussing whether countries should attract more foreign workers." },
          { tag: 'RESULT', text: 'Foreign workers can help fill vacancies in sectors facing labour shortages, so immigration can be one possible response to demographic decline.' },
        ] },
      ]),
      summary('JAPAN: Low birth rate + longer life expectancy → Ageing population → 29.3% aged 65+ in 2024 → Smaller working-age population → Labour shortages → Pressure on pensions + healthcare. Key idea: Demographic changes create economic consequences.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'country-examples-by-topic', title: 'Áp dụng 5 nước vào từng Topic', icon: '🔥', orderIndex: 53,
    summaryText: 'Một fact tốt không chỉ dùng cho một topic — bảng tra nhanh 7 chủ đề.',
    blocks: [
      overview('Một fact tốt không chỉ dùng cho một topic. Dưới đây là cách áp dụng 5 quốc gia (Chile, Singapore, Netherlands, Norway, Japan) vào các chủ đề IELTS khác nhau.'),
      example([
        { label: 'Topic: Government Responsibility', lines: [{ tag: 'KEY ARGUMENT', text: 'Governments can influence individual behaviour by changing the environment in which people make choices.' }], note: 'Dùng: Chile (food regulation), Singapore (sugary-drink regulation), Norway (EV incentives), Netherlands (cycling infrastructure)' },
        { label: 'Topic: Environment', lines: [{ tag: 'KEY ARGUMENT', text: 'Environmental behaviour can be changed through infrastructure and financial incentives rather than relying entirely on individual motivation.' }], note: 'Dùng: Norway (electric vehicles), Netherlands (cycling)' },
        { label: 'Topic: Health', lines: [{ tag: 'KEY ARGUMENT', text: 'Governments can make healthy choices easier by changing the food environment and providing consumers with clearer information.' }], note: 'Dùng: Chile (unhealthy-food restrictions), Singapore (sugary-drink regulation)' },
        { label: 'Topic: Children', lines: [{ tag: 'KEY ARGUMENT', text: 'Children may require greater protection because they are more vulnerable to advertising and have less control over their food environment.' }], note: 'Dùng: Chile — unhealthy food cannot be sold/promoted in schools if it exceeds nutritional thresholds' },
        { label: 'Topic: Transport', lines: [{ tag: 'KEY ARGUMENT', text: 'Different countries reduce car dependence through different approaches: Netherlands encourages alternatives, Norway encourages cleaner vehicles.' }], note: 'Dùng: Netherlands (cycling infrastructure), Norway (electric vehicles)' },
        { label: 'Topic: Technology', lines: [{ tag: 'KEY ARGUMENT', text: 'Technology tends to have a greater impact when governments create incentives and supportive infrastructure for adoption.' }], note: 'Dùng: Norway (EV adoption), Singapore (digital/nutritional information)' },
        { label: 'Topic: Population', lines: [{ tag: 'KEY ARGUMENT', text: 'Demographic changes can affect employment, government spending, healthcare and economic growth.' }], note: 'Dùng: Japan (ageing population)' },
      ]),
      table('Tóm tắt 5 nước trong 1 trang', ['Nước', 'Chủ đề', 'Key Lesson'], [
        ['🇨🇱 Chile', 'Food regulation (2016): warning labels, school restrictions, ad restrictions → lower purchases of "high-in" foods', 'Government can change the food environment'],
        ['🇸🇬 Singapore', 'Nutri-Grade (A-D labels, ad restrictions, reformulation) → lower sugar levels', 'Information + regulation can change consumer behaviour'],
        ['🇳🇱 Netherlands', 'Cycling: 27% of journeys by bicycle, cycling infrastructure → less car dependence', 'Infrastructure can change behaviour'],
        ['🇳🇴 Norway', 'EV incentives → ~95% of new passenger-car sales electric (2025)', 'Financial incentives can accelerate technological adoption'],
        ['🇯🇵 Japan', 'Ageing population: 29.3% aged 65+ (2024) → smaller workforce, pension/healthcare pressure', 'Demographic changes have long-term economic consequences'],
      ]),
    ],
  }),
];
