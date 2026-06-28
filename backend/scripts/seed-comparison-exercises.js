/**
 * Seed 14 new comparison exercises for Task 1 Grammar – "So sánh"
 * 2 exercises × 7 structures, diverse Task 1 topics
 * Run: node backend/scripts/seed-comparison-exercises.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Task1Exercise = require('../models/Task1Exercise');

const exercises = [
  // ── Structure 1: respectively (2 exercises) ──────────────────────────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'translation',
    grammarPoint: 'respectively — đặt cuối câu, liệt kê 2+ giá trị theo đúng thứ tự',
    instruction: 'Dịch câu sau dùng "respectively":',
    questionVi: 'Lượng điện sản xuất từ than và khí đốt tự nhiên lần lượt là 400 TWh và 250 TWh vào năm 2020.',
    primaryAnswer: 'The amounts of electricity produced from coal and natural gas were 400 TWh and 250 TWh respectively in 2020.',
    sampleAnswers: [
      'The amounts of electricity produced from coal and natural gas were 400 TWh and 250 TWh respectively in 2020.',
      'Electricity production from coal and natural gas stood at 400 TWh and 250 TWh respectively in 2020.',
    ],
    hints: ['Đặt "respectively" ngay sau số liệu cuối cùng, trước "in 2020"'],
    tags: ['comparison', 'respectively', 'energy', 'bar chart'],
    orderIndex: 20,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'intermediate',
    type: 'translation',
    grammarPoint: 'respectively — dùng khi liệt kê song song ≥2 đối tượng và ≥2 giá trị',
    instruction: 'Dịch câu sau dùng "respectively":',
    questionVi: 'Tỷ lệ người dùng Internet ở Bắc Mỹ, Châu Âu và Châu Á lần lượt là 35%, 30% và 25% năm 2015.',
    primaryAnswer: 'The proportions of Internet users in North America, Europe and Asia were 35%, 30% and 25% respectively in 2015.',
    sampleAnswers: [
      'The proportions of Internet users in North America, Europe and Asia were 35%, 30% and 25% respectively in 2015.',
      'Internet user rates in North America, Europe and Asia stood at 35%, 30% and 25% respectively in 2015.',
    ],
    hints: ['3 khu vực → 3 con số → respectively ở cuối'],
    tags: ['comparison', 'respectively', 'internet', 'pie chart'],
    orderIndex: 21,
    xpReward: 5,
  },

  // ── Structure 2: compared to / in comparison with (2 exercises) ──────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'beginner',
    type: 'translation',
    grammarPoint: 'compared to / compared with — đứng giữa câu, so sánh hai đối tượng',
    instruction: 'Dịch câu sau dùng "compared to":',
    questionVi: 'Mức tiêu thụ nước trong nông nghiệp cao hơn đáng kể so với trong công nghiệp.',
    primaryAnswer: 'Water consumption in agriculture was significantly higher compared to that in industry.',
    sampleAnswers: [
      'Water consumption in agriculture was significantly higher compared to that in industry.',
      'Water consumption in agriculture was considerably higher compared to industrial use.',
    ],
    hints: ['Dùng "that" để tránh lặp "water consumption"'],
    tags: ['comparison', 'compared to', 'water', 'bar chart'],
    orderIndex: 22,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'fill_blank',
    grammarPoint: 'in comparison with — đặt sau động từ hoặc đầu câu, tương đương "compared to"',
    instruction: 'Điền "in comparison with" hoặc "compared to" vào chỗ trống:',
    sentenceWithBlanks: 'The number of tourists visiting France in 2019 rose sharply ___ the previous year.',
    blanksCount: 1,
    primaryAnswer: 'in comparison with',
    sampleAnswers: ['in comparison with', 'compared to', 'compared with'],
    hints: ['Cả hai cụm đều đúng ngữ pháp ở đây'],
    tags: ['comparison', 'in comparison with', 'tourism', 'table'],
    orderIndex: 23,
    xpReward: 5,
  },

  // ── Structure 3: while / whereas (2 exercises) ───────────────────────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'beginner',
    type: 'translation',
    grammarPoint: 'while — nối 2 mệnh đề tương phản trong cùng một câu',
    instruction: 'Dịch câu sau dùng "while":',
    questionVi: 'Lượng khí thải CO₂ ở các nước phát triển giảm dần, trong khi ở các nước đang phát triển lại tăng mạnh.',
    primaryAnswer: 'CO₂ emissions in developed countries gradually declined, while those in developing countries increased sharply.',
    sampleAnswers: [
      'CO₂ emissions in developed countries gradually declined, while those in developing countries increased sharply.',
      'CO₂ emissions in developed countries fell steadily, while emissions in developing countries rose significantly.',
    ],
    hints: ['Dùng "those" để thay thế "CO₂ emissions" ở mệnh đề sau'],
    tags: ['comparison', 'while', 'environment', 'line graph'],
    orderIndex: 24,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'translation',
    grammarPoint: 'whereas — tương đương "while", thường dùng khi tương phản mạnh hơn',
    instruction: 'Dịch câu sau dùng "whereas":',
    questionVi: 'Xe hơi chiếm 50% lượng người sử dụng phương tiện giao thông đô thị, trong khi xe buýt chỉ chiếm 15%.',
    primaryAnswer: 'Cars accounted for 50% of urban transport users, whereas buses represented only 15%.',
    sampleAnswers: [
      'Cars accounted for 50% of urban transport users, whereas buses represented only 15%.',
      'Cars made up 50% of urban transport users, whereas buses accounted for only 15%.',
    ],
    hints: ['accounted for / made up / represented đều diễn tả %'],
    tags: ['comparison', 'whereas', 'transport', 'pie chart'],
    orderIndex: 25,
    xpReward: 5,
  },

  // ── Structure 4: By contrast / Meanwhile / At the same time (2 exercises)
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'translation',
    grammarPoint: 'By contrast — đặt đầu câu thứ 2, nối hai xu hướng trái chiều',
    instruction: 'Dịch đoạn sau dùng "By contrast":',
    questionVi: 'Tỷ lệ việc làm trong ngành nông nghiệp giảm xuống còn 20%. Ngược lại, ngành dịch vụ mở rộng lên tới 60%.',
    primaryAnswer: 'Employment in agriculture fell to 20%. By contrast, the service sector expanded to 60%.',
    sampleAnswers: [
      'Employment in agriculture fell to 20%. By contrast, the service sector expanded to 60%.',
      'The proportion of jobs in agriculture dropped to 20%. By contrast, employment in the service sector grew to 60%.',
    ],
    hints: ['By contrast đứng đầu câu, theo sau là dấu phẩy'],
    tags: ['comparison', 'by contrast', 'employment', 'bar chart'],
    orderIndex: 26,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'intermediate',
    type: 'translation',
    grammarPoint: 'Meanwhile — đặt đầu câu, chỉ điều xảy ra đồng thời hoặc trái chiều nhẹ hơn',
    instruction: 'Dịch đoạn sau dùng "Meanwhile":',
    questionVi: 'Tuổi thọ của phụ nữ tăng đều đặn lên 82 tuổi trong giai đoạn này. Trong khi đó, tuổi thọ của nam giới vẫn ổn định ở mức 74 tuổi.',
    primaryAnswer: "Women's life expectancy increased steadily to 82 years over this period. Meanwhile, men's life expectancy remained stable at 74 years.",
    sampleAnswers: [
      "Women's life expectancy increased steadily to 82 years over this period. Meanwhile, men's life expectancy remained stable at 74 years.",
      "Female life expectancy rose steadily to 82. Meanwhile, male life expectancy stayed at 74.",
    ],
    hints: ['Meanwhile chỉ sự song song hoặc tương phản nhẹ, không mạnh bằng "By contrast"'],
    tags: ['comparison', 'meanwhile', 'health', 'line graph'],
    orderIndex: 27,
    xpReward: 5,
  },

  // ── Structure 5: twice as many/much as (2 exercises) ────────────────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'translation',
    grammarPoint: 'twice as much as — dùng với danh từ không đếm được (lượng, tiền, năng lượng...)',
    instruction: 'Dịch câu sau dùng "twice as much as":',
    questionVi: 'Lượng điện từ năng lượng mặt trời năm 2020 gấp đôi so với năm 2015.',
    primaryAnswer: 'The amount of electricity from solar energy in 2020 was twice as much as that in 2015.',
    sampleAnswers: [
      'The amount of electricity from solar energy in 2020 was twice as much as that in 2015.',
      'Solar electricity generation in 2020 was twice as much as that recorded in 2015.',
    ],
    hints: ['electricity = uncountable → "as much as"; dùng "that" để tránh lặp'],
    tags: ['comparison', 'twice as much as', 'energy', 'table'],
    orderIndex: 28,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'intermediate',
    type: 'translation',
    grammarPoint: 'twice as many as — dùng với danh từ đếm được (người, xe, du khách...)',
    instruction: 'Dịch câu sau dùng "twice as many as":',
    questionVi: 'Số du khách đến thăm bảo tàng lịch sử nhiều gấp đôi so với bảo tàng nghệ thuật vào năm 2022.',
    primaryAnswer: 'The number of visitors to the history museum was twice as many as that of the art museum in 2022.',
    sampleAnswers: [
      'The number of visitors to the history museum was twice as many as that of the art museum in 2022.',
      'The history museum attracted twice as many visitors as the art museum in 2022.',
    ],
    hints: ['visitors = countable → "as many as"; "that of" thay cho "the number of visitors"'],
    tags: ['comparison', 'twice as many as', 'culture', 'bar chart'],
    orderIndex: 29,
    xpReward: 5,
  },

  // ── Structure 6: Relative clause + higher/lower (2 exercises) ────────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'intermediate',
    type: 'translation',
    grammarPoint: 'Relative clause so sánh: X reached/stood at Y%, which was higher/lower than Z%',
    instruction: 'Dịch câu sau dùng mệnh đề quan hệ "which was higher/lower than":',
    questionVi: 'Tốc độ tăng trưởng GDP của Việt Nam đạt 7% năm 2019, cao hơn mức 5% của Thái Lan.',
    primaryAnswer: "Vietnam's GDP growth rate reached 7% in 2019, which was higher than Thailand's figure of 5%.",
    sampleAnswers: [
      "Vietnam's GDP growth rate reached 7% in 2019, which was higher than Thailand's figure of 5%.",
      "Vietnam's GDP growth stood at 7% in 2019, which was higher than that of Thailand at 5%.",
    ],
    hints: ['which was + higher/lower than → mệnh đề quan hệ phi hạn định bổ sung thêm thông tin so sánh'],
    tags: ['comparison', 'relative clause', 'higher than', 'economy', 'line graph'],
    orderIndex: 30,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'intermediate',
    type: 'translation',
    grammarPoint: 'Relative clause so sánh: stood at X, which was significantly lower/higher than Y',
    instruction: 'Dịch câu sau dùng mệnh đề quan hệ "which was lower than":',
    questionVi: 'Tỷ lệ biết chữ ở nông thôn chỉ đạt 72%, thấp hơn đáng kể so với mức 95% ở thành thị.',
    primaryAnswer: 'The literacy rate in rural areas stood at only 72%, which was significantly lower than the urban figure of 95%.',
    sampleAnswers: [
      'The literacy rate in rural areas stood at only 72%, which was significantly lower than the urban figure of 95%.',
      'Rural literacy stood at 72%, which was considerably lower than the 95% recorded in urban areas.',
    ],
    hints: ['"the urban figure of 95%" = cách diễn đạt tránh lặp lại "literacy rate"'],
    tags: ['comparison', 'relative clause', 'lower than', 'education', 'table'],
    orderIndex: 31,
    xpReward: 5,
  },

  // ── Structure 7: followed by + noun (2 exercises) ────────────────────────
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'translation',
    grammarPoint: 'followed by + noun/noun phrase — liệt kê theo thứ tự giảm dần, đứng ngay sau con số',
    instruction: 'Dịch câu sau dùng "followed by":',
    questionVi: 'Nhiên liệu hóa thạch là nguồn năng lượng lớn nhất chiếm 40%, theo sau là năng lượng mặt trời với 25%.',
    primaryAnswer: 'Fossil fuels were the largest energy source at 40%, followed by solar energy at 25%.',
    sampleAnswers: [
      'Fossil fuels were the largest energy source at 40%, followed by solar energy at 25%.',
      'Fossil fuels accounted for the largest share at 40%, followed by solar energy at 25%.',
    ],
    hints: ['"followed by" + danh từ → không cần động từ; "at 25%" = cách viết ngắn gọn cho tỷ lệ'],
    tags: ['comparison', 'followed by', 'energy', 'pie chart'],
    orderIndex: 32,
    xpReward: 5,
  },
  {
    skillType: 'comparison',
    module: 1,
    level: 'elementary',
    type: 'fill_blank',
    grammarPoint: 'followed by — liệt kê xếp hạng, đứng sau số liệu của vị trí đầu tiên',
    instruction: 'Điền "followed by" vào chỗ trống để hoàn thành câu:',
    sentenceWithBlanks: 'Agriculture was the main cause of water pollution at 45%, ___ industrial waste at 30% and urban runoff at 15%.',
    blanksCount: 1,
    primaryAnswer: 'followed by',
    sampleAnswers: ['followed by'],
    hints: ['followed by liệt kê nguyên nhân theo thứ tự từ cao đến thấp'],
    tags: ['comparison', 'followed by', 'environment', 'bar chart'],
    orderIndex: 33,
    xpReward: 5,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Task1Exercise.insertMany(exercises);
    console.log(`✅ Inserted ${result.length} comparison exercises`);

    const total = await Task1Exercise.countDocuments({ skillType: 'comparison' });
    console.log(`Total comparison exercises now: ${total}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
