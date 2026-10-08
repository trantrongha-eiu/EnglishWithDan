'use strict';

// Band 7+ rewrites of the older "Bài mẫu từ Daniel" essays (54 docs) that
// pre-dated the Task2Template band7 skeletons: 2-sentence intros, bodies
// that stated ideas with no supporting explanation or real-world example,
// and one-line conclusions. Each one now follows the cloze template of its
// essay type (type01..type07, same as task2DanielSamples.js):
//   intro       H hook ×2 → P thesis
//   body        T topic → I idea 1 → S support (explanation + example)
//               → J idea 2 → U support
//   conclusion  R restatement → F final statement
// Each keeps the stance and the per-body ideas of the doc's existing
// "Phân tích đề", so the analysis panel still matches the essay.
//
// Unlike task2DanielSamples.js, these OVERWRITE the existing sample text
// (scripts/seedTask2DanielSamples.js backs the old text up first).
// `topic` = the weekly Task2Topic whose essay this is; buildEssaySections()
// in task2Essays.js uses it so seedTask2TopicEssays.js --refresh writes
// this version instead of the old prose.

module.exports = [
  // ── Advantages & Disadvantages (type01) ────────────────────────────────
  {
    id: '6a226b1117fe3959117de7a1', type: 'advantages_disadvantages', topic: 'Technology in Education',
    intro: [
      ['H', 'In recent years, online learning has become an increasingly common feature of modern education, attracting considerable public attention.'],
      ['H', 'A growing number of schools now offer virtual classes as an alternative to traditional lessons, and questions have arisen regarding the overall impact of this shift.'],
      ['P', 'This essay will examine both the advantages and disadvantages of this trend.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of online learning is that it offers far greater flexibility and access.'],
      ['I', 'To begin with, virtual classes enable students to study whenever and wherever suits them, thereby removing the barriers of time and distance.'],
      ['S', 'This is particularly valuable for learners who live in remote areas, have part-time jobs or care for family members, as they no longer need to travel to a campus every day.'],
      ['S', 'For example, platforms such as Coursera and edX work with leading universities to offer courses to millions of learners in developing countries, opportunities that would otherwise be out of reach.'],
      ['J', 'In addition, online learning can reduce the cost of education, which plays a vital role in making schooling more affordable.'],
      ['U', 'Families save money on transport and printed materials, while schools can teach large numbers of students without building extra classrooms.'],
    ],
    body2: [
      ['T', 'Despite its advantages, online learning is not without its drawbacks.'],
      ['I', 'One major concern is that the lack of face-to-face contact can seriously weaken students’ motivation.'],
      ['S', 'Without a teacher physically present to check their progress, many learners find it hard to stay disciplined and gradually fall behind.'],
      ['S', 'For instance, studies of massive open online courses have found that fewer than ten per cent of enrolled students typically complete them, which suggests that self-study alone rarely sustains commitment.'],
      ['J', 'Additionally, dependence on technology could result in unequal learning opportunities, thereby disadvantaging poorer students.'],
      ['U', 'During the school closures of 2020, UNICEF estimated that around a third of the world’s schoolchildren could not access remote lessons at all because they lacked a device or an internet connection.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although online learning offers clear benefits such as flexibility and lower costs, it also entails notable disadvantages, including weaker motivation and unequal access.'],
      ['R', 'On balance, it can be argued that its advantages outweigh its drawbacks, particularly when it is combined with some face-to-face teaching.'],
      ['F', 'Nevertheless, careful planning and investment in devices and teacher support are essential to minimise its negative effects.'],
    ],
  },

  // ── Cause & Effect (type05) ────────────────────────────────────────────
  {
    id: '6a7c5ef6cdbb3e26189f9cf2', type: 'cause_effect', topic: 'Online Learning and Student Motivation',
    intro: [
      ['H', 'In today’s digital age, the struggle to stay motivated during online lessons has become an increasingly significant concern for students and educators alike.'],
      ['H', 'Although virtual classes offer convenience, many learners report that they find it far harder to concentrate and keep up when studying from home.'],
      ['P', 'This essay will examine the underlying causes of this problem and analyse its significant effects on students.'],
    ],
    body1: [
      ['T', 'The causes of this problem are both complex and closely connected.'],
      ['I', 'One primary factor is the absence of direct supervision and social interaction, which significantly contributes to low motivation.'],
      ['S', 'In a physical classroom, a teacher can notice when a student loses focus and offer encouragement on the spot, whereas online these small interventions largely disappear.'],
      ['S', 'For example, many students admit to switching off their cameras during video lessons and doing something else entirely, knowing that nobody is likely to notice.'],
      ['J', 'This problem can also be attributed to the many distractions that exist at home.'],
      ['U', 'Mobile phones, television and family members are all within easy reach, so every study session becomes a contest against more entertaining options.'],
      ['U', 'Not only does this reduce the time spent learning, but it also creates a ripple effect, as students who fall behind find it even harder to re-engage.'],
    ],
    body2: [
      ['T', 'The effects of this lack of motivation are both immediate and long-term.'],
      ['I', 'One significant consequence is poorer academic performance.'],
      ['S', 'Students who are not motivated tend to submit assignments late, revise less thoroughly and achieve lower grades, and research has consistently shown that fully online courses have much higher dropout rates than equivalent courses taught on campus.'],
      ['J', 'Furthermore, this phenomenon inevitably leads to social isolation.'],
      ['U', 'Learners who spend months studying alone at a screen often feel disconnected from their teachers and classmates, and some report loneliness and anxiety.'],
      ['U', 'Over time, these effects may accumulate, damaging students’ confidence and their sense of belonging to a learning community.'],
    ],
    conclusion: [
      ['R', 'In conclusion, low motivation in online learning stems mainly from a lack of supervision and the many distractions at home, and it results in weaker academic results and greater isolation.'],
      ['F', 'Addressing this problem requires coordinated efforts from teachers, parents and students themselves.'],
      ['F', 'If effective measures are taken, such as shorter interactive lessons and regular one-to-one check-ins, the negative impacts can be significantly reduced.'],
    ],
  },

  // ── Positive or Negative Development (type07) ──────────────────────────
  {
    id: '6a848738c4d5b5ac38bce88b', type: 'positive_or_negative_development',
    intro: [
      ['H', 'In recent years, the expectation that services, information and goods should be available instantly has emerged as one of the most noticeable trends in modern society.'],
      ['H', 'From next-day delivery to on-demand streaming, people are becoming less and less willing to wait for anything.'],
      ['P', 'While this trend undoubtedly offers convenience, I firmly believe that, on balance, it is a harmful development because it erodes patience and encourages poor decision-making.'],
    ],
    body1: [
      ['T', 'Firstly, the culture of instant gratification makes people less patient in other areas of their lives.'],
      ['I', 'When individuals become accustomed to having their needs met immediately, they gradually lose the ability to tolerate delay or difficulty.'],
      ['S', 'This is primarily because learning a skill, building a career or maintaining a relationship all require sustained effort over months or even years, with no immediate reward.'],
      ['S', 'To illustrate, many teachers report that students who are used to finding answers online within seconds now give up quickly when a maths problem or a long text cannot be understood straight away.'],
      ['J', 'Furthermore, this impatience extends well beyond the classroom.'],
      ['U', 'In the workplace, employees who expect quick results may become frustrated with long-term projects, which can harm both their performance and their professional development.'],
    ],
    body2: [
      ['T', 'Secondly, the pressure to obtain things instantly often leads to poorly considered decisions.'],
      ['I', 'Without adequate time to reflect, people are far more likely to make impulsive choices that they later regret.'],
      ['S', 'This is particularly evident in online shopping, where one-click payment and limited-time offers encourage consumers to buy items without comparing prices or reading reviews.'],
      ['S', 'For instance, the rapid growth of “buy now, pay later” services has left many young shoppers in debt for products they did not truly need.'],
      ['J', 'Admittedly, instant access can be genuinely useful, for example when someone urgently needs medical information or directions.'],
      ['U', 'However, these benefits do not outweigh the long-term damage caused by impulsive habits, which gradually lower the quality of the decisions people make about their money, the information they trust and even their health.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that the growing expectation of instant results is fundamentally a harmful development.'],
      ['R', 'Its convenience is real, but it comes at the cost of patience and careful judgement.'],
      ['F', 'Going forward, it is essential that families and schools teach young people the value of waiting and thinking carefully before they act.'],
    ],
  },

  // ── Agree or Disagree (type06) ─────────────────────────────────────────
  {
    id: '6a848738c4d5b5ac38bce88c', type: 'agree_disagree',
    intro: [
      ['H', 'The issue of media intrusion into celebrities’ private lives has become a subject of considerable debate in recent years.'],
      ['H', 'Many famous people complain that journalists and photographers follow them constantly, while others argue that such attention is simply the price of fame.'],
      ['P', 'I strongly disagree that celebrities should accept this intrusion, as fame does not remove a person’s right to privacy and constant coverage can cause genuine harm.'],
    ],
    body1: [
      ['T', 'Firstly, privacy is a basic human right that should not be lost merely because a person becomes well-known.'],
      ['I', 'It is fair for public figures to expect scrutiny of their professional work, such as their films, songs or political decisions.'],
      ['S', 'However, this does not mean that their health, relationships and family lives should be open to the public, because these areas have nothing to do with the work that made them famous.'],
      ['S', 'For instance, the UK’s Leveson Inquiry in 2011–12 revealed that some newspapers had hacked the phones of actors and even crime victims.'],
      ['J', 'This is especially unfair for the children of celebrities.'],
      ['U', 'They did not choose to be in the public eye, yet many are photographed outside their schools or in parks, which can expose them to bullying and even safety risks.'],
    ],
    body2: [
      ['T', 'Secondly, constant media intrusion can have a severe impact on a celebrity’s mental health.'],
      ['I', 'Being followed, photographed and written about every day places enormous psychological pressure on public figures, who feel they must appear flawless at all times.'],
      ['S', 'This is largely because a single unflattering photograph or rumour can now spread across social media within minutes and trigger waves of online abuse.'],
      ['S', 'The death of Princess Diana in 1997, in a car crash while being pursued by photographers, remains the most tragic illustration of where relentless pursuit can lead.'],
      ['J', 'While some may argue that celebrities benefit from publicity, this view ignores the difference between coverage of their work and harassment in their private lives.'],
      ['U', 'Indeed, many singers and athletes have spoken openly about anxiety and depression linked to intense media attention.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I firmly maintain that celebrities should not have to accept invasive media coverage as an unavoidable part of fame.'],
      ['R', 'Their right to privacy and their mental well-being deserve the same protection as anyone else’s.'],
      ['F', 'Ultimately, striking a balance between the public’s interest in their work and respect for their personal lives may represent the most pragmatic approach.'],
    ],
  },

  // ── Cause + Positive or Negative (two-part question) ───────────────────
  {
    id: '6a848738c4d5b5ac38bce88d', type: 'positive_or_negative_development',
    intro: [
      ['H', 'In today’s digital world, the growing amount of time children spend on computer games rather than sports has become an increasingly significant concern.'],
      ['H', 'Many parents notice that their children would rather sit in front of a screen than play football or go swimming with friends.'],
      ['P', 'This essay will examine the main reasons for this shift before arguing that, on balance, it is a harmful trend for young people’s development.'],
    ],
    body1: [
      ['T', 'There are two main reasons why computer games have become more popular than sports among children.'],
      ['I', 'Firstly, video games are far more accessible, as they can be played at home at any time without special equipment, good weather or other players.'],
      ['S', 'Sports, by contrast, usually require a pitch or a pool, a fixed schedule and often a team, all of which can be difficult to arrange for busy modern families.'],
      ['S', 'For example, a child living in a crowded city apartment may have no safe space to play outdoors, yet can join an online game with friends within seconds.'],
      ['J', 'Secondly, many parents perceive gaming as a safer option than outdoor activities.'],
      ['U', 'Worried about traffic, injuries or strangers, they prefer to keep their children indoors where they can be supervised, even if this means more screen time.'],
    ],
    body2: [
      ['T', 'Despite these understandable reasons, I believe this trend is harmful to children’s overall development.'],
      ['I', 'Physically, excessive gaming contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems.'],
      ['S', 'According to the World Health Organization, more than 80% of adolescents worldwide do not reach the recommended one hour of physical activity a day, and long hours of screen time are a major reason for this.'],
      ['J', 'Just as importantly, sports provide valuable opportunities to develop social skills such as teamwork, communication and resilience.'],
      ['U', 'When children play in a team, they learn to cooperate, follow rules and cope with defeat, lessons that solitary gaming cannot easily replicate.'],
      ['U', 'Children who spend most of their free time gaming therefore risk missing out on crucial aspects of both their physical and social growth.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the convenience and perceived safety of computer games explain why children increasingly choose them over sports.'],
      ['R', 'However, the resulting decline in physical activity and face-to-face interaction makes this a largely harmful trend.'],
      ['F', 'Going forward, parents and schools should make sport more accessible and enjoyable so that games remain a hobby rather than a replacement for exercise.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce88e', type: 'positive_or_negative_development',
    intro: [
      ['H', 'In both education and employment, it is evident that some individuals consistently put in far more effort than others.'],
      ['H', 'This difference raises questions not only about what drives people to work hard, but also about whether hard work is always a virtue.'],
      ['P', 'This essay will examine the main reasons behind this difference before arguing that working hard, while often admirable, is not always beneficial.'],
    ],
    body1: [
      ['T', 'People work harder than others for a combination of personal and external reasons.'],
      ['I', 'One major reason is internal motivation, such as ambition, a clear goal or genuine passion for a subject or career.'],
      ['S', 'This is largely because people who find their work meaningful are willing to spend extra hours on it without being told to.'],
      ['S', 'For example, a student who dreams of becoming a doctor is likely to study late into the night, while a classmate who sees no purpose in the subject may do only the minimum.'],
      ['J', 'Another important factor is external pressure, such as financial need or family expectations.'],
      ['U', 'A worker supporting several dependants may take on overtime simply to pay the bills, and in many cultures children study extremely hard partly to meet their parents’ high hopes.'],
    ],
    body2: [
      ['T', 'However, working hard is not always a good thing, as it can lead to serious negative effects when taken to an extreme.'],
      ['I', 'One key concern is that excessive work damages both physical and mental health.'],
      ['S', 'A joint study by the World Health Organization and the International Labour Organization estimated that long working hours led to around 745,000 deaths from stroke and heart disease in 2016 alone.'],
      ['J', 'In addition, overwork often comes at the expense of family life and does not even guarantee better results.'],
      ['U', 'Beyond a certain point, fatigue reduces concentration and creativity, so an exhausted employee may actually achieve less than a well-rested colleague.'],
      ['U', 'Hard work is therefore only truly beneficial when it is balanced with adequate rest and time for personal life.'],
    ],
    conclusion: [
      ['R', 'In conclusion, some people work harder than others because of personal ambition or external pressures such as money and family expectations.'],
      ['R', 'Nevertheless, hard work is not good in all circumstances, as too much of it can harm health, relationships and even productivity.'],
      ['F', 'Ultimately, striking a balance between effort and rest may represent the most sensible path to long-term success.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce88f', type: 'agree_disagree',
    intro: [
      ['H', 'The issue of global fossil fuel consumption has become a subject of considerable debate in recent years.'],
      ['H', 'Some argue that the international community must act immediately to ensure that every nation reduces its use of oil and gas.'],
      ['P', 'I strongly agree with this view because of the severe environmental and health consequences of continued reliance on these fuels.'],
    ],
    body1: [
      ['T', 'One compelling reason why urgent action is needed is the central role that fossil fuels play in climate change.'],
      ['I', 'Burning coal, oil and gas releases vast quantities of carbon dioxide, which is widely recognised as the main driver of global warming.'],
      ['S', 'The consequences are already visible in more frequent and severe heatwaves, floods and droughts, which destroy homes, crops and livelihoods.'],
      ['S', 'For instance, the 2022 floods in Pakistan, which scientists linked to monsoon rainfall intensified by climate change, left around a third of the country under water.'],
      ['J', 'Furthermore, climate change is a global problem that no single country can solve alone.'],
      ['U', 'If only some nations cut their emissions while others continue to burn more fuel, the overall effect will be limited, which is why coordinated international action is essential.'],
    ],
    body2: [
      ['T', 'Secondly, the use of fossil fuels causes serious air pollution, which directly threatens public health.'],
      ['I', 'Emissions from vehicles, power stations and factories accumulate in densely populated cities, where millions of people breathe them every day.'],
      ['S', 'This polluted air is strongly linked to asthma, bronchitis and heart disease, and children and elderly people are especially vulnerable.'],
      ['S', 'According to the World Health Organization, outdoor air pollution causes more than four million premature deaths every year.'],
      ['J', 'While some may argue that cutting fossil fuels quickly would harm economic growth, this view fails to recognise that renewable energy is now often the cheapest source of new electricity.'],
      ['U', 'Reducing fossil fuel use would therefore not only protect the environment but also improve public health without sacrificing prosperity.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I firmly agree that the international community must take immediate action to reduce fossil fuel consumption.'],
      ['R', 'The environmental damage and health risks are simply too serious to ignore.'],
      ['F', 'Ultimately, a fair transition, in which richer nations help poorer ones invest in clean energy, may represent the most pragmatic way forward.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce890', type: 'agree_disagree',
    intro: [
      ['H', 'The role of television in children’s education has become a subject of considerable debate in recent years.'],
      ['H', 'Some people argue that because children can learn effectively from TV, they should be encouraged to watch it both at home and at school.'],
      ['P', 'While I accept that some programmes have educational value, I disagree with this view, as actively encouraging television would do more harm than good.'],
    ],
    body1: [
      ['T', 'Firstly, watching television is fundamentally a passive activity, so it cannot replace more interactive ways of learning.'],
      ['I', 'Effective education relies on discussion, collaboration and hands-on practice, all of which require children to think actively.'],
      ['S', 'Television, by contrast, asks very little of its viewers, so children who rely on it may fail to develop the problem-solving and analytical skills that interactive lessons foster.'],
      ['S', 'For instance, a child who watches a documentary about plants may remember a few facts, but one who grows seeds in the classroom learns to observe, ask questions and test ideas.'],
      ['J', 'In addition, television cannot respond to an individual child’s needs.'],
      ['U', 'A teacher can notice confusion and explain a point again in a different way, whereas a programme continues at the same pace whether or not the viewer has understood.'],
    ],
    body2: [
      ['T', 'Secondly, excessive screen time can negatively affect children’s health and study habits.'],
      ['I', 'Long periods in front of a screen are associated with eyesight problems and reduced physical activity.'],
      ['S', 'This is why the American Academy of Pediatrics recommends that children aged two to five watch no more than one hour of screen media a day.'],
      ['J', 'Moreover, children who become used to television as their main source of information may become dependent on it.'],
      ['U', 'As a result, they may lose interest in reading books and doing their own research, skills that are crucial for long-term academic success.'],
      ['U', 'Admittedly, a carefully chosen programme can occasionally support a lesson; however, this does not justify encouraging children to watch more television overall.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I disagree that children should be actively encouraged to watch television at home and at school.'],
      ['R', 'Its passive nature and its potential harm to health and study habits outweigh its limited educational benefits.'],
      ['F', 'Ultimately, using television sparingly as a supplement to interactive teaching may represent the most sensible approach.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce891', type: 'agree_disagree',
    intro: [
      ['H', 'The question of how governments should spend money on young people has become a subject of considerable debate in recent years.'],
      ['H', 'Some believe that too much emphasis is placed on education and that more funding should go towards leisure activities for the youth instead.'],
      ['P', 'While I accept that leisure plays a valuable role in young people’s lives, I disagree with this view, as education should remain the main focus of public spending.'],
    ],
    body1: [
      ['T', 'The most compelling reason to prioritise education is that it gives young people the knowledge and skills essential for their future.'],
      ['I', 'A strong education system enables individuals to secure stable jobs, adapt to a competitive labour market and contribute to society.'],
      ['S', 'This is largely because modern economies increasingly depend on literacy, mathematics and digital skills, which are developed mainly at school.'],
      ['S', 'For example, OECD data consistently show that adults with a university degree earn considerably more on average than those who only finished secondary school.'],
      ['J', 'Furthermore, the benefits of education last a lifetime and extend to the whole of society.'],
      ['U', 'Well-educated citizens tend to be healthier and less likely to depend on welfare, whereas the enjoyment gained from leisure activities is usually far more short-lived.'],
    ],
    body2: [
      ['T', 'While leisure activities do offer some benefits, they should not be prioritised over education.'],
      ['I', 'Sports clubs, music lessons and youth centres certainly provide relaxation, social interaction and skills such as teamwork.'],
      ['S', 'They can also keep teenagers away from crime and antisocial behaviour by giving them a safe place to spend their free time.'],
      ['J', 'However, these benefits are smaller in scale than those of a good education, so reversing the order of priority would be a mistake.'],
      ['U', 'Rather than shifting money away from schools, governments would be better advised to combine the two, for instance by funding after-school sports and arts programmes on school premises, so that young people enjoy a well-rounded upbringing without sacrificing their studies.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I maintain that education must remain the top priority for government spending on young people.'],
      ['R', 'Its impact on their future prospects is far greater and more lasting than that of leisure activities.'],
      ['F', 'Ultimately, striking a balance in which schools also provide leisure opportunities may represent the most pragmatic approach.'],
    ],
  },
  // ── Discuss Both Views (type02) ────────────────────────────────────────
  {
    id: '6a848738c4d5b5ac38bce892', type: 'discuss_both_views',
    intro: [
      ['H', 'In recent decades, the relationship between economic growth and global poverty has attracted increasing public attention.'],
      ['H', 'While some people argue that growth is essential for eliminating poverty and hunger, others believe that it causes serious harm to the environment.'],
      ['P', 'This essay will discuss both views before explaining why I believe growth is necessary but must be pursued sustainably.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people regard economic growth as the key to ending poverty and hunger.'],
      ['I', 'One major reason for this view is that expanding economies create jobs and raise incomes.'],
      ['S', 'This is largely because new industries and businesses need workers, so families gain the earnings they need to afford food, housing and education.'],
      ['S', 'For instance, according to the World Bank, rapid growth in China since the late 1970s has lifted around 800 million people out of extreme poverty.'],
      ['J', 'Furthermore, another important factor to consider is government revenue.'],
      ['U', 'A growing economy generates more tax income, which allows the state to invest in healthcare, schools and food-security programmes that protect the poorest citizens.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that rapid economic growth often comes at a significant cost to the environment.'],
      ['I', 'One key concern is that industrial expansion depends on the heavy use of natural resources and fossil fuels.'],
      ['S', 'This leads to deforestation, polluted rivers and rising carbon emissions, which in turn accelerate climate change.'],
      ['S', 'A clear example is the Amazon rainforest, where vast areas have been cleared for cattle ranching and soya farming to supply global markets.'],
      ['J', 'Ironically, such environmental damage often hurts the poor the most.'],
      ['U', 'Farmers in developing countries are the first to suffer from droughts, floods and failed harvests, so growth that destroys the environment can eventually undermine the very fight against hunger it was meant to support.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding the impact of economic growth.'],
      ['R', 'Personally, I believe that growth remains vital for tackling poverty and hunger, but only if it is environmentally sustainable.'],
      ['F', 'Moving forward, governments should consider investing in renewable energy and responsible resource management so that prosperity does not come at the planet’s expense.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce893', type: 'agree_disagree',
    intro: [
      ['H', 'The issue of how the media report crime has become a subject of considerable debate in recent years.'],
      ['H', 'Some people believe that detailed coverage of crimes in newspapers and on television has harmful consequences and should therefore be restricted.'],
      ['P', 'I agree with this view, primarily because such reporting can create unnecessary public fear and, in some cases, even inspire further crimes.'],
    ],
    body1: [
      ['T', 'Firstly, detailed and sensational crime reports often create a disproportionate sense of fear among the public.'],
      ['I', 'When crimes are described with dramatic language and graphic detail, viewers can develop the impression that crime is far more common than it really is.'],
      ['S', 'This is largely because the media tend to focus on rare but shocking cases, such as murders and kidnappings, rather than on the overall statistics.'],
      ['S', 'For example, surveys in Britain have repeatedly found that most people believe crime is rising nationally, even in years when official figures show it falling.'],
      ['J', 'Such unfounded fear can significantly affect people’s daily lives.'],
      ['U', 'Elderly residents may avoid going out after dark, and parents may stop their children from playing outside, even in neighbourhoods that are perfectly safe.'],
    ],
    body2: [
      ['T', 'Secondly, overly detailed reporting can unintentionally encourage copycat crimes.'],
      ['I', 'When news coverage explains exactly how a crime was carried out, it may give dangerous ideas to people who would not otherwise have thought of them.'],
      ['S', 'There is evidence that highly publicised attacks, such as some mass shootings in the United States, have been followed by similar incidents, a pattern that researchers call the “contagion effect”.'],
      ['J', 'While some may argue that limiting crime reporting threatens press freedom, this perspective fails to recognise that the public can be informed without graphic details or methods.'],
      ['U', 'Responsible journalism can still report what happened while avoiding sensationalism and refusing to turn offenders into celebrities.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I agree that detailed crime reporting should be limited.'],
      ['R', 'It spreads unnecessary fear and can inadvertently inspire further offences.'],
      ['F', 'Ultimately, striking a balance between the public’s right to know and the media’s responsibility to avoid harm may represent the most pragmatic approach.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce894', type: 'agree_disagree',
    intro: [
      ['H', 'The influence of celebrities on young people has become a subject of considerable debate in recent years.'],
      ['H', 'Nowadays, many famous people are admired for their glamorous lifestyles and wealth rather than for any genuine achievement.'],
      ['P', 'I agree that this sets a negative example for young people, as it can distort both their values and their priorities.'],
    ],
    body1: [
      ['T', 'Firstly, this trend encourages young people to develop unrealistic attitudes towards success.'],
      ['I', 'When teenagers repeatedly see people celebrated for their appearance or possessions, they may come to believe that success does not require skill or hard work.'],
      ['S', 'This is largely because social media constantly displays luxury cars, designer clothes and exotic holidays, while the effort behind real achievements is rarely shown.'],
      ['S', 'For instance, a 2019 survey of children in the United States and the United Kingdom found that more of them wanted to become a YouTuber than an astronaut.'],
      ['J', 'Furthermore, admiring wealth over talent can damage young people’s self-esteem.'],
      ['U', 'Comparing their ordinary lives with the carefully edited images of celebrities may leave many teenagers dissatisfied with their appearance and their circumstances.'],
    ],
    body2: [
      ['T', 'Secondly, this phenomenon can negatively affect young people’s career aspirations and priorities.'],
      ['I', 'Increasingly, some teenagers focus their energy on building an attractive online image rather than on developing practical skills or academic knowledge.'],
      ['S', 'As a consequence, they may neglect their studies in the hope of becoming famous quickly, even though only a tiny fraction of people ever earn a living this way.'],
      ['J', 'Admittedly, some celebrities use their fame to support charities or important causes, which can inspire young fans.'],
      ['U', 'However, such positive examples are outweighed by the dominant message that image matters more than effort, and young people who chase this fleeting glamour risk reaching adulthood without the qualifications or experience needed for a stable career.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I agree that celebrities who are famous mainly for their glamour and wealth set a damaging example for young people.'],
      ['R', 'They promote unrealistic ideas of success and may lead teenagers to neglect the skills they truly need.'],
      ['F', 'Ultimately, parents and schools should draw young people’s attention to role models whose fame is built on talent and hard work.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce895', type: 'discuss_both_views',
    intro: [
      ['H', 'In recent decades, the issue of how humans use animals has attracted increasing public attention.'],
      ['H', 'While some people argue that it is acceptable to use animals in any way that benefits humans, others believe this is morally wrong.'],
      ['P', 'This essay will discuss both views before explaining why I believe animals should be used only when it is genuinely necessary.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people support the use of animals for human benefit.'],
      ['I', 'One major reason for this view is that animal research has played a vital role in modern medicine.'],
      ['S', 'This is largely because new drugs and vaccines must be tested for safety before they are given to people, and animal studies have long been part of this process.'],
      ['S', 'For instance, many vaccines, including those developed against COVID-19, were tested on animals before human trials, helping to save millions of lives.'],
      ['J', 'Furthermore, another important factor to consider is the role of animals in food production and livelihoods.'],
      ['U', 'In many rural communities, raising livestock remains the main source of income and nutrition, so banning such uses would cause serious economic hardship.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that many uses of animals cause unnecessary suffering.'],
      ['I', 'One key concern is that some practices bring humans only minor benefits while inflicting real pain on animals.'],
      ['S', 'Testing cosmetics on animals, for example, is difficult to justify, since alternatives such as computer models and lab-grown skin cells are now widely available.'],
      ['S', 'This is why the European Union banned the sale of cosmetics tested on animals in 2013.'],
      ['J', 'Similarly, keeping wild animals in poor conditions for entertainment, as some circuses still do, causes distress purely for profit.'],
      ['U', 'These examples show that the claim that animals may be used “in any way” goes too far.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both sides offer valid arguments regarding the use of animals.'],
      ['R', 'Personally, I believe that animals should be used only when it serves an essential purpose, such as life-saving medical research, but not for cosmetics or entertainment.'],
      ['F', 'Moving forward, governments should consider stricter animal-welfare laws and greater investment in alternative testing methods.'],
    ],
  },
  {
    id: '6a848738c4d5b5ac38bce896', type: 'discuss_both_views',
    intro: [
      ['H', 'In recent decades, the global popularity of foreign films and television programmes has attracted increasing public attention.'],
      ['H', 'While some people argue that showing imported content benefits a country’s culture, others believe that nations should focus on producing their own.'],
      ['P', 'This essay will discuss both views before explaining why I believe a balance between the two is most beneficial.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people support imported films and television programmes.'],
      ['I', 'One major reason for this view is that foreign content broadens audiences’ cultural understanding.'],
      ['S', 'By watching productions from other countries, viewers are exposed to different traditions, values and ways of life, which can foster tolerance and curiosity.'],
      ['S', 'For example, the worldwide success of Korean dramas has encouraged millions of fans to learn about Korean food, history and language.'],
      ['J', 'Furthermore, another important factor to consider is language learning.'],
      ['U', 'Watching foreign-language programmes with subtitles is an enjoyable way to improve listening skills, which partly explains why countries such as the Netherlands, where foreign shows are subtitled rather than dubbed, have very high levels of English.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that relying too heavily on imported content may weaken a country’s own cultural identity.'],
      ['I', 'One key concern is that local films struggle to compete with big-budget foreign productions.'],
      ['S', 'If audiences mainly watch foreign films, national stories, traditions and even languages may gradually be overshadowed, especially among young people.'],
      ['S', 'Hollywood films, for instance, take the majority of cinema ticket sales in many European countries, leaving domestic film-makers with only a small share of the market.'],
      ['J', 'This is why some governments actively protect their own industries.'],
      ['U', 'South Korea, for example, introduced a screen quota requiring cinemas to show local films on a minimum number of days each year, which helped its industry grow strong enough to compete internationally.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding foreign and domestic films.'],
      ['R', 'Personally, I believe that countries should continue to welcome imported content while also investing in their own film and television industries.'],
      ['F', 'Moving forward, governments should consider funding local productions so that cultural exchange does not come at the cost of cultural identity.'],
    ],
  },

  // ── Cause & Effect (type05) ────────────────────────────────────────────
  {
    id: '6a857a10282c853ce33a92f0', type: 'cause_effect', topic: 'Dropout Rates in Higher Education',
    intro: [
      ['H', 'In today’s competitive world, the rising number of students who leave university without a degree has become an increasingly significant concern.'],
      ['H', 'Across many countries, a growing proportion of undergraduates abandon their studies before graduation.'],
      ['P', 'This essay will examine the underlying causes of this trend and analyse its significant effects on individuals and society.'],
    ],
    body1: [
      ['T', 'The causes of university dropout are both complex and interconnected.'],
      ['I', 'One primary factor is financial pressure, which significantly contributes to this problem.'],
      ['S', 'As tuition fees and rents have risen faster than student support, many undergraduates have to work long hours in part-time jobs, leaving them too tired to attend lectures or complete assignments.'],
      ['S', 'For example, in the United States more than a third of students who start a degree have still not completed it six years later, and money problems are among the most common reasons they give.'],
      ['J', 'This trend can also be attributed to inadequate preparation for university life.'],
      ['U', 'At school, students are guided closely and given frequent deadlines, whereas university demands independent study and self-discipline.'],
      ['U', 'First-year students who receive little support during this transition can quickly fall behind, and once they feel lost, withdrawing seems easier than asking for help.'],
    ],
    body2: [
      ['T', 'The effects of this trend are both immediate and long-term.'],
      ['I', 'One significant consequence is a serious financial setback for the individual.'],
      ['S', 'Students who drop out lose years of potential earnings and may still have to repay loans for a course that gave them no qualification, a burden that can limit their choices well into their thirties.'],
      ['J', 'Furthermore, this phenomenon inevitably leads to wasted public resources and a shortage of skilled workers.'],
      ['U', 'Every dropout represents money spent by universities and taxpayers on a place that produced no graduate, while employers in fields such as engineering and healthcare struggle to recruit.'],
      ['U', 'Over time, these effects may accumulate, widening the gap in income and opportunity between those who finish a degree and those who do not.'],
    ],
    conclusion: [
      ['R', 'In conclusion, rising university dropout rates stem mainly from financial pressure and inadequate preparation, and they harm both students and society.'],
      ['F', 'Addressing this problem requires coordinated efforts from universities and policymakers.'],
      ['F', 'If effective measures are taken, such as better financial aid and stronger first-year support, the negative impacts can be significantly reduced.'],
    ],
  },

  // ── Cause & Solution (type03) ──────────────────────────────────────────
  {
    id: '6a8e89ca756b6bc7a0ce2394', type: 'cause_solution', topic: 'Growing Rates of Childhood Obesity',
    intro: [
      ['H', 'In recent years, childhood obesity has become an increasingly serious problem in many parts of the world.'],
      ['H', 'According to the World Health Organization, the number of obese children and adolescents rose more than tenfold between 1975 and 2016.'],
      ['P', 'This essay will explore the main causes of this problem and propose practical solutions to address it.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to childhood obesity.'],
      ['I', 'One of the main reasons is the poor quality of many children’s diets, which can largely be attributed to cheap fast food and sugary drinks.'],
      ['S', 'These products are heavily advertised to children on television and social media, while busy parents often lack the time to prepare healthy meals at home.'],
      ['S', 'For instance, a single can of regular cola contains around 35 grams of sugar, which is more than the recommended daily limit for a young child.'],
      ['J', 'Another key contributor is a lack of physical activity.'],
      ['U', 'Unlike in the past, when children played outside after school, today many spend hours in front of screens, so they burn far fewer calories than they consume.'],
      ['U', 'If this trend continues, a generation of children may develop type 2 diabetes and heart disease far earlier in life.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to address this issue effectively.'],
      ['I', 'One effective way to tackle this problem is to make unhealthy food less attractive through taxation and marketing rules.'],
      ['S', 'After the UK introduced its sugar levy on soft drinks in 2018, many manufacturers cut the sugar in their products, and Chile’s black warning labels on unhealthy food led to a sharp drop in purchases of sugary drinks.'],
      ['J', 'Another viable approach involves improving the school environment.'],
      ['U', 'Schools should serve nutritious meals, remove vending machines selling sugary snacks and increase the time devoted to physical education.'],
      ['U', 'Not only would this help children eat better, but it would also teach them healthy habits that last into adulthood.'],
    ],
    conclusion: [
      ['R', 'In conclusion, childhood obesity remains a pressing issue that is caused mainly by unhealthy diets and inactive lifestyles.'],
      ['R', 'Among the various measures discussed, I believe that taxing unhealthy food combined with better school meals would be the most effective in the long term.'],
      ['F', 'If governments, schools and parents work together, this issue can be significantly alleviated.'],
    ],
  },
  {
    id: '6a8e89e3756b6bc7a0ce2395', type: 'cause_solution', topic: 'Overreliance on Fast Food & Processed Foods',
    intro: [
      ['H', 'In recent years, the growing reliance on processed and fast food has become an increasingly serious health concern in many countries.'],
      ['H', 'In the United Kingdom, for example, ultra-processed products now make up more than half of the calories in the average diet.'],
      ['P', 'This essay will explore the main causes of this shift and propose practical ways in which governments and communities can address it.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to this change in eating habits.'],
      ['I', 'One of the main reasons is the pressure of modern working life, which leaves families with little time or energy to cook.'],
      ['S', 'Long working hours and long commutes mean that many people come home late and choose a ready meal or a takeaway simply because it is quick.'],
      ['S', 'The rapid growth of food-delivery apps has made this even easier, as a hot meal can now arrive at the door within half an hour.'],
      ['J', 'Another key contributor is the low cost and aggressive marketing of fast food.'],
      ['U', 'Unlike in the past, when most meals were prepared at home from fresh ingredients, today cheap burgers and snacks are sold on almost every street and promoted through constant advertising.'],
      ['U', 'In some low-income areas, known as “food deserts”, there are barely any shops that sell fresh fruit and vegetables at all.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical steps can be taken to address this issue effectively.'],
      ['I', 'One effective way to tackle this problem is to make fresh food more affordable.'],
      ['S', 'Governments can subsidise fruit and vegetables, and a voucher scheme trialled with low-income families in the United States clearly increased the amount of fresh produce they ate.'],
      ['J', 'Another viable approach involves teaching cooking and nutrition in schools and communities.'],
      ['U', 'If young people learn to prepare simple, healthy meals, they are far less likely to depend on processed food as adults.'],
      ['U', 'Clear nutrition labels and restrictions on junk-food advertising aimed at children would further support these efforts.'],
    ],
    conclusion: [
      ['R', 'In conclusion, our reliance on processed food is a pressing issue caused mainly by busy lifestyles and the cheap convenience of fast food.'],
      ['R', 'Among the various measures discussed, I believe that subsidising fresh produce and teaching cooking skills would be the most effective in the long term.'],
      ['F', 'If governments, schools and local communities work together, this issue can be significantly alleviated.'],
    ],
  },
  {
    id: '6a8e8a31756b6bc7a0ce2396', type: 'cause_solution', topic: 'Rise in Modern Mental Stress & Anxiety',
    intro: [
      ['H', 'In recent years, stress-related illnesses and anxiety disorders have become an increasingly serious problem in modern society.'],
      ['H', 'The World Health Organization estimates that depression and anxiety cost the global economy around one trillion US dollars in lost productivity every year.'],
      ['P', 'This essay will explore the main causes of this problem and propose practical solutions to improve public mental well-being.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to the rise in stress and anxiety.'],
      ['I', 'One of the main reasons is the intensity of modern working life.'],
      ['S', 'Job insecurity, long hours and constant emails mean that many employees never fully switch off, and a mind kept on alert for months at a time eventually becomes exhausted.'],
      ['S', 'For instance, the habit of checking work messages late at night and first thing in the morning leaves many people with almost no time to rest.'],
      ['J', 'Another key contributor is the influence of social media.'],
      ['U', 'Scrolling through carefully edited images of other people’s lives invites constant comparison, while an endless stream of alarming news keeps users anxious about problems they cannot control.'],
      ['U', 'If this trend continues, more and more people may find themselves unable to work or study because of their mental health.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to address this issue effectively.'],
      ['I', 'One effective way to tackle this problem is to make counselling easy to access before a crisis develops.'],
      ['S', 'Workplaces and schools should offer free, confidential support with short waiting times, so that a person who is struggling can be seen within days rather than months.'],
      ['J', 'Another viable approach involves teaching coping skills from an early age.'],
      ['U', 'Lessons on stress management, healthy sleep and challenging anxious thoughts in secondary schools would give young people tools they can use for life.'],
      ['U', 'Research has shown that public campaigns which treat anxiety as a common and treatable condition encourage people to seek help earlier, when treatment is cheaper and more effective.'],
    ],
    conclusion: [
      ['R', 'In conclusion, rising stress and anxiety remain a pressing issue caused mainly by workplace pressure and the negative effects of social media.'],
      ['R', 'Among the various measures discussed, I believe that accessible counselling and early education in coping skills would be the most effective in the long term.'],
      ['F', 'If governments, employers and schools work together, this issue can be significantly alleviated.'],
    ],
  },
  // ── Advantages & Disadvantages (type01) ────────────────────────────────
  {
    id: '6a905d1f31a29bc08f2e5a6e', type: 'advantages_disadvantages', topic: 'Mobile Devices and Communication',
    intro: [
      ['H', 'In recent years, smartphones and tablets have become an increasingly essential feature of modern life, transforming the way people communicate.'],
      ['H', 'With the growing prevalence of these devices, questions have arisen regarding their overall impact on human relationships.'],
      ['P', 'Although they have some drawbacks, I believe the advantages of instant, low-cost communication clearly outweigh the disadvantages.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of mobile devices is that they allow people to stay in touch instantly, cheaply and across any distance.'],
      ['I', 'To begin with, messaging and video-calling apps enable families and friends to communicate every day, wherever they live.'],
      ['S', 'This has made it far easier for migrant workers, international students and dispersed families to maintain close ties.'],
      ['S', 'For example, apps such as WhatsApp and Zalo let a family living in several countries make free video calls whenever they wish, something that would have been extremely expensive a generation ago.'],
      ['J', 'In addition, smartphones give people access to information and services at any time.'],
      ['U', 'Users can read the news, book appointments, pay bills or contact emergency services within seconds, which saves time and can even save lives.'],
    ],
    body2: [
      ['T', 'Despite these advantages, mobile devices are not without their drawbacks.'],
      ['I', 'One major concern is that constant device use can reduce face-to-face contact and weaken concentration.'],
      ['S', 'Many people check their phones during meals or meetings, so they are physically present but mentally elsewhere.'],
      ['S', 'For instance, psychology studies have found that simply having a phone on the table during a conversation lowers the quality of the interaction and the closeness people feel.'],
      ['J', 'Additionally, excessive use can lead to a form of dependence, with some users feeling anxious whenever they are separated from their phones.'],
      ['U', 'However, these problems are largely a matter of self-control, and simple habits such as phone-free meals allow people to enjoy the benefits without letting devices dominate their lives.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although smartphones and tablets have reduced face-to-face contact and created a degree of dependence, they offer clear benefits such as instant, inexpensive communication and easy access to services.'],
      ['R', 'On balance, it can be argued that the advantages of this development outweigh its drawbacks.'],
      ['F', 'Nevertheless, sensible personal limits are essential to minimise its negative effects.'],
    ],
  },
  {
    id: '6a905d2031a29bc08f2e5a6f', type: 'advantages_disadvantages', topic: 'Wearable Health Technologies & AI Smart Devices',
    intro: [
      ['H', 'In recent years, smartwatches and health-tracking apps have become an increasingly popular feature of daily life, attracting considerable public attention.'],
      ['H', 'Millions of people now use these devices to monitor their heart rate, sleep and daily activity.'],
      ['P', 'Although there are valid concerns about privacy and anxiety, I believe the advantages of this trend outweigh the disadvantages.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of health-tracking devices is their ability to detect problems early.'],
      ['I', 'To begin with, modern smartwatches can identify warning signs that users would otherwise ignore, thereby allowing them to seek treatment sooner.'],
      ['S', 'Early diagnosis is crucial because conditions such as heart-rhythm disorders are far easier and cheaper to treat before they cause a stroke or heart failure.'],
      ['S', 'For example, a Stanford University study involving more than 400,000 Apple Watch users showed that the device could detect irregular heart rhythms that many participants had never known about.'],
      ['J', 'In addition, these devices can motivate people to adopt healthier habits.'],
      ['U', 'Daily step counts, sleep scores and reminders to stand up encourage ordinary users to exercise more and rest better, which in turn reduces the pressure on health services.'],
    ],
    body2: [
      ['T', 'Despite these benefits, health-tracking technology is not without its drawbacks.'],
      ['I', 'One major concern is the privacy of sensitive health data.'],
      ['S', 'Information about a person’s heart rate, sleep or location could be leaked, sold to advertisers or used by insurance companies, which raises serious ethical questions.'],
      ['J', 'Another potential drawback involves inaccurate readings, which might cause unnecessary anxiety.'],
      ['U', 'Doctors warn that some healthy users become obsessed with their numbers or try to diagnose themselves, while others may ignore real symptoms because their watch shows “normal” results.'],
      ['U', 'However, these risks can be reduced through stronger data-protection laws and clear advice that wearables are a guide rather than a medical diagnosis.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although health-tracking devices raise concerns about data privacy and excessive anxiety, they offer clear benefits such as the early detection of illness and the motivation to live more healthily.'],
      ['R', 'On balance, it can be argued that the advantages of this trend outweigh its drawbacks.'],
      ['F', 'Nevertheless, careful regulation and user education are essential to minimise its negative effects.'],
    ],
  },

  // ── Cause & Effect (type05) ────────────────────────────────────────────
  {
    id: '6a905d2131a29bc08f2e5a70', type: 'cause_effect', topic: 'High Rates of University Dropout',
    intro: [
      ['H', 'In today’s fast-changing world, the growing number of students who leave higher education before completing their degree has become an increasingly significant concern.'],
      ['H', 'In several countries, a substantial share of first-year students never reach graduation day.'],
      ['P', 'This essay will examine the main causes of this trend, chiefly financial hardship and poor course choice, and analyse its damaging effects on society.'],
    ],
    body1: [
      ['T', 'The causes of this trend are both complex and closely linked.'],
      ['I', 'One primary factor is financial hardship, which significantly contributes to students leaving early.'],
      ['S', 'Tuition and living costs have risen faster than family incomes in many countries, so a large share of students now take on paid work alongside a full-time course.'],
      ['S', 'For example, once a student’s working hours climb past fifteen or twenty a week, lectures are missed, reading is skipped and assignments are rushed, until catching up feels impossible.'],
      ['J', 'This trend can also be attributed to poor course choice.'],
      ['U', 'Many teenagers select a subject with little careers guidance, often to please their parents or to follow their friends.'],
      ['U', 'Those who realise a few months later that the course does not suit them tend to lose the motivation needed to push through the difficult years.'],
    ],
    body2: [
      ['T', 'The effects of this trend are felt both by individuals and by society as a whole.'],
      ['I', 'One significant consequence is that students are left with debt but no qualification.'],
      ['S', 'They have invested years of time and money without gaining the earning power that a degree usually brings, a setback that can hold back their career for a decade.'],
      ['J', 'Furthermore, this phenomenon inevitably leads to a waste of public resources and a shortage of skilled workers.'],
      ['U', 'Society has partly funded an education that produces no graduate, and it is left with unfilled vacancies in fields such as engineering and healthcare.'],
      ['U', 'Over time, these effects may accumulate, as employers compete for a smaller pool of qualified staff, which drives up costs, delays projects and slows economic growth.'],
    ],
    conclusion: [
      ['R', 'In conclusion, university dropout stems mainly from financial hardship and choosing the wrong course, and it has serious consequences for both individuals and society’s skilled workforce.'],
      ['F', 'Addressing this problem requires coordinated efforts from schools, universities and governments.'],
      ['F', 'If effective measures are taken, such as better careers guidance and more generous student grants, the negative impacts can be significantly reduced.'],
    ],
  },

  // ── Cause & Solution (type03) ──────────────────────────────────────────
  {
    id: '6a905d2431a29bc08f2e5a72', type: 'cause_solution', topic: 'Urban Sedentary Lifestyle',
    intro: [
      ['H', 'In recent years, the sedentary lifestyle of city-dwellers has become an increasingly serious problem in many parts of the world.'],
      ['H', 'According to the World Health Organization, almost one in three adults worldwide does not get enough physical activity, and the problem is especially common in large cities.'],
      ['P', 'This essay will explore the main causes of this problem and propose practical measures to encourage people to be more active.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to this inactive way of life.'],
      ['I', 'One of the main reasons is the nature of modern urban work, which can largely be attributed to the shift towards office-based jobs.'],
      ['S', 'Most city employees spend eight hours or more sitting at a desk, and after a long day they have little energy left for exercise.'],
      ['S', 'For instance, an office worker who drives to work, sits at a computer all day and then relaxes in front of the television may walk fewer than 3,000 steps a day.'],
      ['J', 'Another key contributor is a city environment that is unfriendly to walking and cycling.'],
      ['U', 'Unlike in the past, when people walked to local shops and workplaces, today many cities are designed around cars, with narrow pavements, heavy traffic and few parks.'],
      ['U', 'If this trend continues, rates of obesity, heart disease and diabetes will place ever greater pressure on health services.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to address this issue effectively.'],
      ['I', 'One effective way to tackle this problem is to redesign cities so that active travel becomes the easiest option.'],
      ['S', 'This would ensure that walking and cycling are safe and convenient, as the Netherlands has shown through decades of investment in a vast network of separated bike lanes.'],
      ['J', 'Another viable approach involves encouraging activity in the workplace.'],
      ['U', 'Employers can provide standing desks, short exercise breaks and subsidised gym membership, while the WHO target of 150 minutes of moderate activity a week gives people a clear and achievable goal.'],
      ['U', 'Not only would this improve workers’ health, but it would also raise productivity and reduce sick leave.'],
    ],
    conclusion: [
      ['R', 'In conclusion, urban inactivity remains a pressing issue caused mainly by desk-based work and car-centred city design.'],
      ['R', 'Among the various measures discussed, I believe that city planning which prioritises walking and cycling would be the most effective in the long term.'],
      ['F', 'If governments, employers and individuals work together, this issue can be significantly alleviated.'],
    ],
  },

  // ── Effect & Solution (type04) ─────────────────────────────────────────
  {
    id: '6a905d2531a29bc08f2e5a73', type: 'effect_solution', topic: 'Severe Traffic Congestion in Urban Areas',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the issue of traffic congestion in major cities.'],
      ['H', 'Worsening gridlock has resulted in longer journeys and higher levels of pollution, and if left unaddressed, it may lead to even more serious long-term problems.'],
      ['P', 'This essay will examine the major effects of this problem on urban residents and suggest practical solutions that governments can adopt.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of traffic congestion are the loss of time and the damage to residents’ health.'],
      ['I', 'To begin with, the time wasted in traffic is a major concern.'],
      ['S', 'This is largely because commuters who spend hours in slow-moving traffic every week have less time for work, family and rest, which raises stress levels and lowers productivity.'],
      ['S', 'For example, the traffic analytics firm INRIX estimated that the average driver in London lost around 99 hours to congestion in 2023.'],
      ['J', 'Another significant impact is the harm caused by air and noise pollution.'],
      ['U', 'Idling engines release exhaust fumes that are linked to asthma and heart disease, so people living or working near busy roads face a greater risk of illness.'],
      ['U', 'Over time, this can place considerable pressure on both health services and the urban economy, as businesses also lose money through late deliveries and wasted fuel.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to relieve traffic pressure.'],
      ['I', 'The most practical solution is to invest heavily in fast, frequent and affordable public transport.'],
      ['S', 'This approach would not only give commuters a real alternative to the car but also reduce emissions, since one full bus can replace dozens of private vehicles.'],
      ['J', 'Another promising strategy is to manage demand by charging drivers to enter the busiest areas.'],
      ['U', 'After London introduced a congestion charge in 2003, congestion inside the charging zone fell by around 30% in the first year, and the revenue was reinvested in buses.'],
      ['U', 'If implemented alongside flexible working hours, such measures could bring about long-term improvements in how people travel.'],
    ],
    conclusion: [
      ['R', 'In conclusion, traffic congestion continues to pose serious challenges, wasting residents’ time, harming their health and damaging the economy.'],
      ['R', 'In my opinion, tackling this problem requires both better public transport and congestion charging in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },
  {
    id: '6a905d2531a29bc08f2e5a74', type: 'effect_solution', topic: 'Overreliance on Private Motor Vehicles',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the issue of commuters’ heavy reliance on private cars and motorbikes.'],
      ['H', 'Although public transport is available in most cities, the majority of people still prefer to travel in their own vehicles, and this preference has resulted in a range of significant consequences.'],
      ['P', 'This essay will examine the major effects of this trend on the environment and society and suggest practical measures to promote public transport.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of this trend are rising pollution and growing pressure on urban space.'],
      ['I', 'To begin with, the environmental impact is a major concern.'],
      ['S', 'This is largely because each private vehicle usually carries only one or two people, so the emissions per passenger are far higher than those of a bus or a train.'],
      ['S', 'In the European Union, for example, transport produces around a quarter of all greenhouse-gas emissions, and road vehicles account for most of this.'],
      ['J', 'Another significant impact is the effect on city life.'],
      ['U', 'Millions of private vehicles cause chronic congestion and frequent accidents, while valuable land is given over to roads and car parks rather than parks or housing.'],
      ['U', 'Over time, this can place considerable pressure on public health, as people who drive everywhere are also less physically active.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to make public transport more attractive.'],
      ['I', 'The most practical solution is to upgrade buses and trains so that they are fast, affordable and reliable.'],
      ['S', 'This approach would not only persuade drivers to leave their cars at home but also cut pollution, as Vienna has shown: after it introduced an annual pass costing about one euro a day, pass holders came to outnumber the city’s registered cars.'],
      ['J', 'Another promising strategy is to make driving in city centres less convenient.'],
      ['U', 'Oslo, for instance, removed most on-street parking from its centre and replaced it with cycle lanes, benches and green space, which sharply reduced car use.'],
      ['U', 'If implemented on a large scale, such measures could bring about long-term improvements in air quality and quality of life.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the preference for private vehicles continues to pose serious challenges, causing pollution, congestion and inactive lifestyles.'],
      ['R', 'In my opinion, tackling this problem requires both high-quality public transport and firm restrictions on cars in central areas in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },
  {
    id: '6a905d2531a29bc08f2e5a75', type: 'effect_solution', topic: 'Rising Freight Transport by Heavy Trucks',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the issue of long-distance freight transport by heavy trucks.'],
      ['H', 'A large share of goods is still moved by road rather than by rail or water, and this reliance has resulted in a range of significant consequences.'],
      ['P', 'This essay will examine the major effects of this situation and suggest practical solutions to mitigate its impact.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of this reliance on road freight are high levels of pollution and serious damage to infrastructure.'],
      ['I', 'To begin with, the environmental impact of heavy trucks is a major concern.'],
      ['S', 'This is largely because a lorry produces far more carbon dioxide and fine particles per tonne of cargo than a train or a barge.'],
      ['S', 'For example, figures from the UK rail industry suggest that moving goods by rail produces around 76% less carbon dioxide than moving the same load by road.'],
      ['J', 'Another significant impact is the damage to roads and to road safety.'],
      ['U', 'Because road wear rises sharply with axle weight, a single heavy truck can cause thousands of times more damage to the surface than a car, forcing governments to spend heavily on repairs.'],
      ['U', 'Over time, this can place considerable pressure on public budgets, and the sheer size of these vehicles also makes motorway crashes especially serious.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to address this issue.'],
      ['I', 'The most practical solution is to shift long-distance freight back to rail and inland waterways.'],
      ['S', 'This approach would not only cut emissions but also ease congestion, as Switzerland has demonstrated: after it introduced a heavy-vehicle charge and invested in Alpine rail tunnels, around 70% of the freight crossing the Swiss Alps now travels by train.'],
      ['J', 'Another promising strategy is to make the remaining road freight cleaner and more efficient.'],
      ['U', 'Stricter emissions standards, incentives for electric trucks and well-planned logistics hubs that reduce empty or half-full journeys could all lower the environmental cost of transport.'],
      ['U', 'If implemented on a large scale, these measures could bring about long-term improvements.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the reliance on heavy trucks continues to pose serious challenges, including pollution, road damage and accidents.'],
      ['R', 'In my opinion, tackling this problem requires both a shift towards rail and water transport and stricter emissions standards in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },
  {
    id: '6a905d2531a29bc08f2e5a76', type: 'effect_solution', topic: 'Decline in Walking and Cycling Habits',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the issue of city residents using motor vehicles even for short daily journeys.'],
      ['H', 'Fewer people now walk or cycle to the shops, to school or to work, and this shift has resulted in a range of significant consequences.'],
      ['P', 'This essay will examine the major effects of this change and suggest how urban planners can encourage non-motorised travel.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of this shift are poorer public health and a more polluted urban environment.'],
      ['I', 'To begin with, the decline in physical activity is a major concern.'],
      ['S', 'This is largely because walking and cycling are the easiest ways to build exercise into daily life, so people who drive even short distances are more likely to become overweight.'],
      ['S', 'For example, a person who cycles a ten-minute journey to work and back each weekday already achieves around two thirds of the 150 minutes of weekly activity recommended by the WHO.'],
      ['J', 'Another significant impact is the increase in traffic.'],
      ['U', 'More cars on the road for short trips mean more air pollution, congestion and accidents, which in turn make walking and cycling feel even more dangerous.'],
      ['U', 'Over time, this can turn streets into places dominated by vehicles rather than people, weakening the sense of community in local neighbourhoods.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to make active travel attractive again.'],
      ['I', 'The most practical solution is to build safe, separated cycle lanes and wide pavements.'],
      ['S', 'This approach would not only protect cyclists and pedestrians but also make active travel the obvious choice, as Copenhagen has shown: after decades of investment, around half of all trips to work or school in the city are now made by bicycle.'],
      ['J', 'Another promising strategy is to give priority to people over cars in residential areas.'],
      ['U', 'Pedestrian zones, lower speed limits, “walk to school” schemes and public bike-share systems all make short journeys on foot or by bike easier and more enjoyable.'],
      ['U', 'If implemented on a large scale, these measures could bring about long-term improvements in both health and air quality.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the decline in walking and cycling continues to pose serious challenges, making people less healthy and urban transport more polluting.'],
      ['R', 'In my opinion, tackling this problem requires both safe infrastructure and pedestrian-friendly planning in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },

  // ── Agree or Disagree (type06) ─────────────────────────────────────────
  {
    id: '6a905d2531a29bc08f2e5a77', type: 'agree_disagree', topic: 'Shorter Work Week',
    intro: [
      ['H', 'The question of whether the working week should be shorter has become a subject of considerable debate in recent years.'],
      ['H', 'Some people believe that employees should work fewer days and enjoy a longer weekend.'],
      ['P', 'Although this would be difficult to apply in a few sectors, I largely agree with this idea, because the evidence suggests that shorter hours improve well-being without harming productivity.'],
    ],
    body1: [
      ['T', 'One compelling reason why the working week should be shorter is that it reduces burnout and improves workers’ health.'],
      ['I', 'It is widely recognised that long hours lead to chronic stress, poor sleep and a higher risk of illness.'],
      ['S', 'An extra day off gives employees time to rest, exercise and be with their families, so they return to work refreshed and more focused.'],
      ['S', 'For instance, large trials of shorter working weeks in Iceland between 2015 and 2019 found that employees reported far less stress and burnout, while productivity stayed the same or improved in most workplaces.'],
      ['J', 'Furthermore, a shorter week does not necessarily reduce output.'],
      ['U', 'In a 2022 trial in the United Kingdom, the vast majority of the 61 participating companies chose to keep the four-day week after it ended, which suggests that employers also saw clear benefits.'],
    ],
    body2: [
      ['T', 'While some may argue that a shorter week is impractical for many businesses, this perspective fails to recognise that it can be introduced flexibly.'],
      ['I', 'Admittedly, in sectors such as healthcare, emergency services and retail, cutting hours may require hiring extra staff, which raises costs.'],
      ['S', 'There is also a risk that the same workload is simply squeezed into fewer, more intense days, which could increase rather than reduce stress.'],
      ['J', 'However, these concerns call for careful, sector-by-sector implementation rather than rejecting the idea altogether.'],
      ['U', 'Rotating schedules, for example, allow hospitals and shops to stay open every day while each employee still enjoys a longer weekend.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I largely agree that the working week should be shorter, as it improves workers’ health and work-life balance without reducing productivity.'],
      ['F', 'Ultimately, striking a balance between employees’ well-being and the practical needs of each sector may represent the most pragmatic approach.'],
    ],
  },
  {
    id: '6a905d2631a29bc08f2e5a78', type: 'agree_disagree', topic: 'Remote Work as the Future',
    intro: [
      ['H', 'The future of the workplace has become a subject of considerable debate in recent years.'],
      ['H', 'Since the pandemic, many people have predicted that working from home will become the main way people work.'],
      ['P', 'While I agree that remote work will keep expanding in office-based fields, I do not believe it will become the dominant mode of work for most people.'],
    ],
    body1: [
      ['T', 'It is undeniable that there are strong reasons to expect remote work to grow further.'],
      ['I', 'Video-conferencing and cloud tools are now mature enough to allow many office tasks to be done from anywhere.'],
      ['S', 'For employers, this cuts the cost of office space and widens the talent pool, while employees save the time and money they would otherwise spend commuting.'],
      ['S', 'For instance, since the pandemic several large technology companies, including Spotify, have allowed staff to work remotely on a permanent basis.'],
      ['J', 'Furthermore, many workers now value flexibility almost as highly as salary.'],
      ['U', 'Surveys regularly show that a large proportion of office employees would consider changing jobs if they were forced to return to the office five days a week.'],
    ],
    body2: [
      ['T', 'However, the claim that working from home will become the main way people work fails to consider the nature of most jobs.'],
      ['I', 'The majority of the global workforce simply cannot work remotely.'],
      ['S', 'Factory workers, nurses, farmers, builders, drivers and shop assistants must be physically present, and these occupations make up most of the employment in the world.'],
      ['S', 'Indeed, the International Labour Organization has estimated that only around one in five jobs worldwide could realistically be done from home.'],
      ['J', 'Even in office work, a fully remote model has clear limitations.'],
      ['U', 'Many firms report that training new staff, sharing ideas and building team culture are harder at a distance, which is why most companies are moving towards a hybrid model rather than abandoning the office entirely.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I maintain that although remote work will become increasingly common in office-based sectors, it will not become the main way most people work.'],
      ['F', 'Ultimately, a hybrid model that combines the flexibility of home working with the benefits of face-to-face collaboration may represent the most pragmatic future.'],
    ],
  },
  {
    id: '6a905d2631a29bc08f2e5a79', type: 'agree_disagree', topic: 'Job Satisfaction vs. Salary',
    intro: [
      ['H', 'The question of what matters most in a career has become a subject of considerable debate in recent years.'],
      ['H', 'Some people argue that being satisfied with one’s work is more important than earning a high salary.'],
      ['P', 'While money certainly cannot be ignored, I agree that job satisfaction is ultimately more important.'],
    ],
    body1: [
      ['T', 'One compelling reason why job satisfaction matters more is that work occupies a large part of our lives for several decades.'],
      ['I', 'It is widely recognised that a tedious or stressful job, however well paid, can seriously damage a person’s mental and physical health.'],
      ['S', 'Someone who dreads going to work every morning is likely to suffer from chronic stress, poor sleep and even depression, and no salary can fully compensate for this.'],
      ['S', 'By contrast, people who find their work meaningful tend to be more productive and stay in their roles far longer, as workplace surveys by organisations such as Gallup have repeatedly shown.'],
      ['J', 'Furthermore, research suggests that money increases happiness only up to a certain point.'],
      ['U', 'A well-known study by the Nobel Prize-winning economists Daniel Kahneman and Angus Deaton found that, beyond a moderate income, extra earnings made little difference to people’s day-to-day emotional well-being.'],
    ],
    body2: [
      ['T', 'While some may argue that a high salary is essential for financial security, this view fails to recognise that it mainly applies below a certain income level.'],
      ['I', 'Admittedly, a low income can create serious stress, especially for people supporting children or elderly parents.'],
      ['S', 'For such workers, a well-paid but dull job may be the responsible choice, at least in the short term.'],
      ['J', 'However, once basic needs are met, the extra satisfaction gained from more money is limited, whereas an unfulfilling job continues to take its toll every day.'],
      ['U', 'This is why many people who leave high-paying corporate roles for careers in teaching, nursing or social work report feeling happier despite earning less.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I agree that job satisfaction is more important than a high salary, because it directly affects a person’s long-term mental health and quality of life.'],
      ['F', 'Ultimately, striking a balance between a fair income and meaningful work may represent the most sensible approach to choosing a career.'],
    ],
  },
  {
    id: '6a905d2631a29bc08f2e5a7a', type: 'agree_disagree', topic: 'Unenjoyable Employment vs. Unemployment',
    intro: [
      ['H', 'The question of whether people should stay in jobs they dislike has become a subject of considerable debate in recent years.'],
      ['H', 'Some people claim that it is better to be unemployed than to remain in a job that one does not enjoy.'],
      ['P', 'While I accept that a genuinely toxic workplace is an exception, I disagree with this view in most cases.'],
    ],
    body1: [
      ['T', 'The main reason to keep even an unsatisfying job is that work provides far more than a wage.'],
      ['I', 'It is widely recognised that employment supplies income, professional skills, social contact and a daily structure, all of which are lost during unemployment.'],
      ['S', 'Without a regular income, many people quickly fall into debt, and without a routine, they can lose confidence and motivation.'],
      ['S', 'For instance, research by the economist Andrew Clark and others has found that unemployment is one of the life events that lowers life satisfaction the most, and the damage often persists even after a new job is found.'],
      ['J', 'Furthermore, a gap in a person’s employment history can make the next job harder to find.'],
      ['U', 'Employers often view long periods without work with suspicion, so someone who leaves a job without a plan may end up in a worse position than before.'],
    ],
    body2: [
      ['T', 'That said, the argument for leaving has some force when a job is actively harmful.'],
      ['I', 'Admittedly, a workplace with an abusive manager, unsafe conditions or punishing hours can damage mental health as seriously as unemployment does.'],
      ['S', 'In such cases, staying may lead to burnout or illness, and a short, planned break to recover or retrain may be worthwhile.'],
      ['J', 'However, simply disliking a job is not, on its own, a good reason to become unemployed.'],
      ['U', 'A more sensible approach is to look for a new position while still employed, or to treat the job as a stepping stone by gaining skills that open up better opportunities.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I disagree that being unemployed is generally better than staying in an unenjoyable job, because the income, skills and structure that work provides usually matter more.'],
      ['F', 'Ultimately, leaving only when a job is genuinely harmful, and ideally with a plan in place, may represent the most pragmatic approach.'],
    ],
  },

  // ── Discuss Both Views (type02) ────────────────────────────────────────
  {
    id: '6a905d2731a29bc08f2e5a7e', type: 'discuss_both_views', topic: 'Economic Support: Higher Education vs. Vocational Training',
    intro: [
      ['H', 'In recent decades, the issue of how governments should fund education after school has attracted increasing public attention.'],
      ['H', 'While some people argue that more money should go to practical vocational training, others believe that university education should be the priority.'],
      ['P', 'This essay will discuss both views before explaining why I would give greater priority to vocational training.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people believe university education deserves the most funding.'],
      ['I', 'One major reason for this view is that universities drive research and innovation.'],
      ['S', 'This is largely because scientific discoveries, new technologies and highly skilled professionals mostly come from universities, so they are essential for a knowledge-based economy.'],
      ['S', 'For instance, countries with strong research universities, such as South Korea and Singapore, have attracted high-value industries like semiconductors and biotechnology.'],
      ['J', 'Furthermore, another important factor to consider is earnings.'],
      ['U', 'Graduates still tend to earn above-average salaries, which also means that they pay more tax over their lifetimes.'],
    ],
    body2: [
      ['T', 'On the other hand, supporters of vocational training argue that it tackles skills shortages more directly.'],
      ['I', 'One key concern is that many countries now produce more graduates than there are graduate-level jobs, while employers struggle to find electricians, plumbers and technicians.'],
      ['S', 'As a result, many young people leave university in debt and end up in jobs that do not require a degree.'],
      ['S', 'Germany’s “dual system”, by contrast, which combines classroom study with paid apprenticeships, is widely credited with keeping the country’s youth unemployment rate among the lowest in Europe.'],
      ['J', 'In addition, vocational courses are shorter and cheaper, and they suit students who are not drawn to academic study.'],
      ['U', 'This allows the same amount of public money to help a larger number of people into secure, well-paid work.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding education funding.'],
      ['R', 'Personally, I believe that governments should shift more resources towards vocational training because it addresses skills shortages directly and opens up stable careers for a wider range of people.'],
      ['F', 'Moving forward, policymakers should consider raising the status of apprenticeships so that they are seen as an equal alternative to a degree.'],
    ],
  },

  // ── Positive or Negative Development (type07) ──────────────────────────
  {
    id: '6a905d2831a29bc08f2e5a7f', type: 'positive_or_negative_development', topic: 'Rise in Eco-Tourism',
    intro: [
      ['H', 'In recent years, eco-tourism has emerged as one of the fastest-growing trends in the travel industry, sparking widespread debate.'],
      ['H', 'While it undoubtedly brings certain benefits, it also carries the potential for significant drawbacks.'],
      ['P', 'I firmly believe that, on balance, this constitutes a predominantly positive development for local communities and the environment.'],
    ],
    body1: [
      ['T', 'There are several compelling reasons to view eco-tourism as a positive development.'],
      ['I', 'One of the most notable aspects is that it links income directly to the protection of nature.'],
      ['S', 'This is primarily because, when forests, reefs and wildlife attract paying visitors, local people have a financial reason to protect them rather than log, hunt or overfish.'],
      ['S', 'To illustrate, Costa Rica built its tourism industry around its rainforests and national parks, and the country has roughly doubled its forest cover since the 1980s.'],
      ['J', 'Furthermore, the influence of eco-tourism extends well beyond conservation.'],
      ['U', 'It creates jobs for guides, hosts and craftspeople in remote communities, and visitors often return home with a greater understanding of environmental issues.'],
    ],
    body2: [
      ['T', 'Admittedly, eco-tourism is not without its shortcomings, and critics have raised legitimate concerns about overcrowding.'],
      ['I', 'One concern is that popularity can damage the very places tourists come to see.'],
      ['S', 'For instance, Maya Bay in Thailand had to be closed to visitors from 2018 to 2022 after thousands of tourists a day had severely damaged its coral reefs.'],
      ['J', 'Another issue is “greenwashing”, where ordinary tours are marketed as environmentally friendly.'],
      ['U', 'However, these concerns, while not entirely unfounded, can be effectively managed through visitor limits, certification schemes and rules that keep profits in local communities, as the reopening of Maya Bay with strict daily quotas has shown.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that eco-tourism is fundamentally a positive development.'],
      ['R', 'The evidence suggests that its benefits for conservation and local livelihoods far exceed its drawbacks.'],
      ['F', 'Going forward, it is essential that governments and tour operators manage visitor numbers carefully to maximise the gains and minimise the risks of this trend.'],
    ],
  },
  {
    id: '6a905d2831a29bc08f2e5a80', type: 'positive_or_negative_development', topic: 'Transition to Electric Vehicles',
    intro: [
      ['H', 'In recent years, the shift towards electric vehicles has emerged as one of the most significant trends in transport, sparking widespread debate.'],
      ['H', 'Many governments now offer tax breaks and subsidies to persuade drivers to switch from petrol and diesel cars.'],
      ['P', 'While this policy has some drawbacks, I firmly believe that, on balance, it is a predominantly positive development.'],
    ],
    body1: [
      ['T', 'There are several compelling reasons to view the promotion of electric vehicles as a positive development.'],
      ['I', 'One of the most notable aspects is that electric cars considerably reduce air pollution in cities.'],
      ['S', 'This is primarily because they produce no exhaust fumes at the point of use, which has a direct effect on the respiratory and heart diseases linked to traffic pollution.'],
      ['S', 'To illustrate, Norway’s generous tax incentives have pushed electric cars to more than 80% of new car sales, showing how quickly well-designed policies can transform a market.'],
      ['J', 'Furthermore, the influence of electric vehicles extends well beyond cleaner air.'],
      ['U', 'They reduce a country’s dependence on imported oil, and they are cheaper to run and maintain, saving households money over the life of the car.'],
    ],
    body2: [
      ['T', 'Admittedly, electric vehicles are not without their shortcomings, and critics have raised legitimate concerns about their environmental footprint.'],
      ['I', 'One concern is that mining lithium and cobalt for batteries can damage local ecosystems and communities.'],
      ['S', 'In addition, if the electricity grid still relies mainly on coal, the climate benefit of switching to electric cars is limited.'],
      ['J', 'Another issue is that high purchase prices and limited charging networks slow adoption in poorer countries.'],
      ['U', 'However, these concerns do not fundamentally alter the overall trajectory of this development, as grids are rapidly adding renewable power, battery recycling is improving and prices continue to fall.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that the promotion of electric vehicles is fundamentally a positive development.'],
      ['R', 'The evidence suggests that its benefits for air quality and energy security far exceed the drawbacks of battery production.'],
      ['F', 'Going forward, it is essential that governments combine electric-vehicle incentives with cleaner electricity and better public transport to maximise the gains of this trend.'],
    ],
  },

  // ── Advantages & Disadvantages (type01) ────────────────────────────────
  {
    id: '6a905d2931a29bc08f2e5a83', type: 'advantages_disadvantages', topic: 'Public vs. Private Healthcare',
    intro: [
      ['H', 'In recent years, the role of profit-making companies in healthcare has become an increasingly controversial feature of modern life, attracting considerable public attention.'],
      ['H', 'Some people argue that because good health is a basic human right, medical services should not be run for profit.'],
      ['P', 'Although private healthcare offers certain benefits, I believe its disadvantages outweigh its advantages.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of private healthcare is that it can shorten waiting times.'],
      ['I', 'To begin with, competition between private hospitals encourages them to treat patients quickly and provide a high standard of service.'],
      ['S', 'This is particularly valuable in countries where public hospitals are overcrowded and patients may wait months for routine operations.'],
      ['S', 'For example, many patients in the UK choose to pay for private treatment to avoid long waits for procedures such as hip replacements.'],
      ['J', 'In addition, private investment can bring extra funding, staff and modern technology into a health system.'],
      ['U', 'This takes some pressure off state hospitals and allows governments to focus their limited budgets on other priorities.'],
    ],
    body2: [
      ['T', 'Despite these advantages, a profit-driven healthcare system has serious drawbacks.'],
      ['I', 'One major concern is that it tends to put a patient’s ability to pay above their medical need.'],
      ['S', 'Poorer patients may delay treatment or receive worse care, while companies focus on profitable treatments rather than prevention, which earns them less money.'],
      ['S', 'For instance, the United States, where healthcare is largely private, spends roughly twice as much per person as the average rich country, yet its life expectancy is lower than that of most other developed nations.'],
      ['J', 'Additionally, private providers may choose to operate only in wealthy urban areas.'],
      ['U', 'As a result, rural and low-income communities can be left with too few clinics and doctors, which widens inequality in health.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although private healthcare offers clear benefits such as shorter waiting times and additional investment, it also entails serious disadvantages, including unequal access and a neglect of prevention.'],
      ['R', 'On balance, it can be argued that the drawbacks of profit-driven medicine outweigh its advantages.'],
      ['F', 'Nevertheless, careful regulation can allow private providers to support, rather than replace, a strong public health system.'],
    ],
  },

  // ── Positive or Negative Development (type07) ──────────────────────────
  {
    id: '6a905d2931a29bc08f2e5a84', type: 'positive_or_negative_development', topic: 'Consumerism and Society',
    intro: [
      ['H', 'In recent years, rising consumption has emerged as one of the most visible trends in contemporary society, sparking widespread debate.'],
      ['H', 'People around the world now buy far more clothes, electronics and household goods than previous generations did.'],
      ['P', 'While this trend undoubtedly brings certain economic benefits, I firmly believe that, on balance, it is a predominantly negative development.'],
    ],
    body1: [
      ['T', 'Admittedly, rising consumption is not without its benefits, and supporters point to its economic value.'],
      ['I', 'High consumer demand keeps economies growing and sustains millions of jobs in manufacturing, retail and transport.'],
      ['S', 'This is primarily because every purchase supports a long chain of businesses, from factories to delivery companies and shops.'],
      ['S', 'It also means that ordinary families can now afford goods such as smartphones and washing machines that were once luxuries.'],
      ['J', 'In addition, competition between companies drives innovation.'],
      ['U', 'Firms constantly develop better and more efficient products in order to attract customers, which can improve people’s quality of life.'],
    ],
    body2: [
      ['T', 'However, these benefits are clearly outweighed by the serious costs of overconsumption.'],
      ['I', 'One of the most notable problems is that it has considerably increased waste and the exploitation of natural resources.'],
      ['S', 'To illustrate, research by McKinsey found that the average consumer buys around 60% more clothing than fifteen years earlier but keeps each item for only about half as long.'],
      ['J', 'Furthermore, the influence of consumerism extends well beyond the environment.'],
      ['U', 'A culture of constant buying encourages household debt and a sense of dissatisfaction, as people measure their worth by comparing their possessions with those of others.'],
      ['U', 'When considered in a broader context, the negative aspects of this trend clearly outweigh its economic merits.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that rising consumption is fundamentally a negative development.'],
      ['R', 'The evidence suggests that its costs to the planet and to people’s well-being far exceed its economic benefits.'],
      ['F', 'Going forward, it is essential that governments and individuals encourage more sustainable habits, such as buying fewer but longer-lasting products.'],
    ],
  },

  // ── Cause & Solution (type03) ──────────────────────────────────────────
  {
    id: '6a905d2b31a29bc08f2e5a88', type: 'cause_solution', topic: 'Dịch Câu - Môi Trường & Khí Hậu',
    intro: [
      ['H', 'In recent years, rising pollution and climate change have become increasingly serious threats in many parts of the world.'],
      ['H', 'Heatwaves, floods and smog-filled cities now make regular headlines, and scientists warn that the situation will worsen without urgent action.'],
      ['P', 'This essay will explore the main causes of these problems and propose practical solutions to address them.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to pollution and climate change.'],
      ['I', 'One of the main reasons is the burning of fossil fuels, which can largely be attributed to our dependence on coal, oil and gas for electricity, transport and industry.'],
      ['S', 'When these fuels are burned, they release carbon dioxide that traps heat in the atmosphere, as well as harmful gases and particles that pollute the air.'],
      ['S', 'For instance, fossil fuels are responsible for roughly three quarters of global greenhouse-gas emissions.'],
      ['J', 'Another key contributor is deforestation.'],
      ['U', 'Unlike in the past, when vast forests absorbed much of the carbon dioxide we produced, today huge areas are cleared every year for farming, logging and mining.'],
      ['U', 'If this trend continues, the planet will lose one of its most important natural defences against global warming.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to address these problems effectively.'],
      ['I', 'One effective way to tackle this issue is to switch rapidly to renewable energy such as wind and solar power.'],
      ['S', 'This would ensure that electricity is generated without emissions, ultimately leading to cleaner air and a slower rise in global temperatures, especially now that the cost of solar power has fallen by around 90% since 2010.'],
      ['J', 'Another viable approach involves stronger international cooperation.'],
      ['U', 'Because pollution and greenhouse gases cross borders, no country can solve the problem alone, which is why the 2015 Paris Agreement, in which almost every nation pledged to limit global warming, was such an important step.'],
      ['U', 'Combined with large-scale reforestation and better public transport, such agreements could serve as a long-term solution.'],
    ],
    conclusion: [
      ['R', 'In conclusion, pollution and climate change remain pressing issues caused mainly by burning fossil fuels and clearing forests.'],
      ['R', 'Among the various measures discussed, I believe that a rapid shift to clean energy, supported by international cooperation, would be the most effective in the long term.'],
      ['F', 'If governments, businesses and individuals work together, these problems can be significantly alleviated.'],
    ],
  },
  // ── Advantages & Disadvantages (type01) ────────────────────────────────
  {
    id: '6a905d2c31a29bc08f2e5a89', type: 'advantages_disadvantages', topic: 'Dịch Câu - Công Nghệ & Truyền Thông',
    intro: [
      ['H', 'In recent years, rapid technological progress has become one of the defining features of modern life, attracting considerable public attention.'],
      ['H', 'From instant messaging to video conferencing and artificial intelligence, technology has transformed the way people communicate and work almost beyond recognition.'],
      ['P', 'This essay will examine both the advantages and disadvantages of this development.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of modern technology is that it connects people and widens access to knowledge.'],
      ['I', 'To begin with, digital tools enable people to communicate instantly across the world and to work from almost anywhere, thereby saving time and travel costs.'],
      ['S', 'A team spread across several countries can now hold meetings, share documents and complete projects together without ever meeting in person.'],
      ['S', 'For example, online platforms such as Khan Academy provide free lessons to millions of students, including many in places that lack good schools.'],
      ['J', 'In addition, automation and digital software have raised productivity in many industries.'],
      ['U', 'Tasks that once took hours, such as calculating accounts or sorting data, can now be completed in seconds, allowing workers to focus on more creative and valuable work.'],
    ],
    body2: [
      ['T', 'Despite these advantages, technological change is not without its drawbacks.'],
      ['I', 'One major concern is the rapid spread of misinformation and the decline in people’s ability to concentrate.'],
      ['S', 'A well-known MIT study found that false news spreads on social media around six times faster than true news, while heavy screen use has been linked to shorter attention spans.'],
      ['J', 'Another potential drawback involves job losses and inequality, which might leave some groups behind.'],
      ['U', 'Automation threatens routine jobs in factories and offices, and people without digital skills or reliable internet access risk being excluded from the opportunities that technology creates.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although modern technology offers clear benefits such as instant communication and wider access to knowledge, it also entails notable disadvantages, including misinformation and job insecurity.'],
      ['R', 'On balance, it can be argued that the advantages of this development outweigh its drawbacks.'],
      ['F', 'Nevertheless, careful regulation and investment in digital education are essential to minimise its negative effects.'],
    ],
  },

  // ── Cause & Effect (type05) ────────────────────────────────────────────
  {
    id: '6a905d2c31a29bc08f2e5a8a', type: 'cause_effect', topic: 'Dịch Câu - Giáo Dục & Thanh Niên',
    intro: [
      ['H', 'In today’s fast-changing world, the pressure on education systems to prepare students for modern challenges has become an increasingly significant concern.'],
      ['H', 'Schools are expected not only to deliver good exam results but also to equip young people with the skills needed for an uncertain job market.'],
      ['P', 'This essay will examine the underlying causes of this pressure and analyse its significant effects on students and society.'],
    ],
    body1: [
      ['T', 'The causes of this pressure are both complex and multifaceted.'],
      ['I', 'One primary factor is the heavy emphasis on exams and rankings, which significantly contributes to this issue.'],
      ['S', 'It is widely acknowledged that league tables and high-stakes tests push schools to focus narrowly on results, while families expect ever-higher qualifications in an intensely competitive job market.'],
      ['S', 'For example, in South Korea the national university entrance exam is considered so decisive that many students attend private academies late into the evening for years before taking it.'],
      ['J', 'This pressure can also be attributed to the rapid pace of technological change.'],
      ['U', 'Employers now demand digital, practical and critical-thinking skills, yet many curricula remain heavy on theory and slow to adapt.'],
      ['U', 'Not only does this force schools to add new subjects, but it also creates a ripple effect, as teachers must constantly retrain to keep up.'],
    ],
    body2: [
      ['T', 'The effects of this pressure are both immediate and long-term.'],
      ['I', 'One significant consequence is a decline in students’ mental health.'],
      ['S', 'Research has consistently shown that anxiety and burnout among teenagers rise when their futures depend on a few exams, and the Seoul authorities even imposed a 10 p.m. curfew on private academies to protect students’ sleep.'],
      ['J', 'Furthermore, this phenomenon inevitably leads to a mismatch between what schools teach and what society needs.'],
      ['U', 'Employers frequently complain that graduates can pass exams but lack teamwork, communication and problem-solving skills.'],
      ['U', 'Over time, these effects may accumulate, placing substantial pressure on businesses and slowing economic growth.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the pressure on education systems stems mainly from an exam-focused culture and fast-changing skill demands, and it results in stressed students and a gap between education and the job market.'],
      ['F', 'Addressing this problem requires coordinated efforts from both educators and policymakers.'],
      ['F', 'If effective measures are taken, such as reducing high-stakes testing and teaching more practical skills, the negative impacts can be significantly reduced.'],
    ],
  },

  // ── Effect & Solution (type04) ─────────────────────────────────────────
  {
    id: '6a905d2c31a29bc08f2e5a8b', type: 'effect_solution', topic: 'Dịch Câu - Sức Khỏe & Đô Thị Hóa',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the impact of rapid urbanisation on people’s health and well-being.'],
      ['H', 'The United Nations projects that around two thirds of the world’s population will live in cities by 2050, and this rapid growth has already resulted in a range of significant consequences.'],
      ['P', 'This essay will examine the major effects of this trend on city residents and suggest practical solutions that governments can implement.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of rapid urbanisation are polluted air and increasingly unhealthy lifestyles.'],
      ['I', 'To begin with, poor air quality is a major concern.'],
      ['S', 'This is largely because fast-growing cities attract more traffic, factories and construction, while green spaces that could clean the air are replaced by buildings.'],
      ['S', 'According to the World Health Organization, outdoor air pollution causes more than four million premature deaths every year, many of them in rapidly expanding cities in Asia and Africa.'],
      ['J', 'Another significant impact is the pressure that urban life places on physical and mental health.'],
      ['U', 'Overcrowded, expensive housing raises stress levels, and long commutes and desk-based jobs leave many residents with little time or space to exercise.'],
      ['U', 'Over time, this can place considerable pressure on health services, especially in poorer districts where clinics are already scarce.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to address this issue.'],
      ['I', 'The most practical solution is to require more green space and walkable streets in urban planning.'],
      ['S', 'This approach would not only improve air quality but also encourage physical activity, as Singapore has shown by weaving parks, tree-lined streets and park connectors throughout the city.'],
      ['J', 'Another promising strategy is to invest heavily in clean public transport.'],
      ['U', 'Fast and affordable metro and bus systems reduce the number of cars on the road, cutting pollution and congestion at the same time.'],
      ['U', 'If implemented on a large scale alongside better access to local clinics, this measure could bring about long-term improvements in public health.'],
    ],
    conclusion: [
      ['R', 'In conclusion, rapid urbanisation continues to pose serious challenges to health, mainly through air pollution and cramped, inactive lifestyles.'],
      ['R', 'In my opinion, tackling this problem requires both greener city planning and investment in public transport in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },

  // ── Agree or Disagree (type06) ─────────────────────────────────────────
  {
    id: '6a905d2c31a29bc08f2e5a8c', type: 'agree_disagree', topic: 'Dịch Câu - Kinh Tế & Toàn Cầu Hóa',
    intro: [
      ['H', 'The economic impact of globalisation has become a subject of considerable debate in recent years.'],
      ['H', 'While it has transformed economies around the world, many people argue that its effects are not always positive.'],
      ['P', 'Although I recognise that globalisation has brought remarkable benefits, I largely agree with this view.'],
    ],
    body1: [
      ['T', 'It is undeniable that globalisation has driven impressive economic progress in many parts of the world.'],
      ['I', 'Freer trade and foreign investment have created millions of jobs and transferred technology to developing countries.'],
      ['S', 'This can be attributed to the fact that companies moved production to places with lower costs, bringing factories, training and income to regions that were previously very poor.'],
      ['S', 'For instance, since joining the World Trade Organization in 2001, China has become the world’s largest exporter, and hundreds of millions of its citizens have escaped poverty.'],
      ['J', 'Furthermore, consumers everywhere now enjoy a far wider range of affordable goods.'],
      ['U', 'Products such as smartphones and clothing are cheaper because they are made through efficient global supply chains.'],
    ],
    body2: [
      ['T', 'However, the benefits of globalisation have been very unevenly shared.'],
      ['I', 'One key concern is that many workers in developed countries have lost their jobs as factories moved abroad.'],
      ['S', 'Economists have estimated that competition from Chinese imports cost the United States around two million manufacturing jobs in the 2000s, leaving some industrial towns in long-term decline.'],
      ['J', 'In addition, rapid industrialisation has caused severe pollution in producing countries, and global brands can erode distinctive local cultures.'],
      ['U', 'Admittedly, these problems do not cancel out the gains; nevertheless, they show clearly that the effects of globalisation are far from universally positive.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined the arguments presented, I largely agree that the effects of globalisation are not always positive, because alongside reducing poverty it has widened inequality, caused pollution and threatened local cultures.'],
      ['F', 'Ultimately, striking a balance between open trade and protection for workers and the environment may represent the most pragmatic approach.'],
    ],
  },

  // ── Advantages & Disadvantages (type01) ────────────────────────────────
  {
    id: '6a99b1875b413cfafa699784', type: 'advantages_disadvantages', topic: 'Influence of Social Media',
    intro: [
      ['H', 'In recent years, social media has become an increasingly central feature of modern life, attracting considerable public attention.'],
      ['H', 'Billions of people now use it both to keep in touch with others and to follow the news.'],
      ['P', 'Although it offers speed and openness, I believe that, as a source of news, its drawbacks outweigh its benefits.'],
    ],
    body1: [
      ['T', 'One of the most significant advantages of social media is that news spreads instantly and from many perspectives.'],
      ['I', 'To begin with, ordinary users can report events as they happen, thereby holding governments and companies to account.'],
      ['S', 'This is particularly valuable in places where traditional media are tightly controlled or slow to react.'],
      ['S', 'For example, after the 2023 earthquakes in Turkey and Syria, survivors trapped under rubble used social media to share their locations, helping rescue teams to find them.'],
      ['J', 'In addition, social media makes it easy to stay connected with friends and family.'],
      ['U', 'Users can share news about their lives, join communities with similar interests and organise support during a crisis at almost no cost.'],
    ],
    body2: [
      ['T', 'Despite these advantages, social media has serious drawbacks as a source of news.'],
      ['I', 'One major concern is that the same openness allows misinformation to spread very quickly.'],
      ['S', 'A well-known MIT study of millions of Twitter posts found that false stories reached people around six times faster than true ones, largely because they are more surprising and emotional.'],
      ['J', 'Additionally, algorithms that show users only what they already agree with can create “echo chambers”, thereby pushing people towards more extreme views.'],
      ['U', 'Heavy use is also linked to anxiety and constant social comparison, particularly among teenagers.'],
      ['U', 'For news in particular, these harms are serious enough to outweigh the convenience.'],
    ],
    conclusion: [
      ['R', 'In conclusion, although social media offers clear benefits such as fast access to news and easy communication, it also entails notable disadvantages, including misinformation and harm to mental health.'],
      ['R', 'On balance, it can be argued that, as a source of news, its drawbacks outweigh its benefits.'],
      ['F', 'Nevertheless, better media literacy and careful regulation are essential to minimise its negative effects.'],
    ],
  },

  // ── Cause & Effect (type05) ────────────────────────────────────────────
  {
    id: '6a99b1875b413cfafa699785', type: 'cause_effect', topic: 'Decline in STEM Course Enrolments',
    intro: [
      ['H', 'In today’s technology-driven world, the shortage of students choosing science subjects at university has become an increasingly worrying concern.'],
      ['H', 'Although scientists and engineers are vital to economic progress, many capable students now prefer subjects such as business or law.'],
      ['P', 'This essay will examine the main reasons for this trend and analyse its significant effects on society.'],
    ],
    body1: [
      ['T', 'The causes of this trend are both complex and deeply rooted in schooling.'],
      ['I', 'One primary factor is the way science is taught before university, which makes the subject seem dull and extremely difficult.'],
      ['S', 'In many schools, physics and chemistry are presented as abstract formulae to be memorised for exams, often by non-specialist teachers and without proper laboratory equipment.'],
      ['S', 'For example, a student who has never carried out a real experiment may never discover how exciting scientific discovery can be.'],
      ['J', 'This trend can also be attributed to the perceived career payoff.'],
      ['U', 'Teenagers rarely meet working engineers or researchers, so they cannot picture the jobs a science degree leads to, whereas careers in business and law appear to offer a clearer path to a comfortable salary.'],
    ],
    body2: [
      ['T', 'The effects of this trend are both immediate and long-term.'],
      ['I', 'One significant consequence is a growing shortage of skilled workers.'],
      ['S', 'As fewer home-grown graduates enter engineering and computing, technology firms are forced to recruit specialists from abroad or move their research centres overseas, both of which raise costs and weaken local expertise.'],
      ['S', 'Germany and South Korea, for instance, have repeatedly warned that a lack of engineers is holding back their manufacturing industries.'],
      ['J', 'Furthermore, this phenomenon inevitably slows innovation.'],
      ['U', 'New industries, from renewable energy to medical technology, depend on a steady supply of scientists, so a country that cannot train enough of them gradually loses ground to its competitors.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the decline in science enrolments stems mainly from uninspiring teaching and unclear career prospects, and it results in skills shortages and slower innovation.'],
      ['F', 'Addressing this problem requires coordinated efforts from schools, universities and employers.'],
      ['F', 'If effective measures are taken, such as more practical science lessons and classroom visits from working scientists, the negative impacts can be significantly reduced.'],
    ],
  },

  // ── Discuss Both Views (type02) ────────────────────────────────────────
  {
    id: '6a99b1895b413cfafa699786', type: 'discuss_both_views', topic: 'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes',
    intro: [
      ['H', 'In recent decades, the issue of how governments can encourage healthier eating has attracted increasing public attention.'],
      ['H', 'While some people argue that subsidising fruit and vegetables is the best way to make healthy food affordable, others believe that taxing junk food would be more effective.'],
      ['P', 'This essay will discuss both views before explaining why I believe taxation is the stronger option.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people support subsidies for fresh produce.'],
      ['I', 'One major reason for this view is that healthy eating is often a matter of cost.'],
      ['S', 'This is largely because fruit and vegetables can be expensive compared with processed snacks, especially for low-income families who must stretch a limited budget.'],
      ['S', 'For instance, a voucher scheme trialled in the United States, which gave low-income households extra money to spend on fresh produce, led them to eat noticeably more fruit and vegetables.'],
      ['J', 'Furthermore, another important factor to consider is that subsidies are a positive, non-punitive measure.'],
      ['U', 'Rather than punishing consumers, they reward healthy choices, and they also support local farmers by increasing demand for their crops.'],
    ],
    body2: [
      ['T', 'On the other hand, supporters of taxation argue that raising the price of unhealthy food is more effective.'],
      ['I', 'One key concern is that subsidies do nothing to discourage the consumption of junk food, which is the real cause of the problem.'],
      ['S', 'A tax, by contrast, changes behaviour directly, and real-world evidence supports this: after Mexico taxed sugary drinks in 2014, purchases fell by around 7% over two years, with the largest falls among the poorest households.'],
      ['J', 'In addition, a tax generates revenue rather than costing the state money.'],
      ['U', 'This income can be spent on health programmes or even on subsidising fresh produce, so the two approaches can work together.'],
      ['U', 'Critics claim that such taxes hit the poor hardest; however, this can be offset by investing the money in health services in disadvantaged areas.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding how to make diets healthier.'],
      ['R', 'Personally, I believe that taxing junk food is the more effective strategy because it reduces harmful consumption while raising funds for public health.'],
      ['F', 'Moving forward, governments should consider using this revenue to make fresh food cheaper, so that both approaches reinforce each other.'],
    ],
  },
  {
    id: '6a99b1895b413cfafa699787', type: 'discuss_both_views', topic: 'Funding Priorities: Free Public Libraries vs. Internet Infrastructure',
    intro: [
      ['H', 'In recent decades, the future of public libraries has attracted increasing public attention.'],
      ['H', 'While some people believe that the government should provide a free library in every town, others think this is a waste of money now that information is available online.'],
      ['P', 'This essay will discuss both views before explaining why I believe libraries still deserve public funding.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people regard library funding as unnecessary.'],
      ['I', 'One major reason for this view is that the internet has made much of a library’s traditional role redundant.'],
      ['S', 'This is largely because almost any fact, article or e-book can now be accessed instantly from a smartphone, often free of charge.'],
      ['S', 'As a result, fewer people visit libraries simply to borrow books, and many branches have seen visitor numbers fall.'],
      ['J', 'Furthermore, another important factor to consider is the pressure on public budgets.'],
      ['U', 'With limited money for hospitals, schools and transport, critics argue that funds would be better spent on expanding broadband access, especially in rural areas.'],
    ],
    body2: [
      ['T', 'On the other hand, supporters argue that modern libraries offer far more than access to information.'],
      ['I', 'One key concern is that not everyone can benefit equally from the internet.'],
      ['S', 'Elderly people, low-income families and jobseekers often rely on libraries for free computers, a quiet place to study and staff who can help them find reliable information.'],
      ['S', 'Helsinki’s central library, Oodi, for example, attracts millions of visitors a year with workshops, recording studios and meeting rooms, which shows that a library can be a lively community hub.'],
      ['J', 'In addition, the internet cannot replace the guidance that librarians provide.'],
      ['U', 'At a time when misinformation spreads easily online, trained staff who teach people how to evaluate sources are more valuable than ever.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding public libraries.'],
      ['R', 'Personally, I believe that governments should continue to fund free libraries because they provide space, guidance and community services that an internet connection alone cannot replace.'],
      ['F', 'Moving forward, libraries should consider expanding their digital services so that they complement, rather than compete with, the internet.'],
    ],
  },
  {
    id: '6a99b1895b413cfafa699788', type: 'discuss_both_views', topic: 'National Fitness Funding: Elite Athletes vs. Grassroots Sports',
    intro: [
      ['H', 'In recent decades, the issue of how governments should invest in sport has attracted increasing public attention.'],
      ['H', 'While some people argue that money should be spent on training top athletes for events such as the Olympic Games, others believe it is better to build facilities that ordinary people can use.'],
      ['P', 'This essay will discuss both views before explaining why I believe community facilities should come first.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people support funding for elite athletes.'],
      ['I', 'One major reason for this view is that international success brings national pride.'],
      ['S', 'This is largely because Olympic medals and world championships unite citizens and raise a country’s profile on the global stage.'],
      ['S', 'For instance, after a large increase in funding for elite sport, Great Britain rose to third place in the medal table at the London 2012 Olympics.'],
      ['J', 'Furthermore, another important factor to consider is the “inspiration effect”.'],
      ['U', 'Successful athletes can encourage children to take up sport, and major sporting events attract tourism and sponsorship.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that elite funding benefits only a small number of people.'],
      ['I', 'One key concern is that the inspiration effect is weaker than many expect.'],
      ['S', 'In the UK, despite the medal success of 2012, the share of adults who exercised regularly barely changed in the years that followed.'],
      ['J', 'In contrast, community facilities such as local pools, pitches and gyms benefit the whole population directly.'],
      ['U', 'When people of all ages can exercise cheaply near their homes, rates of obesity and heart disease fall, which reduces the long-term burden on health services.'],
      ['U', 'This highlights that grassroots sport offers far greater value for limited public money.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both sides offer valid arguments regarding sports funding.'],
      ['R', 'Personally, I believe that investing in community facilities is the wiser choice because it improves the health of millions of people rather than a handful of athletes.'],
      ['F', 'Moving forward, governments should consider directing most of their sports budget towards affordable local facilities while maintaining modest support for elite programmes.'],
    ],
  },
  // ── Positive or Negative Development (type07) ──────────────────────────
  {
    id: '6a99b18a5b413cfafa699789', type: 'positive_or_negative_development', topic: 'Growth of Renewable Energy Infrastructure',
    intro: [
      ['H', 'In recent years, the growing reliance on renewable energy has emerged as one of the most important trends in the global energy sector, sparking widespread debate.'],
      ['H', 'Although fossil fuels still supply most of the world’s energy, many countries are now investing heavily in wind and solar power.'],
      ['P', 'While this transition brings certain challenges, I firmly believe that, on balance, it is a predominantly positive development.'],
    ],
    body1: [
      ['T', 'There are several compelling reasons to view the shift towards renewable energy as a positive development.'],
      ['I', 'One of the most notable aspects is that wind and solar power have considerably reduced greenhouse-gas emissions and air pollution.'],
      ['S', 'This is primarily because they generate electricity without burning fuel, which has a profound effect on both the climate and the quality of the air people breathe.'],
      ['S', 'To illustrate, in 2023 renewable sources generated more of the European Union’s electricity than fossil fuels for the first time.'],
      ['J', 'Furthermore, the influence of renewables extends well beyond the environment, strengthening national energy security.'],
      ['U', 'Countries that produce their own power are less exposed to sudden rises in global oil and gas prices, such as those that followed the outbreak of war in Ukraine in 2022.'],
      ['U', 'The sector also creates many new jobs in manufacturing, installation and maintenance.'],
    ],
    body2: [
      ['T', 'Admittedly, renewable energy is not without its shortcomings, and critics have raised legitimate concerns about its reliability and cost.'],
      ['I', 'One concern is that wind and solar output varies with the weather, so without large-scale storage there is a risk of power shortages.'],
      ['S', 'In addition, building wind farms, solar parks and new grid connections requires heavy initial investment.'],
      ['J', 'However, these concerns, while not entirely unfounded, do not fundamentally alter the overall trajectory of this development.'],
      ['U', 'Battery technology is improving rapidly, and the cost of solar power has fallen by around 90% since 2010, making renewables one of the cheapest sources of new electricity in many countries.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that the growing use of renewable energy is fundamentally a positive development.'],
      ['R', 'The evidence suggests that its environmental and economic advantages far exceed the challenges of reliability and cost.'],
      ['F', 'Going forward, it is essential that governments invest in energy storage and modern grids to maximise the gains and minimise the risks of this transition.'],
    ],
  },
  {
    id: '6a99b18a5b413cfafa69978a', type: 'positive_or_negative_development', topic: 'Conversion of Urban Spaces to Local Community Gardens',
    intro: [
      ['H', 'In recent years, the conversion of urban parks and open spaces into community gardens has emerged as an increasingly popular trend, sparking widespread debate.'],
      ['H', 'In many cities, local residents can now look after small plots to grow their own fruit and vegetables.'],
      ['P', 'While this development carries some drawbacks, I firmly believe that, on balance, it is a predominantly positive one.'],
    ],
    body1: [
      ['T', 'There are several compelling reasons to view community gardens as a positive development.'],
      ['I', 'One of the most notable aspects is that they improve access to fresh, healthy food.'],
      ['S', 'This is primarily because residents who grow their own produce tend to eat more vegetables and spend less on food, which is particularly valuable in low-income neighbourhoods.'],
      ['S', 'To illustrate, in Detroit more than a thousand vacant lots have been turned into community gardens and urban farms, supplying fresh food to areas that previously had few grocery shops.'],
      ['J', 'Furthermore, the influence of these gardens extends well beyond food.'],
      ['U', 'They bring neighbours of different ages and backgrounds together around a shared project, reducing loneliness and teaching children where their food comes from.'],
      ['U', 'The extra greenery also cools the city in summer and absorbs rainwater, helping to reduce flooding.'],
    ],
    body2: [
      ['T', 'Admittedly, community gardens are not without their shortcomings, and critics have raised legitimate concerns about the use of scarce urban land.'],
      ['I', 'One concern is that space in cities is limited and could instead be used for badly needed housing.'],
      ['S', 'In addition, a garden may fall into neglect if too few residents are willing to maintain it, leaving an untidy and unused plot.'],
      ['J', 'However, these concerns, while not entirely unfounded, do not fundamentally alter the overall value of this trend.'],
      ['U', 'Most community gardens occupy small, otherwise idle plots and can be run on flexible leases, so the land can still be developed later if necessary, while the social and environmental benefits are immediate.'],
    ],
    conclusion: [
      ['R', 'In conclusion, having examined this issue from multiple angles, I maintain that turning unused urban spaces into community gardens is fundamentally a positive development.'],
      ['R', 'The evidence suggests that its benefits for health, community life and the environment far exceed the loss of a modest amount of building land.'],
      ['F', 'Going forward, it is essential that local authorities support residents with training and secure leases to maximise the gains of this trend.'],
    ],
  },

  // ── Discuss Both Views (type02) ────────────────────────────────────────
  {
    id: '6a99b18a5b413cfafa69978b', type: 'discuss_both_views', topic: 'Government Funding for the Arts',
    intro: [
      ['H', 'In recent decades, the question of how governments should divide their budgets has attracted increasing public attention.'],
      ['H', 'While some people support large public spending on the arts, others believe the money should be spent on healthcare and education instead.'],
      ['P', 'This essay will discuss both views before explaining why I believe a reasonable level of arts funding is still justified.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people believe the money should go to healthcare and education.'],
      ['I', 'One major reason for this view is that these services meet more urgent human needs.'],
      ['S', 'This is largely because hospitals and schools directly affect people’s survival and life chances, whereas the arts are often seen as a luxury.'],
      ['S', 'For instance, in a country where patients wait months for surgery and classrooms are overcrowded, spending millions on a new opera house can be difficult to justify.'],
      ['J', 'Furthermore, another important factor to consider is that the arts can raise money from other sources.'],
      ['U', 'Theatres, galleries and orchestras can earn income from ticket sales, private sponsors and donations, so they are less dependent on public funds than hospitals or schools.'],
    ],
    body2: [
      ['T', 'On the other hand, supporters argue that the arts bring benefits that the market alone will not provide.'],
      ['I', 'One key argument is that the arts preserve a nation’s cultural heritage for future generations.'],
      ['S', 'Without public support, traditional music, crafts and historic theatres may disappear because they cannot compete commercially with mass entertainment.'],
      ['J', 'In addition, cultural investment can regenerate entire regions.'],
      ['U', 'After the Guggenheim Museum opened in Bilbao in 1997, the declining industrial city began attracting around a million visitors a year, an effect now known as the “Bilbao effect”.'],
      ['U', 'This shows that well-chosen arts projects can create jobs and tax revenue that, in turn, help to fund other public services.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding government spending on the arts.'],
      ['R', 'Personally, I believe that while healthcare and education must remain the priority, governments should still fund the arts at a reasonable level because they preserve cultural identity and can bring significant economic benefits.'],
      ['F', 'Moving forward, policymakers should consider supporting arts projects that also serve education, such as school visits to museums and theatres.'],
    ],
  },

  // ── Cause & Solution (type03) ──────────────────────────────────────────
  {
    id: '6a99b18a5b413cfafa69978c', type: 'cause_solution', topic: 'Youth Crime and Solutions',
    intro: [
      ['H', 'In recent years, rising youth crime has become an increasingly serious problem in many countries.'],
      ['H', 'More children and teenagers are being drawn into offences ranging from theft and vandalism to violent crime.'],
      ['P', 'This essay will explore the main causes of this problem and propose how young offenders should be dealt with.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to the rise in youth crime.'],
      ['I', 'One of the main reasons is social and economic disadvantage, which can largely be attributed to poverty and family breakdown.'],
      ['S', 'Young people who grow up without stable support, safe activities or hope of a decent job have little to lose and are more vulnerable to being recruited by gangs.'],
      ['S', 'For instance, studies in many cities show that youth crime rates are consistently highest in neighbourhoods with high unemployment and few youth services.'],
      ['J', 'Another key contributor is the influence of negative role models, both online and offline.'],
      ['U', 'Unlike in the past, when young people were influenced mainly by their families and schools, today many are exposed to violent content and gang culture on social media.'],
      ['U', 'If this trend continues, more teenagers may come to see crime as normal or even glamorous.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to deal with young offenders effectively.'],
      ['I', 'One effective way to tackle this problem is to focus punishment on rehabilitation rather than imprisonment.'],
      ['S', 'This would ensure that young people stay connected to school, work and family through community service, supervision and counselling, ultimately reducing the chance that they reoffend.'],
      ['J', 'Another viable approach involves investing in prevention.'],
      ['U', 'Scotland, for example, treated knife crime as a public-health problem, funding mentoring, youth work and early support for at-risk families, and Glasgow’s murder rate fell by around half over the following decade.'],
      ['U', 'Prison should therefore be reserved for the most serious and violent cases.'],
    ],
    conclusion: [
      ['R', 'In conclusion, youth crime remains a pressing issue that is caused mainly by poverty, a lack of opportunity and negative role models.'],
      ['R', 'Among the various measures discussed, I believe that combining prevention programmes with rehabilitative punishment would be the most effective in the long term.'],
      ['F', 'If governments, schools and families work together, this issue can be significantly alleviated.'],
    ],
  },

  // ── Discuss Both Views (type02) ────────────────────────────────────────
  {
    id: '6a99b18a5b413cfafa69978d', type: 'discuss_both_views', topic: 'Prison vs. Rehabilitation',
    intro: [
      ['H', 'In recent decades, the issue of how to punish people who break the law has attracted increasing public attention.'],
      ['H', 'While some people argue that all offenders should be sent to prison, others believe that there are better alternatives, such as community service, for those who commit minor crimes.'],
      ['P', 'This essay will discuss both views before explaining why I believe prison should be reserved for serious offenders.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people believe that every offender should be imprisoned.'],
      ['I', 'One major reason for this view is that prison deters crime and protects the public.'],
      ['S', 'This is largely because the threat of losing one’s freedom discourages potential offenders, while dangerous criminals are physically removed from society.'],
      ['S', 'It also reassures victims that wrongdoing has real consequences, which helps to maintain public trust in the justice system.'],
      ['J', 'Furthermore, another important factor to consider is fairness.'],
      ['U', 'Supporters argue that a single, firm punishment for all crimes sends a clear message that the law applies equally to everyone.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that imprisoning minor offenders is costly and often counterproductive.'],
      ['I', 'One key concern is that short prison sentences can turn first-time offenders into career criminals.'],
      ['S', 'Inside prison, they may lose their jobs and homes and mix with more experienced criminals, which makes it harder for them to return to a normal life.'],
      ['S', 'By contrast, Norway, whose system focuses on rehabilitation and alternatives to custody, has one of the lowest reoffending rates in the world, with only around one in five former prisoners reoffending within two years.'],
      ['J', 'In addition, alternatives such as community service are far cheaper than keeping someone in prison.'],
      ['U', 'They also allow offenders to repair the harm they have caused, for example by cleaning up public spaces, while continuing to support their families.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding the punishment of offenders.'],
      ['R', 'Personally, I believe that prison is necessary for dangerous criminals, but that community service and similar alternatives are more effective for minor crimes because they cost less and reduce reoffending.'],
      ['F', 'Moving forward, governments should consider expanding these alternatives so that prisons can focus on those who genuinely threaten public safety.'],
    ],
  },
  {
    id: '6a99b45bdd3216114012771f', type: 'discuss_both_views', topic: 'Individual vs. Government Responsibility',
    intro: [
      ['H', 'In recent decades, the question of who is responsible for protecting the environment has attracted increasing public attention.'],
      ['H', 'While some people argue that individuals cannot do anything to improve the environment, others believe that personal actions can make a real difference.'],
      ['P', 'This essay will discuss both views before explaining why I believe individual action does matter.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people believe that individuals are powerless to protect the environment.'],
      ['I', 'One major reason for this view is that most pollution comes from sources that a single person cannot control.'],
      ['S', 'This is largely because energy production, heavy industry and large-scale agriculture are responsible for the vast majority of greenhouse-gas emissions.'],
      ['S', 'For instance, a widely cited 2017 report found that just 100 fossil-fuel producers were linked to around 70% of global industrial emissions since 1988.'],
      ['J', 'Furthermore, another important factor to consider is that individual efforts are easily cancelled out.'],
      ['U', 'Without government regulation and large-scale investment, one household recycling or switching off lights makes a negligible difference, which can leave people feeling that their efforts are pointless.'],
    ],
    body2: [
      ['T', 'On the other hand, supporters argue that individual choices still count in two important ways.'],
      ['I', 'One key point is that millions of small actions add up to a significant impact.'],
      ['S', 'When large numbers of households install solar panels, use public transport or eat less meat, the combined demand pushes whole markets towards cleaner options.'],
      ['S', 'Germany, for example, has millions of rooftop solar systems installed by ordinary homeowners and businesses, which together make a substantial contribution to the country’s electricity supply.'],
      ['J', 'In addition, people who change their own behaviour are more likely to demand change from others.'],
      ['U', 'They tend to vote for greener policies and put pressure on companies, so individual and government action reinforce rather than replace each other.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding responsibility for the environment.'],
      ['R', 'Personally, I believe that although a single person’s actions are small, they matter because millions of choices combined both cut emissions and create the political pressure that forces governments and businesses to act.'],
      ['F', 'Moving forward, governments should consider making green choices cheaper and easier so that more individuals are able to contribute.'],
    ],
  },
  {
    id: '6a99b45bdd32161140127740', type: 'discuss_both_views', topic: 'Car-Free Days vs. Alternative Solutions',
    intro: [
      ['H', 'In recent decades, the issue of air pollution in cities has attracted increasing public attention.'],
      ['H', 'While some people believe that international car-free days are an effective way to reduce pollution, others think there are better ways to tackle the problem.'],
      ['P', 'This essay will discuss both views before explaining why I favour long-term structural measures.'],
    ],
    body1: [
      ['T', 'There are several convincing reasons why some people support car-free days.'],
      ['I', 'One major reason for this view is that they raise public awareness in a memorable way.'],
      ['S', 'For one day, residents experience quieter, cleaner streets and see that a city can function without private cars, which can build support for lasting change.'],
      ['S', 'For instance, during Paris’s first car-free day in 2015, levels of nitrogen dioxide in parts of the city fell by up to 40%.'],
      ['J', 'Furthermore, another important factor to consider is that such events are cheap and simple to organise.'],
      ['U', 'Bogotá’s weekly “Ciclovía”, when major roads are closed to cars every Sunday, attracts over a million cyclists and walkers and has helped to change attitudes towards cycling.'],
    ],
    body2: [
      ['T', 'On the other hand, critics argue that a single day has only a symbolic, short-lived effect on pollution.'],
      ['I', 'One key concern is that traffic simply returns to normal the following day, so the overall reduction in emissions across a year is tiny.'],
      ['S', 'Lasting improvements require changes to how people travel every day.'],
      ['S', 'London’s congestion charge and Ultra Low Emission Zone, for example, have reduced traffic and harmful emissions all year round, far more than any one-day event could.'],
      ['J', 'In addition, investment in reliable public transport and protected cycle lanes gives people a permanent alternative to the car.'],
      ['U', 'Tighter vehicle-emission standards would further ensure that the cars which remain on the road pollute much less.'],
    ],
    conclusion: [
      ['R', 'In conclusion, both perspectives offer valid arguments regarding car-free days.'],
      ['R', 'Personally, I believe that although such events are useful for raising awareness, long-term measures such as better public transport and congestion charging are what genuinely reduce air pollution.'],
      ['F', 'Moving forward, cities should consider using car-free days as a way to build public support for these permanent policies.'],
    ],
  },

  // ── Cause & Solution (type03) ──────────────────────────────────────────
  {
    id: '6a99b45cdd32161140127759', type: 'cause_solution', topic: 'Lack of Fluency in Foreign Languages',
    intro: [
      ['H', 'In recent years, the inability of many graduates to speak foreign languages fluently has become an increasingly serious concern.'],
      ['H', 'Despite studying a language such as English for many years at school, a large number of students still struggle to hold a simple conversation.'],
      ['P', 'This essay will explore the main causes of this problem and propose practical solutions to improve language education.'],
    ],
    body1: [
      ['T', 'There are several underlying factors contributing to this situation.'],
      ['I', 'One of the main reasons is the way languages are taught, which can largely be attributed to exam-focused teaching methods.'],
      ['S', 'In many schools, large classes and written tests mean that lessons concentrate on grammar rules, vocabulary lists and translation rather than on speaking and listening.'],
      ['S', 'For instance, a student may be able to complete complex grammar exercises perfectly yet freeze when asked a simple question by a native speaker.'],
      ['J', 'Another key contributor is the lack of opportunities to use the language in real life.'],
      ['U', 'Unlike learners who live in an English-speaking environment, most students only hear the language for a few hours a week in class, and many are too afraid of making mistakes to speak at all.'],
      ['U', 'If this situation continues, years of study will keep producing learners who understand the rules but cannot communicate.'],
    ],
    body2: [
      ['T', 'Nevertheless, several practical measures can be taken to address this issue effectively.'],
      ['I', 'One effective way to tackle this problem is to adopt a communicative approach to teaching.'],
      ['S', 'This would ensure that students spend most of their lesson time speaking and listening in pairs and groups, ultimately building the confidence and fluency they need.'],
      ['J', 'Another viable approach involves increasing students’ exposure to authentic language outside the classroom.'],
      ['U', 'The Netherlands and the Nordic countries, where foreign films and television are subtitled rather than dubbed, consistently rank among the most proficient non-native English speakers in the world.'],
      ['U', 'Not only would films, podcasts and language exchanges make learning more enjoyable, but speaking-based assessment would also encourage schools to value real communication.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the lack of fluency after years of study remains a pressing issue caused mainly by grammar-focused teaching and too few chances to practise.'],
      ['R', 'Among the various measures discussed, I believe that a communicative teaching approach combined with greater exposure to authentic language would be the most effective in the long term.'],
      ['F', 'If schools, teachers and learners work together, this issue can be significantly alleviated.'],
    ],
  },

  // ── Effect & Solution (type04) ─────────────────────────────────────────
  {
    id: '6a99b45cdd32161140127772', type: 'effect_solution', topic: 'Lack of Practical Life Skills',
    intro: [
      ['H', 'In recent years, increasing attention has been paid to the issue of young people leaving education without basic life skills.'],
      ['H', 'Many graduates are unable to manage a budget, cook a simple meal or handle everyday household tasks, and this gap has resulted in a range of significant consequences.'],
      ['P', 'This essay will examine the major effects of this problem on individuals and society and suggest practical solutions to address it.'],
    ],
    body1: [
      ['T', 'Two particularly alarming effects of this problem are financial difficulties and poor health.'],
      ['I', 'To begin with, a lack of money-management skills is a major concern.'],
      ['S', 'This is largely because young people who cannot budget or understand interest rates are more likely to overspend, use credit cards carelessly and fall into debt.'],
      ['S', 'For example, surveys in the UK and the United States have found that many school-leavers cannot draw up a simple monthly budget or explain how compound interest works.'],
      ['J', 'Another significant impact is the effect on diet and health.'],
      ['U', 'Those who cannot cook tend to rely on expensive takeaways and processed food, which increases the risk of obesity and diet-related illness.'],
      ['U', 'Over time, this can place considerable pressure on society, as the costs of personal debt and poor health are eventually borne by welfare and healthcare systems.'],
    ],
    body2: [
      ['T', 'Despite these challenges, several effective measures can be taken to address this issue.'],
      ['I', 'The most practical solution is to make life skills a compulsory part of the school curriculum.'],
      ['S', 'This approach would not only give every student hands-on experience, through projects such as planning a class budget or cooking a week of meals, but also reach children whose parents cannot teach these skills at home.'],
      ['S', 'Research from the United States suggests that students in states which require personal-finance education go on to have better credit scores and fewer missed payments.'],
      ['J', 'Another promising strategy is to involve parents more actively.'],
      ['U', 'Giving children household chores and small financial responsibilities, such as managing their own pocket money, helps them develop independence long before they leave home.'],
    ],
    conclusion: [
      ['R', 'In conclusion, the lack of practical life skills continues to pose serious challenges, leaving many young people in debt and in poor health.'],
      ['R', 'In my opinion, tackling this problem requires both compulsory life-skills education at school and greater responsibility at home in order to achieve sustainable progress.'],
      ['F', 'While the effects are undeniable, they can be mitigated through coordinated efforts.'],
    ],
  },
];
