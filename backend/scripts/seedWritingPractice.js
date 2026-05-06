/**
 * Seed script – Writing Practice exercises
 * Run standalone: node backend/scripts/seedWritingPractice.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose   = require('mongoose');
const WPTopic    = require('../models/WPTopic');
const WPLesson   = require('../models/WPLesson');
const WPExercise = require('../models/WPExercise');

// ──────────────────────────────────────────────────────────────
//  TOPICS
// ──────────────────────────────────────────────────────────────
const TOPICS = [
  { key:'myself',      title:'Myself',      titleVi:'Bản thân',   category:'personal', levels:['beginner','elementary'], orderIndex:1 },
  { key:'family',      title:'Family',      titleVi:'Gia đình',   category:'personal', levels:['beginner','elementary'], orderIndex:2 },
  { key:'hobbies',     title:'Hobbies',     titleVi:'Sở thích',   category:'personal', levels:['beginner','elementary'], orderIndex:3 },
  { key:'school',      title:'School',      titleVi:'Trường học', category:'social',   levels:['beginner'],             orderIndex:4 },
  { key:'friends',     title:'Friends',     titleVi:'Bạn bè',     category:'social',   levels:['beginner'],             orderIndex:5 },
  { key:'food',        title:'Food',        titleVi:'Ẩm thực',    category:'social',   levels:['beginner'],             orderIndex:6 },
  { key:'technology',  title:'Technology',  titleVi:'Công nghệ',  category:'academic', levels:['elementary'],           orderIndex:7 },
  { key:'travel',      title:'Travel',      titleVi:'Du lịch',    category:'social',   levels:['elementary'],           orderIndex:8 },
  { key:'environment', title:'Environment', titleVi:'Môi trường', category:'academic', levels:['intermediate'],         orderIndex:9 },
  { key:'health',      title:'Health',      titleVi:'Sức khỏe',   category:'academic', levels:['intermediate'],         orderIndex:10 },
];

// ──────────────────────────────────────────────────────────────
//  LESSONS
// ──────────────────────────────────────────────────────────────
const LESSONS = [
  { topicKey:'myself',      level:'beginner',      title:'Simple Sentences – Myself',      grammarFocus:'Present Simple, be verb',     lessonType:'sentence', difficulty:1, orderIndex:1 },
  { topicKey:'family',      level:'beginner',      title:'Simple Sentences – Family',      grammarFocus:'Present Simple, possessives', lessonType:'sentence', difficulty:1, orderIndex:2 },
  { topicKey:'hobbies',     level:'beginner',      title:'Simple Sentences – Hobbies',     grammarFocus:'like + V-ing, frequency',     lessonType:'sentence', difficulty:1, orderIndex:3 },
  { topicKey:'school',      level:'beginner',      title:'Simple Sentences – School',      grammarFocus:'Present Simple, be + adj',    lessonType:'sentence', difficulty:1, orderIndex:4 },
  { topicKey:'friends',     level:'beginner',      title:'Simple Sentences – Friends',     grammarFocus:'Present Simple, adjectives',  lessonType:'sentence', difficulty:1, orderIndex:5 },
  { topicKey:'food',        level:'beginner',      title:'Simple Sentences – Food',        grammarFocus:'Present Simple, prepositions',lessonType:'sentence', difficulty:1, orderIndex:6 },
  { topicKey:'myself',      level:'elementary',    title:'Expanded Sentences – Myself',    grammarFocus:'Frequency adverbs, because',  lessonType:'sentence', difficulty:2, orderIndex:7 },
  { topicKey:'family',      level:'elementary',    title:'Expanded Sentences – Family',    grammarFocus:'Conjunctions, purpose',       lessonType:'sentence', difficulty:2, orderIndex:8 },
  { topicKey:'hobbies',     level:'elementary',    title:'Expanded Sentences – Hobbies',   grammarFocus:'because, so, expansion',      lessonType:'sentence', difficulty:2, orderIndex:9 },
  { topicKey:'technology',  level:'elementary',    title:'Sentences about Technology',     grammarFocus:'use + to V, purpose clause',  lessonType:'sentence', difficulty:2, orderIndex:10 },
  { topicKey:'travel',      level:'elementary',    title:'Sentences about Travel',         grammarFocus:'want to V, past simple',      lessonType:'sentence', difficulty:2, orderIndex:11 },
  { topicKey:'environment', level:'intermediate',  title:'Paragraphs – Environment',       grammarFocus:'Conditionals, not only…but also', lessonType:'paragraph', difficulty:3, orderIndex:12 },
  { topicKey:'health',      level:'intermediate',  title:'Paragraphs – Health',            grammarFocus:'although, should, cause-effect',  lessonType:'paragraph', difficulty:3, orderIndex:13 },
];

// ──────────────────────────────────────────────────────────────
//  EXERCISES  (with alternativeAnswers for local checking)
// ──────────────────────────────────────────────────────────────
const RAW_EXERCISES = [

  // ─── BEGINNER – MYSELF ────────────────────────────────────
  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'S + V + O (Present Simple)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi học tiếng Anh mỗi ngày.',
    hints:['study','English','every day'],
    sampleAnswer:'I study English every day.',
    alternativeAnswers:['I learn English every day.','I study English daily.','I learn English daily.'] },

  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + be + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi là học sinh chăm chỉ.',
    hints:['am','hardworking','student'],
    sampleAnswer:'I am a hardworking student.',
    alternativeAnswers:['I am a hard-working student.','I am a diligent student.'] },

  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + like + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích đọc sách.',
    hints:['like','reading','books'],
    sampleAnswer:'I like reading books.',
    alternativeAnswers:['I enjoy reading books.','I love reading books.','I like to read books.'] },

  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:4,
    grammarPoint:'S + V + O (Present Simple)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi sống ở Hà Nội.',
    hints:['live','in','Hanoi'],
    sampleAnswer:'I live in Hanoi.',
    alternativeAnswers:['I am living in Hanoi.'] },

  { topicKey:'myself', level:'beginner', type:'rearrange', orderIndex:5,
    grammarPoint:'S + have + O',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','have','many','hobbies'],
    sampleAnswer:'I have many hobbies.',
    alternativeAnswers:[] },

  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:6,
    grammarPoint:'S + be + adj + at + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi giỏi Toán.',
    hints:['good at','Math'],
    sampleAnswer:'I am good at Math.',
    alternativeAnswers:['I am good at Mathematics.','I am great at Math.'] },

  { topicKey:'myself', level:'beginner', type:'translation', orderIndex:7,
    grammarPoint:'S + V + O + every + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi tập thể dục mỗi buổi sáng.',
    hints:['exercise','every morning'],
    sampleAnswer:'I exercise every morning.',
    alternativeAnswers:['I work out every morning.','I do exercise every morning.'] },

  { topicKey:'myself', level:'beginner', type:'fill_blank', orderIndex:8,
    grammarPoint:'Possessive adjectives',
    instruction:'Điền vào chỗ trống:', question:'___ name is Minh. [My / I / Me]',
    options:['My','I','Me'], blankAnswer:'My',
    sampleAnswer:'My name is Minh.',
    alternativeAnswers:[] },

  // ─── BEGINNER – FAMILY ────────────────────────────────────
  { topicKey:'family', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'S + have + number + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Gia đình tôi có bốn người.',
    hints:['family','four','members'],
    sampleAnswer:'My family has four members.',
    alternativeAnswers:['There are four members in my family.','There are four people in my family.','My family has 4 members.','My family consists of four members.'] },

  { topicKey:'family', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + be + noun (job)',
    instruction:'Dịch sang tiếng Anh:', question:'Bố tôi là kỹ sư.',
    hints:['father','is','engineer'],
    sampleAnswer:'My father is an engineer.',
    alternativeAnswers:['My dad is an engineer.'] },

  { topicKey:'family', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + be + very + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Mẹ tôi rất chăm chỉ.',
    hints:['mother','very','hardworking'],
    sampleAnswer:'My mother is very hardworking.',
    alternativeAnswers:['My mom is very hardworking.','My mother is very hard-working.','My mother is very diligent.'] },

  { topicKey:'family', level:'beginner', type:'translation', orderIndex:4,
    grammarPoint:'S + have + article + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có một người anh trai.',
    hints:['have','an','older brother'],
    sampleAnswer:'I have an older brother.',
    alternativeAnswers:['I have one older brother.','I have an elder brother.'] },

  { topicKey:'family', level:'beginner', type:'rearrange', orderIndex:5,
    grammarPoint:'S + V + adverb',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['We','usually','have','dinner','together'],
    sampleAnswer:'We usually have dinner together.',
    alternativeAnswers:[] },

  { topicKey:'family', level:'beginner', type:'translation', orderIndex:6,
    grammarPoint:'S + be + very + adj + and + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Gia đình tôi rất ấm áp và hạnh phúc.',
    hints:['family','warm','happy'],
    sampleAnswer:'My family is very warm and happy.',
    alternativeAnswers:['My family is very warm and joyful.','My family is warm and happy.'] },

  { topicKey:'family', level:'beginner', type:'fill_blank', orderIndex:7,
    grammarPoint:'Present Simple – 3rd person',
    instruction:'Điền vào chỗ trống:', question:'My sister ___ to school every day. [goes / go / going]',
    options:['goes','go','going'], blankAnswer:'goes',
    sampleAnswer:'My sister goes to school every day.',
    alternativeAnswers:[] },

  // ─── BEGINNER – HOBBIES ───────────────────────────────────
  { topicKey:'hobbies', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'My favorite + noun + be + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Sở thích yêu thích của tôi là chơi bóng đá.',
    hints:['favorite hobby','playing','football'],
    sampleAnswer:'My favorite hobby is playing football.',
    alternativeAnswers:['My favourite hobby is playing football.','My favorite hobby is football.'] },

  { topicKey:'hobbies', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + V + O + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi chơi bóng đá vào cuối tuần.',
    hints:['play','football','weekends'],
    sampleAnswer:'I play football on weekends.',
    alternativeAnswers:['I play football at the weekend.','I play football every weekend.','I play soccer on weekends.'] },

  { topicKey:'hobbies', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + like + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích nghe nhạc.',
    hints:['like','listening','music'],
    sampleAnswer:'I like listening to music.',
    alternativeAnswers:['I enjoy listening to music.','I love listening to music.','I like to listen to music.'] },

  { topicKey:'hobbies', level:'beginner', type:'translation', orderIndex:4,
    grammarPoint:'V-ing + help + S + V',
    instruction:'Dịch sang tiếng Anh:', question:'Đọc sách giúp tôi thư giãn.',
    hints:['reading','helps','relax'],
    sampleAnswer:'Reading books helps me relax.',
    alternativeAnswers:['Reading books helps me to relax.','Reading helps me relax.'] },

  { topicKey:'hobbies', level:'beginner', type:'rearrange', orderIndex:5,
    grammarPoint:'S + like + V-ing',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','like','playing','games','every','evening'],
    sampleAnswer:'I like playing games every evening.',
    alternativeAnswers:[] },

  { topicKey:'hobbies', level:'beginner', type:'translation', orderIndex:6,
    grammarPoint:'S + enjoy + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích vẽ tranh vào cuối tuần.',
    hints:['enjoy','drawing','on weekends'],
    sampleAnswer:'I enjoy drawing on weekends.',
    alternativeAnswers:['I enjoy drawing at the weekend.','I like drawing on weekends.','I love drawing on weekends.'] },

  { topicKey:'hobbies', level:'beginner', type:'fill_blank', orderIndex:7,
    grammarPoint:'like + V-ing',
    instruction:'Điền vào chỗ trống:', question:'I like ___ to music. [listening / listen / listens]',
    options:['listening','listen','listens'], blankAnswer:'listening',
    sampleAnswer:'I like listening to music.',
    alternativeAnswers:[] },

  // ─── BEGINNER – SCHOOL ────────────────────────────────────
  { topicKey:'school', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'My favorite + noun + be + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Môn học yêu thích của tôi là Toán.',
    hints:['favorite subject','Math'],
    sampleAnswer:'My favorite subject is Math.',
    alternativeAnswers:['My favourite subject is Math.','My favorite subject is Mathematics.','My best subject is Math.'] },

  { topicKey:'school', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + be + very + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Giáo viên của tôi rất nhiệt tình.',
    hints:['teacher','enthusiastic'],
    sampleAnswer:'My teacher is very enthusiastic.',
    alternativeAnswers:['My teacher is very dedicated.','My teacher is enthusiastic.'] },

  { topicKey:'school', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + have + adj + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có nhiều bạn bè ở trường.',
    hints:['have','many','friends','school'],
    sampleAnswer:'I have many friends at school.',
    alternativeAnswers:['I have a lot of friends at school.','I have many friends in school.'] },

  { topicKey:'school', level:'beginner', type:'fill_blank', orderIndex:4,
    grammarPoint:'Present Simple – 3rd person',
    instruction:'Điền vào chỗ trống:', question:'My teacher ___ very enthusiastic. [is / are / am]',
    options:['is','are','am'], blankAnswer:'is',
    sampleAnswer:'My teacher is very enthusiastic.',
    alternativeAnswers:[] },

  { topicKey:'school', level:'beginner', type:'rearrange', orderIndex:5,
    grammarPoint:'S + have + adj + noun',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['My','school','has','a','large','library'],
    sampleAnswer:'My school has a large library.',
    alternativeAnswers:[] },

  { topicKey:'school', level:'beginner', type:'translation', orderIndex:6,
    grammarPoint:'S + V + O + at school',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi học rất chăm chỉ ở trường.',
    hints:['study','very hard','at school'],
    sampleAnswer:'I study very hard at school.',
    alternativeAnswers:['I work very hard at school.','I study hard at school.'] },

  // ─── BEGINNER – FRIENDS ───────────────────────────────────
  { topicKey:'friends', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'S + have + noun + named + name',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có một người bạn thân tên là Minh.',
    hints:['close friend','named','Minh'],
    sampleAnswer:'I have a close friend named Minh.',
    alternativeAnswers:['I have a best friend named Minh.','I have a close friend called Minh.','My close friend is named Minh.'] },

  { topicKey:'friends', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + V + together + time',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng tôi đi học cùng nhau mỗi ngày.',
    hints:['go to school','together','every day'],
    sampleAnswer:'We go to school together every day.',
    alternativeAnswers:['We go to school together daily.'] },

  { topicKey:'friends', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + be + very + adj + and + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Bạn tôi rất vui tính và thân thiện.',
    hints:['friend','funny','friendly'],
    sampleAnswer:'My friend is very funny and friendly.',
    alternativeAnswers:['My friend is very fun and friendly.','My friend is funny and friendly.'] },

  { topicKey:'friends', level:'beginner', type:'translation', orderIndex:4,
    grammarPoint:'S + V + O + when',
    instruction:'Dịch sang tiếng Anh:', question:'Bạn bè giúp tôi khi tôi gặp khó khăn.',
    hints:['friends','help','difficulties'],
    sampleAnswer:'Friends help me when I have difficulties.',
    alternativeAnswers:['Friends help me when I face difficulties.','Friends help me when I am in trouble.','My friends help me when I have difficulties.'] },

  { topicKey:'friends', level:'beginner', type:'fill_blank', orderIndex:5,
    grammarPoint:'S + be + adj + to + V',
    instruction:'Điền vào chỗ trống:', question:'I am very lucky ___ have many good friends. [to / for / of]',
    options:['to','for','of'], blankAnswer:'to',
    sampleAnswer:'I am very lucky to have many good friends.',
    alternativeAnswers:[] },

  { topicKey:'friends', level:'beginner', type:'rearrange', orderIndex:6,
    grammarPoint:'S + always + V + O',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['We','always','help','each','other'],
    sampleAnswer:'We always help each other.',
    alternativeAnswers:[] },

  // ─── BEGINNER – FOOD ──────────────────────────────────────
  { topicKey:'food', level:'beginner', type:'translation', orderIndex:1,
    grammarPoint:'My favorite + noun + be + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Món ăn yêu thích của tôi là phở.',
    hints:['favorite food','pho'],
    sampleAnswer:'My favorite food is pho.',
    alternativeAnswers:['My favourite food is pho.','My favorite dish is pho.'] },

  { topicKey:'food', level:'beginner', type:'translation', orderIndex:2,
    grammarPoint:'S + V + O + before + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi ăn sáng trước khi đi học.',
    hints:['have breakfast','before','going to school'],
    sampleAnswer:'I have breakfast before going to school.',
    alternativeAnswers:['I eat breakfast before going to school.','I have breakfast before I go to school.'] },

  { topicKey:'food', level:'beginner', type:'translation', orderIndex:3,
    grammarPoint:'S + be + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Phở rất ngon và bổ dưỡng.',
    hints:['pho','delicious','nutritious'],
    sampleAnswer:'Pho is very delicious and nutritious.',
    alternativeAnswers:['Pho is delicious and nutritious.','Pho is very tasty and nutritious.'] },

  { topicKey:'food', level:'beginner', type:'fill_blank', orderIndex:4,
    grammarPoint:'Preposition of place',
    instruction:'Điền vào chỗ trống:', question:'I usually have lunch ___ school. [at / in / on]',
    options:['at','in','on'], blankAnswer:'at',
    sampleAnswer:'I usually have lunch at school.',
    alternativeAnswers:[] },

  { topicKey:'food', level:'beginner', type:'rearrange', orderIndex:5,
    grammarPoint:'S + like + V-ing + for + meal',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','like','eating','pho','for','breakfast'],
    sampleAnswer:'I like eating pho for breakfast.',
    alternativeAnswers:[] },

  { topicKey:'food', level:'beginner', type:'translation', orderIndex:6,
    grammarPoint:'S + V + O + with + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích ăn cơm với gia đình.',
    hints:['like eating','rice','with my family'],
    sampleAnswer:'I like eating rice with my family.',
    alternativeAnswers:['I enjoy eating rice with my family.','I love eating rice with my family.'] },

  // ─── ELEMENTARY – MYSELF ──────────────────────────────────
  { topicKey:'myself', level:'elementary', type:'translation', orderIndex:1,
    grammarPoint:'Frequency adverb (usually)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thường học tiếng Anh vào buổi tối.',
    hints:['usually','study','in the evening'],
    sampleAnswer:'I usually study English in the evening.',
    alternativeAnswers:['I usually learn English in the evening.','I often study English in the evening.'] },

  { topicKey:'myself', level:'elementary', type:'translation', orderIndex:2,
    grammarPoint:'S + V + O + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích đọc sách vì nó giúp tôi học từ mới.',
    hints:['because','helps','learn new words'],
    sampleAnswer:'I like reading books because it helps me learn new words.',
    alternativeAnswers:['I enjoy reading books because it helps me learn new words.','I like reading because it helps me learn new words.'] },

  { topicKey:'myself', level:'elementary', type:'expand', orderIndex:3,
    grammarPoint:'Add frequency adverb + reason',
    instruction:'Mở rộng câu sau (thêm trạng từ + lý do):', question:'I study English.',
    baseText:'I study English.',
    hints:['usually / every day','in the evening','to improve / because'],
    sampleAnswer:'I usually study English every day because I want to improve my skills.',
    alternativeAnswers:[] },

  { topicKey:'myself', level:'elementary', type:'fill_blank', orderIndex:4,
    grammarPoint:'Frequency adverbs',
    instruction:'Điền vào chỗ trống:', question:'I ___ go to bed before 11 pm. [usually / rarely / never]',
    options:['usually','rarely','never'], blankAnswer:'usually',
    sampleAnswer:'I usually go to bed before 11 pm.',
    alternativeAnswers:[] },

  { topicKey:'myself', level:'elementary', type:'translation', orderIndex:5,
    grammarPoint:'S + want to + V + in the future',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi muốn trở thành kỹ sư trong tương lai.',
    hints:['want to','become','engineer','in the future'],
    sampleAnswer:'I want to become an engineer in the future.',
    alternativeAnswers:['I want to be an engineer in the future.','I would like to become an engineer in the future.'] },

  { topicKey:'myself', level:'elementary', type:'combine', orderIndex:6,
    grammarPoint:'Conjunction: because',
    instruction:'Nối hai câu dùng "because":', question:'I study hard. I want a good job.',
    sentences:['I study hard.','I want a good job.'],
    connector:'because',
    sampleAnswer:'I study hard because I want a good job.',
    alternativeAnswers:['I study hard because I want to get a good job.'] },

  // ─── ELEMENTARY – FAMILY ──────────────────────────────────
  { topicKey:'family', level:'elementary', type:'translation', orderIndex:1,
    grammarPoint:'S + V + adv + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Bố tôi làm việc chăm chỉ để chăm sóc gia đình.',
    hints:['works hard','to take care of','family'],
    sampleAnswer:'My father works hard to take care of the family.',
    alternativeAnswers:['My dad works hard to take care of the family.','My father works hard to support the family.'] },

  { topicKey:'family', level:'elementary', type:'translation', orderIndex:2,
    grammarPoint:'S + love + O + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi yêu gia đình tôi vì họ luôn ủng hộ tôi.',
    hints:['love','because','always support'],
    sampleAnswer:'I love my family because they always support me.',
    alternativeAnswers:['I love my family because they always encourage me.','I love my family because they support me always.'] },

  { topicKey:'family', level:'elementary', type:'combine', orderIndex:3,
    grammarPoint:'Conjunction: and',
    instruction:'Nối hai câu dùng "and":', question:'My mother is hardworking. She takes good care of us.',
    sentences:['My mother is hardworking.','She takes good care of us.'],
    connector:'and',
    sampleAnswer:'My mother is hardworking and she takes good care of us.',
    alternativeAnswers:['My mother is hardworking and takes good care of us.'] },

  { topicKey:'family', level:'elementary', type:'expand', orderIndex:4,
    grammarPoint:'Add adjective + reason',
    instruction:'Mở rộng câu sau:', question:'My family is happy.',
    baseText:'My family is happy.',
    hints:['always','because','together / support each other'],
    sampleAnswer:'My family is always happy because we support each other and spend time together.',
    alternativeAnswers:[] },

  { topicKey:'family', level:'elementary', type:'translation', orderIndex:5,
    grammarPoint:'S + spend + time + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng tôi thường dành thời gian cùng nhau vào cuối tuần.',
    hints:['usually','spend time','together','on weekends'],
    sampleAnswer:'We usually spend time together on weekends.',
    alternativeAnswers:['We often spend time together on weekends.','We usually spend time together at the weekend.'] },

  { topicKey:'family', level:'elementary', type:'translation', orderIndex:6,
    grammarPoint:'S + V + O + so that + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Mẹ tôi nấu ăn mỗi tối để chúng tôi ăn cùng nhau.',
    hints:['cooks every evening','so that','eat together'],
    sampleAnswer:'My mother cooks every evening so that we can eat together.',
    alternativeAnswers:['My mom cooks every evening so that we can eat together.','My mother cooks every night so that we can eat together.'] },

  // ─── ELEMENTARY – HOBBIES ─────────────────────────────────
  { topicKey:'hobbies', level:'elementary', type:'translation', orderIndex:1,
    grammarPoint:'Frequency adverb + S + V + with + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thường chơi bóng đá với bạn bè sau giờ học.',
    hints:['usually','after school','with my friends'],
    sampleAnswer:'I usually play football with my friends after school.',
    alternativeAnswers:['I often play football with my friends after school.','I usually play soccer with my friends after school.'] },

  { topicKey:'hobbies', level:'elementary', type:'translation', orderIndex:2,
    grammarPoint:'S + V + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích nghe nhạc vì nó giúp tôi giảm stress.',
    hints:['because','helps','reduce stress'],
    sampleAnswer:'I like listening to music because it helps me reduce stress.',
    alternativeAnswers:['I enjoy listening to music because it helps me reduce stress.','I like listening to music because it relieves my stress.'] },

  { topicKey:'hobbies', level:'elementary', type:'expand', orderIndex:3,
    grammarPoint:'Add adjective + because clause',
    instruction:'Mở rộng câu sau:', question:'I like reading.',
    baseText:'I like reading.',
    hints:['interesting books','because','relax / learn new things'],
    sampleAnswer:'I like reading interesting books because they help me relax and learn new things.',
    alternativeAnswers:[] },

  { topicKey:'hobbies', level:'elementary', type:'combine', orderIndex:4,
    grammarPoint:'Conjunction: so',
    instruction:'Nối hai câu dùng "so":', question:'I was tired. I went to bed early.',
    sentences:['I was tired.','I went to bed early.'],
    connector:'so',
    sampleAnswer:'I was tired, so I went to bed early.',
    alternativeAnswers:['I was tired so I went to bed early.'] },

  { topicKey:'hobbies', level:'elementary', type:'translation', orderIndex:5,
    grammarPoint:'S + be + passionate about + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi đam mê chơi đàn guitar.',
    hints:['passionate about','playing','guitar'],
    sampleAnswer:'I am passionate about playing the guitar.',
    alternativeAnswers:['I am passionate about playing guitar.','I am very passionate about playing the guitar.'] },

  { topicKey:'hobbies', level:'elementary', type:'expand', orderIndex:6,
    grammarPoint:'Add time + reason',
    instruction:'Mở rộng câu sau:', question:'I play sport.',
    baseText:'I play sport.',
    hints:['every day / after school','because','healthy / relax'],
    sampleAnswer:'I play sport every day after school because it keeps me healthy and helps me relax.',
    alternativeAnswers:[] },

  // ─── ELEMENTARY – TECHNOLOGY ──────────────────────────────
  { topicKey:'technology', level:'elementary', type:'translation', orderIndex:1,
    grammarPoint:'S + use + O + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi sử dụng điện thoại để học tiếng Anh.',
    hints:['use','phone','to study'],
    sampleAnswer:'I use my phone to study English.',
    alternativeAnswers:['I use my smartphone to study English.','I use my phone to learn English.'] },

  { topicKey:'technology', level:'elementary', type:'translation', orderIndex:2,
    grammarPoint:'S + help + O + V',
    instruction:'Dịch sang tiếng Anh:', question:'Internet giúp chúng ta học bất cứ điều gì.',
    hints:['internet','helps','learn anything'],
    sampleAnswer:'The internet helps us learn anything.',
    alternativeAnswers:['The internet helps us to learn anything.','The Internet helps us learn anything.'] },

  { topicKey:'technology', level:'elementary', type:'translation', orderIndex:3,
    grammarPoint:'S + spend + time + on + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi dành nhiều thời gian trên mạng xã hội.',
    hints:['spend','a lot of time','social media'],
    sampleAnswer:'I spend a lot of time on social media.',
    alternativeAnswers:['I spend too much time on social media.'] },

  { topicKey:'technology', level:'elementary', type:'expand', orderIndex:4,
    grammarPoint:'Add purpose clause',
    instruction:'Mở rộng câu sau:', question:'I use a smartphone.',
    baseText:'I use a smartphone.',
    hints:['to stay connected / communicate','with friends','study online'],
    sampleAnswer:'I use a smartphone to stay connected with friends and study online.',
    alternativeAnswers:[] },

  { topicKey:'technology', level:'elementary', type:'combine', orderIndex:5,
    grammarPoint:'Conjunction: but',
    instruction:'Nối hai câu dùng "but":', question:'The internet is useful. It can be addictive.',
    sentences:['The internet is useful.','It can be addictive.'],
    connector:'but',
    sampleAnswer:'The internet is useful, but it can be addictive.',
    alternativeAnswers:['The internet is useful but it can be addictive.'] },

  { topicKey:'technology', level:'elementary', type:'translation', orderIndex:6,
    grammarPoint:'S + can + V + easily',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng ta có thể dễ dàng tìm kiếm thông tin trên mạng.',
    hints:['can search','information','easily','on the internet'],
    sampleAnswer:'We can easily search for information on the internet.',
    alternativeAnswers:['We can easily find information on the internet.','We can search for information easily on the internet.'] },

  // ─── ELEMENTARY – TRAVEL ──────────────────────────────────
  { topicKey:'travel', level:'elementary', type:'translation', orderIndex:1,
    grammarPoint:'S + want to + V + someday',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi muốn đến thăm Nhật Bản một ngày nào đó.',
    hints:['want to','visit','Japan','someday'],
    sampleAnswer:'I want to visit Japan someday.',
    alternativeAnswers:['I want to visit Japan one day.','I would like to visit Japan someday.','I want to go to Japan someday.'] },

  { topicKey:'travel', level:'elementary', type:'translation', orderIndex:2,
    grammarPoint:'S + V + O + with + noun + last + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi đã đi du lịch Đà Nẵng với gia đình vào mùa hè năm ngoái.',
    hints:['travelled','Da Nang','with my family','last summer'],
    sampleAnswer:'I travelled to Da Nang with my family last summer.',
    alternativeAnswers:['I traveled to Da Nang with my family last summer.','I visited Da Nang with my family last summer.'] },

  { topicKey:'travel', level:'elementary', type:'expand', orderIndex:3,
    grammarPoint:'Add adjective + reason',
    instruction:'Mở rộng câu sau:', question:'I like travelling.',
    baseText:'I like travelling.',
    hints:['because','explore new places','experience different cultures'],
    sampleAnswer:'I like travelling because I can explore new places and experience different cultures.',
    alternativeAnswers:[] },

  { topicKey:'travel', level:'elementary', type:'fill_blank', orderIndex:4,
    grammarPoint:'Preposition of time (in/on/at)',
    instruction:'Điền vào chỗ trống:', question:'We went to the beach ___ the summer. [in / on / at]',
    options:['in','on','at'], blankAnswer:'in',
    sampleAnswer:'We went to the beach in the summer.',
    alternativeAnswers:[] },

  { topicKey:'travel', level:'elementary', type:'translation', orderIndex:5,
    grammarPoint:'S + be + one of the + superlative + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Hội An là một trong những thành phố đẹp nhất Việt Nam.',
    hints:['Hoi An','one of the most beautiful','cities','Vietnam'],
    sampleAnswer:'Hoi An is one of the most beautiful cities in Vietnam.',
    alternativeAnswers:['Hoi An is one of the most beautiful cities in Viet Nam.'] },

  { topicKey:'travel', level:'elementary', type:'combine', orderIndex:6,
    grammarPoint:'Conjunction: although',
    instruction:'Nối hai câu dùng "although":', question:'The trip was tiring. It was very enjoyable.',
    sentences:['The trip was tiring.','It was very enjoyable.'],
    connector:'although',
    sampleAnswer:'Although the trip was tiring, it was very enjoyable.',
    alternativeAnswers:['The trip was tiring although it was very enjoyable.'] },

  // ─── INTERMEDIATE – ENVIRONMENT ───────────────────────────
  { topicKey:'environment', level:'intermediate', type:'translation', orderIndex:1,
    grammarPoint:'S + be + adj + noun (formal)',
    instruction:'Dịch sang tiếng Anh:', question:'Ô nhiễm môi trường là một vấn đề nghiêm trọng trên toàn thế giới.',
    hints:['environmental pollution','serious problem','worldwide'],
    sampleAnswer:'Environmental pollution is a serious problem worldwide.',
    alternativeAnswers:['Environmental pollution is a serious global problem.','Pollution is a serious problem worldwide.'] },

  { topicKey:'environment', level:'intermediate', type:'translation', orderIndex:2,
    grammarPoint:'S + need to + V + to + V (purpose)',
    instruction:'Dịch sang tiếng Anh:', question:'Mỗi người cần hành động để bảo vệ môi trường.',
    hints:['everyone','take action','protect','environment'],
    sampleAnswer:'Everyone needs to take action to protect the environment.',
    alternativeAnswers:['Everyone needs to act to protect the environment.','Each person needs to take action to protect the environment.'] },

  { topicKey:'environment', level:'intermediate', type:'combine', orderIndex:3,
    grammarPoint:'not only...but also',
    instruction:'Nối hai câu dùng "not only...but also":', question:'Pollution damages our health. It harms the ecosystem.',
    sentences:['Pollution damages our health.','It harms the ecosystem.'],
    connector:'not only...but also',
    sampleAnswer:'Pollution not only damages our health but also harms the ecosystem.',
    alternativeAnswers:['Pollution not only damages our health but also destroys the ecosystem.'] },

  { topicKey:'environment', level:'intermediate', type:'translation', orderIndex:4,
    grammarPoint:'If clause (conditional)',
    instruction:'Dịch sang tiếng Anh:', question:'Nếu chúng ta không hành động ngay bây giờ, hậu quả sẽ rất nghiêm trọng.',
    hints:['if we do not act','now','the consequences','very serious'],
    sampleAnswer:'If we do not act now, the consequences will be very serious.',
    alternativeAnswers:['If we do not act now, the results will be very serious.','If we don\'t act now, the consequences will be very serious.'] },

  { topicKey:'environment', level:'intermediate', type:'expand', orderIndex:5,
    grammarPoint:'Develop with examples + result',
    instruction:'Mở rộng thành đoạn văn ngắn (2-3 câu):', question:'Recycling is important.',
    baseText:'Recycling is important.',
    hints:['For example','reduce waste','As a result','protect the environment'],
    sampleAnswer:'Recycling is important because it helps reduce waste. For example, recycling paper saves trees and water. As a result, we can protect the environment for future generations.',
    alternativeAnswers:[] },

  { topicKey:'environment', level:'intermediate', type:'translation', orderIndex:6,
    grammarPoint:'S + should + V + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Mọi người nên sử dụng túi tái chế để giảm rác thải nhựa.',
    hints:['everyone','should use','reusable bags','reduce plastic waste'],
    sampleAnswer:'Everyone should use reusable bags to reduce plastic waste.',
    alternativeAnswers:['People should use reusable bags to reduce plastic waste.','Everyone should use eco bags to reduce plastic waste.'] },

  // ─── INTERMEDIATE – HEALTH ────────────────────────────────
  { topicKey:'health', level:'intermediate', type:'translation', orderIndex:1,
    grammarPoint:'V-ing + help + O + V (purpose)',
    instruction:'Dịch sang tiếng Anh:', question:'Tập thể dục thường xuyên giúp chúng ta duy trì sức khỏe tốt.',
    hints:['exercising regularly','helps','maintain good health'],
    sampleAnswer:'Exercising regularly helps us maintain good health.',
    alternativeAnswers:['Regular exercise helps us maintain good health.','Exercising regularly helps us to maintain good health.'] },

  { topicKey:'health', level:'intermediate', type:'translation', orderIndex:2,
    grammarPoint:'S + should + V + instead of + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng ta nên ăn nhiều rau thay vì đồ ăn nhanh.',
    hints:['should eat','more vegetables','instead of','fast food'],
    sampleAnswer:'We should eat more vegetables instead of fast food.',
    alternativeAnswers:['We should eat more vegetables rather than fast food.'] },

  { topicKey:'health', level:'intermediate', type:'combine', orderIndex:3,
    grammarPoint:'Conjunction: although',
    instruction:'Nối hai câu dùng "although":', question:'Exercise takes time. It is essential for good health.',
    sentences:['Exercise takes time.','It is essential for good health.'],
    connector:'although',
    sampleAnswer:'Although exercise takes time, it is essential for good health.',
    alternativeAnswers:['Exercise takes time, although it is essential for good health.'] },

  { topicKey:'health', level:'intermediate', type:'translation', orderIndex:4,
    grammarPoint:'S + be + crucial + for + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Ngủ đủ giấc rất quan trọng đối với sức khỏe tinh thần.',
    hints:['getting enough sleep','crucial','mental health'],
    sampleAnswer:'Getting enough sleep is crucial for mental health.',
    alternativeAnswers:['Getting enough sleep is important for mental health.','Sleeping enough is crucial for mental health.'] },

  { topicKey:'health', level:'intermediate', type:'expand', orderIndex:5,
    grammarPoint:'Develop with cause + effect',
    instruction:'Mở rộng thành đoạn văn ngắn (2-3 câu):', question:'A healthy lifestyle is important.',
    baseText:'A healthy lifestyle is important.',
    hints:['For instance','eating well','exercising','As a result','feel more energetic'],
    sampleAnswer:'A healthy lifestyle is important for both the body and mind. For instance, eating well and exercising regularly can prevent many diseases. As a result, people feel more energetic and live longer.',
    alternativeAnswers:[] },

  { topicKey:'health', level:'intermediate', type:'translation', orderIndex:6,
    grammarPoint:'S + need to + V + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Học sinh cần ngủ đủ giấc để học tốt hơn.',
    hints:['students','need to sleep','enough','to study better'],
    sampleAnswer:'Students need to sleep enough to study better.',
    alternativeAnswers:['Students need to get enough sleep to study better.','Students need to sleep well to study better.'] },
];

// ──────────────────────────────────────────────────────────────
//  CORE SEED
// ──────────────────────────────────────────────────────────────
async function runSeed() {
  for (const t of TOPICS) {
    await WPTopic.findOneAndUpdate({ key: t.key }, t, { upsert: true, new: true });
  }
  console.log(`[Seed] ✓ ${TOPICS.length} topics`);

  const lessonMap = {};
  for (const l of LESSONS) {
    const doc = await WPLesson.findOneAndUpdate(
      { topicKey: l.topicKey, level: l.level }, l, { upsert: true, new: true });
    lessonMap[`${l.topicKey}:${l.level}`] = doc._id;
  }
  console.log(`[Seed] ✓ ${LESSONS.length} lessons`);

  let count = 0;
  for (const ex of RAW_EXERCISES) {
    const lessonId = lessonMap[`${ex.topicKey}:${ex.level}`];
    await WPExercise.findOneAndUpdate(
      { topicKey: ex.topicKey, level: ex.level, question: ex.question },
      { ...ex, lessonId },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`[Seed] ✓ ${count} exercises`);
}

module.exports = { runSeed };

// Run standalone: node backend/scripts/seedWritingPractice.js
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('Seed complete!'); mongoose.disconnect(); })
    .catch(err => { console.error('Seed failed:', err); process.exit(1); });
}
