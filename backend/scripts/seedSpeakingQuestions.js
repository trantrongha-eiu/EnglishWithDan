/**
 * Seed script for SpeakingQuestion collection
 * Source: "BỘ DỰ ĐOÁN ĐỀ THI IELTS SPEAKING QUÝ 2 (THÁNG 5 - THÁNG 8) NĂM 2026" (NGOCBACH)
 * Part 1: 2 compulsory-frame topics + 32 specific topics (2-11 questions each)
 * Part 2/3: 24 cue-card topics, each with a cue card + 4-9 Part 3 follow-up questions
 * Run: node backend/scripts/seedSpeakingQuestions.js
 */

const part1Groups = [
  // ── Compulsory frames ──
  { topic: "Where you live now", questions: [
    "Which town or city do you live in now?",
    "Are there any things you don't like about your area?",
    "Do you think you will continue to live there for a long time?",
    "What are some changes in the area recently?",
    "Do you live in a house or an apartment?",
    "What is your favourite room in your home?",
    "What things make your home pleasant to live in?",
    "Are the people in your neighbourhood nice and friendly?",
    "Do you know any of your neighbours?",
    "Do you know any famous people in your area?"
  ]},
  { topic: "Work / Study", questions: [
    "What kind of work do you do?",
    "What do you find most interesting about your work?",
    "Which is more important to you – the people you work with or the work you do?",
    "Do you work best in the morning or the afternoon?",
    "What do you study?",
    "What do you find most interesting about your studies?",
    "Which is more important to you – the teachers or the other students on your course?",
    "How much time do you spend studying every week?",
    "How do you usually travel to the city where you study?",
    "Do you study best in the morning or the afternoon?",
    "Have you always wanted to study this subject / these subjects?"
  ]},
  // ── Specific topics ──
  { topic: "Food", questions: [
    "What was your favourite food when you were a child?",
    "Has the kind of food you like changed as you've got older?",
    "Do you eat different food at different times of the year?",
    "Do you like to eat with others?",
    "In your country, is it very important to eat with other people?"
  ]},
  { topic: "Pets and animals", questions: [
    "Did you want to have a pet when you were a child?",
    "Would you like to have pets in the future?",
    "Where do you prefer to keep your pet, indoors or outdoors?",
    "Do you see many birds and animals where you live?",
    "Have you ever been to a zoo?",
    "What kind of animals is famous in your country?"
  ]},
  { topic: "Typing", questions: [
    "How often do you type on a keyboard?",
    "Did you learn how to type at school when you were younger?",
    "When did you learn how to type on a keyboard?",
    "Which do you find easier: typing on a keyboard or writing by hand?",
    "Do you like to improve your typing skills?"
  ]},
  { topic: "Stage of life", questions: [
    "Are you satisfied with your age now?",
    "What did you enjoy most about your childhood?",
    "What's the most important thing you've done so far?",
    "At what age do you think people enjoy their lives most?",
    "What do you want to do five years later?"
  ]},
  { topic: "Long walk", questions: [
    "Did you go for long walks when you were a child?",
    "How often do you walk to the shops now?",
    "Are there many parks near where you live?",
    "Do people enjoy walking in parks in your country?",
    "Where would you want to go for a long walk if you have a chance?"
  ]},
  { topic: "Reading carefully", questions: [
    "What kinds of things do you have to read carefully in your language?",
    "Do you like to read things carefully or quickly in daily life?",
    "Do you read things more carefully on paper or on a screen?",
    "Why do you think some people don't read messages very carefully?"
  ]},
  { topic: "Morning Routine", questions: [
    "Do you get up early in the morning?",
    "Did you get up early in the morning when you were younger?",
    "What do you do every morning?",
    "What's your favourite morning of the week?"
  ]},
  { topic: "Gifts", questions: [
    "What kinds of gifts do you like to receive?",
    "What kinds of gifts did you like when you were younger?",
    "Have you received any gifts recently?",
    "Do you enjoy giving people gifts?",
    "Do you think buying gifts online is a good idea?"
  ]},
  { topic: "Team sport", questions: [
    "Have you ever played a sport in a team?",
    "Is your sport team famous?",
    "Are team sports popular in your country?",
    "Would you like to try a new team sport in the future?",
    "Do you enjoy watching team sports?"
  ]},
  { topic: "Building", questions: [
    "What is the tallest building in your city?",
    "Are there many tall buildings where you live?",
    "Have you ever taken a photo of a building?",
    "What kind of building would you like to live in?",
    "Is there a famous building that you would like to have a visit?"
  ]},
  { topic: "Travelling", questions: [
    "When you're travelling, do you usually look at the view?",
    "Did you ever travel to a faraway place when you were a child?",
    "Do you prefer to look at mountain views or ocean views?",
    "When you see a beautiful view, do you like to take a photo of it?",
    "Would you like to hang a beautiful view picture on the wall at home?"
  ]},
  { topic: "Free time activities", questions: [
    "What's your favourite free-time activity when you were a child?",
    "What activities do you enjoy doing in your free time now?",
    "Do you prefer to do free-time activities alone or with other people?",
    "Is there an activity you would like to try in the future?"
  ]},
  { topic: "Memory", questions: [
    "Do you think it easy to remember people's names?",
    "Do you remember things easily when you're studying or working?",
    "Would you like to have a better memory?",
    "Have you forgotten something that was very important?"
  ]},
  { topic: "Singing", questions: [
    "Did you like singing when you were a child?",
    "Do you like singing now?",
    "Will you sing in the car?",
    "Do you like listening to other people sing?",
    "How well did you sing?",
    "Did you take music lessons?"
  ]},
  { topic: "Music", questions: [
    "Do you like music?",
    "What kinds of music do you listen to?",
    "Do you prefer sad or happy music?",
    "Does happy music make you feel more excited?",
    "Is it easy to learn music?",
    "Do you learn music lessons at school?"
  ]},
  { topic: "Watch", questions: [
    "Do you wear a watch in your daily life?",
    "What kind of watch do you have?",
    "Has anyone ever given you a watch as a gift?",
    "What kind of watch do the people around you like to wear?"
  ]},
  { topic: "Parks and Gardens", questions: [
    "What kind of parks and gardens did you like when you were a child?",
    "Do you enjoy visiting parks and gardens now?",
    "Do you think there should be more parks and gardens in your city?",
    "Is there a famous park or garden that you want to visit?",
    "Was there a park near your home that you liked to go to when you were a child?",
    "What did you do there?"
  ]},
  { topic: "Tidiness", questions: [
    "Were you a tidy person when you were a child?",
    "Are you a tidy person now?",
    "What do you think of those who don't care about tidiness?",
    "What do you think of untidy people?",
    "What do you think of people who are overly tidy?"
  ]},
  { topic: "Headphones", questions: [
    "How often do you wear headphones?",
    "Do you think headphones are useful?",
    "Are headphones popular in your country?",
    "In what situations should people not wear headphones?"
  ]},
  { topic: "Websites", questions: [
    "Do you usually use websites?",
    "Which website do you usually use?",
    "Do you prefer to search for information through websites or books?",
    "Do you want to create your own website in the future?"
  ]},
  { topic: "Telling Jokes", questions: [
    "Do you like to tell jokes?",
    "Do you often joke with your friends?",
    "Do you have friends who love telling jokes?",
    "What are some common comedy shows in your country?",
    "Do you like being joked about?"
  ]},
  { topic: "Science", questions: [
    "Did you study science when you were at primary/elementary school?",
    "Do you think everyone should study science at school?",
    "How does knowing about science help you in your everyday life?",
    "Did you learn much about science at school?",
    "How do you learn about science in daily life?"
  ]},
  { topic: "Teachers", questions: [
    "Do you have a favorite teacher?",
    "Which teacher do you prefer, the one from primary school or the one from junior high school?",
    "Do you still keep in touch with your former teachers?",
    "Is it easy to remember your teachers in elementary school?",
    "Did you want to be a teacher when you were young?",
    "Do you think teachers are different now than when your parents were at school?"
  ]},
  { topic: "Social Media", questions: [
    "Do your friends and family use social media?",
    "Do you think people in your country find social media useful?",
    "Do you spend too much time on social media?",
    "When did you start using social media?"
  ]},
  { topic: "Cars", questions: [
    "Would you like to be the driver or the passenger?",
    "Is there a lot of cars on the roads in your city?",
    "Do you want to own a very expensive car?"
  ]},
  { topic: "Clothes", questions: [
    "What kind of clothes do you like to wear?",
    "Do you wear different clothes on the weekend?"
  ]},
  { topic: "Shoes", questions: [
    { question: "How often do you buy shoes?", sampleAnswer:
      "Honestly, I don't buy shoes very often. I usually only purchase new ones when my old pair wears out completely. I tend to invest in quality over quantity, so I'd rather buy one good pair that lasts a long time than several cheap ones. I probably buy new shoes two or three times a year at most, and usually during sales when I can get better value." },
    { question: "Have you ever bought shoes online?", sampleAnswer:
      "Yes, I have, a few times. I've found it quite convenient because you can compare prices easily and there's a much wider selection than in physical stores. However, I do prefer buying shoes in person when possible, simply because I like to try them on before committing. I've made the mistake of ordering online and getting a pair that didn't fit properly, which was frustrating." },
    { question: "Do you prefer shoes that are comfortable or good-looking?", sampleAnswer:
      "Personally, I prioritise comfort over appearance when it comes to shoes. I walk quite a lot throughout the day, so if my shoes are uncomfortable, it genuinely affects my mood and productivity. That said, I don't want to look scruffy either, so I try to find shoes that strike a good balance — comfortable enough for all-day wear but still reasonably stylish." },
    { question: "Do most people in your country prefer comfortable or good-looking shoes?", sampleAnswer:
      "I think it depends a lot on age and lifestyle. Younger people, especially in urban areas, tend to care more about appearance and follow the latest sneaker trends. Older people generally value comfort more. But overall, I'd say sneakers have become the default choice for most people my age because they manage to satisfy both criteria quite well." },
    { question: "What is your favourite type of shoes?", sampleAnswer:
      "Without a doubt, my favourite type is sneakers. They're incredibly versatile — I can wear them with jeans, shorts, or even smart-casual outfits. They're also comfortable enough for long days out. I've been wearing the same brand for years now and I genuinely think there's no better all-purpose shoe for someone with an active daily routine." }
  ]},
  { topic: "Shopping", questions: [
    "Do you often go shopping?",
    "Do you prefer online or offline shopping?",
    "Do you compare prices before making a purchase?"
  ]},
  { topic: "Weekends", questions: [
    { question: "Do you like quiet or noisy places?", sampleAnswer:
      "Personally, I much prefer quiet places. I find that I think more clearly and feel less stressed when my environment is calm. After a long day at school or work, the last thing I want is to be in a loud, crowded place. I usually gravitate towards parks, libraries, or quiet cafés where I can decompress without feeling overstimulated. That said, I do enjoy a lively atmosphere occasionally, like at a live music event or a family gathering." },
    { question: "Would you go to quiet or noisy places on weekends?", sampleAnswer:
      "On weekends, I almost always choose quiet places. The week is usually so busy and stimulating that by the time the weekend arrives, I really crave some peace. I might go for a walk in a park, visit a quiet café, or just stay at home and read. I find that having this quiet downtime makes me much more productive and positive at the start of the next week." },
    { question: "Are there any quiet places near where you live?", sampleAnswer:
      "Yes, fortunately there are. There's a small park about ten minutes from my house that I visit quite regularly. Even though the surrounding area is fairly busy, the park itself has a lovely calm atmosphere — you can hear birds and feel a gentle breeze, which is a nice contrast to the traffic noise outside. There's also a local library nearby that's a great place to study in complete silence." }
  ]},
  { topic: "Space Travel", questions: [
    "Have you ever learnt anything about space and the stars when you were at school?",
    "Would you like to know more about space and the stars?",
    "Do you like science-fiction movies set in space?",
    "Do you want to go into outer space in the future?"
  ]},
  { topic: "Feeling bored", questions: [
    "Do you often feel bored?",
    "Did you ever find school boring when you were a child?",
    "What sort of things do you find most boring now?",
    "What do you do to stop yourself feeling bored?"
  ]},
  { topic: "Dream and ambition", questions: [
    "When you were a child, what job did you dream of doing?",
    "Do you think you are an ambitious person?",
    "What kind of job do you want to do in the future?",
    "Do you have any dreams or hopes for your life?"
  ]},
  { topic: "Talking to elderly people", questions: [
    "Do you often talk to elderly people?",
    "Do you enjoy spending time with elderly people?",
    "How do you feel about getting old?"
  ]},
  { topic: "Mirrors", questions: [
    "Do you like looking at yourself in the mirror? How often?",
    "Have you ever bought mirrors?",
    "Do you usually take a mirror with you?",
    "Would you use mirrors to decorate your room?"
  ]}
];

