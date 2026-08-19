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
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// { lessonTitle, isNew, words } — isNew: true creates the lesson if it
// doesn't exist yet; false expects it to already exist (merge target).
const TOPICS = [
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

async function run() {
  const VocabularyLesson = require('../models/VocabularyLesson');
  await mongoose.connect(process.env.MONGO_URI);

  let totalAdded = 0, totalSkipped = 0, lessonsCreated = 0;
  const summary = [];

  for (const topic of TOPICS) {
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

  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch(err => { console.error('[seedWritingTask2VocabMerge2] Failed:', err); process.exit(1); });
}
