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
  { topic: "Shopping", questions: [
    "Do you often go shopping?",
    "Do you prefer online or offline shopping?",
    "Do you compare prices before making a purchase?"
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
    ]}
];

function buildDocs() {
  const docs = [];

  for (const g of part1Groups) {
    for (const q of g.questions) {
      docs.push({ topic: g.topic, part: 1, question: q, cueCard: '', isActive: true });
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