const part2Sets = [
  { topic: "Proud of a family member", title: "Describe a time when you felt very proud of something a family member did", bullets: [
      "Who the family member was", "What he/she did", "Where and when this happened",
      "And explain why you felt so proud of what your family member did"
    ], part3: [
      "What kinds of behaviors of young children can make their parents feel proud?",
      "Why do giving academic prizes or rewards help promote children's progress?",
      "Do you think it is good for parents to give children too many prizes or rewards?",
      "Does any job bring people a sense of pride?",
      "Have the things that people are proud of changed compared to the past?",
      "When do adults feel proud of themselves?"
    ]},
  { topic: "Not allowed to use your phone", title: "Describe a time when you were not allowed to use your phone", bullets: [
      "Where you were", "Why you couldn't use it", "And explain how you felt about it"
    ], part3: [
      "In your country, which places are not allowed people to use phones?",
      "Do you think it is important to introduce new rules for using mobile phones?",
      "Why do young and old people use mobile phones differently?",
      "When should parents allow their children to have mobile phones?",
      "Do you agree that the social rules in the past were stricter than those of today?",
      "Is it quite prevalent that people are addicted to mobile phones?"
    ]},
  { topic: "A perfect future job", title: "Describe a perfect job you would like to have in the future", bullets: [
      "What the job is", "How you knew it", "What skills you need for this job",
      "And explain why it would be the perfect job for you"
    ], part3: [
      "What types of jobs do children usually want to do?",
      "What are the dream jobs of people in your country?",
      "Why do some jobs attract more people than others?",
      "Why do people choose the job they mentioned as their dream job?",
      "Why do people change their dream jobs as they grow older?"
    ]},
  { topic: "People smiling", title: "Describe an occasion you remember when you saw a lot of people smiling", bullets: [
      "Where you were and when it happened", "Who you were with", "What happened",
      "And explain why you remember this occasion when people smiled"
    ], part3: [
      "Why do people smile?",
      "Do children tend to smile more frequently than adults?",
      "Why do people usually smile when taking photos?",
      "Do elderly older people have better control over their feelings compared to young people?",
      "When is it important for people not to show their emotions?",
      "Do you agree or disagree that people might be motivated more by their emotions than by logical thinking?",
      "Is it a good thing for people to be driven by emotions?"
    ]},
  { topic: "A famous person to meet", title: "Describe a famous person who you would like to meet", bullets: [
      "Who he/she is and what he/she does", "What he/she is famous for", "How long this person has been famous",
      "And explain why you would like to meet this famous person"
    ], part3: [
      "What kinds of famous people are often in the news in your country?",
      "Why do children want to become famous?",
      "Are there more celebrities in the news now?",
      "Do you agree that everyone enjoys reading news about celebrities?",
      "Do people like these packaged celebrities or those with genuine talent?",
      "Is it possible for people to become famous without talent?",
      "Would people still want to become famous if they knew what they are going to face?"
    ]},
  { topic: "A person who likes helping others", title: "Describe a person you know who enjoys helping other people", bullets: [
      "Who this person is", "What this person does to help others", "How often this person helps others",
      "And explain why you think this person likes to help other people"
    ], part3: [
      "What kinds of machines do people usually use at home to help them?",
      "What is your opinion on whether parents should teach their children to help with housework?",
      "How can children help their parents at home?",
      "Do you agree that it's important for everyone in a family to help at home?",
      "Should students do community service? Why?",
      "What kinds of help do people need when they start a new job?",
      "Is it necessary for employees to ask their manager for help?",
      "Do you agree or disagree that many people will lose their jobs because of AI?"
    ]},
  { topic: "An app or software you use", title: "Describe an app or software you often use on your phone or computer", bullets: [
      "What it is", "How long you have used it", "How you use it",
      "And explain how you feel about it"
    ], part3: [
      "What kinds of programs or apps are popular in your country?",
      "Why do some people not like to use programs or apps?",
      "What are the differences between the kinds of apps and programs young people and old people use?",
      "Is it necessary for parents to limit the time their children spend on apps or computer programs?",
      "What are the benefits of using apps as a tool for education?"
    ]},
  { topic: "A movie you enjoyed", title: "Describe a movie you enjoyed watching", bullets: [
      "Where and when you saw it", "Who you saw the movie with", "What the movie was about",
      "And explain why you enjoyed watching this movie"
    ], part3: [
      "In your country, what kinds of movies do people like to watch?",
      "Do people like to watch movies at home or in the cinema?",
      "Why don't some people enjoy watching movies?",
      "What qualities do people need to be good actors?",
      "Which is more important for an actor, acting skills or appearance?",
      "Do you agree or disagree that being an actor is a difficult job?",
      "How important are famous actors to the success of a movie?"
    ]},
  { topic: "Using your imagination", title: "Describe a time you needed to use your imagination", bullets: [
      "What you needed to do", "Why you had to use your imagination", "Was it easy or difficult to do this",
      "And explain how you felt about it"
    ], part3: [
      "What kinds of games do children need to use imagination to play?",
      "Is it very important for teachers to encourage children to use their imagination?",
      "Do you think reading stories needs more imagination or watching cartoons?",
      "What are some jobs that require a good imagination?",
      "Do scientists need to use their imagination?"
    ]},
  { topic: "An interesting trip", title: "Describe a car, motorbike or bicycle trip that you think would be interesting", bullets: [
      "Where you want to go", "Who you want to go with", "How easy or difficult the trip would be",
      "And explain why you think using a car, motorbike or bicycle for this trip would be interesting"
    ], part3: [
      "Are bicycles and motorbikes popular in your country?",
      "Which form of vehicle is more popular in your country, bikes, cars or motorcycles?",
      "What is the best thing about public transport in the area you live?",
      "Do you agree that more and more people want to buy cars these days?",
      "How do people travel today in cities and in the countryside?",
      "Do city planners consider the needs of pedestrians enough?",
      "What impact can an inadequate transport or transportation system have on a country?"
    ]},
  { topic: "A quiet place", title: "Describe a place you enjoyed visiting that was very quiet", bullets: [
      "When you went there", "Where this place is and why you wanted to visit it", "What you will do when you go there",
      "And explain why you enjoyed visiting this place"
    ], part3: [
      "In your country, what quiet places do people like to go?",
      "Why do some people don't like quiet places?",
      "Are there more or fewer quiet places now than in the past?",
      "Can a place ever be completely quiet?",
      "Can people listen to music while doing something else?",
      "What are the benefits of quietness for people of all ages?",
      "Do you agree or disagree that people today feel uncomfortable if there is no noise?"
    ]},
  { topic: "Learning without a teacher", title: "Describe a person who learned something new without a teacher", bullets: [
      "Who he/she is and how you know him/her", "What he/she learned", "Is it easy to learn this skill",
      "And explain how you feel about him/her"
    ], part3: [
      "What can children learn from parents?",
      "What subjects do children often enjoy studying at school?",
      "Do you agree or disagree that children have to study too many subjects at school?",
      "Do you think some children are well-behaved because they are influenced by their parents?",
      "Does a good teacher make learning more interesting?",
      "What are the benefits for adults of returning to studying after leaving full-time education?",
      "Might it ever be a good idea for retired people to go back to full-time education?",
      "Do you agree that companies should provide regular training courses for their employees?"
    ]},
  { topic: "Good at planning", title: "Describe a person who you think is good at planning things", bullets: [
      "Who he/she is and how you know him/her", "What does this person usually plan", "What this person does to plan things",
      "And explain why you think this person is good at planning things"
    ], part3: [
      "What types of plans do people often make with friends and family?",
      "Is it important for people to plan special events, such as weddings?",
      "Why don't some people like to plan their social life in advance?",
      "What are the advantages for young people of planning their future careers?",
      "Should young people ask for advice about career planning, for example from teachers or family?",
      "Do you agree or disagree that it is only possible to have a successful career if it has been carefully planned?"
    ]},
  { topic: "A child who likes painting/drawing", title: "Describe a child you know who enjoys painting or drawing", bullets: [
      "Who he/she is and how you know him/her", "What kinds of things this child paints or draws", "How often this child paints or draws",
      "And explain why you think this child likes painting or drawing"
    ], part3: [
      "At what age do children usually start to paint and draw?",
      "Should children have art lessons or classes at school?",
      "Why do children often paint and draw more than adults do?",
      "Why do many people enjoy going to galleries and museums to see art?",
      "Should entry to galleries and museums be free for everyone?",
      "Do you agree or disagree that when people look at art in galleries or museums, they can learn a lot about life in general?"
    ]},
  { topic: "A shopping place", title: "Describe a shopping place you often go to", bullets: [
      "Where it is", "How often you go there", "What you usually buy there",
      "And explain why you think this place you go to is so good for shopping"
    ], part3: [
      "What places do people like to go shopping in your country?",
      "Has shopping become a hobby for many people?",
      "Do you agree or disagree that most people waste too much time shopping?",
      "Do you agree or disagree that people often buy things that they don't really need?",
      "Does buying things really make people happy?",
      "How much influence does advertising have when people are buying things?"
    ]},
  { topic: "Working abroad for a short time", title: "Describe a place in another country where you would like to work for a short time", bullets: [
      "Where it is", "How you know about it", "What you would like to do there",
      "And explain why you want to work there for a short period of time"
    ], part3: [
      "What jobs can people do in another country for a short time?",
      "Why might some people not want to work in another country?",
      "What are the advantages of working for an international company?",
      "What personal skills do people need in order to work for an international company?",
      "Do you agree or disagree that practical experience is more useful than qualifications when working in an international company?"
    ]},
  { topic: "Giving advice", title: "Describe a time you gave advice to someone", bullets: [
      "When and who you gave the advice to", "What the advice was", "Why you gave it",
      "And explain how this person felt about the advice you gave"
    ], part3: [
      "When is it better to ask friends for advice rather than family?",
      "Why do older people sometimes ask younger people for advice?",
      "What problems can someone have when they ask lots of different people for advice?",
      "In what situations is it important to think carefully before giving advice to someone?",
      "What kinds of personal qualities do people need to give good advice?",
      "Do you agree or disagree that anyone can learn how to give advice effectively?"
    ]},
  { topic: "Future technology you want", title: "Describe a piece of technology you would like to own in the future", bullets: [
      "What it is", "How you knew about it", "What you would use it for",
      "And explain why you would like to own it"
    ], part3: [
      "What are the different types of technology that young people often use?",
      "Do you agree or disagree that technology has a positive effect on young people's lives?",
      "How healthy is it for young people to spend a lot of time online?",
      "What are the differences between talking to people online and talking to them face to face?"
    ]},
  { topic: "Music you didn't like at an event", title: "Describe an event you took part in but it had some music that you didn't like", bullets: [
      "What it was", "When it was", "Who you went with",
      "And explain why you didn't like its music"
    ], part3: [
      "What kinds of music events are popular in your country?",
      "What do people enjoy about going to large music events?",
      "Why might younger and older people not enjoy the same music events?",
      "Should children have music lessons or classes at school?",
      "Why is music often played when people are doing physical exercise?",
      "Do you agree or disagree that playing music in shops or stores is an effective way of selling more products?"
    ]},
  { topic: "A TV/online programme you enjoy", title: "Describe a TV or online programme that you enjoy watching", bullets: [
      "What it is about", "How often you watch it", "Which country the programme comes from",
      "And explain why you enjoy watching this TV or online programme"
    ], part3: [
      "What types of TV or online programmes or shows are popular in your country?",
      "Do younger and older people enjoy watching similar programmes or shows?",
      "Why do some people spend so much time watching TV and online programmes or shows?",
      "Do you agree or disagree that there are too many programmes/shows for people to choose from these days?",
      "What do you think of the view that parents should choose what programmes or shows their children watch?"
    ]},
  { topic: "Paying more than expected", title: "Describe a time when you had to pay more than you expected for something", bullets: [
      "What you bought", "How you felt when you saw the price", "What you did about it",
      "And explain why you think you had paid more than you expected"
    ], part3: [
      "What kinds of things do young people like to spend money on?",
      "Why do some people spend money on things they don't really need?",
      "How important is saving money for the future?",
      "How important is it to teach children about giving money to support people in need?"
    ]},
  { topic: "A city you enjoy visiting", title: "Describe a city that you have been to and enjoy visiting", bullets: [
      "Where the city is", "What you did there", "How many times you have been there",
      "And explain why you really enjoyed visiting this city"
    ], part3: [
      "Why do tourists choose to visit certain cities?",
      "Are modern cities more interesting for tourists than historical ones?",
      "Are cities that tourists like to visit also good places to live?",
      "Why do many people choose to live in cities?",
      "Does living in cities have more advantages for younger or older people?",
      "Do you agree or disagree that cities lose their individual character as they grow in size?"
    ]},
  { topic: "A clever solution to a problem", title: "Describe a time when someone you know found a clever solution to a problem", bullets: [
      "Who the person is", "What the problem was", "How he/she solved it",
      "And explain why you think this was a clever solution to the problem"
    ], part3: [
      "Do you think children are born clever, or do they learn to be clever?",
      "How important are schools in helping children become more clever?",
      "Do you agree or disagree that very clever children are usually happy?",
      "Why may a person be very good at one thing, but not another?",
      "Why does society need people with different types of intelligence?",
      "Do you think people can become very good at anything if they try hard enough?"
    ]},
  { topic: "Protecting the environment", title: "Describe a person you know who encourages people to protect the environment or nature", bullets: [
      "Who the person is", "How this person encourages people to protect the environment or nature", "How long this person has been doing this",
      "And explain how you feel about this person"
    ], part3: [
      "How can parents help children to learn about nature?",
      "Do you agree or disagree that children should spend more time learning about nature at school?",
      "Is it easy for children living in cities to enjoy the natural world?",
      "What things can people do to help to protect nature?",
      "Do you think there is a need for new laws to protect nature?",
      "Are punishments or rewards more effective in encouraging people to protect nature?"
    ]},
  { topic: "Encouraging someone to do something", title: "Describe a time when you encouraged somebody to do something that he/she didn't want to do", bullets: [
      "Who this person is", "What you encouraged him/her to do", "How he/she reacted",
      "And explain when you encouraged him/her to do this"
    ], part3: [
      "In what situations do parents need to encourage their children to do something?",
      "What ways can parents use to encourage children to do things they don't want to do?",
      "Why do children often not want to do what their parents ask?",
      "How can employees be encouraged to work hard?",
      "Do you agree or disagree that the most important role of a boss is to encourage employees?",
      "Are people at work more motivated by praise or money?"
    ]},
  { topic: "Food eaten at special occasions", title: "Describe a kind of food that you ate at special occasions", bullets: [
      "What it is", "What occasion it was", "Why you would like to eat it",
      "And explain how you feel about it"
    ], part3: [
      "Why is food important during special occasions in your country?",
      "What kinds of food do people usually eat during festivals or family celebrations?",
      "Do you think young people prefer traditional food or fast food? Why?",
      "How have people's eating habits changed compared to the past?",
      "Do you think eating together helps strengthen family relationships? Why?",
      "Is it better to cook at home or eat at restaurants on special occasions?",
      "What is special about the way this food is made?"
    ]},
  { topic: "A difficult decision with a good result", title: "Describe a difficult decision you made that had a good result", bullets: [
      "What the decision was", "Why it was difficult to make the decision", "What helped you to decide",
      "And explain why the decision you made had a good result"
    ], part3: [
      "Why do some people find it difficult to make important decisions?",
      "Do young people make decisions differently from older people?",
      "Who do people usually ask for advice when making important decisions?",
      "Do you think people should always think carefully before making decisions?",
      "Can difficult decisions help people grow as individuals? Why?",
      "Do you prefer making decisions alone or with other people's advice?"
    ]},
  { topic: "A person working in the medical field", title: "Describe a person who has chosen a career in the medical field (e.g. doctor, nurse, vet)", bullets: [
      "Who this person is", "What does this person do", "Why this person chose medical career",
      "And explain how you felt about this person"
    ], part3: [
      "Why do some people choose to work in the medical field?",
      "Do you think doctors and nurses are respected in society? Why?",
      "What qualities should a person have to work in healthcare?",
      "Is working in the medical field more stressful than other jobs? Why?",
      "Should medical workers receive higher salaries? Why or why not?",
      "Do you think young people today are interested in becoming doctors?",
      "Why do some people want to be doctors?",
      "Do you think it is difficult to become a doctor?",
      "Do you think studying biology at school makes students healthier?"
    ]},
  { topic: "A good place to live", title: "Describe a place you have visited that you think is a good place to live", bullets: [
      "Where it is", "What you know about this place", "What people can do there",
      "And explain why you would recommend this place as a good place to live"
    ], part3: [
      "What factors make a place suitable for living?",
      "Do young people and older people have different preferences about where to live?",
      "Is it better to live in the city or in the countryside? Why?",
      "How important is public transportation in a place to live?",
      "Do you think people move more often nowadays? Why?",
      "What can governments do to make cities better places to live?"
    ]},
  { topic: "A tall building you like or dislike", title: "Describe a tall building in your city you like or dislike", bullets: [
      "Where it is", "What it is used for", "What it looks like",
      "And explain why you like or dislike it"
    ], part3: [
      "Why do cities build more tall buildings nowadays?",
      "Do tall buildings make cities look more attractive?",
      "What are the advantages of living or working in tall buildings?",
      "Are there any disadvantages to having too many tall buildings?",
      "Do you think modern buildings are better than old buildings? Why?",
      "Should cities preserve old buildings instead of replacing them?",
      "Have you ever lived in a high-rise building?",
      "What impact do you think climate has on architectural design?",
      "Why do you think many Chinese people now live in high-rise buildings?",
      "In the future, will Chinese people prefer high-rise buildings or houses?",
      "Why do you think some people design their own homes?"
    ]},
  { topic: "A successful businessperson you know", title: "Describe a person you know about who runs a successful business", bullets: [
      "How you knew him/her", "What business does this person do", "How long has this person run his/her business",
      "And explain why you think his/her business is successful"
    ], part3: [
      "What qualities make someone a successful businessperson?",
      "Do you think starting a business is risky? Why?",
      "Why do some businesses succeed while others fail?",
      "Is it better to work for a company or run your own business?",
      "Do young people today prefer entrepreneurship? Why?",
      "How important is customer service in business success?",
      "Do you approve of the business model of small shops / small retail stores?"
    ]},
  { topic: "A person who enjoys growing plants", title: "Describe a person you know who enjoys growing plants", bullets: [
      "How you know this person", "What plants this person enjoys growing", "Where this person grows plants",
      "And explain why you think this person enjoys growing these plants"
    ], part3: [
      "Why do some people enjoy gardening?",
      "Do you think growing plants is popular among young people?",
      "What are the benefits of growing plants at home?",
      "Should schools teach children how to grow plants? Why?",
      "How can plants improve people's quality of life?",
      "Is gardening easier now than in the past? Why?",
      "Do you have a favourite type of plant to grow?",
      "What preparations do you need for planting?",
      "Do you think planting is easy or difficult?",
      "What do you gain after solving problems in planting?"
    ]},
  { topic: "A live sport match you watched", title: "Describe a live sport match you have ever watched", bullets: [
      "What it was", "When you watched it", "What it was like",
      "And explain how you felt about it"
    ], part3: [
      "Why do many people enjoy watching sports?",
      "Do you think watching live sports is better than watching on TV? Why?",
      "How can sports events benefit a city or a country?",
      "Why do some people become passionate sports fans?",
      "Do international sports events help bring people together?",
      "Should children be encouraged to play sports regularly? Why?",
      "What are the advantages of watching sports events online?",
      "What kinds of sports activities are suitable for children in China?"
    ]},
  { topic: "A piece of local news", title: "Describe a piece of local news that people are interested in", bullets: [
      "What it was about", "Where you saw/heard it", "Who was involved",
      "And explain why people were interested in it"
    ], part3: [
      "How do people usually get local news nowadays?",
      "Do you think local news is more important than international news? Why?",
      "Why are some news stories more popular than others?",
      "Do social media affect the way people receive news?",
      "Can news influence public opinion? How?",
      "Do you think all news is reliable nowadays? Why or why not?",
      "Do many people talk about local news?",
      "Do young people or old people care more about local news?",
      "Do people pay more attention to local news or national news?"
    ]},
  { topic: "A technology problem you encountered", title: "Describe a problem of technology you have encountered, like a computer or a cell phone", bullets: [
      "What it was", "When and where you had this problem", "How the problem was solved",
      "And explain how you felt when you had this problem"
    ], part3: [
      "What kinds of technological problems do people often face?",
      "Do older people have more difficulty using technology than young people?",
      "How has technology made people's lives easier?",
      "Do you think people depend too much on technology nowadays?",
      "What should people do when technology fails?",
      "Will technology become more reliable in the future?"
    ]},
  { topic: "Getting up very early", title: "Describe a time when you had to get up very early", bullets: [
      "Where you were", "What time you had to get up", "Why you had to get up so early",
      "And explain how you felt about getting up very early"
    ], part3: [
      "Why do some people prefer waking up early?",
      "Do young people and older people have different sleeping habits?",
      "Is it healthier to wake up early? Why?",
      "What jobs require people to wake up very early?",
      "How can people develop good sleeping habits?",
      "Do modern lifestyles affect people's sleep?"
    ]},
  { topic: "A home you like to visit but not live in", title: "Describe a home that you like to visit but did not want to live in", bullets: [
      "Where it is", "What it is like", "What you visited it for",
      "And explain why you would not like to live there"
    ], part3: [
      "What makes a home comfortable to live in?",
      "Do people's housing preferences change as they get older?",
      "Is it better to live in a house or an apartment? Why?",
      "What factors do people consider when choosing a home?",
      "Do modern homes differ from homes in the past?",
      "How important is location when choosing a home?"
    ]},
  { topic: "A long-held ambition", title: "Describe an ambition you have had for a long time", bullets: [
      "What it was", "How you got the desire to want to achieve it", "What you have to do to achieve it",
      "And explain how you feel about it"
    ], part3: [
      "Why is it important for people to have ambitions?",
      "Do young people have different ambitions from older people?",
      "Can ambition help people become successful? Why?",
      "What can stop people from achieving their ambitions?",
      "Should parents influence their children's ambitions?",
      "Is it easier to achieve ambitions nowadays?"
    ]},
  { topic: "A childhood friend you remember well", title: "Describe a friend from childhood who you remember very well", bullets: [
      "Who the friend is", "How you met him/her", "What you used to do together",
      "And explain why you remember this childhood friend so well"
    ], part3: [
      "Why are childhood friendships special?",
      "Is it easy to maintain friendships as people get older?",
      "Do children make friends more easily than adults?",
      "What qualities are important in friendship?",
      "Can online friendships replace real-life friendships?",
      "How do friendships influence people's development?"
    ]},
  { topic: "A time you changed your plan", title: "Describe a time that you had to change your plan / you changed your mind", bullets: [
      "When this happened", "What made you change the plan", "What the new plan was",
      "And how you felt about the change"
    ], part3: [
      "Why do people sometimes change their plans?",
      "Is it important to be flexible in life?",
      "Do young people change plans more often than older people?",
      "How do people feel when their plans suddenly change?",
      "Can changing plans sometimes lead to better results?",
      "How can people deal with unexpected changes?"
    ]},
  { topic: "An interesting video on social media", title: "Describe an interesting video you watched in social media", bullets: [
      "When and where you saw it", "What it was about", "Why you think it is interesting",
      "And explain how you felt about it"
    ], part3: [
      "Why do people spend so much time watching videos online?",
      "What types of videos are popular nowadays?",
      "Do social media videos influence people's opinions?",
      "Are online videos educational? Why or why not?",
      "Do you think social media has more advantages than disadvantages?",
      "Should children's use of social media be controlled?"
    ]},
  { topic: "A time you changed your opinion", title: "Describe a time you changed your opinion", bullets: [
      "When it was", "What was your opinion", "Why you changed your opinion",
      "And explain how you felt about it"
    ], part3: [
      "Why do people change their opinions?",
      "Is it easy for people to admit they were wrong?",
      "Do older people change their opinions less often than young people?",
      "Can other people influence our opinions? How?",
      "Is it important to listen to different viewpoints?",
      "Should people always stick to their own opinions?"
    ]},
  { topic: "A holiday place you would recommend", title: "Describe a place you went to on holiday that you would recommend", bullets: [
      "Where you went", "Why you went to this place", "What you did",
      "And explain why you would recommend this place for a holiday"
    ], part3: [
      "Why do people enjoy traveling?",
      "What makes a place attractive to tourists?",
      "Do people prefer traveling alone or with others? Why?",
      "How has tourism changed in recent years?",
      "What are the benefits of traveling?",
      "Can tourism have negative effects on local communities?",
      "Where do people prefer to travel to?",
      "Is it difficult for young people to choose a travel destination?",
      "How do people decide on their travel dates?"
    ]},
  { topic: "A place you found boring", title: "Describe a place you have been to and felt bored", bullets: [
      "Where it was", "When you went there", "What you did there",
      "And explain why you think it is boring"
    ], part3: [
      "Why do some people get bored easily?",
      "What kinds of places do young people enjoy visiting?",
      "Do people have different ideas of what is interesting?",
      "How can tourist attractions become more appealing?",
      "Is it important to try new experiences?",
      "Do people today have less patience than in the past?",
      "On what occasions do people feel bored?",
      "Why do students find their teachers' lessons boring?",
      "How to avoid feeling bored?",
      "Why do some people find playing on their phones boring?"
    ]},
  { topic: "A person who achieved something difficult", title: "Describe a person you know who successfully achieved something difficult", bullets: [
      "Who it is", "What he/she had achieved", "How difficult it was",
      "And explain how you felt about it"
    ], part3: [
      "Why do some people succeed while others give up?",
      "Is determination important for success?",
      "Should parents teach children not to give up easily?",
      "Can failure help people become successful?",
      "What motivates people to achieve difficult goals?",
      "Do successful people always work harder than others?"
    ]},
  { topic: "An environmental protection law", title: "Describe a law of environment protection that you would like to introduce", bullets: [
      "What it is", "How you first learned about it", "Who benefits from it",
      "And explain how you feel about this law"
    ], part3: [
      "Why is environmental protection important?",
      "What environmental problems are common in cities?",
      "Should governments or individuals take more responsibility?",
      "How can schools teach children about environmental protection?",
      "Do you think environmental laws are effective?",
      "Should companies be punished for pollution?"
    ]},
  { topic: "An important decision you had to make", title: "Describe a time when you had to make an important decision", bullets: [
      "What decision you had to make", "How you made the decision", "Why this decision was important",
      "And explain whether you think it was a right decision"
    ], part3: [
      "What kinds of decisions do young people usually make?",
      "Why do some people find decision-making difficult?",
      "Do men and women make decisions differently?",
      "Is it better to make decisions alone or ask for advice?",
      "Can technology help people make decisions?",
      "How can experience improve decision-making?"
    ]},
  { topic: "An animal story (movie or book)", title: "Describe a story you knew that involves an animal (like in a movie or a book)", bullets: [
      "What the movie or book is about", "When and where you watched it", "Are there any other animals in the movie or book",
      "And explain how you felt about this movie or book"
    ], part3: [
      "Why do children enjoy stories about animals?",
      "What can people learn from animal stories?",
      "Do films influence how people view animals?",
      "Why are animals often used in stories?",
      "Should children learn about animals at school?",
      "Do people care more about animal welfare nowadays?"
    ]},
  { topic: "A person who didn't reply to your messages", title: "Describe a person who has not replied to your messages for a long time", bullets: [
      "Who he/she is", "What message you sent him/her", "Did he/she finally reply you",
      "And explain how you felt about him/her"
    ], part3: [
      "Why do people sometimes ignore messages?",
      "Is online communication better than face-to-face communication?",
      "Do young people communicate differently from older people?",
      "How has technology changed communication?",
      "Is it rude not to reply to messages? Why?",
      "Can texting damage relationships?"
    ]},
  { topic: "An advertisement featuring a famous person", title: "Describe a piece of advertisement which is about a famous person", bullets: [
      "What the advertisement is about", "When and where you saw it", "What the famous person does in the advertisement",
      "And explain how you felt about it"
    ], part3: [
      "Why do companies use celebrities in advertisements?",
      "Do celebrity advertisements influence consumers?",
      "Are advertisements more creative nowadays?",
      "What makes an advertisement effective?",
      "Do children get influenced by advertisements easily?",
      "Should there be stricter control of advertising?"
    ]},
  { topic: "A person good at learning languages", title: "Describe a person who is good at learning languages", bullets: [
      "Who it is", "How you knew him/her", "What languages he/she has learnt",
      "And explain why you think he/she is good at learning languages"
    ], part3: [
      "Why are some people better at learning languages than others?",
      "Is it easier for children to learn languages?",
      "What is the best way to learn a foreign language?",
      "Why do people learn foreign languages?",
      "Can technology help language learning?",
      "Should schools teach more foreign languages?"
    ]},
  { topic: "An interesting building to visit", title: "Describe an interesting building that you would like to visit", bullets: [
      "Where this interesting building is", "How you know about this building", "What you already know about it",
      "And explain how you would feel if you visited this interesting building"
    ], part3: []},
  { topic: "A wild animal to learn more about", title: "Describe a wild animal you would like to learn more about", bullets: [
      "Which wild animal it is", "What you already know about it", "How you would like to learn more about it",
      "And explain why you would like to learn more about this wild animal"
    ], part3: []},
  { topic: "Trying an activity for the first time", title: "Describe an occasion when you felt excited about trying an activity for the first time", bullets: [
      "What activity you did", "Where and when you did this", "How easy or difficult it was to do",
      "And explain what was exciting about trying this activity for the first time"
    ], part3: []},
  { topic: "Waiting for something special to happen", title: "Describe a time when you had to wait for something special to happen", bullets: [
      "What this special thing was", "Why you had to wait for it", "What you did while you were waiting",
      "And explain how you felt about waiting for this special thing to happen"
    ], part3: []},
  { topic: "A power outage", title: "Describe an occasion when the electricity suddenly went off", bullets: [
      "When and where it happened", "What you were doing", "How long the electricity went off for",
      "And explain how you felt when the electricity suddenly went off"
    ], part3: []},
  { topic: "A far-away place to visit in future", title: "Describe a place which is far away that you would like to visit in the future", bullets: [
      "Where it is", "How you would travel there", "What you would do there",
      "And explain why you would really like to visit this place"
    ], part3: []},
  { topic: "A tradition in your country", title: "Describe a tradition in your country", bullets: [
      "What it is", "When it will happen", "What people need to do",
      "And explain how you feel about it"
    ], part3: []},
  { topic: "Repairing something broken at home", title: "Describe a time when something in your home broke and you tried to repair it", bullets: [
      "What thing broke", "Why this thing broke", "What you did to try to repair it",
      "And explain how successful you were at trying to repair this thing"
    ], part3: []},
  { topic: "A traditional product you like", title: "Describe a traditional product made in your country which you like", bullets: [
      "What this product is", "When you first tried this product", "How this product is made",
      "And explain why you like this traditional product"
    ], part3: []},
  { topic: "A time you changed a decision", title: "Describe a time when you changed a decision", bullets: [
      "What decision you made", "Why you changed the decision", "Is it a good result",
      "And explain how you felt about it"
    ], part3: []},
  { topic: "A special cake you received", title: "Describe a special cake you received from others", bullets: [
      "When it happened", "Where it happened", "Who you got the cake from",
      "And explain why it's a special cake"
    ], part3: [
      "What are the differences between special food in China and other countries?",
      "Is there any food in your country that is eaten at special times or on special occasions?",
      "Why are some people willing to spend a lot of money on meals on special days?",
      "Do you think it's good to communicate when eating with your family?",
      "In your country, do people nowadays cook at home as frequently as they did in the past?",
      "What do you think of people using their mobile phones during a meal?"
    ]}
];

