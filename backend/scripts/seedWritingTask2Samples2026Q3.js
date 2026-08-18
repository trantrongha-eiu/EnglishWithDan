/**
 * Seed script – band 7+ sample essays (sampleSections) for the 12
 * WritingTask2 topics added by seedWritingTasks2026Q3.js. Written
 * originally (not copied from an external source) following the exact
 * stance/argument structure already laid out in each topic's
 * analysisSections — the site presents these as "Bài mẫu từ Daniel", so
 * content needs to be original rather than scraped from a third-party site.
 *
 * Same 4-section convention as the site's existing WritingTask2 samples:
 * Introduction / Body 1 / Body 2 / Conclusion.
 *
 * Matches existing docs by exact `prompt` text — does NOT upsert.
 *
 * Run: node backend/scripts/seedWritingTask2Samples2026Q3.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const SAMPLES = [
  {
    prompt: 'Nowadays, more and more people expect things to be done instantly, such as receiving services, obtaining information, or purchasing goods without having to wait. Do you think this is a beneficial or harmful development?',
    sampleSections: [
      { title: 'Introduction', content: 'In today’s fast-paced world, an increasing number of people expect to receive services, information, and goods without delay. While this trend undoubtedly offers convenience, I believe it is largely a harmful development because it diminishes patience and encourages poor decision-making.' },
      { title: 'Body 1', content: 'One of the main drawbacks of this culture of instant gratification is that it makes people increasingly impatient in other areas of their lives. When individuals become accustomed to having their needs met immediately, they gradually lose the ability to tolerate delay or difficulty in situations that require time and effort. For example, students who are used to finding instant answers online often abandon academic tasks that demand sustained concentration, simply because they are unwilling to persevere. This growing impatience can have far-reaching consequences, affecting not only academic performance but also personal relationships and professional development, both of which require patience to succeed.' },
      { title: 'Body 2', content: 'A further problem is that the pressure to obtain things instantly often results in poorly considered decisions. Without adequate time to reflect, people are more likely to make impulsive choices that they later regret. This is particularly evident in online shopping, where consumers frequently purchase items without comparing prices or reading reviews, driven by the desire for immediate satisfaction. Over time, such impulsive behaviour can lead to unnecessary financial waste and a general decline in the quality of the decisions people make.' },
      { title: 'Conclusion', content: 'In conclusion, although the expectation of instant services may seem like a positive feature of modern life, its long-term effects on patience and decision-making suggest that it is, on balance, a harmful trend that societies should be cautious of.' },
    ],
  },
  {
    prompt: 'Many celebrities complain about the way the media publicises their private lives. Some people believe that they should accept this as part of being famous. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'It is often argued that celebrities, by virtue of their fame, should simply accept extensive media coverage of their private lives. However, I disagree with this view, as I believe that fame does not strip individuals of their fundamental right to privacy, and that constant media intrusion can cause genuine harm.' },
      { title: 'Body 1', content: 'Firstly, privacy is a basic human right that should not be forfeited merely because a person becomes well-known. While celebrities may accept a certain level of public interest in their professional achievements, this does not mean that every aspect of their personal lives, including their families, health, and relationships, should be open to public scrutiny. This is especially true for the children of celebrities, who did not choose to be in the public eye and yet are frequently subjected to intense media attention through no fault of their own.' },
      { title: 'Body 2', content: "Secondly, constant media intrusion can have a severe impact on a celebrity's mental health. Being followed, photographed, and written about on a daily basis creates immense psychological pressure, leaving many public figures under constant stress to appear flawless. There have been numerous documented cases in which relentless media attention has contributed to serious anxiety and even depression among well-known individuals. Such consequences demonstrate that the assumption that fame justifies any level of intrusion is both unfair and potentially damaging." },
      { title: 'Conclusion', content: "In conclusion, I firmly disagree with the notion that celebrities should simply accept invasive media coverage as an unavoidable part of fame. Protecting their privacy, and that of their families, is essential not only as a matter of basic rights but also for their overall psychological well-being." },
    ],
  },
  {
    prompt: 'Nowadays, many children spend a considerable amount of time playing computer games and less time participating in sports. Why is this the case? Is this a beneficial or harmful trend?',
    sampleSections: [
      { title: 'Introduction', content: "It has become increasingly common for children to spend more time playing computer games than participating in sports. This essay will explore the reasons behind this shift before arguing that, on balance, it represents a harmful trend for young people's development." },
      { title: 'Body 1', content: 'There are two main reasons why computer games have become more popular among children than sports. Firstly, video games are far more accessible than sports, as they can be played at home at any time without requiring specific equipment, weather conditions, or other participants. In contrast, sports usually demand dedicated time, appropriate facilities, and often teammates, all of which can be difficult to arrange in busy modern households. Secondly, many parents perceive gaming as a safer alternative to outdoor sports, preferring their children to remain indoors under supervision rather than face potential risks associated with outdoor play.' },
      { title: 'Body 2', content: "Despite these understandable reasons, I believe this trend is ultimately harmful to children's overall development. Physically, excessive gaming contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems, whereas sports naturally promote regular exercise and physical fitness. Just as importantly, sports provide valuable opportunities for developing social skills, teamwork, and resilience through direct interaction with peers, benefits that solitary gaming cannot easily replicate. Children who spend the majority of their free time gaming therefore risk missing out on crucial aspects of both their physical and social development." },
      { title: 'Conclusion', content: 'In conclusion, while the convenience and perceived safety of computer games explain their growing popularity among children, the resulting decline in physical activity and social interaction makes this a concerning and largely harmful trend.' },
    ],
  },
  {
    prompt: 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?',
    sampleSections: [
      { title: 'Introduction', content: 'In both education and employment, it is evident that some individuals consistently work harder than others. This essay will examine the reasons behind this difference before arguing that working hard, while often admirable, is not always beneficial.' },
      { title: 'Body 1', content: 'People work harder than others for a variety of personal and external reasons. Some individuals are driven by strong personal ambition, a clear sense of purpose, or a genuine passion for what they do, all of which naturally motivate them to invest greater effort. Others, however, work hard primarily due to external pressures, such as financial necessity or family responsibilities, rather than any inherent desire to excel. In addition, personality traits play a role, as some people are simply more naturally disciplined and conscientious than others, regardless of their circumstances.' },
      { title: 'Body 2', content: 'However, I do not believe that working hard is always a positive thing. When taken to an extreme, excessive hard work can lead to serious negative consequences, including burnout, chronic stress, and long-term health problems. Individuals who consistently prioritise work above all else often do so at the expense of their family relationships, personal well-being, and overall quality of life. Furthermore, working excessively hard does not always translate into better outcomes; beyond a certain point, productivity and creativity can actually decline due to fatigue and lack of rest. Hard work is only truly beneficial, therefore, when it is balanced with adequate time for rest and personal life.' },
      { title: 'Conclusion', content: 'In conclusion, while there are understandable reasons why some people work harder than others, it is important to recognise that hard work is not inherently good in all circumstances, and that moderation remains essential for long-term success and well-being.' },
    ],
  },
  {
    prompt: 'The international community must take immediate action to ensure that all nations reduce their consumption of fossil fuels, such as gas and oil. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Many people believe that the international community must act immediately to reduce the consumption of fossil fuels such as oil and gas. I strongly agree with this view, primarily because of the severe environmental and health consequences associated with continued reliance on these energy sources.' },
      { title: 'Body 1', content: 'The most pressing reason for urgent action is the role fossil fuels play in accelerating climate change. Burning oil, coal, and gas releases vast quantities of greenhouse gases into the atmosphere, which is widely recognised as the primary driver of global warming. The consequences of this are already visible around the world, in the form of more frequent and severe natural disasters, including floods, droughts, and extreme storms. If nations continue to delay meaningful action, these environmental effects are likely to become increasingly irreversible, making immediate reductions in fossil fuel consumption essential.' },
      { title: 'Body 2', content: 'A second compelling reason concerns the direct impact of fossil fuels on human health. The burning of oil and gas is a major contributor to air pollution, particularly in densely populated urban areas, where emissions from vehicles and factories accumulate. Exposure to this polluted air has been strongly linked to a range of respiratory illnesses, such as asthma and bronchitis, with children and elderly people being especially vulnerable. Reducing fossil fuel consumption would therefore not only benefit the environment but also lead to significant improvements in public health outcomes worldwide.' },
      { title: 'Conclusion', content: 'In conclusion, given the undeniable environmental damage and serious health risks associated with fossil fuels, I firmly believe that the global community must take swift and decisive action to reduce their consumption before the consequences become even more severe.' },
    ],
  },
  {
    prompt: 'Children can learn effectively by watching television, so they should be encouraged to watch TV both at home and at school. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people argue that because children can learn effectively by watching television, they should be actively encouraged to do so both at home and in school. I disagree with this view, believing that such encouragement, particularly within the school environment, would ultimately do more harm than good.' },
      { title: 'Body 1', content: "Firstly, watching television is fundamentally a passive activity, and as such, it cannot adequately replace the more interactive methods of learning that schools are designed to provide. Effective education typically relies on discussion, collaboration, and hands-on practice, all of which actively engage children's critical thinking skills. Television, by contrast, requires little active participation from viewers, meaning that children who rely heavily on it as a learning tool may fail to develop the analytical and problem-solving abilities that more interactive approaches naturally foster." },
      { title: 'Body 2', content: "Secondly, encouraging excessive television use carries genuine risks to children's health and study habits. Prolonged periods spent in front of a screen are commonly associated with eyesight problems and reduced physical activity, both of which can negatively affect a child's overall development. Moreover, children who become accustomed to television as their primary source of entertainment and information may grow increasingly dependent on it, at the expense of developing independent study habits such as reading and self-directed research, skills that are crucial for long-term academic success." },
      { title: 'Conclusion', content: "In conclusion, although television can occasionally serve as a useful supplementary resource, I firmly disagree that children should be actively encouraged to watch it at home and school. The passive nature of television, combined with its potential health and developmental drawbacks, means that more interactive and engaging teaching methods should remain the priority in children's education." },
    ],
  },
  {
    prompt: 'Too much emphasis is placed on education for young people. Some people believe that governments should spend more money on leisure activities for the youth instead. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people believe that too much importance is placed on educating young people, and that governments should instead direct more funding towards leisure activities for youth. I disagree with this view, as I believe education should remain the primary focus of government spending on young people.' },
      { title: 'Body 1', content: "The most compelling reason to prioritise education is that it provides young people with the knowledge and skills essential for their future careers and overall quality of life. A strong education system equips individuals with the ability to secure stable employment, contribute meaningfully to society, and adapt to an increasingly competitive job market. These benefits have a long-term impact that extends well beyond childhood, shaping an individual's entire future, whereas the enjoyment gained from leisure activities, though valuable, tends to be far more short-lived by comparison." },
      { title: 'Body 2', content: 'That said, I do not believe leisure activities should be dismissed entirely, as they undoubtedly offer genuine benefits, including opportunities for relaxation, social interaction, and the development of important life skills such as teamwork. However, these benefits are considerably smaller in scale than those provided by a solid education, and therefore should not be prioritised above it. Rather than shifting funding away from schools, governments would be better advised to seek ways of improving access to both education and leisure activities simultaneously, ensuring that young people benefit from a well-rounded upbringing without compromising their academic development.' },
      { title: 'Conclusion', content: "In conclusion, while leisure activities certainly play a valuable role in young people's lives, I firmly believe that education must remain the top priority for government spending, given its far greater and more lasting impact on their future prospects." },
    ],
  },
  {
    prompt: 'Some people believe that economic growth is essential for eliminating global poverty and hunger, while others argue that it can have harmful effects on the environment. Consider both arguments and present your viewpoint.',
    sampleSections: [
      { title: 'Introduction', content: 'There is ongoing debate as to whether economic growth is essential for reducing global poverty and hunger, or whether it primarily causes harm to the environment. This essay will discuss both perspectives before presenting my own view that, while growth is important, it must be pursued sustainably.' },
      { title: 'Body 1', content: 'On the one hand, many people argue that economic growth plays an indispensable role in alleviating poverty and hunger around the world. As economies expand, new job opportunities are created, providing individuals and families with the income needed to escape poverty and improve their standard of living. Furthermore, economic growth generates greater tax revenue for governments, enabling them to invest more heavily in essential public services such as healthcare, education, and food security programmes, all of which are crucial in the fight against hunger and deprivation.' },
      { title: 'Body 2', content: 'On the other hand, it is equally true that rapid economic growth often comes at a significant environmental cost. The industrial activity that drives growth typically involves the extensive consumption of natural resources, widespread deforestation, and substantial carbon emissions, all of which contribute to environmental degradation and climate change. In my opinion, both viewpoints hold considerable merit, and the most sensible approach is not to choose between economic growth and environmental protection, but to pursue growth that is genuinely sustainable, with governments actively promoting renewable energy and responsible resource management.' },
      { title: 'Conclusion', content: 'In conclusion, although economic growth remains vital for tackling poverty and hunger, it must be carefully balanced with environmental responsibility in order to be truly beneficial in the long run.' },
    ],
  },
  {
    prompt: 'Some people believe that detailed reporting of crimes in newspapers and on TV can lead to harmful consequences and should therefore be limited. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'Some people believe that the detailed reporting of crimes in newspapers and on television can have harmful consequences and should therefore be restricted. I agree with this view, primarily because such reporting can generate unnecessary public fear and, in some cases, even inspire further criminal behaviour.' },
      { title: 'Body 1', content: "Firstly, detailed and sensationalised crime reports often create a disproportionate sense of fear and anxiety among the general public. When crimes are reported with excessive detail and dramatic emphasis, viewers can develop a distorted impression that crime rates are far higher than they actually are, even in areas where crime remains relatively rare. This heightened, and often unfounded, sense of danger can significantly affect people's daily lives, making them feel unsafe in their own communities and unnecessarily altering their behaviour out of fear." },
      { title: 'Body 2', content: 'Secondly, and perhaps more seriously, overly detailed reporting can unintentionally provide a blueprint for future crimes. When media coverage describes precisely how a crime was carried out, including the specific methods used, it risks equipping individuals with dangerous ideas or techniques they might not otherwise have considered. There is credible evidence to suggest that highly publicised crimes are sometimes replicated by other offenders, a phenomenon commonly referred to as copycat crime, which represents a genuinely harmful and largely avoidable consequence of excessive media detail.' },
      { title: 'Conclusion', content: 'In conclusion, given the potential for detailed crime reporting to spread unwarranted fear and inadvertently encourage further offences, I firmly agree that such reporting should be limited. News organisations have a responsibility to inform the public without causing unnecessary alarm or providing a template for criminal behaviour.' },
    ],
  },
  {
    prompt: 'Nowadays, many celebrities are famous for their glamour and wealth rather than their achievements, which may set a negative example for young people. To what extent do you agree or disagree with this belief?',
    sampleSections: [
      { title: 'Introduction', content: 'It has become increasingly common for celebrities to achieve fame primarily through their wealth and glamorous lifestyles rather than genuine accomplishments, a trend that many believe sets a poor example for young people. I agree with this view, as I believe it can distort the values and priorities of impressionable young audiences.' },
      { title: 'Body 1', content: 'Firstly, this trend risks encouraging young people to develop unrealistic and ultimately unhealthy attitudes towards success. When teenagers repeatedly see individuals celebrated for their appearance or material wealth rather than their skills, effort, or achievements, they may begin to believe that success can be attained without genuine hard work or dedication. Many young people look up to these celebrities as role models, and admiring wealth and image over talent or perseverance can lead to a fundamentally distorted understanding of what real success actually requires.' },
      { title: 'Body 2', content: "Secondly, this phenomenon can negatively influence the career aspirations and daily priorities of young people. Increasingly, teenagers focus their energy on cultivating an appealing online image, often through social media, rather than on developing practical skills or academic knowledge that would genuinely benefit their futures. As a consequence, some may neglect their education or the meaningful effort required to build a genuinely successful and sustainable career, instead chasing the fleeting, and often unattainable, glamour associated with modern celebrity culture." },
      { title: 'Conclusion', content: 'In conclusion, I firmly agree that celebrities who are famous primarily for their wealth and glamour, rather than their genuine achievements, can set a damaging example for young people, potentially shaping both their values and their long-term aspirations in an unhealthy direction.' },
    ],
  },
  {
    prompt: 'Some people believe that it is acceptable to use animals in any way that benefits humans, while others argue that this is morally wrong. Consider both arguments and present your viewpoint.',
    sampleSections: [
      { title: 'Introduction', content: 'There is ongoing debate over whether it is acceptable to use animals in any way that benefits humans, or whether doing so is fundamentally morally wrong. This essay will explore both sides of this argument before concluding that the use of animals should be permitted, but only within carefully defined limits.' },
      { title: 'Body 1', content: 'On the one hand, many people argue that the use of animals is justified given the substantial benefits it provides to humanity. Perhaps most significantly, animal testing has played a vital role in the development of numerous life-saving medicines and vaccines, contributing enormously to advances in modern medicine that have saved countless human lives. Beyond medical research, humans have also long relied on animals for food, labour, and companionship, particularly in agricultural communities where such practices remain economically essential.' },
      { title: 'Body 2', content: 'On the other hand, opponents contend that many uses of animals are morally indefensible, as they inflict unnecessary suffering without providing any genuinely essential benefit. Practices such as testing cosmetics on animals, for example, are widely regarded as ethically questionable, since alternative testing methods are increasingly available. In my view, the use of animals should be permitted only when it serves a genuinely essential purpose, such as medical research that could save human lives, but not for purposes that are merely convenient or profitable, such as cosmetic testing or entertainment.' },
      { title: 'Conclusion', content: 'In conclusion, although using animals for human benefit remains a contentious issue, distinguishing between essential and non-essential uses offers a reasonable and ethically sound path forward.' },
    ],
  },
  {
    prompt: "Some people believe that showing imported films and TV programmes is beneficial for a country's culture, while others argue that countries should produce their own films and television programmes. Consider both arguments and present your viewpoint.",
    sampleSections: [
      { title: 'Introduction', content: "Some people argue that importing foreign films and television programmes benefits a country's culture, while others believe that nations should focus on producing their own domestic content. This essay will consider both perspectives before presenting my own opinion that a balanced approach is most beneficial." },
      { title: 'Body 1', content: 'On the one hand, imported films and television programmes can significantly broaden audiences’ cultural understanding and awareness. By watching content from other countries, viewers are exposed to different languages, traditions, and ways of life that they might otherwise never encounter, fostering greater cross-cultural appreciation and tolerance. Additionally, watching foreign-language content can be an effective and enjoyable way for people to improve their language skills, as they naturally absorb vocabulary and pronunciation through repeated exposure.' },
      { title: 'Body 2', content: "On the other hand, an overreliance on imported content poses a genuine risk to a country's own cultural identity. If domestic audiences consistently consume foreign films and programmes rather than local productions, national stories, traditions, and even languages may gradually be overshadowed or forgotten, particularly among younger generations. In my opinion, the most effective solution lies in striking a careful balance: countries should continue to welcome imported content for the cultural exposure it provides, while simultaneously investing in and promoting their own domestic film industries." },
      { title: 'Conclusion', content: 'In conclusion, while imported entertainment offers valuable cultural benefits, nations must not neglect their own creative industries, as maintaining this balance is essential for preserving cultural identity in an increasingly globalised world.' },
    ],
  },
];

async function runSeed() {
  const WritingTask2 = require('../models/WritingTask2');

  const ops = SAMPLES.map(s => ({
    updateOne: {
      filter: { prompt: s.prompt },
      update: { $set: { sampleSections: s.sampleSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask2.bulkWrite(ops);
  console.log(`[WritingTask2SamplesSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${SAMPLES.length})`);
  if (result.matchedCount !== SAMPLES.length) {
    console.warn('[WritingTask2SamplesSeed] WARNING: some prompts did not match an existing WritingTask2 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask2SamplesSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask2SamplesSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, SAMPLES };
