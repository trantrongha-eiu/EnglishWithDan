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
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const TOPICS = [
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

async function run() {
  const VocabularyLesson = require('../models/VocabularyLesson');
  await mongoose.connect(process.env.MONGO_URI);

  let totalAdded = 0, totalSkipped = 0;
  const summary = [];

  for (const topic of TOPICS) {
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

  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch(err => { console.error('[seedWritingTask2VocabMerge] Failed:', err); process.exit(1); });
}