function buildDocs() {
  const docs = [];

  for (const g of part1Groups) {
    for (const q of g.questions) {
      // Most Part 1 questions are plain strings — sampleAnswer stays empty
      // and gets lazily filled by Gemini (see generateSampleAnswers.js). A
      // few topics (e.g. "Shoes") ship hand-written model answers instead,
      // represented as { question, sampleAnswer } so they're pre-cached and
      // never hit the AI.
      if (typeof q === 'string') {
        docs.push({ topic: g.topic, part: 1, question: q, cueCard: '', isActive: true });
      } else {
        docs.push({ topic: g.topic, part: 1, question: q.question, cueCard: '', isActive: true, sampleAnswer: q.sampleAnswer || '' });
      }
    }
  }

  for (const s of part2Sets) {
    const cueCard = 'You should say:\n' + s.bullets.map(b => '- ' + b).join('\n');
    docs.push({ topic: s.topic, part: 2, question: s.title, cueCard, isActive: true });
    for (const q of s.part3) {
      docs.push({ topic: s.topic, part: 3, question: q, cueCard: '', isActive: true });
    }
  }

  return docs;
}

async function runSeed() {
  const SpeakingQuestion = require('../models/SpeakingQuestion');
  const docs = buildDocs();

  const ops = docs.map(d => ({
    replaceOne: { filter: { topic: d.topic, part: d.part, question: d.question }, replacement: d, upsert: true }
  }));

  const result = await SpeakingQuestion.bulkWrite(ops);
  console.log(`[SpeakingSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} questions (${docs.length} total)`);
}

// Allow direct execution: node backend/scripts/seedSpeakingQuestions.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log('[SpeakingSeed] Done');
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, part1Groups, part2Sets };
